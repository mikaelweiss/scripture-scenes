// Shared props for the Nativity and early-ministry scenes (nt-01 to nt-06).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createFigure, parts } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export function block(ctx, { x, y, z, w, h, d, rot = 0, tilt = 0, color, jitter = 0.04, collide = true, batch }) {
  (batch ?? ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt, rot, 0], color, jitter, shade: darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function lowest(ctx, x, z, w, d, rot) {
  const at = frame(x, z, rot);
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) h = Math.min(h, ctx.heightAt(...at(lx, lz)));
  return h;
}

// Flat-roofed village house of plastered stone. The door faces local +z.
export function house(ctx, s) {
  const r = ctx.rand;
  const { x, z, rot = 0, w = 6, d = 5, h = 3, color = '#cdb894', trim = '#9c8466', door = 1.2, doorH = 2, roof = true, windows = true, lit = false, upper = false } = s;
  const at = frame(x, z, rot);
  const y0 = s.y ?? lowest(ctx, x, z, w, d, rot) - 0.1;
  const t = 0.45;
  const wall = (lx, lz, ww, dd, hh = h, yy = y0) => {
    const [px, pz] = at(lx, lz);
    block(ctx, { x: px, y: yy, z: pz, w: ww, h: hh, d: dd, rot, color, jitter: 0.05 });
  };
  wall(0, -d / 2 + t / 2, w, t);
  wall(-w / 2 + t / 2, 0, t, d - 2 * t);
  wall(w / 2 - t / 2, 0, t, d - 2 * t);
  const side = (w - door) / 2;
  const off = s.doorOffset ?? 0;
  wall(-w / 2 + (side + off) / 2, d / 2 - t / 2, side + off, t);
  wall(w / 2 - (side - off) / 2, d / 2 - t / 2, side - off, t);
  const [lx, lz] = at(off, d / 2 - t / 2);
  ctx.solid.box(door + 0.1, h - doorH, t, { position: [lx, y0 + doorH + (h - doorH) / 2, lz], rotation: [0, rot, 0], color });
  ctx.solid.box(door + 0.5, 0.18, t + 0.16, { position: [lx, y0 + doorH + 0.09, lz], rotation: [0, rot, 0], color: '#5a4330' });
  const [fx, fz] = at(0, 0);
  ctx.solid.box(w - 0.2, 0.1, d - 0.2, { position: [fx, y0 + 0.05, fz], rotation: [0, rot, 0], color: '#5f4e3d' });
  if (roof) {
    ctx.solid.box(w + 0.3, 0.3, d + 0.3, { position: [fx, y0 + h + 0.15, fz], rotation: [0, rot, 0], color: trim, shade: darkenBottom });
    for (const [px, pz, ww, dd] of [[0, -d / 2, w + 0.3, 0.25], [0, d / 2, w + 0.3, 0.25], [-w / 2, 0, 0.25, d], [w / 2, 0, 0.25, d]]) {
      const [qx, qz] = at(px, pz);
      ctx.solid.box(ww, 0.45, dd, { position: [qx, y0 + h + 0.5, qz], rotation: [0, rot, 0], color });
    }
    const beams = Math.max(2, Math.round(w / 1.2));
    for (let i = 0; i < beams; i++) {
      const [bx, bz] = at(-w / 2 + 0.5 + (i * (w - 1)) / (beams - 1), d / 2 + 0.2);
      ctx.solid.box(0.16, 0.16, 0.6, { position: [bx, y0 + h - 0.1, bz], rotation: [0, rot, 0], color: '#4e3a28' });
    }
  }
  if (upper) {
    const uw = w * 0.5, ud = d * 0.55;
    const [ux, uz] = at(-w / 4 + 0.1, -d / 4 + 0.1);
    block(ctx, { x: ux, y: y0 + h + 0.3, z: uz, w: uw, h: h * 0.8, d: ud, rot, color, collide: false });
    ctx.solid.box(uw + 0.3, 0.25, ud + 0.3, { position: [ux, y0 + h + 0.3 + h * 0.8 + 0.12, uz], rotation: [0, rot, 0], color: trim });
    const [wx, wz] = at(-w / 4 + 0.1, -d / 4 + 0.1 + ud / 2 + 0.02);
    ctx.solid.box(0.6, 0.7, 0.06, { position: [wx, y0 + h + 1.3, wz], rotation: [0, rot, 0], color: lit ? '#ffb45a' : '#2a2018', jitter: 0 });
  }
  if (windows) {
    for (const [px, pz, rr] of [[w / 2 + 0.02, r.range(-d / 4, d / 4), Math.PI / 2], [-w / 2 - 0.02, r.range(-d / 4, d / 4), Math.PI / 2], [r.range(-w / 4, w / 4), -d / 2 - 0.02, 0]]) {
      if (r() < 0.35) continue;
      const [qx, qz] = at(px, pz);
      (lit ? ctx.glow : ctx.solid).box(0.5, 0.55, 0.08, { position: [qx, y0 + h * 0.62, qz], rotation: [0, rot + rr, 0], color: lit ? '#ffae55' : '#2a2018', jitter: 0.03 });
    }
  }
  if (lit) {
    const [qx, qz] = at(off, d / 2 - t / 2 - 0.05);
    ctx.glow.box(door - 0.05, doorH - 0.05, 0.05, { position: [qx, y0 + doorH / 2, qz], rotation: [0, rot, 0], color: '#a8632a', jitter: 0.02 });
  }
  return { y0, top: y0 + h };
}

