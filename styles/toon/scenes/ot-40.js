// Daniel 6: at first light King Darius hurries to the den and Daniel answers him, unharmed among the lions.
// x is east, z is south. The player starts on the south rim of the den. The pit floor sits at ground level, the rim five meters up.
import * as THREE from 'three';
import { Batch, DAY_STYLE, PALETTE, addSun, attach, ball, box, boxGeo, cyl, frameAt, glow, house, makeRng, palm, person } from './lib/ot-38-kit.js';

const PIT = { x0: -12, x1: 12, z0: -30, z1: -6 };
const RIM = { x0: -22, x1: 22, z0: -40, z1: 4, h: 3.6 };
const DANIEL = [-1, -23];
const ANGEL = [1.4, -24.2];
const KING = [3, -4.8];
const STONE = '#c7ae86';
const STONE_DARK = '#a88e68';

function rimBlock(b, ctx, x0, x1, z0, z1) {
  const w = x1 - x0, d = z1 - z0, h = RIM.h;
  const x = (x0 + x1) / 2, z = (z0 + z1) / 2;
  b.add(STONE, boxGeo(w, h + 1, d, [x, (h - 1) / 2, z], { uv: { su: 2.5 } }), { stone: true });
  b.add(STONE_DARK, boxGeo(w + 0.3, 0.4, d + 0.3, [x, h - 0.1, z], { uv: { su: 2.5 } }), { stone: true });
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: h + 0.1, walkable: true });
}

function stairs(b, ctx, { x, z0, z1, width, from, to }) {
  const n = Math.round(Math.abs(to - from) / 0.35);
  const dz = (z1 - z0) / n;
  for (let k = 0; k < n; k++) {
    const top = from + ((to - from) * (k + 1)) / n;
    const z = z0 + (k + 0.5) * dz;
    b.add(STONE_DARK, boxGeo(width, top + 0.5, Math.abs(dz), [x, (top - 0.5) / 2, z], { uv: { su: 2 } }), { stone: true });
    ctx.addCollider({ x, z, hx: width / 2, hz: Math.abs(dz) / 2, rot: 0, top, walkable: true });
  }
}

function den(b, ctx) {
  const { x0, x1, z0, z1 } = PIT;
  rimBlock(b, ctx, RIM.x0, RIM.x1, RIM.z0, z0);
  rimBlock(b, ctx, RIM.x0, RIM.x1, z1, RIM.z1);
  rimBlock(b, ctx, RIM.x0, x0, z0, z1);
  rimBlock(b, ctx, x1, RIM.x1, z0, z1);
  // Steps up the outside from the south, and a keeper's stair down the east wall of the pit.
  stairs(b, ctx, { x: 0, z0: RIM.z1 + 5, z1: RIM.z1, width: 5, from: 0.2, to: RIM.h });
  stairs(b, ctx, { x: x1 - 1, z0: z1 - 0.5, z1: z0 + 4.5, width: 2, from: 0.2, to: RIM.h - 0.2 });
  b.add('#4a3a2c', box(1.2, 0.25, 6, [x1 - 0.6, RIM.h + 0.2, z0 + 2]));

  // Barred grate at the pit's mouth on the north wall where the lions are let in.
  b.add('#2b1a12', box(4, 3.2, 0.3, [-2, 1.6, z0 + 0.05]), { cast: false });
  for (let i = 0; i < 7; i++) b.add('#5a4a3a', cyl(0.06, 0.06, 3.4, [-3.7 + i * 0.57, 1.7, z0 + 0.3], [0, 0, 0], 5));
  b.add('#5a4a3a', box(4.2, 0.15, 0.15, [-2, 3.2, z0 + 0.3]));

  // The sealing stone, rolled back from the mouth, with the king's cord and seal.
  const sx = -15, sz = -1.5;
  b.add(STONE_DARK, cyl(2.2, 2.2, 0.9, [sx, RIM.h + 0.55, sz], [0, 0, 0.12], 16), { stone: true });
  b.add('#8c2a2a', cyl(2.25, 2.25, 0.12, [sx, RIM.h + 0.6, sz], [0, 0, 0.12], 16));
  b.add('#c8912e', cyl(0.25, 0.25, 0.1, [sx + 0.4, RIM.h + 1.05, sz], [0, 0, 0.12], 10), { emissive: '#4a3008' });
  ctx.addCollider({ x: sx, z: sz, hx: 2, hz: 2, rot: 0, top: RIM.h + 1.1 });

  // Straw and stones on the floor of the pit.
  const rng = makeRng(40);
  for (let i = 0; i < 60; i++) {
    const x = x0 + 0.6 + rng() * (x1 - x0 - 1.2), z = z0 + 0.6 + rng() * (z1 - z0 - 1.2);
    if (rng() < 0.6) b.add('#d8b866', box(0.9 + rng(), 0.04, 0.08, [x, 0.03, z], [0, rng() * 3, 0]), { cast: false });
    else b.add('#9a8466', ball(0.15 + rng() * 0.2, [x, 0.05, z], [1.3, 0.6, 1], 6));
  }
}

