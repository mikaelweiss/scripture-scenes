// Shared props for nt-01 to nt-06: houses, rooms, animals, water, fire, night sky, angels and figures.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure, personParts } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { makeRng } from '../../engine/util.js';

export { makeRng };

const m4 = new THREE.Matrix4();
const qt = new THREE.Quaternion();
const eu = new THREE.Euler();
const v3 = new THREE.Vector3();
const s3 = new THREE.Vector3();

export function xf(geo, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = {}) {
  m4.compose(v3.set(...pos), qt.setFromEuler(eu.set(rot[0], rot[1], rot[2], 'YXZ')), s3.set(...scale));
  return geo.applyMatrix4(m4);
}

// Collects static geometry by material and merges each set into one mesh.
export class Batch {
  constructor(ctx) {
    this.ctx = ctx;
    this.sets = new Map();
  }

  add(color, geo, { glow = false, emissive = null, cast = true, frame = null } = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo;
    g.clearGroups();
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (frame) g.applyMatrix4(frame);
    const key = [color, glow, emissive, cast].join('|');
    if (!this.sets.has(key)) this.sets.set(key, { color, glow, emissive, cast, geos: [] });
    this.sets.get(key).geos.push(g);
    return this;
  }

  flush() {
    const { kit, scene } = this.ctx;
    for (const s of this.sets.values()) {
      const mat = s.glow ? kit.basic(s.color) : kit.toon(s.color, { emissive: s.emissive ?? 0x000000 });
      const mesh = new THREE.Mesh(mergeGeometries(s.geos), mat);
      mesh.castShadow = s.cast && !s.glow;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
    this.sets.clear();
  }
}

export const frameAt = (x, y, z, rotY = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(1, 1, 1));

const box = (w, h, d, pos, rot) => xf(new THREE.BoxGeometry(w, h, d), { pos, rot });
const cyl = (rt, rb, h, pos, rot, seg = 8) => xf(new THREE.CylinderGeometry(rt, rb, h, seg), { pos, rot });
const ball = (r, pos, scale = [1, 1, 1], seg = 10) => xf(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), { pos, scale });

function lowestGround(ctx, x, z, w, d, rot) {
  let y = Infinity;
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const [lx, lz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, 0]]) {
    y = Math.min(y, ctx.terrainHeight(x + lx * c + lz * s, z - lx * s + lz * c));
  }
  return y;
}

// Flat-roofed stone house with a door and small windows on the front (+z local).
export function house(b, ctx, { pos, size, height, rot = 0, color, trim, door = '#3a2418', lit = false, windowColor = '#2b1a12', upper = false }) {
  const [x, z] = pos;
  const [w, d] = size;
  const y = lowestGround(ctx, x, z, w, d, rot) - 0.3;
  const f = frameAt(x, y, z, rot);
  const h = height + 0.3;
  b.add(color, box(w, h, d, [0, h / 2, 0]), { frame: f });
  b.add(trim ?? color, box(w + 0.3, 0.35, d + 0.3, [0, h + 0.1, 0]), { frame: f });
  if (upper) {
    b.add(color, box(w * 0.45, 2.4, d * 0.5, [-w * 0.2, h + 1.2, -d * 0.18]), { frame: f });
    b.add(trim ?? color, box(w * 0.45 + 0.25, 0.3, d * 0.5 + 0.25, [-w * 0.2, h + 2.45, -d * 0.18]), { frame: f });
  }
  if (door) b.add(door, box(1.2, 2.1, 0.12, [w * 0.15, 1.35, d / 2 + 0.03]), { frame: f });
  const winOpts = lit ? { glow: true } : {};
  const wc = lit ? '#ffc15e' : windowColor;
  const rows = height > 5 ? [2.2, 4.8] : [2.6];
  for (const wy of rows) {
    if (wy > height - 0.6) continue;
    for (const wx of [-w * 0.3, w * 0.38]) {
      if (wy < 3 && Math.abs(wx - w * 0.15) < 1.2) continue;
      b.add(wc, box(0.6, 0.8, 0.1, [wx, wy + 0.3, d / 2 + 0.03]), { ...winOpts, frame: f });
    }
    b.add(wc, box(0.1, 0.8, 0.6, [w / 2 + 0.03, wy + 0.3, 0]), { ...winOpts, frame: f });
    b.add(wc, box(0.1, 0.8, 0.6, [-w / 2 - 0.03, wy + 0.3, 0]), { ...winOpts, frame: f });
  }
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + h + 0.4 });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.6, hz: d / 2 + 0.6, rot });
}

