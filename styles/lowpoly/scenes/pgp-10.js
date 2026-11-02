// Joseph Smith-History 1:66-67: April 1829 in Harmony, Pennsylvania. Joseph dictates the translation
// while Oliver Cowdery writes, at a table in the main room of their small frame house.
import { box, block, bed, chair, table, settler, candle, pointLight, flame } from './lib/pgp-07-kit.js';

const F = 0.05;
const W = 7, D = 6, H = 2.55;
const START = [-0.75, 1.45];
const TABLE = [0.55, -1.0];

const plaster = '#d9ccb0';
const wood = '#6e4e34';
const floorBoards = ['#8a6644', '#7e5c3c', '#94704c'];

function room(ctx) {
  const r = ctx.rand;
  for (let i = 0; i < 16; i++) {
    const x = -W / 2 + (i + 0.5) * (W / 16);
    ctx.solid.box(W / 16 - 0.015, 0.3, D, { position: [x, F - 0.15, 0], color: r.pick(floorBoards), jitter: 0.04 });
  }
  ctx.colliders.add({ x: 0, z: 0, w: W, d: D, bottom: -2, top: F });
  const t = 0.2;
  const walls = [
    [0, -D / 2 - t / 2, W + 2 * t, t],
    [0, D / 2 + t / 2, W + 2 * t, t],
    [-W / 2 - t / 2, 0, t, D],
    [W / 2 + t / 2, 0, t, D],
  ];
  for (const [x, z, w, d] of walls) {
    box(ctx, { x, y: F, z, w, h: H, d, color: plaster, jitter: 0.03 });
    block(ctx, { x, z, w, d, bottom: F - 1, top: F + 6 });
    const along = w > d;
    ctx.solid.box(along ? w : 0.04, 0.16, along ? 0.04 : d, { position: [x + (along ? 0 : -Math.sign(x) * 0.1), F + 0.08, z + (along ? -Math.sign(z) * 0.1 : 0)], color: wood });
  }
  for (let i = 0; i < 14; i++) {
    const x = -W / 2 + (i + 0.5) * (W / 14);
    ctx.solid.box(W / 14 - 0.02, 0.05, D + 0.4, { position: [x, F + H + 0.03, 0], color: r.pick(['#7a5a3c', '#84644a', '#6e5034']), jitter: 0.04 });
  }
  ctx.solid.box(W + 0.6, 0.08, D + 0.6, { position: [0, F + H + 0.12, 0], color: '#3a2a1c' });
  for (const x of [-2.2, -0.4, 1.4]) ctx.solid.box(0.18, 0.2, D, { position: [x, F + H - 0.1, 0], color: '#5a3e28' });

  const pane = (x, z, rot, w = 0.9, h = 1.1, y = 1.45) => {
    const inward = rot === 0 ? [0, -Math.sign(z)] : [-Math.sign(x), 0];
    const px = x + inward[0] * 0.01, pz = z + inward[1] * 0.01;
    ctx.glow.box(rot ? 0.02 : w, h, rot ? w : 0.02, { position: [px, F + y, pz], color: '#d6e6f0', jitter: 0 });
    const ix = x + inward[0] * 0.03, iz = z + inward[1] * 0.03;
    for (const k of [-1, 0, 1]) {
      ctx.solid.box(rot ? 0.03 : 0.03, h, rot ? 0.03 : 0.03, { position: [ix + (rot ? 0 : k * w / 3 * 0.999), F + y, iz + (rot ? k * w / 3 : 0)], color: '#efe8d8' });
    }
    ctx.solid.box(rot ? 0.03 : w, 0.03, rot ? w : 0.03, { position: [ix, F + y, iz], color: '#efe8d8' });
    for (const s of [-1, 1]) {
      ctx.solid.box(rot ? 0.05 : w + 0.16, 0.08, rot ? w + 0.16 : 0.05, { position: [ix, F + y + s * (h / 2 + 0.04), iz], color: '#e8e0cc' });
      ctx.solid.box(rot ? 0.05 : 0.08, h + 0.16, rot ? 0.08 : 0.05, { position: [ix + (rot ? 0 : s * (w / 2 + 0.04)), F + y, iz + (rot ? s * (w / 2 + 0.04) : 0)], color: '#e8e0cc' });
    }
    ctx.solid.box(rot ? 0.2 : w + 0.2, 0.04, rot ? w + 0.2 : 0.2, { position: [ix + inward[0] * 0.08, F + y - h / 2 - 0.08, iz + inward[1] * 0.08], color: '#e8e0cc' });
    pointLight(ctx, { x: x + inward[0] * 1.2, y: F + y, z: z + inward[1] * 1.2, color: '#dce8f4', intensity: 3.5, distance: 6 });
  };
  pane(1.6, D / 2, 0);
  pane(W / 2, -1.0, 1);
  pane(-1.2, -D / 2, 0, 0.7, 0.9, 1.55);

  ctx.solid.box(0.9, 2.05, 0.06, { position: [-2.6, F + 1.025, D / 2 - 0.03], color: '#5e4430' });
  for (const y of [0.4, 1.6]) ctx.solid.box(0.92, 0.1, 0.03, { position: [-2.6, F + y, D / 2 - 0.07], color: '#4e3826' });
  ctx.solid.box(0.06, 0.06, 0.06, { position: [-2.25, F + 1.0, D / 2 - 0.1], color: '#2a2018' });
}