// A lion couched on the ground, head along +z local.
function lion(b, ctx, { pos, rot, sleeping = false, mane = true, standing = false }) {
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z), z, rot);
  const coat = '#c9944e', dark = '#8a5a2a', maneC = '#7a4a22';
  const lift = standing ? 0.45 : 0;
  b.add(coat, ball(0.55, [0, 0.5 + lift, 0], [0.85, 0.75, 1.75]), { frame: f });
  const hy = (sleeping ? 0.42 : 0.85) + lift, hz = sleeping ? 1.25 : 1.05;
  if (mane) b.add(maneC, ball(0.55, [0, hy + 0.05, hz - 0.18], [1, 1, 0.75], 9), { frame: f });
  b.add(coat, ball(0.34, [0, hy, hz], [0.95, 0.9, 1.1]), { frame: f });
  b.add('#e8c88a', ball(0.17, [0, hy - 0.1, hz + 0.3], [1.1, 0.75, 1]), { frame: f });
  b.add('#2b1a12', ball(0.06, [0, hy - 0.02, hz + 0.45]), { frame: f });
  for (const s of [-1, 1]) b.add(coat, ball(0.1, [s * 0.24, hy + 0.3, hz - 0.05], [1, 1, 0.5], 6), { frame: f });
  if (standing) {
    for (const [lx, lz] of [[-0.25, 0.65], [0.25, 0.65], [-0.25, -0.65], [0.25, -0.65]]) b.add(coat, cyl(0.12, 0.1, 0.75, [lx, 0.37, lz], [0, 0, 0], 6), { frame: f });
  } else {
    for (const s of [-1, 1]) b.add(coat, cyl(0.11, 0.11, 0.8, [s * 0.25, 0.12, 0.95], [Math.PI / 2, 0, 0], 6), { frame: f });
    for (const s of [-1, 1]) b.add(coat, ball(0.3, [s * 0.35, 0.3, -0.55], [0.6, 0.7, 1]), { frame: f });
  }
  b.add(coat, cyl(0.04, 0.05, 1.1, [0.25, 0.12 + lift, -1.4], [Math.PI / 2 - 0.15, 0.6, 0], 5), { frame: f });
  b.add(dark, ball(0.09, [0.55, 0.12 + lift, -1.85]), { frame: f });
  ctx.addCollider({ x, z, hx: 0.5, hz: 1.1, rot, top: ctx.terrainHeight(x, z) + 0.9 });
}

