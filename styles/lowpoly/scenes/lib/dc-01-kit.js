import * as THREE from 'three';
import { placeCrowd, parts } from '../../engine/crowd.js';
import { rng, jitterColor } from '../../engine/util.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export const period = {
  men: {
    robes: ['#2a2a2e', '#4a3a2c', '#353d52', '#5a4a38', '#2e3a30', '#4a4a50', '#3a3230'],
    mantles: ['#1f1f22', '#2e2924', '#272c36', '#3b3128'],
    skins: ['#e0b48f', '#d4a17c', '#c99474', '#e6bf9b', '#d9ad88'],
    mantleChance: 0.7,
    hoodChance: 0,
  },
  women: {
    robes: ['#5a4a5e', '#6b5a48', '#4c5a6a', '#7a6a58', '#3d4a3e', '#8a7a6a', '#5e3c38', '#6a6f7a', '#4a3a30'],
    mantles: ['#d8cfbf', '#a89c88', '#4a4038', '#6e6458', '#c4b8a4', '#7a5a4a'],
    skins: ['#e0b48f', '#d4a17c', '#e6bf9b', '#d9ad88'],
    mantleChance: 0.75,
    hoodChance: 0.6,
    women: true,
  },
};

export function box(ctx, { x, y = 0, z, w, h, d, rot = 0, color, jitter = 0.04, collide = true, glow = false }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter, shade: glow ? undefined : darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function shaded(geo, fn = () => 1) {
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

const merge = (...geos) => {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  const pos = new Float32Array(parts.reduce((n, g) => n + g.attributes.position.array.length, 0));
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o);
    o += g.attributes.position.array.length;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return g;
};

// 1830s dress built from the same proportions as the engine crowd: origin at the feet, facing +z.
// Seated people sink into their bench, so their parts drop by SIT and legs are left out.
const SIT = 0.42;
const shapes = {
  shins: () => shaded(merge(...[-1, 1].map((s) => new THREE.CylinderGeometry(0.07, 0.065, 0.48, 5).rotateX(Math.PI / 2).translate(s * 0.1, SIT + 0.07, -0.16))), (x, y, z) => (z < -0.36 ? 0.45 : 1)),
  legs: () => shaded(merge(...[-1, 1].map((s) => new THREE.CylinderGeometry(0.075, 0.07, 0.62, 5).translate(s * 0.09, 0.31, 0))), (x, y) => (y < 0.06 ? 0.45 : 1)),
  coat: () => shaded(new THREE.CylinderGeometry(0.17, 0.25, 0.86, 7).translate(0, 0.99, 0), (x, y) => (y < 0.62 ? 0.82 : 1)),
  shoulders: () => shaded(new THREE.CylinderGeometry(0.21, 0.19, 0.12, 7).translate(0, 1.38, 0)),
  front: () => shaded(merge(new THREE.BoxGeometry(0.14, 0.2, 0.06).translate(0, 1.33, 0.155), new THREE.BoxGeometry(0.18, 0.05, 0.05).translate(0, 1.43, 0.12))),
  vest: () => shaded(new THREE.BoxGeometry(0.2, 0.26, 0.06).translate(0, 1.13, 0.17)),
  collar: () => shaded(new THREE.CylinderGeometry(0.085, 0.1, 0.07, 7).translate(0, 1.45, 0)),
  arms: () => {
    const arm = (s) => new THREE.CylinderGeometry(0.055, 0.065, 0.6, 5).translate(0, -0.3, 0).rotateX(-0.05).rotateZ(s * 0.12).translate(s * 0.2, 1.38, 0.0);
    return shaded(merge(arm(-1), arm(1)), (x, y) => (y < 0.86 ? 0.8 : 1));
  },
  hands: () => shaded(merge(...[-1, 1].map((s) => new THREE.IcosahedronGeometry(0.05, 0).translate(s * 0.27, 0.78, 0.0)))),
  dress: () => shaded(new THREE.CylinderGeometry(0.16, 0.34, 1.38, 8).translate(0, 0.69, 0), (x, y) => (y < 0.1 ? 0.7 : 1)),
  shawl: () => shaded(new THREE.CylinderGeometry(0.19, 0.3, 0.42, 8).translate(0, 1.2, -0.01)),
  apron: () => shaded(new THREE.BoxGeometry(0.3, 0.6, 0.04).translate(0, 0.62, 0.25).rotateX(-0.12)),
  head: () => shaded(new THREE.IcosahedronGeometry(0.13, 1).scale(1, 1.12, 1).translate(0, 1.56, 0), (x, y, z) => (z > 0.02 ? 1 : 0.85)),
  hair: () => shaded(new THREE.SphereGeometry(0.142, 8, 4, Math.PI * 0.82, Math.PI * 1.36, 0, Math.PI * 0.62).scale(1, 1.1, 1).translate(0, 1.57, -0.01)),
  hat: () => shaded(merge(new THREE.CylinderGeometry(0.115, 0.125, 0.2, 8).translate(0, 1.79, -0.01), new THREE.CylinderGeometry(0.22, 0.22, 0.02, 10).translate(0, 1.69, -0.01))),
  bonnet: () => {
    const crown = new THREE.SphereGeometry(0.16, 8, 4, Math.PI * 0.8, Math.PI * 1.4, 0, Math.PI * 0.62).scale(1, 1.1, 1.1).translate(0, 1.58, -0.02);
    const brim = new THREE.CylinderGeometry(0.2, 0.17, 0.14, 9, 1, true, -Math.PI * 0.62, Math.PI * 1.24).rotateX(Math.PI / 2 - 0.35).translate(0, 1.66, 0.04);
    return shaded(merge(crown, brim));
  },
};
const shapeCache = {};
shapes.hood = () => shaded(parts.hood().scale(1.05, 1.03, 1.05));
const shape = (k) => (shapeCache[k] ??= shapes[k]());

function swayMaterial(time) {
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.61;
        transformed.x += sin(uTime * 0.9 + ph) * 0.02 * position.y;
        transformed.z += cos(uTime * 0.7 + ph * 1.3) * 0.015 * position.y;`,
      );
  };
  return material;
}

const HAIR = ['#2a1d15', '#3b2718', '#4e3420', '#6a4626', '#1d1814', '#8a6a44', '#7a7068', '#a88a5c'];
const TROUSERS = ['#6e6250', '#4a4640', '#8a7c62', '#3c3a3a', '#5c5448', '#9a8c70'];
const VESTS = ['#7a5a3a', '#5a5048', '#8a3a30', '#4a5a6a', '#c8b89a', '#3a4a3a', '#6a4a5a'];
const BONNETS = ['#e8e0cc', '#d4c8b0', '#5a4a3e', '#3e3a40', '#c8b490', '#f2ece0'];

// Places groups in 1830s dress, or in ancient robes when the palette sets `ancient`.
// Each group: { ...placeCrowd group, palette (period.men, period.women, or an ancient palette), hats, seated, kneel, lift, y, arms, exact }.
// Men wear frock coats, light trousers, a white shirt front and cravat, and hats outdoors. Women wear long dresses, shawls, aprons, and bonnets.
export function crowd(ctx, groups) {
  const time = { value: 0 };
  const material = swayMaterial(time);
  const items = {};
  const put = (k, p, color, drop = 0) => (items[k] ??= []).push([p, color, drop]);
  const all = [];
  for (const g of groups) {
    const people = placeCrowd([g], ctx.heightAt, (x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 }));
    const r = rng((g.seed ?? 1) + 77);
    const woman = g.palette?.women ?? g.palette === period.women;
    for (const p of people) {
      if (g.y !== undefined) p.y = g.y;
      p.y += g.lift ?? 0;
      if (g.scale) p.scale = g.scale;
      if (g.exact) p.yaw = Math.atan2((g.face ?? g.center)[0] - p.x, (g.face ?? g.center)[1] - p.z);
      const drop = g.seated || g.kneel ? SIT : 0;
      const o = g.outfit ?? {};
      const hair = jitterColor(o.hair ?? r.pick(HAIR), r, 0.06);
      put('head', p, p.skin, drop);
      if (g.palette?.ancient) {
        put('dress', p, p.robe, drop);
        if (p.mantle) put('shawl', p, p.mantle, drop);
        put(p.hood ? 'hood' : 'hair', p, p.hood ? p.mantle ?? p.robe : hair, drop);
      } else if (woman) {
        put('dress', p, p.robe, drop);
        if (p.mantle) put('shawl', p, p.mantle, drop);
        if (!g.seated && r() < 0.45) put('apron', p, jitterColor(r.pick(['#e8e2d4', '#d8d0bc', '#c8c0b0']), r, 0.04), drop);
        if (p.hood) put('bonnet', p, jitterColor(o.bonnet ?? r.pick(BONNETS), r, 0.05), drop);
        else put('hair', p, hair, drop);
        put('collar', p, new THREE.Color('#f2ede2'), drop);
      } else {
        if (g.kneel) put('shins', p, jitterColor(o.trousers ?? r.pick(TROUSERS), r, 0.06), drop);
        if (!g.seated) put('legs', p, jitterColor(o.trousers ?? r.pick(TROUSERS), r, 0.06), drop);
        put('coat', p, p.robe, drop);
        put('shoulders', p, p.robe, drop);
        put('vest', p, jitterColor(o.vest ?? r.pick(VESTS), r, 0.06), drop);
        put('front', p, new THREE.Color('#f4f0e6'), drop);
        put('collar', p, new THREE.Color('#f4f0e6'), drop);
        put(g.arms === 'out' ? 'armsOut' : 'arms', p, p.robe, drop);
        if (g.arms !== 'out' && !g.seated && !g.kneel) put('hands', p, p.skin, drop);
        put('hair', p, hair, drop);
        if (g.hats && p.scale > 0.85 && r() < g.hats) put('hat', p, jitterColor(r.pick(['#1c1b1d', '#2a2622', '#3a3128', '#4a4038']), r, 0.05), drop);
      }
    }
    all.push(...people);
  }
  if (!shapes.armsOut) {
    shapes.armsOut = () => {
      const arm = (s) => new THREE.CylinderGeometry(0.055, 0.065, 0.6, 5).translate(0, -0.3, 0).rotateX(-0.35).rotateZ(s * 0.95).translate(s * 0.2, 1.38, 0.02);
      return shaded(merge(arm(-1), arm(1)));
    };
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), sc = new THREE.Vector3();
  for (const [k, list] of Object.entries(items)) {
    const mesh = new THREE.InstancedMesh(shape(k), material, list.length);
    list.forEach(([p, color, drop], i) => {
      q.setFromAxisAngle(up, p.yaw);
      m.compose(v.set(p.x, p.y - drop * p.scale, p.z), q, sc.setScalar(p.scale));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color);
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  ctx.onFrame((t) => (time.value = t));
  return all;
}

// One hand-placed person in 1830s dress, facing a point. kind: 'man' | 'woman'.
export function person(ctx, { x, z, y, face, kind = 'man', coat, skin = '#e0b48f', hair, trousers, vest, hat = false, seated = false, kneel = false, arms, scale = 1, bonnet }) {
  const palette = { robes: [coat ?? (kind === 'man' ? '#3a3a44' : '#5a4a5e')], mantles: ['#a89c88'], skins: [skin], mantleChance: kind === 'man' ? 0 : 0.8, hoodChance: bonnet ? 1 : 0, women: kind === 'woman' };
  const [p] = crowd(ctx, [{ points: [[x, z]], count: 1, face, exact: true, palette, y, seated, kneel, arms, hats: hat ? 1 : 0, children: 0, outfit: { hair, trousers, vest, bonnet }, scale, seed: Math.round(x * 13 + z * 7) }]);
  ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: p.y, top: p.y + 1.8 });
  return p;
}

// Grid points filling a rectangle, with jitter, for seated rows.
export function rows(rand, { x0, x1, z0, z1, dx = 0.62, dz = 1.0, jitter = 0.06, skip = () => false }) {
  const pts = [];
  for (let z = z0; z <= z1 + 1e-6; z += dz)
    for (let x = x0; x <= x1 + 1e-6; x += dx) {
      if (skip(x, z)) continue;
      pts.push([x + rand.range(-jitter, jitter), z + rand.range(-jitter, jitter)]);
    }
  return pts;
}

export function pine(ctx, x, z, h = 10, color = '#2f4a32') {
  const y = ctx.heightAt(x, z) - 0.2;
  ctx.solid.add(new THREE.CylinderGeometry(0.15, 0.32, h * 0.4, 5), { position: [x, y + h * 0.2, z], color: '#4a3628' });
  for (let i = 0; i < 4; i++) {
    const r = h * (0.3 - i * 0.06), ch = h * 0.34;
    ctx.solid.add(new THREE.ConeGeometry(r, ch, 7), { position: [x, y + h * 0.3 + i * h * 0.17 + ch / 2, z], rotation: [0, ctx.rand() * 3, 0], color, jitter: 0.08 });
  }
  ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: y, top: y + h });
}

export function leafy(ctx, x, z, h = 9, color = '#5f7f3a') {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.2;
  ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.4, h, 6), { position: [x, y + h / 2, z], rotation: [r.range(-0.06, 0.06), 0, r.range(-0.06, 0.06)], color: '#5a4332' });
  ctx.colliders.add({ x, z, w: 0.8, d: 0.8, bottom: y, top: y + h });
  for (let i = 0; i < 4; i++) {
    const rad = h * r.range(0.22, 0.32);
    ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
      position: [x + r.range(-1, 1) * rad * 0.7, y + h * r.range(0.8, 1.05), z + r.range(-1, 1) * rad * 0.7],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, r.range(0.7, 0.9), 1],
      color,
      jitter: 0.1,
    });
  }
}

export function bush(ctx, x, z, s = 1, color = '#4f6b34') {
  ctx.solid.add(new THREE.IcosahedronGeometry(s, 0), { position: [x, ctx.heightAt(x, z) + s * 0.4, z], rotation: [ctx.rand() * 3, ctx.rand() * 3, 0], scale: [1.2, 0.75, 1], color, jitter: 0.1 });
}

// Scatter trees in a ring, skipping clearings.
export function forest(ctx, { center = [0, 0], ring = [20, 200], count = 200, seed = 4, avoid = [], kinds = ['pine', 'leafy'], leaf = ['#5f7f3a', '#4d6e34', '#6f8a40'], pineColor = ['#2f4a32', '#36543a', '#294030'], spacing = 3.5 }) {
  const r = rng(seed);
  const placed = [];
  for (let tries = 0; placed.length < count && tries < count * 30; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r.range(ring[0] ** 2, ring[1] ** 2));
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid.some((v) => (v.r ? Math.hypot(x - v.x, z - v.z) < v.r : Math.abs(x - v.rect[0]) < v.rect[2] / 2 && Math.abs(z - v.rect[1]) < v.rect[3] / 2))) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < spacing)) continue;
    placed.push([x, z]);
    const kind = r.pick(kinds);
    if (kind === 'pine') pine(ctx, x, z, r.range(8, 15), r.pick(pineColor));
    else if (kind === 'bush') bush(ctx, x, z, r.range(0.6, 1.3));
    else leafy(ctx, x, z, r.range(6, 11), r.pick(leaf));
  }
}

// Gable-roofed log cabin. Door faces local +z. Interior is open for walking when `open` is set.
export function logCabin(ctx, { x, z, rot = 0, w = 8, d = 6, h = 2.6, log = '#6b5038', roof = '#4f4236', door = true }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const y = Math.min(ctx.heightAt(x, z), ...[[-w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2], [w / 2, -d / 2]].map(([a, b]) => ctx.heightAt(...at(a, b)))) - 0.1;
  const n = Math.round(h / 0.3);
  for (let i = 0; i < n; i++) {
    const ly = y + 0.15 + i * 0.3;
    for (const [lx, lz, len, along] of [[0, -d / 2, w + 0.5, 'x'], [0, d / 2, w + 0.5, 'x'], [-w / 2, 0, d + 0.5, 'z'], [w / 2, 0, d + 0.5, 'z']]) {
      if (door && lz === d / 2 && along === 'x' && i < 7) {
        for (const side of [-1, 1]) {
          const seg = (w + 0.5) / 2 - 0.6;
          const [px, pz] = at(side * (0.6 + seg / 2), lz);
          ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, seg, 6), { position: [px, ly, pz], rotation: [0, rot, Math.PI / 2], color: log, jitter: 0.06 });
        }
        continue;
      }
      const [px, pz] = at(lx, lz);
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, len, 6), {
        position: [px, ly, pz],
        rotation: along === 'x' ? [0, rot, Math.PI / 2] : [Math.PI / 2, rot, 0],
        color: log,
        jitter: 0.06,
      });
    }
  }
  if (door) {
    const [px, pz] = at(0, d / 2 + 0.02);
    ctx.solid.box(1.1, 2, 0.08, { position: [px, y + 1, pz], rotation: [0, rot, 0], color: '#3a2a1e' });
  }
  const top = y + n * 0.3;
  const pitch = 0.6;
  const half = w / 2 + 0.6;
  const slope = Math.hypot(half, half * Math.tan(pitch) * 0.9);
  for (const side of [-1, 1]) {
    const [px, pz] = at(side * half / 2, 0);
    ctx.solid.box(slope, 0.18, d + 1, { position: [px, top + half * Math.tan(pitch) * 0.45, pz], rotation: [0, rot, -side * Math.atan2(half * Math.tan(pitch) * 0.9, half)], color: roof, shade: darkenBottom });
  }
  for (const side of [-1, 1]) {
    const tri = new THREE.BufferGeometry();
    const lz = side * d / 2;
    const pts = [[-w / 2, 0, lz], [w / 2, 0, lz], [0, half * Math.tan(pitch) * 0.85, lz]];
    tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array(side > 0 ? pts.flat() : [pts[0], pts[2], pts[1]].flat()), 3));
    ctx.solid.add(tri, { position: [x, top, z], rotation: [0, rot, 0], color: log });
  }
  const [cx, cz] = at(-w / 2 + 0.2, 0);
  ctx.solid.box(1, top - y + 2.4, 1.2, { position: [cx, y + (top - y + 2.4) / 2, cz], rotation: [0, rot, 0], color: '#8a7a6a' });
  ctx.colliders.add({ x, z, w: w + 0.4, d: d + 0.4, rot, bottom: y, top: top + 3 });
}

// Two-story clapboard frame house with glowing or dark windows. Front faces local +z.
export function frameHouse(ctx, { x, z, rot = 0, w = 9, d = 7, h = 5.5, color = '#d8d0c0', roof = '#4a4440', trim = '#f0ece2', lit = false }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const y = ctx.heightAt(x, z) - 0.3;
  box(ctx, { x, y, z, w, h, d, rot, color });
  const rh = 2.4;
  const geo = new THREE.BufferGeometry();
  const W = w / 2 + 0.4, D = d / 2 + 0.4;
  const v = [
    [-W, 0, -D], [W, 0, -D], [0, rh, -D], [W, 0, D], [-W, 0, D], [0, rh, D],
  ];
  const faces = [
    [1, 2, 5], [1, 5, 3], [4, 5, 2], [4, 2, 0],
  ];
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(faces.flat().flatMap((i) => v[i])), 3));
  ctx.solid.add(geo, { position: [x, y + h, z], rotation: [0, rot, 0], color: roof });
  const gable = new THREE.BufferGeometry();
  gable.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-w / 2, 0, 0, w / 2, 0, 0, 0, rh - 0.2, 0]), 3));
  for (const side of [-1, 1]) {
    const [px, pz] = at(0, side * d / 2);
    ctx.solid.add(gable, { position: [px, y + h, pz], rotation: [0, rot + (side > 0 ? 0 : Math.PI), 0], color });
  }
  for (const floor of [0, 1]) {
    for (const lx of [-w / 3, 0, w / 3]) {
      for (const side of [-1, 1]) {
        if (floor === 0 && lx === 0 && side > 0) {
          const [px, pz] = at(0, d / 2 + 0.03);
          ctx.solid.box(1, 2.1, 0.08, { position: [px, y + 0.3 + 1.05, pz], rotation: [0, rot, 0], color: '#3c3530' });
          continue;
        }
        const [px, pz] = at(lx, side * (d / 2 + 0.03));
        const wy = y + 0.3 + 1.5 + floor * 2.5;
        ctx.solid.box(1.0, 1.5, 0.06, { position: [px, wy, pz], rotation: [0, rot, 0], color: trim });
        (lit ? ctx.glow : ctx.solid).box(0.8, 1.3, 0.08, { position: [px, wy, pz], rotation: [0, rot, 0], color: lit ? '#ffcf7a' : '#3b4450' });
      }
    }
  }
  const [chx, chz] = at(w / 2 - 0.6, 0);
  ctx.solid.box(0.6, 1.8, 0.6, { position: [chx, y + h + 1.6, chz], rotation: [0, rot, 0], color: '#8a5a44' });
}

export function rail(ctx, pts, { color = '#7a6450', h = 1.1 } = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 3));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const y = ctx.heightAt((x0 + x1) / 2, (z0 + z1) / 2);
      ctx.solid.box(0.14, h, 0.14, { position: [x0, ctx.heightAt(x0, z0) + h / 2, z0], color, jitter: 0.08 });
      for (const ry of [0.4, 0.8]) {
        ctx.solid.box(0.08, 0.1, len / n + 0.2, { position: [(x0 + x1) / 2, y + ry * h, (z0 + z1) / 2], rotation: [0, ang + (ctx.rand() - 0.5) * 0.1, 0], color, jitter: 0.08 });
      }
    }
  }
}

// Additive soft sprite, for glows that should not cast or receive light.
let glowTex;
export function softGlow(ctx, { position, size = 4, color = '#fff2d0', opacity = 0.5 }) {
  if (!glowTex) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(cv);
    glowTex.colorSpace = THREE.SRGBColorSpace;
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, opacity, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sp.position.set(...position);
  sp.scale.set(size, size, 1);
  ctx.scene.add(sp);
  return sp;
}

export function light(ctx, { position, color = '#ffd9a0', intensity = 4, distance = 10, decay = 1.5 }) {
  const l = new THREE.PointLight(color, intensity, distance, decay);
  l.position.set(...position);
  ctx.scene.add(l);
  return l;
}

// Candle with a flickering flame. Returns the flame mesh.
export function candle(ctx, { x, y, z, h = 0.2 }) {
  ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.03, h, 6), { position: [x, y + h / 2, z], color: '#efe6cf', jitter: 0 });
  ctx.glow.add(new THREE.OctahedronGeometry(0.03, 0), { position: [x, y + h + 0.04, z], scale: [1, 1.8, 1], color: '#ffc861', jitter: 0 });
}

// Fireplace with a glowing fire, set into a wall. Opening faces local +z.
export function fireplace(ctx, { x, z, rot = 0, y = 0, color = '#8a6a58', tall = 3 }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const side of [-1, 1]) {
    const [px, pz] = at(side * 0.75, 0);
    box(ctx, { x: px, z: pz, y, w: 0.4, h: 1.2, d: 0.8, rot, color });
  }
  box(ctx, { x, z, y: y + 1.2, w: 1.9, h: tall - 1.2, d: 0.8, rot, color, collide: false });
  box(ctx, { x, z, y: y + 1.15, w: 2.1, h: 0.12, d: 0.95, rot, color: '#4a3424', collide: false });
  const [bx, bz] = at(0, -0.25);
  box(ctx, { x: bx, z: bz, y, w: 1.2, h: 1.2, d: 0.3, rot, color: '#2a201a', collide: false });
  const [fx, fz] = at(0, 0.05);
  for (let i = 0; i < 6; i++) {
    ctx.glow.add(new THREE.OctahedronGeometry(0.12 + ctx.rand() * 0.1, 0), {
      position: [fx + (ctx.rand() - 0.5) * 0.7, y + 0.12 + ctx.rand() * 0.25, fz + (ctx.rand() - 0.5) * 0.3],
      scale: [1, 1.6, 1],
      color: ctx.rand.pick(['#ff8a2a', '#ffb347', '#ff6a1a']),
    });
  }
  for (let i = 0; i < 3; i++) ctx.solid.box(0.9, 0.12, 0.12, { position: [fx, y + 0.08, fz], rotation: [0, rot + i * 0.5 - 0.5, 0], color: '#3a2618' });
  const [lx, lz] = at(0, 0.9);
  const fire = light(ctx, { position: [lx, y + 0.6, lz], color: '#ff9a4a', intensity: 5, distance: 9 });
  ctx.onFrame((t) => (fire.intensity = 5 + Math.sin(t * 9) * 0.6 + Math.sin(t * 23) * 0.4));
}

// Room of stacked logs centered at (x, z), floor at y. Openings: { wall: 'n'|'s'|'e'|'w', at, width, bottom, top, pane }.
export function logRoom(ctx, { x = 0, z = 0, y = 0, w, d, h, log = '#7a5a3e', chink = '#b8a88a', openings = [] }) {
  const n = Math.ceil(h / 0.3);
  const walls = {
    n: { cx: x, cz: z - d / 2, len: w + 0.4, axis: 'x' },
    s: { cx: x, cz: z + d / 2, len: w + 0.4, axis: 'x' },
    w: { cx: x - w / 2, cz: z, len: d + 0.4, axis: 'z' },
    e: { cx: x + w / 2, cz: z, len: d + 0.4, axis: 'z' },
  };
  for (const [name, wall] of Object.entries(walls)) {
    const holes = openings.filter((o) => o.wall === name);
    const place = (a, b, ly) => {
      const len = b - a, mid = (a + b) / 2;
      if (len < 0.05) return;
      const px = wall.axis === 'x' ? wall.cx + mid : wall.cx, pz = wall.axis === 'x' ? wall.cz : wall.cz + mid;
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, len, 6), {
        position: [px, ly, pz],
        rotation: wall.axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0],
        color: log,
        jitter: 0.07,
      });
      ctx.solid.box(wall.axis === "x" ? len : 0.2, 0.3, wall.axis === "x" ? 0.2 : len, { position: [px, ly, pz], color: chink, jitter: 0.03 });
    };
    for (let i = 0; i < n; i++) {
      const ly = y + 0.15 + i * 0.3;
      let cuts = holes.filter((o) => ly > y + o.bottom - 0.05 && ly < y + o.top + 0.05).map((o) => [o.at - o.width / 2, o.at + o.width / 2]).sort((a, b) => a[0] - b[0]);
      let start = -wall.len / 2;
      for (const [a, b] of cuts) {
        place(start, a, ly);
        start = b;
      }
      place(start, wall.len / 2, ly);
    }
    const thick = 0.34;
    const along = (a, b, h0, h1) => {
      const mid = (a + b) / 2, len = b - a;
      const px = wall.axis === 'x' ? wall.cx + mid : wall.cx, pz = wall.axis === 'x' ? wall.cz : wall.cz + mid;
      ctx.solid.box(wall.axis === 'x' ? len : 0.24, h1 - h0, wall.axis === 'x' ? 0.24 : len, { position: [px, y + (h0 + h1) / 2, pz], color: chink, jitter: 0.03 });
    };
    let start = -wall.len / 2;
    const sorted = [...holes].sort((a, b) => a.at - b.at);
    for (const o of sorted) {
      const a = o.at - o.width / 2, b = o.at + o.width / 2;
      const cx = wall.axis === 'x' ? wall.cx : wall.cx, cz = wall.cz;
      if (wall.axis === 'x') ctx.colliders.add({ x: wall.cx + (start + a) / 2, z: cz, w: a - start, d: thick, bottom: y - 1, top: y + h });
      else ctx.colliders.add({ x: cx, z: wall.cz + (start + a) / 2, w: thick, d: a - start, bottom: y - 1, top: y + h });
      if (o.bottom > 0.2) {
        if (wall.axis === 'x') ctx.colliders.add({ x: wall.cx + o.at, z: cz, w: o.width, d: thick, bottom: y - 1, top: y + h });
        else ctx.colliders.add({ x: cx, z: wall.cz + o.at, w: thick, d: o.width, bottom: y - 1, top: y + h });
      }
      for (const [fa, fb, h0, h1] of [[a - 0.08, a, o.bottom, o.top], [b, b + 0.08, o.bottom, o.top]]) along(fa, fb, h0, h1);
      along(a - 0.08, b + 0.08, o.top, o.top + 0.1);
      if (o.bottom > 0.2) along(a - 0.08, b + 0.08, o.bottom - 0.08, o.bottom);
      if (o.pane) {
        const mid = o.at;
        const px = wall.axis === 'x' ? wall.cx + mid : wall.cx, pz = wall.axis === 'x' ? wall.cz : wall.cz + mid;
        ctx.glow.box(wall.axis === 'x' ? o.width : 0.04, o.top - o.bottom, wall.axis === 'x' ? 0.04 : o.width, { position: [px, y + (o.bottom + o.top) / 2, pz], color: o.pane, jitter: 0.02 });
        const mw = wall.axis === 'x';
        ctx.solid.box(mw ? 0.05 : 0.08, o.top - o.bottom, mw ? 0.08 : 0.05, { position: [px, y + (o.bottom + o.top) / 2, pz], color: '#efe8da', jitter: 0 });
        ctx.solid.box(mw ? o.width : 0.08, 0.05, mw ? 0.08 : o.width, { position: [px, y + (o.bottom + o.top) / 2, pz], color: '#efe8da', jitter: 0 });
      }
      start = b;
    }
    if (wall.axis === 'x') ctx.colliders.add({ x: wall.cx + (start + wall.len / 2) / 2, z: wall.cz, w: wall.len / 2 - start, d: thick, bottom: y - 1, top: y + h });
    else ctx.colliders.add({ x: wall.cx, z: wall.cz + (start + wall.len / 2) / 2, w: thick, d: wall.len / 2 - start, bottom: y - 1, top: y + h });
  }
}

export function bench(ctx, { x, z, y = 0, len = 2, rot = 0, color = '#7a5a3c', h = 0.45 }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  ctx.solid.box(len, 0.07, 0.34, { position: [x, y + h, z], rotation: [0, rot, 0], color, jitter: 0.05 });
  for (const side of [-1, 1]) ctx.solid.box(0.06, h, 0.3, { position: [x + side * (len / 2 - 0.15) * c, y + h / 2, z - side * (len / 2 - 0.15) * s], rotation: [0, rot, 0], color, jitter: 0.05 });
}
