import * as THREE from 'three';
import { fbm } from './util.js';

const STONE = '#b29a7c';
const TRIM = '#8f7a60';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

// Maps local (lx, lz) around an anchor rotated by `rot` to world (x, z), matching three.js rotation.y.
function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

function lowestGround(ctx, x, z, w, d, rot) {
  const at = frame(x, z, rot);
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
    const [px, pz] = at(lx, lz);
    h = Math.min(h, ctx.heightAt(px, pz));
  }
  return h;
}

function solidBox(ctx, { x, z, y, w, h, d, rot = 0, tilt = [0, 0], color, jitter = 0.05, collide = true }) {
  ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function stone(ctx, x, z, size, color, { sink = 0.3, y } = {}) {
  const r = ctx.rand;
  const base = y ?? ctx.heightAt(x, z);
  const geo = r() < 0.5 ? new THREE.DodecahedronGeometry(1, 0) : new THREE.BoxGeometry(1.4, 1, 1.2);
  const sx = size * r.range(0.7, 1.4), sy = size * r.range(0.5, 1), sz = size * r.range(0.7, 1.3);
  ctx.solid.add(geo, {
    position: [x, base + sy * (0.5 - sink), z],
    rotation: [r.range(-0.4, 0.4), r() * Math.PI * 2, r.range(-0.4, 0.4)],
    scale: [sx, sy, sz],
    color,
    jitter: 0.08,
    shade: darkenBottom,
  });
}

// A broken wall: segments of jagged height with gaps, plus fallen blocks at its foot.
function brokenWall(ctx, at, { lx0, lz0, lx1, lz1, h, thick, color, damage, y0, rot }) {
  const r = ctx.rand;
  const len = Math.hypot(lx1 - lx0, lz1 - lz0);
  const n = Math.max(1, Math.round(len / 1.1));
  const seg = len / n;
  const ang = Math.atan2(lx1 - lx0, lz1 - lz0);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const lx = lx0 + (lx1 - lx0) * t, lz = lz0 + (lz1 - lz0) * t;
    const [x, z] = at(lx, lz);
    const decay = fbm(x * 0.35, z * 0.35, 3, 2);
    if (r() < damage * 0.35) {
      if (r() < 0.6) stone(ctx, x + r.range(-1.2, 1.2), z + r.range(-1.2, 1.2), r.range(0.25, 0.5), color);
      continue;
    }
    const hh = Math.max(0.35, h * (1 - damage * (decay * 1.4 + r() * 0.5)));
    solidBox(ctx, { x, z, y: y0, w: thick, h: hh, d: seg + 0.02, rot: rot + ang, color });
    if (r() < damage * 0.5) {
      const side = r.sign() * r.range(0.8, 2.2);
      const [sx, sz] = at(lx + Math.cos(ang) * side, lz - Math.sin(ang) * side);
      stone(ctx, sx, sz, r.range(0.2, 0.45), color);
    }
  }
}

