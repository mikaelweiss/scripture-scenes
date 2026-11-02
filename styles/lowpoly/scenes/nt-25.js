// Luke 24:13-32. Evening at Emmaus: the road from Jerusalem ends at a village house whose open
// front room shows the risen Lord breaking bread with Cleopas and his companion. -z is north.
import { road, house, town, table, lamp, person, frame } from './lib/nt-25-kit.js';

const ROOM = [0, -8];
const ROAD = [[-6, 160], [-12, 110], [2, 70], [8, 40], [4, 12], [3, 2], [12, -8], [30, -14], [60, -30]];

const wall = '#c8b08a';

function openRoom(ctx, { x, z, w, d, h }) {
  const at = frame(x, z, 0);
  const y = ctx.heightAt(x, z) - 0.05;
  const t = 0.45;
  const box = (lx, lz, bw, bh, bd, by, color = wall, collide = true) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.box(bw, bh, bd, { position: [px, by + bh / 2, pz], color, jitter: 0.05 });
    if (collide) ctx.colliders.add({ x: px, z: pz, w: bw, d: bd, bottom: by, top: by + bh });
  };
  box(0, -d / 2, w + t, h, t, y);
  box(-w / 2, 0, t, h, d, y);
  box(w / 2, 0, t, h, d, y);
  box(-w / 2 + 0.6, d / 2, 1.2, h, t, y);
  box(w / 2 - 0.6, d / 2, 1.2, h, t, y);
  box(0, d / 2, w - 2.4, 0.5, t, y + h - 0.5, '#b49c78', false);
  box(0, 0, w + 1.2, 0.3, d + 1.2, y + h, '#8a7458', false);
  box(0, 0, w + 0.6, 0.45, d + 0.6, y + h + 0.3, wall, false);
  for (let i = 0; i < 5; i++) box(-w / 2 + 0.6 + (i * (w - 1.2)) / 4, 0, 0.18, 0.2, d, y + h - 0.22, '#5a4030', false);
  box(0, 0, w - 0.1, 0.06, d - 0.1, y, '#9c8466', false);
  box(-w / 2 + 0.3, -d / 2 + 0.6, 0.6, 1.2, 0.6, y, '#a0603a', true);
  box(w / 2 - 0.5, -d / 2 + 0.35, 1.2, 0.08, 0.5, y + 1.6, '#5a4030', false);
  return y;
}

