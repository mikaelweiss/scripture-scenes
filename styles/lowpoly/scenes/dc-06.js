// D&C 88:127-141: The School of the Prophets meets in the small upper room of Newel K. Whitney's store in Kirtland, Ohio,
// winter 1833. The player stands at the south end of the room looking north to Joseph Smith at the head of the table.
import * as THREE from 'three';
import { crowd, period, box, light, candle, bench, frameHouse, leafy } from './lib/dc-01-kit.js';

const Y = 3.4;
const W = 5.2, D = 6.6, H = 2.6;
const JOSEPH = [0, -2.55];

function store(ctx) {
  const clap = '#e8e2d4';
  box(ctx, { x: 0, y: -0.3, z: 0, w: W + 0.4, h: Y + 0.18, d: D + 0.4, color: clap });
  for (let i = 0; i < 11; i++) ctx.solid.box(W + 0.44, 0.03, D + 0.44, { position: [0, i * 0.3 + 0.1, 0], color: '#c8c0b0', jitter: 0 });
  for (const z of [-1.8, 1.8]) {
    ctx.glow.box(0.05, 1.3, 0.9, { position: [W / 2 + 0.21, 1.5, z], color: '#ffd890' });
    ctx.glow.box(0.05, 1.3, 0.9, { position: [-W / 2 - 0.21, 1.5, z], color: '#ffd890' });
  }
  ctx.glow.box(1.6, 1.0, 0.05, { position: [-1.2, 1.4, D / 2 + 0.21], color: '#ffd890' });
  box(ctx, { x: 1.2, y: 0, z: D / 2 + 0.22, w: 1.0, h: 2.2, d: 0.06, color: '#4a3a30', collide: false });
  ctx.solid.box(W + 1.2, 0.2, 1.4, { position: [0, 2.6, D / 2 + 0.9], rotation: [0.2, 0, 0], color: '#5a4e44' });
  // Gable roof over the upper room.
  const rh = 2.2;
  for (const side of [-1, 1]) {
    const slope = Math.hypot(W / 2 + 0.5, rh);
    ctx.solid.box(slope, 0.18, D + 0.8, { position: [side * (W / 4 + 0.25), Y + H + rh / 2 + 0.1, 0], rotation: [0, 0, -side * Math.atan2(rh, W / 2 + 0.5)], color: '#585058' });
    ctx.solid.box(slope, 0.06, D + 0.8, { position: [side * (W / 4 + 0.25), Y + H + rh / 2 + 0.22, 0], rotation: [0, 0, -side * Math.atan2(rh, W / 2 + 0.5)], color: '#f4f6fa', jitter: 0.02 });
  }
  for (const side of [-1, 1]) {
    const tri = new THREE.BufferGeometry();
    const pts = side > 0 ? [-W / 2 - 0.2, 0, 0, W / 2 + 0.2, 0, 0, 0, rh, 0] : [-W / 2 - 0.2, 0, 0, 0, rh, 0, W / 2 + 0.2, 0, 0];
    tri.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    ctx.solid.add(tri, { position: [0, Y + H, side * (D / 2 + 0.2)], color: clap });
  }
  ctx.solid.box(0.5, 1.6, 0.5, { position: [1.4, Y + H + 1.6, 1.4], color: '#8a5a44' });
}

