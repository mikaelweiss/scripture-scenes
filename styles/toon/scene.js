// 3 Nephi 11 and 17: Christ appears to the multitude at the temple in Bountiful.
// Coordinates are meters. x is east, z is south, the temple stands to the north.

const C = {
  ink: '#2b1a12',
  cream: '#efe3c2',
  limestone: '#e3cfa6',
  ochre: '#c8912e',
  terracotta: '#b5523b',
  jade: '#3e8e6e',
  turquoise: '#2f8f8a',
  white: '#fbf7ee',
};

const CHRIST = [0, -21];
const CHILDREN = [0, -14.5];

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',
  subtitle: 'Land Bountiful, after the great destruction',
  seed: 11,

  style: {
    ink: C.ink,
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#efd8ad', near: 120, far: 1100 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: {
    zenith: '#245f6c',
    mid: '#5d9fa0',
    horizon: '#f3d39a',
    ground: '#d9b98a',
    glowColor: '#ffe7ad',
    glowDir: [0, 0.6, -1],
  },

  sun: {
    dir: [0.5, 0.85, 0.55],
    color: '#fff0d6',
    intensity: 2.6,
    hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 },
    shadowSize: 70,
  },

  ground: {
    size: 1600,
    segments: 320,
    flatRadius: 150,
    hillHeight: 38,
    undulation: 0.35,
    plaza: { center: [0, -40], size: [72, 70] },
    colors: {
      sand: '#d4ac6c',
      dirt: '#bf8d55',
      grass: '#8e9a58',
      grassDark: '#6c7a42',
      plaza: '#e2cfa4',
      plazaLine: '#c3a676',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#7f9a6a',
    },
  },

  mountains: { count: 34, distance: [520, 800], height: [70, 180], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid',
      pos: [0, -52],
      base: [40, 40],
      tiers: 5,
      tierHeight: 3.4,
      inset: 2.8,
      stair: { width: 9, extra: 3, rise: 0.42 },
      shrine: { size: [12, 9, 6], comb: 3.5 },
      rubble: 40,
      colors: {
        stone: C.limestone,
        stair: '#d8c095',
        shrine: C.terracotta,
        interior: C.ink,
        fret: [C.terracotta, C.cream],
        roofFret: [C.turquoise, C.cream],
      },
    },
    {
      type: 'platform',
      pos: [0, -17],
      tiers: [
        { size: [20, 15], height: 0.8 },
        { size: [7, 5], height: 0.8, offset: [0, -4] },
      ],
      stairWidth: 6,
      rise: 0.27,
      stairDepth: 0.45,
      colors: { stone: '#e8d6ae', stair: '#dcc69a', fret: [C.turquoise, C.cream] },
    },

    { type: 'ruinHouse', pos: [-62, -10], size: [10, 8], height: 4, damage: 0.6, rot: 0.2, color: '#cdb48a' },
    { type: 'ruinHouse', pos: [-76, 16], size: [8, 8], height: 3.5, damage: 0.75, rot: -0.1, color: '#c2a27a', fallenRoof: true },
    { type: 'ruinHouse', pos: [-58, 42], size: [12, 7], height: 4.5, damage: 0.45, rot: 0.4, color: '#d6bf95', trimBand: [C.terracotta, C.limestone] },
    { type: 'ruinHouse', pos: [62, -6], size: [9, 9], height: 4, damage: 0.65, rot: -0.25, color: '#cdb48a', fallenRoof: true },
    { type: 'ruinHouse', pos: [74, 28], size: [11, 8], height: 3.8, damage: 0.7, rot: 0.1, color: '#c2a27a' },
    { type: 'ruinHouse', pos: [56, 58], size: [8, 6], height: 3, damage: 0.8, rot: 0.3, color: '#cdb48a' },
    { type: 'ruinHouse', pos: [-42, 72], size: [10, 8], height: 4, damage: 0.7, rot: 0.6, color: '#d6bf95' },
    { type: 'ruinHouse', pos: [36, 78], size: [9, 9], height: 4, damage: 0.6, rot: -0.4, color: '#c2a27a', fallenRoof: true },
    { type: 'ruinHouse', pos: [-86, -56], size: [14, 10], height: 5, damage: 0.5, rot: 0.15, color: '#d6bf95', trimBand: [C.terracotta, C.limestone] },
    { type: 'ruinHouse', pos: [86, -62], size: [12, 10], height: 5, damage: 0.6, rot: -0.2, color: '#cdb48a', trimBand: [C.turquoise, C.limestone] },
    { type: 'ruinHouse', pos: [0, 96], size: [12, 8], height: 4, damage: 0.7, rot: 0.05, color: '#c2a27a' },
    { type: 'ruinHouse', pos: [-104, 40], size: [8, 8], height: 3.5, damage: 0.8, rot: -0.3, color: '#cdb48a' },
    { type: 'ruinHouse', pos: [104, 12], size: [10, 7], height: 4, damage: 0.55, rot: 0.25, color: '#d6bf95' },
    { type: 'ruinHouse', pos: [-30, -100], size: [12, 9], height: 4.5, damage: 0.6, rot: 0.1, color: '#cdb48a' },
    { type: 'ruinHouse', pos: [34, -104], size: [10, 10], height: 4.5, damage: 0.65, rot: -0.15, color: '#c2a27a', fallenRoof: true },

    { type: 'wall', from: [-50, -38], to: [-52, -76], height: 3.5, damage: 0.7, color: '#d2ba8f', fallSide: 1 },
    { type: 'wall', from: [48, -34], to: [50, -80], height: 3.5, damage: 0.75, color: '#d2ba8f', fallSide: -1 },
    { type: 'wall', from: [-34, 54], to: [-9, 60], height: 2.8, damage: 0.65, color: '#c9b087' },
    { type: 'wall', from: [10, 62], to: [36, 52], height: 2.8, damage: 0.7, color: '#c9b087' },

    { type: 'columns', from: [-26, -36], to: [-26, -70], count: 6, radius: 0.6, height: 6, broken: 0.5, color: C.limestone, capColor: '#d8c095' },
    { type: 'columns', from: [26, -36], to: [26, -70], count: 6, radius: 0.6, height: 6, broken: 0.6, color: C.limestone, capColor: '#d8c095', seed: 19 },

    { type: 'trees', count: 110, ring: [75, 240], height: [5, 10], broken: 0.3, fallen: 0.2, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 800, ring: [6, 130], size: [0.12, 0.45], colors: ['#cdb48a', '#b89a70', '#d9c39a', '#a58a66'] },
    { type: 'stones', count: 90, center: [0, -52], ring: [22, 36], size: [0.3, 0.8], colors: ['#e3cfa6', '#d2ba8f'], seed: 8 },
  ],

  cracks: [
    { from: [8, -6], angle: 0.3, length: 50, width: 0.35 },
    { from: [-30, -30], angle: -2.2, length: 45, width: 0.45 },
    { from: [40, 0], angle: 1.2, length: 60, width: 0.5 },
    { from: [-45, 20], angle: -0.9, length: 40, width: 0.4 },
    { from: [15, 40], angle: 0.5, length: 50, width: 0.45 },
    { from: [-8, 44], angle: -0.3, length: 45, width: 0.4 },
    { from: [60, -40], angle: 2.5, length: 50, width: 0.45 },
    { from: [-60, -20], angle: -1.8, length: 60, width: 0.5 },
    { from: [24, -32], angle: 2.0, length: 25, width: 0.3 },
    { from: [-22, 30], angle: -1.2, length: 35, width: 0.35 },
  ],

  smolder: [
    { pos: [-46, 8], radius: 2.5, embers: 26, flames: 4, smoke: 13, logs: 3, smokeScale: 1.3, smokeHeight: 14 },
    { pos: [52, 16], radius: 3, embers: 30, flames: 5, smoke: 14, logs: 4 },
    { pos: [-30, 46], radius: 2, embers: 20, flames: 3, smoke: 12, logs: 2 },
    { pos: [40, 48], radius: 2.5, embers: 24, flames: 3, smoke: 13, logs: 3, smokeScale: 1.3, smokeHeight: 14 },
    { pos: [-72, -30], radius: 3, embers: 30, flames: 5, smoke: 14, logs: 4, smokeScale: 1.6, smokeHeight: 16 },
    { pos: [76, -30], radius: 3, embers: 30, flames: 4, smoke: 14, logs: 4, smokeScale: 1.6, smokeHeight: 16 },
    { pos: [18, 66], radius: 2, embers: 18, flames: 2, smoke: 12, logs: 2 },
    { pos: [-16, 78], radius: 2.5, embers: 22, flames: 3, smoke: 13, logs: 3, smokeScale: 1.3, smokeHeight: 14 },
    { pos: [66, 72], radius: 2.5, embers: 22, flames: 3, smoke: 13, logs: 3, smokeScale: 1.3, smokeHeight: 14 },
  ],

  clouds: {
    layers: [
      { count: 56, gap: [-0.22, 0.22], distance: [350, 800], height: [60, 170], size: [40, 90], color: '#fff1d8', shade: '#3a3352' },
      { count: 16, angle: [-1.7, -0.5], distance: [300, 700], height: [110, 240], size: [60, 120], color: '#857f98', shade: '#29263c' },
      { count: 12, angle: [0.6, 1.5], distance: [350, 700], height: [120, 240], size: [60, 110], color: '#9a90a6', shade: '#2e2a40' },
      { count: 18, center: CHRIST, distance: [45, 110], height: [130, 170], size: [25, 45], color: '#fff6e4', shade: '#5a4a62', drift: 0.004 },
    ],
  },

  light: {
    rayFans: [
      { source: [0, 120, -40], sourceJitter: 50, target: CHRIST, groundY: 4, spread: [14, 55], count: 9, width: [[3, 6], [6, 11]], color: '#fff0c4', intensity: 0.3, stripes: 9, fadeLow: 0.3 },
    ],
    beams: [{ from: [0, 190, -21], to: { at: CHRIST, lift: 1.4 }, width: [10, 4.5], color: '#fff2c9', intensity: 0.2, layers: 3, stripes: 26, fadeLow: 0.04 }],
    rings: [{ at: CHILDREN, lift: 0, radius: 3.6, width: 0.35, height: 2.6, color: '#ffd98a', intensity: 0.9, wallIntensity: 0.5 }],
    glows: [
      { at: CHRIST, lift: 1.3, size: 7, color: '#fff3d0', opacity: 0.85 },
      { at: CHILDREN, lift: 0.8, size: 9, color: '#ffe0a0', opacity: 0.35 },
    ],
    pointLights: [{ at: CHRIST, lift: 2.5, color: '#ffe6b0', intensity: 14, distance: 20 }],
  },

  figures: [
    {
      pos: CHRIST,
      facing: [0, 30],
      scale: 1.12,
      glow: 0.4,
      clearRadius: 1.5,
      colors: { robe: C.white, mantle: '#f3eddf', skin: '#c9905f', hair: '#5a3a22', sash: '#e9dcc0', arms: [0.55, 0.35] },
    },
  ],

  crowd: {
    seed: 3,
    minSpacing: 0.62,
    facing: CHRIST,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
      hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
    },
    aisles: [{ from: [0, 48], to: [0, -8], width: 3.6 }],
    keepClear: [{ kind: 'rect', x: 0, z: -17, hx: 11, hz: 9.2 }],
    groups: [
      { center: [0, -17], radius: [12.5, 44], angle: [-1.95, 1.95], count: 2240, kneel: 0.3, children: 0.14 },
      { shape: 'rect', center: [-34, -50], size: [14, 30], count: 120, kneel: 0.2, children: 0.1 },
      { shape: 'rect', center: [34, -50], size: [14, 30], count: 120, kneel: 0.2, children: 0.1 },
      { center: CHILDREN, radius: [0.9, 3.0], count: 22, children: 1, kneel: 0.5, insideClear: true, facingJitter: 0.3 },
    ],
  },

  player: {
    start: [0, 19],
    lookAt: CHRIST,
    colors: { robe: C.terracotta, mantle: C.turquoise, skin: '#a8724a', hair: C.ink, sash: C.ochre },
  },
};
