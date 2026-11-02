// Mosiah 2:1-8: The people gather around the temple in Zarahemla, each family in its tent with the door
// toward the temple. King Benjamin speaks from a tower so the multitude can hear. -z is north toward the temple.
import { tent, person, faceYaw, frame, banner } from './lib/bom-13-kit.js';
import { rng } from '../engine/util.js';

const TEMPLE = [0, -78];
const TOWER = [0, -34];
const TOWER_H = 9;

const camp = (() => {
  const r = rng(61);
  const tents = [];
  const families = [];
  for (let row = 0; row < 7; row++) {
    const radius = 15 + row * 8.5;
    const n = Math.floor((Math.PI * 1.25 * radius) / 6.8);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (-0.12 + (1.24 * (i + 0.5)) / n) + r.range(-0.03, 0.03);
      const x = TOWER[0] + Math.cos(a) * radius, z = TOWER[1] + Math.sin(a) * radius;
      if (Math.abs(x - 4) < 4.5 && z > 0) continue;
      const rot = faceYaw(x, z, TEMPLE);
      tents.push({ x, z, rot, color: r.pick(['#d8c8a4', '#cbb88e', '#e2d6b8', '#bfa77e', '#d4c09a']), stripe: r() < 0.5 ? r.pick(['#a8342a', '#3e5f86', '#6a7a3a', '#8a5a2a']) : null });
      const at = frame(x, z, rot);
      const size = 2 + Math.floor(r() * 4);
      for (let k = 0; k < size; k++) families.push(at(r.range(-1.6, 1.6), 3 + r.range(0, 1.6)));
    }
  }
  return { tents, families };
})();

