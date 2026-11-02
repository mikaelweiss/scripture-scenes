// Shared props for ot-31 to ot-37: batching, figures, fire, water, horses, chariots, buildings and walls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { makeRng } from '../../engine/util.js';

export { makeRng, FX_LAYER };

const m4 = new THREE.Matrix4();
const qt = new THREE.Quaternion();
const eu = new THREE.Euler();
const v3 = new THREE.Vector3();
const s3 = new THREE.Vector3();

export function xf(geo, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = {}) {
  m4.compose(v3.set(...pos), qt.setFromEuler(eu.set(rot[0], rot[1], rot[2], 'YXZ')), s3.set(...scale));
  return geo.applyMatrix4(m4);
}

export const frameAt = (x, y, z, rotY = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(1, 1, 1));

export const box = (w, h, d, pos, rot) => xf(new THREE.BoxGeometry(w, h, d), { pos, rot });
export const cyl = (rt, rb, h, pos, rot, seg = 8) => xf(new THREE.CylinderGeometry(rt, rb, h, seg), { pos, rot });
export const cone = (r, h, pos, rot, seg = 8) => xf(new THREE.ConeGeometry(r, h, seg), { pos, rot });
export const ball = (r, pos, scale = [1, 1, 1], seg = 10) => xf(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), { pos, scale });
export const rock = (r, pos, scale = [1, 1, 1], rot = [0, 0, 0]) => xf(new THREE.DodecahedronGeometry(r, 0), { pos, scale, rot });

// Collects static geometry by material and merges each set into one mesh.
export class Batch {
  constructor(ctx) {
    this.ctx = ctx;
    this.sets = new Map();
  }

  add(color, geo, { glow = false, emissive = null, cast = true, frame = null } = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo;
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

export function lowestGround(ctx, x, z, hx, hz, rot = 0) {
  let y = Infinity;
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
    const c = Math.cos(rot), s = Math.sin(rot);
    const lx = a * hx, lz = b * hz;
    y = Math.min(y, ctx.terrainHeight(x + lx * c + lz * s, z - lx * s + lz * c));
  }
  return y;
}

// A single special figure. extras: crown, staff, sword, scepter, veil, mantleHood.
export function figure(ctx, { pos, y = null, facing = null, rotY = null, colors, scale = 1, glow = 0, clear = 1, extras = {}, lean = 0, kneel = false }) {
  const [x, z] = pos;
  const g = makeFigure(colors, ctx.kit, { glow });
  const mat = (hex) => ctx.kit.toon(hex, { emissive: new THREE.Color(hex).multiplyScalar(glow) });
  const part = (geo, hex) => {
    const m = new THREE.Mesh(geo, mat(hex));
    m.castShadow = true;
    g.add(m);
    return m;
  };
  if (extras.crown) {
    part(cyl(0.15, 0.13, 0.14, [0, 1.74, 0], [0, 0, 0], 10), extras.crown);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      part(cone(0.035, 0.1, [Math.sin(a) * 0.14, 1.85, Math.cos(a) * 0.14], [0, 0, 0], 4), extras.crown);
    }
  }
  if (extras.tallHat) part(cyl(0.15, 0.13, 0.32, [0, 1.84, 0], [0, 0, 0], 10), extras.tallHat);
  if (extras.helmet) part(cone(0.15, 0.3, [0, 1.8, 0], [0, 0, 0], 8), extras.helmet);
  if (extras.veil) part(cyl(0.12, 0.3, 1.2, [0, 1.15, -0.06], [0, 0, 0], 10), extras.veil);
  if (extras.staff) part(cyl(0.03, 0.035, 2.0, [0.34, 1.0, 0.12], [0, 0, 0], 6), extras.staff);
  if (extras.sword) part(box(0.05, 0.75, 0.1, [-0.27, 0.72, 0.05], [0, 0, 0.12]), extras.sword);
  if (extras.spear) part(cyl(0.025, 0.025, 2.6, [0.34, 1.3, 0.1], [0, 0, 0], 5), extras.spear);
  if (extras.shield) part(cyl(0.32, 0.32, 0.06, [-0.3, 1.0, 0.18], [Math.PI / 2, 0, 0.3], 12), extras.shield);
  if (extras.load) part(box(0.4, 0.3, 0.3, [0, 1.95, 0]), extras.load);
  if (extras.trumpet) part(cone(0.07, 0.6, [0.0, 1.62, 0.38], [Math.PI / 2 + 0.3, 0, 0], 8), extras.trumpet);
  g.position.set(x, y ?? ctx.groundHeight(x, z), z);
  g.scale.setScalar(scale);
  if (kneel) g.scale.y = scale * 0.62;
  if (rotY != null) g.rotation.y = rotY;
  else if (facing) g.rotation.y = Math.atan2(facing[0] - x, facing[1] - z);
  g.rotation.x = lean;
  ctx.scene.add(g);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return g;
}

