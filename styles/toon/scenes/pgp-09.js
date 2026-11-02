// Joseph Smith-History 1:50-59. The west side of the Hill Cumorah near Manchester, New York, September 22, 1823.
// x is east, z is south. The hill runs north-south with its crest at x = HX.
import * as THREE from 'three';
import { baseStyle, box, ball, cyl, glow, groundSpec, heavenly, makeRng, mesh, pick, scatter, settler, solid, trees } from './lib/pgp-07-kit.js';

const HX = 20;
const H = 18;
const SX = 40;
const SZ = 110;
const BOX = [-2, 0];
const START = [-5.8, 4.4];
const WEST = -62;
const EDGE_Z = 36;
const EAST = 95;

const hill = (x, z) => H * Math.exp(-(((x - HX) / SX) ** 2) - (z / SZ) ** 2);
const slopeX = (x) => Math.abs((H * 2 * (x - HX)) / SX ** 2) * Math.exp(-(((x - HX) / SX) ** 2));

function buildHill(ctx) {
  const step = 2;
  const x0 = -110, x1 = 150, z0 = -300, z1 = 300;
  const nx = Math.round((x1 - x0) / step), nz = Math.round((z1 - z0) / step);
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const rng = makeRng(23);
  const pal = ['#8fa85a', '#9cb064', '#82a052', '#a3ad62', '#93a85c'].map((c) => new THREE.Color(c));
  const bare = new THREE.Color('#a88a5a');
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = hill(x, z);
    pos.setY(i, ctx.terrainHeight(x, z) + h - 0.12 * (1 - THREE.MathUtils.smoothstep(h, 0, 1)));
    c.copy(pick(rng, pal));
    const d = Math.hypot(x - BOX[0], z - BOX[1]);
    if (d < 3.2) c.lerp(bare, 1 - d / 3.2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: ctx.kit.gradient });
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  ctx.scene.add(m);

  // Walkable cells sized so neighbors never differ by more than a step.
  for (let x = WEST; x < EAST;) {
    const w = THREE.MathUtils.clamp(0.42 / Math.max(slopeX(x), slopeX(x + 1)), 1, 4);
    const cx = x + w / 2;
    for (let z = -EDGE_Z; z < EDGE_Z; z += 2.5) {
      const cz = z + 1.25;
      ctx.addCollider({ x: cx, z: cz, hx: w / 2 + 0.02, hz: 1.27, rot: 0, top: ctx.terrainHeight(cx, cz) + hill(cx, cz), walkable: true });
    }
    x += w;
  }
  for (const zz of [-EDGE_Z - 0.3, EDGE_Z + 0.3]) ctx.addCollider({ x: (WEST + EAST) / 2, z: zz, hx: (EAST - WEST) / 2, hz: 0.3, rot: 0, top: 200 });
  ctx.addCollider({ x: EAST + 0.3, z: 0, hx: 0.3, hz: EDGE_Z, rot: 0, top: 200 });
  ctx.addCollider({ x: WEST + 1, z: 0, hx: 0.3, hz: EDGE_Z, rot: 0, top: 200 });
}

