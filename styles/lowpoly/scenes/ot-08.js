// Genesis 18:1-8: in the heat of the day Abraham sits in his tent door under the oaks of Mamre,
// sees three men standing by him, and runs to meet them. -z is north.
import { tent, flock, person, angel, jar, kit, donkey, tufts } from './lib/ot-07-common.js';

const TENT = [-3, -12];
const ABRAHAM = [2.2, -5.2];
const VISITORS = [[7.4, -1.2], [8.9, -2.6], [9.1, -0.2]];

function cow(ctx, x, z, rot, color) {
  const { THREE } = ctx;
  const k = kit(ctx, x, z, rot, ctx.heightAt(x, z) - 0.03);
  k.add(new THREE.IcosahedronGeometry(1, 0), { p: [0, 1.0, 0], s: [0.45, 0.42, 0.9], color });
  k.box(0.32, 0.36, 0.5, { p: [0, 1.0, 1.0], r: [0.5, 0, 0], color });
  for (const sx of [-1, 1]) k.box(0.05, 0.05, 0.22, { p: [sx * 0.16, 1.22, 0.9], r: [0, sx * 0.9, 0], color: '#d8ccb0' });
  for (const [lx, lz] of [[-0.22, 0.5], [0.22, 0.5], [-0.22, -0.5], [0.22, -0.5]]) k.box(0.12, 0.7, 0.12, { p: [lx, 0.35, lz], color: '#3a2e24' });
}

export default {
  title: "Genesis 18:1-8: Abraham's three visitors",
  seed: 18,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.35, 0.85, 0.3], color: '#fff0d2', intensity: 3.1 },
  light: { sky: '#a8c4e8', ground: '#8a7050', hemi: 1.0 },
  sky: { top: '#4f86c8', horizon: '#e4d8bc', ground: '#cdb98e', sunColor: '#fff6dc', glow: 0.8 },
  fog: { color: '#ddd0b0', near: 90, far: 620 },
  clouds: { count: 26, shadow: '#b8bccb', lit: '#ffffff', rim: '#fffaf0', distance: [300, 900], altitude: [140, 260], hole: 0 },
  mountains: { count: 40, color: '#8a8070', radius: [480, 720], height: [40, 110], haze: 0.6 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.35, shadowTint: '#3a3050', highlightTint: '#fff0c8' },
  shadow: { center: [0, -6], radius: 45 },

  player: { start: [-4.5, 6.5], yaw: -0.5, pitch: -0.04, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 18,
    hills: 22,
    bumps: 0.3,
    flats: [{ x: 0, z: -6, r: 38, falloff: 40, height: 0 }],
    colors: { ground: '#b29b6c', groundAlt: '#a58e60', grass: '#8f8f4c', high: '#9c8a68', rock: '#94806a' },
    patches: [
      { x: TENT[0], z: TENT[1] + 3, r: 7, color: '#9a8058', strength: 0.6, rough: 0.4 },
      { x: -6, z: -16, r: 12, color: '#7e8444', strength: 0.5, rough: 0.6 },
      { x: 14, z: -10, r: 10, color: '#7e8444', strength: 0.5, rough: 0.6 },
    ],
  },

  objects: [
    { type: 'tree', x: -10, z: -20, h: 10, kind: 'broad', leaf: '#5d7434' },
    { type: 'tree', x: 4, z: -21, h: 11, kind: 'broad', leaf: '#56702f' },
    { type: 'tree', x: 13, z: -8, h: 10, kind: 'broad', leaf: '#5d7434' },
    { type: 'tree', x: 12.5, z: 3, h: 9, kind: 'broad', leaf: '#62783a' },
    { type: 'tree', x: -15, z: -8, h: 9, kind: 'broad', leaf: '#56702f' },
  ],

  scatter: [
    { type: 'tree', count: 30, center: [0, -6], ring: [40, 220], spacing: 14, seed: 4, props: { kind: 'broad', leaf: '#647a38' } },
    { type: 'tree', count: 8, center: [0, -6], ring: [22, 38], arc: [Math.PI, Math.PI * 2], spacing: 9, seed: 5, props: { kind: 'broad', leaf: '#5d7434', h: 8 } },
    { type: 'rock', count: 40, center: [0, 0], ring: [30, 280], spacing: 10, seed: 6, props: { color: '#a08a70' } },
  ],

  crowd: {
    palette: {
      robes: ['#8a6a4a', '#a08260', '#6e5a44', '#c4b090', '#7a4e36'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.5,
      hoodChance: 0.4,
    },
    groups: [
      { count: 3, points: [[-16, -2], [-17.5, 0.5], [-13, 3]], face: [-3, -6], children: 0.3, seed: 41 },
      { count: 2, points: [[-24, -14], [-25.5, -12]], face: [-20, -18], children: 0, seed: 42 },
    ],
  },

  custom(ctx) {
    tent(ctx, { x: TENT[0], z: TENT[1], rot: 0.25, w: 11, d: 6.5, h: 2.9, color: '#2c2420', stripe: '#6a5440' });
    tent(ctx, { x: -18, z: -16, rot: 0.8, w: 7, d: 5, h: 2.4 });
    tent(ctx, { x: 10, z: -24, rot: -0.3, w: 6.5, d: 4.5, h: 2.3, color: '#3a2e26' });

    person(ctx, { x: TENT[0] + 0.6, z: TENT[1] + 2.4, face: [6, -2], robe: '#8a4a3a', mantle: '#c8b48e', skin: '#a87652', hood: true, scale: 0.95 });
    person(ctx, { x: ABRAHAM[0], z: ABRAHAM[1], face: VISITORS[0], pose: 'run', robe: '#e2d6bc', mantle: '#7a4e32', skin: '#9b6a46', arms: 'out', scale: 1.02 });
    VISITORS.forEach(([x, z], i) => angel(ctx, { x, z, face: ABRAHAM, arms: 'down', glow: 0.22, halo: i === 0 ? 3.6 : 3, collide: true, scale: 1.04 }));

    jar(ctx, { x: TENT[0] - 2.5, z: TENT[1] + 3.3 });
    jar(ctx, { x: TENT[0] - 1.9, z: TENT[1] + 3.7, scale: 0.8, color: '#9a5a38' });
    flock(ctx, { x: -28, z: 6, r: 8, count: 30, goats: 0.35 });
    for (const [x, z, rot, c] of [[-22, -24, 0.4, '#6a4a32'], [-26, -21, 1.6, '#3a2e26'], [-20, -28, -0.6, '#a07a52'], [-29, -26, 2.4, '#e0d6c4']]) cow(ctx, x, z, rot, c);
    donkey(ctx, { x: 16, z: -14, rot: 2.2 });
    tufts(ctx, { center: [0, -4], ring: [3, 45], count: 260, avoid: [[TENT[0], TENT[1], 7]] });
  },
};
