// D&C 109: The Kirtland Temple is dedicated on March 27, 1836. The lower court is packed with Saints in white box pews
// between the two tiers of pulpits. Joseph Smith reads the dedicatory prayer from the Melchizedek pulpits at the far end (-z).
// The player stands in the center aisle near the Aaronic pulpits (+z).
import * as THREE from 'three';
import { crowd, person, rows, period, box, light, softGlow } from './lib/dc-01-kit.js';
import { rng } from '../engine/util.js';

const W = 17, D = 22, H = 6.6, VAULT = 2.4;
const WHITE = '#f2eee4', TRIM = '#e2dccf', RAIL = '#5e4430';
const BANKS = [[-7.7, -4.5], [-3.6, -1.4], [1.4, 3.6], [4.5, 7.7]];
const ROWS = Array.from({ length: 10 }, (_, i) => -5.3 + i * 1.15);
const JOSEPH = [0, -7.3];

function shell(ctx) {
  box(ctx, { x: 0, y: -0.1, z: 0, w: W, h: 0.1, d: D, color: '#a8865e', collide: false });
  for (let i = 0; i < 28; i++) ctx.solid.box(0.02, 0.01, D, { position: [-W / 2 + 0.3 + i * 0.6, 0.006, 0], color: '#7a5c40', jitter: 0 });
  const wall = (x, z, w, d, h = H, y = 0) => box(ctx, { x, y, z, w, h, d, color: WHITE, jitter: 0.02 });
  const wins = [-7.5, -3, 1.5, 6];
  for (const side of [-1, 1]) {
    const x = side * (W / 2 + 0.2);
    let start = -D / 2;
    for (const z of wins) {
      wall(x, (start + z - 0.8) / 2, 0.4, z - 0.8 - start);
      wall(x, z, 0.4, 1.6, 1.4);
      wall(x, z, 0.4, 1.6, H - 5.2, 5.2);
      ctx.glow.box(0.05, 3.2, 1.4, { position: [x, 3.0, z], color: '#e8eef4' });
      const arch = new THREE.CircleGeometry(0.7, 10, 0, Math.PI);
      arch.rotateY(Math.PI / 2);
      ctx.glow.add(arch, { position: [x - side * 0.02, 4.6, z], rotation: [0, side > 0 ? Math.PI : 0, 0], color: '#e8eef4' });
      ctx.glow.add(arch, { position: [x - side * 0.02, 4.6, z], rotation: [0, side > 0 ? 0 : Math.PI, 0], color: '#e8eef4' });
      for (const dz of [-0.36, 0.36]) ctx.solid.box(0.08, 3.2, 0.05, { position: [x - side * 0.2, 3.0, z + dz], color: '#ffffff', jitter: 0 });
      for (const y of [2.0, 3.0, 4.0]) ctx.solid.box(0.08, 0.05, 1.4, { position: [x - side * 0.2, y, z], color: '#ffffff', jitter: 0 });
      ctx.solid.box(0.4, 0.1, 1.9, { position: [x - side * 0.25, 1.4, z], color: TRIM, jitter: 0 });
      start = z + 0.8;
    }
    wall(x, (start + D / 2) / 2, 0.4, D / 2 - start);
  }
  for (const side of [-1, 1]) {
    wall(0, side * (D / 2 + 0.2), W + 0.8, 0.4, H + VAULT + 0.4);
    ctx.glow.box(1.6, 2.4, 0.05, { position: [0, H + 0.4, side * (D / 2 - 0.02)], color: '#eef2f6' });
    const arch = new THREE.CircleGeometry(0.8, 10, 0, Math.PI);
    ctx.glow.add(arch, { position: [0, H + 1.6, side * (D / 2 - 0.03)], rotation: [0, side > 0 ? Math.PI : 0, 0], color: '#eef2f6' });
  }
  // Side ceilings and the central barrel vault on two rows of columns.
  for (const side of [-1, 1]) ctx.solid.box(W / 2 - 4, 0.2, D, { position: [side * (W / 4 + 2), H + 0.1, 0], color: WHITE, jitter: 0.02 });
  const segs = 8;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI, a1 = ((i + 1) / segs) * Math.PI, am = (a0 + a1) / 2;
    const x0 = Math.cos(a0) * 4, y0 = Math.sin(a0) * VAULT, x1 = Math.cos(a1) * 4, y1 = Math.sin(a1) * VAULT;
    ctx.solid.box(Math.hypot(x1 - x0, y1 - y0) + 0.05, 0.16, D, { position: [(x0 + x1) / 2, H + (y0 + y1) / 2 + 0.08, 0], rotation: [0, 0, Math.atan2(y1 - y0, x1 - x0)], color: i % 2 ? WHITE : '#ebe6da', jitter: 0.01 });
  }
  for (const side of [-1, 1]) {
    ctx.solid.box(0.5, 0.4, D, { position: [side * 4, H - 0.1, 0], color: TRIM, jitter: 0 });
    for (const z of [-7.4, -2.8, 1.8, 6.4]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.2, 0.24, H - 0.3, 10), { position: [side * 4, (H - 0.3) / 2, z], color: WHITE, jitter: 0.01 });
      ctx.solid.box(0.55, 0.3, 0.55, { position: [side * 4, H - 0.4, z], color: TRIM, jitter: 0 });
      ctx.solid.box(0.55, 0.25, 0.55, { position: [side * 4, 0.12, z], color: TRIM, jitter: 0 });
      ctx.colliders.add({ x: side * 4, z, w: 0.5, d: 0.5, bottom: 0, top: H });
    }
  }
  ctx.solid.box(W, 0.3, 0.2, { position: [0, H - 0.15, -D / 2 + 0.1], color: TRIM, jitter: 0 });
}

