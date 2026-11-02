// 1 Nephi 2:4-10: Lehi's family camps in the valley of Lemuel by a river that runs into the Red Sea.
// The valley runs north-south between rocky ridges. The river flows toward -z, into the sea.
import * as THREE from 'three';
import { tent, fire, river, water, channelFlats, camel, goat, jar, bundle, person, ridge, box } from './lib/bom-01-kit.js';

const RIVER = [[-10, 220], [-14, 150], [-6, 90], [-14, 40], [-10, 0], [-16, -50], [-8, -100], [-12, -140]];
const ALTAR = [-2, -14];
const LEHI = [-3, 3];

const sides = (x) => Array.from({ length: 16 }, (_, i) => ({ x: x + Math.sin(i * 1.7) * 10, z: 240 - i * 32, r: 24, falloff: 42, height: 26 + (i % 3) * 7 }));

export default {
  title: "1 Nephi 2:4-10: Lehi's family leaves for the wilderness",
  seed: 202,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.5, 0.75, 0.3], color: '#ffc98a', intensity: 3.0 },
  light: { sky: '#9fb2d8', ground: '#7a5038', hemi: 1.0 },
  sky: { top: '#4a6aa8', horizon: '#f2c48c', ground: '#c89a72', sunColor: '#ffe0a8', glow: 1.2 },
  fog: { color: '#e0b48c', near: 90, far: 600 },
  clouds: { count: 30, shadow: '#8a7a88', lit: '#ffd8a0', rim: '#fff4dc', distance: [300, 900], altitude: [120, 240], hole: 0.2 },
  mountains: { count: 44, color: '#8a5a44', radius: [460, 700], height: [50, 130], haze: 0.45 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.38, shadowTint: '#3a2a50', highlightTint: '#ffe2b8' },
  shadow: { center: [0, -6], radius: 60 },

  player: { start: [7, 16], yaw: 0.3, pitch: -0.03, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 23,
    hills: 30,
    bumps: 0.3,
    flats: [
      { x: 0, z: 0, r: 60, falloff: 40, height: 0 },
      { x: 0, z: 120, r: 50, falloff: 40, height: 0.5 },
      { x: 0, z: -80, r: 40, falloff: 30, height: -0.3 },
      ...sides(-112),
      ...sides(112),
      { x: 0, z: -260, r: 150, falloff: 60, height: -4 },
      ...channelFlats(RIVER, { r: 3.2, falloff: 5, depth: 1.5, step: 4 }),
    ],
    colors: { ground: '#c49a6c', groundAlt: '#b08458', grass: '#8a8a4a', high: '#a86a4a', rock: '#8e5a42' },
    patches: [
      { x: 14, z: 0, r: 30, color: '#b89a74', strength: 0.5, rough: 0.4 },
      { x: -12, z: 30, r: 16, color: '#7a8a46', strength: 0.6, rough: 0.6 },
      { x: -14, z: -40, r: 14, color: '#7a8a46', strength: 0.6, rough: 0.6 },
      { x: -10, z: -110, r: 18, color: '#7a8a46', strength: 0.5, rough: 0.6 },
      { x: 0, z: -110, r: 50, color: '#dcc49a', strength: 0.8, rough: 0.4 },
    ],
  },

  scatter: [
    { type: 'tree', count: 40, center: [-10, 0], ring: [5, 120], spacing: 4, seed: 19, avoid: [{ rect: [12, 4, 34, 40] }, { rect: [4, 10, 12, 16] }], props: { kind: 'broad', h: 1.3, leaf: '#6f7a3a' } },
    { type: 'tree', count: 25, points: [[-22, 36], [-3, 28], [-24, 12], [-4, 55], [-26, -20], [-2, -36], [-26, -48], [-4, -70], [-22, -90], [0, -100], [-26, -130], [-2, -150], [-24, -165], [-4, 80], [-24, 100], [-2, 120], [-26, 70], [-30, -8], [-1, -125], [-28, 50], [4, -190], [-24, -200], [-30, 140], [2, 150], [-31, -110]], props: { kind: 'palm', h: 7.5, leaf: '#5d7a36' } },
    { type: 'tree', count: 14, center: [0, -20], ring: [30, 110], spacing: 14, seed: 6, avoid: [{ rect: [-10, 0, 30, 400] }, { rect: [18, 4, 40, 50] }], props: { kind: 'broad', h: 3.2, leaf: '#7a7f42' } },
    { type: 'rock', count: 50, center: [0, -20], ring: [35, 200], spacing: 10, seed: 7, avoid: [{ rect: [-10, 0, 30, 500] }], props: { color: '#9a6a4e' } },
    { type: 'rubble', count: 16, center: [10, 0], ring: [10, 60], seed: 8, avoid: [{ rect: [-10, 0, 14, 500] }], props: { color: '#a07a5a', count: 5, radius: 2, size: [0.12, 0.35] } },
  ],

  custom(ctx) {
    ridge(ctx, { path: [[-58, 210], [-60, 100], [-56, 0], [-62, -90]], size: [5, 10], color: '#94604a', step: 11 });
    ridge(ctx, { path: [[60, 210], [62, 100], [58, 0], [62, -90]], size: [5, 10], color: '#94604a', step: 11 });
    river(ctx, { path: RIVER, width: 7, y: -0.75, color: '#4f8a94' });
    water(ctx, { x: 0, z: -300, w: 900, d: 300, y: -0.9, color: '#3a7a92', opacity: 0.95, amp: 0.18, seg: 6 });

    // The camp: tents on the east bank, Lehi's in front.
    const tents = [
      { x: 12, z: -6, rot: -0.9, w: 6, d: 7, h: 2.9, color: '#3e2f26', stripe: '#6e5640' },
      { x: 24, z: 6, rot: -1.3, w: 5, d: 6, h: 2.5, color: '#4a3a2c', stripe: '#c0a070' },
      { x: 20, z: -16, rot: -0.6, w: 5, d: 6, h: 2.5, color: '#5a4636', stripe: '#a08060' },
      { x: 30, z: -6, rot: -1.6, w: 4.5, d: 5.5, h: 2.3, color: '#3a2c22', stripe: '#9a7050' },
    ];
    for (const t of tents) tent(ctx, t);
    fire(ctx, { x: 17, z: 2, scale: 0.9, light: 6, distance: 10, smoke: 0 });

    // Altar of stones by the river, with a thin offering smoke.
    const ay = ctx.heightAt(...ALTAR) - 0.2;
    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 7 - i * 2; k++) {
        const a = (k / (7 - i * 2)) * Math.PI * 2 + i;
        const rad = 1 - i * 0.3;
        ctx.solid.add(new THREE.DodecahedronGeometry(0.42, 0), { position: [ALTAR[0] + Math.cos(a) * rad, ay + 0.3 + i * 0.45, ALTAR[1] + Math.sin(a) * rad], rotation: [k, k * 2, 0], scale: [1, 0.75, 1], color: '#a89a88', jitter: 0.1 });
      }
    }
    ctx.colliders.add({ x: ALTAR[0], z: ALTAR[1], w: 2.4, d: 2.4, bottom: ay, top: ay + 1.4 });
    ctx.glow.add(new THREE.ConeGeometry(0.25, 0.6, 5), { position: [ALTAR[0], ay + 1.6, ALTAR[1]], color: '#ff9a3a' });
    ctx.effects.smoke({ position: [ALTAR[0], ay + 1.8, ALTAR[1]], count: 10, height: 16, size: 0.3, color: '#d8d0c8', wind: [-0.4, -0.3], seed: 7 });

    // Lehi at the river, arm outstretched over it, speaking to Laman and Lemuel.
    person(ctx, { x: LEHI[0], z: LEHI[1], face: [-14, -10], robe: '#e2d6bc', mantle: '#5a6a8a', skin: '#a8754f', arms: 'out', hood: true });
    person(ctx, { x: LEHI[0] + 3, z: LEHI[1] + 1.2, face: [LEHI[0], LEHI[1]], robe: '#7a4e36', mantle: '#a34f32', skin: '#9b6a46' });
    person(ctx, { x: LEHI[0] + 2.4, z: LEHI[1] + 2.8, face: [LEHI[0], LEHI[1]], robe: '#6e5a44', mantle: '#3f4d5e', skin: '#9b6a46' });
    // Sariah, Sam and Nephi near the tents.
    person(ctx, { x: 14, z: 3.5, face: [17, 2], robe: '#8a5a6a', mantle: '#c9b48e', skin: '#a87652', hood: true });
    person(ctx, { x: 19.5, z: 4, face: [17, 2], robe: '#a0825c', mantle: '#556246', skin: '#9b6a46' });
    person(ctx, { x: 6, z: -8, face: [LEHI[0], LEHI[1]], robe: '#c4b090', mantle: '#7d5c3e', skin: '#a87652' });

    camel(ctx, { x: 30, z: 14, rot: -2.2, sitting: true });
    camel(ctx, { x: 35, z: 6, rot: -1.8, color: '#a07a50' });
    camel(ctx, { x: 33, z: -16, rot: 0.4, color: '#bc9464', sitting: true });
    for (const [x, z] of [[32, -2], [34, 2], [31, 4], [35, -4], [33, 8]]) goat(ctx, { x, z, rot: ctx.rand() * 6, color: ctx.rand.pick(['#4a3a30', '#8a7a66', '#ddd0b8']), scale: 0.8 });
    for (let i = 0; i < 12; i++) {
      const x = 10 + ctx.rand() * 24, z = -14 + ctx.rand() * 26;
      if (tents.some((t) => Math.hypot(t.x - x, t.z - z) < 4.5) || Math.hypot(x - 17, z - 2) < 2) continue;
      if (ctx.rand() < 0.5) jar(ctx, { x, z, size: 0.55 });
      else bundle(ctx, { x, z, size: 0.75, color: ctx.rand.pick(['#9a8462', '#7a5a3c', '#b8a07a']) });
    }
    box(ctx, { x: 26, z: -2, y: ctx.heightAt(26, -2), w: 1.6, h: 0.5, d: 0.9, rot: 0.3, color: '#6a4a30' });
  },
};
