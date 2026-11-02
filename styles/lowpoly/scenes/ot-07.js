// Genesis 15:5: the Lord brings Abram out of his tent at night and tells him to count the stars.
// -z is north, toward the open desert where Abram stands under the sky.
import { tent, flock, camel, campfire, stars, person, angel, jar } from './lib/ot-07-common.js';

const ABRAM = [0, -8];
const FIRE = [-7, 4];

const fireRing = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 + 0.4;
  return [FIRE[0] + Math.cos(a) * 2.2, FIRE[1] + Math.sin(a) * 2.2];
});

const fold = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return { type: 'wall', x: 20 + Math.cos(a) * 7, z: -2 + Math.sin(a) * 7, rot: -a, len: 4.3, h: 1.0, thick: 0.6, damage: 0.08, color: '#7d7262' };
}).filter((_, i) => i !== 7);

export default {
  title: 'Genesis 15:5: Abraham counts the stars',
  seed: 15,
  fov: 62,
  exposure: 1.15,

  sun: { direction: [0.6, 0.35, 0.55], color: '#8fa6e0', intensity: 0.7 },
  light: { sky: '#4a5c98', ground: '#2a2018', hemi: 1.05 },
  sky: { top: '#02040f', horizon: '#16234a', ground: '#0a0c14', sunColor: '#6f80b0', glow: 0.25 },
  fog: { color: '#0d1428', near: 50, far: 460 },
  mountains: { count: 44, color: '#080a12', radius: [460, 680], height: [25, 80], haze: 0.25 },
  bloom: { strength: 0.85, radius: 0.5, threshold: 0.55 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.5, shadowTint: '#0c1640', highlightTint: '#ffd6a0' },
  shadow: { center: [0, -4], radius: 40 },

  player: { start: [2.8, -1.4], yaw: 0.16, pitch: 0.15, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 15,
    hills: 18,
    bumps: 0.3,
    flats: [{ x: 0, z: -4, r: 40, falloff: 40, height: 0 }],
    colors: { ground: '#6d5f48', groundAlt: '#5f523f', grass: '#565a38', high: '#6a5e4c', rock: '#544a40' },
    patches: [{ x: FIRE[0], z: FIRE[1], r: 3, color: '#2a2420', strength: 0.8, rough: 0.3 }],
  },

  objects: fold,

  scatter: [
    { type: 'rock', count: 40, center: [0, 0], ring: [40, 260], spacing: 12, seed: 4, props: { color: '#5e5446' } },
    { type: 'rock', count: 14, center: [0, 0], ring: [16, 40], spacing: 8, seed: 5, props: { size: 0.8, color: '#5e5446' } },
    { type: 'tree', count: 22, center: [0, 0], ring: [45, 220], spacing: 18, seed: 6, props: { kind: 'broad', leaf: '#3e4a2c', h: 5 } },
    { type: 'tree', count: 4, center: [0, 0], ring: [24, 34], arc: [0.5, 2.6], spacing: 10, seed: 7, props: { kind: 'broad', leaf: '#3e4a2c', h: 6 } },
  ],

  crowd: {
    palette: {
      robes: ['#7a5c40', '#5e4a38', '#8a7458', '#4f4234', '#6d4a34', '#9a8466'],
      mantles: ['#3e2e24', '#5a4430', '#2e3440', '#6a5a40'],
      skins: ['#8a5a3c', '#9b6a46', '#7a4c31'],
      mantleChance: 0.7,
      hoodChance: 0.5,
    },
    groups: [
      { count: fireRing.length, points: fireRing, face: FIRE, children: 0.1, kneel: 1, seed: 31 },
      { count: 3, points: [[14, -3], [26, 2], [13, 4]], face: [20, -2], children: 0, seed: 32 },
    ],
  },

  custom(ctx) {
    tent(ctx, { x: -6, z: -14, rot: 0.35, w: 9, d: 5.5, h: 2.6 });
    tent(ctx, { x: -16, z: -4, rot: 1.2, w: 7, d: 5, h: 2.3 });
    tent(ctx, { x: 10, z: -16, rot: -0.5, w: 7.5, d: 5, h: 2.4 });
    tent(ctx, { x: -18, z: 12, rot: 1.9, w: 6, d: 4.5, h: 2.2 });
    tent(ctx, { x: 30, z: -16, rot: -1.0, w: 6.5, d: 4.5, h: 2.2 });
    campfire(ctx, { x: FIRE[0], z: FIRE[1], size: 0.9, light: 30, distance: 20 });
    flock(ctx, { x: 20, z: -2, r: 5.5, count: 26, goats: 0.3 });
    for (let i = 0; i < 6; i++) camel(ctx, { x: -30 + i * 2.6, z: -18 - (i % 2) * 2.2, rot: 0.9 + i * 0.2, kneel: true, color: i % 2 ? '#b38a5e' : '#c49c6c', blanket: i % 3 === 0 ? '#7a2e24' : null });
    jar(ctx, { x: -3.6, z: -10.6 });
    jar(ctx, { x: -2.9, z: -10.2, scale: 0.8, color: '#9a5a38' });

    for (const [lx, lz] of [[-5.2, -11.6], [9.2, -13.6]]) {
      const y = ctx.heightAt(lx, lz);
      ctx.glow.add(new ctx.THREE.OctahedronGeometry(0.12, 0), { position: [lx, y + 0.25, lz], color: '#ffb050' });
      const pl = new ctx.THREE.PointLight('#ffa040', 4, 7, 1.6);
      pl.position.set(lx, y + 0.8, lz);
      ctx.scene.add(pl);
    }

    person(ctx, { x: ABRAM[0], z: ABRAM[1], face: [-1.5, -60], robe: '#a8845c', mantle: '#6a4a32', skin: '#9b6a46', arms: 'out', hood: true, scale: 1.05 });
    angel(ctx, { x: ABRAM[0] + 2.0, z: ABRAM[1] - 1.4, face: [ABRAM[0] - 1, ABRAM[1] + 1], arms: 'out', glow: 0.38, light: 18, halo: 3.2 });
    stars(ctx, { count: 3600, band: 4200, tilt: 0.45, brightness: 1.1 });
  },

  effects: [
    { type: 'motes', at: [2, -9.4], radius: 2.5, height: 12, count: 70, color: '#e8eeff', size: 0.04 },
  ],
};
