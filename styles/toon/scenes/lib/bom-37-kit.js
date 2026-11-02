import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { boxGeo, makeRng, between, pick } from '../../engine/util.js';
import { glowTexture } from '../../engine/textures.js';
import { makeFigure, personParts } from '../../engine/people.js';

export { boxGeo, makeRng, between, pick, FX_LAYER };

export const BASE_STYLE = {
  ink: '#2b1a12',
  toonSteps: [0.4, 0.72, 1.0],
  lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
  grain: 0.05,
  crack: '#3a2418',
  ember: '#c8502c',
  emberHot: '#ffb347',
  flameOuter: '#f08a2c',
  flameInner: '#ffe08a',
  charred: '#3a2a22',
  smoke: '#b9aea8',
  smokeShade: '#3d3640',
};

export const GROUND_COLORS = {
  sand: '#d4ac6c',
  dirt: '#bf8d55',
  grass: '#8e9a58',
  grassDark: '#6c7a42',
  plaza: '#e2cfa4',
  plazaLine: '#c3a676',
  scorch: '#3a2a22',
  scorchEdge: '#6e4630',
  hill: '#7f9a6a',
};

export const ROBES = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const MOUNTAINS = { count: 30, distance: [480, 760], height: [60, 150], widthRatio: [1.4, 2.4], colors: ['#7aa08a', '#6f9a8a', '#86a38f'] };

// Boxes in one local frame, merged per material, with optional colliders.
export class Frame {
  constructor(ctx, pos, rot = 0, y = null) {
    this.ctx = ctx;
    this.pos = pos;
    this.rot = rot;
    this.y = y ?? ctx.terrainHeight(pos[0], pos[1]);
    this.parts = new Map();
  }

  world(lx, lz) {
    const c = Math.cos(this.rot), s = Math.sin(this.rot);
    return [this.pos[0] + lx * c + lz * s, this.pos[1] - lx * s + lz * c];
  }

  box(mat, [w, h, d], [x, y, z], { collide = false, walkable = false, rotY = 0, rotX = 0, rotZ = 0, uv } = {}) {
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(boxGeo(w, h, d, [x, y, z], { rotX, rotY, rotZ, uv }));
    if (collide || walkable) {
      const [wx, wz] = this.world(x, z);
      this.ctx.addCollider({ x: wx, z: wz, hx: w / 2, hz: d / 2, rot: this.rot + rotY, top: this.y + y + h / 2, walkable });
    }
  }

  geo(mat, g) {
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(g);
  }

