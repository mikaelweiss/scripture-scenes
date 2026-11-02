// Shared props for ot-07 to ot-12: tents, camels, flocks, altars, wells, angels, fire and night sky.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure } from '../../engine/people.js';
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
  for (const side of [-1, 1]) {
    for (const pz of [-d * 0.3, d * 0.3]) {
      const len = height * 1.25;
      b.add('#b49a74', cyl(0.025, 0.025, len, [side * (w / 2 + len * 0.3), height * 0.42, pz], [0, 0, side * 1.05], 4), { frame: f, cast: false });
      b.add(pole, box(0.12, 0.3, 0.12, [side * (w / 2 + len * 0.62), 0.1, pz]), { frame: f });
    }
  }
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
  b.add(color, cyl(0.16, 0.22, 1.25, [0, lift + 0.85, 0.95], [0.75, 0, 0], 7), { frame: f });
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
export function palm(b, ctx, { pos, height = 8, lean = 0.15, dir = 0, trunk = '#7a5a3c', leaf = '#4f8a4a', leafDark = '#3e7442', seed = 1 }) {
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
    const g = new THREE.ConeGeometry(0.45, 3.4, 4);
    g.scale(1, 1, 0.15);
    g.translate(0, 1.7, 0);
    g.rotateX(1.25 + rng() * 0.5);
    g.rotateY(a);
    g.translate(px, py, 0);
    b.add(i % 2 ? leaf : leafDark, g, { frame: f });
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
        idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
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

export const NIGHT_STYLE = {
  ...DAY_STYLE,
  ink: '#0e0a18',
  toonSteps: [0.35, 0.7, 1.0],
  fog: { color: '#1c2342', near: 90, far: 700 },
  smoke: '#4a4658',
  smokeShade: '#15121f',
};

export const DESERT_GROUND = {
  sand: '#d4ac6c',
  dirt: '#bf8d55',
  grass: '#9a9a5a',
  grassDark: '#76784a',
  plaza: '#c9a46a',
  plazaLine: '#b08c58',
  scorch: '#3a2a22',
  scorchEdge: '#6e4630',
  hill: '#a8875a',
};

// A figure with posable arms and lean. arms: [out, forward]; lean tips the body forward.
export function figure(ctx, { pos, face, colors, scale = 1, glow: g = 0, lean = 0, kneel = false, y = null, clear = 0.9 }) {
  const fig = makeFigure(colors, ctx.kit, { glow: g });
  const [x, z] = pos;
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.set(scale, kneel ? scale * 0.62 : scale, scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  fig.rotation.order = 'YXZ';
  fig.rotation.x = lean;
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

// A figure lying face up with feet at pos and head toward headDir (radians around Y, 0 = -z). Returns the head position.
export function sleeper(ctx, { pos, headDir = 0, colors, scale = 1 }) {
  const fig = makeFigure(colors, ctx.kit);
  const [x, z] = pos;
  const holder = new THREE.Group();
  holder.position.set(x, ctx.terrainHeight(x, z) + 0.26 * scale, z);
  holder.rotation.y = headDir;
  fig.rotation.x = -Math.PI / 2;
  fig.scale.setScalar(scale);
  holder.add(fig);
  ctx.scene.add(holder);
  const hx = x - Math.sin(headDir) * 1.6 * scale, hz = z - Math.cos(headDir) * 1.6 * scale;
  ctx.exclude({ kind: 'circle', x: (x + hx) / 2, z: (z + hz) / 2, r: 1.2 });
  return [hx, hz];
}

export const ANGEL = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#f6eedd', hair: '#f6eedd', sash: '#efe3c2' };

// A faceless white messenger with soft light.
export function angel(ctx, { pos, y = null, face, scale = 1.05, light = 0.55, halo = 3.2, arms = null }) {
  const colors = arms ? { ...ANGEL, arms } : ANGEL;
  const fig = figure(ctx, { pos, y, face, colors, scale, glow: light, clear: 1 });
  glow(ctx, { pos: [fig.position.x, fig.position.y + 1.1 * scale, fig.position.z], size: halo, color: '#fff3d0', opacity: 0.55 });
  return fig;
}

export function sheep(b, ctx, { pos, rot = 0, color = '#ece4d0', face = '#3a2a20' }) {
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z), z, rot);
  b.add(color, ball(0.42, [0, 0.62, 0], [0.9, 0.8, 1.3], 8), { frame: f });
  b.add(face, box(0.2, 0.24, 0.32, [0, 0.78, 0.5], [0.3, 0, 0]), { frame: f });
  for (const [lx, lz] of [[-0.14, 0.25], [0.14, 0.25], [-0.14, -0.25], [0.14, -0.25]]) b.add(face, cyl(0.04, 0.04, 0.4, [lx, 0.2, lz], [0, 0, 0], 5), { frame: f });
}

export function flock(b, ctx, { center, radius, count, seed = 3, colors = ['#ece4d0', '#ddd2b8', '#3a2a20', '#f2ecdc'], avoid = () => false }) {
  const rng = makeRng(seed);
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * radius;
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (avoid(x, z) || ctx.blocked(x, z, 0.4)) continue;
    const c = colors[Math.floor(rng() * colors.length)];
    if (c === '#3a2a20') goat(b, ctx, { pos: [x, z], rot: rng() * 6.28, color: c });
    else sheep(b, ctx, { pos: [x, z], rot: rng() * 6.28, color: c });
  }
}