export function glow(ctx, pos, size, color, opacity = 0.7, pulse = 0.05) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(...pos);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) {
    const ph = Math.random() * 6;
    ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.7 + ph) * pulse)));
  }
  return s;
}

// Flickering flame cones. spots: [[x, y, z, height, width]].
export function flames(ctx, spots, { outer = '#f08a2c', inner = '#ffe08a', speed = 1 } = {}) {
  const geo = new THREE.ConeGeometry(0.3, 1, 6);
  geo.translate(0, 0.5, 0);
  const o = new THREE.InstancedMesh(geo, ctx.kit.basic(outer), spots.length);
  const i2 = new THREE.InstancedMesh(geo, ctx.kit.basic(inner), spots.length);
  for (const mesh of [o, i2]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const phases = spots.map((_, i) => i * 1.7 + Math.random());
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    spots.forEach(([x, y, z, h, w = 1], i) => {
      const f = 0.75 + 0.25 * Math.sin(t * 9 * speed + phases[i]) * Math.sin(t * 5.3 * speed + phases[i] * 2);
      o.setMatrixAt(i, m.compose(v.set(x, y, z), q.identity(), s.set(w, h * f, w)));
      i2.setMatrixAt(i, m.compose(v.set(x, y + 0.02, z), q.identity(), s.set(w * 0.5, h * f * 0.62, w * 0.5)));
    });
    o.instanceMatrix.needsUpdate = i2.instanceMatrix.needsUpdate = true;
  });
}

// Fire spots scattered in a disk.
export function fireSpots(rng, x, y, z, radius, count, [h0, h1], width = 1) {
  return Array.from({ length: count }, () => {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * radius;
    return [x + Math.sin(a) * r, y, z + Math.cos(a) * r, h0 + rng() * (h1 - h0), width * (0.7 + rng() * 0.6)];
  });
}

