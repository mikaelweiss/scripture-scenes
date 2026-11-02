// 3 Nephi 18:1-12: at the temple in Bountiful, Jesus breaks and blesses bread and wine,
// gives it to the twelve disciples, and they carry it to the seated multitude.
// Late afternoon of the same day as 3 Nephi 11-17. -z is north toward the temple.
import { person, breadBasket, cup } from './lib/bom-43-kit.js';

const TEMPLE = [0, -70];
const CHRIST = [0, -18.2];
const stone = '#bba482';
const darkStone = '#8c765c';

const disciples = [
  // On the platform beside the table, receiving the bread.
  { x: -2.4, z: -14.2, face: [0, -16.6], arms: 'out' },
  { x: 2.4, z: -14.2, face: [0, -16.6], arms: 'out' },
  { x: -3.4, z: -16.4, face: [0, -16.6], arms: 'out' },
  { x: 3.4, z: -16.4, face: [0, -16.6], arms: 'out' },
  // Among the seated multitude, carrying bread and wine.
  { x: -2.6, z: -4, face: [-5, -3], arms: 'out', basket: true },
  { x: 2.8, z: -6, face: [5, -5], arms: 'out', cup: true },
  { x: -2.8, z: 6, face: [-5, 7], arms: 'out', cup: true },
  { x: 3.2, z: 2, face: [6, 3], arms: 'out', basket: true },
  { x: -12, z: -3, face: [-14, -1], arms: 'out', basket: true },
  { x: 13, z: -7, face: [15, -5], arms: 'out', basket: true },
  { x: -9, z: 12, face: [-10, 15], arms: 'out', cup: true },
  { x: 10, z: 14, face: [11, 17], arms: 'out', basket: true },
];
const discipleRobes = ['#ebe2cc', '#e2d5b6', '#efe6d2', '#ddcfae'];
const keepClear = disciples.map((d) => ({ x: d.x, z: d.z, r: 1.1 }));

