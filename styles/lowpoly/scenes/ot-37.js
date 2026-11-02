// Esther 5:1-2: the throne hall of the palace at Shushan. Esther stands in her royal apparel and the king,
// seated on his throne, holds out the golden scepter to her. The player starts inside the hall at the
// south end, facing the throne to the north. -z is north.
import * as THREE from 'three';
import { figure, fire, glowMaterial, instances } from './lib/ot-31-kit.js';

const HALL = { x0: -15, x1: 15, z0: -32, z1: 14, h: 11 };
const DAIS = { z: -26, h: 1.6 };
const KING = [0, -26.6];
const ESTHER = [0.2, -20.7];
const tile = '#2e5a8a';
const plaster = '#d8c8a8';
const gold = '#d8a838';

function hall(ctx) {
  const { solid, glow } = ctx;
  const { x0, x1, z0, z1, h } = HALL;
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const wall = (x, z, ww, dd, hh = h + 1, y = 0, color = plaster) => {
    solid.box(ww, hh, dd, { position: [x, y + hh / 2, z], color, jitter: 0.03 });
    ctx.colliders.add({ x, z, w: ww, d: dd, bottom: y, top: y + hh });
  };
  wall(x0 - 0.5, cz, 1, d + 2);
  wall(x1 + 0.5, cz, 1, d + 2);
  wall(cx, z0 - 0.5, w + 2, 1);
  wall(cx - 9.5, z1 + 0.5, w - 17, 1);
  wall(cx + 9.5, z1 + 0.5, w - 17, 1);
  solid.box(w + 2, h - 6.5, 1, { position: [cx, 6.5 + (h - 6.5) / 2 + 0.5, z1 + 0.5], color: plaster });
  for (const [x, z, ww, dd] of [[x0 + 0.05, cz, 0.12, d], [x1 - 0.05, cz, 0.12, d], [cx, z0 + 0.05, w, 0.12]]) {
    solid.box(ww, 3.2, dd, { position: [x, 1.6, z], color: tile, jitter: 0.06 });
    solid.box(ww + 0.02, 0.3, dd, { position: [x, 3.35, z], color: gold, jitter: 0.04 });
    solid.box(ww + 0.02, 0.9, dd, { position: [x, 5.2, z], color: '#3a6a9a', jitter: 0.06 });
  }
  for (let i = 0; i < 9; i++) {
    const z = z0 + 4 + i * 5;
    for (const x of [x0 + 0.1, x1 - 0.1]) {
      solid.box(0.14, 0.6, 1.1, { position: [x, 5.2, z], color: '#e8d8b0' });
      glow.box(0.1, 1.8, 1.4, { position: [x, 8.6, z], color: '#ffe0a0', jitter: 0.03 });
    }
  }
  solid.box(w + 2, 0.8, d + 2, { position: [cx, h + 0.4, cz], color: '#4a3020' });
  for (let i = 0; i < 12; i++) solid.box(w, 0.5, 0.5, { position: [cx, h - 0.25, z0 + 2 + i * 3.8], color: '#5a3a24' });
  for (let i = 0; i < 9; i++) for (let j = 0; j < 7; j++) {
    const x = x0 + 2 + j * 4.3, z = z0 + 2 + i * 5;
    solid.box(3.9, 0.12, 4.6, { position: [x, -0.06, z], color: (i + j) % 2 ? '#b8a080' : '#a88c6a', jitter: 0.04 });
  }
  solid.box(5, 0.04, d - 8, { position: [0, 0.02, cz + 3], color: '#7a1e2e' });
  solid.box(5.4, 0.03, d - 7.6, { position: [0, 0.01, cz + 3], color: gold });
}

