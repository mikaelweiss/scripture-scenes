// Shared helpers for ot-25 through ot-30: hand-built crowds with props, flames, night skies, tents, camels, water.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, polarScatter, insideAny, jitterColor } from '../../engine/util.js';
import { createCrowd, createFigure, parts } from '../../engine/crowd.js';

export { rng, createFigure };

const white = (geo) => {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
  g.computeVertexNormals();
  return g;
};

// Deterministic spaced points, so props can be placed in the hands of the same people.
export function scatter({ count, center = [0, 0], ring = [0, 10], arc, spacing = 0.9, avoid = [], seed = 1 }) {
  const r = rng(seed);
  const pts = [];
  for (let tries = 0; pts.length < count && tries < count * 60; tries++) {
    const [x, z] = polarScatter(r, { center, ring, arc });
    if (insideAny(x, z, avoid) || pts.some((p) => (p[0] - x) ** 2 + (p[1] - z) ** 2 < spacing * spacing)) continue;
    pts.push([x, z]);
  }
  return pts;
}

// Points along a line segment band, e.g. ranks of soldiers.
export function rows({ from, to, depth = 3, rows: n = 3, spacing = 0.9, jitter = 0.2, seed = 1 }) {
  const r = rng(seed);
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const ux = (to[0] - from[0]) / len, uz = (to[1] - from[1]) / len;
  const pts = [];
  for (let row = 0; row < n; row++) {
    const off = n > 1 ? (row / (n - 1) - 0.5) * depth : 0;
    for (let d = row % 2 ? spacing / 2 : 0; d <= len; d += spacing) {
      pts.push([from[0] + ux * d - uz * off + r.range(-jitter, jitter), from[1] + uz * d + ux * off + r.range(-jitter, jitter)]);
    }
  }
  return pts;
}

export function makePeople(pts, { palette, face, yaw, children = 0, kneel = 0, yawJitter = 0.3, seed = 5, scale = [0.92, 1.1] }) {
  const r = rng(seed);
  return pts.map(([x, z]) => {
    const child = r() < children;
    const dir = yaw ?? (typeof face === 'function' ? face(x, z, r) : Math.atan2(face[0] - x, face[1] - z));
    return {
      x, z,
      kneel: r() < kneel,
      yaw: dir + r.range(-yawJitter, yawJitter),
      scale: child ? r.range(0.55, 0.72) : r.range(scale[0], scale[1]),
      robe: jitterColor(r.pick(palette.robes), r, 0.08),
      mantle: r() < (palette.mantleChance ?? 0.6) ? jitterColor(r.pick(palette.mantles), r, 0.08) : null,
      hood: r() < (palette.hoodChance ?? 0.3),
      skin: jitterColor(r.pick(palette.skins), r, 0.05),
    };
  });
}

// One arm from the shoulder: spread swings it sideways, lift swings it forward and up (PI points straight up).
function arm(side, spread, lift) {
  const g = new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0);
  g.rotateX(-lift);
  g.rotateZ(side * spread);
  g.translate(side * 0.2, 1.32, 0.02);
  return g.toNonIndexed();
}

export function armsGeo({ left = [0.12, 0.05], right = [0.12, 0.05] } = {}) {
  return white(mergeGeometries([arm(-1, ...left), arm(1, ...right)]));
}

// Local hand position for an arm pose, in the person's frame (+z forward).
export function handAt(side, spread, lift) {
  const v = new THREE.Vector3(0, -0.6, 0);
  v.applyAxisAngle(new THREE.Vector3(1, 0, 0), -lift);
  v.applyAxisAngle(new THREE.Vector3(0, 0, 1), side * spread);
  return [v.x + side * 0.2, v.y + 1.32, v.z + 0.02];
}

const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpP = new THREE.Vector3(), tmpS = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export function personMatrix(p) {
  tmpP.set(p.x, p.y, p.z);
  tmpQ.setFromAxisAngle(UP, p.yaw);
  tmpS.setScalar(p.scale);
  return tmpM.compose(tmpP, tmpQ, tmpS);
}