// Four rising tiers of three pulpits, facing toward the center of the hall.
function pulpits(ctx, end) {
  const s = Math.sign(end);
  const zEdge = end;
  for (let i = 0; i < 4; i++) {
    const depth = 1.05, y = i * 0.62, w = 6.2 - i * 0.6;
    const zFront = zEdge - s * (4.4 - i * depth);
    const zc = zFront + s * depth / 2;
    box(ctx, { x: 0, y: 0, z: zc, w, h: y + 0.2, d: depth, color: TRIM });
    for (let k = -1; k <= 1; k++) {
      const px = k * (w / 3);
      ctx.solid.box(w / 3 - 0.1, 1.1, 0.12, { position: [px, y + 0.2 + 0.55, zFront + s * 0.06], color: WHITE, jitter: 0.01 });
      ctx.solid.box(w / 3 - 0.02, 0.08, 0.3, { position: [px, y + 1.34, zFront + s * 0.1], color: RAIL, jitter: 0.02 });
      ctx.solid.box(w / 3 - 0.5, 0.6, 0.02, { position: [px, y + 0.8, zFront - s * 0.01], color: '#e6e0d2', jitter: 0 });
      ctx.solid.box(0.4, 0.4, 0.02, { position: [px, y + 0.8, zFront - s * 0.02], color: '#c8b48a', jitter: 0 });
    }
    ctx.colliders.add({ x: 0, z: zFront + s * 0.06, w, d: 0.14, bottom: y, top: y + 1.4 });
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) box(ctx, { x: side * 3.5, z: zEdge - s * (4.6 - i * 0.6), w: 0.8, h: (i + 1) * 0.32, d: 0.62, color: TRIM });
  }
  // Curtain valance over the pulpits.
  ctx.solid.box(7, 0.6, 0.12, { position: [0, H - 0.6, zEdge - s * 4.6], color: '#f6f2ea', jitter: 0 });
}

function pews(ctx) {
  for (const [x0, x1] of BANKS) {
    const w = x1 - x0, cx = (x0 + x1) / 2;
    for (const z of ROWS) {
      ctx.solid.box(w, 1.0, 0.06, { position: [cx, 0.5, z + 0.48], color: WHITE, jitter: 0.01 });
      ctx.solid.box(w, 0.05, 0.12, { position: [cx, 1.02, z + 0.48], color: RAIL, jitter: 0.02 });
      ctx.solid.box(w, 0.06, 0.42, { position: [cx, 0.44, z + 0.22], color: '#e8e2d4', jitter: 0.01 });
      for (const ex of [x0, x1]) ctx.solid.box(0.06, 1.0, 1.15, { position: [ex, 0.5, z], color: WHITE, jitter: 0.01 });
      ctx.colliders.add({ x: cx, z, w, d: 1.1, bottom: 0, top: 1.0 });
    }
    ctx.solid.box(w, 1.0, 0.06, { position: [cx, 0.5, ROWS[0] - 0.6], color: WHITE, jitter: 0.01 });
  }
}

