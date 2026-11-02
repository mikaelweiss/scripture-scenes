import * as THREE from 'three';
import { rng, jitterColor } from '../../engine/util.js';
import { createCrowd, parts } from '../../engine/crowd.js';
import { Batch } from '../../engine/world.js';

const UP = new THREE.Vector3(0, 1, 0);
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

// Maps local (lx, lz) around an anchor rotated by `rot` to world (x, z), matching the engine builders.
export function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

// A box stretched between two 3D points.
export function strut(batch, a, b, thick, color, jitter = 0.05) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const dir = B.clone().sub(A);
  const len = dir.length();
  tmpQ.setFromUnitVectors(UP, dir.normalize());
  tmpE.setFromQuaternion(tmpQ, 'YXZ');
  const mid = A.add(B).multiplyScalar(0.5);
  batch.box(thick, len, thick, { position: [mid.x, mid.y, mid.z], rotation: [tmpE.x, tmpE.y, tmpE.z], color, jitter });
}

// Grid of points, rows along local z, with small jitter.
export function formation({ center, rows, cols, spacing = 1.1, rowSpacing = spacing, rot = 0, jitter = 0.15, seed = 1, skip = 0 }) {
  const r = rng(seed);
  const at = frame(center[0], center[1], rot);
  const pts = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (skip && r() < skip) continue;
      pts.push(at((j - (cols - 1) / 2) * spacing + r.range(-jitter, jitter), (i - (rows - 1) / 2) * rowSpacing + r.range(-jitter, jitter)));
    }
  }
  return pts;
}

// People records for createCrowd, with exact known yaw so gear can be attached.
export function makePeople(points, { palette, heightAt, seed = 1, face, yaw, yawJitter = 0.12, scale = [0.92, 1.08], kneel = 0, children = 0, y }) {
  const r = rng(seed);
  return points.map(([x, z]) => {
    const child = r() < children;
    const base = face ? Math.atan2(face[0] - x, face[1] - z) : yaw ?? r() * Math.PI * 2;
    const kneeling = r() < kneel;
    return {
      x, z,
      y: (y ?? heightAt(x, z)) - (kneeling ? 0.48 : 0),
      yaw: base + r.range(-yawJitter, yawJitter),
      scale: child ? r.range(0.55, 0.72) : r.range(scale[0], scale[1]),
      robe: jitterColor(r.pick(palette.robes), r, 0.08),
      mantle: r() < (palette.mantleChance ?? 0.5) ? jitterColor(r.pick(palette.mantles), r, 0.08) : null,
      hood: r() < (palette.hoodChance ?? 0.2),
      skin: jitterColor(r.pick(palette.skins), r, 0.05),
      kneeling,
    };
  });
}

export function addCrowd(ctx, people) {
  const time = { value: 0 };
  const group = createCrowd(people, time);
  ctx.onFrame((t) => (time.value = t));
  ctx.scene.add(group);
  return group;
}

function personMatrix(p, local) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion().setFromAxisAngle(UP, p.yaw), new THREE.Vector3(p.scale, p.scale, p.scale));
  return m.multiply(local);
}

function instanced(ctx, geo, color, list, { emissive } = {}) {
  if (!list.length) return null;
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true });
  if (emissive) mat.emissive = new THREE.Color(emissive);
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  list.forEach(([m, c], i) => {
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, new THREE.Color(c ?? color));
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  ctx.scene.add(mesh);
  return mesh;
}

