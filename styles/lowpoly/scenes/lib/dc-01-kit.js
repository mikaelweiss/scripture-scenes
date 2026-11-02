import * as THREE from 'three';
import { placeCrowd, createCrowd } from '../../engine/crowd.js';
import { rng, jitterColor } from '../../engine/util.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export const period = {
  men: {
    robes: ['#2a2a2e', '#3a332d', '#2d3340', '#463b31', '#22252b', '#4d4438', '#33302c'],
    mantles: ['#1f1f22', '#2e2924', '#272c36', '#3b3128'],
    skins: ['#e0b48f', '#d4a17c', '#c99474', '#e6bf9b', '#d9ad88'],
    mantleChance: 0.7,
    hoodChance: 0,
  },
  women: {
    robes: ['#5a4a5e', '#6b5a48', '#4c5a6a', '#7a6a58', '#3d4a3e', '#8a7a6a', '#5e3c38', '#6a6f7a', '#4a3a30'],
    mantles: ['#d8cfbf', '#a89c88', '#4a4038', '#6e6458', '#c4b8a4', '#7a5a4a'],
    skins: ['#e0b48f', '#d4a17c', '#e6bf9b', '#d9ad88'],
    mantleChance: 0.75,
    hoodChance: 0.85,
  },
};

export function box(ctx, { x, y = 0, z, w, h, d, rot = 0, color, jitter = 0.04, collide = true, glow = false }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter, shade: glow ? undefined : darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function hatGeometry() {
  const crown = new THREE.CylinderGeometry(0.1, 0.11, 0.17, 7).translate(0, 1.76, -0.01);
  const brim = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 9).translate(0, 1.67, -0.01);
  const g = new THREE.BufferGeometry();
  const a = crown.toNonIndexed(), b = brim.toNonIndexed();
  const pos = new Float32Array([...a.attributes.position.array, ...b.attributes.position.array]);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.length).fill(1), 3));
  g.computeVertexNormals();
  return g;
}

