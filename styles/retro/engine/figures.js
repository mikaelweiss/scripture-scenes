import * as THREE from 'three';

// Figure sprites are painted as data, not color: R = shade, G = material slot.
// Slots: 0 robe, 1 cloak, 2 skin, 3 hair. The crowd shader colors each slot per person,
// so a handful of drawings yields thousands of distinct people.
export const SLOT = { robe: 0, cloak: 1, skin: 2, hair: 3 };

export const FIGURES = {
  man: {},
  hooded: { hood: true, mantle: true },
  woman: { headcover: true, wide: 0.6 },
  womanHair: { longHair: true },
  elder: { mantle: true, staff: true, stoop: 1 },
  child: { child: true },
  childGirl: { child: true, longHair: true },
  kneelMan: { kneel: true, mantle: true },
  kneelWoman: { kneel: true, headcover: true },
  christ: { armsOut: true, mantle: true, longHair: true, tall: true },
};

const VIEWS = ['front', 'side', 'back'];
const REF_H = 48;

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function proportions(spec) {
  if (spec.child) return { headY: 8, headRx: 4.2, headRy: 5.2, shoulderY: 15, waistY: 27, hemY: 45, shW: 5, waW: 4.4, hemW: 5.6 };
  return { headY: 6.2, headRx: 3.3, headRy: 4.1, shoulderY: 11.5, waistY: 22, hemY: 45, shW: 5.8, waW: 4.6, hemW: 6.4 + (spec.wide ?? 0) };
}

// Returns {slot, shade} for a point in reference space (x centered, y from top), or null.
function sample(spec, view, x, y) {
  const P = proportions(spec);
  const side = view === 'side';
  const back = view === 'back';
  const k = side ? 0.68 : 1;

  if (spec.kneel) {
    const squash = 0.64;
    if (side && y > 37 && y <= 46 && x > -2 && x < 7.5) return { slot: SLOT.robe, shade: 0.62 + (46 - y) * 0.02 };
    y = 47 - (47 - y) / squash;
    if (y < 0) return null;
    if (!side && y > P.hemY - 6 && y <= 47) {
      const hw = P.hemW * 1.25;
      if (Math.abs(x) < hw) return { slot: SLOT.robe, shade: 0.7 - Math.abs(x) / hw * 0.2 };
    }
  }

  const stoop = spec.stoop ?? 0;
  const lean = side ? stoop * Math.max(0, (P.waistY - y) / P.waistY) * 2 : 0;
  const cx = x - lean;

  if (spec.staff && !back && Math.abs(x - (side ? 4.5 : 8.2)) < 0.65 && y > 4 && y < 47.5) return { slot: SLOT.cloak, shade: 0.45 };

  // Head and head coverings.
  const hx = cx - (side ? 0.9 : 0);
  const hy = y - P.headY;
  const inHead = (hx / P.headRx) ** 2 + (hy / P.headRy) ** 2 <= 1;
  const covered = spec.hood || spec.headcover;
  if (covered) {
    const rx = P.headRx + 1.2, ry = P.headRy + 1.1;
    const inCover = ((cx - (side ? 0.3 : 0)) / rx) ** 2 + ((y - P.headY + 0.4) / ry) ** 2 <= 1;
    const drape = y > P.headY && y < P.shoulderY + (spec.headcover ? 6 : 3) && Math.abs(cx) < P.headRx + 1.6 + (y - P.headY) * 0.25;
    if (inCover || drape) {
      const faceRx = P.headRx - 0.9, faceRy = P.headRy - 0.6;
      const fx = side ? hx - 1.4 : hx;
      const inFace = !back && (fx / faceRx) ** 2 + ((hy - 0.6) / faceRy) ** 2 <= 1 && (!side || hx > 0);
      if (inFace) return { slot: SLOT.skin, shade: 0.78 - (side ? 0 : hx * 0.05) };
      return { slot: SLOT.cloak, shade: 0.72 - cx * 0.03 + (inCover ? 0.06 : 0) };
    }
  } else if (inHead) {
    const hairTop = hy < -P.headRy * 0.45;
    let hair = hairTop || back;
    if (side) hair = hair || hx < -0.6;
    else if (!back) hair = hair || Math.abs(hx) > P.headRx - 0.9 && hy < 0.5;
    if (hair) return { slot: SLOT.hair, shade: 0.7 - hx * 0.04 };
    return { slot: SLOT.skin, shade: 0.86 - hx * 0.05 };
  }
  if (spec.longHair && !covered) {
    const reach = P.shoulderY + (spec.child ? 4 : 6);
    if (y > P.headY && y < reach) {
      const inBack = back && Math.abs(cx) < P.headRx + 0.6;
      const inSide = !back && !side && Math.abs(cx) > P.headRx - 1.2 && Math.abs(cx) < P.headRx + 0.8 && y < P.shoulderY + 3;
      const inSideView = side && cx < -0.2 && cx > -P.headRx - 0.8;
      if (inBack || inSide || inSideView) return { slot: SLOT.hair, shade: 0.62 };
    }
  }

  // Neck.
  if (y > P.headY + P.headRy - 1 && y <= P.shoulderY && Math.abs(cx) < 1.3) return { slot: SLOT.skin, shade: 0.6 };

  // Arms stretched out and down, as in blessing.
  if (spec.armsOut && !side) {
    for (const s of [-1, 1]) {
      const ax = s * P.shW * 0.8, ay = P.shoulderY + 1.5;
      const bx = s * (P.shW + 8.5), by = P.shoulderY + 12;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(cx - (ax + dx * t), y - (ay + dy * t));
      if (t > 0.86 && d < 1.3) return { slot: SLOT.skin, shade: 0.85 };
      if (d < 1.6 + t * 0.9) return { slot: back ? SLOT.cloak : SLOT.robe, shade: 0.78 - (d / 2.5) * 0.25 };
    }
  }

  // Torso and robe.
  if (y < P.shoulderY || y > 47.5) return null;
  let hw;
  if (y < P.shoulderY + 2) hw = P.shW - 1.6 + (y - P.shoulderY) * 0.8;
  else if (y < P.waistY) hw = P.shW + (P.waW - P.shW) * ((y - P.shoulderY - 2) / (P.waistY - P.shoulderY - 2));
  else hw = P.waW + (P.hemW - P.waW) * Math.min(1, (y - P.waistY) / (P.hemY - P.waistY));
  hw *= k;

  if (y > P.hemY) {
    const feet = side ? cx > -1.5 && cx < 2.8 : Math.abs(Math.abs(cx) - 1.8) < 1.1;
    return feet ? { slot: SLOT.cloak, shade: 0.35 } : null;
  }

  // Sleeves hang at the sides.
  if (!spec.armsOut) {
    const armTop = P.shoulderY + 1, armBot = P.waistY + 5;
    if (y > armTop && y < armBot + 2.2) {
      const ax = side ? 0.6 : hw + 0.9;
      const inArm = side ? Math.abs(cx - ax) < 1.6 : Math.abs(Math.abs(cx) - ax) < 1.3;
      if (inArm) {
        if (y >= armBot && !back) return { slot: SLOT.skin, shade: 0.7 };
        if (y < armBot) return { slot: spec.mantle && !side ? SLOT.cloak : SLOT.robe, shade: 0.55 };
      }
    }
  }

  if (Math.abs(cx) > hw) return null;

  const across = cx / Math.max(hw, 0.1);
  let shade = 0.8 + (1 - Math.abs(across)) * 0.14 - across * 0.08;
  if (y > P.waistY) shade += Math.sin(cx * 1.7 + 0.5) * 0.06;
  let slot = SLOT.robe;

  if (Math.abs(y - P.waistY) < 0.9 && !spec.armsOut) { slot = SLOT.cloak; shade *= 0.85; }
  if (spec.armsOut && Math.abs(y - P.waistY) < 0.7) { slot = SLOT.cloak; shade *= 0.95; }

  if (spec.mantle) {
    const low = P.waistY + (back ? 12 : 4);
    if (y < low) {
      let m;
      if (back) m = true;
      else if (side) m = cx < 0.5 || y < P.shoulderY + 4;
      else m = Math.abs(cx) > 1.2 + (y - P.shoulderY) * 0.3;
      if (m) { slot = SLOT.cloak; shade *= 0.95; }
    }
  }
  return { slot, shade };
}

