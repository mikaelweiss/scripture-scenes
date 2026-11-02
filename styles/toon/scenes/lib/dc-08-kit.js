// Shared props for dc-08 to dc-14: period figures, rooms, wagons, animals, cabins, brick houses, water, light and sky.
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

export const box = (w, h, d, pos, rot) => xf(new THREE.BoxGeometry(w, h, d), { pos, rot });
export const cyl = (rt, rb, h, pos, rot, seg = 8) => xf(new THREE.CylinderGeometry(rt, rb, h, seg), { pos, rot });
export const ball = (r, pos, scale = [1, 1, 1], seg = 10) => xf(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), { pos, scale });

// Triangular prism for gable roofs: width w across, ridge height h, length len along local z, base at y=0.
export function gableGeo(w, h, len) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  g.translate(0, 0, -len / 2);
  return g;
}

export const frameAt = (x, y, z, rotY = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(1, 1, 1));

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

// Adds a collider for a box given in a structure's local frame.
export function collide(ctx, x, z, rot, lx, lz, hx, hz, top, extra = {}) {
  const c = Math.cos(rot), s = Math.sin(rot);
  ctx.addCollider({ x: x + lx * c + lz * s, z: z - lx * s + lz * c, hx, hz, rot, top, ...extra });
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

// Soft additive shaft of light, a cone open at both ends.
export function shaft(ctx, { from, to, radius = [0.5, 2], color = '#fff2c9', opacity = 0.18 }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(radius[0], radius[1], len, 24, 1, true);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const f = 0.35 + 0.65 * (0.5 - pos.getY(i) / len);
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = f;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, vertexColors: true, fog: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), b.clone().sub(a).normalize());
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
  return mesh;
}

// Flickering flames as cones. Each entry: { pos: [x, y, z], h, w, light }.
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
      l.position.set(f.pos[0], f.pos[1] + 0.6, f.pos[2]);
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

export function campfire(b, ctx, { pos, light = { color: '#ffa850', intensity: 9, distance: 14 } }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.add('#7a7068', ball(0.22, [x + Math.sin(a) * 0.75, y + 0.05, z + Math.cos(a) * 0.75], [1.2, 0.7, 1], 6));
  }
  for (let i = 0; i < 3; i++) b.add('#3a2a22', cyl(0.09, 0.1, 1.2, [x, y + 0.15, z], [0, (i / 3) * Math.PI, Math.PI / 2], 5));
  flames(ctx, [{ pos: [x, y + 0.1, z], h: 1.1, light: true }, { pos: [x + 0.2, y + 0.1, z + 0.15], h: 0.7 }, { pos: [x - 0.2, y + 0.1, z - 0.1], h: 0.8 }], { light });
  glow(ctx, { pos: [x, y + 0.7, z], size: 3.5, color: '#ffb35a', opacity: 0.55, pulse: 0.08 });
  ctx.addCollider({ x, z, hx: 0.7, hz: 0.7, rot: 0, top: y + 0.4 });
  ctx.exclude({ kind: 'circle', x, z, r: 1.6 });
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

// Flat water surface with drifting toon glints. shapes: list of THREE.Shape in the xz plane (shape y is world z).
export function water(ctx, { shapes, y = 0.06, color = '#4f8fa8', glint = '#d8eef0', glints = 80, seed = 7 }) {
  const geo = new THREE.ShapeGeometry(shapes);
  geo.rotateX(Math.PI / 2);
  geo.translate(0, y, 0);
  const mesh = new THREE.Mesh(geo, ctx.kit.toon(color, { side: THREE.DoubleSide }));
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const rng = makeRng(seed);
  const pts = [];
  const inside = (x, z) => shapes.some((s) => pointInShape(s, x, z));
  for (let tries = 0; pts.length < glints && tries < glints * 30; tries++) {
    const x = bb.min.x + rng() * (bb.max.x - bb.min.x), z = bb.min.z + rng() * (bb.max.z - bb.min.z);
    if (inside(x, z)) pts.push([x, z, 0.6 + rng() * 2.2, rng() * 6]);
  }
  if (!pts.length) return mesh;
  const g = new THREE.PlaneGeometry(1, 0.12);
  g.rotateX(-Math.PI / 2);
  const inst = new THREE.InstancedMesh(g, ctx.kit.basic(glint), pts.length);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  inst.frustumCulled = false;
  ctx.scene.add(inst);
  ctx.onFrame((t) => {
    pts.forEach(([x, z, len, ph], i) => {
      const k = 0.5 + 0.5 * Math.sin(t * 0.8 + ph);
      inst.setMatrixAt(i, m4.compose(v3.set(x + Math.sin(t * 0.3 + ph) * 0.8, y + 0.02, z), qt.identity(), s3.set(len * k + 0.01, 1, 1)));
    });
    inst.instanceMatrix.needsUpdate = true;
  });
  return mesh;
}

