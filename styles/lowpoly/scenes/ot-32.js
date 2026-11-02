// 1 Kings 19:9-13: Elijah in a cave on Horeb. The wind has torn the rocks, the earthquake has split the
// ground, the fire is dying on the slope, and now a still small voice. He stands at the cave mouth with
// his face wrapped in his mantle. The player starts inside the cave looking out to the north (-z).
import { figure, fire } from './lib/ot-31-kit.js';

const ELIJAH = [0.4, -0.2];
const rockColor = '#6e5648';

function cave(ctx) {
  const { THREE, solid, rand: r } = ctx;
  const y0 = 0;
  for (let z = -1.2; z <= 10; z += 1.25) {
    const open = z < 0 ? 0.25 : 0;
    for (let a = open; a <= Math.PI - open + 0.01; a += Math.PI / 7) {
      const rad = 5 + r.range(-0.2, 0.4) - (z > 8 ? (z - 8) * 0.6 : 0);
      solid.add(new THREE.DodecahedronGeometry(1.7, 0), {
        position: [Math.cos(a) * rad, y0 + Math.sin(a) * rad * 0.85 - 0.3, z + r.range(-0.3, 0.3)],
        rotation: [r() * 3, r() * 3, r() * 3],
        scale: [r.range(0.9, 1.3), r.range(0.8, 1.2), r.range(0.9, 1.2)],
        color: rockColor,
        jitter: 0.1,
      });
    }
  }
  for (let i = 0; i < 9; i++) {
    solid.add(new THREE.DodecahedronGeometry(2.2, 0), { position: [r.range(-3, 3), r.range(0.5, 4), 11 + r.range(-0.4, 0.4)], rotation: [r() * 3, r() * 3, 0], color: rockColor, jitter: 0.1 });
  }
  for (let i = 0; i < 14; i++) {
    const z = r.range(-1, 10);
    solid.add(new THREE.DodecahedronGeometry(1.8, 0), { position: [r.range(-2, 2), 6.4 + r.range(0, 1.5), z], rotation: [r() * 3, r() * 3, 0], scale: [2, 1, 1.4], color: '#5e483c', jitter: 0.1 });
  }
  for (const side of [-1, 1]) ctx.colliders.add({ x: side * 4.3, z: 4.5, w: 1.6, d: 12, bottom: -2, top: 6 });
  ctx.colliders.add({ x: 0, z: 10, w: 8, d: 1.6, bottom: -2, top: 6 });
  const floor = new THREE.CircleGeometry(1, 8).rotateX(-Math.PI / 2);
  solid.add(floor, { position: [0, ctx.heightAt(0, 5) + 0.05, 5], scale: [3.6, 1, 6], color: '#3a2e28', jitter: 0.08 });
  for (let i = 0; i < 10; i++) {
    const x = r.range(-3, 3), z = r.range(1, 9);
    solid.add(new THREE.DodecahedronGeometry(r.range(0.15, 0.35), 0), { position: [x, ctx.heightAt(x, z) + 0.05, z], rotation: [r() * 3, r() * 3, 0], color: '#5a4a40' });
  }
  solid.box(0.9, 0.3, 1.8, { position: [-1.6, ctx.heightAt(-1.6, 9) + 0.15, 9], color: '#4a3a2e' });
  solid.add(new THREE.CylinderGeometry(0.16, 0.2, 0.4, 7), { position: [-1.7, ctx.heightAt(-1.7, 7.4) + 0.2, 7.4], color: '#8a5a38' });
}

function shatteredRocks(ctx) {
  const { THREE, solid, rand: r } = ctx;
  for (let i = 0; i < 26; i++) {
    const a = r.range(-Math.PI * 0.95, -Math.PI * 0.05), d = r.range(6, 40);
    const x = Math.cos(a) * d, z = -4 + Math.sin(a) * d;
    const size = r.range(0.6, 2);
    const y = ctx.heightAt(x, z);
    for (let k = 0; k < 3; k++) {
      solid.add(new THREE.TetrahedronGeometry(size, 0), {
        position: [x + r.range(-1.2, 1.2) * size, y + size * 0.3, z + r.range(-1.2, 1.2) * size],
        rotation: [r() * 3, r() * 3, r() * 3],
        scale: [r.range(0.8, 1.6), r.range(0.5, 1.2), r.range(0.6, 1.2)],
        color: k ? '#7d6250' : '#9a7a62',
        jitter: 0.08,
      });
    }
  }
}

