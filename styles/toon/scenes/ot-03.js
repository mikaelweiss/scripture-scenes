// Genesis 3:23-24: Adam and Eve leave by the east gate. Cherubim and a turning flaming sword keep the way of the tree of life.
// Coordinates are meters. x is east, z is south. The garden lies west, the player stands east looking back at the gate.
import { BASE_STYLE, THREE, Parts, angel, between, boxes, figure, flames, glow, makeRng, pick } from './lib/ot-01-kit.js';

const GATE = [0, 0];
const GAP = 4.2;
const SWORD = [2.2, 0];

function wall(ctx) {
  const items = [];
  const stone = '#cdb88e';
  for (const side of [-1, 1]) {
    items.push({ pos: [0, side * (GAP + 32)], size: [2.2, 3.6, 64], color: stone, collide: true });
    items.push({ pos: [0, side * (GAP + 0.9)], size: [3.2, 6.4, 1.8], color: '#d8c49a', collide: true });
    items.push({ pos: [0, side * (GAP + 0.9)], size: [3.8, 0.6, 2.4], color: '#b8a070', y: ctx.terrainHeight(0, side * (GAP + 0.9)) + 6.4 });
    for (let i = 0; i < 16; i++) items.push({ pos: [0, side * (GAP + 2.5 + i * 4)], size: [2.6, 0.4, 3.6], color: '#b8a070', y: ctx.terrainHeight(0, side * (GAP + 2.5 + i * 4)) + 3.6 });
  }
  boxes(ctx, items);
}

function sword(ctx) {
  const [x, z] = SWORD;
  const y = ctx.terrainHeight(x, z) + 3.6;
  const g = new THREE.Group();
  const p = new Parts();
  p.box('#fff6d8', [0.22, 4.6, 0.7], [0, 1.0, 0]);
  p.add('#fff6d8', new THREE.ConeGeometry(0.35, 0.8, 4), { pos: [0, 3.7, 0], scale: [0.6, 1, 1] });
  p.box('#c8912e', [0.36, 0.24, 2.0], [0, -1.3, 0]);
  p.box('#8c5a3c', [0.22, 1.0, 0.26], [0, -1.9, 0]);
  const blade = p.group(ctx.kit, { emissive: 0.7, cast: false });
  g.add(blade);
  g.position.set(x, y, z);
  ctx.scene.add(g);
  const tongues = [];
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4;
    tongues.push({ x: x + Math.sin(a) * 0.35, y: y - 1.4 + i * 0.42, z: z + Math.cos(a) * 0.35, h: 1.6 + Math.sin(i) * 0.5, r: 2.2 - i * 0.12 });
  }
  flames(ctx, tongues, { outer: '#f06a1c', inner: '#ffe08a' });
  glow(ctx, [x, y + 0.8, z], 14, '#ffa040', 0.85, 0.08);
  const light = new THREE.PointLight('#ffa040', 30, 22, 1.4);
  light.position.set(x, y + 0.5, z);
  ctx.scene.add(light);
  ctx.onFrame((t) => {
    g.rotation.y = t * 1.6;
    g.rotation.z = Math.sin(t * 0.9) * 0.35;
    light.intensity = 26 + Math.sin(t * 11) * 4;
  });
  ctx.exclude({ kind: 'circle', x, z, r: 2 });
}

// Thorns and thistles on the cursed ground outside the garden.
function thorns(ctx) {
  const rng = makeRng(21);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const spike = new THREE.ConeGeometry(0.08, 0.9, 4);
  const p = new Parts();
  for (let i = 0; i < 90; i++) {
    const x = between(rng, [8, 120]), z = between(rng, [-90, 90]);
    if (Math.abs(z) < 7 && x < 40) continue;
    const s = between(rng, [0.4, 1.1]);
    const y = ctx.terrainHeight(x, z);
    p.add(pick(rng, ['#5a5a32', '#6a5a3a', '#4f4a2e']), geo, { pos: [x, y + s * 0.4, z], scale: [s, s * 0.7, s], rot: [0, rng() * 3, 0] });
    for (let k = 0; k < 4; k++) p.add('#3a2e1e', spike, { pos: [x + (rng() - 0.5) * s, y + s * 0.8, z + (rng() - 0.5) * s], rot: [(rng() - 0.5) * 1.2, 0, (rng() - 0.5) * 1.2], scale: s });
    if (rng() < 0.3) p.add('#9a5ab0', geo, { pos: [x, y + s * 1.1, z], scale: 0.18 });
  }
  ctx.scene.add(p.group(ctx.kit));
}

