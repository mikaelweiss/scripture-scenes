// D&C 76: In the John Johnson home in Hiram, Ohio, February 1832, Joseph Smith and Sidney Rigdon see the vision
// of the Son on the right hand of God and the kingdoms of glory. The room's north wall opens onto the vision:
// the Father and Son on a cloud with worshipping angels, then the glory of the sun, the moon, and the stars.
import * as THREE from 'three';
import { crowd, person, period, box, light, candle, softGlow } from './lib/dc-01-kit.js';
import { rng } from '../engine/util.js';

const W = 6.4, D = 5.2, H = 2.8;
const ROOM = [0, 6];
const THRONE = [0, -19];
const SUN = [-125, 45, -300];
const MOON = [-190, 20, -280];
const STARS = [125, 58, -330];

function room(ctx) {
  const [cx, cz] = ROOM;
  const plaster = '#e6dece', wood = '#7a5a40';
  const n = cz - D / 2, s = cz + D / 2, w = cx - W / 2, e = cx + W / 2;
  box(ctx, { x: cx, y: -0.1, z: cz, w: W + 0.4, h: 0.1, d: D + 0.4, color: '#8a6648', collide: false });
  for (let i = 0; i < 11; i++) ctx.solid.box(0.02, 0.012, D, { position: [w + 0.3 + i * 0.58, 0.006, cz], color: '#5e4632', jitter: 0 });
  box(ctx, { x: cx, y: 0, z: s, w: W, h: H, d: 0.2, color: plaster });
  box(ctx, { x: w, y: 0, z: cz, w: 0.2, h: H, d: D, color: plaster });
  box(ctx, { x: e, y: 0, z: cz + 1.2, w: 0.2, h: H, d: D - 2.4, color: plaster });
  box(ctx, { x: e, y: 0, z: n + 0.6, w: 0.2, h: H, d: 1.2, color: plaster });
  box(ctx, { x: e, y: 0, z: n + 1.8, w: 0.2, h: 0.9, d: 1.2, color: plaster });
  box(ctx, { x: e, y: 1.9, z: n + 1.8, w: 0.2, h: 0.9, d: 1.2, color: plaster });
  ctx.glow.box(0.04, 1.0, 1.2, { position: [e, 1.4, n + 1.8], color: '#b8c4e8' });
  for (const [x, z, ww, dd] of [[cx, s - 0.11, W - 0.2, 0.03], [w + 0.11, cz, 0.03, D], [e - 0.11, cz, 0.03, D]]) ctx.solid.box(ww, 0.9, dd, { position: [x, 0.45, z], color: wood, jitter: 0.03 });
  for (const [x, z, ww, dd] of [[cx, s - 0.12, W - 0.2, 0.05], [w + 0.12, cz, 0.05, D], [e - 0.12, cz, 0.05, D]]) ctx.solid.box(ww, 0.06, dd, { position: [x, 0.92, z], color: '#5a4030', jitter: 0 });
  // Ceiling ends in a ragged edge where the vision opens.
  ctx.solid.box(W + 0.4, 0.14, D - 1.2, { position: [cx, H + 0.07, cz + 0.6], color: '#d8d0c0' });
  for (let i = 0; i < 4; i++) ctx.solid.box(0.18, 0.18, D - 1.2, { position: [w + 0.8 + i * 1.6, H - 0.09, cz + 0.6], color: '#6a4c34' });
  // The dissolving north wall: fragments of plaster drifting into light.
  const r = rng(76);
  for (let i = 0; i < 7; i++) {
    const x = r.range(w, e), y = r.range(0.2, H), z = n - r.range(0, 3) * (y / H + 0.3);
    ctx.glow.box(r.range(0.08, 0.2), r.range(0.08, 0.2), 0.03, { position: [x, y + r.range(0, 1.5), z], rotation: [r() * 3, r() * 3, 0], color: r.pick(['#fff6e0', '#e8e4f8', '#ffe8c0']) });
  }
  for (const x of [w, e]) ctx.glow.box(0.12, H + 0.2, 0.12, { position: [x, H / 2, n], color: '#fff3d8' });
  // Furniture: a table with a candle and papers, chairs for Joseph and Sidney.
  box(ctx, { x: w + 0.7, z: s - 1.0, w: 0.9, h: 0.76, d: 1.2, color: '#6a4a32' });
  candle(ctx, { x: w + 0.7, y: 0.76, z: s - 1.3 });
  ctx.solid.box(0.3, 0.01, 0.4, { position: [w + 0.65, 0.77, s - 0.8], color: '#f2ead8', jitter: 0 });
  ctx.solid.box(0.24, 0.05, 0.3, { position: [w + 0.8, 0.79, s - 0.7], color: '#3a2a22' });
  for (const x of [-0.6, 0.6]) {
    const z = cz - 0.3;
    ctx.solid.box(0.5, 0.05, 0.5, { position: [x, 0.46, z], color: '#5e4430' });
    ctx.solid.box(0.5, 0.6, 0.05, { position: [x, 0.78, z + 0.24], color: '#5e4430' });
    for (const [dx, dz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) ctx.solid.box(0.04, 0.46, 0.04, { position: [x + dx, 0.23, z + dz], color: '#5e4430' });
  }
  light(ctx, { position: [cx, 1.4, n + 0.8], color: "#fff0d0", intensity: 3, distance: 8 });
  light(ctx, { position: [w + 0.7, 1.2, s - 1.3], color: '#ffc880', intensity: 1.5, distance: 4 });
}

function glories(ctx) {
  const ball = (pos, radius, color, detail = 1) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, detail), new THREE.MeshBasicMaterial({ color, toneMapped: false, fog: false }));
    m.position.set(...pos);
    ctx.scene.add(m);
    return m;
  };
  ball(SUN, 22, "#ffd870", 2);
  softGlow(ctx, { position: SUN, size: 120, color: "#ffe6a0", opacity: 0.2 });
  softGlow(ctx, { position: SUN, size: 70, color: "#fffbe8", opacity: 0.28 });
  const moon = ball(MOON, 20, "#9fb0d8", 1);
  moon.material.color.multiplyScalar(0.9);
  softGlow(ctx, { position: MOON, size: 110, color: '#a8bce8', opacity: 0.45 });

  const r = rng(12);
  const star = [], starCol = [];
  for (let i = 0; i < 1400; i++) {
    const v = new THREE.Vector3(r.range(-1, 1), r.range(-0.15, 1), r.range(-1, 1)).normalize().multiplyScalar(900);
    star.push(v.x, v.y, v.z);
    const c = new THREE.Color(r.pick(['#ffffff', '#dfe6ff', '#fff2d8']));
    starCol.push(c.r, c.g, c.b);
  }
  for (let i = 0; i < 500; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 70;
    star.push(STARS[0] + Math.cos(a) * d * 1.4, STARS[1] + Math.sin(a) * d * 0.7 + r.range(-10, 10), STARS[2] + r.range(-30, 30));
    starCol.push(1, 0.97, 0.9);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(star, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(starCol, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false, toneMapped: false }));
  ctx.scene.add(pts);
  softGlow(ctx, { position: STARS, size: 160, color: '#8a9ad8', opacity: 0.25 });

  // Cloud stair rising toward the throne.
  for (let i = 0; i < 9; i++) {
    const z = -1 - i * 1.6, y = ctx.heightAt(0, z);
    ctx.solid.add(new THREE.IcosahedronGeometry(1, 0), { position: [r.range(-3, 3), y + 0.2, z], scale: [r.range(2.5, 4.5), 0.8, r.range(1.5, 2.2)], rotation: [0, r() * 3, 0], color: '#eef0fa', jitter: 0.04 });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.solid.add(new THREE.IcosahedronGeometry(1, 0), { position: [THRONE[0] + Math.cos(a) * 4.5, throneY + 0.2, THRONE[1] + Math.sin(a) * 3], scale: [r.range(2.5, 3.5), 0.9, r.range(2, 3)], rotation: [0, r() * 3, 0], color: '#fbf8ff', jitter: 0.03 });
  }
}

