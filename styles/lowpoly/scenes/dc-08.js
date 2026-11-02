// D&C 110: April 3, 1836. Behind the lowered veils of the Kirtland Temple's west pulpits, Joseph Smith
// and Oliver Cowdery see the Lord on the breastwork of the pulpit, then Moses, Elias, and Elijah.
// The room is built around the origin with the pulpits at the north (-z) end.
import { box, room, people, palettes, person, glowFigure, pointLight } from './lib/dc-08-kit.js';

const W = 17, D = 20, H = 6.4;
const plaster = '#ece6da';
const white = '#f3efe6';
const rail = '#6a4a30';
const TIERS = [0.55, 1.1, 1.65, 2.2];
const tierFront = (i) => -D / 2 + 0.95 * (TIERS.length - i);

const rows = Array.from({ length: 9 }, (_, i) => -1.6 + i * 1.15);
const pewBlocks = [[-3.9, -0.9], [0.9, 3.9], [-8.2, -5.2], [5.2, 8.2]];

function pew(ctx, x0, x1, z) {
  const w = x1 - x0, x = (x0 + x1) / 2;
  box(ctx, { x, y: 0.1, z, w, h: 0.42, d: 0.48, color: white });
  box(ctx, { x, y: 0.1, z: z + 0.27, w, h: 0.95, d: 0.07, color: white });
  ctx.solid.box(w, 0.06, 0.12, { position: [x, 1.08, z + 0.27], color: rail, jitter: 0.03 });
  for (const ex of [x0, x1]) box(ctx, { x: ex, y: 0.1, z: z + 0.05, w: 0.06, h: 0.95, d: 0.6, color: white });
}

const congregation = [];
rows.forEach((z, r) => {
  pewBlocks.forEach(([x0, x1], b) => {
    for (let x = x0 + 0.45; x < x1 - 0.3; x += 0.72) if ((r * 7 + b * 3 + Math.round(x * 5)) % 3 !== 0) congregation.push([x, z]);
  });
});

