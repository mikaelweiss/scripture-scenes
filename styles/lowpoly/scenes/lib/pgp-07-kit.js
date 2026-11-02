import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export const standAt = (ctx, x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });

export const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);

export function box(ctx, { x, y, z, w, h, d, rot = 0, tilt = [0, 0], color, jitter = 0.05, collide = true, glow = false }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: glow ? undefined : darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

export function block(ctx, { x, z, w, d, bottom = -5, top = 50, rot = 0 }) {
  ctx.colliders.add({ x, z, w, d, rot, bottom, top });
}

// Triangular prism for gable ends: base width w on y=0, apex height h, depth d along z.
export function gable(w, h, d) {
  return new THREE.CylinderGeometry(1, 1, d, 3).rotateX(-Math.PI / 2).translate(0, 0.5, 0).scale(w / 1.732, h / 1.5, 1);
}

// Broadleaf tree with a tall bare trunk and a high canopy so the ground under it stays walkable.
export function hardwood(ctx, { x, z, h = ctx.rand.range(11, 17), leaf = '#6f9a3c', leaves = null, trunk = '#6b5e52', radius = ctx.rand.range(0.22, 0.42), canopy = 1 }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.3;
  const lean = [r.range(-0.05, 0.05), 0, r.range(-0.05, 0.05)];
  ctx.solid.add(new THREE.CylinderGeometry(radius * 0.55, radius, h, 6), { position: [x, y + h / 2, z], rotation: lean, color: trunk, jitter: 0.08 });
  ctx.colliders.add({ x, z, w: radius * 2.4, d: radius * 2.4, bottom: y, top: y + h });
  for (let i = 0; i < 3; i++) {
    const a = r() * Math.PI * 2, len = h * r.range(0.25, 0.4);
    const by = y + h * r.range(0.55, 0.8);
    ctx.solid.add(new THREE.CylinderGeometry(0.05, radius * 0.4, len, 4).translate(0, len / 2, 0), {
      position: [x, by, z],
      rotation: [r.range(0.7, 1.1), a, 0],
      color: trunk,
    });
  }
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const rad = h * r.range(0.14, 0.22) * canopy;
    const a = r() * Math.PI * 2, d = r.range(0.3, 1) * rad * 1.1;
    ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
      position: [x + Math.cos(a) * d, y + h * r.range(0.82, 1.02), z + Math.sin(a) * d],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, r.range(0.55, 0.8), 1],
      color: leaves ? r.pick(leaves) : leaf,
      jitter: 0.12,
    });
  }
}

export function sapling(ctx, { x, z, h = ctx.rand.range(1.2, 3), leaf = '#7fae48' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.06, h, 4), { position: [x, y + h / 2, z], color: '#5d5044' });
  for (let i = 0; i < 3; i++) {
    ctx.solid.add(new THREE.IcosahedronGeometry(h * r.range(0.16, 0.26), 0), {
      position: [x + r.range(-0.4, 0.4), y + h * r.range(0.55, 1), z + r.range(-0.4, 0.4)],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, 0.6, 1],
      color: leaf,
      jitter: 0.12,
    });
  }
}

export function fern(ctx, { x, z, size = ctx.rand.range(0.4, 0.8), color = '#5f8f3a' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + r.range(-0.3, 0.3);
    const g = new THREE.ConeGeometry(0.18, 1, 3).translate(0, 0.5, 0);
    ctx.solid.add(g, { position: [x, y, z], rotation: [r.range(0.8, 1.2), a, 0], scale: [size, size, size * 0.3], color, jitter: 0.12 });
  }
}

export function log(ctx, { x, z, len = 5, rot = 0, radius = 0.3, color = '#5a4a3c', y }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(radius, radius * 1.1, len, 6), { position: [x, base + radius * 0.8, z], rotation: [Math.PI / 2, rot, 0], color, jitter: 0.08 });
  ctx.colliders.add({ x, z, w: radius * 2, d: len, rot, bottom: base, top: base + radius * 1.6 });
}

// Split-rail zigzag fence along a straight line.
export function railFence(ctx, { a, b, color = '#7d6a55', h = 1.1 }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.round(len / 3));
  const ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    const y = ctx.heightAt(x, z);
    const zig = i % 2 ? 0.35 : -0.35;
    for (let k = 0; k < 4; k++) {
      ctx.solid.box(0.12, 0.12, len / n + 0.4, { position: [x, y + 0.2 + k * (h / 4), z], rotation: [0, ang + zig, 0], color, jitter: 0.1 });
    }
  }
}