function fireplace(ctx) {
  const r = ctx.rand;
  const x = -W / 2, z = 0.2;
  const brick = ['#8a4a36', '#7a4030', '#965440'];
  for (let k = 0; k < 9; k++) {
    for (let i = 0; i < 5; i++) {
      const y = F + k * 0.15, lz = z - 0.8 + (i + 0.5) * 0.32 + (k % 2) * 0.08 - 0.04;
      if (k < 5 && Math.abs(lz - z) < 0.42) continue;
      ctx.solid.box(0.5, 0.14, 0.3, { position: [x + 0.25, y + 0.07, lz], color: r.pick(brick), jitter: 0.05 });
    }
  }
  ctx.solid.box(0.5, H - 1.35, 1.5, { position: [x + 0.25, F + 1.35 + (H - 1.35) / 2, z], color: '#8a4a36', jitter: 0.05 });
  ctx.solid.box(0.65, 0.08, 1.8, { position: [x + 0.33, F + 1.38, z], color: wood });
  ctx.solid.box(0.12, 0.75, 0.84, { position: [x + 0.06, F + 0.38, z], color: '#1a1210', jitter: 0 });
  ctx.glow.box(0.02, 0.3, 0.6, { position: [x + 0.13, F + 0.2, z], color: '#5a1a08', jitter: 0 });
  ctx.solid.box(0.7, 0.04, 1.6, { position: [x + 0.55, F + 0.02, z], color: '#7a6a5a' });
  block(ctx, { x: x + 0.3, z, w: 0.6, d: 1.6, bottom: F - 1, top: F + 4 });
  for (const dz of [-0.15, 0.1]) ctx.solid.add(new ctx.THREE.CylinderGeometry(0.06, 0.06, 0.55, 6), { position: [x + 0.3, F + 0.1, z + dz], rotation: [0.2, 0, Math.PI / 2], color: '#3a2a1c' });
  for (const [dx, dz, s] of [[0.3, 0, 2.6], [0.28, -0.12, 1.8], [0.32, 0.14, 2]]) flame(ctx, { x: x + dx, y: F + 0.15, z: z + dz, size: s, color: '#ff8a2a', core: '#ffd070' });
  pointLight(ctx, { x: x + 0.9, y: F + 0.6, z, color: '#ff9a48', intensity: 9, distance: 7, flicker: 0.3 });
  for (const [dz, c] of [[-0.6, '#3a3c40'], [0.55, '#b8b0a0'], [0.2, '#6a4a30']]) {
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.06, 0.07, 0.18, 7), { position: [x + 0.35, F + 1.51, z + dz], color: c });
  }
  ctx.solid.add(new ctx.THREE.CylinderGeometry(0.18, 0.14, 0.2, 8), { position: [x + 0.6, F + 0.12, z + 0.85], color: '#2a2a2a' });
}

