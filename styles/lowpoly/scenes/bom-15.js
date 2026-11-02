// Omni 1:12-22: Mosiah leads those who would hearken out of the land of Nephi and comes down to the city of
// Zarahemla beside the river Sidon. The people of Zarahemla come out to meet them. -z is north, the river runs west.
import { house, person, water, barrier, broadTree, bush, scatterIn, faceYaw, banner } from './lib/bom-13-kit.js';
import { rng } from '../engine/util.js';

const RIVER = [[-26, 260], [-30, 120], [-24, 20], [-30, -80], [-42, -170], [-50, -320]];
const CITY = [16, -104];
const MEET = [8, -42];
const MOSIAH = [8, -34];
const ZARAHEMLA = [8, -47];

function riverFlats() {
  const out = [];
  for (let i = 0; i < RIVER.length - 1; i++) {
    const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1];
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 5);
    for (let k = 0; k < n; k++) out.push({ x: ax + ((bx - ax) * k) / n, z: az + ((bz - az) * k) / n, r: 11, falloff: 7, height: -2.6 });
  }
  return out;
}

function band(seed, count, from, to, width, spacing) {
  const r = rng(seed);
  const pts = [];
  for (let tries = 0; pts.length < count && tries < count * 50; tries++) {
    const t = r();
    const x = from[0] + (to[0] - from[0]) * t + r.range(-1, 1) * width * (0.6 + t * 0.4);
    const z = from[1] + (to[1] - from[1]) * t + r.range(-1, 1) * width * 0.3;
    if (pts.some((p) => (p[0] - x) ** 2 + (p[1] - z) ** 2 < spacing * spacing)) continue;
    pts.push([x, z]);
  }
  return pts;
}

const travelers = band(51, 230, [15, 34], [8, -32], 10, 1.2).filter(([x, z]) => Math.hypot(x - 21, z - 48) > 6);
const townsfolk = band(52, 180, [8, -52], [20, -78], 9, 1.1);

const housesAt = (() => {
  const r = rng(53);
  const out = [];
  for (let gx = -4; gx <= 5; gx++) {
    for (let gz = -4; gz <= 4; gz++) {
      const x = CITY[0] + gx * 13 + r.range(-2, 2), z = CITY[1] + gz * 12 + r.range(-2, 2);
      if (Math.hypot(x - CITY[0], z - CITY[1]) < 30 || r() < 0.18) continue;
      if (x < -10) continue;
      out.push([x, z, r]);
    }
  }
  return out;
})();

