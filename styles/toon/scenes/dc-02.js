// D&C 27:12, 128:20: Peter, James, and John confer the Melchizedek Priesthood on Joseph Smith and Oliver Cowdery
// in the wilderness by the Susquehanna River. x is east, z is south; the river runs north-south to the east.
import { glowSprite, heavenly, periodPerson, pines, river, trackAvatar } from './lib/dc-01-kit.js';

const MEET = [0, -10];

export default {
  title: 'D&C 27:12, 128:20: Peter, James, and John restore the priesthood',
  subtitle: 'The Susquehanna wilderness, 1829',
  seed: 27,

  style: {
    ink: '#24180f',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e9c9a0', near: 70, far: 700 },
  },

  sky: { zenith: '#3b4f7a', mid: '#8a8fae', horizon: '#f5c48a', ground: '#6a6a48', glowColor: '#ffd9a0', glowDir: [0.9, 0.18, 0.2] },

  sun: { dir: [0.85, 0.35, 0.2], color: '#ffd6a0', intensity: 2.2, hemi: { sky: '#c8cce0', ground: '#5a5030', intensity: 1.0 }, shadowSize: 60 },

  ground: {
    size: 1400, segments: 280, flatRadius: 55, hillHeight: 46, undulation: 0.6,
    plaza: { center: [999, 999], size: [1, 1] },
    colors: { sand: '#6f9044', dirt: '#68863f', grass: '#6f8c46', grassDark: '#55703a', plaza: '#7f8e4e', plazaLine: '#7f8e4e', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#4f6e42' },
  },

  mountains: { count: 26, distance: [450, 700], height: [60, 130], widthRatio: [2.2, 3.4], colors: ['#5d6e7a', '#6a7a86', '#566a70'] },

  objects: [
    { type: 'stones', count: 160, ring: [3, 40], size: [0.15, 0.5], colors: ['#8a8070', '#9a907a', '#7a705e'] },
  ],

  custom(ctx) {
    const y = ctx.terrainHeight(40, 0) - 0.2;
    river(ctx, { points: [[42, -400], [36, -150], [44, -40], [38, 60], [46, 200], [40, 400]], width: 40, y, color: '#5e7f9c', light: '#d8c8a8', bank: '#6e6448' });
    ctx.exclude({ kind: 'rect', x: 42, z: 0, hx: 26, hz: 420 });
    ctx.exclude({ kind: 'circle', x: MEET[0], z: MEET[1] + 6, r: 12 });
    ctx.builders.trees({ count: 190, ring: [14, 160], height: [7, 13], broken: 0, fallen: 0.05, trunkColor: '#4e3a28', leafColors: ['#4f7f3e', '#5f8f46', '#3e6e3a', '#6f9a4a', '#7a8a3a'] }, ctx);
    pines(ctx, { count: 120, ring: [22, 150], height: [10, 18], seed: 3, avoid: (x) => x > 18 && x < 66 });

    periodPerson(ctx, { pos: [-0.8, MEET[1] + 3.2], face: MEET, pose: 'kneel', colors: { body: '#2e3440', skin: '#e3b894', hair: '#7a5530' } });
    periodPerson(ctx, { pos: [0.9, MEET[1] + 3.2], face: MEET, pose: 'kneel', colors: { body: '#4a3b2e', skin: '#e8c3a0', hair: '#3a2418' } });

    const gy = ctx.groundHeight(...MEET);
    heavenly(ctx, { pos: MEET, y: gy + 0.4, face: [0, 10], scale: 1.12, arms: [0.3, 1.25], halo: 4.5, light: 5 });
    heavenly(ctx, { pos: [-1.7, MEET[1] - 0.6], y: gy + 0.4, face: [0, 10], scale: 1.08, arms: [0.3, 0.25], halo: 4, light: 0 });
    heavenly(ctx, { pos: [1.7, MEET[1] - 0.6], y: gy + 0.4, face: [0, 10], scale: 1.08, arms: [0.3, 0.25], halo: 4, light: 0 });
    glowSprite(ctx, [MEET[0], gy + 2.2, MEET[1] - 0.3], 9, '#fff3d0', 0.4);

    trackAvatar(ctx, { hat: true });
  },

  clouds: {
    layers: [
      { count: 40, distance: [320, 700], height: [70, 170], size: [40, 90], color: '#ffd9b0', shade: '#5a4a6a' },
      { count: 10, center: MEET, distance: [10, 40], height: [70, 95], size: [14, 26], color: '#fff6e4', shade: '#8a7a7a', drift: 0.003 },
    ],
  },

  player: {
    start: [1.5, 1],
    lookAt: MEET,
    colors: { robe: '#3a3530', mantle: '#3a3530', skin: '#e0b48e', hair: '#4a3020' },
  },
};
