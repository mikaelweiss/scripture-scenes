// Joseph Smith-History 1:50-59: the stone box on the west side of the hill near Manchester, September 22, 1823.
// Joseph has levered up the rounded lid stone; the plates, breastplate and Urim and Thummim lie inside. Moroni stands by.
import { hardwood, sapling, settler, messenger, railFence, farmhouse, field, frame } from './lib/pgp-07-kit.js';

const BOX = [-35, 0];
const START = [-30, 3.4];
const autumn = ['#6f8a3a', '#7d9440', '#c9a83a', '#d8b848', '#cf7a2e', '#b8562a', '#8a9a40'];

function stoneBox(ctx) {
  const { THREE } = ctx;
  const r = ctx.rand;
  const [bx, bz] = BOX;
  let y0 = Infinity;
  for (const [dx, dz] of [[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5], [0, 0]]) y0 = Math.min(y0, ctx.heightAt(bx + dx, bz + dz));
  const W = 1.25, D = 0.9, H = 0.55, T = 0.16;
  const base = y0 - 0.2;
  ctx.solid.box(W + 0.5, 0.3, D + 0.5, { position: [bx, base + 0.02, bz], color: '#5e4a34', jitter: 0.1 });
  const course = (x, z, w, d) => {
    for (let k = 0; k < 3; k++) {
      const n = Math.max(1, Math.round(Math.max(w, d) / 0.32));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n - 0.5;
        const px = x + (w > d ? t * w : 0), pz = z + (w > d ? 0 : t * d);
        ctx.solid.box(w > d ? w / n - 0.02 : w, H / 3 - 0.02, w > d ? d : d / n - 0.02, {
          position: [px, base + 0.2 + (k + 0.5) * (H / 3), pz],
          rotation: [r.range(-0.03, 0.03), r.range(-0.05, 0.05), r.range(-0.03, 0.03)],
          color: r.pick(['#8a8478', '#7a7468', '#948c7c', '#6e6a60']),
          jitter: 0.08,
        });
      }
    }
  };
  course(bx, bz - D / 2 + T / 2, W, T);
  course(bx, bz + D / 2 - T / 2, W, T);
  course(bx - W / 2 + T / 2, bz, T, D - 2 * T);
  course(bx + W / 2 - T / 2, bz, T, D - 2 * T);
  ctx.solid.box(W - 2 * T, 0.04, D - 2 * T, { position: [bx, base + 0.22, bz], color: '#b8ae98', jitter: 0.05 });
  for (const dx of [-0.22, 0.22]) ctx.solid.box(0.12, 0.12, D - 2 * T, { position: [bx + dx, base + 0.3, bz], color: '#8a8478' });
  ctx.colliders.add({ x: bx, z: bz, w: W, d: D, bottom: base, top: base + 0.2 + H });

  const top = base + 0.36;
  ctx.solid.box(0.2, 0.15, 0.22, { position: [bx - 0.05, top + 0.075, bz + 0.05], color: '#d9a62e', jitter: 0.04 });
  for (let i = 0; i < 6; i++) ctx.solid.box(0.205, 0.004, 0.222, { position: [bx - 0.05, top + 0.02 + i * 0.024, bz + 0.05], color: '#b07e1e', jitter: 0 });
  for (const dz of [-0.06, 0, 0.06]) {
    ctx.solid.add(new THREE.TorusGeometry(0.03, 0.006, 4, 8), { position: [bx - 0.15, top + 0.075, bz + 0.05 + dz], rotation: [0, 0, Math.PI / 2], color: '#c89a2a', jitter: 0 });
  }
  ctx.effects.halo({ position: [bx - 0.05, top + 0.12, bz + 0.05], size: 0.9, opacity: 0.35, color: '#ffd77a' });
  ctx.solid.add(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI, 0, Math.PI / 2), { position: [bx + 0.28, top + 0.02, bz - 0.02], rotation: [-Math.PI / 2, 0, 0], scale: [1, 1.3, 0.5], color: '#b8bcc0', jitter: 0.06 });
  ctx.solid.add(new THREE.TorusGeometry(0.08, 0.008, 4, 10, Math.PI), { position: [bx + 0.1, top + 0.03, bz + 0.22], rotation: [-Math.PI / 2, 0, 0], color: '#c8ccd0', jitter: 0 });
  for (const dx of [0.02, 0.18]) ctx.glow.add(new THREE.OctahedronGeometry(0.035, 0), { position: [bx + dx, top + 0.035, bz + 0.22], scale: [1, 0.6, 1], color: '#d8f2ff', jitter: 0 });

  const [lx, lz] = [bx + 0.15, bz - D / 2 - 0.55];
  ctx.solid.add(new THREE.SphereGeometry(1, 9, 5), {
    position: [lx, ctx.heightAt(lx, lz) + 0.45, lz],
    rotation: [1.1, 0.05, 0],
    scale: [0.85, 0.24, 0.6],
    color: '#7e786c',
    jitter: 0.1,
  });
  ctx.colliders.add({ x: lx, z: lz, w: 1.5, d: 0.8, bottom: base, top: base + 0.9 });
  ctx.solid.add(new THREE.CylinderGeometry(0.035, 0.05, 1.8, 5), {
    position: [bx + 1.1, ctx.heightAt(bx + 1.1, bz - 0.8) + 0.2, bz - 0.8],
    rotation: [0, 0.35, 1.38],
    color: '#6a5038',
  });
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, d = r.range(1.0, 2.4);
    const x = bx + Math.cos(a) * d, z = bz + Math.sin(a) * d;
    ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.05, 0.14), 0), { position: [x, ctx.heightAt(x, z) + 0.03, z], color: '#5e4a34', jitter: 0.1 });
  }
}

