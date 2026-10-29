import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, fbm } from './util.js';

export function createSky(spec, sunDir) {
  const group = new THREE.Group();
  const { top, horizon, ground, sunColor, glow = 1 } = spec;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(top) },
        uHorizon: { value: new THREE.Color(horizon) },
        uGround: { value: new THREE.Color(ground) },
        uSun: { value: new THREE.Color(sunColor) },
        uSunDir: { value: sunDir.clone() },
        uGlow: { value: glow },
      },
      vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
      fragmentShader: `
        uniform vec3 uTop, uHorizon, uGround, uSun, uSunDir; uniform float uGlow;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.38));
          col = mix(col, uGround, smoothstep(0.0, -0.08, h));
          float s = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSun * (pow(s, 900.0) * 6.0 + pow(s, 80.0) * 0.8 + pow(s, 10.0) * 0.2) * uGlow;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  group.add(dome);
  return group;
}

function hazeMesh(parts, faceColor) {
  const geo = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)));
  geo.computeVertexNormals();
  const pos = geo.attributes.position, nrm = geo.attributes.normal;
  const col = new Float32Array(pos.count * 3);
  const n = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    n.set(nrm.getX(i), nrm.getY(i), nrm.getZ(i));
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.x += pos.getX(i + k) / 3, c.y += pos.getY(i + k) / 3, c.z += pos.getZ(i + k) / 3;
    const out = faceColor(n, c);
    for (let k = 0; k < 3; k++) col.set([out.r, out.g, out.b], (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
}

// Faceted storm clouds lit from the sun side, thinning where the sun breaks through.
export function createClouds(spec, sunDir, horizon) {
  const { count = 70, seed = 4, shadow = '#3d3a4a', lit = '#ffcf8f', rim = '#fff0c8', distance = [260, 900], altitude = [90, 260], hole = 0.35 } = spec;
  const rand = rng(seed);
  const sunFlat = new THREE.Vector2(sunDir.x, sunDir.z).normalize();
  const parts = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const dist = rand.range(distance[0], distance[1]);
    const dir = new THREE.Vector2(Math.cos(a), Math.sin(a));
    const toward = dir.dot(sunFlat);
    if (toward > 1 - hole && rand() < 0.75) continue;
    const cx = dir.x * dist, cz = dir.y * dist, cy = rand.range(altitude[0], altitude[1]);
    const size = rand.range(40, 90);
    const puffs = 6 + Math.floor(rand() * 6);
    for (let p = 0; p < puffs; p++) {
      const g = mergeVertices(new THREE.IcosahedronGeometry(1, 1).deleteAttribute('normal').deleteAttribute('uv'));
      const pv = g.attributes.position;
      for (let v = 0; v < pv.count; v++) {
        const k = 1 + rand.range(-0.15, 0.15);
        pv.setXYZ(v, pv.getX(v) * k, pv.getY(v) * k, pv.getZ(v) * k);
      }
      const r = size * rand.range(0.35, 0.7);
      g.scale(r * 1.7, r * 0.34, r * 1.2);
      g.rotateY(rand() * Math.PI);
      g.translate(cx + rand.range(-size, size) * 0.9, cy + rand.range(-0.08, 0.12) * size, cz + rand.range(-size, size) * 0.6);
      parts.push(g);
    }
  }
  const cShadow = new THREE.Color(shadow), cLit = new THREE.Color(lit), cRim = new THREE.Color(rim), cHaze = new THREE.Color(horizon);
  const sun = sunDir.clone().normalize();
  const mesh = hazeMesh(parts, (n, c) => {
    const facing = Math.max(0, n.dot(sun));
    const nearSun = Math.max(0, c.clone().normalize().dot(sun));
    const out = cShadow.clone().lerp(cLit, facing * 0.35 + Math.pow(nearSun, 6) * 0.5 + Math.max(0, n.y) * 0.1);
    out.lerp(cRim, Math.pow(nearSun, 18) * 0.8 * (0.4 + facing));
    if (n.y < -0.3) out.multiplyScalar(0.8);
    return out.lerp(cHaze, Math.min(0.55, Math.max(0, (c.length() - 300) / 1200) + Math.max(0, 0.2 - c.y / 1000)));
  });
  mesh.renderOrder = -5;
  return mesh;
}

// Ring of hazy faceted mountains on the horizon.
export function createMountains(spec, sunDir, horizon) {
  const { count = 40, seed = 6, color = '#5d5a52', radius = [480, 720], height = [40, 140], haze = 0.55 } = spec;
  const rand = rng(seed);
  const parts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand.range(-0.05, 0.05);
    const r = rand.range(radius[0], radius[1]);
    const h = rand.range(height[0], height[1]) * (0.6 + fbm(Math.cos(a) * 3, Math.sin(a) * 3, seed, 2));
    const g = mergeVertices(new THREE.ConeGeometry(rand.range(1.1, 1.8) * h, h, 6 + Math.floor(rand() * 3), 3).deleteAttribute('normal').deleteAttribute('uv'));
    const pv = g.attributes.position;
    for (let v = 0; v < pv.count; v++) {
      const y = pv.getY(v);
      if (y < h / 2 - 0.1) pv.setXYZ(v, pv.getX(v) * rand.range(0.85, 1.15), y + rand.range(-0.08, 0.08) * h, pv.getZ(v) * rand.range(0.85, 1.15));
    }
    g.translate(Math.cos(a) * r, h / 2 - 8, Math.sin(a) * r);
    parts.push(g);
  }
  const base = new THREE.Color(color), cHaze = new THREE.Color(horizon), sun = sunDir.clone().normalize();
  const mesh = hazeMesh(parts, (n, c) => {
    const light = 0.55 + 0.6 * Math.max(0, n.dot(sun));
    const out = base.clone().multiplyScalar(light);
    const far = (c.length() - radius[0]) / (radius[1] - radius[0]);
    return out.lerp(cHaze, Math.min(0.9, haze + far * 0.25 + Math.max(0, 0.2 - c.y / 300)));
  });
  mesh.renderOrder = -4;
  return mesh;
}
