import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, rad, Batch } from './util.js';
import { Ground } from './ground.js';
import { builders, structureMaterials } from './structures.js';
import { People, makePawn, generateCrowd, generateRing } from './people.js';
import { skyTexture, clouds, holyLight, lightRing, smoke } from './fx.js';

const ISO_ELEVATION = Math.atan(1 / Math.SQRT2);

function buildWorld(def, uniforms) {
  const root = new THREE.Group();
  const updaters = [];
  const ground = new Ground(def.ground, def.seed);
  for (const zone of def.ground.zones ?? []) ground.paint(zone);
  for (const c of def.ground.cracks ?? []) ground.crack(c, def.ground.crackColors);

  const mats = structureMaterials();
  const ctx = {
    ground,
    rand: rng(def.seed + 100),
    tops: {},
    fires: [],
    noCrowd: [],
    inNoCrowd: (x, z) => ctx.noCrowd.some((s) => ground.weight(s, x, z) > 0),
    stone: new Batch(new THREE.BoxGeometry(1, 1, 1), mats.stone),
    rubble: new Batch(new THREE.DodecahedronGeometry(0.5, 0), mats.rubble),
    ember: new Batch(new THREE.BoxGeometry(1, 1, 1), mats.ember, { shadows: false }),
    trunk: new Batch(new THREE.CylinderGeometry(0.45, 0.6, 1, 6), mats.trunk),
    leaves: new Batch(new THREE.IcosahedronGeometry(0.6, 0), mats.leaves),
  };
  for (const s of def.structures) {
    if (!builders[s.type]) throw new Error(`Unknown structure type: ${s.type}`);
    builders[s.type](s, ctx);
  }
  for (const key of ['stone', 'rubble', 'ember', 'trunk', 'leaves']) root.add(ctx[key].build());
  updaters.push((t) => { mats.ember.emissiveIntensity = 2 + Math.sin(t * 7) * 0.4 + Math.sin(t * 13.3) * 0.3; });

  const crowdList = [];
  for (const group of def.people) {
    crowdList.push(...(group.ring ? generateRing(group, ctx) : generateCrowd(group, ctx)));
    if (group.light) {
      const [x, z] = group.center;
      const ring = lightRing(group.light, x, ground.heightAt(x, z), z);
      root.add(ring.object);
      updaters.push(ring.update);
    }
  }
  const people = new People(crowdList, uniforms);
  root.add(...people.meshes);

  for (const f of def.figures) {
    const y = f.on ? ctx.tops[f.on] : ground.heightAt(f.x, f.z);
    const pawn = makePawn(f);
    pawn.position.set(f.x, y, f.z);
    pawn.rotation.y = f.facing ? Math.atan2(f.facing[0] - f.x, f.facing[1] - f.z) : 0;
    root.add(pawn);
    if (f.light) {
      const light = holyLight(f.light, f.x, y, f.z, uniforms);
      root.add(light.object);
      updaters.push(light.update);
    }
  }

  if (ctx.fires.length) {
    const s = smoke(ctx.fires, def.smoke);
    root.add(s.object);
    updaters.push(s.update);
  }
  root.add(ground.buildMeshes());
  const c = clouds(def.sky.clouds, def.ground.radius);
  root.add(c.object);
  updaters.push(c.update);
  return { root, ground, people, update: (t) => updaters.forEach((u) => u(t)) };
}

function setupLights(scene, def) {
  const { sun, hemi } = def.light;
  scene.add(new THREE.HemisphereLight(hemi.sky, hemi.ground, hemi.intensity));
  const light = new THREE.DirectionalLight(sun.color, sun.intensity);
  const dir = new THREE.Vector3(...sun.dir).normalize();
  light.position.copy(dir.multiplyScalar(90));
  light.castShadow = true;
  const ext = def.ground.radius * 1.35;
  Object.assign(light.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 1, far: 220 });
  const shadowSize = matchMedia('(pointer: coarse)').matches ? 2048 : 4096;
  light.shadow.mapSize.set(shadowSize, shadowSize);
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.03;
  scene.add(light, light.target);
}

function hud(def) {
  const el = document.createElement('div');
  el.className = 'hud';
  el.innerHTML = `<h1></h1><p class="hint"></p>
    <div class="buttons"><button data-act="left" aria-label="Rotate left">&#x27F2;</button><button data-act="right" aria-label="Rotate right">&#x27F3;</button><button data-act="in" aria-label="Zoom in">+</button><button data-act="out" aria-label="Zoom out">&minus;</button></div>`;
  el.querySelector('h1').textContent = def.title;
  el.querySelector('.hint').textContent = def.hint;
  document.body.appendChild(el);
  return el;
}