export default {
  title: 'D&C 110: The Savior appears in the Kirtland Temple',
  seed: 110,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.75, 0.42, 0.25], color: '#ffd8a0', intensity: 2.2 },
  light: { sky: '#d8d0c4', ground: '#6b5a48', hemi: 0.95 },
  sky: { top: '#7f9ccc', horizon: '#f2d6aa', ground: '#c9b08a', sunColor: '#ffe2b0', glow: 0.8 },
  fog: { color: '#d9ccb6', near: 60, far: 300 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.05, contrast: 1.06, vignette: 0.48, shadowTint: '#2e2a40', highlightTint: '#fff0cc' },
  shadow: { center: [0, 0], radius: 20 },

  player: { start: [0, 2.4], yaw: 0, pitch: 0.1, eye: 1.65, speed: 3 },

  terrain: {
    size: 400, segments: 60, seed: 4, hills: 8, bumps: 0.2,
    flats: [{ x: 0, z: 0, r: 30, falloff: 20, height: 0 }],
    colors: { ground: '#7f8a4c', groundAlt: '#6e7a42', grass: '#7a8a48', rock: '#7a6a58' },
  },

  custom(ctx) {
    box(ctx, { x: 0, y: 0, z: 0, w: W + 0.6, h: 0.1, d: D + 0.6, color: '#8f6c48', jitter: 0.03 });
    for (let x = -W / 2 + 0.6; x < W / 2; x += 1.2) ctx.solid.box(0.03, 0.005, D, { position: [x, 0.105, 0], color: '#6e5236', jitter: 0.02 });

    const windows = (side) => [-6.5, -1.5, 3.5, 8].map((at) => ({ side, at: side === 'w' ? at : at, width: 1.5, bottom: 1.3, top: 4.9, glow: '#fff1d6', bars: 2, barColor: '#e8e2d6' }));
    room(ctx, {
      w: W, d: D, h: H + 2.9, wall: plaster,
      openings: [...windows('w'), ...windows('e'), { side: 's', at: 0, width: 2, bottom: 0, top: 3.2, glow: '#ffe8c0' }, { side: 's', at: -5, width: 1.4, bottom: 1.3, top: 4.9, glow: '#fff1d6', bars: 2 }, { side: 's', at: 5, width: 1.4, bottom: 1.3, top: 4.9, glow: '#fff1d6', bars: 2 }],
    });

    // Flat side ceilings and a central barrel vault on columns.
    for (const s of [-1, 1]) box(ctx, { x: s * (W / 4 + 2.25), y: H, z: 0, w: W / 2 - 4.5 + 0.4, h: 0.25, d: D + 0.6, color: '#f1ece2', collide: false });
    const vault = new ctx.THREE.CylinderGeometry(4.5, 4.5, D + 0.6, 14, 1, true, -Math.PI / 2, Math.PI);
    vault.rotateX(-Math.PI / 2);
    vault.scale(-1, 0.55, 1);
    ctx.solid.add(vault, { position: [0, H, 0], color: '#f4efe6', jitter: 0.02 });
    box(ctx, { x: 0, y: H + 2.55, z: 0, w: 9.4, h: 0.3, d: D + 0.6, color: '#f4efe6', collide: false });
    for (const s of [-1, 1]) {
      ctx.solid.box(0.3, 0.35, D + 0.4, { position: [s * 4.5, H - 0.1, 0], color: '#e2dacb' });
      for (const z of [-3.6, 0.6, 4.8, 8.8]) {
        box(ctx, { x: s * 4.5, y: 0.1, z, w: 0.45, h: 0.35, d: 0.45, color: '#ddd4c4' });
        ctx.solid.add(new ctx.THREE.CylinderGeometry(0.17, 0.2, H - 0.45, 8), { position: [s * 4.5, 0.45 + (H - 0.45) / 2, z], color: white, jitter: 0.02 });
        ctx.colliders.add({ x: s * 4.5, z, w: 0.4, d: 0.4, bottom: 0, top: H });
      }
    }

    // The tiered Melchizedek pulpits.
    TIERS.forEach((h, i) => {
      const f = tierFront(i);
      const d = -D / 2 - f;
      const pw = 8 - i * 0.6;
      box(ctx, { x: 0, y: 0.1, z: (f - D / 2) / 2, w: pw, h, d: -d, color: '#e9e3d6' });
      box(ctx, { x: 0, y: 0.1 + h, z: f + 0.1, w: pw, h: 1.0, d: 0.16, color: white });
      ctx.solid.box(pw + 0.06, 0.08, 0.26, { position: [0, 1.14 + h, f + 0.1], color: '#8a3a32', jitter: 0.03 });
      for (let k = -1; k <= 1; k++) ctx.solid.box(0.9, 0.55, 0.04, { position: [k * pw * 0.3, 0.6 + h, f + 0.19], color: '#e2d9c6', jitter: 0.02 });
    });
    box(ctx, { x: 0, y: 0.1, z: -D / 2 + 0.2, w: 9.5, h: H - 0.2, d: 0.2, color: '#e6dfd0' });
    ctx.glow.box(4, 0.06, 0.05, { position: [0, 4.0, -D / 2 + 0.32], color: '#e8c070' });

    // Veils lowered on either side of the pulpits, the front veil rolled up overhead.
    const veil = '#d9ccb0';
    for (const s of [-1, 1]) {
      for (let k = 0; k < 9; k++) {
        const z = -D / 2 + 0.5 + k * 0.72;
        ctx.solid.box(0.06, H - 0.3, 0.74, { position: [s * (4.5 + (k % 2) * 0.08), 0.1 + (H - 0.3) / 2, z], rotation: [0, (k % 2 ? 0.12 : -0.12) * s, 0], color: veil, jitter: 0.04 });
      }
      ctx.colliders.add({ x: s * 4.5, z: -D / 2 + 3.4, w: 0.2, d: 6.6, bottom: 0, top: H });
    }
    const roll = new ctx.THREE.CylinderGeometry(0.28, 0.28, 9, 8).rotateZ(Math.PI / 2);
    ctx.solid.add(roll, { position: [0, H - 0.4, -3.6], color: veil, jitter: 0.04 });

    // The Lord on the breastwork, a paved work of gold under his feet.
    const fy = 0.1 + TIERS[0] + 1.06;
    const fz = tierFront(0) + 0.35;
    ctx.glow.box(2.2, 0.08, 1.3, { position: [0, fy - 0.02, fz], color: '#ffc23a', jitter: 0.05 });
    for (let k = -2; k <= 2; k++) ctx.glow.box(0.4, 0.09, 1.25, { position: [k * 0.44, fy, fz], color: k % 2 ? '#ffb52a' : '#ffd36a', jitter: 0.04 });
    glowFigure(ctx, {
      x: 0, z: fz, y: fy + 0.04, face: [0, 10], scale: 1.18, emissive: 0.3, robe: '#fffaf0', skin: '#f2dcc0', arms: 'out',
      light: { color: '#fff3d6', intensity: 10, distance: 14, dz: 1.2 },
      halo: { size: 5, opacity: 0.55, color: '#fff2cf' },
    });
    ctx.effects.motes({ position: [0, fy - 1.5, fz + 0.5], radius: 3.2, height: 6, count: 50, color: '#fff2c8', size: 0.04 });

    // Moses, Elias, and Elijah, who follow.
    const top = 0.1 + TIERS[3];
    [[-2.6, -8.0, '#f1ece0'], [2.6, -8.0, '#efeadf'], [0, -8.95, '#f6f2ea']].forEach(([x, z, robe], i) => {
      glowFigure(ctx, { x, z, y: i === 2 ? top + 1.05 : 0.1 + TIERS[2] + 1.05, face: [0, 10], scale: 1.05, emissive: 0.15, robe, skin: '#e2c6a2', halo: { size: 3, opacity: 0.3, color: '#fff4dc' } });
    });
    

    // Joseph and Oliver kneel at the foot of the pulpit.
    person(ctx, { x: -0.75, z: tierFront(0) + 2.0, face: [0, -10], robe: '#2a2624', mantle: '#1f1c1a', skin: '#e2b896', hat: null, sink: 0.48 });
    person(ctx, { x: 0.75, z: tierFront(0) + 2.1, face: [0, -10], robe: '#3a3029', mantle: '#2a221d', skin: '#dcae8c', hat: null, sink: 0.48 });

    rows.forEach((z) => pewBlocks.forEach(([x0, x1]) => pew(ctx, x0, x1, z)));
    people(ctx, [
      { points: congregation.filter((_, i) => i % 2 === 0), count: Math.ceil(congregation.length / 2), face: [0, -20], onStructures: true, sink: 0.72, children: 0.1, palette: palettes.men, hats: false, seed: 31 },
      { points: congregation.filter((_, i) => i % 2 === 1), count: Math.floor(congregation.length / 2), face: [0, -20], onStructures: true, sink: 0.72, children: 0.15, palette: { ...palettes.women, hoodChance: 0.5 }, hats: false, seed: 32 },
    ]);
  },
};
