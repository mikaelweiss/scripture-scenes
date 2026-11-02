// 2 Kings 6:15-17: at dawn the Syrian host compasses Dothan, and the young man's eyes are opened:
// the mountain is full of horses and chariots of fire round about Elisha.
// x is east, z is south. The town lies south; the host fills the plain to the north; fire crowns the hills beyond.
import * as THREE from 'three';
import { Batch, PEOPLE, box, chariot, cyl, figure, frameAt, glow, horse, house, makeRng, rock, stoneWall, xf } from './lib/ot-31-kit.js';

const ELISHA = [-1.2, -3.5];
const TOWN = [0, 36];

function custom(ctx) {
  const b = new Batch(ctx);
  const fire = new Batch(ctx);
  const rng = makeRng(35);

  // Dothan: a ring wall with a north gate, houses within.
  const R = 18;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    if (i === n - 1 || i === 0) continue;
    const p0 = [TOWN[0] + Math.sin(a0 + Math.PI) * R, TOWN[1] + Math.cos(a0 + Math.PI) * R];
    const p1 = [TOWN[0] + Math.sin(a1 + Math.PI) * R, TOWN[1] + Math.cos(a1 + Math.PI) * R];
    stoneWall(b, ctx, p0, p1, { height: 5, thick: 1.6, color: '#d6c09a', cap: '#c3a676' });
  }
  for (const s of [-1, 1]) {
    const x = s * 4.1, z = TOWN[1] - R + 0.3;
    const y = ctx.terrainHeight(x, z);
    b.add('#cdb48a', box(2.6, 7.5, 3, [x, y + 3.5, z]));
    for (const k of [-1, 1]) b.add('#cdb48a', box(0.8, 0.8, 0.8, [x + k * 0.8, y + 7.6, z - 1]));
    ctx.addCollider({ x, z, hx: 1.3, hz: 1.5, rot: 0, top: y + 7.5 });
  }
  for (let i = 0; i < 22; i++) {
    const a = rng() * Math.PI * 2, r = 4 + rng() * 11;
    const x = TOWN[0] + Math.sin(a) * r, z = TOWN[1] + Math.cos(a) * r + 1;
    if (Math.abs(x) < 3 && z < TOWN[1]) continue;
    house(b, ctx, { pos: [x, z], size: [4 + rng() * 2, 4 + rng() * 2], height: 3 + rng() * 2, rot: rng() * 0.4, color: ['#e3cfa6', '#d8c095', '#cdb48a'][i % 3], door: null, collide: true });
  }

  // A rocky rise outside the gate where Elisha and his servant stand.
  const ty = ctx.terrainHeight(0, -2);
  b.add('#a8926e', box(9, 1.6, 7, [0, ty + 0.3, -2]));
  b.add('#98825e', box(4, 0.6, 1.6, [0, ty, 2.2]));
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const x = Math.sin(a) * 4.9, z = -2 + Math.cos(a) * 3.9;
    if (Math.abs(x) < 2.6 && z > 0) continue;
    b.add(['#9a8670', '#8a7660', '#b09a7a'][i % 3], rock(0.7 + rng() * 0.5, [x, ty + 0.2 + rng() * 0.5, z], [1.2, 0.8, 1], [rng(), rng() * 3, rng()]));
  }
  ctx.addCollider({ x: 0, z: -2, hx: 4.5, hz: 3.5, rot: 0, top: ty + 1.1, walkable: true });
  ctx.addCollider({ x: 0, z: 2.2, hx: 2, hz: 0.8, rot: 0, top: ty + 0.3, walkable: true });
  const ey = ty + 1.1;
  figure(ctx, { pos: ELISHA, y: ey, facing: [-30, -120], scale: 1.04, colors: { robe: '#8a6a48', mantle: '#4e3a28', skin: '#9c6a45', hair: '#cfc6b8', sash: '#3a2a1c', arms: [0.25, 1.6] } });
  figure(ctx, { pos: [1, -2.7], y: ey, facing: [10, -120], scale: 0.95, colors: { robe: '#b59a72', mantle: '#7a6a52', skin: '#a87650', hair: '#2b1a12', sash: '#6a4a30', arms: [0.4, 0.9] } });

  // The Syrian host: tents, banners and chariots on the plain.
  for (let i = 0; i < 26; i++) {
    const x = -90 + rng() * 180, z = -40 - rng() * 36;
    const y = ctx.terrainHeight(x, z);
    const w = 3 + rng() * 2;
    b.add(['#5a4a3a', '#7a2a3a', '#4a3a3a', '#8a6a4a'][i % 4], xf(new THREE.ConeGeometry(w, 3 + rng(), 4), { pos: [x, y + 1.6, z], rot: [0, rng(), 0] }));
    ctx.exclude({ kind: 'circle', x, z, r: w + 0.5 });
  }
  for (let i = 0; i < 30; i++) {
    const x = -70 + rng() * 140, z = -22 - rng() * 30;
    const y = ctx.terrainHeight(x, z);
    b.add('#3a2418', cyl(0.06, 0.06, 6, [x, y + 3, z], [0, 0, 0], 5));
    b.add(['#8e2a2a', '#2a3a6a', '#c8912e'][i % 3], box(1.6, 1.0, 0.05, [x + 0.8, y + 5.4, z]));
  }
  for (let i = 0; i < 16; i++) {
    const x = -60 + rng() * 120, z = -28 - rng() * 30;
    const f = frameAt(x, ctx.terrainHeight(x, z), z, Math.PI + (rng() - 0.5) * 0.6);
    chariot(b, f, { body: '#4a3020', trim: '#8a7a5a', wheel: '#2b1a12' });
    horse(b, f.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, -3.4)).multiply(new THREE.Matrix4().makeRotationY(Math.PI)), { color: '#5e4632', mane: '#2b1a12' });
    ctx.exclude({ kind: 'circle', x, z, r: 3 });
  }

  // The mountain full of horses and chariots of fire.
  for (let i = 0; i < 46; i++) {
    const a = (rng() - 0.5) * 2.6, d = 110 + rng() * 90;
    const x = Math.sin(a) * d, z = -Math.cos(a) * d;
    const y = ctx.terrainHeight(x, z);
    const rot = Math.atan2(-x, -z) + (i % 2 ? 1 : -1) * (Math.PI / 2 - 0.3) + (rng() - 0.5) * 0.4;
    const f = frameAt(x, y, z, rot).multiply(new THREE.Matrix4().makeScale(2.8, 2.8, 2.8));
    chariot(fire, f, { body: '#ff9a3c', trim: '#fff0a0', wheel: '#ffcf5a', glow: true });
    for (const s of [-0.75, 0.75]) horse(fire, f.clone().multiply(new THREE.Matrix4().makeTranslation(s, 0, 3.4)), { color: '#ffb347', mane: '#fff0a0', glow: true, rear: rng() < 0.3 ? 0.5 : 0 });
    if (i % 2 === 0) glow(ctx, [x, y + 5, z], 22, '#ffb860', 0.5, 0.08);
  }
  fire.flush();
  b.flush();
  const pl = new THREE.HemisphereLight('#ffb070', '#000000', 0.3);
  ctx.scene.add(pl);
}

