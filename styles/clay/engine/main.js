import * as THREE from 'three';
import { World } from './world.js';
import { Crowd } from './crowd.js';
import { Player } from './player.js';
import { Post } from './post.js';
import { clayUniforms } from './clay.js';

export function run(data, canvasHost) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  canvasHost.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.3, 1800);

  const world = new World(data).build();
  scene.fog = world.fog;
  scene.add(world.root);

  const crowd = new Crowd(data.crowd, world, data.seed + 1, [[...data.player.start, 2.2]]);
  scene.add(crowd.group);

  const player = new Player(data.player, world, camera, renderer.domElement);
  scene.add(player.group);

  // Shadows follow the player so nearby contact shadows stay crisp.
  const sunOffset = world.sun.position.clone();

  const post = new Post(renderer, scene, camera, [world.fx, player.marker, crowd.shadowCaster]);
  post.setSize(innerWidth, innerHeight);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    post.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  const quality = { frames: 0, since: 0, step: 0 };
  // Weak GPUs drop the AO pass first, then render at native CSS resolution.
  // Automated browsers render in software, so they keep full quality for previews.
  const adapt = (t) => {
    quality.frames++;
    if (navigator.webdriver || t - quality.since < 3) return;
    const fps = quality.frames / (t - quality.since);
    quality.frames = 0;
    quality.since = t;
    if (fps > 40 || quality.step > 1) return;
    if (quality.step === 0) post.ao.enabled = false;
    else {
      renderer.setPixelRatio(1);
      post.setSize(innerWidth, innerHeight);
    }
    quality.step++;
  };
  const focus = new THREE.Vector3();
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    clayUniforms.uTime.value = t;
    player.update(dt);
    crowd.update(player.pos, dt);
    world.update(t, dt);

    const snap = 4;
    const cx = Math.round(player.pos.x / snap) * snap * 0.5, cz = Math.round(player.pos.z / snap) * snap * 0.5;
    world.sun.position.set(cx + sunOffset.x, sunOffset.y, cz + sunOffset.z);
    world.sun.target.position.set(cx, 0, cz);

    focus.copy(player.pos).setY(player.pos.y + 1).project(camera);
    post.setFocus(THREE.MathUtils.clamp(focus.y * 0.5 + 0.5 + 0.08, 0.2, 0.8));
    post.render(dt);
    adapt(t);
    requestAnimationFrame(tick);
  };
  tick();
  return { renderer, scene, camera, world, crowd, player, post };
}
