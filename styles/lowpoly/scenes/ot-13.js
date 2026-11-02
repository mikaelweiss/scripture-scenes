// Genesis 37:23-28: Joseph's brothers draw him out of the dry pit at Dothan and sell him
// to an Ishmeelite caravan carrying spices to Egypt. -z is north, the caravan road runs east-west.
import * as THREE from 'three';
import { person, camel, sheep, frame } from './lib/ot-13-kit.js';

const PIT = [0, -6];
const COAT = ['#c23b2a', '#e0a82e', '#2f6aa0', '#3f8a4a', '#8a3f8a', '#e0d0a0', '#c86a2a'];
const robes = { brown: '#7a5a3c', tan: '#a88a5e', olive: '#6b6a3e', rust: '#8e4a30', grey: '#7d7366', dark: '#5a4636' };

function pit(ctx) {
  const [px, pz] = PIT;
  const y = ctx.heightAt(px, pz);
  const hole = new THREE.CircleGeometry(1.5, 10).rotateX(-Math.PI / 2);
  ctx.solid.add(hole, { position: [px, y + 0.06, pz], color: '#120d0a', jitter: 0 });
  const shaft = new THREE.CylinderGeometry(1.5, 1.5, 1.2, 10, 1, true);
  ctx.solid.add(shaft, { position: [px, y - 0.5, pz], color: '#2a2018' });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = ctx.rand;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.42, 0), {
      position: [px + Math.cos(a) * 1.85, y + 0.22, pz + Math.sin(a) * 1.85],
      rotation: [r() * 3, r() * 3, 0],
      color: '#9a8a70',
      jitter: 0.1,
      scale: [0.9, 0.55, 0.8],
    });
  }
  ctx.colliders.add({ x: px, z: pz, w: 3.4, d: 3.4, bottom: y - 3, top: y + 0.4 });
  const rope = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 4);
  ctx.solid.add(rope, { position: [px + 1.5, y + 0.2, pz + 1.0], rotation: [0, 0.6, Math.PI / 2 - 0.15], color: '#a08560' });
}

// The stripped coat, folded on a rock by the pit.
function coat(ctx) {
  const at = frame(-2.6, -3.6, 0.5);
  const y = ctx.heightAt(-2.6, -3.6);
  const [cx, cz] = at(0, 0);
  ctx.solid.add(new THREE.DodecahedronGeometry(0.6, 0), { position: [cx, y + 0.15, cz], rotation: [0, 0.4, 0], scale: [1.4, 0.55, 1], color: '#8f8270' });
  COAT.forEach((c, i) => {
    const [x, z] = at(-0.55 + i * 0.16, 0);
    ctx.solid.box(0.17, 0.06, 0.95, { position: [x, y + 0.5 + Math.sin(i) * 0.02, z], rotation: [0, 0.5, 0.05], color: c, jitter: 0.04 });
  });
  for (let i = 0; i < 4; i++) {
    const [x, z] = at(0.55, -0.2 + i * 0.12);
    ctx.solid.box(0.06, 0.5, 0.11, { position: [x + 0.05, y + 0.24, z], rotation: [0, 0.5, 0], color: COAT[i * 2], jitter: 0.04 });
  }
}

function caravan(ctx) {
  const road = (t) => [-46 + t * 92, -21 + Math.sin(t * 3) * 3];
  const loads = [['#7a3a2a', '#d8c8a0'], ['#3f4d5e', '#b89a6a'], ['#6e3a2e', '#e0d2b0'], ['#5a6a3a', '#c8a878'], ['#7a3a2a', '#b89a6a'], ['#3f4d5e', '#d8c8a0'], ['#8a5a2a', '#c8a878']];
  for (let i = 0; i < 7; i++) {
    const t = 0.2 + i * 0.085;
    const [x, z] = road(t);
    const [nx, nz] = road(t + 0.01);
    camel(ctx, { x, z, rot: Math.atan2(nx - x, nz - z) + Math.PI, color: i % 2 ? '#b38957' : '#c49a68', load: loads[i] });
    if (i % 2 === 0) {
      const [hx, hz] = road(t - 0.025);
      person(ctx, { x: hx, z: hz + 1.3, face: [hx - 10, hz + 1], robe: i === 0 ? '#e2d6bc' : '#4a5a6a', mantle: '#7a3a2a', hood: true, skin: '#8a5a3c', staff: true });
    }
  }
  const [rx, rz] = road(0.85);
  camel(ctx, { x: rx, z: rz + 2, rot: Math.PI / 2 + 0.3, color: '#c49a68', load: loads[2] });
  camel(ctx, { x: 8.5, z: -12.5, rot: -0.9, color: '#b38957', load: loads[1] });
  for (let i = 0; i < 40; i++) {
    const x = -60 + i * 3 + ctx.rand.range(-0.5, 0.5);
    const z = -21 + Math.sin(((x + 46) / 92) * 3) * 3 + ctx.rand.range(-1.6, 1.6);
    ctx.solid.add(new THREE.CircleGeometry(ctx.rand.range(1.2, 2.2), 6).rotateX(-Math.PI / 2), { position: [x, ctx.heightAt(x, z) + 0.04, z], color: '#c8ab80', jitter: 0.05 });
  }
}