export default {
  title: 'D&C 109: The Kirtland Temple dedication',
  seed: 109,
  fov: 66,
  exposure: 1.0,

  sun: { direction: [0.6, 0.6, 0.3], color: '#fff2dc', intensity: 1.6 },
  light: { sky: '#e8ecf4', ground: '#b09878', hemi: 1.45 },
  sky: { top: '#7c94b8', horizon: '#d8dce0', ground: '#a8a090', sunColor: '#fff4dc', glow: 0.4 },
  fog: { color: '#cfd4d8', near: 60, far: 400 },
  bloom: { strength: 0.45, radius: 0.55, threshold: 0.85 },
  grade: { saturation: 1.03, contrast: 1.06, vignette: 0.45, shadowTint: '#3a3448', highlightTint: '#fff2dc' },
  shadow: { center: [0, 0], radius: 20 },

  player: { start: [0.2, -1.6], yaw: 0, pitch: 0.06, eye: 1.65, speed: 3 },

  terrain: {
    size: 600,
    segments: 100,
    seed: 136,
    hills: 14,
    bumps: 0.1,
    flats: [{ x: 0, z: 0, r: 30, falloff: 30, height: -0.1 }],
    colors: { ground: '#7a7458', groundAlt: '#6c6a50', grass: '#787a52', high: '#7a7458', rock: '#776c58' },
  },

  objects: [],
  scatter: [],


  custom(ctx) {
    shell(ctx);
    pulpits(ctx, -D / 2);
    pulpits(ctx, D / 2);
    pews(ctx);
    person(ctx, { x: JOSEPH[0], z: JOSEPH[1], y: 0.2, face: [0, 10], coat: '#2a2e3e', vest: '#e8e0cc', trousers: '#8a7c62', hair: '#6a4626', skin: '#e6bf9b', arms: 'out', scale: 1.08 });
    const r = rng(36);
    const groups = [];
    BANKS.forEach(([x0, x1], b) => {
      const pts = rows(r, { x0: x0 + 0.3, x1: x1 - 0.25, z0: ROWS[0] + 0.1, z1: ROWS[ROWS.length - 1] + 0.1, dx: 0.52, dz: 1.15, jitter: 0.05 });
      const half = pts.filter((_, i) => i % 2 === 0), other = pts.filter((_, i) => i % 2 === 1);
      groups.push({ points: half, count: half.length, face: [0, -30], palette: period.women, seated: true, y: 0.02, children: 0.12, seed: 40 + b });
      groups.push({ points: other, count: other.length, face: [0, -30], palette: period.men, seated: true, y: 0.02, children: 0.08, seed: 50 + b });
    });
    const standing = [];
    for (let z = -7; z <= 7.5; z += 0.6) {
      standing.push([-W / 2 + 0.45, z], [W / 2 - 0.45, z]);
      if (r() < 0.6) standing.push([-4 + r.range(-0.2, 0.2), z + 0.3], [4 + r.range(-0.2, 0.2), z + 0.3]);
    }
    groups.push({ points: standing, count: standing.length, face: [0, -30], palette: period.men, y: 0, children: 0.1, seed: 60 });
    const pulpitMen = [];
    for (let i = 0; i < 4; i++) {
      const y = i * 0.62 + 0.2, w = 6.2 - i * 0.6;
      for (let k = -1; k <= 1; k++) {
        if (!(i === 0 && k === 0)) pulpitMen.push({ x: k * (w / 3) + 0.3, z: -D / 2 + 4.4 - i * 1.05 - 0.75, y });
        pulpitMen.push({ x: k * (w / 3) - 0.3, z: D / 2 - 4.4 + i * 1.05 + 0.75, y, back: true });
      }
    }
    for (const m of pulpitMen) groups.push({ points: [[m.x, m.z]], count: 1, face: [m.x, m.back ? -30 : 30], palette: period.men, y: m.y, children: 0, seed: 70 + Math.round(m.x * 10 + m.z) });
    crowd(ctx, groups);

    light(ctx, { position: [0, 4.5, -5], color: '#fff2dc', intensity: 8, distance: 18 });
    light(ctx, { position: [0, 4.5, 4], color: '#fff2dc', intensity: 6, distance: 16 });
    light(ctx, { position: [0, 3.5, -D / 2 + 2], color: '#ffe8c8', intensity: 4, distance: 8 });
    softGlow(ctx, { position: [0, H + 1.2, -D / 2 + 0.3], size: 5, color: '#fff6e0', opacity: 0.25 });
  },
};
