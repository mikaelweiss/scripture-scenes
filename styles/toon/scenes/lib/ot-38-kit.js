// Shared props for ot-38 to ot-44: batching, figures, fire, glows, sky bodies, buildings, and smoke.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { boxGeo, makeRng } from '../../engine/util.js';

export { boxGeo, makeRng };

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

  add(color, geo, { glow = false, emissive = null, cast = true, frame = null, stone = false, fret = null } = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo;
    g.clearGroups();
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (frame) g.applyMatrix4(frame);
    const key = [color, glow, emissive, cast, stone, fret].join('|');
    if (!this.sets.has(key)) this.sets.set(key, { color, glow, emissive, cast, stone, fret, geos: [] });
    this.sets.get(key).geos.push(g);
    return this;
  }

  flush() {
    const { kit, scene } = this.ctx;
    for (const s of this.sets.values()) {
      const mat = s.glow ? kit.basic(s.color)
        : s.fret ? kit.fretMat(s.color, s.fret)
        : s.stone ? kit.stoneMat(s.color)
        : kit.toon(s.color, { emissive: s.emissive ?? 0x000000 });
      const mesh = new THREE.Mesh(mergeGeometries(s.geos), mat);
      mesh.castShadow = s.cast && !s.glow;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
    this.sets.clear();
  }
}

export const frameAt = (x, y, z, rotY = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(1, 1, 1));

export const box = (w, h, d, pos, rot) => xf(new THREE.BoxGeometry(w, h, d), { pos, rot });
export const cyl = (rt, rb, h, pos, rot, seg = 8) => xf(new THREE.CylinderGeometry(rt, rb, h, seg), { pos, rot });
export const ball = (r, pos, scale = [1, 1, 1], seg = 10) => xf(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), { pos, scale });

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

export const TENT_COLORS = ['#5e4632', '#6b5440', '#4a3a2c', '#7a6248', '#8c7458', '#3e3026', '#a08a68'];
export const MOSES = { robe: '#e6d8b8', mantle: '#8c5a3c', skin: '#a8724a', hair: '#e8e2d4', sash: '#c8912e' };
export const AARON = { robe: '#f1ead8', mantle: '#4f6fa0', skin: '#a8724a', hair: '#cfc6b4', sash: '#b5523b' };
export const PRIEST = { robe: '#f3eee0', mantle: '#e6dcc4', skin: '#9c6a45', hair: '#2b1a12', sash: '#4f6fa0' };

const zoneHit = (zones, x, z) => zones.some((zn) => (zn.kind === 'circle' ? Math.hypot(x - zn.x, z - zn.z) < zn.r : Math.abs(x - zn.x) < zn.hx && Math.abs(z - zn.z) < zn.hz));

// The tents of Israel scattered in a ring, doors toward the center.
export function camp(b, ctx, { center = [0, 0], ring = [20, 120], count = 120, seed = 9, keepOut = [], colors = TENT_COLORS, face = null }) {
  const rng = makeRng(seed);
  const [cx, cz] = center;
  const [fx, fz] = face ?? center;
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 20; tries++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(ring[0] ** 2 + rng() * (ring[1] ** 2 - ring[0] ** 2));
    const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
    if (zoneHit(keepOut, x, z) || ctx.blocked(x, z, 2.2)) continue;
    const w = 3.2 + rng() * 1.6, d = 3.4 + rng() * 2.4;
    const rot = Math.atan2(fx - x, fz - z) + (rng() - 0.5) * 0.6;
    const c = colors[Math.floor(rng() * colors.length)];
    tent(b, ctx, { pos: [x, z], size: [w, d], height: 2.1 + rng() * 0.9, rot, color: c, flap: rng() < 0.4 ? new THREE.Color(c).multiplyScalar(0.8).getStyle() : null });
    placed++;
  }
}

