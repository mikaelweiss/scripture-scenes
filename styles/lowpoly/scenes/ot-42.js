// Jonah 3: Jonah cries in Nineveh, and the whole city repents. People, king and beasts in sackcloth,
// sitting in ashes in the great square under a grey sky. -z is north.
import { block, person } from './lib/ot-38-kit.js';

const JONAH = [0, -32];
const KING = [5.5, -21];
const brick = '#b49572';

export default {
  title: 'Jonah 3: Jonah preaches in Nineveh',
  seed: 42,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.5, 0.55, 0.4], color: '#d8c8b0', intensity: 1.5 },
  light: { sky: '#a8a8b0', ground: '#5a4c40', hemi: 1.25 },
  sky: { top: '#6a6e78', horizon: '#b8aea0', ground: '#9a8c7c', sunColor: '#e0d4c0', glow: 0.4 },
  fog: { color: '#a89c8c', near: 60, far: 380 },
  clouds: { count: 110, shadow: '#5a5a62', lit: '#a8a4a0', rim: '#d0c8c0', distance: [150, 800], altitude: [70, 180], hole: 0.05 },
  mountains: { count: 30, color: '#7a7470', radius: [500, 720], height: [20, 60], haze: 0.7 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 0.8, contrast: 1.05, vignette: 0.45, shadowTint: '#2a2830', highlightTint: '#f0e8d8' },
  shadow: { center: [0, -18], radius: 60 },

  player: { start: [-1.8, -11], yaw: -0.16, pitch: 0.02, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000, segments: 150, seed: 42, hills: 14, bumps: 0.15,
    flats: [{ x: 0, z: -30, r: 130, falloff: 60, height: 0 }],
    colors: { ground: '#9c8a72', groundAlt: '#8e7c66', grass: '#7a7a58', high: '#8a7a64', rock: '#7a6a58' },
    patches: [
      { x: 0, z: -18, r: 34, color: '#a89a86', strength: 0.6, rough: 0.3 },
      { x: KING[0], z: KING[1], r: 5, color: '#8a8682', strength: 0.95, rough: 0.4 },
      { x: -14, z: -8, r: 8, color: '#6a6662', strength: 0.7, rough: 0.6 },
      { x: 12, z: 2, r: 7, color: '#6a6662', strength: 0.7, rough: 0.6 },
      { x: -6, z: -22, r: 9, color: '#6e6a66', strength: 0.6, rough: 0.6 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: 0, z: -125, w: 56, d: 56, tiers: 6, tierHeight: 6, inset: 3.6, stairWidth: 9, color: '#b0906a', trim: '#8a6e50', shrine: { w: 10, d: 8, h: 6, roof: '#6a5444' } },
    { type: 'steppedPyramid', x: JONAH[0], z: JONAH[1], w: 8, d: 6, tiers: 3, tierHeight: 0.8, inset: 0.9, stairWidth: 3, color: '#a88a68', trim: '#8a6e50' },
    { type: 'pavement', x: 0, z: -16, w: 40, d: 44, tile: 2.6, color: '#a89478', damage: 0.15 },
  ],

  scatter: [
    { type: 'tree', count: 30, center: [0, -30], ring: [110, 260], spacing: 8, seed: 3, props: { kind: 'palm', leaf: '#5a6a3a' } },
  ],

  crowd: {
    palette: {
      robes: ['#4a4038', '#5a5048', '#3a342e', '#6a5e50', '#2e2a26', '#544a40'],
      mantles: ['#3a3430', '#5a524a', '#2a2622', '#6a6258'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.5,
      hoodChance: 0.65,
    },
    groups: [
      {
        count: 950, center: JONAH, ring: [5, 34], arc: [0.15, Math.PI - 0.15], spacing: 0.95, face: JONAH, children: 0.2, kneel: 0.55, seed: 21,
        avoid: [{ rect: [-1.6, -4, 4, 34] }, { rect: [KING[0], KING[1], 8, 8] }, { rect: [2.4, -16, 4.5, 7] }, { rect: [JONAH[0], JONAH[1], 9, 7] }],
      },
      { count: 160, center: [0, -20], ring: [30, 48], spacing: 1.3, face: JONAH, children: 0.2, kneel: 0.6, seed: 22 },
    ],
  },

  figures: [
    { x: JONAH[0], z: JONAH[1], face: [0, 10], scale: 1.05, robe: '#7a6a52', mantle: '#c8b48e', skin: '#9b6a46', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;

    // The king of Nineveh, risen from his throne, in sackcloth on an ash heap.
    ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [KING[0], 0.1, KING[1]], scale: [2.2, 1.1, 2], color: '#9a9692', jitter: 0.08 });
    ctx.colliders.add({ x: KING[0], z: KING[1], w: 3.6, d: 3.4, bottom: 0, top: 1 });
    person(ctx, { x: KING[0] - 0.6, z: KING[1] + 0.5, y: 0.75, face: [-3, -30], robe: '#7a6a52', mantle: '#5a4e40', skin: '#a87652', hood: false, scale: 1.15, arms: 'out', tilt: [0.18, 0] });
    // His crown and royal robe, laid aside.
    const crownAt = [KING[0] - 1.6, 0.55, KING[1] + 1.2];
    ctx.glow.add(new THREE.TorusGeometry(0.26, 0.07, 4, 10).rotateX(Math.PI / 2 - 0.3), { position: crownAt, color: '#d8a838' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.solid.add(new THREE.ConeGeometry(0.06, 0.2, 4), { position: [crownAt[0] + Math.cos(a) * 0.26, crownAt[1] + 0.12, crownAt[2] + Math.sin(a) * 0.26], color: '#e0b040' });
    }
    ctx.solid.box(2.6, 1.6, 1.2, { position: [KING[0] + 2.4, 0.8, KING[1] - 2], rotation: [0, 0.3, 0.1], color: '#8a6a3a' });
    ctx.solid.box(2.2, 0.2, 1.4, { position: [KING[0] - 1.4, 0.1, KING[1] + 2.1], rotation: [0, 0.6, 0.05], color: '#7a2a5a' });

    // Mud-brick houses with flat roofs and dark doorways around the square.
    const houses = [];
    for (let tries = 0; houses.length < 90 && tries < 3000; tries++) {
      const a = r() * Math.PI * 2, d = r.range(36, 130);
      const x = Math.cos(a) * d, z = -20 + Math.sin(a) * d;
      if (Math.abs(x + 2) < 5 && z > 0) continue;
      if (Math.abs(x) < 34 && z < -100) continue;
      const w = r.range(5, 10), dd = r.range(5, 9);
      if (houses.some(([hx, hz, hw]) => Math.hypot(hx - x, hz - z) < (hw + w) * 0.75)) continue;
      houses.push([x, z, w]);
      const rot = Math.atan2(x, z + 20) + r.range(-0.1, 0.1);
      const h = r.range(3.5, 7);
      const y = ctx.heightAt(x, z) - 0.3;
      block(ctx, { x, z, y, w, h, d: dd, rot, color: r.pick([brick, '#a88a68', '#bca080', '#9c805e']) });
      ctx.solid.box(w + 0.3, 0.3, dd + 0.3, { position: [x, y + h + 0.15, z], rotation: [0, rot, 0], color: '#8a6e50' });
      const c = Math.cos(rot), s = Math.sin(rot);
      const fz = -dd / 2 - 0.02;
      ctx.solid.box(1.2, 2, 0.1, { position: [x - fz * s, y + 1.3, z - fz * c], rotation: [0, rot, 0], color: '#2a2018' });
      if (r() < 0.4) ctx.solid.box(1.3, 0.12, 2.6, { position: [x + 0.3 * c, y + h + 0.36, z - 0.3 * s], rotation: [0, rot + 0.3, 0], color: '#3a342e' });
    }

    // City wall with towers ringing the city.
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const x = Math.cos(a) * 175, z = -20 + Math.sin(a) * 175;
      const y = ctx.heightAt(x, z) - 1;
      block(ctx, { x, z, y, w: 3.5, h: 13, d: 18, rot: -a, color: '#a88a68', collide: false });
      if (i % 4 === 0) block(ctx, { x, z, y, w: 7, h: 17, d: 7, rot: -a, color: '#9c805e', collide: false });
    }

    // Beasts in sackcloth: oxen and sheep among the people.
    const beast = (x, z, rot, big) => {
      const y = ctx.heightAt(x, z);
      const s = big ? 1 : 0.55;
      const c = Math.cos(rot), sn = Math.sin(rot);
      const at = (lz, ly) => [x + lz * sn * s, y + ly * s, z + lz * c * s];
      const col = big ? '#6a4a30' : '#d8d0c0';
      ctx.solid.box(0.9 * s, 0.8 * s, 1.8 * s, { position: at(0, 1.0), rotation: [0, rot, 0], color: col });
      ctx.solid.box(0.98 * s, 0.6 * s, 1.2 * s, { position: at(0, 1.25), rotation: [0, rot, 0], color: '#3e3630' });
      ctx.solid.box(0.5 * s, 0.5 * s, 0.6 * s, { position: at(1.1, 1.2), rotation: [0.3, rot, 0], color: col });
      for (const [lx, lz] of [[-0.3, 0.7], [0.3, 0.7], [-0.3, -0.7], [0.3, -0.7]]) {
        ctx.solid.box(0.18 * s, 0.7 * s, 0.18 * s, { position: [x + (lx * c + lz * sn) * s, y + 0.35 * s, z + (-lx * sn + lz * c) * s], rotation: [0, rot, 0], color: col });
      }
      if (big) for (const sx of [-1, 1]) ctx.solid.box(0.06, 0.06, 0.4, { position: [...at(1.3, 1.55).map((v, k) => (k === 0 ? v + sx * 0.25 * c : k === 2 ? v - sx * 0.25 * sn : v))], rotation: [0.8, rot, 0], color: '#d8d0b8' });
    };
    for (const [x, z, rot, big] of [[-9, 4, 2.4, 1], [-11, 6, 2.6, 1], [14, -6, -2, 1], [-16, -14, 1.2, 0], [-15, -12, 1.6, 0], [-17, -11.5, 1.0, 0], [16, -16, -1.4, 0], [17, -18, -1.7, 0], [6, 6, 3.0, 0]]) beast(x, z, rot, big);
  },
};
