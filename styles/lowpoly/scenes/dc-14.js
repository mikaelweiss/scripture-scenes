// D&C 138: the spirit world. The Savior appears among the great congregation of the righteous dead and
// organizes messengers, who go out toward the spirits waiting in darkness to the north (-z).
// Symbolic setting: a pale luminous plain under a sea of cloud.
import { glowFigure, people } from './lib/dc-08-kit.js';

const CHRIST = [0, 0];
const DARK = [0, -230];

const robes = ['#f4f0e8', '#ece6da', '#e6e2d8', '#f8f4ec', '#ded8cc', '#efe9de', '#e2dcd2'];

const lanes = [-0.5, -0.2, 0.15, 0.45].flatMap((spread, li) =>
  Array.from({ length: 16 }, (_, i) => {
    const t = 12 + i * 8 + (li % 2) * 4;
    return [CHRIST[0] + Math.sin(spread) * t + Math.sin(i * 1.7 + li) * 0.8, CHRIST[1] - Math.cos(spread) * t];
  }),
);

// Placed through the kit so every spirit gets hair and a collar.
const congregation = {
  palette: {
    robes,
    mantles: ['#f6f2ea', '#e8e2d6', '#dcd4c6', '#f0ead8'],
    skins: ['#e0b896', '#c99a78', '#a87652', '#8a5a3c', '#e8c4a4'],
    mantleChance: 0.5,
    hoodChance: 0.15,
  },
  groups: [
    { count: 1700, center: CHRIST, ring: [7, 60], arc: [-0.15, Math.PI + 0.15], spacing: 0.95, face: CHRIST, children: 0.12, kneel: 0.12, seed: 1, avoid: [{ rect: [0, 30, 3.2, 50] }, { r: 4, x: 0, z: 14 }] },
    { count: 160, center: CHRIST, ring: [7, 24], arc: [Math.PI + 0.25, Math.PI * 2 - 0.25], spacing: 1.0, face: CHRIST, children: 0.1, seed: 2, avoid: lanes.map(([x, z]) => ({ r: 2.2, x, z })) },
    { count: lanes.length, points: lanes, face: DARK, children: 0, seed: 3 },
    {
      count: 420, center: DARK, ring: [8, 70], arc: [0.2, Math.PI - 0.2], spacing: 1.2, face: CHRIST, children: 0.1, seed: 4,
      palette: { robes: ['#5a5670', '#4a4660', '#625e78', '#3e3c52'], mantles: ['#3a384c', '#4e4a62'], skins: ['#8a7a80', '#9a8a88', '#7a6a70'], mantleChance: 0.5, hoodChance: 0.5 }, bonnets: false,
    },
  ],
};

export default {
  title: 'D&C 138: The redemption of the dead',
  seed: 138,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.5, 0.55, 0.4], color: '#ffe8c8', intensity: 2.0 },
  light: { sky: '#e8e4f4', ground: '#9a92b0', hemi: 1.15 },
  sky: { top: '#4a5698', horizon: '#f6e6d6', ground: '#e8e0f0', sunColor: '#fff6e4', glow: 1.0 },
  fog: { color: '#d6cfe2', near: 90, far: 560 },
  clouds: { count: 60, shadow: '#a8a4c8', lit: '#fff2e4', rim: '#ffffff', distance: [420, 900], altitude: [30, 140], hole: 0.0 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.84 },
  grade: { saturation: 1.05, contrast: 1.1, vignette: 0.38, shadowTint: '#3a3460', highlightTint: '#fff4e0' },
  shadow: { center: [0, 10], radius: 70 },

  player: { start: [0, 14], yaw: 0, pitch: 0.08, eye: 1.65, speed: 4 },

  terrain: {
    size: 900, segments: 160, seed: 21, hills: 10, bumps: 0.2,
    flats: [{ x: 0, z: 10, r: 60, falloff: 40, height: 0 }, { x: 0, z: 0, r: 4.5, falloff: 7, height: 1.2 }],
    colors: { ground: '#b8b0c8', groundAlt: '#aca4c0', grass: '#bab2cc', high: '#c8c0d6', rock: '#9a92b0' },
    patches: [
      { x: 0, z: 0, r: 14, color: '#f6ead6', strength: 0.6, rough: 0.3 },
      { x: DARK[0], z: DARK[1], r: 120, color: '#4a4866', strength: 0.85, rough: 0.4 },
      { x: 0, z: -110, r: 60, color: '#8a86a8', strength: 0.5, rough: 0.5 },
    ],
  },

  effects: [
    { type: 'beam', at: CHRIST, height: 300, radiusBottom: 4, radiusTop: 18, color: '#fff2d8', opacity: 0.4 },
    { type: 'beam', at: CHRIST, height: 300, radiusBottom: 2.2, radiusTop: 8, color: '#fffaf0', opacity: 0.3 },
    { type: 'ring', at: CHRIST, lift: 0.05, radius: 4.5, width: 1.4, color: '#ffe8b8', opacity: 0.7 },
    { type: 'motes', at: CHRIST, radius: 8, height: 40, count: 260 },
    { type: 'motes', at: [0, -60], radius: 30, height: 20, count: 160, color: '#fff2e0', seed: 8 },
  ],

  custom(ctx) {
    const { palette, groups } = congregation;
    people(ctx, groups.map((g) => ({ palette, hats: false, ...g })));
    glowFigure(ctx, {
      x: CHRIST[0], z: CHRIST[1], face: [0, 40], scale: 1.3, emissive: 0.1, arms: 'out', robe: '#fffaf0', skin: '#e6caa8',
      light: { color: '#fff0d4', intensity: 8, distance: 20, dz: 1.5 },
      halo: { size: 4.5, opacity: 0.2, color: '#fff3d6' },
    });
    // Each messenger carries a small light out toward the darkness.
    for (const [x, z] of lanes) {
      const y = ctx.heightAt(x, z);
      ctx.glow.add(new ctx.THREE.OctahedronGeometry(0.09, 0), { position: [x + 0.25, y + 1.25, z - 0.2], color: '#ffe6a8' });
    }
    for (let i = 0; i < lanes.length; i += 4) {
      const [x, z] = lanes[i];
      ctx.effects.halo({ position: [x, ctx.heightAt(x, z) + 1.3, z], size: 2.2, opacity: 0.35, color: '#fff0c8' });
    }
  },
};
