// Genesis 6:14-7:16: the ark of gopher wood stands nearly finished, its bow still open ribs in scaffolding.
// Animals come two by two up the ramp to the door while Noah and his household work. -z is north.
import { ark } from './lib/ot-01-ark.js';
import { pairsAlong } from './lib/ot-01-animals.js';
import { birds, fire } from './lib/ot-01-kit.js';

const ARK = [0, -46];
const W = 15;
const DOOR = -12;

function curve(points, step) {
  const out = [];
  let carry = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    for (let d = carry; d < len; d += step) out.push([ax + ((bx - ax) * d) / len, az + ((bz - az) * d) / len]);
    carry = (step - ((len - carry) % step)) % step;
  }
  return out;
}

const rampFoot = [ARK[0] + DOOR, ARK[1] + W / 2 + 16];
const line = curve([[rampFoot[0], rampFoot[1] - 2], [rampFoot[0], rampFoot[1] + 8], [-6, -4], [4, 8], [16, 14], [30, 14], [50, 22], [80, 30]], 3.3);
const kinds = ['elephant', 'giraffe', 'camel', 'horse', 'ox', 'lion', 'bear', 'deer', 'wolf', 'sheep', 'goat', 'pig', 'rabbit', 'dove', 'sheep', 'ox', 'deer', 'camel', 'horse', 'goat', 'lion'];

export default {
  title: 'Genesis 6:14-7:16: Noah builds the ark',
  seed: 404,
  fov: 62,
  exposure: 1.15,

  sun: { direction: [0.7, 0.42, 0.35], color: '#ffe0b0', intensity: 2.8 },
  light: { sky: '#9aa6c4', ground: '#5a5640', hemi: 1.35 },
  sky: { top: '#4a5470', horizon: '#d9c8a8', ground: '#8a8a70', sunColor: '#ffe6b8', glow: 0.8 },
  fog: { color: '#a8a698', near: 90, far: 560 },
  clouds: { count: 110, seed: 14, shadow: '#3a3c4a', lit: '#cfc2a8', rim: '#f2e6c8', distance: [220, 850], altitude: [70, 200], hole: 0.2 },
  mountains: { count: 42, seed: 3, color: '#55584e', radius: [480, 720], height: [40, 130], haze: 0.5 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.4, shadowTint: '#2a3040', highlightTint: '#ffe8c4' },
  shadow: { center: [0, -30], radius: 85 },

  player: { start: [29, 27], yaw: 0.58, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 41,
    hills: 24,
    bumps: 0.35,
    flats: [{ x: 0, z: -20, r: 90, falloff: 50, height: 0 }],
    colors: { ground: '#7a8448', groundAlt: '#6c7a40', grass: '#78904a', high: '#7a7a5a', rock: '#6e6656' },
    patches: [
      { x: ARK[0], z: ARK[1], r: 60, color: '#8f7a56', strength: 0.75, rough: 0.5 },
      { x: 34, z: -46, r: 18, color: '#b49468', strength: 0.7, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: [0, -20], ring: [100, 320], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#4f7034' } },
    { type: 'tree', count: 30, center: [0, -20], ring: [70, 110], spacing: 10, seed: 5, props: { kind: 'burnt' } },
    { type: 'rock', count: 30, center: [0, -20], ring: [90, 300], spacing: 12, seed: 6, props: {} },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.5,
      hoodChance: 0.2,
    },
    groups: [
      { count: 9, points: [[30, -36], [34, -34], [38, -37], [44, -38], [42, -30], [28, -54], [36, -57], [48, -50], [26, -31]], face: [36, -46], children: 0, seed: 3 },
      { count: 5, points: [[17, 20], [14.5, 19], [25.5, 21], [27.5, 20.5], [12, 17.5]], face: [20, 12], children: 0.2, seed: 7 },
      { count: 12, center: [-60, 10], ring: [8, 22], arc: [0, Math.PI * 2], spacing: 1.5, face: ARK, children: 0.2, seed: 4 },
    ],
  },

  figures: [
    { x: 21, z: 18.5, face: [17, 13], robe: '#d6ccb4', mantle: '#8a6a48', skin: '#a8744e', arms: 'out', scale: 1.05 },
  ],

  custom(ctx) {
    const { THREE, solid } = ctx;
    const r = ctx.rand;
    const y = ctx.heightAt(...ARK) - 0.3;
    ark(ctx, { x: ARK[0], z: ARK[1], y, L: 84, W, H: 12, built: 0.74, scaffold: true, doorAt: DOOR, rampLen: 16 });

    // Timber yard by the open bow: stacked planks, logs, trestles and pitch fires.
    for (const [px, pz, rot] of [[34, -46, 0.1], [40, -42, 1.4], [30, -58, 0.5]]) {
      for (let k = 0; k < 5; k++) solid.box(7, 0.3, 0.6, { position: [px, ctx.heightAt(px, pz) + 0.15 + k * 0.32, pz + (k % 2) * 0.1 - 1 + (k % 3) * 0.6], rotation: [0, rot, 0], color: k % 2 ? '#a07c52' : '#8e6c46' });
      ctx.colliders.add({ x: px, z: pz, w: 7, d: 2, rot, bottom: -1, top: 2 });
    }
    for (let i = 0; i < 9; i++) {
      const lx = 46 + (i % 3) * 0.8, lz = -30 + Math.floor(i / 3) * 0.8;
      solid.add(new THREE.CylinderGeometry(0.4, 0.4, 8, 6), { position: [lx, ctx.heightAt(lx, lz) + 0.4 + Math.floor(i / 3) * 0.7, lz + 4], rotation: [0, 0.3, Math.PI / 2], color: '#6a4a30' });
    }
    for (const [tx, tz] of [[30, -40], [38, -52]]) {
      const ty = ctx.heightAt(tx, tz);
      for (const s of [-1, 1]) solid.box(0.15, 1, 1.2, { position: [tx + s * 1.5, ty + 0.5, tz], rotation: [0, 0, s * 0.2], color: '#5a4030' });
      solid.box(4, 0.3, 0.5, { position: [tx, ty + 1.05, tz], color: '#a07c52' });
    }
    fire(ctx, { position: [24, ctx.heightAt(24, -28), -28], size: 0.8, light: 12, smokeHeight: 18, seed: 2 });
    const pot = ctx.heightAt(24, -28);
    solid.add(new THREE.CylinderGeometry(0.7, 0.55, 0.8, 7), { position: [24, pot + 1.2, -28], color: '#2a2420' });

    pairsAlong(ctx, line, kinds, { gap: 0.9 });
    birds(ctx, { center: [ARK[0] + DOOR, ARK[1]], radius: 20, height: 22, count: 14, color: '#2a2624', speed: 6, seed: 4 });
    birds(ctx, { center: [ARK[0], ARK[1]], radius: 12, height: 18, count: 8, color: '#f2efe8', speed: 4, seed: 6 });

    // Grass tufts around the field.
    for (let i = 0; i < 500; i++) {
      const x = r.range(-80, 90), z = r.range(-20, 80);
      solid.add(new THREE.ConeGeometry(0.1, 0.3, 3), { position: [x, ctx.heightAt(x, z) + 0.1, z], rotation: [0, r() * 3, 0], color: '#6a7a40', jitter: 0.14 });
    }
  },
};
