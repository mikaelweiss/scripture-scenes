// Mosiah 24:13-25: at dawn the Lord puts the Lamanite task-masters into a deep sleep, and Alma's people
// leave the land of Helam with their flocks and grain. -z is north, toward the valley out of Helam.
import { sleeper, flock, campfire, jar, spear, shield, house, field, columnGroups, rng, tufts } from './lib/bom-19-kit.js';

const VILLAGE = [-34, -14];
const CAMP = [8, -11];
const PATH = [[-22, -6], [-8, -16], [2, -34], [7, -60], [8, -90], [3, -125], [-4, -165], [-10, -210]];
const ALMA = [-3, -24];

const column = columnGroups(PATH, { width: 4, density: 1.6, spacing: 0.9, seed: 52, children: 0.28, skipNear: [[ALMA[0], ALMA[1], 1.5], [4, -46, 3], [8, -76, 3], [5, -110, 3]] });

const guardPalette = {
  robes: ['#a8402a', '#b0703a', '#5a4a6a', '#8a8a5a', '#c89a5a', '#6a2a2a'],
  mantles: ['#2e2a26', '#5a2a1e', '#3e3a30', '#9a6a2a'],
  skins: ['#6a4228', '#7a4c31', '#5e3a24'],
};

export default {
  title: "Mosiah 24:13-25: Alma's people made free",
  seed: 20,
  fov: 60,
  exposure: 1.15,

  sun: { direction: [0.42, 0.22, -0.86], color: '#ffb87a', intensity: 3.0 },
  light: { sky: '#b8c0e8', ground: '#9a7a5a', hemi: 1.9 },
  sky: { top: '#4b5d92', horizon: '#ffb88e', ground: '#d0a088', sunColor: '#ffd6a0', glow: 1.5 },
  fog: { color: '#d9ab94', near: 70, far: 520 },
  clouds: { count: 18, shadow: '#8a7a98', lit: '#ffb09a', rim: '#fff0d0', distance: [300, 900], altitude: [140, 280], hole: 0.25 },
  mountains: { count: 44, color: '#6a6070', radius: [480, 740], height: [60, 170], haze: 0.5 },
  bloom: { strength: 0.5, radius: 0.55, threshold: 0.82 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.4, shadowTint: '#3a2e60', highlightTint: '#ffe2c0' },
  shadow: { center: [-5, -15], radius: 70 },

  player: { start: [12.5, -5.5], yaw: 0.66, pitch: -0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 20,
    hills: 45,
    bumps: 0.35,
    flats: [{ x: -5, z: -25, r: 60, falloff: 60, height: 0 }, { x: 4, z: -110, r: 22, falloff: 40, height: 1 }, { x: -4, z: -170, r: 20, falloff: 40, height: 3 }],
    colors: { ground: '#9a8460', groundAlt: '#8a7a54', grass: '#7a8a48', high: '#8a7a64', rock: '#7a6a5a' },
    patches: [
      ...PATH.map(([x, z]) => ({ x, z, r: 9, color: '#b49c76', strength: 0.5, rough: 0.4 })),
      { x: VILLAGE[0], z: VILLAGE[1], r: 26, color: '#a88e6a', strength: 0.6, rough: 0.4 },
    ],
  },

  scatter: [
    { type: 'tree', count: 70, center: [0, -40], ring: [55, 260], spacing: 8, seed: 8, avoid: [{ rect: [3, -120, 30, 220] }], props: { kind: 'broad', leaf: '#5a7038' } },
    { type: 'tree', count: 10, center: [-40, 20], ring: [8, 40], spacing: 8, seed: 18, avoid: [{ r: 12, x: CAMP[0], z: CAMP[1] }, { r: 6, x: 12.5, z: -5.5 }], props: { kind: 'palm', leaf: '#5f7a3a' } },
    { type: 'rock', count: 30, center: [0, -60], ring: [40, 220], spacing: 12, seed: 10, avoid: [{ rect: [3, -120, 30, 220] }], props: {} },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.65,
      hoodChance: 0.35,
    },
    groups: column.groups,
  },

  figures: [
    { x: ALMA[0], z: ALMA[1], face: [-14, 0], robe: '#d8cdb5', mantle: '#8a6a44', skin: '#a87652', arms: 'out', scale: 1.04 },
  ],

  custom(ctx) {
    const r = rng(2020);

    for (let i = 0; i < 60; i++) {
      const a = r() * Math.PI * 2, d = 8 + Math.sqrt(r()) * 30;
      const x = VILLAGE[0] + Math.cos(a) * d * 1.3, z = VILLAGE[1] + Math.sin(a) * d;
      if (column.points.some(([px, pz]) => Math.hypot(px - x, pz - z) < 6)) continue;
      if (x > -16 || Math.hypot(x - 13, z - 3) < 9) continue;
      house(ctx, x, z, Math.atan2(VILLAGE[0] - x, VILLAGE[1] - z) + r.range(-0.3, 0.3), { w: r.range(4.5, 6.5), d: r.range(4, 5.5), h: r.range(2.4, 3), color: r.pick(['#b8986e', '#c4a47a', '#a8885e']), roof: r.pick(['#8a7046', '#9a7c4a', '#7a6040']), thatch: true });
    }
    field(ctx, 36, 8, 22, 18, 0.15, { color: '#b8a04a', ripe: '#d8c060', h: 1.3 });
    field(ctx, 32, -30, 20, 16, 0.1, { color: '#7a8a3a', ripe: '#c8b050', h: 1.7 });
    field(ctx, -56, 16, 18, 14, -0.3, { color: '#b8a04a', ripe: '#d8c060', h: 1.3 });

    campfire(ctx, CAMP[0], CAMP[1], { scale: 0.7, intensity: 0, flames: false });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + r.range(-0.2, 0.2);
      const d = r.range(2, 3.4);
      const x = CAMP[0] + Math.cos(a) * d, z = CAMP[1] + Math.sin(a) * d;
      sleeper(ctx, x, z, Math.atan2(Math.cos(a), Math.sin(a)) + r.range(-0.5, 0.5), { robe: r.pick(guardPalette.robes), mantle: r() < 0.5 ? r.pick(guardPalette.mantles) : undefined, skin: r.pick(guardPalette.skins), side: r.range(-0.5, 0.5) });
      if (r() < 0.7) spear(ctx, x + r.range(-0.7, 0.7), z + r.range(-0.7, 0.7), { lying: true, rot: r() * 6 });
      if (r() < 0.5) shield(ctx, x + r.range(-1, 1), z + r.range(-1, 1), { color: r.pick(['#8a3a26', '#6a4a2a', '#a8822a']) });
    }
    const posts = [[-16, 4], [-2, -6], [2, -14], [-22, -26], [14, -48], [-6, -42], [-12, 10]];
    for (const [x, z] of posts) {
      sleeper(ctx, x, z, r() * Math.PI * 2, { robe: r.pick(guardPalette.robes), mantle: r.pick(guardPalette.mantles), skin: r.pick(guardPalette.skins), side: r.range(-0.6, 0.6) });
      spear(ctx, x + 0.9, z + 0.3, { lying: true, rot: r() * 6 });
      if (r() < 0.5) shield(ctx, x - 0.8, z - 0.5, { color: '#8a3a26' });
    }

    const baskets = [[-14, -2], [-12, -4], [-17, -6], [-9, -12], [-2, -20]];
    for (const [x, z] of baskets) {
      for (let k = 0; k < 3; k++) {
        const bx = x + r.range(-1, 1), bz = z + r.range(-1, 1), y = ctx.heightAt(bx, bz);
        ctx.solid.add(new ctx.THREE.CylinderGeometry(0.32, 0.24, 0.45, 7), { position: [bx, y + 0.22, bz], color: '#a8844e' });
        ctx.solid.add(new ctx.THREE.ConeGeometry(0.3, 0.2, 7), { position: [bx, y + 0.54, bz], color: '#e0c060' });
      }
      jar(ctx, x + 1.4, z, { color: '#a86a44', scale: 1.2 });
    }

    tufts(ctx, { x0: -40, x1: 40, z0: -60, z1: 30, count: 900, colors: ['#7a8a48', '#8a8a4a', '#6a7a3e'], avoid: (x, z) => column.points.some(([px, pz]) => Math.abs(px - x) + Math.abs(pz - z) < 1.5) });

    const flocks = [[-4, -12, 2.6], [5, -40, 3.0], [8, -70, 3.1], [6, -102, 3.2], [0, -140, 3.3]];
    flocks.forEach(([x, z, heading], i) => flock(ctx, { x, z, radius: 5, count: 18, heading, spread: 0.5, kinds: ['sheep', 'sheep', 'goat', 'sheep', i % 2 ? 'goat' : 'cow'], seed: 80 + i, grazing: 0.15, avoid: (px, pz) => column.points.some(([qx, qz]) => Math.hypot(qx - px, qz - pz) < 0.8) }));
  },
};
