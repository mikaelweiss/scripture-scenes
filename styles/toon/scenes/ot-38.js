// Daniel 3: three men walk loose in the furnace, and a fourth like the Son of God walks with them.
// x is east, z is south. The furnace mouth faces the player from the north. The golden image stands on the plain beyond.
import * as THREE from 'three';
import { Batch, DAY_STYLE, PALETTE, addSun, attach, ball, box, boxGeo, cyl, flames, frameAt, glow, makeRng, palm, person, smoke } from './lib/ot-38-kit.js';
import { makeFigure } from '../engine/people.js';

const F = [0, -22];
const W = 20, D = 14, H = 11, T = 1.6;
const MOUTH = { w: 10, h: 8 };
const KING = [17, -4];
const IMAGE = [-75, -105];
const BRICK = '#b47a4c';
const BRICK_DARK = '#8a5634';
const GLAZE = ['#2f5f9a', '#e8c060'];
const GOLD = '#e2b13c';

function furnace(b, ctx) {
  const [fx, fz] = F;
  const y = ctx.terrainHeight(fx, fz) - 0.3;
  const f = frameAt(fx, y, fz);
  const sideW = (W - MOUTH.w) / 2;
  const add = (w, h, d, pos, opts = {}) => b.add(opts.color ?? BRICK, boxGeo(w, h, d, pos, { uv: { su: 3 } }), { frame: f, stone: true, ...opts });

  add(W, H, T, [0, H / 2, -D / 2 + T / 2]);
  for (const s of [-1, 1]) {
    add(T, H, D, [s * (W / 2 - T / 2), H / 2, 0]);
    add(sideW, H, T, [s * (MOUTH.w / 2 + sideW / 2), H / 2, D / 2 - T / 2]);
    add(2.2, H + 2.5, 2.2, [s * (W / 2), (H + 2.5) / 2, D / 2], { color: BRICK_DARK });
    add(2.2, H + 2.5, 2.2, [s * (W / 2), (H + 2.5) / 2, -D / 2], { color: BRICK_DARK });
    b.add(GOLD, cyl(0.9, 1.2, 1, [s * W / 2, H + 3, D / 2]), { frame: f, emissive: '#5a3a08' });
  }
  add(MOUTH.w, H - MOUTH.h, T, [0, MOUTH.h + (H - MOUTH.h) / 2, D / 2 - T / 2]);
  b.add(GLAZE[0], boxGeo(W + 0.4, 1.2, D + 0.4, [0, H - 0.9, 0], { uv: { su: 4.8, sv: 1.2, oy: 0.6, local: true, flatCaps: true } }), { frame: f, fret: GLAZE[1] });
  b.add(GLAZE[0], boxGeo(MOUTH.w + 1.6, 1, 0.5, [0, MOUTH.h + 0.5, D / 2 + 0.15], { uv: { su: 4, sv: 1, oy: 0.5, local: true, flatCaps: true } }), { frame: f, fret: GLAZE[1] });
  for (const s of [-1, 1]) add(0.8, MOUTH.h, 0.6, [s * (MOUTH.w / 2 + 0.4), MOUTH.h / 2, D / 2 + 0.1], { color: BRICK_DARK });

  // Stepped roof and a broad chimney that pours smoke.
  add(W, 0.8, D, [0, H + 0.4, 0]);
  add(W - 4, 1.4, D - 4, [0, H + 1.5, 0], { color: BRICK_DARK });
  add(6, 4, 5, [0, H + 4, -1]);
  add(6.8, 0.6, 5.8, [0, H + 6.2, -1], { color: BRICK_DARK });

  // A raised hearth inside, scorched dark, that the fire burns on.
  b.add('#3a2418', box(W - 2 * T, 0.35, D - 2 * T, [0, 0.45, 0]), { frame: f, cast: false });
  b.add('#5a3020', box(MOUTH.w + 2, 0.3, 3, [0, 0.35, D / 2 + 1.5]), { frame: f, cast: false });

  const top = y + H + 6.5;
  ctx.addCollider({ x: fx, z: fz - D / 2 + T / 2, hx: W / 2, hz: T / 2, rot: 0, top });
  for (const s of [-1, 1]) {
    ctx.addCollider({ x: fx + s * (W / 2 - T / 2), z: fz, hx: T / 2 + 0.6, hz: D / 2 + 0.6, rot: 0, top });
    ctx.addCollider({ x: fx + s * (MOUTH.w / 2 + sideW / 2), z: fz + D / 2 - T / 2, hx: sideW / 2, hz: T / 2 + 0.2, rot: 0, top });
  }
  ctx.addCollider({ x: fx, z: fz, hx: W / 2 - T, hz: D / 2 - T, rot: 0, top: y + 0.62, walkable: true });
  ctx.exclude({ kind: 'rect', x: fx, z: fz, hx: W / 2 + 2, hz: D / 2 + 4 });
  return y + 0.62;
}

