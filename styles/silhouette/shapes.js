export const TAU = Math.PI * 2;

export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(i, seed = 0) {
  let h = Math.imul(i ^ Math.imul(seed, 374761393), 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vnoise(x, seed) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u;
}

export function fbm(x, seed, octaves = 3, ridge = false) {
  let sum = 0, norm = 0, amp = 1, freq = 1;
  for (let o = 0; o < octaves; o++) {
    let n = vnoise(x * freq, seed + o * 31);
    if (ridge) n = 1 - Math.abs(n * 2 - 1);
    sum += n * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / norm;
}

// Builds silhouette paths. Every solid winds clockwise on screen and every hole
// counter-clockwise, so a whole layer fills in one nonzero pass: overlapping
// solids merge and holes stay open, even when some elements are mirrored.
export class Pen {
  constructor(ctx) {
    this.ctx = ctx;
    this.f = 1;
  }

  poly(p, hole = false) {
    const n = p.length;
    let area = 0;
    for (let i = 0; i < n; i += 2) {
      const j = (i + 2) % n;
      area += p[i] * p[j + 1] - p[j] * p[i + 1];
    }
    const c = this.ctx;
    if (area * this.f > 0 === !hole) {
      c.moveTo(p[0], p[1]);
      for (let i = 2; i < n; i += 2) c.lineTo(p[i], p[i + 1]);
    } else {
      c.moveTo(p[n - 2], p[n - 1]);
      for (let i = n - 4; i >= 0; i -= 2) c.lineTo(p[i], p[i + 1]);
    }
    c.closePath();
  }

  circle(x, y, r, hole = false) {
    this.ctx.moveTo(x + r, y);
    this.ctx.arc(x, y, r, 0, TAU, this.f < 0 !== hole);
  }

  ellipse(x, y, rx, ry, rot = 0, hole = false) {
    this.ctx.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
    this.ctx.ellipse(x, y, rx, ry, rot, 0, TAU, this.f < 0 !== hole);
  }

  rect(x, y, w, h, hole = false) {
    this.poly([x, y, x + w, y, x + w, y + h, x, y + h], hole);
  }

  limb(x1, y1, x2, y2, w1, w2 = w1) {
    const dx = x2 - x1, dy = y2 - y1;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    this.poly([
      x1 + nx * w1 / 2, y1 + ny * w1 / 2, x2 + nx * w2 / 2, y2 + ny * w2 / 2,
      x2 - nx * w2 / 2, y2 - ny * w2 / 2, x1 - nx * w1 / 2, y1 - ny * w1 / 2,
    ]);
    this.circle(x2, y2, w2 / 2);
  }

  rotRect(cx, cy, w, h, a) {
    const c = Math.cos(a), s = Math.sin(a);
    const pts = [];
    for (const [x, y] of [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]) {
      pts.push(cx + x * c - y * s, cy + x * s + y * c);
    }
    this.poly(pts);
  }
}

// People. Local units: feet at y=0, up is negative, an adult stands about 150 tall.
// Side-profile poses face +x; the engine mirrors them toward the focus.

function adult(P, g) {
  const w = g.w;
  P.poly([-8 * w, -128, 8 * w, -128, 18 * w, -121, 21 * w, -104, 19 * w, -80, 17 * w, -58,
    20 * w, -28, 25 * w, 0, -25 * w, 0, -20 * w, -28, -17 * w, -58, -19 * w, -80, -21 * w, -104, -18 * w, -121]);
  P.circle(1, -139, 10.5);
  if (g.hood) P.poly([-12, -137, -10, -149, -2, -155, 7, -153, 13, -145, 14, -133, 19 * w, -118, -19 * w, -118]);
  if (g.staff) {
    P.rect(23 * w, -172, 3.5, 172);
    P.circle(24.5 * w, -112, 4.5);
  }
  if (g.arms === 'raise') {
    P.limb(14 * w, -118, 30, -170, 8, 6);
    P.limb(-14 * w, -118, -28, -170, 8, 6);
  } else if (g.arms === 'reach') {
    P.limb(15 * w, -116, 46, -140, 8, 6);
  }
  if (g.carry) {
    P.circle(0, -189, 8);
    P.poly([-9, -179, 9, -179, 11, -158, -11, -158]);
    P.limb(-8, -160, -13, -136, 6, 5);
    P.limb(8, -160, 13, -136, 6, 5);
  }
}

function woman(P, g) {
  const w = g.w;
  P.poly([-7 * w, -125, 7 * w, -125, 16 * w, -118, 18 * w, -100, 15 * w, -80, 14 * w, -62,
    19 * w, -30, 27 * w, 0, -27 * w, 0, -19 * w, -30, -14 * w, -62, -15 * w, -80, -18 * w, -100, -16 * w, -118]);
  P.circle(0, -135, 9.5);
  P.poly([3, -148, 11, -141, 12, -130, 7, -123, -6, -116, -18, -96, -22, -98, -16, -122, -12, -140, -5, -147]);
  if (g.babe) P.ellipse(13, -104, 9, 12, -0.4);
  if (g.arms === 'raise') {
    P.limb(12 * w, -114, 26, -160, 7, 5);
  }
}

function child(P, g) {
  P.circle(0, -78, 8.5);
  P.poly([-6, -71, 6, -71, 12, -64, 13, -42, 15, -30, -15, -30, -13, -42, -12, -64]);
  P.rect(-8, -31, 6, 31);
  P.rect(2, -31, 6, 31);
  if (g.arms) P.limb(10, -63, 20, -92, 5, 4);
}

function kneel(P) {
  P.circle(6, -96, 10);
  P.poly([-2, -86, 12, -86, 18, -70, 20, -50, 22, -38, 38, -30, 42, -4, 40, 0, -24, 0, -27, -10,
    -20, -28, -16, -56, -12, -78]);
  P.limb(14, -72, 28, -84, 6, 5);
}

function bow(P) {
  P.poly([-32, 0, -34, -12, -26, -30, -10, -42, 6, -44, 20, -36, 32, -22, 40, -10, 46, -2, 46, 0]);
  P.circle(47, -10, 9);
}

const people = { adult, woman, child, kneel, bow };

export function person(P, g) {
  people[g.kind](P, g);
}

export function christ(P) {
  P.poly([-7, -150, 7, -150, 19, -143, 26, -128, 36, -112, 46, -98, 44, -92, 32, -100, 22, -106,
    21, -88, 22, -60, 27, -28, 31, 0, -31, 0, -27, -28, -22, -60, -21, -88, -22, -106, -32, -100,
    -44, -92, -46, -98, -36, -112, -26, -128, -19, -143]);
  P.ellipse(0, -163, 10, 12.5);
  P.circle(46, -95, 4.5);
  P.circle(-46, -95, 4.5);
}

// The walker. ph is the walk-cycle phase, m is 0 when standing and 1 when walking.
export function walker(P, ph, m) {
  const bob = -Math.abs(Math.sin(ph)) * 3 * m;
  for (const off of [0, Math.PI]) {
    const a = Math.sin(ph + off) * 0.5 * m;
    const bend = Math.max(0, Math.sin(ph + off + Math.PI / 2)) * 0.8 * m;
    const kx = Math.sin(a) * 34, ky = -72 + bob + Math.cos(a) * 34;
    const sa = a - bend;
    const ax = kx + Math.sin(sa) * 34, ay = ky + Math.cos(sa) * 34;
    P.limb(0, -72 + bob, kx, ky, 11, 9);
    P.limb(kx, ky, ax, ay, 9, 7);
    P.limb(ax - 2, ay, ax + 11, ay + 1, 6, 5);
  }
  P.poly([-9, -126 + bob, 9, -126 + bob, 17, -118 + bob, 18, -96 + bob, 16, -80 + bob, 21, -58 + bob,
    -19, -58 + bob, -16, -80 + bob, -18, -96 + bob, -17, -118 + bob]);
  const cl = Math.sin(ph * 0.5) * 4 * m - 8 * m;
  P.poly([8, -146 + bob, 13, -136 + bob, 8, -124 + bob, -10, -118 + bob, -22, -96 + bob, -30 + cl, -70 + bob,
    -17, -74 + bob, -15, -104 + bob, -12, -136 + bob, -2, -149 + bob]);
  P.circle(3, -138 + bob, 10.5);
  for (const off of [0, Math.PI]) {
    const a = -Math.sin(ph + off) * 0.45 * m;
    const ex = Math.sin(a) * 26, ey = -114 + bob + Math.cos(a) * 26;
    const hx = ex + Math.sin(a + 0.3 * m) * 24, hy = ey + Math.cos(a + 0.3 * m) * 24;
    P.limb(2, -114 + bob, ex, ey, 8, 7);
    P.limb(ex, ey, hx, hy, 7, 6);
  }
}

// Structures and debris. Each receives the item data and a seeded random source.

function stairRamp(P, x0, x1, y1, steps) {
  const pts = [x0, 0];
  const dx = (x1 - x0) / steps, dy = y1 / steps;
  for (let i = 0; i < steps; i++) {
    pts.push(x0 + dx * i, dy * (i + 1), x0 + dx * (i + 1), dy * (i + 1));
  }
  pts.push(x1, 0);
  P.poly(pts);
}

function temple(P, it, R) {
  const n = it.tiers ?? 6, bw = it.w ?? 600, th = it.tierH ?? 46, tw = it.topW ?? 200;
  const top = -n * th;
  for (let i = 0; i < n; i++) {
    const w = bw + (tw - bw) * (i / (n - 1));
    const y0 = -i * th, y1 = y0 - th, ins = 10;
    if (R() < (it.damage ?? 0.3) && i > 0) {
      const s = R() < 0.5 ? 1 : -1;
      const pts = [-w / 2 * s, y0, w / 2 * s, y0, (w / 2 - 4) * s, y0 - th * 0.35,
        (w / 2 - 26) * s, y0 - th * 0.5, (w / 2 - 34) * s, y1 + 6, (-w / 2 + ins) * s, y1 + 6];
      P.poly(pts);
      P.rect(-w / 2 + ins - 5 + (s < 0 ? 40 : 0), y1, w - 2 * ins - 30, 7);
    } else {
      P.poly([-w / 2, y0, w / 2, y0, w / 2 - ins, y1 + 6, -w / 2 + ins, y1 + 6]);
      P.rect(-w / 2 + ins - 5, y1, w - 2 * ins + 10, 7);
    }
    if (i < n - 1 && R() < 0.6) {
      const cx = w * (0.02 + R() * 0.2);
      const cy = y0 - th * (0.3 + R() * 0.3);
      const pts = [];
      let x = cx, y = cy;
      for (let j = 0; j < 5; j++) {
        pts.push(x, y);
        x += 6 + R() * 10;
        y += (R() - 0.5) * 12;
        x = Math.min(x, w / 2 - 40);
        y = Math.max(y1 + 12, Math.min(y0 - 6, y));
      }
      for (let j = pts.length - 2; j >= 0; j -= 2) pts.push(pts[j] - 1, pts[j + 1] + 3);
      P.poly(pts, true);
    }
  }
  stairRamp(P, -bw / 2 - (it.ramp ?? 110), -tw / 2 + 4, top, n * 4);
  const sw = it.shrineW ?? tw * 0.78, sh = it.shrineH ?? 80;
  P.rect(-sw / 2, top - sh, sw, sh + 2);
  for (const dx of [-0.3, 0, 0.3]) {
    const dw = sw * 0.13;
    P.rect(sw * dx - dw / 2, top - sh * 0.66, dw, sh * 0.66 - 4, true);
  }
  P.rect(-sw / 2 - 10, top - sh - 10, sw + 20, 12);
  const rc = it.comb ?? 70, cw = sw * 0.62;
  P.rect(-cw / 2, top - sh - 10 - rc, cw, rc + 2);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const hw = cw / 4;
      P.rect(-cw / 2 + c * hw + hw * 0.25, top - sh - 10 - rc + 8 + r * (rc / 2 - 2), hw * 0.5, rc / 2 - 14, true);
    }
  }
  rubble(P, R, bw * 0.55, 0, 14, 26);
  rubble(P, R, -bw * 0.5, 0, 10, 22);
}