// Spears, shields and head-plates for soldiers made by makePeople. pose: 'rest' (spear upright) or 'charge' (spear forward).
export function arm(ctx, people, { spear = 0.7, shield = 0.8, helmet = 0.6, bow = 0, pose = 'rest', shields = ['#8a5a32', '#6e4a2c', '#a07040'], helmetColor = '#9a8a70', tip = '#3a3a40', seed = 4 } = {}) {
  const r = rng(seed);
  const shafts = [], tips = [], shieldList = [], helms = [], bows = [];
  const L = new THREE.Matrix4();
  for (const p of people) {
    if (r() < spear) {
      const tilt = pose === 'charge' ? r.range(0.9, 1.25) : r.range(-0.08, 0.12);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0));
      const base = pose === 'charge' ? new THREE.Vector3(-0.28, 1.05, -0.3) : new THREE.Vector3(-0.3, 0.05, 0.12);
      shafts.push([personMatrix(p, L.clone().compose(base, q, new THREE.Vector3(1, 1, 1)))]);
      const tipPos = new THREE.Vector3(0, 2.5, 0).applyQuaternion(q).add(base);
      tips.push([personMatrix(p, L.clone().compose(tipPos, q, new THREE.Vector3(1, 1, 1)))]);
    } else if (r() < bow) {
      bows.push([personMatrix(p, L.clone().compose(new THREE.Vector3(-0.3, 1.0, 0.12), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)))]);
    }
    if (r() < shield) {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0, 'YXZ'));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(UP, 0.5));
      shieldList.push([personMatrix(p, L.clone().compose(new THREE.Vector3(0.27, 1.0, 0.18), q, new THREE.Vector3(1, 1, 1))), jitterColor(r.pick(shields), r, 0.08)]);
    }
    if (!p.hood && r() < helmet) helms.push([personMatrix(p, L.clone().identity())]);
  }
  const shaftGeo = new THREE.CylinderGeometry(0.022, 0.026, 2.5, 4).translate(0, 1.25, 0);
  const tipGeo = new THREE.ConeGeometry(0.05, 0.28, 4).translate(0, 0.1, 0);
  const shieldGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 8);
  const helmGeo = new THREE.SphereGeometry(0.15, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.57, -0.01);
  const bowGeo = new THREE.TorusGeometry(0.6, 0.02, 3, 10, Math.PI * 0.8).rotateZ(Math.PI * 0.6);
  instanced(ctx, shaftGeo, '#5a4330', shafts);
  instanced(ctx, tipGeo, tip, tips);
  instanced(ctx, shieldGeo, '#8a5a32', shieldList);
  instanced(ctx, helmGeo, helmetColor, helms);
  instanced(ctx, bowGeo, '#4a3424', bows);
}

// People lying asleep on the ground, from the same parts as the crowd.
export function sleepers(ctx, list, { palette, seed = 9 }) {
  const r = rng(seed);
  const robe = new THREE.InstancedMesh(parts.robe(), new THREE.MeshLambertMaterial({ vertexColors: true }), list.length);
  const head = new THREE.InstancedMesh(parts.head(), new THREE.MeshLambertMaterial({ vertexColors: true }), list.length);
  const lie = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  list.forEach(([x, z, y], i) => {
    const q = new THREE.Quaternion().setFromAxisAngle(UP, r() * Math.PI * 2).multiply(lie);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y + 0.22, z), q, new THREE.Vector3(1, 1, 1).multiplyScalar(r.range(0.92, 1.05)));
    robe.setMatrixAt(i, m);
    head.setMatrixAt(i, m);
    robe.setColorAt(i, jitterColor(r.pick(palette.robes), r, 0.08));
    head.setColorAt(i, jitterColor(r.pick(palette.skins), r, 0.05));
  });
  for (const mesh of [robe, head]) {
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
}

// A-frame tent along local z, doorway on +z.
export function tent(ctx, { x, z, rot = 0, w = 3, d = 4, h = 2.2, color = '#a08a68', door = '#2a2018', y }) {
  const base = y ?? ctx.heightAt(x, z) - 0.05;
  const geo = new THREE.CylinderGeometry(1, 1, 1, 3, 1).rotateX(-Math.PI / 2).translate(0, 0.5, 0);
  ctx.solid.add(geo, { position: [x, base, z], rotation: [0, rot, 0], scale: [w / 1.732, h / 1.5, d], color, jitter: 0.06 });
  const at = frame(x, z, rot);
  const [dx, dz] = at(0, d / 2 + 0.01);
  const tri = new THREE.CylinderGeometry(1, 1, 0.02, 3, 1).rotateX(-Math.PI / 2).translate(0, 0.5, 0);
  ctx.solid.add(tri, { position: [dx, base, dz], rotation: [0, rot, 0], scale: [(w / 1.732) * 0.45, (h / 1.5) * 0.6, 1], color: door, jitter: 0 });
  ctx.colliders.add({ x, z, w, d, rot, bottom: base, top: base + h });
}