function waterTexture(base, line) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = line;
  g.lineCap = 'round';
  const rng = makeRng(9);
  for (let i = 0; i < 26; i++) {
    const x = rng() * 256, y = rng() * 256, w = 20 + rng() * 50;
    g.lineWidth = 2 + rng() * 3;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + w / 2, y - 5, x + w, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// A flowing river strip from a to b. Its surface sits `depth` above the ground so walkers wade.
export function river(ctx, { from, to, width, y, color = '#4f8fa0', line = '#cfe6e2', flow = 0.06, banks = '#b59a6a', rngSeed = 4 }) {
  const [ax, az] = from, [bx, bz] = to;
  const len = Math.hypot(bx - ax, bz - az);
  const rot = Math.atan2(bx - ax, bz - az);
  const tex = waterTexture(color, line);
  tex.repeat.set(width / 14, len / 14);
  const mat = ctx.kit.toon('#ffffff', { map: tex, unique: true });
  const geo = new THREE.PlaneGeometry(width, len, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((ax + bx) / 2, y, (az + bz) / 2);
  mesh.rotation.y = rot;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (tex.offset.y = -t * flow));
  ctx.exclude({ kind: 'rect', x: (ax + bx) / 2, z: (az + bz) / 2, hx: width / 2 + 0.6, hz: len / 2, rot });
  // Reeds and stones on both banks.
  const b = new Batch(ctx);
  const rng = makeRng(rngSeed);
  const dirX = (bx - ax) / len, dirZ = (bz - az) / len;
  for (let i = 0; i < len / 1.5; i++) {
    const f = rng();
    for (const side of [-1, 1]) {
      if (rng() < 0.4) continue;
      const off = side * (width / 2 + rng() * 1.6 - 0.3);
      const px = ax + dirX * f * len + dirZ * off, pz = az + dirZ * f * len - dirX * off;
      const gy = Math.max(ctx.terrainHeight(px, pz), y - 0.2);
      if (rng() < 0.55) {
        for (let k = 0; k < 4; k++) b.add(rng() < 0.5 ? '#6c8a44' : '#8e9a58', cone(0.06, 0.9 + rng() * 0.8, [px + (rng() - 0.5) * 0.6, gy + 0.45, pz + (rng() - 0.5) * 0.6], [(rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3], 4), { cast: false });
      } else {
        b.add(banks, rock(0.25 + rng() * 0.35, [px, gy + 0.05, pz], [1.3, 0.6, 1], [rng(), rng() * 3, rng()]));
      }
    }
  }
  b.flush();
  return { rot, len, dir: [dirX, dirZ] };
}

const UP = new THREE.Vector3(0, 1, 0);

// Geometry built along +y and centered, stretched between points p and q.
function between(geo, p, q) {
  const a = new THREE.Vector3(...p), d = new THREE.Vector3(...q).sub(a);
  const len = d.length();
  geo.scale(1, len, 1);
  geo.applyMatrix4(new THREE.Matrix4().compose(a.addScaledVector(d, 0.5), new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()), new THREE.Vector3(1, 1, 1)));
  return geo;
}
const limb = (p, q, r0, r1, seg = 7) => between(new THREE.CylinderGeometry(r1, r0, 1, seg), p, q);

const NECK = [[0, 1.42, 0.62], [0, 1.82, 0.86], [0, 2.14, 1.04], [0, 2.3, 1.22]];
const NECK_R = [0.3, 0.22, 0.17, 0.14];
const MUZZLE = [0, 1.86, 1.66];
const HIP = [0, 1.25, -0.62];

// A horse facing +z in local space, about 1.6 m at the withers, with an arched neck, tapered head,
// crest mane, flowing tail and jointed slender legs. rear lifts the forehand about the hips.
export function horse(b, frame, { color = '#7a5a3c', mane = '#2b1a12', glow = false, rear = 0, scale = 1 } = {}) {
  const f = frame.clone().multiply(new THREE.Matrix4().makeScale(scale, scale, scale));
  const opt = { glow, frame: f };
  const lift = new THREE.Matrix4().makeTranslation(...HIP).multiply(new THREE.Matrix4().makeRotationX(-rear)).multiply(new THREE.Matrix4().makeTranslation(-HIP[0], -HIP[1], -HIP[2]));
  const fore = (geo) => (rear ? geo.applyMatrix4(lift) : geo);
  const coat = (geo) => b.add(color, fore(geo), opt);
  const hair = (geo) => b.add(mane, fore(geo), opt);

  // Barrel, chest and rump.
  coat(xf(new THREE.CapsuleGeometry(0.38, 1.05, 4, 10), { pos: [0, 1.3, 0], rot: [Math.PI / 2, 0, 0], scale: [0.92, 1, 1.08] }));
  coat(ball(0.4, [0, 1.36, 0.5], [0.9, 1, 1]));
  b.add(color, ball(0.42, [0, 1.36, -0.6], [0.95, 0.95, 1]), opt);
  // Arched neck and head.
  for (let i = 0; i < 3; i++) coat(limb(NECK[i], NECK[i + 1], NECK_R[i], NECK_R[i + 1], 9));
  coat(ball(0.15, NECK[3], [0.85, 1, 1]));
  coat(limb(NECK[3], MUZZLE, 0.15, 0.1, 9));
  coat(ball(0.16, [0, 2.1, 1.34], [0.75, 1, 1.1]));
  coat(ball(0.11, MUZZLE, [0.9, 0.85, 1]));
  for (const s of [-1, 1]) coat(xf(new THREE.ConeGeometry(0.045, 0.18, 5), { pos: [s * 0.07, 2.44, 1.2], rot: [-0.2, 0, s * 0.2] }));
  // Mane along the crest, a forelock, and the tail.
  for (let i = 0; i < 3; i++) {
    const [, y0, z0] = NECK[i], [, y1, z1] = NECK[i + 1];
    const len = Math.hypot(y1 - y0, z1 - z0), ny = (z1 - z0) / len, nz = -(y1 - y0) / len;
    const o = NECK_R[i] * 0.9;
    hair(between(new THREE.BoxGeometry(0.07, 1, 0.2), [0, y0 + ny * o, z0 + nz * o], [0, y1 + ny * o * 0.9, z1 + nz * o * 0.9]));
  }
  hair(xf(new THREE.ConeGeometry(0.06, 0.22, 4), { pos: [0, 2.32, 1.36], rot: [2.4, 0, 0] }));
  b.add(mane, limb([0, 1.55, -0.98], [0, 1.15, -1.22], 0.06, 0.12), opt);
  b.add(mane, limb([0, 1.15, -1.22], [0, 0.55, -1.3], 0.12, 0.04), opt);
  // Legs: forearm, knee, cannon, hoof in front; gaskin, hock, cannon, hoof behind.
  for (const s of [-1, 1]) {
    const x = s * 0.2;
    if (rear) {
      coat(limb([x, 1.15, 0.55], [x, 0.78, 0.86], 0.09, 0.06));
      coat(limb([x, 0.78, 0.86], [x, 0.45, 0.66], 0.05, 0.045));
      hair(xf(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 7), { pos: [x, 0.42, 0.62], rot: [-0.9, 0, 0] }));
    } else {
      coat(limb([x, 1.15, 0.55], [x, 0.58, 0.58], 0.1, 0.06));
      coat(limb([x, 0.58, 0.58], [x, 0.12, 0.6], 0.048, 0.045));
      b.add(mane, cyl(0.06, 0.075, 0.12, [x, 0.06, 0.61], [0, 0, 0], 7), opt);
    }
    const hz = rear ? -0.45 : -0.68;
    b.add(color, limb([x, 1.28, -0.58], [x, 0.66, -0.82], 0.15, 0.07), opt);
    b.add(color, limb([x, 0.66, -0.82], [x, 0.12, hz], 0.05, 0.045), opt);
    b.add(mane, cyl(0.06, 0.075, 0.12, [x, 0.06, hz], [0, 0, 0], 7), opt);
  }
}