// Straight wall segment with crenellations.
export function cityWall(b, ctx, { from, to, height, thick = 1.6, color, merlons = true }) {
  const [ax, az] = from, [bx, bz] = to;
  const L = Math.hypot(bx - ax, bz - az);
  const rot = -Math.atan2(bz - az, bx - ax);
  const x = (ax + bx) / 2, z = (az + bz) / 2;
  const y = Math.min(ctx.terrainHeight(ax, az), ctx.terrainHeight(bx, bz), ctx.terrainHeight(x, z)) - 0.4;
  const f = frameAt(x, y, z, rot);
  b.add(color, box(L, height, thick, [0, height / 2, 0]), { frame: f });
  if (merlons) {
    const n = Math.floor(L / 1.6);
    for (let i = 0; i < n; i++) b.add(color, box(0.8, 0.8, thick, [-L / 2 + (i + 0.5) * (L / n), height + 0.4, 0]), { frame: f });
  }
  ctx.addCollider({ x, z, hx: L / 2, hz: thick / 2, rot, top: y + height + 1 });
  ctx.exclude({ kind: 'rect', x, z, hx: L / 2 + 0.5, hz: thick / 2 + 0.8, rot });
}

// A-frame tent of woven goat hair with its open door on the +z gable.
export function tent(b, ctx, { pos, size = [4, 4], height = 2.4, rot = 0, color = '#5e4632', door = '#24160e', pole = '#7a5636', flap = null }) {
  const [x, z] = pos;
  const [w, d] = size;
  const y = lowestGround(ctx, x, z, w, d, rot) - 0.05;
  const f = frameAt(x, y, z, rot);
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, height)]);
  const body = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  body.translate(0, 0, -d / 2);
  b.add(color, body, { frame: f });
  const opening = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-w * 0.26, 0), new THREE.Vector2(w * 0.26, 0), new THREE.Vector2(0, height * 0.62)]), { depth: 0.05, bevelEnabled: false });
  opening.translate(0, 0.02, d / 2 + 0.01);
  b.add(door, opening, { frame: f });
  if (flap) {
    const fl = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(w * 0.3, 0), new THREE.Vector2(0, height * 0.75)]), { depth: 0.06, bevelEnabled: false });
    fl.rotateY(-0.9);
    fl.translate(w * 0.24, 0.02, d / 2 + 0.05);
    b.add(flap, fl, { frame: f });
  }
  for (const pz of [d / 2 + 0.05, -d / 2 - 0.05]) b.add(pole, cyl(0.06, 0.07, height + 0.6, [0, (height + 0.6) / 2, pz]), { frame: f });
  b.add(pole, cyl(0.05, 0.05, d + 0.4, [0, height + 0.02, 0], [Math.PI / 2, 0, 0], 5), { frame: f });
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + height });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.8, hz: d / 2 + 0.8, rot });
}

// Camel, standing or couched, facing +z local.
export function camel(b, ctx, { pos, rot = 0, color = '#c49a62', couched = false, load = null }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  const f = frameAt(x, y, z, rot);
  const lift = couched ? 0.55 : 1.55;
  const dark = new THREE.Color(color).multiplyScalar(0.78).getStyle();
  b.add(color, ball(0.62, [0, lift + 0.35, 0], [1, 0.75, 1.55]), { frame: f });
  b.add(color, ball(0.42, [0, lift + 0.82, -0.05], [1, 1, 1.2]), { frame: f });
  b.add(color, cyl(0.16, 0.22, 1.25, [0, lift + 0.85, 0.95], [-0.75, 0, 0], 7), { frame: f });
  b.add(color, box(0.26, 0.26, 0.6, [0, lift + 1.38, 1.38], [0.15, 0, 0]), { frame: f });
  b.add(dark, box(0.08, 0.14, 0.08, [0.1, lift + 1.56, 1.2]), { frame: f });
  b.add(dark, box(0.08, 0.14, 0.08, [-0.1, lift + 1.56, 1.2]), { frame: f });
  if (couched) {
    for (const s of [-1, 1]) b.add(dark, ball(0.2, [s * 0.45, 0.25, 0.5], [1, 0.6, 2.2]), { frame: f });
  } else {
    for (const [lx, lz] of [[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.6], [0.3, -0.6]]) b.add(color, cyl(0.08, 0.1, lift + 0.1, [lx, (lift + 0.1) / 2, lz], [0, 0, 0], 6), { frame: f });
  }
  if (load) {
    b.add(load, box(1.5, 0.45, 0.5, [0, lift + 0.55, 0.45]), { frame: f });
    b.add('#8c5a3c', box(1.3, 0.5, 0.5, [0, lift + 0.55, -0.55]), { frame: f });
  }
  ctx.addCollider({ x, z, hx: 0.5, hz: 1.1, rot, top: y + lift + 1.2 });
  ctx.exclude({ kind: 'circle', x, z, r: 1.6 });
}

export function goat(b, ctx, { pos, rot = 0, color = '#3a2a20' }) {
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z), z, rot);
  b.add(color, ball(0.3, [0, 0.62, 0], [0.9, 0.8, 1.5]), { frame: f });
  b.add(color, box(0.18, 0.2, 0.32, [0, 0.9, 0.45], [0.4, 0, 0]), { frame: f });
  for (const [lx, lz] of [[-0.12, 0.28], [0.12, 0.28], [-0.12, -0.28], [0.12, -0.28]]) b.add(color, cyl(0.04, 0.04, 0.5, [lx, 0.25, lz], [0, 0, 0], 5), { frame: f });
}

