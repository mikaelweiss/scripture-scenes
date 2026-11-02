// Luke 5:1-11. Two boats on the Sea of Galilee, the net breaking with fish, Peter at Jesus' knees.
// x is east, z is south. The lake lies to the north, the shore runs east-west near z = 6.
import * as THREE from 'three';
import { JESUS, JUDEANS, addMesh, boat, boxGeo, calmWater, cyl, figure, fishes, foamLine, glow, makeRng, netMaterial, palms, plankTexture, reshapeGround, rod } from './lib/nt-07-kit.js';

const SEGMENTS = 260;
const shore = (x) => 6 + Math.sin(x * 0.05) * 2 + Math.sin(x * 0.013) * 4;
const WATER_Y = 0.1;
const DECK = 0.55;
const JETTY = { x: 0, z0: 9, z1: -16, hw: 1.3 };
const PETER_BOAT = { pos: [3.6, -13.5], rot: 0.15 };
const OTHER_BOAT = { pos: [9.6, -16.5], rot: -0.25 };

function jetty(ctx) {
  const { x, z0, z1, hw } = JETTY;
  const len = z0 - z1;
  const deck = [boxGeo(hw * 2, 0.16, len, [x, DECK - 0.08, (z0 + z1) / 2])];
  const posts = [];
  for (let z = z1 + 0.3; z <= z0; z += 2.5) for (const s of [-1, 1]) posts.push(cyl(0.12, 0.14, 2.2, x + s * (hw - 0.05), DECK - 1.0, z, {}, 6));
  addMesh(ctx.scene, deck, ctx.kit.toon('#a87b4f', { map: plankTexture() }));
  addMesh(ctx.scene, posts, ctx.kit.toon('#5e4632'));
  ctx.addCollider({ x, z: (z0 + z1) / 2, hx: hw, hz: len / 2, rot: 0, top: DECK, walkable: true });
}

// Keeps the player out of the lake everywhere except along the jetty: one strip per 4 m of shore.
function lakeWalls(ctx) {
  const { hw, z1 } = JETTY;
  for (let x = -240; x < 240; x += 4) {
    const edge = Math.min(shore(x), shore(x + 4)) - 0.8;
    const hz = (edge + 400) / 2;
    if (x + 4 <= -hw || x >= hw) {
      ctx.addCollider({ x: x + 2, z: edge - hz, hx: 2, hz, rot: 0, top: 2 });
      continue;
    }
    for (const [x0, x1] of [[x, -hw], [hw, x + 4]]) if (x1 > x0) ctx.addCollider({ x: (x0 + x1) / 2, z: edge - hz, hx: (x1 - x0) / 2, hz, rot: 0, top: 2 });
  }
  ctx.addCollider({ x: 0, z: (z1 - 400) / 2 - 0.2, hx: hw, hz: (400 + z1) / 2, rot: 0, top: 2 });
}

