// D&C 135: the upstairs bedroom of Carthage Jail, late afternoon, June 27, 1844.
// Joseph and Hyrum Smith, John Taylor and Willard Richards wait quietly; John Taylor sings "A Poor Wayfaring Man of Grief."
// x is east, z is south. The room is a cutaway: the south wall is cut low so the camera can look in.
import { Batch, baseStyle, box, cyl, flatGround, glow, leafTree, makeRng, saint, shaft, xf } from './lib/dc-08-kit.js';

const X = 5.5, N = -5, S = 3.5, H = 5;
const PLASTER = '#efe2c4';
const FLOOR = '#a87a4e';

function chair(b, x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const p = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  b.add('#6a4a30', box(0.5, 0.06, 0.5, [x, 0.48, z], [0, rot, 0]));
  for (const [lx, lz] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) {
    const [px, pz] = p(lx, lz);
    b.add('#5a3e28', box(0.05, 0.48, 0.05, [px, 0.24, pz]));
  }
  const [bx, bz] = p(0, -0.23);
  b.add('#5a3e28', box(0.5, 0.6, 0.05, [bx, 0.8, bz], [0, rot, 0]));
}

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(1844);

  // Floor, plastered walls and ceiling. The south wall is cut away.
  b.add(FLOOR, box(2 * X, 0.2, S - N, [0, 0, (N + S) / 2]));
  for (let x = -X + 0.45; x < X; x += 0.9) b.add('#8a5e3a', box(0.03, 0.02, S - N, [x, 0.105, (N + S) / 2]), { cast: false });
  const walls = [
    [0, N - 0.3, 2 * X + 1.2, 0.6, H],
    [-X - 0.3, (N + S) / 2, 0.6, S - N, H],
    [X + 0.3, (N + S) / 2, 0.6, S - N, H],
    [0, S + 0.3, 2 * X + 1.2, 0.6, 0.8],
  ];
  for (const [x, z, w, d, h] of walls) {
    b.add(PLASTER, box(w, h, d, [x, h / 2, z]));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: h });
  }
  // Rough stone outer shell and a low hipped roof, so the room reads as the jail.
  const STONE = '#9a8468';
  b.add(STONE, box(2 * X + 2.2, H + 0.4, 0.5, [0, (H + 0.4) / 2, N - 0.85]));
  for (const sx of [-1, 1]) b.add(STONE, box(0.5, H + 0.4, S - N + 1.2, [sx * (X + 0.85), (H + 0.4) / 2, (N + S) / 2 - 0.6]));
  b.add(STONE, box(2 * X + 2.2, 1.0, 0.5, [0, 0.5, S + 0.85]));
  const roof = new THREE.ConeGeometry(1, 1, 4, 1);
  roof.rotateY(Math.PI / 4);
  b.add('#5a4a40', xf(roof, { pos: [0, H + 0.4 + 1.6, (N + S) / 2 - 0.3], scale: [(X + 1.8) * 1.414, 3.2, ((S - N) / 2 + 1.8) * 1.414] }));
  b.add('#8a6040', box(2 * X, 0.9, 0.06, [0, 0.45, N + 0.02]));
  for (const sx of [-1, 1]) b.add('#8a6040', box(0.06, 0.9, S - N, [sx * (X - 0.02), 0.45, (N + S) / 2]));
  b.add('#6a4a30', box(2 * X, 0.1, 0.08, [0, 0.92, N + 0.05]), { cast: false });
  b.add('#f4ead4', box(2 * X + 1.2, 0.3, S - N + 0.6, [0, H + 0.15, (N + S) / 2 - 0.3]), { cast: false });
  b.add('#d8c8a4', box(2 * X, 0.2, 0.2, [0, H - 0.1, N + 0.1]), { cast: false });

  // Windows on the west wall pour in the late sun; one more on the north wall.
  const win = (x, z, rotY) => {
    const g = (w, h, d, y, off = 0) => box(w, h, d, [0, 0, 0]).applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, off)).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).translate(x, y, z);
    b.add('#fbf6ea', g(1.5, 2.3, 0.12, 2.3));
    b.add('#ffe6b0', g(1.2, 2.0, 0.08, 2.3, 0.03), { glow: true });
    b.add('#6a4a30', g(0.05, 2.0, 0.1, 2.3, 0.06), { cast: false });
    for (const y of [1.8, 2.8]) b.add('#6a4a30', g(1.2, 0.05, 0.1, y, 0.06), { cast: false });
    b.add('#fbf6ea', g(1.7, 0.1, 0.3, 1.25, 0.1));
  };
  win(-X + 0.02, -2.6, Math.PI / 2);
  win(-X + 0.02, 1.2, Math.PI / 2);
  win(2.4, N + 0.02, 0);
  for (const z of [-2.6, 1.2]) {
    shaft(ctx, { from: [-X + 0.2, 2.6, z], to: [-1.0, 0.12, z + 0.6], radius: [0.55, 1.1], color: '#ffd890', opacity: 0.12 });
    glow(ctx, { pos: [-X + 0.3, 2.3, z], size: 3, color: '#ffd890', opacity: 0.35, pulse: 0 });
  }

  // The door on the north wall, closed.
  b.add('#5a3e28', box(1.1, 2.3, 0.12, [-2.2, 1.15, N + 0.05]));
  b.add('#3a2818', box(1.3, 0.12, 0.16, [-2.2, 2.35, N + 0.06]));
  b.add('#c8a040', xf(new THREE.SphereGeometry(0.05, 8, 6), { pos: [-1.75, 1.1, N + 0.15] }));

  // Rope bed with a quilt against the east wall.
  const bx = X - 1.1, bz = -2.6;
  b.add('#6a4a30', box(1.5, 0.35, 2.1, [bx, 0.55, bz]));
  b.add('#efe6d2', box(1.4, 0.18, 2.0, [bx, 0.8, bz]));
  b.add('#8a3a34', box(1.46, 0.08, 1.4, [bx, 0.9, bz + 0.3]));
  b.add('#c8a860', box(1.46, 0.085, 0.2, [bx, 0.91, bz + 0.1]));
  b.add('#f4f0e6', box(1.0, 0.14, 0.4, [bx, 0.95, bz - 0.75]));
  for (const [lx, lz] of [[-0.7, -1], [0.7, -1], [-0.7, 1], [0.7, 1]]) b.add('#5a3e28', cyl(0.05, 0.05, lz < 0 ? 1.8 : 1.1, [bx + lx, lz < 0 ? 0.9 : 0.55, bz + lz], [0, 0, 0], 8));
  ctx.addCollider({ x: bx, z: bz, hx: 0.8, hz: 1.1, rot: 0, top: 1.0 });

  // Table with books, a candlestick and a hat; chairs around it.
  const tx = 0.6, tz = -1.0;
  b.add('#7a5636', box(1.6, 0.07, 1.0, [tx, 0.78, tz]));
  for (const [lx, lz] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) b.add('#5a3e28', box(0.07, 0.76, 0.07, [tx + lx, 0.4, tz + lz]));
  ctx.addCollider({ x: tx, z: tz, hx: 0.8, hz: 0.5, rot: 0, top: 0.82 });
  b.add('#3a2a22', box(0.3, 0.08, 0.42, [tx - 0.4, 0.86, tz - 0.1], [0, 0.3, 0]));
  b.add('#5a2a24', box(0.28, 0.06, 0.38, [tx - 0.38, 0.93, tz - 0.08], [0, 0.1, 0]));
  b.add('#c8a040', cyl(0.07, 0.09, 0.06, [tx + 0.5, 0.85, tz - 0.2], [0, 0, 0], 8));
  b.add('#f4ecd8', cyl(0.03, 0.03, 0.25, [tx + 0.5, 1.0, tz - 0.2], [0, 0, 0], 6));
  b.add('#1e1a18', cyl(0.2, 0.2, 0.02, [tx + 0.25, 0.83, tz + 0.25], [0, 0, 0], 12));
  b.add('#1e1a18', cyl(0.11, 0.12, 0.24, [tx + 0.25, 0.95, tz + 0.25], [0, 0, 0], 12));
  chair(b, tx - 1.2, tz + 0.1, Math.PI / 2 + 0.2);
  chair(b, tx + 1.25, tz + 0.2, -Math.PI / 2 - 0.3);
  chair(b, tx + 0.2, tz + 1.15, Math.PI + 0.25);

  // Cold fireplace on the north wall.
  b.add('#c8b89a', box(1.8, 1.4, 0.4, [1.2, 0.7, N + 0.2]));
  b.add('#2b2420', box(1.0, 0.9, 0.42, [1.2, 0.45, N + 0.2]));
  b.add('#7a5636', box(2.1, 0.1, 0.5, [1.2, 1.45, N + 0.25]));
  ctx.addCollider({ x: 1.2, z: N + 0.2, hx: 0.9, hz: 0.25, rot: 0, top: 1.5 });
  b.flush();

  // Summer evening outside: grass and a few trees around the jail.
  for (let i = 0; i < 20; i++) {
    const a = rng() * Math.PI * 2, r = 22 + rng() * 40;
    leafTree(b, ctx, { pos: [Math.sin(a) * r, Math.cos(a) * r], height: 7 + rng() * 5 });
  }
  b.flush();

  const man = (robe, mantle, hair, sash = '#efe6d2') => ({ robe, mantle, skin: '#e8c4a0', hair, sash });
  saint(ctx, { pos: [-X + 1.1, -0.6], face: [-X - 2, -1.4], hat: false, colors: man('#2b2a2e', '#2b2a2e', '#a07850'), scale: 1.05 });
  saint(ctx, { pos: [tx - 1.2, tz + 0.1], y: 0.5, face: [tx + 1, tz], pose: 'sit', hat: false, colors: man('#34302c', '#34302c', '#5a3a22') });
  saint(ctx, { pos: [tx + 0.2, tz + 1.15], y: 0.5, face: [tx, tz - 1], pose: 'sit', hat: false, colors: man('#2e3640', '#2e3640', '#4a3020') });
  saint(ctx, { pos: [tx + 1.9, tz - 1.4], face: [tx, tz + 0.3], hat: false, colors: man('#3a3328', '#3a3328', '#3a2418'), scale: 1.1 });
}

export default {
  title: 'D&C 135: Carthage Jail',
  subtitle: 'The upstairs bedroom, late afternoon, June 27, 1844',
  seed: 135,

  style: baseStyle({ color: '#f0d8b0', near: 40, far: 220 }),

  sky: { zenith: '#5a86b0', mid: '#a8bcc8', horizon: '#f6d6a0', ground: '#a89a68', glowColor: '#ffe0a0', glowDir: [0.6, 0.3, 1] },

  sun: {
    dir: [-0.75, 0.55, 0.25],
    color: '#ffe2b0',
    intensity: 1.4,
    hemi: { sky: '#f6e2c0', ground: '#a87a4e', intensity: 1.15 },
    shadowSize: 30,
  },

  ground: flatGround({
    sand: '#8fa458', dirt: '#86a052', grass: '#7f9a4e', grassDark: '#647e3c', plaza: '#c8aa78',
    plazaLine: '#b09060', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a5a',
  }),

  objects: [],
  custom,

  player: {
    start: [2.6, 2.0],
    lookAt: [-0.6, -2.2],
    colors: { robe: '#45403a', mantle: '#45403a', skin: '#e8c4a0', hair: '#5a3a22', sash: '#efe6d2' },
  },
};
