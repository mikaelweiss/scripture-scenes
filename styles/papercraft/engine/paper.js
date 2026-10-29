// Canvas drawing library: every visual in the diorama is a paper cutout drawn here.
const TAU = Math.PI * 2;
export const EDGE = '#fbf5e4';

export function rng(seed = 1) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function parse(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(v) {
  const [r, g, b] = v.map((x) => Math.max(0, Math.min(255, Math.round(x))));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
export function shade(c, f) {
  const v = parse(c);
  return toHex(f <= 1 ? v.map((x) => x * f) : v.map((x) => x + (255 - x) * (f - 1)));
}
export function mix(a, b, t) {
  const x = parse(a), y = parse(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

let grainTile;
function grain() {
  if (grainTile) return grainTile;
  const c = canvas(256, 256), ctx = c.getContext('2d');
  const img = ctx.createImageData(256, 256), R = rng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 226 + R() * 29;
    img.data[i] = v; img.data[i + 1] = v - 2; img.data[i + 2] = v - 7; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  ctx.lineCap = 'round';
  for (let i = 0; i < 220; i++) {
    const x = R() * 256, y = R() * 256, a = R() * TAU, l = 3 + R() * 12;
    ctx.strokeStyle = `rgba(95,72,45,${0.05 + R() * 0.08})`;
    ctx.lineWidth = 0.4 + R() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  return (grainTile = c);
}

export function applyGrain(c, amount = 1) {
  const t = canvas(c.width, c.height), tc = t.getContext('2d');
  tc.fillStyle = tc.createPattern(grain(), 'repeat');
  tc.fillRect(0, 0, t.width, t.height);
  tc.globalCompositeOperation = 'destination-in';
  tc.drawImage(c, 0, 0);
  const ctx = c.getContext('2d');
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = amount;
  ctx.drawImage(t, 0, 0);
  ctx.restore();
}

function tinted(src, color) {
  const t = canvas(src.width, src.height), tc = t.getContext('2d');
  tc.drawImage(src, 0, 0);
  tc.globalCompositeOperation = 'source-in';
  tc.fillStyle = color;
  tc.fillRect(0, 0, t.width, t.height);
  return t;
}

// Draws a shape, then gives it a cut paper border, a lifted shadow, and grain.
export function cutout(w, h, draw, { border = 5, edge = EDGE, grain: g = 1, lift = true } = {}) {
  const shape = canvas(w, h);
  const sc = shape.getContext('2d');
  draw(sc, shape.width, shape.height);
  const out = canvas(w, h), ctx = out.getContext('2d');
  if (border > 0) {
    for (let r = border; r > 0; r -= border / 2) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        ctx.drawImage(shape, Math.cos(a) * r, Math.sin(a) * r);
      }
    }
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.globalCompositeOperation = 'source-over';
    if (lift) {
      ctx.globalAlpha = 0.28;
      ctx.drawImage(tinted(shape, '#3a2414'), border * 0.25, border * 0.4);
      ctx.globalAlpha = 1;
    }
  }
  ctx.drawImage(shape, 0, 0);
  if (g) applyGrain(out, g);
  return out;
}

// White where opaque, black elsewhere: an alphaMap for the cardboard back of a standee.
export function silhouette(c) {
  const s = tinted(c, '#ffffff'), ctx = s.getContext('2d');
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, s.width, s.height);
  return s;
}

function lift(ctx, on, k = 1) {
  ctx.shadowColor = on ? 'rgba(60,35,15,0.38)' : 'transparent';
  ctx.shadowBlur = on ? 2.5 * k : 0;
  ctx.shadowOffsetX = on ? 1 * k : 0;
  ctx.shadowOffsetY = on ? 2 * k : 0;
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); }
function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}
function blob(ctx, cx, cy, rx, ry, R, n = 14, jag = 0.25) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, k = 1 - jag + R() * jag * 2;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  poly(ctx, pts);
}
function stroke(ctx, color, width, pts) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

// ---------- People ----------

function robePath(ctx, sw, hw, sy, hem) {
  ctx.beginPath();
  ctx.moveTo(50 - sw, sy + 7);
  ctx.quadraticCurveTo(50 - sw, sy - 2, 50 - sw + 8, sy - 3);
  ctx.lineTo(50 + sw - 8, sy - 3);
  ctx.quadraticCurveTo(50 + sw, sy - 2, 50 + sw, sy + 7);
  ctx.lineTo(50 + hw, hem);
  ctx.quadraticCurveTo(50, hem + 5, 50 - hw, hem);
  ctx.closePath();
}

