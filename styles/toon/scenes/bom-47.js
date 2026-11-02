// Mormon 8:1-5, Moroni 10: Moroni, the last of his people, hides up the plates in a stone box on the hill.
// The player walks as Moroni. x is east, z is south. The hill crowns the middle of the scene.
import * as THREE from 'three';
import { Batch, GROUND, ball, banner, box, campfire, cyl, disc, glow, lamp, makeNoiseHill, makeRng, rocks, stars, toonStyle } from './lib/bom-43-kit.js';

const HILL = [0, -8];
const BOX = [2, -12];
const CAMP = [-7, -4];

function stoneBox(b, ctx) {
  const [x, z] = BOX;
  const y = ctx.groundHeight(x, z) - 0.15;
  const stone = '#9a8e7e';
  b.add('#4a3a2a', box(2.6, 0.12, 2.0, [x, y + 0.08, z]), { cast: false });
  b.add(stone, box(1.7, 0.15, 1.2, [x, y + 0.1, z]), { stone: true });
  for (const [w, d, ox, oz] of [[1.7, 0.16, 0, 0.52], [1.7, 0.16, 0, -0.52], [0.16, 1.2, 0.77, 0], [0.16, 1.2, -0.77, 0]]) {
    b.add(stone, box(w, 0.6, d, [x + ox, y + 0.4, z + oz]), { stone: true });
  }
  for (let i = 0; i < 4; i++) b.add('#8a7e70', box(0.25, 0.25, 0.25, [x - 0.5 + i * 0.33, y + 0.3, z]), { stone: true });
  b.add('#d9a63a', box(0.62, 0.34, 0.5, [x, y + 0.6, z]), { emissive: '#6a4800' });
  for (let k = 0; k < 4; k++) b.add('#8a6a1a', box(0.64, 0.015, 0.52, [x, y + 0.46 + k * 0.08, z]), { cast: false });
  b.add('#5a3a22', cyl(0.025, 0.025, 0.6, [x - 0.31, y + 0.62, z], [Math.PI / 2, 0, 0], 5));
  b.add(stone, box(1.9, 0.18, 1.4, [x + 1.15, y + 0.62, z + 0.3], [0, 0.25, 1.1]), { stone: true });
  b.add('#6b5240', ball(0.9, [x - 1.8, y + 0.05, z - 0.6], [1.3, 0.45, 1], 8));
  b.add('#6b5240', ball(0.5, [x - 1.4, y + 0.05, z + 0.6], [1.2, 0.4, 1], 7));
  b.add('#6b4a33', cyl(0.035, 0.035, 1.5, [x - 1.3, y + 0.55, z + 1.0], [0.4, 0, 0.6], 5));
  b.add('#8a8a8a', box(0.25, 0.04, 0.32, [x - 1.75, y + 1.05, z + 1.4], [0.4, 0, 0.6]));
  ctx.addCollider({ x, z, hx: 0.95, hz: 0.7, rot: 0, top: y + 0.75 });
}

function camp(b, ctx) {
  const [x, z] = CAMP;
  const y = ctx.groundHeight(x, z);
  campfire(b, ctx, [x, z], { light: 6, distance: 12, size: 0.6 });
  b.add('#5e4632', box(0.9, 0.18, 2, [x - 1.6, y + 0.08, z + 0.6], [0, 0.3, 0]));
  b.add('#8c5a3c', cyl(0.22, 0.22, 0.9, [x - 1.75, y + 0.2, z - 0.4], [0, 0.3, Math.PI / 2], 8));
  b.add('#6b4a33', cyl(0.035, 0.04, 2.0, [x + 1.4, y + 0.95, z + 0.9], [0.15, 0, -0.35], 5));
  b.add('#a8743f', cyl(0.25, 0.2, 0.4, [x + 1.2, y + 0.2, z - 1.1], [0, 0, 0], 8));
}

function battlefield(b, ctx, rng) {
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2, r = 70 + rng() * 80;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const y = ctx.terrainHeight(x, z);
    b.add('#3a2418', cyl(0.03, 0.03, 3, [x, y + 0.6, z], [1.1 + rng() * 0.4, rng() * 6, 0], 4));
  }
  for (let i = 0; i < 7; i++) {
    const a = rng() * Math.PI * 2, r = 80 + rng() * 60;
    banner(b, ctx, [Math.sin(a) * r, Math.cos(a) * r], { height: 4, color: ['#7a2e24', '#5e4632', '#3e6e66'][i % 3], trim: '#8a7b6a', rot: rng() * 6 });
  }
}

