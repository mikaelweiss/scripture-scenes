// 1 Nephi 18:23-25: the ship arrives at the promised land. The family lands, pitches tents and plants seed.
// x is east, z is south. The sea lies north with the ship at anchor.
import * as THREE from 'three';
import {
  addMesh, animal, beach, boxGeo, buildShip, calmWater, cargo, foamLine, leafyTrees, makeRng, palms, person,
  reshapeGround, scatter, tent,
} from './lib/bom-07-kit.js';

const SEG = 400;
const shore = (x) => -26 + 4 * Math.sin(x / 31) + 1.5 * Math.sin(x / 11);
const SHIP = [-14, -56];
const LANDING = [-4, -16];

export default {
  title: '1 Nephi 18:23-25: Arrival in the promised land',
  subtitle: 'They went forth upon the land and did pitch their tents',
  seed: 19,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#dfe6cc', near: 120, far: 1000 },
  },

  sky: { zenith: '#3b86a8', mid: '#88c4d2', horizon: '#f6e8c4', ground: '#4a8a90', glowColor: '#fff0c0', glowDir: [-0.6, 0.35, -1] },

  sun: { dir: [-0.5, 0.75, 0.5], color: '#ffefd2', intensity: 2.5, hemi: { sky: '#d6eef0', ground: '#8a7a4a', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1200, segments: SEG, flatRadius: 100, hillHeight: 60, undulation: 0.35,
    plaza: { center: [0, 300], size: [0, 0] },
    colors: {
      sand: '#7fa44e', dirt: '#6f9444', grass: '#5f8a3e', grassDark: '#4a7434', plaza: '#7fa44e', plazaLine: '#7fa44e',
      scorch: '#000', scorchEdge: '#000', hill: '#4f7f48',
    },
  },

  objects: [
    { type: 'stones', count: 140, center: [6, 10], ring: [4, 30], size: [0.12, 0.4], colors: ['#a89a80', '#8f8270', '#bdb098'] },
  ],

  clouds: { layers: [{ count: 34, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fffaf0', shade: '#5a6a80' }] },

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(9);
    const drawn = (x, z, y = ctx.terrainHeight(x, z)) => THREE.MathUtils.lerp(y, -4, THREE.MathUtils.smoothstep(shore(x) + 6 - z, 0, 26));
    reshapeGround(ctx, SEG, (x, z, y) => drawn(x, z, y));
    beach(ctx, shore, (x, z) => drawn(x, z), { from: -400, to: 400, land: 16 });
    calmWater(ctx, { y: -0.3, color: '#3a8a98', light: '#9ad6d0', dark: '#2a6a7a' });
    foamLine(ctx, shore, { y: -0.26, from: -400, to: 400 });
    ctx.exclude({ kind: 'rect', x: 0, z: -400, hx: 800, hz: 370 });
    for (let x = -300; x <= 300; x += 10) ctx.addCollider({ x, z: shore(x) - 2, hx: 5.2, hz: 1, rot: 0, top: 1.8 });

    const D = 5;
    const ship = buildShip(ctx, { pos: SHIP, rot: -0.25, y: -0.3 - D * 0.55, L: 30, B: 8, D, sail: 'furled', collide: false });
    ctx.onFrame((t) => (ship.inner.rotation.x = Math.sin(t * 0.6) * 0.012));
    const boat = [];
    const bx = -8, bz = shore(-8) + 1.5;
    const by = drawn(bx, bz);
    boat.push(boxGeo(1.6, 0.5, 4.2, [bx, by + 0.25, bz], { rotY: 0.4 }));
    addMesh(scene, boat, kit.toon('#8a5a36'));

    // Unloaded goods and the first tents.
    cargo(ctx, scatter(ctx, rng, 18, { center: [-6, -12], rect: [16, 8], margin: 1 }));
    tent(ctx, { pos: [-24, -6], rot: 0.5, size: [5.5, 4.5, 2.6], color: '#5e4632', trim: '#c8912e' });
    tent(ctx, { pos: [-30, 4], rot: 0.9, size: [5, 4.2, 2.5], color: '#4a3a30', trim: '#b5523b' });
    const half = [];
    for (const s of [-1, 1]) half.push(boxGeo(0.1, 2.6, 0.1, [-16 + s * 2.2, 1.3, 2]));
    half.push(boxGeo(4.6, 0.1, 0.1, [-16, 2.6, 2]));
    addMesh(scene, half, kit.toon('#6b4a33'));
    addMesh(scene, [boxGeo(3, 0.25, 2, [-16, 0.12, 3.2], { rotY: 0.2 })], kit.toon('#5e4632'));

    // Ground tilled for the seed they brought from Jerusalem (1 Nephi 18:24).
    const rows = [];
    for (let i = 0; i < 9; i++) {
      for (let k = 0; k < 6; k++) {
        const x = 16 + k * 3, z = 6 + i * 1.3;
        rows.push(boxGeo(2.9, 0.16, 0.7, [x, ctx.terrainHeight(x, z) + 0.02, z]));
      }
    }
    addMesh(scene, rows, kit.toon('#7a5434'));

    // Ore of gold, silver and copper breaking the surface (1 Nephi 18:25).
    const rock = [], gold = [], silver = [], copper = [];
    const ore = (x, z, n) => {
      const y = ctx.terrainHeight(x, z);
      for (let i = 0; i < n; i++) {
        const s = 0.7 + rng() * 1.1;
        const px = x + (rng() - 0.5) * 3, pz = z + (rng() - 0.5) * 3;
        rock.push(new THREE.DodecahedronGeometry(s, 0).scale(1.2, 0.8, 1).rotateY(rng() * 3).translate(px, y + s * 0.4, pz));
        for (let k = 0; k < 4; k++) {
          const list = [gold, silver, copper][Math.floor(rng() * 3)];
          const a = rng() * 6.28;
          list.push(new THREE.OctahedronGeometry(0.24 + rng() * 0.18, 0).translate(px + Math.sin(a) * s * 0.9, y + s * (0.3 + rng() * 0.5), pz + Math.cos(a) * s * 0.9));
        }
      }
      ctx.addCollider({ x, z, hx: 2.2, hz: 2.2, rot: 0, top: y + 1.2 });
    };
    ore(14, -6, 4);
    ore(-30, 22, 5);
    ore(34, 28, 4);
    addMesh(scene, rock, kit.stoneMat('#8f8270'));
    addMesh(scene, gold, kit.toon('#f2c43a', { emissive: '#6a4a00' }), { cast: false });
    addMesh(scene, silver, kit.toon('#e4e8ee', { emissive: '#3a4048' }), { cast: false });
    addMesh(scene, copper, kit.toon('#d27a3e', { emissive: '#4a2008' }), { cast: false });

    // Beasts in the forests of every kind (1 Nephi 18:25).
    animal(ctx, 'horse', { pos: [24, -14], rot: -2.4 });
    animal(ctx, 'horse', { pos: [27, -11], rot: -2.0, color: '#d8cbb4', grazing: true });
    animal(ctx, 'ox', { pos: [32, -4], rot: -1.6 });
    animal(ctx, 'cow', { pos: [36, 0], rot: -1.2, grazing: true });
    animal(ctx, 'ass', { pos: [22, -20], rot: -2.8 });
    animal(ctx, 'goat', { pos: [-22, 14], rot: 0.6, grazing: true });
    animal(ctx, 'goat', { pos: [-20, 16], rot: 2.0, color: '#6b5a4a' });
    animal(ctx, 'wildGoat', { pos: [-27, 26], rot: 1.2, scale: 1.1 });
    animal(ctx, 'wildGoat', { pos: [-33, 12], rot: 0.2 });

    // The forest around the landing.
    const open = (x, z) => z < shore(x) + 9 || (Math.abs(x - 2) < 15 && z < 30) || (x > 10 && x < 40 && z < 22 && z > -22);
    leafyTrees(ctx, scatter(ctx, rng, 150, { center: [0, 40], rect: [200, 150], margin: 3.5, reject: open }), {
      height: [7, 13], leaves: ['#3e7e4e', '#4f8a44', '#2f6e48', '#5a8a3a'], trunk: '#5e3e28',
    });
    leafyTrees(ctx, scatter(ctx, rng, 120, { center: [0, 160], rect: [500, 160], margin: 5 }), { seed: 3, height: [9, 15], leaves: ['#3e7e4e', '#2f6e48'] });
    palms(ctx, [[-40, -22], [-44, -14], [40, -24], [46, -20], [52, -12]], { seed: 2 });

    // Lehi gives thanks; Nephi with the seed; others kneel at the rows.
    person(ctx, { robe: '#e6d8b8', mantle: '#d9c7a3', skin: '#c08f66', hair: '#e8e4dc', sash: '#8c5a3c', arms: [0.5, 1.9] }, { pos: [-2, -8], face: [-2, 10] });
    person(ctx, { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#a87650', hair: '#3a2418', sash: '#c8912e', arms: [0.2, 0.9] }, { pos: [13, 9], face: [20, 9], scale: 1.05 });
    for (const [x, z] of [[18, 7.3], [23, 9.9], [27, 12.5]]) person(ctx, { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12' }, { pos: [x, z], face: [x + 4, z], kneel: true });
  },

  crowd: {
    seed: 9,
    minSpacing: 0.85,
    facing: [-2, -8],
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#e6d8b8', '#9c6b4e'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3'],
      skins: ['#9c6a45', '#a87650', '#b5825a', '#c08f66'],
      hair: ['#2b1a12', '#3a2418', '#1f140e'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#4f7f80'],
    },
    groups: [
      { center: [-2, -8], radius: [3, 8], angle: [-1.4, 1.4], count: 26, kneel: 0.5, children: 0.25 },
      { shape: 'rect', center: [-10, -18], size: [8, 4], count: 5, facing: [-10, 0] },
    ],
  },

  player: {
    start: [6, 12],
    lookAt: [-6, -30],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
