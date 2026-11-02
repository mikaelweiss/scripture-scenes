// Joshua 6:12-20: the seventh day at Jericho. Seven priests with trumpets of rams' horns go
// before the ark around the city. The people shout, and the wall falls down flat.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { desertTerrain, person, dress, banner, haze } from './lib/ot-19-camp.js';

const CITY = [0, -90];
const R = 52;
const TELL = 7;
const PATH = 72;

const ARMY = {
  robes: ['#6e5a44', '#5e4b3a', '#7a4e36', '#8b6b4a', '#4f4a40', '#6b5a3a', '#94704e'],
  mantles: ['#a0703a', '#8a5a2a', '#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
  mantleChance: 0.8,
  hoodChance: 0.4,
};
const ON_PATH = (a) => [CITY[0] + Math.cos(a) * PATH, CITY[1] + Math.sin(a) * PATH];

function walls(ctx) {
  const r = rng(24);
  const n = 44;
  const seg = (2 * Math.PI * R) / n;
  const mat = new THREE.MeshLambertMaterial({ color: '#c0a07a', flatShading: true });
  const towerMat = new THREE.MeshLambertMaterial({ color: '#b08e68', flatShading: true });
  const geo = new THREE.BoxGeometry(seg + 0.3, 9, 3).translate(0, 4.5, -1.5);
  const towerGeo = new THREE.BoxGeometry(6, 12, 6).translate(0, 6, -3);
  const crenel = new THREE.BoxGeometry(0.9, 0.8, 0.6);
  const falling = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = CITY[0] + Math.cos(a) * R, z = CITY[1] + Math.sin(a) * R;
    const pivot = new THREE.Group();
    pivot.position.set(x, TELL - 0.5, z);
    pivot.rotation.y = Math.atan2(Math.cos(a), Math.sin(a));
    const tower = i % 5 === 0;
    const wall = new THREE.Mesh(tower ? towerGeo : geo, tower ? towerMat : mat);
    wall.castShadow = wall.receiveShadow = true;
    pivot.add(wall);
    const top = tower ? 12 : 9;
    for (let k = -2; k <= 2; k++) {
      const c = new THREE.Mesh(crenel, tower ? towerMat : mat);
      c.position.set(k * (tower ? 1.4 : seg / 5), top + 0.4, tower ? -0.3 : -0.3);
      pivot.add(c);
    }
    ctx.scene.add(pivot);
    // Rahab's house upon the wall stands, with the scarlet line in its window (Joshua 2:18, 6:22).
    const rahab = i === 13;
    if (rahab) {
      const house = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 4).translate(0, 11, -2), new THREE.MeshLambertMaterial({ color: '#c8b08a', flatShading: true }));
      pivot.add(house);
      const cord = new THREE.Mesh(new THREE.BoxGeometry(0.12, 5, 0.12).translate(0.8, 9, 0.05), new THREE.MeshBasicMaterial({ color: '#d0201a' }));
      pivot.add(cord);
      ctx.colliders.add({ x, z, w: seg, d: 3, rot: pivot.rotation.y, bottom: TELL - 1, top: TELL + 15 });
      continue;
    }
    const facing = Math.abs(((a - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    falling.push({ pivot, start: 4 + facing * 0.9 + r.range(0, 0.6), tilt: r.range(1.3, 1.5), twist: r.range(-0.2, 0.2), sink: r.range(1.5, 3) });
    for (let k = 0; k < 4; k++) {
      const d = r.range(2, 9), off = r.range(-seg / 2, seg / 2);
      const sx = x + Math.cos(a) * d - Math.sin(a) * off, sz = z + Math.sin(a) * d + Math.cos(a) * off;
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.4, 1.1), 0), { position: [sx, ctx.heightAt(sx, sz) + 0.2, sz], rotation: [r(), r(), r()], color: '#b8987a' });
    }
  }
  const dust = haze(ctx, { center: CITY, radius: R + 6, count: 90, size: [16, 34], lift: [2, 10], color: '#e4caa4', opacity: 0, seed: 9, drift: 0 });
  for (const s of dust) s.material = s.material.clone();
  const dustRing = dust.map((s) => {
    const a = Math.atan2(s.position.z - CITY[1], s.position.x - CITY[0]);
    const d = R + rng(s.id)() * 14 - 4;
    s.position.set(CITY[0] + Math.cos(a) * d, TELL + 2 + (s.id % 7), CITY[1] + Math.sin(a) * d);
    const facing = Math.abs(((a - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    return { s, start: 4.4 + facing * 0.9, base: s.scale.clone(), y: s.position.y };
  });
  ctx.onFrame((t) => {
    for (const f of falling) {
      const k = Math.min(1, Math.max(0, (t - f.start) / 1.6));
      const e = k * k;
      f.pivot.rotation.x = e * f.tilt;
      f.pivot.rotation.z = e * f.twist;
      f.pivot.position.y = TELL - 0.5 - e * f.sink;
    }
    for (const d of dustRing) {
      const k = Math.max(0, t - d.start);
      const fade = k <= 0 ? 0 : Math.min(1, k * 1.5) * Math.max(0.35, 1 - k / 14);
      d.s.material.opacity = 0.55 * fade;
      d.s.scale.set(d.base.x * (1 + k * 0.12), d.base.y * (1 + k * 0.25), 1);
      d.s.position.y = d.y + k * 0.8;
    }
  });
}

function city(ctx) {
  const r = rng(5);
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (R - 8);
    const x = CITY[0] + Math.cos(a) * d, z = CITY[1] + Math.sin(a) * d;
    const w = r.range(4, 8), dd = r.range(4, 8), h = r.range(3, 6.5);
    const y = ctx.heightAt(x, z) - 0.2;
    ctx.solid.box(w, h, dd, { position: [x, y + h / 2, z], rotation: [0, r() * 0.4, 0], color: r.pick(['#c8ab84', '#b89a74', '#d4bc94', '#a88a66']) });
    ctx.solid.box(w + 0.3, 0.3, dd + 0.3, { position: [x, y + h + 0.1, z], color: '#8a6e50' });
    ctx.solid.box(0.9, 1.6, 0.1, { position: [x, y + 0.8, z + dd / 2 + 0.02], color: '#3a2a1e' });
    ctx.colliders.add({ x, z, w, d: dd, bottom: y, top: y + h });
  }
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2, d = r.range(5, R - 6);
    ctx.builders.tree(ctx, { x: CITY[0] + Math.cos(a) * d, z: CITY[1] + Math.sin(a) * d, kind: 'palm', h: r.range(6, 9), leaf: '#5a7a3a' });
  }
}

