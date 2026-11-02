// Acts 2:1-13: the Twelve in an upper room in Jerusalem, cloven tongues like fire on each of them.
// The room opens on a square to the south, where devout men out of every nation gather at the sound.
import { Batch, DAY_STYLE, box, cyl, frameAt, house, palm, person, tongues } from './lib/nt-25-kit.js';

const HOUSE = [0, -14];
const W = 18, D = 10, LOW = 3.6, UP = 3.6, T = 0.5;

const APOSTLES = [
  ['#8c5a3c', '#c8912e'], ['#4f7f80', '#d9c7a3'], ['#c8a97a', '#5e4632'], ['#a87b4f', '#3e6e66'],
  ['#7a6a52', '#b5523b'], ['#d9c7a3', '#6b5a4a'], ['#6f8a6a', '#8c5a3c'], ['#b5523b', '#d9c7a3'],
  ['#9c6b4e', '#4f7f80'], ['#e6d8b8', '#a64b35'], ['#5e4632', '#c8912e'], ['#bfa27a', '#3e6e66'],
];

const NATIONS = {
  robes: ['#f1ead8', '#2f5f8a', '#6a3f7a', '#b5523b', '#e0b84a', '#3e8e6e', '#d9c7a3', '#8c5a3c', '#c84a5a', '#4f7f80', '#e6d8b8', '#7a6a52', '#2b3a5a'],
  mantles: ['#c8912e', '#6a3f7a', '#2f5f8a', '#b5523b', '#f1ead8', '#3e6e66', '#a64b35', '#e0b84a', '#8a2f3a'],
  skins: ['#5a3a26', '#7a4e33', '#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#c99a70', '#d8ae86'],
  hair: ['#2b1a12', '#1f140e', '#3a2418', '#6a4a30'],
  wraps: ['#f1ead8', '#e0b84a', '#2f5f8a', '#b5523b', '#6a3f7a', '#3e8e6e', '#efe3c2'],
};

