import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const tiltShift = (dir) => ({
  uniforms: {
    tDiffuse: { value: null },
    uDir: { value: new THREE.Vector2(...dir) },
    uTexel: { value: new THREE.Vector2(1 / 1280, 1 / 720) },
    uFocus: { value: 0.45 },
    uBand: { value: 0.17 },
    uMax: { value: 1.6 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 uDir, uTexel; uniform float uFocus, uBand, uMax;
    varying vec2 vUv;
    void main(){
      float d = vUv.y > uFocus ? (vUv.y - uFocus) * 0.75 : uFocus - vUv.y;
      float amt = smoothstep(uBand, uBand + 0.32, d) * uMax;
      vec2 o = uDir * uTexel * amt;
      vec4 c = vec4(0.0);
      float wsum = 0.0;
      for (int i = -6; i <= 6; i++) {
        float w = exp(-float(i * i) / 18.0);
        c += texture2D(tDiffuse, vUv + o * float(i)) * w;
        wsum += w;
      }
      gl_FragColor = c / wsum;
    }`,
});

const grade = {
  uniforms: { tDiffuse: { value: null }, uSat: { value: 1.12 }, uVignette: { value: 0.35 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uSat, uVignette; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      c.rgb = mix(vec3(l), c.rgb, uSat);
      vec2 q = vUv - 0.5;
      c.rgb *= 1.0 - uVignette * dot(q, q) * 1.6;
      gl_FragColor = c;
    }`,
};

// Miniature-set look: ground-contact AO, then a tilt-shift blur whose sharp band
// follows the player, so the whole set reads like a tabletop diorama.
export class Post {
  constructor(renderer, scene, camera, hideFromAO) {
    this.renderer = renderer;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(renderer, target);
    this.composer.addPass(new RenderPass(scene, camera));

    this.ao = new GTAOPass(scene, camera, size.x, size.y);
    this.ao.updateGtaoMaterial({ radius: 0.9, distanceExponent: 1.4, thickness: 1.5, scale: 1.3, samples: 12, distanceFallOff: 1 });
    this.ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    this.ao.blendIntensity = 0.9;
    const override = this.ao.overrideVisibility.bind(this.ao);
    this.ao.overrideVisibility = () => {
      override();
      for (const o of hideFromAO) o.visible = false;
    };
    const aoSize = this.ao.setSize.bind(this.ao);
    this.ao.setSize = (w, h) => aoSize(Math.ceil(w / 2), Math.ceil(h / 2));
    this.ao.setSize(size.x, size.y);
    this.composer.addPass(this.ao);

    this.tiltH = new ShaderPass(tiltShift([1, 0]));
    this.tiltV = new ShaderPass(tiltShift([0, 1]));
    this.tiltH2 = new ShaderPass(tiltShift([1, 0]));
    this.tiltV2 = new ShaderPass(tiltShift([0, 1]));
    this.tilts = [this.tiltH, this.tiltV, this.tiltH2, this.tiltV2];
    for (const p of this.tilts) this.composer.addPass(p);
    this.composer.addPass(new ShaderPass(grade));
    this.composer.addPass(new OutputPass());
  }

  setSize(w, h) {
    this.composer.setSize(w, h);
    for (const p of this.tilts) p.uniforms.uTexel.value.set(1 / w, 1 / h);
  }

  setFocus(y) {
    for (const p of this.tilts) p.uniforms.uFocus.value = y;
  }

  render(dt) { this.composer.render(dt); }
}
