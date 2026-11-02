// Alma 22: Aaron teaches the king over all the Lamanites in his palace in the land of Nephi.
// The king kneels before his throne to pray (v. 17). Hall runs north (-z) from the door to the throne.
import { room, floor, block, brazier, figure, crown, cloth, linePoints } from './lib/bom-25-kit.js';

const HALL = { x: 0, z: -10, w: 22, d: 34, h: 7.5 };
const DAIS = [0, -22];
const SUN = [0.75, 0.42, 0.3];

const wall = '#e3d3b0';
const gold = '#d4a636';
const red = '#9a3324';

const columns = [-6, 6].flatMap((x) => [-19, -13, -7, -1, 5].map((z) => ({ type: 'column', x, z, h: HALL.h, radius: 0.5, color: '#d8c39c', broken: false })));

const servants = [-1, 1].flatMap((side, k) => [
  { count: 7, points: linePoints([side * 8.6, -19], [side * 8.6, 1], 7), face: [0, -16], children: 0, seed: 40 + k },
  { count: 5, points: linePoints([side * 9.8, -16], [side * 9.8, -2], 5), face: [0, -16], children: 0.2, seed: 50 + k },
]);

export default {
  title: "Alma 22: Aaron teaches Lamoni's father",
  seed: 25,
  fov: 56,
  exposure: 1.05,

  sun: { direction: SUN, color: '#ffdcaa', intensity: 3.4 },
  light: { sky: '#e0cfae', ground: '#6a4a34', hemi: 1.05 },
  sky: { top: '#5f86c4', horizon: '#f2d6aa', ground: '#c9a882', sunColor: '#fff0c8', glow: 1 },
  fog: { color: '#d8c0a0', near: 60, far: 420 },
  clouds: { count: 40, shadow: '#9a8a8a', lit: '#fff4e0', rim: '#ffffff', distance: [300, 900], altitude: [120, 260], hole: 0.3 },
  mountains: { count: 40, color: '#6c7a6a', radius: [480, 720], height: [60, 160], haze: 0.45 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.45, shadowTint: '#3a2a40', highlightTint: '#ffe6c0' },
  shadow: { center: [0, -10], radius: 30 },

  player: { start: [-1.9, -11.6], yaw: -0.16, pitch: 0.07, eye: 1.65, speed: 4 },

  terrain: {
    size: 900,
    segments: 160,
    seed: 25,
    hills: 30,
    bumps: 0.3,
    flats: [{ x: 0, z: -10, r: 50, falloff: 40, height: 0 }],
    colors: { ground: '#8e7650', groundAlt: '#7c6a46', grass: '#6c8040', high: '#7c8a5a', rock: '#7a6a58' },
    patches: [{ x: 0, z: 14, r: 12, color: '#b9a27e', strength: 0.8, rough: 0.3 }],
  },

  objects: [
    ...columns,
    { type: 'steppedPyramid', x: -40, z: 70, w: 26, d: 26, tiers: 4, tierHeight: 3, inset: 2.4, stairWidth: 6, color: '#c2a67c', trim: '#8c765c', shrine: { w: 8, d: 6, h: 4, door: 2 } },
    { type: 'steppedPyramid', x: 46, z: 60, rot: 0.3, w: 20, d: 20, tiers: 3, tierHeight: 3, inset: 2.4, stairWidth: 5, color: '#c2a67c', trim: '#8c765c' },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -10], ring: [32, 200], spacing: 7, seed: 5, props: { kind: 'broad', leaf: '#557a36' } },
    { type: 'tree', count: 20, center: [0, -10], ring: [30, 160], spacing: 7, seed: 6, props: { kind: 'palm', leaf: '#5d8a3c' } },
    { type: 'rock', count: 20, center: [0, -10], ring: [60, 260], spacing: 12, seed: 7, props: {} },
  ],

  crowd: {
    palette: {
      robes: ['#e6dcc4', '#c9b48e', '#a65d3f', '#d8cdb5', '#8b6b4a', '#3f6e6a'],
      mantles: ['#a8342a', '#2f6f6a', '#c8902a', '#5a3d2b', '#e2d2a8'],
      skins: ['#8a5a3c', '#9b6a46', '#7a4c31', '#a87652'],
      mantleChance: 0.8,
      hoodChance: 0.05,
    },
    groups: [
      ...servants,
      { count: 4, points: [[-4.2, -20.5], [4.2, -20.5], [-4.2, -24], [4.2, -24]], face: [0, -12], children: 0, onStructures: true, seed: 60 },
    ],
  },

  custom(ctx) {
    const { x, z, w, d, h } = HALL;
    floor(ctx, { x, z, w, d, tile: 2, colors: ['#b98262', '#c99a74'] });
    room(ctx, {
      x, z, w, d, h, t: 0.7, color: wall, roof: true, beams: 3,
      bands: [{ y: 0, h: 1.0, color: '#8e3a2a' }, { y: 4.4, h: 0.4, color: '#3f8a82' }, { y: 6.8, h: 0.7, color: '#b8862e' }],
      openings: [
        { side: 's', at: 0, w: 4, h: 4.6 },
        ...[-12, -4, 4, 12].flatMap((at) => [{ side: 'e', at, w: 1.6, h: 6, sill: 3 }, { side: 'w', at, w: 1.6, h: 6, sill: 3 }]),
      ],
    });

    // Carpet runner from the door to the dais.
    ctx.solid.box(2.6, 0.04, 24, { position: [0, 0.1, -7], color: gold, jitter: 0.02 });
    ctx.solid.box(2.1, 0.05, 24, { position: [0, 0.11, -7], color: red, jitter: 0.03 });
    for (let k = 0; k < 8; k++) ctx.solid.box(0.6, 0.06, 0.6, { position: [0, 0.12, 3 - k * 3], rotation: [0, Math.PI / 4, 0], color: gold, jitter: 0.02 });

    // Dais and throne.
    const [dx, dz] = DAIS;
    [[11, 7, 0.4], [9, 5.6, 0.8], [7, 4.2, 1.2]].forEach(([dw, dd, top], i) =>
      block(ctx, { x: dx, z: dz - i * 0.7, y: 0, w: dw, h: top, d: dd, color: i === 2 ? '#d9c39a' : '#c7ae7e' }));
    const seatY = 1.2;
    const tz = dz - 2.4;
    block(ctx, { x: dx, z: tz, y: seatY, w: 2.4, h: 0.65, d: 1.5, color: '#b89a68' });
    block(ctx, { x: dx, z: tz - 0.65, y: seatY, w: 2.4, h: 3, d: 0.35, color: '#b89a68' });
    block(ctx, { x: dx, z: tz - 0.5, y: seatY + 3, w: 2.8, h: 0.35, d: 0.5, color: gold, collide: false });
    for (const s of [-1, 1]) block(ctx, { x: dx + s * 1.1, z: tz, y: seatY + 0.65, w: 0.25, h: 0.5, d: 1.4, color: gold, collide: false });
    ctx.solid.box(1.9, 0.06, 1.3, { position: [dx, seatY + 0.68, tz + 0.05], color: '#d9a640', jitter: 0.02 });
    for (let k = 0; k < 9; k++) ctx.solid.box(0.14, 0.07, 0.14, { position: [dx - 0.8 + (k % 3) * 0.75 + (k % 2) * 0.1, seatY + 0.7, tz - 0.4 + Math.floor(k / 3) * 0.4], color: '#3a2a1a', jitter: 0 });

    // Sun disc and hangings on the north wall behind the throne.
    ctx.solid.add(new ctx.THREE.CylinderGeometry(1.4, 1.4, 0.2, 12), { position: [0, 6, z - d / 2 + 0.5], rotation: [Math.PI / 2, 0, 0], color: gold, jitter: 0.02 });
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.8, 0.8, 0.25, 12), { position: [0, 6, z - d / 2 + 0.55], rotation: [Math.PI / 2, 0, 0], color: '#3f8a82', jitter: 0.02 });
    for (const s of [-1, 1]) {
      cloth(ctx, { x: s * 3.6, y: 4.2, z: z - d / 2 + 0.45, w: 1.8, h: 4.6, color: s < 0 ? '#a8342a' : '#2f6f6a', amp: 0.03, speed: 0.8, seed: 3 + s });
      cloth(ctx, { x: s * 7.5, y: 4.2, z: z - d / 2 + 0.45, w: 1.8, h: 4.6, color: s < 0 ? '#2f6f6a' : '#a8342a', amp: 0.03, speed: 0.8, seed: 7 + s });
    }

    for (const [bx, bz] of [[-3.6, -17], [3.6, -17], [-3.6, -5], [3.6, -5]]) brazier(ctx, { x: bx, z: bz, intensity: 9, distance: 14 });

    // Spears for the guards by the throne.
    for (const [gx, gz] of [[-4.2, -20.5], [4.2, -20.5], [-4.2, -24], [4.2, -24]]) {
      const gy = ctx.colliders.ground(gx + 0.35, gz, 10, 0, { radius: 0 });
      ctx.solid.add(new ctx.THREE.CylinderGeometry(0.035, 0.035, 2.6, 4), { position: [gx + 0.35, gy + 1.3, gz + 0.1], color: '#4a3424' });
      ctx.solid.add(new ctx.THREE.ConeGeometry(0.08, 0.35, 4), { position: [gx + 0.35, gy + 2.75, gz + 0.1], color: '#2c2a30' });
    }

    // The king kneels on the dais; Aaron stands below him teaching; his brethren behind.
    const king = figure(ctx, { x: dx, z: dz - 0.6, y: seatY, kneel: true, face: [0, 10], scale: 1.25, robe: '#e8dcc0', mantle: '#8e2a20', skin: '#8a5a3c', arms: 'out' });
    crown(ctx, { x: dx, y: king.y, z: dz - 0.6, scale: 1.25 });
    figure(ctx, { x: -2.2, z: dz - 2.2, y: seatY, face: [0, -15], robe: '#d8cdb5', mantle: '#2f6f6a', skin: '#9b6a46' });
    figure(ctx, { x: 1.6, z: -16.6, face: [0, -21], robe: '#cdbb94', mantle: '#7d5c3e', skin: '#b5835e', arms: 'out' });
    figure(ctx, { x: 3.2, z: -14.8, face: [0, -21], robe: '#b59a72', mantle: '#5e4b3a', skin: '#a87652' });
    figure(ctx, { x: 4.3, z: -15.6, face: [0, -21], robe: '#a0825c', skin: '#b07a55', hood: true, mantle: '#6e5a44' });
  },
};
