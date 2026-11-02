// D&C 27:12 and 128:20: Peter, James, and John appear to Joseph Smith and Oliver Cowdery in the wilderness
// along the Susquehanna River, 1829. The clearing is at the origin, the river runs north-south to the east (+x).
import * as THREE from 'three';
import { forest, pine, leafy, bush, softGlow, person } from './lib/dc-01-kit.js';

const MESSENGERS = [[-1.6, -5.2], [0, -5.8], [1.6, -5.2]];
const KNEEL = [[-0.7, -1.4], [0.8, -1.3]];
const RIVER_X = 46;

function river(ctx) {
  const geo = new THREE.PlaneGeometry(36, 900, 6, 90);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) + Math.sin(pos.getZ(i) * 0.012) * 14);
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  const water = new THREE.Mesh(flat, new THREE.MeshLambertMaterial({ color: '#4d6f86', emissive: '#22384c', emissiveIntensity: 0.5, flatShading: true }));
  water.position.set(RIVER_X, -1.6, 0);
  water.receiveShadow = true;
  ctx.scene.add(water);
  const shimmer = water.geometry.attributes.position;
  const base = Float32Array.from(shimmer.array);
  ctx.onFrame((t) => {
    for (let i = 0; i < shimmer.count; i++) shimmer.setY(i, base[i * 3 + 1] + Math.sin(t * 0.8 + base[i * 3 + 2] * 0.15 + base[i * 3] * 0.3) * 0.06);
    shimmer.needsUpdate = true;
  });
}

function clearing(ctx) {
  for (const [x, z, s] of [[-5, -9, 1.2], [5.5, -8, 1], [-7, 1, 0.9], [7, 3, 1.1], [-4, 7, 0.7]]) bush(ctx, x, z, s, '#3f5a30');
  ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.4, 5, 6), { position: [6, 0.35, -3], rotation: [0, 0.6, Math.PI / 2 - 0.05], color: '#4f3c2c' });
  ctx.colliders.add({ x: 6, z: -3, w: 5, d: 0.8, rot: 0.6, bottom: 0, top: 0.7 });
  for (let i = 0; i < 6; i++) {
    const a = ctx.rand() * Math.PI * 2, d = 4 + ctx.rand() * 6;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.3 + ctx.rand() * 0.3, 0), { position: [Math.cos(a) * d, ctx.heightAt(Math.cos(a) * d, Math.sin(a) * d) + 0.1, Math.sin(a) * d], rotation: [a, a, 0], color: '#7c766a' });
  }
}

export default {
  title: 'D&C 27:12, 128:20: Peter, James, and John restore the priesthood',
  seed: 27,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.7, 0.18, 0.4], color: '#ffb880', intensity: 1.8 },
  light: { sky: '#7d8fc0', ground: '#4a4632', hemi: 1.15 },
  sky: { top: '#24345e', horizon: '#e6a070', ground: '#6a5a48', sunColor: '#ffc890', glow: 1.0 },
  fog: { color: '#7d7a80', near: 30, far: 300 },
  clouds: { count: 30, shadow: '#4a4458', lit: '#f0a878', rim: '#ffd8b0', distance: [220, 800], altitude: [90, 200], hole: 0.2 },
  mountains: { count: 40, color: '#3e4a44', radius: [380, 600], height: [40, 90], haze: 0.5 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.75 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.5, shadowTint: '#283058', highlightTint: '#ffe6c0' },
  shadow: { center: [0, -2], radius: 40 },

  player: { start: [-3.4, 1.4], yaw: -0.55, pitch: 0.03, eye: 1.65, speed: 3.8 },

  terrain: {
    size: 900,
    segments: 180,
    seed: 61,
    hills: 40,
    hillScale: 0.008,
    bumps: 0.3,
    flats: [
      { x: 0, z: -2, r: 10, falloff: 18, height: 0 },
      ...Array.from({ length: 19 }, (_, i) => ({ x: RIVER_X + Math.sin((i * 50 - 450) * 0.012) * 14, z: i * 50 - 450, r: 18, falloff: 16, height: -3 })),
    ],
    colors: { ground: '#4f5a32', groundAlt: '#5a6236', grass: '#5f6e3a', high: '#5a5e40', rock: '#6a6252' },
    patches: [
      { x: 0, z: -2, r: 9, color: '#6e7a44', strength: 0.7, rough: 0.4 },
      { x: RIVER_X - 18, z: 0, r: 30, color: '#6f6248', strength: 0.4, rough: 0.6 },
    ],
  },

  objects: [],
  scatter: [],

  figures: [
    ...MESSENGERS.map(([x, z], i) => ({
      x, z, y: 0.25, face: [0, 2], scale: 1.15, robe: '#fffcf3', mantle: '#f4eedf', skin: '#f6e6cc', arms: i === 1 ? 'out' : 'down', emissive: 0.22,
      ...(i === 1 ? { light: { color: '#fff0cf', intensity: 7, distance: 20 } } : {}),
      halo: { size: 3.2, opacity: 0.2, color: '#fff3d6' },
    })),
  ],

  effects: [
    { type: 'beam', position: [0, 0, -5.5], height: 120, radiusBottom: 3.2, radiusTop: 9, color: '#fff1cf', opacity: 0.3 },
    { type: 'ring', position: [0, 0.06, -5.4], radius: 2.6, width: 1.0, color: '#ffe8b0', opacity: 0.7 },
    { type: 'motes', position: [0, 0, -5.5], radius: 4, height: 14, count: 140, size: 0.04 },
  ],

  custom(ctx) {
    river(ctx);
    clearing(ctx);
    person(ctx, { x: KNEEL[0][0], z: KNEEL[0][1], face: MESSENGERS[1], kneel: true, coat: '#4a3a2c', vest: '#c8b89a', hair: '#6a4626', skin: '#e6bf9b' });
    person(ctx, { x: KNEEL[1][0], z: KNEEL[1][1], face: MESSENGERS[1], kneel: true, coat: '#353d52', vest: '#8a3a30', hair: '#1d1814', skin: '#d9ad88' });
    forest(ctx, { center: [0, -2], ring: [11, 220], count: 520, seed: 12, kinds: ['pine', 'pine', 'leafy', 'leafy', 'bush'], spacing: 3.6, avoid: [{ rect: [RIVER_X, 0, 44, 900] }, { rect: [-1, 12, 6, 10] }] });
    for (const [x, z] of [[-9, -12], [9, -13], [-12, -2], [12, 4]]) pine(ctx, x, z, 13);
    for (const [x, z] of [[-3, -15], [4, -16]]) leafy(ctx, x, z, 10, '#4a6a32');
    softGlow(ctx, { position: [0, 1.6, -5.4], size: 8, color: "#fff2d0", opacity: 0.18 });
  },
};
