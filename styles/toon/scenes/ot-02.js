// Genesis 2:8-15: the garden eastward in Eden. A spring beside the tree of life parts into four rivers.
// Coordinates are meters. x is east, z is south. The player looks north toward the tree.
import { BASE_STYLE, ROBES, THREE, Parts, animal, between, figure, flock, glow, makeRng, pick, river, water } from './lib/ot-01-kit.js';

const TREE = [0, -18];
const SPRING = [-11, -9];
const ADAM = [-1.4, 1.5];
const EVE = [0.4, 1.1];

function treeOfLife(ctx) {
  const [x, z] = TREE;
  const y = ctx.terrainHeight(x, z) - 0.2;
  const S = 1.2;
  const p = new Parts();
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 9);
  p.add('#7a5236', cyl, { pos: [0, 3.5, 0], scale: [2.6, 7, 2.6] });
  p.add('#7a5236', new THREE.CylinderGeometry(0.5, 1, 1, 9), { pos: [0, 0.6, 0], scale: [3.2, 1.2, 3.2] });
  const rng = makeRng(8);
  const canopy = new THREE.SphereGeometry(1, 14, 10);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    p.add('#7a5236', cyl, { pos: [Math.sin(a) * 2.2, 7.6, Math.cos(a) * 2.2], rot: [0.9, a, 0], scale: [0.7, 5, 0.7] });
  }
  const puffs = [[0, 10.5, 0, 5.2]];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rng() * 0.3;
    puffs.push([Math.sin(a) * 5, 9 + rng() * 1.5, Math.cos(a) * 5, 3.2 + rng() * 1.2]);
  }
  for (const [dx, dy, dz, r] of puffs) p.add(pick(rng, ['#3e8e4e', '#4f9a5a', '#2f7f4a']), canopy, { pos: [dx, dy, dz], scale: [r, r * 0.72, r] });
  const tree = p.group(ctx.kit);
  const n = 90;
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8), ctx.kit.toon('#fffbe8', { emissive: '#fff0b0' }), n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const [dx, dy, dz, r] = pick(rng, puffs);
    const u = rng() * 6.28, v = between(rng, [1.0, 2.0]);
    m.makeTranslation(dx + Math.cos(u) * Math.sin(v) * r * 1.04, dy + Math.cos(v) * r * 0.75, dz + Math.sin(u) * Math.sin(v) * r * 1.04);
    inst.setMatrixAt(i, m);
  }
  tree.add(inst);
  tree.scale.setScalar(S);
  tree.position.set(x, y, z);
  ctx.scene.add(tree);
  ctx.addCollider({ x, z, hx: 2.2, hz: 2.2, rot: 0, top: y + 20 });
  glow(ctx, [x, y + 14, z], 34, '#fff4c8', 0.3, 0.03);
  glow(ctx, [x, y + 1, z], 10, '#fff4c8', 0.3, 0.03);
  const light = new THREE.PointLight('#fff0c0', 24, 30, 1.5);
  light.position.set(x, y + 7, z + 4);
  ctx.scene.add(light);
}

function rivers(ctx) {
  const [sx, sz] = SPRING;
  water(ctx, { shape: circleShape(sx, sz, 4.2), y: ctx.terrainHeight(sx, sz) + 0.1, color: '#4fa8b8', glints: 0 });
  const pts = (list) => [[sx, sz], ...list];
  const opts = { width: 3.2, color: '#4fa8b8', bank: '#c8b07a', bankWidth: 0.9 };
  river(ctx, pts([[-20, -16], [-34, -12], [-50, -22], [-70, -20], [-100, -30], [-150, -26]]), opts);
  river(ctx, pts([[-8, -30], [-14, -48], [-6, -70], [-12, -100], [-4, -150]]), opts);
  river(ctx, pts([[-16, 4], [-26, 18], [-22, 36], [-34, 60], [-30, 100], [-40, 150]]), opts);
  river(ctx, pts([[6, -32], [24, -40], [40, -36], [62, -48], [100, -44], [150, -56]]), opts);
}

function circleShape(x, z, r) {
  const s = new THREE.Shape();
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    i ? s.lineTo(px, -pz) : s.moveTo(px, -pz);
  }
  return s;
}

function flowers(ctx) {
  const rng = makeRng(77);
  const geo = new THREE.IcosahedronGeometry(0.2, 0);
  const n = 260;
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), n);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  for (let k = 0; k < n; k++) {
    const x = between(rng, [-30, 30]), z = between(rng, [2, 40]);
    const s = between(rng, [0.6, 1.3]);
    m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z) + 0.12, z), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.7, s));
    mesh.setMatrixAt(k, m);
    mesh.setColorAt(k, c.set(pick(rng, ['#f2d04a', '#e86a5a', '#f6f0e0', '#d070b0', '#f09a3a', '#8ab0f0'])));
  }
  ctx.scene.add(mesh);
}

