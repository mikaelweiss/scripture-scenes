// Exodus 2:1-10: Pharaoh's daughter comes down to wash at the Nile, sees the ark of bulrushes
// among the flags, and sends her maid to fetch it. Miriam watches from the reeds.
// The river runs east-west to the north (-z) of the player.
import * as THREE from 'three';
import { person, water, reeds, palm, pyramid } from './lib/ot-13-kit.js';

const RIVER_Z = -30;
const WATER_Y = -0.4;
const BASKET = [3.4, -10.4];

const riverFlats = Array.from({ length: 41 }, (_, i) => ({ x: -400 + i * 20, z: RIVER_Z, r: 16, falloff: 6, height: -2.4 }));

function basket(ctx) {
  const g = new THREE.Group();
  const weave = new THREE.MeshLambertMaterial({ color: '#c49a58', flatShading: true });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), weave);
  body.scale.set(0.65, 0.55, 1);
  body.rotation.x = Math.PI;
  body.position.y = 0.0;
  g.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 4, 10), new THREE.MeshLambertMaterial({ color: '#7a5a30', flatShading: true }));
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(0.78, 1.2, 1);
  rim.position.y = 0.02;
  g.add(rim);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#8f6a38', flatShading: true }));
  lid.scale.set(0.7, 0.35, 1.05);
  lid.position.set(0, 0.02, -0.12);
  g.add(lid);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.3), new THREE.MeshLambertMaterial({ color: '#efe8d8' }));
  cloth.position.set(0, 0.06, 0.25);
  g.add(cloth);
  g.scale.setScalar(1.8);
  g.position.set(BASKET[0], WATER_Y, BASKET[1]);
  g.rotation.y = 0.6;
  g.traverse((m) => (m.castShadow = true));
  ctx.scene.add(g);
  ctx.onFrame((t) => {
    g.position.y = WATER_Y + Math.sin(t * 1.4) * 0.03;
    g.rotation.z = Math.sin(t * 1.1) * 0.05;
  });
}

