// John 2:1-11. The wedding feast at Cana: guests at tables under an awning, six stone jars by the servants.
// x is east, z is south. The courtyard is centred on (0, -6).
import * as THREE from 'three';
import { JESUS, JUDEANS, addMesh, boxGeo, cyl, figure, glow, house, leafyTrees, makeRng, palms, stoneJars, stripeTexture, table, jarGeo } from './lib/nt-07-kit.js';

const JARS = [[5.5, -1], [6.6, -1], [7.7, -1], [8.8, -1], [9.9, -1], [11, -1]];
const JESUS_AT = [12.9, 0.4];

function awning(ctx, { x0, x1, z0, z1, h, color }) {
  const y = ctx.groundHeight((x0 + x1) / 2, (z0 + z1) / 2);
  const cloth = boxGeo(x1 - x0, 0.06, z1 - z0, [(x0 + x1) / 2, y + h, (z0 + z1) / 2]);
  const uv = cloth.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.2, uv.getY(i) * 0.2);
  addMesh(ctx.scene, [cloth], ctx.kit.toon(color, { map: stripeTexture(), side: THREE.DoubleSide }));
  const poles = [];
  for (const px of [x0, (x0 + x1) / 2, x1]) for (const pz of [z0, z1]) {
    poles.push(cyl(0.08, 0.1, h, px, y + h / 2, pz, {}, 6));
    ctx.addCollider({ x: px, z: pz, hx: 0.15, hz: 0.15, rot: 0, top: y + h });
  }
  addMesh(ctx.scene, poles, ctx.kit.toon('#6b4a33'));
}

function vineTrellis(ctx, { x0, x1, z, h }) {
  const y = ctx.groundHeight((x0 + x1) / 2, z);
  const wood = [], leaves = [], grapes = [];
  const rng = makeRng(21);
  for (let x = x0; x <= x1 + 0.01; x += 3) {
    wood.push(cyl(0.08, 0.1, h, x, y + h / 2, z, {}, 6), cyl(0.08, 0.1, h, x, y + h / 2, z - 2.5, {}, 6));
    ctx.addCollider({ x, z, hx: 0.15, hz: 0.15, rot: 0, top: y + h });
    ctx.addCollider({ x, z: z - 2.5, hx: 0.15, hz: 0.15, rot: 0, top: y + h });
  }
  wood.push(boxGeo(x1 - x0 + 0.4, 0.12, 0.12, [(x0 + x1) / 2, y + h, z]), boxGeo(x1 - x0 + 0.4, 0.12, 0.12, [(x0 + x1) / 2, y + h, z - 2.5]));
  for (let x = x0; x <= x1; x += 0.7) {
    leaves.push(new THREE.SphereGeometry(0.55 + rng() * 0.3, 8, 6).translate(x, y + h + 0.15, z - 1.25 + (rng() - 0.5) * 2.2));
    if (rng() < 0.6) grapes.push(new THREE.SphereGeometry(0.16, 7, 5).scale(1, 1.5, 1).translate(x + 0.2, y + h - 0.35, z - 1.25 + (rng() - 0.5) * 2));
  }
  addMesh(ctx.scene, wood, ctx.kit.toon('#6b4a33'));
  addMesh(ctx.scene, leaves, ctx.kit.toon('#5f8a3e'));
  addMesh(ctx.scene, grapes, ctx.kit.toon('#5a2a4a'));
}

