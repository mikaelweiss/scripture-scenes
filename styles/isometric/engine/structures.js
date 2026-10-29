import * as THREE from 'three';
import { pick, shade, rotate } from './util.js';

// Returns a function that adds a box in the structure's local frame (origin x,z, turned by rot).
function placer(batch, ox, oz, rot) {
  const put = (lx, y, lz, sx, sy, sz, c, rx = 0, ry = 0, rz = 0) => {
    const [dx, dz] = rotate(lx, lz, rot);
    batch.add(ox + dx, y, oz + dz, sx, sy, sz, c, rx, rot + ry, rz);
  };
  put.world = (lx, lz) => { const [dx, dz] = rotate(lx, lz, rot); return [ox + dx, oz + dz]; };
  return put;
}

function stairs(put, { from, to, y0, H, width, color, trim, rand, stepHeight = 0.3, rails = true }) {
  const n = Math.max(2, Math.round(H / stepHeight));
  const run = (from - to) / n, back = to - 0.4;
  for (let i = 0; i < n; i++) {
    const top = y0 + ((i + 1) * H) / n, front = from - i * run;
    put(0, (y0 + top) / 2, (front + back) / 2, width, top - y0, front - back, shade(color, rand, 0.05).multiplyScalar(i % 2 ? 0.94 : 1));
  }
  if (!rails) return;
  const L = Math.hypot(from - to, H), a = Math.atan2(H, from - to);
  for (const side of [-1, 1]) put(side * (width / 2 + 0.25), y0 + H / 2 + 0.12, (from + to) / 2, 0.5, 0.45, L, trim, a);
}

function brickWall(ctx, put, ax, az, bx, bz, o) {
  const r = ctx.rand, [bw, bh, bt] = o.brick;
  const len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len;
  const ry = Math.atan2(-dz, dx);
  const cols = Math.max(1, Math.round(len / bw)), cw = len / cols, rows = Math.round(o.h / bh);
  let level = rows * (1 - o.broken * r() * 0.6), removed = 0;
  for (let c = 0; c < cols; c++) {
    level = Math.max(0, Math.min(rows, level + (r() - 0.5) * rows * o.broken));
    const standing = Math.round(level);
    const t = -len / 2 + (c + 0.5) * cw;
    const lx = (ax + bx) / 2 + dx * t, lz = (az + bz) / 2 + dz * t;
    for (let row = 0; row < rows; row++) {
      if (row >= standing) { removed++; continue; }
      if (o.door && Math.abs(t) < 0.7 && row < rows * 0.75) continue;
      const shift = row % 2 ? cw * 0.25 : -cw * 0.25;
      put(lx + dx * shift, o.y0 + (row + 0.5) * bh, lz + dz * shift, cw * 0.95, bh * 0.92, bt, shade(pick(r, o.colors), r, 0.16), 0, ry + (r() - 0.5) * 0.06);
    }
    if (standing >= 2 && !(o.door && Math.abs(t) < 0.7)) {
      const [wx, wz] = put.world(lx, lz);
      ctx.ground.block({ shape: 'circle', x: wx, z: wz, r: 0.75 });
    }
  }
  return removed;
}

function fallenBricks(ctx, put, count, spreadW, spreadD, y0, o) {
  const r = ctx.rand, [bw, bh, bt] = o.brick;
  for (let i = 0; i < count; i++) {
    const lx = (r() - 0.5) * spreadW, lz = (r() - 0.5) * spreadD;
    put(lx, y0 + bt / 2 + r() * 0.08, lz, bw * 0.95, bt, bh, shade(pick(r, o.colors), r, 0.2), (r() - 0.5) * 0.3, r() * Math.PI, (r() - 0.5) * 0.3);
  }
}

