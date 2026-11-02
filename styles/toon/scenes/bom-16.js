// Mosiah 2:1-8: King Benjamin speaks from a tower near the temple. Families pitch tents with the doors facing the temple.
import { BASE_STYLE, GROUND_COLORS, ROBES, Frame, figure, raiseArm, tents, makeRng, between } from './lib/bom-13-kit.js';

const TEMPLE = [0, -78];
const TOWER = [-15, -34];
const TOWER_H = 8.5;
const BENJAMIN_COLORS = { robe: '#efe3c2', mantle: '#8a2f3a', skin: '#a8724a', hair: '#d9d0c0', sash: '#c8912e' };

function tower(ctx) {
  const k = ctx.kit;
  const f = new Frame(ctx, TOWER, 0);
  const wood = k.toon('#7a5536');
  const dark = k.toon('#5a3e2b');
  const s = 2.2;
  for (const x of [-s, s]) for (const z of [-s, s]) {
    f.box(wood, [0.45, TOWER_H, 0.45], [x, TOWER_H / 2, z], { collide: true });
  }
  for (const y of [2.8, 5.8]) {
    for (const z of [-s, s]) f.box(dark, [s * 2, 0.22, 0.22], [0, y, z]);
    for (const x of [-s, s]) f.box(dark, [0.22, 0.22, s * 2], [x, y, 0]);
  }
  f.box(k.toon('#9c6b4e'), [s * 2 + 1.4, 0.35, s * 2 + 1.4], [0, TOWER_H + 0.17, 0]);
  for (const z of [-1, 1]) f.box(k.fretMat('#8a2f3a', '#efe3c2'), [s * 2 + 1.4, 0.5, 0.12], [0, TOWER_H + 0.6, z * (s + 0.7)], { uv: { su: 2.4, sv: 0.5, oy: 0.25, local: true, flatCaps: true } });
  for (const x of [-1, 1]) f.box(k.fretMat('#8a2f3a', '#efe3c2'), [0.12, 0.5, s * 2 + 1.4], [x * (s + 0.7), TOWER_H + 0.6, 0], { uv: { su: 2.4, sv: 0.5, oy: 0.25, local: true, flatCaps: true } });
  for (let i = 0; i < TOWER_H / 0.8; i++) f.box(dark, [1.2, 0.12, 0.12], [0, 0.8 * i + 0.5, s + 0.5]);
  for (const x of [-0.6, 0.6]) f.box(dark, [0.12, TOWER_H, 0.12], [x, TOWER_H / 2, s + 0.5]);
  f.box(k.toon('#c8912e'), [0.15, 3, 0.15], [s + 0.5, TOWER_H + 1.8, -s - 0.5]);
  f.box(k.toon('#8a2f3a'), [1.4, 0.9, 0.05], [s + 1.2, TOWER_H + 2.8, -s - 0.5]);
  f.build();
  ctx.exclude({ kind: 'circle', x: TOWER[0], z: TOWER[1], r: 5 });
  const y = ctx.terrainHeight(TOWER[0], TOWER[1]) + TOWER_H + 0.35;
  const b = figure(ctx, BENJAMIN_COLORS, [TOWER[0], TOWER[1] + 0.6], { facing: [-6, 40], y, scale: 1.7, clear: 0 });
  raiseArm(ctx, b, BENJAMIN_COLORS, 1, 2.3);
  raiseArm(ctx, b, BENJAMIN_COLORS, -1, 0.5);
}

function camp(ctx) {
  const rng = makeRng(16);
  const colors = ['#e6d8b8', '#d9c7a3', '#c8a97a', '#bfa27a', '#e8dcc0', '#b5523b', '#c98b3c', '#9c6b4e', '#d4c09a'];
  const items = [];
  for (let r = 22; r < 120; r += 9) {
    const span = 1.95;
    const step = 7.5 / r;
    for (let a = -span; a <= span; a += step) {
      const aa = a + (rng() - 0.5) * step * 0.3;
      const rr = r + (rng() - 0.5) * 2.5;
      const x = TOWER[0] + Math.sin(aa) * rr, z = TOWER[1] + Math.cos(aa) * rr;
      if (z < TOWER[1] - 8) continue;
      if (Math.abs(x + (13 * (90 - z)) / 118) < 4.5) continue;
      const yaw = Math.atan2(TEMPLE[0] - x, TEMPLE[1] - z);
      const w = between(rng, [2.4, 3.4]);
      items.push({ x, z, yaw, size: [w, between(rng, [1.8, 2.4]), between(rng, [2.6, 3.6])], color: colors[Math.floor(rng() * colors.length)] });
    }
  }
  tents(ctx, items);
}

export default {
  title: "Mosiah 2:1-8: King Benjamin's address",
  subtitle: 'The land of Zarahemla, the people gathered by families at the temple',
  seed: 16,

  style: { ...BASE_STYLE, fog: { color: '#efdcb4', near: 140, far: 1000 } },

  sky: { zenith: '#2f6f96', mid: '#7eb0c4', horizon: '#f6e0b4', ground: '#c9b07a', glowColor: '#fff2c8', glowDir: [0.7, 0.35, -0.6] },

  sun: { dir: [0.6, 0.7, 0.35], color: '#fff0d4', intensity: 2.6, hemi: { sky: '#d6e6e6', ground: '#9a7a52', intensity: 1.1 }, shadowSize: 80 },

  ground: {
    size: 1400, segments: 280, flatRadius: 200, hillHeight: 34, undulation: 0.2,
    plaza: { center: [0, -60], size: [50, 48] },
    colors: { ...GROUND_COLORS, grass: '#86a058', grassDark: '#6a8444' },
  },

  mountains: { count: 30, distance: [520, 760], height: [60, 160], widthRatio: [1.4, 2.4], colors: ['#7aa08a', '#6f9a8a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid', pos: TEMPLE, base: [40, 36], tiers: 5, tierHeight: 3.4, inset: 2.8,
      stair: { width: 8, extra: 3, rise: 0.42 }, shrine: { size: [12, 9, 6], comb: 3.5 }, rubble: 0,
      colors: { stone: '#e3cfa6', stair: '#d8c095', shrine: '#b5523b', interior: '#2b1a12', fret: ['#b5523b', '#efe3c2'], roofFret: ['#2f8f8a', '#efe3c2'] },
    },
    { type: 'columns', from: [-24, -52], to: [-24, -100], count: 7, radius: 0.6, height: 6, broken: 0, color: '#e3cfa6', capColor: '#d8c095' },
    { type: 'columns', from: [24, -52], to: [24, -100], count: 7, radius: 0.6, height: 6, broken: 0, color: '#e3cfa6', capColor: '#d8c095', seed: 19 },
    { type: 'trees', count: 120, ring: [130, 300], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  custom(ctx) {
    tower(ctx);
    camp(ctx);
  },

  clouds: {
    layers: [{ count: 40, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a6078' }],
  },

  crowd: {
    seed: 16,
    minSpacing: 0.7,
    facing: [TOWER[0], TOWER[1]],
    colors: ROBES,
    aisles: [{ from: [0, 90], to: [-13, -28], width: 4 }],
    groups: [
      { center: TOWER, radius: [6, 22], angle: [-1.9, 1.9], count: 650, children: 0.18, kneel: 0.1 },
      { center: TOWER, radius: [22, 110], angle: [-1.9, 1.9], count: 1700, children: 0.2, kneel: 0.15 },
    ],
  },

  player: {
    start: [-11.4, -12],
    lookAt: [-15.5, -40],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
