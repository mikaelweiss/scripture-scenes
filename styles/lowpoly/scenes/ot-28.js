// 1 Samuel 3:1-10. Night in the house of the Lord at Shiloh. The lamp of God has not yet gone out.
// The child Samuel has risen from his mat and answers, "Speak; for thy servant heareth."
// The room is built around the player: the doors behind (+z), the veil ahead (-z).
import * as THREE from 'three';
import { flames, fireLight, instanced, createFigure, rng } from './lib/ot-25-kit.js';

const ROOM = { w: 10, z0: -10, z1: 8, h: 6 };
const MENORAH = [-3, -4];
const TABLE = [3.1, -4];
const ALTAR = [0, -7.6];
const SAMUEL = [1.5, -0.3];
const PRESENCE = [-1.6, 2.6];

export default {
  title: '1 Samuel 3:1-10: The Lord calls Samuel',
  seed: 28,
  fov: 64,
  exposure: 1.1,

  sun: { direction: [0.3, 0.8, 0.2], color: '#6a7aa8', intensity: 0.15 },
  light: { sky: '#3a3450', ground: '#1a1410', hemi: 0.55 },
  sky: { top: '#05060e', horizon: '#0e1020', ground: '#05060a', sunColor: '#8090c0', glow: 0.1 },
  fog: { color: '#0c0a0a', near: 14, far: 70 },
  bloom: { strength: 0.85, radius: 0.6, threshold: 0.72 },
  grade: { saturation: 1.08, contrast: 1.08, vignette: 0.55, shadowTint: '#1a1430', highlightTint: '#ffd8a0' },
  shadow: { center: [0, 0], radius: 16 },

  player: { start: [0.6, 7.2], yaw: 0.02, pitch: -0.06, eye: 1.6, speed: 3 },

  terrain: {
    size: 200,
    segments: 40,
    seed: 28,
    hills: 0,
    bumps: 0,
    flats: [],
    colors: { ground: '#4a3e32', groundAlt: '#443a2e', grass: '#4a3e32', rock: '#4a3e32' },
  },

  custom(ctx) {
    const r = rng(28);
    const { w, z0, z1, h } = ROOM;
    const zc = (z0 + z1) / 2, d = z1 - z0;
    const wall = (x, z, ww, dd, color, hh = h, y = 0) => {
      ctx.solid.box(ww, hh, dd, { position: [x, y + hh / 2, z], color, jitter: 0.03 });
      ctx.colliders.add({ x, z, w: ww, d: dd, bottom: y, top: y + hh });
    };

    // Floor of fitted stone and a roof of dark skins over the room.
    for (let x = -w / 2 + 0.6; x < w / 2; x += 1.2) {
      for (let z = z0 + 0.6; z < z1; z += 1.2) ctx.solid.box(1.16, 0.1, 1.16, { position: [x, 0.02, z], color: '#7a6a54', jitter: 0.08 });
    }
    ctx.solid.box(w + 1, 0.3, d + 1, { position: [0, h + 0.15, zc], color: '#2a1e18' });
    for (let z = z0 + 1.5; z < z1; z += 3) ctx.solid.box(w, 0.25, 0.25, { position: [0, h - 0.12, z], color: '#5a3e26' });

    // Side walls: gilded boards below, woven curtain of blue, purple and scarlet above.
    for (const side of [-1, 1]) {
      const x = side * (w / 2 + 0.15);
      ctx.colliders.add({ x, z: zc, w: 0.3, d, bottom: 0, top: h });
      for (let z = z0 + 0.4; z < z1; z += 0.8) {
        ctx.solid.box(0.25, h * 0.62, 0.76, { position: [x, h * 0.31, z], color: '#9a7838', jitter: 0.07 });
      }
      ctx.solid.box(0.3, 0.18, d, { position: [x - side * 0.05, h * 0.62, zc], color: '#d8b050' });
      const stripes = ['#2a3a7a', '#5a2a6a', '#8a2a2a', '#e8e0cc'];
      for (let i = 0; i < 12; i++) {
        ctx.solid.box(0.12, h * 0.38, d / 12, { position: [x, h * 0.81, z0 + (i + 0.5) * (d / 12)], color: stripes[i % 4], jitter: 0.05 });
      }
    }

    // The doors, shut until morning, and the front wall around them.
    wall(-3.25, z1 + 0.15, w / 2 - 1.5 + 0.5, 0.3, '#b8903e');
    wall(3.25, z1 + 0.15, w / 2 - 1.5 + 0.5, 0.3, '#b8903e');
    for (const side of [-1, 1]) {
      wall(side * 0.75, z1 + 0.1, 1.5, 0.2, '#5a3a22', 3.6);
      for (let k = 0; k < 4; k++) ctx.solid.box(1.3, 0.08, 0.05, { position: [side * 0.75, 0.5 + k * 0.9, z1 - 0.02], color: '#3a2616' });
    }
    ctx.solid.box(3.2, h - 3.6, 0.3, { position: [0, 3.6 + (h - 3.6) / 2, z1 + 0.15], color: '#b8903e' });

    // The veil before the ark, embroidered with cherubim.
    wall(0, z0 - 0.1, w, 0.2, '#2e3a78');
    for (let i = 0; i < 5; i++) {
      const x = -w / 2 + 1 + i * 2;
      for (const s of [-1, 1]) ctx.solid.add(new THREE.ConeGeometry(0.35, 1.3, 3), { position: [x + s * 0.4, 3.9, z0 + 0.03], rotation: [0, 0, s * 0.9], scale: [1, 1, 0.1], color: '#e0c060' });
    }
    for (let i = 0; i < 20; i++) ctx.solid.box(0.06, h, 0.04, { position: [-w / 2 + 0.25 + i * 0.5, h / 2, z0 + 0.01], color: r.pick(['#5a2a6a', '#8a2a2a', '#3a4a8a']) });
    for (const x of [-4.2, -1.4, 1.4, 4.2]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.18, h, 8), { position: [x, h / 2, z0 + 0.3], color: '#d0a848' });
      ctx.colliders.add({ x, z: z0 + 0.3, w: 0.4, d: 0.4, bottom: 0, top: h });
    }

    // Golden altar of incense with a thin thread of smoke.
    wall(ALTAR[0], ALTAR[1], 0.9, 0.9, '#d0a848', 1.6);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.solid.add(new THREE.ConeGeometry(0.08, 0.2, 4), { position: [ALTAR[0] + dx * 0.4, 1.7, ALTAR[1] + dz * 0.4], color: '#e0b850' });
    ctx.glow.add(new THREE.CircleGeometry(0.3, 6).rotateX(-Math.PI / 2), { position: [ALTAR[0], 1.62, ALTAR[1]], color: '#c84a1a' });
    ctx.effects.smoke({ position: [ALTAR[0], 1.7, ALTAR[1]], count: 6, height: 4.2, size: 0.12, color: '#6a6060', wind: [0.1, 0.05], seed: 5 });

    // Table of shewbread with twelve loaves.
    ctx.solid.box(1.9, 0.12, 0.9, { position: [TABLE[0], 1.0, TABLE[1]], color: '#d0a848' });
    for (const [dx, dz] of [[-0.85, -0.38], [0.85, -0.38], [-0.85, 0.38], [0.85, 0.38]]) ctx.solid.box(0.08, 1.0, 0.08, { position: [TABLE[0] + dx, 0.5, TABLE[1] + dz], color: '#b8903e' });
    ctx.colliders.add({ x: TABLE[0], z: TABLE[1], w: 1.9, d: 0.9, bottom: 0, top: 1.06 });
    for (const dx of [-0.45, 0.45]) {
      for (let k = 0; k < 6; k++) ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.24, 0.07, 7), { position: [TABLE[0] + dx, 1.1 + k * 0.075, TABLE[1]], color: '#c8925a', jitter: 0.06 });
    }

    // The golden lampstand: seven branches, seven flames still burning.
    const mx = MENORAH[0], mz = MENORAH[1];
    const gold = '#e0b850';
    ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.5, 0.25, 6), { position: [mx, 0.12, mz], color: gold });
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, 1.9, 6), { position: [mx, 1.15, mz], color: gold });
    ctx.colliders.add({ x: mx, z: mz, w: 0.9, d: 0.4, bottom: 0, top: 2.2 });
    const lamps = [];
    for (let k = -3; k <= 3; k++) {
      const x = mx + k * 0.22;
      if (k) {
        const curve = new THREE.TorusGeometry(Math.abs(k) * 0.11, 0.025, 4, 10, Math.PI);
        ctx.solid.add(curve, { position: [mx + k * 0.11, 1.5, mz], rotation: [0, 0, Math.PI], scale: [1, 1.4, 1], color: gold });
        ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 5), { position: [x, 1.8 - 0.0, mz], color: gold });
      }
      ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.04, 0.08, 6), { position: [x, 2.12, mz], color: gold });
      lamps.push({ position: [x, 2.15, mz], size: 0.09 });
    }
    flames(ctx, lamps, { color: '#ffa848', core: '#fff4c8' });
    ctx.effects.halo({ position: [mx, 2.25, mz], size: 2.6, opacity: 0.45, color: '#ffb868' });
    fireLight(ctx, [mx + 0.6, 2.6, mz + 0.6], { color: '#ffb060', intensity: 22, distance: 16 });

    // Samuel's mat and blanket; the boy kneels up, turned toward the voice.
    ctx.solid.box(0.9, 0.08, 1.9, { position: [SAMUEL[0] + 0.3, 0.1, SAMUEL[1] - 0.9], rotation: [0, 0.2, 0], color: '#8a6a4a' });
    ctx.solid.box(0.85, 0.14, 1.0, { position: [SAMUEL[0] + 0.15, 0.18, SAMUEL[1] - 1.3], rotation: [0.05, 0.25, 0.06], color: '#6a4a5a' });
    ctx.solid.box(0.5, 0.14, 0.3, { position: [SAMUEL[0] + 0.5, 0.2, SAMUEL[1] - 0.1], rotation: [0, 0.2, 0], color: '#d8ccb0' });
    ctx.scene.add(createFigure({ x: SAMUEL[0], y: -0.26, z: SAMUEL[1], face: PRESENCE, scale: 0.78, robe: '#e8e0cc', mantle: '#d8ccb0', skin: '#b07a55', arms: 'down' }));
    ctx.colliders.add({ x: SAMUEL[0], z: SAMUEL[1], w: 0.6, d: 0.6, bottom: 0, top: 1.2 });
    ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.13, 0.08, 7), { position: [SAMUEL[0] + 1.0, 0.06, SAMUEL[1] - 0.4], color: '#a8683a' });

    // The Lord stands and calls: no form, only a soft standing light.
    ctx.effects.beam({ position: [PRESENCE[0], 0, PRESENCE[1]], height: h, radiusBottom: 0.7, radiusTop: 1.1, color: '#e8ecff', opacity: 0.55 });
    ctx.effects.halo({ position: [PRESENCE[0], 1.4, PRESENCE[1]], size: 2.6, opacity: 0.4, color: '#eef0ff' });
    ctx.effects.motes({ position: [PRESENCE[0], 0, PRESENCE[1]], radius: 0.9, height: 5, count: 50, color: '#f4f6ff', size: 0.025 });
    ctx.effects.ring({ position: [PRESENCE[0], 0.1, PRESENCE[1]], radius: 0.9, width: 0.5, color: '#dfe6ff', opacity: 0.6 });
    const holy = new THREE.PointLight('#dfe6ff', 10, 9, 1.4);
    holy.position.set(PRESENCE[0], 1.8, PRESENCE[1]);
    ctx.scene.add(holy);
  },
};
