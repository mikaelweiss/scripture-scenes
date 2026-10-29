import * as THREE from 'three';

// Layer 0: solid geometry that gets ink outlines. Layer 1: sky, light and glow effects (no outlines).
export const FX_LAYER = 1;

const postVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const postFragment = /* glsl */ `
#include <packing>
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform vec2 texel;
uniform float cameraNear;
uniform float cameraFar;
uniform float thickness;
uniform vec3 ink;
uniform vec4 lineFade;
uniform float depthSensitivity;
uniform float normalSensitivity;
uniform float grain;
uniform int debugMode;

float invDepth(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  return -1.0 / perspectiveDepthToViewZ(d, cameraNear, cameraFar);
}
vec3 normalAt(vec2 uv) { return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec4 base = texture2D(tColor, vUv);
  float wobble = 0.75 + 0.6 * vnoise(vUv * vec2(90.0, 50.0));
  vec2 o = texel * thickness * wobble;

  float wc = invDepth(vUv);
  float wl = invDepth(vUv - vec2(o.x, 0.0));
  float wr = invDepth(vUv + vec2(o.x, 0.0));
  float wd = invDepth(vUv - vec2(0.0, o.y));
  float wu = invDepth(vUv + vec2(0.0, o.y));
  // 1/z is linear across a plane in screen space, so its Laplacian only fires at silhouettes and creases.
  float lap = abs(wl + wr + wu + wd - 4.0 * wc) / max(wc, 1e-6);
  float depthEdge = smoothstep(depthSensitivity, depthSensitivity * 2.5, lap);

  vec3 nc = normalAt(vUv);
  float nd = max(
    max(1.0 - dot(nc, normalAt(vUv - vec2(o.x, 0.0))), 1.0 - dot(nc, normalAt(vUv + vec2(o.x, 0.0)))),
    max(1.0 - dot(nc, normalAt(vUv - vec2(0.0, o.y))), 1.0 - dot(nc, normalAt(vUv + vec2(0.0, o.y)))));
  float normalEdge = smoothstep(normalSensitivity, normalSensitivity * 1.6, nd);

  float dist = 1.0 / max(max(max(wc, wl), max(wr, wu)), wd);
  float edge = max(depthEdge, normalEdge);
  edge *= mix(1.0, lineFade.w, smoothstep(lineFade.x, lineFade.y, dist));
  vec3 lineColor = mix(ink, base.rgb * 0.38, smoothstep(lineFade.x, lineFade.z, dist));
  vec3 col = mix(base.rgb, lineColor, edge);

  float paper = (hash(floor(vUv / texel * 0.5)) - 0.5) * grain;
  col *= 1.0 + paper;
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.35;
  gl_FragColor = vec4(col, 1.0);
  if (debugMode == 1) gl_FragColor = vec4(vec3(1.0 - edge), 1.0);
  if (debugMode == 2) gl_FragColor = vec4(texture2D(tNormal, vUv).xyz, 1.0);
  if (debugMode == 3) gl_FragColor = vec4(vec3(fract(1.0 / wc / 20.0)), 1.0);
  #include <colorspace_fragment>
}`;

export class ToonRenderer {
  constructor(container, style) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.shadowMap.autoUpdate = false;
    container.appendChild(r.domElement);

    this.colorRT = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.FloatType),
    });
    this.normalRT = new THREE.WebGLRenderTarget(1, 1);
    this.normalMaterial = new THREE.MeshNormalMaterial();
    this.normalClear = new THREE.Color().setRGB(0.5, 0.5, 1, THREE.LinearSRGBColorSpace);

    const line = style.lines;
    this.post = new THREE.ShaderMaterial({
      vertexShader: postVertex,
      fragmentShader: postFragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tColor: { value: this.colorRT.texture },
        tDepth: { value: this.colorRT.depthTexture },
        tNormal: { value: this.normalRT.texture },
        texel: { value: new THREE.Vector2() },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 1000 },
        thickness: { value: line.width },
        ink: { value: new THREE.Color(style.ink) },
        lineFade: { value: new THREE.Vector4(...line.fade) },
        depthSensitivity: { value: line.depth },
        normalSensitivity: { value: line.normal },
        grain: { value: style.grain },
        debugMode: { value: parseInt(new URLSearchParams(location.search).get('debug') ?? '0', 10) },
      },
    });
    this.postScene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post);
    quad.frustumCulled = false;
    this.postScene.add(quad);
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.lineWidth = line.width;
    this.resize();
  }

  get domElement() {
    return this.renderer.domElement;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const pr = this.renderer.getPixelRatio();
    this.renderer.setSize(w, h);
    const pw = Math.floor(w * pr), ph = Math.floor(h * pr);
    this.colorRT.setSize(pw, ph);
    this.normalRT.setSize(pw, ph);
    this.post.uniforms.texel.value.set(1 / pw, 1 / ph);
    this.post.uniforms.thickness.value = this.lineWidth * Math.max(1, pr * 0.75);
  }

  render(scene, camera) {
    const r = this.renderer;
    this.post.uniforms.cameraNear.value = camera.near;
    this.post.uniforms.cameraFar.value = camera.far;

    camera.layers.enable(FX_LAYER);
    r.shadowMap.needsUpdate = true;
    r.setRenderTarget(this.colorRT);
    r.render(scene, camera);

    camera.layers.disable(FX_LAYER);
    const clear = r.getClearColor(new THREE.Color());
    const fog = scene.fog;
    scene.fog = null;
    scene.overrideMaterial = this.normalMaterial;
    r.setClearColor(this.normalClear, 1);
    r.setRenderTarget(this.normalRT);
    r.render(scene, camera);
    scene.overrideMaterial = null;
    scene.fog = fog;
    r.setClearColor(clear, 1);
    camera.layers.enable(FX_LAYER);

    r.setRenderTarget(null);
    r.render(this.postScene, this.postCamera);
  }
}
