// Daniel 5: at Belshazzar's feast the fingers of a man's hand write on the plaster over against the candlestick.
// x is east, z is south. The hall runs north from the player. The writing is on the north wall, the king's dais to the northeast.
import * as THREE from 'three';
import { Batch, DAY_STYLE, PALETTE, attach, ball, boxGeo, box, cyl, flames, glow, makeRng, person } from './lib/ot-38-kit.js';
import { FX_LAYER } from '../engine/renderer.js';

const HALL = { x0: -20, x1: 20, z0: -32, z1: 16, h: 13 };
const WRITING = [-4, -31.3];
const STAND = [-4, -27.5];
const KING = [8, -25];
const GOLD = '#e2b13c';
const GOLD_EM = '#5a3a08';
const BRICK = '#3f6aa0';
const PLASTER = '#d8c6a2';

function wallSeg(b, ctx, [ax, az], [bx, bz], { h, color, thick = 1.2, fret = null }) {
  const L = Math.hypot(bx - ax, bz - az);
  const rot = -Math.atan2(bz - az, bx - ax);
  const x = (ax + bx) / 2, z = (az + bz) / 2;
  const y = -0.4;
  const f = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0)), new THREE.Vector3(1, 1, 1));
  b.add(color, boxGeo(L, h, thick, [0, h / 2, 0], { uv: { su: 3 } }), { frame: f, stone: true });
  if (fret) {
    b.add(fret[0], boxGeo(L, 1.1, thick + 0.2, [0, 2.4, 0], { uv: { su: 4.4, sv: 1.1, oy: 0.55, local: true, flatCaps: true } }), { frame: f, fret: fret[1] });
    b.add(fret[0], boxGeo(L, 1.1, thick + 0.2, [0, h - 1.4, 0], { uv: { su: 4.4, sv: 1.1, oy: 0.55, local: true, flatCaps: true } }), { frame: f, fret: fret[1] });
  }
  ctx.addCollider({ x, z, hx: L / 2, hz: thick / 2, rot, top: 40 });
  ctx.exclude({ kind: 'rect', x, z, hx: L / 2, hz: thick / 2 + 0.6, rot });
}

function hall(b, ctx) {
  const { x0, x1, z0, z1, h } = HALL;
  const glaze = ['#2f5f9a', '#e8c060'];
  wallSeg(b, ctx, [x0, z0], [x1, z0], { h, color: PLASTER, fret: ['#8c2a2a', '#e8c060'] });
  wallSeg(b, ctx, [x0, z0], [x0, z1], { h, color: BRICK, fret: glaze });
  wallSeg(b, ctx, [x1, z0], [x1, z1], { h, color: BRICK, fret: glaze });
  wallSeg(b, ctx, [x0, z1], [-4, z1], { h, color: BRICK, fret: glaze });
  wallSeg(b, ctx, [4, z1], [x1, z1], { h, color: BRICK, fret: glaze });
  b.add('#2b1a12', box(8, 4, 0.4, [0, h - 2, z1]));

  // Cedar ceiling on beams, open to nothing but the dark.
  b.add('#4a2e1c', box(x1 - x0 + 2, 0.6, z1 - z0 + 2, [0, h + 0.3, (z0 + z1) / 2]), { cast: false });
  for (let z = z0 + 3; z < z1; z += 4) b.add('#6b4428', box(x1 - x0, 0.7, 0.6, [0, h - 0.35, z]), { cast: false });

  // Columns down both sides of the hall.
  for (const x of [-13, 13]) {
    for (let z = z0 + 6; z < z1 - 2; z += 8) {
      b.add('#d8c49a', cyl(0.6, 0.7, h, [x, h / 2, z], [0, 0, 0], 12), { stone: true });
      b.add(GOLD, cyl(1.1, 0.7, 0.8, [x, h - 0.4, z], [0, 0, 0], 12), { emissive: GOLD_EM });
      b.add('#c4ac80', box(1.6, 0.4, 1.6, [x, 0.2, z]));
      ctx.addCollider({ x, z, hx: 0.7, hz: 0.7, rot: 0, top: 40 });
      ctx.exclude({ kind: 'circle', x, z, r: 1.2 });
    }
  }
  // Hangings between the columns on the side walls.
  for (const x of [x0 + 0.65, x1 - 0.65]) {
    for (let z = z0 + 10; z < z1 - 2; z += 8) b.add('#8c2a2a', box(0.1, 6, 3, [x, 7.5, z]), { cast: false });
  }
}

