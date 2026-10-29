import { rng, fbm2, noise2, hash3, range, pick } from './noise.js';

// Every builder takes the world, a plain data item from scene.js (meters), and a shared context.
// Positions: x east, z south, y up. Sizes in meters.

const blockOf = (w, v, rand) => w.id(Array.isArray(v) ? pick(v, rand) : v);

function columnRect(w, x, z, width, depth) {
  return {
    x0: w.ix(x - width / 2), x1: w.ix(x + width / 2) - 1,
    z0: w.iz(z - depth / 2), z1: w.iz(z + depth / 2) - 1,
  };
}

function raiseColumn(w, x, z, top, id, sub) {
  for (let y = 0; y < top; y++) w.set(x, y, z, y === top - 1 ? id : sub);
  for (let y = top; y < w.sy; y++) w.set(x, y, z, 0);
  if (x >= 0 && z >= 0 && x < w.sx && z < w.sz) w.ground[z * w.sx + x] = top;
}

export const builders = {
  terrain(w, o) {
    const surface = w.id(o.surface), sub = w.id(o.sub), deep = w.id(o.deep);
    const patches = (o.patches ?? []).map((p) => ({ ...p, id: w.id(p.block) }));
    for (let z = 0; z < w.sz; z++) {
      for (let x = 0; x < w.sx; x++) {
        const xm = w.wx(x), zm = w.wz(z);
        let h = o.base + (fbm2(xm / o.scale, zm / o.scale, 4, o.seed ?? 1) - 0.5) * 2 * o.amp;
        const r = Math.hypot(xm, zm);
        if (o.rim && r > o.rim.from) h += Math.pow(Math.min(1, (r - o.rim.from) / (w.half - o.rim.from)), 2) * o.rim.height
          * (0.6 + 0.8 * noise2(xm / 9, zm / 9, 3));
        for (const b of o.bumps ?? []) {
          const d = Math.hypot(xm - b.x, zm - b.z) / b.r;
          if (d < 1) h += b.h * 0.5 * (1 + Math.cos(Math.PI * d));
        }
        const top = Math.max(1, Math.round(h / w.vs));
        let id = surface;
        for (const p of patches) if (fbm2(xm / p.scale, zm / p.scale, 3, p.seed ?? 9) > p.above) id = p.id;
        for (let y = 0; y < top; y++) w.data[(y * w.sz + z) * w.sx + x] = y === top - 1 ? id : y > top - 4 ? sub : deep;
        w.ground[z * w.sx + x] = top;
      }
    }
  },

  // Level a rectangle to a height and lay flagstones in a two-tone tile pattern.
  pave(w, o) {
    const { x0, x1, z0, z1 } = columnRect(w, o.x, o.z, o.w, o.d);
    const top = Math.round(o.y / w.vs);
    const a = w.id(o.block), b = w.id(o.alt ?? o.block), sub = w.id(o.sub ?? o.block);
    const tile = o.tile ?? 3;
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
      const t = hash3(Math.floor(x / tile), 7, Math.floor(z / tile));
      raiseColumn(w, x, z, top, t > 0.55 ? b : a, sub);
    }
  },

  stepPyramid(w, o, ctx) {
    const rand = rng(o.seed ?? 3);
    const cx = w.ix(o.x), cz = w.iz(o.z);
    const y0 = w.groundAt(cx, cz);
    const body = w.id(o.block), trim = w.id(o.trim), stair = w.id(o.stairs.block);
    const th = Math.round(o.tierHeight / w.vs);
    const inset = Math.round(o.inset / w.vs);
    const half0 = Math.round(o.size / 2 / w.vs);
    for (let t = 0; t < o.tiers; t++) {
      const h = half0 - inset * t;
      for (let k = 0; k < th; k++) {
        const y = y0 + t * th + k;
        const shrink = k === 0 ? 0 : Math.floor((k / th) * (o.batter ?? 0));
        w.fill(cx - h + shrink, y, cz - h + shrink, cx + h - 1 - shrink, y, cz + h - 1 - shrink, k === th - 1 ? trim : body);
      }
    }
    const topY = y0 + o.tiers * th;
    const topHalf = half0 - inset * (o.tiers - 1);
    const sw = Math.round(o.stairs.width / 2 / w.vs);
    const rise = topY - y0;
    for (let k = 0; k < rise; k++) {
      const z = cz + topHalf - 1 + k;
      const h = topY - k;
      w.fill(cx - sw, y0, z, cx + sw - 1, h - 1, z, stair);
      w.fill(cx - sw - 2, y0, z, cx - sw - 1, h, z, trim);
      w.fill(cx + sw, y0, z, cx + sw + 1, h, z, trim);
    }
    if (o.shrine) {
      const s = o.shrine;
      const hw = Math.round(s.w / 2 / w.vs), hd = Math.round(s.d / 2 / w.vs), sh = Math.round(s.h / w.vs);
      const sb = w.id(s.block), dark = w.id(s.inner ?? s.block);
      const dz = cz - Math.round((o.shrineBack ?? 0) / w.vs);
      w.fill(cx - hw, topY, dz - hd, cx + hw - 1, topY + sh - 1, dz + hd - 1, sb);
      w.fill(cx - hw + 1, topY, dz - hd + 1, cx + hw - 2, topY + sh - 2, dz + hd - 2, 0);
      w.fill(cx - hw + 1, topY - 1, dz - hd + 1, cx + hw - 2, topY - 1, dz + hd - 2, dark);
      const door = Math.round(s.door / 2 / w.vs);
      w.fill(cx - door, topY, dz + hd - 1, cx + door - 1, topY + sh - 3, dz + hd - 1, 0);
      w.fill(cx - hw - 1, topY + sh - 1, dz - hd - 1, cx + hw, topY + sh - 1, dz + hd, trim);
      if (s.comb) {
        const ch = Math.round(s.comb / w.vs);
        for (let y = 0; y < ch; y++) for (let x = cx - hw + 2; x < cx + hw - 2; x++) {
          const hole = (y % 3 === 1) && ((x - cx + 64) % 3 === 1);
          if (!hole) w.set(x, topY + sh + y, dz, sb);
        }
      }
    }
    const rubble = w.id(o.damage?.rubble ?? o.block);
    for (let i = 0; i < (o.damage?.bites ?? 0); i++) {
      const t = Math.floor(rand() * o.tiers);
      const h = half0 - inset * t;
      const sx = rand() < 0.5 ? -1 : 1, sz = rand() < 0.5 ? -1 : 1;
      const along = rand() < 0.5;
      const bx = cx + (along ? Math.round((rand() * 2 - 1) * h * 0.8) : sx * h);
      const bz = cz + (along ? sz * h : Math.round((rand() * 2 - 1) * h * 0.8));
      if (Math.abs(bx - cx) < sw + 4 && bz > cz) continue;
      const by = y0 + t * th + th;
      const r = 2 + rand() * 3;
      carveSphere(w, bx, by, bz, r);
      spill(w, bx + sx * Math.round(r + 2), bz + sz * Math.round(r + 2), r * 1.6, Math.round(r * 6), rubble, rand);
    }
    const cracked = w.id(o.damage?.stain ?? o.trim);
    for (let i = 0; i < (o.damage?.stains ?? 0); i++) {
      const x = cx + Math.round((rand() * 2 - 1) * half0), z = cz + Math.round((rand() * 2 - 1) * half0);
      let y = w.surface(x, z) - 1;
      for (let k = 0; k < 2 + rand() * 6 && y > y0; k++, y--) if (w.get(x, y, z)) w.set(x, y, z, cracked);
    }
  },

  // Square stepped platform, the raised place for a central figure.
  platform(w, o) {
    const cx = w.ix(o.x), cz = w.iz(o.z);
    let y = w.groundAt(cx, cz);
    for (const step of o.steps) {
      const h = Math.round(step.size / 2 / w.vs), n = Math.round(step.h / w.vs);
      w.fill(cx - h, y, cz - h, cx + h - 1, y + n - 1, cz + h - 1, w.id(step.block ?? o.block));
      y += n;
    }
  },

  ruin(w, o, ctx) {
    const rand = rng(o.seed ?? Math.floor(o.x * 13 + o.z * 7));
    const { x0, x1, z0, z1 } = columnRect(w, o.x, o.z, o.w, o.d);
    const id = blockOf(w, o.block, rand), alt = w.id(o.alt ?? o.block);
    const maxH = Math.round(o.h / w.vs);
    const seed = Math.floor(rand() * 1000);
    let floor = w.groundAt(Math.floor((x0 + x1) / 2), Math.floor((z0 + z1) / 2));
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
      const edge = x === x0 || x === x1 || z === z0 || z === z1;
      if (!edge) continue;
      const n = noise2(x * 0.35, z * 0.35, seed);
      if (n < (o.gaps ?? 0.28)) continue;
      const h = Math.round(maxH * Math.min(1, (n - 0.2) * 1.5) * (0.6 + 0.4 * rand()));
      const g = w.surface(x, z);
      for (let y = g; y < Math.max(g, floor) + h; y++) w.set(x, y, z, hash3(x, y, z) < 0.25 ? alt : id);
    }
    const rubble = w.id(o.rubble ?? o.block);
    spill(w, Math.round((x0 + x1) / 2), Math.round((z0 + z1) / 2), Math.max(x1 - x0, z1 - z0) * 0.7, Math.round((x1 - x0) * (z1 - z0) * 0.12), rubble, rand);
  },

  wall(w, o) {
    const rand = rng(o.seed ?? 11);
    const id = blockOf(w, o.block, rand);
    const ox = o.x ?? 0, oz = o.z ?? 0;
    const x1 = o.x1 + ox, z1 = o.z1 + oz, x2 = o.x2 + ox, z2 = o.z2 + oz;
    const len = Math.hypot(x2 - x1, z2 - z1);
    const steps = Math.ceil(len / (w.vs * 0.5));
    const maxH = Math.round(o.h / w.vs);
    const seed = Math.floor(rand() * 999);
    const nx = -(z2 - z1) / len, nz = (x2 - x1) / len;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const xm = x1 + (x2 - x1) * t, zm = z1 + (z2 - z1) * t;
      const x = w.ix(xm), z = w.iz(zm);
      const n = noise2(t * len * 0.6, 0, seed);
      const g = w.surface(x, z);
      if (o.toppled) {
        w.set(x, g, z, id);
        if (n < 0.35) continue;
        const fall = Math.round(maxH * (0.5 + n * 0.5));
        for (let k = 1; k < fall; k++) {
          if (noise2(t * len * 0.8, k * 0.7, seed + 5) < 0.3) continue;
          const fx = w.ix(xm + nx * k * w.vs), fz = w.iz(zm + nz * k * w.vs);
          w.set(fx, w.surface(fx, fz), fz, id);
        }
      } else {
        const h = n < 0.25 ? 1 : Math.round(maxH * Math.min(1, n * 1.3));
        for (let y = g; y < g + h; y++) w.set(x, y, z, id);
      }
    }
  },

  rubble(w, o) {
    const rand = rng(o.seed ?? 5);
    spill(w, w.ix(o.x), w.iz(o.z), o.r / w.vs, o.count, w.id(o.block), rand, o.big);
  },

  crack(w, o) {
    const rand = rng(o.seed ?? 17);
    const edge = w.id(o.edge), bottom = w.id(o.bottom), glow = o.glow ? w.id(o.glow) : 0;
    const walk = (x, z, ang, len, width) => {
      const step = w.vs * 0.7;
      for (let s = 0; s < len; s += step) {
        ang += (rand() - 0.5) * (o.wander ?? 0.5);
        x += Math.sin(ang) * step; z += Math.cos(ang) * step;
        const wv = Math.max(0, Math.round((width * (1 - s / len * 0.7)) / w.vs / 2));
        const depth = Math.round(o.depth / w.vs);
        for (let a = -wv; a <= wv; a++) {
          const ix = w.ix(x + Math.cos(ang) * a * w.vs), iz = w.iz(z - Math.sin(ang) * a * w.vs);
          const g = w.surface(ix, iz);
          const d = Math.max(2, Math.round(depth * (1 - Math.abs(a) / (wv + 1)) * (0.6 + 0.4 * rand())));
          for (let y = g - d; y < g; y++) w.set(ix, y, iz, 0);
          w.set(ix, g - d - 1, iz, glow && rand() < (o.glowChance ?? 0.2) ? glow : bottom);
        }
        for (const side of [-1, 1]) {
          if (rand() > 0.35) continue;
          const off = (wv + 1) * side * w.vs;
          const ix = w.ix(x + Math.cos(ang) * off), iz = w.iz(z - Math.sin(ang) * off);
          const g = w.surface(ix, iz);
          w.set(ix, g, iz, edge);
        }
        if (width > w.vs * 1.2 && rand() < (o.branch ?? 0.03)) walk(x, z, ang + (rand() < 0.5 ? -1 : 1) * (0.6 + rand() * 0.6), len * 0.35, width * 0.5);
      }
    };
    walk(o.x, o.z, (o.angle ?? 0) * Math.PI / 180, o.length, o.width ?? 1);
  },

  fire(w, o, ctx) {
    const rand = rng(o.seed ?? Math.floor(o.x * 3 + o.z * 5 + 99));
    const cx = w.ix(o.x), cz = w.iz(o.z), r = o.r / w.vs;
    const scorch = (o.scorch ?? ['charcoal', 'ash']).map((b) => w.id(b));
    const ember = w.id(o.ember ?? 'ember'), log = w.id(o.log ?? 'charredWood');
    for (let z = Math.floor(cz - r); z <= cz + r; z++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const d = Math.hypot(x - cx, z - cz) / r;
      if (d > 1 || rand() < d * 0.6) continue;
      const g = w.surface(x, z);
      if (g > 0) w.set(x, g - 1, z, pick(scorch, rand));
    }
    const g = w.surface(cx, cz);
    const pile = Math.max(2, Math.round(r * 0.45));
    for (let i = 0; i < pile * pile * 2; i++) {
      const x = cx + Math.round((rand() * 2 - 1) * pile), z = cz + Math.round((rand() * 2 - 1) * pile);
      const top = w.surface(x, z, g + 3);
      if (top > g + 1) continue;
      w.set(x, top, z, rand() < (o.glow ?? 0.45) ? ember : log);
    }
    ctx.emitters.push({ x: o.x, y: (g + 1) * w.vs, z: o.z, rate: o.smoke ?? 1 });
  },

  tree(w, o) {
    const rand = rng(o.seed ?? Math.floor(o.x * 7 + o.z * 3 + 1));
    const trunk = w.id(o.trunk), x = w.ix(o.x), z = w.iz(o.z);
    const h = Math.round(o.h / w.vs);
    let g = w.surface(x, z);
    for (let y = 0; y < h; y++) w.set(x, g + y, z, trunk);
    const branches = o.branches ?? 3;
    for (let b = 0; b < branches; b++) {
      const ang = rand() * Math.PI * 2, len = 2 + Math.floor(rand() * 4);
      let by = g + Math.floor(h * (0.5 + rand() * 0.4));
      for (let k = 1; k <= len; k++) {
        const bx = x + Math.round(Math.cos(ang) * k), bz = z + Math.round(Math.sin(ang) * k);
        if (k % 2 === 0) by++;
        w.set(bx, by, bz, trunk);
      }
    }
    if (o.leaves) {
      const leaves = w.id(o.leaves), r = (o.crown ?? 2.5) / w.vs, top = g + h;
      for (let dy = -r; dy <= r * 0.7; dy++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        const d = Math.hypot(dx, dy * 1.4, dz) / r;
        if (d < 1 && hash3(x + dx, top + dy, z + dz) > d * 0.6) w.set(x + dx, top + dy, z + dz, leaves);
      }
    }
  },

  // Place `count` copies of `item`, resolving [min, max] ranges per copy.
  scatter(w, o, ctx) {
    const rand = rng(o.seed ?? 23);
    const placed = [];
    let tries = 0;
    while (placed.length < o.count && tries++ < o.count * 60) {
      const ang = rand() * Math.PI * 2;
      const r = o.region.rmin + Math.sqrt(rand()) * (o.region.rmax - o.region.rmin);
      const x = (o.region.x ?? 0) + Math.sin(ang) * r, z = (o.region.z ?? 0) + Math.cos(ang) * r;
      if ((o.avoid ?? []).some((a) => inArea(a, x, z))) continue;
      if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < (o.spacing ?? 0))) continue;
      placed.push({ x, z });
      const item = { x, z, seed: Math.floor(rand() * 1e6) };
      for (const [k, v] of Object.entries(o.item)) {
        item[k] = range(v, rand);
      }
      builders[item.type](w, item, ctx);
    }
  },
};

