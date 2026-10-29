import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, polarScatter, insideAny, jitterColor } from './util.js';

function tint(geo, fn) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    const v = fn(cx, cy, cz);
    for (let k = 0; k < 3; k++) col.set([v, v, v], (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

// Person parts share one origin at the feet and face +z. Vertex colors are multipliers on the instance color.
export const parts = {
  robe: () => tint(new THREE.CylinderGeometry(0.17, 0.3, 1.36, 7).translate(0, 0.68, 0), (x, y) => (y < 0.12 ? 0.75 : 1)),
  mantle: () => tint(new THREE.CylinderGeometry(0.2, 0.33, 0.62, 7).translate(0, 1.08, -0.02), () => 1),
  head: () =>
    tint(new THREE.IcosahedronGeometry(0.13, 0).scale(1, 1.12, 1).translate(0, 1.53, 0), (x, y, z) =>
      z > 0.03 && y < 1.6 ? 1 : 0.32,
    ),
  hood: () => {
    const gap = Math.PI * 0.55;
    const dome = new THREE.SphereGeometry(0.165, 8, 3, Math.PI / 2 + gap / 2, Math.PI * 2 - gap, 0, Math.PI / 2).translate(0, 1.56, -0.01);
    const drape = new THREE.CylinderGeometry(0.165, 0.25, 0.42, 8, 1, true, gap / 2, Math.PI * 2 - gap).translate(0, 1.35, -0.01);
    return tint(mergeGeometries([dome.toNonIndexed(), drape.toNonIndexed()]), () => 1);
  },
  arms: (pose) => {
    const arm = (side) => {
      const g = new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0);
      const spread = pose === 'out' ? 0.95 : 0.12;
      const forward = pose === 'out' ? 0.35 : 0.05;
      g.rotateX(-forward);
      g.rotateZ(side * spread);
      g.translate(side * 0.2, 1.32, 0.02);
      return g;
    };
    return tint(mergeGeometries([arm(-1), arm(1)]), () => 1);
  },
};

function sway(material, time) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.61;
          transformed.x += sin(uTime * 0.9 + ph) * 0.03 * position.y;
          transformed.z += cos(uTime * 0.7 + ph * 1.3) * 0.02 * position.y;
        #endif`,
      );
  };
}

// Scatter people across rings and arcs with a minimum spacing, avoiding zones, all facing a focus point.
export function placeCrowd(groups, heightAt, standAt) {
  const people = [];
  const cell = 1;
  const grid = new Map();
  const key = (x, z) => Math.floor(x / cell) * 73856093 ^ Math.floor(z / cell) * 19349663;
  const tooClose = (x, z, gap) => {
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++)
        for (const p of grid.get(key(x + dx * cell, z + dz * cell)) ?? []) if ((p.x - x) ** 2 + (p.z - z) ** 2 < gap * gap) return true;
    return false;
  };
  for (const g of groups) {
    const rand = rng(g.seed ?? 11);
    const { count, spacing = 0.8, face, children = 0.2, kneel = 0, palette } = g;
    let placed = 0;
    for (let tries = 0; placed < count && tries < count * 60; tries++) {
      const [x, z] = g.points ? g.points[placed] : polarScatter(rand, g);
      if (!g.points && (insideAny(x, z, g.avoid) || tooClose(x, z, spacing))) continue;
      const child = rand() < children;
      const target = face ?? g.center;
      const p = {
        x, z,
        y: (g.onStructures ? standAt : heightAt)(x, z) - (rand() < kneel ? 0.48 : 0),
        yaw: Math.atan2(target[0] - x, target[1] - z) + rand.range(-0.35, 0.35),
        scale: child ? rand.range(0.55, 0.72) : rand.range(0.92, 1.1),
        robe: jitterColor(rand.pick(palette.robes), rand, 0.08),
        mantle: rand() < (palette.mantleChance ?? 0.6) ? jitterColor(rand.pick(palette.mantles), rand, 0.08) : null,
        hood: rand() < (palette.hoodChance ?? 0.3),
        skin: jitterColor(rand.pick(palette.skins), rand, 0.05),
      };
      people.push(p);
      const k = key(x, z);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(p);
      placed++;
    }
  }
  return people;
}

export function createCrowd(people, time) {
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  sway(material, time);
  const group = new THREE.Group();
  const meshes = {
    robe: new THREE.InstancedMesh(parts.robe(), material, people.length),
    mantle: new THREE.InstancedMesh(parts.mantle(), material, people.length),
    head: new THREE.InstancedMesh(parts.head(), material, people.length),
    hood: new THREE.InstancedMesh(parts.hood(), material, people.length),
  };
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const up = new THREE.Vector3(0, 1, 0);
  people.forEach((person, i) => {
    p.set(person.x, person.y, person.z);
    q.setFromAxisAngle(up, person.yaw);
    s.setScalar(person.scale);
    m.compose(p, q, s);
    meshes.robe.setMatrixAt(i, m);
    meshes.robe.setColorAt(i, person.robe);
    meshes.head.setMatrixAt(i, m);
    meshes.head.setColorAt(i, person.skin);
    meshes.mantle.setMatrixAt(i, person.mantle ? m : zero);
    meshes.mantle.setColorAt(i, person.mantle ?? person.robe);
    meshes.hood.setMatrixAt(i, person.hood ? m : zero);
    meshes.hood.setColorAt(i, person.mantle ?? person.robe);
  });
  for (const mesh of Object.values(meshes)) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }
  return group;
}

// A single hand-placed figure, e.g. Christ, built from the same parts with its own materials.
export function createFigure({ x, y, z, face, scale = 1, robe = '#f4efe6', mantle, skin = '#b07a55', arms = 'down', emissive = 0, hood = false }) {
  const group = new THREE.Group();
  const lit = (c, glow = emissive) => new THREE.MeshLambertMaterial({ color: c, vertexColors: true, emissive: new THREE.Color(c), emissiveIntensity: glow });
  group.add(new THREE.Mesh(parts.robe(), lit(robe)));
  group.add(new THREE.Mesh(parts.arms(arms), lit(mantle ?? robe)));
  if (mantle) group.add(new THREE.Mesh(parts.mantle(), lit(mantle)));
  if (hood) group.add(new THREE.Mesh(parts.hood(), lit(mantle ?? robe)));
  group.add(new THREE.Mesh(parts.head(), lit(skin, 0)));
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  if (face) group.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  group.traverse((o) => (o.castShadow = true));
  return group;
}