// Date palm with a gently bent trunk.
export function palm(b, ctx, { pos, height = 8, lean = 0.15, dir = 0, trunk = '#7a5a3c', leaf = '#5f9e5a', leafDark = '#4a8a4e', seed = 1 }) {
  const rng = makeRng(seed);
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z) - 0.2, z, dir);
  const segs = 6;
  let px = 0, py = 0;
  for (let i = 0; i < segs; i++) {
    const a = lean * (i / segs) * 1.6;
    const len = height / segs;
    const nx = px + Math.sin(a) * len, ny = py + Math.cos(a) * len;
    b.add(trunk, cyl(0.2 - i * 0.015, 0.24 - i * 0.015, len * 1.05, [(px + nx) / 2, (py + ny) / 2, 0], [0, 0, -a], 7), { frame: f });
    px = nx;
    py = ny;
  }
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.3;
    const g = new THREE.ConeGeometry(0.6, 3.6, 4);
    g.scale(1, 1, 0.3);
    g.translate(0, 1.8, 0);
    g.rotateX(1.45 + rng() * 0.6);
    g.rotateY(a);
    g.translate(px, py, 0);
    b.add(i % 2 ? leaf : leafDark, g, { frame: f, emissive: '#22401f' });
  }
  b.add('#a8642c', ball(0.35, [px, py - 0.4, 0], [1, 1.3, 1]), { frame: f });
  const [wx, wz] = [x + px * Math.cos(dir), z - px * Math.sin(dir)];
  ctx.addCollider({ x, z, hx: 0.3, hz: 0.3, rot: 0, top: ctx.terrainHeight(x, z) + height });
  ctx.exclude({ kind: 'circle', x: wx, z: wz, r: 0.8 });
}

export function bush(b, ctx, { pos, size = 1, color = '#7d8a4a' }) {
  const [x, z] = pos;
  b.add(color, ball(size, [x, ctx.terrainHeight(x, z) + size * 0.3, z], [1.2, 0.7, 1]), { cast: true });
}

// Water ribbon along a polyline, sitting just above the terrain, with flowing glints.
export function river(ctx, { points, width = 8, color = '#3f8fa0', bank = '#c9b07a', glint = '#e9f6f0', flow = 1.6, glints = 70 }) {
  const pts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 2);
    for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  pts.push(points[points.length - 1]);
  const sides = (w, lift) => {
    const pos = [], idx = [], uv = [];
    let along = 0;
    pts.forEach(([x, z], i) => {
      const [nx, nz] = pts[Math.min(i + 1, pts.length - 1)], [ox, oz] = pts[Math.max(i - 1, 0)];
      let dx = nx - ox, dz = nz - oz;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      if (i) along += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]);
      const wob = w * (1 + 0.12 * Math.sin(i * 0.7));
      for (const s of [-1, 1]) {
        const vx = x - dz * wob * 0.5 * s, vz = z + dx * wob * 0.5 * s;
        const h = Math.max(ctx.terrainHeight(vx, vz), ctx.terrainHeight(x, z)) + lift;
        pos.push(vx, h, vz);
        uv.push(s * 0.5 + 0.5, along / w);
      }
      if (i < pts.length - 1) {
        const v = i * 2;
        idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  const bankMesh = new THREE.Mesh(sides(width + 3, 0.06), ctx.kit.toon(bank));
  bankMesh.receiveShadow = true;
  const water = new THREE.Mesh(sides(width, 0.16), ctx.kit.toon(color, { emissive: new THREE.Color(color).multiplyScalar(0.25) }));
  water.receiveShadow = true;
  ctx.scene.add(bankMesh, water);

  const total = pts.length - 1;
  const gl = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), ctx.kit.basic(glint, { transparent: true, opacity: 0.8 }), glints);
  gl.layers.set(FX_LAYER);
  gl.frustumCulled = false;
  const rng = makeRng(17);
  const marks = Array.from({ length: glints }, () => ({ t: rng() * total, off: (rng() - 0.5) * width * 0.7, len: 0.8 + rng() * 1.6 }));
  ctx.scene.add(gl);
  const at = (t) => {
    const i = Math.min(Math.floor(t), total - 1);
    const f = t - i;
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    return [ax + (bx - ax) * f, az + (bz - az) * f, bx - ax, bz - az];
  };
  ctx.onFrame((time, dt) => {
    marks.forEach((mk, i) => {
      mk.t = (mk.t + (dt * flow) / 2) % total;
      const [x, z, dx, dz] = at(mk.t);
      const l = Math.hypot(dx, dz) || 1;
      const px = x - (dz / l) * mk.off, pz = z + (dx / l) * mk.off;
      m4.compose(v3.set(px, Math.max(ctx.terrainHeight(px, pz), ctx.terrainHeight(x, z)) + 0.2, pz), qt.setFromEuler(eu.set(0, Math.atan2(dx, dz), 0)), s3.set(0.12, 1, mk.len));
      gl.setMatrixAt(i, m4);
    });
    gl.instanceMatrix.needsUpdate = true;
  });
  return pts;
}

let glowTex = null;
export function glow(ctx, { pos, size, color, opacity = 0.8, pulse = 0.04, additive = true }) {
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, opacity, fog: false }));
  s.position.set(...pos);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) {
    const ph = pos[0] * 0.7 + pos[2];
    ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3 + ph) * pulse)));
  }
  return s;
}

