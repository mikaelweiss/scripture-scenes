// John 2:13-16. Jesus drives the moneychangers and the animals out of the temple court in Jerusalem.
// x is east, z is south. The sanctuary stands to the north.
import * as THREE from 'three';
import { FX_LAYER, JESUS, JUDEANS, addMesh, animal, boxGeo, cyl, doves, figure, glow, makeRng, plankTexture, rod, table } from './lib/nt-07-kit.js';

const JESUS_AT = [0, -6];
const MARBLE = '#efe6d2';
const GOLD = '#d9a93a';

function sanctuary(ctx) {
  const [x, z] = [0, -78];
  const y = ctx.terrainHeight(x, z) - 0.2;
  const stone = [], gold = [], dark = [];
  stone.push(boxGeo(60, 4, 44, [x, y + 2, z], { uv: { su: 4 } }));
  for (let k = 0; k < 8; k++) stone.push(boxGeo(16, (k + 1) * 0.5, 0.6, [x, y + ((k + 1) * 0.5) / 2, z + 22 + 4.6 - k * 0.6]));
  stone.push(boxGeo(20, 26, 30, [x, y + 4 + 13, z - 6], { uv: { su: 4 } }));
  stone.push(boxGeo(34, 34, 6, [x, y + 4 + 17, z + 10], { uv: { su: 4 } }));
  gold.push(boxGeo(34.4, 1.2, 6.4, [x, y + 4 + 33.2, z + 10]), boxGeo(20.4, 1, 30.4, [x, y + 4 + 25.6, z - 6]));
  for (let i = -16; i <= 16; i += 1.4) gold.push(cyl(0.12, 0.12, 1.2, x + i, y + 38.4 + 0.6, z + 12.6, {}, 5));
  for (let i = -9.5; i <= 9.5; i += 1.4) gold.push(cyl(0.1, 0.1, 1.0, x + i, y + 30.6 + 0.5, z - 6 + 14.8, {}, 5));
  gold.push(boxGeo(9, 0.8, 0.4, [x, y + 4 + 22.5, z + 13.1]), boxGeo(0.8, 18.5, 0.4, [x - 4.1, y + 4 + 13, z + 13.1]), boxGeo(0.8, 18.5, 0.4, [x + 4.1, y + 4 + 13, z + 13.1]));
  dark.push(boxGeo(7.4, 18, 0.3, [x, y + 4 + 9, z + 13.05]));
  for (const s of [-1, 1]) for (const cx of [7, 12]) stone.push(cyl(0.9, 0.9, 22, x + s * cx, y + 4 + 11, z + 13.6, {}, 12));
  addMesh(ctx.scene, stone, ctx.kit.stoneMat(MARBLE));
  addMesh(ctx.scene, gold, ctx.kit.toon(GOLD, { emissive: '#3a2a08' }));
  addMesh(ctx.scene, dark, ctx.kit.toon('#3a2418'), { cast: false });
  ctx.addCollider({ x, z, hx: 30, hz: 22, rot: 0, top: y + 40 });
  // Low balustrade (soreg) between the court and the inner courts.
  const rail = [];
  for (let i = -36; i <= 36; i += 2.4) if (Math.abs(i) > 8) rail.push(boxGeo(2.2, 1.3, 0.35, [i, ctx.terrainHeight(i, -48) + 0.65, -48]));
  addMesh(ctx.scene, rail, ctx.kit.stoneMat('#e3d6b8'));
  for (const s of [-1, 1]) ctx.addCollider({ x: s * 22.5, z: -48, hx: 14.5, hz: 0.3, rot: 0, top: 3 });
}

// Roofed colonnade along x = cx, from z0 to z1, open toward the court.
function stoa(ctx, { cx, z0, z1, side }) {
  const y = ctx.terrainHeight(cx, (z0 + z1) / 2) - 0.1;
  const H = 9;
  const cols = [], roof = [], wall = [];
  for (let z = z0; z <= z1; z += 4) for (const off of [0, side * 5]) {
    cols.push(cyl(0.55, 0.6, H, cx + off, y + H / 2, z, {}, 12));
    ctx.addCollider({ x: cx + off, z, hx: 0.5, hz: 0.5, rot: 0, top: y + H });
  }
  roof.push(boxGeo(12, 1.2, z1 - z0 + 4, [cx + side * 3.5, y + H + 0.6, (z0 + z1) / 2]));
  wall.push(boxGeo(1.2, H + 1.8, z1 - z0 + 4, [cx + side * 10, y + (H + 1.8) / 2, (z0 + z1) / 2], { uv: { su: 3 } }));
  addMesh(ctx.scene, cols, ctx.kit.stoneMat(MARBLE));
  addMesh(ctx.scene, roof, ctx.kit.toon('#c9a77a'));
  addMesh(ctx.scene, wall, ctx.kit.stoneMat('#e3d0a8'));
  ctx.addCollider({ x: cx + side * 10, z: (z0 + z1) / 2, hx: 0.6, hz: (z1 - z0) / 2 + 2, rot: 0, top: y + H + 2 });
}

