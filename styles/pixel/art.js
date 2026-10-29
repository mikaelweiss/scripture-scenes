export const WHITE = [255, 255, 255];
export const OUTLINE = [34, 24, 22];
const SHADOW = [24, 18, 34];

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const tone = (c, f) => [clamp(Math.round(c[0] * f), 0, 255), clamp(Math.round(c[1] * f), 0, 255), clamp(Math.round(c[2] * f), 0, 255)];
export const mix = (a, b, t) => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function noise2(x, y, seed = 0, period = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const w = period ? (n) => ((n % period) + period) % period : (n) => n;
  const a = hash2(w(xi), w(yi), seed), b = hash2(w(xi + 1), w(yi), seed);
  const c = hash2(w(xi), w(yi + 1), seed), d = hash2(w(xi + 1), w(yi + 1), seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, y, seed = 0, octaves = 3, period = 0) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, y * freq, seed + i * 31, period * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

export class PixBuf {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  set(x, y, c, a = 1) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4, d = this.d;
    if (a >= 1 || d[i + 3] === 0) {
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
      d[i + 3] = a >= 1 ? 255 : a * 255;
      return;
    }
    d[i] += (c[0] - d[i]) * a;
    d[i + 1] += (c[1] - d[i + 1]) * a;
    d[i + 2] += (c[2] - d[i + 2]) * a;
    d[i + 3] += (255 - d[i + 3]) * a;
  }
  alpha(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  }
  get(x, y) {
    const i = (y * this.w + x) * 4;
    return [this.d[i], this.d[i + 1], this.d[i + 2]];
  }
  shade(x, y, f) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.set(x, y, tone(this.get(x, y), f));
  }
  toCanvas() {
    const cv = document.createElement('canvas');
    cv.width = this.w;
    cv.height = this.h;
    cv.getContext('2d').putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return cv;
  }
}

export function outline(buf, color = OUTLINE) {
  const marks = [];
  for (let y = 0; y < buf.h; y++)
    for (let x = 0; x < buf.w; x++)
      if (!buf.alpha(x, y) && (buf.alpha(x - 1, y) > 128 || buf.alpha(x + 1, y) > 128 || buf.alpha(x, y - 1) > 128 || buf.alpha(x, y + 1) > 128)) marks.push(x, y);
  for (let i = 0; i < marks.length; i += 2) buf.set(marks[i], marks[i + 1], color);
}

// Oblique (3/4) voxel projection: each ground cell rises as a column, drawn back to front.
function heightmap(w, d, maxH, height, color) {
  const H = new Int16Array(w * d);
  for (let gy = 0; gy < d; gy++) for (let gx = 0; gx < w; gx++) H[gy * w + gx] = height(gx, gy);
  const at = (gx, gy) => (gx < 0 || gy < 0 || gx >= w || gy >= d ? -1 : H[gy * w + gx]);
  const buf = new PixBuf(w + 2, d + maxH + 3);
  const ox = 1, oy = maxH + 1;
  for (let gy = 0; gy < d; gy++) {
    for (let gx = 0; gx < w; gx++) {
      const h = H[gy * w + gx];
      if (h < 0) continue;
      const sx = gx + ox, base = gy + oy, hl = at(gx - 1, gy), hr = at(gx + 1, gy);
      for (let z = 0; z < h; z++) {
        const e = (hl <= z ? 2 : 0) | (hr <= z ? 4 : 0) | (z === 0 ? 8 : 0);
        buf.set(sx, base - z, color(gx, gy, z, false, e));
      }
      const e = (at(gx, gy + 1) < h ? 1 : 0) | (hl < h ? 2 : 0) | (hr < h ? 4 : 0) | (at(gx, gy - 1) < h ? 16 : 0);
      buf.set(sx, base - h, color(gx, gy, h, true, e));
    }
  }
  return { buf, ox, oy, H, w, d };
}

function finish(hm, x, y, extra = {}) {
  outline(hm.buf);
  return { canvas: hm.buf.toCanvas(), dx: x - hm.ox, dy: y - hm.oy, sortY: y + hm.d, hm: { x, y, w: hm.w, d: hm.d, H: hm.H }, ...extra };
}

