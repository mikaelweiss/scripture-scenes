// Ether 3:1-6: on the summit of mount Shelem the brother of Jared sees the finger of the Lord touch sixteen stones one by one.
// x is east, z is south. The summit is a small walkable top above a sea of cloud.
import * as THREE from 'three';
import { FX_LAYER } from '../engine/renderer.js';
import { Batch, ball, box, campfire, cyl, fence, glow, lamp, makeRng, person, rocks, toonStyle } from './lib/bom-43-kit.js';

const SLAB = [0, -6];
const KNEEL = [2.2, -4.4];
const STEP = 1.6;

function stones(ctx) {
  const y = ctx.groundHeight(...SLAB);
  const geo = new THREE.IcosahedronGeometry(0.13, 0);
  const list = [];
  for (let i = 0; i < 16; i++) {
    const row = Math.floor(i / 8), k = i % 8;
    const mat = ctx.kit.toon('#e8f2f6', { unique: true });
    const s = new THREE.Mesh(geo, mat);
    s.position.set(SLAB[0] - 1.05 + k * 0.3, y + 0.1, SLAB[1] - 0.2 + row * 0.4);
    s.rotation.set(k, row * 2, 0);
    s.castShadow = true;
    ctx.scene.add(s);
    const g = glow(ctx, [s.position.x, s.position.y + 0.05, s.position.z], 0.01, '#fff6d8', { opacity: 0.9, pulse: 0 });
    list.push({ s, g, mat });
  }
  return list;
}

const TILT = new THREE.Euler(-0.25, 0, 0.75);
const ARM_DIR = new THREE.Vector3(0, 1, 0).applyEuler(TILT);
const ARM = 2.4;
const HAND = 1.35;

// The Lord's hand, modelled with the fingertip at the origin and the arm rising along +y into the cloud.
function finger(ctx) {
  const skin = ctx.kit.basic('#fff6e6');
  const sleeve = ctx.kit.basic('#fffdf6');
  const g = new THREE.Group();
  const add = (geo, mat, pos, rot = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    g.add(m);
  };
  const tip = new THREE.CapsuleGeometry(0.045, 0.36, 4, 10);
  add(tip, skin, [-0.085, 0.23, 0]);
  add(new THREE.BoxGeometry(0.27, 0.3, 0.11), skin, [0, 0.58, 0]);
  for (let i = 0; i < 3; i++) add(new THREE.CapsuleGeometry(0.045, 0.1, 4, 8), skin, [-0.01 + i * 0.075, 0.4, 0.05], [0.9, 0, 0]);
  add(new THREE.CapsuleGeometry(0.045, 0.16, 4, 8), skin, [0.15, 0.5, 0.04], [0.3, 0, -0.5]);
  add(new THREE.CylinderGeometry(0.1, 0.09, 1.0, 10), skin, [0, 1.15, 0]);
  add(new THREE.CylinderGeometry(0.2, 0.15, ARM - 1.4, 10), sleeve, [0, 1.4 + (ARM - 1.4) / 2, 0]);
  g.rotation.copy(TILT);
  g.scale.setScalar(HAND);
  ctx.scene.add(g);
  const halo = glow(ctx, [0, 0, 0], 1.6, '#fff3d0', { opacity: 0.7, pulse: 0 });
  return { mesh: g, halo };
}

// A low bright cloud the arm reaches out of. It follows the hand along the row of stones.
function brightCloud(ctx) {
  const group = new THREE.Group();
  const rng = makeRng(7);
  const mats = [ctx.kit.toon('#fffaf0', { emissive: '#a89a80' }), ctx.kit.toon('#fff1d6', { emissive: '#a08a68' })];
  for (let i = 0; i < 16; i++) {
    const x = -2.4 + (i / 15) * 4.8 + (rng() - 0.5) * 0.5;
    const r = 0.5 + rng() * 0.5;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mats[i % 2]);
    m.position.set(x, (rng() - 0.3) * 0.7, (rng() - 0.5) * 1.2);
    group.add(m);
  }
  ctx.scene.add(group);
  const halo = glow(ctx, [0, 0, 0], 9, '#fff1c8', { opacity: 0.7, pulse: 0 });
  return { group, halo };
}