function arms(ctx, pose, sw, sy, hy, hr, sleeve, skin, wid, hands) {
  const sets = {
    stand: [[50 - sw + 4, sy + 4, 50 - sw - 3, sy + 56], [50 + sw - 4, sy + 4, 50 + sw + 3, sy + 56]],
    fold: [[50 - sw + 4, sy + 4, 47, sy + 34], [50 + sw - 4, sy + 4, 53, sy + 34]],
    raise: [[50 - sw + 4, sy + 3, 50 - sw - 13, hy - hr + 3], [50 + sw - 4, sy + 3, 50 + sw + 13, hy - hr + 3]],
    open: [[50 - sw + 4, sy + 4, 50 - sw - 20, sy + 46], [50 + sw - 4, sy + 4, 50 + sw + 20, sy + 46]],
  };
  for (const [x0, y0, x1, y1] of sets[pose === 'kneel' ? 'fold' : pose] ?? sets.stand) {
    stroke(ctx, sleeve, wid, [[x0, y0], [x1, y1]]);
    if (hands) {
      ctx.fillStyle = skin;
      const l = Math.hypot(x1 - x0, y1 - y0);
      circle(ctx, x1 + ((x1 - x0) / l) * wid * 0.45, y1 + ((y1 - y0) / l) * wid * 0.45, wid * 0.4);
    }
  }
}