export default {
  title: 'Omni 1:12-22: Mosiah discovers Zarahemla',
  seed: 15,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.75, 0.42, 0.2], color: '#ffe2b0', intensity: 2.9 },
  light: { sky: '#a8c0e6', ground: '#6a5a3e', hemi: 1.0 },
  sky: { top: '#4a78b8', horizon: '#e8dcc4', ground: '#c4b08e', sunColor: '#fff0cc', glow: 0.9 },
  fog: { color: '#d8d4c4', near: 120, far: 760 },
  clouds: { count: 55, shadow: '#9aa2b2', lit: '#fff6e8', rim: '#ffffff', distance: [320, 950], altitude: [130, 260], hole: 0.2 },
  mountains: { count: 44, color: '#6a7a6a', radius: [520, 760], height: [60, 160], haze: 0.45 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.35, shadowTint: '#2a3048', highlightTint: '#fff0d4' },
  shadow: { center: [8, -20], radius: 80 },

  player: { start: [21, 48], yaw: 0.12, pitch: -0.16, eye: 1.65, speed: 5 },

  terrain: {
    size: 1200,
    segments: 220,
    seed: 15,
    hills: 26,
    bumps: 0.3,
    flats: [{ x: 10, z: -70, r: 90, falloff: 50, height: 0.6 }, { x: 24, z: 66, r: 4, falloff: 80, height: 10 }, ...riverFlats()],
    colors: { ground: '#8a8a50', groundAlt: '#7a8248', grass: '#6a8c40', high: '#7c7a5a', rock: '#7a6c58' },
    patches: [
      { x: CITY[0], z: CITY[1], r: 70, color: '#b8a27c', strength: 0.7, rough: 0.3 },
      { x: 10, z: -10, r: 16, color: '#a89a70', strength: 0.5, rough: 0.6 },
      ...RIVER.map(([x, z]) => ({ x, z, r: 30, color: '#a8986e', strength: 0.35, rough: 0.6 })),
    ],
  },

  objects: [
    {
      type: 'steppedPyramid', x: CITY[0], z: CITY[1], w: 40, d: 36, tiers: 5, tierHeight: 3.2, inset: 2.8, stairWidth: 8,
      color: '#c9b08a', trim: '#8f765a', stairColor: '#d6c29e',
      shrine: { w: 11, d: 8, h: 4.6, door: 2.4, roof: '#7a644c' },
    },
  ],

  scatter: [
    { type: 'tree', count: 60, center: [0, 0], ring: [140, 360], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#4f7a35' } },
    { type: 'tree', count: 40, center: [-30, -40], ring: [14, 120], spacing: 7, seed: 5, props: { kind: 'palm', leaf: '#5d8a3a' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [120, 360], spacing: 12, seed: 6, props: { color: '#8a7e6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#c4b090', '#94704e', '#6b6f4a', '#7a4e36', '#d8cdb5'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#556246'],
      skins: ['#c08a62', '#b07a55', '#c9976e', '#a8724c'],
      mantleChance: 0.75,
      hoodChance: 0.5,
    },
    groups: [
      { count: travelers.length, points: travelers, face: [8, -60], children: 0.22, seed: 54 },
      {
        count: townsfolk.length, points: townsfolk, face: [9, -20], children: 0.25, seed: 55,
        palette: {
          robes: ['#e4dccb', '#c8b89a', '#b5503a', '#d0a050', '#5a7a8a', '#a87a4a', '#e8e0d0'],
          mantles: ['#2f6a7a', '#c84a2a', '#d8b050', '#6a3a5a', '#3a5a3a'],
          skins: ['#a8724c', '#9b6a46', '#b5835e', '#8a5a3c'],
          mantleChance: 0.5,
          hoodChance: 0.05,
        },
      },
    ],
  },

  figures: [
    { x: MOSIAH[0], z: MOSIAH[1], face: ZARAHEMLA, scale: 1.05, robe: '#ece4d2', mantle: '#4a6a9a', skin: '#c08a62', arms: 'out' },
    { x: ZARAHEMLA[0], z: ZARAHEMLA[1], face: MOSIAH, scale: 1.03, robe: '#d8b050', mantle: '#a83a2a', skin: '#9b6a46', arms: 'out' },
  ],

  custom(ctx) {
    for (let i = 0; i < RIVER.length - 1; i++) {
      const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const rot = Math.atan2(bx - ax, bz - az);
      water(ctx, { x: (ax + bx) / 2, z: (az + bz) / 2, w: 25, d: len + 18, y: -1.0, rot, color: '#3e7f8a', opacity: 1, wave: 0.07, cell: 3 });
      barrier(ctx, { x: (ax + bx) / 2, z: (az + bz) / 2, w: 17, d: len, rot });
    }
    for (const [x, z, r] of housesAt) {
      house(ctx, { x, z, rot: faceYaw(x, z, CITY) + r.range(-0.2, 0.2), w: r.range(6, 10), d: r.range(5, 7), h: r.range(2.8, 3.6), color: r.pick(['#c9b08a', '#d4bc94', '#bfa27a']), roof: r() < 0.6 ? 'flat' : 'thatch', roofColor: '#a0844e' });
    }
    // Fields of maize between the river and the city.
    for (const [cx, cz] of [[-6, -70], [-10, -95], [44, -60]]) {
      for (let i = -6; i <= 6; i++) for (let j = -4; j <= 4; j++) {
        const x = cx + i * 1.4, z = cz + j * 1.6;
        const y = ctx.heightAt(x, z);
        ctx.solid.add(new ctx.THREE.ConeGeometry(0.25, 1.6, 4), { position: [x, y + 0.8, z], rotation: [0, i + j, 0], color: '#8a9a3a', jitter: 0.12 });
      }
    }
    for (const [x, z] of scatterIn(ctx.rand, { center: [-30, 0], ring: [10, 30], count: 70, spacing: 2, avoid: (x, z) => x > -14 })) bush(ctx, { x, z, size: ctx.rand.range(0.6, 1.2), color: '#4f7036' });
    for (const [x, z] of scatterIn(ctx.rand, { center: [30, -10], ring: [20, 70], count: 26, spacing: 9, avoid: (x, z) => Math.abs(x - 10) < 14 || z > 20 })) broadTree(ctx, { x, z, h: ctx.rand.range(6, 9), color: '#4f7a35' });
    // Bundles and walking staffs of the travelers who left the land of Nephi.
    for (const [x, z] of travelers.filter((_, i) => i % 9 === 0)) {
      const bx = x + 0.6, bz = z + 0.4;
      ctx.solid.add(new ctx.THREE.DodecahedronGeometry(0.35, 0), { position: [bx, ctx.heightAt(bx, bz) + 0.25, bz], scale: [1.2, 0.8, 1], color: ctx.rand.pick(['#a08458', '#7a5c3e', '#c4ac80']) });
    }
    banner(ctx, { x: MOSIAH[0] - 1.6, z: MOSIAH[1] + 1.2, h: 4.2, color: '#3e5f86' });
    banner(ctx, { x: ZARAHEMLA[0] + 1.8, z: ZARAHEMLA[1] - 1.4, h: 4.2, color: '#b5503a' });
    person(ctx, { x: MOSIAH[0] + 1.5, z: MOSIAH[1] + 1.5, face: ZARAHEMLA, robe: '#a0825c', mantle: '#5a3d2b', skin: '#c08a62' });
    person(ctx, { x: ZARAHEMLA[0] - 1.4, z: ZARAHEMLA[1] - 1.2, face: MOSIAH, robe: '#e4dccb', mantle: '#2f6a7a', skin: '#a8724c' });
  },
};
