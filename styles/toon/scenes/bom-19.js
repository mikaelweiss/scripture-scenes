// Mosiah 22: Limhi's people slip out the back pass of the city at night while the drunken guards sleep.
// x is east, z is south. The city lies south, the pass opens north between two ridges.
import { LAMANITES, NEPHITES, NO_PLAZA, figure, fires, flock, huts, jars, moon, rocks, rods, road, stars, toonStyle } from './lib/bom-19-kit.js';

const PATH = [[0, 34], [0, 14], [-2, -10], [-8, -40], [-10, -70], [-6, -110]];
const PASS = [-6, -120];
const START = [18, 6];

const column = [];
for (let i = 0; i < 26; i++) {
  const t = i / 25;
  const k = Math.min(PATH.length - 2, Math.floor(t * (PATH.length - 1)));
  const f = t * (PATH.length - 1) - k;
  const [ax, az] = PATH[k], [bx, bz] = PATH[k + 1];
  column.push([ax + (bx - ax) * f, az + (bz - az) * f]);
}

const GUARDS = [
  { fire: [13, 2], sleepers: [[10.5, 3.2, 0.4], [14.8, 4.6, 2.2], [15.6, 0.4, 3.9], [11.4, -0.6, 5.1]] },
  { fire: [-15, 5], sleepers: [[-12.8, 6.6, 1.1], [-17.4, 6.8, 2.6], [-16.6, 2.2, 4.4], [-13, 2.4, 5.6]] },
  { fire: [26, -14], sleepers: [[24, -12.5, 0.8], [28.2, -12.2, 2.5], [27, -16.6, 4.2]] },
];

