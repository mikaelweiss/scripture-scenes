// Nehemiah 4:16-18: the wall of Jerusalem rising course by course. Builders work with a sword girded at
// their side, half the servants stand behind them holding spears, and the trumpeter waits beside
// Nehemiah. The wall runs east-west; the player stands inside the city to the south. -z is north.
import * as THREE from 'three';
import { figure, instances } from './lib/ot-31-kit.js';
import { rng } from '../engine/util.js';

const WALL_Z = (x) => -14 + x * 0.12 + Math.sin(x * 0.03) * 4;
const WALL_X = [-110, 110];
const THICK = 2.6;
const GATE_X = -18;
const NEHEMIAH = [10, WALL_Z(10) + 0.4];
const stone = '#c9b48e';

const heightAt = (x) => {
  if (Math.abs(x - GATE_X) < 2.6) return 0;
  if (Math.abs(x - 34) < 4 || Math.abs(x + 62) < 3) return 1;
  return 3.6 + Math.sin(x * 0.11) * 1.2 + Math.sin(x * 0.37 + 1) * 0.7;
};

const r = rng(361);
const along = (x, off = 0) => [x, WALL_Z(x) + off];
const builders = [];
for (let x = WALL_X[0] + 4; x < WALL_X[1] - 4; x += r.range(2, 4.5)) {
  if (Math.abs(x - GATE_X) < 4 || Math.abs(x - NEHEMIAH[0] - 0.7) < 2.6) continue;
  builders.push(along(x + r.range(-0.4, 0.4), r.range(-0.6, 0.6)));
}
const guards = [];
for (let x = -70; x < 70; x += r.range(1.6, 3)) guards.push(along(x, r.range(5.5, 8)));
const carriers = [];
for (let x = -70; x < 70; x += r.range(2.5, 5)) carriers.push(along(x, r.range(2, 4.5)));

function wall(ctx) {
  const { solid } = ctx;
  const rr = rng(362);
  for (let x = WALL_X[0]; x < WALL_X[1]; x += 2) {
    const z = WALL_Z(x + 1);
    const yaw = -Math.atan(0.12 + Math.cos((x + 1) * 0.03) * 0.12);
    const h = heightAt(x + 1);
    const g = ctx.heightAt(x + 1, z) - 0.3;
    if (h < 0.5) continue;
    const rows = Math.ceil(h / 0.75);
    for (let row = 0; row < rows; row++) {
      const hh = Math.min(0.75, h - row * 0.75);
      let lx = -1 + (row % 2) * 0.5;
      while (lx < 1) {
        const len = Math.min(1 - lx, rr.range(0.7, 1.3));
        const cx = x + 1 + (lx + len / 2) * Math.cos(yaw), cz = z - (lx + len / 2) * Math.sin(yaw);
        solid.box(len - 0.06, hh - 0.05, THICK, { position: [cx, g + row * 0.75 + hh / 2, cz], rotation: [0, yaw, 0], color: row === rows - 1 && rr() < 0.4 ? '#d8c6a0' : stone, jitter: 0.08 });
        lx += len;
      }
    }
    ctx.colliders.add({ x: x + 1, z, w: 2, d: THICK, rot: yaw, bottom: g, top: g + h });
    if (rr() < 0.25) solid.box(rr.range(0.6, 1.2), 0.6, rr.range(0.6, 1), { position: [x + 1 + rr.range(-0.6, 0.6), g + h + 0.3, z + rr.range(-0.6, 0.6)], rotation: [0, rr() * 3, 0], color: '#d0bc96' });
  }
  const gz = WALL_Z(GATE_X);
  for (const side of [-1, 1]) {
    const px = GATE_X + side * 2.8;
    const y = ctx.heightAt(px, gz);
    solid.box(1.6, 7, 3.4, { position: [px, y + 3.5, gz], color: '#bfa882' });
    ctx.colliders.add({ x: px, z: gz, w: 1.6, d: 3.4, bottom: y, top: y + 7 });
    solid.box(0.4, 3.8, 1.8, { position: [GATE_X + side * 1.4, y + 1.9, gz + 2.2], rotation: [0, side * 0.6, 0.12 * side], color: '#2a2018' });
  }
  solid.box(6, 0.5, 0.5, { position: [GATE_X, ctx.heightAt(GATE_X, gz) + 6.2, gz], color: '#6a4a2e' });
}

