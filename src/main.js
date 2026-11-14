// 福星龍浮空島：介面總控
import './styles.css';
import * as THREE from 'three';
import { World } from './world/world.js';
import { music } from './ui/sound.js';
import { initUpdate } from './ui/update.js';
import { sheet } from './ui/sheet.js';
import { ISLANDS, SCHOOL, HIPPOS } from './data/site.js';
import { QUIZ } from './data/issues/18/quiz.js';
import { drawCert, validNick } from './ui/fs-cert.js';
import { ISSUE, PHOTOS, piece } from './data/issues/18/index.js';
import { ruby } from './data/zhuyin.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const byId = Object.fromEntries(ISLANDS.map((d) => [d.id, d]));
const bySlug = Object.fromEntries(ISLANDS.map((d) => [d.slug, d]));
const order = ISLANDS.map((d) => d.id);
const isMobile = () => window.innerWidth <= 860;
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 無痕模式略過 */ } },
};

const S = {
  island: null, listing: false, timeIdx: 0, paused: false, zhuyin: store.get('fs-zhuyin', false),
  // 闖關進度只存在這台裝置的瀏覽器：讀過的卡片、拿到的印章、找到的福星龍、證書暱稱
  read: store.get('fs-read', {}), stamps: new Set(store.get('fs-stamps', [])), dragons: new Set(store.get('fs-dragons', [])), nick: store.get('fs-nick', ''),
  tried: {},
};
const TOTAL = ISLANDS.length;
// 注音開關：只影響島名與白話小標
const zy = (t) => (S.zhuyin ? ruby(t) : esc(t));
let world = null;

// 天氣與時間：手動切換，不接即時資料；不放颱風（不做颱風避險劇情）
const TIMES = [
  { k: 'day', label: '白天', time: 'day', w: { cloud: 0.15, rain: 0, storm: false } },
  { k: 'cloudy', label: '陰天', time: 'day', w: { cloud: 0.85, rain: 0, storm: false } },
  { k: 'rain', label: '雨天', time: 'day', w: { cloud: 0.95, rain: 0.8, storm: false } },
  { k: 'dusk', label: '黃昏', time: 'dusk', w: { cloud: 0.35, rain: 0, storm: false } },
  { k: 'night', label: '夜晚', time: 'night', w: { cloud: 0.2, rain: 0, storm: false } },
];

// ───────── 版面骨架 ─────────
$('#app').innerHTML = `
<header class="topbar">
  <button class="brand card" data-act="home" aria-label="回到浮空島全景">
    <img src="./mascot/logo-fushing.png" alt="福星龍" width="50" height="50">
    <span><h1>福星龍浮空島</h1><p>《文藝復興》第 ${ISSUE.no} 期｜九座島，九段復興故事</p></span>
  </button>
</header>

<section class="panel" id="panel" aria-label="島嶼內容" aria-hidden="true">
  <div class="panel-head">
    <button class="handle" data-act="tall" aria-label="展開或收合內容" aria-expanded="true"></button>
    <div class="ph-row"><button class="round" data-act="prev" aria-label="上一座島">‹</button><span class="kicker" id="pKicker"></span><strong class="peek-name" id="pPeek"></strong><button class="round" data-act="next" aria-label="下一座島">›</button><button class="round" data-act="close" aria-label="關閉">×</button></div>
    <h2 id="pTitle"></h2><p class="plain" id="pPlain"></p><p class="motto" id="pMotto"></p>
  </div>
  <div class="panel-body" id="pBody"></div>
  <div class="panel-foot"><button data-act="prev" id="footPrev"></button><button data-act="next" id="footNext"></button></div>
</section>

<button class="hintcard card" id="hint" data-act="hint">
  <img src="./mascot/logo-fushing.png" alt="" width="44" height="44"><span><strong>點一座島，開始探索！</strong><span>拖曳旋轉、雙指縮放，找找福星龍</span></span>
</button>

<nav class="dock" aria-label="工具列">
  <button class="cta koi fs-pass" data-act="passport" id="passBtn">福星龍護照 <b id="passCount">0/9</b></button>
  <div class="seg" role="group" aria-label="檢視模式">
    <button class="on" data-view="home">全景</button><button data-view="top">鳥瞰</button><button data-view="list">清單</button>
  </div>
  <div class="seg" role="group" aria-label="場景工具">
    <button class="on" data-act="labels">島名</button>
    <button data-act="arcs">島與島的關聯</button>
    <button data-act="pause" id="pauseBtn">暫停</button>
    <button data-act="music" id="musicBtn" aria-pressed="false">音樂</button>
    <button data-act="sfx" id="sfxBtn" aria-pressed="false">音效</button>
    <button data-act="time" id="timeBtn" title="換天氣、換時間">天氣・白天</button>
    <button data-act="zhuyin" id="zhuyinBtn" aria-pressed="false" title="島名與小標加上注音">注音</button>
    <button class="on desk-only" data-act="tilt" id="tiltBtn" aria-pressed="true" title="模型感：畫面上下變模糊">模型感</button>
  </div>
</nav>

<section class="listview" id="listview" aria-label="文字清單">
  <div class="wrap">
    <div class="list-head"><h2>全部島嶼</h2></div>
    <div id="listBody"></div>
  </div>
  <footer class="site-footer"><div class="wrap"><div class="footer-bottom">
    <p>${esc(SCHOOL.name)}｜《文藝復興》第 ${ISSUE.no} 期｜${esc(ISSUE.date)}</p>
    <p>${esc(SCHOOL.address)}</p>
  </div></div></footer>
</section>

<div class="toast" id="toast" role="status"></div>
<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle"><div class="dialog" id="dialog"></div></div>
<div class="fs-lb" id="lb" role="dialog" aria-modal="true" aria-label="照片"><figure><img id="lbImg" alt=""><figcaption id="lbCap"></figcaption></figure>
  <button class="round x" data-act="lbClose" aria-label="關閉">×</button><button class="round p" data-act="lbPrev" aria-label="上一張">‹</button><button class="round n" data-act="lbNext" aria-label="下一張">›</button></div>`;

