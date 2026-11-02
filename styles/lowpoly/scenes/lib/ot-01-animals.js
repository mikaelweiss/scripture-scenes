// Low-poly animals merged into the static batch. Each faces local +z.
import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const BALL = new THREE.IcosahedronGeometry(0.5, 0);
const BODY = new THREE.IcosahedronGeometry(0.5, 1);
const FLUFF = new THREE.DodecahedronGeometry(0.5, 0);
const LEG = new THREE.CylinderGeometry(0.5, 0.36, 1, 6);
const NECK = new THREE.CylinderGeometry(0.4, 0.5, 1, 6);
const CONE = new THREE.ConeGeometry(0.5, 1, 5);
const CURL = new THREE.TorusGeometry(0.5, 0.17, 4, 9, Math.PI * 1.5);

// body [w, h, l], leg length, leg width, neck length and tilt from vertical, head [w, h, l] with snout share and pitch.
const KINDS = {
  sheep: { body: [0.62, 0.55, 0.9], leg: 0.38, legW: 0.06, neck: 0.18, tilt: 0.9, head: [0.2, 0.22, 0.34], snout: 0.55, pitch: 0.5, color: '#ece5d2', headColor: '#3b3330', legColor: '#3b3330', wool: true, ears: 'side', horns: 'curl', maleOnly: 'horns', tail: 'stub' },
  goat: { body: [0.42, 0.45, 0.85], leg: 0.45, legW: 0.055, neck: 0.3, tilt: 0.45, head: [0.17, 0.2, 0.34], snout: 0.5, pitch: 0.55, color: '#8a6d52', belly: '#c9b49a', horns: 'back', beard: true, ears: 'side', tail: 'stub', hoof: '#2a221c' },
  lion: { body: [0.55, 0.58, 1.35], leg: 0.55, legW: 0.1, neck: 0.18, tilt: 0.95, head: [0.36, 0.34, 0.46], snout: 0.42, pitch: 0.15, color: '#c99a58', belly: '#e0c08a', mane: '#7a4a22', maleOnly: 'mane', ears: 'round', tail: 'tuft', paws: true },
  deer: { body: [0.4, 0.46, 1.0], leg: 0.78, legW: 0.05, neck: 0.55, tilt: 0.4, head: [0.17, 0.2, 0.38], snout: 0.5, pitch: 0.75, color: '#a8744a', belly: '#e6d2b2', antlers: true, maleOnly: 'antlers', ears: 'up', tail: 'stub', hoof: '#2a201a' },
  horse: { body: [0.55, 0.66, 1.55], leg: 0.92, legW: 0.075, neck: 0.85, tilt: 0.5, head: [0.22, 0.28, 0.62], snout: 0.55, pitch: 1.05, color: '#6e4a30', mane: '#2a1d14', maneLine: true, ears: 'up', tail: 'long', hoof: '#221a14' },
  camel: { body: [0.62, 0.62, 1.5], leg: 1.15, legW: 0.07, neck: 0.95, tilt: 1.05, neckUp: 0.45, head: [0.22, 0.26, 0.52], snout: 0.55, pitch: 0.2, color: '#c8a26c', hump: true, ears: 'up', tail: 'thin', hoof: '#8a6e48' },
  ox: { body: [0.82, 0.82, 1.6], leg: 0.6, legW: 0.1, neck: 0.22, tilt: 1.1, head: [0.38, 0.38, 0.5], snout: 0.5, pitch: 0.55, color: '#5d4532', muzzle: '#c9b39a', horns: 'side', shoulder: true, ears: 'side', tail: 'tuft', hoof: '#221a14' },
  elephant: { body: [1.5, 1.6, 2.4], leg: 1.2, legW: 0.24, neck: 0, head: [0.95, 1.0, 0.8], snout: 0, pitch: 0, color: '#8b8a88', trunk: true, bigEars: true, tail: 'thin', toes: '#d8d2c4' },
  giraffe: { body: [0.7, 0.85, 1.4], leg: 1.6, frontLeg: 1.2, legW: 0.065, neck: 2.1, tilt: 0.32, head: [0.22, 0.26, 0.58], snout: 0.5, pitch: 1.1, color: '#d9a64e', spots: '#8a5a2a', ossicones: true, ears: 'side', tail: 'tuft', maneLine: true, mane: '#8a5a2a', hoof: '#3a2a1c' },
  bear: { body: [0.85, 0.85, 1.4], leg: 0.55, legW: 0.15, neck: 0.15, tilt: 1.15, head: [0.42, 0.4, 0.46], snout: 0.45, pitch: 0.3, color: '#4a3324', muzzle: '#8a6a4c', ears: 'round', shoulder: true, paws: true, tail: 'stub' },
  wolf: { body: [0.38, 0.46, 1.05], leg: 0.55, legW: 0.055, neck: 0.25, tilt: 0.75, head: [0.24, 0.24, 0.44], snout: 0.55, pitch: 0.25, color: '#7a7470', belly: '#c4beb6', ears: 'point', tail: 'bushy', paws: true },
  rabbit: { body: [0.26, 0.3, 0.42], leg: 0.06, legW: 0.05, neck: 0, head: [0.16, 0.17, 0.2], snout: 0.3, pitch: 0, color: '#b7a58e', ears: 'long', tail: 'cotton', haunch: true, haunchSize: 1.25 },
  pig: { body: [0.52, 0.5, 0.95], leg: 0.24, legW: 0.06, neck: 0, head: [0.32, 0.3, 0.34], snout: 0.3, pitch: 0.1, color: '#d79c8f', ears: 'side', tail: 'curl', disc: true, hoof: '#8a5a50' },
};

