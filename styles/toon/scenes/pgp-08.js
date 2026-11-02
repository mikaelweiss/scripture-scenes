// Joseph Smith-History 1:29-49. The attic bedroom of the Smith log home near Palmyra, night of September 21, 1823.
// x is east, z is south. The attic runs north-south with the ridge over x = 0. Floor height FY.
import * as THREE from 'three';
import { ball, baseStyle, box, cyl, glow, groundSpec, heavenly, keepCameraInside, mesh, moon, planks, settler, solid, stars } from './lib/pgp-07-kit.js';

const FY = 4.2;
const HALF = 4;
const KNEE = 1.3;
const RIDGE = 4.6;
const N = -6;
const S = 7;
const MORONI = [0.7, -3.3];
const START = [-0.3, 2.0];

const slope = (RIDGE - KNEE) / HALF;
const ceilingAt = (x) => FY + KNEE + (HALF - Math.abs(x)) * slope;

function gable(ctx, z, windowCenter) {
  const shape = new THREE.Shape();
  shape.moveTo(-HALF - 0.2, -0.1);
  shape.lineTo(HALF + 0.2, -0.1);
  shape.lineTo(HALF + 0.2, KNEE);
  shape.lineTo(0, RIDGE + 0.2);
  shape.lineTo(-HALF - 0.2, KNEE);
  const hole = new THREE.Path();
  const [wx, wy] = windowCenter;
  hole.moveTo(wx - 0.55, wy - 0.6);
  hole.lineTo(wx + 0.55, wy - 0.6);
  hole.lineTo(wx + 0.55, wy + 0.6);
  hole.lineTo(wx - 0.55, wy + 0.6);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });
  g.translate(0, FY, z - 0.11);
  mesh(ctx, g, '#a87e56');
  const frame = [
    box(1.3, 0.1, 0.3, wx, FY + wy - 0.62, z), box(1.3, 0.1, 0.3, wx, FY + wy + 0.62, z),
    box(0.1, 1.3, 0.3, wx - 0.6, FY + wy, z), box(0.1, 1.3, 0.3, wx + 0.6, FY + wy, z),
    box(0.05, 1.2, 0.06, wx, FY + wy, z), box(1.2, 0.05, 0.06, wx, FY + wy, z),
  ];
  mesh(ctx, frame, '#e8dcc0');
  mesh(ctx, box(1.1, 0.06, 0.4, wx, FY + wy - 0.66, z + (z < 0 ? 0.2 : -0.2)), '#e8dcc0');
}

function bed(ctx, x, z, { quilt, quiltB }) {
  const y = FY;
  const posts = [];
  for (const dx of [-0.85, 0.85]) for (const dz of [-1.0, 1.0]) posts.push(cyl(0.06, 0.06, dz < 0 ? 1.05 : 0.7, dx, (dz < 0 ? 1.05 : 0.7) / 2, dz, { seg: 6 }));
  posts.push(box(1.7, 0.5, 0.06, 0, 0.75, -1.0), box(1.7, 0.18, 0.06, 0, 0.45, 1.0), box(0.05, 0.14, 2, -0.85, 0.32, 0), box(0.05, 0.14, 2, 0.85, 0.32, 0));
  mesh(ctx, posts, '#6e4a2c', { at: [x, y, z, 0] });
  mesh(ctx, box(1.62, 0.22, 1.95, 0, 0.42, 0), '#e8e0c8', { at: [x, y, z, 0] });
  mesh(ctx, box(0.9, 0.14, 0.35, 0, 0.58, -0.75), '#f4efe2', { at: [x, y, z, 0] });
  const patches = [[], []];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) patches[(i + j) % 2].push(box(0.42, 0.06, 0.37, -0.63 + i * 0.42, 0.55, -0.15 + j * 0.37));
  mesh(ctx, patches[0], quilt, { at: [x, y, z, 0] });
  mesh(ctx, patches[1], quiltB, { at: [x, y, z, 0] });
  solid(ctx, x, z, 0.9, 1.05, y + 1.1);
}

