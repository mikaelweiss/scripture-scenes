// 1 Nephi 16:18-32: Nephi's steel bow is broken and the family suffers for want of food.
// Nephi makes a bow of wood and climbs the mountain to hunt. x is east, z is south; the mountain rises north.
import * as THREE from 'three';
import { Batch, DAY_STYLE, camel, makeRng, person, tent } from './lib/bom-01-kit.js';

const CAMP = [0, -6];
const BOW = [1.6, -1.2];
const NEPHI = [-4, -27];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(606);

  tent(b, ctx, { pos: [-7, -12], size: [5, 5.5], height: 2.6, rot: 0.3, color: '#4a3528', flap: '#6b4a33' });
  tent(b, ctx, { pos: [7, -13], size: [4.4, 5], height: 2.4, rot: -0.4, color: '#5e4632' });
  tent(b, ctx, { pos: [-15, -3], size: [4.2, 4.8], height: 2.2, rot: 1.0, color: '#6b5240' });
  tent(b, ctx, { pos: [14, -2], size: [4.2, 4.8], height: 2.2, rot: -1.1, color: '#4a3528' });
  camel(b, ctx, { pos: [-18, 9], rot: 2.4, couched: true, color: '#b88a58' });
  camel(b, ctx, { pos: [16, 10], rot: -2.2, couched: true, color: '#c49a62' });

  // The broken bow of fine steel lying in two pieces, and an empty food basket.
  const by = ctx.terrainHeight(...BOW);
  const steel = ctx.kit.toon('#9aa0ae', { emissive: '#22242c' });
  for (const [dx, dz, rot] of [[0, 0, 0.3], [0.7, 0.5, 2.2]]) {
    const half = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 5, 16, Math.PI * 0.55), steel);
    half.rotation.set(-Math.PI / 2, 0, rot);
    half.position.set(BOW[0] + dx, by + 0.05, BOW[1] + dz);
    ctx.scene.add(half);
  }
  b.add('#8c6a48', new THREE.CylinderGeometry(0.45, 0.32, 0.4, 10, 1, true).translate(BOW[0] - 2.2, by + 0.2, BOW[1] - 0.6));

  // A new bow of wood beside Nephi, and arrows.
  const ny = ctx.terrainHeight(...NEPHI);
  const wood = ctx.kit.toon('#8a5a2c');
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.04, 5, 16, Math.PI * 0.75), wood);
  bow.position.set(NEPHI[0] + 0.42, ny + 1.5, NEPHI[1]);
  bow.scale.setScalar(1.3);
  bow.rotation.set(0, Math.PI / 2, Math.PI * 0.62);
  ctx.scene.add(bow);
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.7, 7), ctx.kit.toon('#6b4a33'));
  quiver.position.set(NEPHI[0] - 0.1, ny + 1.6, NEPHI[1] + 0.32);
  quiver.scale.setScalar(1.3);
  quiver.rotation.x = -0.4;
  ctx.scene.add(quiver);

  // A dead campfire in the middle of the tents.
  const fy = ctx.terrainHeight(...CAMP);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.add('#8a7a66', new THREE.SphereGeometry(0.22, 6, 5).scale(1.2, 0.7, 1).translate(CAMP[0] + Math.sin(a) * 0.75, fy + 0.05, CAMP[1] + Math.cos(a) * 0.75));
  }
  for (let i = 0; i < 3; i++) b.add('#2e2420', new THREE.CylinderGeometry(0.09, 0.1, 1.1, 5).rotateZ(Math.PI / 2).rotateY((i / 3) * Math.PI).translate(CAMP[0], fy + 0.12, CAMP[1]));
  ctx.addCollider({ x: CAMP[0], z: CAMP[1], hx: 0.7, hz: 0.7, rot: 0, top: fy + 0.3 });
  ctx.exclude({ kind: 'circle', x: CAMP[0], z: CAMP[1], r: 1.4 });

  // Cairns marking the climb, and wild beasts near the top of the mountain.
  for (let k = 1; k < 9; k++) {
    const z = -12 - k * 7.5, x = Math.sin(k * 0.9) * 3 + k * 0.3;
    const y = ctx.terrainHeight(x, z);
    b.add('#8a7a66', new THREE.DodecahedronGeometry(0.35, 0).translate(x, y + 0.25, z));
    b.add('#a8987e', new THREE.DodecahedronGeometry(0.22, 0).translate(x, y + 0.6, z));
  }
  for (let i = 0; i < 5; i++) {
    const x = -14 + i * 6 + rng() * 3, z = -118 - rng() * 12;
    const y = ctx.terrainHeight(x, z);
    const f = new THREE.Matrix4().makeRotationY(rng() * 6).setPosition(x, y, z);
    b.add('#8a5a34', new THREE.SphereGeometry(0.45, 8, 6).scale(1, 0.8, 1.7), { frame: new THREE.Matrix4().makeTranslation(0, 1.1, 0).premultiply(f) });
    b.add('#8a5a34', new THREE.CylinderGeometry(0.12, 0.15, 0.6, 6).rotateX(-0.6).translate(0, 1.6, 0.75), { frame: f });
    for (const [lx, lz] of [[-0.2, 0.5], [0.2, 0.5], [-0.2, -0.5], [0.2, -0.5]]) b.add('#6b4a2c', new THREE.CylinderGeometry(0.05, 0.05, 0.9, 5).translate(lx, 0.45, lz), { frame: f });
  }

  // The high mountain to the north.
  const peak = new THREE.ConeGeometry(1, 1, 11, 4);
  const pp = peak.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const y = pp.getY(i);
    if (y > -0.49 && y < 0.49) {
      pp.setX(i, pp.getX(i) * (0.8 + rng() * 0.4));
      pp.setZ(i, pp.getZ(i) * (0.8 + rng() * 0.4));
    }
  }
  peak.computeVertexNormals();
  b.add('#a86a4a', peak.scale(240, 190, 170).translate(-30, 70, -330));
  b.add('#b47a58', peak.clone().scale(0.7, 0.6, 0.8).translate(150, -20, 60));

  // Scrub on the slopes.
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2, r = 30 + rng() * 170;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 20;
    if (ctx.blocked(x, z, 1)) continue;
    const s = 0.4 + rng() * 0.9;
    b.add(['#7d7a4a', '#6c6a42', '#8a8452'][i % 3], new THREE.SphereGeometry(s, 8, 6).scale(1.2, 0.6, 1).translate(x, ctx.terrainHeight(x, z) + s * 0.2, z));
  }
  b.flush();

  // Nephi climbing; Lehi bowed at his tent door; Laman and Lemuel murmuring apart.
  person(ctx, { pos: NEPHI, face: [4, -140], scale: 1.6, colors: { robe: '#d9c7a3', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e', arms: [0.35, 0.5] } });
  person(ctx, { pos: [-5.6, -8.6], y: ctx.terrainHeight(-5.6, -8.6), face: CAMP, kneel: true, colors: { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#a8724a', hair: '#d9d2c4', sash: '#8c6a48' } });
  person(ctx, { pos: [9.5, 3], face: [11, 4.5], colors: { robe: '#7a6a52', mantle: '#8c5a3c', skin: '#9c6a45', hair: '#2b1a12', arms: [0.9, 0.9] } });
  person(ctx, { pos: [11, 4.5], face: [9.5, 3], colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', arms: [0.4, 0.2] } });
}

export default {
  title: "1 Nephi 16:18-32: Nephi's broken bow",
  subtitle: 'Hungry in the wilderness, Nephi goes up the mountain to hunt',
  seed: 606,
  style: { ...DAY_STYLE, fog: { color: '#e8c69a', near: 150, far: 900 } },
  sky: { zenith: '#4a76a0', mid: '#9cb4c0', horizon: '#f0d0a0', ground: '#c89a6a', glowColor: '#fff0c8', glowDir: [-0.4, 0.7, -0.6] },
  sun: { dir: [-0.45, 0.7, 0.55], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d0e0e8', ground: '#a8744a', intensity: 1.1 }, shadowSize: 60 },
  ground: {
    size: 1400, segments: 300, flatRadius: 22, hillHeight: 20, undulation: 0.4,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: { sand: '#d4a872', dirt: '#bf9060', grass: '#a89a62', grassDark: '#8a7e4e', plaza: '#d4a872', plazaLine: '#bf9060', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b07a52' },
  },
  mountains: { count: 30, distance: [480, 760], height: [80, 170], widthRatio: [1.4, 2.4], colors: ['#a86a4a', '#b47a58', '#9a6448', '#c08a64'] },
  objects: [{ type: 'stones', count: 300, ring: [3, 45], size: [0.1, 0.35], colors: ['#b48a62', '#9a7452', '#c8a07a'] }],
  smolder: [{ pos: CAMP, radius: 0.6, embers: 6, flames: 0, smoke: 0, logs: 0, scorch: 1.4, smokeScale: 0.3, smokeHeight: 4 }],
  custom,
  clouds: { layers: [{ count: 18, distance: [400, 800], height: [140, 220], size: [40, 80], color: '#fff2dc', shade: '#9a8a8a' }] },
  crowd: {
    seed: 16,
    minSpacing: 0.9,
    facing: CAMP,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#7a6a52', '#6f8a6a', '#4f7f80'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#3e6e66', '#6b5a4a'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a'],
      hair: ['#2b1a12', '#3a2418', '#4a3020'],
      wraps: ['#e6d8b8', '#c8912e', '#d9c7a3'],
    },
    groups: [{ center: CAMP, radius: [1.8, 4.2], angle: [1.4, 4.9], count: 12, kneel: 0.75, children: 0.3, lean: 0.35, facingJitter: 0.6 }],
  },
  player: {
    start: [-1.5, 2.5],
    lookAt: [-4.5, -30],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
