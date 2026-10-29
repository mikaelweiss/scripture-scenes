// 3 Nephi 11 and 17: Christ appears at the temple in Bountiful after the great destruction.
// Units are ground tiles. +z points from the temple toward the crowd.

const stone = ['#d8c7a3', '#cfbd97', '#dccca9'];
const ruin = ['#b9a888', '#a99779', '#c4b493', '#9d8c70'];
const scorch = ['#3d3630', '#4a4038', '#2e2925'];
const fire = { type: 'fire', scorch, charcoal: '#2a2420', embers: ['#ff8a2a', '#ffb347', '#ff5e1a'] };
const house = { type: 'ruinHouse', colors: ruin };

const palette = {
  robes: ['#8b6b4a', '#a2835c', '#6e5a43', '#b59b74', '#7b4f3a', '#5f6a4a', '#9a8a6c', '#c8b48c', '#6b4636', '#8a7350', '#4f4a44', '#a76c4a'],
  mantles: ['#c9b48a', '#7d5a3c', '#5c4a3a', '#b08a5a', '#8f3f2e', '#d8c8a4', '#6d6447', '#4a5866', '#9b7d4f'],
  skin: ['#c69c76', '#a87b55', '#8d6444', '#b88a62', '#d1a882', '#7a5538'],
  hoodRatio: 0.35,
};

