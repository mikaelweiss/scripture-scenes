// Luke 2:8-20: shepherds keep watch by night and the sky fills with angels.
// The shepherds' fire is near the origin. The angel of the Lord hovers to the north (-z) and the host spreads across the sky beyond.
import * as THREE from 'three';
import { angel, fire, flock, groundGlow, host, house, shrub, starfield, stoneWall } from './lib/nt-01-kit.js';
import { rng } from '../engine/util.js';

const FIRE = [1.5, 2];
const ANGEL = [0, 3.2, -13];
const FOLD = [-12, 6];

function fold(ctx) {
  const pts = Array.from({ length: 15 }, (_, i) => {
    const a = 0.5 + (i / 14) * (Math.PI * 2 - 1);
    return [FOLD[0] + Math.cos(a) * 6, FOLD[1] + Math.sin(a) * 6];
  });
  stoneWall(ctx, pts, { h: 1.1, thick: 0.7, color: '#7d7468' });
  flock(ctx, { center: FOLD, radius: 5, count: 26, seed: 3, lying: 0.6 });
}

function town(ctx) {
  const r = rng(77);
  const cx = -70, cz = -170;
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 34;
    house(ctx, { x: cx + Math.cos(a) * d * 1.4, z: cz + Math.sin(a) * d, rot: Math.round(r() * 4) * (Math.PI / 2), w: r.range(5, 8), d: r.range(4.5, 6.5), h: r.range(2.8, 3.6), color: '#9a8a74', lit: r() < 0.6, upper: r() < 0.4 });
  }
}

function hostPoints() {
  const r = rng(12);
  const pts = [];
  for (let i = 0; i < 220; i++) {
    const a = -Math.PI / 2 + r.range(-1.25, 1.25);
    const d = r.range(45, 170);
    const y = 14 + d * r.range(0.12, 0.42) + r.range(0, 10);
    pts.push([Math.cos(a) * d, y, Math.sin(a) * d - 6]);
  }
  return pts;
}

