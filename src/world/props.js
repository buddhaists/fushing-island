// 微縮場景道具庫：樹木、建築、書本、校園小物
import * as THREE from 'three';
import { G } from './kit.js';

export const C = {
  trunk: '#6d4c33', trunk2: '#5a3f2b', leaf: ['#5e9440', '#6fa548', '#4f8539', '#7fb04f'], pine: ['#3f7a4e', '#4a8757', '#356c45'],
  maple: ['#d9622b', '#e58a2f', '#c94c2a'], paper: '#f5ecd8', cream: '#efe2c7', wood: '#a9794f', wood2: '#8a6040', wood3: '#c39a6b',
  brick: '#b5563c', brick2: '#a44a33', roof: '#a2412f', roof2: '#46657f', tile: '#6f6a64', white: '#f4efe4', stone: '#b7ab96', stone2: '#9c917e',
  red: '#d9432f', orange: '#ea8a2d', gold: '#e3a73b', blue: '#3d86c6', sky: '#74bbe0', teal: '#2f8f92', green: '#5a9b4e', pink: '#ee9fb0',
  purple: '#8a6bb8', ink: '#3a2c1e', skin: '#f0c9a0', water: '#58b4dd', metal: '#8d97a0', dark: '#3d4148', win: '#ffd98a', screen: '#8fe0f0',
};

export function tree(k, x, z, s = 1, y = 0) {
  k.at(x, y, z, k.rand(6), s, () => {
    const h = k.rand(1.3, 1.9);
    k.cyl(0.2, h, C.trunk, 0, 0, 0, { rt: 0.13, seg: 6, sway: 0.1 });
    const col = k.pick(C.leaf);
    k.ball(1.02, col, 0, h + 0.42, 0, { detail: 1, sway: 0.5, sy: 0.92 });
    k.ball(0.72, k.pick(C.leaf), 0.55, h + 0.02, 0.2, { detail: 0, sway: 0.5 });
    k.ball(0.66, col, -0.48, h + 0.12, -0.26, { detail: 0, sway: 0.5 });
  });
}

export function pine(k, x, z, s = 1, y = 0) {
  k.at(x, y, z, k.rand(6), s, () => {
    k.cyl(0.17, 0.75, C.trunk2, 0, 0, 0, { seg: 5 });
    const c = k.pick(C.pine);
    k.cone(1.08, 1.45, c, 0, 0.55, 0, { sway: 0.32 });
    k.cone(0.84, 1.25, k.pick(C.pine), 0, 1.3, 0, { sway: 0.42 });
    k.cone(0.56, 1.05, c, 0, 2.05, 0, { sway: 0.52 });
  });
}

export function maple(k, x, z, s = 1, y = 0) {
  k.at(x, y, z, k.rand(6), s, () => {
    k.cyl(0.18, 1.5, C.trunk, 0, 0, 0, { rt: 0.11, seg: 6 });
    k.ball(0.96, k.pick(C.maple), 0, 1.92, 0, { detail: 1, sway: 0.5 });
    k.ball(0.62, k.pick(C.maple), 0.5, 1.52, 0.2, { sway: 0.5 });
    k.ball(0.58, k.pick(C.maple), -0.44, 1.6, -0.3, { sway: 0.5 });
  });
}

// 風鈴木：屏東春天開滿粉紅花的樹
export function bellTree(k, x, z, s = 1, y = 0) {
  const pinks = ['#f29bb6', '#ec84a6', '#f7b8cb'];
  k.at(x, y, z, k.rand(6), s, () => {
    k.cyl(0.17, 1.6, C.trunk, 0, 0, 0, { rt: 0.1, seg: 6 });
    k.ball(0.98, k.pick(pinks), 0, 2, 0, { detail: 1, sway: 0.5 });
    k.ball(0.64, k.pick(pinks), 0.52, 1.6, 0.2, { sway: 0.5 });
    k.ball(0.6, k.pick(pinks), -0.46, 1.68, -0.3, { sway: 0.5 });
  });
}

