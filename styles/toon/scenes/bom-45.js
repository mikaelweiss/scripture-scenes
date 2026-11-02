// 4 Nephi 1:1-18: a rebuilt city in the years of peace. All things in common, no rich and no poor.
// x is east, z is south. The temple stands north of the plaza, a shared storehouse and a well in the middle.
import { Batch, CROWD, GROUND, ball, between, box, cone, cyl, frameAt, house, makeRng, pick, toonStyle } from './lib/bom-43-kit.js';

const TEMPLE = [0, -66];
const WELL = [0, -14];
const STORE = [-17, -22];
const PLAZA = { x: 0, z: -24, hx: 30, hz: 26 };

const WALLS = ['#efe3c2', '#e8d6ae', '#e3cfa6', '#f3e6c8', '#ead2a8'];
const TRIMS = ['#2f8f8a', '#b5523b', '#c8912e', '#3e6e8e', '#6f8a6a'];

function cityHouses(b, ctx, rng) {
  for (let x = -78; x <= 78; x += 13) {
    for (let z = -96; z <= 82; z += 13) {
      const jx = x + between(rng, [-1.5, 1.5]), jz = z + between(rng, [-1.5, 1.5]);
      if (Math.abs(jx) < 13) continue;
      if (Math.abs(jx - PLAZA.x) < PLAZA.hx + 7 && Math.abs(jz - PLAZA.z) < PLAZA.hz + 6) continue;
      if (Math.abs(jx - TEMPLE[0]) < 32 && Math.abs(jz - TEMPLE[1]) < 30) continue;
      const w = between(rng, [6, 8.5]), d = between(rng, [5, 7]);
      const rot = Math.abs(jx) < 26 ? (jx < 0 ? Math.PI / 2 : -Math.PI / 2) : rng() < 0.5 ? 0 : Math.PI;
      house(b, ctx, {
        pos: [jx, jz], size: [w, d], height: between(rng, [3.2, 4.2]), rot,
        color: pick(rng, WALLS), trim: pick(rng, TRIMS), roof: rng() < 0.5 ? '#c49a68' : null, upper: rng() < 0.3, door: '#5a3a22',
      });
      if (rng() < 0.6) garden(b, ctx, rng, jx + Math.cos(rot) * (w / 2 + 2.2), jz - Math.sin(rot) * (w / 2 + 2.2), rot);
    }
  }
}

function garden(b, ctx, rng, x, z, rot) {
  const y = ctx.terrainHeight(x, z);
  const f = frameAt(x, y, z, rot);
  b.add('#8a6040', box(3, 0.25, 4.5, [0, 0.05, 0]), { frame: f });
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 4; k++) {
      const c = pick(rng, ['#5f9e4a', '#4f8a3a', '#7aa84a']);
      b.add(c, ball(0.32 + rng() * 0.12, [-0.9 + r * 0.9, 0.35, -1.6 + k * 1.05], [1, 0.8, 1], 7), { frame: f });
    }
  }
  for (let k = 0; k < 3; k++) b.add(pick(rng, ['#d9502c', '#e8b030', '#b5523b']), ball(0.1, [-0.9 + k * 0.9, 0.62, -1.1 + k * 0.6], [1, 1, 1], 6), { frame: f, cast: false });
}

function storehouse(b, ctx, rng) {
  const [x, z] = STORE;
  const y = ctx.terrainHeight(x, z);
  const f = frameAt(x, y, z, Math.PI / 2);
  b.add('#d8c095', box(13, 0.4, 7, [0, 0.2, 0]), { frame: f, stone: true });
  for (const sx of [-6, -2, 2, 6]) for (const sz of [-3, 3]) b.add('#8c5a3c', cyl(0.18, 0.2, 3.4, [sx, 2.1, sz]), { frame: f });
  b.add('#b98a5a', box(14, 0.35, 8.2, [0, 3.9, 0]), { frame: f });
  b.add('#2f8f8a', box(14.2, 0.4, 8.4, [0, 3.55, 0]), { frame: f });
  for (let i = 0; i < 18; i++) {
    const lx = -5.6 + (i % 9) * 1.4, lz = i < 9 ? -1.8 : 1.6;
    if (i % 3 === 0) {
      b.add('#b5623b', cyl(0.3, 0.22, 0.85, [lx, 0.82, lz], [0, 0, 0], 9), { frame: f });
      b.add('#b5623b', cyl(0.12, 0.25, 0.22, [lx, 1.35, lz], [0, 0, 0], 8), { frame: f });
    } else {
      b.add('#a8743f', cyl(0.42, 0.34, 0.55, [lx, 0.68, lz], [0, 0, 0], 10), { frame: f });
      b.add(i % 2 ? '#e0b84a' : '#c8912e', ball(0.38, [lx, 0.95, lz], [1, 0.45, 1], 8), { frame: f });
    }
  }
  for (let k = 0; k < 4; k++) b.add(pick(rng, ['#b5523b', '#2f8f8a', '#efe3c2', '#c8912e']), cyl(0.22, 0.22, 1.6, [-5 + k * 1.1, 0.62, 3.1], [0, 0, Math.PI / 2], 8), { frame: f });
  ctx.addCollider({ x, z, hx: 3.6, hz: 6.6, rot: 0, top: y + 0.4, walkable: true });
  for (const sx of [-6, -2, 2, 6]) for (const sz of [-3, 3]) ctx.addCollider({ x: x + sz, z: z - sx, hx: 0.25, hz: 0.25, rot: 0, top: y + 4 });
  ctx.exclude({ kind: 'rect', x, z, hx: 4.4, hz: 7.4 });
}

