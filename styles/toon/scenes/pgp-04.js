// Abraham 1:7-16: Abraham bound on the lion-couch altar of Elkenah. The angel of the Lord stands by to loose his bands.
// Coordinates are meters. x is east, z is south. The altar platform faces the crowd from the north.
import { BASE_STYLE, ROBES, THREE, Parts, angel, between, figure, glow, makeRng, palms, pick, unit } from './lib/pgp-01-kit.js';

const ALTAR = [0, -16];
const GOLD = '#d8a640';

function lionCouch(ctx) {
  const y = ctx.groundHeight(...ALTAR);
  const p = new Parts();
  p.box(GOLD, [3.4, 0.35, 1.1], [0, 1.0, 0]);
  p.box('#3a6e8a', [3.5, 0.12, 1.15], [0, 0.78, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.add(GOLD, unit.cyl, { pos: [sx * 1.4, 0.4, sz * 0.4], scale: [0.18, 0.8, 0.18] });
    p.add(GOLD, unit.sphere, { pos: [sx * 1.4 + 0.08, 0.05, sz * 0.4], scale: [0.3, 0.14, 0.24] });
  }
  p.add(GOLD, unit.sphere, { pos: [1.85, 1.35, 0], scale: [0.6, 0.62, 0.55] });
  p.add('#b8862c', unit.sphere, { pos: [1.78, 1.38, 0], scale: [0.78, 0.82, 0.72] });
  p.add('#2b1a12', unit.sphere, { pos: [2.12, 1.32, 0], scale: [0.12, 0.12, 0.2] });
  p.add(GOLD, unit.cyl, { pos: [-1.95, 1.4, 0], rot: [0, 0, -0.5], scale: [0.09, 1.0, 0.09] });
  const g = p.group(ctx.kit);
  g.position.set(ALTAR[0], y, ALTAR[1]);
  ctx.scene.add(g);
  ctx.addCollider({ x: ALTAR[0], z: ALTAR[1], hx: 2.1, hz: 0.7, rot: 0, top: y + 1.3 });
  ctx.exclude({ kind: 'circle', x: ALTAR[0], z: ALTAR[1], r: 2.4 });

  // Abraham lies upon the couch with his hands lifted in prayer.
  const abraham = figure(ctx, { robe: '#e6d8b8', mantle: '#c8a97a', skin: '#a8724a', hair: '#3a2418', sash: '#8c5a3c', arms: [0.15, 1.6] }, [0, 0], { clear: 0 });
  abraham.position.set(ALTAR[0] - 1.55, y + 1.42, ALTAR[1]);
  abraham.rotation.z = -Math.PI / 2;
  return y;
}

// Gods of the Chaldeans: canopic jars beneath the altar and tall painted idols at the corners.
function idols(ctx, y) {
  const p = new Parts();
  const heads = [['#2b1a12', [0.34, 0.5, 0.42]], ['#6a8a5a', [0.3, 0.32, 0.46]], ['#8a6a4a', [0.36, 0.36, 0.36]], ['#c08f66', [0.32, 0.38, 0.34]]];
  heads.forEach(([col, s], i) => {
    const x = ALTAR[0] - 1.2 + i * 0.8, z = ALTAR[1] + 1.2;
    p.add('#e6d8b8', unit.cyl, { pos: [x, y + 0.35, z], scale: [0.4, 0.7, 0.4] });
    p.add('#3a6e8a', unit.cyl, { pos: [x, y + 0.5, z], scale: [0.42, 0.1, 0.42] });
    p.add(col, unit.sphere, { pos: [x, y + 0.85, z], scale: s });
  });
  const base = ctx.terrainHeight(...ALTAR);
  for (const [x, z, col] of [[-9, -22, '#b5523b'], [9, -22, '#3e8e6e'], [-9, -9, '#c8912e'], [9, -9, '#4f7f80']]) {
    p.box('#d8c095', [1.6, 1.0, 1.6], [x, base + 0.5, z]);
    p.add(col, unit.cyl, { pos: [x, base + 3.0, z], scale: [1.0, 4.2, 1.0] });
    p.box(GOLD, [1.2, 0.5, 1.2], [x, base + 5.2, z]);
    p.add('#2b1a12', unit.sphere, { pos: [x, base + 5.9, z], scale: [0.95, 1.1, 0.95] });
    p.add(GOLD, unit.sphere, { pos: [x, base + 6.1, z + 0.38], scale: [0.5, 0.5, 0.4] });
    ctx.addCollider({ x, z, hx: 0.8, hz: 0.8, rot: 0, top: base + 6.5 });
  }
  ctx.scene.add(p.group(ctx.kit));
}

function priests(ctx) {
  const priest = { robe: '#f2ead6', mantle: '#2b1a12', skin: '#8a5a3b', hair: '#1f140e', sash: GOLD };
  figure(ctx, { ...priest, arms: [0.4, 1.3] }, [ALTAR[0] + 0.3, ALTAR[1] - 1.5], { facing: [0, 10], scale: 1.05, clear: 0.8 });
  figure(ctx, priest, [ALTAR[0] - 4, ALTAR[1] - 2.5], { facing: ALTAR, clear: 0.8 });
  figure(ctx, priest, [ALTAR[0] + 4, ALTAR[1] - 2.5], { facing: ALTAR, clear: 0.8 });
  const pharaoh = { robe: '#f8f2e4', mantle: '#3a6e8a', skin: '#8a5a3b', hair: GOLD, sash: '#b5523b' };
  figure(ctx, pharaoh, [ALTAR[0] - 6, ALTAR[1] - 5], { facing: ALTAR, scale: 1.08, clear: 0.8 });
}

export default {
  title: 'Abraham 1:7-16: Abraham on the altar',
  subtitle: 'The altar of Elkenah on the plain of Olishem, and the angel of the Lord',
  seed: 104,

  style: { ...BASE_STYLE, fog: { color: '#f0d8a8', near: 140, far: 1000 } },

  sky: {
    zenith: '#2f6a8c',
    mid: '#8ab4bc',
    horizon: '#f6d9a0',
    ground: '#d4b888',
    glowColor: '#fff2c8',
    glowDir: [0, 0.8, -0.5],
  },

  sun: {
    dir: [0.6, 0.75, 0.3],
    color: '#fff0d6',
    intensity: 2.7,
    hemi: { sky: '#dcecee', ground: '#b88a58', intensity: 1.1 },
    shadowSize: 70,
  },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 200,
    hillHeight: 20,
    undulation: 0.25,
    plaza: { center: [0, -12], size: [44, 40] },
    colors: {
      sand: '#d8bc84',
      dirt: '#c8a06a',
      grass: '#a8a868',
      grassDark: '#8a8a50',
      plaza: '#e2cfa4',
      plazaLine: '#c3a676',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#b8a878',
    },
  },

  mountains: { count: 24, distance: [600, 850], height: [40, 90], widthRatio: [2, 3], colors: ['#b8a8a0', '#a89ca0', '#c4b4a4'] },

  objects: [
    {
      type: 'platform',
      pos: ALTAR,
      tiers: [
        { size: [24, 20], height: 1.2 },
        { size: [11, 9], height: 1.2, offset: [0, -1] },
      ],
      stairWidth: 7,
      rise: 0.3,
      stairDepth: 0.45,
      colors: { stone: '#e3cfa6', stair: '#d8c095', fret: ['#3a6e8a', '#e8d6ae'] },
    },
    {
      type: 'stepPyramid',
      pos: [0, -150],
      base: [60, 60],
      tiers: 4,
      tierHeight: 6,
      inset: 5,
      stair: { width: 10, extra: 3, rise: 0.5 },
      shrine: { size: [14, 10, 7], comb: 2 },
      rubble: 0,
      colors: { stone: '#c8a070', stair: '#b88e5e', shrine: '#3a6e8a', interior: '#2b1a12', fret: ['#b5523b', '#e8d6ae'], roofFret: [GOLD, '#e8d6ae'] },
    },
    { type: 'stones', count: 200, ring: [14, 90], size: [0.12, 0.35], colors: ['#c8a878', '#b8986a', '#d8c098'] },
  ],

  custom(ctx) {
    const y = lionCouch(ctx);
    idols(ctx, y);
    priests(ctx);
    angel(ctx, [ALTAR[0] - 0.6, ALTAR[1] + 0.4], { facing: [0, 20], scale: 1.6, lift: 2.6, glowSize: 8, arms: [0.6, 0.7] });
    palms(ctx, [[-30, -4, 9], [-36, 10, 8], [-26, 22, 10], [32, -6, 9], [38, 12, 8], [28, 26, 10], [-50, -40, 11], [52, -36, 10], [-60, 30, 9], [64, 28, 9], [-20, -60, 9], [24, -64, 10]]);
  },

  clouds: {
    layers: [
      { count: 24, distance: [450, 900], height: [80, 170], size: [40, 80], color: '#fff1d8', shade: '#6a6080' },
      { count: 10, center: ALTAR, distance: [40, 90], height: [120, 150], size: [25, 45], color: '#fff6e4', shade: '#7a6a82', drift: 0.004 },
    ],
  },

  light: {
    beams: [{ from: [ALTAR[0], 200, ALTAR[1]], to: { at: ALTAR, lift: 1.4 }, width: [12, 5], color: '#fff2c9', intensity: 0.2, layers: 3, stripes: 24, fadeLow: 0.04 }],
    glows: [{ at: ALTAR, lift: 5, size: 10, color: '#fff3d0', opacity: 0.5 }],
    pointLights: [{ at: ALTAR, lift: 5, color: '#ffe6b0', intensity: 12, distance: 18 }],
  },

  crowd: {
    seed: 5,
    minSpacing: 0.66,
    facing: ALTAR,
    colors: {
      robes: ['#f2ead6', '#e6d8b8', '#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#4f7f80', '#e8d6ae'],
      mantles: ['#2b1a12', '#3a6e8a', '#b5523b', '#c8912e', '#d9c7a3', '#6b5a4a'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#7a4e33', '#b5825a'],
      hair: ['#1f140e', '#2b1a12', '#3a2418'],
      wraps: ['#f2ead6', '#3a6e8a', '#c8912e', '#e6d8b8'],
    },
    aisles: [{ from: [0, 40], to: [0, 0], width: 4.5 }],
    keepClear: [{ kind: 'rect', x: 0, z: -16, hx: 13, hz: 11 }],
    groups: [
      { center: ALTAR, radius: [16, 40], angle: [-1.9, 1.9], count: 900, kneel: 0.05, children: 0.08 },
    ],
  },

  player: {
    start: [0, -6.5],
    lookAt: ALTAR,
    colors: { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
