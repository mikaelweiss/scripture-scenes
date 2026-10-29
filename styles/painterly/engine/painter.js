import * as THREE from 'three';
import { NOISE } from './sky.js';

const VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const DEPTH = /* glsl */ `
  #include <packing>
  uniform sampler2D tDepth;
  uniform float cameraNear, cameraFar;
  float viewZ(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cameraNear, cameraFar); }
`;

// Pass 1: tone map, then a generalized Kuwahara filter. Each pixel takes the calmest of four
// rotated sample quadrants, which flattens shading into strokes. Strokes grow near the camera.
const KUWAHARA = /* glsl */ `
  uniform sampler2D tColor;
  uniform vec2 resolution;
  uniform float exposure, brush;
  varying vec2 vUv;
  ${DEPTH}
  ${NOISE}
  vec3 tone(vec3 c) {
    c *= exposure;
    c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
    return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
  }
  void main() {
    vec2 texel = 1.0 / resolution;
    float z = viewZ(vUv);
    float s = brush * mix(2.4, 1.0, smoothstep(3.0, 140.0, z));
    float a = vnoise(vUv * vec2(6.0, 4.0)) * 6.2831;
    vec2 ex = vec2(cos(a), sin(a)) * s * texel;
    vec2 ey = vec2(-sin(a), cos(a)) * s * texel;
    vec3 m0 = vec3(0), m1 = vec3(0), m2 = vec3(0), m3 = vec3(0);
    vec3 v0 = vec3(0), v1 = vec3(0), v2 = vec3(0), v3 = vec3(0);
    for (int j = 0; j < 4; j++) {
      for (int i = 0; i < 4; i++) {
        vec2 ox = float(i) * ex, oy = float(j) * ey;
        vec3 c;
        c = tone(texture2D(tColor, vUv + ox + oy).rgb); m0 += c; v0 += c * c;
        c = tone(texture2D(tColor, vUv - ox + oy).rgb); m1 += c; v1 += c * c;
        c = tone(texture2D(tColor, vUv - ox - oy).rgb); m2 += c; v2 += c * c;
        c = tone(texture2D(tColor, vUv + ox - oy).rgb); m3 += c; v3 += c * c;
      }
    }
    m0 /= 16.0; m1 /= 16.0; m2 /= 16.0; m3 /= 16.0;
    vec3 d0 = abs(v0 / 16.0 - m0 * m0), d1 = abs(v1 / 16.0 - m1 * m1);
    vec3 d2 = abs(v2 / 16.0 - m2 * m2), d3 = abs(v3 / 16.0 - m3 * m3);
    float w0 = 1.0 / pow(1e-3 + d0.r + d0.g + d0.b, 3.0);
    float w1 = 1.0 / pow(1e-3 + d1.r + d1.g + d1.b, 3.0);
    float w2 = 1.0 / pow(1e-3 + d2.r + d2.g + d2.b, 3.0);
    float w3 = 1.0 / pow(1e-3 + d3.r + d3.g + d3.b, 3.0);
    gl_FragColor = vec4((m0 * w0 + m1 * w1 + m2 * w2 + m3 * w3) / (w0 + w1 + w2 + w3), 1.0);
  }
`;

