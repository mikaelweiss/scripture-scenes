// Alma 30:49-50: Korihor, demanding a sign, is struck dumb before the chief judge and Alma in Zarahemla.
// An open judgment portico on the north side of a plaza; the people fill the sides.
import { block, figure, spear, house } from './lib/bom-25-kit.js';

const SEAT = [0, -24];
const KORIHOR = [0.6, -15.2];
const plaster = '#e4d6b8';
const stoneTrim = '#9a7a56';

export default {
  title: 'Alma 30:49-50: Korihor struck dumb',
  seed: 27,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.35, 0.62, 0.7], color: '#fff0d4', intensity: 3.0 },
  light: { sky: '#a8c4ec', ground: '#6a5640', hemi: 1.1 },
  sky: { top: '#3f78c8', horizon: '#cfe0ee', ground: '#c9b292', sunColor: '#fff6e0', glow: 0.8 },
  fog: { color: '#d2dbe0', near: 90, far: 600 },
  clouds: { count: 40, shadow: '#c4ccda', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [120, 260], hole: 0.2 },
  mountains: { count: 40, color: '#6a7a72', radius: [560, 800], height: [40, 120], haze: 0.55 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.38, shadowTint: '#2a3050', highlightTint: '#fff2dc' },
  shadow: { center: [0, -14], radius: 40 },

  player: { start: [-2.8, -9.4], yaw: -0.3, pitch: 0.08, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 160,
    seed: 27,
    hills: 22,
    bumps: 0.25,
    flats: [{ x: 0, z: -10, r: 60, falloff: 50, height: 0 }],
    colors: { ground: '#9c8460', groundAlt: '#8a7a54', grass: '#6c8040', high: '#7a8a58', rock: '#7a6a58' },
  },

  objects: [
    { type: 'pavement', x: 0, z: -12, w: 34, d: 34, tile: 2.4, color: '#cdb994', damage: 0.02 },
    { type: 'steppedPyramid', x: 52, z: -70, w: 30, d: 30, tiers: 5, tierHeight: 3.2, inset: 2.4, stairWidth: 7, color: '#c9b08a', trim: stoneTrim, shrine: { w: 9, d: 7, h: 4.5, door: 2 } },
  ],

  scatter: [
    { type: 'tree', count: 40, center: [0, -10], ring: [45, 220], spacing: 8, seed: 3, props: { kind: 'palm', leaf: '#5a8238' } },
    { type: 'tree', count: 50, center: [0, -10], ring: [60, 260], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#557a36' } },
  ],

  crowd: {
    palette: {
      robes: ['#d8cdb5', '#c4b090', '#a0825c', '#8b6b4a', '#e6dcc4', '#6e7a8a', '#b59a72', '#94704e'],
      mantles: ['#5a3d2b', '#3f4d5e', '#7d5c3e', '#c9b48e', '#556246', '#8a3a2a'],
      skins: ['#a87652', '#b5835e', '#9b6a46', '#c08a62'],
      mantleChance: 0.6,
      hoodChance: 0.2,
    },
    groups: [
      { count: 260, center: [0, -14], ring: [7, 17], arc: [-0.15, Math.PI + 0.15], spacing: 0.85, face: [0, -17], children: 0.15, seed: 71, avoid: [{ rect: [0, -4, 7, 30] }] },
      { count: 120, center: [0, -14], ring: [8, 17], arc: [Math.PI + 0.15, 2 * Math.PI - 0.15], spacing: 0.85, face: KORIHOR, children: 0.1, seed: 72, avoid: [{ rect: [0, -24, 22, 10] }] },
    ],
  },

  custom(ctx) {
    // Judgment portico: raised floor, steps, back wall, columns and roof.
    const [sx, sz] = SEAT;
    const top = 1.6;
    block(ctx, { x: sx, z: sz, y: -0.2, w: 18, h: top + 0.2, d: 7, color: '#cdb994' });
    for (let i = 0; i < 4; i++) block(ctx, { x: sx, z: sz + 3.5 + 0.45 + i * 0.45, y: -0.2, w: 10, h: top + 0.2 - (i + 1) * 0.4, d: 0.46, color: '#d6c39e' });
    block(ctx, { x: sx, z: sz - 3.2, y: top, w: 18, h: 5.4, d: 0.6, color: plaster });
    ctx.solid.box(18.1, 0.5, 0.7, { position: [sx, top + 0.25, sz - 3.2], color: '#2f6f6a', jitter: 0.02 });
    ctx.solid.box(18.1, 0.4, 0.7, { position: [sx, top + 3.8, sz - 3.2], color: '#a8342a', jitter: 0.02 });
    for (const s of [-1, 1]) block(ctx, { x: sx + s * 8.7, z: sz, y: top, w: 0.6, h: 5.4, d: 7, color: plaster });
    for (const cx of [-6.5, -2.6, 2.6, 6.5]) ctx.builders.column(ctx, { x: sx + cx, z: sz + 3, h: top + 5.4, radius: 0.42, color: '#ddd0b2', broken: false });
    ctx.solid.box(19.5, 0.7, 8.6, { position: [sx, top + 5.75, sz - 0.2], color: stoneTrim, jitter: 0.03 });
    ctx.solid.box(18, 0.5, 7, { position: [sx, top + 6.3, sz - 0.4], color: '#b89a72', jitter: 0.03 });

    const fill = new ctx.THREE.PointLight('#ffe2b8', 16, 18, 1.2);
    fill.position.set(sx, top + 2.4, sz + 3.6);
    ctx.scene.add(fill);

    // Judgment seat with a high back.
    block(ctx, { x: sx, z: sz - 2.2, y: top, w: 2.4, h: 0.6, d: 1.4, color: '#8a6440' });
    block(ctx, { x: sx, z: sz - 2.8, y: top, w: 2.4, h: 2.6, d: 0.3, color: '#7a5434' });
    ctx.solid.box(2.8, 0.3, 0.4, { position: [sx, top + 2.75, sz - 2.8], color: '#d4a636', jitter: 0.02 });

    // Chief judge before his seat, Alma beside him, a scribe with a tablet.
    figure(ctx, { x: sx, z: sz - 0.6, y: top, face: [KORIHOR[0], KORIHOR[1]], scale: 1.04, robe: '#3a4a6a', mantle: '#e8dcc0', skin: '#b5835e' });
    figure(ctx, { x: sx - 1.5, z: sz + 1.7, y: top, face: [KORIHOR[0], KORIHOR[1]], robe: '#f0e8d8', mantle: '#c9b48e', skin: '#a87652', arms: 'out' });
    figure(ctx, { x: sx + 3.4, z: sz + 0.2, y: top, face: [0, -15], robe: '#c4b090', skin: '#a87652', mantle: '#556246' });
    ctx.solid.box(0.35, 0.03, 0.45, { position: [sx + 3.4, top + 1.0, sz + 0.55], rotation: [0.6, 0, 0], color: '#e9dcc0', jitter: 0 });

    // Korihor alone on the plaza, a writing tablet in hand, and two officers behind him.
    const k = figure(ctx, { x: KORIHOR[0], z: KORIHOR[1], face: [sx, sz], robe: '#5a2a4a', mantle: '#c9a040', skin: '#b07a55' });
    ctx.solid.box(0.32, 0.03, 0.42, { position: [KORIHOR[0] + 0.18, k.y + 1.0, KORIHOR[1] - 0.35], rotation: [-0.7, 0.2, 0], color: '#e9dcc0', jitter: 0 });
    for (const ox of [-1.9, 2.1]) {
      const o = figure(ctx, { x: KORIHOR[0] + ox, z: KORIHOR[1] + 1.0, face: [sx, sz], robe: '#8a6a4a', mantle: '#3f4d5e', skin: '#9b6a46' });
      spear(ctx, { x: KORIHOR[0] + ox + 0.3, y: o.y, z: KORIHOR[1] + 1.1, pitch: -Math.PI / 2 + 0.06, len: 2.5 });
    }

    // Houses of Zarahemla around the plaza.
    const r = ctx.rand;
    const spots = [];
    for (let tries = 0; spots.length < 46 && tries < 900; tries++) {
      const a = r() * Math.PI * 2, d = r.range(26, 90);
      const hx = Math.cos(a) * d, hz = -12 + Math.sin(a) * d;
      if (Math.abs(hx) < 12 && hz > -2) continue;
      if (Math.abs(hx) < 14 && hz < -20 && hz > -36) continue;
      if (Math.hypot(hx - 52, hz + 70) < 26) continue;
      if (spots.some(([px, pz]) => Math.hypot(px - hx, pz - hz) < 11)) continue;
      spots.push([hx, hz]);
      house(ctx, { x: hx, z: hz, rot: Math.atan2(-hx, -12 - hz) + r.range(-0.2, 0.2), w: r.range(6, 10), d: r.range(5, 8), h: r.range(3, 4.6), color: r.pick(['#e4d6b8', '#dccaa4', '#e8dcc4', '#d4bc94']) });
    }
  },
};
