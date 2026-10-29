// 3 Nephi 11 and 17: Christ appears to the multitude at the temple in Bountiful.
// World x runs left to right. The walker starts among the ruins and walks toward the temple.
// Layers are listed far to near. p is parallax speed, s is size, ground is the horizon line as a
// fraction of screen height, haze blends the silhouette toward the sky color.
// An item at world x lines up across every layer when the camera stands at x.

const CX = 3900;

const grassRow = (from, to, step, seed) =>
  Array.from({ length: Math.floor((to - from) / step) }, (_, i) => ({
    type: 'grass', x: from + i * step + ((i * 137 + seed) % 90), n: 10 + (i % 4) * 3, spread: 70, h: 34,
  }));

export default {
  focus: CX,
  world: { min: 0, max: 4500, start: 500, speed: 210, lead: 220 },

  palette: {
    silhouette: '#0c090e',
    cloud: '#1b1323',
    haze: { dark: '#c27048', clear: '#f0c08a' },
  },

  sky: {
    dark: [[0, '#140e20'], [0.3, '#3a2340'], [0.55, '#86403e'], [0.72, '#c86a40'], [0.86, '#e6a060'], [1, '#f1c286']],
    clear: [[0, '#2b2c55'], [0.3, '#6e5679'], [0.55, '#d88c68'], [0.72, '#f3b676'], [0.86, '#fbd9a0'], [1, '#fff0c8']],
  },

  light: { x: CX, p: 0.15, y: 0.2 },
  rays: { after: 'ridge', count: 24, spread: 1.8 },

  clouds: [
    { y: 0.05, h: 50, r: 48, step: 40, p: 0.015, drift: 4, rim: 3, lit: 0.08, seed: 1, gap: 380 },
    { y: 0.15, h: 40, r: 36, step: 34, p: 0.025, drift: 6, rim: 3, lit: 0.22, seed: 2, gap: 320 },
    { y: 0.26, h: 30, r: 24, step: 30, p: 0.04, drift: 9, rim: 2.5, lit: 0.42, seed: 3, gap: 270 },
    { y: 0.37, h: 16, r: 12, step: 26, p: 0.055, drift: 12, rim: 2, lit: 0.62, seed: 4, gap: 230 },
  ],

  birds: [
    { x: 300, y: 0.21, p: 0.05, speed: 14, count: 6, size: 1.6, seed: 3 },
    { x: 1000, y: 0.33, p: 0.07, speed: -9, count: 4, size: 1.2, seed: 8 },
  ],

  dust: 140,

  layers: [
    {
      id: 'peaks', p: 0.03, s: 0.6, ground: 0.62, haze: 0.8, mist: 0.25, mistH: 180, screenUnits: true,
      terrain: { amp: 190, freq: 0.0045, oct: 4, ridge: true, seed: 11 },
      items: [{ type: 'smolder', x: 230, w: 90, h: 0, plume: 520, wind: 0.5, density: 0.9, glow: 0.4, embers: 0, speed: 0.6 }],
    },
    {
      id: 'ridge', p: 0.08, s: 0.5, ground: 0.645, haze: 0.68, mist: 0.25, mistH: 120, screenUnits: true,
      terrain: { amp: 70, freq: 0.008, oct: 3, seed: 5 },
      items: [
        { type: 'city', x: -40, w: 760, h: 80 },
        { type: 'city', x: 980, w: 640, h: 70 },
        { type: 'smolder', x: 520, w: 70, h: 0, plume: 380, wind: 0.6, glow: 0.5, embers: 0, speed: 0.7 },
      ],
    },
    {
      id: 'temple', p: 0.15, s: 0.75, ground: 0.675, haze: 0.5, mist: 0.3, mistH: 80,
      terrain: { amp: 14, freq: 0.02, seed: 7 },
      items: [
        { type: 'temple', x: CX, w: 620, tiers: 6, tierH: 44, topW: 210, ramp: 120, damage: 0.4 },
        { type: 'ruin', x: CX - 3400, w: 320, h: 150 },
        { type: 'ruin', x: CX + 3000, w: 260, h: 120, side: -1 },
        { type: 'tree', kind: 'palm', x: CX - 2300, h: 230, bend: 0.2 },
        { type: 'tree', kind: 'palm', x: CX - 2050, h: 200, bend: -0.1 },
        { type: 'tree', kind: 'palm', x: CX + 2400, h: 260, bend: -0.15 },
        { type: 'city', x: CX - 5200, w: 900, h: 90 },
        { type: 'smolder', x: CX - 4300, w: 80, h: 10, plume: 420, wind: 0.4, glow: 0.6 },
      ],
    },
    {
      id: 'crowdFar', p: 0.3, s: 0.34, ground: 0.705, haze: 0.45, mist: 0.3, mistH: 70,
      terrain: { amp: 8, freq: 0.03, seed: 9 },
      crowds: [{ from: 2300, to: 5800, count: 860, focus: CX, spread: 1500, base: 0.35, depth: 45, raise: 0.08 }],
      items: [
        { type: 'hut', x: 1500, burnt: true },
        { type: 'tree', kind: 'brokenPalm', x: 1900, h: 220 },
        { type: 'ruin', x: 1100, w: 260, h: 170 },
        { type: 'tree', kind: 'palm', x: 5200, h: 260 },
      ],
    },
    {
      id: 'crowdMid', p: 0.45, s: 0.46, ground: 0.735, haze: 0.35, mist: 0.28, mistH: 60,
      terrain: { amp: 8, freq: 0.03, seed: 13 },
      crowds: [{ from: 2400, to: 5400, count: 620, focus: CX, spread: 1200, base: 0.3, depth: 30, raise: 0.07 }],
      items: [
        { type: 'column', x: 1300, h: 200, rot: 0.05 },
        { type: 'column', x: 1420, h: 150 },
        { type: 'hut', x: 2000, burnt: true, w: 110 },
        { type: 'smolder', x: 2100, w: 90, h: 20, plume: 300 },
        { type: 'tree', kind: 'dead', x: 600, h: 240 },
      ],
    },
    {
      id: 'crowdNear', p: 0.62, s: 0.6, ground: 0.765, haze: 0.25, mist: 0.24, mistH: 50,
      terrain: { amp: 8, freq: 0.03, seed: 17 },
      crowds: [{ from: 2500, to: 5200, count: 450, focus: CX, spread: 1000, base: 0.3, depth: 22, raise: 0.06 }],
      items: [
        { type: 'ruin', x: 800, w: 300, h: 200, side: -1 },
        { type: 'mound', x: 1650, w: 140, h: 40 },
        { type: 'smolder', x: 1650, w: 140, h: 40, plume: 280 },
        { type: 'tree', kind: 'palm', x: 2250, h: 250, bend: 0.25 },
        { type: 'ruin', x: 4700, w: 240, h: 160, side: 1 },
      ],
    },
    {
      id: 'crowdClose', p: 0.78, s: 0.76, ground: 0.79, haze: 0.16, mist: 0.18, mistH: 40,
      terrain: { amp: 6, freq: 0.03, seed: 19 },
      crowds: [{ from: 2700, to: 5000, count: 300, focus: CX, spread: 900, base: 0.3, depth: 14, raise: 0.05 }],
      items: [
        { type: 'slab', x: 1150, w: 140, h: 60, rot: -0.3 },
        { type: 'stones', x: 1200, count: 8 },
        { type: 'tree', kind: 'dead', x: 2050, h: 280 },
      ],
    },
    {
      id: 'dais', p: 0.9, s: 0.9, ground: 0.81, haze: 0.08, mist: 0.12, mistH: 30,
      terrain: { amp: 5, freq: 0.03, seed: 23 },
      crowds: [{
        from: 2900, to: 4800, count: 140, focus: CX, spread: 600, base: 0.3, depth: 8,
        avoid: [[CX - 340, CX + 340]], mix: { adult: 4, woman: 3, child: 2, kneel: 3, bow: 2 },
      }],
      items: [
        { type: 'platform', x: CX },
        { type: 'column', x: CX - 430, h: 220 },
        { type: 'column', x: CX + 400, h: 200, broken: false },
        { type: 'children', x: CX, r: 200, count: 16 },
        { type: 'christ', x: CX, y: 66, glow: 440, pillar: 70 },
      ],
    },
    {
      id: 'path', p: 1, s: 1, ground: 0.835, haze: 0, player: true,
      terrain: { amp: 6, freq: 0.02, seed: 29 },
      crowds: [{ from: 3000, to: 4700, count: 70, focus: CX, spread: 600, avoid: [[CX - 380, CX + 360]], depth: 4 }],
      items: [
        { type: 'ruin', x: 120, w: 280, h: 230, side: 1 },
        { type: 'tree', kind: 'dead', x: 380, h: 270 },
        { type: 'stones', x: 640, count: 7 },
        { type: 'slab', x: 860, w: 130, h: 46, rot: 0.35 },
        { type: 'mound', x: 1060, w: 130, h: 36 },
        { type: 'smolder', x: 1060, w: 130, h: 36, plume: 320 },
        { type: 'fissure', x: 1260, len: 420, depth: 34 },
        { type: 'drums', x: 1520, n: 4 },
        { type: 'column', x: 1760, h: 210, rot: -0.09 },
        { type: 'tree', kind: 'brokenPalm', x: 1980, h: 240 },
        { type: 'slab', x: 2150, w: 100, h: 60, rot: -0.3 },
        { type: 'mound', x: 2420, w: 90, h: 28 },
        { type: 'smolder', x: 2420, w: 90, h: 28, plume: 240 },
        { type: 'ruin', x: 2650, w: 200, h: 140, side: -1 },
        { type: 'fissure', x: 2900, len: 300, depth: 50 },
        { type: 'stones', x: 3250, count: 6 },
        { type: 'tree', kind: 'palm', x: 4420, h: 280, bend: 0.2 },
        { type: 'stones', x: 4600, count: 8 },
      ],
    },
    {
      id: 'front', p: 1.4, s: 1.5, ground: 0.985, haze: 0,
      terrain: { amp: 12, freq: 0.012, seed: 31 },
      crowds: [{ from: 3000, to: 5400, count: 50, focus: CX, spread: 900, avoid: [[CX - 800, CX + 500]], sink: 70 }],
      items: [
        ...grassRow(-200, 5200, 260, 7),
        { type: 'column', x: 1300, h: 300, r: 18, rot: 0.14 },
        { type: 'stones', x: 700, count: 5, size: 22 },
        { type: 'stones', x: 2300, count: 6, size: 22 },
        { type: 'tree', kind: 'dead', x: 2700, h: 200, rot: 0.2 },
      ],
    },
  ],

  captions: [
    { from: 0, to: 1100, text: 'And it was in the morning, and the darkness dispersed from off the face of the land.', ref: '3 Nephi 10:9' },
    { from: 1500, to: 2600, text: 'There were a great multitude gathered together, of the people of Nephi, round about the temple which was in the land Bountiful.', ref: '3 Nephi 11:1' },
    { from: 2900, to: 3500, text: 'They saw a Man descending out of heaven; and he was clothed in a white robe.', ref: '3 Nephi 11:8' },
    { from: 3550, to: 4500, text: 'Behold, I am Jesus Christ, whom the prophets testified shall come into the world.', ref: '3 Nephi 11:10' },
  ],
};
