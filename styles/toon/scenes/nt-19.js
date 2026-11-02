// Luke 19:1-10: Jesus passes through Jericho and stops under the sycamore where Zacchaeus has climbed to see him.
// x is east, z is south. The street runs north through the town, the tree stands at its east edge.
import { Batch, DAY_STYLE, PALETTE, house, makeRng, palm, person, sycamore, bush } from './lib/nt-19-kit.js';

const TREE = [6, -16];
const JESUS = [1.2, -12.5];
const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#4a3020', sash: '#e9dcc0' };
const DISCIPLES = [
  { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' },
  { robe: '#6f8a6a', mantle: '#d9c7a3', skin: '#a87650', hair: '#3a2418' },
  { robe: '#c8a97a', mantle: '#8c5a3c', skin: '#8a5a3b', hair: '#1f140e' },
  { robe: '#4f7f80', mantle: '#c8a97a', skin: '#b5825a', hair: '#4a3020' },
  { robe: '#9c6b4e', mantle: '#3e6e66', skin: '#a87650', hair: '#2b1a12' },
];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(19);
  const colors = ['#e3cfa6', '#d8c095', '#cdb48a', '#e8d6ae', '#c9a878'];
  const trims = ['#b5523b', '#c2a27a', '#4f7f80', '#c8912e'];

  for (const side of [-1, 1]) {
    let z = 34;
    while (z > -70) {
      const d = 7 + rng() * 4;
      const w = 6 + rng() * 3;
      const zc = z - d / 2;
      const nearTree = side === 1 && Math.abs(zc - TREE[1]) < 9;
      if (!nearTree) {
        house(b, ctx, { pos: [side * (8 + w / 2 + rng() * 1.5), zc], size: [w, d], height: 3.6 + rng() * 2.8, rot: side * Math.PI / 2, color: colors[Math.floor(rng() * colors.length)], trim: trims[Math.floor(rng() * trims.length)], upper: rng() < 0.35 });
      }
      z -= d + 1.5 + rng() * 2;
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (30 + rng() * 70), z = -90 + rng() * 140;
    house(b, ctx, { pos: [x, z], size: [6 + rng() * 4, 6 + rng() * 4], height: 3.5 + rng() * 2, rot: rng() * 0.3, color: colors[Math.floor(rng() * colors.length)], trim: '#c2a27a' });
  }

  const limbs = sycamore(b, ctx, { pos: TREE, size: 1.05, seed: 7, seat: Math.atan2(-6, 9) });
  for (const [x, z, h] of [[-6.5, 20, 9], [-6.8, -4, 10], [7, 8, 8.5], [-6.4, -30, 9.5], [7, -42, 10], [-7, -56, 8], [20, -20, 9], [-22, -10, 11], [24, 10, 10]]) {
    palm(b, ctx, { pos: [x, z], height: h, lean: 0.12 + rng() * 0.15, dir: rng() * 6.28, seed: Math.floor(rng() * 99) });
  }
  for (let i = 0; i < 30; i++) bush(b, ctx, { pos: [(rng() < 0.5 ? -1 : 1) * (26 + rng() * 60), -80 + rng() * 120], size: 0.6 + rng() * 0.6, color: rng() < 0.5 ? '#7d8a4a' : '#6f8458' });
  b.flush();

  // Zacchaeus sits on a low limb that reaches over the street toward Jesus.
  const [lx, ly, lz] = limbs.seat;
  const z = person(ctx, { pos: [lx, lz], y: ly - 0.1, face: JESUS, kneel: true, scale: 1, colors: { robe: '#9a2f4a', mantle: '#e0b040', skin: '#a87650', hair: '#2b1a12', sash: '#e0b040', arms: [0.5, 2.2] } });
  z.rotation.x = 0.25;

  person(ctx, { pos: JESUS, face: [lx, lz], scale: 1.08, glow: 0.18, colors: { ...CHRIST, arms: [0.3, 1.9] } }).rotation.x = -0.12;
  const spots = [[-0.8, -9.8], [2.6, -9.6], [0.4, -8.2], [-1.6, -7.4], [2.0, -7.0]];
  spots.forEach((p, i) => person(ctx, { pos: p, face: [lx, lz], colors: DISCIPLES[i] }));
}

export default {
  title: 'Luke 19:1-10: Zacchaeus in the sycamore',
  subtitle: 'Zacchaeus, make haste, and come down; for to day I must abide at thy house',
  seed: 19,
  style: { ...DAY_STYLE, fog: { color: '#f0d8a8', near: 120, far: 900 } },
  sky: { zenith: '#2f6f8a', mid: '#7fb0b8', horizon: '#f3d39a', ground: '#d9b98a', glowColor: '#ffe7ad', glowDir: [0.4, 0.5, -1] },
  sun: { dir: [0.6, 0.8, 0.35], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 140, hillHeight: 45, undulation: 0.2,
    plaza: { center: [0, -18], size: [12, 110] },
    colors: { sand: '#d4ac6c', dirt: '#c49a62', grass: '#9a9a5a', grassDark: '#7d8a4a', plaza: '#e2cfa4', plazaLine: '#cdb48a', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b89060' },
  },
  mountains: { count: 30, distance: [450, 750], height: [60, 150], widthRatio: [1.6, 2.6], colors: ['#b0886a', '#a07a60', '#c0987a', '#987058'] },
  objects: [
    { type: 'stones', count: 300, ring: [10, 120], size: [0.12, 0.35], colors: ['#cdb48a', '#b89a70'] },
  ],
  custom,
  clouds: { layers: [{ count: 20, distance: [400, 800], height: [100, 200], size: [40, 80], color: '#fff6e4', shade: '#8a7a8a' }] },
  crowd: {
    seed: 19,
    minSpacing: 0.62,
    facing: JESUS,
    colors: PALETTE,
    aisles: [{ from: [0, 30], to: [0.6, -9], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: JESUS[0], z: JESUS[1], r: 3.2 }, { kind: 'circle', x: TREE[0], z: TREE[1], r: 3 }],
    groups: [
      { shape: 'rect', center: [-4.5, 0], size: [6, 56], count: 230, children: 0.15, facingJitter: 0.8 },
      { shape: 'rect', center: [4.5, 6], size: [6, 44], count: 190, children: 0.15, facingJitter: 0.8 },
      { center: JESUS, radius: [3.2, 8], angle: [1.7, 4.6], count: 60, children: 0.1 },
      { shape: 'rect', center: [0, -34], size: [13, 24], count: 160, children: 0.12 },
      { center: TREE, radius: [3, 7], angle: [0, 3.14], count: 30, facing: TREE, children: 0.3 },
    ],
  },
  player: {
    start: [0.3, -4],
    lookAt: [TREE[0] - 1, TREE[1]],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
