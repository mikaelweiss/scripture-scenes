import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { parts } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

const ARM_POSES = {
  down: [0.12, 0.05],
  out: [0.95, 0.35],
  up: [0.35, 2.75],
  reach: [0.25, 2.2],
  forward: [0.2, 1.45],
  pray: [0.45, 1.1],
  face: [0.5, 2.4],
};

const armPose = (p) => (typeof p === 'string' ? ARM_POSES[p] : p);

// Hot unlit color that blooms.
export function glowMaterial(color, boost = 1.6, extra = {}) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(boost), toneMapped: false, ...extra });
}

// A hand-placed person built from the engine's crowd parts, with per-arm poses and an optional held rod.
export function figure(ctx, o) {
  const { x, z, scale = 1, robe = '#8b6b4a', mantle, skin = '#a87652', hood = false, emissive = 0, arms = 'down', holds, kneel = false, collide = true } = o;
  const left = armPose(o.left ?? arms), right = armPose(o.right ?? arms);
  const group = new THREE.Group();
  const lit = (c, glow = emissive) => new THREE.MeshLambertMaterial({ color: c, vertexColors: true, emissive: new THREE.Color(c), emissiveIntensity: glow });
  group.add(new THREE.Mesh(parts.robe(), lit(robe)));
  if (mantle) group.add(new THREE.Mesh(parts.mantle(), lit(mantle)));
  if (hood) group.add(new THREE.Mesh(parts.hood(), lit(mantle ?? robe)));
  group.add(new THREE.Mesh(parts.head(), lit(skin, emissive * 0.3)));
  const sleeve = lit(mantle ?? robe);
  for (const [side, [spread, forward]] of [[-1, left], [1, right]]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.2, 1.32, 0.02);
    pivot.rotation.set(-forward, 0, side * spread, 'ZXY');
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0), sleeve);
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0).translate(0, -0.64, 0), lit(skin, 0));
    pivot.add(hand);
    if (holds && side === 1) {
      const { length = 1.2, color = '#e8b830', radius = 0.025, glow = 0, tip } = holds;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 6).translate(0, -0.6 - length / 2 + 0.15, 0), glow ? glowMaterial(color, glow) : new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.25 }));
      pivot.add(rod);
      if (tip) {
        const knob = new THREE.Mesh(new THREE.IcosahedronGeometry(tip.size ?? 0.07, 0).translate(0, -0.6 - length + 0.12, 0), tip.glow ? glowMaterial(tip.color ?? color, tip.glow) : new THREE.MeshLambertMaterial({ color: tip.color ?? color }));
        pivot.add(knob);
      }
    }
    group.add(pivot);
  }
  const ground = o.y ?? ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 }) ?? ctx.heightAt(x, z);
  const y = ground - (kneel ? 0.48 * scale : 0);
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  if (o.face) group.rotation.y = Math.atan2(o.face[0] - x, o.face[1] - z);
  if (o.yaw !== undefined) group.rotation.y = o.yaw;
  if (o.bow) group.rotation.x = o.bow;
  group.traverse((m) => (m.castShadow = true));
  ctx.scene.add(group);
  if (collide) ctx.colliders.add({ x, z, w: 0.6 * scale, d: 0.6 * scale, bottom: y, top: y + 1.75 * scale });
  if (o.light) {
    const light = new THREE.PointLight(o.light.color ?? '#fff0cf', o.light.intensity ?? 30, o.light.distance ?? 20, 1.4);
    light.position.set(x, y + 2 * scale, z + 0.4);
    ctx.scene.add(light);
  }
  if (o.halo) ctx.effects.halo({ position: [x, y + 1.3 * scale, z], ...o.halo });
  return group;
}

// Flickering cluster of flat-shaded flame tongues with a point light.
export function fire(ctx, { x, z, y, radius = 0.8, height = 2, count = 12, seed = 1, light = true, lightIntensity = 40, lightDistance = 25, colors = ['#ff5a14', '#ff8a1e', '#ffb53a', '#ffe07a'] }) {
  const r = rng(seed);
  const base = y ?? ctx.heightAt(x, z);
  const group = new THREE.Group();
  group.position.set(x, base, z);
  const geo = new THREE.ConeGeometry(1, 1, 5).translate(0, 0.5, 0);
  const tongues = [];
  for (let i = 0; i < count; i++) {
    const inner = i / count;
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius * (1 - inner * 0.6);
    const ci = Math.min(colors.length - 1, Math.floor(inner * colors.length));
    const mesh = new THREE.Mesh(geo, glowMaterial(colors[ci], 1.5 + inner));
    const w = radius * r.range(0.25, 0.5) * (1 - inner * 0.4);
    const h = height * r.range(0.45, 1) * (0.6 + inner * 0.5);
    mesh.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    mesh.scale.set(w, h, w);
    group.add(mesh);
    tongues.push({ mesh, w, h, ph: r() * 10, k: r.range(5, 9) });
  }
  ctx.scene.add(group);
  let point;
  if (light) {
    point = new THREE.PointLight('#ff9a40', lightIntensity, lightDistance, 1.3);
    point.position.set(x, base + height * 0.6, z);
    ctx.scene.add(point);
  }
  ctx.onFrame((t) => {
    for (const f of tongues) {
      const s = 0.75 + 0.18 * Math.sin(t * f.k + f.ph) + 0.1 * Math.sin(t * f.k * 2.3 + f.ph * 2);
      f.mesh.scale.set(f.w * (1.1 - s * 0.2), f.h * s, f.w * (1.1 - s * 0.2));
      f.mesh.rotation.y = t * 0.8 + f.ph;
    }
    if (point) point.intensity = lightIntensity * (0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 7.3));
  });
  return group;
}

