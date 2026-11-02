// Alma 14: in Ammonihah the believers' records were burned in the plaza. Later the Lord breaks the
// prison walls; Alma and Amulek walk out of the rubble unharmed while the people flee. -z is north.
import { campfire, house, jar, rng } from './lib/bom-19-kit.js';

const PRISON = [0, -34];
const PIT = [-8, -23];
const stone = '#b8a282';

const fleeing = Array.from({ length: 8 }, (_, i) => {
  const a = Math.PI * (-0.05 + (i / 7) * 1.1);
  const out = [PRISON[0] + Math.cos(a) * 200, PRISON[1] + Math.sin(a) * 200];
  return { count: 13, center: PRISON, ring: [11, 46], arc: [a - 0.2, a + 0.2], spacing: 1.3, face: out, children: 0.15, seed: 60 + i, avoid: [{ r: 7, x: PIT[0], z: PIT[1] }, { r: 8, x: 4, z: -10 }, { rect: [3, -22, 12, 18] }] };
});

export default {
  title: 'Alma 14: Alma and Amulek in Ammonihah',
  seed: 22,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.5, 0.55, 0.45], color: '#ffd6a0', intensity: 2.8 },
  light: { sky: '#a8b0c8', ground: '#7a6048', hemi: 1.2 },
  sky: { top: '#5a6a8a', horizon: '#e0c4a0', ground: '#c8a888', sunColor: '#ffe0b0', glow: 0.8 },
  fog: { color: '#cfb498', near: 50, far: 460 },
  clouds: { count: 12, shadow: '#7a7080', lit: '#e8c8a0', rim: '#fff0d0', distance: [500, 1000], altitude: [100, 240], hole: 0.3 },
  mountains: { count: 40, color: '#7a6a5e', radius: [480, 720], height: [50, 130], haze: 0.5 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.08, contrast: 1.08, vignette: 0.42, shadowTint: '#3a2e4e', highlightTint: '#ffe6c4' },
  shadow: { center: [0, -18], radius: 60 },

  player: { start: [4, -10], yaw: 0.12, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 22,
    hills: 26,
    bumps: 0.25,
    flats: [{ x: 0, z: -20, r: 80, falloff: 40, height: 0 }],
    colors: { ground: '#a88e6a', groundAlt: '#9a8462', grass: '#7c7c46', high: '#8f7c5c', rock: '#776656' },
    patches: [
      { x: 0, z: -14, r: 40, color: '#c4ac88', strength: 0.7, rough: 0.3 },
      { x: PIT[0], z: PIT[1], r: 6, color: '#3a302a', strength: 0.85, rough: 0.5 },
      { x: PRISON[0], z: PRISON[1], r: 14, color: '#a89478', strength: 0.6, rough: 0.6 },
    ],
  },

  objects: [
    { type: 'pavement', x: 0, z: -12, w: 44, d: 36, tile: 2.2, color: '#c8b08c', damage: 0.3, holes: [{ x: PIT[0], z: PIT[1], r: 4.5 }, { x: 0, z: -30, r: 7 }] },
    { type: 'wall', x: PRISON[0] - 7, z: PRISON[1], len: 11, h: 5.5, thick: 1, damage: 0.6, color: stone },
    { type: 'wall', x: PRISON[0] + 7, z: PRISON[1] - 0.5, len: 11, h: 5.5, thick: 1, damage: 0.65, color: stone },
    { type: 'wall', x: PRISON[0], z: PRISON[1] - 5.6, rot: Math.PI / 2, len: 14, h: 5.5, thick: 1, damage: 0.5, color: stone },
    { type: 'toppledWall', x: PRISON[0] - 4, z: PRISON[1] + 6.5, rot: Math.PI / 2 + 0.2, len: 7, h: 3, color: stone },
    { type: 'toppledWall', x: PRISON[0] + 5, z: PRISON[1] + 6.2, rot: Math.PI / 2 - 0.15, len: 6, h: 3, color: stone },
    { type: 'rubble', x: PRISON[0], z: PRISON[1], radius: 9, count: 60, size: [0.25, 0.8], color: stone },
    { type: 'rubble', x: PRISON[0] - 9, z: PRISON[1] + 3, radius: 4, count: 14, size: [0.3, 0.9], color: stone },
    { type: 'rubble', x: PRISON[0] + 9, z: PRISON[1] + 2, radius: 4, count: 14, size: [0.3, 0.9], color: stone },
    { type: 'smolder', x: PIT[0], z: PIT[1], radius: 3.6, smoke: 0 },
    { type: 'crack', path: [[6, -27], [12, -20], [20, -16], [30, -6]], width: 0.4, branches: 3 },
    { type: 'steppedPyramid', x: -62, z: -100, w: 40, d: 36, tiers: 5, tierHeight: 3.4, inset: 2.6, stairWidth: 8, color: '#b8a282', trim: '#8c765c', shrine: { w: 10, d: 8, h: 4.5, roof: '#6a5644' } },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -20], ring: [90, 280], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#5a7038' } },
    { type: 'tree', count: 10, center: [0, -20], ring: [30, 60], spacing: 8, seed: 18, avoid: [{ rect: [0, -12, 50, 42] }], props: { kind: 'palm' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#4f5a6b', '#7a2e2a', '#3e4a6a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#c9b48e', '#6d3b2e', '#c8a050'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.7,
      hoodChance: 0.2,
    },
    groups: fleeing,
  },

  figures: [
    { x: PRISON[0] - 0.9, z: PRISON[1] + 1, face: [4, -10], robe: '#e8dcc4', mantle: '#8a6a44', skin: '#a87652', arms: 'out', emissive: 0.08 },
    { x: PRISON[0] + 0.9, z: PRISON[1] + 1.2, face: [4, -10], robe: '#d8cab0', mantle: '#5a6a7a', skin: '#9b6a46', emissive: 0.08 },
  ],

  effects: [
    { type: 'ring', at: [PRISON[0], PRISON[1] + 1], lift: 0.1, radius: 2.2, width: 1, color: '#ffe8b8', opacity: 0.45 },
    { type: 'sunShafts', center: [0, -40], count: 4, spread: 30, length: 300, width: [8, 16], opacity: 0.05 },
  ],

  custom(ctx) {
    const r = rng(2222);
    campfire(ctx, PIT[0], PIT[1], { scale: 1.6, intensity: 30, distance: 16 });
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = r.range(0.8, 3);
      const x = PIT[0] + Math.cos(a) * d, z = PIT[1] + Math.sin(a) * d;
      if (r() < 0.5) {
        ctx.solid.add(new ctx.THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), { position: [x, ctx.heightAt(x, z) + 0.08, z], rotation: [Math.PI / 2, r() * 6, 0], color: r.pick(['#2a221c', '#5a4a36', '#c8b48a']) });
      } else {
        ctx.solid.box(0.4, 0.08, 0.3, { position: [x, ctx.heightAt(x, z) + 0.05, z], rotation: [r.range(-0.2, 0.2), r() * 6, 0], color: r.pick(['#1e1814', '#3a2e24', '#b8a07a']) });
      }
    }

    for (const [x, z, s] of [[-7, -38, 1.1], [7, -39, 1.2], [-11, -32, 0.8], [11, -33, 0.9]]) {
      ctx.effects.smoke({ position: [x, ctx.heightAt(x, z) + 0.5, z], count: 3, height: 9, size: s, color: '#c8b090', wind: [0.4, -0.2], seed: Math.floor(r() * 1e6) });
    }

    const ring = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const rx = 38 + r.range(0, 10), rz = 30 + r.range(0, 10);
      ring.push([Math.cos(a) * rx, -14 + Math.sin(a) * rz, a]);
    }
    for (const [x, z, a] of ring) {
      if (z > 6 && Math.abs(x) < 16) continue;
      if (Math.abs(x) < 10 && z < -50) continue;
      house(ctx, x, z, Math.atan2(-x, -14 - z) + r.range(-0.15, 0.15), { w: r.range(6, 9), d: r.range(5, 7), h: r.range(3, 4.2), color: r.pick(['#c8b08a', '#bca480', '#d0bc98']), roof: '#8a7050' });
    }
    for (const [x, z] of [[-18, 4], [18, -2], [20, 3]]) jar(ctx, x, z, { color: '#a86a44', scale: 1.4 });
  },
};
