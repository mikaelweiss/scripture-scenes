// Acts 3:1-10: at the ninth hour Peter takes the lame man by the right hand at the Beautiful gate of the temple.
// The outer court lies south. The bronze gate opens north onto the raised inner court and the sanctuary.
import { Batch, DAY_STYLE, PALETTE, box, frameAt, person, portico } from './lib/nt-25-kit.js';

const LAME = [-1.6, -4.6];
const PETER = [-0.5, -3.7];
const JOHN = [0.7, -4.1];
const COURT = 1.5;

const STONE = '#dcc49a', GATE = '#f1e6cc', TRIM = '#d6b35a', BRONZE = '#c0843a';

function temple(b, ctx) {
  const f = frameAt(0, 0, 0, 0);
  const add = (color, w, h, d, x, y, z) => b.add(color, box(w, h, d, [x, y, z]), { frame: f });

  add('#ddc9a0', 120, COURT, 80, 0, COURT / 2, -50);
  ctx.addCollider({ x: 0, z: -50, hx: 60, hz: 40, rot: 0, top: COURT, walkable: true });
  for (let i = 0; i < 5; i++) {
    const top = ((i + 1) / 5) * COURT;
    add('#e3d2a8', 14, top, 0.8, 0, top / 2, -6.4 - i * 0.8);
    ctx.addCollider({ x: 0, z: -6.4 - i * 0.8, hx: 7, hz: 0.4, rot: 0, top, walkable: true });
  }

  const wallH = 7.5;
  for (const s of [-1, 1]) {
    add(STONE, 52.5, wallH, 2, s * 33.75, COURT + wallH / 2, -11);
    ctx.addCollider({ x: s * 33.75, z: -11, hx: 26.25, hz: 1, rot: 0, top: 30 });
    add(TRIM, 52.5, 0.5, 2.4, s * 33.75, COURT + wallH + 0.25, -11);
    add(GATE, 5, 13, 5, s * 5, COURT + 6.5, -11);
    add(TRIM, 5.3, 0.5, 5.3, s * 5, COURT + 9.4, -11);
    add(BRONZE, 3.6, 7.4, 0.15, s * 5, COURT + 4.6, -8.45);
    add(TRIM, 4.2, 0.3, 0.2, s * 5, COURT + 8.4, -8.42);
    for (const y of [2.6, 5.4]) add(TRIM, 3.6, 0.15, 0.2, s * 5, COURT + y, -8.4);
    ctx.addCollider({ x: s * 5, z: -11, hx: 2.5, hz: 2.5, rot: 0, top: 30 });
    add(TRIM, 5.4, 0.6, 5.4, s * 5, COURT + 13.2, -11);
    add(BRONZE, 0.25, 9, 2.6, s * 2.35, COURT + 4.5, -14.9);
  }
  add(GATE, 5, 4, 5, 0, COURT + 11, -11);
  add(TRIM, 15.4, 0.8, 5.4, 0, COURT + 13.2, -11);
  add(BRONZE, 5.2, 0.6, 0.4, 0, COURT + 9.1, -8.5);
  for (let i = 0; i < 7; i++) add(TRIM, 0.5, 0.5, 0.2, -3 + i, COURT + 10.6, -8.4);

  const sz = -58;
  add('#ead9b0', 44, 4, 44, 0, COURT + 2, sz);
  ctx.addCollider({ x: 0, z: sz, hx: 22, hz: 22, rot: 0, top: 30 });
  add('#f6eedc', 34, 34, 10, 0, COURT + 4 + 17, sz + 12);
  add('#f1e6cc', 22, 28, 30, 0, COURT + 4 + 14, sz - 6);
  add('#2b1a12', 9, 18, 0.4, 0, COURT + 4 + 9, sz + 17.1);
  add(TRIM, 35, 1.4, 11, 0, COURT + 4 + 34.7, sz + 12);
  add(TRIM, 23, 1.2, 31, 0, COURT + 4 + 28.6, sz - 6);
  for (let i = 0; i < 17; i++) add(TRIM, 0.4, 1.2, 0.4, -16 + i * 2, COURT + 4 + 36, sz + 16.8);
  for (let i = 0; i < 6; i++) add('#d8c095', 34 - i * 3, 0.5, 2, 0, COURT + 0.25 + i * 0.6, sz + 22.5 + (5 - i) * 0.1);

  portico(b, ctx, { from: [-46, 40], to: [-46, -6], depth: 7, height: 7, count: 12, y: ctx.terrainHeight(-46, 17) });
  portico(b, ctx, { from: [46, -6], to: [46, 40], depth: 7, height: 7, count: 12, y: ctx.terrainHeight(46, 17) });
}