function tables(b, ctx) {
  const rng = makeRng(39);
  const rows = [[-9, -22, 8], [-3.5, -12, 4], [3.5, -12, 4], [9, -18, 6]];
  for (const [x, zStart, zEnd] of rows) {
    const L = zEnd - zStart, z = (zStart + zEnd) / 2;
    b.add('#7a4a2a', box(1.6, 0.12, L, [x, 0.62, z]));
    b.add('#e8dcc0', box(1.75, 0.04, L + 0.1, [x, 0.7, z]), { cast: false });
    for (const lz of [zStart + 0.4, zEnd - 0.4]) for (const lx of [-0.6, 0.6]) b.add('#5a3420', box(0.12, 0.6, 0.12, [x + lx, 0.3, lz]));
    ctx.addCollider({ x, z, hx: 0.85, hz: L / 2, rot: 0, top: 0.75 });
    ctx.exclude({ kind: 'rect', x, z, hx: 0.9, hz: L / 2 + 0.2 });
    for (let k = 0; k < L * 1.4; k++) {
      const vx = x + (rng() - 0.5) * 1.2, vz = zStart + 0.4 + rng() * (L - 0.8);
      const r = rng();
      if (r < 0.45) b.add(GOLD, cyl(0.09, 0.05, 0.22, [vx, 0.83, vz], [0, 0, 0], 8), { emissive: GOLD_EM });
      else if (r < 0.7) b.add(GOLD, ball(0.18, [vx, 0.74, vz], [1, 0.4, 1], 8), { emissive: GOLD_EM });
      else if (r < 0.85) b.add('#8a3a5a', ball(0.11, [vx, 0.78, vz], [1, 1, 1], 7));
      else b.add('#c8a07a', cyl(0.12, 0.08, 0.38, [vx, 0.9, vz], [0, 0, 0], 8));
    }
    // A fallen cup, dropped in fear.
    b.add(GOLD, cyl(0.09, 0.05, 0.22, [x + 1.1, 0.08, zEnd - 1], [0, 0, Math.PI / 2], 8), { emissive: GOLD_EM });
  }
}

