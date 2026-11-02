// Alma 17: at the waters of Sebus, Ammon stands alone against the raiders while the servants gather the scattered flocks.
// x is east, z is south. The water runs east-west to the north; the raiders gather on the east bank.
import { LAMANITES, NO_PLAZA, figure, flock, rocks, rods, toonStyle, water } from './lib/bom-19-kit.js';

const AMMON = [2, -4];
const RAIDERS = [18, -9];
const SERVANTS = [[-7, 5], [-11, 2], [-4, 9], [-13, 8]];
const HERD = [-9, 6];

const CLUB_MEN = [];
for (let i = 0; i < 9; i++) CLUB_MEN.push([RAIDERS[0] + (i % 3) * 1.6 + (i > 5 ? 1 : 0), RAIDERS[1] - 1.8 + Math.floor(i / 3) * 1.8]);

export default {
  title: 'Alma 17:26-39: Ammon defends the king\'s flocks',
  subtitle: 'The waters of Sebus in the land of Ishmael',
  seed: 17,

  style: toonStyle({ fog: '#e4dcc0', near: 110, far: 900 }),

  sky: { zenith: '#2f6c8a', mid: '#7fb2b8', horizon: '#efe2bc', ground: '#c8b48a', glowColor: '#fff6dc', glowDir: [0.4, 0.7, -1] },

  sun: {
    dir: [0.4, 0.85, 0.5],
    color: '#fff2da',
    intensity: 2.6,
    hemi: { sky: '#d6e8e6', ground: '#9a7a52', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 110,
    hillHeight: 40,
    undulation: 0.18,
    plaza: NO_PLAZA,
    colors: {
      sand: '#c9b07a', dirt: '#b39060', grass: '#88a05a', grassDark: '#688044', plaza: '#c9b07a', plazaLine: '#c9b07a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7a9a64',
    },
  },

  mountains: { count: 32, distance: [500, 800], height: [60, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 110, ring: [30, 220], height: [5, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 400, ring: [3, 70], size: [0.1, 0.4], colors: ['#c9b07a', '#a8926a', '#d6c094'] },
  ],

  custom(ctx) {
    water(ctx, { center: [0, -24], size: [180, 14], rot: 0.05, color: '#3f8ea0', flow: [1, 0] });
    water(ctx, { center: [-22, -38], size: [30, 22], rot: -0.3, color: '#3a8698', flow: [1, 0.2] });
    rocks(ctx, [
      { pos: [-30, -16], size: [2.6, 1.6, 2] }, { pos: [26, -16], size: [3, 2, 2.4] }, { pos: [8, -16.5], size: [1.6, 1, 1.4] },
      { pos: [34, -4], size: [5, 3, 4] }, { pos: [-40, 4], size: [4, 2.4, 3] },
    ], ['#a8957a', '#9a8670', '#8a7a64']);

    figure(ctx, {
      pos: AMMON, facing: RAIDERS, scale: 1.06,
      colors: { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#b5825a', hair: '#2b1a12', sash: '#c8912e', arms: [0.3, 2.5] },
    });

    CLUB_MEN.forEach(([x, z], i) => {
      const raise = i % 2 === 0;
      figure(ctx, {
        pos: [x, z], facing: AMMON, clear: 0.7,
        colors: { robe: LAMANITES.robes[i % 6], mantle: LAMANITES.mantles[i % 5], skin: LAMANITES.skins[i % 4], hair: '#1f140e', sash: '#b5523b', arms: raise ? [0.35, 2.4] : [0.25, 0.5] },
      });
    });
    rods(ctx, CLUB_MEN.map(([x, z], i) => {
      const dx = AMMON[0] - x, dz = AMMON[1] - z, l = Math.hypot(dx, dz);
      const sx = -dz / l, sz = dx / l;
      return i % 2 === 0
        ? { from: [x + sx * 0.4, 2.1, z + sz * 0.4], to: [x + sx * 0.5 - dx / l * 0.3, 3.0, z + sz * 0.5 - dz / l * 0.3], radius: 0.07, ground: true }
        : { from: [x + sx * 0.45, 0.6, z + sz * 0.45], to: [x + sx * 0.5 + dx / l * 0.5, 1.3, z + sz * 0.5 + dz / l * 0.5], radius: 0.07, ground: true };
    }), '#3a2418');

    SERVANTS.forEach(([x, z], i) => figure(ctx, {
      pos: [x, z], facing: i < 2 ? AMMON : HERD, clear: 0.7,
      colors: { robe: ['#d9c7a3', '#b5733b', '#a8552f', '#c98b3c'][i], mantle: LAMANITES.mantles[i], skin: LAMANITES.skins[i], hair: '#1f140e', sash: '#c8912e', arms: [0.25, 0.4] },
    }));

    flock(ctx, { center: HERD, radius: [0, 6], count: 45, seed: 2, facing: [-12, 14], jitter: 2, graze: 0.4 });
    flock(ctx, { center: [-4, -10], radius: [2, 12], count: 26, seed: 7, facing: [-20, 10], jitter: 0.6, graze: 0 });
    flock(ctx, { center: [24, 8], radius: [4, 16], count: 24, seed: 9, facing: [50, 30], jitter: 0.8, graze: 0 });
    flock(ctx, { center: [-26, 18], radius: [3, 14], count: 22, seed: 11, jitter: 6, graze: 0.5 });
  },

  crowd: {
    seed: 23,
    minSpacing: 0.8,
    facing: AMMON,
    colors: LAMANITES,
    groups: [
      { center: [28, -6], radius: [0, 4], count: 10, facingJitter: 0.4 },
      { center: [32, -12], radius: [0, 3], count: 6, facingJitter: 0.4 },
    ],
  },

  player: {
    start: [-3.5, 3.5],
    lookAt: [12, -7],
    colors: { robe: '#a8552f', mantle: '#5e4632', skin: '#8a5a3b', hair: '#1f140e', sash: '#c8912e' },
  },
};