export default {
  title: 'John 2:1-11: The wedding at Cana',
  subtitle: 'Cana of Galilee, the third day',
  seed: 207,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#f0d2a4', near: 90, far: 700 },
  },

  sky: { zenith: '#3f7c9a', mid: '#8fb7b8', horizon: '#f6cf94', ground: '#d9b98a', glowColor: '#ffd99a', glowDir: [-0.7, 0.25, 0.4] },

  sun: { dir: [-0.6, 0.6, 0.45], color: '#ffe2b8', intensity: 2.5, hemi: { sky: '#dbe8e0', ground: '#b07a52', intensity: 1.1 }, shadowSize: 50 },

  ground: {
    size: 1000,
    segments: 220,
    flatRadius: 45,
    hillHeight: 30,
    undulation: 0.25,
    plaza: { center: [0, -6], size: [32, 26] },
    colors: { sand: '#d8b27a', dirt: '#c49260', grass: '#9aa45e', grassDark: '#74843f', plaza: '#e6d4ae', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8fa060' },
  },

  mountains: { count: 26, distance: [380, 600], height: [40, 90], widthRatio: [1.6, 2.6], colors: ['#8aa07a', '#7d9a7a', '#9aaa82'] },

  objects: [
    { type: 'trees', count: 70, ring: [40, 160], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b5a44', leafColors: ['#7d9070', '#8a9a72', '#6f8460'] },
    { type: 'stones', count: 120, ring: [22, 70], size: [0.12, 0.35], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],

  custom(ctx) {
    const walls = '#dcc69c';
    house(ctx, { pos: [-10, -24], size: [10, 7], h: 3.6, color: walls, stairs: true, seed: 1 });
    house(ctx, { pos: [2, -25], size: [9, 7], h: 4.2, color: '#d6bf95', seed: 2 });
    house(ctx, { pos: [13, -23], size: [8, 7], h: 3.4, color: walls, seed: 3 });
    house(ctx, { pos: [-21, -10], size: [7, 9], h: 3.4, rot: Math.PI / 2, color: '#d6bf95', seed: 4 });
    house(ctx, { pos: [-21, 3], size: [8, 7], h: 3.2, rot: Math.PI / 2, color: walls, seed: 5, stairs: true });
    house(ctx, { pos: [21, -9], size: [8, 7], h: 3.8, rot: -Math.PI / 2, color: walls, seed: 6 });
    house(ctx, { pos: [-30, 18], size: [8, 7], h: 3.2, rot: 0.4, color: '#d6bf95', seed: 7 });
    house(ctx, { pos: [30, 12], size: [9, 7], h: 3.4, rot: -0.5, color: walls, seed: 8 });
    house(ctx, { pos: [-36, -30], size: [8, 8], h: 3.2, rot: 0.3, color: walls, seed: 9 });
    house(ctx, { pos: [32, -30], size: [8, 7], h: 3.6, rot: -0.2, color: '#d6bf95', seed: 10 });

    awning(ctx, { x0: -11, x1: 3, z0: -18, z1: -7, h: 3.4, color: '#e9d4a8' });
    vineTrellis(ctx, { x0: 6, x1: 15, z: -10, h: 2.8 });

    table(ctx, { pos: [-4, -16], size: [6, 1.2], seed: 1, cloth: '#f3ead2' });
    table(ctx, { pos: [-9.5, -11.5], size: [1.2, 6], seed: 2 });
    table(ctx, { pos: [1.5, -11.5], size: [1.2, 6], seed: 3 });
    table(ctx, { pos: [-4, -4], size: [5, 1.1], seed: 4 });
    table(ctx, { pos: [-14, -2], size: [4, 1.1], rot: 0.3, seed: 5 });
    table(ctx, { pos: [9.5, -7.5], size: [5, 1.1], seed: 6 });

    stoneJars(ctx, JARS.slice(0, 3), { color: '#d9cfba', water: '#4f9aa8', scale: 1.05 });
    stoneJars(ctx, JARS.slice(3), { color: '#d9cfba', water: '#7a1f3a', scale: 1.05 });

    const C = JUDEANS;
    const bride = { robe: '#f3ead2', mantle: '#e9d4a8', skin: '#b5825a', hair: '#f6efe0', sash: '#c8912e' };
    const groom = { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' };
    figure(ctx, bride, { pos: [-4.6, -17.3], face: [-4.6, 0], seated: true });
    figure(ctx, groom, { pos: [-3.4, -17.3], face: [-3.4, 0], seated: true });

    figure(ctx, JESUS, { pos: JESUS_AT, face: [8, 5], scale: 1.1, glow: 0.28, arms: [0.3, 0.6] });
    glow(ctx, [JESUS_AT[0], ctx.groundHeight(...JESUS_AT) + 1.3, JESUS_AT[1]], 4.5, '#fff0c8', 0.42);
    figure(ctx, { robe: '#d9c7a3', mantle: '#3f6a9a', skin: '#a87650', hair: '#3f6a9a' }, { pos: [13.6, -1.3], face: [9, 4] });
    const servant = { robe: '#c8a97a', mantle: '#8c5a3c', skin: '#8a5a3b', hair: '#e6d8b8', sash: '#5e4632' };
    const pour = [[5.6, -2.3, [5.5, -1]], [7.6, -2.4, [7.7, -1]], [9.6, -2.3, [9.9, -1]], [11.4, -2.6, [11, -1]]];
    const pitchers = [];
    for (const [x, z, f] of pour) {
      const fig = figure(ctx, servant, { pos: [x, z], face: f, arms: [0.2, 1.0] });
      const yaw = fig.rotation.y;
      pitchers.push(jarGeo(0.4, x + Math.sin(yaw) * 0.55, fig.position.y + 0.95, z + Math.cos(yaw) * 0.55));
    }
    addMesh(ctx.scene, pitchers, ctx.kit.toon('#b5683b'));
    const ruler = { robe: '#7a2a3a', mantle: '#c8912e', skin: '#b5825a', hair: '#e6d8b8', sash: '#efe3c2', arms: [0.25, 1.3] };
    const gov = figure(ctx, ruler, { pos: [3.9, -0.6], face: [6, 6], scale: 1.03 });
    addMesh(ctx.scene, [cyl(0.07, 0.05, 0.16, 3.9 + Math.sin(gov.rotation.y) * 0.5, gov.position.y + 1.55, -0.6 + Math.cos(gov.rotation.y) * 0.5, {}, 8)], ctx.kit.toon('#c8912e'));


    palms(ctx, [[-17, -22], [18, -18], [-26, 8], [24, 4], [16, 14]], { seed: 7, height: [7, 10] });
    leafyTrees(ctx, [[-28, -18], [27, -20], [-14, 20], [20, 22]], { seed: 4, height: [5, 7], leaves: ['#7d9070', '#8a9a72', '#6f8460'] });
  },

  crowd: {
    seed: 7,
    minSpacing: 0.62,
    facing: [-4, -11],
    colors: JUDEANS,
    keepClear: [
      { kind: "rect", x: 9, z: -0.5, hx: 5.4, hz: 3.4 },
      { kind: 'rect', x: 3, z: 6, hx: 2.5, hz: 6 },
    ],
    groups: [
      { shape: 'rect', center: [-4, -14.7], size: [6, 0.3], count: 6, kneel: 1, facing: [-4, -16], facingJitter: 0.2 },
      { shape: 'rect', center: [-8.2, -11.5], size: [0.3, 6], count: 9, kneel: 1, facing: [-9.5, -11.5], facingJitter: 0.2 },
      { shape: 'rect', center: [-10.8, -11.5], size: [0.3, 6], count: 9, kneel: 1, facing: [-9.5, -11.5], facingJitter: 0.2 },
      { shape: 'rect', center: [0.2, -11.5], size: [0.3, 6], count: 9, kneel: 1, facing: [1.5, -11.5], facingJitter: 0.2 },
      { shape: 'rect', center: [2.8, -11.5], size: [0.3, 6], count: 9, kneel: 1, facing: [1.5, -11.5], facingJitter: 0.2 },
      { shape: 'rect', center: [-4, -2.7], size: [5, 0.3], count: 7, kneel: 1, facing: [-4, -4], facingJitter: 0.2 },
      { shape: 'rect', center: [-4, -5.3], size: [5, 0.3], count: 7, kneel: 1, facing: [-4, -4], facingJitter: 0.2 },
      { shape: 'rect', center: [9.5, -8.8], size: [5, 0.3], count: 7, kneel: 1, facing: [9.5, -7.5], facingJitter: 0.2 },
      { shape: 'rect', center: [-4, -10.5], size: [4.8, 6], count: 26, children: 0.25, facingJitter: 2.5 },
      { center: [-8, 2], radius: [1, 8], count: 50, children: 0.2, facingJitter: 1.6 },
      { center: [-15, -12], radius: [0, 4], count: 18, children: 0.1, facingJitter: 2 },
    ],
  },

  player: {
    start: [7.4, 3.8],
    lookAt: [8.4, -1.5],
    fov: 46,
    colors: { robe: '#b5523b', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
