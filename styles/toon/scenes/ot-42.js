// Jonah 3: Nineveh believes God. The people put on sackcloth, and the king sits in ashes before his palace.
// x is east, z is south. The palace stands at the north end of the great square, Jonah preaches on its west side.
import * as THREE from 'three';
import { Batch, DAY_STYLE, attach, ball, box, boxGeo, cityWall, cyl, frameAt, glow, house, makeRng, ox, palm, person, sheep } from './lib/ot-38-kit.js';

const JONAH = [-9, 4];
const KING = [0, -30.5];
const PALACE = [0, -48];
const STONE = '#d2bc94';
const SACK = '#5a4a3a';

function palace(b, ctx) {
  const [px, pz] = PALACE;
  const y = ctx.terrainHeight(px, pz) - 0.3;
  const th = 3.2;
  b.add(STONE, boxGeo(56, th, 22, [px, y + th / 2, pz], { uv: { su: 3 } }), { stone: true });
  ctx.addCollider({ x: px, z: pz, hx: 28, hz: 11, rot: 0, top: y + th, walkable: true });
  const front = pz + 11;
  const n = 9;
  for (let k = 0; k < n; k++) {
    const top = y + ((k + 1) * th) / n;
    const z = front + 4 - (k + 0.5) * (4 / n);
    b.add('#c4ac80', boxGeo(16, top - y + 0.3, 4 / n, [px, (top + y - 0.3) / 2, z], { uv: { su: 2 } }), { stone: true });
    ctx.addCollider({ x: px, z, hx: 8, hz: 2 / n, rot: 0, top, walkable: true });
  }
  // The palace hall with its gate and parapet.
  const hy = y + th;
  const hz = pz - 3;
  b.add('#dcc8a0', boxGeo(44, 11, 14, [px, hy + 5.5, hz], { uv: { su: 3 } }), { stone: true });
  b.add('#2f4f7a', boxGeo(44.4, 1.2, 14.4, [px, hy + 9.4, hz], { uv: { su: 4.8, sv: 1.2, oy: 0.6, local: true, flatCaps: true } }), { fret: '#e0c890' });
  for (let i = 0; i < 22; i++) b.add('#dcc8a0', box(1, 1, 14.4, [px - 21 + i * 2, hy + 11.5, hz]));
  b.add('#2b1a12', box(5, 7, 0.4, [px, hy + 3.5, hz + 7]), { cast: false });
  b.add('#c4ac80', box(7, 1, 1, [px, hy + 7.4, hz + 7.2]));
  for (const s of [-1, 1]) {
    b.add('#dcc8a0', boxGeo(6, 14, 6, [px + s * 12, hy + 7, hz + 4], { uv: { su: 3 } }), { stone: true });
    lamassu(b, [px + s * 4.4, hy, hz + 8.6], s);
  }
  ctx.addCollider({ x: px, z: hz, hx: 22, hz: 7.5, rot: 0, top: hy + 12 });
  for (const s of [-1, 1]) ctx.addCollider({ x: px + s * 4.4, z: hz + 8.6, hx: 0.8, hz: 1.8, rot: 0, top: hy + 4 });
  ctx.exclude({ kind: 'rect', x: px, z: pz + 2, hx: 29, hz: 15 });
}

// A winged bull with a man's head guarding the gate, facing +z.
function lamassu(b, [x, y, z], side) {
  const c = '#cdb48a', d = '#a88e68';
  b.add(c, box(1.4, 1.6, 3.2, [x, y + 2, z]));
  for (const [lx, lz] of [[-0.5, 1.2], [0.5, 1.2], [-0.5, -1.2], [0.5, -1.2]]) b.add(c, box(0.5, 1.4, 0.5, [x + lx, y + 0.7, z + lz]));
  b.add(c, box(1.1, 1.3, 1, [x, y + 3.3, z + 1.6]));
  b.add(d, box(1.1, 0.9, 0.5, [x, y + 2.7, z + 2.2]));
  b.add('#8a6a3a', cyl(0.55, 0.6, 0.7, [x, y + 4.2, z + 1.6], [0, 0, 0], 8));
  b.add(d, box(0.25, 1.8, 3, [x - side * 0.8, y + 3.4, z - 0.5], [0.5, 0, 0]));
}

function sackcloth(b, ctx, pos, rot, size) {
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z), z, rot);
  b.add(SACK, box(size[0], 0.12, size[1], [0, size[2], 0]), { frame: f });
  for (const s of [-1, 1]) b.add(SACK, box(0.06, size[2] * 0.6, size[1], [s * size[0] / 2, size[2] * 0.72, 0]), { frame: f });
}

