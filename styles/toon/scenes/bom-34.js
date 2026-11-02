// Alma 63:5-8: Hagoth builds exceedingly large ships by the west sea near the narrow neck.
// Families board with provisions and the ships launch forth northward.
// x is east, z is south. The sea lies west of x = -20, the land northward far across it.
import { baseStyle, box, cyl, figure, groundSpec, hills, house, jars, merge, NEPHITE, put, sea, ship, trees } from './lib/bom-31-kit.js';

const SHORE = -20;
const LEVEL = 0.25;
const PIER_Z = -6;

export default {
  title: "Alma 63:5-8: Hagoth's ships",
  subtitle: 'The shipyard on the west sea, by the narrow neck',
  seed: 63,

  style: baseStyle({ fog: { color: '#f0d9ae', near: 160, far: 1300 } }),

  sky: { zenith: '#2f6f8c', mid: '#7fb0c0', horizon: '#f6dcaa', ground: '#d9b98a', glowColor: '#fbe6b8', glowDir: [1, -0.3, 0] },

  sun: { dir: [-0.6, 0.65, 0.3], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 }, shadowSize: 80 },

  ground: groundSpec({
    hillHeight: 0, flatRadius: 700, undulation: 0.15,
    colors: { sand: '#e0c48c', dirt: '#c9a46e', grass: '#8e9a58', grassDark: '#6c7a42' },
  }),

  objects: [
    { type: 'trees', count: 60, ring: [60, 220], angle: [0.35, 2.8], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 150, ring: [5, 70], angle: [0.3, 2.9], size: [0.12, 0.35], colors: ['#cdb48a', '#b89a70'] },
  ],

  custom(ctx) {
    sea(ctx, { edge: SHORE, side: -1, axis: 'x', level: LEVEL, color: '#2f8f9a', deep: '#bfe2dc', foam: '#f6f0dc', waves: 120 });
    hills(ctx, { angle: [0.25 * Math.PI, 0.8 * Math.PI], colors: ['#6f9a8a', '#7da08a', '#86a38f'] });
    hills(ctx, { count: 10, angle: [-0.25 * Math.PI, 0.05 * Math.PI], distance: [700, 950], height: [40, 90], colors: ['#8fae9e', '#9ab8a8'], seed: 4 });

    // Two hulls on the slipways: one in its ribs, one planked and nearly ready.
    for (const [z, ribs] of [[16, true], [30, false]]) {
      const y = ctx.terrainHeight(-4, z) + 0.7;
      ship(ctx, { x: -4, z, y, rot: Math.PI, len: 22, beam: 6, depth: 2.8, ribsOnly: ribs, mast: false, hull: ribs ? '#9a7048' : '#7a5232' });
      const cradle = [];
      for (let i = -3; i <= 3; i++) cradle.push(box(0.5, 0.9, 5, i * 3, 0.45, 0));
      cradle.push(box(28, 0.25, 0.4, -3, 0.12, -1.5), box(28, 0.25, 0.4, -3, 0.12, 1.5));
      put(ctx, merge(cradle), '#5e4632', -4, z, { y: y - 0.9 });
      for (const s of [-1, 1]) for (let i = -2; i <= 2; i++) put(ctx, cyl(0.12, 0.14, 4.2, i * 4, 2.1, s * 4.6, 6, { rx: s * 0.45 }), '#6b4a33', -4, z, { y: y - 0.9 });
    }

    // The pier, with a laden ship moored alongside.
    const deckY = LEVEL + 0.9;
    const planks = [], posts = [];
    for (let x = SHORE + 3; x > SHORE - 22; x -= 1.0) planks.push(box(0.9, 0.18, 4, x, deckY - 0.09, PIER_Z));
    for (let x = SHORE + 2; x > SHORE - 22; x -= 4) for (const s of [-1, 1]) posts.push(cyl(0.16, 0.16, 3, x, deckY - 1.4, PIER_Z + s * 2, 6));
    put(ctx, merge(planks), '#a87b4f', 0, 0, { y: 0 });
    put(ctx, merge(posts), '#5e4632', 0, 0, { y: 0 });
    ctx.addCollider({ x: SHORE - 9.5, z: PIER_Z, hx: 12.5, hz: 2, rot: 0, top: deckY, walkable: true });
    ctx.addCollider({ x: SHORE + 2, z: PIER_Z, hx: 1.2, hz: 2, rot: 0, top: deckY * 0.5, walkable: true });
    const moored = ship(ctx, { x: SHORE - 12, z: PIER_Z - 5.6, y: LEVEL - 1.1, rot: Math.PI, len: 24, beam: 6.4, depth: 3 });
    const gang = box(1.2, 0.12, 3.2, 0, 0, 0, { rx: -0.25 });
    put(ctx, gang, '#9a7048', SHORE - 10, PIER_Z - 3, { y: deckY + 0.4 });

    // Ships already standing out to sea, sailing north.
    const away = [
      ship(ctx, { x: -70, z: -30, y: LEVEL - 1.2, rot: Math.PI / 2 + 0.08, len: 24, beam: 6.4, depth: 3, collide: false }),
      ship(ctx, { x: -120, z: -150, y: LEVEL - 1.2, rot: Math.PI / 2 + 0.05, len: 24, beam: 6.4, depth: 3, collide: false, sail: '#e8dcc0' }),
      ship(ctx, { x: -60, z: -260, y: LEVEL - 1.2, rot: Math.PI / 2 - 0.05, len: 24, beam: 6.4, depth: 3, collide: false, sail: '#efe3c2' }),
    ];
    const z0 = away.map((s) => s.position.z);
    ctx.onFrame((t) => {
      away.forEach((s, i) => {
        s.position.z = z0[i] - t * 1.2;
        s.position.y = LEVEL - 1.2 + Math.sin(t * 1.1 + i) * 0.12;
        s.rotation.x = Math.sin(t * 0.9 + i * 2) * 0.03;
      });
      moored.position.y = LEVEL - 1.1 + Math.sin(t * 1.3) * 0.06;
      moored.rotation.x = Math.sin(t * 1.1) * 0.015;
    });

    // Provisions on the beach waiting to be carried aboard.
    jars(ctx, SHORE + 7, PIER_Z - 3, 10, { seed: 2 });
    jars(ctx, SHORE + 9, PIER_Z + 3.5, 8, { seed: 5 });
    jars(ctx, SHORE + 5, PIER_Z + 6, 6, { seed: 8 });

    // Timber piles and a work shed.
    const logs = [];
    for (let i = 0; i < 12; i++) logs.push(cyl(0.3, 0.3, 9, 0, 0.3 + Math.floor(i / 4) * 0.55, (i % 4) * 0.65 + (Math.floor(i / 4) % 2) * 0.3, 7, { rz: Math.PI / 2 }));
    put(ctx, merge(logs), '#8a6a48', 26, 8, { rot: 0.3 });
    ctx.addCollider({ x: 26, z: 9, hx: 4.8, hz: 1.8, rot: 0.3, top: ctx.terrainHeight(26, 9) + 1.8 });
    const shed = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) shed.push(cyl(0.15, 0.15, 3.6, sx * 4, 1.8, sz * 3, 6));
    shed.push(box(9.6, 0.25, 7.6, 0, 3.7, 0, { rz: 0.08 }));
    put(ctx, merge(shed), '#6b4a33', 18, 22);
    put(ctx, box(9.6, 0.25, 7.6, 0, 3.75, 0, { rz: 0.08 }), '#c8a97a', 18, 22);

    // Hagoth, overseeing the launch.
    figure(ctx, { robe: '#efe3c2', mantle: '#2f8f8a', skin: '#a8724a', hair: '#d9c7a3', sash: '#c8912e', arms: [0.45, 1.6] }, SHORE + 18.5, PIER_Z - 4, { face: [SHORE - 30, PIER_Z - 6], scale: 1.25, clear: 2.5 });

    // The shipbuilders' village inland.
    const homes = [[30, -30, 0.3], [42, -12, -0.2], [36, 12, 0.5], [50, 30, 0.1], [26, -50, -0.4], [58, -36, 0.2]];
    homes.forEach(([x, z, rot], i) => house(ctx, x, z, { rot: rot - Math.PI / 2, w: 6, d: 5, h: 3, color: ['#e3cfa6', '#d6bf95'][i % 2], roof: ['#a87b4f', '#c8912e'][i % 2] }));
    trees(ctx, [[22, -18, 6], [30, 32, 7], [48, 0, 6], [12, -36, 6]]);
  },

  crowd: {
    seed: 34,
    minSpacing: 0.8,
    facing: [SHORE - 12, PIER_Z],
    colors: NEPHITE,
    aisles: [{ from: [SHORE + 16, PIER_Z], to: [SHORE - 1, PIER_Z], width: 3.2 }],
    keepClear: [{ kind: 'circle', x: 9, z: -6, r: 7 }],
    groups: [
      { shape: 'rect', center: [SHORE + 9, PIER_Z + 1], size: [10, 16], count: 90, children: 0.25, facingJitter: 0.6 },
      { shape: 'rect', center: [-4, 23], size: [26, 4], count: 30, kneel: 0.2, facingJitter: 2.5, facing: [-4, 16] },
      { shape: 'rect', center: [-4, 37.5], size: [26, 4], count: 26, kneel: 0.2, facingJitter: 2.5, facing: [-4, 30] },
      { shape: 'rect', center: [-4, 9.5], size: [26, 3], count: 20, kneel: 0.3, facingJitter: 2.5, facing: [-4, 16] },
      { shape: 'rect', center: [30, -5], size: [30, 50], count: 50, children: 0.2, facingJitter: 3 },
    ],
  },

  player: {
    start: [5, -5],
    lookAt: [-34, 2],
    colors: { robe: '#c8a97a', mantle: '#4f7f80', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
