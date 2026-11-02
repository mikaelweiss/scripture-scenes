// D&C 124: Nauvoo the Beautiful, about 1845. Brick and frame houses on the flats inside the Mississippi bend,
// the temple on the bluff to the east. x is east, z is south. The river wraps the west and south sides.
import { Batch, SAINTS, baseStyle, box, cyl, frameHouse, gableGeo, glow, leafTree, logCabin, makeRng, saint, water, xf } from './lib/dc-08-kit.js';

const BLUFF_X = 40, BLUFF_TOP = 54, BLUFF_H = 18;
const FACE = [[40, 0], [43, 6], [50, 14.5], [54, 18]];
const TEMPLE = [84, 22];
const START = [-58, 70];
const RIVER_W = -95, RIVER_S = 92;
const STONE = '#ebe3cf';

function river(ctx) {
  const { THREE } = ctx;
  const s = new THREE.Shape();
  const r = 70;
  s.moveTo(-900, -900);
  s.lineTo(RIVER_W, -900);
  s.lineTo(RIVER_W, RIVER_S - r);
  s.absarc(RIVER_W + r, RIVER_S - r, r, Math.PI, Math.PI / 2, true);
  s.lineTo(900, RIVER_S);
  s.lineTo(900, 900);
  s.lineTo(-900, 900);
  s.closePath();
  water(ctx, { shapes: [s], y: 0.08, color: '#4f86a0', glint: '#e4f2f2', glints: 160 });
  // Sandy bank along the shore.
  const bank = new THREE.Shape();
  bank.moveTo(RIVER_W + 4, -900);
  bank.lineTo(RIVER_W - 1, -900);
  bank.lineTo(RIVER_W - 1, RIVER_S - r);
  bank.absarc(RIVER_W + r, RIVER_S - r, r + 1, Math.PI, Math.PI / 2, true);
  bank.lineTo(900, RIVER_S + 1);
  bank.lineTo(900, RIVER_S - 4);
  bank.lineTo(RIVER_W + r, RIVER_S - 4);
  bank.absarc(RIVER_W + r, RIVER_S - r, r - 4, Math.PI / 2, Math.PI, false);
  bank.closePath();
  const bg = new THREE.ShapeGeometry(bank);
  bg.rotateX(Math.PI / 2);
  bg.translate(0, 0.05, 0);
  ctx.scene.add(new THREE.Mesh(bg, ctx.kit.toon('#d8c494', { side: THREE.DoubleSide })));
  // Keep walkers on land.
  ctx.addCollider({ x: RIVER_W - 300, z: 0, hx: 300, hz: 900, rot: 0, top: 0.8 });
  ctx.addCollider({ x: 0, z: RIVER_S + 300, hx: 900, hz: 300, rot: 0, top: 0.8 });
}