// ───────── 小工具 ─────────
let toastTimer = 0;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ───────── 島名牌 ─────────
const LABEL_Y = { core: 25, brand: 11, walk: 7, library: 8, results: 9, inquiry: 8.5, forest: 7.5, future: 11, teacher: 7.5 };
const plates = {};
const v3 = new THREE.Vector3();

function buildPlates() {
  const box = $('#labels');
  for (const d of ISLANDS) {
    const b = document.createElement('button');
    b.className = 'plate';
    b.style.setProperty('--c', d.color);
    paintPlate(b, d);
    b.addEventListener('click', () => openIsland(d.id));
    b.addEventListener('pointerenter', () => world.setHover(d.id));
    b.addEventListener('pointerleave', () => world.setHover(null));
    box.appendChild(b);
    plates[d.id] = b;
  }
}

function paintPlate(b, d) {
  b.innerHTML = `<span class="dot"></span><span class="pname">${zy(d.name)}</span><em>${esc(d.tag)}</em>${S.stamps.has(d.id) ? '<span class="pstamp" title="已拿到印章">✓</span>' : ''}`;
}

function onFrame(camera) {
  const W = innerWidth, H = innerHeight;
  for (const d of ISLANDS) {
    const g = world.islands[d.id].group.position;
    v3.set(g.x, g.y + (LABEL_Y[d.id] || 8), g.z).project(camera);
    const el = plates[d.id];
    if (v3.z > 1) { el.style.visibility = 'hidden'; continue; }
    el.style.visibility = '';
    el.style.transform = `translate3d(${((v3.x * 0.5 + 0.5) * W).toFixed(1)}px,${((-v3.y * 0.5 + 0.5) * H).toFixed(1)}px,0) translate(-50%,-50%)`;
  }
}

// ───────── 開啟島嶼 ─────────
const cardsOf = (id) => ISSUE.islands[id] || [];

const photoSrc = (k) => `./photos/18/${k}.webp`;
const paras = (t) => t.split('\n').filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');

// 原文：每篇標出年班與題目，作者姓名已在 pieces.json 移除
function originalHtml(ids) {
  return ids.map(piece).filter(Boolean).map((p) => `
    <article class="fs-orig">${p.cls ? `<h4>${esc(p.cls)}〈${esc(p.title)}〉</h4>` : ''}${paras(p.text)}</article>`).join('');
}