// Flickering flames as cones. Each entry: { pos: [x, y, z], h }.
export function flames(ctx, list, { outer = '#f08a2c', inner = '#ffe08a', light = null } = {}) {
  const geo = new THREE.ConeGeometry(0.22, 1, 6);
  geo.translate(0, 0.5, 0);
  const o = new THREE.InstancedMesh(geo, ctx.kit.basic(outer), list.length);
  const i2 = new THREE.InstancedMesh(geo, ctx.kit.basic(inner), list.length);
  for (const mesh of [o, i2]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const lights = [];
  if (light) {
    for (const f of list.filter((f) => f.light)) {
      const l = new THREE.PointLight(light.color, light.intensity, light.distance, 1.4);
      l.position.set(f.pos[0], f.pos[1] + 1, f.pos[2]);
      ctx.scene.add(l);
      lights.push({ l, base: light.intensity, ph: f.pos[0] });
    }
  }
  ctx.onFrame((t) => {
    list.forEach((f, k) => {
      const fl = 0.75 + 0.25 * Math.sin(t * 9 + k * 1.7) * Math.sin(t * 5.3 + k);
      o.setMatrixAt(k, m4.compose(v3.set(...f.pos), qt.identity(), s3.set(f.w ?? 1, f.h * fl, f.w ?? 1)));
      i2.setMatrixAt(k, m4.compose(v3.set(...f.pos), qt.identity(), s3.set((f.w ?? 1) * 0.5, f.h * fl * 0.6, (f.w ?? 1) * 0.5)));
    });
    o.instanceMatrix.needsUpdate = i2.instanceMatrix.needsUpdate = true;
    for (const L of lights) L.l.intensity = L.base * (0.85 + 0.15 * Math.sin(t * 11 + L.ph));
  });
}

export function campfire(b, ctx, { pos, light = null }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.add('#8a7a66', ball(0.22, [x + Math.sin(a) * 0.75, y + 0.05, z + Math.cos(a) * 0.75], [1.2, 0.7, 1], 6));
  }
  for (let i = 0; i < 3; i++) b.add('#3a2a22', cyl(0.09, 0.1, 1.2, [x, y + 0.15, z], [0, (i / 3) * Math.PI, Math.PI / 2], 5));
  flames(ctx, [{ pos: [x, y + 0.1, z], h: 1.1, light: true }, { pos: [x + 0.2, y + 0.1, z + 0.15], h: 0.7 }, { pos: [x - 0.2, y + 0.1, z - 0.1], h: 0.8 }], { light });
  glow(ctx, { pos: [x, y + 0.7, z], size: 3.5, color: '#ffb35a', opacity: 0.55, pulse: 0.08 });
  ctx.addCollider({ x, z, hx: 0.7, hz: 0.7, rot: 0, top: y + 0.4 });
  ctx.exclude({ kind: 'circle', x, z, r: 1.6 });
}

export function torch(b, ctx, { pos, height = 2.2, light = { color: '#ffa850', intensity: 10, distance: 16 } }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  b.add('#4a3020', cyl(0.07, 0.09, height, [x, y + height / 2, z], [0, 0, 0], 6));
  b.add('#2b1a12', cyl(0.22, 0.12, 0.3, [x, y + height + 0.1, z], [0, 0, 0], 7));
  flames(ctx, [{ pos: [x, y + height + 0.2, z], h: 0.9, light: true }], { light });
  glow(ctx, { pos: [x, y + height + 0.6, z], size: 3, color: '#ffb35a', opacity: 0.6, pulse: 0.1 });
  ctx.addCollider({ x, z, hx: 0.2, hz: 0.2, rot: 0, top: y + height });
}

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2, seed = 4, minY = 0.08 }) {
  const rng = makeRng(seed);
  const pos = [];
  while (pos.length < count * 3) {
    const u = rng() * 2 - 1, a = rng() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    if (u < minY) continue;
    pos.push(Math.cos(a) * r * 1500, u * 1500, Math.sin(a) * r * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, depthWrite: false }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, cam) => pts.position.copy(cam.position));
}

export function moon(ctx, { dir, size = 90, color = '#fff4d8' }) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  ctx.scene.add(disc);
  const halo = glow(ctx, { pos: [0, 0, 0], size: size * 4, color: '#9fb6e0', opacity: 0.35, pulse: 0 });
  ctx.onFrame((t, dt, cam) => {
    disc.position.copy(cam.position).add(d);
    disc.lookAt(cam.position);
    halo.position.copy(disc.position);
  });
}

// A single person built from the engine's figure parts. arms: [out, forward] in radians.
export function person(ctx, { pos, face, colors, scale = 1, glow: g = 0, kneel = false, y = null }) {
  const fig = makeFigure(colors, ctx.kit, { glow: g });
  const [x, z] = pos;
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.set(scale, kneel ? scale * 0.62 : scale, scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(fig);
  ctx.exclude({ kind: 'circle', x, z, r: 0.9 });
  return fig;
}

export function addSun(ctx, { dir, size = 60, color = '#fff2c8', halo = '#ffd890' }) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  ctx.scene.add(disc);
  const h = glow(ctx, { pos: [0, 0, 0], size: size * 5, color: halo, opacity: 0.5, pulse: 0 });
  ctx.onFrame((t, dt, cam) => {
    disc.position.copy(cam.position).add(d);
    disc.lookAt(cam.position);
    h.position.copy(disc.position);
  });
}

