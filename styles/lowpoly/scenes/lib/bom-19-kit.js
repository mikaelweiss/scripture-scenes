// Props shared by bom-19 through bom-24: sleepers, animals, camps, fire, houses, walls, water, clouds, stars.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function rng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + next() * (hi - lo);
  next.pick = (list) => list[Math.floor(next() * list.length)];
  return next;
}

// Maps local (lx, lz) around an anchor rotated by `rot` to world (x, z), matching three.js rotation.y.
export function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);

function box(ctx, w, h, d, position, rot, color, { tilt = [0, 0], collide = false, batch = ctx.solid, jitter = 0.05 } = {}) {
  batch.box(w, h, d, { position, rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: darkenBottom });
  if (collide) ctx.colliders.add({ x: position[0], z: position[2], w, d, rot, bottom: position[1] - h / 2, top: position[1] + h / 2 });
}

// A person lying on the ground, head toward local +z.
export function sleeper(ctx, x, z, rot, { robe = '#7a4e36', skin = '#8a5a3c', mantle, scale = 1, y, side = 0 } = {}) {
  const base = y ?? ctx.heightAt(x, z);
  const at = frame(x, z, rot);
  const s = scale;
  const [bx, bz] = at(0, 0);
  ctx.solid.add(new THREE.CylinderGeometry(0.17 * s, 0.27 * s, 1.3 * s, 7), { position: [bx, base + 0.2 * s, bz], rotation: [Math.PI / 2, rot, side], color: robe, shade: darkenBottom });
  if (mantle) {
    const [mx, mz] = at(0, 0.35 * s);
    ctx.solid.add(new THREE.CylinderGeometry(0.21 * s, 0.3 * s, 0.6 * s, 7), { position: [mx, base + 0.22 * s, mz], rotation: [Math.PI / 2, rot, side], color: mantle, shade: darkenBottom });
  }
  const [hx, hz] = at(0, 0.8 * s);
  ctx.solid.add(new THREE.IcosahedronGeometry(0.13 * s, 0), { position: [hx, base + 0.15 * s, hz], rotation: [0, rot, 0], scale: [1, 1, 1.1], color: skin });
  for (const sd of [-1, 1]) {
    const [ax, az] = at(sd * 0.3 * s, 0.25 * s);
    ctx.solid.add(new THREE.CylinderGeometry(0.05 * s, 0.065 * s, 0.6 * s, 5), { position: [ax, base + 0.1 * s, az], rotation: [Math.PI / 2, rot + sd * 0.25, 0], color: mantle ?? robe });
  }
}

// Sheep, goat or cow facing local +z.
export function animal(ctx, x, z, rot, { kind = 'sheep', color, head, scale = 1, y, grazing = false } = {}) {
  const base = y ?? ctx.heightAt(x, z);
  const at = frame(x, z, rot);
  const k = kind === 'cow' ? 1.7 : kind === 'goat' ? 0.9 : 1;
  const s = scale * k;
  const body = color ?? (kind === 'sheep' ? '#e4dccb' : kind === 'goat' ? '#6e5440' : '#7d5638');
  const face = head ?? (kind === 'sheep' ? '#3a302b' : kind === 'goat' ? '#4a382c' : '#5e3f2a');
  const legH = 0.42 * s;
  ctx.solid.add(new THREE.IcosahedronGeometry(1, 0), {
    position: [x, base + legH + 0.2 * s, z],
    rotation: [0, rot, 0],
    scale: kind === 'sheep' ? [0.33 * s, 0.3 * s, 0.5 * s] : [0.24 * s, 0.25 * s, 0.5 * s],
    color: body,
    jitter: 0.06,
  });
  const [hx, hz] = at(0, 0.52 * s);
  const hy = grazing ? base + 0.25 * s : base + legH + 0.42 * s;
  ctx.solid.box(0.17 * s, 0.19 * s, 0.3 * s, { position: [hx, hy, hz], rotation: [grazing ? 0.7 : -0.2, rot, 0], color: face });
  if (kind !== 'sheep') {
    for (const sd of [-1, 1]) {
      const [ex, ez] = at(sd * 0.08 * s, 0.45 * s);
      ctx.solid.add(new THREE.ConeGeometry(0.03 * s, 0.22 * s, 4), { position: [ex, hy + 0.15 * s, ez], rotation: [-0.5, rot, sd * 0.3], color: '#d8ccb0' });
    }
  }
  for (const [lx, lz] of [[-0.13, 0.26], [0.13, 0.26], [-0.13, -0.26], [0.13, -0.26]]) {
    const [px, pz] = at(lx * s, lz * s);
    ctx.solid.box(0.07 * s, legH, 0.07 * s, { position: [px, base + legH / 2, pz], rotation: [0, rot, 0], color: face });
  }
}

