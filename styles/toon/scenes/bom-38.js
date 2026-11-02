// 3 Nephi 1:4-21: the believers wait on the day set for their death. The sun goes down and there is no darkness.
import { BASE_STYLE, GROUND_COLORS, MOUNTAINS, ROBES, figure, kneeling, newStar, raiseArm, skyDisc, town, makeRng, between, pick } from './lib/bom-37-kit.js';

const NEPHI = [0, -10];
const NEPHI_COLORS = { robe: '#efe3c2', mantle: '#3e6e8e', skin: '#a8724a', hair: '#3a2418', sash: '#c8912e' };
const SUNSET = [-0.18, 0.075, -1];
const STAR = [0.16, 0.3, -1];

export default {
  title: '3 Nephi 1:4-21: The night without darkness',
  subtitle: 'The sun has set, and the land is still as bright as noonday',
  seed: 38,

  style: { ...BASE_STYLE, fog: { color: '#f4d9a8', near: 140, far: 950 } },

  sky: { zenith: '#3f7fb8', mid: '#8cc0d6', horizon: '#ffd79a', ground: '#d9b98a', glowColor: '#ffc46e', glowDir: SUNSET },

  sun: { dir: [0.35, 0.8, -0.5], color: '#fff2da', intensity: 2.5, hemi: { sky: '#e0ecf2', ground: '#b88a5a', intensity: 1.2 }, shadowSize: 70 },

  ground: {
    size: 1200, segments: 240, flatRadius: 140, hillHeight: 32, undulation: 0.25,
    plaza: { center: [0, 34], size: [70, 16] },
    colors: GROUND_COLORS,
  },

  mountains: { ...MOUNTAINS, height: [22, 70], colors: ['#8aa6a0', '#7e9e98', '#94aca2'] },

  objects: [
    { type: 'trees', count: 120, ring: [60, 230], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 50, ring: [4, 50], size: [0.1, 0.3], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],

  custom(ctx) {
    skyDisc(ctx, SUNSET, { size: 150, color: '#ffbe5c', opacity: 1 });
    skyDisc(ctx, SUNSET, { size: 420, color: '#ffd79a', opacity: 0.55 });
    newStar(ctx, STAR, { size: 70, color: '#fffbe8' });

    kneeling(ctx, NEPHI_COLORS, NEPHI, { facing: [0, -40], bow: 0.75, scale: 1.05 });

    const rng = makeRng(38);
    for (let i = 0; i < 18; i++) {
      const x = between(rng, [-24, 24]), z = between(rng, [-2, 14]);
      if (Math.abs(x) < 3) continue;
      const c = { robe: pick(rng, ROBES.robes), mantle: pick(rng, ROBES.mantles), skin: pick(rng, ROBES.skins), hair: pick(rng, ROBES.hair) };
      const f = figure(ctx, c, [x, z], { facing: [x * 0.6, -60], clear: 0.7 });
      raiseArm(ctx, f, c, 1, 2.7, 0.15);
      if (rng() < 0.6) raiseArm(ctx, f, c, -1, 2.7, 0.15);
    }

    const unbeliever = () => ({ robe: pick(rng, ['#6b2f4a', '#4a3a5a', '#8c5a3c', '#5e4632']), mantle: pick(rng, ['#c8912e', '#2b1a12', '#7a6a52']), skin: pick(rng, ROBES.skins), hair: '#2b1a12' });
    for (let i = 0; i < 14; i++) {
      const x = between(rng, [40, 54]), z = between(rng, [-4, 16]);
      figure(ctx, unbeliever(), [x, z], { facing: [x - 20, z - 30], pose: 'lying', clear: 1.1 });
    }

    town(ctx, {
      seed: 8, count: 40, area: [-110, 44, 110, 120],
      facing: [0, 0],
      colors: ['#e3cfa6', '#d9c49a', '#cdb48a', '#e8d6ae'],
      roofs: ['#b98a5a', '#a87b4f', '#c49a68'],
      trims: [['#b5523b', '#efe3c2'], ['#2f8f8a', '#efe3c2']],
    });
    town(ctx, {
      seed: 9, count: 14, area: [55, -20, 110, 44],
      facing: [0, 0],
      colors: ['#e3cfa6', '#d9c49a', '#cdb48a'],
      roofs: ['#b98a5a', '#a87b4f'],
    });
  },

  clouds: {
    layers: [
      { count: 30, gap: [-0.5, 0.2], distance: [380, 800], height: [70, 170], size: [40, 90], color: '#fff1d8', shade: '#c08a6a' },
    ],
  },

  crowd: {
    seed: 38,
    minSpacing: 0.66,
    facing: [0, -200],
    colors: ROBES,
    aisles: [{ from: [0, 40], to: [0, -6], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: NEPHI[0], z: NEPHI[1], r: 3 }],
    groups: [
      { center: NEPHI, radius: [5, 32], angle: [-1.75, 1.75], count: 850, kneel: 0.45, children: 0.14, facingJitter: 0.4 },
      { shape: 'rect', center: [50, 26], size: [16, 14], count: 80, facing: [10, -60], colors: { ...ROBES, robes: ['#6b2f4a', '#4a3a5a', '#8c5a3c', '#5e4632', '#7a6a52'] } },
    ],
  },

  player: {
    start: [0, 6],
    lookAt: [0, -40],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