export function drawPerson(ctx, w, h, p, back = false) {
  ctx.save();
  ctx.scale(w / 100, h / 200);
  const kid = p.kind === 'child', kneel = p.pose === 'kneel';
  let hr = 13, hy = 30, sy = 52, sw = 19, hw = 28, hem = 190, wid = 11;
  if (p.kind === 'woman') { sw = 17; hw = 30; }
  if (kid) { hr = 18; hy = 40; sy = 66; sw = 19; hw = 25; hem = 188; wid = 10; }
  if (kneel) { hr = 16; hy = 44; sy = 70; sw = 23; hw = 44; hem = 186; wid = 12; }
  const robe = p.robe, sleeve = shade(robe, 0.9), k = w / 100;
  lift(ctx, true, k);

  if (!kneel) {
    ctx.fillStyle = '#4a3424';
    ellipse(ctx, 41, hem + 2, 7, 4);
    ellipse(ctx, 59, hem + 2, 7, 4);
  } else if (back) {
    ctx.fillStyle = '#5a4030';
    ellipse(ctx, 36, hem, 9, 5);
    ellipse(ctx, 64, hem, 9, 5);
  }
  if (p.head === 'hair' && !kid) {
    ctx.fillStyle = p.hair;
    ctx.beginPath(); ctx.roundRect(50 - hr - 2, hy - hr * 0.3, hr * 2 + 4, hr + 18, 6); ctx.fill();
  }
  if (back || p.pose === 'raise') arms(ctx, p.pose, sw, sy, hy, hr, sleeve, p.skin, wid, !back || p.pose === 'raise');

  robePath(ctx, sw, hw, sy, hem);
  ctx.fillStyle = robe;
  ctx.fill();
  ctx.save();
  robePath(ctx, sw, hw, sy, hem);
  ctx.clip();
  lift(ctx, false);
  ctx.fillStyle = 'rgba(70,35,5,0.14)';
  ctx.fillRect(50 + sw * 0.3, 0, 100, 200);
  const fold = shade(robe, 0.78);
  stroke(ctx, fold, 1.6, [[44, sy + 50], [40, hem - 4]]);
  stroke(ctx, fold, 1.6, [[57, sy + 52], [62, hem - 6]]);
  if (!(back && p.cloak)) {
    ctx.fillStyle = p.sash;
    ctx.fillRect(0, sy + (kid ? 34 : 42), 100, kid ? 6 : 7);
  }
  ctx.restore();
  lift(ctx, true, k);

  if (p.cloak && back) {
    poly(ctx, [[50 - sw - 2, sy - 1], [50 + sw + 2, sy - 1], [50 + hw - 3, hem - 20], [50 - hw + 3, hem - 20]]);
    ctx.fillStyle = p.cloak;
    ctx.fill();
    lift(ctx, false);
    stroke(ctx, shade(p.cloak, 0.8), 1.5, [[50, sy + 10], [50, hem - 26]]);
    lift(ctx, true, k);
  } else if (p.cloak && p.cloakStyle === 'cape') {
    ctx.fillStyle = p.cloak;
    poly(ctx, [[50 - sw - 2, sy + 2], [50 - sw + 9, sy - 3], [50 - 8, sy + 40], [50 - hw * 0.5, hem - 14], [50 - hw - 1, hem - 12]]);
    ctx.fill();
    poly(ctx, [[50 + sw + 2, sy + 2], [50 + sw - 9, sy - 3], [50 + 8, sy + 40], [50 + hw * 0.5, hem - 14], [50 + hw + 1, hem - 12]]);
    ctx.fill();
  } else if (p.cloak) {
    ctx.fillStyle = p.cloak;
    poly(ctx, [[50 - sw - 1, sy + 1], [50 - sw + 10, sy - 4], [50 + sw * 0.7, sy + 48], [50 + hw * 0.75, hem - 28], [50 + hw * 0.1, hem - 22], [50 - sw - 4, sy + 46]]);
    ctx.fill();
  }

  if (!back && p.pose !== 'raise') arms(ctx, p.pose, sw, sy, hy, hr, sleeve, p.skin, wid, true);

  ctx.fillStyle = shade(p.skin, 0.85);
  ctx.fillRect(45, hy + hr - 5, 10, sy - hy - hr + 8);

  if (p.head === 'shawl') {
    ctx.fillStyle = p.shawl;
    ctx.beginPath();
    ctx.moveTo(50 - sw - 5, sy + 34);
    ctx.lineTo(50 - hr - 5, hy);
    ctx.arc(50, hy, hr + 5, Math.PI, 0);
    ctx.lineTo(50 + sw + 5, sy + 34);
    ctx.quadraticCurveTo(50, sy + 44, 50 - sw - 5, sy + 34);
    ctx.fill();
    if (!back) {
      lift(ctx, false);
      ctx.fillStyle = p.skin;
      ellipse(ctx, 50, hy + 3, hr * 0.72, hr * 0.84);
      lift(ctx, true, k);
      ctx.strokeStyle = p.shawl;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(50, hy + 1, hr * 0.8, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    }
  } else {
    ctx.fillStyle = back ? p.hair : p.skin;
    circle(ctx, 50, hy, hr);
    if (!back) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, 100, hy - hr * 0.28); ctx.clip();
      ctx.fillStyle = p.hair;
      circle(ctx, 50, hy - 0.5, hr + 1.5);
      ctx.restore();
      if (p.beard) {
        lift(ctx, false);
        ctx.fillStyle = p.beard;
        ctx.beginPath(); ctx.ellipse(50, hy + hr * 0.45, hr * 0.78, hr * 0.62, 0, 0, Math.PI); ctx.fill();
        lift(ctx, true, k);
      }
    }
    if (p.band) {
      ctx.save();
      ctx.beginPath(); ctx.arc(50, hy, hr + 0.5, 0, TAU); ctx.clip();
      lift(ctx, false);
      ctx.fillStyle = p.band;
      ctx.fillRect(0, hy - hr * 0.5, 100, 4);
      ctx.restore();
    }
  }
  ctx.restore();
}

