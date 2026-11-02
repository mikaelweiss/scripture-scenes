import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

function seeded(seed) {
  let s = (seed * 7919) % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export const standAt = (ctx, x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });

export function box(ctx, { x, y, z, w, h, d, rot = 0, tilt = [0, 0], color, jitter = 0.05, collide = true, glow = false }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: glow ? undefined : darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

export function stone(ctx, { x, z, y, size = 1, color = '#8a7a68', collide = false }) {
  const r = ctx.rand;
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), {
    position: [x, base + size * 0.25, z],
    rotation: [r.range(-0.4, 0.4), r() * 6, r.range(-0.4, 0.4)],
    scale: [size * r.range(0.8, 1.3), size * r.range(0.5, 0.9), size * r.range(0.8, 1.2)],
    color,
    jitter: 0.08,
    shade: darkenBottom,
  });
  if (collide) ctx.colliders.add({ x, z, w: size * 1.6, d: size * 1.6, bottom: base - 2, top: base + size * 0.9 });
}

// A hand-placed person built from the engine's crowd parts.
export function person(ctx, f) {
  const y = (f.y ?? standAt(ctx, f.x, f.z)) - (f.kneel ? 0.48 : 0);
  const g = createFigure({ ...f, y });
  if (f.yaw !== undefined) g.rotation.y = f.yaw;
  (f.parent ?? ctx.scene).add(g);
  if (!f.ghost) ctx.colliders.add({ x: f.x, z: f.z, w: 0.6, d: 0.6, bottom: y, top: y + 1.8 * (f.scale ?? 1) });
  return g;
}

// A divine messenger: faceless white figure with soft light and a halo.
export function angel(ctx, { x, z, y, face, scale = 1.1, arms = 'out', light = 40, distance = 24, halo = 5, float = 0 }) {
  const base = (y ?? standAt(ctx, x, z)) + float;
  const g = person(ctx, { x, z, y: base, face, scale, robe: '#fbf8f0', mantle: '#f2ecde', skin: '#f4ead8', arms, emissive: 0.55, ghost: float > 0 });
  if (light) {
    const pl = new THREE.PointLight('#fff2d6', light, distance, 1.4);
    pl.position.set(x, base + 2.2, z);
    ctx.scene.add(pl);
  }
  if (halo) ctx.effects.halo({ position: [x, base + 1.3 * scale, z], size: halo, opacity: 0.6, color: '#fff3d6' });
  const t0 = x + z;
  if (float) ctx.onFrame((t) => (g.position.y = base + Math.sin(t * 0.8 + t0) * 0.12));
  return g;
}

// Star dome that follows the camera. `below` fills the lower sky too, for scenes set among the stars.
export function stars(ctx, { count = 1600, seed = 7, color = '#e8eeff', size = 1.6, below = false, opacity = 0.9, tints = null }) {
  const rnd = seeded(seed);
  const pos = [], col = [];
  const palette = (tints ?? [color]).map((c) => new THREE.Color(c));
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const y = below ? rnd() * 2 - 1 : Math.pow(rnd(), 0.6) * 0.95 + 0.04;
    const r = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * r * 1300, y * 1300, Math.sin(a) * r * 1300);
    const c = palette[Math.floor(rnd() * palette.length)].clone().multiplyScalar(0.55 + rnd() * 0.45);
    col.push(c.r, c.g, c.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ vertexColors: true, size, sizeAttenuation: false, fog: false, transparent: true, opacity, depthWrite: false, toneMapped: false }));
  pts.renderOrder = -9;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, cam) => pts.position.copy(cam.position));
  return pts;
}