function upperRoomHouse(b, ctx) {
  const [x, z] = HOUSE;
  const y = ctx.terrainHeight(x, z) - 0.2;
  const f = frameAt(x, y, z, 0);
  const wall = '#e3cfa6', trim = '#c8a46a';
  b.add(wall, box(W, LOW, D, [0, LOW / 2, 0]), { frame: f });
  b.add('#3a2418', box(1.6, 2.4, 0.1, [3, 1.2, D / 2 + 0.03]), { frame: f });
  for (const wx of [-5, 7]) b.add('#3a2418', box(0.8, 0.9, 0.1, [wx, 2.2, D / 2 + 0.03]), { frame: f });
  b.add(trim, box(W + 0.4, 0.3, D + 0.4, [0, LOW + 0.05, 0]), { frame: f });
  ctx.addCollider({ x, z, hx: W / 2, hz: D / 2, rot: 0, top: y + LOW + 0.2 });

  const fy = LOW + 0.2;
  b.add(wall, box(W, UP, T, [0, fy + UP / 2, -D / 2 + T / 2]), { frame: f });
  ctx.addCollider({ x, z: z - D / 2 + T / 2, hx: W / 2, hz: T / 2, rot: 0, top: y + fy + UP });
  b.add(wall, box(T, UP, D, [W / 2 - T / 2, fy + UP / 2, 0]), { frame: f });
  ctx.addCollider({ x: x + W / 2 - T / 2, z, hx: T / 2, hz: D / 2, rot: 0, top: y + fy + UP });
  const sideLen = D - 3.2;
  b.add(wall, box(T, UP, sideLen, [-W / 2 + T / 2, fy + UP / 2, -D / 2 + sideLen / 2]), { frame: f });
  ctx.addCollider({ x: x - W / 2 + T / 2, z: z - D / 2 + sideLen / 2, hx: T / 2, hz: sideLen / 2, rot: 0, top: y + fy + UP });
  b.add(wall, box(T, 0.9, 3.2, [-W / 2 + T / 2, fy + UP - 0.45, D / 2 - 1.6]), { frame: f });
  for (const px of [-W / 2 + 0.3, -3, 3, W / 2 - 0.3]) b.add(trim, cyl(0.25, 0.3, UP, [px, fy + UP / 2, D / 2 - 0.3]), { frame: f });
  for (const [a, c] of [[-W / 2 + 0.4, -4.8], [4.8, W / 2 - 0.4]]) {
    b.add(wall, box(c - a, 0.9, 0.3, [(a + c) / 2, fy + 0.45, D / 2 - 0.3]), { frame: f });
    ctx.addCollider({ x: x + (a + c) / 2, z: z + D / 2 - 0.3, hx: (c - a) / 2, hz: 0.15, rot: 0, top: y + fy + 0.9 });
  }
  b.add(trim, box(W + 0.5, 0.45, 0.8, [0, fy + UP + 0.2, D / 2 - 0.3]), { frame: f });
  b.add(trim, box(W + 0.5, 0.45, 0.8, [0, fy + UP + 0.2, -D / 2 + 0.3]), { frame: f });
  for (let i = 0; i < 11; i++) b.add('#6b4a33', cyl(0.13, 0.13, D, [-W / 2 + 0.8 + i * ((W - 1.6) / 10), fy + UP + 0.3, 0], [Math.PI / 2, 0, 0], 6), { frame: f });
  b.add('#b89a70', box(W - 1, 0.06, D - 1, [0, fy + 0.03, 0]), { frame: f, cast: false });
  for (const [cx, cz] of [[-6.5, -3.2], [6.5, -3.2]]) b.add('#ffe6a8', box(1, 1, 0.08, [cx, fy + 2.2, -D / 2 + T + 0.02]), { frame: f, glow: true });

  const steps = 12, rise = (LOW + 0.2) / steps, run = 0.62;
  for (let i = 0; i < steps; i++) {
    const sx = -W / 2 - 1 - (steps - 1 - i) * run;
    const top = (i + 1) * rise;
    b.add(wall, box(run, top, 1.6, [sx, top / 2, D / 2 + 1.0]), { frame: f });
    ctx.addCollider({ x: x + sx, z: z + D / 2 + 1.0, hx: run / 2, hz: 0.8, rot: 0, top: y + top });
  }
  b.add(wall, box(1.6, LOW + 0.2, 1.6, [-W / 2 - 0.2, (LOW + 0.2) / 2, D / 2 + 1.0]), { frame: f });
  ctx.addCollider({ x: x - W / 2 - 0.2, z: z + D / 2 + 1.0, hx: 0.8, hz: 0.8, rot: 0, top: y + LOW + 0.2 });
  b.add(wall, box(1.6, LOW + 0.2, 2.6, [-W / 2 - 0.2, (LOW + 0.2) / 2, D / 2 - 1.2]), { frame: f });
  ctx.addCollider({ x: x - W / 2 - 0.2, z: z + D / 2 - 1.2, hx: 0.8, hz: 1.3, rot: 0, top: y + LOW + 0.2 });
  ctx.exclude({ kind: 'rect', x: x - 4, z: z + 1, hx: W / 2 + 10, hz: D / 2 + 3 });
  return y + fy;
}

