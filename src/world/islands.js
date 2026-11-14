// 浮空島的地標與擺設（復興浮空島沿用其中九座並改造）。每座回傳靜態場景，並登記互動定位點與動態零件
import * as THREE from 'three';
import { Kit, G } from './kit.js';
import { makeBase, floatingRock, outline } from './base.js';
import * as P from './props.js';

const { C } = P;

// 吊橋落地處留空，人物才走得上島
const nearGate = (k, x, z) => k.gates.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 3);

function scatterTrees(k, r, n, avoid = [], types = [P.tree, P.pine]) {
  let placed = 0, tries = 0;
  while (placed < n && tries < n * 30) {
    tries++;
    const a = k.rand(6.283), rr = r * k.rand(0.42, 0.9);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (nearGate(k, x, z) || avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    k.pick(types)(k, x, z, k.rand(0.55, 0.9));
    placed++;
  }
}

function rimDecor(k, r, seed, n) {
  for (let i = 0; i < n; i++) {
    const a = k.rand(6.283), rr = outline(r, seed, a) * k.rand(0.8, 0.93);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const t = k.r();
    if (nearGate(k, x, z)) continue;
    if (t < 0.4) P.rock(k, x, z, k.rand(0.5, 1));
    else if (t < 0.75) P.bush(k, x, z, k.rand(0.8, 1.2));
    else P.flowers(k, x, z, 4, 0.4);
  }
}

function spinner(build, x, y, z, axis = 'y', speed = 1) {
  const k = new Kit(5);
  build(k);
  const m = k.build();
  m.position.set(x, y, z);
  return { obj: m, update: (t) => { m.rotation[axis] = t * speed; } };
}

// ═════════ 初心啟航島：環狀列柱台地 + 大樹 + 校舍 + 福星龍雕像 ═════════
function core(k, def) {
  const r = def.r;
  const pal = makeBase(k, { r, seed: def.seed, palette: 'green', wall: 3.4, depth: 22 });
  const dyn = [];
  // 第二層環形台地
  k.cyl(11.2, 2.6, C.stone, 0, 0, -3, { rt: 10.8, seg: 22, ao: 0.74 });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * 6.283;
    if (Math.sin(a) > 0.72) continue;
    k.at(Math.cos(a) * 11, 2.6, -3 + Math.sin(a) * 11, -a + Math.PI / 2, 0.86, () => {
      k.box(0.46, 1.8, 0.46, C.stone, -0.94, -0.0, 0);
      k.box(0.46, 1.8, 0.46, C.stone, 0.94, 0, 0);
      k.box(2.6, 0.32, 0.56, '#c4b59b', 0, 1.8, 0);
    });
  }
  k.cyl(10.4, 0.14, '#8fb24f', 0, 2.6, -3, { seg: 22, wonk: 0, ao: 1 });
  // 階梯
  for (let i = 0; i < 9; i++) k.box(3.2, 0.3 + i * 0.29, 0.26, C.stone, 0, 0, 9.5 - i * 0.23, { ao: 0.9 });
  // 第三層與世界樹
  k.cyl(5.6, 2, '#c4b59b', 0, 2.7, -5, { rt: 5.2, seg: 18, ao: 0.76 });
  k.cyl(5.1, 0.12, '#9dbd58', 0, 4.7, -5, { seg: 18, wonk: 0, ao: 1 });
  k.at(0, 4.7, -5, 0, 1, () => {
    k.cyl(1.5, 5.6, C.trunk, 0, 0, 0, { rt: 0.85, seg: 9, ao: 0.68 });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * 6.283;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a) * 1.1, 1.8, Math.sin(a) * 1.1),
        new THREE.Vector3(Math.cos(a) * 2.8, 0.15, Math.sin(a) * 2.8),
        new THREE.Vector3(Math.cos(a) * 5.2, -0.2, Math.sin(a) * 5.2),
        new THREE.Vector3(Math.cos(a) * 5.9, -2.6, Math.sin(a) * 5.9),
      ]);
      k.raw(new THREE.TubeGeometry(curve, 8, 0.32, 5, false), C.trunk2, { wonk: 0, ao: 1 });
    }
    const blobs = [[0, 8.3, 0, 5.3], [3.6, 7, 1.2, 3.5], [-3.7, 7.2, 0.8, 3.6], [1.2, 7, -3.5, 3.4], [-1.6, 7.2, 3.3, 3.3], [0, 10.5, 0, 3.4], [2.6, 9.4, -1.4, 2.6], [-2.6, 9.6, 1, 2.6]];
    blobs.forEach(([x, y, z, s], i) => k.ball(s, C.leaf[i % 4], x, y, z, { detail: 1, sy: 0.74, sway: 0.16 }));
  });
  // 百年校舍
  k.at(0, 2.7, 0, 0, 1, () => {
    P.schoolBuilding(k, -6.2, 0.2, 0.62, { w: 5.2, d: 2.2, floors: 3, tower: true });
    P.schoolBuilding(k, 6.2, 0.2, -0.62, { w: 5.2, d: 2.2, floors: 2, tower: false, trim: C.brick2 });
  });
  // 前庭
  P.pavers(k, [[0, 16.5], [0, 8.6]], 0.7);
  P.pond(k, 0, 12.3, 2, 1.5);
  P.dragonStatue(k, 0, 0.1, 12.3, 1.3);
  P.flag(k, -5.5, 12, 4.4, C.blue);
  P.flag(k, 5.5, 12, 4.4, C.red);
  P.arch(k, -10.2, 8.8, 0.9, 1);
  P.arch(k, 10.2, 8.8, -0.9, 1);
  [[-4, 14], [4, 14.2], [-13, 4], [13, 4.6], [-12.5, -5], [12.5, -5.5], [-9.5, -11], [9, -11.4]].forEach(([x, z]) => P.tree(k, x, z, k.rand(0.8, 1.1)));
  [[-7, 13], [7, 13], [-14.4, 0.4], [14.5, -0.6]].forEach(([x, z]) => P.lamp(k, x, z));
  rimDecor(k, r, def.seed, 22);
  P.bench(k, -3.4, 11.4, 0.5); P.bench(k, 3.4, 11.4, -0.5);
  for (const [x, z] of [[-2.6, 15], [2.4, 15.3], [-5.6, 9.8]]) P.figure(k, x, z, k.rand(6));
  k.spot(0, 3.2, 12.3).spot(-6.2, 8.6, 0.2).spot(0, 4, 4.6).spot(0, 17, -5).spot(6.2, 7, 0.2);
  // 台地高 2.74，前方階梯由 z=9.7 爬到 z=7.6
  const stairs = (x, z) => Math.abs(x) < 1.7 && z > 7.3 && z < 9.75;
  const floor = (x, z) => (stairs(x, z) ? 2.74 * Math.min(1, Math.max(0, (9.7 - z) / 2.1)) : Math.hypot(x, z + 3) < 10.3 ? 2.74 : 0);
  return { dyn, palette: pal, walk: { floor, clear: stairs } };
}

