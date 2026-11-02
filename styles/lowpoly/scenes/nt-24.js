// John 20:1-18. A garden at dawn. The stone is rolled away from a tomb cut in the rock; two angels
// in white sit inside. Mary Magdalene weeps at the door, and the risen Jesus stands behind her.
import * as THREE from 'three';
import { oliveTree, palm, person, christ, box, glowAt } from './lib/nt-19-kit.js';

const DOOR = [0, -20];
const MARY = [-1.1, -16.2];
const JESUS = [5.2, -12.4];
const START = [0.8, -6];
const rockColor = '#b2a48c';

export default {
  title: 'John 20:1-18: The empty tomb',
  seed: 24,
  fov: 54,
  exposure: 1.05,

  sun: { direction: [0.7, 0.24, 0.65], color: '#ffc49a', intensity: 2.8 },
  light: { sky: '#9aa8d8', ground: '#6a5a48', hemi: 1.15 },
  sky: { top: '#5a72b0', horizon: '#ffb890', ground: '#b49c84', sunColor: '#ffd8a8', glow: 1.3 },
  fog: { color: '#e8c0a8', near: 50, far: 420 },
  clouds: { count: 40, shadow: '#7a6a84', lit: '#ffc8a0', rim: '#fff0d8', distance: [260, 900], altitude: [90, 200], hole: 0.3 },
  mountains: { count: 36, color: '#7a6a78', radius: [420, 700], height: [40, 110], haze: 0.5 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.82 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.4, shadowTint: '#3a3060', highlightTint: '#ffe4c4' },
  shadow: { center: [0, -12], radius: 32 },

  player: { start: START, yaw: -0.16, pitch: 0.03, eye: 1.65, speed: 3.8 },

  terrain: {
    size: 900,
    segments: 160,
    seed: 24,
    hills: 24,
    bumps: 0.25,
    flats: [{ x: 0, z: -8, r: 34, falloff: 30, height: 0 }],
    colors: { ground: '#7f8a4a', groundAlt: '#6e7c40', grass: '#6a7a3c', high: '#8a8458', rock: '#8a7c64' },
    patches: [{ x: 1.5, z: -6, r: 5, color: '#a8946c', strength: 0.5, rough: 0.6 }],
  },

  scatter: [
    { type: 'tree', count: 30, center: [0, -8], ring: [40, 160], spacing: 10, seed: 3, props: { kind: 'broad', leaf: '#5f7a3a' } },
    { type: 'rock', count: 18, center: [0, -8], ring: [25, 120], spacing: 10, seed: 4, props: { color: '#a3957c' } },
  ],

  custom(ctx) {
    const r = ctx.rand;
    const T = THREE;

    // The rock face with a hewn chamber behind the doorway.
    const y0 = ctx.heightAt(...DOOR) - 0.4;
    const rock = (x, z, w, h, d, y = y0) => box(ctx, { x, z, y, w, h, d, color: rockColor, jitter: 0.06 });
    rock(-10.4, -24, 15.2, 7, 8);
    rock(10.4, -24, 15.2, 7, 8);
    rock(0, -26.8, 5.6, 7, 2.4);
    rock(0, -23.4, 5.6, 4.4, 4.4, y0 + 3);
    rock(-1.85, -20.6, 1.9, 7, 1.2);
    rock(1.85, -20.6, 1.9, 7, 1.2);
    rock(0, -20.6, 1.8, 4.4, 1.2, y0 + 2.6);
    for (let i = 0; i < 60; i++) {
      const x = r.range(-18, 18), z = r.range(-28, -20);
      const top = Math.abs(x) < 3 ? y0 + 7.4 : y0 + 7;
      ctx.solid.add(new T.DodecahedronGeometry(r.range(1.2, 2.6), 0), { position: [x, top - r.range(0, 1), z], rotation: [r() * 3, r() * 3, 0], scale: [1.3, 0.7, 1], color: r.pick([rockColor, '#a69680', '#bcae94']), jitter: 0.06 });
    }
    for (let i = 0; i < 26; i++) {
      const side = r.sign();
      const x = side * r.range(3.4, 18), z = r.range(-20.4, -19.4);
      ctx.solid.add(new T.DodecahedronGeometry(r.range(0.8, 1.8), 0), { position: [x, y0 + r.range(0.5, 6), z], rotation: [r() * 3, r() * 3, 0], scale: [1.2, 1, 0.6], color: r.pick([rockColor, '#a69680']), jitter: 0.06 });
    }
    for (let i = 0; i < 30; i++) {
      const x = r.range(-17, 17), z = r.range(-27, -21);
      ctx.solid.add(new T.IcosahedronGeometry(r.range(0.6, 1.2), 0), { position: [x, y0 + 7.4 + r.range(0, 0.6), z], scale: [1, 0.6, 1], color: r.pick(['#6a7a3c', '#5f7a3a', '#7a8a46']), jitter: 0.1 });
    }
    // Chamber floor, burial shelf and the folded linen.
    box(ctx, { x: 0, z: -23.2, y: y0, w: 5.6, h: 0.45, d: 4.4, color: '#9a8c74' });
    box(ctx, { x: 0, z: -24.9, y: y0 + 0.45, w: 4.6, h: 0.6, d: 1, color: '#a69680' });
    ctx.solid.box(0.6, 0.12, 0.6, { position: [-0.15, y0 + 1.11, -24.9], color: '#f4efe4', jitter: 0.02 });
    ctx.solid.box(0.3, 0.14, 0.3, { position: [0.35, y0 + 1.12, -24.9], rotation: [0, 0.3, 0], color: '#f0eadc', jitter: 0.02 });
    const lin = new T.PointLight('#f4f2ff', 2.2, 7, 1.4);
    lin.position.set(0, y0 + 2, -22.6);
    ctx.scene.add(lin);
    for (const [x, face] of [[-0.85, [0.4, -20]], [0.85, [-0.4, -20]]]) {
      person(ctx, { x, z: -24.5, y: y0 + 1.15, pose: 'sit', face, robe: '#fbfaf4', mantle: null, skin: '#f4efe4', hood: false, emissive: 0.18, scale: 1 });
    }
    glowAt(ctx, [0, y0 + 1.6, -20.2], 2.4, '#f4f0ff', 0.1);

    // The great round stone, rolled aside in its groove.
    const sx = 3.0, sz = -19.3;
    ctx.solid.add(new T.CylinderGeometry(1.45, 1.45, 0.55, 12), { position: [sx, y0 + 1.85, sz], rotation: [Math.PI / 2, 0, 0], color: '#c8b89a', jitter: 0.05 });
    ctx.colliders.add({ x: sx, z: sz, w: 2.9, d: 0.6, bottom: y0, top: y0 + 3.3 });
    ctx.solid.box(8, 0.12, 0.7, { position: [0.8, y0 + 0.4, -19.3], color: '#8a7c64', jitter: 0.04 });

    // Mary at the door, head bowed; Jesus behind her in the garden.
    const mary = person(ctx, { x: MARY[0], z: MARY[1], face: DOOR, robe: '#5a6a8a', mantle: '#3f4d6e', hood: true, skin: '#a87652' });
    mary.rotation.set(0.22, mary.rotation.y, 0, 'YXZ');
    christ(ctx, { x: JESUS[0], z: JESUS[1], face: MARY, light: 14, halo: 3.4, glow: 0.35 });
    ctx.effects.motes({ position: [JESUS[0], ctx.heightAt(...JESUS), JESUS[1]], radius: 1.4, height: 5, count: 30 });

    // The garden: path, flowers, shrubs, olives and palms.
    for (let t = 0; t <= 1; t += 0.04) {
      const x = 3.2 - t * 3 + Math.sin(t * 5) * 0.8, z = 6 - t * 25;
      ctx.solid.add(new T.CylinderGeometry(r.range(0.35, 0.55), r.range(0.35, 0.55), 0.12, 6), { position: [x + r.range(-0.3, 0.3), ctx.heightAt(x, z) + 0.02, z], rotation: [0, r() * 3, 0], color: '#c2b294', jitter: 0.06 });
    }
    const petals = ['#f4e6f0', '#e86a8a', '#f2c84a', '#ffffff', '#c48ad8', '#ff9a6a'];
    for (let i = 0; i < 260; i++) {
      const a = r() * Math.PI * 2, d = r.range(2, 26);
      const x = Math.cos(a) * d + 1, z = Math.sin(a) * d - 8;
      if (z < -19.5 || Math.hypot(x - START[0], z - START[1]) < 1.5) continue;
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new T.ConeGeometry(0.09, 0.22, 4), { position: [x, y + 0.08, z], color: '#4a6a2a' });
      ctx.solid.add(new T.OctahedronGeometry(0.08, 0), { position: [x, y + 0.22, z], scale: [1, 0.6, 1], color: r.pick(petals), jitter: 0.05 });
    }
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2, d = r.range(7, 30);
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 8;
      if (z < -19 || Math.abs(x - 1.5) < 2.5 && z > -18) continue;
      ctx.solid.add(new T.IcosahedronGeometry(r.range(0.5, 0.9), 0), { position: [x, ctx.heightAt(x, z) + 0.3, z], scale: [1, 0.7, 1], color: r.pick(['#5f7a3a', '#6b8340', '#55702f']), jitter: 0.1 });
    }
    for (const [x, z, s] of [[-9, -12, 1.2], [-13, -4, 1.3], [11, -8, 1.1], [14, -15, 1.2], [-6, 2, 1], [12, 3, 1.3], [-16, -15, 1.1]]) oliveTree(ctx, { x, z, s });
    for (const [x, z] of [[-4.5, -17], [8.5, -17.5], [-18, 0], [19, -4]]) palm(ctx, { x, z, h: r.range(7, 10) });
  },
};
