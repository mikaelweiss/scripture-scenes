// Alma 19: Lamoni, the queen, Ammon and the servants lie overcome in the king's hall while Abish gathers the people.
// x is east, z is south. The open hall stands on a platform to the north; the people gather in the court below.
import * as THREE from 'three';
import { LAMANITES, figure, huts, toonStyle } from './lib/bom-19-kit.js';

const HALL = [0, -20];
const BED = [0, -21];
const ABISH = [1, -5];
const COLUMN_H = 6.4;

const servantColors = (i) => ({ robe: LAMANITES.robes[i % 6], mantle: LAMANITES.mantles[i % 5], skin: LAMANITES.skins[i % 4], hair: '#1f140e', sash: '#c8912e' });

export default {
  title: "Alma 18-19: Lamoni's household falls to the earth",
  subtitle: "King Lamoni's palace in the land of Ishmael",
  seed: 19,

  style: toonStyle({ fog: '#eedcb8', near: 110, far: 900 }),

  sky: { zenith: '#2e6378', mid: '#79aaa8', horizon: '#f3d9a6', ground: '#d4b88a', glowColor: '#ffeec0', glowDir: [0, 0.6, -1] },

  sun: {
    dir: [0.35, 0.8, 0.6],
    color: '#fff0d6',
    intensity: 2.5,
    hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.15 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 120,
    hillHeight: 36,
    undulation: 0.25,
    plaza: { center: [0, 4], size: [46, 30] },
    colors: {
      sand: '#d4ac6c', dirt: '#bf8d55', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a',
    },
  },

  mountains: { count: 32, distance: [500, 800], height: [60, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'platform',
      pos: HALL,
      tiers: [{ size: [32, 22], height: 0.9 }],
      stairWidth: 10,
      rise: 0.3,
      stairDepth: 0.5,
      colors: { stone: '#e3cfa6', stair: '#d8c095', fret: ['#b5523b', '#efe3c2'] },
    },
    { type: 'columns', from: [-13, -11.5], to: [13, -11.5], count: 6, radius: 0.55, height: COLUMN_H, broken: 0, color: '#efe3c2', capColor: '#c8912e', seed: 2 },
    { type: 'columns', from: [-13, -28.5], to: [-13, -14.5], count: 4, radius: 0.55, height: COLUMN_H, broken: 0, color: '#efe3c2', capColor: '#c8912e', seed: 3 },
    { type: 'columns', from: [13, -28.5], to: [13, -14.5], count: 4, radius: 0.55, height: COLUMN_H, broken: 0, color: '#efe3c2', capColor: '#c8912e', seed: 4 },
    { type: 'trees', count: 90, ring: [55, 220], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 200, ring: [30, 90], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],

  light: {
    glows: [{ pos: [BED[0], 2.4, BED[1]], size: 9, color: '#fff3d0', opacity: 0.35 }],
  },

  custom(ctx) {
    const { kit, scene } = ctx;
    const base = ctx.terrainHeight(...HALL) - 0.1;
    const top = base + COLUMN_H + 0.35;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(30, 0.9, 20), kit.stoneMat('#d8c095'));
    roof.position.set(HALL[0], top + 0.45, HALL[1]);
    const band = new THREE.Mesh(new THREE.BoxGeometry(30.4, 0.7, 20.4), kit.fretMat('#2f8f8a', '#efe3c2'));
    band.position.set(HALL[0], top + 1.25, HALL[1]);
    const back = new THREE.Mesh(new THREE.BoxGeometry(30, COLUMN_H, 0.8), kit.stoneMat('#b5523b'));
    back.position.set(HALL[0], base + COLUMN_H / 2 + 0.6, HALL[1] - 9.6);
    const comb = new THREE.Mesh(new THREE.BoxGeometry(16, 2.6, 0.7), kit.stoneMat('#b5523b'));
    comb.position.set(HALL[0], top + 2.9, HALL[1] - 3);
    for (const m of [roof, band, back, comb]) {
      m.castShadow = m.receiveShadow = true;
      scene.add(m);
    }
    ctx.addCollider({ x: HALL[0], z: HALL[1] - 9.6, hx: 15, hz: 0.4, rot: 0, top: base + COLUMN_H });

    const floorY = ctx.groundHeight(...BED);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.6), kit.toon('#8a5a3c'));
    bed.position.set(BED[0], floorY + 0.25, BED[1]);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 2.7), kit.toon('#efe3c2'));
    cover.position.set(BED[0], floorY + 0.55, BED[1]);
    for (const m of [bed, cover]) {
      m.castShadow = m.receiveShadow = true;
      scene.add(m);
    }
    ctx.addCollider({ x: BED[0], z: BED[1], hx: 0.85, hz: 1.35, rot: 0, top: floorY + 0.62, walkable: true });

    figure(ctx, { pos: [BED[0], BED[1] + 0.9], yaw: 0, pose: 'lie', clear: 1.4, colors: { robe: '#efe3c2', mantle: '#b5523b', skin: '#8a5a3b', hair: '#1f140e', sash: '#c8912e' } });
    figure(ctx, { pos: [-1.9, -20], yaw: -0.3, pose: 'lie', roll: 0.3, clear: 1.2, colors: { robe: '#2f8f8a', mantle: '#c8912e', skin: '#8a5a3b', hair: '#1f140e', sash: '#e9dcc0' } });
    figure(ctx, { pos: [2.3, -18.5], yaw: 0.9, pose: 'prone', roll: -0.2, clear: 1.2, colors: { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#b5825a', hair: '#2b1a12', sash: '#c8912e' } });
    [[-5, -17, 1.2], [5.5, -22, -0.8], [-6, -23.5, 2.6], [6.5, -16, 2], [-3.5, -14.8, 4.4], [8, -25, 0.4]].forEach(([x, z, yaw], i) => {
      figure(ctx, { pos: [x, z], yaw, pose: i % 2 ? 'prone' : 'lie', roll: i % 2 ? 0.25 : -0.25, clear: 1.1, colors: servantColors(i) });
    });

    figure(ctx, { pos: ABISH, facing: [0, 12], pose: 'raise', scale: 0.97, colors: { robe: '#c8912e', mantle: '#b5523b', skin: '#8a5a3b', hair: '#1f140e', sash: '#efe3c2', arms: [0.5, 1.5] } });

    const houses = [];
    for (let i = 0; i < 30; i++) {
      const a = -1.9 + (i / 29) * 3.8;
      const r = 38 + (i % 3) * 11;
      houses.push({ pos: [Math.sin(a) * r, 2 + Math.cos(a) * r], size: [6 + (i % 2), 5], rot: -a + Math.PI, height: 3 });
    }
    huts(ctx, houses, { wall: '#e0cba2', roof: '#a8784a' });
  },

  crowd: {
    seed: 24,
    minSpacing: 0.7,
    facing: [0, -18],
    colors: LAMANITES,
    aisles: [{ from: [0, 30], to: [0, -6], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: ABISH[0], z: ABISH[1], r: 2.4 }],
    groups: [
      { center: [0, -14], radius: [9, 26], angle: [-1.0, 1.0], count: 380, children: 0.12, facingJitter: 0.5 },
      { center: [-26, 6], radius: [0, 6], count: 30, children: 0.1, facing: [0, -12], lean: 0.2 },
      { center: [26, 4], radius: [0, 6], count: 30, children: 0.1, facing: [0, -12], lean: 0.2 },
    ],
  },

  player: {
    start: [-1.2, 5],
    lookAt: [0, -16],
    colors: { robe: '#a8552f', mantle: '#5e4632', skin: '#8a5a3b', hair: '#1f140e', sash: '#c8912e' },
  },
};
