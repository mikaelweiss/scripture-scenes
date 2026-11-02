// Alma 24:15-19: the people of Anti-Nephi-Lehi bury their swords deep in the earth as a covenant.
// Long trenches run east-west across a field; the people kneel around them, the king stands beyond.
import { block, figure, crown, sword, spear, mound, pit } from './lib/bom-25-kit.js';

const TRENCHES = [[-10, -14], [10, -14], [0, -24]];
const KING = [0, -31];

export default {
  title: 'Alma 24:15-19: The Anti-Nephi-Lehies bury their weapons',
  seed: 26,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.7, 0.45, -0.3], color: '#ffd29a', intensity: 3.1 },
  light: { sky: '#9fb6dc', ground: '#5a4a32', hemi: 1.0 },
  sky: { top: '#5c82c0', horizon: '#f6cf9a', ground: '#c9a882', sunColor: '#ffe6b8', glow: 1.1 },
  fog: { color: '#d9c4a4', near: 80, far: 520 },
  clouds: { count: 50, shadow: '#7f7a88', lit: '#ffe2b0', rim: '#fff6dc', distance: [260, 900], altitude: [100, 240], hole: 0.25 },
  mountains: { count: 44, color: '#5f6e5c', radius: [560, 800], height: [40, 110], haze: 0.6 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.4, shadowTint: '#2e3050', highlightTint: '#ffe4b8' },
  shadow: { center: [0, -12], radius: 50 },

  player: { start: [-0.6, -19.6], yaw: 0, pitch: -0.17, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 26,
    hills: 30,
    bumps: 0.4,
    flats: [{ x: 0, z: -12, r: 45, falloff: 50, height: 0 }, { x: 0, z: 3, r: 3, falloff: 6, height: 2.2 }],
    colors: { ground: '#7c7a44', groundAlt: '#6e7a3e', grass: '#5f7a36', high: '#728a4a', rock: '#7a6a58' },
    patches: [
      { x: 0, z: -16, r: 30, color: '#8a7448', strength: 0.55, rough: 0.5 },
      { x: 0, z: 8, r: 7, color: '#8f7a52', strength: 0.6, rough: 0.4 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: -60, z: -170, w: 34, d: 30, tiers: 4, tierHeight: 3.4, inset: 2.6, stairWidth: 7, color: '#b39a74', trim: '#836c52', shrine: { w: 9, d: 7, h: 4.5, door: 2 } },
    { type: 'steppedPyramid', x: 30, z: -190, w: 20, d: 20, tiers: 3, tierHeight: 3, inset: 2.2, stairWidth: 5, color: '#b39a74', trim: '#836c52' },
  ],

  scatter: [
    { type: 'tree', count: 60, center: [0, -12], ring: [60, 260], spacing: 8, seed: 3, props: { kind: 'broad', leaf: '#4f7432' } },
    { type: 'tree', count: 18, center: [0, -12], ring: [55, 200], spacing: 8, seed: 4, props: { kind: 'palm', leaf: '#5a8238' } },
    { type: 'rock', count: 26, center: [0, -12], ring: [55, 300], spacing: 12, seed: 5, props: { color: '#857560' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#7a4c31', '#8a5a3c', '#9b6a46', '#6e4228'],
      mantleChance: 0.5,
      hoodChance: 0.25,
    },
    groups: [
      {
        count: 900, center: [0, -18], ring: [7, 40], spacing: 0.9, face: [0, -18], children: 0.18, kneel: 0.45, seed: 31,
        avoid: [
          ...TRENCHES.map(([x, z]) => ({ rect: [x, z, 18, 8] })),
          { rect: [0, -1, 44, 20] },
          { rect: [KING[0], KING[1] + 1, 12, 9] },
        ],
      },
      { count: 120, center: [0, -18], ring: [40, 48], arc: [Math.PI, 2 * Math.PI], spacing: 1.2, face: [0, -18], children: 0.2, seed: 32 },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    for (const [tx, tz] of TRENCHES) {
      const L = 14, W = 3.2;
      // Swords, spears and clubs laid crosswise on the pit floor.
      pit(ctx, {
        x: tx, z: tz, L, W,
        fill: (p) => {
          for (let i = 0; i < 46; i++) {
            const sx = tx + r.range(-L / 2 + 0.8, L / 2 - 0.8), sz = tz + r.range(-1.1, 1.1), sy = p.floorY + 0.06 + r() * 0.35;
            if (r() < 0.75) sword(p, { x: sx, y: sy, z: sz, yaw: r.range(-0.9, 0.9) + (r() < 0.5 ? Math.PI / 2 : 0), roll: r.range(-0.3, 0.3) });
            else spear(p, { x: sx - 1, y: sy, z: sz, yaw: Math.PI / 2 + r.range(-0.3, 0.3), len: 2 });
          }
        },
      });
      // Spoil heaped along the north lip.
      for (let i = 0; i < 9; i++) mound(ctx, { x: tx - L / 2 + 0.5 + i * 1.65 + r.range(-0.3, 0.3), z: tz - W / 2 - 1.4 + r.range(-0.3, 0.3), w: r.range(2.2, 3.2), h: r.range(0.8, 1.2), d: r.range(1.6, 2.2), rot: r() * 3, color: r.pick(['#6e4c30', '#7a5636', '#5e4029']) });
      ctx.colliders.add({ x: tx, z: tz - W / 2 - 1.4, w: L, d: 2, bottom: -1, top: 0.9 });
      // Digging sticks left standing in the earth.
      for (let i = 0; i < 2; i++) {
        const px = tx + r.range(-5, 5), pz = tz - W / 2 - 1.5;
        ctx.solid.box(0.07, 1.6, 0.07, { position: [px, 1.0, pz], rotation: [r.range(-0.3, 0.3), 0, r.range(-0.3, 0.3)], color: '#6a4a30' });
        ctx.solid.box(0.25, 0.35, 0.03, { position: [px, 1.9, pz], rotation: [0, r() * 3, 0], color: '#6a4a30' });
      }
    }

    // Piles of weapons waiting at the trench ends.
    for (const [hx, hz] of [[-19, -10], [19, -10], [-8, -20], [8, -20], [-2, -9.5], [3, -9.6]]) {
      for (let i = 0; i < 14; i++) sword(ctx, { x: hx + r.range(-0.6, 0.6), y: ctx.heightAt(hx, hz) + 0.04 + i * 0.03, z: hz + r.range(-0.6, 0.6), yaw: r() * Math.PI * 2, roll: r.range(-0.2, 0.2) });
      for (let i = 0; i < 3; i++) spear(ctx, { x: hx - 1.2, y: ctx.heightAt(hx, hz) + 0.08 + i * 0.05, z: hz + r.range(-0.5, 0.5), yaw: Math.PI / 2 + r.range(-0.2, 0.2), len: 2.2 });
    }

    // People at the lip of the near trenches lowering their swords in.
    for (const [px, pz, tx] of [[-6, -11.6, -6], [-13, -11.5, -13], [7, -11.6, 7], [13, -11.5, 13], [-5.5, -21.6, -5.5], [5, -21.6, 5]]) {
      const p = figure(ctx, { x: px, z: pz, face: [tx, pz - 3], kneel: true, robe: r.pick(['#8b6b4a', '#a0825c', '#b59a72', '#7a4e36']), mantle: r.pick(['#5a3d2b', '#7d5c3e', '#556246']), skin: '#8a5a3c', arms: 'out' });
      sword(ctx, { x: px, y: p.y + 1.0, z: pz - 0.45, yaw: Math.PI, pitch: 0.9 });
    }

    // More people walk up from the south carrying their swords to the pits.
    for (const [px, pz] of [[-4.5, -6], [-9, -8], [-15, -5.5], [-19, -8.5], [5, -7], [10, -5], [15, -8], [20, -6], [-11, -2], [12, -1.5]]) {
      const p = figure(ctx, { x: px, z: pz, face: [px * 0.9, -14], robe: r.pick(['#8b6b4a', '#a0825c', '#b59a72', '#7a4e36', '#c4b090']), mantle: r() < 0.6 ? r.pick(['#5a3d2b', '#7d5c3e', '#556246', '#a34f32']) : undefined, skin: r.pick(['#7a4c31', '#8a5a3c', '#9b6a46']), scale: r.range(0.94, 1.06) });
      const yaw = Math.atan2(px * 0.9 - px, -14 - pz);
      sword(ctx, { x: px + Math.cos(yaw) * 0.27, y: p.y + 0.78, z: pz - Math.sin(yaw) * 0.27, yaw, pitch: 0.5 });
    }

    // The king on a low earthen rise beyond the trenches, arms open, with Ammon and his brethren.
    block(ctx, { x: KING[0], z: KING[1], y: -0.3, w: 9, h: 0.9, d: 5, color: '#7a6448' });
    block(ctx, { x: KING[0], z: KING[1] - 0.4, y: 0.6, w: 3.4, h: 0.9, d: 2.6, color: '#86704f' });
    const king = figure(ctx, { x: KING[0], z: KING[1] - 0.4, y: 1.5, face: [0, 10], scale: 1.05, robe: '#e8dcc0', mantle: '#8e2a20', skin: '#7a4c31', arms: 'out' });
    crown(ctx, { x: KING[0], y: king.y, z: KING[1] - 0.4, scale: 1.05 });
    figure(ctx, { x: 3.2, z: KING[1] + 0.4, y: 0.6, face: [0, 0], robe: '#cdbb94', mantle: '#5e4b3a', skin: '#b5835e' });
    figure(ctx, { x: 4.4, z: KING[1] - 0.6, y: 0.6, face: [0, 0], robe: '#b59a72', mantle: '#6e5a44', skin: '#b07a55', hood: true });
    figure(ctx, { x: -3.4, z: KING[1] + 0.2, y: 0.6, face: [0, 0], robe: '#c9b48e', mantle: '#3f4d5e', skin: '#a87652' });
  },
};
