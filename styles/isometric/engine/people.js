import * as THREE from 'three';
import { color, composeMatrix, pick, rad } from './util.js';

const BODY_TOP = 0.64, HEAD_Y = 0.74, HEAD_R = 0.105, KNEEL = 0.6;
const v2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));

const geometries = {
  body: new THREE.LatheGeometry(v2([[0, 0], [0.2, 0], [0.21, 0.05], [0.17, 0.22], [0.135, 0.42], [0.12, 0.55], [0.08, 0.62], [0, BODY_TOP]]), 9),
  mantle: new THREE.LatheGeometry(v2([[0.155, 0.34], [0.17, 0.44], [0.162, 0.53], [0.13, 0.59], [0.08, 0.64], [0.04, 0.655]]), 9),
  head: new THREE.IcosahedronGeometry(HEAD_R, 1).translate(0, HEAD_Y, 0),
};

// Gentle idle sway, phase taken from each instance's position so neighbours move out of step.
export function addSway(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 2.3;
        transformed.x += sin(uTime * 1.2 + ph) * 0.05 * position.y;
        transformed.z += cos(uTime * 0.9 + ph * 0.7) * 0.03 * position.y;
      #endif`);
  };
  return material;
}

function pawnMaterial(uniforms, opts = {}) {
  return addSway(new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true, ...opts }), uniforms);
}

// A single pawn as ordinary meshes (player, Christ, other named figures).
export function makePawn({ robe, mantle, skin, scale = 1, glow = 0, arms = 0 }) {
  const group = new THREE.Group();
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, emissive: glow ? c : '#000000', emissiveIntensity: glow });
  const add = (geo, c) => {
    const mesh = new THREE.Mesh(geo, mat(c));
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };
  add(geometries.body, robe);
  add(geometries.mantle, mantle);
  add(geometries.head, skin);
  if (arms) {
    const armGeo = new THREE.CapsuleGeometry(0.035, 0.26, 3, 6).translate(0, -0.15, 0);
    for (const side of [-1, 1]) {
      const arm = add(armGeo, mantle);
      arm.position.set(side * 0.13, 0.56, 0.02);
      arm.rotation.set(-0.25, 0, side * arms);
    }
  }
  group.scale.setScalar(scale);
  return group;
}

// Many pawns drawn with three instanced meshes. Pawns step aside when the player walks into them.
export class People {
  constructor(list, uniforms) {
    const n = list.length;
    this.list = list;
    this.meshes = ['body', 'mantle', 'head'].map((part) => {
      const mesh = new THREE.InstancedMesh(geometries[part], pawnMaterial(uniforms, part === 'mantle' ? { side: THREE.DoubleSide } : {}), n);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      return mesh;
    });
    [this.body, this.mantle, this.head] = this.meshes;
    this.off = new Float32Array(n * 2);
    this.active = new Set();
    this.grid = new Map();
    this.m = new THREE.Matrix4();
    list.forEach((p, i) => {
      this.body.setColorAt(i, color(p.robe));
      this.mantle.setColorAt(i, color(p.mantle));
      this.head.setColorAt(i, color(p.hood ? p.mantle : p.skin));
      this.write(i);
      const key = this.key(p.x, p.z);
      if (!this.grid.has(key)) this.grid.set(key, []);
      this.grid.get(key).push(i);
    });
  }

  key(x, z) { return `${Math.floor(x / 2)},${Math.floor(z / 2)}`; }

  write(i) {
    const p = this.list[i], x = p.x + this.off[i * 2], z = p.z + this.off[i * 2 + 1], s = p.scale, k = p.kneel ? KNEEL : 1;
    this.body.setMatrixAt(i, composeMatrix(this.m, x, p.y, z, s, s * k, s, 0, p.ry, 0));
    this.mantle.setMatrixAt(i, this.m);
    const headDrop = p.kneel ? (BODY_TOP * KNEEL + HEAD_R * 0.8 - HEAD_Y) * s : 0;
    this.head.setMatrixAt(i, composeMatrix(this.m, x, p.y + headDrop, z, s, s, s, 0, p.ry, 0));
  }