// Converts a local offset in a person's frame to world coordinates.
export function local(p, [lx, ly, lz]) {
  const c = Math.cos(p.yaw), s = Math.sin(p.yaw);
  return [p.x + (lx * c + lz * s) * p.scale, p.y + ly * p.scale, p.z + (-lx * s + lz * c) * p.scale];
}

// Places people on the ground (or structures) and adds the engine's instanced crowd, plus optional instanced arms.
export function addPeople(ctx, people, { arms, onStructures = false } = {}) {
  for (const p of people) {
    if (p.y === undefined) {
      const ground = onStructures ? ctx.colliders.ground(p.x, p.z, 1000, ctx.heightAt(p.x, p.z), { radius: 0 }) : ctx.heightAt(p.x, p.z);
      p.y = ground - (p.kneel ? 0.48 : 0);
    }
  }
  const time = { value: 0 };
  ctx.onFrame((t) => (time.value = t));
  ctx.scene.add(createCrowd(people, time));
  if (arms) {
    const mesh = new THREE.InstancedMesh(armsGeo(arms), new THREE.MeshLambertMaterial({ vertexColors: true }), people.length);
    people.forEach((p, i) => {
      mesh.setMatrixAt(i, personMatrix(p));
      mesh.setColorAt(i, p.mantle ?? p.robe);
    });
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  return people;
}

// Instanced props in world space: list of { position, rotation, scale, color }.
export function instanced(ctx, geometry, list, material) {
  const geo = white(geometry);
  const mat = material ?? new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  const e = new THREE.Euler();
  list.forEach((it, i) => {
    tmpP.set(...it.position);
    tmpQ.setFromEuler(e.set(...(it.rotation ?? [0, 0, 0]), 'YXZ'));
    const s = it.scale ?? 1;
    typeof s === 'number' ? tmpS.setScalar(s) : tmpS.set(...s);
    mesh.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS));
    mesh.setColorAt(i, new THREE.Color(it.color ?? '#ffffff'));
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  ctx.scene.add(mesh);
  return mesh;
}

// Flickering low-poly flames, one instanced mesh for all of them.
export function flames(ctx, list, { color = '#ffa040', core = '#fff1b0' } = {}) {
  const outer = new THREE.ConeGeometry(0.5, 1.4, 5).translate(0, 0.7, 0);
  const inner = new THREE.ConeGeometry(0.28, 0.9, 5).translate(0, 0.45, 0.02);
  const paint = (g, c) => {
    const n = g.toNonIndexed();
    const col = new THREE.Color(c);
    const arr = new Float32Array(n.attributes.position.count * 3);
    for (let i = 0; i < arr.length; i += 3) arr.set([col.r, col.g, col.b], i);
    n.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    n.deleteAttribute('uv');
    n.deleteAttribute('normal');
    return n;
  };
  const geo = mergeGeometries([paint(outer, color), paint(inner, core)]);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false }), list.length);
  const phases = list.map((_, i) => i * 1.7);
  const e = new THREE.Euler();
  const update = (t) => {
    list.forEach((f, i) => {
      const ph = phases[i];
      const k = 1 + 0.22 * Math.sin(t * 11 + ph) + 0.12 * Math.sin(t * 23 + ph * 2.3);
      tmpP.set(...f.position);
      tmpQ.setFromEuler(e.set(0.08 * Math.sin(t * 7 + ph), t * 2 + ph, 0.08 * Math.cos(t * 9 + ph)));
      tmpS.set(f.size, f.size * k, f.size);
      mesh.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  ctx.onFrame(update);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  return mesh;
}

// A flickering warm point light.
export function fireLight(ctx, position, { color = '#ff9a40', intensity = 30, distance = 25 } = {}) {
  const light = new THREE.PointLight(color, intensity, distance, 1.5);
  light.position.set(...position);
  ctx.scene.add(light);
  const ph = position[0] * 0.3 + position[2] * 0.7;
  ctx.onFrame((t) => (light.intensity = intensity * (0.85 + 0.1 * Math.sin(t * 13 + ph) + 0.05 * Math.sin(t * 29 + ph))));
  return light;
}

export function stars(ctx, { count = 1500, seed = 4, color = '#dfe6ff', size = 1.6, minY = 0.08 } = {}) {
  const r = rng(seed);
  const pos = [];
  while (pos.length < count * 3) {
    const v = new THREE.Vector3(r.range(-1, 1), r.range(minY, 1), r.range(-1, 1));
    if (v.length() > 1 || v.length() < 0.2) continue;
    v.normalize().multiplyScalar(1200);
    pos.push(v.x, v.y, v.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
  points.renderOrder = -8;
  ctx.onFrame((t, dt, camera) => points.position.copy(camera.position));
  ctx.scene.add(points);
  return points;
}

// Black goat-hair tent: a low ridge of cloth on poles, open at the front.
export function tent(ctx, { x, z, rot = 0, w = 6, d = 4, h = 2.2, color = '#2e2622', y }) {
  const base = y ?? ctx.heightAt(x, z) - 0.05;
  const roof = new THREE.CylinderGeometry(1, 1, 1, 3, 1);
  roof.rotateZ(Math.PI / 2);
  roof.rotateX(-Math.PI / 2);
  ctx.solid.add(roof, { position: [x, base + h / 3, z], rotation: [0, rot, 0], scale: [w, h / 1.5, d * 0.62], color, jitter: 0.06 });
  ctx.colliders.add({ x, z, w, d: d * 0.9, rot, bottom: base, top: base + h });
}

// Simple lying or standing camel built from boxes.
export function camel(ctx, { x, z, rot = 0, lying = false, color = '#b08a5a' }) {
  const y = ctx.heightAt(x, z);
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, ly, lz) => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
  const lift = lying ? 0.4 : 1.3;
  const add = (geo, p, scale, tilt = 0) => ctx.solid.add(geo, { position: at(...p), rotation: [tilt, rot, 0], scale, color, jitter: 0.06 });
  const box = new THREE.BoxGeometry(1, 1, 1);
  add(box, [0, lift + 0.45, 0], [0.8, 0.8, 1.8]);
  add(new THREE.DodecahedronGeometry(0.5, 0), [0, lift + 1.0, -0.1], [0.9, 0.8, 1.1]);
  add(box, [0, lift + 0.95, 1.05], [0.32, 1.1, 0.35], -0.5);
  add(box, [0, lift + 1.45, 1.45], [0.3, 0.3, 0.6]);
  if (!lying) for (const [lx, lz] of [[-0.28, 0.65], [0.28, 0.65], [-0.28, -0.65], [0.28, -0.65]]) add(box, [lx, lift / 2, lz], [0.16, lift, 0.16]);
  ctx.colliders.add({ x, z, w: 1, d: 2.4, rot, bottom: y, top: y + lift + 1.4 });
}

// A flat ribbon of water following a path, slightly above the terrain.
export function stream(ctx, path, { width = 2.5, color = '#5f8fa8', lift = 0.12, emissive = 0.15 } = {}) {
  const positions = [];
  const pts = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, bz - az) / 1.5));
    for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  pts.push(path[path.length - 1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const nx = -(bz - az) / len, nz = (bx - ax) / len;
    const w = width / 2;
    const p = [[ax + nx * w, az + nz * w], [ax - nx * w, az - nz * w], [bx + nx * w, bz + nz * w], [bx - nx * w, bz - nz * w]].map(([px, pz]) => [
      px,
      Math.min(ctx.heightAt(ax, az), ctx.heightAt(bx, bz)) + lift,
      pz,
    ]);
    positions.push(...p[0], ...p[2], ...p[1], ...p[1], ...p[2], ...p[3]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: emissive, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return pts;
}

// Banner on a pole.
export function banner(ctx, { x, z, h = 5, color = '#a03028', pole = '#4a3828', size = [1.4, 1.0], y }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, h, 5), { position: [x, base + h / 2, z], color: pole });
  ctx.solid.box(size[0], size[1], 0.05, { position: [x + size[0] / 2, base + h - size[1] / 2 - 0.1, z], rotation: [0, 0, 0.04], color, jitter: 0.08 });
}
