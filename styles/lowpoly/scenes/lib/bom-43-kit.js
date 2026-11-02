import * as THREE from 'three';
import { createFigure, placeCrowd, createCrowd } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

const glowMat = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });

const WAVES = [
  [0.045, 0.02, 0.9, 1],
  [-0.03, 0.05, 1.3, 0.6],
  [0.11, -0.07, 2.1, 0.25],
  [0.21, 0.16, 3.1, 0.18],
];

// Height of the animated sea surface, matching the shader in `water`.
export function waveHeight(x, z, t, amp = 1, speed = 1) {
  let h = 0;
  for (const [kx, kz, w, a] of WAVES) h += Math.sin(x * kx + z * kz + t * w * speed) * a;
  return h * amp;
}

// Flat-shaded animated water plane. Returns the mesh.
export function water(ctx, { y = 0, size = 700, segments = 140, center = [0, 0], color = '#3f7480', opacity = 0.92, amp = 0.15, speed = 1, emissive = '#000000' }) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true, transparent: opacity < 1, opacity, emissive });
  const uTime = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    const terms = WAVES.map(([kx, kz, w, a]) => `sin(wp.x * ${kx.toFixed(3)} + wp.z * ${kz.toFixed(3)} + uTime * ${(w * speed).toFixed(3)}) * ${a.toFixed(3)}`).join(' + ');
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
        transformed.y += (${terms}) * ${amp.toFixed(3)};`);
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(center[0], y, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (uTime.value = t));
  return mesh;
}

// Flickering ring or pile of low-poly flames.
export function fire(ctx, { x, z, y, radius = 0.5, count = 10, height = 1.2, ring = false, colors = ['#ff8a2a', '#ffb347', '#ffd27a'], opacity = 0.85, seed = 1 }) {
  const rand = rng(seed);
  const base = y ?? ctx.heightAt(x, z);
  const geo = new THREE.ConeGeometry(0.25, 1, 4).translate(0, 0.5, 0);
  const meshes = colors.map((c) => {
    const m = new THREE.InstancedMesh(geo, glowMat(c, opacity), count);
    m.frustumCulled = false;
    ctx.scene.add(m);
    return m;
  });
  const flames = Array.from({ length: count }, (_, i) => {
    const a = ring ? (i / count) * Math.PI * 2 : rand() * Math.PI * 2;
    const d = ring ? radius : Math.sqrt(rand()) * radius;
    return { x: x + Math.cos(a) * d, z: z + Math.sin(a) * d, s: rand.range(0.6, 1.1), ph: rand() * 10, mesh: i % meshes.length, spin: rand() * 3 };
  });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const idx = meshes.map(() => 0);
  const update = (t) => {
    idx.fill(0);
    for (const f of flames) {
      const k = 0.75 + 0.25 * Math.sin(t * 9 + f.ph) * Math.sin(t * 5.3 + f.ph * 2);
      p.set(f.x, base, f.z);
      s.set(f.s * (1.1 - k * 0.3), height * f.s * k, f.s * (1.1 - k * 0.3));
      q.setFromEuler(e.set(0, f.spin + t, 0));
      meshes[f.mesh].setMatrixAt(idx[f.mesh]++, m.compose(p, q, s));
    }
    meshes.forEach((mesh, i) => {
      mesh.count = idx[i];
      mesh.instanceMatrix.needsUpdate = true;
    });
  };
  update(0);
  ctx.onFrame(update);
  return { base };
}

// A faceless being in white with soft light, optionally floating and bobbing.
export function angel(ctx, { x, z, y, face, scale = 1.1, arms = 'out', light = 18, halo = 4.5, bob = 0.25, phase = 0 }) {
  const fy = y ?? ctx.heightAt(x, z);
  const fig = createFigure({ x, y: fy, z, face, scale, robe: '#fbf8f0', mantle: '#f1ece0', skin: '#f6efe2', arms, emissive: 0.55 });
  ctx.scene.add(fig);
  const sprite = halo ? ctx.effects.halo({ position: [x, fy + 1.3 * scale, z], size: halo, opacity: 0.55, color: '#fff4dc' }) : null;
  let lamp = null;
  if (light) {
    lamp = new THREE.PointLight('#fff1d2', light, 14, 1.5);
    lamp.position.set(x, fy + 2, z + 0.5);
    ctx.scene.add(lamp);
  }
  if (bob) {
    ctx.onFrame((t) => {
      const dy = Math.sin(t * 0.8 + phase) * bob;
      fig.position.y = fy + dy;
      if (sprite) sprite.position.y = fy + 1.3 * scale + dy;
    });
  }
  return fig;
}

// A plain person figure (single named character).
export function person(ctx, { x, z, y, face, robe = '#8b6b4a', mantle, skin = '#9b6a46', arms = 'down', scale = 1, hood = false, kneel = false }) {
  const fy = (y ?? ctx.heightAt(x, z)) - (kneel ? 0.48 : 0);
  const fig = createFigure({ x, y: fy, z, face, scale, robe, mantle, skin, arms, hood });
  ctx.scene.add(fig);
  ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: fy, top: fy + 1.8 * scale });
  return fig;
}

// Places and adds an instanced crowd directly, returning the placed people (for props like spears).
export function crowd(ctx, palette, groups) {
  const time = { value: 0 };
  const people = placeCrowd(groups.map((g) => ({ palette, ...g })), ctx.heightAt, (x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 }));
  ctx.scene.add(createCrowd(people, time));
  ctx.onFrame((t) => (time.value = t));
  return people;
}

// Instanced thin spears held upright beside each person.
export function spears(ctx, people, { color = '#4a3a2a', tip = '#9a9488', length = 2.6, every = 1 } = {}) {
  const list = people.filter((_, i) => i % every === 0);
  const shaft = new THREE.CylinderGeometry(0.025, 0.025, length, 4).translate(0, length / 2, 0);
  const point = new THREE.ConeGeometry(0.06, 0.3, 4).translate(0, length + 0.15, 0);
  const mk = (geo, c) => {
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: c }), list.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((p, i) => {
      const ox = Math.cos(p.yaw) * 0.28 * p.scale, oz = -Math.sin(p.yaw) * 0.28 * p.scale;
      q.setFromEuler(e.set(0.08 * Math.sin(i), p.yaw, 0.08 * Math.cos(i * 1.7)));
      m.compose(new THREE.Vector3(p.x + ox, p.y + 0.1, p.z + oz), q, new THREE.Vector3(1, p.scale, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  };
  mk(shaft, color);
  mk(point, tip);
}

// A pole with a hanging cloth banner, static in the solid batch.
export function banner(ctx, { x, z, h = 5, color = '#a83a2a', trim = '#e0c070', rot = 0, w = 1.2, d = 1.8 }) {
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.08, h, 5), { position: [x, y + h / 2, z], color: '#4a3826' });
  const c = Math.cos(rot), s = Math.sin(rot);
  const ox = (w / 2 + 0.05) * c, oz = -(w / 2 + 0.05) * s;
  ctx.solid.box(w, d, 0.05, { position: [x + ox, y + h - d / 2 - 0.2, z + oz], rotation: [0, rot, 0], color, jitter: 0.04 });
  ctx.solid.box(w, 0.18, 0.07, { position: [x + ox, y + h - 0.25, z + oz], rotation: [0, rot, 0], color: trim });
  ctx.solid.add(new THREE.OctahedronGeometry(0.16, 0), { position: [x, y + h + 0.1, z], color: trim });
}

// A woven basket of bread loaves.
export function breadBasket(ctx, { x, z, y, size = 1 }) {
  const by = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.32 * size, 0.24 * size, 0.24 * size, 8, 1, false), { position: [x, by + 0.12 * size, z], color: '#8a6438', jitter: 0.1 });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7;
    ctx.solid.add(new THREE.SphereGeometry(0.12 * size, 6, 3), { position: [x + Math.cos(a) * 0.12 * size, by + 0.26 * size, z + Math.sin(a) * 0.12 * size], scale: [1.2, 0.6, 0.9], color: '#c99350', jitter: 0.06 });
  }
}

// A simple cup.
export function cup(ctx, { x, z, y, color = '#9a7a52', wine = '#6a1d2a' }) {
  const cy = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.09, 0.06, 0.18, 7), { position: [x, cy + 0.09, z], color });
  ctx.solid.add(new THREE.CircleGeometry(0.08, 7).rotateX(-Math.PI / 2), { position: [x, cy + 0.175, z], color: wine, jitter: 0 });
}

// A tent: four-sided pyramid of cloth on a short wall.
export function tent(ctx, { x, z, rot = 0, w = 4, h = 3, color = '#c9b48e' }) {
  const y = ctx.heightAt(x, z) - 0.1;
  ctx.solid.add(new THREE.ConeGeometry(w * 0.72, h, 4), { position: [x, y + h / 2, z], rotation: [0, rot + Math.PI / 4, 0], color, jitter: 0.06 });
  ctx.colliders.add({ x, z, w: w * 0.9, d: w * 0.9, rot, bottom: y, top: y + h });
}

// Simple intact flat-roofed house with a door and roof edge.
export function house(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3.4, color = '#d8c6a4', trim = '#9c8466', roof = '#b39a76', door = '#5a4030' }) {
  const y = Math.min(ctx.heightAt(x, z), ctx.heightAt(x + w / 2, z + d / 2), ctx.heightAt(x - w / 2, z - d / 2)) - 0.2;
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter: 0.03 });
  ctx.solid.box(w + 0.4, 0.35, d + 0.4, { position: [x, y + h + 0.17, z], rotation: [0, rot, 0], color: trim });
  ctx.solid.box(w - 0.6, 0.3, d - 0.6, { position: [x, y + h + 0.45, z], rotation: [0, rot, 0], color: roof });
  const [dx, dz] = at(0, d / 2 + 0.02);
  ctx.solid.box(1.1, 2, 0.08, { position: [dx, y + 1.2, dz], rotation: [0, rot, 0], color: door, jitter: 0 });
  for (const side of [-1, 1]) {
    const [wx, wz] = at(side * w * 0.3, d / 2 + 0.02);
    ctx.solid.box(0.7, 0.6, 0.08, { position: [wx, y + 2.1, wz], rotation: [0, rot, 0], color: '#3e3026', jitter: 0 });
  }
  ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h + 0.6 });
}