// ═════════ 奇思妙想島：天文台、舞台、創客桌、四季樹 ═════════
function inquiry(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'moss', wall: 2.2, depth: 14 });
  const dyn = [];
  // 5 專題：天文台
  k.at(0, 0, -5, 0, 1, () => {
    k.cyl(2.6, 2.4, C.white, 0, 0, 0, { seg: 12, ao: 0.82 });
    k.add(G.sphere(12, 6), '#7fa8c0', { y: 2.4, sx: 2.5, sy: 2.1, sz: 2.5 });
    k.box(1, 0.2, 2.6, C.dark, 0, 3.8, 0.8, { rx: 0.6 });
    k.box(0.7, 1.3, 0.06, C.wood2, 0, 0, 2.55);
    k.door(0, 0, 3.1);
    for (const a of [-1, 1]) k.glow(0.5, 0.5, 0.05, C.win, a * 1.4, 1, 2.2, { ry: a * -0.6 });
  });
  // 7 創意戲劇：舞台
  k.at(7.4, 0, -3.6, -0.75, 1, () => {
    k.box(4, 0.5, 2.4, C.wood2, 0, 0, 0);
    k.box(4, 2.8, 0.2, C.ink, 0, 0.5, -1.1);
    k.box(0.42, 2.8, 0.4, C.wood, -1.95, 0.5, 0.4); k.box(0.42, 2.8, 0.4, C.wood, 1.95, 0.5, 0.4);
    k.box(4.4, 0.5, 0.5, C.red, 0, 3.1, 0.4);
    k.box(0.9, 2.2, 0.08, C.red, -1.5, 1.05, 0.5); k.box(0.9, 2.2, 0.08, C.red, 1.5, 1.05, 0.5);
    k.at(0, 0.5, 0, 0, 1, () => { P.figure(k, -0.5, 0, 0, { shirt: C.pink }); P.figure(k, 0.5, 0, 0, { shirt: C.gold }); });
  });
  // 3 創客：機器人工作桌
  k.at(-7.8, 0, -2.2, 0.8, 1, () => {
    k.box(2.6, 0.08, 1.2, C.wood3, 0, 0.7, 0);
    for (const [a, b] of [[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]]) k.box(0.1, 0.7, 0.1, C.wood2, a, 0, b);
    k.box(0.72, 0.6, 0.54, C.metal, 0, 0.78, 0);
    k.box(0.5, 0.36, 0.42, '#b6c2cc', 0, 1.38, 0);
    k.glow(0.1, 0.1, 0.05, C.screen, -0.12, 1.5, 0.22); k.glow(0.1, 0.1, 0.05, C.screen, 0.12, 1.5, 0.22);
    k.cyl(0.02, 0.3, C.dark, 0, 1.74, 0, { seg: 4 }); k.ball(0.06, C.red, 0, 2.06, 0);
    k.box(0.32, 0.22, 0.32, C.orange, -0.9, 0.78, 0.1); k.box(0.26, 0.3, 0.26, C.teal, 0.9, 0.78, -0.1);
  });
  // 1 雙語：ABC 積木
  k.at(-4.8, 0, 5.2, 0.3, 1, () => {
    [['#d9432f', -0.7, 0], ['#3d86c6', 0.15, 0.1], ['#e3a73b', 0.95, -0.05]].forEach(([c, x, y], i) => k.box(0.74, 0.74, 0.74, c, x, 0, 0, { ry: i * 0.3 }));
    k.box(0.74, 0.74, 0.74, '#5a9b4e', 0.1, 0.74, 0, { ry: 0.5 });
    k.add(G.sphere(12, 8), C.sky, { x: -2.1, y: 1.1, sx: 0.56, sy: 0.56, sz: 0.56 });
    k.cyl(0.36, 0.1, C.wood2, -2.1, 0, 0, {}); k.cyl(0.05, 0.56, C.wood2, -2.1, 0.08, 0, { seg: 4 });
  });
  // 2 營隊：帳篷
  k.at(5.2, 0, 5.2, -0.4, 1, () => {
    k.cone(1.25, 1.5, C.orange, -0.9, 0, 0, { seg: 4 });
    k.cone(1.15, 1.35, C.teal, 1.25, 0, -0.5, { seg: 4 });
    k.door(-0.9, 0, 1.6);
    k.cyl(0.32, 0.1, C.stone2, 0.1, 0, 1.2); k.ball(0.14, C.orange, 0.1, 0.2, 1.2);
  });
  // 4 主題書展：書本拱門
  k.at(-1.2, 0, 7.8, 0, 1, () => {
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (i / 8), rr = 1.36;
      k.add(G.box(), [C.red, C.gold, C.teal, C.blue, C.purple][i % 5], { x: Math.cos(a) * rr, y: Math.sin(a) * rr + 0.16, sx: 0.5, sy: 0.3, sz: 0.5, rz: a + Math.PI / 2 });
    }
  });
  // 6 金頭腦：金色燈泡塔
  k.at(-9.4, 0, 3.4, 0, 1, () => {
    k.cyl(0.62, 0.5, C.stone, 0, 0, 0, { seg: 8 });
    k.glow(0.34, 0.5, 0.34, C.gold, 0, 0.5, 0, { ry: 0.78 });
    k.ball(0.62, C.gold, 0, 1.46, 0, { detail: 1, layer: 'glow' });
  });
  // 看見四季：一棵樹上同時有春夏秋冬
  k.at(9.4, 0, 2.8, 0, 1, () => {
    k.cyl(0.16, 1.2, C.trunk, 0, 0, 0, { rt: 0.1, seg: 6 });
    [['#7fb04f', 0.4, 0.4], ['#f29bb6', -0.4, 0.4], ['#e58a2f', 0.4, -0.4], ['#f4f1ea', -0.4, -0.4]].forEach(([c, x, z]) => k.ball(0.5, c, x, 1.6, z, { detail: 1, sway: 0.4 }));
  });
  // 9 閱讀主播台
  k.at(3.8, 0, -8.4, 0.2, 1, () => {
    k.box(2.8, 1.8, 1.8, C.cream, 0, 0, 0);
    k.glow(1.5, 0.85, 0.05, C.screen, 0, 0.6, 0.91);
    k.roof(2.3, 0.6, 3.2, C.roof2, 0, 1.8, 0, { ry: Math.PI / 2 });
    const d = spinner((s) => { s.box(0.06, 0.06, 1, C.metal, 0, 0, 0); s.add(G.cone(8), C.white, { y: 0.15, sx: 0.5, sy: 0.3, sz: 0.5, rx: Math.PI }); }, 0, 0, 0);
    dyn.push(d); d.obj.position.copy(k.point(0.9, 2.9, 0));
    k.cyl(0.04, 0.9, C.metal, 0.9, 2, 0, { seg: 4 });
  });
  // 10 與作家有約：大鉛筆
  k.at(8.2, 0, -7, -0.5, 1, () => {
    k.cyl(0.36, 3, C.gold, 0, 0, 0, { seg: 6 });
    k.cone(0.36, 0.72, C.wood3, 0, 3, 0, { seg: 6 });
    k.cone(0.12, 0.24, C.ink, 0, 3.5, 0, { seg: 6 });
    k.cyl(0.38, 0.32, C.pink, 0, 0, 0, { seg: 6 });
    P.bench(k, -1.2, 0.8, 0.6);
  });
  scatterTrees(k, r, 5, [[0, -5, 4], [7.4, -3.6, 3.4], [-7.8, -2.2, 2.2], [-4.8, 5.2, 2.6], [5.2, 5.2, 2.6], [-1.2, 7.8, 2], [3.8, -8.4, 2.4], [8.2, -7, 2], [-9.4, 3.4, 1.4], [9.4, 2.8, 1.4]]);
  rimDecor(k, r, def.seed, 12);
  P.pavers(k, [[0, 10], [0, 2], [-2, -1.5]], 0.6);
  k.spot(-4.8, 2.4, 5.2).spot(5.2, 2.4, 5.2).spot(-7.8, 3, -2.2).spot(-1.2, 2.6, 7.8).spot(0, 6, -5).spot(-9.4, 3, 3.4).spot(7.4, 4.6, -3.6).spot(9.4, 3, 2.8).spot(3.8, 3.6, -8.4).spot(8.2, 5, -7);
  return { dyn };
}

