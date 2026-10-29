import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, noise2, color, pick, shade, rotate, Batch } from './util.js';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// A square grid of tiles shaped into an island. Holds heights, colors and walkability.
export class Ground {
  constructor(spec, seed) {
    this.spec = spec;
    const N = (this.N = spec.size);
    this.half = N / 2;
    this.rand = rng(seed);
    this.land = new Uint8Array(N * N);
    this.blocked = new Uint8Array(N * N);
    this.height = new Float32Array(N * N);
    this.tiltX = new Float32Array(N * N);
    this.tiltZ = new Float32Array(N * N);
    this.colors = new Array(N * N);
    const shapeNoise = noise2(seed + 1), hillNoise = noise2(seed + 2), patchNoise = noise2(seed + 3);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const k = j * N + i, x = this.center(i), z = this.center(j);
        const edge = spec.radius * (0.8 + 0.4 * shapeNoise(x * 0.07 + 50, z * 0.07 + 50));
        this.land[k] = Math.hypot(x, z) < edge ? 1 : 0;
        this.height[k] = (spec.hills ?? 0) * (hillNoise(x * 0.09, z * 0.09) - 0.4);
        const patch = patchNoise(x * 0.13 + 9, z * 0.13 + 9) > (spec.patchThreshold ?? 0.6);
        this.colors[k] = shade(pick(this.rand, patch ? spec.patchColors : spec.colors), this.rand, 0.1);
      }
    }
  }

  center(i) { return i - this.half + 0.5; }

  index(x, z) {
    const i = Math.floor(x + this.half), j = Math.floor(z + this.half);
    return i < 0 || j < 0 || i >= this.N || j >= this.N ? -1 : j * this.N + i;
  }

  heightAt(x, z) {
    const k = this.index(x, z);
    return k < 0 || !this.land[k] ? -0.5 : this.height[k];
  }

  isLand(x, z) { const k = this.index(x, z); return k >= 0 && this.land[k] === 1; }

  isBlocked(x, z) {
    const k = this.index(x, z);
    return k < 0 || !this.land[k] || this.blocked[k] === 1;
  }

  // shape: { shape: 'rect', x, z, w, d, rot } or { shape: 'circle', x, z, r }. Returns 0..1 (1 = center).
  weight(s, x, z) {
    if (s.shape === 'circle') {
      const d = Math.hypot(x - s.x, z - s.z) / s.r;
      return d <= 1 ? 1 - d : 0;
    }
    const [lx, lz] = rotate(x - s.x, z - s.z, -(s.rot ?? 0));
    const u = Math.abs(lx) / (s.w / 2), v = Math.abs(lz) / (s.d / 2);
    return u <= 1 && v <= 1 ? 1 - Math.max(u, v) : 0;
  }

  forCells(s, fn) {
    for (let k = 0; k < this.N * this.N; k++) {
      const x = this.center(k % this.N), z = this.center(Math.floor(k / this.N));
      const w = this.weight(s, x, z);
      if (w > 0) fn(k, w, x, z);
    }
  }

  paint(zone) {
    this.forCells(zone, (k, w) => {
      if (zone.soft && this.rand() > w * 2.2) return;
      if (zone.land) this.land[k] = 1;
      if (zone.colors) this.colors[k] = shade(pick(this.rand, zone.colors), this.rand, 0.1);
      if (zone.height !== undefined) this.height[k] = zone.height;
    });
  }

  block(shape) {
    this.forCells(shape, (k) => { this.blocked[k] = 1; });
  }

  crack({ x, z, angle = 0, length = 10, branches = 1 }, crackColors) {
    const r = this.rand;
    let a = angle;
    for (let step = 0; step < length; step++) {
      const k = this.index(x, z);
      if (k >= 0 && this.land[k]) {
        this.colors[k] = shade(pick(r, crackColors), r, 0.2);
        this.height[k] -= 0.18;
        for (const [dx, dz] of DIRS) {
          const n = this.index(x + dx, z + dz);
          if (n < 0) continue;
          this.tiltX[n] = (r() - 0.5) * 0.22;
          this.tiltZ[n] = (r() - 0.5) * 0.22;
          this.height[n] += r() * 0.14;
        }
      }
      if (branches > 0 && r() < 0.08) {
        branches--;
        this.crack({ x, z, angle: a + (r() < 0.5 ? 1 : -1) * 0.9, length: Math.floor(length * 0.4), branches: 0 }, crackColors);
      }
      a += (r() - 0.5) * 0.9;
      x += Math.sin(a);
      z += Math.cos(a);
    }
  }

  buildMeshes() {
    const group = new THREE.Group();
    const r = this.rand, N = this.N, spec = this.spec;

    const tileGeo = new RoundedBoxGeometry(1, 0.6, 1, 2, 0.07).translate(0, -0.3, 0);
    const tiles = new Batch(tileGeo, new THREE.MeshStandardMaterial({ roughness: 0.95 }));
    for (let k = 0; k < N * N; k++) {
      if (!this.land[k]) continue;
      const x = this.center(k % N), z = this.center(Math.floor(k / N));
      this.height[k] += (r() - 0.5) * (spec.jitter ?? 0.05);
      tiles.add(x, this.height[k], z, 0.985, 1, 0.985, this.colors[k], this.tiltX[k], 0, this.tiltZ[k]);
    }
    group.add(tiles.build());

    group.add(this.buildSkirt());
    group.add(this.buildRock());
    return group;
  }

  // Vertical cliff walls along the island edge, banded like soil strata.
  buildSkirt() {
    const N = this.N, r = this.rand, pos = [], nor = [], col = [];
    const strata = this.spec.strata;
    for (let k = 0; k < N * N; k++) {
      if (!this.land[k]) continue;
      const i = k % N, j = Math.floor(k / N), cx = this.center(i), cz = this.center(j);
      for (const [dx, dz] of DIRS) {
        const ni = i + dx, nj = j + dz;
        if (ni >= 0 && nj >= 0 && ni < N && nj < N && this.land[nj * N + ni]) continue;
        const ex = cx + dx * 0.5, ez = cz + dz * 0.5;
        const ax = ex - dz * 0.5, az = ez + dx * 0.5, bx = ex + dz * 0.5, bz = ez - dx * 0.5;
        let top = this.height[k] - 0.25;
        for (const band of strata) {
          const bottom = -band.depth - (r() * 0.25);
          const c = shade(band.color, r, 0.14);
          const quad = [[ax, top, az], [bx, top, bz], [bx, bottom, bz], [ax, top, az], [bx, bottom, bz], [ax, bottom, az]];
          for (const p of quad) { pos.push(...p); nor.push(dx, 0, dz); col.push(c.r, c.g, c.b); }
          top = bottom;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }));
    mesh.receiveShadow = true;
    return mesh;
  }

  // Jagged rock hanging under the island so it floats like a diorama piece.
  buildRock() {
    const { rock, radius, strata } = this.spec;
    const top = -strata[strata.length - 1].depth + 0.3;
    const n = noise2(77);
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: rock.color, roughness: 1, flatShading: true });
    const spikes = [{ x: 0, z: 0, r: radius * 0.8, h: rock.height }, ...(rock.spikes ?? [])];
    for (const s of spikes) {
      const geo = new THREE.ConeGeometry(s.r, s.h, 16, 6).rotateX(Math.PI).translate(s.x, top - s.h / 2, s.z);
      const p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const x = p.getX(v), y = p.getY(v), z = p.getZ(v);
        const a = Math.atan2(z - s.z, x - s.x);
        const f = 0.75 + 0.5 * n(Math.cos(a) * 2 + 3, Math.sin(a) * 2 + y * 0.3 + 3);
        p.setXYZ(v, s.x + (x - s.x) * f, y + (n(x, z) - 0.5) * 0.8, s.z + (z - s.z) * f);
      }
      const flat = geo.toNonIndexed();
      flat.computeVertexNormals();
      group.add(new THREE.Mesh(flat, mat));
    }
    return group;
  }
}