export default {
  title: 'Joseph Smith-History 1:29-49: Moroni visits Joseph',
  subtitle: 'The attic bedroom near Palmyra, the night of September 21, 1823',
  seed: 1823,

  style: baseStyle({ fog: { color: '#1a2440', near: 40, far: 420 } }),

  sky: {
    zenith: '#0b1330',
    mid: '#17254a',
    horizon: '#33456e',
    ground: '#121a28',
    glowColor: '#5a6a9a',
    glowDir: [-0.3, 0.45, -1],
  },

  sun: {
    dir: [-0.3, 0.6, -0.8],
    color: '#9fb0e0',
    intensity: 0.5,
    hemi: { sky: '#6a7aa8', ground: '#5a4a3a', intensity: 0.75 },
    shadowSize: 40,
  },

  ground: groundSpec({
    sand: '#3e4a3a',
    dirt: '#3a3a30',
    grass: '#3f5040',
    grassDark: '#2f4034',
    hill: '#334434',
  }, { undulation: 0, flatRadius: 60, hillHeight: 30 }),

  objects: [
    { type: 'trees', count: 160, ring: [26, 220], height: [9, 15], broken: 0, fallen: 0, trunkColor: '#2e2a2a', leafColors: ['#2f4a40', '#3a5446', '#26403a'] },
  ],

  custom(ctx) {
    stars(ctx, { count: 1100, minY: 0.03 });
    moon(ctx, [-0.35, 0.35, -1], { size: 55 });

    // Log house below the attic and its outer roof.
    const logs = [], logsB = [];
    for (let i = 0; i < 12; i++) {
      const y = 0.18 + i * 0.35;
      const list = i % 2 ? logsB : logs;
      list.push(cyl(0.2, 0.2, 2 * HALF + 1.2, 0, y, N - 0.2, { rz: Math.PI / 2 }), cyl(0.2, 0.2, 2 * HALF + 1.2, 0, y, S + 0.2, { rz: Math.PI / 2 }));
      list.push(cyl(0.2, 0.2, S - N + 1.2, -HALF - 0.2, y, (N + S) / 2, { rx: Math.PI / 2 }), cyl(0.2, 0.2, S - N + 1.2, HALF + 0.2, y, (N + S) / 2, { rx: Math.PI / 2 }));
    }
    mesh(ctx, logs, '#6e5034');
    mesh(ctx, logsB, '#7a5a3c');
    solid(ctx, 0, (N + S) / 2, HALF + 0.4, (S - N) / 2 + 0.4, FY, 0, { walkable: true, exclude: true });

    planks(ctx, { x0: -HALF, x1: HALF, z0: N, z1: S, y: FY - 0.02, colors: ['#a0703f', '#8e6236', '#ab7c4a'] });

    // Knee walls, roof boards and rafters.
    const rafterAng = Math.atan2(RIDGE - KNEE, HALF);
    const len = Math.hypot(HALF, RIDGE - KNEE) + 0.5;
    const roof = [], rafters = [];
    for (const side of [-1, 1]) {
      const cx = side * HALF / 2, cy = FY + (KNEE + RIDGE) / 2;
      const nx = side * Math.sin(rafterAng), ny = Math.cos(rafterAng);
      roof.push(box(len, 0.16, S - N + 1.0, cx + nx * 0.1, cy + ny * 0.1, (N + S) / 2, { rz: -side * rafterAng }));
      for (let z = N + 0.6; z < S; z += 1.15) rafters.push(box(len - 0.3, 0.2, 0.12, cx - nx * 0.08, cy - ny * 0.08, z, { rz: -side * rafterAng }));
      rafters.push(box(0.16, 0.16, S - N, side * (HALF - 0.08), FY + KNEE + 0.05, (N + S) / 2));
    }
    mesh(ctx, roof, '#8a6a4a', { side: THREE.DoubleSide });
    mesh(ctx, rafters, '#5e4028');
    mesh(ctx, box(0.2, 0.22, S - N, 0, FY + RIDGE - 0.15, (N + S) / 2), '#5e4028');
    const knee = [box(0.18, KNEE, S - N, -HALF, FY + KNEE / 2, (N + S) / 2), box(0.18, KNEE, S - N, HALF, FY + KNEE / 2, (N + S) / 2)];
    mesh(ctx, knee, '#b08a60');
    for (const side of [-1, 1]) solid(ctx, side * (HALF - 0.4), (N + S) / 2, 0.55, (S - N) / 2, FY + 6, 0, { exclude: false });
    gable(ctx, N, [0, 2.2]);
    gable(ctx, S, [1.6, 1.9]);
    solid(ctx, 0, N - 0.1, HALF, 0.3, FY + 6, 0, { exclude: false });
    solid(ctx, 0, S + 0.1, HALF, 0.3, FY + 6, 0, { exclude: false });

    // Chimney rising along the south gable.
    mesh(ctx, box(1.1, RIDGE + 1.5, 0.8, -2.2, FY + (RIDGE + 1.5) / 2 - 0.3, S - 0.45), '#9a5a42');
    solid(ctx, -2.2, S - 0.45, 0.6, 0.45, FY + 6, 0, { exclude: false });

    // Joseph's bed on the east side, his brothers asleep on the west.
    bed(ctx, 2.7, -3.4, { quilt: '#b5523b', quiltB: '#e6d6a8' });
    bed(ctx, -2.7, -3.0, { quilt: '#3e6e86', quiltB: '#d9c7a3' });
    const sleepers = [ball(0.13, -3.0, FY + 0.72, -3.75, { seg: 10 }), ball(0.13, -2.45, FY + 0.72, -3.8, { seg: 10 })];
    mesh(ctx, sleepers, '#d9a77c');
    mesh(ctx, [ball(0.14, -3.0, FY + 0.76, -3.82, { sy: 0.7 }), ball(0.14, -2.45, FY + 0.76, -3.87, { sy: 0.7 })], '#4a3020');
    mesh(ctx, [ball(0.5, -2.95, FY + 0.6, -2.8, { sx: 0.6, sy: 0.35, sz: 1.6 }), ball(0.5, -2.4, FY + 0.6, -2.85, { sx: 0.6, sy: 0.35, sz: 1.5 })], '#3e6e86');

    // Joseph, seventeen, sitting up in bed toward the messenger.
    settler(ctx, 2.75, -3.9, { y: FY + 0.4, coat: '#d8ccb0', trousers: '#d8ccb0', hair: '#7a4a28', kneel: true, face: [MORONI[0], MORONI[1] + 0.3], arms: [0.25, 0.5], clear: 0 });
    mesh(ctx, ball(0.6, 2.75, FY + 0.6, -2.9, { sx: 0.75, sy: 0.3, sz: 1.5 }), '#b5523b');

    // Moroni stands in the air at the bedside.
    heavenly(ctx, MORONI[0], FY + 0.45, MORONI[1], { face: [2.75, -3.9], arms: [0.35, 0.2], halo: 4.5, light: 26, lightDistance: 16, lightColor: '#fff2d6', scale: 1.08 });
    glow(ctx, MORONI[0], FY + 1.6, MORONI[1], 11, '#fff3d6', 0.35, 0.02);
    ctx.exclude({ kind: 'circle', x: MORONI[0], z: MORONI[1], r: 0.8 });
    ctx.addCollider({ x: MORONI[0], z: MORONI[1], hx: 0.4, hz: 0.4, rot: 0, top: FY + 2.5 });

    // Chest, chair, clothes on pegs, rag rug and the stair hatch.
    mesh(ctx, [box(1.2, 0.6, 0.6, 0, 0.3, 0), box(1.24, 0.08, 0.64, 0, 0.62, 0)], '#6e4a2c', { at: [-3.2, FY, 2.4, Math.PI / 2] });
    mesh(ctx, box(0.12, 0.1, 0.05, 0, 0.45, 0.32), '#c8a24a', { at: [-3.2, FY, 2.4, Math.PI / 2] });
    solid(ctx, -3.2, 2.4, 0.35, 0.65, FY + 0.7, 0, { exclude: false });
    const chair = [box(0.45, 0.05, 0.45, 0, 0.45, 0), box(0.45, 0.5, 0.05, 0, 0.72, -0.2)];
    for (const dx of [-0.19, 0.19]) for (const dz of [-0.19, 0.19]) chair.push(box(0.05, 0.45, 0.05, dx, 0.22, dz));
    mesh(ctx, chair, '#7a5636', { at: [3.0, FY, -0.7, -2.4] });
    mesh(ctx, box(0.5, 0.35, 0.3, 0, 0.62, 0), '#3b3f4a', { at: [3.0, FY, -0.7, -2.4] });
    mesh(ctx, [box(0.06, 0.06, 2.4, 0, 0, 0)], '#5e4028', { at: [3.85, FY + 1.05, 2.5, 0] });
    mesh(ctx, [box(0.08, 0.9, 0.5, 3.75, FY + 0.65, 2.0), box(0.08, 0.8, 0.45, 3.75, FY + 0.7, 2.9)], '#2f3440');
    mesh(ctx, ball(0.18, 3.78, FY + 1.1, 1.6, { sx: 1.2, sy: 0.6, sz: 1.2 }), '#2b2420');
    mesh(ctx, cyl(1.1, 1.1, 0.03, 0, FY + 0.02, -1.0, { seg: 24 }), '#a8604a', { cast: false });
    mesh(ctx, cyl(0.75, 0.75, 0.03, 0, FY + 0.035, -1.0, { seg: 24 }), '#d9b46a', { cast: false });
    mesh(ctx, cyl(0.35, 0.35, 0.03, 0, FY + 0.05, -1.0, { seg: 24 }), '#5a7a8a', { cast: false });
    mesh(ctx, box(1.1, 0.04, 1.6, 2.4, FY + 0.005, 5.6), '#1a120c', { cast: false });
    mesh(ctx, [box(0.06, 0.9, 0.06, 1.8, FY + 0.45, 4.8), box(0.06, 0.9, 0.06, 1.8, FY + 0.45, 6.4), box(0.06, 0.06, 1.7, 1.8, FY + 0.9, 5.6)], '#6e4a2c');
    solid(ctx, 2.4, 5.6, 0.7, 0.9, FY + 1, 0, { exclude: false });

    // Moonlight falls through the north window.
    glow(ctx, 0, FY + 2.2, N + 0.2, 2.2, '#9fb4ff', 0.35, 0);

    keepCameraInside(ctx, { minX: -HALF + 0.4, maxX: HALF - 0.4, minZ: N + 0.4, maxZ: S - 0.5, ceiling: (x) => ceilingAt(x) - 0.3 });
  },

  player: {
    start: START,
    lookAt: [-1.2, -4.2],
    fov: 68,
    colors: { robe: '#3b3226', mantle: '#2f3440', skin: '#d9a77c', hair: '#4a3020', sash: '#2b1a12' },
  },
};