export function drawChrist(ctx, w, h) {
  ctx.save();
  ctx.scale(w / 100, h / 200);
  const k = w / 100;
  const robe = '#fbf8f0', mantle = '#f1e9d6', skin = '#d9a77c', hair = '#6e4b2c';
  const hr = 12.5, hy = 29, sy = 50, sw = 20, hw = 31, hem = 192;
  lift(ctx, true, k);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.roundRect(50 - hr - 3, hy - 4, hr * 2 + 6, hr + 22, 7); ctx.fill();
  ctx.fillStyle = '#8a6a4a';
  ellipse(ctx, 42, hem + 2, 6, 3.5);
  ellipse(ctx, 58, hem + 2, 6, 3.5);
  robePath(ctx, sw, hw, sy, hem);
  ctx.fillStyle = robe;
  ctx.fill();
  ctx.save();
  robePath(ctx, sw, hw, sy, hem);
  ctx.clip();
  lift(ctx, false);
  stroke(ctx, '#e8dcc0', 1.4, [[46, sy + 40], [42, hem - 3]]);
  stroke(ctx, '#e8dcc0', 1.4, [[55, sy + 44], [60, hem - 3]]);
  ctx.restore();
  lift(ctx, true, k);
  ctx.fillStyle = mantle;
  poly(ctx, [[50 - sw - 2, sy + 1], [50 - sw + 10, sy - 4], [50 - 6, sy + 36], [50 - hw * 0.45, hem - 26], [50 - hw - 2, hem - 30]]);
  ctx.fill();
  poly(ctx, [[50 + sw + 2, sy + 1], [50 + sw - 10, sy - 4], [50 + 6, sy + 36], [50 + hw * 0.45, hem - 26], [50 + hw + 2, hem - 30]]);
  ctx.fill();
  lift(ctx, false);
  stroke(ctx, '#e3c886', 1.6, [[50 - sw + 10, sy - 3], [50 - 6, sy + 36], [50 - hw * 0.45, hem - 26]]);
  stroke(ctx, '#e3c886', 1.6, [[50 + sw - 10, sy - 3], [50 + 6, sy + 36], [50 + hw * 0.45, hem - 26]]);
  lift(ctx, true, k);
  arms(ctx, 'open', sw, sy, hy, hr, '#f6f1e4', skin, 12, true);
  ctx.fillStyle = shade(skin, 0.85);
  ctx.fillRect(45.5, hy + hr - 5, 9, 10);
  ctx.fillStyle = skin;
  circle(ctx, 50, hy, hr);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, 100, hy - hr * 0.3); ctx.clip();
  ctx.fillStyle = hair;
  circle(ctx, 50, hy - 0.5, hr + 1.6);
  ctx.restore();
  lift(ctx, false);
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(50, hy + hr * 0.42, hr * 0.8, hr * 0.66, 0, 0, Math.PI); ctx.fill();
  ctx.restore();
}

export function drawSunburst(ctx, w, h, { rays = 28, a = '#fff6dc', b = '#f5d995', core = '#fffbf0' } = {}) {
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 10;
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * TAU, a1 = ((i + 1) / rays) * TAU, r = i % 2 ? R : R * 0.82;
    ctx.fillStyle = i % 2 ? a : b;
    poly(ctx, [[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]]);
    ctx.fill();
  }
  ctx.fillStyle = core;
  circle(ctx, cx, cy, R * 0.42);
}

// ---------- Nature ----------

export function drawTree(ctx, w, h, p) {
  const R = rng(p.seed);
  ctx.save();
  ctx.scale(w / 100, h / 150);
  lift(ctx, true, w / 100);
  if (p.type === 'palm') {
    const lean = (R() - 0.5) * 30, top = [50 + lean, 42];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, x = 50 + lean * t * t, y = 148 - t * (148 - top[1]);
      ctx.fillStyle = i % 2 ? p.trunk : shade(p.trunk, 0.82);
      ctx.beginPath(); ctx.ellipse(x, y, 4.5 - t * 1.5, 3.8, 0, 0, TAU); ctx.fill();
    }
    const fronds = 9;
    for (let f = 0; f < fronds; f++) {
      const ang = Math.PI + (f / (fronds - 1)) * Math.PI + (R() - 0.5) * 0.3;
      const len = 30 + R() * 14, dx = Math.cos(ang) * len, droop = 12 + R() * 16;
      const ex = top[0] + dx, ey = top[1] + Math.sin(ang) * len * 0.45 + droop;
      const cxp = top[0] + dx * 0.5, cyp = top[1] + Math.sin(ang) * len * 0.75 - 6;
      const L = [], Rr = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14, mt = 1 - t;
        const x = mt * mt * top[0] + 2 * mt * t * cxp + t * t * ex, y = mt * mt * top[1] + 2 * mt * t * cyp + t * t * ey;
        const tx = 2 * mt * (cxp - top[0]) + 2 * t * (ex - cxp), ty = 2 * mt * (cyp - top[1]) + 2 * t * (ey - cyp);
        const l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
        const wd = Math.sin(Math.PI * Math.min(1, t * 1.1)) * 7 * (i % 2 ? 1.25 : 0.7);
        L.push([x + nx * wd, y + ny * wd]);
        Rr.unshift([x - nx * wd, y - ny * wd]);
      }
      ctx.fillStyle = f % 2 ? p.leaf : shade(p.leaf, 0.82);
      poly(ctx, [...L, ...Rr]);
      ctx.fill();
    }
  } else if (p.type === 'dead') {
    const branch = (x, y, a, len, wd, d) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      stroke(ctx, p.trunk, wd, [[x, y], [x2, y2]]);
      if (d > 0) {
        branch(x2, y2, a - 0.35 - R() * 0.35, len * 0.7, wd * 0.62, d - 1);
        branch(x2, y2, a + 0.35 + R() * 0.35, len * 0.7, wd * 0.62, d - 1);
      }
    };
    branch(50, 149, -Math.PI / 2 + (R() - 0.5) * 0.2, 48, 9, 4);
  } else {
    ctx.fillStyle = p.trunk;
    poly(ctx, [[43, 149], [47, 80], [40, 58], [45, 56], [50, 72], [56, 54], [60, 57], [53, 82], [57, 149]]);
    ctx.fill();
    const layers = [[0.72, 9, 0], [1, 8, -2], [1.18, 6, -5]];
    for (const [f, n, off] of layers) {
      ctx.fillStyle = shade(p.leaf, f);
      for (let i = 0; i < n; i++) {
        const x = 22 + R() * 56, y = 18 + R() * 46 + off, r = 12 + R() * 10;
        circle(ctx, x, y, r);
      }
    }
  }
  ctx.restore();
}

