// Ether 2:16-25, 6:2-12: the eight tight barges driven by the wind across the great deep, at times buried under the waves.
// x is east, z is south. The player rides the deck of one barge, the others pass to the north.
import * as THREE from 'three';
import { FX_LAYER } from '../engine/renderer.js';
import { Batch, bargeGeometry, box, glow, makeRng, person, toonStyle, water } from './lib/bom-43-kit.js';

const SEA_Y = 3;
const DECK = { center: [0, 2], hx: 1.7, hz: 5, top: 3.75 };
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

// The barge the player rides. Its deck collider heaves with the hull so the player rises and falls with it.
function ownBarge(ctx) {
  const g = new THREE.Group();
  const { hull, trim } = bargeGeometry({ length: 20, width: 7, height: 5 });
  const h = new THREE.Mesh(hull, ctx.kit.toon('#8a6040'));
  const tr = new THREE.Mesh(trim, ctx.kit.toon('#3a2418'));
  h.rotation.y = tr.rotation.y = Math.PI / 2;
  h.castShadow = tr.castShadow = h.receiveShadow = true;
  g.add(h, tr);

  const wood = ctx.kit.toon('#9a7048');
  const dark = ctx.kit.toon('#4a3020');
  const part = (geo, mat) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  };
  const { hx, hz, top } = DECK;
  part(box(hx * 2, 1.35, hz * 2, [0, top - 0.675, 0]), wood);
  for (let i = -3; i <= 3; i++) part(box(0.04, 0.02, hz * 2, [i * hx / 3.5, top + 0.01, 0]), dark);
  for (const sx of [-1, 1]) {
    part(box(0.12, 0.1, hz * 2, [sx * (hx - 0.06), top + 0.9, 0]), dark);
    for (let k = 0; k <= 6; k++) part(box(0.12, 0.9, 0.12, [sx * (hx - 0.06), top + 0.45, -hz + 0.06 + k * (hz * 2 - 0.12) / 6]), dark);
  }
  for (const sz of [-1, 1]) part(box(hx * 2, 0.1, 0.12, [0, top + 0.9, sz * (hz - 0.06)]), dark);
  part(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10).translate(0, top + 0.15, hz - 1.2), dark);

  const companion = person(ctx, { robe: '#7a5a3c', mantle: '#a84a3a', skin: '#a8724a', hair: '#3a2418', sash: '#c8912e', arms: [0.4, 0.9] }, [0.9, -2.3], [10, -60], { clear: 0 });
  ctx.scene.remove(companion);
  companion.position.set(0.9, top, -hz + 0.7);
  g.add(companion);
  ctx.scene.add(g);

  const [cx, cz] = DECK.center;
  const deck = { x: cx, z: cz, hx, hz, rot: 0, top: 0 };
  const rails = [
    { x: cx - hx, z: cz, hx: 0.12, hz, rot: 0 },
    { x: cx + hx, z: cz, hx: 0.12, hz, rot: 0 },
    { x: cx, z: cz - hz, hx, hz: 0.12, rot: 0 },
    { x: cx, z: cz + hz, hx, hz: 0.12, rot: 0 },
    { x: cx + 0.9, z: cz - hz + 0.7, hx: 0.3, hz: 0.3, rot: 0 },
  ];
  const place = (t) => {
    const heave = Math.sin(t * 0.8) * 0.4;
    const base = SEA_Y + 0.2 + heave;
    g.position.set(cx, base, cz);
    g.rotation.set(Math.sin(t * 0.8 + 1) * 0.03, 0, Math.sin(t * 0.55) * 0.035);
    deck.top = base + top;
    for (const r of rails) r.top = base + top + 1.4;
  };
  place(0);
  ctx.addCollider(deck);
  rails.forEach((r) => ctx.addCollider(r));
  ctx.onFrame(place);
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
  ownBarge(ctx);
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
    start: [0, 4.6],
    lookAt: [0, -60],
    colors: { robe: '#5e4632', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
