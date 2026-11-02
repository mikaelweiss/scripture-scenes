import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { boxGeo, makeRng, between, pick } from '../../engine/util.js';
import { glowTexture } from '../../engine/textures.js';
import { makeFigure, personParts } from '../../engine/people.js';

export { boxGeo, makeRng, between, pick, FX_LAYER };

export function addMesh(ctx, geo, material, { cast = true, receive = true } = {}) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  ctx.scene.add(mesh);
  return mesh;
}

// A set of boxes in one local frame, merged per material, with optional colliders.
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
    this.parts.get(mat).push(g.index ? g.toNonIndexed() : g);
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

// Flat-roofed adobe or stone house, door facing local +z.
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

// One raised arm, like a figure blessing or testifying. side: 1 right, -1 left.
export function raiseArm(ctx, fig, colors, side = 1, lift = 2.6) {
  const kit = ctx.kit;
  const shoulder = new THREE.Group();
  shoulder.position.set(-side * 0.2, 1.32, 0);
  const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), kit.toon(colors.mantle));
  sleeve.position.y = -0.26;
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), kit.toon(colors.skin));
  hand.position.y = -0.55;
  shoulder.add(sleeve, hand);
  shoulder.rotation.set(-lift * 0.25, 0, -side * lift);
  fig.add(shoulder);
  return shoulder;
}

export function kneeling(ctx, colors, [x, z], { facing, scale = 1, bow = 0.25 } = {}) {
  const parts = personParts();
  const g = new THREE.Group();
  const k = ctx.kit;
  const body = new THREE.Group();
  body.scale.set(1.12, 0.6, 1.12);
  body.add(new THREE.Mesh(parts.robe, k.toon(colors.robe)), new THREE.Mesh(parts.mantle, k.toon(colors.mantle)));
  const head = new THREE.Group();
  head.position.y = -1.46 * 0.4;
  head.add(new THREE.Mesh(parts.head, k.toon(colors.skin)), new THREE.Mesh(parts.hair, k.toon(colors.hair)));
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

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2.2, minY = 0.08, seed = 9 } = {}) {
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
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  pts.renderOrder = -900;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
  return pts;
}

// Flat water surface. shape: THREE geometry in the XY plane, laid flat at height y.
export function water(ctx, geo, y, { color = '#3f8fa0', shine = '#bfe6e0', seed = 4, sparkles = 60, area } = {}) {
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  const mat = ctx.kit.toon(color, { emissive: new THREE.Color(color).multiplyScalar(0.25), unique: true });
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  const mesh = addMesh(ctx, geo, mat, { cast: false });
  if (area && sparkles) {
    const rng = makeRng(seed);
    const dash = new THREE.PlaneGeometry(1, 0.08);
    dash.rotateX(-Math.PI / 2);
    const inst = new THREE.InstancedMesh(dash, new THREE.MeshBasicMaterial({ color: shine, transparent: true, opacity: 0.8, depthWrite: false, fog: true }), sparkles);
    const items = [];
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    for (let i = 0; i < sparkles; i++) {
      const p = area(rng);
      if (!p) continue;
      items.push({ x: p[0], z: p[1], len: between(rng, [0.8, 2.6]), ph: rng() * 6.28, rot: (rng() - 0.5) * 0.3 });
    }
    inst.count = items.length;
    inst.layers.set(FX_LAYER);
    inst.frustumCulled = false;
    ctx.scene.add(inst);
    const e = new THREE.Euler();
    ctx.onFrame((t) => {
      items.forEach((s, i) => {
        const k = 0.5 + 0.5 * Math.sin(t * 1.5 + s.ph);
        m.compose(v.set(s.x + Math.sin(t * 0.4 + s.ph) * 0.4, y + 0.03, s.z), q.setFromEuler(e.set(0, s.rot, 0)), sc.set(s.len * k + 0.01, 1, 1));
        inst.setMatrixAt(i, m);
      });
      inst.instanceMatrix.needsUpdate = true;
    });
  }
  return mesh;
}

// Animated flame cones for braziers and campfires.
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

// Ridge tents with a dark door on local +z. items: { x, z, yaw, size, color }.
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
  const pole = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 5);
  pole.translate(0, 1.15, 1);
  const tentMesh = new THREE.InstancedMesh(body, ctx.kit.toon('#ffffff'), items.length);
  const doorMesh = new THREE.InstancedMesh(doorGeo, ctx.kit.toon(door), items.length);
  const poleMesh = new THREE.InstancedMesh(pole, ctx.kit.toon('#5a3a22'), items.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  items.forEach((t, i) => {
    const [w, h, d] = t.size;
    m.compose(new THREE.Vector3(t.x, ctx.terrainHeight(t.x, t.z) - 0.05, t.z), q.setFromEuler(e.set(0, t.yaw, 0)), new THREE.Vector3(w / 2, h, d / 2));
    tentMesh.setMatrixAt(i, m);
    doorMesh.setMatrixAt(i, m);
    poleMesh.setMatrixAt(i, m);
    tentMesh.setColorAt(i, c.set(t.color));
    ctx.addCollider({ x: t.x, z: t.z, hx: w / 2, hz: d / 2, rot: t.yaw, top: ctx.terrainHeight(t.x, t.z) + h });
  });
  for (const mesh of [tentMesh, doorMesh, poleMesh]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }
}

export const ROBES = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

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