export default {
  title: 'Acts 3:1-10: Peter heals the lame man',
  subtitle: 'The Beautiful gate of the temple, the hour of prayer. In the name of Jesus Christ of Nazareth rise up and walk.',
  seed: 29,

  style: { ...DAY_STYLE, fog: { color: '#f0d8ad', near: 140, far: 1100 } },

  sky: { zenith: '#3a72a2', mid: '#8eb4c0', horizon: '#f5d6a0', ground: '#d4b88a', glowColor: '#ffe2a8', glowDir: [-0.6, 0.4, 0.5] },

  sun: {
    dir: [-0.55, 0.62, 0.55],
    color: '#ffe8c6',
    intensity: 2.6,
    hemi: { sky: '#d4e6ec', ground: '#b08a5a', intensity: 1.1 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 260,
    flatRadius: 140,
    hillHeight: 30,
    undulation: 0.0,
    plaza: { center: [0, 17], size: [92, 56] },
    colors: {
      sand: '#d4b88a',
      dirt: '#c2a070',
      grass: '#a49a6a',
      grassDark: '#8a8458',
      plaza: '#e6d4ae',
      plazaLine: '#cbb48a',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#a49a6a',
    },
  },

  mountains: { count: 28, distance: [520, 780], height: [40, 100], widthRatio: [2, 3], colors: ['#a8a090', '#9a9688', '#b0a690', '#a09888'] },

  objects: [],

  custom(ctx) {
    const b = new Batch(ctx);
    temple(b, ctx);
    const ly = ctx.groundHeight(...LAME);
    b.add('#8a5a3c', box(1.6, 0.06, 1.1, [LAME[0] - 0.2, ly + 0.03, LAME[1]]), { cast: false });
    b.add('#7a5236', box(0.3, 0.25, 0.3, [LAME[0] - 0.9, ly + 0.12, LAME[1] + 0.4]));
    b.flush();

    person(ctx, { pos: LAME, face: PETER, kneel: true, colors: { robe: '#a89878', mantle: '#7a6a52', skin: '#9c6a45', hair: '#3a2418', sash: '#5e4632', arms: [0.2, 1.5] } });
    person(ctx, { pos: PETER, face: LAME, scale: 1.04, colors: { robe: '#4f6f8a', mantle: '#c8912e', skin: '#a87650', hair: '#7a7068', sash: '#8c5a3c', arms: [0.15, 1.2] } });
    person(ctx, { pos: JOHN, face: LAME, colors: { robe: '#b5523b', mantle: '#e6d8b8', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e', arms: [0.3, 0.5] } });
  },

  clouds: {
    layers: [{ count: 30, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fbf6ea', shade: '#3a4660' }],
  },

  crowd: {
    seed: 29,
    minSpacing: 0.75,
    facing: [0, -4],
    colors: PALETTE,
    aisles: [{ from: [3, 30], to: [1, -5], width: 3.2 }],
    keepClear: [{ kind: 'circle', x: -0.4, z: -4, r: 3.6 }],
    groups: [
      { center: [-0.4, -4], radius: [4.5, 14], angle: [0.75, 1.65], count: 50, children: 0.1 },
      { center: [-0.4, -4], radius: [4.5, 14], angle: [-1.65, -0.75], count: 50, children: 0.1 },
      { shape: 'rect', center: [-26, 18], size: [30, 30], count: 80, facing: [0, -10], facingJitter: 2.5 },
      { shape: 'rect', center: [26, 18], size: [30, 30], count: 80, facing: [0, -10], facingJitter: 2.5 },
      { shape: 'rect', center: [0, -30], size: [60, 20], count: 90, facing: [0, -50] },
    ],
  },

  player: {
    start: [1.6, 1.2],
    lookAt: [-0.8, -7],
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