// A loose flock of animals scattered around a point, mostly facing `heading`.
export function flock(ctx, { x, z, radius = 5, count = 12, heading = 0, spread = 0.6, kinds = ['sheep'], seed = 3, grazing = 0.3, avoid } = {}) {
  const r = rng(seed);
  const placed = [];
  for (let tries = 0; placed.length < count && tries < count * 40; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (placed.some(([qx, qz]) => Math.hypot(qx - px, qz - pz) < 0.9)) continue;
    if (avoid?.(px, pz)) continue;
    placed.push([px, pz]);
    animal(ctx, px, pz, heading + r.range(-spread, spread), { kind: r.pick(kinds), grazing: r() < grazing, scale: r.range(0.85, 1.1) });
  }
  return placed;
}

// Low pyramid tent of hides or cloth with a dark door flap toward local +z.
export function tent(ctx, x, z, rot, { color = '#a08664', size = 3, h = 2.4 } = {}) {
  const y = ctx.heightAt(x, z) - 0.05;
  ctx.solid.add(new THREE.ConeGeometry(size * 0.72, h, 4), { position: [x, y + h / 2, z], rotation: [0, rot + Math.PI / 4, 0], color, shade: darkenBottom });
  const [dx, dz] = frame(x, z, rot)(0, size * 0.36);
  ctx.solid.add(new THREE.ConeGeometry(0.45, 1.2, 3), { position: [dx, y + 0.6, dz], rotation: [0, rot, 0], scale: [1, 1, 0.3], color: '#2e241c' });
  ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4), { position: [x, y + h + 0.2, z], color: '#4a3424' });
  ctx.colliders.add({ x, z, w: size, d: size, rot, bottom: y, top: y + h });
}

// Stone ring, crossed logs, glowing embers, flickering flames and a warm point light.
export function campfire(ctx, x, z, { scale = 1, intensity = 40, distance = 22, color = '#ff9a4a', flames = true, smoke = 0 } = {}) {
  const y = ctx.heightAt(x, z);
  const r = ctx.rand;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * scale, 0), { position: [x + Math.cos(a) * 0.62 * scale, y + 0.07, z + Math.sin(a) * 0.62 * scale], rotation: [r() * 3, r() * 3, 0], color: '#5d554e' });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + 0.3;
    ctx.solid.add(new THREE.CylinderGeometry(0.06 * scale, 0.07 * scale, 0.95 * scale, 5), { position: [x, y + 0.12, z], rotation: [Math.PI / 2 - 0.25, a, 0], color: '#2a1e16' });
  }
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2, d = r() * 0.4 * scale;
    ctx.glow.add(new THREE.OctahedronGeometry(r.range(0.05, 0.11) * scale, 0), { position: [x + Math.cos(a) * d, y + 0.08, z + Math.sin(a) * d], color: r.pick(['#ff6a1a', '#ff9a3a', '#e8481a']), jitter: 0.05 });
  }
  const group = new ctx.THREE.Group();
  group.position.set(x, y + 0.05, z);
  const cones = [];
  if (flames) {
    const outer = new THREE.MeshBasicMaterial({ color: '#ff7a24', transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false });
    const inner = new THREE.MeshBasicMaterial({ color: '#ffd36a', toneMapped: false });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const big = i === 0;
      const m = new THREE.Mesh(new THREE.ConeGeometry((big ? 0.32 : 0.16) * scale, (big ? 1.0 : 0.6) * scale, 5).translate(0, (big ? 0.5 : 0.3) * scale, 0), outer);
      if (!big) m.position.set(Math.cos(a) * 0.2 * scale, 0, Math.sin(a) * 0.2 * scale);
      group.add(m);
      cones.push(m);
    }
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.15 * scale, 0.55 * scale, 5).translate(0, 0.27 * scale, 0), inner);
    group.add(core);
    cones.push(core);
  }
  ctx.scene.add(group);
  let light;
  if (intensity) {
    light = new THREE.PointLight(color, intensity, distance, 1.5);
    light.position.set(x, y + 1.2 * scale, z);
    ctx.scene.add(light);
  }
  const ph = r() * 10;
  ctx.onFrame((t) => {
    cones.forEach((m, i) => {
      m.scale.y = 0.8 + 0.3 * Math.sin(t * (7 + i) + ph + i * 2) + 0.1 * Math.sin(t * 13 + i);
      m.rotation.y = t * 0.6 + i;
    });
    if (light) light.intensity = intensity * (0.85 + 0.1 * Math.sin(t * 9 + ph) + 0.06 * Math.sin(t * 23));
  });
  if (smoke) ctx.effects.smoke({ position: [x, y + 1, z], count: smoke, height: 12 * scale, size: 0.5 * scale, color: '#6d6460', seed: Math.floor(r() * 1e6) });
  return light;
}