  build({ cast = true } = {}) {
    const group = new THREE.Group();
    group.position.set(this.pos[0], this.y, this.pos[1]);
    group.rotation.y = this.rot;
    for (const [mat, geos] of this.parts) {
      const norm = geos.map((g) => {
        const n = g.index ? g.toNonIndexed() : g;
        for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
        if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
        return n;
      });
      const mesh = new THREE.Mesh(mergeGeometries(norm), mat);
      mesh.castShadow = cast;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.ctx.scene.add(group);
    return group;
  }
}

// Flat-roofed stone house, door facing local +z.
export function house(ctx, { pos, size: [w, d], height = 3.5, rot = 0, color = '#d9c49a', roof = '#b98a5a', trim, door = '#2b1a12', stories = 1 }) {
  const k = ctx.kit;
  const f = new Frame(ctx, pos, rot, ctx.terrainHeight(pos[0], pos[1]) - 0.2);
  const H = height * stories;
  f.box(k.stoneMat(color), [w, H, d], [0, H / 2, 0], { collide: true });
  f.box(k.stoneMat(roof), [w + 0.5, 0.35, d + 0.5], [0, H + 0.17, 0]);
  f.box(k.stoneMat(color), [w + 0.5, 0.5, 0.3], [0, H + 0.55, d / 2 + 0.1]);
  f.box(k.toon(door), [1.3, 2.2, 0.1], [0, 1.1, d / 2 + 0.03]);
  for (let s = 0; s < stories; s++) {
    for (const side of [-1, 1]) if (w > 5) f.box(k.toon(door), [0.8, 0.8, 0.1], [side * w * 0.3, s * height + 2.2, d / 2 + 0.03]);
  }
  if (trim) f.box(k.fretMat(...trim), [w + 0.12, 0.5, d + 0.12], [0, H - 0.45, 0], { uv: { su: 2, sv: 0.5, oy: 0.25, local: true, flatCaps: true } });
  f.build();
  ctx.exclude({ kind: 'rect', x: pos[0], z: pos[1], hx: w / 2 + 1, hz: d / 2 + 1, rot });
}

// A ring of houses scattered in a rectangle, avoiding the given clear zones.
export function town(ctx, { seed = 1, count, area: [x0, z0, x1, z1], avoid = () => false, size = [[5, 8], [4.5, 7]], height = [3.2, 4.2], facing = null, colors, roofs, trims, twoStory = 0.25 }) {
  const rng = makeRng(seed);
  const placed = [];
  for (let tries = 0; placed.length < count && tries < count * 40; tries++) {
    const x = between(rng, [x0, x1]), z = between(rng, [z0, z1]);
    const w = between(rng, size[0]), d = between(rng, size[1]);
    if (avoid(x, z, Math.max(w, d) / 2 + 1)) continue;
    if (placed.some((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 2.5 && Math.abs(p.z - z) < (p.d + d) / 2 + 2.5)) continue;
    if (ctx.blocked(x, z, Math.max(w, d) / 2)) continue;
    placed.push({ x, z, w, d });
    const rot = facing ? Math.round(Math.atan2(facing[0] - x, facing[1] - z) / (Math.PI / 2)) * (Math.PI / 2) : Math.floor(rng() * 4) * (Math.PI / 2);
    house(ctx, {
      pos: [x, z], size: [w, d], rot,
      height: between(rng, height),
      stories: rng() < twoStory ? 2 : 1,
      color: pick(rng, colors),
      roof: pick(rng, roofs),
      trim: trims && rng() < 0.5 ? pick(rng, trims) : null,
    });
  }
  return placed;
}

// Straight city wall with a walkable top and crenellations. Faces are along the from-to line.
export function cityWall(ctx, { from, to, height = 7, thickness = 3, color = '#cdb48a', cap = '#b89a70', crenel = true, gate = null, walkable = true, open = [] }) {
  const k = ctx.kit;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const rot = -Math.atan2(to[1] - from[1], to[0] - from[0]);
  const y = Math.min(ctx.terrainHeight(from[0], from[1]), ctx.terrainHeight(mid[0], mid[1]), ctx.terrainHeight(to[0], to[1])) - 0.3;
  const f = new Frame(ctx, mid, rot, y);
  const segs = gate ? [[-len / 2, gate[0] - gate[1] / 2], [gate[0] + gate[1] / 2, len / 2]] : [[-len / 2, len / 2]];
  for (const [a, b] of segs) {
    const w = b - a;
    f.box(k.stoneMat(color), [w, height, thickness], [(a + b) / 2, height / 2, 0], { collide: true, walkable });
    f.box(k.stoneMat(cap), [w + 0.1, 0.4, thickness + 0.4], [(a + b) / 2, height - 0.2, 0]);
    if (crenel) {
      for (let x = a + 0.8; x < b - 0.5; x += 2.2) {
        if (open.some(([o0, o1]) => x > o0 && x < o1)) continue;
        for (const side of [-1, 1]) f.box(k.stoneMat(cap), [1.1, 1.1, 0.5], [x, height + 0.55, side * (thickness / 2 - 0.25)]);
      }
    }
  }
  if (gate) {
    const [gx, gw] = gate;
    f.box(k.stoneMat(cap), [gw + 1.2, height * 0.3, thickness + 0.3], [gx, height * 0.85, 0]);
    for (const side of [-1, 1]) f.box(k.stoneMat(cap), [2.4, height + 2.2, thickness + 1.2], [gx + side * (gw / 2 + 1.2), (height + 2.2) / 2, 0], { collide: true });
  }
  f.build();
  ctx.exclude({ kind: 'rect', x: mid[0], z: mid[1], hx: len / 2 + 0.5, hz: thickness / 2 + 1.5, rot });
  return { y, top: y + height, rot, mid, len };
}

export function figure(ctx, colors, [x, z], { facing, scale = 1, glow = 0, y, clear = 1.2, pose } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow });
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.setScalar(scale);
  if (facing) fig.rotation.y = Math.atan2(facing[0] - x, facing[1] - z);
  if (pose === 'lying') {
    fig.rotation.order = 'YXZ';
    fig.rotation.x = -Math.PI / 2;
    fig.position.y += 0.25 * scale;
  }
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

// One raised arm. side: 1 right, -1 left.
export function raiseArm(ctx, fig, colors, side = 1, lift = 2.6, forward = 0.25) {
  const kit = ctx.kit;
  const shoulder = new THREE.Group();
  shoulder.position.set(-side * 0.2, 1.32, 0);
  const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), kit.toon(colors.mantle));
  sleeve.position.y = -0.26;
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), kit.toon(colors.skin));
  hand.position.y = -0.55;
  shoulder.add(sleeve, hand);
  shoulder.rotation.set(-lift * forward, 0, -side * lift);
  sleeve.castShadow = true;
  fig.add(shoulder);
  return shoulder;
}

