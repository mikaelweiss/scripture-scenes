// Mark 2:1-12. Inside a packed house in Capernaum. Four friends have broken up the roof and lower a man sick of
// the palsy on his bed, in a shaft of daylight, down before Jesus. Scribes sit along the wall; the doorway is jammed.
import * as K from './lib/nt-07-kit.js';
import { placeCrowd } from '../engine/crowd.js';

const W = 9.6, D = 7.2, H = 3.2;
const HOLE = { x: 0.3, z: -0.5, w: 1.5, d: 2.4 };
const CHRIST = [1.9, -1.5];
const DOOR = [1.1, 1.3];
const plaster = '#b09a7c';

const GROUPS = [
  {
    count: 46, center: [0, 0], ring: [0.6, 6], spacing: 0.72, face: CHRIST, children: 0.12, seed: 91,
    avoid: [
      { rect: [HOLE.x + 0.6, HOLE.z - 0.3, 3.4, 3.6] }, { r: 1.9, x: -3.7, z: 2.5 }, ...Array.from({ length: 6 }, (_, i) => ({ r: 0.6, x: -3.0 + i * 0.85, z: 2.0 - i * 0.6 })), { rect: [-3.8, -2.6, 1.6, 2.4] },
      { rect: [10, 0, 10.2, 30] }, { rect: [-10, 0, 10.2, 30] }, { rect: [0, 8.6, 30, 10.4] }, { rect: [0, -8.6, 30, 10.4] },
    ],
  },
  { count: 26, center: [DOOR[0], D / 2 + 0.6], ring: [0, 4], arc: [0.1, Math.PI - 0.1], spacing: 0.7, face: [DOOR[0], 0], children: 0.2, seed: 92 },
];

