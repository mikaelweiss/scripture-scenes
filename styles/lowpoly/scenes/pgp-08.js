// Joseph Smith-History 1:29-49: the angel Moroni appears at Joseph's bedside, night of September 21, 1823.
// The upstairs loft of the Smith log home in Palmyra: sloped plank ceiling, log gable walls, beds under the eaves.
import { box, block, bed, chair, settler, messenger } from './lib/pgp-07-kit.js';

const F = 0.05;
const W = 8, L = 10, KNEE = 1.0, RIDGE = 3.4;
const JOSEPH = [-2.35, -1.3];
const MORONI = [-0.55, -1.3];
const START = [1.3, 3.9];

const logColor = ['#7a5a3e', '#6e5036', '#84654a'];
const board = ['#8a6a48', '#7d5f40', '#94744f'];

function room(ctx) {
  const { THREE } = ctx;
  const r = ctx.rand;
  for (let i = 0; i < 14; i++) {
    const x = -W / 2 + (i + 0.5) * (W / 14);
    box(ctx, { x, y: F - 0.3, z: 0, w: W / 14 - 0.02, h: 0.3, d: L, color: r.pick(board), jitter: 0.04, collide: false });
  }
  ctx.colliders.add({ x: 0, z: 0, w: W, d: L, bottom: -2, top: F });

  const slope = Math.atan2(RIDGE - KNEE, W / 2);
  const slopeLen = Math.hypot(RIDGE - KNEE, W / 2);
  const rows = 9;
  for (const side of [-1, 1]) {
    for (let k = 0; k < rows; k++) {
      const t = (k + 0.5) / rows;
      const x = side * (W / 2 - t * (W / 2)), y = KNEE + t * (RIDGE - KNEE);
      ctx.solid.box(slopeLen / rows + 0.02, 0.06, L + 0.2, { position: [x, F + y + 0.05, 0], rotation: [0, 0, -side * slope], color: r.pick(board), jitter: 0.05 });
    }
    for (let i = 0; i <= 6; i++) {
      const z = -L / 2 + 0.3 + i * ((L - 0.6) / 6);
      ctx.solid.box(slopeLen, 0.16, 0.12, { position: [side * W / 4, F + (KNEE + RIDGE) / 2 - 0.06, z], rotation: [0, 0, -side * slope], color: '#5e4430' });
    }
    for (let i = 0; i < 12; i++) {
      const z = -L / 2 + (i + 0.5) * (L / 12);
      box(ctx, { x: side * (W / 2 - 0.05), y: F, z, w: 0.08, h: KNEE + 0.05, d: L / 12 - 0.015, color: r.pick(board), collide: false });
    }
    block(ctx, { x: side * (W / 2 - 0.5), z: 0, w: 1.4, d: L, bottom: F - 1, top: F + 6 });
  }
  ctx.solid.box(0.2, 0.2, L + 0.2, { position: [0, F + RIDGE - 0.05, 0], color: '#5e4430' });
  for (const z of [-1.5, 2.2]) ctx.solid.box(W * 0.45, 0.14, 0.12, { position: [0, F + RIDGE - 0.9, z], color: '#5e4430' });

  const course = 0.26;
  for (const end of [-1, 1]) {
    const z = end * (L / 2 + 0.05);
    for (let y = 0; y < RIDGE; y += course) {
      const mid = y + course / 2;
      const w = mid <= KNEE ? W : (W * (RIDGE - mid)) / (RIDGE - KNEE);
      if (w < 0.3) continue;
      const spans = end < 0 && mid > 1.0 && mid < 1.9 ? [[-w / 2, -0.55], [0.55, w / 2]] : [[-w / 2, w / 2]];
      for (const [a, b] of spans) {
        if (b - a < 0.1) continue;
        ctx.solid.add(new THREE.CylinderGeometry(course * 0.55, course * 0.55, b - a, 6), { position: [(a + b) / 2, F + mid, z], rotation: [0, 0, Math.PI / 2], color: r.pick(logColor), jitter: 0.06 });
      }
    }
    block(ctx, { x: 0, z: end * (L / 2 + 0.2), w: W + 1, d: 0.6, bottom: F - 1, top: F + 6 });
  }

  const wz = -L / 2 - 0.02;
  ctx.glow.box(1.1, 0.9, 0.04, { position: [0, F + 1.45, wz], color: '#16213e', jitter: 0 });
  ctx.glow.add(new THREE.CircleGeometry(0.07, 10), { position: [0.28, F + 1.68, wz + 0.03], color: '#e8ecff', jitter: 0 });
  for (const [sx, sy] of [[-0.3, 1.75], [-0.1, 1.6], [0.12, 1.82], [-0.38, 1.3], [0.35, 1.25], [0.05, 1.15]]) {
    ctx.glow.box(0.015, 0.015, 0.01, { position: [sx, F + sy, wz + 0.03], color: '#c8d4ff', jitter: 0 });
  }
  for (const [x, y, w, h] of [[0, 1.45, 0.05, 0.92], [0, 1.45, 1.12, 0.05], [0, 1.0, 1.2, 0.08], [0, 1.9, 1.2, 0.08], [-0.58, 1.45, 0.08, 0.98], [0.58, 1.45, 0.08, 0.98]]) {
    ctx.solid.box(w, h, 0.08, { position: [x, F + y, wz + 0.05], color: '#5a4030' });
  }
  ctx.solid.box(1.3, 0.06, 0.25, { position: [0, F + 0.97, wz + 0.12], color: '#6a4c34' });

  const hole = [2.6, 3.8];
  ctx.solid.box(1.0, 0.02, 2.2, { position: [hole[0], F + 0.005, hole[1]], color: '#0e0a08', jitter: 0 });
  for (let i = 0; i < 4; i++) ctx.solid.box(0.9, 0.06, 0.3, { position: [hole[0], F - 0.25 - i * 0.22, hole[1] + 0.9 - i * 0.28], color: '#4a3424' });
  for (const [x, z, w, d] of [[hole[0] - 0.55, hole[1], 0.06, 2.2], [hole[0], hole[1] - 1.12, 1.1, 0.06]]) {
    ctx.solid.box(w, 0.06, d, { position: [x, F + 0.95, z], color: '#5e4430' });
    block(ctx, { x, z, w: w + 0.1, d: d + 0.1, bottom: F, top: F + 1 });
  }
  for (const [x, z] of [[hole[0] - 0.55, hole[1] - 1.1], [hole[0] - 0.55, hole[1] + 1.1], [hole[0] + 0.5, hole[1] - 1.1]]) {
    ctx.solid.box(0.08, 0.95, 0.08, { position: [x, F + 0.475, z], color: '#5e4430' });
  }
  block(ctx, { x: hole[0], z: hole[1], w: 1.0, d: 2.2, bottom: F - 1, top: F + 1 });
}

