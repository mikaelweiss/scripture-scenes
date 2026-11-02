// 3 Nephi 17: Christ blesses the little children one by one. Angels descend and encircle them with fire.
import base from '../scene.js';
import { angel, flames, glow } from './lib/bom-37-kit.js';

const CHRIST = [0, -15.5];
const RING = 5.8;
const ANGELS = 8;
const ANGEL_LOOK = {
  colors: { robe: '#b4c9ea', mantle: '#a2bae2', skin: '#cfdcf0', hair: '#c4d4ee', sash: '#94acd8', arms: [0.5, 0.45] },
  glowColor: '#b8d0ff',
  glowAmount: 0.3,
  opacity: 0.6,
};

export default {
  ...base,
  title: '3 Nephi 17: Christ blesses the children',
  subtitle: 'Bountiful, the little ones encircled by fire',
  seed: 17,

  sky: { ...base.sky, glowDir: [0, 0.7, -0.6] },

  custom(ctx) {
    const y = ctx.groundHeight(CHRIST[0], CHRIST[1]);
    const fire = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const x = CHRIST[0] + Math.sin(a) * RING, z = CHRIST[1] + Math.cos(a) * RING;
      fire.push({ x, y: ctx.groundHeight(x, z) - 0.05, z, size: 0.42 + (i % 3) * 0.12 });
    }
    flames(ctx, fire, { outer: '#ffb347', inner: '#fff1b8' });
    for (let i = 0; i < ANGELS; i++) {
      const a = ((i + 0.5) / ANGELS) * Math.PI * 2;
      const r = RING + 1.4;
      const x = CHRIST[0] + Math.sin(a) * r, z = CHRIST[1] + Math.cos(a) * r;
      const h = i % 2 ? 2.0 : 3.4;
      angel(ctx, [x, ctx.groundHeight(x, z) + h, z], { ...ANGEL_LOOK, facing: CHRIST, phase: i * 0.9, drift: 0.2, scale: 0.72, glowSize: 3 });
    }
    const high = [[-14, 14, -6], [12, 20, -20], [-4, 28, -30], [20, 11, -4], [-22, 22, -24]];
    high.forEach((p, i) => angel(ctx, p, { ...ANGEL_LOOK, facing: [0, 10], phase: i * 1.7, drift: 0.6, scale: 0.85, glowSize: 5 }));
    glow(ctx, [CHRIST[0], y + 0.8, CHRIST[1]], 16, '#ffe0a0', 0.3);
  },

  light: {
    rayFans: [
      { source: [0, 130, -20], sourceJitter: 60, target: CHRIST, groundY: 4, spread: [10, 40], count: 9, width: [[3, 6], [6, 11]], color: '#fff0c4', intensity: 0.28, stripes: 9, fadeLow: 0.3 },
    ],
    beams: [
      { from: [0, 190, -14], to: { at: CHRIST, lift: 1.4 }, width: [14, 9], color: '#fff2c9', intensity: 0.18, layers: 3, stripes: 26, fadeLow: 0.04 },
      { from: [-14, 120, -6], to: [-14, 14, -6], width: [5, 3], color: '#fff6dc', intensity: 0.22, layers: 2, stripes: 14, fadeLow: 0.2 },
      { from: [12, 120, -20], to: [12, 20, -20], width: [5, 3], color: '#fff6dc', intensity: 0.22, layers: 2, stripes: 14, fadeLow: 0.2 },
      { from: [20, 120, -4], to: [20, 11, -4], width: [5, 3], color: '#fff6dc', intensity: 0.22, layers: 2, stripes: 14, fadeLow: 0.2 },
      { from: [-22, 130, -24], to: [-22, 22, -24], width: [5, 3], color: '#fff6dc', intensity: 0.22, layers: 2, stripes: 14, fadeLow: 0.2 },
    ],
    rings: [
      { at: CHRIST, lift: 0, radius: RING, width: 0.45, height: 3.4, color: '#ffc46a', intensity: 1.0, wallIntensity: 0.6 },
    ],
    glows: [{ at: CHRIST, lift: 1.3, size: 7, color: '#fff3d0', opacity: 0.85 }],
    pointLights: [
      { at: CHRIST, lift: 2.5, color: '#ffe6b0', intensity: 14, distance: 20 },
      { at: CHRIST, lift: 1.0, color: '#ffb347', intensity: 10, distance: 16 },
    ],
  },

  clouds: {
    layers: base.clouds.layers.map((l) => (l.center ? { ...l, center: CHRIST } : l)),
  },

  figures: [{ ...base.figures[0], pos: CHRIST, scale: 1.45, glow: 0.55, facing: [0, 30], colors: { ...base.figures[0].colors, robe: '#fff6e2', mantle: '#f8e7c4', sash: '#e6c27a', arms: [0.75, 0.55] } }],

  crowd: {
    ...base.crowd,
    facing: CHRIST,
    aisles: [{ from: [0, 48], to: [0, -8], width: 4 }],
    keepClear: [{ kind: 'rect', x: 0, z: -17, hx: 11, hz: 9.2 }, { kind: 'circle', x: CHRIST[0], z: CHRIST[1], r: RING + 2.6 }],
    groups: [
      ...base.crowd.groups.slice(0, 3),
      { center: CHRIST, radius: [1.4, RING - 0.9], count: 60, children: 1, kneel: 0.6, insideClear: true, facingJitter: 0.3 },
    ],
  },

  player: { ...base.player, start: [0, -7.5], lookAt: CHRIST },
};