// Pass 2: watercolor. Hand-drawn wobble, pigment bleeding, edge darkening where washes meet,
// turbulent pigment density, granulation, a broken sepia contour, and cold-press paper.
const WATERCOLOR = /* glsl */ `
  uniform sampler2D tPaint;
  uniform vec2 resolution;
  uniform vec3 paper, ink, shade;
  uniform float wobble, bleed, edge, grain, line, paperTint;
  varying vec2 vUv;
  ${DEPTH}
  ${NOISE}
  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
  float logZ(vec2 uv) { return log(viewZ(uv) + 1.0); }
  void main() {
    vec2 texel = 1.0 / resolution;
    vec2 px = vUv * resolution;
    vec2 w = vec2(fbm(vUv * vec2(7.0, 4.5)), fbm(vUv * vec2(7.0, 4.5) + 19.3)) - 0.5;
    vec2 uv = vUv + w * wobble * texel + (vec2(vnoise(px * 0.3), vnoise(px * 0.3 + 7.1)) - 0.5) * 2.0 * texel;

    vec3 c = texture2D(tPaint, uv).rgb;
    vec3 b = vec3(0);
    for (int i = 0; i < 6; i++) {
      float a = float(i) * 1.0472 + w.x * 9.0;
      b += texture2D(tPaint, uv + vec2(cos(a), sin(a)) * bleed * texel).rgb;
    }
    b /= 6.0;
    vec3 col = mix(c, b, 0.45);

    float zx = logZ(uv + vec2(1.5, 0) * texel) - logZ(uv - vec2(1.5, 0) * texel);
    float zy = logZ(uv + vec2(0, 1.5) * texel) - logZ(uv - vec2(0, 1.5) * texel);
    float dz = length(vec2(zx, zy));
    float lumEdge = smoothstep(0.02, 0.12, abs(lum(c) - lum(b)));
    float depthEdge = smoothstep(0.05, 0.25, dz);
    float broken = 0.45 + 0.55 * vnoise(px * 0.04);
    float e = max(depthEdge, lumEdge * 0.5) * broken;

    float turb = fbm(vUv * vec2(16.0, 10.0) + 3.0) - 0.5;
    float density = 1.0 + turb * 0.5 + e * edge * 0.7;
    col = col - (col - col * col) * (density - 1.0);

    float g = vnoise(px * 0.55) * 0.6 + vnoise(px * 0.17) * 0.4;
    col *= 1.0 - (g - 0.5) * grain * (1.2 - lum(col));

    float stroke = smoothstep(0.15, 0.45, dz) * step(0.38, vnoise(px * 0.06 + 40.0));
    col = mix(col, ink, stroke * line);

    col = mix(col, col * paper, paperTint);
    float fiber = fbm(px * 0.22) * 0.6 + vnoise(px * vec2(0.8, 0.11)) * 0.4;
    col *= 0.9 + 0.14 * fiber;
    col = mix(col, paper, smoothstep(0.82, 1.0, lum(col)) * 0.35);

    vec2 q = vUv - 0.5;
    float vig = smoothstep(0.95, 0.25, length(q * vec2(1.25, 1.0)) + (fbm(vUv * 5.0) - 0.5) * 0.25);
    col *= mix(shade, vec3(1.0), vig);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export class Painter {
  constructor(renderer, opts = {}) {
    this.renderer = renderer;
    this.o = {
      exposure: 1.0, brush: 1.0, wobble: 7, bleed: 2.5, edge: 1.0, grain: 0.18, line: 0.35, paperTint: 0.25,
      paper: '#f4ead6', ink: '#3d2b1f', shade: '#b39a7c', ...opts,
    };
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    this.sceneRT = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType });
    this.sceneRT.depthTexture = new THREE.DepthTexture(size.x, size.y);
    this.paintRT = new THREE.WebGLRenderTarget(size.x, size.y);
    const common = {
      resolution: { value: size.clone() },
      tDepth: { value: this.sceneRT.depthTexture },
      cameraNear: { value: 0.1 },
      cameraFar: { value: 1000 },
    };
    this.kuwahara = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: KUWAHARA,
      uniforms: { ...common, tColor: { value: this.sceneRT.texture }, exposure: { value: this.o.exposure }, brush: { value: this.o.brush } },
    });
    this.watercolor = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: WATERCOLOR,
      uniforms: {
        ...common,
        tPaint: { value: this.paintRT.texture },
        paper: { value: new THREE.Color(this.o.paper) },
        ink: { value: new THREE.Color(this.o.ink) },
        shade: { value: new THREE.Color(this.o.shade) },
        ...Object.fromEntries(['wobble', 'bleed', 'edge', 'grain', 'line', 'paperTint'].map((k) => [k, { value: this.o[k] }])),
      },
    });
    for (const m of [this.kuwahara, this.watercolor]) {
      m.depthTest = m.depthWrite = false;
    }
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.kuwahara);
    this.quad.frustumCulled = false;
    this.quadScene = new THREE.Scene();
    this.quadScene.add(this.quad);
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  setSize() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.sceneRT.setSize(size.x, size.y);
    this.paintRT.setSize(size.x, size.y);
    this.kuwahara.uniforms.resolution.value.copy(size);
  }

  render(scene, camera) {
    const r = this.renderer;
    for (const m of [this.kuwahara, this.watercolor]) {
      m.uniforms.cameraNear.value = camera.near;
      m.uniforms.cameraFar.value = camera.far;
    }
    r.setRenderTarget(this.sceneRT);
    r.render(scene, camera);
    this.quad.material = this.kuwahara;
    r.setRenderTarget(this.paintRT);
    r.render(this.quadScene, this.quadCamera);
    this.quad.material = this.watercolor;
    r.setRenderTarget(null);
    r.render(this.quadScene, this.quadCamera);
  }
}
