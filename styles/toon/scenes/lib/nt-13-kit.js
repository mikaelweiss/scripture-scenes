// Shared props for nt-13 to nt-18: Galilee boats and sea, figures, glows, night sky, baskets, rock and tombs.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { between, localToWorld, makeRng, pick } from '../../engine/util.js';

export { between, makeRng, pick, FX_LAYER, localToWorld };

// mergeGeometries needs one attribute layout, so every part is reduced to position, normal and uv.
function normalize(g) {
  const out = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(out.attributes)) if (!['position', 'normal', 'uv'].includes(name)) out.deleteAttribute(name);
  if (!out.attributes.normal) out.computeVertexNormals();
  if (!out.attributes.uv) out.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(out.attributes.position.count * 2), 2));
  return out;
}

export function addMesh(parent, geos, mat, { cast = true, receive = true } = {}) {
  if (!geos.length) return null;
  const mesh = new THREE.Mesh(mergeGeometries(geos.map(normalize)), mat);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

export function at(g, x, y, z, { rx = 0, ry = 0, rz = 0, s = null } = {}) {
  if (s) g.scale(...(Array.isArray(s) ? s : [s, s, s]));
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export const box = (w, h, d, x, y, z, opts) => at(new THREE.BoxGeometry(w, h, d), x, y, z, opts);
export const cyl = (r0, r1, h, x, y, z, opts, seg = 8) => at(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, opts);
export const ball = (r, x, y, z, opts, seg = 10) => at(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), x, y, z, opts);

export function rod(a, b, r, seg = 6) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const g = new THREE.CylinderGeometry(r, r, va.distanceTo(vb), seg);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize())));
  const mid = va.add(vb).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

// ---------- style presets ----------

export function toonStyle({ fog = '#efd8ad', near = 120, far = 1100, ink = '#2b1a12', fade = [70, 500, 400, 0.5], steps = [0.4, 0.72, 1.0], grain = 0.05 } = {}) {
  return {
    ink,
    toonSteps: steps,
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade },
    grain,
    fog: { color: fog, near, far },
    crack: '#3a2418', ember: '#c8502c', emberHot: '#ffb347', flameOuter: '#f08a2c', flameInner: '#ffe08a', charred: '#3a2a22', smoke: '#b9aea8', smokeShade: '#3d3640',
  };
}

export const NO_PLAZA = { center: [9999, 9999], size: [0, 0] };

export function groundColors(base = {}) {
  return {
    sand: '#d4ac6c', dirt: '#bf8d55', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a',
    ...base,
  };
}

export const flatColors = (c) => groundColors({ sand: c, dirt: c, grass: c, grassDark: c, plaza: c, plazaLine: c, hill: c });

export const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#c9905f', hair: '#5a3a22', sash: '#e9dcc0' };

const ROBES = ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'];
const MANTLES = ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'];
const SKINS = ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'];
const HAIR = ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'];
const WRAPS = ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'];

export const CROWD_COLORS = { robes: ROBES, mantles: MANTLES, skins: SKINS, hair: HAIR, wraps: WRAPS };

