import * as THREE from 'three';
import { local, valueNoise } from './world.js';
import { FIGURES } from './figures.js';

const DIRS = { south: 0, east: Math.PI / 2, north: Math.PI, west: -Math.PI / 2 };
const deg = (d) => (d * Math.PI) / 180;
const jitterColor = (c, rand, amt = 0.08) => { const k = 1 + (rand() - 0.5) * 2 * amt; return c.map((v) => v * k); };
const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

// Max terrain height over a yawed footprint, so platforms never sink into bumps.
function footprintTop(ctx, pos, w, d, yaw) {
  let h = -Infinity;
  for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) {
    const [x, z] = local(pos, yaw, (i / 4 - 0.5) * w, (j / 4 - 0.5) * d);
    h = Math.max(h, ctx.colliders.heightAt(x, z));
  }
  return h;
}

function solidBox(ctx, cx, cz, y0, size, yaw, opts) {
  const [w, h, d] = size;
  ctx.builder.box([cx, y0 + h / 2, cz], size, { yaw, ...opts });
  ctx.colliders.add(cx, cz, w / 2, d / 2, yaw, y0, y0 + h);
}

// Steps rising from `start` (bottom outer edge, world x/z) inward against the outward yaw.
function stairs(ctx, { start, yaw, width, height, baseY, rise, run = rise, inward = 3, tex, color, seed = 0 }) {
  const n = Math.max(1, Math.round(height / rise));
  const r = height / n;
  for (let i = 0; i < n; i++) {
    const depth = (n - i) * run + inward;
    const offset = -(i * run + depth / 2);
    const [cx, cz] = local(start, yaw, 0, offset);
    const top = baseY + (i + 1) * r;
    solidBox(ctx, cx, cz, baseY - 0.5, [width, top - baseY + 0.5, depth], yaw, { tex, color: i % 2 ? color : color.map((v) => v * 0.94), seed: seed + i });
  }
  return { run: n * run };
}

function building(ctx, it, rand) {
  const yaw = deg(it.yaw ?? 0);
  const [w, d] = it.size;
  const H = it.height ?? 4;
  const th = it.thickness ?? 0.7;
  const dmg = it.damage ?? 0;
  const tex = it.tex ?? 'stone';
  const color = it.color ?? [1, 1, 1];
  const baseY = it.baseY ?? footprintTop(ctx, it.pos, w, d, yaw) - 0.3;
  const noise = valueNoise((it.seed ?? 7) + rand() * 100);
  const doorSide = it.door ?? 'south';
  const sides = [
    { name: 'south', a: [-w / 2, d / 2], b: [w / 2, d / 2] },
    { name: 'north', a: [w / 2, -d / 2], b: [-w / 2, -d / 2] },
    { name: 'east', a: [w / 2, d / 2], b: [w / 2, -d / 2] },
    { name: 'west', a: [-w / 2, -d / 2], b: [-w / 2, d / 2] },
  ];
  for (const side of sides) {
    const len = Math.hypot(side.b[0] - side.a[0], side.b[1] - side.a[1]);
    const n = Math.max(1, Math.round(len / (it.block ?? 0.9)));
    const seg = len / n;
    const wallYaw = yaw + Math.atan2(-(side.b[1] - side.a[1]), side.b[0] - side.a[0]);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const lx = side.a[0] + (side.b[0] - side.a[0]) * t;
      const lz = side.a[1] + (side.b[1] - side.a[1]) * t;
      let h = H;
      if (dmg > 0) {
        const p = noise(lx * 0.35 + lz * 0.35, side.name.length * 3.1);
        h = H * Math.max(0, Math.min(1, 1.15 - dmg * (0.2 + 1.5 * p) - rand() * dmg * 0.35));
        if (h < 0.25) continue;
      }
      const along = (t - 0.5) * len;
      const isDoor = side.name === doorSide && Math.abs(along) < 0.95;
      const [cx, cz] = local(it.pos, yaw, lx, lz);
      const tone = jitterColor(color, rand, 0.05);
      if (isDoor) {
        if (h > 2.6) solidBox(ctx, cx, cz, baseY + 2.4, [seg + 0.02, h - 2.4, th], wallYaw, { tex, color: tone, seed: i });
        continue;
      }
      solidBox(ctx, cx, cz, baseY, [seg + 0.02, h, th], wallYaw, { tex, color: tone, seed: i * 1.7 });
    }
  }
  if (it.roof && dmg === 0) {
    const [cx, cz] = local(it.pos, yaw, 0, 0);
    solidBox(ctx, cx, cz, baseY + H, [w + 0.8, 0.6, d + 0.8], yaw, { tex: it.roofTex ?? tex, color: color.map((v) => v * 0.9) });
    solidBox(ctx, cx, cz, baseY + H + 0.6, [w * 0.82, 0.5, d * 0.82], yaw, { tex: it.roofTex ?? tex, color });
    if (it.comb) solidBox(ctx, cx, cz, baseY + H + 1.1, [w * 0.6, it.comb, 0.6], yaw, { tex: it.roofTex ?? tex, color: color.map((v) => v * 0.95) });
  }
  const debris = Math.round(dmg * (w + d) * (it.debris ?? 3));
  for (let i = 0; i < debris; i++) {
    const lx = (rand() - 0.5) * (w + 4), lz = (rand() - 0.5) * (d + 4);
    const [x, z] = local(it.pos, yaw, lx, lz);
    const s = 0.3 + rand() * 0.7;
    const y = ctx.colliders.heightAt(x, z);
    ctx.builder.box([x, y + s * 0.25, z], [s * (1 + rand()), s * 0.7, s * (0.8 + rand() * 0.6)], {
      tex, color: jitterColor(color, rand, 0.12), yaw: rand() * 6.28, pitch: (rand() - 0.5) * 0.8, roll: (rand() - 0.5) * 0.8, seed: i,
    });
  }
}

