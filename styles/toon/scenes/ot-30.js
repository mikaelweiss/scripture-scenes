// 1 Kings 8: Solomon dedicates the temple. The cloud of the glory of the Lord fills the house.
// x is east, z is south. The temple stands north and faces the court. Solomon stands on the brasen scaffold.
import * as THREE from 'three';
import { ISRAEL, boxes, figure, flames, glowSprite, merged, people, pointLight, puffs, rods, scatter, shaft, toonStyle } from './lib/ot-25-kit.js';

const PORCH_Z = -18;
const TERRACE = 2.4;
const SCAFFOLD = [0, 9];
const ALTAR = [0, -3];
const SEA = [11, -11];

const C = {
  stone: '#eadbb8',
  stoneShade: '#d6c49c',
  cedar: '#8a5a36',
  gold: '#e0b040',
  bronze: '#b07a40',
  white: '#fbf7ee',
};

const PRIESTS = { robes: ['#fbf7ee', '#f3eddf', '#efe6d0'], mantles: ['#fbf7ee', '#e9dcc0', '#f3eddf'], skins: ISRAEL.skins, hair: ISRAEL.hair, wraps: ['#fbf7ee', '#f3eddf'] };

const GLORY = [0, -30];

export default {
  title: '1 Kings 8: Solomon dedicates the temple',
  subtitle: 'The house of the Lord at Jerusalem, the cloud of His glory filling it',
  seed: 30,

  style: toonStyle({ fog: '#f0dcb4', near: 140, far: 1000 }),

  sky: { zenith: '#3a7aa8', mid: '#86b8cc', horizon: '#f6e2b4', ground: '#d8c08a', glowColor: '#fff4d4', glowDir: [0, 0.55, -1] },

  sun: {
    dir: [0.4, 0.85, 0.55],
    color: '#fff2d8',
    intensity: 2.6,
    hemi: { sky: '#dcecf0', ground: '#b8925a', intensity: 1.15 },
    shadowSize: 80,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 110,
    hillHeight: 36,
    undulation: 0.2,
    plaza: { center: [0, 10], size: [100, 100] },
    colors: {
      sand: '#d8c08a', dirt: '#c8a870', grass: '#9aa060', grassDark: '#7e8a4a', plaza: '#e8dab8', plazaLine: '#c8b48c',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a8a068',
    },
  },

  mountains: { count: 26, distance: [500, 780], height: [50, 110], widthRatio: [1.6, 2.6], colors: ['#a8a07a', '#9a9a78', '#b0a884', '#8e9474'] },

  objects: [
    { type: 'trees', count: 60, ring: [120, 260], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b5a4a', leafColors: ['#7d8f5a', '#6e8250', '#8a9a64'] },
  ],

  custom(ctx) {
    const y0 = ctx.terrainHeight(0, -30) - 0.1;

    const ty = y0 + TERRACE;
    // The house: holy place and oracle, with three storeys of side chambers, and the porch before it.
    boxes(ctx, [
      { size: [11, 0.6, 38], pos: [0, -36], y: ty, color: C.stoneShade, stone: true },
      { size: [10, 15, 30], pos: [0, -36], y: ty + 0.6, color: C.stone, stone: true },
      { size: [3.2, 9, 30], pos: [-6.6, -36], y: ty + 0.6, color: C.stoneShade, stone: true },
      { size: [3.2, 9, 30], pos: [6.6, -36], y: ty + 0.6, color: C.stoneShade, stone: true },
      { size: [10, 19, 5], pos: [0, PORCH_Z - 2.5], y: ty + 0.6, color: C.stone, stone: true },
    ]);
    // Cedar beams, gold trim, windows and the great doorway.
    const trim = [
      new THREE.BoxGeometry(10.4, 0.5, 30.4).translate(0, ty + 15.6, -36),
      new THREE.BoxGeometry(10.4, 0.6, 5.4).translate(0, ty + 19.6, PORCH_Z - 2.5),
    ];
    merged(ctx, trim, C.gold);
    const beams = [];
    for (const y of [3.6, 6.6, 9.6]) for (const s of [-1, 1]) beams.push(new THREE.BoxGeometry(0.15, 0.4, 30.2).translate(s * 8.25, ty + y, -36));
    for (const y of [6, 11, 15.5]) beams.push(new THREE.BoxGeometry(10.2, 0.4, 0.2).translate(0, ty + y, PORCH_Z + 0.02));
    merged(ctx, beams, C.cedar);
    const windows = [];
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) windows.push(new THREE.BoxGeometry(0.15, 1.4, 0.7).translate(s * 5.02, ty + 12.5, -48 + i * 4.6));
    merged(ctx, windows, '#3a2418', { cast: false });
    merged(ctx, [new THREE.BoxGeometry(4.4, 8.5, 0.15).translate(0, ty + 0.6 + 4.25, PORCH_Z + 0.03)], '#4a3020', { cast: false });
    merged(ctx, [
      new THREE.BoxGeometry(5.2, 0.5, 0.25).translate(0, ty + 9.3, PORCH_Z + 0.06),
      new THREE.BoxGeometry(0.4, 8.6, 0.25).translate(-2.4, ty + 4.9, PORCH_Z + 0.06),
      new THREE.BoxGeometry(0.4, 8.6, 0.25).translate(2.4, ty + 4.9, PORCH_Z + 0.06),
    ], C.gold);

    // The raised terrace of the house and the stairs up to the porch.
    boxes(ctx, [{ size: [22, TERRACE, 40], pos: [0, -35.5], y: y0, color: C.stoneShade, walkable: true, stone: true, exclude: false }]);
    const steps = [];
    const n = Math.round(TERRACE / 0.3);
    for (let i = 0; i < n; i++) steps.push({ size: [9, (TERRACE * (i + 1)) / n, 0.45], pos: [0, -15.5 + 0.45 * (n - 1 - i) + 0.22], y: y0, color: C.stoneShade, walkable: true, stone: true, exclude: false });
    boxes(ctx, steps);
    ctx.exclude({ kind: 'rect', x: 0, z: -35, hx: 11.5, hz: 21 });

    // Jachin and Boaz, pillars of brass with lily work and nets of pomegranates.
    const shafts = [], caps = [], nets = [];
    for (const x of [-3.4, 3.4]) {
      const z = PORCH_Z + 1.6;
      shafts.push(new THREE.CylinderGeometry(0.62, 0.66, 9, 16).translate(x, ty + 0.6 + 4.5, z));
      shafts.push(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 16).translate(x, ty + 0.85, z));
      caps.push(new THREE.LatheGeometry([[0.6, 0], [0.95, 0.6], [1.05, 1.4], [0.85, 2.1], [1.0, 2.4], [0.001, 2.45]].map(([r, y]) => new THREE.Vector2(r, y)), 16).translate(x, ty + 9.6, z));
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        for (const yy of [0.45, 1.75]) nets.push(new THREE.SphereGeometry(0.15, 8, 6).translate(x + Math.sin(a) * 0.98, ty + 9.6 + yy, z + Math.cos(a) * 0.98));
      }
      ctx.addCollider({ x, z, hx: 0.9, hz: 0.9, rot: 0, top: ty + 12 });
      ctx.exclude({ kind: 'circle', x, z, r: 1.3 });
    }
    merged(ctx, shafts, C.bronze);
    merged(ctx, caps, C.gold);
    merged(ctx, nets, '#b5523b');

    // The great altar of brass, the fire on it.
    boxes(ctx, [
      { size: [7, 2.8, 7], pos: ALTAR, y: y0, color: C.bronze },
      { size: [7.4, 0.3, 7.4], pos: ALTAR, y: y0 + 2.8, color: '#8a5a2e', collide: false, exclude: false },
      { size: [3, 1.4, 4], pos: [ALTAR[0], ALTAR[1] + 5.4], y: y0, color: C.bronze, walkable: true },
    ]);
    const horns = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => new THREE.ConeGeometry(0.3, 0.8, 6).translate(ALTAR[0] + sx * 3.3, y0 + 3.5, ALTAR[1] + sz * 3.3));
    merged(ctx, horns, C.bronze);
    const fl = [];
    for (let i = 0; i < 9; i++) fl.push({ pos: [ALTAR[0] + ((i % 3) - 1) * 2, y0 + 3.0, ALTAR[1] + (Math.floor(i / 3) - 1) * 2], size: 1.1 + (i % 2) * 0.4 });
    flames(ctx, fl, { glowSize: 9, glowOpacity: 0.5 });
    pointLight(ctx, [ALTAR[0], y0 + 6, ALTAR[1]], { intensity: 18, distance: 22 });

    // The molten sea on twelve oxen, three looking each way.
    const sy = y0;
    const oxGeos = [];
    for (let d = 0; d < 4; d++) {
      const a = (d * Math.PI) / 2;
      for (let k = -1; k <= 1; k++) {
        const lx = k * 1.2, lz = 1.6;
        const x = SEA[0] + lx * Math.cos(a) + lz * Math.sin(a), z = SEA[1] - lx * Math.sin(a) + lz * Math.cos(a);
        oxGeos.push(new THREE.BoxGeometry(0.8, 1.0, 1.6).translate(0, 1.1, 0).rotateY(a).translate(x, sy, z));
        oxGeos.push(new THREE.BoxGeometry(0.55, 0.6, 0.6).translate(0, 1.4, 1.0).rotateY(a).translate(x, sy, z));
        for (const [qx, qz] of [[-0.25, 0.55], [0.25, 0.55], [-0.25, -0.55], [0.25, -0.55]]) oxGeos.push(new THREE.BoxGeometry(0.18, 0.7, 0.18).translate(qx, 0.35, qz).rotateY(a).translate(x, sy, z));
      }
    }
    oxGeos.push(new THREE.LatheGeometry([[0.001, 0], [1.8, 0.1], [2.9, 0.8], [3.3, 2.2], [3.5, 2.4], [3.3, 2.45], [0.001, 2.2]].map(([r, y]) => new THREE.Vector2(r, y)), 24).translate(SEA[0], sy + 1.6, SEA[1]));
    merged(ctx, oxGeos, C.bronze);
    merged(ctx, [new THREE.CircleGeometry(3.2, 24).rotateX(-Math.PI / 2).translate(SEA[0], sy + 3.9, SEA[1])], '#5fa8b8', { cast: false });
    ctx.addCollider({ x: SEA[0], z: SEA[1], hx: 3.4, hz: 3.4, rot: 0, top: sy + 4 });
    ctx.exclude({ kind: 'circle', x: SEA[0], z: SEA[1], r: 4 });

    // Ten lavers on their bases, five each side of the house.
    const lavers = [];
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {
      const x = s * 13, z = -42 + i * 5;
      lavers.push(new THREE.BoxGeometry(1.4, 1.2, 1.4).translate(x, y0 + 0.8, z));
      lavers.push(new THREE.CylinderGeometry(0.9, 0.5, 0.6, 12).translate(x, y0 + 1.7, z));
      ctx.addCollider({ x, z, hx: 0.8, hz: 0.8, rot: 0, top: y0 + 2 });
      ctx.exclude({ kind: 'circle', x, z, r: 1.3 });
    }
    merged(ctx, lavers, C.bronze);

    // Low wall of the inner court: three rows of hewed stone and a row of cedar beams.
    const wall = [];
    const seg = (x0, z0, x1, z1) => wall.push({ size: [Math.hypot(x1 - x0, z1 - z0) + 0.8, 1.3, 0.8], pos: [(x0 + x1) / 2, (z0 + z1) / 2], y: y0, rot: -Math.atan2(z1 - z0, x1 - x0), color: C.stoneShade, stone: true });
    seg(-22, -58, 22, -58);
    seg(-22, -58, -22, 17);
    seg(22, -58, 22, 17);
    seg(-22, 17, -5, 17);
    seg(5, 17, 22, 17);
    boxes(ctx, wall);
    const cedarTop = [];
    for (const w of wall) cedarTop.push(new THREE.BoxGeometry(w.size[0], 0.25, 0.85).rotateY(w.rot).translate(w.pos[0], y0 + 1.42, w.pos[1]));
    merged(ctx, cedarTop, C.cedar);

    // Solomon on the brasen scaffold, spreading forth his hands toward heaven.
    boxes(ctx, [{ size: [2.8, 1.5, 2.8], pos: SCAFFOLD, y: y0, color: C.bronze }]);
    const solY = y0 + 1.5;
    const sol = figure(ctx, { pos: SCAFFOLD, y: solY, yaw: Math.PI, scale: 1.35, pose: 'raise', clear: 0,
      colors: { robe: '#5e2a6a', mantle: '#e0b040', skin: '#b5825a', hair: '#3a2418', sash: '#e0b040', arms: [0.75, 2.5] } });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.12, 10, 1, true), ctx.kit.toon(C.gold, { side: THREE.DoubleSide }));
    crown.position.y = 1.72;
    sol.children[0].add(crown);

    // Priests in white linen with trumpets, and Levite singers, at the east end of the altar.
    const priests = [];
    const trumpets = [];
    for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) {
      const x = 7 + i * 1.1, z = -1 + r * 1.3;
      priests.push({ x, z, yaw: Math.PI + 0.3 });
      if (r < 2) trumpets.push({ from: [x - 0.15, y0 + 1.5, z - 0.2], to: [x - 0.75, y0 + 2.3, z - 1.2] });
    }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 10; i++) priests.push({ x: -17 + i * 1.1, z: -1 + r * 1.3, yaw: Math.PI - 0.3 });
    people(ctx, priests, PRIESTS, { seed: 8 });
    rods(ctx, trumpets, '#e8c860', 0.05);
    ctx.exclude({ kind: 'rect', x: 13, z: 1, hx: 7.5, hz: 3 });
    ctx.exclude({ kind: 'rect', x: -12, z: 0.3, hx: 6.2, hz: 2.4 });
    // Priests standing back from the porch, unable to minister because of the cloud.
    const backing = scatter(ctx, { center: [0, -12], rect: [12, 4], count: 12, spacing: 1.1, seed: 4 }).map((p) => ({ x: p.x, z: p.z, yaw: Math.PI + (p.r - 0.5) * 0.6, kneel: p.r < 0.5 }));
    people(ctx, backing, PRIESTS, { seed: 10 });

    // The cloud of glory filling the house and billowing out of the porch.
    puffs(ctx, { center: [0, y0 + TERRACE + 1.2, PORCH_Z + 0.8], radius: [2.6, 0.8, 0.8], count: 9, size: [0.6, 1.2], color: '#fffaf0', emissive: '#d8ccb0', drift: 0.18, seed: 21 });
    puffs(ctx, { center: [0, y0 + TERRACE + 17.5, -36], radius: [8, 2.5, 16], count: 30, size: [3, 5.5], color: '#fffaf0', emissive: '#d8ccb0', drift: 0.12, seed: 22 });
    puffs(ctx, { center: [0, y0 + TERRACE + 18, PORCH_Z - 4], radius: [6, 2, 3], count: 10, size: [2.4, 4], color: '#fffaf0', emissive: '#d8ccb0', drift: 0.15, seed: 23 });
    glowSprite(ctx, { pos: [0, y0 + TERRACE + 4.5, PORCH_Z + 0.5], size: 12, color: '#fff2c8', opacity: 0.7, pulse: 0.05 });
    glowSprite(ctx, { pos: [0, y0 + 20, -32], size: 60, color: '#fff2c8', opacity: 0.4, pulse: 0.03 });
    shaft(ctx, { from: [0, 180, -40], to: [0, y0 + 16, -34], width: [10, 16], color: '#fff2c9', opacity: 0.12 });
    pointLight(ctx, [0, y0 + 6, PORCH_Z + 3], { color: '#fff0c8', intensity: 30, distance: 30 });
  },

  clouds: {
    layers: [
      { count: 40, gap: [-0.3, 0.3], distance: [350, 800], height: [60, 160], size: [40, 90], color: '#fff6e4', shade: '#7a7088' },
      { count: 16, center: GLORY, distance: [30, 80], height: [80, 120], size: [20, 40], color: '#fffaf0', shade: '#b8aa90', drift: 0.004 },
    ],
  },

  crowd: {
    seed: 30,
    minSpacing: 0.66,
    facing: [0, -18],
    colors: ISRAEL,
    aisles: [{ from: [0, 70], to: [0, 18], width: 3.6 }],
    keepClear: [{ kind: 'rect', x: 0, z: -20, hx: 22.6, hz: 38 }],
    groups: [
      { shape: 'rect', center: [0, 38], size: [90, 40], count: 1900, kneel: 0.35, children: 0.12, facingJitter: 0.35 },
      { shape: 'rect', center: [-34, -10], size: [18, 50], count: 340, kneel: 0.35, children: 0.1, facing: [0, -10] },
      { shape: 'rect', center: [34, -10], size: [18, 50], count: 340, kneel: 0.35, children: 0.1, facing: [0, -10] },
    ],
  },

  player: {
    start: [0, 27],
    lookAt: [0, -10],
    fov: 58,
    colors: { robe: '#4f7f80', mantle: '#8c5a3c', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
