// Alma 30:49-50: Korihor is struck dumb before the chief judge and Alma at the judgment seat in Zarahemla.
// Korihor stands below the judgment platform, writing on a tablet that he cannot speak.
import * as THREE from 'three';
import { add, armor, baseStyle, block, clothes, fretBand, groundColors, houses, person, spear } from './lib/bom-25-kit.js';

const JUDGE = [0, -22.6];
const ALMA = [-2.6, -16.2];
const KORIHOR = [1.2, -9.5];
const PLAT_TOP = 1.2;

const C = { stone: '#e3cfa6', stair: '#d8c095', red: '#b5523b', cream: '#efe3c2', jade: '#3e8e6e', turquoise: '#2f8f8a', gold: '#d9a441' };

function court(ctx) {
  const k = ctx.kit;
  const base = ctx.terrainHeight(0, -20) - 0.1 + PLAT_TOP;

  for (const [x, z] of [[-6.5, -24], [6.5, -24], [-6.5, -16.5], [6.5, -16.5]]) {
    add(ctx, new THREE.CylinderGeometry(0.45, 0.5, 5, 12).translate(0, 2.5, 0), k.stoneMat(C.stone), { pos: [x, base, z] });
    ctx.addCollider({ x, z, hx: 0.5, hz: 0.5, rot: 0, top: base + 5 });
  }
  const roof = block(ctx, [15.5, 0.6, 9.6], [0, base + 5, -20.2], C.stair, { collide: false });
  roof.castShadow = false;
  fretBand(ctx, [15.7, 0.7, 9.8], [0, base + 5.6, -20.2], [C.red, C.cream]).castShadow = false;

  // Judgment seat.
  block(ctx, [2.2, 0.6, 1.4], [0, base, -23.1], C.jade, { stone: false });
  block(ctx, [2.4, 2.6, 0.4], [0, base, -23.9], C.jade, { stone: false });
  add(ctx, new THREE.BoxGeometry(2.6, 0.5, 0.5), k.toon(C.gold), { pos: [0, base + 2.7, -23.9] });
  person(ctx, { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#b5825a', hair: '#3a2418', sash: C.gold }, JUDGE, [1, 0], { y: base + 0.6, sit: true, scale: 1.05 });

  person(ctx, { robe: '#f3eddf', mantle: '#d9c7a3', skin: '#b5825a', hair: '#e6dcc8', sash: '#8c5a3c', arms: [0.25, 1.35] }, ALMA, KORIHOR, { y: base, scale: 1.04 });
  for (const [x, z] of [[4, -21], [-4.5, -21.5], [3, -17.5]]) {
    person(ctx, { robe: '#d9c7a3', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12' }, [x, z], [0, -9], { y: base });
  }

  const korihor = person(ctx, { robe: '#5b3a5e', mantle: '#8c3a4a', skin: '#b5825a', hair: '#1f140e', sash: C.gold, arms: [0.12, 0.85] }, KORIHOR, [0, -20], { clear: 1.2 });
  korihor.rotation.x = 0.08;
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.03), k.toon('#efe3c2'));
  tablet.position.set(0, 0.98, 0.42);
  tablet.rotation.x = -0.9;
  const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 5), k.toon('#2b1a12'));
  stylus.position.set(0.12, 1.06, 0.44);
  stylus.rotation.set(0.4, 0, 0.6);
  korihor.add(tablet, stylus);

  for (const [x, z, s] of [[-0.6, -8.4, -1], [3.1, -8.6, 1]]) {
    const g = person(ctx, { robe: '#7a6a52', mantle: C.red, skin: '#8a5a3b', hair: '#2b1a12' }, [x, z], [0, -20], { clear: 0.8 });
    armor(ctx, g);
    spear(ctx, g, { side: s });
  }
}

export default {
  title: 'Alma 30:49-50: Korihor struck dumb',
  subtitle: 'Before the chief judge and Alma in Zarahemla',
  seed: 30,

  style: { ...baseStyle, fog: { color: '#efd8ad', near: 140, far: 1100 } },

  sky: { zenith: '#2f6f8c', mid: '#7aaab0', horizon: '#f3d39a', ground: '#d9b98a', glowColor: '#ffe7ad', glowDir: [-0.5, 0.45, 0.6] },

  sun: { dir: [-0.55, 0.7, 0.6], color: '#fff0d6', intensity: 2.5, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.2 }, shadowSize: 60 },

  ground: { size: 1600, segments: 300, flatRadius: 150, hillHeight: 38, undulation: 0.3, plaza: { center: [0, -14], size: [64, 44] }, colors: groundColors },

  mountains: { count: 30, distance: [520, 800], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'platform',
      pos: [0, -20.2],
      tiers: [{ size: [17, 11], height: PLAT_TOP }],
      stairWidth: 7,
      rise: 0.3,
      stairDepth: 0.45,
      colors: { stone: C.stone, stair: C.stair, fret: [C.turquoise, C.cream] },
    },
    {
      type: 'stepPyramid',
      pos: [0, -78],
      base: [40, 40],
      tiers: 5,
      tierHeight: 3.6,
      inset: 2.8,
      stair: { width: 9, extra: 3, rise: 0.42 },
      shrine: { size: [12, 9, 6], comb: 3.5 },
      colors: { stone: C.stone, stair: '#d8c095', shrine: C.red, interior: '#2b1a12', fret: [C.red, C.cream], roofFret: [C.turquoise, C.cream] },
    },
    { type: 'trees', count: 110, ring: [70, 240], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  custom(ctx) {
    court(ctx);
    houses(ctx, { ring: [40, 120], count: 44, colors: ['#e3cfa6', '#d6bf95', '#cdb48a', '#e8d6ae'], roof: '#8c5a3c', seed: 27, avoid: (x, z) => Math.abs(x) < 26 && z < -45 && z > -105 });
  },

  clouds: {
    layers: [{ count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a6a82' }],
  },

  light: {
    glows: [{ at: ALMA, lift: PLAT_TOP + 1.3, size: 3.5, color: '#fff3d0', opacity: 0.3 }],
  },

  crowd: {
    seed: 27,
    minSpacing: 0.62,
    facing: [0, -14],
    colors: clothes,
    aisles: [{ from: [3, 30], to: [2, -6], width: 3.5 }],
    keepClear: [{ kind: 'circle', x: 1, z: -10, r: 5 }, { kind: 'rect', x: 0, z: -20, hx: 9.5, hz: 6.5 }],
    groups: [
      { center: [0, -14], radius: [8, 30], angle: [-2.1, 2.1], count: 900, children: 0.12, kneel: 0.05 },
    ],
  },

  player: {
    start: [2.5, -0.5],
    lookAt: [0, -17],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