// Twelve fixed outfits so the disciples look the same across scenes. Peter is first, James and John next.
export const DISCIPLES = [
  { robe: '#8c5a3c', mantle: '#3e6e66', skin: '#9c6a45', hair: '#5a5048', sash: '#c8912e' },
  { robe: '#b5523b', mantle: '#d9c7a3', skin: '#a87650', hair: '#2b1a12', sash: '#5e4632' },
  { robe: '#4f7f80', mantle: '#c8a97a', skin: '#b5825a', hair: '#3a2418', sash: '#b5523b' },
  { robe: '#c98b3c', mantle: '#6b5a4a', skin: '#a87650', hair: '#1f140e', sash: '#3e6e66' },
  { robe: '#7a6a52', mantle: '#b5523b', skin: '#8a5a3b', hair: '#2b1a12', sash: '#d9c7a3' },
  { robe: '#e6d8b8', mantle: '#8c5a3c', skin: '#9c6a45', hair: '#4a3020', sash: '#4f7f80' },
  { robe: '#6f8a6a', mantle: '#5e4632', skin: '#c08f66', hair: '#3a2418', sash: '#c8912e' },
  { robe: '#a87b4f', mantle: '#3e6e66', skin: '#7a4e33', hair: '#1f140e', sash: '#e6d8b8' },
  { robe: '#9c6b4e', mantle: '#d9c7a3', skin: '#a87650', hair: '#2b1a12', sash: '#a64b35' },
  { robe: '#bfa27a', mantle: '#a64b35', skin: '#b5825a', hair: '#4a3020', sash: '#3e6e66' },
  { robe: '#5e4632', mantle: '#c8912e', skin: '#9c6a45', hair: '#2b1a12', sash: '#d9c7a3' },
  { robe: '#d9c7a3', mantle: '#4f7f80', skin: '#8a5a3b', hair: '#3a2418', sash: '#8c5a3c' },
];

export const PLAYER = { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' };

// ---------- figures ----------

// A hand-placed person. Pose: 'stand', 'kneel', 'sit', 'lie', 'bow' (prostrate). y overrides ground height.
export function figure(ctx, colors, [x, z], { face, yaw, scale = 1, glow = 0, y = null, pose = 'stand', parent = null, clear = 0.8, arms } = {}) {
  const fig = makeFigure(arms ? { ...colors, arms } : colors, ctx.kit, { glow });
  const holder = new THREE.Group();
  holder.add(fig);
  const gy = y ?? ctx.groundHeight(x, z);
  holder.position.set(x, gy, z);
  holder.rotation.y = yaw ?? (face ? Math.atan2(face[0] - x, face[1] - z) : 0);
  holder.scale.setScalar(scale);
  if (pose === 'kneel') fig.scale.set(1.1, 0.62, 1.1);
  if (pose === 'sit') fig.scale.set(1.15, 0.55, 1.15);
  if (pose === 'lie') {
    fig.rotation.x = -Math.PI / 2;
    fig.position.set(0, 0.24, 0.75);
  }
  if (pose === 'bow') {
    fig.scale.set(1.1, 0.62, 1.1);
    fig.rotation.x = 0.95;
    fig.position.z = -0.05;
  }
  (parent ?? ctx.scene).add(holder);
  if (!parent && clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return holder;
}

// ---------- light and sky ----------

let glowTex = null;
export function glow(ctx, [x, y, z], size, color, { opacity = 0.7, pulse = 0.04, parent = null } = {}) {
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  (parent ?? ctx.scene).add(s);
  if (pulse) ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3 + x) * pulse)));
  return s;
}

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2.2, minY = 0.08, seed = 9 } = {}) {
  const rng = makeRng(seed);
  const pts = [];
  while (pts.length < count * 3) {
    const v = new THREE.Vector3(rng() * 2 - 1, rng(), rng() * 2 - 1);
    if (v.length() > 1 || v.y < minY) continue;
    v.normalize().multiplyScalar(1500);
    pts.push(v.x, v.y, v.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, depthWrite: false }));
  p.layers.set(FX_LAYER);
  p.frustumCulled = false;
  ctx.scene.add(p);
  ctx.onFrame((t, dt, camera) => p.position.copy(camera.position));
  return p;
}

export function moon(ctx, { dir, size = 70, color = '#fff4d8', halo = '#c9d8f0' }) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  const g = glow(ctx, [0, 0, 0], size * 5, halo, { opacity: 0.5, pulse: 0 });
  ctx.scene.add(disc);
  ctx.onFrame((t, dt, camera) => {
    disc.position.copy(camera.position).add(d);
    disc.lookAt(camera.position);
    g.position.copy(disc.position);
  });
}

export function skyUniforms(ctx) {
  return ctx.scene.children.find((o) => o.material?.uniforms?.zenith)?.material.uniforms;
}