export function kneeling(ctx, colors, [x, z], { facing, scale = 1, bow = 0.25, glow = 0 } = {}) {
  const parts = personParts();
  const g = new THREE.Group();
  const k = ctx.kit;
  const mat = (hex) => k.toon(hex, { emissive: new THREE.Color(hex).multiplyScalar(glow) });
  const body = new THREE.Group();
  body.scale.set(1.12, 0.6, 1.12);
  body.add(new THREE.Mesh(parts.robe, mat(colors.robe)), new THREE.Mesh(parts.mantle, mat(colors.mantle)));
  const head = new THREE.Group();
  head.position.y = -1.46 * 0.4;
  head.add(new THREE.Mesh(parts.head, mat(colors.skin)), new THREE.Mesh(parts.hair, mat(colors.hair)));
  const torso = new THREE.Group();
  torso.add(body, head);
  torso.rotation.x = bow;
  g.add(torso);
  g.traverse((m) => m.isMesh && (m.castShadow = true));
  g.position.set(x, ctx.groundHeight(x, z), z);
  g.scale.setScalar(scale);
  if (facing) g.rotation.y = Math.atan2(facing[0] - x, facing[1] - z);
  ctx.scene.add(g);
  ctx.exclude({ kind: 'circle', x, z, r: 1 });
  return g;
}

export function glow(ctx, [x, y, z], size, color, opacity = 0.7, pulse = 0.04) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false,
  }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3) * pulse)));
  return s;
}

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2.2, minY = 0.08, seed = 9, opacity = 0.9 } = {}) {
  const rng = makeRng(seed);
  const pos = [];
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const y = minY + (1 - minY) * Math.sqrt(rng());
    const r = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * r * 1500, y * 1500, Math.sin(a) * r * 1500);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity, depthWrite: false }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  pts.renderOrder = -900;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
  return pts;
}

// A sky-locked sprite at a direction, for a sun disc or a single bright star.
export function skyDisc(ctx, dir, { size = 80, color = '#fff6dc', opacity = 1, dist = 1400 } = {}) {
  const v = new THREE.Vector3(...dir).normalize().multiplyScalar(dist);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  s.renderOrder = -800;
  s.frustumCulled = false;
  ctx.scene.add(s);
  ctx.onFrame((t, dt, camera) => s.position.copy(camera.position).add(v));
  return s;
}