const MAT_HEX = {
  limestone: { top: ['#cfc19d', '#c4b591', '#d8cba9', '#bcab86'], face: ['#a79676', '#9c8b6b', '#b1a181', '#928260'], mortar: '#776a52' },
  whitestone: { top: ['#ebe5d3', '#e1d9c4', '#f2ecdc', '#d8cfb8'], face: ['#c3baa3', '#b8ae96', '#cdc5ae', '#ada38b'], mortar: '#8f866f' },
  basalt: { top: ['#7a746c', '#6f6961', '#857e75', '#666058'], face: ['#58534d', '#4f4a44', '#615b54', '#48433e'], mortar: '#36322e' },
  adobe: { top: ['#b8977a', '#ad8c6e', '#c2a185', '#a38466'], face: ['#93735a', '#896a51', '#9c7c62', '#7f6149'], mortar: '#6a5040' },
  redplaster: { top: ['#b0644c', '#a65c45', '#ba6d54', '#9c5641'], face: ['#8c4a37', '#824433', '#955140', '#7a3f30'], mortar: '#5e3126' },
  charred: { top: ['#3e3530', '#362e29', '#483d36', '#2f2824'], face: ['#2a2420', '#251f1c', '#312a25', '#211b18'], mortar: '#171311' },
  floor: { top: ['#6a5644', '#615040', '#73604c', '#57483a'], face: ['#3a2f27', '#352a22', '#40342b', '#2e251f'], mortar: '#2b221c' },
};
export const MATS = Object.fromEntries(
  Object.entries(MAT_HEX).map(([k, m]) => [k, { top: m.top.map(rgb), face: m.face.map(rgb), mortar: rgb(m.mortar), mortarTop: tone(rgb(m.mortar), 1.15) }]),
);

function stone(m, gx, gy, z, top, e, seed, bw = 8, bh = 3) {
  let c;
  if (top) {
    const bd = bh + 2, row = Math.floor(gy / bd), off = (row & 1) * (bw >> 1);
    const mortar = gy % bd === 0 || (gx + off) % bw === 0;
    c = mortar ? m.mortarTop : m.top[Math.floor(hash2(Math.floor((gx + off) / bw), row, seed) * m.top.length)];
  } else {
    const course = Math.floor(z / bh), off = (course & 1) * (bw >> 1);
    const mortar = z % bh === bh - 1 || (gx + off) % bw === 0;
    c = mortar ? m.mortar : m.face[Math.floor(hash2(Math.floor((gx + off) / bw), course + 977, seed) * m.face.length)];
  }
  if (fbm(gx * 0.06, (gy - z) * 0.06, seed + 5, 2) > 0.66) c = tone(c, 0.84);
  if (top) {
    if (e & 1) c = mix(c, WHITE, 0.22);
    else if (e & 16) c = tone(c, 0.92);
  } else {
    if (e & 2) c = mix(c, WHITE, 0.14);
    if (e & 4) c = tone(c, 0.78);
    if (e & 8) c = tone(c, 0.82);
  }
  return c;
}

function cracks(buf, count, R, minY = 0) {
  const c = rgb('#3b3128');
  for (let n = 0; n < count; n++) {
    let x = Math.floor(R() * buf.w), y = Math.floor(minY + R() * (buf.h - minY));
    if (buf.alpha(x, y) < 200) continue;
    const len = 6 + R() * 16;
    for (let i = 0; i < len && buf.alpha(x, y) > 200; i++) {
      buf.set(x, y, c);
      y += 1;
      x += R() < 0.35 ? -1 : R() < 0.5 ? 1 : 0;
    }
  }
}

