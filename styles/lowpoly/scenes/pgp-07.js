// Joseph Smith-History 1:14-20: the First Vision in the Sacred Grove, early spring morning 1820.
// Joseph kneels in a small clearing; a pillar of light descends and two Personages stand above him in the air.
import { hardwood, sapling, fern, log, settler, messenger, frame } from './lib/pgp-07-kit.js';

const JOSEPH = [0, 0];
const LIGHT = [0, -2.2];
const START = [2.4, 9.5];

const greens = ['#7fa944', '#8db84e', '#6f9a3c', '#9cc25a', '#5f8a36'];

export default {
  title: 'Joseph Smith-History 1:14-20: The First Vision',
  seed: 1820,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.7, 0.45, -0.35], color: '#ffe2b0', intensity: 2.2 },
  light: { sky: '#bcd4e8', ground: '#4a4a2a', hemi: 0.9 },
  sky: { top: '#7da4d2', horizon: '#c8d4bc', ground: '#a8b898', sunColor: '#fff0c8', glow: 0.9 },
  fog: { color: '#a8b898', near: 25, far: 170 },
  bloom: { strength: 0.55, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.08, contrast: 1.05, vignette: 0.5, shadowTint: '#203028', highlightTint: '#fff4d8' },
  shadow: { center: [0, 0], radius: 45 },

  player: { start: START, yaw: Math.atan2(START[0] - LIGHT[0], START[1] - LIGHT[1]), pitch: 0.16, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 900,
    segments: 170,
    seed: 7,
    hills: 6,
    bumps: 0.4,
    flats: [{ x: 0, z: 0, r: 9, falloff: 14, height: 0 }],
    colors: { ground: '#6a5a3e', groundAlt: '#5c5034', grass: '#6a7a38', rock: '#5a5040' },
    patches: [
      { x: 0, z: -1, r: 9, color: '#7c8a3e', strength: 0.8, rough: 0.4 },
      { x: 2, z: 10, r: 5, color: '#78873c', strength: 0.5, rough: 0.6 },
    ],
  },

  effects: [
    { type: 'beam', at: LIGHT, height: 120, radiusBottom: 3.4, radiusTop: 6, color: '#fff3d4', opacity: 0.42 },
    { type: 'beam', at: LIGHT, height: 120, radiusBottom: 2.2, radiusTop: 3.5, color: '#fffaf0', opacity: 0.3 },
    { type: 'ring', position: [JOSEPH[0], 0.06, JOSEPH[1]], radius: 2.6, width: 1.6, color: '#fff0c4', opacity: 0.55 },
    { type: 'motes', at: LIGHT, radius: 4, height: 18, count: 260, color: '#fff6dc' },
  ],

  custom(ctx) {
    const r = ctx.rand;
    const clear = (x, z) => Math.hypot(x, z + 1) < 8.5 || (Math.abs(x - START[0] * (z / START[1])) < 1.6 && z > 0 && z < 16);
    const placed = [];
    for (let tries = 0; placed.length < 420 && tries < 8000; tries++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r.range(8 ** 2, 120 ** 2));
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 1;
      if (clear(x, z) || placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 3.6)) continue;
      placed.push([x, z]);
      const beech = r() < 0.5;
      hardwood(ctx, {
        x, z,
        h: r.range(13, 20),
        radius: r.range(0.25, 0.48),
        trunk: beech ? '#8e8a80' : r.pick(['#5e5248', '#6b5e52', '#544a40']),
        leaves: greens,
      });
    }
    for (let i = 0; i < 160; i++) {
      const a = r() * Math.PI * 2, d = r.range(7, 70);
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 1;
      if (clear(x, z)) continue;
      if (r() < 0.45) sapling(ctx, { x, z, leaf: r.pick(greens) });
      else fern(ctx, { x, z, color: r.pick(['#5f8f3a', '#6e9a42', '#4f7a32']) });
    }
    for (const [x, z, rot, len] of [[-7.5, 4, 0.9, 6], [8, -6, -0.4, 7], [-12, -10, 1.6, 8], [14, 6, 0.3, 5], [-5, 16, 2.2, 6]]) {
      log(ctx, { x, z, rot, len, radius: r.range(0.25, 0.4), color: '#5a4a3c' });
    }
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2, d = r.range(1.5, 7.5);
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 1;
      ctx.glow.add(new ctx.THREE.OctahedronGeometry(0.05, 0), { position: [x, ctx.heightAt(x, z) + 0.12, z], color: r.pick(['#ffffff', '#fff2a0', '#f4e8ff']), jitter: 0 });
    }

    settler(ctx, {
      x: JOSEPH[0], z: JOSEPH[1], yaw: Math.PI, pose: 'kneel', arms: 'pray',
      coatOff: true, shirt: '#e6dcc6', vest: '#5a4636', pants: '#4a4038', hair: '#7a5634', skin: '#e0b090', scale: 0.95,
    });
    const hatAt = frame(JOSEPH[0], JOSEPH[1], 0)(0.9, 0.7);
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.24, 0.24, 0.02, 9), { position: [hatAt[0], ctx.heightAt(...hatAt) + 0.03, hatAt[1]], color: '#2a2622' });
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.13, 0.14, 0.17, 9), { position: [hatAt[0], ctx.heightAt(...hatAt) + 0.12, hatAt[1]], color: '#2a2622' });

    for (const sx of [-0.85, 0.85]) {
      const x = LIGHT[0] + sx, z = LIGHT[1] - 0.6;
      messenger(ctx, { x, z, y: ctx.heightAt(x, z) + 2.3, face: [JOSEPH[0], JOSEPH[1] + 2], scale: 1.08, arms: sx > 0 ? 'out' : 'down', light: 22, distance: 16, halo: 3.2, haloOpacity: 0.45, emissive: 0.35 });
    }
  },
};
