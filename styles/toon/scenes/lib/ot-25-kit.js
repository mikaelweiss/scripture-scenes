import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure, personParts } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { between, makeRng, pick } from '../../engine/util.js';

export const NO_PLAZA = { center: [9999, 9999], size: [0, 0] };

export function toonStyle({ fog = '#efd8ad', near = 120, far = 1100, ink = '#2b1a12' } = {}) {
  return {
    ink,
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: fog, near, far },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  };
}

export const ISRAEL = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#2f4f6e'],
  skins: ['#9c6a45', '#a87650', '#b5825a', '#c08f66', '#8a5a3b'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#d9c7a3', '#c8912e', '#ffffff', '#4f7f80'],
};

export const PHILISTINES = {
  robes: ['#7a2e3a', '#9a3c2e', '#5e3a5a', '#3e5a7a', '#b5733b', '#6b2a2a', '#4a4a6a', '#c8a050'],
  mantles: ['#2e3a5a', '#c8912e', '#7a2e3a', '#1f4a5a', '#e0c070'],
  skins: ['#b5825a', '#c08f66', '#a87650', '#9c6a45'],
  hair: ['#2b1a12', '#5a3a22', '#3a2418'],
  wraps: ['#e0c070', '#c8912e', '#7a2e3a', '#2f6f8a'],
};

export const yawTo = (x, z, [tx, tz]) => Math.atan2(tx - x, tz - z);

export function merged(ctx, geos, color, { cast = true, receive = true, emissive, basic = false, stone = false } = {}) {
  if (!geos.length) return null;
  const mat = basic ? ctx.kit.basic(color) : stone ? ctx.kit.stoneMat(color) : ctx.kit.toon(color, emissive ? { emissive } : {});
  const mixed = geos.some((g) => !g.index) && geos.some((g) => g.index);
  const mesh = new THREE.Mesh(mergeGeometries(mixed ? geos.map((g) => (g.index ? g.toNonIndexed() : g)) : geos), mat);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  ctx.scene.add(mesh);
  return mesh;
}

// Boxes grouped by color. Each: { size:[w,h,d], pos:[x,z], y (base, default terrain), rot, color, collide, walkable, stone }.
export function boxes(ctx, list, { stone = false } = {}) {
  const groups = new Map();
  for (const b of list) {
    const [w, h, d] = b.size;
    const [x, z] = b.pos;
    const y = b.y ?? ctx.terrainHeight(x, z) - (b.sink ?? 0.05);
    const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0).rotateY(b.rot ?? 0).translate(x, y, z);
    const key = `${b.color}|${b.stone ?? stone}|${b.cast !== false}`;
    if (!groups.has(key)) groups.set(key, { color: b.color, stone: b.stone ?? stone, cast: b.cast !== false, geos: [] });
    groups.get(key).geos.push(g);
    if (b.collide !== false) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: -(b.rot ?? 0), top: y + h, walkable: !!b.walkable });
    if (b.exclude !== false) ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.3, hz: d / 2 + 0.3, rot: -(b.rot ?? 0) });
  }
  for (const g of groups.values()) merged(ctx, g.geos, g.color, { stone: g.stone, cast: g.cast });
}

// One special figure. pose: stand, kneel, lie, prone, raise, spread.
export function figure(ctx, { pos, facing, yaw, colors, scale = 1, glow = 0, pose = 'stand', y, lift = 0, clear = 0.9, roll = 0, lean = 0 }) {
  const [x, z] = pos;
  const c = { ...colors };
  if (pose === 'raise') c.arms = c.arms ?? [0.35, 2.6];
  if (pose === 'spread') c.arms = c.arms ?? [1.35, 0.5];
  const fig = makeFigure(c, ctx.kit, { glow });
  const outer = new THREE.Group();
  outer.add(fig);
  outer.position.set(x, (y ?? ctx.groundHeight(x, z)) + lift, z);
  outer.rotation.y = yaw ?? (facing ? yawTo(x, z, facing) : 0);
  if (pose === 'lie' || pose === 'prone') {
    fig.rotation.set(pose === 'lie' ? -Math.PI / 2 : Math.PI / 2, 0, roll);
    fig.position.set(0, 0.22, 0);
  } else if (pose === 'kneel') {
    fig.scale.set(1.12, 0.6, 1.12);
  }
  if (lean) fig.rotation.x = lean;
  outer.scale.setScalar(scale);
  ctx.scene.add(outer);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return outer;
}

