// Shared pieces for the Exodus-era camp scenes (ot-19 to ot-24): tents, fires, animals, posed people.
import * as THREE from 'three';
import { rng, insideAny } from '../../engine/util.js';
import { parts } from '../../engine/crowd.js';

export const ISRAEL = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#d8cdb5', '#4f5a6b', '#9a4a34', '#e2d6bc'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246', '#2f3d5a'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.7,
  hoodChance: 0.55,
};

const TENT_CLOTH = ['#3b2f28', '#4a3a2e', '#2e2622', '#5c4836', '#8a7458', '#a48e6c', '#6b5440'];
const RUGS = ['#8c2f24', '#a4562a', '#5b2a3a', '#2f4a5e', '#7a6a2a'];

export function desertTerrain(overrides = {}) {
  return {
    size: 1300,
    segments: 200,
    seed: 31,
    hills: 30,
    bumps: 0.4,
    colors: { ground: '#c49a6a', groundAlt: '#b38a5c', grass: '#a89260', high: '#a07a58', rock: '#8a6a52' },
    ...overrides,
  };
}

// Points scattered on a ring with a minimum gap, skipping avoid zones.
export function scatterPoints({ center = [0, 0], ring = [0, 50], arc = [0, Math.PI * 2], count, spacing = 2, seed = 1, avoid = [], taken = [] }) {
  const r = rng(seed);
  const out = [];
  for (let tries = 0; out.length < count && tries < count * 80; tries++) {
    const a = r.range(arc[0], arc[1]);
    const d = Math.sqrt(r.range(ring[0] ** 2, ring[1] ** 2));
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (insideAny(x, z, avoid)) continue;
    if (out.some((p) => (p[0] - x) ** 2 + (p[1] - z) ** 2 < spacing * spacing)) continue;
    if (taken.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < (p.r ?? 3) ** 2)) continue;
    out.push([x, z]);
  }
  return out;
}

export function layoutTents(opts) {
  const r = rng((opts.seed ?? 1) + 101);
  const face = opts.face ?? opts.center ?? [0, 0];
  return scatterPoints({ spacing: 8, ...opts }).map(([x, z]) => ({
    x, z,
    rot: Math.atan2(face[0] - x, face[1] - z) + r.range(-0.4, 0.4),
    w: r.range(4.5, 7.5), d: r.range(3.5, 5), h: r.range(2, 2.7),
    color: r.pick(TENT_CLOTH), rug: r.pick(RUGS),
    kind: r() < 0.65 ? 'bedouin' : 'ridge',
  }));
}

export const tentZones = (tents, pad = 1.2) => tents.map((t) => ({ x: t.x, z: t.z, r: Math.max(t.w, t.d) / 2 + pad }));

// Adds a geometry built in a local frame (origin on the ground, front toward +z).
function put(batch, geo, base, color, jitter = 0.06) {
  batch.add(geo, { position: [base.x, base.y, base.z], rotation: [0, base.rot ?? 0, 0], color, jitter });
}

const box = (w, h, d, x, y, z, rx = 0, rz = 0) => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx) g.rotateX(rx);
  if (rz) g.rotateZ(rz);
  return g.translate(x, y, z);
};
const pole = (h, x, z, r = 0.05, y = 0) => new THREE.CylinderGeometry(r, r * 1.2, h, 5).translate(x, y + h / 2, z);