export default {
  title: 'Exodus 2:1-10: Moses in the bulrushes',
  seed: 2,
  fov: 44,
  exposure: 1.0,

  sun: { direction: [0.8, 0.35, -0.3], color: '#ffd6a0', intensity: 3.0 },
  light: { sky: '#a8c4e8', ground: '#7a6a48', hemi: 1.05 },
  sky: { top: '#5f8cc8', horizon: '#f6dcb4', ground: '#c8b088', sunColor: '#ffe6bc', glow: 1.1 },
  fog: { color: '#e4d2b0', near: 90, far: 520 },
  clouds: { count: 18, shadow: '#c0aa9a', lit: '#fff2dc', rim: '#fffaf0', distance: [350, 900], altitude: [140, 260], hole: 0.3 },
  mountains: { count: 30, color: '#b8a080', radius: [600, 800], height: [20, 50], haze: 0.7 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.35, shadowTint: '#2a3a50', highlightTint: '#ffe8c4' },
  shadow: { center: [0, -6], radius: 40 },

  player: { start: [4.6, 3.2], yaw: 0.1, pitch: -0.04, eye: 1.65, speed: 4 },

  terrain: {
    size: 640,
    segments: 320,
    seed: 15,
    hills: 0,
    bumps: 0.15,
    flats: riverFlats,
    colors: { ground: '#b09868', groundAlt: '#9e8a5a', grass: '#7a8a44', high: '#a89870', rock: '#7a6a50' },
    patches: [{ x: 0, z: -7, r: 9, color: '#8a7650', strength: 0.5, rough: 0.6 }],
  },

  scatter: [
    { type: 'tree', count: 40, center: [0, 30], ring: [30, 200], arc: [0.2, Math.PI - 0.2], spacing: 8, seed: 6, props: { kind: 'palm', leaf: '#5d7a34' } },
    { type: 'tree', count: 45, center: [0, -60], ring: [0, 220], arc: [Math.PI + 0.3, 2 * Math.PI - 0.3], spacing: 8, seed: 7, props: { kind: 'palm', leaf: '#587534' } },
  ],

  custom(ctx) {
    water(ctx, { x: 0, z: RIVER_Z + 6, y: WATER_Y, w: 160, d: 56, seg: 56, color: '#3f7a80', opacity: 0.9, amp: 0.07, freq: 0.5 });
    const far = new THREE.Mesh(new THREE.PlaneGeometry(1000, 52).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: '#4a8088', emissive: '#0a1a20', shininess: 40 }));
    far.position.set(0, WATER_Y - 0.03, RIVER_Z + 4);
    ctx.scene.add(far);

    basket(ctx);
    reeds(ctx, { x: 7.0, z: -11.6, r: 2.0, count: 60, papyrus: 0.5, minY: -0.9 });
    reeds(ctx, { x: 1.0, z: -11.8, r: 1.8, count: 40, papyrus: 0.5, minY: -0.9 });
    reeds(ctx, { x: 4.0, z: -13.2, r: 2.2, count: 50, papyrus: 0.5, minY: -0.9 });
    reeds(ctx, { x: 9.5, z: -7.5, r: 2.6, count: 70, papyrus: 0.45, minY: -0.9 });
    for (let x = -60; x < 70; x += 4 + ctx.rand() * 5) {
      if (x > -6 && x < 12) continue;
      reeds(ctx, { x, z: -8.5 + ctx.rand.range(-2, 2), r: ctx.rand.range(1.5, 3), count: 35, papyrus: 0.4, minY: -0.9 });
    }
    for (let x = -80; x < 80; x += 5 + ctx.rand() * 6) reeds(ctx, { x, z: RIVER_Z - 15 + ctx.rand.range(-2, 1), r: ctx.rand.range(1.5, 3), count: 25, papyrus: 0.5, minY: -0.9 });

    palm(ctx, { x: -13, z: -6.5, h: 8 });
    palm(ctx, { x: -11.5, z: 1, h: 6.5 });
    palm(ctx, { x: 14, z: -2, h: 7.5 });
    palm(ctx, { x: 17, z: 3, h: 9 });

    pyramid(ctx, { x: -140, z: -520, size: 130 });
    pyramid(ctx, { x: 30, z: -560, size: 100 });
    pyramid(ctx, { x: 120, z: -600, size: 70 });

    // Pharaoh's daughter at the water's edge, pointing to the ark.
    const linen = '#f4efe2';
    person(ctx, { x: -1.2, z: -6.6, face: BASKET, robe: linen, skin: '#a87652', arms: ['down', 'forward'], collar: '#d6a83a', nemes: '#2e2620', belt: '#2f6aa0', scale: 1.02 });
    // Her maid wading out to fetch it.
    person(ctx, { x: 2.2, z: -9.6, y: -0.95, face: BASKET, robe: '#e6dcc4', skin: '#9b6a46', arms: 'forward', nemes: '#2e2620' });
    // Her maidens walking along the river's side.
    const maidens = [[-4.4, -5.2], [-5.8, -3.4], [-3.2, -3.2], [-7.2, -5.8]];
    maidens.forEach(([x, z], i) => person(ctx, { x, z, face: [-1, -7], robe: i % 2 ? '#e8e0c8' : '#d8ccb0', skin: '#9b6a46', nemes: '#2e2620', collar: i === 0 ? '#3f8a8a' : null, arms: i === 2 ? 'face' : 'down' }));
    // A parasol carried by one of them.
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), { position: [-5.6, 1.3, -3.1], color: '#6a4a2c' });
    ctx.solid.add(new THREE.ConeGeometry(1.1, 0.4, 8), { position: [-5.6, 2.7, -3.1], color: '#e8d8a8' });
    // Miriam, watching from the reeds.
    person(ctx, { x: 7.6, z: -4.6, face: BASKET, robe: '#7a5a3c', mantle: '#a34f32', hood: true, skin: '#9b6a46', pose: 'kneel', scale: 0.8 });
    reeds(ctx, { x: 8.6, z: -3.6, r: 1.1, count: 22, papyrus: 0.3 });

    // washing jars and folded linen on the bank
    for (const [x, z, c] of [[-6.2, -1.6, '#b0603a'], [-6.7, -1.1, '#c0784a'], [-5.6, -0.9, '#a8583a']]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.12, 0.5, 7), { position: [x, ctx.heightAt(x, z) + 0.22, z], color: c });
      ctx.solid.add(new THREE.SphereGeometry(0.22, 7, 4), { position: [x, ctx.heightAt(x, z) + 0.35, z], scale: [1, 0.8, 1], color: c });
    }
    ctx.solid.box(0.8, 0.12, 0.5, { position: [-7.5, ctx.heightAt(-7.5, -2.2) + 0.08, -2.2], color: '#f0e8d4' });
  },
};