// Instanced people at exact spots. Each: { x, z, y?, yaw, scale?, kneel?, child?, lean? }.
export function people(ctx, list, palette, { seed = 7, cast = true } = {}) {
  if (!list.length) return;
  const rng = makeRng(seed);
  const parts = personParts();
  const n = list.length;
  const meshes = ['robe', 'mantle', 'head', 'hair'].map((k) => new THREE.InstancedMesh(parts[k], ctx.kit.toon('#ffffff'), n));
  const base = new THREE.Matrix4(), body = new THREE.Matrix4(), head = new THREE.Matrix4();
  const q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  list.forEach((p, i) => {
    const s = p.scale ?? (p.child ? 0.62 : between(rng, [0.93, 1.07]));
    e.set(p.lean ?? 0.04 * (rng() - 0.3), p.yaw ?? 0, 0, 'YXZ');
    base.compose(new THREE.Vector3(p.x, p.y ?? ctx.terrainHeight(p.x, p.z), p.z), q.setFromEuler(e), new THREE.Vector3(s, s, s));
    const k = p.kneel ? 0.6 : 1;
    body.copy(base).multiply(new THREE.Matrix4().makeScale(p.kneel ? 1.12 : 1, k, p.kneel ? 1.12 : 1));
    const hs = p.child ? 1.3 : 1;
    head.copy(base).multiply(new THREE.Matrix4().makeTranslation(0, 1.58 - 1.46 * (1 - k), 0).multiply(new THREE.Matrix4().makeScale(hs, hs, hs)).multiply(new THREE.Matrix4().makeTranslation(0, -1.58, 0)));
    meshes[0].setMatrixAt(i, body);
    meshes[1].setMatrixAt(i, body);
    meshes[2].setMatrixAt(i, head);
    meshes[3].setMatrixAt(i, head);
    const pal = p.colors ?? palette;
    const robe = pick(rng, pal.robes);
    meshes[0].setColorAt(i, c.set(robe));
    meshes[1].setColorAt(i, c.set(rng() < 0.3 ? robe : pick(rng, pal.mantles)));
    meshes[2].setColorAt(i, c.set(pick(rng, pal.skins)));
    meshes[3].setColorAt(i, c.set(rng() < 0.4 ? pick(rng, pal.wraps) : pick(rng, pal.hair)));
  });
  meshes.forEach((m, i) => {
    m.castShadow = cast && i < 3;
    m.receiveShadow = true;
    m.computeBoundingSphere();
    ctx.scene.add(m);
  });
}

// Random spots in a ring or rect that avoid blocked zones and each other.
export function scatter(ctx, { center, radius, angle, rect, count, spacing = 0.7, seed = 3, avoid = () => false, taken = [] }) {
  const rng = makeRng(seed);
  const out = [];
  for (let tries = 0; out.length < count && tries < count * 50; tries++) {
    let x, z;
    if (rect) {
      x = center[0] + (rng() - 0.5) * rect[0];
      z = center[1] + (rng() - 0.5) * rect[1];
    } else {
      const a = between(rng, angle ?? [-Math.PI, Math.PI]);
      const r = Math.sqrt(between(rng, [radius[0] ** 2, radius[1] ** 2]));
      x = center[0] + Math.sin(a) * r;
      z = center[1] + Math.cos(a) * r;
    }
    if (ctx.blocked(x, z, 0.35) || avoid(x, z)) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.z - z) < spacing) || taken.some((p) => Math.hypot(p.x - x, p.z - z) < spacing)) continue;
    out.push({ x, z, r: rng() });
  }
  return out;
}

