// Alma 32:4-5: On the hill Onidah, Alma teaches the poor who were cast out of the Zoramite synagogues
// because of the coarseness of their apparel. The city of Antionum lies in the valley below.
import { block, figure, house, pole, room } from './lib/bom-25-kit.js';

const HILL = [0, -2];
const ALMA = [0, -14];
const CITY = [25, 135];

export default {
  title: 'Alma 32:4-5: Alma teaches the poor',
  seed: 29,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [-0.45, 0.5, -0.65], color: '#ffc98a', intensity: 3.1 },
  light: { sky: '#9fb2d8', ground: '#5e4a34', hemi: 1.0 },
  sky: { top: '#4f74b8', horizon: '#f4c890', ground: '#c9a882', sunColor: '#ffe0a8', glow: 1.2 },
  fog: { color: '#dcc2a0', near: 140, far: 900 },
  clouds: { count: 50, shadow: '#8a7e88', lit: '#ffdcae', rim: '#fff4dc', distance: [260, 900], altitude: [100, 240], hole: 0.3 },
  mountains: { count: 44, color: '#6a6458', radius: [520, 760], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.42, shadowTint: '#30285e', highlightTint: '#ffe0b0' },
  shadow: { center: [2, 0], radius: 34 },

  player: { start: [3.8, -18.2], yaw: Math.PI - 0.42, pitch: -0.16, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 200,
    seed: 29,
    hills: 12,
    bumps: 0.35,
    flats: [
      { x: CITY[0], z: CITY[1], r: 45, falloff: 40, height: -14 },
      { x: HILL[0], z: HILL[1], r: 21, falloff: 42, height: 14 },
      { x: 3.8, z: -18.2, r: 2, falloff: 6, height: 16 },
    ],
    colors: { ground: '#9a8a5a', groundAlt: '#8a7c4c', grass: '#7a8040', high: '#8a8a52', rock: '#7e6c58' },
    patches: [{ x: ALMA[0], z: ALMA[1] + 8, r: 16, color: '#a08a60', strength: 0.5, rough: 0.6 }],
  },

  scatter: [
    { type: 'rock', count: 30, center: HILL, ring: [8, 60], spacing: 7, seed: 3, avoid: [{ x: 0, z: -2, r: 30 }], props: { size: 1.4, color: '#8a7a64' } },
    { type: 'tree', count: 26, center: HILL, ring: [24, 90], spacing: 9, seed: 4, avoid: [{ x: 0, z: -2, r: 32 }], props: { kind: 'broad', leaf: '#6a7a3a', h: 4.5 } },
    { type: 'tree', count: 50, center: CITY, ring: [35, 90], spacing: 9, seed: 5, props: { kind: 'palm', leaf: '#5d8a3c' } },
  ],

  crowd: {
    palette: {
      robes: ['#7a6a52', '#6a5a44', '#8a7a60', '#5a4a3a', '#9a8a6a', '#7a6248', '#6b6650', '#8c7a5a', '#6a7468', '#7a6a72', '#a89878'],
      mantles: ['#5a4a38', '#4a3e30', '#6e5e44', '#7c6c50', '#3e3a30'],
      skins: ['#8a5a3c', '#9b6a46', '#7a4c31', '#a87652'],
      mantleChance: 0.55,
      hoodChance: 0.55,
    },
    groups: [
      { count: 340, center: ALMA, ring: [4, 21], arc: [0.3, Math.PI - 0.3], spacing: 0.95, face: ALMA, children: 0.25, kneel: 0.55, seed: 91 },
      { count: 40, center: ALMA, ring: [20, 24], arc: [0.3, Math.PI - 0.3], spacing: 1.3, face: ALMA, children: 0.2, seed: 92 },
    ],
  },

  custom(ctx) {
    // Alma on a ledge of rock, his brethren beside him.
    const gy = ctx.heightAt(...ALMA);
    ctx.solid.add(new ctx.THREE.DodecahedronGeometry(1, 0), { position: [ALMA[0], gy, ALMA[1] - 0.3], scale: [1.6, 0.8, 1.3], color: '#8a7a64', jitter: 0.06 });
    block(ctx, { x: ALMA[0], z: ALMA[1], y: gy - 0.3, w: 2.2, h: 1.1, d: 1.6, color: '#958470', jitter: 0.06 });
    const top = gy + 0.8;
    figure(ctx, { x: ALMA[0], z: ALMA[1], y: top, face: [0, 30], scale: 1.04, robe: '#efe6d4', mantle: '#c9b48e', skin: '#a87652', arms: 'out' });
    pole(ctx, { x: ALMA[0] + 0.5, z: ALMA[1] + 0.1, y: top, h: 1.9, r: 0.03 });
    for (const [ox, oz, robe] of [[-2.4, -0.4, '#b59a72'], [-3.4, -1.2, '#cdbb94'], [-4.4, -0.2, '#a0825c']]) {
      figure(ctx, { x: ALMA[0] + ox, z: ALMA[1] + oz, face: [ALMA[0] + ox * 0.5, ALMA[1] + 10], robe, mantle: '#6e5a44', skin: '#9b6a46' });
    }

    // Bundles and walking staffs the poor brought with them.
    const r = ctx.rand;
    for (let i = 0; i < 26; i++) {
      const a = r.range(0.2, Math.PI - 0.2), d = r.range(4, 19);
      const bx = ALMA[0] + Math.cos(a) * d, bz = ALMA[1] + Math.sin(a) * d;
      
      if (r() < 0.6) ctx.solid.add(new ctx.THREE.DodecahedronGeometry(0.3, 0), { position: [bx, ctx.heightAt(bx, bz) + 0.15, bz], scale: [1.2, 0.7, 1], color: r.pick(['#8a7a5a', '#6e6048', '#9a8664']), jitter: 0.08 });
      else ctx.solid.box(0.04, 1.6, 0.04, { position: [bx, ctx.heightAt(bx, bz) + 0.3, bz], rotation: [1.45, r() * 3, 0], color: '#5a4332' });
    }

    // Antionum in the valley: houses around the great synagogue with its gold band.
    const [cx, cz] = CITY;
    const cy = ctx.heightAt(cx, cz);
    room(ctx, { x: cx, z: cz, y: cy, w: 30, d: 22, h: 12, t: 1, color: '#e6dcc8', roof: true, roofColor: '#7a1f2a', bands: [{ y: 9, h: 1.2, color: '#d4a636' }, { y: 0, h: 1.4, color: '#5a2a5a' }], openings: [{ side: 's', at: 0, w: 5, h: 6 }] });
    block(ctx, { x: cx, z: cz, y: cy + 12, w: 8, h: 6, d: 8, color: '#e6dcc8', collide: false });
    ctx.solid.box(8.6, 0.8, 8.6, { position: [cx, cy + 18.4, cz], color: '#d4a636', jitter: 0.02 });
    const spots = [];
    for (let tries = 0; spots.length < 50 && tries < 900; tries++) {
      const a = r() * Math.PI * 2, d = r.range(24, 75);
      const hx = cx + Math.cos(a) * d, hz = cz + Math.sin(a) * d;
      if (spots.some(([px, pz]) => Math.hypot(px - hx, pz - hz) < 10)) continue;
      spots.push([hx, hz]);
      house(ctx, { x: hx, z: hz, rot: Math.atan2(cx - hx, cz - hz), w: r.range(6, 10), d: r.range(5, 8), h: r.range(3, 4.6), color: r.pick(['#e4d6b8', '#dccaa4', '#e8dcc4', '#d4bc94']) });
    }
  },
};