export const builders = {
  stepPyramid(s, ctx) {
    const { x, z, rot = 0, base = 16, tiers = 5, tierHeight = 1.3, inset = 1.3, stairWidth = 3 } = s;
    const r = ctx.rand, y0 = s.y ?? ctx.ground.heightAt(x, z), put = placer(ctx.stone, x, z, rot);
    for (let k = 0; k < tiers; k++) {
      const size = base - 2 * k * inset, yb = y0 + k * tierHeight;
      put(0, yb + tierHeight * 0.4, 0, size, tierHeight * 0.8, size, shade(pick(r, s.colors), r, 0.05));
      put(0, yb + tierHeight * 0.9, 0, size + 0.3, tierHeight * 0.2, size + 0.3, s.trim);
    }
    const H = tiers * tierHeight, topSize = base - 2 * (tiers - 1) * inset;
    stairs(put, { from: base / 2 + 1.2, to: topSize / 2, y0, H, width: stairWidth, color: s.stairColor, trim: s.trim, rand: r });

    const yt = y0 + H, sw = topSize * 0.62, sd = topSize * 0.5, sh = s.shrineHeight ?? 2.4, sz = -topSize * 0.08;
    put(0, yt + sh / 2, sz, sw, sh, sd, s.shrineColor);
    put(0, yt + sh * 0.36, sz + sd / 2 + 0.03, 1.1, sh * 0.72, 0.1, s.doorColor);
    put(0, yt + sh + 0.18, sz, sw + 0.5, 0.36, sd + 0.5, s.trim);
    put(-sw * 0.14, yt + sh + 1.05, sz, sw * 0.5, 1.4, 0.35, s.shrineColor);
    put(sw * 0.26, yt + sh + 0.62, sz, sw * 0.22, 0.6, 0.35, s.shrineColor, 0, 0, 0.12);

    for (let i = 0; i < (s.fallen ?? 30); i++) {
      const a = r() * Math.PI * 2, d = base / 2 + 0.8 + r() * 3.5, lx = Math.cos(a) * d, lz = Math.sin(a) * d;
      if (lz > 0 && Math.abs(lx) < stairWidth / 2 + 1.5) continue;
      const b = 0.35 + r() * 0.75;
      put(lx, y0 + b * 0.35, lz, b, b * 0.8, b * (0.8 + r() * 0.7), shade(pick(r, s.colors), r, 0.15), (r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5);
    }
    ctx.ground.block({ shape: 'rect', x, z, w: base + 0.6, d: base + 0.6, rot });
    const [sx, sz2] = put.world(0, base / 2 + 0.7);
    ctx.ground.block({ shape: 'rect', x: sx, z: sz2, w: stairWidth + 1.2, d: 1.6, rot });
    ctx.noCrowd.push({ shape: 'rect', x, z, w: base + 4, d: base + 4, rot });
    if (s.id) ctx.tops[s.id] = yt;
  },

  platform(s, ctx) {
    const { x, z, rot = 0, size = 4, tiers = 2, tierHeight = 0.45, stairWidth = 0 } = s;
    const r = ctx.rand, y0 = ctx.ground.heightAt(x, z), put = placer(ctx.stone, x, z, rot);
    for (let k = 0; k < tiers; k++) {
      const w = size - k * 0.9;
      put(0, y0 + k * tierHeight + tierHeight / 2, 0, w, tierHeight, w, shade(pick(r, s.colors), r, 0.05));
      put(0, y0 + (k + 1) * tierHeight - 0.05, 0, w + 0.12, 0.1, w + 0.12, s.trim);
    }
    const H = tiers * tierHeight;
    if (stairWidth) stairs(put, { from: size / 2 + 0.9, to: (size - (tiers - 1) * 0.9) / 2, y0, H, width: stairWidth, color: s.trim, trim: s.trim, rand: r, stepHeight: 0.22, rails: false });
    ctx.ground.block({ shape: 'rect', x, z, w: size + 0.4, d: size + 0.4, rot });
    if (s.id) ctx.tops[s.id] = y0 + H;
  },

  ruinHouse(s, ctx) {
    const { x, z, rot = 0, w = 5, d = 4, h = 2.4, broken = 0.6 } = s;
    const o = { ...s, h, broken, brick: s.brick ?? [0.62, 0.34, 0.4], y0: ctx.ground.heightAt(x, z) };
    const put = placer(ctx.stone, x, z, rot);
    let removed = 0;
    removed += brickWall(ctx, put, -w / 2, d / 2, w / 2, d / 2, { ...o, door: true });
    removed += brickWall(ctx, put, w / 2, -d / 2, -w / 2, -d / 2, o);
    removed += brickWall(ctx, put, -w / 2, -d / 2, -w / 2, d / 2, o);
    removed += brickWall(ctx, put, w / 2, d / 2, w / 2, -d / 2, o);
    fallenBricks(ctx, put, Math.round(removed * (s.fallen ?? 0.35)), w + 4, d + 4, o.y0, o);
    ctx.noCrowd.push({ shape: 'rect', x, z, w: w + 3.5, d: d + 3.5, rot });
  },

  toppledWall(s, ctx) {
    const { x1, z1, x2, z2, h = 2, fall = 1 } = s;
    const r = ctx.rand, [bw, bh, bt] = s.brick ?? [0.62, 0.34, 0.4];
    const len = Math.hypot(x2 - x1, z2 - z1), dx = (x2 - x1) / len, dz = (z2 - z1) / len, nx = dz * fall, nz = -dx * fall;
    const ry = Math.atan2(-dz, dx), cols = Math.round(len / bw), rows = Math.round(h / bh), put = placer(ctx.stone, 0, 0, 0);
    for (let c = 0; c < cols; c++) {
      const t = (c + 0.5) * (len / cols), bx = x1 + dx * t, bz = z1 + dz * t, y0 = ctx.ground.heightAt(bx, bz);
      const stub = 1 + Math.floor(r() * 2.5);
      for (let row = 0; row < rows; row++) {
        const color = shade(pick(r, s.colors), r, 0.16);
        if (row < stub) {
          put(bx, y0 + (row + 0.5) * bh, bz, bw * 0.95, bh * 0.92, bt, color, 0, ry);
          continue;
        }
        if (r() < 0.15) continue;
        const dist = bt / 2 + (row - stub + 0.5) * bh * 1.05 + (r() - 0.5) * 0.15;
        put(bx + nx * dist + dx * (r() - 0.5) * 0.2, y0 + bt / 2, bz + nz * dist + dz * (r() - 0.5) * 0.2, bw * 0.95, bt, bh * 0.92, color, 0, ry + (r() - 0.5) * 0.25, (r() - 0.5) * 0.12);
      }
      ctx.ground.block({ shape: 'circle', x: bx, z: bz, r: 0.6 });
    }
    const reach = h + 1;
    ctx.noCrowd.push({ shape: 'rect', x: (x1 + x2) / 2 + nx * reach / 2, z: (z1 + z2) / 2 + nz * reach / 2, w: len + 1.5, d: reach + 1.5, rot: ry });
  },

  stela(s, ctx) {
    const { x, z, rot = 0, h = 2.6, w = 0.9, broken = false } = s;
    const y0 = ctx.ground.heightAt(x, z), put = placer(ctx.stone, x, z, rot), r = ctx.rand;
    put(0, y0 + 0.1, 0, w + 0.5, 0.2, 0.9, s.trim);
    const standing = broken ? h * 0.35 : h;
    put(0, y0 + standing / 2 + 0.2, 0, w, standing, 0.4, s.color);
    if (broken) put(0.2, y0 + 0.25, 0.4 + (h - standing) / 2, w * 0.95, 0.4, h - standing, s.color, 0, (r() - 0.5) * 0.5, 0);
    ctx.ground.block({ shape: 'circle', x, z, r: 0.8 });
    ctx.noCrowd.push({ shape: 'circle', x, z, r: broken ? h : 1.5 });
  },

  rubble(s, ctx) {
    const r = ctx.rand, [lo, hi] = s.size ?? [0.15, 0.45];
    for (let i = 0; i < s.count; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * s.r, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d;
      if (!ctx.ground.isLand(x, z)) continue;
      const b = lo + r() * (hi - lo);
      ctx.rubble.add(x, ctx.ground.heightAt(x, z) + b * 0.25, z, b, b * (0.5 + r() * 0.4), b * (0.7 + r() * 0.5), shade(pick(r, s.colors), r, 0.2), r() * 3, r() * 3, r() * 3);
    }
  },

  fire(s, ctx) {
    const { x, z, size = 1 } = s, r = ctx.rand, y0 = ctx.ground.heightAt(x, z);
    ctx.ground.paint({ shape: 'circle', x, z, r: 2.6 * size, colors: s.scorch, soft: true });
    const put = placer(ctx.stone, x, z, r() * 3);
    for (let i = 0; i < 4; i++) put((r() - 0.5) * 0.5, y0 + 0.1 + i * 0.12, (r() - 0.5) * 0.5, 1.3 * size, 0.16, 0.18, s.charcoal, 0, (i * Math.PI) / 4, 0);
    for (let i = 0; i < 9 * size; i++) {
      const b = 0.1 + r() * 0.14;
      ctx.ember.add(x + (r() - 0.5) * 0.9 * size, y0 + 0.08 + r() * 0.25, z + (r() - 0.5) * 0.9 * size, b, b, b, pick(r, s.embers), r() * 3, r() * 3, 0);
    }
    ctx.ground.block({ shape: 'circle', x, z, r: 1.1 * size });
    ctx.noCrowd.push({ shape: 'circle', x, z, r: 2.4 * size });
    ctx.fires.push({ x, y: y0, z, size });
  },

  trees(s, ctx) {
    const r = ctx.rand;
    for (let placed = 0, tries = 0; placed < s.count && tries < s.count * 40; tries++) {
      const a = r() * Math.PI * 2, d = s.ring[0] + r() * (s.ring[1] - s.ring[0]);
      const x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d;
      if (ctx.ground.isBlocked(x, z) || ctx.inNoCrowd(x, z)) continue;
      placed++;
      const y0 = ctx.ground.heightAt(x, z), h = 1.2 + r() * 1.0;
      if (r() < (s.broken ?? 0.4)) {
        ctx.trunk.add(x, y0 + 0.25, z, 0.22, 0.5, 0.22, s.charred);
        const ry = r() * Math.PI * 2;
        ctx.trunk.add(x + Math.cos(ry) * h * 0.55, y0 + 0.14, z - Math.sin(ry) * h * 0.55, 0.18, h, 0.18, s.charred, 0, ry, Math.PI / 2);
      } else {
        ctx.trunk.add(x, y0 + h / 2, z, 0.2, h, 0.2, s.trunk);
        const leaf = pick(r, s.leaves);
        for (let k = 0; k < 3; k++) {
          const b = (0.75 - k * 0.15) * (0.9 + r() * 0.4);
          ctx.leaves.add(x + (r() - 0.5) * 0.3, y0 + h + k * 0.45, z + (r() - 0.5) * 0.3, b, b * 0.85, b, shade(leaf, r, 0.15), 0, r() * 3, 0);
        }
      }
      ctx.ground.block({ shape: 'circle', x, z, r: 0.6 });
      ctx.noCrowd.push({ shape: 'circle', x, z, r: 0.9 });
    }
  },
};

export function structureMaterials() {
  return {
    stone: new THREE.MeshStandardMaterial({ roughness: 0.88 }),
    rubble: new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    ember: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ff6a1a', emissiveIntensity: 2.2, roughness: 1 }),
    trunk: new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    leaves: new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
  };
}