function custom(ctx) {
  const rng = makeRng(47);
  const b = new Batch(ctx);
  makeNoiseHill(ctx, { center: HILL, radius: 62, height: 13, color: '#4f5a46', seed: 47, flatTop: 0.2, walk: true });
  stoneBox(b, ctx);
  camp(b, ctx);
  battlefield(b, ctx, rng);

  const crest = [];
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2, r = 9 + rng() * 24;
    const x = HILL[0] + Math.sin(a) * r, z = HILL[1] + Math.cos(a) * r;
    if (Math.hypot(x - 6, z + 2) < 6) continue;
    crest.push([x, z, 0.5 + rng() * 1.1, ctx.groundHeight(x, z) - ctx.terrainHeight(x, z)]);
  }
  rocks(ctx, crest, ['#6a6460', '#5a5652', '#7a726a']);

  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2, r = 14 + rng() * 26;
    const x = HILL[0] + Math.sin(a) * r, z = HILL[1] + Math.cos(a) * r;
    if (Math.hypot(x - BOX[0], z - BOX[1]) < 8 || Math.hypot(x - 6, z + 2) < 6) continue;
    const y = ctx.groundHeight(x, z) - 0.2, h = 4 + rng() * 4;
    b.add('#2e2620', cyl(0.18, 0.3, h, [x, y + h / 2, z], [0, 0, (rng() - 0.5) * 0.2], 6));
    for (let k = 0; k < 3; k++) b.add(['#2f4a42', '#3a5448', '#2a3e3a'][k], ball(1.4 + rng() * 0.6, [x + (rng() - 0.5) * 1.6, y + h + (k - 1) * 0.6, z + (rng() - 0.5) * 1.6], [1, 0.8, 1], 8));
    ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + h });
  }

  stars(ctx, { count: 1400, color: '#f2f0ff', size: 2.2, minY: 0.06 });
  disc(ctx, [-0.5, 0.3, -0.8], 30, '#f6f0d8', { halo: '#9ab0e0', haloSize: 3 });
  const gy = ctx.groundHeight(...BOX);
  glow(ctx, [BOX[0], gy + 0.8, BOX[1]], 2.2, '#ffd27a', { opacity: 0.5 });
  lamp(ctx, [BOX[0], gy + 1.5, BOX[1]], '#ffd890', 2.5, 6);
  b.flush();
}

export default {
  title: 'Mormon 8:1-5, Moroni 10: Moroni alone',
  subtitle: 'The last Nephite hides up the plates in the hill',
  seed: 47,
  custom,

  style: toonStyle({ fog: '#2a3050', near: 60, far: 520, grain: 0.06 }),

  sky: { zenith: '#0e1430', mid: '#222c52', horizon: '#4a4a70', ground: '#1e2236', glowColor: '#8a9ad0', glowDir: [-0.5, 0.35, -0.8] },

  sun: { dir: [-0.5, 0.6, -0.8], color: '#b8c8f0', intensity: 1.6, hemi: { sky: '#5a6aa0', ground: '#2a2430', intensity: 0.9 }, shadowSize: 60 },

  ground: {
    size: 1200, segments: 240, flatRadius: 160, hillHeight: 30, undulation: 0.4,
    plaza: { center: [0, 500], size: [1, 1] },
    colors: { ...GROUND, sand: '#5a5a48', dirt: '#4a4234', grass: '#44523e', grassDark: '#36422f', hill: '#3e4a3a' },
  },

  mountains: { count: 26, distance: [460, 760], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#2a3048', '#323a54', '#262c42'] },

  objects: [
    { type: 'trees', count: 140, ring: [66, 260], height: [6, 11], broken: 0.1, fallen: 0.05, trunkColor: '#2e2620', leafColors: ['#2f4a42', '#3a5448', '#2a3e3a', '#34504a'] },
  ],

  clouds: {
    layers: [
      { count: 22, gap: [-1.0, -0.15], distance: [380, 800], height: [90, 200], size: [40, 80], color: '#4a5278', shade: '#141830' },
    ],
  },

  player: {
    start: [5, -8.5],
    lookAt: [-1, -13.5],
    colors: { robe: '#5e4632', mantle: '#7a6a52', skin: '#a8724a', hair: '#2b1a12', sash: '#8c5a3c' },
  },
};