// ═════════ 秘境踏查島：屏東家鄉的縮影（萬年溪、天使橋、石板屋、夜市、縣民公園）═════════
function walk(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'green', wall: 2.6, depth: 15 });
  const dyn = [];
  // 後方山丘：大武山的意象
  k.ball(4.2, '#7fa84d', -2.8, 0, -9.6, { detail: 1, sy: 0.8 });
  k.ball(5.6, '#6f9a48', 2.6, 0, -9.6, { detail: 1, sy: 0.82 });
  k.ball(5, '#86ad52', 8.8, 0, -7.6, { detail: 1, sy: 0.66 });
  // 春天開滿粉紅花的風鈴木
  [[-7.6, -6.4], [-5.2, -5.6], [-3.6, -6.2], [6.2, -6.4], [9.6, -5.2], [11, -3.4]].forEach(([x, z]) => P.bellTree(k, x, z, 0.72));
  [[-5.2, -10.2], [-3.4, -7.4], [-1.2, -8], [3.6, -8.3], [7, -8.2], [9.4, -7.3]].forEach(([x, z]) => P.pine(k, x, z, 0.72, 2.1));
  // 萬年溪的水面（雨天魚兒會從這裡跳出來）
  const lakeG = new THREE.CircleGeometry(1, 26);
  lakeG.rotateX(-Math.PI / 2);
  const lakeKit = new Kit(3);
  lakeKit.add(lakeG.toNonIndexed(), '#4fa9d6', { sx: 7.2, sz: 3.6, layer: 'water', wonk: 0, ao: 1 });
  const lake = lakeKit.build();
  lake.position.set(0.8, 0.26, -3.4);
  dyn.push({ obj: lake, lake: true });
  k.cyl(7.6, 0.2, '#6c8f4b', 0.8, 0.02, -3.4, { seg: 24, sz: 4.05, wonk: 0 });
  // 溪畔步道與白色欄杆
  k.at(0.8, 0, 0.9, 0, 1, () => {
    k.box(11.4, 0.08, 1.1, '#d8cfbd', 0, 0, 0, { wonk: 0.01 });
    for (let i = 0; i < 12; i++) k.box(0.08, 0.6, 0.08, C.white, -5.4 + i * 0.98, 0, -0.45);
    k.box(11, 0.07, 0.07, C.white, 0, 0.58, -0.45);
  });
  // 1 霧台石板屋 + 老榕樹
  k.at(-9, 0, 2.8, 0.7, 1, () => {
    P.house(k, 0, 0, 0, { w: 2.5, d: 1.7, wall: '#857d72', roof: '#4c4946' });
    P.house(k, 1.9, 1.6, 0.2, { w: 1.9, d: 1.4, wall: '#7a736b', roof: '#4c4946' });
    for (let i = 0; i < 5; i++) k.box(0.7, 0.12, 0.5, i % 2 ? '#6f6a64' : '#5c5852', -1.6 + i * 0.12, i * 0.12, 1.4, { ry: i * 0.3 });
  });
  P.banyan(k, -11, -2, 0.92);
  // 2 屏東夜市：三個小攤位，掛著紅燈籠
  k.at(-3.8, 0, 3.8, 0.12, 1, () => {
    [[-1.7, C.red], [0, C.gold], [1.7, C.teal]].forEach(([x, awn]) => {
      k.box(1.4, 0.8, 0.8, C.cream, x, 0, 0);
      for (const [px, pz] of [[-0.64, -0.36], [0.64, -0.36], [-0.64, 0.36], [0.64, 0.36]]) k.box(0.06, 1.7, 0.06, C.wood2, x + px, 0, pz);
      k.box(1.56, 0.1, 1.1, awn, x, 1.7, 0.06, { rx: 0.12 });
      k.glow(0.2, 0.24, 0.2, '#ff7a4a', x, 1.36, 0.5);
      k.cyl(0.18, 0.2, C.white, x - 0.3, 0.8, 0, { seg: 8 });
    });
    k.door(0, 0, 1.4);
  });
  // 4 縣民公園：舊紙漿廠的紅磚廠房與大煙囪
  k.at(3.6, 0, 7.2, -0.2, 1, () => {
    k.box(6, 1.6, 1.8, C.brick, -0.6, 0, 0, { ao: 0.82 });
    for (let i = 0; i < 4; i++) k.roof(1.5, 0.6, 1.9, C.tile, -2.85 + i * 1.5, 1.6, 0, { ry: Math.PI / 2, rz: 0.2 });
    for (let i = 0; i < 4; i++) k.glow(0.6, 0.5, 0.05, C.win, -2.6 + i * 1.4, 0.5, 0.92);
    k.cyl(0.4, 4.2, C.brick2, 3.2, 0, -0.2, { rt: 0.3, seg: 8 });
    k.box(8.2, 0.05, 1, '#c7bca6', -0.4, 0, 1.4, { wonk: 0.02 });
    k.door(-0.6, 0, 1.3);
  });
  // 5 溪上的小船
  k.at(-2.8, 0.28, -3.6, 0.3, 1, () => {
    k.box(1.3, 0.22, 0.5, C.white, 0, 0, 0);
    k.box(0.5, 0.26, 0.36, C.teal, -0.1, 0.22, 0);
    k.box(0.9, 0.06, 0.12, C.wood2, 1.5, -0.06, 0.2);
  });
  // 6 天使橋：張開白色翅膀的拱橋，橋邊有澎湖的仙人掌
  k.at(9.8, 0, 3.2, -0.9, 1, () => {
    k.box(5, 0.05, 0.86, C.water, 0, 0.02, 0, { layer: 'water', wonk: 0, ao: 1 });
    for (let i = 0; i <= 6; i++) { const a = Math.PI * (i / 6); k.box(0.42, 0.14, 1.1, C.white, Math.cos(a) * 0.95, Math.sin(a) * 0.56 + 0.05, 0, { rz: a - 1.57 }); }
    for (const sx of [-1, 1]) k.box(0.9, 0.05, 1.2, '#f7f4ee', sx * 0.6, 1.25, 0, { rz: sx * -0.75 });
    k.at(-2.4, 0, 1.4, 0.5, 1, () => {
      k.cyl(0.16, 0.9, '#5f9a4e', 0, 0, 0, { seg: 6 });
      k.cyl(0.11, 0.5, '#5f9a4e', 0.24, 0.35, 0, { seg: 6, rz: -0.5 });
      k.cyl(0.11, 0.45, '#5f9a4e', -0.22, 0.4, 0, { seg: 6, rz: 0.5 });
    });
  });
  for (const [x, z] of [[-6.4, 6.6], [-7.2, 7.4], [-5.5, 7.3]]) P.figure(k, x, z, 2.4, { shirt: C.gold });
  P.flag(k, -6.4, 8.4, 1.6, C.orange);
  rimDecor(k, r, def.seed, 12);
  k.spot(-9, 3, 2.8).spot(-3.8, 3.4, 3.8).spot(0.8, 3, -0.2).spot(-2.8, 2.6, -3.6).spot(3.6, 3, 7.2).spot(9.8, 2.2, 3.2);
  return { dyn, walk: { keepOut: [[0.8, -3.4, 8, 4.5]] } };
}