// Clay wine jar; tipped jars lie on their side.
export function jar(ctx, x, z, { color = '#9a5a38', tipped = false, rot = 0, scale = 1 } = {}) {
  const pts = [[0, 0], [0.12, 0.02], [0.2, 0.15], [0.22, 0.3], [0.17, 0.45], [0.08, 0.55], [0.08, 0.64], [0.11, 0.66]].map(([a, b]) => new THREE.Vector2(a * scale, b * scale));
  const geo = new THREE.LatheGeometry(pts, 7);
  const y = ctx.heightAt(x, z);
  if (tipped) {
    geo.translate(0, -0.3 * scale, 0);
    ctx.solid.add(geo, { position: [x, y + 0.2 * scale, z], rotation: [Math.PI / 2, rot, 0], color });
  } else ctx.solid.add(geo, { position: [x, y, z], rotation: [0, rot, 0], color });
}

export function spear(ctx, x, z, { y, rot = 0, lying = false, len = 2.4, lean = 0 } = {}) {
  const base = y ?? ctx.heightAt(x, z);
  if (lying) {
    ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.03, len, 4), { position: [x, base + 0.04, z], rotation: [Math.PI / 2, rot, 0], color: '#5a4030' });
    const [tx, tz] = frame(x, z, rot)(0, len / 2 + 0.1);
    ctx.solid.add(new THREE.ConeGeometry(0.06, 0.25, 4), { position: [tx, base + 0.04, tz], rotation: [Math.PI / 2, rot, 0], color: '#3c3a3a' });
    return;
  }
  ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.03, len, 4), { position: [x, base + len / 2, z], rotation: [lean, rot, 0], color: '#5a4030' });
  const [tx, tz] = frame(x, z, rot)(0, -Math.sin(lean) * len / 2);
  ctx.solid.add(new THREE.ConeGeometry(0.06, 0.25, 4), { position: [tx, base + len * Math.cos(lean) / 2 + len / 2 + 0.1, tz], rotation: [lean, rot, 0], color: '#3c3a3a' });
}

export function shield(ctx, x, z, { y, rot = 0, color = '#8a3a26', flat = true } = {}) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 8), { position: [x, base + (flat ? 0.04 : 0.38), z], rotation: [flat ? 0.15 : Math.PI / 2 - 0.2, rot, 0], color });
}

