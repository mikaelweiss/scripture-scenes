import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export function lowest(ctx, x, z, w, d, rot = 0) {
  const at = frame(x, z, rot);
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) h = Math.min(h, ctx.heightAt(...at(lx, lz)));
  return h;
}

export const standAt = (ctx, x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });

export function box(ctx, { x, y, z, w, h, d, rot = 0, tilt = [0, 0], color, jitter = 0.05, collide = true, glow = false }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: glow ? undefined : darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Flat-roofed stone house, door on local +z. Windows glow when `lit`.
export function house(ctx, s) {
  const r = ctx.rand;
  const { x, z, rot = 0, w = 8, d = 7, h = 4, color = '#d9c9a3', trim = '#b8a47e', door = '#3b2b20', lit = false, upper = r() < 0.4, windowColor = '#ffb456' } = s;
  const at = frame(x, z, rot);
  const y0 = lowest(ctx, x, z, w, d, rot) - 0.3;
  const top = y0 + h + 0.3;
  box(ctx, { x, z, y: y0, w, h: h + 0.3, d, rot, color });
  for (const [lx, lz, ww, dd] of [[0, d / 2 - 0.15, w, 0.3], [0, -d / 2 + 0.15, w, 0.3], [w / 2 - 0.15, 0, 0.3, d], [-w / 2 + 0.15, 0, 0.3, d]]) {
    const [px, pz] = at(lx, lz);
    box(ctx, { x: px, z: pz, y: top, w: ww, h: 0.45, d: dd, rot, color: trim, collide: false });
  }
  const [dx, dz] = at(w * 0.15, d / 2 + 0.02);
  box(ctx, { x: dx, z: dz, y: y0 + 0.3, w: 1.1, h: 2.1, d: 0.12, rot, color: door, collide: false });
  const wins = Math.max(1, Math.floor(w / 3.5));
  for (let i = 0; i < wins; i++) {
    const lx = -w / 2 + (i + 0.5) * (w / wins);
    if (Math.abs(lx - w * 0.15) < 1) continue;
    const [wx, wz] = at(lx, d / 2 + 0.02);
    box(ctx, { x: wx, z: wz, y: y0 + h * 0.62, w: 0.55, h: 0.7, d: 0.1, rot, color: lit && r() < 0.6 ? windowColor : '#3a2c22', collide: false, glow: lit });
  }
  for (let i = 0; i < Math.floor(w / 1.4); i++) {
    const [bx, bz] = at(-w / 2 + 0.7 + i * 1.4, d / 2 + 0.2);
    ctx.solid.box(0.16, 0.16, 0.5, { position: [bx, top - 0.5, bz], rotation: [0, rot, 0], color: '#6a4c34' });
  }
  if (upper) {
    const uw = w * 0.45, ud = d * 0.5;
    const [ux, uz] = at(-w / 2 + uw / 2 + 0.3, -d / 2 + ud / 2 + 0.3);
    box(ctx, { x: ux, z: uz, y: top, w: uw, h: h * 0.7, d: ud, rot, color });
    const [wx, wz] = at(-w / 2 + uw / 2 + 0.3, -d / 2 + ud + 0.32);
    box(ctx, { x: wx, z: wz, y: top + h * 0.3, w: 0.5, h: 0.6, d: 0.1, rot, color: lit ? windowColor : '#3a2c22', collide: false, glow: lit });
  }
  return { top, at };
}

// City wall along a path with crenellations and square towers at the corners.
export function cityWall(ctx, { path, h = 8, thick = 2.4, color = '#cbb994', towers = true, gaps = [] }) {
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const rot = Math.atan2(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 4));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      if (gaps.some((g) => Math.hypot(g[0] - x, g[1] - z) < g[2])) continue;
      const y = ctx.heightAt(x, z) - 1;
      box(ctx, { x, z, y, w: thick, h: h + 1, d: len / n + 0.02, rot, color });
      for (const off of [-0.25, 0.25]) {
        const [cx, cz] = [x + Math.sin(rot) * off * (len / n), z + Math.cos(rot) * off * (len / n)];
        box(ctx, { x: cx + Math.cos(rot) * thick * 0.35, z: cz - Math.sin(rot) * thick * 0.35, y: y + h + 1, w: thick * 0.3, h: 0.9, d: (len / n) * 0.3, rot, color, collide: false });
      }
    }
  }
  if (towers) {
    for (const [x, z] of path) {
      const y = ctx.heightAt(x, z) - 1;
      box(ctx, { x, z, y, w: thick * 2.6, h: h + 4, d: thick * 2.6, rot: 0, color });
      box(ctx, { x, z, y: y + h + 4, w: thick * 2.9, h: 0.6, d: thick * 2.9, rot: 0, color: '#b3a07c', collide: false });
    }
  }
}