const throneY = 3.2;

export default {
  title: 'D&C 76: The Vision',
  seed: 76,
  fov: 64,
  exposure: 1.0,

  sun: { direction: [-0.416, 0.15, -1], color: '#ffe8c0', intensity: 2.2 },
  light: { sky: '#b4bef0', ground: '#c8b8a0', hemi: 1.35 },
  sky: { top: '#070b24', horizon: '#3a3f78', ground: '#a8a8d0', sunColor: "#fff0c0", glow: 0.35 },
  fog: { color: "#3a3f78", near: 160, far: 1100 },
  clouds: { count: 50, shadow: '#5a5f98', lit: '#f6eeff', rim: '#ffffff', distance: [420, 900], altitude: [10, 120], hole: 0.3 },
  bloom: { strength: 0.8, radius: 0.7, threshold: 0.7 },
  grade: { saturation: 1.05, contrast: 1.05, vignette: 0.5, shadowTint: '#28285a', highlightTint: '#fff2d8' },
  shadow: { center: [0, -20], radius: 80 },

  player: { start: [-1.1, 8.1], yaw: -0.02, pitch: 0.13, eye: 1.65, speed: 4 },

  terrain: {
    size: 1200,
    segments: 160,
    seed: 76,
    hills: 14,
    hillScale: 0.01,
    bumps: 0.9,
    flats: [
      { x: ROOM[0], z: ROOM[1], r: 7, falloff: 6, height: -0.12 },
      { x: THRONE[0], z: THRONE[1], r: 7, falloff: 9, height: throneY },
    ],
    colors: { ground: '#d8dcf0', groundAlt: '#c4cae6', grass: '#e2e4f4', high: '#f4f2fa', rock: '#b4bcdc' },
    patches: [{ x: THRONE[0], z: THRONE[1], r: 24, color: '#fff6e0', strength: 0.6, rough: 0.3 }],
  },

  objects: [],
  scatter: [],

  crowd: {
    palette: { robes: ['#fbf8f0', '#f4f0e6', '#fffdf6'], mantles: ['#f0eadc', '#fff8e8'], skins: ['#f6e6cc', '#f0dcc0'], mantleChance: 0.5, hoodChance: 1 },
    groups: [{ count: 420, center: THRONE, ring: [7, 22], arc: [0, Math.PI * 2], spacing: 1.2, face: THRONE, children: 0, kneel: 0.4, seed: 5, avoid: [{ rect: [0, THRONE[1] + 14, 12, 16] }, { rect: [0, 6, 30, 14] }] }],
  },

  figures: [
    {
      x: THRONE[0] + 1.9, z: THRONE[1], y: throneY + 0.5, face: [0, 10], scale: 3.7, robe: '#fffcf3', mantle: '#f6f0e2', skin: '#fbefd8', arms: 'down', emissive: 0.45,
      light: { color: '#fff0cf', intensity: 30, distance: 40 },
      halo: { size: 9, opacity: 0.22, color: '#fff3d6' },
    },
    {
      x: THRONE[0] - 1.9, z: THRONE[1], y: throneY + 0.5, face: [0, 10], scale: 3.5, robe: '#fffcf3', mantle: '#f6f0e2', skin: '#fbefd8', arms: 'out', emissive: 0.45,
      halo: { size: 9, opacity: 0.22, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'ring', position: [THRONE[0], throneY + 0.3, THRONE[1]], radius: 5, width: 2, color: '#ffe8b0', opacity: 0.7 },
    { type: 'motes', position: [THRONE[0], throneY, THRONE[1]], radius: 20, height: 60, count: 300, size: 0.12 },
    { type: 'motes', position: [ROOM[0], 0, ROOM[1] - 4], radius: 4, height: 6, count: 120, size: 0.03, seed: 9 },
  ],

  custom(ctx) {
    room(ctx);
    glories(ctx);
    crowd(ctx, [
      { points: [[-2.75, 3.9], [-2.75, 4.7], [-2.75, 5.5], [2.75, 5.6], [2.75, 6.4], [2.75, 7.2]], count: 6, face: [0, -30], palette: period.men, y: 0, children: 0, seed: 3 },
    ]);
    person(ctx, { x: -0.6, z: ROOM[1] - 0.3, y: 0, face: [-0.6, -30], seated: true, coat: '#2e3448', hair: '#3b2718', skin: '#e6bf9b' });
    person(ctx, { x: 0.6, z: ROOM[1] - 0.3, y: 0, face: [0.6, -30], seated: true, coat: '#4a3a2c', hair: '#5a4a3a', skin: '#d9ad88' });
  },
};