function furnishings(ctx) {
  const { THREE } = ctx;
  const top = table(ctx, { x: TABLE[0], z: TABLE[1], y: F, w: 1.5, d: 0.85, color: '#7a5638' });
  chair(ctx, { x: TABLE[0] - 0.15, z: TABLE[1] - 0.72, y: F, rot: 0 });
  chair(ctx, { x: TABLE[0] + 1.12, z: TABLE[1], y: F, rot: -Math.PI / 2 });
  ctx.solid.box(0.3, 0.08, 0.26, { position: [TABLE[0] - 0.2, top + 0.04, TABLE[1] - 0.15], color: '#d8ccb0', jitter: 0.04 });
  ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 7), { position: [TABLE[0] - 0.2, top + 0.11, TABLE[1] - 0.15], scale: [1, 1, 0.8], color: '#e2d8c0' });
  for (let i = 0; i < 7; i++) {
    ctx.solid.box(0.22, 0.004, 0.29, { position: [TABLE[0] + 0.5 + (i % 2) * 0.01, top + 0.003 + i * 0.004, TABLE[1] + 0.05 + (i % 3) * 0.01], rotation: [0, 0.05 * (i % 3), 0], color: '#f2ead6', jitter: 0.02 });
  }
  ctx.solid.box(0.24, 0.004, 0.3, { position: [TABLE[0] + 0.15, top + 0.003, TABLE[1] + 0.2], rotation: [0, -0.2, 0], color: '#efe6d0', jitter: 0 });
  for (let i = 0; i < 6; i++) ctx.solid.box(0.15, 0.002, 0.008, { position: [TABLE[0] + 0.5, top + 0.032, TABLE[1] + 0.12 - i * 0.03], color: '#3a3430', jitter: 0 });
  ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 6), { position: [TABLE[0] + 0.66, top + 0.025, TABLE[1] - 0.25], color: '#1a1a1e' });
  ctx.solid.add(new THREE.ConeGeometry(0.008, 0.26, 4), { position: [TABLE[0] + 0.6, top + 0.14, TABLE[1] - 0.05], rotation: [0.5, 0, 0.7], color: '#f4f0e6', jitter: 0 });
  candle(ctx, { x: TABLE[0] + 0.15, y: top, z: TABLE[1] - 0.25, light: 2, distance: 5 });

  bed(ctx, { x: 2.75, z: 1.85, y: F, w: 1.3, len: 2.0, rot: Math.PI, quilt: '#3a5a7a', quiltAlt: '#e0d4b4' });

  const [wx, wz] = [-2.75, 2.1];
  const wheel = new THREE.TorusGeometry(0.42, 0.025, 4, 16);
  ctx.solid.add(wheel, { position: [wx, F + 0.7, wz], rotation: [0, 0.6, 0], color: '#7a5638' });
  for (let i = 0; i < 6; i++) ctx.solid.box(0.015, 0.8, 0.015, { position: [wx, F + 0.7, wz], rotation: [0, 0.6, (i * Math.PI) / 6], color: '#7a5638' });
  ctx.solid.box(0.9, 0.06, 0.25, { position: [wx + 0.1, F + 0.35, wz + 0.1], rotation: [0, 0.6, 0.15], color: '#6a4a30' });
  for (const [dx, dz] of [[-0.25, 0.2], [0.35, 0.05], [0.1, 0.35]]) ctx.solid.box(0.04, 0.35, 0.04, { position: [wx + dx, F + 0.17, wz + dz], color: '#6a4a30' });
  block(ctx, { x: wx, z: wz, w: 1, d: 0.8, bottom: F, top: F + 1.2 });

  ctx.solid.box(1.4, 0.04, 0.26, { position: [0.2, F + 1.7, -D / 2 + 0.14], color: wood });
  ctx.solid.box(1.4, 0.04, 0.26, { position: [0.2, F + 1.3, -D / 2 + 0.14], color: wood });
  for (let i = 0; i < 5; i++) {
    ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10), { position: [-0.3 + i * 0.22, F + 1.84, -D / 2 + 0.06], rotation: [Math.PI / 2 - 0.15, 0, 0], color: i % 2 ? '#d8d0bc' : '#5a6a7a' });
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.045, 0.12, 7), { position: [-0.3 + i * 0.22, F + 1.38, -D / 2 + 0.14], color: i % 2 ? '#8a5a3a' : '#c8c0aa' });
  }

  ctx.solid.box(1.8, 0.015, 1.2, { position: [-1.0, F + 0.008, 0.6], color: '#7a3a2e', jitter: 0.06 });
  for (let i = 0; i < 6; i++) ctx.solid.box(1.8, 0.016, 0.07, { position: [-1.0, F + 0.009, 0.15 + i * 0.18], color: i % 2 ? '#c8b48a' : '#4a5a6a' });
  chair(ctx, { x: -2.3, z: -1.4, y: F, rot: 0.9 });
  ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.14, 0.32, 8), { position: [3.1, F + 0.16, -2.5], color: '#6a5038' });
  for (const z of [-0.2, 0.3]) ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.18, 0.75, 6), { position: [3.38, F + 1.25, z + 0.3], color: z < 0 ? '#2f3138' : '#5a4a5e' });
}

