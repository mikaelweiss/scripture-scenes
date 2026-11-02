import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, polarScatter, insideAny } from './util.js';
import { Batch, Colliders } from './world.js';
import { createTerrain } from './terrain.js';
import { builders } from './builders.js';
import { placeCrowd, createCrowd, createFigure } from './crowd.js';
import { createEffects } from './effects.js';
import { createSky, createClouds, createMountains } from './sky.js';
import { createWalker } from './controls.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uSaturation: { value: 1.1 },
    uContrast: { value: 1.08 },
    uShadowTint: { value: new THREE.Color('#2a2440') },
    uHighlightTint: { value: new THREE.Color('#ffe2b8') },
    uVignette: { value: 0.35 },
    uTime: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uSaturation, uContrast, uVignette, uTime;
    uniform vec3 uShadowTint, uHighlightTint;
    varying vec2 vUv;
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, uSaturation);
      c = (c - 0.5) * uContrast + 0.5;
      c = mix(c, c * uHighlightTint * 1.08, smoothstep(0.45, 1.0, l) * 0.5);
      c = mix(c, c + uShadowTint * 0.35, (1.0 - smoothstep(0.0, 0.45, l)) * 0.6);
      float v = distance(vUv, vec2(0.5)) * 1.25;
      c *= 1.0 - uVignette * v * v;
      c += (fract(sin(dot(vUv * 1000.0 + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export function createWorld(spec, container = document.body) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = spec.exposure ?? 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(spec.fov ?? 62, innerWidth / innerHeight, 0.1, 2500);
  const sunDir = new THREE.Vector3(...spec.sun.direction).normalize();
  scene.fog = new THREE.Fog(spec.fog.color, spec.fog.near, spec.fog.far);
  scene.background = new THREE.Color(spec.fog.color);

  const sky = createSky(spec.sky, sunDir);
  scene.add(sky);
  if (spec.clouds) scene.add(createClouds(spec.clouds, sunDir, spec.sky.horizon));
  if (spec.mountains) scene.add(createMountains(spec.mountains, sunDir, spec.sky.horizon));

  scene.add(new THREE.HemisphereLight(spec.light.sky, spec.light.ground, spec.light.hemi));
  const sun = new THREE.DirectionalLight(spec.sun.color, spec.sun.intensity);
  const shadow = spec.shadow ?? { center: [0, 0], radius: 80 };
  sun.target.position.set(shadow.center[0], 0, shadow.center[1]);
  sun.position.copy(sun.target.position).addScaledVector(sunDir, 300);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -shadow.radius, right: shadow.radius, top: shadow.radius, bottom: -shadow.radius, near: 50, far: 600 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const { mesh: ground, heightAt } = createTerrain(spec.terrain);
  scene.add(ground);

  const rand = rng(spec.seed ?? 1);
  const time = { value: 0 };
  const effects = createEffects(scene);
  const colliders = new Colliders();
  const frameFns = [];
  const ctx = { THREE, scene, solid: new Batch(rand), glow: new Batch(rand), heightAt, colliders, rand, effects, builders, onFrame: (fn) => frameFns.push(fn) };

  for (const obj of spec.objects ?? []) builders[obj.type](ctx, obj);
  for (const sc of spec.scatter ?? []) {
    const r = rng(sc.seed ?? 3);
    const placed = [];
    for (let tries = 0; placed.length < sc.count && tries < sc.count * 50; tries++) {
      const [x, z] = sc.points?.[placed.length] ?? polarScatter(r, sc);
      if (!sc.points && (insideAny(x, z, sc.avoid) || placed.some((p) => Math.hypot(p[0] - x, p[1] - z) < (sc.spacing ?? 0)))) continue;
      placed.push([x, z]);
      builders[sc.type](ctx, { ...sc.props, x, z });
    }
  }

  spec.custom?.(ctx);

  const solid = ctx.solid.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
  if (solid) {
    solid.castShadow = solid.receiveShadow = true;
    scene.add(solid);
  }
  const glow = ctx.glow.build(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
  if (glow) scene.add(glow);

  const standAt = (x, z) => colliders.ground(x, z, 1000, heightAt(x, z), { radius: 0 });
  let people = [];
  if (spec.crowd) {
    people = placeCrowd(spec.crowd.groups.map((g) => ({ palette: spec.crowd.palette, ...g })), heightAt, standAt);
    scene.add(createCrowd(people, time));
  }

  for (const f of spec.figures ?? []) {
    const y = f.y ?? standAt(f.x, f.z);
    scene.add(createFigure({ ...f, y }));
    colliders.add({ x: f.x, z: f.z, w: 0.7, d: 0.7, bottom: y, top: y + 1.8 * (f.scale ?? 1) });
    if (f.light) {
      const light = new THREE.PointLight(f.light.color, f.light.intensity, f.light.distance ?? 30, 1.4);
      light.position.set(f.x, y + 2.2, f.z + 0.6);
      scene.add(light);
    }
    if (f.halo) effects.halo({ position: [f.x, y + 1.3 * (f.scale ?? 1), f.z], ...f.halo });
  }

  for (const fx of spec.effects ?? []) {
    const position = fx.at ? [fx.at[0], standAt(fx.at[0], fx.at[1]) + (fx.lift ?? 0), fx.at[1]] : fx.position;
    effects[fx.type]({ ...fx, position, sunDir: fx.sunDir ?? spec.sun.direction });
  }

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = spec.bloom ?? {};
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), bloom.strength ?? 0.6, bloom.radius ?? 0.5, bloom.threshold ?? 0.85));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  const g = spec.grade ?? {};
  if (g.saturation !== undefined) grade.uniforms.uSaturation.value = g.saturation;
  if (g.contrast !== undefined) grade.uniforms.uContrast.value = g.contrast;
  if (g.vignette !== undefined) grade.uniforms.uVignette.value = g.vignette;
  if (g.shadowTint) grade.uniforms.uShadowTint.value.set(g.shadowTint);
  if (g.highlightTint) grade.uniforms.uHighlightTint.value.set(g.highlightTint);
  composer.addPass(grade);

  const walker = createWalker(camera, renderer.domElement, {
    ...spec.player,
    ground: (x, z, feet) => colliders.ground(x, z, feet, heightAt(x, z)),
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    time.value = t;
    grade.uniforms.uTime.value = t % 10;
    walker.update(dt);
    effects.update(t, dt);
    for (const fn of frameFns) fn(t, dt, camera);
    sky.position.copy(camera.position);
    composer.render();
  });

  return { scene, camera, renderer, walker, heightAt, people };
}
