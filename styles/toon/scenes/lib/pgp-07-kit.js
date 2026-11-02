import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { makeFigure } from '../../engine/people.js';
import { glowTexture } from '../../engine/textures.js';
import { between, makeRng, pick } from '../../engine/util.js';

export { between, makeRng, pick };

export const INK = '#2b1a12';

export function baseStyle(over = {}) {
  return {
    ink: INK,
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#cfdcc0', near: 90, far: 900 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
    ...over,
  };
}

export function groundSpec(colors, over = {}) {
  return {
    size: 1600,
    segments: 200,
    flatRadius: 140,
    hillHeight: 40,
    undulation: 0.3,
    plaza: { center: [5000, 5000], size: [1, 1] },
    colors: {
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      plaza: colors.dirt,
      plazaLine: colors.dirt,
      ...colors,
    },
    ...over,
  };
}

export function box(w, h, d, x = 0, y = 0, z = 0, { rx = 0, ry = 0, rz = 0 } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export function cyl(r0, r1, h, x = 0, y = 0, z = 0, { rx = 0, ry = 0, rz = 0, seg = 8 } = {}) {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export function ball(r, x = 0, y = 0, z = 0, { sx = 1, sy = 1, sz = 1, seg = 10 } = {}) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3));
  g.scale(sx, sy, sz);
  g.translate(x, y, z);
  return g;
}

const merge = (geos) => mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));

// Merges geometry into one toon mesh. Geometry is local to `at` (x, y, z, rotY).
export function mesh(ctx, geos, color, { at = [0, 0, 0, 0], cast = true, receive = true, emissive, side, fx = false } = {}) {
  const list = Array.isArray(geos) ? geos : [geos];
  const m = new THREE.Mesh(merge(list), ctx.kit.toon(color, { emissive: emissive ?? 0x000000, side: side ?? THREE.FrontSide }));
  m.position.set(at[0], at[1], at[2]);
  m.rotation.y = at[3] ?? 0;
  m.castShadow = cast;
  m.receiveShadow = receive;
  if (fx) m.layers.set(FX_LAYER);
  ctx.scene.add(m);
  return m;
}

// Solid box footprint in world space, top is absolute height.
export function solid(ctx, x, z, hx, hz, top, rot = 0, { walkable = false, exclude = true } = {}) {
  ctx.addCollider({ x, z, hx, hz, rot, top, walkable });
  if (exclude) ctx.exclude({ kind: 'rect', x, z, hx: hx + 0.4, hz: hz + 0.4, rot });
}

let glowTex = null;
export function glow(ctx, x, y, z, size, color, opacity = 0.7, pulse = 0.04) {
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) {
    const ph = x * 0.37 + z * 0.21;
    ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.7 + ph) * pulse)));
  }
  return s;
}

// Soft additive disc or cone of light, drawn without outlines.
export function lightCone(ctx, x, y, z, { top = 1, bottom = 3, height = 8, color = '#fff4cf', opacity = 0.25 } = {}) {
  const g = new THREE.CylinderGeometry(top, bottom, height, 32, 1, true);
  g.translate(0, -height / 2, 0);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  m.position.set(x, y, z);
  m.layers.set(FX_LAYER);
  ctx.scene.add(m);
  return m;
}

export function figure(ctx, colors, x, z, { face, yaw, scale = 1, glow: g = 0, kneel = false, lift = 0, y, clear = 1.0 } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow: g });
  fig.position.set(x, (y ?? ctx.groundHeight(x, z)) + lift, z);
  fig.scale.set(scale, scale * (kneel ? 0.62 : 1), scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  if (yaw !== undefined) fig.rotation.y = yaw;
  ctx.scene.add(fig);
  if (clear) {
    ctx.exclude({ kind: 'circle', x, z, r: clear });
    ctx.addCollider({ x, z, hx: 0.3 * scale, hz: 0.3 * scale, rot: 0, top: fig.position.y + 1.7 * scale });
  }
  return fig;
}

// Arm groups made by makeFigure, in order [left, right].
export function arms(fig) {
  return fig.children.filter((c) => c.isGroup);
}

export function setArm(arm, { out = 0.5, fwd = 0.3 } = {}, side = 1) {
  arm.rotation.set(-fwd, 0, side * out);
}

// 19th-century men: dark coat over trousers, a collar, an optional hat.
export function settler(ctx, x, z, { coat = '#2f3440', trousers = '#3b3226', skin = '#d9a77c', hair = '#5a3a22', shirt = '#efe8d6', hat = null, ...opts } = {}) {
  const fig = figure(ctx, { robe: trousers, mantle: coat, skin, hair, sash: null, arms: opts.arms ?? [0.22, 0.12] }, x, z, opts);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.1, 10), ctx.kit.toon(shirt));
  collar.position.y = 1.44;
  fig.add(collar);
  if (hat) {
    const h = new THREE.Mesh(merge([cyl(0.24, 0.24, 0.03, 0, 1.68, 0, { seg: 14 }), cyl(0.13, 0.14, 0.2, 0, 1.79, 0, { seg: 12 })]), ctx.kit.toon(hat));
    h.castShadow = true;
    fig.add(h);
  }
  return fig;
}