function lamps(b, ctx) {
  const list = [];
  const lights = [];
  const stand = (x, z, h) => {
    b.add(GOLD, cyl(0.06, 0.08, h, [x, h / 2, z], [0, 0, 0], 6), { emissive: GOLD_EM });
    b.add(GOLD, cyl(0.4, 0.5, 0.15, [x, 0.08, z], [0, 0, 0], 8), { emissive: GOLD_EM });
    b.add(GOLD, cyl(0.32, 0.12, 0.22, [x, h + 0.1, z], [0, 0, 0], 8), { emissive: GOLD_EM });
    list.push({ pos: [x, h + 0.2, z], h: 0.7, w: 1.4 });
    glow(ctx, { pos: [x, h + 0.6, z], size: 3.5, color: '#ffb35a', opacity: 0.6, pulse: 0.08 });
    ctx.addCollider({ x, z, hx: 0.25, hz: 0.25, rot: 0, top: h });
  };
  for (const x of [-16.5, 16.5]) for (let z = -26; z < 14; z += 8) stand(x, z, 2.6);
  // The great lampstand over against the writing.
  const [sx, sz] = STAND;
  b.add(GOLD, cyl(0.14, 0.18, 4.2, [sx, 2.1, sz], [0, 0, 0], 8), { emissive: GOLD_EM });
  b.add(GOLD, cyl(0.8, 1, 0.3, [sx, 0.15, sz], [0, 0, 0], 10), { emissive: GOLD_EM });
  for (let i = -3; i <= 3; i++) {
    const x = sx + i * 0.55, top = 4.4 - Math.abs(i) * 0.12;
    if (i) b.add(GOLD, cyl(0.05, 0.05, 1.4 - Math.abs(i) * 0.1, [x, top - 0.6, sz], [0, 0, 0], 6), { emissive: GOLD_EM });
    b.add(GOLD, cyl(0.16, 0.08, 0.16, [x, top + 0.1, sz], [0, 0, 0], 8), { emissive: GOLD_EM });
    list.push({ pos: [x, top + 0.18, sz], h: 0.55, w: 1.1 });
  }
  b.add(GOLD, box(3.4, 0.08, 0.1, [sx, 3.2, sz]), { emissive: GOLD_EM });
  ctx.addCollider({ x: sx, z: sz, hx: 1, hz: 1, rot: 0, top: 4 });
  ctx.exclude({ kind: 'circle', x: sx, z: sz, r: 2 });
  glow(ctx, { pos: [sx, 4.6, sz], size: 6, color: '#ffc070', opacity: 0.6, pulse: 0.06 });
  flames(ctx, list, { outer: '#f08a2c', inner: '#ffe08a' });
  for (const [x, z, i] of [[-12, -20, 26], [12, -20, 26], [-12, 2, 22], [12, 2, 22], [0, -8, 18]]) {
    const l = new THREE.PointLight('#ffb060', i, 30, 1.2);
    l.position.set(x, 5, z);
    ctx.scene.add(l);
    lights.push(l);
  }
  ctx.onFrame((t) => lights.forEach((l, k) => (l.intensity = l.userData.base * (0.9 + 0.1 * Math.sin(t * 7 + k * 2)))));
  lights.forEach((l) => (l.userData.base = l.intensity));
}

// MENE, MENE, TEKEL, UPHARSIN: glowing letters revealed as the hand moves.
function writing(ctx) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 320;
  const g = canvas.getContext('2d');
  const words = 'MENE  MENE  TEKEL  UPHARSIN';
  g.font = 'bold 150px Georgia, "Times New Roman", serif';
  const px = Math.floor(150 * Math.min(1, 1960 / g.measureText(words).width));
  g.font = `bold ${px}px Georgia, "Times New Roman", serif`;
  g.textBaseline = 'middle';
  g.shadowColor = '#ffb030';
  g.shadowBlur = 40;
  g.fillStyle = '#fff6dc';
  g.fillText(words, 40, 165);
  g.shadowBlur = 0;
  g.lineWidth = 6;
  g.strokeStyle = '#a8701c';
  g.strokeText(words, 40, 165);
  g.fillText(words, 40, 165);
  const textFrac = (g.measureText(words).width + 60) / canvas.width;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const width = 21, height = (width * 320) / 2048;
  const geo = new THREE.PlaneGeometry(width, height).translate(width / 2, 0, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  const [wx, wz] = WRITING;
  const left = wx - width / 2, y = 7.6;
  mesh.position.set(left, y, wz + 0.05);
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
  glow(ctx, { pos: [wx, y, wz + 0.5], size: 18, color: '#ffe2a0', opacity: 0.35, pulse: 0.04, additive: true });

  const hand = new THREE.Group();
  const white = '#fbf6ea';
  const em = '#b8ab90';
  attach(ctx, hand, new THREE.SphereGeometry(0.3, 10, 8).scale(1, 1.15, 0.45), white, { emissive: em });
  attach(ctx, hand, new THREE.CapsuleGeometry(0.17, 0.7, 4, 8), white, { pos: [0, -0.62, -0.05], emissive: em });
  [[-0.2, 0.42, 0.5], [-0.07, 0.48, 0.58], [0.07, 0.46, 0.54], [0.2, 0.38, 0.44]].forEach(([fx, fy, len], i) => {
    attach(ctx, hand, new THREE.CapsuleGeometry(0.065, len, 3, 6), white, { pos: [fx, fy + len / 2, 0.06 + (i === 1 ? 0.12 : 0)], rot: [i === 1 ? 0.5 : 0.15, 0, -fx * 0.4], emissive: em });
  });
  attach(ctx, hand, new THREE.CapsuleGeometry(0.07, 0.36, 3, 6), white, { pos: [0.32, 0.05, 0.08], rot: [0.3, 0, -0.9], emissive: em });
  hand.scale.setScalar(2.2);
  ctx.scene.add(hand);
  const halo = glow(ctx, { pos: [0, 0, 0], size: 5, color: '#fff2d0', opacity: 0.85, pulse: 0.06 });
  const light = new THREE.PointLight('#fff0d0', 16, 16, 1.3);
  ctx.scene.add(light);
  const cycle = 30, writeTime = 9;
  ctx.onFrame((t) => {
    const ph = (t + 8) % cycle;
    const frac = Math.min(1, ph / writeTime);
    mesh.scale.x = Math.max(0.001, frac);
    tex.repeat.x = Math.max(0.001, frac);
    const hx = left + frac * width * textFrac + (frac < 1 ? 0.2 : 1.4);
    const hy = y - (frac < 1 ? 0.4 : 1.6) + Math.sin(t * 9) * 0.12 * (frac < 1 ? 1 : 0);
    hand.position.set(hx, hy, wz + 0.75);
    hand.rotation.set(-0.35, 0, -0.25 + Math.sin(t * 6) * 0.05);
    halo.position.set(hx, hy, wz + 1);
    light.position.set(hx, hy, wz + 2.5);
  });
}