// Gabled tent of striped panels, open dark doorway facing local +z.
export function tent(ctx, s) {
  const { x, z, rot = 0, w = 5, d = 6, h = 2.6, color = '#4a3a30', stripe = '#8a6a48', panels = 5, inner = '#1e1611', flap = true } = s;
  const y = lowest(ctx, x, z, w, d, rot) - 0.05;
  const at = frame(x, z, rot);
  const pos = [];
  const slab = (z0, z1) => {
    const BL = [-w / 2, 0, z0], FL = [-w / 2, 0, z1], BR = [w / 2, 0, z0], FR = [w / 2, 0, z1], B = [0, h, z0], F = [0, h, z1];
    return [...BL, ...FL, ...F, ...BL, ...F, ...B, ...FR, ...BR, ...B, ...FR, ...B, ...F];
  };
  for (let i = 0; i < panels; i++) {
    const z0 = -d / 2 + (i * d) / panels, z1 = -d / 2 + ((i + 1) * d) / panels;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(slab(z0, z1), 3));
    ctx.solid.add(geo, { position: [x, y, z], rotation: [0, rot, 0], color: i % 2 ? stripe : color, jitter: 0.04 });
  }
  const tri = (pts, col, scale = 1) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
    ctx.solid.add(geo, { position: [x, y, z], rotation: [0, rot, 0], color: col, jitter: 0.03 });
  };
  tri([[w / 2, 0, -d / 2], [-w / 2, 0, -d / 2], [0, h, -d / 2]], color);
  tri([[-w / 2 + 0.3, 0, d / 2 - 0.5], [w / 2 - 0.3, 0, d / 2 - 0.5], [0, h - 0.4, d / 2 - 0.5]], inner);
  if (flap) {
    tri([[-w / 2, 0, d / 2], [-w * 0.18, 0, d / 2 + 0.6], [-w * 0.12, h * 0.85, d / 2 - 0.1]], stripe);
    tri([[w * 0.18, 0, d / 2 + 0.6], [w / 2, 0, d / 2], [w * 0.12, h * 0.85, d / 2 - 0.1]], stripe);
  }
  for (const lz of [d / 2 + 0.15, -d / 2 - 0.15]) {
    const [px, pz] = at(0, lz);
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, h + 0.4, 5), { position: [px, y + (h + 0.4) / 2, pz], color: '#5b4330' });
  }
  ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Campfire: stone ring, logs, flickering flames, a point light and thin smoke.
export function fire(ctx, { x, z, scale = 1, light = 14, distance = 16, smoke = 8, color = '#ffa040' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * scale, 0), { position: [x + Math.cos(a) * 0.6 * scale, y + 0.08, z + Math.sin(a) * 0.6 * scale], color: '#6d6258', jitter: 0.1 });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.07, 0.9 * scale, 5), { position: [x, y + 0.18 * scale, z], rotation: [1.15, a, 0], color: '#3d2a1c' });
  }
  ctx.glow.add(new THREE.CircleGeometry(0.45 * scale, 7).rotateX(-Math.PI / 2), { position: [x, y + 0.05, z], color: '#ff5a10' });
  const group = new THREE.Group();
  const mat = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: 0.92 });
  const flames = [['#ff6a1a', 0.42, 1.1], ['#ffa63a', 0.3, 0.85], ['#ffe18a', 0.16, 0.55]].map(([c, rad, hh]) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad * scale, hh * scale, 5).translate(0, (hh * scale) / 2, 0), mat(c));
    group.add(m);
    return m;
  });
  group.position.set(x, y + 0.1, z);
  ctx.scene.add(group);
  const pl = light ? new THREE.PointLight(color, light, distance, 1.6) : null;
  if (pl) {
    pl.position.set(x, y + 1.2 * scale, z);
    ctx.scene.add(pl);
  }
  const ph = r() * 10;
  ctx.onFrame((t) => {
    flames.forEach((f, i) => {
      const k = 1 + Math.sin(t * (9 + i * 3) + ph + i) * 0.12 + Math.sin(t * 23 + i * 2 + ph) * 0.06;
      f.scale.set(1, k, 1);
      f.rotation.y = t * (0.8 + i * 0.5);
    });
    if (pl) pl.intensity = light * (0.85 + Math.sin(t * 13 + ph) * 0.08 + Math.sin(t * 29 + ph) * 0.07);
  });
  if (smoke) ctx.effects.smoke({ position: [x, y + 1, z], count: smoke, height: 9, size: 0.35 * scale, color: '#7a726c', seed: Math.floor(r() * 1e6) });
  return { y };
}