function columns(ctx) {
  const { solid } = ctx;
  for (const x of [-11, -6, 6, 11]) {
    for (let z = HALL.z0 + 7; z <= HALL.z1 - 3; z += 6) {
      if (Math.abs(x) === 6 && z < DAIS.z + 4) continue;
      solid.add(new THREE.CylinderGeometry(0.9, 1.1, 0.8, 10), { position: [x, 0.4, z], color: '#c8b896' });
      solid.add(new THREE.CylinderGeometry(0.45, 0.5, 8.4, 12), { position: [x, 5, z], color: '#d8ccb0', jitter: 0.03 });
      solid.box(1.4, 0.5, 1.4, { position: [x, 9.4, z], color: '#c8b896' });
      solid.box(3.2, 1, 0.9, { position: [x, 10.2, z], color: '#a88a5a' });
      for (const s of [-1, 1]) {
        solid.box(0.7, 0.8, 0.9, { position: [x + s * 1.6, 10.4, z], color: '#a88a5a' });
        solid.box(0.4, 0.4, 0.5, { position: [x + s * 1.9, 10.1, z], color: gold });
      }
      ctx.colliders.add({ x, z, w: 1.6, d: 1.6, bottom: 0, top: 11 });
    }
  }
}

function throne(ctx) {
  const { solid } = ctx;
  const { z, h } = DAIS;
  for (let i = 0; i < 5; i++) {
    const t = 1 - i / 5;
    solid.box(14 - i * 0.6, h / 5, 7 + t * 3, { position: [0, (i + 0.5) * (h / 5), z - 1.5 + t * 1.5], color: i % 2 ? '#c8b896' : '#b8a482' });
    ctx.colliders.add({ x: 0, z: z - 1.5 + t * 1.5, w: 14 - i * 0.6, d: 7 + t * 3, bottom: 0, top: (i + 1) * (h / 5) });
  }
  const [kx, kz] = KING;
  solid.box(1.8, 0.7, 1.4, { position: [kx, h + 0.35, kz], color: gold });
  solid.box(1.9, 2.6, 0.3, { position: [kx, h + 1.3, kz - 0.75], color: gold });
  solid.box(0.2, 1, 1.3, { position: [kx - 0.95, h + 1, kz], color: gold });
  solid.box(0.2, 1, 1.3, { position: [kx + 0.95, h + 1, kz], color: gold });
  solid.box(1.2, 0.2, 0.9, { position: [kx, h + 0.1, kz + 1.1], color: '#a8803a' });
  for (const s of [-1, 1]) {
    solid.add(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), { position: [kx + s * 2, h + 2.5, kz + 1.2], color: gold });
    solid.add(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), { position: [kx + s * 2, h + 2.5, kz - 1.6], color: gold });
  }
  solid.box(4.6, 0.25, 3.4, { position: [kx, h + 5.1, kz - 0.2], color: '#5a2a6a' });
  for (let i = 0; i < 8; i++) solid.box(0.56, 0.6, 0.06, { position: [kx - 1.96 + i * 0.56, h + 4.7, kz + 1.5], color: i % 2 ? '#5a2a6a' : '#e8e0d0' });
  ctx.colliders.add({ x: kx, z: kz, w: 2, d: 1.6, bottom: h, top: h + 2.8 });
}

function crown(ctx, x, y, z, scale = 1) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.18, 8, 1, true), new THREE.MeshLambertMaterial({ color: gold, emissive: gold, emissiveIntensity: 0.35, side: THREE.DoubleSide }));
  c.position.set(x, y + 1.66 * scale, z);
  c.scale.setScalar(scale);
  ctx.scene.add(c);
}

const guardPoints = [];
for (let z = -18; z <= 8; z += 3.2) for (const x of [-3.6, 3.6]) guardPoints.push([x, z]);
const courtiers = [];
for (let z = -20; z <= 6; z += 2.2) for (const x of [-8.5, 8.5, -13.2, 13.2]) courtiers.push([x + (z % 3) * 0.2, z]);