// Flickering flames at arbitrary points: torches, lamps, altar fires. Each: { pos:[x,y,z], size }.
export function flames(ctx, list, { outer, inner, glow = '#ffb060', glowSize = 3, glowOpacity = 0.6 } = {}) {
  if (!list.length) return;
  const rng = makeRng(17);
  const geo = new THREE.LatheGeometry([[0.001, 0], [0.2, 0.12], [0.28, 0.32], [0.2, 0.6], [0.08, 0.85], [0.001, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 7);
  const om = new THREE.InstancedMesh(geo, ctx.kit.basic(outer ?? ctx.style.flameOuter), list.length);
  const im = new THREE.InstancedMesh(geo, ctx.kit.basic(inner ?? ctx.style.flameInner), list.length);
  for (const mesh of [om, im]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const items = list.map((f) => ({ ...f, s: f.size ?? 1, phase: rng() * 9 }));
  if (glowSize) {
    const tex = glowTexture();
    const pos = new Float32Array(items.length * 3);
    items.forEach((f, i) => pos.set([f.pos[0], f.pos[1] + 0.4 * f.s, f.pos[2]], i * 3));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: tex, color: glow, size: glowSize, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: glowOpacity, fog: false }));
    pts.layers.set(FX_LAYER);
    pts.frustumCulled = false;
    ctx.scene.add(pts);
  }
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  ctx.onFrame((t) => {
    items.forEach((f, i) => {
      const k = 0.75 + 0.25 * Math.sin(t * 9 + f.phase) * Math.sin(t * 5.3 + f.phase * 2);
      v.set(...f.pos);
      om.setMatrixAt(i, m.compose(v, q, sc.set(f.s, f.s * 0.9 * k, f.s)));
      im.setMatrixAt(i, m.compose(v, q, sc.set(f.s * 0.5, f.s * 0.55 * k, f.s * 0.5)));
    });
    om.instanceMatrix.needsUpdate = im.instanceMatrix.needsUpdate = true;
  });
}

export function pointLight(ctx, [x, y, z], { color = '#ffb35c', intensity = 8, distance = 16, decay = 1.5 } = {}) {
  const l = new THREE.PointLight(color, intensity, distance, decay);
  l.position.set(x, y, z);
  ctx.scene.add(l);
  return l;
}

// Campfire: logs, stone ring and flames.
export function campfires(ctx, list) {
  const logs = [], ring = [], fl = [];
  const rng = makeRng(13);
  for (const f of list) {
    const [x, z] = f.pos;
    const y = ctx.terrainHeight(x, z);
    const s = f.size ?? 1;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI + rng() * 0.3;
      logs.push(new THREE.CylinderGeometry(0.08 * s, 0.1 * s, 1.1 * s, 6).rotateZ(Math.PI / 2 - 0.25).rotateY(a).translate(x, y + 0.18 * s, z));
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ring.push(new THREE.IcosahedronGeometry(0.16 * s, 0).translate(x + Math.sin(a) * 0.7 * s, y + 0.06, z + Math.cos(a) * 0.7 * s));
    }
    if (!f.out) fl.push({ pos: [x, y + 0.1, z], size: s * (f.low ? 0.5 : 1) });
    if (f.light) pointLight(ctx, [x, y + 1.4, z], { intensity: f.light, distance: f.lightDistance ?? 14 });
    ctx.exclude({ kind: 'circle', x, z, r: 1.1 * s });
    ctx.addCollider({ x, z, hx: 0.5 * s, hz: 0.5 * s, rot: 0, top: y + 0.7 });
  }
  merged(ctx, logs, '#3a2418');
  merged(ctx, ring, '#7a6a5a');
  flames(ctx, fl, { glowSize: 5 });
}