function netOfFish(ctx, { center: [cx, cz], size: [sx, sz] }) {
  const rng = makeRng(77);
  const spots = [];
  for (let i = 0; i < 520; i++) {
    const a = rng() * 6.28, r = Math.sqrt(rng());
    const x = cx + Math.cos(a) * r * sx, z = cz + Math.sin(a) * r * sz;
    const mound = (1 - r * r) * 0.55;
    spots.push([x, WATER_Y + rng() * mound, z, 0.35 + rng() * 0.25]);
  }
  for (let i = 0; i < 10; i++) {
    const a = rng() * 6.28, r = 1 + rng() * 0.25;
    spots.push([cx + Math.cos(a) * r * sx, WATER_Y + 0.3 + rng() * 0.5, cz + Math.sin(a) * r * sz, 0.4]);
  }
  fishes(ctx, spots, { flop: 0.12, seed: 3 });
  const dome = new THREE.SphereGeometry(1, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(sx * 1.05, 0.7, sz * 1.05);
  dome.translate(cx, WATER_Y - 0.05, cz);
  const net = new THREE.Mesh(dome, netMaterial(ctx, '#e6d8b8', [24, 6]));
  ctx.scene.add(net);
  const ropes = [];
  const rim = 18;
  for (let k = 0; k < rim; k++) {
    const a0 = (k / rim) * 6.28, a1 = ((k + 1) / rim) * 6.28;
    ropes.push(rod([cx + Math.cos(a0) * sx * 1.05, WATER_Y + 0.05, cz + Math.sin(a0) * sz * 1.05], [cx + Math.cos(a1) * sx * 1.05, WATER_Y + 0.05, cz + Math.sin(a1) * sz * 1.05], 0.05, 4));
  }
  const floats = [];
  for (let k = 0; k < rim; k += 2) floats.push(new THREE.SphereGeometry(0.12, 6, 5).translate(cx + Math.cos((k / rim) * 6.28) * sx * 1.05, WATER_Y + 0.08, cz + Math.sin((k / rim) * 6.28) * sz * 1.05));
  addMesh(ctx.scene, ropes, ctx.kit.toon('#c8a97a'), { cast: false });
  addMesh(ctx.scene, floats, ctx.kit.toon('#b5523b'), { cast: false });
  return ropes;
}

function dryingRacks(ctx, list) {
  const wood = [], nets = [];
  for (const [x, z, rot] of list) {
    const y = ctx.terrainHeight(x, z);
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const d of [-2, 2]) wood.push(cyl(0.07, 0.08, 2.2, x + c * d, y + 1.1, z - s * d, {}, 5));
    wood.push(rod([x - c * 2.2, y + 2.1, z + s * 2.2], [x + c * 2.2, y + 2.1, z - s * 2.2], 0.05, 5));
    const p = new THREE.PlaneGeometry(4, 1.9, 6, 3);
    const pp = p.attributes.position;
    for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.sin((pp.getX(i) + 2) * 0.8) * 0.12);
    p.rotateY(rot);
    p.translate(x, y + 1.15, z);
    nets.push(p);
    ctx.addCollider({ x, z, hx: 2.1, hz: 0.2, rot, top: y + 2.1 });
  }
  addMesh(ctx.scene, wood, ctx.kit.toon('#6b4a33'));
  for (const g of nets) ctx.scene.add(new THREE.Mesh(g, netMaterial(ctx, '#d9c7a3', [10, 5])));
}