const host = {
  robes: ['#4a3a3a', '#5e2a2a', '#3a3a4a', '#6a4a3a', '#7a2a3a', '#8a6a4a', '#2e2a2a'],
  mantles: ['#2e1e1a', '#5a3a2a', '#8a7a5a', '#3a2a3a'],
  skins: PEOPLE.skins,
  hair: ['#8a7a5a', '#5a4a3a', '#3a2a22', '#a08a5a'],
  wraps: ['#8a7a5a', '#a08a5a', '#5a4a3a'],
};

export default {
  title: '2 Kings 6:15-17: The mountain full of chariots',
  subtitle: 'Dothan at dawn. They that be with us are more than they that be with them',
  seed: 35,

  style: {
    ink: '#24161a',
    toonSteps: [0.38, 0.7, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#b88a8a', near: 150, far: 900 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#2a2e5a', mid: '#7a5a7a', horizon: '#f2a070', ground: '#6a4a4a', glowColor: '#ffc080', glowDir: [0.8, 0.12, 0.2] },

  sun: { dir: [0.9, 0.3, 0.1], color: '#ffc8a0', intensity: 1.9, hemi: { sky: '#a8a0c8', ground: '#6a4a3a', intensity: 0.95 }, shadowSize: 70 },

  ground: {
    size: 1600,
    segments: 320,
    flatRadius: 80,
    hillHeight: 60,
    undulation: 0.3,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#c8a87a', dirt: '#b08a5e', grass: '#8a9258', grassDark: '#6a7242', plaza: '#c8a87a', plazaLine: '#c8a87a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7a6a5a',
    },
  },

  mountains: { count: 26, distance: [500, 800], height: [80, 160], widthRatio: [1.6, 2.6], colors: ['#5a4a6a', '#6a5a7a', '#4e4460'] },

  objects: [{ type: 'stones', count: 400, ring: [4, 80], size: [0.12, 0.4], colors: ['#c8a87a', '#b08a5e', '#a89070'] }],
  custom,

  clouds: { layers: [{ count: 36, distance: [300, 800], height: [80, 200], size: [40, 90], color: '#f6b890', shade: '#4a3a5a' }] },

  crowd: {
    seed: 35,
    minSpacing: 0.9,
    facing: TOWN,
    colors: host,
    groups: [{ shape: 'rect', center: [0, -48], size: [180, 50], count: 1300, lean: 0.02 }],
  },

  player: { start: [2.2, -0.5], lookAt: [-3, -60], colors: { robe: '#7a6a52', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