function furnishings(ctx) {
  const { THREE } = ctx;
  bed(ctx, { x: -2.9, z: -1.2, y: F, w: 1.3, len: 2.0, quilt: '#7a3a34', quiltAlt: '#d6c49a' });
  bed(ctx, { x: 2.9, z: -1.8, y: F, w: 1.4, len: 2.0, quilt: '#3e5a6e', quiltAlt: '#c9b98e', lumps: [[0.25, 1], [0.15, 0.85]] });
  ctx.solid.box(1.2, 0.5, 0.55, { position: [-3.0, F + 0.25, 0.6], color: '#5a3e2a' });
  ctx.solid.box(1.24, 0.06, 0.6, { position: [-3.0, F + 0.53, 0.6], color: '#4a3222' });
  block(ctx, { x: -3.0, z: 0.6, w: 1.2, d: 0.55, bottom: F, top: F + 0.56 });
  chair(ctx, { x: -1.6, z: -3.6, y: F, rot: 0.6 });
  ctx.solid.box(0.42, 0.04, 0.5, { position: [-1.6, F + 0.5, -3.6], rotation: [0.1, 0.6, 0.05], color: '#2f3138' });
  for (const z of [-3.8, -3.3, 1.8]) {
    ctx.solid.box(0.06, 0.06, 0.1, { position: [-3.88, F + 0.85, z], color: '#3a2a1e' });
  }
  ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.22, 0.75, 6), { position: [-3.8, F + 0.48, -3.8], color: '#3a3c44' });
  ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.18, 0.7, 6), { position: [-3.8, F + 0.5, 1.8], color: '#5a4a3a' });
  ctx.solid.box(1.6, 0.03, 1.0, { position: [-0.9, F + 0.015, -1.3], color: '#7a4a3a', jitter: 0.08 });
  for (let i = 0; i < 5; i++) ctx.solid.box(1.6, 0.031, 0.06, { position: [-0.9, F + 0.016, -1.7 + i * 0.2], color: '#c8b48a' });
}

