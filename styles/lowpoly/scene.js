// 3 Nephi 11 and 17: Christ appears to about 2,500 Nephites at the temple in Bountiful,
// shortly after the great destruction. Coordinates are meters, -z is north toward the temple.

const TEMPLE = [0, -66];
const CHRIST = [0, -20];
const PLAZA = [0, -20];

const stone = '#b8a07e';
const darkStone = '#8c765c';

const childRing = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + 0.2;
  return [CHRIST[0] + Math.cos(a) * 2.4, CHRIST[1] + Math.sin(a) * 2.4];
});

const plazaWall = Array.from({ length: 16 }, (_, i) => {
  const a = Math.PI * (0.05 + (i / 15) * 1.9);
  return { type: 'wall', x: PLAZA[0] + Math.cos(a) * 70, z: PLAZA[1] + Math.sin(a) * 70, rot: -a, len: 13, h: 2.6, damage: 0.45 + (i % 3) * 0.2, color: stone };
}).filter((_, i) => i % 4 !== 2);

const colonnade = [-1, 1].flatMap((side) =>
  Array.from({ length: 6 }, (_, i) => ({ type: 'column', x: side * 36, z: -40 + i * 7, h: 6, color: stone, broken: (i + (side > 0 ? 1 : 0)) % 2 === 0 })),
);

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',
  seed: 3,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.85, 0.32, 0.15], color: '#ffc27e', intensity: 3.0 },
  light: { sky: '#8a9fd8', ground: '#5e4636', hemi: 1.0 },
  sky: { top: '#3f4f72', horizon: '#f0b27a', ground: '#d4a483', sunColor: '#ffd9a0', glow: 1.2 },
  fog: { color: '#cf9f80', near: 70, far: 560 },
  clouds: { count: 90, shadow: '#3b3848', lit: '#f6b878', rim: '#fff1cc', distance: [220, 900], altitude: [80, 240], hole: 0.12 },
  mountains: { count: 46, color: '#5c5650', radius: [520, 760], height: [50, 150], haze: 0.5 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.82 },
  grade: { saturation: 1.12, contrast: 1.07, vignette: 0.42, shadowTint: '#30285e', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -15], radius: 85 },

  player: { start: [0, 48], yaw: 0, pitch: 0.04, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 12,
    hills: 26,
    bumps: 0.35,
    flats: [{ x: PLAZA[0], z: PLAZA[1] - 10, r: 82, falloff: 40, height: 0 }],
    colors: { ground: '#9c7b56', groundAlt: '#86694b', grass: '#7a7c44', high: '#8f7c5c', rock: '#776656' },
    patches: [
      { x: PLAZA[0], z: PLAZA[1] - 10, r: 80, color: '#b49a78', strength: 0.75, rough: 0.3 },
      { x: -58, z: 22, r: 14, color: '#3a2f29', strength: 0.8, rough: 0.6 },
      { x: 64, z: -6, r: 12, color: '#3a2f29', strength: 0.8, rough: 0.6 },
      { x: 30, z: 88, r: 18, color: '#3a2f29', strength: 0.7, rough: 0.6 },
    ],
  },

  objects: [
    {
      type: 'steppedPyramid', x: TEMPLE[0], z: TEMPLE[1], w: 56, d: 50, tiers: 6, tierHeight: 3.6, inset: 2.8, stairWidth: 10,
      color: stone, trim: darkStone, stairColor: '#c7b08c',
      shrine: { w: 14, d: 10, h: 5.5, door: 2.8, roof: '#7a644c' },
    },
    { type: 'steppedPyramid', x: CHRIST[0], z: CHRIST[1], w: 12, d: 12, tiers: 3, tierHeight: 0.6, inset: 1.2, stairWidth: 3.5, color: '#c9b392', trim: darkStone },
    { type: 'steppedPyramid', x: -120, z: -118, rot: 0.5, w: 30, d: 30, tiers: 3, tierHeight: 3.5, inset: 3, stairWidth: 7, color: darkStone, trim: '#6f5e4c' },
    { type: 'rubble', x: -105, z: -96, radius: 14, count: 40, size: [0.4, 1.3], color: darkStone },
    { type: 'pavement', x: PLAZA[0], z: PLAZA[1] - 2, w: 66, d: 58, tile: 2.4, color: '#c6ae8a', damage: 0.45, holes: [{ x: 0, z: -20, r: 7.5 }] },
    { type: 'crack', path: [[-75, 58], [-40, 50], [-14, 60], [8, 54], [40, 64], [80, 52]], width: 0.9, glow: true, branches: 4 },
    { type: 'crack', path: [[-34, -8], [-46, -30], [-40, -52], [-62, -80]], width: 0.7, branches: 2 },
    { type: 'crack', path: [[38, 10], [52, -16], [70, -24], [96, -58]], width: 1.1, glow: true, branches: 3 },
    { type: 'smolder', x: -58, z: 22, radius: 3.2, smoke: 14, height: 22 },
    { type: 'smolder', x: 64, z: -6, radius: 2.6, smoke: 12, height: 18 },
    { type: 'smolder', x: 30, z: 88, radius: 3.5, smoke: 16, height: 26 },
    { type: 'smolder', x: -95, z: -40, radius: 4, smoke: 16, height: 34 },
    { type: 'smolder', x: 110, z: -90, radius: 5, smoke: 18, height: 40 },
    { type: 'smolder', x: -30, z: 120, radius: 3, smoke: 12, height: 22 },
    { type: 'toppledWall', x: 18, z: 70, rot: 0.3, len: 12 },
    { type: 'toppledWall', x: -24, z: 74, rot: 1.9, len: 9 },
    ...plazaWall,
    ...colonnade,
  ],

  scatter: [
    { type: 'ruinedHouse', count: 34, center: PLAZA, ring: [92, 190], spacing: 14, seed: 5, avoid: [{ rect: [0, 60, 30, 40] }], props: { color: stone } },
    { type: 'ruinedHouse', count: 14, center: PLAZA, ring: [74, 95], spacing: 14, seed: 15, avoid: [{ rect: [0, 60, 30, 40] }], props: { color: stone, damage: 0.85 } },
    { type: 'toppledWall', count: 14, center: PLAZA, ring: [75, 170], spacing: 10, seed: 6, props: { color: stone } },
    { type: 'rubble', count: 50, center: PLAZA, ring: [56, 180], seed: 7, props: { color: stone, count: 10, radius: 3 } },
    { type: 'rubble', count: 30, center: PLAZA, ring: [12, 66], seed: 17, props: { color: stone, count: 4, radius: 2, size: [0.12, 0.3] } },
    { type: 'tree', count: 70, center: PLAZA, ring: [100, 320], spacing: 6, seed: 8, props: {} },
    { type: 'tree', count: 30, center: PLAZA, ring: [80, 160], spacing: 6, seed: 9, props: { kind: 'burnt' } },
    { type: 'rock', count: 40, center: PLAZA, ring: [110, 340], spacing: 10, seed: 10, props: {} },
    { type: 'smolder', count: 10, center: PLAZA, ring: [120, 260], spacing: 40, seed: 12, props: { radius: 4, smoke: 14, height: 40 } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#9a4a34'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.3,
    },
    groups: [
      {
        count: 2280, center: CHRIST, ring: [8.5, 50], arc: [-0.3, Math.PI + 0.3], spacing: 0.82, face: CHRIST, children: 0.22, kneel: 0.18, seed: 21,
        avoid: [{ rect: [0, 18, 3.6, 62] }, { rect: [CHRIST[0], CHRIST[1], 15, 15] }, { rect: [TEMPLE[0], TEMPLE[1], 62, 58] }, { rect: [-36, -22, 3, 42] }, { rect: [36, -22, 3, 42] }],
      },
      {
        count: 206, center: CHRIST, ring: [50, 64], arc: [-0.2, Math.PI + 0.2], spacing: 1.4, face: CHRIST, children: 0.2, seed: 22,
        avoid: [{ rect: [0, 40, 4, 30] }],
      },
      { count: childRing.length, points: childRing, face: CHRIST, children: 1, onStructures: true, seed: 23 },
    ],
  },

  figures: [
    {
      x: CHRIST[0], z: CHRIST[1] - 0.2, face: [0, 60], scale: 1.12, robe: '#fbf7ee', mantle: '#f3ecdc', skin: '#a8754f', arms: 'out', emissive: 0.3,
      light: { color: '#fff0cf', intensity: 60, distance: 34 },
      halo: { size: 6, opacity: 0.55, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'beam', at: CHRIST, height: 260, radiusBottom: 3.6, radiusTop: 16, color: '#fff1cf', opacity: 0.6 },
    { type: 'beam', at: CHRIST, height: 260, radiusBottom: 1.6, radiusTop: 7, color: '#fff8e6', opacity: 0.5 },
    { type: 'ring', at: CHRIST, lift: 0.05, radius: 2.4, width: 0.9, color: '#ffe3a0', opacity: 0.9 },
    { type: 'motes', at: CHRIST, radius: 5, height: 40, count: 220 },
    { type: 'sunShafts', center: [-30, -120], count: 7, spread: 90, length: 500, width: [10, 26], opacity: 0.07 },
  ],
};
