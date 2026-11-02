// Luke 22:39-46. Night in the olive garden on the Mount of Olives. Jesus kneels in prayer by a
// rock, an angel strengthening him; Peter, James and John sleep nearby, the others by the gate.
// Jerusalem glows across the Kidron valley to the west (-x).
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { house, oliveTree, person, christ, cityWall, box, stars, glowAt } from './lib/nt-19-kit.js';

const JESUS = [0.6, -6.5];
const ROCK = [-1.1, -7.4];
const START = [3.8, 6.8];

const robes = ['#8b6b4a', '#a0825c', '#b59a72', '#7a4e36', '#94704e', '#a65d3f', '#c4b090'];

export default {
  title: 'Luke 22:39-46: Gethsemane',
  seed: 22,
  fov: 62,
  exposure: 1.5,

  sun: { direction: [-0.45, 0.5, -0.55], color: '#a8bcff', intensity: 2.0 },
  light: { sky: '#6a7cc0', ground: '#2c3040', hemi: 1.35 },
  sky: { top: '#050a1c', horizon: '#1c2a4c', ground: '#0e1220', sunColor: '#d8e2ff', glow: 0.45 },
  fog: { color: '#141d33', near: 25, far: 300 },
  mountains: { count: 36, color: '#141a2a', radius: [420, 700], height: [40, 110], haze: 0.35 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 0.95, contrast: 1.08, vignette: 0.55, shadowTint: '#101838', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -4], radius: 36 },

  player: { start: START, yaw: 0.22, pitch: -0.05, eye: 1.65, speed: 3.6 },

  terrain: {
    size: 900,
    segments: 160,
    seed: 22,
    hills: 26,
    bumps: 0.5,
    flats: [
      { x: 0, z: -2, r: 34, falloff: 30, height: 0 },
      { x: -92, z: 0, r: 18, falloff: 30, height: -12 },
      { x: -170, z: -10, r: 62, falloff: 20, height: 4 },
    ],
    colors: { ground: '#5a5a3e', groundAlt: '#4e5236', grass: '#4a5a34', high: '#6e6858', rock: '#6c645a' },
    patches: [{ x: 0, z: -10, r: 8, color: '#5c5442', strength: 0.5, rough: 0.4 }],
  },

  scatter: [
    { type: 'rock', count: 26, center: [0, -2], ring: [8, 60], spacing: 8, seed: 3, props: { color: '#6e6658', size: 1.2 } },
  ],

  custom(ctx) {
    const r = ctx.rand;
    stars(ctx, { count: 1600 });

    // The grove: old olive trees around a clearing and along a path.
    const rr = rng(91);
    const trees = [];
    for (let tries = 0; tries < 4000 && trees.length < 90; tries++) {
      const x = rr.range(-45, 45), z = rr.range(-50, 40);
      if (Math.hypot(x - JESUS[0], z - JESUS[1]) < 6 || Math.hypot(x - START[0], z - START[1]) < 3.5) continue;
      if (Math.abs(x - (START[0] + (z - START[1]) * 0.24)) < 4.5 && z > JESUS[1] && z < START[1]) continue;
      if (Math.abs(x - 2.5) < 2.2 && z > -10 && z < 30) continue;
      if (Math.hypot(x - 10, z - 15) < 5) continue;
      if (trees.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 5.5)) continue;
      trees.push([x, z]);
    }
    for (const [x, z] of trees) oliveTree(ctx, { x, z, s: rr.range(0.9, 1.4), leaf: '#5a6a48' });
    for (let i = 0; i < 40; i++) {
      const x = r.range(-1, 4.5), z = r.range(-10, 32);
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.15, 0.35), 0), { position: [x, ctx.heightAt(x, z), z], color: '#6e6658', jitter: 0.08 });
    }
    // A low stone wall around the garden with a gate by the sleeping eight.
    for (let a = 0; a < Math.PI * 2; a += 0.06) {
      const x = Math.cos(a) * 42, z = -4 + Math.sin(a) * 42;
      if (Math.hypot(x - 18, z - 30) < 6) continue;
      box(ctx, { x, z, y: ctx.heightAt(x, z) - 0.3, w: 0.8, h: 1.2, d: 2.6, rot: -a, color: '#6e6658' });
    }

    // Jesus kneeling by the rock, and the angel strengthening him.
    const ry = ctx.heightAt(...ROCK);
    ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [ROCK[0], ry + 0.45, ROCK[1]], rotation: [0.3, 0.5, 0.1], scale: [1.6, 0.9, 1.2], color: '#7a7266', jitter: 0.06 });
    ctx.colliders.add({ x: ROCK[0], z: ROCK[1], w: 2.6, d: 2, bottom: ry, top: ry + 1.1 });
    christ(ctx, { x: JESUS[0], z: JESUS[1], pose: 'kneel', face: ROCK, light: 14, halo: 1.8, glow: 0.35 });
    const ay = ry + 2.2;
    person(ctx, { x: ROCK[0] - 0.6, z: ROCK[1] - 1.6, y: ay, face: JESUS, arms: 'out', robe: '#fbfaf4', mantle: null, skin: '#f4efe4', hood: false, emissive: 0.22, scale: 1.05 });
    glowAt(ctx, [ROCK[0] - 0.8, ay + 1.2, ROCK[1] - 1.6], 3.2, '#e8eeff', 0.35);
    ctx.effects.beam({ position: [ROCK[0] - 0.6, ry, ROCK[1] - 1.2], height: 26, radiusBottom: 1.6, radiusTop: 3.5, color: '#dfe6ff', opacity: 0.16 });
    const l = new THREE.PointLight('#dfe6ff', 5, 10, 1.6);
    l.position.set(ROCK[0] - 0.8, ay + 1.5, ROCK[1] - 1.2);
    ctx.scene.add(l);

    // Peter, James and John asleep a stone's cast away; the other eight near the gate.
    const sleep = [
      { x: -1.4, z: 2.4, pose: 'lie', head: [-2.6, 1.8] },
      { x: 1.6, z: 4.0, pose: 'slump', face: [1.2, 0] },
      { x: 4.6, z: 2.2, pose: 'lie', head: [5.8, 1.6] },
      { x: 12, z: 14, pose: 'lie', head: [13, 13] },
      { x: 9.5, z: 16.5, pose: 'slump', face: [10, 10] },
      { x: 14, z: 17, pose: 'lie', head: [15, 18] },
      { x: 7.5, z: 13, pose: 'lie', head: [7, 12] },
      { x: 11.5, z: 19.5, pose: 'slump', face: [12, 14] },
      { x: 15.5, z: 14.5, pose: 'lie', head: [16.5, 14] },
      { x: 8.4, z: 18.8, pose: 'lie', head: [7.6, 19.6] },
      { x: 13, z: 11.5, pose: 'slump', face: [11, 15] },
    ];
    for (const s of sleep) person(ctx, { ...s, robe: r.pick(robes), mantle: r.pick(['#7d5c3e', '#4f5a6b', '#a34f32', '#556246']), skin: r.pick(['#8a5a3c', '#7a4c31']), hood: s.pose === 'lie' && r() < 0.5 });
    for (const [x, z] of [[-1.4, 2.4], [4.6, 2.2], [12, 14], [14, 17], [7.5, 13], [15.5, 14.5], [8.4, 18.8]]) {
      ctx.solid.box(1.1, 0.06, 2, { position: [x + 0.1, ctx.heightAt(x, z) + 0.03, z], rotation: [0, r() * 3, 0], color: '#3a3428', jitter: 0.05 });
    }

    // Jerusalem across the valley: walls, roofs, the temple, and lamplit windows.
    cityWall(ctx, { from: [-120, -120], to: [-120, 110], h: 11, thick: 3, color: '#7a7466', towerEvery: 32 });
    const city = rng(93);
    for (let i = 0; i < 110; i++) {
      const x = city.range(-128, -260), z = city.range(-130, 120);
      if (Math.abs(x + 165) < 38 && Math.abs(z + 30) < 32) continue;
      const top = house(ctx, { x, z, rot: Math.floor(city() * 4) * (Math.PI / 2), w: city.range(6, 10), d: city.range(5, 9), h: city.range(4, 8), color: '#6e6a62', door: false }).top;
      if (city() < 0.45) glowAt(ctx, [x + city.range(-3, 3), top - city.range(1, 2.5), z + city.range(-3, 3)], city.range(3, 6), '#ffb060', 0.55);
    }
    const ty = ctx.heightAt(-165, -30) - 0.5;
    box(ctx, { x: -165, z: -30, y: ty, w: 76, h: 12, d: 64, color: '#6e6a62' });
    box(ctx, { x: -165, z: -30, y: ty + 12, w: 26, h: 15, d: 12, color: '#8a8478' });
    box(ctx, { x: -157, z: -30, y: ty + 12, w: 4, h: 22, d: 22, color: '#8e887c' });
    for (let i = 0; i < 6; i++) glowAt(ctx, [-130 - i * 7, ty + 13, -30 + (i % 2 ? 20 : -20)], 7, '#ffa040', 0.7);
  },
};