// 老榕樹：多氣根的大樹
export function banyan(k, x, z, s = 1, y = 0) {
  k.at(x, y, z, 0, s, () => {
    k.cyl(0.62, 2.4, C.trunk, 0, 0, 0, { rt: 0.4, seg: 7 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 6.28;
      k.cyl(0.07, 2.2, C.trunk2, Math.cos(a) * 1.25, 0, Math.sin(a) * 1.25, { seg: 4 });
    }
    k.ball(2.1, '#5b8f3d', 0, 3.3, 0, { detail: 1, sy: 0.62, sway: 0.25 });
    k.ball(1.4, '#6ea146', 1.2, 2.95, 0.5, { sy: 0.62, sway: 0.3 });
    k.ball(1.3, '#4f8539', -1.2, 3, -0.6, { sy: 0.62, sway: 0.3 });
  });
}

export function bush(k, x, z, s = 1, y = 0) {
  k.ball(0.42 * s, k.pick(C.leaf), x, y + 0.26 * s, z, { sy: 0.74, sway: 0.2 });
}

export function flowers(k, x, z, n = 6, spread = 0.8, cols = [C.pink, '#f4d35e', '#f6f1e6', C.red]) {
  for (let i = 0; i < n; i++) {
    const px = x + k.rand(-spread, spread), pz = z + k.rand(-spread, spread);
    k.cyl(0.018, 0.18, '#5a8c3c', px, 0, pz, { seg: 3, wonk: 0 });
    k.ball(0.07, k.pick(cols), px, 0.2, pz, {});
  }
}

export function rock(k, x, z, s = 1) {
  k.ball(0.5 * s, k.pick([C.stone, C.stone2, '#8f8778']), x, 0.2 * s, z, { sy: 0.66 });
}

export function lamp(k, x, z, s = 1) {
  k.at(x, 0, z, 0, s, () => {
    k.cyl(0.05, 1.5, C.dark, 0, 0, 0, { seg: 5 });
    k.glow(0.2, 0.26, 0.2, C.win, 0, 1.5, 0);
    k.cone(0.2, 0.14, C.dark, 0, 1.76, 0, { seg: 4 });
  });
}

export function bench(k, x, z, ry = 0) {
  k.at(x, 0, z, ry, 1, () => {
    k.box(1, 0.07, 0.34, C.wood, 0, 0.28, 0);
    k.box(1, 0.26, 0.05, C.wood2, 0, 0.36, -0.15);
    k.box(0.06, 0.28, 0.28, C.wood2, -0.42, 0, 0);
    k.box(0.06, 0.28, 0.28, C.wood2, 0.42, 0, 0);
  });
}

export function fence(k, x1, z1, x2, z2, col = C.wood3) {
  const d = Math.hypot(x2 - x1, z2 - z1);
  const n = Math.round(d / 0.55);
  const ry = -Math.atan2(z2 - z1, x2 - x1);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    k.box(0.08, 0.5, 0.08, col, x1 + (x2 - x1) * t, 0, z1 + (z2 - z1) * t);
  }
  k.box(d, 0.05, 0.05, col, (x1 + x2) / 2, 0.36, (z1 + z2) / 2, { ry });
  k.box(d, 0.05, 0.05, col, (x1 + x2) / 2, 0.18, (z1 + z2) / 2, { ry });
}

export function pavers(k, pts, w = 0.46) {
  // 沿折線鋪踏石
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const d = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(d / (w * 1.5)));
    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n;
      k.add(G.cyl(7), k.pick([C.stone, '#c7bca6', C.stone2]), {
        x: ax + (bx - ax) * t + k.rand(-0.05, 0.05), y: 0.02, z: az + (bz - az) * t + k.rand(-0.05, 0.05),
        sx: w * k.rand(0.8, 1.05), sy: 0.08, sz: w * k.rand(0.7, 1), ry: k.rand(3),
      });
    }
  }
}

