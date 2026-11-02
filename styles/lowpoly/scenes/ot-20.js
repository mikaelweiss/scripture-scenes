// Exodus 19-20: the third day at Sinai. The mount smokes and quakes, fire on its top and a thick
// cloud upon it. Israel stands at the nether part of the mount, behind the bounds Moses set.
import { ISRAEL, desertTerrain, layoutTents, tentZones, tent, campfire, flock, banner } from './lib/ot-19-camp.js';
import { sinaiFlat, sinaiPeaks, sinaiStorm, bounds } from './lib/ot-19-sinai.js';

const MOUNT = [0, -400];
const PEOPLE = [0, -70];

const tents = [
  ...layoutTents({ center: [0, 30], ring: [14, 230], count: 220, seed: 20, face: PEOPLE, avoid: [{ rect: [0, -75, 200, 120] }, { rect: [0, 26, 34, 40] }] }),
];
const zones = tentZones(tents);
const fence = Array.from({ length: 41 }, (_, i) => [-120 + i * 6, -152 + Math.sin(i * 0.9) * 0.8 + Math.abs(i - 20) * 0.6]);

export default {
  title: 'Exodus 19-20: The Law at Sinai',
  seed: 20,
  fov: 62,
  exposure: 1.15,

  sun: { direction: [-0.55, 0.42, 0.7], color: '#e8c098', intensity: 1.5 },
  light: { sky: '#6a6478', ground: '#4a3a32', hemi: 1.25 },
  sky: { top: '#24212c', horizon: '#7a5c50', ground: '#4a3c34', sunColor: '#d0a080', glow: 0.4 },
  fog: { color: '#5e4e4a', near: 90, far: 900 },
  clouds: { count: 90, shadow: '#221e24', lit: '#6a5450', rim: '#a07a64', distance: [480, 1100], altitude: [300, 420], hole: 0 },
  mountains: { count: 40, color: '#4a3c38', radius: [600, 800], height: [60, 160], haze: 0.5 },
  bloom: { strength: 0.75, radius: 0.6, threshold: 0.72 },
  grade: { saturation: 1.08, contrast: 1.1, vignette: 0.5, shadowTint: '#2a2040', highlightTint: '#ffd0a0' },
  shadow: { center: [0, -40], radius: 110 },

  player: { start: [0, 8], yaw: 0, pitch: 0.12, eye: 1.65, speed: 4.5 },

  terrain: desertTerrain({
    seed: 20,
    flats: [{ x: 0, z: -20, r: 150, falloff: 70, height: 0 }, sinaiFlat({ x: MOUNT[0], z: MOUNT[1], base: 90, spread: 250 })],
    colors: { ground: '#9a7a5a', groundAlt: '#8a6c50', grass: '#8a7656', high: '#7a5a48', rock: '#6a4c40' },
  }),

  scatter: [
    { type: 'rock', count: 60, center: [0, -60], ring: [160, 420], spacing: 12, seed: 3, props: { color: '#7a5a4a' } },
  ],

  crowd: {
    palette: ISRAEL,
    groups: [
      { count: 1500, center: PEOPLE, ring: [0, 72], spacing: 1.05, face: MOUNT, children: 0.2, kneel: 0.18, seed: 21, avoid: [...zones, { x: 0, z: 8, r: 4 }] },
      { count: 260, center: [0, -128], ring: [0, 16], arc: [0, Math.PI], spacing: 1.2, face: MOUNT, children: 0.1, seed: 22 },
    ],
  },

  custom(ctx) {
    for (const t of tents) tent(ctx, t);
    for (const [x, z] of [[-40, 20], [36, 10], [-80, -10], [70, 40], [-20, 70], [100, -30]]) campfire(ctx, x, z, { light: true, smoke: 6 });
    const colors = ['#9a2a24', '#2a4a7a', '#c9a24a', '#3a6a3a', '#7a3a7a', '#d8d0c0'];
    [[-60, -6], [-30, -2], [-90, 4], [30, -4], [60, -8], [90, 0]].forEach(([x, z], i) => banner(ctx, x, z, colors[i], { h: 6 }));
    flock(ctx, [-150, 30], 30, 14, 5);
    flock(ctx, [140, 60], 24, 12, 6, ['goat', 'ox']);
    bounds(ctx, fence);
    const summit = sinaiPeaks(ctx, { x: MOUNT[0], z: MOUNT[1], base: 90, seed: 7 });
    sinaiStorm(ctx, summit, { fire: true, quake: true, lightning: true });
  },
};