function platform(P, it) {
  const tiers = it.tiers ?? [[300, 22], [240, 22], [190, 22]];
  let y = 0;
  for (const [w, h] of tiers) {
    P.rect(-w / 2, y - h, w, h + 1);
    P.rect(-w / 2 - 4, y - h, w + 8, 4);
    y -= h;
  }
  stairRamp(P, -tiers[0][0] / 2 - 70, -tiers.at(-1)[0] / 2 + 2, y, tiers.length * 3);
}

function ruin(P, it, R) {
  const w = it.w ?? 220, h = it.h ?? 160, seg = 9;
  const side = it.side ?? (R() < 0.5 ? 1 : -1);
  const heights = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg;
    const fall = side > 0 ? 1 - u * 0.75 : 0.25 + u * 0.75;
    heights.push(h * fall * (0.72 + R() * 0.28));
  }
  const pts = [-w / 2, 0];
  for (let i = 0; i <= seg; i++) {
    const x = -w / 2 + (w * i) / seg;
    pts.push(x, -heights[i]);
    if (i < seg) pts.push(x + w / seg * (0.3 + R() * 0.4), -heights[i] * (0.82 + R() * 0.3));
  }
  pts.push(w / 2, 0);
  P.poly(pts);
  P.rect(-w / 2 - 6, -10, w + 12, 10);
  const nWin = Math.max(1, Math.floor(w / 70));
  for (let i = 0; i < nWin; i++) {
    const cx = -w / 2 + (w * (i + 0.5)) / nWin;
    const u = (cx + w / 2) / w;
    const local = Math.min(heights[Math.floor(u * seg)], heights[Math.ceil(u * seg)]) * 0.82;
    const ww = Math.min(26, w / nWin * 0.4), wb = -h * 0.22, wt = -h * 0.6;
    if (-wt + ww * 0.5 + 10 > local) continue;
    const arch = [cx - ww / 2, wb, cx + ww / 2, wb, cx + ww / 2, wt];
    for (let a = 1; a < 6; a++) arch.push(cx + Math.cos((a / 6) * Math.PI) * ww / 2, wt - Math.sin((a / 6) * Math.PI) * ww / 2);
    arch.push(cx - ww / 2, wt);
    P.poly(arch, true);
  }
  rubble(P, R, side * w * 0.55, 0, 7, h * 0.12);
}

