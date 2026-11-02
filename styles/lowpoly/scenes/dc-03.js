// D&C 17: In a grove near the Whitmer farm in Fayette, June 1829, an angel shows the gold plates to Oliver Cowdery,
// David Whitmer, and Joseph Smith. Martin Harris prays alone farther off. The grove is north of the player (-z),
// the Whitmer farm lies to the south.
import * as THREE from 'three';
import { forest, leafy, bush, rail, frameHouse, logCabin, softGlow, person } from './lib/dc-01-kit.js';

const ANGEL = [0, -9];
const TABLE = [1.6, -8];
const WITNESSES = [[-1.4, -5], [0, -4.6], [1.4, -5]];
const MARTIN = [34, -18];

function relics(ctx) {
  const [tx, tz] = TABLE;
  ctx.solid.box(1.2, 0.08, 0.7, { position: [tx, 0.78, tz], color: '#6a4a32' });
  for (const [dx, dz] of [[-0.5, -0.28], [0.5, -0.28], [-0.5, 0.28], [0.5, 0.28]]) ctx.solid.box(0.07, 0.76, 0.07, { position: [tx + dx, 0.38, tz + dz], color: '#5a3e2a' });
  ctx.colliders.add({ x: tx, z: tz, w: 1.2, d: 0.7, bottom: 0, top: 0.82 });
  ctx.glow.box(0.5, 0.06, 0.32, { position: [tx + 0.25, 0.85, tz], rotation: [0, 0.4, 0], color: '#d9a640' });
  ctx.glow.add(new THREE.SphereGeometry(0.11, 8, 6), { position: [tx - 0.3, 0.92, tz - 0.1], color: '#c89a48' });
  ctx.solid.box(0.06, 0.04, 0.9, { position: [tx - 0.15, 0.85, tz + 0.15], rotation: [0, 1.2, 0], color: '#b8bcc4' });
  ctx.solid.box(0.04, 0.05, 0.22, { position: [tx - 0.15 + Math.sin(1.2) * 0.34, 0.86, tz + 0.15 + Math.cos(1.2) * 0.34], rotation: [0, 1.2 + Math.PI / 2, 0], color: '#a88a3a' });
}

function platesInHands(ctx, y) {
  const [ax, az] = ANGEL;
  const plates = new THREE.Group();
  const gold = new THREE.MeshBasicMaterial({ color: '#f0c45a', toneMapped: false });
  const stack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.34), gold);
  const rings = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.36), new THREE.MeshBasicMaterial({ color: '#b88a30', toneMapped: false }));
  rings.position.x = -0.2;
  plates.add(stack, rings);
  plates.position.set(ax, y + 1.25, az + 0.42);
  plates.rotation.x = -0.9;
  ctx.scene.add(plates);
  ctx.onFrame((t) => (plates.position.y = y + 1.25 + Math.sin(t * 1.1) * 0.03));
}

function farm(ctx) {
  frameHouse(ctx, { x: -26, z: 62, rot: 0.2, w: 10, d: 7, h: 5.4, color: '#e2dacb' });
  logCabin(ctx, { x: 6, z: 70, rot: -0.1, w: 10, d: 7, h: 3.4, log: '#6a5340', roof: '#544638' });
  rail(ctx, [[-48, 46], [-10, 44], [24, 48], [52, 44]], { color: '#7a6450' });
  rail(ctx, [[-48, 46], [-52, 100]], { color: '#7a6450' });
  const r = ctx.rand;
  for (let i = 0; i < 180; i++) {
    const x = r.range(-46, 50), z = r.range(80, 140);
    ctx.solid.add(new THREE.ConeGeometry(0.12, 0.9, 4), { position: [x, ctx.heightAt(x, z) + 0.4, z], color: r.pick(['#a8a04e', '#b8ac58', '#94904a']), jitter: 0.06 });
  }
}