// ═════════ 溫心守護島：書脊造型的家 + 福星龍一家 + 母親節鳳梨醬 ═════════
function library(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'amber', wall: 2.2, depth: 12 });
  // 書房：書脊造型建築
  k.at(0, 0, -3.2, 0, 1, () => {
    k.box(9, 3.2, 3.8, C.cream, 0, 0, 0, { ao: 0.84 });
    k.roof(4.3, 1.5, 9.6, C.roof2, 0, 3.2, 0, { ry: Math.PI / 2 });
    k.door(0, 0, 2.7);
    for (let i = 0; i < 7; i++) {
      const c = [C.red, C.blue, C.gold, C.teal, C.purple, C.green, C.orange][i];
      k.box(0.86, 2.5, 0.2, c, -3.4 + i * 1.14, 0.2, 2);
      k.box(0.86, 0.14, 0.22, C.paper, -3.4 + i * 1.14, 1.9, 2.02);
    }
    k.box(1.2, 1.6, 0.26, C.wood2, 0, 0, 2.04);
    k.glow(0.9, 0.5, 0.05, C.win, 0, 1.7, 2.18);
  });
  // 福星龍一家：大龍陪小龍
  P.dragon(k, -5.2, 0, 3.6, 0.5, 1.5, P.DRAGON_PINK);
  P.dragon(k, -3.9, 0, 4.6, 0.2, 0.75, P.DRAGON_ROSE);
  P.pond(k, 0.4, 4, 3.3, 2.1);
  // 母親節的鳳梨豆豉醬：一排封好的玻璃罐
  k.at(4.6, 0, 3.6, -0.6, 1, () => {
    k.box(2.4, 0.7, 1, C.wood3, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const x = -0.84 + i * 0.56;
      k.cyl(0.22, 0.5, '#f2c14e', x, 0.7, 0, { seg: 10, wonk: 0 });
      k.cyl(0.24, 0.1, C.red, x, 1.2, 0, { seg: 10, wonk: 0 });
    }
    // 一顆大鳳梨
    k.ball(0.42, '#e8b23a', 1.6, 0.42, 0.3, { detail: 1, sy: 1.25 });
    k.cone(0.3, 0.6, '#5a9b4e', 1.6, 0.86, 0.3, { seg: 5 });
  });
  // 飄浮書櫃
  [[-7.5, 4.6, -6, 0.6], [7.6, 5, -5.6, -0.6]].forEach(([x, y, z, ry]) => k.at(x, y, z, ry, 1, () => {
    k.box(2.2, 2.4, 0.5, C.wood2, 0, 0, 0);
    for (let s = 0; s < 3; s++) for (let i = 0; i < 6; i++) k.box(0.26, 0.56, 0.3, k.pick([C.red, C.blue, C.gold, C.teal, C.green]), -0.8 + i * 0.32, 0.14 + s * 0.74, 0.12);
  }));
  P.bookStack(k, -7.8, 0.6, 6, 1.2);
  P.bookStack(k, 8, 0.2, 5, 1.1);
  k.at(7.4, 0, 3.6, -0.6, 1, () => P.signBoard(k, 0, 0, 0, C.wood3));
  P.lamp(k, -3, 6.6); P.lamp(k, 3.4, 6.8);
  scatterTrees(k, r, 6, [[0, -3.2, 6], [0.4, 4, 4], [-5.2, 3.6, 2], [4.6, 3.4, 2]], [P.tree]);
  rimDecor(k, r, def.seed, 12);
  k.spot(0, 5.4, -3.2).spot(-7.8, 2.4, 0.6).spot(8, 2.2, 0.2).spot(0.4, 2.2, 4);
  return { dyn: [] };
}

