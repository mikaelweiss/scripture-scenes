import * as THREE from 'three';
import { fbm2, noise2, smoothstep, rng, range } from './noise.js';

export function makeHeightField(t) {
  const [cx, cz] = t.flat.center;
  const mounds = t.mounds ?? [];
  return (x, z) => {
    const d = Math.hypot(x - cx, z - cz);
    const rise = smoothstep(t.flat.radius, t.flat.radius + t.flat.blend, d);
    let h = rise * (fbm2(x * 0.008, z * 0.008, 4, 3) * t.hills + t.bowl * smoothstep(t.flat.radius, t.flat.radius + 250, d));
    h += fbm2(x * 0.08, z * 0.08, 2, 9) * t.roughness;
    for (const m of mounds) {
      const k = 1 - smoothstep(0, m.radius, Math.hypot(x - m.pos[0], z - m.pos[1]));
      h += m.height * k * k * (3 - 2 * k);
    }
    return h;
  };
}

export function buildTerrain(t, heightAt, scorches) {
  const geo = new THREE.PlaneGeometry(t.size, t.size, t.segments, t.segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const grass = new THREE.Color(t.colors.grass);
  const dry = new THREE.Color(t.colors.dry);
  const dirt = new THREE.Color(t.colors.dirt);
  const plaza = new THREE.Color(t.colors.plaza);
  const burnt = new THREE.Color(t.colors.burnt);
  const c = new THREE.Color();
  const [px, pz] = t.plaza.center;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
    c.copy(grass).lerp(dry, smoothstep(0.35, 0.65, fbm2(x * 0.02, z * 0.02, 3, 21)));
    c.lerp(dirt, smoothstep(0.55, 0.75, fbm2(x * 0.05, z * 0.05, 3, 33)) * 0.8);
    const plazaEdge = t.plaza.radius + (noise2(x * 0.08, z * 0.08, 5) - 0.5) * 14;
    c.lerp(plaza, 1 - smoothstep(plazaEdge - 6, plazaEdge, Math.hypot(x - px, z - pz)));
    for (const s of scorches) {
      const k = 1 - smoothstep(s.radius * 0.3, s.radius * (1.2 + noise2(x * 0.3, z * 0.3, 7) * 0.6), Math.hypot(x - s.pos[0], z - s.pos[1]));
      c.lerp(burnt, k * 0.9);
    }
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.receiveShadow = true;
  return mesh;
}

export function buildMountains(m) {
  const rand = rng(m.seed ?? 5);
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: m.color, flatShading: true });
  for (let i = 0; i < m.count; i++) {
    const a = (i / m.count) * Math.PI * 2 + rand() * 0.3;
    const r = range(rand, m.radius);
    const h = range(rand, m.height);
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const p = geo.attributes.position;
    for (let j = 0; j < p.count; j++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, j);
      const n = 0.75 + noise2(v.x * 2.5 + i, v.z * 2.5, 11) * 0.5;
      p.setXYZ(j, v.x * n, Math.max(v.y, -0.2) * n, v.z * n);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(a) * r, -h * 0.15, Math.sin(a) * r);
    mesh.scale.set(h * range(rand, [1.3, 2.0]), h, h * range(rand, [1.2, 1.8]));
    mesh.rotation.y = rand() * 6;
    group.add(mesh);
  }
  return group;
}