function pointInShape(shape, x, z) {
  const pts = shape.getPoints(24);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > z) !== (b.y > z) && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

// Period clothing: dark coats, waistcoats and hats for men; plain dresses, shawls and bonnets for women.
export const MEN = {
  robes: ['#2b2a2e', '#34302c', '#3d3a44', '#2e3640', '#4a3b2e', '#3a3328', '#45403a', '#283040'],
  mantles: ['#2b2a2e', '#3d3a44', '#4a3b2e', '#5e4a36', '#6b5a48', '#e8e2d2', '#3a3328'],
  skins: ['#e8c4a0', '#dcb48c', '#d2a882', '#f0d0b0', '#c99a74'],
  hair: ['#2b1a12', '#3a2418', '#5a3a22', '#7a5a3a', '#1f140e', '#8a6a4a'],
  wraps: ['#2b2a2e', '#3a3328', '#4a3b2e', '#26221e'],
};
export const WOMEN = {
  robes: ['#5a4a6a', '#4f5f5a', '#6a4a40', '#3d3a44', '#7a6450', '#5a5a6e', '#8a7458', '#4a3b2e', '#6e5a74'],
  mantles: ['#d9cdb0', '#8a6f5a', '#3d3a44', '#e8e0cc', '#6a5a48', '#a89070'],
  skins: ['#e8c4a0', '#dcb48c', '#f0d0b0', '#d2a882'],
  hair: ['#3a2418', '#5a3a22', '#7a5a3a', '#2b1a12'],
  wraps: ['#e8e0cc', '#d9cdb0', '#c8b898', '#3d3a44', '#e2d6bc'],
};
export const SAINTS = {
  robes: [...MEN.robes, ...WOMEN.robes],
  mantles: [...MEN.mantles, ...WOMEN.mantles],
  skins: MEN.skins,
  hair: MEN.hair,
  wraps: [...MEN.wraps, ...WOMEN.wraps],
};

// One period figure. kind: 'man' adds a hat, 'woman' adds a bonnet. pose: 'stand', 'kneel', 'sit'.
export function saint(ctx, { pos, face, colors, kind = 'man', hat = true, pose = 'stand', scale = 1, y = null, glow: g = 0 }) {
  const fig = makeFigure(colors, ctx.kit, { glow: g });
  const [x, z] = pos;
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  const sy = pose === 'kneel' ? 0.62 : pose === 'sit' ? 0.56 : 1;
  fig.scale.set(scale * (pose === 'stand' ? 1 : 1.08), scale * sy, scale * (pose === 'stand' ? 1 : 1.08));
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  const head = 1.58;
  const k = ctx.kit;
  if (hat && kind === 'man') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 14), k.toon(colors.hat ?? '#1e1a18'));
    brim.position.y = head + 0.07;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, colors.tall ? 0.26 : 0.13, 12), k.toon(colors.hat ?? '#1e1a18'));
    crown.position.y = head + 0.07 + (colors.tall ? 0.13 : 0.065);
    for (const m of [brim, crown]) {
      m.scale.y = 1 / sy;
      m.position.y = head + (m.position.y - head) / sy;
      m.castShadow = true;
      fig.add(m);
    }
  }
  if (hat && kind === 'woman') {
    const bonnet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), k.toon(colors.bonnet ?? '#e8e0cc'));
    bonnet.rotation.x = -0.55;
    bonnet.position.set(0, head + 0.02, -0.02);
    bonnet.scale.y = 1 / sy;
    bonnet.castShadow = true;
    fig.add(bonnet);
  }
  ctx.scene.add(fig);
  ctx.exclude({ kind: 'circle', x, z, r: 0.8 });
  return fig;
}

