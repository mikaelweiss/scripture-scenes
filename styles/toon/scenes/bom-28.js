// Alma 31:13-23: the Rameumptom in a Zoramite synagogue. One worshiper at a time climbs the
// high narrow stand and recites the same prayer. Alma and his brethren watch from the south door.
import * as THREE from 'three';
import { add, baseStyle, block, brazier, canvasTexture, clothes, fretBand, groundColors, houses, person, steps } from './lib/bom-25-kit.js';

const STAND = [0, -15];
const STAND_H = 5.6;
const FLOOR = 0.9;

const C = { wall: '#e8d6ae', floor: '#d6bf95', stair: '#cdb48a', purple: '#5b3a6e', crimson: '#8c2f3a', gold: '#d9a441', cream: '#efe3c2', jade: '#3e8e6e', ink: '#2b1a12' };

const ZORAM = {
  robes: ['#5b3a6e', '#8c2f3a', '#c8912e', '#e6d8b8', '#3e6e66', '#a64b35', '#4a3a6e', '#d9a441', '#efe3c2'],
  mantles: ['#d9a441', '#8c2f3a', '#5b3a6e', '#2f8f8a', '#efe3c2', '#b5523b'],
  skins: clothes.skins,
  hair: clothes.hair,
  wraps: ['#d9a441', '#efe3c2', '#8c2f3a', '#5b3a6e'],
};