function pyramid(o, seed) {
  const { x, y, w, d, tiers = 4, tierH = 13, inset = 16, insetD = 11, stairW = 34, stairProj = 18, damage = 0.28 } = o;
  const sh = { w: 60, d: 30, h: 18, comb: 6, ...o.shrine };
  const R = rng(seed);
  const D = d + stairProj, topH = tiers * tierH, cx = w / 2, half = stairW / 2;
  const topFront = d - 1 - (tiers - 1) * insetD, topBack = (tiers - 1) * insetD;
  const sx0 = Math.round(cx - sh.w / 2), sy0 = topBack + 2;
  const inShrine = (gx, gy) => gx >= sx0 && gx < sx0 + sh.w && gy >= sy0 && gy < sy0 + sh.d;
  const stairH = (gy) => Math.min(topH, Math.max(0, Math.round((((D - gy) / (D - topFront)) * topH) / 2) * 2));
  const inStair = (gx, gy) => Math.abs(gx + 0.5 - cx) < half && gy >= topFront;
  const roofH = (gx, gy) => {
    let h = topH + sh.h;
    if (gy >= sy0 + (sh.d >> 1) - 1 && gy <= sy0 + (sh.d >> 1) && gx > sx0 + 4 && gx < sx0 + sh.w - 5) h += sh.comb;
    if (gx > sx0 + sh.w * 0.64 && gy < sy0 + sh.d * 0.62) h -= 7 + Math.floor(hash2(gx >> 1, gy >> 1, seed) * 6);
    return h;
  };
  const height = (gx, gy) => {
    let h = -1;
    if (gy < d) {
      const ex = Math.min(gx, w - 1 - gx), ey = Math.min(gy, d - 1 - gy);
      const t = Math.min(Math.floor(ex / inset), Math.floor(ey / insetD), tiers - 1);
      h = (t + 1) * tierH;
      const band = Math.min(ex - t * inset, ey - t * insetD);
      if (band < 2 && noise2(gx * 0.2, gy * 0.2, seed + 3) > 1 - damage * 0.7) h -= 2 + Math.round(tierH * 0.3 * hash2(gx >> 2, gy >> 2, seed));
      if (inShrine(gx, gy)) h = roofH(gx, gy);
    }
    if (inStair(gx, gy)) {
      let s = stairH(gy);
      if (Math.abs(gx + 0.5 - cx) >= half - 3) s += 3;
      h = Math.max(h, s);
    }
    return h;
  };
  const tread = MATS.whitestone, door = rgb('#140e0c'), doorGlow = rgb('#5a3a22');
  const color = (gx, gy, z, top, e) => {
    const sdx = Math.abs(gx + 0.5 - cx);
    if (inStair(gx, gy) && z <= stairH(gy) + 3 && !(inShrine(gx, gy) && z > topH)) {
      if (sdx >= half - 3) return stone(MATS.limestone, gx, gy, z, top, e, seed + 9, 4, 3);
      if (top) return mix(tread.top[(gy >> 1) & 1], WHITE, e & 1 ? 0.2 : 0);
      return z % 2 ? tread.face[1] : tone(tread.face[0], 0.9);
    }
    if (inShrine(gx, gy) && z >= topH) {
      if (!top && gy === sy0 + sh.d - 1 && sdx < 6 && z < topH + 12) return z < topH + 3 ? doorGlow : door;
      if (!top && z >= topH + sh.h - 3 && z < topH + sh.h) return stone(MATS.limestone, gx, gy, z, top, e, seed);
      return stone(MATS.redplaster, gx, gy, z, top, e, seed + 4, 10, 4);
    }
    if (top) {
      const c = stone(MATS.limestone, gx, gy, z, top, e, seed, 12, 4);
      return gy > 0 && height(gx, gy - 1) > z ? tone(c, 0.78) : c;
    }
    const zl = z % tierH;
    if (zl >= tierH - 2) return stone(MATS.whitestone, gx, gy, z, top, e, seed, 12, 2);
    if (zl === tierH - 3) return tone(MATS.limestone.mortar, 0.8);
    return tone(stone(MATS.limestone, gx, gy, z, top, e, seed), 0.8 + (0.2 * zl) / tierH);
  };
  const hm = heightmap(w, D, topH + sh.h + sh.comb + 4, height, color);
  cracks(hm.buf, 18, R, 20);
  return finish(hm, x, y, {
    solids: [[x, y, w, d], [x + cx - half, y + d, stairW, stairProj]],
    platform: { x, y, w, d: D, h: topH },
  });
}

function dais(o, seed) {
  const { x, y, w, d, h = 8, steps = 6, stepW = 22, mat = 'whitestone' } = o;
  const D = d + steps, cx = w / 2;
  const height = (gx, gy) => {
    if (gy < d) return h;
    if (Math.abs(gx + 0.5 - cx) < stepW / 2) return Math.max(1, Math.round((h * (D - gy)) / (steps + 1) / 2) * 2);
    return -1;
  };
  const color = (gx, gy, z, top, e) => stone(MATS[mat], gx, gy, z, top, e, seed, 10, 4);
  return finish(heightmap(w, D, h + 2, height, color), x, y, {
    solids: [[x, y, w, d], [x + cx - stepW / 2, y + d, stepW, steps]],
    platform: { x, y, w, d, h },
  });
}