export const PALETTE = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const DAY_STYLE = {
  ink: '#2b1a12',
  toonSteps: [0.4, 0.72, 1.0],
  lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
  grain: 0.05,
  fog: { color: '#efd8ad', near: 120, far: 1100 },
  crack: '#3a2418',
  ember: '#c8502c',
  emberHot: '#ffb347',
  flameOuter: '#f08a2c',
  flameInner: '#ffe08a',
  charred: '#3a2a22',
  smoke: '#b9aea8',
  smokeShade: '#3d3640',
};

export { box, cyl, ball, FX_LAYER };

// A room with a back wall, two side walls and a low front sill, open to the viewer at +z local.
// The roof is open beams so the third-person camera can see in.
export function room(b, ctx, { pos, size, height = 3.4, rot = 0, color, floor = '#b89a70', beam = '#6b4a33', thick = 0.5, door = null, windows = [], sill = 0.5 }) {
  const [x, z] = pos;
  const [w, d] = size;
  const y = lowestGround(ctx, x, z, w, d, rot);
  const f = frameAt(x, y, z, rot);
  const c = Math.cos(rot), s = Math.sin(rot);
  const wall = (lx, lz, ww, hh, dd) => {
    b.add(color, box(ww, hh, dd, [lx, hh / 2, lz]), { frame: f });
    ctx.addCollider({ x: x + lx * c + lz * s, z: z - lx * s + lz * c, hx: ww / 2, hz: dd / 2, rot, top: y + hh });
  };
  b.add(floor, box(w, 0.12, d, [0, 0.06, 0]), { frame: f, cast: false });
  wall(0, -d / 2 + thick / 2, w, height, thick);
  for (const sx of [-1, 1]) wall(sx * (w / 2 - thick / 2), 0, thick, height, d);
  const gap = 2.4;
  for (const sx of [-1, 1]) {
    const len = (w - gap) / 2;
    if (len > 0.2) wall(sx * (gap / 2 + len / 2), d / 2 - thick / 2, len, sill, thick);
    b.add(color, box(0.7, height, thick + 0.1, [sx * (w / 2 - 0.35), height / 2, d / 2 - thick / 2]), { frame: f });
  }
  b.add(color, box(w + 0.3, 0.4, thick + 0.2, [0, height + 0.2, d / 2 - thick / 2]), { frame: f });
  b.add(color, box(w + 0.3, 0.4, thick + 0.2, [0, height + 0.2, -d / 2 + thick / 2]), { frame: f });
  for (let i = 0; i < Math.round(w / 1.6); i++) {
    const bx = -w / 2 + (i + 0.5) * (w / Math.round(w / 1.6));
    b.add(beam, cyl(0.12, 0.12, d + 0.4, [bx, height + 0.25, 0], [Math.PI / 2, 0, 0], 6), { frame: f });
  }
  for (const wdw of windows) {
    const [lx, ly, side] = wdw;
    if (side === 'back') b.add('#ffe6a8', box(0.9, 0.9, 0.08, [lx, ly, -d / 2 + thick + 0.01]), { frame: f, glow: true });
    else b.add('#ffe6a8', box(0.08, 0.9, 0.9, [side * (w / 2 - thick - 0.01), ly, lx]), { frame: f, glow: true });
  }
  if (door) b.add(door, box(1.1, 2.2, 0.08, [w * 0.3, 1.1, -d / 2 + thick + 0.01]), { frame: f });
  ctx.addCollider({ x, z, hx: w / 2 - thick, hz: d / 2 - thick, rot, top: y + 0.12, walkable: true });
  return { y: y + 0.12, frame: f };
}

// Olive tree: twisted trunk under lumpy silver-green crowns.
export function olive(b, ctx, { pos, size = 1, seed = 1, leaf = '#8a9a6a', leafDark = '#6f8458', trunk = '#6b5a48' }) {
  const rng = makeRng(seed);
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  const h = 2.2 * size;
  b.add(trunk, cyl(0.18 * size, 0.32 * size, h, [x, y + h / 2, z], [rng() * 0.3 - 0.15, 0, rng() * 0.3 - 0.15], 6));
  for (let i = 0; i < 5; i++) {
    const a = rng() * 6.28, r = rng() * 1.1 * size;
    b.add(i % 2 ? leaf : leafDark, ball(1.1 * size * (0.7 + rng() * 0.5), [x + Math.sin(a) * r, y + h + 0.3 * size + rng() * 0.9 * size, z + Math.cos(a) * r], [1.3, 0.75, 1.3], 7));
  }
  ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + h });
  ctx.exclude({ kind: 'circle', x, z, r: 1.2 * size });
}

