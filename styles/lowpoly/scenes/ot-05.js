// Genesis 8:18-9:17: the ark at rest on the mountains of Ararat. Noah's household gathers at his altar
// while the animals go out, and the bow stands in the cloud. The sun is behind the walker, so the bow faces them.
import { ark } from './lib/ot-01-ark.js';
import { animal } from './lib/ot-01-animals.js';
import { rainbow, fire, birds, water } from './lib/ot-01-kit.js';

const ARK = [-4, -70];
const ALTAR = [2, -14];

export default {
  title: 'Genesis 8:18-9:17: The rainbow',
  seed: 505,
  fov: 62,
  exposure: 1.15,

  sun: { direction: [0.35, 0.42, 0.84], color: '#fff0d4', intensity: 3.2 },
  light: { sky: '#a6bce0', ground: '#56603e', hemi: 1.3 },
  sky: { top: '#3e6aa8', horizon: '#dfe4e2', ground: '#8a9a88', sunColor: '#fff4dc', glow: 0.8 },
  fog: { color: '#c4ccc8', near: 110, far: 650 },
  clouds: { count: 45, seed: 21, shadow: '#5a6074', lit: '#f4f0e6', rim: '#ffffff', distance: [340, 900], altitude: [90, 230], hole: 0.35 },
  mountains: { count: 50, seed: 8, color: '#6a7078', radius: [430, 680], height: [90, 220], haze: 0.4 },
  bloom: { strength: 0.5, radius: 0.55, threshold: 0.85 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.38, shadowTint: '#283850', highlightTint: '#fff2dc' },
  shadow: { center: [0, -35], radius: 80 },

  player: { start: [5, 1], yaw: 0.06, pitch: 0.2, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 57,
    hills: 60,
    hillScale: 0.005,
    bumps: 0.6,
    flats: [
      { x: 0, z: -20, r: 45, falloff: 40, height: 0 },
      { x: ARK[0], z: ARK[1], r: 34, falloff: 30, height: 4 },
      { x: 270, z: -80, r: 120, falloff: 60, height: -30 },
      { x: -290, z: 20, r: 110, falloff: 60, height: -26 },
    ],
    colors: { ground: '#5f7a3c', groundAlt: '#6b8642', grass: '#6f8f46', high: '#7c7a68', rock: '#76726a' },
    patches: [
      { x: ALTAR[0], z: ALTAR[1], r: 7, color: '#7a6a52', strength: 0.6, rough: 0.5 },
      { x: ARK[0], z: ARK[1], r: 30, color: '#6a6a58', strength: 0.6, rough: 0.6 },
      { x: 270, z: -80, r: 170, color: '#7a7058', strength: 0.6, rough: 0.4 },
    ],
  },

  scatter: [
    { type: 'rock', count: 50, center: [0, -30], ring: [30, 200], spacing: 10, seed: 3, props: { color: '#7a7268' }, avoid: [{ r: 40, x: ARK[0], z: ARK[1] }, { r: 22, x: 4, z: 0 }] },
    { type: 'tree', count: 40, center: [0, -30], ring: [70, 260], spacing: 10, seed: 4, props: { kind: 'burnt' } },
    { type: 'tree', count: 14, center: [0, -10], ring: [40, 120], spacing: 12, seed: 5, props: { kind: 'broad', leaf: '#5a8a3c', h: 4 } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.5,
    },
    groups: [
      { count: 7, points: [[-1.5, -10.5], [0, -9.5], [2.5, -9.2], [5, -10], [6.4, -12], [-2.8, -12.5], [4.2, -8.6]], face: ALTAR, kneel: 0.6, children: 0, seed: 8 },
    ],
  },

  figures: [
    { x: ALTAR[0] - 2.4, z: ALTAR[1] - 1.4, face: [ALTAR[0] + 3, ALTAR[1] + 8], robe: '#e2dccb', mantle: '#8a6a48', skin: '#a8744e', arms: 'out', scale: 1.05 },
  ],

  effects: [
    { type: 'sunShafts', center: [0, -150], count: 6, spread: 120, length: 500, width: [10, 24], opacity: 0.05, color: '#fff4dc' },
  ],

  custom(ctx) {
    const { THREE, solid } = ctx;
    const r = ctx.rand;
    water(ctx, { level: -14, size: 1100, segments: 120, color: '#4d7f92', amp: 0.25 });

    const ay = Math.min(...[[-38, 0], [38, 0], [0, -7], [0, 7], [0, 0]].map(([dx, dz]) => ctx.heightAt(ARK[0] + dx, ARK[1] + dz))) - 0.6;
    ark(ctx, { x: ARK[0], z: ARK[1], y: ay, rot: 0.12, L: 80, W: 14, H: 11, built: 1, tilt: [0.02, 0.03], doorAt: 6, rampLen: 18 });
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = r.range(6, 9);
      const x = ARK[0] + Math.cos(a) * 42 * r.range(0.6, 1), z = ARK[1] + Math.sin(a) * d;
      ctx.builders.rock(ctx, { x, z, size: r.range(1.5, 3.2), color: '#6e6a62' });
    }

    // Noah's altar of unhewn stones with the burnt offering.
    const [ax, az] = ALTAR;
    const gy = ctx.heightAt(ax, az);
    for (let k = 0; k < 4; k++) {
      for (let i = 0; i < 6 - k; i++) {
        const a = (i / (6 - k)) * Math.PI * 2 + k;
        const rad = 1.2 - k * 0.25;
        solid.add(new THREE.DodecahedronGeometry(0.45, 0), { position: [ax + Math.cos(a) * rad, gy + 0.25 + k * 0.38, az + Math.sin(a) * rad], rotation: [r() * 3, r() * 3, 0], scale: [1.1, 0.75, 1], color: r.pick(['#8a8478', '#7a7468', '#9a9284']) });
      }
    }
    solid.box(1.4, 0.3, 1.4, { position: [ax, gy + 1.5, az], rotation: [0, 0.4, 0], color: '#6e685e' });
    ctx.colliders.add({ x: ax, z: az, w: 2.6, d: 2.6, bottom: gy, top: gy + 1.6 });
    fire(ctx, { position: [ax, gy + 1.65, az], size: 0.9, light: 14, smokeHeight: 40, seed: 5 });

    // Animals going forth from the ark, by pairs and families.
    const herd = [
      ['elephant', -16, -46, 2.6], ['elephant', -20, -44, 2.4, true],
      ['giraffe', 18, -46, -2.2], ['giraffe', 22, -44, -2.4, true],
      ['horse', -26, -30, 2.2], ['horse', -29, -27, 2.0, true],
      ['sheep', 9.5, -11, 2.5], ['sheep', 11, -9.5, 2.3, true], ['sheep', 12, -12.5, 2.7],
      ['deer', 30, -24, -2.6], ['deer', 33, -21, -2.4, true],
      ['camel', -38, -50, 1.6], ['camel', -42, -48, 1.8, true],
      ['lion', 34, -56, -1.4], ['lion', 37, -53, -1.2, true],
      ['ox', 4, -42, 3.0], ['ox', 8, -40, 2.8, true],
      ['goat', -5, -16, 2.2], ['goat', -3.5, -17.5, 2.0, true],
    ];
    for (const [kind, x, z, yaw, female] of herd) animal(ctx, { kind, x, z, yaw, female });
    birds(ctx, { center: [ALTAR[0], ALTAR[1] - 20], radius: 26, height: 24, count: 12, color: '#f6f2ea', speed: 6, seed: 2 });
    birds(ctx, { center: [-60, -120], radius: 60, height: 50, count: 16, color: '#2e2a28', speed: 8, seed: 7 });

    // Wet grass and early flowers.
    for (let i = 0; i < 700; i++) {
      const x = r.range(-60, 60), z = r.range(-60, 30);
      const y = ctx.heightAt(x, z);
      if (r() < 0.3) solid.add(new THREE.OctahedronGeometry(0.08, 0), { position: [x, y + 0.15, z], color: r.pick(['#f2f0ea', '#f4e46a', '#c58af0']) });
      else solid.add(new THREE.ConeGeometry(0.1, 0.32, 3), { position: [x, y + 0.12, z], rotation: [0, r() * 3, 0], color: '#5f8a3c', jitter: 0.14 });
    }

    rainbow(ctx, { center: [-10, -250], y: -40, radius: 170, width: 16, opacity: 0.6 });
  },
};
