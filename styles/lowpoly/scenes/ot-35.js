// 2 Kings 6:15-17: early morning at Dothan. A Syrian host with horses and chariots compasses the city, and
// when the young man's eyes are opened the hills behind them are full of horses and chariots of fire.
// The player stands with Elisha on the north gate tower looking out. -z is north.
import * as THREE from 'three';
import { figure, glowMaterial, teamGeometry, chariotGeometry, horseGeometry, instances } from './lib/ot-31-kit.js';
import { rng } from '../engine/util.js';

const CITY = [0, 20];
const TELL = 6;
const GATE = [0, -10];
const stone = '#b09a7a';

const army = {
  robes: ['#7a3a2a', '#8e2c2a', '#5a4a3a', '#6a5a40', '#9a7a4a', '#4a3a3a'],
  mantles: ['#b08a4a', '#6a6a72', '#8a6a3a', '#3a2a2a', '#a07040'],
  skins: ['#9b6a46', '#a87652', '#8a5a3c'],
  mantleChance: 0.9,
  hoodChance: 0.05,
};

function city(ctx) {
  const { solid } = ctx;
  const r = rng(35);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const x = CITY[0] + Math.cos(a) * 30, z = CITY[1] + Math.sin(a) * 30;
    if (Math.abs(x - GATE[0]) < 5 && z < 0) continue;
    ctx.builders.wall(ctx, { x, z, rot: -a, len: 7.6, h: 4, thick: 1.4, color: stone, damage: 0 });
  }
  const [gx, gz] = GATE;
  const top = TELL + 3.2;
  solid.box(9, 3.4, 6, { position: [gx, TELL + 1.5, gz], color: '#a89070' });
  ctx.colliders.add({ x: gx, z: gz, w: 9, d: 6, bottom: TELL - 1, top });
  for (let i = 0; i < 8; i++) {
    if (i % 2) continue;
    for (const [lx, lz] of [[-4.2 + i * 1.2, -2.7]]) solid.box(0.7, 0.45, 0.5, { position: [gx + lx, top + 0.22, gz + lz], color: '#a89070' });
  }
  for (let i = 0; i < 10; i++) solid.box(2.4, 0.32, 0.6, { position: [gx + 3, TELL + 0.16 + i * 0.32, gz + 6.2 - i * 0.6], color: '#9a8466' });
  for (let i = 0; i < 10; i++) ctx.colliders.add({ x: gx + 3, z: gz + 6.2 - i * 0.6, w: 2.4, d: 0.62, bottom: TELL - 1, top: TELL + 0.32 * (i + 1) });
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2, d = r.range(6, 25);
    const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d;
    if (Math.abs(x) < 4 && z < 4) continue;
    const w = r.range(4, 7), dd = r.range(4, 6), h = r.range(2.5, 4);
    const y = ctx.heightAt(x, z) - 0.1;
    solid.box(w, h, dd, { position: [x, y + h / 2, z], rotation: [0, a, 0], color: r.pick(['#c4ae8a', '#b8a07c', '#a8916e']) });
    solid.box(w + 0.3, 0.25, dd + 0.3, { position: [x, y + h + 0.1, z], rotation: [0, a, 0], color: '#7a6448' });
    ctx.colliders.add({ x, z, w, d: dd, rot: a, bottom: y, top: y + h });
  }
}

function syrianHost(ctx) {
  const r = rng(36);
  const teams = [];
  for (let i = 0; i < 46; i++) {
    const a = -Math.PI / 2 + r.range(-1.6, 1.6), d = r.range(58, 92);
    const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d;
    teams.push({ x, z, y: ctx.heightAt(x, z), yaw: Math.atan2(CITY[0] - x, CITY[1] - z) + r.range(-0.2, 0.2) });
  }
  instances(ctx, chariotGeometry(), new THREE.MeshLambertMaterial({ color: '#6a4428', flatShading: true }), teams);
  const horses = teams.flatMap((t) => [-1, 1].map((side) => ({
    x: t.x + side * 0.42 * Math.cos(t.yaw) + 3.4 * Math.sin(t.yaw), y: t.y, z: t.z - side * 0.42 * Math.sin(t.yaw) + 3.4 * Math.cos(t.yaw), yaw: t.yaw,
    color: r.pick(['#5a3a24', '#3a2a20', '#7a5a3a', '#c8b8a0']),
  })));
  instances(ctx, horseGeometry(0), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), horses);
  for (let i = 0; i < 34; i++) {
    const a = -Math.PI / 2 + r.range(-1.7, 1.7), d = r.range(45, 85);
    const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d;
    const y = ctx.heightAt(x, z);
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, 5, 4), { position: [x, y + 2.5, z], color: '#3a2a1e' });
    ctx.solid.box(0.05, 1.2, 1.6, { position: [x, y + 4.3, z + 0.8], rotation: [0, r.range(-0.4, 0.4), 0], color: r.pick(['#a82a24', '#2a2a3a', '#c8a03a', '#7a1e2e']) });
  }
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI / 2 + r.range(-1.4, 1.4), d = r.range(95, 115);
    const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d;
    const y = ctx.heightAt(x, z);
    ctx.solid.add(new THREE.ConeGeometry(2.4, 2.6, 4), { position: [x, y + 1.3, z], rotation: [0, r() * 3, 0], color: r.pick(['#6a5440', '#5a4a3a', '#7a6248']) });
  }
}

