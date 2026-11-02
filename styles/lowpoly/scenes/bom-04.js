// 1 Nephi 8: Lehi's dream. A strait and narrow path with a rod of iron leads through a mist of darkness
// to the tree whose fruit is white. A river of filthy water runs beside it; across the river the great
// and spacious building stands in the air. The tree is north (-z) of the start.
import * as THREE from 'three';
import { river, channelFlats, mist, person, box, frame } from './lib/bom-01-kit.js';

const TREE = [0, -52];
const RIVER = [[-7, -44], [-11, -20], [-13, 10], [-12, 40], [-16, 80], [-14, 130]];
const BUILDING = [-78, -34];
const LIFT = 11;

const rodPoints = [];
for (let z = 54; z > -40; z -= 1.5) rodPoints.push([0.3 + Math.sin(z * 0.05) * 0.25, z]);
const pathX = (z) => Math.sin(z * 0.05) * 0.25;
const rodHolders = rodPoints.filter((_, i) => i % 2 === 0 && i > 3).map(([x, z]) => [x - 0.5, z + 0.4]);

export default {
  title: "1 Nephi 8: Lehi's dream of the tree of life",
  seed: 404,
  fov: 62,
  exposure: 1.2,

  sun: { direction: [0.35, 0.6, 0.7], color: '#d8c8ff', intensity: 1.3 },
  light: { sky: '#5a5a8a', ground: '#2a2420', hemi: 1.25 },
  sky: { top: '#141228', horizon: '#5a4a6a', ground: '#2a2430', sunColor: '#a898c8', glow: 0.3 },
  fog: { color: '#3a3444', near: 25, far: 230 },
  clouds: { count: 60, shadow: '#1e1a28', lit: '#5a4a6a', rim: '#a898b8', distance: [220, 800], altitude: [60, 200], hole: 0.15 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.75 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.55, shadowTint: '#1a1840', highlightTint: '#fff4d8' },
  shadow: { center: [0, -10], radius: 70 },

  player: { start: [1.6, 30], yaw: 0.12, pitch: 0.08, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 900,
    segments: 180,
    seed: 61,
    hills: 10,
    bumps: 0.25,
    flats: [{ x: 0, z: 0, r: 110, falloff: 60, height: 0 }, { x: -78, z: -20, r: 40, falloff: 20, height: -3 }, ...channelFlats(RIVER, { r: 3, falloff: 5, depth: 1.6, step: 4 })],
    colors: { ground: '#4a4632', groundAlt: '#3e3a2c', grass: '#4e5a34', high: '#4a4434', rock: '#3a342c' },
    patches: [
      { x: TREE[0], z: TREE[1], r: 26, color: '#6a8a42', strength: 0.9, rough: 0.3 },
      { x: -78, z: -24, r: 46, color: '#2a2622', strength: 0.8, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'rock', count: 40, center: [0, 0], ring: [30, 220], spacing: 10, seed: 7, avoid: [{ rect: [-78, -30, 70, 70] }], props: { color: '#4a4440' } },
    { type: 'tree', count: 30, center: [0, 30], ring: [40, 200], spacing: 10, seed: 8, avoid: [{ rect: [-78, -30, 70, 70] }], props: { kind: 'burnt' } },
  ],

  crowd: {
    palette: {
      robes: ['#6e5a44', '#8b6b4a', '#5e4b3a', '#7a4e36', '#4f5a6b', '#94704e', '#6b6f4a', '#a0825c'],
      mantles: ['#5a3d2b', '#3f4d5e', '#8a7a5a', '#556246', '#6d3b2e'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.4,
    },
    groups: [
      { count: rodHolders.length, points: rodHolders, face: TREE, children: 0.1, seed: 31 },
      { count: 120, center: TREE, ring: [7, 16], spacing: 0.9, face: TREE, kneel: 0.35, children: 0.2, seed: 32, avoid: [{ rect: [0, -38, 6, 10] }] },
      { count: 50, center: [10, 12], ring: [4, 40], spacing: 3, children: 0.1, seed: 33, avoid: [{ rect: [0, 10, 5, 100] }] },
      {
        count: 70,
        points: Array.from({ length: 70 }, (_, i) => [BUILDING[0] - 22 + (i % 35) * 1.25 + (i * 0.37) % 0.4, BUILDING[1] + 12.6 + Math.floor(i / 35) * 1.3]),
        face: [0, 10],
        onStructures: true,
        children: 0,
        seed: 34,
        palette: {
          robes: ['#b03a4a', '#d8a838', '#6a3a9a', '#2a7a8a', '#e0d8c8', '#c45a2a', '#3a4aa8'],
          mantles: ['#e0b040', '#8a2a6a', '#f0e8d8', '#2a5aa8', '#c83a3a'],
          skins: ['#a87652', '#b5835e', '#c08e68'],
          mantleChance: 0.9,
          hoodChance: 0,
        },
      },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    // The strait and narrow path: flat stones, with the rod of iron on posts beside it.
    for (let z = 56; z > -44; z -= 1.1) {
      const x = pathX(z);
      ctx.solid.box(1.4, 0.12, 1.0, { position: [x + r.range(-0.1, 0.1), ctx.heightAt(x, z) + 0.02, z], rotation: [0, r.range(-0.15, 0.15), 0], color: '#8a8270', jitter: 0.08 });
    }
    const iron = '#4a4c54';
    for (let i = 0; i < rodPoints.length - 1; i++) {
      const [ax, az] = rodPoints[i], [bx, bz] = rodPoints[i + 1];
      const ya = ctx.heightAt(ax + 0.6, az) + 1.0, yb = ctx.heightAt(bx + 0.6, bz) + 1.0;
      const len = Math.hypot(bx - ax, bz - az, yb - ya);
      ctx.solid.add(new THREE.CylinderGeometry(0.035, 0.035, len, 5).rotateX(Math.PI / 2), {
        position: [(ax + bx) / 2 + 0.6, (ya + yb) / 2, (az + bz) / 2],
        rotation: [Math.atan2(ya - yb, Math.hypot(bx - ax, bz - az)), Math.atan2(bx - ax, bz - az), 0],
        color: iron,
        jitter: 0.02,
      });
      if (i % 2 === 0) ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.05, 1.0, 5), { position: [ax + 0.6, ya - 0.5, az], color: '#3a3a40' });
    }

    // The river of filthy water and the fountain at its head near the tree.
    river(ctx, { path: RIVER, width: 6.5, y: -0.8, color: '#4a4632', opacity: 0.95, amp: 0.05 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.5, 0), { position: [RIVER[0][0] + Math.cos(a) * 2.6, ctx.heightAt(RIVER[0][0], RIVER[0][1]) + 0.1, RIVER[0][1] + Math.sin(a) * 2.6], color: '#5a5448' });
    }

    // The tree: a stout trunk, broad pale canopy, and fruit glowing white.
    const ty = ctx.heightAt(...TREE);
    ctx.solid.add(new THREE.CylinderGeometry(0.8, 1.5, 8, 7), { position: [TREE[0], ty + 4, TREE[1]], color: '#6a5034' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.solid.add(new THREE.CylinderGeometry(0.2, 0.45, 5, 5), { position: [TREE[0] + Math.cos(a) * 1.8, ty + 7.6, TREE[1] + Math.sin(a) * 1.8], rotation: [Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7], color: '#6a5034' });
    }
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 7;
      ctx.solid.add(new THREE.IcosahedronGeometry(r.range(3, 4.4), 0), { position: [TREE[0] + Math.cos(a) * d, ty + r.range(10, 14), TREE[1] + Math.sin(a) * d], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.7, 1], color: '#d4dcc0', jitter: 0.07 });
    }
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = 3 + Math.sqrt(r()) * 7.5;
      ctx.glow.add(new THREE.IcosahedronGeometry(0.3, 0), { position: [TREE[0] + Math.cos(a) * d, ty + r.range(8.5, 13), TREE[1] + Math.sin(a) * d], color: '#fffaf0', jitter: 0.02 });
    }
    ctx.colliders.add({ x: TREE[0], z: TREE[1], w: 2.4, d: 2.4, bottom: ty, top: ty + 9 });
    const light = new THREE.PointLight('#fff4d8', 70, 50, 1.3);
    light.position.set(TREE[0], ty + 6, TREE[1] + 9);
    ctx.scene.add(light);
    ctx.effects.halo({ position: [TREE[0], ty + 10, TREE[1]], size: 30, opacity: 0.22, color: '#fff2d0' });
    ctx.effects.halo({ position: [TREE[0], ty + 10, TREE[1]], size: 10, opacity: 0.2, color: '#ffffff' });
    ctx.effects.motes({ position: [TREE[0], ty, TREE[1]], radius: 9, height: 16, count: 160, color: '#fff6dc' });
    ctx.effects.ring({ position: [TREE[0], ty + 0.05, TREE[1]], radius: 14, width: 6, color: '#fff0c0', opacity: 0.25 });

    // Lehi beside the tree beckoning to his family; Sariah, Sam and Nephi come; Laman and Lemuel stand apart.
    person(ctx, { x: TREE[0] + 2.2, z: TREE[1] + 3.2, face: [-6, -30], robe: '#e2d6bc', mantle: '#5a6a8a', skin: '#a8754f', arms: 'out' });
    person(ctx, { x: TREE[0] - 1.2, z: TREE[1] + 5.5, face: [TREE[0], TREE[1]], robe: '#8a5a6a', mantle: '#c9b48e', skin: '#a87652', hood: true });
    person(ctx, { x: TREE[0] + 0.8, z: TREE[1] + 6.4, face: [TREE[0], TREE[1]], robe: '#a0825c', mantle: '#556246', skin: '#9b6a46' });
    person(ctx, { x: TREE[0] + 2.8, z: TREE[1] + 7.6, face: [TREE[0], TREE[1]], robe: '#c4b090', mantle: '#7d5c3e', skin: '#a87652' });
    person(ctx, { x: RIVER[0][0] - 5, z: RIVER[0][1] + 2, face: [-40, 0], robe: '#7a4e36', mantle: '#a34f32', skin: '#9b6a46' });
    person(ctx, { x: RIVER[0][0] - 6.2, z: RIVER[0][1] + 3.4, face: [-40, 0], robe: '#6e5a44', mantle: '#3f4d5e', skin: '#9b6a46' });

    // The great and spacious building, high in the air with nothing beneath it.
    const [bx, bz] = BUILDING;
    const fine = '#e4dccc';
    box(ctx, { x: bx, z: bz, y: LIFT - 2, w: 52, h: 2, d: 26, color: '#b8ae9c' });
    for (let f = 0; f < 4; f++) {
      const y = LIFT + f * 4.5;
      const inset = f * 1.5;
      box(ctx, { x: bx, z: bz - inset, y, w: 48 - inset * 2, h: 4.5, d: 22 - inset * 2, color: fine });
      box(ctx, { x: bx, z: bz - inset, y: y + 4.2, w: 49 - inset * 2, h: 0.4, d: 23 - inset * 2, color: '#c8a858', collide: false });
      const front = bz - inset + 11 - inset + 0.05;
      for (let i = 0; i < 12 - f; i++) {
        const wx = bx - (22 - inset) + (i + 0.5) * ((44 - inset * 2) / (12 - f));
        box(ctx, { x: wx, z: front, y: y + 1.2, w: 1.1, h: 2.2, d: 0.12, color: r() < 0.75 ? '#ffd890' : '#2a2018', collide: false, glow: true });
      }
    }
    box(ctx, { x: bx, z: bz + 13.4, y: LIFT, w: 48, h: 0.5, d: 4.4, color: '#cfc4ae' });
    for (let i = 0; i < 13; i++) ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 5), { position: [bx - 24 + i * 4, LIFT + 1.05, bz + 15.5], color: '#c8a858' });
    ctx.solid.box(48, 0.15, 0.15, { position: [bx, LIFT + 1.6, bz + 15.5], color: '#c8a858' });
    for (let i = 0; i < 8; i++) {
      const a = r() * Math.PI * 2, d = r.range(4, 20);
      ctx.solid.add(new THREE.ConeGeometry(r.range(1.5, 3), r.range(3, 7), 5).rotateX(Math.PI), { position: [bx + Math.cos(a) * d, LIFT - 3.5, bz + Math.sin(a) * d * 0.5], color: '#5a5048' });
    }
    const glowUnder = new THREE.PointLight('#ffcf80', 40, 40, 1.4);
    glowUnder.position.set(bx, LIFT + 6, bz + 18);
    ctx.scene.add(glowUnder);

    // Mist of darkness over the middle stretch of the path.
    mist(ctx, { x: 0, z: 6, w: 40, d: 22, count: 70, color: '#2a2632', opacity: 0.38, height: [-0.5, 1.6], size: [1.5, 3.5], seed: 3 });
    mist(ctx, { x: 24, z: 0, w: 30, d: 50, count: 40, color: '#2a2632', opacity: 0.38, height: [-0.5, 2], size: [2, 4], seed: 5 });
  },
};
