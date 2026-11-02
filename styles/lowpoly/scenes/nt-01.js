// Luke 1:26-38: Gabriel comes to Mary in her home in Nazareth.
// Mary's one-room house sits at the origin with its door facing south (+z). The player starts inside, looking east.
import * as THREE from 'three';
import { block, house, jar, lamp, olive, cypress, shrub, stoneWall, sprite } from './lib/nt-01-kit.js';
import { rng } from '../engine/util.js';

const PLASTER = '#c9b28c';
const STONE = '#b9a27f';
const W = 8, D = 6, H = 3.2, T = 0.5;
const GABRIEL = [2.5, 0.9];
const MARY = [0.1, -1.2];

function room(ctx) {
  const wall = (x, z, w, d, h = H, y = 0) => block(ctx, { x, y, z, w, h, d, color: PLASTER, jitter: 0.04 });
  wall(0, -D / 2 + T / 2, W, T);
  wall(-W / 2 + T / 2, 0, T, D);
  // East wall with a window looking out over the village.
  const ex = W / 2 - T / 2;
  wall(ex, -1.9, T, 2.2);
  wall(ex, 1.9, T, 2.2);
  wall(ex, 0, T, 1.6, 1.2);
  wall(ex, 0, T, 1.6, 0.9, 2.3);
  block(ctx, { x: ex - 0.05, y: 1.12, z: 0, w: T + 0.25, h: 0.1, d: 1.8, color: '#6e5038', collide: false });
  // South wall with the door toward the east end.
  const dz = D / 2 - T / 2;
  wall(-1.3, dz, 5.4, T);
  wall(3.3, dz, 1.4, T);
  wall(2, dz, 1.2, 1, 1, 2.2);
  block(ctx, { x: 2, y: 2.15, z: dz, w: 1.6, h: 0.16, d: T + 0.15, color: '#5a4330', collide: false });
  // Floor, roof and ceiling beams.
  block(ctx, { x: 0, y: -0.2, z: 0, w: W, h: 0.25, d: D, color: '#8d7258', collide: false });
  ctx.solid.box(W + 0.6, 0.35, D + 0.6, { position: [0, H + 0.2, 0], color: '#a08664' });
  for (let i = 0; i < 7; i++) ctx.solid.box(0.22, 0.22, D, { position: [-W / 2 + 0.7 + i * 1.1, H - 0.1, 0], color: '#5b4330' });
  for (const [x, z, w, d] of [[0, -D / 2 - 0.2, W + 0.6, 0.3], [0, D / 2 + 0.2, W + 0.6, 0.3], [-W / 2 - 0.2, 0, 0.3, D], [W / 2 + 0.2, 0, 0.3, D]]) {
    ctx.solid.box(w, 0.5, d, { position: [x, H + 0.6, z], color: STONE });
  }
  // A plaster band near the floor.
  for (const [x, z, w, d] of [[0, -D / 2 + T + 0.01, W - 2 * T, 0.04], [-W / 2 + T + 0.01, 0, 0.04, D - 2 * T]]) {
    ctx.solid.box(w, 0.5, d, { position: [x, 0.25, z], color: '#a98e6c', jitter: 0.02 });
  }
}

