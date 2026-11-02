// John 4:5-30. Jesus, wearied, sits on Jacob's well at noon and asks a woman of Samaria for a drink.
// x is east, z is south. Mount Gerizim rises to the southwest, Sychar lies north.
import * as THREE from 'three';
import { JESUS, addMesh, boxGeo, cyl, figure, glow, house, jarGeo, leafyTrees, makeRng, rod, tufts } from './lib/nt-07-kit.js';

const WELL = [0, -4];

function well(ctx) {
  const [x, z] = WELL;
  const y = ctx.terrainHeight(x, z) - 0.1;
  const stone = [], wood = [], dark = [];
  const curb = new THREE.LatheGeometry([[1.05, 0], [1.25, 0], [1.25, 0.75], [1.3, 0.8], [1.3, 0.92], [1.05, 0.92], [1.05, 0]].map(([r, h]) => new THREE.Vector2(r, h)), 20);
  curb.translate(x, y + 0.35, z);
  stone.push(curb);
  stone.push(boxGeo(5.2, 0.35, 5.2, [x, y + 0.175, z]));
  for (let k = 0; k < 2; k++) stone.push(boxGeo(1.6, 0.18, 0.5, [x, y + 0.09 - 0.0 + 0, z + 2.85 + k * 0.45]));
  dark.push(cyl(1.05, 1.05, 0.02, x, y + 0.9, z, {}, 20));
  for (const s of [-1, 1]) wood.push(cyl(0.09, 0.11, 2.4, x + s * 1.15, y + 1.95, z, {}, 6));
  wood.push(cyl(0.07, 0.07, 2.6, x, y + 3.05, z, { rz: Math.PI / 2 }, 6));
  wood.push(rod([x + 0.3, y + 3.0, z], [x + 0.3, y + 1.6, z], 0.02, 4));
  const bucket = cyl(0.2, 0.16, 0.32, x + 0.3, y + 1.45, z, {}, 10);
  addMesh(ctx.scene, stone, ctx.kit.stoneMat('#cdb48a'));
  addMesh(ctx.scene, wood, ctx.kit.toon('#6b4a33'));
  addMesh(ctx.scene, [bucket], ctx.kit.toon('#8c6a44'));
  addMesh(ctx.scene, dark, ctx.kit.toon('#24323a'), { cast: false });
  ctx.addCollider({ x, z, hx: 1.3, hz: 1.3, rot: 0, top: y + 1.3 });
  ctx.addCollider({ x, z, hx: 2.6, hz: 2.6, rot: 0, top: y + 0.35, walkable: true });
  ctx.exclude({ kind: 'circle', x, z, r: 3 });
  return y + 0.35;
}

