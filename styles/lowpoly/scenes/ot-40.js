// Daniel 6: very early in the morning King Darius hurries to the den and cries to Daniel.
// Daniel stands unharmed below among resting lions; an angel has shut their mouths. -z is north.
import { block, person, being, flames, fireLight, lion, skirt } from './lib/ot-38-kit.js';

const PIT = [0, -14];
const R = 7.5, DEPTH = 4.2;
const stone = '#a89478';
const darkStone = '#7a6a56';
const KING = [0, PIT[1] - R - 2.6];

export default {
  title: "Daniel 6:16-23: Daniel in the lions' den",
  seed: 40,
  fov: 64,
  exposure: 1.05,

  sun: { direction: [0.85, 0.16, -0.45], color: '#ffb48a', intensity: 2.4 },
  light: { sky: '#9aa8d8', ground: '#6a5048', hemi: 1.0 },
  sky: { top: '#4a5f9a', horizon: '#f6b490', ground: '#c89a86', sunColor: '#ffd2a0', glow: 1.4 },
  fog: { color: '#d8a898', near: 70, far: 480 },
  clouds: { count: 50, shadow: '#6a5a78', lit: '#ffb898', rim: '#fff0d8', distance: [240, 900], altitude: [90, 220], hole: 0.2 },
  mountains: { count: 34, color: '#7a6a74', radius: [520, 760], height: [20, 70], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.45, shadowTint: '#2a2860', highlightTint: '#ffe0c0' },
  shadow: { center: [0, -14], radius: 40 },

  player: { start: [1.0, PIT[1] + R + 0.6], yaw: 0.02, pitch: -0.42, eye: 1.65, speed: 4 },

  terrain: {
    size: 250, segments: 250, seed: 40, hills: 0, bumps: 0.15,
    flats: [
      { x: 0, z: 0, r: 160, falloff: 20, height: 0 },
      { x: PIT[0], z: PIT[1], r: R + 0.6, falloff: 1.0, height: -DEPTH },
    ],
    colors: { ground: '#a88e70', groundAlt: '#9a8064', grass: '#7f8450', high: '#9a8468', rock: '#6e5e4e' },
    patches: [
      { x: PIT[0], z: PIT[1], r: R, color: '#7a6448', strength: 0.9, rough: 0.2 },
      { x: 0, z: -14, r: 26, color: '#b8a080', strength: 0.5, rough: 0.4 },
    ],
  },

  objects: [
    { type: 'pavement', x: 0, z: -14, w: 30, d: 30, tile: 2.2, color: '#bba584', damage: 0.1, holes: [{ x: PIT[0], z: PIT[1], r: R + 2.2 }] },
    { type: 'rubble', x: 5, z: -2, radius: 2, count: 6, size: [0.2, 0.4], color: stone },
  ],

  scatter: [
    { type: 'tree', count: 40, center: PIT, ring: [30, 100], spacing: 8, seed: 3, props: { kind: 'palm', leaf: '#5e7a3a' } },
    { type: 'tree', count: 20, center: PIT, ring: [26, 90], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#5a743a' } },
    { type: 'rock', count: 16, center: PIT, ring: [50, 105], spacing: 12, seed: 5, props: {} },
  ],

  crowd: {
    palette: {
      robes: ['#5a3a6e', '#8a3a2a', '#3a4a7a', '#b09060', '#6e5a40', '#d0c0a0'],
      mantles: ['#c9a040', '#6a2a2a', '#2a3a5a', '#d8c8a0'],
      skins: ['#9b6a46', '#a87652', '#8a5a3c'],
      mantleChance: 0.8,
      hoodChance: 0.4,
    },
    groups: [
      { count: 14, center: KING, ring: [3, 9], arc: [Math.PI + 0.3, Math.PI * 2 - 0.3], spacing: 1.2, face: PIT, children: 0, seed: 9 },
    ],
  },

  figures: [
    { x: KING[0], z: KING[1], face: [PIT[0], PIT[1] + 4], scale: 1.08, robe: '#4a1f5e', mantle: '#d4a83a', skin: '#a87652', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const [px, pz] = PIT;
    const floor = -DEPTH;
    skirt(ctx, { inner: 118, color: '#a08468' });

    // Stone-lined circular pit with a low parapet.
    const n = 26;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = px + Math.cos(a) * (R + 1.0), z = pz + Math.sin(a) * (R + 1.0);
      const seg = (2 * Math.PI * (R + 1.0)) / n + 0.12;
      block(ctx, { x, z, y: floor - 0.5, w: 2.2, h: DEPTH + 0.5, d: seg, rot: -a, color: i % 2 ? stone : '#9c876a' });
      block(ctx, { x, z, y: 0, w: 2.4, h: 0.45, d: seg, rot: -a, color: darkStone });
      for (let k = 1; k < 4; k++) ctx.solid.box(0.06, 0.14, seg, { position: [px + Math.cos(a) * (R - 0.12), floor + k * 1.5, pz + Math.sin(a) * (R - 0.12)], rotation: [0, -a, 0], color: '#6e5e4a' });
    }
    // Stair winding down the inside wall, the only way out.
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const a = Math.PI * 0.9 + (i / steps) * Math.PI * 0.8;
      const x = px + Math.cos(a) * (R - 1.1), z = pz + Math.sin(a) * (R - 1.1);
      const top = -0.05 - (i * DEPTH) / steps;
      block(ctx, { x, z, y: floor - 0.3, w: 1.8, h: top - floor + 0.3, d: 1.15, rot: -a, color: i % 2 ? '#a08a6c' : '#958062' });
    }
    // Scattered bones and straw on the den floor.
    for (let i = 0; i < 40; i++) {
      const r = ctx.rand;
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (R - 1.5);
      ctx.solid.box(r.range(0.4, 0.9), 0.05, 0.08, { position: [px + Math.cos(a) * d, floor + 0.06, pz + Math.sin(a) * d], rotation: [0, r() * 3, 0], color: r() < 0.7 ? '#c8b070' : '#e0d8c0' });
    }

    // Daniel and the resting lions.
    person(ctx, { x: px - 0.3, z: pz + 0.4, y: floor, face: [KING[0], KING[1] + 20], tilt: [0.05, 0], robe: '#3a4f7a', mantle: '#d8c8a0', skin: '#9b6a46', arms: 'out', scale: 1.05 });
    being(ctx, { x: px + 1.6, z: pz - 1.4, y: floor, face: [px, pz + 6], scale: 1.18, arms: 'out', light: 9, distance: 10, halo: 3.5, glow: 0.55 });
    ctx.effects.beam({ position: [px + 1.6, floor, pz - 1.4], height: 90, radiusBottom: 1.0, radiusTop: 3.5, color: '#fff2d8', opacity: 0.22 });
    const lions = [
      [-3.5, 1.6, 1.2, 'lie'], [-2.8, -2.2, 0.6, 'lie'], [2.4, 2.8, -2.6, 'lie'], [3.6, 0.4, -1.8, 'lie'],
      [0.8, -3.6, 0.2, 'lie'], [-4.2, -0.6, 1.8, 'stand'], [1.2, 3.8, 3.4, 'lie'],
    ];
    for (const [lx, lz, rot, pose] of lions) {
      lion(ctx, { x: px + lx, z: pz + lz, y: floor, rot: rot + Math.atan2(-lx, -lz) * 0, pose, size: 1.05 });
    }

    // The stone rolled from the den's mouth, with its broken seal cord.
    ctx.solid.add(new THREE.CylinderGeometry(1.6, 1.6, 0.6, 9), { position: [px + R + 3.4, 1.6, pz + 1.2], rotation: [0.15, 0, Math.PI / 2 - 0.2], color: '#8e7c66' });
    ctx.colliders.add({ x: px + R + 3.4, z: pz + 1.2, w: 1.2, d: 3.2, bottom: 0, top: 3.2 });
    ctx.solid.box(0.04, 0.04, 1.4, { position: [px + R + 2.6, 0.6, pz + 1.2], rotation: [0.4, 0.3, 0.2], color: '#7a2a2a' });
    ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 8), { position: [px + R + 2.5, 0.12, pz + 1.6], color: '#9a2a1a' });

    // Torchbearers who came with the king before full light.
    for (const [tx, tz] of [[-3.2, KING[1] - 0.6], [3.4, KING[1] - 0.4]]) {
      person(ctx, { x: tx, z: tz, face: PIT, robe: '#6e5a40', mantle: '#4a3a2a', skin: '#9b6a46', hood: true });
      ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 5), { position: [tx + 0.3, 1.5, tz + 0.15], color: '#4a3020' });
      flames(ctx, { x: tx + 0.3, z: tz + 0.15, y: 2.3, w: 0.15, d: 0.15, count: 5, height: 0.6, seed: Math.round(tx * 10) });
      fireLight(ctx, { position: [tx + 0.3, 2.6, tz + 0.2], intensity: 6, distance: 10 });
    }
    ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.2, 0.22, 8), { position: [KING[0], ctx.heightAt(...KING) + 1.93, KING[1]], color: '#f2c44a' });

    // The palace beyond the den.
    for (let i = -4; i <= 4; i++) {
      const x = i * 12, z = -62;
      block(ctx, { x, z, w: 12.2, h: 13, d: 8, color: '#c4a47a', collide: false });
      if (i % 2 === 0) block(ctx, { x, z: z + 1, w: 6, h: 17, d: 9, color: '#b8966c', collide: false });
      for (let k = -2; k <= 2; k++) ctx.solid.box(1.3, 1.2, 8, { position: [x + k * 2.4, 13.6, z], color: '#b8966c' });
    }
    ctx.solid.box(8, 10, 0.4, { position: [0, 5, -57.8], color: '#2f5a9a' });
    ctx.solid.box(4.5, 7, 0.5, { position: [0, 3.5, -57.6], color: '#2a1a12' });
  },
};