// Animals face local +z. Each part: [w, h, d, lx, ly, lz, tilt, colorKey].
const ANIMALS = {
  sheep: { colors: { body: '#e6dfcf', dark: '#3a302a' }, parts: [
    ['ico', 0.42, 0.34, 0.55, 0, 0.52, 0, 0, 'body'],
    [0.2, 0.22, 0.3, 0, 0.68, 0.5, 0.4, 'dark'],
    [0.07, 0.36, 0.07, -0.16, 0.18, 0.28, 0, 'dark'], [0.07, 0.36, 0.07, 0.16, 0.18, 0.28, 0, 'dark'],
    [0.07, 0.36, 0.07, -0.16, 0.18, -0.28, 0, 'dark'], [0.07, 0.36, 0.07, 0.16, 0.18, -0.28, 0, 'dark'],
  ] },
  lamb: { colors: { body: '#f0ebdf', dark: '#4a3e36' }, parts: [
    ['ico', 0.42, 0.32, 0.55, 0, 0.3, 0, 0, 'body'],
    [0.2, 0.22, 0.3, 0, 0.4, 0.52, 0.2, 'dark'],
  ] },
  donkey: { colors: { body: '#7d7066', dark: '#3b332e', light: '#b8aea2' }, parts: [
    [0.5, 0.5, 1.15, 0, 0.95, 0, 0, 'body'],
    [0.26, 0.6, 0.3, 0, 1.3, 0.6, 0.6, 'body'],
    [0.24, 0.24, 0.55, 0, 1.55, 0.92, 0.5, 'body'],
    [0.16, 0.14, 0.18, 0, 1.45, 1.15, 0.5, 'light'],
    [0.06, 0.32, 0.08, -0.08, 1.85, 0.78, -0.2, 'dark'], [0.06, 0.32, 0.08, 0.08, 1.85, 0.78, -0.2, 'dark'],
    [0.11, 0.72, 0.11, -0.17, 0.36, 0.42, 0, 'dark'], [0.11, 0.72, 0.11, 0.17, 0.36, 0.42, 0, 'dark'],
    [0.11, 0.72, 0.11, -0.17, 0.36, -0.42, 0, 'dark'], [0.11, 0.72, 0.11, 0.17, 0.36, -0.42, 0, 'dark'],
    [0.06, 0.5, 0.06, 0, 0.85, -0.6, 0.3, 'dark'],
  ] },
  ox: { colors: { body: '#7a5236', dark: '#3a271b', light: '#d9cfb8' }, parts: [
    [0.75, 0.75, 1.5, 0, 1.05, 0, 0, 'body'],
    [0.45, 0.45, 0.55, 0, 1.15, 0.95, 0.35, 'body'],
    [0.32, 0.25, 0.25, 0, 1.0, 1.2, 0.35, 'dark'],
    [0.7, 0.07, 0.07, 0, 1.38, 0.95, 0, 'light'],
    [0.15, 0.7, 0.15, -0.25, 0.35, 0.55, 0, 'dark'], [0.15, 0.7, 0.15, 0.25, 0.35, 0.55, 0, 'dark'],
    [0.15, 0.7, 0.15, -0.25, 0.35, -0.55, 0, 'dark'], [0.15, 0.7, 0.15, 0.25, 0.35, -0.55, 0, 'dark'],
  ] },
  oxLying: { colors: { body: '#7a5236', dark: '#3a271b', light: '#d9cfb8' }, parts: [
    [0.85, 0.6, 1.5, 0, 0.3, 0, 0, 'body'],
    [0.42, 0.42, 0.5, 0, 0.62, 0.92, 0.2, 'body'],
    [0.3, 0.24, 0.25, 0, 0.5, 1.18, 0.2, 'dark'],
    [0.7, 0.07, 0.07, 0, 0.88, 0.9, 0, 'light'],
  ] },
  camel: { colors: { body: '#c49a68', dark: '#8a6a4a', light: '#d7b98c' }, parts: [
    [0.6, 0.6, 1.5, 0, 1.75, 0, 0, 'body'],
    ['ico', 0.4, 0.45, 0.5, 0, 2.1, -0.05, 0, 'light'],
    [0.22, 0.8, 0.26, 0, 2.05, 0.95, 0.9, 'body'],
    [0.2, 0.55, 0.22, 0, 2.55, 1.3, 0.15, 'body'],
    [0.2, 0.2, 0.5, 0, 2.8, 1.48, 0.15, 'body'],
    [0.12, 1.45, 0.12, -0.2, 0.72, 0.55, 0, 'dark'], [0.12, 1.45, 0.12, 0.2, 0.72, 0.55, 0, 'dark'],
    [0.12, 1.45, 0.12, -0.2, 0.72, -0.55, 0, 'dark'], [0.12, 1.45, 0.12, 0.2, 0.72, -0.55, 0, 'dark'],
    [0.78, 0.4, 0.7, 0, 2.02, 0.35, 0, 'saddle'],
  ] },
  camelKneel: { colors: { body: '#c49a68', dark: '#8a6a4a', light: '#d7b98c' }, parts: [
    [0.7, 0.6, 1.5, 0, 0.55, 0, 0, 'body'],
    ['ico', 0.4, 0.45, 0.5, 0, 0.95, -0.05, 0, 'light'],
    [0.22, 0.8, 0.26, 0, 0.95, 0.95, 0.7, 'body'],
    [0.2, 0.5, 0.22, 0, 1.45, 1.3, 0.15, 'body'],
    [0.2, 0.2, 0.5, 0, 1.68, 1.48, 0.15, 'body'],
    [0.86, 0.4, 0.7, 0, 0.82, 0.35, 0, 'saddle'],
  ] },
};

