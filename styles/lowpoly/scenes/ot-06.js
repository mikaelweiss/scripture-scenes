// Genesis 11:1-9: on the plain of Shinar the people burn bricks and raise a tower whose top is still unfinished.
// The tower stands north (-z); kilns, brick yards and the new city spread around it.
import { fire } from './lib/ot-01-kit.js';

const TOWER = [0, -90];
const BRICK = '#b5714a';
const BRICK_DARK = '#8a4e34';
const MUD = '#c9a77a';

const tiers = 8, tierHeight = 7.5, inset = 3.3, W = 68;
const front = TOWER[1] + W / 2 + inset;
const runLen = (tiers * tierHeight * inset) / tierHeight;
const stairWorkers = Array.from({ length: 44 }, (_, i) => [((i * 7) % 5 - 2) * 1.3, front - 1 - (i / 44) * (runLen - 2)]);

export default {
  title: 'Genesis 11:1-9: The Tower of Babel',
  seed: 606,
  fov: 62,
  exposure: 1.1,

  sun: { direction: [-0.62, 0.48, 0.42], color: '#ffd29a', intensity: 3.2 },
  light: { sky: '#a8b4d0', ground: '#8a6a48', hemi: 1.2 },
  sky: { top: '#5a7ab0', horizon: '#f2d2a2', ground: '#c8a47a', sunColor: '#ffe2b0', glow: 1.0 },
  fog: { color: '#d8bc94', near: 90, far: 620 },
  clouds: { count: 30, seed: 6, shadow: '#a89880', lit: '#fff0d8', rim: '#fff8e8', distance: [320, 900], altitude: [120, 260], hole: 0.3 },
  mountains: { count: 30, seed: 4, color: '#9a8a74', radius: [600, 800], height: [20, 60], haze: 0.65 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.38, shadowTint: '#3a2a50', highlightTint: '#ffe6c0' },
  shadow: { center: [0, -60], radius: 100 },

  player: { start: [14, 38], yaw: 0.1, pitch: 0.27, eye: 1.65, speed: 5 },

  terrain: {
    size: 1300,
    segments: 200,
    seed: 61,
    hills: 6,
    bumps: 0.25,
    flats: [{ x: 0, z: -50, r: 140, falloff: 60, height: 0 }],
    colors: { ground: '#c4a274', groundAlt: '#b8966a', grass: '#a89a62', high: '#b09a74', rock: '#a08a6a' },
    patches: [
      { x: TOWER[0], z: TOWER[1] + 10, r: 70, color: '#a8805a', strength: 0.6, rough: 0.5 },
      { x: -40, z: -10, r: 22, color: '#8e6a4c', strength: 0.6, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: TOWER[0], z: TOWER[1], w: W, d: W, tiers, tierHeight, inset, stairWidth: 9, color: BRICK, trim: BRICK_DARK, stairColor: '#c48a5e' },
  ],

  scatter: [
    { type: 'tree', count: 40, center: [0, -50], ring: [180, 360], spacing: 10, seed: 3, props: { kind: 'palm', leaf: '#6a8a3a' } },
    { type: 'rock', count: 16, center: [0, -50], ring: [160, 360], spacing: 20, seed: 4, props: { color: '#a08a6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#d8cdb5', '#9a4a34'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.4,
      hoodChance: 0.35,
    },
    groups: [
      { count: stairWorkers.length, points: stairWorkers, face: TOWER, children: 0, onStructures: true, seed: 11 },
      { count: 260, center: [0, -30], ring: [18, 95], arc: [-0.2, Math.PI + 0.2], spacing: 1.6, face: TOWER, children: 0.1, seed: 12, avoid: [{ rect: [TOWER[0], TOWER[1], W + 4, W + 4] }, { rect: [14, 36, 26, 26] }, { r: 9, x: 42, z: -30 }, { r: 9, x: -44, z: -22 }, { r: 9, x: 52, z: -62 }] },
      { count: 9, points: [[5.5, 25.5], [9.2, 25.8], [2.4, 25], [7.2, 20.8], [10.6, 22.6], [21, 26.6], [24, 27.4], [3.2, 29], [18.6, 25.2]], face: [12, 26], children: 0, seed: 14 },
      { count: 80, center: TOWER, ring: [W * 0.72, W * 0.95], arc: [Math.PI, Math.PI * 2], spacing: 1.8, face: TOWER, children: 0.05, seed: 13 },
    ],
  },

  custom(ctx) {
    const { THREE, solid } = ctx;
    const r = ctx.rand;
    const [tx, tz] = TOWER;
    const base = ctx.heightAt(tx, tz) - 0.2;
    const top = base + tiers * tierHeight;

    // The unfinished crown: a brick core with ragged courses, scaffolding and a hoisting beam.
    const core = 16;
    solid.box(core, 9, core, { position: [tx, top + 4.5, tz], color: BRICK });
    for (let i = 0; i < 26; i++) {
      const side = i % 4, f = r.range(-0.5, 0.5) * core;
      const h = r.range(1, 5);
      const [bx, bz] = side === 0 ? [f, -core / 2 + 1] : side === 1 ? [f, core / 2 - 1] : side === 2 ? [-core / 2 + 1, f] : [core / 2 - 1, f];
      solid.box(r.range(2, 4), h, 2, { position: [tx + bx, top + 9 + h / 2, tz + bz], color: r() < 0.5 ? BRICK : BRICK_DARK });
    }
    for (let k = 0; k < 4; k++) solid.box(core + 0.3, 0.35, core + 0.3, { position: [tx, top + 1.5 + k * 2.2, tz], color: '#3a2a22' });
    const ring = core / 2 + 1.5;
    for (let i = -2; i <= 2; i++) for (const [px, pz] of [[i * ring / 2, ring], [i * ring / 2, -ring], [ring, i * ring / 2], [-ring, i * ring / 2]]) {
      solid.box(0.3, 18, 0.3, { position: [tx + px, top + 9, tz + pz], color: '#7a5a3a' });
    }
    for (const hy of [4, 9, 14]) {
      for (const [w, d, ox, oz] of [[core + 3, 0.6, 0, core / 2 + 1.5], [core + 3, 0.6, 0, -core / 2 - 1.5], [0.6, core + 3, core / 2 + 1.5, 0], [0.6, core + 3, -core / 2 - 1.5, 0]]) {
        solid.box(w, 0.2, d * 2, { position: [tx + ox, top + hy, tz + oz], color: '#9a7a50' });
      }
    }
    solid.box(0.5, 0.5, 16, { position: [tx + 4, top + 19, tz + 6], rotation: [-0.5, 0.3, 0], color: '#6a4a2e' });
    solid.box(0.5, 20, 0.5, { position: [tx + 4, top + 10, tz + 1], color: '#6a4a2e' });

    // Brick kilns: domes with glowing mouths and smoke.
    for (const [kx, kz] of [[42, -30], [-44, -22], [52, -62]]) {
      const ky = ctx.heightAt(kx, kz);
      solid.add(new THREE.SphereGeometry(4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), { position: [kx, ky, kz], color: BRICK_DARK });
      solid.add(new THREE.CylinderGeometry(4.2, 4.4, 1.2, 8), { position: [kx, ky + 0.3, kz], color: '#7a4630' });
      ctx.colliders.add({ x: kx, z: kz, w: 7, d: 7, bottom: ky, top: ky + 4 });
      ctx.glow.box(1.8, 1.4, 0.4, { position: [kx, ky + 0.9, kz + 4.05], color: '#ff8a2a' });
      fire(ctx, { position: [kx, ky + 3.8, kz], size: 0.8, light: 10, smokeHeight: 30, seed: Math.round(kx) });
      // Stacks of fired brick beside each kiln.
      for (let s = 0; s < 3; s++) {
        const bx = kx + 7 + s * 2.4, bz = kz + 3;
        const h = r.range(1, 1.8);
        solid.box(2, h, 1.2, { position: [bx, ctx.heightAt(bx, bz) + h / 2, bz], color: s % 2 ? BRICK : '#c07850' });
      }
    }

    // Brick moulds drying in rows.
    for (let i = 0; i < 12; i++) for (let j = 0; j < 18; j++) {
      const bx = -52 + j * 1.1, bz = -6 + i * 0.9;
      solid.box(0.7, 0.18, 0.4, { position: [bx, ctx.heightAt(bx, bz) + 0.05, bz], color: r() < 0.5 ? '#c8a070' : '#bf9466', jitter: 0.06 });
    }
    // A brick yard close by: a mud pit, rows of moulds, and stacks of burnt brick ready to carry.
    solid.add(new THREE.CircleGeometry(2.6, 9).rotateX(-Math.PI / 2), { position: [1, ctx.heightAt(1, 28) + 0.05, 28], color: '#6a4a30' });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 9; j++) {
      const bx = 19 + j * 0.9, bz = 28.5 + i * 0.75;
      solid.box(0.6, 0.16, 0.36, { position: [bx, ctx.heightAt(bx, bz) + 0.06, bz], color: r() < 0.5 ? '#c8a070' : '#bf9466', jitter: 0.06 });
    }
    for (const [sx, sz, rot] of [[6, 27, 0.2], [4, 23, -0.3], [8.2, 23.4, 0.5], [1.5, 31, 0.1]]) {
      const sy = ctx.heightAt(sx, sz);
      const layers = 5 + Math.floor(r() * 4);
      const c = Math.cos(rot), sn = Math.sin(rot);
      for (let k = 0; k < layers; k++) {
        const turn = k % 2;
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
          const [lx, lz] = turn ? [(j - 1) * 0.42, (i - 1.5) * 0.22] : [(i - 1.5) * 0.22, (j - 1) * 0.42];
          solid.box(turn ? 0.4 : 0.2, 0.13, turn ? 0.2 : 0.4, { position: [sx + lx * c + lz * sn, sy + 0.07 + k * 0.14, sz - lx * sn + lz * c], rotation: [0, rot, 0], color: r.pick([BRICK, '#c07850', '#a8603e']), jitter: 0.05 });
        }
      }
      ctx.colliders.add({ x: sx, z: sz, w: 1.3, d: 1.3, rot, bottom: sy, top: sy + layers * 0.14 });
    }

    // Bitumen pit.
    solid.add(new THREE.CircleGeometry(5, 9).rotateX(-Math.PI / 2), { position: [30, ctx.heightAt(30, 4) + 0.06, 4], color: '#1e1814' });

    // The city: flat-roofed houses of mud brick.
    for (let i = 0; i < 70; i++) {
      const a = r.range(-0.2, Math.PI * 2), d = r.range(105, 190);
      const hx = tx + Math.cos(a) * d, hz = tz + 30 + Math.sin(a) * d;
      if (Math.abs(hx - 14) < 18 && hz > 0) continue;
      const w = r.range(5, 10), dd = r.range(5, 9), h = r.range(3, 5.5), rot = r.range(-0.2, 0.2);
      const hy = ctx.heightAt(hx, hz) - 0.2;
      solid.box(w, h, dd, { position: [hx, hy + h / 2, hz], rotation: [0, rot, 0], color: MUD });
      solid.box(w + 0.4, 0.3, dd + 0.4, { position: [hx, hy + h, hz], rotation: [0, rot, 0], color: '#a88a62' });
      solid.box(1, 1.8, 0.2, { position: [hx + Math.sin(rot) * (dd / 2 + 0.05), hy + 0.9, hz + Math.cos(rot) * (dd / 2 + 0.05)], rotation: [0, rot, 0], color: '#3a2a1e' });
      ctx.colliders.add({ x: hx, z: hz, w, d: dd, rot, bottom: hy, top: hy + h });
    }
  },
};
