import * as THREE from 'three';
import { hash3, noise2 } from './noise.js';

// Each face: normal axis d and sign s, tangent axes u and v ordered so u x v points along the normal.
const FACES = [
  { d: 0, s: 1, u: 1, v: 2 }, { d: 0, s: -1, u: 2, v: 1 },
  { d: 1, s: 1, u: 2, v: 0 }, { d: 1, s: -1, u: 0, v: 2 },
  { d: 2, s: 1, u: 0, v: 1 }, { d: 2, s: -1, u: 1, v: 0 },
];
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
const AO_LEVELS = [0.38, 0.6, 0.8, 1];
const CHUNK = 32;

const rgb = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };

export class VoxelWorld {
  constructor({ size, height, voxel }, palette) {
    this.vs = voxel;
    this.sx = this.sz = Math.round(size / voxel);
    this.sy = Math.round(height / voxel);
    this.half = size / 2;
    this.data = new Uint8Array(this.sx * this.sy * this.sz);
    this.ground = new Int16Array(this.sx * this.sz);
    this.blocks = [null];
    this.ids = {};
    for (const [name, def] of Object.entries(palette)) {
      this.ids[name] = this.blocks.length;
      this.blocks.push({
        name,
        side: rgb(def.color),
        top: rgb(def.top ?? def.color),
        jitter: def.jitter ?? 0.08,
        glow: def.glow ?? 0,
      });
    }
  }

  id(name) {
    const id = this.ids[name];
    if (id === undefined) throw new Error(`Unknown block "${name}"`);
    return id;
  }

  ix(x) { return Math.floor(x / this.vs + this.sx / 2); }
  iz(z) { return Math.floor(z / this.vs + this.sz / 2); }
  iy(y) { return Math.floor(y / this.vs); }
  wx(i) { return (i + 0.5 - this.sx / 2) * this.vs; }
  wz(i) { return (i + 0.5 - this.sz / 2) * this.vs; }

  inBounds(x, y, z) {
    return x >= 0 && z >= 0 && y >= 0 && x < this.sx && z < this.sz && y < this.sy;
  }

  // Below the world counts as solid so the underside is never meshed.
  get(x, y, z) {
    if (x < 0 || z < 0 || x >= this.sx || z >= this.sz || y >= this.sy) return 0;
    if (y < 0) return 1;
    return this.data[(y * this.sz + z) * this.sx + x];
  }

  set(x, y, z, id) {
    if (this.inBounds(x, y, z)) this.data[(y * this.sz + z) * this.sx + x] = id;
  }

  fill(x0, y0, z0, x1, y1, z1, id) {
    for (let y = Math.max(0, y0); y <= Math.min(this.sy - 1, y1); y++)
      for (let z = Math.max(0, z0); z <= Math.min(this.sz - 1, z1); z++)
        for (let x = Math.max(0, x0); x <= Math.min(this.sx - 1, x1); x++)
          this.data[(y * this.sz + z) * this.sx + x] = id;
  }

  groundAt(x, z) {
    if (x < 0 || z < 0 || x >= this.sx || z >= this.sz) return 0;
    return this.ground[z * this.sx + x];
  }

  // Index of the first empty voxel above the highest solid one at or below `from`.
  surface(x, z, from = this.sy - 1) {
    for (let y = Math.min(from, this.sy - 1); y >= 0; y--) if (this.get(x, y, z)) return y + 1;
    return 0;
  }

  heightAt(xm, zm) {
    return this.surface(this.ix(xm), this.iz(zm)) * this.vs;
  }

  mesh(materials) {
    const group = new THREE.Group();
    const { sx, sz, vs } = this;
    const colTop = new Int16Array(sx * sz);
    for (let z = 0; z < sz; z++) for (let x = 0; x < sx; x++) colTop[z * sx + x] = this.surface(x, z);

    for (let cz = 0; cz < sz; cz += CHUNK) {
      for (let cx = 0; cx < sx; cx += CHUNK) {
        const lit = { p: [], n: [], c: [], i: [] };
        const glow = { p: [], n: [], c: [], i: [] };
        for (let z = cz; z < Math.min(cz + CHUNK, sz); z++) {
          for (let x = cx; x < Math.min(cx + CHUNK, sx); x++) {
            const top = colTop[z * sx + x];
            for (let y = 0; y < top; y++) {
              const id = this.data[(y * sz + z) * sx + x];
              if (id) this.emitVoxel(x, y, z, this.blocks[id], lit, glow);
            }
          }
        }
        for (const [buf, mat] of [[lit, materials.lit], [glow, materials.glow]]) {
          if (!buf.i.length) continue;
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(buf.p, 3));
          g.setAttribute('normal', new THREE.Float32BufferAttribute(buf.n, 3));
          g.setAttribute('color', new THREE.Float32BufferAttribute(buf.c, 3));
          g.setIndex(buf.i);
          g.computeBoundingSphere();
          const m = new THREE.Mesh(g, mat);
          m.castShadow = mat === materials.lit;
          m.receiveShadow = true;
          group.add(m);
        }
      }
    }
    group.scale.setScalar(vs);
    group.position.set(-this.half, 0, -this.half);
    return group;
  }

  emitVoxel(x, y, z, block, lit, glow) {
    const pos = [x, y, z];
    const q = [0, 0, 0];
    const ao = [0, 0, 0, 0];
    for (const f of FACES) {
      q[0] = x; q[1] = y; q[2] = z; q[f.d] += f.s;
      if (this.get(q[0], q[1], q[2])) continue;
      const buf = block.glow ? glow : lit;
      const base = f.d === 1 && f.s === 1 ? block.top : block.side;
      const macro = 0.92 + 0.16 * noise2(x * 0.15, z * 0.15, 5);
      const shade = (1 + (hash3(x, y, z) - 0.5) * 2 * block.jitter) * (block.glow ? block.glow : macro);
      const start = buf.p.length / 3;
      for (let k = 0; k < 4; k++) {
        const [cu, cv] = CORNERS[k];
        const p = [pos[0], pos[1], pos[2]];
        if (f.s > 0) p[f.d] += 1;
        p[f.u] += cu; p[f.v] += cv;
        buf.p.push(p[0], p[1], p[2]);
        buf.n.push(f.d === 0 ? f.s : 0, f.d === 1 ? f.s : 0, f.d === 2 ? f.s : 0);
        let light = 1;
        if (!block.glow) {
          const a = [q[0], q[1], q[2]];
          const b = [q[0], q[1], q[2]];
          a[f.u] += cu ? 1 : -1;
          b[f.v] += cv ? 1 : -1;
          const s1 = this.get(a[0], a[1], a[2]) ? 1 : 0;
          const s2 = this.get(b[0], b[1], b[2]) ? 1 : 0;
          a[f.v] += cv ? 1 : -1;
          const c = this.get(a[0], a[1], a[2]) ? 1 : 0;
          ao[k] = s1 && s2 ? 0 : 3 - (s1 + s2 + c);
          light = AO_LEVELS[ao[k]];
        }
        buf.c.push(base[0] * shade * light, base[1] * shade * light, base[2] * shade * light);
      }
      // Split along the diagonal that keeps a dark corner inside one triangle.
      if (ao[0] + ao[2] < ao[1] + ao[3]) {
        buf.i.push(start, start + 1, start + 3, start + 1, start + 2, start + 3);
      } else {
        buf.i.push(start, start + 1, start + 2, start, start + 2, start + 3);
      }
    }
  }
}
