// Mosiah 24: the Lord puts the Lamanite guards into a deep sleep and Alma's people leave Helam at dawn.
// x is east, z is south. The sun rises in the east, where the column is heading.
import { LAMANITES, NEPHITES, NO_PLAZA, alongPath, field, figure, fires, flock, huts, jars, rods, road, toonStyle } from './lib/bom-19-kit.js';

const PATH = [[-34, 4], [-10, 2], [14, -2], [40, -6], [70, -4], [110, -10], [160, -14]];
const EAST = [200, -14];

const GUARDS = [
  [-6, 14, 0.4], [-2.5, 15.5, 2.1], [4, 12, 4.8], [9, 14.5, 1.2], [-14, 13, 4.1],
  [2, -12, 3.1], [-6, -13, 0.9], [12, -11, 4.2], [24, 9, 2.6], [27, 12, 5.1], [-22, -14, 1.7], [30, -15, 3.6],
];
const POSTS = [[-4, 17.5], [8, 16.5], [3, -15], [26, 14], [-20, -16]];

export default {
  title: "Mosiah 24:13-25: Alma's people made free",
  subtitle: 'The land of Helam at dawn, the guards in a deep sleep',
  seed: 24,

  style: toonStyle({ fog: '#e9c3a8', near: 90, far: 700 }),

  sky: { zenith: '#41618f', mid: '#c99aa0', horizon: '#ffcf8f', ground: '#b48a78', glowColor: '#fff2be', glowDir: [1, 0.08, -0.05] },

  sun: {
    dir: [0.92, 0.3, -0.05],
    color: '#ffd2a0',
    intensity: 2.3,
    hemi: { sky: '#c4c6e2', ground: '#8a5e4a', intensity: 1.05 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 120,
    hillHeight: 36,
    undulation: 0.35,
    plaza: NO_PLAZA,
    colors: {
      sand: '#c9a27a', dirt: '#b08460', grass: '#8a9a62', grassDark: '#6a7a4a', plaza: '#c9a27a', plazaLine: '#c9a27a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f8f6a',
    },
  },

  mountains: { count: 32, distance: [480, 760], height: [60, 160], widthRatio: [1.4, 2.4], colors: ['#8f7a96', '#a08aa0', '#7f7090', '#b09aa6'] },

  objects: [
    { type: 'trees', count: 90, ring: [55, 220], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#4f8a5a', '#5f9a64', '#3e7a54', '#6f9a5a'] },
    { type: 'stones', count: 400, ring: [5, 90], size: [0.12, 0.4], colors: ['#b89a70', '#a58a66', '#c9ae86'] },
  ],

  custom(ctx) {
    road(ctx, PATH, { width: 6, color: '#d6b48a' });

    huts(ctx, [
      { pos: [-30, -20], size: [6, 5], rot: 0.1 }, { pos: [-40, -8], size: [5, 5], rot: -0.2 }, { pos: [-46, 14], size: [6, 4], rot: 0.3 },
      { pos: [-30, 24], size: [6, 5], rot: -0.1 }, { pos: [-16, 30], size: [5, 4], rot: 0.2 }, { pos: [-18, -30], size: [6, 5], rot: -0.3 },
      { pos: [-54, -2], size: [7, 5], rot: 0 }, { pos: [-58, 24], size: [5, 5], rot: 0.4 }, { pos: [-52, -26], size: [6, 4], rot: -0.1 },
      { pos: [-4, 34], size: [5, 4], rot: 0.1 }, { pos: [-36, 36], size: [6, 5], rot: 0.2 },
    ], { wall: '#d8bf96', roof: '#9a7a46' });

    field(ctx, { center: [14, -32], size: [30, 16], rot: 0.05 });
    field(ctx, { center: [44, -30], size: [22, 14], rot: -0.08, color: '#cfa84a' });
    field(ctx, { center: [24, 30], size: [26, 14], rot: 0.1, color: '#d8b85a' });

    GUARDS.forEach(([x, z, yaw], i) => {
      figure(ctx, { pos: [x, z], yaw, pose: i % 4 === 2 ? 'prone' : 'lie', arms: i % 2 ? 'reach' : 'side', roll: i % 2 ? 0.25 : -0.3, clear: 1.3,
        colors: { robe: LAMANITES.robes[i % 6], mantle: LAMANITES.mantles[i % 5], skin: LAMANITES.skins[i % 4], hair: '#1f140e', sash: '#c8912e' } });
    });
    rods(ctx, GUARDS.map(([x, z, yaw]) => {
      const sx = x + Math.cos(yaw) * 0.9, sz = z - Math.sin(yaw) * 0.9;
      return { from: [sx - Math.sin(yaw) * 1.3, 0.08, sz - Math.cos(yaw) * 1.3], to: [sx + Math.sin(yaw) * 1.3, 0.08, sz + Math.cos(yaw) * 1.3], ground: true };
    }), '#4a3022', 0.03);
    rods(ctx, POSTS.map(([x, z]) => ({ from: [x, 0, z], to: [x, 3.2, z], radius: 0.18, ground: true })), '#6b4a33');
    fires(ctx, [{ pos: [1, 15], size: 0.8, out: true }, { pos: [6, -13], size: 0.8, out: true }, { pos: [26, -12], size: 0.7, out: true }]);
    jars(ctx, [{ pos: [-0.5, 17] }, { pos: [8, -15], tipped: true, rot: 1 }], '#a85a3e');

    figure(ctx, { pos: [62, -5], facing: EAST, pose: 'raise', scale: 1.04, colors: { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#a87650', hair: '#d9d0c0', sash: '#c8912e', arms: [0.45, 1.6] } });

    const carriers = alongPath(PATH.slice(1, 5), 14, 2.4, 9);
    rods(ctx, carriers.map((p) => ({ from: [p.x + 0.25, 0, p.z], to: [p.x + 0.25 + p.dir[0] * 0.3, 1.9, p.z + p.dir[1] * 0.3], ground: true })), '#7a5a3a', 0.03);

    flock(ctx, { center: [30, -8], rect: [24, 6], count: 60, seed: 3, facing: EAST, jitter: 0.5, graze: 0.1 });
    flock(ctx, { center: [86, -8], rect: [24, 6], count: 45, seed: 5, facing: EAST, jitter: 0.5, graze: 0.1 });
    flock(ctx, { center: [6, 3], rect: [10, 5], count: 12, seed: 8, kind: 'cattle', facing: EAST, jitter: 0.3, graze: 0 });
  },

  crowd: {
    seed: 20,
    minSpacing: 0.7,
    facing: EAST,
    colors: NEPHITES,
    groups: [
      ...alongPath(PATH, 30, 0, 4).map((p) => ({ center: [p.x, p.z], radius: [0, 3.6], count: 16, children: 0.2, facingJitter: 0.35, lean: 0.1 })),
      { center: [-26, 4], radius: [2, 9], count: 70, children: 0.2 },
    ],
  },

  player: {
    start: [-13, 20.5],
    lookAt: [40, -9],
    fov: 50,
    colors: { robe: '#b5523b', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
