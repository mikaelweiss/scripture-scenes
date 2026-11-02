// Acts 1:9-11. The Ascension from the Mount of Olives: the eleven gaze up as a cloud receives the Lord,
// two men in white stand by them, and Jerusalem lies below across the Kidron to the northwest.
import { cityWall, temple, town, brightCloud, person } from './lib/nt-25-kit.js';

const CHRIST = [0, -7, 8.5];
const CITY = [-30, -250];

const apostles = Array.from({ length: 11 }, (_, i) => {
  const a = Math.PI * (0.15 + (i / 10) * 0.7);
  const r = 5.5 + (i % 2) * 1.6;
  return [Math.cos(a) * r, -3 + Math.sin(a) * r];
});

const cityRing = [
  [-90, -310], [20, -320], [40, -250], [30, -190], [-50, -180], [-100, -220], [-90, -310],
];

export default {
  title: 'Acts 1:9-11: The Ascension',
  seed: 27,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.4, 0.75, 0.5], color: '#fff0d8', intensity: 2.6 },
  light: { sky: '#a8c0e8', ground: '#7a6a50', hemi: 1.2 },
  sky: { top: '#3e6cb0', horizon: '#cfe0ee', ground: '#b8b098', sunColor: '#fff4d8', glow: 0.8 },
  fog: { color: '#c6d2dc', near: 90, far: 700 },
  clouds: { count: 50, shadow: '#9aa6bc', lit: '#ffffff', rim: '#ffffff', distance: [260, 900], altitude: [110, 260], hole: 0.1 },
  mountains: { count: 44, color: '#8a8a88', radius: [520, 760], height: [40, 110], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.82 },
  grade: { saturation: 1.08, contrast: 1.05, vignette: 0.35, shadowTint: '#2a3460', highlightTint: '#fff2d8' },
  shadow: { center: [0, 0], radius: 45 },

  player: { start: [3, 13], yaw: 0.1, pitch: 0.16, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 27,
    hills: 28,
    bumps: 0.3,
    flats: [
      { x: 0, z: 5, r: 16, falloff: 42, height: 22 },
      { x: CITY[0], z: CITY[1], r: 110, falloff: 90, height: -45 },
    ],
    colors: { ground: '#a89670', groundAlt: '#958660', grass: '#7c8448', high: '#9a8e6c', rock: '#857a66' },
    patches: [{ x: 0, z: 0, r: 16, color: '#9a8a64', strength: 0.5, rough: 0.5 }],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 70, center: [0, 0], ring: [16, 120], spacing: 7, seed: 81, avoid: [{ rect: [-10, -60, 40, 60] }], props: { kind: 'broad', leaf: '#7d8a62', h: 4.5 } },
    { type: 'tree', count: 50, center: [0, 0], ring: [120, 300], spacing: 10, seed: 82, avoid: [{ r: 110, x: CITY[0], z: CITY[1] }], props: { kind: 'broad', leaf: '#7a8660', h: 5 } },
    { type: 'rock', count: 40, center: [0, 0], ring: [10, 140], spacing: 8, seed: 83, props: { size: 1.2 } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#5e4b3a', '#94704e', '#6b6f4a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.8,
      hoodChance: 0.25,
    },
    groups: [{ count: apostles.length, points: apostles, face: [CHRIST[0], CHRIST[1]], children: 0, seed: 91 }],
  },

  figures: [
    { x: -5.5, z: 6, face: [0, 3], robe: '#fbf8f0', mantle: '#f2ecde', skin: '#c0a088', emissive: 0.3, halo: { size: 2.4, opacity: 0.3, color: '#fff6e0' } },
    { x: 6.2, z: 5.2, face: [0, 3], robe: '#fbf8f0', mantle: '#f2ecde', skin: '#c0a088', emissive: 0.3, halo: { size: 2.4, opacity: 0.3, color: '#fff6e0' } },
  ],

  effects: [
    { type: 'beam', position: [CHRIST[0], CHRIST[2] + 24, CHRIST[1] - 1], height: 300, radiusBottom: 3, radiusTop: 18, color: '#fff6e0', opacity: 0.35 },
    { type: 'motes', position: [CHRIST[0], 24, CHRIST[1]], radius: 7, height: 30, count: 140 },
    { type: 'halo', position: [CHRIST[0], CHRIST[2] + 23.3, CHRIST[1] - 0.5], size: 7, opacity: 0.35, color: '#fff3d6' },
  ],

  custom(ctx) {
    const [cx, cz, cy] = CHRIST;
    const ground = ctx.heightAt(cx, cz);
    person(ctx, { x: cx, z: cz, y: ground + cy, face: [3, 13], scale: 1.35, robe: '#fdfaf2', mantle: '#f6f0e2', skin: '#b08060', arms: 'out', emissive: 0.15, light: { color: '#fff0cf', intensity: 30, distance: 30 } });
    const cloud = brightCloud(ctx, { x: cx, y: ground + cy - 1.3, z: cz, size: 2.8, count: 11, seed: 5, glow: 0.25, color: '#f4f2ee' });
    ctx.onFrame((t) => {
      cloud.rotation.y = t * 0.05;
      cloud.position.y = ground + cy - 1.3 + Math.sin(t * 0.6) * 0.15;
    });
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2, r = 4.5 + (i % 3) * 0.8;
      const s = 0.25 + ctx.rand() * 0.35;
      const x = Math.cos(a) * r, z = -3 + Math.sin(a) * r;
      if (z > 1 && Math.abs(x) < 3) continue;
      ctx.solid.add(new ctx.THREE.DodecahedronGeometry(s, 0), { position: [x, ctx.heightAt(x, z) + s * 0.2, z], rotation: [ctx.rand(), ctx.rand(), 0], scale: [1.3, 0.6, 1], color: '#9a8c74', jitter: 0.1 });
    }

    cityWall(ctx, { points: cityRing, h: 10, thick: 3, color: '#cdb88e', gaps: [{ x: 35, z: -220, r: 6 }] });
    temple(ctx, { x: 0, z: -235, rot: -Math.PI / 2 + 0.2, s: 0.7 });
    town(ctx, { center: [-40, -250], radius: 60, count: 70, seed: 27, spacing: 8, size: [5, 9], height: [3, 6], avoid: [{ x: 0, z: -235, r: 50 }] });
    town(ctx, { center: [-60, -290], radius: 22, count: 12, seed: 28, spacing: 8, size: [5, 9], height: [3, 6] });
  },
};
