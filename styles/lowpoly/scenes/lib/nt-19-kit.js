import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

export const ROBES = ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#9a4a34', '#7d6b8a'];
export const MANTLES = ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246', '#2f4a5c'];
export const SKINS = ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'];
export const palette = { robes: ROBES, mantles: MANTLES, skins: SKINS, mantleChance: 0.65, hoodChance: 0.35 };

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

// Maps local (lx, lz) around an anchor rotated by `rot` to world (x, z), matching three.js rotation.y.
export function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export function lowest(ctx, x, z, w, d, rot = 0) {
  const at = frame(x, z, rot);
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) h = Math.min(h, ctx.heightAt(...at(lx, lz)));
  return h;
}

export function box(ctx, { x, z, y, w, h, d, rot = 0, color, jitter = 0.05, collide = true, batch = ctx.solid, tilt = [0, 0] }) {
  batch.box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Flat-roofed stone house with parapet, dark doorway and small windows, door on local +z.
export function house(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3.4, color = '#d3c09a', trim = '#a8916c', door = true, stair = false, awning = null }) {
  const r = ctx.rand;
  const at = frame(x, z, rot);
  const y = lowest(ctx, x, z, w, d, rot) - 0.3;
  const H = h + 0.3;
  box(ctx, { x, z, y, w, h: H, d, rot, color });
  box(ctx, { x, z, y: y + H, w: w + 0.2, h: 0.18, d: d + 0.2, rot, color: trim, collide: false });
  for (const [lx, lz, ww, dd] of [[0, d / 2, w, 0.25], [0, -d / 2, w, 0.25], [w / 2, 0, 0.25, d], [-w / 2, 0, 0.25, d]]) {
    const [px, pz] = at(lx, lz);
    box(ctx, { x: px, z: pz, y: y + H + 0.18, w: ww, h: 0.5, d: dd, rot, color, collide: false });
  }
  const dark = '#2e241c';
  if (door) {
    const [dx, dz] = at(r.range(-w / 4, w / 4), d / 2 + 0.03);
    box(ctx, { x: dx, z: dz, y: y + 0.3, w: 1.1, h: 2.0, d: 0.1, rot, color: dark, collide: false, jitter: 0.02 });
  }
  for (const side of [-1, 1]) {
    if (r() < 0.4) continue;
    const [wx, wz] = at(side * w * 0.3, d / 2 + 0.03);
    box(ctx, { x: wx, z: wz, y: y + H - 1.2, w: 0.5, h: 0.6, d: 0.1, rot, color: dark, collide: false, jitter: 0.02 });
  }
  for (let i = 0; i < Math.floor(w / 1.4); i++) {
    const [bx, bz] = at(-w / 2 + 0.7 + i * 1.4, d / 2 + 0.15);
    ctx.solid.box(0.16, 0.16, 0.35, { position: [bx, y + H - 0.35, bz], rotation: [0, rot, 0], color: '#5a4332' });
  }
  if (stair) {
    const steps = Math.ceil(H / 0.35);
    for (let i = 0; i < steps; i++) {
      const [sx, sz] = at(w / 2 + 0.6, d / 2 - 0.5 - i * 0.4);
      box(ctx, { x: sx, z: sz, y, w: 1.1, h: (i + 1) * (H / steps), d: 0.42, rot, color });
    }
  }
  if (awning) {
    const [ax, az] = at(0, d / 2 + 0.9);
    ctx.solid.box(w * 0.6, 0.06, 1.8, { position: [ax, y + 2.6, az], rotation: [-0.25, rot, 0], color: awning, jitter: 0.03 });
    for (const side of [-1, 1]) {
      const [px, pz] = at(side * w * 0.28, d / 2 + 1.7);
      box(ctx, { x: px, z: pz, y, w: 0.1, h: 2.4, d: 0.1, rot, color: '#5a4332', collide: false });
    }
  }
  return { top: y + H };
}