function cardHtml(c, i, island) {
  const photos = (c.photos || []).map((k) => `<button class="fs-photo" data-act="photo" data-photo="${k}" aria-label="放大照片：${esc(PHOTOS[k] || '')}"><img src="${photoSrc(k)}" alt="${esc(PHOTOS[k] || '')}" loading="lazy"></button>`).join('');
  const orig = c.pieces?.length ? `<details class="fs-more"><summary>看原文${c.pieces.length > 1 ? `（${c.pieces.length} 篇）` : ''}</summary>${originalHtml(c.pieces)}</details>` : '';
  const thumb = c.photos?.length ? `<img class="fs-thumb" src="${photoSrc(c.photos[0])}" alt="" loading="lazy">` : '';
  return `<details class="fs-card" data-island="${island}" data-card="${c.id}" ${i === 0 ? 'open' : ''}><summary><span class="fs-sum"><b>${esc(c.title)}</b><small>${esc(c.from)}</small></span>${thumb}</summary>${photos ? `<div class="fs-photos">${photos}</div>` : ''}${paras(c.text)}${orig}</details>`;
}

// ───────── 讀完內容、答題拿章 ─────────
const readOf = (id) => S.read[id] || [];
const leftOf = (id) => cardsOf(id).filter((c) => !readOf(id).includes(c.id));

function markRead(id, card, quiet = false) {
  if (!card || readOf(id).includes(card)) return;
  S.read[id] = [...readOf(id), card];
  store.set('fs-read', S.read);
  if (!quiet) paintQuiz();
}

// 選項依島嶼固定打亂：同一座島每次順序一樣，不會因為重新整理就變
function optionOrder(id) {
  const n = QUIZ[id].a.length;
  let seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 7);
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = seed % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

function quizHtml(id) {
  const d = byId[id], q = QUIZ[id];
  if (!q) return '';
  if (S.stamps.has(id)) {
    return `<div class="fs-q done"><p class="fs-q-head">🏅 已拿到「${esc(d.name)}」印章</p><p class="fs-q-text">${zy(q.q)}</p><p class="fs-q-ans">答案：${zy(q.a[0])}</p></div>`;
  }
  const left = leftOf(id);
  if (left.length) {
    return `<div class="fs-q locked"><p class="fs-q-head">📖 闖關題目還沒出現</p><p>還有 <b>${left.length}</b> 則沒有打開喔！把每張卡片都點開看看，題目就會出現。</p>
      <div class="fs-q-left">${left.map((c) => `<button data-act="goCard" data-island="${id}" data-card="${c.id}">${esc(c.title)}</button>`).join('')}</div></div>`;
  }
  const tried = S.tried[id] || [];
  // 提示只說是第幾張卡片，不顯示卡片標題（有些標題就是答案）
  const hintNo = cardsOf(id).findIndex((c) => c.id === q.hint) + 1;
  const wrong = tried.length ? `<p class="fs-q-wrong">再想想看！<button data-act="goCard" data-island="${id}" data-card="${q.hint}">回去看看第 ${hintNo} 張卡片</button>，答案就在裡面。</p>` : '';
  return `<div class="fs-q"><p class="fs-q-head">✏️ 闖關題目：答對就能拿到印章</p><p class="fs-q-text">${zy(q.q)}</p>
    <div class="fs-q-opts">${optionOrder(id).map((i) => `<button data-act="answer" data-island="${id}" data-i="${i}" ${tried.includes(i) ? 'disabled class="no"' : ''}>${zy(q.a[i])}</button>`).join('')}</div>${wrong}</div>`;
}

function paintQuiz() {
  $$('[data-quiz]').forEach((el) => { el.innerHTML = quizHtml(el.dataset.quiz); });
  $('#passCount').textContent = `${S.stamps.size}/${TOTAL}`;
}

function answer(id, i) {
  if (S.stamps.has(id)) return;
  if (i !== 0) {
    S.tried[id] = [...(S.tried[id] || []), i];
    music.sfx('boing');
    paintQuiz();
    return;
  }
  S.stamps.add(id);
  store.set('fs-stamps', [...S.stamps]);
  music.sfx('correct');
  music.sfx('stamp');
  if (plates[id]) paintPlate(plates[id], byId[id]);
  if (world) {
    const p = world.islands[id].group.position;
    world.hippoFx.burst({ x: p.x, y: p.y + 4, z: p.z }, 60, 7, 0.32);
  }
  paintQuiz();
  if (S.stamps.size === TOTAL) {
    toast('九枚印章全部集滿了！可以領福星龍學習證書囉');
    if (world) world.party(9);
    music.sfx('cheer');
    setTimeout(() => showPassport(), calm ? 0 : 1800);
  } else toast(`答對了！拿到「${byId[id].name}」印章（${S.stamps.size} / ${TOTAL}）`);
}

