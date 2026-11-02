// Matthew 5-7. A green hillside above the Sea of Galilee in spring. Jesus teaches from a rock with the twelve
// close by; the multitude sits on the grass below among the lilies of the field. +z runs downhill to the lake.
import * as K from './lib/nt-07-kit.js';

const CHRIST = [0, -30];
const HILL = [0, -70];

const slope = [[150, -4], [125, -1], [100, 2], [80, 6], [60, 12], [40, 19], [20, 25]].map(([r, height]) => ({ x: HILL[0], z: HILL[1], r, falloff: 22, height }));

const twelve = Array.from({ length: 12 }, (_, i) => {
  const a = Math.PI / 2 + ((i - 5.5) / 11) * 2.2;
  return [CHRIST[0] + Math.cos(a) * 3.4, CHRIST[1] + Math.sin(a) * 3.0];
});

export default {
  title: 'Matthew 5-7: The Sermon on the Mount',
  seed: 11,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.5, 0.6, 0.5], color: '#fff0d4', intensity: 2.8 },
  light: { sky: '#a8c4ec', ground: '#5a6a3a', hemi: 1.1 },
  sky: { top: '#3c6cb4', horizon: '#dbe6ee', ground: '#a8b890', sunColor: '#fff4dc', glow: 0.8 },
  fog: { color: '#cdd8dc', near: 100, far: 640 },
  clouds: { count: 40, shadow: '#a4b0c4', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [140, 280], hole: 0.2 },
  mountains: { count: 46, color: '#6e7462', radius: [520, 760], height: [40, 110], haze: 0.62 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.0, contrast: 1.05, vignette: 0.36, shadowTint: '#2c3458', highlightTint: '#fff0d4' },
  shadow: { center: [0, -10], radius: 55 },

  player: { start: [4.4, -6], yaw: 0.17, pitch: 0.13, eye: 1.65, speed: 4 },

  terrain: {
    size: 1200, segments: 220, seed: 71, hills: 12, bumps: 0.35,
    flats: [...slope, { x: 0, z: 280, r: 180, falloff: 50, height: -22 }],
    colors: { ground: '#7d8a4c', groundAlt: '#6e7c44', grass: '#8a9050', high: '#86905a', rock: '#7a7058' },
    patches: [
      { x: 30, z: 40, r: 30, color: '#a8a058', strength: 0.5, rough: 0.5 },
      { x: -40, z: -10, r: 24, color: '#6a7e3c', strength: 0.5, rough: 0.5 },
      { x: 0, z: 95, r: 40, color: '#a89a78', strength: 0.6, rough: 0.6 },
    ],
  },

  objects: [
    { type: 'rock', x: CHRIST[0], z: CHRIST[1] - 0.2, size: 1.3, color: '#9a8e78' },
    { type: 'rock', x: -14, z: -44, size: 2.2, color: '#8d8270' },
    { type: 'rock', x: 16, z: -50, size: 2.6, color: '#8d8270' },
    { type: 'tree', x: -10, z: -48, h: 6, kind: 'broad', leaf: '#6f8448' },
    { type: 'tree', x: 12, z: -38, h: 5.5, kind: 'broad', leaf: '#7b8a5a' },
  ],

  scatter: [
    { type: 'tree', count: 70, center: CHRIST, ring: [50, 240], spacing: 9, seed: 8, avoid: [{ rect: [0, 110, 400, 200] }], props: { kind: 'broad', leaf: '#6f8448', h: 5 } },
    { type: 'rock', count: 40, center: CHRIST, ring: [48, 200], spacing: 12, seed: 10, props: { size: 1.6, color: '#8d8270' } },
  ],

  crowd: {
    palette: K.palette,
    groups: [
      { count: 900, center: CHRIST, ring: [6.5, 36], arc: [Math.PI / 2 - 1.05, Math.PI / 2 + 1.05], spacing: 0.95, face: CHRIST, children: 0.22, kneel: 1, seed: 81, avoid: Array.from({ length: 14 }, (_, i) => ({ r: 1.1, x: 4.4 - i * 0.3, z: -6 - i * 1.5 })) },
      { count: 120, center: CHRIST, ring: [36, 42], arc: [Math.PI / 2 - 0.9, Math.PI / 2 + 0.9], spacing: 1.2, face: CHRIST, children: 0.2, seed: 82 },
    ],
  },

  figures: [K.christ(CHRIST[0], CHRIST[1], [0, 20], { arms: 'out', halo: { size: 5, opacity: 0.4, color: '#fff3d6' } })],

  custom(ctx) {
    const r = ctx.rand;
    K.water(ctx, { y: -17, size: 1200, z: 300, color: '#4a8aa0', opacity: 0.92, amp: 0.1, segments: 100 });
    for (const [x, z] of twelve) {
      K.seated(ctx, { x, z, face: [CHRIST[0], CHRIST[1] + 6], seat: 0.05, robe: r.pick(K.palette.robes), mantle: r() < 0.6 ? r.pick(K.palette.mantles) : undefined, skin: r.pick(K.palette.skins) });
    }
    const inCrowd = (x, z) => {
      const d = Math.hypot(x - CHRIST[0], z - CHRIST[1]);
      return d < 4;
    };
    K.flowers(ctx, { center: [0, -10], radius: 75, count: 2200, colors: ['#f4f0e4', '#e8e0f0', '#d84a6a', '#f2c94c', '#b07ad8', '#ffffff'], avoid: inCrowd });
    K.grass(ctx, { center: [0, -20], radius: 70, count: 2500, color: '#7a8c48', avoid: inCrowd });
    K.birds(ctx, { center: [10, -20], height: 30, radius: 26, count: 10, color: '#2a2420', speed: 0.18, size: 0.5 });
    K.birds(ctx, { center: [-20, 10], height: 24, radius: 14, count: 6, color: '#4a3e34', speed: -0.25, size: 0.35, seed: 8 });
    for (let i = 0; i < 6; i++) K.boat(ctx, { x: r.range(-120, 120), z: r.range(140, 260), rot: r() * 6, y: -17, bob: 0.5, walk: false });
  },
};
