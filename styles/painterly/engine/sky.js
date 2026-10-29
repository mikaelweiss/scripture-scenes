import * as THREE from 'three';

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return s;
  }
`;
export { NOISE };

export function buildSky(sky) {
  const sunDir = new THREE.Vector3(...sky.sunDir).normalize();
  const uniforms = {
    zenith: { value: new THREE.Color(sky.zenith) },
    horizon: { value: new THREE.Color(sky.horizon) },
    cloudDark: { value: new THREE.Color(sky.cloudDark) },
    cloudLit: { value: new THREE.Color(sky.cloudLit) },
    gold: { value: new THREE.Color(sky.gold) },
    sunDir: { value: sunDir },
    clearing: { value: sky.clearing },
    time: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 zenith, horizon, cloudDark, cloudLit, gold, sunDir;
      uniform float clearing, time;
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        float sun = max(dot(d, sunDir), 0.0);
        vec3 col = mix(horizon, zenith, pow(clamp(h, 0.0, 1.0), 0.5));
        col = mix(col, gold, pow(sun, 6.0) * 0.6);

        vec2 uv = d.xz / (h + 0.25);
        vec2 suv = sunDir.xz / (sunDir.y + 0.25);
        vec2 warp = vec2(fbm(uv * 0.5 + 3.0), fbm(uv * 0.5 + 9.0)) - 0.5;
        vec2 p = uv * 1.1 + warp * 1.4 + vec2(time * 0.005, 0.0);
        float n = fbm(p);
        float toward = fbm(p + normalize(suv - uv + 1e-4) * 0.1);
        float gap = smoothstep(0.8, 0.97, sun + (fbm(uv * 0.8 + 21.0) - 0.5) * 0.5) * clearing;
        float cover = smoothstep(0.42, 0.56, n + 0.12 - gap * 0.55);
        float thick = smoothstep(0.42, 0.72, n);
        float litEdge = clamp((n - toward) * 8.0, 0.0, 1.0);
        vec3 cloud = mix(cloudLit, cloudDark, thick);
        cloud += gold * litEdge * (0.25 + pow(sun, 3.0) * 1.2);
        cloud = mix(cloud, cloudDark * 0.75, smoothstep(0.25, 0.9, h) * (1.0 - gap) * 0.6);
        float above = smoothstep(-0.02, 0.1, h);
        col = mix(col, cloud, cover * above);
        col += gold * cover * (1.0 - cover) * 4.0 * pow(sun, 4.0) * 1.2 * above;
        col += gold * pow(sun, 400.0) * 2.0 * (1.0 - cover);
        col = mix(col, horizon * 0.9, smoothstep(0.0, -0.15, h));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return { mesh, uniforms, sunDir };
}

export function buildLights(light, sunDir, focus) {
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight(light.skyColor, light.groundColor, light.ambient));
  const sun = new THREE.DirectionalLight(light.sunColor, light.sun);
  const target = new THREE.Vector3(focus[0], 0, focus[1]);
  const dir = light.dir ? new THREE.Vector3(...light.dir).normalize() : sunDir;
  sun.position.copy(target).addScaledVector(dir, 200);
  sun.target.position.copy(target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const r = light.shadowRadius;
  Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 20, far: 420 });
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.04;
  group.add(sun, sun.target);
  return group;
}
