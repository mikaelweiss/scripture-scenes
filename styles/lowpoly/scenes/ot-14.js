// Genesis 45:1-15: in his hall in Egypt, Joseph sends out his servants and makes himself known
// to his eleven brothers. The hall runs north (-z) to the dais. The player stands by the doors.
import * as THREE from 'three';
import { person, column, fire, block, frame } from './lib/ot-13-kit.js';

const W = 26, D = 40, H = 8, Z0 = -26, Z1 = 14;
const wallColor = '#d9c39a';
const blue = '#2f5f8a', red = '#a8452e', gold = '#d6a83a', green = '#4f7a52';

function hall(ctx) {
  const at = frame(0, 0, 0);
  const t = 0.8;
  const zc = (Z0 + Z1) / 2;
  block(ctx, at, 0, { lx: 0, lz: Z0 - t / 2, y: -0.2, w: W + 2 * t, h: H + 2, d: t, color: wallColor });
  block(ctx, at, 0, { lx: 0, lz: Z1 + t / 2, y: -0.2, w: W + 2 * t, h: H + 2, d: t, color: wallColor });
  for (const s of [-1, 1]) {
    block(ctx, at, 0, { lx: s * (W / 2 + t / 2), lz: zc, y: -0.2, w: t, h: H, d: D, color: wallColor });
    for (let z = Z0; z <= Z1; z += 4) block(ctx, at, 0, { lx: s * (W / 2 + t / 2), lz: z, y: H - 0.2, w: t, h: 2.2, d: 1.2, color: wallColor, collide: false });
    // painted friezes along the side walls
    for (const [y, hh, c] of [[0, 0.9, '#7a5a3a'], [0.9, 0.12, gold], [H - 1.4, 0.35, blue], [H - 1.05, 0.15, red], [H - 0.9, 0.35, green]]) {
      ctx.solid.box(0.06, hh, D, { position: [s * (W / 2 - 0.02), y + hh / 2, zc], color: c, jitter: 0.04 });
    }
    // simple painted processions: rows of upright figures on the walls
    for (let i = 0; i < 16; i++) {
      const z = Z0 + 3 + i * 2.3;
      const fx = s * (W / 2 - 0.03);
      ctx.solid.box(0.05, 1.3, 0.45, { position: [fx, 2.6, z], color: i % 3 === 0 ? '#e8e0c8' : i % 3 === 1 ? '#9a5a3a' : '#e8e0c8', jitter: 0.04 });
      ctx.solid.box(0.05, 0.3, 0.28, { position: [fx, 3.45, z], color: '#2a2420', jitter: 0.02 });
      if (i % 4 === 1) ctx.solid.box(0.05, 0.6, 1.2, { position: [fx, 4.6, z + 1.1], color: i % 8 === 1 ? blue : gold, jitter: 0.04 });
    }
  }
  ctx.solid.box(W + 3, 0.6, D + 3, { position: [0, H + 2.1, zc], color: '#a08a68' });
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(W - 2, 0.2, D - 2), new THREE.MeshLambertMaterial({ color: '#3e6aa6', emissive: '#1c3866' }));
  ceiling.position.set(0, H + 1.7, zc);
  ctx.scene.add(ceiling);
  for (let i = 0; i < 40; i++) {
    const a = ctx.rand() * Math.PI * 2, r = ctx.rand.range(0, 1);
    ctx.glow.add(new THREE.OctahedronGeometry(0.12, 0), { position: [ctx.rand.range(-W / 2 + 2, W / 2 - 2), H + 1.58, ctx.rand.range(Z0 + 2, Z1 - 2)], color: '#f0d27a', jitter: 0.05 });
  }
  // floor of polished slabs, darker aisle runner down the middle
  for (let x = -W / 2 + 1; x < W / 2; x += 2) {
    for (let z = Z0 + 1; z < Z1; z += 2) {
      ctx.solid.box(1.94, 0.2, 1.94, { position: [x, 0.0, z], color: (Math.round(x / 2) + Math.round(z / 2)) % 2 ? '#cbb790' : '#bfa982', jitter: 0.03 });
    }
  }
  ctx.solid.box(2.6, 0.05, D - 10, { position: [0, 0.12, zc + 3], color: '#5a2a20', jitter: 0.03 });
  ctx.solid.box(2.1, 0.06, D - 10, { position: [0, 0.13, zc + 3], color: '#7a3a28', jitter: 0.03 });
  // great doors behind the player
  for (const s of [-1, 1]) ctx.solid.box(2, 4.6, 0.3, { position: [s * 1.02, 2.3, Z1 - 0.1], color: '#6a4a2c', jitter: 0.04 });
  ctx.solid.box(4.8, 0.5, 0.4, { position: [0, 4.8, Z1 - 0.1], color: gold });
}