export default {
  title: 'Luke 2:8-20: Shepherds and angels',
  seed: 103,
  fov: 64,
  exposure: 1.0,

  sun: { direction: [0.55, 0.32, 0.6], color: '#9fb4ea', intensity: 0.55 },
  light: { sky: '#5a6aa8', ground: '#2a2630', hemi: 0.95 },
  sky: { top: '#050a1e', horizon: '#1d2a50', ground: '#0e1220', sunColor: '#cfdcff', glow: 0.6 },
  fog: { color: '#121a34', near: 50, far: 460 },
  clouds: { count: 22, shadow: '#141a30', lit: '#3c4a78', rim: '#8090c0', distance: [320, 900], altitude: [120, 220], hole: 0.2 },
  mountains: { count: 40, color: '#1c2238', radius: [420, 650], height: [20, 70], haze: 0.45 },
  bloom: { strength: 0.85, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.5, shadowTint: '#141c48', highlightTint: '#fff0d0' },
  shadow: { center: [0, -4], radius: 40 },

  player: { start: [6.4, 8], yaw: 0.36, pitch: 0.12, eye: 1.65, speed: 4.2 },

  terrain: {
    size: 800,
    segments: 160,
    seed: 61,
    hills: 30,
    hillScale: 0.007,
    bumps: 0.4,
    flats: [{ x: 0, z: 0, r: 26, falloff: 30, height: 0 }],
    colors: { ground: '#56603a', groundAlt: '#4c5634', grass: '#5e6a3c', high: '#6a6650', rock: '#5c564a' },
    patches: [{ x: FIRE[0], z: FIRE[1], r: 3, color: '#3a3026', strength: 0.8, rough: 0.4 }],
  },

  objects: [],
  scatter: [
    { type: 'rock', count: 26, center: [0, 0], ring: [22, 140], spacing: 10, seed: 5, props: { color: '#6a6458' } },
    { type: 'tree', count: 30, center: [0, 0], ring: [40, 200], spacing: 10, seed: 6, props: { kind: 'broad', leaf: '#4a5a34', h: 4 } },
  ],

  crowd: {
    palette: {
      robes: ['#7a6248', '#8b6b4a', '#6e5a44', '#9a8460', '#5e4b3a'],
      mantles: ['#4a3a2a', '#6e5a3e', '#8a7a5a', '#5a4632', '#c9b48e'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.9,
      hoodChance: 0.6,
    },
    groups: [
      { count: 4, points: [[-0.6, 3.6], [2.8, 4.2], [0.2, 0.2], [3.6, 0.6]], face: [ANGEL[0], ANGEL[2]], children: 0, kneel: 0.6, seed: 41 },
      { count: 3, points: [[-2.4, 2.4], [4.6, 2.8], [1.6, 5.4]], face: [ANGEL[0], ANGEL[2]], children: 0.3, seed: 42 },
    ],
  },

  figures: [],

  effects: [
    { type: 'beam', position: [ANGEL[0], 0, ANGEL[2]], height: 200, radiusBottom: 6, radiusTop: 24, color: '#fff1cf', opacity: 0.14 },
    { type: 'motes', position: [0, 0, -8], radius: 14, height: 22, count: 160, size: 0.06 },
    { type: 'ring', position: [0, 0.1, -6], radius: 12, width: 6, color: '#ffe8b8', opacity: 0.18 },
  ],

  custom(ctx) {
    starfield(ctx, { count: 1800, seed: 4 });
    fold(ctx);
    town(ctx);
    fire(ctx, { x: FIRE[0], z: FIRE[1], size: 0.9, light: 25, smoke: false });
    flock(ctx, { center: [6, -4], radius: 14, count: 48, seed: 8, lying: 0.5, avoid: [[FIRE[0], FIRE[1], 4], [6.4, 8, 5.5]] });
    flock(ctx, { center: [-6, -14], radius: 9, count: 20, seed: 9, lying: 0.5 });
    // Shepherds' crooks and bedrolls.
    for (const [x, z, tilt] of [[-2.9, 2.2, 0.15], [5.1, 2.6, -0.12], [2.1, 5.8, 0.1]]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.035, 1.9, 5), { position: [x, 0.95, z], rotation: [0, 0, tilt], color: '#4a3424' });
      ctx.solid.add(new THREE.TorusGeometry(0.14, 0.025, 4, 8, Math.PI), { position: [x - tilt * 1.9 * 0.5 + 0.14, 1.9, z], color: '#4a3424' });
    }
    for (const [x, z, rot] of [[-0.4, 0.4, 0.4], [4.6, 0.9, -0.6]]) ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.22, 1.3, 7), { position: [x, 0.2, z], rotation: [Math.PI / 2, rot, 0], color: '#7a5a3c' });
    // The angel of the Lord and the glory shining round about.
    angel(ctx, { x: ANGEL[0], y: ANGEL[1], z: ANGEL[2], face: [FIRE[0], FIRE[1]], scale: 2.1, light: 0, halo: 5, glow: 0.35 });
    groundGlow(ctx, { x: 0, z: -6, radius: 22, color: '#ffe6b0', opacity: 0.35 });
    const glory = new THREE.PointLight('#fff0d0', 55, 45, 1.3);
    glory.position.set(0, 1.2, -4);
    ctx.scene.add(glory);
    // The heavenly host.
    host(ctx, { points: hostPoints(), scale: 1.3, face: [FIRE[0], FIRE[1]], glowSize: 5, glowOpacity: 0.32 });
    for (let i = 0; i < 26; i++) {
      const r = ctx.rand;
      const x = r.range(-60, 60), z = r.range(-60, 50);
      if (Math.hypot(x, z) < 22) continue;
      shrub(ctx, x, z, r.range(0.5, 1), '#3e4a2c');
    }
  },
};
