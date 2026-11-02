// John 21:1-17: at dawn the risen Lord waits on the shore of Galilee by a fire of coals with fish and bread.
// The sea lies to the north. The fire burns on the beach, the boat and the full net beyond it.
import * as THREE from 'three';
import { Batch, DAY_STYLE, addSun, ball, bush, campfire, fishNet, fishingBoat, glow, person, reshapeGround, scatterRocks, water, xf } from './lib/nt-25-kit.js';

const FIRE = [0, -1];
const CHRIST = [-1.7, -2.6];
const PETER = [-2.1, -0.4];
const shore = (x) => -8 + 1.2 * Math.sin(x * 0.07) + 0.6 * Math.sin(x * 0.19 + 1);

const CHRIST_COLORS = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#c9905f', hair: '#5a3a22', sash: '#e9dcc0', arms: [0.35, 0.7] };
const FISHERS = [
  { robe: '#6f8a6a', mantle: '#8c5a3c', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e' },
  { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#9c6a45', hair: '#3a2418', sash: '#b5523b', arms: [0.4, 1.1] },
  { robe: '#c8a97a', mantle: '#5e4632', skin: '#b5825a', hair: '#1f140e', sash: '#4f7f80', arms: [0.4, 1.1] },
  { robe: '#a87b4f', mantle: '#3e6e66', skin: '#8a5a3b', hair: '#4a3020', sash: '#d9c7a3' },
  { robe: '#7a6a52', mantle: '#b5523b', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e', arms: [0.3, 0.9] },
  { robe: '#d9c7a3', mantle: '#6b5a4a', skin: '#9c6a45', hair: '#3a2418', sash: '#8c5a3c' },
];

export default {
  title: 'John 21:1-17: Breakfast by the sea',
  subtitle: 'Dawn on the shore of Galilee. Come and dine.',
  seed: 26,

  style: { ...DAY_STYLE, fog: { color: '#f1cfb0', near: 110, far: 1000 } },

  sky: { zenith: '#4d5f92', mid: '#c99aa6', horizon: '#ffd39a', ground: '#c9a07a', glowColor: '#ffe0a0', glowDir: [0.6, 0.1, -0.8] },

  sun: {
    dir: [0.6, 0.14, -0.8],
    color: '#ffd7a0',
    intensity: 2.1,
    hemi: { sky: '#c4c4dc', ground: '#a07a58', intensity: 1.15 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 80,
    hillHeight: 40,
    undulation: 0.25,
    plaza: { center: [0, 60], size: [0.1, 0.1] },
    colors: {
      sand: '#dcc28c',
      dirt: '#c9aa78',
      grass: '#93a062',
      grassDark: '#738248',
      plaza: '#dcc28c',
      plazaLine: '#dcc28c',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#8a9a62',
    },
  },

  mountains: { count: 32, distance: [480, 760], height: [50, 120], widthRatio: [1.8, 3], colors: ['#8a7a9a', '#7e7090', '#968aa6', '#a08a9a'] },

  objects: [
  ],

  custom(ctx) {
    reshapeGround(ctx, (x, z, y) => (z < shore(x) ? Math.min(y, 0) - Math.min(5, (shore(x) - z) * 0.3) - 0.05 : y));
    water(ctx, { y: -0.22, size: 3600, center: [0, -1800 - 7], color: '#5b8fa6', light: '#cfe2e2', dark: '#3f708a', tile: 16 });
    addSun(ctx, { dir: [0.6, 0.06, -0.8], size: 70, color: '#fff2c8', halo: '#ffc88a' });
    ctx.addCollider({ x: 0, z: -9.5 - 600, hx: 2000, hz: 600, rot: 0, top: 0.75 });

    const b = new Batch(ctx);
    fishingBoat(b, ctx, { pos: [7, -12.5], rot: 2.6, y: -0.55, hull: '#8a5a3a', trim: '#5e3c26', tilt: 0.04 });
    fishingBoat(b, ctx, { pos: [-16, -18], rot: 1.9, y: -0.6, hull: '#7a5236', trim: '#4a3020', tilt: -0.03 });
    fishNet(b, ctx, { pos: [4.8, -6.4], rot: 0.5, length: 4.4 });
    campfire(b, ctx, { pos: FIRE, light: { color: '#ffa850', intensity: 14, distance: 14 } });
    const fy = ctx.terrainHeight(...FIRE);
    for (const [dx, dz, r] of [[-0.25, 0.1, 0.4], [0.2, -0.15, -0.3], [0.05, 0.3, 1.2]]) {
      b.add('#b8c4c6', xf(new THREE.SphereGeometry(0.1, 7, 5), { pos: [FIRE[0] + dx, fy + 0.42, FIRE[1] + dz], rot: [0, r, 0], scale: [1, 0.55, 3.4] }));
    }
    for (const [dx, dz] of [[1.25, 0.5], [1.45, 0.15]]) b.add('#c98b4a', ball(0.17, [FIRE[0] + dx, fy + 0.1, FIRE[1] + dz], [1.3, 0.55, 1], 8));

    for (let i = 0; i < 12; i++) {
      const x = -40 + i * 7.3 + Math.sin(i) * 2, z = shore(x) + 4 + (i % 3);
      if (Math.abs(x) < 9) continue;
      bush(b, ctx, { pos: [x, z + 8], size: 0.8 + (i % 2) * 0.4, color: i % 2 ? '#8a9a5a' : '#7d8a4a' });
    }
    scatterRocks(b, ctx, { ring: [4, 90], count: 260, size: [0.12, 0.6], colors: ['#8a8478', '#a09888', '#6e6a62'], avoid: (x, z) => z < shore(x) - 1 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 4 });
    b.flush();

    glow(ctx, { pos: [CHRIST[0], ctx.groundHeight(...CHRIST) + 1.2, CHRIST[1]], size: 3.6, color: '#fff3d0', opacity: 0.4 });
    person(ctx, { pos: CHRIST, face: [PETER[0] + 0.5, PETER[1]], colors: CHRIST_COLORS, glow: 0.3, scale: 1.05 });
    person(ctx, { pos: PETER, face: CHRIST, colors: { robe: '#8c5a3c', mantle: '#4a3a2e', skin: '#a87650', hair: '#5e5048', sash: '#c8912e', arms: [0.3, 0.6] }, kneel: true });
    person(ctx, { pos: [1.9, 0.4], face: FIRE, colors: FISHERS[0], kneel: true });
    person(ctx, { pos: [0.9, 1.5], face: FIRE, colors: FISHERS[3], kneel: true });
    person(ctx, { pos: [3.6, -6.0], face: [5.5, -7.5], colors: FISHERS[1] });
    person(ctx, { pos: [6.1, -5.1], face: [5, -7], colors: FISHERS[2] });
    person(ctx, { pos: [-0.6, 1.9], face: CHRIST, colors: FISHERS[4] });
    person(ctx, { pos: [2.6, -2.6], face: CHRIST, colors: FISHERS[5] });
  },

  player: {
    start: [3.5, 9],
    lookAt: [-0.5, -3],
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