function procession(ctx) {
  const r = rng(61);
  const gold = '#e0b040';
  const at = (a) => {
    const [x, z] = ON_PATH(a);
    return { x, z, yaw: a + Math.PI };
  };
  // Seven priests in white with rams' horns, the ark behind them, walking counter-clockwise.
  for (let i = 0; i < 7; i++) {
    const p = at(1.42 - i * 0.032);
    const y = ctx.heightAt(p.x, p.z);
    person(ctx, { ...p, robe: '#ece6d6', mantle: '#e0d8c4', skin: r.pick(['#8a5a3c', '#9b6a46', '#a87652']), arms: [[1.75, 0.12], [1.55, 0.05]] });
    const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
    const horn = new THREE.ConeGeometry(0.09, 0.75, 6).rotateX(Math.PI / 2 + 0.55);
    ctx.solid.add(horn, { position: [p.x + fx * 0.45, y + 1.68, p.z + fz * 0.45], rotation: [0, p.yaw, 0], color: '#d8c8a0', jitter: 0.02 });
  }
  const ark = at(1.42 - 8.5 * 0.032);
  const ay = ctx.heightAt(ark.x, ark.z) + 1.15;
  const rot = [0, ark.yaw, 0];
  ctx.glow.box(0.75, 0.75, 1.25, { position: [ark.x, ay, ark.z], rotation: rot, color: '#c89a30', jitter: 0.02 });
  ctx.glow.box(0.85, 0.08, 1.35, { position: [ark.x, ay + 0.42, ark.z], rotation: rot, color: '#e8c050', jitter: 0.02 });
  for (const s of [-1, 1]) {
    const fx = Math.sin(ark.yaw) * 0.4 * s, fz = Math.cos(ark.yaw) * 0.4 * s;
    ctx.glow.add(new THREE.ConeGeometry(0.16, 0.5, 4), { position: [ark.x + fx, ay + 0.72, ark.z + fz], rotation: [s * 0.5, ark.yaw, 0], color: '#f0cc60', jitter: 0.02 });
    const sx = Math.cos(ark.yaw) * 0.5 * s, sz = -Math.sin(ark.yaw) * 0.5 * s;
    ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 4), { position: [ark.x + sx, ay - 0.15, ark.z + sz], rotation: [Math.PI / 2, ark.yaw, 0], color: gold });
    for (const e of [-1, 1]) {
      const ex = Math.sin(ark.yaw) * 1.7 * e, ez = Math.cos(ark.yaw) * 1.7 * e;
      person(ctx, { x: ark.x + sx * 1.3 + ex, z: ark.z + sz * 1.3 + ez, yaw: ark.yaw, robe: '#ece6d6', skin: '#9b6a46', arms: [[0.9, 0.05], [0.9, 0.05]] });
    }
  }
  ctx.effects.halo({ position: [ark.x, ay + 0.6, ark.z], size: 6, color: '#ffe6a0', opacity: 0.5 });
  // Joshua and the armed men going before the priests, and the rearward after the ark.
  for (let i = 0; i < 26; i++) {
    const before = i < 16;
    const a = before ? 1.42 + 0.06 + (i >> 1) * 0.025 : 1.42 - 10.5 * 0.032 - ((i - 16) >> 1) * 0.025;
    const lane = (i % 2 ? 1 : -1) * 0.9;
    const [x, z] = [CITY[0] + Math.cos(a) * (PATH + lane), CITY[1] + Math.sin(a) * (PATH + lane)];
    person(ctx, { x, z, yaw: a + Math.PI, ...dress(r, ARMY), arms: [[0.5, 0.1], [0.2, 0.1]] });
    ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 4), { position: [x + 0.3, ctx.heightAt(x, z) + 1.3, z], color: '#5a4332' });
  }
}

