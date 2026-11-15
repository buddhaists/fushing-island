// 主題小場景：每張卡片在島上對應一個「看得出內容」的小地標，多數會動（第二層選單點選後鏡頭會飛到這裡）
// 每個函式都在島內座標 (x, z)、地面高度 y0 畫出靜態零件，會動的零件用 animated() 放進 dyn
import * as THREE from 'three';
import { Kit, G } from './kit.js';
import * as P from './props.js';

const { C } = P;

// 會動的物件：build 在原點畫好零件，pos 是島內座標，anim(m, t, base, env) 每一格更新
export function animated(dyn, pos, build, anim, { ry = 0, scale = 1, seed = 9 } = {}) {
  const kk = new Kit(seed);
  build(kk);
  const m = kk.build();
  m.position.copy(pos);
  m.rotation.y = ry;
  m.scale.setScalar(scale);
  const base = { pos: m.position.clone(), ry, scale };
  dyn.push({ obj: m, update: (t, env) => anim(m, t, base, env) });
  return m;
}

// 一次跳躍：週期 period 秒裡，前 dur 秒跳起來（0→1→0），其餘時間是 0
export const hopAt = (t, period, dur, phase = 0) => {
  const u = ((t + phase) % period) / dur;
  return u < 1 ? Math.sin(u * Math.PI) : 0;
};
export const spinAt = (t, period, dur, phase = 0) => {
  const u = ((t + phase) % period) / dur;
  return u < 1 ? (1 - (1 - u) ** 3) * Math.PI * 2 : 0;
};

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const kid = (k, x, z, ry, shirt, s = 1.25, y = 0) => k.at(x, y, z, 0, 1, () => P.figure(k, 0, 0, ry, { shirt, s }));

// ───────── 初心啟航島 ─────────
// 校長的話：月光下讀書的孩子（坦尚尼亞博士生的故事），彎月在頭上輕輕浮動、星星閃爍
export function moonReading(k, dyn, x, z, y0) {
  k.at(x, y0, z, 0.4, 1, () => {
    k.box(2.2, 0.08, 1.4, '#3d5a80', 0, 0, 0, { wonk: 0.005 });
    k.at(0, 0.08, 0, 0, 1, () => P.figure(k, 0, 0, 0, { shirt: C.white, sit: true, s: 1.5 }));
    P.book(k, 0, 0.5, 0.32, 0.5, 0.06, 0.36, C.red, 0);
    k.box(0.12, 0.7, 0.12, C.dark, -0.8, 0.08, -0.3);
  });
  animated(dyn, V(x, y0 + 5.2, z), (kk) => {
    kk.add(G.torus(20, 0.32, 0.6), '#ffe9a8', { layer: 'glow', sx: 0.9, sy: 0.9, sz: 0.9, rz: 2.4 });
    [[1.4, 0.6, 0.3], [-1.3, 0.9, -0.2], [0.9, -0.9, 0.4], [-0.8, -1.1, 0], [1.9, -0.2, -0.3]].forEach(([a, b, c]) => kk.add(G.ico(0), '#fff6cf', { x: a, y: b, z: c, sx: 0.09, sy: 0.09, sz: 0.09, layer: 'glow' }));
  }, (m, t, b) => { m.position.y = b.pos.y + Math.sin(t * 0.8) * 0.25; m.rotation.y = Math.sin(t * 0.3) * 0.4; });
}

// 家長會長的祝福：帶著光出發——一盞盞天燈從台上冉冉升起
export function skyLanterns(k, dyn, x, z, y0) {
  k.at(x, y0, z, 0, 1, () => {
    k.cyl(1.1, 0.3, C.stone, 0, 0, 0, { seg: 10 });
    kid(k, -0.5, 0.2, 0.3, C.sky, 1.3, 0.3);
    kid(k, 0.5, 0.1, -0.3, C.white, 1.3, 0.3);
  });
  [0, 2.2, 4.4].forEach((ph, i) => {
    animated(dyn, V(x, y0 + 1, z), (kk) => {
      kk.box(0.5, 0.65, 0.5, '#ffb04a', 0, 0, 0, { layer: 'glow' });
      kk.box(0.54, 0.06, 0.54, '#c8553d', 0, 0.65, 0);
    }, (m, t, b) => {
      const u = ((t + ph) % 6.6) / 6.6;
      m.position.set(b.pos.x + Math.sin(t * 0.9 + i) * 0.6 * u, b.pos.y + u * 9, b.pos.z + Math.cos(t * 0.7 + i) * 0.6 * u);
      m.scale.setScalar(u < 0.1 ? u * 10 : u > 0.85 ? (1 - u) / 0.15 : 1);
      m.rotation.y = t * 0.5 + i;
    });
  });
}

// ───────── 寰宇交會島 ─────────
// 國際柑仔店：小店長在櫃台後面，一枚「龍銀」在店長和顧客之間飛來飛去
export function shopStall(k, dyn, x, z) {
  k.at(x, 0, z, 0, 1, () => {
    k.box(2.2, 0.9, 0.9, C.wood3, 0, 0, 0);
    for (let i = 0; i < 4; i++) k.box(0.55, 0.12, 1.2, i % 2 ? C.white : C.red, -0.83 + i * 0.55, 2, -0.1, { rx: 0.18 });
    for (const sx of [-1, 1]) k.box(0.08, 2, 0.08, C.wood2, sx * 1.05, 0, -0.45);
    [[C.gold, -0.7], [C.teal, -0.25], [C.pink, 0.2], [C.blue, 0.65]].forEach(([c, px]) => k.box(0.32, 0.3, 0.3, c, px, 0.9, 0.05));
    kid(k, 0, -0.85, 0, C.teal, 1.3);
    kid(k, 0.2, 1.4, Math.PI, C.white, 1.2);
  });
  animated(dyn, V(x, 1.2, z), (kk) => kk.cyl(0.18, 0.05, C.gold, 0, 0, 0, { seg: 12, rx: Math.PI / 2 }), (m, t, b) => {
    const u = (t % 2.4) / 2.4, s = Math.sin(u * Math.PI);
    m.position.set(b.pos.x + 0.1, b.pos.y + 0.4 + s * 1.2, b.pos.z - 0.7 + (u < 0.5 ? u * 2 : (1 - u) * 2) * 1.9);
    m.rotation.x = t * 8;
  });
}