function column(P, it, R) {
  const h = it.h ?? 180, r = it.r ?? 13;
  P.rect(-r * 1.5, -14, r * 3, 14);
  if (it.broken !== false) {
    P.poly([-r, -12, r, -12, r, -h * (0.9 + R() * 0.1), r * 0.3, -h - R() * 14, -r * 0.3, -h * (0.88 + R() * 0.08), -r, -h * (0.95 + R() * 0.05)]);
  } else {
    P.rect(-r, -h, r * 2, h - 12);
    P.rect(-r * 1.6, -h - 14, r * 3.2, 14);
  }
}

function drums(P, it, R) {
  const n = it.n ?? 4, L = it.len ?? 44, r = it.r ?? 13;
  let x = -(n * (L + 6)) / 2;
  for (let i = 0; i < n; i++) {
    P.rotRect(x + L / 2, -r + 2, L, r * 2, (R() - 0.5) * 0.25);
    x += L + 4 + R() * 18;
  }
}

function rubble(P, R, cx, cy, count, size) {
  for (let i = 0; i < count; i++) {
    const s = size * (0.35 + R() * 0.8);
    const x = cx + (R() - 0.5) * size * 4;
    const pts = [];
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * TAU + R() * 0.5;
      const rr = 0.7 + R() * 0.4;
      pts.push(x + Math.cos(ang) * s * rr, Math.min(cy + 3, cy - s * 0.4 + Math.sin(ang) * s * 0.6 * rr));
    }
    P.poly(pts);
  }
}

