// Omni 1:12-22: Mosiah leads his people out of the land of Nephi and they find the people of Zarahemla by the river Sidon.
import * as THREE from 'three';
import { BASE_STYLE, GROUND_COLORS, ROBES, boxes, figure, house, makeRng, between, raiseArm, water } from './lib/bom-13-kit.js';

const RIVER = { x: 36, half: 10 };
const MOSIAH = [-2.5, 6];
const ZARAHEMLA = [2.5, -2];
const MOSIAH_COLORS = { robe: '#efe3c2', mantle: '#2f6f8a', skin: '#a8724a', hair: '#3a2418', sash: '#c8912e' };
const ZARA_COLORS = { robe: '#c8912e', mantle: '#7a3a2a', skin: '#9c6a45', hair: '#1f140e', sash: '#e6d8b8' };

function city(ctx) {
  const rng = makeRng(15);
  const walls = ['#d9c49a', '#cdb48a', '#e3cfa6', '#c9a87a'];
  const roofs = ['#8a6a3a', '#a87b4f', '#6f5a3a'];
  const spots = [];
  for (let i = 0; i < 160; i++) {
    const x = between(rng, [-70, 22]);
    const z = between(rng, [-110, -26]);
    if (Math.abs(x - 2) < 7 && z > -80) continue;
    if (spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 9.5)) continue;
    spots.push([x, z]);
  }
  for (const [x, z] of spots) {
    if (Math.hypot(x, z + 85) < 22) continue;
    house(ctx, {
      pos: [x, z],
      rot: Math.round(between(rng, [-1, 1])) * 0.08 + (x < 2 ? Math.PI / 2 * (rng() < 0.3 ? 1 : 0) : 0),
      size: [between(rng, [5, 9]), between(rng, [4.5, 7])],
      height: between(rng, [3, 3.8]),
      stories: rng() < 0.15 ? 2 : 1,
      color: walls[Math.floor(rng() * walls.length)],
      roof: roofs[Math.floor(rng() * roofs.length)],
      trim: rng() < 0.3 ? ['#b5523b', '#e6d8b8'] : null,
    });
  }
}

function riverSide(ctx) {
  const y = 0.24;
  const len = 1100;
  water(ctx, new THREE.PlaneGeometry(RIVER.half * 2, len), y, {
    color: '#3f8fa0',
    shine: '#d6f0ea',
    sparkles: 220,
    area: (rng) => [RIVER.x + (rng() - 0.5) * RIVER.half * 1.8, (rng() - 0.5) * 300],
  }).position.x = RIVER.x;
  ctx.addCollider({ x: RIVER.x, z: 0, hx: RIVER.half - 0.6, hz: len / 2, rot: 0, top: 1.6 });

  const rng = makeRng(51);
  const reeds = [];
  for (let i = 0; i < 160; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const x = RIVER.x + side * (RIVER.half + between(rng, [-0.8, 1.6]));
    const z = between(rng, [-200, 200]);
    const h = between(rng, [0.8, 1.8]);
    reeds.push({ pos: [x, ctx.terrainHeight(x, z) + h / 2, z], size: [0.14, h * 0.7, 0.14], rotX: (rng() - 0.5) * 0.3, rotZ: (rng() - 0.5) * 0.3, color: rng() < 0.5 ? '#6c7a42' : '#8e9a58' });
  }
  boxes(ctx, reeds, { cast: false });

  const canoes = [];
  for (const [z, r] of [[-30, 0.1], [-24, -0.05], [-40, 0.2], [-12, 0.02]]) {
    const x = RIVER.x - RIVER.half + 1.2;
    canoes.push({ pos: [x, 0.35, z], size: [0.9, 0.45, 5], rot: r, color: '#6b4a33' });
  }
  boxes(ctx, canoes);
}