// A two-wheeled chariot facing +z, with its pole running forward to the team.
export function chariot(b, frame, { body = '#8c5a3c', trim = '#c8912e', wheel = '#4a3020', glow = false } = {}) {
  const opt = { glow, frame };
  b.add(body, box(1.3, 0.12, 0.9, [0, 0.75, 0]), opt);
  b.add(body, box(1.3, 0.7, 0.08, [0, 1.15, 0.45]), opt);
  b.add(body, box(0.08, 0.55, 0.9, [-0.65, 1.07, 0]), opt);
  b.add(body, box(0.08, 0.55, 0.9, [0.65, 1.07, 0]), opt);
  b.add(trim, box(1.36, 0.08, 0.1, [0, 1.52, 0.46]), opt);
  for (const s of [-1, 1]) {
    b.add(wheel, xf(new THREE.TorusGeometry(0.55, 0.07, 6, 16), { pos: [s * 0.78, 0.6, -0.05], rot: [0, Math.PI / 2, 0] }), opt);
    b.add(wheel, cyl(0.03, 0.03, 1.05, [s * 0.78, 0.6, -0.05], [0, 0, 0], 4), opt);
    b.add(wheel, cyl(0.03, 0.03, 1.05, [s * 0.78, 0.6, -0.05], [Math.PI / 2, 0, 0], 4), opt);
  }
  b.add(wheel, cyl(0.04, 0.04, 1.7, [0, 0.6, -0.05], [0, 0, Math.PI / 2], 5), opt);
  b.add(body, cyl(0.045, 0.045, 2.6, [0, 0.85, 1.7], [Math.PI / 2 - 0.08, 0, 0], 5), opt);
}

// A flat-roofed house of stone or mud brick, with a dark door on its local +z face.
export function house(b, ctx, { pos, size: [w, d], height: h, rot = 0, color = '#d8c095', trim = '#c3a676', door = '#3a2418', collide = true }) {
  const [x, z] = pos;
  const y = lowestGround(ctx, x, z, w / 2, d / 2, rot);
  const f = frameAt(x, y, z, rot);
  b.add(color, box(w, h + 0.6, d, [0, (h + 0.6) / 2 - 0.6, 0]), { frame: f });
  b.add(trim, box(w + 0.3, 0.25, d + 0.3, [0, h + 0.1, 0]), { frame: f });
  b.add(color, box(w, 0.5, 0.2, [0, h + 0.45, d / 2 - 0.05]), { frame: f });
  if (door) {
    b.add(door, box(1.0, 1.9, 0.12, [w * 0.15, 0.95, d / 2 + 0.01]), { frame: f, cast: false });
    b.add(door, box(0.6, 0.6, 0.12, [-w * 0.25, h * 0.62, d / 2 + 0.01]), { frame: f, cast: false });
  }
  if (collide) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + h + 0.4 });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.3, hz: d / 2 + 0.3, rot });
}