function city(b, ctx) {
  const rng = makeRng(42);
  const colors = ['#d8c49a', '#cdb48a', '#e0cfa8', '#c4a87c', '#bfa27a'];
  const place = (x, z, w, d, rot) => house(b, ctx, { pos: [x, z], size: [w, d], height: 4 + rng() * 4, rot, color: colors[Math.floor(rng() * colors.length)], trim: '#a88e68', upper: rng() < 0.45, door: '#3a2a1c' });
  for (let z = -36; z < 40; z += 10 + rng() * 3) {
    place(-36 - rng() * 3, z, 9, 8 + rng() * 2, Math.PI / 2 + (rng() - 0.5) * 0.1);
    place(36 + rng() * 3, z, 9, 8 + rng() * 2, -Math.PI / 2 + (rng() - 0.5) * 0.1);
  }
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2, r = 55 + rng() * 60;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 10;
    if (ctx.blocked(x, z, 3)) continue;
    place(x, z, 7 + rng() * 5, 6 + rng() * 5, rng() * 0.6 - 0.3);
  }
  // The great wall around the city with towers.
  const R = 135, n = 18;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const p0 = [Math.sin(a0) * R, Math.cos(a0) * R - 10], p1 = [Math.sin(a1) * R, Math.cos(a1) * R - 10];
    cityWall(b, ctx, { from: p0, to: p1, height: 14, thick: 4, color: '#c4a87c' });
    const ty = ctx.terrainHeight(...p0);
    b.add('#b89a70', box(8, 20, 8, [p0[0], ty + 9, p0[1]]));
  }
  // A ziggurat rises behind the palace.
  const [zx, zz] = [40, -105];
  let h = ctx.terrainHeight(zx, zz) - 1;
  for (const [s, th] of [[46, 9], [34, 8], [24, 8], [14, 7]]) {
    b.add('#c49a6a', boxGeo(s, th, s, [zx, h + th / 2, zz], { uv: { su: 5 } }), { stone: true });
    h += th;
  }
  for (let i = 0; i < 24; i++) {
    const a = rng() * Math.PI * 2, r = 45 + rng() * 80;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 10;
    if (ctx.blocked(x, z, 3)) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 5, lean: 0.1 + rng() * 0.2, dir: rng() * 6.28, seed: i + 20, leaf: '#6a7a4a', leafDark: '#566440' });
  }
}

function ashes(b, ctx) {
  const rng = makeRng(7);
  const piles = [[KING[0] + 1.6, KING[1] + 0.8], [-3, 10], [10, -4], [16, 10], [-22, 14], [4, 16], [-4, -18], [20, -16]];
  piles.forEach(([x, z], i) => {
    const y = ctx.terrainHeight(x, z);
    b.add('#8a8580', ball(1.2, [x, y, z], [1.4, 0.35, 1.2], 9), { cast: false });
    b.add('#6a6560', ball(0.6, [x + 0.3, y + 0.25, z], [1, 0.5, 1], 7), { cast: false });
    ctx.exclude({ kind: 'circle', x, z, r: 1.6 });
  });
  for (let i = 0; i < 260; i++) {
    const x = (rng() - 0.5) * 60, z = -8 + (rng() - 0.5) * 50;
    b.add(rng() < 0.5 ? '#9a948c' : '#a8a29a', box(0.15 + rng() * 0.25, 0.02, 0.15 + rng() * 0.25, [x, ctx.terrainHeight(x, z) + 0.02, z], [0, rng() * 3, 0]), { cast: false });
  }
}

function people(b, ctx) {
  const [kx, kz] = KING;
  const king = person(ctx, { pos: KING, face: [kx, kz + 10], kneel: true, scale: 1.05, colors: { robe: SACK, mantle: '#4a3e32', skin: '#a87650', hair: '#8a8580', sash: '#3e342a', arms: [0.3, 0.6] } });
  king.rotation.x = 0.2;
  // His robe laid aside and his crown set down beside him.
  b.add('#6a2a6a', box(1.8, 0.1, 1.2, [kx - 2.2, ctx.terrainHeight(kx - 2.2, kz) + 0.05, kz + 0.3], [0, 0.4, 0]), { cast: false });
  b.add('#e2b13c', box(0.9, 0.1, 0.3, [kx - 2.2, ctx.terrainHeight(kx - 2.2, kz) + 0.12, kz + 0.3], [0, 0.4, 0]), { emissive: '#4a3008' });
  b.add('#e2b13c', cyl(0.18, 0.16, 0.3, [kx - 1.3, ctx.terrainHeight(kx - 1.3, kz) + 0.15, kz - 0.6], [0, 0, 0], 8), { emissive: '#4a3008' });
  b.add('#8a8580', ball(1.4, [kx, ctx.terrainHeight(kx, kz), kz], [1.3, 0.2, 1.3], 10), { cast: false });
  // Nobles kneeling about the king.
  [[-2.6, 1.6], [2.8, 1.4], [-4.2, -0.4], [4.4, -0.6]].forEach(([dx, dz], i) => person(ctx, { pos: [kx + dx, kz + dz], face: [kx, kz + 12], kneel: true, colors: { robe: i % 2 ? '#4a3e32' : SACK, mantle: '#3e342a', skin: '#9c6a45', hair: '#8a8580' } }));

  // Jonah on a step of stone, crying the word.
  const [jx, jz] = JONAH;
  const jy = ctx.terrainHeight(jx, jz);
  b.add(STONE, boxGeo(3.4, 1.7, 3, [jx, jy + 0.6, jz], { uv: { su: 2 } }), { stone: true });
  ctx.addCollider({ x: jx, z: jz, hx: 1.7, hz: 1.5, rot: 0, top: jy + 1.45, walkable: true });
  ctx.exclude({ kind: 'circle', x: jx, z: jz, r: 2.6 });
  person(ctx, { pos: JONAH, y: jy + 1.45, face: [4, 14], scale: 1.08, colors: { robe: '#b5823a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#d9c7a3', arms: [0.5, 1.3] } });

  // Beasts too are covered in sackcloth.
  const rng = makeRng(77);
  for (let i = 0; i < 10; i++) {
    const x = 18 + rng() * 12, z = 4 + rng() * 22, rot = rng() * 6.28;
    if (ctx.blocked(x, z, 1)) continue;
    sheep(b, ctx, { pos: [x, z], rot, color: '#d8d0c0' });
    sackcloth(b, ctx, [x, z], rot, [0.9, 1.1, 0.95]);
  }
  for (const [x, z, rot] of [[24, -10, 2.2], [27, -6, 2.6], [-28, 22, 0.8]]) {
    ox(b, ctx, { pos: [x, z], rot, color: '#7a5236' });
    sackcloth(b, ctx, [x, z], rot, [1.2, 1.9, 1.55]);
  }
}

