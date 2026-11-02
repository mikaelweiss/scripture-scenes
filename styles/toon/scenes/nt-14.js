// John 5:2-9: the pool of Bethesda by the sheep gate in Jerusalem. Two pools ringed by four porches with a fifth between them.
// Christ stands in the south porch over the man who had waited thirty and eight years. North is -z.
import * as THREE from 'three';
import { CHRIST, CROWD_COLORS, PLAYER, addMesh, box, calmWater, cyl, figure, glow, groundColors, houses, makeRng, NO_PLAZA, toonStyle } from './lib/nt-13-kit.js';

const PAVE = 0.9;
const POOL = { hx: 14, hz: 5.5, cz: 8 };
const LEDGE = 1.6;
const DEPTH = 5;
const COL_H = 4;
const MAN = [-4.8, 13.95];
const JESUS = [-3.0, 14.75];

const stone = '#e8dcc0';
const column = '#f1e8d2';

export default {
  title: 'John 5:2-9: The pool of Bethesda',
  subtitle: 'Rise, take up thy bed, and walk',
  seed: 52,

  style: toonStyle({ fog: '#f0dcb4', near: 110, far: 900 }),

  sky: { zenith: '#3f86a8', mid: '#86b8c4', horizon: '#f3dcae', ground: '#d9c08e', glowColor: '#fff0c8', glowDir: [0.5, 0.5, 0.6] },

  sun: { dir: [0.45, 0.85, 0.5], color: '#fff2da', intensity: 2.6, hemi: { sky: '#dcecf0', ground: '#b8946a', intensity: 1.15 }, shadowSize: 60 },

  ground: {
    size: 1000, segments: 220, flatRadius: 140, hillHeight: 40, undulation: 0.15, plaza: { center: [0, 0], size: [44, 42] },
    colors: groundColors({ sand: '#dcc59a', dirt: '#c9a774', grass: '#a3a465', grassDark: '#7f8a4c', plaza: '#e6d6b0', plazaLine: '#cbb48a', hill: '#9aa070' }),
  },

  mountains: { count: 30, distance: [480, 760], height: [50, 110], widthRatio: [1.8, 2.8], colors: ['#b8a888', '#a89c80', '#c2b294'] },

  objects: [
    { type: 'trees', count: 70, ring: [80, 220], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b5a44', leafColors: ['#7d8a5a', '#8a9a68', '#6f7e52'] },
    { type: 'stones', count: 200, ring: [26, 90], size: [0.12, 0.35], colors: ['#d9c39a', '#c8b088', '#e3d2ae'] },
  ],

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(14);
    const pave = [], cols = [], caps = [], roofs = [], walls = [], steps = [];
    const solid = (x0, x1, z0, z1, top, geos = pave, walkable = true) => {
      geos.push(box(x1 - x0, top + 0.3, z1 - z0, (x0 + x1) / 2, (top - 0.3) / 2, (z0 + z1) / 2));
      ctx.addCollider({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, rot: 0, top, walkable });
    };

    const ox = POOL.hx + LEDGE + DEPTH + 0.4, oz = POOL.cz + POOL.hz + LEDGE + DEPTH + 0.4;
    const inner = POOL.cz - POOL.hz;
    // Pavement around and between the two pools.
    solid(-ox, ox, -oz, -(POOL.cz + POOL.hz), PAVE);
    solid(-ox, ox, POOL.cz + POOL.hz, oz, PAVE);
    solid(-ox, -POOL.hx, -(POOL.cz + POOL.hz), POOL.cz + POOL.hz, PAVE);
    solid(POOL.hx, ox, -(POOL.cz + POOL.hz), POOL.cz + POOL.hz, PAVE);
    solid(-POOL.hx, POOL.hx, -inner, inner, PAVE);
    // A step down into each pool along both long sides.
    for (const s of [-1, 1]) {
      for (const edge of [POOL.cz - POOL.hz, POOL.cz + POOL.hz]) {
        const z = s * edge, inward = s * (edge === POOL.cz - POOL.hz ? 1 : -1);
        solid(-POOL.hx, POOL.hx, Math.min(z, z + inward), Math.max(z, z + inward), 0.45, steps);
      }
      calmWater(ctx, { y: 0.32, area: [POOL.hx * 2, POOL.hz * 2], center: [0, s * POOL.cz], color: '#3f9aa4', light: '#9fe0d8', dark: '#2f7880', tile: 8 });
    }

    // Outer walls with a gate east of the middle porch, and steps down to the street.
    const wallH = PAVE + COL_H + 1.4;
    const wallSeg = (x0, x1, z0, z1) => {
      walls.push(box(x1 - x0, wallH, z1 - z0, (x0 + x1) / 2, wallH / 2 - 0.2, (z0 + z1) / 2));
      ctx.addCollider({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, rot: 0, top: wallH });
    };
    wallSeg(-ox - 0.8, ox + 0.8, -oz - 0.8, -oz);
    wallSeg(-ox - 0.8, ox + 0.8, oz, oz + 0.8);
    wallSeg(-ox - 0.8, -ox, -oz, oz);
    wallSeg(ox, ox + 0.8, -oz, -2);
    wallSeg(ox, ox + 0.8, 2, oz);
    solid(ox, ox + 0.8, -2, 2, PAVE);
    solid(ox + 0.8, ox + 2, -2.4, 2.4, 0.45, steps);
    walls.push(box(0.9, 1.4, 5.4, ox + 0.4, wallH + 0.5, 0));

    // Four porches around the pools and a fifth between them: columns, an architrave, and a roof back to the wall.
    const colLine = (ax, az, bx, bz, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        cols.push(cyl(0.3, 0.36, COL_H, x, PAVE + COL_H / 2, z, undefined, 10));
        caps.push(box(0.9, 0.3, 0.9, x, PAVE + COL_H + 0.15, z), box(0.85, 0.2, 0.85, x, PAVE + 0.1, z));
        ctx.addCollider({ x, z, hx: 0.36, hz: 0.36, rot: 0, top: PAVE + COL_H });
      }
    };
    const cx = POOL.hx + LEDGE, cz = POOL.cz + POOL.hz + LEDGE;
    const top = PAVE + COL_H + 0.3;
    colLine(-cx, -cz, cx, -cz, 12);
    colLine(-cx, cz, cx, cz, 12);
    colLine(-cx, -cz + 3, -cx, cz - 3, 9);
    colLine(cx, -cz + 3, cx, cz - 3, 9);
    for (const s of [-1, 1]) {
      caps.push(box(cx * 2 + 1, 0.5, 0.8, 0, top + 0.25, s * cz), box(0.8, 0.5, cz * 2 + 1, s * cx, top + 0.25, 0));
      roofs.push(box(ox * 2 + 1.6, 0.35, oz - cz + 0.8, 0, top + 0.6, s * (cz + oz) / 2));
      roofs.push(box(ox - cx + 0.8, 0.35, cz * 2, s * (cx + ox) / 2, top + 0.6, 0));
    }
    // The middle porch is an open colonnade with a beamed pergola.
    for (const s of [-1, 1]) {
      colLine(-POOL.hx + 1.5, s * (inner - 0.9), POOL.hx - 1.5, s * (inner - 0.9), 9);
      caps.push(box(POOL.hx * 2 - 2, 0.45, 0.7, 0, top + 0.2, s * (inner - 0.9)));
    }
    for (let i = 0; i < 14; i++) caps.push(box(0.3, 0.3, inner * 2 - 1, -POOL.hx + 1.5 + i * ((POOL.hx * 2 - 3) / 13), top + 0.55, 0));

    addMesh(scene, pave, kit.stoneMat(stone));
    addMesh(scene, steps, kit.stoneMat('#d8caa8'));
    addMesh(scene, walls, kit.stoneMat('#dccca6'));
    addMesh(scene, cols, kit.stoneMat(column));
    addMesh(scene, caps, kit.stoneMat('#e6dbc0'));
    addMesh(scene, roofs, kit.toon('#a9714a'));

    // The sick under the porches: lying and sitting on mats (5:3).
    const mats = [];
    const sickColors = { robes: ['#d9c7a3', '#c8a97a', '#bfa27a', '#a87b4f', '#e6d8b8', '#9c6b4e'], mantles: ['#8c5a3c', '#6b5a4a', '#d9c7a3', '#7a6a52'], skins: CROWD_COLORS.skins, hair: CROWD_COLORS.hair, wraps: CROWD_COLORS.wraps };
    const pickC = (list) => list[Math.floor(rng() * list.length)];
    const sick = (x, z, yaw, pose) => {
      const c = { robe: pickC(sickColors.robes), mantle: pickC(sickColors.mantles), skin: pickC(sickColors.skins), hair: rng() < 0.4 ? pickC(sickColors.wraps) : pickC(sickColors.hair) };
      figure(ctx, c, [x, z], { yaw, pose, y: PAVE, clear: 1 });
      mats.push(box(0.8, 0.06, 2.0, x, PAVE + 0.03, z, { ry: yaw }));
    };
    const spots = [];
    for (let i = 0; i < 70; i++) {
      const side = Math.floor(rng() * 4);
      const along = (rng() - 0.5) * 2;
      const depth = cz + 0.9 + rng() * (DEPTH - 1.6);
      const p = side < 2 ? [along * (cx + 1), (side ? 1 : -1) * depth] : [(side === 2 ? 1 : -1) * (cx + 0.9 + rng() * (DEPTH - 1.6)), along * (cz - 2)];
      if (Math.hypot(p[0] - JESUS[0], p[1] - JESUS[1]) < 3) continue;
      if (spots.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1.9)) continue;
      spots.push(p);
      const yaw = side < 2 ? Math.PI / 2 + (rng() - 0.5) * 0.3 : (rng() - 0.5) * 0.3;
      sick(p[0], p[1], yaw, rng() < 0.6 ? 'lie' : 'sit');
    }
    addMesh(scene, mats, kit.toon('#b8945e'), { cast: false });

    // The man by the water, sitting up on his bed, and Christ before him (5:6-8).
    const bed = box(0.9, 0.08, 2.0, MAN[0], PAVE + 0.04, MAN[1], { ry: Math.PI / 2 });
    addMesh(scene, [bed], kit.toon('#c8a46a'), { cast: false });
    figure(ctx, { robe: '#bfa27a', mantle: '#7a6a52', skin: '#9c6a45', hair: '#4a3020', arms: [0.25, 1.4] }, MAN, { face: JESUS, pose: 'sit', y: PAVE + 0.06, clear: 1.2 });
    figure(ctx, CHRIST, JESUS, { face: MAN, glow: 0.4, scale: 1.1, y: PAVE, arms: [0.2, 1.25], clear: 1.2 });
    glow(ctx, [JESUS[0], PAVE + 1.4, JESUS[1]], 5, '#fff3d0', { opacity: 0.6 });

    // Jerusalem around the pool, and the temple mount to the south.
    const list = [];
    for (let i = 0; i < 46; i++) {
      const a = rng() * Math.PI * 2, r = 32 + rng() * 42;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (Math.abs(x) < 10 && z < -20) continue;
      if (x > 20 && Math.abs(z) < 6) continue;
      if (list.some((h) => Math.hypot(h[0] - x, h[1] - z) < 9)) continue;
      list.push([x, z, 5 + rng() * 4, 5 + rng() * 3, 3.5 + rng() * 3, Math.round(rng() * 4) * (Math.PI / 2) + (rng() - 0.5) * 0.2]);
    }
    houses(ctx, list, { wall: '#e3d3ac', roof: '#c9b48a' });
    const mount = [], temple = [], gold = [];
    mount.push(box(170, 14, 110, -30, 6, 185));
    temple.push(box(24, 26, 40, -30, 13 + 13, 185), box(44, 18, 10, -30, 13 + 9, 162));
    gold.push(box(25, 1.2, 41, -30, 13 + 26.6, 185));
    addMesh(scene, mount, kit.stoneMat('#d9c9a0'));
    addMesh(scene, temple, kit.stoneMat('#f3ecd8'));
    addMesh(scene, gold, kit.toon('#e0b04a'));
    ctx.addCollider({ x: -30, z: 185, hx: 85, hz: 55, rot: 0, top: 13 });
  },

  crowd: {
    seed: 7,
    minSpacing: 0.9,
    facing: [0, 0],
    colors: CROWD_COLORS,
    groups: [
      { shape: 'rect', center: [0, -18.5], size: [30, 2.6], count: 16, kneel: 0.6, children: 0.1 },
      { shape: 'rect', center: [8, 18.5], size: [16, 2.6], count: 10, kneel: 0.6, children: 0.1 },
      { shape: 'rect', center: [-18.5, 0], size: [2.6, 22], count: 10, kneel: 0.6 },
      { shape: 'rect', center: [6, 1.2], size: [16, 0.6], count: 6, kneel: 0.4, facing: [-4, 15] },
    ],
  },

  player: {
    start: [1.8, 13.8],
    lookAt: [-4.4, 15.6],
    colors: PLAYER,
  },
};