function paintCell(data, stride, ox, oy, w, h, spec, view) {
  const s = REF_H / h;
  const cells = [];
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const x = (px + 0.5 - w / 2) * s;
      const y = (py + 0.5) * s;
      cells.push(sample(spec, view, x, y));
    }
  }
  const at = (px, py) => (px < 0 || py < 0 || px >= w || py >= h ? null : cells[py * w + px]);
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const c = at(px, py);
      if (!c) continue;
      let shade = c.shade + (hash(px, py) - 0.5) * 0.06;
      const edge = !at(px - 1, py) || !at(px + 1, py) || !at(px, py - 1) || !at(px, py + 1);
      if (edge) shade *= 0.62;
      else {
        const nb = [at(px + 1, py), at(px, py + 1)];
        if (nb.some((n) => n && n.slot !== c.slot)) shade *= 0.82;
      }
      const i = ((oy + py) * stride + ox + px) * 4;
      data[i] = Math.max(0, Math.min(255, shade * 230));
      data[i + 1] = c.slot * 85;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }
}

// Atlas: one row per figure type, columns front / side / back.
export function buildAtlas(types, cellW = 24, cellH = 48) {
  const canvas = document.createElement('canvas');
  canvas.width = cellW * VIEWS.length;
  canvas.height = cellH * types.length;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  types.forEach((type, row) => {
    const spec = FIGURES[type];
    if (!spec) throw new Error(`Unknown figure type: ${type}`);
    VIEWS.forEach((view, col) => paintCell(img.data, canvas.width, col * cellW, row * cellH, cellW, cellH, spec, view));
  });
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return { texture: tex, rows: types.length, aspect: cellW / cellH };
}