function road(ctx, points, width, color) {
  const pos = [], idx = [];
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const p = curve.getPoint(i / n), t = curve.getTangent(i / n);
    const w = width * (0.85 + 0.15 * Math.sin(i * 0.7));
    for (const s of [-1, 1]) {
      const x = p.x - t.z * s * w / 2, z = p.z + t.x * s * w / 2;
      pos.push(x, ctx.terrainHeight(x, z) + 0.06, z);
    }
    if (i < n) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.MeshToonMaterial({ color, gradientMap: ctx.kit.gradient, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}

function mountain(ctx, { pos: [x, z], radius, height, color, seed }) {
  const rng = makeRng(seed);
  const g = new THREE.ConeGeometry(radius, height, 14, 5);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (rng() - 0.5) * 0.18;
    p.setX(i, p.getX(i) * k);
    p.setZ(i, p.getZ(i) * k);
    p.setY(i, p.getY(i) * (p.getY(i) > height * 0.45 ? 0.82 : 1));
  }
  g.computeVertexNormals();
  g.translate(x, height / 2 - 4, z);
  const m = new THREE.Mesh(g, ctx.kit.toon(color));
  ctx.scene.add(m);
}

export default {
  title: 'John 4:5-30: The woman at the well',
  subtitle: "Jacob's well near Sychar in Samaria, about the sixth hour",
  seed: 209,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.42, 0.74, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#f3e2bc', near: 140, far: 900 },
  },

  sky: { zenith: '#2f78b0', mid: '#7fb8d8', horizon: '#f4e6c4', ground: '#d9b98a', glowColor: '#fff6d8', glowDir: [0.1, 1, 0.1] },

  sun: { dir: [0.15, 1, 0.25], color: '#fff6e0', intensity: 2.8, hemi: { sky: '#dcecf4', ground: '#b8925f', intensity: 1.05 }, shadowSize: 50 },

  ground: {
    size: 1200,
    segments: 240,
    flatRadius: 40,
    hillHeight: 34,
    undulation: 0.45,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#dcbd86', dirt: '#c9a06a', grass: '#a6a862', grassDark: '#7f8a46', plaza: '#e6d4ae', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b0a66a' },
  },

  mountains: { count: 30, distance: [420, 700], height: [50, 110], widthRatio: [1.6, 2.6], colors: ['#a8a07a', '#9c9a78', '#b4aa82', '#8f9670'] },

  objects: [
    { type: 'stones', count: 160, ring: [4, 90], size: [0.15, 0.6], colors: ['#cdb48a', '#b89a70', '#d9c39a', '#a58a66'] },
    { type: 'trees', count: 50, ring: [30, 180], height: [3.5, 6], broken: 0, fallen: 0, trunkColor: '#6b5a44', leafColors: ['#8a9a72', '#7d9070', '#9aa67e'] },
  ],

  custom(ctx) {
    const top = well(ctx);
    road(ctx, [[-90, 60], [-40, 30], [-6, 12], [7, 1], [14, -30], [30, -80], [40, -130]], 3.4, '#f0dcb0');
    mountain(ctx, { pos: [-140, 120], radius: 120, height: 110, color: '#9a9a6e', seed: 3 });
    mountain(ctx, { pos: [-60, -210], radius: 110, height: 90, color: '#a6a078', seed: 5 });

    const vil = '#dcc69c';
    const vr = makeRng(12);
    for (let i = 0; i < 12; i++) {
      const x = 30 + vr() * 34, z = -120 - vr() * 30;
      house(ctx, { pos: [x, z], size: [5 + vr() * 3, 4 + vr() * 3], h: 2.8 + vr(), rot: (vr() - 0.5) * 0.6, color: i % 2 ? vil : '#d6bf95', seed: i });
    }

    const y = top;
    addMesh(ctx.scene, [boxGeo(1.1, 0.45, 0.7, [-1.6, y + 0.225, -1.4], { rotY: -1.0 })], ctx.kit.stoneMat('#bfa57c'));
    figure(ctx, { ...JESUS, arms: [0.25, 0.75] }, { pos: [-1.6, -1.4], y: y + 0.4, face: [1.4, 1.2], seated: true, scale: 1.08, glow: 0.18, clear: 0 });
    glow(ctx, [-1.6, y + 1.5, -1.4], 3.5, '#fff0c8', 0.3);
    const woman = { robe: '#3f6a9a', mantle: '#b5523b', skin: '#a87650', hair: '#d9c7a3', sash: '#c8912e', arms: [0.3, 0.5] };
    figure(ctx, woman, { pos: [1.4, 0.9], face: [-1.6, -1.4] });
    addMesh(ctx.scene, [jarGeo(0.48, 2.2, ctx.terrainHeight(2.2, 1.6), 1.6)], ctx.kit.toon('#b5683b'));
    ctx.addCollider({ x: 2.2, z: 1.6, hx: 0.2, hz: 0.2, rot: 0, top: ctx.terrainHeight(2.2, 1.6) + 0.55 });

    const disciples = ['#8c5a3c', '#3e6e66', '#c8912e', '#6b5a4a', '#b5523b', '#4f6a80', '#a87b4f', '#7a6a52', '#d9c7a3', '#5e4632', '#6f7f6a'];
    disciples.forEach((m, i) => {
      const x = 26 + (i % 4) * 1.1 + (i > 7 ? 0.5 : 0), z = -58 + Math.floor(i / 4) * 1.4;
      figure(ctx, { robe: '#d9c7a3', mantle: m, skin: '#9c6a45', hair: '#2b1a12' }, { pos: [x, z], face: [4, -8] });
    });

    leafyTrees(ctx, [[-9, -12], [8, -14], [-14, 3], [-6, -22], [16, -10]], { seed: 9, height: [4, 6], trunk: '#6b5a44', leaves: ['#8a9a72', '#7d9070', '#9aa67e'] });
    const rng = makeRng(5);
    const spots = [];
    for (let i = 0; i < 220; i++) {
      const a = rng() * 6.28, r = 4 + Math.sqrt(rng()) * 40;
      spots.push([WELL[0] + Math.sin(a) * r, WELL[1] + Math.cos(a) * r]);
    }
    tufts(ctx, spots, { size: [0.12, 0.3], colors: ['#9a9a5a', '#8a8a4a', '#b0a86a'], flowers: 0.1, flowerColors: ['#f0d36a', '#e8e0f0'] });
  },

  player: {
    start: [0.5, 6.5],
    lookAt: [0, -2],
    colors: { robe: '#b5523b', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
