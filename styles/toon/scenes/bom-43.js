// 3 Nephi 18:1-12: Christ blesses bread and wine, and the Twelve carry it to the seated multitude.
// x is east, z is south. The temple stands to the north, Christ on the raised platform before it.
import * as THREE from 'three';
import { Batch, CHRIST_COLORS, CROWD, GROUND, ball, box, cyl, glow, hold, person, toonStyle } from './lib/bom-43-kit.js';

const CHRIST = [0, -22];
const TABLE = [0, -19.7];

const DISCIPLE_ROBES = ['#efe3c2', '#e6d8b8', '#d9c7a3'];
const DISCIPLE_MANTLES = ['#2f8f8a', '#3e6e66', '#4f7f80', '#b5523b', '#c8912e', '#6f8a6a'];

// The Twelve, out among the people along the aisles. Each carries bread or a cup.
const TWELVE = [
  { pos: [-1.6, 4], face: [-6, 4], item: 'bread' },
  { pos: [1.7, 12], face: [6, 12], item: 'cup' },
  { pos: [-1.6, 21], face: [-6, 21], item: 'cup' },
  { pos: [1.6, 30], face: [6, 30], item: 'bread' },
  { pos: [-13.5, 0.5], face: [-17, 4], item: 'bread' },
  { pos: [-19.8, 7.6], face: [-22, 3], item: 'cup' },
  { pos: [-27, 15], face: [-24, 19], item: 'bread' },
  { pos: [13.5, 0.5], face: [17, 4], item: 'cup' },
  { pos: [20, 7.7], face: [22, 3], item: 'bread' },
  { pos: [27, 15], face: [24, 19], item: 'cup' },
  { pos: [-4.2, -6.8], face: [-8, -4], item: 'bread' },
  { pos: [4.2, -6.8], face: [8, -4], item: 'cup' },
];

function custom(ctx) {
  const b = new Batch(ctx);
  const ty = ctx.groundHeight(...TABLE);

  b.add('#c9a87a', box(3.2, 0.85, 1.0, [TABLE[0], ty + 0.42, TABLE[1]]), { stone: true });
  b.add('#efe3c2', box(3.4, 0.05, 1.15, [TABLE[0], ty + 0.87, TABLE[1]]));
  b.add('#b5523b', box(3.42, 0.22, 0.04, [TABLE[0], ty + 0.75, TABLE[1] + 0.58]));
  for (const dx of [-1.1, -0.5, 0.6]) b.add('#d9a75a', ball(0.2, [TABLE[0] + dx, ty + 0.97, TABLE[1] - 0.1], [1.3, 0.55, 1]));
  for (const dx of [0.1, 1.2]) {
    b.add('#c8912e', cyl(0.12, 0.08, 0.3, [TABLE[0] + dx, ty + 1.05, TABLE[1] + 0.15]));
    b.add('#6b1f2a', cyl(0.1, 0.1, 0.02, [TABLE[0] + dx, ty + 1.2, TABLE[1] + 0.15]));
  }
  b.add('#b5623b', cyl(0.28, 0.2, 0.8, [TABLE[0] + 2.2, ty + 0.4, TABLE[1]]));
  b.add('#b5623b', cyl(0.12, 0.2, 0.25, [TABLE[0] + 2.2, ty + 0.9, TABLE[1]]));
  for (const [dx, dz] of [[-2.3, 0.2], [-2.6, -0.6]]) {
    const y = ctx.groundHeight(TABLE[0] + dx, TABLE[1] + dz);
    b.add('#a8743f', cyl(0.42, 0.34, 0.4, [TABLE[0] + dx, y + 0.2, TABLE[1] + dz], [0, 0, 0], 10));
    for (let k = 0; k < 4; k++) b.add('#d9a75a', ball(0.15, [TABLE[0] + dx + Math.cos(k * 1.6) * 0.18, y + 0.44, TABLE[1] + dz + Math.sin(k * 1.6) * 0.18], [1.3, 0.6, 1]));
  }
  ctx.addCollider({ x: TABLE[0], z: TABLE[1], hx: 1.6, hz: 0.5, rot: 0, top: ty + 0.9 });
  b.flush();

  const breadGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 12);
  const loafGeo = new THREE.SphereGeometry(0.11, 8, 6).scale(1.4, 0.6, 1).translate(0, 0.06, 0);
  const cupGeo = new THREE.CylinderGeometry(0.1, 0.06, 0.22, 10);
  TWELVE.forEach((d, i) => {
    const colors = { robe: DISCIPLE_ROBES[i % 3], mantle: DISCIPLE_MANTLES[i % DISCIPLE_MANTLES.length], skin: ['#9c6a45', '#a87650', '#8a5a3b'][i % 3], hair: '#2b1a12', sash: '#c8912e', arms: [0.12, 1.05] };
    const fig = person(ctx, colors, d.pos, d.face, { scale: 1.02, clear: 1.1 });
    if (d.item === 'bread') {
      hold(ctx, fig, breadGeo, '#a8743f', { at: [0, 1.0, 0.5] });
      hold(ctx, fig, loafGeo, '#e0b06a', { at: [0, 1.03, 0.5] });
    } else {
      hold(ctx, fig, cupGeo, '#c8912e', { at: [0, 1.06, 0.5] });
    }
  });

  glow(ctx, [CHRIST[0], ctx.groundHeight(...CHRIST) + 1.3, CHRIST[1]], 4.5, '#fff3d0', { opacity: 0.55 });
}