// Faceless heavenly messenger in white with soft light.
export function heavenly(ctx, x, y, z, { face, scale = 1.12, arms = [0.45, 0.35], halo = 6, haloColor = '#fff6d8', light = 0, lightColor = '#fff1cc', lightDistance = 22, robe = '#fdfbf4', mantle = '#f6f1e2' } = {}) {
  const fig = makeFigure({ robe, mantle, skin: '#fffaf0', hair: '#fffdf6', sash: '#efe6cf', arms }, ctx.kit, { glow: 0.55 });
  fig.position.set(x, y, z);
  fig.scale.setScalar(scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(fig);
  if (halo) {
    glow(ctx, x, y + 1.2 * scale, z, halo, haloColor, 0.85);
    glow(ctx, x, y + 1.0 * scale, z, halo * 2.2, haloColor, 0.3, 0.02);
  }
  if (light) {
    const p = new THREE.PointLight(lightColor, light, lightDistance, 1.4);
    p.position.set(x, y + 1.6 * scale, z);
    ctx.scene.add(p);
  }
  return fig;
}

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2.2, minY = 0.08, seed = 9 } = {}) {
  const rng = makeRng(seed);
  const pos = [];
  for (let i = 0; i < count; i++) {
    const y = between(rng, [minY, 1]);
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * r * 1500, y * 1500, Math.sin(a) * r * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
  p.layers.set(FX_LAYER);
  p.frustumCulled = false;
  p.renderOrder = -900;
  ctx.scene.add(p);
  ctx.onFrame((t, dt, cam) => p.position.copy(cam.position));
}

export function moon(ctx, dir, { size = 50, color = '#f6f0dc', halo = '#c8d4f0' } = {}) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  disc.renderOrder = -800;
  ctx.scene.add(disc);
  glowTex ??= glowTexture();
  const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: halo, transparent: true, opacity: 0.5, depthWrite: false, fog: false }));
  h.scale.setScalar(size * 4);
  h.layers.set(FX_LAYER);
  h.renderOrder = -850;
  ctx.scene.add(h);
  ctx.onFrame((t, dt, cam) => {
    disc.position.copy(cam.position).add(d);
    disc.lookAt(cam.position);
    h.position.copy(disc.position);
  });
}

// Deciduous trees: tall trunks with clustered round canopies. list: [x, z, height, trunkR?]
export function trees(ctx, list, { trunk = '#6b5440', leaves = ['#5f9e5a', '#4f8f4e', '#6faa5a', '#3f7f4a'], seed = 13, yAt = ctx.terrainHeight, collide = true, canopy = 0.32 } = {}) {
  const rng = makeRng(seed);
  const trunkGeo = new THREE.CylinderGeometry(0.7, 1, 1, 8);
  trunkGeo.translate(0, 0.5, 0);
  const leafGeo = new THREE.IcosahedronGeometry(1, 1);
  const tm = [], lm = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (const [x, z, h, r = 0.3] of list) {
    const y = yAt(x, z) - 0.2;
    e.set((rng() - 0.5) * 0.08, rng() * 6, (rng() - 0.5) * 0.08);
    m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e), new THREE.Vector3(r, h, r));
    tm.push(m.clone());
    const spread = h * canopy;
    const puffs = 4 + Math.floor(rng() * 3);
    for (let k = 0; k < puffs; k++) {
      const a = (k / puffs) * Math.PI * 2 + rng();
      const rr = k === 0 ? 0 : spread * between(rng, [0.45, 0.8]);
      const cs = spread * between(rng, [0.55, 0.8]) * (k === 0 ? 1.15 : 1);
      m.compose(new THREE.Vector3(x + Math.sin(a) * rr, y + h * 0.95 + (k === 0 ? spread * 0.3 : -spread * between(rng, [0, 0.35])), z + Math.cos(a) * rr), q.setFromEuler(e.set(rng(), rng(), rng())), new THREE.Vector3(cs, cs * 0.75, cs));
      lm.push({ m: m.clone(), c: pick(rng, leaves) });
    }
    if (collide) ctx.addCollider({ x, z, hx: r + 0.05, hz: r + 0.05, rot: 0, top: y + h });
    ctx.exclude({ kind: 'circle', x, z, r: r + 0.6 });
  }
  const trunks = new THREE.InstancedMesh(trunkGeo, ctx.kit.toon(trunk), tm.length);
  tm.forEach((mm, i) => trunks.setMatrixAt(i, mm));
  const canopies = new THREE.InstancedMesh(leafGeo, ctx.kit.toon('#ffffff'), lm.length);
  const c = new THREE.Color();
  lm.forEach(({ m: mm, c: cc }, i) => {
    canopies.setMatrixAt(i, mm);
    canopies.setColorAt(i, c.set(cc));
  });
  for (const im of [trunks, canopies]) {
    im.castShadow = im.receiveShadow = true;
    im.computeBoundingSphere();
    ctx.scene.add(im);
  }
}