function animals(ctx) {
  const herd = [
    ['lion', [-7, 6], 0.6], ['sheep', [-5.4, 6.6], -2.2], ['sheep', [-4.2, 8], 2.0],
    ['deer', [12, -4], -0.8], ['deer', [14, -2], -1.0],
    ['horse', [-22, -30], 1.2], ['horse', [-25, -32], 1.4],
    ['giraffe', [24, -26], -0.5], ['giraffe', [27, -24], -0.6],
    ['elephant', [-30, 6], 0.8],
    ['rabbit', [7, 6], 2.4], ['rabbit', [8, 7], -1],
    ['zebra', [18, 10], 2.6], ['goat', [-12, 14], 1.0], ['goat', [-10, 16], 0.2],
    ['bear', [26, -6], -1.6], ['cow', [-18, -20], 0.4],
  ];
  for (const [type, [x, z], rot] of herd) {
    const a = animal(ctx.kit, type);
    a.position.set(x, ctx.groundHeight(x, z), z);
    a.rotation.y = rot;
    ctx.scene.add(a);
    ctx.addCollider({ x, z, hx: 0.6, hz: 0.6, rot: 0, top: ctx.groundHeight(x, z) + 1.5 });
  }
  flock(ctx, { center: [0, -18], y: 18, radius: 14, count: 10, colors: ['#fbf7ee', '#f2d04a', '#4f9fd0', '#e86a5a'], speed: 0.25, size: 2.4 });
}

export default {
  title: 'Genesis 2:8-15: The Garden of Eden',
  subtitle: 'A river went out of Eden to water the garden, and parted into four heads',
  seed: 2,

  style: { ...BASE_STYLE, fog: { color: '#e4ecd8', near: 120, far: 900 } },

  sky: { zenith: '#3f80b8', mid: '#86bcd8', horizon: '#f2ecc8', ground: '#8fb060', glowColor: '#fff6d8', glowDir: [0.3, 0.5, -1] },

  sun: { dir: [0.4, 0.8, 0.45], color: '#fff6e0', intensity: 2.6, hemi: { sky: '#d8ecf0', ground: '#6a8a4a', intensity: 1.15 }, shadowSize: 70 },

  ground: {
    size: 1400, segments: 260, flatRadius: 140, hillHeight: 34, undulation: 0.25,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: { sand: '#7faa50', dirt: '#8fb45a', grass: '#6a9a48', grassDark: '#4f7f3a', plaza: '#7faa50', plazaLine: '#7faa50', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6a9a58' },
  },

  mountains: { count: 30, distance: [480, 760], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#7aa88a', '#6f9a8a', '#86b08f', '#9ab89a'] },

  objects: [
    { type: 'trees', count: 160, ring: [42, 150], height: [6, 12], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e4e', '#5fa04a', '#2f7f4a', '#7fb050', '#e8a0b0', '#f0c0c8'] },
    { type: 'trees', count: 26, ring: [18, 40], angle: [1.9, 4.4], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#5fa04a', '#7fb050', '#e8a0b0', '#f2d04a'], seed: 12 },
    { type: 'trees', count: 10, ring: [20, 36], angle: [-1.6, -0.6], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#5fa04a', '#7fb050', '#e8a0b0'], seed: 14 },
    { type: 'stones', count: 120, ring: [4, 60], size: [0.15, 0.4], colors: ['#d8ccb0', '#c8b898', '#e6dcc4'] },
  ],

  custom(ctx) {
    rivers(ctx);
    treeOfLife(ctx);
    flowers(ctx);
    animals(ctx);
    const adam = { robe: '#e8dcc0', mantle: '#c8a97a', skin: '#a8724a', hair: '#4a3020', sash: '#8c5a3c', arms: [0.25, 0.1] };
    const eve = { robe: '#f2e8d4', mantle: '#8fb07a', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e', arms: [0.25, 0.1] };
    figure(ctx, adam, ADAM, { facing: [EVE[0], EVE[1] + 2], scale: 1.04 });
    figure(ctx, eve, EVE, { facing: [ADAM[0], ADAM[1] + 2], scale: 0.98 });
  },

  clouds: { layers: [{ count: 28, distance: [400, 850], height: [80, 180], size: [40, 80], color: '#ffffff', shade: '#7a8aa8' }] },

  player: {
    start: [3, 21],
    lookAt: [0, -14],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