function wall(o, seed) {
  const { x0, y0, x1, y1, t = 4, h = 15, mat = 'limestone', broken = 0.5 } = o;
  const minX = Math.floor(Math.min(x0, x1) - t), minY = Math.floor(Math.min(y0, y1) - t);
  const w = Math.ceil(Math.abs(x1 - x0) + t * 2), d = Math.ceil(Math.abs(y1 - y0) + t * 2);
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  const profile = (s) => {
    const seg = hash2(Math.floor(s / 22), 5, seed);
    if (seg < broken * 0.3) return hash2(s >> 2, 3, seed) < 0.7 ? -1 : 2;
    let hh = seg < broken * 0.8 ? h * (0.3 + 0.4 * noise2(s * 0.3, 2, seed)) : h;
    if (hash2(s >> 2, 1, seed) < 0.25) hh -= 3;
    return Math.max(2, Math.round(hh / 3) * 3);
  };
  const height = (gx, gy) => {
    const px = minX + gx + 0.5 - x0, py = minY + gy + 0.5 - y0;
    const s = px * ux + py * uy;
    if (s < 0 || s > len || Math.abs(px * uy - py * ux) > t / 2) return -1;
    return profile(Math.floor(s));
  };
  const color = (gx, gy, z, top, e) => {
    const c = stone(MATS[mat], gx, gy, z, top, e, seed, 6, 3);
    return z > h - 4 && hash2(gx, gy, seed) < 0.4 ? tone(c, 0.75) : c;
  };
  const solids = [];
  for (let s = 0; s < len; s += 4) if (profile(Math.floor(s)) > 2) solids.push([x0 + ux * s - t / 2 - 1, y0 + uy * s - t / 2 - 1, t + 2, t + 2]);
  return finish(heightmap(w, d, h + 2, height, color), minX, minY, { solids });
}

function house(o, seed) {
  const { x, y, w, d, h = 22, t = 4, mat = 'adobe', ruin = 0.5, door = 10 } = o;
  const R = rng(seed);
  const beams = Array.from({ length: 2 + Math.floor(R() * 2) }, () => [R() * w, R() * d, R() * w, R() * d]);
  const onBeam = (gx, gy) => beams.some(([ax, ay, bx, by]) => {
    const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
    const k = clamp(((gx - ax) * vx + (gy - ay) * vy) / l2, 0, 1);
    return Math.hypot(gx - ax - vx * k, gy - ay - vy * k) < 1.1;
  });
  const side = (gx, gy) => (gy >= d - t ? 0 : gy < t ? 1 : gx < t ? 2 : gx >= w - t ? 3 : -1);
  const profile = (sideId, s) => {
    const n = noise2(s * 0.12, sideId * 7.3, seed);
    let hh = n > ruin * 0.85 ? h : h * (0.15 + 0.6 * n);
    if (sideId === 0) hh *= 0.75;
    return Math.max(1, Math.round(hh / 2) * 2);
  };
  const height = (gx, gy) => {
    const sId = side(gx, gy);
    if (sId < 0) return onBeam(gx, gy) ? 2 : 0;
    if (sId === 0 && Math.abs(gx + 0.5 - w / 2) < door / 2) return 0;
    return profile(sId, sId < 2 ? gx : gy);
  };
  const floorM = MATS.floor, beam = MATS.charred;
  const color = (gx, gy, z, top, e) => {
    if (side(gx, gy) < 0 || (side(gx, gy) === 0 && Math.abs(gx + 0.5 - w / 2) < door / 2)) {
      if (z > 0) return top ? beam.top[(gx + gy) & 1] : beam.face[0];
      const r = hash2(gx, gy, seed);
      return r < 0.08 ? rgb('#7a4a32') : r < 0.2 ? floorM.top[3] : floorM.top[Math.floor(fbm(gx * 0.2, gy * 0.2, seed) * 3)];
    }
    const c = stone(MATS[mat], gx, gy, z, top, e, seed, 7, 3);
    return top || hash2(gx, z, seed + 1) < 0.15 ? tone(c, 0.82) : c;
  };
  const hm = heightmap(w, d, h + 2, height, color);
  cracks(hm.buf, 6, R, 4);
  const dw = (w - door) / 2;
  return finish(hm, x, y, {
    solids: [[x, y, w, t], [x, y, t, d], [x + w - t, y, t, d], [x, y + d - t, dw, t], [x + w - dw, y + d - t, dw, t]],
  });
}