function dais(ctx) {
  const z = Z0 + 4.5;
  for (let i = 0; i < 3; i++) block(ctx, frame(0, z - i * 0.6, 0), 0, { lx: 0, lz: 0, y: 0, w: 12 - i * 2, h: 0.35 * (i + 1), d: 6 - i * 1.4, color: i === 2 ? '#e2d2ae' : '#c8b088' });
  const y = 1.05;
  ctx.solid.box(1.6, 0.6, 1.3, { position: [0, y + 0.3, z - 1.4], color: gold });
  ctx.solid.box(1.6, 2.0, 0.25, { position: [0, y + 1.0, z - 2.0], color: gold });
  ctx.solid.box(1.2, 1.4, 0.1, { position: [0, y + 1.2, z - 1.86], color: blue });
  for (const s of [-1, 1]) {
    ctx.solid.box(0.2, 0.9, 1.3, { position: [s * 0.8, y + 0.75, z - 1.4], color: gold });
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6), { position: [s * 3.4, y + 1.6, z - 1.5], color: '#6a4a2c' });
    ctx.solid.add(new THREE.ConeGeometry(0.9, 0.5, 8, 1, true).rotateX(Math.PI), { position: [s * 3.4, y + 3.3, z - 1.5], color: '#3a8a6a' });
  }
  // a hanging banner behind the dais
  ctx.solid.box(6, 5, 0.1, { position: [0, 4.4, Z0 + 0.1], color: blue, jitter: 0.02 });
  ctx.solid.box(5.4, 0.3, 0.12, { position: [0, 6.2, Z0 + 0.12], color: gold });
  ctx.glow.add(new THREE.CircleGeometry(1.1, 16), { position: [0, 4.8, Z0 + 0.2], color: '#e8b440', jitter: 0 });
  for (const s of [-1, 1]) ctx.solid.box(0.4, 3.4, 0.12, { position: [s * 1.8, 3.8, Z0 + 0.14], color: gold });
}

function brazier(ctx, x, z) {
  ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.25, 1.1, 6), { position: [x, 0.55, z], color: '#6a5030' });
  ctx.solid.add(new THREE.CylinderGeometry(0.6, 0.35, 0.4, 8), { position: [x, 1.25, z], color: '#b08a40' });
  ctx.colliders.add({ x, z, w: 1.2, d: 1.2, bottom: 0, top: 1.4 });
  fire(ctx, { x, z, y: 1.35, size: 0.55, light: 18, distance: 18 });
}

