// Mormon 6: the Nephites gather around the hill Cumorah. Mormon, old, stands on the hill with his
// people in companies of ten thousand below, as the Lamanite armies march on them in dust.
// No wounds: armies, banners and dust only. Hill at the origin, the Lamanites come from the south (+z).
import { crowd, spears, banner, person } from './lib/bom-43-kit.js';
import { rng } from '../engine/util.js';

const HILL_TOP = 30;

function formation(cx, cz, cols, rows, gap, seed, rot = 0) {
  const r = rng(seed);
  const pts = [];
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (r() < 0.06) continue;
      const lx = (i - (cols - 1) / 2) * gap + r.range(-0.2, 0.2), lz = (j - (rows - 1) / 2) * gap + r.range(-0.2, 0.2);
      pts.push([cx + lx * c + lz * s, cz - lx * s + lz * c]);
    }
  }
  return pts;
}

const nephiteCompanies = [
  [-52, 72], [-26, 80], [0, 84], [26, 80], [52, 72], [-70, 50], [70, 50], [-38, 104], [-13, 108], [13, 108], [38, 104],
];
const lamaniteHosts = [
  [-120, 172], [-68, 184], [-14, 190], [40, 188], [94, 180], [146, 166], [-95, 232], [-40, 246], [15, 250], [70, 244], [125, 228],
];

