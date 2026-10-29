import * as THREE from 'three';
import { frame } from './batch.js';
import { noise2, pick, range } from './noise.js';

function groundUnder(ctx, x, z, half) {
  let h = Infinity;
  for (const [dx, dz] of [[0, 0], [half, half], [-half, half], [half, -half], [-half, -half]]) {
    h = Math.min(h, ctx.heightAt(x + dx, z + dz));
  }
  return h - 0.3;
}

function fallenBlocks(ctx, f, count, spreadX, spreadZ, size, colors) {
  const { batch, rand } = ctx;
  for (let i = 0; i < count; i++) {
    const [x, z] = f.toWorld(range(rand, spreadX), range(rand, spreadZ));
    const s = range(rand, size);
    batch.box(x, ctx.heightAt(x, z) + s * 0.25, z, s * range(rand, [0.8, 1.6]), s * range(rand, [0.5, 0.9]), s, pick(rand, colors),
      rand() * 6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6);
  }
}

// Stepped temple platform with a front stair and a shrine on top.
export function pyramid(ctx, s) {
  const { batch, rand } = ctx;
  const [px, pz] = s.pos;
  const H = s.tiers * s.tierHeight;
  const gy = groundUnder(ctx, px, pz, s.base / 2);
  const f = frame(px, gy, pz, s.rotY ?? 0);
  const topW = s.base - 2 * s.inset * (s.tiers - 1);
  for (let i = 0; i < s.tiers; i++) {
    const w = s.base - 2 * s.inset * i;
    f.box(batch, 0, i * s.tierHeight + s.tierHeight / 2, 0, w, s.tierHeight, w, s.color);
    f.box(batch, 0, (i + 1) * s.tierHeight - 0.25, 0, w + 0.5, 0.5, w + 0.5, s.trim);
  }
  const zTop = topW / 2;
  const zBottom = s.base / 2 + s.stairs.extend;
  const steps = Math.round(H / 0.45);
  const run = zBottom - zTop;
  for (let k = 0; k < steps; k++) {
    const top = ((k + 1) / steps) * H;
    const front = zBottom - (k / steps) * run;
    const back = zTop - 1;
    f.box(batch, 0, top / 2, (front + back) / 2, s.stairs.width, top, front - back, k % 2 ? s.color : s.trim);
  }
  const slope = Math.atan2(H, run);
  const len = Math.hypot(H, run);
  for (const side of [-1, 1]) {
    f.box(batch, side * (s.stairs.width / 2 + 0.7), H / 2 + 0.4, (zTop + zBottom) / 2, 1.4, 1.2, len, s.trim, 0, slope);
  }
  const sh = s.shrine;
  f.box(batch, 0, H + sh.height / 2, -1, sh.width, sh.height, sh.depth, sh.color);
  f.box(batch, 0, H + sh.height + 0.4, -1, sh.width + 1.2, 0.8, sh.depth + 1.2, s.trim);
  f.box(batch, 0, H + sh.height + 2.2, -1.5, sh.width * 0.7, 3, 0.8, sh.color);
  f.box(batch, 0, H + sh.height * 0.4, -1 + sh.depth / 2 + 0.05, sh.width * 0.28, sh.height * 0.8, 0.2, sh.door);
  for (const side of [-1, 1]) {
    f.box(batch, side * sh.width * 0.32, H + sh.height * 0.45, -1 + sh.depth / 2 + 0.3, 1, sh.height * 0.9, 0.6, s.trim);
  }
  if (s.damage) {
    fallenBlocks(ctx, f, s.damage.blocks, [-s.base * 0.6, s.base * 0.6], [-s.base * 0.6, s.base * 0.6 + 6], [0.8, 2.4], [s.color, s.trim]);
    for (let i = 0; i < s.damage.chunks; i++) {
      const tier = Math.floor(rand() * s.tiers);
      const w = s.base - 2 * s.inset * tier;
      const sx = rand() < 0.5 ? -1 : 1, sz = rand() < 0.5 ? -1 : 1;
      f.box(batch, sx * (w / 2 - 1), (tier + 1) * s.tierHeight + 0.4, sz * (w / 2 - 1), 2.2, 0.8, 1.6, s.trim, rand(), 0.2, 0.3);
    }
  }
  ctx.colliders.push(f.collider(0, 0, s.base / 2, s.base / 2), f.collider(0, (zTop + zBottom) / 2, s.stairs.width / 2 + 1.4, run / 2));
  if (s.id) {
    const [ax, az] = f.toWorld(0, sh.depth / 2 + 1);
    ctx.anchors[s.id] = new THREE.Vector3(ax, gy + H, az);
  }
}

