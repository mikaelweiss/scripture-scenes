// Luke 2:1-7: Jesus is born in Bethlehem and laid in a manger, the town full of travelers for the census.
// A street runs south from a cave stable cut into the rock at the north end (-z). Dusk, sun low in the west.
import * as THREE from 'three';
import { animal, block, frame, house, jar, lamp, olive, cypress, shrub, sprite } from './lib/nt-01-kit.js';
import { rng } from '../engine/util.js';

const MANGER = [0, -19.6];
const WOOD = '#5e4430';

function cliff(ctx) {
  const r = rng(7);
  const add = (x, y, z, sx, sy, sz, color = '#8f7d68') => {
    ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [x, y, z], rotation: [r() * 3, r() * 3, r() * 3], scale: [sx, sy, sz], color, jitter: 0.07 });
  };
  for (let i = 0; i < 16; i++) {
    const x = -16 + i * 2.2 + r.range(-0.6, 0.6);
    if (Math.abs(x) < 3.2) {
      add(x, 5.6, -26.2, 2.2, 1.8, 2.4, '#9a8670');
      continue;
    }
    add(x, 2.6, -24.6 - r.range(0, 1.5), r.range(2.2, 3), r.range(3, 4), r.range(2.2, 3), '#a08a72');
    add(x + r.range(-1, 1), 5.4, -27.5 - r.range(0, 2), r.range(2.2, 3), r.range(2, 2.8), r.range(2.2, 3), '#a8937a');
  }
  for (let i = 0; i < 12; i++) add(-18 + i * 3.3, 7.6, -31 - r() * 3, 3.6, 2.4, 4, '#7f8a5a');
  for (const s of [-1, 1]) ctx.colliders.add({ x: s * 9.5, z: -25.5, w: 13, d: 3.5, bottom: 0, top: 9 });
  // The cave mouth: a dark hollow behind the shed.
  ctx.solid.box(6.4, 4.2, 0.4, { position: [0, 2.1, -25.6], color: '#241a14', jitter: 0.02 });
  ctx.solid.box(0.6, 4.2, 3, { position: [-3.2, 2.1, -24.4], color: '#4a3c30' });
  ctx.solid.box(0.6, 4.2, 3, { position: [3.2, 2.1, -24.4], color: '#4a3c30' });
  ctx.colliders.add({ x: 0, z: -25.6, w: 6.4, d: 1, bottom: 0, top: 9 });
  for (const s of [-1, 1]) olive(ctx, s * 13 + r.range(-1, 1), -29, 3.6);
  cypress(ctx, 16, -28, 8);
}

function stable(ctx) {
  // Plank lean-to on posts in front of the cave.
  for (const [x, z, h] of [[-3.4, -17.4, 2.5], [3.4, -17.4, 2.5], [-3.4, -23.6, 3.4], [3.4, -23.6, 3.4]]) {
    block(ctx, { x, y: 0, z, w: 0.22, h, d: 0.22, color: WOOD });
  }
  const slope = Math.atan2(0.9, 6.2);
  for (let i = 0; i < 9; i++) {
    ctx.solid.box(0.85, 0.1, 6.9, { position: [-3.6 + i * 0.9, 3.05, -20.5], rotation: [-slope, 0, 0], color: i % 2 ? '#6a4d34' : '#5a412c', jitter: 0.06 });
  }
  for (const z of [-17.4, -23.6]) ctx.solid.box(7.4, 0.2, 0.2, { position: [0, z === -17.4 ? 2.55 : 3.45, z], color: WOOD });
  // Straw on the floor and a low rail.
  ctx.solid.add(new THREE.CircleGeometry(4, 9).rotateX(-Math.PI / 2), { position: [0, 0.05, -20.6], scale: [1, 1, 0.8], color: '#b99a52', jitter: 0.12 });
  for (let i = 0; i < 18; i++) {
    const a = ctx.rand() * Math.PI * 2, d = ctx.rand() * 3.4;
    ctx.solid.add(new THREE.ConeGeometry(0.3, 0.25, 5), { position: [Math.cos(a) * d, 0.1, -20.6 + Math.sin(a) * d * 0.8], color: '#c4a55c', jitter: 0.1 });
  }
  block(ctx, { x: -3.4, y: 0.7, z: -20.5, w: 0.12, h: 0.12, d: 6.2, color: WOOD, collide: false });
  // The manger with the swaddled child.
  const [mx, mz] = MANGER;
  for (const sx of [-0.55, 0.55]) for (const sz of [-0.22, 0.22]) ctx.solid.box(0.08, 0.5, 0.08, { position: [mx + sx, 0.25, mz + sz], rotation: [sz * 0.6, 0, sx * 0.3], color: WOOD });
  ctx.solid.add(new THREE.CylinderGeometry(0.4, 0.25, 1.35, 4, 1, false, Math.PI / 4), { position: [mx, 0.62, mz], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 0.75], color: '#6e5038' });
  ctx.solid.box(1.2, 0.08, 0.48, { position: [mx, 0.86, mz], color: '#d8bb6a', jitter: 0.1 });
  ctx.glow.add(new THREE.CapsuleGeometry(0.11, 0.32, 3, 6), { position: [mx + 0.02, 0.98, mz], rotation: [0, 0, Math.PI / 2], color: '#fff2dc', jitter: 0.02 });
  ctx.solid.add(new THREE.IcosahedronGeometry(0.085, 0), { position: [mx - 0.3, 1.0, mz], color: '#b7835e' });
  ctx.colliders.add({ x: mx, z: mz, w: 1.4, d: 0.7, bottom: 0, top: 0.95 });
  sprite(ctx, { position: [mx, 1.05, mz], size: 2.4, color: '#ffe9c0', opacity: 0.55 });
  ctx.effects.ring({ position: [mx, 0.08, mz], radius: 1.3, width: 0.7, color: '#ffdca0', opacity: 0.45 });
  const glow = new THREE.PointLight('#ffe2b0', 12, 10, 1.3);
  glow.position.set(mx, 1.6, mz + 0.4);
  ctx.scene.add(glow);
  // Hanging lantern, animals, feed and jars.
  ctx.solid.box(0.04, 0.5, 0.04, { position: [3.2, 2.2, -17.5], color: '#2a2018' });
  lamp(ctx, { x: 3.1, y: 1.9, z: -17.5, light: 6, distance: 10 });
  animal(ctx, 'oxLying', { x: -2.1, z: -22.2, rot: 0.6 });
  animal(ctx, 'donkey', { x: 2.4, z: -22.4, rot: -0.9 });
  jar(ctx, { x: -2.9, z: -18.3, h: 0.7 });
  ctx.solid.box(0.9, 0.5, 0.6, { position: [2.7, 0.25, -19], color: '#c4a55c', jitter: 0.1 });
}

