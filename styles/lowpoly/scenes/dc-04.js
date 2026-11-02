// D&C 20-21: The Church is organized in Peter Whitmer Sr.'s log home in Fayette, New York, April 6, 1830.
// The player stands at the back of the main room (south, +z) looking north to Joseph Smith, Oliver Cowdery and the sacrament table.
import * as THREE from 'three';
import { crowd, rows, period, logRoom, bench, fireplace, light, candle, box, leafy, rail, frameHouse } from './lib/dc-01-kit.js';
import { rng } from '../engine/util.js';

const W = 9.6, D = 7.6, H = 2.7;
const JOSEPH = [0.4, -2.75];
const OLIVER = [-0.6, -2.7];
const TABLE = [1.6, -2.6];

function room(ctx) {
  logRoom(ctx, {
    w: W, d: D, h: H, log: '#7d5c40', chink: '#b9aa8c',
    openings: [
      { wall: 's', at: 2.8, width: 1.1, bottom: 0, top: 2.0 },
      { wall: 'e', at: -1.6, width: 0.9, bottom: 0.9, top: 1.9, pane: '#e8eef0' },
      { wall: 'e', at: 1.8, width: 0.9, bottom: 0.9, top: 1.9, pane: '#e8eef0' },
      { wall: 'n', at: -2.6, width: 0.9, bottom: 0.9, top: 1.9, pane: '#e2ecf2' },
      { wall: 's', at: -2.2, width: 0.9, bottom: 0.9, top: 1.9, pane: '#f2eee0' },
    ],
  });
  ctx.solid.box(W, 0.1, D, { position: [0, -0.05, 0], color: '#8a6a4c', jitter: 0.06 });
  for (let i = 0; i < 16; i++) ctx.solid.box(0.02, 0.012, D, { position: [-W / 2 + i * 0.6, 0.005, 0], color: '#5e4632', jitter: 0 });
  ctx.solid.box(W + 0.6, 0.12, D + 0.6, { position: [0, H + 0.06, 0], color: '#6b5038' });
  for (let i = 0; i < 6; i++) ctx.solid.box(0.24, 0.24, D, { position: [-W / 2 + 0.9 + i * 1.6, H - 0.12, 0], color: '#4e3826' });
  const ridge = 2.4;
  for (const side of [-1, 1]) {
    const slope = Math.hypot(W / 2 + 0.5, ridge);
    ctx.solid.box(slope, 0.16, D + 1, { position: [side * (W / 4 + 0.25), H + ridge / 2, 0], rotation: [0, 0, -side * Math.atan2(ridge, W / 2 + 0.5)], color: '#5a4a3a' });
  }
  for (const side of [-1, 1]) {
    const tri = new THREE.BufferGeometry();
    const pts = side > 0 ? [-W / 2, 0, 0, W / 2, 0, 0, 0, ridge, 0] : [-W / 2, 0, 0, 0, ridge, 0, W / 2, 0, 0];
    tri.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    ctx.solid.add(tri, { position: [0, H + 0.12, side * D / 2], color: '#7d5c40' });
  }
  fireplace(ctx, { x: -W / 2 + 0.45, z: 0.4, rot: Math.PI / 2, color: '#8c7464', tall: 3.2 });
  ctx.solid.box(1.1, 3, 1.4, { position: [-W / 2 - 0.4, H + 1.4, 0.4], color: '#8c7464' });
  // Ladder to the loft and a few household things.
  for (const s of [-1, 1]) ctx.solid.box(0.06, H, 0.06, { position: [W / 2 - 0.5 + s * 0.22, H / 2, -D / 2 + 0.5], rotation: [0.15, 0, 0], color: '#6a4a30' });
  for (let i = 0; i < 7; i++) ctx.solid.box(0.44, 0.04, 0.04, { position: [W / 2 - 0.5, 0.3 + i * 0.36, -D / 2 + 0.5 - (i * 0.36 - 1.2) * 0.15], color: '#6a4a30' });
  ctx.solid.box(1.8, 0.05, 0.3, { position: [-W / 2 + 0.5, 1.7, -2.4], color: '#5e4430' });
  for (let i = 0; i < 5; i++) ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.06, 0.14, 7), { position: [-W / 2 + 0.5, 1.8, -3.1 + i * 0.3], color: ['#c8c0b0', '#7a8aa0', '#b07850'][i % 3] });
  ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), { position: [-W / 2 + 0.5, 1.95, -1.9], rotation: [0, 0, Math.PI / 2], color: '#3a4a3e' });
}

function sacrament(ctx) {
  const [tx, tz] = TABLE;
  box(ctx, { x: tx, z: tz, w: 1.3, h: 0.76, d: 0.7, color: '#6a4a32' });
  ctx.solid.box(1.36, 0.02, 0.76, { position: [tx, 0.77, tz], color: '#f4f0e6', jitter: 0 });
  for (const s of [-1, 1]) ctx.solid.box(0.02, 0.35, 0.76, { position: [tx + s * 0.68, 0.6, tz], color: '#f4f0e6', jitter: 0 });
  ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.14, 0.03, 10), { position: [tx - 0.3, 0.79, tz], color: '#c8ccd0' });
  ctx.solid.add(new THREE.BoxGeometry(0.22, 0.08, 0.14), { position: [tx - 0.3, 0.83, tz], color: '#c89a5e' });
  ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.035, 0.14, 8), { position: [tx + 0.25, 0.85, tz], color: '#c8ccd0' });
  ctx.solid.box(0.24, 0.05, 0.18, { position: [tx + 0.05, 0.8, tz + 0.15], color: '#3a2a22' });
  candle(ctx, { x: tx + 0.5, y: 0.78, z: tz - 0.2 });
}

