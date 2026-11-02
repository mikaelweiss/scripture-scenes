// 3 Nephi 19:4-14: the morning after Christ's first visit. The multitude kneels in twelve bodies
// while the Twelve, newly baptized, stand at the water's edge encircled as if by fire, and angels
// come down to minister to them. -z is north, out over the water.
import { water, fire, angel, person } from './lib/bom-43-kit.js';

const SHORE_Z = 7;
const WATER_Y = -0.35;

const disciples = Array.from({ length: 12 }, (_, i) => {
  const t = (i - 5.5) / 5.5;
  return { x: t * 19, z: SHORE_Z - 1.2 + Math.abs(t) * 2.2 };
});

const bodies = Array.from({ length: 12 }, (_, i) => {
  const row = Math.floor(i / 4), col = i % 4;
  return [(col - 1.5) * 21 + (row % 2) * 6 - 3, 24 + row * 17];
});

const angels = [
  [-14, 4, 9], [-6, 2, 13], [3, 3, 10], [11, 5, 14], [18, 3, 8.5], [-20, 6, 15], [7, 0, 18], [-2, 6, 7.5],
];

export default {
  title: '3 Nephi 19:4-14: The Twelve encircled by fire',
  seed: 44,
  fov: 60,
  exposure: 1.02,

  sun: { direction: [-0.55, 0.42, 0.72], color: '#ffe0b0', intensity: 2.8 },
  light: { sky: '#a8c4ec', ground: '#6a5a40', hemi: 1.1 },
  sky: { top: '#4f7bc0', horizon: '#f6d8b0', ground: '#c8b08c', sunColor: '#fff0c8', glow: 1.1 },
  fog: { color: '#c9d2d0', near: 110, far: 700 },
  clouds: { count: 45, shadow: '#8a8fa8', lit: '#fff0d8', rim: '#ffffff', distance: [260, 900], altitude: [100, 260], hole: 0.4 },
  mountains: { count: 40, color: '#5f6e74', radius: [520, 760], height: [40, 130], haze: 0.6 },
  bloom: { strength: 0.45, radius: 0.55, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.35, shadowTint: '#2c3460', highlightTint: '#fff0d0' },
  shadow: { center: [0, 20], radius: 70 },

  player: { start: [-31, 17], yaw: -1.42, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100, segments: 220, seed: 19, hills: 22, bumps: 0.25,
    flats: [
      { x: 0, z: 45, r: 60, falloff: 40, height: 0.9 },
      { x: 0, z: 75, r: 30, falloff: 40, height: 3.5 },
      { x: 0, z: -150, r: 140, falloff: 26, height: -3.2 },
    ],
    colors: { ground: '#8a8a52', groundAlt: '#7a8048', grass: '#6f8a44', high: '#7f7c5a', rock: '#7a6e5c' },
    patches: [
      { x: 0, z: 8, r: 26, color: '#c9b88e', strength: 0.8, rough: 0.4 },
      { x: -30, z: 10, r: 18, color: '#c4b28a', strength: 0.7, rough: 0.5 },
      { x: 30, z: 10, r: 18, color: '#c4b28a', strength: 0.7, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'rock', x: 27, z: 11, size: 1.8 },
    { type: 'rock', x: 34, z: 5, size: 2.6 },
  ],

  scatter: [
    { type: 'tree', count: 70, center: [0, 30], ring: [80, 300], arc: [-0.3, Math.PI + 0.3], spacing: 7, seed: 8, props: { kind: 'broad', leaf: '#5d7f3a' } },
    { type: 'tree', count: 26, center: [0, 30], ring: [70, 160], arc: [-0.3, Math.PI + 0.3], spacing: 7, seed: 9, props: { kind: 'palm', leaf: '#6a8a3c' } },
    { type: 'rock', count: 30, center: [0, 30], ring: [90, 320], arc: [0, Math.PI], spacing: 10, seed: 10, props: {} },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#9a4a34'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.6, hoodChance: 0.3,
    },
    groups: bodies.map(([x, z], i) => ({
      count: 120, center: [x, z], ring: [0, 6.6], spacing: 0.9, face: [x * 0.6, SHORE_Z], children: 0.2, kneel: 0.75, seed: 60 + i,
      
    })),
  },

  effects: [
    { type: 'beam', at: [0, SHORE_Z], height: 300, radiusBottom: 20, radiusTop: 34, color: '#fff3d4', opacity: 0.12 },
    { type: 'motes', at: [0, SHORE_Z], radius: 22, height: 30, count: 260 },
    { type: 'sunShafts', center: [-60, 80], count: 6, spread: 90, length: 500, width: [10, 24], opacity: 0.05 },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { y: WATER_Y, size: 900, center: [0, -300], color: '#4f8f9a', opacity: 0.9, amp: 0.12 });
    // Keep the walker out of deep water.
    ctx.colliders.add({ x: 0, z: 3, w: 600, d: 2, bottom: -20, top: 30 });

    // Reeds along the shore.
    const r = ctx.rand;
    for (let i = 0; i < 160; i++) {
      const x = r.range(-90, 90);
      if (Math.abs(x) < 26) continue;
      const z = r.range(0, 9);
      const h = r.range(0.6, 1.5);
      ctx.solid.add(new THREE.ConeGeometry(0.05, h, 3), { position: [x, ctx.heightAt(x, z) + h / 2, z], rotation: [r.range(-0.2, 0.2), 0, r.range(-0.2, 0.2)], color: r.pick(['#6f8a44', '#8a9a52', '#5d7a3a']) });
    }

    disciples.forEach((d, i) => {
      const y = Math.max(ctx.heightAt(d.x, d.z), WATER_Y - 0.25);
      person(ctx, { x: d.x, z: d.z, y, face: [d.x * 0.5, 30], robe: '#f2ecdc', mantle: i % 3 ? '#e2d6bc' : undefined, skin: '#9b6a46', arms: i % 2 ? 'out' : 'down' });
      fire(ctx, { x: d.x, z: d.z, y: y + 0.05, radius: 0.85, count: 12, height: 1.4, ring: true, colors: ['#ffb347', '#ffd27a', '#ff8f3a'], opacity: 0.5, seed: 100 + i });
      ctx.effects.ring({ position: [d.x, y + 0.08, d.z], radius: 0.95, width: 0.5, color: '#ffd890', opacity: 0.9 });
      ctx.effects.halo({ position: [d.x, y + 1.2, d.z], size: 3.4, opacity: 0.4, color: '#ffe6b0' });
    });
    const glow = new THREE.PointLight('#ffe2a8', 60, 40, 1.4);
    glow.position.set(0, 3, SHORE_Z);
    ctx.scene.add(glow);

    angels.forEach(([x, z, y], i) => angel(ctx, { x, z, y, face: [x * 0.4, 30], scale: 1.15, arms: 'out', light: 0, halo: 5, bob: 0.35, phase: i * 0.9 }));
  },
};