function sway(material, time) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.61;
        transformed.x += sin(uTime * 0.9 + ph) * 0.03 * position.y;
        transformed.z += cos(uTime * 0.7 + ph * 1.3) * 0.02 * position.y;`,
      );
  };
}

// Places groups with the engine crowd and adds hats to men. Each group: { ...placeCrowd group, palette, hats, lift, seated }.
export function crowd(ctx, groups) {
  const all = [];
  const hatted = [];
  for (const g of groups) {
    const people = placeCrowd([g], ctx.heightAt, (x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 }));
    const r = rng((g.seed ?? 1) + 77);
    for (const p of people) {
      if (g.y !== undefined) p.y = g.y;
      p.y += (g.lift ?? 0) - (g.seated ? 0.42 * p.scale : 0);
      if (g.hats && p.scale > 0.85 && r() < g.hats) hatted.push(p);
    }
    all.push(...people);
  }
  const time = { value: 0 };
  ctx.scene.add(createCrowd(all, time));
  if (hatted.length) {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    sway(mat, time);
    const mesh = new THREE.InstancedMesh(hatGeometry(), mat, hatted.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    const hr = rng(5);
    hatted.forEach((p, i) => {
      q.setFromAxisAngle(up, p.yaw);
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3().setScalar(p.scale));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, jitterColor(hr.pick(['#1c1b1d', '#2a2622', '#3a3128', '#20232a']), hr, 0.05));
    });
    mesh.castShadow = true;
    ctx.scene.add(mesh);
  }
  ctx.onFrame((t) => (time.value = t));
  return all;
}

// Grid points filling a rectangle, with jitter, for seated rows.
export function rows(rand, { x0, x1, z0, z1, dx = 0.62, dz = 1.0, jitter = 0.06, skip = () => false }) {
  const pts = [];
  for (let z = z0; z <= z1 + 1e-6; z += dz)
    for (let x = x0; x <= x1 + 1e-6; x += dx) {
      if (skip(x, z)) continue;
      pts.push([x + rand.range(-jitter, jitter), z + rand.range(-jitter, jitter)]);
    }
  return pts;
}

export function pine(ctx, x, z, h = 10, color = '#2f4a32') {
  const y = ctx.heightAt(x, z) - 0.2;
  ctx.solid.add(new THREE.CylinderGeometry(0.15, 0.32, h * 0.4, 5), { position: [x, y + h * 0.2, z], color: '#4a3628' });
  for (let i = 0; i < 4; i++) {
    const r = h * (0.3 - i * 0.06), ch = h * 0.34;
    ctx.solid.add(new THREE.ConeGeometry(r, ch, 7), { position: [x, y + h * 0.3 + i * h * 0.17 + ch / 2, z], rotation: [0, ctx.rand() * 3, 0], color, jitter: 0.08 });
  }
  ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: y, top: y + h });
}

export function leafy(ctx, x, z, h = 9, color = '#5f7f3a') {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.2;
  ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.4, h, 6), { position: [x, y + h / 2, z], rotation: [r.range(-0.06, 0.06), 0, r.range(-0.06, 0.06)], color: '#5a4332' });
  ctx.colliders.add({ x, z, w: 0.8, d: 0.8, bottom: y, top: y + h });
  for (let i = 0; i < 4; i++) {
    const rad = h * r.range(0.22, 0.32);
    ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
      position: [x + r.range(-1, 1) * rad * 0.7, y + h * r.range(0.8, 1.05), z + r.range(-1, 1) * rad * 0.7],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, r.range(0.7, 0.9), 1],
      color,
      jitter: 0.1,
    });
  }
}

export function bush(ctx, x, z, s = 1, color = '#4f6b34') {
  ctx.solid.add(new THREE.IcosahedronGeometry(s, 0), { position: [x, ctx.heightAt(x, z) + s * 0.4, z], rotation: [ctx.rand() * 3, ctx.rand() * 3, 0], scale: [1.2, 0.75, 1], color, jitter: 0.1 });
}

// Scatter trees in a ring, skipping clearings.
export function forest(ctx, { center = [0, 0], ring = [20, 200], count = 200, seed = 4, avoid = [], kinds = ['pine', 'leafy'], leaf = ['#5f7f3a', '#4d6e34', '#6f8a40'], pineColor = ['#2f4a32', '#36543a', '#294030'], spacing = 3.5 }) {
  const r = rng(seed);
  const placed = [];
  for (let tries = 0; placed.length < count && tries < count * 30; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r.range(ring[0] ** 2, ring[1] ** 2));
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid.some((v) => (v.r ? Math.hypot(x - v.x, z - v.z) < v.r : Math.abs(x - v.rect[0]) < v.rect[2] / 2 && Math.abs(z - v.rect[1]) < v.rect[3] / 2))) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < spacing)) continue;
    placed.push([x, z]);
    const kind = r.pick(kinds);
    if (kind === 'pine') pine(ctx, x, z, r.range(8, 15), r.pick(pineColor));
    else if (kind === 'bush') bush(ctx, x, z, r.range(0.6, 1.3));
    else leafy(ctx, x, z, r.range(6, 11), r.pick(leaf));
  }
}

// Gable-roofed log cabin. Door faces local +z. Interior is open for walking when `open` is set.
export function logCabin(ctx, { x, z, rot = 0, w = 8, d = 6, h = 2.6, log = '#6b5038', roof = '#4f4236', door = true }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const y = Math.min(ctx.heightAt(x, z), ...[[-w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2], [w / 2, -d / 2]].map(([a, b]) => ctx.heightAt(...at(a, b)))) - 0.1;
  const n = Math.round(h / 0.3);
  for (let i = 0; i < n; i++) {
    const ly = y + 0.15 + i * 0.3;
    for (const [lx, lz, len, along] of [[0, -d / 2, w + 0.5, 'x'], [0, d / 2, w + 0.5, 'x'], [-w / 2, 0, d + 0.5, 'z'], [w / 2, 0, d + 0.5, 'z']]) {
      if (door && lz === d / 2 && along === 'x' && i < 7) {
        for (const side of [-1, 1]) {
          const seg = (w + 0.5) / 2 - 0.6;
          const [px, pz] = at(side * (0.6 + seg / 2), lz);
          ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, seg, 6), { position: [px, ly, pz], rotation: [0, rot, Math.PI / 2], color: log, jitter: 0.06 });
        }
        continue;
      }
      const [px, pz] = at(lx, lz);
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, len, 6), {
        position: [px, ly, pz],
        rotation: along === 'x' ? [0, rot, Math.PI / 2] : [Math.PI / 2, rot, 0],
        color: log,
        jitter: 0.06,
      });
    }
  }
  if (door) {
    const [px, pz] = at(0, d / 2 + 0.02);
    ctx.solid.box(1.1, 2, 0.08, { position: [px, y + 1, pz], rotation: [0, rot, 0], color: '#3a2a1e' });
  }
  const top = y + n * 0.3;
  const pitch = 0.6;
  const half = w / 2 + 0.6;
  const slope = Math.hypot(half, half * Math.tan(pitch) * 0.9);
  for (const side of [-1, 1]) {
    const [px, pz] = at(side * half / 2, 0);
    ctx.solid.box(slope, 0.18, d + 1, { position: [px, top + half * Math.tan(pitch) * 0.45, pz], rotation: [0, rot, -side * Math.atan2(half * Math.tan(pitch) * 0.9, half)], color: roof, shade: darkenBottom });
  }
  for (const side of [-1, 1]) {
    const tri = new THREE.BufferGeometry();
    const lz = side * d / 2;
    const pts = [[-w / 2, 0, lz], [w / 2, 0, lz], [0, half * Math.tan(pitch) * 0.85, lz]];
    tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array(side > 0 ? pts.flat() : [pts[0], pts[2], pts[1]].flat()), 3));
    ctx.solid.add(tri, { position: [x, top, z], rotation: [0, rot, 0], color: log });
  }
  const [cx, cz] = at(-w / 2 + 0.2, 0);
  ctx.solid.box(1, top - y + 2.4, 1.2, { position: [cx, y + (top - y + 2.4) / 2, cz], rotation: [0, rot, 0], color: '#8a7a6a' });
  ctx.colliders.add({ x, z, w: w + 0.4, d: d + 0.4, rot, bottom: y, top: top + 3 });
}

// Two-story clapboard frame house with glowing or dark windows. Front faces local +z.
export function frameHouse(ctx, { x, z, rot = 0, w = 9, d = 7, h = 5.5, color = '#d8d0c0', roof = '#4a4440', trim = '#f0ece2', lit = false }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const y = ctx.heightAt(x, z) - 0.3;
  box(ctx, { x, y, z, w, h, d, rot, color });
  const rh = 2.4;
  const geo = new THREE.BufferGeometry();
  const W = w / 2 + 0.4, D = d / 2 + 0.4;
  const v = [
    [-W, 0, -D], [W, 0, -D], [0, rh, -D], [W, 0, D], [-W, 0, D], [0, rh, D],
  ];
  const faces = [
    [1, 2, 5], [1, 5, 3], [4, 5, 2], [4, 2, 0],
  ];
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(faces.flat().flatMap((i) => v[i])), 3));
  ctx.solid.add(geo, { position: [x, y + h, z], rotation: [0, rot, 0], color: roof });
  const gable = new THREE.BufferGeometry();
  gable.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-w / 2, 0, 0, w / 2, 0, 0, 0, rh - 0.2, 0]), 3));
  for (const side of [-1, 1]) {
    const [px, pz] = at(0, side * d / 2);
    ctx.solid.add(gable, { position: [px, y + h, pz], rotation: [0, rot + (side > 0 ? 0 : Math.PI), 0], color });
  }
  for (const floor of [0, 1]) {
    for (const lx of [-w / 3, 0, w / 3]) {
      for (const side of [-1, 1]) {
        if (floor === 0 && lx === 0 && side > 0) {
          const [px, pz] = at(0, d / 2 + 0.03);
          ctx.solid.box(1, 2.1, 0.08, { position: [px, y + 0.3 + 1.05, pz], rotation: [0, rot, 0], color: '#3c3530' });
          continue;
        }
        const [px, pz] = at(lx, side * (d / 2 + 0.03));
        const wy = y + 0.3 + 1.5 + floor * 2.5;
        ctx.solid.box(1.0, 1.5, 0.06, { position: [px, wy, pz], rotation: [0, rot, 0], color: trim });
        (lit ? ctx.glow : ctx.solid).box(0.8, 1.3, 0.08, { position: [px, wy, pz], rotation: [0, rot, 0], color: lit ? '#ffcf7a' : '#3b4450' });
      }
    }
  }
  const [chx, chz] = at(w / 2 - 0.6, 0);
  ctx.solid.box(0.6, 1.8, 0.6, { position: [chx, y + h + 1.6, chz], rotation: [0, rot, 0], color: '#8a5a44' });
}

export function rail(ctx, pts, { color = '#7a6450', h = 1.1 } = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 3));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const y = ctx.heightAt((x0 + x1) / 2, (z0 + z1) / 2);
      ctx.solid.box(0.14, h, 0.14, { position: [x0, ctx.heightAt(x0, z0) + h / 2, z0], color, jitter: 0.08 });
      for (const ry of [0.4, 0.8]) {
        ctx.solid.box(0.08, 0.1, len / n + 0.2, { position: [(x0 + x1) / 2, y + ry * h, (z0 + z1) / 2], rotation: [0, ang + (ctx.rand() - 0.5) * 0.1, 0], color, jitter: 0.08 });
      }
    }
  }
}

// Additive soft sprite, for glows that should not cast or receive light.
let glowTex;
export function softGlow(ctx, { position, size = 4, color = '#fff2d0', opacity = 0.5 }) {
  if (!glowTex) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(cv);
    glowTex.colorSpace = THREE.SRGBColorSpace;
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, opacity, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sp.position.set(...position);
  sp.scale.set(size, size, 1);
  ctx.scene.add(sp);
  return sp;
}

export function light(ctx, { position, color = '#ffd9a0', intensity = 4, distance = 10, decay = 1.5 }) {
  const l = new THREE.PointLight(color, intensity, distance, decay);
  l.position.set(...position);
  ctx.scene.add(l);
  return l;
}

// Candle with a flickering flame. Returns the flame mesh.
export function candle(ctx, { x, y, z, h = 0.2 }) {
  ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.03, h, 6), { position: [x, y + h / 2, z], color: '#efe6cf', jitter: 0 });
  ctx.glow.add(new THREE.OctahedronGeometry(0.03, 0), { position: [x, y + h + 0.04, z], scale: [1, 1.8, 1], color: '#ffc861', jitter: 0 });
}

// Fireplace with a glowing fire, set into a wall. Opening faces local +z.
export function fireplace(ctx, { x, z, rot = 0, y = 0, color = '#8a6a58', tall = 3 }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const side of [-1, 1]) {
    const [px, pz] = at(side * 0.75, 0);
    box(ctx, { x: px, z: pz, y, w: 0.4, h: 1.2, d: 0.8, rot, color });
  }
  box(ctx, { x, z, y: y + 1.2, w: 1.9, h: tall - 1.2, d: 0.8, rot, color, collide: false });
  box(ctx, { x, z, y: y + 1.15, w: 2.1, h: 0.12, d: 0.95, rot, color: '#4a3424', collide: false });
  const [bx, bz] = at(0, -0.25);
  box(ctx, { x: bx, z: bz, y, w: 1.2, h: 1.2, d: 0.3, rot, color: '#2a201a', collide: false });
  const [fx, fz] = at(0, 0.05);
  for (let i = 0; i < 6; i++) {
    ctx.glow.add(new THREE.OctahedronGeometry(0.12 + ctx.rand() * 0.1, 0), {
      position: [fx + (ctx.rand() - 0.5) * 0.7, y + 0.12 + ctx.rand() * 0.25, fz + (ctx.rand() - 0.5) * 0.3],
      scale: [1, 1.6, 1],
      color: ctx.rand.pick(['#ff8a2a', '#ffb347', '#ff6a1a']),
    });
  }
  for (let i = 0; i < 3; i++) ctx.solid.box(0.9, 0.12, 0.12, { position: [fx, y + 0.08, fz], rotation: [0, rot + i * 0.5 - 0.5, 0], color: '#3a2618' });
  const [lx, lz] = at(0, 0.9);
  const fire = light(ctx, { position: [lx, y + 0.6, lz], color: '#ff9a4a', intensity: 5, distance: 9 });
  ctx.onFrame((t) => (fire.intensity = 5 + Math.sin(t * 9) * 0.6 + Math.sin(t * 23) * 0.4));
}

// Room of stacked logs centered at (x, z), floor at y. Openings: { wall: 'n'|'s'|'e'|'w', at, width, bottom, top, pane }.
export function logRoom(ctx, { x = 0, z = 0, y = 0, w, d, h, log = '#7a5a3e', chink = '#b8a88a', openings = [] }) {
  const n = Math.ceil(h / 0.3);
  const walls = {
    n: { cx: x, cz: z - d / 2, len: w + 0.4, axis: 'x' },
    s: { cx: x, cz: z + d / 2, len: w + 0.4, axis: 'x' },
    w: { cx: x - w / 2, cz: z, len: d + 0.4, axis: 'z' },
    e: { cx: x + w / 2, cz: z, len: d + 0.4, axis: 'z' },
  };
  for (const [name, wall] of Object.entries(walls)) {
    const holes = openings.filter((o) => o.wall === name);
    const place = (a, b, ly) => {
      const len = b - a, mid = (a + b) / 2;
      if (len < 0.05) return;
      const px = wall.axis === 'x' ? wall.cx + mid : wall.cx, pz = wall.axis === 'x' ? wall.cz : wall.cz + mid;
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, len, 6), {
        position: [px, ly, pz],
        rotation: wall.axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0],
        color: log,
        jitter: 0.07,
      });
      ctx.solid.box(wall.axis === "x" ? len : 0.2, 0.3, wall.axis === "x" ? 0.2 : len, { position: [px, ly, pz], color: chink, jitter: 0.03 });
    };
    for (let i = 0; i < n; i++) {
      const ly = y + 0.15 + i * 0.3;
      let cuts = holes.filter((o) => ly > y + o.bottom - 0.05 && ly < y + o.top + 0.05).map((o) => [o.at - o.width / 2, o.at + o.width / 2]).sort((a, b) => a[0] - b[0]);
      let start = -wall.len / 2;
      for (const [a, b] of cuts) {
        place(start, a, ly);
        start = b;
      }
      place(start, wall.len / 2, ly);
    }
    const thick = 0.34;
    const along = (a, b, h0, h1) => {
      const mid = (a + b) / 2, len = b - a;
      const px = wall.axis === 'x' ? wall.cx + mid : wall.cx, pz = wall.axis === 'x' ? wall.cz : wall.cz + mid;
      ctx.solid.box(wall.axis === 'x' ? len : 0.24, h1 - h0, wall.axis === 'x' ? 0.24 : len, { position: [px, y + (h0 + h1) / 2, pz], color: chink, jitter: 0.03 });
    };
    let start = -wall.len / 2;
    const sorted = [...holes].sort((a, b) => a.at - b.at);
    for (const o of sorted) {
      const a = o.at - o.width / 2, b = o.at + o.width / 2;
      const cx = wall.axis === 'x' ? wall.cx : wall.cx, cz = wall.cz;
      if (wall.axis === 'x') ctx.colliders.add({ x: wall.cx + (start + a) / 2, z: cz, w: a - start, d: thick, bottom: y - 1, top: y + h });
      else ctx.colliders.add({ x: cx, z: wall.cz + (start + a) / 2, w: thick, d: a - start, bottom: y - 1, top: y + h });
      if (o.bottom > 0.2) {
        if (wall.axis === 'x') ctx.colliders.add({ x: wall.cx + o.at, z: cz, w: o.width, d: thick, bottom: y - 1, top: y + h });
        else ctx.colliders.add({ x: cx, z: wall.cz + o.at, w: thick, d: o.width, bottom: y - 1, top: y + h });
      }
      for (const [fa, fb, h0, h1] of [[a - 0.08, a, o.bottom, o.top], [b, b + 0.08, o.bottom, o.top]]) along(fa, fb, h0, h1);
      along(a - 0.08, b + 0.08, o.top, o.top + 0.1);
      if (o.bottom > 0.2) along(a - 0.08, b + 0.08, o.bottom - 0.08, o.bottom);
      if (o.pane) {
        const mid = o.at;
        const px = wall.axis === 'x' ? wall.cx + mid : wall.cx, pz = wall.axis === 'x' ? wall.cz : wall.cz + mid;
        ctx.glow.box(wall.axis === 'x' ? o.width : 0.04, o.top - o.bottom, wall.axis === 'x' ? 0.04 : o.width, { position: [px, y + (o.bottom + o.top) / 2, pz], color: o.pane, jitter: 0.02 });
        const mw = wall.axis === 'x';
        ctx.solid.box(mw ? 0.05 : 0.08, o.top - o.bottom, mw ? 0.08 : 0.05, { position: [px, y + (o.bottom + o.top) / 2, pz], color: '#efe8da', jitter: 0 });
        ctx.solid.box(mw ? o.width : 0.08, 0.05, mw ? 0.08 : o.width, { position: [px, y + (o.bottom + o.top) / 2, pz], color: '#efe8da', jitter: 0 });
      }
      start = b;
    }
    if (wall.axis === 'x') ctx.colliders.add({ x: wall.cx + (start + wall.len / 2) / 2, z: wall.cz, w: wall.len / 2 - start, d: thick, bottom: y - 1, top: y + h });
    else ctx.colliders.add({ x: wall.cx, z: wall.cz + (start + wall.len / 2) / 2, w: thick, d: wall.len / 2 - start, bottom: y - 1, top: y + h });
  }
}

export function bench(ctx, { x, z, y = 0, len = 2, rot = 0, color = '#7a5a3c', h = 0.45 }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  ctx.solid.box(len, 0.07, 0.34, { position: [x, y + h, z], rotation: [0, rot, 0], color, jitter: 0.05 });
  for (const side of [-1, 1]) ctx.solid.box(0.06, h, 0.3, { position: [x + side * (len / 2 - 0.15) * c, y + h / 2, z - side * (len / 2 - 0.15) * s], rotation: [0, rot, 0], color, jitter: 0.05 });
}
