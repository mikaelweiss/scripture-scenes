// Joseph Smith-History 1:66-67. The Smiths' small log home in Harmony, Pennsylvania, April 1829.
// x is east, z is south. One room: hearth on the north wall, the table at the center.
import * as THREE from 'three';
import { ball, baseStyle, box, candle, cyl, glow, groundSpec, keepCameraInside, makeRng, mesh, planks, scatter, settler, solid, trees, figure } from './lib/pgp-07-kit.js';

const W = 5;
const N = -4.5;
const S = 6;
const CEIL = 3.4;
const START = [2.2, 2.4];

// Horizontal logs along one wall, skipping window and door openings. axis 'x' runs along x at fixed z.
function logWall(geos, axis, fixed, from, to, openings = []) {
  const r = 0.17;
  for (let y = r; y < CEIL + r; y += r * 2) {
    const cuts = openings.filter(([, , y0, y1]) => y > y0 && y < y1).sort((a, b) => a[0] - b[0]);
    let a = from;
    for (const [o0, o1] of [...cuts, [to, to]]) {
      if (o0 - a > 0.05) {
        const len = o0 - a, mid = (a + o0) / 2;
        geos.push(axis === 'x' ? cyl(r, r, len, mid, y, fixed, { rz: Math.PI / 2 }) : cyl(r, r, len, fixed, y, mid, { rx: Math.PI / 2 }));
      }
      a = o1;
    }
  }
}

function windowFrame(ctx, axis, fixed, at, y0, y1, width) {
  const t = 0.42;
  const parts = axis === 'x'
    ? [box(width + 0.2, 0.1, t, at, y0, fixed), box(width + 0.2, 0.1, t, at, y1, fixed), box(0.1, y1 - y0, t, at - width / 2, (y0 + y1) / 2, fixed), box(0.1, y1 - y0, t, at + width / 2, (y0 + y1) / 2, fixed), box(0.05, y1 - y0, 0.06, at, (y0 + y1) / 2, fixed), box(width, 0.05, 0.06, at, (y0 + y1) / 2, fixed)]
    : [box(t, 0.1, width + 0.2, fixed, y0, at), box(t, 0.1, width + 0.2, fixed, y1, at), box(t, y1 - y0, 0.1, fixed, (y0 + y1) / 2, at - width / 2), box(t, y1 - y0, 0.1, fixed, (y0 + y1) / 2, at + width / 2), box(0.06, y1 - y0, 0.05, fixed, (y0 + y1) / 2, at), box(0.06, 0.05, width, fixed, (y0 + y1) / 2, at)];
  mesh(ctx, parts, '#e2d6b8');
}

