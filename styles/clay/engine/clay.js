import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const clayUniforms = {
  uTime: { value: 0 },
  uClayBump: { value: 0.035 },
  uClayRim: { value: 0.22 },
};

const NOISE_GLSL = /* glsl */ `
varying vec3 vClayP;
float clayHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float clayNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(clayHash(i), clayHash(i + vec3(1, 0, 0)), f.x),
                 mix(clayHash(i + vec3(0, 1, 0)), clayHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(clayHash(i + vec3(0, 0, 1)), clayHash(i + vec3(1, 0, 1)), f.x),
                 mix(clayHash(i + vec3(0, 1, 1)), clayHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
`;

// One shader patch shared by every clay surface: thumb-pressed bumps and tint
// variation from object-space noise (so UVs never stretch), plus a soft rim
// that fakes the waxy subsurface glow of plasticine.
function patchClay(shader, opts) {
  shader.uniforms.uTime = clayUniforms.uTime;
  shader.uniforms.uClayBump = clayUniforms.uClayBump;
  shader.uniforms.uClayRim = clayUniforms.uClayRim;

  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>
      varying vec3 vClayP;
      uniform float uTime;
      ${opts.sway ? 'attribute float aPhase;' : ''}`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      vClayP = position;
      #ifdef USE_INSTANCING
        vClayP += instanceMatrix[3].xyz * 0.73;
      #endif
      vClayP += modelMatrix[3].xyz * 0.73;
      ${opts.sway ? `
        float swayT = uTime + aPhase;
        transformed.x += sin(swayT * 1.3) * 0.03 * transformed.y;
        transformed.z += sin(swayT * 0.9 + 1.7) * 0.02 * transformed.y;
        transformed.y += max(0.0, sin(swayT * 2.1)) * 0.015 * step(0.3, transformed.y);` : ''}`);

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>
      uniform float uClayBump;
      uniform float uClayRim;
      ${NOISE_GLSL}`)
    .replace('#include <color_fragment>', `#include <color_fragment>
      float clayTint = clayNoise(vClayP * 0.55) * 0.6 + clayNoise(vClayP * 2.3) * 0.4;
      diffuseColor.rgb *= 0.9 + 0.2 * clayTint;`)
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      {
        vec3 cp = vClayP * ${opts.scale.toFixed(2)};
        float h = clayNoise(cp * 2.2) * 0.55 + clayNoise(cp * 6.5) * 0.3 + clayNoise(cp * 17.0) * 0.15;
        float fade = 1.0 - smoothstep(8.0, 40.0, length(vViewPosition));
        vec2 dh = vec2(dFdx(h), dFdy(h)) * uClayBump * fade * ${opts.bump.toFixed(2)};
        vec3 sx = dFdx(-vViewPosition);
        vec3 sy = dFdy(-vViewPosition);
        vec3 r1 = cross(sy, normal);
        vec3 r2 = cross(normal, sx);
        float det = dot(sx, r1);
        vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
        normal = normalize(abs(det) * normal - grad);
      }`)
    .replace('#include <opaque_fragment>', `
      float rim = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.5);
      outgoingLight += diffuseColor.rgb * rim * uClayRim;
      #include <opaque_fragment>`);
}

const materialCache = new Map();

export function clayMaterial(color = '#ffffff', opts = {}) {
  const o = { sway: false, bump: 1, scale: 1, emissive: null, emissiveIntensity: 0, roughness: 0.82, vertexColors: false, ...opts };
  const key = JSON.stringify([color, o]);
  if (materialCache.has(key)) return materialCache.get(key);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: o.roughness,
    metalness: 0,
    vertexColors: o.vertexColors,
  });
  if (o.emissive) {
    mat.emissive = new THREE.Color(o.emissive);
    mat.emissiveIntensity = o.emissiveIntensity;
  }
  mat.onBeforeCompile = (shader) => patchClay(shader, o);
  mat.customProgramCacheKey = () => `clay-${o.sway}-${o.bump}-${o.scale}`;
  materialCache.set(key, mat);
  return mat;
}

export function roundedBox(w, h, d, radius = 0.12, segments = 3) {
  const r = Math.min(radius, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  return new RoundedBoxGeometry(w, h, d, segments, Math.max(r, 0.001));
}

export function capsule(radius, length, capSeg = 4, radial = 12) {
  return new THREE.CapsuleGeometry(radius, length, capSeg, radial);
}

export function blob(radius, detail = 2) {
  return new THREE.IcosahedronGeometry(radius, detail);
}

export function merge(geoms) {
  const clean = geoms.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const name of Object.keys(n.attributes)) {
      if (!['position', 'normal', 'uv', 'color'].includes(name)) n.deleteAttribute(name);
    }
    if (!n.attributes.uv) n.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((n.attributes.position.count) * 2), 2));
    return n;
  });
  return mergeGeometries(clean, false);
}

export function placed(geom, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = {}) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz),
  );
  return geom.clone().applyMatrix4(m);
}

// Peg-doll pawn parts, all built in pawn-local space (feet at origin, ~1.7 tall)
// so a single instance matrix positions every part of one person.
export function pawnParts(detail = 1) {
  const radial = detail > 1 ? 16 : 10;
  const robeProfile = [
    [0.0, 0.0], [0.3, 0.0], [0.34, 0.05], [0.33, 0.25], [0.29, 0.6], [0.25, 0.95], [0.23, 1.15], [0.17, 1.28], [0.0, 1.32],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const robe = new THREE.LatheGeometry(robeProfile, radial);
  const shawl = new THREE.SphereGeometry(0.3, radial, 6);
  shawl.scale(1, 0.42, 0.92);
  shawl.translate(0, 1.13, 0);
  const head = new THREE.SphereGeometry(0.2, radial, 8);
  head.translate(0, 1.47, 0);
  const cap = new THREE.SphereGeometry(0.215, radial, 5, 0, Math.PI * 2, 0, Math.PI * 0.55);
  cap.rotateX(-0.45);
  cap.translate(0, 1.485, 0.0);
  return { robe, shawl, head, cap };
}

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function glowTexture(inner = 'rgba(255,250,230,1)', outer = 'rgba(255,220,150,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.55)'));
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