export default {
  title: "Mosiah 22:7-11: Limhi's people escape",
  subtitle: 'The back pass of the city of Lehi-Nephi, by night',
  seed: 22,

  style: toonStyle({ fog: '#1c2546', near: 50, far: 420, ink: '#0e0c18' }),

  sky: { zenith: '#070b1e', mid: '#16214a', horizon: '#34407a', ground: '#141a30', glowColor: '#8a9ad8', glowDir: [-0.4, 0.22, -0.8] },

  sun: {
    dir: [-0.4, 0.75, -0.6],
    color: '#a9bcf0',
    intensity: 1.5,
    hemi: { sky: '#4a5f9a', ground: '#231f30', intensity: 0.9 },
    shadowSize: 60,
  },

  ground: {
    size: 1200,
    segments: 240,
    flatRadius: 90,
    hillHeight: 40,
    undulation: 0.3,
    plaza: NO_PLAZA,
    colors: {
      sand: '#5a5a74', dirt: '#4e4a62', grass: '#3e5560', grassDark: '#2e4250', plaza: '#5a5a74', plazaLine: '#5a5a74',
      scorch: '#1a1620', scorchEdge: '#2a2430', hill: '#34485a',
    },
  },

  mountains: { count: 30, distance: [380, 640], height: [60, 150], widthRatio: [1.4, 2.4], colors: ['#25305a', '#2c3866', '#1f2a50', '#323f70'] },

  objects: [
    { type: 'wall', from: [-80, 22], to: [-4.5, 22], height: 4.2, damage: 0, thickness: 1.2, color: '#8a7e8e', seed: 3 },
    { type: 'wall', from: [4.5, 22], to: [80, 22], height: 4.2, damage: 0, thickness: 1.2, color: '#8a7e8e', seed: 4 },
    { type: 'trees', count: 70, ring: [40, 160], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#2e2430', leafColors: ['#24404a', '#2c4a50', '#1e3640', '#32505a'] },
    { type: 'stones', count: 300, ring: [4, 70], size: [0.12, 0.4], colors: ['#5e5a70', '#4a4658', '#6a6478'] },
  ],

  custom(ctx) {
    stars(ctx);
    moon(ctx, { dir: [-0.45, 0.22, -0.8] });
    road(ctx, PATH, { width: 5, color: '#6a6276' });

    rocks(ctx, [
      { pos: [-30, -95], size: [18, 26, 30], rot: 0.2 },
      { pos: [-34, -60], size: [14, 16, 18], rot: -0.3 },
      { pos: [-46, -128], size: [22, 34, 28], rot: 0.5 },
      { pos: [20, -98], size: [17, 24, 30], rot: -0.2 },
      { pos: [18, -62], size: [12, 13, 16], rot: 0.4 },
      { pos: [34, -130], size: [24, 36, 28], rot: -0.4 },
      { pos: [-12, -150], size: [30, 40, 20], rot: 0.1 },
      { pos: [-3, -48], size: [1.6, 1.2, 1.4], collide: false },
      { pos: [8, -30], size: [2, 1.5, 1.8] },
      { pos: [-14, -24], size: [1.8, 1.2, 1.6] },
    ], ['#3a4058', '#424862', '#33384e']);

    const houses = [];
    for (let i = 0; i < 26; i++) {
      const x = -66 + (i % 9) * 16 + ((i * 7) % 5);
      const z = 34 + Math.floor(i / 9) * 14 + ((i * 3) % 4);
      if (Math.abs(x) < 9) continue;
      houses.push({ pos: [x, z], size: [6 + (i % 3), 5], rot: ((i * 0.37) % 0.4) - 0.2, height: 2.8 });
    }
    huts(ctx, houses, { wall: '#7a6e80', roof: '#4a3e48', door: '#ffb05a' });

    rods(ctx, [
      { from: [-4.5, 0, 22], to: [-4.5, 6.5, 22], radius: 0.5, ground: true },
      { from: [4.5, 0, 22], to: [4.5, 6.5, 22], radius: 0.5, ground: true },
      { from: [-5, 6.3, 22], to: [5, 6.3, 22], radius: 0.4, ground: true },
    ], '#4a3a3a');

    fires(ctx, GUARDS.map((g, i) => ({ pos: g.fire, size: 0.9, low: true, light: i < 2 ? 10 : 0, lightDistance: 12 })));

    const spears = [];
    const jarList = [];
    GUARDS.forEach((g, gi) => {
      g.sleepers.forEach(([x, z, yaw], i) => {
        figure(ctx, { pos: [x, z], yaw, pose: i % 3 === 1 ? 'prone' : 'lie', roll: (i % 2 ? 0.3 : -0.25), clear: 1.2,
          colors: { robe: LAMANITES.robes[(gi * 3 + i) % LAMANITES.robes.length], mantle: LAMANITES.mantles[(i + gi) % 5], skin: LAMANITES.skins[i % 4], hair: '#1f140e', sash: '#c8912e' } });
        const sx = x + Math.cos(yaw) * 0.9, sz = z - Math.sin(yaw) * 0.9;
        spears.push({ from: [sx - Math.sin(yaw) * 1.3, 0.08, sz - Math.cos(yaw) * 1.3], to: [sx + Math.sin(yaw) * 1.3, 0.08, sz + Math.cos(yaw) * 1.3], ground: true });
        jarList.push({ pos: [x - Math.cos(yaw) * 0.9, z + Math.sin(yaw) * 0.9], tipped: i % 2 === 0, rot: yaw + i, scale: 0.8 });
      });
      const [fx, fz] = g.fire;
      jarList.push({ pos: [fx + 1.6, fz - 1.4], scale: 1.4 }, { pos: [fx + 2.3, fz - 1.0], scale: 1.2 }, { pos: [fx - 1.8, fz - 1.6], tipped: true, rot: 2, scale: 1.3 });
    });
    rods(ctx, spears, '#3a2a22', 0.03);
    jars(ctx, jarList, '#9a4a35');

    figure(ctx, { pos: [3.2, 4], facing: [-6, -60], pose: 'raise', colors: { robe: '#6f8a6a', mantle: '#3e6e66', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e', arms: [0.4, 0.9] } });
    figure(ctx, { pos: [-3.5, 26], facing: [0, 0], colors: { robe: '#d9c7a3', mantle: '#8c3b2a', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' } });

    flock(ctx, { center: [3, -18], rect: [9, 20], count: 50, seed: 3, facing: PASS, jitter: 0.6, graze: 0.1 });
    flock(ctx, { center: [-9, -52], rect: [8, 18], count: 40, seed: 4, facing: PASS, jitter: 0.6, graze: 0.1 });
    flock(ctx, { center: [-4, 2], rect: [6, 8], count: 10, seed: 6, kind: 'cattle', facing: PASS, jitter: 0.4, graze: 0 });
  },

  crowd: {
    seed: 19,
    minSpacing: 0.7,
    facing: PASS,
    colors: NEPHITES,
    groups: [
      ...column.map((c, i) => ({ center: c, radius: [0, 3.2], count: i < 4 ? 22 : 14, children: 0.15, facingJitter: 0.4, lean: 0.12 })),
      { center: [0, 40], radius: [0, 10], count: 120, children: 0.2, facing: [0, 14] },
    ],
  },

  player: {
    start: START,
    lookAt: [-6, -40],
    colors: { robe: '#4f7f80', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
