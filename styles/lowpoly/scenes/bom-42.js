// 3 Nephi 17: at the temple in Bountiful, Jesus blesses the little children one by one.
// The heavens open, angels descend as in the midst of fire and encircle the children, and fire encircles them.
// Built on the 3 Nephi 11 scene: same land, temple and multitude, gathered now around the children.
import reference from '../scene.js';
import { figure, angel, fires } from './lib/bom-37-kit.js';

const CIRCLE = [0, -6];
const FIRE_R = 7.4;
const TEMPLE = [0, -66];

const rings = [[2.2, 10], [3.3, 16], [4.4, 22], [5.5, 26]];
const children = rings.flatMap(([r, n], k) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + k * 0.4;
    return [CIRCLE[0] + Math.cos(a) * r, CIRCLE[1] + Math.sin(a) * r];
  }),
);

const objects = reference.objects
  .filter((o) => !(o.type === 'steppedPyramid' && o.w === 12))
  .map((o) => (o.type === 'pavement' ? { ...o, holes: [] } : o));

export default {
  ...reference,
  title: '3 Nephi 17: Christ blesses the children',
  seed: 42,

  sun: { direction: [-0.8, 0.4, 0.2], color: '#ffd29a', intensity: 2.8 },
  sky: { top: '#4a5f88', horizon: '#f4c088', ground: '#d4a483', sunColor: '#ffe0b0', glow: 1.2 },
  clouds: { ...reference.clouds, hole: 0.25 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.78 },
  shadow: { center: [0, -6], radius: 70 },

  player: { start: [0, 11], yaw: 0, pitch: -0.04, eye: 1.65, speed: 4.5 },

  objects,

  crowd: {
    palette: reference.crowd.palette,
    groups: [
      {
        count: 1900, center: CIRCLE, ring: [10.5, 52], arc: [-0.35, Math.PI + 0.35], spacing: 0.85, face: CIRCLE, children: 0.12, kneel: 0.25, seed: 21,
        avoid: [{ rect: [0, 22, 10, 38] }, { rect: [TEMPLE[0], TEMPLE[1], 62, 58] }, { rect: [-36, -22, 3, 42] }, { rect: [36, -22, 3, 42] }],
      },
      { count: 300, center: CIRCLE, ring: [12, 46], arc: [Math.PI + 0.35, Math.PI * 2 - 0.35], spacing: 0.9, face: CIRCLE, children: 0.1, kneel: 0.2, seed: 22, avoid: [{ rect: [TEMPLE[0], TEMPLE[1], 62, 58] }, { rect: [-36, -22, 3, 42] }, { rect: [36, -22, 3, 42] }] },
      { count: children.length, points: children, face: CIRCLE, children: 1, seed: 23 },
    ],
  },

  figures: [],

  effects: [
    { type: 'beam', at: CIRCLE, height: 280, radiusBottom: FIRE_R + 1, radiusTop: 34, color: '#fff1cf', opacity: 0.45 },
    { type: 'beam', at: CIRCLE, height: 280, radiusBottom: 3, radiusTop: 12, color: '#fff8e6', opacity: 0.25 },
    { type: 'ring', at: CIRCLE, lift: 0.05, radius: FIRE_R, width: 1.3, color: '#ffd890', opacity: 1 },
    { type: 'motes', at: CIRCLE, radius: FIRE_R, height: 45, count: 320 },
    { type: 'sunShafts', center: [-30, -120], count: 7, spread: 90, length: 500, width: [10, 26], opacity: 0.07 },
  ],

  custom(ctx) {
    // A fallen block of the plaza the player stands on to see over the multitude.
    for (const [w, d, h] of [[5, 4.4, 0.6], [3.6, 3, 1.2]]) {
      const y = ctx.heightAt(0, 11) - 0.1;
      ctx.solid.box(w, h, d, { position: [0, y + h / 2, 11.4], rotation: [0, 0.05, 0], color: '#b8a07e' });
      ctx.colliders.add({ x: 0, z: 11.4, w, d, rot: 0.05, bottom: y, top: y + h });
    }
    // Jesus among the children, arms out in blessing.
    figure(ctx, {
      x: CIRCLE[0], z: CIRCLE[1], face: [0, 30], scale: 1.12, pose: 'out', robe: '#fbf7ee', mantle: '#f3ecdc', skin: '#a8754f', emissive: 0.3,
      light: { color: '#fff0cf', intensity: 60, distance: 30 },
      halo: { size: 6, opacity: 0.55, color: '#fff3d6' },
    });

    // A ring of soft white fire that does not burn.
    const flames = Array.from({ length: 56 }, (_, i) => {
      const a = (i / 56) * Math.PI * 2;
      return { x: CIRCLE[0] + Math.cos(a) * FIRE_R, z: CIRCLE[1] + Math.sin(a) * FIRE_R, size: 0.6, tongues: 4 };
    });
    fires(ctx, flames, { lights: 0, colors: ['#ffc870', '#fff6dc'], ash: null });

    // Angels standing among the little ones, and more descending out of the open heavens.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const x = CIRCLE[0] + Math.cos(a) * 8.8, z = CIRCLE[1] + Math.sin(a) * 8.8;
      angel(ctx, { x, z, y: ctx.heightAt(x, z) + 0.15, face: CIRCLE, bob: 0.08, phase: i });
    }
    const descending = [[-5, 6, -2], [6, 9, -5], [-8, 12, -8], [3, 15, -4], [9, 19, -10], [-11, 22, -6], [0, 26, -12]];
    descending.forEach(([dx, y, dz], i) => angel(ctx, { x: CIRCLE[0] + dx, z: CIRCLE[1] + dz, y, face: [0, 30], bob: 1.2, phase: i * 1.7 }));
  },
};