// 走進埃及生活：沙地上的金字塔、椰子樹，桌上一碗碗米布丁冒著香氣
export function egyptCorner(k, dyn, x, z) {
  k.at(x, 0, z, 0.3, 1, () => {
    k.cyl(1.9, 0.08, '#e8cf94', 0, 0, 0, { seg: 14, sz: 1.3 });
    k.cone(1.25, 1.6, '#d9b56a', -0.4, 0.08, -0.3, { seg: 4, ry: 0.78 });
    k.cyl(0.08, 1.6, C.trunk, 1.1, 0.08, -0.5, { seg: 5, rz: 0.12 });
    for (let i = 0; i < 5; i++) k.add(G.cone(3), C.green, { x: 1.25 + Math.cos(i * 1.26) * 0.45, y: 1.72, z: -0.5 + Math.sin(i * 1.26) * 0.45, sx: 0.18, sy: 0.7, sz: 0.06, rx: Math.PI / 2 + 0.5, ry: -i * 1.26, sway: 0.6 });
    k.box(1.1, 0.5, 0.6, C.wood3, 0.5, 0.08, 0.9);
    for (let i = 0; i < 3; i++) k.cyl(0.13, 0.12, C.white, 0.15 + i * 0.35, 0.58, 0.9, { seg: 10, rt: 1.2 });
  });
  animated(dyn, V(x + 0.5, 0.85, z + 0.9), (kk) => [-0.35, 0, 0.35].forEach((px) => kk.ball(0.07, '#ffffff', px, 0, 0)), (m, t, b) => {
    const u = (t * 0.5) % 1;
    m.position.y = b.pos.y + u * 0.8;
    m.scale.setScalar(1 - u);
  });
}

// 菲律賓的朋友來了：「十二生肖—馬與羊」黏土作品在轉盤上慢慢轉，旁邊陶笛迎賓
export function clayHorseGoat(k, dyn, x, z) {
  k.at(x, 0, z, 0.6, 1, () => {
    k.box(2.2, 0.7, 1, C.wood3, 0, 0, 0);
    kid(k, -1.4, 0.4, 0.8, C.sky, 1.25);
    kid(k, 1.4, 0.3, -0.8, C.white, 1.25);
  });
  animated(dyn, V(x, 0.72, z), (kk) => {
    kk.cyl(0.9, 0.08, C.stone2, 0, 0, 0, { seg: 14 });
    // 馬：棕色
    kk.at(-0.4, 0.08, 0, 0, 0.9, () => {
      kk.box(0.7, 0.32, 0.28, '#8a5a3a', 0, 0.3, 0);
      for (const [px, pz] of [[-0.25, -0.1], [0.25, -0.1], [-0.25, 0.1], [0.25, 0.1]]) kk.box(0.08, 0.3, 0.08, '#6d4528', px, 0, pz);
      kk.box(0.18, 0.4, 0.18, '#8a5a3a', 0.36, 0.5, 0, { rz: -0.4 });
      kk.box(0.3, 0.15, 0.16, '#8a5a3a', 0.5, 0.78, 0);
      kk.box(0.06, 0.3, 0.2, C.ink, 0.28, 0.62, 0, { rz: -0.4 });
    });
    // 羊：白色、捲捲的毛
    kk.at(0.45, 0.08, 0.05, 0, 0.9, () => {
      kk.ball(0.3, '#f6f1e6', 0, 0.42, 0, { detail: 1, sx: 1.2 });
      for (const [px, pz] of [[-0.18, -0.1], [0.18, -0.1], [-0.18, 0.1], [0.18, 0.1]]) kk.box(0.07, 0.25, 0.07, C.ink, px, 0, pz);
      kk.ball(0.15, C.ink, 0.36, 0.55, 0, { sx: 1.2 });
      for (const sz of [-1, 1]) kk.add(G.torus(8, 0.35, 0.7), '#c9b48c', { x: 0.3, y: 0.62, z: sz * 0.1, sx: 0.08, sy: 0.08, sz: 0.08 });
    });
  }, (m, t) => { m.rotation.y = t * 0.4; });
}

// 馬來西亞之旅：吉隆坡雙子星塔，塔頂的燈一閃一閃
export function twinTowers(k, dyn, x, z) {
  k.at(x, 0, z, -0.4, 1, () => {
    k.cyl(1.6, 0.25, C.stone, 0, 0, 0, { seg: 12, sz: 0.8 });
    for (const sx of [-1, 1]) {
      const tx = sx * 0.7;
      [[0.42, 2.2], [0.36, 1.4], [0.3, 1], [0.22, 0.7], [0.14, 0.5]].reduce((y, [r, h]) => { k.cyl(r, h, '#c9d3dc', tx, y, 0, { seg: 8, rt: r * 0.92 }); return y + h; }, 0.25);
      for (let i = 0; i < 6; i++) k.glow(0.05, 0.6, 0.86 * 0.42, C.win, tx + 0.36, 0.5 + i * 0.75, 0, { sx: 1 });
      k.cyl(0.03, 1.1, C.metal, tx, 6.05, 0, { seg: 4 });
    }
    k.box(1, 0.16, 0.22, C.metal, 0, 2.6, 0);
  });
  animated(dyn, V(x, 7.15, z), (kk) => {
    kk.ball(0.09, '#ff5a4a', 0.54, 0, 0.45, { layer: 'glow' });
    kk.ball(0.09, '#ff5a4a', -0.54, 0, -0.45, { layer: 'glow' });
  }, (m, t) => { m.scale.setScalar(Math.sin(t * 4) > 0 ? 1.4 : 0.6); });
}