export function cypress(b, ctx, { pos, height = 7, color = '#4f6e4a' }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  b.add(color, ball(1, [x, y + height * 0.5, z], [height * 0.13, height * 0.55, height * 0.13], 8));
  ctx.addCollider({ x, z, hx: 0.4, hz: 0.4, rot: 0, top: y + height });
}

// Animals facing +z local. kind: donkey, ox, sheep.
export function animal(b, ctx, { kind, pos, rot = 0, y = null, color, lying = false }) {
  const [x, z] = pos;
  const gy = y ?? ctx.groundHeight(x, z);
  const f = frameAt(x, gy, z, rot);
  const dark = new THREE.Color(color).multiplyScalar(0.6).getStyle();
  if (kind === 'sheep') {
    const lift = lying ? 0.05 : 0.35;
    b.add(color, ball(0.42, [0, lift + 0.32, 0], [0.9, 0.8, 1.3], 8), { frame: f });
    b.add('#2b2420', box(0.2, 0.24, 0.3, [0, lift + 0.48, 0.52], [0.3, 0, 0]), { frame: f });
    if (!lying) for (const [lx, lz] of [[-0.18, 0.25], [0.18, 0.25], [-0.18, -0.25], [0.18, -0.25]]) b.add('#2b2420', cyl(0.04, 0.04, 0.4, [lx, 0.2, lz], [0, 0, 0], 4), { frame: f });
    return;
  }
  const big = kind === 'ox';
  const L = big ? 1.1 : 0.8, H = big ? 0.95 : 0.75, lift = lying ? 0.1 : big ? 0.75 : 0.65;
  b.add(color, ball(H * 0.55, [0, lift + H * 0.5, 0], [1, 0.9, L * 1.8 / H], 8), { frame: f });
  const neckY = lift + H * 0.75;
  b.add(color, cyl(0.16, 0.22, 0.7, [0, neckY + (big ? 0.05 : 0.25), L * 0.95], [big ? 1.2 : 0.7, 0, 0], 6), { frame: f });
  const headY = neckY + (big ? 0.05 : 0.5);
  b.add(color, box(big ? 0.38 : 0.26, big ? 0.36 : 0.28, big ? 0.6 : 0.62, [0, headY, L * 1.25 + (big ? 0.1 : 0)], [0.35, 0, 0]), { frame: f });
  if (big) for (const sx of [-1, 1]) b.add('#e6d8b8', cyl(0.03, 0.06, 0.4, [sx * 0.28, headY + 0.25, L * 1.2], [0, 0, sx * -1.0], 5), { frame: f });
  else for (const sx of [-1, 1]) b.add(dark, box(0.08, 0.38, 0.08, [sx * 0.1, headY + 0.32, L * 1.05], [-0.3, 0, sx * 0.2]), { frame: f });
  if (!lying) for (const [lx, lz] of [[-0.22, L * 0.6], [0.22, L * 0.6], [-0.22, -L * 0.6], [0.22, -L * 0.6]]) b.add(dark, cyl(0.07, 0.08, lift + 0.15, [lx, (lift + 0.15) / 2, lz], [0, 0, 0], 5), { frame: f });
  ctx.addCollider({ x, z, hx: 0.5, hz: L * 1.2, rot, top: gy + lift + H });
  ctx.exclude({ kind: 'circle', x, z, r: L * 1.5 });
}

// Instanced flock of sheep around a center. Returns nothing; static.
export function flock(ctx, { center, radius = 8, count = 40, seed = 3, wool = '#efe8d8', face = '#2b2420', y0 = null }) {
  const rng = makeRng(seed);
  const body = new THREE.SphereGeometry(0.42, 8, 6).scale(0.9, 0.8, 1.3).translate(0, 0.62, 0);
  const headLegs = mergeGeometries([
    new THREE.BoxGeometry(0.2, 0.24, 0.3).rotateX(0.3).translate(0, 0.8, 0.52),
    ...[[-0.18, 0.25], [0.18, 0.25], [-0.18, -0.25], [0.18, -0.25]].map(([lx, lz]) => new THREE.CylinderGeometry(0.04, 0.04, 0.42, 4).translate(lx, 0.21, lz).toNonIndexed()),
  ].map((g) => (g.index ? g.toNonIndexed() : g)));
  const wm = new THREE.InstancedMesh(body, ctx.kit.toon(wool), count);
  const hm = new THREE.InstancedMesh(headLegs, ctx.kit.toon(face), count);
  let n = 0;
  for (let tries = 0; n < count && tries < count * 20; tries++) {
    const a = rng() * 6.28, r = Math.sqrt(rng()) * radius;
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (ctx.blocked(x, z, 0.5)) continue;
    const sc = 0.85 + rng() * 0.3;
    m4.compose(v3.set(x, ctx.groundHeight(x, z), z), qt.setFromEuler(eu.set(0, rng() * 6.28, 0)), s3.set(sc, sc, sc));
    wm.setMatrixAt(n, m4);
    hm.setMatrixAt(n, m4);
    ctx.exclude({ kind: 'circle', x, z, r: 0.6 });
    n++;
  }
  wm.count = hm.count = n;
  for (const m of [wm, hm]) {
    m.castShadow = true;
    m.receiveShadow = true;
    m.computeBoundingSphere();
    ctx.scene.add(m);
  }
}

