// Moses 5:5-8: outside the Garden of Eden, Adam offers the firstlings of his flock on an altar.
// An angel appears and asks why he offers sacrifice. The garden, guarded by cherubim and a
// flaming sword, lies to the north (-z) behind the altar.
import * as THREE from 'three';
import { person, angel, stoneAltar, fire, sheep, stone, box } from './lib/pgp-01-kit.js';

const ALTAR = [0, 0];
const GARDEN = [0, -92];
const GATE = [18, -46];
const HUT = [24, 18];

export default {
  title: 'Moses 5:5-8: Adam offers sacrifice',
  seed: 202,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.85, 0.24, -0.3], color: '#ffc488', intensity: 2.8 },
  light: { sky: '#9ab0d8', ground: '#5e4a36', hemi: 1.0 },
  sky: { top: '#4a6094', horizon: '#f4c890', ground: '#c8a07a', sunColor: '#ffdcaa', glow: 1.3 },
  fog: { color: '#d8b490', near: 90, far: 600 },
  clouds: { count: 50, shadow: '#7a6a78', lit: '#ffcf98', rim: '#fff0d0', distance: [300, 900], altitude: [100, 240], hole: 0.2 },
  mountains: { count: 40, color: '#6a6458', radius: [500, 740], height: [50, 130], haze: 0.5 },
  bloom: { strength: 0.6, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.42, shadowTint: '#30285e', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -6], radius: 50 },

  player: { start: [-4.5, 7.5], yaw: -0.48, pitch: 0.0, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 23,
    hills: 22,
    bumps: 0.3,
    flats: [{ x: 0, z: -10, r: 70, falloff: 50, height: 0 }, { x: GARDEN[0], z: GARDEN[1], r: 50, falloff: 30, height: 1.5 }],
    colors: { ground: '#8c7a52', groundAlt: '#7c6c48', grass: '#6c7a3c', high: '#7a7050', rock: '#6e6252' },
    patches: [
      { x: GARDEN[0], z: GARDEN[1], r: 58, color: '#4e8a3a', strength: 0.95, rough: 0.3 },
      { x: ALTAR[0], z: ALTAR[1], r: 8, color: '#9a8a6a', strength: 0.7, rough: 0.4 },
      { x: -26, z: 16, r: 18, color: '#5e4630', strength: 0.85, rough: 0.2 },
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: GARDEN, ring: [8, 56], spacing: 5.5, seed: 8, avoid: [{ rect: [GATE[0], GATE[1] - 10, 14, 30] }], props: { kind: 'broad', leaf: '#4f8a34', h: 12 } },
    { type: 'tree', count: 30, center: GARDEN, ring: [10, 50], spacing: 7, seed: 18, avoid: [{ rect: [GATE[0], GATE[1] - 10, 14, 30] }], props: { kind: 'palm', leaf: '#5a9a3c', h: 13 } },
    { type: 'tree', count: 40, center: [0, 0], ring: [90, 300], spacing: 12, seed: 9, props: { kind: 'broad', leaf: '#6a7a3a' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [40, 260], spacing: 12, seed: 10, avoid: [{ rect: [GARDEN[0], GARDEN[1], 130, 120] }, { rect: [-15, 12, 30, 30] }], props: {} },
  ],

  effects: [
    { type: 'sunShafts', center: [-60, -60], count: 6, spread: 80, length: 400, width: [8, 20], opacity: 0.06 },
  ],

  custom(ctx) {
    const r = ctx.rand;

    // The altar with the offering burning on it.
    const top = stoneAltar(ctx, { x: ALTAR[0], z: ALTAR[1], w: 2.0, d: 1.3, h: 1.0 });
    fire(ctx, { x: ALTAR[0] - 0.3, z: ALTAR[1], y: top, scale: 0.6, light: 22, distance: 16, smoke: 0, ring: false });
    ctx.effects.smoke({ position: [ALTAR[0], top + 1, ALTAR[1]], count: 8, height: 16, size: 0.22, color: '#d8d0c4', wind: [0.3, -0.2], seed: 4 });
    fire(ctx, { x: ALTAR[0] + 0.4, z: ALTAR[1] + 0.1, y: top, scale: 0.45, light: 0, smoke: 0, ring: false });

    // Adam kneels at the altar, Eve beside him. The angel stands across the altar, asking why.
    person(ctx, { x: 1.9, z: 1.3, face: ALTAR, robe: '#8a6a48', mantle: '#5e4632', skin: '#a8754f', kneel: true, arms: 'out' });
    person(ctx, { x: 3.2, z: 2.6, face: ALTAR, robe: '#b89a72', mantle: '#7a5a42', skin: '#b5835e', hood: true, kneel: true });
    angel(ctx, { x: -2.6, z: -1.2, face: [2, 1.6], scale: 1.15, arms: 'out', light: 18, distance: 18, halo: 3.2, float: 0.35 });
    ctx.effects.motes({ position: [-2.6, 0, -1.2], radius: 2, height: 14, count: 90 });
    ctx.effects.beam({ position: [-2.6, 0, -1.2], height: 160, radiusBottom: 1.6, radiusTop: 6, color: '#fff3dc', opacity: 0.2 });

    // Firstlings of the flock, and the flock grazing nearby.
    sheep(ctx, { x: 2.6, z: -1.2, rot: -2.2, scale: 0.75, color: '#f4f0e6', lying: true });
    for (let i = 0; i < 18; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 9;
      sheep(ctx, { x: 18 + Math.cos(a) * d, z: -6 + Math.sin(a) * d, rot: r() * 6, scale: r.range(0.8, 1.05), color: r() < 0.8 ? '#ebe5d6' : '#5a4a40' });
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      box(ctx, { x: 18 + Math.cos(a) * 11.5, z: -6 + Math.sin(a) * 11.5, y: ctx.heightAt(18 + Math.cos(a) * 11.5, -6 + Math.sin(a) * 11.5) - 0.1, w: 0.1, h: 0.9, d: 0.1, color: '#7a6448' });
    }

    // Adam's tilled field: furrows of turned earth with young grain.
    for (let row = 0; row < 14; row++) {
      for (let k = 0; k < 8; k++) {
        const x = -26 + k * 2.6, z = 2 + row * 1.6;
        ctx.solid.box(2.4, 0.22, 0.6, { position: [x, ctx.heightAt(x, z) + 0.05, z], color: '#4e3a28', jitter: 0.06 });
        if ((row + k) % 2 === 0) ctx.solid.add(new THREE.ConeGeometry(0.18, 0.5, 4), { position: [x + r.range(-0.8, 0.8), ctx.heightAt(x, z) + 0.4, z], color: '#8a9a3a' });
      }
    }

    // Adam's simple dwelling of stone and thatch.
    const hy = ctx.heightAt(...HUT) - 0.2;
    for (const [lx, lz, w, d] of [[0, -2.6, 6, 0.6], [-2.7, 0, 0.6, 5.8], [2.7, 0, 0.6, 5.8], [-1.9, 2.6, 2.2, 0.6], [1.9, 2.6, 2.2, 0.6]]) {
      box(ctx, { x: HUT[0] + lx, z: HUT[1] + lz, y: hy, w, h: 2.4, d, color: '#9a8668' });
    }
    ctx.solid.add(new THREE.ConeGeometry(4.8, 2.6, 4), { position: [HUT[0], hy + 3.7, HUT[1]], rotation: [0, Math.PI / 4, 0], color: '#a88c52', jitter: 0.08 });

    // The garden edge: a living hedge of thick green, with the way of the tree of life open at the gate.
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2;
      const x = GARDEN[0] + Math.cos(a) * 60, z = GARDEN[1] + Math.sin(a) * 52;
      if (Math.abs(x - GATE[0]) < 6 && z > GARDEN[1]) continue;
      const s = r.range(3, 4.6);
      ctx.solid.add(new THREE.IcosahedronGeometry(s, 0), { position: [x, ctx.heightAt(x, z) + s * 0.6, z], rotation: [r() * 3, r() * 3, 0], scale: [1.2, 0.9, 1], color: '#3e7a30', jitter: 0.1 });
      ctx.colliders.add({ x, z, w: s * 2, d: s * 2, bottom: -5, top: 8 });
    }

    // Cherubim and a flaming sword turning every way at the gate.
    const gy = ctx.heightAt(...GATE);
    for (const side of [-1, 1]) {
      angel(ctx, { x: GATE[0] + side * 4.5, z: GATE[1] + 2, face: [0, 10], scale: 1.6, arms: 'out', light: 0, halo: 7, float: 0.6 });
    }
    const sword = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0).scale(0.35, 5, 0.12), new THREE.MeshBasicMaterial({ color: '#ffb45a', toneMapped: false }));
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0).scale(0.15, 4.4, 0.06), new THREE.MeshBasicMaterial({ color: '#fff3c0', toneMapped: false }));
    sword.add(blade, core);
    sword.position.set(GATE[0], gy + 7, GATE[1] + 1);
    sword.scale.setScalar(1.5);
    ctx.scene.add(sword);
    const glow = ctx.effects.halo({ position: [GATE[0], gy + 7, GATE[1] + 1], size: 22, color: '#ffb060', opacity: 0.7 });
    const pl = new THREE.PointLight('#ffa850', 60, 40, 1.4);
    pl.position.set(GATE[0], gy + 6, GATE[1] + 3);
    ctx.scene.add(pl);
    ctx.onFrame((t) => {
      sword.rotation.y = t * 1.6;
      sword.rotation.z = Math.sin(t * 0.7) * 0.5;
      glow.scale.setScalar(22 + Math.sin(t * 5) * 1.6);
    });

    // Scattered field stones on the plain.
    for (let i = 0; i < 24; i++) {
      const a = r() * Math.PI * 2, d = r.range(8, 40);
      stone(ctx, { x: Math.cos(a) * d, z: Math.sin(a) * d, size: r.range(0.2, 0.5), color: '#8a7a64' });
    }
  },
};
