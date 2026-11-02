// 3 Nephi 1:4-21: the believers wait outside Zarahemla under sentence of death.
// The sun goes down in the north-west, yet the sky stays bright as noon, and a new star rises.
// Coordinates are meters. The player looks north (-z) into the sunset over the kneeling believers.
import { figure, house, star } from './lib/bom-37-kit.js';

const NEPHI = [0, -18];
const STAR = [84, 112, -222];

const palette = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#d8cdb5', '#4f5a6b', '#e6dcc4'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
  skins: ['#b07f58', '#a87652', '#c08c63', '#9b6a46'],
  mantleChance: 0.6,
  hoodChance: 0.25,
};

const scoffers = {
  ...palette,
  robes: ['#5e4b3a', '#7a4e36', '#4f3a2c', '#6b3a2a', '#3f4d5e', '#8b6b4a', '#4a4038'],
  mantles: ['#3a2a20', '#5a2e1e', '#2f3a48', '#4a3a2a'],
  hoodChance: 0.4,
};

function town(ctx) {
  const r = ctx.rand;
  for (let i = 0; i < 70; i++) {
    const a = r.range(-1.55, Math.PI + 0.3);
    const d = r.range(55, 125);
    const x = Math.cos(a) * d * 1.3, z = NEPHI[1] + Math.sin(a) * d;
    house(ctx, { x, z, rot: Math.atan2(NEPHI[0] - x, NEPHI[1] - z) + r.range(-0.2, 0.2), w: r.range(6, 9), d: r.range(5, 7), h: r.range(3, 4.4), color: r.pick(['#d2bd96', '#c7ad84', '#dccaa6', '#bfa47c']) });
  }
  for (let i = 0; i < 18; i++) {
    const a = r.range(-0.9, Math.PI + 0.9), d = r.range(40, 70);
    ctx.builders.tree(ctx, { x: NEPHI[0] + Math.cos(a) * d * 1.2, z: NEPHI[1] + Math.sin(a) * d, kind: 'palm', h: r.range(6, 10), leaf: '#4f6e30' });
  }
}

export default {
  title: '3 Nephi 1:4-21: The night without darkness',
  seed: 38,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [-0.62, 0.07, -0.8], color: '#ffc88a', intensity: 2.6 },
  light: { sky: '#bcd2f0', ground: '#8a6a4a', hemi: 1.65 },
  sky: { top: '#5f8cc8', horizon: '#ffd7a0', ground: '#d9b48a', sunColor: '#ffb070', glow: 1.6 },
  fog: { color: '#e9c9a2', near: 110, far: 700 },
  clouds: { count: 34, shadow: '#c4a49a', lit: '#ffe4b8', rim: '#fff3d6', distance: [300, 950], altitude: [140, 260], hole: 0.3 },
  mountains: { count: 44, color: '#6c6a6a', radius: [560, 780], height: [40, 120], haze: 0.55 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.3, shadowTint: '#3a3a6a', highlightTint: '#fff0d0' },
  shadow: { center: [0, -14], radius: 60 },

  player: { start: [2, 5], yaw: -0.22, pitch: -0.01, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 38,
    hills: 22,
    bumps: 0.3,
    flats: [{ x: 0, z: -10, r: 130, falloff: 50, height: 0 }],
    colors: { ground: '#b09a72', groundAlt: '#a48c64', grass: '#7c8a44', high: '#8f8a5c', rock: '#7a6a58' },
    patches: [{ x: NEPHI[0], z: NEPHI[1], r: 26, color: '#c4ae86', strength: 0.6, rough: 0.4 }],
  },

  scatter: [
    { type: 'tree', count: 70, center: [0, 0], ring: [150, 330], spacing: 8, seed: 8, props: { leaf: '#56763a' } },
    { type: 'rock', count: 20, center: [0, 0], ring: [30, 200], spacing: 12, seed: 10, avoid: [{ rect: [0, 0, 40, 60] }], props: { size: 1.2 } },
  ],

  crowd: {
    palette,
    groups: [
      // The believers, kneeling and looking toward the new star.
      { count: 230, center: NEPHI, ring: [1.6, 13], spacing: 0.9, face: [60, -500], children: 0.25, kneel: 0.55, seed: 21, avoid: [{ rect: [3, 4, 3, 16] }] },
    ],
  },

  custom(ctx) {
    town(ctx);
    // A rock outcrop at the start lifts the eye enough to see the fallen on the ground.
    ctx.builders.rock(ctx, { x: 2, z: 6, size: 2.2, color: '#9a8670' });
    const r = ctx.rand;

    // Those who set the day of death stand apart. Many have fallen to the earth.
    const people = [];
    for (let i = 0; i < 26; i++) {
      const a = r.range(-0.4, Math.PI + 0.4), d = r.range(19, 32);
      const x = NEPHI[0] + Math.cos(a) * d * 1.2, z = NEPHI[1] + Math.sin(a) * d;
      if (Math.abs(x - 3) < 3 && z > -6) continue;
      people.push([x, z]);
      figure(ctx, { x, z, face: [x + r.range(-9, 9), z + r.range(-9, 9)], prostrate: true, solid: false, robe: r.pick(scoffers.robes), mantle: r.pick(scoffers.mantles), skin: r.pick(palette.skins) });
    }
    for (let i = 0; i < 80; i++) {
      const a = r.range(-0.5, Math.PI + 0.5), d = r.range(20, 38);
      const x = NEPHI[0] + Math.cos(a) * d * 1.2, z = NEPHI[1] + Math.sin(a) * d;
      if ((Math.abs(x - 3) < 3 && z > -6) || people.some(([px, pz]) => Math.hypot(px - x, pz - z) < 1.6)) continue;
      people.push([x, z]);
      figure(ctx, { x, z, face: [x + 40, z - 200], pose: r() < 0.4 ? 'forward' : 'down', robe: r.pick(scoffers.robes), mantle: r.pick(scoffers.mantles), skin: r.pick(palette.skins), hood: r() < 0.4 });
    }

    // Scoffers fallen to the earth close by, where the player sees them first.
    const fallen = [[0, -2, 2.9], [5, -1.5, -2.6], [-4.5, -4.5, 2.0], [8.5, -3.5, -2.9], [11, -4, 2.7], [-7, -4, -2.4], [2.5, -5, 0.4], [15, -6, -2.5], [-10, -1.5, 2.8]];
    for (const [x, z, yaw] of fallen) {
      figure(ctx, { x, z, face: [x + Math.sin(yaw), z + Math.cos(yaw)], prostrate: true, solid: false, robe: r.pick(palette.robes), mantle: r.pick(scoffers.mantles), skin: r.pick(palette.skins) });
    }

    // Nephi kneels where he prayed all day, with a few believers rising in joy around him.
    figure(ctx, { x: NEPHI[0], z: NEPHI[1], face: [0, -500], kneel: true, pose: 'up', robe: '#efe6d2', mantle: '#8a6a44', skin: '#b07f58', scale: 1.05 });
    const joy = [[-3, -12], [2.5, -10], [-5, -16], [5, -19], [-1.5, -8], [6, -14], [-6.5, -21]];
    for (const [x, z] of joy) figure(ctx, { x, z, face: [x + 30, -500], pose: r() < 0.6 ? 'up' : 'out', robe: r.pick(palette.robes), mantle: r.pick(palette.mantles), skin: r.pick(palette.skins), scale: r() < 0.3 ? 0.65 : 1 });

    star(ctx, { position: STAR, size: 46, color: '#fffbea' });
  },
};