export default {
  title: 'Mormon 6: The last battle at Cumorah',
  seed: 46,
  fov: 58,
  exposure: 0.98,

  sun: { direction: [-0.8, 0.3, 0.45], color: '#ffa060', intensity: 2.8 },
  light: { sky: '#a08a9a', ground: '#6a4a34', hemi: 1.35 },
  sky: { top: '#3a3448', horizon: '#e0844a', ground: '#a06a48', sunColor: '#ffb070', glow: 1.4 },
  fog: { color: '#b07a58', near: 70, far: 520 },
  clouds: { count: 110, shadow: '#3a2e38', lit: '#e08a50', rim: '#ffc88a', distance: [200, 800], altitude: [70, 200], hole: 0.15, seed: 7 },
  mountains: { count: 40, color: '#4a3e3a', radius: [520, 760], height: [30, 90], haze: 0.55 },
  bloom: { strength: 0.5, radius: 0.6, threshold: 0.84 },
  grade: { saturation: 1.0, contrast: 1.1, vignette: 0.5, shadowTint: '#2a1e3a', highlightTint: '#ffd0a0' },
  shadow: { center: [0, 50], radius: 110 },

  player: { start: [-1.2, 18.2], yaw: Math.PI + 0.14, pitch: -0.15, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100, segments: 220, seed: 46, hills: 12, bumps: 0.3,
    flats: [
      { x: 0, z: 190, r: 170, falloff: 60, height: 0 },
      { x: 0, z: 0, r: 12, falloff: 62, height: HILL_TOP },
    ],
    colors: { ground: '#8a7a50', groundAlt: '#7a6a46', grass: '#6a7040', high: '#6f7a44', rock: '#6a5a48' },
    patches: [
      { x: 0, z: 150, r: 110, color: '#a08460', strength: 0.6, rough: 0.4 },
      { x: 0, z: 250, r: 120, color: '#a88a64', strength: 0.5, rough: 0.4 },
    ],
  },

  objects: [
    { type: 'rock', x: 9, z: -4, size: 2.4 },
    { type: 'rock', x: -12, z: 6, size: 1.8 },
  ],

  scatter: [
    { type: 'tree', count: 60, center: [0, 0], ring: [14, 70], arc: [Math.PI, Math.PI * 2], spacing: 6, seed: 8, props: { kind: 'broad', leaf: '#4f5a30' } },
    { type: 'tree', count: 90, center: [0, 100], ring: [200, 380], spacing: 8, seed: 9, props: { kind: 'broad', leaf: '#4a5530' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [20, 90], spacing: 8, seed: 10, props: { size: 1.4 } },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const nephPalette = {
      robes: ['#d8ccb0', '#c4b490', '#8a8070', '#a8987a', '#e0d6c0'],
      mantles: ['#3f5a7a', '#4a6a8a', '#6a5a40', '#2f4a6a'],
      skins: ['#c09070', '#b5835e', '#a87652', '#c89a78'],
      mantleChance: 0.8, hoodChance: 0.05,
    };
    const lamPalette = {
      robes: ['#5a2a20', '#3a2a24', '#7a3424', '#4a3a2a', '#6a4430'],
      mantles: ['#8a2a1a', '#2a2020', '#a03a20', '#5a4a30'],
      skins: ['#7a4c31', '#8a5a3c', '#6a4028'],
      mantleChance: 0.6, hoodChance: 0.05,
    };
    const withCount = (g) => ({ ...g, count: g.points.length });
    const neph = crowd(ctx, nephPalette, nephiteCompanies.map(([x, z], i) => withCount({
      points: formation(x, z, 13, 10, 1.25, 100 + i, Math.atan2(-x, 160 - z) * 0.4), face: [x * 0.6, 260], children: 0, seed: 200 + i,
    })));
    spears(ctx, neph, { every: 2, color: '#5a4630', tip: '#c8b890' });
    const lam = crowd(ctx, lamPalette, lamaniteHosts.map(([x, z], i) => withCount({
      points: formation(x, z, 24, 13, 1.3, 300 + i, Math.atan2(-x, z) * 0.3), face: [x * 0.4, 60], children: 0, seed: 400 + i,
    })));
    spears(ctx, lam, { every: 2, color: '#3a2a1e', tip: '#8a8478', length: 2.9 });

    nephiteCompanies.forEach(([x, z], i) => {
      banner(ctx, { x: x - 5, z: z - 7, h: 6, color: i % 2 ? '#2f4a7a' : '#e8dcc0', trim: '#c8a050', rot: 0 });
      banner(ctx, { x: x + 5, z: z - 7, h: 5, color: '#3f5a7a', trim: '#e8dcc0', rot: 0 });
    });
    lamaniteHosts.forEach(([x, z], i) => {
      banner(ctx, { x: x - 6, z: z - 9, h: 7, color: i % 2 ? '#8a1e14' : '#1e1814', trim: '#a07040', rot: Math.PI, w: 1.4, d: 2.2 });
      banner(ctx, { x: x + 7, z: z - 9, h: 6, color: '#a0301a', trim: '#2a1a14', rot: Math.PI });
    });

    // Dust raised by the marching hosts, drifting north toward the hill.
    lamaniteHosts.forEach(([x, z], i) => {
      ctx.effects.smoke({ position: [x, ctx.heightAt(x, z) + 1, z + 14], count: 7, height: 16, size: 2.6, color: '#b8946a', wind: [0.6, 0.8], seed: 500 + i });
    });
    for (let i = 0; i < 8; i++) {
      const x = -140 + i * 40, z = 330;
      ctx.effects.smoke({ position: [x, ctx.heightAt(x, z) + 1, z], count: 7, height: 34, size: 6, color: '#a88460', wind: [0.4, 0.4], seed: 600 + i });
    }

    // Mormon and a few of his captains on the brow of the hill, looking out over the plain.
    const brow = [[2, 24], [-7, 23], [8, 22], [-3, 27], [12, 19]];
    brow.forEach(([x, z], i) => person(ctx, {
      x, z, face: i === 0 ? [x - 50, 120] : [x * 2, 120],
      robe: i === 0 ? '#e0d6c0' : '#c4b490', mantle: i === 0 ? '#7a2a20' : '#3f5a7a', skin: i === 0 ? '#c8a080' : '#b5835e',
      arms: i === 0 ? 'out' : 'down', scale: i === 0 ? 1.04 : 1,
    }));
    banner(ctx, { x: 4.5, z: 22, h: 5.5, color: '#e8dcc0', trim: '#2f4a7a' });
    // Mormon's white hair and beard, the one sign of his age.
    const my = ctx.heightAt(2, 24);
    ctx.solid.add(new THREE.IcosahedronGeometry(0.145, 0), { position: [2, my + 1.68, 24 - 0.03], scale: [1, 0.5, 1], color: '#e8e4dc' });

    // Hilltop camp: tents and a dying fire.
    for (const [x, z, rot] of [[-14, -8, 0.3], [-6, -14, 1.2], [6, -12, 0.7], [15, -6, 0.1]]) {
      const y = ctx.heightAt(x, z) - 0.1;
      ctx.solid.add(new THREE.ConeGeometry(2.4, 2.6, 4), { position: [x, y + 1.3, z], rotation: [0, rot, 0], color: '#b8a888', jitter: 0.06 });
      ctx.colliders.add({ x, z, w: 3, d: 3, rot, bottom: y, top: y + 2.6 });
    }
  },
};