// Thin rods from point to point. ground: y values are above terrain.
export function rods(ctx, list, color = '#5a3a22', radius = 0.035) {
  const geos = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (const r of list) {
    const a = new THREE.Vector3(...r.from), b = new THREE.Vector3(...r.to);
    if (r.ground) {
      a.y += ctx.terrainHeight(a.x, a.z);
      b.y += ctx.terrainHeight(b.x, b.z);
    }
    const len = a.distanceTo(b);
    const g = new THREE.CylinderGeometry(r.radius ?? radius, r.radius ?? radius, len, 6);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, b.clone().sub(a).normalize()));
    g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    geos.push(g);
  }
  return merged(ctx, geos, color);
}

const jarGeo = () => new THREE.LatheGeometry(
  [[0.001, 0], [0.14, 0.02], [0.24, 0.18], [0.26, 0.34], [0.2, 0.5], [0.09, 0.6], [0.08, 0.7], [0.12, 0.74]].map(([r, y]) => new THREE.Vector2(r, y)),
  10,
);

export function jars(ctx, list, color = '#b5623b') {
  const geos = [];
  for (const j of list) {
    const [x, z] = j.pos;
    const s = j.scale ?? 1;
    const g = jarGeo().scale(s, s, s);
    if (j.tipped) g.rotateZ(Math.PI / 2).translate(0, 0.24 * s, 0).rotateY(j.rot ?? 0);
    geos.push(g.translate(x, j.y ?? ctx.terrainHeight(x, z), z));
  }
  merged(ctx, geos, color);
}

// Broken pottery shards scattered around points.
export function shards(ctx, centers, color = '#b5623b', { per = 5, spread = 0.6, seed = 21 } = {}) {
  const rng = makeRng(seed);
  const geos = [];
  for (const [x, z] of centers) {
    for (let i = 0; i < per; i++) {
      const sx = x + (rng() - 0.5) * spread * 2, sz = z + (rng() - 0.5) * spread * 2;
      const g = new THREE.CylinderGeometry(0.25, 0.22, 0.2, 7, 1, true, 0, between(rng, [0.8, 1.8]));
      g.rotateX(rng() * 3).rotateY(rng() * 6).translate(sx, ctx.terrainHeight(sx, sz) + 0.06, sz);
      geos.push(g);
    }
  }
  const mesh = merged(ctx, geos, color);
  if (mesh) mesh.material.side = THREE.DoubleSide;
}

export function rocks(ctx, list, colors = ['#7d6a58', '#8a7662', '#6e5d4e']) {
  const rng = makeRng(23);
  const byColor = new Map();
  for (const r of list) {
    const [x, z] = r.pos;
    const [sx, sy, sz] = r.size;
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position;
    const sd = rng() * 10;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
      const k = 0.9 + 0.12 * Math.sin(vx * 3.1 + sd) * Math.cos(vz * 2.7 - sd) + 0.08 * Math.sin(vy * 4.3 + vx * 2 + sd * 2);
      p.setXYZ(i, vx * k, Math.max(vy * k, -0.3), vz * k);
    }
    g.computeVertexNormals();
    g.scale(sx, sy, sz).rotateY(r.rot ?? 0).translate(x, ctx.terrainHeight(x, z) - sy * 0.12, z);
    const c = r.color ?? pick(rng, colors);
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push(g);
    if (r.collide !== false) ctx.addCollider({ x, z, hx: sx * 0.8, hz: sz * 0.8, rot: -(r.rot ?? 0), top: ctx.terrainHeight(x, z) + sy });
    ctx.exclude({ kind: 'rect', x, z, hx: sx, hz: sz, rot: -(r.rot ?? 0) });
  }
  for (const [c, geos] of byColor) merged(ctx, geos, c);
}

