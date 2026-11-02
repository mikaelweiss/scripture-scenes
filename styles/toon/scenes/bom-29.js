// Alma 32:4-5: on the hill Onidah, Alma teaches the poor who were cast out of the Zoramite synagogues.
// The poor sit on the slope below him. Antionum and its synagogue tower stand on the plain to the east.
import * as THREE from 'three';
import { add, baseStyle, block, clothes, fretBand, groundColors, houses, mound, person } from './lib/bom-25-kit.js';

const HILL = { x: 0, z: -20, radius: 28, height: 7.5 };
const ALMA = [0, -21];
const CITY = [120, 10];

const POOR = {
  robes: ['#c9b48e', '#a89878', '#b89a70', '#8f7f66', '#9a8a72', '#7f8a7a', '#a07a5e', '#d0c2a0', '#8a6e5a', '#6f7f80', '#a8826a'],
  mantles: ['#7a6a52', '#5e4632', '#8a7a62', '#9c8a6e', '#6f7f80', '#8c6a4a', '#b5a27e'],
  skins: clothes.skins,
  hair: clothes.hair,
  wraps: ['#c2b08a', '#a89878', '#8a7a62'],
};

function city(ctx) {
  const [cx, cz] = CITY;
  const y = ctx.terrainHeight(cx, cz) - 0.2;
  block(ctx, [26, 9, 20], [cx, y, cz], '#e8d6ae');
  fretBand(ctx, [26.4, 1.2, 20.4], [cx, y + 7.4, cz], ['#5b3a6e', '#d9a441']);
  block(ctx, [27, 0.6, 21], [cx, y + 9, cz], '#cdb48a', { collide: false });
  block(ctx, [3, 7, 3], [cx, y + 9.6, cz], '#e8d6ae', { collide: false });
  fretBand(ctx, [3.3, 1, 3.3], [cx, y + 15, cz], ['#8c2f3a', '#d9a441']);
  add(ctx, new THREE.BoxGeometry(4, 0.4, 4), ctx.kit.toon('#d9a441'), { pos: [cx, y + 16.8, cz] });
  ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: 15, hz: 12 });
  houses(ctx, { center: CITY, ring: [16, 60], count: 46, colors: ['#e8d6ae', '#d6bf95', '#cdb48a'], roof: '#5b3a6e', seed: 29, size: [4, 8] });
}

function hill(ctx) {
  mound(ctx, { ...HILL, color: '#8a9a5a', cell: 1.2 });
  const top = ctx.groundHeight(...ALMA);
  const rock = add(ctx, new THREE.DodecahedronGeometry(1.8, 0), ctx.kit.stoneMat('#a58a66'), { pos: [ALMA[0], top - 0.8, ALMA[1]] });
  rock.scale.set(1.4, 0.7, 1.1);
  ctx.addCollider({ x: ALMA[0], z: ALMA[1], hx: 1.7, hz: 1.2, rot: 0, top: top + 0.45, walkable: true });
  for (const [x, z, s] of [[-7, -25, 1.4], [8, -27, 1.8], [-13, -14, 1.1], [12, -12, 1.2], [4, -33, 1.5]]) {
    const r = add(ctx, new THREE.DodecahedronGeometry(s, 0), ctx.kit.stoneMat('#9c8264'), { pos: [x, ctx.groundHeight(x, z) - s * 0.4, z] });
    r.rotation.set(0.3, x, 0.2);
    ctx.exclude({ kind: 'circle', x, z, r: s + 0.4 });
  }
  person(ctx, { robe: '#f3eddf', mantle: '#d9c7a3', skin: '#b5825a', hair: '#e6dcc8', sash: '#8c5a3c', arms: [0.75, 0.55] }, ALMA, [0, 0], { y: top + 0.45, scale: 1.05, clear: 2 });
  person(ctx, { robe: '#a87b4f', mantle: '#e6d8b8', skin: '#a87650', hair: '#3a2418' }, [-3, -22.5], [0, -12], { clear: 1 });
  person(ctx, { robe: '#8c5a3c', mantle: '#d9c7a3', skin: '#b5825a', hair: '#4a3020' }, [3.2, -22.8], [0, -12], { clear: 1 });
  // The man who speaks for the poor, standing before Alma.
  person(ctx, { robe: '#8a7a62', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', arms: [0.4, 0.9] }, [0.6, -17.6], ALMA, { clear: 1 });
}

export default {
  title: 'Alma 32:4-5: Alma teaches the poor',
  subtitle: 'The hill Onidah, outcasts turned away from the synagogues',
  seed: 32,

  style: { ...baseStyle, fog: { color: '#ecd6ac', near: 160, far: 1100 } },

  sky: { zenith: '#2f6a8a', mid: '#80aab0', horizon: '#f6d8a0', ground: '#c9b07a', glowColor: '#ffe2a6', glowDir: [-0.7, 0.3, 0.3] },

  sun: { dir: [-0.65, 0.6, 0.45], color: '#ffeccc', intensity: 2.5, hemi: { sky: '#dcecdc', ground: '#a07a52', intensity: 1.15 }, shadowSize: 70 },

  ground: {
    size: 1600, segments: 300, flatRadius: 170, hillHeight: 45, undulation: 0.35,
    plaza: { center: [0, 2000], size: [1, 1] },
    colors: { ...groundColors, sand: '#c4a86c', dirt: '#ad8a55', grass: '#8a9a5a', grassDark: '#6c7a42' },
  },

  mountains: { count: 32, distance: [520, 800], height: [80, 190], widthRatio: [1.4, 2.4], colors: ['#7a9a8a', '#6a8c84', '#8aa08a', '#96a38f'] },

  objects: [
    { type: 'trees', count: 90, ring: [45, 220], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#4f8a5e', '#5f9a64', '#3e7e5a', '#6f9e5a'] },
    { type: 'stones', count: 300, ring: [34, 110], size: [0.12, 0.4], colors: ['#a58a66', '#8a6e50', '#b89a70'] },
  ],

  custom(ctx) {
    city(ctx);
    hill(ctx);
  },

  clouds: { layers: [{ count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff4e0', shade: '#6a6a82' }] },

  light: {
    glows: [{ at: ALMA, lift: 1.7, size: 5, color: '#fff3d0', opacity: 0.4 }],
  },

  crowd: {
    seed: 29,
    minSpacing: 0.66,
    facing: ALMA,
    colors: POOR,
    aisles: [{ from: [0, 14], to: [0, -15], width: 3 }],
    groups: [
      { center: ALMA, radius: [4.5, 24], angle: [-1.5, 1.5], count: 440, kneel: 0.75, children: 0.18, lean: 0.12 },
      { center: ALMA, radius: [4, 14], angle: [1.5, 2.2], count: 50, kneel: 0.6, children: 0.15 },
      { center: ALMA, radius: [4, 14], angle: [-2.2, -1.5], count: 50, kneel: 0.6, children: 0.15 },
    ],
  },

  player: {
    start: [0, -5],
    lookAt: ALMA,
    colors: { robe: '#8a7a62', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c2b08a' },
  },
};