export default {
  title: 'D&C 17: The Three Witnesses',
  seed: 17,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [-0.4, 0.75, 0.35], color: '#fff0d0', intensity: 2.6 },
  light: { sky: '#b8d0f0', ground: '#4f5a34', hemi: 1.0 },
  sky: { top: '#4f86d0', horizon: '#dfe8e6', ground: '#9aa070', sunColor: '#fff6dc', glow: 0.8 },
  fog: { color: '#c8d4c8', near: 50, far: 420 },
  clouds: { count: 34, shadow: '#a8b0c4', lit: '#ffffff', rim: '#ffffff', distance: [260, 900], altitude: [120, 240], hole: 0.25 },
  mountains: { count: 30, color: '#6a8068', radius: [420, 650], height: [20, 50], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.05, vignette: 0.42, shadowTint: '#2e3a50', highlightTint: '#fff4d8' },
  shadow: { center: [0, -4], radius: 45 },

  player: { start: [-3.3, -0.7], yaw: -0.4, pitch: -0.02, eye: 1.65, speed: 3.8 },

  terrain: {
    size: 900,
    segments: 180,
    seed: 77,
    hills: 22,
    hillScale: 0.007,
    bumps: 0.25,
    flats: [{ x: 0, z: 10, r: 60, falloff: 40, height: 0 }],
    colors: { ground: '#5c6c36', groundAlt: '#66763c', grass: '#78884a', high: '#6c7a48', rock: '#6f6a56' },
    patches: [
      { x: 0, z: -6, r: 10, color: '#7c8a4a', strength: 0.6, rough: 0.4 },
      { x: 0, z: 110, r: 70, color: '#8c8a4c', strength: 0.6, rough: 0.2 },
    ],
  },

  objects: [],
  scatter: [],

  figures: [
    {
      x: ANGEL[0], z: ANGEL[1], y: 0.9, face: [0, 6], scale: 1.12, robe: '#fffcf3', mantle: '#f4eedf', skin: '#f6e6cc', arms: 'out', emissive: 0.15,
      light: { color: '#fff0cf', intensity: 4, distance: 16 },
      halo: { size: 3, opacity: 0.22, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'beam', position: [ANGEL[0], 0, ANGEL[1]], height: 160, radiusBottom: 3.4, radiusTop: 12, color: "#fff1cf", opacity: 0.25 },
    { type: 'ring', position: [ANGEL[0], 0.06, ANGEL[1] + 1.5], radius: 3.6, width: 1.2, color: '#ffe8b0', opacity: 0.55 },
    { type: 'motes', position: [ANGEL[0], 0, ANGEL[1]], radius: 4, height: 18, count: 140, size: 0.04 },
    { type: 'sunShafts', center: [0, -20], count: 5, spread: 30, length: 160, width: [3, 8], opacity: 0.06 },
  ],

  custom(ctx) {
    relics(ctx);
    WITNESSES.forEach(([x, z], i) => person(ctx, { x, z, face: ANGEL, kneel: true, coat: ['#353d52', '#4a3a2c', '#2e3a30'][i], vest: ['#c8b89a', '#8a3a30', '#7a5a3a'][i], hair: ['#1d1814', '#4e3420', '#6a4626'][i], skin: ['#e0b48f', '#d9ad88', '#e6bf9b'][i] }));
    person(ctx, { x: MARTIN[0], z: MARTIN[1], face: [MARTIN[0], MARTIN[1] - 10], kneel: true, coat: '#5a4a38', hair: '#7a7068', skin: '#d4a17c' });
    platesInHands(ctx, 0.9);
    farm(ctx);
    forest(ctx, { center: [0, -14], ring: [9, 200], count: 420, seed: 21, kinds: ['leafy', 'leafy', 'leafy', 'pine', 'bush'], leaf: ['#4f7a34', '#5f8a3c', '#3f6a2e'], spacing: 4, avoid: [{ rect: [0, 70, 140, 80] }, { rect: [-1, 12, 6, 14] }, { r: 4, x: MARTIN[0], z: MARTIN[1] }] });
    for (const [x, z] of [[-8, -12], [8, -14], [-11, -3], [10, -2], [-5, -18], [5, -19]]) leafy(ctx, x, z, 11 + ctx.rand() * 3, '#4a7432');
    softGlow(ctx, { position: [ANGEL[0], 2.2, ANGEL[1]], size: 6, color: "#fff2d0", opacity: 0.12 });
  },
};