export function run(def) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = def.light.exposure ?? 1;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = skyTexture(def.sky);
  setupLights(scene, def);
  const uniforms = { uTime: { value: 0 } };
  const world = buildWorld(def, uniforms);
  scene.add(world.root);

  const p = def.player;
  const avatar = makePawn(p);
  const player = new THREE.Group();
  player.add(avatar);
  const glowColor = new THREE.Color(p.marker).multiplyScalar(2.2);
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), new THREE.MeshBasicMaterial({ color: glowColor }));
  marker.scale.y = 1.6;
  const feet = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.7, depthWrite: false }));
  feet.position.y = 0.04;
  player.add(marker, feet);
  const targetRing = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.32, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: p.marker, transparent: true, opacity: 0.8, depthWrite: false }));
  targetRing.visible = false;
  scene.add(player, targetRing);
  const pos = new THREE.Vector2(p.start[0], p.start[1]);
  player.position.set(pos.x, world.ground.heightAt(pos.x, pos.y), pos.y);

  const cam = def.camera;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 600);
  const view = { angle: rad(cam.angle), goal: rad(cam.angle), zoom: cam.zoom, focus: player.position.clone() };
  view.focus.x -= Math.sin(view.angle) * (cam.lead ?? 0);
  view.focus.z -= Math.cos(view.angle) * (cam.lead ?? 0);
  const resize = () => {
    const aspect = innerWidth / innerHeight;
    Object.assign(camera, { left: -view.zoom * aspect, right: view.zoom * aspect, top: view.zoom, bottom: -view.zoom });
    camera.updateProjectionMatrix();
  };

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), def.post.bloom, def.post.bloomRadius, def.post.bloomThreshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    resize();
  });
  resize();

  const zoomBy = (f) => { view.zoom = THREE.MathUtils.clamp(view.zoom * f, cam.minZoom, cam.maxZoom); resize(); };
  const turn = (dir) => { view.goal += dir * Math.PI / 2; };

  const keys = new Set();
  addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.repeat) return;
    if (e.code === 'KeyQ') turn(-1);
    if (e.code === 'KeyE') turn(1);
    if (e.code === 'Equal' || e.code === 'NumpadAdd') zoomBy(0.85);
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoomBy(1 / 0.85);
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  const ui = hud(def);
  ui.querySelector('.buttons').addEventListener('click', (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (act === 'left') turn(-1);
    if (act === 'right') turn(1);
    if (act === 'in') zoomBy(0.8);
    if (act === 'out') zoomBy(1.25);
  });

  const canvas = renderer.domElement;
  const pointers = new Map();
  let target = null, holding = false, pinch = 0;
  const raycaster = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1), hit = new THREE.Vector3();
  const groundPoint = (cx, cy) => {
    raycaster.setFromCamera(new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1), camera);
    return raycaster.ray.intersectPlane(plane, hit) ? new THREE.Vector2(hit.x, hit.z) : null;
  };
  const pinchDistance = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    holding = pointers.size === 1;
    if (pointers.size === 2) pinch = pinchDistance();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const d = pinchDistance();
      zoomBy(pinch / d);
      pinch = d;
    }
  });
  const release = (e) => {
    if (holding && pointers.has(e.pointerId)) target = groundPoint(e.clientX, e.clientY);
    pointers.delete(e.pointerId);
    holding = false;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomBy(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  const radius = 0.22;
  const free = (x, z) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].every(([a, b]) => !world.ground.isBlocked(x + a * radius, z + b * radius));
  const clock = new THREE.Clock();
  let walk = 0, facing = 0;
  const lookAt = new THREE.Vector3();

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    uniforms.uTime.value = t;

    view.angle += (view.goal - view.angle) * Math.min(1, dt * 7);
    const fwd = new THREE.Vector2(-Math.sin(view.angle), -Math.cos(view.angle));
    const right = new THREE.Vector2(Math.cos(view.angle), -Math.sin(view.angle));
    const move = new THREE.Vector2();
    const k = (...codes) => codes.some((c) => keys.has(c));
    if (k('KeyW', 'ArrowUp')) move.add(fwd);
    if (k('KeyS', 'ArrowDown')) move.sub(fwd);
    if (k('KeyD', 'ArrowRight')) move.add(right);
    if (k('KeyA', 'ArrowLeft')) move.sub(right);
    if (move.lengthSq() > 0) target = null;
    else {
      if (holding) {
        const [ptr] = pointers.values();
        target = groundPoint(ptr.x, ptr.y);
      }
      if (target) {
        move.copy(target).sub(pos);
        if (move.length() < 0.12) { target = null; move.set(0, 0); }
      }
    }
    targetRing.visible = !!target;
    if (target) targetRing.position.set(target.x, world.ground.heightAt(target.x, target.y) + 0.03, target.y);

    const moving = move.lengthSq() > 0;
    if (moving) {
      move.normalize().multiplyScalar(p.speed * dt);
      if (free(pos.x + move.x, pos.y + move.y)) pos.add(move);
      else if (free(pos.x + move.x, pos.y)) pos.x += move.x;
      else if (free(pos.x, pos.y + move.y)) pos.y += move.y;
      else target = null;
      facing = Math.atan2(move.x, move.y);
      walk += dt * 11;
    }
    const groundY = world.ground.heightAt(pos.x, pos.y);
    player.position.set(pos.x, THREE.MathUtils.lerp(player.position.y, groundY, Math.min(1, dt * 12)), pos.y);
    const delta = Math.atan2(Math.sin(facing - player.rotation.y), Math.cos(facing - player.rotation.y));
    player.rotation.y += delta * Math.min(1, dt * 12);
    avatar.position.y = moving ? Math.abs(Math.sin(walk)) * 0.07 : 0;
    avatar.rotation.z = moving ? Math.sin(walk) * 0.06 : 0;
    marker.position.set(0, 1.25 + Math.sin(t * 3) * 0.07, 0);
    marker.rotation.y = t * 2;
    world.people.update(pos.x, pos.y, dt);
    world.update(t);

    lookAt.set(pos.x + fwd.x * (cam.lead ?? 0), player.position.y, pos.y + fwd.y * (cam.lead ?? 0));
    view.focus.lerp(lookAt, Math.min(1, dt * 5));
    const d = 200;
    camera.position.set(
      view.focus.x + Math.sin(view.angle) * Math.cos(ISO_ELEVATION) * d,
      view.focus.y + Math.sin(ISO_ELEVATION) * d,
      view.focus.z + Math.cos(view.angle) * Math.cos(ISO_ELEVATION) * d,
    );
    camera.lookAt(view.focus);
    composer.render();
  });
}