function scaffolds(ctx) {
  const rr = rng(363);
  for (const x of [-48, -30, -6, 14, 26, 48, 70]) {
    const z = WALL_Z(x) + THICK / 2 + 1.2;
    const y = ctx.heightAt(x, z);
    const h = heightAt(x) + 1.6;
    for (const dx of [-1.5, 1.5]) for (const dz of [-0.5, 0.7]) ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.08, h, 5), { position: [x + dx, y + h / 2, z + dz], color: '#6a4a30' });
    for (const lvl of [h * 0.45, h - 0.4]) ctx.solid.box(3.6, 0.1, 1.5, { position: [x, y + lvl, z + 0.1], color: '#8a6a44' });
    ctx.colliders.add({ x, z: z + 0.1, w: 3.6, d: 1.5, bottom: y + h - 0.6, top: y + h - 0.35 });
    ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.04, h * 1.2, 4), { position: [x + 2.2, y + h * 0.55, z + 1], rotation: [0.3, 0, -0.2], color: '#7a5a38' });
    for (let k = 0; k < 4; k++) ctx.solid.box(0.9, 0.5, 0.7, { position: [x + rr.range(-3, 3), ctx.heightAt(x, z + 2) + 0.25, z + 2 + rr.range(0, 1.5)], rotation: [0, rr() * 3, 0], color: stone });
  }
}

function weapons(ctx) {
  const spear = new THREE.CylinderGeometry(0.025, 0.03, 2.6, 4).translate(0, 1.3, 0);
  const tip = new THREE.ConeGeometry(0.06, 0.28, 4).translate(0, 2.74, 0);
  const shield = new THREE.CylinderGeometry(0.34, 0.34, 0.06, 8).rotateX(Math.PI / 2).translate(-0.3, 1.05, 0.16);
  const guardsAt = guards.map(([x, z]) => {
    const yaw = Math.atan2(0, -1) + r.range(-0.3, 0.3);
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { x: x + 0.3 * c, z: z - 0.3 * s + 0.12 * c, y: ctx.heightAt(x, z), yaw };
  });
  instances(ctx, spear, new THREE.MeshLambertMaterial({ color: '#6a4a30' }), guardsAt);
  instances(ctx, tip, new THREE.MeshLambertMaterial({ color: '#b8b8c0' }), guardsAt);
  instances(ctx, shield, new THREE.MeshLambertMaterial({ color: '#8a5a32', flatShading: true }), guards.map(([x, z]) => ({ x, z, y: ctx.heightAt(x, z), yaw: Math.PI })));
  const sword = new THREE.BoxGeometry(0.05, 0.75, 0.08).rotateZ(0.25).translate(0.26, 0.62, 0.05);
  instances(ctx, sword, new THREE.MeshLambertMaterial({ color: '#8a8a92' }), carriers.map(([x, z]) => ({ x, z, y: ctx.heightAt(x, z), yaw: Math.atan2(0, -1) })));
}