function room(ctx) {
  const wall = '#e2dac8', wood = '#7a5a40';
  const wallBox = (x, z, w, d, h = H, y = 0) => box(ctx, { x, y: Y + y, z, w, h, d, color: wall });
  const win = [-1.8, 1.8];
  for (const side of [-1, 1]) {
    const x = side * W / 2;
    wallBox(x, -2.85, 0.4, 0.9);
    wallBox(x, 0, 0.4, 2.7);
    wallBox(x, 2.85, 0.4, 0.9);
    for (const z of win) {
      wallBox(x, z, 0.4, 0.9, 0.85);
      wallBox(x, z, 0.4, 0.9, 0.55, 2.05);
      ctx.glow.box(0.04, 1.2, 0.9, { position: [x, Y + 1.45, z], color: '#dfe6ee' });
      ctx.solid.box(0.06, 1.2, 0.04, { position: [x - side * 0.02, Y + 1.45, z], color: '#f2ece0', jitter: 0 });
      ctx.solid.box(0.06, 0.04, 0.9, { position: [x - side * 0.02, Y + 1.45, z], color: '#f2ece0', jitter: 0 });
      ctx.solid.box(0.2, 0.05, 1.0, { position: [x - side * 0.15, Y + 0.86, z], color: '#d8d0bc', jitter: 0 });
    }
  }
  wallBox(0, -D / 2, W, 0.3);
  wallBox(0, D / 2, W, 0.3);
  box(ctx, { x: 0, y: Y - 0.1, z: 0, w: W, h: 0.1, d: D, color: '#8a6a4a', collide: false });
  for (let i = 0; i < 9; i++) ctx.solid.box(0.02, 0.012, D, { position: [-W / 2 + 0.3 + i * 0.58, Y + 0.006, 0], color: '#5e4632', jitter: 0 });
  ctx.solid.box(W, 0.1, D, { position: [0, Y + H + 0.05, 0], color: '#d8d0c0' });
  for (let i = 0; i < 4; i++) ctx.solid.box(W, 0.16, 0.16, { position: [0, Y + H - 0.08, -D / 2 + 0.9 + i * 1.6], color: '#6a4c34' });
  for (const [x, z, w, d] of [[0, -D / 2 + 0.16, W, 0.03], [0, D / 2 - 0.16, W, 0.03], [-W / 2 + 0.21, 0, 0.03, D], [W / 2 - 0.21, 0, 0.03, D]]) {
    ctx.solid.box(w, 0.2, d, { position: [x, Y + 0.1, z], color: wood, jitter: 0.02 });
    ctx.solid.box(w, 0.06, d, { position: [x, Y + 0.92, z], color: wood, jitter: 0.02 });
  }
  // Door in the south wall to the stairs.
  ctx.solid.box(0.9, 2.0, 0.05, { position: [1.6, Y + 1.0, D / 2 - 0.17], color: '#6a4a32' });
  ctx.solid.add(new THREE.SphereGeometry(0.04, 6, 4), { position: [1.25, Y + 1.0, D / 2 - 0.2], color: '#c8a050' });

  // Long table with Bibles, papers and candles.
  box(ctx, { x: 0, y: Y, z: -0.2, w: 1.0, h: 0.76, d: 3.4, color: '#6a4a32' });
  for (const [x, z, rot] of [[-0.25, -1.4, 0.2], [0.28, -0.6, -0.3], [-0.3, 0.3, 0.1], [0.25, 1.1, 0.4], [0.1, -1.8, 0]]) {
    ctx.solid.box(0.18, 0.05, 0.25, { position: [x, Y + 0.79, z], rotation: [0, rot, 0], color: '#2e2622' });
    ctx.solid.box(0.17, 0.035, 0.24, { position: [x, Y + 0.79, z], rotation: [0, rot, 0], color: '#efe6d0', jitter: 0 });
  }
  for (const [x, z] of [[0.3, 0.6], [-0.2, -1.0], [0.1, 1.4]]) ctx.solid.box(0.22, 0.005, 0.3, { position: [x, Y + 0.765, z], rotation: [0, x, 0], color: '#f4ecda', jitter: 0 });
  for (const z of [-1.2, 0.8]) candle(ctx, { x: 0, y: Y + 0.76, z });
  for (const x of [-0.8, 0.8]) bench(ctx, { x, y: Y, z: -0.2, len: 3.2, rot: Math.PI / 2 });
  // Chair at the head of the table.
  ctx.solid.box(0.5, 0.05, 0.5, { position: [0, Y + 0.46, -2.4], color: '#5e4430' });
  ctx.solid.box(0.5, 0.6, 0.05, { position: [0, Y + 0.78, -2.65], color: '#5e4430' });

  // Iron box stove with its pipe.
  const sx = 1.8, sz = 2.2;
  box(ctx, { x: sx, y: Y + 0.2, z: sz, w: 0.6, h: 0.6, d: 0.9, color: '#2a2826' });
  for (const [dx, dz] of [[-0.25, -0.4], [0.25, -0.4], [-0.25, 0.4], [0.25, 0.4]]) ctx.solid.box(0.06, 0.2, 0.06, { position: [sx + dx, Y + 0.1, sz + dz], color: '#2a2826' });
  ctx.glow.box(0.02, 0.22, 0.3, { position: [sx - 0.31, Y + 0.5, sz], color: '#ff8a30' });
  ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.08, H - 0.8, 8), { position: [sx, Y + 0.8 + (H - 0.8) / 2, sz + 0.2], color: '#3a3634' });
  const fire = light(ctx, { position: [sx - 0.6, Y + 0.6, sz], color: '#ff9a50', intensity: 3, distance: 5 });
  ctx.onFrame((t) => (fire.intensity = 3 + Math.sin(t * 7) * 0.4));
  for (let i = 0; i < 6; i++) ctx.solid.box(0.5, 0.1, 0.1, { position: [sx + 0.55, Y + 0.05 + i * 0.1, sz - 0.7 + (i % 2) * 0.08], rotation: [0, 0.1 * i, 0], color: '#6a4a30' });
  // Coats and hats on pegs.
  for (let i = 0; i < 6; i++) {
    const z = -2.9 + i * 0.5;
    if (Math.abs(z - -1.8) < 0.5 || Math.abs(z - 1.8) < 0.5) continue;
    ctx.solid.box(0.12, 0.8, 0.35, { position: [-W / 2 + 0.28, Y + 1.25, z], color: '#2a2a2e' });
  }
  ctx.solid.box(0.06, 0.05, D, { position: [-W / 2 + 0.24, Y + 1.7, 0], color: wood, jitter: 0 });
}