function custom(ctx) {
  const rng = makeRng(48);
  const b = new Batch(ctx);
  fence(ctx, [0, 0], 30, { count: 56 });

  const sy = ctx.terrainHeight(...SLAB);
  b.add('#8a8378', box(3.2, 0.8, 1.6, [SLAB[0], sy + 0.2, SLAB[1]]), { stone: true });
  b.add('#9a9286', box(2.9, 0.12, 1.3, [SLAB[0], sy + 0.64, SLAB[1]]), { stone: true });
  ctx.addCollider({ x: SLAB[0], z: SLAB[1], hx: 1.6, hz: 0.8, rot: 0, top: sy + 0.7 });

  campfire(b, ctx, [6.5, -3], { light: 5, distance: 10, size: 0.7 });
  for (let i = 0; i < 5; i++) b.add('#5a5048', ball(0.3, [7.6 + (i % 2) * 0.5, ctx.terrainHeight(7.6, -4.2) + 0.15, -4.4 + i * 0.3], [1.3, 0.6, 1], 6));
  b.add('#5e4632', box(1.6, 0.2, 0.8, [-6, ctx.terrainHeight(-6, -1) + 0.1, -1], [0, 0.4, 0]));
  b.add('#6b4a33', cyl(0.035, 0.04, 2, [-5.2, ctx.terrainHeight(-5.2, -2) + 1, -2], [0.2, 0, -0.3], 5));

  const boulders = [];
  for (let i = 0; i < 46; i++) {
    const a = rng() * Math.PI * 2, r = 12 + rng() * 22;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (z > 6 && Math.abs(x) < 7) continue;
    boulders.push([x, z, 0.8 + rng() * (r > 22 ? 3 : 1.6)]);
  }
  rocks(ctx, boulders, ['#7a726a', '#8a8278', '#6a645e', '#9a9288']);

  const stoneList = stones(ctx);
  const f = finger(ctx);
  const cloud = brightCloud(ctx);
  lamp(ctx, [SLAB[0], sy + 4, SLAB[1]], '#fff0c8', 10, 18);

  ctx.onFrame((t) => {
    const n = Math.floor(t / STEP) % 20;
    const phase = (t % STEP) / STEP;
    stoneList.forEach(({ mat, g }, i) => {
      const lit = i < n;
      mat.emissive.set(lit ? '#fff2c0' : '#000000');
      g.scale.setScalar(lit ? 1.1 + Math.sin(t * 2 + i) * 0.1 : 0.01);
    });
    const target = stoneList[Math.min(n, 15)].s.position;
    const reach = n < 16 ? Math.min(1, Math.min(phase, 1 - phase) * 4) : 0;
    f.mesh.visible = f.halo.visible = n < 16;
    f.mesh.position.set(target.x, target.y + 0.1, target.z).addScaledVector(ARM_DIR, (1 - reach) * 0.8);
    f.halo.position.copy(target);
    f.halo.position.y += 0.15;
    cloud.group.position.copy(f.mesh.position).addScaledVector(ARM_DIR, ARM * HAND - 0.1);
    cloud.halo.position.copy(cloud.group.position);
  });

  person(ctx, { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#4a3020', sash: '#5e4632', arms: [0.2, 0.7] }, KNEEL, SLAB, { pose: 'kneel', clear: 1, lean: -0.15 });
  b.flush();
}

export default {
  title: 'Ether 3:1-6: The brother of Jared sees the finger of the Lord',
  subtitle: 'Mount Shelem, sixteen stones touched one by one',
  seed: 48,
  custom,

  style: toonStyle({ fog: '#c8b8c8', near: 200, far: 1400 }),

  sky: { zenith: '#16234e', mid: '#4a5a8e', horizon: '#f2c48e', ground: '#e8d0c0', glowColor: '#ffe2b0', glowDir: [0.8, 0.08, -0.4] },

  sun: { dir: [0.8, 0.35, -0.3], color: '#ffd8a8', intensity: 2.3, hemi: { sky: '#8a90c0', ground: '#6a5a58', intensity: 1.05 }, shadowSize: 50 },

  ground: {
    size: 1000, segments: 250, flatRadius: 22, hillHeight: -240, undulation: 0.7,
    plaza: { center: [0, 500], size: [1, 1] },
    colors: { sand: '#9a9080', dirt: '#857a6c', grass: '#7f8a62', grassDark: '#626c4c', plaza: '#9a9080', plazaLine: '#857a6c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f7a70' },
  },

  mountains: { count: 22, distance: [420, 760], height: [40, 140], widthRatio: [1.2, 2.0], colors: ['#6a6a98', '#7a74a4', '#5e6290'] },

  objects: [],

  clouds: {
    puffs: [5, 9],
    layers: [
      { count: 140, distance: [110, 620], height: [-75, -48], size: [26, 50], color: '#ffe8d8', shade: '#6a5a8a', drift: 0.0015 },
      { count: 40, distance: [70, 140], height: [-80, -62], size: [18, 30], color: '#ffe8d8', shade: '#6a5a8a', drift: 0.0015 },
      { count: 14, distance: [300, 700], height: [90, 180], size: [40, 80], color: '#f2c0a0', shade: '#3a3260' },
    ],
  },

  light: {
    beams: [],
  },

  player: {
    start: [1.0, -1.8],
    lookAt: [-0.5, -6.4],
    colors: { robe: '#6f8a6a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