function goCard(id, card) {
  const scope = S.listing ? $('#listBody') : $('#pBody');
  const el = scope?.querySelector(`.fs-card[data-island="${id}"][data-card="${card}"]`);
  if (!el) return;
  el.open = true;
  if (!S.listing && sheet.state === 'peek') sheet.set('half');
  el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
}

// 卡片打開就算讀過
document.addEventListener('toggle', (e) => {
  const el = e.target;
  if (el.matches?.('.fs-card') && el.open) markRead(el.dataset.island, el.dataset.card);
}, true);

// ───────── 藏起來的福星龍 ─────────
function foundDragon(id) {
  const h = HIPPOS[id];
  if (!h) return;
  if (S.dragons.has(id)) {
    world.hippoFx.hop(id, 0.55);
    music.sfx('boing');
    toast(`${h.name}：「${h.line}」`);
    return;
  }
  S.dragons.add(id);
  store.set('fs-dragons', [...S.dragons]);
  world.hippoFx.found(id, world.camera);
  music.sfx('found');
  toast(`找到${h.name}了！（${S.dragons.size} / ${TOTAL}）「${h.line}」`);
  if (S.dragons.size === TOTAL) setTimeout(() => { world.hippoFx.celebrate(); music.sfx('cheer'); toast('九隻福星龍全部找到了！'); }, 1600);
}

// ───────── 福星龍護照與證書 ─────────
const dialogHead = (title) => `<div class="dialog-head"><h2 id="mTitle">${esc(title)}</h2><button class="round" data-act="modalClose" aria-label="關閉">×</button></div>`;
function openModal(html) {
  $('#dialog').innerHTML = html;
  $('#modal').classList.add('open');
}
function closeModal() { $('#modal').classList.remove('open'); }

function showPassport() {
  const need = TOTAL - S.stamps.size;
  const stamps = ISLANDS.map((d) => {
    const on = S.stamps.has(d.id);
    return `<button class="fs-stamp ${on ? 'on' : ''}" style="--c:${d.color}" data-act="goIsland" data-island="${d.id}"><span class="fs-stamp-mark">${on ? '🏅' : '？'}</span><span>${zy(d.name)}</span></button>`;
  }).join('');
  const dragons = ISLANDS.map((d) => {
    const on = S.dragons.has(d.id);
    return `<div class="fs-dragon ${on ? 'on' : ''}"><img src="./mascot/logo-fushing.png" alt="" width="44" height="31"><span>${on ? esc(HIPPOS[d.id].name) : '還沒找到'}</span></div>`;
  }).join('');
  openModal(`${dialogHead('福星龍護照')}<div class="dialog-body">
    <p>每座島讀完內容、答對題目，就能蓋一枚印章。九枚印章集滿，就能領「福星龍學習證書」。</p>
    <h3 class="fs-sub">闖關印章 ${S.stamps.size} / ${TOTAL}</h3><div class="fs-stamps">${stamps}</div>
    <h3 class="fs-sub">福星龍圖鑑 ${S.dragons.size} / ${TOTAL}</h3><p class="fs-note">每座島都藏著一隻福星龍，轉動畫面、放大找找看，點牠一下就能收進圖鑑。</p><div class="fs-dragons">${dragons}</div>
    <div class="fs-pass-foot">${need ? `<p>還差 <b>${need}</b> 枚印章就能領證書。</p>` : '<button class="cta koi" data-act="certForm">領取福星龍學習證書</button>'}
      <button class="fs-reset" data-act="resetAll">換下一位同學（清除這台裝置的紀錄）</button></div>
  </div>`);
}

function showCertForm() {
  openModal(`${dialogHead('福星龍學習證書')}<div class="dialog-body">
    <p>請輸入要寫在證書上的暱稱（最多 12 個字）。暱稱只存在這台裝置，不會上傳到網路。</p>
    <form class="fs-cert-form" data-form="cert"><input id="nick" maxlength="12" autocomplete="off" placeholder="例如：愛閱讀的小龍" value="${esc(S.nick)}"><button class="cta koi" type="submit">做成證書</button></form>
    <p class="fs-note" id="nickMsg"></p>
  </div>`);
  setTimeout(() => $('#nick')?.focus(), 50);
}