function town(ctx) {
  const homes = [
    [-16, -14, 0.1, '#e4dccb'], [-18, 10, -0.2, '#d8cbb4'], [16, -18, 0.3, '#e8e2d4'], [20, 8, -0.1, '#c8a888'], [4, -26, 0, '#e4dccb'], [-6, 22, 0.15, '#d8d0c0'], [30, -30, 0.5, '#e0d8c8'], [-32, -30, -0.4, '#d8cbb4'],
  ];
  for (const [x, z, rot, color] of homes) frameHouse(ctx, { x, z, rot, color, roof: '#5a5258', lit: true, w: 7 + Math.abs(x) % 3, d: 6, h: 5 });
  for (const [x, z] of [[-10, 2], [10, -6], [-26, -2], [26, 18], [-4, -16], [12, 24]]) leafy(ctx, x, z, 7, '#e8ecf2');
}

export default {
  title: 'D&C 88:127-141: The School of the Prophets',
  seed: 88,
  fov: 66,
  exposure: 1.05,

  sun: { direction: [0.3, 0.3, 0.9], color: '#e8ecf6', intensity: 1.4 },
  light: { sky: '#c4ccdc', ground: '#8a7660', hemi: 1.25 },
  sky: { top: '#7a8498', horizon: '#c4c8d0', ground: '#d0d4dc', sunColor: '#f0f2f8', glow: 0.3 },
  fog: { color: '#bcc2cc', near: 30, far: 260 },
  clouds: { count: 90, shadow: '#8a909c', lit: '#d8dce4', rim: '#eef0f4', distance: [150, 700], altitude: [60, 140], hole: 0.05 },
  mountains: { count: 20, color: '#9ca4b0', radius: [380, 560], height: [16, 34], haze: 0.7 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.0, contrast: 1.05, vignette: 0.48, shadowTint: '#2e3044', highlightTint: '#fff0dc' },
  shadow: { center: [0, 0], radius: 30 },

  player: { start: [-1.45, 2.8], yaw: -0.2, pitch: -0.1, eye: 1.65, speed: 2.2 },

  terrain: {
    size: 700,
    segments: 140,
    seed: 133,
    hills: 16,
    hillScale: 0.008,
    bumps: 0.15,
    flats: [{ x: 0, z: 0, r: 40, falloff: 30, height: 0 }],
    colors: { ground: '#e8ecf2', groundAlt: '#dce2ea', grass: '#eef0f4', high: '#f2f4f8', rock: '#a8acb4' },
    patches: [{ x: 0, z: 12, r: 6, color: '#a89a88', strength: 0.4, rough: 0.6 }],
  },

  objects: [],
  scatter: [],

  figures: [{ x: JOSEPH[0], z: JOSEPH[1], y: Y, face: [0, 4], robe: '#2a2a30', mantle: '#22242a', skin: '#e0b48f', arms: 'out' }],

  custom(ctx) {
    store(ctx);
    room(ctx);
    town(ctx);
    const left = Array.from({ length: 5 }, (_, i) => [-0.8, -1.5 + i * 0.66]);
    const right = Array.from({ length: 5 }, (_, i) => [0.8, -1.5 + i * 0.66]);
    crowd(ctx, [
      { points: left, count: left.length, face: [6, -0.2], palette: period.men, seated: true, y: Y + 0.02, children: 0, seed: 11 },
      { points: right, count: right.length, face: [-6, -0.2], palette: period.men, seated: true, y: Y + 0.02, children: 0, seed: 12 },
      { points: [[-1.9, -2.6], [1.9, -2.5], [-2.0, 0.2], [2.0, 0.6]], count: 4, face: [0, -0.5], palette: period.men, y: Y, children: 0, seed: 13 },
    ]);
    light(ctx, { position: [0, Y + 2.1, -0.4], color: '#ffe2b8', intensity: 3.5, distance: 7 });
    light(ctx, { position: [W / 2 - 0.4, Y + 1.5, -1.8], color: '#dfe8ff', intensity: 2, distance: 4 });
  },
};
