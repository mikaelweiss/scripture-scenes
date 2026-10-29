import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { VoxelWorld } from './voxels.js';
import { build } from './builders.js';
import { placeCrowd, ringOf, createPeople } from './people.js';
import * as fx from './effects.js';
import { Player } from './player.js';

const resolveY = (world, o) => ({ ...o, y: o.y ?? world.heightAt(o.x, o.z) + (o.lift ?? 0) });

export function run(scene, container = document.body) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = scene.light.exposure ?? 1;
  container.appendChild(renderer.domElement);

  const root = new THREE.Scene();
  root.fog = new THREE.Fog(scene.fog.color, scene.fog.near, scene.fog.far);
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1500);

  const world = new VoxelWorld(scene.world, scene.palette);
  const ctx = { emitters: [] };
  build(world, scene.build, ctx);
  root.add(world.mesh({
    lit: new THREE.MeshLambertMaterial({ vertexColors: true }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
  }));

  const sunDir = new THREE.Vector3(...scene.light.sunDir).normalize();
  root.add(fx.createSky(scene.sky, sunDir));
  root.add(new THREE.HemisphereLight(scene.light.sky, scene.light.ground, scene.light.ambient));
  const sun = new THREE.DirectionalLight(scene.light.sun, scene.light.sunIntensity);
  sun.position.copy(sunDir).multiplyScalar(world.half * 1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -world.half, right: world.half, top: world.half, bottom: -world.half, near: 1, far: world.half * 4 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  root.add(sun, sun.target);

  for (const l of scene.lights ?? []) {
    const p = new THREE.PointLight(l.color, l.intensity, l.distance, l.decay ?? 1.5);
    const r = resolveY(world, l);
    p.position.set(r.x, r.y, r.z);
    root.add(p);
  }

  const everyone = [];
  for (const group of scene.people) {
    const list = group.ring ? ringOf(world, group) : placeCrowd(world, group);
    everyone.push(...list);
    root.add(createPeople(list, { lit: group.glow }));
  }

  const animated = [];
  const add = (obj) => { root.add(obj); if (obj.userData.update) animated.push(obj); };
  for (const e of scene.effects) {
    if (e.type === 'clouds') add(fx.createClouds(e));
    else if (e.type === 'beam') add(fx.createBeam(resolveY(world, e)));
    else if (e.type === 'motes') add(fx.createMotes(resolveY(world, e)));
    else if (e.type === 'halo') add(fx.createHalo(resolveY(world, e)));
    else if (e.type === 'lightRing') add(fx.createLightRing(resolveY(world, e)));
    else if (e.type === 'smoke') add(fx.createSmoke(ctx.emitters, e));
  }

  const player = new Player(camera, renderer.domElement, world, scene.player);
  player.setObstacles(everyone.map((p) => ({ x: p.x, y: p.y, z: p.z, r: 0.28 * p.scale })));

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(root, camera));
  const b = scene.bloom ?? {};
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), b.strength ?? 0.6, b.radius ?? 0.5, b.threshold ?? 1));
  composer.addPass(new OutputPass());

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    player.update(dt);
    for (const o of animated) o.userData.update(dt, t, camera);
    composer.render();
  });
  return { world, renderer, root, camera, player };
}