// ═════════ 隱形推進島：轉動的工坊齒輪 + 愛心 + 工具箱 ═════════
function teacher(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'amber', wall: 2.2, depth: 12 });
  const dyn = [];
  // 工坊主屋
  k.at(0, 0, -3, 0, 1, () => {
    k.box(7, 2.6, 3.6, '#d9b98a', 0, 0, 0, { ao: 0.84 });
    k.roof(4.2, 1.3, 7.6, '#9c5b3b', 0, 2.6, 0, { ry: Math.PI / 2 });
    k.cyl(0.42, 2, C.brick2, 2.4, 2.8, -0.6, { seg: 6 });
    for (let i = 0; i < 4; i++) k.glow(0.86, 0.9, 0.05, C.win, -2.5 + i * 1.66, 0.74, 1.81);
    k.box(1, 1.5, 0.06, C.wood2, 0, 0, 1.82);
    k.door(0, 0, 2.3);
  });
  // 煙囪上的齒輪
  const gear = (rad, col, sp, x, y, z) => {
    const g = new Kit(2);
    g.add(G.cyl(14), col, { rx: 1.57, sx: rad, sy: 0.2, sz: rad, wonk: 0 });
    for (let i = 0; i < 10; i++) g.add(G.box(), col, { x: Math.cos(i * 0.628) * rad, y: Math.sin(i * 0.628) * rad, rz: i * 0.628, sx: 0.34 * rad, sy: 0.3 * rad, sz: 0.2, wonk: 0 });
    g.add(G.cyl(8), C.ink, { rx: 1.57, sx: rad * 0.3, sy: 0.26, sz: rad * 0.3, wonk: 0 });
    const m = g.build();
    m.position.set(x, y, z);
    dyn.push({ obj: m, update: (t) => { m.children.forEach((c) => { c.rotation.z = t * sp; }); } });
  };
  gear(1.5, '#c9a15b', 0.5, -5.2, 2.7, -1.6);
  gear(1, '#a2692f', -0.75, -3.5, 3.5, -1.5);
  gear(0.8, '#8d97a0', 0.94, 5.2, 3, -1.3);
  // 共備長桌與圍坐老師
  k.at(-5, 0, 3.8, 0.5, 1, () => {
    k.box(3.4, 0.08, 1.3, C.wood3, 0, 0.62, 0);
    k.box(0.14, 0.62, 1, C.wood2, -1.3, 0, 0); k.box(0.14, 0.62, 1, C.wood2, 1.3, 0, 0);
    P.bookStack(k, -0.8, 0, 3, 0.6, 0, 0.7);
    k.box(0.7, 0.03, 0.5, C.paper, 0.6, 0.7, 0);
    for (const [x, z] of [[-1, 0.94], [0, 1], [1, 0.94], [-0.6, -0.94], [0.6, -0.94]]) P.figure(k, x, z, z > 0 ? 3.14 : 0, { shirt: k.pick([C.blue, C.pink, C.teal, C.white, C.orange]), s: 1.25 });
  });
  // 黑板
  k.at(5.2, 0, 3.6, -0.6, 1, () => {
    k.box(3.4, 2.2, 0.16, C.wood2, 0, 0.3, 0);
    k.box(3.1, 1.9, 0.05, '#2f4a3d', 0, 0.45, 0.08, { wonk: 0.004 });
    for (let i = 0; i < 4; i++) k.box(1.8 - i * 0.26, 0.05, 0.02, C.paper, -0.4, 1.8 - i * 0.34, 0.11, { wonk: 0 });
    P.figure(k, 1.9, 0.8, -0.8, { shirt: C.teal, s: 1.3 });
  });
  // 愛心：各方的捐資與補助
  k.at(0.4, 0, 7.4, 0, 1, () => {
    k.cyl(0.7, 0.4, C.stone, 0, 0, 0, { seg: 8 });
    k.ball(0.42, C.red, -0.3, 1.5, 0, { detail: 1, sz: 0.6 });
    k.ball(0.42, C.red, 0.3, 1.5, 0, { detail: 1, sz: 0.6 });
    k.cone(0.62, 0.9, C.red, 0, 0.5, 0, { seg: 4, rx: Math.PI, y: 1.45, sz: 0.4 });
    // 總務的工具箱
    k.box(0.9, 0.42, 0.46, '#c9553b', 1.4, 0, 0.3);
    k.add(G.torus(10, 0.12, 0.5), C.dark, { x: 1.4, y: 0.42, z: 0.3, sx: 0.24, sy: 0.24, sz: 0.24 });
  });
  // 拼圖地磚
  for (const [x, z, c] of [[-1.6, 2.6, C.blue], [-0.6, 3.1, C.red], [0.6, 2.7, C.gold], [1.6, 3.2, C.green]]) k.box(0.9, 0.1, 0.9, c, x, 0, z, { ry: 0.2 });
  scatterTrees(k, r, 6, [[0, -3, 5], [-5, 3.8, 3], [5.2, 3.6, 3], [0.4, 7.4, 1.6]], [P.tree]);
  rimDecor(k, r, def.seed, 10);
  k.spot(-5, 2.6, 3.8).spot(0, 5.2, -3).spot(0.4, 2.2, 7.4).spot(5.2, 3.2, 3.6).spot(-5.2, 4.6, -1.6);
  return { dyn };
}

