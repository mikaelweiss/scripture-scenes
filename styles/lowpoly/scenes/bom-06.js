// 1 Nephi 16:18-32: Nephi's steel bow breaks and the family starves. He makes a bow of wood
// and climbs to the top of the mountain to hunt. The camp is in the foreground; the mountain rises north (-z).
import * as THREE from 'three';
import { tent, camel, jar, bundle, person, bow, goat } from './lib/bom-01-kit.js';

const PEAK = [14, -125];
const TRAIL = Array.from({ length: 40 }, (_, i) => {
  const t = i / 39;
  return [2 + (PEAK[0] - 2) * t + Math.sin(t * 9) * 6 * (1 - t), -6 + (PEAK[1] + 6) * t];
});
const NEPHI_T = 0.2;

export default {
  title: "1 Nephi 16:18-32: Nephi's broken bow",
  seed: 606,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.4, 0.8, 0.45], color: '#fff0d0', intensity: 3.1 },
  light: { sky: '#a8c0e8', ground: '#a07050', hemi: 1.0 },
  sky: { top: '#5a86c8', horizon: '#f0dcc0', ground: '#d8b890', sunColor: '#fff8e0', glow: 0.9 },
  fog: { color: '#ead4b4', near: 90, far: 620 },
  clouds: { count: 14, shadow: '#b0a8b8', lit: '#fff8ec', rim: '#ffffff', distance: [350, 900], altitude: [150, 260], hole: 0.1 },
  mountains: { count: 44, color: '#a07860', radius: [460, 720], height: [40, 120], haze: 0.5 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.04, contrast: 1.06, vignette: 0.42, shadowTint: '#40305a', highlightTint: '#fff2d8' },
  shadow: { center: [0, -10], radius: 55 },

  player: { start: [-3.5, 11], yaw: -0.05, pitch: 0.0, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 88,
    hills: 26,
    bumps: 0.4,
    flats: [
      { x: 0, z: 4, r: 24, falloff: 30, height: 0 },
      { x: PEAK[0], z: PEAK[1], r: 10, falloff: 95, height: 52 },
      { x: PEAK[0] - 50, z: PEAK[1] - 20, r: 8, falloff: 70, height: 34 },
      { x: PEAK[0] + 55, z: PEAK[1] + 10, r: 8, falloff: 60, height: 28 },
    ],
    colors: { ground: '#c8a074', groundAlt: '#b8905e', grass: '#9a8a5a', high: '#9a6e52', rock: '#8a6048' },
    patches: [{ x: 0, z: 4, r: 18, color: '#b8986e', strength: 0.5, rough: 0.5 }],
  },

  scatter: [
    { type: 'rock', count: 40, center: [PEAK[0], PEAK[1] + 20], ring: [8, 90], spacing: 9, seed: 5, avoid: [{ rect: [8, -60, 24, 130] }], props: { color: '#9a6e52', size: 1.6 } },
    { type: 'rock', count: 30, center: [0, 0], ring: [30, 300], spacing: 14, seed: 6, props: { color: '#a87a5a' } },
    { type: 'tree', count: 20, center: [PEAK[0], PEAK[1] + 30], ring: [10, 90], spacing: 10, seed: 7, props: { kind: 'broad', h: 3, leaf: '#6a7a3e' } },
    { type: 'tree', count: 10, center: [0, 0], ring: [20, 120], spacing: 14, seed: 8, props: { kind: 'burnt' } },
  ],

  custom(ctx) {
    const r = ctx.rand;
    // The camp, weary and still.
    const tents = [[-6, -2, 0.4], [5, -4, -0.3], [12, 4, -1.2], [-13, 6, 1.1], [-2, -11, 0.1]];
    for (const [x, z, rot] of tents) tent(ctx, { x, z, rot, w: r.range(4.5, 5.5), d: r.range(5, 6.5), h: r.range(2.4, 2.8), color: r.pick(['#4a3a2c', '#3a2c22', '#5a4636']), stripe: r.pick(['#8a6a48', '#a08060', '#6e5640']) });

    // A cold fire: ash and a few blackened sticks.
    const fy = ctx.heightAt(-1, 3);
    ctx.solid.add(new THREE.CircleGeometry(0.8, 8).rotateX(-Math.PI / 2), { position: [-1, fy + 0.04, 3], color: '#4a4440' });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.17, 0), { position: [-1 + Math.cos(a) * 0.85, fy + 0.08, 3 + Math.sin(a) * 0.85], color: '#6d6258' });
    }
    for (let i = 0; i < 3; i++) ctx.solid.box(0.1, 0.1, 0.8, { position: [-1, fy + 0.08, 3], rotation: [0, i * 1.1, 0], color: '#1e1a18' });

    // The broken bow of fine steel on the ground beside an empty quiver.
    const by = ctx.heightAt(-2.6, 7);
    bow(ctx, { x: -2.6, y: by + 0.05, z: 7, rot: 0.4, color: '#a8b0b8', broken: true, size: 0.7 });
    ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.07, 0.6, 6), { position: [-1.7, by + 0.08, 7.5], rotation: [Math.PI / 2, 0.8, 0], color: '#6a4a2e' });

    // The family, hungry and murmuring: sitting, kneeling, heads bowed.
    const family = [
      [-3.5, 2.5, '#e2d6bc', '#5a6a8a', true], [-4.8, 4.2, '#8a5a6a', '#c9b48e', true], [1.6, 4.5, '#7a4e36', '#a34f32', false], [2.6, 2.6, '#6e5a44', '#3f4d5e', false],
      [-1.2, 0.2, '#a0825c', '#556246', true], [0.8, 1.0, '#94704e', null, true], [-6.5, 7.5, '#d8cdb5', '#6d3b2e', true], [4.2, 6.5, '#4f5a6b', '#8a7a5a', true], [-8, 2, '#b59a72', '#5a3d2b', true],
    ];
    for (const [x, z, robe, mantle, kneel] of family) person(ctx, { x, z, face: [-1 + r.range(-2, 2), 3 + r.range(-2, 2)], robe, mantle: mantle ?? undefined, skin: '#9b6a46', hood: r() < 0.5, kneel });
    for (const [x, z] of [[-2.8, 5.8], [3.4, 5.4]]) person(ctx, { x, z, face: [-1, 3], robe: '#c4b090', skin: '#a87652', scale: 0.6, kneel: true });
    camel(ctx, { x: 16, z: -6, rot: -2, sitting: true, color: '#a07a50' });
    camel(ctx, { x: -16, z: -6, rot: 1.2, sitting: true });
    for (let i = 0; i < 8; i++) {
      const x = r.range(-12, 12), z = r.range(-8, 10);
      if (tents.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 4) || Math.hypot(x + 1, z - 3) < 4) continue;
      if (r() < 0.5) jar(ctx, { x, z, size: 0.5 });
      else bundle(ctx, { x, z, size: 0.7, color: r.pick(['#9a8462', '#7a5a3c']) });
    }

    // The trail up the mountain, with Nephi climbing, wooden bow in hand.
    for (let i = 0; i < TRAIL.length - 1; i++) {
      const [ax, az] = TRAIL[i], [bx, bz] = TRAIL[i + 1];
      for (let k = 0; k < 3; k++) {
        const t = k / 3;
        const x = ax + (bx - ax) * t + r.range(-0.3, 0.3), z = az + (bz - az) * t + r.range(-0.3, 0.3);
        ctx.solid.box(1.2, 0.12, 0.9, { position: [x, ctx.heightAt(x, z) + 0.02, z], rotation: [0, Math.atan2(bx - ax, bz - az), 0], color: '#cdb08a', jitter: 0.06 });
      }
    }
    const ni = Math.floor(NEPHI_T * (TRAIL.length - 1));
    const [nx, nz] = TRAIL[ni];
    const nephi = person(ctx, { x: nx, z: nz, face: TRAIL[ni + 2], scale: 1.05, robe: '#ece2c8', mantle: '#3a5a8a', skin: '#a87652' });
    const wood = new THREE.MeshLambertMaterial({ color: '#7a5030', flatShading: true });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 4, 10, Math.PI * 0.85).rotateZ(Math.PI * 0.075 + Math.PI / 2), wood);
    arc.position.set(0.34, 1.0, 0.08);
    arc.rotation.y = Math.PI / 2;
    nephi.add(arc);
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 6), new THREE.MeshLambertMaterial({ color: '#5a3a24', flatShading: true }));
    quiver.position.set(-0.12, 1.25, -0.22);
    quiver.rotation.z = 0.5;
    nephi.add(quiver);
    for (let i = 0; i < 4; i++) {
      const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 3), new THREE.MeshLambertMaterial({ color: '#c8b088' }));
      arrow.position.set(-0.28 + i * 0.02, 1.55, -0.22);
      arrow.rotation.z = 0.5;
      nephi.add(arrow);
    }

    // Wild beasts on the heights above.
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2, d = r.range(3, 14);
      goat(ctx, { x: PEAK[0] + Math.cos(a) * d, z: PEAK[1] + 14 + Math.sin(a) * d, rot: r() * 6, color: r.pick(['#a88a62', '#8a6e4e', '#c4a47a']), horns: '#4a3a2a', scale: 1.4 });
    }
  },
};
