// Exodus 12:21-32: the night of the first Passover in Goshen. Blood of the lamb is struck on every
// lintel and doorpost. Inside, families eat in haste with staffs in hand, ready to leave.
// The street runs east-west. The player stands in it facing a family's open door to the north.
import * as THREE from 'three';
import { person, mudHouse, palm, fire, nightSky, frame } from './lib/ot-13-kit.js';

const MAIN = [0, -7];

function closedDoor(ctx, x, z, rot, w, d, door) {
  const [px, pz] = frame(x, z, rot)(0, d / 2 - 0.2);
  ctx.solid.box(door, 2.1, 0.12, { position: [px, ctx.heightAt(px, pz) + 1.0, pz], rotation: [0, rot, 0], color: '#4a3020' });
}

function street(ctx) {
  const houses = [];
  for (const side of [-1, 1]) {
    for (let i = -4; i <= 4; i++) {
      const x = i * 9 + (side > 0 ? 4.5 : 0);
      if (side < 0 && i === 0) continue;
      const z = side < 0 ? -7 : 8;
      const rot = side < 0 ? 0 : Math.PI;
      const w = 7 + ctx.rand.range(-0.8, 0.8), d = 6, h = ctx.rand.range(2.8, 3.6);
      const lit = Math.abs(i) < 3 && ctx.rand() < 0.5;
      mudHouse(ctx, { x, z, rot, w, d, h, door: 1.2, blood: true, lit: lit ? '#c0783a' : false, color: ctx.rand.pick(['#a88c66', '#9c8260', '#b0946c']) });
      if (!lit) closedDoor(ctx, x, z, rot, w, d, 1.2);
      houses.push([x, z]);
    }
  }
  return houses;
}

function mainHouse(ctx) {
  const [x, z] = MAIN;
  const { y } = mudHouse(ctx, { x, z, w: 9, d: 7.5, h: 3.4, door: 2.0, doorH: 2.4, blood: true, lit: '#8a4a22', color: '#b09470' });
  const light = new THREE.PointLight('#ffb070', 22, 14, 1.3);
  light.position.set(x, y + 2.4, z - 0.8);
  ctx.scene.add(light);
  const spill = new THREE.PointLight('#ffa860', 9, 9, 1.4);
  spill.position.set(x, y + 1.6, z + 4.6);
  ctx.scene.add(spill);
  // table with the roasted lamb, unleavened bread and bitter herbs
  const tz = z - 0.6;
  ctx.solid.box(2.4, 0.08, 1.2, { position: [x, y + 0.8, tz], color: '#6a4a30' });
  for (const [dx, dz] of [[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]]) ctx.solid.box(0.1, 0.8, 0.1, { position: [x + dx, y + 0.4, tz + dz], color: '#5a3e28' });
  ctx.colliders.add({ x, z: tz, w: 2.4, d: 1.2, bottom: y, top: y + 0.85 });
  ctx.solid.add(new THREE.CylinderGeometry(0.42, 0.38, 0.05, 10), { position: [x, y + 0.87, tz], color: '#b08a5a' });
  ctx.solid.add(new THREE.DodecahedronGeometry(0.26, 0), { position: [x, y + 1.0, tz], scale: [1.5, 0.7, 0.9], color: '#7a3e1e' });
  for (const [dx, dz] of [[-0.8, 0.2], [0.75, -0.25], [0.8, 0.25]]) ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 8), { position: [x + dx, y + 0.87, tz + dz], color: '#e0c890' });
  for (const dx of [-0.5, 0.45]) ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 6), { position: [x + dx, y + 0.91, tz + 0.4], color: '#a05a3a' });
  ctx.solid.add(new THREE.ConeGeometry(0.12, 0.1, 6), { position: [x - 0.3, y + 0.9, tz - 0.35], color: '#4f7a34' });
  // oil lamp on the table
  ctx.solid.add(new THREE.SphereGeometry(0.08, 6, 4), { position: [x + 0.4, y + 0.88, tz - 0.3], scale: [1.4, 0.6, 1], color: '#a87a4a' });
  fire(ctx, { x: x + 0.47, z: tz - 0.3, y: y + 0.9, size: 0.1, count: 3, light: 0 });
  // packed bundles and kneading troughs by the wall, ready to carry
  for (let i = 0; i < 4; i++) ctx.solid.add(new THREE.DodecahedronGeometry(0.3, 0), { position: [x - 3.4 + i * 0.6, y + 0.28, z - 2.9], scale: [1, 0.9, 0.8], color: ['#8a6a48', '#6a5a4a', '#a08060', '#7a4e36'][i] });
  ctx.solid.box(0.9, 0.3, 0.5, { position: [x + 3.2, y + 0.15, z - 2.9], color: '#7a5a3a' });
  // the family, girded, shod, staff in hand
  const fam = [
    { x: x - 1.6, z: tz - 0.2, robe: '#7a5a3c', mantle: '#4a5a6a', staff: true, arms: ['down', 'down'], skin: '#9b6a46' },
    { x: x + 1.6, z: tz - 0.1, robe: '#8a4a34', mantle: '#c4b090', hood: true, skin: '#a87652' },
    { x: x - 0.4, z: tz - 1.1, robe: '#6b6f4a', mantle: '#7d5c3e', staff: true, skin: '#8a5a3c', scale: 1.02 },
    { x: x + 0.6, z: tz - 1.1, robe: '#b59a72', hood: true, skin: '#9b6a46', mantle: '#5a3d2b' },
    { x: x - 0.8, z: tz + 0.95, robe: '#a0825c', skin: '#a87652', scale: 0.68, arms: 'forward' },
    { x: x + 0.7, z: tz + 0.95, robe: '#5e4b3a', mantle: '#a34f32', skin: '#a87652', scale: 0.62 },
  ];
  for (const p of fam) person(ctx, { ...p, face: [x, tz], y });
  // hyssop and the basin at the threshold
  const [bx, bz] = [x + 1.6, z + 4.3];
  ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.25, 0.25, 8), { position: [bx, y + 0.13, bz], color: '#8a6a4a' });
  ctx.solid.add(new THREE.CircleGeometry(0.3, 8).rotateX(-Math.PI / 2), { position: [bx, y + 0.26, bz], color: '#5a0a0c' });
  ctx.solid.add(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4), { position: [bx + 0.15, y + 0.3, bz], rotation: [0, 0, -0.6], color: '#6a7a3a' });
  ctx.solid.add(new THREE.IcosahedronGeometry(0.1, 0), { position: [bx + 0.3, y + 0.55, bz], color: '#5a7a3a' });
}

