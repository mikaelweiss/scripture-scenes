// Mosiah 22:7-11: Limhi's people slip out through the back pass of the city wall by night,
// with their flocks and herds, past Lamanite guards asleep with wine. -z is north, the city.
import { sleeper, flock, tent, campfire, jar, spear, shield, house, wallLine, stars, columnGroups, rng, yawTo, torch } from './lib/bom-19-kit.js';

const GATE = [0, -30];
const FIRE = [-12, -13];
const PATH = [[0, -36], [1, -24], [7, -17], [20, -15], [38, -17], [58, -21], [80, -24], [104, -22], [130, -14], [160, -2]];

const TORCHES = [[3.2, -21], [14, -15.4], [24, -15.6], [40, -17.6], [62, -21.6], [104, -22.4]];

const column = columnGroups(PATH, { width: 3.2, density: 1.25, spacing: 0.9, seed: 41, children: 0.25, skipNear: TORCHES.map(([x, z]) => [x, z, 1.4]) });
const inGate = columnGroups([[0, -46], [0, -33]], { width: 2, density: 1.4, spacing: 0.9, seed: 47 });

const guardPalette = {
  robes: ['#a8402a', '#b0703a', '#5a4a6a', '#8a8a5a', '#c89a5a', '#6a2a2a'],
  mantles: ['#2e2a26', '#5a2a1e', '#3e3a30'],
  skins: ['#6a4228', '#7a4c31', '#5e3a24'],
};

