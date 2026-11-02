// 2 Kings 5:9-14: Naaman, captain of the host of Syria, dips himself seven times in the Jordan. His horses,
// chariot and servants wait on the south bank. The river runs east-west across the view. -z is north.
import * as THREE from 'three';
import { figure, water, channelFlats, riverGeometry, reeds, chariotGeometry, horseGeometry, instances } from './lib/ot-31-kit.js';

const RIVER = [[-340, -6], [-140, -2], [-50, -10], [10, -6], [90, -14], [340, -6]];
const NAAMAN = [0, -4];
const WATER_Y = -0.7;

function chariotTeam(ctx, { x, z, yaw }) {
  const y = ctx.heightAt(x, z);
  const wood = new THREE.MeshLambertMaterial({ color: '#7a4e2c', flatShading: true });
  instances(ctx, chariotGeometry(), wood, [{ x, y, z, yaw }]);
  const horses = [-1, 1].map((side) => {
    const lx = side * 0.42, lz = 3.4;
    return { x: x + lx * Math.cos(yaw) + lz * Math.sin(yaw), y, z: z - lx * Math.sin(yaw) + lz * Math.cos(yaw), yaw, color: side < 0 ? '#e8e0d0' : '#6a4a32' };
  });
  instances(ctx, horseGeometry(0), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), horses);
  ctx.solid.box(1.4, 0.06, 0.6, { position: [x, y + 1.08, z + 0.4], rotation: [0, yaw, 0], color: '#a8322a' });
  ctx.colliders.add({ x, z: z + 1.5 * Math.cos(yaw), w: 2, d: 6, rot: yaw, bottom: y, top: y + 2 });
}

export default {
  title: '2 Kings 5:9-14: Naaman in the Jordan',
  seed: 34,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.35, 0.8, 0.45], color: '#fff2d8', intensity: 2.8 },
  light: { sky: '#9ab8e0', ground: '#6a5a3a', hemi: 1.1 },
  sky: { top: '#3f6fb8', horizon: '#d6e2e4', ground: '#b0a080', sunColor: '#fff6e0', glow: 0.8 },
  fog: { color: '#c6d0cc', near: 90, far: 620 },
  clouds: { count: 34, shadow: '#a8b0c0', lit: '#ffffff', rim: '#ffffff', distance: [260, 900], altitude: [110, 240], hole: 0.1, seed: 34 },
  mountains: { count: 40, color: '#8a7a68', radius: [480, 720], height: [50, 120], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.32, shadowTint: '#2a3050', highlightTint: '#fff2d8' },
  shadow: { center: [2, 0], radius: 50 },

  player: { start: [-3, 13], yaw: -0.36, pitch: -0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 34,
    hills: 55,
    bumps: 0.3,
    flats: [{ x: 0, z: 0, r: 100, falloff: 120, height: 0 }, ...channelFlats(RIVER, { r: 8.5, falloff: 6, height: -1.9 })],
    colors: { ground: '#a08a64', groundAlt: '#8c7856', grass: '#7a8a44', high: '#a48c6a', rock: '#857462' },
    patches: [
      { x: 0, z: 14, r: 26, color: '#b8a682', strength: 0.4, rough: 0.5 },
      { x: 0, z: -24, r: 40, color: '#6e7e3c', strength: 0.5, rough: 0.6 },
    ],
  },

  objects: [{ type: 'rock', x: -14, z: 6, size: 1.4 }],

  scatter: [
    { type: 'tree', count: 46, center: [0, -8], ring: [16, 120], spacing: 6, seed: 4, props: { kind: 'broad', leaf: '#5e7a36', h: 6 }, avoid: [{ rect: [4, 14, 50, 26] }, { rect: [0, -8, 30, 14] }] },
    { type: 'tree', count: 24, center: [0, -8], ring: [14, 90], spacing: 6, seed: 5, props: { kind: 'palm', leaf: '#6a8a3a' }, avoid: [{ rect: [4, 14, 50, 26] }, { rect: [0, -8, 30, 14] }] },
    { type: 'tree', count: 60, center: [0, 0], ring: [120, 320], spacing: 8, seed: 6, props: {} },
    { type: 'rock', count: 30, center: [0, 0], ring: [40, 260], spacing: 10, seed: 7, props: { color: '#9a8a74' } },
  ],

  crowd: {
    palette: {
      robes: ['#8e2c2a', '#a8442e', '#4a4a6a', '#6a3a5a', '#c8b48a', '#7a5a3a'],
      mantles: ['#2e2a3e', '#b89a4a', '#5a1e1e', '#3e4a5e'],
      skins: ['#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.7,
      hoodChance: 0.1,
    },
    groups: [
      { count: 22, center: [14, 8], ring: [1.5, 6], spacing: 1.1, face: NAAMAN, children: 0, seed: 34, avoid: [{ rect: [7, 7, 8, 3] }] },
    ],
  },

  effects: [
    { type: 'ring', position: [NAAMAN[0], WATER_Y + 0.12, NAAMAN[1]], radius: 1.4, width: 0.5, color: '#ffffff', opacity: 0.35 },
    { type: 'ring', position: [NAAMAN[0], WATER_Y + 0.12, NAAMAN[1]], radius: 3, width: 0.4, color: '#ffffff', opacity: 0.18 },
  ],

  custom(ctx) {
    water(ctx, { y: WATER_Y, geometry: riverGeometry(RIVER, 20, 10), color: '#4e7a6e', opacity: 0.88, amp: 0.05 });
    reeds(ctx, RIVER, { offset: 9, spread: 2, every: 3 });

    const bed = ctx.heightAt(...NAAMAN);
    const naaman = figure(ctx, { x: NAAMAN[0], z: NAAMAN[1], y: bed, yaw: 0.3, robe: '#e8dcc4', skin: '#b5835e', arms: [0.5, 0.9], collide: false });
    ctx.onFrame((t) => {
      const phase = (t % 4) / 4;
      const dip = phase < 0.35 ? Math.sin((phase / 0.35) * Math.PI) : 0;
      naaman.position.y = bed + 0.15 - dip * 1.5;
      naaman.rotation.x = dip * 0.35;
    });

    figure(ctx, { x: -2, z: 3.6, face: NAAMAN, robe: '#7a5a3a', mantle: '#c8b48a', skin: '#a87652', arms: 'pray' });
    figure(ctx, { x: 3.4, z: 4.2, face: NAAMAN, robe: '#4a4a6a', skin: '#9b6a46', arms: 'out' });
    figure(ctx, { x: -4.5, z: 5, face: NAAMAN, robe: '#c8b48a', mantle: '#8e2c2a', skin: '#a87652' });

    const by = ctx.heightAt(0.5, 5.6);
    ctx.solid.box(1.2, 0.25, 0.8, { position: [0.5, by + 0.12, 5.6], rotation: [0, 0.3, 0], color: '#8e2c2a' });
    ctx.solid.box(1, 0.2, 0.7, { position: [0.5, by + 0.35, 5.6], rotation: [0, 0.5, 0], color: '#d8c89a' });
    ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.25, 0.3, 8), { position: [-0.4, by + 0.15, 5.9], color: '#b89a4a' });
    ctx.solid.box(0.8, 0.05, 0.6, { position: [-0.2, by + 0.04, 6.6], rotation: [0, -0.4, 0], color: '#6a6a72' });

    chariotTeam(ctx, { x: 9, z: 7, yaw: -Math.PI / 2 - 0.2 });
  },
};