// ═════════ 璀璨桂冠島：頒獎台 + 獎牌牆 + 柔道墊與棒球 ═════════
function results(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'green', wall: 2.2, depth: 12 });
  const dyn = [];
  // 頒獎台
  k.at(0, 0, 0, 0, 1, () => {
    k.box(2.4, 2, 2.4, C.gold, 0, 0, 0);
    k.door(0, 0, 1.9);
    k.box(2.4, 1.3, 2.4, '#b8c0c8', -2.4, 0, 0.1);
    k.box(2.4, 0.86, 2.4, '#cd8a4f', 2.4, 0, 0.1);
    k.box(0.9, 0.4, 0.06, C.white, 0, 0.9, 1.21);
    // 金色獎盃
    k.at(0, 2, 0, 0, 1.7, () => {
      k.cyl(0.42, 0.2, C.ink, 0, 0, 0, { seg: 8 });
      k.cyl(0.1, 0.5, C.gold, 0, 0.2, 0, { seg: 6 });
      k.cyl(0.26, 0.7, C.gold, 0, 0.7, 0, { rt: 0.56, seg: 10 });
      k.add(G.torus(12, 0.14), C.gold, { x: -0.56, y: 1.1, sx: 0.28, sy: 0.28, sz: 0.28 });
      k.add(G.torus(12, 0.14), C.gold, { x: 0.56, y: 1.1, sx: 0.28, sy: 0.28, sz: 0.28 });
    });
    P.figure(k, -2.4, 0.1, 0, { shirt: C.gold, s: 1 });
    k.at(-2.4, 1.3, 0.1, 0, 1, () => P.figure(k, 0, 0, 0, { shirt: C.blue, s: 1.1 }));
    k.at(2.4, 0.86, 0.1, 0, 1, () => P.figure(k, 0, 0, 0, { shirt: C.red, s: 1.1 }));
  });
  // 旋轉星星
  const star = new Kit(6);
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 6.283 + 1.57, rr = i % 2 ? 0.45 : 1;
    if (i) shape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else shape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const starGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.26, bevelEnabled: false });
  star.add(starGeo.toNonIndexed(), C.gold, { layer: 'glow', wonk: 0, ao: 1 });
  const starM = star.build();
  starM.position.set(0, 7, 0);
  // 閱讀挑戰「天上少了一顆星」：卡關時星星不見，答對後從小變大亮回來
  let shine = 1, want = 1;
  dyn.push({
    obj: starM,
    quest: (m) => { want = m === 'stuck' ? 0 : 1; if (m === 'done') shine = 0.05; },
    update: (t) => {
      shine += (want - shine) * 0.08;
      starM.visible = shine > 0.03;
      starM.scale.setScalar(shine);
      starM.rotation.y = t * 0.8;
      starM.position.y = 7 + Math.sin(t) * 0.3;
    },
  });
  // 書本階梯（閱讀力向上）
  for (let i = 0; i < 7; i++) P.book(k, -8 + i * 0.1, i * 0.42, -4 + i * 0.84, 2.6, 0.42, 1.2, [C.red, C.blue, C.gold, C.teal, C.purple, C.green, C.orange][i], 0.22);
  // 獎牌牆
  k.at(7.4, 0, -3.6, -0.7, 1, () => {
    k.box(3, 4, 0.34, C.wood2, 0, 0.2, 0, { rx: -0.08 });
    k.box(2.7, 3.7, 0.06, C.paper, 0, 0.35, 0.2, { rx: -0.08 });
    for (let i = 0; i < 6; i++) k.cyl(0.36, 0.05, [C.red, C.gold, C.blue, C.green, C.orange, C.purple][i], -0.6 + (i % 2) * 1.2, 1.2 + Math.floor(i / 2) * 0.95, 0.3, { seg: 12, rx: 1.5 });
  });
  // 社團旗海與扶助之手
  P.flag(k, -3, 6.4, 3, C.blue); P.flag(k, 0, 7, 3.6, C.gold); P.flag(k, 3, 6.4, 3, C.red);
  // 運動場上的光：柔道墊與棒球
  k.at(8.4, 0, 3.8, -1, 1, () => {
    k.box(2.6, 0.12, 2.6, C.red, 0, 0, 0, { wonk: 0.004 });
    k.box(2.1, 0.14, 2.1, C.blue, 0, 0, 0, { wonk: 0.004 });
    P.figure(k, -0.4, 0, 1.2, { shirt: C.white, s: 1.1 });
    P.figure(k, 0.4, 0, -1.9, { shirt: C.white, s: 1.1 });
    k.ball(0.26, C.white, 1.8, 0.26, 1.4, { detail: 1 });
    k.cyl(0.07, 1.5, C.wood3, 1.6, 0.05, 0.6, { rt: 0.13, seg: 6, rz: 1.45, y: 0.12 });
  });
  // 扶助：大手牽小手的座位
  k.at(-7.2, 0, 3.8, 0.8, 1, () => {
    k.box(1.8, 0.05, 1, C.wood3, 0, 0.48, 0);
    k.box(0.1, 0.48, 0.8, C.wood2, -0.7, 0, 0); k.box(0.1, 0.48, 0.8, C.wood2, 0.7, 0, 0);
    P.figure(k, -0.34, 0.74, 3.14, { shirt: C.blue, s: 1.3 });
    P.figure(k, 0.42, 0.74, 3.14, { shirt: C.gold, s: 0.95 });
  });
  scatterTrees(k, r, 5, [[0, 0, 6], [-8, 0, 4.6], [7.4, -3.6, 3], [8.4, 3.8, 2.6], [-7.2, 3.8, 2.2], [0, 6.8, 3.6]], [P.tree]);
  rimDecor(k, r, def.seed, 12);
  k.spot(-7.6, 3.6, -1.4).spot(0, 6, 0).spot(7.4, 5, -3.6).spot(-7.2, 2.4, 3.8).spot(8.4, 3.2, 3.8);
  return { dyn };
}

