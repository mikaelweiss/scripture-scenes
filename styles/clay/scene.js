// 3 Nephi 11 and 17: the resurrected Christ descends to the Nephites gathered at
// the temple in Bountiful, among the ruins left by the great destruction.
// Units are meters. +z points south (toward the crowd), the temple sits north.

const CHRIST = [0, -8];

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',
  seed: 3011,

  sky: {
    zenith: '#34405a',
    horizon: '#e6b783',
    glow: '#fff1c9',
    glowDir: [0.05, 0.62, -0.78],
    fog: { color: '#d8bd9a', near: 80, far: 330 },
  },

  sun: { from: [40, 90, 55], color: '#ffe2b8', intensity: 2.6, shadowSize: 95 },
  ambient: { sky: '#cdd6e6', ground: '#8a6d4c', intensity: 1.25 },

  ground: {
    color: '#93a061',
    flatRadius: 75,
    hills: 5,
    patches: [
      { at: [0, 10], radius: 58, color: '#a89c6c' },
      { at: [0, -34], radius: 34, color: '#c9b48d' },
      { at: [-48, 30], radius: 22, color: '#7c8a4f' },
      { at: [55, -10], radius: 25, color: '#a08e66' },
    ],
  },

  horizonHills: { count: 26, radius: [190, 260], size: [35, 80], colors: ['#7f9264', '#6f8a6e', '#8b9a6b', '#7a8577'] },

  clouds: {
    count: 320,
    radius: [60, 260],
    height: [42, 70],
    opening: { at: CHRIST, radius: 58 },
    dark: '#666a7c',
    lit: '#e9c49a',
  },

  lightShafts: [
    { at: CHRIST, top: 90, radius: [1.7, 5.5], color: '#fff3d0', opacity: 0.42 },
  ],

  temple: {
    at: [0, -34],
    base: [36, 30],
    tiers: 5,
    tierHeight: 2.5,
    inset: 2.4,
    color: '#d6bf95',
    trim: '#b39a72',
    stairs: { width: 8, color: '#cdb487' },
    shrine: { size: [10, 4.6, 7], color: '#dcc7a0', door: '#4a3a2c', roof: '#b38e66' },
    damage: [
      { corner: [1, -1], tier: 3 },
      { corner: [-1, 1], tier: 1 },
    ],
  },

  dais: { at: CHRIST, radius: 3.2, height: 1.1, steps: 3, color: '#e2d2b0' },

  christ: {
    at: CHRIST,
    robe: '#fbf8f0',
    sash: '#f2e3c2',
    glow: '#fff2cf',
    scale: 1.15,
  },

  childrenRing: { at: CHRIST, radius: 5, width: 1.1, color: '#ffe9b0' },

  crowd: {
    robes: ['#a7714b', '#8c5a3c', '#c49a6c', '#7d6a4f', '#9b7f5b', '#d9cdb4', '#e6dcc6', '#8d8c7c', '#8a4b3a', '#6f7a52', '#b5835a', '#6e5844', '#c8b08a', '#77705f', '#a89074', '#9a5a44'],
    cloaks: ['#6b4a33', '#a85f3f', '#5f6a4a', '#8b7355', '#c2a47a', '#7a3e2e', '#4f5a5f', '#9c8a5c', '#efe6d2', '#5a5f55', '#b0493a'],
    skins: ['#c58c5f', '#b07a50', '#9a6844', '#d29c6c', '#8a5c3c', '#bb8458'],
    hair: ['#2e2119', '#3b2a1e', '#1f1814', '#4a3527'],
    hoodChance: 0.45,
    groups: [
      { kind: 'adult', count: 2440, center: CHRIST, radius: [7.5, 52], angle: [-88, 88], facing: CHRIST, scale: [0.9, 1.08] },
      { kind: 'child', count: 34, center: CHRIST, radius: [4.2, 5.6], angle: [-125, 125], facing: CHRIST, scale: [0.55, 0.68] },
      { kind: 'adult', count: 26, center: [0, -30], radius: [21, 26], angle: [130, 230], facing: CHRIST, scale: [0.95, 1.05] },
    ],
  },

  ruins: [
    { type: 'house', at: [-44, -30], size: [9, 7], height: 4.2, rot: 0.2, color: '#c7a982', roof: 'collapsed' },
    { type: 'house', at: [46, -27], size: [8, 10], height: 4.5, rot: -0.15, color: '#bfa27c', roof: 'collapsed' },
    { type: 'house', at: [-60, 14], size: [10, 8], height: 3.8, rot: 0.6, color: '#c9ad85' },
    { type: 'house', at: [62, 22], size: [9, 9], height: 4, rot: -0.4, color: '#c4a47c', roof: 'collapsed' },
    { type: 'house', at: [-30, 66], size: [8, 7], height: 3.5, rot: 0.1, color: '#cbb08a' },
    { type: 'house', at: [36, 68], size: [10, 7], height: 3.6, rot: -0.3, color: '#c2a37b', roof: 'collapsed' },
    { type: 'house', at: [-74, -46], size: [9, 9], height: 4, rot: 0.3, color: '#bea07a' },
    { type: 'house', at: [78, -52], size: [8, 8], height: 4.4, rot: 0.8, color: '#c8ab84' },
    { type: 'house', at: [-82, 52], size: [7, 7], height: 3.4, rot: -0.2, color: '#c6a781' },
    { type: 'house', at: [86, 58], size: [9, 7], height: 3.6, rot: 0.5, color: '#bfa27c' },

    { type: 'wall', from: [-30, -58], to: [30, -58], height: 2.6, color: '#c2a57e', broken: 0.4 },
    { type: 'wall', from: [-30, -58], to: [-30, -16], height: 2.6, color: '#c2a57e', broken: 0.5 },
    { type: 'wall', from: [30, -58], to: [30, -16], height: 2.6, color: '#c2a57e', broken: 0.55 },
    { type: 'toppledWall', from: [-30, -30], to: [-38, -22], color: '#c2a57e' },
    { type: 'toppledWall', from: [30, -40], to: [38, -36], color: '#c2a57e' },

    { type: 'column', at: [-14, -17], height: 6, color: '#ddcaa4' },
    { type: 'column', at: [14, -17], height: 3.2, color: '#ddcaa4', broken: true },
    { type: 'column', at: [-24, -17], height: 2.1, color: '#ddcaa4', broken: true },
    { type: 'column', at: [24, -17], height: 6, color: '#ddcaa4' },
    { type: 'fallenColumn', at: [19, -12], length: 6, rot: 0.9, color: '#ddcaa4' },
    { type: 'fallenColumn', at: [-21, -11], length: 5, rot: 2.6, color: '#ddcaa4' },

    { type: 'slab', at: [-52, -6], size: [6, 4], tilt: 0.25, rot: 0.4, color: '#a58f6c' },
    { type: 'slab', at: [50, 40], size: [7, 5], tilt: -0.3, rot: 1.2, color: '#a08a66' },
    { type: 'slab', at: [-40, 48], size: [5, 4], tilt: 0.35, rot: -0.7, color: '#a58f6c' },
  ],

  rubble: [
    { at: [0, -34], radius: [16, 26], count: 120, size: [0.3, 1.1], colors: ['#cdb68c', '#b9a079', '#d8c49c'] },
    { at: [-44, -30], radius: [3, 10], count: 45, size: [0.25, 0.9], colors: ['#c7a982', '#a98f6b'] },
    { at: [46, -27], radius: [3, 10], count: 45, size: [0.25, 0.9], colors: ['#bfa27c', '#a38b68'] },
    { at: [62, 22], radius: [3, 10], count: 40, size: [0.25, 0.9], colors: ['#c4a47c'] },
    { at: [36, 68], radius: [3, 9], count: 40, size: [0.25, 0.9], colors: ['#c2a37b'] },
    { at: [0, 0], radius: [55, 110], count: 260, size: [0.2, 1.4], colors: ['#9d8a6c', '#8e7b5f', '#b3a07c', '#7d6e58'] },
  ],

  cracks: [
    { points: [[-58, 36], [-50, 44], [-44, 41], [-36, 52], [-30, 56], [-22, 70], [-18, 84]], width: 0.7 },
    { points: [[34, -12], [42, -4], [48, 8], [56, 12], [62, 30], [72, 38], [86, 40]], width: 0.8 },
    { points: [[-36, -10], [-46, -14], [-58, -10], [-70, -18], [-88, -14]], width: 0.6 },
    { points: [[12, 58], [18, 66], [14, 76], [22, 90]], width: 0.5 },
    { points: [[-12, -54], [-4, -62], [-10, -72], [-2, -86]], width: 0.6 },
    { points: [[60, -40], [66, -32], [76, -30], [82, -18]], width: 0.5 },
  ],

  fires: [
    { at: [-48, -24], size: 1.2 },
    { at: [52, -32], size: 1 },
    { at: [-63, 20], size: 0.9 },
    { at: [66, 14], size: 1.1 },
    { at: [-26, 72], size: 0.8 },
    { at: [40, 62], size: 1 },
    { at: [-80, -10], size: 0.8 },
  ],

  trees: {
    scatter: { count: 70, radius: [62, 135], kinds: { palm: 0.55, round: 0.3, broken: 0.15 } },
    palm: { trunk: '#8a6a48', leaves: ['#5d8a45', '#6c9a4c', '#527d3e'] },
    round: { trunk: '#7a5a3c', leaves: ['#6f9a4f', '#7fa65a', '#5f8a47'] },
    keepClear: [{ at: [0, -20], radius: 60 }, { at: [0, 62], radius: 26 }],
  },

  player: {
    start: [9, 22],
    faces: CHRIST,
    robe: '#2f6f8f',
    cloak: '#e0c48a',
    skin: '#c08a5c',
    hair: '#2e2119',
    camera: { distance: 27, pitch: 18, yaw: 8 },
  },
};