export function flag(k, x, z, h = 3, col = C.red) {
  k.cyl(0.05, h, C.metal, x, 0, z, { seg: 5 });
  k.ball(0.08, C.gold, x, h + 0.02, z);
  k.add(G.box(), col, { x: x + 0.42, y: h - 0.32, z, sx: 0.8, sy: 0.5, sz: 0.02, sway: 0.9, wonk: 0 });
}

// 坐著或站著的小人
export function figure(k, x, z, ry = 0, { shirt = '#f2c230', sit = false, s = 1 } = {}) {
  k.at(x, 0, z, ry, s, () => {
    if (sit) {
      k.cyl(0.13, 0.26, shirt, 0, 0.02, 0, { seg: 6 });
      k.box(0.2, 0.08, 0.3, '#2f6f53', 0, 0.02, 0.14);
      k.ball(0.13, C.skin, 0, 0.42, 0, {});
      k.ball(0.14, C.ink, 0, 0.47, -0.03, { sy: 0.7 });
    } else {
      k.box(0.09, 0.26, 0.09, '#2f6f53', -0.07, 0, 0);
      k.box(0.09, 0.26, 0.09, '#2f6f53', 0.07, 0, 0);
      k.cyl(0.14, 0.34, shirt, 0, 0.26, 0, { seg: 6 });
      k.ball(0.14, C.skin, 0, 0.74, 0, {});
      k.ball(0.15, C.ink, 0, 0.79, -0.03, { sy: 0.7 });
    }
  });
}

// 書本：闔上
export function book(k, x, y, z, w, h, d, col, ry = 0) {
  k.at(x, y, z, ry, 1, () => {
    k.box(w, h, d, col, 0, 0, 0, { ao: 0.9 });
    k.box(w * 0.92, h * 0.76, d * 1.01 - 0.02, C.paper, 0.03 * w, h * 0.12, 0, { wonk: 0 });
    k.box(w * 0.08, h, d, col, -w * 0.46, 0, 0);
  });
}

export function bookStack(k, x, z, n = 4, s = 1, ry = 0, y0 = 0) {
  const cols = [C.red, C.blue, C.gold, C.teal, C.purple, C.green, C.orange];
  let y = y0;
  for (let i = 0; i < n; i++) {
    const h = k.rand(0.14, 0.26) * s;
    book(k, x + k.rand(-0.06, 0.06) * s, y, z + k.rand(-0.06, 0.06) * s, k.rand(0.8, 1.05) * s, h, k.rand(0.58, 0.74) * s, k.pick(cols), ry + k.rand(-0.3, 0.3));
    y += h;
  }
  return y;
}