export const builders = {
  // Stepped temple platform with a front stairway, talud-tablero bands and an optional shrine on top.
  steppedPyramid(ctx, s) {
    const { x, z, rot = 0, w = 40, d = 40, tiers = 5, tierHeight = 3, inset = 2.5, stairWidth = 8, color = STONE, trim = TRIM, stairColor } = s;
    const at = frame(x, z, rot);
    const y0 = lowestGround(ctx, x, z, w, d, rot) - 0.2;
    for (let i = 0; i < tiers; i++) {
      const tw = w - 2 * i * inset, td = d - 2 * i * inset, ty = y0 + i * tierHeight;
      solidBox(ctx, { x, z, y: ty, w: tw, h: tierHeight, d: td, rot, color });
      ctx.solid.box(tw + 0.5, tierHeight * 0.32, td + 0.5, { position: [x, ty + tierHeight * 0.78, z], rotation: [0, rot, 0], color: trim, shade: darkenBottom });
    }
    const H = tiers * tierHeight;
    const steps = Math.ceil(H / 0.32);
    const rise = H / steps, run = (rise * inset) / tierHeight;
    const front = d / 2 + inset;
    for (let i = 0; i < steps; i++) {
      const lz = front - i * run - run / 2;
      const [sx, sz] = at(0, lz);
      solidBox(ctx, { x: sx, z: sz, y: y0, w: stairWidth, h: (i + 1) * rise, d: run + 0.01, rot, color: stairColor ?? color, jitter: 0.03 });
    }
    const runLen = steps * run;
    const slope = Math.atan2(H, runLen);
    for (const side of [-1, 1]) {
      const [bx, bz] = at(side * (stairWidth / 2 + Math.min(0.4, tierHeight * 0.15)), front - runLen / 2);
      const bw = Math.min(0.9, tierHeight * 0.3);
      ctx.solid.box(bw, bw * 0.8, Math.hypot(H, runLen) + bw * 0.6, {
        position: [bx, y0 + H / 2 + bw * 0.3, bz],
        rotation: [slope, rot, 0],
        color: trim,
        shade: darkenBottom,
      });
    }
    if (s.shrine) builders.shrine(ctx, { x, z, rot, y: y0 + H, color, trim, ...s.shrine });
    return { top: y0 + H, front: at(0, front) };
  },

  // Small temple house with a doorway facing local +z and a roof comb.
  shrine(ctx, s) {
    const { x, z, rot = 0, y, w = 12, d = 9, h = 5, door = 2.4, color = STONE, trim = TRIM, roof = '#7c6a55' } = s;
    const at = frame(x, z, rot);
    const t = 0.9;
    const wall = (lx, lz, ww, dd, hh = h, yy = y) => {
      const [px, pz] = at(lx, lz);
      solidBox(ctx, { x: px, z: pz, y: yy, w: ww, h: hh, d: dd, rot, color });
    };
    wall(0, -d / 2 + t / 2, w, t);
    wall(-w / 2 + t / 2, 0, t, d);
    wall(w / 2 - t / 2, 0, t, d);
    const side = (w - door) / 2;
    wall(-w / 2 + side / 2, d / 2 - t / 2, side, t);
    wall(w / 2 - side / 2, d / 2 - t / 2, side, t);
    const [lx, lz] = at(0, d / 2 - t / 2);
    ctx.solid.box(door + 0.4, h * 0.3, t, { position: [lx, y + h * 0.85, lz], rotation: [0, rot, 0], color });
    ctx.solid.box(w + 1, 0.6, d + 1, { position: [x, y + h + 0.3, z], rotation: [0, rot, 0], color: trim, shade: darkenBottom });
    ctx.solid.box(w - 1.5, 0.9, d - 1.5, { position: [x, y + h + 1.05, z], rotation: [0, rot, 0], color: roof, shade: darkenBottom });
    const [cx, cz] = at(0, -d * 0.1);
    ctx.solid.box(w * 0.6, h * 0.55, 0.7, { position: [cx, y + h + 1.5 + h * 0.27, cz], rotation: [0, rot, 0], color: trim, shade: darkenBottom });
  },

  ruinedHouse(ctx, s) {
    const r = ctx.rand;
    const { x, z, rot = r() * Math.PI, w = r.range(6, 11), d = r.range(5, 9), h = r.range(2.8, 4.6), color = STONE, damage = r.range(0.35, 0.85) } = s;
    const at = frame(x, z, rot);
    const y0 = lowestGround(ctx, x, z, w, d, rot) - 0.15;
    const t = 0.55;
    const door = 1.3;
    const walls = [
      [-w / 2, -d / 2, w / 2, -d / 2],
      [-w / 2, -d / 2, -w / 2, d / 2],
      [w / 2, -d / 2, w / 2, d / 2],
      [-w / 2, d / 2, -door / 2, d / 2],
      [door / 2, d / 2, w / 2, d / 2],
    ];
    for (const [lx0, lz0, lx1, lz1] of walls) brokenWall(ctx, at, { lx0, lz0, lx1, lz1, h, thick: t, color, damage, y0, rot });
    for (let i = 0; i < 6 + damage * 10; i++) {
      const [px, pz] = at(r.range(-w / 2, w / 2), r.range(-d / 2, d / 2));
      stone(ctx, px, pz, r.range(0.25, 0.6), color);
    }
    if (r() < 0.7) {
      const [bx, bz] = at(r.range(-w / 4, w / 4), r.range(-d / 4, d / 4));
      ctx.solid.box(0.25, 0.25, d * 1.1, {
        position: [bx, y0 + h * 0.35, bz],
        rotation: [r.range(0.2, 0.45), rot + r.range(-0.3, 0.3), r.range(-0.2, 0.2)],
        color: '#4a3a2c',
      });
    }
  },

  wall(ctx, s) {
    const r = ctx.rand;
    const { x, z, rot = 0, len = 12, h = 2.5, thick = 0.7, color = STONE, damage = 0.5 } = s;
    const at = frame(x, z, rot);
    const y0 = lowestGround(ctx, x, z, thick, len, rot) - 0.15;
    brokenWall(ctx, at, { lx0: 0, lz0: -len / 2, lx1: 0, lz1: len / 2, h, thick, color, damage, y0, rot });
  },

  // A wall that fell over as one piece and cracked into slabs on the ground.
  toppledWall(ctx, s) {
    const r = ctx.rand;
    const { x, z, rot = r() * Math.PI, len = r.range(6, 12), h = r.range(2, 3), thick = 0.6, color = STONE } = s;
    const at = frame(x, z, rot);
    const n = Math.round(len / 1.6);
    for (let i = 0; i < n; i++) {
      const lz = -len / 2 + (i + 0.5) * (len / n);
      const [px, pz] = at(r.range(-0.2, 0.2), lz);
      const y = ctx.heightAt(px, pz) - 0.1;
      ctx.solid.box(h, thick, len / n - 0.15, {
        position: [px, y + thick / 2, pz],
        rotation: [r.range(-0.1, 0.1), rot + r.range(-0.12, 0.12), r.range(-0.12, 0.12)],
        color,
        shade: darkenBottom,
      });
      ctx.colliders.add({ x: px, z: pz, w: h, d: len / n, rot, bottom: y, top: y + thick });
    }
    const [bx, bz] = at(-h / 2 - 0.4, 0);
    const by = lowestGround(ctx, bx, bz, thick, len, rot) - 0.1;
    solidBox(ctx, { x: bx, z: bz, y: by, w: thick, h: 0.5, d: len, rot, color });
  },

  column(ctx, s) {
    const r = ctx.rand;
    const { x, z, h = r.range(3, 6), radius = 0.55, color = STONE, broken = r() < 0.6 } = s;
    const y = ctx.heightAt(x, z) - 0.1;
    const standing = broken ? h * r.range(0.25, 0.6) : h;
    ctx.solid.add(new THREE.CylinderGeometry(radius, radius * 1.08, standing, 7), { position: [x, y + standing / 2, z], rotation: [0, r() * 3, 0], color });
    ctx.solid.box(radius * 2.6, 0.4, radius * 2.6, { position: [x, y + 0.2, z], color: TRIM, shade: darkenBottom });
    ctx.colliders.add({ x, z, w: radius * 2.4, d: radius * 2.4, bottom: y, top: y + standing });
    if (broken) {
      const ang = r() * Math.PI * 2;
      const drums = Math.max(1, Math.round((h - standing) / 1));
      for (let i = 0; i < drums; i++) {
        const dist = 1.2 + i * 1.15 + r.range(0, 0.3);
        const px = x + Math.cos(ang) * dist + r.range(-0.2, 0.2), pz = z + Math.sin(ang) * dist + r.range(-0.2, 0.2);
        ctx.solid.add(new THREE.CylinderGeometry(radius, radius, 1, 7), {
          position: [px, ctx.heightAt(px, pz) + radius * 0.85, pz],
          rotation: [Math.PI / 2, -ang + Math.PI / 2 + r.range(-0.25, 0.25), 0],
          color,
        });
      }
    }
  },

  rubble(ctx, s) {
    const r = ctx.rand;
    const { x, z, radius = 4, count = 12, size = [0.2, 0.6], color = STONE } = s;
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
      stone(ctx, x + Math.cos(a) * d, z + Math.sin(a) * d, r.range(size[0], size[1]), color);
    }
  },

  // Flagstone plaza: tiles tilt, sink and go missing more toward broken areas.
  pavement(ctx, s) {
    const r = ctx.rand;
    const { x, z, w, d, rot = 0, tile = 2.2, color = '#c4ab88', gap = 0.12, damage = 0.25, holes = [] } = s;
    const at = frame(x, z, rot);
    const nx = Math.round(w / tile), nz = Math.round(d / tile);
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        const lx = -w / 2 + (i + 0.5) * tile, lz = -d / 2 + (j + 0.5) * tile;
        const [px, pz] = at(lx, lz);
        if (holes.some((hz) => Math.hypot(px - hz.x, pz - hz.z) < hz.r)) continue;
        const wreck = fbm(px * 0.07, pz * 0.07, 21, 3) * 2 * damage;
        if (r() < wreck * 0.25) continue;
        const tilt = wreck > 0.35 ? r.range(-0.12, 0.12) * wreck * 2 : r.range(-0.015, 0.015);
        ctx.solid.box(tile - gap, 0.3, tile - gap, {
          position: [px, ctx.heightAt(px, pz) - 0.1 + r.range(-0.04, 0.03) - wreck * 0.08, pz],
          rotation: [tilt, rot + r.range(-0.02, 0.02), r.range(-1, 1) * tilt],
          color,
          jitter: 0.07,
        });
      }
    }
  },

  // Jagged earthquake fissure, optionally glowing with embers at its core.
  crack(ctx, s) {
    const r = ctx.rand;
    const { path, width = 0.9, glow = false, branches = 2, color = '#2a211c' } = s;
    const pts = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [ax, az] = path[i], [bx, bz] = path[i + 1];
      const n = Math.max(2, Math.round(Math.hypot(bx - ax, bz - az) / 1.6));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        pts.push([ax + (bx - ax) * t + r.range(-0.6, 0.6), az + (bz - az) * t + r.range(-0.6, 0.6)]);
      }
    }
    pts.push(path[path.length - 1]);
    const ribbon = (list, wid, batch, col, lift) => {
      const positions = [];
      for (let i = 0; i < list.length - 1; i++) {
        const [ax, az] = list[i], [bx, bz] = list[i + 1];
        const len = Math.hypot(bx - ax, bz - az) || 1;
        const nx = -(bz - az) / len, nz = (bx - ax) / len;
        const taper = Math.min(1, Math.min(i, list.length - 2 - i) / 3 + 0.25);
        const wa = wid * taper * r.range(0.6, 1.3), wb = wid * taper * r.range(0.6, 1.3);
        const p = [
          [ax + nx * wa, az + nz * wa], [ax - nx * wa, az - nz * wa],
          [bx + nx * wb, bz + nz * wb], [bx - nx * wb, bz - nz * wb],
        ].map(([px, pz]) => [px, ctx.heightAt(px, pz) + lift, pz]);
        positions.push(...p[0], ...p[2], ...p[1], ...p[1], ...p[2], ...p[3]);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      batch.add(geo, { color: col, jitter: 0.04 });
    };
    ribbon(pts, width, ctx.solid, color, 0.16);
    if (glow) ribbon(pts, width * 0.3, ctx.glow, '#ff7a2a', 0.19);
    for (let b = 0; b < branches; b++) {
      const start = pts[Math.floor(r.range(0.2, 0.8) * pts.length)];
      const ang = r() * Math.PI * 2;
      const branch = [start];
      for (let k = 1; k < 5; k++) branch.push([start[0] + Math.cos(ang) * k * 1.4 + r.range(-0.4, 0.4), start[1] + Math.sin(ang) * k * 1.4 + r.range(-0.4, 0.4)]);
      ribbon(branch, width * 0.5, ctx.solid, color, 0.15);
    }
    for (let i = 2; i < pts.length - 2; i += 3) {
      const [px, pz] = pts[i];
      const side = r.sign() * width * 1.6;
      ctx.solid.box(r.range(0.8, 1.6), 0.25, r.range(0.8, 1.4), {
        position: [px + side * 0.7, ctx.heightAt(px, pz) + 0.12, pz + side * 0.7],
        rotation: [r.range(-0.3, 0.3), r() * 3, r.range(-0.3, 0.3)],
        color: '#7c6a58',
      });
    }
  },

  tree(ctx, s) {
    const r = ctx.rand;
    const { x, z, h = r.range(5, 9), kind = r.pick(['broad', 'broad', 'palm', 'burnt']), leaf = '#5f7a3a' } = s;
    const y = ctx.heightAt(x, z) - 0.2;
    const lean = [r.range(-0.08, 0.08), 0, r.range(-0.08, 0.08)];
    if (kind === 'burnt') {
      const hh = h * r.range(0.4, 0.7);
      ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.3, hh, 5), { position: [x, y + hh / 2, z], rotation: [lean[0] * 3, 0, lean[2] * 3], color: '#2c2420' });
      for (let i = 0; i < 2; i++) {
        ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.1, hh * 0.4, 4), {
          position: [x + r.range(-0.6, 0.6), y + hh * r.range(0.5, 0.8), z + r.range(-0.6, 0.6)],
          rotation: [r.range(-0.9, 0.9), 0, r.range(-0.9, 0.9)],
          color: '#2c2420',
        });
      }
      ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: y, top: y + hh });
      return;
    }
    ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.35, h, 5), { position: [x, y + h / 2, z], rotation: lean, color: '#5a4332' });
    ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: y, top: y + h });
    if (kind === 'palm') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + r.range(-0.2, 0.2);
        const geo = new THREE.ConeGeometry(0.6, 4, 3);
        geo.translate(0, 2, 0);
        ctx.solid.add(geo, {
          position: [x + lean[2] * -h, y + h, z + lean[0] * h],
          rotation: [Math.PI / 2 + r.range(0.3, 0.8), a, 0],
          scale: [1, 1, 0.25],
          color: leaf,
          jitter: 0.08,
        });
      }
      return;
    }
    for (let i = 0; i < 3; i++) {
      const rad = h * r.range(0.25, 0.38);
      ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
        position: [x + r.range(-1, 1) * rad * 0.6, y + h + r.range(-0.2, 0.5) * rad, z + r.range(-1, 1) * rad * 0.6],
        rotation: [r() * 3, r() * 3, 0],
        scale: [1, r.range(0.7, 0.9), 1],
        color: leaf,
        jitter: 0.1,
      });
    }
  },

  rock(ctx, s) {
    const r = ctx.rand;
    const { x, z, size = r.range(1.5, 4), color = '#8d7b69' } = s;
    stone(ctx, x, z, size, color, { sink: 0.35 });
    const y = ctx.heightAt(x, z);
    ctx.colliders.add({ x, z, w: size * 1.6, d: size * 1.6, bottom: y, top: y + size * 0.6 });
  },

  // Scorched ground with glowing embers and a column of smoke.
  smolder(ctx, s) {
    const r = ctx.rand;
    const { x, z, radius = 2.5, smoke = 12, height = 16 } = s;
    const y = ctx.heightAt(x, z);
    const ash = new THREE.CircleGeometry(radius, 9);
    ash.rotateX(-Math.PI / 2);
    ctx.solid.add(ash, { position: [x, y + 0.06, z], rotation: [0, r() * 3, 0], scale: [1, 1, r.range(0.7, 1)], color: '#2b2522', jitter: 0.1 });
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius * 0.7;
      ctx.glow.add(new THREE.OctahedronGeometry(r.range(0.12, 0.3), 0), {
        position: [x + Math.cos(a) * d, y + 0.1, z + Math.sin(a) * d],
        rotation: [r() * 3, r() * 3, 0],
        scale: [1, 0.5, 1],
        color: r.pick(['#ff6a1a', '#ff9a3a', '#e8481a']),
        jitter: 0.06,
      });
    }
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2;
      ctx.solid.box(0.25, 0.22, r.range(1.2, 2.4), {
        position: [x + Math.cos(a) * radius * 0.4, y + 0.15, z + Math.sin(a) * radius * 0.4],
        rotation: [0, r() * 3, r.range(-0.2, 0.2)],
        color: '#1f1a17',
      });
    }
    if (smoke) ctx.effects.smoke({ position: [x, y + 0.5, z], count: smoke, height, size: radius * 0.45, seed: Math.floor(r() * 1e6) });
  },
};