function stepPyramid(ctx, it, rand) {
  const [bw, bd] = it.base, [tw, td] = it.top;
  const tiers = it.tiers ?? 4;
  const th = it.tierHeight ?? 3;
  const tex = it.tex ?? 'stone';
  const color = it.color ?? [1, 1, 1];
  const y0 = footprintTop(ctx, it.pos, bw, bd, 0) - 0.4;
  const [cx, cz] = it.pos;
  for (let i = 0; i < tiers; i++) {
    const t = tiers === 1 ? 0 : i / (tiers - 1);
    const w = bw + (tw - bw) * t, d = bd + (td - bd) * t;
    const yb = y0 + i * th;
    solidBox(ctx, cx, cz, yb - (i === 0 ? 2 : 0), [w, th + (i === 0 ? 2 : 0), d], 0, { tex, color: jitterColor(color, rand, 0.03), seed: i });
    ctx.builder.box([cx, yb + th - 0.2, cz], [w + 0.5, 0.4, d + 0.5], { tex: it.trimTex ?? 'stoneDark', color, seed: i + 9 });
  }
  const H = tiers * th;
  if (it.stairs) {
    const st = it.stairs;
    const yaw = DIRS[st.side ?? 'south'];
    const rise = st.rise ?? 0.4;
    const runTotal = Math.round(H / rise) * (st.run ?? rise);
    const topEdge = (st.side === 'east' || st.side === 'west' ? tw : td) / 2;
    const start = local(it.pos, yaw, 0, topEdge + runTotal);
    stairs(ctx, { start, yaw, width: st.width ?? 6, height: H, baseY: y0, rise, run: st.run ?? rise, inward: 4, tex: st.tex ?? tex, color: st.color ?? color });
    const len = Math.hypot(runTotal, H);
    const pitch = Math.atan2(H, runTotal);
    for (const s of [-1, 1]) {
      const [x, z] = local(it.pos, yaw, s * ((st.width ?? 6) / 2 + 0.55), topEdge + runTotal / 2);
      ctx.builder.box([x, y0 + H / 2 + 0.35, z], [1.1, 0.9, len], { yaw, pitch, tex: it.trimTex ?? 'stoneDark', color, tile: 3 });
    }
  }
  if (it.shrine) {
    building(ctx, { ...it.shrine, pos: it.pos, baseY: y0 + H, roof: true, damage: 0 }, rand);
  }
}

