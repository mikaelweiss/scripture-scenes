// Mosiah 27: an angel descends in a cloud before Alma and the sons of Mosiah on the road, and the earth shakes.
// x is east, z is south. The town lies south behind the player; the angel stands on the road ahead.
import * as THREE from 'three';
import { NEPHITES, NO_PLAZA, figure, huts, road, rocks, toonStyle } from './lib/bom-19-kit.js';

const ANGEL = [0, -16];
const ANGEL_LIFT = 2.6;
const AT = (lift) => [ANGEL[0], lift, ANGEL[1]];
const ROAD = [[2, 140], [0, 60], [-1, 20], [0, -10], [3, -60], [10, -140], [16, -260]];

const YOUNG = [
  { pos: [0.2, -6.8], yaw: -1.3, pose: 'lie', arms: 'out', robe: '#b5523b', mantle: '#c8912e' },
  { pos: [-5.2, -5.4], yaw: 2.6, pose: 'prone', arms: 'reach', robe: '#4f7f80', mantle: '#d9c7a3' },
  { pos: [4.8, -6], yaw: -2.6, pose: 'prone', arms: 'reach', robe: '#6f8a6a', mantle: '#8c5a3c' },
  { pos: [-2.4, -3.8], pose: 'kneel', robe: '#a87b4f', mantle: '#3e6e66', face: true },
  { pos: [-0.2, -2.6], pose: 'kneel', robe: '#c98b3c', mantle: '#5e4632', face: true },
];

