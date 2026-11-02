// John 19:16-30. Golgotha, a rocky rise outside the walls of Jerusalem, under the darkness
// over the land. Three crosses stand at a distance; Mary, John and the women wait at the foot.
import * as THREE from 'three';
import { house, person, cityWall, box, glowAt } from './lib/nt-19-kit.js';

const HILL = [0, -42];
const CROSSES = [[-6, -41.5], [0, -42.5], [6, -41.5]];
const START = [-4, -6];
const muted = { robes: ['#5e4b3a', '#4a3a2c', '#6e5a44', '#4f4a52', '#5a4434', '#3e3a40', '#6b5a48'], mantles: ['#3a2c22', '#2f3a48', '#4a3a2c', '#3c3436'], skins: ['#7a4c31', '#8a5a3c', '#6e4630'], mantleChance: 0.8, hoodChance: 0.6 };

export default {
  title: 'John 19:16-30: The Crucifixion',
  seed: 23,
  fov: 58,
  exposure: 1.3,

  sun: { direction: [0.05, 0.16, -1], color: '#b08070', intensity: 1.4 },
  light: { sky: '#8a7a8c', ground: '#4a3a32', hemi: 2.4 },
  sky: { top: '#16141a', horizon: '#5a3a2e', ground: '#1e1614', sunColor: '#8a4a30', glow: 0.7 },
  fog: { color: '#2a201e', near: 40, far: 360 },
  clouds: { count: 120, shadow: '#1a1719', lit: '#4a3430', rim: '#7a4a38', distance: [180, 800], altitude: [70, 170], hole: 0.25 },
  mountains: { count: 34, color: '#1c1818', radius: [420, 700], height: [40, 110], haze: 0.45 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 0.8, contrast: 1.08, vignette: 0.6, shadowTint: '#1a1020', highlightTint: '#e8c8a8' },
  shadow: { center: [0, -25], radius: 50 },

  player: { start: START, yaw: -0.1, pitch: 0.16, eye: 1.65, speed: 4 },

  terrain: {
    size: 900,
    segments: 170,
    seed: 23,
    hills: 22,
    bumps: 0.5,
    flats: [
      { x: 0, z: 0, r: 40, falloff: 30, height: 0 },
      { x: HILL[0], z: HILL[1], r: 7, falloff: 26, height: 11 },
    ],
    colors: { ground: '#7a6a56', groundAlt: '#6e5e4a', grass: '#66603e', high: '#84745e', rock: '#6e6456' },
    patches: [{ x: HILL[0], z: HILL[1], r: 26, color: '#7a6a58', strength: 0.6, rough: 0.5 }],
  },

  scatter: [
    { type: 'rock', count: 40, center: HILL, ring: [6, 40], spacing: 5, seed: 3, avoid: [{ x: -4, z: -6, r: 14 }, { rect: [0, -20, 14, 40] }], props: { color: '#6e6458', size: 1.4 } },
    { type: 'rock', count: 30, center: [0, 0], ring: [30, 200], spacing: 12, seed: 4, avoid: [{ x: -4, z: -6, r: 14 }], props: { color: '#5e5448' } },
    { type: 'tree', count: 20, center: [0, 0], ring: [50, 200], spacing: 12, seed: 5, props: { kind: 'burnt' } },
  ],

  crowd: {
    palette: muted,
    groups: [
      { count: 90, center: HILL, ring: [24, 40], arc: [0.9, 2.3], spacing: 1.1, face: HILL, children: 0.05, kneel: 0.15, seed: 51, avoid: [{ x: START[0], z: START[1], r: 5 }] },
      { count: 30, center: HILL, ring: [24, 34], arc: [-0.4, 0.5], spacing: 1.4, face: HILL, children: 0, seed: 52 },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    const wood = '#3e3026';

    // Three crosses with simple, restrained figures.
    CROSSES.forEach(([x, z], i) => {
      const center = i === 1;
      const y = ctx.heightAt(x, z) - 0.6;
      const h = center ? 6.8 : 6.2;
      box(ctx, { x, z, y, w: 0.32, h, d: 0.32, color: wood });
      box(ctx, { x, z, y: y + h - 1.6, w: 2.8, h: 0.26, d: 0.28, color: wood, collide: false });
      ctx.solid.add(new THREE.DodecahedronGeometry(0.6, 0), { position: [x, y + 0.4, z], scale: [1.3, 0.6, 1.3], color: '#5e5448' });
      const cloth = center ? '#d8d0c0' : '#8a7a68';
      const skin = center ? '#9a6e52' : '#7a5440';
      const bz = z + 0.22, by = y + h - 3.3;
      ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.2, 0.8, 7), { position: [x, by + 0.95, bz], color: skin, jitter: 0.03 });
      ctx.solid.add(new THREE.CylinderGeometry(0.21, 0.17, 0.5, 7), { position: [x, by + 0.35, bz], color: cloth, jitter: 0.03 });
      ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.06, 0.6, 5), { position: [x - 0.06, by - 0.2, bz], color: skin });
      ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.06, 0.6, 5), { position: [x + 0.06, by - 0.2, bz], color: skin });
      ctx.solid.add(new THREE.IcosahedronGeometry(0.15, 0), { position: [x, by + 1.5, bz + 0.06], rotation: [0.35, 0, 0], scale: [1, 1.1, 1], color: '#3a2a20' });
      ctx.solid.box(2.3, 0.1, 0.12, { position: [x, by + 1.3, bz], rotation: [0, 0, 0], color: skin });
    });
    glowAt(ctx, [CROSSES[1][0], ctx.heightAt(...CROSSES[1]) + 3, CROSSES[1][1] + 0.4], 9, '#ffe8c8', 0.18);
    const l = new THREE.PointLight('#ffe0c0', 10, 16, 1.6);
    l.position.set(CROSSES[1][0], ctx.heightAt(...CROSSES[1]) + 3, CROSSES[1][1] + 3);
    ctx.scene.add(l);

    // Mary, John and the women at the foot of the cross.
    const [cx, cz] = CROSSES[1];
    person(ctx, { x: cx - 1.4, z: cz + 3, face: [cx, cz], robe: '#4a5a78', mantle: '#2f3a58', hood: true, skin: '#8a5a3c' });
    person(ctx, { x: cx + 0.2, z: cz + 3.4, face: [cx, cz], robe: '#8a6a4a', mantle: '#6e3a2c', hood: false, skin: '#9b6a46' });
    person(ctx, { x: cx - 2.6, z: cz + 3.6, face: [cx, cz], pose: 'kneel', robe: '#6e5a44', mantle: '#4a3a2c', hood: true });
    person(ctx, { x: cx + 1.4, z: cz + 3.8, face: [cx, cz], robe: '#7a4e36', mantle: '#3c3436', hood: true });
    person(ctx, { x: cx - 0.6, z: cz + 4.6, face: [cx, cz], pose: 'kneel', robe: '#5e4b3a', mantle: '#3a2c22', hood: true });

    // Roman soldiers: red cloaks, bronze helmets, spears.
    for (const [x, z] of [[-8, -37], [8.5, -37.5], [-3, -35.5], [11, -42], [-11, -43]]) {
      const y = ctx.heightAt(x, z);
      person(ctx, { x, z, face: [x * 0.4, -60], robe: '#7a6a58', mantle: '#8a2a20', hood: false, skin: '#8a5a3c' });
      ctx.solid.add(new THREE.SphereGeometry(0.16, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), { position: [x, y + 1.6, z], color: '#8a7040' });
      ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, 2.8, 4), { position: [x + 0.28, y + 1.3, z + 0.1], rotation: [0.05, 0, -0.06], color: '#4a3a2a' });
    }
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2;
      ctx.solid.box(0.9, 0.08, 1.3, { position: [6 + Math.cos(a), ctx.heightAt(6, -38) + 0.05, -38 + Math.sin(a)], rotation: [0, a, 0], color: '#5a3a2c', jitter: 0.06 });
    }

    // Jerusalem's wall and towers behind, dim under the darkness.
    cityWall(ctx, { from: [48, -160], to: [48, 60], h: 11, thick: 3, color: '#6e665a', towerEvery: 34, gate: [48, -30] });
    for (let i = 0; i < 70; i++) {
      const x = r.range(56, 180), z = r.range(-160, 60);
      house(ctx, { x, z, rot: Math.floor(r() * 4) * (Math.PI / 2), w: r.range(6, 10), d: r.range(5, 9), h: r.range(4, 9), color: '#5a544c', door: false });
    }
    box(ctx, { x: 110, z: -90, y: ctx.heightAt(110, -90), w: 14, h: 28, d: 26, color: '#6a6458' });
    for (let i = 0; i < 6; i++) glowAt(ctx, [r.range(56, 120), r.range(8, 14), r.range(-120, 40)], r.range(3, 5), '#ff9a50', 0.4);

    // A path of rough stones climbing the hill.
    for (let t = 0; t < 1; t += 0.03) {
      const x = 6 * Math.sin(t * 3) + r.range(-0.6, 0.6), z = 20 - t * 56;
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.2, 0.4), 0), { position: [x, ctx.heightAt(x, z), z], scale: [1, 0.4, 1], color: '#7a6e60', jitter: 0.08 });
    }
  },
};
