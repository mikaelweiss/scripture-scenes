// Jacob 2: Jacob teaches the people of Nephi from the temple, the people gathered on its steps and in its court.
// x is east, z is south. The temple faces east; Jacob stands at the head of the stair.
import { leafyTrees, makeRng, person, scatter } from './lib/bom-07-kit.js';
import { buildTemple, houses } from './lib/bom-07-temple.js';

const JACOB = [22, 0];

export default {
  title: 'Jacob 2: Jacob teaches at the temple',
  subtitle: 'The temple in the city of Nephi',
  seed: 26,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#efd8b0', near: 140, far: 1100 },
  },

  sky: { zenith: '#2f6690', mid: '#82b0c8', horizon: '#f6deb0', ground: '#c8b088', glowColor: '#ffeac0', glowDir: [0.8, 0.4, 0.2] },

  sun: { dir: [0.75, 0.6, 0.3], color: '#fff0d4', intensity: 2.6, hemi: { sky: '#dcecf0', ground: '#a88456', intensity: 1.1 }, shadowSize: 80 },

  ground: {
    size: 1600, segments: 320, flatRadius: 160, hillHeight: 70, undulation: 0.25,
    plaza: { center: [6, 0], size: [104, 76] },
    colors: {
      sand: '#b7aa6c', dirt: '#a8935e', grass: '#8a9e54', grassDark: '#6c7a42', plaza: '#e0cfa4', plazaLine: '#c9b080',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6f8f5a',
    },
  },

  mountains: { count: 34, distance: [520, 800], height: [110, 240], widthRatio: [1.3, 2.2], colors: ['#6f8a8a', '#5d7a80', '#7a9088', '#86988f'] },

  objects: [],

  clouds: { layers: [{ count: 34, distance: [380, 800], height: [90, 200], size: [40, 90], color: '#fffaf0', shade: '#5a6a80' }] },

  custom(ctx) {
    const rng = makeRng(12);
    const temple = buildTemple(ctx, { pos: [0, 0] });
    const court = (x, z) => x > -45 && x < 60 && Math.abs(z) < 42;
    const road = (x, z) => Math.abs(z) < 6 && x > 0;
    houses(ctx, scatter(ctx, rng, 80, { center: [10, 0], ring: [62, 160], margin: 5, reject: (x, z) => court(x, z) || road(x, z) }), { seed: 8 });
    leafyTrees(ctx, scatter(ctx, rng, 70, { center: [0, 0], ring: [90, 220], margin: 4, reject: road }), { height: [6, 10], leaves: ['#5a8a44', '#4a7a3e', '#6a9a4a'] });

    // Jacob in a white robe with a priestly mantle, his brother Joseph beside him.
    person(ctx, { robe: '#f3eddf', mantle: '#4f7f80', skin: '#a87650', hair: '#3a2418', sash: '#c8912e', arms: [0.7, 1.0] }, { pos: JACOB, face: [60, 0], y: temple.podium, scale: 1.1 });
    person(ctx, { robe: '#efe6d2', mantle: '#8c5a3c', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e' }, { pos: [20.6, -3.2], face: [60, 0], y: temple.podium });
  },

  crowd: {
    seed: 12,
    minSpacing: 0.66,
    facing: JACOB,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#c08f66'],
      hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
    },
    aisles: [{ from: [27, 0], to: [60, 3], width: 3 }],
    keepClear: [{ kind: 'circle', x: JACOB[0], z: JACOB[1], r: 4 }],
    groups: [
      { shape: 'rect', center: [24.1, 0], size: [2.8, 13], count: 30, kneel: 0.7, children: 0.2 },
      { center: JACOB, radius: [6, 30], angle: [0.25, 2.9], count: 520, kneel: 0.3, children: 0.2 },
      { shape: 'rect', center: [18, 16], size: [12, 3], count: 18, kneel: 0.2 },
      { shape: 'rect', center: [18, -16], size: [12, 3], count: 18, kneel: 0.2 },
    ],
  },

  player: {
    start: [41, 1.3],
    lookAt: JACOB,
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
