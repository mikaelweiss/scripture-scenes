// Mosiah 27:10-19: on a road outside Zarahemla an angel descends as in a cloud, speaks with a voice
// of thunder, the earth shakes, and Alma and the four sons of Mosiah fall to the earth. -z is north.
import { sleeper, house, cloud, tremor, tufts, rng } from './lib/bom-19-kit.js';

const ANGEL = [0, -20];
const MEN = [[0.4, -12.2, 2.9], [-2.6, -11, 2.5], [2.9, -10.6, -2.7], [-1.2, -9, 3.4], [1.9, -8.4, 2.2]];
const ROAD = [[6, 60], [3, 30], [0, 10], [0, -20], [-4, -60], [-12, -110], [-20, -170]];
const TOWN = [-30, -160];

export default {
  title: 'Mosiah 27:10-19: The angel appears to Alma the Younger',
  seed: 21,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.6, 0.35, 0.3], color: '#ffd2a0', intensity: 1.8 },
  light: { sky: '#8a96b8', ground: '#5a4a3c', hemi: 1.2 },
  sky: { top: '#2e3a5a', horizon: '#b8a898', ground: '#8a7a6a', sunColor: '#ffd8a8', glow: 0.6 },
  fog: { color: '#8e8a8a', near: 60, far: 480 },
  clouds: { count: 120, shadow: '#3a3a4a', lit: '#9a94a0', rim: '#f0e0c0', distance: [150, 800], altitude: [70, 180], hole: 0.05 },
  mountains: { count: 40, color: '#4e5060', radius: [480, 720], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.86 },
  grade: { saturation: 1.05, contrast: 1.1, vignette: 0.48, shadowTint: '#28264a', highlightTint: '#fff0d6' },
  shadow: { center: [0, -10], radius: 60 },

  player: { start: [3.5, -1.5], yaw: 0.16, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 21,
    hills: 30,
    bumps: 0.35,
    flats: [{ x: 0, z: -10, r: 50, falloff: 50, height: 0 }, { x: TOWN[0], z: TOWN[1], r: 50, falloff: 40, height: 0 }],
    colors: { ground: '#8a7a56', groundAlt: '#7a7050', grass: '#6a7a40', high: '#7a7060', rock: '#6a6058' },
    patches: [
      ...ROAD.map(([x, z]) => ({ x, z, r: 6, color: '#b8a07a', strength: 0.7, rough: 0.25 })),
      { x: 0, z: 18, r: 6, color: '#b8a07a', strength: 0.7, rough: 0.25 },
      { x: 1, z: -2, r: 6, color: '#b8a07a', strength: 0.7, rough: 0.25 },
      { x: -1, z: -38, r: 6, color: '#b8a07a', strength: 0.7, rough: 0.25 },
      { x: ANGEL[0], z: ANGEL[1] + 6, r: 9, color: '#c8b48a', strength: 0.5, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: TOWN[0] - 10, z: TOWN[1] + 6, rot: 1.2, w: 26, d: 24, tiers: 4, tierHeight: 3, inset: 2.4, stairWidth: 6, color: '#b8a284', trim: '#8c765c', shrine: { w: 7, d: 6, h: 4, roof: '#6a5644' } },
    { type: 'crack', path: [[-14, -6], [-6, -9], [0, -14], [5, -16], [14, -22], [26, -24]], width: 0.5, branches: 4 },
    { type: 'crack', path: [[-3, 3], [-1, -2], [2, -4], [3, -10]], width: 0.35, branches: 2 },
    { type: 'rubble', x: 6, z: -14, radius: 3, count: 8, size: [0.15, 0.35], color: '#9a8a70' },
  ],

  scatter: [
    { type: 'tree', count: 60, center: [0, -20], ring: [24, 220], spacing: 8, seed: 8, avoid: [{ rect: [0, -40, 22, 200] }, { r: 50, x: TOWN[0], z: TOWN[1] }], props: { kind: 'broad', leaf: '#4e6a34' } },
    { type: 'tree', count: 12, center: [0, -20], ring: [14, 40], spacing: 8, seed: 18, avoid: [{ rect: [0, -20, 16, 120] }], props: { kind: 'palm', leaf: '#56743a' } },
    { type: 'rock', count: 30, center: [0, -40], ring: [20, 200], spacing: 10, seed: 10, avoid: [{ rect: [0, -40, 22, 200] }, { r: 50, x: TOWN[0], z: TOWN[1] }], props: {} },
  ],

  figures: [
    {
      x: ANGEL[0], z: ANGEL[1], y: 3.3, face: [0, 10], scale: 1.4, robe: '#fbf8f0', mantle: '#f4eedf', skin: '#cdb59a', arms: 'out', emissive: 0.1,
      halo: { size: 6, opacity: 0.18, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'beam', at: ANGEL, height: 200, radiusBottom: 3.5, radiusTop: 12, color: '#fff1cf', opacity: 0.18 },
    { type: 'motes', at: ANGEL, radius: 5, height: 22, count: 160 },
    { type: 'ring', at: [0, -11], lift: 0.06, radius: 5, width: 1.8, color: '#ffe8b8', opacity: 0.35 },
    { type: 'sunShafts', center: [0, -60], count: 5, spread: 40, length: 400, width: [8, 18], opacity: 0.06 },
  ],

  custom(ctx) {
    const r = rng(2121);
    const robes = ['#6a2a3a', '#2e4a7a', '#7a4a1e', '#3e5a3a', '#8a6a3a'];
    const mantles = ['#c8a050', '#d8c8a0', '#a83a2a', '#4a3a6a', '#e0d0b0'];
    MEN.forEach(([x, z, rot], i) => sleeper(ctx, x, z, rot, { robe: robes[i], mantle: mantles[i], skin: r.pick(['#a87652', '#9b6a46', '#b5835e']), side: i === 0 ? 0 : r.range(-0.4, 0.4) }));
    for (const [x, z] of [[-3.5, -12.5], [4, -9], [-0.5, -6.5]]) {
      ctx.solid.add(new ctx.THREE.CylinderGeometry(0.03, 0.035, 1.6, 4), { position: [x, ctx.heightAt(x, z) + 0.05, z], rotation: [Math.PI / 2, r() * 6, 0], color: '#5a4030' });
    }

    const glow = new ctx.THREE.PointLight('#fff2d6', 40, 26, 1.4);
    glow.position.set(ANGEL[0], 2.4, ANGEL[1] + 7);
    ctx.scene.add(glow);
    cloud(ctx, ANGEL[0], 2.9, ANGEL[1], 2.0, { color: '#f4f0e8', emissive: 0.15, puffs: 10, seed: 5, flat: 0.3 });
    cloud(ctx, ANGEL[0] + 1.5, 1.8, ANGEL[1] - 1.5, 2.4, { color: '#ece6da', emissive: 0.1, puffs: 8, seed: 6, flat: 0.4 });
    cloud(ctx, ANGEL[0], 42, ANGEL[1] - 16, 9, { color: '#e8e2d8', emissive: 0.3, puffs: 10, seed: 7, flat: 0.4 });
    tremor(ctx, { amp: 0.05, every: 7, length: 2.4 });
    for (let i = 0; i < 40; i++) {
      const x = TOWN[0] + r.range(-30, 34), z = TOWN[1] + r.range(-36, 46);
      if (Math.hypot(x - TOWN[0] + 10, z - TOWN[1] - 6) < 20 || Math.abs(x - (-12 + (z + 110) * 0.13)) < 6) continue;
      house(ctx, x, z, r.range(-0.2, 0.2) + Math.PI / 2, { w: r.range(4, 7), d: r.range(4, 6), h: r.range(2.6, 3.4), color: r.pick(['#c8b08a', '#bca480', '#d0bc98']), roof: '#8a7050', thatch: r() < 0.4 });
    }

    tufts(ctx, { x0: -30, x1: 30, z0: -50, z1: 30, count: 700, avoid: (x, z) => Math.abs(x - (z > -20 ? 0 : (z + 20) * 0.1)) < 4 });
  },
};
