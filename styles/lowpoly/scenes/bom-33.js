// Alma 56-57: Helaman leads the two thousand young sons of the people of Ammon against the Lamanite host.
// They fight as if with the strength of God, and not one of them is slain. -z is north, toward the enemy.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { createFigure } from '../engine/crowd.js';
import { strut, formation, makePeople, addCrowd, arm, banner } from './lib/bom-31-kit.js';

const YOUTHS = [0, -6];
const HELAMAN = [0, -30.5];
const HOST = [2, -54];

const youths = {
  robes: ['#e4dac2', '#d8ccb0', '#cfc2a2', '#e8e0cc', '#c8b898'],
  mantles: ['#3f5a8a', '#4a6a9a', '#34507a', '#5a3a2a'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.75,
  hoodChance: 0,
};
const lamanites = {
  robes: ['#7a2e22', '#5a2a1e', '#3a2a22', '#8a4a2a', '#4a3a2a', '#6a3a28'],
  mantles: ['#2a1e18', '#6a2a1a', '#3a3028'],
  skins: ['#7a4c31', '#8a5a3c', '#9b6a46', '#6e4530'],
  mantleChance: 0.5,
  hoodChance: 0,
};

export default {
  title: 'Alma 56-57: The two thousand stripling warriors',
  seed: 33,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.55, 0.6, 0.45], color: '#ffe0b0', intensity: 2.8 },
  light: { sky: '#a6bce0', ground: '#6a5038', hemi: 1.05 },
  sky: { top: '#5a7cb4', horizon: '#e6d6b8', ground: '#c8b08a', sunColor: '#fff0d0', glow: 0.9 },
  fog: { color: '#d6c6a6', near: 70, far: 520 },
  clouds: { count: 35, shadow: '#a09a9a', lit: '#fff6e8', rim: '#ffffff', distance: [300, 900], altitude: [120, 240], hole: 0.2 },
  mountains: { count: 44, color: '#6a6458', radius: [480, 740], height: [50, 150], haze: 0.55 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.36, shadowTint: '#30285e', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -40], radius: 90 },

  player: { start: [-42, -26], yaw: -1.42, pitch: -0.03, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 33,
    hills: 24,
    bumps: 0.3,
    flats: [
      { x: 0, z: -45, r: 80, falloff: 50, height: 0 },
      { x: -45, z: -26, r: 6, falloff: 20, height: 3.5 },
    ],
    colors: { ground: '#a8945e', groundAlt: '#9a8a52', grass: '#7a8040', high: '#8a7a54', rock: '#7a6a52' },
    patches: [{ x: 0, z: -55, r: 40, color: '#b8a070', strength: 0.6, rough: 0.6 }],
  },

  scatter: [
    { type: 'tree', count: 50, center: [0, -40], ring: [120, 330], spacing: 8, seed: 3, props: { kind: 'broad', leaf: '#5a7a34' } },
    { type: 'rock', count: 26, center: [0, -40], ring: [90, 300], spacing: 12, seed: 5, props: { color: '#857a66' } },
  ],

  custom(ctx) {
    const r = rng(330);

    // The two thousand, in ranks behind Helaman, front ranks with spears lowered.
    const pts = formation({ center: YOUTHS, rows: 40, cols: 50, spacing: 0.95, rowSpacing: 1.05, jitter: 0.12, seed: 3 });
    const sons = makePeople(pts, { palette: youths, heightAt: ctx.heightAt, seed: 4, yaw: Math.PI, yawJitter: 0.08, scale: [0.84, 0.97] });
    addCrowd(ctx, sons);
    const front = sons.filter((p) => p.z < YOUTHS[1] - 13);
    const rest = sons.filter((p) => p.z >= YOUTHS[1] - 13);
    arm(ctx, front, { spear: 0.9, shield: 0.9, helmet: 0.95, pose: 'charge', shields: ['#9a6a3a', '#b08048', '#8a5a32'], helmetColor: '#b0a48a', seed: 5 });
    arm(ctx, rest, { spear: 0.6, shield: 0.8, helmet: 0.95, bow: 0.5, shields: ['#9a6a3a', '#b08048', '#8a5a32'], helmetColor: '#b0a48a', seed: 6 });

    // Helaman before them with a raised sword.
    const hy = ctx.heightAt(...HELAMAN);
    ctx.scene.add(createFigure({ x: HELAMAN[0], y: hy, z: HELAMAN[1], face: [HOST[0], HOST[1]], scale: 1.08, robe: '#d8ccb0', mantle: '#8a2a22', skin: '#9b6a46', arms: 'out' }));
    strut(ctx.solid, [HELAMAN[0] - 0.55, hy + 1.2, HELAMAN[1] - 0.1], [HELAMAN[0] - 0.75, hy + 2.6, HELAMAN[1] - 0.5], 0.07, '#c8ccd0');
    banner(ctx, { x: -4, z: -26, h: 7, w: 1.8, len: 2.6, color: '#efe6d0' });
    banner(ctx, { x: 6, z: -24, h: 6.5, w: 1.5, len: 2.2, color: '#3f5a8a' });

    // The Lamanite host across the field.
    const host = formation({ center: HOST, rows: 28, cols: 50, spacing: 1.05, rowSpacing: 1.2, jitter: 0.35, seed: 7, skip: 0.1 });
    const lam = makePeople(host, { palette: lamanites, heightAt: ctx.heightAt, seed: 8, face: [0, 20], yawJitter: 0.25 });
    addCrowd(ctx, lam);
    arm(ctx, lam, { spear: 0.55, shield: 0.7, helmet: 0.3, bow: 0.4, pose: 'charge', shields: ['#5a2a1e', '#3a2a22', '#7a3a22'], helmetColor: '#6a3a2a', seed: 9 });
    for (const x of [-20, -4, 12, 26]) banner(ctx, { x, z: HOST[1] - 6, h: 7, w: 1.4, len: 2, color: r.pick(['#8a2a1a', '#2a1e18', '#6a3a1a']), rot: Math.PI });

    // Dust thrown up behind the marching host.
    for (let i = 0; i < 4; i++) ctx.effects.smoke({ position: [-27 + i * 18, 0.3, HOST[1] - 24], count: 4, height: 12, size: 1.5, color: '#b8a07a', wind: [0.4, -0.3], seed: 60 + i });

    // Trampled stubble and scattered stones across the field.
    for (let i = 0; i < 400; i++) {
      const x = r.range(-70, 70), z = r.range(-80, 40);
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new THREE.ConeGeometry(0.14, 0.3, 4), { position: [x, y + 0.1, z], rotation: [r.range(-0.3, 0.3), r() * 3, 0], scale: [1, r.range(0.5, 1.3), 1], color: r.pick(['#8a8a44', '#9a9450', '#7a7a3a']), jitter: 0.1 });
    }
  },
};