function platform(ctx, it, rand) {
  const [w, d] = it.size;
  const yaw = deg(it.yaw ?? 0);
  const y0 = footprintTop(ctx, it.pos, w, d, yaw) - 0.6;
  const top = y0 + 0.6 + it.height;
  const [cx, cz] = it.pos;
  solidBox(ctx, cx, cz, y0, [w, top - y0, d], yaw, { tex: it.tex ?? 'stone', color: it.color ?? [1, 1, 1], tile: it.tile ?? 3 });
  if (it.trim) ctx.builder.box([cx, top - 0.15, cz], [w + 0.3, 0.3, d + 0.3], { yaw, tex: 'stoneDark', color: it.color ?? [1, 1, 1] });
  for (const side of it.stairs ?? []) {
    const sy = yaw + DIRS[side];
    const edge = side === 'east' || side === 'west' ? w / 2 : d / 2;
    const rise = it.rise ?? 0.3;
    const runTotal = Math.round((top - y0 - 0.6) / rise) * rise * 1.2;
    const start = local(it.pos, sy, 0, edge + runTotal);
    stairs(ctx, { start, yaw: sy, width: it.stairWidth ?? 3, height: top - y0 - 0.6, baseY: y0 + 0.6, rise, run: rise * 1.2, inward: 1, tex: it.tex ?? 'stone', color: it.color ?? [1, 1, 1] });
  }
}

function fallenWall(ctx, it, rand) {
  const [x0, z0] = it.from, [x1, z1] = it.to;
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ax = (x1 - x0) / len, az = (z1 - z0) / len;
  const side = it.side ?? 1;
  const px = -az * side, pz = ax * side;
  const yaw = Math.atan2(-az, ax);
  const H = it.height ?? 3, th = it.thickness ?? 0.7;
  const tex = it.tex ?? 'stone', color = it.color ?? [1, 1, 1];
  let s = 0;
  while (s < len) {
    const L = Math.min(len - s, 1.2 + rand() * 2.2);
    const m = s + L / 2;
    const bx = x0 + ax * m, bz = z0 + az * m;
    const stub = 0.3 + rand() * 0.9;
    solidBox(ctx, bx, bz, ctx.colliders.heightAt(bx, bz) - 0.2, [L, stub + 0.2, th], yaw, { tex, color: jitterColor(color, rand), seed: s });
    if (rand() > 0.15) {
      const h = (H - stub) * (0.6 + rand() * 0.4);
      const off = stub + h / 2 + rand() * 0.6;
      const cx = bx + px * off, cz = bz + pz * off;
      const y = ctx.colliders.heightAt(cx, cz);
      ctx.builder.box([cx, y + th / 2 - 0.1, cz], [L * 0.95, th, h], { yaw: yaw + (rand() - 0.5) * 0.25, roll: (rand() - 0.5) * 0.12, pitch: (rand() - 0.5) * 0.1, tex, color: jitterColor(color, rand), seed: s + 3 });
      ctx.colliders.add(cx, cz, L / 2, h / 2, yaw, y - 0.2, y + th - 0.1);
    }
    s += L + rand() * 0.4;
  }
}

function rubble(ctx, it, rand) {
  const [cx, cz] = it.pos;
  const [smin, smax] = it.size ?? [0.2, 0.8];
  const color = it.color ?? [0.9, 0.86, 0.78];
  for (let i = 0; i < it.count; i++) {
    const r = it.radius * Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const s = smin + (smax - smin) * rand() ** 2;
    const y = ctx.colliders.heightAt(x, z);
    ctx.rocks.push({
      pos: [x, y + s * 0.2, z],
      scale: [s * (0.8 + rand() * 0.6), s * (0.5 + rand() * 0.4), s * (0.8 + rand() * 0.6)],
      rot: [rand() * 6.28, rand() * 6.28, rand() * 6.28],
      color: jitterColor(color, rand, 0.15),
      tex: it.tex ?? 'stone',
    });
  }
}

function crackPath(rand, x0, z0, x1, z1, wiggle) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(2, Math.round(len / 1.4));
  const px = -(z1 - z0) / len, pz = (x1 - x0) / len;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const j = i === 0 || i === n ? 0 : (rand() - 0.5) * wiggle;
    pts.push([x0 + (x1 - x0) * t + px * j, z0 + (z1 - z0) * t + pz * j, Math.sin(Math.PI * t) * 0.8 + 0.2]);
  }
  return pts;
}