export default {
  title: 'Mosiah 27:10-19: The angel appears to Alma the Younger',
  subtitle: 'A road outside the city of Zarahemla',
  seed: 27,

  style: toonStyle({ fog: '#e6dcc4', near: 110, far: 900 }),

  sky: { zenith: '#3a6e8c', mid: '#88b4b8', horizon: '#f1e2bc', ground: '#cdb48a', glowColor: '#fff6dc', glowDir: [0, 0.5, -1] },

  sun: {
    dir: [0.45, 0.8, 0.4],
    color: '#fff2da',
    intensity: 2.5,
    hemi: { sky: '#d6e6e8', ground: '#a07a52', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 110,
    hillHeight: 40,
    undulation: 0.35,
    plaza: NO_PLAZA,
    colors: {
      sand: '#cfae78', dirt: '#b88e5c', grass: '#8ea05a', grassDark: '#6c7e44', plaza: '#cfae78', plazaLine: '#cfae78',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a',
    },
  },

  mountains: { count: 32, distance: [500, 800], height: [60, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 120, ring: [20, 200], angle: [Math.PI + 0.32, Math.PI * 3 - 0.32], height: [5, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 500, ring: [3, 80], size: [0.12, 0.45], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
    { type: 'stones', count: 14, center: ANGEL, ring: [4.5, 9], size: [0.25, 0.55], colors: ['#b89a70', '#a58a66'], seed: 9 },
  ],

  cracks: [
    { from: [0, -14], angle: 0.2, length: 26, width: 0.4 },
    { from: [-1, -15], angle: -2.6, length: 20, width: 0.35 },
    { from: [1, -15], angle: 2.4, length: 22, width: 0.35 },
    { from: [-1, -14], angle: -1.2, length: 18, width: 0.3 },
    { from: [1, -14], angle: 1.3, length: 18, width: 0.3 },
    { from: [0, -14], angle: -0.3, length: 24, width: 0.35 },
  ],

  light: {
    beams: [{ from: [0, 160, -30], to: AT(ANGEL_LIFT + 1.5), width: [16, 6], color: '#fff2c9', intensity: 0.22, layers: 3, stripes: 22, fadeLow: 0.05 }],
    rayFans: [{ source: [0, 110, -20], sourceJitter: 30, target: ANGEL, groundY: 0, spread: [8, 30], count: 7, width: [[3, 6], [5, 9]], color: '#fff0c4', intensity: 0.22, stripes: 9, fadeLow: 0.3 }],
    glows: [
      { pos: AT(ANGEL_LIFT + 1.6), size: 7, color: '#fff3d0', opacity: 0.9 },
      { pos: AT(ANGEL_LIFT - 0.1), size: 12, color: '#fff8e8', opacity: 0.45 },
    ],
    pointLights: [{ pos: AT(ANGEL_LIFT + 2.5), color: '#ffe6b0', intensity: 16, distance: 24 }],
  },

  custom(ctx) {
    road(ctx, ROAD, { width: 5, color: '#dcc092' });

    const huts1 = [];
    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? 1 : -1;
      huts1.push({ pos: [side * (12 + (i % 5) * 9), 80 + Math.floor(i / 2) * 7 + (i % 3) * 2], size: [6, 5], rot: ((i * 0.31) % 0.5) - 0.25, height: 3 });
    }
    huts(ctx, huts1, { wall: '#e0cba2', roof: '#a8784a' });
    rocks(ctx, [{ pos: [-9, -24], size: [3, 2, 2.5] }, { pos: [11, -8], size: [2.5, 1.6, 2] }, { pos: [-12, 4], size: [2, 1.4, 2] }], ['#a8957a', '#9a8670']);

    const cloud = [];
    const rngSeed = [0.3, 1.7, 2.9, 4.1, 5.3, 0.9, 3.5, 4.8];
    rngSeed.forEach((a, i) => {
      const r = i < 5 ? 1.6 : 0.9;
      const s = i < 5 ? 1.1 : 0.8;
      cloud.push(new THREE.SphereGeometry(s, 14, 10).scale(1.3, 0.6, 1.3).translate(Math.cos(a) * r, (i % 3) * 0.15, Math.sin(a) * r));
    });
    cloud.push(new THREE.SphereGeometry(1.5, 16, 12).scale(1.2, 0.55, 1.2));
    const cloudGroup = new THREE.Group();
    for (const g of cloud) cloudGroup.add(new THREE.Mesh(g, ctx.kit.toon('#ffffff', { emissive: '#d9dde6' })));
    const baseY = ctx.terrainHeight(...ANGEL) + ANGEL_LIFT - 0.5;
    cloudGroup.position.set(ANGEL[0], baseY, ANGEL[1]);
    ctx.scene.add(cloudGroup);
    ctx.addCollider({ x: ANGEL[0], z: ANGEL[1], hx: 2.4, hz: 2.4, rot: 0, top: baseY + 3 });
    ctx.exclude({ kind: 'circle', x: ANGEL[0], z: ANGEL[1], r: 3.5 });

    const angel = figure(ctx, {
      pos: ANGEL, facing: [0, 20], lift: ANGEL_LIFT, scale: 1.6, glow: 0.55, clear: 0,
      colors: { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#f3e6cf', hair: '#f3eddf', sash: '#e9dcc0', arms: [0.5, 1.1] },
    });
    angel.position.y = baseY + 0.45;
    ctx.onFrame((t) => {
      cloudGroup.position.y = baseY + Math.sin(t * 0.8) * 0.12;
      angel.position.y = baseY + 0.45 + Math.sin(t * 0.8) * 0.12;
    });

    for (const y of YOUNG) {
      figure(ctx, {
        pos: y.pos, yaw: y.face ? Math.atan2(ANGEL[0] - y.pos[0], ANGEL[1] - y.pos[1]) : y.yaw, pose: y.pose, arms: y.arms, clear: 1.2,
        colors: { robe: y.robe, mantle: y.mantle, skin: '#a87650', hair: '#2b1a12', sash: '#c8912e' },
      });
    }

    // The earth trembles in short bursts.
    ctx.onFrame((t, dt, camera) => {
      const burst = Math.max(0, Math.sin(t * 0.7)) ** 8;
      if (burst < 0.01) return;
      camera.position.x += Math.sin(t * 47) * 0.06 * burst;
      camera.position.y += Math.sin(t * 61 + 1) * 0.05 * burst;
    });
  },

  crowd: {
    seed: 21,
    minSpacing: 0.8,
    facing: ANGEL,
    colors: NEPHITES,
    groups: [
      { center: [0, 66], radius: [0, 14], count: 30, children: 0.2, facingJitter: 1.4 },
      { center: [-18, 20], radius: [0, 4], count: 5, kneel: 0.4 },
    ],
  },

  player: {
    start: [4.4, -1.2],
    lookAt: [-0.6, -14],
    fov: 46,
    colors: { robe: '#7a6a52', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
