import * as THREE from 'three';
import { rng } from '../../engine/util.js';
import { createFigure } from '../../engine/crowd.js';

const darken = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

function lowest(ctx, x, z, w, d, rot) {
  const at = frame(x, z, rot);
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) h = Math.min(h, ctx.heightAt(...at(lx, lz)));
  return h;
}

// Box placed by its local offset inside a rotated frame, optionally solid to the walker.
function part(ctx, at, rot, { lx = 0, lz = 0, y, w, h, d, color, tilt = [0, 0], collide = false, batch = ctx.solid, jitter = 0.05 }) {
  const [px, pz] = at(lx, lz);
  batch.box(w, h, d, { position: [px, y + h / 2, pz], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: darken });
  if (collide) ctx.colliders.add({ x: px, z: pz, w, d, rot, bottom: y, top: y + h });
}

// Gently heaving, faceted water with sun glints.
export function water(ctx, { x = 0, z = 0, y = 0, w = 900, d = 900, seg = 140, color = '#3f6f7a', amp = 0.1, opacity = 0.94, shininess = 70, specular = '#ffd7a8' }) {
  const geo = new THREE.PlaneGeometry(w, d, seg, seg).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess, specular, transparent: opacity < 1, opacity });
  const uTime = { value: 0 };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
        transformed.y += (sin(wp.x * 0.31 + uTime * 1.1) + sin(wp.z * 0.43 - uTime * 0.8) + 0.6 * sin((wp.x - wp.z) * 0.9 + uTime * 1.9)) * ${amp.toFixed(3)};`,
      );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (uTime.value = t));
  return mesh;
}

// Ribbon of packed earth following the terrain.
export function road(ctx, { path, width = 3, color = '#b59a74', lift = 0.06, seed = 4 }) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, bz - az) / 2));
    for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  pts.push(path[path.length - 1]);
  const positions = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const nx = -(bz - az) / len, nz = (bx - ax) / len;
    const wa = (width / 2) * r.range(0.85, 1.15), wb = (width / 2) * r.range(0.85, 1.15);
    const q = [[ax + nx * wa, az + nz * wa], [ax - nx * wa, az - nz * wa], [bx + nx * wb, bz + nz * wb], [bx - nx * wb, bz - nz * wb]].map(([px, pz]) => [px, ctx.heightAt(px, pz) + lift, pz]);
    positions.push(...q[0], ...q[2], ...q[1], ...q[1], ...q[2], ...q[3]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  ctx.solid.add(geo, { color, jitter: 0.05 });
}

// Flat-roofed Judean house with parapet, door and small windows.
export function house(ctx, { x, z, rot = 0, w = 6, d = 6, h = 3.4, color = '#cdb894', trim, door = true, windows = true, parapet = true, collide = true }) {
  const at = frame(x, z, rot);
  const y = lowest(ctx, x, z, w, d, rot) - 0.3;
  const H = h + 0.3;
  part(ctx, at, rot, { y, w, h: H, d, color, collide });
  const t = trim ?? new THREE.Color(color).multiplyScalar(0.82);
  ctx.solid.box(w + 0.2, 0.18, d + 0.2, { position: [x, y + H + 0.05, z], rotation: [0, rot, 0], color: t, shade: darken });
  if (parapet) {
    for (const [lx, lz, pw, pd] of [[0, -d / 2 + 0.12, w, 0.25], [0, d / 2 - 0.12, w, 0.25], [-w / 2 + 0.12, 0, 0.25, d], [w / 2 - 0.12, 0, 0.25, d]]) part(ctx, at, rot, { lx, lz, y: y + H, w: pw, h: 0.5, d: pd, color });
  }
  if (door) part(ctx, at, rot, { lz: d / 2 + 0.02, y: y + 0.3, w: 1.0, h: 1.9, d: 0.12, color: '#3a2a20' });
  if (windows) {
    for (const lx of [-w / 4, w / 4]) part(ctx, at, rot, { lx, lz: d / 2 + 0.02, y: y + H - 1.1, w: 0.45, h: 0.5, d: 0.1, color: '#2e241c' });
    part(ctx, at, rot, { lx: w / 2 + 0.02, y: y + H - 1.1, w: 0.1, h: 0.5, d: 0.5, color: '#2e241c' });
  }
  return { top: y + H };
}

// A scatter of houses filling a disc, for towns and distant Jerusalem.
export function town(ctx, { center, radius = 40, count = 40, seed = 7, colors = ['#d2bf9a', '#c6b08a', '#dacbab', '#bba783'], size = [4, 8], height = [3, 6], spacing = 6, avoid = [], face }) {
  const r = rng(seed);
  const placed = [];
  for (let tries = 0; placed.length < count && tries < count * 40; tries++) {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * radius;
    const x = center[0] + Math.cos(a) * rr, z = center[1] + Math.sin(a) * rr;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < spacing)) continue;
    if (avoid.some((v) => Math.hypot(v.x - x, v.z - z) < v.r)) continue;
    placed.push([x, z]);
    const rot = face ? Math.atan2(face[0] - x, face[1] - z) + r.range(-0.2, 0.2) : r.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]) + r.range(-0.1, 0.1);
    house(ctx, { x, z, rot, w: r.range(size[0], size[1]), d: r.range(size[0], size[1]), h: r.range(height[0], height[1]), color: r.pick(colors), windows: r() < 0.6 });
  }
  return placed;
}

// Stone wall along a polyline with crenellations, towers at the corners and an optional gate gap.
export function cityWall(ctx, { points, h = 9, thick = 2.4, color = '#c9b48a', towers = true, gaps = [] }) {
  const t = new THREE.Color(color).multiplyScalar(0.85);
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const rot = Math.atan2(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 6));
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n;
      const x = ax + (bx - ax) * f, z = az + (bz - az) * f;
      if (gaps.some((g) => Math.hypot(g.x - x, g.z - z) < g.r)) continue;
      const y = ctx.heightAt(x, z) - 1;
      const seg = len / n + 0.05;
      ctx.solid.box(thick, h + 1, seg, { position: [x, y + (h + 1) / 2, z], rotation: [0, rot, 0], color, jitter: 0.04, shade: darken });
      ctx.colliders.add({ x, z, w: thick, d: seg, rot, bottom: y, top: y + h + 1 });
      ctx.solid.box(thick + 0.3, 0.4, seg, { position: [x, y + h + 1.1, z], rotation: [0, rot, 0], color: t, shade: darken });
      for (let m = 0; m < 3; m++) {
        const g = (k + (m + 0.5) / 3) / n;
        ctx.solid.box(thick * 0.9, 0.9, 0.9, { position: [ax + (bx - ax) * g, y + h + 1.75, az + (bz - az) * g], rotation: [0, rot, 0], color, shade: darken });
      }
    }
  }
  if (towers) {
    for (const [x, z] of points) {
      if (gaps.some((g) => Math.hypot(g.x - x, g.z - z) < g.r)) continue;
      const y = ctx.heightAt(x, z) - 1;
      ctx.solid.box(thick * 2.6, h + 4, thick * 2.6, { position: [x, y + (h + 4) / 2, z], color, jitter: 0.04, shade: darken });
      ctx.solid.box(thick * 2.9, 0.5, thick * 2.9, { position: [x, y + h + 4.2, z], color: t, shade: darken });
      ctx.colliders.add({ x, z, w: thick * 2.6, d: thick * 2.6, bottom: y, top: y + h + 4 });
    }
  }
}

// Herod's temple: platform, gold-trimmed sanctuary and porch facing local +z.
export function temple(ctx, { x, z, rot = 0, s = 1, platform = true }) {
  const at = frame(x, z, rot);
  const white = '#ece4d2', gold = '#d8a845', stoneC = '#cbb68e';
  let y = lowest(ctx, x, z, 60 * s, 80 * s, rot) - 0.5;
  if (platform) {
    part(ctx, at, rot, { y, w: 110 * s, h: 8 * s, d: 130 * s, color: stoneC, collide: true });
    y += 8 * s;
    for (const [lx, lz, w, d] of [[0, -40 * s, 70 * s, 2 * s], [0, 40 * s, 70 * s, 2 * s], [-35 * s, 0, 2 * s, 80 * s], [35 * s, 0, 2 * s, 80 * s]]) part(ctx, at, rot, { lx, lz, y, w, h: 6 * s, d, color: white });
  }
  part(ctx, at, rot, { lz: -6 * s, y, w: 40 * s, h: 4 * s, d: 50 * s, color: stoneC });
  y += 4 * s;
  part(ctx, at, rot, { lz: -10 * s, y, w: 16 * s, h: 20 * s, d: 34 * s, color: white });
  part(ctx, at, rot, { lz: 8 * s, y, w: 28 * s, h: 25 * s, d: 6 * s, color: white });
  part(ctx, at, rot, { lz: 11.05 * s, y: y + 2 * s, w: 7 * s, h: 14 * s, d: 0.2 * s, color: '#4a3424' });
  part(ctx, at, rot, { lz: 11.1 * s, y: y + 16 * s, w: 8 * s, h: 0.8 * s, d: 0.3 * s, color: gold, batch: ctx.glow });
  part(ctx, at, rot, { lz: 8 * s, y: y + 25 * s, w: 29 * s, h: 1.2 * s, d: 7 * s, color: gold });
  part(ctx, at, rot, { lz: -10 * s, y: y + 20 * s, w: 17 * s, h: 1 * s, d: 35 * s, color: gold });
  for (let i = 0; i < 9; i++) part(ctx, at, rot, { lx: (-12 + i * 3) * s, lz: 8 * s, y: y + 26.2 * s, w: 0.6 * s, h: 1.4 * s, d: 0.6 * s, color: gold });
}

// Charcoal or wood fire: stone ring, glowing coals, flickering flames, smoke and warm light.
export function fire(ctx, { x, z, size = 1, flames = 7, light = 26, lightRange = 14, smoke = 8, stones = true }) {
  const r = rng(Math.floor(x * 13 + z * 7) >>> 0);
  const y = ctx.heightAt(x, z);
  if (stones) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.2 * size, 0), { position: [x + Math.cos(a) * 0.75 * size, y + 0.08, z + Math.sin(a) * 0.75 * size], rotation: [r(), r(), r()], scale: [1.2, 0.8, 1], color: '#5d554d', jitter: 0.1 });
    }
  }
  ctx.solid.add(new THREE.CircleGeometry(0.7 * size, 8).rotateX(-Math.PI / 2), { position: [x, y + 0.04, z], color: '#1d1714' });
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, dd = Math.sqrt(r()) * 0.55 * size;
    ctx.glow.add(new THREE.OctahedronGeometry(r.range(0.07, 0.15) * size, 0), { position: [x + Math.cos(a) * dd, y + 0.1, z + Math.sin(a) * dd], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.6, 1], color: r.pick(['#ff5a14', '#ff8a2a', '#e8401a', '#ffb050']), jitter: 0.05 });
  }
  const group = new THREE.Group();
  const cols = ['#ffd27a', '#ff9a3a', '#ff6a1a'];
  const list = [];
  for (let i = 0; i < flames; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.16 * size, 0.7 * size, 5).translate(0, 0.35 * size, 0), new THREE.MeshBasicMaterial({ color: cols[i % 3], toneMapped: false }));
    const a = (i / flames) * Math.PI * 2, dd = i === 0 ? 0 : 0.28 * size;
    m.position.set(Math.cos(a) * dd, 0.08, Math.sin(a) * dd);
    m.rotation.y = r() * 3;
    group.add(m);
    list.push([m, r() * 6, i === 0 ? 1.4 : r.range(0.6, 1)]);
  }
  group.position.set(x, y, z);
  ctx.scene.add(group);
  const pl = light ? new THREE.PointLight('#ff9a4a', light, lightRange, 1.6) : null;
  if (pl) {
    pl.position.set(x, y + 1, z);
    ctx.scene.add(pl);
  }
  ctx.onFrame((t) => {
    for (const [m, ph, k] of list) {
      const f = k * (0.75 + 0.25 * Math.sin(t * 9 + ph) + 0.12 * Math.sin(t * 23 + ph * 2));
      m.scale.set(1, f, 1);
    }
    if (pl) pl.intensity = light * (0.85 + 0.1 * Math.sin(t * 11) + 0.05 * Math.sin(t * 27));
  });
  if (smoke) ctx.effects.smoke({ position: [x, y + 0.8, z], count: smoke, height: 9, size: 0.35 * size, seed: 7, color: '#9a9088', wind: [0.4, 0.1] });
}

// Wooden fishing boat. The hull tapers to bow and stern and rises at the ends.
export function boat(ctx, { x, z, y, rot = 0, len = 8, beam = 2.4, depth = 1.1, color = '#6b4a32', heel = 0, mast = true, collide = true }) {
  const geo = new THREE.BoxGeometry(beam, depth, len, 2, 2, 10);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let px = p.getX(i), py = p.getY(i);
    const pz = p.getZ(i);
    const t = Math.abs(pz) / (len / 2);
    const taper = Math.max(0.03, 1 - Math.pow(t, 2.4));
    px *= taper * (py < 0 ? 0.5 : 1);
    py += t * t * depth * (py > 0 ? 0.45 : 0.25);
    p.setXYZ(i, px, py, pz);
  }
  const by = y ?? ctx.heightAt(x, z);
  const at = frame(x, z, rot);
  ctx.solid.add(geo, { position: [x, by + depth / 2, z], rotation: [0, rot, heel], color, jitter: 0.05 });
  ctx.solid.box(beam * 0.78, 0.04, len * 0.62, { position: [x, by + depth + 0.01, z], rotation: [0, rot, heel], color: '#3b2a1e' });
  for (const lz of [-len * 0.22, 0, len * 0.22]) {
    const [tx, tz] = at(0, lz);
    ctx.solid.box(beam * 0.85, 0.08, 0.3, { position: [tx, by + depth + 0.05, tz], rotation: [0, rot, heel], color: '#8a6644' });
  }
  if (mast) {
    const [mx, mz] = at(0, len * 0.12);
    ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.1, len * 0.8, 6), { position: [mx, by + depth + len * 0.4, mz], rotation: [0, 0, heel], color: '#5a4332' });
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.06, len * 0.9, 5), { position: [mx, by + depth + len * 0.55, mz], rotation: [0, rot + Math.PI / 2, 1.0], color: '#5a4332' });
    ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.17, len * 0.75, 6), { position: [mx, by + depth + len * 0.52, mz], rotation: [0, rot + Math.PI / 2, 1.0], color: '#d8ccb0' });
  }
  if (collide) ctx.colliders.add({ x, z, w: beam, d: len, rot, bottom: by, top: by + depth + 0.6 });
}

// A heaped net glinting with fish.
export function netOfFish(ctx, { x, z, r = 1.4, fish = 60, seed = 3 }) {
  const rr = rng(seed);
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.IcosahedronGeometry(1, 1), { position: [x, y + 0.05, z], scale: [r, 0.35, r * 0.8], color: '#5c5a46', jitter: 0.12 });
  for (let i = 0; i < fish; i++) {
    const a = rr() * Math.PI * 2, dd = Math.sqrt(rr()) * r * 0.9;
    const hh = 0.35 * Math.sqrt(Math.max(0, 1 - (dd / r) ** 2));
    ctx.solid.add(new THREE.OctahedronGeometry(0.12, 0), { position: [x + Math.cos(a) * dd, y + 0.08 + hh, z + Math.sin(a) * dd * 0.8], rotation: [0, rr() * 6, rr() * 0.6], scale: [0.6, 0.35, 2.2], color: rr.pick(['#c9d2d6', '#a9b6bc', '#e2e6e2', '#8f9ea6']), jitter: 0.06 });
  }
}

export function table(ctx, { x, z, rot = 0, w = 2.4, d = 1, h = 0.75, color = '#6e4c33' }) {
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  part(ctx, at, rot, { y: y + h - 0.08, w, h: 0.08, d, color, collide: true });
  for (const [lx, lz] of [[-w / 2 + 0.12, -d / 2 + 0.12], [w / 2 - 0.12, -d / 2 + 0.12], [-w / 2 + 0.12, d / 2 - 0.12], [w / 2 - 0.12, d / 2 - 0.12]]) part(ctx, at, rot, { lx, lz, y, w: 0.1, h: h - 0.08, d: 0.1, color });
  return y + h;
}

// Small clay oil lamp with a flame and warm light.
export function lamp(ctx, { x, y, z, intensity = 6, range = 9 }) {
  ctx.solid.add(new THREE.SphereGeometry(0.09, 6, 3), { position: [x, y + 0.04, z], scale: [1.4, 0.6, 1], color: '#a0603a' });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 5).translate(0, 0.06, 0), new THREE.MeshBasicMaterial({ color: '#ffd27a', toneMapped: false }));
  flame.position.set(x + 0.08, y + 0.08, z);
  ctx.scene.add(flame);
  const pl = new THREE.PointLight('#ffb064', intensity, range, 1.5);
  pl.position.set(x, y + 0.4, z);
  ctx.scene.add(pl);
  ctx.onFrame((t) => {
    const f = 0.85 + 0.1 * Math.sin(t * 13 + x) + 0.05 * Math.sin(t * 31);
    flame.scale.y = f * 1.1;
    pl.intensity = intensity * f;
  });
}

export function horse(ctx, { x, z, rot = 0, color = '#6a4a35', mane = '#2e2219' }) {
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  part(ctx, at, rot, { y: y + 0.95, w: 0.55, h: 0.62, d: 1.6, color });
  for (const [lx, lz] of [[-0.18, 0.62], [0.18, 0.62], [-0.18, -0.62], [0.18, -0.62]]) part(ctx, at, rot, { lx, lz, y, w: 0.14, h: 1.0, d: 0.16, color });
  part(ctx, at, rot, { lz: 0.95, y: y + 1.25, w: 0.3, h: 0.8, d: 0.36, color, tilt: [0.55, 0] });
  part(ctx, at, rot, { lx: 0, lz: 0.86, y: y + 1.42, w: 0.08, h: 0.6, d: 0.16, color: mane, tilt: [0.55, 0] });
  part(ctx, at, rot, { lz: 1.42, y: y + 1.78, w: 0.26, h: 0.28, d: 0.62, color, tilt: [0.6, 0] });
  part(ctx, at, rot, { lz: -0.9, y: y + 0.75, w: 0.1, h: 0.6, d: 0.12, color: mane, tilt: [0.3, 0] });
  ctx.colliders.add({ x, z, w: 0.7, d: 2.4, rot, bottom: y, top: y + 2 });
}

// Two-wheeled travelling chariot with a canopy, facing local +z.
export function chariot(ctx, { x, z, rot = 0, color = '#7a4a2c', canopy = '#b8442e', trim = '#d8a845' }) {
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  const wheelR = 0.75;
  for (const side of [-1, 1]) {
    const [wx, wz] = at(side * 0.95, 0);
    ctx.solid.add(new THREE.TorusGeometry(wheelR, 0.06, 4, 12), { position: [wx, y + wheelR, wz], rotation: [0, rot + Math.PI / 2, 0], color: '#4a3424' });
    for (let k = 0; k < 4; k++) ctx.solid.box(0.05, wheelR * 2, 0.05, { position: [wx, y + wheelR, wz], rotation: [(k * Math.PI) / 4, rot, 0], color: '#5a4030' });
  }
  const [ax, az] = at(0, 0);
  ctx.solid.box(2.0, 0.1, 0.1, { position: [ax, y + wheelR, az], rotation: [0, rot, 0], color: '#3e2c20' });
  part(ctx, at, rot, { lz: 0.1, y: y + wheelR, w: 1.6, h: 0.12, d: 1.5, color });
  part(ctx, at, rot, { lz: 0.82, y: y + wheelR, w: 1.6, h: 0.8, d: 0.08, color });
  part(ctx, at, rot, { lx: -0.8, lz: 0.1, y: y + wheelR, w: 0.08, h: 0.65, d: 1.5, color });
  part(ctx, at, rot, { lx: 0.8, lz: 0.1, y: y + wheelR, w: 0.08, h: 0.65, d: 1.5, color });
  part(ctx, at, rot, { lz: 0.86, y: y + wheelR + 0.68, w: 1.62, h: 0.1, d: 0.06, color: trim });
  for (const [lx, lz] of [[-0.75, 0.75], [0.75, 0.75], [-0.75, -0.55], [0.75, -0.55]]) part(ctx, at, rot, { lx, lz, y: y + wheelR, w: 0.06, h: 1.9, d: 0.06, color: '#3e2c20' });
  part(ctx, at, rot, { lz: 0.1, y: y + wheelR + 1.9, w: 1.8, h: 0.12, d: 1.7, color: canopy });
  part(ctx, at, rot, { lz: 2.1, y: y + 0.85, w: 0.1, h: 0.1, d: 2.6, color: '#3e2c20', tilt: [-0.08, 0] });
  ctx.colliders.add({ x: ax, z: az, w: 2.2, d: 1.8, rot, bottom: y, top: y + 3 });
  return { seat: [ax, y + wheelR + 0.06, az] };
}

// Bright billowing cloud built from soft white facets.
export function brightCloud(ctx, { x, y, z, size = 4, count = 9, seed = 2, color = '#fffaf0', glow = 0.55 }) {
  const r = rng(seed);
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: glow, flatShading: true });
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(size * r.range(0.35, 0.6), 1), mat);
    const a = r() * Math.PI * 2, dd = r() * size * 0.8;
    m.position.set(Math.cos(a) * dd, r.range(-0.2, 0.3) * size, Math.sin(a) * dd);
    m.scale.set(1, r.range(0.55, 0.8), 1);
    group.add(m);
  }
  group.position.set(x, y, z);
  ctx.scene.add(group);
  return group;
}

// Cloven tongues of fire hovering over the given points.
export function tongues(ctx, points) {
  const list = [];
  for (const [x, y, z] of points) {
    const g = new THREE.Group();
    for (const [dx, k, c] of [[-0.07, 0.8, '#ff9a3a'], [0.07, 1, '#ffcf6a'], [0, 0.6, '#ff6a1a']]) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6 * k, 5).translate(0, 0.3 * k, 0), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
      m.position.x = dx;
      m.rotation.z = -dx * 2;
      g.add(m);
    }
    g.position.set(x, y, z);
    ctx.scene.add(g);
    list.push([g, x * 1.7 + z]);
  }
  ctx.onFrame((t) => {
    for (const [g, ph] of list) {
      g.scale.y = 0.85 + 0.2 * Math.sin(t * 8 + ph) + 0.08 * Math.sin(t * 19 + ph);
      g.position.y += Math.sin(t * 2 + ph) * 0.0015;
    }
  });
}

// A hand-placed person added straight to the scene, for figures that need a custom height or pose.
export function person(ctx, { x, z, y, face, scale = 1, robe, mantle, skin = '#a8754f', hood = false, arms = 'down', emissive = 0, light, halo }) {
  const gy = y ?? ctx.heightAt(x, z);
  ctx.scene.add(createFigure({ x, y: gy, z, face, scale, robe, mantle, skin, hood, arms, emissive }));
  if (light) {
    const pl = new THREE.PointLight(light.color ?? '#fff0cf', light.intensity ?? 20, light.distance ?? 16, 1.4);
    pl.position.set(x, gy + 2.2, z);
    ctx.scene.add(pl);
  }
  if (halo) ctx.effects.halo({ position: [x, gy + 1.3 * scale, z], ...halo });
}
