// 2 Nephi 5:5-16: having fled from his brothers, Nephi founds the city of Nephi and builds a temple "after the
// manner of the temple of Solomon", though not of so many precious things. The temple rises at the head of the city.
import { solomonTemple, house, scaffold } from './lib/bom-07-temple.js';
import { stack, provisions, field, campfire } from './lib/bom-07-camp.js';
import { beam } from './lib/bom-07-ship.js';

const TEMPLE = [0, -40];

const workers = [
  [-7.5, -36], [-8.2, -44], [7.6, -32], [8.4, -48], [-3, -21.5], [3.4, -22], [0.5, -26], [-7.8, -26], [6.8, -24],
];

export default {
  title: '2 Nephi 5:5-16: Nephi builds a temple',
  seed: 11,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [-0.5, 0.62, 0.45], color: '#ffeacc', intensity: 2.9 },
  light: { sky: '#a8c0e0', ground: '#7a6448', hemi: 1.05 },
  sky: { top: '#4f82c0', horizon: '#e4e0d0', ground: '#d0c4a8', sunColor: '#fff2d0', glow: 0.9 },
  fog: { color: '#dcd8c8', near: 90, far: 560 },
  clouds: { count: 40, shadow: '#a8acb8', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [120, 230], hole: 0.3 },
  mountains: { count: 46, color: '#4a5a4c', radius: [480, 720], height: [60, 170], haze: 0.32 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.32, shadowTint: '#2a3450', highlightTint: '#fff0d0' },
  shadow: { center: [0, -25], radius: 70 },

  player: { start: [3.5, 13], yaw: 0.06, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 17,
    hills: 44,
    bumps: 0.25,
    flats: [{ x: 0, z: -20, r: 120, falloff: 60, height: 0 }],
    colors: { ground: '#b89c6e', groundAlt: '#a88c62', grass: '#7e8a4c', high: '#8a845a', rock: '#8a7a64' },
    patches: [
      { x: TEMPLE[0], z: TEMPLE[1], r: 50, color: '#cdb58c', strength: 0.7, rough: 0.4 },
      { x: 0, z: 20, r: 30, color: '#b49468', strength: 0.5, rough: 0.5 },
      { x: -40, z: -10, r: 35, color: '#a6825a', strength: 0.45, rough: 0.6 },
      { x: 45, z: 5, r: 30, color: '#c0a47a', strength: 0.45, rough: 0.6 },
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: [0, -20], ring: [150, 330], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#4f7432' } },
    { type: 'rock', count: 20, center: [0, -20], ring: [140, 300], spacing: 14, seed: 10, props: { color: '#857a6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.35,
      hoodChance: 0.25,
    },
    groups: [
      { count: workers.length, points: workers, face: TEMPLE, children: 0, onStructures: true, seed: 111 },
      { count: 8, center: [-22, -8], ring: [2, 6], spacing: 1.3, face: [-22, -8], children: 0, kneel: 0.3, seed: 112 },
      { count: 7, center: [20, -12], ring: [2, 6], spacing: 1.3, face: [20, -12], children: 0, seed: 113 },
      { count: 18, center: [0, 30], ring: [8, 40], arc: [Math.PI, Math.PI * 2], spacing: 2.5, face: TEMPLE, children: 0.3, seed: 114, avoid: [{ rect: [3, 8, 8, 20] }] },
      { count: 14, center: [0, 10], ring: [10, 50], spacing: 3, face: TEMPLE, children: 0.3, seed: 115, avoid: [{ rect: [3, 8, 8, 20] }, { rect: [0, -40, 40, 60] }] },
    ],
  },

  figures: [
    { x: -2.5, z: -6, face: [0, -40], robe: '#9a6a44', mantle: '#5a3d2b', skin: '#9b6a46', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE, heightAt, rand } = ctx;
    const t = solomonTemple(ctx, { x: TEMPLE[0], z: TEMPLE[1], progress: 0.62, court: false, stone: '#d4c6a4', trim: '#ac956e' });
    const [hx, hz] = t.at(0, t.H.z);
    scaffold(ctx, { x: hx, z: hz, w: t.H.w + 9, d: t.H.d + 5, y: t.top, h: t.H.h * 0.62 + 2.5, levels: 3 });

    const [cx, cz] = t.at(6.5, t.pillarZ + 1);
    const ct = t.top;
    const apex = new THREE.Vector3(cx, ct + 13, cz);
    beam(ctx.solid, new THREE.Vector3(cx - 2.5, ct, cz - 1.5), apex, 0.3, '#7a5a3a');
    beam(ctx.solid, new THREE.Vector3(cx + 2.5, ct, cz - 1.5), apex, 0.3, '#7a5a3a');
    beam(ctx.solid, new THREE.Vector3(cx, ct, cz + 3), apex, 0.3, '#7a5a3a');
    beam(ctx.solid, apex, new THREE.Vector3(cx, ct + 6, cz), 0.06, '#3a2a1e');
    ctx.solid.box(1.6, 1, 1.6, { position: [cx, ct + 5.5, cz], color: '#a8703a' });
    const [lx, lz] = t.at(14, 30);
    for (let i = 0; i < 2; i++) ctx.solid.add(new THREE.CylinderGeometry(0.85, 0.85, 9.5, 10), { position: [lx + i * 0.1, heightAt(lx, lz) + 0.9, lz + i * 2.2], rotation: [0, 0, Math.PI / 2], color: '#a8703a', jitter: 0.03 });
    ctx.colliders.add({ x: lx, z: lz + 1.1, w: 10, d: 4.4, bottom: 0, top: 1.8 });

    const stones = (x, z, n) => {
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / 6), k = i % 6;
        const px = x + (k % 3) * 1.3 - 1.3 + row * 0.3, pz = z + Math.floor(k / 3) * 1.1 - 0.5;
        ctx.solid.box(1.2, 0.7, 1.0, { position: [px, heightAt(px, pz) + 0.35 + row * 0.7, pz], rotation: [0, rand.range(-0.1, 0.1), 0], color: '#d0c2a0', jitter: 0.05 });
      }
      ctx.colliders.add({ x, z, w: 4.2, d: 2.6, bottom: 0, top: heightAt(x, z) + 0.7 * Math.ceil(n / 6) });
    };
    stones(-22, -8, 16);
    stones(-26, -14, 12);
    stones(20, -12, 14);
    stones(-16, -22, 9);
    stack(ctx, { x: 24, z: -24, rot: 0.2, n: 9, len: 8 });
    stack(ctx, { x: 28, z: -20, rot: 0.3, n: 6, len: 7, color: '#7a5434' });
    provisions(ctx, { x: -12, z: 6, count: 5 });
    campfire(ctx, { x: -30, z: 18, light: 5 });

    const pad = (x, z, w, d, rot, color, lift = 0.06) => {
      const c = Math.cos(rot), sn = Math.sin(rot);
      let lo = Infinity, hi = -Infinity;
      for (const [u, v] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
        const h = heightAt(x + u * c + v * sn, z - u * sn + v * c);
        lo = Math.min(lo, h);
        hi = Math.max(hi, h);
      }
      const bottom = lo - 0.15, top = hi + lift;
      ctx.solid.box(w, top - bottom, d, { position: [x, (top + bottom) / 2, z], rotation: [0, rot, 0], color, jitter: 0.04 });
    };
    const paving = ['#e4d4b0', '#c8b088', '#d8c29a', '#bea47c', '#d0b890'];
    for (let ix = -7; ix <= 7; ix++) {
      for (let iz = 0; iz <= 8; iz++) {
        const x = ix * 2.6, z = -10.8 + iz * 2.6;
        if (Math.abs(x) < 9 && z < -11) continue;
        pad(x, z, 2.3, 2.3, rand.range(-0.03, 0.03), rand.pick(paving), 0.08);
      }
    }
    for (let z = 12.6; z <= 44; z += 2.2) for (const x of [-1.15, 1.15]) pad(x + rand.range(-0.05, 0.05), z, 2.1, 1.95, rand.range(-0.03, 0.03), rand.pick(paving), 0.08);
    for (const s of [-1, 1]) for (let z = 11.8; z <= 44; z += 1.1) pad(s * 2.6, z, 0.5, 1.0, 0, '#9a8462', 0.14);
    const dirt = ['#9a7650', '#a07c56', '#94704a'];
    for (const [x, z, w, d, r] of [[0, 2, 110, 3.2, 0], [0, -66, 110, 3.2, 0], [-42, -30, 3.2, 120, 0], [42, -30, 3.2, 120, 0], [-24, 25, 3, 50, 0.5], [24, 25, 3, 50, -0.5], [-70, -20, 3, 70, 0], [70, -20, 3, 70, 0]]) {
      pad(x, z, w, d, r, rand.pick(dirt), 0.04);
    }

    for (let gx = -7; gx <= 7; gx++) {
      for (let gz = -7; gz <= 6; gz++) {
        const x = gx * 15 + rand.range(-3, 3), z = gz * 15 - 15 + rand.range(-3, 3);
        if (Math.abs(x) < 34 && z > -95 && z < 2) continue;
        if (Math.abs(x) < 22 && z > -10) continue;
        if (Math.hypot(x, z + 20) > 125 || rand() < 0.3) continue;
        const rot = Math.round(rand() * 4) * (Math.PI / 2) + rand.range(-0.08, 0.08);
        const w = rand.range(5, 9), d = rand.range(4.5, 7);
        pad(x, z, w + 4, d + 4, rot, rand.pick(['#c8ac80', '#bfa074', '#d0b68c', '#b89870']), 0.05);
        house(ctx, { x, z, rot, w, d, h: rand.range(2.8, 4), color: rand.pick(['#d8c09a', '#e0ccaa', '#ccb490', '#d4be9e']), roof: rand.pick(['#7a5a3a', '#8a6440', '#6a4a30']) });
      }
    }
    field(ctx, { x: -150, z: 40, w: 40, d: 26, rot: 0.2, rows: 14 });
    field(ctx, { x: 150, z: 30, w: 36, d: 24, rot: -0.3, rows: 12 });
  },
};