// Torch or lamp on a pole, with an optional light.
export function torch(ctx, { x, z, y, h = 2.4, light = 8, distance = 12 }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.07, h, 5), { position: [x, base + h / 2, z], color: '#4a3424' });
  ctx.glow.add(new THREE.ConeGeometry(0.16, 0.5, 5), { position: [x, base + h + 0.25, z], color: '#ffb04a' });
  ctx.glow.add(new THREE.ConeGeometry(0.08, 0.3, 5), { position: [x, base + h + 0.35, z], color: '#fff0b0' });
  if (light) {
    const pl = new THREE.PointLight('#ffa850', light, distance, 1.6);
    pl.position.set(x, base + h + 0.5, z);
    ctx.scene.add(pl);
    const ph = x * 3.1 + z;
    ctx.onFrame((t) => (pl.intensity = light * (0.88 + Math.sin(t * 11 + ph) * 0.07 + Math.sin(t * 27 + ph) * 0.05)));
  }
}

// Faceted animated water surface covering a rectangle.
export function water(ctx, { x, z, w, d, y, rot = 0, color = '#3f7f95', opacity = 0.88, amp = 0.12, seg = 2.5, shininess = 70 }) {
  const geo = new THREE.PlaneGeometry(w, d, Math.max(2, Math.round(w / seg)), Math.max(2, Math.round(d / seg)));
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + (Math.random() - 0.5) * seg * 0.4, 0, p.getZ(i) + (Math.random() - 0.5) * seg * 0.4);
  const time = { value: 0 };
  const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess, specular: '#d8ecff', transparent: opacity < 1, opacity });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.y += (sin(position.x * 0.45 + uTime * 1.3) + cos(position.z * 0.6 + uTime * 0.9) + sin((position.x + position.z) * 0.9 + uTime * 2.1) * 0.5) * ${amp.toFixed(3)};`);
  };
  const mesh = new THREE.Mesh(geo.toNonIndexed(), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

// Water ribbon following a path at a fixed height.
export function river(ctx, { path, width = 5, y = -0.6, color = '#4a8496', opacity = 0.9, amp = 0.06 }) {
  const pos = [];
  const pts = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 2));
    for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  pts.push(path[path.length - 1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const nx = -(bz - az) / len, nz = (bx - ax) / len;
    const hw = width / 2;
    const A = [ax + nx * hw, 0, az + nz * hw], B = [ax - nx * hw, 0, az - nz * hw], C = [bx + nx * hw, 0, bz + nz * hw], D = [bx - nx * hw, 0, bz - nz * hw];
    const M = [(ax + bx) / 2, 0, (az + bz) / 2];
    pos.push(...A, ...M, ...C, ...A, ...B, ...M, ...B, ...D, ...M, ...M, ...D, ...C);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const time = { value: 0 };
  const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 80, specular: '#d8ecff', transparent: true, opacity, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.y += (sin(position.x * 0.8 + uTime * 2.2) + cos(position.z * 0.7 - uTime * 2.6)) * ${amp.toFixed(3)};`);
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

// Terrain flats that carve a channel along a path.
export function channelFlats(path, { r = 3, falloff = 4, depth = 1.4, step = 3 } = {}) {
  const out = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) out.push({ x: ax + ((bx - ax) * k) / n, z: az + ((bz - az) * k) / n, r, falloff, height: -depth });
  }
  const [lx, lz] = path[path.length - 1];
  out.push({ x: lx, z: lz, r, falloff, height: -depth });
  return out;
}

