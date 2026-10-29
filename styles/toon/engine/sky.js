import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX_LAYER } from './renderer.js';
import { between, makeRng } from './util.js';
import { glowTexture, gradientMap } from './textures.js';

const col = (c) => new THREE.Color(c);

export function buildSky(spec, ctx) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      zenith: { value: col(spec.zenith) },
      mid: { value: col(spec.mid) },
      horizon: { value: col(spec.horizon) },
      ground: { value: col(spec.ground) },
      glowColor: { value: col(spec.glowColor) },
      glowDir: { value: new THREE.Vector3(...spec.glowDir).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform vec3 zenith, mid, horizon, ground, glowColor, glowDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.14, h));
        c = mix(c, zenith, smoothstep(0.14, 0.6, h));
        float g = max(dot(d, glowDir), 0.0);
        float halo = floor(pow(g, 5.0) * 5.0) / 5.0;
        c = mix(c, glowColor, halo * 0.75);
        c = mix(c, ground, smoothstep(0.0, -0.06, h));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), mat);
  dome.layers.set(FX_LAYER);
  dome.renderOrder = -1000;
  dome.frustumCulled = false;
  ctx.scene.add(dome);
  ctx.onFrame((t, dt, camera) => dome.position.copy(camera.position));
}

function cloudGeometry(rng, puffs) {
  const parts = [];
  const n = puffs[0] + Math.floor(rng() * (puffs[1] - puffs[0]));
  for (let i = 0; i < n; i++) {
    const r = 0.45 + rng() * 0.55 * (1 - Math.abs(i / n - 0.5));
    const g = new THREE.SphereGeometry(r, 14, 10);
    g.translate((i / (n - 1) - 0.5) * 2.6 + (rng() - 0.5) * 0.3, r * 0.35 + rng() * 0.25, (rng() - 0.5) * 0.7);
    parts.push(g);
  }
  const top = new THREE.SphereGeometry(0.7, 14, 10);
  top.translate((rng() - 0.5) * 0.6, 0.75, 0);
  parts.push(top);
  const merged = mergeGeometries(parts);
  const pos = merged.attributes.position;
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < 0) pos.setY(i, pos.getY(i) * 0.25);
  merged.computeVertexNormals();
  return merged;
}

export function buildClouds(spec, ctx) {
  const rng = makeRng(spec.seed ?? 7);
  const variants = Array.from({ length: 6 }, () => cloudGeometry(rng, spec.puffs ?? [4, 8]));
  const grad = gradientMap([0.55, 1.0]);
  for (const layer of spec.layers) {
    const mat = new THREE.MeshToonMaterial({
      color: layer.color,
      emissive: layer.shade,
      gradientMap: grad,
      fog: false,
    });
    const buckets = variants.map(() => []);
    for (let i = 0; i < layer.count; i++) {
      const a = between(rng, layer.angle ?? [0, Math.PI * 2]);
      const wrapped = Math.atan2(Math.sin(a), Math.cos(a));
      if (layer.gap && wrapped > layer.gap[0] && wrapped < layer.gap[1]) continue;
      const dist = between(rng, layer.distance);
      const [cx, cz] = layer.center ?? [0, 0];
      const pos = new THREE.Vector3(cx + Math.sin(a) * dist, between(rng, layer.height), cz - Math.cos(a) * dist);
      const s = between(rng, layer.size);
      const m = new THREE.Matrix4().compose(
        pos,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a + (rng() - 0.5) * 0.6, 0)),
        new THREE.Vector3(s, s * between(rng, [0.55, 0.85]), s * between(rng, [0.6, 0.9])),
      );
      buckets[Math.floor(rng() * variants.length)].push(m);
    }
    const group = new THREE.Group();
    buckets.forEach((mats, k) => {
      if (!mats.length) return;
      const mesh = new THREE.InstancedMesh(variants[k], mat, mats.length);
      mats.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.frustumCulled = false;
      group.add(mesh);
    });
    ctx.scene.add(group);
    const drift = layer.drift ?? 0.002;
    ctx.onFrame((t) => (group.rotation.y = t * drift));
  }
}

const rayVertex = /* glsl */ `
  uniform vec3 uStart, uEnd;
  uniform vec2 uWidth;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 axis = uEnd - uStart;
    vec3 p = mix(uEnd, uStart, uv.y);
    vec3 toCam = normalize(cameraPosition - p);
    vec3 side = normalize(cross(axis, toCam));
    p += side * (uv.x - 0.5) * mix(uWidth.y, uWidth.x, uv.y);
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }`;

