// 1 Nephi 17-18:4: Nephi builds the ship on the shore of Bountiful.
// x is east, z is south. The sea lies north, the ship stands on stocks above the beach.
import * as THREE from 'three';
import {
  addMesh, animal, beach, boxGeo, buildShip, calmWater, cargo, cyl, foamLine, leafyTrees, makeRng, palms, person,
  plankTexture, reshapeGround, rod, scatter, tent,
} from './lib/bom-07-kit.js';

const SEG = 400;
const shore = (x) => -30 + 3 * Math.sin(x / 23) + 1.5 * Math.sin(x / 9);
const SHIP = [0, -8];
const NEPHI = [-2.2, 10.5];

const people = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#e6d8b8', '#9c6b4e'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a'],
  skins: ['#9c6a45', '#a87650', '#b5825a', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export default {
  title: '1 Nephi 17-18:4: Nephi builds the ship in Bountiful',
  subtitle: 'The land Bountiful, by the sea Irreantum',
  seed: 17,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e6e2c8', near: 140, far: 1100 },
  },

  sky: { zenith: '#2f7d9a', mid: '#79bccb', horizon: '#f2e6c0', ground: '#4f8f96', glowColor: '#fff3cc', glowDir: [0.2, 0.5, -1] },

  sun: { dir: [0.45, 0.9, 0.35], color: '#fff3dc', intensity: 2.6, hemi: { sky: '#d8f0ec', ground: '#a88456', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1200,
    segments: SEG,
    flatRadius: 110,
    hillHeight: 46,
    undulation: 0.3,
    plaza: { center: [0, 300], size: [0, 0] },
    colors: {
      sand: '#9cb760', dirt: '#89a852', grass: '#7a9e4c', grassDark: '#5f8a44', plaza: '#e3c78f', plazaLine: '#e3c78f',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6f9a5a',
    },
  },

  objects: [
    { type: 'stones', count: 220, center: [0, 30], ring: [4, 48], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],

  clouds: {
    layers: [
      { count: 30, distance: [380, 800], height: [80, 170], size: [40, 90], color: '#fffaf0', shade: '#5a6a80' },
    ],
  },

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(7);
    const drawn = (x, z, y = ctx.terrainHeight(x, z)) => THREE.MathUtils.lerp(y, -3.5, THREE.MathUtils.smoothstep(shore(x) + 6 - z, 0, 24));
    reshapeGround(ctx, SEG, (x, z, y) => drawn(x, z, y));
    beach(ctx, shore, (x, z) => drawn(x, z), { from: -400, to: 400, land: 26 });
    calmWater(ctx, { y: -0.3 });
    foamLine(ctx, shore, { y: -0.26, from: -400, to: 400 });
    ctx.exclude({ kind: 'rect', x: 0, z: -400, hx: 800, hz: 366 });
    for (let x = -300; x <= 300; x += 10) ctx.addCollider({ x, z: shore(x) - 2, hx: 5.2, hz: 1, rot: 0, top: 1.8 });

    // The half-built ship on its stocks, with scaffolding and a ramp up to the keel.
    const ship = buildShip(ctx, { pos: SHIP, rot: 0.05, y: ctx.terrainHeight(...SHIP) + 0.9, stage: 'frame', L: 30, B: 8, D: 5, planked: 0.5 });
    const scaff = [], deck = [];
    const g = ship.group;
    for (const side of [-1, 1]) {
      for (let i = -3; i <= 3; i++) {
        const x = i * 4.2, w = ship.shape.halfW(0.5 + x / 30) + 1.2;
        scaff.push(cyl(0.09, 0.09, 6.5, x, 2.0, side * w));
        scaff.push(rod([x, -1.1, side * w], [x + 4.2, 4.5, side * w], 0.05, 4));
      }
      deck.push(boxGeo(26, 0.12, 0.9, [0, 2.6, side * (ship.shape.halfW(0.5) + 1.2)]));
    }
    addMesh(g, scaff, kit.toon('#8a6a48'));
    addMesh(g, deck, kit.toon('#c79a64', { map: plankTexture() }));

    // Timber, planks and tools on the beach.
    const wood = [];
    for (let i = 0; i < 9; i++) wood.push(cyl(0.3, 0.3, 9, 18 + (i % 3) * 0.62, 0.3 + Math.floor(i / 3) * 0.55, 6 + (i % 3) * 0.1, { rz: Math.PI / 2 }, 8));
    for (let i = 0; i < 6; i++) wood.push(boxGeo(7, 0.12, 0.55, [-17, 0.1 + i * 0.13, 7 + (i % 2) * 0.2], { rotY: 0.1 * i }));
    for (let i = 0; i < 5; i++) wood.push(cyl(0.25, 0.25, 6, -22 + i * 0.6, 0.25, 12, { rx: Math.PI / 2, ry: 0.3 }, 7));
    addMesh(scene, wood, kit.toon('#a87b4f', { map: plankTexture() }));
    ctx.addCollider({ x: 18.6, z: 6.1, hx: 4.6, hz: 1.2, rot: 0, top: 1.8 });
    ctx.addCollider({ x: -17, z: 7.1, hx: 3.6, hz: 0.6, rot: 0.2, top: 0.9 });

    // Nephi's forge: a stone hearth with fire and skin bellows (1 Nephi 17:11).
    const forge = [-14, 2];
    const fy = ctx.terrainHeight(...forge);
    addMesh(scene, [cyl(1.1, 1.3, 0.8, forge[0], fy + 0.4, forge[1], {}, 9)], kit.stoneMat('#9a8a78'));
    addMesh(scene, [cyl(0.45, 0.6, 0.5, forge[0] + 0.3, fy + 1.0, forge[1] + 0.2, {}, 7, 6)], kit.toon('#ff9a3c', { emissive: '#d0501c' }));
    addMesh(scene, [boxGeo(1.4, 0.5, 0.8, [forge[0] + 1.9, fy + 0.3, forge[1]], { rotY: 0.2 })], kit.toon('#6b4a33'));
    const fire = new THREE.PointLight('#ffb060', 6, 12, 1.5);
    fire.position.set(forge[0], fy + 1.8, forge[1]);
    scene.add(fire);
    ctx.onFrame((t) => (fire.intensity = 5 + Math.sin(t * 11) * 0.8 + Math.sin(t * 7.3) * 0.6));
    ctx.addCollider({ x: forge[0], z: forge[1], hx: 1.2, hz: 1.2, rot: 0, top: fy + 0.8 });

    // Lehi's camp to the east.
    const tentColors = ['#4a3a30', '#5e4632', '#6b5a4a', '#3d322a'];
    [[38, 10, -0.4], [46, 4, -0.2], [52, 14, -0.7], [42, 22, -1.0], [58, 26, -1.2]].forEach(([x, z, r], i) =>
      tent(ctx, { pos: [x, z], rot: r, size: [5.5 + (i % 2), 4.5, 2.6], color: tentColors[i % tentColors.length], trim: i % 2 ? '#b5523b' : '#c8912e' }));
    cargo(ctx, scatter(ctx, rng, 14, { center: [44, 14], rect: [24, 20], margin: 1.2 }));
    animal(ctx, 'camel', { pos: [30, 26], rot: 2.2 });
    animal(ctx, 'camel', { pos: [33, 30], rot: 1.6, color: '#b48a56' });
    for (let i = 0; i < 6; i++) animal(ctx, 'goat', { pos: [55 + (i % 3) * 2.2, 36 + Math.floor(i / 3) * 2.5], rot: rng() * 6, grazing: rng() < 0.6, color: i % 2 ? '#e8e0d0' : '#5a4636' });

    // Much fruit and wild honey (1 Nephi 17:5): palms, fruit trees and bee skeps.
    const nearShip = (x, z) => Math.hypot(x - SHIP[0], (z - SHIP[1]) * 1.6) < 24 || z < shore(x) + 6;
    const view = (x, z) => Math.abs(x - 4) < 12 && z > 0 && z < 45;
    palms(ctx, [[-21, 13], [-26, 3], [-19, -18], [23, 12], [27, 1], [33, -17], [-36, -12], [16, 24]], { seed: 6 });
    palms(ctx, scatter(ctx, rng, 46, { center: [0, 30], rect: [220, 120], margin: 3, reject: (x, z) => nearShip(x, z) || view(x, z) }));
    leafyTrees(ctx, scatter(ctx, rng, 26, { center: [-40, 40], rect: [70, 50], margin: 3.5, reject: (x, z) => nearShip(x, z) || view(x, z) }), { fruit: '#e0782c', leaves: ['#3e8e5e', '#4f9a54', '#5a9a44'] });
    leafyTrees(ctx, scatter(ctx, rng, 60, { center: [0, 150], rect: [400, 160], margin: 4 }), { seed: 9, height: [7, 12] });
    const skeps = [];
    for (const [x, z] of [[-30, 26], [-31.5, 27], [-29, 28.2], [-32, 29]]) {
      const y = ctx.terrainHeight(x, z);
      skeps.push(boxGeo(1.2, 0.5, 1.2, [x, y + 0.25, z]));
      const s = new THREE.SphereGeometry(0.6, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      s.scale(1, 1.4, 1);
      s.translate(x, y + 0.5, z);
      skeps.push(s);
    }
    addMesh(scene, skeps, kit.toon('#d8a94a', { map: plankTexture() }));

    // Nephi directs the work, his brothers carry timber.
    const nephi = person(ctx, { robe: '#efe4c8', mantle: '#8f3326', skin: '#a87650', hair: '#3a2418', sash: '#d9a23a', arms: [0.12, 0.2] }, { pos: NEPHI, face: [9, 18], scale: 1.2 });
    nephi.children.at(-1).rotation.set(-0.5, 0, 2.3);

    // Brothers at work on the scaffold planks along the near side of the hull.
    const plankY = g.position.y + 2.66, plankZ = ship.shape.halfW(0.5) + 1.2;
    for (const [lx, arms] of [[-9, [0.2, 2.2]], [-1.5, [0.3, 1.0]], [6, [0.2, 2.4]]]) {
      const wx = SHIP[0] + lx * Math.cos(0.05) + plankZ * Math.sin(0.05), wz = SHIP[1] - lx * Math.sin(0.05) + plankZ * Math.cos(0.05);
      person(ctx, { robe: '#c8a97a', mantle: '#6b4a33', skin: '#9c6a45', hair: '#2b1a12', sash: '#b5523b', arms }, { pos: [wx, wz], face: [wx, wz - 5], y: plankY });
    }
    for (const [x, z, f] of [[10, 4, [18, 6]], [12, 6.5, [18, 6]], [-8, 6, [-17, 7]]]) {
      person(ctx, { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', sash: '#7a6a52', arms: [0.15, 1.6] }, { pos: [x, z], face: f });
    }
    addMesh(scene, [rod([9.2, 1.95, 4.4], [12.8, 1.95, 6.1], 0.16, 7)], kit.toon('#a87b4f'));
  },

  crowd: {
    seed: 7,
    minSpacing: 0.9,
    facing: SHIP,
    colors: people,
    groups: [
      { shape: 'rect', center: [44, 16], size: [26, 22], count: 18, children: 0.25, facing: [44, 30] },
      { center: SHIP, radius: [9, 14], angle: [-1.2, 1.2], count: 10, kneel: 0.3 },
      { shape: 'rect', center: [-30, 22], size: [10, 10], count: 4, children: 0.5 },
    ],
  },

  player: {
    start: [4, 15],
    lookAt: [0, -8],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