export default {
  title: 'Joseph Smith-History 1:29-49: Moroni visits Joseph',
  seed: 1823,
  fov: 66,
  exposure: 1.0,

  sun: { direction: [-0.2, 0.7, -0.6], color: '#9fb4e0', intensity: 0.25 },
  light: { sky: '#f4e2c4', ground: '#4a3830', hemi: 0.4 },
  sky: { top: '#0a1024', horizon: '#1a2440', ground: '#0a0c14', sunColor: '#c8d4ff', glow: 0.2 },
  fog: { color: '#12182a', near: 60, far: 300 },
  bloom: { strength: 0.5, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.05, contrast: 1.06, vignette: 0.55, shadowTint: '#2a2440', highlightTint: '#fff2d8' },
  shadow: { center: [0, 0], radius: 12 },

  player: { start: START, yaw: Math.atan2(START[0] - (MORONI[0] - 0.6), START[1] - MORONI[1]), pitch: 0.02, eye: 1.6, speed: 2.2 },

  terrain: {
    size: 300,
    segments: 40,
    seed: 3,
    hills: 2,
    bumps: 0,
    flats: [{ x: 0, z: 0, r: 40, falloff: 20, height: 0 }],
    colors: { ground: '#2a2a22', groundAlt: '#2a2a22', grass: '#2a2a22', rock: '#2a2a22' },
  },

  effects: [
    { type: 'motes', position: [MORONI[0], F + 0.2, MORONI[1]], radius: 1.6, height: 3, count: 90, color: '#fff6dc', size: 0.03 },
  ],

  custom(ctx) {
    room(ctx);
    furnishings(ctx);
    settler(ctx, {
      x: JOSEPH[0], z: JOSEPH[1], y: F + 0.12, yaw: Math.PI / 2, pose: 'sit', arms: 'lap',
      coatOff: true, shirt: '#cfc2a8', vest: '#cfc2a8', pants: '#b8a88c', skin: '#d8a07a', hair: '#5a3a22', collide: false,
    });
    ctx.colliders.add({ x: JOSEPH[0], z: JOSEPH[1], w: 0.6, d: 0.6, bottom: F, top: F + 1.6 });
    messenger(ctx, {
      x: MORONI[0], z: MORONI[1], y: F + 0.35, face: JOSEPH, scale: 1.08, arms: 'out',
      light: 30, distance: 12, color: '#fff4dc', halo: 3.4, haloOpacity: 0.6, emissive: 0.75,
    });
    ctx.colliders.add({ x: MORONI[0], z: MORONI[1], w: 0.7, d: 0.7, bottom: F, top: F + 2.2 });
    const glowFloor = new ctx.THREE.Mesh(
      new ctx.THREE.CircleGeometry(2.4, 24).rotateX(-Math.PI / 2),
      new ctx.THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.07, depthWrite: false, blending: ctx.THREE.AdditiveBlending }),
    );
    glowFloor.position.set(MORONI[0], F + 0.04, MORONI[1]);
    ctx.scene.add(glowFloor);
    const fill = new ctx.THREE.PointLight('#ffe8c4', 4, 10, 1.2);
    fill.position.set(0.5, F + 2.6, 2);
    ctx.scene.add(fill);
  },
};