export function oliveTree(ctx, { x, z, s = 1, leaf = '#7f8c5e' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.1;
  const trunks = 2 + Math.floor(r() * 2);
  for (let i = 0; i < trunks; i++) {
    const lean = [r.range(-0.35, 0.35), 0, r.range(-0.35, 0.35)];
    ctx.solid.add(new THREE.CylinderGeometry(0.12 * s, 0.32 * s, 2.4 * s, 5), {
      position: [x + lean[2] * -0.8 * s, y + 1.1 * s, z + lean[0] * 0.8 * s],
      rotation: lean,
      color: '#5f5244',
      jitter: 0.08,
    });
  }
  ctx.solid.add(new THREE.CylinderGeometry(0.45 * s, 0.6 * s, 0.6 * s, 6), { position: [x, y + 0.3 * s, z], color: '#54483b', jitter: 0.06 });
  for (let i = 0; i < 5; i++) {
    const rad = s * r.range(1.1, 1.7);
    ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
      position: [x + r.range(-1.3, 1.3) * s, y + s * r.range(2.4, 3.3), z + r.range(-1.3, 1.3) * s],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, r.range(0.45, 0.65), 1],
      color: r() < 0.5 ? leaf : '#94a07a',
      jitter: 0.1,
    });
  }
  ctx.colliders.add({ x, z, w: 0.9 * s, d: 0.9 * s, bottom: y, top: y + 2.4 * s });
}

export function palm(ctx, { x, z, h }) {
  ctx.builders.tree(ctx, { x, z, h: h ?? ctx.rand.range(6, 9), kind: 'palm', leaf: ctx.rand.pick(['#5f7a3a', '#6b8340', '#55702f']) });
}

// A single person built from the crowd parts. pose: stand, sit, kneel, slump, lie.
export function person(ctx, { x, z, y, face = [x, z + 1], pose = 'stand', head, scale = 1, robe, mantle, skin, hood, arms = 'down', emissive = 0, add = true }) {
  const r = ctx.rand;
  const base = y ?? ctx.heightAt(x, z);
  const drop = { stand: 0, sit: 0.62, kneel: 0.48, slump: 0.66, lie: -0.24 }[pose] * scale;
  const g = createFigure({
    x, y: base - drop, z, face, scale, arms, emissive,
    robe: robe ?? r.pick(ROBES),
    mantle: mantle === undefined ? r.pick(MANTLES) : mantle ?? undefined,
    skin: skin ?? r.pick(SKINS),
    hood: hood ?? r() < 0.4,
  });
  if (pose === 'slump') g.rotation.set(0.38, g.rotation.y, 0, 'YXZ');
  if (pose === 'lie') {
    const [hx, hz] = head ? [head[0] - x, head[1] - z] : [0, -1];
    g.rotation.set(-Math.PI / 2, Math.atan2(-hx, -hz), r.range(-0.4, 0.4), 'YXZ');
  }
  g.traverse((o) => (o.receiveShadow = true));
  if (add) ctx.scene.add(g);
  return g;
}

// Christ figure in white with a soft light; faceless and simple.
export function christ(ctx, { x, z, y, face, arms = 'down', light = 30, halo = 4, glow = 0.35, scale = 1.05, pose = 'stand' }) {
  const base = y ?? ctx.heightAt(x, z);
  const g = person(ctx, { x, z, y: base, face, pose, arms, scale, robe: '#fbf7ee', mantle: '#efe6d2', skin: '#a8754f', hood: false, emissive: glow });
  if (light) {
    const l = new THREE.PointLight('#fff0cf', light, 16, 1.6);
    l.position.set(x, base + 2.2, z);
    ctx.scene.add(l);
  }
  if (halo) ctx.effects.halo({ position: [x, base + 1.35 * scale - ({ sit: 0.62, kneel: 0.48 }[pose] ?? 0), z], size: halo, opacity: 0.5, color: '#fff3d6' });
  ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: base, top: base + 1.8 });
  return g;
}

