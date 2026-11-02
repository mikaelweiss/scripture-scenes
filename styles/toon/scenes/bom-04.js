// 1 Nephi 8: Lehi's dream. The tree of life, the rod of iron along the path, the river, the mist of darkness,
// and the great and spacious building standing in the air across the river.
// x is east, z is south. The tree stands to the north at the end of the path.
import * as THREE from 'three';
import { Batch, DAY_STYLE, glow, makeRng, person, river, xf } from './lib/bom-01-kit.js';

const TREE = [0, -40];
const ROD_X = -3;
const ROD = [22, -35];
const BUILDING = [52, -42];
const FLOOR_Y = 7;

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(404);

  // The tree, with fruit white above all whiteness.
  const ty = ctx.terrainHeight(...TREE);
  b.add('#8a6a4a', new THREE.CylinderGeometry(0.9, 1.5, 9, 10).translate(TREE[0], ty + 4.5, TREE[1]));
  for (const [a, tilt] of [[0.3, 0.7], [2.4, 0.8], [4.4, 0.75]]) {
    const branch = new THREE.CylinderGeometry(0.35, 0.6, 5, 7).translate(0, 2.5, 0).rotateZ(tilt).rotateY(a);
    b.add('#8a6a4a', branch.translate(TREE[0], ty + 7, TREE[1]));
  }
  const canopy = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = i === 0 ? 0 : 3 + rng() * 3.5;
    const s = 3 + rng() * 1.8;
    canopy.push([TREE[0] + Math.sin(a) * r, ty + 11 + (rng() - 0.3) * 3, TREE[1] + Math.cos(a) * r, s]);
  }
  canopy.forEach(([x, y, z, s], i) => b.add(['#6fae7a', '#84bf86', '#5f9e70'][i % 3], new THREE.SphereGeometry(s, 14, 10).scale(1, 0.75, 1).translate(x, y, z), { emissive: '#2a4a36' }));
  for (let i = 0; i < 150; i++) {
    const [x, y, z, s] = canopy[Math.floor(rng() * canopy.length)];
    const u = rng() * Math.PI * 2, v = rng() * 0.9 - 0.3;
    const fx = x + Math.cos(u) * Math.cos(v) * s, fy = y + Math.sin(v) * s * 0.75, fz = z + Math.sin(u) * Math.cos(v) * s;
    b.add('#ffffff', new THREE.SphereGeometry(0.42, 8, 6).translate(fx, fy, fz), { glow: true, cast: false });
  }
  ctx.addCollider({ x: TREE[0], z: TREE[1], hx: 1.4, hz: 1.4, rot: 0, top: ty + 9 });
  ctx.exclude({ kind: 'circle', x: TREE[0], z: TREE[1], r: 2.5 });
  glow(ctx, { pos: [TREE[0], ty + 11, TREE[1]], size: 34, color: '#fff6d8', opacity: 0.55, pulse: 0.03 });
  glow(ctx, { pos: [TREE[0], ty + 4, TREE[1]], size: 16, color: '#fff0c8', opacity: 0.35, pulse: 0.05 });
  const light = new THREE.PointLight('#fff2d0', 30, 40, 1.2);
  light.position.set(TREE[0], ty + 8, TREE[1]);
  ctx.scene.add(light);

  // The rod of iron, on posts beside the strait and narrow path.
  for (let z = ROD[0]; z >= ROD[1]; z -= 2.5) {
    const y = ctx.terrainHeight(ROD_X, z);
    b.add('#3a3a46', new THREE.CylinderGeometry(0.07, 0.09, 1.15, 6).translate(ROD_X, y + 0.57, z));
  }
  for (let z = ROD[0]; z > ROD[1]; z -= 5) {
    const y0 = ctx.terrainHeight(ROD_X, z) + 1.15, y1 = ctx.terrainHeight(ROD_X, z - 5) + 1.15;
    const seg = new THREE.CylinderGeometry(0.07, 0.07, Math.hypot(5, y1 - y0) + 0.05, 7).rotateX(Math.PI / 2 - Math.atan2(y1 - y0, 5));
    b.add('#55566a', seg.translate(ROD_X, (y0 + y1) / 2, z - 2.5), { emissive: '#1a1a24' });
  }
  ctx.addCollider({ x: ROD_X, z: (ROD[0] + ROD[1]) / 2, hx: 0.12, hz: (ROD[0] - ROD[1]) / 2, rot: 0, top: ctx.terrainHeight(ROD_X, 0) + 1.2 });

  // The river of filthy water, from near the tree down past the field.
  river(ctx, { points: [[6, -52], [10, -36], [14, -14], [13, 10], [18, 40], [26, 120], [34, 240]], width: 6, color: '#5f6e58', bank: '#4e5238', glint: '#a8b098', flow: 1.4, glints: 50 });
  ctx.exclude({ kind: 'rect', x: 13, z: 20, hx: 6, hz: 80 });

  // The great and spacious building, standing as it were in the air.
  const [bx, bz] = BUILDING;
  const W = 34, D = 12;
  b.add('#e8d2a8', new THREE.BoxGeometry(W, 1.2, D).translate(bx, FLOOR_Y - 0.6, bz));
  b.add('#c8912e', new THREE.BoxGeometry(W + 0.6, 0.4, D + 0.6).translate(bx, FLOOR_Y - 1.3, bz));
  for (let i = 0; i <= 10; i++) {
    const x = bx - W / 2 + 0.6 + (i * (W - 1.2)) / 10;
    b.add('#f1e6c8', new THREE.CylinderGeometry(0.45, 0.5, 7, 10).translate(x, FLOOR_Y + 3.5, bz + D / 2 - 0.8));
  }
  b.add('#f1e6c8', new THREE.BoxGeometry(W, 7, 0.8).translate(bx, FLOOR_Y + 3.5, bz - D / 2 + 0.4));
  for (const sx of [-1, 1]) b.add('#f1e6c8', new THREE.BoxGeometry(0.8, 7, D).translate(bx + sx * (W / 2 - 0.4), FLOOR_Y + 3.5, bz));
  b.add('#e8d2a8', new THREE.BoxGeometry(W + 1, 1.2, D + 1).translate(bx, FLOOR_Y + 7.6, bz));
  for (let k = 0; k < 2; k++) {
    const h = 5.5;
    const y = FLOOR_Y + 8.2 + k * h;
    const w = W - 4 - k * 6, d = D - 2 - k;
    b.add(k % 2 ? '#e8d2a8' : '#f1e6c8', new THREE.BoxGeometry(w, h, d).translate(bx, y + h / 2, bz));
    b.add('#c8912e', new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5).translate(bx, y + h, bz));
    for (let i = 0; i < Math.floor(w / 2.6); i++) {
      b.add('#ffd27a', new THREE.BoxGeometry(0.9, 2.2, 0.1).translate(bx - w / 2 + 1.6 + i * 2.6, y + 2.8, bz + d / 2 + 0.05), { glow: true });
    }
  }
  b.add('#c8912e', new THREE.ConeGeometry(5, 5, 4).rotateY(Math.PI / 4).translate(bx, FLOOR_Y + 8.2 + 11 + 2.5, bz));
  ctx.addCollider({ x: bx, z: bz, hx: W / 2, hz: D / 2, rot: 0, top: FLOOR_Y, walkable: true });
  b.flush();

  // Mist of darkness over the path, and cloud under the floating building.
  const puffs = [];
  for (let i = 0; i < 70; i++) puffs.push({ x: ROD_X + (rng() - 0.5) * 30, z: -2 - rng() * 22, y: 0.4 + rng() * 2.6, s: 1.6 + rng() * 2.4, ph: rng() * 6 });
  for (let i = 0; i < 26; i++) puffs.push({ x: bx + (rng() - 0.5) * W, z: bz + (rng() - 0.5) * D, y: FLOOR_Y - 3 - rng() * 3, s: 2.5 + rng() * 2.5, ph: rng() * 6, under: true });
  const mistMat = new THREE.MeshToonMaterial({ color: '#3a3446', emissive: '#18141f', gradientMap: ctx.kit.gradient, transparent: true, opacity: 0.82 });
  const mist = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), mistMat, puffs.length);
  const underMat = new THREE.MeshToonMaterial({ color: '#8a7f9a', emissive: '#2a2438', gradientMap: ctx.kit.gradient });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const under = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), underMat, 26);
  let ui = 0;
  puffs.forEach((p, i) => {
    if (p.under) {
      under.setMatrixAt(ui++, m.compose(v.set(p.x, p.y, p.z), q, sc.set(p.s, p.s * 0.6, p.s)));
    }
  });
  const fog = puffs.filter((p) => !p.under);
  mist.count = fog.length;
  mist.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mist.frustumCulled = false;
  ctx.scene.add(mist, under);
  ctx.onFrame((t) => {
    fog.forEach((p, i) => {
      const y = ctx.terrainHeight(p.x, p.z) + p.y + Math.sin(t * 0.5 + p.ph) * 0.3;
      mist.setMatrixAt(i, m.compose(v.set(p.x + Math.sin(t * 0.2 + p.ph) * 1.2, y, p.z), q, sc.set(p.s, p.s * 0.7, p.s)));
    });
    mist.instanceMatrix.needsUpdate = true;
  });

  // Lehi at the tree, beckoning to his family.
  person(ctx, { pos: [-2.6, -36.5], face: [-3, 0], scale: 1.08, colors: { robe: '#f1e8d2', mantle: '#4f7f80', skin: '#a8724a', hair: '#d9d2c4', sash: '#c8912e', arms: [0.7, 1.3] } });
  person(ctx, { pos: [1.4, -35.6], face: [-3, 0], colors: { robe: '#b5523b', mantle: '#e6d8b8', skin: '#a8724a', hair: '#3a2418', sash: '#c8912e', arms: [0.3, 1.2] } });
}

