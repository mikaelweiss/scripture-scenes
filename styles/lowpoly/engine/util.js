import * as THREE from 'three';

export function rng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + next() * (hi - lo);
  next.pick = (list) => list[Math.floor(next() * list.length)];
  next.sign = () => (next() < 0.5 ? -1 : 1);
  return next;
}

function hash2(x, z, seed) {
  let h = Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function valueNoise(x, z, seed = 0) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi, seed), b = hash2(xi + 1, zi, seed);
  const c = hash2(xi, zi + 1, seed), d = hash2(xi + 1, zi + 1, seed);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

export function fbm(x, z, seed = 0, octaves = 4) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, z * freq, seed + i * 17);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const color = (c) => new THREE.Color(c);

export function jitterColor(c, rand, amount = 0.06) {
  const out = new THREE.Color(c);
  const hsl = {};
  out.getHSL(hsl);
  out.setHSL(
    (hsl.h + (rand() - 0.5) * amount * 0.3 + 1) % 1,
    Math.min(1, Math.max(0, hsl.s + (rand() - 0.5) * amount)),
    Math.min(1, Math.max(0, hsl.l + (rand() - 0.5) * amount)),
  );
  return out;
}

export function paintFaces(geometry, colorFn) {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry;
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    v.set(0, 0, 0);
    for (let k = 0; k < 3; k++) v.x += pos.getX(i + k), v.y += pos.getY(i + k), v.z += pos.getZ(i + k);
    v.multiplyScalar(1 / 3);
    const c = colorFn(v, i / 3);
    for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function polarScatter(rand, { center = [0, 0], ring = [0, 10], arc = [0, Math.PI * 2] }) {
  const a = rand.range(arc[0], arc[1]);
  const r = Math.sqrt(rand.range(ring[0] ** 2, ring[1] ** 2));
  return [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r];
}

export function insideRect(x, z, rect) {
  const [cx, cz, w, d, rot = 0] = rect;
  const c = Math.cos(rot), s = Math.sin(rot);
  const dx = x - cx, dz = z - cz;
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) <= w / 2 && Math.abs(lz) <= d / 2;
}

export function insideAny(x, z, zones = []) {
  return zones.some((zone) =>
    zone.r !== undefined ? (x - zone.x) ** 2 + (z - zone.z) ** 2 < zone.r ** 2 : insideRect(x, z, zone.rect),
  );
}
