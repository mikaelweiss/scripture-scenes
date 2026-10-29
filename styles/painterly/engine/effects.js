import * as THREE from 'three';
import { NOISE } from './sky.js';
import { radialTexture } from './people.js';

const time = { value: 0 };
export const effectTime = time;

// A soft shaft of light between two points, brightest along its core.
export function beam(b) {
  const from = new THREE.Vector3(...b.from), to = new THREE.Vector3(...b.to);
  const dir = to.clone().sub(from);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(b.radius[0], b.radius[1], len, 32, 1, true);
  geo.translate(0, -len / 2, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { time, color: { value: new THREE.Color(b.color) }, opacity: { value: b.opacity } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vFacing;
      void main() {
        vUv = uv;
        vec3 n = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFacing = abs(dot(n, normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float opacity, time;
      varying vec2 vUv; varying float vFacing;
      ${NOISE}
      void main() {
        float core = pow(vFacing, 2.5);
        float streak = 0.6 + 0.4 * vnoise(vec2(vUv.x * 24.0, vUv.y * 2.0 - time * 0.3));
        float fade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
        gl_FragColor = vec4(color * core * streak * fade * opacity, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(from);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
  mesh.frustumCulled = false;
  return mesh;
}

// A circle of gentle flame-like light on the ground, with a glow pooled inside it.
export function lightRing(ctx, r) {
  const at = new THREE.Vector3(r.center[0], ctx.heightAt(r.center[0], r.center[1]), r.center[1]);
  const group = new THREE.Group();
  group.position.copy(at);
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(r.radius, r.radius * 1.04, r.height, 64, 1, true),
    new THREE.ShaderMaterial({
      uniforms: { time, color: { value: new THREE.Color(r.color) }, opacity: { value: r.opacity } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 color; uniform float opacity, time;
        varying vec2 vUv;
        ${NOISE}
        void main() {
          float f = fbm(vec2(vUv.x * 40.0, vUv.y * 2.5 - time * 0.9));
          float flame = smoothstep(vUv.y * 1.1, vUv.y * 1.1 + 0.35, f);
          gl_FragColor = vec4(color * flame * opacity * (1.0 - vUv.y), 1.0);
        }`,
    }),
  );
  wall.position.y = r.height / 2;
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(r.radius * 1.5, 64),
    new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(r.color) }, opacity: { value: r.opacity }, radius: { value: r.radius } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `varying vec2 vPos; void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 color; uniform float opacity, radius;
        varying vec2 vPos;
        void main() {
          float d = length(vPos) / radius;
          float band = exp(-pow((d - 1.0) / 0.12, 2.0));
          float inner = 0.12 * smoothstep(1.1, 0.0, d);
          gl_FragColor = vec4(color * (band * 0.6 + inner) * opacity, 1.0);
        }`,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.15;
  group.add(wall, pool);
  return group;
}

// Rising smoke columns plus glowing embers for each smoldering spot.
export function smolder(ctx, spots, style) {
  const perSpot = style.particles;
  const n = spots.length * perSpot;
  const base = new Float32Array(n * 3), seed = new Float32Array(n * 4);
  const embers = [];
  spots.forEach((s, k) => {
    const y = ctx.heightAt(s.pos[0], s.pos[1]);
    for (let i = 0; i < perSpot; i++) {
      const j = k * perSpot + i;
      base.set([s.pos[0] + (ctx.rand() - 0.5) * s.radius, y, s.pos[1] + (ctx.rand() - 0.5) * s.radius], j * 3);
      seed.set([ctx.rand(), ctx.rand(), ctx.rand(), s.height ?? style.height], j * 4);
    }
    for (let i = 0; i < 6; i++) {
      const a = ctx.rand() * 6.28, r = ctx.rand() * s.radius * 0.5;
      embers.push(s.pos[0] + Math.cos(a) * r, y + 0.15, s.pos[1] + Math.sin(a) * r);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(base, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 4));
  const smoke = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { time, color: { value: new THREE.Color(style.color) }, size: { value: style.size }, wind: { value: new THREE.Vector2(...style.wind) } },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute vec4 seed;
      uniform float time, size; uniform vec2 wind;
      varying float vAlpha; varying float vSeed;
      void main() {
        float t = fract(time * (0.035 + seed.y * 0.03) + seed.x);
        vec3 p = position + vec3(wind.x * t * t, t * seed.w, wind.y * t * t);
        p.x += sin(t * 6.0 + seed.z * 6.28) * t * 1.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = size * (0.4 + t * 2.2) * (720.0 / -mv.z);
        vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - t);
        vSeed = seed.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      varying float vAlpha; varying float vSeed;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float a = smoothstep(0.5, 0.1, d) * vAlpha * 0.75;
        gl_FragColor = vec4(color * (0.85 + vSeed * 0.3), a);
      }`,
  }));
  smoke.frustumCulled = false;
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.Float32BufferAttribute(embers, 3));
  const emberPts = new THREE.Points(emberGeo, new THREE.PointsMaterial({
    color: style.ember, size: 1.6, map: radialTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  const group = new THREE.Group();
  group.add(smoke, emberPts);
  return group;
}