// Light falling through the clerestory gaps.
function shafts(ctx, sunDir) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uColor: { value: new THREE.Color('#ffdca0') } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; varying vec2 vUv; void main() { float a = sin(vUv.x * 3.14159) * smoothstep(0.0, 0.6, vUv.y) * 0.11; gl_FragColor = vec4(uColor * a, 1.0); }`,
  });
  const dir = new THREE.Vector3(...sunDir).normalize();
  for (let z = Z0 + 4; z < Z1 - 2; z += 4) {
    const len = 13;
    const geo = new THREE.PlaneGeometry(1.0, len).translate(0, -len / 2, 0);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(W / 2, H + 1, z);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().negate());
    m.renderOrder = 5;
    ctx.scene.add(m);
  }
}

export default {
  title: 'Genesis 45:1-15: Joseph reveals himself',
  seed: 45,
  fov: 54,
  exposure: 1.05,

  sun: { direction: [0.62, 0.72, 0.1], color: '#ffd8a0', intensity: 3.2 },
  light: { sky: '#e0c8a0', ground: '#a8865a', hemi: 1.2 },
  sky: { top: '#6a8ac0', horizon: '#f0d8b0', ground: '#c8a878', sunColor: '#ffe0b0', glow: 1 },
  fog: { color: '#6a5038', near: 40, far: 160 },
  bloom: { strength: 0.5, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.08, vignette: 0.45, shadowTint: '#3a2a40', highlightTint: '#ffe2b0' },
  shadow: { center: [0, (Z0 + Z1) / 2], radius: 30 },

  player: { start: [0.3, -0.2], yaw: 0.0, pitch: 0.02, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 400,
    segments: 60,
    seed: 45,
    hills: 4,
    bumps: 0,
    flats: [{ x: 0, z: -6, r: 40, falloff: 30, height: 0 }],
    colors: { ground: '#b8a07a', groundAlt: '#b09870', grass: '#b8a07a', rock: '#a08a68' },
  },

  custom(ctx) {
    hall(ctx);
    dais(ctx);
    for (const s of [-1, 1]) for (let z = Z0 + 4; z <= Z1 - 4; z += 6) column(ctx, { x: s * 7, z, y: 0.1, h: H + 1.8, r: 0.75, band: blue, band2: red });
    brazier(ctx, -4, Z0 + 9);
    brazier(ctx, 4, Z0 + 9);
    brazier(ctx, -5, 1.5);
    brazier(ctx, 5, 1.5);
    shafts(ctx, [0.62, 0.72, 0.1]);

    const J = [0, -9];
    const spot = new THREE.PointLight('#ffe2b0', 14, 9, 1.4);
    spot.position.set(0.5, 3.2, -6.5);
    ctx.scene.add(spot);
    // Joseph, in Egyptian linen and a gold collar, weeping with arms open: "I am Joseph."
    person(ctx, { x: J[0], z: J[1], face: [0, 0], robe: '#f2ede0', skin: '#a87652', arms: 'open', collar: gold, nemes: '#d8b850', belt: gold, scale: 1.04, emissive: 0.05 });
    // Benjamin, the youngest, closest to him.
    person(ctx, { x: 1.3, z: -8.2, face: J, robe: '#7a8a5a', mantle: '#c4b090', skin: '#b5835e', arms: 'open', scale: 0.96 });
    const brothers = [
      [-2.6, -6.4, 'stand', 'face', '#8b6b4a', '#5a3d2b'],
      [-1.6, -4.4, 'kneel', 'down', '#a0825c', null],
      [2.2, -5.0, 'kneel', 'forward', '#7a4e36', '#3f4d5e'],
      [3.2, -6.6, 'stand', 'face', '#6e5a44', '#8a7a5a'],
      [-4.4, -4.6, 'stand', 'down', '#94704e', '#556246'],
      [4.6, -3.6, 'kneel', 'down', '#5e4b3a', '#a34f32'],
      [-3.6, -2.4, 'stand', 'face', '#b59a72', '#6d3b2e'],
      [-5.4, -6.8, 'kneel', 'face', '#6b6f4a', null],
      [3.4, -2.0, 'stand', 'open', '#9a4a34', '#5a3d2b'],
      [5.6, -6.0, 'stand', 'down', '#4f5a6b', '#8a7a5a'],
    ];
    for (const [x, z, pose, arms, robe, mantle] of brothers) {
      person(ctx, { x, z, face: J, robe, mantle, pose, arms, hood: ctx.rand() < 0.4, skin: ctx.rand.pick(['#8a5a3c', '#9b6a46', '#a87652']) });
    }
    // gifts and grain sacks the brothers brought
    for (let i = 0; i < 6; i++) {
      const x = -9 + (i % 3) * 0.9, z = 4 + Math.floor(i / 3) * 0.9;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.4, 0), { position: [x, 0.35, z], scale: [1, 1.2, 1], color: '#c8b088', jitter: 0.08 });
    }
    ctx.colliders.add({ x: -8.1, z: 4.45, w: 2.6, d: 1.8, bottom: 0, top: 0.9 });
  },
};