function crack(ctx, it, rand) {
  const paths = [crackPath(rand, ...it.from, ...it.to, it.wiggle ?? 1.6)];
  for (let b = 0; b < (it.branches ?? 2); b++) {
    const main = paths[0];
    const p = main[1 + Math.floor(rand() * (main.length - 2))];
    const a = rand() * Math.PI * 2;
    const l = 3 + rand() * 6;
    paths.push(crackPath(rand, p[0], p[1], p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l, 1).map((q, i, arr) => [q[0], q[1], q[2] * 0.6 * (1 - i / arr.length) + 0.1]));
  }
  for (const path of paths) {
    const pts = path.map(([x, z, w]) => [x, ctx.colliders.heightAt(x, z), z, w]);
    ctx.builder.ribbon(pts, it.width ?? 1, { tex: 'char', color: [0.25, 0.2, 0.17], lift: 0.05 });
    ctx.builder.ribbon(pts, (it.width ?? 1) * 0.45, { tex: 'white', color: it.glow ? [1, 0.42, 0.12] : [0.05, 0.04, 0.035], emissive: it.glow ? 1 : 0, lift: 0.07 });
  }
}

function particles(ctx, { origins, params, ...mat }) {
  const g = new THREE.InstancedBufferGeometry();
  const quad = new THREE.PlaneGeometry(1, 1);
  g.index = quad.index;
  g.setAttribute('position', quad.getAttribute('position'));
  g.setAttribute('uv', quad.getAttribute('uv'));
  g.setAttribute('aOrigin', new THREE.InstancedBufferAttribute(new Float32Array(origins.flat()), 3));
  g.setAttribute('aParams', new THREE.InstancedBufferAttribute(new Float32Array(params.flat()), 3));
  g.instanceCount = origins.length;
  const mesh = new THREE.Mesh(g, ctx.particleMaterial(mat));
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
}

function smolder(ctx, it, rand) {
  const [cx, cz] = it.pos;
  const R = it.radius ?? 2;
  const y = ctx.colliders.heightAt(cx, cz);
  ctx.stains.push({ x: cx, z: cz, r: R * 2.2 });
  for (let i = 0; i < (it.logs ?? 4); i++) {
    const a = rand() * 6.28, r = rand() * R * 0.7;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    ctx.builder.box([x, ctx.colliders.heightAt(x, z) + 0.12, z], [0.3, 0.25, 1.2 + rand() * 1.5], { tex: 'char', color: [1, 0.55, 0.3], emissive: 0.5, yaw: rand() * 6.28, pitch: (rand() - 0.5) * 0.3 });
  }
  const embers = it.embers ?? 40;
  if (embers) {
    particles(ctx, {
      origins: Array.from({ length: embers }, () => { const a = rand() * 6.28, r = rand() * R; return [cx + Math.cos(a) * r, y + 0.1, cz + Math.sin(a) * r]; }),
      params: Array.from({ length: embers }, () => [1.2 + rand() * 2, rand(), 0.12 + rand() * 0.1]),
      map: 'glow', additive: true, colorA: [1, 0.7, 0.25], colorB: [0.8, 0.2, 0.05], rise: 0.9, drift: 0.8, grow: [1, 0.4],
    });
  }
  const smoke = it.smoke ?? 24;
  if (smoke) {
    const size = it.smokeSize ?? 2;
    particles(ctx, {
      origins: Array.from({ length: smoke }, () => [cx + (rand() - 0.5) * R, y + 0.5, cz + (rand() - 0.5) * R]),
      params: Array.from({ length: smoke }, () => [it.smokeLife ?? 9 + rand() * 4, rand(), size * (0.7 + rand() * 0.6)]),
      map: 'puff', colorA: it.smokeColor?.[0] ?? [0.16, 0.14, 0.13], colorB: it.smokeColor?.[1] ?? [0.42, 0.4, 0.38],
      rise: it.smokeRise ?? 1.6, drift: size * 0.6, grow: [0.6, 3], wind: it.wind ?? [0.5, 0, -0.2],
    });
  }
}

