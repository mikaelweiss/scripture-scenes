// Low-poly animals merged into the static batch. Each faces local +z.
import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const BALL = new THREE.IcosahedronGeometry(0.5, 0);
const BODY = new THREE.IcosahedronGeometry(0.5, 1);
const FLUFF = new THREE.DodecahedronGeometry(0.5, 0);
const LEG = new THREE.CylinderGeometry(0.5, 0.4, 1, 5);
const CONE = new THREE.ConeGeometry(0.5, 1, 5);

const KINDS = {
  sheep: { body: [0.55, 0.5, 0.85], leg: 0.36, legW: 0.09, head: [0.2, 0.22, 0.32], neck: 0.15, tilt: 0.9, color: '#ece5d2', headColor: '#3b3330', legColor: '#3b3330', fluffy: true, ears: 'side' },
  goat: { body: [0.42, 0.45, 0.85], leg: 0.45, legW: 0.07, head: [0.18, 0.2, 0.32], neck: 0.25, tilt: 0.5, color: '#8a6d52', horns: 'back', tail: 0.15 },
  lion: { body: [0.55, 0.55, 1.35], leg: 0.55, legW: 0.15, head: [0.36, 0.36, 0.42], neck: 0.1, tilt: 1.1, color: '#c79a5a', mane: '#7a4a22', tail: 0.8, maleOnly: 'mane' },
  deer: { body: [0.4, 0.45, 1.0], leg: 0.75, legW: 0.07, head: [0.17, 0.2, 0.36], neck: 0.5, tilt: 0.35, color: '#a8744a', antlers: true, tail: 0.1, maleOnly: 'antlers', ears: 'up' },
  horse: { body: [0.55, 0.65, 1.55], leg: 0.9, legW: 0.11, head: [0.22, 0.28, 0.6], neck: 0.75, tilt: 0.55, color: '#6e4a30', maneLine: '#2a1d14', tail: 0.7, ears: 'up' },
  camel: { body: [0.6, 0.6, 1.5], leg: 1.15, legW: 0.11, head: [0.22, 0.24, 0.5], neck: 0.9, tilt: 0.75, color: '#c8a26c', hump: true, tail: 0.4, ears: 'up' },
  ox: { body: [0.8, 0.8, 1.6], leg: 0.6, legW: 0.15, head: [0.36, 0.38, 0.5], neck: 0.15, tilt: 1.2, color: '#5d4532', horns: 'side', tail: 0.6 },
  elephant: { body: [1.5, 1.6, 2.5], leg: 1.2, legW: 0.34, head: [0.9, 1.0, 0.8], neck: 0.0, tilt: 0, color: '#8b8a88', trunk: true, bigEars: true, tail: 0.6 },
  giraffe: { body: [0.7, 0.85, 1.5], leg: 1.7, legW: 0.1, head: [0.22, 0.26, 0.55], neck: 2.0, tilt: 0.3, color: '#d9a64e', spots: '#8a5a2a', tail: 0.6, ossicones: true, ears: 'side' },
  bear: { body: [0.8, 0.8, 1.4], leg: 0.55, legW: 0.2, head: [0.4, 0.38, 0.45], neck: 0.1, tilt: 1.1, color: '#4a3324', ears: 'round' },
  wolf: { body: [0.38, 0.45, 1.05], leg: 0.55, legW: 0.08, head: [0.22, 0.24, 0.4], neck: 0.2, tilt: 0.9, color: '#7a7470', tail: 0.5, ears: 'up' },
  rabbit: { body: [0.25, 0.28, 0.4], leg: 0.06, legW: 0.06, head: [0.15, 0.17, 0.2], neck: 0.0, color: '#b7a58e', ears: 'long' },
  pig: { body: [0.5, 0.48, 0.95], leg: 0.25, legW: 0.08, head: [0.3, 0.3, 0.35], neck: 0.0, color: '#d79c8f', ears: 'side' },
};

function placer(ctx, base, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return (geo, [lx, ly, lz], scale, color, rot = [0, 0, 0], jitter = 0.06) =>
    ctx.solid.add(geo, {
      position: [base[0] + lx * c + lz * s, base[1] + ly, base[2] - lx * s + lz * c],
      rotation: [rot[0], yaw + rot[1], rot[2]],
      scale,
      color,
      jitter,
    });
}