export default {
  title: 'Genesis 3:23-24: Leaving the garden',
  subtitle: 'Cherubim and a flaming sword at the east of the garden of Eden',
  seed: 3,

  style: { ...BASE_STYLE, fog: { color: '#d8a888', near: 110, far: 800 } },

  sky: { zenith: '#3a3a6a', mid: '#8a6a8a', horizon: '#f2b070', ground: '#a88a68', glowColor: '#ffd090', glowDir: [-1, 0.12, 0.1] },

  sun: { dir: [-0.35, 0.55, 0.7], color: '#ffd8b0', intensity: 2.4, hemi: { sky: '#c8b0c8', ground: '#8a6048', intensity: 1.05 }, shadowSize: 70 },

  ground: {
    size: 1400, segments: 260, flatRadius: 130, hillHeight: 40, undulation: 0.35,
    plaza: { center: [-90, 0], size: [180, 260] },
    colors: { sand: '#c8a878', dirt: '#a8865a', grass: '#a08a58', grassDark: '#7a6a42', plaza: '#6fa04a', plazaLine: '#669a44', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a7a6a' },
  },

  mountains: { count: 30, distance: [460, 760], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#8a6a7a', '#7a6078', '#9a7a84', '#6f5a70'] },

  objects: [
    { type: 'trees', count: 30, center: [70, 20], ring: [40, 120], height: [3, 6], broken: 0.4, fallen: 0.1, trunkColor: '#5a4030', leafColors: ['#6a6a3a', '#7a7040', '#5a5a32'], seed: 9 },
    { type: 'stones', count: 400, center: [40, 0], ring: [4, 90], size: [0.15, 0.6], colors: ['#a88a68', '#8a7058', '#b89a78'] },
  ],

  custom(ctx) {
    wall(ctx);
    ctx.exclude({ kind: 'rect', x: -20, z: 0, hx: 22, hz: 4 });
    ctx.exclude({ kind: 'rect', x: 0, z: 0, hx: 4, hz: 90 });
    ctx.builders.trees({ count: 170, center: [-60, 0], ring: [0, 62], height: [7, 13], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e4e', '#5fa04a', '#2f7f4a', '#7fb050', '#e8a0b0'] }, ctx);
    angel(ctx, [3.2, -6.4], { facing: [30, -6.4], scale: 1.45, glowSize: 7 });
    angel(ctx, [3.2, 6.4], { facing: [30, 6.4], scale: 1.45, glowSize: 7 });
    sword(ctx);
    thorns(ctx);
    const adam = { robe: '#a88a68', mantle: '#7a5a3c', skin: '#a8724a', hair: '#4a3020', sash: '#5e4632', arms: [0.12, 0.2] };
    const eve = { robe: '#c8a97a', mantle: '#8a6a4a', skin: '#b5825a', hair: '#8a6a4a', sash: '#5e4632', arms: [0.12, 0.25] };
    const a = figure(ctx, adam, [15, -0.9], { facing: [40, -2] });
    const e = figure(ctx, eve, [15.4, 0.9], { facing: [40, 2], scale: 0.96 });
    a.rotation.x = e.rotation.x = 0.08;
    glow(ctx, [-30, 14, 0], 60, '#fff0c0', 0.25, 0.02);
  },

  clouds: {
    layers: [
      { count: 26, distance: [500, 900], height: [50, 140], size: [40, 80], color: '#f6c8a0', shade: '#5a3a5a' },
      { count: 10, angle: [-2.2, -1.0], distance: [600, 900], height: [50, 120], size: [40, 70], color: '#ffe0b0', shade: '#7a4a5a' },
    ],
  },

  player: {
    start: [30, 4],
    lookAt: [0, 0],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
