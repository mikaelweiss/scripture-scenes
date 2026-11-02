// Luke 24:13-32: at evening in Emmaus the risen Lord breaks bread, and two disciples know him.
// The road from Jerusalem runs east-west across the front. The house at the road's edge opens toward it.
import { Batch, DAY_STYLE, PALETTE, bush, glow, house, lamp, olive, palm, person, room, scatterRocks, table } from './lib/nt-25-kit.js';

const ROOM = [0, -3];
const TABLE = [0, -3.4];
const CHRIST = [0, -4.6];

const CHRIST_COLORS = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#c9905f', hair: '#5a3a22', sash: '#e9dcc0', arms: [0.3, 1.25] };
const CLEOPAS = { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a87650', hair: '#3a2418', sash: '#5e4632', arms: [0.2, 0.9] };
const FRIEND = { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#9c6a45', hair: '#2b1a12', sash: '#b5523b', arms: [0.35, 0.5] };

export default {
  title: 'Luke 24:13-32: The road to Emmaus',
  subtitle: 'Evening at Emmaus. He took bread, and blessed it, and brake.',
  seed: 25,

  style: { ...DAY_STYLE, fog: { color: '#e9b892', near: 90, far: 900 } },

  sky: { zenith: '#3d4476', mid: '#b6748a', horizon: '#ffbf7a', ground: '#b48a6a', glowColor: '#ffcf8a', glowDir: [-1, 0.12, -0.3] },

  sun: {
    dir: [-0.85, 0.32, -0.25],
    color: '#ffc58a',
    intensity: 2.2,
    hemi: { sky: '#c9a7c0', ground: '#8a5a3a', intensity: 1.0 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 260,
    flatRadius: 90,
    hillHeight: 34,
    undulation: 0.4,
    plaza: { center: [40, 7], size: [180, 4.4] },
    colors: {
      sand: '#c9a06a',
      dirt: '#b48654',
      grass: '#8a9256',
      grassDark: '#6c7642',
      plaza: '#d8b47e',
      plazaLine: '#cba672',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#8a8c5e',
    },
  },

  mountains: { count: 30, distance: [460, 760], height: [50, 120], widthRatio: [1.8, 2.8], colors: ['#8a6a86', '#7a5e7e', '#9a7890', '#6e5a78'] },

  objects: [
    { type: 'stones', count: 260, ring: [6, 90], size: [0.1, 0.35], colors: ['#c2a27a', '#a88a66', '#d0b48a'] },
  ],

  custom(ctx) {
    const b = new Batch(ctx);
    const r = room(b, ctx, { pos: ROOM, size: [9, 7], height: 3.2, color: '#d8c095', floor: '#a8885e', beam: '#6b4a33', windows: [[-3, 2.1, 'back'], [3, 2.1, 'back']] });
    const topY = table(b, ctx, { pos: TABLE, y: r.y, size: [2.6, 1.3], height: 0.45 });
    lamp(b, ctx, { pos: [0.95, -3.7], y: topY, light: { color: '#ffb060', intensity: 9, distance: 11 } });

    house(b, ctx, { pos: [-13, -4], size: [7, 6], height: 3.4, rot: 0.08, color: '#d2b88a', trim: '#b89a70', lit: true });
    house(b, ctx, { pos: [13, -6], size: [8, 7], height: 4.2, rot: -0.1, color: '#cfb284', trim: '#b08e64', lit: true, upper: true });
    house(b, ctx, { pos: [-8, -17], size: [9, 6], height: 3.6, rot: 0.2, color: '#d8c095', trim: '#b89a70' });
    house(b, ctx, { pos: [7, -19], size: [7, 7], height: 3.2, rot: -0.25, color: '#c9ab7e', trim: '#a8885e', lit: true });
    house(b, ctx, { pos: [-24, -12], size: [6, 6], height: 3, rot: 0.5, color: '#d2b88a', trim: '#b89a70' });
    house(b, ctx, { pos: [24, -18], size: [7, 6], height: 3.4, rot: -0.4, color: '#d8c095', trim: '#b89a70' });

    const olives = [[-6, 18], [9, 20], [-18, 15], [22, 16], [32, 24], [-30, 20], [44, 13], [58, 18], [70, 14], [-40, 12], [16, 30], [-10, 30], [34, -4], [-34, -2]];
    olives.forEach((p, i) => olive(b, ctx, { pos: p, size: 1 + (i % 3) * 0.2, seed: i + 3, leaf: '#8a9a6a', leafDark: '#6a7a52' }));
    palm(b, ctx, { pos: [6, -10], height: 8, lean: 0.2, dir: 0.4, seed: 2 });
    palm(b, ctx, { pos: [-6.5, -11], height: 7, lean: 0.25, dir: 2.6, seed: 5 });
    for (const [x, z, s] of [[11, 3], [-11, 3.5], [16, 11.5], [26, 11], [40, 11.2], [-20, 11]]) bush(b, ctx, { pos: [x, z], size: s ?? 0.9, color: '#7d8a4a' });
    scatterRocks(b, ctx, { ring: [14, 110], count: 140, avoid: (x, z) => Math.abs(z - 7) < 3 });
    b.flush();

    glow(ctx, { pos: [CHRIST[0], r.y + 1.3, CHRIST[1]], size: 3.5, color: '#fff3d0', opacity: 0.35, pulse: 0.04 });
    person(ctx, { pos: CHRIST, face: [0, 10], colors: CHRIST_COLORS, glow: 0.3, scale: 1.02 });
    person(ctx, { pos: [-1.9, -3.2], face: [0, -3.8], colors: CLEOPAS, kneel: true });
    person(ctx, { pos: [1.9, -3.0], face: [0, -3.8], colors: FRIEND, kneel: true });
  },

  crowd: {
    seed: 25,
    minSpacing: 0.9,
    facing: [0, -3],
    colors: PALETTE,
    groups: [
      { shape: 'rect', center: [-12, 1], size: [6, 3], count: 2, facing: [-12, -4] },
      { shape: 'rect', center: [14, 0], size: [5, 3], count: 2, facing: [30, 7] },
    ],
  },

  player: {
    start: [1.8, 0.6],
    lookAt: [-0.7, -4.2],
    fov: 46,
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
