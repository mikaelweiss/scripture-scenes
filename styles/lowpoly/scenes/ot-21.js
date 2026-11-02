// Exodus 32:15-20: Moses comes down from the mount with the two tables of stone in his hands
// and sees the golden calf on its altar and the people dancing around it.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { Batch } from '../engine/world.js';
import { parts } from '../engine/crowd.js';
import { ISRAEL, desertTerrain, layoutTents, tentZones, tent, campfire, flock, banner, person, tablets, dress } from './lib/ot-19-camp.js';
import { sinaiFlat, sinaiPeaks, sinaiStorm } from './lib/ot-19-sinai.js';

const MOUNT = [0, -300];
const CALF = [0, -60];
const MOSES = [1.5, -104];

const tents = layoutTents({ center: [0, 40], ring: [10, 220], count: 230, seed: 21, face: CALF, avoid: [{ x: CALF[0], z: CALF[1], r: 34 }, { rect: [0, -100, 60, 50] }] });
const zones = tentZones(tents);

function goldenCalf(ctx, at) {
  let [x, z] = at;
  const y = ctx.heightAt(x, z);
  const stone = '#a89a86';
  ctx.solid.box(4.2, 1.2, 3, { position: [x, y + 0.6, z], color: stone });
  ctx.solid.box(3.4, 0.5, 2.4, { position: [x, y + 1.45, z], color: '#c4b8a4' });
  ctx.colliders.add({ x, z, w: 4.2, d: 3, bottom: y, top: y + 1.7 });
  // The altar Aaron built before it, with its fire.
  ctx.solid.box(2, 1, 2, { position: [x, y + 0.5, z + 5], color: stone });
  ctx.colliders.add({ x, z: z + 5, w: 2, d: 2, bottom: y, top: y + 1 });
  campfire(ctx, x, z + 5, { light: true, smoke: 10 });

  const b = new Batch(ctx.rand);
  const top = y + 1.7;
  const [ox, oz] = [x, z];
  x = 0; z = 0;
  const gold = '#e8b440';
  b.add(new THREE.IcosahedronGeometry(1, 0).scale(0.55, 0.62, 1.15), { position: [x, 1.25, z], color: gold, jitter: 0.06 });
  b.add(new THREE.BoxGeometry(0.42, 0.55, 0.75).rotateX(0.45), { position: [x, 1.75, z + 1.1], color: gold, jitter: 0.06 });
  for (const s of [-1, 1]) {
    b.add(new THREE.ConeGeometry(0.07, 0.42, 4).rotateZ(-s * 0.9), { position: [x + s * 0.28, 2.12, z + 1.05], color: '#f6d070' });
    for (const lz of [-0.6, 0.6]) b.add(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 5), { position: [x + s * 0.3, 0.45, z + lz], color: gold });
  }
  b.add(new THREE.CylinderGeometry(0.03, 0.05, 0.8, 4).rotateX(-0.5), { position: [x, 1.1, z - 1.2], color: gold });
  const calf = b.build(new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#b07a10', emissiveIntensity: 0.55 }));
  calf.castShadow = true;
  calf.position.set(ox, top, oz);
  calf.scale.setScalar(1.5);
  x = ox; z = oz;
  ctx.scene.add(calf);
  const shine = new THREE.PointLight('#ffd27a', 40, 18, 1.5);
  shine.position.set(x, top + 4.5, z + 3);
  ctx.scene.add(shine);
  ctx.effects.halo({ position: [x, top + 1.9, z], size: 9, color: '#ffcf60', opacity: 0.35 });
}

// Three rings of revelers circling the calf in opposite directions.
function dancers(ctx, [cx, cz]) {
  const r = rng(5);
  const rings = [[8, 24, 1], [11.5, 34, -1], [15, 44, 1]];
  const list = rings.flatMap(([rad, n, dir]) => Array.from({ length: n }, (_, i) => ({ rad: rad + r.range(-0.4, 0.4), a: (i / n) * Math.PI * 2, dir, s: r() < 0.15 ? 0.7 : r.range(0.92, 1.08), ph: r() * 6, ...dress(r) })));
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const meshes = [['robe', 'robe'], ['head', 'skin'], ['mantle', 'mantle'], ['arms', 'mantle']].map(([part, key]) => {
    const geo = part === 'arms' ? parts.arms('out') : parts[part]();
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((p, i) => m.setColorAt(i, new THREE.Color(p[key] ?? p.robe)));
    m.castShadow = true;
    m.frustumCulled = false;
    ctx.scene.add(m);
    return m;
  });
  const mx = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  ctx.onFrame((t) => {
    list.forEach((p, i) => {
      const a = p.a + p.dir * t * 0.35;
      const px = cx + Math.cos(a) * p.rad, pz = cz + Math.sin(a) * p.rad;
      pos.set(px, ctx.heightAt(px, pz) + Math.abs(Math.sin(t * 5 + p.ph)) * 0.22, pz);
      q.setFromAxisAngle(up, -a + (p.dir > 0 ? 0 : Math.PI) + Math.sin(t * 3 + p.ph) * 0.6);
      sc.setScalar(p.s);
      mx.compose(pos, q, sc);
      for (const m of meshes) m.setMatrixAt(i, mx);
    });
    for (const m of meshes) m.instanceMatrix.needsUpdate = true;
  });
}

