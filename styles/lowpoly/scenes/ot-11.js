// Genesis 24:10-27: at evening, when women go out to draw water, Abraham's servant waits at the well
// outside the city of Nahor with ten kneeling camels, and Rebekah comes with her pitcher on her shoulder.
// -z is north, toward the city.
import { well, camel, person, jar, house, tufts } from './lib/ot-07-common.js';

const WELL = [0, -6];
const CITY = [-14, -72];
const REBEKAH = [2.2, -3.6];
const SERVANT = [3.6, -1.6];

const cityWall = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  return { type: 'wall', x: CITY[0] + Math.cos(a) * 30, z: CITY[1] + Math.sin(a) * 24, rot: -a, len: 11, h: 5, thick: 1.2, damage: 0.05, color: '#b8946a' };
}).filter((_, i) => i !== 5);

const camels = Array.from({ length: 10 }, (_, i) => {
  const a = -1.5 + (i / 9) * 2.6;
  const x = WELL[0] + 6 + Math.cos(a) * 7.5, z = WELL[1] - 1 + Math.sin(a) * 7.5;
  return [x, z, Math.atan2(WELL[0] + 3 - x, WELL[1] - z) + (i % 3 - 1) * 0.4];
});

export default {
  title: 'Genesis 24:10-27: Rebekah at the well',
  seed: 24,
  fov: 60,
  exposure: 1.3,

  sun: { direction: [-0.85, 0.3, 0.45], color: '#ffa860', intensity: 3.0 },
  light: { sky: '#9aa0d0', ground: '#8a6248', hemi: 1.4 },
  sky: { top: '#3c4a80', horizon: '#f4a868', ground: '#c89a78', sunColor: '#ffd090', glow: 1.3 },
  fog: { color: '#d8a07c', near: 70, far: 560 },
  clouds: { count: 60, shadow: '#5a4a68', lit: '#ffb878', rim: '#ffe8c0', distance: [240, 900], altitude: [80, 220], hole: 0.15 },
  mountains: { count: 44, color: '#6a5458', radius: [470, 700], height: [40, 120], haze: 0.5 },
  bloom: { strength: 0.6, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.32, shadowTint: '#30285e', highlightTint: '#ffd8a8' },
  shadow: { center: [2, -6], radius: 40 },

  player: { start: [-1.4, 0.6], yaw: -0.9, pitch: -0.08, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 24,
    hills: 18,
    bumps: 0.3,
    flats: [
      { x: 0, z: -6, r: 30, falloff: 30, height: 0 },
      { x: CITY[0], z: CITY[1], r: 34, falloff: 22, height: 4 },
    ],
    colors: { ground: '#b8966a', groundAlt: '#a8885e', grass: '#8a8448', high: '#a48a68', rock: '#94786a' },
    patches: [
      { x: WELL[0], z: WELL[1], r: 9, color: '#9a7a58', strength: 0.6, rough: 0.5 },
      { x: -6, z: -36, r: 6, color: '#c4a47a', strength: 0.5, rough: 0.8 },
    ],
  },

  objects: [
    ...cityWall,
    { type: 'tree', x: -5, z: -9, h: 8, kind: 'palm', leaf: '#5e7434' },
    { type: 'tree', x: -6.5, z: -4, h: 7, kind: 'palm', leaf: '#5e7434' },
    { type: 'tree', x: -3, z: -14, h: 9, kind: 'palm', leaf: '#56702f' },
    { type: 'tree', x: 14, z: -14, h: 8, kind: 'palm', leaf: '#5e7434' },
  ],

  scatter: [
    { type: 'tree', count: 22, center: [0, -30], ring: [40, 160], spacing: 12, seed: 4, props: { kind: 'palm', leaf: '#5e7434' } },
    { type: 'tree', count: 20, center: [0, -30], ring: [60, 220], spacing: 14, seed: 5, props: { kind: 'broad', leaf: '#6a7a40', h: 6 } },
    { type: 'rock', count: 40, center: [0, 0], ring: [24, 260], spacing: 10, seed: 6, avoid: [{ r: 40, x: CITY[0], z: CITY[1] }], props: { color: '#a08a70' } },
  ],

  crowd: {
    palette: {
      robes: ['#8a6a4a', '#a08260', '#6e5a44', '#c4b090', '#7a4e36', '#5e4b3a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.7,
      hoodChance: 0.7,
    },
    groups: [
      { count: 4, points: [[15.5, 0], [16, -6], [12.5, 4], [15, -12]], face: WELL, children: 0, seed: 51 },
      { count: 16, center: CITY, ring: [6, 22], spacing: 2.5, face: [0, -6], children: 0.2, seed: 52, avoid: [{ r: 6, x: CITY[0], z: CITY[1] }] },
    ],
  },

  custom(ctx) {
    well(ctx, { x: WELL[0], z: WELL[1], r: 1.3 });
    camels.forEach(([x, z, rot], i) => camel(ctx, { x, z, rot, kneel: true, color: i % 3 ? '#c49c6c' : '#b08458', blanket: ['#8a2e24', '#2e4a7a', '#a8742a'][i % 3], packs: i % 2 === 0 }));

    const r = ctx.rand;
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 22;
      const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d * 0.8;
      if (Math.hypot(x - CITY[0], z - CITY[1]) < 5) continue;
      house(ctx, { x, z, rot: r.range(-0.2, 0.2), w: r.range(5, 8), d: r.range(4, 7), h: r.range(3, 5.5), color: r.pick(['#c8a478', '#b8946a', '#d0ae84']) });
    }
    house(ctx, { x: CITY[0], z: CITY[1], w: 10, d: 8, h: 8, color: '#c09a6e' });

    const rebekah = person(ctx, { x: REBEKAH[0], z: REBEKAH[1], face: SERVANT, robe: '#2e5a8a', mantle: '#e8d8b8', skin: '#a87652', hood: true, arms: 'out' });
    const ry = rebekah.position.y;
    jar(ctx, { x: REBEKAH[0] + 0.3, z: REBEKAH[1] + 0.42, y: ry + 0.92, tilt: 0.5, scale: 1.05 });
    person(ctx, { x: SERVANT[0], z: SERVANT[1], face: REBEKAH, pose: 'bow', robe: '#c4ac84', mantle: '#8a3a2a', skin: '#8a5a3c' });

    const women = [[-4, -24, '#8a3a4a'], [-6.5, -32, '#6a4a7a'], [-3.2, -40, '#b08a4a'], [-8, -47, '#4a6a5a'], [-3.6, -8.2, '#a05a3a']];
    women.forEach(([x, z, robe], i) => {
      const w = person(ctx, { x, z, face: i === 4 ? WELL : [x + 2, z + 10], robe, mantle: '#d8c8a8', skin: '#a87652', hood: true });
      jar(ctx, { x: x + 0.28, z, y: w.position.y + 1.55, color: '#a8603a' });
    });
    for (const [x, z] of [[-1.6, -4.0], [1.6, -8.5], [2.2, -8.9]]) jar(ctx, { x, z, scale: 0.9 });
    tufts(ctx, { center: [0, -6], ring: [4, 40], count: 180, avoid: [[WELL[0], WELL[1], 4]] });
  },
};