// ───────── 秘境踏查島 ─────────
// 澎湖採蛤蜊：沙灘上的貝殼和水桶，蛤蜊一開一闔，孩子蹲著找寶藏
export function clamBeach(k, dyn, x, z) {
  k.at(x, 0, z, 0.2, 1, () => {
    k.cyl(1.7, 0.07, '#efd9a6', 0, 0, 0, { seg: 14, sz: 1.2 });
    [[0.7, 0.5, C.pink], [-0.6, 0.7, C.white], [0.2, -0.8, '#f4c7a1'], [-0.9, -0.3, C.white]].forEach(([px, pz, c]) => k.ball(0.14, c, px, 0.1, pz, { sy: 0.45 }));
    k.cyl(0.26, 0.38, C.blue, 0.9, 0.07, -0.5, { seg: 10, rt: 1.25 });
    k.at(-0.4, 0.07, 0.2, 0, 1, () => P.figure(k, 0, 0, 0.6, { shirt: C.sky, sit: true, s: 1.4 }));
  });
  animated(dyn, V(x + 0.3, 0.12, z + 0.15), (kk) => {
    kk.add(G.sphere(10, 5), '#d9c3a0', { sx: 0.3, sy: 0.14, sz: 0.24 });
  }, (m, t) => { m.rotation.x = -Math.max(0, Math.sin(t * 2)) * 0.6; });
}

// AI 時代的領航者：一顆大晶片在展示台上發光，穿黑色皮衣的人在介紹
export function aiChip(k, dyn, x, z) {
  k.at(x, 0, z, 0.5, 1, () => {
    k.box(1.6, 0.5, 1.2, C.dark, 0, 0, 0);
    k.box(1.3, 0.08, 1.3, '#2f6b4f', 0, 0.5, 0, { rx: -0.35 });
    for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) k.box(0.06, 0.04, 0.16, C.gold, -0.5 + i * 0.2, 0.62, sx * 0.7, { rx: -0.35 });
    k.at(1.2, 0, -0.3, -0.6, 1.35, () => { P.figure(k, 0, 0, 0, { shirt: '#1e1e22' }); });
  });
  animated(dyn, V(x, 0.72, z), (kk) => kk.box(0.6, 0.08, 0.6, '#8fe0f0', 0, 0, 0, { layer: 'glow', rx: -0.35 }), (m, t) => {
    m.scale.setScalar(0.85 + Math.max(0, Math.sin(t * 3)) * 0.25);
  }, { ry: 0.5 });
}

// 食農教育：小菜園裡一排排菜苗，孩子拿著澆水壺澆水，水滴一直落下
export function veggieGarden(k, dyn, x, z) {
  k.at(x, 0, z, -0.3, 1, () => {
    for (let r = 0; r < 3; r++) {
      k.box(2.6, 0.2, 0.55, '#6b4a31', 0, 0, -0.7 + r * 0.7);
      for (let j = 0; j < 5; j++) k.ball(0.16, r === 1 ? C.orange : '#7fb04f', -1 + j * 0.5, 0.3, -0.7 + r * 0.7, { sway: 0.4 });
    }
    kid(k, 1.7, 0.2, -1.4, C.green, 1.3);
  });
  animated(dyn, V(x + 1.35, 0.95, z + 0.55), (kk) => {
    kk.cyl(0.14, 0.22, C.teal, 0, 0, 0, { seg: 8 });
    kk.cyl(0.03, 0.35, C.teal, -0.18, 0.12, 0, { seg: 4, rz: 1.1 });
  }, (m, t) => { m.rotation.z = 0.35 + Math.sin(t * 1.5) * 0.15; }, { ry: -0.3 });
  animated(dyn, V(x + 1, 0.8, z + 0.65), (kk) => [0, 0.12, -0.1].forEach((dx, i) => kk.ball(0.04, C.water, dx, -i * 0.2, i * 0.05)), (m, t, b) => {
    const u = (t * 1.6) % 1;
    m.position.y = b.pos.y - u * 0.6;
    m.scale.setScalar(1 - u * 0.5);
  });
}

// ───────── 溫心守護島 ─────────
// 爸爸像什麼？——「爸爸像鬧鐘」：大鬧鐘每隔一陣子就叮鈴鈴搖起來，爸爸抱著孩子
export function alarmClock(k, dyn, x, z) {
  k.at(x, 0, z, -0.6, 1, () => {
    k.at(-0.9, 0, 0.4, 0.5, 1.5, () => P.figure(k, 0, 0, 0, { shirt: C.blue }));
    k.at(-0.6, 0.55, 0.55, 0.5, 1.05, () => P.figure(k, 0, 0, 0, { shirt: C.white }));
  });
  animated(dyn, V(x + 0.4, 0, z - 0.2), (kk) => {
    for (const sx of [-1, 1]) kk.box(0.08, 0.3, 0.08, C.dark, sx * 0.35, 0, 0);
    kk.cyl(0.62, 0.32, C.red, 0, 0.75, 0, { seg: 16, rx: Math.PI / 2 });
    kk.cyl(0.52, 0.04, C.white, 0, 0.75, 0.17, { seg: 16, rx: Math.PI / 2 });
    kk.box(0.04, 0.36, 0.03, C.ink, 0, 0.88, 0.2);
    kk.box(0.26, 0.04, 0.03, C.ink, 0.1, 0.75, 0.2);
    for (const sx of [-1, 1]) kk.ball(0.22, C.gold, sx * 0.4, 1.42, 0, { sy: 0.7 });
  }, (m, t, b) => {
    const ring = hopAt(t, 5, 1.2);
    m.rotation.z = Math.sin(t * 40) * 0.12 * ring;
    m.position.y = b.pos.y + ring * 0.12 * Math.abs(Math.sin(t * 30));
  }, { ry: -0.6 });
}

// 媽媽，妳是我的指南針：地上的大指南針，指針左右擺動再停在北方
export function compass(k, dyn, x, z) {
  k.at(x, 0, z, 0, 1, () => {
    k.cyl(1.3, 0.18, C.wood3, 0, 0, 0, { seg: 20 });
    k.cyl(1.15, 0.04, C.paper, 0, 0.18, 0, { seg: 20 });
    for (let i = 0; i < 4; i++) k.box(0.08, 0.03, 0.3, i ? C.ink : C.red, Math.sin(i * Math.PI / 2) * 0.95, 0.22, -Math.cos(i * Math.PI / 2) * 0.95, { ry: i * Math.PI / 2 });
    kid(k, -1.7, 0.6, 0.8, C.pink, 1.45);
    kid(k, -1.2, 1.1, 0.8, C.sky, 1.05);
  });
  animated(dyn, V(x, 0.26, z), (kk) => {
    kk.cone(0.14, 0.8, C.red, 0, 0, -0.4, { seg: 4, rx: -Math.PI / 2, sz: 0.4 });
    kk.cone(0.14, 0.8, C.metal, 0, 0, 0.4, { seg: 4, rx: Math.PI / 2, sz: 0.4 });
    kk.cyl(0.08, 0.06, C.gold, 0, -0.02, 0, { seg: 8 });
  }, (m, t) => { const u = t % 6; m.rotation.y = u < 3 ? Math.sin(u * 5) * (3 - u) * 0.35 : 0; });
}

