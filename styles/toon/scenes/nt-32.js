// Acts 9:1-9: at noon on the road near Damascus a light from heaven, brighter than the sun, strikes Saul to the ground.
// The road runs north to Damascus. Saul lies in the road where the light falls; his companions stand speechless.
import { animal, Batch, boulders, city, DAY_STYLE, fallen, palm, PALETTE, person, ribbon, ringPoints } from './lib/nt-32-kit.js';

const SAUL = [0, 0];
const ROAD = [[6, 260], [3, 120], [0, 40], [0, -20], [-4, -90], [-10, -150]];

export default {
  title: 'Acts 9:1-9: Saul on the road to Damascus',
  subtitle: 'At midday, a light from heaven above the brightness of the sun',
  seed: 32,

  style: { ...DAY_STYLE, fog: { color: '#f6ead0', near: 140, far: 1100 } },

  sky: { zenith: '#6aa6c0', mid: '#bcd8d8', horizon: '#fbf0d4', ground: '#e0c697', glowColor: '#fffbea', glowDir: [0, 1, -0.15] },

  sun: { dir: [0.15, 1, 0.2], color: '#fff6e2', intensity: 2.7, hemi: { sky: '#eef4ee', ground: '#c09a68', intensity: 1.3 }, shadowSize: 60 },

  ground: {
    size: 1600, segments: 300, flatRadius: 110, hillHeight: 46, undulation: 0.5,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#e3c38a', dirt: '#d2a86c', grass: '#b3ac6a', grassDark: '#8e8a50', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c79d6a' },
  },

  mountains: { count: 30, distance: [520, 820], height: [80, 200], widthRatio: [1.6, 2.6], colors: ['#c9a982', '#b89a78', '#d2b48e', '#a98e72'] },

  objects: [
    { type: 'stones', count: 500, ring: [6, 140], size: [0.12, 0.4], colors: ['#c9a982', '#b89a70', '#d9c39a', '#a58a66'] },
    { type: 'trees', count: 26, ring: [40, 200], height: [3, 5], broken: 0, fallen: 0, trunkColor: '#6b5a48', leafColors: ['#8a9a6a', '#7a8c5c', '#9aa874'] },
  ],

  custom(ctx) {
    const b = new Batch(ctx);
    ribbon(ctx, { points: ROAD, width: 6, color: '#c4945c' });
    ribbon(ctx, { points: ROAD, width: 4.4, color: '#e8cd98', lift: 0.07, wobble: 0.2 });

    city(b, ctx, { wall: [[70, -165], [-90, -165]], gate: 80, depth: 70, count: 70, height: 8, towers: 7, seed: 9 });
    for (const [x, z, s] of [[-30, -150, 1], [-22, -152, 2], [18, -150, 3], [30, -154, 4], [44, -150, 5], [-48, -150, 6]]) palm(b, ctx, { pos: [x, z], height: 8 + (s % 3) * 1.5, lean: 0.1 + (s % 2) * 0.1, dir: s, seed: s });

    boulders(ctx, [[-14, 6, 1.4], [-17, 9, 0.8], [15, -8, 1.8], [18, -4, 1], [-22, -26, 2.2], [26, 22, 1.6], [-28, 34, 1.2], [36, -40, 2.4], [-40, -60, 2.8], [12, 40, 0.9]], { colors: ['#c9a982', '#b89a78', '#d2b48e'] });

    // Saul fallen on his face in the road, his travelling bag spilled beside him.
    fallen(ctx, { pos: SAUL, toward: [-3, -0.6], scale: 1.3, colors: { robe: '#2f4f74', mantle: '#7a3e2c', skin: '#b5825a', hair: '#2b1a12', sash: '#c8912e', arms: [1.2, 0.2] } });
    boulders(ctx, [[1.4, 1.2, 0.25]], { colors: ['#8c5a3c'], collide: false });

    // The men journeying with him stand speechless, shielding their eyes.
    const companions = [
      { pos: [-4.2, 4.5], arms: [0.3, 2.3], robe: '#7a6a52', mantle: '#5e4632' },
      { pos: [-4.8, 7.6], arms: [0.5, 1.6], robe: '#a87b4f', mantle: '#3e6e66' },
      { pos: [3.6, 5.2], arms: [0.25, 2.5], robe: '#8c5a3c', mantle: '#d9c7a3' },
      { pos: [5.6, 3.0], arms: [0.9, 0.6], robe: '#6f8a6a', mantle: '#5e4632' },
      { pos: [1.2, 8.4], arms: [0.3, 2.2], robe: '#c8a97a', mantle: '#a64b35' },
    ];
    companions.forEach((c, i) => {
      const fig = person(ctx, { pos: c.pos, face: [SAUL[0] + (i - 2) * 0.6, SAUL[1] - 2], colors: { robe: c.robe, mantle: c.mantle, skin: PALETTE.skins[i % 6], hair: PALETTE.hair[i % 4], sash: '#c8912e', arms: c.arms } });
      fig.rotation.x = -0.12;
    });

    // Their pack animals shy away from the light.
    animal(b, ctx, { kind: 'donkey', pos: [-8, 11], rot: 2.6, color: '#8a7a6a' });
    animal(b, ctx, { kind: 'donkey', pos: [8.5, 9], rot: -2.4, color: '#6e5d4e' });
    animal(b, ctx, { kind: 'donkey', pos: [10, 14], rot: -2.8, color: '#9a8670' });

    for (const [x, z, r] of ringPoints(ctx, { center: [0, 0], ring: [24, 120], count: 60, seed: 4, margin: 2, reject: (x) => Math.abs(x) < 8 })) {
      b.add(r < 0.5 ? '#9aa874' : '#8a8a58', new (ctx.THREE.SphereGeometry)(0.6 + r, 7, 5).scale(1.3, 0.6, 1.1).translate(x, ctx.terrainHeight(x, z) + 0.15, z));
    }
    b.flush();
  },

  clouds: {
    layers: [
      { count: 30, distance: [380, 800], height: [80, 160], size: [40, 80], color: '#fffaf0', shade: '#8a96a8' },
      { count: 14, center: SAUL, distance: [40, 90], height: [150, 190], size: [30, 50], color: '#fffdf4', shade: '#c8c0a8', drift: 0.006 },
    ],
  },

  light: {
    beams: [{ from: [0, 200, -4], to: { at: SAUL, lift: 0.3 }, width: [18, 6], color: '#fffdf0', intensity: 0.32, layers: 3, stripes: 26, fadeLow: 0.04 }],
    rings: [{ at: SAUL, lift: 0, radius: 4.2, width: 0.4, height: 2.5, color: '#fff3c0', intensity: 0.8, wallIntensity: 0.25 }],
    glows: [
      { at: SAUL, lift: 1.6, size: 6, color: '#fffbe8', opacity: 0.3 },
      { pos: [0, 120, -5], size: 140, color: '#fffbe8', opacity: 0.9 },
      { pos: [0, 120, -5], size: 50, color: '#ffffff', opacity: 1 },
    ],
    pointLights: [{ at: SAUL, lift: 3, color: '#fff2c8', intensity: 4, distance: 18 }],
  },

  player: {
    start: [-2.2, 13],
    lookAt: [0.4, -2],
    colors: { robe: '#b5523b', mantle: '#d9c7a3', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