export function stars(ctx, { count = 900, color = '#f4f0ff', minY = 0.08, seed = 4, size = 2.2 } = {}) {
  const rng = makeRng(seed);
  const pos = [];
  while (pos.length < count * 3) {
    const v = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5);
    if (v.lengthSq() > 0.25 || v.lengthSq() < 0.01) continue;
    v.normalize();
    if (v.y < minY) continue;
    pos.push(v.x * 1500, v.y * 1500, v.z * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, depthWrite: false }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  pts.renderOrder = -900;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
}

export function glowSprite(ctx, { pos, size, color, opacity = 0.8, pulse = 0 }) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(...pos);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3 + pos[0]) * pulse)));
  return s;
}

export function moon(ctx, { dir = [-0.4, 0.45, -0.8], size = 16, color = '#f3eedc' } = {}) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  disc.frustumCulled = false;
  ctx.scene.add(disc);
  const halo = glowSprite(ctx, { pos: [0, 0, 0], size: size * 5, color: '#9fb0e0', opacity: 0.45 });
  halo.frustumCulled = false;
  ctx.onFrame((t, dt, camera) => {
    disc.position.copy(camera.position).add(d);
    disc.lookAt(camera.position);
    halo.position.copy(disc.position);
  });
}

// Pointed tents. Each: { pos, radius, height, color }.
export function tents(ctx, list, colors = ['#3a2a22', '#5e4632', '#4a3a30', '#6b4a33'], { sides = 6 } = {}) {
  const rng = makeRng(91);
  const byColor = new Map();
  const doors = [];
  for (const t of list) {
    const [x, z] = t.pos;
    const r = t.radius ?? 1.8, h = t.height ?? 2.6;
    const y = ctx.terrainHeight(x, z);
    const rot = t.rot ?? rng() * 6.28;
    const g = new THREE.ConeGeometry(r, h, sides, 1).rotateY(rot).translate(x, y + h / 2 - 0.05, z);
    const c = t.color ?? pick(rng, colors);
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push(g);
    const door = new THREE.ConeGeometry(r * 0.4, h * 0.55, 3, 1).scale(1, 1, 0.3).translate(0, h * 0.27, r * 0.62).rotateY(rot).translate(x, y, z);
    doors.push(door);
    ctx.addCollider({ x, z, hx: r * 0.7, hz: r * 0.7, rot: 0, top: y + h });
    ctx.exclude({ kind: 'circle', x, z, r: r + 0.5 });
  }
  for (const [c, geos] of byColor) merged(ctx, geos, c);
  merged(ctx, doors, '#1a120c', { cast: false });
}

// Long low Bedouin-style tents: a sloped cloth roof on poles.
export function longTents(ctx, list, colors = ['#2e2420', '#3a2a22', '#4a3a30']) {
  const rng = makeRng(33);
  const roofs = new Map(), poles = [];
  for (const t of list) {
    const [x, z] = t.pos;
    const [w, d] = t.size ?? [6, 4];
    const h = t.height ?? 2.2;
    const rot = t.rot ?? 0;
    const y = ctx.terrainHeight(x, z);
    const m = new THREE.Matrix4().makeRotationY(rot).setPosition(x, y, z);
    const shape = new THREE.Shape([new THREE.Vector2(-d / 2, 0.6), new THREE.Vector2(-d * 0.15, h), new THREE.Vector2(d * 0.15, h), new THREE.Vector2(d / 2, 1.2), new THREE.Vector2(d / 2, 1.1), new THREE.Vector2(d * 0.15, h - 0.12), new THREE.Vector2(-d * 0.15, h - 0.12), new THREE.Vector2(-d / 2, 0.5)]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false }).translate(0, 0, -w / 2).rotateY(Math.PI / 2).applyMatrix4(m);
    const back = new THREE.BoxGeometry(w, 0.9, 0.06).translate(0, 0.35, -d / 2).applyMatrix4(m);
    const c = t.color ?? pick(rng, colors);
    if (!roofs.has(c)) roofs.set(c, []);
    roofs.get(c).push(g, back);
    for (const lx of [-w / 2 + 0.2, 0, w / 2 - 0.2]) poles.push(new THREE.CylinderGeometry(0.05, 0.05, h, 5).translate(lx, h / 2, 0).applyMatrix4(m));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: -rot, top: y + h });
    ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.6, hz: d / 2 + 0.6, rot: -rot });
  }
  for (const [c, geos] of roofs) merged(ctx, geos, c);
  merged(ctx, poles, '#5a3a22');
}

