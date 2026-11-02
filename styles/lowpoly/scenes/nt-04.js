// Matthew 2:1-11: the wise men find the young child with Mary in a house in Bethlehem, under the star.
// The house is north of the start (-z) with its door facing south. The wise men kneel in front of it, their camels to the east.
import * as THREE from 'three';
import { animal, house, lamp, olive, cypress, shrub, sprite, starfield } from './lib/nt-01-kit.js';
import { rng } from '../engine/util.js';

const HOUSE = [0, -12];
const STAR = [0, 27, -24];

function star(ctx) {
  ctx.glow.add(new THREE.OctahedronGeometry(0.9, 0), { position: STAR, scale: [1, 1.5, 1], color: '#ffffff', jitter: 0 });
  sprite(ctx, { position: STAR, size: 16, color: '#e8f0ff', opacity: 0.9 });
  sprite(ctx, { position: STAR, size: 40, color: '#b8c8ff', opacity: 0.25 });
  const flare = (sx, sy, opacity) => {
    const s = sprite(ctx, { position: STAR, size: 1, color: '#f4f6ff', opacity });
    s.scale.set(sx, sy, 1);
  };
  flare(40, 1.4, 0.7);
  flare(1.4, 36, 0.7);
  const diag = sprite(ctx, { position: STAR, size: 1, color: '#f4f6ff', opacity: 0.4 });
  diag.scale.set(22, 0.9, 1);
  diag.material.rotation = Math.PI / 4;
  const diag2 = sprite(ctx, { position: STAR, size: 1, color: '#f4f6ff', opacity: 0.4 });
  diag2.scale.set(22, 0.9, 1);
  diag2.material.rotation = -Math.PI / 4;
  ctx.onFrame((t) => {
    const k = 1 + 0.06 * Math.sin(t * 2.1);
    diag.material.rotation = Math.PI / 4 + t * 0.02;
    diag2.material.rotation = -Math.PI / 4 + t * 0.02;
    diag.scale.set(22 * k, 0.9, 1);
    diag2.scale.set(22 * k, 0.9, 1);
  });
  const base = new THREE.Vector3(HOUSE[0], 0, HOUSE[1] - 0.5);
  const dir = new THREE.Vector3(...STAR).sub(base);
  const beam = ctx.effects.beam({ position: base.toArray(), height: dir.length() * 1.6, radiusBottom: 2.8, radiusTop: 0.6, color: '#e6ecff', opacity: 0.32 });
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const light = new THREE.PointLight('#dfe6ff', 30, 40, 1.2);
  light.position.set(HOUSE[0], 9, HOUSE[1] + 3);
  ctx.scene.add(light);
}

function gifts(ctx) {
  // Gold in a small chest, frankincense in a tall jar, myrrh in a round vessel.
  ctx.solid.box(0.55, 0.3, 0.38, { position: [-1.5, 0.15, -7.2], color: '#7a4a24' });
  ctx.glow.box(0.5, 0.08, 0.33, { position: [-1.5, 0.33, -7.2], color: '#ffc94a', jitter: 0.04 });
  ctx.glow.box(0.12, 0.12, 0.12, { position: [-1.4, 0.4, -7.15], rotation: [0.3, 0.4, 0], color: '#ffdc72' });
  ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.16, 0.55, 8), { position: [0.1, 0.27, -7.0], color: '#d8d0c0' });
  ctx.glow.add(new THREE.ConeGeometry(0.12, 0.18, 8), { position: [0.1, 0.63, -7.0], color: '#e8b84a' });
  ctx.solid.add(new THREE.SphereGeometry(0.2, 8, 5), { position: [1.6, 0.2, -7.1], scale: [1, 0.9, 1], color: '#3e5a7a' });
  ctx.glow.add(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), { position: [1.6, 0.42, -7.1], color: '#e0b050' });
  sprite(ctx, { position: [-1.5, 0.45, -7.2], size: 1.2, color: '#ffd070', opacity: 0.5 });
}

function caravan(ctx) {
  animal(ctx, 'camelKneel', { x: 6.2, z: -6.5, rot: -2.4 });
  animal(ctx, 'camelKneel', { x: 8.6, z: -3.8, rot: -2.1, colors: { saddle: '#2f4a7a' } });
  animal(ctx, 'camel', { x: 9.8, z: -8.4, rot: -1.6, colors: { saddle: '#5a2f6e' } });
  animal(ctx, 'camel', { x: 12.2, z: -5.4, rot: -2.0, colors: { saddle: '#2f5a4a' } });
  const r = ctx.rand;
  for (const [x, z] of [[10.5, -2], [11.6, -9.5]]) {
    for (let i = 0; i < 3; i++) ctx.solid.box(r.range(0.5, 0.8), r.range(0.3, 0.5), r.range(0.4, 0.6), { position: [x + r.range(-0.6, 0.6), 0.2, z + r.range(-0.6, 0.6)], rotation: [0, r() * 3, 0], color: r.pick(['#7a3a2a', '#a07a4a', '#3e4a6a']) });
  }
}