export default {
  title: 'Acts 2:1-13: The day of Pentecost',
  subtitle: 'Jerusalem, the third hour. Every man heard them speak in his own language.',
  seed: 28,

  style: DAY_STYLE,

  sky: { zenith: '#3a78a8', mid: '#86b6c4', horizon: '#f3dcae', ground: '#d4b88a', glowColor: '#fff0c0', glowDir: [0, 0.7, -1] },

  sun: {
    dir: [0.55, 0.75, 0.6],
    color: '#fff0d6',
    intensity: 2.6,
    hemi: { sky: '#d4e6ec', ground: '#b08a5a', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 260,
    flatRadius: 120,
    hillHeight: 30,
    undulation: 0.2,
    plaza: { center: [0, 4], size: [64, 40] },
    colors: {
      sand: '#d4b88a',
      dirt: '#c2a070',
      grass: '#9a9a62',
      grassDark: '#7a7a4a',
      plaza: '#e6d4ae',
      plazaLine: '#c9b088',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#a49a6a',
    },
  },

  mountains: { count: 28, distance: [520, 780], height: [40, 100], widthRatio: [2, 3], colors: ['#a8a090', '#9a9688', '#b0a690', '#a09888'] },

  objects: [],

  custom(ctx) {
    const b = new Batch(ctx);
    const floorY = upperRoomHouse(b, ctx);
    const houses = [
      [-30, -14, 10, 9, 5, 0], [26, -15, 12, 9, 6, 1], [-38, 4, 8, 10, 4.5, 0], [37, 3, 9, 11, 5, 1], [-36, 22, 9, 8, 4, 0], [35, 24, 10, 8, 5, 0],
      [-14, 32, 10, 7, 4, 1], [14, 33, 12, 7, 4.5, 0], [0, -32, 12, 9, 6, 1], [-22, -30, 9, 8, 5, 0], [24, -32, 10, 8, 5.5, 1],
      [-50, -20, 10, 9, 5, 0], [52, -18, 9, 9, 6, 1], [-52, 30, 10, 8, 4, 0], [50, 36, 9, 9, 5, 0], [-2, 48, 14, 8, 5, 1],
    ];
    houses.forEach(([x, z, w, d, h, up], i) => house(b, ctx, { pos: [x, z], size: [w, d], height: h, rot: Math.atan2(-x, 4 - z) + (i % 2 ? 0.05 : -0.05), color: i % 3 ? '#e0caa0' : '#d8c095', trim: '#c2a27a', upper: !!up }));
    palm(b, ctx, { pos: [-24, -4], height: 9, lean: 0.15, dir: 0.5, seed: 3 });
    palm(b, ctx, { pos: [24, -5], height: 8, lean: 0.2, dir: 2.6, seed: 6 });
    b.flush();

    const [hx, hz] = HOUSE;
    const slots = [[0, 3.6], [-6.2, 1.2], [-3.6, 0.8], [-1.2, 0.9], [3.6, 0.8], [6.2, 1.2], [-7, -2.2], [-4.3, -2.5], [-1.5, -2.2], [1.5, -2.5], [4.3, -2.2], [7, -2.5]];
    const heads = slots.map(([lx, lz], i) => {
      const [robe, mantle] = APOSTLES[i];
      const [x, z] = [hx + lx, hz + lz];
      person(ctx, {
        pos: [x, z], y: floorY, face: [x * 0.5, hz + 20],
        colors: { robe, mantle, skin: NATIONS.skins[2 + (i % 4)], hair: i === 0 ? '#7a7068' : '#2b1a12', sash: '#c8912e', arms: i === 0 ? [0.5, 1.6] : [0.25 + (i % 3) * 0.15, 0.3 + (i % 4) * 0.4] },
      });
      return [x, floorY + 1.95, z];
    });
    tongues(ctx, heads, { h: 0.5 });
  },

  light: {
    rayFans: [{ source: [0, 140, -30], sourceJitter: 30, target: HOUSE, groundY: 4, spread: [3, 12], count: 7, width: [[3, 6], [5, 9]], color: '#fff0c4', intensity: 0.16, stripes: 9, fadeLow: 0.35 }],
    glows: [{ pos: [HOUSE[0], 6.5, HOUSE[1]], size: 18, color: '#ffd890', opacity: 0.35 }],
    pointLights: [{ pos: [HOUSE[0], 6.5, HOUSE[1] + 1], color: '#ffc070', intensity: 22, distance: 22 }],
  },

  clouds: {
    layers: [{ count: 34, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fbf6ea', shade: '#3a4660' }],
  },

  crowd: {
    seed: 28,
    minSpacing: 0.66,
    facing: [HOUSE[0], HOUSE[1] + 4],
    colors: NATIONS,
    aisles: [{ from: [12, 34], to: [6, 4], width: 3 }],
    groups: [
      { center: [0, -8], radius: [10, 30], angle: [-1.25, 1.25], count: 520, children: 0.06, kneel: 0.05 },
    ],
  },

  player: {
    start: [6, 4.6],
    lookAt: [-0.5, -12],
    fov: 46,
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