export function animal(ctx, kind, { x, z, rot = 0, y, scale = 1, colors = {}, batch }) {
  const spec = ANIMALS[kind];
  const pal = { ...spec.colors, saddle: '#8a2e2a', ...colors };
  const at = frame(x, z, rot);
  const base = y ?? ctx.heightAt(x, z);
  const target = batch ?? ctx.solid;
  for (const p of spec.parts) {
    const ico = p[0] === 'ico';
    const [w, h, d, lx, ly, lz, tilt, key] = ico ? p.slice(1) : p;
    const [px, pz] = at(lx * scale, lz * scale);
    const geo = ico ? new THREE.IcosahedronGeometry(1, 0) : new THREE.BoxGeometry(1, 1, 1);
    target.add(geo, { position: [px, base + ly * scale, pz], rotation: [tilt, rot, 0], scale: ico ? [w * scale, h * scale, d * scale] : [w * scale, h * scale, d * scale], color: pal[key], jitter: 0.06, shade: darkenBottom });
  }
  if (kind !== 'lamb' && kind !== 'sheep') ctx.colliders.add({ x, z, w: 0.9 * scale, d: 1.8 * scale, rot, bottom: base, top: base + 1.4 * scale });
}

export function flock(ctx, { center, radius, count, seed = 4, avoid = [], lying = 0.4 }) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid.some((v) => Math.hypot(x - v[0], z - v[1]) < v[2])) continue;
    animal(ctx, r() < lying ? 'lamb' : 'sheep', { x, z, rot: r() * Math.PI * 2, scale: r.range(0.85, 1.1) });
  }
}

let glowTex;
export function glowTexture() {
  if (glowTex) return glowTex;
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false };

