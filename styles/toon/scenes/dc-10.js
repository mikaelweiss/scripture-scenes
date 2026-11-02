// D&C 121-123: Joseph Smith writes from the dungeon of Liberty Jail, winter 1838-39.
// x is east, z is south. The room is shown as a cutaway: the south wall is cut low so the camera can look in.
import { worldUV } from '../engine/util.js';
import { Batch, MEN, baseStyle, box, cyl, flames, flatGround, glow, makeRng, saint, shaft, stars, xf } from './lib/dc-08-kit.js';

const X = 6, N = -6, S = 3, H = 5;
const STONE = '#8a847a';

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(1839);
  stars(ctx, { count: 600, size: 1.6 });

  // Rough stone walls with a worn texture, cut low on the south side.
  const walls = [
    [0, N - 0.5, 2 * X + 2, 1, H + 0.4],
    [-X - 0.5, (N + S) / 2, 1, S - N, H + 0.4],
    [X + 0.5, (N + S) / 2, 1, S - N, H + 0.4],
    [0, S + 0.5, 2 * X + 2, 1, 0.9],
  ];
  const stone = [];
  for (const [x, z, w, d, h] of walls) {
    stone.push(worldUV(new THREE.BoxGeometry(w, h, d), { su: 2.4, ox: x, oy: h / 2, oz: z }).translate(x, h / 2, z));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: h });
  }
  stone.push(worldUV(new THREE.BoxGeometry(2 * X, 0.2, S - N), { su: 1.6 }).translate(0, 0, (N + S) / 2));
  for (const g of stone) {
    const m = new THREE.Mesh(g, ctx.kit.stoneMat(STONE));
    m.receiveShadow = true;
    m.castShadow = true;
    ctx.scene.add(m);
  }
  // Heavy timber ceiling with the trapdoor.
  b.add('#3a2e24', box(2 * X + 2, 0.3, S - N + 1, [0, H + 0.15, (N + S) / 2]), { cast: false });
  for (let x = -X + 0.8; x < X; x += 1.6) b.add('#4a3a2c', box(0.35, 0.4, S - N, [x, H - 0.2, (N + S) / 2]), { cast: false });
  b.add('#2a2018', box(1.4, 0.06, 1.4, [-2.4, H - 0.42, -2.5]), { cast: false });
  b.add('#5a4634', box(1.2, 0.05, 1.2, [-2.4, H - 0.46, -2.5]), { cast: false });

  // High barred windows with snow on the sills and cold light falling in.
  for (const wx of [-2.6, 2.6]) {
    b.add('#0e141c', box(1.1, 0.5, 0.2, [wx, H - 0.9, N + 0.02]));
    b.add('#a8c0e0', box(1.0, 0.42, 0.06, [wx, H - 0.9, N + 0.05]), { glow: true });
    for (let k = -0.3; k <= 0.31; k += 0.2) b.add('#1a1a1e', box(0.05, 0.5, 0.06, [wx + k, H - 0.9, N + 0.1]));
    b.add('#eef2f6', box(1.2, 0.08, 0.3, [wx, H - 1.17, N + 0.12]));
    shaft(ctx, { from: [wx, H - 0.9, N + 0.1], to: [wx * 0.6, 0.1, N + 3.2], radius: [0.3, 1.0], color: '#9fb8e0', opacity: 0.07 });
    glow(ctx, { pos: [wx, H - 0.9, N + 0.3], size: 2.2, color: '#a8c4ec', opacity: 0.45, pulse: 0 });
  }

  // Straw and blankets on the floor, a slop bucket, and a crude plank table.
  for (const [cx, cz] of [[-4.3, -3], [4.3, -3], [-1.6, -4.3], [4.1, 1.2]]) {
    for (let i = 0; i < 7; i++) {
      const x = cx + (rng() - 0.5) * 2.2, z = cz + (rng() - 0.5) * 3;
      b.add(rng() < 0.5 ? '#8a7448' : '#7a6640', box(0.9 + rng() * 0.6, 0.05, 0.5 + rng() * 0.4, [x, 0.12, z], [0, rng() * 3, 0]), { cast: false });
    }
  }
  const blankets = [['#6a3a34', -4.6, -4.4, 0.3], ['#4a5a6a', -4.6, -1.5, -0.2], ['#5a4a3a', 4.4, -4.6, 0.1], ['#7a6a4a', 4.5, -1.2, -0.3], ['#3d4a3a', 4.2, 1.4, 0.2]];
  for (const [c, x, z, r] of blankets) b.add(c, box(1.6, 0.12, 2.2, [x, 0.16, z], [0, r, 0]), { cast: false });
  b.add('#4a4440', cyl(0.25, 0.2, 0.45, [5.2, 0.32, 2.2], [0, 0, 0], 10));
  b.add('#6a4e34', box(1.6, 0.08, 0.8, [0.4, 0.82, -3.6]));
  for (const [lx, lz] of [[-0.7, -0.32], [0.7, -0.32], [-0.7, 0.32], [0.7, 0.32]]) b.add('#4a3828', box(0.08, 0.78, 0.08, [0.4 + lx, 0.43, -3.6 + lz]));
  b.add('#5a4634', box(0.9, 0.06, 0.4, [0.4, 0.48, -4.5]));
  for (const lx of [-0.4, 0.4]) b.add('#4a3828', box(0.08, 0.44, 0.35, [0.4 + lx, 0.24, -4.5]));
  ctx.addCollider({ x: 0.4, z: -3.6, hx: 0.8, hz: 0.4, rot: 0, top: 0.86 });
  b.add('#f2ead6', box(0.42, 0.01, 0.3, [0.2, 0.87, -3.75], [0, 0.2, 0]), { cast: false });
  b.add('#efe6d0', box(0.42, 0.01, 0.3, [0.75, 0.87, -3.6], [0, -0.3, 0]), { cast: false });
  b.add('#2a2a30', cyl(0.04, 0.05, 0.08, [0.95, 0.9, -3.5], [0, 0, 0], 6));
  b.add('#e8e0c8', cyl(0.035, 0.035, 0.22, [-0.05, 0.97, -3.45], [0, 0, 0], 6));
  b.add('#4a4440', cyl(0.09, 0.09, 0.03, [-0.05, 0.87, -3.45], [0, 0, 0], 8));
  b.flush();
  flames(ctx, [{ pos: [-0.05, 1.08, -3.45], h: 0.16, w: 0.35, light: true }], { light: { color: '#ffb060', intensity: 5, distance: 9 } });
  glow(ctx, { pos: [-0.05, 1.15, -3.45], size: 1.6, color: '#ffc070', opacity: 0.7, pulse: 0.1 });

  // Joseph writes; Hyrum, Sidney Rigdon, Lyman Wight, Caleb Baldwin and Alexander McRae keep the cold vigil.
  const man = (robe, mantle, hair) => ({ robe, mantle, skin: '#e8c4a0', hair });
  saint(ctx, { pos: [0.4, -4.5], y: 0.5, face: [0.4, 2], pose: 'sit', hat: false, colors: man('#2b2a2e', '#3d3a44', '#7a5a3a') });
  saint(ctx, { pos: [-2.0, -3.9], y: 0.1, face: [0.4, -4.2], pose: 'sit', hat: false, colors: man('#34302c', '#4a3b2e', '#5a3a22') });
  saint(ctx, { pos: [-4.4, -1.2], y: 0.1, face: [0, -1.5], pose: 'sit', hat: false, colors: man('#3a3328', '#6a3a34', '#8a8a88') });
  saint(ctx, { pos: [4.3, -4.0], y: 0.1, face: [0, -3.0], pose: 'sit', colors: man('#2e3640', '#4a5a6a', '#3a2418') });
  saint(ctx, { pos: [4.4, -0.8], y: 0.1, face: [0, -1.5], pose: 'kneel', hat: false, colors: man('#45403a', '#7a6a4a', '#2b1a12') });
  saint(ctx, { pos: [3.0, 1.6], y: 0.1, face: [0, -3], pose: 'stand', hat: false, colors: man('#283040', '#3d4a3a', '#5a3a22') });
}