function custom(ctx) {
  const b = new Batch(ctx);
  palace(b, ctx);
  city(b, ctx);
  people(b, ctx);
  ashes(b, ctx);
  b.flush();
  glow(ctx, { pos: [-60, 120, -400], size: 300, color: '#fff4dc', opacity: 0.25, pulse: 0 });
}

const ASH = ['#8a8580', '#9a948c', '#7a746c', '#a8a29a'];

export default {
  title: 'Jonah 3: Jonah preaches in Nineveh',
  subtitle: 'Nineveh, that great city. "Let man and beast be covered with sackcloth"',
  seed: 42,
  style: { ...DAY_STYLE, fog: { color: '#cfc4b0', near: 90, far: 700 } },
  sky: { zenith: '#7a8a96', mid: '#b4aea2', horizon: '#ddd2bc', ground: '#c4b090', glowColor: '#f0e6d0', glowDir: [-0.15, 0.3, -1] },
  sun: { dir: [-0.3, 0.8, -0.5], color: '#f4ead8', intensity: 1.8, hemi: { sky: '#d4d0c8', ground: '#9a8466', intensity: 1.3 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 230, hillHeight: 30, undulation: 0.15,
    plaza: { center: [0, -6], size: [66, 54] },
    colors: { sand: '#cdb48a', dirt: '#b89a70', grass: '#a4a070', grassDark: '#8c8a5c', plaza: '#d2c0a0', plazaLine: '#ac9878', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a89070' },
  },
  mountains: { count: 22, distance: [560, 800], height: [50, 100], widthRatio: [2, 3], colors: ['#a8a090', '#9a9282', '#b0a690'] },
  objects: [
    { type: 'stones', count: 300, ring: [10, 120], size: [0.12, 0.35], colors: ['#c9a87a', '#b89a70', '#a8805c'] },
  ],
  custom,
  clouds: { layers: [{ count: 40, distance: [300, 800], height: [90, 170], size: [50, 100], color: '#e4ded4', shade: '#8a8478' }] },
  crowd: {
    seed: 42,
    minSpacing: 0.7,
    facing: JONAH,
    colors: {
      robes: [SACK, '#4a3e32', '#6b5a48', '#3e342a', '#5e5244', '#72624e'],
      mantles: ['#4a3e32', '#5a4a3a', '#3e342a', '#6b5a48'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
      hair: ASH,
      wraps: ASH,
    },
    aisles: [{ from: [0, 30], to: [0, -26], width: 4 }],
    keepClear: [{ kind: 'circle', x: KING[0], z: KING[1], r: 6 }],
    groups: [
      { center: JONAH, radius: [3, 15], count: 200, kneel: 0.65, children: 0.15, facingJitter: 0.5, lean: 0.3 },
      { shape: 'rect', center: [8, -2], size: [24, 40], count: 260, kneel: 0.7, children: 0.15, facingJitter: 1.2, lean: 0.35, facing: [0, -40] },
      { shape: 'rect', center: [0, -24], size: [30, 8], count: 70, kneel: 0.8, facing: KING, facingJitter: 0.4, lean: 0.3 },
      { shape: 'rect', center: [-20, 18], size: [16, 16], count: 80, kneel: 0.5, children: 0.2, facingJitter: 1, lean: 0.2 },
    ],
  },
  player: {
    start: [1, 17],
    lookAt: [-5, -30],
    colors: { robe: '#b5823a', mantle: '#4f7f80', skin: '#a8724a', hair: '#2b1a12', sash: '#d9c7a3' },
  },
};
