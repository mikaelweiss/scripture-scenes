// Genesis 22:1-14: on a mountain in the land of Moriah an angel stays Abraham's hand, and a ram is caught in a thicket.
import { Batch, DAY_STYLE, altar, angel, bush, figure, flames, glow, ram, rocks, thicket, cyl } from './lib/ot-07-kit.js';

const ALTAR = [0, -4];
const ABRAHAM = [1.9, -2.3];
const ISAAC = [-0.6, -2.2];
const THICKET = [-4.6, -6.8];
const ANGEL_AT = [4, -8];

const ABRAHAM_COLORS = { robe: '#d9c7a3', mantle: '#6b4a7a', skin: '#a8724a', hair: '#d8d2c4', sash: '#c8912e', arms: [0.4, 2.3] };
const ISAAC_COLORS = { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#b5825a', hair: '#3a2418', sash: '#b5523b' };

export default {
  title: 'Genesis 22:1-14: Abraham and Isaac on Moriah',
  subtitle: 'The Lord will provide. A ram caught in a thicket by his horns.',
  seed: 22,

  style: { ...DAY_STYLE, fog: { color: '#e8dcc0', near: 90, far: 700 } },

  sky: { zenith: '#2f6c9a', mid: '#7aaecb', horizon: '#f2e2b8', ground: '#c9b08a', glowColor: '#fff4d0', glowDir: [0.2, 0.55, -1] },

  sun: {
    dir: [-0.5, 0.75, 0.45],
    color: '#fff0d6',
    intensity: 2.5,
    hemi: { sky: '#d6e8ee', ground: '#a88058', intensity: 1.1 },
    shadowSize: 50,
  },

  ground: {
    size: 1400, segments: 300, flatRadius: 16, hillHeight: -70, undulation: 0.5,
    plaza: { center: [0, 0], size: [0.1, 0.1] },
    colors: { sand: '#c8a878', dirt: '#b08a5e', grass: '#8a9258', grassDark: '#6c7444', plaza: '#c8a878', plazaLine: '#b08a5e', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a9258' },
  },

  mountains: { count: 34, distance: [420, 720], height: [40, 110], widthRatio: [1.6, 2.6], colors: ['#8a9e98', '#94a4a0', '#a0aca4'] },

  objects: [
    { type: 'trees', count: 40, ring: [18, 70], height: [3, 5], broken: 0, fallen: 0, trunkColor: '#6b5a44', leafColors: ['#7a8a58', '#6e7e50', '#8a9660'], seed: 22 },
  ],

  custom(ctx) {
    const b = new Batch(ctx);
    altar(b, ctx, { pos: ALTAR, size: [2.4, 1.0, 1.4], rot: 0.1 });
    thicket(b, ctx, { pos: THICKET, radius: 1.8, height: 1.9 });
    ram(b, ctx, { pos: [THICKET[0] + 0.5, THICKET[1] + 1.3], rot: 0.9, color: '#efe6d2' });
    // A small fire pot beside the altar, carried up the mountain.
    const [fx, fz] = [ALTAR[0] - 1.9, ALTAR[1] + 0.4];
    const fy = ctx.terrainHeight(fx, fz);
    b.add('#6a4a30', cyl(0.28, 0.2, 0.35, [fx, fy + 0.17, fz]));
    b.flush();
    const b2 = new Batch(ctx);
    rocks(b2, ctx, { ring: [5, 60], count: 120, size: [0.25, 1.4], colors: ['#b0a088', '#9c8c74', '#c0b096'], avoid: (x, z) => Math.hypot(x - ALTAR[0], z - ALTAR[1]) < 5 || Math.hypot(x - 1, z - 6) < 5 });
    for (const p of [[-8, -3], [7, -6], [-3, -12], [9, 2], [-10, 4]]) bush(b2, ctx, { pos: p, size: 0.8, color: '#7a8650' });
    b2.flush();
    flames(ctx, [{ pos: [fx, fy + 0.3, fz], h: 0.5 }]);
    glow(ctx, { pos: [fx, fy + 0.6, fz], size: 1.6, color: '#ffb35a', opacity: 0.5, pulse: 0.1 });

    figure(ctx, { pos: ABRAHAM, face: [ANGEL_AT[0], ANGEL_AT[1]], colors: ABRAHAM_COLORS, scale: 1.08, lean: -0.1 });
    figure(ctx, { pos: ISAAC, face: [ABRAHAM[0], ABRAHAM[1] + 2], colors: ISAAC_COLORS, scale: 0.92, kneel: true });
    const a = angel(ctx, { pos: ANGEL_AT, y: ctx.terrainHeight(...ANGEL_AT) + 3.2, face: ABRAHAM, scale: 1.15, light: 0.6, halo: 3.5, arms: [0.5, 0.9] });
    ctx.onFrame((t) => (a.position.y = ctx.terrainHeight(...ANGEL_AT) + 3.2 + Math.sin(t * 0.8) * 0.15));
  },

  light: {
    beams: [{ from: [3.5, 160, -30], to: { at: ANGEL_AT, lift: 3.8 }, width: [12, 4], color: '#fff2c9', intensity: 0.22, layers: 3, stripes: 22, fadeLow: 0.05 }],
    glows: [{ at: ANGEL_AT, lift: 4.4, size: 6, color: '#fff3d0', opacity: 0.6 }],
    pointLights: [{ at: ANGEL_AT, lift: 4, color: '#ffe6b0', intensity: 12, distance: 18 }],
  },

  player: {
    start: [-0.6, 3.4],
    lookAt: [2.4, -7],
    colors: { robe: '#8c5a3c', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
