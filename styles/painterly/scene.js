// 3 Nephi 11 and 17: the risen Christ at the temple in Bountiful, after the destruction.
// Units are meters. +z points from the temple toward the crowd.

const stone = ['#b8a587', '#a99878', '#c2b08f', '#9c8a6d'];
const ruinStone = ['#a49276', '#8f7f66', '#b19f82', '#7d6e59'];

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',
  subtitle: '“They saw a Man descending out of heaven; and he was clothed in a white robe.”',
  seed: 11,

  spawn: { pos: [5, 27], yaw: 0.02, pitch: 0.07 },

  terrain: {
    size: 800,
    segments: 220,
    flat: { center: [0, -40], radius: 70, blend: 90 },
    hills: 30,
    bowl: 26,
    roughness: 0.7,
    mounds: [{ pos: [3, 32], radius: 24, height: 3.5 }],
    plaza: { center: [0, -40], radius: 62 },
    colors: { grass: '#7f8c4e', dry: '#ab9c63', dirt: '#8b7253', plaza: '#b49f7d', burnt: '#3f342b' },
  },

  mountains: { count: 18, radius: [430, 520], height: [45, 95], color: '#8a90a0' },

  sky: {
    zenith: '#6f87a0',
    horizon: '#efcf98',
    cloudDark: '#3e3d48',
    cloudLit: '#d9a873',
    gold: '#ffc777',
    sunDir: [0.16, 0.36, -1],
    clearing: 1,
  },
  fog: { color: '#d6c3a0', near: 80, far: 720 },
  light: {
    focus: [0, -40],
    dir: [0.75, 0.6, 0.35],
    sunColor: '#ffd9a8',
    sun: 2.8,
    skyColor: '#cfc8c0',
    groundColor: '#6b5440',
    ambient: 1.25,
    shadowRadius: 115,
  },

  structures: [
    {
      type: 'pyramid', id: 'temple', pos: [0, -75], base: 46, tiers: 5, tierHeight: 4.2, inset: 3.6,
      color: '#bba98b', trim: '#998669',
      stairs: { width: 9, extend: 4 },
      shrine: { width: 11, depth: 8, height: 6, color: '#c4b394', door: '#3b2f25' },
      damage: { blocks: 45, chunks: 6 },
    },
    { type: 'platform', id: 'dais', pos: [0, -36], size: 4, height: 2.2, steps: 3, stepDepth: 1.2, color: '#c3b292', trim: '#a39073' },

    { type: 'ruin', pos: [-48, -62], size: [14, 10], height: 5, rotY: 0.3, damage: 0.6, colors: ruinStone, seed: 1 },
    { type: 'ruin', pos: [50, -68], size: [12, 12], height: 6, rotY: -0.2, damage: 0.7, colors: ruinStone, seed: 2 },
    { type: 'ruin', pos: [-70, -18], size: [10, 8], height: 4, rotY: 0.8, damage: 0.8, colors: ruinStone, seed: 3 },
    { type: 'ruin', pos: [68, -12], size: [16, 9], height: 4.5, rotY: -0.5, damage: 0.5, colors: ruinStone, seed: 4 },
    { type: 'ruin', pos: [-55, 30], size: [9, 9], height: 4, rotY: 0.1, damage: 0.85, colors: ruinStone, seed: 5 },
    { type: 'ruin', pos: [60, 32], size: [11, 8], height: 4, rotY: 0.4, damage: 0.75, colors: ruinStone, seed: 6 },
    { type: 'ruin', pos: [-32, -108], size: [10, 8], height: 5, rotY: -0.3, damage: 0.6, colors: ruinStone, seed: 7 },
    { type: 'ruin', pos: [36, -110], size: [12, 9], height: 5.5, rotY: 0.2, damage: 0.65, colors: ruinStone, seed: 8 },

    { type: 'fallenWall', from: [-44, -40], to: [-30, -52], height: 4, colors: ruinStone },
    { type: 'fallenWall', from: [36, -46], to: [48, -32], height: 4, colors: ruinStone },
    { type: 'fallenWall', from: [-80, 10], to: [-66, 22], height: 3.5, colors: ruinStone },
    { type: 'fallenWall', from: [74, 6], to: [84, 22], height: 3.5, colors: ruinStone },

    {
      type: 'trees', center: [0, -40], ring: [100, 270], count: 170, height: [7, 13], brokenRatio: 0.45,
      trunk: '#5e4936', charred: '#2f2620', leaves: ['#5e7342', '#6c7b45', '#4f6440', '#7a854c'],
    },
  ],

  rubble: [
    { center: [0, -75], radius: 40, count: 260, size: [0.25, 0.8], colors: stone },
    { center: [0, -20], radius: 150, count: 500, size: [0.2, 0.7], colors: ruinStone },
    { center: [-48, -62], radius: 14, count: 60, size: [0.3, 0.9], colors: ruinStone },
    { center: [50, -68], radius: 14, count: 60, size: [0.3, 0.9], colors: ruinStone },
    { center: [-70, -18], radius: 12, count: 50, size: [0.3, 0.9], colors: ruinStone },
    { center: [68, -12], radius: 14, count: 50, size: [0.3, 0.9], colors: ruinStone },
  ],

  cracks: [
    { from: [-95, -2], to: [-38, -24], width: 0.5, branches: 3, color: '#221a14', edge: '#6b5843' },
    { from: [22, -125], to: [62, -38], width: 0.6, branches: 3, color: '#221a14', edge: '#6b5843' },
    { from: [44, 12], to: [100, 55], width: 0.5, branches: 2, color: '#221a14', edge: '#6b5843' },
    { from: [-24, 58], to: [-80, 120], width: 0.45, branches: 2, color: '#221a14', edge: '#6b5843' },
    { from: [-18, -50], to: [-52, -80], width: 0.35, branches: 2, color: '#221a14', edge: '#6b5843' },
  ],

  smolder: {
    particles: 70, height: 22, size: 3.2, color: '#4a423b', ember: '#ff9a4a', wind: [6, 2],
    spots: [
      { pos: [-46, -60], radius: 6 },
      { pos: [52, -66], radius: 6 },
      { pos: [-72, -14], radius: 5 },
      { pos: [70, -8], radius: 5 },
      { pos: [-56, 32], radius: 5 },
      { pos: [36, 62], radius: 4 },
      { pos: [-22, -112], radius: 5 },
    ],
  },

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a45', '#b49a72', '#7a4e36', '#5f6b52', '#8a5a3c', '#c2ab84', '#6d4f3a', '#9c7b56', '#566173', '#7b3f32', '#d1c09c'],
      mantles: ['#5d4636', '#8c6f4e', '#a68b62', '#4f5546', '#7e5b3e', '#b8a07a', '#6a3a2c'],
      heads: ['#8a5a3c', '#9b6a48', '#6e4630', '#2e221a', '#3a2a1f', '#2a1e17', '#c9b48e', '#8c6f4e', '#d8c8a6'],
    },
    groups: [
      { layout: 'arc', focus: [0, -36], count: 2472, radius: [15, 60], arc: [-78, 78], spacing: 1.15, aisle: 3.4, childRatio: 0.18, kneelRatio: 0.22 },
      { layout: 'ring', center: [0, -26.5], facing: [0, -36], count: 28, radius: [1.4, 3.6], arc: [-110, 110], childRatio: 1, kneelRatio: 0.4 },
    ],
  },

  figures: [
    {
      on: 'dais', robe: '#fbf6ea', mantle: '#fffaf0', head: '#f3e6cf',
      glow: { color: '#fff1d0', size: 7, opacity: 0.4, light: 18, reach: 26, emissive: 0.22 },
    },
  ],

  lightRings: [{ center: [0, -26.5], radius: 4.6, height: 1.8, color: '#ffd89a', opacity: 0.7 }],

  beams: [
    { from: { anchor: 'dais', offset: [0, 170, 0] }, to: { anchor: 'dais', offset: [0, 0, 0] }, radius: [4, 2.0], color: '#ffe6b8', opacity: 0.16 },
    { from: [150, 260, -420], to: [30, 0, -30], radius: [30, 8], color: '#ffe2b0', opacity: 0.1 },
  ],

  paint: { exposure: 0.95, brush: 1.0, wobble: 7, bleed: 2.5, edge: 1.0, grain: 0.18, line: 0.25, paperTint: 0.15 },
};