// Four-pointed star made of two thin crossed diamonds, sky-locked.
export function newStar(ctx, dir, { size = 60, color = '#fffbe8', dist = 1300 } = {}) {
  const v = new THREE.Vector3(...dir).normalize().multiplyScalar(dist);
  const shape = new THREE.Shape();
  const r = 1, w = 0.12;
  shape.moveTo(0, r);
  shape.lineTo(w, w);
  shape.lineTo(r, 0);
  shape.lineTo(w, -w);
  shape.lineTo(0, -r);
  shape.lineTo(-w, -w);
  shape.lineTo(-r, 0);
  shape.lineTo(-w, w);
  shape.lineTo(0, r);
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, fog: false, transparent: true, depthWrite: false }));
  mesh.layers.set(FX_LAYER);
  mesh.renderOrder = -700;
  mesh.frustumCulled = false;
  mesh.scale.setScalar(size);
  ctx.scene.add(mesh);
  const halo = skyDisc(ctx, dir, { size: size * 2.6, color, opacity: 0.8, dist: dist + 5 });
  ctx.onFrame((t, dt, camera) => {
    mesh.position.copy(camera.position).add(v);
    mesh.quaternion.copy(camera.quaternion);
    mesh.scale.setScalar(size * (1 + Math.sin(t * 2) * 0.06));
  });
  return { mesh, halo };
}

// Animated flame cones for torches and fires.
export function flames(ctx, list, { outer = '#f08a2c', inner = '#ffe08a' } = {}) {
  const geo = new THREE.ConeGeometry(0.28, 1, 6);
  geo.translate(0, 0.5, 0);
  const o = new THREE.InstancedMesh(geo, ctx.kit.basic(outer), list.length);
  const n = new THREE.InstancedMesh(geo, ctx.kit.basic(inner), list.length);
  for (const mesh of [o, n]) {
    mesh.frustumCulled = false;
    ctx.scene.add(mesh);
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  ctx.onFrame((t) => {
    list.forEach((f, i) => {
      const k = 0.75 + 0.25 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 5.3 + i);
      const s = f.size ?? 1;
      o.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(s, s * k, s)));
      n.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(s * 0.5, s * k * 0.6, s * 0.5)));
    });
    o.instanceMatrix.needsUpdate = n.instanceMatrix.needsUpdate = true;
  });
}

// Instanced boxes with per-instance colors. items: { pos:[x,y,z], size:[w,h,d], rot, color }.
export function boxes(ctx, items, { stone = false, cast = true } = {}) {
  const geo = boxGeo(1, 1, 1, [0, 0, 0], { uv: { su: 2 } });
  const mat = stone ? ctx.kit.stoneMat('#ffffff') : ctx.kit.toon('#ffffff');
  const mesh = new THREE.InstancedMesh(geo, mat, items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  items.forEach((b, i) => {
    m.compose(new THREE.Vector3(...b.pos), q.setFromEuler(e.set(b.rotX ?? 0, b.rot ?? 0, b.rotZ ?? 0)), new THREE.Vector3(...b.size));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.set(b.color));
  });
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}

// Ridge tents with a dark door on local +z. items: { x, z, yaw, size:[w,h,d], color }.
export function tents(ctx, items, { door = '#2b1a12' } = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-1, 0);
  shape.lineTo(0, 1);
  shape.lineTo(1, 0);
  shape.lineTo(-1, 0);
  const body = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
  body.translate(0, 0, -1);
  const doorShape = new THREE.Shape();
  doorShape.moveTo(-0.32, 0);
  doorShape.lineTo(0, 0.68);
  doorShape.lineTo(0.32, 0);
  doorShape.lineTo(-0.32, 0);
  const doorGeo = new THREE.ShapeGeometry(doorShape);
  doorGeo.translate(0, 0, 1.01);
  const tentMesh = new THREE.InstancedMesh(body, ctx.kit.toon('#ffffff'), items.length);
  const doorMesh = new THREE.InstancedMesh(doorGeo, ctx.kit.toon(door), items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  items.forEach((t, i) => {
    const [w, h, d] = t.size;
    m.compose(new THREE.Vector3(t.x, ctx.terrainHeight(t.x, t.z) - 0.05, t.z), q.setFromEuler(e.set(0, t.yaw, 0)), new THREE.Vector3(w / 2, h, d / 2));
    tentMesh.setMatrixAt(i, m);
    doorMesh.setMatrixAt(i, m);
    tentMesh.setColorAt(i, c.set(t.color));
    ctx.addCollider({ x: t.x, z: t.z, hx: w / 2, hz: d / 2, rot: t.yaw, top: ctx.terrainHeight(t.x, t.z) + h });
    ctx.exclude({ kind: 'rect', x: t.x, z: t.z, hx: w / 2 + 0.4, hz: d / 2 + 0.4, rot: t.yaw });
  });
  for (const mesh of [tentMesh, doorMesh]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }
}