// 魔術師媽媽：魔術帽每隔幾秒變出一隻小白兔，星光繞著帽子轉
export function magicHat(k, dyn, x, z) {
  k.at(x, 0, z, 0.3, 1, () => {
    k.cyl(0.9, 0.18, '#7a5a9c', 0, 0, 0, { seg: 14 });
    k.cyl(0.62, 0.05, C.ink, 0, 0.18, 0, { seg: 14 });
    k.cyl(0.38, 0.75, C.ink, 0, 0.22, 0, { seg: 14 });
    k.cyl(0.39, 0.12, C.red, 0, 0.32, 0, { seg: 14 });
    k.at(1.1, 0, 0.2, -1.2, 1.45, () => P.figure(k, 0, 0, 0, { shirt: '#7a5a9c' }));
  });
  animated(dyn, V(x, 0.7, z), (kk) => {
    kk.ball(0.22, C.white, 0, 0.1, 0, { detail: 1 });
    for (const sx of [-1, 1]) kk.ball(0.07, C.white, sx * 0.08, 0.42, 0, { sy: 2.4 });
    for (const sx of [-1, 1]) kk.ball(0.03, C.ink, sx * 0.08, 0.14, 0.2, {});
  }, (m, t, b) => {
    const h = hopAt(t, 4, 1.6);
    m.position.y = b.pos.y - 0.4 + h * 1.1;
    m.scale.setScalar(h > 0.02 ? 1 : 0.001);
  });
  animated(dyn, V(x, 1.4, z), (kk) => {
    for (let i = 0; i < 6; i++) kk.add(G.ico(0), '#ffe9a8', { x: Math.cos(i * 1.05) * 0.8, y: Math.sin(i * 2.1) * 0.25, z: Math.sin(i * 1.05) * 0.8, sx: 0.08, sy: 0.08, sz: 0.08, layer: 'glow' });
  }, (m, t) => { m.rotation.y = t * 1.5; });
}

// 我最敬佩的人：媽媽——媽媽牽著孩子，頭上一顆愛心跳動
export function momAndKid(k, dyn, x, z) {
  k.at(x, 0, z, 0.6, 1, () => {
    k.at(0, 0, 0, 0, 1.55, () => P.figure(k, 0, 0, 0, { shirt: C.pink }));
    k.at(0.5, 0, 0.1, 0, 1.05, () => P.figure(k, 0, 0, 0, { shirt: C.sky }));
    k.box(0.4, 0.06, 0.06, C.skin, 0.25, 0.55, 0.05);
  });
  animated(dyn, V(x + 0.2, 2.1, z), (kk) => {
    kk.ball(0.18, '#ff6b8a', -0.11, 0.06, 0, { detail: 1, sz: 0.6 });
    kk.ball(0.18, '#ff6b8a', 0.11, 0.06, 0, { detail: 1, sz: 0.6 });
    kk.cone(0.26, 0.32, '#ff6b8a', 0, -0.28, 0, { seg: 4, rx: Math.PI, y: 0.04, sz: 0.4 });
  }, (m, t, b) => {
    const u = (t * 1.1) % 1;
    m.scale.setScalar(1 + Math.max(0, Math.sin(u * Math.PI * 4)) * (u < 0.5 ? 0.2 : 0));
    m.position.y = b.pos.y + Math.sin(t) * 0.1;
    m.rotation.y = t * 0.6;
  });
}

// 我的家人：爺爺帶全家放風箏——風箏在溫心之家上空飛
export function kite(k, dyn, x, z) {
  animated(dyn, V(x, 6.5, z), (kk) => {
    kk.add(G.ico(0), C.red, { sx: 0.55, sy: 0.75, sz: 0.05 });
    kk.add(G.ico(0), C.gold, { sx: 0.3, sy: 0.4, sz: 0.06 });
    for (let i = 0; i < 4; i++) kk.box(0.12, 0.06, 0.02, [C.blue, C.gold, C.green, C.pink][i], 0.05 * i, -0.85 - i * 0.25, 0, { rz: i % 2 ? 0.4 : -0.4 });
  }, (m, t, b, env) => {
    const w = Math.min(env?.wind || 8, 30) / 30;
    m.position.set(b.pos.x + Math.sin(t * 0.6) * 1.2, b.pos.y + Math.sin(t * 0.9) * 0.5, b.pos.z + Math.cos(t * 0.5) * 0.6);
    m.rotation.z = Math.sin(t * 1.4) * (0.25 + w * 0.3);
  });
}

// ───────── 璀璨桂冠島 ─────────
// 生活競賽與模範生：披著紅綵帶的模範生站在小台上，整潔、秩序、禮貌三顆星繞著轉
export function modelStudent(k, dyn, x, z) {
  k.at(x, 0, z, 0.6, 1, () => {
    k.cyl(0.7, 0.45, C.gold, 0, 0, 0, { seg: 10 });
    k.at(0, 0.45, 0, 0, 1.45, () => P.figure(k, 0, 0, 0, { shirt: C.white }));
    k.box(0.06, 0.5, 0.36, C.red, 0, 0.95, 0.02, { rx: 0.6, rz: 0.4 });
  });
  animated(dyn, V(x, 2.1, z), (kk) => {
    [C.green, C.blue, C.gold].forEach((c, i) => {
      const s = new THREE.Shape();
      for (let j = 0; j < 10; j++) { const a = (j / 10) * 6.283 + 1.57, rr = j % 2 ? 0.1 : 0.22; if (j) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      kk.add(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }).toNonIndexed(), c, { x: Math.cos(i * 2.09) * 0.75, z: Math.sin(i * 2.09) * 0.75, layer: 'glow', wonk: 0 });
    });
  }, (m, t, b) => { m.rotation.y = t * 1.2; m.position.y = b.pos.y + Math.sin(t * 2) * 0.1; });
}