// Square stepped dais. Registers its top as an anchor so figures can stand on it.
export function platform(ctx, s) {
  const [px, pz] = s.pos;
  const outer = s.size / 2 + s.stepDepth * (s.steps - 1);
  const gy = groundUnder(ctx, px, pz, outer);
  const f = frame(px, gy, pz, s.rotY ?? 0);
  for (let i = 0; i < s.steps; i++) {
    const w = s.size + 2 * s.stepDepth * (s.steps - 1 - i);
    const top = ((i + 1) / s.steps) * s.height + 0.3;
    f.box(ctx.batch, 0, top / 2, 0, w, top, w, i % 2 ? s.trim : s.color);
  }
  ctx.colliders.push(f.collider(0, 0, outer, outer));
  if (s.id) ctx.anchors[s.id] = new THREE.Vector3(px, gy + s.height + 0.3, pz);
}

// Roofless stone building with a broken, collapsing wall line.
export function ruin(ctx, s) {
  const { batch, rand } = ctx;
  const [px, pz] = s.pos;
  const [w, d] = s.size;
  const gy = groundUnder(ctx, px, pz, Math.max(w, d) / 2);
  const f = frame(px, gy, pz, s.rotY ?? 0);
  const t = 0.8, course = 0.7, block = 1.3;
  const sides = [
    { x0: -w / 2, z0: d / 2, dx: 1, dz: 0, len: w, door: true },
    { x0: w / 2, z0: d / 2, dx: 0, dz: -1, len: d },
    { x0: w / 2, z0: -d / 2, dx: -1, dz: 0, len: w },
    { x0: -w / 2, z0: -d / 2, dx: 0, dz: 1, len: d },
  ];
  let perim = 0;
  for (const side of sides) {
    const n = Math.ceil(side.len / block);
    for (let j = 0; j < n; j++) {
      const u = (j + 0.5) / n;
      if (side.door && Math.abs(u - 0.5) < 0.12) continue;
      const decay = noise2((perim + j * block) * 0.12, 0, s.seed ?? 1);
      const hgt = s.height * Math.min(1, 1.25 - s.damage * 1.5 * decay - rand() * 0.35 * s.damage);
      const rows = Math.max(0, Math.round(hgt / course));
      const x = side.x0 + side.dx * u * side.len;
      const z = side.z0 + side.dz * u * side.len;
      const rot = side.dx ? 0 : Math.PI / 2;
      for (let r = 0; r < rows; r++) {
        const jit = (rand() - 0.5) * 0.12;
        f.box(batch, x + jit, r * course + course / 2, z + jit, side.len / n + 0.04, course * 0.96, t, pick(rand, s.colors), rot + (rand() - 0.5) * 0.05);
      }
    }
    perim += side.len;
    const cx = side.x0 + side.dx * side.len / 2, cz = side.z0 + side.dz * side.len / 2;
    const [hx, hz] = side.dx ? [side.len / 2, t / 2] : [t / 2, side.len / 2];
    ctx.colliders.push(f.collider(cx, cz, hx + 0.1, hz + 0.1));
  }
  fallenBlocks(ctx, f, Math.round(s.damage * 40), [-w * 0.9, w * 0.9], [-d * 0.9, d * 0.9], [0.5, 1.4], s.colors);
}