function king(b, ctx) {
  const [x, z] = KING;
  b.add('#d8c49a', boxGeo(9, 1, 7, [x, 0.1, z], { uv: { su: 3 } }), { stone: true });
  b.add('#c4ac80', boxGeo(9, 0.5, 1.2, [x, -0.1, z + 4], { uv: { su: 3 } }), { stone: true });
  ctx.addCollider({ x, z, hx: 4.5, hz: 3.5, rot: 0, top: 0.6, walkable: true });
  ctx.addCollider({ x, z: z + 4, hx: 4.5, hz: 0.6, rot: 0, top: 0.3, walkable: true });
  b.add('#7a2a5a', box(9, 0.04, 7, [x, 0.62, z]), { cast: false });
  b.add(GOLD, box(1.6, 1.2, 1.2, [x + 1.5, 1.2, z - 2]), { emissive: GOLD_EM });
  b.add(GOLD, box(1.6, 1.4, 0.3, [x + 1.5, 2.4, z - 2.6]), { emissive: GOLD_EM });
  b.add('#7a4a2a', box(5, 0.12, 1.4, [x - 1, 1.3, z + 0.5]));
  b.add(GOLD, cyl(0.1, 0.06, 0.26, [x - 2, 1.5, z + 0.5], [0, 0, 0], 8), { emissive: GOLD_EM });
  b.add(GOLD, cyl(0.1, 0.06, 0.26, [x - 0.4, 1.5, z + 0.3], [0, 0, 0], 8), { emissive: GOLD_EM });
  ctx.addCollider({ x: x - 1, z: z + 0.5, hx: 2.5, hz: 0.7, rot: 0, top: 1.4 });
  const top = 0.6;
  const fig = person(ctx, { pos: [x + 0.6, z - 1.1], y: top, face: WRITING, scale: 1.1, colors: { robe: '#7a2a5a', mantle: GOLD, skin: '#a87650', hair: '#1f140e', sash: '#e8c060', arms: [0.7, 1.25] } });
  fig.rotation.x = -0.12;
  attach(ctx, fig, new THREE.CylinderGeometry(0.15, 0.13, 0.32, 8), GOLD, { pos: [0, 1.82, 0], emissive: GOLD_EM });
  const court = [
    { robe: '#e6d8b8', mantle: '#2f5f9a', skin: '#c08f66', hair: '#3a2418', sash: GOLD, arms: [0.3, 1.0] },
    { robe: '#c98b3c', mantle: '#8c2a2a', skin: '#9c6a45', hair: '#2b1a12', sash: '#e6d8b8' },
    { robe: '#3e6e66', mantle: '#d9c7a3', skin: '#a87650', hair: '#e6d8b8', sash: GOLD },
  ];
  person(ctx, { pos: [x - 1.5, z - 1.4], y: top, face: WRITING, colors: court[0] });
  person(ctx, { pos: [x + 2.6, z + 0.6], y: top, face: WRITING, colors: court[1] });
  person(ctx, { pos: [x + 3, z - 1.8], y: top, face: WRITING, colors: { ...court[2], arms: [0.5, 0.9] } });
}

