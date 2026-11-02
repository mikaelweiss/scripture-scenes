// John 2:13-16. The Court of the Gentiles in Jerusalem. Jesus drives out the moneychangers and the sellers of
// oxen, sheep and doves. Tables lie overturned, coins scatter, animals bolt, doves fly up. -z is north to the sanctuary.
import * as K from './lib/nt-07-kit.js';

const CHRIST = [0, 2];
const SANCTUARY = [0, -62];
const marble = '#e6dcc6';
const gold = '#d9b250';

const porticoColumns = [-1, 1].flatMap((side) =>
  [0, 1].flatMap((row) =>
    Array.from({ length: 13 }, (_, i) => ({ type: 'column', x: side * (34 + row * 5), z: -44 + i * 7, h: 9, radius: 0.55, color: marble, broken: false })),
  ),
);

export default {
  title: 'John 2:13-16: Cleansing the temple',
  seed: 8,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.45, 0.75, 0.35], color: '#fff0d8', intensity: 2.8 },
  light: { sky: '#a8c0e8', ground: '#8a7458', hemi: 1.1 },
  sky: { top: '#3f6aa8', horizon: '#d8e2e8', ground: '#c9b89a', sunColor: '#fff4d8', glow: 0.8 },
  fog: { color: '#d6d8d2', near: 90, far: 520 },
  clouds: { count: 30, shadow: '#a8b0c0', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [140, 280], hole: 0.2 },
  mountains: { count: 40, color: '#8a7e68', radius: [440, 700], height: [30, 90], haze: 0.6 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.38, shadowTint: '#2c3050', highlightTint: '#fff0d0' },
  shadow: { center: [0, -10], radius: 60 },

  player: { start: [1.4, 8.6], yaw: 0.12, pitch: 0.04, eye: 1.65, speed: 4 },

  terrain: {
    size: 1000, segments: 160, seed: 31, hills: 40, bumps: 0.2,
    flats: [{ x: 0, z: -15, r: 75, falloff: 40, height: 0 }],
    colors: { ground: '#a89070', groundAlt: '#988060', grass: '#8a8a52', high: '#9a8a6a', rock: '#857460' },
  },

  objects: [
    { type: 'pavement', x: 0, z: -10, w: 66, d: 96, tile: 2.4, color: '#d8ccb2', damage: 0 },
    ...porticoColumns,
    { type: 'steppedPyramid', x: SANCTUARY[0], z: SANCTUARY[1] + 2, w: 52, d: 34, tiers: 3, tierHeight: 1.4, inset: 1.6, stairWidth: 24, color: marble, trim: '#cfc2a6', stairColor: '#e2d8c2' },
  ],

  crowd: {
    palette: K.palette,
    groups: [
      { count: 45, center: CHRIST, ring: [6, 14], arc: [-Math.PI, Math.PI], spacing: 1.2, face: CHRIST, children: 0.1, seed: 41, avoid: [{ rect: [2.5, 9, 9, 14] }] },
      { count: 160, center: [0, -20], ring: [16, 34], spacing: 1.3, face: CHRIST, children: 0.15, seed: 42, avoid: [{ rect: [0, -50, 60, 20] }, { rect: [1, 6, 13, 18] }] },
    ],
  },

  figures: [
    K.christ(CHRIST[0], CHRIST[1], [-4, -2], { arms: 'out' }),
    { x: -4.5, z: -1.5, face: [0, 6], robe: '#6d3b2e', mantle: '#c9a050', skin: '#9b6a46', arms: 'out' },
    { x: 4.8, z: -2.5, face: [8, -8], robe: '#3f4d5e', mantle: '#8a7a5a', skin: '#a87652' },
    { x: -2, z: 6.5, face: [-6, 12], robe: '#7a4e36', skin: '#8a5a3c', arms: 'out' },
  ],

  effects: [
    { type: 'sunShafts', center: [0, -40], count: 5, spread: 50, length: 300, width: [8, 16], opacity: 0.05, color: '#fff3d0' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;

    for (const side of [-1, 1]) {
      K.block(ctx, { x: side * 36.5, z: -2, y: 8.9, w: 7.4, h: 0.8, d: 92, color: '#d2c6ac', collide: false });
      K.block(ctx, { x: side * 36.5, z: -2, y: 9.7, w: 6.6, h: 1.2, d: 91, color: '#9a7a52', collide: false });
      K.block(ctx, { x: side * 41.5, z: -2, y: 0, w: 1.4, h: 11, d: 94, color: '#cfc2a6' });
    }
    K.block(ctx, { x: 0, z: 46, y: 0, w: 86, h: 9, d: 1.6, color: '#cfc2a6' });
    for (let i = 0; i < 20; i++) K.block(ctx, { x: -40 + i * 4.2, z: 46, y: 9, w: 1.6, h: 1, d: 1.8, color: '#cfc2a6', collide: false });
    K.block(ctx, { x: 0, z: 45.2, y: 0, w: 5, h: 6, d: 0.2, color: '#3a2e24', collide: false });

    const S = SANCTUARY, y0 = 4.0;
    K.block(ctx, { x: S[0], z: S[1] - 6, y: y0, w: 34, h: 18, d: 22, color: marble });
    K.block(ctx, { x: S[0], z: S[1] - 4, y: y0, w: 20, h: 30, d: 18, color: '#efe8d8' });
    K.block(ctx, { x: S[0], z: S[1] + 5.05, y: y0, w: 6.5, h: 13, d: 0.3, color: '#2e2418', collide: false });
    K.block(ctx, { x: S[0], z: S[1] + 5.25, y: y0 + 13, w: 8.5, h: 0.9, d: 0.4, color: gold, collide: false });
    for (const sx of [-1, 1]) K.block(ctx, { x: S[0] + sx * 3.9, z: S[1] + 5.25, y: y0, w: 0.9, h: 13.9, d: 0.4, color: gold, collide: false });
    for (const [w, yy, d, z] of [[34.6, y0 + 18, 22.6, S[1] - 6], [20.6, y0 + 30, 18.6, S[1] - 4]]) {
      ctx.solid.box(w, 0.7, d, { position: [S[0], yy + 0.35, z], color: gold });
      for (let i = 0; i < Math.floor(w / 1.6); i++) {
        ctx.solid.add(new THREE.ConeGeometry(0.12, 1, 4), { position: [S[0] - w / 2 + 0.8 + i * 1.6, yy + 1.2, z + d / 2 - 0.2], color: gold });
      }
    }
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) K.block(ctx, { x: S[0] + sx * (4.8 + i * 1.9), z: S[1] + 5.3, y: y0, w: 0.7, h: 16, d: 0.7, color: '#f2ecde', collide: false });
    for (let i = -12; i <= 12; i++) {
      if (Math.abs(i) < 3) continue;
      K.block(ctx, { x: i * 2, z: -36, y: 0, w: 1.9, h: 1.2, d: 0.35, color: '#c9bca2' });
    }

    const tables = [
      { x: -3.5, z: -3.2, rot: 0.3, tilt: 1.3 }, { x: 3.2, z: -1.2, rot: -0.6, tilt: -1.4 }, { x: -1.5, z: 4.6, rot: 0.1, tilt: 1.2 },
      { x: -10, z: -6, rot: 0.2 }, { x: 10, z: -4, rot: -0.2 }, { x: -12, z: 4, rot: 1.4 }, { x: 11, z: 6, rot: 1.6 }, { x: 0, z: -12, rot: 0 },
    ];
    for (const t of tables) {
      K.table(ctx, { ...t, w: 2.2, d: 1, h: 0.85, color: '#7a5638' });
      if (!t.tilt) {
        for (let i = 0; i < 4; i++) ctx.glow.add(new THREE.CylinderGeometry(0.12, 0.13, 0.1 + r() * 0.15, 6), { position: [t.x + r.range(-0.8, 0.8), 0.95, t.z + r.range(-0.3, 0.3)], color: r.pick(['#d8a838', '#c8c8c0', '#b87a3a']) });
      }
    }
    for (let i = 0; i < 160; i++) {
      const a = r() * Math.PI * 2, d = 0.6 + r() * 5;
      const t = r.pick(tables.slice(0, 3));
      ctx.glow.add(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 6), { position: [t.x + Math.cos(a) * d, 0.12, t.z + Math.sin(a) * d], rotation: [r.range(-0.3, 0.3), 0, r.range(-0.3, 0.3)], color: r.pick(['#e8b840', '#c8c8c0', '#c8883a']) });
    }
    for (let i = 0; i < 3; i++) {
      const t = tables[i];
      ctx.solid.add(new THREE.CylinderGeometry(0.15, 0.2, 0.3, 6), { position: [t.x + 0.8, 0.12, t.z + 0.6], rotation: [Math.PI / 2, r() * 3, 0], color: '#6a4a30' });
    }

    const cage = (x, z, y = 0, rot = 0, tip = 0) => {
      ctx.solid.box(1.0, 0.6, 0.7, { position: [x, y + 0.3, z], rotation: [tip, rot, 0], color: '#b8945a', jitter: 0.08 });
      for (const k of [-0.3, 0, 0.3]) ctx.solid.box(0.05, 0.62, 0.74, { position: [x + Math.cos(rot) * k, y + 0.3, z - Math.sin(rot) * k], rotation: [tip, rot, 0], color: '#6a4a2a', jitter: 0.02 });
    };
    for (const [x, z, n, tip] of [[7, 2, 3, 0], [8.2, 3.2, 2, 0], [5.4, 4.6, 1, 0.9], [-8, 9, 3, 0], [-7.2, 10.2, 2, 0]]) {
      for (let k = 0; k < n; k++) cage(x, z, k * 0.6, 0.3, tip);
    }
    K.birds(ctx, { center: [6, 3], flee: 1.5, height: 26, radius: 10, count: 16, color: '#f4f2ea', size: 0.28 });
    K.birds(ctx, { center: [-7.5, 9.5], flee: 2, height: 22, radius: 8, count: 10, color: '#f4f2ea', size: 0.28, seed: 9 });

    for (let i = 0; i < 9; i++) {
      const a = 0.75 + r.range(-0.3, 0.3), d = 3 + i * 0.8;
      K.animal(ctx, { x: CHRIST[0] + Math.cos(a) * d, z: CHRIST[1] + Math.sin(a) * d * 0.7, rot: Math.atan2(Math.cos(a), Math.sin(a)) + r.range(-0.3, 0.3), kind: 'sheep', run: 1, lift: 0.1 });
    }
    for (let i = 0; i < 6; i++) K.animal(ctx, { x: -14 + i * 1.6 + r.range(-0.4, 0.4), z: -4 - i * 2 + r.range(-1, 1), rot: Math.PI * 0.75 + r.range(-0.3, 0.3), kind: 'sheep', run: 1 });
    K.animal(ctx, { x: 5.8, z: -1.5, rot: 2.2, kind: 'ox', run: 1 });
    K.animal(ctx, { x: 13, z: -9, rot: Math.PI * 0.85, kind: 'ox', run: 1 });
    K.animal(ctx, { x: 15.5, z: -11.5, rot: Math.PI * 0.8, kind: 'ox', run: 0.6 });
    K.animal(ctx, { x: -16, z: -14, rot: Math.PI * 1.1, kind: 'ox', run: 0.8 });
    for (let i = 0; i < 3; i++) {
      const x = 10 + i * 0.9, z = 10 + i * 0.3;
      K.block(ctx, { x, z, y: 0, w: 0.12, h: 1.1, d: 0.12, color: '#6a4a30' });
    }
    K.block(ctx, { x: 11, z: 10.3, y: 0.9, w: 2.4, h: 0.08, d: 0.12, rot: -0.3, color: '#6a4a30', collide: false });

    const cords = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const g = new THREE.CylinderGeometry(0.012, 0.012, 0.9, 3).translate(0, -0.45, 0);
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: '#8a6a40' }));
      m.rotation.set(-0.9 + i * 0.12, 0, 0.4 - i * 0.18);
      cords.add(m);
    }
    const hand = [CHRIST[0] + 0.6, 1.25, CHRIST[1] - 0.45];
    cords.position.set(...hand);
    ctx.scene.add(cords);
    ctx.onFrame((t) => (cords.rotation.x = Math.sin(t * 3) * 0.4 - 0.3));

    for (const [x, z] of [[-3, -1], [4, 0], [10, -6], [-9, 0], [-12, -8]]) ctx.effects.smoke({ position: [x, 0.2, z], count: 5, height: 2.2, size: 0.28, color: '#c8b28e', wind: [0.3, 0.1], seed: Math.floor(r() * 1e5) });
  },
};