export default {
  title: 'Joshua 6:12-20: The walls of Jericho',
  seed: 24,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [-0.6, 0.45, 0.4], color: '#ffd8a8', intensity: 2.8 },
  light: { sky: '#a8b8e0', ground: '#9a7a58', hemi: 1.0 },
  sky: { top: '#5a7ab8', horizon: '#ecd0a8', ground: '#c8a07a', sunColor: '#fff0d0', glow: 0.8 },
  fog: { color: '#e0c8a8', near: 120, far: 700 },
  clouds: { count: 24, shadow: '#a89a9a', lit: '#fff0dc', rim: '#ffffff', distance: [400, 1000], altitude: [200, 320], hole: 0.2 },
  mountains: { count: 40, color: '#9a7a5c', radius: [560, 800], height: [40, 120], haze: 0.5 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.38, shadowTint: '#3a3a5a', highlightTint: '#ffeed0' },
  shadow: { center: [0, -60], radius: 90 },

  player: { start: [14, -3], yaw: -0.5, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: desertTerrain({
    seed: 24,
    flats: [{ x: 0, z: -60, r: 160, falloff: 80, height: 0 }, { x: CITY[0], z: CITY[1], r: R + 6, falloff: 22, height: TELL }],
    colors: { ground: '#c4a070', groundAlt: '#b49064', grass: '#8a9a50', high: '#a88460', rock: '#9a7a5a' },
    patches: [{ x: 120, z: 40, r: 60, color: '#7a8a44', strength: 0.6, rough: 0.5 }],
  }),

  scatter: [
    { type: 'tree', count: 40, center: [120, 40], ring: [0, 70], spacing: 7, seed: 4, props: { kind: 'palm', leaf: '#5a7a3a' } },
    { type: 'rock', count: 40, center: CITY, ring: [150, 420], spacing: 14, seed: 3, props: { color: '#a48464' } },
  ],

  crowd: {
    palette: ARMY,
    groups: [
      { count: 1400, center: CITY, ring: [84, 120], arc: [0.2, Math.PI - 0.2], spacing: 1.05, face: CITY, children: 0, seed: 71, avoid: [{ rect: [12, -2, 14, 14] }] },
      { count: 1000, center: CITY, ring: [84, 120], arc: [Math.PI - 0.2, Math.PI * 2 + 0.2], spacing: 1.3, face: CITY, children: 0, seed: 72 },
    ],
  },

  custom(ctx) {
    walls(ctx);
    city(ctx);
    procession(ctx);
    const colors = ['#9a2a24', '#2a4a7a', '#c9a24a', '#3a6a3a', '#7a3a7a', '#d8d0c0'];
    [0.9, 1.2, 1.9, 2.3, 0.4, 2.8].forEach((a, i) => {
      const x = CITY[0] + Math.cos(a) * 104, z = CITY[1] + Math.sin(a) * 104;
      banner(ctx, x, z, colors[i], { h: 6 });
    });
  },
};