const christ = { x: 0, z: 1 };

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',
  hint: 'WASD / arrows to walk · click or tap to walk there · Q / E to turn · scroll or pinch to zoom',
  seed: 7,

  camera: { angle: 45, zoom: 17, minZoom: 5, maxZoom: 48, lead: 7 },
  player: { start: [8.5, 10], robe: '#2d5c9e', mantle: '#e8c060', skin: '#c69c76', marker: '#ffd25a', speed: 4.5 },

  light: {
    sun: { color: '#ffe2b8', intensity: 2.9, dir: [-0.8, 1.3, 0.5] },
    hemi: { sky: '#b8c4dc', ground: '#9a8266', intensity: 1.3 },
    exposure: 1,
  },
  post: { bloom: 0.5, bloomRadius: 0.5, bloomThreshold: 0.9 },

  sky: {
    gradient: [[0, '#262b3a'], [0.35, '#575667'], [0.72, '#c69f7a'], [1, '#f0d2a0']],
    sun: [0.72, 0.3],
    sunColor: 'rgba(255,226,170,0.85)',
    darkCloud: 'rgba(36,40,54,0.55)',
    litCloud: 'rgba(255,214,160,0.45)',
    rayColor: 'rgba(255,236,190,0.08)',
    clouds: { count: 26, distance: [9, 30], height: [-16, -3], size: [1.5, 3.2], colors: ['#ead7bd', '#cbbbab', '#8a8590', '#6c6b78', '#f3e0c4'] },
  },
  smoke: { colors: ['#6d6762', '#837c75', '#5a5550'], speed: 0.1, height: 5, puffs: 9, size: 1.7, opacity: 0.7 },

  ground: {
    size: 76,
    radius: 34,
    hills: 0.5,
    colors: ['#7a8450', '#6f7a48', '#838c56', '#768049'],
    patchColors: ['#9c8461', '#8f7757', '#a68d68'],
    patchThreshold: 0.58,
    crackColors: ['#3b3128', '#2f2720'],
    strata: [
      { depth: 0.7, color: '#5a4030' },
      { depth: 1.6, color: '#7a5a3c' },
      { depth: 2.4, color: '#9a7e5c' },
      { depth: 3.6, color: '#7d7468' },
    ],
    rock: { color: '#9a8a76', height: 38, spikes: [{ x: 15, z: 9, r: 9, h: 30 }, { x: -13, z: -10, r: 10, h: 26 }, { x: 9, z: -17, r: 8, h: 22 }, { x: -12, z: 14, r: 8, h: 24 }] },
    zones: [
      { shape: 'rect', x: 0, z: -9, w: 30, d: 28, colors: ['#cbbd9f', '#c2b393', '#d3c6a8', '#bfb08f'], height: 0 },
      { shape: 'circle', x: christ.x, z: christ.z, r: 9, colors: ['#cbbd9f', '#c2b393', '#d3c6a8'], height: 0, soft: true },
      { shape: 'circle', x: -20, z: -10, r: 5, colors: ['#8f7757', '#7d6a50'], soft: true },
    ],
    cracks: [
      { x: -10, z: -25, angle: 1.4, length: 20, branches: 2 },
      { x: 12, z: -20, angle: 0.4, length: 18, branches: 1 },
      { x: -6, z: 14, angle: 2.6, length: 16, branches: 1 },
      { x: 20, z: 2, angle: -0.3, length: 14 },
      { x: -26, z: -2, angle: 0.2, length: 12 },
    ],
  },

  structures: [
    { type: 'stepPyramid', id: 'temple', x: 0, z: -13, base: 17, tiers: 5, tierHeight: 1.4, inset: 1.3, stairWidth: 3.2,
      colors: stone, trim: '#bfae8a', stairColor: '#e3d5b5', shrineColor: '#d2c19c', doorColor: '#3a2e24', fallen: 36 },
    { type: 'platform', id: 'dais', x: christ.x, z: christ.z, size: 3.6, tiers: 2, tierHeight: 0.5, stairWidth: 1.4, colors: ['#857a6a', '#7d7262'], trim: '#9a8f7c' },

    { ...house, x: -17, z: -16, w: 5, d: 4, h: 2.6, rot: 0.3, broken: 0.5 },
    { ...house, x: 18, z: -18, w: 6, d: 4.5, h: 2.4, rot: -0.2, broken: 0.7 },
    { ...house, x: -24, z: 5, w: 4.5, d: 4, h: 2.2, rot: 1.2, broken: 0.8 },
    { ...house, x: 23, z: 9, w: 5, d: 5, h: 2.6, rot: 0.6, broken: 0.9 },
    { ...house, x: -11, z: -27, w: 4, d: 4, h: 2, rot: -0.4, broken: 0.6 },
    { ...house, x: 11, z: -28, w: 4.5, d: 3.5, h: 2.2, rot: 0.2, broken: 0.5 },
    { type: 'toppledWall', x1: -22, z1: -6, x2: -15, z2: -4, h: 2.2, fall: -1, colors: ruin },
    { type: 'toppledWall', x1: 15, z1: -5, x2: 22, z2: -3, h: 2, fall: 1, colors: ruin },
    { type: 'toppledWall', x1: -4, z1: 25, x2: 3, z2: 27, h: 1.8, fall: 1, colors: ruin },
    { type: 'stela', x: -8, z: -1, h: 2.6, broken: true, color: '#cdbd98', trim: '#bfae8a' },
    { type: 'stela', x: 8, z: -1, h: 2.6, color: '#cdbd98', trim: '#bfae8a' },
    { type: 'stela', x: -13, z: -10, h: 2.4, broken: true, rot: 0.8, color: '#cdbd98', trim: '#bfae8a' },

    { ...fire, x: -20, z: -10, size: 1.1 },
    { ...fire, x: 20, z: -11 },
    { ...fire, x: -27, z: 13, size: 0.9 },
    { ...fire, x: 26, z: 17 },
    { ...fire, x: -2, z: -27, size: 0.8 },

    { type: 'rubble', x: 0, z: -13, r: 14, count: 120, colors: stone, size: [0.15, 0.4] },
    { type: 'rubble', x: -18, z: -14, r: 6, count: 60, colors: ruin },
    { type: 'rubble', x: 19, z: -15, r: 6, count: 60, colors: ruin },
    { type: 'rubble', x: 0, z: 10, r: 26, count: 160, colors: ruin, size: [0.12, 0.3] },
    { type: 'trees', x: 0, z: 0, ring: [24, 33], count: 30, broken: 0.5, trunk: '#6b4c32', charred: '#2f2924', leaves: ['#55703f', '#64804a', '#4b6338'] },
  ],

  people: [
    { center: [christ.x, christ.z], radius: [6, 32], arc: [-125, 125], spacing: 0.62, count: 2500, looseness: 5,
      aisles: [[2.2, 3.2, 20, 21, 1.6]], kneelRatio: 0.22, childRatio: 0.15, palette },
    { ring: true, center: [christ.x, christ.z], radius: 3.2, count: 30, children: true, kneelRatio: 0.35, palette,
      light: { radius: 3.2, width: 1.1, color: '#ffe9b8', opacity: 0.5, motes: 50 } },
  ],

  figures: [
    { ...christ, on: 'dais', facing: [12, 18], robe: '#fbf8f0', mantle: '#ffffff', skin: '#ecd3b4', scale: 1.4, glow: 0.12, arms: 0.55,
      light: {
        beam: { radius: 1.2, topRadius: 3, height: 46, color: '#fff0c4', strength: 0.32 },
        haloColor: '#fff3d0', haloSize: 2.6, haloHeight: 1.05, poolSize: 6, poolOpacity: 0.18,
        lightColor: '#ffe9c0', lightIntensity: 5, lightDistance: 10,
      } },
  ],
};