export function groundMesh(ctx) {
  return ctx.scene.children.find((o) => o.isMesh && o.geometry.index && !o.geometry.attributes.uv && o.geometry.attributes.position.count > 10000);
}

// ---------- water ----------

function canvasTexture(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function rippleTexture(base, light, dark, seed = 5) {
  const rng = makeRng(seed);
  return canvasTexture(256, (g, n) => {
    g.fillStyle = base;
    g.fillRect(0, 0, n, n);
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = rng() * n, y = rng() * n, w = 20 + rng() * 40;
      g.strokeStyle = rng() < 0.6 ? light : dark;
      g.lineWidth = 2 + rng() * 2;
      for (const ox of [0, -n]) for (const oy of [0, -n]) {
        g.beginPath();
        for (let k = 0; k <= 8; k++) {
          const px = x + (k / 8) * w + ox, py = y + Math.sin(k * 0.9) * 2.5 + oy;
          if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke();
      }
    }
  });
}

// Flat water with drifting ripple marks. area: [w, d] plane size.
export function calmWater(ctx, { y = 0, area = [3600, 3600], center = [0, 0], color = '#3f8f96', light = '#8fd0c8', dark = '#2f6f78', tile = 18, rot = 0 } = {}) {
  const tex = rippleTexture(color, light, dark);
  tex.repeat.set(area[0] / tile, area[1] / tile);
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', map: tex, gradientMap: ctx.kit.gradient });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(area[0], area[1]), mat);
  mesh.rotation.set(-Math.PI / 2, 0, rot);
  mesh.position.set(center[0], y, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    tex.offset.x = t * 0.004;
    tex.offset.y = Math.sin(t * 0.3) * 0.01;
  });
  return mesh;
}

// Rolling sea: a CPU-animated mesh, damped near `calm` spots and at the rim. Set sea.amp to change wave height.
export function sea(ctx, { size = 460, segs = 92, center = [0, 0], calm = [], amp = 2, color = '#2e4f5c', crest = '#9fb9b8', speed = 1, farColor } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  const n = pos.count;
  const damp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = base[i * 3] + center[0], z = base[i * 3 + 2] + center[1];
    let d = 1 - THREE.MathUtils.smoothstep(Math.hypot(base[i * 3], base[i * 3 + 2]), size * 0.3, size * 0.5);
    for (const c of calm) d *= 0.15 + 0.85 * THREE.MathUtils.smoothstep(Math.hypot((x - c.x) / (c.sx ?? 1), z - c.z), c.r * 0.5, c.r * 1.6);
    damp[i] = d;
  }
  const colors = new Float32Array(n * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: ctx.kit.gradient, flatShading: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(center[0], 0, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  const cBase = new THREE.Color(color), cCrest = new THREE.Color(crest), c = new THREE.Color();
  const wave = (x, z, t) =>
    Math.sin(x * 0.07 + z * 0.03 + t * 1.3) * 1.0 +
    Math.sin(x * -0.04 + z * 0.09 + t * 1.0) * 0.8 +
    Math.sin(x * 0.17 - z * 0.11 + t * 2.1) * 0.35 +
    Math.sin(x * 0.02 + t * 0.5) * 0.6;
  const state = { amp, mesh, base: cBase, crest: cCrest, far: null };
  let acc = 1;
  ctx.onFrame((t, dt) => {
    acc += dt;
    if (acc < 1 / 30) return;
    acc = 0;
    const a = state.amp;
    const ts = t * speed;
    for (let i = 0; i < n; i++) {
      const x = base[i * 3] + center[0], z = base[i * 3 + 2] + center[1];
      const h = wave(x, z, ts) * a * damp[i];
      pos.array[i * 3 + 1] = h;
      const k = a > 0.05 ? THREE.MathUtils.clamp((h / a - 1.1) * 1.4, 0, 1) : 0;
      c.copy(state.base).lerp(state.crest, k);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.computeVertexNormals();
  });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), ctx.kit.toon(farColor ?? color, { unique: true }));
  far.rotation.x = -Math.PI / 2;
  far.position.y = -0.6;
  ctx.scene.add(far);
  state.far = far;
  return state;
}

