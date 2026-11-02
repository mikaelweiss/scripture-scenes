// Acts 7:54-60: outside Jerusalem Stephen kneels and sees the heavens opened and the Son of man standing.
// The city wall lies north. The witnesses have laid their coats at the feet of a young man named Saul.
import * as THREE from 'three';
import { Batch, DAY_STYLE, angels, box, cityWall, frameAt, glow, olive, person, scatterRocks, xf } from './lib/nt-25-kit.js';

const STEPHEN = [0, -5];
const SAUL = [6.5, 1.5];
const VISION = [0, 25, -80];

const ACCUSERS = {
  robes: ['#5e4632', '#6b5a4a', '#4a3a30', '#7a6a52', '#3e4a52', '#8c5a3c', '#5a4a5e', '#d9c7a3'],
  mantles: ['#3a2a22', '#4a3020', '#2f3a40', '#6b4a33', '#5e3c26', '#4a4060'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33'],
  hair: ['#2b1a12', '#1f140e', '#3a2418', '#6a6058'],
  wraps: ['#e6d8b8', '#d9c7a3', '#3a2a22', '#5e4632'],
};

function coats(b, ctx) {
  const [x, z] = [SAUL[0] + 0.9, SAUL[1] - 0.6];
  const y = ctx.terrainHeight(x, z);
  const colors = ['#5e4632', '#8c5a3c', '#3e4a52', '#a64b35', '#6b5a4a', '#d9c7a3', '#4a3a30'];
  colors.forEach((c, i) => {
    const a = i * 1.7;
    b.add(c, xf(new THREE.BoxGeometry(1.2, 0.12, 0.8), { pos: [x + Math.sin(a) * 0.2, y + 0.08 + i * 0.1, z + Math.cos(a) * 0.15], rot: [0.08 * (i % 2 ? 1 : -1), a, 0.06] }));
  });
  ctx.addCollider({ x, z, hx: 0.7, hz: 0.6, rot: 0, top: y + 0.8 });
}

export default {
  title: "Acts 7:54-60: Stephen's vision",
  subtitle: 'Outside Jerusalem. Behold, I see the heavens opened, and the Son of man standing on the right hand of God.',
  seed: 30,

  style: { ...DAY_STYLE, fog: { color: '#c9bca6', near: 110, far: 950 } },

  sky: { zenith: '#3e4a66', mid: '#7d8494', horizon: '#d9c6a2', ground: '#9a8466', glowColor: '#ffe7ad', glowDir: [0, 0.3, -1] },

  sun: {
    dir: [0.2, 0.8, -0.6],
    color: '#fff0d0',
    intensity: 2.0,
    hemi: { sky: '#aab4c4', ground: '#7a6448', intensity: 1.0 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 260,
    flatRadius: 100,
    hillHeight: 30,
    undulation: 0.5,
    plaza: { center: [0, -42], size: [6, 30] },
    colors: {
      sand: '#b89a70',
      dirt: '#a08458',
      grass: '#8a8a58',
      grassDark: '#6c6e44',
      plaza: '#c2a87e',
      plazaLine: '#b49a70',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#8a8458',
    },
  },

  mountains: { count: 28, distance: [500, 780], height: [40, 100], widthRatio: [2, 3], colors: ['#76788a', '#6a6e80', '#808090'] },

  objects: [
    { type: 'stones', count: 500, ring: [3, 80], size: [0.1, 0.45], colors: ['#a89070', '#8f7a5e', '#b8a080', '#7a6a58'] },
  ],

  custom(ctx) {
    const b = new Batch(ctx);
    cityWall(b, ctx, { from: [-140, -62], to: [-7, -60], height: 13, thick: 3, color: '#cdb48a' });
    cityWall(b, ctx, { from: [7, -60], to: [140, -64], height: 13, thick: 3, color: '#cdb48a' });
    for (const s of [-1, 1]) {
      const f = frameAt(s * 8.5, ctx.terrainHeight(s * 8.5, -60) - 0.5, -60, 0);
      b.add('#c2a87e', box(6, 18, 7, [0, 9, 0]), { frame: f });
      for (let i = 0; i < 3; i++) b.add('#c2a87e', box(1.2, 1.2, 7, [-2.2 + i * 2.2, 18.6, 0]), { frame: f });
      ctx.addCollider({ x: s * 8.5, z: -60, hx: 3, hz: 3.5, rot: 0, top: 30 });
    }
    b.add('#c2a87e', box(11, 4, 5, [0, ctx.terrainHeight(0, -60) + 11.5, -60]));
    b.add('#2b1a12', box(5.2, 9.5, 0.3, [0, ctx.terrainHeight(0, -60) + 4.6, -57.8]));
    for (let i = 0; i < 18; i++) {
      const x = -60 + (i % 9) * 15 + (i > 8 ? 7 : 0), z = -72 - (i > 8 ? 14 : 0);
      b.add(i % 2 ? '#d8c095' : '#cdb48a', box(8, 6 + (i % 4) * 3, 8, [x, ctx.terrainHeight(x, z) + 4 + (i % 4) * 1.5, z]));
    }
    const olives = [[-24, -18], [22, -22], [-34, 6], [34, 8], [-16, 24], [18, 26], [-44, -30], [46, -34]];
    olives.forEach((p, i) => olive(b, ctx, { pos: p, size: 1.1 + (i % 3) * 0.2, seed: i + 30, leaf: '#7f8a62', leafDark: '#66704e' }));
    coats(b, ctx);
    scatterRocks(b, ctx, { ring: [10, 90], count: 80, size: [0.4, 1.3], colors: ['#9a8a70', '#857660', '#a89878'] });
    b.flush();

    const sy = ctx.terrainHeight(...STEPHEN);
    const stephen = person(ctx, { pos: STEPHEN, face: [0, -40], kneel: true, scale: 1.05, colors: { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#a87650', hair: '#3a2418', sash: '#c8912e', arms: [0.6, 2.3] } });
    stephen.rotation.order = 'YXZ';
    stephen.rotation.x = -0.25;
    glow(ctx, { pos: [STEPHEN[0], sy + 1.2, STEPHEN[1]], size: 5, color: '#ffe8b0', opacity: 0.5 });
    person(ctx, { pos: SAUL, face: STEPHEN, colors: { robe: '#3e4a52', mantle: '#6b4a33', skin: '#b5825a', hair: '#1f140e', sash: '#a64b35', arms: [0.12, 0.15] } });

    angels(ctx, [{ pos: [VISION[0] + 2.5, VISION[1] - 3, VISION[2]], face: [0, 0], scale: 3.2 }], { glowSize: 8, glowOpacity: 0.6, bob: 0.1 });
    glow(ctx, { pos: VISION, size: 70, color: '#fff0c0', opacity: 0.85, pulse: 0.03 });
    glow(ctx, { pos: [VISION[0] - 3, VISION[1] + 1, VISION[2] - 2], size: 22, color: '#ffffff', opacity: 0.9, pulse: 0.05 });
  },

  clouds: {
    layers: [
      { count: 40, distance: [300, 800], height: [70, 170], size: [50, 100], color: '#9a9aa8', shade: '#2a2a3a' },
      { count: 16, center: [VISION[0], VISION[2]], distance: [26, 55], height: [36, 52], size: [16, 30], color: '#fff3dc', shade: '#6a5a58' },
    ],
  },

  light: {
    beams: [{ from: [VISION[0], VISION[1], VISION[2]], to: { at: STEPHEN, lift: 0.6 }, width: [22, 4], color: '#fff2c9', intensity: 0.2, layers: 3, stripes: 18, fadeLow: 0.05 }],
    pointLights: [{ at: STEPHEN, lift: 3, color: '#ffe6b0', intensity: 14, distance: 16 }],
  },

  crowd: {
    seed: 30,
    minSpacing: 0.75,
    facing: STEPHEN,
    colors: ACCUSERS,
    keepClear: [{ kind: 'circle', x: SAUL[0], z: SAUL[1], r: 2 }],
    groups: [
      { center: STEPHEN, radius: [9, 18], angle: [-2.4, -0.7], count: 70, lean: 0.12 },
      { center: STEPHEN, radius: [10, 18], angle: [0.9, 2.4], count: 60, lean: 0.12 },
    ],
  },

  player: {
    start: [2, 3],
    lookAt: [0, -9],
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
