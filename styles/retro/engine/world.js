import * as THREE from 'three';

const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function valueNoise(seed) {
  const h = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const tx = x - x0, ty = y - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = h(x0, y0), b = h(x0 + 1, y0), c = h(x0, y0 + 1), d = h(x0 + 1, y0 + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}

export function makeTerrain(ground) {
  const n = valueNoise(ground.seed ?? 1);
  const bumps = ground.bumps ?? 0.3;
  const m = ground.mountains ?? { start: 150, height: 60 };
  const hills = ground.hills ?? [];
  const flats = ground.flats ?? [];
  return (x, z) => {
    let h = (n(x * 0.045, z * 0.045) - 0.5) * 2 * bumps + (n(x * 0.17 + 40, z * 0.17) - 0.5) * bumps * 0.5;
    for (const f of flats) h *= smoothstep(f.radius * 0.7, f.radius, Math.hypot(x - f.pos[0], z - f.pos[1]));
    const r = Math.hypot(x, z);
    const t = smoothstep(m.start, m.start + 260, r);
    if (t > 0) {
      const ridge = 1 - Math.abs(n(x * 0.01 + 9, z * 0.01) * 2 - 1);
      h += t * m.height * (0.3 + 0.55 * ridge) + t * m.height * 0.45 * n(x * 0.04, z * 0.04) + t * m.height * 0.15 * n(x * 0.11, z * 0.11);
    }
    for (const hl of hills) {
      const d = Math.hypot(x - hl.pos[0], z - hl.pos[1]);
      if (d < hl.radius) h += hl.height * 0.5 * (1 + Math.cos(Math.PI * d / hl.radius));
    }
    return h;
  };
}

// Geometry accumulator: everything sharing a texture and emissive level merges into one mesh.
export class Builder {
  constructor() { this.buckets = new Map(); }

  bucket(tex, emissive = 0) {
    const key = `${tex}|${emissive}`;
    if (!this.buckets.has(key)) this.buckets.set(key, { tex, emissive, pos: [], nrm: [], uv: [], col: [] });
    return this.buckets.get(key);
  }

  tri(b, verts, normal, uvs, color) {
    for (let i = 0; i < 3; i++) {
      b.pos.push(...verts[i]);
      b.nrm.push(...normal);
      b.uv.push(...uvs[i]);
      b.col.push(...color);
    }
  }

  // Box with world-scaled UVs. rot = {yaw, pitch, roll} in radians or a quaternion.
  box(center, size, { tex = 'stone', color = [1, 1, 1], yaw = 0, pitch = 0, roll = 0, quat, tile = 3, emissive = 0, seed = 0, maxSeg = 3 } = {}) {
    const b = this.bucket(tex, emissive);
    const q = quat ?? new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'));
    const c = new THREE.Vector3(...center);
    const [sx, sy, sz] = size;
    const faces = [
      [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
      [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
      [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
      [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    ];
    const s = new THREE.Vector3(sx, sy, sz);
    const ou = (seed * 0.618) % 1, ov = (seed * 0.382) % 1;
    for (const [n, u, v] of faces) {
      const N = new THREE.Vector3(...n), U = new THREE.Vector3(...u), V = new THREE.Vector3(...v);
      const lenU = Math.abs(U.dot(s)), lenV = Math.abs(V.dot(s));
      const corner = (a, bb) => N.clone().multiply(s).multiplyScalar(0.5)
        .add(U.clone().multiplyScalar(a * lenU * 0.5))
        .add(V.clone().multiplyScalar(bb * lenV * 0.5))
        .applyQuaternion(q).add(c).toArray();
      const nn = N.clone().applyQuaternion(q).toArray();
      // Large faces are split so affine warping and vertex lighting stay local.
      const nu = Math.max(1, Math.ceil(lenU / maxSeg)), nv = Math.max(1, Math.ceil(lenV / maxSeg));
      for (let i = 0; i < nu; i++) {
        for (let j = 0; j < nv; j++) {
          const a0 = (i / nu) * 2 - 1, a1 = ((i + 1) / nu) * 2 - 1;
          const b0 = (j / nv) * 2 - 1, b1 = ((j + 1) / nv) * 2 - 1;
          const p = [corner(a0, b0), corner(a1, b0), corner(a1, b1), corner(a0, b1)];
          const tu = (a) => ou + ((a + 1) / 2) * lenU / tile, tv = (bb) => ov + ((bb + 1) / 2) * lenV / tile;
          const t = [[tu(a0), tv(b0)], [tu(a1), tv(b0)], [tu(a1), tv(b1)], [tu(a0), tv(b1)]];
          this.tri(b, [p[0], p[1], p[2]], nn, [t[0], t[1], t[2]], color);
          this.tri(b, [p[0], p[2], p[3]], nn, [t[0], t[2], t[3]], color);
        }
      }
    }
  }

  // Ribbon lying on the ground along a polyline.
  ribbon(points, width, { tex = 'white', color, emissive = 0, lift = 0.04 }) {
    const b = this.bucket(tex, emissive);
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0, z0, w0 = 1] = points[i], [x1, y1, z1, w1 = 1] = points[i + 1];
      const dx = x1 - x0, dz = z1 - z0;
      const len = Math.hypot(dx, dz) || 1;
      const px = -dz / len, pz = dx / len;
      const a = width * w0 * 0.5, c = width * w1 * 0.5;
      const v = [
        [x0 - px * a, y0 + lift, z0 - pz * a], [x0 + px * a, y0 + lift, z0 + pz * a],
        [x1 + px * c, y1 + lift, z1 + pz * c], [x1 - px * c, y1 + lift, z1 - pz * c],
      ];
      const n = [0, 1, 0];
      const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
      for (const [i0, i1, i2] of [[0, 1, 2], [0, 2, 3]]) this.tri(b, [v[i0], v[i1], v[i2]], n, [uv[i0], uv[i1], uv[i2]], color);
    }
  }

  meshes(materialFor) {
    const out = [];
    for (const b of this.buckets.values()) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
      g.setAttribute('aColor', new THREE.Float32BufferAttribute(b.col, 3));
      g.computeBoundingSphere();
      out.push(new THREE.Mesh(g, materialFor(b.tex, b.emissive)));
    }
    return out;
  }
}

// Oriented boxes the player can stand on or bump into.
export class Colliders {
  constructor(terrain) { this.terrain = terrain; this.solids = []; }

  add(cx, cz, hx, hz, yaw, bottom, top) {
    this.solids.push({ cx, cz, hx, hz, cos: Math.cos(yaw), sin: Math.sin(yaw), bottom, top });
  }

  contains(s, x, z, pad) {
    const dx = x - s.cx, dz = z - s.cz;
    const lx = dx * s.cos - dz * s.sin;
    const lz = dx * s.sin + dz * s.cos;
    return Math.abs(lx) <= s.hx + pad && Math.abs(lz) <= s.hz + pad;
  }

  // Highest surface under (x, z) no higher than maxY.
  heightAt(x, z, maxY = Infinity, pad = 0) {
    let h = this.terrain(x, z);
    for (const s of this.solids) {
      if (s.top > h && s.top <= maxY && this.contains(s, x, z, pad)) h = s.top;
    }
    return h;
  }

  blocked(x, z, feet, step, height, pad) {
    for (const s of this.solids) {
      if (s.top > feet + step && s.bottom < feet + height && this.contains(s, x, z, pad)) return true;
    }
    return false;
  }
}

// Turns a local offset on a yawed footprint into world x, z.
export function local(pos, yaw, lx, lz) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return [pos[0] + lx * c + lz * s, pos[1] - lx * s + lz * c];
}