const EYE = '#15110f';

function placer(ctx, base, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return (geo, [lx, ly, lz], scale, color, rot = [0, 0, 0], jitter = 0.05) =>
    ctx.solid.add(geo, {
      position: [base[0] + lx * c + lz * s, base[1] + ly, base[2] - lx * s + lz * c],
      rotation: [rot[0], yaw + rot[1], rot[2]],
      scale,
      color,
      jitter,
    });
}

// Places parts in a frame pitched by `pitch` around local x (positive tips +z downward).
function framed(put, origin, pitch) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return (geo, [x, y, z], scale, color, rot = [0, 0, 0], jitter) =>
    put(geo, [origin[0] + x, origin[1] + y * cp - z * sp, origin[2] + y * sp + z * cp], scale, color, [pitch + rot[0], rot[1], rot[2]], jitter);
}

export function animal(ctx, { kind, x, z, y, yaw = 0, scale = 1, female = false, color }) {
  if (kind === 'dove' || kind === 'raven') return bird(ctx, { x, z, y, yaw, scale, color: color ?? (kind === 'dove' ? '#f2efe8' : '#1e1b1c') });
  const k = KINDS[kind];
  const S = scale;
  const male = !female;
  const has = (part) => k[part] && (male || k.maleOnly !== part);
  const base = [x, y ?? ctx.heightAt(x, z), z];
  const put = placer(ctx, base, yaw);
  const col = color ?? k.color;
  const belly = k.belly ?? col;
  const legColor = k.legColor ?? col;
  const headColor = k.headColor ?? col;
  const [bw, bh, bl] = k.body.map((v) => v * S);
  const rearLeg = k.leg * S, frontLeg = rearLeg * (k.frontLeg ?? 1), lw = k.legW * S;
  const rearY = rearLeg + bh / 2, frontY = frontLeg + bh / 2;
  const slope = -Math.atan2(frontY - rearY, bl * 0.6);
  const midY = (rearY + frontY) / 2;

  // Torso as chest, belly and rump so the back dips and the shoulders read.
  const torso = framed(put, [0, midY, 0], slope);
  if (k.wool) {
    torso(FLUFF, [0, 0, 0], [bw * 1.1, bh * 1.05, bl * 1.05], col);
    for (const [px, py, pz] of [[-0.3, 0.25, 0.25], [0.3, 0.25, 0.25], [-0.3, 0.25, -0.25], [0.3, 0.25, -0.25], [0, 0.4, 0], [0, 0.1, -0.45], [0, 0.15, 0.42]]) {
      torso(FLUFF, [px * bw, py * bh, pz * bl], [bw * 0.55, bh * 0.55, bl * 0.42], col, [px * 2, pz * 3, 0]);
    }
  } else {
    if (belly !== col) torso(BODY, [0, -bh * 0.08, 0], [bw * 0.92, bh * 0.9, bl * 0.86], belly, [0, 0, 0], 0.02);
    torso(BODY, [0, bh * 0.04, -bl * 0.04], [bw, bh, bl * 1.04], col, [0, 0, 0], 0.025);
    torso(BODY, [0, bh * 0.04, bl * 0.24], [bw * 1.04, bh * 1.08, bl * 0.56], col, [0, 0, 0], 0.025);
  }
  if (k.hump) torso(BODY, [0, bh * 0.58, -bl * 0.04], [bw * 0.75, bh * 0.95, bl * 0.48], col, [0, 0, 0], 0.025);
  if (k.shoulder) torso(BALL, [0, bh * 0.38, bl * 0.25], [bw * 0.8, bh * 0.5, bl * 0.42], col);
  if (k.spots) {
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1;
      const pz = ((i >> 1) / 4 - 0.5) * bl * 0.7;
      torso(BOX, [side * bw * 0.47, ((i * 7) % 3 - 1) * bh * 0.18, pz], [0.03 * S, bh * 0.2, bl * 0.13], k.spots, [0, 0, 0], 0.08);
    }
  }

  // Legs with haunches, and hooves or paws.
  for (const sz of [-1, 1]) {
    const L = sz > 0 ? frontLeg : rearLeg;
    for (const sx of [-1, 1]) {
      const lx = sx * bw * 0.27, lz = sz * bl * 0.33;
      const top = L + bh * 0.2;
      put(LEG, [lx, top / 2, lz], [lw * 2, top, lw * 2], legColor);
      const haunch = k.haunchSize ?? 1;
      put(BODY, [lx, L + bh * 0.32, lz - sz * lw * 0.3], [Math.max(lw * 3, bw * 0.36) * haunch, bh * 0.62 * haunch, Math.max(lw * 3.6, bl * 0.26) * haunch], col, [0, 0, 0], 0.025);
      if (k.hoof) put(BOX, [lx, lw * 0.45, lz + lw * 0.15], [lw * 1.9, lw * 0.9, lw * 2.2], k.hoof, [0, 0, 0], 0.02);
      if (k.paws) put(BALL, [lx, lw * 0.5, lz + lw * 0.6], [lw * 2.4, lw * 1.1, lw * 3], legColor);
      if (k.toes) put(BOX, [lx, lw * 0.25, lz + lw * 0.85], [lw * 1.4, lw * 0.4, lw * 0.4], k.toes, [0, 0, 0], 0.02);
    }
  }

  // Neck, optionally bending upward at the end (camel).
  const shoulder = [0, frontY + bh * 0.22, bl * 0.4];
  const nl = k.neck * S, tilt = k.tilt ?? 0;
  const nw = Math.max(lw * 2.6, bw * 0.34, k.head[0] * S * 0.95);
  let neckEnd = shoulder;
  const segment = (from, len, t) => {
    const to = [0, from[1] + Math.cos(t) * len, from[2] + Math.sin(t) * len];
    put(NECK, [0, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], [nw, len + nw * 0.6, nw * 1.15], col, [t, 0, 0]);
    if (k.maneLine && k.mane) put(BOX, [0, (from[1] + to[1]) / 2 + Math.sin(t) * nw * 0.5, (from[2] + to[2]) / 2 - Math.cos(t) * nw * 0.5], [nw * 0.3, len, nw * 0.3], k.mane, [t, 0, 0]);
    return to;
  };
  if (nl > 0.05) {
    if (k.neckUp) neckEnd = segment(segment(shoulder, nl * 0.55, tilt), nl * 0.5, k.neckUp);
    else neckEnd = segment(shoulder, nl, tilt);
  }

  // Head: skull and snout, with eyes, nose, ears and horns in the head's own frame.
  const [hw, hh, hl] = k.head.map((v) => v * S);
  const pitch = k.pitch ?? 0;
  const origin = nl > 0.05 ? [0, neckEnd[1] + hh * 0.1, neckEnd[2] + hl * 0.12] : [0, frontY + bh * 0.2, bl * 0.48 + hl * 0.35];
  const head = framed(put, origin, pitch);
  const skullL = hl * (1 - (k.snout ?? 0) * 0.6);
  head(BOX, [0, 0, 0], [hw, hh, skullL], headColor);
  const front = skullL / 2;
  if (k.snout) {
    const sl = hl * k.snout;
    head(BOX, [0, -hh * 0.14, front + sl / 2 - hl * 0.05], [hw * 0.72, hh * 0.66, sl], k.muzzle ?? headColor);
    head(BOX, [0, -hh * 0.08, front + sl - hl * 0.04], [hw * (k.disc ? 0.6 : 0.42), hh * (k.disc ? 0.45 : 0.2), 0.03 * S], k.disc ? '#c47c70' : EYE, [0, 0, 0], 0.02);
  } else if (k.disc) {
    head(BOX, [0, -hh * 0.1, front + 0.05 * S], [hw * 0.5, hh * 0.42, 0.12 * S], '#c47c70', [0, 0, 0], 0.02);
  }
  const eye = Math.max(hw * 0.14, 0.03 * S);
  for (const sx of [-1, 1]) head(BOX, [sx * hw * 0.5, hh * 0.15, front - skullL * 0.25], [eye * 0.5, eye, eye], EYE, [0, 0, 0], 0);

  if (has('mane') && !k.maneLine) {
    head(FLUFF, [0, hh * 0.05, -skullL * 0.35], [hw * 2.5, hh * 2.6, skullL * 1.3], k.mane, [0.2, 0, 0]);
    put(FLUFF, [0, frontY + bh * 0.05, bl * 0.42], [bw * 1.05, bh * 1.05, bl * 0.3], k.mane, [0.4, 0, 0]);
  }
  if (k.beard) head(CONE, [0, -hh * 0.6, front + hl * 0.1], [hw * 0.3, hh * 0.6, hw * 0.3], '#e8dcc6', [Math.PI, 0, 0]);

  const earBack = -skullL * 0.3;
  if (k.ears === 'up' || k.ears === 'point' || k.ears === 'long') {
    const tall = { up: 0.18, point: 0.16, long: 0.36 }[k.ears] * S;
    for (const sx of [-1, 1]) head(CONE, [sx * hw * 0.33, hh * 0.5 + tall * 0.45, earBack], [tall * 0.42, tall, tall * 0.25], headColor, [-0.15, 0, -sx * 0.22]);
  }
  if (k.ears === 'side') for (const sx of [-1, 1]) head(BOX, [sx * hw * 0.62, hh * 0.25, earBack], [hw * 0.55, 0.05 * S, hw * 0.3], headColor, [0, 0, sx * 0.45]);
  if (k.ears === 'round') for (const sx of [-1, 1]) head(BALL, [sx * hw * 0.4, hh * 0.55, earBack], [hw * 0.32, hw * 0.32, hw * 0.16], headColor);

  if (has('horns')) {
    if (k.horns === 'side') {
      for (const sx of [-1, 1]) {
        head(LEG, [sx * hw * 0.62, hh * 0.38, earBack + skullL * 0.1], [0.07 * S, hw * 0.55, 0.07 * S], '#e6dcc4', [0, 0, -sx * 1.35]);
        head(CONE, [sx * hw * 0.88, hh * 0.62, earBack + skullL * 0.1], [0.07 * S, 0.3 * S, 0.07 * S], '#e6dcc4', [0.2, 0, -sx * 0.35]);
      }
    }
    if (k.horns === 'back') for (const sx of [-1, 1]) head(CONE, [sx * hw * 0.26, hh * 0.72, earBack], [0.05 * S, 0.34 * S, 0.06 * S], '#3a2e24', [-0.8, 0, sx * 0.12]);
    if (k.horns === 'curl') for (const sx of [-1, 1]) head(CURL, [sx * hw * 0.58, hh * 0.1, earBack], [0.17 * S, 0.17 * S, 0.17 * S], '#cfc0a0', [0, sx * Math.PI / 2, 0]);
  }
  if (has('antlers')) {
    for (const sx of [-1, 1]) {
      const at = (h) => [sx * (hw * 0.3 + h * 0.45), hh * 0.5 + h, earBack - h * 0.25];
      head(LEG, at(0.22 * S), [0.035 * S, 0.5 * S, 0.035 * S], '#d8c6a4', [-0.45, 0, -sx * 0.45]);
      for (const h of [0.2, 0.36]) head(LEG, at(h * S).map((v, i) => v + [0, 0.1 * S, 0.08 * S][i]), [0.025 * S, 0.22 * S, 0.025 * S], '#d8c6a4', [0.35, 0, -sx * 0.15]);
    }
  }
  if (k.ossicones) for (const sx of [-1, 1]) {
    head(LEG, [sx * hw * 0.25, hh * 0.7, earBack], [0.04 * S, 0.24 * S, 0.04 * S], '#6b4a2a');
    head(BALL, [sx * hw * 0.25, hh * 0.84, earBack], [0.07 * S, 0.07 * S, 0.07 * S], '#3a2a1c');
  }

  if (k.trunk) {
    let p = [0, -hh * 0.1, hl * 0.42];
    const widths = [0.3, 0.24, 0.19, 0.15];
    widths.forEach((w, i) => {
      const len = hh * 0.36;
      const t = Math.PI - 0.25 - i * 0.12;
      const next = [0, p[1] + Math.cos(t) * len, p[2] + Math.sin(t) * len];
      head(LEG, [0, (p[1] + next[1]) / 2, (p[2] + next[2]) / 2], [w * S, len + 0.06 * S, w * S], col, [t, 0, 0]);
      p = next;
    });
    for (const sx of [-1, 1]) head(CONE, [sx * hw * 0.24, -hh * 0.35, hl * 0.55], [0.09 * S, 0.6 * S, 0.09 * S], '#efe8d6', [1.95, 0, 0], 0.02);
  }
  if (k.bigEars) for (const sx of [-1, 1]) head(FLUFF, [sx * hw * 0.62, hh * 0.05, -hl * 0.15], [0.1 * S, hh * 1.05, hl * 1.15], col, [0, sx * 0.4, 0]);

  // Tails.
  const rump = [0, rearY + bh * 0.2, -bl * 0.5];
  const tail = k.tail;
  if (tail === 'stub') put(BALL, [0, rump[1], rump[2] - 0.03 * S], [0.1 * S, 0.12 * S, 0.08 * S], kind === 'deer' ? '#f2ece0' : col);
  if (tail === 'cotton') put(BALL, [0, rearY, rump[2] - 0.02 * S], [0.13 * S, 0.13 * S, 0.12 * S], '#f4efe6');
  if (tail === 'thin' || tail === 'tuft') {
    const len = Math.max(bh * 0.8, 0.4 * S);
    put(LEG, [0, rump[1] - len * 0.45, rump[2] - len * 0.15], [0.05 * S, len, 0.05 * S], col, [0.3, 0, 0]);
    if (tail === 'tuft') put(BALL, [0, rump[1] - len * 0.92, rump[2] - len * 0.3], [0.12 * S, 0.18 * S, 0.12 * S], k.mane ?? '#3a2a1c');
  }
  if (tail === 'long') put(CONE, [0, rump[1] - bh * 0.55, rump[2] - 0.12 * S], [0.22 * S, bh * 1.3, 0.16 * S], k.mane ?? col, [0.25, 0, 0]);
  if (tail === 'bushy') put(FLUFF, [0, rump[1] - 0.2 * S, rump[2] - 0.22 * S], [0.16 * S, 0.16 * S, 0.55 * S], col, [-0.9, 0, 0]);
  if (tail === 'curl') put(CURL, [0, rump[1], rump[2] - 0.04 * S], [0.08 * S, 0.08 * S, 0.08 * S], col, [0, Math.PI / 2, 0]);
  return base;
}

