// Luke 2:41-50: the boy Jesus sits among the teachers in the temple courts, and Mary and Joseph find him.
// The sanctuary stands to the north (-z) on its raised inner court. Porticoes line the east and west sides of the outer court.
import * as THREE from 'three';
import { block, sprite } from './lib/nt-01-kit.js';

const WHITE = '#e9e1cf';
const GOLD = '#d9b04c';
const BOY = [0, -2];
const TOP = 3;

function portico(ctx, side) {
  const x0 = side * 40, x1 = side * 46;
  for (let z = -86; z <= 26; z += 4) {
    for (const x of [x0, x1]) {
      ctx.builders.column(ctx, { x, z, h: 8, radius: 0.48, broken: false, color: WHITE });
      ctx.solid.box(1.4, 0.35, 1.4, { position: [x, 8.1, z], color: '#d8cfba' });
    }
  }
  ctx.solid.box(10, 0.7, 116, { position: [side * 43.5, 8.6, -30], color: '#cfc5ae' });
  ctx.solid.box(10.6, 0.5, 116.6, { position: [side * 43.5, 9.2, -30], color: '#8a6a4a' });
  block(ctx, { x: side * 49, y: 0, z: -30, w: 1.2, h: 9.4, d: 118, color: '#d8cfba' });
  ctx.solid.box(0.1, 0.4, 116, { position: [side * 38.7, 7.6, -30], color: GOLD });
}

function northWall(ctx) {
  block(ctx, { x: 0, y: 0, z: -96, w: 100, h: 9.4, d: 1.4, color: '#d8cfba' });
  block(ctx, { x: 0, y: 0, z: 32, w: 100, h: 9.4, d: 1.4, color: '#d8cfba' });
}

function innerCourt(ctx) {
  // Raised terrace with broad steps up to the inner court.
  block(ctx, { x: 0, y: -0.2, z: -66, w: 56, h: TOP + 0.2, d: 48, color: '#ddd4c0' });
  for (let i = 0; i < 10; i++) block(ctx, { x: 0, y: -0.2, z: -41.6 + (10 - i) * 0.55, w: 22, h: (i + 1) * 0.3 + 0.2, d: 0.56, color: '#e4dccb', jitter: 0.02 });
  // Low balustrade (the soreg) along the terrace edge, with the gap at the steps.
  for (const s of [-1, 1]) {
    for (let k = 0; k < 8; k++) block(ctx, { x: s * (12.5 + k * 2), y: TOP, z: -42.4, w: 1.9, h: 1.1, d: 0.3, color: WHITE, jitter: 0.02 });
    block(ctx, { x: s * 27.6, y: TOP, z: -66, w: 0.4, h: 4.5, d: 47, color: WHITE });
  }
  block(ctx, { x: 0, y: TOP, z: -89.6, w: 56, h: 4.5, d: 0.4, color: WHITE });
  // Altar of burnt offering with a thin column of smoke.
  block(ctx, { x: 0, y: TOP, z: -52, w: 8, h: 3, d: 8, color: '#b8ad98' });
  block(ctx, { x: 0, y: TOP, z: -46.5, w: 2.5, h: 1.5, d: 3, color: '#c4b9a4' });
  for (const [x, z] of [[-3.6, -55.6], [3.6, -55.6], [-3.6, -48.4], [3.6, -48.4]]) ctx.solid.box(0.6, 0.6, 0.6, { position: [x, TOP + 3.3, z], color: '#a89c86' });
  ctx.glow.box(2.4, 0.2, 2.4, { position: [0, TOP + 3.1, -52], color: '#ff8a3a' });
}

