import * as THREE from 'three';
import { between, makeNoise, makeRng } from './util.js';

export function makeTerrain(spec, seed) {
  const { fbm } = makeNoise(seed);
  const { size, segments, flatRadius, hillHeight, undulation } = spec;
  const field = (x, z) => {
    const r = Math.hypot(x, z);
    const hills = THREE.MathUtils.smoothstep(r, flatRadius, flatRadius * 3.2);
    return (fbm(x / 40, z / 40) - 0.5) * 2 * undulation + hills * hillHeight * (0.35 + fbm(x / 160 + 9, z / 160 - 4, 5));
  };

  const n = segments + 1;
  const step = size / segments;
  const heights = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) heights[j * n + i] = field(-size / 2 + i * step, -size / 2 + j * step);

  // Matches the triangulation below exactly, so feet sit on the drawn surface.
  const heightAt = (x, z) => {
    const gx = THREE.MathUtils.clamp((x + size / 2) / step, 0, segments - 1e-4);
    const gz = THREE.MathUtils.clamp((z + size / 2) / step, 0, segments - 1e-4);
    const i = Math.floor(gx), j = Math.floor(gz);
    const fx = gx - i, fz = gz - j;
    const h00 = heights[j * n + i], h10 = heights[j * n + i + 1];
    const h01 = heights[(j + 1) * n + i], h11 = heights[(j + 1) * n + i + 1];
    return fx > fz ? h00 + fx * (h10 - h00) + fz * (h11 - h10) : h00 + fz * (h01 - h00) + fx * (h11 - h01);
  };

  const pos = new Float32Array(n * n * 3);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      pos[k * 3] = -size / 2 + i * step;
      pos[k * 3 + 1] = heights[k];
      pos[k * 3 + 2] = -size / 2 + j * step;
    }
  }
  const index = [];
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * n + i, b = a + 1, d = a + n, c = d + 1;
      index.push(a, c, b, a, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return { geometry, heightAt };
}

const groundChunk = /* glsl */ `
uniform vec3 gSand, gDirt, gGrass, gGrassDark, gPlaza, gPlazaLine, gScorch, gScorchEdge, gHill;
uniform vec4 gPlazaRect;
uniform vec4 gScorchSpots[16];
uniform int gScorchCount;
varying vec3 vGroundPos;
float gHash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float gNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(gHash(i), gHash(i + vec2(1, 0)), u.x), mix(gHash(i + vec2(0, 1)), gHash(i + vec2(1, 1)), u.x), u.y);
}
float gFbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * gNoise(p); p *= 2.03; a *= 0.5; } return s / 0.9375; }
vec3 groundColor(vec3 wp) {
  vec2 p = wp.xz;
  vec3 c = gSand;
  float big = gFbm(p * 0.018 + 3.0);
  float detail = gFbm(p * 0.11);
  c = mix(c, gDirt, step(0.56, big + 0.12 * detail));
  float grass = gFbm(p * 0.03 - 7.0) + 0.1 * detail;
  c = mix(c, gGrass, step(0.6, grass));
  vec2 cell = floor(p * 0.9);
  vec2 jitter = vec2(gHash(cell), gHash(cell + 17.0));
  vec2 d = fract(p * 0.9) - jitter * 0.7 - 0.15;
  float tuft = step(length(d * vec2(1.0, 3.0)), 0.07) * step(0.55, gHash(cell + 3.0));
  c = mix(c, step(0.6, grass) > 0.5 ? gGrassDark : gDirt * 0.85, tuft);
  vec2 q = abs(p - gPlazaRect.xy) - gPlazaRect.zw;
  float inPlaza = step(max(q.x, q.y), 0.0);
  vec2 tile = abs(fract(p / 2.5) - 0.5);
  float line = step(0.46, max(tile.x, tile.y)) * step(0.35, gNoise(p * 0.7));
  vec3 plaza = mix(gPlaza, gPlazaLine, line);
  plaza = mix(plaza, gDirt, step(0.62, detail) * 0.7);
  c = mix(c, plaza, inPlaza);
  for (int i = 0; i < 16; i++) {
    if (i >= gScorchCount) break;
    vec4 s = gScorchSpots[i];
    float r = length(p - s.xy) / (s.z * (0.75 + 0.5 * gNoise(p * 0.35 + float(i) * 7.0)));
    c = mix(c, gScorchEdge, step(r, 1.0));
    c = mix(c, gScorch, step(r, 0.7));
  }
  c = mix(c, gHill, smoothstep(4.0, 14.0, wp.y));
  return c;
}
`;

export function terrainMaterial(spec, smolder, kit) {
  const mat = kit.toon('#ffffff', { unique: true });
  const colors = spec.colors;
  const spots = Array.from({ length: 16 }, (_, i) => {
    const s = smolder[i];
    return s ? new THREE.Vector4(s.pos[0], s.pos[1], s.scorch ?? s.radius * 2.2, 0) : new THREE.Vector4();
  });
  const uniforms = {
    gSand: { value: new THREE.Color(colors.sand) },
    gDirt: { value: new THREE.Color(colors.dirt) },
    gGrass: { value: new THREE.Color(colors.grass) },
    gGrassDark: { value: new THREE.Color(colors.grassDark) },
    gPlaza: { value: new THREE.Color(colors.plaza) },
    gPlazaLine: { value: new THREE.Color(colors.plazaLine) },
    gScorch: { value: new THREE.Color(colors.scorch) },
    gScorchEdge: { value: new THREE.Color(colors.scorchEdge) },
    gHill: { value: new THREE.Color(colors.hill) },
    gPlazaRect: { value: spec.plaza ? new THREE.Vector4(spec.plaza.center[0], spec.plaza.center[1], spec.plaza.size[0] / 2, spec.plaza.size[1] / 2) : new THREE.Vector4(0, 0, -1, -1) },
    gScorchSpots: { value: spots },
    gScorchCount: { value: Math.min(smolder.length, 16) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGroundPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGroundPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + groundChunk)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( groundColor(vGroundPos), opacity );');
  };
  return mat;
}

export function buildMountains(spec, ctx) {
  const rng = makeRng(spec.seed ?? 21);
  const geo = new THREE.ConeGeometry(1, 1, 9, 3);
  geo.translate(0, 0.5, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > 0.01 && y < 0.99) {
      pos.setX(i, pos.getX(i) * (0.85 + rng() * 0.3));
      pos.setZ(i, pos.getZ(i) * (0.85 + rng() * 0.3));
    }
  }
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), spec.count);
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  for (let i = 0; i < spec.count; i++) {
    const a = (i / spec.count) * Math.PI * 2 + rng() * 0.2;
    const d = between(rng, spec.distance);
    const h = between(rng, spec.height);
    const w = h * between(rng, spec.widthRatio);
    m.compose(
      new THREE.Vector3(Math.sin(a) * d, -2, Math.cos(a) * d),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 6, 0)),
      new THREE.Vector3(w, h, w * between(rng, [0.7, 1.1])),
    );
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.set(spec.colors[Math.floor(rng() * spec.colors.length)]));
  }
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
}
