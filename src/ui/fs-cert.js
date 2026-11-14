// 福星龍學習證書：在瀏覽器用 canvas 畫成圖片，暱稱只留在這台裝置，不上傳
const W = 1600, H = 1130;
const FONT = '"LXGW WenKai TC", "Noto Serif TC", "Microsoft JhengHei", serif';
const BODY = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';

// 暱稱檢查：1–12 個字，不接受網址或電子郵件（避免把個資寫上證書）
export function validNick(nick) {
  if (!nick) return '請先輸入暱稱喔！';
  if (/https?:|www\.|@|\.com/i.test(nick)) return '暱稱不能放網址或電子郵件。';
  if ([...nick].length > 12) return '暱稱最多 12 個字。';
  if (/[<>]/.test(nick)) return '暱稱不能有 < 或 > 符號。';
  return '';
}

function rocDate(d = new Date()) {
  return `民國 ${d.getFullYear() - 1911} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export async function drawCert({ nick, islands, dragons, total, school, issue }) {
  try { await Promise.all([document.fonts.load(`700 80px ${FONT}`), document.fonts.load(`500 30px ${BODY}`)]); } catch { /* 字型載不到就用系統字 */ }
  const logo = await loadImage('./mascot/logo-fushing.png');
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');

  // 底色與雙框線（青綠＋橘黃）
  g.fillStyle = '#fdf9f0';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#3d8f8a'; g.lineWidth = 18;
  roundRect(g, 30, 30, W - 60, H - 60, 30); g.stroke();
  g.strokeStyle = '#e2a02c'; g.lineWidth = 4;
  roundRect(g, 62, 62, W - 124, H - 124, 22); g.stroke();

  // 福星龍校徽
  if (logo) g.drawImage(logo, W / 2 - 110, 92, 220, 152);

  g.textAlign = 'center';
  g.fillStyle = '#2b6f6b';
  g.font = `700 92px ${FONT}`;
  g.fillText('福星龍學習證書', W / 2, 340);

  g.fillStyle = '#3b2c1d';
  g.font = `500 40px ${BODY}`;
  g.fillText('頒給', W / 2, 425);
  g.fillStyle = '#b4505f';
  g.font = `700 76px ${FONT}`;
  g.fillText(nick, W / 2, 515);
  g.strokeStyle = '#e2a02c'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(W / 2 - 300, 540); g.lineTo(W / 2 + 300, 540); g.stroke();

  g.fillStyle = '#3b2c1d';
  g.font = `500 36px ${BODY}`;
  g.fillText(`讀完《文藝復興》第 ${issue} 期九座浮空島的內容，`, W / 2, 615);
  g.fillText('並通過全部闖關題目，特頒此證，以資鼓勵。', W / 2, 667);

  // 九枚印章
  const r = 46, gap = 140, y0 = 790;
  const x0 = W / 2 - gap * (islands.length - 1) / 2;
  islands.forEach((d, i) => {
    const x = x0 + i * gap;
    g.fillStyle = d.color;
    g.beginPath(); g.arc(x, y0, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.font = `700 34px ${FONT}`;
    g.fillText('✓', x, y0 + 12);
    g.fillStyle = '#3b2c1d';
    g.font = `500 22px ${BODY}`;
    g.fillText(d.name.replace('島', ''), x, y0 + r + 34);
  });

  g.fillStyle = '#6a5541';
  g.font = `500 30px ${BODY}`;
  g.fillText(`福星龍圖鑑：找到 ${dragons} / ${total} 隻`, W / 2, 935);

  g.font = `500 28px ${BODY}`;
  g.fillText(`${school}｜復興浮空島`, W / 2, 1010);
  g.fillText(rocDate(), W / 2, 1052);

  return c.toDataURL('image/png');
}
