// Judges 16: Samson stands between the two middle pillars of the house of Dagon in Gaza and bows himself.
// x is east, z is south. The temple hall opens south onto a paved court. Samson faces the court.
import * as THREE from 'three';
import { NO_PLAZA, PHILISTINES, boxes, figure, merged, people, puffs, scatter, toonStyle } from './lib/ot-25-kit.js';
import { makeRng } from '../engine/util.js';

const SAMSON = [0, -7.6];
const FLOOR = 1.2;
const COL_H = 7.4;
const ROOF_T = 0.9;
const PILLARS = [[-1.55, -7.6], [1.55, -7.6]];
const FRONT = [-17, -13, -9, -5, 5, 9, 13, 17];

const C = {
  stone: '#d8c4a0',
  stoneDark: '#b89f78',
  paint: '#2f6f8a',
  red: '#a8402e',
  gold: '#d9a83a',
};

export default {
  title: 'Judges 16:25-30: Samson pulls down the temple',
  subtitle: 'The house of Dagon at Gaza, full of the lords of the Philistines',
  seed: 26,

  style: toonStyle({ fog: '#ecd2a6', near: 120, far: 900 }),

  sky: { zenith: '#3f78a0', mid: '#80b0c4', horizon: '#f2d6a2', ground: '#d8b88a', glowColor: '#fff0c8', glowDir: [0.4, 0.5, 0.7] },

  sun: {
    dir: [0.45, 0.8, 0.7],
    color: '#fff0d6',
    intensity: 2.5,
    hemi: { sky: '#d6e6ec', ground: '#b08a5a', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1200,
    segments: 240,
    flatRadius: 120,
    hillHeight: 20,
    undulation: 0.2,
    plaza: { center: [0, 6], size: [52, 28] },
    colors: {
      sand: '#dcbf88', dirt: '#c9a06a', grass: '#a8a060', grassDark: '#8a8a4a', plaza: '#e2d0a8', plazaLine: '#bfa478',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b8a070',
    },
  },

  mountains: { count: 20, distance: [500, 800], height: [30, 70], widthRatio: [2, 3], colors: ['#c8b08a', '#b8a080', '#d0b890'] },

  objects: [
    { type: 'trees', count: 40, ring: [70, 200], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#7a5a3c', leafColors: ['#6a8a4a', '#7d9a52', '#5e7e44'] },
    { type: 'stones', count: 120, ring: [30, 80], size: [0.12, 0.35], colors: ['#c9b08a', '#b89a70'] },
  ],

  custom(ctx) {
    const y0 = ctx.terrainHeight(0, -12) - 0.1;
    const top = y0 + FLOOR;
    const roofY = top + COL_H;

    // Hall floor, front steps, back and side walls.
    const steps = [];
    for (let i = 0; i < 4; i++) steps.push({ size: [30, (FLOOR * (i + 1)) / 4, 0.55], pos: [0, -2.5 + (3 - i) * 0.55], y: y0, color: C.stoneDark, walkable: true, stone: true, exclude: false });
    boxes(ctx, [
      { size: [38, FLOOR, 20], pos: [0, -13], y: y0, color: C.stone, walkable: true, stone: true, exclude: false },
      ...steps,
      { size: [38, COL_H, 1.2], pos: [0, -22.4], y: top, color: C.stone, stone: true },
      { size: [1.2, COL_H, 17], pos: [-18.6, -14.5], y: top, color: C.stone, stone: true },
      { size: [1.2, COL_H, 17], pos: [18.6, -14.5], y: top, color: C.stone, stone: true },
      { size: [10, 0.6, 3], pos: [0, -19.6], y: top, color: C.stoneDark, stone: true },
      { size: [5, 2.2, 2.6], pos: [0, -19.6], y: top + 0.6, color: C.paint },
    ]);
    // Painted bands on the inside of the back wall.
    boxes(ctx, [
      { size: [36, 0.6, 0.1], pos: [0, -21.75], y: top + 5.2, color: C.red, collide: false, exclude: false, cast: false },
      { size: [36, 0.3, 0.1], pos: [0, -21.75], y: top + 4.6, color: C.paint, collide: false, exclude: false, cast: false },
    ]);

    // Columns: the front row and the two middle pillars on which the house stands.
    const shafts = [], caps = [];
    const colY = top;
    for (const x of FRONT) {
      shafts.push(new THREE.CylinderGeometry(0.6, 0.7, COL_H, 12).translate(x, colY + COL_H / 2, -4.2));
      caps.push(new THREE.BoxGeometry(1.8, 0.45, 1.8).translate(x, colY + COL_H - 0.22, -4.2));
      ctx.addCollider({ x, z: -4.2, hx: 0.65, hz: 0.65, rot: 0, top: roofY });
    }
    for (const x of [-12, -6, 6, 12]) {
      shafts.push(new THREE.CylinderGeometry(0.55, 0.65, COL_H, 12).translate(x, colY + COL_H / 2, -15));
      caps.push(new THREE.BoxGeometry(1.6, 0.45, 1.6).translate(x, colY + COL_H - 0.22, -15));
      ctx.addCollider({ x, z: -15, hx: 0.6, hz: 0.6, rot: 0, top: roofY });
    }
    merged(ctx, shafts, C.stone, { stone: true });
    merged(ctx, caps, C.stoneDark, { stone: true });

    // The two middle pillars, painted and starting to give way.
    const pillarGroups = PILLARS.map(([x, z], i) => {
      const g = new THREE.Group();
      g.position.set(x, colY, z);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, COL_H, 14).translate(0, COL_H / 2, 0), ctx.kit.stoneMat('#e2cfa6'));
      const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.35, 14).translate(0, 1.6, 0), ctx.kit.toon(C.red));
      const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.35, 14).translate(0, COL_H - 1.2, 0), ctx.kit.toon(C.paint));
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4).translate(0, COL_H - 0.25, 0), ctx.kit.toon(C.gold));
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.3).translate(0, 0.17, 0), ctx.kit.stoneMat(C.stoneDark));
      for (const m of [shaft, band1, band2, cap, base]) {
        m.castShadow = m.receiveShadow = true;
        g.add(m);
      }
      ctx.scene.add(g);
      ctx.addCollider({ x, z, hx: 0.5, hz: 0.5, rot: 0, top: roofY });
      return g;
    });
    ctx.onFrame((t) => {
      const shake = Math.sin(t * 23) * 0.004 + Math.sin(t * 37) * 0.003;
      pillarGroups[0].rotation.z = 0.045 + shake;
      pillarGroups[1].rotation.z = -0.045 - shake;
    });

    // Roof slab with a parapet, a crack running over Samson.
    const roofGeos = [
      new THREE.BoxGeometry(39, ROOF_T, 20).translate(0, roofY + ROOF_T / 2, -13),
    ];
    const parapet = [
      new THREE.BoxGeometry(39.6, 0.7, 0.4).translate(0, roofY + ROOF_T + 0.35, -3),
      new THREE.BoxGeometry(0.4, 0.7, 20).translate(-19.6, roofY + ROOF_T + 0.35, -13),
      new THREE.BoxGeometry(0.4, 0.7, 20).translate(19.6, roofY + ROOF_T + 0.35, -13),
    ];
    merged(ctx, roofGeos, C.stone, { stone: true });
    merged(ctx, parapet, C.red);
    const fascia = [new THREE.BoxGeometry(39.2, 0.35, 0.2).translate(0, roofY + 0.3, -2.98)];
    merged(ctx, fascia, C.paint, { cast: false });
    const crack = [];
    const rng = makeRng(26);
    let cx = -0.3, cy = roofY + ROOF_T;
    for (let i = 0; i < 7; i++) {
      const nx = cx + (rng() - 0.5) * 0.9, ny = cy - ROOF_T / 7 - 0.05;
      const len = Math.hypot(nx - cx, ny - cy);
      crack.push(new THREE.BoxGeometry(0.09, len, 0.05).rotateZ(Math.atan2(nx - cx, ny - cy) * -1).translate((cx + nx) / 2, (cy + ny) / 2, -2.86));
      cx = nx;
      cy = ny;
    }
    for (let i = 0; i < 9; i++) crack.push(new THREE.BoxGeometry(0.08, 0.04, 1.6 + rng() * 2).rotateY((rng() - 0.5) * 0.8).translate((rng() - 0.5) * 3, roofY + ROOF_T + 0.01, -4 - i * 1.2));
    merged(ctx, crack, '#3a2418', { cast: false });

    // Falling stone and dust between the pillars.
    const n = 26;
    const debris = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.22, 0), ctx.kit.toon(C.stoneDark), n);
    const bits = Array.from({ length: n }, () => ({ x: (rng() - 0.5) * 5, z: SAMSON[1] + (rng() - 0.5) * 3, p: rng() * 2.2, s: 0.4 + rng() * 1.2, r: rng() * 6 }));
    const fallH = roofY - top;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    debris.frustumCulled = false;
    debris.castShadow = true;
    ctx.scene.add(debris);
    ctx.onFrame((t) => {
      bits.forEach((b, i) => {
        const k = ((t + b.p) % 2.2) / 2.2;
        const fall = Math.min(1, k * 1.6);
        v.set(b.x, roofY - fall * fall * fallH + 0.1, b.z);
        e.set(t * 2 + b.r, b.r, t + b.r);
        debris.setMatrixAt(i, m.compose(v, q.setFromEuler(e), sc.setScalar(b.s)));
      });
      debris.instanceMatrix.needsUpdate = true;
    });
    for (const [px, pz] of PILLARS) {
      puffs(ctx, { center: [px, roofY - 0.4, pz - 0.8], radius: [1.2, 0.3, 0.8], count: 5, size: [0.35, 0.7], color: '#e8d8b8', emissive: '#6a5a48', drift: 0.6, seed: px > 0 ? 3 : 4 });
      puffs(ctx, { center: [px + Math.sign(px) * 0.8, top + 0.25, pz - 0.6], radius: [0.8, 0.15, 0.8], count: 5, size: [0.25, 0.5], color: '#e2d0ac', emissive: '#6a5a48', drift: 0.5, seed: px > 0 ? 5 : 6 });
    }

    // Rubble already fallen across the floor.
    boxes(ctx, Array.from({ length: 10 }, (_, i) => ({ size: [0.4 + rng() * 0.5, 0.3 + rng() * 0.3, 0.4 + rng() * 0.4], pos: [(rng() - 0.5) * 7, SAMSON[1] + (rng() - 0.5) * 4], y: top, rot: rng() * 3, color: C.stoneDark, collide: false, exclude: false })), { stone: true });

    // Samson between the pillars, arms out to them, bowing with all his might.
    figure(ctx, { pos: SAMSON, y: top, facing: [0, 30], scale: 1.12, pose: 'spread', lean: 0.18,
      colors: { robe: '#7a6a52', mantle: '#5e4a36', skin: '#a8724a', hair: '#1f140e', sash: '#4a3a2a', arms: [1.32, 0.12] }, clear: 1.6 });
    figure(ctx, { pos: [3.4, -5.6], y: top, facing: SAMSON, scale: 0.7, colors: { robe: '#c8a97a', mantle: '#8c5a3c', skin: '#b5825a', hair: '#3a2418' }, clear: 0.8 });

    // Lords of the Philistines seated along the hall.
    const lords = [];
    for (let i = 0; i < 5; i++) for (const side of [-1, 1]) lords.push({ x: side * (6 + i * 2.3), z: -18, y: top, yaw: Math.atan2(-side * (6 + i * 2.3), SAMSON[1] + 18), kneel: true, scale: 1.05 });
    const lordColors = { robes: ['#5e2a6a', '#7a2e3a', '#2e3a6a', '#8a5a1e'], mantles: [C.gold, '#e0c070', C.red], skins: PHILISTINES.skins, hair: PHILISTINES.hair, wraps: [C.gold, '#e0c070'] };
    people(ctx, lords, lordColors, { seed: 4 });
    boxes(ctx, [-1, 1].map((s) => ({ size: [12, 0.45, 2], pos: [s * 10.6, -18.4], y: top, color: '#8a5a3c', exclude: true })));

    // About three thousand on the roof: a dense crowd behind the parapet looking down.
    const roofPeople = scatter(ctx, { center: [0, -9.5], rect: [37, 11], count: 340, spacing: 0.72, seed: 9 })
      .map((p) => ({ x: p.x, z: p.z, y: roofY + ROOF_T, yaw: Math.atan2(-p.x * 0.15, 20) + (p.r - 0.5) * 0.6 }));
    people(ctx, roofPeople, PHILISTINES, { seed: 11 });

    // Banners hung between the front columns.
    const banners = [];
    for (const x of [-15, -11, 11, 15]) banners.push(new THREE.BoxGeometry(1.6, 3.2, 0.06).translate(x, roofY - 1.9, -4.0));
    merged(ctx, banners, C.red, { cast: false });
    ctx.exclude({ kind: 'rect', x: 0, z: -13, hx: 19.5, hz: 10.5 });
  },

  crowd: {
    seed: 26,
    minSpacing: 0.66,
    facing: SAMSON,
    colors: PHILISTINES,
    keepClear: [{ kind: 'rect', x: 0, z: -13, hx: 19.6, hz: 10.4 }],
    aisles: [{ from: [0, 30], to: [0, 0], width: 4 }],
    groups: [
      { shape: 'rect', center: [0, 8], size: [52, 18], count: 520, children: 0.05, facingJitter: 0.4 },
      { shape: 'rect', center: [-22, 18], size: [12, 8], count: 40, facingJitter: 0.8 },
      { shape: 'rect', center: [22, 18], size: [12, 8], count: 40, facingJitter: 0.8 },
    ],
  },

  player: {
    start: [0, 12],
    lookAt: [0, -6],
    colors: { robe: '#4f7f80', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
