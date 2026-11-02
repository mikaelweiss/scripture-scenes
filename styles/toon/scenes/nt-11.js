// Matthew 5-7. Jesus seated on a hillside above the Sea of Galilee, the multitude on the grass below him.
// x is east, z is south. The lake fills the low basin around the origin, the hill rises to the south.
import * as THREE from 'three';
import { JESUS, JUDEANS, addMesh, calmWater, doves, figure, glow, leafyTrees, makeRng, reshapeGround, tufts } from './lib/nt-07-kit.js';

const SEGMENTS = 280;
const SHORE = 52;
const WATER_Y = 0.35;
const SEAT = [0, 118];

function boulders(ctx, list, color = '#a89a80') {
  const geos = [];
  for (const [x, z, s, sy = 0.6] of list) {
    const g = new THREE.IcosahedronGeometry(s, 0);
    g.scale(1.2, sy, 1);
    g.translate(x, ctx.terrainHeight(x, z) + s * sy * 0.35, z);
    geos.push(g);
    ctx.addCollider({ x, z, hx: s * 0.9, hz: s * 0.8, rot: 0, top: ctx.terrainHeight(x, z) + s * sy * 0.9 });
    ctx.exclude({ kind: 'circle', x, z, r: s * 1.1 });
  }
  addMesh(ctx.scene, geos, ctx.kit.toon(color));
}

export default {
  title: 'Matthew 5-7: The Sermon on the Mount',
  subtitle: 'A hillside above the Sea of Galilee',
  seed: 211,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e6ead8', near: 140, far: 900 },
  },

  sky: { zenith: '#3a78a8', mid: '#8fbfd0', horizon: '#f2e6c4', ground: '#c9d6cc', glowColor: '#fff2cc', glowDir: [0.4, 0.7, -0.3] },

  sun: { dir: [0.4, 0.8, -0.35], color: '#fff0d6', intensity: 2.5, hemi: { sky: '#dcecf0', ground: '#8a9a6a', intensity: 1.15 }, shadowSize: 70 },

  ground: {
    size: 1400,
    segments: SEGMENTS,
    flatRadius: 60,
    hillHeight: 40,
    undulation: 0.3,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#c9b07a', dirt: '#a8a060', grass: '#8ea85a', grassDark: '#6c8a42', plaza: '#e6d4ae', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#86a25e' },
  },

  mountains: { count: 30, distance: [560, 680], height: [60, 130], widthRatio: [1.6, 2.6], colors: ['#7f9a8a', '#8aa294', '#96a898'] },

  objects: [
    { type: 'stones', count: 300, center: SEAT, ring: [4, 90], size: [0.12, 0.4], colors: ['#b8a07a', '#9a8a70', '#cdb48a'] },
    { type: 'trees', count: 60, ring: [140, 320], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b5a44', leafColors: ['#7d9070', '#8a9a72', '#6f8460'] },
  ],

  custom(ctx) {
    reshapeGround(ctx, SEGMENTS, (x, z, y) => y - (y + 2) * (1 - THREE.MathUtils.smoothstep(z, SHORE - 8, SHORE + 2)));
    calmWater(ctx, { y: WATER_Y, size: 1400, color: '#4f9aa8', light: '#8fd0cc', dark: '#3f8494', far: '#5ea6b0', tile: 22, fade: [40, 220] });
    ctx.addCollider({ x: 0, z: SHORE - 5 - 400, hx: 700, hz: 400, rot: 0, top: ctx.terrainHeight(0, SHORE) + 1.5 });
    const far = [];
    for (const [x, z, r, h] of [[-260, -330, 160, 40], [40, -380, 200, 55], [320, -300, 150, 35], [-420, -120, 120, 30], [440, -100, 130, 30]]) {
      far.push(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(r, h, r * 0.6).translate(x, -1, z));
    }
    addMesh(ctx.scene, far, ctx.kit.toon('#86a07a'), { cast: false });

    boulders(ctx, [[SEAT[0], SEAT[1] + 0.6, 1.0, 0.55], [-4, 122, 1.4], [5, 123, 1.1], [16, 104, 1.2], [-22, 92, 1], [24, 86, 0.9]]);
    const seatTop = ctx.terrainHeight(SEAT[0], SEAT[1] + 0.6) + 0.5;
    figure(ctx, { ...JESUS, arms: [0.45, 0.75] }, { pos: SEAT, y: seatTop - 0.2, face: [0, 60], seated: true, scale: 1.25, glow: 0.3, clear: 2.5 });
    glow(ctx, [SEAT[0], seatTop + 1.1, SEAT[1]], 5.5, '#fff0c8', 0.45);

    const rng = makeRng(14);
    const flowers = [], grass = [];
    for (let i = 0; i < 900; i++) {
      const a = Math.PI + (rng() - 0.5) * 2.6, r = 4 + Math.sqrt(rng()) * 60;
      (rng() < 0.4 ? flowers : grass).push([SEAT[0] + Math.sin(a) * r, SEAT[1] + Math.cos(a) * r]);
    }
    tufts(ctx, flowers, { size: [0.2, 0.32], flowers: 1, flowerColors: ['#f3ecf6', '#e9c6e8', '#f0d36a', '#e6e0ff'], seed: 2 });
    tufts(ctx, grass, { size: [0.15, 0.35], colors: ['#7f9a4a', '#6c8a42', '#9ab05e'], seed: 3 });

    leafyTrees(ctx, [[-36, 120], [38, 116], [-30, 140], [26, 142], [-48, 100], [52, 96], [6, 150]], { seed: 5, height: [5, 7], trunk: '#6b5a44', leaves: ['#7d9070', '#8a9a72', '#6f8460'] });
    doves(ctx, { center: [6, ctx.terrainHeight(6, 100) + 10, 100], count: 7, radius: 9, speed: 0.35, color: '#f6f2e8', size: 1.8 });
  },

  crowd: {
    seed: 11,
    minSpacing: 0.66,
    facing: SEAT,
    colors: JUDEANS,
    aisles: [{ from: [9, 126], to: [9, 70], width: 2.6 }],
    keepClear: [{ kind: "circle", x: SEAT[0], z: SEAT[1], r: 2.4 }, { kind: "circle", x: -11, z: 113, r: 1.6 }],
    groups: [
      { center: SEAT, radius: [2.6, 5.5], angle: [Math.PI - 1.4, Math.PI + 1.4], count: 12, kneel: 1, facingJitter: 0.2 },
      { center: SEAT, radius: [7, 48], angle: [Math.PI - 1.15, Math.PI + 1.15], count: 1500, kneel: 0.85, children: 0.18, facingJitter: 0.35 },
      { center: SEAT, radius: [48, 56], angle: [Math.PI - 1.0, Math.PI + 1.0], count: 140, kneel: 0.1, children: 0.1, facingJitter: 0.3 },
    ],
  },

  player: {
    start: [-11, 113],
    lookAt: [10, 107],
    fov: 46,
    colors: { robe: '#b5523b', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