export function camel(ctx, { x, z, rot = 0, color = '#b48a5a', sitting = false }) {
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  const lift = sitting ? 0.35 : 1.25;
  const add = (geo, lx, ly, lz, opts = {}) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(geo, { position: [px, y + ly, pz], rotation: [opts.tilt ?? 0, rot, opts.roll ?? 0], scale: opts.scale ?? [1, 1, 1], color: opts.color ?? color, jitter: 0.06 });
  };
  add(new THREE.BoxGeometry(0.75, 0.7, 1.7), 0, lift + 0.35, 0);
  add(new THREE.DodecahedronGeometry(0.42, 0), 0, lift + 0.8, -0.1, { scale: [0.9, 0.9, 1.2] });
  add(new THREE.BoxGeometry(0.28, 0.95, 0.3), 0, lift + 0.85, 1.05, { tilt: 0.6 });
  add(new THREE.BoxGeometry(0.28, 0.3, 0.6), 0, lift + 1.3, 1.45);
  add(new THREE.BoxGeometry(0.8, 0.12, 0.9), 0, lift + 0.72, -0.05, { color: '#7a3a2a' });
  if (sitting) {
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.2, 0.25, 1.5), s * 0.42, 0.12, 0.1);
  } else {
    for (const [lx, lz] of [[-0.25, 0.65], [0.25, 0.65], [-0.25, -0.65], [0.25, -0.65]]) add(new THREE.BoxGeometry(0.16, 1.3, 0.18), lx, 0.65, lz);
  }
  ctx.colliders.add({ x, z, w: 0.9, d: 2.4, rot, bottom: y, top: y + lift + 1.6 });
}

export function goat(ctx, { x, z, rot = 0, color = '#8a7a66', horns = '#3a2e24', scale = 1 }) {
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  const add = (geo, lx, ly, lz, opts = {}) => {
    const [px, pz] = at(lx * scale, lz * scale);
    ctx.solid.add(geo, { position: [px, y + ly * scale, pz], rotation: [opts.tilt ?? 0, rot, opts.roll ?? 0], scale: [scale, scale, scale], color: opts.color ?? color, jitter: 0.06 });
  };
  add(new THREE.BoxGeometry(0.4, 0.4, 0.9), 0, 0.75, 0);
  add(new THREE.BoxGeometry(0.2, 0.45, 0.22), 0, 1.0, 0.5, { tilt: 0.5 });
  add(new THREE.BoxGeometry(0.18, 0.2, 0.36), 0, 1.22, 0.66);
  for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.04, 0.5, 4), s * 0.07, 1.45, 0.55, { tilt: -0.9, color: horns });
  for (const [lx, lz] of [[-0.13, 0.33], [0.13, 0.33], [-0.13, -0.33], [0.13, -0.33]]) add(new THREE.BoxGeometry(0.08, 0.6, 0.08), lx, 0.3, lz);
}

export function jar(ctx, { x, z, y, size = 0.5, color = '#a8673e' }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(size * 0.35, size * 0.3, size, 7), { position: [x, base + size / 2, z], color });
  ctx.solid.add(new THREE.CylinderGeometry(size * 0.18, size * 0.32, size * 0.25, 7), { position: [x, base + size * 1.1, z], color });
}

// A bundle or sack.
export function bundle(ctx, { x, z, y, size = 0.6, color = '#9a8462' }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.DodecahedronGeometry(size * 0.5, 0), { position: [x, base + size * 0.35, z], rotation: [0, ctx.rand() * 3, 0], scale: [1, 0.75, 0.9], color });
}

// A hand-placed person built from the engine's crowd parts.
export function person(ctx, f) {
  const y = (f.y ?? standAt(ctx, f.x, f.z)) - (f.kneel ? 0.48 : 0);
  const g = createFigure({ ...f, y });
  if (f.yaw !== undefined) g.rotation.y = f.yaw;
  ctx.scene.add(g);
  if (!f.ghost) ctx.colliders.add({ x: f.x, z: f.z, w: 0.6, d: 0.6, bottom: y, top: y + 1.8 * (f.scale ?? 1) });
  return g;
}

export function stars(ctx, { count = 1400, seed = 7, color = '#e8eeff', size = 1.6 }) {
  const pos = [];
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, y = Math.pow(rnd(), 0.6) * 0.95 + 0.04;
    const r = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * r * 1300, y * 1300, Math.sin(a) * r * 1300);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
  pts.renderOrder = -9;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, cam) => pts.position.copy(cam.position));
  return pts;
}