export default {
  title: '3 Nephi 18:1-12: The sacrament in Bountiful',
  seed: 43,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.9, 0.24, 0.3], color: '#ffc27e', intensity: 3.0 },
  light: { sky: '#9aaee0', ground: '#6a4e38', hemi: 1.05 },
  sky: { top: '#4e6a9a', horizon: '#f4bf86', ground: '#d8ab86', sunColor: '#ffd9a0', glow: 1.3 },
  fog: { color: '#d8ae8a', near: 80, far: 600 },
  clouds: { count: 50, shadow: '#6a6070', lit: '#f8c588', rim: '#fff1cc', distance: [260, 900], altitude: [90, 240], hole: 0.3 },
  mountains: { count: 44, color: '#62605a', radius: [520, 760], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.5, radius: 0.55, threshold: 0.84 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.4, shadowTint: '#30285e', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -10], radius: 60 },

  player: { start: [0.4, 9], yaw: 0, pitch: -0.03, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100, segments: 200, seed: 12, hills: 24, bumps: 0.3,
    flats: [{ x: 0, z: -24, r: 80, falloff: 40, height: 0 }],
    colors: { ground: '#9c7f58', groundAlt: '#8a6e4e', grass: '#7f8446', high: '#8f7c5c', rock: '#776656' },
    patches: [{ x: 0, z: -26, r: 76, color: '#b49a78', strength: 0.7, rough: 0.3 }],
  },

  objects: [
    {
      type: 'steppedPyramid', x: TEMPLE[0], z: TEMPLE[1], w: 52, d: 46, tiers: 6, tierHeight: 3.4, inset: 2.6, stairWidth: 9,
      color: stone, trim: darkStone, stairColor: '#c7b08c', shrine: { w: 13, d: 9, h: 5.2, door: 2.6, roof: '#7a644c' },
    },
    { type: 'pavement', x: 0, z: 6, w: 3, d: 40, tile: 1.5, color: '#c6ae8a', damage: 0.1 },
    { type: 'steppedPyramid', x: CHRIST[0], z: CHRIST[1] + 1.2, w: 11, d: 8, tiers: 2, tierHeight: 0.5, inset: 0.8, stairWidth: 3, color: '#c9b392', trim: darkStone },
    { type: 'toppledWall', x: 40, z: 30, rot: 0.4, len: 10 },
    { type: 'toppledWall', x: -46, z: 18, rot: 1.6, len: 8 },
    ...[-1, 1].flatMap((side) =>
      Array.from({ length: 5 }, (_, i) => ({ type: 'column', x: side * 30, z: -44 + i * 8, h: 6, color: stone, broken: (i + (side > 0 ? 1 : 0)) % 3 === 0 })),
    ),
  ],

  scatter: [
    { type: 'ruinedHouse', count: 24, center: [0, -20], ring: [90, 190], spacing: 14, seed: 5, props: { color: stone, damage: 0.4 } },
    { type: 'tree', count: 80, center: [0, -20], ring: [70, 320], spacing: 6, seed: 8, props: {} },
    { type: 'rubble', count: 18, center: [0, -20], ring: [60, 140], seed: 7, props: { color: stone, count: 6, radius: 2 } },
    { type: 'rock', count: 30, center: [0, -20], ring: [110, 340], spacing: 10, seed: 10, props: {} },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#9a4a34'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.6, hoodChance: 0.3,
    },
    groups: [
      {
        count: 1700, center: CHRIST, ring: [8, 52], arc: [-0.35, Math.PI + 0.35], spacing: 0.95, face: CHRIST, children: 0.22, kneel: 0.85, seed: 31,
        avoid: [{ rect: [0, 14, 3.2, 44] }, { rect: [CHRIST[0], CHRIST[1] + 1.2, 13, 10] }, { rect: [-30, -24, 3, 44] }, { rect: [30, -24, 3, 44] }, ...keepClear],
      },
      { count: 160, center: CHRIST, ring: [52, 62], arc: [-0.2, Math.PI + 0.2], spacing: 1.3, face: CHRIST, children: 0.15, seed: 32, avoid: [{ rect: [0, 50, 3.2, 30] }] },
    ],
  },

  figures: [
    {
      x: CHRIST[0], z: CHRIST[1] + 2, face: [0, 40], scale: 1.1, robe: '#fbf7ee', mantle: '#f3ecdc', skin: '#a8754f', arms: 'out', emissive: 0.12,
      light: { color: '#fff0cf', intensity: 18, distance: 20 },
      halo: { size: 3.2, opacity: 0.28, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'beam', at: [CHRIST[0], CHRIST[1] + 2], height: 200, radiusBottom: 2.4, radiusTop: 9, color: '#fff1cf', opacity: 0.2 },
    { type: 'motes', at: [CHRIST[0], CHRIST[1] + 2], radius: 4, height: 24, count: 120 },
    { type: 'sunShafts', center: [-40, -120], count: 6, spread: 90, length: 500, width: [10, 24], opacity: 0.06 },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    // Stone table before Jesus with bread and wine.
    const ty = ctx.colliders.ground(CHRIST[0], CHRIST[1], 1000, ctx.heightAt(CHRIST[0], CHRIST[1]), { radius: 0 });
    ctx.solid.box(3.2, 0.9, 1.3, { position: [CHRIST[0], ty + 0.45, CHRIST[1]], color: '#c9b392', jitter: 0.04 });
    ctx.solid.box(3.5, 0.14, 1.5, { position: [CHRIST[0], ty + 0.97, CHRIST[1]], color: '#a48d6c' });
    ctx.colliders.add({ x: CHRIST[0], z: CHRIST[1], w: 3.5, d: 1.5, bottom: ty, top: ty + 1.04 });
    breadBasket(ctx, { x: CHRIST[0] - 0.9, z: CHRIST[1], y: ty + 1.04, size: 1.1 });
    breadBasket(ctx, { x: CHRIST[0] + 0.1, z: CHRIST[1] - 0.2, y: ty + 1.04, size: 0.9 });
    for (let i = 0; i < 4; i++) cup(ctx, { x: CHRIST[0] + 0.7 + (i % 2) * 0.35, z: CHRIST[1] - 0.25 + Math.floor(i / 2) * 0.4, y: ty + 1.04 });
    ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 8), { position: [CHRIST[0] + 1.45, ty + 1.29, CHRIST[1] + 0.1], color: '#8a5a3a' });

    disciples.forEach((d, i) => {
      const gy = ctx.colliders.ground(d.x, d.z, 1000, ctx.heightAt(d.x, d.z), { radius: 0 });
      person(ctx, { ...d, y: gy, robe: discipleRobes[i % 4], mantle: '#7d5c3e', skin: '#9b6a46', scale: 1.02 });
      const dir = Math.atan2(d.face[0] - d.x, d.face[1] - d.z);
      const hx = d.x + Math.sin(dir) * 0.45, hz = d.z + Math.cos(dir) * 0.45;
      const hy = gy + 0.95;
      if (d.basket) breadBasket(ctx, { x: hx, z: hz, y: hy, size: 0.9 });
      if (d.cup) cup(ctx, { x: hx, z: hz, y: hy + 0.05 });
    });

    // Small cups and loaves already shared among those seated nearest the path.
    const r = ctx.rand;
    for (let i = 0; i < 18; i++) {
      const x = r.range(-14, 14), z = r.range(-6, 18);
      if (Math.abs(x) < 2) continue;
      ctx.solid.add(new THREE.SphereGeometry(0.09, 5, 3), { position: [x, ctx.heightAt(x, z) + 0.05, z], scale: [1.3, 0.6, 1], color: '#c99350' });
    }
  },
};