// Falling rain streaks that follow the camera. Returns the material so opacity can fade.
export function rain(ctx, { count = 1500, box = 70, height = 40, color = '#c9d6dc', wind = [0.4, 0.12], speed = 28, opacity = 0.42 } = {}) {
  const rng = makeRng(99);
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = (rng() - 0.5) * box, z = (rng() - 0.5) * box, y = rng() * height;
    for (const off of [0, height]) pts.push(x, y + off, z, x + wind[0] * 1.6, y + off + 1.6, z + wind[1] * 1.6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, fog: false, depthWrite: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.layers.set(FX_LAYER);
  lines.frustumCulled = false;
  ctx.scene.add(lines);
  ctx.onFrame((t, dt, camera) => {
    const fall = (t * speed) % height;
    lines.position.set(camera.position.x + fall * wind[0], camera.position.y - height * 0.9 - fall, camera.position.z + fall * wind[1]);
  });
  return mat;
}

// ---------- boats ----------

// A Galilee fishing boat. Bow points along local +x. Returns { group, inner, deckY } where inner rocks with the sea
// and holds anything placed with local coordinates on deck (deck surface is local y = 0).
export function boat(ctx, { pos: [px, pz], rot = 0, y = 0, L = 9, B = 2.6, D = 1.25, hull = '#7a5232', trim = '#b5523b', deck = '#a77a4f', sail = 'furled', sailColor = '#e6d8b8', oars = 0, walk = false, walls = true, mast = true, mastAt = 0.12 }) {
  const group = new THREE.Group();
  group.position.set(px, y, pz);
  group.rotation.y = rot;
  ctx.scene.add(group);
  const inner = new THREE.Group();
  group.add(inner);

  const S = 22, P = 10;
  const halfW = (u) => (B / 2) * Math.max(0.03, Math.pow(Math.sin(Math.PI * u), 0.55));
  const top = (u) => 0.55 + 0.55 * Math.pow(2 * u - 1, 2) + (u > 0.5 ? 0.25 * (2 * u - 1) ** 3 : 0);
  const bottom = (u) => -D * (0.45 + 0.55 * Math.pow(Math.sin(Math.PI * u), 0.4)) + 0.2;
  const verts = [];
  const idx = [];
  for (let i = 0; i <= S; i++) {
    const u = i / S, x = (u - 0.5) * L;
    const w = halfW(u), yt = top(u), yb = bottom(u);
    for (let j = 0; j <= P; j++) {
      const s = (j / P) * 2 - 1;
      verts.push(x, yt + (yb - yt) * Math.pow(Math.max(0, 1 - s * s), 0.45), w * Math.sign(s) * Math.pow(Math.abs(s), 0.8));
    }
  }
  for (let i = 0; i < S; i++) for (let j = 0; j < P; j++) {
    const a = i * (P + 1) + j, b = a + P + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const hullGeo = new THREE.BufferGeometry();
  hullGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  hullGeo.setIndex(idx);
  hullGeo.computeVertexNormals();
  const hullMesh = new THREE.Mesh(hullGeo, ctx.kit.toon(hull, { side: THREE.DoubleSide }));
  hullMesh.castShadow = hullMesh.receiveShadow = true;
  inner.add(hullMesh);

  const rails = [], wood = [], cloth = [], dark = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < S; i++) {
      const u0 = i / S, u1 = (i + 1) / S;
      const a = [(u0 - 0.5) * L, top(u0), side * halfW(u0)], b = [(u1 - 0.5) * L, top(u1), side * halfW(u1)];
      rails.push(rod(a, b, 0.07, 5));
      const a2 = [a[0], a[1] - 0.28, a[2] * 1.01], b2 = [b[0], b[1] - 0.28, b[2] * 1.01];
      dark.push(rod(a2, b2, 0.045, 5));
    }
  }
  const dw = halfW(0.5) * 1.3;
  wood.push(box(L * 0.62, 0.08, dw, 0, 0, 0));
  for (const fx of [-0.28, -0.05, 0.2]) wood.push(box(0.32, 0.08, halfW(0.5 + fx) * 1.75, fx * L, 0.45, 0));
  wood.push(box(L * 0.1, 0.1, dw * 0.9, -L * 0.42, 0.75, 0));
  if (mast) {
    const mx = L * mastAt;
    wood.push(cyl(0.08, 0.11, 6.2, mx, 3.1, 0));
    if (sail === 'furled') {
      wood.push(rod([mx - 2.6, 3.4, 0.3], [mx + 2.6, 4.6, -0.3], 0.07));
      cloth.push(rod([mx - 2.3, 3.4, 0.3], [mx + 2.3, 4.45, -0.3], 0.2, 7));
    } else if (sail === 'set') {
      wood.push(rod([mx - 2.8, 5.6, 0], [mx + 2.8, 6.0, 0], 0.07));
      const g = new THREE.PlaneGeometry(5.2, 4.6, 6, 4);
      const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) p.setZ(k, 0.6 * Math.cos((p.getX(k) / 5.2) * Math.PI) * (0.5 + p.getY(k) / 9.2) + 0.2);
      g.computeVertexNormals();
      cloth.push(at(g, mx, 3.5, 0.15));
    }
  }
  for (let k = 0; k < oars; k++) {
    const side = k % 2 ? 1 : -1;
    const fx = (Math.floor(k / 2) / Math.max(1, Math.ceil(oars / 2) - 1) - 0.5) * L * 0.45;
    wood.push(rod([fx, 0.9, side * halfW(0.5) * 0.6], [fx - 0.6, -0.7, side * (halfW(0.5) + 2.4)], 0.05));
    wood.push(box(0.6, 0.04, 0.22, fx - 0.55, -0.62, side * (halfW(0.5) + 2.3), { rz: 0.3 }));
  }
  addMesh(inner, rails, ctx.kit.toon(trim));
  addMesh(inner, dark, ctx.kit.toon('#3a2418'), { cast: false });
  addMesh(inner, wood, ctx.kit.toon(deck));
  if (cloth.length) addMesh(inner, cloth, ctx.kit.toon(sailColor, { side: THREE.DoubleSide }));

  const deckY = y;
  if (walk) {
    const hx = L * 0.33, hz = dw * 0.5;
    const c = (lx, lz, chx, chz, ctop, walkable) => {
      const [wx, wz] = localToWorld(px, pz, rot, lx, lz);
      ctx.addCollider({ x: wx, z: wz, hx: chx, hz: chz, rot, top: ctop, walkable });
    };
    c(0, 0, hx, hz, deckY, true);
    if (walls) for (const s of [-1, 1]) {
      c(0, s * (hz + 0.3), hx + 0.6, 0.15, deckY + 1.6, false);
      c(s * (hx + 0.3), 0, 0.15, hz + 0.6, deckY + 1.6, false);
    }
  }
  return { group, inner, deckY, halfW, L, B };
}