function boulder(o, seed) {
  const { x, y, rx = 6, ry = 4, h = 6, mat = 'basalt' } = o;
  const w = rx * 2, d = ry * 2;
  const height = (gx, gy) => {
    const q = 1 - ((gx + 0.5 - rx) / rx) ** 2 - ((gy + 0.5 - ry) / ry) ** 2;
    return q <= 0 ? -1 : Math.max(1, Math.round(h * Math.sqrt(q) * (0.8 + 0.4 * noise2(gx * 0.5, gy * 0.5, seed))));
  };
  const m = MATS[mat];
  const color = (gx, gy, z, top, e) => {
    const c = top ? m.top[Math.floor(hash2(gx >> 1, gy >> 1, seed) * 4)] : m.face[Math.floor(hash2(gx >> 1, z >> 1, seed) * 4)];
    return top && gx + gy < rx + ry - 2 ? mix(c, WHITE, 0.12) : e & 4 ? tone(c, 0.8) : c;
  };
  return finish(heightmap(w, d, h + 2, height, color), x - rx, y - ry, { solids: [[x - rx + 1, y - ry + 1, w - 2, d - 2]] });
}

function column(o, seed) {
  const { x, y, len = 40, r = 5, mat = 'limestone' } = o;
  const d = r * 2;
  const height = (gx, gy) => {
    if (gx > len - 3 && hash2(gy, 1, seed) < 0.5) return -1;
    const q = r * r - (gy + 0.5 - r) ** 2;
    return q <= 0 ? -1 : Math.round(Math.sqrt(q) * 1.1);
  };
  const m = MATS[mat];
  const color = (gx, gy, z, top, e) => {
    const drum = gx % 10 === 0;
    let c = top ? m.top[gy < r ? 2 : 0] : m.face[0];
    if (top && gy === r - 1) c = mix(c, WHITE, 0.2);
    if (drum) c = m.mortar;
    if (gx % 3 === 0 && top && gy > 1 && gy < d - 2 && !drum) c = tone(c, 0.92);
    return c;
  };
  return finish(heightmap(len, d, r * 2, height, color), x, y, { solids: [[x, y, len, d]] });
}

function stela(o, seed) {
  const { x, y, w = 8, d = 4, h = 22, mat = 'limestone', tilt = 0 } = o;
  const height = (gx, gy) => Math.max(2, h - Math.round(Math.abs(gx - w / 2) * tilt) - (hash2(gx, 0, seed) < 0.2 ? 2 : 0));
  const glyph = rgb('#6a5c46');
  const color = (gx, gy, z, top, e) => {
    if (!top && gy === d - 1 && gx > 0 && gx < w - 1 && z > 2 && z < h - 3 && hash2(gx, z >> 1, seed) < 0.35) return glyph;
    return stone(MATS[mat], gx, gy, z, top, e, seed, 20, 30);
  };
  return finish(heightmap(w, d, h + 2, height, color), x - w / 2, y - d, { solids: [[x - w / 2, y - d, w, d]] });
}

function smolder(o, seed) {
  const { x, y, r = 16 } = o;
  const R = rng(seed);
  const w = 16, d = 10;
  const logs = Array.from({ length: 4 }, () => [R() * w, R() * d, R() * w, R() * d]);
  const onLog = (gx, gy) => logs.findIndex(([ax, ay, bx, by]) => {
    const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy || 1;
    const k = clamp(((gx - ax) * vx + (gy - ay) * vy) / l2, 0, 1);
    return Math.hypot(gx - ax - vx * k, gy - ay - vy * k) < 1.3;
  });
  const height = (gx, gy) => { const i = onLog(gx, gy); return i < 0 ? -1 : 2 + (i % 2); };
  const ember = [rgb('#d0602a'), rgb('#f0a040'), rgb('#8a2f1c')];
  const color = (gx, gy, z, top) => {
    const hsh = hash2(gx, gy, seed);
    if (top && hsh < 0.18) return ember[Math.floor(hsh * 16) % 3];
    return top ? MATS.charred.top[Math.floor(hsh * 4)] : MATS.charred.face[gx & 1];
  };
  return finish(heightmap(w, d, 5, height, color), x - w / 2, y - d / 2, {
    solids: [[x - 6, y - 3, 12, 6]],
    emitters: [{ x, y: y - 2, rate: 0.12 }],
    groundAreas: [{ type: 'ash', circle: [x, y, r], edge: 4 }],
  });
}

function sprite(buf, x, y, bx, by, extra) {
  outline(buf);
  return { canvas: buf.toCanvas(), dx: x - bx, dy: y - by, sortY: y, solids: [[x - 2, y - 2, 4, 3]], ...extra };
}