function bluff(ctx, b) {
  const { THREE } = ctx;
  const slab = (points, color) => {
    const s = new THREE.Shape();
    s.moveTo(...points[0]);
    for (const p of points.slice(1)) s.lineTo(...p);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 380, bevelEnabled: false });
    g.translate(0, 0, -300);
    const m = new THREE.Mesh(g, ctx.kit.toon(color));
    m.receiveShadow = m.castShadow = true;
    ctx.scene.add(m);
  };
  slab([...FACE, [BLUFF_TOP, -1], [BLUFF_X, -1]], '#76844c');
  slab([[BLUFF_TOP, BLUFF_H], [420, BLUFF_H], [420, -1], [BLUFF_TOP, -1]], '#8aa058');
  // Walkable face as a run of shallow steps.
  const faceY = (x) => {
    for (let k = 1; k < FACE.length; k++) {
      const [ax, ay] = FACE[k - 1], [bx, by] = FACE[k];
      if (x <= bx) return ay + ((x - ax) / (bx - ax)) * (by - ay);
    }
    return BLUFF_H;
  };
  const n = 48;
  for (let i = 0; i < n; i++) {
    const x0 = BLUFF_X + (i / n) * (BLUFF_TOP - BLUFF_X), x1 = BLUFF_X + ((i + 1) / n) * (BLUFF_TOP - BLUFF_X);
    const xm = (x0 + x1) / 2;
    const y = faceY(xm);
    ctx.addCollider({ x: xm, z: -110, hx: (x1 - x0) / 2, hz: 190, rot: 0, top: y, walkable: true });
  }
  ctx.addCollider({ x: (BLUFF_TOP + 420) / 2, z: -110, hx: (420 - BLUFF_TOP) / 2, hz: 190, rot: 0, top: BLUFF_H, walkable: true });
  // A path climbing the bluff toward the temple.
  for (let k = 1; k < FACE.length; k++) {
    const [ax, ay] = FACE[k - 1], [bx, by] = FACE[k];
    const len = Math.hypot(bx - ax, by - ay);
    b.add('#c8aa78', xf(new THREE.PlaneGeometry(len + 0.4, 5), { pos: [(ax + bx) / 2, (ay + by) / 2 + 0.12, TEMPLE[1]], rot: [-Math.PI / 2, 0, -Math.atan2(by - ay, bx - ax)] }), { cast: false });
  }
  // Pale limestone ledges breaking through the face.
  const rng = makeRng(45);
  for (let i = 0; i < 60; i++) {
    const z = -280 + rng() * 355;
    const len = 8 + rng() * 16;
    if (Math.abs(z - TEMPLE[1]) < len / 2 + 3) continue;
    const x = BLUFF_X + 2 + rng() * (BLUFF_TOP - BLUFF_X - 4);
    b.add(['#c8bea4', '#b8ae96', '#d4cab0'][i % 3], box(2.2, 1 + rng() * 1.4, len, [x - 1.1, faceY(x) - 0.2, z]));
  }
}