// Faceless figures of light. list: { pos: [x, y, z], face: [x, z], scale, arms }.
export function angels(ctx, list, { color = '#fbf7ee', glowColor = '#fff1c8', glowSize = 4, glowOpacity = 0.5, bob = 0.15, light = null } = {}) {
  const parts = personParts();
  const mat = ctx.kit.toon(color, { emissive: new THREE.Color(color).multiplyScalar(0.55) });
  const meshes = [parts.robe, parts.mantle, parts.head].map((g) => new THREE.InstancedMesh(g, mat, list.length));
  const sprites = [];
  glowTex ??= glowTexture();
  const smat = new THREE.SpriteMaterial({ map: glowTex, color: glowColor, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: glowOpacity, fog: false });
  const place = (t) => {
    list.forEach((a, i) => {
      const [x, y, z] = a.pos;
      const yy = y + Math.sin(t * 0.8 + i * 1.3) * bob;
      const yaw = a.face ? Math.atan2(a.face[0] - x, a.face[1] - z) : 0;
      m4.compose(v3.set(x, yy, z), qt.setFromEuler(eu.set(0, yaw, 0)), s3.setScalar(a.scale ?? 1));
      for (const m of meshes) m.setMatrixAt(i, m4);
      if (sprites[i]) sprites[i].position.set(x, yy + 0.9 * (a.scale ?? 1), z);
    });
    for (const m of meshes) m.instanceMatrix.needsUpdate = true;
  };
  list.forEach((a) => {
    const s = new THREE.Sprite(smat);
    s.scale.setScalar(glowSize * (a.scale ?? 1));
    s.layers.set(FX_LAYER);
    ctx.scene.add(s);
    sprites.push(s);
  });
  for (const m of meshes) {
    m.frustumCulled = false;
    ctx.scene.add(m);
  }
  place(0);
  if (bob) ctx.onFrame((t) => place(t));
  if (light) {
    const l = new THREE.PointLight(light.color ?? glowColor, light.intensity ?? 10, light.distance ?? 20, 1.2);
    l.position.set(...(light.pos ?? list[0].pos));
    ctx.scene.add(l);
  }
}

// Wooden feeding trough with straw and the swaddled infant.
export function manger(b, ctx, { pos, rot = 0, y = null, baby = true }) {
  const [x, z] = pos;
  const gy = y ?? ctx.groundHeight(x, z);
  const f = frameAt(x, gy, z, rot);
  for (const sx of [-1, 1]) {
    b.add('#7a5636', box(0.1, 0.7, 0.1, [sx * 0.55, 0.35, 0.3], [0.2, 0, 0]), { frame: f });
    b.add('#7a5636', box(0.1, 0.7, 0.1, [sx * 0.55, 0.35, -0.3], [-0.2, 0, 0]), { frame: f });
    b.add('#8a6440', box(1.3, 0.35, 0.06, [0, 0.72, sx * 0.3], [sx * 0.35, 0, 0]), { frame: f });
  }
  b.add('#8a6440', box(1.3, 0.06, 0.4, [0, 0.58, 0]), { frame: f });
  b.add('#e3c26a', box(1.2, 0.18, 0.6, [0, 0.72, 0]), { frame: f });
  if (baby) {
    b.add('#f6f0e2', ball(0.16, [0.05, 0.86, 0], [2.2, 0.9, 1], 8), { frame: f, emissive: '#5a5040' });
    b.add('#c99a70', ball(0.09, [-0.35, 0.9, 0], [1, 1, 1], 8), { frame: f });
  }
  ctx.addCollider({ x, z, hx: 0.7, hz: 0.45, rot, top: gy + 0.9 });
  return [x, gy + 0.9, z];
}

// Clay oil lamp with a small flame and warm light.
export function lamp(b, ctx, { pos, y, light = { color: '#ffb060', intensity: 6, distance: 9 } }) {
  const [x, z] = pos;
  b.add('#a0603a', ball(0.12, [x, y + 0.06, z], [1.4, 0.6, 1], 8));
  flames(ctx, [{ pos: [x + 0.12, y + 0.08, z], h: 0.22, w: 0.35, light: !!light }], { light });
  glow(ctx, { pos: [x + 0.12, y + 0.2, z], size: 1.6, color: '#ffb35a', opacity: 0.5, pulse: 0.1 });
}