// ───────── 奇思妙想島 ─────────
// 如果我有超能力：披著披風的小超人繞著天文台飛
export function superhero(k, dyn, x, z, radius = 3.2, height = 5) {
  animated(dyn, V(x, height, z), (kk) => {
    kk.at(0, 0, 0, 0, 1.4, () => {
      kk.cyl(0.14, 0.34, C.blue, 0, 0, 0, { seg: 6, rx: Math.PI / 2, y: 0 });
      kk.ball(0.14, C.skin, 0, 0, 0.36, {});
      kk.box(0.3, 0.02, 0.5, C.red, 0, 0.1, -0.3, { rx: 0.25 });
      kk.box(0.06, 0.06, 0.3, C.skin, 0.06, 0.05, 0.6);
    });
  }, (m, t, b) => {
    const a = t * 0.7;
    m.position.set(b.pos.x + Math.cos(a) * radius, b.pos.y + Math.sin(t * 1.5) * 0.5, b.pos.z + Math.sin(a) * radius);
    m.rotation.set(Math.sin(t * 1.5) * 0.2, -a, -0.35);
  });
}

// 兔子農夫的一天：大家一起拔大白蘿蔔，蘿蔔被拔得一抖一抖
export function giantRadish(k, dyn, x, z) {
  k.at(x, 0, z, -0.5, 1, () => {
    k.cyl(1.4, 0.12, '#6b4a31', 0, 0, 0, { seg: 12 });
    // 拉蘿蔔的隊伍：兔子農夫、熊、貓（簡化成彩色小人）
    [[C.white, 1.1], ['#8a5a3a', 1.9], ['#f2c230', 2.6]].forEach(([c, d], i) => k.at(d, 0, 0.05 * i, -Math.PI / 2, 1.2 + (i === 1 ? 0.25 : 0), () => P.figure(k, 0, 0, 0, { shirt: c })));
    k.box(2.2, 0.04, 0.04, C.wood3, 1.6, 0.6, 0);
  });
  animated(dyn, V(x, 0.1, z), (kk) => {
    kk.cone(0.4, 1, C.white, 0, -0.2, 0, { seg: 8, rx: Math.PI, y: 0.75 });
    kk.ball(0.42, C.white, 0, 0.75, 0, { detail: 1 });
    for (let i = 0; i < 5; i++) kk.add(G.cone(3), C.green, { x: Math.cos(i * 1.26) * 0.18, y: 1.5, z: Math.sin(i * 1.26) * 0.18, sx: 0.18, sy: 0.9, sz: 0.06, rx: Math.cos(i * 1.26) * 0.4, rz: -Math.sin(i * 1.26) * 0.4, sway: 0.5 });
  }, (m, t, b) => {
    const tug = Math.max(0, Math.sin(t * 2.4));
    m.position.y = b.pos.y + tug * 0.25 + hopAt(t, 9, 1.2) * 1.4;
    m.rotation.z = tug * 0.12;
  }, { ry: -0.5 });
}

// 樂高、餅乾與許願：一塊塊樂高往上疊，旁邊一盤奶油餅乾
export function legoCookie(k, dyn, x, z) {
  const brick = (kk, c, y) => { kk.box(0.8, 0.32, 0.4, c, 0, y, 0); for (let i = 0; i < 4; i++) kk.cyl(0.07, 0.08, c, -0.3 + i * 0.2, y + 0.32, 0, { seg: 6 }); };
  k.at(x, 0, z, 0.3, 1, () => {
    [C.red, C.blue, C.gold, C.green].forEach((c, i) => k.at(0, 0, 0, i * 0.4, 1, () => brick(k, c, i * 0.32)));
    k.cyl(0.55, 0.06, C.white, 1.2, 0, 0.4, { seg: 14 });
    for (let i = 0; i < 4; i++) k.cyl(0.18, 0.06, '#d9a45e', 1.2 + Math.cos(i * 1.57) * 0.25, 0.06 + (i % 2) * 0.03, 0.4 + Math.sin(i * 1.57) * 0.25, { seg: 10 });
    kid(k, -1.1, 0.5, 0.9, C.sky, 1.3);
  });
  animated(dyn, V(x, 1.28, z), (kk) => brick(kk, C.orange, 0), (m, t, b) => {
    const u = (t % 3) / 3;
    m.position.y = b.pos.y + Math.max(0, 1.5 - u * 3) * 1.2;
    m.rotation.y = 0.3 + 1.6;
  });
}

// 我的假日休閒活動：籃球架，球一直被投進籃框
export function basketball(k, dyn, x, z) {
  k.at(x, 0, z, 0.4, 1, () => {
    k.box(0.12, 2.6, 0.12, C.metal, 0, 0, -0.6);
    k.box(1, 0.7, 0.06, C.white, 0, 2.4, -0.52);
    k.add(G.torus(16, 0.1), C.orange, { y: 2.45, z: -0.25, sx: 0.28, sy: 0.28, sz: 0.28, rx: Math.PI / 2 });
    kid(k, 0.3, 1.6, Math.PI, C.orange, 1.3);
  });
  animated(dyn, V(x, 0, z), (kk) => kk.ball(0.16, C.orange, 0, 0, 0, { detail: 1 }), (m, t, b) => {
    const u = (t % 2.2) / 2.2;
    const sx = Math.sin(0.4), cx = Math.cos(0.4);
    const d = 1.6 - u * 1.9; // 從孩子手上飛向籃框
    const y = u < 0.75 ? 1.3 + Math.sin((u / 0.75) * Math.PI) * 1.6 + (u / 0.75) * 1.0 : 2.3 - (u - 0.75) * 8;
    m.position.set(b.pos.x + sx * d + cx * 0.3, Math.max(0.16, y), b.pos.z + cx * d - sx * 0.3);
  });
}