export default {
  title: 'Esther 5:1-2: Esther before the king',
  seed: 37,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.5, 0.7, 0.4], color: '#ffe0b0', intensity: 1.2 },
  light: { sky: '#d8b890', ground: '#5a3a28', hemi: 0.7 },
  sky: { top: '#3a5a8a', horizon: '#e8c8a0', ground: '#a08060', sunColor: '#fff0d0', glow: 0.6 },
  fog: { color: '#3a2a20', near: 30, far: 140 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.14, contrast: 1.08, vignette: 0.5, shadowTint: '#2a2050', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -10], radius: 40 },

  player: { start: [0.8, -5], yaw: 0, pitch: 0.08, eye: 1.65, speed: 3.5 },

  terrain: { size: 400, segments: 40, seed: 37, hills: 0, bumps: 0, colors: { ground: '#a08a68', groundAlt: '#a08a68', grass: '#a08a68', rock: '#a08a68' } },

  crowd: {
    palette: {
      robes: ['#5a2a3a', '#2e4a6a', '#6a4a2a', '#3a3a5a', '#7a5a2a', '#c8b48a', '#4a2a4a'],
      mantles: ['#c8a050', '#2a2a3a', '#8a2a2a', '#e8dcc0', '#3a5a3a'],
      skins: ['#a87652', '#9b6a46', '#b5835e'],
      mantleChance: 0.8,
      hoodChance: 0.1,
    },
    groups: [
      { count: guardPoints.length, points: guardPoints, face: [0, -6], children: 0, seed: 37, palette: { robes: ['#7a5a3a', '#6a2a3a', '#3a4a6a'], mantles: ['#d8b860', '#e8dcc0'], skins: ['#a87652', '#9b6a46'], mantleChance: 1, hoodChance: 0.9 } },
      { count: courtiers.length, points: courtiers, face: [0, -24], children: 0, seed: 38 },
    ],
  },

  custom(ctx) {
    hall(ctx);
    columns(ctx);
    throne(ctx);
    const seat = DAIS.h + 0.7 - 0.62;
    figure(ctx, { x: KING[0], z: KING[1], y: seat, face: ESTHER, robe: '#ece4d4', mantle: '#4a1e5e', skin: '#a87652', left: 'down', right: [0.18, 1.25], holds: { length: 2.1, color: gold, radius: 0.05, glow: 2, tip: { size: 0.14, color: '#ffe080', glow: 2.4 } }, scale: 1.08, collide: false });
    crown(ctx, KING[0], seat, KING[1], 1.08);
    figure(ctx, { x: ESTHER[0], z: ESTHER[1], face: KING, robe: '#e8e0f0', mantle: '#3a4a9a', skin: '#b5835e', left: [0.2, 1.1], right: 'down', scale: 0.98 });
    crown(ctx, ESTHER[0], ctx.heightAt(...ESTHER), ESTHER[1], 0.98);
    for (let i = 0; i < 3; i++) figure(ctx, { x: [-2.2, -1.5, 2.3][i], z: [-16.6, -15.4, -16.2][i], face: KING, robe: ['#b8a0c0', '#c8b8a0', '#a0b0c8'][i], skin: '#a87652', hood: true, arms: 'pray', scale: 0.92 });

    const spear = new THREE.CylinderGeometry(0.025, 0.03, 2.8, 4).translate(0.32, 1.4, 0.12);
    const tip = new THREE.ConeGeometry(0.06, 0.3, 4).translate(0.32, 2.95, 0.12);
    const at = guardPoints.map(([x, z]) => ({ x, z, y: 0, yaw: Math.atan2(-x, -6 - z) }));
    instances(ctx, spear, new THREE.MeshLambertMaterial({ color: '#5a3a24' }), at);
    instances(ctx, tip, new THREE.MeshLambertMaterial({ color: gold, emissive: gold, emissiveIntensity: 0.3 }), at);

    for (const [x, z] of [[-4.6, -21.5], [4.6, -21.5], [-4.6, -6], [4.6, -6], [-4.6, 6], [4.6, 6]]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6), { position: [x, 0.6, z], color: gold });
      ctx.solid.add(new THREE.CylinderGeometry(0.45, 0.25, 0.35, 8), { position: [x, 1.35, z], color: '#a8803a' });
      ctx.colliders.add({ x, z, w: 0.8, d: 0.8, bottom: 0, top: 1.5 });
      fire(ctx, { x, z, y: 1.5, radius: 0.32, height: 0.7, count: 7, seed: Math.round(x * 7 + z), lightIntensity: 14, lightDistance: 16 });
    }
    const fill = new THREE.PointLight('#ffd8a0', 50, 30, 1.2);
    fill.position.set(0, 7, -20);
    ctx.scene.add(fill);
    const glowDisc = new THREE.Mesh(new THREE.CircleGeometry(3.5, 24), glowMaterial('#ffd890', 0.25, { transparent: true, opacity: 0.25, depthWrite: false }));
    glowDisc.position.set(KING[0], DAIS.h + 2.6, KING[1] - 0.95);
    ctx.scene.add(glowDisc);
  },
};