// Flat-roofed mud-brick houses. Each: { pos, size:[w,d], height, rot }.
export function houses(ctx, list, { wall = '#c9a777', roofEdge = '#a8865a', door = '#2b1a12' } = {}) {
  const walls = [], edges = [], doors = [];
  for (const h of list) {
    const [x, z] = h.pos;
    const [w, d] = h.size ?? [5, 4];
    const ht = h.height ?? 3;
    const rot = h.rot ?? 0;
    const y = h.y ?? ctx.terrainHeight(x, z) - 0.3;
    const m = new THREE.Matrix4().makeRotationY(rot).setPosition(x, y, z);
    walls.push(new THREE.BoxGeometry(w, ht, d).translate(0, ht / 2, 0).applyMatrix4(m));
    edges.push(new THREE.BoxGeometry(w + 0.25, 0.3, d + 0.25).translate(0, ht + 0.1, 0).applyMatrix4(m));
    doors.push(new THREE.BoxGeometry(0.9, 1.8, 0.1).translate(w * 0.2, 0.9 + 0.3, d / 2 + 0.02).applyMatrix4(m));
    doors.push(new THREE.BoxGeometry(0.5, 0.5, 0.1).translate(-w * 0.25, ht * 0.65, d / 2 + 0.02).applyMatrix4(m));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: -rot, top: y + ht + 2 });
    ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.8, hz: d / 2 + 0.8, rot: -rot });
  }
  merged(ctx, walls, wall, { stone: true });
  merged(ctx, edges, roofEdge, { stone: true });
  merged(ctx, doors, door, { cast: false });
}

// Instanced camels, couched or standing.
export function camels(ctx, list, colors = ['#b48a5a', '#a07850', '#c49a62', '#8c6a46']) {
  if (!list.length) return;
  const rng = makeRng(61);
  const parts = [
    new THREE.SphereGeometry(1, 10, 8).scale(0.45, 0.42, 0.9).translate(0, 1.35, 0),
    new THREE.SphereGeometry(0.4, 10, 8).scale(1, 0.9, 1.1).translate(0, 1.75, -0.05),
    new THREE.CylinderGeometry(0.12, 0.18, 1.0, 6).rotateX(-0.6).translate(0, 1.75, 0.95),
    new THREE.SphereGeometry(0.17, 8, 6).scale(0.9, 0.9, 1.7).translate(0, 2.18, 1.35),
  ];
  const legs = [[-0.25, 0.55], [0.25, 0.55], [-0.25, -0.55], [0.25, -0.55]].map(([lx, lz]) => new THREE.CylinderGeometry(0.07, 0.06, 1.1, 5).translate(lx, 0.55, lz));
  const standing = mergeGeometries([...parts, ...legs]);
  const couched = mergeGeometries(parts.map((g) => g.clone().translate(0, -0.85, 0)));
  const groups = [list.filter((c) => !c.couched), list.filter((c) => c.couched)];
  [standing, couched].forEach((geo, gi) => {
    const items = groups[gi];
    if (!items.length) return;
    const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), items.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
    items.forEach((it, i) => {
      const [x, z] = it.pos;
      const s = it.scale ?? between(rng, [0.9, 1.1]);
      m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z), z), q.setFromEuler(e.set(0, it.rot ?? rng() * 6.28, 0)), new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(it.color ?? pick(rng, colors)));
      ctx.exclude({ kind: 'circle', x, z, r: 1.2 });
      ctx.addCollider({ x, z, hx: 0.5, hz: 0.5, rot: 0, top: ctx.terrainHeight(x, z) + 1.6 });
    });
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  });
}