function coins(ctx, spots, seed = 9) {
  const rng = makeRng(seed);
  const n = spots.reduce((a, s) => a + s[2], 0);
  const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8), ctx.kit.toon('#f0c850', { emissive: '#5a400a' }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let i = 0;
  for (const [cx, cz, count, r] of spots) for (let k = 0; k < count; k++) {
    const a = rng() * 6.28, d = Math.sqrt(rng()) * r;
    const x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
    m.compose(new THREE.Vector3(x, ctx.groundHeight(x, z) + 0.01, z), q.setFromEuler(e.set((rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3)), new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(i++, m);
  }
  // Outlines would swallow coins this small, so they skip the line pass.
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
}

function overturned(ctx, { pos: [x, z], rot, w = 2.6 }) {
  const g = new THREE.Group();
  g.position.set(x, ctx.groundHeight(x, z), z);
  g.rotation.y = rot;
  const parts = [boxGeo(w, 0.9, 0.08, [0, 0.45, 0])];
  for (const s of [-1, 1]) for (const h of [0.15, 0.75]) parts.push(boxGeo(0.1, 0.1, 0.8, [s * (w / 2 - 0.15), h, 0.4]));
  addMesh(g, parts, ctx.kit.toon('#7a5636', { map: plankTexture() }));
  ctx.scene.add(g);
  ctx.addCollider({ x, z, hx: w / 2, hz: 0.5, rot, top: g.position.y + 0.9 });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.3, hz: 0.8, rot });
}

function cages(ctx, spots) {
  const wood = [], birds = [];
  for (const [x, z, rot] of spots) {
    const y = ctx.groundHeight(x, z);
    for (let k = 0; k < 3; k++) {
      const by = y + 0.35 + k * 0.62;
      const cxk = x + (k === 2 ? 0.3 : (k - 0.5) * 0.9);
      wood.push(boxGeo(0.8, 0.05, 0.6, [cxk, by - 0.3, z], { rotY: rot }), boxGeo(0.8, 0.05, 0.6, [cxk, by + 0.28, z], { rotY: rot }));
      for (const sx of [-0.38, -0.13, 0.13, 0.38]) wood.push(boxGeo(0.03, 0.58, 0.6, [cxk + sx, by, z], { rotY: rot }));
      birds.push(new THREE.SphereGeometry(0.12, 8, 6).scale(1, 0.9, 1.5).translate(cxk - 0.15, by - 0.12, z));
      birds.push(new THREE.SphereGeometry(0.12, 8, 6).scale(1, 0.9, 1.5).translate(cxk + 0.18, by - 0.12, z + 0.05));
    }
    ctx.addCollider({ x, z, hx: 0.9, hz: 0.4, rot, top: y + 1.9 });
    ctx.exclude({ kind: 'circle', x, z, r: 1.2 });
  }
  addMesh(ctx.scene, wood, ctx.kit.toon('#8c6a44'));
  addMesh(ctx.scene, birds, ctx.kit.toon('#f3eee2'));
}