// 攤開的大書：兩片弧形書頁
export function openBook(k, x, y, z, w, d, ry = 0, cover = C.red) {
  k.at(x, y, z, ry, 1, () => {
    const seg = 10;
    for (const sign of [-1, 1]) {
      const verts = [];
      const top = (t) => 0.32 * Math.sin(t * Math.PI * 0.5 + 0.35) * (1 - t * 0.55) + 0.1;
      for (let i = 0; i < seg; i++) {
        const a = i / seg, b = (i + 1) / seg;
        const xa = sign * a * w / 2, xb = sign * b * w / 2;
        const ya = top(a) * w * 0.32, yb = top(b) * w * 0.32;
        const quad = [[xa, ya, -d / 2], [xb, yb, -d / 2], [xb, yb, d / 2], [xa, ya, d / 2]];
        const order = sign > 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
        order.forEach((n) => verts.push(...quad[n]));
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      k.add(g, C.paper, { wonk: 0, ao: 1, jitter: 0.012 });
      // 頁面下方的書本厚度
      k.box(w / 2, w * 0.05, d * 0.985, '#e6dac0', sign * w / 4, 0, 0, { wonk: 0, ao: 0.82 });
      // 字行
      for (let l = 0; l < 7; l++) {
        const t = 0.16 + l * 0.11;
        k.box(w * 0.32, 0.018, 0.05 * d, '#a79b86', sign * w * 0.26, top(t * 0.75 + 0.2) * w * 0.32 + 0.012, -d * 0.36 + l * d * 0.12, { wonk: 0, ao: 1 });
      }
    }
    k.box(w * 1.05, 0.14, d * 1.05, cover, 0, -0.14, 0, { ao: 0.88 });
  });
}

// 學校大樓：多層走廊式教室
export function schoolBuilding(k, x, z, ry, { w = 7, d = 2.4, floors = 3, wall = C.white, trim = C.brick, roof = C.roof, tower = true } = {}) {
  k.at(x, 0, z, ry, 1, () => {
    k.door(0, 0, d / 2 + 1.1);
    const fh = 1.06;
    const H = floors * fh;
    k.box(w + 0.3, 0.14, d + 0.5, C.stone2, 0, 0, 0.1);
    k.box(w, H, d, wall, 0, 0.14, 0, { ao: 0.9 });
    for (let f = 0; f < floors; f++) {
      const y = 0.14 + f * fh;
      k.box(w + 0.16, 0.08, 0.5, trim, 0, y + fh - 0.08, d / 2 + 0.22);
      k.box(w + 0.05, 0.28, 0.05, C.cream, 0, y + fh * 0.0 + 0.0 + (f ? 0 : 0), d / 2 + 0.44, { sy: f ? 0.28 : 0.001 });
      const n = Math.floor(w / 1.02);
      for (let i = 0; i < n; i++) {
        const px = -w / 2 + 0.55 + (i * (w - 1.1)) / (n - 1);
        k.glow(0.58, 0.46, 0.05, C.win, px, y + 0.3, d / 2 + 0.01);
        k.box(0.08, 0.5, 0.06, C.cream, px, y + 0.28, d / 2 + 0.03);
      }
      for (let i = 0; i <= 4; i++) {
        k.box(0.12, fh - 0.08, 0.12, trim, -w / 2 + (i * w) / 4, y, d / 2 + 0.38);
      }
    }
    k.roof(w + 0.5, 0.86, d + 0.9, roof, 0, H + 0.14, 0.1, { ry: 0 });
    if (tower) {
      k.box(1.4, H + 1.1, 1.4, trim, 0, 0.14, d / 2 + 0.12, { ao: 0.86 });
      k.box(1.5, 0.12, 1.5, C.cream, 0, H + 1.2, d / 2 + 0.12);
      k.cone(1.14, 0.9, roof, 0, H + 1.32, d / 2 + 0.12, { seg: 4, ry: Math.PI / 4 });
      k.glow(0.72, 0.72, 0.05, C.paper, 0, H + 0.2, d / 2 + 0.84);
      k.cyl(0.42, 0.04, C.ink, 0, H + 0.56, d / 2 + 0.87, { seg: 12, rx: Math.PI / 2, wonk: 0 });
      k.box(0.9, 1.06, 0.06, C.wood2, 0, 0.14, d / 2 + 0.84);
    }
  });
}

// 客家斜屋頂小屋
export function house(k, x, z, ry, { w = 2.2, d = 1.6, h = 1.05, wall = C.cream, roof = C.tile, door = C.wood2, win = true } = {}) {
  k.at(x, 0, z, ry, 1, () => {
    k.box(w, h, d, wall, 0, 0, 0, { ao: 0.86 });
    k.roof(d + 0.5, 0.72, w + 0.42, roof, 0, h, 0, { ry: Math.PI / 2 });
    k.box(0.42, 0.72, 0.05, door, 0, 0, d / 2 + 0.01);
    k.door(0, 0, d / 2 + 0.5);
    if (win) {
      k.glow(0.36, 0.34, 0.05, C.win, -w * 0.3, 0.42, d / 2 + 0.01);
      k.glow(0.36, 0.34, 0.05, C.win, w * 0.3, 0.42, d / 2 + 0.01);
    }
  });
}

// 古代拱門
export function arch(k, x, z, ry, s = 1, col = C.stone) {
  k.at(x, 0, z, ry, s, () => {
    k.box(0.5, 1.9, 0.5, col, -1, 0, 0);
    k.box(0.5, 1.9, 0.5, col, 1, 0, 0);
    k.box(0.68, 0.16, 0.68, C.stone2, -1, 1.9, 0);
    k.box(0.68, 0.16, 0.68, C.stone2, 1, 1.9, 0);
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI * (i / 6);
      k.box(0.34, 0.26, 0.5, col, Math.cos(a) * 1, 2.1 + Math.sin(a) * 0.86, 0, { rz: a - Math.PI / 2 });
    }
    k.ball(0.28, '#6f9a48', 0.8, 2.72, 0.1, { sy: 0.5 });
  });
}

