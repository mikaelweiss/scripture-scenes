// 3 Nephi 11 and 17: the risen Christ at the temple in Bountiful, after the great destruction.
// Meters. x east, z south, y up. Christ stands at (0, -10) in front of the temple stairs.

const CHRIST = { x: 0, z: -10 };
const TEMPLE = { x: 0, z: -34 };

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',

  world: { size: 150, height: 40, voxel: 0.5 },

  palette: {
    grass: { color: '#5d5233', top: '#6b7238', jitter: 0.1 },
    dryGrass: { color: '#5d5233', top: '#8a7d4a', jitter: 0.1 },
    dirt: { color: '#6a4f35', jitter: 0.1 },
    bedrock: { color: '#55504a' },
    ash: { color: '#5e5a55', top: '#77726a', jitter: 0.12 },
    charcoal: { color: '#2c2724', jitter: 0.15 },
    ember: { color: '#ff5a14', glow: 2.6, jitter: 0.25 },
    charredWood: { color: '#3b2c22', jitter: 0.12 },
    plaza: { color: '#9c8f78', top: '#ad9f86', jitter: 0.05 },
    plaza2: { color: '#9c8f78', top: '#9a8c73', jitter: 0.05 },
    templeStone: { color: '#cbb894', jitter: 0.06 },
    templeTrim: { color: '#a18a64', jitter: 0.06 },
    templeStain: { color: '#7d6f58', jitter: 0.1 },
    templeFloor: { color: '#3a332b' },
    stone: { color: '#8f877a', jitter: 0.1 },
    adobe: { color: '#94785c', jitter: 0.1 },
    rubble: { color: '#7c7468', jitter: 0.14 },
    whiteStone: { color: '#d3cab6', jitter: 0.04 },
    leaves: { color: '#4b6a2e', jitter: 0.15 },
    crackEdge: { color: '#5b4632', top: '#6a5a3e', jitter: 0.1 },
  },

  build: [
    {
      type: 'terrain', base: 4, amp: 0.9, scale: 28, seed: 3,
      surface: 'grass', sub: 'dirt', deep: 'bedrock',
      patches: [{ block: 'dryGrass', scale: 14, above: 0.55 }, { block: 'ash', scale: 9, above: 0.68, seed: 4 }],
      rim: { from: 52, height: 9 },
      bumps: [{ x: 0, z: 32, r: 10, h: 3.5 }, { x: -40, z: 20, r: 10, h: 2 }, { x: 44, z: -5, r: 12, h: 2.5 }],
    },
    { type: 'pave', x: 0, z: -30, w: 64, d: 44, y: 4, block: 'plaza', alt: 'plaza2', sub: 'dirt', tile: 4 },
    {
      type: 'stepPyramid', ...TEMPLE, size: 28, tiers: 6, tierHeight: 2, inset: 1.5, batter: 2,
      block: 'templeStone', trim: 'templeTrim',
      stairs: { width: 6, block: 'templeTrim' },
      shrine: { w: 9, d: 7, h: 4, door: 2, comb: 2.5, block: 'templeStone', inner: 'templeFloor' },
      damage: { bites: 10, rubble: 'templeStone', stains: 160, stain: 'templeStain' },
    },
    {
      type: 'platform', ...CHRIST, block: 'whiteStone',
      steps: [{ size: 13, h: 0.5, block: 'templeTrim' }, { size: 12, h: 0.5 }, { size: 11, h: 0.5, block: 'templeTrim' }, { size: 10, h: 0.5 }, { size: 9, h: 0.5, block: 'templeTrim' }, { size: 8, h: 0.5 }],
    },

    { type: 'ruin', x: -24, z: -40, w: 9, d: 12, h: 4, block: 'stone', alt: 'adobe', rubble: 'rubble' },
    { type: 'ruin', x: 25, z: -42, w: 10, d: 8, h: 5, block: 'templeStone', alt: 'templeStain', rubble: 'templeStone' },
    { type: 'ruin', x: 26, z: -22, w: 7, d: 7, h: 3, block: 'stone', alt: 'rubble', rubble: 'rubble' },
    { type: 'ruin', x: -27, z: -18, w: 6, d: 8, h: 2.5, block: 'adobe', alt: 'stone', rubble: 'rubble' },
    { type: 'wall', x1: -31, z1: -8, x2: -31, z2: -52, h: 2.5, block: 'stone', seed: 2 },
    { type: 'wall', x1: 31, z1: -10, x2: 31, z2: -52, h: 2, block: 'stone', toppled: true, seed: 6 },
    { type: 'wall', x1: -30, z1: -53, x2: 30, z2: -53, h: 3, block: 'stone', seed: 9 },
    { type: 'wall', x1: -14, z1: 14, x2: -4, z2: 22, h: 2.5, block: 'adobe', toppled: true, seed: 4 },
    { type: 'wall', x1: 12, z1: 26, x2: 22, z2: 18, h: 2, block: 'stone', seed: 12 },

    {
      type: 'scatter', count: 16, seed: 31, spacing: 12,
      region: { ...CHRIST, rmin: 36, rmax: 64 },
      avoid: [{ x0: -34, x1: 34, z0: -60, z1: -6 }, { x0: -14, x1: 14, z0: 14, z1: 75 }],
      item: { type: 'ruin', w: [5, 11], d: [5, 10], h: [1.5, 5], block: ['stone', 'adobe'], alt: ['rubble', 'stone'], rubble: 'rubble' },
    },
    {
      type: 'scatter', count: 14, seed: 7, spacing: 6,
      region: { ...CHRIST, rmin: 30, rmax: 66 },
      avoid: [{ x0: -34, x1: 34, z0: -60, z1: -6 }, { x0: -14, x1: 14, z0: 18, z1: 75 }],
      item: { type: 'wall', x1: 0, z1: 0, x2: [3, 9], z2: [-6, 6], h: [1.5, 3.5], block: ['stone', 'adobe'], toppled: [true, false, false] },
    },
    {
      type: 'scatter', count: 60, seed: 19, region: { ...CHRIST, rmin: 8, rmax: 66 },
      avoid: [{ x0: -16, x1: 16, z0: -50, z1: -15 }, { x0: -8, x1: 8, z0: 28, z1: 75 }],
      item: { type: 'rubble', r: [0.8, 2.5], count: [3, 12], block: ['rubble', 'stone', 'templeStain'] },
    },

    { type: 'crack', x: -30, z: -6, angle: 75, length: 26, width: 1.6, depth: 3, edge: 'crackEdge', bottom: 'charcoal', glow: 'ember', glowChance: 0.3, branch: 0.06, seed: 1 },
    { type: 'crack', x: 18, z: -50, angle: 160, length: 22, width: 1.2, depth: 2.5, edge: 'plaza2', bottom: 'charcoal', glow: 'ember', glowChance: 0.2, seed: 2 },
    { type: 'crack', x: 36, z: 8, angle: 210, length: 30, width: 2, depth: 4, edge: 'crackEdge', bottom: 'charcoal', glow: 'ember', glowChance: 0.35, branch: 0.08, seed: 3 },
    { type: 'crack', x: -50, z: 30, angle: 100, length: 32, width: 2.2, depth: 4, edge: 'crackEdge', bottom: 'charcoal', glow: 'ember', glowChance: 0.3, branch: 0.08, seed: 4 },
    { type: 'crack', x: 20, z: 38, angle: 60, length: 24, width: 1.4, depth: 3, edge: 'crackEdge', bottom: 'charcoal', glow: 'ember', glowChance: 0.25, seed: 5 },
    { type: 'crack', x: -10, z: -56, angle: 250, length: 26, width: 1.4, depth: 3, edge: 'crackEdge', bottom: 'charcoal', glow: 'ember', glowChance: 0.25, seed: 6 },

    { type: 'fire', x: -38, z: 8, r: 3.5 },
    { type: 'fire', x: 40, z: -30, r: 3 },
    { type: 'fire', x: 34, z: 30, r: 2.5 },
    { type: 'fire', x: -22, z: 36, r: 3 },
    { type: 'fire', x: -42, z: -38, r: 3 },
    { type: 'fire', x: 18, z: -58, r: 2.5 },
    { type: 'fire', x: 52, z: 12, r: 3 },

    {
      type: 'scatter', count: 18, seed: 41, spacing: 5, region: { ...CHRIST, rmin: 32, rmax: 66 },
      avoid: [{ x0: -34, x1: 34, z0: -60, z1: -6 }, { x0: -10, x1: 10, z0: 24, z1: 75 }],
      item: { type: 'tree', trunk: 'charredWood', h: [2.5, 6], branches: [1, 4] },
    },
    {
      type: 'scatter', count: 10, seed: 43, spacing: 8, region: { x: 0, z: 0, rmin: 58, rmax: 70 },
      item: { type: 'tree', trunk: 'charredWood', leaves: 'leaves', h: [4, 7], crown: [2, 3.5], branches: 2 },
    },
  ],

  people: [
    {
      center: CHRIST, count: 2500, rmin: 7.5, rmax: 60, rowGap: 0.85, spacing: 0.78, arc: [-130, 130], gaps: 0.12,
      exclude: [{ x0: -17, x1: 17, z0: -70, z1: -16 }, { x0: -1.3, x1: 1.3, z0: -5, z1: 70 }],
      kneel: 0.28, child: 0.14, yawJitter: 0.5, seed: 11,
      robes: ['#8a6a48', '#a4835a', '#6e5238', '#b49a72', '#7d4a32', '#5f5a3e', '#9c7a52', '#c2ab84', '#6a5a4a', '#8c3f2c', '#4f5a5e', '#a69b80'],
      skins: ['#8d5a3c', '#a06a46', '#7a4a30', '#b07a52', '#6a3f2a'],
      accents: ['#2a2018', '#3a2a1c', '#d8ccb0', '#8c3f2c', '#2a2018', '#5a4a30', '#c9b48a'],
    },
    {
      ring: true, center: CHRIST, count: 12, r: 2.3, pose: 'sit', scale: 0.6, seed: 5, offset: 0.26,
      robes: ['#c2ab84', '#a4835a', '#d8ccb0', '#9c7a52', '#b49a72'],
      skins: ['#8d5a3c', '#a06a46', '#b07a52'],
      accents: ['#2a2018', '#3a2a1c', '#5a4a30'],
    },
    {
      ring: true, center: CHRIST, count: 1, r: 0, pose: 'armsOut', scale: 1.12, face: { x: 0, z: 40 },
      robes: ['#f6f1e7'], skins: ['#c99a76'], accents: ['#7a5a3a'],
      glow: { emissive: '#fff4e0', intensity: 0.6 },
    },
  ],

  effects: [
    {
      type: 'clouds', extent: 900, cell: 12, height: 85, thickness: 8, scale: 70, cover: 0.46, seed: 5, drift: 0.5,
      holes: [{ ...CHRIST, r: 40 }],
      bottom: '#3e3f47', top: '#6c6a70', rim: '#f0c690', far: '#c2926a',
    },
    {
      type: 'beam', ...CHRIST, height: 90, color: '#ffe6b0',
      layers: [{ top: 16, bottom: 6, strength: 0.04 }, { top: 8, bottom: 2.8, strength: 0.08, spin: 0.05 }, { top: 3.6, bottom: 1.3, strength: 0.18, spin: -0.08 }],
    },
    { type: 'motes', ...CHRIST, radius: 3.5, height: 40, count: 260, size: 0.08, color: '#ffe9b8', intensity: 4 },
    { type: 'halo', ...CHRIST, lift: 1.1, size: 5.5, color: '#fff2d6', intensity: 1.2 },
    { type: 'lightRing', ...CHRIST, r: 3.2, count: 40, cube: 0.16, color: '#ffe2a0', intensity: 4 },
    { type: 'smoke', perEmitter: 34, life: 8, rise: 16, wind: [0.5, 0.15], size: 1.5, color: '#4a4541', opacity: 0.45 },
  ],

  lights: [{ ...CHRIST, lift: 4, color: '#ffe4b8', intensity: 12, distance: 22 }],

  light: {
    sunDir: [-0.55, 0.55, 0.62], sun: '#ffd29a', sunIntensity: 2.6,
    sky: '#9ba3ad', ground: '#5c4834', ambient: 1.5, exposure: 1.0,
  },
  sky: { zenith: '#3b4350', horizon: '#d2a273', glow: '#ffcf8a', below: '#8a7058' },
  fog: { color: '#bf9a76', near: 45, far: 210 },
  bloom: { strength: 0.7, radius: 0.5, threshold: 2.2 },

  player: { x: 0, z: 30, yaw: 0, pitch: -0.11, eye: 1.62, speed: 4.5 },
};