export default {
  title: 'Joseph Smith-History 1:66-67: Translating in Harmony',
  subtitle: 'A small home in Harmony, Pennsylvania, April 1829',
  seed: 1829,

  style: baseStyle({ fog: { color: '#dfe8d8', near: 80, far: 700 } }),

  sky: {
    zenith: '#4a8ac0',
    mid: '#94c2dc',
    horizon: '#eef2e0',
    ground: '#9aa86a',
    glowColor: '#fff6da',
    glowDir: [1, 0.5, 0.2],
  },

  sun: {
    dir: [0.8, 0.55, 0.25],
    color: '#fff2da',
    intensity: 2.4,
    hemi: { sky: '#f0e8d6', ground: '#9a7a58', intensity: 1.6 },
    shadowSize: 40,
  },

  ground: groundSpec({
    sand: '#a6a462',
    dirt: '#9a7e52',
    grass: '#8fae5c',
    grassDark: '#6f8e46',
    hill: '#7f9a5a',
  }, { undulation: 0, flatRadius: 90, hillHeight: 60 }),

  mountains: { count: 26, distance: [500, 800], height: [60, 120], widthRatio: [2.2, 3.4], colors: ['#7f9ab0', '#8aa4b8', '#6f8fa6'] },

  objects: [],

  custom(ctx) {
    const rng = makeRng(3);
    trees(ctx, scatter(rng, 90, { ring: [16, 120], height: [9, 15], spacing: 5 }), { seed: 4, leaves: ['#7fb560', '#6faa5a', '#8fbf68', '#5f9e5a'] });

    planks(ctx, { x0: -W, x1: W, z0: N, z1: S, colors: ['#a07a4e', '#8f6c44', '#ab8656'], along: 'x' });

    // Log walls with windows east and west, a door south, the hearth north.
    const logs = [];
    const eastWin = [-0.6, 1.0, 1.0, 2.3];
    const westWin = [1.2, 2.8, 1.0, 2.3];
    logWall(logs, 'x', N - 0.17, -W - 0.3, W + 0.3, [[-1.4, 1.4, 0, 2.6]]);
    logWall(logs, 'x', S + 0.17, -W - 0.3, W + 0.3, [[1.4, 2.4, 0, 2.3], [-3.6, -2.4, 1.0, 2.2]]);
    logWall(logs, 'z', W + 0.17, N, S, [eastWin, [3.6, 4.6, 1.0, 2.2]]);
    logWall(logs, 'z', -W - 0.17, N, S, [westWin]);
    mesh(ctx, logs.filter((_, i) => i % 2 === 0), '#8a6440');
    mesh(ctx, logs.filter((_, i) => i % 2 === 1), '#7a5636');
    windowFrame(ctx, 'z', W + 0.1, (eastWin[0] + eastWin[1]) / 2, eastWin[2], eastWin[3], eastWin[1] - eastWin[0]);
    windowFrame(ctx, 'z', W + 0.1, 4.1, 1.0, 2.2, 1.0);
    windowFrame(ctx, 'z', -W - 0.1, (westWin[0] + westWin[1]) / 2, westWin[2], westWin[3], westWin[1] - westWin[0]);
    windowFrame(ctx, 'x', S + 0.1, -3.0, 1.0, 2.2, 1.2);
    mesh(ctx, [box(1.0, 2.3, 0.08, 1.9, 1.15, S + 0.12)], '#6e4a2c');
    mesh(ctx, [box(0.08, 0.08, 0.1, 2.25, 1.1, S + 0.05)], '#2b2420');
    for (const [x, z, hx, hz] of [[0, N - 0.2, W + 0.4, 0.3], [0, S + 0.2, W + 0.4, 0.3], [W + 0.2, (N + S) / 2, 0.3, (S - N) / 2], [-W - 0.2, (N + S) / 2, 0.3, (S - N) / 2]]) solid(ctx, x, z, hx, hz, 8, 0, { exclude: false });

    // Ceiling boards and beams, and the roof above.
    mesh(ctx, box(2 * W + 1, 0.12, S - N + 1, 0, CEIL + 0.1, (N + S) / 2), '#a07a52');
    const beams = [];
    for (let x = -W + 1; x < W; x += 2) beams.push(box(0.22, 0.24, S - N, x, CEIL - 0.08, (N + S) / 2));
    mesh(ctx, beams, '#5e4028');
    const rise = 2.4;
    const ang = Math.atan2(rise, W + 0.6);
    const len = Math.hypot(W + 0.6, rise) + 0.4;
    mesh(ctx, [box(len, 0.2, S - N + 1.4, -(W + 0.6) / 2, CEIL + 0.3 + rise / 2, (N + S) / 2, { rz: ang }), box(len, 0.2, S - N + 1.4, (W + 0.6) / 2, CEIL + 0.3 + rise / 2, (N + S) / 2, { rz: -ang })], '#6e5a48');

    // Stone hearth with a low fire.
    const hearth = [box(3.4, 2.7, 0.7, 0, 1.35, N + 0.1), box(3.6, 0.2, 0.9, 0, 2.7, N + 0.2), box(1.6, CEIL, 0.9, 0, CEIL / 2 + 1.3, N - 0.1)];
    mesh(ctx, hearth, '#9a8f80');
    mesh(ctx, box(1.8, 1.3, 0.3, 0, 0.65, N + 0.42), '#2b201a', { cast: false });
    mesh(ctx, box(2.6, 0.06, 0.9, 0, 0.03, N + 0.9), '#8a8072', { cast: false });
    mesh(ctx, [cyl(0.08, 0.08, 1.0, -0.15, 0.12, N + 0.62, { rz: Math.PI / 2, ry: 0.3 }), cyl(0.08, 0.08, 1.0, 0.15, 0.18, N + 0.62, { rz: Math.PI / 2, ry: -0.3 })], '#4a3020');
    mesh(ctx, [ball(0.22, -0.1, 0.38, N + 0.6, { sy: 1.6, seg: 8 }), ball(0.16, 0.2, 0.33, N + 0.62, { sy: 1.5, seg: 8 })], '#f08a2c', { emissive: '#c85a10', cast: false });
    mesh(ctx, [ball(0.1, 0, 0.36, N + 0.7, { sy: 1.8, seg: 8 })], '#ffe08a', { emissive: '#ffb347', cast: false });
    glow(ctx, 0, 0.5, N + 0.75, 2.4, '#ffa850', 0.7, 0.1);
    const fire = new THREE.PointLight('#ffa860', 9, 9, 1.4);
    fire.position.set(0, 0.8, N + 1.3);
    ctx.scene.add(fire);
    ctx.onFrame((t) => (fire.intensity = 9 * (0.9 + Math.sin(t * 8.3) * 0.06 + Math.sin(t * 12.1) * 0.04)));
    mesh(ctx, [ball(0.28, -1.1, 0.35, N + 1.0, { sy: 0.8, seg: 10 })], '#2b2a2a');
    solid(ctx, 0, N + 0.3, 1.9, 0.75, 8, 0, { exclude: false });

    // The table where Joseph dictates and Oliver writes.
    const T = [0.2, -0.4];
    const table = [box(2.0, 0.07, 1.0, 0, 0.78, 0)];
    for (const dx of [-0.88, 0.88]) for (const dz of [-0.4, 0.4]) table.push(box(0.08, 0.76, 0.08, dx, 0.38, dz));
    mesh(ctx, table, '#8a5c34', { at: [T[0], 0, T[1], 0] });
    solid(ctx, T[0], T[1], 1.05, 0.55, 0.85, 0, { exclude: false });
    mesh(ctx, [box(0.32, 0.03, 0.42, -0.45, 0.83, 0.05), box(0.3, 0.03, 0.4, -0.2, 0.83, -0.25)], '#f4efdc', { at: [T[0], 0, T[1], 0] });
    for (let i = 0; i < 6; i++) mesh(ctx, box(0.3, 0.012, 0.4, 0, 0.85 + i * 0.013, 0), i % 2 ? '#f4efdc' : '#ebe4cc', { at: [T[0] - 0.75, 0, T[1] + 0.25, 0.15 * i] });
    mesh(ctx, [cyl(0.05, 0.06, 0.08, -0.15, 0.85, 0.25, { seg: 8 })], '#2b2420', { at: [T[0], 0, T[1], 0] });
    mesh(ctx, [cyl(0.004, 0.025, 0.32, -0.38, 0.95, 0.1, { rz: 0.9, rx: 0.3 })], '#f6f2e8', { at: [T[0], 0, T[1], 0] });
    mesh(ctx, [cyl(0.2, 0.2, 0.03, 0.55, 0.81, 0, { seg: 14 }), cyl(0.13, 0.14, 0.2, 0.55, 0.92, 0, { seg: 12 })], '#2b2420', { at: [T[0], 0, T[1], 0] });
    candle(ctx, T[0] + 0.05, 0.815, T[1] - 0.35, { light: 2.5, distance: 5 });

    // Chairs, and the two men at work.
    const chair = (x, z, rot) => {
      const g = [box(0.5, 0.05, 0.5, 0, 0.48, 0), box(0.5, 0.6, 0.05, 0, 0.8, -0.23)];
      for (const dx of [-0.21, 0.21]) for (const dz of [-0.21, 0.21]) g.push(box(0.05, 0.48, 0.05, dx, 0.24, dz));
      mesh(ctx, g, '#6e4a2c', { at: [x, 0, z, rot] });
    };
    chair(T[0] - 1.35, T[1], Math.PI / 2);
    chair(T[0] + 1.35, T[1], -Math.PI / 2);
    settler(ctx, T[0] - 1.25, T[1], { y: 0.2, coat: '#2f3440', trousers: '#3b3226', hair: '#3a2418', kneel: true, face: [T[0] + 2, T[1] + 0.15], arms: [0.15, 1.0], clear: 0.9 });
    settler(ctx, T[0] + 1.25, T[1], { y: 0.2, coat: '#4a3a2e', trousers: '#3b3226', hair: '#8a5a32', kneel: true, face: [T[0] - 2, T[1]], arms: [0.2, 1.15], clear: 0.9 });

    // The plates rest wrapped in linen on a chest by the bed.
    mesh(ctx, [box(1.2, 0.6, 0.6, 0, 0.3, 0), box(1.24, 0.08, 0.64, 0, 0.62, 0)], '#6e4a2c', { at: [-3.9, 0, -2.0, Math.PI / 2] });
    mesh(ctx, ball(0.3, 0, 0.74, 0, { sx: 1, sy: 0.4, sz: 1.2, seg: 10 }), '#efe8d6', { at: [-3.9, 0, -2.0, 0] });
    solid(ctx, -3.9, -2.0, 0.35, 0.65, 0.8, 0, { exclude: false });

    // Bed in the northwest corner and a cupboard of dishes.
    mesh(ctx, [box(1.5, 0.45, 2.0, 0, 0.3, 0)], '#6e4a2c', { at: [-4.1, 0, 0.6, 0] });
    mesh(ctx, [box(1.4, 0.18, 1.9, 0, 0.6, 0)], '#3e6e86', { at: [-4.1, 0, 0.6, 0] });
    mesh(ctx, [box(1.4, 0.04, 0.8, 0, 0.7, 0.45)], '#d9c7a3', { at: [-4.1, 0, 0.6, 0] });
    mesh(ctx, [box(0.9, 0.12, 0.4, 0, 0.75, -0.65)], '#f4efe2', { at: [-4.1, 0, 0.6, 0] });
    solid(ctx, -4.1, 0.6, 0.8, 1.05, 0.9, 0, { exclude: false });
    const cup = [box(1.4, 2.0, 0.45, 0, 1.0, 0), box(1.3, 0.04, 0.4, 0, 1.35, 0.03), box(1.3, 0.04, 0.4, 0, 1.75, 0.03)];
    mesh(ctx, cup, '#7a5636', { at: [W - 0.3, 0, -2.6, -Math.PI / 2] });
    const dishes = [];
    for (let i = 0; i < 5; i++) dishes.push(cyl(0.11, 0.11, 0.02, 0, 0, 0, { rx: Math.PI / 2 - 0.2, seg: 12 }).translate(-0.5 + i * 0.25, 1.48, -0.05));
    for (let i = 0; i < 4; i++) dishes.push(cyl(0.06, 0.05, 0.14, -0.4 + i * 0.27, 1.85, 0, { seg: 8 }));
    mesh(ctx, dishes, '#e8eef0', { at: [W - 0.3, 0, -2.6, -Math.PI / 2] });
    solid(ctx, W - 0.3, -2.6, 0.3, 0.75, 2.1, 0, { exclude: false });

    // Emma at the hearth.
    const emma = figure(ctx, { robe: '#5a6a7a', mantle: '#4a5868', skin: '#e0b088', hair: '#f2ece0', sash: '#e8e0cc', arms: [0.2, 0.5] }, -2.1, N + 1.6, { face: [-1.1, N + 1.0], clear: 0.8 });
    emma.add(mesh(ctx, box(0.42, 0.55, 0.05, 0, 0.75, 0.25), '#efe8d6', { at: [0, 0, 0, 0] }));

    // Braided rug and sunlight through the east window.
    for (const [r, c] of [[1.2, '#a8604a'], [0.9, '#d9b46a'], [0.6, '#5a7a8a'], [0.3, '#b5523b']]) mesh(ctx, cyl(r, r, 0.02, -0.6, 0.02 + (1.2 - r) * 0.02, 2.4, { seg: 24 }).scale(1.3, 1, 1), c, { cast: false });

    keepCameraInside(ctx, { minX: -W + 0.35, maxX: W - 0.35, minZ: N + 0.35, maxZ: S - 0.35, maxY: CEIL - 0.45 });
  },

  light: {
    beams: [{ from: [W + 2.5, 3.6, 0.2], to: { at: [1.6, 0.2], lift: 0 }, width: [1.6, 2.4], color: '#fff2d0', intensity: 0.22, layers: 2, stripes: 8, fadeLow: 0.1 }],
  },

  player: {
    start: START,
    lookAt: [2.2, -2.2],
    fov: 66,
    colors: { robe: '#3b3226', mantle: '#5a4a3a', skin: '#d9a77c', hair: '#4a3020', sash: '#2b1a12' },
  },

};
