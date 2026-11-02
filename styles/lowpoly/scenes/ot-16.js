// Exodus 3:1-6: Moses keeps Jethro's flock at Horeb and turns aside to see a bush that burns
// and is not consumed. He has put off his shoes and hides his face. -z is toward the mountain.
import * as THREE from 'three';
import { person, sheep, fire } from './lib/ot-13-kit.js';

const BUSH = [0, -14];

function bush(ctx) {
  const [x, z] = BUSH;
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.DodecahedronGeometry(1.6, 0), { position: [x, y - 0.6, z], scale: [1.6, 0.7, 1.3], color: '#7a6450' });
  ctx.colliders.add({ x, z, w: 4, d: 3.4, bottom: y - 1, top: y + 0.5 });
  const top = y + 0.35;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.06, 1.3, 4), { position: [x + Math.cos(a) * 0.25, top + 0.5, z + Math.sin(a) * 0.25], rotation: [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5], color: '#4a3424' });
  }
  for (let i = 0; i < 9; i++) {
    const a = ctx.rand() * Math.PI * 2, d = ctx.rand.range(0.2, 0.75);
    ctx.solid.add(new THREE.IcosahedronGeometry(ctx.rand.range(0.28, 0.42), 0), {
      position: [x + Math.cos(a) * d, top + ctx.rand.range(0.6, 1.4), z + Math.sin(a) * d],
      rotation: [ctx.rand() * 3, ctx.rand() * 3, 0],
      color: '#4f7a34',
      jitter: 0.12,
    });
  }
  fire(ctx, { x, z, y: top + 0.1, size: 2.1, count: 16, light: 70, distance: 40 });
  fire(ctx, { x: x + 0.5, z: z + 0.45, y: top + 0.8, size: 1.1, count: 6, light: 0 });
  fire(ctx, { x: x - 0.55, z: z + 0.4, y: top + 0.7, size: 1.2, count: 6, light: 0 });
  fire(ctx, { x, z: z + 0.6, y: top + 1.3, size: 1.0, count: 5, light: 0 });
  ctx.effects.halo({ position: [x, top + 1.4, z], size: 6.5, color: '#ffc880', opacity: 0.5 });
  ctx.effects.halo({ position: [x, top + 1.2, z], size: 2.4, color: '#fff6e0', opacity: 0.6 });
  ctx.effects.motes({ position: [x, top, z], radius: 1.4, height: 9, count: 90, color: '#ffc870', size: 0.05, seed: 16 });
}

export default {
  title: 'Exodus 3:1-6: The burning bush',
  seed: 3,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.75, 0.25, 0.45], color: '#ffa070', intensity: 2.4 },
  light: { sky: '#8a86b8', ground: '#6a5048', hemi: 1.15 },
  sky: { top: '#2a3060', horizon: '#e88a5a', ground: '#7a5a50', sunColor: '#ffb070', glow: 1.3 },
  fog: { color: '#8a6a6a', near: 60, far: 520 },
  clouds: { count: 40, shadow: '#3a3048', lit: '#f08a60', rim: '#ffd0a0', distance: [260, 900], altitude: [90, 220], hole: 0.15 },
  mountains: { count: 50, color: '#4a4048', radius: [450, 700], height: [80, 200], haze: 0.45 },
  bloom: { strength: 0.8, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.12, contrast: 1.08, vignette: 0.5, shadowTint: '#2a2050', highlightTint: '#ffd6a8' },
  shadow: { center: [0, -8], radius: 45 },

  player: { start: [3, 0], yaw: 0.12, pitch: 0.02, eye: 1.65, speed: 4 },

  terrain: {
    size: 900,
    segments: 220,
    seed: 30,
    hills: 70,
    hillScale: 0.009,
    bumps: 0.6,
    flats: [{ x: 0, z: -4, r: 22, falloff: 40, height: 4 }],
    colors: { ground: '#8a7058', groundAlt: '#7a6450', grass: '#6a6a40', high: '#8a7a6a', rock: '#6a5a50' },
    patches: [{ x: BUSH[0], z: BUSH[1], r: 6, color: '#6a5444', strength: 0.5, rough: 0.6 }],
  },

  scatter: [
    { type: 'rock', count: 120, center: [0, -10], ring: [8, 260], spacing: 5, seed: 3, avoid: [{ r: 5, x: 0, z: -2 }], props: { color: '#7a6a5e' } },
    { type: 'tree', count: 30, center: [0, -10], ring: [26, 200], spacing: 8, seed: 4, props: { kind: 'broad', h: 3, leaf: '#56603a' } },
  ],

  custom(ctx) {
    bush(ctx);
    // Horeb's peak rising behind the bush.
    for (const [x, z, r, h, c] of [[-10, -190, 70, 95, '#7a6460'], [50, -210, 60, 70, '#806a62'], [-80, -200, 55, 60, '#74605a'], [10, -170, 40, 45, '#86706a']]) {
      ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [x, ctx.heightAt(x, z) - h * 0.35, z], rotation: [0.15, ctx.rand() * 3, 0.1], scale: [r * 1.3, h, r], color: c, jitter: 0.1 });
    }

    // Moses kneels with his face hidden, shoes off, staff laid beside him.
    const M = [-2.0, -10.2];
    person(ctx, { x: M[0], z: M[1], face: BUSH, robe: '#8a6a48', mantle: '#5a4434', hood: true, skin: '#9b6a46', pose: 'kneel', arms: 'face' });
    const y = ctx.heightAt(M[0], M[1]);
    for (const dx of [1.0, 1.25]) ctx.solid.box(0.12, 0.05, 0.28, { position: [M[0] + dx, ctx.heightAt(M[0] + dx, M[1] + 1.2) + 0.03, M[1] + 1.2], rotation: [0, 0.3, 0], color: '#5a3a24' });
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.035, 1.9, 5), { position: [M[0] - 0.8, y + 0.06, M[1] + 0.3], rotation: [0, 0.4, Math.PI / 2], color: '#5a4030' });

    // Jethro's flock spread on the slope behind him.
    for (let i = 0; i < 55; i++) {
      const a = ctx.rand.range(0.4, Math.PI - 0.4), d = ctx.rand.range(7, 26);
      const x = Math.cos(a) * d * 1.4 - 4, z = 6 + Math.sin(a) * d * 0.6;
      sheep(ctx, { x, z, rot: ctx.rand() * Math.PI * 2, wool: ctx.rand() < 0.25 ? '#4a3a30' : '#ddd4c0' });
    }
    for (let i = 0; i < 14; i++) {
      const x = ctx.rand.range(-14, -5), z = ctx.rand.range(-6, 3);
      sheep(ctx, { x, z, rot: ctx.rand() * Math.PI * 2, wool: ctx.rand() < 0.25 ? '#4a3a30' : '#ddd4c0' });
    }
  },
};
