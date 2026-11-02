// Alma 46:12-21: Moroni rends his coat, writes on it, and raises it on a pole as the title of liberty.
// The people come running, rend their garments and cast them at his feet as a covenant.
import { block, figure, cloth, pole, spear, house, textTexture } from './lib/bom-25-kit.js';

const MORONI = [0, -16];
const RISE = 1.4;
const bronze = '#a8763a';

const words = ['In memory of our God,', 'our religion,', 'and freedom,', 'and our peace,', 'our wives,', 'and our children'];

const runnerPaths = [
  [[-48, 30], [-6, -10]], [[-36, 42], [-4, -9]], [[-60, 6], [-7, -12]], [[46, 34], [6, -10]], [[34, 46], [4, -9]], [[62, 10], [7, -12]],
  [[-20, 50], [-3, -8.5]], [[22, 52], [3, -8.5]], [[-54, 20], [-6, -11]], [[54, 22], [6, -11]], [[-28, 40], [-5, -9]], [[30, 38], [5, -9]],
];

function helmet(ctx, x, y, z, scale = 1) {
  const top = y + 1.6 * scale;
  ctx.solid.add(new ctx.THREE.SphereGeometry(0.16 * scale, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), { position: [x, top - 0.02, z], color: bronze, jitter: 0.03 });
  ctx.solid.box(0.04 * scale, 0.12 * scale, 0.3 * scale, { position: [x, top + 0.17 * scale, z], color: '#a8342a', jitter: 0.03 });
}

