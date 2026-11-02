// Exodus 14:21-31: the sea divided, its waters a wall on the right and the left. Israel walks
// on dry ground through the night while the pillar of fire stands between them and Egypt.
// The channel runs north-south. The player stands on the far (north, -z) shore beside Moses.
import * as THREE from 'three';
import { person, water, fire, nightSky } from './lib/ot-13-kit.js';

const HALF = 10;
const BED = -12;
const SEA = -0.6;
const PILLAR = [0, 108];

const seaFlats = Array.from({ length: 23 }, (_, i) => ({ x: -550 + i * 50, z: 0, r: 76, falloff: 24, height: BED }));

function walls(ctx) {
  for (const s of [-1, 1]) {
    water(ctx, { x: s * HALF, y: (BED + SEA) / 2 + 0.3, z: 0, w: 192, d: SEA - BED + 1.4, seg: 64, vertical: true, rot: s * Math.PI / 2, color: '#2a6a8a', emissive: '#0c2a40', opacity: 0.9, amp: 0.35, freq: 0.3, speed: 1.4 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(3, SEA - BED + 1, 192), new THREE.MeshBasicMaterial({ color: '#0a2232' }));
    back.position.set(s * (HALF + 2.2), (BED + SEA) / 2, 0);
    ctx.scene.add(back);
    ctx.colliders.add({ x: s * (HALF + 2), z: 0, w: 3, d: 192, bottom: BED - 5, top: SEA + 30 });
    // foam along the crest
    for (let z = -95; z < 95; z += 1.6) {
      ctx.solid.add(new THREE.DodecahedronGeometry(ctx.rand.range(0.5, 1.0), 0), {
        position: [s * (HALF + ctx.rand.range(0.2, 1.2)), SEA + 0.6 + ctx.rand.range(-0.2, 0.4), z],
        rotation: [ctx.rand() * 3, ctx.rand() * 3, 0],
        scale: [1, 0.5, 1.4],
        color: '#cfe4ec',
        jitter: 0.06,
      });
    }
    water(ctx, { x: s * (HALF + 250), y: SEA, z: 0, w: 500, d: 204, seg: 50, color: '#1e4a64', emissive: '#081a28', opacity: 1, amp: 0.25, freq: 0.15 });
  }
}

function pillar(ctx) {
  const [x, z] = PILLAR;
  const y = ctx.heightAt(x, z);
  ctx.effects.beam({ position: [x, y, z], height: 200, radiusBottom: 5, radiusTop: 9, color: '#ff8a3a', opacity: 1.2 });
  ctx.effects.beam({ position: [x, y, z], height: 200, radiusBottom: 2.6, radiusTop: 5, color: '#ffd080', opacity: 1.0 });
  fire(ctx, { x, z, y, size: 5, count: 14, light: 0 });
  for (let i = 0; i < 5; i++) fire(ctx, { x: x + ctx.rand.range(-1.5, 1.5), z: z + ctx.rand.range(-1.5, 1.5), y: y + 6 + i * 9, size: 5.5, count: 6, light: 0 });
  ctx.effects.halo({ position: [x, y + 20, z], size: 70, color: '#ff9a40', opacity: 0.7 });
  ctx.effects.halo({ position: [x, y + 6, z], size: 26, color: '#ffd090', opacity: 0.8 });
  const light = new THREE.PointLight('#ff9a50', 900, 300, 1);
  light.position.set(x, y + 30, z - 10);
  ctx.scene.add(light);
  // Egypt's chariots held back in the dark behind the pillar
  for (let i = 0; i < 12; i++) {
    const cx = -30 + i * 5.4 + ctx.rand.range(-1, 1), cz = 128 + ctx.rand.range(-3, 6);
    const cy = ctx.heightAt(cx, cz);
    ctx.solid.box(1.4, 0.8, 1.0, { position: [cx, cy + 0.9, cz], color: '#3a2a20' });
    for (const s of [-1, 1]) ctx.solid.add(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 8), { position: [cx + s * 0.8, cy + 0.55, cz], rotation: [0, 0, Math.PI / 2], color: '#2a2018' });
    ctx.solid.add(new THREE.DodecahedronGeometry(0.5, 0), { position: [cx, cy + 1.3, cz - 2], scale: [0.7, 0.8, 1.6], color: '#2a2420' });
    ctx.solid.box(0.2, 1.8, 0.2, { position: [cx + 0.3, cy + 2.0, cz + 0.2], color: '#3a3230' });
  }
}

