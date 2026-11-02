import * as THREE from 'three';
import { frame } from './bom-07-camp.js';
import { beam } from './bom-07-ship.js';

const darken = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

function block(ctx, at, rot, lx, lz, y, w, h, d, color, { collide = true, jitter = 0.04 } = {}) {
  const [x, z] = at(lx, lz);
  ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter, shade: darken });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function groundUnder(ctx, at, w, d) {
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) h = Math.min(h, ctx.heightAt(...at(lx, lz)));
  return h;
}

// Temple after the pattern of Solomon's: raised platform, long house with a tall porch, two bronze pillars,
// side chambers, a walled court with an altar and a laver. Front faces local +z. `progress` < 1 shows it under construction.
export function solomonTemple(ctx, { x, z, rot = 0, progress = 1, stone = '#d2c3a2', trim = '#a8916c', gold = '#d6ae4a', bronze = '#a8703a', court = true }) {
  const at = frame(x, z, rot);
  const P = { w: 26, d: 46, h: 2.4 };
  const y0 = groundUnder(ctx, at, P.w + 4, P.d + 14) - 0.2;
  block(ctx, at, rot, 0, 0, y0, P.w, P.h, P.d, stone);
  block(ctx, at, rot, 0, 0, y0 + P.h - 0.3, P.w + 0.5, 0.35, P.d + 0.5, trim, { collide: false });
  const steps = 8, rise = P.h / steps, run = 0.55, stairW = 16;
  for (let i = 0; i < steps; i++) block(ctx, at, rot, 0, P.d / 2 + (steps - i) * run - run / 2, y0, stairW, (i + 1) * rise, run + 0.02, i % 2 ? stone : '#dccfb2', { jitter: 0.02 });
  const top = y0 + P.h;

  const H = { w: 11, d: 28, h: 13, z: -6 };
  const hDone = progress >= 1 ? H.h : H.h * progress;
  const wallT = 1.0;
  const wall = (lx, lz, w, d, h) => block(ctx, at, rot, lx, lz, top, w, h, d, stone);
  wall(0, H.z - H.d / 2 + wallT / 2, H.w, wallT, hDone);
  wall(-H.w / 2 + wallT / 2, H.z, wallT, H.d, hDone);
  wall(H.w / 2 - wallT / 2, H.z, wallT, H.d, hDone);
  if (progress >= 1) {
    block(ctx, at, rot, 0, H.z, top + H.h, H.w + 0.8, 0.6, H.d + 0.8, trim);
    block(ctx, at, rot, 0, H.z, top + H.h + 0.6, H.w - 1, 0.5, H.d - 1, stone, { collide: false });
    for (let i = 0; i < 9; i++) {
      for (const s of [-1, 1]) block(ctx, at, rot, s * (H.w / 2 + 0.1), H.z - H.d / 2 + 1.5 + i * 3.1, top + H.h - 2.4, 0.4, 1.2, 1.4, '#3a3028', { collide: false });
    }
  }

  const side = { t: 3, h: progress >= 1 ? 8 : Math.min(8, hDone) };
  for (const s of [-1, 1]) {
    block(ctx, at, rot, s * (H.w / 2 + side.t / 2), H.z, top, side.t, side.h, H.d, stone);
    if (progress >= 1) for (let k = 1; k < 3; k++) block(ctx, at, rot, s * (H.w / 2 + side.t / 2), H.z, top + k * (side.h / 3) - 0.2, side.t + 0.3, 0.3, H.d + 0.3, trim, { collide: false });
  }
  block(ctx, at, rot, 0, H.z - H.d / 2 - side.t / 2, top, H.w + side.t * 2, side.h, side.t, stone);
  if (progress >= 1) block(ctx, at, rot, 0, H.z, top + side.h, H.w + side.t * 2 + 0.4, 0.4, H.d + side.t + 0.4, trim, { collide: false });

  const porch = { w: H.w + side.t * 2, d: 5, h: progress >= 1 ? 17 : hDone * 0.85, z: H.z + H.d / 2 + 2.5 };
  const door = 4.2;
  const pw = (porch.w - door) / 2;
  for (const s of [-1, 1]) block(ctx, at, rot, s * (door / 2 + pw / 2), porch.z, top, pw, porch.h, porch.d, stone);
  if (progress >= 1) {
    block(ctx, at, rot, 0, porch.z, top + 7, door + 0.2, porch.h - 7, porch.d, stone);
    block(ctx, at, rot, 0, porch.z - 0.6, top, door, 7, 0.5, '#3a2a1e');
    for (const s of [-1, 1]) block(ctx, at, rot, s * door * 0.25, porch.z - 0.3, top + 0.4, door * 0.42, 6.2, 0.2, gold, { collide: false });
    block(ctx, at, rot, 0, porch.z, top + porch.h, porch.w + 0.6, 0.7, porch.d + 0.6, trim);
    block(ctx, at, rot, 0, porch.z + porch.d / 2 + 0.05, top + 9.5, porch.w, 0.6, 0.15, gold, { collide: false });
    block(ctx, at, rot, 0, porch.z + porch.d / 2 + 0.05, top + porch.h - 1.4, porch.w, 0.5, 0.15, gold, { collide: false });
    for (let i = 0; i < 7; i++) block(ctx, at, rot, -porch.w / 2 + 1 + i * ((porch.w - 2) / 6), porch.z, top + porch.h + 0.7, 0.9, 0.9, porch.d, stone, { collide: false });
  }

  const pillarZ = porch.z + porch.d / 2 + 1.6;
  const pillarH = 9.5;
  for (const s of [-1, 1]) {
    const [px, pz] = at(s * 4.2, pillarZ);
    if (progress >= 1 || s < 0) {
      ctx.solid.add(new THREE.CylinderGeometry(0.85, 0.9, pillarH, 10), { position: [px, top + pillarH / 2, pz], color: bronze, jitter: 0.03 });
      ctx.solid.add(new THREE.CylinderGeometry(1.4, 0.85, 1.6, 10), { position: [px, top + pillarH + 0.8, pz], color: bronze, jitter: 0.03 });
      ctx.solid.add(new THREE.SphereGeometry(1.15, 10, 5), { position: [px, top + pillarH + 2.2, pz], scale: [1, 0.8, 1], color: gold, jitter: 0.05 });
      ctx.solid.add(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 10), { position: [px, top + 0.25, pz], color: trim });
      ctx.colliders.add({ x: px, z: pz, w: 1.8, d: 1.8, bottom: top, top: top + pillarH + 3 });
    }
  }

  if (court) {
    const C = { w: 64, d: 96, h: 2.6, z: -2 };
    const cy = (lx, lz) => ctx.heightAt(...at(lx, lz)) - 0.2;
    const seg = 4;
    const run = (x0, z0, x1, z1, gap) => {
      const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / seg);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const lx = x0 + (x1 - x0) * t, lz = z0 + (z1 - z0) * t;
        if (gap && Math.abs(lx) < gap) continue;
        const horiz = Math.abs(x1 - x0) > Math.abs(z1 - z0);
        block(ctx, at, rot, lx, lz, cy(lx, lz), horiz ? seg + 0.05 : 1, C.h, horiz ? 1 : seg + 0.05, stone);
        block(ctx, at, rot, lx, lz, cy(lx, lz) + C.h, horiz ? seg + 0.3 : 1.3, 0.3, horiz ? 1.3 : seg + 0.3, trim, { collide: false });
      }
    };
    const fz = C.z + C.d / 2, bz = C.z - C.d / 2;
    run(-C.w / 2, bz, C.w / 2, bz);
    run(-C.w / 2, bz, -C.w / 2, fz);
    run(C.w / 2, bz, C.w / 2, fz);
    run(-C.w / 2, fz, C.w / 2, fz, 5);
    for (const s of [-1, 1]) block(ctx, at, rot, s * 5.2, fz, cy(s * 5.2, fz), 1.6, 5, 1.6, trim);
    block(ctx, at, rot, 0, fz, cy(0, fz) + 5, 12, 1, 1.6, trim, { collide: false });

    const altarZ = P.d / 2 + 13;
    const ay = cy(0, altarZ);
    block(ctx, at, rot, 0, altarZ, ay, 6, 2.4, 6, bronze);
    block(ctx, at, rot, 0, altarZ, ay + 2.4, 6.4, 0.3, 6.4, '#8a5a2e', { collide: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const [hx, hz] = at(sx * 2.8, altarZ + sz * 2.8);
      ctx.solid.add(new THREE.ConeGeometry(0.3, 0.7, 4), { position: [hx, ay + 3, hz], color: bronze });
    }
    const [lx, lz] = at(14, P.d / 2 + 6);
    const ly = ctx.heightAt(lx, lz);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ox = lx + Math.cos(a) * 2.6, oz = lz + Math.sin(a) * 2.6;
      ctx.solid.box(0.8, 1.1, 1.6, { position: [ox, ly + 0.55, oz], rotation: [0, -a + Math.PI / 2, 0], color: bronze, shade: darken });
      ctx.solid.box(0.5, 0.5, 0.6, { position: [lx + Math.cos(a) * 3.5, ly + 1.1, lz + Math.sin(a) * 3.5], rotation: [0, -a + Math.PI / 2, 0], color: bronze });
    }
    ctx.solid.add(new THREE.CylinderGeometry(4, 3, 1.8, 14), { position: [lx, ly + 2, lz], color: bronze, jitter: 0.03 });
    ctx.solid.add(new THREE.CircleGeometry(3.8, 14).rotateX(-Math.PI / 2), { position: [lx, ly + 2.85, lz], color: '#6a8a96', jitter: 0.02 });
    ctx.colliders.add({ x: lx, z: lz, w: 8, d: 8, bottom: ly, top: ly + 3 });
  }

  return { top, porchFront: at(0, porch.z + porch.d / 2), stairFoot: at(0, P.d / 2 + steps * run), at, houseZ: H.z, H, porch, pillarZ };
}