export default {
  title: "Mosiah 2:1-8: King Benjamin's address",
  seed: 16,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.5, 0.7, 0.3], color: '#fff2d8', intensity: 2.8 },
  light: { sky: '#a8c4ea', ground: '#6a5a3e', hemi: 1.05 },
  sky: { top: '#3f74c0', horizon: '#dfe6e8', ground: '#c4b08e', sunColor: '#fff6dc', glow: 0.8 },
  fog: { color: '#d4dadc', near: 110, far: 700 },
  clouds: { count: 45, shadow: '#a0aab8', lit: '#ffffff', rim: '#ffffff', distance: [320, 950], altitude: [140, 280], hole: 0.2 },
  mountains: { count: 42, color: '#6a7a6a', radius: [520, 760], height: [60, 150], haze: 0.45 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.35, shadowTint: '#2a3048', highlightTint: '#fff0d4' },
  shadow: { center: [0, -20], radius: 85 },

  player: { start: [15, -63.6], yaw: 2.8, pitch: -0.2, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1200,
    segments: 200,
    seed: 16,
    hills: 24,
    bumps: 0.25,
    flats: [{ x: 0, z: -30, r: 100, falloff: 50, height: 0 }],
    colors: { ground: '#8a8a50', groundAlt: '#7c8448', grass: '#6c8c42', high: '#7c7a5a', rock: '#7a6c58' },
    patches: [
      { x: TEMPLE[0], z: TEMPLE[1], r: 40, color: '#b8a27c', strength: 0.8, rough: 0.2 },
      { x: TOWER[0], z: TOWER[1] - 2, r: 12, color: '#a89a70', strength: 0.6, rough: 0.4 },
    ],
  },

  objects: [
    {
      type: 'steppedPyramid', x: TEMPLE[0], z: TEMPLE[1], w: 44, d: 38, tiers: 5, tierHeight: 3.4, inset: 3, stairWidth: 9,
      color: '#c9b08a', trim: '#8f765a', stairColor: '#d6c29e',
      shrine: { w: 13, d: 9, h: 5.2, door: 2.6, roof: '#7a644c' },
    },
    ...[-1, 1].map((s) => ({ type: 'wall', x: s * 34, z: -62, rot: 0, len: 30, h: 2.2, damage: 0, color: '#c9b08a' })),
  ],

  scatter: [
    { type: 'tree', count: 60, center: [0, -30], ring: [110, 340], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#4f7a35' } },
    { type: 'tree', count: 30, center: [0, -30], ring: [85, 150], spacing: 8, seed: 5, props: { kind: 'palm', leaf: '#5d8a3a' } },
    { type: 'rock', count: 24, center: [0, -30], ring: [120, 340], spacing: 12, seed: 6, props: { color: '#8a7e6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#c4b090', '#94704e', '#6b6f4a', '#7a4e36', '#d8cdb5', '#e4dccb', '#5a7a8a', '#b5503a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#556246', '#2f6a7a'],
      skins: ['#c08a62', '#b07a55', '#c9976e', '#a8724c', '#9b6a46'],
      mantleChance: 0.6,
      hoodChance: 0.2,
    },
    groups: [
      { count: camp.families.length, points: camp.families, face: [TOWER[0], TOWER[1]], children: 0.35, kneel: 0.4, seed: 62 },
      { count: 260, center: TOWER, ring: [5, 12.5], arc: [-0.2, Math.PI + 0.2], spacing: 0.9, face: TOWER, children: 0.2, kneel: 0.2, seed: 63 },
    ],
  },

  figures: [
    { x: TOWER[0], z: TOWER[1], y: TOWER_H, face: [0, 40], scale: 1.15, robe: '#f2ead8', mantle: '#7a2a3a', skin: '#c08a62', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    for (const t of camp.tents) tent(ctx, { ...t, w: 3, d: 3.8, h: 2.3 });

    // King Benjamin's wooden tower.
    const [tx, tz] = TOWER;
    const y0 = ctx.heightAt(tx, tz);
    const wood = '#7a5a3a', dark = '#5a4030';
    for (const [px, pz] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.2, TOWER_H + 1.2, 6), { position: [tx + px, y0 + (TOWER_H + 1.2) / 2, tz + pz], color: wood });
      ctx.colliders.add({ x: tx + px, z: tz + pz, w: 0.4, d: 0.4, bottom: y0, top: y0 + TOWER_H + 1.2 });
    }
    for (let k = 1; k <= 3; k++) {
      const yy = y0 + (TOWER_H * k) / 3.4;
      for (const [w, d, ox, oz] of [[3.8, 0.12, 0, -1.8], [3.8, 0.12, 0, 1.8], [0.12, 3.8, -1.8, 0], [0.12, 3.8, 1.8, 0]]) {
        ctx.solid.box(w, 0.16, d, { position: [tx + ox, yy, tz + oz], color: dark });
      }
      for (const s of [-1, 1]) ctx.solid.box(0.1, 0.1, 4.6, { position: [tx + s * 1.8, yy - 1.3, tz], rotation: [0.75 * s, 0, 0], color: dark });
    }
    ctx.solid.box(4.4, 0.3, 4.4, { position: [tx, y0 + TOWER_H - 0.15, tz], color: '#8a6a44' });
    ctx.colliders.add({ x: tx, z: tz, w: 4.4, d: 4.4, bottom: y0 + TOWER_H - 0.3, top: y0 + TOWER_H });
    for (const [w, d, ox, oz] of [[4.4, 0.1, 0, -2.15], [4.4, 0.1, 0, 2.15], [0.1, 4.4, -2.15, 0], [0.1, 4.4, 2.15, 0]]) {
      ctx.solid.box(w, 0.1, d, { position: [tx + ox, y0 + TOWER_H + 1.0, tz + oz], color: wood });
    }
    ctx.solid.add(new THREE.ConeGeometry(3.4, 1.6, 4), { position: [tx, y0 + TOWER_H + 3.2, tz], rotation: [0, Math.PI / 4, 0], color: '#a8342a' });
    // Stair ramp up the back so the platform is reachable.
    const steps = 26;
    for (let i = 0; i < steps; i++) {
      const h = ((i + 1) / steps) * (TOWER_H - 0.3);
      const z = tz - 2.6 - (steps - i) * 0.5;
      ctx.solid.box(1.2, 0.12, 0.5, { position: [tx, y0 + h - 0.06, z], color: wood });
      ctx.colliders.add({ x: tx, z, w: 1.2, d: 0.5, bottom: y0 + h - 0.2, top: y0 + h });
    }
    const runLen = steps * 0.5, slope = Math.atan2(TOWER_H, runLen);
    for (const s of [-1, 1]) ctx.solid.box(0.12, 0.3, Math.hypot(TOWER_H, runLen), { position: [tx + s * 0.62, y0 + TOWER_H / 2 - 0.2, tz - 2.6 - runLen / 2 - 0.25], rotation: [-slope, 0, 0], color: dark });
    ctx.solid.box(1.2, 0.12, 0.9, { position: [tx, y0 + TOWER_H - 0.36, tz - 2.3], color: wood });
    ctx.colliders.add({ x: tx, z: tz - 2.3, w: 1.2, d: 0.9, bottom: y0 + TOWER_H - 0.6, top: y0 + TOWER_H - 0.3 });
    // A gold circlet for the king.
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 4, 10), new THREE.MeshLambertMaterial({ color: '#e8b84a', emissive: '#6a4a10' }));
    crown.rotation.x = Math.PI / 2;
    crown.position.set(tx, TOWER_H + 1.68 * 1.15, tz);
    ctx.scene.add(crown);
    for (const s of [-1, 1]) banner(ctx, { x: tx + s * 6, z: tz + 3, h: 6, color: s < 0 ? '#3e5f86' : '#a8342a' });
    // Firstlings of the flocks brought for sacrifice, penned beside the temple.
    for (let i = 0; i < 12; i++) {
      const x = 26 + (i % 4) * 1.6 + ctx.rand.range(-0.3, 0.3), z = -40 + Math.floor(i / 4) * 1.5;
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new THREE.DodecahedronGeometry(0.42, 0), { position: [x, y + 0.55, z], scale: [1.3, 0.8, 0.8], color: '#e8e2d4' });
      ctx.solid.add(new THREE.BoxGeometry(0.22, 0.24, 0.3), { position: [x + 0.55, y + 0.75, z], color: '#3a3430' });
      for (const [lx, lz] of [[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.18], [0.3, 0.18]]) ctx.solid.box(0.07, 0.45, 0.07, { position: [x + lx, y + 0.22, z + lz], color: '#3a3430' });
    }
    for (const [x, z, w, d] of [[30.4, -42, 8, 0.1], [30.4, -36, 8, 0.1], [26.2, -39, 0.1, 6], [34.6, -39, 0.1, 6]]) {
      const y = ctx.heightAt(x, z);
      ctx.solid.box(w, 0.12, d, { position: [x, y + 0.8, z], color: '#6a4a2a' });
      ctx.colliders.add({ x, z, w, d, bottom: y, top: y + 1 });
    }
  },
};