// Round pavilion with conical roof and a doorway on local +z. Returns the door position.
export function pavilion(ctx, { x, z, rot = 0, r = 4, h = 2.6, roof = 2.6, color = '#b08a5a', roofColor = '#8a3a2a', door = 1.6, inner = '#ffb060', y }) {
  const base = y ?? ctx.heightAt(x, z) - 0.05;
  const sides = 10;
  const gap = door / r;
  const wall = new THREE.CylinderGeometry(r, r, h, sides * 2, 1, true, gap / 2, Math.PI * 2 - gap).translate(0, h / 2, 0);
  ctx.solid.add(wall, { position: [x, base, z], rotation: [0, rot, 0], color, jitter: 0.05 });
  const inside = new THREE.CylinderGeometry(r - 0.05, r - 0.05, h, sides * 2, 1, true).scale(-1, 1, 1).translate(0, h / 2, 0);
  ctx.solid.add(inside, { position: [x, base, z], rotation: [0, rot, 0], color: '#5a4030', jitter: 0.04 });
  ctx.solid.add(new THREE.ConeGeometry(r * 1.12, roof, sides), { position: [x, base + h + roof / 2, z], rotation: [0, rot, 0], color: roofColor, jitter: 0.05 });
  const under = new THREE.CircleGeometry(r * 1.12, sides).rotateX(Math.PI / 2);
  ctx.solid.add(under, { position: [x, base + h, z], rotation: [0, rot, 0], color: '#3a2a20', jitter: 0 });
  strut(ctx.solid, [x, base + h + roof, z], [x, base + h + roof + 1.4, z], 0.08, '#4a3424');
  const at = frame(x, z, rot);
  for (let i = 0; i < sides * 2; i++) {
    const a = gap / 2 + (i / (sides * 2)) * (Math.PI * 2 - gap) + 0.15;
    const px = x + Math.sin(a + rot) * r, pz = z + Math.cos(a + rot) * r;
    ctx.colliders.add({ x: px, z: pz, w: 1.4, d: 1.4, rot: a + rot, bottom: base, top: base + h });
  }
  return at(0, r);
}

// Campfire with flickering flames and an optional point light.
export function fire(ctx, { x, z, size = 1, light = 0, color = '#ff8a30', distance = 18, y }) {
  const base = y ?? ctx.heightAt(x, z);
  const r = ctx.rand;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * size, 0), { position: [x + Math.cos(a) * 0.55 * size, base + 0.06, z + Math.sin(a) * 0.55 * size], color: '#5a5550', jitter: 0.1 });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + r.range(0, 0.4);
    ctx.solid.box(0.12 * size, 0.12 * size, 0.9 * size, { position: [x, base + 0.1, z], rotation: [0, a, 0], color: '#2c2018' });
  }
  ctx.glow.add(new THREE.CircleGeometry(0.42 * size, 7).rotateX(-Math.PI / 2), { position: [x, base + 0.17, z], color: '#ff5a10', jitter: 0.1 });
  const flames = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const core = new THREE.MeshBasicMaterial({ color: '#ffd080', toneMapped: false });
  const cones = [];
  for (let i = 0; i < 4; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22 * size, 0.9 * size, 5).translate(0, 0.45 * size, 0), i === 0 ? core : mat);
    cone.position.set(r.range(-0.15, 0.15) * size, 0.12, r.range(-0.15, 0.15) * size);
    if (i === 0) cone.scale.setScalar(0.7);
    flames.add(cone);
    cones.push([cone, r() * 6, cone.scale.x]);
  }
  flames.position.set(x, base, z);
  ctx.scene.add(flames);
  let pl;
  if (light) {
    pl = new THREE.PointLight(color, light, distance, 1.6);
    pl.position.set(x, base + 1.2 * size, z);
    ctx.scene.add(pl);
  }
  ctx.onFrame((t) => {
    for (const [c, ph, s] of cones) {
      const k = 0.8 + 0.25 * Math.sin(t * 9 + ph) + 0.15 * Math.sin(t * 23 + ph * 2);
      c.scale.set(s, s * k, s);
      c.rotation.y = t * 0.6 + ph;
    }
    if (pl) pl.intensity = light * (0.85 + 0.12 * Math.sin(t * 11) + 0.08 * Math.sin(t * 27));
  });
  return flames;
}

export function stars(ctx, { count = 900, seed = 2, color = '#dfe6ff', size = 1.6 } = {}) {
  const r = rng(seed);
  const pos = [];
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, el = Math.asin(r.range(0.05, 1));
    pos.push(Math.cos(a) * Math.cos(el) * 1300, Math.sin(el) * 1300, Math.sin(a) * Math.cos(el) * 1300);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
  pts.renderOrder = -6;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
}