// Ram with curled horns, facing +z local.
export function ram(b, ctx, { pos, rot = 0, color = '#e2d8c0', horn = '#8a6a44', y = null }) {
  const [x, z] = pos;
  const f = frameAt(x, y ?? ctx.terrainHeight(x, z), z, rot);
  b.add(color, ball(0.5, [0, 0.75, 0], [0.9, 0.85, 1.35], 9), { frame: f });
  b.add('#4a3a2c', box(0.26, 0.3, 0.42, [0, 1.0, 0.68], [0.35, 0, 0]), { frame: f });
  for (const s of [-1, 1]) {
    const h = new THREE.TorusGeometry(0.16, 0.06, 6, 12, Math.PI * 1.6);
    h.rotateY(Math.PI / 2);
    b.add(horn, h, { frame: frameAt(0, 0, 0).multiply(new THREE.Matrix4().makeTranslation(s * 0.2, 1.12, 0.55)).premultiply(f) });
  }
  for (const [lx, lz] of [[-0.17, 0.32], [0.17, 0.32], [-0.17, -0.32], [0.17, -0.32]]) b.add('#4a3a2c', cyl(0.05, 0.05, 0.5, [lx, 0.25, lz], [0, 0, 0], 5), { frame: f });
}

// Tangled thicket of bare branches around a center.
export function thicket(b, ctx, { pos, radius = 1.6, height = 1.8, seed = 9, color = '#5a4030', leaf = '#6f7a3a' }) {
  const rng = makeRng(seed);
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2, r = radius * (0.3 + rng() * 0.7);
    const len = height * (0.6 + rng() * 0.6);
    b.add(color, cyl(0.03, 0.06, len, [x + Math.sin(a) * r * 0.6, y + len * 0.4, z + Math.cos(a) * r * 0.6], [(rng() - 0.5) * 1.4, a, (rng() - 0.5) * 1.4], 4));
  }
  for (let i = 0; i < 7; i++) {
    const a = rng() * Math.PI * 2, r = radius * rng();
    b.add(leaf, ball(0.45 + rng() * 0.3, [x + Math.sin(a) * r, y + 0.4 + rng() * height * 0.6, z + Math.cos(a) * r], [1.2, 0.7, 1], 6));
  }
  ctx.addCollider({ x, z, hx: radius * 0.7, hz: radius * 0.7, rot: 0, top: y + height });
}