function temple(ctx, b) {
  const { THREE } = ctx;
  const [tx, tz] = TEMPLE;
  const y0 = BLUFF_H;
  const L = 38, Wd = 26, Hm = 17;
  const at = (x, y, z) => [tx + x, y0 + y, tz + z];
  b.add(STONE, box(L, Hm, Wd, at(0, Hm / 2, 0)));
  b.add('#d8ceb6', box(L + 1.2, 1.1, Wd + 1.2, at(0, 0.55, 0)));
  b.add('#d8ceb6', box(L + 0.8, 0.7, Wd + 0.8, at(0, Hm - 0.1, 0)));
  // Pilasters with sunstones down both long sides and across the ends.
  for (let i = 0; i <= 9; i++) {
    const x = -L / 2 + 0.6 + i * ((L - 1.2) / 9);
    for (const sz of [-1, 1]) {
      b.add('#e2d8c0', box(1.2, Hm - 1, 0.5, at(x, (Hm - 1) / 2, sz * (Wd / 2 + 0.2))));
      b.add('#e8c860', xf(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 14), { pos: at(x, Hm - 2.2, sz * (Wd / 2 + 0.5)), rot: [Math.PI / 2, 0, 0] }));
      b.add('#d0c8b8', xf(new THREE.CylinderGeometry(0.4, 0.4, 0.18, 12), { pos: at(x, 1.8, sz * (Wd / 2 + 0.5)), rot: [Math.PI / 2, 0, 0] }));
    }
  }
  // Windows: two tall rows and a row of round attic windows.
  const winColor = '#3e4e5e';
  for (let i = 0; i < 9; i++) {
    const x = -L / 2 + 0.6 + (i + 0.5) * ((L - 1.2) / 9);
    for (const sz of [-1, 1]) {
      for (const wy of [4.2, 10.2]) {
        b.add(winColor, box(1.5, 3.4, 0.2, at(x, wy, sz * (Wd / 2 + 0.02))));
        b.add(winColor, xf(new THREE.CylinderGeometry(0.75, 0.75, 0.2, 12, 1, false, 0, Math.PI), { pos: at(x, wy + 1.7, sz * (Wd / 2 + 0.02)), rot: [Math.PI / 2, 0, Math.PI / 2] }));
      }
      b.add(winColor, xf(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 14), { pos: at(x, 14.3, sz * (Wd / 2 + 0.02)), rot: [Math.PI / 2, 0, 0] }));
    }
  }
  for (const z of [-7, 0, 7]) {
    b.add('#2e2a28', box(0.3, 4.6, 2.6, at(-L / 2 - 0.05, 2.3, z)));
    for (const wy of [9, 13]) b.add(winColor, box(0.25, 2.6, 1.5, at(-L / 2 - 0.05, wy, z)));
  }
  b.add('#d8ceb6', box(3, 1, Wd - 2, at(-L / 2 - 1.5, 0.5, 0)));
  // Low-pitched roof and the west tower: square stage, octagonal belfry, clock, dome and the angel vane.
  b.add('#6a6a70', xf(gableGeo(Wd + 1.2, 4.2, L + 1.2), { pos: at(0, Hm + 0.25, 0), rot: [0, Math.PI / 2, 0] }));
  b.add(STONE, xf(gableGeo(Wd, 4, 0.4), { pos: at(-L / 2 + 0.2, Hm + 0.2, 0), rot: [0, Math.PI / 2, 0] }));
  const tw = -L / 2 + 5;
  b.add('#f4f0e6', box(9, 7, 9, at(tw, Hm + 3.5, 0)));
  b.add('#d8ceb6', box(9.6, 0.6, 9.6, at(tw, Hm + 7.1, 0)));
  b.add('#f4f0e6', box(7, 5, 7, at(tw, Hm + 9.8, 0)));
  b.add('#fbf8ef', cyl(1.6, 1.6, 0.15, at(tw - 3.55, Hm + 9.8, 0), [0, 0, Math.PI / 2], 18));
  b.add('#2b2420', box(0.2, 1.2, 0.1, at(tw - 3.65, Hm + 10.1, 0)));
  b.add('#2b2420', box(0.2, 0.1, 0.9, at(tw - 3.65, Hm + 9.8, 0.35)));
  b.add('#d8ceb6', cyl(4.4, 4.4, 0.5, at(tw, Hm + 12.5, 0), [0, 0, 0], 8));
  b.add('#f4f0e6', cyl(3.4, 3.4, 5, at(tw, Hm + 15.2, 0), [0, Math.PI / 8, 0], 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    b.add('#3a3430', box(1.2, 3, 0.2, at(tw + Math.sin(a) * 3.2, Hm + 15.2, Math.cos(a) * 3.2), [0, a, 0]));
  }
  b.add('#d8ceb6', cyl(3.8, 3.8, 0.5, at(tw, Hm + 17.9, 0), [0, 0, 0], 8));
  b.add('#e8c860', xf(new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), { pos: at(tw, Hm + 18.1, 0) }));
  b.add('#e8c860', cyl(0.12, 0.25, 4, at(tw, Hm + 22.5, 0), [0, 0, 0], 8));
  b.add('#f0d070', xf(new THREE.CapsuleGeometry(0.28, 1.4, 4, 8), { pos: at(tw, Hm + 24.6, 0), rot: [0, 0, Math.PI / 2] }));
  b.add('#f0d070', cyl(0.05, 0.16, 1.2, at(tw - 1.3, Hm + 24.7, 0), [0, 0, Math.PI / 2], 6));
  ctx.addCollider({ x: tx, z: tz, hx: L / 2 + 1.5, hz: Wd / 2 + 0.8, rot: 0, top: y0 + Hm + 20 });
  glow(ctx, { pos: at(tw, Hm + 19, 0), size: 10, color: '#fff2c0', opacity: 0.25, pulse: 0 });
}