function burntTree(o, seed) {
  const R = rng(seed), h = o.h ?? 28;
  const buf = new PixBuf(40, h + 14), bx = 20, by = h + 11;
  const dark = rgb('#211a17'), mid = rgb('#362b25'), lite = rgb('#54463b'), ember = rgb('#c4572a');
  const branch = (x, y, ang, len, wid, depth) => {
    for (let i = 0; i < len; i++) {
      x += Math.cos(ang);
      y += Math.sin(ang);
      ang += (R() - 0.5) * 0.35;
      const ww = Math.max(1, Math.round(wid * (1 - (i / len) * 0.7)));
      for (let k = 0; k < ww; k++) buf.set(x + k - (ww >> 1), y, ww > 1 && k === 0 ? lite : ww > 1 && k === ww - 1 ? dark : mid);
      if (depth < 3 && i > len * 0.3 && R() < 0.14) branch(x, y, ang + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.6), len * (0.4 + R() * 0.25), wid * 0.6, depth + 1);
    }
    if (R() < 0.25) buf.set(x, y, ember);
  };
  branch(bx, by, -Math.PI / 2 + (R() - 0.5) * 0.25, h, 3.4, 0);
  return sprite(buf, o.x, o.y, bx, by, { blob: [o.x + 3, o.y, 6, 2] });
}

function palm(o, seed) {
  const R = rng(seed), h = o.h ?? 34, lean = (R() - 0.5) * 12;
  const buf = new PixBuf(52, h + 22), bx = 26, by = h + 20;
  const bark = [rgb('#6b5038'), rgb('#56402c'), rgb('#86694d')];
  let tx = bx, ty = by;
  for (let i = 0; i <= h; i++) {
    const f = i / h;
    tx = Math.round(bx + lean * f * f);
    ty = by - i;
    buf.set(tx - 1, ty, bark[2]);
    buf.set(tx, ty, (i >> 1) % 2 ? bark[1] : bark[0]);
    buf.set(tx + 1, ty, bark[1]);
  }
  const green = [rgb('#24481f'), rgb('#3a6a2e'), rgb('#5a8d40')], dead = [rgb('#4a3c24'), rgb('#6e5a34'), rgb('#8c7444')];
  const n = 8;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + R() * 0.5, L = 11 + R() * 6;
    const col = R() < (o.burnt ?? 0.35) ? dead : green;
    for (let s = 1; s <= L; s++) {
      const fx = tx + Math.cos(a) * s, fy = ty - 1 + Math.sin(a) * s * 0.5 + (s * s) / L * 0.5;
      buf.set(fx, fy, col[1]);
      buf.set(fx, fy - 1, col[2]);
      if (s > 2 && s < L - 1 && s % 2 === 0) buf.set(fx, fy + 1, col[0]), buf.set(fx, fy + 2, col[0]);
    }
  }
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) buf.set(tx + i, ty - 1 + j, bark[1]);
  return sprite(buf, o.x, o.y, bx, by, { blob: [o.x + 6, o.y + 1, 9, 3] });
}

function tree(o, seed) {
  const R = rng(seed), r = o.r ?? 11, h = o.h ?? 12;
  const W = r * 2 + 8, Hc = h + r * 2 + 4, bx = W >> 1, by = Hc - 2;
  const buf = new PixBuf(W, Hc);
  const trunk = [rgb('#4a3626'), rgb('#5f4632')];
  for (let i = 0; i < h + 4; i++) for (let k = -1; k <= 1; k++) buf.set(bx + k, by - i, trunk[k < 0 ? 1 : 0]);
  const cy = by - h - r + 2;
  const blobs = Array.from({ length: 6 }, () => [bx + (R() - 0.5) * r, cy + (R() - 0.5) * r * 0.6, r * (0.55 + R() * 0.3)]);
  const leaf = [rgb('#1f3a1c'), rgb('#2e5226'), rgb('#3f6a2f'), rgb('#5b8a3c')];
  for (let y = 0; y < Hc; y++)
    for (let x = 0; x < W; x++) {
      if (!blobs.some(([px, py, pr]) => (x - px) ** 2 + (y - py) ** 2 < pr * pr)) continue;
      const l = (-(x - bx) - (y - cy)) / (r * 1.6) + (hash2(x, y, seed) - 0.5) * 0.5;
      buf.set(x, y, leaf[clamp(Math.floor(1.5 + l * 1.6), 0, 3)]);
    }
  return sprite(buf, o.x, o.y, bx, by, { blob: [o.x + 5, o.y, r, 3] });
}

