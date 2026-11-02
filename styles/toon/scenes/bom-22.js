// Alma 14: after the fire of the believers, the prison walls of Ammonihah fall and Alma and Amulek walk out free.
// x is east, z is south. The fallen prison stands north of the plaza; the burned pyre lies to the west.
import { NEPHITES, figure, huts, rods, toonStyle } from './lib/bom-19-kit.js';

const PRISON = [0, -16];
const ALMA = [-1.3, -2.5];
const AMULEK = [1.3, -2.8];
const PYRE = [-30, 6];

const scrolls = [];
for (let i = 0; i < 14; i++) {
  const a = i * 2.39, r = 3.2 + (i % 4) * 0.6;
  const x = PYRE[0] + Math.cos(a) * r, z = PYRE[1] + Math.sin(a) * r;
  scrolls.push({ from: [x - Math.sin(a) * 0.35, 0.07, z + Math.cos(a) * 0.35], to: [x + Math.sin(a) * 0.35, 0.07, z - Math.cos(a) * 0.35], ground: true });
}

const fleeing = (center, away, count) => ({ center, radius: [0, 6], count, facing: away, facingJitter: 0.6, lean: 0.35, children: 0.1 });

export default {
  title: 'Alma 14: Alma and Amulek in Ammonihah',
  subtitle: 'The prison walls fall and the people flee',
  seed: 14,

  style: { ...toonStyle({ fog: '#e2cfae', near: 100, far: 800 }), smoke: '#cdb89a', smokeShade: '#6a5648' },

  sky: { zenith: '#3f6d84', mid: '#a6b8ac', horizon: '#f0d9a8', ground: '#d2b48a', glowColor: '#fff0c8', glowDir: [0.2, 0.7, -1] },

  sun: {
    dir: [0.5, 0.8, 0.45],
    color: '#fff0d6',
    intensity: 2.5,
    hemi: { sky: '#d8e4dc', ground: '#a87a52', intensity: 1.1 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 130,
    hillHeight: 36,
    undulation: 0.3,
    plaza: { center: [0, -2], size: [44, 34] },
    colors: {
      sand: '#d4ac6c', dirt: '#bf8d55', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a',
    },
  },

  mountains: { count: 30, distance: [500, 800], height: [60, 160], widthRatio: [1.4, 2.4], colors: ['#7a9a8a', '#6a8c84', '#86a08a', '#8fa38f'] },

  objects: [
    { type: 'ruinHouse', pos: PRISON, size: [16, 11], height: 5, damage: 0.88, rot: 0, color: '#bfa27a', fallenRoof: true, rubble: 1.4, seed: 5 },
    { type: 'columns', from: [-9, -24], to: [9, -24], count: 5, radius: 0.5, height: 5, broken: 0.8, color: '#d2ba8f', capColor: '#c3a676', seed: 4 },
    { type: 'wall', from: [-24, -28], to: [-10, -26], height: 3, damage: 0.6, color: '#c9b087', fallSide: 1 },
    { type: 'wall', from: [10, -26], to: [26, -29], height: 3, damage: 0.55, color: '#c9b087', fallSide: 1 },
    { type: 'trees', count: 70, ring: [60, 200], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 300, center: PRISON, ring: [8, 30], size: [0.15, 0.55], colors: ['#bfa27a', '#a88a62', '#d2ba8f'], seed: 7 },
  ],

  cracks: [
    { from: [0, -9], angle: 0.1, length: 30, width: 0.35 },
    { from: [-4, -9], angle: -0.8, length: 22, width: 0.3 },
    { from: [5, -9], angle: 0.9, length: 26, width: 0.3 },
    { from: [-10, -14], angle: -1.6, length: 20, width: 0.3 },
    { from: [10, -14], angle: 1.5, length: 22, width: 0.3 },
  ],

  smolder: [
    { pos: PYRE, radius: 2.8, embers: 34, flames: 2, smoke: 12, logs: 6, smokeScale: 1.2, smokeHeight: 12 },
    { pos: [-4, -16], radius: 4, embers: 0, flames: 0, smoke: 7, logs: 0, smokeScale: 1.2, smokeHeight: 7, scorch: 0.1 },
    { pos: [5, -13], radius: 4, embers: 0, flames: 0, smoke: 6, logs: 0, smokeScale: 1.1, smokeHeight: 6, scorch: 0.1 },
  ],

  light: {
    glows: [
      { at: ALMA, lift: 1.1, size: 5.5, color: '#fff3d0', opacity: 0.55 },
      { at: AMULEK, lift: 1.1, size: 5.5, color: '#fff3d0', opacity: 0.45 },
    ],
    rayFans: [{ source: [0, 120, -30], sourceJitter: 30, target: [0, -3], groundY: 0, spread: [3, 14], count: 5, width: [[3, 5], [4, 7]], color: '#fff0c4', intensity: 0.18, stripes: 9, fadeLow: 0.3 }],
  },

  custom(ctx) {
    const houses = [];
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + 0.2;
      const r = 34 + (i % 4) * 9;
      const x = Math.sin(a) * r, z = -2 + Math.cos(a) * r;
      if (Math.hypot(x - PYRE[0], z - PYRE[1]) < 10) continue;
      if (z < -20 && Math.abs(x) < 30) continue;
      houses.push({ pos: [x, z], size: [6 + (i % 3), 5 + (i % 2)], rot: -a, height: 3 });
    }
    huts(ctx, houses, { wall: '#e0cba2', roof: '#a8784a' });

    rods(ctx, scrolls, '#4a3a2a', 0.09);

    const colors = (robe, mantle) => ({ robe, mantle, skin: '#a87650', hair: '#2b1a12', sash: '#c8912e', arms: [0.18, 0.15] });
    figure(ctx, { pos: ALMA, facing: [0, 30], glow: 0.12, colors: colors('#e6d8b8', '#4f7f80') });
    figure(ctx, { pos: AMULEK, facing: [0, 30], glow: 0.12, colors: colors('#d9c7a3', '#b5523b') });
  },

  crowd: {
    seed: 22,
    minSpacing: 0.75,
    facing: [0, 200],
    colors: NEPHITES,
    keepClear: [{ kind: 'circle', x: 0, z: -4, r: 8 }],
    groups: [
      fleeing([-12, 8], [-120, 140], 50),
      fleeing([12, 10], [120, 150], 50),
      fleeing([0, 22], [0, 200], 60),
      fleeing([-22, -4], [-200, 30], 30),
      fleeing([22, -6], [200, 10], 30),
      { center: [-36, 14], radius: [4, 8], count: 10, facing: PYRE, kneel: 0.3 },
    ],
  },

  player: {
    start: [3, 3.5],
    lookAt: [-0.5, -5],
    colors: { robe: '#7a6a52', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
