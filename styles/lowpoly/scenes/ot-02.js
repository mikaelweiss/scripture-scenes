// Genesis 2:8-15: the garden eastward in Eden. A river runs in from the north and parts into four heads.
// The tree of life stands at the center with Adam and Eve near it. -z is north.
import { water, blockWater, birds, glowSprite } from './lib/ot-01-kit.js';
import { animal } from './lib/ot-01-animals.js';

const TREE = [4, -34];
const WATER = -0.9;

function trace(points, step = 2.5) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) out.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  out.push(points[points.length - 1]);
  return out;
}

const POOL = [-12, -20];
const rivers = [
  [[-50, -260], [-40, -150], [-26, -80], [-16, -45], POOL],
  [POOL, [-60, -30], [-140, -12], [-260, -30]],
  [POOL, [-48, 20], [-96, 90], [-140, 220]],
  [POOL, [-20, 40], [-30, 110], [-30, 240]],
  [POOL, [-4, 20], [20, 90], [60, 220]],
];
const riverFlats = rivers.flatMap((path, i) => trace(path).map(([x, z], k) => ({ x, z, r: i === 0 ? 4.2 : 3 + Math.min(1.5, k * 0.04), falloff: 3.5, height: -2.4 })));

export default {
  title: 'Genesis 2:8-15: The Garden of Eden',
  seed: 202,
  fov: 62,
  exposure: 1.15,

  sun: { direction: [0.55, 0.62, 0.35], color: '#fff0d0', intensity: 3.0 },
  light: { sky: '#a8c8ff', ground: '#5d6e3a', hemi: 1.35 },
  sky: { top: '#4f86d4', horizon: '#ffe6c0', ground: '#a8b890', sunColor: '#fff6e0', glow: 1.0 },
  fog: { color: '#d8e2d0', near: 80, far: 520 },
  clouds: { count: 40, seed: 5, shadow: '#b8c4dc', lit: '#ffffff', rim: '#fffaf0', distance: [300, 900], altitude: [120, 240], hole: 0.2 },
  mountains: { count: 44, seed: 2, color: '#5a7a68', radius: [480, 700], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.82 },
  grade: { saturation: 1.18, contrast: 1.05, vignette: 0.35, shadowTint: '#203a40', highlightTint: '#fff2d0' },
  shadow: { center: [0, -15], radius: 80 },

  player: { start: [9, -3], yaw: 0.2, pitch: 0.12, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 760,
    segments: 260,
    seed: 17,
    hills: 26,
    bumps: 0.4,
    flats: [{ x: 0, z: -10, r: 110, falloff: 60, height: 0.4 }, { x: TREE[0], z: TREE[1], r: 9, falloff: 10, height: 1.2 }, ...riverFlats],
    colors: { ground: '#5f9a3c', groundAlt: '#6faa42', grass: '#7cb648', high: '#6e9450', rock: '#7a8460' },
    patches: [
      { x: TREE[0], z: TREE[1], r: 14, color: '#86bc52', strength: 0.8, rough: 0.3 },
      { x: POOL[0], z: POOL[1], r: 16, color: '#8f8a6a', strength: 0.5, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'tree', count: 60, center: [0, -10], ring: [26, 120], spacing: 8, seed: 3, props: { kind: 'broad', leaf: '#3f8a34' }, avoid: [{ r: 16, x: 13, z: -3 }, { r: 12, x: 4, z: -34 }, { r: 10, x: 7, z: -18 }] },
    { type: 'tree', count: 24, center: [0, -10], ring: [30, 110], spacing: 10, seed: 4, props: { kind: 'palm', leaf: '#4f9a3a' }, avoid: [{ r: 16, x: 13, z: -3 }, { r: 12, x: 4, z: -34 }] },
    { type: 'tree', count: 120, center: [0, 0], ring: [120, 330], spacing: 9, seed: 5, props: { leaf: '#3c7a30' } },
  ],

  figures: [
    { x: TREE[0] + 0.6, z: TREE[1] + 18, face: [TREE[0] + 4, TREE[1] + 19], robe: '#e2d2b0', mantle: '#a8865a', skin: '#b07a52', arms: 'down' },
    { x: TREE[0] + 3, z: TREE[1] + 19, face: [TREE[0], TREE[1] + 17], robe: '#f4ece0', mantle: '#c49a78', skin: '#c08a62', hood: true, scale: 0.95, arms: 'down' },
  ],

  effects: [
    { type: 'ring', at: TREE, lift: 0.08, radius: 7, width: 2.2, color: '#fff2c0', opacity: 0.45 },
    { type: 'motes', at: TREE, radius: 9, height: 18, count: 160, color: '#fff8dc', size: 0.06 },
    { type: 'sunShafts', center: [20, -60], count: 6, spread: 70, length: 400, width: [8, 20], opacity: 0.06, color: '#fff2d0' },
  ],

  custom(ctx) {
    const { THREE, solid, glow } = ctx;
    const r = ctx.rand;
    water(ctx, { level: WATER, size: 760, segments: 240, color: '#2c7a94', amp: 0.08, freq: 2.4, specular: '#ffffff', shininess: 90 });
    blockWater(ctx, { level: WATER, center: [-10, -10], radius: 160, cell: 1.5, depth: 0.5 });

    // The tree of life: a broad, pale-gold canopy with glowing white fruit.
    const ty = ctx.heightAt(...TREE) - 0.3;
    const [tx, tz] = TREE;
    solid.add(new THREE.CylinderGeometry(0.9, 1.6, 7, 7), { position: [tx, ty + 3.5, tz], color: '#7a5a3e' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      solid.add(new THREE.CylinderGeometry(0.25, 0.55, 6, 5), { position: [tx + Math.cos(a) * 2.2, ty + 8.5, tz + Math.sin(a) * 2.2], rotation: [Math.sin(a) * 0.75, 0, -Math.cos(a) * 0.75], color: '#7a5a3e' });
      solid.add(new THREE.CylinderGeometry(0.35, 0.6, 2.2, 5), { position: [tx + Math.cos(a) * 1.5, ty + 0.4, tz + Math.sin(a) * 1.5], rotation: [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2], color: '#6e5038' });
    }
    ctx.colliders.add({ x: tx, z: tz, w: 2.8, d: 2.8, bottom: ty, top: ty + 8 });
    const canopy = [];
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 6.5;
      const p = [tx + Math.cos(a) * d, ty + 11 + r.range(-1.5, 2.5) - d * 0.15, tz + Math.sin(a) * d];
      canopy.push(p);
      solid.add(new THREE.IcosahedronGeometry(r.range(2.6, 3.8), 0), { position: p, rotation: [r() * 3, r() * 3, 0], scale: [1, 0.75, 1], color: r.pick(['#8fbf4a', '#a6c95a', '#9ccc66']), jitter: 0.08 });
    }
    for (let i = 0; i < 70; i++) {
      const [px, py, pz] = r.pick(canopy);
      const a = r() * Math.PI * 2, e = r.range(-0.6, 0.4);
      glow.add(new THREE.IcosahedronGeometry(0.28, 0), { position: [px + Math.cos(a) * 3.4, py + e * 2.8, pz + Math.sin(a) * 3.4], color: '#fffbea', jitter: 0.02 });
    }
    glowSprite(ctx, { position: [tx, ty + 10, tz], size: 34, color: '#fff2c8', opacity: 0.35 });
    const pl = new THREE.PointLight('#fff0c8', 60, 30, 1.4);
    pl.position.set(tx, ty + 7, tz + 4);
    ctx.scene.add(pl);

    // Peaceful creatures: the lion lies near the lamb.
    const herd = [
      ['lion', 14, -15, -1.0], ['sheep', 12, -14, -2.1], ['sheep', 13.5, -12.5, 2.6],
      ['deer', -8, -40, 0.6], ['deer', -11, -43, 0.4, true],
      ['horse', 30, -40, -0.8], ['horse', 33, -36, -1.1, true],
      ['elephant', -36, -64, 0.9], ['elephant', -30, -70, 0.7, true],
      ['giraffe', 40, -80, -0.5], ['giraffe', 45, -76, -0.7, true],
      ['rabbit', 3, -11, 2.2], ['rabbit', 4.5, -10, 1.6], ['ox', 36, -6, 2.4], ['bear', 26, -58, -0.3],
    ];
    for (const [kind, x, z, yaw, female] of herd) animal(ctx, { kind, x, z, yaw, female });
    for (let i = 0; i < 8; i++) animal(ctx, { kind: 'dove', x: tx + r.range(-6, 6), z: tz + 9 + r.range(-2, 4), yaw: r() * 6 });
    birds(ctx, { center: [tx, tz], radius: 24, height: 26, count: 16, color: '#f6f2ea', speed: 6, spread: 8 });

    // Fruit on the nearer garden trees and a carpet of flowers.
    for (let i = 0; i < 2400; i++) {
      const x = r.range(-90, 90), z = r.range(-110, 50);
      const y = ctx.heightAt(x, z);
      if (y < WATER + 0.25 || Math.hypot(x - tx, z - tz) < 4) continue;
      if (r() < 0.55) solid.add(new THREE.OctahedronGeometry(r.range(0.07, 0.12), 0), { position: [x, y + 0.1, z], color: r.pick(['#f6e45a', '#ffffff', '#f07a8a', '#c58af0', '#ff9a4a', '#ff5a5a']), jitter: 0.08 });
      else solid.add(new THREE.ConeGeometry(0.16, 0.5, 3), { position: [x, y + 0.18, z], rotation: [0, r() * 3, 0], color: '#5fa03e', jitter: 0.14 });
    }
    // Low hedges of blossom along the paths.
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = r.range(14, 40);
      const x = tx + Math.cos(a) * d, z = tz + Math.sin(a) * d;
      const y = ctx.heightAt(x, z);
      if (y < WATER + 0.4 || Math.hypot(x - 13, z + 3) < 14 || Math.hypot(x - 7, z + 22) < 6) continue;
      solid.add(new THREE.IcosahedronGeometry(1, 0), { position: [x, y + 0.5, z], rotation: [r() * 3, r() * 3, 0], scale: [r.range(0.7, 1.2), 0.65, r.range(0.7, 1.2)], color: r.pick(['#4c9a3a', '#5aa846']) });
      for (let k = 0; k < 4; k++) glow.add(new THREE.OctahedronGeometry(0.15, 0), { position: [x + r.range(-1, 1), y + r.range(0.6, 1.2), z + r.range(-1, 1)], color: r.pick(['#ffd0e0', '#ffffff', '#ffe08a']) });
    }
  },
};
