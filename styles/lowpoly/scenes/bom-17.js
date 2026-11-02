// Mosiah 12-17: Abinadi, bound and brought before King Noah, rebukes the priests seated in their gold-ornamented
// seats behind a breastwork. His face shines with exceeding luster so they dare not touch him. Inside Noah's palace.
import { person, fire, box } from './lib/bom-13-kit.js';

const HALL = { x0: -15, x1: 15, z0: -24, z1: 18, h: 10 };
const THRONE = [0, -19];
const ABINADI = [-0.5, -3];
const GOLD = '#e0b040';
const WOOD = '#6a3e24';
const WALL = '#c8b08c';

const priestRows = (side) => {
  const pts = [];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 9; i++) pts.push([side * (10.2 + row * 1.5), -15 + i * 2.6]);
  }
  return pts;
};

export default {
  title: 'Mosiah 12-17: Abinadi before King Noah',
  seed: 17,
  fov: 66,
  exposure: 1.1,

  sun: { direction: [0.4, 0.8, 0.3], color: '#ffe4b8', intensity: 0.6 },
  light: { sky: '#d8c0a0', ground: '#4a3028', hemi: 1.0 },
  sky: { top: '#3a4a6a', horizon: '#c89a6a', ground: '#5a4030', sunColor: '#ffd9a0', glow: 0.5 },
  fog: { color: '#3a2a20', near: 60, far: 160 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.12, contrast: 1.1, vignette: 0.5, shadowTint: '#3a2040', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -3], radius: 30 },

  player: { start: [3.2, 9.5], yaw: 0.27, pitch: 0.02, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 400,
    segments: 60,
    seed: 17,
    hills: 10,
    bumps: 0.1,
    flats: [{ x: 0, z: -3, r: 40, falloff: 20, height: 0 }],
    colors: { ground: '#6a5a40', groundAlt: '#5a4a34', grass: '#5a6a34', high: '#6a5a40', rock: '#5a4a3a' },
  },

  objects: [
    { type: 'pavement', x: 0, z: -3, w: 30, d: 42, tile: 2, gap: 0.06, color: '#c8b494', damage: 0 },
    { type: 'steppedPyramid', x: THRONE[0], z: THRONE[1] + 0.5, w: 10, d: 7, tiers: 3, tierHeight: 0.42, inset: 0.9, stairWidth: 3.4, color: '#e8dcc0', trim: GOLD, stairColor: '#ead9b8' },
  ],

  crowd: {
    palette: {
      robes: ['#5a2a4a', '#3a2a5a', '#7a2a2a', '#2a4a5a', '#6a2a3a'],
      mantles: ['#e0b040', '#c8a040', '#d8c8a0', '#a83a2a'],
      skins: ['#b07a55', '#a8724c', '#c08a62'],
      mantleChance: 0.9,
      hoodChance: 0.1,
    },
    groups: [
      { count: 18, points: priestRows(-1), face: [0, -3], children: 0, kneel: 0.5, onStructures: true, seed: 71 },
      { count: 18, points: priestRows(1), face: [0, -3], children: 0, kneel: 0.5, onStructures: true, seed: 72 },
    ],
  },

  figures: [
    { x: THRONE[0], z: THRONE[1] - 0.6, face: [0, 10], scale: 1.25, robe: '#6a1a3a', mantle: GOLD, skin: '#b07a55', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const { x0, x1, z0, z1, h } = HALL;
    const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;

    // Walls, cedar ceiling, gold bands.
    box(ctx, { x: cx, z: z0 - 0.5, y: -0.2, w: W + 2, h: h + 0.4, d: 1, color: WALL });
    box(ctx, { x: cx, z: z1 + 0.5, y: -0.2, w: W + 2, h: h + 0.4, d: 1, color: WALL });
    box(ctx, { x: x0 - 0.5, z: cz, y: -0.2, w: 1, h: h + 0.4, d: D, color: WALL });
    box(ctx, { x: x1 + 0.5, z: cz, y: -0.2, w: 1, h: h + 0.4, d: D, color: WALL });
    ctx.solid.box(W + 2, 0.6, D + 2, { position: [cx, h + 0.3, cz], color: '#4a2c1a' });
    for (let z = z0 + 2; z < z1; z += 3.2) ctx.solid.box(W, 0.45, 0.4, { position: [cx, h - 0.25, z], color: WOOD });
    for (const [w, d, x, z] of [[W, 0.1, cx, z0 + 0.02], [W, 0.1, cx, z1 - 0.02], [0.1, D, x0 + 0.02, cz], [0.1, D, x1 - 0.02, cz]]) {
      for (const y of [2.6, h - 1.2]) ctx.glow.box(w, 0.28, d, { position: [x, y, z], color: '#c89430', jitter: 0.04 });
      ctx.solid.box(w, 0.9, d === 0.1 ? 0.2 : D, { position: [x, 0.45, z], color: '#8a6a4a' });
    }
    // Silk hangings between the columns.
    const silks = ['#8a1a3a', '#1a4a7a', '#6a2a7a', '#a8402a'];
    for (let i = 0; i < 6; i++) {
      const z = z0 + 4 + i * 6.4;
      for (const s of [-1, 1]) {
        ctx.solid.box(0.08, 4.6, 2.4, { position: [s * (x1 - 0.12), 5.3, z], color: silks[(i + (s > 0 ? 1 : 0)) % silks.length] });
        ctx.glow.box(0.1, 0.18, 2.4, { position: [s * (x1 - 0.14), 3.05, z], color: '#c89430' });
      }
    }
    for (let i = 0; i < 4; i++) {
      const x = -10.5 + i * 7;
      if (Math.abs(x) < 3) continue;
      ctx.solid.box(4.2, 5.5, 0.08, { position: [x, 5.6, z0 + 0.12], color: silks[i] });
    }
    // Carved cedar columns with gold capitals.
    for (let i = 0; i < 6; i++) {
      const z = z0 + 5 + i * 6.4;
      for (const s of [-1, 1]) {
        const x = s * 7.6;
        ctx.solid.add(new THREE.CylinderGeometry(0.45, 0.5, h, 8), { position: [x, h / 2, z], color: WOOD });
        ctx.glow.add(new THREE.CylinderGeometry(0.7, 0.5, 0.6, 8), { position: [x, h - 0.8, z], color: '#c89430' });
        ctx.glow.add(new THREE.CylinderGeometry(0.52, 0.52, 0.25, 8), { position: [x, 2.2, z], color: '#c89430' });
        ctx.solid.box(1.3, 0.4, 1.3, { position: [x, 0.2, z], color: '#8a6a4a' });
        ctx.colliders.add({ x, z, w: 1, d: 1, bottom: 0, top: h });
      }
    }

    // The priests' raised seats with a gold-fronted breastwork before them.
    for (const s of [-1, 1]) {
      box(ctx, { x: s * 10.95, z: -4.6, y: -0.1, w: 3.4, h: 1.1, d: 24, color: '#8a6a4a' });
      for (const p of priestRows(s)) ctx.glow.box(0.9, 0.9, 0.9, { position: [p[0] + s * 0.45, 1.4, p[1]], color: '#c89a30', jitter: 0.06 });
      ctx.solid.box(0.25, 1.0, 24, { position: [s * 9.1, 0.5, -4.6], color: WOOD });
      ctx.glow.box(0.3, 0.2, 24, { position: [s * 9.05, 1.05, -4.6], color: '#e0b040' });
      for (let i = 0; i < 8; i++) ctx.glow.box(0.28, 0.4, 0.5, { position: [s * 9.0, 0.55, -15.5 + i * 3.2], color: '#c89430' });
      ctx.colliders.add({ x: s * 9.1, z: -4.6, w: 0.3, d: 24, bottom: 0, top: 1.2 });
    }

    // Noah's throne of gold on the dais.
    const top = 1.06;
    ctx.glow.box(3, 0.7, 1.8, { position: [THRONE[0], top + 0.35, THRONE[1] - 1.6], color: '#e8b840' });
    ctx.glow.box(3.2, 4.2, 0.4, { position: [THRONE[0], top + 2.1, THRONE[1] - 2.5], color: '#c89430' });
    ctx.glow.add(new THREE.ConeGeometry(0.9, 1.4, 4), { position: [THRONE[0], top + 4.9, THRONE[1] - 2.5], rotation: [0, Math.PI / 4, 0], color: '#f0c850' });
    for (const s of [-1, 1]) ctx.glow.box(0.4, 1.3, 1.8, { position: [THRONE[0] + s * 1.6, top + 0.65, THRONE[1] - 1.6], color: '#c89a30' });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.16, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd060', side: THREE.DoubleSide }));
    crown.position.set(THRONE[0], top + 1.86 * 1.25, THRONE[1] - 0.6);
    ctx.scene.add(crown);
    // Red carpet from the doors to the throne.
    ctx.solid.box(3.2, 0.06, 26, { position: [0, 0.08, 1.5], color: '#8a1a2a', jitter: 0.02 });
    // Great doors in the south wall.
    ctx.solid.box(4.4, 6.4, 0.3, { position: [0, 3.2, z1 - 0.1], color: '#5a3420' });
    ctx.glow.box(4.6, 0.2, 0.35, { position: [0, 6.4, z1 - 0.1], color: '#c89430' });

    // Braziers.
    for (const [x, z] of [[-4.5, -15], [4.5, -15], [-5.8, 5], [5.8, 5]]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.15, 0.35, 1.2, 6), { position: [x, 0.6, z], color: '#5a4a3a' });
      ctx.glow.add(new THREE.CylinderGeometry(0.6, 0.35, 0.35, 8), { position: [x, 1.35, z], color: '#c89a30' });
      ctx.colliders.add({ x, z, w: 1, d: 1, bottom: 0, top: 1.5 });
      fire(ctx, { x, z, y: 1.45, size: 0.8, logs: false, light: 16, distance: 16 });
    }

    // Abinadi, bound, his face shining as he rebukes the priests.
    const abY = 0.05;
    person(ctx, { x: ABINADI[0], z: ABINADI[1], y: abY, face: [10, 4], scale: 1.05, robe: '#8a7a5a', mantle: '#6a5a40', skin: '#c08a62' });
    const face = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), new THREE.MeshBasicMaterial({ color: '#fff4d0', toneMapped: false }));
    face.scale.set(1, 1.12, 1);
    face.position.set(ABINADI[0], abY + 1.53 * 1.05, ABINADI[1]);
    ctx.scene.add(face);
    ctx.effects.halo({ position: [ABINADI[0], abY + 1.6, ABINADI[1]], size: 3.2, opacity: 0.8, color: '#fff2c8' });
    const shine = new THREE.PointLight('#fff0c8', 14, 9, 1.4);
    shine.position.set(ABINADI[0], abY + 1.9, ABINADI[1] + 0.3);
    ctx.scene.add(shine);
    for (const s of [-1, 1]) ctx.solid.add(new THREE.TorusGeometry(0.1, 0.025, 4, 8), { position: [ABINADI[0] + s * 0.12, abY + 0.95, ABINADI[1] + 0.12], rotation: [0, 0, Math.PI / 2], color: '#9a8a6a' });
    // Guards who drew back from him.
    for (const [x, z] of [[-3.4, -1], [2.6, -0.4], [-2.4, 2.6]]) {
      person(ctx, { x, z, y: abY, face: ABINADI, robe: '#7a2a2a', mantle: '#3a2a20', skin: '#a8724c', hood: false });
      ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 4), { position: [x + 0.35, abY + 1.3, z + 0.1], rotation: [0.12, 0, -0.1], color: '#5a4030' });
      ctx.solid.add(new THREE.ConeGeometry(0.07, 0.3, 4), { position: [x + 0.48, abY + 2.68, z + 0.26], rotation: [0.12, 0, -0.1], color: '#2a2a2a' });
    }
  },
};
