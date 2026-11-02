// John 19:16-30: Jesus is crucified at Golgotha outside the walls, between two others, while darkness covers the land.
// Shown with restraint: the crosses on the knoll, those who loved him at its foot, the watching crowd at a distance.
// x is east, z is south. The city wall runs east-west to the north of the knoll.
import { Batch, DAY_STYLE, PALETTE, ball, box, city, cross, cyl, glow, makeRng, person, temple } from './lib/nt-19-kit.js';
import { makeFigure } from '../engine/people.js';

const KNOLL = [0, -19.5];
const CROSSES = [[0, -20], [-5, -18.8], [5, -18.8]];
const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#4a3020', sash: '#e9dcc0', arms: [1.45, 0] };
const THIEF = { robe: '#c0ae8e', mantle: '#a08a6a', skin: '#9c6a45', hair: '#2b1a12', arms: [1.45, 0] };
const SOLDIER = { robe: '#a83a2a', mantle: '#8a2e22', skin: '#a87650', hair: '#8a8a88', sash: '#c8a040' };

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(23);
  const gy = ctx.terrainHeight(...KNOLL);

  // The rocky knoll.
  b.add('#7a6a58', ball(1, [KNOLL[0], gy - 0.4, KNOLL[1]], [10, 2.1, 5.5], 12));
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2, r = 0.6 + rng() * 0.45;
    const x = KNOLL[0] + Math.sin(a) * 10 * r, z = KNOLL[1] + Math.cos(a) * 5.5 * r;
    const top = gy - 0.4 + 2.1 * Math.sqrt(Math.max(0, 1 - r * r));
    b.add(rng() < 0.5 ? '#6a5c4c' : '#8a7a66', ball(0.3 + rng() * 0.5, [x, top, z], [1.3, 0.7, 1], 6));
  }
  ctx.addCollider({ x: KNOLL[0], z: KNOLL[1], hx: 8, hz: 4, rot: 0, top: gy + 1.6 });
  ctx.exclude({ kind: 'rect', x: KNOLL[0], z: KNOLL[1], hx: 9.5, hz: 5 });
  const knollTop = gy + 1.5;

  // Three crosses with those crucified upon them, arms along the beams.
  const people = [];
  CROSSES.forEach(([x, z], i) => {
    const height = i ? 4.6 : 5.4;
    const base = cross(b, ctx, { pos: [x, z], height, span: 3.2, y: knollTop - (i ? 0.25 : 0) });
    const fig = makeFigure(i ? THIEF : CHRIST, ctx.kit, { glow: i ? 0 : 0.3 });
    fig.position.set(x, base + height - 0.6 - 1.32, z + 0.22);
    fig.rotation.x = i ? 0.12 : 0.08;
    ctx.scene.add(fig);
    people.push(fig);
    if (!i) {
      b.add('#e8e0cc', box(0.9, 0.4, 0.06, [x, base + height - 0.05, z + 0.16]));
      b.add('#3a2a20', box(0.7, 0.05, 0.07, [x, base + height - 0.05, z + 0.17]));
    }
  });
  glow(ctx, { pos: [0, knollTop + 4, -19.6], size: 5, color: '#fff0d0', opacity: 0.35, pulse: 0.02 });

  // The city wall behind, with its gate, and the temple beyond.
  city(b, ctx, { wall: [[160, -105], [-160, -105]], gate: 190, depth: 70, count: 60, height: 10, seed: 24, towers: 8, wallColor: '#a89478', colors: ['#a08a70', '#968068', '#ae9a7c'], skip: (x, z) => Math.abs(x - 40) < 50 && z < -140 });
  temple(b, ctx, { pos: [40, -180], scale: 0.85 });
  // A road out of the gate past the knoll.
  for (let z = -102; z < 40; z += 2.5) b.add('#9a8670', box(4.5, 0.04, 2.4, [-30 + z * 0.08, ctx.terrainHeight(-30 + z * 0.08, z) + 0.02, z], [0, 0.08, 0]), { cast: false });

  // Spears for the soldiers.
  for (const [x, z] of [[7.4, -13.4], [-8.6, -13.8], [9.6, -15.6]]) b.add('#5a4a3a', cyl(0.04, 0.04, 3.4, [x + 0.35, ctx.terrainHeight(x, z) + 1.7, z], [0, 0, 0], 5));
  b.flush();

  // At the foot of the cross: his mother, the disciple whom he loved, and the women.
  const foot = [0, -20];
  person(ctx, { pos: [-1.2, -13.6], face: foot, colors: { robe: '#3e5a8a', mantle: '#2e4470', skin: '#b5825a', hair: '#e6d8b8' } });
  person(ctx, { pos: [0.6, -13.4], face: foot, colors: { robe: '#b5523b', mantle: '#6f8a6a', skin: '#a87650', hair: '#4a3020' } });
  person(ctx, { pos: [-2.6, -13.9], face: foot, kneel: true, colors: { robe: '#7a3a5a', mantle: '#d9c7a3', skin: '#a87650', hair: '#5a3a22' } });
  person(ctx, { pos: [2.2, -14.0], face: foot, colors: { robe: '#6b5a4a', mantle: '#c8a97a', skin: '#9c6a45', hair: '#e6d8b8' } });
  // Roman soldiers keeping watch.
  for (const p of [[7.4, -13.4], [-8.6, -13.8], [9.6, -15.6], [-10.6, -16.4]]) person(ctx, { pos: p, face: [p[0] * 0.5, -10], colors: SOLDIER });
}