// 猜猜我最喜歡的食物：一個大漢堡，上面飄著問號
export function burger(k, dyn, x, z) {
  animated(dyn, V(x, 0, z), (kk) => {
    kk.cyl(0.85, 0.35, '#d9a45e', 0, 0, 0, { seg: 16 });
    kk.cyl(0.92, 0.12, '#7fb04f', 0, 0.35, 0, { seg: 16 });
    kk.box(1.5, 0.06, 1.5, '#f2c230', 0, 0.47, 0, { ry: 0.4 });
    kk.cyl(0.88, 0.28, '#6b3d24', 0, 0.53, 0, { seg: 16 });
    kk.add(G.sphere(16, 6), '#e3a65a', { y: 0.81, sx: 0.88, sy: 0.55, sz: 0.88 });
    for (let i = 0; i < 6; i++) kk.ball(0.04, C.paper, Math.cos(i) * 0.5, 1.25, Math.sin(i) * 0.5, { sy: 0.6 });
  }, (m, t, b) => { const h = Math.abs(Math.sin(t * 2)); m.scale.set(1 + (1 - h) * 0.04, 1 + h * 0.05, 1 + (1 - h) * 0.04); });
  animated(dyn, V(x, 2.4, z), (kk) => {
    kk.add(G.torus(14, 0.22, 0.75), C.purple, { y: 0.25, sx: 0.28, sy: 0.28, sz: 0.28 });
    kk.box(0.1, 0.25, 0.1, C.purple, 0, -0.05, 0);
    kk.ball(0.08, C.purple, 0, -0.32, 0);
  }, (m, t, b) => { m.rotation.y = t * 1.4; m.position.y = b.pos.y + Math.sin(t * 2) * 0.15; });
}

// 收藏夏天，收藏冬天：一邊是海灘陽傘，一邊是雪人
export function summerWinter(k, dyn, x, z) {
  k.at(x, 0, z, 0, 1, () => {
    k.cyl(0.9, 0.06, '#efd9a6', -0.9, 0, 0, { seg: 12 });
    k.cyl(0.9, 0.06, '#f4f8fb', 0.9, 0, 0, { seg: 12 });
    k.cyl(0.04, 1.6, C.white, -0.9, 0, 0, { seg: 4 });
    k.ball(0.5, C.white, 0.9, 0.45, 0, { detail: 1 });
    k.ball(0.34, C.white, 0.9, 1.1, 0, { detail: 1 });
    k.cone(0.06, 0.25, C.orange, 0.9, 1.1, 0.42, { rx: Math.PI / 2, seg: 5 });
    k.box(0.5, 0.08, 0.1, C.red, 0.9, 0.86, 0.12);
  });
  animated(dyn, V(x - 0.9, 1.6, z), (kk) => {
    for (let i = 0; i < 8; i++) kk.add(G.cone(3), i % 2 ? C.red : C.white, { sx: 0.5, sy: 0.18, sz: 0.2, ry: i * 0.785, x: Math.cos(i * 0.785) * 0.38, z: -Math.sin(i * 0.785) * 0.38, rz: 0, rx: 0 });
  }, (m, t) => { m.rotation.y = t * 0.5; });
}

// ───────── 萌芽歡樂島 ─────────
// 像什麼？——「貓咪的眼睛像珍珠」：坐著的大貓，尾巴左右甩
export function catStatue(k, dyn, x, z) {
  k.at(x, 0, z, 0.5, 1.3, () => {
    k.ball(0.45, '#f2b04a', 0, 0.45, 0, { detail: 1, sy: 1.1 });
    k.ball(0.33, '#f2b04a', 0, 1.1, 0.12, { detail: 1 });
    for (const sx of [-1, 1]) {
      k.cone(0.12, 0.22, '#f2b04a', sx * 0.18, 1.32, 0.1, { seg: 4 });
      k.ball(0.07, '#ffffff', sx * 0.12, 1.15, 0.4, { detail: 1 }); // 珍珠一樣亮晶晶的眼睛
      k.box(0.25, 0.01, 0.01, C.ink, sx * 0.25, 1.02, 0.42);
    }
    k.ball(0.04, C.pink, 0, 1.05, 0.44);
  });
  animated(dyn, V(x, 0.3, z), (kk) => {
    kk.cyl(0.07, 0.8, '#e09a3a', 0, 0, 0, { seg: 5, rt: 0.5, rz: 0.4, x: -0.15 });
  }, (m, t) => { m.rotation.y = 0.5 + Math.PI + Math.sin(t * 2.5) * 0.6; }, { scale: 1.3 });
}

// 我的小狗：小狗繞著圈跑，尾巴搖不停
export function puppy(k, dyn, x, z) {
  animated(dyn, V(x, 0, z), (kk) => {
    kk.box(0.6, 0.3, 0.3, '#c99a6b', 0, 0.3, 0);
    for (const [px, pz] of [[-0.2, -0.1], [0.2, -0.1], [-0.2, 0.1], [0.2, 0.1]]) kk.box(0.08, 0.25, 0.08, '#a87a4f', px, 0, pz);
    kk.ball(0.2, '#c99a6b', 0.38, 0.55, 0, { detail: 1 });
    for (const sz of [-1, 1]) kk.box(0.08, 0.18, 0.06, '#7a5236', 0.34, 0.6, sz * 0.15);
    kk.ball(0.05, C.ink, 0.57, 0.55, 0);
    kk.box(0.2, 0.05, 0.05, '#a87a4f', -0.38, 0.5, 0, { rz: 0.6 });
  }, (m, t, b) => {
    const a = t * 1.1;
    m.position.set(b.pos.x + Math.cos(a) * 1.3, Math.abs(Math.sin(t * 9)) * 0.06, b.pos.z + Math.sin(a) * 1.3);
    m.rotation.y = -a - Math.PI / 2;
  }, { scale: 1.4 });
}

// 比一比，有什麼不同？：天平左邊葡萄、右邊橘子，上下擺動比大小
export function balanceScale(k, dyn, x, z) {
  k.at(x, 0, z, 0.2, 1, () => {
    k.cyl(0.4, 0.12, C.wood2, 0, 0, 0, { seg: 8 });
    k.cyl(0.06, 1.3, C.gold, 0, 0.12, 0, { seg: 6 });
    kid(k, 0.2, 0.9, Math.PI, C.white, 1.2);
  });
  animated(dyn, V(x, 1.45, z), (kk) => {
    kk.box(1.8, 0.06, 0.08, C.gold, 0, 0, 0);
    for (const sx of [-1, 1]) {
      kk.box(0.02, 0.4, 0.02, C.metal, sx * 0.85, -0.4, 0);
      kk.cyl(0.3, 0.04, C.gold, sx * 0.85, -0.42, 0, { seg: 10 });
    }
    // 左：一串葡萄；右：一顆橘子
    [[0, 0], [0.09, 0.05], [-0.09, 0.05], [0, 0.1], [0.05, 0.15], [-0.05, 0.15]].forEach(([dx, dy]) => kk.ball(0.07, '#7a4a9c', -0.85 + dx, -0.3 + dy, 0));
    kk.ball(0.2, C.orange, 0.85, -0.18, 0, { detail: 1 });
  }, (m, t) => { m.rotation.z = Math.sin(t * 1.2) * 0.18; }, { ry: 0.2 });
}

