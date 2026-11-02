// D&C 110: the Lord appears in the Kirtland Temple, April 3, 1836. Moses, Elias and Elijah follow.
// x is east, z is south. The Melchizedek pulpits rise against the north wall; the player stands in the center aisle.
import { Batch, MEN, baseStyle, box, collide, cyl, flatGround, glow, heavenly, saint, shaft, xf } from './lib/dc-08-kit.js';

const W = 9, N = -15, S = 13, H = 8;
const PLASTER = '#f4efe2';
const WOOD = '#c9a878';
const TRIM = '#fbf8ef';
const GOLD = '#f0c84a';

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);

  // Shell: floor, plaster walls with a wainscot, and a ceiling that lets the sun through so the room reads bright.
  b.add(WOOD, box(2 * W, 0.2, S - N, [0, 0.0, (N + S) / 2]));
  for (let x = -W + 0.6; x < W; x += 1.2) b.add('#b8966a', box(0.04, 0.02, S - N, [x, 0.105, (N + S) / 2]), { cast: false });
  const walls = [
    [0, N - 0.25, 2 * W + 1, 0.5],
    [0, S + 0.25, 2 * W + 1, 0.5],
    [-W - 0.25, (N + S) / 2, 0.5, S - N],
    [W + 0.25, (N + S) / 2, 0.5, S - N],
  ];
  for (const [x, z, w, d] of walls) {
    b.add(PLASTER, box(w, H, d, [x, H / 2, z]));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: H });
  }
  b.add('#e3d6ba', box(2 * W - 0.1, 1.1, 0.1, [0, 0.55, S - 0.02]));
  for (const sx of [-1, 1]) b.add('#e3d6ba', box(0.1, 1.1, S - N, [sx * (W - 0.02), 0.55, (N + S) / 2]));
  b.add('#f6f1e6', box(2 * W + 1, 0.4, S - N + 1, [0, H + 0.2, (N + S) / 2]), { cast: false });
  b.add(TRIM, box(2 * W, 0.35, 0.3, [0, H - 0.18, N + 0.15]), { cast: false });
  b.add(TRIM, box(2 * W, 0.35, 0.3, [0, H - 0.18, S - 0.15]), { cast: false });
  for (const sx of [-1, 1]) b.add(TRIM, box(0.3, 0.35, S - N, [sx * (W - 0.15), H - 0.18, (N + S) / 2]), { cast: false });

  // Tall arched windows down both side walls and in the south wall.
  const arch = (x, z, rotY) => {
    b.add(TRIM, box(1.9, 4.2, 0.12, [0, 0, 0]).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).translate(x, 3.6, z));
    b.add(TRIM, xf(new THREE.CircleGeometry(0.95, 18, 0, Math.PI), { pos: [x, 5.7, z], rot: [0, rotY, 0] }));
    const glass = '#dcecf2';
    b.add(glass, box(1.5, 3.9, 0.06, [0, 0, 0]).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).translate(x, 3.55, z), { glow: true });
    b.add(glass, xf(new THREE.CircleGeometry(0.75, 18, 0, Math.PI), { pos: [x, 5.5, z], rot: [0, rotY, 0] }).translate(Math.sin(rotY) * 0.04, 0, Math.cos(rotY) * 0.04), { glow: true });
    for (const k of [-0.25, 0.25]) b.add('#8a7a66', box(0.05, 4.4, 0.08, [0, 0, 0]).applyMatrix4(new THREE.Matrix4().makeTranslation(k * 1.5, 0, 0)).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).translate(x, 3.75, z), { cast: false });
    for (const h of [2.3, 3.6, 4.9]) b.add('#8a7a66', box(1.5, 0.05, 0.08, [0, 0, 0]).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).translate(x, h, z), { cast: false });
  };
  for (const z of [-11, -5.5, 0, 5.5, 10]) {
    arch(-W + 0.02, z, Math.PI / 2);
    arch(W - 0.02, z, -Math.PI / 2);
  }
  for (const x of [-5, 5]) arch(x, S - 0.02, Math.PI);

  // Two rows of white columns carry the ceiling.
  for (const x of [-4.4, 4.4]) {
    for (let z = -12; z <= 11; z += 4.6) {
      b.add(TRIM, cyl(0.26, 0.3, H, [x, H / 2, z], [0, 0, 0], 14));
      b.add('#e8dfcc', box(0.8, 0.35, 0.8, [x, 0.17, z]));
      b.add('#e8dfcc', box(0.8, 0.3, 0.8, [x, H - 0.5, z]));
      ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: H });
    }
  }

  // Box pews with a center aisle and side aisles.
  const pewBlock = (x0, x1, z) => {
    const w = x1 - x0, cx = (x0 + x1) / 2;
    b.add('#f2ecdc', box(w, 1.05, 0.08, [cx, 0.52, z + 0.5]));
    b.add('#e0d6c0', box(w, 0.08, 0.45, [cx, 0.45, z + 0.22]));
    b.add('#b08a5a', box(w + 0.04, 0.06, 0.12, [cx, 1.07, z + 0.5]));
    for (const ex of [x0, x1]) b.add('#f2ecdc', box(0.08, 1.05, 1.05, [ex, 0.52, z]));
    ctx.addCollider({ x: cx, z, hx: w / 2, hz: 0.55, rot: 0, top: 1.05 });
  };
  for (let z = -2.4; z <= 11.5; z += 1.35) {
    pewBlock(-3.9, -0.95, z);
    pewBlock(0.95, 3.9, z);
    pewBlock(-8.9, -5.0, z);
    pewBlock(5.0, 8.9, z);
  }

  // Four tiers of Melchizedek pulpits against the north wall.
  const tiers = [
    { z: -7.2, y: 0.5 },
    { z: -8.8, y: 1.0 },
    { z: -10.4, y: 1.5 },
    { z: -12.0, y: 2.0 },
  ];
  for (const t of tiers) {
    const d = t.z - N;
    b.add('#efe8d6', box(7.4, t.y, d, [0, t.y / 2, N + d / 2]));
    b.add('#c9a878', box(7.4, 0.06, 0.2, [0, t.y + 0.02, t.z - 0.1]), { cast: false });
    ctx.addCollider({ x: 0, z: N + d / 2, hx: 3.7, hz: d / 2, rot: 0, top: t.y, walkable: true });
    for (const k of [-1, 0, 1]) {
      const x = k * 2.0;
      b.add(TRIM, xf(new THREE.CylinderGeometry(0.85, 0.85, 1.0, 16, 1, false, -Math.PI / 2, Math.PI), { pos: [x, t.y + 0.5, t.z - 0.55] }));
      b.add('#b08a5a', xf(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16, 1, false, -Math.PI / 2, Math.PI), { pos: [x, t.y + 1.04, t.z - 0.55] }));
      b.add('#e8dcc4', box(1.7, 1.0, 0.1, [x, t.y + 0.5, t.z - 0.55]));
      collide(ctx, x, t.z - 0.3, 0, 0, 0, 0.85, 0.3, t.y + 1.0);
    }
  }
  const topY = tiers[3].y;
  b.add('#8a5e3a', box(2 * W, H, 0.12, [0, H / 2, N + 0.06]));
  b.add('#a87a50', box(8.4, H - 1, 0.2, [0, (H - 1) / 2, N + 0.1]));

  // The veils, rolled up to the ceiling, and two side curtains half lowered.
  for (const z of [-5.4, 4.2]) b.add('#ebe2cc', cyl(0.28, 0.28, 2 * W - 0.4, [0, H - 0.5, z], [0, 0, Math.PI / 2], 12), { cast: false });
  for (const x of [-4.4, 4.4]) b.add('#e6dcc4', box(0.06, 4.2, 9, [x + Math.sign(x) * 0.4, H - 2.4, -9.5]), { cast: false });

  b.flush();

  // The Lord stands on the breastwork of the pulpit, a paved work of pure gold beneath his feet.
  const LORD = [0, -12.15];
  const lordY = topY + 1.06;
  const gold = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.3), ctx.kit.toon(GOLD, { emissive: new THREE.Color('#a8781a') }));
  gold.position.set(LORD[0], lordY, LORD[1]);
  ctx.scene.add(gold);
  glow(ctx, { pos: [LORD[0], lordY + 0.1, LORD[1]], size: 4, color: '#ffd76a', opacity: 0.5 });
  heavenly(ctx, { pos: LORD, y: lordY + 0.05, face: [0, 10], scale: 1.35, glowAmt: 0.75, halo: 7, light: { color: '#fff0c4', intensity: 26, distance: 24 }, arms: [0.45, 0.45] });
  glow(ctx, { pos: [LORD[0], lordY + 1.4, LORD[1]], size: 12, color: '#fff6dc', opacity: 0.3, pulse: 0.03 });
  shaft(ctx, { from: [0, H, -12.2], to: [0, lordY, -12.2], radius: [0.8, 2.2], color: '#fff2c9', opacity: 0.22 });

  // Moses, Elias and Elijah.
  for (const pos of [[-3.1, -10.4], [3.1, -10.4], [3.3, -7.9]]) {
    heavenly(ctx, { pos, face: [0, 6], scale: 1.08, glowAmt: 0.45, halo: 4.5, light: { color: '#fff0d0', intensity: 6, distance: 9 }, arms: [0.3, 0.2] });
  }

  // Joseph Smith and Oliver Cowdery kneel in prayer before the pulpits.
  saint(ctx, { pos: [-0.8, -6.2], face: LORD, pose: 'kneel', hat: false, colors: { robe: '#2b2a2e', mantle: '#2b2a2e', skin: '#e8c4a0', hair: '#7a5a3a', sash: '#e8e2d2' } });
  saint(ctx, { pos: [0.8, -6.2], face: LORD, pose: 'kneel', hat: false, colors: { robe: '#2e3640', mantle: '#2e3640', skin: '#e8c4a0', hair: '#3a2418', sash: '#e8e2d2' } });
}

export default {
  title: 'D&C 110: The Savior appears in the Kirtland Temple',
  subtitle: 'Kirtland, Ohio, April 3, 1836. Moses, Elias, and Elijah follow',
  seed: 110,

  style: baseStyle({ color: '#f3ead8', near: 60, far: 300 }),

  sky: { zenith: '#6f9ec4', mid: '#a9c8dc', horizon: '#f2ead6', ground: '#d8ccb0', glowColor: '#fff4d8', glowDir: [0, 0.5, -1] },

  sun: {
    dir: [-0.45, 0.8, 0.4],
    color: '#fff6e8',
    intensity: 1.1,
    hemi: { sky: '#f6ead2', ground: '#b89a70', intensity: 1.25 },
    shadowSize: 40,
  },

  ground: flatGround({
    sand: '#a8b878', dirt: '#98a868', grass: '#8a9a5a', grassDark: '#6c7a42', plaza: '#c9b48c',
    plazaLine: '#b09a72', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a',
  }),

  objects: [],
  custom,

  player: {
    start: [0, 0.6],
    lookAt: [0, -12],
    colors: { robe: '#34302c', mantle: '#2e3640', skin: '#e8c4a0', hair: '#5a3a22', sash: '#e8e2d2' },
  },
};