// Adobe house with a door toward local +z, flat roof with beam ends, or a thatched pyramid roof.
export function house(ctx, x, z, rot, { w = 6, d = 5, h = 2.8, color = '#c9ae86', roof = '#8a6a44', thatch = false, door = '#2b211a' } = {}) {
  const at = frame(x, z, rot);
  const y = Math.min(...[[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, 0]].map(([a, b]) => ctx.heightAt(...at(a, b)))) - 0.2;
  box(ctx, w, h + 0.2, d, [x, y + (h + 0.2) / 2, z], rot, color, { collide: true });
  const [dx, dz] = at(0, d / 2 + 0.02);
  ctx.solid.box(1.1, 1.9, 0.08, { position: [dx, y + 0.2 + 0.95, dz], rotation: [0, rot, 0], color: door, jitter: 0 });
  if (thatch) {
    ctx.solid.add(new THREE.ConeGeometry(Math.hypot(w, d) * 0.62, h * 0.9, 4), { position: [x, y + h + 0.2 + h * 0.45, z], rotation: [0, rot + Math.PI / 4, 0], scale: [1, 1, d / w], color: roof, shade: darkenBottom });
  } else {
    box(ctx, w + 0.4, 0.3, d + 0.4, [x, y + h + 0.35, z], rot, roof);
    for (let i = 0; i < Math.floor(w / 1.2); i++) {
      const [bx, bz] = at(-w / 2 + 0.6 + i * 1.2, d / 2 + 0.3);
      ctx.solid.box(0.14, 0.14, 0.5, { position: [bx, y + h - 0.05, bz], rotation: [0, rot, 0], color: '#5a412c' });
    }
  }
}

// Wall along a polyline, made of blocks with slightly varied tops. Gaps are [x, z, r] openings.
export function wallLine(ctx, pts, { h = 4, thick = 1.2, color = '#a8916f', gaps = [], block = 2.2, crenel = true } = {}) {
  const r = ctx.rand;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / block));
    const rot = Math.atan2(bx - ax, bz - az);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      if (gaps.some(([gx, gz, gr]) => Math.hypot(x - gx, z - gz) < gr)) continue;
      const y = ctx.heightAt(x, z) - 0.6;
      const hh = h + 0.6 + r.range(-0.15, 0.15);
      box(ctx, thick, hh, len / n + 0.03, [x, y + hh / 2, z], rot, color, { collide: true });
      if (crenel && k % 2 === 0) ctx.solid.box(thick * 0.9, 0.6, len / n * 0.6, { position: [x, y + hh + 0.3, z], rotation: [0, rot, 0], color, shade: darkenBottom });
    }
  }
}

export function banner(ctx, x, z, { color = '#a8322a', h = 4, rot = 0, y } = {}) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, h, 5), { position: [x, base + h / 2, z], color: '#4a3424' });
  const [fx, fz] = frame(x, z, rot)(0.55, 0);
  ctx.solid.box(1.0, 1.3, 0.04, { position: [fx, base + h - 0.75, fz], rotation: [0, rot, 0.05], color });
}

// Rows of maize: thin stalks with leaves, laid out in a rotated rectangle.
export function field(ctx, x, z, w, d, rot = 0, { color = '#6f8a3a', gap = 0.9, h = 1.8, ripe = '#c9b04a' } = {}) {
  const at = frame(x, z, rot);
  const r = ctx.rand;
  for (let i = 0; i < Math.floor(w / gap); i++) {
    for (let j = 0; j < Math.floor(d / (gap * 0.8)); j++) {
      const [px, pz] = at(-w / 2 + i * gap + r.range(-0.1, 0.1), -d / 2 + j * gap * 0.8 + r.range(-0.1, 0.1));
      const hh = h * r.range(0.7, 1.1);
      ctx.solid.add(new THREE.ConeGeometry(0.18, hh, 4), { position: [px, ctx.heightAt(px, pz) + hh / 2 - 0.05, pz], rotation: [r.range(-0.08, 0.08), r() * 3, r.range(-0.08, 0.08)], color: r() < 0.3 ? ripe : color, jitter: 0.1 });
    }
  }
}