function well(b, ctx) {
  const [x, z] = WELL;
  const y = ctx.terrainHeight(x, z);
  b.add('#d8c095', cyl(1.7, 1.8, 0.9, [x, y + 0.45, z], [0, 0, 0], 16), { stone: true });
  b.add('#3f8fa0', cyl(1.4, 1.4, 0.05, [x, y + 0.82, z], [0, 0, 0], 16), { cast: false });
  for (const s of [-1, 1]) b.add('#8c5a3c', cyl(0.1, 0.12, 2.4, [x + s * 1.5, y + 1.2, z]));
  b.add('#8c5a3c', cyl(0.08, 0.08, 3.2, [x, y + 2.35, z], [0, 0, Math.PI / 2]));
  b.add('#b5623b', cyl(0.25, 0.18, 0.5, [x + 2.2, y + 0.25, z + 0.5], [0, 0, 0], 9));
  ctx.addCollider({ x, z, hx: 1.8, hz: 1.8, rot: 0, top: y + 0.9 });
  ctx.exclude({ kind: 'circle', x, z, r: 2.6 });
}

function fields(b, ctx, rng) {
  const crops = ['#d8b85a', '#8ea05a', '#c9a34a', '#6f9a4a', '#e0c070'];
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * between(rng, [100, 170]), z = between(rng, [-120, 140]);
    const y = ctx.terrainHeight(x, z);
    const w = between(rng, [18, 30]), d = between(rng, [14, 24]);
    const f = frameAt(x, y, z, between(rng, [-0.3, 0.3]));
    const c = pick(rng, crops);
    for (let r = 0; r < 6; r++) b.add(r % 2 ? c : '#9a7048', box(w, 0.35, d / 6, [0, 0.12, -d / 2 + (r + 0.5) * (d / 6)]), { frame: f, cast: false });
  }
}

function orchards(b, ctx, rng) {
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2, r = between(rng, [96, 150]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const y = ctx.terrainHeight(x, z);
    b.add('#6b4a33', cyl(0.18, 0.25, 2.2, [x, y + 1.1, z], [0, 0, 0], 6));
    b.add(pick(rng, ['#3e8e6e', '#4f9a74', '#5f9e6a']), ball(1.6, [x, y + 3, z], [1, 0.8, 1], 9));
    for (let k = 0; k < 4; k++) b.add(pick(rng, ['#e07a30', '#d9502c', '#e8b030']), ball(0.16, [x + Math.cos(k * 1.7) * 1.3, y + 2.7 + (k % 2) * 0.6, z + Math.sin(k * 1.7) * 1.3], [1, 1, 1], 6), { cast: false });
  }
}

function custom(ctx) {
  const rng = makeRng(45);
  const b = new Batch(ctx);
  ctx.exclude({ kind: 'circle', x: 5, z: 2, r: 3.5 });
  storehouse(b, ctx, rng);
  well(b, ctx);
  cityHouses(b, ctx, rng);
  fields(b, ctx, rng);
  orchards(b, ctx, rng);
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    const z = 46 - Math.floor(i / 2) * 9;
    if (z < -6) continue;
    const x = side * 10.5, y = ctx.terrainHeight(x, z);
    b.add('#6b4a33', cyl(0.15, 0.22, 2, [x, y + 1, z], [0, 0, 0], 6));
    b.add(pick(rng, ['#3e8e6e', '#4f9a74']), cone(1.1, 2.6, [x, y + 3.1, z], [0, 0, 0], 8));
    ctx.addCollider({ x, z, hx: 0.3, hz: 0.3, rot: 0, top: y + 4 });
  }
  b.flush();
}