export function drawRock(ctx, w, h, p) {
  const R = rng(p.seed);
  const cx = w / 2, n = 8, pts = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI;
    const r = 0.75 + R() * 0.3;
    pts.push([cx + Math.cos(a) * (w * 0.42) * r, h * 0.92 + Math.sin(a) * h * 0.7 * r]);
  }
  ctx.fillStyle = p.color;
  poly(ctx, pts);
  ctx.fill();
  ctx.fillStyle = shade(p.color, 1.25);
  poly(ctx, [pts[2], pts[3], pts[4], [cx, h * 0.6]]);
  ctx.fill();
  ctx.fillStyle = shade(p.color, 0.78);
  poly(ctx, [pts[5], pts[6], pts[7], [cx + w * 0.05, h * 0.92], [cx, h * 0.6]]);
  ctx.fill();
}

export function drawCloud(ctx, w, h, p) {
  const R = rng(p.seed);
  const base = h * 0.78, bumps = [];
  const n = 5 + Math.floor(R() * 4);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, r = h * (0.14 + R() * 0.2) * Math.sin(Math.PI * (0.15 + t * 0.7)) * 1.3;
    bumps.push([w * (0.1 + t * 0.8), base - r * 0.55, r]);
  }
  const shape = (dx, dy) => {
    ctx.beginPath();
    ctx.roundRect(w * 0.08 + dx, base - h * 0.12 + dy, w * 0.84, h * 0.12, h * 0.06);
    for (const [x, y, r] of bumps) { ctx.moveTo(x + r + dx, y + dy); ctx.arc(x + dx, y + dy, r, 0, TAU); }
    ctx.fill();
  };
  ctx.fillStyle = p.rim;
  shape(0, 0);
  ctx.fillStyle = p.body;
  shape(-h * 0.03, -h * 0.05);
  ctx.fillStyle = shade(p.body, 1.12);
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.scale(1, 1);
  for (const [x, y, r] of bumps) { if (R() < 0.6) circle(ctx, x - r * 0.25, y - r * 0.3, r * 0.45); }
  ctx.restore();
}

export function drawFlame(ctx, w, h, p) {
  const R = rng(p.seed);
  const tear = (s, c) => {
    ctx.fillStyle = c;
    const bx = w / 2, by = h * 0.95, tw = w * 0.4 * s, th = h * 0.88 * s;
    ctx.beginPath();
    ctx.moveTo(bx + (R() - 0.5) * w * 0.15, by - th);
    ctx.quadraticCurveTo(bx + tw * 1.1, by - th * 0.35, bx + tw * 0.6, by - tw * 0.3);
    ctx.quadraticCurveTo(bx, by + tw * 0.2, bx - tw * 0.6, by - tw * 0.3);
    ctx.quadraticCurveTo(bx - tw * 1.1, by - th * 0.4, bx + (R() - 0.5) * w * 0.15, by - th);
    ctx.fill();
  };
  tear(1, '#c4401f');
  tear(0.75, '#f08a24');
  tear(0.45, '#ffd862');
}

export function drawPuff(ctx, w, h, p) {
  const R = rng(p.seed);
  ctx.fillStyle = p.color;
  for (let i = 0; i < 6; i++) circle(ctx, w * (0.3 + R() * 0.4), h * (0.35 + R() * 0.35), w * (0.16 + R() * 0.12));
  ctx.fillStyle = shade(p.color, 1.18);
  for (let i = 0; i < 3; i++) circle(ctx, w * (0.32 + R() * 0.3), h * (0.32 + R() * 0.2), w * (0.08 + R() * 0.06));
}