// Rough stone altar with laid wood on top. Returns the top height.
export function altar(b, ctx, { pos, size = [2.2, 1.1, 1.4], rot = 0, stone = '#b8a888', wood = '#7a5636', seed = 5 }) {
  const rng = makeRng(seed);
  const [x, z] = pos;
  const [w, h, d] = size;
  const y = ctx.terrainHeight(x, z) - 0.05;
  const f = frameAt(x, y, z, rot);
  const rows = 3;
  for (let r = 0; r < rows; r++) {
    const rh = h / rows;
    for (let i = 0; i < 4; i++) {
      for (const side of [-1, 1]) {
        const shade = new THREE.Color(stone).multiplyScalar(0.88 + rng() * 0.2).getStyle();
        b.add(shade, box(w / 4 + 0.05, rh * 0.95, d / 2, [-w / 2 + (i + 0.5) * (w / 4) + (rng() - 0.5) * 0.06, r * rh + rh / 2, side * d / 4]), { frame: f });
      }
    }
  }
  for (let i = 0; i < 6; i++) b.add(i % 2 ? wood : '#6a4a30', cyl(0.07, 0.08, w * 0.9, [0, h + 0.08 + (i > 3 ? 0.14 : 0), -d / 2 + 0.25 + (i % 4) * (d - 0.5) / 3], [0, 0, Math.PI / 2], 6), { frame: f });
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + h + 0.3 });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.5, hz: d / 2 + 0.5, rot });
  return y + h;
}

// Broad shade tree, like the oaks of Mamre.
export function oak(b, ctx, { pos, height = 7, spread = 4.5, trunk = '#5e4430', leaves = ['#55803e', '#4a7238', '#6a8f48'], seed = 2 }) {
  const rng = makeRng(seed);
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z) - 0.2;
  b.add(trunk, cyl(0.45, 0.75, height * 0.65, [x, y + height * 0.32, z], [0, 0, 0.05], 8));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rng();
    b.add(trunk, cyl(0.18, 0.3, spread * 0.8, [x + Math.sin(a) * spread * 0.3, y + height * 0.72, z + Math.cos(a) * spread * 0.3], [0, a, 0.9], 6));
  }
  for (let i = 0; i < 9; i++) {
    const a = rng() * Math.PI * 2, r = i === 0 ? 0 : spread * (0.4 + rng() * 0.5);
    const s = spread * (0.42 + rng() * 0.2);
    b.add(leaves[i % leaves.length], ball(s, [x + Math.sin(a) * r, y + height * 0.85 + rng() * height * 0.25, z + Math.cos(a) * r], [1, 0.62, 1], 10));
  }
  ctx.addCollider({ x, z, hx: 0.6, hz: 0.6, rot: 0, top: y + height });
  ctx.exclude({ kind: 'circle', x, z, r: 1.2 });
}

// Round stone wellhead with a trough beside it, facing +z local.
export function well(b, ctx, { pos, rot = 0, stone = '#c9b58e', water = '#3f8fa0' }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z) - 0.05;
  const f = frameAt(x, y, z, rot);
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const shade = new THREE.Color(stone).multiplyScalar(i % 2 ? 0.92 : 1.04).getStyle();
    b.add(shade, box(0.62, 0.9, 0.38, [Math.sin(a) * 1.3, 0.45, Math.cos(a) * 1.3], [0, a, 0]), { frame: f });
  }
  b.add('#1e2e38', cyl(1.15, 1.15, 0.1, [0, 0.6, 0], [0, 0, 0], 16), { frame: f, cast: false });
  b.add(water, cyl(1.12, 1.12, 0.1, [0, 0.66, 0], [0, 0, 0], 16), { frame: f, emissive: '#10303a' });
  b.add('#a8956e', box(3.4, 0.55, 0.8, [2.9, 0.28, 1.1], [0, 0.4, 0]), { frame: f });
  b.add(water, box(3.0, 0.1, 0.5, [2.9, 0.5, 1.1], [0, 0.4, 0]), { frame: f, emissive: '#10303a' });
  ctx.addCollider({ x, z, hx: 1.5, hz: 1.5, rot: 0, top: y + 0.9 });
  ctx.exclude({ kind: 'circle', x, z, r: 2 });
  const [tx, tz] = [x + Math.cos(rot) * 2.9 + Math.sin(rot) * 1.1, z - Math.sin(rot) * 2.9 + Math.cos(rot) * 1.1];
  ctx.addCollider({ x: tx, z: tz, hx: 1.7, hz: 0.4, rot: rot + 0.4, top: y + 0.55 });
}