function town(ctx) {
  const r = rng(52);
  const colors = ['#cdb894', '#c4ad86', '#d6c4a2', '#bca783'];
  // Left side of the street, doors facing +x.
  for (let z = -12; z < 46; z += r.range(7.5, 9)) house(ctx, { x: -11.5, z, rot: Math.PI / 2, w: r.range(6, 7.5), d: 6, h: r.range(2.8, 3.6), color: r.pick(colors), lit: r() < 0.7, upper: r() < 0.4 });
  // The crowded inn at the right, then the rest of the right side.
  house(ctx, { x: 11.5, z: -8, rot: -Math.PI / 2, w: 10, d: 7.5, h: 3.8, color: '#c9b38c', lit: true, upper: true, door: 1.6 });
  for (let z = 4; z < 46; z += r.range(7.5, 9)) house(ctx, { x: 11.5, z, rot: -Math.PI / 2, w: r.range(6, 7.5), d: 6, h: r.range(2.8, 3.6), color: r.pick(colors), lit: r() < 0.7, upper: r() < 0.4 });
  // Outer town and countryside.
  const placed = [];
  for (let tries = 0; placed.length < 40 && tries < 3000; tries++) {
    const x = r.range(-90, 90), z = r.range(-60, 120);
    if (Math.abs(x) < 20 && z > -32) continue;
    if (Math.abs(x) < 24 && z < -20) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 11)) continue;
    placed.push([x, z]);
    house(ctx, { x, z, rot: Math.round(r() * 4) * (Math.PI / 2), w: r.range(5, 8), d: r.range(4.5, 6.5), h: r.range(2.6, 3.4), color: r.pick(colors), lit: r() < 0.5, upper: r() < 0.3 });
  }
  for (let i = 0; i < 70; i++) {
    const x = r.range(-160, 160), z = r.range(-120, 180);
    if (Math.abs(x) < 20 && z > -32) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 6)) continue;
    if (r() < 0.6) olive(ctx, x, z);
    else if (r() < 0.4) cypress(ctx, x, z, r.range(5, 8));
    else shrub(ctx, x, z, r.range(0.5, 1));
  }
  // Travelers' donkeys and baggage along the street.
  for (const [x, z, rot] of [[-5.5, -6, 0.4], [6.2, 2, -2.6], [-6, 14, 1.4], [5.5, 22, -1.6], [-4.8, 30, 3]]) {
    animal(ctx, 'donkey', { x, z, rot });
    const at = frame(x, z, rot);
    for (const s of [-1, 1]) {
      const [bx, bz] = at(s * 0.4, 0);
      ctx.solid.box(0.3, 0.45, 0.6, { position: [bx, ctx.heightAt(x, z) + 1.05, bz], rotation: [0, rot, 0], color: r.pick(['#8a5a3a', '#6e7a5a', '#9a7a4a']) });
    }
  }
  for (const [x, z] of [[7.3, -3.2], [7.6, -12.5], [-7.4, 4], [7.2, 11]]) {
    for (let i = 0; i < 3; i++) ctx.solid.box(r.range(0.5, 0.8), r.range(0.3, 0.5), r.range(0.4, 0.6), { position: [x + r.range(-0.6, 0.6), 0.2, z + r.range(-0.8, 0.8)], rotation: [0, r() * 3, 0], color: r.pick(['#8a5a3a', '#a08060', '#6e5a44']) });
  }
  lamp(ctx, { x: 7.4, y: 2.6, z: -8, light: 8, distance: 12 });
}

