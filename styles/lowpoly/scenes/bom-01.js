// 1 Nephi 1: Lehi prophesies to the people of Jerusalem and they mock him.
// A crowded square in the city, about 600 BC. The temple stands on its mount to the north (-z).
import * as THREE from 'three';
import { house, cityWall, box, person, jar, bundle, frame, lowest } from './lib/bom-01-kit.js';

const LEHI = [0, -10];
const TEMPLE = [8, -132];
const STONE = '#ddcca6';

function stall(ctx, { x, z, rot = 0, cloth = '#a8452e' }) {
  const r = ctx.rand;
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  for (const [lx, lz] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.05, lz < 0 ? 2.5 : 2.1, 5), { position: [px, y + (lz < 0 ? 1.25 : 1.05), pz], color: '#5b4330' });
  }
  ctx.solid.box(3.2, 0.06, 2.3, { position: [x, y + 2.3, z], rotation: [0.17, rot, 0], color: cloth, jitter: 0.03 });
  box(ctx, { x, z, y, w: 2.6, h: 0.8, d: 1.2, rot, color: '#7a5a3c' });
  for (let i = 0; i < 5; i++) {
    const [px, pz] = at(r.range(-1.1, 1.1), r.range(-0.4, 0.4));
    if (r() < 0.5) jar(ctx, { x: px, z: pz, y: y + 0.8, size: r.range(0.25, 0.4), color: r.pick(['#a8673e', '#8c5a38', '#c48a5a']) });
    else ctx.solid.add(new THREE.DodecahedronGeometry(0.18, 0), { position: [px, y + 0.95, pz], color: r.pick(['#c8a03a', '#7a8c3a', '#a83a2a', '#d8c070']) });
  }
}