export default {
  title: 'John 19:16-30: The Crucifixion',
  subtitle: 'There was a darkness over all the earth. It is finished',
  seed: 23,
  style: { ...DAY_STYLE, fog: { color: '#3a3032', near: 70, far: 520 } },
  sky: { zenith: '#16121a', mid: '#2e2428', horizon: '#5e463a', ground: '#2a2220', glowColor: '#8a5a3a', glowDir: [-0.3, 0.08, -1] },
  sun: { dir: [-0.3, 0.75, -0.5], color: '#c8a890', intensity: 0.9, hemi: { sky: '#6a5a62', ground: '#3a2a24', intensity: 0.85 }, shadowSize: 60 },
  ground: {
    size: 1000, segments: 200, flatRadius: 140, hillHeight: 35, undulation: 0.3,
    plaza: { center: [0, 900], size: [1, 1] },
    colors: { sand: '#7a6a56', dirt: '#6a5a48', grass: '#5e5a44', grassDark: '#4e4a3a', plaza: '#7a6a56', plazaLine: '#6a5a48', scorch: '#2a2020', scorchEdge: '#3a2a20', hill: '#4a4040' },
  },
  mountains: { count: 26, distance: [420, 720], height: [50, 130], widthRatio: [1.6, 2.6], colors: ['#2e2628', '#362c2c', '#28222a'] },
  objects: [
    { type: 'stones', count: 400, ring: [6, 120], size: [0.12, 0.4], colors: ['#7a6a58', '#6a5c4c', '#8a7a66'] },
  ],
  custom,
  clouds: {
    layers: [
      { count: 50, distance: [200, 700], height: [70, 160], size: [50, 100], color: '#4a3e44', shade: '#1a1418' },
      { count: 18, distance: [120, 400], height: [60, 120], size: [40, 80], color: '#5a4a48', shade: '#221a1e' },
    ],
  },
  crowd: {
    seed: 23,
    minSpacing: 0.7,
    facing: [0, -20],
    colors: { ...PALETTE, robes: ['#7a6a52', '#8c5a3c', '#6b5a4a', '#a87b4f', '#5e4632', '#9c6b4e', '#c8a97a', '#4f6a6a'] },
    aisles: [{ from: [-1, 30], to: [-0.5, -12], width: 5 }],
    keepClear: [{ kind: 'circle', x: 0, z: -14, r: 4 }],
    groups: [
      { center: [0, -18], radius: [15, 34], angle: [-1.9, 1.9], count: 260, children: 0.05, kneel: 0.1, facingJitter: 0.4 },
      { shape: 'rect', center: [-24, -40], size: [16, 20], count: 60, facingJitter: 0.5 },
      { shape: 'rect', center: [26, -40], size: [14, 18], count: 40, facingJitter: 0.5 },
    ],
  },
  player: {
    start: [-0.8, -7.5],
    lookAt: [0, -21],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