// A soft pool of light lying on the ground.
export function groundGlow(ctx, { x, z, y, radius = 6, color = '#ffe8b0', opacity = 0.6 }) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: glowTexture(), color, opacity, ...additive }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, (y ?? ctx.heightAt(x, z)) + 0.08, z);
  ctx.scene.add(mesh);
  return mesh;
}

export function sprite(ctx, { position, size = 4, color = '#fff6dc', opacity = 0.8 }) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, opacity, ...additive }));
  s.position.set(...position);
  s.scale.set(size, size, 1);
  ctx.scene.add(s);
  return s;
}

// A single heavenly messenger: white, faceless under a hood, softly lit.
export function angel(ctx, { x, y, z, face, scale = 1.1, arms = 'out', light = 0, halo = 5, glow = 0.7 }) {
  const fig = createFigure({ x, y, z, face, scale, robe: '#fffcf3', mantle: '#f7f1e2', skin: '#fff4e0', arms, emissive: glow, hood: true });
  ctx.scene.add(fig);
  if (halo) ctx.effects.halo({ position: [x, y + 1.25 * scale, z], size: halo, opacity: 0.6, color: '#fff3d6' });
  if (light) {
    const l = new THREE.PointLight('#fff0cf', light, 30, 1.4);
    l.position.set(x, y + 2, z + 0.6);
    ctx.scene.add(l);
  }
  return fig;
}

// A host of angels as one instanced mesh with a glow point at each.
export function host(ctx, { points, scale = 1.1, color = '#fff8ea', glowSize = 6, glowOpacity = 0.55, face }) {
  const geo = mergeGeometries([parts.robe(), parts.arms('out'), parts.hood(), parts.head()].map((g) => (g.index ? g.toNonIndexed() : g)));
  const mat = new THREE.MeshLambertMaterial({ color, vertexColors: true, emissive: color, emissiveIntensity: 0.75 });
  const mesh = new THREE.InstancedMesh(geo, mat, points.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(scale, scale, scale);
  const up = new THREE.Vector3(0, 1, 0);
  const yaws = points.map(([x, , z]) => Math.atan2(face[0] - x, face[1] - z));
  const place = (t) => {
    points.forEach(([x, y, z], i) => {
      p.set(x, y + Math.sin(t * 0.6 + i * 1.7) * 0.4, z);
      q.setFromAxisAngle(up, yaws[i]);
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place(0);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  const pos = new Float32Array(points.length * 3);
  points.forEach(([x, y, z], i) => pos.set([x, y + 1.2 * scale, z], i * 3));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTexture(), color: '#fff2d0', size: glowSize, sizeAttenuation: true, opacity: glowOpacity, ...additive }));
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t) => place(t));
  return mesh;
}

export function starfield(ctx, { count = 1600, seed = 9, size = 2.2, minY = 0.02, color = '#ffffff' } = {}) {
  const r = rng(seed);
  const pos = [];
  const cols = [];
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, y = r.range(minY, 1) ** 0.8;
    const rr = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * rr * 1200, y * 1200, Math.sin(a) * rr * 1200);
    c.set(color).multiplyScalar(r.range(0.35, 1));
    cols.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, ...additive }));
  pts.renderOrder = -9;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
  return pts;
}

