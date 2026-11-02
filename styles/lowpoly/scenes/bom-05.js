// 1 Nephi 16:10: Early in the morning Lehi finds a round ball of fine brass with two spindles
// on the ground at his tent door. The desert camp at sunrise; the sun rises in the east (+x).
import * as THREE from 'three';
import { tent, fire, camel, goat, jar, bundle, person } from './lib/bom-01-kit.js';

const DOOR = [0, -2.4];
const BALL = [0.35, -1.0];

export default {
  title: '1 Nephi 16:10: The Liahona at the tent door',
  seed: 505,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.85, 0.22, 0.2], color: '#ffb878', intensity: 3.0 },
  light: { sky: '#9ab0dc', ground: '#8a5a40', hemi: 1.0 },
  sky: { top: '#5a7ab8', horizon: '#ffc090', ground: '#d8a880', sunColor: '#ffe0b0', glow: 1.4 },
  fog: { color: '#e8b896', near: 70, far: 520 },
  clouds: { count: 30, shadow: '#a08098', lit: '#ffc8a0', rim: '#fff0d8', distance: [300, 900], altitude: [100, 220], hole: 0.25 },
  mountains: { count: 44, color: '#a06a58', radius: [460, 700], height: [40, 110], haze: 0.5 },
  bloom: { strength: 0.5, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.4, shadowTint: '#3a2a60', highlightTint: '#ffe0b8' },
  shadow: { center: [0, -4], radius: 40 },

  player: { start: [2.6, 5.2], yaw: 0.26, pitch: -0.2, eye: 1.65, speed: 4 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 77,
    hills: 22,
    bumps: 0.5,
    flats: [{ x: 0, z: -6, r: 32, falloff: 40, height: 0 }],
    colors: { ground: '#d6aa78', groundAlt: '#c89a68', grass: '#b8905c', high: '#c48a60', rock: '#a87050' },
    patches: [{ x: 0, z: -6, r: 22, color: '#c49a72', strength: 0.5, rough: 0.5 }],
  },

  scatter: [
    { type: 'rock', count: 40, center: [0, 0], ring: [40, 300], spacing: 14, seed: 5, props: { color: '#b07a58' } },
    { type: 'tree', count: 20, center: [0, 0], ring: [30, 160], spacing: 14, seed: 6, props: { kind: 'broad', h: 2.8, leaf: '#7a7a44' } },
  ],

  custom(ctx) {
    const r = ctx.rand;
    tent(ctx, { x: 0, z: -6, rot: 0, w: 6, d: 7, h: 3, color: '#3e2f26', stripe: '#6e5640', panels: 5 });
    const others = [
      [-10, -2, 0.7], [-13, -12, 1.1], [10, -10, -0.8], [-4, -18, 0.2], [8, -21, -0.3], [15, 0, -1.4], [-18, 4, 1.4],
    ];
    for (const [x, z, rot] of others) tent(ctx, { x, z, rot, w: r.range(4.5, 5.5), d: r.range(5, 6.5), h: r.range(2.4, 2.8), color: r.pick(['#4a3a2c', '#3a2c22', '#5a4636']), stripe: r.pick(['#8a6a48', '#a08060', '#6e5640']) });
    fire(ctx, { x: -4.5, z: 3.5, scale: 0.6, light: 3, distance: 6, smoke: 5 });

    // The ball of fine brass with its two spindles, softly catching the morning light.
    const y = ctx.heightAt(...BALL);
    const brass = new THREE.MeshLambertMaterial({ color: '#d8a848', emissive: '#8a5a12', emissiveIntensity: 0.7, flatShading: true });
    const dark = new THREE.MeshLambertMaterial({ color: '#7a5420', emissive: '#3a2408', emissiveIntensity: 0.5, flatShading: true });
    const ball = new THREE.Group();
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), brass);
    sphere.position.y = 0.22;
    ball.add(sphere);
    for (const [rx, rz] of [[Math.PI / 2, 0], [Math.PI / 2, Math.PI / 2], [0.4, 0.3]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.014, 4, 18), dark);
      ring.position.y = 0.22;
      ring.rotation.set(rx, 0, rz);
      ball.add(ring);
    }
    const spindles = [];
    for (const [len, off] of [[0.26, 0.0], [0.2, 1.7]]) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.018, len, 4).rotateZ(-Math.PI / 2).translate(len / 2, 0, 0), dark);
      s.position.y = 0.46 + off * 0.01;
      s.rotation.y = off;
      ball.add(s);
      spindles.push(s);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.05, 6), brass);
    hub.position.y = 0.45;
    ball.add(hub);
    ball.position.set(BALL[0], y, BALL[1]);
    ball.traverse((o) => (o.castShadow = true));
    ctx.scene.add(ball);
    ctx.onFrame((t) => {
      spindles[0].rotation.y = 0.9 + Math.sin(t * 0.7) * 0.15;
      spindles[1].rotation.y = 2.4 + Math.sin(t * 0.5 + 1) * 0.2;
    });
    const glint = new THREE.PointLight('#ffd890', 3, 4, 1.5);
    glint.position.set(BALL[0], y + 0.9, BALL[1] + 0.4);
    ctx.scene.add(glint);
    ctx.effects.halo({ position: [BALL[0], y + 0.25, BALL[1]], size: 1.6, opacity: 0.45, color: '#ffe0a0' });
    ctx.effects.ring({ position: [BALL[0], y + 0.03, BALL[1]], radius: 0.55, width: 0.35, color: '#ffd890', opacity: 0.35 });

    // Lehi kneels to look at it; Sariah at the door; Nephi and others gather in the dawn.
    person(ctx, { x: BALL[0] - 0.85, z: BALL[1] + 0.1, face: [BALL[0], BALL[1]], robe: '#e2d6bc', mantle: '#5a6a8a', skin: '#a8754f', hood: true, kneel: true });
    person(ctx, { x: DOOR[0] - 1.7, z: DOOR[1] + 0.7, face: [BALL[0], BALL[1]], robe: '#8a5a6a', mantle: '#c9b48e', skin: '#a87652', hood: true });
    person(ctx, { x: BALL[0] + 1.3, z: BALL[1] + 0.8, face: [BALL[0], BALL[1]], robe: '#c4b090', mantle: '#7d5c3e', skin: '#a87652' });
    person(ctx, { x: BALL[0] + 2.4, z: BALL[1] - 0.6, face: [BALL[0], BALL[1]], robe: '#a0825c', mantle: '#556246', skin: '#9b6a46' });
    person(ctx, { x: -3.2, z: 0.2, face: [BALL[0], BALL[1]], robe: '#7a4e36', mantle: '#a34f32', skin: '#9b6a46' });
    person(ctx, { x: -4.6, z: -0.8, face: [BALL[0], BALL[1]], robe: '#6e5a44', mantle: '#3f4d5e', skin: '#9b6a46' });
    person(ctx, { x: -9, z: 1.5, face: [BALL[0], BALL[1]], robe: '#94704e', mantle: '#8a7a5a', skin: '#a87652', hood: true });
    person(ctx, { x: 7.5, z: -5, face: [BALL[0], BALL[1]], robe: '#d8cdb5', mantle: '#6d3b2e', skin: '#b5835e', hood: true });
    person(ctx, { x: 6.2, z: -3.2, face: [BALL[0], BALL[1]], robe: '#4f5a6b', skin: '#a87652', scale: 0.65 });

    camel(ctx, { x: 13, z: -4, rot: -2.4, sitting: true });
    camel(ctx, { x: 18, z: -9, rot: -1.6 });
    camel(ctx, { x: -15, z: -6, rot: 0.9, color: '#a07a50', sitting: true });
    for (let i = 0; i < 6; i++) goat(ctx, { x: -6 + r.range(-3, 3), z: -26 + r.range(-3, 3), rot: r() * 6, color: r.pick(['#4a3a30', '#8a7a66', '#ddd0b8']), scale: 0.8 });
    for (let i = 0; i < 14; i++) {
      const x = r.range(-14, 14), z = r.range(-20, 4);
      if (Math.hypot(x - BALL[0], z - BALL[1]) < 3.5 || Math.hypot(x, z + 6) < 5) continue;
      if (r() < 0.5) jar(ctx, { x, z, size: 0.55 });
      else bundle(ctx, { x, z, size: 0.75, color: r.pick(['#9a8462', '#7a5a3c', '#b8a07a']) });
    }
  },
};
