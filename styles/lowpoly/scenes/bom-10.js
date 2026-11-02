// 2 Nephi 1-4: Lehi, old and near death, gathers his sons, their families and the sons of Ishmael before his tent
// in the promised land and blesses them one by one. Late afternoon; Lehi stands at the center of the camp.
import { tent, campfire, field, herd, provisions, fruitTree } from './lib/bom-07-camp.js';

const LEHI = [0, -10];
const TENT = [0, -15.5];

const tents = Array.from({ length: 11 }, (_, i) => {
  const a = Math.PI * (1.12 + (i / 10) * 0.76) + (i % 2 ? 0.04 : -0.04);
  const r = 24 + (i % 3) * 3;
  return [LEHI[0] + Math.cos(a) * r, LEHI[1] + 6 + Math.sin(a) * r, -a - Math.PI / 2];
});

export default {
  title: '2 Nephi 1-4: Lehi blesses his family',
  seed: 10,
  fov: 58,
  exposure: 1.05,

  sun: { direction: [-0.85, 0.24, 0.3], color: '#ffc88a', intensity: 3.0 },
  light: { sky: '#9ab0d8', ground: '#6a5236', hemi: 1.0 },
  sky: { top: '#4a6aa0', horizon: '#f4c890', ground: '#d8b088', sunColor: '#ffe0a8', glow: 1.3 },
  fog: { color: '#e0c4a0', near: 80, far: 520 },
  clouds: { count: 45, shadow: '#7a7088', lit: '#ffd8a0', rim: '#fff4d8', distance: [260, 900], altitude: [100, 220], hole: 0.25 },
  mountains: { count: 44, color: '#4e5a50', radius: [500, 720], height: [40, 110], haze: 0.42 },
  bloom: { strength: 0.45, radius: 0.55, threshold: 0.84 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.38, shadowTint: '#30285e', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -6], radius: 45 },

  player: { start: [1.5, 6], yaw: 0.06, pitch: -0.02, eye: 1.65, speed: 4.2 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 23,
    hills: 40,
    bumps: 0.3,
    flats: [{ x: 0, z: -6, r: 50, falloff: 40, height: 0.2 }],
    colors: { ground: '#7e8a48', groundAlt: '#6c7c40', grass: '#5c7a38', high: '#76784e', rock: '#7a6e5c' },
    patches: [{ x: LEHI[0], z: LEHI[1] + 4, r: 16, color: '#9a8458', strength: 0.6, rough: 0.5 }],
  },

  objects: [
    { type: 'steppedPyramid', x: LEHI[0], z: LEHI[1], w: 3.2, d: 3.2, tiers: 1, tierHeight: 0.4, inset: 0.4, stairWidth: 1.4, color: '#9a8a70', trim: '#7a6a54' },
  ],

  scatter: [
    { type: 'tree', count: 120, center: [0, -6], ring: [60, 280], spacing: 7, seed: 8, props: { kind: 'broad', leaf: '#4f7432' } },
    { type: 'rock', count: 25, center: [0, -6], ring: [50, 260], spacing: 12, seed: 10, props: { color: '#857a6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#7a3a2a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.35,
    },
    groups: [
      { count: 26, center: LEHI, ring: [3.4, 7.5], arc: [0.2, Math.PI - 0.2], spacing: 1.0, face: LEHI, children: 0.2, kneel: 0.35, seed: 101, avoid: [{ rect: [LEHI[0], LEHI[1] + 6, 2.4, 12] }, { rect: [LEHI[0], LEHI[1], 3.6, 3.6] }] },
      { count: 30, center: LEHI, ring: [7.5, 12], arc: [0.05, Math.PI - 0.05], spacing: 1.15, face: LEHI, children: 0.35, kneel: 0.1, seed: 102, avoid: [{ rect: [LEHI[0], LEHI[1] + 6, 2.4, 12] }, { rect: [1.5, 6, 3, 3] }] },
      { count: 6, center: [-16, -2], ring: [1, 4], spacing: 1.2, face: LEHI, children: 0.6, seed: 103 },
    ],
  },

  figures: [
    { x: LEHI[0], z: LEHI[1], face: [0, 10], scale: 0.97, robe: '#e8e2d4', mantle: '#b8b0a0', skin: '#b08a6a', arms: 'out', hood: true, light: { color: '#ffe0b0', intensity: 6, distance: 10 } },
  ],

  custom(ctx) {
    const { THREE, scene, heightAt, rand } = ctx;
    tent(ctx, { x: TENT[0], z: TENT[1], rot: 0, w: 6, d: 7, h: 3.4, color: '#4e3e32' });
    for (const [x, z, rot] of tents) tent(ctx, { x, z, rot, color: rand.pick(['#5b4a3c', '#4a3a30', '#6b5a48', '#5a4a40']) });
    campfire(ctx, { x: 7, z: -6, light: 8 });
    campfire(ctx, { x: -14, z: 4, light: 6 });
    provisions(ctx, { x: 5, z: -14, count: 6 });
    provisions(ctx, { x: -6, z: -15, count: 5 });

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.1, 5), new THREE.MeshLambertMaterial({ color: '#6a4a30' }));
    staff.position.set(LEHI[0] + 0.52, heightAt(...LEHI) + 1.3, LEHI[1] + 0.25);
    staff.rotation.z = -0.12;
    scene.add(staff);

    field(ctx, { x: 46, z: -30, w: 30, d: 20, rot: 0.3, rows: 12, sprout: '#9ab04a' });
    field(ctx, { x: -48, z: -26, w: 26, d: 18, rot: -0.2, rows: 10, sprout: '#b0b84a' });
    herd(ctx, { center: [38, 14], radius: 8, count: 7, kinds: ['goat', 'sheep', 'sheep'] });
    herd(ctx, { center: [-40, 18], radius: 6, count: 3, kinds: ['cow', 'ox'] });
    for (const [x, z] of [[-30, -38], [26, -40], [-12, -42], [40, 6], [-38, 0]]) fruitTree(ctx, { x, z, fruit: rand.pick(['#e08a2a', '#d84a2a']) });

    for (let i = 0; i < 70; i++) {
      const x = rand.range(-70, 70), z = rand.range(-60, 50);
      if (Math.hypot(x - LEHI[0], z - LEHI[1]) < 30) continue;
      const s = rand.range(0.3, 0.7);
      ctx.solid.add(new THREE.IcosahedronGeometry(s, 0), { position: [x, heightAt(x, z) + s * 0.3, z], scale: [1.3, 0.7, 1.1], rotation: [0, rand() * 3, 0], color: rand.pick(['#4f7432', '#5a7a3a', '#6a7a3a']), jitter: 0.1 });
    }
  },
};