// Clapboard farmhouse with a gable roof, door on local +z.
export function farmhouse(ctx, { x, z, rot = 0, w = 9, d = 6, h = 4.2, wall = '#c9bfa8', roof = '#5a4a40', lit = false, chimney = true }) {
  const at = frame(x, z, rot);
  let y = Infinity;
  for (const [lx, lz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) y = Math.min(y, ctx.heightAt(...at(lx, lz)));
  y -= 0.1;
  box(ctx, { x, y: y - 0.6, z, w, h: h + 0.6, d, rot, color: wall });
  const rh = d * 0.42;
  ctx.solid.add(gable(d + 0.6, rh, w + 0.6), { position: [x, y + h, z], rotation: [0, rot + Math.PI / 2, 0], color: roof, shade: darkenBottom });
  const pane = lit ? '#ffc56a' : '#3c4450';
  const target = lit ? ctx.glow : ctx.solid;
  for (const lx of [-w * 0.3, w * 0.3]) {
    const [px, pz] = at(lx, d / 2 + 0.03);
    target.box(0.8, 1.1, 0.06, { position: [px, y + 2.1, pz], rotation: [0, rot, 0], color: pane, jitter: 0 });
    const [qx, qz] = at(lx, -d / 2 - 0.03);
    target.box(0.8, 1.1, 0.06, { position: [qx, y + 2.1, qz], rotation: [0, rot, 0], color: pane, jitter: 0 });
  }
  const [dx, dz] = at(0, d / 2 + 0.04);
  ctx.solid.box(1, 2.1, 0.08, { position: [dx, y + 1.05, dz], rotation: [0, rot, 0], color: '#4a3a2e' });
  if (chimney) {
    const [cx, cz] = at(w / 2 - 0.6, 0);
    ctx.solid.box(0.8, h + rh + 0.8 - 1, 0.8, { position: [cx, y + 1 + (h + rh + 0.8 - 1) / 2, cz], rotation: [0, rot, 0], color: '#8a5a44' });
  }
}

const mat = (color, emissive = 0) => new THREE.MeshLambertMaterial({ color, flatShading: true, emissive: emissive ? new THREE.Color(color) : 0x000000, emissiveIntensity: emissive });

// Early nineteenth-century figure built at its feet, facing local +z.
// pose: stand | kneel | sit | sleep. arms: down | forward | write | pray | raise | rest | out.
export function settler(ctx, s) {
  const {
    x, z, yaw = 0, kind = 'man', pose = 'stand', arms = 'down', scale = 1,
    coat = '#2f3138', vest = '#5a4a3a', pants = '#3a3530', shirt = '#ece6d8', skin = '#d9a582', hair = '#4a3322',
    dress = '#5a4b5e', apron, bonnet, hat = false, coatOff = false, collide = true,
  } = s;
  const y = s.y ?? standAt(ctx, x, z);
  const g = new THREE.Group();
  const add = (geo, color, px, py, pz, rot = [0, 0, 0], parent = g, emissive = 0) => {
    const m = new THREE.Mesh(geo, mat(color, emissive));
    m.position.set(px, py, pz);
    m.rotation.set(...rot);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const hip = { stand: 0.85, kneel: 0.5, sit: 0.47, sleep: 0.85 }[pose];
  const upper = new THREE.Group();
  upper.position.y = hip - 0.85;
  g.add(upper);
  const legColor = kind === 'woman' ? dress : pants;

  if (kind === 'woman') {
    if (pose === 'stand') add(new THREE.CylinderGeometry(0.2, 0.36, 0.95, 8).translate(0, 0.475, 0), dress, 0, 0, 0);
    else if (pose === 'sit') add(new THREE.BoxGeometry(0.5, 0.2, 0.55), dress, 0, 0.5, 0.2);
    else add(new THREE.BoxGeometry(0.5, 0.45, 0.5), dress, 0, 0.22, -0.05);
    if (apron && pose === 'stand') add(new THREE.BoxGeometry(0.34, 0.7, 0.04), apron, 0, 0.55, 0.25, [-0.17, 0, 0]);
  } else if (pose === 'stand') {
    for (const sd of [-1, 1]) {
      add(new THREE.BoxGeometry(0.15, 0.84, 0.17), legColor, sd * 0.1, 0.43, 0);
      add(new THREE.BoxGeometry(0.14, 0.08, 0.26), '#231d18', sd * 0.1, 0.04, 0.04);
    }
  } else if (pose === 'kneel') {
    for (const sd of [-1, 1]) {
      add(new THREE.BoxGeometry(0.15, 0.44, 0.17), legColor, sd * 0.1, 0.28, 0.02, [-0.15, 0, 0]);
      add(new THREE.BoxGeometry(0.14, 0.13, 0.5), legColor, sd * 0.1, 0.07, -0.2);
      add(new THREE.BoxGeometry(0.13, 0.08, 0.2), '#231d18', sd * 0.1, 0.06, -0.5);
    }
  } else if (pose === 'sit') {
    for (const sd of [-1, 1]) {
      add(new THREE.BoxGeometry(0.15, 0.15, 0.48), legColor, sd * 0.1, 0.47, 0.2);
      add(new THREE.BoxGeometry(0.14, 0.47, 0.15), legColor, sd * 0.1, 0.23, 0.42);
      add(new THREE.BoxGeometry(0.14, 0.08, 0.24), '#231d18', sd * 0.1, 0.04, 0.46);
    }
  }

  const torsoColor = kind === 'woman' ? dress : coatOff ? shirt : coat;
  if (kind === 'woman') {
    add(new THREE.CylinderGeometry(0.16, 0.2, 0.6, 7).translate(0, 1.15, 0), dress, 0, 0, 0, undefined, upper);
    add(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 7), apron ?? '#ece4d2', 0, 1.43, 0, undefined, upper);
  } else {
    const len = coatOff ? 0.64 : 0.86;
    add(new THREE.CylinderGeometry(0.19, coatOff ? 0.2 : 0.25, len, 7).translate(0, 1.47 - len / 2, 0), torsoColor, 0, 0, 0, undefined, upper);
    if (coatOff) add(new THREE.BoxGeometry(0.3, 0.36, 0.05), vest, 0, 1.2, 0.17, [0.08, 0, 0], upper);
    else add(new THREE.BoxGeometry(0.12, 0.2, 0.05), shirt, 0, 1.36, 0.18, [0.1, 0, 0], upper);
  }
  add(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 6), skin, 0, 1.5, 0, undefined, upper);
  add(new THREE.IcosahedronGeometry(0.125, 0).scale(1, 1.12, 1), skin, 0, 1.62, 0.01, undefined, upper);
  if (kind === 'woman') {
    if (bonnet) {
      add(new THREE.SphereGeometry(0.17, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.1, 1.15), bonnet, 0, 1.6, -0.03, [-0.35, 0, 0], upper);
    } else add(new THREE.SphereGeometry(0.135, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 1.63, -0.015, [-0.3, 0, 0], upper);
  } else {
    add(new THREE.SphereGeometry(0.135, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 1.64, -0.02, [-0.3, 0, 0], upper);
    if (hat) {
      add(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 9), '#1e1b1a', 0, 1.74, 0, undefined, upper);
      add(new THREE.CylinderGeometry(0.13, 0.14, 0.18, 9), '#1e1b1a', 0, 1.83, 0, undefined, upper);
    }
  }

  const armColor = kind === 'woman' ? dress : coatOff ? shirt : coat;
  const pose3 = {
    down: [[0, 0.12], [0, 0.12]],
    forward: [[-1.2, 0.1], [-1.2, 0.1]],
    write: [[-1.0, -0.25], [-1.25, 0.1]],
    pray: [[-0.75, -0.45], [-0.75, -0.45]],
    raise: [[0.1, 0.15], [-2.7, 0.1]],
    rest: [[-0.5, 0.25], [-0.5, 0.25]],
    out: [[-0.35, 0.9], [-0.35, 0.9]],
    lap: [[-0.9, -0.25], [-0.9, -0.25]],
  }[arms];
  [-1, 1].forEach((sd, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(sd * 0.23, 1.42, 0);
    pivot.rotation.set(pose3[i][0], 0, sd * pose3[i][1]);
    upper.add(pivot);
    add(new THREE.CylinderGeometry(0.055, 0.065, 0.6, 5).translate(0, -0.3, 0), armColor, 0, 0, 0, undefined, pivot);
    add(new THREE.BoxGeometry(0.08, 0.11, 0.06), skin, 0, -0.64, 0, undefined, pivot);
  });

  if (pose === 'sleep') {
    g.rotation.set(-Math.PI / 2, 0, 0);
    const outer = new THREE.Group();
    outer.add(g);
    outer.position.set(x, y + 0.15, z);
    outer.rotation.y = yaw;
    outer.scale.setScalar(scale);
    ctx.scene.add(outer);
    return outer;
  }
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  g.scale.setScalar(scale);
  ctx.scene.add(g);
  if (collide) ctx.colliders.add({ x, z, w: 0.55, d: 0.55, bottom: y, top: y + 1.8 * scale });
  return g;
}

// Heavenly messenger in white with soft light, faceless and simple.
export function messenger(ctx, { x, z, y, face, scale = 1.05, arms = 'down', light = 40, distance = 16, color = '#fff2d8', halo = 4.5, haloOpacity = 0.6, robe = '#fdfaf2', mantle = '#f6efe0', skin = '#e8d2b8', emissive = 0.55 }) {
  const fig = createFigure({ x, y, z, face, scale, robe, mantle, skin, arms, emissive });
  fig.traverse((o) => {
    if (o.material) {
      o.material.emissiveIntensity = emissive;
      o.material.emissive.set(robe);
    }
  });
  ctx.scene.add(fig);
  if (light) {
    const pl = new THREE.PointLight(color, light, distance, 1.4);
    pl.position.set(x, y + 1.6 * scale, z);
    ctx.scene.add(pl);
  }
  if (halo) ctx.effects.halo({ position: [x, y + 1.15 * scale, z], size: halo, opacity: haloOpacity, color });
  return fig;
}

// Gently moving flat-shaded water surface.
export function water(ctx, { x, z, w, d, y, rot = 0, color = '#4f7f88', opacity = 0.9, amp = 0.05, seg = 2.5, speed = 1, flow = [0, 0] }) {
  const geo = new THREE.PlaneGeometry(w, d, Math.max(2, Math.round(w / seg)), Math.max(2, Math.round(d / seg)));
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const r = ctx.rand;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + (r() - 0.5) * seg * 0.4, 0, p.getZ(i) + (r() - 0.5) * seg * 0.4);
  const time = { value: 0 };
  const m = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 60, specular: '#cfe4f0', transparent: opacity < 1, opacity });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec2 q = position.xz - vec2(${flow[0].toFixed(3)}, ${flow[1].toFixed(3)}) * uTime;
        transformed.y += (sin(q.x * 0.45 + uTime * ${(1.3 * speed).toFixed(3)}) + cos(q.y * 0.6 + uTime * ${(0.9 * speed).toFixed(3)}) + sin((q.x + q.y) * 0.9 + uTime * ${(2.1 * speed).toFixed(3)}) * 0.5) * ${amp.toFixed(3)};`);
  };
  const mesh = new THREE.Mesh(geo.toNonIndexed(), m);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

export function pointLight(ctx, { x, y, z, color = '#ffb25a', intensity = 6, distance = 8, flicker = 0 }) {
  const l = new THREE.PointLight(color, intensity, distance, 1.6);
  l.position.set(x, y, z);
  ctx.scene.add(l);
  if (flicker) ctx.onFrame((t) => (l.intensity = intensity * (1 - flicker + flicker * (0.6 + 0.4 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 1)))));
  return l;
}

// Small flame of stacked glowing cones.
export function flame(ctx, { x, y, z, size = 1, color = '#ffb24a', core = '#fff1b0' }) {
  ctx.glow.add(new THREE.ConeGeometry(0.03 * size, 0.1 * size, 5), { position: [x, y + 0.05 * size, z], color, jitter: 0.05 });
  ctx.glow.add(new THREE.ConeGeometry(0.015 * size, 0.06 * size, 4), { position: [x, y + 0.035 * size, z], color: core, jitter: 0 });
}

export function candle(ctx, { x, y, z, light = 2.5, distance = 6 }) {
  ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 8), { position: [x, y + 0.01, z], color: '#6a6458' });
  ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), { position: [x, y + 0.1, z], color: '#efe6cc', jitter: 0 });
  flame(ctx, { x, y: y + 0.18, z });
  return pointLight(ctx, { x, y: y + 0.3, z, intensity: light, distance, flicker: 0.25 });
}

export function chair(ctx, { x, z, y, rot = 0, color = '#6a4a30' }) {
  const at = frame(x, z, rot);
  ctx.solid.box(0.44, 0.05, 0.42, { position: [x, y + 0.45, z], rotation: [0, rot, 0], color });
  for (const [lx, lz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) {
    const [px, pz] = at(lx, lz);
    ctx.solid.box(0.04, 0.45, 0.04, { position: [px, y + 0.225, pz], rotation: [0, rot, 0], color });
  }
  for (const lx of [-0.19, 0.19]) {
    const [px, pz] = at(lx, -0.19);
    ctx.solid.box(0.04, 0.5, 0.04, { position: [px, y + 0.72, pz], rotation: [0, rot, 0], color });
  }
  for (const k of [0, 1, 2]) {
    const [px, pz] = at(0, -0.19);
    ctx.solid.box(0.4, 0.04, 0.03, { position: [px, y + 0.62 + k * 0.14, pz], rotation: [0, rot, 0], color });
  }
}

export function table(ctx, { x, z, y, w = 1.4, d = 0.8, h = 0.76, rot = 0, color = '#7a5638', collide = true }) {
  const at = frame(x, z, rot);
  ctx.solid.box(w, 0.05, d, { position: [x, y + h - 0.025, z], rotation: [0, rot, 0], color });
  for (const [lx, lz] of [[-w / 2 + 0.06, -d / 2 + 0.06], [w / 2 - 0.06, -d / 2 + 0.06], [-w / 2 + 0.06, d / 2 - 0.06], [w / 2 - 0.06, d / 2 - 0.06]]) {
    const [px, pz] = at(lx, lz);
    ctx.solid.box(0.06, h - 0.05, 0.06, { position: [px, y + (h - 0.05) / 2, pz], rotation: [0, rot, 0], color });
  }
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
  return y + h;
}

// Rope bed with a straw tick and a quilt, head at local -z.
export function bed(ctx, { x, z, y, rot = 0, w = 1.3, len = 2, frameColor = '#6a4a30', quilt = '#8a3a2e', quiltAlt = '#d8c8a0', sheet = '#ece4d0', lumps = [] }) {
  const at = frame(x, z, rot);
  for (const [lx, lz, h] of [[-w / 2, -len / 2, 0.9], [w / 2, -len / 2, 0.9], [-w / 2, len / 2, 0.6], [w / 2, len / 2, 0.6]]) {
    const [px, pz] = at(lx, lz);
    ctx.solid.box(0.08, h, 0.08, { position: [px, y + h / 2, pz], rotation: [0, rot, 0], color: frameColor });
  }
  const [hx, hz] = at(0, -len / 2);
  ctx.solid.box(w, 0.4, 0.05, { position: [hx, y + 0.65, hz], rotation: [0, rot, 0], color: frameColor });
  ctx.solid.box(w, 0.3, len, { position: [x, y + 0.3, z], rotation: [0, rot, 0], color: frameColor });
  ctx.solid.box(w - 0.06, 0.16, len - 0.06, { position: [x, y + 0.52, z], rotation: [0, rot, 0], color: sheet });
  const [px, pz] = at(0, -len / 2 + 0.25);
  ctx.solid.box(w * 0.7, 0.12, 0.35, { position: [px, y + 0.66, pz], rotation: [0, rot, 0], color: sheet });
  const rows = 6, cols = 4;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const [qx, qz] = at(-w / 2 + (i + 0.5) * (w / cols), -len / 2 + 0.5 + (j + 0.5) * ((len - 0.5) / rows));
      ctx.solid.box(w / cols + 0.01, 0.06, (len - 0.5) / rows + 0.01, { position: [qx, y + 0.62, qz], rotation: [0, rot, 0], color: (i + j) % 2 ? quilt : quiltAlt, jitter: 0.06 });
    }
  }
  for (const [lz, s] of lumps) {
    const [qx, qz] = at(0, lz);
    ctx.solid.add(new THREE.CylinderGeometry(0.24 * s, 0.26 * s, 1.3 * s, 7), { position: [qx, y + 0.66, qz], rotation: [Math.PI / 2, rot, 0], scale: [1, 1, 0.55], color: quilt, jitter: 0.06 });
    const [hx2, hz2] = at(0, lz - 0.75 * s);
    ctx.solid.add(new THREE.IcosahedronGeometry(0.12 * s, 0), { position: [hx2, y + 0.76, hz2], color: '#4a3322' });
  }
  ctx.colliders.add({ x, z, w, d: len, rot, bottom: y, top: y + 0.65 });
}

export function stars(ctx, { count = 900, seed = 7, color = '#e8eeff', size = 1.5 }) {
  const pos = [];
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, y = Math.pow(rnd(), 0.6) * 0.95 + 0.04;
    const r = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * r * 1300, y * 1300, Math.sin(a) * r * 1300);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
  pts.renderOrder = -9;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, cam) => pts.position.copy(cam.position));
}

// Field of crop rows or stubble on the terrain.
export function field(ctx, { x, z, w, d, rot = 0, color = '#b59a4a', rows = 10, h = 0.5 }) {
  const at = frame(x, z, rot);
  for (let i = 0; i < rows; i++) {
    const lx = -w / 2 + (i + 0.5) * (w / rows);
    const n = Math.max(1, Math.round(d / 6));
    for (let k = 0; k < n; k++) {
      const [px, pz] = at(lx, -d / 2 + (k + 0.5) * (d / n));
      ctx.solid.box((w / rows) * 0.55, h, d / n, { position: [px, ctx.heightAt(px, pz) + h / 2 - 0.15, pz], rotation: [0, rot, 0], color, jitter: 0.08 });
    }
  }
}
