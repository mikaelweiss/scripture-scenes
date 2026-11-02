// Genesis 6:14-7:16: the ark half built under scaffolding, animals coming two by two to the ramp.
// Coordinates are meters. x is east, z is south. The ark lies east-west to the north of the player.
import { BASE_STYLE, ROBES, THREE, Parts, between, boxes, figure, makeRng, pick, procession, stair } from './lib/ot-01-kit.js';
import { buildArk } from './lib/ot-01-ark.js';

const ARK = [0, -30];
const RAMP_FOOT = [6, -6];
const NOAH = [3.4, -5];

function ramp(ctx) {
  const p = new Parts();
  const base = ctx.terrainHeight(RAMP_FOOT[0], RAMP_FOOT[1]);
  stair(ctx, p, { origin: [RAMP_FOOT[0], RAMP_FOOT[1], base], frontZ: 0, fromY: 0, toY: 4.4, width: 3.6, rise: 0.3, depth: 0.95, color: '#b08a5a' });
  for (const side of [-1, 1]) p.box('#6b4a33', [0.2, 1.1, 13.4], [RAMP_FOOT[0] + side * 1.9, base + 2.9, RAMP_FOOT[1] - 6.7], [0.33, 0, 0]);
  ctx.scene.add(p.group(ctx.kit));
}

function lumber(ctx) {
  const rng = makeRng(4);
  const p = new Parts();
  const log = new THREE.CylinderGeometry(0.35, 0.35, 1, 8);
  for (const [cx, cz] of [[-24, -8], [-30, -2], [24, -10]]) {
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 4 - row; i++) {
        const y = ctx.terrainHeight(cx, cz) + 0.35 + row * 0.62;
        p.add('#8a6440', log, { pos: [cx + (i - (3 - row) / 2) * 0.72, y, cz], rot: [Math.PI / 2, 0, 0], scale: [1, 7, 1] });
      }
    }
  }
  for (const [cx, cz] of [[-16, -6], [16, -4], [30, -2]]) {
    for (let i = 0; i < 6; i++) p.box(pick(rng, ['#c8a878', '#b89868']), [5, 0.16, 0.5], [cx, ctx.terrainHeight(cx, cz) + 0.1 + i * 0.17, cz + (rng() - 0.5) * 0.3 + (i % 3) * 0.5]);
  }
  for (const [cx, cz] of [[-10, -4], [12, -2]]) {
    const y = ctx.terrainHeight(cx, cz);
    for (const s of [-1, 1]) {
      p.box('#6b4a33', [0.15, 1.1, 0.15], [cx + s * 1.1, y + 0.5, cz - 0.3], [0.3, 0, 0]);
      p.box('#6b4a33', [0.15, 1.1, 0.15], [cx + s * 1.1, y + 0.5, cz + 0.3], [-0.3, 0, 0]);
    }
    p.box('#a8865a', [3, 0.2, 0.3], [cx, y + 1, cz]);
    p.box('#c8a878', [0.5, 0.15, 4], [cx, y + 1.18, cz], [0, 0.5, 0]);
  }
  const stumps = new THREE.CylinderGeometry(0.45, 0.55, 0.7, 8);
  for (let i = 0; i < 26; i++) {
    const a = rng() * 6.28, r = between(rng, [40, 80]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    p.add('#8a6440', stumps, { pos: [x, ctx.terrainHeight(x, z) + 0.3, z] });
  }
  ctx.scene.add(p.group(ctx.kit));
  ctx.exclude({ kind: 'rect', x: -27, z: -5, hx: 6, hz: 6 });
  ctx.exclude({ kind: 'rect', x: 24, z: -10, hx: 4, hz: 4 });
}

export default {
  title: 'Genesis 6:14-7:16: Noah builds the ark',
  subtitle: 'Gopher wood and pitch, and the animals coming two and two',
  seed: 4,

  style: { ...BASE_STYLE, fog: { color: '#d8ccb4', near: 120, far: 900 } },

  sky: { zenith: '#4a5a78', mid: '#8a9cb0', horizon: '#f0dcb0', ground: '#b09a78', glowColor: '#fff0c8', glowDir: [0.6, 0.4, -0.6] },

  sun: { dir: [0.45, 0.75, 0.5], color: '#fff0d6', intensity: 2.5, hemi: { sky: '#c8d4e0', ground: '#9a7a52', intensity: 1.1 }, shadowSize: 90 },

  ground: {
    size: 1400, segments: 260, flatRadius: 140, hillHeight: 40, undulation: 0.3,
    plaza: { center: [0, -14], size: [100, 40] },
    colors: { sand: '#c8b080', dirt: '#b0905e', grass: '#8a9a58', grassDark: '#6c7a42', plaza: '#c8aa78', plazaLine: '#c8aa78', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a' },
  },

  mountains: { count: 30, distance: [480, 780], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#7a8a8a', '#6f8a84', '#8a9a90'] },

  objects: [
    { type: 'trees', count: 120, ring: [70, 220], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e7e5e', '#4f8a64', '#2f6f5a', '#5f8e5a'] },
    { type: 'stones', count: 200, ring: [10, 70], size: [0.12, 0.4], colors: ['#b8a078', '#a08a68', '#c8b088'] },
  ],

  custom(ctx) {
    buildArk(ctx, { pos: ARK, rot: -Math.PI / 2, length: 84, stage: 'frame' });
    ramp(ctx);
    lumber(ctx);
    figure(ctx, { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#a87650', hair: '#e8e4dc', sash: '#5e4632', arms: [0.6, 0.6] }, NOAH, { facing: [30, 30], scale: 1.05 });
    procession(ctx, ctx.kit, {
      from: [90, 34],
      to: [RAMP_FOOT[0], RAMP_FOOT[1] + 1],
      pairs: ['elephant', 'giraffe', 'camel', 'horse', 'lion', 'zebra', 'cow', 'deer', 'bear', 'sheep', 'goat', 'rabbit', 'elephant', 'horse', 'camel', 'giraffe', 'sheep', 'lion'],
      spacing: 5.5,
      gap: 2.6,
      speed: 1.1,
    });
    ctx.exclude({ kind: 'rect', x: 48, z: 14.5, hx: 50, hz: 3.5, rot: Math.atan2(-39, 84) });
  },

  clouds: {
    layers: [
      { count: 26, angle: [-0.2, 2.4], distance: [380, 800], height: [80, 170], size: [40, 80], color: '#fff6e4', shade: '#5a5a78' },
      { count: 20, angle: [-2.8, -0.6], distance: [300, 700], height: [100, 200], size: [70, 130], color: '#6a6a80', shade: '#24223a' },
    ],
  },

  crowd: {
    seed: 4,
    minSpacing: 0.9,
    facing: [0, -30],
    colors: ROBES,
    groups: [
      { shape: 'rect', center: [-18, -18], size: [26, 5], count: 16, children: 0.1 },
      { shape: 'rect', center: [24, -18], size: [24, 5], count: 14, children: 0.1 },
      { shape: 'rect', center: [-30, 4], size: [16, 10], count: 14, children: 0.25, facing: [-27, -5] },
      { shape: 'rect', center: [-40, 30], size: [40, 18], count: 40, children: 0.2, facing: [0, -30], kneel: 0 },
    ],
  },

  player: {
    start: [8, 17],
    lookAt: [0, -26],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
