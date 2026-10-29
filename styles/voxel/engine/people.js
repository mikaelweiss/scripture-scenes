import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, pick } from './noise.js';
import { inArea } from './builders.js';

// Figures face +Z. Boxes are [x0, y0, z0, x1, y1, z1] in meters, grouped by color part.
const POSES = {
  stand: {
    robe: [[-0.26, 0, -0.17, 0.26, 0.5, 0.18], [-0.24, 0.5, -0.15, 0.24, 1.42, 0.16],
      [-0.37, 0.78, -0.1, -0.24, 1.4, 0.1], [0.24, 0.78, -0.1, 0.37, 1.4, 0.1]],
    skin: [[-0.14, 1.42, -0.13, 0.14, 1.72, 0.15], [-0.36, 0.66, -0.07, -0.25, 0.78, 0.07], [0.25, 0.66, -0.07, 0.36, 0.78, 0.07]],
    accent: [[-0.25, 0.92, -0.17, 0.25, 1.02, 0.17], [-0.16, 1.66, -0.15, 0.16, 1.78, 0.17], [-0.16, 1.36, -0.17, 0.16, 1.7, -0.11]],
  },
  kneel: {
    robe: [[-0.26, 0, -0.3, 0.26, 0.28, 0.3], [-0.24, 0.28, -0.24, 0.24, 1.0, 0.06],
      [-0.36, 0.42, -0.08, -0.24, 0.96, 0.12], [0.24, 0.42, -0.08, 0.36, 0.96, 0.12]],
    skin: [[-0.14, 1.0, -0.17, 0.14, 1.3, 0.11], [-0.33, 0.34, 0.06, -0.24, 0.44, 0.18], [0.24, 0.34, 0.06, 0.33, 0.44, 0.18]],
    accent: [[-0.25, 0.55, -0.25, 0.25, 0.64, 0.07], [-0.16, 1.24, -0.19, 0.16, 1.36, 0.13], [-0.16, 0.94, -0.21, 0.16, 1.28, -0.15]],
  },
  sit: {
    robe: [[-0.26, 0, -0.2, 0.26, 0.24, 0.42], [-0.24, 0.24, -0.2, 0.24, 0.92, 0.1],
      [-0.36, 0.4, -0.08, -0.24, 0.9, 0.12], [0.24, 0.4, -0.08, 0.36, 0.9, 0.12]],
    skin: [[-0.14, 0.92, -0.16, 0.14, 1.22, 0.12], [-0.3, 0.26, 0.12, -0.18, 0.36, 0.26], [0.18, 0.26, 0.12, 0.3, 0.36, 0.26]],
    accent: [[-0.25, 0.48, -0.21, 0.25, 0.56, 0.11], [-0.16, 1.16, -0.18, 0.16, 1.28, 0.14], [-0.16, 0.86, -0.2, 0.16, 1.2, -0.14]],
  },
  armsOut: {
    robe: [[-0.28, 0, -0.18, 0.28, 0.55, 0.19], [-0.25, 0.55, -0.16, 0.25, 1.44, 0.17],
      [-0.7, 1.12, -0.1, -0.25, 1.32, 0.1], [0.25, 1.12, -0.1, 0.7, 1.32, 0.1]],
    skin: [[-0.14, 1.44, -0.13, 0.14, 1.74, 0.15], [-0.82, 1.1, -0.07, -0.7, 1.26, 0.07], [0.7, 1.1, -0.07, 0.82, 1.26, 0.07]],
    accent: [[-0.26, 0.95, -0.18, 0.26, 1.03, 0.18], [-0.16, 1.68, -0.15, 0.16, 1.78, 0.17], [-0.16, 1.32, -0.17, 0.16, 1.72, -0.1]],
  },
};

const PARTS = ['robe', 'skin', 'accent'];

function partGeometry(boxes, top) {
  const geos = boxes.map(([x0, y0, z0, x1, y1, z1]) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const s = 0.5 + 0.5 * Math.min(1, pos.getY(i) / top);
      col.set([s, s, s], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.deleteAttribute('uv');
    return g;
  });
  return mergeGeometries(geos);
}