async function showCert(nick) {
  S.nick = nick;
  store.set('fs-nick', nick);
  openModal(`${dialogHead('福星龍學習證書')}<div class="dialog-body"><p class="fs-note">證書製作中…</p></div>`);
  const url = await drawCert({ nick, islands: ISLANDS, dragons: S.dragons.size, total: TOTAL, school: SCHOOL.name, issue: ISSUE.no });
  openModal(`${dialogHead('福星龍學習證書')}<div class="dialog-body">
    <img class="fs-cert-img" src="${url}" alt="福星龍學習證書：頒給 ${esc(nick)}">
    <div class="fs-pass-foot"><a class="cta koi" href="${url}" download="福星龍學習證書.png">下載證書圖片</a><button class="fs-reset" data-act="certForm">修改暱稱</button></div>
  </div>`);
  music.sfx('chime');
}

document.addEventListener('submit', (e) => {
  if (!e.target.matches('[data-form="cert"]')) return;
  e.preventDefault();
  const nick = $('#nick').value.trim();
  const err = validNick(nick);
  if (err) { $('#nickMsg').textContent = err; return; }
  showCert(nick);
});

function resetAll() {
  if (!confirm('要清除這台裝置上的印章、福星龍與證書暱稱，讓下一位同學重新開始嗎？')) return;
  S.read = {}; S.stamps = new Set(); S.dragons = new Set(); S.nick = ''; S.tried = {};
  ['fs-read', 'fs-stamps', 'fs-dragons', 'fs-nick'].forEach((k) => store.set(k, k === 'fs-read' ? {} : k === 'fs-nick' ? '' : []));
  location.reload();
}

// ───────── 照片燈箱 ─────────
let lbList = [], lbAt = 0;
function showPhoto(k) {
  lbList = [...document.querySelectorAll(S.listing ? '#listBody [data-photo]' : '#pBody [data-photo]')].map((b) => b.dataset.photo);
  lbAt = Math.max(0, lbList.indexOf(k));
  paintPhoto();
  $('#lb').classList.add('open');
}
function paintPhoto() {
  const k = lbList[lbAt];
  $('#lbImg').src = photoSrc(k);
  $('#lbImg').alt = PHOTOS[k] || '';
  $('#lbCap').textContent = PHOTOS[k] || '';
}

function openIsland(id, { fly = true, push = true } = {}) {
  if (S.listing) setList(false, false);
  const d = byId[id];
  S.island = id;
  const panel = $('#panel');
  panel.style.setProperty('--c', d.color);
  $('#pKicker').textContent = d.kicker;
  $('#pTitle').innerHTML = zy(d.name);
  $('#pPeek').textContent = d.name;
  $('#pPlain').innerHTML = zy(d.plain);
  $('#pMotto').textContent = d.motto;
  $('#pBody').innerHTML = `<p class="fs-tour">${esc(d.tour)}</p>${cardsOf(id).map((c, i) => cardHtml(c, i, id)).join('')}<section class="fs-quiz" data-quiz="${id}"></section>`;
  markRead(id, cardsOf(id)[0]?.id);
  paintQuiz();
  $('#pBody').scrollTop = 0;
  const idx = order.indexOf(id);
  $('#footPrev').textContent = `‹ ${byId[order[(idx + order.length - 1) % order.length]].name}`;
  $('#footNext').textContent = `${byId[order[(idx + 1) % order.length]].name} ›`;
  panel.classList.add('open');
  document.body.classList.add('reading');
  panel.setAttribute('aria-hidden', 'false');
  $('#hint').hidden = true;
  Object.entries(plates).forEach(([k, p]) => p.classList.toggle('off', k !== id || isMobile()));
  if (world) {
    if (fly) world.focusIsland(id);
    world.setHoverRing(null);
  }
  if (push && location.hash !== `#/${d.slug}`) history.pushState(null, '', `#/${d.slug}`);
  music.sfx('whoosh');
  sheet.reset();
  updateInset();
}

function closeIsland(push = true) {
  if (!S.island) return;
  S.island = null;
  $('#panel').classList.remove('open');
  sheet.reset();
  document.body.classList.remove('reading');
  $('#panel').setAttribute('aria-hidden', 'true');
  $('#hint').hidden = false;
  Object.values(plates).forEach((p) => p.classList.remove('off'));
  world?.clearFocus();
  world?.setView('home');
  syncView('home');
  updateInset();
  if (push) history.pushState(null, '', location.pathname + location.search);
}

