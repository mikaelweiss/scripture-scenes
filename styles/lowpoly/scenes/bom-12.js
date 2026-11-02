// Jacob 2: Jacob, consecrated a priest by Nephi, stands at the temple and warns the people of the city of Nephi
// against pride, costly apparel and the love of riches. The people fill the court and the temple steps.
import { solomonTemple, house } from './lib/bom-07-temple.js';

const TEMPLE = [0, -40];
const JACOB = [0, -24.2];
const START = [-12, 0];

export default {
  title: 'Jacob 2: Jacob teaches at the temple',
  seed: 12,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.6, 0.45, 0.55], color: '#ffdcae', intensity: 2.9 },
  light: { sky: '#a0b4d8', ground: '#7a6448', hemi: 1.0 },
  sky: { top: '#4a74b0', horizon: '#ecd8b8', ground: '#d0c0a0', sunColor: '#fff0cc', glow: 1.0 },
  fog: { color: '#dccfb8', near: 90, far: 540 },
  clouds: { count: 50, shadow: '#9a98a8', lit: '#fff0d8', rim: '#ffffff', distance: [280, 900], altitude: [110, 230], hole: 0.3 },
  mountains: { count: 46, color: '#4a5a4c', radius: [480, 720], height: [60, 170], haze: 0.32 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.08, contrast: 1.07, vignette: 0.36, shadowTint: '#2a3050', highlightTint: '#ffeccc' },
  shadow: { center: [0, -25], radius: 60 },

  player: { start: START, yaw: -0.44, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 17,
    hills: 44,
    bumps: 0.2,
    flats: [{ x: 0, z: -20, r: 120, falloff: 60, height: 0 }],
    colors: { ground: '#8a8a58', groundAlt: '#7a7e4e', grass: '#6c7c44', high: '#76784e', rock: '#7a6e5c' },
    patches: [{ x: TEMPLE[0], z: TEMPLE[1] - 2, r: 62, color: '#c4b48e', strength: 0.85, rough: 0.15 }],
  },

  scatter: [
    { type: 'tree', count: 90, center: [0, -20], ring: [150, 330], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#4f7432' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#6b6f4a', '#d8cdb5', '#6a2a5a', '#8a2a2a', '#c8a040', '#3a4a7a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#7a2a6a', '#b88a2a', '#2a3a6a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.3,
    },
    groups: [
      {
        count: 40, center: [0, -14], ring: [0, 9], arc: [-Math.PI, Math.PI], spacing: 1.1, face: JACOB, children: 0.15, onStructures: true, seed: 121,
        avoid: [{ rect: [0, -4, 7.5, 7.5] }, { rect: [0, -14.5, 3, 6] }, { rect: [0, -25.5, 30, 12] }, { rect: [-6, -12, 3.2, 30, -0.464] }],
      },
      {
        count: 330, center: JACOB, ring: [13, 44], arc: [0.35, Math.PI - 0.35], spacing: 1.0, face: JACOB, children: 0.22, kneel: 0.08, seed: 122,
        avoid: [{ rect: [0, -4, 9, 9] }, { rect: [14, -11, 10, 10] }, { rect: [-6, -12, 3.2, 30, -0.464] }, { rect: [0, 10, 200, 8] }, { rect: [33, 0, 4, 120] }, { rect: [-33, 0, 4, 120] }],
      },
    ],
  },

  figures: [
    { x: JACOB[0], z: JACOB[1], face: [0, 20], scale: 1.1, robe: '#ece4d2', mantle: '#5a4a3a', skin: '#9b6a46', arms: 'out', light: { color: '#fff0d8', intensity: 10, distance: 9 } },
  ],

  custom(ctx) {
    const { rand } = ctx;
    solomonTemple(ctx, { x: TEMPLE[0], z: TEMPLE[1], progress: 1, stone: '#d8caa8', trim: '#ac956e' });
    for (let gx = -8; gx <= 8; gx++) {
      for (let gz = -8; gz <= 7; gz++) {
        const x = gx * 15 + rand.range(-3, 3), z = gz * 15 - 15 + rand.range(-3, 3);
        if (Math.abs(x) < 40 && z > -95 && z < 16) continue;
        if (Math.hypot(x, z + 20) > 140 || rand() < 0.3) continue;
        const rot = Math.round(rand() * 4) * (Math.PI / 2) + rand.range(-0.08, 0.08);
        house(ctx, { x, z, rot, w: rand.range(5, 9), d: rand.range(4.5, 7), h: rand.range(2.8, 4.2), color: rand.pick(['#c8b08a', '#d0bc98', '#bca480', '#c4ae8e']) });
      }
    }
  },
};