export function rockBoat(ctx, b, { roll = 0.04, pitch = 0.03, heave = 0.12, speed = 1, phase = 0 } = {}) {
  const s = { roll, pitch, heave };
  ctx.onFrame((t) => {
    const k = t * speed + phase;
    b.inner.rotation.x = Math.sin(k * 0.8) * s.roll;
    b.inner.rotation.z = Math.sin(k * 0.55 + 1) * s.pitch;
    b.inner.position.y = Math.sin(k * 0.9 + 2) * s.heave;
  });
  return s;
}

// ---------- props ----------

export function basket(geos, x, y, z, s = 1) {
  const g = new THREE.LatheGeometry([[0.001, 0], [0.26, 0.02], [0.33, 0.2], [0.37, 0.4], [0.35, 0.42], [0.3, 0.42], [0.001, 0.38]].map(([r, h]) => new THREE.Vector2(r * s, h * s)), 12);
  g.translate(x, y, z);
  geos.push(g);
}

export function loaf(geos, x, y, z, s = 1) {
  geos.push(at(new THREE.SphereGeometry(0.13 * s, 10, 6), x, y + 0.04 * s, z, { s: [1, 0.45, 1] }));
}

export function fish(geos, x, y, z, ry = 0, s = 1) {
  geos.push(at(new THREE.SphereGeometry(0.16 * s, 8, 5), x, y + 0.03, z, { s: [1, 0.3, 0.35], ry }));
  geos.push(at(new THREE.ConeGeometry(0.06 * s, 0.1 * s, 4), x - Math.cos(ry) * 0.2 * s, y + 0.03, z + Math.sin(ry) * 0.2 * s, { rz: Math.PI / 2, ry }));
}