  update(px, pz, dt, radius = 0.55) {
    const cx = Math.floor(px / 2), cz = Math.floor(pz / 2);
    const pushed = new Set();
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gz = cz - 1; gz <= cz + 1; gz++) {
        for (const i of this.grid.get(`${gx},${gz}`) ?? []) {
          const p = this.list[i];
          const dx = p.x + this.off[i * 2] - px, dz = p.z + this.off[i * 2 + 1] - pz, d = Math.hypot(dx, dz) || 0.001;
          const reach = radius + 0.18 * p.scale;
          if (d >= reach) continue;
          this.off[i * 2] += (dx / d) * (reach - d);
          this.off[i * 2 + 1] += (dz / d) * (reach - d);
          pushed.add(i);
          this.active.add(i);
        }
      }
    }
    if (!this.active.size) return;
    const decay = Math.exp(-dt * 0.8);
    for (const i of this.active) {
      if (!pushed.has(i)) {
        this.off[i * 2] *= decay;
        this.off[i * 2 + 1] *= decay;
        if (Math.abs(this.off[i * 2]) + Math.abs(this.off[i * 2 + 1]) < 0.004) {
          this.off[i * 2] = this.off[i * 2 + 1] = 0;
          this.active.delete(i);
        }
      }
      this.write(i);
    }
    for (const mesh of this.meshes) mesh.instanceMatrix.needsUpdate = true;
  }
}

function person(spec, r, x, z, y, face, kid) {
  const pal = spec.palette;
  const scale = kid ? spec.childScale ?? 0.66 : 0.92 + r() * 0.16;
  return {
    x, z, y, scale,
    ry: Math.atan2(face[0] - x, face[1] - z),
    kneel: r() < (spec.kneelRatio ?? 0),
    robe: pick(r, pal.robes), mantle: pick(r, pal.mantles), skin: pick(r, pal.skin),
    hood: !kid && r() < (pal.hoodRatio ?? 0.3),
  };
}

function distToSegment(x, z, [x1, z1, x2, z2]) {
  const vx = x2 - x1, vz = z2 - z1, t = Math.max(0, Math.min(1, ((x - x1) * vx + (z - z1) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(x - x1 - vx * t, z - z1 - vz * t);
}

// Fills an arc around a focal point, densest nearest the center, leaving aisles and obstacles clear.
export function generateCrowd(spec, ctx) {
  const r = ctx.rand, [cx, cz] = spec.center, face = spec.faceToward ?? spec.center, sp = spec.spacing;
  const [rMin, rMax] = spec.radius, [a0, a1] = spec.arc ?? [-180, 180];
  const candidates = [];
  for (let gx = cx - rMax; gx <= cx + rMax; gx += sp) {
    for (let gz = cz - rMax; gz <= cz + rMax; gz += sp) {
      const x = gx + (r() - 0.5) * sp * 0.7, z = gz + (r() - 0.5) * sp * 0.7;
      const d = Math.hypot(x - cx, z - cz), ang = (Math.atan2(x - cx, z - cz) * 180) / Math.PI;
      if (d < rMin || d > rMax || ang < a0 || ang > a1) continue;
      if (ctx.ground.isBlocked(x, z) || ctx.inNoCrowd(x, z)) continue;
      if ((spec.aisles ?? []).some((a) => distToSegment(x, z, a) < a[4] / 2)) continue;
      candidates.push({ x, z, score: d + r() * (spec.looseness ?? 4) });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  return candidates.slice(0, spec.count).map(({ x, z }) => person(spec, r, x, z, ctx.ground.heightAt(x, z), face, r() < (spec.childRatio ?? 0)));
}

// A ring of people around a point, e.g. children gathered around a figure.
export function generateRing(spec, ctx) {
  const r = ctx.rand, [cx, cz] = spec.center, out = [];
  for (let i = 0; i < spec.count; i++) {
    const a = rad(spec.arc?.[0] ?? 0) + (i / spec.count) * rad((spec.arc?.[1] ?? 360) - (spec.arc?.[0] ?? 0)) + (r() - 0.5) * 0.15;
    const d = spec.radius + (r() - 0.5) * (spec.jitter ?? 0.4);
    const x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
    if (ctx.ground.isBlocked(x, z)) continue;
    out.push(person(spec, r, x, z, ctx.ground.heightAt(x, z), spec.center, spec.children));
  }
  return out;
}