// ═════════ 萌芽歡樂島：森林小屋、蘑菇、彩虹、小農場 ═════════
function forest(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'green', wall: 2.2, depth: 13 });
  // 森林閱讀小屋
  k.at(-1.4, 0, -1.6, 0.18, 1, () => {
    k.box(5.4, 2.1, 3.3, '#7b5a3e', 0, 0.2, 0, { ao: 0.82 });
    for (let i = 0; i < 6; i++) k.box(5.46, 0.05, 3.36, '#684a31', 0, 0.45 + i * 0.34, 0, { wonk: 0 });
    k.roof(4.3, 1.5, 6.4, '#3f7a4e', 0, 2.3, 0, { ry: Math.PI / 2 });
    k.box(5.6, 0.2, 3.8, C.wood2, 0, 0, 0.26);
    k.box(1, 1.5, 0.1, C.wood3, 0, 0.2, 1.68);
    k.door(0, 0, 2.5);
    k.glow(0.8, 0.8, 0.05, C.win, -1.7, 0.9, 1.68);
    k.glow(0.8, 0.8, 0.05, C.win, 1.7, 0.9, 1.68);
    // 彩繪：魔菇、瓢蟲、彩虹、蝴蝶
    [C.red, C.orange, C.gold, C.green, C.blue].forEach((c, i) => k.add(G.torus(16, 0.06, 0.5), c, { x: -1.7, y: 0.3, z: 1.7, sx: 0.78 - i * 0.1, sy: 0.78 - i * 0.1, sz: 0.3, wonk: 0 }));
    k.ball(0.24, C.red, 1.7, 0.56, 1.72, { sz: 0.4 });
  });
  // 蘑菇群
  const mush = (x, z, s, c = C.red) => k.at(x, 0, z, 0, s, () => {
    k.cyl(0.24, 0.7, C.paper, 0, 0, 0, { rt: 0.17, seg: 7 });
    k.add(G.sphere(9, 4), c, { y: 0.7, sx: 0.66, sy: 0.5, sz: 0.66 });
    for (let i = 0; i < 4; i++) k.ball(0.09, C.white, Math.cos(i * 1.57) * 0.34, 1, Math.sin(i * 1.57) * 0.34);
  });
  mush(-7.4, 3.2, 2.1); mush(-5.8, 4.4, 1.3, C.orange); mush(-8.6, 1, 1.5, C.gold); mush(5.6, 6.2, 1.2); mush(-3, 6.6, 1);
  // 彩虹
  [C.red, C.orange, C.gold, C.green, C.blue, C.purple].forEach((c, i) => k.add(G.torus(32, 0.11 / (7 - i) * 3.6, 0.5), c, { x: 6.8, y: 0.1, z: -5, ry: -0.5, sx: 6.2 - i * 0.42, sy: 6.2 - i * 0.42, sz: 0.74 - i * 0.06, wonk: 0, ao: 1 }));
  // 大瓢蟲與蝴蝶
  k.at(-3.2, 0.1, 4.4, 0.4, 1.3, () => {
    k.ball(0.62, C.red, 0, 0.34, 0, { detail: 1, sy: 0.62 });
    k.ball(0.28, C.ink, 0, 0.3, 0.56);
    for (const [x, z] of [[0.3, 0.1], [-0.3, 0.1], [0.24, -0.3], [-0.24, -0.3]]) k.ball(0.09, C.ink, x, 0.68, z);
  });
  // 快樂農場耕讀園
  k.at(6.8, 0, 3.2, -0.3, 1, () => {
    for (let i = 0; i < 4; i++) {
      k.box(4, 0.26, 0.74, '#6b4a31', 0, 0, -1.5 + i);
      for (let j = 0; j < 8; j++) {
        if (i === 1) { k.cone(0.14, 0.3, C.orange, -1.6 + j * 0.46, 0.2, -0.5, { seg: 5, rx: Math.PI, y: 0.3 }); k.ball(0.13, '#7fb04f', -1.6 + j * 0.46, 0.5, -0.5, { sway: 0.4 }); } else k.ball(0.18, i % 2 ? '#8cbf55' : '#6fa548', -1.6 + j * 0.46, 0.38, -1.5 + i, { sway: 0.4 });
      }
    }
    P.fence(k, -2.2, -2.1, 2.2, -2.1);
    P.fence(k, 2.3, -2.1, 2.3, 2);
    k.box(0.1, 1.5, 0.1, C.wood2, -2.8, 0, 0.6);
    k.box(0.8, 0.09, 0.09, C.wood2, -2.8, 1.1, 0.6);
    k.cone(0.34, 0.3, '#d8bc6e', -2.8, 1.5, 0.6, { seg: 8 });
    k.ball(0.17, C.paper, -2.8, 1.4, 0.6);
  });
  // 環保小尖兵的資源回收站：三個分類桶與一疊再生紙
  k.at(1.6, 0, 7, -0.1, 1, () => {
    [[-0.7, C.blue], [0, C.green], [0.7, C.gold]].forEach(([x, c]) => {
      k.cyl(0.3, 0.9, c, x, 0, 0, { seg: 10 });
      k.cyl(0.33, 0.1, C.white, x, 0.9, 0, { seg: 10 });
    });
    for (let i = 0; i < 4; i++) k.box(0.7, 0.05, 0.5, i % 2 ? '#e9dcc0' : '#d9c8a4', 1.5, i * 0.06, 0.1, { ry: i * 0.15 });
  });
  // 親子共讀
  for (const [x, z, s] of [[-0.8, 3.8, 1.2], [-0.2, 4.1, 0.86], [2.6, 2.8, 1.2], [3.2, 3.1, 0.86]]) P.figure(k, x, z, 0.4, { sit: s < 1, shirt: s < 1 ? C.gold : C.teal, s });
  [[-10, -3, 1], [-8.5, -6.4, 1.3], [-4.8, -8.6, 1.2], [-0.8, -9.8, 1.3], [3, -9.2, 1], [10, -1.6, 1]].forEach(([x, z, s]) => { if (!nearGate(k, x, z)) P.tree(k, x, z, s); });
  [[-11.2, 0, 1], [-6.4, -8.4, 1.2], [1, -8, 1.1], [-3.5, -7, 1], [-9.8, -5, 1.1]].forEach(([x, z, s]) => { if (!nearGate(k, x, z)) P.pine(k, x, z, s); });
  P.flowers(k, -4, 7.6, 12, 1.4); P.flowers(k, 5.6, 8, 10, 1.2); P.flowers(k, -8.6, 6.4, 10, 1.2);
  rimDecor(k, r, def.seed, 8);
  k.spot(-1.4, 5, -1.6).spot(1.6, 3, 7).spot(-7.4, 3.2, 3.2).spot(6.8, 2.4, 3.2);
  return { dyn: [] };
}

// ═════════ 寰宇交會島：飛艇繫泊塔 + 風車 + 地球儀 ═════════
function brand(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'teal', wall: 2.4, depth: 11 });
  const dyn = [];
  // 飛艇繫泊塔
  k.at(-1, 0, -2, 0, 1, () => {
    k.cyl(1.6, 0.4, C.stone, 0, 0, 0, { seg: 8 });
    k.door(0, 0, 2.1);
    for (let i = 0; i < 4; i++) {
      const a = 0.785 + i * 1.57;
      k.box(0.16, 5.6, 0.16, C.wood2, Math.cos(a) * 0.72, 0.3, Math.sin(a) * 0.72);
    }
    for (let i = 1; i < 5; i++) k.box(1.7, 0.1, 1.7, C.wood, 0, 0.4 + i * 1.1, 0);
    k.box(2.2, 0.16, 2.2, C.wood3, 0, 5.9, 0);
  });
  // 風車（風信）
  k.at(6.6, 0, -2.4, -0.4, 1, () => {
    k.cyl(1.2, 3.4, C.cream, 0, 0, 0, { rt: 0.8, seg: 8, ao: 0.84 });
    k.cone(1, 0.9, C.roof, 0, 3.4, 0, { seg: 8 });
    k.box(0.5, 0.86, 0.05, C.wood2, 0, 0, 1.17);
  });
  const blade = new Kit(7);
  for (let i = 0; i < 4; i++) {
    blade.add(G.box(), C.paper, { x: Math.cos(i * 1.57) * 1.5, y: Math.sin(i * 1.57) * 1.5, rz: i * 1.57, sx: 2.4, sy: 0.5, sz: 0.04, wonk: 0 });
    blade.add(G.box(), C.wood2, { x: Math.cos(i * 1.57) * 1.5, y: Math.sin(i * 1.57) * 1.5, rz: i * 1.57, sx: 2.8, sy: 0.07, sz: 0.08, wonk: 0 });
  }
  const bladeM = blade.build();
  bladeM.position.copy(new THREE.Vector3(6.1, 3.5, -1.1));
  bladeM.rotation.y = -0.4;
  dyn.push({ obj: bladeM, update: (t, env) => { bladeM.children.forEach((c) => { c.rotation.z = t * (0.5 + env.wind * 0.08); }); } });
  // 郵筒與傳聲筒
  k.at(-5.4, 0, 3.4, 0.5, 1, () => {
    k.cyl(0.42, 1.2, C.red, 0, 0, 0, { seg: 10 });
    k.add(G.sphere(10, 4), C.red, { y: 1.2, sx: 0.42, sy: 0.3, sz: 0.42 });
    k.box(0.4, 0.05, 0.03, C.ink, 0, 0.86, 0.42);
    // 地球儀：與地球村做朋友
    k.at(1.9, 0, 0.2, 0, 1, () => {
      k.cyl(0.4, 0.14, C.wood2, 0, 0, 0, { seg: 8 });
      k.box(0.1, 0.9, 0.1, C.wood2, 0, 0.14, 0);
      k.ball(0.62, C.blue, 0, 1.62, 0, { detail: 2, wonk: 0 });
      [[0.3, 1.9, 0.42], [-0.4, 1.5, 0.38], [0.1, 1.3, -0.5], [-0.2, 2, -0.3]].forEach(([x, y, z]) => k.ball(0.24, C.green, x, y, z, { sy: 0.6, wonk: 0 }));
      k.add(G.torus(20, 0.05, 0.6), C.gold, { y: 1.62, sx: 0.78, sy: 0.78, sz: 0.78, rz: 0.4 });
    });
  });
  // 看板牆
  k.at(3.4, 0, 3.6, -0.3, 1, () => {
    k.box(3.2, 1.8, 0.14, C.wood3, 0, 0.5, 0);
    k.box(1.3, 1.5, 0.03, C.paper, -0.74, 0.64, 0.08, { wonk: 0.008 });
    k.box(1.3, 0.7, 0.03, C.sky, 0.74, 1.44, 0.08, { wonk: 0.008 });
    k.box(1.3, 0.7, 0.03, C.gold, 0.74, 0.64, 0.08, { wonk: 0.008 });
    k.box(0.14, 0.5, 0.14, C.wood2, -1.4, 0, 0); k.box(0.14, 0.5, 0.14, C.wood2, 1.4, 0, 0);
  });
  // 讀書會圍坐
  for (let i = 0; i < 6; i++) { const a = i * 1.047; P.figure(k, -1 + Math.cos(a) * 1.1, 5.4 + Math.sin(a) * 1.1, -a - 1.57, { sit: true, shirt: k.pick([C.teal, C.pink, C.white, C.gold]) }); }
  k.cyl(0.42, 0.28, C.wood, -1, 0, 5.4, {});
  scatterTrees(k, r, 5, [[-1, -2, 3], [6.6, -2.4, 3], [3.4, 3.6, 2.6], [-5.4, 3.4, 3], [-1, 5.4, 2.2]], [P.tree]);
  rimDecor(k, r, def.seed, 10);
  k.spot(-5.4, 2.8, 3.4).spot(-1, 3, 5.4).spot(6.6, 5.4, -2.4);
  return { dyn, moor: new THREE.Vector3(-1, 8.3, -2) };
}