function town(ctx) {
  const r = rng(64);
  const colors = ['#b8a688', '#ae9c7e', '#c2b292', '#a8987c'];
  const placed = [[HOUSE[0], HOUSE[1]], [0, 0], [9, -6]];
  const slots = [[-11, -13, 0], [11.5, -15, 0], [-12, 2, Math.PI / 2], [-13, 12, Math.PI / 2], [14, 8, -Math.PI / 2], [-4, -26, 0], [10, -27, 0], [-20, -12, Math.PI / 2]];
  for (const [x, z, rot] of slots) {
    placed.push([x, z]);
    house(ctx, { x, z, rot, w: r.range(6, 8), d: r.range(5, 6.5), h: r.range(2.9, 3.6), color: r.pick(colors), lit: r() < 0.75, upper: r() < 0.5 });
  }
  for (let tries = 0; placed.length < 50 && tries < 4000; tries++) {
    const x = r.range(-110, 110), z = r.range(-120, 90);
    if (Math.hypot(x, z) < 22) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 11)) continue;
    placed.push([x, z]);
    house(ctx, { x, z, rot: Math.round(r() * 4) * (Math.PI / 2), w: r.range(5, 8), d: r.range(4.5, 6.5), h: r.range(2.6, 3.4), color: r.pick(colors), lit: r() < 0.5, upper: r() < 0.3 });
  }
  for (let i = 0; i < 60; i++) {
    const x = r.range(-150, 150), z = r.range(-150, 120);
    if (Math.hypot(x, z) < 16 || placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 6)) continue;
    if (r() < 0.55) olive(ctx, x, z);
    else if (r() < 0.5) cypress(ctx, x, z, r.range(5, 8));
    else shrub(ctx, x, z, r.range(0.5, 1), '#3e4a2c');
  }
  olive(ctx, -5.5, -8, 3.8);
  cypress(ctx, 5.2, -14.5, 7);
}

export default {
  title: 'Matthew 2:1-11: The wise men',
  seed: 104,
  fov: 64,
  exposure: 1.05,

  sun: { direction: [-0.5, 0.35, 0.55], color: '#9fb2e8', intensity: 0.7 },
  light: { sky: '#46588e', ground: '#1c1a22', hemi: 0.85 },
  sky: { top: '#060c24', horizon: '#26345e', ground: '#121626', sunColor: '#cfdcff', glow: 0.4 },
  fog: { color: '#18213e', near: 50, far: 440 },
  mountains: { count: 40, color: '#1e2440', radius: [420, 650], height: [20, 60], haze: 0.45 },
  bloom: { strength: 0.8, radius: 0.55, threshold: 0.66 },
  grade: { saturation: 1.08, contrast: 1.07, vignette: 0.48, shadowTint: '#141c48', highlightTint: '#fff0d8' },
  shadow: { center: [2, -8], radius: 30 },

  player: { start: [1.6, 2.5], yaw: 0.04, pitch: 0.26, eye: 1.65, speed: 4 },

  terrain: {
    size: 700,
    segments: 140,
    seed: 19,
    hills: 28,
    hillScale: 0.008,
    bumps: 0.2,
    flats: [{ x: 0, z: -4, r: 30, falloff: 25, height: 0 }],
    colors: { ground: '#7a6c56', groundAlt: '#6e624e', grass: '#56603c', high: '#6e6858', rock: '#5e564a' },
    patches: [{ x: 0, z: -5, r: 10, color: '#8a7a60', strength: 0.6, rough: 0.3 }],
  },

  objects: [],
  scatter: [],

  crowd: {
    palette: {
      robes: ['#7a6248', '#8b6b4a', '#6e5a44', '#9a8460', '#5e4b3a', '#4f5a6b'],
      mantles: ['#4a3a2a', '#6e5a3e', '#8a7a5a', '#5a4632', '#c9b48e', '#7a3a2a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.8,
      hoodChance: 0.7,
    },
    groups: [
      { count: 3, points: [[7.6, -2.2], [11, -7], [7.4, -8.8]], face: [0, -8], children: 0, seed: 51 },
      { count: 7, center: [-7.5, -2], ring: [0.5, 2.6], spacing: 0.8, face: [0, -8], children: 0.3, seed: 52 },
    ],
  },

  figures: [
    { x: -0.2, z: -8.95, y: -0.5, face: [0, 0], scale: 1, robe: '#c9b48c', mantle: '#4c6c9c', skin: '#a8754f', arms: 'out', hood: true },
    { x: 0.55, z: -8.75, face: [0, -6], scale: 0.52, robe: '#f6f0e2', skin: '#b07a55', arms: 'out', emissive: 0.25 },
    { x: -1.6, z: -8.3, face: [0, -6], scale: 1.04, robe: '#7a5a3e', mantle: '#a0825c', skin: '#9b6a46', arms: 'down', hood: true },
    { x: -1.6, z: -6.2, y: -0.48, face: [-0.3, -9], scale: 1.05, robe: '#5a2f6e', mantle: '#c9a040', skin: '#8a5a3c', arms: 'out', hood: true },
    { x: 0.1, z: -5.8, y: -0.48, face: [0, -9], scale: 1.08, robe: '#8a1f2a', mantle: '#2f4a7a', skin: '#a87652', arms: 'out', hood: true },
    { x: 1.8, z: -6.2, y: -0.48, face: [0.3, -9], scale: 1.02, robe: '#2f5a4a', mantle: '#d8c8a0', skin: '#7a4c31', arms: 'out', hood: true },
  ],

  effects: [
    { type: 'motes', position: [HOUSE[0], 0, HOUSE[1]], radius: 3.5, height: 24, count: 120, color: '#eef2ff', size: 0.05 },
  ],

  custom(ctx) {
    starfield(ctx, { count: 1700, seed: 8 });
    star(ctx);
    house(ctx, { x: HOUSE[0], z: HOUSE[1], w: 8, d: 6, h: 3.4, color: '#c2ae8c', lit: true, upper: true, door: 1.7, doorH: 2.1, windows: true });
    lamp(ctx, { x: 1.4, y: 1.0, z: -8.7, light: 5, distance: 8 });
    lamp(ctx, { x: -1.3, y: 2.3, z: -8.6, light: 0 });
    gifts(ctx);
    caravan(ctx);
    town(ctx);
  },
};