export function jar(b, ctx, { pos, y = null, color = '#b5653b', scale = 1 }) {
  const [x, z] = pos;
  const by = y ?? ctx.terrainHeight(x, z);
  b.add(color, ball(0.22 * scale, [x, by + 0.22 * scale, z], [1, 1.2, 1], 8));
  b.add(color, cyl(0.08 * scale, 0.1 * scale, 0.18 * scale, [x, by + 0.5 * scale, z], [0, 0, 0], 7));
}

// Fire and brimstone falling from the sky as looping streaks.
export function fireRain(ctx, { center, radius, count = 80, top = 120, speed = 45, seed = 6, color = '#ffb347', core = '#fff1b0' }) {
  const rng = makeRng(seed);
  const geo = new THREE.ConeGeometry(0.5, 1, 6);
  geo.translate(0, 0.5, 0);
  const outer = new THREE.InstancedMesh(geo, ctx.kit.basic(color), count);
  const inner = new THREE.InstancedMesh(geo, ctx.kit.basic(core), count);
  for (const mesh of [outer, inner]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const drops = Array.from({ length: count }, () => {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * radius;
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    return { x, z, ground: ctx.terrainHeight(x, z), phase: rng(), len: 9 + rng() * 12, w: 0.35 + rng() * 0.5 };
  });
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0, 0.15));
  ctx.onFrame((t) => {
    drops.forEach((d, i) => {
      const life = (t * speed / top + d.phase) % 1;
      const yy = d.ground + top * (1 - life);
      m4.compose(v3.set(d.x + life * 18, yy, d.z + life * 30), tilt, s3.set(d.w, d.len, d.w));
      outer.setMatrixAt(i, m4);
      m4.compose(v3.set(d.x + life * 18, yy, d.z + life * 30), tilt, s3.set(d.w * 0.45, d.len * 0.8, d.w * 0.45));
      inner.setMatrixAt(i, m4);
    });
    outer.instanceMatrix.needsUpdate = inner.instanceMatrix.needsUpdate = true;
  });
}

// Scattered rocks as one instanced batch through the Batch helper.
export function rocks(b, ctx, { center = [0, 0], ring, count, size = [0.3, 1.2], colors = ['#a8987a', '#968668', '#b8a888'], seed = 12, avoid = () => false }) {
  const rng = makeRng(seed);
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(ring[0] ** 2 + rng() * (ring[1] ** 2 - ring[0] ** 2));
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (avoid(x, z)) continue;
    const s = size[0] + rng() * (size[1] - size[0]);
    const g = xf(new THREE.IcosahedronGeometry(s, 0), { pos: [x, ctx.terrainHeight(x, z) + s * 0.25, z], rot: [rng() * 3, rng() * 3, rng() * 3], scale: [1.2, 0.7, 1] });
    b.add(colors[Math.floor(rng() * colors.length)], g);
    if (s > 0.8) ctx.addCollider({ x, z, hx: s * 0.8, hz: s * 0.8, rot: 0, top: ctx.terrainHeight(x, z) + s * 0.6 });
  }
}

export { box, cyl, ball };