export default {
  title: "Mosiah 22:7-11: Limhi's people escape",
  seed: 19,
  fov: 60,
  exposure: 1.45,

  sun: { direction: [0.45, 0.6, 0.55], color: '#c4d4ff', intensity: 3.6 },
  light: { sky: '#6a82c4', ground: '#3a3440', hemi: 1.9 },
  sky: { top: '#081028', horizon: '#2c3d68', ground: '#18203a', sunColor: '#c8d4ff', glow: 0.15 },
  fog: { color: '#22305a', near: 60, far: 460 },
  clouds: { count: 14, shadow: '#1c2440', lit: '#5a6a96', rim: '#c8d4ff', distance: [500, 1000], altitude: [160, 300], hole: 0.2 },
  mountains: { count: 40, color: '#1e2436', radius: [480, 720], height: [60, 160], haze: 0.35 },
  bloom: { strength: 0.7, radius: 0.5, threshold: 0.7 },
  grade: { saturation: 1.0, contrast: 1.08, vignette: 0.5, shadowTint: '#0e1638', highlightTint: '#e4ecff' },
  shadow: { center: [10, -5], radius: 70 },

  player: { start: [33, -3.5], yaw: 0.98, pitch: -0.03, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 19,
    hills: 40,
    bumps: 0.4,
    flats: [{ x: 10, z: -20, r: 70, falloff: 50, height: 0 }],
    colors: { ground: '#6e5c44', groundAlt: '#5f5240', grass: '#4f5a36', high: '#5e5a4c', rock: '#4f4a44' },
    patches: [
      ...PATH.map(([x, z]) => ({ x, z, r: 9, color: '#8a7658', strength: 0.55, rough: 0.4 })),
      { x: FIRE[0], z: FIRE[1], r: 7, color: '#4a3e30', strength: 0.6, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: -36, z: -118, w: 30, d: 26, tiers: 5, tierHeight: 3.2, inset: 2.4, stairWidth: 6, color: '#8f7c62', trim: '#6c5c48', shrine: { w: 8, d: 6, h: 4, roof: '#4a3c2e' } },
  ],

  scatter: [
    { type: 'tree', count: 60, center: [40, 40], ring: [40, 260], spacing: 7, seed: 8, avoid: [{ rect: [60, 0, 220, 40] }, { rect: [0, -60, 300, 70] }, { r: 5, x: 33, z: -3.5 }, { rect: [10, -6, 50, 22] }], props: { kind: 'broad', leaf: '#3c5230' } },
    { type: 'rock', count: 50, center: [-10, 20], ring: [6, 60], spacing: 5, seed: 12, avoid: [{ r: 3, x: 33, z: -3.5 }, { rect: [60, -18, 200, 14] }], props: { size: 0.6, color: '#7a6e60' } },
    { type: 'tree', count: 14, center: [-30, 10], ring: [10, 50], spacing: 6, seed: 14, avoid: [{ r: 5, x: 33, z: -3.5 }, { rect: [10, -6, 50, 22] }, { r: 9, x: FIRE[0], z: FIRE[1] }, { rect: [0, -40, 300, 20] }], props: { kind: 'broad', leaf: '#3c5230' } },
    { type: 'rock', count: 40, center: [100, -30], ring: [30, 200], spacing: 10, seed: 10, avoid: [{ rect: [70, -10, 200, 30, 0.25] }, { rect: [0, -60, 300, 70] }], props: { color: '#6a6258' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#6b6f4a', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.75,
      hoodChance: 0.55,
    },
    groups: [...column.groups, ...inGate.groups],
  },

  figures: [
    { x: 4.5, z: -27.5, face: [30, -10], robe: '#5e4b3a', mantle: '#3f4d5e', skin: '#9b6a46', arms: 'out', hood: true },
    ...TORCHES.map(([x, z], i) => ({ x, z, face: [x + 20, z - 1], robe: ['#a0825c', '#6e5a44', '#b59a72'][i % 3], mantle: ['#5a3d2b', '#3f4d5e', '#7d5c3e'][i % 3], skin: '#9b6a46', hood: i % 2 === 0 })),
  ],

  custom(ctx) {
    const r = rng(1919);
    stars(ctx, { count: 1600, size: 1.4 });
    const moon = new ctx.THREE.Mesh(new ctx.THREE.IcosahedronGeometry(22, 1), new ctx.THREE.MeshBasicMaterial({ color: '#eef2ff', fog: false, toneMapped: false }));
    moon.position.set(660, 250, -260);
    ctx.scene.add(moon);
    ctx.effects.halo({ position: [660, 250, -260], size: 260, color: '#b8c8ff', opacity: 0.35 });
    ctx.onFrame((t, dt, camera) => {
      moon.position.set(camera.position.x + 660, camera.position.y + 250, camera.position.z - 260);
    });

    wallLine(ctx, [[-150, -12], [-80, -28], [-3, -31]], { h: 5, thick: 1.6, color: '#8a7860' });
    wallLine(ctx, [[3, -31], [80, -28], [150, -12]], { h: 5, thick: 1.6, color: '#8a7860' });
    for (const sx of [-3.6, 3.6]) {
      const y = ctx.heightAt(sx, -31) - 0.5;
      ctx.solid.box(2.4, 6.6, 2.6, { position: [sx, y + 3.3, -31], color: '#7e6c56', shade: (c, ny) => ny < -0.5 && c.multiplyScalar(0.55) });
      ctx.colliders.add({ x: sx, z: -31, w: 2.4, d: 2.6, bottom: y, top: y + 6.6 });
    }
    ctx.solid.box(9.6, 1, 2.6, { position: [0, ctx.heightAt(0, -31) + 5.6, -31], color: '#76654f' });

    for (let i = 0; i < 70; i++) {
      const x = r.range(-130, 130), z = r.range(-44, -150);
      if (Math.abs(x) < 10 && z > -60) continue;
      if (Math.hypot(x + 36, z + 118) < 26) continue;
      house(ctx, x, z, r.range(-0.3, 0.3), { w: r.range(4, 7), d: r.range(4, 6), h: r.range(2.4, 3.2), color: '#9a8466', roof: '#5a4a34', thatch: r() < 0.6 });
    }

    for (const [x, z] of TORCHES) torch(ctx, x + 0.1, z + 0.38, { rot: Math.PI / 2 });

    campfire(ctx, FIRE[0], FIRE[1], { scale: 0.8, intensity: 55, distance: 20 });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + r.range(-0.2, 0.2);
      const d = r.range(2.2, 3.4);
      const x = FIRE[0] + Math.cos(a) * d, z = FIRE[1] + Math.sin(a) * d;
      sleeper(ctx, x, z, Math.atan2(Math.cos(a), Math.sin(a)) + r.range(-0.6, 0.6), { robe: r.pick(guardPalette.robes), mantle: r() < 0.5 ? r.pick(guardPalette.mantles) : undefined, skin: r.pick(guardPalette.skins), side: r.range(-0.5, 0.5) });
      if (r() < 0.7) jar(ctx, x + r.range(-0.8, 0.8), z + r.range(-0.8, 0.8), { tipped: r() < 0.6, rot: r() * 6 });
      if (r() < 0.6) spear(ctx, x + r.range(-0.6, 0.6), z + r.range(-0.6, 0.6), { lying: true, rot: r() * 6 });
      if (r() < 0.4) shield(ctx, x + r.range(-1, 1), z + r.range(-1, 1), { color: r.pick(['#8a3a26', '#6a4a2a', '#a8822a']) });
    }
    for (let i = 0; i < 7; i++) jar(ctx, FIRE[0] - 5.2 + i * 0.45, FIRE[1] - 3.5 + (i % 2) * 0.4, { color: i % 3 ? '#9a5a38' : '#7c4a30', scale: 1.4 });
    tent(ctx, FIRE[0] - 7, FIRE[1] - 8, 0.6, { color: '#7a6448', size: 3.6 });
    tent(ctx, FIRE[0] + 2, FIRE[1] - 10, 0.2, { color: '#6e5a40', size: 3 });
    for (let i = 0; i < 6; i++) spear(ctx, FIRE[0] - 3 + i * 0.25, FIRE[1] - 5, { len: 2.6 });

    for (let i = 0; i < 900; i++) {
      const x = r.range(-70, 60), z = r.range(-26, 50);
      if (Math.hypot(x - FIRE[0], z - FIRE[1]) < 5) continue;
      const col = r.pick(['#5a6a3a', '#6e6a42', '#4e5a36']);
      for (let k = 0; k < 4; k++) {
        const h = r.range(0.3, 0.6);
        ctx.solid.add(new ctx.THREE.ConeGeometry(0.05, h, 3), { position: [x + r.range(-0.15, 0.15), ctx.heightAt(x, z) + h / 2 - 0.05, z + r.range(-0.15, 0.15)], rotation: [r.range(-0.4, 0.4), r() * 3, r.range(-0.4, 0.4)], color: col, jitter: 0.1 });
      }
    }

    const flocks = [[10, -12, 1.4], [26, -12, 1.6], [46, -15, 1.7], [68, -19, 1.6], [92, -20, 1.5], [118, -15, 1.2]];
    flocks.forEach(([x, z, heading], i) => flock(ctx, { x, z, radius: 4.5, count: 14, heading, spread: 0.5, kinds: i % 2 ? ['sheep', 'sheep', 'goat'] : ['sheep', 'cow', 'goat'], seed: 70 + i, grazing: 0.1, avoid: (px, pz) => column.points.some(([qx, qz]) => Math.hypot(qx - px, qz - pz) < 0.8) }));
  },
};