// A divine figure: white robe, simple head, soft light.
export function heavenly(ctx, { pos, face, y = null, scale = 1.1, glowAmt = 0.55, halo = 6, color = '#fbf7ee', light = { color: '#fff1c8', intensity: 10, distance: 16 }, arms = [0.5, 0.3] }) {
  const fig = makeFigure({ robe: color, mantle: '#f5efe0', skin: '#f0dcc0', hair: '#f5efe0', sash: '#efe4c8', arms }, ctx.kit, { glow: glowAmt });
  const [x, z] = pos;
  const gy = y ?? ctx.groundHeight(x, z);
  fig.position.set(x, gy, z);
  fig.scale.setScalar(scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(fig);
  if (halo) glow(ctx, { pos: [x, gy + 1.1 * scale, z], size: halo, color: '#fff3d0', opacity: 0.75 });
  if (light) {
    const l = new THREE.PointLight(light.color, light.intensity, light.distance, 1.5);
    l.position.set(x, gy + 2.2, z);
    ctx.scene.add(l);
  }
  ctx.exclude({ kind: 'circle', x, z, r: 1 });
  return fig;
}

export function horse(b, ctx, { pos, rot = 0, y = null, color = '#6a4a32', mane = '#2b1a12', ox = false }) {
  const [x, z] = pos;
  const gy = y ?? ctx.terrainHeight(x, z);
  const f = frameAt(x, gy, z, rot);
  const body = ox ? [1.0, 0.95, 2.2] : [0.7, 0.75, 1.9];
  const legH = ox ? 0.75 : 1.0;
  b.add(color, box(body[0], body[1], body[2], [0, legH + body[1] / 2, 0]), { frame: f });
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(color, cyl(0.08, 0.07, legH, [lx * body[0] * 0.33, legH / 2, lz * body[2] * 0.38], [0, 0, 0], 6), { frame: f });
  if (ox) {
    b.add(color, box(0.5, 0.5, 0.7, [0, legH + body[1] * 0.55, body[2] / 2 + 0.3]), { frame: f });
    b.add('#e8dcc0', cyl(0.04, 0.05, 0.9, [0, legH + body[1] * 0.8, body[2] / 2 + 0.25], [0, 0, Math.PI / 2], 6), { frame: f });
  } else {
    b.add(color, box(0.32, 0.9, 0.4, [0, legH + body[1] + 0.2, body[2] / 2 + 0.05], [-0.5, 0, 0]), { frame: f });
    b.add(color, box(0.28, 0.3, 0.62, [0, legH + body[1] + 0.62, body[2] / 2 + 0.4], [0.35, 0, 0]), { frame: f });
    b.add(mane, box(0.1, 0.8, 0.22, [0, legH + body[1] + 0.3, body[2] / 2 - 0.12], [-0.5, 0, 0]), { frame: f });
    b.add(mane, box(0.1, 0.7, 0.14, [0, legH + body[1] * 0.6, -body[2] / 2 - 0.08], [0.3, 0, 0]), { frame: f });
  }
  ctx.addCollider({ x, z, hx: body[0] / 2 + 0.1, hz: body[2] / 2 + 0.3, rot, top: gy + legH + body[1] });
}

// Covered wagon with team. Local +z is forward.
export function wagon(b, ctx, { pos, rot = 0, cover = '#ece4cf', wood = '#7a5636', team = 'horse', teamColors = ['#6a4a32', '#4a3426'], snow = false }) {
  const [x, z] = pos;
  const gy = ctx.terrainHeight(x, z);
  const f = frameAt(x, gy, z, rot);
  b.add(wood, box(1.3, 0.55, 3.4, [0, 1.05, 0]), { frame: f });
  b.add('#5a3e28', box(1.36, 0.08, 3.46, [0, 1.3, 0]), { frame: f });
  for (const [lx, lz, r] of [[-0.75, -1.15, 0.6], [0.75, -1.15, 0.6], [-0.75, 1.2, 0.45], [0.75, 1.2, 0.45]]) {
    b.add('#3a2a1e', xf(new THREE.TorusGeometry(r, 0.05, 5, 16), { pos: [lx, r, lz], rot: [0, Math.PI / 2, 0] }), { frame: f });
    b.add('#3a2a1e', cyl(0.08, 0.08, 0.14, [lx, r, lz], [0, 0, Math.PI / 2], 6), { frame: f });
    for (let s = 0; s < 4; s++) b.add('#5a3e28', box(0.04, r * 2, 0.04, [lx, r, lz], [(s / 4) * Math.PI, 0, 0]), { frame: f });
  }
  b.add('#3a2a1e', box(1.6, 0.08, 0.08, [0, 0.6, -1.15]), { frame: f });
  b.add('#3a2a1e', box(1.6, 0.08, 0.08, [0, 0.45, 1.2]), { frame: f });
  const hood = new THREE.CylinderGeometry(0.85, 0.85, 3.0, 14, 1, true, -Math.PI / 2, Math.PI);
  b.add(cover, xf(hood, { pos: [0, 1.32, 0], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 1.25] }), { frame: f });
  b.add(cover, xf(new THREE.CircleGeometry(0.85, 14, 0, Math.PI), { pos: [0, 1.32, -1.5], rot: [0, Math.PI, 0], scale: [1, 1.25, 1] }), { frame: f });
  b.add('#2b2420', xf(new THREE.CircleGeometry(0.6, 12, 0, Math.PI), { pos: [0, 1.34, 1.51], scale: [1, 1.2, 1] }), { frame: f });
  if (snow) b.add('#f4f6f8', xf(new THREE.CylinderGeometry(0.88, 0.88, 2.9, 14, 1, true, -Math.PI / 4, Math.PI / 2), { pos: [0, 1.33, 0], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 1.27] }), { frame: f });
  b.add(wood, box(0.08, 0.08, 2.2, [0, 0.55, 2.7]), { frame: f });
  ctx.addCollider({ x, z, hx: 0.85, hz: 1.8, rot, top: gy + 2.4 });
  if (team) {
    const c = Math.cos(rot), s = Math.sin(rot);
    const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const ox = team === 'ox';
    for (const lx of [-0.55, 0.55]) horse(b, ctx, { pos: at(lx, ox ? 4.4 : 4.2), rot, color: teamColors[lx < 0 ? 0 : 1], ox });
  }
}

