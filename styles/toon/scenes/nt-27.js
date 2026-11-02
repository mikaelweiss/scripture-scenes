// Acts 1:9-11: on the Mount of Olives the Lord is taken up and a cloud receives him. Two men in white stand by.
// The summit is a plateau. Jerusalem and its temple lie below to the north, across the Kidron.
import * as THREE from 'three';
import { Batch, DAY_STYLE, angels, box, cityWall, cloudBank, frameAt, glow, house, makeRng, olive, person, scatterRocks } from './lib/nt-25-kit.js';

const CHRIST = [0, -12];
const RISE = 8.5;
const CITY = [0, -175];

const APOSTLE_COLORS = [
  ['#8c5a3c', '#c8912e'], ['#4f7f80', '#d9c7a3'], ['#c8a97a', '#5e4632'], ['#a87b4f', '#3e6e66'],
  ['#7a6a52', '#b5523b'], ['#d9c7a3', '#6b5a4a'], ['#6f8a6a', '#8c5a3c'], ['#b5523b', '#d9c7a3'],
  ['#9c6b4e', '#4f7f80'], ['#e6d8b8', '#a64b35'], ['#5e4632', '#c8912e'],
];
const SKINS = ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33'];

function jerusalem(b, ctx) {
  const rng = makeRng(70);
  const [cx, cz] = CITY;
  const ty = ctx.terrainHeight(cx + 20, cz + 10);
  const f = frameAt(cx + 20, ty - 1, cz + 10, 0);
  b.add('#e3cfa6', box(70, 9, 50, [0, 4.5, 0]), { frame: f });
  b.add('#efe3c2', box(20, 14, 34, [0, 15, 0]), { frame: f });
  b.add('#efe3c2', box(30, 18, 8, [0, 17, 17]), { frame: f });
  b.add('#d6b35a', box(31, 1, 9, [0, 26.5, 17]), { frame: f });
  b.add('#d6b35a', box(21, 1, 35, [0, 22.5, 0]), { frame: f });
  b.add('#2b1a12', box(6, 10, 0.4, [0, 14, 21.1]), { frame: f });
  for (let i = 0; i < 14; i++) b.add('#f3eddf', box(1.2, 5, 1.2, [-33 + i * 5, 11.5, 24]), { frame: f });
  b.add('#d8c095', box(72, 1, 3, [0, 14.5, 24]), { frame: f });
  for (let i = 0; i < 90; i++) {
    const x = cx + (rng() - 0.5) * 220, z = cz + (rng() - 0.5) * 90;
    if (Math.abs(x - cx - 20) < 42 && Math.abs(z - cz - 10) < 32) continue;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 6, 5 + rng() * 5], height: 3 + rng() * 4, rot: (rng() - 0.5) * 0.3, color: rng() < 0.5 ? '#e0caa0' : '#d2b88a', trim: '#c2a27a', upper: rng() < 0.3 });
  }
  const W = 125, D = 55;
  const corners = [[cx - W, cz - D], [cx + W, cz - D], [cx + W, cz + D], [cx - W, cz + D]];
  for (let i = 0; i < 4; i++) cityWall(b, ctx, { from: corners[i], to: corners[(i + 1) % 4], height: 8, thick: 2.4, color: '#d8c095' });
}