export function tent(ctx, t) {
  const { x, z, rot = 0, w = 6, d = 4, h = 2.4, color = '#3b2f28', rug = '#8c2f24', kind = 'bedouin' } = t;
  const y = ctx.heightAt(x, z) - 0.05;
  const base = { x, y, z, rot };
  const cloth = new THREE.Color(color);
  const lighter = '#' + cloth.clone().lerp(new THREE.Color('#d8c8a8'), 0.35).getHexString();
  if (kind === 'ridge') {
    const g = new THREE.CylinderGeometry(1, 1, 1, 3);
    g.rotateX(-Math.PI / 2);
    g.scale(w / 2 / 0.866, h / 1.5, d);
    put(ctx.solid, g.translate(0, h / 3, 0), base, color);
    put(ctx.solid, box(0.9, h * 0.62, 0.05, 0, h * 0.31, d / 2 + 0.01), base, '#1c1612', 0.02);
    put(ctx.solid, pole(h + 0.35, 0, d / 2 + 0.05, 0.05), base, '#5a4332');
    put(ctx.solid, pole(h + 0.35, 0, -d / 2 - 0.05, 0.05), base, '#5a4332');
  } else {
    const ridge = h, front = h * 0.78, back = h * 0.5;
    const fz = d / 2, bz = -d / 2;
    const frontLen = Math.hypot(fz, ridge - front), backLen = Math.hypot(bz, ridge - back);
    put(ctx.solid, box(w, 0.08, frontLen, 0, (ridge + front) / 2, fz / 2, Math.atan2(ridge - front, fz)), base, color);
    put(ctx.solid, box(w, 0.08, backLen, 0, (ridge + back) / 2, bz / 2, -Math.atan2(ridge - back, -bz)), base, color);
    put(ctx.solid, box(w * 0.98, 0.1, 0.35, 0, (ridge + front) / 2 + 0.02, fz / 2, Math.atan2(ridge - front, fz)), base, lighter);
    put(ctx.solid, box(w, back, 0.06, 0, back / 2, bz), base, color);
    for (const s of [-1, 1]) put(ctx.solid, box(0.06, back, d * 0.75, s * w / 2, back / 2, -d * 0.12), base, color);
    for (const px of [-w / 2 + 0.1, 0, w / 2 - 0.1]) put(ctx.solid, pole(front, px, fz - 0.05), base, '#5a4332');
    put(ctx.solid, pole(ridge, 0, 0, 0.07), base, '#5a4332');
    put(ctx.solid, box(w * 0.85, 0.04, d * 0.8, 0, 0.04, 0), base, rug);
    for (const s of [-1, 1]) {
      const g = new THREE.CylinderGeometry(0.012, 0.012, 1.8, 3);
      g.rotateX(0.75);
      put(ctx.solid, g.translate(s * w / 2, front * 0.5, fz + 0.65), base, '#cbb894', 0);
    }
  }
  ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

export function campfire(ctx, x, z, { light = false, size = 1, smoke = 8 } = {}) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * size, 0), { position: [x + Math.cos(a) * 0.6 * size, y + 0.08, z + Math.sin(a) * 0.6 * size], scale: [1, 0.7, 1], color: '#6e655c' });
  }
  for (let i = 0; i < 4; i++) {
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.07, 0.9 * size, 5), { position: [x, y + 0.12, z], rotation: [Math.PI / 2 - 0.3, i * 0.8, 0], color: '#3a2a1e' });
  }
  for (let i = 0; i < 5; i++) {
    const s = size * r.range(0.6, 1);
    ctx.glow.add(new THREE.ConeGeometry(0.16 * s, 0.7 * s, 4), {
      position: [x + r.range(-0.18, 0.18) * size, y + 0.3 * s, z + r.range(-0.18, 0.18) * size],
      rotation: [r.range(-0.2, 0.2), r() * 3, r.range(-0.2, 0.2)],
      color: r.pick(['#ff8a2a', '#ffb347', '#ff6a1a']),
      jitter: 0.05,
    });
  }
  if (light) {
    const l = new THREE.PointLight('#ff9a48', 18 * size, 14 * size, 1.6);
    l.position.set(x, y + 1, z);
    ctx.scene.add(l);
    ctx.onFrame((t) => (l.intensity = 18 * size * (0.85 + 0.15 * Math.sin(t * 11 + x) * Math.sin(t * 7.3 + z))));
  }
  if (smoke) ctx.effects.smoke({ position: [x, y + 0.6, z], count: smoke, height: 9, size: 0.35, color: '#9a928c', seed: Math.floor(r() * 1e6) });
  ctx.colliders.add({ x, z, w: 1.2 * size, d: 1.2 * size, bottom: y, top: y + 0.3 });
}

const ANIMALS = {
  sheep: { body: [0.9, 0.55, 0.5], legs: 0.35, color: ['#e6dccb', '#d8ccb6', '#efe6d6'], head: '#3a302a' },
  goat: { body: [0.85, 0.45, 0.38], legs: 0.4, color: ['#3a2e28', '#5a4636', '#2a2420', '#8a6a4a'], head: null },
  ox: { body: [1.9, 0.9, 0.8], legs: 0.7, color: ['#7a5236', '#5e3e2a', '#9a7a58'], head: null },
};

export function animal(ctx, x, z, rot, kind = 'sheep') {
  const r = ctx.rand;
  const a = ANIMALS[kind];
  const y = ctx.heightAt(x, z);
  const base = { x, y, z, rot };
  const col = r.pick(a.color);
  const [L, H, W] = a.body;
  const g = new THREE.IcosahedronGeometry(0.5, 0).scale(W * 1.2, H * 1.25, L * 1.1).translate(0, a.legs + H * 0.5, 0);
  put(ctx.solid, g, base, col, 0.08);
  put(ctx.solid, box(W * 0.5, H * 0.55, L * 0.32, 0, a.legs + H * 0.85, L * 0.58, 0.5), base, a.head ?? col);
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(ctx.solid, box(0.09 * W * 2, a.legs + 0.1, 0.1 * W * 2, lx * W * 0.28, a.legs / 2, lz * L * 0.32), base, a.head ?? col);
  if (kind !== 'sheep') for (const s of [-1, 1]) put(ctx.solid, new THREE.ConeGeometry(0.04 * W * 3, 0.3 * W * 2, 4).rotateX(-0.6).translate(s * W * 0.18, a.legs + H * 1.2, L * 0.55), base, '#d8ccb0');
  ctx.colliders.add({ x, z, w: W, d: L, rot, bottom: y, top: y + a.legs + H });
}

export function flock(ctx, center, count, radius, seed, kinds = ['sheep', 'sheep', 'goat']) {
  const r = rng(seed);
  for (const [x, z] of scatterPoints({ center, ring: [0, radius], count, spacing: 1.2, seed })) animal(ctx, x, z, r() * Math.PI * 2, r.pick(kinds));
}

