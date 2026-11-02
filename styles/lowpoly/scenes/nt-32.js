// Acts 9:1-9. Noon on the road north to Damascus: a light from heaven brighter than the sun.
// Saul lies on the road, his companions stand speechless, horses shy. -z is north toward Damascus.
import { road, town, cityWall, horse, figure } from './lib/nt-32-kit.js';

const SAUL = [1.2, -9.4];
const LIGHT = [0.2, -15];

const companions = [
  [-3.2, -6.5], [-4.4, -8.8], [3.8, -6.2], [4.6, -9.4], [-2.4, -4.2], [-1.8, -2.6], [-5.6, -11.5],
];

export default {
  title: 'Acts 9:1-9: Saul on the road to Damascus',
  seed: 32,
  fov: 62,
  exposure: 0.98,

  sun: { direction: [0.25, 0.92, 0.3], color: '#fff2d8', intensity: 2.6 },
  light: { sky: '#cfe0ff', ground: '#8a7458', hemi: 1.0 },
  sky: { top: '#6d93cc', horizon: '#f4ead2', ground: '#d8c6a4', sunColor: '#fff6e0', glow: 1.6 },
  fog: { color: '#e2cfae', near: 120, far: 750 },
  clouds: { count: 22, shadow: '#b8b0a4', lit: '#fffaf0', rim: '#ffffff', distance: [400, 900], altitude: [120, 260], hole: 0.1 },
  mountains: { count: 40, color: '#8c7c68', radius: [480, 720], height: [40, 130], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.86 },
  grade: { saturation: 1.0, contrast: 1.04, vignette: 0.3, shadowTint: '#4a4060', highlightTint: '#fff2d0' },
  shadow: { center: [0, -6], radius: 50 },

  player: { start: [0.7, -3.4], yaw: -0.06, pitch: 0.08, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 32,
    hills: 34,
    bumps: 0.45,
    flats: [
      { x: 0, z: -10, r: 30, falloff: 40, height: 0 },
      { x: 0, z: -280, r: 70, falloff: 60, height: -2 },
    ],
    colors: { ground: '#b8966a', groundAlt: '#a4825a', grass: '#9a9058', high: '#a89070', rock: '#8e7a62' },
    patches: [{ x: 0, z: -10, r: 9, color: '#e6d2a4', strength: 0.4, rough: 0.3 }],
  },

  objects: [],

  scatter: [
    { type: 'rock', count: 70, center: [0, -20], ring: [12, 260], spacing: 7, seed: 321, avoid: [{ rect: [0, -120, 12, 300] }], props: { color: '#9a8468' } },
    { type: 'rubble', count: 40, center: [0, -10], ring: [7, 60], seed: 322, avoid: [{ rect: [0, -20, 7, 120] }], props: { radius: 2, count: 5, size: [0.1, 0.3], color: '#a08a6c' } },
    { type: 'tree', count: 26, center: [0, -10], ring: [30, 200], spacing: 16, seed: 323, avoid: [{ rect: [0, -120, 14, 300] }], props: { kind: 'broad', h: 3.5, leaf: '#76804a' } },
    { type: 'tree', count: 30, center: [0, -280], ring: [70, 130], spacing: 9, seed: 324, props: { kind: 'palm', leaf: '#6a7c40' } },
  ],

  crowd: {
    palette: {
      robes: ['#7a5a3e', '#8f7454', '#5e4b3a', '#a08060', '#6a4e3a', '#4f4a44'],
      mantles: ['#3f3328', '#6d3b2e', '#4a5560', '#5a4a3a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.8,
      hoodChance: 0.5,
    },
    groups: [{ count: companions.length, points: companions, face: LIGHT, children: 0, seed: 325 }],
  },

  figures: [],

  effects: [
    { type: 'beam', at: LIGHT, height: 320, radiusBottom: 3.2, radiusTop: 34, color: '#fff6e0', opacity: 0.55 },
    { type: 'beam', at: LIGHT, height: 320, radiusBottom: 1.6, radiusTop: 14, color: '#ffffff', opacity: 0.45 },
    { type: 'ring', at: LIGHT, lift: 0.06, radius: 3.4, width: 2.4, color: '#fff1c8', opacity: 0.4 },
    { type: 'motes', at: LIGHT, radius: 7, height: 50, count: 260, color: '#fffae8' },
  ],

  custom(ctx) {
    road(ctx, { path: [[1, 60], [0, 20], [0.5, -10], [-2, -60], [2, -140], [0, -230]], width: 4, color: '#d6c29a' });
    town(ctx, { center: [0, -300], radius: 55, count: 45, seed: 326, colors: ['#d8c8a6', '#cbb68e', '#e0d2b2'], height: [3, 8] });
    cityWall(ctx, { points: [[-70, -236], [70, -236], [80, -330], [-80, -330], [-70, -236]], h: 9, color: '#c8b28a', gaps: [{ x: 0, z: -236, r: 5 }] });

    figure(ctx, { x: SAUL[0], z: SAUL[1], face: [LIGHT[0] - 6, SAUL[1] - 1.5], pose: 'prostrate', robe: '#9a2e26', mantle: '#4a5a72', arms: 'out' });
    horse(ctx, { x: -6.5, z: -3.5, rot: 2.6, color: '#7a5638' });
    horse(ctx, { x: 7.2, z: -12.5, rot: -1.2, color: '#4e3828' });
    horse(ctx, { x: 9.5, z: 0.5, rot: 0.8, color: '#9a7a5a' });
    ctx.solid.box(0.6, 0.3, 0.45, { position: [-1.4, ctx.heightAt(-1.4, -8.4) + 0.12, -8.4], rotation: [0.1, 0.5, 0.2], color: '#7a5a3a' });
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), { position: [1.6, ctx.heightAt(1.6, -7.6) + 0.05, -7.6], rotation: [0, 0.4, Math.PI / 2], color: '#e8dcc0' });

    ctx.effects.ring({ position: [SAUL[0], ctx.heightAt(...SAUL) + 0.05, SAUL[1]], radius: 1.6, width: 1.2, color: '#fff1c8', opacity: 0.3 });
    ctx.effects.halo({ position: [LIGHT[0], 110, LIGHT[1] - 30], size: 110, opacity: 0.6, color: '#fffbea' });
    const pl = new ctx.THREE.PointLight('#fff4dc', 26, 30, 1.3);
    pl.position.set(LIGHT[0], 8, LIGHT[1]);
    ctx.scene.add(pl);
  },
};