export default {
  title: 'Joseph Smith-History 1:50-59: The Hill Cumorah',
  seed: 1827,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [0.75, 0.42, 0.25], color: '#ffe0b0', intensity: 2.6 },
  light: { sky: '#a8c4e4', ground: '#5a5a34', hemi: 0.95 },
  sky: { top: '#5f8cc8', horizon: '#dfe6e0', ground: '#9aa88a', sunColor: '#fff0d0', glow: 0.8 },
  fog: { color: '#c4d0cc', near: 80, far: 620 },
  clouds: { count: 40, shadow: '#9aa2b4', lit: '#ffffff', rim: '#fffaf0', distance: [300, 900], altitude: [120, 260], hole: 0.5 },
  mountains: { count: 40, color: '#6a7a7a', radius: [520, 760], height: [30, 70], haze: 0.7 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.4, shadowTint: '#283040', highlightTint: '#fff2d8' },
  shadow: { center: [-35, 0], radius: 40 },

  player: { start: START, yaw: Math.atan2(START[0] - (BOX[0] - 0.4), START[1] - (BOX[1] - 0.3)), pitch: -0.22, eye: 1.65, speed: 4 },

  terrain: {
    size: 1300,
    segments: 220,
    seed: 23,
    hills: 10,
    bumps: 0.3,
    flats: [
      { x: 0, z: -55, r: 6, falloff: 100, height: 28 },
      { x: 0, z: 55, r: 6, falloff: 100, height: 28 },
      { x: 0, z: 0, r: 12, falloff: 110, height: 34 },
    ],
    colors: { ground: '#6f7f3e', groundAlt: '#7c8644', grass: '#8a944c', high: '#768442', rock: '#6a7440' },
    patches: [
      { x: BOX[0], z: BOX[1], r: 2.6, color: '#5e4a34', strength: 0.9, rough: 0.5 },
      { x: -160, z: -40, r: 40, color: '#c4aa5a', strength: 0.7, rough: 0.2 },
      { x: -170, z: 60, r: 45, color: '#a0a050', strength: 0.6, rough: 0.2 },
    ],
  },

  scatter: [
    { type: 'rock', count: 18, center: [0, 0], ring: [12, 120], spacing: 10, seed: 4, avoid: [{ r: 12, x: BOX[0], z: BOX[1] }], props: { color: '#7e786c', size: 0.8 } },
  ],

  custom(ctx) {
    const r = ctx.rand;
    stoneBox(ctx);
    const dir = [BOX[0] - START[0], BOX[1] - START[1]];
    const len = Math.hypot(...dir);
    const view = (x, z) => {
      const t = ((x - START[0]) * dir[0] + (z - START[1]) * dir[1]) / len;
      const off = Math.abs((x - START[0]) * dir[1] - (z - START[1]) * dir[0]) / len;
      return Math.hypot(x - BOX[0], z - BOX[1]) < 9 || (t > -4 && t < 160 && off < 6 + t * 0.35);
    };
    const placed = [];
    for (let tries = 0; placed.length < 260 && tries < 9000; tries++) {
      const x = r.range(-160, 160), z = r.range(-220, 220);
      const hill = Math.hypot(x * 1.4, z * 0.75) < 150;
      if ((!hill && r() < 0.8) || view(x, z) || placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 5)) continue;
      placed.push([x, z]);
      hardwood(ctx, { x, z, h: r.range(9, 16), radius: r.range(0.25, 0.42), leaves: autumn, canopy: 1.25, trunk: r.pick(['#5e5248', '#6b5e52', '#7e7870']) });
    }
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2, d = r.range(4, 30);
      const x = BOX[0] + Math.cos(a) * d, z = BOX[1] + Math.sin(a) * d;
      if (view(x, z)) continue;
      sapling(ctx, { x, z, leaf: r.pick(autumn) });
    }
    for (const [x, z, w, d, color] of [[-200, -60, 70, 50, '#c8ae5a'], [-210, 10, 60, 60, '#8a9a44'], [-190, 80, 70, 50, '#b89a4e'], [-280, -20, 80, 70, '#a4a050'], [-270, 70, 60, 60, '#c4a85a']]) {
      field(ctx, { x, z, w, d, rot: 0.05, color, rows: 14, h: 0.45 });
      railFence(ctx, { a: [x - w / 2, z - d / 2], b: [x + w / 2, z - d / 2] });
      railFence(ctx, { a: [x + w / 2, z - d / 2], b: [x + w / 2, z + d / 2] });
    }
    farmhouse(ctx, { x: -150, z: 30, rot: Math.PI / 2 + 0.1 });
    farmhouse(ctx, { x: -240, z: -110, rot: 1.2, wall: '#b8aa90' });
    farmhouse(ctx, { x: -310, z: 140, rot: 1.8, wall: '#c0a888' });
    ctx.solid.box(6, 4, 9, { position: [-142, ctx.heightAt(-142, 44) + 2, 44], rotation: [0, 0.1, 0], color: '#8a4a34' });

    settler(ctx, {
      x: BOX[0] + 0.2, z: BOX[1] + 1.05, yaw: Math.PI + 0.1, pose: 'kneel', arms: 'forward',
      coat: '#3a3830', pants: '#4a4238', hair: '#7a5634', skin: '#e0b090', scale: 1,
    });
    const [hx, hz] = frame(BOX[0], BOX[1], 0)(1.1, 1.5);
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.24, 0.24, 0.02, 9), { position: [hx, ctx.heightAt(hx, hz) + 0.03, hz], color: '#1e1b1a' });
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.13, 0.14, 0.17, 9), { position: [hx, ctx.heightAt(hx, hz) + 0.12, hz], color: '#1e1b1a' });
    const m = [BOX[0] - 1.6, BOX[1] - 1.4];
    messenger(ctx, { x: m[0], z: m[1], y: ctx.heightAt(...m) + 0.25, face: [BOX[0] + 0.2, BOX[1] + 1.2], scale: 1.08, arms: 'out', light: 16, distance: 10, halo: 3.2, haloOpacity: 0.5, emissive: 0.55 });
    ctx.colliders.add({ x: m[0], z: m[1], w: 0.7, d: 0.7, bottom: ctx.heightAt(...m) - 1, top: ctx.heightAt(...m) + 2.2 });
  },
};
