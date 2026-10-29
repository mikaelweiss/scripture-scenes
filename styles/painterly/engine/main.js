import * as THREE from 'three';
import { rng } from './noise.js';
import { Batch } from './batch.js';
import { makeHeightField, buildTerrain, buildMountains } from './terrain.js';
import { buildSky, buildLights } from './sky.js';
import { builders, rubble, cracks } from './structures.js';
import { buildCrowd, radiantFigure } from './people.js';
import { beam, lightRing, smolder, effectTime } from './effects.js';
import { Painter } from './painter.js';
import { WalkControls } from './controls.js';

function buildWorld(scene, data) {
  const heightAt = makeHeightField(data.terrain);
  const rand = rng(data.seed ?? 1);
  const ctx = { heightAt, rand, batch: new Batch(heightAt, rand), colliders: [], anchors: {}, updaters: [] };

  const sky = buildSky(data.sky);
  scene.add(sky.mesh);
  scene.fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
  scene.add(buildLights(data.light, sky.sunDir, data.light.focus));
  scene.add(buildTerrain(data.terrain, heightAt, data.smolder.spots));
  if (data.mountains) scene.add(buildMountains(data.mountains));

  for (const s of data.structures) builders[s.type](ctx, s);
  scene.add(ctx.batch.build(new THREE.MeshLambertMaterial({ vertexColors: true })));
  scene.add(rubble(ctx, data.rubble));
  scene.add(cracks(ctx, data.cracks));
  scene.add(smolder(ctx, data.smolder.spots, data.smolder));

  const crowd = buildCrowd(ctx, data.crowd);
  scene.add(crowd.group);
  for (const f of data.figures) scene.add(radiantFigure(ctx, f));
  for (const r of data.lightRings ?? []) scene.add(lightRing(ctx, r));
  for (const b of data.beams ?? []) {
    const resolve = (p) => (p.anchor ? ctx.anchors[p.anchor].clone().add(new THREE.Vector3(...(p.offset ?? [0, 0, 0]))).toArray() : p);
    scene.add(beam({ ...b, from: resolve(b.from), to: resolve(b.to) }));
  }

  return {
    heightAt,
    colliders: ctx.colliders,
    people: crowd.count,
    update(t, camera) {
      sky.uniforms.time.value = t;
      sky.mesh.position.copy(camera.position);
      effectTime.value = t;
      for (const u of ctx.updaters) u(t);
    },
  };
}

export function start(data) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, data.paint?.maxPixelRatio ?? 1));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.prepend(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(data.camera?.fov ?? 62, innerWidth / innerHeight, 0.3, 1200);
  const scene = new THREE.Scene();
  const world = buildWorld(scene, data);
  const painter = new Painter(renderer, data.paint);
  const at = new URLSearchParams(location.search).get('at')?.split(',').map(Number);
  if (at) data.spawn = { pos: [at[0], at[1]], yaw: at[2] ?? 0, pitch: at[3] ?? 0 };
  const controls = new WalkControls(camera, renderer.domElement, {
    heightAt: world.heightAt,
    colliders: world.colliders,
    spawn: data.spawn,
    limit: data.terrain.size / 2 - 40,
  });

  document.title = data.title;
  document.querySelector('#title').textContent = data.title;
  document.querySelector('#subtitle').textContent = data.subtitle ?? '';

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    painter.setSize();
  });

  const raw = new URLSearchParams(location.search).has('raw');
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    controls.update(dt);
    world.update(t, camera);
    if (raw) renderer.render(scene, camera);
    else painter.render(scene, camera);
  });
  window.__scene = { people: world.people, camera, controls };
}
