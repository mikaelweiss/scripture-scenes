// Genesis 18:1-8: in the heat of the day Abraham runs from his tent door to greet three men at the oaks of Mamre.
import { ANGEL, Batch, DAY_STYLE, DESERT_GROUND, PALETTE, addSun, camel, figure, flock, glow, oak, rocks, tent, box } from './lib/ot-07-kit.js';

const TENT = [-3, -6];
const VISITORS = [[6.4, 2.4], [7.6, 4.1], [9.1, 4.4]];
const ABRAHAM = [3.7, 3.9];
const SARAH = [-3, -1.6];

const ABRAHAM_COLORS = { robe: '#d9c7a3', mantle: '#6b4a7a', skin: '#a8724a', hair: '#d8d2c4', sash: '#c8912e', arms: [0.45, 1.3] };
const SARAH_COLORS = { robe: '#8c4a3c', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', sash: '#c8912e' };

export default {
  title: "Genesis 18:1-8: Abraham's three visitors",
  subtitle: 'The plains of Mamre, in the heat of the day',
  seed: 18,

  style: { ...DAY_STYLE, fog: { color: '#f2dcae', near: 140, far: 1000 } },

  sky: { zenith: '#3a7aa8', mid: '#82b4cc', horizon: '#f4dca8', ground: '#d9b98a', glowColor: '#fff3cc', glowDir: [0.3, 0.8, -0.6] },

  sun: {
    dir: [0.3, 0.9, 0.35],
    color: '#fff3dc',
    intensity: 2.7,
    hemi: { sky: '#d8ecf0', ground: '#b88a58', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1400, segments: 260, flatRadius: 90, hillHeight: 34, undulation: 0.45,
    plaza: { center: [0, 0], size: [0.1, 0.1] },
    colors: DESERT_GROUND,
  },

  mountains: { count: 30, distance: [460, 760], height: [60, 140], widthRatio: [1.6, 2.6], colors: ['#8fa08a', '#9aa892', '#a4ad94'] },

  objects: [
    { type: 'trees', count: 34, ring: [26, 90], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#5e4430', leafColors: ['#55803e', '#4a7238', '#6a8f48'], seed: 18 },
  ],

  custom(ctx) {
    addSun(ctx, { dir: [0.3, 0.9, -0.6], size: 70 });
    const b = new Batch(ctx);
    tent(b, ctx, { pos: TENT, size: [8, 7], height: 3.6, rot: 0.25, color: '#4a3628', flap: '#8c6a44' });
    // An awning of woven cloth on poles shades the tent door.
    const [ax, az] = [TENT[0] + 0.9, TENT[1] + 5.4];
    const ay = ctx.terrainHeight(ax, az);
    b.add('#6b5240', box(6, 0.08, 3.4, [ax, ay + 2.6, az], [0.08, 0.25, 0]));
    for (const [px, pz] of [[-2.8, 1.5], [2.8, 1.5]]) {
      const c = Math.cos(0.25), s = Math.sin(0.25);
      b.add('#7a5636', box(0.12, 2.6, 0.12, [ax + px * c + pz * s, ay + 1.3, az - px * s + pz * c]));
    }
    tent(b, ctx, { pos: [-16, -10], size: [5, 6], height: 2.8, rot: 0.6, color: '#5e4632' });
    tent(b, ctx, { pos: [-14, -22], size: [5, 5], height: 2.7, rot: 0.2, color: '#3e2e22' });
    tent(b, ctx, { pos: [-26, -4], size: [4.5, 5], height: 2.6, rot: 1.1, color: '#54402e' });

    oak(b, ctx, { pos: [14, 6.5], height: 8, spread: 5.5, seed: 4 });
    oak(b, ctx, { pos: [15, -4], height: 7, spread: 4.5, seed: 7 });
    oak(b, ctx, { pos: [22, 14], height: 7.5, spread: 4.8, seed: 9 });

    camel(b, ctx, { pos: [-4.4, 7.4], rot: 1.5, couched: true, color: '#b4905e', load: '#8c3a2c' });
    camel(b, ctx, { pos: [-6.4, 2.8], rot: 1.0, color: '#c49a62' });
    camel(b, ctx, { pos: [-22, -16], rot: 0.5, couched: true, color: '#b4905e' });
    flock(b, ctx, { center: [-20, 16], radius: 9, count: 44, seed: 3 });
    // Calf tethered by the tent, soon to be dressed for the guests.
    const calf = [-9, -1];
    const cy = ctx.terrainHeight(...calf);
    b.add('#a8643c', box(0.5, 0.5, 1.0, [calf[0], cy + 0.75, calf[1]]));
    b.add('#a8643c', box(0.3, 0.32, 0.4, [calf[0], cy + 1.05, calf[1] + 0.6]));
    for (const [lx, lz] of [[-0.18, 0.35], [0.18, 0.35], [-0.18, -0.35], [0.18, -0.35]]) b.add('#6a3e26', box(0.1, 0.55, 0.1, [calf[0] + lx, cy + 0.27, calf[1] + lz]));
    // Water jar and bread board laid under the tree for the guests.
    const ty = ctx.terrainHeight(11.6, 6.4);
    b.add('#c9a46a', box(1.6, 0.08, 1.0, [11.6, ty + 0.05, 6.4]));
    b.add('#efe3c2', box(0.5, 0.12, 0.5, [11.3, ty + 0.14, 6.3]));
    b.add('#b5653b', box(0.35, 0.5, 0.35, [12.1, ty + 0.3, 6.6]));
    rocks(b, ctx, { ring: [10, 90], count: 90, size: [0.2, 0.9], colors: ['#c9b08a', '#b89a70', '#d9c39a'], avoid: (x, z) => Math.hypot(x - 4, z - 4) < 15 });
    b.flush();

    for (const [i, p] of VISITORS.entries()) {
      figure(ctx, { pos: p, face: ABRAHAM, colors: i === 0 ? { ...ANGEL, arms: [0.3, 0.7] } : ANGEL, scale: 1.12, glow: 0.35 });
      glow(ctx, { pos: [p[0], ctx.groundHeight(...p) + 1.2, p[1]], size: 3, color: '#fff4d8', opacity: 0.35 });
    }
    figure(ctx, { pos: ABRAHAM, face: VISITORS[0], colors: ABRAHAM_COLORS, scale: 1.1, lean: 0.22 });
    figure(ctx, { pos: SARAH, face: VISITORS[0], colors: SARAH_COLORS, scale: 0.98 });
  },

  crowd: {
    seed: 18,
    minSpacing: 0.7,
    facing: VISITORS[0],
    colors: PALETTE,
    groups: [
      { center: [-12, -2], radius: [0, 2.5], count: 4, children: 0.3 },
      { center: [-9, -2], radius: [0, 1.2], count: 1, facing: [-9, -1] },
    ],
  },

  player: {
    start: [0.6, 10.2],
    lookAt: [5, 1.5],
    colors: { robe: '#8c5a3c', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