export default {
  title: 'Exodus 12:21-32: The first Passover',
  seed: 12,
  fov: 62,
  exposure: 1.1,

  sun: { direction: [0.35, 0.5, 0.8], color: '#7a94d8', intensity: 1.1 },
  light: { sky: '#4a5a98', ground: '#3a3040', hemi: 1.15 },
  sky: { top: '#060a1e', horizon: '#1e2a4a', ground: '#141420', sunColor: '#8aa0d0', glow: 0.25 },
  fog: { color: '#141a30', near: 30, far: 200 },
  mountains: { count: 30, color: '#141828', radius: [420, 600], height: [20, 50], haze: 0.4 },
  bloom: { strength: 0.75, radius: 0.55, threshold: 0.7 },
  grade: { saturation: 1.05, contrast: 1.1, vignette: 0.5, shadowTint: '#101830', highlightTint: '#ffd6a0' },
  shadow: { center: [0, -2], radius: 40 },

  player: { start: [0.9, 0.9], yaw: 0.06, pitch: 0.0, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 600,
    segments: 120,
    seed: 12,
    hills: 6,
    bumps: 0.12,
    flats: [{ x: 0, z: 0, r: 50, falloff: 30, height: 0 }],
    colors: { ground: '#7a6a52', groundAlt: '#6e5e48', grass: '#5a6040', high: '#7a6a52', rock: '#5a4e40' },
    patches: [{ x: 0, z: 0.5, r: 40, color: '#8a7658', strength: 0.4, rough: 0.3 }],
  },

  scatter: [
    { type: 'tree', count: 30, center: [0, 0], ring: [50, 160], spacing: 10, seed: 3, props: { kind: 'palm', leaf: '#3a4a2a' } },
  ],

  custom(ctx) {
    nightSky(ctx, { count: 1100, moon: [0.35, 0.5, 0.8], moonSize: 26 });
    street(ctx);
    mainHouse(ctx);
    palm(ctx, { x: -7.5, z: -1.5, h: 7, leaf: '#3a4a2a' });
    palm(ctx, { x: 13, z: 2.5, h: 8, leaf: '#3a4a2a' });
    // a tethered donkey loaded for the journey
    const dx = -5.2, dz = -1.4;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.45, 0), { position: [dx, 1.0, dz], scale: [0.8, 0.8, 1.5], color: '#6a6058' });
    ctx.solid.box(0.18, 0.5, 0.4, { position: [dx, 1.35, dz + 0.85], rotation: [0.6, 0, 0], color: '#6a6058' });
    for (const [lx, lz] of [[-0.2, 0.4], [0.2, 0.4], [-0.2, -0.4], [0.2, -0.4]]) ctx.solid.box(0.08, 0.7, 0.08, { position: [dx + lx, 0.35, dz + lz], color: '#4a4038' });
    for (const s of [-1, 1]) ctx.solid.box(0.3, 0.45, 0.6, { position: [dx + s * 0.45, 1.05, dz], color: '#8a6a48' });
    ctx.colliders.add({ x: dx, z: dz, w: 1, d: 1.8, bottom: 0, top: 1.5 });
  },
};
