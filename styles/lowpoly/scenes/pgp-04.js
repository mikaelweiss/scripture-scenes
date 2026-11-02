// Abraham 1:7-16: on the plain of Olishem, at the head of the plain by Potiphar's Hill, the priest of
// Elkenah lays Abraham on the lion-couch altar before the idols. Abraham cries to the Lord, and the angel
// of his presence stands by him and looses his bands. The altar is north (-z) of the player.
import * as THREE from 'three';
import { person, angel, box, standAt } from './lib/pgp-01-kit.js';

const ALTAR = [0, -6];
const HILL = [0, -150];
const DAIS = { w: 12, d: 9, h: 1.2 };

export default {
  title: 'Abraham 1:7-16: Abraham on the altar',
  seed: 404,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.6, 0.55, 0.45], color: '#ffd8a0', intensity: 2.9 },
  light: { sky: '#9ab0d0', ground: '#6a5038', hemi: 1.0 },
  sky: { top: '#4a6aa0', horizon: '#f0d0a0', ground: '#d0b080', sunColor: '#ffe6b8', glow: 1.2 },
  fog: { color: '#dcc09a', near: 90, far: 620 },
  clouds: { count: 40, shadow: '#8a7a80', lit: '#ffe0b0', rim: '#fff4dc', distance: [300, 900], altitude: [120, 260], hole: 0.2 },
  mountains: { count: 36, color: '#8a7460', radius: [520, 760], height: [30, 90], haze: 0.55 },
  bloom: { strength: 0.6, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.07, vignette: 0.42, shadowTint: '#30285e', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -6], radius: 50 },

  player: { start: [2.5, 9.5], yaw: 0.12, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 44,
    hills: 14,
    bumps: 0.25,
    flats: [{ x: 0, z: 0, r: 60, falloff: 40, height: 0 }, { x: HILL[0], z: HILL[1], r: 20, falloff: 90, height: 34 }],
    colors: { ground: '#c4a274', groundAlt: '#b8966a', grass: '#a49a5a', high: '#b09070', rock: '#9a7e60' },
    patches: [{ x: ALTAR[0], z: ALTAR[1], r: 26, color: '#cdb48a', strength: 0.8, rough: 0.3 }],
  },

  scatter: [
    { type: 'tree', count: 30, center: [0, 0], ring: [70, 300], spacing: 14, seed: 8, props: { kind: 'palm', leaf: '#6a7a3a' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [50, 300], spacing: 12, seed: 9, props: { color: '#a88a68' } },
  ],

  crowd: {
    palette: {
      robes: ['#c4b090', '#a0825c', '#8b6b4a', '#d8cdb5', '#7a4e36', '#b59a72', '#4f5a6b', '#9a4a34', '#e0d4bc'],
      mantles: ['#5a3d2b', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#2a4a6a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.35,
    },
    groups: [
      {
        count: 300, center: ALTAR, ring: [10, 28], arc: [-Math.PI * 1.32, Math.PI * 0.32], spacing: 1.1, face: ALTAR, children: 0.08, seed: 41,
        avoid: [{ rect: [ALTAR[0], ALTAR[1], DAIS.w + 4, DAIS.d + 4] }, { rect: [3, 14, 6, 20] }],
      },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    const [ax, az] = ALTAR;
    const y0 = ctx.heightAt(ax, az) - 0.1;

    // Raised dais of mud brick with steps on the front.
    box(ctx, { x: ax, z: az, y: y0, w: DAIS.w, h: DAIS.h, d: DAIS.d, color: '#b89870' });
    box(ctx, { x: ax, z: az, y: y0 + DAIS.h - 0.2, w: DAIS.w + 0.4, h: 0.25, d: DAIS.d + 0.4, color: '#8a6a4a', collide: false });
    for (let i = 0; i < 3; i++) box(ctx, { x: ax, z: az + DAIS.d / 2 + 0.45 + (2 - i) * 0.5, y: y0, w: 4, h: (i + 1) * 0.4, d: 0.5, color: '#c4a47c' });
    const top = y0 + DAIS.h;

    // The lion-couch altar, gilded, with lion head and paws.
    const gold = '#c89a3c', dark = '#7a5a2a';
    box(ctx, { x: ax, z: az, y: top + 0.55, w: 3.2, h: 0.28, d: 1.1, color: gold });
    for (const sx of [-1.3, 1.3]) for (const sz of [-0.4, 0.4]) {
      box(ctx, { x: ax + sx, z: az + sz, y: top, w: 0.22, h: 0.6, d: 0.22, color: gold, collide: false });
      ctx.solid.add(new THREE.DodecahedronGeometry(0.16, 0), { position: [ax + sx + 0.08 * Math.sign(sx), top + 0.08, az + sz], color: dark });
    }
    ctx.solid.add(new THREE.DodecahedronGeometry(0.34, 0), { position: [ax - 1.75, top + 1.05, az], scale: [1, 1.1, 0.9], color: gold });
    ctx.solid.add(new THREE.ConeGeometry(0.18, 0.4, 4).rotateZ(Math.PI / 2), { position: [ax - 2.1, top + 1.0, az], color: dark });
    ctx.solid.add(new THREE.IcosahedronGeometry(0.42, 0), { position: [ax - 1.65, top + 1.1, az], scale: [0.7, 1.1, 1.1], color: '#a87a2c' });
    ctx.solid.add(new THREE.ConeGeometry(0.1, 0.9, 4).rotateZ(-Math.PI / 3), { position: [ax + 1.9, top + 1.05, az], color: gold });

    // Abraham on the altar, face upward, his loosed cords fallen on the dais.
    const abraham = person(ctx, { x: ax + 0.85, y: top + 0.88, z: az, robe: '#f2ebdc', mantle: '#6a7a9a', skin: '#a8754f', ghost: true });
    abraham.rotation.order = 'YXZ';
    abraham.rotation.set(-Math.PI / 2, -Math.PI / 2, 0);
    for (const k of [-1.8, -1.4]) ctx.solid.add(new THREE.TorusGeometry(0.12, 0.025, 4, 7), { position: [ax + 1.6 + k * 0.3, top + 0.02, az + 0.9 + k * 0.2], rotation: [Math.PI / 2, 0, 0], color: '#6a5038' });

    // The priest of Elkenah falls back before the angel.
    person(ctx, { x: ax + 1.0, z: az - 1.6, y: top, face: [ax + 3, az + 3], robe: '#2a2a3a', mantle: '#b8902e', skin: '#9b6a46', arms: 'out' }).rotation.z = -0.25;
    person(ctx, { x: ax - 2.6, z: az - 2.0, y: top, face: [ax, az], robe: '#3a2a3a', mantle: '#c4a040', skin: '#8a5a3c' });
    person(ctx, { x: ax + 3.6, z: az - 2.4, y: top, face: [ax, az], robe: '#3a2a3a', mantle: '#c4a040', skin: '#9b6a46', hood: true });

    // The angel of the Lord's presence above the altar, light filling the place.
    angel(ctx, { x: ax + 0.3, z: az - 0.6, y: top + 2.2, face: [ax + 2, az + 20], scale: 1.2, arms: 'out', light: 60, distance: 26, halo: 8, float: 0.01 });
    ctx.effects.beam({ position: [ax, top, az], height: 300, radiusBottom: 2.4, radiusTop: 12, color: '#fff3dc', opacity: 0.5 });
    ctx.effects.motes({ position: [ax, top, az], radius: 3, height: 30, count: 140 });

    // The idols: gods of Elkenah, Libnah, Mahmackrah and Korash, and a great seated Elkenah behind.
    const idol = (x, z, head, body) => {
      const y = standAt(ctx, x, z);
      box(ctx, { x, z, y, w: 1.4, h: 0.8, d: 1.4, color: '#8a7058' });
      ctx.solid.add(new THREE.CylinderGeometry(0.42, 0.55, 2.6, 6), { position: [x, y + 2.1, z], color: body });
      ctx.solid.add(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 6), { position: [x, y + 3.2, z], color: '#c89a3c' });
      ctx.solid.add(new THREE.DodecahedronGeometry(0.45, 0), { position: [x, y + 3.75, z], scale: [0.9, 1.15, 1.25], color: head });
      ctx.solid.add(new THREE.ConeGeometry(0.16, 0.7, 4).rotateX(Math.PI / 2), { position: [x, y + 3.75, z + 0.55], color: head });
    };
    idol(ax - 5, az - 3.5, '#3a3430', '#c89a3c');
    idol(ax + 5, az - 3.5, '#5a7a8a', '#b8a080');
    idol(ax - 5, az + 3.2, '#a86a3a', '#c4a47c');
    idol(ax + 5, az + 3.2, '#4a5a3a', '#c89a3c');

    const ez = az - 20, ex = ax - 9;
    box(ctx, { x: ex, z: ez, y: y0, w: 7, h: 4, d: 5, color: '#8a7058' });
    box(ctx, { x: ex, z: ez - 1.2, y: y0 + 4, w: 5, h: 6, d: 2.6, color: '#5a4a3e' });
    box(ctx, { x: ex, z: ez + 0.8, y: y0 + 4, w: 5, h: 2, d: 2.4, color: '#6a5646' });
    ctx.solid.add(new THREE.DodecahedronGeometry(1.6, 0), { position: [ex, y0 + 11.6, ez - 1], scale: [0.9, 1.2, 1.2], color: '#3a3430' });
    ctx.solid.add(new THREE.ConeGeometry(0.6, 2.2, 4).rotateX(Math.PI / 2), { position: [ex, y0 + 11.6, ez + 0.6], color: '#3a3430' });
    ctx.solid.add(new THREE.ConeGeometry(1.8, 2.4, 4), { position: [ex, y0 + 13.6, ez - 1], color: '#c89a3c' });

    // Censers with glowing coals on the dais corners.
    for (const [sx, sz] of [[-5.4, 4.2], [5.4, 4.2]]) {
      const x = ax + sx, z = az + sz;
      ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.2, 0.6, 6), { position: [x, top + 0.3, z], color: '#8a5a2a' });
      ctx.glow.add(new THREE.CircleGeometry(0.3, 6).rotateX(-Math.PI / 2), { position: [x, top + 0.61, z], color: '#ff7a2a' });
    }

    // Ur's ziggurat far off across the plain, and mud-brick houses at the edge of the gathering.
    for (let i = 0; i < 4; i++) box(ctx, { x: -150, z: -220, y: ctx.heightAt(-150, -220) - 1 + i * 8, w: 70 - i * 16, h: 8, d: 60 - i * 14, color: i % 2 ? '#b8946a' : '#c8a47a' });
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * (0.15 + (i / 13) * 0.7) + Math.PI;
      const d = r.range(38, 50);
      const x = ax + Math.cos(a) * d, z = az + Math.sin(a) * d;
      box(ctx, { x, z, y: ctx.heightAt(x, z) - 0.2, w: r.range(5, 8), h: r.range(3, 4.5), d: r.range(4, 6), rot: r() * 0.4, color: '#c4a47c' });
    }
  },
};
