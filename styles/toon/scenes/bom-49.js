// Ether 2:16-25, 6:2-12: the eight tight barges driven by the wind across the great deep, at times buried under the waves.
// x is east, z is south. The player stands on a rock in the sea, the barges pass to the north.
import * as THREE from 'three';
import { FX_LAYER } from '../engine/renderer.js';
import { Batch, bargeGeometry, fence, glow, makeRng, rocks, toonStyle, water } from './lib/bom-43-kit.js';

const SEA_Y = -1.2;
const WAVES = { amp: 2.1, length: 26, speed: 1.1, dir: [1, -0.35], segments: 110 };

const BARGES = [
  { pos: [-22, -27], yaw: 0.35, sink: 0 },
  { pos: [-6, -58], yaw: 0.25, sink: 0.4 },
  { pos: [18, -33], yaw: 0.4, sink: 0 },
  { pos: [50, -70], yaw: 0.3, sink: 0 },
  { pos: [-60, -82], yaw: 0.2, sink: 0.2 },
  { pos: [12, -100], yaw: 0.35, sink: 2.6 },
  { pos: [-28, -128], yaw: 0.3, sink: 0 },
  { pos: [64, -122], yaw: 0.25, sink: 0.3 },
];

function barges(ctx, sea) {
  const { hull, trim } = bargeGeometry({ length: 14, width: 5.6, height: 4.4 });
  const hullMat = ctx.kit.toon('#8a6040');
  const trimMat = ctx.kit.toon('#3a2418');
  const surface = sea.userData.surface;
  const list = BARGES.map((d, i) => {
    const g = new THREE.Group();
    const h = new THREE.Mesh(hull, hullMat);
    const tr = new THREE.Mesh(trim, trimMat);
    h.castShadow = tr.castShadow = true;
    g.add(h, tr);
    ctx.scene.add(g);
    return { ...d, g, ph: i * 1.3 };
  });
  const fx = Math.cos(0.3), fz = -Math.sin(0.3);
  ctx.onFrame((t) => {
    for (const b of list) {
      const drift = t * 0.6;
      const x = b.pos[0] + fx * drift, z = b.pos[1] + fz * drift;
      const y0 = surface(x, z, t);
      const ax = surface(x + 4, z, t) - surface(x - 4, z, t);
      const az = surface(x, z + 2, t) - surface(x, z - 2, t);
      const bury = b.sink > 1 ? b.sink * (0.6 + 0.4 * Math.sin(t * 0.5 + b.ph)) : b.sink;
      b.g.position.set(x, SEA_Y + y0 + 0.9 - bury, z);
      b.g.rotation.set(Math.atan(az / 4) * 0.8, b.yaw, -Math.atan(ax / 8) * 0.9, 'YXZ');
    }
  });
}

function rain(ctx, count = 700) {
  const rng = makeRng(49);
  const geo = new THREE.BoxGeometry(0.02, 1.4, 0.02);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: '#c8d8dc', transparent: true, opacity: 0.4, fog: false, depthWrite: false }), count);
  mesh.layers.set(FX_LAYER);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  const drops = Array.from({ length: count }, () => [(rng() - 0.5) * 60, rng() * 30, (rng() - 0.5) * 60]);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.35)), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  ctx.onFrame((t, dt, cam) => {
    drops.forEach((d, i) => {
      d[1] -= dt * 26;
      d[0] += dt * 9;
      if (d[1] < -6) { d[1] += 30; d[0] = (rng() - 0.5) * 60; }
      if (d[0] > 30) d[0] -= 60;
      m.compose(p.set(cam.position.x + d[0], cam.position.y + d[1] - 8, cam.position.z + d[2]), q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

function lightning(ctx) {
  const flash = new THREE.DirectionalLight('#dfe8ff', 0);
  flash.position.set(-60, 120, -200);
  ctx.scene.add(flash);
  const bolt = glow(ctx, [-120, 140, -420], 260, '#dfe8ff', { opacity: 0, pulse: 0 });
  ctx.onFrame((t) => {
    const cycle = t % 7.3;
    const on = (cycle > 3 && cycle < 3.12) || (cycle > 3.22 && cycle < 3.3);
    flash.intensity = on ? 3.5 : 0;
    bolt.material.opacity = on ? 0.9 : 0;
  });
}

function custom(ctx) {
  const rng = makeRng(49);
  const b = new Batch(ctx);
  const sea = water(ctx, { center: [0, -60], size: [300, 240], y: SEA_Y, color: '#2f5f6a', shine: '#d8ece6', streaks: 160, waves: WAVES });
  water(ctx, { center: [0, 0], size: [2400, 2400], y: SEA_Y - 0.05, color: '#2a5560', streaks: 0 });
  fence(ctx, [0, 0], 14.5, { count: 40 });

  const crags = [];
  for (let i = 0; i < 34; i++) {
    const a = rng() * Math.PI * 2, r = 13 + rng() * 5;
    if (Math.cos(a) < -0.6 && Math.abs(Math.sin(a)) < 0.5) continue;
    crags.push([Math.sin(a) * r, Math.cos(a) * r, 1 + rng() * 2.2]);
  }
  rocks(ctx, crags, ['#4a4844', '#5a5652', '#3e3c3a']);
  for (let i = 0; i < 10; i++) {
    const a = rng() * Math.PI * 2, r = 40 + rng() * 120;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    b.add('#3e3c3a', new THREE.DodecahedronGeometry(2 + rng() * 3, 0).translate(x, SEA_Y, z));
  }

  barges(ctx, sea);
  rain(ctx);
  lightning(ctx);
  b.flush();
}

export default {
  title: 'Ether 2:16-25, 6:2-12: The Jaredite barges',
  subtitle: 'Tight like a dish, driven by the wind across the great deep',
  seed: 49,
  custom,

  style: toonStyle({ fog: '#4c5e64', near: 40, far: 520, grain: 0.07 }),

  sky: { zenith: '#1e2830', mid: '#3e4e56', horizon: '#6e8084', ground: '#2a3a40', glowColor: '#9ab0b4', glowDir: [0.3, 0.3, -1] },

  sun: { dir: [0.3, 0.8, -0.5], color: '#b8c8cc', intensity: 1.6, hemi: { sky: '#8aa0a8', ground: '#2a3438', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1000, segments: 250, flatRadius: 14, hillHeight: -40, undulation: 0.6,
    plaza: { center: [0, 500], size: [1, 1] },
    colors: { sand: '#6e6a62', dirt: '#5e5a54', grass: '#5e6a56', grassDark: '#4e5a48', plaza: '#6e6a62', plazaLine: '#4a4844', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#4a4844' },
  },

  objects: [],

  clouds: {
    puffs: [5, 9],
    layers: [
      { count: 70, distance: [120, 700], height: [40, 110], size: [50, 110], color: '#56646a', shade: '#1a2228', drift: 0.006 },
      { count: 30, distance: [80, 400], height: [25, 50], size: [30, 60], color: '#6e7c80', shade: '#222c32', drift: 0.01 },
    ],
  },

  player: {
    start: [0, 6],
    lookAt: [0, -60],
    colors: { robe: '#5e4632', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