export default {
  title: 'Alma 46:12-21: The Title of Liberty',
  seed: 30,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [-0.55, 0.5, 0.65], color: '#ffe0b0', intensity: 3.3 },
  light: { sky: '#9ab4e0', ground: '#5e4a34', hemi: 1.0 },
  sky: { top: '#3d6cb8', horizon: '#e2d8c4', ground: '#c9a882', sunColor: '#fff2d0', glow: 1 },
  fog: { color: '#d4d0c4', near: 90, far: 560 },
  clouds: { count: 55, shadow: '#9aa0b0', lit: '#fff4e0', rim: '#ffffff', distance: [200, 800], altitude: [90, 220], hole: 0.25 },
  mountains: { count: 44, color: '#5f6e64', radius: [520, 760], height: [40, 120], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.12, contrast: 1.07, vignette: 0.4, shadowTint: '#2a3050', highlightTint: '#ffe8c4' },
  shadow: { center: [0, -10], radius: 45 },

  player: { start: [0, -1], yaw: 0, pitch: 0.2, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 30,
    hills: 24,
    bumps: 0.35,
    flats: [{ x: 0, z: -12, r: 60, falloff: 50, height: 0 }],
    colors: { ground: '#8a7a50', groundAlt: '#7a7444', grass: '#6a8040', high: '#7a8a52', rock: '#7a6a58' },
    patches: [{ x: 0, z: -10, r: 26, color: '#a08a62', strength: 0.6, rough: 0.5 }],
  },

  objects: [
    { type: 'steppedPyramid', x: -30, z: -95, w: 30, d: 28, tiers: 5, tierHeight: 3.2, inset: 2.4, stairWidth: 7, color: '#c9b08a', trim: '#8c765c', shrine: { w: 9, d: 7, h: 4.5, door: 2 } },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -12], ring: [60, 260], spacing: 8, seed: 3, avoid: [{ rect: [0, -80, 140, 60] }], props: { kind: 'broad', leaf: '#557a36' } },
    { type: 'tree', count: 20, center: [0, -12], ring: [50, 200], spacing: 8, seed: 4, avoid: [{ rect: [0, -80, 140, 60] }], props: { kind: 'palm', leaf: '#5a8238' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246', '#6d3b2e'],
      skins: ['#a87652', '#b5835e', '#9b6a46', '#c08a62'],
      mantleChance: 0.55,
      hoodChance: 0.2,
    },
    groups: [
      { count: 700, center: MORONI, ring: [6.5, 34], arc: [-0.35, Math.PI + 0.35], spacing: 0.9, face: MORONI, children: 0.18, kneel: 0.3, seed: 101, avoid: [{ rect: [0, 6, 7, 26] }] },
      { count: 160, center: MORONI, ring: [7, 22], arc: [Math.PI + 0.5, 2 * Math.PI - 0.5], spacing: 1.0, face: MORONI, children: 0.1, seed: 102 },
    ],
  },

  custom(ctx) {
    const [mx, mz] = MORONI;
    const r = ctx.rand;

    // A low stone rise for Moroni, with steps toward the people.
    block(ctx, { x: mx, z: mz, y: -0.2, w: 7, h: RISE + 0.2, d: 5, color: '#9a8a70' });
    for (let i = 0; i < 3; i++) block(ctx, { x: mx, z: mz + 2.5 + 0.4 + i * 0.45, y: -0.2, w: 3, h: RISE + 0.2 - (i + 1) * 0.45, d: 0.46, color: '#a8987c' });

    // Moroni in bronze helmet and breastplate with the pole in his hand.
    const scale = 1.1;
    const m = figure(ctx, { x: mx, z: mz, y: RISE, face: [0, 20], scale, robe: '#7a2a20', mantle: '#a8342a', skin: '#b07a55', arms: 'out' });
    helmet(ctx, mx, m.y, mz, scale);
    ctx.solid.box(0.46 * scale, 0.42 * scale, 0.36 * scale, { position: [mx, m.y + 1.12 * scale, mz + 0.02], color: bronze, jitter: 0.03 });
    const px = mx + 0.62 * scale;
    pole(ctx, { x: px, z: mz + 0.2, y: m.y, h: 7.2, r: 0.06, color: '#4a3424' });
    ctx.solid.add(new ctx.THREE.ConeGeometry(0.1, 0.35, 5), { position: [px, m.y + 7.35, mz + 0.2], color: bronze });

    // The rent coat, lettered, flying from the pole.
    const map = textTexture(words, { width: 512, height: 400, bg: '#d9cfb8', ink: '#4a2418', font: 'italic bold 46px Georgia, serif', lineHeight: 58 });
    cloth(ctx, { x: px + 1.5, y: m.y + 6.0, z: mz + 0.2, w: 3.0, h: 2.3, anchor: 'left', map, amp: 0.32, speed: 3.2, tear: 0.22, seed: 30, segX: 14, segY: 10 });

    // Garments cast at his feet.
    const cloths = ['#8b6b4a', '#a0825c', '#c4b090', '#a65d3f', '#d8cdb5', '#4f5a6b', '#6b6f4a', '#7a4e36', '#e6dcc4'];
    for (let i = 0; i < 60; i++) {
      const a = r.range(-0.3, Math.PI + 0.3), d = Math.sqrt(r()) * 3.2;
      const gx = mx + Math.cos(a) * d * 1.3, gz = mz + 4.8 + Math.sin(a) * d * 0.7;
      const gy = ctx.colliders.ground(gx, gz, 10, ctx.heightAt(gx, gz), { radius: 0 });
      ctx.solid.box(r.range(0.6, 1.1), 0.05, r.range(0.4, 0.8), { position: [gx, gy + 0.03 + r() * 0.12, gz], rotation: [r.range(-0.15, 0.15), r() * 3, r.range(-0.15, 0.15)], color: r.pick(cloths), jitter: 0.06 });
    }

    // Moroni's captains beside him, spears raised.
    for (const [ox, oz] of [[-2.6, 0.3], [2.6, 0.6], [-1.6, -1.4], [1.8, -1.6]]) {
      const c = figure(ctx, { x: mx + ox, z: mz + oz, y: RISE, face: [mx + ox * 2, 20], robe: '#6e5a44', mantle: r.pick(['#a34f32', '#3f4d5e']), skin: '#a87652' });
      helmet(ctx, mx + ox, c.y, mz + oz);
      ctx.solid.box(0.44, 0.4, 0.34, { position: [mx + ox, c.y + 1.12, mz + oz], color: bronze, jitter: 0.03 });
      spear(ctx, { x: mx + ox + 0.3, y: c.y, z: mz + oz + 0.15, pitch: -Math.PI / 2 + 0.08, len: 2.7 });
    }

    // People kneeling to covenant right before the rise, garments in hand.
    for (let i = 0; i < 10; i++) {
      const gx = mx - 4.5 + i, gz = mz + 6.8 + r.range(-0.3, 0.3);
      figure(ctx, { x: gx, z: gz, face: MORONI, kneel: true, robe: r.pick(cloths), mantle: r() < 0.5 ? r.pick(['#5a3d2b', '#a34f32', '#3f4d5e']) : undefined, skin: r.pick(['#a87652', '#b5835e', '#9b6a46']), arms: 'out' });
    }

    // People running in from the land to join the covenant.
    const runners = runnerPaths.map(([start, to], i) => {
      const from = [start[0] * 1.6, start[1] * 1.6];
      const f = figure(ctx, { x: from[0], z: from[1], face: to, collide: false, robe: r.pick(cloths), mantle: r() < 0.5 ? r.pick(['#5a3d2b', '#a34f32', '#556246']) : undefined, skin: r.pick(['#a87652', '#b5835e', '#9b6a46']), scale: r.range(0.9, 1.06) });
      const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
      f.group.rotation.order = 'YXZ';
      f.group.rotation.x = 0.15;
      return { g: f.group, from, to, len, phase: i / runnerPaths.length, speed: r.range(4, 5.5) };
    });
    ctx.onFrame((t) => {
      for (const run of runners) {
        const k = (run.phase + (t * run.speed) / run.len) % 1;
        const x = run.from[0] + (run.to[0] - run.from[0]) * k, z = run.from[1] + (run.to[1] - run.from[1]) * k;
        run.g.position.set(x, ctx.heightAt(x, z) + Math.abs(Math.sin(t * 9 + run.phase * 20)) * 0.12, z);
      }
    });

    // Zarahemla's wall and houses behind.
    for (let wx = -70; wx <= 70; wx += 10) {
      if (Math.abs(wx) < 6) continue;
      block(ctx, { x: wx, z: -58, y: -0.5, w: 10, h: 4.5, d: 1.6, color: '#b8a582' });
      for (let k = -2; k <= 2; k++) ctx.solid.box(1.1, 0.7, 1.7, { position: [wx + k * 2, 4.35, -58], color: '#a8946e' });
    }
    for (const s of [-1, 1]) block(ctx, { x: s * 6, z: -58, y: -0.5, w: 3.4, h: 7, d: 3.4, color: '#b8a582' });
    for (let i = 0; i < 26; i++) {
      const hx = r.range(-80, 80), hz = r.range(-110, -64);
      if (Math.hypot(hx + 30, hz + 95) < 22) continue;
      house(ctx, { x: hx, z: hz, rot: r.range(-0.3, 0.3), w: r.range(6, 10), d: r.range(5, 8), h: r.range(3.4, 5), color: r.pick(['#e4d6b8', '#dccaa4', '#e8dcc4']) });
    }
  },
};