export default {
  title: 'Mark 2:1-12: Lowered through the roof',
  seed: 12,
  fov: 66,
  exposure: 1.05,

  sun: { direction: [0.12, 0.95, 0.22], color: '#fff0d0', intensity: 3.2 },
  light: { sky: '#d8c8b0', ground: '#7a6048', hemi: 1.0 },
  sky: { top: '#3f6aa8', horizon: '#dce4e8', ground: '#b8a68e', sunColor: '#fff4d8', glow: 0.7 },
  fog: { color: '#d8d4c8', near: 60, far: 400 },
  clouds: { count: 20, shadow: '#a8b0c0', lit: '#ffffff', rim: '#ffffff', distance: [250, 800], altitude: [120, 240], hole: 0.2 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.1, vignette: 0.5, shadowTint: '#2e2440', highlightTint: '#ffe6c0' },
  shadow: { center: [0, 0], radius: 14 },

  player: { start: [-3.7, 2.5], yaw: -0.95, pitch: 0.1, eye: 1.62, speed: 2.5 },

  terrain: {
    size: 600, segments: 100, seed: 81, hills: 8, bumps: 0.1,
    flats: [{ x: 0, z: 0, r: 30, falloff: 30, height: 0 }],
    colors: { ground: '#8a7458', groundAlt: '#7a664c', grass: '#7a8048', high: '#8a7a5c', rock: '#6e6252' },
    patches: [{ x: 0, z: 0, r: 7, color: '#6e5a44', strength: 0.9, rough: 0.2 }],
  },

  objects: [],

  crowd: {
    palette: K.palette,
    groups: GROUPS,
  },

  figures: [
    K.christ(CHRIST[0], CHRIST[1], [HOLE.x, HOLE.z], { arms: 'out', light: { color: '#fff0cf', intensity: 2.5, distance: 6 }, halo: { size: 2.4, opacity: 0.22, color: '#fff3d6' } }),
    ...[[-HOLE.w / 2 - 0.35, -0.5], [HOLE.w / 2 + 0.35, 0.4], [0.2, -HOLE.d / 2 - 0.35], [-0.2, HOLE.d / 2 + 0.35]].map(([dx, dz]) => ({
      x: HOLE.x + dx, z: HOLE.z + dz, y: H + 0.3, face: [HOLE.x, HOLE.z], robe: '#8b6b4a', mantle: '#5a3d2b', skin: '#9b6a46', arms: 'out',
    })),
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;
    const t = 0.45;

    for (const p of placeCrowd(GROUPS.map((g) => ({ palette: K.palette, ...g })), ctx.heightAt, ctx.heightAt)) {
      ctx.colliders.add({ x: p.x, z: p.z, w: 0.45 * p.scale, d: 0.45 * p.scale, bottom: p.y, top: p.y + 1.7 * p.scale });
    }

    K.block(ctx, { x: 0, z: -D / 2 - t / 2, y: -0.1, w: W + 2 * t, h: H + 0.1, d: t, color: plaster });
    K.block(ctx, { x: -W / 2 - t / 2, z: 0, y: -0.1, w: t, h: H + 0.1, d: D, color: plaster });
    K.block(ctx, { x: W / 2 + t / 2, z: 0, y: -0.1, w: t, h: H + 0.1, d: D, color: plaster });
    const dl = DOOR[0] - DOOR[1] / 2, dr = DOOR[0] + DOOR[1] / 2;
    K.block(ctx, { x: (-W / 2 - t + dl) / 2, z: D / 2 + t / 2, y: -0.1, w: dl + W / 2 + t, h: H + 0.1, d: t, color: plaster });
    K.block(ctx, { x: (dr + W / 2 + t) / 2, z: D / 2 + t / 2, y: -0.1, w: W / 2 + t - dr, h: H + 0.1, d: t, color: plaster });
    K.block(ctx, { x: DOOR[0], z: D / 2 + t / 2, y: 2.2, w: DOOR[1], h: H - 2.2, d: t, color: plaster });
    ctx.colliders.add({ x: DOOR[0], z: D / 2 + t / 2, w: DOOR[1], d: t, bottom: -1, top: 10 });
    for (const [x, z, w, d] of [[0, -D / 2 + 0.1, W, 0.05], [-W / 2 + 0.1, 0, 0.05, D]]) ctx.solid.box(w, 1.0, d, { position: [x, 0.5, z], color: '#8a6e50', jitter: 0.03 });

    const roofY = H, rt = 0.3;
    const x0 = HOLE.x - HOLE.w / 2, x1 = HOLE.x + HOLE.w / 2, z0 = HOLE.z - HOLE.d / 2, z1 = HOLE.z + HOLE.d / 2;
    const L = -W / 2 - t, R = W / 2 + t, N = -D / 2 - t, S = D / 2 + t;
    for (const [ax, bx, az, bz] of [[L, R, N, z0], [L, R, z1, S], [L, x0, z0, z1], [x1, R, z0, z1]]) {
      ctx.solid.box(bx - ax, rt, bz - az, { position: [(ax + bx) / 2, roofY + rt / 2, (az + bz) / 2], color: '#7a6448', jitter: 0.06 });
    }
    for (let z = -D / 2 + 0.3; z < D / 2; z += 0.6) {
      if (z > z0 - 0.1 && z < z1 + 0.1) {
        ctx.solid.box(x0 - L, 0.2, 0.18, { position: [(L + x0) / 2, roofY - 0.1, z], color: '#5a3e28' });
        ctx.solid.box(R - x1, 0.2, 0.18, { position: [(x1 + R) / 2, roofY - 0.1, z], color: '#5a3e28' });
        continue;
      }
      ctx.solid.box(W + 2 * t, 0.2, 0.18, { position: [0, roofY - 0.1, z], color: '#5a3e28' });
    }
    ctx.solid.box(0.2, 0.2, 1.2, { position: [x0 + 0.25, roofY - 0.25, z0 + 0.5], rotation: [0.6, 0.2, 0.5], color: '#5a3e28' });
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2, d = r() * 1.3;
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.06, 0.16), 0), { position: [HOLE.x + 1.4 + Math.cos(a) * d * 0.6, 0.06, HOLE.z + Math.sin(a) * d], color: r.pick(['#7a6448', '#6a563e', '#8a7458']) });
    }
    for (let i = 0; i < 10; i++) {
      ctx.solid.box(r.range(0.4, 0.9), 0.08, r.range(0.1, 0.2), { position: [HOLE.x + r.range(-1.2, 1.2), roofY + rt + 0.05, HOLE.z + (r() < 0.5 ? 1 : -1) * r.range(HOLE.d / 2 + 0.3, HOLE.d / 2 + 1.2)], rotation: [0, r() * 3, 0], color: '#6a5034' });
    }

    const bed = new THREE.Group();
    const bb = new K.Batch(r);
    bb.box(0.85, 0.07, 1.95, { color: '#9a7a50' });
    bb.box(0.7, 0.05, 1.6, { position: [0, 0.06, 0.05], color: '#d8ccb0' });
    bb.box(0.4, 0.18, 1.2, { position: [0, 0.15, 0.25], color: '#a89070' });
    bb.add(new THREE.IcosahedronGeometry(0.13, 0), { position: [0, 0.2, -0.55], color: '#9b6a46' });
    const bedMesh = bb.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
    bedMesh.castShadow = bedMesh.receiveShadow = true;
    bed.add(bedMesh);
    const ropeMat = new THREE.MeshLambertMaterial({ color: '#b89a6a' });
    const ropeLen = H + 0.4;
    for (const [rx, rz] of [[-0.4, -0.9], [0.4, -0.9], [-0.4, 0.9], [0.4, 0.9]]) {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, ropeLen, 4).translate(0, ropeLen / 2, 0), ropeMat);
      rope.position.set(rx, 0, rz);
      rope.rotation.set(rz * -0.12, 0, rx * 0.25);
      bed.add(rope);
    }
    bed.position.set(HOLE.x, 1.5, HOLE.z);
    ctx.scene.add(bed);
    ctx.onFrame((time) => {
      const k = (time * 0.04) % 1;
      bed.position.y = 2.2 - Math.min(1, k * 1.6) * 1.1;
      bed.rotation.z = Math.sin(time * 0.8) * 0.03;
      bed.rotation.x = Math.sin(time * 0.6) * 0.02;
    });

    ctx.effects.motes({ position: [HOLE.x, 0, HOLE.z], radius: 0.8, height: H, count: 70, color: '#ffe8c0', size: 0.025 });
    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(HOLE.w * 0.95, H, HOLE.d * 0.95).translate(0, H / 2, 0),
      new THREE.MeshBasicMaterial({ color: '#fff0d0', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    shaft.position.set(HOLE.x + 0.15, 0, HOLE.z + 0.3);
    shaft.rotation.x = -0.12;
    ctx.scene.add(shaft);

    for (const [x, z] of [[-W / 2 + 0.25, -1.8], [W / 2 - 0.25, 1.2], [-2.5, -D / 2 + 0.25], [3.4, -D / 2 + 0.25]]) {
      ctx.solid.box(0.4, 0.06, 0.3, { position: [x, 1.9, z], color: '#5a4030' });
      K.lamp(ctx, { x, y: 2.05, z, intensity: 2.2, distance: 6 });
    }

    const fill = new THREE.PointLight('#ffd8a8', 7, 11, 1.4);
    fill.position.set(-1.5, 2.6, 1.2);
    ctx.scene.add(fill);
    const scribe = ['#3f4d5e', '#e0d6c0', '#2e3a4a', '#d8cdb5', '#4f3a2e'];
    for (let i = 0; i < 5; i++) {
      K.seated(ctx, { x: -3.0 + i * 1.05, z: -D / 2 + 0.55, face: [-3.0 + i * 1.05, 0], seat: 0.45, robe: scribe[i], mantle: i % 2 ? '#8a7a5a' : '#f0eadc', skin: r.pick(K.palette.skins) });
      ctx.solid.box(0.95, 0.45, 0.45, { position: [-3.0 + i * 1.05, 0.22, -D / 2 + 0.38], color: '#6a5038' });
    }
    for (let i = 0; i < 3; i++) K.seated(ctx, { x: -W / 2 + 0.6, z: -1.2 + i * 1.0, face: [0, -1.2 + i * 1.0], seat: 0.05, robe: r.pick(K.palette.robes), skin: r.pick(K.palette.skins) });
    const rug = (x, z, w, d, c) => ctx.solid.box(w, 0.03, d, { position: [x, 0.03, z], color: c, jitter: 0.02 });
    rug(HOLE.x + 0.5, HOLE.z, 3.2, 3.4, '#7a3a2a');
    rug(HOLE.x + 0.5, HOLE.z, 2.6, 2.8, '#a8803e');
    for (const [x, z] of [[W / 2 - 0.6, -D / 2 + 0.6], [W / 2 - 1.3, -D / 2 + 0.55]]) K.jar(ctx, { x, z, h: 0.8, color: '#9a6a48' });

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + r.range(-0.1, 0.1), d = r.range(14, 30);
      K.house(ctx, { x: Math.cos(a) * d, z: Math.sin(a) * d, rot: r.range(-0.2, 0.2), color: '#5e5852', roof: '#6a5a44' });
    }
  },
};