function deadTree(ctx, it, rand) {
  const [x, z] = it.pos;
  const y = ctx.colliders.heightAt(x, z);
  const up = new THREE.Vector3(0, 1, 0);
  const branch = (p, dir, len, thick, depth) => {
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const c = p.clone().addScaledVector(dir, len / 2);
    ctx.builder.box(c.toArray(), [thick, len, thick], { quat: q, tex: 'bark', color: [1, 1, 1], tile: 1.5 });
    const end = p.clone().addScaledVector(dir, len);
    if (depth <= 0) return;
    const kids = depth === 2 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const d = dir.clone().add(new THREE.Vector3((rand() - 0.5) * 1.6, rand() * 0.4, (rand() - 0.5) * 1.6)).normalize();
      const from = p.clone().addScaledVector(dir, len * (0.55 + rand() * 0.45));
      branch(i === 0 ? end : from, d, len * (0.45 + rand() * 0.25), thick * 0.6, depth - 1);
    }
  };
  const lean = deg(it.lean ?? 8);
  const a = rand() * 6.28;
  const dir = new THREE.Vector3(Math.sin(lean) * Math.cos(a), Math.cos(lean), Math.sin(lean) * Math.sin(a));
  branch(new THREE.Vector3(x, y - 0.3, z), dir, (it.height ?? 6) * 0.55, it.thickness ?? 0.5, it.fallen ? 0 : 2);
  ctx.colliders.add(x, z, 0.3, 0.3, 0, y - 1, y + 4);
}

function box(ctx, it, rand) {
  const [x, z] = it.pos;
  const y = ctx.colliders.heightAt(x, z) + (it.y ?? 0);
  const yaw = deg(it.yaw ?? 0);
  const opts = { tex: it.tex ?? 'stone', color: it.color ?? [1, 1, 1], pitch: deg(it.pitch ?? 0), roll: deg(it.roll ?? 0) };
  if (it.solid === false || it.pitch || it.roll) ctx.builder.box([x, y + it.size[1] / 2, z], it.size, { yaw, ...opts });
  else solidBox(ctx, x, z, y, it.size, yaw, opts);
}