export default {
  title: 'John 2:13-16: Cleansing the temple',
  subtitle: 'The court of the temple at Jerusalem, at Passover',
  seed: 208,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#f0dcb4', near: 120, far: 900 },
  },

  sky: { zenith: '#3d7aa0', mid: '#8ebccc', horizon: '#f3dcae', ground: '#d9b98a', glowColor: '#fff0c8', glowDir: [0.3, 0.6, -0.6] },

  sun: { dir: [0.45, 0.85, 0.4], color: '#fff3dc', intensity: 2.6, hemi: { sky: '#dbe8ee', ground: '#b08a62', intensity: 1.1 }, shadowSize: 60 },

  ground: {
    size: 1200,
    segments: 240,
    flatRadius: 140,
    hillHeight: 30,
    undulation: 0.05,
    plaza: { center: [0, -20], size: [90, 80] },
    colors: { sand: '#d8b88a', dirt: '#c49a68', grass: '#a0a066', grassDark: '#7d8448', plaza: '#ead9b6', plazaLine: '#c9ae80', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a09a6a' },
  },

  mountains: { count: 24, distance: [450, 700], height: [40, 90], widthRatio: [1.6, 2.6], colors: ['#a49a7a', '#9a9278', '#b0a482'] },

  objects: [],

  custom(ctx) {
    sanctuary(ctx);
    stoa(ctx, { cx: -38, z0: -44, z1: 24, side: -1 });
    stoa(ctx, { cx: 38, z0: -44, z1: 24, side: 1 });

    const jesus = figure(ctx, { ...JESUS, arms: [0.25, 0.4] }, { pos: JESUS_AT, face: [3, 10], scale: 1.12, glow: 0.28, clear: 2.2 });
    const right = jesus.children.filter((c) => c.isGroup).find((c) => c.position.x < 0);
    right.rotation.set(-2.5, 0, -0.35);
    const cords = [];
    for (let k = 0; k < 5; k++) cords.push(rod([0, -0.58, 0], [(k - 2) * 0.08, -1.3, 0.25 + k * 0.05], 0.015, 4));
    addMesh(right, cords, ctx.kit.toon('#6b4a33'), { cast: false });
    glow(ctx, [JESUS_AT[0], ctx.groundHeight(...JESUS_AT) + 1.4, JESUS_AT[1]], 4.5, '#fff0c8', 0.4);

    overturned(ctx, { pos: [-3.8, -5.2], rot: 0.9 });
    overturned(ctx, { pos: [3.9, -6.8], rot: -1.0 });
    overturned(ctx, { pos: [-1, -9.8], rot: 2.6 });
    coins(ctx, [[-3.2, -4.2, 60, 1.6], [3.4, -5.6, 50, 1.4], [-1, -8.6, 40, 1.4], [0.5, -5, 30, 2.5]]);

    const changer = { robe: '#5e4632', mantle: '#c8912e', skin: '#9c6a45', hair: '#e6d8b8', sash: '#b5523b' };
    const moneyTables = [[-12, -10], [-12, -2], [12, -12], [13, -3], [-9, -20], [9, -21]];
    moneyTables.forEach(([x, z], i) => {
      table(ctx, { pos: [x, z], size: [2.6, 1], rot: x < 0 ? 0.3 : -0.3, food: '#e0b84a', cup: '#8c5a3c', cloth: '#a33a2e', seed: i + 2 });
      figure(ctx, { ...changer, arms: [0.5, 0.9] }, { pos: [x + (x < 0 ? -1.1 : 1.1), z - 0.6], face: JESUS_AT });
    });

    cages(ctx, [[-17, -15, 0.2], [-16, 4, -0.1], [17, -16, -0.2], [18, 3, 0.1]]);
    doves(ctx, { center: [-2, 6, -8], count: 10, radius: 7, speed: 0.7, size: 1.5 });
    doves(ctx, { center: [8, 9, -16], count: 6, radius: 5, speed: -0.6, size: 1.5 });

    const rng = makeRng(31);
    for (let i = 0; i < 9; i++) {
      const x = -11 + rng() * 7, z = -3 + rng() * 8;
      animal(ctx, 'sheep', { pos: [x, z], rot: 0.3 + (rng() - 0.5) * 0.8, scale: 0.9 + rng() * 0.2 });
      ctx.exclude({ kind: 'circle', x, z, r: 1.1 });
    }
    for (let i = 0; i < 7; i++) {
      const x = 5 + rng() * 7, z = -3 + rng() * 8;
      animal(ctx, 'sheep', { pos: [x, z], rot: -0.4 + (rng() - 0.5) * 0.8 });
      ctx.exclude({ kind: 'circle', x, z, r: 1.1 });
    }
    for (const [x, z, r] of [[-10, 9, 0.2], [-14, 6, -0.1], [11, 9, -0.5]]) {
      animal(ctx, 'ox', { pos: [x, z], rot: r });
      ctx.exclude({ kind: 'circle', x, z, r: 2 });
    }
  },

  crowd: {
    seed: 8,
    minSpacing: 0.7,
    facing: JESUS_AT,
    colors: JUDEANS,
    aisles: [{ from: [3, 30], to: [1, 0], width: 4 }],
    keepClear: [{ kind: 'circle', x: 0, z: -6, r: 6.5 }],
    groups: [
      { center: JESUS_AT, radius: [9, 26], angle: [-3.14, 3.14], count: 260, children: 0.1, facingJitter: 0.9 },
      { shape: 'rect', center: [-30, -10], size: [10, 50], count: 90, facingJitter: 1.2 },
      { shape: 'rect', center: [30, -10], size: [10, 50], count: 90, facingJitter: 1.2 },
      { shape: 'rect', center: [0, -40], size: [40, 10], count: 60, facingJitter: 1.0 },
    ],
  },

  player: {
    start: [1.6, 1.8],
    lookAt: [-4, -8.5],
    fov: 44,
    colors: { robe: '#b5523b', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
