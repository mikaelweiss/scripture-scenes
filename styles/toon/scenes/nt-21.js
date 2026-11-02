// Luke 22:7-20 and John 13: the Passover meal in a large upper room, with bread, wine, and a basin for washing feet.
// x is east, z is south. The upper room sits on a lower story and opens south onto a roof terrace with an outside stair.
import { Batch, DAY_STYLE, ball, box, cyl, glow, house, lamp, makeRng, moon, person, room, stars } from './lib/nt-19-kit.js';

const BASE = { x: 0, z: -6, hx: 11, hz: 9, h: 3.6 };
const ROOM = [0, -8];
const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#4a3020', sash: '#e9dcc0' };
const TWELVE = [
  { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#d9d0c0', sash: '#c8912e' },
  { robe: '#c8a97a', mantle: '#b5523b', skin: '#b5825a', hair: '#4a3020' },
  { robe: '#6f8a6a', mantle: '#d9c7a3', skin: '#a87650', hair: '#3a2418' },
  { robe: '#8c5a3c', mantle: '#c8a97a', skin: '#8a5a3b', hair: '#1f140e' },
  { robe: '#4f7f80', mantle: '#c8a97a', skin: '#b5825a', hair: '#4a3020' },
  { robe: '#9c6b4e', mantle: '#3e6e66', skin: '#a87650', hair: '#2b1a12' },
  { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#9c6a45', hair: '#2b1a12' },
  { robe: '#7a6a52', mantle: '#c8912e', skin: '#a87650', hair: '#3a2418' },
  { robe: '#b5523b', mantle: '#6b5a4a', skin: '#8a5a3b', hair: '#1f140e' },
  { robe: '#bfa27a', mantle: '#4f7f80', skin: '#b5825a', hair: '#2b1a12' },
  { robe: '#6b5a4a', mantle: '#a64b35', skin: '#9c6a45', hair: '#4a3020' },
  { robe: '#e6d8b8', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12' },
];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(21);
  const y0 = ctx.terrainHeight(BASE.x, BASE.z) - 0.2;
  const top = y0 + BASE.h;

  // Lower story with its door and shuttered windows.
  b.add('#d8c095', box(BASE.hx * 2, BASE.h, BASE.hz * 2, [BASE.x, y0 + BASE.h / 2, BASE.z]));
  b.add('#c2a27a', box(BASE.hx * 2 + 0.3, 0.3, BASE.hz * 2 + 0.3, [BASE.x, top - 0.1, BASE.z]));
  b.add('#3a2418', box(1.3, 2.2, 0.1, [-6, y0 + 1.1, BASE.z + BASE.hz + 0.03]));
  for (const wx of [-9, 5.5, 8.5]) b.add('#2b1a12', box(0.8, 0.9, 0.1, [wx, y0 + 2.2, BASE.z + BASE.hz + 0.03]));
  ctx.addCollider({ x: BASE.x, z: BASE.z, hx: BASE.hx, hz: BASE.hz, rot: 0, top, walkable: true });

  // Outside stair up to the terrace, and a parapet round the roof.
  const steps = 12, rise = BASE.h / steps, run = 0.45;
  for (let i = 0; i < steps; i++) {
    const t = top - (i + 1) * rise + rise;
    const zc = BASE.z + BASE.hz + (i + 0.5) * run;
    b.add('#cdb48a', box(2.6, t - y0, run, [2.5, y0 + (t - y0) / 2, zc]));
    ctx.addCollider({ x: 2.5, z: zc, hx: 1.3, hz: run / 2, rot: 0, top: t, walkable: true });
  }
  const parapet = (x, z, hx, hz) => {
    b.add('#d8c095', box(hx * 2, 0.8, hz * 2, [x, top + 0.4, z]));
    ctx.addCollider({ x, z, hx, hz, rot: 0, top: top + 0.8 });
  };
  const fz = BASE.z + BASE.hz - 0.2;
  parapet(-4.9, fz, 6.1, 0.2);
  parapet(7.4, fz, 3.6, 0.2);
  parapet(-BASE.hx + 0.2, BASE.z, 0.2, BASE.hz);
  parapet(BASE.hx - 0.2, BASE.z, 0.2, BASE.hz);

  // The upper room, open toward the terrace so it can be seen into.
  const r = room(b, ctx, { pos: ROOM, size: [14, 10], height: 3.8, y: top, lintel: false, color: '#e3cfa6', floor: '#b08a60', beam: '#5a3e28', windows: [[-3, 2.2, 'back'], [3, 2.2, 'back']] });
  const fy = r.y;
  for (let i = 0; i < 7; i++) b.add(i % 2 ? '#9a3a2a' : '#7a5a3a', box(13, 0.02, 1.2, [0, fy + 0.01, -12 + i * 1.3]), { cast: false });

  // A low U-shaped table with cushions round its outside.
  const T = 0.5;
  const table = (x, z, w, d) => {
    b.add('#7a5636', box(w, 0.1, d, [x, fy + T, z]));
    b.add('#e6d8b8', box(w + 0.1, 0.03, d + 0.1, [x, fy + T + 0.06, z]), { cast: false });
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add('#5a3e28', box(0.12, T, 0.12, [x + lx * (w / 2 - 0.2), fy + T / 2, z + lz * (d / 2 - 0.2)]));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: fy + T + 0.1 });
  };
  table(0, -10.8, 7.4, 1.1);
  table(-3.2, -8, 1.1, 4.6);
  table(3.2, -8, 1.1, 4.6);

  // Bread, cups and a wine jug on the cloth.
  const ty = fy + T + 0.08;
  for (const [x, z] of [[-0.5, -10.7], [1.6, -10.8], [-2.2, -10.7], [-3.2, -8.6], [3.2, -7.4], [3.1, -9.6]]) b.add('#c8914a', ball(0.18, [x, ty + 0.04, z], [1.3, 0.45, 1]));
  for (const [x, z] of [[0.45, -10.6], [-1.3, -10.9], [2.6, -10.6], [-3.3, -7.2], [-3.1, -9.6], [3.3, -8.4], [3.2, -6.4]]) b.add('#a0603a', cyl(0.08, 0.06, 0.16, [x, ty + 0.08, z], [0, 0, 0], 8));
  b.add('#b5683b', cyl(0.12, 0.2, 0.5, [0.2, ty + 0.25, -11.05], [0, 0, 0], 9));
  b.add('#b5683b', cyl(0.07, 0.12, 0.12, [0.2, ty + 0.55, -11.05], [0, 0, 0], 8));
  for (const [x, z] of [[-1.1, -10.6], [3.3, -9.0]]) b.add('#d8c095', cyl(0.3, 0.22, 0.05, [x, ty + 0.03, z], [0, 0, 0], 12));

  // Basin, pitcher and towel by the entrance (John 13:4-5).
  const bx = 4.2, bz = -4.6;
  b.add('#a87b4f', cyl(0.5, 0.36, 0.3, [bx, fy + 0.15, bz], [0, 0, 0], 14));
  b.add('#7ab0c0', cyl(0.44, 0.44, 0.02, [bx, fy + 0.27, bz], [0, 0, 0], 14), { cast: false });
  b.add('#b5683b', cyl(0.13, 0.24, 0.55, [bx + 0.9, fy + 0.28, bz - 0.2], [0, 0, 0], 9));
  b.add('#b5683b', cyl(0.08, 0.13, 0.16, [bx + 0.9, fy + 0.62, bz - 0.2], [0, 0, 0], 8));
  b.add('#f6f1e4', box(0.7, 0.06, 0.4, [bx - 0.8, fy + 0.04, bz + 0.3], [0, 0.4, 0]), { cast: false });
  ctx.addCollider({ x: bx + 0.3, z: bz, hx: 0.8, hz: 0.5, rot: 0, top: fy + 0.3 });

  // The city at night: flat roofs round about, a few windows still lit.
  for (let i = 0, n = 0; n < 70 && i < 400; i++) {
    const a = rng() * Math.PI * 2, d = 22 + rng() * 90;
    const x = Math.sin(a) * d, z = -6 + Math.cos(a) * d;
    if (ctx.blocked(x, z, 2) || (Math.abs(x) < 16 && z > 0 && z < 40)) continue;
    house(b, ctx, { pos: [x, z], size: [6 + rng() * 5, 6 + rng() * 5], height: 3.5 + rng() * 4, rot: (rng() - 0.5) * 0.2, color: ['#b8a888', '#a8987a', '#c0ac8a'][n % 3], trim: '#8a7a62', lit: rng() < 0.45, upper: rng() < 0.3 });
    n++;
  }

  lamp(b, ctx, { pos: [-1.6, -10.7], y: ty, light: { color: '#ffb060', intensity: 9, distance: 14 } });
  lamp(b, ctx, { pos: [3.2, -8.2], y: ty, light: { color: '#ffb060', intensity: 6, distance: 10 } });
  lamp(b, ctx, { pos: [-3.2, -7.0], y: ty, light: { color: '#ffb060', intensity: 6, distance: 10 } });
  lamp(b, ctx, { pos: [5.8, -4.2], y: fy + 0.05, light: null });
  b.flush();

  stars(ctx, { count: 700, size: 1.8, minY: 0.12 });
  moon(ctx, { dir: [-0.6, 0.5, -0.8], size: 60 });

  // Jesus at the head of the table, the Twelve seated round it.
  const center = [0, -8.6];
  person(ctx, { pos: [0, -11.9], y: fy, kneel: true, scale: 1.1, glow: 0.3, face: center, colors: { ...CHRIST, arms: [0.3, 1.2] } });
  glow(ctx, { pos: [0, fy + 1.3, -11.9], size: 3.2, color: '#fff3d0', opacity: 0.5 });
  const seats = [[-2.4, -11.9], [-1.2, -11.95], [1.2, -11.95], [2.4, -11.9], [-4.3, -10.1], [-4.35, -8.6], [-4.35, -7.1], [-4.3, -5.7], [4.3, -10.1], [4.35, -8.6], [4.35, -7.1], [4.3, -5.7]];
  seats.forEach((p, i) => person(ctx, { pos: p, y: fy, kneel: true, face: [p[0] * 0.3, -9], colors: TWELVE[i] }));
}

