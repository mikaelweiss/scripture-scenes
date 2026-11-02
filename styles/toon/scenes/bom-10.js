// 2 Nephi 1-4: the aged Lehi blesses his family among the tents in the promised land.
// x is east, z is south. Lehi sits before his tent facing south, the family gathered before him.
import * as THREE from 'three';
import { addMesh, animal, ball, boxGeo, cargo, cyl, leafyTrees, makeRng, person, scatter, tent } from './lib/bom-07-kit.js';

const LEHI = [0, -6];

export default {
  title: '2 Nephi 1-4: Lehi blesses his family',
  subtitle: 'The last words of father Lehi, in the land of promise',
  seed: 21,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#f0cf9a', near: 110, far: 900 },
    ember: '#c8502c', emberHot: '#ffb347', flameOuter: '#f08a2c', flameInner: '#ffe08a', charred: '#3a2a22', smoke: '#d8ccc0', smokeShade: '#6a5a60',
  },

  sky: { zenith: '#3a5f88', mid: '#c49a8a', horizon: '#f8c886', ground: '#a88a5a', glowColor: '#ffd890', glowDir: [-1, 0.25, 0.1] },

  sun: { dir: [-0.8, 0.42, 0.25], color: '#ffd8a0', intensity: 2.6, hemi: { sky: '#e8d4c0', ground: '#7a6a3a', intensity: 1.0 }, shadowSize: 60 },

  ground: {
    size: 1400, segments: 300, flatRadius: 90, hillHeight: 55, undulation: 0.4,
    plaza: { center: [0, 400], size: [0, 0] },
    colors: {
      sand: '#93a852', dirt: '#a8985a', grass: '#8a9e4c', grassDark: '#6a8040', plaza: '#c4a46c', plazaLine: '#c4a46c',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7a9058',
    },
  },

  mountains: { count: 30, distance: [480, 760], height: [80, 200], widthRatio: [1.4, 2.4], colors: ['#8a8098', '#7a7890', '#9a8aa0', '#6f7088'] },

  objects: [
    { type: 'stones', count: 200, center: [0, 0], ring: [10, 60], size: [0.12, 0.4], colors: ['#b8a07a', '#a08868', '#c8b48a'] },
  ],

  smolder: [{ pos: [-12, 9], radius: 0.9, embers: 10, flames: 3, smoke: 0, logs: 3 }],

  clouds: {
    layers: [
      { count: 30, distance: [380, 800], height: [70, 160], size: [40, 90], color: '#ffe0b8', shade: '#7a5a78' },
      { count: 14, angle: [-2.2, -1.0], distance: [300, 600], height: [60, 120], size: [50, 100], color: '#ffd0a0', shade: '#8a5a6a' },
    ],
  },

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(10);

    // Lehi's tent with an awning, his seat before it.
    tent(ctx, { pos: [0, -12], rot: 0, size: [7, 5, 3.2], color: '#e6d8b8', trim: '#8c5a3c' });
    const awning = [boxGeo(7, 0.08, 3.4, [0, 2.6, -8.6], { rotX: 0.12 })];
    addMesh(scene, awning, kit.toon('#c8912e', { side: THREE.DoubleSide }));
    addMesh(scene, [cyl(0.06, 0.06, 2.6, -3.3, 1.3, -7.1), cyl(0.06, 0.06, 2.6, 3.3, 1.3, -7.1)], kit.toon('#6b4a33'));
    const ly = ctx.terrainHeight(...LEHI);
    addMesh(scene, [boxGeo(3.4, 0.7, 2.6, [LEHI[0], ly + 0.2, LEHI[1] - 0.3])], kit.stoneMat('#b8a07a'));
    addMesh(scene, [boxGeo(3.2, 0.04, 2.2, [LEHI[0], ly + 0.03, LEHI[1] + 2.0])], kit.toon('#b5523b'), { cast: false });
    ctx.addCollider({ x: LEHI[0], z: LEHI[1] - 0.3, hx: 1.7, hz: 1.3, rot: 0, top: ly + 0.55, walkable: true });

    // The camp: tents of each family in a broad ring.
    const tentColors = ['#5e4632', '#4a3a30', '#6b5a4a', '#7a5a3a', '#3d322a', '#8c6a4a'];
    const ring = [[-16, -14, 0.5], [16, -14, -0.5], [-26, -2, 1.2], [26, -2, -1.2], [-30, 14, 1.6], [30, 14, -1.6], [-12, -26, 0.2], [12, -26, -0.2], [0, -32, 0], [-38, -16, 0.9], [38, -18, -0.9]];
    ring.forEach(([x, z, r], i) => tent(ctx, { pos: [x, z], rot: r, size: [5 + (i % 3) * 0.6, 4.2, 2.5 + (i % 2) * 0.3], color: tentColors[i % tentColors.length], trim: i % 2 ? '#b5523b' : '#c8912e' }));
    cargo(ctx, scatter(ctx, rng, 18, { center: [0, -18], rect: [70, 24], margin: 1.2 }));

    // Flocks and herds.
    for (let i = 0; i < 14; i++) animal(ctx, 'sheep', { pos: [44 + (rng() - 0.5) * 14, 12 + (rng() - 0.5) * 12], rot: rng() * 6.28, grazing: rng() < 0.6 });
    for (let i = 0; i < 5; i++) animal(ctx, 'goat', { pos: [-44 + (rng() - 0.5) * 10, 18 + (rng() - 0.5) * 10], rot: rng() * 6.28, grazing: rng() < 0.5, color: i % 2 ? '#5a4636' : '#e8e0d0' });
    animal(ctx, 'ox', { pos: [-46, -6], rot: 0.8 });
    animal(ctx, 'cow', { pos: [-50, -2], rot: 1.6, grazing: true });

    // Fields of grain beyond the camp.
    const grain = [];
    for (let i = 0; i < 70; i++) {
      const x = -70 + (i % 14) * 4 + rng(), z = -60 - Math.floor(i / 14) * 4 + rng();
      grain.push(boxGeo(3.8, 0.5, 3.6, [x, ctx.terrainHeight(x, z) + 0.15, z]));
    }
    addMesh(scene, grain, kit.toon('#d8b85a'));
    leafyTrees(ctx, scatter(ctx, rng, 90, { center: [0, 0], ring: [48, 180], margin: 4, reject: (x, z) => z > 15 && Math.abs(x) < 30 }), { height: [6, 11], leaves: ['#5a8a44', '#6a9a4a', '#4a7a3e'] });

    // Lehi, white-haired, his hands upon the head of a kneeling son; Sariah beside him.
    const lehi = person(ctx, { robe: '#efe6d2', mantle: '#8c5a3c', skin: '#c08f66', hair: '#f2eee6', sash: '#c8912e', arms: [0.3, 1.25] }, { pos: LEHI, face: [0, 10], y: ly + 0.55, scale: 1.08 });
    addMesh(lehi, [ball(0.12, 0, 1.43, 0.09, { s: [1, 1.5, 0.7] }, 8)], kit.toon('#f2eee6'));
    addMesh(scene, [cyl(0.03, 0.04, 1.9, LEHI[0] + 0.55, ly + 0.55 + 0.95, LEHI[1] + 0.1, { rz: -0.08 }, 5)], kit.toon('#6b4a33'));
    person(ctx, { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#c08f66', hair: '#d8d2c8' }, { pos: [-1.1, -6.5], face: [0, 4], y: ly + 0.55 });
    person(ctx, { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e' }, { pos: [0, -3.9], face: [0, -8], kneel: true, scale: 0.95 });
  },

  crowd: {
    seed: 21,
    minSpacing: 0.75,
    facing: LEHI,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#e6d8b8', '#9c6b4e', '#4f7f80'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a'],
      skins: ['#9c6a45', '#a87650', '#b5825a', '#c08f66'],
      hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#4f7f80'],
    },
    aisles: [{ from: [0, -4], to: [3, 20], width: 2.2 }],
    groups: [
      { center: LEHI, radius: [3.6, 10], angle: [-1.45, 1.45], count: 58, kneel: 0.55, children: 0.3 },
      { center: LEHI, radius: [2.4, 4], angle: [-2.4, -1.5], count: 4, kneel: 0.5 },
      { center: LEHI, radius: [2.4, 4], angle: [1.5, 2.4], count: 4, kneel: 0.5 },
    ],
  },

  player: {
    fov: 48,
    start: [1.4, 2.6],
    lookAt: LEHI,
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
