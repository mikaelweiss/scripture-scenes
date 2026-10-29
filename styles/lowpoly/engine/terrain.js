import * as THREE from 'three';
import { fbm, rng, smoothstep, jitterColor } from './util.js';

// Terrain spec: { size, segments, seed, hills, hillScale, bumps, flats: [{x,z,r,falloff,height}], colors, patches }
export function createTerrain(spec) {
  const { size = 900, segments = 180, seed = 7, hills = 14, hillScale = 0.006, bumps = 0.35, flats = [], patches = [] } = spec;
  const colors = spec.colors;
  const rand = rng(seed);

  function heightAt(x, z) {
    const dist = Math.hypot(x, z);
    let h = (fbm(x * hillScale, z * hillScale, seed) - 0.45) * hills * (0.35 + smoothstep(60, 320, dist));
    h += (fbm(x * 0.08, z * 0.08, seed + 9, 2) - 0.5) * bumps * 2;
    for (const f of flats) {
      const m = smoothstep(f.r, f.r + (f.falloff ?? 20), Math.hypot(x - f.x, z - f.z));
      h = (f.height ?? 0) * (1 - m) + h * m;
    }
    return h;
  }

  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const step = size / segments;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), z = pos.getZ(i);
    if (Math.abs(x) < size / 2 - 1 && Math.abs(z) < size / 2 - 1) {
      x += (rand() - 0.5) * step * 0.6;
      z += (rand() - 0.5) * step * 0.6;
    }
    pos.setXYZ(i, x, heightAt(x, z), z);
  }
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  const fp = flat.attributes.position, fn = flat.attributes.normal;
  const col = new Float32Array(fp.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < fp.count; i += 3) {
    const x = (fp.getX(i) + fp.getX(i + 1) + fp.getX(i + 2)) / 3;
    const z = (fp.getZ(i) + fp.getZ(i + 1) + fp.getZ(i + 2)) / 3;
    const y = (fp.getY(i) + fp.getY(i + 1) + fp.getY(i + 2)) / 3;
    const slope = 1 - fn.getY(i);
    const n = fbm(x * 0.02, z * 0.02, seed + 3, 3);
    c.set(colors.ground).lerp(new THREE.Color(colors.groundAlt ?? colors.ground), smoothstep(0.35, 0.65, n));
    c.lerp(new THREE.Color(colors.grass), smoothstep(0.5, 0.75, fbm(x * 0.012, z * 0.012, seed + 5, 3)) * smoothstep(70, 160, Math.hypot(x, z)));
    if (colors.high) c.lerp(new THREE.Color(colors.high), smoothstep(6, 22, y));
    c.lerp(new THREE.Color(colors.rock), smoothstep(0.08, 0.3, slope));
    for (const p of patches) {
      const d = Math.hypot(x - p.x, z - p.z) + (fbm(x * 0.15, z * 0.15, seed + 11, 2) - 0.5) * (p.rough ?? 0) * p.r;
      c.lerp(new THREE.Color(p.color), (1 - smoothstep(p.r * 0.75, p.r, d)) * (p.strength ?? 1));
    }
    const j = jitterColor(c, rand, 0.035);
    for (let k = 0; k < 3; k++) col.set([j.r, j.g, j.b], (i + k) * 3);
  }
  flat.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(flat, new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.receiveShadow = true;
  return { mesh, heightAt };
}