function hostsOfFire(ctx) {
  const r = rng(37);
  const list = [];
  for (let i = 0; i < 200; i++) {
    const a = -Math.PI / 2 + r.range(-2.2, 2.2), d = r.range(130, 280);
    const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d;
    list.push({ x, z, y: ctx.heightAt(x, z) + r.range(0, 4), yaw: Math.atan2(CITY[0] - x, CITY[1] - z) + r.range(-0.4, 0.4), scale: r.range(2.4, 3.4), pitch: r.range(-0.15, 0.05) });
  }
  const team = teamGeometry({ horses: 2, gallop: 0.8 });
  const core = instances(ctx, team, glowMaterial('#ff7a20', 1.5), list, { shadow: false });
  const halo = instances(ctx, team, glowMaterial('#ffd060', 1.2, { transparent: true, opacity: 0.35, depthWrite: false }), list.map((p) => ({ ...p, scale: p.scale * 1.15 })), { shadow: false });
  const flame = new THREE.ConeGeometry(0.6, 3, 4).translate(0, 1.5, 0);
  const tongues = [];
  for (const p of list) for (let k = 0; k < 3; k++) tongues.push({ x: p.x + r.range(-2, 2), z: p.z + r.range(-2, 2), y: p.y + r.range(0, 2), yaw: r() * 3, scale: r.range(0.8, 1.8) });
  const flames = instances(ctx, flame, glowMaterial('#ffb040', 1.7), tongues, { shadow: false });
  ctx.onFrame((t) => {
    const k = 0.92 + 0.08 * Math.sin(t * 9) * Math.sin(t * 5.3);
    core.material.color.setRGB(1.5 * k, 0.72 * k, 0.19 * k);
    flames.material.color.setRGB(1.7 * k, 1.2 * k, 0.4 * k);
    halo.material.opacity = 0.3 + 0.1 * Math.sin(t * 3);
  });
  for (let i = 0; i < 12; i++) {
    const p = list[Math.floor(r() * list.length)];
    ctx.effects.halo({ position: [p.x, p.y + 6, p.z], size: 60, opacity: 0.35, color: '#ff9a40' });
  }
}

export default {
  title: '2 Kings 6:15-17: The mountain full of chariots',
  seed: 35,
  fov: 60,
  exposure: 0.95,

  sun: { direction: [0.92, 0.14, -0.1], color: '#ffb890', intensity: 2.3 },
  light: { sky: '#7a88c0', ground: '#5a4636', hemi: 0.85 },
  sky: { top: '#24305e', horizon: '#eea488', ground: '#a0786a', sunColor: '#ffd0a0', glow: 1.2 },
  fog: { color: '#a48078', near: 120, far: 640 },
  clouds: { count: 60, shadow: '#3a3450', lit: '#f0a080', rim: '#ffe0c0', distance: [250, 900], altitude: [100, 240], hole: 0.3, seed: 35 },
  mountains: { count: 40, color: '#4e4a52', radius: [520, 760], height: [50, 120], haze: 0.5 },
  bloom: { strength: 0.8, radius: 0.65, threshold: 0.78 },
  grade: { saturation: 1.12, contrast: 1.08, vignette: 0.42, shadowTint: '#2a2858', highlightTint: '#ffd8b0' },
  shadow: { center: [0, -30], radius: 90 },

  player: { start: [0.4, -7.6], yaw: 0.02, pitch: -0.05, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 35,
    hills: 120,
    hillScale: 0.008,
    bumps: 0.4,
    flats: [
      { x: 0, z: 0, r: 105, falloff: 50, height: 0 },
      { x: CITY[0], z: CITY[1], r: 33, falloff: 26, height: TELL },
    ],
    colors: { ground: '#9a8460', groundAlt: '#867050', grass: '#7a7a40', high: '#7e7258', rock: '#6e6252' },
    patches: [{ x: CITY[0], z: CITY[1], r: 34, color: '#b29c78', strength: 0.6, rough: 0.3 }],
  },

  scatter: [
    { type: 'tree', count: 40, center: CITY, ring: [40, 120], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#5a6e36', h: 5 }, avoid: [{ rect: [0, -40, 140, 70] }] },
    { type: 'rock', count: 40, center: CITY, ring: [60, 300], spacing: 10, seed: 5, props: { color: '#857462' } },
    { type: 'tree', count: 80, center: CITY, ring: [130, 320], spacing: 9, seed: 6, props: { leaf: '#4e6234' } },
  ],

  crowd: {
    palette: army,
    groups: [
      { count: 1500, center: CITY, ring: [50, 96], arc: [-Math.PI / 2 - 1.7, -Math.PI / 2 + 1.7], spacing: 1.25, face: CITY, children: 0, seed: 35 },
      { count: 600, center: CITY, ring: [55, 90], arc: [0.3, Math.PI - 0.3], spacing: 1.4, face: CITY, children: 0, seed: 36 },
    ],
  },

  effects: [
    { type: 'sunShafts', center: [60, -60], count: 6, spread: 90, length: 500, width: [10, 24], opacity: 0.06 },
    { type: 'smoke', position: [-40, 0, -70], count: 8, height: 20, size: 1, color: '#9a8a80' },
    { type: 'smoke', position: [30, 0, -75], count: 8, height: 22, size: 1, color: '#9a8a80' },
  ],

  custom(ctx) {
    city(ctx);
    syrianHost(ctx);
    hostsOfFire(ctx);
    const top = TELL + 3.2;
    figure(ctx, { x: -1.8, z: -11.8, y: top, yaw: Math.PI + 0.1, robe: '#6b4f33', mantle: '#3e2f22', skin: '#9b6a46', arms: 'pray', scale: 1.04 });
    figure(ctx, { x: 1.9, z: -11.6, y: top, yaw: Math.PI - 0.15, robe: '#a08060', skin: '#a87652', left: 'down', right: 'forward', scale: 0.95 });
  },
};