// Animated low-poly water surface over a rectangle; terrain must dip below `y` where water shows.
export function water(ctx, { x = 0, z = 0, w = 40, d = 40, y = -0.4, color = '#3f7f94', rot = 0, opacity = 0.88, amp = 0.08 } = {}) {
  const geo = new THREE.PlaneGeometry(w, d, Math.ceil(w / 1.6), Math.ceil(d / 1.6));
  geo.rotateX(-Math.PI / 2);
  const time = { value: 0 };
  const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 80, specular: '#b8d8e0', transparent: true, opacity });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed.y += (sin(position.x * 0.9 + uTime * 1.3) + cos(position.z * 1.1 - uTime * 1.1) + sin((position.x + position.z) * 0.5 + uTime * 0.7)) * ${amp.toFixed(3)};`,
      );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

// Faceted cloud mass; emissive so it reads at any time of day.
export function cloud(ctx, x, y, z, size, { color = '#f4efe4', emissive = 0.4, puffs = 9, seed = 4, flat = 0.45 } = {}) {
  const r = rng(seed);
  const geos = [];
  for (let i = 0; i < puffs; i++) {
    const g = new THREE.IcosahedronGeometry(size * r.range(0.35, 0.6), 1).toNonIndexed();
    g.scale(1.3, flat + r.range(0, 0.25), 1);
    g.translate(r.range(-1, 1) * size * 0.8, r.range(-0.15, 0.25) * size, r.range(-1, 1) * size * 0.6);
    geos.push(g);
  }
  const geo = mergeGeometries(geos);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: emissive, flatShading: true }));
  mesh.position.set(x, y, z);
  ctx.scene.add(mesh);
  return mesh;
}

// Star field that follows the camera.
export function stars(ctx, { count = 1400, seed = 8, size = 2, color = '#dfe6ff', minY = 0.05 } = {}) {
  const r = rng(seed);
  const pos = [];
  while (pos.length < count * 3) {
    const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (v.lengthSq() > 1 || v.y < minY * v.length()) continue;
    v.normalize().multiplyScalar(1200);
    pos.push(v.x, v.y, v.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, depthWrite: false, transparent: true, opacity: 0.9 }));
  pts.renderOrder = -9;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
  return pts;
}

// Brief periodic tremors applied to the camera after the walker positions it.
export function tremor(ctx, { amp = 0.05, every = 6, length = 2.2 } = {}) {
  ctx.onFrame((t, dt, camera) => {
    const phase = t % every;
    if (phase > length) return;
    const k = Math.sin((phase / length) * Math.PI) * amp;
    camera.position.x += Math.sin(t * 41) * k;
    camera.position.y += Math.sin(t * 53 + 1) * k * 0.6;
    camera.rotation.z = Math.sin(t * 37) * k * 0.08;
  });
}

// Crowd groups that walk a path in a column: each segment faces the next waypoint.
export function columnGroups(path, { width = 3, spacing = 0.95, density = 1.6, seed = 31, children = 0.2, palette, skipNear = [] } = {}) {
  const r = rng(seed);
  const groups = [];
  const all = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const nx = -(bz - az) / len, nz = (bx - ax) / len;
    const points = [];
    const target = density * len;
    for (let tries = 0; points.length < target && tries < target * 30; tries++) {
      const t = r(), off = r.range(-width / 2, width / 2);
      const px = ax + (bx - ax) * t + nx * off, pz = az + (bz - az) * t + nz * off;
      if (all.some(([qx, qz]) => (qx - px) ** 2 + (qz - pz) ** 2 < spacing * spacing)) continue;
      if (skipNear.some(([sx, sz, sr]) => Math.hypot(px - sx, pz - sz) < sr)) continue;
      points.push([px, pz]);
      all.push([px, pz]);
    }
    const face = [bx + (bx - ax) * 10, bz + (bz - az) * 10];
    groups.push({ count: points.length, points, face, children, seed: seed + i * 7, ...(palette ? { palette } : {}) });
  }
  return { groups, points: all };
}

// Grass tufts of thin blades scattered over a rectangle, skipping points where `avoid` returns true.
export function tufts(ctx, { x0, x1, z0, z1, count = 600, colors = ['#5a6a3a', '#6e6a42', '#4e5a36'], h = [0.3, 0.6], seed = 5, avoid } = {}) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = r.range(x0, x1), z = r.range(z0, z1);
    if (avoid?.(x, z)) continue;
    const col = r.pick(colors);
    const y = ctx.heightAt(x, z);
    for (let k = 0; k < 4; k++) {
      const hh = r.range(h[0], h[1]);
      ctx.solid.add(new THREE.ConeGeometry(0.05, hh, 3), { position: [x + r.range(-0.15, 0.15), y + hh / 2 - 0.05, z + r.range(-0.15, 0.15)], rotation: [r.range(-0.4, 0.4), r() * 3, r.range(-0.4, 0.4)], color: col, jitter: 0.1 });
    }
  }
}