function fire(ctx, floorY) {
  const rng = makeRng(38);
  const [fx, fz] = F;
  const list = [];
  const ix = W / 2 - T - 0.6, iz = D / 2 - T - 0.4;
  for (let i = 0; i < 120; i++) {
    const x = fx + (rng() - 0.5) * 2 * ix, z = fz + (rng() - 0.5) * 2 * iz;
    const edge = Math.max(Math.abs(x - fx) / ix, Math.abs(z - fz) / iz);
    const path = Math.hypot((x - fx) / 4.2, (z - fz - 1.8) / 2.2);
    if (path > 0.6 && path < 1.45) continue;
    if (z > fz + 1.5 && Math.abs(x - fx) < 6) continue;
    const back = z < fz - 1 ? 1.5 : 1;
    list.push({ pos: [x, floorY, z], h: (1.4 + rng() * 2.4) * back, w: 2.5 + rng() * 3, light: i % 40 === 0 });
  }
  // Tongues of flame licking out over the lintel.
  for (let i = 0; i < 16; i++) {
    const x = fx + (i / 15 - 0.5) * (MOUTH.w - 1);
    list.push({ pos: [x, floorY + MOUTH.h - 1.6, fz + D / 2 - 0.6], h: 2 + rng() * 2.5, w: 3 + rng() * 2 });
  }
  flames(ctx, list, { outer: '#f07a24', inner: '#ffe27a', light: { color: '#ff9a40', intensity: 12, distance: 20 } });
  glow(ctx, { pos: [fx, floorY + 3, fz - 3], size: 20, color: '#ff8a30', opacity: 0.35, pulse: 0.06 });
  
  const out = new THREE.PointLight('#ffa050', 30, 40, 1.3);
  out.position.set(fx, floorY + 4, fz + D / 2 + 3);
  ctx.scene.add(out);
  ctx.onFrame((t) => (out.intensity = 30 * (0.85 + 0.15 * Math.sin(t * 8.3) * Math.sin(t * 3.7))));
  smoke(ctx, { pos: [fx, floorY + H + 6, fz - 1], count: 26, size: [4, 9], rise: 70, spread: 5, drift: [18, -6], speed: 0.035, color: '#5a4a48', shade: '#1e1618' });
}

// Shadrach, Meshach, Abednego, and the fourth, walking a slow loop through the flames.
function walkers(ctx, floorY) {
  const [fx, fz] = F;
  const men = [
    { robe: '#3e5e8c', mantle: '#c8912e', skin: '#9c6a45', hair: '#e6d8b8', sash: '#b5523b', arms: [0.25, 0.4] },
    { robe: '#8c3a3a', mantle: '#d9c7a3', skin: '#a87650', hair: '#c8912e', sash: '#2f5f9a', arms: [0.25, 0.6] },
    { robe: '#5a7a4a', mantle: '#8c5a3c', skin: '#8a5a3b', hair: '#d9c7a3', sash: '#e8c060', arms: [0.3, 0.3] },
  ];
  const figs = men.map((c) => makeFigure(c, ctx.kit));
  const fourth = makeFigure({ robe: '#fbf7ee', mantle: '#f3eddf', skin: '#fbf3e4', hair: '#fbf7ee', sash: '#efe3c2', arms: [0.45, 0.5] }, ctx.kit, { glow: 0.55 });
  fourth.scale.setScalar(1.12);
  figs.push(fourth);
  for (const g of figs) ctx.scene.add(g);
  const halo = glow(ctx, { pos: [0, 0, 0], size: 6, color: '#fff4d6', opacity: 0.9, pulse: 0.05 });
  const light = new THREE.PointLight('#fff2d0', 18, 14, 1.4);
  ctx.scene.add(light);
  const cz = fz + 1.8;
  ctx.onFrame((t) => {
    figs.forEach((g, i) => {
      const a = t * 0.16 + (i / 4) * Math.PI * 2;
      const x = fx + Math.sin(a) * 4.2, z = cz + Math.cos(a) * 2.2;
      g.position.set(x, floorY + Math.abs(Math.sin(t * 3.4 + i)) * 0.05, z);
      g.rotation.y = Math.atan2(Math.cos(a) * 4.2, -Math.sin(a) * 2.2);
    });
    halo.position.set(fourth.position.x, floorY + 1.3, fourth.position.z);
    light.position.set(fourth.position.x, floorY + 2.5, fourth.position.z + 1);
  });
}

