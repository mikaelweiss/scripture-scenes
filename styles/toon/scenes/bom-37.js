// Helaman 13-16: Samuel the Lamanite preaches from the wall of Zarahemla. The arrows and stones cannot hit him.
import { BASE_STYLE, GROUND_COLORS, MOUNTAINS, ROBES, banners, cityWall, figure, raiseArm, town, volley, makeRng, between } from './lib/bom-37-kit.js';

const WALL_Z = -22;
const SAMUEL = [0, WALL_Z];
const SAMUEL_COLORS = { robe: '#8e2b2b', mantle: '#e6d8b8', skin: '#5e3b26', hair: '#1f140e', sash: '#c8912e' };
const SHOOTER = { robe: '#7a6a52', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12' };

export default {
  title: 'Helaman 13-16: Samuel the Lamanite on the wall',
  subtitle: 'Zarahemla, the arrows and stones cannot touch him',
  seed: 37,

  style: { ...BASE_STYLE, fog: { color: '#eedcb6', near: 120, far: 900 } },

  sky: { zenith: '#3a74a0', mid: '#80b2c6', horizon: '#f3dcae', ground: '#d9b98a', glowColor: '#fff2c8', glowDir: [0.3, 0.5, -1] },

  sun: { dir: [0.4, 0.75, 0.6], color: '#fff2da', intensity: 2.6, hemi: { sky: '#d6e6ee', ground: '#b07a52', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1200, segments: 240, flatRadius: 140, hillHeight: 30, undulation: 0.2,
    plaza: { center: [0, -4], size: [64, 34] },
    colors: GROUND_COLORS,
  },

  mountains: MOUNTAINS,

  objects: [
    { type: 'trees', count: 90, center: [0, -40], ring: [40, 200], angle: [1.9, 4.4], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'trees', count: 50, ring: [130, 260], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#5f9e6a'], seed: 9 },
    { type: 'stones', count: 140, center: [0, -4], ring: [2, 30], size: [0.1, 0.28], colors: ['#cdb48a', '#b89a70', '#8a7a66'] },
  ],

  custom(ctx) {
    const wall = cityWall(ctx, { from: [-110, WALL_Z], to: [110, WALL_Z], height: 6.5, thickness: 3.2, color: '#d2ba8f', cap: '#b89a70', gate: [46, 6], open: [[-4, 4]] });
    for (const x of [-60, 60]) cityWall(ctx, { from: [x * 1.83, WALL_Z], to: [x * 1.83, 120], height: 7.5, thickness: 3.2, color: '#d2ba8f', cap: '#b89a70' });
    banners(ctx, [-30, -14, 14, 30].map((x, i) => ({ x, z: WALL_Z, y: wall.top, height: 3.5, color: i % 2 ? '#b5523b' : '#2f8f8a' })));

    const samuel = figure(ctx, SAMUEL_COLORS, [SAMUEL[0], SAMUEL[1] + 0.9], { y: wall.top, facing: [0, 20], scale: 1.5, clear: 0 });
    raiseArm(ctx, samuel, SAMUEL_COLORS, 1, 2.6);
    raiseArm(ctx, samuel, SAMUEL_COLORS, -1, 1.1, 0.6);

    const rng = makeRng(37);
    const from = [];
    for (let i = 0; i < 12; i++) {
      const x = (rng() < 0.5 ? -1 : 1) * between(rng, [3, 22]), z = between(rng, [-14, -4]);
      const f = figure(ctx, SHOOTER, [x, z], { facing: [SAMUEL[0], SAMUEL[1]], clear: 0.7 });
      raiseArm(ctx, f, SHOOTER, rng() < 0.5 ? 1 : -1, 2.4, 0.5);
      from.push([x, ctx.terrainHeight(x, z) + 2.1, z]);
    }
    volley(ctx, { from, target: [SAMUEL[0], wall.top + 1.0, SAMUEL[1]], count: 22, miss: [1.6, 3.6], speed: 0.4 });

    town(ctx, {
      seed: 3, count: 34, area: [-100, 32, 100, 115],
      facing: [0, 0],
      colors: ['#e3cfa6', '#d9c49a', '#cdb48a', '#e8d6ae'],
      roofs: ['#b98a5a', '#a87b4f', '#c49a68'],
      trims: [['#b5523b', '#efe3c2'], ['#2f8f8a', '#efe3c2'], ['#c8912e', '#efe3c2']],
    });
    town(ctx, {
      seed: 5, count: 14, area: [-100, -14, -45, 32],
      facing: [0, 0],
      colors: ['#e3cfa6', '#d9c49a', '#cdb48a'],
      roofs: ['#b98a5a', '#a87b4f'],
    });
    town(ctx, {
      seed: 6, count: 12, area: [45, -10, 100, 32],
      facing: [0, 0],
      colors: ['#e3cfa6', '#d9c49a', '#cdb48a'],
      roofs: ['#b98a5a', '#a87b4f'],
    });
  },

  clouds: {
    layers: [{ count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a5a78' }],
  },

  crowd: {
    seed: 37,
    minSpacing: 0.66,
    facing: [SAMUEL[0], SAMUEL[1]],
    colors: ROBES,
    aisles: [{ from: [0, 30], to: [0, -6], width: 3.4 }],
    groups: [
      { center: [0, WALL_Z], radius: [9, 42], angle: [-1.3, 1.3], count: 900, kneel: 0.02, children: 0.08 },
          ],
  },

  player: {
    start: [0, -1],
    lookAt: [0, WALL_Z],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