export function logCabin(b, ctx, { pos, size = [6, 5], height = 2.4, rot = 0, log = '#7a5636', logDark = '#5e4028', roof = '#5a4a3a', snow = false, smoke = true, door = '#3a2418' }) {
  const [x, z] = pos;
  const gy = ctx.terrainHeight(x, z) - 0.1;
  const f = frameAt(x, gy, z, rot);
  const [w, d] = size;
  const r = 0.17;
  const n = Math.round(height / (r * 2));
  for (let i = 0; i < n; i++) {
    const y = r + i * r * 2;
    const c = i % 2 ? log : logDark;
    b.add(c, cyl(r, r, w + 0.5, [0, y, d / 2], [0, 0, Math.PI / 2], 7), { frame: f });
    b.add(c, cyl(r, r, w + 0.5, [0, y, -d / 2], [0, 0, Math.PI / 2], 7), { frame: f });
    b.add(c, cyl(r, r, d + 0.5, [w / 2, y + r, 0], [Math.PI / 2, 0, 0], 7), { frame: f });
    b.add(c, cyl(r, r, d + 0.5, [-w / 2, y + r, 0], [Math.PI / 2, 0, 0], 7), { frame: f });
  }
  b.add('#4a3828', box(w - 0.1, height, d - 0.1, [0, height / 2, 0]), { frame: f });
  b.add(door, box(0.9, 1.8, 0.1, [-w * 0.18, 0.9, d / 2 + 0.2]), { frame: f });
  b.add('#2b2420', box(0.7, 0.6, 0.1, [w * 0.22, 1.4, d / 2 + 0.2]), { frame: f });
  b.add('#e8d8a8', box(0.6, 0.5, 0.06, [w * 0.22, 1.4, d / 2 + 0.24]), { glow: true, frame: f });
  const rh = w * 0.32;
  b.add(roof, xf(gableGeo(w + 0.9, rh, d + 0.8), { pos: [0, height + 0.15, 0], rot: [0, Math.PI / 2, 0] }), { frame: f });
  if (snow) b.add('#f2f5f8', xf(gableGeo(w + 0.95, rh * 0.95, d + 0.86), { pos: [0, height + 0.32, 0], rot: [0, Math.PI / 2, 0] }), { frame: f });
  b.add('#8a8078', box(0.8, height + rh + 0.8, 0.8, [w / 2 + 0.25, (height + rh + 0.8) / 2, 0]), { frame: f });
  const c = Math.cos(rot), s = Math.sin(rot);
  ctx.addCollider({ x, z, hx: w / 2 + 0.35, hz: d / 2 + 0.3, rot, top: gy + height + rh });
  if (smoke) {
    const cx = x + (w / 2 + 0.25) * c, cz = z - (w / 2 + 0.25) * s;
    return [cx, gy + height + rh + 0.8, cz];
  }
  return null;
}