function sanctuary(ctx) {
  const zf = -62;
  // Body and the tall porch facade.
  block(ctx, { x: 0, y: TOP, z: zf - 14, w: 22, h: 26, d: 26, color: WHITE });
  block(ctx, { x: 0, y: TOP, z: zf, w: 34, h: 30, d: 6, color: WHITE });
  for (const s of [-1, 1]) block(ctx, { x: s * 13.5, y: TOP, z: zf - 3, w: 7, h: 22, d: 12, color: '#e2dac6' });
  // Doorway with its golden frame and vine.
  const front = zf + 3.02;
  ctx.solid.box(8, 15, 0.1, { position: [0, TOP + 7.5, front], color: '#3a2c20', jitter: 0 });
  ctx.solid.box(4.6, 11, 0.12, { position: [0, TOP + 5.5, front + 0.02], color: '#7a5420', jitter: 0.04 });
  ctx.glow.box(0.6, 15.6, 0.3, { position: [-4.3, TOP + 7.8, front + 0.1], color: GOLD, jitter: 0.03 });
  ctx.glow.box(0.6, 15.6, 0.3, { position: [4.3, TOP + 7.8, front + 0.1], color: GOLD, jitter: 0.03 });
  ctx.glow.box(9.2, 0.7, 0.3, { position: [0, TOP + 15.6, front + 0.1], color: GOLD, jitter: 0.03 });
  for (let i = 0; i < 14; i++) {
    ctx.glow.add(new THREE.IcosahedronGeometry(0.35, 0), { position: [-4 + i * 0.62, TOP + 16.4 + Math.sin(i * 1.3) * 0.3, front + 0.2], color: i % 3 ? '#e7c060' : '#c89a38' });
  }
  // Gold bands and rooftop spikes.
  for (const y of [TOP + 22, TOP + 29.4]) ctx.glow.box(34.4, 0.5, 6.4, { position: [0, y, zf], color: '#c9a246', jitter: 0.03 });
  ctx.glow.box(22.4, 0.5, 26.4, { position: [0, TOP + 25.6, zf - 14], color: '#c9a246', jitter: 0.03 });
  for (let i = 0; i < 18; i++) ctx.glow.add(new THREE.ConeGeometry(0.12, 1.2, 4), { position: [-16.5 + i * 1.94, TOP + 30.6, zf + 2.6], color: GOLD });
  // Pilasters on the facade.
  for (const x of [-15, -10, 10, 15]) ctx.solid.box(1.2, 30, 0.4, { position: [x, TOP + 15, zf + 3.1], color: '#f2ecde' });
}

function court(ctx) {
  ctx.builders.pavement(ctx, { x: 0, z: -6, w: 76, d: 70, tile: 3, color: '#c4b393', damage: 0, gap: 0.1 });
  // A stone bench where the boy sits, and the teachers' scrolls.
  block(ctx, { x: BOY[0], y: 0, z: BOY[1] - 0.75, w: 1.8, h: 0.45, d: 0.6, color: '#a89878' });
  for (const [x, z, rot] of [[-1.6, BOY[1] - 1.6, 0.4], [1.3, BOY[1] - 1.9, -0.6], [2.3, BOY[1] - 0.6, 1.2]]) {
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), { position: [x, 0.12, z], rotation: [Math.PI / 2, rot, 0], color: '#e8dcbc' });
  }
  // Benches under the porticoes and baskets for offerings.
  for (const s of [-1, 1]) for (let z = -70; z < 20; z += 9) block(ctx, { x: s * 39, y: 0, z, w: 0.9, h: 0.45, d: 3, color: '#cbbfa6' });
  for (const [x, z] of [[-30, 10], [-31, 6], [28, -20]]) ctx.solid.add(new THREE.CylinderGeometry(0.4, 0.3, 0.5, 8), { position: [x, 0.25, z], color: '#b49460' });
}

// Teachers sit in a horseshoe around the boy, open toward the player.
const teacherRing = Array.from({ length: 10 }, (_, i) => {
  const a = Math.PI * 0.82 + (i / 9) * Math.PI * 1.36;
  return [BOY[0] + Math.cos(a) * 3.2, BOY[1] + Math.sin(a) * 2.8];
});
const listeners = Array.from({ length: 12 }, (_, i) => {
  const a = Math.PI * 0.8 + (i / 11) * Math.PI * 1.4;
  return [BOY[0] + Math.cos(a) * 5.2, BOY[1] + Math.sin(a) * 4.6];
});