// Square house of plastered stone with a flat timber roof.
export function house(ctx, { x, z, rot = 0, w = 6, d = 5, h = 3.2, color = '#c8b08a', roof = '#7a5a3a' }) {
  const at = frame(x, z, rot);
  const y = groundUnder(ctx, at, w, d) - 0.2;
  block(ctx, at, rot, 0, 0, y, w, h, d, color);
  block(ctx, at, rot, 0, 0, y + h, w + 0.4, 0.35, d + 0.4, roof, { collide: false });
  for (let i = 0; i < Math.floor(w / 1.2); i++) block(ctx, at, rot, -w / 2 + 0.6 + i * 1.2, d / 2 + 0.2, y + h - 0.4, 0.2, 0.2, 0.5, '#4a3424', { collide: false });
  block(ctx, at, rot, w * 0.15, d / 2 + 0.01, y, 1.1, 2.1, 0.08, '#2e2018', { collide: false });
  block(ctx, at, rot, -w * 0.25, d / 2 + 0.01, y + 1.5, 0.6, 0.6, 0.08, '#2e2018', { collide: false });
  if (ctx.rand() < 0.5) {
    block(ctx, at, rot, -w / 4, 0, y + h + 0.35, w / 2, 0.8, d * 0.5, color);
  }
}