// Campfire with flickering flames and light.
export function fire(ctx, { x, z, y, size = 1, light = 30, smoke = true }) {
  const r = ctx.rand;
  const base = y ?? ctx.heightAt(x, z);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * size, 0), { position: [x + Math.cos(a) * 0.6 * size, base + 0.08, z + Math.sin(a) * 0.6 * size], scale: [1, 0.7, 1], color: '#6c625a' });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + r() * 0.3;
    ctx.solid.add(new THREE.CylinderGeometry(0.06 * size, 0.07 * size, 0.9 * size, 5), { position: [x, base + 0.12, z], rotation: [Math.PI / 2 - 0.2, a, 0], color: '#3b2a1c' });
  }
  ctx.glow.add(new THREE.CircleGeometry(0.45 * size, 7).rotateX(-Math.PI / 2), { position: [x, base + 0.1, z], color: '#ff6a1a' });
  const flames = [];
  const mat = new THREE.MeshBasicMaterial({ color: '#ffb347', ...additive, opacity: 0.95, fog: true });
  const mat2 = new THREE.MeshBasicMaterial({ color: '#ff6a20', ...additive, opacity: 0.9, fog: true });
  for (let i = 0; i < 5; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.18 * size, 0.8 * size, 5), i % 2 ? mat : mat2);
    const a = r() * Math.PI * 2, d = r() * 0.18 * size;
    f.position.set(x + Math.cos(a) * d, base + 0.45 * size, z + Math.sin(a) * d);
    ctx.scene.add(f);
    flames.push([f, r() * 6]);
  }
  const l = new THREE.PointLight('#ff9a48', light, 22 * size, 1.6);
  l.position.set(x, base + 1.1, z);
  ctx.scene.add(l);
  ctx.onFrame((t) => {
    for (const [f, ph] of flames) {
      const k = 0.75 + 0.35 * Math.sin(t * 9 + ph) * Math.sin(t * 5.3 + ph * 2);
      f.scale.set(1, k, 1);
      f.position.y = base + 0.1 + 0.4 * size * k;
    }
    l.intensity = light * (0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 7.7));
  });
  if (smoke) ctx.effects.smoke({ position: [x, base + 1, z], count: 6, height: 9 * size, size: 0.35 * size, color: '#6b6460', seed: Math.floor(r() * 1e5) });
  ctx.colliders.add({ x, z, w: 1.4 * size, d: 1.4 * size, bottom: base, top: base + 1 });
}

// Small clay oil lamp with a warm point light.
export function lamp(ctx, { x, y, z, light = 6, distance = 9, color = '#ffad5a' }) {
  ctx.solid.add(new THREE.SphereGeometry(0.1, 6, 3), { position: [x, y + 0.04, z], scale: [1.3, 0.6, 1], color: '#8a5a3a' });
  ctx.glow.add(new THREE.ConeGeometry(0.035, 0.12, 5), { position: [x + 0.1, y + 0.12, z], color: '#ffd27a' });
  sprite(ctx, { position: [x + 0.1, y + 0.13, z], size: 0.7, color, opacity: 0.8 });
  if (light) {
    const l = new THREE.PointLight(color, light, distance, 1.5);
    l.position.set(x + 0.1, y + 0.4, z);
    ctx.scene.add(l);
  }
}

export function jar(ctx, { x, z, y, h = 0.7, color = '#a8673e' }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.12 * h, 0.16 * h, 0.2 * h, 7), { position: [x, base + 0.9 * h, z], color });
  ctx.solid.add(new THREE.SphereGeometry(0.35 * h, 7, 4), { position: [x, base + 0.42 * h, z], scale: [1, 1.2, 1], color });
}

export function palm(ctx, x, z, h) {
  ctx.builders.tree(ctx, { x, z, kind: 'palm', h: h ?? ctx.rand.range(6, 9), leaf: '#5c7a3a' });
}

export function olive(ctx, x, z, h) {
  ctx.builders.tree(ctx, { x, z, kind: 'broad', h: h ?? ctx.rand.range(3, 4.5), leaf: '#7e8c5f' });
}

export function cypress(ctx, x, z, h = 7) {
  const y = ctx.heightAt(x, z) - 0.1;
  ctx.solid.add(new THREE.ConeGeometry(0.9, h, 6), { position: [x, y + h / 2 + 0.6, z], color: '#3f5a33', jitter: 0.08 });
  ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.16, 1, 5), { position: [x, y + 0.5, z], color: '#4a3626' });
  ctx.colliders.add({ x, z, w: 0.8, d: 0.8, bottom: y, top: y + h });
}

export function shrub(ctx, x, z, size = 0.6, color = '#6a7840') {
  ctx.solid.add(new THREE.IcosahedronGeometry(size, 0), { position: [x, ctx.heightAt(x, z) + size * 0.4, z], scale: [1, 0.7, 1], rotation: [ctx.rand() * 3, ctx.rand() * 3, 0], color, jitter: 0.1 });
}

export function stoneWall(ctx, pts, { h = 1, thick = 0.6, color = '#9b8a72' } = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 1.4));
    const rot = Math.atan2(bx - ax, bz - az);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      const hh = h * ctx.rand.range(0.8, 1.1);
      block(ctx, { x, y: ctx.heightAt(x, z) - 0.15, z, w: thick, h: hh, d: len / n + 0.05, rot, color, jitter: 0.08 });
    }
  }
}