// A glowing star in the sky: faceted core plus soft halos. Fixed to the camera so it reads as infinitely far.
export function skyOrb(ctx, { dir, distance = 1100, size = 30, color = '#fff4d8', core = '#ffffff', halo = 4, spin = 0.05 }) {
  const v = new THREE.Vector3(...dir).normalize().multiplyScalar(distance);
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size * 0.28, 1), new THREE.MeshBasicMaterial({ color: core, fog: false, toneMapped: false }));
  group.add(mesh);
  const sprites = [halo, halo * 0.45].map((k, i) => {
    const sp = ctx.effects.halo({ position: [0, 0, 0], size: size * k, color, opacity: i ? 0.9 : 0.5 });
    ctx.scene.remove(sp);
    sp.material.fog = false;
    group.add(sp);
    return sp;
  });
  group.renderOrder = -7;
  ctx.scene.add(group);
  ctx.onFrame((t, dt, cam) => {
    group.position.copy(cam.position).add(v);
    mesh.rotation.y = t * spin;
    mesh.rotation.x = t * spin * 0.6;
  });
  return { group, sprites };
}

// Campfire or altar fire with animated flame cones, a flickering light, and smoke.
export function fire(ctx, { x, z, y, scale = 1, light = 14, distance = 16, smoke = 8, ring = true }) {
  const r = ctx.rand;
  const base = y ?? ctx.heightAt(x, z);
  if (ring) {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * scale, 0), { position: [x + Math.cos(a) * 0.6 * scale, base + 0.08, z + Math.sin(a) * 0.6 * scale], color: '#6d6258', jitter: 0.1 });
    }
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    ctx.solid.add(new THREE.CylinderGeometry(0.06 * scale, 0.07 * scale, 0.9 * scale, 5), { position: [x, base + 0.18 * scale, z], rotation: [1.15, a, 0], color: '#3d2a1c' });
  }
  ctx.glow.add(new THREE.CircleGeometry(0.45 * scale, 7).rotateX(-Math.PI / 2), { position: [x, base + 0.05, z], color: '#ff5a10' });
  const group = new THREE.Group();
  const mat = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: 0.92 });
  const flames = [['#ff6a1a', 0.42, 1.1], ['#ffa63a', 0.3, 0.85], ['#ffe18a', 0.16, 0.55]].map(([c, rad, hh]) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad * scale, hh * scale, 5).translate(0, (hh * scale) / 2, 0), mat(c));
    group.add(m);
    return m;
  });
  group.position.set(x, base + 0.1, z);
  ctx.scene.add(group);
  const pl = light ? new THREE.PointLight('#ffa040', light, distance, 1.6) : null;
  if (pl) {
    pl.position.set(x, base + 1.2 * scale, z);
    ctx.scene.add(pl);
  }
  const ph = r() * 10;
  ctx.onFrame((t) => {
    flames.forEach((f, i) => {
      f.scale.set(1, 1 + Math.sin(t * (9 + i * 3) + ph + i) * 0.12 + Math.sin(t * 23 + i * 2 + ph) * 0.06, 1);
      f.rotation.y = t * (0.8 + i * 0.5);
    });
    if (pl) pl.intensity = light * (0.85 + Math.sin(t * 13 + ph) * 0.08 + Math.sin(t * 29 + ph) * 0.07);
  });
  if (smoke) ctx.effects.smoke({ position: [x, base + 1, z], count: smoke, height: 9, size: 0.35 * scale, color: '#7a726c', seed: Math.floor(r() * 1e6) });
  return { y: base };
}

