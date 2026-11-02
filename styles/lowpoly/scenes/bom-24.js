// Alma 18-19: King Lamoni, the queen, Ammon and the servants lie overcome on the floor of the palace hall.
// Abish has run from house to house, and the people crowd the plaza to see. The player stands in the hall
// beside the king's bed looking out over the plaza (+z is south).
import { sleeper, house, rng } from './lib/bom-19-kit.js';

const PALACE = [0, -20];
const ABISH = [0.6, -18.6];

export default {
  title: "Alma 18-19: Lamoni's household falls to the earth",
  seed: 24,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.7, 0.55, 0.35], color: '#ffd8a8', intensity: 2.8 },
  light: { sky: '#a8b8d8', ground: '#7a5e44', hemi: 1.15 },
  sky: { top: '#4a74b0', horizon: '#f0d4b0', ground: '#c8a888', sunColor: '#ffe6c0', glow: 0.9 },
  fog: { color: '#d8c0a4', near: 70, far: 520 },
  clouds: { count: 30, shadow: '#8a8aa0', lit: '#ffe8c8', rim: '#fff4dc', distance: [300, 900], altitude: [110, 220], hole: 0.3 },
  mountains: { count: 40, color: '#6a6a64', radius: [480, 720], height: [50, 130], haze: 0.5 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.07, vignette: 0.42, shadowTint: '#32285a', highlightTint: '#ffe6c4' },
  shadow: { center: [0, -8], radius: 50 },

  player: { start: [2.6, -28.6], yaw: Math.PI - 0.12, pitch: -0.07, eye: 1.65, speed: 4 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 24,
    hills: 26,
    bumps: 0.2,
    flats: [{ x: 0, z: -5, r: 70, falloff: 40, height: 0 }],
    colors: { ground: '#a08a64', groundAlt: '#94805c', grass: '#7a8a44', high: '#8a7c5c', rock: '#776656' },
    patches: [{ x: 0, z: 2, r: 36, color: '#c4ac86', strength: 0.7, rough: 0.3 }],
  },

  objects: [
    { type: 'pavement', x: 0, z: 4, w: 46, d: 30, tile: 2.4, color: '#cab494', damage: 0.05 },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, 0], ring: [80, 280], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#5a7a38' } },
    { type: 'tree', count: 16, center: [0, 0], ring: [34, 70], spacing: 9, seed: 18, avoid: [{ rect: [0, -20, 40, 30] }], props: { kind: 'palm', leaf: '#56743a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#7a2e2a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#c9b48e', '#6d3b2e', '#c8902a'],
      skins: ['#6a4228', '#7a4c31', '#8a5a3c', '#5e3a24'],
      mantleChance: 0.65,
      hoodChance: 0.15,
    },
    groups: [
      { count: 300, center: [0, -8], ring: [6, 32], arc: [0.05, Math.PI - 0.05], spacing: 0.9, face: PALACE, children: 0.2, seed: 41, avoid: [{ rect: [0, -20, 30, 24] }, { r: 2.6, x: ABISH[0], z: ABISH[1] }, { rect: [0, -6, 9, 4] }] },
      { count: 40, center: [-30, 20], ring: [0, 9], spacing: 1.2, face: [0, -8], children: 0.2, seed: 42 },
      { count: 30, center: [28, 24], ring: [0, 8], spacing: 1.2, face: [0, -8], children: 0.2, seed: 43 },
    ],
  },

  figures: [
    { x: ABISH[0], z: ABISH[1], face: [-2, 14], robe: '#efe6d2', mantle: '#a8322a', skin: '#7a4c31', arms: 'out', hood: true },
  ],

  custom(ctx) {
    const r = rng(2424);
    const { top } = ctx.builders.steppedPyramid(ctx, { x: PALACE[0], z: PALACE[1], w: 28, d: 22, tiers: 2, tierHeight: 0.5, inset: 0.8, stairWidth: 10, color: '#cdb894', trim: '#a8865c', stairColor: '#d4c09c' });
    const stoneC = '#d6c4a2', paint = '#a8442e';
    const shade = (c, ny) => ny < -0.5 && c.multiplyScalar(0.55);

    const H = 4.6;
    const colXs = [-11, -6.6, -2.2, 2.2, 6.6, 11];
    for (const x of colXs) {
      for (const z of [-9.6, -20]) {
        if (z === -20 && Math.abs(x) < 10) continue;
        ctx.solid.add(new ctx.THREE.CylinderGeometry(0.42, 0.48, H, 8), { position: [x, top + H / 2, z], color: stoneC });
        ctx.solid.box(1.2, 0.35, 1.2, { position: [x, top + 0.17, z], color: '#a8865c', shade });
        ctx.solid.box(1.2, 0.35, 1.2, { position: [x, top + H - 0.17, z], color: paint, shade });
        ctx.colliders.add({ x, z, w: 1, d: 1, bottom: top, top: top + H });
      }
    }
    const back = -30.4;
    for (const [x, w] of [[-7.5, 11], [7.5, 11]]) {
      ctx.solid.box(w, H, 0.8, { position: [x, top + H / 2, back], color: stoneC, shade });
      ctx.colliders.add({ x, z: back, w, d: 0.8, bottom: top, top: top + H });
    }
    ctx.solid.box(4, 1.2, 0.8, { position: [0, top + H - 0.6, back], color: stoneC, shade });
    ctx.solid.box(4, H - 1.2, 0.1, { position: [0, top + (H - 1.2) / 2, back - 0.5], color: '#3a2a20', jitter: 0 });
    for (const sx of [-1, 1]) {
      ctx.solid.box(0.8, H, 10.4, { position: [sx * 12.6, top + H / 2, -25.2], color: stoneC, shade });
      ctx.colliders.add({ x: sx * 12.6, z: -25.2, w: 0.8, d: 10.4, bottom: top, top: top + H });
      ctx.solid.box(0.2, 1.4, 6, { position: [sx * 12.15, top + 2.6, -25.2], color: paint, jitter: 0.02 });
    }
    ctx.solid.box(3, 1.4, 0.2, { position: [-7.5, top + 2.6, back + 0.45], color: paint, jitter: 0.02 });
    ctx.solid.box(3, 1.4, 0.2, { position: [7.5, top + 2.6, back + 0.45], color: paint, jitter: 0.02 });
    ctx.solid.box(27, 0.5, 22.4, { position: [0, top + H + 0.25, -20], color: '#f0e0c0' });
    ctx.solid.box(27.6, 0.7, 23, { position: [0, top + H + 0.85, -20], color: paint, shade });
    ctx.solid.box(24, 0.6, 19, { position: [0, top + H + 1.5, -20], color: '#c8b08a', shade });
    for (let i = 0; i < 9; i++) ctx.solid.box(1.2, 0.5, 0.3, { position: [-10 + i * 2.5, top + H + 2, -10.4], color: '#e0cca8', shade });

    const floor = top + 0.02;
    ctx.solid.box(20, 0.04, 14, { position: [0, floor, -21], color: '#cdb894', jitter: 0.02 });
    const fill = new ctx.THREE.PointLight('#ffe2b8', 14, 30, 0.8);
    fill.position.set(0, top + 2.6, -27);
    ctx.scene.add(fill);
    ctx.solid.box(8, 0.03, 4, { position: [-2, floor + 0.03, -23.6], color: '#8a3a2a', jitter: 0.03 });

    const bed = [-2.4, -24.2];
    ctx.solid.box(2.6, 0.5, 1.3, { position: [bed[0], floor + 0.25, bed[1]], color: '#6a4a30', shade });
    ctx.solid.box(2.5, 0.12, 1.25, { position: [bed[0], floor + 0.56, bed[1]], color: '#e8dcc4' });
    ctx.colliders.add({ x: bed[0], z: bed[1], w: 2.6, d: 1.3, bottom: floor, top: floor + 0.62 });
    sleeper(ctx, bed[0] - 0.1, bed[1], Math.PI / 2, { y: floor + 0.6, robe: '#e8d8b0', mantle: '#7a2a5a', skin: '#7a4c31' });
    ctx.solid.box(0.4, 0.12, 0.3, { position: [bed[0] + 1.05, floor + 0.98, bed[1]], color: '#d8b040', jitter: 0 });

    sleeper(ctx, bed[0] + 0.6, bed[1] + 1.9, Math.PI / 2 + 0.3, { y: floor, robe: '#d8c8e0', mantle: '#6a3a7a', skin: '#7a4c31', side: 0.3 });
    sleeper(ctx, bed[0] - 2.6, bed[1] + 1.4, -Math.PI / 2 - 0.4, { y: floor, robe: '#d8cab0', mantle: '#3e5a7a', skin: '#a87652', side: -0.2 });
    const servants = [[3.8, -20.4], [5.2, -23], [-6.5, -18.6], [1, -16.2], [-4.6, -15.6], [6.8, -16.8], [-8, -21.8]];
    for (const [x, z] of servants) {
      sleeper(ctx, x, z, r() * Math.PI * 2, { y: floor, robe: r.pick(['#c4b090', '#b59a72', '#a0825c', '#d8cdb5']), mantle: r() < 0.5 ? r.pick(['#a34f32', '#7d5c3e']) : undefined, skin: r.pick(['#6a4228', '#7a4c31', '#5e3a24']), side: r.range(-0.5, 0.5) });
    }
    ctx.effects.ring({ position: [bed[0] - 0.4, floor + 0.05, bed[1] + 0.8], radius: 4.5, width: 2.4, color: '#ffe6b0', opacity: 0.22 });

    for (const [x, z] of [[-4.5, -29.6], [4.5, -29.6]]) {
      ctx.solid.add(new ctx.THREE.CylinderGeometry(0.3, 0.22, 0.9, 7), { position: [x, floor + 0.45, z], color: '#8a5a3a' });
      ctx.solid.add(new ctx.THREE.ConeGeometry(0.5, 1.4, 5), { position: [x, floor + 1.6, z], color: '#5a7a38' });
    }

    for (let i = 0; i < 46; i++) {
      const a = r.range(-0.15, Math.PI + 0.15), d = r.range(40, 75);
      const x = Math.cos(a) * d, z = -6 + Math.sin(a) * d;
      house(ctx, x, z, Math.atan2(-x, -6 - z) + r.range(-0.2, 0.2), { w: r.range(5, 7.5), d: r.range(4.5, 6), h: r.range(2.6, 3.4), color: r.pick(['#c8b08a', '#bca480', '#d0bc98']), roof: r.pick(['#8a7050', '#9a7c4a']), thatch: r() < 0.5 });
    }
  },
};