const LIGHT_ROBES = { ...CROWD, robes: ['#efe3c2', '#e6d8b8', '#d9c7a3', '#c8a97a', '#b5523b', '#c98b3c', '#4f7f80', '#6f8a6a', '#2f8f8a', '#e8b030'] };

export default {
  title: '4 Nephi 1:1-18: Two hundred years of peace',
  subtitle: 'A Zion society, the cities rebuilt, all things in common',
  seed: 45,
  custom,

  style: toonStyle({ fog: '#e4ecd8', near: 150, far: 1100 }),

  sky: { zenith: '#2a6fa0', mid: '#79b6cc', horizon: '#eef0d6', ground: '#c9b98a', glowColor: '#fff6d8', glowDir: [0.3, 0.8, -0.5] },

  sun: { dir: [0.4, 0.85, 0.35], color: '#fff6e2', intensity: 2.6, hemi: { sky: '#d8ecf0', ground: '#a08a5a', intensity: 1.15 }, shadowSize: 80 },

  ground: {
    size: 1400, segments: 280, flatRadius: 190, hillHeight: 42, undulation: 0.2,
    plaza: { center: [PLAZA.x, PLAZA.z - 8], size: [PLAZA.hx * 2, PLAZA.hz * 2 + 30] },
    colors: { ...GROUND, sand: '#b7b874', dirt: '#b39a62', grass: '#7fa458', grassDark: '#5f8a42', hill: '#6f9a5a', plaza: '#ecdcb6', plazaLine: '#cdb68a' },
  },

  mountains: { count: 32, distance: [540, 820], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid', pos: TEMPLE, base: [36, 36], tiers: 5, tierHeight: 3.2, inset: 2.6,
      stair: { width: 8, extra: 3, rise: 0.42 }, shrine: { size: [11, 8, 6], comb: 3.5 }, rubble: 0,
      colors: { stone: '#efe3c2', stair: '#e3cfa6', shrine: '#2f8f8a', interior: '#2b1a12', fret: ['#b5523b', '#efe3c2'], roofFret: ['#c8912e', '#efe3c2'] },
    },
    { type: 'trees', count: 70, ring: [160, 260], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  clouds: {
    layers: [
      { count: 36, distance: [380, 800], height: [100, 220], size: [35, 75], color: '#ffffff', shade: '#6a7a92' },
    ],
  },

  crowd: {
    seed: 45,
    minSpacing: 0.75,
    facing: WELL,
    colors: LIGHT_ROBES,
    aisles: [{ from: [0, 60], to: [0, -6], width: 4 }],
    groups: [
      { center: STORE, radius: [4.8, 9], angle: [0.4, 2.8], count: 46, facing: STORE, children: 0.2 },
      { center: WELL, radius: [3, 6], count: 30, children: 0.3, facing: WELL },
      { center: [14, -30], radius: [0.5, 3.2], count: 16, children: 1, facing: [14, -30], facingJitter: 0.4 },
      { center: [-8, 2], radius: [0, 2.5], count: 8, children: 0.4, facing: [-8, 2], facingJitter: 2 },
      { center: [9, 6], radius: [0, 2.5], count: 9, children: 0.4, facing: [9, 6], facingJitter: 2 },
      { center: [20, -10], radius: [0, 3], count: 10, children: 0.3, facing: [20, -10], facingJitter: 2 },
      { center: [-20, -42], radius: [0, 3], count: 11, children: 0.3, facing: [-20, -42], facingJitter: 2 },
      { center: [18, -45], radius: [0, 3], count: 10, children: 0.3, facing: [18, -45], facingJitter: 2 },
      { shape: 'rect', center: [0, -40], size: [10, 6], count: 18, facing: TEMPLE, children: 0.2 },
      { shape: 'rect', center: [0, 25], size: [22, 50], count: 70, facing: [0, -40], facingJitter: 3, children: 0.25 },
      { shape: 'rect', center: [0, -20], size: [56, 44], count: 90, facingJitter: 3, children: 0.25 },
    ],
  },

  player: {
    start: [5, 2],
    lookAt: [-5, -30],
    colors: { robe: '#efe3c2', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