export function brokenColumn(k, x, z, h = 1.4, col = C.stone) {
  k.cyl(0.32, h, col, x, 0, z, { seg: 8 });
  k.cyl(0.42, 0.14, C.stone2, x, 0, z, { seg: 8 });
}

// 福星龍：Q 版小龍。身體用校徽粉紅，金黃色的大鼻頭與肚子，
// 鼻孔兩旁垂下捲曲的長鬍鬚，頭頂一對金角，臉頰兩側綠色鰭片，背上一排綠刺，四隻短腳
// 以收集用的小尺寸畫在原點，面向 +z；零件很小，不套「手工歪斜」
export const DRAGON_PINK = '#d66b7a';
export const DRAGON_ROSE = '#e3889a';
export const DRAGON_DEEP = '#b9525f';
export const DRAGON_BROWN = '#732e23';
const DRAGON_GOLD = '#f2c14e';
const DRAGON_GOLD2 = '#e3a73b';
const DRAGON_GREEN = '#3f9a6a';
const DRAGON_GREEN2 = '#5bb37c';
// fine：大雕像用細緻球面；藏起來的小龍體積小，用較粗的球面省下大量三角面
export function dragonFigure(k, col = DRAGON_PINK, fine = false) {
  const soft = { detail: fine ? 3 : 2, wonk: 0, jitter: 0.008 };
  const tiny = { detail: 1, wonk: 0, jitter: 0, ao: 1 };
  const deep = col === DRAGON_PINK ? DRAGON_DEEP : '#c96676';
  const tube = (pts, r, hex) => k.raw(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 10, r, 5, false), hex, { wonk: 0, jitter: 0, ao: 1 });
  // 圓滾滾的身體與金黃色肚子（一圈一圈的腹甲）
  // 圓滾滾的身體、脖子把頭和身體圓順地接起來
  k.ball(0.33, col, 0, 0.38, -0.1, { ...soft, sx: 0.95, sy: 0.95, sz: 1.08 });
  k.ball(0.23, col, 0, 0.6, 0, soft);
  // 金黃色肚子（一圈一圈的腹甲）
  k.ball(0.24, DRAGON_GOLD, 0, 0.37, 0.08, { ...soft, sx: 0.85, sy: 1, sz: 0.6 });
  for (let i = 0; i < 3; i++) k.add(G.torus(20, 0.08, 0.5), DRAGON_GOLD2, { x: 0, y: 0.27 + i * 0.1, z: 0.2 - Math.abs(i - 1) * 0.015, rz: Math.PI, sx: 0.15 - Math.abs(i - 1) * 0.02, sy: 0.05, sz: 0.1, wonk: 0, jitter: 0, ao: 1 });
  // 四隻圓胖的小肉腳與小爪子
  for (const [x, z] of [[-0.17, 0.08], [0.17, 0.08], [-0.17, -0.27], [0.17, -0.27]]) {
    k.ball(0.11, col, x, 0.12, z, { ...soft, sy: 1.05, sz: 1.1 });
    k.ball(0.09, col, x, 0.05, z + 0.03, { ...soft, sy: 0.6, sz: 1.15 });
    for (let c = -1; c <= 1; c++) k.ball(0.026, '#fff4dc', x + c * 0.042, 0.03, z + 0.12, tiny);
  }
  // 平順漸細、往上捲的尾巴，尾端一撮綠毛
  [[0, 0.3, -0.4, 0.15], [0.02, 0.36, -0.5, 0.125], [0.05, 0.44, -0.58, 0.1], [0.08, 0.53, -0.62, 0.08], [0.11, 0.61, -0.63, 0.062]].forEach(([x, y, z, r]) => k.ball(r, col, x, y, z, soft));
  k.cone(0.08, 0.2, DRAGON_GREEN, 0.14, 0.68, -0.62, { seg: 5, rx: -0.4, rz: -0.4, wonk: 0, jitter: 0 });
  // 背上一排綠刺：從頭頂一路到尾巴
  [[1.12, -0.04, 0.06], [0.98, -0.2, 0.06], [0.7, -0.24, 0.06], [0.62, -0.38, 0.055], [0.54, -0.5, 0.05], [0.58, -0.6, 0.045]].forEach(([y, z, r]) => k.cone(r, 0.15, DRAGON_GREEN, 0, y, z, { seg: 4, rx: -0.5, wonk: 0, jitter: 0 }));
  // 大大的頭
  k.ball(0.34, col, 0, 0.86, 0.06, { ...soft, sx: 1.05, sy: 0.94, sz: 0.97 });
  // 金黃色的大鼻頭：寬寬圓圓、往前伸，上面鼓起兩個鼻孔
  k.ball(0.2, DRAGON_GOLD, 0, 0.74, 0.33, { ...soft, sx: 1.15, sy: 0.78, sz: 1 });
  k.ball(0.145, DRAGON_GOLD, 0, 0.79, 0.45, { ...soft, sx: 1.25, sy: 0.72, sz: 0.85 });
  k.ball(0.15, DRAGON_GOLD2, 0, 0.63, 0.36, { ...soft, sx: 1.1, sy: 0.55, sz: 0.9 });
  k.box(0.3, 0.014, 0.014, DRAGON_BROWN, 0, 0.665, 0.5, { wonk: 0, jitter: 0, ao: 1 });
  for (const sx of [-1, 1]) {
    // 鼻孔：外圈鼓起、中間深色
    k.ball(0.06, DRAGON_GOLD, sx * 0.08, 0.83, 0.55, tiny);
    k.ball(0.028, DRAGON_BROWN, sx * 0.085, 0.84, 0.6, tiny);
    // 從鼻孔旁垂下、尾端往上捲的長鬍鬚
    tube([[sx * 0.15, 0.8, 0.55], [sx * 0.32, 0.76, 0.62], [sx * 0.46, 0.66, 0.56], [sx * 0.5, 0.58, 0.44], [sx * 0.46, 0.6, 0.38]], 0.012, DRAGON_GOLD2);
    k.ball(0.025, DRAGON_GOLD2, sx * 0.46, 0.61, 0.37, tiny);
    // 又大又亮的眼睛：白眼球、咖啡色虹膜、黑瞳孔、兩點反光，上面一道眉骨
    // 眼睛整體收在眉線下方：上緣順著眉毛的弧度，不會超出
    k.ball(0.13, '#ffffff', sx * 0.16, 0.925, 0.3, { ...tiny, sx: 0.75, sy: 0.82, sz: 0.7 });
    k.ball(0.08, '#8a4a22', sx * 0.17, 0.915, 0.365, { ...tiny, sx: 0.7, sy: 0.85, sz: 0.55 });
    k.ball(0.04, '#1e140e', sx * 0.175, 0.915, 0.4, { ...tiny, sx: 0.7, sy: 0.88, sz: 0.5 });
    k.ball(0.018, '#ffffff', sx * 0.155, 0.94, 0.415, tiny);
    k.ball(0.009, '#ffffff', sx * 0.192, 0.895, 0.415, tiny);
    // 上眼皮：和身體同色，蓋住眼球的頂部與後半，從上方看也不會凸出眉毛
    k.ball(0.12, col, sx * 0.16, 0.99, 0.285, { ...soft, sx: 0.95, sy: 0.45, sz: 0.75 });
    // 眉毛：沿著眼睛上緣彎成弧線，到眼尾往上翹
    tube([[sx * 0.07, 0.985, 0.39], [sx * 0.11, 1.035, 0.385], [sx * 0.17, 1.05, 0.365], [sx * 0.23, 1.02, 0.33], [sx * 0.265, 0.975, 0.3]], 0.02, DRAGON_BROWN);
    tube([[sx * 0.255, 0.98, 0.305], [sx * 0.29, 1.01, 0.28], [sx * 0.31, 1.06, 0.26]], 0.013, DRAGON_BROWN);
    // 頭頂往後彎的金角
    tube([[sx * 0.12, 1.08, -0.02], [sx * 0.17, 1.22, -0.08], [sx * 0.2, 1.3, -0.2], [sx * 0.19, 1.31, -0.3]], 0.035, DRAGON_GOLD2);
    // 臉頰兩側的綠色鰭片
    [[0.95, 0.5, 0.11], [0.85, 0.15, 0.1], [0.76, -0.2, 0.08]].forEach(([y, a, r]) => k.cone(r, 0.26, DRAGON_GREEN2, sx * 0.36, y, -0.02, { seg: 4, rz: sx * -1.2, rx: a, sz: 0.35, wonk: 0, jitter: 0 }));
  }
}