// Faceted animated sea over a rectangle.
export function sea(ctx, { x = 0, z = 0, w = 1600, d = 1600, y = -0.5, color = '#2f6f86', seg = 120, amp = 0.25, opacity = 1 }) {
  const geo = new THREE.PlaneGeometry(w, d, seg, seg).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true, transparent: opacity < 1, opacity });
  const time = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vec4 wp = modelMatrix * vec4(position, 1.0);
      transformed.y += (sin(wp.x * 0.13 + uTime * 0.9) * 0.6 + sin(wp.z * 0.21 - uTime * 1.1) * 0.5 + sin((wp.x + wp.z) * 0.37 + uTime * 1.7) * 0.3) * ${amp.toFixed(3)};`,
    );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

// Wooden ship hull lofted along local z (bow at +z). Returns a group so it can bob or sail.
export function ship(ctx, { x, z, y = 0, rot = 0, len = 18, beam = 5, depth = 2.6, hull = '#6a4a30', deck = '#9a7a52', sail = '#e8dcc0', mast = true, ribsOnly = false, oars = 0 }) {
  const b = new Batch(ctx.rand);
  const N = 12;
  const prof = [[-1, 1], [-0.85, 0.45], [-0.45, 0.08], [0, 0], [0.45, 0.08], [0.85, 0.45], [1, 1]];
  const station = (i) => {
    const t = i / N;
    const u = 2 * t - 1;
    const wf = Math.max(0.04, Math.pow(Math.max(0, 1 - Math.abs(u) ** 2.2), 0.6));
    const keel = depth * 0.55 * u ** 4;
    const top = depth * (1 + 0.35 * u * u);
    return prof.map(([px, py]) => [px * (beam / 2) * wf, keel + (top - keel) * py, u * len / 2]);
  };
  const stations = Array.from({ length: N + 1 }, (_, i) => station(i));
  if (!ribsOnly) {
    const pos = [];
    for (let i = 0; i < N; i++) {
      const A = stations[i], B = stations[i + 1];
      for (let k = 0; k < prof.length - 1; k++) {
        pos.push(...A[k], ...B[k], ...A[k + 1], ...A[k + 1], ...B[k], ...B[k + 1]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    b.add(g, { color: hull, jitter: 0.07 });
    const dpos = [];
    for (let i = 0; i < N; i++) {
      const A = stations[i], B = stations[i + 1];
      const dy = (p) => [p[0] * 0.95, p[1] - 0.35, p[2]];
      dpos.push(...dy(A[0]), ...dy(A[6]), ...dy(B[0]), ...dy(B[0]), ...dy(A[6]), ...dy(B[6]));
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute(dpos, 3));
    b.add(dg, { color: deck, jitter: 0.05 });
    for (const s of [stations[N], stations[0]]) strut(b, s[3], [s[3][0], s[3][1] + depth * 1.8, s[3][2] + Math.sign(s[3][2]) * 1.2], 0.25, hull);
    if (mast) {
      strut(b, [0, depth * 0.5, len * 0.05], [0, depth + 9, len * 0.05], 0.28, '#4a3424');
      strut(b, [-3.4, depth + 8, len * 0.05 + 0.2], [3.4, depth + 8, len * 0.05 + 0.2], 0.16, '#4a3424');
      const sg = new THREE.PlaneGeometry(6.6, 5.6, 4, 4);
      const sp = sg.attributes.position;
      for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.cos((sp.getX(i) / 6.6) * Math.PI) * 0.9 * (0.6 + 0.4 * (sp.getY(i) / 5.6 + 0.5)));
      sg.translate(0, depth + 8 - 2.9, len * 0.05 + 0.35);
      b.add(sg, { color: sail, jitter: 0.04 });
      for (const sx of [-1, 1]) strut(b, [sx * 3.3, depth + 8, len * 0.05], [sx * beam * 0.4, depth, -len * 0.3], 0.04, '#3a2a1a');
      strut(b, [0, depth + 9, len * 0.05], [0, depth * 1.3, len * 0.5], 0.04, '#3a2a1a');
    }
    for (let i = 0; i < oars; i++) {
      const zz = (i / Math.max(1, oars - 1) - 0.5) * len * 0.55;
      for (const sx of [-1, 1]) strut(b, [sx * beam * 0.45, depth * 0.95, zz], [sx * beam * 1.1, -0.2, zz - 0.6], 0.08, '#5a4330');
    }
  } else {
    for (let i = 1; i < N; i++) {
      const s = stations[i];
      for (let k = 0; k < prof.length - 1; k++) strut(b, s[k], s[k + 1], 0.18, hull);
    }
    for (const k of [0, 6]) for (let i = 0; i < N; i++) strut(b, stations[i][k], stations[i + 1][k], 0.16, hull);
    for (let i = 0; i < N; i++) strut(b, stations[i][3], stations[i + 1][3], 0.3, '#5a3e28');
    for (const s of [stations[N], stations[0]]) strut(b, s[3], [s[3][0], s[3][1] + depth * 1.8, s[3][2] + Math.sign(s[3][2]) * 1.2], 0.25, hull);
    for (let k = 1; k <= 2; k++) for (const kk of [k, 6 - k]) for (let i = 2; i < N - 2; i++) strut(b, stations[i][kk], stations[i + 1][kk], 0.12, hull);
  }
  const mesh = b.build(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  mesh.castShadow = mesh.receiveShadow = true;
  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(x, y, z);
  group.rotation.y = rot;
  ctx.scene.add(group);
  return group;
}

// Plastered house with a hipped thatch roof and a dark doorway on local +z.
export function house(ctx, { x, z, rot = 0, w = 6, d = 5, h = 2.8, color = '#d8c7a4', roof = '#9a7a44', door = '#3a2a1e', flat = false }) {
  const at = frame(x, z, rot);
  let y0 = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
    const [px, pz] = at(lx, lz);
    y0 = Math.min(y0, ctx.heightAt(px, pz));
  }
  y0 -= 0.2;
  ctx.solid.box(w, h, d, { position: [x, y0 + h / 2, z], rotation: [0, rot, 0], color, shade: darkenBottom });
  ctx.colliders.add({ x, z, w, d, rot, bottom: y0, top: y0 + h });
  const [dx, dz] = at(0, d / 2 + 0.02);
  ctx.solid.box(1.1, 1.9, 0.06, { position: [dx, y0 + 0.2 + 0.95, dz], rotation: [0, rot, 0], color: door, jitter: 0 });
  if (flat) {
    ctx.solid.box(w + 0.4, 0.35, d + 0.4, { position: [x, y0 + h + 0.17, z], rotation: [0, rot, 0], color: roof, shade: darkenBottom });
  } else {
    const rh = Math.min(w, d) * 0.45;
    ctx.solid.add(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), {
      position: [x, y0 + h - 0.1, z],
      rotation: [0, rot, 0],
      scale: [w + 1.2, rh, d + 1.2],
      color: roof,
      jitter: 0.06,
      shade: darkenBottom,
    });
  }
}

export function flipped(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 3) {
    const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1);
    p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2));
    p.setXYZ(i + 2, x, y, z);
  }
  return g;
}

// Pole with a hanging cloth banner.
export function banner(ctx, { x, z, y, h = 6, w = 1.6, len = 2.4, color = '#c03a2a', pole = '#4a3424', rot = 0 }) {
  const base = y ?? ctx.heightAt(x, z);
  strut(ctx.solid, [x, base - 0.2, z], [x, base + h, z], 0.09, pole);
  const g = new THREE.PlaneGeometry(w, len, 4, 3);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / w + 0.5) * Math.PI * 1.6) * 0.18);
  g.translate(w / 2 + 0.05, h - len / 2 - 0.2, 0);
  ctx.solid.add(g, { position: [x, base, z], rotation: [0, rot, 0], color, jitter: 0.05 });
  ctx.solid.add(flipped(g), { position: [x, base, z], rotation: [0, rot, 0], color, jitter: 0.05 });
  strut(ctx.solid, [x, base + h - 0.15, z], [x + Math.cos(rot) * (w + 0.1), base + h - 0.15, z - Math.sin(rot) * (w + 0.1)], 0.05, pole);
}

// Glowing white faceless being, e.g. an angel, hovering or standing.
export function radiant(ctx, { x, z, y, scale = 1, face, halo = 5, light = 0, arms = 'out' }, createFigure) {
  const fig = createFigure({ x, y, z, face, scale, robe: '#fbf8f0', mantle: '#f4eedf', skin: '#f3e6cf', arms, emissive: 1.1 });
  ctx.scene.add(fig);
  if (halo) ctx.effects.halo({ position: [x, y + 1.2 * scale, z], size: halo, opacity: 0.6, color: '#fff3d6' });
  if (light) {
    const pl = new THREE.PointLight('#fff0cf', light, 24, 1.4);
    pl.position.set(x, y + 2, z + 0.5);
    ctx.scene.add(pl);
  }
  return fig;
}
