// John 21:1-17. Dawn on the shore of Galilee: the risen Lord beside a fire of coals with fish and
// bread, the disciples' boat drawn up with the net of 153 fish, Peter come wet from the sea. -z is the lake.
import { water, fire, boat, netOfFish, person } from './lib/nt-25-kit.js';

const FIRE = [0, 8];
const CHRIST = [-1.7, 8.6];

const disciples = [
  [2.4, 4.6], [3.9, 3.4], [3.0, 1.8], [5.2, 2.4], [1.2, 2.9], [6.0, 4.4],
];

export default {
  title: 'John 21:1-17: Breakfast by the sea',
  seed: 26,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.88, 0.14, -0.25], color: '#ffb27a', intensity: 2.8 },
  light: { sky: '#9aa6d8', ground: '#6a5446', hemi: 1.15 },
  sky: { top: '#4a5f96', horizon: '#f4b08a', ground: '#c89a86', sunColor: '#ffd2a0', glow: 1.3 },
  fog: { color: '#d4a898', near: 80, far: 620 },
  clouds: { count: 50, shadow: '#6a5a78', lit: '#ffb48e', rim: '#fff0d0', distance: [260, 900], altitude: [90, 220], hole: 0.25 },
  mountains: { count: 44, color: '#6a5a6a', radius: [460, 680], height: [40, 110], haze: 0.5 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.4, shadowTint: '#2e2a5e', highlightTint: '#ffe0c0' },
  shadow: { center: [0, 4], radius: 40 },

  player: { start: [5.5, 16], yaw: 0.36, pitch: -0.06, eye: 1.65, speed: 4 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 26,
    hills: 30,
    bumps: 0.25,
    flats: [
      { x: 0, z: -600, r: 588, falloff: 22, height: -3.5 },
      { x: 0, z: 22, r: 14, falloff: 18, height: 0.2 },
    ],
    colors: { ground: '#bba584', groundAlt: '#a89070', grass: '#7a8248', high: '#8a8060', rock: '#7c7064' },
    patches: [
      { x: 0, z: -2, r: 26, color: '#c9b08a', strength: 0.6, rough: 0.4 },
      { x: 0, z: -12, r: 60, color: '#6f6656', strength: 0.5, rough: 0.2 },
    ],
  },

  objects: [],

  scatter: [
    { type: 'rock', count: 40, center: [0, 0], ring: [10, 80], spacing: 5, seed: 61, avoid: [{ rect: [2, 5, 13, 13] }], props: { size: 0.9, color: '#7f7466' } },
    { type: 'rubble', count: 18, center: [2, 8], ring: [5, 22], spacing: 2, seed: 65, props: { radius: 1.6, count: 5, size: [0.08, 0.22], color: '#8a8072' } },
    { type: 'rock', count: 30, center: [0, 30], ring: [30, 220], spacing: 12, seed: 62, props: {} },
    { type: 'tree', count: 50, center: [0, 40], ring: [30, 260], arc: [-0.2, Math.PI + 0.2], spacing: 10, seed: 63, props: { kind: 'broad', leaf: '#6f7d4c' } },
    { type: 'tree', count: 10, center: [0, 20], ring: [22, 60], arc: [0, Math.PI], spacing: 9, seed: 64, props: { kind: 'palm', leaf: '#6a7c40' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#5e4b3a', '#94704e'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.4,
      hoodChance: 0.2,
    },
    groups: [{ count: disciples.length, points: disciples, face: CHRIST, children: 0, seed: 71 }],
  },

  figures: [
    {
      x: CHRIST[0], z: CHRIST[1], face: [3, 2], scale: 1.08, robe: '#fbf7ee', mantle: '#f3ecdc', skin: '#a8754f', arms: 'out', emissive: 0.28,
      light: { color: '#fff0cf', intensity: 10, distance: 12 },
      halo: { size: 3.2, opacity: 0.35, color: '#fff3d6' },
    },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { x: 0, z: -355, y: -0.45, w: 1100, d: 700, color: '#6a93a4', amp: 0.08, specular: '#ffc89a' });
    fire(ctx, { x: FIRE[0], z: FIRE[1], size: 0.9, flames: 6, light: 14, lightRange: 10, smoke: 0 });
    const fy = ctx.heightAt(...FIRE);
    for (let i = 0; i < 4; i++) {
      ctx.solid.add(new THREE.OctahedronGeometry(0.1, 0), { position: [FIRE[0] - 0.3 + i * 0.2, fy + 0.3, FIRE[1] + 0.1 * (i % 2)], rotation: [0, 0.3, 0], scale: [0.7, 0.4, 2.6], color: '#b8aaa0' });
    }
    for (const [bx, bz] of [[1.1, 8.9], [1.35, 9.2], [1.05, 9.45]]) {
      ctx.solid.add(new THREE.SphereGeometry(0.15, 7, 4), { position: [bx, ctx.heightAt(bx, bz) + 0.06, bz], scale: [1.2, 0.5, 1], color: '#c08a4e', jitter: 0.08 });
    }

    const beach = ctx.heightAt(11, -2.5);
    boat(ctx, { x: 11, z: -2.5, y: Math.max(beach - 0.4, -0.95), rot: 0.75, len: 8, heel: 0.08, color: '#6b4a32', mast: false });
    boat(ctx, { x: -26, z: -42, y: -0.95, rot: 1.2, len: 9, heel: 0, color: '#5e4230', collide: false });
    netOfFish(ctx, { x: 7.8, z: 1.6, r: 1.6, fish: 90, seed: 9 });
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 6, 4), { position: [9.6, ctx.heightAt(9.6, 0) + 0.15, 0], rotation: [Math.PI / 2, 0.9, 0], color: '#6a6250' });

    person(ctx, { x: -0.4, z: 10.3, y: ctx.heightAt(-0.4, 10.3) - 0.48, face: CHRIST, robe: '#4c5560', mantle: null, skin: '#8a5a3c' });
    ctx.colliders.add({ x: -0.4, z: 10.3, w: 0.6, d: 0.6, bottom: -2, top: 2 });

    for (let i = 0; i < 26; i++) {
      const x = -60 + i * 4.8 + ctx.rand() * 2, z = -6 + ctx.rand() * 3;
      if (Math.abs(x - 4) < 9) continue;
      const s = 0.25 + ctx.rand() * 0.5;
      ctx.solid.add(new THREE.DodecahedronGeometry(s, 0), { position: [x, ctx.heightAt(x, z) + s * 0.2, z], rotation: [ctx.rand(), ctx.rand(), 0], scale: [1.3, 0.6, 1], color: '#8a8070', jitter: 0.1 });
    }
  },
};