// ---------- Ground decals ----------

export function drawCrack(ctx, w, h, p) {
  const R = rng(p.seed), mid = h / 2, n = 24, top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = 10 + t * (w - 20);
    const y = mid + Math.sin(t * 9 + p.seed) * h * 0.12 + (R() - 0.5) * h * 0.18;
    const wd = Math.sin(Math.PI * t) * h * 0.2 * (0.6 + R() * 0.6) + 1;
    top.push([x, y - wd]);
    bot.unshift([x, y + wd]);
  }
  ctx.fillStyle = p.color;
  poly(ctx, [...top, ...bot]);
  ctx.fill();
  for (let b = 0; b < 5; b++) {
    const i = 3 + Math.floor(R() * (n - 6)), [x, y] = top[i], dir = R() < 0.5 ? -1 : 1;
    stroke(ctx, p.color, 2 + R() * 3, [[x, y], [x + 20 + R() * 40, y + dir * (10 + R() * 25)], [x + 40 + R() * 50, y + dir * (20 + R() * 20)]]);
  }
}

export function drawPatch(ctx, w, h, p) {
  const R = rng(p.seed);
  ctx.fillStyle = p.color;
  blob(ctx, w / 2, h / 2, w * 0.44, h * 0.44, R, 18, 0.22);
  ctx.fill();
  if (p.tufts) {
    ctx.fillStyle = shade(p.color, 0.8);
    for (let i = 0; i < 18; i++) {
      const x = w * (0.2 + R() * 0.6), y = h * (0.2 + R() * 0.6);
      poly(ctx, [[x - 6, y], [x - 2, y - 14], [x, y - 2], [x + 3, y - 16], [x + 6, y]]);
      ctx.fill();
    }
  }
}

export function drawScorch(ctx, w, h, p) {
  const R = rng(p.seed);
  ctx.fillStyle = '#4a3a30';
  blob(ctx, w / 2, h / 2, w * 0.45, h * 0.45, R, 22, 0.35);
  ctx.fill();
  ctx.fillStyle = '#2b221d';
  blob(ctx, w / 2, h / 2, w * 0.28, h * 0.28, R, 16, 0.3);
  ctx.fill();
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = R() < 0.5 ? '#e0662a' : '#f3a33c';
    circle(ctx, w * (0.3 + R() * 0.4), h * (0.3 + R() * 0.4), 2 + R() * 4);
  }
}

export function drawGlow(ctx, w, h, { inner = 0, color = '255,240,200' } = {}) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  if (inner) {
    g.addColorStop(0, `rgba(${color},0)`);
    g.addColorStop(inner * 0.8, `rgba(${color},0.15)`);
    g.addColorStop(inner, `rgba(${color},0.9)`);
    g.addColorStop(Math.min(1, inner + 0.12), `rgba(${color},0.25)`);
    g.addColorStop(1, `rgba(${color},0)`);
  } else {
    g.addColorStop(0, `rgba(${color},1)`);
    g.addColorStop(0.35, `rgba(${color},0.45)`);
    g.addColorStop(1, `rgba(${color},0)`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function drawRay(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  poly(ctx, [[w * 0.45, 0], [w * 0.55, 0], [w, h], [0, h]]);
  ctx.fill();
}

// ---------- Architecture ----------

export function drawStoneTile(ctx, w, h, p) {
  const R = rng(p.seed), rows = p.rows ?? 8, rh = h / rows;
  ctx.fillStyle = shade(p.color, 0.62);
  ctx.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) {
    let x = 0;
    const y = r * rh;
    const first = rh * (0.6 + R() * 1.6);
    const widths = [first];
    let sum = first;
    while (sum < w - rh * 0.9) { const bw = rh * (1.4 + R() * 1.8); widths.push(bw); sum += bw; }
    const scale = w / sum;
    for (const bw0 of widths) {
      const bw = bw0 * scale;
      ctx.fillStyle = shade(p.color, 0.86 + R() * 0.24);
      ctx.fillRect(x + 1.5, y + 1.5, bw - 3, rh - 3);
      ctx.fillStyle = 'rgba(255,248,230,0.35)';
      ctx.fillRect(x + 1.5, y + 1.5, bw - 3, 2.5);
      ctx.fillStyle = 'rgba(60,35,10,0.18)';
      ctx.fillRect(x + 1.5, y + rh - 5, bw - 3, 3.5);
      x += bw;
    }
  }
  if (p.glyphs) {
    ctx.strokeStyle = shade(p.color, 0.6);
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const x = R() * (w - 50) + 25, y = (Math.floor(R() * rows) + 0.5) * rh;
      ctx.beginPath(); ctx.arc(x, y, rh * 0.28, 0, TAU * 0.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, rh * 0.12, 0, TAU); ctx.stroke();
    }
  }
  for (let c = 0; c < (p.cracks ?? 2); c++) {
    let x = R() * w, y = R() * h * 0.5;
    const pts = [[x, y]];
    for (let i = 0; i < 7; i++) { x += (R() - 0.5) * 50; y += 20 + R() * 30; pts.push([x, y]); }
    stroke(ctx, 'rgba(50,30,15,0.55)', 2.5, pts);
  }
  applyGrain(ctx.canvas, 0.9);
}