// 兒童節快樂：巧克力噴泉流個不停，旁邊飄著氣球
export function chocoFountain(k, dyn, x, z) {
  k.at(x, 0, z, 0, 1, () => {
    k.box(1.6, 0.6, 1.2, C.white, 0, 0, 0);
    [[0.5, 0.25], [0.35, 0.25], [0.2, 0.25]].reduce((y, [r, h]) => { k.cyl(r, h, '#6b3d24', 0, y, 0, { seg: 12, rt: r * 0.8 }); return y + h + 0.12; }, 0.6);
    kid(k, -1.1, 0.4, 0.8, C.yellow || C.gold, 1.2);
    kid(k, 1.1, 0.5, -0.8, C.pink, 1.2);
  });
  animated(dyn, V(x, 0.85, z), (kk) => {
    for (let i = 0; i < 3; i++) kk.add(G.cyl(12, 0.85), '#8a5233', { y: i * 0.37, sx: 0.55 - i * 0.14, sy: 0.12, sz: 0.55 - i * 0.14 });
  }, (m, t) => { m.rotation.y = t * 2; m.scale.y = 1 + Math.sin(t * 6) * 0.08; });
  [[C.red, -0.9, 0], [C.blue, 0.8, 1.3], [C.gold, 0.2, 2.6]].forEach(([c, dx, ph]) => {
    animated(dyn, V(x + dx, 3, z - 0.6), (kk) => {
      kk.ball(0.28, c, 0, 0, 0, { detail: 1, sy: 1.15 });
      kk.box(0.01, 1.3, 0.01, C.metal, 0, -0.95, 0);
    }, (m, t, b) => { m.position.y = b.pos.y + Math.sin(t * 1.3 + ph) * 0.25; m.rotation.z = Math.sin(t + ph) * 0.1; });
  });
}

// ───────── 乘風蛻變島 ─────────
// 那一次，我成功了！：孩子騎著兩輪腳踏車，繞著曙光拱門一圈又一圈
export function bikeRider(k, dyn, cx, cz, radius = 5.3) {
  animated(dyn, V(cx, 0, cz), (kk) => {
    for (const sx of [-1, 1]) kk.add(G.torus(14, 0.1), C.dark, { x: sx * 0.38, y: 0.28, sx: 0.28, sy: 0.28, sz: 0.28 });
    kk.box(0.8, 0.05, 0.05, C.red, 0, 0.45, 0, { rz: 0.1 });
    kk.box(0.05, 0.35, 0.05, C.red, 0.3, 0.5, 0);
    kk.box(0.05, 0.05, 0.4, C.metal, 0.32, 0.7, 0);
    kk.at(-0.05, 0.42, 0, 0, 1.05, () => P.figure(kk, 0, 0, Math.PI / 2, { shirt: C.gold }));
  }, (m, t, b) => {
    const a = t * 0.45;
    m.position.set(b.pos.x + Math.cos(a) * radius, Math.abs(Math.sin(t * 6)) * 0.03, b.pos.z + Math.sin(a) * radius);
    m.rotation.y = -a - Math.PI / 2;
    m.rotation.z = Math.sin(t * 1.3) * 0.05;
  }, { scale: 1.2 });
}

// 我心目中的寶：台座上旋轉的金牌，穿柔道服的同學站在旁邊
export function goldMedal(k, dyn, x, z) {
  k.at(x, 0, z, 0.5, 1, () => {
    k.cyl(0.55, 0.9, C.stone, 0, 0, 0, { seg: 8 });
    k.box(1.6, 0.08, 1.6, '#3d86c6', 0, 0, 1.4);
    k.at(0.9, 0.08, 1.2, -0.6, 1.4, () => P.figure(k, 0, 0, 0, { shirt: C.white }));
  });
  animated(dyn, V(x, 1.75, z), (kk) => {
    kk.box(0.1, 0.5, 0.03, C.red, -0.12, 0.3, 0, { rz: 0.3 });
    kk.box(0.1, 0.5, 0.03, C.blue, 0.12, 0.3, 0, { rz: -0.3 });
    kk.cyl(0.32, 0.06, C.gold, 0, 0, 0, { seg: 16, rx: Math.PI / 2 });
    kk.add(G.ico(0), '#fff1b0', { z: 0.05, sx: 0.12, sy: 0.12, sz: 0.04, layer: 'glow' });
  }, (m, t, b) => { m.rotation.y = t * 1.4; m.position.y = b.pos.y + Math.sin(t * 2) * 0.08; });
}

// 我是這樣的男孩、當我被讚美時：揮棒的棒球男孩，旁邊跳繩的同學
export function baseballJump(k, dyn, x, z) {
  k.at(x, 0, z, 0, 1, () => {
    k.at(-0.6, 0, 0, 0.6, 1.35, () => P.figure(k, 0, 0, 0, { shirt: C.white }));
    k.box(0.2, 0.02, 0.2, C.white, -0.6, 0, 0.5);
  });
  animated(dyn, V(x - 0.6, 0.65, z), (kk) => kk.cyl(0.04, 0.9, C.wood3, 0, 0, 0, { rt: 1.8, seg: 6, rz: -1.3 }), (m, t) => {
    const u = (t % 2) / 2;
    m.rotation.y = 0.6 + (u < 0.25 ? -1.4 + u * 12 : 1.6 - (u - 0.25) * 2);
  });
  animated(dyn, V(x + 0.9, 0, z + 0.2), (kk) => {
    kk.at(0, 0, 0, -0.4, 1.25, () => P.figure(kk, 0, 0, 0, { shirt: C.pink }));
  }, (m, t) => {
    m.position.y = Math.abs(Math.sin(t * 5)) * 0.3; // 跟繩子同一個節奏
  });
  animated(dyn, V(x + 0.9, 0.5, z + 0.2), (kk) => kk.add(G.torus(20, 0.03, 0.5), C.gold, { sx: 0.9, sy: 0.9, sz: 0.9 }), (m, t) => {
    m.rotation.set(t * 10, -0.4, 0);
    m.position.y = 0.5 + Math.abs(Math.sin(t * 5)) * 0.3;
  });
}