// Long faint ribbons the passing wind leaves behind, drifting slowly.
function windTrails(ctx) {
  const { THREE } = ctx;
  const count = 26;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: '#c8c4e0', transparent: true, opacity: 0.35, depthWrite: false }), count);
  const seeds = Array.from({ length: count }, () => [ctx.rand.range(-60, 60), ctx.rand.range(-70, -10), ctx.rand.range(1, 14), ctx.rand.range(3, 9), ctx.rand()]);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    seeds.forEach(([x, z, y, len, off], i) => {
      const f = (off + t * 0.03) % 1;
      p.set(x + (f - 0.5) * 120, y + Math.sin(t * 0.5 + off * 9) * 0.5, z);
      s.set(len * Math.sin(f * Math.PI), 1, 1);
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

export default {
  title: '1 Kings 19:9-13: The still small voice',
  seed: 32,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.35, 0.18, -0.9], color: '#ffc8a0', intensity: 1.6 },
  light: { sky: '#8a90c8', ground: '#7a6a70', hemi: 1.4 },
  sky: { top: '#141a36', horizon: '#c9a0a0', ground: '#5a4a52', sunColor: '#ffd8b0', glow: 0.9 },
  fog: { color: '#6a6078', near: 40, far: 460 },
  clouds: { count: 50, shadow: '#2a2a40', lit: '#b88a90', rim: '#ffe0c8', distance: [240, 900], altitude: [80, 220], hole: 0.4, seed: 32 },
  mountains: { count: 40, color: '#4a3e44', radius: [460, 700], height: [60, 170], haze: 0.45 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.55, shadowTint: '#1e2050', highlightTint: '#ffe0c0' },
  shadow: { center: [0, -6], radius: 45 },

  player: { start: [-0.6, 6], yaw: 0.04, pitch: 0.04, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 32,
    hills: 80,
    bumps: 0.5,
    flats: [
      { x: 0, z: -300, r: 140, falloff: 140, height: -50 },
      { x: 0, z: 60, r: 22, falloff: 36, height: 30 },
      { x: 0, z: -14, r: 34, falloff: 40, height: 0 },
    ],
    colors: { ground: '#7a5c4a', groundAlt: '#6a5042', grass: '#6e5a48', high: '#8a6a56', rock: '#5e4a40' },
    patches: [{ x: 0, z: 6, r: 5, color: '#3a2e28', strength: 0.7 }],
  },

  objects: [
    { type: 'crack', path: [[-30, -40], [-14, -24], [-4, -12], [2, -6]], width: 0.8, branches: 4 },
    { type: 'crack', path: [[30, -18], [16, -22], [6, -34], [10, -60]], width: 1, branches: 3 },
    { type: 'smolder', x: -9, z: -20, radius: 3, smoke: 10, height: 18 },
    { type: 'smolder', x: 10, z: -30, radius: 2.4, smoke: 8, height: 14 },
    { type: 'tree', x: -9, z: -16, kind: 'burnt', h: 5 },
    { type: 'tree', x: 11, z: -28, kind: 'burnt', h: 6 },
    { type: 'tree', x: -20, z: -30, kind: 'burnt', h: 4 },
  ],

  scatter: [
    { type: 'rock', count: 50, center: [0, -30], ring: [12, 200], spacing: 6, seed: 3, props: { color: '#7a5e4c' } },
    { type: 'rubble', count: 30, center: [0, -10], ring: [4, 50], seed: 5, props: { color: '#806450', count: 6, radius: 2.4 } },
    { type: 'tree', count: 18, center: [0, -40], ring: [20, 120], spacing: 8, seed: 6, props: { kind: 'burnt' } },
  ],

  effects: [
    { type: 'beam', at: [0.4, -1.4], height: 120, radiusBottom: 1.4, radiusTop: 5, color: '#e8e8ff', opacity: 0.28 },
    { type: 'motes', at: [0.4, -1.4], radius: 3, height: 14, count: 90, color: '#f0eeff', size: 0.04 },
  ],

  custom(ctx) {
    cave(ctx);
    shatteredRocks(ctx);
    windTrails(ctx);
    fire(ctx, { x: -9, z: -20, radius: 1, height: 1.2, count: 9, seed: 2, lightIntensity: 40, lightDistance: 24 });
    fire(ctx, { x: 10, z: -30, radius: 0.7, height: 0.8, count: 7, seed: 3, lightIntensity: 20, lightDistance: 18 });
    fire(ctx, { x: -24, z: -44, radius: 1.6, height: 2, count: 10, seed: 4, lightIntensity: 50, lightDistance: 30 });
    figure(ctx, { x: ELIJAH[0], z: ELIJAH[1], yaw: Math.PI + 0.15, robe: '#6b5038', mantle: '#3e3026', hood: true, skin: '#9b6a46', arms: 'face', scale: 1.05 });
    const lamp = new ctx.THREE.PointLight('#d8d8ff', 18, 18, 1.3);
    lamp.position.set(0, 2.6, 0.5);
    ctx.scene.add(lamp);
  },
};
