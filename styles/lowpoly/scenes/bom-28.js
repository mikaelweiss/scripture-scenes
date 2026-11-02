// Alma 31:13-23: In the Zoramite synagogue a high, narrow stand, the Rameumptom, holds one worshiper at a time
// who stretches his hands toward heaven and repeats the same prayer. The proud, richly dressed wait their turn.
// Alma and his brethren stand near the door, astonished.
import { room, floor, block, brazier, figure, cloth, linePoints } from './lib/bom-25-kit.js';

const HALL = { x: 0, z: -8, w: 26, d: 30, h: 10 };
const STAND = [0, -11];
const gold = '#d4a636';
const tiers = [[2.8, 1.5], [2.2, 1.5], [1.7, 1.5], [1.2, 1.6]];
const TOP = tiers.reduce((s, [, h]) => s + h, 0);

const queue = [...linePoints([0.4, -19.4], [0.8, -21.6], 3), ...linePoints([2, -22.4], [8, -22.4], 6)];

export default {
  title: 'Alma 31:13-23: The Rameumptom',
  seed: 28,
  fov: 64,
  exposure: 1.05,

  sun: { direction: [0.15, 0.95, 0.25], color: '#fff0d0', intensity: 3.4 },
  light: { sky: '#d6c8b8', ground: '#5a4232', hemi: 0.95 },
  sky: { top: '#4f7fc4', horizon: '#e8d8bc', ground: '#c0a07c', sunColor: '#fff6e0', glow: 0.8 },
  fog: { color: '#cdb8a0', near: 60, far: 400 },
  mountains: { count: 36, color: '#6a6a5e', radius: [500, 760], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.5, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.08, vignette: 0.5, shadowTint: '#2e2448', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -8], radius: 26 },

  player: { start: [1.3, -0.6], yaw: 0.1, pitch: 0.25, eye: 1.65, speed: 4 },

  terrain: {
    size: 800,
    segments: 140,
    seed: 28,
    hills: 26,
    bumps: 0.3,
    flats: [{ x: 0, z: -8, r: 40, falloff: 40, height: 0 }],
    colors: { ground: '#9c8460', groundAlt: '#8a7454', grass: '#6c7a40', high: '#7a8058', rock: '#7a6a58' },
  },

  scatter: [
    { type: 'tree', count: 40, center: [0, -8], ring: [30, 200], spacing: 8, seed: 3, props: { kind: 'palm', leaf: '#5a8238' } },
  ],

  crowd: {
    palette: {
      robes: ['#5a2a5a', '#7a1f2a', '#e8dcc4', '#2f4a6a', '#3a6a5a', '#c9a040', '#6a3a7a', '#d8cdb5'],
      mantles: ['#d4a636', '#c8902a', '#e8e0d0', '#a8342a', '#5a2a5a', '#2f6f6a'],
      skins: ['#a87652', '#b5835e', '#9b6a46', '#c08a62'],
      mantleChance: 0.9,
      hoodChance: 0.05,
    },
    groups: [
      { count: queue.length, points: queue, face: STAND, children: 0, seed: 81 },
      {
        count: 110, center: STAND, ring: [6, 12.5], spacing: 1.0, face: STAND, children: 0.1, seed: 82,
        avoid: [{ rect: [STAND[0], STAND[1] - 7, 4, 14] }, { rect: [5, -22.4, 12, 2.4] }, { rect: [0, 2, 14, 10] }, { rect: [2.5, -1, 3, 8] }],
      },
    ],
  },

  custom(ctx) {
    const { x, z, w, d, h } = HALL;
    floor(ctx, { x, z, w, d, tile: 2, colors: ['#d8ccb4', '#bba88a'] });
    room(ctx, {
      x, z, w, d, h, t: 0.8, color: '#e6dcc8',
      bands: [{ y: 0, h: 1.2, color: '#5a2a5a' }, { y: 1.2, h: 0.25, color: gold }, { y: 7.6, h: 0.5, color: gold }, { y: 8.1, h: 1.9, color: '#7a1f2a' }],
      openings: [{ side: 's', at: 0, w: 3.6, h: 4.2 }],
    });

    // Roof with a square opening over the stand, so daylight falls on the worshiper.
    const [sx, sz] = STAND;
    const hole = 2.4;
    const ry = h + 0.25;
    const north = z - d / 2, south = z + d / 2;
    ctx.solid.box(w + 1.6, 0.5, sz - hole - north + 0.8, { position: [x, ry, (north - 0.8 + sz - hole) / 2], color: '#5e4632' });
    ctx.solid.box(w + 1.6, 0.5, south + 0.8 - (sz + hole), { position: [x, ry, (sz + hole + south + 0.8) / 2], color: '#5e4632' });
    for (const s of [-1, 1]) ctx.solid.box(w / 2 + 0.8 - hole, 0.5, hole * 2, { position: [sx + s * (hole + (w / 2 + 0.8 - hole) / 2), ry, sz], color: '#5e4632' });
    for (let bz = north + 2; bz < south; bz += 3) if (Math.abs(bz - sz) > hole) ctx.solid.box(w, 0.4, 0.35, { position: [x, h - 0.2, bz], color: '#4a3424' });

    // Columns along the side aisles.
    for (const cx of [-9.5, 9.5]) for (const cz of [-19, -13, -7, -1, 4]) ctx.builders.column(ctx, { x: cx, z: cz, h, radius: 0.55, color: '#e0d2b6', broken: false });

    // The Rameumptom: a tapering stand, gold-banded, with a steep stair at its back.
    let y = 0;
    tiers.forEach(([tw, th], i) => {
      block(ctx, { x: sx, z: sz, y, w: tw, h: th, d: tw, color: i % 2 ? '#d9cbb0' : '#c9b48e' });
      ctx.solid.box(tw + 0.12, 0.18, tw + 0.12, { position: [sx, y + th - 0.09, sz], color: gold, jitter: 0.02 });
      y += th;
    });
    ctx.solid.box(1.5, 0.15, 1.5, { position: [sx, TOP + 0.07, sz], color: gold, jitter: 0.02 });
    ctx.colliders.add({ x: sx, z: sz, w: 1.5, d: 1.5, bottom: TOP - 0.2, top: TOP + 0.15 });
    for (const [px, pz] of [[-0.68, -0.68], [0.68, -0.68], [-0.68, 0.68], [0.68, 0.68]]) ctx.solid.box(0.08, 0.55, 0.08, { position: [sx + px, TOP + 0.42, sz + pz], color: gold, jitter: 0 });
    for (const s of [-1, 1]) {
      ctx.solid.box(1.4, 0.06, 0.06, { position: [sx, TOP + 0.68, sz + s * 0.68], color: gold, jitter: 0 });
      ctx.solid.box(0.06, 0.06, 1.4, { position: [sx + s * 0.68, TOP + 0.68, sz], color: gold, jitter: 0 });
    }
    const steps = 14, rise = (TOP + 0.15) / steps, run = 0.5;
    for (let i = 0; i < steps; i++) {
      block(ctx, { x: sx, z: sz - 0.75 - run * (i + 0.5), y: 0, w: 0.9, h: TOP + 0.15 - rise * i, d: run, color: i % 2 ? '#c9b48e' : '#bda67e' });
    }

    // The worshiper on top, arms raised; the next waits on the stair.
    figure(ctx, { x: sx, z: sz, y: TOP + 0.15, face: [sx, sz + 10], scale: 1.3, robe: '#f2e6cc', mantle: '#7a2878', skin: '#b5835e', arms: 'out', collide: false });
    const sunlit = new ctx.THREE.PointLight('#fff0d0', 14, 7, 1.5);
    sunlit.position.set(sx, TOP + 3.2, sz + 1.6);
    ctx.scene.add(sunlit);
    figure(ctx, { x: sx, z: sz - 0.75 - run * 6.5, y: TOP + 0.15 - rise * 6, face: [sx, sz], robe: '#7a1f2a', mantle: gold, skin: '#a87652', collide: false });
    figure(ctx, { x: sx, z: sz - 0.75 - run * 10.5, y: TOP + 0.15 - rise * 10, face: [sx, sz], robe: '#2f4a6a', mantle: '#e8e0d0', skin: '#b5835e', collide: false });

    // Daylight from the opening onto the stand.
    ctx.effects.beam({ position: [sx, 0, sz], height: h + 2, radiusBottom: 1.4, radiusTop: 2.2, color: '#fff2d0', opacity: 0.2 });

    // Hangings and braziers.
    for (const cx of [-7, -2.5, 2.5, 7]) cloth(ctx, { x: cx, y: 5.2, z: z - d / 2 + 0.5, w: 2, h: 4.4, color: cx < 0 ? '#5a2a5a' : '#7a1f2a', amp: 0.03, speed: 0.7, seed: 11 + cx });
    for (const [bx, bz] of [[-6.5, -4], [6.5, -4], [-6.5, -18], [6.5, -18]]) brazier(ctx, { x: bx, z: bz, intensity: 6, distance: 12 });

    // Alma and his brethren in plain robes by the door, watching.
    figure(ctx, { x: -2.2, z: -2.4, face: STAND, robe: '#f0e8d8', mantle: '#c9b48e', skin: '#a87652' });
    figure(ctx, { x: -3.4, z: -1.6, face: STAND, robe: '#a0825c', mantle: '#6e5a44', skin: '#9b6a46', hood: true });
    figure(ctx, { x: -1.2, z: -1.3, face: STAND, robe: '#b59a72', skin: '#b07a55' });
    figure(ctx, { x: -4.4, z: -2.8, face: STAND, robe: '#8b6b4a', mantle: '#5e4b3a', skin: '#a87652' });
  },
};