function bundles(ctx) {
  const rng = makeRng(77);
  const items = [];
  for (let i = 0; i < 40; i++) {
    const x = between(rng, [-22, 14]), z = between(rng, [12, 30]);
    if (ctx.blocked(x, z, 0.5)) continue;
    const s = between(rng, [0.4, 0.8]);
    items.push({ pos: [x, ctx.terrainHeight(x, z) + s * 0.3, z], size: [s, s * 0.6, s * 0.8], rot: rng() * 3, color: ['#a87b4f', '#c8a97a', '#8c5a3c', '#d9c7a3'][i % 4] });
  }
  boxes(ctx, items);
}

export default {
  title: 'Omni 1:12-22: Mosiah discovers Zarahemla',
  subtitle: 'The city of Zarahemla by the river Sidon',
  seed: 15,

  style: { ...BASE_STYLE, fog: { color: '#eedab0', near: 140, far: 1000 } },

  sky: { zenith: '#2f6f96', mid: '#78aac0', horizon: '#f2dcae', ground: '#c9b07a', glowColor: '#fff0c4', glowDir: [-0.6, 0.45, 0.4] },

  sun: { dir: [-0.55, 0.75, 0.4], color: '#fff0d4', intensity: 2.6, hemi: { sky: '#d6e6e6', ground: '#9a7a52', intensity: 1.1 }, shadowSize: 80 },

  ground: {
    size: 1400, segments: 280, flatRadius: 260, hillHeight: 34, undulation: 0.15,
    plaza: { center: [2, -60], size: [10, 50] },
    colors: { ...GROUND_COLORS, grass: '#86a058', grassDark: '#6a8444', sand: '#cdb07a' },
  },

  mountains: { count: 30, distance: [520, 760], height: [60, 160], widthRatio: [1.4, 2.4], colors: ['#7aa08a', '#6f9a8a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid', pos: [0, -88], base: [26, 26], tiers: 3, tierHeight: 3.4, inset: 2.6,
      stair: { width: 6, extra: 3, rise: 0.42 }, shrine: { size: [9, 7, 5], comb: 2.5 }, rubble: 0,
      colors: { stone: '#d9c49a', stair: '#cdb48a', shrine: '#8a6a3a', interior: '#2b1a12', fret: ['#7a3a2a', '#e6d8b8'], roofFret: ['#3e6e66', '#e6d8b8'] },
    },
    { type: 'trees', count: 140, ring: [70, 300], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'trees', count: 50, center: [RIVER.x + 40, 0], ring: [0, 28], height: [6, 12], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a'], seed: 8 },
  ],

  custom(ctx) {
    riverSide(ctx);
    city(ctx);
    const m = figure(ctx, MOSIAH_COLORS, MOSIAH, { facing: ZARAHEMLA, scale: 1.05 });
    raiseArm(ctx, m, MOSIAH_COLORS, 1, 1.4);
    const z = figure(ctx, ZARA_COLORS, ZARAHEMLA, { facing: MOSIAH, scale: 1.05 });
    raiseArm(ctx, z, ZARA_COLORS, -1, 1.2);
  },

  clouds: {
    layers: [{ count: 36, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a6078' }],
  },

  crowd: {
    seed: 15,
    minSpacing: 0.66,
    colors: ROBES,
    aisles: [{ from: [-9, 36], to: [-5, 9], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: 0, z: 2, r: 5 }],
    groups: [
      { shape: 'rect', center: [-6, 19], size: [26, 16], count: 240, facing: ZARAHEMLA, children: 0.18 },
      {
        shape: 'rect', center: [5, -11], size: [30, 11], count: 220, facing: MOSIAH, children: 0.15,
        colors: { ...ROBES, robes: ['#c8912e', '#a87b4f', '#7a6a52', '#6f8a6a', '#b5523b', '#d9c7a3', '#8c5a3c'], wraps: ['#c8912e', '#3e6e66', '#7a3a2a'] },
      },
    ],
  },

  player: {
    start: [-7, 14],
    lookAt: [8, -12],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