export default {
  title: 'Acts 1:9-11: The Ascension',
  subtitle: 'The Mount of Olives. Ye men of Galilee, why stand ye gazing up into heaven?',
  seed: 27,

  style: { ...DAY_STYLE, fog: { color: '#e8e0c8', near: 160, far: 1300 } },

  sky: { zenith: '#3f7fb0', mid: '#8ab8cc', horizon: '#f1e2bc', ground: '#c9b088', glowColor: '#fff1c8', glowDir: [0, 0.75, -1] },

  sun: {
    dir: [0.45, 0.85, 0.4],
    color: '#fff3dc',
    intensity: 2.6,
    hemi: { sky: '#d4e6ec', ground: '#a07a52', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 34,
    hillHeight: -12,
    undulation: 0.35,
    plaza: { center: [0, 200], size: [0.1, 0.1] },
    colors: {
      sand: '#c9b07a',
      dirt: '#b8965e',
      grass: '#8f9a5a',
      grassDark: '#6f7a44',
      plaza: '#c9b07a',
      plazaLine: '#c9b07a',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#8f9a5a',
    },
  },

  mountains: { count: 30, distance: [560, 780], height: [40, 110], widthRatio: [2, 3.2], colors: ['#9aa2a8', '#8a96a0', '#a6aaa8', '#b0a898'] },

  objects: [
    { type: 'stones', count: 300, ring: [4, 60], size: [0.1, 0.35], colors: ['#c2a27a', '#a89070', '#d0b48a'] },
  ],

  custom(ctx) {
    const b = new Batch(ctx);
    jerusalem(b, ctx);
    const olives = [[-14, 4], [12, 6], [-20, -8], [19, -6], [-9, 18], [14, 20], [-26, 12], [26, 14], [-30, -20], [30, -22], [0, 30], [-18, 30], [20, 32], [-38, 2], [38, 0]];
    olives.forEach((p, i) => olive(b, ctx, { pos: p, size: 1 + (i % 3) * 0.25, seed: i + 7 }));
    scatterRocks(b, ctx, { ring: [6, 70], count: 70, size: [0.3, 0.9], colors: ['#b8a888', '#a09070', '#c8b898'] });
    const gy = ctx.terrainHeight(...CHRIST);
    cloudBank(b, ctx, { pos: [CHRIST[0], gy + RISE - 1.2, CHRIST[1]], size: 2.2, count: 12, seed: 4, flat: 0.45 });
    b.flush();

    const christ = person(ctx, { pos: CHRIST, y: gy + RISE, face: [0, 20], colors: { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#c9905f', hair: '#5a3a22', sash: '#e9dcc0', arms: [1.0, 0.5] }, glow: 0.45, scale: 1.1 });
    const halo = glow(ctx, { pos: [CHRIST[0], gy + RISE + 1.2, CHRIST[1]], size: 9, color: '#fff3d0', opacity: 0.7 });
    ctx.onFrame((t) => {
      const y = gy + RISE + Math.sin(t * 0.5) * 0.15 + Math.min(t * 0.02, 0.8);
      christ.position.y = y;
      halo.position.y = y + 1.2;
    });

    angels(ctx, [
      { pos: [-4.2, ctx.terrainHeight(-4.2, 0.5), 0.5], face: [0, 6], scale: 1.12 },
      { pos: [4.4, ctx.terrainHeight(4.4, 0.2), 0.2], face: [0, 6], scale: 1.12 },
    ], { glowSize: 3.5, glowOpacity: 0.45, bob: 0 });

    const rng = makeRng(11);
    APOSTLE_COLORS.forEach(([robe, mantle], i) => {
      const a = -1.2 + (i / 10) * 2.4;
      const r = 5.5 + (i % 2) * 1.6;
      const x = Math.sin(a) * r, z = CHRIST[1] + 10 + Math.cos(a) * r * 0.55 - 3;
      const kneel = i % 4 === 1;
      const up = i % 3 === 0;
      const fig = person(ctx, {
        pos: [x, z], face: CHRIST, kneel,
        colors: { robe, mantle, skin: SKINS[i % SKINS.length], hair: i === 0 ? '#8a8078' : '#2b1a12', sash: '#c8912e', arms: up ? [0.5, 2.3] : [0.3, 0.4 + rng() * 0.4] },
      });
      fig.rotation.order = 'YXZ';
      fig.rotation.x = -0.18;
    });
  },

  light: {
    beams: [{ from: [0, 200, -30], to: { at: CHRIST, lift: 9 }, width: [16, 6], color: '#fff2c9', intensity: 0.22, layers: 3, stripes: 22, fadeLow: 0.1 }],
    pointLights: [{ at: CHRIST, lift: 8, color: '#fff0c8', intensity: 18, distance: 24 }],
  },

  clouds: {
    layers: [
      { count: 30, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fbf6ea', shade: '#3a4660' },
      { count: 14, center: CHRIST, distance: [40, 90], height: [70, 110], size: [20, 40], color: '#fff6e4', shade: '#5a5468', drift: 0.004 },
    ],
  },

  player: {
    start: [0, 9],
    lookAt: [0, -12],
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