function kingDais(b, ctx) {
  const [x, z] = KING;
  const y = ctx.terrainHeight(x, z);
  b.add('#d8c49a', boxGeo(8, 1.2, 6, [x, y + 0.3, z], { uv: { su: 3 } }), { stone: true });
  b.add('#c4ac80', boxGeo(4, 0.4, 1.2, [x - 5, y + 0.2, z], { uv: { su: 3 } }), { stone: true });
  ctx.addCollider({ x, z, hx: 4, hz: 3, rot: 0, top: y + 0.9, walkable: true });
  ctx.addCollider({ x: x - 5, z, hx: 1, hz: 2, rot: 0, top: y + 0.4, walkable: true });
  for (const [px, pz] of [[-3.6, -2.6], [3.6, -2.6], [-3.6, 2.6], [3.6, 2.6]]) b.add(GOLD, cyl(0.16, 0.18, 4.2, [x + px, y + 3, z + pz]), { emissive: '#4a3008' });
  b.add('#8c2a2a', box(8, 0.3, 6, [x, y + 5.2, z]));
  b.add(GLAZE[0], boxGeo(8.3, 0.6, 6.3, [x, y + 5.0, z], { uv: { su: 2.4, sv: 0.6, oy: 0.3, local: true, flatCaps: true } }), { fret: GLAZE[1] });
  b.add(GOLD, box(1.4, 1.6, 1.1, [x + 1.6, y + 1.7, z - 1.6]), { emissive: '#5a3a08' });
  b.add(GOLD, box(1.4, 0.9, 0.3, [x + 1.6, y + 2.9, z - 2.1]), { emissive: '#5a3a08' });
  ctx.exclude({ kind: 'rect', x, z, hx: 5, hz: 4 });
  const top = y + 0.9;
  const king = person(ctx, { pos: [x - 1, z + 0.3], y: top, face: F, scale: 1.08, colors: { robe: '#7a2a5a', mantle: GOLD, skin: '#a87650', hair: '#1f140e', sash: '#e8c060', arms: [0.9, 0.9] } });
  attach(ctx, king, new THREE.CylinderGeometry(0.15, 0.13, 0.3, 8), GOLD, { pos: [0, 1.82, 0], emissive: '#5a3a08' });
  const court = [
    { robe: '#2f5f9a', mantle: '#d9c7a3', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' },
    { robe: '#c98b3c', mantle: '#5e4632', skin: '#8a5a3b', hair: '#e6d8b8', sash: '#8c3a3a' },
    { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e' },
  ];
  person(ctx, { pos: [x + 1.6, z + 1.2], y: top, face: [x - 1, z], colors: court[0] });
  person(ctx, { pos: [x - 2.6, z - 1.4], y: top, face: F, colors: { ...court[1], arms: [0.4, 1.0] } });
  person(ctx, { pos: [x + 0.4, z - 2], y: top, face: F, colors: court[2] });
}

// The image of gold, threescore cubits high, on its stepped base.
function goldenImage(b, ctx) {
  const [x, z] = IMAGE;
  const y = ctx.terrainHeight(x, z);
  for (let i = 0; i < 3; i++) {
    const s = 14 - i * 4;
    b.add('#d8c49a', boxGeo(s, 2, s, [x, y + i * 2 + 0.8, z], { uv: { su: 3 } }), { stone: true });
  }
  ctx.addCollider({ x, z, hx: 7, hz: 7, rot: 0, top: y + 40 });
  const statue = makeFigure({ robe: GOLD, mantle: '#d29c2c', skin: GOLD, hair: '#c08a24', sash: '#f0c860', arms: [0.15, 0.2] }, ctx.kit, { glow: 0.18 });
  statue.scale.setScalar(15);
  statue.position.set(x, y + 6.6, z);
  statue.rotation.y = Math.atan2(F[0] - x, F[1] - z + 60);
  ctx.scene.add(statue);
  glow(ctx, { pos: [x, y + 20, z], size: 60, color: '#ffd77a', opacity: 0.25, pulse: 0.02 });
}

function babylon(b, ctx) {
  const rng = makeRng(83);
  // Etemenanki and the city wall on the northern horizon.
  const [zx, zz] = [70, -260];
  const zy = ctx.terrainHeight(zx, zz) - 1;
  const tiers = [[90, 16], [70, 14], [52, 12], [36, 10], [22, 10]];
  let h = zy;
  tiers.forEach(([s, th], i) => {
    b.add(i % 2 ? '#c49a6a' : '#b4865a', boxGeo(s, th, s, [zx, h + th / 2, zz], { uv: { su: 6 } }), { stone: true });
    h += th;
  });
  b.add(GLAZE[0], box(14, 8, 14, [zx, h + 4, zz]));
  b.add('#a87850', box(14, 30, 90, [zx, zy + 30, zz + 52], [0.55, 0, 0]));
  for (let i = -6; i <= 6; i++) {
    const wx = i * 34, wz = -300 + Math.abs(i) * 6;
    b.add('#b88a5c', box(36, 18, 8, [wx, ctx.terrainHeight(wx, wz) + 7, wz], [0, Math.sign(i) * -0.17, 0]));
    b.add('#a87850', box(10, 24, 10, [wx + 17, ctx.terrainHeight(wx, wz) + 10, wz]));
  }
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2, r = 60 + rng() * 120;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (ctx.blocked(x, z, 3) || (Math.abs(x) < 30 && z > -40 && z < 40)) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 5, lean: 0.1 + rng() * 0.2, dir: rng() * 6.28, seed: i + 3 });
  }
}