function lions(b, ctx) {
  const toward = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const [dx, dz] = DANIEL;
  const list = [
    { pos: [-5.5, -24], face: [dx, dz], mane: true },
    { pos: [5, -26.5], face: [dx, dz], sleeping: true, mane: false },
    { pos: [-5, -17], face: [dx, dz], mane: false },
    { pos: [4.2, -18.5], face: [dx + 2, dz + 3], sleeping: true, mane: true },
    { pos: [-2, -27.6], rot: 1.6, sleeping: true, mane: false },
    { pos: [1.5, -13], face: [-6, -11], mane: true, standing: true },
    { pos: [-8, -11], face: [dx, dz], sleeping: true, mane: false },
    { pos: [8.5, -12], face: [dx, dz], mane: false },
    { pos: [-9, -26], face: [dx, dz], sleeping: true, mane: true },
  ];
  for (const l of list) lion(b, ctx, { ...l, rot: l.rot ?? toward(l.pos[0], l.pos[1], ...l.face) });
}

function figures(ctx) {
  const [dx, dz] = DANIEL;
  person(ctx, { pos: DANIEL, face: [KING[0], KING[1] + 4], scale: 1.05, colors: { robe: '#e6d8b8', mantle: '#4f6fa0', skin: '#a8724a', hair: '#cfc6b4', sash: '#c8912e', arms: [0.55, 0.9] } });
  person(ctx, { pos: ANGEL, face: [0, 0], scale: 1.15, glow: 0.6, colors: { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#fbf3e4', hair: '#fbf7ee', sash: '#efe3c2', arms: [0.5, 0.4] } });
  glow(ctx, { pos: [ANGEL[0], 1.4, ANGEL[1]], size: 7, color: '#fff3d0', opacity: 0.85 });
  glow(ctx, { pos: [dx + 0.6, 1, dz - 0.5], size: 13, color: '#ffe8b0', opacity: 0.3 });
  const l = new THREE.PointLight('#fff0d0', 26, 18, 1.3);
  l.position.set(ANGEL[0], 2.6, ANGEL[1] + 1.5);
  ctx.scene.add(l);

  // Darius at the rim, crying out, with his princes behind him.
  const top = RIM.h + 0.1;
  const king = person(ctx, { pos: KING, y: top, face: DANIEL, scale: 1.08, colors: { robe: '#5a2a6a', mantle: '#e2b13c', skin: '#b5825a', hair: '#1f140e', sash: '#e8c060', arms: [0.75, 1.1] } });
  attach(ctx, king, new THREE.CylinderGeometry(0.14, 0.13, 0.34, 8), '#e2b13c', { pos: [0, 1.83, 0], emissive: '#5a3a08' });
  king.rotation.x = 0.15;
  const court = [
    { robe: '#2f5f9a', mantle: '#d9c7a3', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' },
    { robe: '#c98b3c', mantle: '#5e4632', skin: '#8a5a3b', hair: '#e6d8b8', sash: '#8c3a3a' },
    { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e', arms: [0.3, 0.8] },
    { robe: '#7a6a52', mantle: '#8c3a3a', skin: '#a87650', hair: '#2b1a12', sash: '#d9c7a3' },
  ];
  person(ctx, { pos: [5.2, -3.4], y: top, face: DANIEL, colors: court[0] });
  person(ctx, { pos: [7.4, -4.6], y: top, face: DANIEL, colors: court[1] });
  person(ctx, { pos: [4.4, -1.8], y: top, face: DANIEL, colors: court[2] });
  person(ctx, { pos: [8.6, -2.4], y: top, face: DANIEL, colors: court[3] });
  // Keepers with torches still lit from the night.
  for (const [x, z] of [[13.6, -12], [-13.6, -28]]) {
    person(ctx, { pos: [x, z], y: top, face: DANIEL, colors: { robe: '#6b5a4a', mantle: '#8c5a3c', skin: '#8a5a3b', hair: '#2b1a12' } });
  }
}

function city(b, ctx) {
  const rng = makeRng(404);
  const colors = ['#d8c49a', '#cdb48a', '#e0cfa8', '#c4a87c'];
  for (let i = 0; i < 26; i++) {
    const a = -1.2 + rng() * 2.6, r = 55 + rng() * 60;
    const x = Math.sin(a) * r * 1.2, z = -Math.cos(a) * r - 10;
    if (ctx.blocked(x, z, 4)) continue;
    house(b, ctx, { pos: [x, z], size: [7 + rng() * 6, 6 + rng() * 5], height: 4 + rng() * 5, rot: rng() * 0.5 - 0.25, color: colors[i % 4], trim: '#a88e68', upper: rng() < 0.4 });
  }
  // The palace on its terrace to the north.
  const [px, pz] = [-10, -120];
  const py = ctx.terrainHeight(px, pz) - 0.5;
  b.add('#d8c49a', boxGeo(70, 8, 40, [px, py + 4, pz], { uv: { su: 4 } }), { stone: true });
  b.add('#e6d6b0', boxGeo(46, 12, 26, [px, py + 14, pz], { uv: { su: 4 } }), { stone: true });
  for (let i = 0; i < 10; i++) b.add('#c8b088', cyl(0.8, 0.9, 12, [px - 20 + i * 4.4, py + 14, pz + 14], [0, 0, 0], 10));
  b.add('#2f5f9a', boxGeo(48, 1.4, 28, [px, py + 20.5, pz], { uv: { su: 5.6, sv: 1.4, oy: 0.7, local: true, flatCaps: true } }), { fret: '#e8c060' });
  for (let i = 0; i < 30; i++) {
    const a = rng() * Math.PI * 2, r = 40 + rng() * 120;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 14;
    if (ctx.blocked(x, z, 3) || Math.hypot(x, z + 14) < 32) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 5, lean: 0.1 + rng() * 0.2, dir: rng() * 6.28, seed: i + 9 });
  }
}

function custom(ctx) {
  const b = new Batch(ctx);
  den(b, ctx);
  lions(b, ctx);
  city(b, ctx);
  b.flush();
  figures(ctx);
  addSun(ctx, { dir: [1, 0.08, -0.15], size: 70, color: '#fff0d0', halo: '#ffb890' });
}

export default {
  title: "Daniel 6:16-23: Daniel in the lions' den",
  subtitle: 'Babylon, at first light. "My God hath sent his angel, and hath shut the lions\' mouths"',
  seed: 40,
  style: { ...DAY_STYLE, fog: { color: '#e8c4b4', near: 90, far: 800 } },
  sky: { zenith: '#4a5f94', mid: '#c49aa8', horizon: '#ffcf9e', ground: '#d9b98a', glowColor: '#ffe6b4', glowDir: [1, 0.08, -0.15] },
  sun: { dir: [1, 0.35, -0.15], color: '#ffd8b4', intensity: 2.1, hemi: { sky: '#d8c4dc', ground: '#a8805a', intensity: 1.2 }, shadowSize: 60 },
  ground: {
    size: 1200, segments: 240, flatRadius: 170, hillHeight: 30, undulation: 0,
    plaza: { center: [0, -18], size: [25, 25] },
    colors: { sand: '#dcb886', dirt: '#c99c66', grass: '#9ea46a', grassDark: '#848c58', plaza: '#b8a07a', plazaLine: '#9a8466', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b48a62' },
  },
  mountains: { count: 26, distance: [520, 780], height: [50, 110], widthRatio: [2, 3], colors: ['#b89ab0', '#a88ca4', '#c4a4b0'] },
  objects: [
    { type: 'stones', count: 300, ring: [26, 140], size: [0.12, 0.4], colors: ['#c9a87a', '#b89a70', '#a8805c'] },
  ],
  custom,
  clouds: { layers: [{ count: 24, distance: [400, 800], height: [80, 160], size: [40, 80], color: '#ffe4d8', shade: '#9a7c9c' }] },
  crowd: {
    seed: 40,
    minSpacing: 0.8,
    facing: [0, -18],
    colors: PALETTE,
    groups: [{ center: [0, -18], radius: [30, 44], angle: [-1.2, 1.2], count: 40, facingJitter: 0.6 }],
  },
  player: {
    start: [-2, -3.6],
    lookAt: [DANIEL[0], DANIEL[1]],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#2f5f9a' },
  },
};