export default {
  title: "1 Nephi 8: Lehi's dream of the tree of life",
  subtitle: 'The rod of iron, the mist of darkness, the great and spacious building',
  seed: 404,
  style: { ...DAY_STYLE, fog: { color: '#6e6078', near: 70, far: 420 } },
  sky: { zenith: '#231d36', mid: '#4a3e5e', horizon: '#a88e98', ground: '#4a4a3a', glowColor: '#fff2d0', glowDir: [0, 0.25, -1] },
  sun: { dir: [-0.3, 0.8, 0.5], color: '#e8dcf0', intensity: 1.5, hemi: { sky: '#9a8ab0', ground: '#4a4434', intensity: 1.0 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 140, hillHeight: 30, undulation: 0.25,
    plaza: { center: [-1.2, -6], size: [2.6, 62] },
    colors: { sand: '#7f8a5c', dirt: '#6e7650', grass: '#8a9a62', grassDark: '#6c7a4a', plaza: '#c8b48a', plazaLine: '#a8946c', scorch: '#2a2420', scorchEdge: '#4a3a30', hill: '#5a5a48' },
  },
  mountains: { count: 30, distance: [450, 750], height: [40, 100], widthRatio: [1.8, 2.8], colors: ['#3e3850', '#4a4260', '#363048'] },
  objects: [{ type: 'stones', count: 150, ring: [5, 80], size: [0.1, 0.35], colors: ['#6e6858', '#5a5648'] }],
  custom,
  clouds: { layers: [{ count: 40, distance: [300, 700], height: [60, 160], size: [50, 100], color: '#5a5070', shade: '#1e1a2a' }] },
  crowd: {
    seed: 21,
    minSpacing: 0.75,
    facing: TREE,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#7a6a52', '#6f8a6a', '#4f7f80'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#3e6e66', '#6b5a4a'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33'],
      hair: ['#2b1a12', '#3a2418', '#4a3020'],
      wraps: ['#e6d8b8', '#c8912e', '#d9c7a3'],
    },
    aisles: [{ from: [-1.2, 20], to: [-1.2, -32], width: 1.6 }],
    groups: [
      { shape: 'rect', center: [-3.7, -6], size: [0.6, 50], count: 22, facingJitter: 0.15, lean: 0.25 },
      { shape: 'rect', center: [-2.42, -6], size: [0.12, 50], count: 16, facingJitter: 0.15, lean: 0.25 },
      { center: TREE, radius: [4.5, 9], angle: [-2.2, 2.2], count: 30, kneel: 0.4, children: 0.15, facingJitter: 0.4 },
      { shape: 'rect', center: [-14, -12], size: [16, 26], count: 26, facingJitter: 3.1 },
      {
        shape: 'rect', center: [BUILDING[0], BUILDING[1] + 3], size: [30, 4], count: 60, facing: [0, -14], facingJitter: 0.5, lean: -0.2,
        colors: { robes: ['#c8302c', '#7a2a8c', '#2c5aa8', '#e0a020', '#1f8a6a', '#f1e6c8'], mantles: ['#e9c46a', '#d9a441', '#f1e6c8', '#5a2a6a'], skins: ['#9c6a45', '#a87650', '#b5825a'], hair: ['#2b1a12', '#3a2418'], wraps: ['#e9c46a', '#d9a441'] },
      },
    ],
  },
  player: {
    start: [-1.2, 16],
    lookAt: [7, -40],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
