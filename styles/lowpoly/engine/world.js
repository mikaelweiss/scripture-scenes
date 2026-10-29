import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { jitterColor } from './util.js';

const tmpMatrix = new THREE.Matrix4();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();

// Collects flat-colored geometry in world space and merges it into one draw call.
export class Batch {
  constructor(rand) {
    this.rand = rand;
    this.parts = [];
  }

  add(geometry, { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#888', jitter = 0.05, shade } = {}) {
    let geo = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const name of Object.keys(geo.attributes)) if (name !== 'position') geo.deleteAttribute(name);
    tmpEuler.set(rotation[0], rotation[1], rotation[2], 'YXZ');
    tmpQuat.setFromEuler(tmpEuler);
    tmpMatrix.compose(new THREE.Vector3(...position), tmpQuat, new THREE.Vector3(...scale));
    geo.applyMatrix4(tmpMatrix);
    geo.computeVertexNormals();
    const pos = geo.attributes.position, nrm = geo.attributes.normal;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color(color);
    for (let i = 0; i < pos.count; i += 3) {
      const c = jitter ? jitterColor(base, this.rand, jitter) : base.clone();
      if (shade) shade(c, nrm.getY(i), pos.getY(i));
      for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.parts.push(geo);
    return geo;
  }

  box(w, h, d, opts = {}) {
    return this.add(new THREE.BoxGeometry(w, h, d), opts);
  }

  build(material) {
    if (!this.parts.length) return null;
    const mesh = new THREE.Mesh(mergeGeometries(this.parts), material);
    this.parts = [];
    return mesh;
  }
}

// Oriented boxes the walker can stand on or bump into, bucketed on a grid.
export class Colliders {
  constructor(cell = 10) {
    this.cell = cell;
    this.grid = new Map();
  }

  add({ x, z, w, d, rot = 0, bottom = -10, top }) {
    const box = { x, z, hw: w / 2, hd: d / 2, c: Math.cos(rot), s: Math.sin(rot), bottom, top };
    const r = Math.hypot(w, d) / 2 + 1;
    for (let gx = Math.floor((x - r) / this.cell); gx <= Math.floor((x + r) / this.cell); gx++) {
      for (let gz = Math.floor((z - r) / this.cell); gz <= Math.floor((z + r) / this.cell); gz++) {
        const key = gx * 100003 + gz;
        if (!this.grid.has(key)) this.grid.set(key, []);
        this.grid.get(key).push(box);
      }
    }
  }

  // Ground height under (x, z) for feet at `feet`, or null when a wall blocks the body.
  ground(x, z, feet, terrain, { radius = 0.3, stepUp = 0.65, height = 1.7 } = {}) {
    let ground = terrain;
    const list = this.grid.get(Math.floor(x / this.cell) * 100003 + Math.floor(z / this.cell));
    if (!list) return ground;
    for (const b of list) {
      const dx = x - b.x, dz = z - b.z;
      const lx = dx * b.c - dz * b.s, lz = dx * b.s + dz * b.c;
      if (Math.abs(lx) > b.hw + radius || Math.abs(lz) > b.hd + radius) continue;
      if (b.top <= feet + stepUp) ground = Math.max(ground, b.top);
      else if (b.bottom < feet + height) return null;
    }
    return ground;
  }
}