function custom(ctx) {
  const rng = makeRng(1841);
  const b = new Batch(ctx);
  river(ctx);
  bluff(ctx, b);
  temple(ctx, b);

  // A flatboat and a small steamboat on the Mississippi.
  b.add('#7a5636', box(5, 1, 14, [RIVER_W - 30, 0.4, -20]));
  b.add('#a07850', box(4, 1.6, 6, [RIVER_W - 30, 1.5, -21]));
  const sx = 40, sz = RIVER_S + 40;
  b.add('#efe8d8', box(26, 1.6, 7, [sx, 0.9, sz]));
  b.add('#f4f0e6', box(18, 2.2, 5.6, [sx - 1, 2.8, sz]));
  b.add('#c84a3a', box(19, 0.3, 6.2, [sx - 1, 4, sz]));
  for (const dz of [-1.4, 1.4]) b.add('#2b2420', cyl(0.4, 0.4, 7, [sx + 4, 7.5, sz + dz], [0, 0, 0], 10));
  b.add('#c84a3a', cyl(2.2, 2.2, 6.8, [sx + 14, 1.8, sz], [Math.PI / 2, 0, 0], 12));

  // Streets laid out on a grid across the flats.
  const streetsX = [-75, -45, -15, 15];
  const streetsZ = [-110, -75, -40, -5, 30, 62];
  for (const x of streetsX) b.add('#c8aa78', box(5, 0.06, 240, [x, 0.06, -20]), { cast: false });
  for (const z of streetsZ) b.add('#c8aa78', box(BLUFF_X + 95, 0.06, 5, [(BLUFF_X - 95) / 2, 0.06, z]), { cast: false });

  // Houses: red brick and white frame, with gardens, orchards and a few early log homes.
  const lineDist = (x, z) => {
    const [ax, az] = START, bx = TEMPLE[0], bz = TEMPLE[1];
    const vx = bx - ax, vz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    return Math.hypot(x - ax - vx * t, z - az - vz * t);
  };
  const bricks = ['#a8543c', '#b0603f', '#9a4a36', '#b86a4a'];
  for (let i = 0; i < streetsX.length; i++) {
    for (let j = 0; j < streetsZ.length; j++) {
      const x0 = streetsX[i] + 4, z0 = streetsZ[j] + 4;
      const x1 = (streetsX[i + 1] ?? BLUFF_X) - 4, z1 = (streetsZ[j + 1] ?? RIVER_S - 6) - 4;
      if (x1 - x0 < 8 || z1 - z0 < 8) continue;
      for (const [fx, fz] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        const x = x0 + (x1 - x0) * fx + (rng() - 0.5) * 3, z = z0 + (z1 - z0) * fz + (rng() - 0.5) * 3;
        if (z > 64) continue;
        if (lineDist(x, z) < 12 || Math.hypot(x - START[0], z - START[1]) < 16) {
          for (let k = 0; k < 5; k++) b.add('#5f8a3e', box(3, 0.08, 0.5, [x + (rng() - 0.5), 0.06, z - 2 + k * 0.9]), { cast: false });
          continue;
        }
        const r = rng();
        const rot = fz < 0.5 ? Math.PI : 0;
        if (r < 0.5) frameHouse(b, ctx, { pos: [x, z], size: [8 + rng() * 3, 6 + rng() * 2], height: 4.6 + rng() * 2, rot, wall: bricks[Math.floor(rng() * 4)], roof: '#4a4440' });
        else if (r < 0.8) frameHouse(b, ctx, { pos: [x, z], size: [7 + rng() * 2, 5.5], height: 4 + rng() * 1.5, rot, wall: '#efe8d8', roof: '#5a5450', trim: '#ffffff', windowColor: '#3a4a58', chimneys: rng() < 0.6 });
        else if (r < 0.9) logCabin(b, ctx, { pos: [x, z], size: [6, 5], rot, smoke: false });
        else for (let k = 0; k < 4; k++) leafTree(b, ctx, { pos: [x + (k % 2) * 4 - 2, z + Math.floor(k / 2) * 4 - 2], height: 4 + rng() * 2, color: '#6a9a4a', color2: '#5a8a40' });
      }
    }
  }
  // Houses along the bluff top.
  for (let i = 0; i < 10; i++) {
    const x = BLUFF_TOP + 14 + rng() * 120, z = -250 + rng() * 300;
    if (Math.abs(x - TEMPLE[0]) < 30 && Math.abs(z - TEMPLE[1]) < 26) continue;
    frameHouse(b, ctx, { pos: [x, z], y: BLUFF_H, size: [8, 6], height: 5, rot: Math.PI / 2, wall: bricks[i % 4] });
  }
  // Oaks scattered down the face of the bluff and along its crest.
  for (let i = 0; i < 70; i++) {
    const x = BLUFF_X + 2 + rng() * (BLUFF_TOP - BLUFF_X + 10), z = -280 + rng() * 355;
    if (Math.abs(z - TEMPLE[1]) < 8) continue;
    leafTree(b, ctx, { pos: [x, z], y: ctx.groundHeight(x, z) - 0.3, height: 6 + rng() * 5, color: ['#5f8a4a', '#4f7a40', '#6a9450'][i % 3], color2: '#46703a' });
  }
  // Trees along the shore and the bluff edge.
  for (let i = 0; i < 70; i++) {
    const t = rng();
    const p = t < 0.5 ? [RIVER_W + 6 + rng() * 8, -250 + rng() * 300] : [-80 + rng() * 120, RIVER_S - 6 - rng() * 6];
    leafTree(b, ctx, { pos: p, height: 7 + rng() * 5, color: '#5f8a4a', color2: '#4f7a40' });
  }
  b.flush();

  // Townspeople at the start, pausing to look toward the temple.
  const w = (robe) => ({ robe, mantle: '#d9cdb0', skin: '#e8c4a0', hair: '#5a3a22', bonnet: '#e8e0cc' });
  saint(ctx, { pos: [START[0] + 2.5, START[1] - 2], face: TEMPLE, kind: 'woman', colors: w('#5a4a6a') });
  saint(ctx, { pos: [START[0] + 3.4, START[1] - 1.4], face: TEMPLE, kind: 'woman', scale: 0.6, colors: w('#7a6450') });
  saint(ctx, { pos: [START[0] + 4.5, START[1] - 3.2], face: TEMPLE, colors: { robe: '#2b2a2e', mantle: '#3d3a44', skin: '#e8c4a0', hair: '#3a2418', tall: true } });
}