function brokenProfile(R, w, h, lowSide) {
  const pts = [];
  const segs = 7 + Math.floor(R() * 5);
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const slope = lowSide === 'left' ? 0.35 + t * 0.65 : lowSide === 'right' ? 1 - t * 0.6 : 0.75 + Math.sin(t * Math.PI) * 0.25;
    pts.push(h * Math.max(0.2, Math.min(1, slope * (0.78 + R() * 0.3))));
  }
  return (x) => {
    const f = (x / w) * segs, i = Math.min(segs - 1, Math.floor(f));
    return pts[i];
  };
}

export function drawWall(ctx, w, h, p) {
  const R = rng(p.seed), ppm = p.ppm, pad = 8;
  const course = 0.42 * ppm, W = w - pad * 2, H = h - pad * 2;
  const top = brokenProfile(R, W, H, p.low ?? (R() < 0.5 ? 'left' : 'right'));
  const rows = Math.floor(H / course);
  for (let r = 0; r < rows; r++) {
    const y1 = h - pad - r * course;
    let x = -R() * course * 1.5;
    while (x < W) {
      const bw = (0.55 + R() * 0.8) * ppm, x0 = Math.max(0, x), x1 = Math.min(W, x + bw);
      const mid = (x0 + x1) / 2;
      if ((r + 1) * course <= top(mid) && x1 - x0 > 6 && !(r > 1 && R() < 0.03)) {
        ctx.fillStyle = shade(p.color, 0.84 + R() * 0.26);
        ctx.fillRect(pad + x0 + 1.5, y1 - course + 1.5, x1 - x0 - 3, course - 3);
        ctx.fillStyle = 'rgba(60,35,10,0.2)';
        ctx.fillRect(pad + x0 + 1.5, y1 - 5, x1 - x0 - 3, 3.5);
      }
      x += bw;
    }
  }
}

export function drawHouse(ctx, w, h, p) {
  const R = rng(p.seed), ppm = p.ppm, pad = 8, W = w - pad * 2, H = h - pad * 2;
  const top = brokenProfile(R, W, H, p.low ?? 'right');
  const steps = 40, pts = [[pad, h - pad]];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    pts.push([pad + x, h - pad - top(Math.min(W - 1, x)) + (R() - 0.5) * 6]);
  }
  pts.push([w - pad, h - pad]);
  ctx.fillStyle = p.color;
  poly(ctx, pts);
  ctx.fill();
  ctx.save();
  poly(ctx, pts);
  ctx.clip();
  ctx.fillStyle = shade(p.color, 0.8);
  ctx.fillRect(0, h - pad - H + 0.25 * ppm, w, 0.3 * ppm);
  ctx.fillRect(0, h - pad - 0.45 * ppm, w, 0.45 * ppm);
  for (let i = 0; i < 9; i++) {
    const bx = pad + R() * W, by = h - pad - R() * H * 0.8, bw = (0.5 + R() * 0.6) * ppm, bh = 0.38 * ppm;
    ctx.fillStyle = shade(p.stone ?? '#a89878', 0.85 + R() * 0.25);
    ctx.fillRect(bx, by, bw, bh);
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'destination-out';
  const door = [W * (0.3 + R() * 0.15), 1.0 * ppm, 2.1 * ppm];
  poly(ctx, [[pad + door[0], h - pad], [pad + door[0] + door[1], h - pad], [pad + door[0] + door[1] * 0.9, h - pad - door[2]], [pad + door[0] + door[1] * 0.1, h - pad - door[2]]]);
  ctx.fill();
  if (W > 4 * ppm) ctx.fillRect(pad + W * 0.72, h - pad - 2.2 * ppm, 0.7 * ppm, 0.6 * ppm);
  ctx.globalCompositeOperation = 'source-over';
  for (let c = 0; c < 3; c++) {
    let x = pad + R() * W, y = h - pad - top(x - pad) + 4;
    const cp = [[x, y]];
    for (let i = 0; i < 6; i++) { x += (R() - 0.5) * 18; y += 10 + R() * 14; cp.push([x, y]); }
    stroke(ctx, 'rgba(55,35,20,0.6)', 2, cp);
  }
}