function step(dir) {
  const i = order.indexOf(S.island);
  openIsland(order[(i + dir + order.length) % order.length]);
}

function updateInset() {
  if (!world) return;
  if (S.island && !S.listing) {
    if (isMobile()) world.setInset(0, Math.min(sheet.height, innerHeight * 0.6) / 2 - 10);
    else world.setInset(($('#panel').offsetWidth + 14) / 2, 0);
  } else world.setInset(0, 0);
}
window.addEventListener('resize', updateInset);

function onSheet(state, prev) {
  updateInset();
  if (!world || !S.island) return;
  if (state === 'peek') world.focusIsland(S.island, true);
  else if (prev === 'peek') world.focusIsland(S.island);
}

// ───────── 檢視模式與清單 ─────────
function syncView(name) {
  $$('.dock [data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === name));
}

function renderList() {
  $('#listBody').innerHTML = ISLANDS.map((d) => `
    <section class="list-island" style="--c:${d.color}">
      <h3>${zy(d.name)} <small>${zy(d.plain)}</small></h3>
      <p class="motto">${esc(d.motto)}</p>
      ${cardsOf(d.id).map((c, i) => cardHtml(c, i, d.id)).join('')}
      <section class="fs-quiz" data-quiz="${d.id}"></section>
    </section>`).join('');
}

function setList(on, push = true) {
  S.listing = on;
  $('#listview').classList.toggle('open', on);
  document.body.classList.toggle('listing', on);
  if (on) {
    if (S.island) closeIsland(false);
    renderList();
    ISLANDS.forEach((d) => markRead(d.id, cardsOf(d.id)[0]?.id, true));
    paintQuiz();
    syncView('list');
    if (push) history.pushState(null, '', '#/list');
  } else if (push) history.pushState(null, '', location.pathname + location.search);
  updateInset();
}

// ───────── 天氣、音樂與場景工具 ─────────
function setTime(i) {
  S.timeIdx = i % TIMES.length;
  const t = TIMES[S.timeIdx];
  world.setTimeMode(t.time);
  world.setWeather(t.w);
  $('#timeBtn').textContent = `天氣・${t.label}`;
}

function paintToggle(sel, on, key) {
  const b = $(sel);
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on);
  store.set(key, on);
}

const actions = {
  home: () => { closeIsland(); setList(false, false); world?.setView('home'); syncView('home'); },
  hint: () => { $('#hint').hidden = true; },
  close: () => closeIsland(),
  prev: () => step(-1),
  next: () => step(1),
  tall: () => sheet.toggle?.(),
  labels: (el) => { const on = el.classList.toggle('on'); $('#labels').style.display = on ? '' : 'none'; },
  arcs: (el) => { const on = el.classList.toggle('on'); world.showArcs(on); },
  pause: (el) => { S.paused = !S.paused; world.setPaused(S.paused); el.classList.toggle('on', S.paused); el.textContent = S.paused ? '繼續' : '暫停'; },
  music: () => music.toggle(),
  sfx: () => music.toggleSfx(),
  time: () => { setTime(S.timeIdx + 1); toast(`現在是「${TIMES[S.timeIdx].label}」`); },
  zhuyin: () => {
    S.zhuyin = !S.zhuyin;
    paintToggle('#zhuyinBtn', S.zhuyin, 'fs-zhuyin');
    document.body.classList.toggle('zhuyin', S.zhuyin);
    ISLANDS.forEach((d) => plates[d.id] && paintPlate(plates[d.id], d));
    if (S.island) { const d = byId[S.island]; $('#pTitle').innerHTML = zy(d.name); $('#pPlain').innerHTML = zy(d.plain); }
    if (S.listing) renderList();
  },
  photo: (el) => showPhoto(el.dataset.photo),
  answer: (el) => answer(el.dataset.island, +el.dataset.i),
  goCard: (el) => goCard(el.dataset.island, el.dataset.card),
  goIsland: (el) => { closeModal(); openIsland(el.dataset.island); },
  passport: () => showPassport(),
  certForm: () => showCertForm(),
  modalClose: () => closeModal(),
  resetAll: () => resetAll(),
  lbClose: () => $('#lb').classList.remove('open'),
  lbPrev: () => { lbAt = (lbAt + lbList.length - 1) % lbList.length; paintPhoto(); },
  lbNext: () => { lbAt = (lbAt + 1) % lbList.length; paintPhoto(); },
  tilt: (el) => { const on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-pressed', on); world.setTilt(on); },
};

document.addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]');
  if (v) {
    const name = v.dataset.view;
    if (name === 'list') { setList(true); return; }
    if (S.listing) setList(false, false);
    if (S.island) closeIsland(false);
    world?.setView(name);
    syncView(name);
    return;
  }
  const a = e.target.closest('[data-act]');
  if (a && actions[a.dataset.act]) { music.sfx('tap'); actions[a.dataset.act](a); }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if ($('#modal').classList.contains('open')) closeModal(); else if ($('#lb').classList.contains('open')) actions.lbClose(); else if (S.listing) setList(false); else closeIsland(); }
});

