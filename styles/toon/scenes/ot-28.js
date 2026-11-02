// 1 Samuel 3: the child Samuel lies down in the house of the Lord at Shiloh, the lamp of God not yet gone out.
// x is east, z is south. The tabernacle opens south onto its court. Eli sleeps in his chamber to the east.
import * as THREE from 'three';
import { NO_PLAZA, boxes, campfires, figure, flames, glowSprite, houses, merged, moon, olives, pointLight, shaft, stars, toonStyle } from './lib/ot-25-kit.js';
import { makeRng } from '../engine/util.js';

const TENT = { x: [-5.5, 5.5], z: [-15, 4], h: 5.6 };
const VEIL_Z = -9.5;
const LAMP = [-3.3, -4.5];
const SAMUEL = [-2.3, -1.2];
const PRESENCE = [0.6, -4.0];
const ELI = [12, -5];

const C = {
  skins: '#4a2e2a',
  covering: '#3a3440',
  linen: '#e9e1cc',
  blue: '#2f4f8a',
  purple: '#5e3a6e',
  scarlet: '#a8302e',
  gold: '#d9a83a',
  bronze: '#9a6a3a',
  acacia: '#a8804a',
};

export default {
  title: '1 Samuel 3:1-10: The Lord calls Samuel',
  subtitle: 'The house of the Lord at Shiloh, before the lamp of God went out',
  seed: 28,

  style: toonStyle({ fog: '#161c38', near: 60, far: 420, ink: '#0b0a14' }),

  sky: { zenith: '#04071a', mid: '#101a40', horizon: '#26306a', ground: '#10142a', glowColor: '#34408a', glowDir: [-0.5, 0.4, -0.7] },

  sun: {
    dir: [-0.5, 0.75, 0.4],
    color: '#93a6e0',
    intensity: 1.0,
    hemi: { sky: '#34447e', ground: '#1e1a2a', intensity: 0.7 },
    shadowSize: 50,
  },

  ground: {
    size: 1200,
    segments: 240,
    flatRadius: 60,
    hillHeight: 40,
    undulation: 0.25,
    plaza: NO_PLAZA,
    colors: {
      sand: '#4a4660', dirt: '#433e58', grass: '#34444e', grassDark: '#28363e', plaza: '#4a4660', plazaLine: '#4a4660',
      scorch: '#1a1620', scorchEdge: '#2a2430', hill: '#2c3a4c',
    },
  },

  mountains: { count: 26, distance: [380, 640], height: [50, 130], widthRatio: [1.4, 2.4], colors: ['#1e2850', '#24305a', '#1a2246', '#2a3662'] },

  objects: [
    { type: 'trees', count: 40, ring: [45, 150], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#2a2230', leafColors: ['#1f3442', '#26404a', '#1a2e3a'] },
  ],

  custom(ctx) {
    stars(ctx, { count: 1300 });
    moon(ctx, { dir: [-0.5, 0.42, -0.7], size: 11 });
    const rng = makeRng(28);
    const y0 = ctx.terrainHeight(0, -5);

    // The court: linen hangings on bronze posts, open to the south.
    const hangings = [];
    const wallSeg = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      hangings.push({ size: [len, 2.4, 0.12], pos: [(x0 + x1) / 2, (z0 + z1) / 2], y: y0, rot: -Math.atan2(z1 - z0, x1 - x0), color: C.linen });
    };
    wallSeg(-17, -22, 17, -22);
    wallSeg(-17, -22, -17, 22);
    wallSeg(17, -22, 17, 22);
    wallSeg(-17, 22, -5, 22);
    wallSeg(5, 22, 17, 22);
    boxes(ctx, hangings);
    const posts = [];
    for (let x = -17; x <= 17; x += 3.4) for (const z of [-22, 22]) if (z < 0 || Math.abs(x) >= 5) posts.push(new THREE.CylinderGeometry(0.09, 0.09, 2.7, 6).translate(x, y0 + 1.35, z));
    for (let z = -22; z <= 22; z += 4.4) for (const x of [-17, 17]) posts.push(new THREE.CylinderGeometry(0.09, 0.09, 2.7, 6).translate(x, y0 + 1.35, z));
    merged(ctx, posts, C.bronze);
    boxes(ctx, [
      { size: [10, 2.4, 0.14], pos: [0, 23.5], y: y0, color: C.blue },
      { size: [10.2, 0.4, 0.18], pos: [0, 23.5], y: y0 + 1.2, color: C.scarlet, collide: false, exclude: false },
    ]);

    // The tabernacle: coverings of skins over a linen-lined holy place.
    const [tx0, tx1] = TENT.x, [tz0, tz1] = TENT.z;
    const W = tx1 - tx0, D = tz1 - tz0, H = TENT.h, mz = (tz0 + tz1) / 2;
    boxes(ctx, [
      { size: [0.3, H, D], pos: [tx0, mz], y: y0, color: C.skins },
      { size: [0.3, H, D], pos: [tx1, mz], y: y0, color: C.skins },
      { size: [W + 0.3, H, 0.3], pos: [0, tz0], y: y0, color: C.skins },
      { size: [0.08, H - 0.2, D - 0.4], pos: [tx0 + 0.2, mz], y: y0, color: C.blue, collide: false, exclude: false },
      { size: [0.08, H - 0.2, D - 0.4], pos: [tx1 - 0.2, mz], y: y0, color: C.blue, collide: false, exclude: false },
      { size: [0.1, 0.5, D - 0.4], pos: [tx0 + 0.26, mz], y: y0 + 3.4, color: C.scarlet, collide: false, exclude: false, cast: false },
      { size: [0.1, 0.5, D - 0.4], pos: [tx1 - 0.26, mz], y: y0 + 3.4, color: C.scarlet, collide: false, exclude: false, cast: false },
      { size: [0.1, 0.25, D - 0.4], pos: [tx0 + 0.26, mz], y: y0 + 3.0, color: C.purple, collide: false, exclude: false, cast: false },
      { size: [0.1, 0.25, D - 0.4], pos: [tx1 - 0.26, mz], y: y0 + 3.0, color: C.purple, collide: false, exclude: false, cast: false },
      { size: [W - 0.4, 0.2, D], pos: [0, mz], y: y0 + 0.02, color: '#6b5a48', collide: false, exclude: false, cast: false },
    ]);
    const roof = new THREE.BoxGeometry(W + 1.4, 0.3, D + 0.8).translate(0, y0 + H + 0.15, mz);
    const drapes = [-1, 1].map((s) => new THREE.BoxGeometry(0.2, 1.8, D + 0.8).translate(s * (W / 2 + 0.6), y0 + H - 0.6, mz));
    merged(ctx, [roof, ...drapes], C.covering);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D).rotateX(Math.PI / 2), ctx.kit.toon(C.purple, { side: THREE.DoubleSide }));
    ceiling.position.set(0, y0 + H - 0.02, mz);
    ctx.scene.add(ceiling);

    // The door hanging drawn back, and the five pillars of the entrance.
    const doorPillars = [];
    for (let i = 0; i < 5; i++) doorPillars.push(new THREE.CylinderGeometry(0.14, 0.14, H, 8).translate(tx0 + 0.3 + (i * (W - 0.6)) / 4, y0 + H / 2, tz1));
    merged(ctx, doorPillars, C.gold);
    for (const s of [-1, 1]) {
      boxes(ctx, [
        { size: [1.1, H - 0.3, 0.4], pos: [s * (W / 2 - 0.6), tz1 + 0.15], y: y0, color: C.blue },
        { size: [1.15, 0.6, 0.45], pos: [s * (W / 2 - 0.6), tz1 + 0.15], y: y0 + 2.2, color: C.scarlet, collide: false, exclude: false },
        { size: [1.15, 0.4, 0.45], pos: [s * (W / 2 - 0.6), tz1 + 0.15], y: y0 + 3.2, color: C.purple, collide: false, exclude: false },
      ]);
    }

    // The veil before the ark, blue, purple and scarlet.
    boxes(ctx, [
      { size: [W - 0.3, H - 0.1, 0.12], pos: [0, VEIL_Z], y: y0, color: C.blue },
      { size: [W - 0.3, 0.9, 0.16], pos: [0, VEIL_Z], y: y0 + 1.6, color: C.purple, collide: false, exclude: false, cast: false },
      { size: [W - 0.3, 0.5, 0.16], pos: [0, VEIL_Z], y: y0 + 3.1, color: C.scarlet, collide: false, exclude: false, cast: false },
    ]);
    const cherubim = [];
    for (const x of [-1.6, 1.6]) cherubim.push(new THREE.ConeGeometry(0.7, 1.4, 3).rotateZ(Math.PI).scale(1, 1, 0.1).translate(x, y0 + 4.2, VEIL_Z + 0.1));
    merged(ctx, cherubim, C.gold, { cast: false });

    // The lampstand of gold, its seven lamps still burning.
    const ly = y0 + 0.2;
    const lampGeos = [
      new THREE.CylinderGeometry(0.3, 0.42, 0.18, 10).translate(LAMP[0], ly + 0.09, LAMP[1]),
      new THREE.CylinderGeometry(0.05, 0.06, 1.6, 8).translate(LAMP[0], ly + 0.9, LAMP[1]),
    ];
    const lampTips = [[LAMP[0], ly + 1.72, LAMP[1]]];
    for (const r of [0.22, 0.42, 0.62]) {
      lampGeos.push(new THREE.TorusGeometry(r, 0.035, 5, 16, Math.PI).rotateZ(Math.PI).translate(LAMP[0], ly + 1.7, LAMP[1]));
      for (const s of [-1, 1]) {
        lampGeos.push(new THREE.CylinderGeometry(0.035, 0.035, r * 1.0, 6).translate(LAMP[0] + s * r, ly + 1.7 + r * 0.5, LAMP[1]));
        lampTips.push([LAMP[0] + s * r, ly + 1.7 + r * 1.0 + 0.02, LAMP[1]]);
      }
    }
    for (const t of lampTips) lampGeos.push(new THREE.CylinderGeometry(0.07, 0.04, 0.08, 8).translate(t[0], t[1] - 0.02, t[2]));
    merged(ctx, lampGeos, C.gold);
    const lampY = lampTips.map((t) => t[1]);
    flames(ctx, lampTips.map((t, i) => ({ pos: [t[0], lampY[i] + 0.02, t[2]], size: 0.32 })), { glowSize: 1.6, glowOpacity: 0.8 });
    glowSprite(ctx, { pos: [LAMP[0], ly + 2.0, LAMP[1]], size: 5, color: '#ffb060', opacity: 0.5, pulse: 0.04 });
    pointLight(ctx, [LAMP[0], ly + 2.3, LAMP[1]], { color: '#ffb468', intensity: 26, distance: 16 });
    ctx.addCollider({ x: LAMP[0], z: LAMP[1], hx: 0.5, hz: 0.5, rot: 0, top: y0 + 2.2 });

    // Table of shewbread and the golden altar of incense before the veil.
    boxes(ctx, [
      { size: [1.6, 1.0, 0.85], pos: [3.2, -4.5], y: y0 + 0.2, color: C.gold },
      { size: [0.9, 1.4, 0.9], pos: [0, VEIL_Z + 1.4], y: y0 + 0.2, color: C.gold },
    ]);
    const loaves = [];
    for (let i = 0; i < 12; i++) loaves.push(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 10).translate(3.2 + (i < 6 ? -0.4 : 0.4), y0 + 1.24 + (i % 6) * 0.075, -4.5));
    merged(ctx, loaves, '#d9b878');

    // Samuel lying on his mat, and the Lord standing near, a still light with no form to see.
    boxes(ctx, [{ size: [1.0, 0.12, 2.2], pos: [SAMUEL[0], SAMUEL[1] - 0.4], y: y0 + 0.22, color: '#8c5a3c', collide: false, exclude: false }]);
    figure(ctx, { pos: SAMUEL, y: y0 + 0.3, yaw: Math.PI, pose: 'lie', roll: 0.35, scale: 0.95, colors: { robe: '#e6d8b8', mantle: '#d9c7a3', skin: '#c08f66', hair: '#3a2418', sash: '#4f7f80' }, clear: 1.4 });
    const py = y0 + 0.2;
    shaft(ctx, { from: [PRESENCE[0], py + H + 0.4, PRESENCE[1]], to: [PRESENCE[0], py, PRESENCE[1]], width: [0.5, 0.9], color: '#fff4dc', opacity: 0.18 });
    glowSprite(ctx, { pos: [PRESENCE[0], py + 1.3, PRESENCE[1]], size: 3.4, color: '#fff4dc', opacity: 0.9, pulse: 0.05 });
    glowSprite(ctx, { pos: [PRESENCE[0], py + 1.2, PRESENCE[1]], size: 7, color: '#d8e4ff', opacity: 0.35, pulse: 0.03 });
    pointLight(ctx, [PRESENCE[0], py + 1.8, PRESENCE[1]], { color: '#e8eeff', intensity: 16, distance: 10 });
    ctx.exclude({ kind: 'circle', x: PRESENCE[0], z: PRESENCE[1], r: 1 });

    // The altar of burnt offering, its fire banked low, and the laver.
    boxes(ctx, [
      { size: [2.6, 1.4, 2.6], pos: [0, 12], y: y0, color: C.bronze },
      { size: [2.9, 0.15, 2.9], pos: [0, 12], y: y0 + 1.4, color: '#6e4a2a', collide: false, exclude: false },
    ]);
    flames(ctx, [{ pos: [-0.4, y0 + 1.5, 12], size: 0.45 }, { pos: [0.5, y0 + 1.5, 11.7], size: 0.35 }], { glowSize: 3, glowOpacity: 0.5 });
    pointLight(ctx, [0, y0 + 2.6, 12], { color: '#ff9050', intensity: 6, distance: 10 });
    merged(ctx, [
      new THREE.CylinderGeometry(0.2, 0.35, 0.9, 10).translate(-4.2, y0 + 0.45, 8),
      new THREE.CylinderGeometry(0.85, 0.5, 0.45, 14).translate(-4.2, y0 + 1.1, 8),
    ], C.bronze);
    ctx.addCollider({ x: -4.2, z: 8, hx: 0.8, hz: 0.8, rot: 0, top: y0 + 1.3 });

    // Eli's chamber in the court, open on the west, where he lies in his place.
    const ex = ELI[0], ez = ELI[1];
    boxes(ctx, [
      { size: [5, 3, 0.3], pos: [ex + 0.5, ez - 2.5], y: y0, color: '#8a7a6a', stone: true },
      { size: [5, 3, 0.3], pos: [ex + 0.5, ez + 2.5], y: y0, color: '#8a7a6a', stone: true },
      { size: [0.3, 3, 5.3], pos: [ex + 3, ez], y: y0, color: '#8a7a6a', stone: true },
      { size: [5.8, 0.3, 5.8], pos: [ex + 0.5, ez], y: y0 + 3, color: '#5e4e40', collide: false },
      { size: [1.1, 0.5, 2.3], pos: [ex + 1.6, ez], y: y0, color: '#6b4a33' },
    ]);
    figure(ctx, { pos: [ex + 1.6, ez + 0.3], y: y0 + 0.4, yaw: Math.PI, pose: 'lie', roll: -0.3, colors: { robe: '#d9c7a3', mantle: '#4f5a7a', skin: '#a87650', hair: '#e6e0d4', sash: '#c8912e' }, clear: 0 });
    flames(ctx, [{ pos: [ex - 0.6, y0 + 0.65, ez + 1.6], size: 0.25 }], { glowSize: 1.5, glowOpacity: 0.6 });
    merged(ctx, [new THREE.CylinderGeometry(0.12, 0.08, 0.45, 8).translate(ex - 0.6, y0 + 0.43, ez + 1.6)], '#9a5a3a');
    pointLight(ctx, [ex - 0.4, y0 + 1.4, ez + 1.4], { color: '#ffa860', intensity: 4, distance: 7 });

    // Shiloh beyond the court: dark houses on the slopes, a few lit doors.
    const town = [];
    for (let i = 0; i < 28; i++) {
      const a = rng() * Math.PI * 2, r = 40 + rng() * 40;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (Math.abs(x) < 12 && z > 20) continue;
      town.push({ pos: [x, z], size: [5 + rng() * 3, 4 + rng() * 3], height: 3 + rng() * 1.5, rot: rng() * 3 });
    }
    houses(ctx, town, { wall: '#5e5a6e', roofEdge: '#4a4658', door: '#ffb05a' });
    olives(ctx, Array.from({ length: 16 }, (_, i) => ({ pos: [(i % 2 ? -1 : 1) * (22 + rng() * 14), -30 + i * 5] })), { trunk: '#2e2830', leaves: ['#26404a', '#2c4a50', '#203a44'] });
    campfires(ctx, [{ pos: [-30, 34], size: 0.8, light: 6 }]);
  },

  player: {
    start: [0.4, 2.0],
    lookAt: [-0.8, -5],
    colors: { robe: '#6f8a6a', mantle: '#4a3a30', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
