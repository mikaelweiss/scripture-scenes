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
const LAMANITE_LIT = {
  robes: ['#a0522d', '#b5623b', '#8c4a2c', '#c8784a', '#7a3b26'],
  mantles: ['#c8912e', '#e0b060', '#a64b35', '#8c6a3c'],
  skins: ['#7a4e33', '#8a5a3b', '#9c6a45'],
  hair: ['#2b1a12', '#3a2418'],
  wraps: ['#b5523b', '#c8912e'],
};
const KNOLL = [-50, -32];

export default {
  title: 'Alma 56-57: The two thousand stripling warriors',
  subtitle: 'They fought as if with the strength of God, and not one was lost',
  seed: 56,

  style: baseStyle({ fog: { color: '#ead3a6', near: 140, far: 900 }, lines: { width: 1.4, depth: 0.08, normal: 0.35, fade: [30, 160, 140, 0.25] } }),

  sky: { zenith: '#3a6f8a', mid: '#86b0b8', horizon: '#f0d6a2', ground: '#d9b98a', glowColor: '#fff0c8', glowDir: [0.4, 0.45, -1] },

  sun: { dir: [-0.5, 0.85, 0.2], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#e2f0e6', ground: '#c08a5e', intensity: 1.3 }, shadowSize: 90 },

  ground: groundSpec({ hillHeight: 40, flatRadius: 180, undulation: 0.25 }),

  mountains: { count: 32, distance: [520, 820], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 80, ring: [120, 260], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 300, ring: [5, 120], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#a58a66'] },
  ],

  custom(ctx) {
    // The player's knoll on the western flank, between the two lines.
    knoll(ctx, KNOLL[0], KNOLL[1], { r: 11, top: 4.5, h: 4.5 });
    ctx.exclude({ kind: 'circle', x: KNOLL[0], z: KNOLL[1], r: 12 });

    // Helaman's sons: eight companies of five ranks, fifty abreast, facing north.
    let n = 1;
    n += army(ctx, { spears: 0.12, shaftColor: '#c8a878', center: [0, 7], rows: 40, cols: 50, spacing: 1.25, rankGroup: 5, rankGap: 1.8, yaw: Math.PI, seed: 2, colors: STRIPLINGS, scale: [0.86, 0.96], crest: true, crestColors: ['#efe3c2', '#ffffff'], helmColors: ['#d8b070', '#e6c27a', '#c8a060'], shields: ['#3e8e86', '#2f8f8a', '#efe3c2'], jitter: 0.12, jitterYaw: 0.1 });

    // The Lamanite rear, turned south to meet them.
    n += army(ctx, { spears: 0.15, shaftColor: '#8c6a48', center: [0, -39], size: [64, 7], count: 380, minSpacing: 1.3, yaw: 0, seed: 4, colors: LAMANITE_LIT, helmets: false, shields: ['#8c4a2c', '#c8912e', '#a64b35'], jitterYaw: 0.5 });
    // Its main body, still facing Antipus in the north.
    n += army(ctx, { spears: 0.15, shaftColor: '#8c6a48', center: [0, -54], size: [72, 16], count: 900, minSpacing: 1.3, yaw: Math.PI, seed: 3, colors: LAMANITE_LIT, helmets: false, shields: ['#8c4a2c', '#c8912e', '#a64b35'], jitterYaw: 0.6 });

    // Antipus's weary army pressing from the north.
    n += army(ctx, { spears: 0.2, center: [0, -78], rows: 8, cols: 60, spacing: 1.25, rankGroup: 4, rankGap: 1.5, yaw: 0, seed: 5, colors: NEPHITE, crest: true, shields: ['#b5523b', '#c8912e'], jitterYaw: 0.3 });

    // Helaman before his young men.
    const h = figure(ctx, { robe: '#efe3c2', mantle: '#3e6e66', skin: '#a8724a', hair: '#d9c7a3', sash: '#c8912e', arms: [0.35, 0.9] }, -27, -27, { yaw: Math.PI - 0.4, scale: 1.3 });
    arm(h, ctx, { shield: '#efe3c2', rim: '#3e6e66', banner: '#3e6e66' });

    for (const x of [-24, -8, 8, 24]) banner(ctx, x, -26, { h: 6.5, color: '#3e8e86', trim: '#efe3c2', rot: Math.PI / 2, w: 1.8, fh: 1.3 });
    for (const x of [-26, 0, 26]) banner(ctx, x, -83, { h: 6, color: '#b5523b', trim: '#efe3c2', rot: Math.PI / 2 });
    for (const x of [-22, 10]) banner(ctx, x, -62, { h: 5.5, color: '#8c4a2c', trim: '#c8912e', rot: Math.PI / 2 });

    // Dust where the lines meet.
    const dust = { radius: 10, count: 7, size: [2.5, 5], rise: 4, color: '#f0dcb4', shade: '#8a7458', speed: 0.03, wind: [6, 1], fx: true, opacity: 0.28 };
    puffs(ctx, [
      { ...dust, pos: [-18, -31] }, { ...dust, pos: [14, -32] },
      { ...dust, pos: [-20, -70] }, { ...dust, pos: [18, -70] },
    ]);
    peopleCount(ctx, this.subtitle, n);
  },

  player: {
    start: [-50, -30],
    lookAt: [0, -36],
    colors: { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#efe3c2' },
  },
};
