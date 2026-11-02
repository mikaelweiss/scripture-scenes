// Alma 56-57: Helaman's two thousand young warriors fall upon the rear of the Lamanite army
// while Antipus's weary army fights it from the north. Not one of the young men is lost.
// x is east, z is south. The player watches from a knoll to the southwest.
import { army, arm, banner, baseStyle, figure, groundSpec, knoll, LAMANITE, NEPHITE, peopleCount, puffs } from './lib/bom-31-kit.js';

const STRIPLINGS = {
  robes: ['#e6d8b8', '#d9c7a3', '#efe3c2', '#e3cfa6'],
  mantles: ['#3e6e66', '#4f7f80', '#2f8f8a'],
  skins: ['#9c6a45', '#a87650', '#b5825a', '#c08f66'],
  hair: ['#2b1a12', '#3a2418'],
  wraps: ['#3e6e66'],
};
const KNOLL = [-56, 8];

export default {
  title: 'Alma 56-57: The two thousand stripling warriors',
  subtitle: 'They fought as if with the strength of God, and not one was lost',
  seed: 56,

  style: baseStyle({ fog: { color: '#ead3a6', near: 110, far: 900 }, lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [40, 220, 180, 0.35] } }),

  sky: { zenith: '#3a6f8a', mid: '#86b0b8', horizon: '#f0d6a2', ground: '#d9b98a', glowColor: '#fff0c8', glowDir: [-0.4, 0.45, -1] },

  sun: { dir: [-0.45, 0.8, 0.45], color: '#fff0d6', intensity: 2.5, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 }, shadowSize: 90 },

  ground: groundSpec({ hillHeight: 40, flatRadius: 180, undulation: 0.25 }),

  mountains: { count: 32, distance: [520, 820], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 80, ring: [120, 260], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 300, ring: [5, 120], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#a58a66'] },
  ],

  custom(ctx) {
    knoll(ctx, KNOLL[0], KNOLL[1], { r: 12, top: 5, h: 3.2 });

    // Helaman's sons: twenty-five ranks of eighty, shields and spears, marching north.
    let n = 2;
    n += army(ctx, { spears: 0.3, shaftColor: '#9a7a52', center: [0, -12], rows: 25, cols: 80, spacing: 1.0, yaw: Math.PI, seed: 2, colors: STRIPLINGS, scale: [0.84, 0.95], crest: true, crestColors: ['#efe3c2'], helmColors: ['#c8a060', '#d8b070'], shields: ['#3e6e66', '#2f8f8a', '#efe3c2'], jitter: 0.15, jitterYaw: 0.12 });

    // The Lamanite army, its rear turning to meet them.
    n += army(ctx, { spears: 0.3, center: [0, -62], size: [110, 24], count: 1100, minSpacing: 1.1, yaw: Math.PI, seed: 3, colors: LAMANITE, helmets: false, shields: ['#8c4a2c', '#5e3020', '#c8912e'], jitterYaw: 0.6 });
    n += army(ctx, { spears: 0.3, center: [0, -45], size: [100, 10], count: 450, minSpacing: 1.1, yaw: 0, seed: 4, colors: LAMANITE, helmets: false, shields: ['#8c4a2c', '#5e3020', '#c8912e'], jitterYaw: 0.7 });

    // Antipus's army pressing from the north.
    n += army(ctx, { spears: 0.3, center: [0, -92], rows: 12, cols: 70, spacing: 1.15, yaw: 0, seed: 5, colors: NEPHITE, crest: true, shields: ['#b5523b', '#c8912e'], jitterYaw: 0.3 });

    // Helaman before his young men.
    const h = figure(ctx, { robe: '#efe3c2', mantle: '#3e6e66', skin: '#a8724a', hair: '#d9c7a3', sash: '#c8912e', arms: [0.35, 0.9] }, 0, -28, { yaw: Math.PI, scale: 1.12 });
    arm(h, ctx, { shield: '#efe3c2', rim: '#3e6e66', banner: '#3e6e66' });

    for (const x of [-30, -10, 10, 30]) banner(ctx, x, -24.5, { h: 6, color: '#3e6e66', trim: '#efe3c2' });
    for (const x of [-45, -15, 20, 48]) banner(ctx, x, -100, { h: 6, color: '#b5523b', trim: '#efe3c2' });
    for (const x of [-40, -5, 35]) banner(ctx, x, -70, { h: 5.5, color: '#5e3020', trim: '#c8912e' });

    // Dust of battle where the lines meet.
    const dust = { radius: 14, count: 10, size: [3, 6], rise: 5, color: '#e8d2a6', shade: '#6a5440', speed: 0.03, wind: [6, 1], fx: true, opacity: 0.35 };
    puffs(ctx, [
      { ...dust, pos: [-45, -36] }, { ...dust, pos: [-15, -34] }, { ...dust, pos: [20, -36] }, { ...dust, pos: [50, -38] },
      { ...dust, pos: [-40, -78] }, { ...dust, pos: [0, -80] }, { ...dust, pos: [40, -78] },
    ]);
    peopleCount(ctx, this.subtitle, n);

    // The player's knoll top, kept clear of figures.
    ctx.exclude({ kind: 'circle', x: KNOLL[0], z: KNOLL[1], r: 13 });
  },

  player: {
    start: [-55, 9],
    lookAt: [0, -40],
    colors: { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#efe3c2' },
  },
};