// Crenellated city wall between two points, with square towers along it.
export function cityWall(ctx, { from, to, h = 9, thick = 3, color = '#c9b186', towerEvery = 40, gate = null }) {
  const [x0, z0] = from, [x1, z1] = to;
  const len = Math.hypot(x1 - x0, z1 - z0);
  const rot = Math.atan2(x1 - x0, z1 - z0);
  const n = Math.ceil(len / 6);
  const seg = len / n;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    if (gate && Math.hypot(x - gate[0], z - gate[1]) < 5) continue;
    const y = lowest(ctx, x, z, thick, seg, rot) - 0.5;
    box(ctx, { x, z, y, w: thick, h: h + 0.5, d: seg + 0.05, rot, color });
    for (let k = 0; k < 3; k++) {
      const off = -seg / 2 + (k + 0.5) * (seg / 3);
      const mx = x + Math.sin(rot) * off, mz = z + Math.cos(rot) * off;
      box(ctx, { x: mx, z: mz, y: y + h + 0.5, w: thick, h: 0.8, d: seg / 6, rot, color, collide: false });
    }
  }
  const towers = Math.floor(len / towerEvery);
  for (let i = 0; i <= towers; i++) {
    const t = towers ? i / towers : 0;
    const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    if (gate && Math.hypot(x - gate[0], z - gate[1]) < 9) continue;
    const y = lowest(ctx, x, z, thick * 2, thick * 2, rot) - 0.5;
    box(ctx, { x, z, y, w: thick * 2.2, h: h + 3.5, d: thick * 2.2, rot, color });
    box(ctx, { x, z, y: y + h + 3.5, w: thick * 2.5, h: 0.5, d: thick * 2.5, rot, color: '#a8916c', collide: false });
  }
  if (gate) {
    const [gx, gz] = gate;
    const at = frame(gx, gz, rot);
    const y = ctx.heightAt(gx, gz) - 0.5;
    for (const side of [-1, 1]) {
      const [tx, tz] = at(0, side * 6);
      box(ctx, { x: tx, z: tz, y, w: thick * 2.6, h: h + 5, d: 6, rot, color });
      box(ctx, { x: tx, z: tz, y: y + h + 5, w: thick * 2.9, h: 0.6, d: 6.4, rot, color: '#a8916c', collide: false });
    }
    box(ctx, { x: gx, z: gz, y: y + 6.5, w: thick * 1.4, h: h - 6, d: 6.2, rot, color, collide: false });
    box(ctx, { x: gx, z: gz, y: y + 0.5, w: thick * 0.6, h: 6, d: 4.2, rot, color: '#2a2018', collide: false, jitter: 0.02 });
  }
}

// Fixed star field that follows the camera.
export function stars(ctx, { count = 1400, seed = 7, size = 1.6, color = '#dfe6ff' } = {}) {
  const r = ctx.rand;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, y = Math.pow(r(), 0.7) * 0.95 + 0.04;
    const rr = Math.sqrt(1 - y * y);
    pos.set([Math.cos(a) * rr * 1200, y * 1200, Math.sin(a) * rr * 1200], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
  pts.renderOrder = -8;
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
}

// Moon disc with a glow, placed far away along `dir`.
export function moon(ctx, { dir, size = 40, color = '#f4f1e2' }) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1100);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 20), new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false }));
  disc.renderOrder = -7;
  const glow = ctx.effects.halo({ position: [0, 0, 0], size: size * 7, opacity: 0.35, color: '#c8d4ff' });
  ctx.scene.remove(glow);
  const g = new THREE.Group();
  g.add(disc, glow);
  glow.position.copy(d);
  disc.position.copy(d);
  ctx.scene.add(g);
  ctx.onFrame((t, dt, camera) => {
    g.position.copy(camera.position);
    disc.lookAt(camera.position);
  });
}

// Small clay oil lamp with a flame; `light` adds a flickering point light.
export function lamp(ctx, { x, y, z, light = 0, color = '#ffb35a' }) {
  ctx.solid.add(new THREE.SphereGeometry(0.09, 6, 3), { position: [x, y + 0.04, z], scale: [1.4, 0.6, 1], color: '#8a5a3a' });
  ctx.glow.add(new THREE.OctahedronGeometry(0.045, 0), { position: [x + 0.1, y + 0.13, z], scale: [1, 1.8, 1], color: '#ffd38a' });
  if (light) {
    const l = new THREE.PointLight(color, light, 9, 1.5);
    l.position.set(x + 0.1, y + 0.4, z);
    ctx.scene.add(l);
    const seed = Math.random() * 10;
    ctx.onFrame((t) => (l.intensity = light * (0.85 + 0.1 * Math.sin(t * 9 + seed) + 0.05 * Math.sin(t * 23 + seed))));
  }
}

// Soft billboard glow sprites, e.g. lit windows or torches.
export function glowAt(ctx, position, size, color, opacity = 0.6) {
  return ctx.effects.halo({ position, size, color, opacity });
}