// Rising toon smoke puffs from chimneys. sources: list of [x, y, z].
export function smoke(ctx, sources, { color = '#cfcac4', puffs = 6, rise = 7, size = 0.7 } = {}) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const n = sources.length * puffs;
  const inst = new THREE.InstancedMesh(geo, ctx.kit.toon(color), n);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  inst.frustumCulled = false;
  ctx.scene.add(inst);
  ctx.onFrame((t) => {
    let i = 0;
    for (const [x, y, z] of sources) {
      for (let p = 0; p < puffs; p++) {
        const k = ((t * 0.12 + p / puffs + x * 0.13) % 1);
        const s = size * (0.4 + k * 1.4) * (1 - k * k * 0.6);
        inst.setMatrixAt(i++, m4.compose(v3.set(x + k * 2.2 + Math.sin(t + p) * 0.2, y + k * rise, z + k * 0.8), qt.identity(), s3.set(s, s, s)));
      }
    }
    inst.instanceMatrix.needsUpdate = true;
  });
}

// Gabled brick or frame house. Local +z is the front.
export function frameHouse(b, ctx, { pos, size = [8, 6], height = 5, rot = 0, wall = '#a8543c', roof = '#4a4440', trim = '#efe8d8', chimneys = true, windowColor = '#2e3a44', y = null }) {
  const [x, z] = pos;
  const gy = (y ?? ctx.terrainHeight(x, z)) - 0.1;
  const f = frameAt(x, gy, z, rot);
  const [w, d] = size;
  b.add(wall, box(w, height, d, [0, height / 2, 0]), { frame: f });
  const rh = d * 0.38;
  b.add(wall, xf(gableGeo(d, rh, w), { pos: [0, height, 0], rot: [0, Math.PI / 2, 0] }), { frame: f });
  b.add(roof, xf(gableGeo(d + 0.7, rh + 0.25, w + 0.6), { pos: [0, height + 0.05, 0], rot: [0, Math.PI / 2, 0] }), { frame: f });
  b.add(trim, box(w + 0.1, 0.18, d + 0.1, [0, height - 0.05, 0]), { frame: f });
  const floors = height > 4.5 ? [1.4, 3.8] : [1.5];
  const cols = Math.max(2, Math.round(w / 2.2));
  for (const fy of floors) {
    for (let i = 0; i < cols; i++) {
      const lx = (i - (cols - 1) / 2) * (w / cols);
      if (fy === floors[0] && i === Math.floor(cols / 2)) continue;
      b.add(trim, box(0.8, 1.25, 0.08, [lx, fy, d / 2 + 0.02]), { frame: f });
      b.add(windowColor, box(0.6, 1.05, 0.08, [lx, fy, d / 2 + 0.05]), { frame: f });
      b.add(trim, box(0.8, 1.25, 0.08, [lx, fy, -d / 2 - 0.02]), { frame: f });
      b.add(windowColor, box(0.6, 1.05, 0.08, [lx, fy, -d / 2 - 0.05]), { frame: f });
    }
  }
  const dx = (Math.floor(cols / 2) - (cols - 1) / 2) * (w / cols);
  b.add(trim, box(1.2, 2.3, 0.1, [dx, 1.15, d / 2 + 0.02]), { frame: f });
  b.add('#3a2a22', box(0.9, 2.1, 0.1, [dx, 1.05, d / 2 + 0.06]), { frame: f });
  if (chimneys) for (const sx of [-1, 1]) b.add('#8a4a36', box(0.6, rh + 1.2, 0.6, [sx * (w / 2 - 0.3), height + (rh + 1.2) / 2 - 0.3, 0]), { frame: f });
  ctx.addCollider({ x, z, hx: w / 2 + 0.1, hz: d / 2 + 0.1, rot, top: gy + height + rh });
}