function stones(P, it, R) {
  rubble(P, R, 0, 0, it.count ?? 8, it.size ?? 16);
}

function slab(P, it) {
  const w = it.w ?? 120, h = it.h ?? 50;
  P.rect(-w / 2, -h, w, h + 30);
}

function mound(P, it, R) {
  const w = it.w ?? 120, h = it.h ?? 40, pts = [w / 2, 4];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI;
    const r = 0.85 + R() * 0.3;
    pts.push(Math.cos(a) * w / 2 * r, -Math.sin(a) * h * r);
  }
  pts.push(-w / 2, 4);
  P.poly(pts);
  rubble(P, R, 0, 0, 5, h * 0.4);
}

function branch(P, R, x, y, ang, len, w, depth) {
  const ex = x + Math.sin(ang) * len, ey = y - Math.cos(ang) * len;
  P.limb(x, y, ex, ey, w, w * 0.66);
  if (depth <= 0) return;
  const n = R() < 0.3 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const spread = (i / (n - 1) - 0.5) * 1.2;
    branch(P, R, ex, ey, ang + spread + (R() - 0.5) * 0.5, len * (0.6 + R() * 0.2), w * 0.66, depth - 1);
  }
}

function palmCrown(P, R, tx, ty, fronds, broken) {
  for (let i = 0; i < fronds; i++) {
    const a = broken ? Math.PI * (0.35 + R() * 0.3) : -Math.PI / 2 + ((i / (fronds - 1)) - 0.5) * 3.9 + (R() - 0.5) * 0.3;
    const L = 75 + R() * 40, droop = broken ? 1.4 : 0.55 + R() * 0.5;
    const dx = Math.cos(a), dy = Math.sin(a);
    let qx = tx, qy = ty;
    for (let s = 1; s <= 12; s++) {
      const u = s / 12;
      const nx = tx + dx * L * u, ny = ty + dy * L * u + droop * L * u * u * 0.6;
      P.limb(qx, qy, nx, ny, 4 * (1 - u) + 1.5, 4 * (1 - u) + 1);
      const leaf = 24 * Math.sin(Math.PI * Math.min(1, u * 1.05)) + 3;
      const sa = Math.atan2(ny - qy, nx - qx);
      for (const side of [-1, 1]) {
        const la = sa + side * 1.0;
        P.poly([qx, qy, nx, ny, nx + Math.cos(la) * leaf, ny + Math.sin(la) * leaf + leaf * 0.55]);
      }
      qx = nx;
      qy = ny;
    }
  }
}

