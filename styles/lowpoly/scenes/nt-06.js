// Matthew 3:13-17: John baptizes Jesus in the Jordan. The heavens open and the Spirit descends like a dove.
// The river runs north-south along x = 0. The player starts on the east bank looking west at Jesus and John in the water.
import * as THREE from 'three';
import { palm, shrub, sprite } from './lib/nt-01-kit.js';
import { rng } from '../engine/util.js';

const WATER = -0.5;
const JESUS = [0.6, 0.3];
const meander = (z) => Math.sin(z * 0.018) * 6 + Math.sin(z * 0.05) * 1.5;

const riverbed = [];
for (let z = -340; z <= 340; z += 7) riverbed.push({ x: meander(z), z, r: 4, falloff: 4.5, height: -1.7 });

function water(ctx) {
  const geo = new THREE.PlaneGeometry(22, 700, 22, 350);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) + meander(pos.getZ(i)));
  const mat = new THREE.MeshPhongMaterial({ color: '#4f8a86', specular: '#ffffff', shininess: 80, flatShading: true, transparent: true, opacity: 0.88 });
  const time = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.y += sin(position.x * 1.3 + uTime * 1.4) * 0.05 + sin(position.z * 0.9 - uTime * 2.1) * 0.06;`);
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = WATER;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  // Soft ripple rings around the two men in the water.
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.85, 20), new THREE.MeshBasicMaterial({ color: '#e8f4f0', transparent: true, opacity: 0.5, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(JESUS[0] - 0.5, WATER + 0.1, JESUS[1] - 0.35);
  ctx.scene.add(ring);
  ctx.onFrame((t) => {
    const k = 1 + ((t * 0.4) % 1) * 2.2;
    ring.scale.set(k, k, 1);
    ring.material.opacity = 0.5 * (1 - ((t * 0.4) % 1));
  });
}

function banks(ctx) {
  const r = rng(17);
  const reedGeo = new THREE.ConeGeometry(0.05, 1, 3);
  for (let i = 0; i < 900; i++) {
    const z = r.range(-160, 160);
    const side = r.sign();
    const x = meander(z) + side * r.range(6, 10);
    if (Math.hypot(x - 11, z - 3.6) < 3 || Math.hypot(x - 8, z - 2.6) < 3.5) continue;
    const h = r.range(0.9, 2);
    ctx.solid.add(reedGeo, { position: [x, ctx.heightAt(x, z) + h / 2, z], rotation: [r.range(-0.2, 0.2), 0, r.range(-0.2, 0.2)], scale: [1, h, 1], color: r.pick(['#7f8a48', '#8f9650', '#6e7a3c', '#a8a060']), jitter: 0.08 });
  }
  for (let i = 0; i < 60; i++) {
    const z = r.range(-200, 200);
    const x = meander(z) + r.sign() * r.range(12, 40);
    if (Math.hypot(x - 14, z - 4) < 8 || Math.abs(z) < 20 && Math.abs(x) < 34) continue;
    if (r() < 0.45) palm(ctx, x, z);
    else if (r() < 0.6) ctx.builders.tree(ctx, { x, z, kind: 'broad', h: r.range(3.5, 6), leaf: r.pick(['#6a7e3e', '#7a8a48', '#5c7038']) });
    else shrub(ctx, x, z, r.range(0.6, 1.2), '#6a7840');
  }
  for (let i = 0; i < 26; i++) {
    const z = r.range(-60, 60);
    const x = meander(z) + r.sign() * r.range(5, 7.5);
    ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [x, ctx.heightAt(x, z), z], rotation: [r() * 3, r() * 3, 0], scale: [r.range(0.3, 0.8), r.range(0.2, 0.5), r.range(0.3, 0.8)], color: '#9a8c78', jitter: 0.08 });
  }
}

function dove(ctx) {
  const white = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), white);
  body.scale.set(0.12, 0.1, 0.24);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), white);
  head.position.set(0, 0.07, 0.22);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 3), white);
  tail.rotation.x = -Math.PI / 2;
  tail.scale.set(1, 1, 0.25);
  tail.position.set(0, 0, -0.3);
  const wingGeo = new THREE.BoxGeometry(0.5, 0.02, 0.2);
  wingGeo.translate(0.25, 0, 0);
  const left = new THREE.Mesh(wingGeo, white), right = new THREE.Mesh(wingGeo, white);
  right.rotation.y = Math.PI;
  const lw = new THREE.Group(), rw = new THREE.Group();
  lw.add(left);
  rw.add(right);
  lw.position.x = 0.06;
  rw.position.x = -0.06;
  group.add(body, head, tail, lw, rw);
  group.scale.setScalar(2.8);
  group.rotation.order = 'YXZ';
  ctx.scene.add(group);
  const glow = sprite(ctx, { position: [0, 0, 0], size: 3, color: '#fff6e0', opacity: 0.45 });
  ctx.onFrame((t) => {
    const k = Math.min(1, t / 10);
    const ease = 1 - (1 - k) ** 3;
    const y = WATER + 2.9 + (1 - ease) * 14 + Math.sin(t * 1.6) * 0.1;
    group.position.set(JESUS[0] + (1 - ease) * 2, y, JESUS[1] + Math.sin(t * 0.7) * 0.15 * ease);
    group.rotation.set(0.75, Math.PI / 2 - 0.22, 0);
    const flap = Math.sin(t * (ease < 1 ? 7 : 3)) * (ease < 1 ? 0.7 : 0.35);
    lw.rotation.z = flap;
    rw.rotation.z = -flap;
    glow.position.copy(group.position);
  });
}

export default {
  title: 'Matthew 3:13-17: The baptism of Jesus',
  seed: 106,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.55, 0.6, 0.35], color: '#ffe6bc', intensity: 2.6 },
  light: { sky: '#a8c0e8', ground: '#7a6448', hemi: 1.0 },
  sky: { top: '#4a7ac0', horizon: '#ecdcc0', ground: '#c9b08a', sunColor: '#fff0c8', glow: 0.8 },
  fog: { color: '#dccfb6', near: 70, far: 560 },
  clouds: { count: 70, shadow: '#9a98a8', lit: '#fff6e6', rim: '#ffffff', distance: [200, 800], altitude: [90, 200], hole: 0.15 },
  mountains: { count: 44, color: '#9a8466', radius: [380, 620], height: [30, 90], haze: 0.45 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#30306a', highlightTint: '#fff0d0' },
  shadow: { center: [4, 0], radius: 40 },

  player: { start: [7.6, 2.5], yaw: 1.3, pitch: 0.05, eye: 1.65, speed: 4.2 },

  terrain: {
    size: 800,
    segments: 200,
    seed: 33,
    hills: 40,
    hillScale: 0.008,
    bumps: 0.3,
    flats: [{ x: 0, z: 0, r: 40, falloff: 40, height: 0.2 }, ...riverbed],
    colors: { ground: '#a89070', groundAlt: '#9c8664', grass: '#7e8a48', high: '#b09a78', rock: '#8a7a64' },
    patches: [
      { x: 0, z: 0, r: 26, color: '#7c8a46', strength: 0.55, rough: 0.5 },
      { x: 0, z: -60, r: 30, color: '#7c8a46', strength: 0.45, rough: 0.5 },
      { x: 0, z: 60, r: 30, color: '#7c8a46', strength: 0.45, rough: 0.5 },
    ],
  },

  objects: [],
  scatter: [
    { type: 'rock', count: 30, center: [0, 0], ring: [60, 260], spacing: 12, seed: 5, props: { color: '#a08c70' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.35,
    },
    groups: [
      { count: 150, center: JESUS, ring: [11, 30], arc: [Math.PI * 0.62, Math.PI * 1.38], spacing: 0.95, face: JESUS, children: 0.18, kneel: 0.15, seed: 71, avoid: [{ rect: [0, 0, 20, 200] }] },
      { count: 70, center: JESUS, ring: [11, 26], arc: [-0.95, 0.95], spacing: 0.95, face: JESUS, children: 0.18, kneel: 0.1, seed: 72, avoid: [{ rect: [0, 0, 20, 200] }, { r: 5, x: 11, z: 3.6 }, { rect: [17, 2, 14, 7] }] },
    ],
  },

  figures: [
    {
      x: JESUS[0], z: JESUS[1], y: WATER - 0.55, face: [7.6, 2.5], scale: 1.08, robe: '#f2eadb', mantle: '#e4d9c3', skin: '#a8754f', arms: 'down', emissive: 0.16,
      light: { color: '#fff0cf', intensity: 8, distance: 12 },
      halo: { size: 3, opacity: 0.22, color: '#fff3d6' },
    },
    { x: JESUS[0] - 1.0, z: JESUS[1] - 0.75, y: WATER - 0.5, face: JESUS, scale: 1.06, robe: '#8a6a42', mantle: '#6e5232', skin: '#8a5a3c', arms: 'out', hood: false },
  ],

  effects: [
    { type: 'beam', position: [JESUS[0], WATER, JESUS[1]], height: 260, radiusBottom: 2.4, radiusTop: 18, color: '#fff1cf', opacity: 0.3 },
    { type: 'beam', position: [JESUS[0], WATER, JESUS[1]], height: 260, radiusBottom: 1.0, radiusTop: 7, color: '#fff8e6', opacity: 0.25 },
    { type: 'motes', position: [JESUS[0], WATER, JESUS[1]], radius: 3, height: 30, count: 140 },
    { type: 'sunShafts', center: [-20, -10], count: 5, spread: 40, length: 420, width: [8, 18], opacity: 0.06 },
  ],

  custom(ctx) {
    water(ctx);
    banks(ctx);
    dove(ctx);
  },
};