export function fence(b, ctx, { from, to, color = '#8a6a4a', height = 1.1 }) {
  const [ax, az] = from, [bx, bz] = to;
  const len = Math.hypot(bx - ax, bz - az);
  const rot = Math.atan2(bx - ax, bz - az);
  const n = Math.max(1, Math.round(len / 2.4));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
    const y = ctx.terrainHeight(x, z);
    b.add(color, box(0.12, height, 0.12, [x, y + height / 2, z]));
  }
  for (const h of [0.45, 0.9]) {
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    b.add(color, box(0.06, 0.1, len, [mx, ctx.terrainHeight(mx, mz) + h * height, mz], [0, rot, 0]));
  }
}

export function pineTree(b, ctx, { pos, height = 7, color = '#3e5e4a', snow = false, bare = false }) {
  const [x, z] = pos;
  const y = ctx.terrainHeight(x, z);
  b.add('#5a4030', cyl(0.12, 0.2, height * 0.5, [x, y + height * 0.25, z], [0, 0, 0], 6));
  if (bare) {
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + x;
      b.add('#5a4030', cyl(0.04, 0.08, height * 0.4, [x + Math.sin(a) * 0.6, y + height * (0.5 + i * 0.06), z + Math.cos(a) * 0.6], [Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6], 5));
    }
    ctx.addCollider({ x, z, hx: 0.25, hz: 0.25, rot: 0, top: y + height });
    return;
  }
  for (let i = 0; i < 3; i++) {
    const r = height * (0.32 - i * 0.07), h = height * 0.38;
    b.add(color, xf(new THREE.ConeGeometry(r, h, 8), { pos: [x, y + height * (0.35 + i * 0.2) + h / 2, z] }));
    if (snow) b.add('#f2f5f8', xf(new THREE.ConeGeometry(r * 0.72, h * 0.5, 8), { pos: [x, y + height * (0.35 + i * 0.2) + h * 0.78, z] }));
  }
  ctx.addCollider({ x, z, hx: 0.3, hz: 0.3, rot: 0, top: y + height });
}

export function leafTree(b, ctx, { pos, height = 8, color = '#5f8a4a', color2 = '#4f7a40', y: base = null }) {
  const [x, z] = pos;
  const y = base ?? ctx.terrainHeight(x, z);
  b.add('#5a4030', cyl(0.18, 0.28, height * 0.55, [x, y + height * 0.27, z], [0, 0, 0], 7));
  b.add(color, ball(height * 0.3, [x, y + height * 0.7, z], [1, 0.8, 1], 9));
  b.add(color2, ball(height * 0.2, [x + height * 0.16, y + height * 0.6, z + height * 0.08], [1, 0.8, 1], 8));
  ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + height });
}

// Common spec pieces.
export const INK = '#2b1a12';

export function baseStyle(fog, extra = {}) {
  return {
    ink: INK,
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog,
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
    ...extra,
  };
}

export function flatGround(colors, { size = 1200, flatRadius = 400, hillHeight = 0, undulation = 0.02, plaza = { center: [0, 0], size: [0, 0] } } = {}) {
  return { size, segments: 200, flatRadius, hillHeight, undulation, plaza, colors };
}