const BUILDERS = { pyramid, dais, wall, house, boulder, column, stela, smolder, burntTree, palm, tree };

export function buildObject(o, seed) {
  const b = BUILDERS[o.kind];
  if (!b) throw new Error(`Unknown object kind: ${o.kind}`);
  return b(o, seed);
}

const TEX = {
  grass: ['#3c4428', '#454e2e', '#4f5833', '#5a6139', '#676a40'].map(rgb),
  dirt: ['#5a4734', '#65513d', '#715c46', '#7e6850'].map(rgb),
  ash: ['#47413b', '#504942', '#5a524a', '#655c53'].map(rgb),
  pavement: ['#a2977d', '#978c73', '#aca186', '#8c826a'].map(rgb),
};
const MORTAR = rgb('#857a64');

function texel(type, x, y, seed) {
  const n = fbm(x * 0.045, y * 0.045, seed + 11, 2);
  if (type === 'pavement') {
    const row = Math.floor(y / 9), off = (row % 3) * 5, col = Math.floor((x + off) / 14);
    const slab = hash2(col, row, seed);
    if (slab < 0.05) return texel('dirt', x, y, seed);
    if (y % 9 === 0 || (x + off) % 14 === 0) return MORTAR;
    let c = TEX.pavement[Math.floor(slab * 40) % 4];
    if (hash2(x, y, seed) < 0.08) c = tone(c, 0.93);
    if (n > 0.6) c = tone(c, 0.86);
    return c;
  }
  const pal = TEX[type];
  const v = n * 0.75 + hash2(x, y, seed) * 0.25;
  let c = pal[clamp(Math.floor((v - 0.25) * pal.length * 1.7), 0, pal.length - 1)];
  if (type === 'grass' && (hash2(x, y, seed + 2) > 0.975 || hash2(x, y + 1, seed + 2) > 0.975)) c = pal[pal.length - 1];
  if (type === 'ash' && hash2(x, y, seed + 3) > 0.96) c = rgb('#211c19');
  return c;
}

function sdf(a) {
  if (a.rect) {
    const [rx, ry, rw, rh] = a.rect;
    return (x, y) => Math.max(rx - x, x - (rx + rw), ry - y, y - (ry + rh));
  }
  if (a.circle) {
    const [cx, cy, r] = a.circle;
    return (x, y) => Math.hypot(x - cx, y - cy) - r;
  }
  if (a.ellipse) {
    const [cx, cy, rx, ry] = a.ellipse;
    return (x, y) => (Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry);
  }
  throw new Error('ground area needs rect, circle or ellipse');
}

function paintFissures(buf, list, seed) {
  const R = rng(seed + 401), W = buf.w, Hh = buf.h;
  const mask = new Uint8Array(W * Hh);
  const glows = [];
  const disc = (cx, cy, r) => {
    const ri = Math.ceil(r);
    for (let dy = -ri; dy <= ri; dy++)
      for (let dx = -ri; dx <= ri; dx++) {
        if (dx * dx + dy * dy > r * r + 0.3) continue;
        const px = Math.round(cx + dx), py = Math.round(cy + dy);
        if (px >= 0 && py >= 0 && px < W && py < Hh) mask[py * W + px] = 1;
      }
  };
  const stroke = (pts, width, branches, glow) => {
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segs.push([pts[i - 1], pts[i], l]);
      total += l;
    }
    let walked = 0;
    for (const [a, b, l] of segs) {
      for (let s = 0; s < l; s += 0.5) {
        const f = (walked + s) / total;
        const px = a[0] + ((b[0] - a[0]) * s) / l + (noise2((walked + s) * 0.15, 0, seed) - 0.5) * 6;
        const py = a[1] + ((b[1] - a[1]) * s) / l + (noise2((walked + s) * 0.15, 5, seed) - 0.5) * 6;
        const wd = width * Math.pow(Math.sin(Math.PI * f), 0.5) * (0.55 + 0.9 * noise2((walked + s) * 0.08, 9, seed));
        disc(px, py, Math.max(0.5, wd / 2));
        if (branches && R() < 0.012) {
          const br = [[px, py]];
          let ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (R() < 0.5 ? -1 : 1) * (0.6 + R() * 0.7);
          for (let k = 0, L = 3 + R() * 4; k < L; k++) {
            const [lx, ly] = br[br.length - 1];
            ang += (R() - 0.5) * 0.8;
            br.push([lx + Math.cos(ang) * 5, ly + Math.sin(ang) * 5]);
          }
          stroke(br, Math.max(1.2, wd * 0.5), false, false);
        }
        if (glow && wd > 3 && R() < 0.03) glows.push([Math.round(px), Math.round(py)]);
      }
      walked += l;
    }
  };
  for (const f of list) stroke(f.points, f.width ?? 6, true, f.glow);
  const wallC = rgb('#4e3c2e'), deep = rgb('#2a1f19'), core = rgb('#140e0c');
  const m = (x, y) => (x < 0 || y < 0 || x >= W || y >= Hh ? 0 : mask[y * W + x]);
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      if (m(x, y)) buf.set(x, y, !m(x, y - 1) ? wallC : !m(x, y - 2) ? deep : core);
      else if (m(x, y - 1)) buf.shade(x, y, 1.18);
      else if (m(x, y + 1)) buf.shade(x, y, 0.78);
    }
  return glows;
}