export default {
  title: 'D&C 20-21: The Church is organized',
  seed: 406,
  fov: 66,
  exposure: 1.05,

  sun: { direction: [0.5, 0.55, 0.65], color: '#fff0d8', intensity: 2.4 },
  light: { sky: '#c8d4e8', ground: '#7a5c42', hemi: 1.35 },
  sky: { top: '#6a8ec4', horizon: '#dfe4e2', ground: '#9a9478', sunColor: '#fff4dc', glow: 0.6 },
  fog: { color: '#cdd4d0', near: 40, far: 360 },
  clouds: { count: 40, shadow: '#9aa0b0', lit: '#f6f6f4', rim: '#ffffff', distance: [240, 800], altitude: [100, 200], hole: 0.1 },
  mountains: { count: 24, color: '#7a8478', radius: [400, 600], height: [18, 40], haze: 0.6 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.05, contrast: 1.05, vignette: 0.45, shadowTint: '#3a3040', highlightTint: '#fff0d8' },
  shadow: { center: [0, 4], radius: 30 },

  player: { start: [0.2, 3.0], yaw: 0, pitch: -0.06, eye: 1.65, speed: 2.6 },

  terrain: {
    size: 700,
    segments: 140,
    seed: 46,
    hills: 18,
    hillScale: 0.007,
    bumps: 0.15,
    flats: [{ x: 0, z: 6, r: 30, falloff: 30, height: -0.05 }],
    colors: { ground: '#7a6e4c', groundAlt: '#6c7044', grass: '#7a804a', high: '#7c7a5a', rock: '#776c58' },
    patches: [
      { x: 30, z: 40, r: 10, color: '#e8ecee', strength: 0.7, rough: 0.6 },
      { x: -40, z: -20, r: 12, color: '#e8ecee', strength: 0.7, rough: 0.6 },
      { x: -10, z: 50, r: 8, color: '#e8ecee', strength: 0.6, rough: 0.6 },
    ],
  },

  objects: [],
  scatter: [],

  figures: [
    { x: JOSEPH[0], z: JOSEPH[1], face: [0, 4], robe: '#2a2a30', mantle: '#22242a', skin: '#e0b48f', arms: 'out' },
    { x: OLIVER[0], z: OLIVER[1], face: [0, 4], robe: '#3a332c', mantle: '#2c2824', skin: '#d9ad88', arms: 'down' },
  ],

  custom(ctx) {
    room(ctx);
    sacrament(ctx);
    const r = rng(9);
    const seats = rows(r, { x0: -3.4, x1: 3.6, z0: -0.9, z1: 1.1, dx: 0.6, dz: 1.0, skip: (x) => Math.abs(x - 0.2) < 0.45 });
    for (let z = -0.9; z <= 1.2; z += 1.0) {
      bench(ctx, { x: -1.85, z: z + 0.12, len: 3.4 });
      bench(ctx, { x: 2.25, z: z + 0.12, len: 2.9 });
    }
    const half = Math.floor(seats.length / 2);
    const front = [[-2.2, -2.2], [-1.6, -2.4], [2.6, -2.0], [3.2, -2.3], [-3.0, -2.0]];
    const east = Array.from({ length: 9 }, (_, i) => [W / 2 - 0.45, -2.2 + i * 0.6]);
    const west = Array.from({ length: 6 }, (_, i) => [-W / 2 + 0.45, 1.2 + i * 0.5]);
    const back = Array.from({ length: 6 }, (_, i) => [-3.6 + i * 0.62, D / 2 - 0.5]);
    crowd(ctx, [
      { points: seats.slice(0, half), count: half, face: [0, -6], palette: period.women, seated: true, y: 0.02, children: 0.15, seed: 1 },
      { points: seats.slice(half), count: seats.length - half, face: [0, -6], palette: period.men, seated: true, y: 0.02, children: 0.1, seed: 2 },
      { points: front, count: front.length, face: [0, 1], palette: period.men, y: 0, children: 0, seed: 3 },
      { points: east, count: east.length, face: [0, -1], palette: period.men, y: 0, children: 0.1, seed: 4 },
      { points: west, count: west.length, face: [0, -2], palette: period.women, y: 0, children: 0.2, seed: 5 },
      { points: back, count: back.length, face: [0, -3], palette: period.men, y: 0, children: 0.15, seed: 6 },
    ]);
    light(ctx, { position: [0.4, 1.9, -1.2], color: '#ffe6c0', intensity: 5, distance: 10 });
    light(ctx, { position: [3.8, 1.6, 0], color: '#dfe8ff', intensity: 3, distance: 6 });
    // Farmyard outside the door.
    frameHouse(ctx, { x: 26, z: 30, rot: -0.6, w: 8, d: 6, h: 3.4, color: '#8a7058', roof: '#4a4038' });
    rail(ctx, [[-30, 16], [-6, 18], [20, 14], [44, 18]]);
    for (const [x, z] of [[-14, 26], [12, 40], [-30, 44], [36, 2], [-26, -8]]) leafy(ctx, x, z, 8, '#6a6a44');
    crowd(ctx, [{ count: 26, center: [3, 16], ring: [3, 9], arc: [-2.6, -0.5], spacing: 1.1, face: [2.8, D / 2], palette: period.men, hats: 0.8, seed: 7 }]);
  },
};