export default {
  title: 'Luke 24:13-32: The road to Emmaus',
  seed: 25,
  fov: 60,
  exposure: 0.95,

  sun: { direction: [-0.9, 0.16, 0.32], color: '#ffa060', intensity: 2.8 },
  light: { sky: '#6a74a8', ground: '#4a3a30', hemi: 1.25 },
  sky: { top: '#2e3560', horizon: '#f08a5a', ground: '#9a6a58', sunColor: '#ffb070', glow: 1.4 },
  fog: { color: '#b88070', near: 60, far: 480 },
  clouds: { count: 40, shadow: '#4a3a52', lit: '#ff9a68', rim: '#ffd9a0', distance: [260, 900], altitude: [90, 220], hole: 0.3 },
  mountains: { count: 40, color: '#4e4656', radius: [480, 720], height: [40, 110], haze: 0.55 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.45, shadowTint: '#2a2050', highlightTint: '#ffd0a0' },
  shadow: { center: [0, -6], radius: 50 },

  player: { start: [0.7, -1.4], yaw: 0.07, pitch: -0.12, eye: 1.65, speed: 4 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 25,
    hills: 30,
    bumps: 0.3,
    flats: [{ x: 0, z: -10, r: 38, falloff: 40, height: 0 }],
    colors: { ground: '#9a8058', groundAlt: '#8a7450', grass: '#6f7840', high: '#7f7a58', rock: '#7a6a58' },
    patches: [{ x: 0, z: -8, r: 14, color: '#a89070', strength: 0.6, rough: 0.3 }],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 60, center: [0, 0], ring: [24, 200], spacing: 9, seed: 31, avoid: [{ rect: [0, 80, 30, 180] }, { rect: [30, -20, 70, 20] }], props: { kind: 'broad', leaf: '#6f7d4c', h: 5 } },
    { type: 'tree', count: 10, center: [0, -10], ring: [14, 40], spacing: 8, seed: 32, avoid: [{ rect: [6, 20, 14, 40] }, { rect: [30, -18, 60, 14] }], props: { kind: 'broad', leaf: '#77845a', h: 4.5 } },
    { type: 'rock', count: 40, center: [0, 0], ring: [30, 260], spacing: 10, seed: 33, avoid: [{ rect: [0, 80, 26, 180] }], props: { size: 1.4 } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#7a4e36'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.7,
      hoodChance: 0.4,
    },
    groups: [
      { count: 3, points: [[-14, -26], [-16, -24.5], [22, -20]], face: [0, -8], children: 0.3, seed: 41 },
    ],
  },

  custom(ctx) {
    road(ctx, { path: ROAD, width: 3.4, color: '#d2b48a' });
    for (let i = 0; i < 70; i++) {
      const k = Math.floor(ctx.rand() * (ROAD.length - 1)), f = ctx.rand();
      const [ax, az] = ROAD[k], [bx, bz] = ROAD[k + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const side = (ctx.rand() < 0.5 ? -1 : 1) * (2.4 + ctx.rand() * 2.5);
      const px = ax + (bx - ax) * f - ((bz - az) / len) * side, pz = az + (bz - az) * f + ((bx - ax) / len) * side;
      if (Math.hypot(px - ROOM[0], pz - ROOM[1]) < 6) continue;
      const s = 0.3 + ctx.rand() * 0.5;
      ctx.solid.add(new ctx.THREE.IcosahedronGeometry(s, 0), { position: [px, ctx.heightAt(px, pz) + s * 0.4, pz], scale: [1.3, 0.7, 1.1], color: ctx.rand() < 0.5 ? '#5f6a38' : '#76703e', jitter: 0.1 });
    }
    const y = openRoom(ctx, { x: ROOM[0], z: ROOM[1], w: 7.4, d: 5.2, h: 3.2 });
    const top = table(ctx, { x: ROOM[0], z: ROOM[1] - 0.4, w: 2.6, d: 1.0, h: 0.62, color: '#6a4830' });
    ctx.solid.box(3.2, 0.42, 0.45, { position: [ROOM[0], y + 0.21, ROOM[1] - 1.45], color: '#5a3e2a' });
    for (const sx of [-1.75, 1.75]) ctx.solid.box(0.45, 0.42, 1.4, { position: [ROOM[0] + sx, y + 0.21, ROOM[1] - 0.4], color: '#5a3e2a' });
    for (const [bx, bz, s] of [[-0.6, -0.3, 1], [0.7, -0.25, 0.9], [-0.25, 0.15, 0.7]]) {
      ctx.solid.add(new ctx.THREE.SphereGeometry(0.16, 7, 4), { position: [ROOM[0] + bx, top + 0.05, ROOM[1] + bz], scale: [1.3 * s, 0.45, 1 * s], color: '#c08a4e', jitter: 0.08 });
    }
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.1, 0.07, 0.25, 7), { position: [ROOM[0] + 0.95, top + 0.12, ROOM[1] - 0.6], color: '#9a5a36' });
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.06, 0.05, 0.1, 7), { position: [ROOM[0] - 1, top + 0.05, ROOM[1] - 0.1], color: '#b0703e' });
    lamp(ctx, { x: ROOM[0] + 0.3, y: top, z: ROOM[1] - 0.15, intensity: 5, range: 9 });
    lamp(ctx, { x: ROOM[0] + 3.2, y: y + 1.68, z: ROOM[1] - 2.25, intensity: 4, range: 7 });

    person(ctx, {
      x: ROOM[0], z: ROOM[1] - 1.45, y: y - 0.28, face: [ROOM[0], ROOM[1] + 10], robe: '#fbf7ee', mantle: '#f1e9d8', skin: '#a8754f', arms: 'out', emissive: 0.22,
      light: { color: '#fff0cf', intensity: 3, distance: 6 }, halo: { size: 2.2, opacity: 0.22, color: '#fff3d6' },
    });
    person(ctx, { x: ROOM[0] - 1.75, z: ROOM[1] - 0.4, y: y - 0.45, face: [ROOM[0], ROOM[1] - 1.2], robe: '#7a5a3c', mantle: '#4f5a6b', skin: '#9b6a46' });
    person(ctx, { x: ROOM[0] + 1.75, z: ROOM[1] - 0.4, y: y - 0.45, face: [ROOM[0], ROOM[1] - 1.2], robe: '#8f6e48', mantle: '#7d4a32', skin: '#8a5a3c', hood: true });

    house(ctx, { x: -11, z: -12, rot: 0.1, w: 7, d: 6, h: 3.4, color: '#c2a986' });
    house(ctx, { x: 12, z: -24, rot: -0.2, w: 6, d: 7, h: 4, color: '#cbb592' });
    town(ctx, { center: [0, -40], radius: 34, count: 18, seed: 25, spacing: 9, avoid: [{ x: 0, z: -8, r: 14 }, { x: 30, z: -18, r: 8 }, { x: 50, z: -28, r: 8 }], face: [0, 20] });
    for (let i = 0; i < 9; i++) {
      const sx = -4.5 - i * 1.5;
      ctx.solid.box(1.3, 1.0, 0.6, { position: [sx, ctx.heightAt(sx, 3) + 0.4, 3 + Math.sin(i) * 0.3], rotation: [0, 0.08 * i, 0], color: '#a99272', jitter: 0.1 });
    }
  },
};
