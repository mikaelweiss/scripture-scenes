// Genesis 1: the first light over the gathered waters. Bare new rock on the left, grass, trees,
// creatures and birds spreading on the right. -z is toward the sea and the rising light.
import { water, blockWater, stars, skyDisc, birds } from './lib/ot-01-kit.js';
import { animal } from './lib/ot-01-animals.js';

const SEA = -1.2;

export default {
  title: 'Genesis 1: The Creation',
  seed: 101,
  fov: 62,
  exposure: 1.25,

  sun: { direction: [-0.5, 0.3, -0.8], color: '#ffd7a0', intensity: 3.8 },
  light: { sky: '#7f8fd0', ground: '#6a6448', hemi: 1.5 },
  sky: { top: '#141a46', horizon: '#ffc685', ground: '#3d4a5a', sunColor: '#fff0c8', glow: 1.2 },
  fog: { color: '#c79a86', near: 90, far: 700 },
  clouds: { count: 50, seed: 11, shadow: '#3a3660', lit: '#ffb878', rim: '#fff3d0', distance: [300, 900], altitude: [70, 200], hole: 0.25 },
  mountains: { count: 40, seed: 9, color: '#4a4a5c', radius: [560, 780], height: [60, 170], haze: 0.45 },
  bloom: { strength: 0.75, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.15, contrast: 1.06, vignette: 0.45, shadowTint: '#2a2260', highlightTint: '#ffe6bb' },
  shadow: { center: [10, 0], radius: 90 },

  player: { start: [-10, 34], yaw: -0.22, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1300,
    segments: 220,
    seed: 31,
    hills: 22,
    bumps: 0.5,
    flats: [
      { x: 0, z: -330, r: 290, falloff: 70, height: -9 },
      { x: -260, z: -40, r: 90, falloff: 60, height: -6 },
      { x: 10, z: 40, r: 30, falloff: 40, height: 0.6 },
    ],
    colors: { ground: '#5f8236', groundAlt: '#6d8f3c', grass: '#7aa045', high: '#7f8a58', rock: '#6a6056' },
    patches: [
      { x: -70, z: 10, r: 70, color: '#5a5048', strength: 0.95, rough: 0.5 },
      { x: -40, z: -30, r: 40, color: '#4c443f', strength: 0.9, rough: 0.4 },
      { x: 30, z: -35, r: 26, color: '#c9b48a', strength: 0.8, rough: 0.5 },
      { x: -5, z: -32, r: 24, color: '#bba57c', strength: 0.75, rough: 0.5 },
      { x: 60, z: -20, r: 30, color: '#c2ad84', strength: 0.6, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'rubble', x: -38, z: 12, radius: 16, count: 30, size: [0.4, 1.4], color: '#4f4741' },
    { type: 'rubble', x: -20, z: -18, radius: 10, count: 16, size: [0.3, 1.0], color: '#58504a' },
    { type: 'rock', x: -26, z: 4, size: 4.5, color: '#4c4440' },
    { type: 'rock', x: -52, z: -10, size: 6, color: '#4a423e' },
    { type: 'rock', x: -14, z: -24, size: 3, color: '#55504a' },
  ],

  scatter: [
    { type: 'rock', count: 26, center: [-80, 10], ring: [10, 90], spacing: 8, seed: 3, props: { color: '#4f4842' } },
    { type: 'tree', count: 40, center: [70, 30], ring: [14, 110], spacing: 7, seed: 4, props: { kind: 'broad', leaf: '#4f8a34' }, avoid: [{ r: 22, x: 28, z: 14 }] },
    { type: 'tree', count: 14, center: [40, -10], ring: [6, 40], spacing: 7, seed: 5, props: { kind: 'palm', leaf: '#5c8f38' }, avoid: [{ r: 18, x: 28, z: 14 }] },
    { type: 'tree', count: 50, center: [40, 160], ring: [30, 220], spacing: 9, seed: 6, props: { leaf: '#4b7d30' } },
  ],

  effects: [
    { type: 'sunShafts', center: [0, -180], count: 9, spread: 120, length: 600, width: [12, 30], opacity: 0.09, color: '#ffe2ae' },
    { type: 'motes', at: [24, 6], radius: 30, height: 30, count: 260, color: '#fff2c8', size: 0.07 },
  ],

  custom(ctx) {
    const { THREE, solid } = ctx;
    water(ctx, { level: SEA, color: '#2f6d8a', amp: 0.22, specular: '#ffe4b8', shininess: 40 });
    blockWater(ctx, { level: SEA, center: [0, 0], radius: 160, cell: 3 });
    stars(ctx, { count: 1100, minY: 0.22, size: 2, opacity: 0.85 });
    skyDisc(ctx, { dir: [-0.5, 0.3, -0.8], radius: 26, color: '#fff3d2', glow: 3.5, glowColor: '#ffb870' });
    skyDisc(ctx, { dir: [0.55, 0.42, -0.6], radius: 16, color: '#eef0ff', glow: 3, glowColor: '#b8c4ff', crescent: '#1e2552' });

    // Islands of new land breaking the surface of the sea.
    const r = ctx.rand;
    for (const [ix, iz, s] of [[-120, -170, 18], [90, -230, 26], [-30, -300, 14], [180, -150, 12], [-200, -260, 30]]) {
      for (let i = 0; i < 4; i++) {
        solid.add(new THREE.DodecahedronGeometry(1, 0), {
          position: [ix + r.range(-s, s) * 0.5, SEA - s * 0.3, iz + r.range(-s, s) * 0.4],
          rotation: [r() * 3, r() * 3, r() * 3],
          scale: [s * r.range(0.7, 1.2), s * r.range(0.4, 0.7), s * r.range(0.6, 1)],
          color: i % 2 ? '#5b5450' : '#4f6b3a',
        });
      }
    }

    // Great whales of the sea (verse 21).
    for (const [wx, wz, yaw] of [[-30, -95, 0.8], [40, -140, -0.5]]) {
      const c = Math.cos(yaw), s = Math.sin(yaw);
      const at = (lx, lz) => [wx + lx * c + lz * s, wz - lx * s + lz * c];
      const [bx, bz] = at(0, 0);
      solid.add(new THREE.IcosahedronGeometry(1, 0), { position: [bx, SEA - 0.4, bz], rotation: [0, yaw, 0], scale: [2.6, 1.4, 7], color: '#3a4652' });
      const [tx, tz] = at(0, -9);
      solid.add(new THREE.ConeGeometry(1, 1, 3), { position: [tx, SEA + 1.6, tz], rotation: [0.2, yaw, Math.PI / 2], scale: [1.4, 5, 0.3], color: '#34404c' });
    }

    // Creatures on the green side (verses 24-25).
    const herd = [
      ['lion', 2, 12, 2.6], ['lion', 5, 14, 2.2, true], ['sheep', -3, 20, 3.0], ['sheep', -1, 22, 2.6], ['sheep', -5, 23, 3.3], ['sheep', 0, 18, 2.0],
      ['deer', 14, 4, 2.0], ['deer', 17, 7, 2.4, true], ['horse', 22, 20, 2.8], ['horse', 26, 22, 2.6, true],
      ['elephant', 30, -6, 2.4], ['elephant', 36, -2, 2.2, true], ['giraffe', 46, 8, 2.8], ['giraffe', 50, 4, 2.5, true],
      ['rabbit', -6, 27, 1], ['rabbit', -5, 28, 0.4], ['ox', 28, 30, 3.2], ['ox', 32, 33, 3.0, true],
    ];
    for (const [kind, x, z, yaw, female] of herd) animal(ctx, { kind, x, z, yaw, female });
    for (let i = 0; i < 10; i++) animal(ctx, { kind: 'dove', x: 8 + r.range(-5, 5), z: 22 + r.range(-4, 4), yaw: r() * 6 });

    birds(ctx, { center: [10, -40], radius: 45, height: 22, count: 26, color: '#f3efe6', speed: 7, spread: 14 });
    birds(ctx, { center: [70, 20], radius: 30, height: 30, count: 14, color: '#3a302c', speed: 5, seed: 9 });

    // Flowers and grass tufts spreading over the green land.
    for (let i = 0; i < 600; i++) {
      const x = r.range(-15, 110), z = r.range(-20, 70);
      if (x < -8 + (z + 20) * 0.05 || ctx.heightAt(x, z) < SEA + 0.3) continue;
      const y = ctx.heightAt(x, z);
      if (r() < 0.35) solid.add(new THREE.OctahedronGeometry(0.14, 0), { position: [x, y + 0.2, z], color: r.pick(['#f4e46a', '#f2f0ea', '#e26a7a', '#b88ae8', '#f49a4a']), jitter: 0.1 });
      else solid.add(new THREE.ConeGeometry(0.18, 0.55, 3), { position: [x, y + 0.2, z], rotation: [0, r() * 3, 0], color: '#6f9c3e', jitter: 0.12 });
    }
  },
};
