// Ruth 2: Ruth gleans after the reapers in the field of Boaz during the barley harvest near Bethlehem.
// x is east, z is south. Standing barley lies north, the reaped stubble south. Bethlehem sits on the ridge to the northeast.
import * as THREE from 'three';
import { ISRAEL, NO_PLAZA, boxes, figure, houses, jars, merged, olives, people, rods, scatter, sheep, toonStyle } from './lib/ot-25-kit.js';
import { makeRng } from '../engine/util.js';

const RUTH = [-1.5, 3];
const BOAZ = [2.6, 5.8];
const GRAIN = { x: [-38, 38], z: [-40, -7] };

const REAPERS = {
  robes: ['#e6d8b8', '#d9c7a3', '#c8a97a', '#bfa27a', '#a87b4f'],
  mantles: ['#8c5a3c', '#a87b4f', '#d9c7a3', '#7a6a52'],
  skins: ISRAEL.skins,
  hair: ISRAEL.hair,
  wraps: ['#e6d8b8', '#d9c7a3', '#ffffff'],
};

const MAIDENS = {
  robes: ['#b5523b', '#c8912e', '#6f8a6a', '#d9c7a3', '#8c5a3c'],
  mantles: ['#e6d8b8', '#c8912e', '#d9c7a3', '#b5523b'],
  skins: ISRAEL.skins,
  hair: ['#2b1a12', '#3a2418'],
  wraps: ['#e6d8b8', '#d9c7a3', '#c8912e', '#b5523b'],
};