// 大福星龍雕像
export function dragon(k, x, y, z, ry = 0, s = 1, col = DRAGON_PINK) {
  k.at(x, y, z, ry, s * 2.25, () => dragonFigure(k, col, true));
}

// 站在石座上的福星龍（主島前庭）
export function dragonStatue(k, x, y, z, s = 1, ry = 0) {
  k.at(x, y, z, ry, s, () => {
    k.cyl(0.62, 0.36, C.stone, 0, 0, 0, { seg: 10 });
    k.at(0, 0.36, 0, 0, 1.9, () => dragonFigure(k, DRAGON_PINK, true));
  });
}

export function signBoard(k, x, z, ry = 0, col = C.wood) {
  k.at(x, 0, z, ry, 1, () => {
    k.box(0.1, 1, 0.1, C.wood2, -0.5, 0, 0);
    k.box(0.1, 1, 0.1, C.wood2, 0.5, 0, 0);
    k.box(1.3, 0.56, 0.08, col, 0, 0.7, 0);
  });
}

export function pond(k, x, z, rx, rz, depth = 0.1) {
  k.add(G.cyl(16), C.stone2, { x, y: 0.03, z, sx: rx + 0.2, sy: 0.1, sz: rz + 0.2 });
  k.add(G.cyl(16), C.water, { x, y: 0.09, z, sx: rx, sy: depth, sz: rz, layer: 'water', wonk: 0, ao: 1 });
}

export function kite(k, x, y, z, col = C.red) {
  k.add(G.ico(0), col, { x, y, z, sx: 0.5, sy: 0.7, sz: 0.04, sway: 0.8 });
}

export function koi(k, x, y, z, s = 1, ry = 0, col = C.red) {
  k.at(x, y, z, ry, s, () => {
    k.ball(0.3, '#fff2e2', 0, 0, 0, { sx: 0.5, sy: 0.6, sz: 1.2 });
    k.ball(0.17, col, 0, 0.1, 0.1, { sx: 0.8, sy: 0.6, sz: 1.2 });
    k.cone(0.16, 0.3, col, 0, -0.14, -0.46, { seg: 3, sz: 0.2, rx: -1.57 });
  });
}