function crowd(ctx, it, rand) {
  const [fx, fz] = it.focus;
  const types = Object.entries(it.types);
  const totalW = types.reduce((s, [, w]) => s + w, 0);
  const pal = it.palette;
  const cell = it.spacing ?? 0.6;
  const grid = new Map();
  const key = (x, z) => `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
  const crowded = (x, z) => {
    const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      for (const p of grid.get(`${gx + i},${gz + j}`) ?? []) if ((p[0] - x) ** 2 + (p[1] - z) ** 2 < cell * cell) return true;
    }
    return false;
  };
  let placed = 0;
  for (let tries = 0; placed < it.count && tries < it.count * 40; tries++) {
    const r = Math.sqrt(rand() * (it.rMax ** 2 - it.rMin ** 2) + it.rMin ** 2);
    const th = deg((it.arcCenter ?? 0) + (rand() - 0.5) * (it.arcWidth ?? 360));
    const x = fx + Math.sin(th) * r, z = fz + Math.cos(th) * r;
    if ((it.aisles ?? []).some((a) => {
      const ad = deg(a.angle);
      const along = (x - fx) * Math.sin(ad) + (z - fz) * Math.cos(ad);
      const perp = (x - fx) * Math.cos(ad) - (z - fz) * Math.sin(ad);
      return along > 0 && Math.abs(perp) < a.width / 2;
    })) continue;
    const ground = ctx.colliders.heightAt(x, z);
    if (ground - ctx.terrain(x, z) > (it.maxStep ?? 1)) continue;
    if (ctx.colliders.blocked(x, z, ground, 0.3, 1.8, 0.3)) continue;
    if (crowded(x, z)) continue;
    const k = key(x, z);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push([x, z]);
    placed++;

    let w = rand() * totalW, type = types[0][0];
    for (const [t, tw] of types) { if ((w -= tw) <= 0) { type = t; break; } }
    const spec = FIGURES[type];
    const height = spec.child ? 1 + rand() * 0.3 : 1.62 + rand() * 0.24;
    const facing = Math.atan2(fx - x, fz - z) + deg((rand() - 0.5) * (it.facingJitter ?? 30));
    const elderly = type === 'elder' || rand() < 0.08;
    ctx.people.push({
      type, pos: [x, ground, z], height, facing,
      robe: jitterColor(pick(pal.robe, rand), rand),
      cloak: jitterColor(pick(pal.cloak, rand), rand),
      skin: jitterColor(pick(pal.skin, rand), rand, 0.05),
      hair: elderly ? jitterColor(pal.grayHair ?? [0.5, 0.48, 0.45], rand) : jitterColor(pick(pal.hair, rand), rand),
    });
  }
}

function figure(ctx, it) {
  const [x, z] = it.pos;
  ctx.figures.push({
    type: it.figure, pos: [x, ctx.colliders.heightAt(x, z), z], height: it.height ?? 1.85, facing: deg(it.facing ?? 0),
    robe: it.colors.robe, cloak: it.colors.cloak, skin: it.colors.skin, hair: it.colors.hair, emissive: it.emissive ?? 0,
  });
}

// Surface under an effect: the top of whatever stands there, or the open ground if onGround.
function baseY(ctx, it) {
  const [x, z] = it.pos;
  return ctx.colliders.heightAt(x, z, it.onGround ? ctx.terrain(x, z) + 1 : Infinity) + (it.y ?? 0);
}

function lightShaft(ctx, it) {
  const [x, z] = it.pos;
  const y = baseY(ctx, it);
  const g = new THREE.CylinderGeometry(it.radiusTop, it.radiusBottom, it.height, 20, 1, true);
  g.translate(0, it.height / 2, 0);
  const mesh = new THREE.Mesh(g, ctx.shaftMaterial(it));
  mesh.position.set(x, y, z);
  mesh.renderOrder = 2;
  ctx.scene.add(mesh);
}

function lightRing(ctx, it) {
  const [x, z] = it.pos;
  const y = baseY(ctx, it) + 0.06;
  const size = (it.radius + 2) * 2;
  const g = new THREE.PlaneGeometry(size, size, 8, 8);
  const mesh = new THREE.Mesh(g, ctx.ringMaterial(it));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.renderOrder = 1;
  ctx.scene.add(mesh);
}

function halo(ctx, it) {
  const [x, z] = it.pos;
  const y = baseY(ctx, it);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: ctx.textures.glow, color: new THREE.Color(...it.color).multiplyScalar(it.intensity ?? 1),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false,
  }));
  s.position.set(x, y, z);
  s.scale.set(it.size, it.size * (it.stretch ?? 1), 1);
  s.renderOrder = 3;
  ctx.scene.add(s);
}

function motes(ctx, it, rand) {
  const [x, z] = it.pos;
  const y = baseY(ctx, it);
  const n = it.count ?? 60;
  const speed = it.speed ?? -1.5;
  const life = it.height / Math.abs(speed);
  particles(ctx, {
    origins: Array.from({ length: n }, () => {
      const a = rand() * 6.28, r = it.radius * Math.sqrt(rand());
      return [x + Math.cos(a) * r, speed < 0 ? y + it.height : y, z + Math.sin(a) * r];
    }),
    params: Array.from({ length: n }, () => [life * (0.7 + rand() * 0.6), rand(), it.size ?? 0.25]),
    map: 'glow', additive: true, colorA: it.color, colorB: it.colorEnd ?? it.color, rise: speed, drift: it.drift ?? 0.6, grow: [1, 0.6],
  });
}

function glowLight(ctx, it) {
  const [x, z] = it.pos;
  ctx.shared.uGlowPos.value.set(x, baseY(ctx, it), z, it.radius);
  ctx.shared.uGlowColor.value.setRGB(...it.color);
}

// Phase 0 builds things others stand on; phase 1 places things on top of them.
export const KINDS = {
  stepPyramid: [0, stepPyramid],
  platform: [0, platform],
  building: [0, building],
  ruin: [0, building],
  fallenWall: [0, fallenWall],
  box: [0, box],
  deadTree: [1, deadTree],
  rubble: [1, rubble],
  crack: [1, crack],
  smolder: [1, smolder],
  crowd: [1, crowd],
  figure: [1, figure],
  lightShaft: [1, lightShaft],
  lightRing: [1, lightRing],
  halo: [1, halo],
  motes: [1, motes],
  glowLight: [1, glowLight],
};

