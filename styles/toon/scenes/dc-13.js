// D&C 136: Winter Quarters on the west bank of the Missouri, January 1847.
// Log cabins in rows, covered wagons and ox teams, smoke from every chimney. Companies gather to be organized.
// x is east, z is south. The river lies to the east.
import { Batch, SAINTS, baseStyle, box, campfire, logCabin, makeRng, pineTree, saint, smoke, wagon, water } from './lib/dc-08-kit.js';

const RIVER_X = 92;
const START = [-2, 42];

function custom(ctx) {
  const { THREE } = ctx;
  const rng = makeRng(1847);
  const b = new Batch(ctx);

  // The Missouri, cold and grey, with ice along its edges.
  const s = new THREE.Shape();
  s.moveTo(RIVER_X, -900);
  s.lineTo(RIVER_X + 6, -200);
  s.lineTo(RIVER_X - 4, 0);
  s.lineTo(RIVER_X + 4, 200);
  s.lineTo(RIVER_X, 900);
  s.lineTo(900, 900);
  s.lineTo(900, -900);
  s.closePath();
  water(ctx, { shapes: [s], y: 0.06, color: '#5a7488', glint: '#e8f0f4', glints: 90 });
  for (let i = 0; i < 70; i++) {
    const z = -250 + rng() * 500, x = RIVER_X + 2 + rng() * (rng() < 0.6 ? 12 : 80);
    b.add('#eef3f6', box(2 + rng() * 5, 0.12, 1.5 + rng() * 4, [x, 0.1, z], [0, rng() * 3, 0]), { cast: false });
  }
  ctx.addCollider({ x: RIVER_X + 300, z: 0, hx: 302, hz: 900, rot: 0, top: 0.8 });

  // Rows of log cabins on a grid, with a broad street through the middle.
  const chimneys = [];
  for (let x = -70; x <= 70; x += 14) {
    for (let z = -90; z <= 60; z += 15) {
      if (Math.abs(x) < 9) continue;
      if (Math.hypot(x - START[0], z - START[1]) < 14) continue;
      if (rng() < 0.12) continue;
      const rot = z % 30 === 0 ? 0 : Math.PI;
      const c = logCabin(b, ctx, { pos: [x + (rng() - 0.5) * 2, z + (rng() - 0.5) * 2], size: [5 + rng() * 2, 4.4 + rng()], height: 2.2 + rng() * 0.4, rot, snow: true, log: ['#7a5636', '#6a4a30', '#86603c'][Math.floor(rng() * 3)] });
      if (c && rng() < 0.75) chimneys.push(c);
    }
  }
  smoke(ctx, chimneys, { color: '#eeedeb', puffs: 5, rise: 7, size: 0.45 });

  // Wagons drawn up along the street and on the open ground by the river.
  const covers = ['#ece4cf', '#e4dac0', '#f0eadc', '#ddd2b8'];
  const teams = [['#5a4030', '#e8dcc8'], ['#8a6a4a', '#3a2a20'], ['#a07850', '#6a4a32']];
  [-70, -54, -38, -22, 10].forEach((z, i) => wagon(b, ctx, { pos: [i % 2 ? 5.5 : -5.5, z], rot: Math.PI, cover: covers[i % 4], team: i % 2 ? 'ox' : null, teamColors: teams[i % 3], snow: true }));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    wagon(b, ctx, { pos: [80 + Math.sin(a) * 2 - 6, -20 + Math.cos(a) * 14], rot: a + Math.PI / 2, cover: covers[i % 4], team: null, snow: true });
  }

  // Campfires where companies gather.
  for (const p of [[2.5, 4], [-3, -32], [70, -20]]) campfire(b, ctx, { pos: p });

  // Bare cottonwoods along the river, snowy cedars on the bluffs behind the camp.
  for (let i = 0; i < 50; i++) pineTree(b, ctx, { pos: [RIVER_X - 4 - rng() * 12, -250 + rng() * 500], height: 8 + rng() * 6, bare: true });
  for (let i = 0; i < 120; i++) {
    const a = rng() * Math.PI * 2, r = 110 + rng() * 200;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (x > RIVER_X - 20) continue;
    pineTree(b, ctx, { pos: [x, z], height: 6 + rng() * 6, color: '#4a6650', snow: true });
  }
  b.flush();

  // Brigham Young addresses a company in the street.
  saint(ctx, { pos: [0, -6], face: [0, 10], colors: { robe: '#2b2a2e', mantle: '#3d3a44', skin: '#e8c4a0', hair: '#a07850', tall: true }, scale: 1.05 });
}

export default {
  title: 'D&C 136: Winter Quarters',
  subtitle: 'The camp of Israel on the Missouri, January 1847',
  seed: 136,

  style: baseStyle({ color: '#dfe4ea', near: 80, far: 650 }, { ink: '#2a2a32' }),

  sky: { zenith: '#8e9aa8', mid: '#b4bec8', horizon: '#e4e6e8', ground: '#e8ecf0', glowColor: '#f2f0ea', glowDir: [0, 0.35, 1] },

  sun: {
    dir: [0.35, 0.7, -0.6],
    color: '#f0f2f6',
    intensity: 1.3,
    hemi: { sky: '#e6ecf4', ground: '#a8acb4', intensity: 1.35 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 130,
    hillHeight: 34,
    undulation: 0.35,
    plaza: { center: [0, -15], size: [16, 150] },
    colors: {
      sand: '#eef2f6', dirt: '#e2e8ee', grass: '#f4f6f8', grassDark: '#ccd4dc', plaza: '#dedad2',
      plazaLine: '#dedad2', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#eef2f6',
    },
  },

  mountains: { count: 30, distance: [600, 800], height: [40, 90], widthRatio: [2.5, 4], colors: ['#c8d0d8', '#bcc6d0', '#d4dae0'] },

  objects: [],
  custom,

  crowd: {
    seed: 47,
    minSpacing: 0.8,
    facing: [0, -6],
    colors: SAINTS,
    keepClear: [{ kind: 'circle', x: 0, z: -6, r: 3 }],
    groups: [
      { center: [0, -6], radius: [3.5, 12], angle: [-1.4, 1.4], count: 140, children: 0.2 },
      { shape: 'rect', center: [0, 20], size: [10, 20], count: 30, children: 0.2, facingJitter: 3 },
      { center: [2.5, 4], radius: [1.6, 3], count: 10, children: 0.2, facing: [2.5, 4], facingJitter: 0.3 },
      { center: [-3, -32], radius: [1.6, 3], count: 10, children: 0.2, facing: [-3, -32], facingJitter: 0.3 },
      { center: [70, -20], radius: [1.6, 3.5], count: 14, children: 0.2, facing: [70, -20], facingJitter: 0.3 },
      { shape: 'rect', center: [0, -55], size: [8, 50], count: 40, children: 0.15, facingJitter: 3 },
    ],
  },

  player: {
    start: START,
    lookAt: [6, -20],
    colors: { robe: '#3a3328', mantle: '#6a3a34', skin: '#e8c4a0', hair: '#5a3a22', sash: '#2b2420' },
  },
};