export default {
  title: 'Exodus 32:15-20: The golden calf',
  seed: 21,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.85, 0.3, -0.25], color: '#ffc58a', intensity: 2.8 },
  light: { sky: '#9aa4c8', ground: '#6a4c38', hemi: 1.0 },
  sky: { top: '#4f6290', horizon: '#f0b888', ground: '#c89a74', sunColor: '#ffd9a0', glow: 1.0 },
  fog: { color: '#d4a888', near: 80, far: 640 },
  clouds: { count: 40, shadow: '#5a4a58', lit: '#ffc890', rim: '#fff0d0', distance: [400, 1000], altitude: [200, 320], hole: 0.2 },
  mountains: { count: 40, color: '#7a5a4c', radius: [560, 800], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.55, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#3a2a5a', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -70], radius: 70 },

  player: { start: [-1.5, -112], yaw: Math.PI, pitch: -0.13, eye: 1.65, speed: 4.5 },

  terrain: desertTerrain({
    seed: 21,
    flats: [{ x: 0, z: 30, r: 120, falloff: 70, height: 0 }, sinaiFlat({ x: MOUNT[0], z: MOUNT[1], base: 90, spread: 250 })],
    colors: { ground: '#b48a62', groundAlt: '#a27a56', grass: '#9a8458', high: '#8a6650', rock: '#7a5a48' },
  }),

  scatter: [{ type: 'rock', count: 50, center: [0, 0], ring: [180, 420], spacing: 12, seed: 3, props: { color: '#8a6a52' } }],

  crowd: {
    palette: ISRAEL,
    groups: [
      { count: 700, center: CALF, ring: [18, 58], spacing: 1.1, face: CALF, children: 0.2, seed: 31, avoid: [...zones, { rect: [0, -108, 30, 24] }] },
      { count: 500, center: [0, 40], ring: [0, 160], spacing: 1.6, face: CALF, children: 0.25, kneel: 0.1, seed: 32, avoid: [...zones, { x: CALF[0], z: CALF[1], r: 58 }, { rect: [0, -110, 120, 60] }] },
    ],
  },

  custom(ctx) {
    for (const t of tents) tent(ctx, t);
    goldenCalf(ctx, CALF);
    dancers(ctx, CALF);
    for (const [x, z] of [[-24, -44], [24, -46], [-30, 10], [30, 6], [-60, 40], [60, 50], [0, 30]]) campfire(ctx, x, z, { smoke: 8 });
    [[-10, -42, '#c9a24a'], [10, -42, '#9a2a24'], [-18, -66, '#2a4a7a'], [18, -66, '#7a3a7a']].forEach(([x, z, c]) => banner(ctx, x, z, c));
    flock(ctx, [-120, 50], 30, 14, 5);
    flock(ctx, [110, 80], 20, 10, 6, ['ox', 'goat']);

    // Moses, tables raised, about to cast them down. Joshua a step behind.
    const my = ctx.heightAt(MOSES[0], MOSES[1]);
    person(ctx, { x: MOSES[0], z: MOSES[1], yaw: 0, robe: '#c8b89a', mantle: '#7a3a2a', skin: '#9b6a46', hood: true, scale: 1.05, arms: [[2.75, 0.32], [2.75, 0.32]] });
    tablets(ctx, MOSES[0], my + 2.25, MOSES[1] + 0.12, 0, { scale: 1.15 });
    person(ctx, { x: MOSES[0] - 2.2, z: MOSES[1] - 1.6, yaw: 0.2, robe: '#8b6b4a', mantle: '#3f4d5e', skin: '#8a5a3c', hood: true, arms: [[0.5, 0.15], [0.2, 0.12]] });
    ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), { position: [MOSES[0] - 1.85, my + 1, MOSES[1] - 1.3], rotation: [0.1, 0, 0.05], color: '#5a4332' });

    const summit = sinaiPeaks(ctx, { x: MOUNT[0], z: MOUNT[1], base: 90, seed: 7 });
    sinaiStorm(ctx, summit, { fire: false, lightning: false, quake: false, cloudColor: '#8a7c7a' });
  },
};