const street = (x0, x1, z0, z1, count) => ({ shape: 'rect', center: [(x0 + x1) / 2, (z0 + z1) / 2], size: [x1 - x0, z1 - z0], count, children: 0.15, kneel: 0, facingJitter: 2.5, lean: 0.02 });

export default {
  title: 'D&C 124: Nauvoo the Beautiful',
  subtitle: 'The city in the Mississippi bend, the temple on the bluff',
  seed: 124,

  style: baseStyle({ color: '#e4ecec', near: 160, far: 1100 }),

  sky: { zenith: '#3f7fb8', mid: '#86b6d8', horizon: '#eef0e4', ground: '#a8b878', glowColor: '#fff6d8', glowDir: [-0.7, 0.4, -0.3] },

  sun: {
    dir: [-0.5, 0.8, 0.45],
    color: '#fff4e0',
    intensity: 2.4,
    hemi: { sky: '#d6e8f0', ground: '#8a9a5a', intensity: 1.1 },
    shadowSize: 90,
  },

  ground: {
    size: 1800,
    segments: 300,
    flatRadius: 600,
    hillHeight: 0,
    undulation: 0.03,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#9fb064', dirt: '#93a85c', grass: '#86a052', grassDark: '#6a843e', plaza: '#c8aa78',
      plazaLine: '#b09060', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#86a052',
    },
  },

  mountains: { count: 40, distance: [560, 820], height: [20, 50], widthRatio: [3.5, 6], colors: ['#7f9a8a', '#8aa496', '#94ac9a'] },

  objects: [],
  custom,

  crowd: {
    seed: 12,
    minSpacing: 1.6,
    facing: TEMPLE,
    colors: SAINTS,
    groups: [
      street(-78, 18, 28, 32, 60),
      street(-48, -42, -110, 62, 50),
      street(-18, -12, -110, 62, 40),
      street(-78, 18, -7, -3, 30),
      { shape: 'rect', center: [TEMPLE[0] - 24, TEMPLE[1]], size: [7, 40], count: 50, children: 0.15, facing: TEMPLE, facingJitter: 0.8 },
    ],
  },

  player: {
    start: START,
    lookAt: TEMPLE,
    fov: 58,
    colors: { robe: '#2e3640', mantle: '#4a3b2e', skin: '#e8c4a0', hair: '#5a3a22', sash: '#2b2420' },
  },
};