export default {
  title: 'D&C 121-123: Liberty Jail',
  subtitle: 'The dungeon at Liberty, Missouri, winter 1838-39. "O God, where art thou?"',
  seed: 121,

  style: baseStyle({ color: '#0c1018', near: 22, far: 70 }),

  sky: { zenith: '#05070d', mid: '#0c1220', horizon: '#1a2232', ground: '#0a0c10', glowColor: '#2a3448', glowDir: [0, 0.3, -1] },

  sun: {
    dir: [0.3, 0.8, 0.5],
    color: '#a8bce0',
    intensity: 0.35,
    hemi: { sky: '#5a6a88', ground: '#2a2420', intensity: 0.9 },
    shadowSize: 20,
  },

  ground: flatGround({
    sand: '#e8ecf0', dirt: '#dfe4ea', grass: '#e2e8ee', grassDark: '#c8d0d8', plaza: '#e8ecf0',
    plazaLine: '#d0d8e0', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#e8ecf0',
  }),

  objects: [],
  custom,

  player: {
    start: [-1.0, -1.4],
    lookAt: [-2.2, -7],
    colors: { robe: '#2b2a2e', mantle: '#3a3328', skin: '#e8c4a0', hair: '#5a3a22', sash: '#4a3b2e' },
  },
};