export function jar(geos, x, y, z, s = 1) {
  const g = new THREE.LatheGeometry([[0.001, 0], [0.22, 0.05], [0.3, 0.35], [0.22, 0.7], [0.1, 0.78], [0.13, 0.86], [0.001, 0.86]].map(([r, h]) => new THREE.Vector2(r * s, h * s)), 9);
  g.translate(x, y, z);
  geos.push(g);
}

// A lumpy boulder: an icosahedron pushed around by noise.
export function boulder(rng, r, x, y, z, { squash = 0.7, detail = 1 } = {}) {
  const g = new THREE.IcosahedronGeometry(r, detail);
  const p = g.attributes.position;
  const seed = rng() * 100;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const h = Math.sin((x / r) * 12.9898 + (y / r) * 78.233 + (z / r) * 37.719 + seed) * 43758.5453;
    const k = 0.8 + (h - Math.floor(h)) * 0.35;
    p.setXYZ(i, x * k, y * k * squash, z * k);
  }
  g.computeVertexNormals();
  g.rotateY(rng() * 6.28);
  g.translate(x, y, z);
  return g;
}

// Flat-roofed mud-brick houses: [x, z, w, d, h, rot].
export function houses(ctx, list, { wall = '#d9c49a', roof = '#b98a5a', door = '#2b1a12', parapet = true } = {}) {
  const walls = [], roofs = [], doors = [];
  for (const [x, z, w, d, h, rot = 0] of list) {
    const y = ctx.terrainHeight(x, z) - 0.2;
    const r = { ry: rot };
    const off = (lx, lz) => localToWorld(x, z, rot, lx, lz);
    walls.push(box(w, h, d, x, y + h / 2, z, r));
    roofs.push(box(w + 0.3, 0.25, d + 0.3, x, y + h + 0.12, z, r));
    if (parapet) {
      for (const s of [-1, 1]) {
        const [ax, az] = off(s * (w / 2), 0);
        roofs.push(box(0.25, 0.5, d + 0.3, ax, y + h + 0.45, az, r));
        const [bx, bz] = off(0, s * (d / 2));
        roofs.push(box(w + 0.3, 0.5, 0.25, bx, y + h + 0.45, bz, r));
      }
    }
    const [dx, dz] = off(0, d / 2 + 0.02);
    doors.push(box(0.9, 1.8, 0.1, dx, y + 0.9, dz, r));
    const [wx, wz] = off(w * 0.3, d / 2 + 0.02);
    if (w > 4) doors.push(box(0.5, 0.5, 0.1, wx, y + h * 0.65, wz, r));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + h + 0.4 });
  }
  addMesh(ctx.scene, walls, ctx.kit.stoneMat(wall));
  addMesh(ctx.scene, roofs, ctx.kit.toon(roof));
  addMesh(ctx.scene, doors, ctx.kit.toon(door), { cast: false });
}