// Sheep: instanced body and dark head and legs.
export function sheep(ctx, list, wool = ['#f1ead8', '#e6dcc4', '#d8cdb4', '#efe6d0', '#5a4636']) {
  if (!list.length) return;
  const rng = makeRng(71);
  const body = new THREE.SphereGeometry(1, 10, 8).scale(0.32, 0.27, 0.48).translate(0, 0.6, 0);
  const dark = mergeGeometries([
    new THREE.SphereGeometry(0.14, 8, 6).scale(1, 1, 1.4).translate(0, 0.72, 0.52),
    ...[[-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]].map(([lx, lz]) => new THREE.CylinderGeometry(0.045, 0.04, 0.45, 5).translate(lx, 0.22, lz)),
  ]);
  const bodies = new THREE.InstancedMesh(body, ctx.kit.toon('#ffffff'), list.length);
  const heads = new THREE.InstancedMesh(dark, ctx.kit.toon('#3a2a22'), list.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  list.forEach((it, i) => {
    const [x, z] = it.pos;
    m.compose(new THREE.Vector3(x, it.y ?? ctx.terrainHeight(x, z), z), q.setFromEuler(e.set(0, it.rot ?? rng() * 6.28, 0)), new THREE.Vector3(1, 1, 1).multiplyScalar(it.scale ?? 1));
    bodies.setMatrixAt(i, m);
    heads.setMatrixAt(i, m);
    bodies.setColorAt(i, c.set(it.color ?? pick(rng, wool)));
  });
  for (const mesh of [bodies, heads]) {
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
}

// Olive and fig trees: twisted trunk and flattened canopy puffs.
export function olives(ctx, list, { trunk = '#6b5a4a', leaves = ['#7d8f5a', '#6e8250', '#8a9a64'] } = {}) {
  const rng = makeRng(41);
  const trunks = [], canopy = new Map();
  for (const t of list) {
    const [x, z] = t.pos;
    const s = t.scale ?? between(rng, [0.8, 1.2]);
    const y = ctx.terrainHeight(x, z);
    trunks.push(new THREE.CylinderGeometry(0.18 * s, 0.32 * s, 2 * s, 6).rotateZ((rng() - 0.5) * 0.4).translate(x, y + s, z));
    for (let k = 0; k < 4; k++) {
      const a = rng() * 6.28, r = k ? 0.9 * s : 0;
      const g = new THREE.IcosahedronGeometry(1.2 * s, 1).scale(1, 0.6, 1).translate(x + Math.sin(a) * r, y + 2.3 * s + rng() * 0.4 * s, z + Math.cos(a) * r);
      const c = pick(rng, leaves);
      if (!canopy.has(c)) canopy.set(c, []);
      canopy.get(c).push(g);
    }
    ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + 3 * s });
    ctx.exclude({ kind: 'circle', x, z, r: 1.4 * s });
  }
  merged(ctx, trunks, trunk);
  for (const [c, geos] of canopy) merged(ctx, geos, c);
}

// A soldier's helmet and breastplate, and a spear, added to a figure.
export function armor(ctx, fig, { metal = '#9a8a6a', crest } = {}) {
  const mat = ctx.kit.toon(metal);
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat);
  helm.position.y = 1.6;
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.215, 0.42, 12), mat);
  plate.position.y = 1.16;
  const add = [helm, plate];
  if (crest) {
    const plume = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.18, 10), ctx.kit.toon(crest));
    plume.position.y = 1.78;
    add.push(plume);
  }
  for (const m of add) {
    m.castShadow = true;
    fig.children[0].add(m);
  }
}

