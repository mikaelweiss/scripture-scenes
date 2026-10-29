import * as THREE from 'three';

export function makeRng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
export const between = (rng, [lo, hi]) => lo + rng() * (hi - lo);

export function makeNoise(seed = 1) {
  const hash = (ix, iz) => {
    let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const ease = (t) => t * t * (3 - 2 * t);
  const noise = (x, z) => {
    const ix = Math.floor(x), iz = Math.floor(z);
    const fx = ease(x - ix), fz = ease(z - iz);
    const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  };
  const fbm = (x, z, octaves = 4) => {
    let sum = 0, amp = 0.5, freq = 1, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(x * freq, z * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum / norm;
  };
  return { noise, fbm };
}

// Planar UVs from local position so textures keep a constant world scale on every face.
// flatCaps pins top and bottom faces to one texel so friezes stay on the sides.
export function worldUV(geo, { su = 2, sv = su, ox = 0, oy = 0, oz = 0, flatCaps = false } = {}) {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    const x = pos.getX(i) + ox, y = pos.getY(i) + oy, z = pos.getZ(i) + oz;
    let u, v;
    if (ny >= nx && ny >= nz) {
      if (flatCaps) { uv[i * 2] = 0.02; uv[i * 2 + 1] = 0.5; continue; }
      u = x; v = z;
    }
    else if (nx >= nz) { u = z; v = y; }
    else { u = x; v = y; }
    uv[i * 2] = u / su;
    uv[i * 2 + 1] = v / sv;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

// Box placed in a structure's local frame. UVs are computed before rotation.
export function boxGeo(w, h, d, [x, y, z] = [0, 0, 0], { rotX = 0, rotY = 0, rotZ = 0, uv } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  const rotated = rotX || rotY || rotZ;
  const local = rotated || uv?.local;
  worldUV(g, local ? { ...(uv || {}) } : { ...(uv || {}), ox: x + (uv?.ox || 0), oy: y + (uv?.oy || 0), oz: z + (uv?.oz || 0) });
  if (rotated) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rotX, rotY, rotZ, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export const toVec3 = ([x, y, z]) => new THREE.Vector3(x, y, z);

// Local structure point to world XZ for a structure at (px, pz) rotated by rot around Y.
export function localToWorld(px, pz, rot, lx, lz) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return [px + lx * c + lz * s, pz - lx * s + lz * c];
}

// Zones: { kind: 'circle', x, z, r } or { kind: 'rect', x, z, hx, hz, rot }.
export function inZone(zone, x, z, margin = 0) {
  const dx = x - zone.x, dz = z - zone.z;
  if (zone.kind === 'circle') return Math.hypot(dx, dz) < zone.r + margin;
  const c = Math.cos(zone.rot ?? 0), s = Math.sin(zone.rot ?? 0);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) < zone.hx + margin && Math.abs(lz) < zone.hz + margin;
}

export function segmentDistance(x, z, [ax, az], [bx, bz]) {
  const vx = bx - ax, vz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz || 1)));
  return Math.hypot(x - (ax + vx * t), z - (az + vz * t));
}