// Timber scaffold wrapped around a rectangle.
export function scaffold(ctx, { x, z, rot = 0, w, d, y, h, levels = 3, color = '#8a6a44' }) {
  const at = frame(x, z, rot);
  const posts = [];
  for (const [ax, az, bx, bz] of [[-w / 2, -d / 2, w / 2, -d / 2], [w / 2, -d / 2, w / 2, d / 2], [-w / 2, d / 2, w / 2, d / 2], [-w / 2, -d / 2, -w / 2, d / 2]]) {
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 3.5));
    for (let i = 0; i <= n; i++) posts.push([ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n]);
  }
  for (const [lx, lz] of posts) {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.12, h, 4), { position: [px, y + h / 2, pz], color });
  }
  for (let k = 1; k <= levels; k++) {
    const ly = y + (h * k) / (levels + 0.3);
    for (const [ax, az, bx, bz] of [[-w / 2, -d / 2, w / 2, -d / 2], [w / 2, -d / 2, w / 2, d / 2], [-w / 2, d / 2, w / 2, d / 2], [-w / 2, -d / 2, -w / 2, d / 2]]) {
      const [x0, z0] = at(ax, az), [x1, z1] = at(bx, bz);
      beam(ctx.solid, new THREE.Vector3(x0, ly, z0), new THREE.Vector3(x1, ly, z1), 0.14, color);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const len = Math.hypot(x1 - x0, z1 - z0);
      ctx.solid.box(0.9, 0.08, len, { position: [mx, ly + 0.08, mz], rotation: [0, Math.atan2(x1 - x0, z1 - z0), 0], color: '#a07c50' });
    }
  }
}