// Reeds in clumps along a polyline offset to either side.
export function reeds(ctx, { points, offset = 5, spread = 2, count = 400, seed = 9, colors = ['#7d8a4a', '#6f7f40', '#9a9a5a'], skip = null }) {
  const rng = makeRng(seed);
  const geo = new THREE.ConeGeometry(0.12, 1, 4).translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), count);
  const c = new THREE.Color();
  let n = 0;
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rng() * (points.length - 1));
    const t = rng();
    const [ax, az] = points[k], [bx, bz] = points[k + 1];
    let dx = bx - ax, dz = bz - az;
    const l = Math.hypot(dx, dz);
    dx /= l;
    dz /= l;
    const side = rng() < 0.5 ? -1 : 1;
    const off = side * (offset + rng() * spread);
    const x = ax + (bx - ax) * t - dz * off, z = az + (bz - az) * t + dx * off;
    if (ctx.blocked(x, z, 0.2) || skip?.(x, z)) continue;
    m4.compose(v3.set(x, ctx.terrainHeight(x, z), z), qt.setFromEuler(eu.set((rng() - 0.5) * 0.4, 0, (rng() - 0.5) * 0.4)), s3.set(1, 1 + rng() * 1.4, 1));
    mesh.setMatrixAt(n, m4);
    mesh.setColorAt(n, c.set(colors[Math.floor(rng() * colors.length)]));
    n++;
  }
  mesh.count = n;
  mesh.castShadow = true;
  mesh.computeBoundingSphere();
  ctx.scene.add(mesh);
}

// Reshapes only the drawn terrain. Walking still follows ctx.terrainHeight.
export function reshapeGround(ctx, fn) {
  const mesh = ctx.scene.children.find((o) => o.isMesh && o.material?.isMeshToonMaterial && o.geometry.attributes.position.count > 20000);
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, fn(pos.getX(i), pos.getZ(i), pos.getY(i)));
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

// A four-pointed star of light in the sky.
export function brightStar(ctx, { pos, size = 6, color = '#fffbe8', halo = '#fff0b8' }) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = i % 2 ? size * 0.14 : size * (i % 4 ? 0.7 : 1);
    if (i) shape.lineTo(Math.sin(a) * r, Math.cos(a) * r);
    else shape.moveTo(Math.sin(a) * r, Math.cos(a) * r);
  }
  const star = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, fog: false, side: THREE.DoubleSide }));
  star.position.set(...pos);
  star.layers.set(FX_LAYER);
  ctx.scene.add(star);
  glow(ctx, { pos, size: size * 4, color: halo, opacity: 0.8, pulse: 0.05 });
  glow(ctx, { pos, size: size * 12, color: halo, opacity: 0.25, pulse: 0.03 });
  ctx.onFrame((t, dt, cam) => star.quaternion.copy(cam.quaternion));
}

// White dove with flapping wings that hovers at pos.
export function dove(ctx, { pos, scale = 1, face = 0 }) {
  const g = new THREE.Group();
  const mat = ctx.kit.toon('#ffffff', { emissive: '#8a8a80' });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8).scale(0.8, 0.75, 1.6), mat);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat);
  head.position.set(0, 0.1, 0.28);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4).rotateX(Math.PI / 2), ctx.kit.toon('#d8a060'));
  beak.position.set(0, 0.09, 0.4);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.3), mat);
  tail.position.set(0, 0, -0.35);
  g.add(body, head, beak, tail);
  const wings = [-1, 1].map((sx) => {
    const pivot = new THREE.Group();
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.3), mat);
    w.position.x = sx * 0.3;
    pivot.add(w);
    pivot.position.set(sx * 0.08, 0.05, 0);
    g.add(pivot);
    return { pivot, sx };
  });
  g.position.set(...pos);
  g.rotation.y = face;
  g.scale.setScalar(scale);
  ctx.scene.add(g);
  ctx.onFrame((t) => {
    for (const { pivot, sx } of wings) pivot.rotation.z = sx * Math.sin(t * 7) * 0.7;
    g.position.y = pos[1] + Math.sin(t * 1.1) * 0.25;
  });
  return g;
}

// A row of columns under a flat roof: a portico along from -> to, roofed toward -normal side by depth.
export function portico(b, ctx, { from, to, depth = 6, height = 7, count = 10, color = '#efe3c2', roof = '#d8c095', y = null }) {
  const [ax, az] = from, [bx, bz] = to;
  const L = Math.hypot(bx - ax, bz - az);
  const rot = -Math.atan2(bz - az, bx - ax);
  const x = (ax + bx) / 2, z = (az + bz) / 2;
  const gy = y ?? ctx.terrainHeight(x, z);
  const f = frameAt(x, gy, z, rot);
  for (const row of [0, -depth]) {
    for (let i = 0; i < count; i++) {
      const lx = -L / 2 + (i + 0.5) * (L / count);
      b.add(color, cyl(0.38, 0.45, height, [lx, height / 2, row], [0, 0, 0], 10), { frame: f });
      b.add(roof, box(1.1, 0.35, 1.1, [lx, height + 0.1, row]), { frame: f });
      const c = Math.cos(rot), s = Math.sin(rot);
      ctx.addCollider({ x: x + lx * c + row * s, z: z - lx * s + row * c, hx: 0.45, hz: 0.45, rot: 0, top: gy + height });
    }
  }
  b.add(roof, box(L + 1.2, 1.1, depth + 1.6, [0, height + 0.8, -depth / 2]), { frame: f });
  b.add(color, box(L + 1.2, 0.5, depth + 1.8, [0, height + 1.5, -depth / 2]), { frame: f });
  b.add('#8a7a62', box(L + 0.6, 0.1, depth + 1, [0, 0.05, -depth / 2]), { frame: f, cast: false });
}
