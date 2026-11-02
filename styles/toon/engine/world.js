import * as THREE from 'three';
import { ToonRenderer } from './renderer.js';
import { MaterialKit } from './materials.js';
import { buildMountains, makeTerrain, terrainMaterial } from './terrain.js';
import { buildClouds, buildLight, buildSky } from './sky.js';
import { buildBlocks, buildCracks, buildSmolder, builders } from './structures.js';
import { buildCrowd, buildFigures, makeFigure } from './people.js';
import { ThirdPersonControls } from './controls.js';
import { mountHud } from './hud.js';
import { inZone, segmentDistance } from './util.js';

export function createWorld(data, container) {
  const style = data.style;
  const view = new ToonRenderer(container, style);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(style.fog.color, style.fog.near, style.fog.far);
  const kit = new MaterialKit(style);
  const terrain = makeTerrain(data.ground, data.seed);

  const colliders = [];
  const zones = [];
  const blocks = [];
  const frameFns = [];
  const aisles = data.crowd?.aisles ?? [];

  const supportHeight = (x, z, maxTop = Infinity) => {
    let h = terrain.heightAt(x, z);
    for (const c of colliders) {
      if (c.top > h && c.top <= maxTop && inZone({ kind: 'rect', ...c }, x, z)) h = c.top;
    }
    return h;
  };

  const ctx = {
    THREE,
    scene,
    builders,
    kit,
    style,
    colliders,
    terrainHeight: terrain.heightAt,
    groundHeight: (x, z) => supportHeight(x, z),
    supportHeight,
    addCollider: (c) => colliders.push(c),
    exclude: (zone) => zones.push(zone),
    blocked: (x, z, margin = 0) =>
      zones.some((zone) => inZone(zone, x, z, margin)) ||
      colliders.some((c) => !c.walkable && inZone({ kind: 'rect', ...c }, x, z, margin)),
    inAisle: (x, z, margin = 0) => aisles.some((a) => segmentDistance(x, z, a.from, a.to) < a.width / 2 + margin),
    addBlock: (x, z, size, rng, color) => {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(x, terrain.heightAt(x, z) + size * 0.25, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler((rng() - 0.5) * 0.7, rng() * 6.28, (rng() - 0.5) * 0.7)),
        new THREE.Vector3(size * (1.2 + rng() * 0.8), size * (0.7 + rng() * 0.4), size),
      );
      blocks.push({ matrix: m, color, shade: 0.85 + rng() * 0.2 });
    },
    onFrame: (fn) => frameFns.push(fn),
  };

  buildSky(data.sky, ctx);
  const ground = new THREE.Mesh(terrain.geometry, terrainMaterial(data.ground, data.smolder ?? [], kit));
  ground.receiveShadow = true;
  scene.add(ground);
  if (data.mountains) buildMountains(data.mountains, ctx);

  const sunDir = new THREE.Vector3(...data.sun.dir).normalize();
  const sun = new THREE.DirectionalLight(data.sun.color, data.sun.intensity);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -data.sun.shadowSize;
  sc.right = sc.top = data.sun.shadowSize;
  sc.near = 1;
  sc.far = 500;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(data.sun.hemi.sky, data.sun.hemi.ground, data.sun.hemi.intensity));

  for (const obj of data.objects) {
    const build = builders[obj.type];
    if (!build) throw new Error(`Unknown object type: ${obj.type}`);
    build(obj, ctx);
  }
  data.custom?.(ctx);
  buildBlocks(blocks, ctx);
  if (data.cracks) buildCracks(data.cracks, ctx);
  if (data.smolder) buildSmolder(data.smolder, ctx);
  if (data.clouds) buildClouds(data.clouds, ctx);
  if (data.light) buildLight(data.light, ctx);
  buildFigures(data.figures ?? [], ctx);
  const crowdCount = data.crowd ? buildCrowd(data.crowd, ctx) : 0;

  const camera = new THREE.PerspectiveCamera(data.player.fov ?? 55, innerWidth / innerHeight, 0.3, 2500);
  const avatar = makeFigure(data.player.colors, kit);
  scene.add(avatar);
  const controls = new ThirdPersonControls({
    camera,
    dom: view.domElement,
    avatar,
    world: { colliders, groundHeight: ctx.groundHeight, terrainHeight: terrain.heightAt, supportHeight },
    start: data.player.start,
    lookAt: data.player.lookAt,
  });

  mountHud(data, crowdCount);
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    view.resize();
  });

  const clock = new THREE.Clock();
  const focus = new THREE.Vector3();
  const loop = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    controls.update(dt);
    for (const fn of frameFns) fn(t, dt, camera);
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    focus.copy(controls.pos).addScaledVector(fwd, data.sun.shadowSize * 0.6);
    const texel = (data.sun.shadowSize * 2) / 2048;
    focus.x = Math.round(focus.x / texel) * texel;
    focus.z = Math.round(focus.z / texel) * texel;
    sun.target.position.copy(focus);
    sun.position.copy(focus).addScaledVector(sunDir, 200);
    view.render(scene, camera);
    requestAnimationFrame(loop);
  };
  loop();
}
