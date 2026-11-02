// Helaman 5:20-52: in a Lamanite prison Nephi and Lehi are encircled about as if by fire.
// A cloud of darkness overshadows the three hundred, the walls tremble, and angels come down to minister.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { createFigure } from '../engine/crowd.js';
import { makePeople, addCrowd, radiant, strut, fire } from './lib/bom-31-kit.js';

const W = 36, D = 28, H = 7;
const BRO = [0, -5];
const HOLE = 3.2;

const lamanites = {
  robes: ['#6a3a2a', '#4a3428', '#5a2a22', '#3a3028', '#7a4a32', '#5a4a3a'],
  mantles: ['#2a1e18', '#4a2a1e', '#3a2a22'],
  skins: ['#7a4c31', '#8a5a3c', '#6e4530', '#9b6a46'],
  mantleChance: 0.5,
  hoodChance: 0.15,
};

function wallBox(ctx, x, z, w, h, d, color, y = 0) {
  ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], color, jitter: 0.06 });
  ctx.colliders.add({ x, z, w, d, bottom: y - 1, top: y + h });
}

export default {
  title: 'Helaman 5:20-52: Nephi and Lehi encircled by fire',
  seed: 35,
  fov: 62,
  exposure: 1.3,

  sun: { direction: [0.08, 1, 0.12], color: '#fff2d8', intensity: 2.2 },
  light: { sky: '#6a6080', ground: '#3a2a20', hemi: 1.0 },
  sky: { top: '#0a0810', horizon: '#14101a', ground: '#0a0808', sunColor: '#ffffff', glow: 0.2 },
  fog: { color: '#0e0b10', near: 8, far: 55 },
  bloom: { strength: 0.9, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.55, shadowTint: '#1a1430', highlightTint: '#ffe0a8' },
  shadow: { center: [0, 0], radius: 26 },

  player: { start: [1.5, 12], yaw: 0.02, pitch: 0.08, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 400,
    segments: 60,
    seed: 35,
    hills: 4,
    bumps: 0.1,
    flats: [{ x: 0, z: 0, r: 40, falloff: 20, height: 0 }],
    colors: { ground: '#3a3028', groundAlt: '#342a22', grass: '#3a3028', rock: '#3a3028' },
  },

  objects: [
    { type: 'pavement', x: 0, z: 0, w: W, d: D, tile: 1.6, color: '#6a5e50', damage: 0.3 },
    ...[-1, 1].flatMap((sx) => [-7, 3].map((z) => ({ type: 'column', x: sx * 10, z, h: H, radius: 0.6, color: '#7a6a58', broken: false }))),
    { type: 'rubble', x: -14, z: 9, radius: 2, count: 8, size: [0.2, 0.5], color: '#6a5a4a' },
    { type: 'rubble', x: 15, z: -11, radius: 2, count: 8, size: [0.2, 0.5], color: '#6a5a4a' },
  ],

  custom(ctx) {
    const r = rng(350);
    const stone = '#6e6052';

    // Thick prison walls, a barred door and slit windows.
    wallBox(ctx, 0, -D / 2 - 0.6, W + 2.4, H, 1.2, stone);
    wallBox(ctx, -W / 2 - 0.6, 0, 1.2, H, D, stone);
    wallBox(ctx, W / 2 + 0.6, 0, 1.2, H, D, stone);
    wallBox(ctx, -W / 4 - 1, D / 2 + 0.6, W / 2 - 2, H, 1.2, stone);
    wallBox(ctx, W / 4 + 1, D / 2 + 0.6, W / 2 - 2, H, 1.2, stone);
    wallBox(ctx, 0, D / 2 + 0.6, 4, H - 3.2, 1.2, stone, 3.2);
    ctx.solid.box(4, 3.2, 0.3, { position: [0, 1.6, D / 2 + 0.2], color: '#3a2a1e' });
    for (let x = -1.6; x <= 1.6; x += 0.53) ctx.solid.box(0.12, 3.2, 0.12, { position: [x, 1.6, D / 2 - 0.02], color: '#2a2420' });
    ctx.colliders.add({ x: 0, z: D / 2 + 0.6, w: 4, d: 1.2, bottom: -1, top: 3.2 });
    for (let i = 0; i < 6; i++) {
      const z = -D / 2 + 4 + i * 4;
      for (const sx of [-1, 1]) {
        ctx.glow.box(0.05, 1.4, 0.35, { position: [sx * (W / 2 - 0.02), 5, z], color: '#1a2438', jitter: 0 });
        for (let k = -1; k <= 1; k++) ctx.solid.box(0.08, 1.5, 0.06, { position: [sx * (W / 2 - 0.05), 5, z + k * 0.11], color: '#1a1614' });
      }
    }
    for (let i = 0; i < 14; i++) {
      const x = r.range(-W / 2 + 1, W / 2 - 1);
      strut(ctx.solid, [x, r.range(1, 3), -D / 2 + 0.02], [x + r.range(-1.5, 1.5), r.range(4, 6.5), -D / 2 + 0.02], 0.08, '#2a221c');
    }
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) {
      const z = r.range(-D / 2 + 1, D / 2 - 1);
      strut(ctx.solid, [sx * (W / 2 - 0.02), r.range(0.5, 3), z], [sx * (W / 2 - 0.02), r.range(4, 6.5), z + r.range(-1.5, 1.5)], 0.08, '#2a221c');
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      ctx.solid.box(0.3, 0.3, 0.3, { position: [sx * 6, 2.2, sz * (D / 2 - 0.1)], color: '#3a2a1e' });
    }

    // Wall torches.
    for (const [x, z] of [[-W / 2 + 0.3, 2], [W / 2 - 0.3, 2], [-W / 2 + 0.3, -10], [W / 2 - 0.3, -10]]) {
      ctx.solid.box(0.3, 0.6, 0.3, { position: [x, 2.9, z], color: '#2a1e16' });
      fire(ctx, { x, z, y: 3.1, size: 0.35, light: 7, distance: 16, color: '#ff8030' });
    }

    // A raised stone step by the door where the player stands.
    ctx.solid.box(5, 0.9, 3.4, { position: [1.5, 0.45, 12.2], color: '#7a6a58' });
    ctx.colliders.add({ x: 1.5, z: 12.2, w: 5, d: 3.4, bottom: -1, top: 0.9 });
    ctx.solid.box(5, 0.45, 0.8, { position: [1.5, 0.22, 10.1], color: '#7a6a58' });
    ctx.colliders.add({ x: 1.5, z: 10.1, w: 5, d: 0.8, bottom: -1, top: 0.45 });

    // Roof of beams and slabs, broken open above the brothers.
    for (let x = -W / 2; x < W / 2; x += 2) {
      for (let z = -D / 2; z < D / 2; z += 2) {
        if (Math.hypot(x + 1 - BRO[0], z + 1 - BRO[1]) < HOLE) continue;
        ctx.solid.box(2.02, 0.6, 2.02, { position: [x + 1, H + 0.3, z + 1], color: '#4a4036', jitter: 0.08 });
      }
    }
    for (let z = -D / 2 + 2; z < D / 2; z += 4) ctx.solid.box(W, 0.5, 0.45, { position: [0, H - 0.25, z], color: '#3a2a1e' });

    // The ring of fire that does not burn, and the brothers within it, faces shining.
    const fy = ctx.heightAt(...BRO);
    const N = 30;
    const flames = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 1.4, 5).translate(0, 0.7, 0), new THREE.MeshBasicMaterial({ color: '#ffb040', toneMapped: false, fog: false }), N);
    const inner = new THREE.InstancedMesh(new THREE.ConeGeometry(0.12, 0.9, 5).translate(0, 0.45, 0), new THREE.MeshBasicMaterial({ color: '#fff0b0', toneMapped: false, fog: false }), N);
    const seeds = Array.from({ length: N }, (_, i) => [(i / N) * Math.PI * 2, r() * 6, r.range(0.8, 1.3)]);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
    ctx.scene.add(flames, inner);
    flames.frustumCulled = inner.frustumCulled = false;
    ctx.onFrame((t) => {
      seeds.forEach(([a, ph, k], i) => {
        const rad = 2.4 + 0.08 * Math.sin(t * 2 + ph);
        p.set(BRO[0] + Math.cos(a + t * 0.15) * rad, fy, BRO[1] + Math.sin(a + t * 0.15) * rad);
        const h = k * (0.85 + 0.25 * Math.sin(t * 8 + ph) + 0.12 * Math.sin(t * 19 + ph * 3));
        s.set(1, h, 1);
        q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, t + ph);
        flames.setMatrixAt(i, m.compose(p, q, s));
        inner.setMatrixAt(i, m.compose(p, q, s.set(1, h * 1.1, 1)));
      });
      flames.instanceMatrix.needsUpdate = inner.instanceMatrix.needsUpdate = true;
    });
    ctx.effects.ring({ position: [BRO[0], fy + 0.05, BRO[1]], radius: 2.4, width: 0.7, color: '#ffb050', opacity: 1 });
    const glow = new THREE.PointLight('#ffc070', 40, 22, 1.4);
    glow.position.set(BRO[0], fy + 2, BRO[1]);
    ctx.scene.add(glow);
    ctx.onFrame((t) => (glow.intensity = 40 * (0.9 + 0.08 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23))));
    for (const [sx, robe, mantle] of [[-0.6, '#d8ccb0', '#5a6a8a'], [0.6, '#cfc2a2', '#7a5a3a']]) {
      const x = BRO[0] + sx;
      ctx.scene.add(createFigure({ x, y: fy, z: BRO[1], face: [0, 12], robe, mantle, skin: '#f0d8b0', arms: 'out', emissive: 0.35 }));
      ctx.effects.halo({ position: [x, fy + 1.55, BRO[1] + 0.1], size: 1.5, color: '#fff2d0', opacity: 0.9 });
      ctx.colliders.add({ x, z: BRO[1], w: 0.6, d: 0.6, bottom: fy, top: fy + 1.8 });
    }
    ctx.effects.beam({ position: [BRO[0], fy, BRO[1]], height: 60, radiusBottom: 2.0, radiusTop: 2.8, color: '#fff2d6', opacity: 0.22 });
    ctx.effects.motes({ position: [BRO[0], fy, BRO[1]], radius: 2.6, height: 9, count: 120, color: '#fff2d0' });

    // Angels descending through the broken roof.
    for (const [x, y, z] of [[-3.4, 4.0, BRO[1] - 1.2], [3.4, 4.5, BRO[1] - 0.8]]) {
      const angel = radiant(ctx, { x, y, z, face: [0, 12], halo: 5, light: 6, arms: 'out' }, createFigure);
      const y0 = y;
      ctx.onFrame((t) => (angel.position.y = y0 + Math.sin(t * 0.7 + x) * 0.12));
    }

    // The three hundred, overshadowed by a cloud of darkness, many fallen to their knees.
    const pts = [];
    for (let tries = 0; pts.length < 300 && tries < 8000; tries++) {
      const x = r.range(-W / 2 + 1, W / 2 - 1), z = r.range(-D / 2 + 1, D / 2 - 1);
      const d = Math.hypot(x - BRO[0], z - BRO[1]);
      if (d < 4.5 || Math.hypot(x - 1.5, z - 12) < 2.6) continue;
      if (Math.abs(x - 0.4 - (z - BRO[1]) * 0.07) < 1.3 && z > BRO[1]) continue;
      if ([-10, 10].some((cx) => [-7, 3].some((cz) => Math.hypot(x - cx, z - cz) < 1.1))) continue;
      if (pts.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.85)) continue;
      pts.push([x, z]);
    }
    const crowd = makePeople(pts, { palette: lamanites, heightAt: ctx.heightAt, seed: 3, face: BRO, yawJitter: 0.4, kneel: 0.55 });
    addCrowd(ctx, crowd);
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * (1 + (i / 13) * 0.9 - 0.1) + (i % 2 ? 0 : Math.PI * 0.95), d = r.range(7, 13);
      ctx.effects.smoke({ position: [BRO[0] + Math.cos(a) * d * 1.2, 0.6, BRO[1] + Math.sin(a) * d * 0.8], count: 6, height: 2.2, size: 0.8, color: '#120e14', wind: [0.2, 0.1], seed: 90 + i });
    }
  },
};