// Gently heaving faceted water. Plane in world xz, centered on (x, z).
export function water(ctx, { x = 0, z = 0, y = 0, w = 100, d = 100, rot = 0, color = '#4c7d86', opacity = 0.86, amp = 0.07, cell = 1.6, geometry }) {
  const geo = geometry ?? new THREE.PlaneGeometry(w, d, Math.max(2, Math.round(w / cell)), Math.max(2, Math.round(d / cell))).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, side: THREE.DoubleSide });
  const time = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed.y += (sin(position.x * 0.9 + uTime * 1.4) + cos(position.z * 0.7 + uTime * 1.1) + sin((position.x + position.z) * 0.45 - uTime * 0.8)) * ${amp.toFixed(3)};`,
      );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

// Points every `step` meters along a polyline.
export function sample(path, step) {
  const out = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) out.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  out.push(path[path.length - 1]);
  return out;
}

// Terrain flats that carve a river channel along a path.
export function channelFlats(path, { r = 8, falloff = 10, height = -1.4, step } = {}) {
  return sample(path, step ?? r * 0.6).map(([x, z]) => ({ x, z, r, falloff, height }));
}

// Water ribbon along a path, wide enough to meet the channel banks.
export function riverGeometry(path, width, across = 8) {
  const pts = sample(path, 2);
  const pos = [];
  const row = (i) => {
    const [x, z] = pts[i];
    const [px, pz] = pts[Math.max(0, i - 1)], [nx, nz] = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(nx - px, nz - pz) || 1;
    const ox = -(nz - pz) / len, oz = (nx - px) / len;
    return Array.from({ length: across + 1 }, (_, k) => {
      const s = (k / across - 0.5) * width;
      return [x + ox * s, 0, z + oz * s];
    });
  };
  let prev = row(0);
  for (let i = 1; i < pts.length; i++) {
    const cur = row(i);
    for (let k = 0; k < across; k++) pos.push(...prev[k], ...cur[k], ...prev[k + 1], ...prev[k + 1], ...cur[k], ...cur[k + 1]);
    prev = cur;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

// Clumps of reeds along both banks of a path.
export function reeds(ctx, path, { offset = 7, spread = 2.5, every = 3, color = '#6f7f3a' } = {}) {
  const r = ctx.rand;
  const pts = sample(path, every);
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, z] = pts[i], [nx, nz] = pts[i + 1];
    const len = Math.hypot(nx - x, nz - z) || 1;
    const ox = -(nz - z) / len, oz = (nx - x) / len;
    for (const side of [-1, 1]) {
      if (r() < 0.3) continue;
      const cx = x + ox * side * (offset + r.range(-spread, spread)), cz = z + oz * side * (offset + r.range(-spread, spread));
      for (let k = 0; k < 5; k++) {
        const h = r.range(0.8, 1.8);
        const px = cx + r.range(-0.6, 0.6), pz = cz + r.range(-0.6, 0.6);
        ctx.solid.add(new THREE.ConeGeometry(0.06, h, 3), { position: [px, ctx.heightAt(px, pz) + h / 2 - 0.05, pz], rotation: [r.range(-0.2, 0.2), r() * 3, r.range(-0.2, 0.2)], color, jitter: 0.12 });
      }
    }
  }
}

function boxGeo(w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.rotateX(rx);
  g.rotateZ(rz);
  g.rotateY(ry);
  g.translate(x, y, z);
  return g.toNonIndexed();
}

// Faceted horse facing +z with its hooves at y = 0. `gallop` stretches the legs fore and aft.
export function horseGeometry(gallop = 0) {
  const g = [
    boxGeo(0.55, 0.6, 1.5, 0, 1.25, 0),
    boxGeo(0.32, 0.75, 0.38, 0, 1.75, 0.78, -0.65),
    boxGeo(0.26, 0.28, 0.6, 0, 2.05, 1.12, 0.35),
    boxGeo(0.14, 0.5, 0.14, 0, 1.15, -0.85, 0.5),
    boxGeo(0.08, 0.4, 0.22, 0, 2.05, 0.6, -0.4),
  ];
  for (const [lx, lz, swing] of [[-0.18, 0.55, 1], [0.18, 0.55, 1], [-0.18, -0.55, -1], [0.18, -0.55, -1]]) {
    const a = gallop * swing * 0.7;
    g.push(boxGeo(0.13, 0.95, 0.15, lx, 0.5 + (1 - Math.cos(a)) * 0.3, lz + Math.sin(a) * 0.35, a));
  }
  return mergeGeometries(g.map((x) => { const n = x.clone(); for (const k of Object.keys(n.attributes)) if (k !== 'position') n.deleteAttribute(k); return n; }));
}

// Two-wheeled chariot facing +z, axle at the origin, with a pole reaching forward.
export function chariotGeometry() {
  const wheel = (side) => {
    const w = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 8).rotateZ(Math.PI / 2).translate(side * 0.7, 0.6, 0).toNonIndexed();
    return w;
  };
  const g = [
    boxGeo(1.2, 0.1, 0.9, 0, 0.75, 0.1),
    boxGeo(1.2, 0.7, 0.08, 0, 1.1, 0.55, 0.15),
    boxGeo(0.08, 0.55, 0.9, -0.6, 1.05, 0.1),
    boxGeo(0.08, 0.55, 0.9, 0.6, 1.05, 0.1),
    boxGeo(0.1, 0.1, 2.6, 0, 0.85, 1.8),
    wheel(-1),
    wheel(1),
  ];
  return mergeGeometries(g.map((x) => { for (const k of Object.keys(x.attributes)) if (k !== 'position') x.deleteAttribute(k); return x; }));
}

// A chariot drawn by a pair of horses, as a single geometry facing +z.
export function teamGeometry({ horses = 2, gallop = 0.6 } = {}) {
  const parts = [chariotGeometry()];
  for (let i = 0; i < horses; i++) {
    const side = i % 2 ? 1 : -1;
    const row = Math.floor(i / 2);
    const h = horseGeometry(gallop).clone();
    h.translate(side * 0.42, 0, 3.4 + row * 2.0);
    parts.push(h);
  }
  return mergeGeometries(parts);
}

// Instanced copies of one geometry from a list of {x, y, z, yaw, scale}.
export function instances(ctx, geometry, material, list, { shadow = true } = {}) {
  const mesh = new THREE.InstancedMesh(geometry, material, list.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  list.forEach((it, i) => {
    p.set(it.x, it.y, it.z);
    q.setFromEuler(e.set(it.pitch ?? 0, it.yaw ?? 0, it.roll ?? 0, 'YXZ'));
    s.setScalar(it.scale ?? 1);
    mesh.setMatrixAt(i, m.compose(p, q, s));
    if (it.color) mesh.setColorAt(i, new THREE.Color(it.color));
  });
  mesh.castShadow = mesh.receiveShadow = shadow;
  mesh.computeBoundingSphere();
  ctx.scene.add(mesh);
  return mesh;
}

// Spinning column of translucent cones and swirling motes.
export function whirlwind(ctx, { x, z, y = 0, height = 30, radius = 4, color = '#e8d6b0', motes = 260, seed = 4, opacity = 0.09 }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const layers = [];
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.CylinderGeometry(radius * (1.3 + i * 0.25), radius * (0.25 + i * 0.12), height * (0.6 + i * 0.1), 9, 4, true);
    const pv = geo.attributes.position;
    for (let v = 0; v < pv.count; v++) {
      const yy = pv.getY(v);
      const a = yy * 0.12 + i;
      const px = pv.getX(v), pz = pv.getZ(v);
      pv.setXYZ(v, px * Math.cos(a) - pz * Math.sin(a), yy, px * Math.sin(a) + pz * Math.cos(a));
    }
    geo.translate(0, (height * (0.6 + i * 0.1)) / 2, 0);
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity * (1 - i * 0.13), side: THREE.DoubleSide, depthWrite: false, wireframe: false, toneMapped: false, fog: false });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    layers.push({ mesh, speed: 1.2 + i * 0.35 });
  }
  const r = rng(seed);
  const dust = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: '#f2e2c0', toneMapped: false }), motes);
  const seeds = Array.from({ length: motes }, () => [r() * Math.PI * 2, r(), r.range(0.6, 1.4)]);
  dust.frustumCulled = false;
  group.add(dust);
  ctx.scene.add(group);
  const m = new THREE.Matrix4();
  ctx.onFrame((t) => {
    for (const l of layers) l.mesh.rotation.y = t * l.speed;
    seeds.forEach(([a, off, k], i) => {
      const f = (off + t * 0.06 * k) % 1;
      const rad = radius * (0.3 + f * 1.5);
      const ang = a + t * 2.2 * k;
      m.makeTranslation(Math.cos(ang) * rad, f * height, Math.sin(ang) * rad);
      dust.setMatrixAt(i, m);
    });
    dust.instanceMatrix.needsUpdate = true;
  });
  return group;
}

// Simple pitched tent facing +z.
export function tent(ctx, { x, z, rot = 0, w = 3, d = 3.5, h = 2.2, color = '#6b5440' }) {
  const y = ctx.heightAt(x, z) - 0.05;
  ctx.solid.add(new THREE.ConeGeometry(Math.max(w, d) * 0.62, h, 4), { position: [x, y + h / 2, z], rotation: [0, rot + Math.PI / 4, 0], scale: [w / Math.max(w, d), 1, d / Math.max(w, d)], color });
  ctx.colliders.add({ x, z, w: w * 0.8, d: d * 0.8, rot, bottom: y, top: y + h });
}