export function animal(ctx, { kind, x, z, y, yaw = 0, scale = 1, female = false, color }) {
  if (kind === 'dove' || kind === 'raven') return bird(ctx, { x, z, y, yaw, scale, color: color ?? (kind === 'dove' ? '#f2efe8' : '#1e1b1c') });
  const k = KINDS[kind];
  const S = scale;
  const base = [x, y ?? ctx.heightAt(x, z), z];
  const put = placer(ctx, base, yaw);
  const col = color ?? k.color;
  const [bw, bh, bl] = k.body.map((v) => v * S);
  const leg = k.leg * S, lw = k.legW * S;
  const by = leg + bh / 2;
  put(k.fluffy ? FLUFF : BODY, [0, by, 0], [bw * 1.12, bh * 1.08, bl * 1.12], col);
  if (k.spots) for (let i = 0; i < 6; i++) put(BOX, [(i % 2 ? 1 : -1) * bw * 0.46, by + ((i % 3) - 1) * bh * 0.22, (Math.floor(i / 2) - 1) * bl * 0.25], [0.04 * S, bh * 0.16, bl * 0.14], k.spots);
  const legColor = k.legColor ?? col;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(LEG, [sx * (bw / 2 - lw * 0.8), leg / 2 + 0.02, sz * (bl / 2 - lw * 1.4)], [lw * 2, leg + 0.06, lw * 2], legColor);
  if (k.hump) put(BALL, [0, by + bh * 0.55, -bl * 0.05], [bw * 0.7, bh * 0.7, bl * 0.45], col);

  const neckBase = [0, by + bh * 0.25, bl / 2 - 0.05 * S];
  const nl = k.neck * S, tilt = k.tilt ?? 0;
  const dir = [0, Math.cos(tilt), Math.sin(tilt)];
  if (nl > 0.05) {
    const nw = Math.max(lw * 2.2, bw * 0.3);
    put(BOX, [0, neckBase[1] + dir[1] * nl / 2, neckBase[2] + dir[2] * nl / 2], [nw, nl + nw * 0.6, nw * 1.1], col, [tilt, 0, 0]);
    if (k.maneLine) put(BOX, [0, neckBase[1] + dir[1] * nl / 2 + 0.06 * S, neckBase[2] + dir[2] * nl / 2 - nw * 0.55], [nw * 0.35, nl, nw * 0.4], k.maneLine, [tilt, 0, 0]);
  }
  const [hw, hh, hl] = k.head.map((v) => v * S);
  const hy = neckBase[1] + dir[1] * nl + (nl > 0.05 ? 0 : bh * 0.1);
  const hz = neckBase[2] + dir[2] * nl + hl * 0.35;
  const headColor = k.headColor ?? col;
  put(BOX, [0, hy, hz], [hw, hh, hl], headColor, [nl > 0.3 ? 0.35 : 0.1, 0, 0]);
  put(BOX, [0, hy - hh * 0.15, hz + hl * 0.5], [hw * 0.55, hh * 0.3, 0.04 * S], '#1d1714', [0, 0, 0], 0.02);
  if (k.mane && !(female && k.maleOnly === 'mane')) put(FLUFF, [0, hy, hz - hl * 0.35], [hw * 2.6, hh * 2.6, hl * 1.4], k.mane, [0.3, 0, 0]);
  if (k.ears === 'up' || k.ears === 'long') for (const sx of [-1, 1]) put(CONE, [sx * hw * 0.32, hy + hh * 0.6, hz - hl * 0.3], [0.07 * S, (k.ears === 'long' ? 0.35 : 0.16) * S, 0.05 * S], headColor, [-0.2, 0, sx * -0.2]);
  if (k.ears === 'side' || k.ears === 'round') for (const sx of [-1, 1]) put(BOX, [sx * hw * 0.6, hy + hh * 0.25, hz - hl * 0.2], [0.14 * S, 0.06 * S, 0.1 * S], headColor, [0, 0, sx * 0.4]);
  if (k.horns === 'side') for (const sx of [-1, 1]) put(CONE, [sx * hw * 0.65, hy + hh * 0.45, hz - hl * 0.2], [0.08 * S, 0.35 * S, 0.08 * S], '#e6dcc4', [0, 0, -sx * 1.1]);
  if (k.horns === 'back') for (const sx of [-1, 1]) put(CONE, [sx * hw * 0.25, hy + hh * 0.6, hz - hl * 0.4], [0.05 * S, 0.3 * S, 0.05 * S], '#3a2e24', [-0.7, 0, 0]);
  if (k.antlers && !female) {
    for (const sx of [-1, 1]) {
      put(LEG, [sx * hw * 0.4, hy + hh * 0.9, hz - hl * 0.3], [0.04 * S, 0.5 * S, 0.04 * S], '#d8c6a4', [-0.3, 0, sx * -0.5]);
      put(LEG, [sx * hw * 0.85, hy + hh * 1.3, hz - hl * 0.25], [0.035 * S, 0.3 * S, 0.035 * S], '#d8c6a4', [0.4, 0, sx * -0.2]);
    }
  }
  if (k.ossicones) for (const sx of [-1, 1]) put(LEG, [sx * hw * 0.25, hy + hh * 0.7, hz - hl * 0.3], [0.04 * S, 0.22 * S, 0.04 * S], '#6b4a2a');
  if (k.trunk) {
    put(LEG, [0, hy - hh * 0.35, hz + hl * 0.55], [0.26 * S, hh * 0.9, 0.26 * S], col, [0.25, 0, 0]);
    put(LEG, [0, hy - hh * 0.95, hz + hl * 0.7], [0.18 * S, hh * 0.55, 0.18 * S], col, [-0.1, 0, 0]);
    for (const sx of [-1, 1]) put(CONE, [sx * hw * 0.3, hy - hh * 0.3, hz + hl * 0.6], [0.08 * S, 0.55 * S, 0.08 * S], '#efe8d6', [1.9, 0, 0]);
  }
  if (k.bigEars) for (const sx of [-1, 1]) put(BOX, [sx * hw * 0.7, hy + hh * 0.05, hz - hl * 0.25], [0.08 * S, hh * 0.95, hl * 0.95], col, [0, sx * 0.5, 0]);
  if (k.tail) put(BOX, [0, by + bh * 0.1 - k.tail * S * 0.4, -bl / 2 - 0.05 * S], [0.06 * S, k.tail * S, 0.06 * S], k.maneLine ?? col, [-0.3, 0, 0]);
  return base;
}