let discTexture;
function disc() {
  if (discTexture) return discTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.32, 'rgba(255,255,255,1)');
  grad.addColorStop(0.36, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  discTexture = new THREE.CanvasTexture(c);
  discTexture.colorSpace = THREE.SRGBColorSpace;
  return discTexture;
}

export function moon(ctx, { dir, size = 90, color = '#eef2ff' }) {
  const v = new THREE.Vector3(...dir).normalize().multiplyScalar(1200);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc(), color, fog: false, depthWrite: false, toneMapped: false }));
  sp.scale.set(size, size, 1);
  sp.renderOrder = -8;
  ctx.scene.add(sp);
  ctx.onFrame((t, dt, cam) => sp.position.copy(cam.position).add(v));
  return sp;
}

// Low drifting banks of mist made of translucent faceted puffs.
export function mist(ctx, { x, z, w = 30, d = 30, count = 60, color = '#3a3440', opacity = 0.5, height = [0.5, 4], size = [2, 5], seed = 4, drift = 0.3 }) {
  let s = seed * 7919;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.4, transparent: true, opacity, depthWrite: false, flatShading: true });
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat, count);
  const seeds = Array.from({ length: count }, () => [x + (rnd() - 0.5) * w, z + (rnd() - 0.5) * d, height[0] + rnd() * (height[1] - height[0]), size[0] + rnd() * (size[1] - size[0]), rnd() * 6]);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const place = (t) => {
    seeds.forEach(([px, pz, py, sz, ph], i) => {
      p.set(px + Math.sin(t * 0.1 * drift + ph) * 2, ctx.heightAt(px, pz) + py + Math.sin(t * 0.3 + ph) * 0.3, pz + Math.cos(t * 0.08 * drift + ph) * 2);
      sc.set(sz * 1.4, sz * 0.55, sz);
      q.setFromEuler(e.set(0, ph + t * 0.02, 0));
      mesh.setMatrixAt(i, m.compose(p, q, sc));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place(0);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  ctx.scene.add(mesh);
  let acc = 0;
  ctx.onFrame((t, dt) => {
    acc += dt;
    if (acc > 0.1) {
      acc = 0;
      place(t);
    }
  });
  return mesh;
}

// Bow as a partial torus arc in the solid batch. `broken` leaves two snapped halves.
export function bow(ctx, { x, y, z, rot = 0, tilt = 0, color = '#6a4a2a', broken = false, size = 0.65, string = true }) {
  if (broken) {
    const half = new THREE.TorusGeometry(size, 0.025, 4, 6, Math.PI * 0.42);
    ctx.solid.add(half, { position: [x, y, z], rotation: [-Math.PI / 2, rot, 0], color, jitter: 0.02 });
    ctx.solid.add(half, { position: [x + 0.35, y, z + 0.25], rotation: [-Math.PI / 2, rot + 2.4, 0], color, jitter: 0.02 });
    return;
  }
  ctx.solid.add(new THREE.TorusGeometry(size, 0.03, 4, 10, Math.PI * 0.9).rotateZ(Math.PI * 0.05), { position: [x, y, z], rotation: [tilt, rot, 0], color, jitter: 0.02 });
  if (string) ctx.solid.add(new THREE.CylinderGeometry(0.008, 0.008, size * 1.95, 3).rotateZ(Math.PI / 2), { position: [x, y + size * 0.15, z], rotation: [tilt, rot, 0], color: '#d8c8a0', jitter: 0 });
}

// Rocky ridge: big faceted boulders stacked along a path, bounding a valley.
export function ridge(ctx, { path, size = [8, 18], color = '#8a6a52', step = 9, height = 1 }) {
  const r = ctx.rand;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) {
      const x = ax + ((bx - ax) * k) / n + r.range(-3, 3), z = az + ((bz - az) * k) / n + r.range(-3, 3);
      const sz = r.range(size[0], size[1]);
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), {
        position: [x, y + sz * 0.3 * height, z],
        rotation: [r.range(-0.3, 0.3), r() * 6, r.range(-0.3, 0.3)],
        scale: [sz * r.range(0.8, 1.2), sz * r.range(0.6, 1.1) * height, sz * r.range(0.8, 1.2)],
        color,
        jitter: 0.08,
        shade: darkenBottom,
      });
      ctx.colliders.add({ x, z, w: sz * 1.4, d: sz * 1.4, bottom: y - 5, top: y + sz * 1.2 * height });
    }
  }
}