// Banners on poles. items: { x, z, color, height }.
export function banners(ctx, items, { pole = '#5a3a22', trim = '#efe3c2' } = {}) {
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.07, 1, 6);
  poleGeo.translate(0, 0.5, 0);
  const flag = boxGeo(1, 1.4, 0.05, [0.55, -0.75, 0]);
  const band = boxGeo(1.02, 0.18, 0.07, [0.55, -1.38, 0]);
  const poles = new THREE.InstancedMesh(poleGeo, ctx.kit.toon(pole), items.length);
  const flags = new THREE.InstancedMesh(flag, ctx.kit.toon('#ffffff', { side: THREE.DoubleSide }), items.length);
  const bands = new THREE.InstancedMesh(band, ctx.kit.toon(trim), items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  items.forEach((b, i) => {
    const h = b.height ?? 5;
    const y = b.y ?? ctx.terrainHeight(b.x, b.z);
    poles.setMatrixAt(i, m.compose(new THREE.Vector3(b.x, y, b.z), q.identity(), new THREE.Vector3(1, h, 1)));
    const fm = m.compose(new THREE.Vector3(b.x, y + h, b.z), q.setFromEuler(e.set(0, b.yaw ?? 0, 0)), new THREE.Vector3(1, 1, 1));
    flags.setMatrixAt(i, fm);
    bands.setMatrixAt(i, fm);
    flags.setColorAt(i, c.set(b.color));
  });
  for (const mesh of [poles, flags, bands]) {
    mesh.castShadow = true;
    ctx.scene.add(mesh);
  }
}

// Low four-legged animals. kind: 'sheep' | 'goat' | 'cattle'. items: { x, z, yaw, color }.
export function animals(ctx, items) {
  const body = new THREE.SphereGeometry(1, 10, 8);
  body.scale(0.32, 0.26, 0.5);
  body.translate(0, 0.55, 0);
  const head = new THREE.SphereGeometry(1, 8, 6);
  head.scale(0.13, 0.14, 0.2);
  head.translate(0, 0.72, 0.52);
  const legs = [];
  for (const [lx, lz] of [[-0.17, 0.28], [0.17, 0.28], [-0.17, -0.28], [0.17, -0.28]]) {
    const g = new THREE.CylinderGeometry(0.045, 0.04, 0.42, 5);
    g.translate(lx, 0.21, lz);
    legs.push(g);
  }
  const legGeo = mergeGeometries(legs);
  const meshes = [
    new THREE.InstancedMesh(body, ctx.kit.toon('#ffffff'), items.length),
    new THREE.InstancedMesh(head, ctx.kit.toon('#ffffff'), items.length),
    new THREE.InstancedMesh(legGeo, ctx.kit.toon('#3a2a22'), items.length),
  ];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  items.forEach((a, i) => {
    const s = a.kind === 'cattle' ? 1.9 : a.kind === 'goat' ? 0.95 : 1;
    m.compose(new THREE.Vector3(a.x, ctx.terrainHeight(a.x, a.z), a.z), q.setFromEuler(e.set(0, a.yaw, 0)), new THREE.Vector3(s, s, s));
    for (const mesh of meshes) mesh.setMatrixAt(i, m);
    meshes[0].setColorAt(i, c.set(a.color));
    meshes[1].setColorAt(i, c.set(a.head ?? a.color).multiplyScalar(a.head ? 1 : 0.8));
  });
  for (const mesh of meshes) {
    mesh.castShadow = true;
    ctx.scene.add(mesh);
  }
}

const translucentCache = new Map();
function translucent(mat, opacity) {
  const key = `${mat.uuid}|${opacity}`;
  if (!translucentCache.has(key)) {
    const m = mat.clone();
    m.transparent = true;
    m.opacity = opacity;
    m.depthWrite = false;
    translucentCache.set(key, m);
  }
  return translucentCache.get(key);
}

