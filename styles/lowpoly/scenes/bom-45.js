// 4 Nephi 1:1-18: generations after Christ's visit, the people have all things in common.
// A rebuilt city at peace: whole houses, gardens, fields, a shared storehouse, children at play.
// -z is north toward the temple.
import { house, breadBasket, person } from './lib/bom-43-kit.js';

const TEMPLE = [0, -78];
const PLAZA = [0, -18];
const STORE = [-16, -22];

const robes = ['#e8dcc4', '#c9b48e', '#8fa3b8', '#b8865a', '#d9c39a', '#7f9a6a', '#c46a4a', '#e2d2b0', '#9a7b5a', '#6e8aa6', '#d8b46a'];
const mantles = ['#4f7aa0', '#b8543a', '#6f8a4a', '#d8a84a', '#8a5a8a', '#f0e6d0', '#5a8a8a'];

const childRing = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return [10 + Math.cos(a) * 2.2, -8 + Math.sin(a) * 2.2];
});

export default {
  title: '4 Nephi 1:1-18: Two hundred years of peace',
  seed: 45,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [-0.5, 0.75, 0.42], color: '#fff2d8', intensity: 2.9 },
  light: { sky: '#a8c8f0', ground: '#6a7a48', hemi: 1.15 },
  sky: { top: '#3f78c8', horizon: '#cfe4f0', ground: '#b8c4a0', sunColor: '#fff6dc', glow: 0.9 },
  fog: { color: '#cfe0e8', near: 120, far: 700 },
  clouds: { count: 40, shadow: '#b8c4d8', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [110, 260], hole: 0.2 },
  mountains: { count: 44, color: '#5a7a6a', radius: [520, 760], height: [50, 150], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.06, contrast: 1.05, vignette: 0.3, shadowTint: '#2a3a5e', highlightTint: '#fff4dc' },
  shadow: { center: [0, -14], radius: 70 },

  player: { start: [2.2, 10], yaw: 0.12, pitch: -0.01, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100, segments: 200, seed: 45, hills: 26, bumps: 0.2,
    flats: [{ x: 0, z: -20, r: 95, falloff: 50, height: 0 }],
    colors: { ground: '#8a9a56', groundAlt: '#7a8c4c', grass: '#6c8a46', high: '#7c8a58', rock: '#7a7260' },
    patches: [
      { x: PLAZA[0], z: PLAZA[1], r: 22, color: '#d4c4a0', strength: 0.9, rough: 0.2 },
      { x: 0, z: 20, r: 10, color: '#cbb894', strength: 0.6, rough: 0.2 },
      { x: 62, z: 30, r: 34, color: '#8a6a44', strength: 0.75, rough: 0.2 },
      { x: -64, z: 34, r: 30, color: '#8a6a44', strength: 0.7, rough: 0.2 },
    ],
  },

  objects: [
    {
      type: 'steppedPyramid', x: TEMPLE[0], z: TEMPLE[1], w: 46, d: 42, tiers: 6, tierHeight: 3.2, inset: 2.4, stairWidth: 8,
      color: '#ece2cc', trim: '#4f8aa0', stairColor: '#f2ead8', shrine: { w: 12, d: 9, h: 5, door: 2.4, roof: '#b8543a' },
    },
    { type: 'pavement', x: PLAZA[0], z: PLAZA[1], w: 34, d: 30, tile: 2.2, color: '#ddd0b2', damage: 0 },
    { type: 'pavement', x: 0, z: 22, w: 7, d: 50, tile: 2, color: '#d6c8a8', damage: 0 },
    { type: 'steppedPyramid', x: 0, z: 62, w: 16, d: 12, tiers: 4, tierHeight: 1.5, inset: 1.2, stairWidth: 4, color: '#e6d6b4', trim: '#4f8aa0' },
    { type: 'pavement', x: 0, z: -50, w: 8, d: 34, tile: 2, color: '#d6c8a8', damage: 0 },
  ],

  scatter: [
    { type: 'tree', count: 90, center: [0, -20], ring: [110, 330], spacing: 7, seed: 8, props: { kind: 'broad', leaf: '#4f7a34' } },
    { type: 'tree', count: 36, center: [0, -20], ring: [95, 160], spacing: 6, seed: 9, props: { kind: 'palm', leaf: '#5f8a3a' } },
    { type: 'rock', count: 20, center: [0, -20], ring: [140, 340], spacing: 12, seed: 10, props: {} },
  ],

  crowd: {
    palette: { robes, mantles, skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'], mantleChance: 0.5, hoodChance: 0.1 },
    groups: [
      { count: 60, center: STORE, ring: [3, 11], arc: [-0.6, 2.2], spacing: 1.1, face: STORE, children: 0.2, seed: 51 },
      { count: 70, center: PLAZA, ring: [6, 16], spacing: 1.6, children: 0.25, seed: 52, avoid: [{ r: 3.5, x: 0, z: -18 }, { r: 7, x: STORE[0], z: STORE[1] }, { r: 3.5, x: 10, z: -8 }] },
      { count: childRing.length, points: childRing, face: [10, -8], children: 1, seed: 53 },
      { count: 40, center: [0, -48], ring: [0, 16], spacing: 1.4, face: TEMPLE, children: 0.15, seed: 54 },
      { count: 36, center: [62, 30], ring: [4, 28], spacing: 3.5, face: [62, 0], children: 0.1, kneel: 0.4, seed: 55 },
      { count: 30, center: [-64, 34], ring: [4, 24], spacing: 3.5, face: [-64, 0], children: 0.1, kneel: 0.4, seed: 56 },
      { count: 45, center: [0, 24], ring: [0, 9.5], spacing: 1.8, face: PLAZA, children: 0.3, seed: 57, avoid: [{ rect: [0, 62, 18, 14] }] },
    ],
  },

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;
    const occupied = [
      { x: PLAZA[0], z: PLAZA[1], r: 22 },
      { rect: [0, 18, 20, 60] },
      { rect: [0, 62, 24, 20] },
      { rect: [0, -50, 12, 40] },
      { rect: TEMPLE.concat([56, 52]) },
      { rect: [62, 30, 70, 64] },
      { rect: [-64, 34, 64, 60] },
    ];
    const inside = (x, z) => occupied.some((o) => (o.r ? Math.hypot(x - o.x, z - o.z) < o.r : Math.abs(x - o.rect[0]) < o.rect[2] / 2 && Math.abs(z - o.rect[1]) < o.rect[3] / 2));

    // Whole, plastered houses on a street grid, each with a small garden plot.
    const walls = ['#ece2cc', '#e6d6b4', '#f0e8d6', '#dccaa4'];
    const trims = ['#4f8aa0', '#b8543a', '#6f8a4a', '#c89a3a'];
    for (let gx = -84; gx <= 84; gx += 15) {
      for (let gz = -66; gz <= 74; gz += 14) {
        const x = gx + r.range(-1.5, 1.5), z = gz + r.range(-1.5, 1.5);
        if (inside(x, z) || Math.hypot(x, z + 20) > 100) continue;
        const rot = Math.abs(x) < 30 ? (x < 0 ? Math.PI / 2 : -Math.PI / 2) : r.pick([0, Math.PI]);
        const w = r.range(6, 9), d = r.range(5, 7);
        house(ctx, { x, z, rot, w, d, h: r.range(3, 4.2), color: r.pick(walls), trim: r.pick(trims), roof: '#c8b48e' });
        const c = Math.cos(rot), s = Math.sin(rot);
        const gxw = x + (d / 2 + 2.2) * s, gzw = z + (d / 2 + 2.2) * c;
        for (let k = -2; k <= 2; k++) {
          const px = gxw + k * 0.9 * c, pz = gzw - k * 0.9 * s;
          ctx.solid.add(new THREE.IcosahedronGeometry(0.4, 0), { position: [px, ctx.heightAt(px, pz) + 0.25, pz], scale: [1, 0.8, 1], color: r.pick(['#4f8a34', '#6a9a3a', '#c8a03a', '#b84a3a']), jitter: 0.08 });
        }
      }
    }

    // Fields of maize in rows, with workers among them.
    const field = (cx, cz, w, d) => {
      for (let x = cx - w / 2; x <= cx + w / 2; x += 1.6) {
        for (let z = cz - d / 2; z <= cz + d / 2; z += 0.9) {
          const px = x + r.range(-0.15, 0.15), pz = z + r.range(-0.15, 0.15);
          const h = r.range(1.2, 2);
          ctx.solid.add(new THREE.ConeGeometry(0.22, h, 4), { position: [px, ctx.heightAt(px, pz) + h / 2, pz], rotation: [0, r() * 3, 0], color: r.pick(['#6f9a3a', '#7faa42', '#8aa846']), jitter: 0.08 });
        }
      }
    };
    field(62, 30, 56, 50);
    field(-64, 34, 50, 46);

    // The shared storehouse: an open hall with baskets, jars and grain sacks set out for all.
    const sy = ctx.heightAt(STORE[0], STORE[1]);
    ctx.solid.box(14, 0.4, 9, { position: [STORE[0], sy + 0.2, STORE[1]], color: '#c9b892' });
    for (const [px, pz] of [[-6.5, -4], [6.5, -4], [-6.5, 4], [6.5, 4], [-2.2, 4], [2.2, 4]]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.4, 4.2, 7), { position: [STORE[0] + px, sy + 2.5, STORE[1] + pz], color: '#ece2cc' });
      ctx.colliders.add({ x: STORE[0] + px, z: STORE[1] + pz, w: 0.8, d: 0.8, bottom: sy, top: sy + 4.6 });
    }
    ctx.solid.box(14, 4.2, 0.6, { position: [STORE[0], sy + 2.5, STORE[1] - 4.3], color: '#e6d6b4' });
    ctx.colliders.add({ x: STORE[0], z: STORE[1] - 4.3, w: 14, d: 0.6, bottom: sy, top: sy + 4.6 });
    ctx.solid.box(15.4, 0.5, 10.2, { position: [STORE[0], sy + 4.85, STORE[1]], color: '#4f8aa0' });
    ctx.solid.box(14.4, 0.4, 9.2, { position: [STORE[0], sy + 5.25, STORE[1]], color: '#c8b48e' });
    for (let i = 0; i < 26; i++) {
      const px = STORE[0] + r.range(-5.5, 5.5), pz = STORE[1] + r.range(-3.4, 1.5);
      const kind = r();
      if (kind < 0.4) breadBasket(ctx, { x: px, z: pz, y: sy + 0.4, size: r.range(1.1, 1.5) });
      else if (kind < 0.7) ctx.solid.add(new THREE.SphereGeometry(0.4, 6, 4), { position: [px, sy + 0.75, pz], scale: [1, 1.3, 1], color: r.pick(['#b8865a', '#a0704a', '#c89a6a']) });
      else ctx.solid.add(new THREE.DodecahedronGeometry(0.45, 0), { position: [px, sy + 0.7, pz], scale: [1, 0.9, 1.1], color: '#d8c8a0' });
    }
    ctx.solid.add(new THREE.SphereGeometry(0.5, 6, 4), { position: [STORE[0] - 5, sy + 0.8, STORE[1] - 3.2], color: '#d8a84a' });

    // Fountain in the plaza.
    const fy = ctx.heightAt(0, -18);
    ctx.solid.add(new THREE.CylinderGeometry(3, 3.2, 0.8, 12), { position: [0, fy + 0.4, -18], color: '#d8ccb0' });
    ctx.solid.add(new THREE.CylinderGeometry(2.6, 2.6, 0.1, 12), { position: [0, fy + 0.78, -18], color: '#5aa0b8', jitter: 0.02 });
    ctx.solid.add(new THREE.CylinderGeometry(0.4, 0.6, 2, 7), { position: [0, fy + 1.6, -18], color: '#d8ccb0' });
    ctx.solid.add(new THREE.CylinderGeometry(1.1, 0.4, 0.4, 9), { position: [0, fy + 2.7, -18], color: '#d8ccb0' });
    ctx.colliders.add({ x: 0, z: -18, w: 6, d: 6, bottom: fy, top: fy + 2.9 });

    // Banners of welcome along the main street.
    for (let z = 0; z <= 40; z += 10) {
      for (const side of [-1, 1]) {
        const x = side * 4.8, y = ctx.heightAt(x, z);
        ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.1, 4, 5), { position: [x, y + 2, z], color: '#6a4a30' });
        ctx.solid.add(new THREE.ConeGeometry(0.5, 1.4, 4), { position: [x - side * 0.1, y + 3.1, z], rotation: [Math.PI, 0, 0], scale: [1, 1, 0.15], color: trims[(z / 10 + (side > 0 ? 1 : 0)) % 4] });
      }
    }

    // A family sharing a meal at a mat beside the street.
    const MEAL = [-1.8, 2.5];
    const my = ctx.heightAt(...MEAL);
    ctx.solid.box(3, 0.05, 2, { position: [MEAL[0], my + 0.03, MEAL[1]], color: '#b8543a', jitter: 0 });
    breadBasket(ctx, { x: MEAL[0] - 0.5, z: MEAL[1], y: my + 0.05 });
    breadBasket(ctx, { x: MEAL[0] + 0.6, z: MEAL[1] + 0.3, y: my + 0.05, size: 0.8 });
    const family = [
      { dx: -1.9, dz: 0, robe: '#e8dcc4', mantle: '#4f7aa0', arms: 'out' },
      { dx: 1.9, dz: 0.2, robe: '#c46a4a', mantle: '#f0e6d0', arms: 'down' },
      { dx: 0.2, dz: -1.5, robe: '#8fa3b8', mantle: '#d8a84a', arms: 'out' },
      { dx: -0.6, dz: 1.5, robe: '#d9c39a', arms: 'down', scale: 0.7 },
      { dx: 0.9, dz: 1.4, robe: '#7f9a6a', arms: 'out', scale: 0.62 },
    ];
    for (const f of family) {
      const x = MEAL[0] + f.dx, z = MEAL[1] + f.dz;
      person(ctx, { x, z, face: MEAL, robe: f.robe, mantle: f.mantle, arms: f.arms, scale: f.scale ?? 1, kneel: !f.scale, skin: '#9b6a46' });
    }
  },
};