export default {
  title: 'Genesis 37:23-28: Joseph sold into Egypt',
  seed: 37,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.7, 0.45, 0.35], color: '#ffd29a', intensity: 3.0 },
  light: { sky: '#a8bce0', ground: '#7a6040', hemi: 1.05 },
  sky: { top: '#5a7fb8', horizon: '#f2d2a2', ground: '#c9a678', sunColor: '#ffe0b0', glow: 1.0 },
  fog: { color: '#e2c49a', near: 80, far: 620 },
  clouds: { count: 26, shadow: '#b49a8a', lit: '#fff0d6', rim: '#fff8ea', distance: [300, 900], altitude: [120, 260], hole: 0.2 },
  mountains: { count: 40, color: '#8a7a64', radius: [500, 760], height: [40, 110], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.38, shadowTint: '#3a2e50', highlightTint: '#ffe6c0' },
  shadow: { center: [0, -12], radius: 60 },

  player: { start: [2.5, 1.2], yaw: 0.1, pitch: -0.17, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 37,
    hills: 30,
    bumps: 0.4,
    flats: [{ x: 0, z: -10, r: 40, falloff: 50, height: 0 }],
    colors: { ground: '#b0935e', groundAlt: '#9c8a52', grass: '#8a8a48', high: '#a08a62', rock: '#86745e' },
    patches: [{ x: PIT[0], z: PIT[1], r: 7, color: '#9a7c58', strength: 0.6, rough: 0.5 }],
  },

  objects: [
    { type: 'rock', x: -6, z: -9, size: 1.6 },
    { type: 'rock', x: -12, z: 4, size: 2.2 },
    { type: 'tree', x: -9, z: -14, h: 5, kind: 'broad', leaf: '#6f7a4a' },
    { type: 'tree', x: 14, z: 2, h: 4.5, kind: 'broad', leaf: '#71784a' },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -10], ring: [45, 260], spacing: 9, seed: 4, props: { kind: 'broad', leaf: '#6c7848' } },
    { type: 'rock', count: 50, center: [0, -10], ring: [22, 300], spacing: 8, seed: 5, avoid: [{ rect: [0, -21, 120, 10] }, { r: 30, x: 0, z: -5 }], props: { color: '#9a8870' } },
  ],

  crowd: {
    palette: {
      robes: [robes.brown, robes.tan, robes.olive, robes.rust, robes.grey],
      mantles: ['#5a3d2b', '#7d5c3e', '#8a7a5a', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.7,
      hoodChance: 0.5,
    },
    groups: [
      { count: 5, points: [[-22, -15.5], [-14, -16.5], [-30, -18], [16, -20.5], [24, -20]], face: [60, -24], children: 0, seed: 3 },
    ],
  },

  custom(ctx) {
    pit(ctx);
    coat(ctx);
    caravan(ctx);

    // Joseph, stripped of his coat, bound and led toward the camels.
    person(ctx, { x: 2.2, z: -9.2, face: [6, -14], robe: '#e8e0cc', skin: '#a87652', arms: 'forward' });
    person(ctx, { x: 3.3, z: -10.4, face: [8, -15], robe: '#4a5a6a', mantle: '#7a3a2a', hood: true, skin: '#8a5a3c', arms: ['down', 'forward'] });
    const rope = new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4);
    ctx.solid.add(rope, { position: [2.75, 1.05, -9.6], rotation: [0, -0.85, Math.PI / 2], color: '#a08560' });

    // Judah takes the twenty pieces of silver from the merchant.
    person(ctx, { x: -1.6, z: -11.2, face: [-0.2, -12.4], robe: robes.rust, mantle: '#5a3d2b', skin: '#9b6a46', arms: ['down', 'forward'] });
    person(ctx, { x: -0.1, z: -12.6, face: [-1.6, -11.2], robe: '#d8ccb0', mantle: '#3f4d5e', hood: true, skin: '#8a5a3c', arms: ['down', 'forward'], belt: '#8a3a2a' });
    for (let i = 0; i < 6; i++) ctx.glow.add(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 7), { position: [-0.85 + ctx.rand.range(-0.06, 0.06), 1.0 + i * 0.014, -11.95 + ctx.rand.range(-0.06, 0.06)], color: '#e8e4d8', jitter: 0.02 });

    // The other brothers stand about the pit. Reuben is away.
    const brothers = [
      [-3.4, -6.5, robes.brown, '#7d5c3e', 'down'],
      [-4.2, -3.6, robes.olive, null, 'forward'],
      [3.6, -5, robes.tan, '#5a3d2b', 'down'],
      [-4.6, -1.2, robes.grey, '#8a7a5a', 'down'],
      [6.2, -4.6, robes.dark, null, 'down'],
      [-5.5, -8.4, robes.tan, '#556246', 'down'],
      [5.4, -7.2, robes.brown, null, 'down'],
    ];
    for (const [x, z, robe, mantle, arms] of brothers) person(ctx, { x, z, face: [1.5, -9.5], robe, mantle, skin: ctx.rand.pick(['#8a5a3c', '#9b6a46', '#a87652']), arms, staff: arms === 'down' && ctx.rand() < 0.5, hood: ctx.rand() < 0.3 });

    // Their father's flock grazing on the hillside.
    for (let i = 0; i < 46; i++) {
      const a = ctx.rand() * Math.PI * 2, d = 2 + Math.sqrt(ctx.rand()) * 8;
      sheep(ctx, { x: -17 + Math.cos(a) * d * 1.3, z: -3 + Math.sin(a) * d, rot: ctx.rand() * Math.PI * 2, wool: ctx.rand() < 0.2 ? '#5a4a3a' : '#e2dac6' });
    }
  },
};