// A faceless figure in white light, hovering, with a soft glow and a gentle drift.
export function angel(ctx, [x, y, z], { facing = [0, 0], scale = 1.05, colors, drift = 0.25, phase = 0, glowSize = 5, glowColor = '#fff3d0', glowAmount = 0.55, opacity = 1 } = {}) {
  const c = colors ?? { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#f6e7cf', hair: '#f6edd8', sash: '#efe0b8', arms: [0.5, 0.45] };
  const fig = makeFigure(c, ctx.kit, { glow: glowAmount });
  if (opacity < 1) {
    fig.traverse((m) => {
      if (!m.isMesh) return;
      m.material = translucent(m.material, opacity);
      m.castShadow = false;
    });
  }
  fig.position.set(x, y, z);
  fig.scale.setScalar(scale);
  fig.rotation.y = Math.atan2(facing[0] - x, facing[1] - z);
  ctx.scene.add(fig);
  const g = glow(ctx, [x, y + 1.0 * scale, z], glowSize, glowColor, 0.75);
  ctx.onFrame((t) => {
    const dy = Math.sin(t * 0.8 + phase) * drift;
    fig.position.y = y + dy;
    g.position.y = y + dy + 1.0 * scale;
  });
  return fig;
}

// Projectiles flying from shooters toward a target and passing wide of it.
export function volley(ctx, { from, target, count = 40, seed = 3, miss = [1.2, 3.5], speed = 0.5, arrow = '#5a3a22', stone = '#8a7a66' }) {
  const rng = makeRng(seed);
  const shafts = [];
  for (let i = 0; i < count; i++) {
    const s = from[Math.floor(rng() * from.length)];
    const a = rng() * Math.PI * 2;
    const r = between(rng, miss);
    const end = new THREE.Vector3(target[0] + Math.cos(a) * r, target[1] + 0.6 + Math.sin(a) * r * 0.8, target[2] + Math.cos(a * 3) * 1.2);
    const start = new THREE.Vector3(s[0], s[1], s[2]);
    const beyond = end.clone().sub(start).multiplyScalar(0.35).add(end);
    shafts.push({ start, end: beyond, phase: rng(), isStone: rng() < 0.35, arc: between(rng, [2, 5]) });
  }
  const arrowGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 4);
  arrowGeo.rotateX(Math.PI / 2);
  const tip = new THREE.ConeGeometry(0.08, 0.2, 4);
  tip.rotateX(Math.PI / 2);
  tip.translate(0, 0, 0.62);
  const arrows = new THREE.InstancedMesh(mergeGeometries([arrowGeo.toNonIndexed(), tip.toNonIndexed()]), ctx.kit.toon(arrow), count);
  const stones = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.18, 0), ctx.kit.toon(stone), count);
  for (const mesh of [arrows, stones]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), nxt = new THREE.Vector3(), sc = new THREE.Vector3(), zero = new THREE.Vector3(0, 0, 0);
  const fwd = new THREE.Vector3(0, 0, 1), dir = new THREE.Vector3();
  const at = (p, u, out) => out.lerpVectors(p.start, p.end, u).setY(p.start.y + (p.end.y - p.start.y) * u + Math.sin(u * Math.PI) * p.arc);
  ctx.onFrame((t) => {
    shafts.forEach((p, i) => {
      const u = (t * speed + p.phase) % 1;
      at(p, u, v);
      at(p, Math.min(1, u + 0.01), nxt);
      dir.subVectors(nxt, v).normalize();
      q.setFromUnitVectors(fwd, dir);
      const show = u > 0.03 && u < 0.97;
      m.compose(v, q, sc.setScalar(show ? 1 : 0));
      if (p.isStone) {
        stones.setMatrixAt(i, m);
        arrows.setMatrixAt(i, m.compose(v, q, zero));
      } else {
        arrows.setMatrixAt(i, m);
        stones.setMatrixAt(i, m.compose(v, q, zero));
      }
    });
    arrows.instanceMatrix.needsUpdate = stones.instanceMatrix.needsUpdate = true;
  });
}
