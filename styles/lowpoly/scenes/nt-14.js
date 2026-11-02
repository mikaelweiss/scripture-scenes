// John 5:2-9. The pool of Bethesda in Jerusalem: two pools ringed by four porches with a fifth between them,
// the sick lying on mats in the shade. Christ stands on the middle porch over the man who has waited 38 years.
import { person, createWater, house } from './lib/nt-13-kit.js';

const FY = 1.5;
const ROOF = FY + 5;
const W = 22, D = 18;
const PX = 14, PZ = 12, MID = 2;
const stone = '#dccaa4';
const pale = '#e6d7b6';
const shade = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

const sickPoints = [];
const lying = [];
{
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const add = (x, z, yaw) => (r() < 0.35 ? lying.push([x, z, yaw]) : sickPoints.push([x, z]));
  for (let x = -19; x <= 19; x += 2.6) {
    if (Math.abs(x) < 2.5) continue;
    add(x + r() * 0.6, -15 + r() * 1.8, 0);
    if (x < 0 || x > 7) add(x + r() * 0.6, 15 - r() * 1.8, Math.PI);
  }
  for (let z = -9; z <= 9; z += 2.8) {
    add(-18 + r() * 1.5, z + r() * 0.5, Math.PI / 2);
    if (z < -1 || z > 5) add(18 - r() * 1.5, z + r() * 0.5, -Math.PI / 2);
  }
  for (let x = -12; x <= 12; x += 2.8) if (x < -3 || x > 4) add(x + r() * 0.5, (r() < 0.5 ? -1 : 1) * 1.25, 0);
}

