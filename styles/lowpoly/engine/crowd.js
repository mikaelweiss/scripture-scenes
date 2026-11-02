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

const merge = (...geos) => mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
const lathe = (profile, segments = 8) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
const broad = (geo) => geo.scale(1.12, 1, 0.86);

function limb(from, to, r0, r1, segments = 5) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const g = new THREE.CylinderGeometry(r1, r0, dir.length(), segments).translate(0, dir.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
  return g.translate(a.x, a.y, a.z);
}

// Kneeling folds the legs under the hips: the upper body drops onto the heels and leans slightly forward.
const HIP = 0.88, KNEEL_HIP = 0.34, LEAN = 0.1;
// placeCrowd and scene kits sink kneelers by this much; createCrowd lifts them back onto the ground.
const KNEEL_SINK = 0.48;
const kneelMatrix = new THREE.Matrix4()
  .makeTranslation(0, KNEEL_HIP, 0)
  .multiply(new THREE.Matrix4().makeRotationX(LEAN))
  .multiply(new THREE.Matrix4().makeTranslation(0, -HIP, 0));
const kneeled = (geo) => geo.clone().applyMatrix4(kneelMatrix);
const kneelPoint = (p) => new THREE.Vector3(...p).applyMatrix4(kneelMatrix).toArray();

const SHOULDER = 0.2;
const torsoProfile = [[0.22, 0.78], [0.2, 0.92], [0.2, 0.99], [0.225, 1.18], [0.17, 1.26], [0.095, 1.31]];
const beltTint = (y) => (y > 0.915 && y < 0.995 ? 0.7 : 1);
const torso = (profile) => tint(broad(lathe(profile)), (x, y) => (y < 0.12 ? 0.75 : beltTint(y)));
const skinTint = (x, y, z) => (y < 1.42 ? 0.8 : z > 0.02 ? 1 : 0.88);
const head = () => merge(new THREE.CylinderGeometry(0.062, 0.07, 0.16, 6).translate(0, 1.37, 0), new THREE.IcosahedronGeometry(0.13, 0).scale(1, 1.12, 1).translate(0, 1.52, 0));
const hand = (p) => new THREE.IcosahedronGeometry(0.05, 0).translate(...p);

// Crowd shapes come standing and kneeling, sharing one origin at the ground under the person, facing +z.
const crowdShapes = {
  body: () => {
    // Standing sleeves hug the robe and end without hands, so scene kits that add their own posed arms do not show a second pair.
    const sleeves = (s) => tint(limb([s * SHOULDER, 1.21, 0], [s * 0.245, 0.76, 0.04], 0.056, 0.066), () => 0.92);
    const stand = merge(torso([[0.3, 0], [0.27, 0.12], [0.21, 0.75], ...torsoProfile.slice(1)]), sleeves(-1), sleeves(1));
    const shoulder = (s) => kneelPoint([s * SHOULDER, 1.21, 0]);
    const elbow = (s) => kneelPoint([s * 0.24, 0.96, 0.03]);
    const kneelArm = (s) =>
      tint(merge(limb(shoulder(s), elbow(s), 0.058, 0.064), limb(elbow(s), [s * 0.13, 0.33, 0.28], 0.064, 0.07)), () => 0.92);
    const thigh = (s) => tint(limb([s * 0.105, 0.27, -0.08], [s * 0.11, 0.17, 0.34], 0.13, 0.115, 6), () => 1);
    const foot = (s) => tint(new THREE.BoxGeometry(0.1, 0.07, 0.15).translate(s * 0.1, 0.04, -0.32), () => 0.55);
    const seat = tint(new THREE.CylinderGeometry(0.24, 0.28, 0.2, 8).translate(0, 0.1, -0.03), (x, y) => (y < 0.06 ? 0.75 : 0.95));
    const kneel = merge(kneeled(torso(torsoProfile)), seat, thigh(-1), thigh(1), foot(-1), foot(1), kneelArm(-1), kneelArm(1));
    return [stand, kneel];
  },
  skin: () => {
    const face = tint(head(), skinTint);
    const hands = (points) => tint(merge(...points.map(hand)), () => 0.95);
    return [
      face,
      merge(kneeled(face), hands([[-0.13, 0.33, 0.33], [0.13, 0.33, 0.33]])),
    ];
  },
  mantle: () => {
    const upper = [[0.285, 1.16], [0.235, 1.26], [0.105, 1.325]];
    const cloak = (hem) => tint(broad(lathe([[hem[0] + 0.005, hem[1]], ...upper])).translate(0, 0, -0.01), (x, y) => (y < hem[1] + 0.04 ? 0.85 : 1));
    // A kneeler's mantle stops at the waist so it does not swallow the folded legs.
    return [cloak([0.305, 0.76]), kneeled(cloak([0.29, 1.02]))];
  },
  hair: () => {
    const cap = new THREE.SphereGeometry(0.142, 8, 4, Math.PI * 0.8, Math.PI * 1.4, 0, Math.PI * 0.68).scale(1, 1.08, 1).translate(0, 1.535, -0.008);
    const shaded = tint(cap, (x, y) => (y > 1.6 ? 1 : 0.9));
    return [shaded, kneeled(shaded)];
  },
  hood: () => {
    const hood = parts.hood().translate(0, -0.02, 0).scale(1.15, 1, 1.1);
    return [hood, kneeled(hood)];
  },
};
let shapeCache;
const shapes = () => (shapeCache ??= Object.fromEntries(Object.entries(crowdShapes).map(([k, build]) => [k, build()])));

