// Acts 8:26-39: on the desert road to Gaza the chariot stops at water, and Philip and the eunuch go down into it.
// The road runs north-south. The pool lies west of it under a few palms.
import { Batch, DAY_STYLE, PALETTE, bush, chariot, glow, palm, person, reeds, reshapeGround, scatterRocks, water } from './lib/nt-25-kit.js';

const POOL = [-3, -7];
const R = 6.5;
const CHARIOT = [6, -2];

export default {
  title: 'Acts 8:26-39: Philip and the Ethiopian',
  subtitle: 'The desert road to Gaza. See, here is water; what doth hinder me to be baptized?',
  seed: 31,

  style: { ...DAY_STYLE, fog: { color: '#f2dcae', near: 140, far: 1200 } },

  sky: { zenith: '#2f74b0', mid: '#7fb4d0', horizon: '#f6e0b0', ground: '#dcc08a', glowColor: '#fff0c0', glowDir: [0.3, 0.8, -0.5] },

  sun: {
    dir: [0.4, 0.85, 0.35],
    color: '#fff3dc',
    intensity: 2.7,
    hemi: { sky: '#d4e6ec', ground: '#c09a62', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 260,
    flatRadius: 70,
    hillHeight: 22,
    undulation: 0.3,
    plaza: { center: [6, 0], size: [5, 400] },
    colors: {
      sand: '#e0c48c',
      dirt: '#d0ae74',
      grass: '#b0a868',
      grassDark: '#90884e',
      plaza: '#c9a06a',
      plazaLine: '#c09a66',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#d4b47c',
    },
  },

  mountains: { count: 26, distance: [500, 780], height: [30, 80], widthRatio: [2.4, 3.6], colors: ['#d0a878', '#c49c70', '#d8b488', '#bc9468'] },

  objects: [
    { type: 'stones', count: 400, ring: [9, 100], size: [0.1, 0.4], colors: ['#c8a878', '#b0906a', '#d8bc8c'] },
  ],

  custom(ctx) {
    const [px, pz] = POOL;
    let rimLow = Infinity;
    for (let i = 0; i < 32; i++) rimLow = Math.min(rimLow, ctx.terrainHeight(px + Math.sin(i * 0.196) * R, pz + Math.cos(i * 0.196) * R));
    const wy = rimLow - 0.12;
    reshapeGround(ctx, (x, z, y) => {
      const d = Math.hypot(x - px, z - pz) / (R + 0.6);
      return d < 1 ? Math.min(y, wy + 0.1 - 1.4 * (1 - d * d)) : y;
    });
    water(ctx, { y: wy, radius: R, center: POOL, color: '#4f9aa0', light: '#bfe4dc', dark: '#3a7a84', tile: 6, glow: 0.1 });
    ctx.addCollider({ x: px, z: pz, hx: R * 0.55, hz: R * 0.55, rot: 0.785, top: wy + 1.4 });
    ctx.exclude({ kind: 'circle', x: px, z: pz, r: R + 0.5 });

    const b = new Batch(ctx);
    const { floorY } = chariot(b, ctx, { pos: CHARIOT, rot: Math.PI, body: '#7a3a2c', trim: '#d6b35a', canopy: '#2f5f8a', horses: ['#3a2a22', '#8a5a3a'] });
    palm(b, ctx, { pos: [px - 7.5, pz - 3], height: 9, lean: 0.2, dir: 0.4, seed: 2 });
    palm(b, ctx, { pos: [px - 5, pz - 7.5], height: 10, lean: 0.12, dir: 1.8, seed: 4 });
    palm(b, ctx, { pos: [px + 3, pz - 8], height: 8, lean: 0.25, dir: 2.6, seed: 7 });
    palm(b, ctx, { pos: [px - 8.5, pz + 3.5], height: 7.5, lean: 0.3, dir: -0.6, seed: 9 });
    for (const [x, z, s] of [[-12, 2, 1.1], [3, -15, 0.9], [-14, -12, 1], [16, -10, 0.8], [18, 8, 0.9], [-20, -24, 1.2], [26, -30, 1], [-28, 10, 1]]) bush(b, ctx, { pos: [x, z], size: s, color: '#9a9a58' });
    scatterRocks(b, ctx, { ring: [12, 100], count: 90, size: [0.3, 1.2], colors: ['#c09a6a', '#a88458', '#d0ae7c'], avoid: (x, z) => Math.abs(x - 6) < 4 });
    b.flush();
    const rim = Array.from({ length: 25 }, (_, i) => [px + Math.sin((i / 24) * Math.PI * 2) * (R + 0.4), pz + Math.cos((i / 24) * Math.PI * 2) * (R + 0.4)]).filter(([x, z]) => z < pz + R * 0.3 || x < px - 3);
    reeds(ctx, { points: rim, offset: 0.2, spread: 0.9, count: 260, seed: 11, colors: ['#8a9a4a', '#7a8a40', '#a0a058'] });

    const inWater = wy - 0.35;
    person(ctx, { pos: [px + 0.4, pz + 2.4], y: inWater, face: [px + 2.2, pz + 2.0], colors: { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#a87650', hair: '#3a2418', sash: '#5e4632', arms: [0.9, 1.7] } });
    person(ctx, { pos: [px + 2.2, pz + 2.0], y: inWater, face: [px + 0.4, pz + 2.4], colors: { robe: '#f1ead8', mantle: '#e0b84a', skin: '#4a2e1e', hair: '#1f140e', sash: '#2f5f8a', arms: [0.15, 0.6] } });
    glow(ctx, { pos: [px + 1.3, wy + 1.2, pz + 2.2], size: 4, color: '#fff3d0', opacity: 0.3 });

    person(ctx, { pos: [CHARIOT[0] - 0.3, CHARIOT[1] - 0.6], y: floorY, face: [CHARIOT[0], CHARIOT[1] - 8], colors: { robe: '#e6d8b8', mantle: '#7a3a2c', skin: '#5a3a26', hair: '#1f140e', sash: '#c8912e', arms: [0.15, 0.9] } });
  },

  crowd: {
    seed: 31,
    minSpacing: 1,
    facing: POOL,
    colors: { ...PALETTE, skins: ['#4a2e1e', '#5a3a26', '#6a4430'], robes: ['#f1ead8', '#e6d8b8', '#2f5f8a', '#7a3a2c', '#c8912e'] },
    groups: [{ shape: 'rect', center: [10, -1.5], size: [2.5, 3], count: 3, facing: [-1, -6] }],
  },

  player: {
    start: [3.5, 4.5],
    lookAt: [-1.5, -6],
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
