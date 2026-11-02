// Acts 8:26-39. On the desert road down to Gaza the Ethiopian treasurer commands his chariot to stand
// still beside a pool, and he and Philip go down into the water for baptism.
import { water, road, chariot, horse, person } from './lib/nt-25-kit.js';

const POOL = [-4.2, -8.6];
const CHARIOT = [5, -4];
const ROAD = [[16, 140], [10, 80], [6, 30], [5, 6], [5, -10], [2, -40], [-10, -100], [-30, -180]];

export default {
  title: 'Acts 8:26-39: Philip and the Ethiopian',
  seed: 31,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.35, 0.82, 0.45], color: '#fff2d8', intensity: 3.0 },
  light: { sky: '#a8c4ec', ground: '#a08060', hemi: 1.1 },
  sky: { top: '#3a70c0', horizon: '#e8dcc4', ground: '#d8c4a0', sunColor: '#fff8e0', glow: 0.7 },
  fog: { color: '#e6d8bc', near: 90, far: 620 },
  clouds: { count: 18, shadow: '#b8b4c0', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [120, 260], hole: 0.3 },
  mountains: { count: 36, color: '#a08a70', radius: [480, 720], height: [30, 80], haze: 0.55 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.35, shadowTint: '#3a3060', highlightTint: '#fff0d0' },
  shadow: { center: [0, -6], radius: 36 },

  player: { start: [-0.8, 0.2], yaw: -0.08, pitch: -0.07, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 31,
    hills: 30,
    bumps: 0.4,
    flats: [
      { x: 0, z: -4, r: 26, falloff: 40, height: 0.4 },
      { x: POOL[0], z: POOL[1], r: 5.5, falloff: 5, height: -1.4 },
    ],
    colors: { ground: '#d6bc8e', groundAlt: '#c8a87a', grass: '#b8a070', high: '#c8a882', rock: '#a88a68' },
    patches: [
      { x: POOL[0], z: POOL[1], r: 13, color: '#7f8a4a', strength: 0.75, rough: 0.5 },
      { x: POOL[0], z: POOL[1], r: 7.5, color: '#8a7656', strength: 0.8, rough: 0.2 },
    ],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 7, center: POOL, ring: [8, 14], spacing: 3.5, seed: 21, avoid: [{ rect: [8, 4, 10, 30] }, { rect: [-1.5, -1, 7, 12] }], props: { kind: 'palm', leaf: '#5e7a34', h: 7 } },
    { type: 'tree', count: 3, center: POOL, ring: [9, 13], spacing: 4, seed: 22, avoid: [{ rect: [8, 4, 10, 30] }, { rect: [-1.5, -1, 7, 12] }], props: { kind: 'broad', leaf: '#6a7c40', h: 4 } },
    { type: 'rock', count: 60, center: [0, 0], ring: [16, 260], spacing: 8, seed: 23, avoid: [{ rect: [8, 60, 16, 140] }], props: { size: 1.3, color: '#a88c6a' } },
    { type: 'rubble', count: 40, center: [0, 0], ring: [12, 120], spacing: 6, seed: 24, avoid: [{ rect: [8, 60, 12, 140] }], props: { radius: 1.4, count: 4, size: [0.2, 0.45], color: '#7f8448' } },
  ],

  crowd: {
    palette: {
      robes: ['#e8dcc0', '#d8b04a', '#3f6a9a', '#b8442e'],
      mantles: ['#d8b04a', '#e8dcc0', '#2e3e6a'],
      skins: ['#3e281c', '#4a2e1e', '#5a3a26'],
      mantleChance: 0.6,
      hoodChance: 0.5,
    },
    groups: [{ count: 3, points: [[7.6, -2.6], [8.4, -4.0], [10.2, -7.5]], face: POOL, children: 0, seed: 11 }],
  },

  custom(ctx) {
    road(ctx, { path: ROAD, width: 3.6, color: '#c4a478' });
    water(ctx, { x: POOL[0], z: POOL[1], y: -0.2, w: 24, d: 24, seg: 24, color: '#4e8a96', amp: 0.04, specular: '#ffffff', shininess: 90 });
    chariot(ctx, { x: CHARIOT[0], z: CHARIOT[1], rot: Math.PI - 0.08, color: '#6a3e24', canopy: '#7a2e5a', trim: '#e0b050' });
    horse(ctx, { x: CHARIOT[0] - 0.45 + 0.3, z: CHARIOT[1] - 3.7, rot: Math.PI - 0.08, color: '#e8e0d0', mane: '#8a8070' });
    horse(ctx, { x: CHARIOT[0] + 0.45 + 0.3, z: CHARIOT[1] - 3.7, rot: Math.PI - 0.08, color: '#b8a690', mane: '#5a4a3a' });
    const cy = ctx.heightAt(...CHARIOT);
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.08, 0.08, 0.6, 7), { position: [CHARIOT[0] + 0.3, cy + 0.95, CHARIOT[1]], rotation: [0, 0.4, Math.PI / 2], color: '#e8dcb8' });
    person(ctx, { x: CHARIOT[0], z: CHARIOT[1] - 0.4, y: cy + 0.87, face: [CHARIOT[0], CHARIOT[1] - 6], robe: '#c8b48c', mantle: '#6a4a2a', skin: '#4a2e1e', hood: true });

    const wy = -0.2 - 0.55;
    person(ctx, { x: POOL[0] + 0.8, z: POOL[1] - 0.1, y: wy, face: [POOL[0] - 0.3, POOL[1] + 0.5], robe: '#d8ccb0', mantle: '#7a6a50', skin: '#a87652', arms: 'out' });
    person(ctx, { x: POOL[0] - 0.3, z: POOL[1] + 0.5, y: wy - 0.2, face: [-0.8, 0.2], robe: '#f0e6cc', mantle: '#7a2e5a', skin: '#3e281c' });
    const ring = new ctx.THREE.Mesh(new ctx.THREE.RingGeometry(0.5, 0.75, 20).rotateX(-Math.PI / 2), new ctx.THREE.MeshBasicMaterial({ color: '#dff2f4', transparent: true, opacity: 0.5, depthWrite: false }));
    ring.position.set(POOL[0] + 0.1, -0.12, POOL[1] + 0.3);
    ring.scale.set(2.2, 1, 1.3);
    ctx.scene.add(ring);
    ctx.onFrame((t) => ring.material.opacity = 0.35 + 0.15 * Math.sin(t * 1.6));
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2, r = 6 + ctx.rand() * 1.2;
      const x = POOL[0] + Math.cos(a) * r, z = POOL[1] + Math.sin(a) * r;
      ctx.solid.add(new ctx.THREE.ConeGeometry(0.12, 1.2 + ctx.rand(), 4), { position: [x, ctx.heightAt(x, z) + 0.5, z], rotation: [ctx.rand() * 0.3, 0, ctx.rand() * 0.3], color: '#6a7a38', jitter: 0.1 });
    }
  },
};