function synagogue(ctx) {
  const k = ctx.kit;
  const y0 = ctx.terrainHeight(0, -14) - 0.1;
  const base = y0 + FLOOR;
  const H = 11;
  block(ctx, [36, FLOOR + 0.1, 36], [0, y0 - 0.1, -14], C.floor, { walkable: true });
  steps(ctx, { x: 0, z: 4, y0, y1: base, width: 16, rise: 0.3, depth: 0.5, dir: [0, 1], color: C.stair });

  block(ctx, [36, H + 1.6, 1], [0, base, -31.5], C.wall);
  for (const s of [-1, 1]) {
    block(ctx, [1, H + 1.6, 36], [s * 17.5, base, -14], C.wall);
    fretBand(ctx, [1.3, 1.0, 36.3], [s * 17.5, base + H - 1.8, -14], [C.purple, C.gold]);
  }
  fretBand(ctx, [36, 1.0, 1.3], [0, base + H - 1.8, -31.5], [C.purple, C.gold]);
  for (const x of [-15.5, -10, -4.5, 4.5, 10, 15.5]) {
    add(ctx, new THREE.CylinderGeometry(0.7, 0.8, H, 12).translate(0, H / 2, 0), k.stoneMat(C.wall), { pos: [x, base, 3.2] });
    ctx.addCollider({ x, z: 3.2, hx: 0.75, hz: 0.75, rot: 0, top: base + H });
  }
  fretBand(ctx, [36.4, 1.6, 1.6], [0, base + H, 3.2], [C.crimson, C.gold]).castShadow = false;
  block(ctx, [37.5, 0.7, 37.5], [0, base + H + 1.6, -14.2], C.stair, { collide: false }).castShadow = false;
  fretBand(ctx, [26, 2.2, 0.8], [0, base + H + 2.3, 3.1], [C.purple, C.gold]).castShadow = false;

  const banner = canvasTexture(128, 512, (g, w, h) => {
    g.fillStyle = C.purple;
    g.fillRect(0, 0, w, h);
    g.fillStyle = C.gold;
    g.fillRect(10, 0, 8, h);
    g.fillRect(w - 18, 0, 8, h);
    for (let y = 40; y < h - 40; y += 90) {
      g.beginPath();
      g.arc(w / 2, y + 30, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = C.purple;
      g.beginPath();
      g.arc(w / 2, y + 30, 14, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = C.gold;
    }
  });
  const bannerMat = k.toon('#ffffff', { map: banner, side: THREE.DoubleSide });
  for (const x of [-12, -6, 6, 12]) add(ctx, new THREE.PlaneGeometry(2.6, 7.5), bannerMat, { pos: [x, base + 5, -30.9], cast: false });
  for (const s of [-1, 1]) for (const z of [-24, -14, -4]) add(ctx, new THREE.PlaneGeometry(2.6, 7.5), bannerMat, { pos: [s * 16.9, base + 5, z], rotY: -s * Math.PI / 2, cast: false });

  // The Rameumptom: a tall narrow stand with room for one on top, climbed by a steep stair at the back.
  const [sx, sz] = STAND;
  block(ctx, [4.2, 0.6, 4.2], [sx, base, sz], C.gold, { stone: false, walkable: true });
  block(ctx, [1.7, STAND_H - 0.6, 1.7], [sx, base + 0.6, sz], C.wall, { top: base + STAND_H - 0.4 });
  fretBand(ctx, [1.9, 0.7, 1.9], [sx, base + 1.4, sz], [C.crimson, C.gold]);
  fretBand(ctx, [1.9, 0.7, 1.9], [sx, base + STAND_H - 1.6, sz], [C.purple, C.gold]);
  block(ctx, [2.3, 0.3, 2.3], [sx, base + STAND_H, sz], C.gold, { stone: false, walkable: true });
  const rail = k.toon(C.gold);
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(ctx, new THREE.CylinderGeometry(0.05, 0.05, 1, 6), rail, { pos: [sx + px * 1.05, base + STAND_H + 0.8, sz + pz * 1.05] });
  for (const [w, d, px, pz] of [[2.2, 0.08, 0, 1.05], [0.08, 2.2, 1.05, 0], [0.08, 2.2, -1.05, 0]]) add(ctx, new THREE.BoxGeometry(w, 0.08, d), rail, { pos: [sx + px, base + STAND_H + 1.25, sz + pz] });
  steps(ctx, { x: sx, z: sz - 1.15, y0: base + 0.6, y1: base + STAND_H + 0.3, width: 1.1, rise: 0.5, depth: 0.42, dir: [0, -1], color: C.stair });
  ctx.exclude({ kind: 'rect', x: sx, z: sz - 3, hx: 2.4, hz: 5.2 });

  person(ctx, { robe: '#e6d8b8', mantle: C.purple, skin: '#b5825a', hair: '#1f140e', sash: C.gold, arms: [2.55, 0.25] }, [sx, sz + 0.2], [sx, 20], { y: base + STAND_H + 0.3, clear: 2.4 });

  // The next worshipers wait in a short line at the foot of the stair.
  for (let i = 0; i < 4; i++) {
    const z = sz - 6.2 - i * 0.9;
    person(ctx, { robe: ZORAM.robes[i * 2], mantle: ZORAM.mantles[i], skin: ZORAM.skins[i], hair: ZORAM.hair[i % 4], sash: C.gold }, [sx + (i % 2 ? 0.15 : -0.15), z], [sx, sz], { y: base, clear: 0.5 });
  }

  // Alma, Amulek and their brethren, plainly dressed, watch astonished from the doorway.
  const plain = [
    { robe: '#f3eddf', mantle: '#d9c7a3', skin: '#b5825a', hair: '#e6dcc8', sash: '#8c5a3c', arms: [0.4, 0.5] },
    { robe: '#a87b4f', mantle: '#d9c7a3', skin: '#a87650', hair: '#3a2418' },
    { robe: '#8c5a3c', mantle: '#e6d8b8', skin: '#b5825a', hair: '#4a3020' },
    { robe: '#7a6a52', mantle: '#d9c7a3', skin: '#c08f66', hair: '#2b1a12' },
  ];
  [[-6.5, -1.5], [-8, -0.6], [-5.3, -0.3], [-7.2, 0.6]].forEach((p, i) => person(ctx, plain[i], p, [sx, sz], { y: base }));

  for (const [x, z] of [[-6, -20], [6, -20], [-6, -9], [6, -9]]) brazier(ctx, [x, z], { y: base, color: '#6b4a33' });
}

export default {
  title: 'Alma 31:13-23: The Rameumptom',
  subtitle: 'A Zoramite synagogue in Antionum, one worshiper at a time',
  seed: 31,

  style: { ...baseStyle, fog: { color: '#e9d4a8', near: 140, far: 1100 } },

  sky: { zenith: '#2f6080', mid: '#7aa0aa', horizon: '#f0d29a', ground: '#d9b98a', glowColor: '#ffe7ad', glowDir: [0.3, 0.5, 0.8] },

  sun: { dir: [0.3, 0.75, 0.8], color: '#fff0d6', intensity: 2.4, hemi: { sky: '#e6ecdc', ground: '#b07a52', intensity: 1.35 }, shadowSize: 60 },

  ground: { size: 1600, segments: 300, flatRadius: 140, hillHeight: 40, undulation: 0.3, plaza: { center: [0, 14], size: [56, 24] }, colors: groundColors },

  mountains: { count: 30, distance: [520, 800], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#7a9a8a', '#6a8c84', '#8aa08a', '#96a38f'] },

  objects: [
    { type: 'trees', count: 90, ring: [60, 230], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  custom(ctx) {
    synagogue(ctx);
    houses(ctx, { ring: [40, 110], count: 32, colors: ['#e8d6ae', '#d6bf95', '#cdb48a'], roof: '#5b3a6e', seed: 28, avoid: (x, z) => Math.abs(x) < 24 && z > -36 && z < 36 });
  },

  clouds: { layers: [{ count: 36, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a6a82' }] },

  light: {
    beams: [{ from: [0, 30, -15], to: { at: STAND, lift: FLOOR + 5.8 }, width: [5, 2.5], color: '#ffe8b0', intensity: 0.12, layers: 2, stripes: 14, fadeLow: 0.1 }],
    pointLights: [{ at: STAND, lift: FLOOR + 8, color: '#ffe6b0', intensity: 12, distance: 30 }],
  },

  crowd: {
    seed: 28,
    minSpacing: 0.66,
    facing: STAND,
    colors: ZORAM,
    aisles: [{ from: [0, 20], to: [0, -9], width: 3.6 }],
    keepClear: [{ kind: 'circle', x: STAND[0], z: STAND[1], r: 4 }],
    groups: [
      { center: STAND, radius: [4.5, 13.5], count: 260, lean: -0.08, children: 0.06 },
      { shape: 'rect', center: [0, 18], size: [40, 12], count: 40, facing: [0, 0], colors: ZORAM },
    ],
  },

  player: {
    start: [0, -6],
    lookAt: [0, -16],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