export default {
  title: '1 Nephi 1: Lehi prophesies in Jerusalem',
  seed: 101,
  fov: 46,
  exposure: 1.0,

  sun: { direction: [-0.55, 0.62, 0.35], color: '#ffe2b0', intensity: 2.8 },
  light: { sky: '#a8c0e8', ground: '#8a6e50', hemi: 1.05 },
  sky: { top: '#4f79b8', horizon: '#e8d6b8', ground: '#cdb592', sunColor: '#fff0c8', glow: 0.8 },
  fog: { color: '#dccbb0', near: 90, far: 620 },
  clouds: { count: 40, shadow: '#9aa2b8', lit: '#fff6e6', rim: '#ffffff', distance: [300, 900], altitude: [140, 260], hole: 0.1 },
  mountains: { count: 40, color: '#8f8068', radius: [480, 720], height: [30, 80], haze: 0.55 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.35, shadowTint: '#3a3050', highlightTint: '#fff0d0' },
  shadow: { center: [0, -10], radius: 70 },

  player: { start: [0, 12.6], yaw: 0, pitch: 0.0, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 41,
    hills: 40,
    bumps: 0.15,
    flats: [
      { x: 0, z: -20, r: 95, falloff: 50, height: 0 },
      { x: TEMPLE[0], z: TEMPLE[1], r: 34, falloff: 40, height: 13 },
    ],
    colors: { ground: '#b8a27c', groundAlt: '#a89070', grass: '#8a8a52', high: '#a08c6a', rock: '#9a8668' },
    patches: [{ x: 0, z: 5, r: 34, color: '#c9b58e', strength: 0.8, rough: 0.2 }],
  },

  objects: [
    { type: 'pavement', x: 0, z: 4, w: 46, d: 40, tile: 2.2, color: '#d6c4a0', damage: 0.05 },
    { type: 'pavement', x: 0, z: -60, w: 8, d: 60, tile: 2, color: '#cbb894', damage: 0.08 },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, 0], ring: [130, 320], spacing: 8, seed: 5, props: { kind: 'broad', leaf: '#6f7d42', h: 5 } },
    { type: 'tree', count: 14, center: [0, 0], ring: [30, 90], spacing: 12, seed: 6, avoid: [{ rect: [0, 0, 52, 46] }, { rect: [0, -60, 12, 80] }], props: { kind: 'broad', leaf: '#6a7a3e', h: 4.5 } },
    { type: 'rock', count: 30, center: [0, 0], ring: [140, 340], spacing: 12, seed: 7, props: { color: '#a8946e' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#4f5a6b', '#d8cdb5', '#7a3a3a', '#3e4e6a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#2e3e5e', '#8a2e2e'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e', '#c08e68'],
      mantleChance: 0.65,
      hoodChance: 0.35,
    },
    groups: [
      { count: 200, center: LEHI, ring: [3.2, 15], arc: [0.1, Math.PI - 0.1], spacing: 0.85, face: LEHI, children: 0.12, seed: 11, avoid: [{ rect: [0, 12, 8, 7] }] },
      { count: 150, center: LEHI, ring: [13, 36], arc: [-0.25, Math.PI + 0.25], spacing: 1.3, face: LEHI, children: 0.15, seed: 12, avoid: [{ rect: [0, 12, 9, 8] }, { rect: [-17, 6, 5, 4] }, { rect: [17, 2, 5, 4] }, { rect: [-15, 18, 5, 4] }] },
      { count: 60, center: [0, -45], ring: [0, 40], arc: [0, Math.PI * 2], spacing: 2.2, face: LEHI, children: 0.15, seed: 13, avoid: [{ rect: [0, 0, 52, 46] }] },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    // City blocks around the square, leaving a main street north to the temple and side lanes.
    const roofs = [];
    for (let gx = -8; gx <= 8; gx++) {
      for (let gz = -11; gz <= 7; gz++) {
        const x = gx * 10.5 + r.range(-0.8, 0.8), z = gz * 10.5 + r.range(-0.8, 0.8);
        if (Math.abs(x) < 29 && z > -24 && z < 32) continue;
        if (Math.abs(x) < 9 && z < 0) continue;
        if (Math.abs(z - 42) < 4 || Math.abs(x + 42) < 3) continue;
        if (Math.hypot(x - TEMPLE[0], z - TEMPLE[1]) < 52) continue;
        if (Math.hypot(x, z * 0.85) > 92) continue;
        const near = Math.hypot(x, z) < 45;
        const h = r.range(3.6, near ? 6.5 : 5.5);
        const tone = r.pick(['#ddcca6', '#e6d8b6', '#cdb994', '#d8c49c', '#e2d0aa']);
        const rot = Math.abs(x) > Math.abs(z) ? (x > 0 ? -Math.PI / 2 : Math.PI / 2) : z > 0 ? Math.PI : 0;
        const { top } = house(ctx, { x, z, rot: rot + r.range(-0.04, 0.04), w: r.range(7.5, 9.5), d: r.range(7, 9), h, color: tone, trim: '#bfaa82', upper: r() < 0.35 });
        if (near) roofs.push([x, z, top]);
      }
    }
    // Public building behind Lehi with a stepped porch he speaks from.
    box(ctx, { x: 0, z: -21, y: -0.3, w: 18, h: 7.5, d: 6, color: '#e4d6b4' });
    box(ctx, { x: 0, z: -21, y: 7.2, w: 19, h: 0.6, d: 7, color: '#c7b28a' });
    for (const cx of [-6, -2, 2, 6]) ctx.builders.column(ctx, { x: cx, z: -17.3, h: 6.8, radius: 0.38, color: '#e9dcbc', broken: false });
    box(ctx, { x: 0, z: -16.8, y: 6.7, w: 15, h: 0.6, d: 1.4, color: '#d2bf98', collide: false });
    box(ctx, { x: LEHI[0], z: LEHI[1] - 3.5, y: -0.2, w: 9, h: 2.4, d: 5, color: '#cdb994' });
    for (let i = 0; i < 5; i++) box(ctx, { x: LEHI[0], z: LEHI[1] - 0.6 + i * 0.45, y: -0.2, w: 4.5, h: 2.2 - i * 0.42, d: 0.46, color: '#d6c39c' });
    // Steps the player starts on, at the south edge of the square.
    box(ctx, { x: 0, z: 14, y: -0.2, w: 5, h: 1.3, d: 4, color: '#cdb994' });
    for (let i = 0; i < 3; i++) box(ctx, { x: 0, z: 11.6 - i * 0.5, y: -0.2, w: 5, h: 1.0 - i * 0.35, d: 0.5, color: '#d6c39c' });
    for (const [x, z, rot, cloth] of [[-17, 6, 0.2, '#a8452e'], [17, 2, -0.3, '#3e5e7a'], [-15, 18, 0.5, '#c49a3a'], [18, 16, -0.1, '#6e7a3a'], [-20, -6, 0.1, '#7a3a5a']]) stall(ctx, { x, z, rot, cloth });
    for (let i = 0; i < 18; i++) {
      const x = r.range(-22, 22), z = r.range(-14, 28);
      if (Math.hypot(x - LEHI[0], z - LEHI[1]) < 17 || Math.abs(x) < 5) continue;
      if (r() < 0.6) jar(ctx, { x, z, size: r.range(0.4, 0.7) });
      else bundle(ctx, { x, z, size: r.range(0.5, 0.8) });
    }
    // The temple on its mount: walled court, house, tall porch and the two bronze pillars.
    const ty = lowest(ctx, TEMPLE[0], TEMPLE[1], 50, 50) - 0.3;
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1], y: ty, w: 64, h: 2.2, d: 64, color: '#cdb994' });
    for (const [x, z, w, d] of [[0, -31, 64, 1.4], [-31, 0, 1.4, 64], [31, 0, 1.4, 64], [-20, 31, 24, 1.4], [20, 31, 24, 1.4]]) box(ctx, { x: TEMPLE[0] + x, z: TEMPLE[1] + z, y: ty + 2.2, w, h: 4, d, color: '#d9c8a0' });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1] - 6, y: ty + 2.2, w: 14, h: 16, d: 30, color: '#efe4c8' });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1] - 6, y: ty + 18.2, w: 15, h: 1, d: 31, color: '#c9a64a' });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1] + 11, y: ty + 2.2, w: 18, h: 26, d: 5, color: '#f2e8d0' });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1] + 11, y: ty + 28.2, w: 19, h: 1.2, d: 6, color: '#c9a64a' });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1] + 13.6, y: ty + 2.2, w: 4, h: 9, d: 0.3, color: '#6a4a2a', collide: false });
    for (const s of [-1, 1]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.9, 0.9, 11, 8), { position: [TEMPLE[0] + s * 5, ty + 7.7, TEMPLE[1] + 16], color: '#a8743a' });
      ctx.solid.add(new THREE.SphereGeometry(1.3, 8, 5), { position: [TEMPLE[0] + s * 5, ty + 14, TEMPLE[1] + 16], color: '#b8843e' });
    }
    ctx.solid.box(8, 3, 8, { position: [TEMPLE[0] - 12, ty + 3.7, TEMPLE[1] + 20], color: '#a07a4a' });
    cityWall(ctx, { path: [[-100, -175], [70, -178], [100, -60], [96, 98], [-98, 96], [-112, -60], [-100, -175]], h: 9, color: '#cbb994' });

    // Lehi on the porch steps, arms raised as he testifies.
    person(ctx, { x: LEHI[0], z: LEHI[1] - 1.6, face: [0, 25], scale: 1.15, robe: '#e8dcc0', mantle: '#4a5a7a', skin: '#a8754f', arms: 'out' });
    // Mockers in front, gesturing at him, and onlookers on the rooftops.
    for (const [x, z, robe, mantle] of [[-2.2, -5.2, '#7a3a3a', '#a34f32'], [2.6, -5.0, '#94704e', '#3f4d5e'], [-4.2, -3.2, '#6e5a44', '#c9b48e'], [4.4, -4.0, '#a0825c', '#8a2e2e']]) {
      person(ctx, { x, z, face: [LEHI[0], LEHI[1] - 2], robe, mantle, skin: '#9b6a46', arms: 'out' });
    }
    roofs.sort((a, b) => Math.hypot(a[0], a[1] - LEHI[1]) - Math.hypot(b[0], b[1] - LEHI[1]));
    for (const [x, z, top] of roofs.slice(0, 9)) {
      for (let i = 0; i < 2; i++) {
        person(ctx, { x: x + r.range(-2.5, 2.5), z: z + r.range(-2.5, 2.5), y: top, face: [LEHI[0], LEHI[1]], robe: r.pick(['#8b6b4a', '#a0825c', '#4f5a6b', '#b59a72', '#7a3a3a']), mantle: r() < 0.5 ? '#5a3d2b' : undefined, skin: '#a87652', arms: r() < 0.4 ? 'out' : 'down', ghost: true });
      }
    }
  },
};
