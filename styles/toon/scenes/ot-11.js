// Genesis 24:10-27: at evening Abraham's servant waits by the well outside the city of Nahor with ten kneeling camels, and Rebekah comes with her pitcher.
import { Batch, DAY_STYLE, DESERT_GROUND, PALETTE, addSun, camel, cityWall, figure, house, jar, makeRng, palm, rocks, well } from './lib/ot-07-kit.js';

const WELL = [0, -3];
const REBEKAH = [2.4, -0.4];
const SERVANT = [-3.6, 2.2];

const REBEKAH_COLORS = { robe: '#b5523b', mantle: '#4f7f80', skin: '#b5825a', hair: '#efe3c2', sash: '#c8912e', arms: [0.35, 0.75] };
const SERVANT_COLORS = { robe: '#7a6a52', mantle: '#c8912e', skin: '#9c6a45', hair: '#e6d8b8', sash: '#5e4632', arms: [0.25, 0.4] };

function nahor(ctx, b) {
  const rng = makeRng(24);
  cityWall(b, ctx, { from: [-60, -58], to: [-6, -58], height: 7, color: '#c9ad80' });
  cityWall(b, ctx, { from: [6, -58], to: [60, -58], height: 7, color: '#c9ad80' });
  for (const x of [-7.5, 7.5]) house(b, ctx, { pos: [x, -58], size: [3, 3], height: 9, color: '#bfa274', trim: '#8c5a3c', door: null });
  for (let i = 0; i < 26; i++) {
    const x = (rng() - 0.5) * 110, z = -66 - rng() * 30;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 4, 5 + rng() * 3], height: 5 + rng() * 6, rot: (rng() - 0.5) * 0.3, color: rng() < 0.5 ? '#d6bf95' : '#cdb48a', trim: '#a87b4f', lit: rng() < 0.3 });
  }
}

export default {
  title: 'Genesis 24:10-27: Rebekah at the well',
  subtitle: 'Evening outside the city of Nahor, when the women go out to draw water',
  seed: 24,

  style: { ...DAY_STYLE, fog: { color: '#f0c896', near: 110, far: 900 } },

  sky: { zenith: '#3a4a86', mid: '#c28a8a', horizon: '#ffc27a', ground: '#c99a6a', glowColor: '#ffe0a0', glowDir: [-0.95, 0.12, -0.3] },

  sun: {
    dir: [-0.9, 0.32, -0.3],
    color: '#ffc890',
    intensity: 2.4,
    hemi: { sky: '#e8c0b0', ground: '#8a5a3c', intensity: 1.0 },
    shadowSize: 60,
  },

  ground: {
    size: 1400, segments: 260, flatRadius: 100, hillHeight: 32, undulation: 0.35,
    plaza: { center: [0, -30], size: [5, 54] },
    colors: { ...DESERT_GROUND, plaza: '#d8b880', plazaLine: '#c4a26c' },
  },

  mountains: { count: 30, distance: [460, 760], height: [50, 130], widthRatio: [1.6, 2.6], colors: ['#9a7a86', '#8a6e80', '#a6848a'] },

  objects: [],

  custom(ctx) {
    addSun(ctx, { dir: [-0.95, 0.12, -0.3], size: 80, color: '#ffe8b0', halo: '#ffb070' });
    const b = new Batch(ctx);
    well(b, ctx, { pos: WELL, rot: Math.PI });
    nahor(ctx, b);
    const camels = [
      [-6.5, 4.5, 0.9], [-8.8, 2.2, 1.1], [-10.6, -0.6, 1.3], [-11.6, -3.8, 1.5], [-6.8, 8.2, 0.7],
      [-9.8, 6.4, 0.9], [-12.6, 3.4, 1.1], [-14.2, 0, 1.3], [-4, 7, 0.5], [-14.6, -4.6, 1.6],
    ];
    camels.forEach(([x, z, r], i) => camel(b, ctx, { pos: [x, z], rot: Math.PI * 0.5 + (r - 1.1) * 0.5, couched: true, color: ['#c49a62', '#b4905e', '#a88458', '#c8a46e'][i % 4], load: i % 3 === 0 ? '#8c3a2c' : null }));
    jar(b, ctx, { pos: [3.1, -1.6], color: '#b5653b' });
    jar(b, ctx, { pos: [-1.6, -0.6], color: '#a85a34', scale: 0.9 });
    for (const [x, z, h, s] of [[12, -8, 9, 1], [16, -3, 8, 2], [-20, -14, 10, 3], [22, 8, 8.5, 4], [-24, 10, 9, 5], [9, -18, 7.5, 6]]) palm(b, ctx, { pos: [x, z], height: h, lean: 0.18, dir: s, seed: s });
    rocks(b, ctx, { ring: [10, 120], count: 110, size: [0.2, 0.9], colors: ['#c9b08a', '#b89a70', '#d9c39a'], avoid: (x, z) => Math.abs(x) < 5 && z < 0 });
    b.flush();

    const reb = figure(ctx, { pos: REBEKAH, face: SERVANT, colors: REBEKAH_COLORS, scale: 0.98 });
    const jb = new Batch(ctx);
    jar(jb, ctx, { pos: [REBEKAH[0] + 0.24, REBEKAH[1]], y: reb.position.y + 1.42, color: '#c06a3c', scale: 0.8 });
    jb.flush();
    figure(ctx, { pos: SERVANT, face: REBEKAH, colors: SERVANT_COLORS, scale: 1.04, lean: 0.06 });
  },

  crowd: {
    seed: 24,
    minSpacing: 0.8,
    facing: WELL,
    colors: { ...PALETTE, wraps: ['#e6d8b8', '#efe3c2', '#d9c7a3', '#c8912e'] },
    groups: [
      { shape: 'rect', center: [0, -18], size: [3, 14], count: 5, facing: [0, 10] },
      { center: [-16, 6], radius: [0, 2], count: 3, facing: SERVANT },
      { center: [5, -5.5], radius: [0, 1.4], count: 2, facing: WELL },
    ],
  },

  player: {
    start: [4, 8.5],
    lookAt: [-3, -1],
    colors: { robe: '#8c5a3c', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
