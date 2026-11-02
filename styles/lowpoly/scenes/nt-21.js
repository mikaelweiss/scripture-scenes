// Luke 22:7-20, John 13. The upper room at evening: Jesus and the Twelve around a low U-shaped
// table with bread and wine; a basin, pitcher and towel for washing feet in the foreground.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { house, person, christ, box, lamp } from './lib/nt-19-kit.js';

const FLOOR = 4;
const W = 14, D = 10, H = 4.2, T = 0.4;
const plaster = '#cdb592';

const seats = [
  ...[-2.4, -1.6, -0.8, 0.8, 1.6, 2.4].map((x) => ({ x, z: -3.05, face: [x, 5] })),
  ...[-1.4, -0.4, 0.6].flatMap((z) => [{ x: -4.25, z, face: [0, z] }, { x: 4.25, z, face: [0, z] }]),
];

export default {
  title: 'Luke 22:7-20, John 13: The Last Supper',
  seed: 21,
  fov: 68,
  exposure: 1.05,

  sun: { direction: [-0.85, 0.22, -0.2], color: '#ffb066', intensity: 2.6 },
  light: { sky: '#7d7fa8', ground: '#5a4030', hemi: 0.55 },
  sky: { top: '#2c3560', horizon: '#f0a060', ground: '#6a5040', sunColor: '#ffc080', glow: 1.3 },
  fog: { color: '#a07a68', near: 60, far: 420 },
  clouds: { count: 30, shadow: '#3b3848', lit: '#f6a868', rim: '#ffe0b0', distance: [300, 900], altitude: [100, 220], hole: 0.3 },
  mountains: { count: 36, color: '#4e4650', radius: [420, 700], height: [40, 110], haze: 0.5 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.5, shadowTint: '#2a2040', highlightTint: '#ffd8a0' },
  shadow: { center: [0, 0], radius: 22 },

  player: { start: [0.4, 3.9], yaw: 0.02, pitch: -0.16, eye: 1.6, speed: 2.6 },

  terrain: {
    size: 900,
    segments: 140,
    seed: 21,
    hills: 30,
    bumps: 0.2,
    flats: [{ x: 0, z: 0, r: 60, falloff: 40, height: 0 }],
    colors: { ground: '#a88d64', groundAlt: '#9a805a', grass: '#7f7a48', high: '#9a8466', rock: '#86705a' },
    patches: [],
  },

  custom(ctx) {
    const r = ctx.rand;
    const F = FLOOR;

    // The lower storey and the room shell.
    box(ctx, { x: 0, z: 0, y: -0.5, w: W + 2 * T, h: F + 0.5, d: D + 2 * T, color: '#bfa67e' });
    for (let x = -W / 2 + 0.6; x < W / 2; x += 1.2) {
      ctx.solid.box(1.16, 0.06, D, { position: [x, F + 0.03, 0], color: r.pick(['#7a5c40', '#80603f', '#735538']), jitter: 0.04 });
    }
    const wallBox = (x, z, w, d, y0, h) => box(ctx, { x, z, y: F + y0, w, h, d, color: plaster, jitter: 0.03 });
    // North wall with two windows.
    const winY = 1.3, winH = 1.3, winW = 1.4;
    const north = -D / 2 - T / 2;
    const nWins = [-3.5, 3.5];
    let cursor = -W / 2 - T;
    for (const wx of nWins) {
      wallBox((cursor + wx - winW / 2) / 2, north, wx - winW / 2 - cursor, T, 0, H);
      wallBox(wx, north, winW, T, 0, winY);
      wallBox(wx, north, winW, T, winY + winH, H - winY - winH);
      cursor = wx + winW / 2;
    }
    wallBox((cursor + W / 2 + T) / 2, north, W / 2 + T - cursor, T, 0, H);
    // West wall with one window, where the evening sun comes in.
    const west = -W / 2 - T / 2;
    wallBox(west, (-D / 2 + -0.8) / 2, T, D / 2 - 0.8, 0, H);
    wallBox(west, (0.8 + D / 2) / 2, T, D / 2 - 0.8, 0, H);
    wallBox(west, 0, T, 1.6, 0, winY);
    wallBox(west, 0, T, 1.6, winY + winH + 0.3, H - winY - winH - 0.3);
    wallBox(W / 2 + T / 2, 0, T, D + 2 * T, 0, H);
    wallBox(0, D / 2 + T / 2, W + 2 * T, T, 0, H);
    box(ctx, { x: 0, z: 0, y: F + H, w: W + 2 * T, h: 0.3, d: D + 2 * T, color: '#8f7656', collide: false });
    for (let x = -W / 2 + 1; x < W / 2; x += 2) box(ctx, { x, z: 0, y: F + H - 0.25, w: 0.28, h: 0.25, d: D, color: '#5a4332', collide: false });
    box(ctx, { x: 0, z: 0, y: F + H + 0.3, w: W + 2.8, h: 0.6, d: D + 2.8, color: '#bfa67e', collide: false });
    for (const [wx, wz, ww, wd] of [[-3.5, north, winW + 0.3, T + 0.1], [3.5, north, winW + 0.3, T + 0.1], [west, 0, T + 0.1, 1.9]]) {
      box(ctx, { x: wx, z: wz, y: F + winY - 0.12, w: ww, h: 0.12, d: wd, color: '#8f7656', collide: false });
    }

    // Low U-shaped table with cloth, bread, wine and lamps.
    const wood = '#6b4a30', cloth = '#e2d7bf';
    const tables = [[0, -2.2, 5.8, 1.1], [-3.35, -0.55, 1.1, 2.6], [3.35, -0.55, 1.1, 2.6]];
    for (const [x, z, w, d] of tables) {
      box(ctx, { x, z, y: F, w: w - 0.2, h: 0.28, d: d - 0.2, color: wood });
      box(ctx, { x, z, y: F + 0.28, w, h: 0.06, d, color: cloth, jitter: 0.02 });
    }
    const top = F + 0.34;
    const bread = (x, z) => ctx.solid.add(new THREE.SphereGeometry(0.16, 7, 4), { position: [x, top + 0.04, z], scale: [1.2, 0.45, 1], color: '#c48a4a', jitter: 0.06 });
    const plate = (x, z) => ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.13, 0.04, 9), { position: [x, top + 0.02, z], color: '#9a6a44' });
    const cup = (x, z, color = '#8a5a3a', s = 1) => {
      ctx.solid.add(new THREE.CylinderGeometry(0.07 * s, 0.045 * s, 0.13 * s, 8), { position: [x, top + 0.17 * s, z], color });
      ctx.solid.add(new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 0.1 * s, 5), { position: [x, top + 0.06 * s, z], color });
      ctx.solid.add(new THREE.CylinderGeometry(0.06 * s, 0.07 * s, 0.02 * s, 8), { position: [x, top + 0.01, z], color });
      ctx.solid.add(new THREE.CircleGeometry(0.06 * s, 8).rotateX(-Math.PI / 2), { position: [x, top + 0.23 * s, z], color: '#5a1424' });
    };
    for (const sx of [-2.4, -1.6, -0.8, 0.8, 1.6, 2.4]) plate(sx, -2.05);
    for (const z of [-1.4, -0.4, 0.6]) plate(-3.2, z), plate(3.2, z);
    bread(-0.35, -1.95);
    bread(0.05, -1.82);
    plate(-0.15, -2.4);
    bread(-0.15, -2.4);
    bread(-1.9, -2.3);
    bread(1.9, -2.3);
    bread(-3.4, 0.1);
    bread(3.4, -1);
    cup(0.35, -2.05, '#b08a3a', 1.5);
    for (const [x, z] of [[-1.2, -2.0], [1.3, -2.0], [-3.25, -0.9], [3.25, 0.1]]) cup(x, z);
    ctx.solid.add(new THREE.CylinderGeometry(0.14, 0.18, 0.4, 8), { position: [-2.9, top + 0.2, -2.45], color: '#a8643c' });
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.12, 0.12, 8), { position: [-2.9, top + 0.46, -2.45], color: '#a8643c' });
    lamp(ctx, { x: -1.6, y: top, z: -2.45, light: 3.5 });
    lamp(ctx, { x: 1.6, y: top, z: -2.45, light: 3.5 });
    lamp(ctx, { x: -3.35, y: top, z: 0.6 });
    lamp(ctx, { x: 3.35, y: top, z: 0.6 });
    lamp(ctx, { x: 0.6, y: top, z: -2.5 });
    for (const [x, z] of [[-6.6, -4.6], [6.6, -4.6], [6.6, 4.6]]) {
      box(ctx, { x, z, y: F, w: 0.35, h: 1.3, d: 0.35, color: '#7a5c40' });
      lamp(ctx, { x, y: F + 1.3, z, light: 4 });
    }

    // Cushions where they recline.
    const cushions = ['#7a3e2c', '#3f5d7a', '#8a7a5a', '#556246', '#a34f32'];
    for (const s of [...seats, { x: 0, z: -3.05 }]) {
      ctx.solid.box(0.75, 0.3, 0.75, { position: [s.x, F + 0.15, s.z], rotation: [0, r.range(-0.2, 0.2), 0], color: r.pick(cushions), jitter: 0.05 });
    }
    const rr = rng(77);
    seats.forEach((s, i) => {
      person(ctx, { ...s, y: F + 0.2, pose: 'sit', robe: rr.pick(['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#5e4b3a', '#4f5a6b', '#9a4a34']), mantle: rr.pick(['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#556246']), hood: false, skin: rr.pick(['#8a5a3c', '#9b6a46', '#a87652']), scale: i === 2 ? 0.95 : 1 });
    });
    christ(ctx, { x: 0, z: -3.05, y: F + 0.25, pose: 'sit', face: [0, 5], arms: 'out', light: 6, halo: 2.8, glow: 0.45, scale: 1.05 });

    // Basin, pitcher and towel for the washing of feet.
    const bx = 2.0, bz = 1.0;
    ctx.solid.add(new THREE.CylinderGeometry(0.42, 0.3, 0.2, 10), { position: [bx, F + 0.1, bz], color: '#9a6a44' });
    ctx.solid.add(new THREE.CircleGeometry(0.37, 10).rotateX(-Math.PI / 2), { position: [bx, F + 0.19, bz], color: '#6f8fa0', jitter: 0.02 });
    ctx.solid.add(new THREE.CylinderGeometry(0.14, 0.2, 0.5, 8), { position: [bx + 0.7, F + 0.25, bz - 0.15], color: '#a8643c' });
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.13, 0.15, 8), { position: [bx + 0.7, F + 0.57, bz - 0.15], color: '#a8643c' });
    ctx.solid.box(0.9, 0.05, 0.4, { position: [bx - 0.75, F + 0.03, bz + 0.15], rotation: [0, 0.4, 0], color: '#eee6d4', jitter: 0.02 });
    ctx.solid.box(0.55, 0.1, 0.35, { position: [bx - 0.7, F + 0.08, bz + 0.1], rotation: [0, 0.3, 0.1], color: '#e6ddc8', jitter: 0.02 });

    // Rug and wall niches.
    ctx.solid.box(3.2, 0.03, 2, { position: [0, F + 0.07, 1.1], color: '#7a3e2c', jitter: 0.03 });
    ctx.solid.box(2.8, 0.035, 1.6, { position: [0, F + 0.075, 1.1], color: '#a65d3f', jitter: 0.03 });
    for (const x of [-4, 4]) box(ctx, { x, z: D / 2 - 0.05, y: F + 1.6, w: 0.9, h: 0.9, d: 0.12, color: '#6a5642', collide: false });

    // The city around the house.
    const colors = ['#d8c6a0', '#cdb68e', '#c9ad84', '#e2d6bd', '#bfa67e'];
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = r.range(14, 120);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      house(ctx, { x, z, rot: Math.floor(r() * 4) * (Math.PI / 2), w: r.range(6, 10), d: r.range(5, 9), h: r.range(3, 7), color: r.pick(colors), door: false });
    }
    for (let i = 0; i < 12; i++) {
      const a = r() * Math.PI * 2, d = r.range(20, 120);
      ctx.builders.tree(ctx, { x: Math.cos(a) * d, z: Math.sin(a) * d, kind: 'palm', leaf: '#55702f' });
    }
  },
};