export default {
  title: 'Luke 5:1-11: The miraculous catch of fish',
  subtitle: 'The lake of Gennesaret, early morning',
  seed: 210,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#dfe6dc', near: 120, far: 900 },
  },

  sky: { zenith: '#3f7fa8', mid: '#9cc4cc', horizon: '#f6e2b8', ground: '#c9d6cc', glowColor: '#ffe6b0', glowDir: [0.8, 0.2, -0.3] },

  sun: { dir: [0.75, 0.55, -0.25], color: '#ffeccc', intensity: 2.5, hemi: { sky: '#dcecf0', ground: '#8a9a7a', intensity: 1.1 }, shadowSize: 55 },

  ground: {
    size: 1400,
    segments: SEGMENTS,
    flatRadius: 140,
    hillHeight: 70,
    undulation: 0.2,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#dcc496', dirt: '#c4a070', grass: '#8ea05e', grassDark: '#6c8042', plaza: '#e6d4ae', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a62' },
  },

  mountains: { count: 30, distance: [550, 680], height: [60, 130], widthRatio: [1.6, 2.6], colors: ['#7f9a8a', '#8aa294', '#96a898'] },

  objects: [
    { type: 'stones', count: 260, ring: [8, 70], angle: [-1.4, 1.4], size: [0.12, 0.4], colors: ['#b8a07a', '#9a8a70', '#cdb48a', '#7d7060'] },
  ],

  custom(ctx) {
    reshapeGround(ctx, SEGMENTS, (x, z, y) => {
      const d = shore(x) - z;
      if (d <= -2) return y;
      const r = Math.hypot(x, z);
      const lake = 1 - THREE.MathUtils.smoothstep(r, 260, 420);
      return y - THREE.MathUtils.smoothstep(d, -2, 10) * 4 * lake;
    });
    calmWater(ctx, { y: WATER_Y, size: 1400, center: [0, -500], color: '#4f9aa0', light: '#7fc2bc', dark: '#468a92', tile: 10 });
    foamLine(ctx, shore, { from: -200, to: 200, y: WATER_Y + 0.03, width: 0.7 });
    jetty(ctx);
    lakeWalls(ctx);

    const peter = boat(ctx, { pos: PETER_BOAT.pos, y: -0.25, rot: PETER_BOAT.rot, length: 8.5, beam: 2.6, hull: '#7a5032', trim: '#c8912e', mast: true, sail: '#efe3c2' });
    const other = boat(ctx, { pos: OTHER_BOAT.pos, y: -0.35, rot: OTHER_BOAT.rot, length: 8, beam: 2.5, hull: '#6b4a33', trim: '#3e6e66', mast: true, sail: '#d9c7a3' });
    peter.rotation.z = 0.05;
    other.rotation.z = -0.07;

    netOfFish(ctx, { center: [7.4, -21.5], size: [3.2, 2.6] });
    const rng = makeRng(8);
    const inBoat = [];
    for (const [b, n] of [[PETER_BOAT, 70], [OTHER_BOAT, 60]]) {
      const [bx, bz] = b.pos;
      for (let i = 0; i < n; i++) {
        const lx = (rng() - 0.5) * 1.6, lz = -2.5 + rng() * 4.5;
        const c = Math.cos(b.rot), s = Math.sin(b.rot);
        inBoat.push([bx + lx * c + lz * s, 0.0 + rng() * 0.35, bz - lx * s + lz * c, 0.32 + rng() * 0.15]);
      }
    }
    fishes(ctx, inBoat, { flop: 0.15, seed: 11 });
    const lines = [
      [[4.6, 0.6, -16.8], [6.1, WATER_Y + 0.1, -19.6]],
      [[8.1, 0.5, -19.2], [8.4, WATER_Y + 0.1, -19.4]],
      [[5.0, 0.7, -15.8], [4.6, WATER_Y + 0.1, -21.0]],
    ];
    addMesh(ctx.scene, lines.map(([a, b]) => rod(a, b, 0.035, 4)), ctx.kit.toon('#c8a97a'), { cast: false });

    const boatFloor = -0.15;
    figure(ctx, { ...JESUS, arms: [0.35, 0.55] }, { pos: [4.2, -16.6], y: boatFloor, face: [3.2, -11], scale: 1.06, glow: 0.18, clear: 0 });
    glow(ctx, [4.2, boatFloor + 1.4, -16.6], 4, '#fff0c8', 0.3);
    figure(ctx, { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', sash: '#3e6e66', arms: [0.3, 1.4] }, { pos: [3.8, -15.0], y: boatFloor, face: [4.2, -16.6], seated: true, clear: 0 });
    const fisher = (mantle) => ({ robe: '#c8a97a', mantle, skin: '#8a5a3b', hair: '#2b1a12', sash: '#5e4632', arms: [0.3, 1.2] });
    figure(ctx, fisher('#b5523b'), { pos: [3.0, -12.2], y: boatFloor, face: [4.2, -16.6] });
    figure(ctx, fisher('#4f6a80'), { pos: [4.4, -11.2], y: boatFloor, face: [4.2, -16.6] });
    figure(ctx, fisher('#3e6e66'), { pos: [8.6, -18.4], y: boatFloor - 0.1, face: [7.4, -21] });
    figure(ctx, fisher('#c8912e'), { pos: [10.0, -17.9], y: boatFloor - 0.1, face: [7.8, -21] });
    figure(ctx, { ...fisher('#6b5a4a'), hair: '#e6d8b8' }, { pos: [10.2, -14.6], y: boatFloor - 0.1, face: [6, -12] });

    for (const [x, z, r] of [[-14, 7.5, 1.2], [-20, 8.6, 1.6], [18, 5.4, -1.3]]) {
      const b = boat(ctx, { pos: [x, z], y: ctx.terrainHeight(x, z) - 0.15, rot: r, length: 7, beam: 2.2, hull: '#7a5a3c', trim: '#a87b4f' });
      b.rotation.z = 0.12;
    }
    dryingRacks(ctx, [[-10, 14, 0.1], [12, 13, -0.2], [-24, 15, 0.3]]);
    palms(ctx, [[-30, 20], [26, 18], [36, 24], [-40, 26], [8, 30]], { seed: 6, height: [8, 11] });
  },

  crowd: {
    seed: 10,
    minSpacing: 0.66,
    facing: [4, -14],
    colors: JUDEANS,
    aisles: [{ from: [0, 30], to: [0, 6], width: 3 }],
    groups: [
      { shape: 'rect', center: [-8, 11], size: [18, 6], count: 70, children: 0.15, facingJitter: 0.6 },
      { shape: 'rect', center: [10, 10], size: [14, 6], count: 55, children: 0.15, facingJitter: 0.6 },
    ],
  },

  player: {
    start: [0, -13],
    lookAt: [3.5, -21],
    colors: { robe: '#b5523b', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