export default {
  title: 'Luke 2:1-7: The birth of Jesus',
  seed: 102,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.85, 0.27, 0.32], color: '#ff9c5a', intensity: 2.2 },
  light: { sky: '#9a94c8', ground: '#7a5a44', hemi: 1.45 },
  sky: { top: '#2c3466', horizon: '#f39a62', ground: '#a07060', sunColor: '#ffc080', glow: 1.3 },
  fog: { color: '#a8786a', near: 50, far: 420 },
  clouds: { count: 40, shadow: '#4a3e58', lit: '#ff9a62', rim: '#ffd0a0', distance: [260, 900], altitude: [90, 200], hole: 0.15 },
  mountains: { count: 40, color: '#5a4e58', radius: [420, 650], height: [20, 60], haze: 0.5 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.78 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.45, shadowTint: '#2c2450', highlightTint: '#ffd8b0' },
  shadow: { center: [0, -10], radius: 40 },

  player: { start: [0.3, -11.4], yaw: 0.0, pitch: -0.05, eye: 1.65, speed: 4 },

  terrain: {
    size: 700,
    segments: 140,
    seed: 23,
    hills: 30,
    hillScale: 0.008,
    bumps: 0.2,
    flats: [{ x: 0, z: 8, r: 42, falloff: 30, height: 0 }],
    colors: { ground: '#9a8460', groundAlt: '#8c7a58', grass: '#7a8248', high: '#8e8266', rock: '#857462' },
    patches: [{ x: 0, z: 10, r: 26, color: '#a8916c', strength: 0.6, rough: 0.3 }],
  },

  objects: [],
  scatter: [],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.7,
      hoodChance: 0.45,
    },
    groups: [
      { count: 18, center: [8.6, -8], ring: [1.4, 3.6], arc: [Math.PI / 2, Math.PI * 1.5], spacing: 0.75, face: [8.5, -8], children: 0.15, seed: 31 },
      { count: 70, center: [0, 18], ring: [2.6, 28], spacing: 0.9, face: [0, -20], children: 0.2, seed: 32, avoid: [{ rect: [0, 18, 3.2, 60] }, { rect: [-11.5, 18, 8, 80] }, { rect: [11.5, 18, 8, 80] }] },
      { count: 30, center: [0, 2], ring: [3, 9], arc: [-0.2, Math.PI + 0.2], spacing: 0.9, face: [0, 30], children: 0.2, seed: 33, avoid: [{ rect: [0, 2, 3, 20] }, { rect: [0.5, -7.2, 3, 3] }] },
      { count: 8, center: [-6.5, -9], ring: [0.8, 2.5], spacing: 0.8, face: [-6.5, -9], children: 0.25, seed: 34 },
      { count: 34, center: [0, -10], ring: [4.2, 10], spacing: 1.0, face: [0, 10], children: 0.2, seed: 35, avoid: [{ rect: [0, -10, 6.5, 16] }, { r: 2.5, x: -5.5, z: -6 }, { rect: [0, -20, 9, 9] }] },
      { count: 14, center: [-5.5, -14], ring: [0.6, 3], spacing: 0.8, face: [8, -8], children: 0.3, seed: 36 },
    ],
  },

  figures: [
    { x: -1.05, z: -19.3, y: -0.45, face: [MANGER[0], MANGER[1]], scale: 0.98, robe: '#c9b48c', mantle: '#4c6c9c', skin: '#a8754f', arms: 'out', hood: true },
    { x: 1.25, z: -20.1, face: [MANGER[0], MANGER[1]], scale: 1.04, robe: '#7a5a3e', mantle: '#a0825c', skin: '#9b6a46', arms: 'down', hood: true },
  ],

  custom(ctx) {
    cliff(ctx);
    stable(ctx);
    town(ctx);
    const staffX = 1.65, staffZ = -19.8;
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.035, 2, 5), { position: [staffX, 1, staffZ], rotation: [0, 0, 0.08], color: '#4a3424' });
  },
};