export default {
  title: 'Luke 2:41-50: The boy Jesus at the temple',
  seed: 105,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.45, 0.7, 0.55], color: '#fff0d6', intensity: 2.8 },
  light: { sky: '#a8c4ee', ground: '#9a8466', hemi: 1.0 },
  sky: { top: '#3f78c8', horizon: '#dce6ec', ground: '#c9b892', sunColor: '#fff4dc', glow: 0.8 },
  fog: { color: '#d6dde0', near: 90, far: 600 },
  clouds: { count: 26, shadow: '#b8bcc8', lit: '#ffffff', rim: '#ffffff', distance: [320, 900], altitude: [130, 240], hole: 0.2 },
  mountains: { count: 40, color: '#8a8670', radius: [420, 650], height: [20, 70], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.38, shadowTint: '#3a3460', highlightTint: '#fff2dc' },
  shadow: { center: [0, -30], radius: 80 },

  player: { start: [1.2, 5.6], yaw: 0.1, pitch: 0.08, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 800,
    segments: 120,
    seed: 15,
    hills: 30,
    hillScale: 0.007,
    bumps: 0.2,
    flats: [{ x: 0, z: -30, r: 85, falloff: 40, height: 0 }],
    colors: { ground: '#b4a27e', groundAlt: '#a8966e', grass: '#8a8a5a', high: '#a49474', rock: '#9a8a70' },
    patches: [],
  },

  objects: [],
  scatter: [],

  crowd: {
    palette: {
      robes: ['#efe8d8', '#e6dcc6', '#3f4d6e', '#f4efe2', '#5a4a3a', '#2f3e5e'],
      mantles: ['#f6f2e8', '#2f4a7a', '#f2ecdc', '#3f5a8a', '#e8e0cc'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.9,
      hoodChance: 0.85,
    },
    groups: [
      { count: teacherRing.length, points: teacherRing, face: BOY, children: 0, kneel: 1, seed: 61 },
      { count: listeners.length, points: listeners, face: BOY, children: 0.1, seed: 62 },
      {
        count: 240, center: [0, -10], ring: [9, 46], spacing: 1.3, face: [0, -62], children: 0.18, seed: 63,
        palette: {
          robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
          mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
          skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
          mantleChance: 0.6,
          hoodChance: 0.4,
        },
        avoid: [{ rect: [0, -42, 60, 10] }, { r: 9, x: BOY[0], z: BOY[1] }, { rect: [1.5, 12, 12, 22] }, { rect: [7, 2, 8, 10] }, { rect: [-40, -30, 14, 130] }, { rect: [40, -30, 14, 130] }, { rect: [0, -66, 58, 50] }],
      },
    ],
  },

  figures: [
    { x: BOY[0], z: BOY[1] - 0.15, y: 0.1, face: [1.2, 5.6], scale: 0.72, robe: '#f2ead8', mantle: '#d8c9a8', skin: '#b07a55', arms: 'out', emissive: 0.12, halo: { size: 2.4, opacity: 0.22, color: '#fff3d6' } },
    { x: 5.6, z: 3.2, face: BOY, scale: 0.98, robe: '#c9b48c', mantle: '#4c6c9c', skin: '#a8754f', arms: 'out', hood: true },
    { x: 6.6, z: 3.9, face: BOY, scale: 1.04, robe: '#7a5a3e', mantle: '#a0825c', skin: '#9b6a46', arms: 'down', hood: true },
  ],

  custom(ctx) {
    portico(ctx, -1);
    portico(ctx, 1);
    northWall(ctx);
    innerCourt(ctx);
    sanctuary(ctx);
    court(ctx);
    sprite(ctx, { position: [BOY[0], 1.1, BOY[1]], size: 1.6, color: '#fff6e0', opacity: 0.18 });
    ctx.effects.ring({ position: [BOY[0], 0.12, BOY[1]], radius: 1.1, width: 0.6, color: '#ffe8b8', opacity: 0.35 });
  },
};