function route() {
  const h = location.hash.replace(/^#\/?/, '');
  if (h === 'list') { if (!S.listing) setList(true, false); return; }
  if (S.listing) setList(false, false);
  const d = bySlug[h];
  if (d) { if (S.island !== d.id) openIsland(d.id, { push: false }); } else if (S.island) closeIsland(false);
}
window.addEventListener('popstate', route);

// ───────── 啟動 ─────────
function finishLoading() {
  const l = $('#loader');
  if (!l) return;
  l.classList.add('done');
  setTimeout(() => l.remove(), 900);
}

async function boot() {
  initUpdate();
  sheet.init($('#panel'), isMobile, onSheet);
  // 音樂與音效預設靜音，訪客自己打開才播放
  music.init({
    want: store.get('fs-music', false),
    sfx: store.get('fs-sfx', false),
    onChange: (on) => paintToggle('#musicBtn', on, 'fs-music'),
    onStart: () => {},
    onSfx: (on) => paintToggle('#sfxBtn', on, 'fs-sfx'),
  });
  paintToggle('#musicBtn', music.want, 'fs-music');
  paintToggle('#sfxBtn', music.sfxOn, 'fs-sfx');
  paintToggle('#zhuyinBtn', S.zhuyin, 'fs-zhuyin');
  document.body.classList.toggle('zhuyin', S.zhuyin);
  paintQuiz();
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

  const bar = $('#loaderBar'), text = $('#loaderText');
  const fallback = () => {
    setList(true, false);
    $('#world').style.display = 'none';
    finishLoading();
    toast('這台裝置無法顯示 3D 畫面，已改用文字清單');
  };
  $('#loaderSkip').addEventListener('click', fallback);
  setTimeout(() => { if ($('#loader')) $('#loaderSkip').hidden = false; }, 9000);
  try {
    world = new World($('#world'), {
      onPick: (id) => openIsland(id),
      onPerson: () => {},
      onHover: (id) => Object.entries(plates).forEach(([k, p]) => p.classList.toggle('hot', k === id)),
      onFrame,
      onHippo: (id) => foundDragon(id),
      onArrow: (key) => {
        if (S.island && (key === 'ArrowLeft' || key === 'ArrowRight')) { step(key === 'ArrowLeft' ? -1 : 1); return true; }
        return false;
      },
      onEnv: (env) => music.setMood({ storm: env.storm, night: env.night > 0.5, dusk: env.dusk, rain: env.rain > 0.15, cloud: env.cloud >= 0.6, thunder: env.thunder }),
      onSplash: () => music.sfx('splash'),
      onQuality: () => { $('#tiltBtn').classList.remove('on'); $('#tiltBtn').setAttribute('aria-pressed', false); },
    });
    await world.build((p, label) => { bar.style.width = `${Math.round(p * 100)}%`; text.textContent = label; });
  } catch (e) {
    console.error(e);
    fallback();
    return;
  }
  window.__world = world;
  buildPlates();
  setTime(0);
  $('#tiltBtn').classList.toggle('on', world.tilt);
  world.hippoFx.restore(S.dragons);
  world.start();
  updateInset();
  finishLoading();
  if (!calm) {
    const end = world.camera.position.clone(), tgt = world.controls.target.clone();
    world.camera.position.copy(end).multiplyScalar(1.5).add(new THREE.Vector3(0, 60, 0));
    world.flyTo(end, tgt, 2.6);
  }
  route();
}

boot();