function custom(ctx) {
  const b = new Batch(ctx);
  const floorY = furnace(b, ctx);
  kingDais(b, ctx);
  goldenImage(b, ctx);
  babylon(b, ctx);
  b.flush();
  fire(ctx, floorY);
  walkers(ctx, floorY);
  addSun(ctx, { dir: [-0.8, 0.22, 0.35], size: 60, color: '#fff0c8', halo: '#ffc070' });
}

export default {
  title: 'Daniel 3:19-27: The fiery furnace',
  subtitle: 'Plain of Dura, Babylon. "Lo, I see four men loose, walking in the midst of the fire"',
  seed: 38,
  style: { ...DAY_STYLE, fog: { color: '#f0cfa0', near: 110, far: 900 } },
  sky: { zenith: '#4c7aa0', mid: '#c9a98c', horizon: '#ffd49a', ground: '#d9b98a', glowColor: '#ffe2a8', glowDir: [-0.8, 0.22, 0.35] },
  sun: { dir: [-0.8, 0.5, 0.35], color: '#ffe6c0', intensity: 2.2, hemi: { sky: '#e6d6c8', ground: '#b98a5a', intensity: 1.1 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 200, hillHeight: 30, undulation: 0.25,
    plaza: { center: [0, 5000], size: [1, 1] },
    colors: { sand: '#dcb886', dirt: '#c99c66', grass: '#b4a46e', grassDark: '#9c8c5a', plaza: '#e6d6b0', plazaLine: '#c7ab7c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b48a62' },
  },
  mountains: { count: 26, distance: [560, 800], height: [40, 90], widthRatio: [2, 3.2], colors: ['#c8a07a', '#b8906c', '#c09878'] },
  objects: [
    { type: 'stones', count: 500, ring: [8, 150], size: [0.12, 0.4], colors: ['#c9a87a', '#b89a70', '#a8805c'] },
  ],
  custom,
  clouds: { layers: [{ count: 22, distance: [400, 800], height: [90, 170], size: [40, 80], color: '#fff0dc', shade: '#a07c6c' }] },
  crowd: {
    seed: 38,
    minSpacing: 0.75,
    facing: F,
    colors: {
      ...PALETTE,
      robes: ['#2f5f9a', '#8c3a3a', '#c98b3c', '#e6d8b8', '#5a7a4a', '#7a2a5a', '#d9c7a3', '#a87b4f', '#3e6e66', '#b5523b'],
      wraps: ['#e6d8b8', '#c8912e', '#e8c060', '#d9c7a3', '#2f5f9a'],
    },
    aisles: [{ from: [0, 40], to: [0, -10], width: 6 }],
    keepClear: [{ kind: 'rect', x: KING[0], z: KING[1], hx: 7, hz: 6 }],
    groups: [
      { center: F, radius: [20, 46], angle: [-1.7, 1.7], count: 520, children: 0.02, facingJitter: 0.4 },
      { center: [-14, -4], radius: [0, 6], count: 30, facingJitter: 0.3, kneel: 0.1 },
    ],
  },
  player: {
    start: [0, 1],
    lookAt: [0, -22],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#2f5f9a' },
  },
};