const HAIR = ['#3a2a20', '#4a3426', '#2e2420', '#56402e', '#44342a', '#7c7268'];
const HEADCLOTHS = ['#e6dcc6', '#d8ccb0', '#cbbd9c', '#efe6d2', '#c9b48e', '#b8a888'];

// Hair and headcloth come from a hash of the position so placeCrowd's random sequence, and every scene's layout, stays the same.
function hairColor(person) {
  const rand = rng((Math.floor(person.x * 97) * 73856093) ^ (Math.floor(person.z * 89) * 19349663));
  return jitterColor(rand() < 0.45 ? rand.pick(HEADCLOTHS) : rand.pick(HAIR), rand, 0.08);
}

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
      const kneeling = rand() < kneel;
      const p = {
        x, z,
        y: (g.onStructures ? standAt : heightAt)(x, z) - (kneeling ? KNEEL_SINK : 0),
        yaw: Math.atan2(target[0] - x, target[1] - z) + rand.range(-0.35, 0.35),
        scale: child ? rand.range(0.55, 0.72) : rand.range(0.92, 1.1),
        robe: jitterColor(rand.pick(palette.robes), rand, 0.08),
        mantle: rand() < (palette.mantleChance ?? 0.6) ? jitterColor(rand.pick(palette.mantles), rand, 0.08) : null,
        hood: rand() < (palette.hoodChance ?? 0.3),
        skin: jitterColor(rand.pick(palette.skins), rand, 0.05),
        kneeling,
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
  const geometry = shapes();
  const lists = {};
  const put = (part, pose, matrix, color) => (lists[`${part}.${pose}`] ??= { part, pose, items: [] }).items.push([matrix, color]);
  const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (const person of people) {
    const kneeling = Boolean(person.kneeling ?? person.kneel);
    const pose = kneeling ? 1 : 0;
    const ground = person.y + (kneeling ? KNEEL_SINK : 0);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(person.x, ground, person.z), q.setFromAxisAngle(up, person.yaw), new THREE.Vector3().setScalar(person.scale));
    put('body', pose, m, person.robe);
    put('skin', pose, m, person.skin);
    if (person.mantle) put('mantle', pose, m, person.mantle);
    if (person.hood) put('hood', pose, m, person.mantle ?? person.robe);
    else put('hair', pose, m, person.hair ?? hairColor(person));
  }
  for (const { part, pose, items } of Object.values(lists)) {
    const mesh = new THREE.InstancedMesh(geometry[part][pose], material, items.length);
    items.forEach(([m, c], i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c);
    });
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