// Altar of rough stacked stones with a flat top. Returns the top height.
export function stoneAltar(ctx, { x, z, w = 1.8, d = 1.2, h = 1.0, color = '#8a7d6c', top = '#9a8c78' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.1;
  const rows = Math.max(2, Math.round(h / 0.32));
  for (let i = 0; i < rows; i++) {
    const n = Math.max(2, Math.round(w / 0.55));
    for (let k = 0; k < n; k++) {
      for (const side of [-1, 1]) {
        ctx.solid.add(new THREE.DodecahedronGeometry(0.3, 0), {
          position: [x - w / 2 + (k + 0.5) * (w / n) + r.range(-0.05, 0.05), y + (i + 0.5) * (h / rows), z + side * (d / 2 - 0.2)],
          scale: [1.1, 0.75, 1],
          rotation: [r() * 3, r() * 3, r() * 3],
          color,
          jitter: 0.1,
        });
      }
    }
  }
  ctx.solid.box(w * 0.92, h, d * 0.8, { position: [x, y + h / 2, z], color, jitter: 0.08, shade: darkenBottom });
  ctx.solid.box(w + 0.15, 0.16, d + 0.1, { position: [x, y + h + 0.08, z], color: top, jitter: 0.06, shade: darkenBottom });
  ctx.colliders.add({ x, z, w: w + 0.2, d: d + 0.2, bottom: y, top: y + h + 0.16 });
  return y + h + 0.16;
}

export function sheep(ctx, { x, z, y, rot = 0, scale = 1, color = '#eeeae0', lying = false }) {
  const base = (y ?? ctx.heightAt(x, z)) + (lying ? -0.28 : 0) * scale;
  const fw = (l, h) => [x + Math.sin(rot) * l, base + h * scale, z + Math.cos(rot) * l];
  ctx.solid.add(new THREE.IcosahedronGeometry(0.42 * scale, 0), { position: fw(0, 0.62), rotation: [0, rot, 0], scale: [0.85, 0.75, 1.25], color, jitter: 0.05 });
  ctx.solid.add(new THREE.BoxGeometry(0.2, 0.22, 0.3), { position: fw(0.55 * scale, 0.78), rotation: [0.4, rot, 0], scale: [scale, scale, scale], color: '#3a3330', jitter: 0.04 });
  if (!lying) {
    for (const [lx, lz] of [[-0.15, 0.28], [0.15, 0.28], [-0.15, -0.28], [0.15, -0.28]]) {
      const px = x + (lx * Math.cos(rot) + lz * Math.sin(rot)) * scale, pz = z + (-lx * Math.sin(rot) + lz * Math.cos(rot)) * scale;
      ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.035, 0.4, 4), { position: [px, base + 0.2 * scale, pz], scale: [scale, scale, scale], color: '#3a3330' });
    }
  }
}

// A static layer of translucent faceted cloud puffs, e.g. a sea of cloud below a summit or a floor of heaven.
export function cloudLayer(ctx, { x = 0, z = 0, radius = 300, inner = 0, y = 40, count = 200, size = [10, 30], color = '#f4efe6', emissive = 0.35, opacity = 0.85, flat = 0.35, seed = 5 }) {
  const rnd = seeded(seed);
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: emissive, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, flatShading: true });
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(inner * inner + rnd() * (radius * radius - inner * inner));
    const sz = size[0] + rnd() * (size[1] - size[0]);
    p.set(x + Math.cos(a) * d, y + (rnd() - 0.5) * sz * 0.4, z + Math.sin(a) * d);
    s.set(sz * (1 + rnd() * 0.6), sz * flat, sz);
    q.setFromEuler(e.set(0, rnd() * 6, 0));
    mesh.setMatrixAt(i, m.compose(p, q, s));
  }
  mesh.renderOrder = 4;
  ctx.scene.add(mesh);
  return mesh;
}

// Breastplate with the two seer stones, worn by a figure at (x, y, z) facing yaw.
export function urimAndThummim(ctx, { x, y, z, yaw = 0, scale = 1 }) {
  const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
  const at = (side, up, fwd) => [x + rx * side * scale + fx * fwd * scale, y + up * scale, z + rz * side * scale + fz * fwd * scale];
  ctx.solid.box(0.3 * scale, 0.32 * scale, 0.04 * scale, { position: at(0, 1.18, 0.24), rotation: [0, yaw, 0], color: '#b8902e', jitter: 0.03 });
  for (const side of [-0.075, 0.075]) {
    ctx.glow.add(new THREE.OctahedronGeometry(0.06 * scale, 0), { position: at(side, 1.22, 0.28), color: '#cfeaff', jitter: 0.02 });
  }
  ctx.effects.halo({ position: at(0, 1.22, 0.32), size: 1.2 * scale, color: '#cfe6ff', opacity: 0.8 });
}