// Many tiny pieces on the ground, drawn without ink so they read as specks of light color.
export function scatter(ctx, { count, center = [0, 0], ring = [0, 50], size = [0.05, 0.1], colors, seed = 3, fx = true, flat = 0.45, avoid = null }) {
  const rng = makeRng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const mat = fx ? new THREE.MeshBasicMaterial({ color: '#ffffff', fog: true }) : ctx.kit.toon('#ffffff');
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const c = new THREE.Color();
  let n = 0;
  for (let i = 0; i < count * 3 && n < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(ring[0] ** 2 + rng() * (ring[1] ** 2 - ring[0] ** 2));
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (avoid && zoneHit(avoid, x, z)) continue;
    if (ctx.blocked(x, z, 0)) continue;
    const s = size[0] + rng() * (size[1] - size[0]);
    m4.compose(v3.set(x, ctx.terrainHeight(x, z) + s * 0.2, z), qt.setFromEuler(eu.set(rng() * 3, rng() * 3, rng() * 3)), s3.set(s, s * flat, s));
    mesh.setMatrixAt(n, m4);
    mesh.setColorAt(n, c.set(colors[Math.floor(rng() * colors.length)]));
    n++;
  }
  mesh.count = n;
  if (fx) mesh.layers.set(FX_LAYER);
  else mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}

// Rising, swelling puffs: smoke from a mountain or an altar.
export function smoke(ctx, { pos, count = 30, size = [4, 8], rise = 60, spread = 10, drift = [8, 2], speed = 0.04, color = '#8a8290', shade = '#2e2a36', seed = 6 }) {
  const rng = makeRng(seed);
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), ctx.kit.toon(color, { emissive: shade }), count);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ctx.scene.add(mesh);
  const puffs = Array.from({ length: count }, (_, i) => ({ ox: (rng() - 0.5) * spread, oz: (rng() - 0.5) * spread, phase: i / count + rng() * 0.03, size: size[0] + rng() * (size[1] - size[0]) }));
  ctx.onFrame((t) => {
    puffs.forEach((p, i) => {
      const life = (t * speed + p.phase) % 1;
      const s = p.size * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, life * 1.1))) * Math.min(1, life * 6) * (0.7 + life * 0.8);
      m4.compose(v3.set(pos[0] + p.ox * (1 + life) + life * life * drift[0], pos[1] + life * rise, pos[2] + p.oz * (1 + life) + life * life * drift[1]), qt.identity(), s3.set(s, s * 0.8, s));
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return mesh;
}

// A column of cloud standing on the ground, optionally lit from within by fire.
export function pillar(ctx, { pos, height = 70, radius = 6, color = '#f4f0e6', shade = '#8a8698', fire = false, seed = 12 }) {
  const rng = makeRng(seed);
  const [x, z] = pos;
  const y0 = ctx.terrainHeight(x, z);
  const n = Math.round(height / (radius * 0.55));
  const mat = ctx.kit.toon(color, { emissive: fire ? '#c8501c' : shade, unique: true });
  mat.fog = false;
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), mat, n * 2);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const r = radius * (0.75 + 0.5 * t + rng() * 0.2);
    for (let k = 0; k < 2; k++) puffs.push({ y: y0 + t * height + radius * 0.4, r, a: rng() * 6.28, off: radius * (0.25 + rng() * 0.3), ph: rng() * 6 });
  }
  ctx.onFrame((t) => {
    puffs.forEach((p, i) => {
      const a = p.a + t * 0.25;
      const s = p.r * (0.92 + 0.08 * Math.sin(t * 0.8 + p.ph));
      m4.compose(v3.set(x + Math.cos(a) * p.off, p.y + Math.sin(t * 0.5 + p.ph) * 0.6, z + Math.sin(a) * p.off), qt.identity(), s3.set(s, s * 0.8, s));
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  if (fire) {
    for (let i = 0; i < 5; i++) glow(ctx, { pos: [x, y0 + height * (0.1 + i * 0.2), z], size: radius * 5, color: '#ffb050', opacity: 0.55, pulse: 0.06 });
    const l = new THREE.PointLight('#ffa450', 60, 120, 1.2);
    l.position.set(x, y0 + 12, z);
    ctx.scene.add(l);
    ctx.onFrame((t) => (l.intensity = 60 * (0.85 + 0.15 * Math.sin(t * 7) * Math.sin(t * 3.1))));
  }
  return mesh;
}

// Jagged bolts that flash now and then between a cloud and a peak.
export function lightning(ctx, { top, bottom, count = 3, color = '#fff6d0', light = null, seed = 8 }) {
  const rng = makeRng(seed);
  const bolts = [];
  for (let k = 0; k < count; k++) {
    const pts = [];
    const sx = top[0] + (rng() - 0.5) * 40, sz = top[2] + (rng() - 0.5) * 30;
    const ex = bottom[0] + (rng() - 0.5) * 20, ez = bottom[2] + (rng() - 0.5) * 15;
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const j = i === 0 || i === n ? 0 : 1;
      pts.push(new THREE.Vector3(sx + (ex - sx) * t + j * (rng() - 0.5) * 10, top[1] + (bottom[1] - top[1]) * t, sz + (ez - sz) * t + j * (rng() - 0.5) * 8));
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 40, 0.7, 4, false);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, fog: false, transparent: true }));
    mesh.layers.set(FX_LAYER);
    mesh.visible = false;
    ctx.scene.add(mesh);
    bolts.push({ mesh, period: 2.5 + rng() * 3, ph: rng() * 5 });
  }
  let L = null;
  if (light) {
    L = new THREE.PointLight(light.color, 0, light.distance, 1);
    L.position.set(...top);
    ctx.scene.add(L);
  }
  ctx.onFrame((t) => {
    let on = 0;
    for (const bo of bolts) {
      const f = ((t + bo.ph) % bo.period) / bo.period;
      bo.mesh.visible = f < 0.04 || (f > 0.06 && f < 0.08);
      if (bo.mesh.visible) on = 1;
    }
    if (L) L.intensity = on * light.intensity;
  });
}