export function drawStela(ctx, w, h, p) {
  const R = rng(p.seed), pad = 8;
  ctx.fillStyle = p.color;
  const tops = [];
  for (let i = 0; i <= 6; i++) tops.push([pad + (i / 6) * (w - 2 * pad), pad + (p.broken ? R() * h * 0.3 : (Math.abs(i - 3) / 3) ** 2 * 18)]);
  poly(ctx, [[pad, h - pad], ...tops, [w - pad, h - pad]]);
  ctx.fill();
  ctx.strokeStyle = shade(p.color, 0.68);
  ctx.lineWidth = 2.5;
  const cell = (w - 2 * pad) / 2.6;
  for (let y = h * 0.35; y < h - pad - cell; y += cell * 1.05) {
    for (let x = pad + cell * 0.25; x < w - pad - cell; x += cell * 1.1) {
      ctx.beginPath(); ctx.roundRect(x, y, cell * 0.9, cell * 0.9, 6); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + cell * 0.45, y + cell * 0.45, cell * (0.12 + R() * 0.15), 0, TAU * (0.5 + R() * 0.5)); ctx.stroke();
    }
  }
}

export function drawRoofComb(ctx, w, h, p) {
  const pad = 8, W = w - 2 * pad;
  ctx.fillStyle = p.color;
  poly(ctx, [[pad, h - pad], [pad + W * 0.08, pad + h * 0.25], [pad + W * 0.3, pad + h * 0.12], [pad + W * 0.5, pad], [pad + W * 0.7, pad + h * 0.12], [pad + W * 0.92, pad + h * 0.25], [w - pad, h - pad]]);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  const cols = 7;
  for (let i = 0; i < cols; i++) {
    const x = pad + W * (0.12 + (i / cols) * 0.8);
    ctx.fillRect(x, h * 0.4, W * 0.05, h * 0.4);
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function drawHillBand(ctx, w, h, p) {
  const R = rng(p.seed), pts = [[0, h]];
  const waves = Array.from({ length: 6 }, (_, i) => [1 + Math.floor(R() * 4) + i * 3, R() * TAU, (0.5 / (i + 1)) * (0.6 + R() * 0.8)]);
  const height = (u) => {
    let v = 0.55;
    for (const [f, ph, a] of waves) v += Math.sin(u * TAU * f + ph) * a * 0.35;
    return Math.max(0.12, Math.min(0.92, v));
  };
  for (let i = 0; i <= 512; i++) {
    const u = i / 512;
    let y = h - height(u) * h * 0.9;
    if (p.bumps) y -= Math.abs(Math.sin(u * TAU * 90 + Math.sin(u * TAU * 7) * 2)) * h * 0.06;
    pts.push([u * w, y]);
  }
  pts.push([w, h]);
  ctx.fillStyle = p.edge ?? EDGE;
  poly(ctx, pts);
  ctx.fill();
  ctx.save();
  ctx.translate(0, 5);
  ctx.fillStyle = p.color;
  poly(ctx, pts);
  ctx.fill();
  ctx.restore();
  const g = ctx.createLinearGradient(0, h * 0.2, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(40,25,10,0.28)');
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  applyGrain(ctx.canvas, 0.7);
}

export function drawGroundTile(ctx, w, h, p) {
  const R = rng(p.seed);
  ctx.fillStyle = p.color;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(${R() < 0.5 ? '255,245,220' : '70,50,25'},${0.05 + R() * 0.06})`;
    const x = R() * w, y = R() * h, r = 1 + R() * 5;
    circle(ctx, x, y, r);
  }
  applyGrain(ctx.canvas, 1);
}