function furnish(ctx) {
  // Loom against the north wall with a half-woven cloth.
  const lx = -1.4, lz = -2.45;
  for (const s of [-1, 1]) block(ctx, { x: lx + s * 0.9, y: 0, z: lz, w: 0.1, h: 2, d: 0.1, color: '#5c4330', collide: false });
  ctx.solid.box(2, 0.1, 0.12, { position: [lx, 1.95, lz], color: '#5c4330' });
  ctx.solid.box(2, 0.1, 0.12, { position: [lx, 0.55, lz], color: '#5c4330' });
  ['#b8a37a', '#8c4b3a', '#d8cbb0', '#4f6a8c', '#d8cbb0', '#8c4b3a'].forEach((c, i) => {
    ctx.solid.box(1.6, 0.22, 0.03, { position: [lx, 0.72 + i * 0.22, lz + 0.02], color: c, jitter: 0.03 });
  });
  for (let i = 0; i < 8; i++) ctx.solid.box(0.015, 0.6, 0.015, { position: [lx - 0.7 + i * 0.2, 2.1 - 0.75 + 0.3 * 0, lz + 0.02], scale: [1, 0.9, 1], color: '#e6dccb', jitter: 0 });
  ctx.solid.add(new THREE.DodecahedronGeometry(0.12, 0), { position: [lx - 0.55, 0.3, lz + 0.05], scale: [1, 1, 1], color: '#4f6a8c' });

  // Low table with bread and a bowl, a stool, and a rolled sleeping mat.
  block(ctx, { x: -2.6, y: 0, z: 1.4, w: 1.4, h: 0.38, d: 0.8, color: '#6a4c34' });
  ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.12, 0.1, 8), { position: [-2.9, 0.43, 1.4], color: '#a86d45' });
  ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 8), { position: [-2.3, 0.41, 1.25], color: '#d9b07a' });
  ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 8), { position: [-2.28, 0.46, 1.27], color: '#cfa36c' });
  block(ctx, { x: -1.6, y: 0, z: 2.2, w: 0.45, h: 0.4, d: 0.45, color: '#6f5238' });
  ctx.solid.add(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8), { position: [-3.3, 0.3, -1.2], rotation: [Math.PI / 2, 0, 0], color: '#9b8665' });
  ctx.solid.box(0.9, 0.06, 1.9, { position: [-3.25, 0.03, 0.4], color: '#7b4a3a' });

  // Water jars, baskets and a shelf niche with a lamp.
  jar(ctx, { x: 3.3, z: -2.4, y: 0, h: 0.9, color: '#a8673e' });
  jar(ctx, { x: 2.75, z: -2.5, y: 0, h: 0.65, color: '#b67a4c' });
  jar(ctx, { x: 3.4, z: -1.75, y: 0, h: 0.55, color: '#9a5c38' });
  for (const [x, z] of [[-0.2, -2.5], [0.4, -2.55]]) ctx.solid.add(new THREE.CylinderGeometry(0.28, 0.22, 0.3, 8), { position: [x, 0.15, z], color: '#b49460' });
  block(ctx, { x: 0.9, y: 1.5, z: -2.68, w: 1.6, h: 0.08, d: 0.35, color: '#6a4c34', collide: false });
  jar(ctx, { x: 0.5, z: -2.65, y: 1.58, h: 0.35, color: '#a8673e' });
  jar(ctx, { x: 1.2, z: -2.65, y: 1.58, h: 0.28, color: '#c08a5a' });
  lamp(ctx, { x: 0.85, y: 1.58, z: -2.6, light: 3, distance: 6 });
  // Hanging herbs from a beam.
  for (let i = 0; i < 5; i++) ctx.solid.add(new THREE.ConeGeometry(0.08, 0.4, 5), { position: [-3.3 + i * 0.22, H - 0.45, -2.2], rotation: [Math.PI, 0, 0], color: '#6d7a42' });
}

function courtyard(ctx) {
  stoneWall(ctx, [[-4.3, 3.2], [-4.3, 11], [-0.5, 11]], { h: 1.1 });
  stoneWall(ctx, [[2.5, 11], [6.5, 11], [6.5, 3.2]], { h: 1.1 });
  olive(ctx, -2.4, 7.4, 4.2);
  jar(ctx, { x: 5.6, z: 4.2, h: 0.9 });
  jar(ctx, { x: 5.0, z: 3.8, h: 0.7, color: '#b67a4c' });
  // Clay bread oven.
  ctx.solid.add(new THREE.SphereGeometry(0.75, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), { position: [4.8, ctx.heightAt(4.8, 8.6), 8.6], color: '#9a6a46' });
  ctx.colliders.add({ x: 4.8, z: 8.6, w: 1.4, d: 1.4, bottom: 0, top: 0.7 });
  ctx.solid.box(1.4, 0.05, 1, { position: [1.5, 0.03, 6.5], color: '#a68d68' });
}

