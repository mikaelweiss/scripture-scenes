// Jacob 7: Sherem, who demanded a sign, is struck down by the power of the Lord in the public square
// of the city of Nephi. Jacob stands over him while the people gather. -z is north toward the temple.
import { house, person, broadTree, faceYaw } from './lib/bom-13-kit.js';

const SQUARE = [0, -8];
const JACOB = [0, -13.2];
const SHEREM = [0.6, -9.2];
const TEMPLE = [0, -62];

const stone = '#c2ab86';
const trim = '#8f7a5e';

const houses = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + 0.17;
  return { x: SQUARE[0] + Math.cos(a) * 38, z: SQUARE[1] + Math.sin(a) * 34, a };
}).filter(({ x, z }) => !(Math.abs(x) < 14 && z > 0) && !(Math.abs(x) < 16 && z < -30));

export default {
  title: 'Jacob 7: Sherem confronts Jacob',
  seed: 13,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.55, 0.62, 0.35], color: '#fff0d4', intensity: 2.8 },
  light: { sky: '#a9c4e8', ground: '#6a5a40', hemi: 1.05 },
  sky: { top: '#4f7fbf', horizon: '#d9e3e6', ground: '#c9b593', sunColor: '#fff4d8', glow: 0.8 },
  fog: { color: '#cfd8d8', near: 90, far: 620 },
  clouds: { count: 50, shadow: '#9aa4b4', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [120, 260], hole: 0.2 },
  mountains: { count: 40, color: '#6f7f74', radius: [480, 720], height: [60, 170], haze: 0.45 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.08, contrast: 1.05, vignette: 0.35, shadowTint: '#2c3048', highlightTint: '#fff2d8' },
  shadow: { center: [0, -10], radius: 70 },

  player: { start: [2.2, -3.6], yaw: 0.14, pitch: -0.04, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 31,
    hills: 30,
    bumps: 0.25,
    flats: [{ x: 0, z: -20, r: 70, falloff: 40, height: 0 }],
    colors: { ground: '#8f8a52', groundAlt: '#7c8048', grass: '#6c8a42', high: '#7d7a58', rock: '#7a6c58' },
    patches: [{ x: SQUARE[0], z: SQUARE[1] - 6, r: 34, color: '#b9a37f', strength: 0.9, rough: 0.2 }],
  },

  objects: [
    {
      type: 'steppedPyramid', x: TEMPLE[0], z: TEMPLE[1], w: 34, d: 30, tiers: 4, tierHeight: 3, inset: 2.6, stairWidth: 7,
      color: stone, trim, stairColor: '#d0bc98',
      shrine: { w: 11, d: 8, h: 4.6, door: 2.4, roof: '#7a644c' },
    },
    { type: 'steppedPyramid', x: JACOB[0], z: JACOB[1] - 0.6, w: 7, d: 5, tiers: 2, tierHeight: 0.45, inset: 0.8, stairWidth: 2.4, color: '#d6c29e', trim },
    { type: 'pavement', x: SQUARE[0], z: SQUARE[1] - 4, w: 52, d: 46, tile: 1.7, color: '#cdb893', damage: 0.05 },
    { type: 'pavement', x: 0, z: -40, w: 8, d: 14, tile: 2, color: '#cdb893', damage: 0.02 },
    ...[-1, 1].flatMap((side) => [0, 1, 2].map((i) => ({ type: 'column', x: side * 9, z: -34 - i * 6, h: 5, color: stone, broken: false }))),
  ],

  scatter: [
    { type: 'tree', count: 50, center: SQUARE, ring: [62, 200], spacing: 7, seed: 4, props: { kind: 'broad', leaf: '#557d36' } },
    { type: 'tree', count: 24, center: SQUARE, ring: [50, 120], spacing: 8, seed: 5, props: { kind: 'palm', leaf: '#5d8a3a' } },
    { type: 'rock', count: 26, center: SQUARE, ring: [90, 300], spacing: 12, seed: 6, props: { color: '#8a7e6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#c4b090', '#d8cdb5', '#94704e', '#6b6f4a', '#4f5a6b', '#9a4a34', '#e2d6bc'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#556246', '#2f5a6e'],
      skins: ['#c08a62', '#b07a55', '#c9976e', '#a8724c', '#d1a17a'],
      mantleChance: 0.6,
      hoodChance: 0.2,
    },
    groups: [
      {
        count: 340, center: SHEREM, ring: [5, 23], spacing: 0.8, face: SHEREM, children: 0.15, kneel: 0.06, seed: 31,
        avoid: [{ rect: [1.2, 4, 7, 22] }, { rect: [0, -13.5, 8, 7] }],
      },
      { count: 60, center: SQUARE, ring: [22, 30], arc: [Math.PI * 1.1, Math.PI * 1.9], spacing: 1.2, face: SHEREM, children: 0.2, seed: 32 },
    ],
  },

  figures: [
    { x: JACOB[0], z: JACOB[1], face: [SHEREM[0], SHEREM[1] + 6], scale: 1.15, robe: '#efe7d4', mantle: '#3e5f86', skin: '#c08a62', arms: 'out' },
  ],

  custom(ctx) {
    for (const h of houses) {
      const rot = faceYaw(h.x, h.z, SQUARE);
      house(ctx, { x: h.x, z: h.z, rot, w: 7 + (Math.abs(Math.sin(h.a * 7)) * 3), d: 6, h: 3.2, color: stone, trim, roof: h.a % 2 > 1 ? 'flat' : 'thatch', roofColor: '#9a7d4e' });
    }
    // Sherem lies where he fell, his fine mantle spread beside him.
    person(ctx, { x: SHEREM[0], z: SHEREM[1], yaw: 1.2, pose: 'lying', robe: '#5c2a3a', mantle: '#c8a24a', skin: '#b07a55' });
    ctx.solid.box(0.9, 0.04, 1.3, { position: [SHEREM[0] - 0.8, ctx.heightAt(SHEREM[0], SHEREM[1]) + 0.12, SHEREM[1] + 0.5], rotation: [0, 0.5, 0], color: '#c8a24a' });
    // Two of Sherem's followers kneel in dismay at his side.
    person(ctx, { x: SHEREM[0] + 1.7, z: SHEREM[1] + 0.6, face: SHEREM, pose: 'kneel', robe: '#4a3a5a', mantle: '#8a6a3a', skin: '#b07a55' });
    person(ctx, { x: SHEREM[0] - 1.4, z: SHEREM[1] + 1.4, face: SHEREM, pose: 'kneel', robe: '#7a4e36', skin: '#a8724c', hood: true });
    // Market awnings on the square's edges.
    for (const [x, z, rot, col] of [[-19, -2, 1.4, '#b5503a'], [19, -4, -1.4, '#d8c8a4'], [-17, -22, 0.9, '#4f6a8a'], [18, -22, -0.9, '#b5503a']]) {
      const y = ctx.heightAt(x, z);
      for (const [px, pz] of [[-1.4, -1], [1.4, -1], [-1.4, 1], [1.4, 1]]) {
        const c = Math.cos(rot), s = Math.sin(rot);
        ctx.solid.add(new ctx.THREE.CylinderGeometry(0.06, 0.06, 2.4, 4), { position: [x + px * c + pz * s, y + 1.2, z - px * s + pz * c], color: '#5a4030' });
      }
      ctx.solid.box(3.4, 0.08, 2.6, { position: [x, y + 2.45, z], rotation: [0.12, rot, 0], color: col });
      ctx.solid.box(2.4, 0.8, 1.2, { position: [x, y + 0.4, z], rotation: [0, rot, 0], color: '#7a5c3e' });
      for (let i = 0; i < 4; i++) ctx.solid.add(new ctx.THREE.IcosahedronGeometry(0.22, 0), { position: [x + (i - 1.5) * 0.45, y + 0.95, z], color: ['#c9a23a', '#a84a2a', '#6a8a3a', '#d8c070'][i] });
      ctx.colliders.add({ x, z, w: 2.6, d: 2.6, rot, bottom: y, top: y + 2.5 });
    }
  },
};
