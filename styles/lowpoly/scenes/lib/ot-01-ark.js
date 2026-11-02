// Noah's ark: a long planked barge with a roofed house on deck. Local x runs bow to stern, +z is the door side.
import * as THREE from 'three';

const PRISM = new THREE.CylinderGeometry(1, 1, 1, 3, 1, false, Math.PI / 2).rotateZ(Math.PI / 2);

function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export function ark(ctx, { x, z, y, rot = 0, L = 80, W = 14, H = 10, built = 1, tilt = [0, 0], wood = '#7d5b3a', dark = '#4f3824', pitch = '#3a2a1e', roof = '#6a4a2c', scaffold = false, rampSide = 1, doorAt = 8, rampLen = 16 }) {
  const at = frame(x, z, rot);
  const y0 = y ?? ctx.heightAt(x, z);
  const b = ctx.solid;
  const n = Math.round(H / 1.1);
  const rh = H / n;
  const cut = -L / 2 + built * L;
  const box = (w, h, d, lx, ly, lz, color, extra = [0, 0, 0], jitter = 0.05) => {
    const [px, pz] = at(lx, lz);
    b.box(w, h, d, { position: [px, y0 + ly, pz], rotation: [tilt[0] + extra[0], rot + extra[1], tilt[1] + extra[2]], color, jitter });
  };
  const Lb = L * 0.78;
  box(Lb, 0.7, 2, 0, 0.35, 0, pitch);
  for (let k = 0; k < n; k++) {
    const f = k / (n - 1);
    const Lk = Lb + (L - Lb) * Math.pow(f, 0.7);
    const Wk = W * (0.84 + 0.16 * Math.sqrt(f));
    const yk = 0.7 + k * rh + rh / 2;
    const shade = k % 2 ? wood : pitch === wood ? wood : new THREE.Color(wood).multiplyScalar(0.9).getStyle();
    const x0 = -Lk / 2, x1 = Math.min(Lk / 2, cut);
    if (x1 > x0) for (const side of [-1, 1]) box(x1 - x0, rh * 1.02, 0.4, (x0 + x1) / 2, yk, side * Wk / 2, shade);
    box(0.4, rh * 1.02, Wk, -Lk / 2, yk, 0, shade);
    if (built >= 1) box(0.4, rh * 1.02, Wk, Lk / 2, yk, 0, shade);
    if (k === 0) box(Lk, 0.3, Wk, 0, yk - rh / 2, 0, dark);
  }
  const top = 0.7 + H;
  // tar band along the waterline and a rub rail at the top
  for (const side of [-1, 1]) {
    box(Math.min(Lb, cut + L / 2) * 0.98, 0.6, 0.12, -L / 2 + Math.min(Lb, cut + L / 2) / 2 + (L - Lb) / 4, 1.4, side * (W * 0.86) / 2 + side * 0.18, pitch);
    if (built >= 1) box(L + 0.4, 0.5, 0.6, 0, top, side * W / 2, dark);
  }
  if (built < 1) {
    for (let lx = Math.max(cut + 1.5, -L / 2 + 2); lx < L / 2 - 0.5; lx += 2.6) {
      const f = 1 - Math.abs(lx) / (L / 2);
      const hh = H * (f < 0.12 ? 0.6 + f * 3 : 1);
      for (const side of [-1, 1]) box(0.45, hh, 0.5, lx, 0.7 + hh / 2, side * W * 0.47, wood, [0, 0, side * -0.06]);
      box(0.45, 0.45, W, lx, 0.9, 0, wood);
      box(0.4, 0.4, W * 0.98, lx, 0.7 + hh - 0.2, 0, wood);
    }
    box(L / 2 - cut, 0.5, 0.5, (cut + L / 2) / 2, top - 0.3, 0, wood);
  }
  if (built >= 1) {
    box(L - 0.6, 0.35, W - 0.6, 0, top - 0.1, 0, dark);
    const cl = L * 0.72, cw = W * 0.62, ch = 3.4;
    box(cl, ch, cw, 0, top + ch / 2, 0, wood);
    box(cl + 0.1, 0.7, cw + 0.1, 0, top + ch - 0.6, 0, '#2b1e14');
    for (let wx = -cl / 2 + 2; wx < cl / 2 - 1; wx += 3.2) for (const side of [-1, 1]) box(0.35, 0.75, 0.2, wx, top + ch - 0.6, side * (cw / 2 + 0.08), wood);
    const rw = cw + 2.4, rhh = 3.2;
    const [px, pz] = at(0, 0);
    b.add(PRISM, { position: [px, y0 + top + ch + rhh * 0.33, pz], rotation: [tilt[0], rot, tilt[1]], scale: [cl + 2, rhh / 1.5, rw / 1.732], color: roof, jitter: 0.04 });
  }
  const hasDoor = doorAt < cut - 3;
  if (hasDoor) box(4, 4.2, 0.3, doorAt, 0.7 + H * 0.3 + 2.1, rampSide * (W * 0.92 / 2 + 0.3), '#2a1c12');
  // collision: hull, then a ramp made of rising steps
  ctx.colliders.add({ x, z, w: L * 0.95, d: W, rot, bottom: y0 - 2, top: y0 + top + 6 });
  if (hasDoor && rampLen) {
    const rise = H * 0.3 + 0.7;
    const len = rampLen;
    const [rx, rz] = at(doorAt, rampSide * (W / 2 + len / 2));
    const slope = Math.atan2(rise, len);
    const yMid = y0 + rise / 2;
    b.box(4, 0.4, Math.hypot(rise, len), { position: [rx, yMid, rz], rotation: [rampSide * slope, rot, 0], color: wood, jitter: 0.04 });
    for (let i = 0; i < 12; i++) {
      const f = (i + 0.5) / 12;
      const [sx, sz] = at(doorAt, rampSide * (W / 2 + len * (1 - f)));
      b.box(4.1, 0.12, 0.18, { position: [sx, y0 + rise * f + 0.22, sz], rotation: [0, rot, 0], color: dark });
      ctx.colliders.add({ x: sx, z: sz, w: 4, d: len / 12 + 0.05, rot, bottom: y0 - 1, top: y0 + rise * f + 0.2 });
    }
    for (let i = 0; i < 4; i++) {
      const f = (i + 0.5) / 4;
      const [sx, sz] = at(doorAt, rampSide * (W / 2 + len * (1 - f)));
      b.box(0.4, rise * f, 0.4, { position: [sx + 0, y0 + (rise * f) / 2, sz], rotation: [0, rot, 0], color: dark });
    }
  }
  if (scaffold) {
    const from = Math.max(-L / 2, cut - 14);
    for (let lx = from; lx <= L / 2 + 0.1; lx += 4) {
      for (const side of [-1, 1]) {
        const lz = side * (W / 2 + 1.6);
        box(0.22, H + 1.5, 0.22, lx, (H + 1.5) / 2, lz, '#8a6a46');
        box(0.22, H + 1.5, 0.22, lx, (H + 1.5) / 2, lz + side * 1.4, '#8a6a46');
      }
    }
    for (const hy of [3.2, 6.4, H]) {
      for (const side of [-1, 1]) {
        const lz = side * (W / 2 + 2.3);
        box(L / 2 - from, 0.15, 1.6, (from + L / 2) / 2, hy, lz, '#a4835a');
        box(L / 2 - from, 0.12, 0.12, (from + L / 2) / 2, hy + 1, lz + side * 0.8, '#8a6a46');
      }
    }
    // a ladder up the near side
    const [lxp, lzp] = at(from + 2, rampSide * (W / 2 + 3.4));
    b.box(1, Math.hypot(H, 3), 0.15, { position: [lxp, y0 + H / 2, lzp], rotation: [rampSide * -0.28, rot, 0], color: '#9a7a50' });
  }
  return { top: y0 + top, at };
}