function paintStones(buf, clusters, seed) {
  const R = rng(seed + 77);
  for (const c of clusters) {
    const pal = (MATS[c.mat ?? 'limestone'] ?? MATS.limestone).top;
    for (let i = 0; i < c.count; i++) {
      const a = R() * Math.PI * 2, r = c.r * Math.sqrt(R());
      const x = Math.round(c.x + Math.cos(a) * r), y = Math.round(c.y + Math.sin(a) * r * 0.7);
      const s = 1 + Math.floor(R() * R() * (c.size ?? 4));
      if (c.shards && R() < 0.5) {
        buf.set(x, y, rgb(R() < 0.5 ? '#9a5638' : '#b5714a'));
        buf.set(x + 1, y, rgb('#7a4128'));
        continue;
      }
      const base = pal[Math.floor(R() * pal.length)];
      for (let dy = 0; dy < s; dy++) for (let dx = 0; dx <= s; dx++) buf.set(x + dx, y + dy, dy === 0 && dx < s ? mix(base, WHITE, 0.2) : dy === s - 1 ? tone(base, 0.75) : base);
      for (let dx = 1; dx <= s + 1; dx++) buf.shade(x + dx, y + s, 0.6);
    }
  }
}

export function paintGround(world, spec, seed) {
  const buf = new PixBuf(world.w, world.h);
  const areas = (spec.areas ?? []).map((a) => ({ type: a.type, edge: a.edge ?? 8, sd: sdf(a) }));
  for (let y = 0; y < world.h; y++)
    for (let x = 0; x < world.w; x++) {
      let type = spec.base;
      const n = fbm(x * 0.06, y * 0.06, seed + 1, 2) - 0.5;
      for (const a of areas) if (a.sd(x, y) + n * a.edge * 2 < 0) type = a.type;
      buf.set(x, y, texel(type, x, y, seed));
    }
  const glows = paintFissures(buf, spec.fissures ?? [], seed);
  paintStones(buf, spec.stones ?? [], seed);
  return { buf, glows };
}

export function castShadow(buf, hm, k = 0.5, alpha = 0.38) {
  const { x, y, w, d, H } = hm;
  let maxH = 0;
  for (const h of H) if (h > maxH) maxH = h;
  const L = Math.ceil(maxH * k), MW = w + L + 1, MD = d + (L >> 2) + 1;
  const mask = new Uint8Array(MW * MD);
  for (let gy = 0; gy < d; gy++)
    for (let gx = 0; gx < w; gx++) {
      const h = H[gy * w + gx];
      if (h <= 0) continue;
      const len = Math.round(h * k);
      for (let s = 1; s <= len; s++) mask[(gy + (s >> 2)) * MW + gx + s] = 1;
    }
  for (let my = 0; my < MD; my++)
    for (let mx = 0; mx < MW; mx++) {
      if (!mask[my * MW + mx]) continue;
      if (mx < w && my < d && H[my * w + mx] > 0) continue;
      buf.set(x + mx, y + my, SHADOW, alpha);
    }
}

export function shadowBlob(buf, cx, cy, rx, ry, alpha = 0.35) {
  for (let dy = -ry; dy <= ry; dy++)
    for (let dx = -rx; dx <= rx; dx++) if ((dx / (rx + 0.5)) ** 2 + (dy / (ry + 0.5)) ** 2 <= 1) buf.set(cx + dx, cy + dy, SHADOW, alpha);
}
