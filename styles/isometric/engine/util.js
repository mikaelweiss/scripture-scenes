import * as THREE from 'three';

export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function noise2(seed = 1) {
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  const value = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = smooth(x - xi), v = smooth(y - yi);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x, y) => (value(x, y) * 4 + value(x * 2.1, y * 2.1) * 2 + value(x * 4.3, y * 4.3)) / 7;
}

export const color = (c) => new THREE.Color(c);
export const pick = (r, list) => list[Math.floor(r() * list.length)];
export const range = (r, [a, b]) => a + r() * (b - a);
export const shade = (c, r, amount = 0.12) => color(c).multiplyScalar(1 + (r() - 0.5) * amount);
export const rad = (deg) => (deg * Math.PI) / 180;

export function rotate(lx, lz, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return [lx * c + lz * s, -lx * s + lz * c];
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

export function composeMatrix(target, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
  _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ'));
  return target.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
}

// Collects many copies of one geometry and turns them into a single InstancedMesh.
export class Batch {
  constructor(geometry, material, { shadows = true } = {}) {
    this.geometry = geometry;
    this.material = material;
    this.shadows = shadows;
    this.items = [];
  }

  add(x, y, z, sx, sy, sz, c, rx = 0, ry = 0, rz = 0) {
    this.items.push({ x, y, z, sx, sy, sz, c: color(c), rx, ry, rz });
  }

  build() {
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, Math.max(1, this.items.length));
    mesh.count = this.items.length;
    this.items.forEach((it, i) => {
      mesh.setMatrixAt(i, composeMatrix(_m, it.x, it.y, it.z, it.sx, it.sy, it.sz, it.rx, it.ry, it.rz));
      mesh.setColorAt(i, it.c);
    });
    mesh.castShadow = mesh.receiveShadow = this.shadows;
    mesh.frustumCulled = false;
    return mesh;
  }
}

export function canvasTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  return canvasTexture(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.45)'));
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
}