function bird(ctx, { x, z, y, yaw, scale, color }) {
  const base = [x, y ?? ctx.heightAt(x, z), z];
  const put = placer(ctx, base, yaw);
  const S = scale;
  put(BALL, [0, 0.16 * S, 0], [0.18 * S, 0.16 * S, 0.3 * S], color);
  put(BALL, [0, 0.27 * S, 0.12 * S], [0.11 * S, 0.11 * S, 0.11 * S], color);
  put(CONE, [0, 0.27 * S, 0.2 * S], [0.03 * S, 0.07 * S, 0.03 * S], '#d68a3a', [Math.PI / 2, 0, 0]);
  put(BOX, [0, 0.17 * S, -0.18 * S], [0.12 * S, 0.03 * S, 0.14 * S], color, [0.3, 0, 0]);
  return base;
}

// Places pairs of animals along a path of points, each pair side by side facing along the path.
export function pairsAlong(ctx, path, kinds, { gap = 1.0, scale = 1, colors = {} } = {}) {
  kinds.forEach((kind, i) => {
    const j = Math.min(i, path.length - 1);
    const [x, z] = path[j];
    const [ax, az] = j > 0 ? path[j - 1] : path[0];
    const [bx, bz] = j > 0 ? path[j] : path[1];
    const dx = ax - bx, dz = az - bz;
    const yaw = Math.atan2(dx, dz);
    const len = Math.hypot(dx, dz);
    const px = -dz / len, pz = dx / len;
    const k = KINDS[kind];
    const w = (k ? k.body[0] : 0.3) * scale * 0.5 + gap;
    for (const side of [-1, 1]) animal(ctx, { kind, x: x + px * w * side, z: z + pz * w * side, yaw: yaw + side * 0.05, scale, female: side > 0, color: colors[kind] });
  });
}

export const animalKinds = Object.keys(KINDS);
