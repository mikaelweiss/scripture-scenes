// Joseph Smith-History 1:68-73: the bank of the Susquehanna near Harmony, May 15, 1829.
// John the Baptist, in a cloud of light on the bank, has conferred the Aaronic Priesthood;
// Joseph and Oliver stand waist-deep in the river and baptize each other.
import { hardwood, sapling, fern, log, settler, messenger, water, block } from './lib/pgp-07-kit.js';

const START = [5, -2];
const JOSEPH = [-0.65, -14.8];
const OLIVER = [0.65, -14.8];
const JOHN = [-6, -8.2];
const WATER = -0.35;
const FOCUS = [-2.5, -14];
const greens = ['#6f9a3c', '#7fa944', '#5f8a36', '#8db84e', '#557a32'];

const riverFlats = Array.from({ length: 38 }, (_, i) => ({ x: -460 + i * 25, z: -100, r: 86, falloff: 10, height: -1.2 }));

export default {
  title: 'Joseph Smith-History 1:68-73: John the Baptist restores the priesthood',
  seed: 1515,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [-0.55, 0.5, -0.6], color: '#ffe6bc', intensity: 2.5 },
  light: { sky: '#a8c8e8', ground: '#4a5a30', hemi: 0.95 },
  sky: { top: '#5a8ccc', horizon: '#e4ecec', ground: '#a0b0a0', sunColor: '#fff0d0', glow: 1 },
  fog: { color: '#c4d2d4', near: 70, far: 520 },
  clouds: { count: 45, shadow: '#9aa4b8', lit: '#ffffff', rim: '#fff8e8', distance: [280, 900], altitude: [110, 240], hole: 0.5 },
  mountains: { count: 44, color: '#4f6a5a', radius: [520, 760], height: [40, 90], haze: 0.65 },
  bloom: { strength: 0.5, radius: 0.55, threshold: 0.86 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.42, shadowTint: '#203040', highlightTint: '#fff2d8' },
  shadow: { center: [0, -8], radius: 40 },

  player: { start: START, yaw: Math.atan2(START[0] - FOCUS[0], START[1] - FOCUS[1]), pitch: -0.02, eye: 1.65, speed: 4 },

  terrain: {
    size: 1200,
    segments: 220,
    seed: 41,
    hills: 22,
    bumps: 0.3,
    flats: [{ x: 0, z: 16, r: 20, falloff: 16, height: 0.4 }, ...riverFlats],
    colors: { ground: '#5f7a34', groundAlt: '#6c8638', grass: '#5a7a34', high: '#4f6a30', rock: '#6a6a4a' },
    patches: [
      { x: 0, z: -8, r: 6, color: '#8a7a5a', strength: 0.5, rough: 0.6 },
      { x: -30, z: -9, r: 8, color: '#8a7a5a', strength: 0.5, rough: 0.6 },
      { x: 30, z: -8, r: 8, color: '#8a7a5a', strength: 0.5, rough: 0.6 },
    ],
  },

  scatter: [
    { type: 'rock', count: 26, center: [0, -9], ring: [2, 40], arc: [-0.1, -Math.PI + 0.1], spacing: 3, seed: 4, avoid: [{ r: 5, x: JOHN[0], z: JOHN[1] }, { r: 4, x: 0, z: -15 }, { rect: [0, -40, 300, 50] }], props: { color: '#7a7468', size: 0.6 } },
  ],

  custom(ctx) {
    const r = ctx.rand;
    water(ctx, { x: 0, z: -100, w: 1100, d: 190, y: WATER, color: '#4e7f86', opacity: 0.88, amp: 0.035, seg: 4, flow: [1.2, 0] });
    block(ctx, { x: 0, z: -11.5, w: 300, d: 1 });

    const dir = [FOCUS[0] - START[0], FOCUS[1] - START[1]];
    const len = Math.hypot(...dir);
    const view = (x, z) => {
      const t = ((x - START[0]) * dir[0] + (z - START[1]) * dir[1]) / len;
      const off = Math.abs((x - START[0]) * dir[1] - (z - START[1]) * dir[0]) / len;
      return (t > -3 && off < 4 + Math.max(0, t) * 0.22) || Math.hypot(x - JOHN[0], z - JOHN[1]) < 5;
    };
    const near = [];
    for (let tries = 0; near.length < 160 && tries < 6000; tries++) {
      const x = r.range(-110, 110), z = r.range(-7, 80);
      if (view(x, z) || near.some(([px, pz]) => Math.hypot(px - x, pz - z) < 5.5)) continue;
      near.push([x, z]);
      hardwood(ctx, { x, z, h: r.range(10, 17), leaves: greens, canopy: 1.2, trunk: r.pick(['#5e5248', '#6b5e52', '#8a8478']) });
    }
    const far = [];
    for (let tries = 0; far.length < 320 && tries < 8000; tries++) {
      const x = r.range(-420, 420), z = r.range(-205, -330);
      if (far.some(([px, pz]) => Math.hypot(px - x, pz - z) < 9)) continue;
      far.push([x, z]);
      hardwood(ctx, { x, z, h: r.range(12, 20), leaves: greens, canopy: 1.5 });
    }
    for (let i = 0; i < 90; i++) {
      const x = r.range(-50, 50), z = r.range(-7, 30);
      if (view(x, z) && Math.hypot(x - START[0], z - START[1]) > 4 && z < -2) continue;
      if (Math.hypot(x - START[0], z - START[1]) < 3) continue;
      if (r() < 0.4) sapling(ctx, { x, z, leaf: r.pick(greens) });
      else fern(ctx, { x, z, color: r.pick(['#5f8f3a', '#6e9a42', '#4f7a32']) });
    }

    const L = [0.8, -4.2];
    log(ctx, { x: L[0], z: L[1], len: 2.6, rot: 1.45, radius: 0.2, color: '#8a7458', y: ctx.heightAt(...L) - 0.08 });
    const ly = ctx.heightAt(...L) + 0.2;
    ctx.solid.box(0.55, 0.06, 0.8, { position: [L[0] - 0.5, ly + 0.04, L[1]], rotation: [0.1, 1.2, 0.2], color: '#2e2c2a' });
    ctx.solid.box(0.5, 0.06, 0.75, { position: [L[0] + 0.5, ly + 0.04, L[1] + 0.05], rotation: [-0.1, 1.5, -0.15], color: '#3a2e26' });
    for (const dx of [-0.3, 0.75]) {
      ctx.solid.add(new ctx.THREE.CylinderGeometry(0.24, 0.24, 0.02, 9), { position: [L[0] + dx * 1.6, ly + 0.11, L[1] + 0.05], color: '#1e1b1a' });
      ctx.solid.add(new ctx.THREE.CylinderGeometry(0.13, 0.14, 0.17, 9), { position: [L[0] + dx * 1.6, ly + 0.2, L[1] + 0.05], color: '#1e1b1a' });
    }

    settler(ctx, {
      x: JOSEPH[0], z: JOSEPH[1], yaw: Math.PI / 2, arms: 'raise', coatOff: true,
      shirt: '#efe8da', vest: '#3a3430', pants: '#3a3530', hair: '#7a5634', skin: '#e0b090',
    });
    settler(ctx, {
      x: OLIVER[0], z: OLIVER[1], yaw: -Math.PI / 2, arms: 'pray', coatOff: true,
      shirt: '#ece4d4', vest: '#5a4a3a', pants: '#3a3a3a', hair: '#2a1e16', skin: '#dcaa88',
    });
    for (const [x, z] of [JOSEPH, OLIVER]) {
      ctx.solid.add(new ctx.THREE.TorusGeometry(0.32, 0.03, 3, 12), { position: [x, WATER + 0.02, z], rotation: [Math.PI / 2, 0, 0], color: '#d8ecee', jitter: 0 });
      ctx.solid.add(new ctx.THREE.TorusGeometry(0.62, 0.02, 3, 16), { position: [x, WATER + 0.01, z], rotation: [Math.PI / 2, 0, 0], color: '#a8c8cc', jitter: 0 });
    }

    const jy = ctx.heightAt(...JOHN) + 0.7;
    messenger(ctx, { x: JOHN[0], z: JOHN[1], y: jy, face: [0, -14.8], scale: 1.08, arms: 'out', light: 30, distance: 14, halo: 3, haloOpacity: 0.45, emissive: 0.45 });
    ctx.colliders.add({ x: JOHN[0], z: JOHN[1], w: 0.8, d: 0.8, bottom: jy - 2, top: jy + 2 });
    const cloudMat = new ctx.THREE.MeshLambertMaterial({ color: '#fffaf0', emissive: '#fff4dc', emissiveIntensity: 0.4, transparent: true, opacity: 0.5, flatShading: true, depthWrite: false });
    const puffs = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const m = new ctx.THREE.Mesh(new ctx.THREE.IcosahedronGeometry(r.range(0.35, 0.6), 0), cloudMat);
      m.position.set(JOHN[0] + Math.cos(a) * 0.6, jy - 0.05 + r.range(-0.1, 0.15), JOHN[1] + Math.sin(a) * 0.6);
      m.scale.set(1, 0.55, 1);
      ctx.scene.add(m);
      puffs.push([m, a, m.position.y]);
    }
    ctx.onFrame((t) => {
      for (const [m, a, y] of puffs) {
        m.position.x = JOHN[0] + Math.cos(a + t * 0.15) * 0.62;
        m.position.z = JOHN[1] + Math.sin(a + t * 0.15) * 0.62;
        m.position.y = y + Math.sin(t * 0.8 + a) * 0.04;
      }
    });
    ctx.effects.beam({ position: [JOHN[0], ctx.heightAt(...JOHN), JOHN[1]], height: 60, radiusBottom: 1.8, radiusTop: 4, color: '#fff4d8', opacity: 0.16 });
    ctx.effects.motes({ position: [JOHN[0], ctx.heightAt(...JOHN), JOHN[1]], radius: 1.8, height: 8, count: 80 });
  },
};