// A wall that has toppled over and broken into a line of blocks on the ground.
export function fallenWall(ctx, s) {
  const { batch, rand } = ctx;
  const [ax, az] = s.from, [bx, bz] = s.to;
  const len = Math.hypot(bx - ax, bz - az);
  const yaw = Math.atan2(bx - ax, bz - az);
  const n = Math.ceil(len / 1.4);
  for (let i = 0; i < n; i++) {
    const u = i / n + (rand() - 0.5) * 0.03;
    const off = (rand() - 0.5) * 1.6;
    const x = ax + (bx - ax) * u + Math.cos(yaw) * off;
    const z = az + (bz - az) * u - Math.sin(yaw) * off;
    const h = range(rand, [0.5, 1.0]) * s.height * 0.5;
    batch.box(x, ctx.heightAt(x, z) + h * 0.35, z, 1.2, h, range(rand, [1.0, 1.6]), pick(rand, s.colors),
      yaw + (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5);
  }
  for (let i = 0; i < 3; i++) {
    const u = rand();
    const x = ax + (bx - ax) * u, z = az + (bz - az) * u;
    const h = range(rand, [0.6, 1]) * s.height;
    batch.box(x, ctx.heightAt(x, z) + h / 2 - 0.2, z, 1.3, h, 0.8, pick(rand, s.colors), yaw + Math.PI / 2 + (rand() - 0.5) * 0.2, (rand() - 0.5) * 0.15);
  }
}

// Broad-canopied trees, some snapped and charred by the destruction.
export function trees(ctx, s) {
  const { batch, rand } = ctx;
  const trunk = new THREE.CylinderGeometry(0.22, 0.38, 1, 6);
  const leaf = new THREE.IcosahedronGeometry(1, 1);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let placed = 0, guard = 0;
  while (placed < s.count && guard++ < s.count * 20) {
    const a = rand() * Math.PI * 2;
    const r = range(rand, s.ring);
    const x = s.center[0] + Math.cos(a) * r, z = s.center[1] + Math.sin(a) * r;
    if ((s.exclude ?? []).some((ex) => Math.hypot(x - ex.pos[0], z - ex.pos[1]) < ex.radius)) continue;
    placed++;
    const y = ctx.heightAt(x, z) - 0.2;
    const h = range(rand, s.height);
    const broken = rand() < s.brokenRatio;
    if (broken) {
      const bh = h * range(rand, [0.25, 0.55]);
      q.setFromEuler(e.set((rand() - 0.5) * 0.5, 0, (rand() - 0.5) * 0.5));
      m.compose(new THREE.Vector3(x, y + bh / 2, z), q, new THREE.Vector3(1.1, bh, 1.1));
      batch.add(trunk, m, s.charred);
      if (rand() < 0.6) {
        const lh = h * 0.6;
        q.setFromEuler(e.set(Math.PI / 2 - 0.08, rand() * 6, 0, 'YXZ'));
        m.compose(new THREE.Vector3(x + Math.cos(a) * lh * 0.5, y + 0.5, z + Math.sin(a) * lh * 0.5), q, new THREE.Vector3(0.9, lh, 0.9));
        batch.add(trunk, m, s.charred);
      }
      continue;
    }
    q.identity();
    m.compose(new THREE.Vector3(x, y + h * 0.35, z), q, new THREE.Vector3(1, h * 0.7, 1));
    batch.add(trunk, m, s.trunk);
    const color = pick(rand, s.leaves);
    for (let k = 0; k < 4; k++) {
      const sr = h * range(rand, [0.22, 0.32]);
      m.compose(new THREE.Vector3(x + (rand() - 0.5) * h * 0.35, y + h * range(rand, [0.68, 0.85]), z + (rand() - 0.5) * h * 0.35), q,
        new THREE.Vector3(sr * 1.3, sr * 0.7, sr * 1.3));
      batch.add(leaf, m, color, 0.12);
    }
  }
}

// Instanced loose stones.
export function rubble(ctx, fields) {
  const total = fields.reduce((n, f) => n + f.count, 0);
  const mesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshLambertMaterial(), total);
  const { rand } = ctx;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  let i = 0;
  for (const f of fields) {
    for (let k = 0; k < f.count; k++, i++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * f.radius;
      const x = f.center[0] + Math.cos(a) * r, z = f.center[1] + Math.sin(a) * r;
      const s = range(rand, f.size) * (rand() < 0.1 ? 2.2 : 1);
      q.setFromEuler(e.set(rand() * 6, rand() * 6, rand() * 6));
      m.compose(new THREE.Vector3(x, ctx.heightAt(x, z) + s * 0.25, z), q, new THREE.Vector3(s * range(rand, [0.8, 1.5]), s * 0.6, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(pick(rand, f.colors)).multiplyScalar(range(rand, [0.85, 1.1])));
    }
  }
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  return mesh;
}

// Jagged fissures in the ground, drawn as dark ribbons that hug the terrain.
export function cracks(ctx, list) {
  const { rand } = ctx;
  const pos = [], col = [];
  const dark = new THREE.Color(), edge = new THREE.Color();
  const ribbon = (pts, width, color, lift) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az) || 1;
      const nx = -(bz - az) / len, nz = (bx - ax) / len;
      const taper = (k) => width * Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, k / (pts.length - 1)))) * (0.6 + rand() * 0.6);
      const wa = taper(i), wb = taper(i + 1);
      const quad = [
        [ax + nx * wa, az + nz * wa], [ax - nx * wa, az - nz * wa], [bx + nx * wb, bz + nz * wb],
        [bx + nx * wb, bz + nz * wb], [ax - nx * wa, az - nz * wa], [bx - nx * wb, bz - nz * wb],
      ];
      for (const [x, z] of quad) {
        pos.push(x, ctx.heightAt(x, z) + lift, z);
        col.push(color.r, color.g, color.b);
      }
    }
  };
  const jag = (a, b, depth, rough) => {
    if (depth === 0) return [a, b];
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len, nz = (b[0] - a[0]) / len;
    const o = (rand() - 0.5) * len * rough;
    const m = [mx + nx * o, mz + nz * o];
    return [...jag(a, m, depth - 1, rough).slice(0, -1), ...jag(m, b, depth - 1, rough)];
  };
  for (const c of list) {
    dark.set(c.color);
    edge.set(c.edge);
    const pts = jag(c.from, c.to, 6, 0.55);
    ribbon(pts, c.width * 2.4, edge, 0.05);
    ribbon(pts, c.width, dark, 0.09);
    for (let b = 0; b < (c.branches ?? 0); b++) {
      const start = pts[Math.floor(rand() * (pts.length - 2)) + 1];
      const a = rand() * Math.PI * 2, l = range(rand, [4, 10]);
      const bp = jag(start, [start[0] + Math.cos(a) * l, start[1] + Math.sin(a) * l], 4, 0.6);
      ribbon(bp, c.width * 1.2, edge, 0.06);
      ribbon(bp, c.width * 0.5, dark, 0.1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  mesh.receiveShadow = true;
  return mesh;
}

export const builders = { pyramid, platform, ruin, fallenWall, trees };