export default {
  title: 'Joseph Smith-History 1:66-67: Translating in Harmony',
  seed: 1829,
  fov: 66,
  exposure: 1.0,

  sun: { direction: [0.4, 0.6, 0.6], color: '#fff0d8', intensity: 0.6 },
  light: { sky: '#e8e4d8', ground: '#6a5040', hemi: 0.55 },
  sky: { top: '#7da4d2', horizon: '#dfe8ec', ground: '#7a8a5a', sunColor: '#fff0c8', glow: 0.5 },
  fog: { color: '#c8d0c8', near: 60, far: 300 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.05, contrast: 1.06, vignette: 0.5, shadowTint: '#2a2430', highlightTint: '#fff0d8' },
  shadow: { center: [0, 0], radius: 10 },

  player: { start: START, yaw: Math.atan2(START[0] - (TABLE[0] + 0.25), START[1] - TABLE[1]), pitch: -0.14, eye: 1.6, speed: 2.2 },

  terrain: {
    size: 300,
    segments: 40,
    seed: 3,
    hills: 2,
    bumps: 0,
    flats: [{ x: 0, z: 0, r: 40, falloff: 20, height: 0 }],
    colors: { ground: '#4a5a32', groundAlt: '#4a5a32', grass: '#4a5a32', rock: '#4a5a32' },
  },

  custom(ctx) {
    room(ctx);
    fireplace(ctx);
    furnishings(ctx);
    settler(ctx, {
      x: TABLE[0] - 0.15, z: TABLE[1] - 0.68, y: F, yaw: 0, pose: 'sit', arms: 'rest',
      coat: '#2e2c2a', pants: '#3a3530', hair: '#7a5634', skin: '#e0b090', collide: false,
    });
    settler(ctx, {
      x: TABLE[0] + 1.1, z: TABLE[1], y: F, yaw: -Math.PI / 2, pose: 'sit', arms: 'write',
      coat: '#3a2e26', vest: '#6a5a3a', pants: '#4a4036', hair: '#2a1e16', skin: '#dcaa88', collide: false,
    });
    pointLight(ctx, { x: TABLE[0] - 0.4, y: F + 1.7, z: TABLE[1] + 1.1, color: '#ffe2b8', intensity: 2.4, distance: 4 });
  },
};