export default {
  title: '3 Nephi 18:1-12: The sacrament in Bountiful',
  subtitle: 'Bread and wine passed among the seated multitude',
  seed: 43,
  custom,

  style: toonStyle({ fog: '#f0d2a4', near: 120, far: 1000 }),

  sky: { zenith: '#2f5f78', mid: '#6f9fa6', horizon: '#f6c98a', ground: '#d9b98a', glowColor: '#ffe2a8', glowDir: [-0.8, 0.35, 0.3] },

  sun: { dir: [-0.65, 0.6, 0.45], color: '#ffe4bc', intensity: 2.5, hemi: { sky: '#d9e4d8', ground: '#b07a52', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1400, segments: 280, flatRadius: 150, hillHeight: 36, undulation: 0.3,
    plaza: { center: [0, -40], size: [72, 70] },
    colors: GROUND,
  },

  mountains: { count: 34, distance: [520, 800], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid', pos: [0, -54], base: [40, 40], tiers: 5, tierHeight: 3.4, inset: 2.8,
      stair: { width: 9, extra: 3, rise: 0.42 }, shrine: { size: [12, 9, 6], comb: 3.5 }, rubble: 20,
      colors: { stone: '#e3cfa6', stair: '#d8c095', shrine: '#b5523b', interior: '#2b1a12', fret: ['#b5523b', '#efe3c2'], roofFret: ['#2f8f8a', '#efe3c2'] },
    },
    {
      type: 'platform', pos: [0, -17],
      tiers: [{ size: [20, 15], height: 0.8 }, { size: [7, 6], height: 0.8, offset: [0, -3.5] }],
      stairWidth: 6, rise: 0.27, stairDepth: 0.45,
      colors: { stone: '#e8d6ae', stair: '#dcc69a', fret: ['#2f8f8a', '#efe3c2'] },
    },
    { type: 'ruinHouse', pos: [-64, -12], size: [10, 8], height: 4, damage: 0.55, rot: 0.2, color: '#cdb48a' },
    { type: 'ruinHouse', pos: [-74, 22], size: [8, 8], height: 3.5, damage: 0.7, rot: -0.1, color: '#c2a27a', fallenRoof: true },
    { type: 'ruinHouse', pos: [64, -8], size: [9, 9], height: 4, damage: 0.6, rot: -0.25, color: '#cdb48a' },
    { type: 'ruinHouse', pos: [72, 30], size: [11, 8], height: 3.8, damage: 0.6, rot: 0.1, color: '#d6bf95', trimBand: ['#b5523b', '#e3cfa6'] },
    { type: 'ruinHouse', pos: [-40, 76], size: [10, 8], height: 4, damage: 0.65, rot: 0.6, color: '#d6bf95' },
    { type: 'ruinHouse', pos: [38, 80], size: [9, 9], height: 4, damage: 0.6, rot: -0.4, color: '#c2a27a', fallenRoof: true },
    { type: 'columns', from: [-26, -36], to: [-26, -70], count: 6, radius: 0.6, height: 6, broken: 0.4, color: '#e3cfa6', capColor: '#d8c095' },
    { type: 'columns', from: [26, -36], to: [26, -70], count: 6, radius: 0.6, height: 6, broken: 0.5, color: '#e3cfa6', capColor: '#d8c095', seed: 19 },
    { type: 'trees', count: 110, ring: [80, 240], height: [5, 10], broken: 0.15, fallen: 0.1, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 400, ring: [50, 130], size: [0.12, 0.45], colors: ['#cdb48a', '#b89a70', '#d9c39a', '#a58a66'] },
  ],

  clouds: {
    layers: [
      { count: 40, distance: [380, 800], height: [90, 200], size: [35, 75], color: '#fff0d8', shade: '#6a4a52' },
      { count: 14, center: CHRIST, distance: [45, 110], height: [130, 170], size: [25, 45], color: '#fff6e4', shade: '#7a5a62', drift: 0.004 },
    ],
  },

  light: {
    beams: [{ from: [0, 170, -22], to: { at: CHRIST, lift: 1.4 }, width: [8, 4], color: '#fff2c9', intensity: 0.16, layers: 2, stripes: 22, fadeLow: 0.04 }],
    pointLights: [{ at: CHRIST, lift: 2.5, color: '#ffe6b0', intensity: 12, distance: 18 }],
  },

  figures: [
    { pos: CHRIST, facing: [0, 30], scale: 1.12, glow: 0.4, clearRadius: 1.5, colors: { ...CHRIST_COLORS, arms: [0.25, 0.85] } },
  ],

  crowd: {
    seed: 43,
    minSpacing: 0.66,
    facing: CHRIST,
    colors: CROWD,
    aisles: [
      { from: [0, 48], to: [0, -9], width: 3.2 },
      { from: [-36, 26], to: [-9, -7], width: 2.8 },
      { from: [36, 26], to: [9, -7], width: 2.8 },
    ],
    keepClear: [{ kind: 'rect', x: 0, z: -17, hx: 11, hz: 8.6 }],
    groups: [
      { center: [0, -17], radius: [12.5, 46], angle: [-1.95, 1.95], count: 2300, kneel: 0.88, children: 0.14 },
      { shape: 'rect', center: [-34, -48], size: [14, 28], count: 110, kneel: 0.8, children: 0.1 },
      { shape: 'rect', center: [34, -48], size: [14, 28], count: 110, kneel: 0.8, children: 0.1 },
    ],
  },

  player: {
    start: [0, 1],
    lookAt: CHRIST,
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
