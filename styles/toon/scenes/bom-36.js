// Helaman 7:10-14: Nephi bows on the tower in his garden, by the highway to the chief market of Zarahemla.
// Passers-by see his grief and gather in multitudes below.
// x is east, z is south. The highway runs east to the market; the garden lies north of it.
import * as THREE from 'three';
import { baseStyle, box, figure, groundSpec, house, jars, merge, NEPHITE, put, solid, trees, cyl, drapeRect } from './lib/bom-31-kit.js';

const TOWER = [-12, -9];
const TOWER_H = 7.5;

function stoneTower(ctx, [x, z]) {
  const y = ctx.terrainHeight(x, z) - 0.2;
  const s = 4.4;
  const k = ctx.kit;
  put(ctx, box(s, TOWER_H, s, 0, TOWER_H / 2, 0), '#d8c39a', x, z, { y, mat: k.stoneMat('#d8c39a') });
  put(ctx, box(s + 0.5, 0.5, s + 0.5, 0, TOWER_H + 0.2, 0), '#ffffff', x, z, { y, mat: k.fretMat('#3e8e6e', '#efe3c2') });
  const par = [];
  par.push(box(s + 0.5, 0.6, 0.35, 0, TOWER_H + 0.75, -(s + 0.15) / 2));
  for (const sx of [-1, 1]) par.push(box(0.35, 0.6, s + 0.5, (sx * (s + 0.15)) / 2, TOWER_H + 0.75, 0));
  put(ctx, merge(par), '#cdb48a', x, z, { y, mat: k.stoneMat('#cdb48a') });
  // Outer stair climbing the west face.
  const steps = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const top = ((i + 1) / n) * TOWER_H;
    steps.push(box(1.2, top, 0.7, -s / 2 - 0.6, top / 2, s / 2 + 1.5 - i * ((s + 1.2) / n)));
  }
  put(ctx, merge(steps), '#c3a676', x, z, { y, mat: k.stoneMat('#c3a676') });
  put(ctx, box(0.9, 1.7, 0.1, 0, 0.95, s / 2 + 0.02), '#2b1a12', x, z, { y, cast: false });
  solid(ctx, x, z, s / 2, s / 2, TOWER_H + 1.2);
  return y + TOWER_H + 0.45;
}