// A coursed stone wall from a to b. Crenels add battlements on top.
export function stoneWall(b, ctx, from, to, { height = 6, thick = 2.4, color = '#d6c09a', cap = '#c3a676', crenels = true, collide = true, step = 1 } = {}) {
  const [ax, az] = from, [bx, bz] = to;
  const len = Math.hypot(bx - ax, bz - az);
  const rot = Math.atan2(bx - ax, bz - az) - Math.PI / 2;
  const cx = (ax + bx) / 2, cz = (az + bz) / 2;
  const y = Math.min(ctx.terrainHeight(ax, az), ctx.terrainHeight(bx, bz), ctx.terrainHeight(cx, cz)) - 0.5;
  const f = frameAt(cx, y, cz, rot);
  b.add(color, box(len, height + 0.5, thick, [0, (height + 0.5) / 2, 0]), { frame: f });
  b.add(cap, box(len + 0.1, 0.3, thick + 0.25, [0, height + 0.5, 0]), { frame: f });
  for (let i = 1; i < height / 0.9; i++) b.add(cap, box(len + 0.02, 0.06, thick + 0.04, [0, i * 0.9, 0]), { frame: f, cast: false });
  if (crenels) {
    const n = Math.floor(len / (1.6 * step));
    for (let i = 0; i < n; i++) {
      const lx = -len / 2 + (i + 0.5) * (len / n);
      for (const s of [-1, 1]) b.add(color, box(0.9, 0.8, 0.4, [lx, height + 1.05, s * (thick / 2 - 0.2)]), { frame: f });
    }
  }
  if (collide) ctx.addCollider({ x: cx, z: cz, hx: len / 2, hz: thick / 2, rot, top: y + height + 0.5 });
  ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: len / 2 + 0.3, hz: thick / 2 + 0.4, rot });
  return { y: y + height + 0.5, rot };
}

// A palm or olive tree.
export function tree(b, ctx, x, z, rng, { kind = 'olive', h = 5, trunk = '#6b4a33', leaves = ['#5f7a45', '#6f8a52', '#4f6a3e'] } = {}) {
  const y = ctx.terrainHeight(x, z);
  if (kind === 'palm') {
    const lean = (rng() - 0.5) * 0.3;
    b.add(trunk, cyl(0.16, 0.25, h, [x, y + h / 2, z], [0, 0, lean], 7));
    const tx = x - Math.sin(lean) * h, ty = y + h * Math.cos(lean);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rng() * 0.3;
      b.add(leaves[i % leaves.length], xf(new THREE.ConeGeometry(0.35, 3, 4), { pos: [tx + Math.sin(a) * 1.3, ty - 0.3, z + Math.cos(a) * 1.3], rot: [0, a, Math.PI / 2 + 0.5], scale: [1, 1, 0.25] }));
    }
  } else {
    b.add(trunk, cyl(0.18, 0.3, h * 0.45, [x, y + h * 0.22, z], [0, 0, (rng() - 0.5) * 0.3], 7));
    for (let i = 0; i < 4; i++) {
      b.add(leaves[Math.floor(rng() * leaves.length)], xf(new THREE.IcosahedronGeometry(h * 0.28, 0), { pos: [x + (rng() - 0.5) * h * 0.4, y + h * (0.55 + rng() * 0.25), z + (rng() - 0.5) * h * 0.4], scale: [1.2, 0.8, 1.2] }));
    }
  }
  ctx.exclude({ kind: 'circle', x, z, r: 0.8 });
  ctx.addCollider({ x, z, hx: 0.3, hz: 0.3, rot: 0, top: y + h });
}

// A spinning funnel of light streaks, for a whirlwind.
export function whirlwind(ctx, { at: [x, y, z], height = 30, r0 = 1.5, r1 = 9, count = 26, color = '#fff2c9', opacity = 0.5 }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.layers.set(FX_LAYER);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const rng = makeRng(17);
  for (let i = 0; i < count; i++) {
    const hy = rng() * height, r = r0 + (r1 - r0) * (hy / height);
    const arc = 0.8 + rng() * 1.4;
    const geo = new THREE.CylinderGeometry(r, r, 0.25 + rng() * 0.5, 24, 1, true, rng() * Math.PI * 2, arc);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = hy;
    m.layers.set(FX_LAYER);
    group.add(m);
  }
  ctx.scene.add(group);
  ctx.onFrame((t, dt) => (group.rotation.y += dt * 2.2));
  return group;
}

// An additive cone of light from the sky down to a point.
export function lightColumn(ctx, { at: [x, y, z], height = 60, r0 = 2, r1 = 6, color = '#ffd27a', opacity = 0.35 }) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const group = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const f = 1 - k * 0.3;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1 * f, r0 * f, height, 24, 1, true), mat);
    m.position.set(x, y + height / 2, z);
    m.layers.set(FX_LAYER);
    group.add(m);
  }
  ctx.scene.add(group);
  return group;
}

export const PEOPLE = {
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
};