export function spear(ctx, fig, { side = 1, length = 2.6, color = '#6b4a33', radius = 0.025, tip = '#4a4038' } = {}) {
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 6), ctx.kit.toon(color));
  shaft.position.set(side * 0.32, length / 2 - 0.1, 0.12);
  const point = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.4, radius * 10, 5), ctx.kit.toon(tip));
  point.position.set(side * 0.32, length - 0.1 + radius * 5, 0.12);
  shaft.castShadow = true;
  fig.children[0].add(shaft, point);
}

export function shield(ctx, fig, { color = '#8c6a3a', boss = '#c8a050', round = true, side = -1, size = 0.42 } = {}) {
  const g = round ? new THREE.CylinderGeometry(size, size, 0.06, 16).rotateX(Math.PI / 2) : new THREE.BoxGeometry(size * 1.4, size * 2.6, 0.08);
  const s = new THREE.Mesh(g, ctx.kit.toon(color));
  s.position.set(side * 0.34, 1.05, 0.12);
  s.rotation.y = side * 0.5;
  const b = new THREE.Mesh(new THREE.SphereGeometry(size * 0.25, 8, 6), ctx.kit.toon(boss));
  b.position.set(side * 0.34 + side * 0.02, 1.05, 0.17);
  s.castShadow = true;
  fig.children[0].add(s, b);
}

// Hard-edged additive light shafts, from a high point down onto a spot.
export function shaft(ctx, { from, to, width = [4, 8], color = '#fff2c9', opacity = 0.25 }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(width[0], width[1], len, 24, 1, true).translate(0, -len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), b.clone().sub(a).normalize()));
  const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  mesh.position.copy(a);
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
  return mesh;
}

// Soft puffy cloud masses that slowly roll, used for the glory cloud and dust.
export function puffs(ctx, { center, radius = [3, 3, 3], count = 14, size = [1.5, 3], color = '#fff8e8', emissive = '#bfb29a', seed = 5, drift = 0.15, opacity = 1 }) {
  const rng = makeRng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const mat = new THREE.MeshToonMaterial({ color, emissive, gradientMap: ctx.kit.gradient, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const items = Array.from({ length: count }, () => ({
    x: center[0] + (rng() - 0.5) * 2 * radius[0],
    y: center[1] + (rng() - 0.5) * 2 * radius[1],
    z: center[2] + (rng() - 0.5) * 2 * radius[2],
    s: between(rng, size),
    p: rng() * 6.28,
  }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const place = (t) => {
    items.forEach((it, i) => {
      v.set(it.x + Math.sin(t * drift + it.p) * 0.4, it.y + Math.sin(t * drift * 1.3 + it.p * 2) * 0.3, it.z + Math.cos(t * drift + it.p) * 0.4);
      mesh.setMatrixAt(i, m.compose(v, q, sc.setScalar(it.s * (1 + 0.05 * Math.sin(t * 0.7 + it.p)))));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place(0);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  if (drift) ctx.onFrame(place);
  return mesh;
}

// A flat ribbon hugging the ground along a polyline: paths, brooks.
export function ribbon(ctx, points, { width = 4, color = '#c9a06a', lift = 0.04 } = {}) {
  const pos = [], idx = [];
  points.forEach(([x, z], i) => {
    const [px, pz] = points[Math.max(0, i - 1)], [nx, nz] = points[Math.min(points.length - 1, i + 1)];
    let dx = nx - px, dz = nz - pz;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l;
    dz /= l;
    for (const s of [-1, 1]) {
      const vx = x - dz * (width / 2) * s, vz = z + dx * (width / 2) * s;
      pos.push(vx, ctx.terrainHeight(vx, vz) + lift, vz);
    }
    if (i < points.length - 1) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mat = new THREE.MeshToonMaterial({ color, gradientMap: ctx.kit.gradient, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}

// Points along a polyline, every `step` meters.
export function along(points, step) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) out.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  out.push(points[points.length - 1]);
  return out;
}