// 讀書報告：口足畫家楊恩典——畫架上的畫一筆一筆畫出來
export function easelPainting(k, dyn, x, z) {
  k.at(x, 0, z, 0.4, 1, () => {
    for (const sx of [-1, 1]) k.box(0.06, 1.7, 0.06, C.wood2, sx * 0.45, 0, 0, { rz: sx * -0.12 });
    k.box(0.06, 1.6, 0.06, C.wood2, 0, 0, -0.45, { rx: 0.25 });
    k.box(1.1, 0.8, 0.05, C.white, 0, 0.8, 0.06);
    k.at(0, 0, 0.9, Math.PI, 1, () => P.figure(k, 0, 0, 0, { shirt: C.teal, sit: true, s: 1.4 }));
  });
  animated(dyn, V(x, 1.2, z), (kk) => {
    [[C.red, -0.3, 0.1], [C.gold, 0, -0.1], [C.blue, 0.28, 0.12], [C.green, -0.1, -0.25], [C.pink, 0.25, -0.22]].forEach(([c, px, py], i) => kk.box(0.24, 0.14, 0.02, c, px, py, 0.1, { rz: i * 0.5 }));
  }, (m, t, b) => {
    const u = (t % 6) / 6;
    m.children.forEach((c) => { c.scale.setScalar(Math.min(1, u * 1.6) + 0.001); });
  }, { ry: 0.4 });
}

// 一個影響我深遠的人：兩個好朋友面對面，中間一顆愛心和星星
export function friendsHeart(k, dyn, x, z) {
  k.at(x, 0, z, 0.2, 1, () => {
    k.at(-0.45, 0, 0, Math.PI / 2, 1.35, () => P.figure(k, 0, 0, 0, { shirt: C.pink }));
    k.at(0.45, 0, 0, -Math.PI / 2, 1.35, () => P.figure(k, 0, 0, 0, { shirt: C.sky }));
  });
  animated(dyn, V(x, 1.75, z), (kk) => {
    kk.ball(0.14, '#ff6b8a', -0.08, 0.05, 0, { detail: 1, sz: 0.6 });
    kk.ball(0.14, '#ff6b8a', 0.08, 0.05, 0, { detail: 1, sz: 0.6 });
    kk.cone(0.2, 0.24, '#ff6b8a', 0, -0.2, 0, { seg: 4, rx: Math.PI, y: 0.04, sz: 0.4 });
    kk.add(G.ico(0), '#ffe9a8', { x: 0.35, y: 0.25, sx: 0.08, sy: 0.08, sz: 0.08, layer: 'glow' });
  }, (m, t, b) => { m.rotation.y = t; m.position.y = b.pos.y + Math.sin(t * 1.6) * 0.12; m.scale.setScalar(1 + Math.max(0, Math.sin(t * 3)) * 0.1); });
}

// 童年的美好回憶：小床上的白色小貓玩偶和紅色長耳兔娃娃
export function plushToys(k, dyn, x, z) {
  k.at(x, 0, z, -0.3, 1, () => {
    k.box(1.6, 0.4, 1, C.wood3, 0, 0, 0);
    k.box(1.5, 0.12, 0.9, '#cfe6f5', 0, 0.4, 0);
    k.box(0.5, 0.12, 0.7, C.white, -0.5, 0.5, 0);
    k.box(1.6, 0.7, 0.08, C.wood2, 0, 0, -0.5);
  });
  animated(dyn, V(x - 0.2, 0.55, z + 0.1), (kk) => {
    kk.ball(0.18, C.white, 0, 0.18, 0, { detail: 1 });
    kk.ball(0.14, C.white, 0, 0.42, 0.04, { detail: 1 });
    for (const sx of [-1, 1]) { kk.cone(0.05, 0.1, C.white, sx * 0.08, 0.53, 0.04, { seg: 4 }); kk.ball(0.025, '#4fa3d1', sx * 0.05, 0.44, 0.17); }
  }, (m, t) => { m.rotation.z = Math.sin(t * 1.4) * 0.12; }, { ry: -0.3 });
  animated(dyn, V(x + 0.35, 0.55, z + 0.05), (kk) => {
    kk.ball(0.17, '#d9432f', 0, 0.17, 0, { detail: 1 });
    kk.ball(0.13, '#d9432f', 0, 0.4, 0.03, { detail: 1 });
    for (const sx of [-1, 1]) { kk.ball(0.05, '#d9432f', sx * 0.06, 0.66, 0, { sy: 4 }); kk.ball(0.03, '#8a6bb8', sx * 0.05, 0.42, 0.15); }
  }, (m, t) => { m.rotation.z = Math.sin(t * 1.4 + 1.5) * 0.12; }, { ry: -0.3 });
}

// ───────── 隱形推進島 ─────────
// 學務處活動剪影：舞蹈菁英班在小舞台上旋轉跳舞
export function danceStage(k, dyn, x, z) {
  k.at(x, 0, z, 0, 1, () => {
    k.cyl(1.4, 0.3, '#c9553b', 0, 0, 0, { seg: 16 });
    k.box(2.6, 1.6, 0.1, '#8f2f3a', 0, 0.3, -1.2);
  });
  [0, 2.09, 4.19].forEach((a0, i) => {
    animated(dyn, V(x, 0.3, z), (kk) => {
      kk.at(0, 0, 0, 0, 1.25, () => P.figure(kk, 0, 0, 0, { shirt: i === 1 ? C.gold : C.red }));
      kk.cone(0.3, 0.3, i === 1 ? C.gold : C.red, 0, 0.3, 0, { seg: 8 });
    }, (m, t, b) => {
      const a = a0 + t * 0.6;
      m.position.set(b.pos.x + Math.cos(a) * 0.75, b.pos.y + hopAt(t, 2, 0.5, i * 0.6) * 0.3, b.pos.z + Math.sin(a) * 0.75);
      m.rotation.y = t * 3 + i;
    });
  });
}