function tree(P, it, R) {
  const h = it.h ?? 220;
  if (it.kind === 'palm' || it.kind === 'brokenPalm') {
    const bend = (it.bend ?? 0.15) * h;
    const segs = 9, cut = it.kind === 'brokenPalm' ? 0.55 + R() * 0.2 : 1;
    let px = 0, py = 0;
    for (let i = 1; i <= segs * cut; i++) {
      const u = i / segs;
      const nx = bend * u * u, ny = -h * u;
      P.limb(px, py, nx, ny, 15 - 6 * u, 15 - 6 * u);
      px = nx;
      py = ny;
    }
    if (cut < 1) {
      P.poly([px - 6, py, px + 6, py, px + 3, py - 16, px, py - 6, px - 4, py - 20]);
      if (R() < 0.6) palmCrown(P, R, px, py, 4, true);
    } else {
      palmCrown(P, R, px, py, it.fronds ?? 9, false);
    }
  } else if (it.kind === 'bush') {
    for (let i = 0; i < 9; i++) P.circle((R() - 0.5) * h * 0.8, -h * (0.2 + R() * 0.4), h * (0.18 + R() * 0.15));
  } else {
    branch(P, R, 0, 0, (R() - 0.5) * 0.2, h * 0.38, h * 0.08, it.depth ?? 5);
  }
}

function city(P, it, R) {
  const w = it.w ?? 800;
  let x = -w / 2;
  while (x < w / 2) {
    const bw = 18 + R() * 50;
    const kind = R();
    const bh = (it.h ?? 90) * (0.25 + R() * 0.75);
    if (kind < 0.18) {
      for (let t = 0; t < 4; t++) P.rect(x + t * bw * 0.12, -bh * (t + 1) / 4, bw * (1 - t * 0.24), bh / 4 + 1);
    } else if (kind < 0.75) {
      const pts = [x, 0, x, -bh];
      const steps = 3 + Math.floor(R() * 4);
      for (let s = 1; s <= steps; s++) pts.push(x + (bw * s) / steps, -bh * (R() < 0.35 ? 0.45 + R() * 0.5 : 1));
      pts.push(x + bw, 0);
      P.poly(pts);
    } else if (kind < 0.85) {
      P.rect(x, -bh * 1.5, bw * 0.4, bh * 1.5);
    }
    x += bw + (R() < 0.3 ? R() * 40 : 0);
  }
}

function hut(P, it, R) {
  const w = it.w ?? 90, h = it.h ?? 50;
  P.rect(-w / 2, -h, w, h);
  if (it.burnt) {
    P.poly([-w / 2 - 10, -h, -w * 0.1, -h - h * 0.9, w * 0.05, -h - h * 0.4, w * 0.2, -h * 1.5, w / 2 + 6, -h]);
    P.rect(-w * 0.1, -h * 0.7, w * 0.18, h * 0.7 - 2, true);
  } else {
    P.poly([-w / 2 - 14, -h + 4, 0, -h - h * 1.1, w / 2 + 14, -h + 4]);
  }
}

function grass(P, it, R) {
  const n = it.n ?? 14, spread = it.spread ?? 80, hh = it.h ?? 40;
  for (let i = 0; i < n; i++) {
    const x = (R() - 0.5) * spread, h = hh * (0.4 + R() * 0.8), lean = (R() - 0.5) * h * 0.8;
    P.poly([x - 3, 2, x + 3, 2, x + lean, -h]);
  }
}

export const structures = { temple, platform, ruin, column, drums, stones, slab, mound, tree, city, hut, grass };