function custom(ctx) {
  const b = new Batch(ctx);
  hall(b, ctx);
  tables(b, ctx);
  king(b, ctx);
  lamps(b, ctx);
  b.flush();
  writing(ctx);
}

export default {
  title: "Daniel 5:5-6, 25-28: The writing on the wall",
  subtitle: "Belshazzar's feast, Babylon, by night. MENE, MENE, TEKEL, UPHARSIN",
  seed: 39,
  style: { ...DAY_STYLE, fog: { color: '#3a2418', near: 60, far: 160 } },
  sky: { zenith: '#0e1426', mid: '#1c2238', horizon: '#3a3048', ground: '#1a1410', glowColor: '#3a3048', glowDir: [0, 0.3, -1] },
  sun: { dir: [0.25, 1, 0.35], color: '#ffd8a8', intensity: 0.8, hemi: { sky: '#a87a5a', ground: '#4a2e1c', intensity: 0.95 }, shadowSize: 50 },
  ground: {
    size: 600, segments: 120, flatRadius: 120, hillHeight: 10, undulation: 0,
    plaza: { center: [(HALL.x0 + HALL.x1) / 2, (HALL.z0 + HALL.z1) / 2], size: [HALL.x1 - HALL.x0 + 2, HALL.z1 - HALL.z0 + 2] },
    colors: { sand: '#5a4030', dirt: '#4a3428', grass: '#5a4030', grassDark: '#4a3428', plaza: '#c9a77a', plazaLine: '#8a6a48', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#3a2a20' },
  },
  objects: [],
  custom,
  crowd: {
    seed: 39,
    minSpacing: 0.62,
    facing: WRITING,
    colors: {
      ...PALETTE,
      robes: ['#2f5f9a', '#8c2a2a', '#c98b3c', '#e6d8b8', '#5a7a4a', '#7a2a5a', '#d9c7a3', '#a87b4f', '#3e6e66', '#b5523b', '#e8c060'],
      mantles: ['#e8c060', '#8c2a2a', '#2f5f9a', '#d9c7a3', '#5e4632', '#7a2a5a'],
      wraps: ['#e6d8b8', '#c8912e', '#e8c060', '#d9c7a3', '#2f5f9a', '#8c2a2a'],
    },
    aisles: [{ from: [0, 16], to: [-4, -25], width: 3.2 }],
    keepClear: [{ kind: 'rect', x: KING[0], z: KING[1], hx: 5, hz: 4.4 }, { kind: 'rect', x: WRITING[0], z: -29, hx: 7, hz: 3 }],
    groups: [
      { shape: 'rect', center: [-9, -14], size: [5, 20], count: 60, kneel: 0.75, facingJitter: 0.5, children: 0 },
      { shape: 'rect', center: [-3.5, -4], size: [4, 18], count: 40, kneel: 0.7, facingJitter: 0.5 },
      { shape: 'rect', center: [3.5, -4], size: [4, 18], count: 40, kneel: 0.7, facingJitter: 0.5 },
      { shape: 'rect', center: [9, -6], size: [5, 26], count: 60, kneel: 0.7, facingJitter: 0.5 },
      { shape: 'rect', center: [-16.5, -4], size: [4, 36], count: 70, kneel: 0.3, facingJitter: 0.4 },
      { shape: 'rect', center: [16.5, 0], size: [4, 26], count: 50, kneel: 0.3, facingJitter: 0.4 },
      { shape: 'rect', center: [0, 10], size: [20, 8], count: 50, facingJitter: 0.3 },
    ],
  },
  player: {
    start: [0, 6],
    lookAt: [-4, -31],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#2f5f9a' },
  },
};