function bird(ctx, { x, z, y, yaw, scale, color }) {
  const base = [x, y ?? ctx.heightAt(x, z), z];
  const put = placer(ctx, base, yaw);
  const S = scale;
  put(BALL, [0, 0.17 * S, 0], [0.18 * S, 0.17 * S, 0.32 * S], color);
  put(BALL, [0, 0.29 * S, 0.13 * S], [0.12 * S, 0.12 * S, 0.12 * S], color);
  put(CONE, [0, 0.28 * S, 0.22 * S], [0.035 * S, 0.08 * S, 0.035 * S], '#d68a3a', [Math.PI / 2, 0, 0]);
  for (const sx of [-1, 1]) {
    put(BOX, [sx * 0.085 * S, 0.19 * S, -0.02 * S], [0.03 * S, 0.1 * S, 0.26 * S], color, [0.15, 0, 0]);
    put(BOX, [sx * 0.05 * S, 0.31 * S, 0.17 * S], [0.015 * S, 0.02 * S, 0.02 * S], EYE, [0, 0, 0], 0);
    put(LEG, [sx * 0.04 * S, 0.04 * S, 0.01 * S], [0.015 * S, 0.08 * S, 0.015 * S], '#c87a4a');
  }
  put(BOX, [0, 0.19 * S, -0.2 * S], [0.12 * S, 0.03 * S, 0.16 * S], color, [0.3, 0, 0]);
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