export default {
  title: 'Luke 22:7-20, John 13: The Last Supper',
  subtitle: 'This is my body which is given for you: this do in remembrance of me',
  seed: 21,
  style: { ...DAY_STYLE, fog: { color: '#1e2240', near: 80, far: 500 }, lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [60, 400, 300, 0.5] } },
  sky: { zenith: '#070a1e', mid: '#141a3a', horizon: '#2e3058', ground: '#1a1a2a', glowColor: '#3a3a6a', glowDir: [-0.6, 0.3, -0.8] },
  sun: { dir: [-0.6, 0.7, -0.4], color: '#8aa0d8', intensity: 0.55, hemi: { sky: '#3a4a7a', ground: '#2a2028', intensity: 0.75 }, shadowSize: 50 },
  ground: {
    size: 900, segments: 180, flatRadius: 150, hillHeight: 30, undulation: 0.15,
    plaza: { center: [0, 14], size: [26, 26] },
    colors: { sand: '#6a5a4a', dirt: '#5a4a3e', grass: '#4a4a3a', grassDark: '#3e3e32', plaza: '#76664e', plazaLine: '#5e5040', scorch: '#2a2020', scorchEdge: '#3a2a20', hill: '#3e3a40' },
  },
  mountains: { count: 24, distance: [400, 700], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#1e2038', '#24263e', '#1a1c30'] },
  objects: [],
  custom,
  player: {
    start: [-1.2, -1.2],
    lookAt: [-0.5, -10],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