// A figure lying down, propped up by `prop` radians. Head points along `dir` (radians around Y).
export function lying(ctx, { pos, dir = 0, colors, prop = 0.3 }) {
  const [x, z] = pos;
  const g = new THREE.Group();
  const fig = makeFigure(colors, ctx.kit);
  fig.rotation.x = -Math.PI / 2 + prop;
  fig.position.y = 0.3;
  g.add(fig);
  g.position.set(x, ctx.terrainHeight(x, z), z);
  g.rotation.y = dir + Math.PI;
  ctx.scene.add(g);
  ctx.exclude({ kind: 'circle', x, z, r: 1.2 });
  return g;
}

export function sheep(b, ctx, { pos, rot = 0, color = '#ece4d2', face = '#3a2a20' }) {
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z), z, rot);
  b.add(color, ball(0.42, [0, 0.62, 0], [0.9, 0.8, 1.35]), { frame: f });
  b.add(face, ball(0.17, [0, 0.78, 0.55], [0.8, 0.9, 1.3]), { frame: f });
  for (const [lx, lz] of [[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]]) b.add(face, cyl(0.045, 0.045, 0.4, [lx, 0.2, lz], [0, 0, 0], 5), { frame: f });
}

export function ox(b, ctx, { pos, rot = 0, color = '#7a5236' }) {
  const [x, z] = pos;
  const f = frameAt(x, ctx.terrainHeight(x, z), z, rot);
  const dark = new THREE.Color(color).multiplyScalar(0.7).getStyle();
  b.add(color, ball(0.62, [0, 1.05, 0], [0.85, 0.8, 1.6]), { frame: f });
  b.add(color, box(0.42, 0.42, 0.55, [0, 1.15, 1.05], [0.3, 0, 0]), { frame: f });
  b.add('#e8dcc0', cyl(0.04, 0.06, 0.8, [0, 1.42, 0.98], [0, 0, Math.PI / 2], 5), { frame: f });
  for (const [lx, lz] of [[-0.28, 0.6], [0.28, 0.6], [-0.28, -0.6], [0.28, -0.6]]) b.add(dark, cyl(0.09, 0.08, 0.75, [lx, 0.37, lz], [0, 0, 0], 6), { frame: f });
  ctx.addCollider({ x, z, hx: 0.5, hz: 1.1, rot, top: ctx.terrainHeight(x, z) + 1.5 });
  ctx.exclude({ kind: 'circle', x, z, r: 1.6 });
}