export default {
  title: 'Exodus 14:21-31: Crossing the Red Sea',
  seed: 14,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [-0.3, 0.55, -0.8], color: '#7088c8', intensity: 1.0 },
  light: { sky: '#4a5a98', ground: '#3a2a30', hemi: 1.3 },
  sky: { top: '#070c24', horizon: '#2a3460', ground: '#141826', sunColor: '#8aa0d0', glow: 0.3 },
  fog: { color: '#1a2038', near: 80, far: 420 },
  clouds: { count: 30, shadow: '#141a30', lit: '#3a4470', rim: '#5a6aa0', distance: [300, 900], altitude: [120, 260], hole: 0.1 },
  mountains: { count: 40, color: '#1a1a28', radius: [450, 650], height: [40, 110], haze: 0.35 },
  bloom: { strength: 0.85, radius: 0.6, threshold: 0.72 },
  grade: { saturation: 1.1, contrast: 1.08, vignette: 0.5, shadowTint: '#101a38', highlightTint: '#ffcf98' },
  shadow: { center: [0, -60], radius: 70 },

  player: { start: [-3, -120], yaw: Math.PI, pitch: -0.13, eye: 1.65, speed: 5 },

  terrain: {
    size: 1000,
    segments: 250,
    seed: 18,
    hills: 10,
    bumps: 0.25,
    flats: [...seaFlats, { x: -3, z: -124, r: 7, falloff: 16, height: 9 }],
    colors: { ground: '#7a6a54', groundAlt: '#6e5e4a', grass: '#5a5a3a', high: '#7a6a54', rock: '#5e5244' },
    patches: [
      { x: 0, z: -60, r: 14, color: '#5e5446', strength: 0.7, rough: 0.4 },
      { x: 0, z: -20, r: 14, color: '#5e5446', strength: 0.7, rough: 0.4 },
      { x: 0, z: 20, r: 14, color: '#5e5446', strength: 0.7, rough: 0.4 },
      { x: 0, z: 60, r: 14, color: '#5e5446', strength: 0.7, rough: 0.4 },
    ],
  },

  scatter: [
    { type: 'rock', count: 40, center: [0, 0], ring: [0, 92], spacing: 4, seed: 4, avoid: [{ rect: [-58, 0, 100, 300] }, { rect: [58, 0, 100, 300] }], props: { size: 0.6, color: '#5a5048' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.7,
      hoodChance: 0.45,
    },
    groups: [
      { count: 1700, center: [0, 0], ring: [0, 96], spacing: 1.05, face: [0, -400], children: 0.25, seed: 41, avoid: [{ rect: [-58.5, 0, 100, 300] }, { rect: [58.5, 0, 100, 300] }] },
      { count: 300, center: [0, -112], ring: [14, 44], spacing: 1.3, face: [0, -300], children: 0.25, seed: 42, avoid: [{ rect: [0, -50, 400, 96] }, { r: 18, x: -3, z: -118 }] },
    ],
  },

  custom(ctx) {
    nightSky(ctx, { count: 900, moon: [-0.3, 0.55, -0.8], moonSize: 24 });
    walls(ctx);
    pillar(ctx);
    // Moses on the shore, stretching out his hand and rod over the sea.
    person(ctx, { x: 0.5, z: -112.5, face: [0, 0], robe: '#d8cdb5', mantle: '#7d5c3e', skin: '#9b6a46', arms: ['out', 'up'], staff: true, scale: 1.05 });
    // flocks driven along with the people
    for (let i = 0; i < 30; i++) {
      const x = ctx.rand.range(-7, 7), z = ctx.rand.range(-40, -20);
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new THREE.DodecahedronGeometry(0.3, 0), { position: [x, y + 0.45, z], scale: [0.85, 0.75, 1.25], color: '#d8d0bc', jitter: 0.06 });
    }
  },
};
