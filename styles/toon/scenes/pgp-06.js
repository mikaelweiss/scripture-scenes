// Abraham 3:22-28: the noble and great spirits assembled before the world was, and the Lord in their midst.
// A symbolic place of cloud and light. Coordinates are meters. x is east, z is south. The council seat stands to the north.
import { BASE_STYLE, DIVINE, between, figure, glow, makeRng, motes, stars } from './lib/pgp-01-kit.js';

const SEAT = [0, -34];
const FATHER = [-1.4, -36];
const SON = [1.4, -35.4];
const ABRAHAM = [-3, -16.5];

const SPIRITS = {
  robes: ['#fbf7ee', '#f3eddf', '#efe6f4', '#e8eef8', '#f6eedc', '#eef4ee', '#f8f0e8'],
  mantles: ['#e8dcc0', '#d8d0e8', '#d0dcec', '#e8e0d0', '#f3eddf', '#e0e8dc'],
  skins: ['#e8d8c8', '#e0ccb8', '#d8c0a8', '#ecdcc8'],
  hair: ['#f3eddf', '#e8dcc0', '#d8ccb8'],
  wraps: ['#fbf7ee', '#efe6f4', '#e8eef8'],
};

export default {
  title: 'Abraham 3:22-28: The Council in Heaven',
  subtitle: 'Among all these there were many of the noble and great ones',
  seed: 106,

  style: { ...BASE_STYLE, ink: '#3a3050', fog: { color: '#cbbcd8', near: 120, far: 700 } },

  sky: {
    zenith: '#1a1e4a',
    mid: '#38387a',
    horizon: '#c8a8c0',
    ground: '#efe6f4',
    glowColor: '#f8dcb0',
    glowDir: [0, 0.35, -1],
  },

  sun: {
    dir: [0.2, 0.9, 0.4],
    color: '#fff6e8',
    intensity: 2.2,
    hemi: { sky: '#e8e4ff', ground: '#e8d8c8', intensity: 1.4 },
    shadowSize: 70,
  },

  ground: {
    size: 1600,
    segments: 240,
    flatRadius: 180,
    hillHeight: 14,
    undulation: 0.5,
    plaza: { center: [0, -34], size: [26, 26] },
    colors: {
      sand: '#dcd4ec',
      dirt: '#d4cce6',
      grass: '#e4dcec',
      grassDark: '#e0d8ec',
      plaza: '#fff8e8',
      plazaLine: '#f0e2c4',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#dcd4ec',
    },
  },

  objects: [
    {
      type: 'platform',
      pos: SEAT,
      tiers: [
        { size: [16, 12], height: 1.2 },
        { size: [9, 6], height: 1.2, offset: [0, -1.5] },
      ],
      stairWidth: 5,
      rise: 0.27,
      stairDepth: 0.45,
      colors: { stone: '#fbf7ee', stair: '#f3eddf', fret: ['#e8d6a8', '#fbf7ee'] },
    },
  ],

  custom(ctx) {
    stars(ctx, { count: 1600, size: 2, minY: 0.12, seed: 21 });
    stars(ctx, { count: 200, size: 3.2, minY: 0.2, color: '#fff2c8', seed: 6 });
    figure(ctx, DIVINE, FATHER, { facing: [0, 20], scale: 1.3, glow: 0.55, clear: 1.2 });
    figure(ctx, { ...DIVINE, arms: [0.35, 0.5] }, SON, { facing: [0, 20], scale: 1.22, glow: 0.5, clear: 1.2 });
    const y = ctx.groundHeight(...FATHER);
    glow(ctx, [0, y + 1.6, -35.6], 12, '#ffd890', 0.9);
    glow(ctx, [0, y + 2.2, -35.6], 30, '#ffc870', 0.45, 0.02);
    figure(ctx, { robe: '#f6eedc', mantle: '#e8d6a8', skin: '#e0ccb8', hair: '#f3eddf', sash: '#c8a860' }, ABRAHAM, { facing: SEAT, scale: 1.02, glow: 0.2, clear: 0.9 });

    const rng = makeRng(9);
    const pts = [];
    for (let i = 0; i < 600; i++) {
      const a = rng() * Math.PI * 2, r = between(rng, [4, 70]);
      pts.push(Math.sin(a) * r, between(rng, [0, 6]), SEAT[1] + 20 + Math.cos(a) * r);
    }
    motes(ctx, pts, { color: '#fff6d8', size: 2.4, rise: 0.6, span: 24 });
  },

  clouds: {
    puffs: [5, 9],
    layers: [
      { count: 50, center: SEAT, distance: [95, 170], height: [-7, -3], size: [9, 16], color: '#fbf7ff', shade: '#b8acd8', drift: 0.002 },
      { count: 40, center: SEAT, distance: [300, 600], height: [-30, -10], size: [40, 70], color: '#fff6ea', shade: '#a89cc8', drift: -0.001 },
      { count: 20, center: SEAT, distance: [30, 70], height: [70, 110], size: [20, 34], color: '#fffaf0', shade: '#a8a0c8', drift: 0.004 },
    ],
  },

  light: {
    beams: [{ from: [0, 220, -35.6], to: { at: SEAT, lift: 2.4 }, width: [22, 8], color: '#fff2c9', intensity: 0.2, layers: 3, stripes: 28, fadeLow: 0.04 }],
    rayFans: [{ source: [0, 260, -40], sourceJitter: 60, target: [0, -10], groundY: 0, spread: [10, 50], count: 9, width: [[4, 8], [8, 14]], color: '#fff0c4', intensity: 0.14, stripes: 9, fadeLow: 0.3 }],
    rings: [{ at: SEAT, lift: 2.4, radius: 4.2, width: 0.3, height: 3, color: '#ffe0a0', intensity: 0.7, wallIntensity: 0.35 }],
    pointLights: [{ at: SEAT, lift: 3, color: '#fff0c8', intensity: 16, distance: 26 }],
  },

  crowd: {
    seed: 12,
    minSpacing: 0.66,
    facing: SEAT,
    colors: SPIRITS,
    aisles: [{ from: [0, 40], to: [0, -26], width: 3.4 }],
    keepClear: [{ kind: 'rect', x: 0, z: -34, hx: 9.5, hz: 7.5 }],
    groups: [
      { center: SEAT, radius: [11, 16], angle: [-1.7, 1.7], count: 120, kneel: 0, children: 0 },
      { center: SEAT, radius: [16, 58], angle: [-2.1, 2.1], count: 2400, kneel: 0.08, children: 0 },
    ],
  },

  player: {
    start: [1.2, -11],
    lookAt: SEAT,
    colors: { robe: '#fbf7ee', mantle: '#e8dcc0', skin: '#e0ccb8', hair: '#d8ccb8', sash: '#c8a860' },
  },
};