export function inArea(a, x, z) {
  if (a.r !== undefined) return Math.hypot(x - a.x, z - a.z) < a.r;
  return x > a.x0 && x < a.x1 && z > a.z0 && z < a.z1;
}

function carveSphere(w, cx, cy, cz, r) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let z = Math.floor(cz - r); z <= cz + r; z++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++)
        if (Math.hypot(x - cx, (y - cy) * 1.3, z - cz) < r * (0.7 + 0.3 * hash3(x, y, z))) w.set(x, y, z, 0);
}

function spill(w, cx, cz, r, count, id, rand, big = 0.3) {
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
    const x = Math.round(cx + Math.cos(a) * d), z = Math.round(cz + Math.sin(a) * d);
    const size = rand() < big ? 2 : 1;
    for (let dz = 0; dz < size; dz++) for (let dx = 0; dx < size; dx++) {
      const g = w.surface(x + dx, z + dz);
      if (g - w.groundAt(x + dx, z + dz) > 3) continue;
      w.set(x + dx, g, z + dz, id);
      if (size === 2 && rand() < 0.3) w.set(x + dx, g + 1, z + dz, id);
    }
  }
}

export function build(world, list, ctx) {
  for (const item of list) {
    const fn = builders[item.type];
    if (!fn) throw new Error(`Unknown builder "${item.type}"`);
    fn(world, item, ctx);
  }
}