export function figureGeometries(pose) {
  const def = POSES[pose];
  const top = Math.max(...def.skin.map((b) => b[4]));
  return Object.fromEntries(PARTS.map((p) => [p, partGeometry(def[p], top)]));
}

// Rows of people in arcs around a focal point, skipping blocked or excluded ground.
export function placeCrowd(world, spec) {
  const rand = rng(spec.seed ?? 42);
  const people = [];
  const { x: cx, z: cz } = spec.center;
  const a0 = (spec.arc?.[0] ?? -180) * Math.PI / 180, a1 = (spec.arc?.[1] ?? 180) * Math.PI / 180;
  for (let r = spec.rmin; people.length < spec.count && r < spec.rmax; r += spec.rowGap) {
    const n = Math.floor(((a1 - a0) * r) / spec.spacing);
    const rowShift = rand();
    for (let j = 0; j < n && people.length < spec.count; j++) {
      if (rand() < (spec.gaps ?? 0.1)) continue;
      const a = a0 + ((j + rowShift + (rand() - 0.5) * 0.4) / n) * (a1 - a0);
      const rr = r + (rand() - 0.5) * spec.rowGap * 0.5;
      const x = cx + Math.sin(a) * rr, z = cz + Math.cos(a) * rr;
      if ((spec.exclude ?? []).some((e) => inArea(e, x, z))) continue;
      const y = standHeight(world, x, z);
      if (y === null) continue;
      people.push(person(spec, rand, x, y, z));
    }
  }
  return people;
}

export function ringOf(world, spec) {
  const rand = rng(spec.seed ?? 8);
  const out = [];
  for (let i = 0; i < spec.count; i++) {
    const a = (i / spec.count) * Math.PI * 2 + (spec.offset ?? 0);
    const x = spec.center.x + Math.sin(a) * spec.r, z = spec.center.z + Math.cos(a) * spec.r;
    const y = standHeight(world, x, z) ?? world.heightAt(x, z);
    out.push(person(spec, rand, x, y, z));
  }
  return out;
}

function person(spec, rand, x, y, z) {
  const face = spec.face ?? spec.center;
  const child = rand() < (spec.child ?? 0);
  const pose = spec.pose ?? (rand() < (spec.kneel ?? 0) ? 'kneel' : 'stand');
  return {
    x, y, z, pose,
    yaw: Math.atan2(face.x - x, face.z - z) + (rand() - 0.5) * (spec.yawJitter ?? 0.5),
    scale: (spec.scale ?? 1) * (child ? 0.62 : 0.9 + rand() * 0.18),
    robe: pick(spec.robes, rand), skin: pick(spec.skins, rand), accent: pick(spec.accents, rand),
  };
}

function standHeight(world, x, z) {
  const ix = world.ix(x), iz = world.iz(z);
  if (!world.inBounds(ix, 0, iz)) return null;
  const top = world.surface(ix, iz);
  if (Math.abs(top - world.groundAt(ix, iz)) > 2) return null;
  for (let y = top; y < top + 4; y++) if (world.get(ix, y, iz)) return null;
  return top * world.vs;
}

export function createPeople(list, { lit = false } = {}) {
  const group = new THREE.Group();
  const byPose = {};
  for (const p of list) (byPose[p.pose] ??= []).push(p);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), c = new THREE.Color();
  for (const [pose, people] of Object.entries(byPose)) {
    const geos = figureGeometries(pose);
    for (const part of PARTS) {
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
      if (lit) mat.emissive = new THREE.Color(lit.emissive ?? '#000').multiplyScalar(lit.intensity ?? 1);
      const mesh = new THREE.InstancedMesh(geos[part], mat, people.length);
      people.forEach((p, i) => {
        q.setFromAxisAngle(up, p.yaw);
        m.compose(v.set(p.x, p.y, p.z), q, s.setScalar(p.scale));
        mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, c.set(p[part]));
      });
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      group.add(mesh);
    }
  }
  return group;
}
