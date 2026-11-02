// 2 Nephi 5:5-16: in the new city of Nephi, Nephi builds a temple after the manner of Solomon's.
// x is east, z is south. The temple faces east; its north chambers are still in scaffolding.
import { leafyTrees, makeRng, person, scatter } from './lib/bom-07-kit.js';
import { buildTemple, houses } from './lib/bom-07-temple.js';

const NEPHI = [40.5, 8];

export default {
  title: '2 Nephi 5:5-16: Nephi builds a temple',
  subtitle: 'The city of Nephi, in the land of Nephi',
  seed: 25,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e8dcbc', near: 140, far: 1100 },
  },

  sky: { zenith: '#2f6f9a', mid: '#78aed0', horizon: '#f0e2c0', ground: '#c8b088', glowColor: '#fff4d0', glowDir: [0.6, 0.6, 0.3] },

  sun: { dir: [0.6, 0.8, 0.35], color: '#fff2da', intensity: 2.6, hemi: { sky: '#dcecf0', ground: '#a88456', intensity: 1.1 }, shadowSize: 80 },

  ground: {
    size: 1600, segments: 320, flatRadius: 160, hillHeight: 70, undulation: 0.25,
    plaza: { center: [6, 0], size: [104, 76] },
    colors: {
      sand: '#b7aa6c', dirt: '#a8935e', grass: '#8a9e54', grassDark: '#6c7a42', plaza: '#e0cfa4', plazaLine: '#c9b080',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6f8f5a',
    },
  },

  mountains: { count: 34, distance: [520, 800], height: [110, 240], widthRatio: [1.3, 2.2], colors: ['#6f8a8a', '#5d7a80', '#7a9088', '#86988f'] },

  objects: [
    { type: 'stones', count: 220, center: [20, 10], ring: [4, 40], size: [0.12, 0.35], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],

  clouds: { layers: [{ count: 34, distance: [380, 800], height: [90, 200], size: [40, 90], color: '#fffaf0', shade: '#5a6a80' }] },

  custom(ctx) {
    const rng = makeRng(11);
    buildTemple(ctx, { pos: [0, 0], building: true });
    const court = (x, z) => x > -45 && x < 60 && Math.abs(z) < 42;
    const road = (x, z) => Math.abs(z) < 6 && x > 0;
    houses(ctx, scatter(ctx, rng, 70, { center: [10, 0], ring: [62, 150], margin: 5, reject: (x, z) => court(x, z) || road(x, z) }));
    leafyTrees(ctx, scatter(ctx, rng, 70, { center: [0, 0], ring: [90, 220], margin: 4, reject: road }), { height: [6, 10], leaves: ['#5a8a44', '#4a7a3e', '#6a9a4a'] });

    const nephi = person(ctx, { robe: '#efe4c8', mantle: '#8f3326', skin: '#a87650', hair: '#3a2418', sash: '#d9a23a', arms: [0.12, 0.2] }, { pos: NEPHI, face: [47, 4], scale: 1.18 });
    nephi.children.at(-2).rotation.set(-0.5, 0, -2.3);
    for (const [x, z, f] of [[24, 10, [28, 12]], [26, 14, [28, 12]], [14, -19, [14, -23]], [16, -19, [14, -23]]]) {
      person(ctx, { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', sash: '#7a6a52', arms: [0.2, 1.7] }, { pos: [x, z], face: f });
    }
  },

  crowd: {
    seed: 11,
    minSpacing: 0.8,
    facing: [10, 14],
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#e6d8b8', '#9c6b4e'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3'],
      skins: ['#9c6a45', '#a87650', '#b5825a', '#c08f66'],
      hair: ['#2b1a12', '#3a2418', '#1f140e'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#4f7f80'],
    },
    groups: [
      { shape: 'rect', center: [13, 25], size: [10, 6], count: 12, facing: [13, 18] },
      { shape: 'rect', center: [-6, 16], size: [26, 3], count: 8, facing: [-6, 10] },
      { shape: 'rect', center: [36, -14], size: [12, 10], count: 10, facing: [0, 0], children: 0.3 },
      { shape: 'rect', center: [36, -4], size: [8, 6], count: 9, facing: [0, 0], children: 0.25 },
      { shape: 'rect', center: [80, 0], size: [40, 10], count: 24, facing: [0, 0], children: 0.2 },
    ],
  },

  player: {
    start: [45, 1.5],
    lookAt: [0, 4],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