// Hard-edged stripes with wobbly edges read as drawn rather than rendered light.
const stripeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity, uSeed, uTime, uStripes, uFadeLow;
  varying vec2 vUv;
  void main() {
    float y = vUv.y;
    float x = vUv.x + sin(y * 9.0 + uSeed * 3.0) * 0.025 + sin(y * 23.0 + uSeed) * 0.01;
    float s = 0.5 + 0.5 * sin(x * uStripes + uSeed * 5.0 + uTime * 0.35) * sin(x * uStripes * 0.43 + uSeed * 11.0 - uTime * 0.2);
    float band = 0.3 + step(0.5, s) * 0.7;
    float edge = smoothstep(0.0, 0.03, x) * smoothstep(1.0, 0.97, x);
    float len = smoothstep(0.0, uFadeLow, y) * (0.55 + 0.45 * y);
    float a = band * edge * len * uIntensity;
    gl_FragColor = vec4(uColor, a);
  }`;

function fxMaterial(vertexShader, fragmentShader, uniforms) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
}

function rayMesh(start, end, width, opts, ctx) {
  const uniforms = {
    uStart: { value: new THREE.Vector3(...start) },
    uEnd: { value: new THREE.Vector3(...end) },
    uWidth: { value: new THREE.Vector2(...width) },
    uColor: { value: col(opts.color) },
    uIntensity: { value: opts.intensity ?? 0.3 },
    uSeed: { value: opts.seed ?? 0 },
    uTime: { value: 0 },
    uStripes: { value: opts.stripes ?? 20 },
    uFadeLow: { value: opts.fadeLow ?? 0.45 },
  };
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fxMaterial(rayVertex, stripeFragment, uniforms));
  mesh.frustumCulled = false;
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (uniforms.uTime.value = t));
  return mesh;
}

export function buildLight(spec, ctx) {
  const rng = makeRng(spec.seed ?? 5);
  const place = (p) => (Array.isArray(p) ? p : p.pos ?? [p.at[0], ctx.groundHeight(p.at[0], p.at[1]) + (p.lift ?? 0), p.at[1]]);
  for (const fan of spec.rayFans ?? []) {
    for (let i = 0; i < fan.count; i++) {
      const a = (i / fan.count) * Math.PI * 2 + rng() * 0.5;
      const d = between(rng, fan.spread);
      const end = [fan.target[0] + Math.sin(a) * d, fan.groundY ?? 0, fan.target[1] + Math.cos(a) * d];
      const start = [fan.source[0] + (rng() - 0.5) * fan.sourceJitter, fan.source[1], fan.source[2] + (rng() - 0.5) * fan.sourceJitter];
      rayMesh(start, end, [between(rng, fan.width[0]), between(rng, fan.width[1])], { ...fan, seed: rng() * 10 }, ctx);
    }
  }
  for (const beam of spec.beams ?? []) {
    for (let k = 0; k < (beam.layers ?? 2); k++) {
      const f = 1 - k * 0.3;
      rayMesh(place(beam.from), place(beam.to), [beam.width[0] * f, beam.width[1] * f], { ...beam, seed: k * 3.7 + 1 }, ctx);
    }
  }
  for (const ring of spec.rings ?? []) buildRing({ ...ring, pos: place(ring) }, ctx);
  const tex = glowTexture();
  for (const glow of spec.glows ?? []) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, color: glow.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: glow.opacity ?? 0.8, fog: false,
    }));
    s.position.set(...place(glow));
    s.scale.setScalar(glow.size);
    s.layers.set(FX_LAYER);
    ctx.scene.add(s);
    const base = glow.size;
    ctx.onFrame((t) => s.scale.setScalar(base * (1 + Math.sin(t * 1.3) * 0.04)));
  }
  for (const p of spec.pointLights ?? []) {
    const light = new THREE.PointLight(p.color, p.intensity, p.distance, p.decay ?? 1.5);
    light.position.set(...place(p));
    ctx.scene.add(light);
  }
}

function buildRing(ring, ctx) {
  const [x, y, z] = ring.pos;
  const uniforms = {
    uColor: { value: col(ring.color) },
    uIntensity: { value: ring.intensity ?? 0.6 },
    uTime: { value: 0 },
    uInner: { value: ring.radius - ring.width },
    uOuter: { value: ring.radius + ring.width },
  };
  const floor = new THREE.Mesh(
    new THREE.RingGeometry(ring.radius - ring.width, ring.radius + ring.width, 96, 1),
    fxMaterial(
      /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      /* glsl */ `
        uniform vec3 uColor; uniform float uIntensity, uTime, uInner, uOuter;
        varying vec2 vP;
        void main() {
          float r = (length(vP) - uInner) / (uOuter - uInner);
          float a = 1.0 - abs(r - 0.5) * 2.0;
          a = step(0.15, a) * 0.45 + step(0.6, a) * 0.55;
          float flicker = 0.8 + 0.2 * sin(atan(vP.y, vP.x) * 12.0 + uTime * 2.0);
          gl_FragColor = vec4(uColor, a * flicker * uIntensity);
        }`,
      uniforms,
    ),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(x, y + 0.05, z);
  floor.layers.set(FX_LAYER);
  ctx.scene.add(floor);

  const wallUniforms = {
    uColor: { value: col(ring.color) },
    uIntensity: { value: ring.wallIntensity ?? 0.45 },
    uSeed: { value: 2 },
    uTime: { value: 0 },
    uStripes: { value: 90 },
    uFadeLow: { value: 0.0001 },
  };
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(ring.radius, ring.radius, ring.height, 96, 1, true),
    fxMaterial(
      /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      stripeFragment.replace('float len = smoothstep(0.0, uFadeLow, y) * (0.55 + 0.45 * y);', 'float len = pow(1.0 - y, 1.6); edge = 1.0;'),
      wallUniforms,
    ),
  );
  wall.position.set(x, y + ring.height / 2, z);
  wall.layers.set(FX_LAYER);
  ctx.scene.add(wall);
  ctx.onFrame((t) => {
    uniforms.uTime.value = t;
    wallUniforms.uTime.value = t;
  });
}