export function banner(ctx, x, z, color, { h = 5, w = 1.6 } = {}) {
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, h, 5), { position: [x, y + h / 2, z], color: '#5a4332' });
  ctx.solid.box(w, w * 0.7, 0.04, { position: [x + w / 2, y + h - w * 0.4, z], rotation: [0, 0, 0.04], color, jitter: 0.04 });
  ctx.solid.add(new THREE.ConeGeometry(0.1, 0.25, 4), { position: [x, y + h + 0.1, z], color: '#c9a24a' });
}

export function jar(ctx, x, z, { color = '#a8643c', s = 1 } = {}) {
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.13 * s, 0.12 * s, 0.5 * s, 6), { position: [x, y + 0.25 * s, z], color });
  ctx.solid.add(new THREE.SphereGeometry(0.2 * s, 6, 3), { position: [x, y + 0.22 * s, z], scale: [1, 1.1, 1], color });
}

export function basket(ctx, x, z, { color = '#9a7a44', fill = null, s = 1 } = {}) {
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.28 * s, 0.2 * s, 0.26 * s, 7, 1), { position: [x, y + 0.13 * s, z], color });
  if (fill) ctx.solid.add(new THREE.CylinderGeometry(0.25 * s, 0.25 * s, 0.04, 7), { position: [x, y + 0.25 * s, z], color: fill, jitter: 0.02 });
}

let cached;
const partGeos = () => (cached ??= { robe: parts.robe(), mantle: parts.mantle(), head: parts.head(), hood: parts.hood() });

function armGeo(side, raise, spread) {
  const g = new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0);
  g.rotateX(-raise);
  g.rotateZ(side * spread);
  return g.translate(side * 0.2, 1.32, 0.02);
}

// A person baked into a batch, so it can take any pose: lying, arms raised, holding things.
// arms: [[raise, spread] left, [raise, spread] right], raise 0 hangs down, PI/2 points forward, PI points up.
export function person(ctx, p) {
  const { x, z, yaw = 0, scale = 1, robe = '#8b6b4a', mantle, skin = '#9b6a46', hood = false, arms = [[0.1, 0.12], [0.1, 0.12]], lie = 0, kneel = false, emissive = false } = p;
  const batch = emissive ? ctx.glow : ctx.solid;
  const g = partGeos();
  let y = p.y ?? ctx.heightAt(x, z);
  if (kneel) y -= 0.48 * scale;
  if (lie) y += 0.22 * scale;
  const opts = (color) => ({ position: [x, y, z], rotation: [lie, yaw, 0], scale: [scale, scale, scale], color, jitter: 0.04 });
  batch.add(g.robe, opts(robe));
  batch.add(g.head, opts(skin));
  if (mantle) batch.add(g.mantle, opts(mantle));
  if (hood) batch.add(g.hood, opts(mantle ?? robe));
  arms.forEach(([raise, spread], i) => batch.add(armGeo(i ? 1 : -1, raise, spread), opts(mantle ?? robe)));
}

// Picks robe colors for a hand-placed person from the shared palette.
export function dress(rand, palette = ISRAEL) {
  const hasMantle = rand() < palette.mantleChance;
  return {
    robe: rand.pick(palette.robes),
    mantle: hasMantle ? rand.pick(palette.mantles) : undefined,
    skin: rand.pick(palette.skins),
    hood: rand() < palette.hoodChance,
  };
}

export function tablets(ctx, x, y, z, yaw, { scale = 1, color = '#9a958a' } = {}) {
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(0.34, 0.5, 0.06);
    const top = new THREE.CylinderGeometry(0.17, 0.17, 0.06, 8, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, 0.25, 0);
    for (const geo of [g, top]) {
      geo.scale(scale, scale, scale).translate(s * 0.19 * scale, 0, 0);
      ctx.solid.add(geo, { position: [x, y, z], rotation: [-0.15, yaw, 0], color, jitter: 0.03 });
    }
  }
}

// Low drifting bank of mist or dust: flat additive sprites near the ground.
let puffTex;
function puffTexture() {
  if (puffTex) return puffTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  puffTex = new THREE.CanvasTexture(c);
  return puffTex;
}

export function haze(ctx, { center = [0, 0], radius = 80, count = 40, size = [10, 22], lift = [0.5, 3], color = '#ffffff', opacity = 0.18, seed = 3, drift = 0.3 }) {
  const r = rng(seed);
  const mat = new THREE.SpriteMaterial({ map: puffTexture(), color, opacity, transparent: true, depthWrite: false });
  const sprites = [];
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    const s = new THREE.Sprite(mat);
    const sz = r.range(size[0], size[1]);
    s.scale.set(sz, sz * 0.4, 1);
    s.position.set(x, ctx.heightAt(x, z) + r.range(lift[0], lift[1]), z);
    s.userData = { x, z, ph: r() * 6 };
    ctx.scene.add(s);
    sprites.push(s);
  }
  if (drift) ctx.onFrame((t) => {
    for (const s of sprites) s.position.x = s.userData.x + Math.sin(t * 0.05 + s.userData.ph) * drift * 10;
  });
  return sprites;
}