export default {
  title: 'Nehemiah 4:16-18: Nehemiah rebuilds the walls',
  seed: 36,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.6, 0.45, 0.55], color: '#ffd8a8', intensity: 2.7 },
  light: { sky: '#8aa0d0', ground: '#6a5440', hemi: 1.0 },
  sky: { top: '#3a5c98', horizon: '#f0c89a', ground: '#c0a080', sunColor: '#fff0d0', glow: 1 },
  fog: { color: '#d4b898', near: 90, far: 620 },
  clouds: { count: 40, shadow: '#8a7a80', lit: '#ffe4c0', rim: '#fff4e0', distance: [260, 900], altitude: [110, 240], hole: 0.2, seed: 36 },
  mountains: { count: 40, color: '#8a7a68', radius: [500, 740], height: [40, 100], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.36, shadowTint: '#2e2a50', highlightTint: '#ffe8c8' },
  shadow: { center: [0, -6], radius: 70 },

  player: { start: [15, 5], yaw: 0.3, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 36,
    hills: 60,
    bumps: 0.35,
    flats: [
      { x: 0, z: 30, r: 90, falloff: 40, height: 0 },
      { x: 0, z: -110, r: 60, falloff: 80, height: -18 },
    ],
    colors: { ground: '#b09a74', groundAlt: '#a08a66', grass: '#8a8a52', high: '#a89676', rock: '#8a7a64' },
    patches: [{ x: 0, z: 0, r: 30, color: '#c4b08a', strength: 0.4, rough: 0.6 }],
  },

  objects: [
    { type: 'rubble', x: 34, z: WALL_Z(34) + 2, radius: 4, count: 20, size: [0.3, 0.7], color: stone },
    { type: 'rubble', x: -62, z: WALL_Z(-62) + 2, radius: 4, count: 18, size: [0.3, 0.7], color: stone },
    { type: 'rubble', x: GATE_X, z: WALL_Z(GATE_X) + 5, radius: 3, count: 10, size: [0.2, 0.5], color: '#3a3028' },
  ],

  scatter: [
    { type: 'ruinedHouse', count: 22, center: [0, 40], ring: [26, 90], spacing: 14, seed: 4, props: { color: '#c0aa84', damage: 0.6 }, avoid: [{ rect: [10, 22, 30, 24] }] },
    { type: 'rubble', count: 26, center: [0, 30], ring: [10, 70], seed: 5, props: { color: stone, count: 6, radius: 2 } },
    { type: 'tree', count: 50, center: [0, -80], ring: [30, 200], spacing: 8, seed: 6, props: { kind: 'broad', leaf: '#6a7a40' }, avoid: [{ rect: [0, 70, 300, 150] }] },
    { type: 'rock', count: 30, center: [0, -80], ring: [30, 220], spacing: 10, seed: 7, props: { color: '#a08a6a' }, avoid: [{ rect: [0, 70, 300, 150] }] },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.4,
      hoodChance: 0.15,
    },
    groups: [
      { count: builders.length, points: builders, onStructures: true, children: 0, seed: 36, face: [0, -200] },
      { count: carriers.length, points: carriers, children: 0, seed: 37, face: [0, -200] },
      {
        count: guards.length, points: guards, children: 0, seed: 38, face: [0, -400],
        palette: { robes: ['#5a4a3a', '#6a3a2a', '#4a4a52', '#7a5a3a'], mantles: ['#8a7a6a', '#6a6a72', '#a08060'], skins: ['#9b6a46', '#a87652'], mantleChance: 0.9, hoodChance: 0 },
      },
      { count: 80, center: [0, 34], ring: [12, 50], spacing: 1.5, children: 0.25, seed: 39, face: [0, -14], avoid: [{ rect: [15, 12, 8, 20] }] },
    ],
  },

  custom(ctx) {
    wall(ctx);
    scaffolds(ctx);
    weapons(ctx);
    const [nx, nz] = NEHEMIAH;
    figure(ctx, { x: nx, z: nz, face: [nx - 20, nz + 20], robe: '#3a4a7a', mantle: '#c8a050', skin: '#a87652', left: 'down', right: 'out', scale: 1.04 });
    figure(ctx, { x: nx + 1.4, z: nz - 0.3, face: [nx + 10, nz - 20], robe: '#8a3a2a', skin: '#9b6a46', left: [0.3, 2.2], right: [0.3, 2.2], holds: { length: 0.8, color: '#e8d8b0', radius: 0.06, tip: { size: 0.12, color: '#e8d8b0' } } });
  },
};