export default {
  title: "Ruth 2:2-17: Ruth gleans in Boaz's field",
  subtitle: 'The barley harvest in the fields of Bethlehem-judah',
  seed: 27,

  style: toonStyle({ fog: '#f0dcb0', near: 140, far: 1000 }),

  sky: { zenith: '#3f86b0', mid: '#86bcd0', horizon: '#f6e2b4', ground: '#d8c08a', glowColor: '#fff4d4', glowDir: [0.6, 0.5, 0.6] },

  sun: {
    dir: [0.6, 0.75, 0.5],
    color: '#fff2d8',
    intensity: 2.6,
    hemi: { sky: '#d8ecf0', ground: '#b8925a', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 75,
    hillHeight: 40,
    undulation: 0.35,
    plaza: NO_PLAZA,
    colors: {
      sand: '#d4b878', dirt: '#c4a066', grass: '#9aa060', grassDark: '#7e8a4a', plaza: '#c8b07a', plazaLine: '#c8b07a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a8a068',
    },
  },

  mountains: { count: 26, distance: [480, 760], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#a8a07a', '#9a9a78', '#b0a884', '#8e9474'] },

  objects: [
    { type: 'stones', count: 220, ring: [40, 110], size: [0.15, 0.45], colors: ['#c9b08a', '#b89a70', '#d9c39a'] },
  ],

  custom(ctx) {
    const rng = makeRng(27);
    const gy = ctx.terrainHeight(0, -20);

    // Standing barley in ridged rows with drooping ears on top.
    const soil = [], rows = [];
    const [x0, x1] = GRAIN.x, [z0, z1] = GRAIN.z;
    soil.push(new THREE.BoxGeometry(x1 - x0, 0.1, z1 - z0).translate((x0 + x1) / 2, gy, (z0 + z1) / 2));
    const nRows = 30;
    for (let i = 0; i < nRows; i++) {
      const z = z0 + ((i + 0.5) / nRows) * (z1 - z0);
      rows.push(new THREE.CylinderGeometry(0.62, 0.62, x1 - x0 - 0.4, 10, 1).rotateZ(Math.PI / 2).scale(1, 1.25, 1).translate((x0 + x1) / 2, gy + 0.45, z));
    }
    merged(ctx, soil, '#9a7a4a', { cast: false });
    merged(ctx, rows, '#e2c064');
    ctx.addCollider({ x: 0, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, rot: 0, top: gy + 0.9 });
    ctx.exclude({ kind: 'rect', x: 0, z: (z0 + z1) / 2, hx: (x1 - x0) / 2 + 0.4, hz: (z1 - z0) / 2 + 0.4 });

    // Reaped stubble and sheaves bound and stood up in shocks.
    const sheafGeos = [], bands = [];
    const sheafSpots = [];
    for (let i = 0; i < 40; i++) {
      const x = -34 + (i % 10) * 7.4 + (rng() - 0.5) * 2, z = 9 + Math.floor(i / 10) * 3.4 + (rng() - 0.5) * 1.2;
      if (Math.hypot(x - RUTH[0], z - RUTH[1]) < 6 || Math.hypot(x - BOAZ[0], z - BOAZ[1]) < 4 || Math.abs(x + 2) < 3 || Math.hypot(x + 5, z - 12) < 4) continue;
      sheafSpots.push([x, z]);
    }
    for (const [x, z] of sheafSpots) {
      const y = ctx.terrainHeight(x, z);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        const sx = x + Math.sin(a) * 0.28, sz = z + Math.cos(a) * 0.28;
        sheafGeos.push(new THREE.CylinderGeometry(0.28, 0.2, 1.2, 7).rotateX(Math.cos(a) * -0.18).rotateZ(Math.sin(a) * 0.18).translate(sx, y + 0.6, sz));
        sheafGeos.push(new THREE.ConeGeometry(0.34, 0.45, 7).translate(sx, y + 1.38, sz));
        bands.push(new THREE.TorusGeometry(0.22, 0.04, 4, 10).rotateX(Math.PI / 2).translate(sx, y + 0.78, sz));
      }
      ctx.addCollider({ x, z, hx: 0.5, hz: 0.5, rot: 0, top: y + 1.4 });
      ctx.exclude({ kind: 'circle', x, z, r: 1 });
    }
    merged(ctx, sheafGeos, '#e2c370');
    merged(ctx, bands, '#9a7a3a');

    // Reapers along the edge of the standing grain, bent to their sickles.
    const reapers = [];
    const sickles = [];
    for (let i = 0; i < 18; i++) {
      const x = -32 + i * 3.8 + (rng() - 0.5) * 1.2, z = -5.6 + (rng() - 0.5) * 0.6;
      const yaw = Math.PI + (rng() - 0.5) * 0.4;
      reapers.push({ x, z, yaw, lean: 0.28 + rng() * 0.1 });
      const hx = x + 0.3, hz = z - 0.75, hy = ctx.terrainHeight(x, z) + 0.75;
      sickles.push(new THREE.TorusGeometry(0.2, 0.025, 4, 10, Math.PI * 1.2).rotateX(Math.PI / 2).rotateY(rng() * 3).translate(hx, hy, hz));
      ctx.exclude({ kind: 'circle', x, z, r: 0.7 });
    }
    people(ctx, reapers, REAPERS, { seed: 3 });
    merged(ctx, sickles, '#5a5048');

    // Young men binding sheaves and the maidens working behind them.
    const binders = scatter(ctx, { center: [0, 0], rect: [64, 4], count: 12, spacing: 2.4, seed: 5, avoid: (x, z) => Math.hypot(x - RUTH[0], z - RUTH[1]) < 5 })
      .map((p, i) => ({ x: p.x, z: p.z, yaw: p.r * 6.28, lean: 0.25, kneel: i % 2 === 0 }));
    people(ctx, binders, REAPERS, { seed: 6 });
    const maidens = scatter(ctx, { center: [-18, 4], rect: [20, 6], count: 7, spacing: 2, seed: 8 })
      .map((p, i) => ({ x: p.x, z: p.z, yaw: Math.PI + (p.r - 0.5), lean: 0.2, kneel: i % 3 === 0 }));
    people(ctx, maidens, MAIDENS, { seed: 9 });

    // Ruth gathering ears among the sheaves, a bundle of gleanings beside her.
    figure(ctx, { pos: RUTH, facing: BOAZ, pose: 'kneel', lean: 0.12, scale: 1.0, colors: { robe: '#3e5a8a', mantle: '#d9c7a3', skin: '#b5825a', hair: '#e6d8b8', sash: '#b5523b' }, clear: 1.4 });
    const ry = ctx.terrainHeight(RUTH[0] + 0.9, RUTH[1] + 0.4);
    merged(ctx, [new THREE.CylinderGeometry(0.18, 0.12, 0.7, 7).rotateZ(1.3).translate(RUTH[0] + 0.9, ry + 0.16, RUTH[1] + 0.5)], '#e2c370');
    const gleanings = [];
    for (let i = 0; i < 14; i++) {
      const x = RUTH[0] + (rng() - 0.5) * 3, z = RUTH[1] - 1 - rng() * 2;
      gleanings.push(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4).rotateZ(Math.PI / 2).rotateY(rng() * 3).translate(x, ctx.terrainHeight(x, z) + 0.03, z));
    }
    merged(ctx, gleanings, '#e8c96a', { cast: false });

    // Boaz come from Bethlehem, greeting her, with his servant set over the reapers.
    figure(ctx, { pos: BOAZ, facing: RUTH, scale: 1.05, pose: 'spread', colors: { robe: '#e6d8b8', mantle: '#7a2e3a', skin: '#a87650', hair: '#d9d0c0', sash: '#c8912e', arms: [0.55, 0.7] }, clear: 1.2 });
    figure(ctx, { pos: [5.2, 7.4], facing: BOAZ, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', sash: '#d9c7a3' } });
    rods(ctx, [{ from: [5.55, 0, 7.5], to: [5.6, 1.9, 7.5], ground: true }], '#6b4a33', 0.04);

    // The shelter where the reapers eat bread dipped in vinegar and parched corn.
    const sh = [16, 15];
    const shY = ctx.terrainHeight(...sh);
    rods(ctx, [[-2.5, -1.8], [2.5, -1.8], [-2.5, 1.8], [2.5, 1.8]].map(([dx, dz]) => ({ from: [sh[0] + dx, shY, sh[1] + dz], to: [sh[0] + dx, shY + 2.6, sh[1] + dz] })), '#6b4a33', 0.07);
    merged(ctx, [new THREE.BoxGeometry(6, 0.12, 4.4).rotateX(0.08).translate(sh[0], shY + 2.65, sh[1])], '#d9c7a3');
    merged(ctx, [new THREE.BoxGeometry(5.4, 0.2, 2).translate(sh[0], shY + 0.1, sh[1])], '#a85a3a', { cast: false });
    people(ctx, [[-1.8, -1.4], [0, -1.5], [1.8, -1.3], [-1.6, 1.4], [1.4, 1.5]].map(([dx, dz]) => ({ x: sh[0] + dx, z: sh[1] + dz, yaw: dz < 0 ? 0 : Math.PI, kneel: true })), REAPERS, { seed: 12 });
    jars(ctx, [{ pos: [sh[0] - 0.6, sh[1]] }, { pos: [sh[0] + 0.8, sh[1] + 0.2], scale: 0.8 }, { pos: [sh[0] + 3.2, sh[1] - 2.2], scale: 1.3 }]);
    ctx.addCollider({ x: sh[0], z: sh[1], hx: 2.6, hz: 1.9, rot: 0, top: shY + 1 });
    ctx.exclude({ kind: 'rect', x: sh[0], z: sh[1], hx: 3.2, hz: 2.6 });

    // Field boundary stones and the path up to the town.
    boxes(ctx, [
      { size: [0.9, 0.7, 30], pos: [-41, 3], color: '#bfa27a' },
      { size: [0.9, 0.7, 30], pos: [41, 3], color: '#bfa27a' },
    ], { stone: true });

    olives(ctx, [
      [-48, -10], [-52, 6], [-46, 22], [48, -16], [50, 2], [47, 24], [-30, 34], [-18, 40], [24, 36], [36, 40], [-58, -30], [58, -34], [-10, -52], [14, -54],
    ].map((pos) => ({ pos })));

    // Bethlehem on its ridge.
    const town = [];
    for (let i = 0; i < 34; i++) {
      const a = 0.3 + rng() * 0.75, r = 150 + rng() * 45;
      town.push({ pos: [Math.sin(a) * r, -Math.cos(a) * r], size: [5 + rng() * 4, 4 + rng() * 3], height: 3 + rng() * 2.5, rot: (rng() - 0.5) * 0.6 });
    }
    houses(ctx, town, { wall: '#e0cba0', roofEdge: '#c8b088' });

    sheep(ctx, Array.from({ length: 24 }, () => ({ pos: [-70 - rng() * 20, 30 + rng() * 20] })));
  },


  player: {
    start: [-5, 12],
    lookAt: [1, 1],
    colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