export default {
  title: 'John 5:2-9: The pool of Bethesda',
  seed: 14,
  fov: 64,
  exposure: 1.05,

  sun: { direction: [0.55, 0.75, 0.35], color: '#fff0d2', intensity: 2.8 },
  light: { sky: '#c8d0dc', ground: '#b08a60', hemi: 1.2 },
  sky: { top: '#4f7fc0', horizon: '#e6dcc6', ground: '#c8b08c', sunColor: '#fff4d8', glow: 1 },
  fog: { color: '#e2d6bc', near: 80, far: 520 },
  clouds: { count: 30, shadow: '#b8b4b0', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [120, 260], hole: 0.3 },
  mountains: { count: 36, color: '#9a8a70', radius: [520, 740], height: [30, 80], haze: 0.6 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.38, shadowTint: '#3a3060', highlightTint: '#fff0d0' },
  shadow: { center: [0, 0], radius: 40 },

  player: { start: [3.6, 16.4], yaw: 0.2, pitch: -0.06, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 1100,
    segments: 160,
    seed: 14,
    hills: 40,
    bumps: 0.2,
    flats: [{ x: 0, z: 30, r: 70, falloff: 50, height: 0 }],
    colors: { ground: '#bba27c', groundAlt: '#a99070', grass: '#8f8a5a', high: '#a89676', rock: '#8e7c66' },
    patches: [{ x: 0, z: 0, r: 26, color: '#c4b08c', strength: 0.9 }],
  },

  scatter: [
    { type: 'tree', count: 26, center: [0, 0], ring: [34, 90], spacing: 6, seed: 3, avoid: [{ rect: [0, 30, 6, 30] }], props: { kind: 'broad', leaf: '#768456', h: 5 } },
    { type: 'tree', count: 8, center: [0, 0], ring: [30, 70], spacing: 8, seed: 4, avoid: [{ rect: [0, 30, 6, 30] }], props: { kind: 'palm', leaf: '#6b8044', h: 9 } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#6b6f4a', '#d8cdb5'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.45,
    },
    groups: [
      { count: sickPoints.length, points: sickPoints, face: [0, 0], kneel: 1, children: 0.08, onStructures: true, seed: 3 },
      {
        count: 40, center: [0, 34], ring: [8, 30], arc: [0.2, Math.PI - 0.2], spacing: 1.6, face: [0, 22], seed: 5,
        avoid: [{ rect: [0, 32, 6, 12] }],
      },
    ],
  },

  custom(ctx) {
    const { THREE, solid } = ctx;
    const slab = (x0, x1, z0, z1, top = FY, bottom = -0.5, color = stone) => {
      const w = x1 - x0, d = z1 - z0;
      solid.box(w, top - bottom, d, { position: [(x0 + x1) / 2, (top + bottom) / 2, (z0 + z1) / 2], color, jitter: 0.03, shade });
      ctx.colliders.add({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w, d, bottom, top });
    };
    const tiles = (x0, x1, z0, z1) => {
      for (let x = x0 + 1; x < x1; x += 2) for (let z = z0 + 1; z < z1; z += 2) solid.box(1.9, 0.06, 1.9, { position: [x, FY + 0.02, z], color: pale, jitter: 0.06 });
    };

    // Porch floors around and between the two pools.
    slab(-W, W, -D, -PZ); slab(-W, W, PZ, D); slab(-W, -PX, -PZ, PZ); slab(PX, W, -PZ, PZ); slab(-PX, PX, -MID, MID);
    tiles(-W, W, -D, -PZ); tiles(-W, W, PZ, D); tiles(-W, -PX, -PZ, PZ); tiles(PX, W, -PZ, PZ); tiles(-PX, PX, -MID, MID);
    for (const [z0, z1] of [[-PZ, -MID], [MID, PZ]]) {
      solid.box(PX * 2, 0.2, z1 - z0, { position: [0, 0.05, (z0 + z1) / 2], color: '#7d8a74', jitter: 0.05 });
      for (let i = 0; i < 6; i++) slab(-PX, -PX + 0.7 * (6 - i), z0 + 3.2, z1 - 3.2, FY - 0.25 * (i + 1), -0.5, '#cbb894');
      createWater(ctx, { center: [0, (z0 + z1) / 2], size: [PX * 2, z1 - z0], level: 0.95, color: '#3a6c72', foam: '#cfe6e2', amp: 0.06, minAmp: 0.06, speed: 0.5 });
    }

    // Outer walls with a gate on the south side.
    const WH = ROOF + 1.4;
    const wall = (x, z, w, d) => {
      solid.box(w, WH, d, { position: [x, WH / 2 - 0.3, z], color: stone, jitter: 0.03, shade });
      ctx.colliders.add({ x, z, w, d, bottom: -1, top: WH });
    };
    wall(0, -D - 0.5, W * 2 + 2, 1);
    wall(-W - 0.5, 0, 1, D * 2);
    wall(W + 0.5, 0, 1, D * 2);
    wall(-(W + 2.5) / 2 - 0.5, D + 0.5, W - 1.5, 1);
    wall((W + 2.5) / 2 + 0.5, D + 0.5, W - 1.5, 1);
    solid.box(5, 1.4, 1, { position: [0, WH - 0.4, D + 0.5], color: stone, shade });
    for (let i = 0; i < 5; i++) slab(-2, 2, D + 0.2 * i, D + 1 + 0.6 * i + 1, FY - 0.3 * i, -0.5, '#cbb894');

    // Colonnades and flat roofs.
    const column = (x, z) => {
      ctx.solid.add(new THREE.CylinderGeometry(0.32, 0.36, ROOF - FY - 0.6, 8), { position: [x, FY + (ROOF - FY) / 2, z], color: pale, jitter: 0.03 });
      ctx.solid.box(0.95, 0.3, 0.95, { position: [x, FY + 0.15, z], color: '#c4b08a', shade });
      ctx.solid.box(1.0, 0.35, 1.0, { position: [x, ROOF - 0.2, z], color: '#c4b08a', shade });
      ctx.colliders.add({ x, z, w: 0.75, d: 0.75, bottom: FY, top: ROOF });
    };
    for (let x = -W + 2; x <= W - 2; x += 3.6) {
      column(x, -PZ - 0.5);
      column(x, PZ + 0.5);
    }
    for (let z = -PZ + 2.2; z <= PZ - 2.2; z += 3.6) {
      if (Math.abs(z) < MID + 0.5) continue;
      column(-PX - 0.5, z);
      column(PX + 0.5, z);
    }
    for (let x = -PX + 1.5; x <= PX - 1.5; x += 3.7) column(x, 0);
    const roof = (x0, x1, z0, z1) => {
      ctx.solid.box(x1 - x0, 0.45, z1 - z0, { position: [(x0 + x1) / 2, ROOF + 0.2, (z0 + z1) / 2], color: '#b9a37e', jitter: 0.03, shade });
      ctx.solid.box(x1 - x0 + 0.3, 0.25, z1 - z0 + 0.3, { position: [(x0 + x1) / 2, ROOF + 0.5, (z0 + z1) / 2], color: '#9c7e5c', jitter: 0.04, shade });
    };
    roof(-W, W, -D, -PZ - 0.1); roof(-W, W, PZ + 0.1, D); roof(-W, -PX - 0.1, -PZ, PZ); roof(PX + 0.1, W, -PZ, PZ); roof(-PX, PX, -MID + 0.1, MID - 0.1);
    for (let x = -W + 1; x < W; x += 1.8) {
      ctx.solid.box(0.18, 0.22, D - PZ, { position: [x, ROOF - 0.1, -(D + PZ) / 2], color: '#6d5236' });
      ctx.solid.box(0.18, 0.22, D - PZ, { position: [x, ROOF - 0.1, (D + PZ) / 2], color: '#6d5236' });
    }

    // The sick lying on mats.
    const robes = ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#c4b090', '#94704e', '#d8cdb5'];
    lying.forEach(([x, z, yaw], i) => {
      ctx.solid.box(0.9, 0.05, 2.0, { position: [x, FY + 0.08, z], rotation: [0, yaw, 0], color: i % 2 ? '#a8865a' : '#8d7350', jitter: 0.06 });
      person(ctx, { x: x + Math.sin(yaw) * 0.8, z: z + Math.cos(yaw) * 0.8, y: FY, yaw: yaw + Math.PI, pose: 'supine', robe: robes[i % robes.length], skin: '#9b6a46', collide: false, hood: i % 3 === 0, mantle: i % 2 ? '#5a3d2b' : undefined });
    });
    for (const [x, z] of sickPoints) ctx.solid.box(1.0, 0.05, 1.6, { position: [x, FY + 0.08, z], rotation: [0, x * 0.3, 0], color: '#9c7c52', jitter: 0.08 });

    // The impotent man rising from his bed, and Christ bidding him walk.
    const man = [-0.9, 1.3];
    ctx.solid.box(0.9, 0.06, 2.0, { position: [man[0] - 0.4, FY + 0.08, man[1]], rotation: [0, 1.3, 0], color: '#b08c5c', jitter: 0.05 });
    person(ctx, { x: man[0], z: man[1], y: FY, face: [2.2, 0.2], pose: 'kneel', robe: '#8a7458', mantle: '#5e4a36', skin: '#9b6a46', arms: 'out', scale: 1.02 });
    person(ctx, {
      x: 1.0, z: 1.1, y: FY, face: man, robe: '#fbf7ee', mantle: '#f0e8d6', skin: '#a8754f', arms: 'out', emissive: 0.32, scale: 1.08,
      light: { color: '#fff0cf', intensity: 18, distance: 14 },
      halo: { size: 3.6, opacity: 0.4, color: '#fff3d6' },
    });
    for (const [x, z, face] of [[3.6, 0.9, [1, 1.1]], [4.6, -1.0, [1, 1.1]], [-3.2, -1.0, [-0.9, 1.3]]]) {
      person(ctx, { x, z, y: FY, face, robe: '#7a5d42', mantle: '#4f3f30', skin: '#8a5a3c', hood: true });
    }

    // Jerusalem rooftops and the temple beyond the south gate.
    const r = ctx.rand;
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = r.range(34, 130);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.abs(x) < 6 && z > 15 && z < 70) continue;
      house(ctx, { x, z, rot: r.range(-0.2, 0.2) + (r() < 0.5 ? 0 : Math.PI / 2), w: r.range(6, 11), d: r.range(5, 9), h: r.range(3.5, 7), color: r.pick(['#d6c29c', '#cdb892', '#e0cfaa', '#c2ab84']) });
    }
    const T = [10, 180];
    solid.box(140, 14, 90, { position: [T[0], 7, T[1]], color: '#cdb892', jitter: 0.03, shade });
    solid.box(30, 26, 40, { position: [T[0], 14 + 13, T[1] - 5], color: '#efe4cc', jitter: 0.02, shade });
    solid.box(36, 30, 8, { position: [T[0], 14 + 15, T[1] - 26], color: '#f4ecd8', jitter: 0.02, shade });
    solid.box(18, 30, 18, { position: [-40, 15, 120], color: '#cbb48c', jitter: 0.03, shade });
  },
};