// ═════════ 乘風蛻變島：曙光拱門 + 畢業帽 + 新苗園 ═════════
function future(k, def) {
  const r = def.r;
  makeBase(k, { r, seed: def.seed, palette: 'amber', wall: 2, depth: 16 });
  const dyn = [];
  // 曙光拱門：畢業生從這裡出發；拱門頂端戴著畢業帽
  k.at(0, 0, -2.4, 0, 1, () => {
    k.cyl(4, 0.5, C.stone, 0, 0, 0, { seg: 14 });
    k.door(0, 0, 4.5);
    k.add(G.torus(28, 0.16, 0.5), C.orange, { y: 0.5, sx: 3.2, sy: 3.2, sz: 3.2, ao: 0.9 });
    k.add(G.torus(28, 0.14, 0.5), C.gold, { y: 0.5, sx: 2.5, sy: 2.5, sz: 2.5, ao: 0.9 });
    k.add(G.torus(28, 0.12, 0.5), '#f6d27a', { y: 0.5, sx: 1.85, sy: 1.85, sz: 1.85, ao: 0.9 });
    for (const s of [-1, 1]) k.box(0.7, 0.3, 0.9, C.stone2, s * 3.2, 0.5, 0);
    // 畢業帽
    k.at(0, 4.1, 0, 0.5, 1, () => {
      k.cyl(0.5, 0.36, C.dark, 0, 0, 0, { seg: 10 });
      k.box(1.5, 0.08, 1.5, C.dark, 0, 0.36, 0);
      k.box(0.05, 0.5, 0.05, C.gold, 0.7, -0.1, 0.7);
    });
    // 綠色新芽
    k.cyl(0.12, 1.4, C.green, 0, 0.5, 0, { seg: 6 });
    k.ball(0.5, C.green, -0.4, 2, 0, { detail: 1, sx: 1, sy: 0.5, sz: 0.56, rz: 0.6 });
    k.ball(0.5, '#7fb04f', 0.4, 2, 0, { detail: 1, sx: 1, sy: 0.5, sz: 0.56, rz: -0.6 });
  });
  // 望遠鏡與羅盤
  k.at(-6.4, 0, 2.6, 0.5, 1, () => {
    for (let i = 0; i < 3; i++) k.add(G.box(), C.wood2, { x: Math.cos(i * 2.09) * 0.3, y: 0.6, z: Math.sin(i * 2.09) * 0.3, sx: 0.08, sy: 1.25, sz: 0.08, rx: Math.sin(i * 2.09) * 0.38, rz: -Math.cos(i * 2.09) * 0.38 });
    k.add(G.cyl(10, 0.7), C.gold, { y: 1.5, sx: 0.28, sy: 1.8, sz: 0.28, rx: 1.0, rz: 0.3 });
  });
  // 新苗園：一排排小樹（前人種樹，後人乘涼）
  for (let i = 0; i < 8; i++) {
    const x = 2.6 + (i % 4) * 1.4, z = 3 + Math.floor(i / 4) * 1.7;
    k.at(x, 0, z, 0, 0.4 + i * 0.09, () => { P.tree(k, 0, 0, 1); });
  }
  P.bookStack(k, -2.4, 5.4, 6, 1.2);
  P.lamp(k, -4.4, 6); P.lamp(k, 0.4, 6.8);
  rimDecor(k, r, def.seed, 12);
  k.spot(0, 9.6, -2.4).spot(-6.4, 3.4, 2.6).spot(5, 3.4, 4);
  return { dyn };
}

const builders = { core, inquiry, walk, library, teacher, results, forest, brand, future };

export function buildIsland(def, gates = []) {
  const k = new Kit(def.seed * 97 + 13);
  k.gates = gates;
  const info = builders[def.id](k, def);
  const group = new THREE.Group();
  const terrain = k.build();
  group.add(terrain);
  (info.dyn || []).forEach((d) => group.add(d.obj));
  // 懸浮碎石
  const rocks = new Kit(def.seed + 200);
  const n = Math.round(def.r / 3);
  const pal = ['#8fb24f', '#7ea650'];
  for (let i = 0; i < n; i++) {
    const a = rocks.rand(6.283), rr = def.r * rocks.rand(1.16, 1.42);
    floatingRock(rocks, Math.cos(a) * rr, rocks.rand(-7, 1.5), Math.sin(a) * rr, rocks.rand(0.55, 1.2), rocks.pick(pal), '#94795a');
  }
  const rocksMesh = rocks.build();
  group.add(rocksMesh);
  return { group, terrain, rocks: rocksMesh, anchors: k.anchors, doors: k.doors, dyn: info.dyn || [], walk: info.walk, moor: info.moor };
}