function village(ctx) {
  const r = rng(31);
  const placed = [[0, 0], [1, 7]];
  for (let tries = 0; placed.length < 40 && tries < 2000; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r.range(15 ** 2, 110 ** 2));
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 11)) continue;
    if (x > -8 && x < 12 && z > 0 && z < 40) continue;
    placed.push([x, z]);
    const rot = Math.round((Math.atan2(-x, -z) + r.range(-0.3, 0.3)) / (Math.PI / 2)) * (Math.PI / 2);
    house(ctx, { x, z, rot, w: r.range(5, 8), d: r.range(4.5, 6.5), h: r.range(2.6, 3.4), color: r.pick(['#cdb894', '#c4ad86', '#d6c4a2', '#b9a27f']), upper: r() < 0.3, windows: true });
    if (r() < 0.5) olive(ctx, x + r.range(-6, 6), z + r.range(-6, 6));
  }
  for (let i = 0; i < 60; i++) {
    const a = r() * Math.PI * 2, d = r.range(18, 160);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 6)) continue;
    if (r() < 0.6) olive(ctx, x, z);
    else if (r() < 0.5) cypress(ctx, x, z, r.range(5, 8));
    else shrub(ctx, x, z, r.range(0.5, 1));
  }
}

export default {
  title: 'Luke 1:26-38: The Annunciation',
  seed: 101,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.75, 0.6, 0.35], color: '#ffe2b0', intensity: 2.6 },
  light: { sky: '#bcd0f0', ground: '#7a6048', hemi: 0.9 },
  sky: { top: '#5f8fd0', horizon: '#e9dcc0', ground: '#c9b08a', sunColor: '#fff0c8', glow: 0.8 },
  fog: { color: '#dccfb4', near: 60, far: 520 },
  clouds: { count: 30, shadow: '#b9b6c0', lit: '#fff6e6', rim: '#ffffff', distance: [300, 900], altitude: [120, 220], hole: 0.2 },
  mountains: { count: 40, color: '#7d8268', radius: [420, 650], height: [22, 60], haze: 0.5 },
  bloom: { strength: 0.5, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.05, vignette: 0.4, shadowTint: '#3a3050', highlightTint: '#fff0d0' },
  shadow: { center: [0, 4], radius: 40 },

  player: { start: [-1.45, 2.05], yaw: -0.88, pitch: -0.14, eye: 1.6, speed: 3.2 },

  terrain: {
    size: 700,
    segments: 140,
    seed: 41,
    hills: 34,
    hillScale: 0.009,
    bumps: 0.25,
    flats: [{ x: 1, z: 4, r: 16, falloff: 18, height: 0 }],
    colors: { ground: '#9c8c5c', groundAlt: '#8f8a52', grass: '#7f9150', high: '#9a8d6c', rock: '#8a7b66' },
    patches: [{ x: 1, z: 6, r: 9, color: '#b49c76', strength: 0.8, rough: 0.3 }],
  },

  objects: [],
  scatter: [],

  figures: [
    { x: MARY[0], z: MARY[1], y: -0.42, face: GABRIEL, scale: 0.98, robe: '#c9b48c', mantle: '#4c6c9c', skin: '#a8754f', arms: 'down', hood: true },
    {
      x: GABRIEL[0], z: GABRIEL[1], y: 0.12, face: MARY, scale: 1.12, robe: '#fffcf3', mantle: '#f6f0e2', skin: '#fbefd8', arms: 'out', emissive: 0.45, hood: true,
      light: { color: '#fff0cf', intensity: 5, distance: 9 },
      halo: { size: 3.4, opacity: 0.4, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'ring', position: [GABRIEL[0], 0.08, GABRIEL[1]], radius: 0.9, width: 0.55, color: '#ffe8b0', opacity: 0.8 },
    { type: 'motes', position: [GABRIEL[0], 0.1, GABRIEL[1]], radius: 1.2, height: 3, count: 70, size: 0.035 },
  ],

  custom(ctx) {
    room(ctx);
    furnish(ctx);
    courtyard(ctx);
    village(ctx);
    sprite(ctx, { position: [GABRIEL[0], 1.2, GABRIEL[1]], size: 2.4, color: '#fff6e0', opacity: 0.2 });
    const fill = new THREE.PointLight('#ffd9a0', 3, 8, 1.5);
    fill.position.set(-2.5, 2.6, 0.5);
    ctx.scene.add(fill);
  },
};