// A golden calf on a plinth, facing +z local.
export function calf(b, ctx, { pos, y, rot = 0, color = '#e0a832', glowColor = '#7a4a08' }) {
  const [x, z] = pos;
  const f = frameAt(x, y, z, rot);
  const opts = { frame: f, emissive: glowColor };
  b.add(color, ball(0.6, [0, 1.1, 0], [0.85, 0.75, 1.5]), opts);
  b.add(color, box(0.42, 0.45, 0.52, [0, 1.45, 0.95], [0.25, 0, 0]), opts);
  b.add(color, cyl(0.035, 0.05, 0.5, [0.24, 1.78, 0.9], [0, 0, -0.9], 5), opts);
  b.add(color, cyl(0.035, 0.05, 0.5, [-0.24, 1.78, 0.9], [0, 0, 0.9], 5), opts);
  for (const [lx, lz] of [[-0.26, 0.55], [0.26, 0.55], [-0.26, -0.55], [0.26, -0.55]]) b.add(color, cyl(0.08, 0.07, 0.75, [lx, 0.38, lz], [0, 0, 0], 6), opts);
  b.add(color, cyl(0.03, 0.03, 0.7, [0, 1.0, -0.95], [0.4, 0, 0], 4), opts);
}

// Two round-topped stone tablets side by side, upright, facing +z.
export function tablets(color = '#cfc8b8') {
  const shape = new THREE.Shape();
  shape.moveTo(-0.17, 0);
  shape.lineTo(0.17, 0);
  shape.lineTo(0.17, 0.36);
  shape.absarc(0, 0.36, 0.17, 0, Math.PI, false);
  shape.lineTo(-0.17, 0);
  const one = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
  const a = one.clone().translate(-0.18, 0, 0);
  const c = one.clone().translate(0.18, 0, 0);
  return { geo: mergeGeometries([a.toNonIndexed(), c.toNonIndexed()]), color };
}

// Adds a mesh in toon material to a figure group (or any group) at a local transform.
export function attach(ctx, group, geo, color, { pos = [0, 0, 0], rot = [0, 0, 0], emissive = 0x000000 } = {}) {
  const m = new THREE.Mesh(geo, ctx.kit.toon(color, { emissive }));
  m.position.set(...pos);
  m.rotation.set(rot[0], rot[1], rot[2], 'YXZ');
  m.castShadow = true;
  group.add(m);
  return m;
}

// The ark of the covenant: a gilded chest with two cherubim and carrying poles along x.
export function arkGroup(ctx, { gold = '#e0b040' } = {}) {
  const g = new THREE.Group();
  const em = '#6a4508';
  attach(ctx, g, new THREE.BoxGeometry(1.15, 0.68, 0.68), gold, { pos: [0, 0.34, 0], emissive: em });
  attach(ctx, g, new THREE.BoxGeometry(1.25, 0.08, 0.76), gold, { pos: [0, 0.72, 0], emissive: em });
  for (const s of [-1, 1]) {
    attach(ctx, g, new THREE.ConeGeometry(0.14, 0.5, 6), gold, { pos: [s * 0.4, 1.0, 0], emissive: em });
    attach(ctx, g, new THREE.BoxGeometry(0.06, 0.3, 0.5), gold, { pos: [s * 0.3, 1.1, 0], rot: [0, 0, s * 0.9], emissive: em });
    attach(ctx, g, new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6), '#b08830', { pos: [0, 0.2, s * 0.42], rot: [0, 0, Math.PI / 2], emissive: em });
  }
  return g;
}

// A ram's horn trumpet held to the mouth, for a figure group.
export function shofar(ctx, fig, color = '#d8c49a') {
  const geo = new THREE.ConeGeometry(0.07, 0.6, 7, 1, true);
  geo.rotateX(-Math.PI / 2);
  attach(ctx, fig, geo, color, { pos: [0, 1.62, 0.42], rot: [-0.45, 0, 0] });
}