// Random tree positions in a ring, skipping a reject test.
export function scatter(rng, n, { center = [0, 0], ring, height, radius = [0.25, 0.4], reject = () => false, spacing = 0 }) {
  const out = [];
  for (let tries = 0; out.length < n && tries < n * 30; tries++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(between(rng, [ring[0] ** 2, ring[1] ** 2]));
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (reject(x, z)) continue;
    if (spacing && out.some((p) => Math.hypot(p[0] - x, p[1] - z) < spacing)) continue;
    out.push([x, z, between(rng, height), between(rng, radius)]);
  }
  return out;
}

// Small instanced bits scattered on the ground: rocks, ferns, flowers.
export function scatterBits(ctx, { geo, count, ring, center = [0, 0], size, colors, seed = 5, yAt = ctx.terrainHeight, reject = () => false, flat = 1, sink = 0.2 }) {
  const rng = makeRng(seed);
  const im = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), count);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  let n = 0;
  for (let i = 0; i < count * 3 && n < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(between(rng, [ring[0] ** 2, ring[1] ** 2]));
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (reject(x, z)) continue;
    const s = between(rng, size);
    m.compose(new THREE.Vector3(x, yAt(x, z) + s * sink, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((rng() - 0.5) * 0.5, rng() * 6, (rng() - 0.5) * 0.5)), new THREE.Vector3(s, s * flat, s));
    im.setMatrixAt(n, m);
    im.setColorAt(n, c.set(pick(rng, colors)));
    n++;
  }
  im.count = n;
  im.castShadow = im.receiveShadow = true;
  ctx.scene.add(im);
  return im;
}

// Keeps the third-person camera inside an interior box by sliding it toward the player.
export function keepCameraInside(ctx, { minX, maxX, minZ, maxZ, maxY = Infinity, minY = -Infinity, ceiling }) {
  const fwd = new THREE.Vector3();
  const need = (v, d, lo, hi) => (v < lo ? (d > 1e-4 ? (lo - v) / d : 0) : v > hi ? (d < -1e-4 ? (hi - v) / d : 0) : 0);
  ctx.onFrame((t, dt, cam) => {
    const p = cam.position;
    cam.getWorldDirection(fwd);
    const s = Math.max(need(p.x, fwd.x, minX, maxX), need(p.z, fwd.z, minZ, maxZ));
    if (s > 0) p.addScaledVector(fwd, s);
    const top = ceiling ? ceiling(p.x, p.z) : maxY;
    if (p.y > top) p.y = top;
    if (p.y < minY) p.y = minY;
  });
}

// Wooden plank floor as one merged mesh of boards with alternating tints.
export function planks(ctx, { x0, x1, z0, z1, y = 0.02, board = 0.32, colors = ['#9a6a42', '#8a5c38', '#a6764a'], along = 'z' }) {
  const groups = colors.map(() => []);
  const w = x1 - x0, d = z1 - z0;
  if (along === 'z') {
    let i = 0;
    for (let x = x0; x < x1 - 1e-3; x += board, i++) groups[i % colors.length].push(box(Math.min(board, x1 - x) - 0.015, 0.06, d, x + board / 2, y, z0 + d / 2));
  } else {
    let i = 0;
    for (let z = z0; z < z1 - 1e-3; z += board, i++) groups[i % colors.length].push(box(w, 0.06, Math.min(board, z1 - z) - 0.015, x0 + w / 2, y, z + board / 2));
  }
  groups.forEach((g, i) => g.length && mesh(ctx, g, colors[i], { cast: false }));
}

// Night-capable flame on a candle or lamp.
export function candle(ctx, x, y, z, { light = 6, distance = 9, color = '#ffc070', holder = '#8a7a5a' } = {}) {
  mesh(ctx, [cyl(0.09, 0.11, 0.03, 0, 0.015, 0, { seg: 10 }), cyl(0.035, 0.035, 0.22, 0, 0.13, 0, { seg: 8 })], holder, { at: [x, y, z] });
  mesh(ctx, [cyl(0.03, 0.03, 0.2, 0, 0.13, 0)], '#f3ead2', { at: [x, y, z] });
  const f = mesh(ctx, [ball(0.035, 0, 0, 0, { sy: 2 })], '#ffd27a', { at: [x, y + 0.29, z], emissive: '#ffb347', cast: false });
  glow(ctx, x, y + 0.3, z, 0.9, '#ffbf6a', 0.8, 0.1);
  if (light) {
    const p = new THREE.PointLight(color, light, distance, 1.5);
    p.position.set(x, y + 0.45, z);
    ctx.scene.add(p);
    ctx.onFrame((t) => {
      p.intensity = light * (0.92 + Math.sin(t * 9.1) * 0.05 + Math.sin(t * 13.7) * 0.03);
      f.scale.y = 1 + Math.sin(t * 11) * 0.12;
    });
  }
}
