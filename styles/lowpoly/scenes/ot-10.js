// Genesis 22:1-14: on a summit in the land of Moriah, Abraham has bound Isaac on the altar when the angel
// of the Lord calls out of heaven, and a ram is caught in a thicket behind him. -z is north.
import { altar, person, angel, sheep, thicket, donkey, campfire, tufts } from './lib/ot-07-common.js';

const ALTAR = [0, -4];
const SUMMIT = 40;

export default {
  title: 'Genesis 22:1-14: Abraham and Isaac on Moriah',
  seed: 22,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.8, 0.38, 0.35], color: '#ffd8a0', intensity: 3.0 },
  light: { sky: '#9ab4e0', ground: '#6a5038', hemi: 1.0 },
  sky: { top: '#3a6cb8', horizon: '#e8d0a8', ground: '#c8ae88', sunColor: '#fff0c8', glow: 1.0 },
  fog: { color: '#d8c4a4', near: 80, far: 620 },
  clouds: { count: 50, shadow: '#a89cb0', lit: '#fff0d8', rim: '#fffaf0', distance: [260, 900], altitude: [60, 200], hole: 0.2 },
  mountains: { count: 50, color: '#7a7064', radius: [460, 700], height: [50, 140], haze: 0.55 },
  bloom: { strength: 0.5, radius: 0.55, threshold: 0.82 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.38, shadowTint: '#2e2850', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -3], radius: 30 },

  player: { start: [3.2, 7.5], yaw: 0.2, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 22,
    hills: 20,
    bumps: 0.45,
    flats: [{ x: 0, z: -2, r: 15, falloff: 90, height: SUMMIT }],
    colors: { ground: '#a08a68', groundAlt: '#8e7a5c', grass: '#7c7e46', high: '#a89478', rock: '#8a7660' },
    patches: [{ x: 0, z: -3, r: 9, color: '#b4a080', strength: 0.5, rough: 0.5 }],
  },

  objects: [
    { type: 'rock', x: -7, z: -9, size: 2.2, color: '#9a8a74' },
    { type: 'rock', x: 9, z: -12, size: 2.8, color: '#9a8a74' },
    { type: 'rock', x: -11, z: 3, size: 1.8, color: '#9a8a74' },
    { type: 'tree', x: -9, z: -14, h: 5, kind: 'broad', leaf: '#6a7a42' },
  ],

  scatter: [
    { type: 'rock', count: 26, center: [0, -2], ring: [7, 20], spacing: 3, seed: 4, props: { size: 0.7, color: '#a0907a' } },
    { type: 'rock', count: 50, center: [0, 0], ring: [24, 200], spacing: 9, seed: 5, props: { color: '#94826a' } },
    { type: 'tree', count: 40, center: [0, 0], ring: [30, 220], spacing: 10, seed: 6, props: { kind: 'broad', leaf: '#6a7a42', h: 5 } },
  ],

  custom(ctx) {
    const top = altar(ctx, { x: ALTAR[0], z: ALTAR[1], w: 2.2, d: 1.3, h: 1.0 });
    person(ctx, { x: ALTAR[0] - 0.1, z: ALTAR[1], y: top - 0.05, face: [-10, ALTAR[1]], pose: 'lie', robe: '#d8c8a8', mantle: '#a06a44', skin: '#a87652', scale: 0.92 });
    person(ctx, { x: ALTAR[0] + 1.9, z: ALTAR[1] + 0.6, face: [1.5, -11], robe: '#8a6a4a', mantle: '#4e3a2a', skin: '#9b6a46', hood: true, arms: 'out', scale: 1.02 });
    angel(ctx, { x: 1.5, z: -11, y: SUMMIT + 5.5, face: [ALTAR[0] + 1.9, ALTAR[1] + 0.6], arms: 'out', glow: 0.45, light: 30, halo: 3.5, float: 0.25 });

    thicket(ctx, { x: 6.5, z: -8.5, r: 1.4 });
    sheep(ctx, { x: 6.0, z: -7.2, rot: 0.4, kind: 'ram', pose: 'stand', scale: 1.15 });
    campfire(ctx, { x: -3, z: -1.5, size: 0.35, light: 6, distance: 6, stones: true });
    tufts(ctx, { center: [0, -2], ring: [3, 30], count: 140, colors: ['#7c7e46', '#8a8450', '#6e7038'] });

    donkey(ctx, { x: 46, z: 40, rot: -0.8 });
    person(ctx, { x: 48, z: 42, face: [0, 0], robe: '#7a5c40', mantle: '#4f4234', skin: '#8a5a3c' });
    person(ctx, { x: 44.5, z: 42.5, face: [0, 0], robe: '#5e4a38', skin: '#8a5a3c', hood: true });
  },

  effects: [
    { type: 'beam', position: [1.5, SUMMIT + 3, -11], height: 220, radiusBottom: 2.2, radiusTop: 10, color: '#fff3d6', opacity: 0.3 },
    { type: 'motes', position: [1.5, SUMMIT + 3, -11], radius: 3, height: 20, count: 90 },
    { type: 'sunShafts', center: [-20, -60], count: 5, spread: 70, length: 420, width: [10, 22], opacity: 0.06 },
  ],
};