export default {
  title: 'Helaman 7:10-14: Nephi prays on his garden tower',
  subtitle: 'Zarahemla, on the highway to the chief market',
  seed: 7,

  style: baseStyle({ fog: { color: '#efd8ad', near: 130, far: 1000 } }),

  sky: { zenith: '#2f6f8c', mid: '#79acc0', horizon: '#f3dcaa', ground: '#d9b98a', glowColor: '#fff0c8', glowDir: [0.8, 0.5, 0.4] },

  sun: { dir: [0.55, 0.8, 0.45], color: '#fff2d8', intensity: 2.6, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 }, shadowSize: 80 },

  ground: groundSpec({
    hillHeight: 30, flatRadius: 170, undulation: 0.15,
    plaza: { center: [20, 0], size: [150, 8] },
    colors: { grass: '#8a9a54', grassDark: '#6c7a42' },
  }),

  mountains: { count: 30, distance: [520, 820], height: [70, 160], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'wall', from: [-34, -5.5], to: [-17, -5.5], height: 1.5, damage: 0, color: '#d6bf95', thickness: 0.6, rubble: 0 },
    { type: 'wall', from: [-7, -5.5], to: [4, -5.5], height: 1.5, damage: 0, color: '#d6bf95', thickness: 0.6, rubble: 0, seed: 2 },
    { type: 'wall', from: [-34, -5.5], to: [-34, -36], height: 1.5, damage: 0, color: '#d6bf95', thickness: 0.6, rubble: 0, seed: 3 },
    { type: 'wall', from: [4, -5.5], to: [4, -36], height: 1.5, damage: 0, color: '#d6bf95', thickness: 0.6, rubble: 0, seed: 4 },
    { type: 'wall', from: [-34, -36], to: [4, -36], height: 1.5, damage: 0, color: '#d6bf95', thickness: 0.6, rubble: 0, seed: 5 },
    {
      type: 'stepPyramid', pos: [96, -40], base: [26, 24], tiers: 4, tierHeight: 3, inset: 2.4,
      stair: { width: 6, extra: 2, rise: 0.42 }, shrine: { size: [9, 7, 5], comb: 3 }, rubble: 0,
      colors: { stone: '#e3cfa6', stair: '#d8c095', shrine: '#b5523b', interior: '#2b1a12', fret: ['#b5523b', '#efe3c2'], roofFret: ['#2f8f8a', '#efe3c2'] },
    },
    { type: 'trees', count: 70, ring: [120, 260], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  custom(ctx) {
    const top = stoneTower(ctx, TOWER);

    // Nephi bowed in prayer on the tower top.
    figure(ctx, { robe: '#efe3c2', mantle: '#b5523b', skin: '#a8724a', hair: '#d9c7a3', sash: '#c8912e', arms: [0.45, 2.2] }, TOWER[0], TOWER[1] + 1.4, { y: top, yaw: 0.35, kneel: true, scale: 1.45, clear: 0 });

    // The garden: fruit trees in rows, beds and a path.
    const orchard = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) orchard.push([-29 + i * 7 + (j % 2) * 2, -30 + j * 7, 4.5 + ((i + j) % 3) * 0.6]);
    trees(ctx, orchard.filter(([x, z]) => Math.hypot(x - TOWER[0], z - TOWER[1]) > 6), { leaves: ['#4f9a54', '#5f9e4a', '#3e8e4e'] });
    const fruit = [];
    orchard.forEach(([x, z, h], i) => {
      if (Math.hypot(x - TOWER[0], z - TOWER[1]) <= 6) return;
      for (let f = 0; f < 6; f++) {
        const a = f * 1.05 + i;
        fruit.push(new THREE.SphereGeometry(0.16, 6, 5).translate(x + Math.sin(a) * h * 0.3, ctx.terrainHeight(x, z) + h - 0.2 + (f % 2) * 0.6, z + Math.cos(a) * h * 0.3));
      }
    });
    put(ctx, merge(fruit), '#e0782c', 0, 0, { y: 0, cast: false });
    drapeRect(ctx, -12, -20, 2.2, 28, '#d9c39a', { lift: 0.06 });
    for (const [x, z] of [[-26, -9], [-2, -9], [-2, -24]]) drapeRect(ctx, x, z, 5, 2.4, '#7a5a3a', { lift: 0.06 });
    for (const [x, z] of [[-26, -9], [-2, -9], [-2, -24]]) {
      const blooms = [];
      for (let i = 0; i < 18; i++) blooms.push(new THREE.IcosahedronGeometry(0.18, 0).translate(x - 2.2 + (i % 6) * 0.9, ctx.terrainHeight(x, z) + 0.3, z - 0.8 + Math.floor(i / 6) * 0.8));
      put(ctx, merge(blooms), ['#e05a6a', '#f0c040', '#d0e070'][Math.abs(x) % 3], 0, 0, { y: 0, cast: false });
    }

    // Houses lining the south side of the highway.
    for (let i = 0; i < 9; i++) {
      const x = -40 + i * 13;
      house(ctx, x, 13 + (i % 2) * 1.5, { rot: 0 + Math.PI, w: 8, d: 6, h: 3.2 + (i % 3) * 0.4, color: ['#e3cfa6', '#d6bf95', '#cdb48a'][i % 3], roof: ['#a87b4f', '#8c5a3c'][i % 2], trim: i % 3 === 0 ? ['#b5523b', '#efe3c2'] : undefined });
    }
    for (let i = 0; i < 4; i++) house(ctx, 18 + i * 13, -14, { w: 8, d: 6, h: 3.4, color: ['#d6bf95', '#e3cfa6'][i % 2], roof: '#a87b4f' });

    // The chief market at the east end of the highway.
    const stalls = [[62, -9], [70, -9], [78, -9], [62, 9], [70, 9], [78, 9], [86, -9], [86, 9]];
    stalls.forEach(([x, z], i) => {
      const posts = [];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) posts.push(cyl(0.08, 0.08, 2.6, sx * 2.2, 1.3, sz * 1.6, 5));
      put(ctx, merge(posts), '#6b4a33', x, z);
      put(ctx, box(5, 0.12, 3.8, 0, 2.65, 0, { rx: z < 0 ? -0.15 : 0.15 }), ['#b5523b', '#2f8f8a', '#c8912e', '#efe3c2'][i % 4], x, z);
      put(ctx, box(4, 0.9, 1.2, 0, 0.45, z < 0 ? 0.8 : -0.8), '#9a7048', x, z);
      jars(ctx, x, z + (z < 0 ? -0.6 : 0.6), 4, { seed: i + 1 });
      solid(ctx, x, z, 2.3, 1.7, 2.6);
    });
  },

  crowd: {
    seed: 36,
    minSpacing: 0.62,
    facing: TOWER,
    colors: NEPHITE,
    aisles: [{ from: [-12, -3], to: [-12, -20], width: 2.4 }],
    groups: [
      { shape: 'rect', center: [-12, 1], size: [34, 8], count: 230, children: 0.15, facingJitter: 0.4 },
      { shape: 'rect', center: [-12, -1], size: [10, 6], count: 30, kneel: 0.3, facingJitter: 0.3 },
      { shape: 'rect', center: [74, 0], size: [30, 22], count: 110, children: 0.15, facingJitter: 3, facing: [74, 0] },
      { shape: 'rect', center: [25, 0], size: [40, 7], count: 45, facingJitter: 1.0 },
    ],
  },

  player: {
    start: [12, 4],
    lookAt: TOWER,
    colors: { robe: '#c8a97a', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#3e6e66' },
  },
};