export default {
  title: 'Joseph Smith-History 1:50-59: The Hill Cumorah',
  subtitle: 'The west side of the hill, near the top, September 22, 1823',
  seed: 1827,

  style: baseStyle({ fog: { color: '#dfe6d6', near: 120, far: 1100 } }),

  sky: {
    zenith: '#3f86c0',
    mid: '#8fc0dc',
    horizon: '#eef0dc',
    ground: '#9aa86a',
    glowColor: '#fff4d0',
    glowDir: [0.6, 0.4, 0.4],
  },

  sun: {
    dir: [0.55, 0.75, 0.35],
    color: '#fff1d6',
    intensity: 2.5,
    hemi: { sky: '#d8eaf0', ground: '#8a8a52', intensity: 1.15 },
    shadowSize: 60,
  },

  ground: groundSpec({
    sand: '#a8a862',
    dirt: '#9a8452',
    grass: '#8fa85a',
    grassDark: '#6f8a46',
    hill: '#7f9a5a',
  }, { flatRadius: 230, hillHeight: 50, undulation: 0.35 }),

  mountains: { count: 30, distance: [650, 900], height: [40, 90], widthRatio: [2.5, 4], colors: ['#7f9ab0', '#8aa4b8', '#93aabb'] },

  objects: [
    { type: 'trees', count: 260, ring: [120, 420], height: [8, 13], broken: 0, fallen: 0, trunkColor: '#6b5440', leafColors: ['#6f9a50', '#5f8f4a', '#c8a040', '#7fa858', '#b8783a'] },
  ],

  clouds: {
    layers: [{ count: 30, distance: [350, 800], height: [110, 200], size: [40, 80], color: '#fffaf0', shade: '#8a9ab8' }],
  },

  custom(ctx) {
    buildHill(ctx);
    const gh = (x, z) => ctx.terrainHeight(x, z) + hill(x, z);
    const rng = makeRng(5);
    const leaves = ['#6f9a50', '#5f8f4a', '#7fa858', '#c8a040', '#d08a3a', '#5a8a48'];

    // Woods on the hill's flanks and along the crest, leaving the west face open.
    const near = scatter(rng, 170, {
      center: [HX, 0],
      ring: [12, 140],
      height: [9, 14],
      spacing: 4.5,
      reject: (x, z) => (x < HX - 6 && Math.abs(z) < 26) || Math.hypot(x - START[0], z - START[1]) < 10,
    });
    trees(ctx, near, { yAt: gh, leaves, seed: 6, canopy: 0.36 });
    const fringe = [];
    for (let x = WEST + 4; x < EAST; x += 5.5) for (const s of [-1, 1]) fringe.push([x + rng() * 2, s * (EDGE_Z + 1.5 + rng() * 3), 9 + rng() * 4, 0.35]);
    trees(ctx, fringe, { yAt: gh, leaves, seed: 8, canopy: 0.38 });

    // Zig-zag rail fence at the foot of the hill.
    const rails = [];
    for (let z = -EDGE_Z; z < EDGE_Z; z += 3) {
      const a = [WEST + 0.8, z], b = [WEST + 1.6, z + 3];
      if (Math.round(z / 3) % 2) [a[0], b[0]] = [b[0], a[0]];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ry = Math.atan2(b[0] - a[0], b[1] - a[1]);
      for (let k = 0; k < 4; k++) rails.push(box(0.12, 0.12, len + 0.4, 0, 0.25 + k * 0.3, 0, { ry }).translate((a[0] + b[0]) / 2, gh((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), (a[1] + b[1]) / 2));
    }
    mesh(ctx, rails, '#7a6248');

    // The stone box, its rounded lid levered up, the plates within.
    const by = gh(...BOX);
    const stones = [];
    const wallStone = (lx, lz, w, d) => stones.push(box(w, 0.55, d, lx, 0.0, lz));
    wallStone(0, -0.5, 1.3, 0.2);
    wallStone(0, 0.5, 1.3, 0.2);
    wallStone(-0.55, 0, 0.2, 0.8);
    wallStone(0.55, 0, 0.2, 0.8);
    mesh(ctx, stones, '#8e8a7e', { at: [BOX[0], by, BOX[1], 0] });
    mesh(ctx, box(0.9, 0.05, 0.8, 0, -0.12, 0), '#3a3328', { at: [BOX[0], by, BOX[1], 0], cast: false });
    mesh(ctx, [box(0.08, 0.08, 0.7, -0.22, -0.06, 0), box(0.08, 0.08, 0.7, 0.22, -0.06, 0)], '#6e6a60', { at: [BOX[0], by, BOX[1], 0] });
    const plates = [];
    for (let i = 0; i < 9; i++) plates.push(box(0.3, 0.022, 0.38, 0, 0.0 + i * 0.026, 0));
    mesh(ctx, plates, '#e8b84a', { at: [BOX[0] - 0.15, by, BOX[1] - 0.05, 0.1], emissive: '#5a3a08' });
    mesh(ctx, [box(0.04, 0.24, 0.04, 0.17, 0.11, -0.12), box(0.04, 0.24, 0.04, 0.17, 0.11, 0.12), box(0.04, 0.04, 0.28, 0.17, 0.24, 0)], '#b8862a', { at: [BOX[0] - 0.15, by, BOX[1] - 0.05, 0.1] });
    mesh(ctx, ball(0.26, 0, 0, 0, { sx: 1, sy: 0.35, sz: 1.2, seg: 14 }), '#b88a4a', { at: [BOX[0] + 0.25, by + 0.05, BOX[1] + 0.05, 0], emissive: '#3a2408' });
    mesh(ctx, [ball(0.06, 0.24, 0.12, -0.1, { seg: 8 }), ball(0.06, 0.24, 0.12, 0.1, { seg: 8 })], '#dff4ff', { at: [BOX[0] + 0.1, by, BOX[1] + 0.05, 0], emissive: '#4a6a7a' });
    mesh(ctx, [cyl(0.012, 0.012, 0.2, 0.24, 0.12, 0, { rx: Math.PI / 2 })], '#d8d8d8', { at: [BOX[0] + 0.1, by, BOX[1] + 0.05, 0] });
    glow(ctx, BOX[0] - 0.1, by + 0.25, BOX[1], 2.6, '#ffd870', 0.55, 0.06);

    const lid = mesh(ctx, [cyl(0.85, 0.95, 0.18, 0, 0, 0, { seg: 14 }), ball(0.8, 0, 0.08, 0, { sy: 0.28, seg: 14 })], '#9a958a', { at: [BOX[0], by, BOX[1], 0] });
    lid.scale.set(1, 1, 0.75);
    lid.position.set(BOX[0] + 0.15, by + 0.62, BOX[1] - 0.95);
    lid.rotation.set(-0.95, 0, 0);
    mesh(ctx, cyl(0.06, 0.07, 3.2, 0, 0, 0, { rx: 1.25 }), '#8a6a42', { at: [BOX[0] + 0.5, by + 0.55, BOX[1] - 0.2, 0.15] });
    solid(ctx, BOX[0], BOX[1] - 0.3, 0.8, 1.2, by + 1.2);

    // Joseph, seventeen, kneeling beside the box. His hat lies on the grass.
    settler(ctx, BOX[0] - 0.55, BOX[1] + 1.15, { coat: '#3a3f4c', trousers: '#5a4a38', hair: '#8a5a32', kneel: true, face: [BOX[0], BOX[1]], arms: [0.25, 0.75], y: gh(BOX[0] - 0.55, BOX[1] + 1.15) });
    mesh(ctx, [cyl(0.24, 0.24, 0.03, 0, 0.015, 0, { seg: 14 }), cyl(0.13, 0.14, 0.2, 0, 0.12, 0, { seg: 12 })], '#2b2420', { at: [BOX[0] - 1.6, gh(BOX[0] - 1.6, BOX[1] + 1.3), BOX[1] + 1.3, 0] });

    // Moroni stands just uphill.
    const mx = BOX[0] + 2.1, mz = BOX[1] - 1.6;
    heavenly(ctx, mx, gh(mx, mz) + 0.25, mz, { face: [BOX[0] - 0.5, BOX[1] + 1.2], arms: [0.5, 0.45], halo: 5, light: 6, lightDistance: 10 });
    glow(ctx, mx, gh(mx, mz) + 1.0, mz, 3.5, '#fff6dc', 0.5, 0.02);
    ctx.addCollider({ x: mx, z: mz, hx: 0.35, hz: 0.35, rot: 0, top: gh(mx, mz) + 2.2 });

    // Loose fieldstones on the slope.
    const rocks = [];
    for (let i = 0; i < 60; i++) {
      const x = BOX[0] - 25 + rng() * 50, z = -25 + rng() * 50;
      if (Math.hypot(x - BOX[0], z - BOX[1]) < 3) continue;
      const s = 0.15 + rng() * 0.35;
      rocks.push(ball(s, x, gh(x, z) - s * 0.15, z, { sx: 1.3, sy: 0.6, seg: 6 }));
    }
    mesh(ctx, rocks, '#9a9586');
  },

  player: {
    start: START,
    lookAt: [BOX[0] + 1, BOX[1] - 1],
    colors: { robe: '#3b3226', mantle: '#4a5a6a', skin: '#d9a77c', hair: '#4a3020', sash: '#2b1a12' },
  },
};
