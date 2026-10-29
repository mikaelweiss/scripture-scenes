import * as THREE from 'three';
import { buildTextures, rng } from './textures.js';
import { buildAtlas } from './figures.js';
import { Builder, Colliders, makeTerrain, valueNoise } from './world.js';
import { KINDS } from './kinds.js';
import { Walker } from './controls.js';
import {
  createShared, worldMaterial, crowdMaterial, shadowMaterial, particleMaterial,
  shaftMaterial, ringMaterial, skyMaterial, postMaterial,
} from './materials.js';

const DEFAULT_RENDER = { height: 200, snap: 0.5, affine: 0.6, levels: 31, contrast: 1.05, saturation: 1.05 };

export function run(scene, canvas) {
  THREE.ColorManagement.enabled = false;
  const R = { ...DEFAULT_RENDER, ...scene.render };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);

  const shared = createShared();
  shared.uAffine.value = R.affine;
  shared.uFogColor.value.setRGB(...scene.fog.color);
  shared.uFogDensity.value = scene.fog.density;
  shared.uLightDir.value.set(...scene.light.dir).normalize();
  shared.uLightColor.value.setRGB(...scene.light.color);
  shared.uSkyAmb.value.setRGB(...scene.light.sky);
  shared.uGroundAmb.value.setRGB(...scene.light.ground);

  const textures = buildTextures();
  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(scene.camera?.fov ?? 62, 16 / 9, 0.1, 1500);

  const terrain = makeTerrain(scene.ground);
  const colliders = new Colliders(terrain);
  const builder = new Builder();
  const matCache = new Map();
  const ctx = {
    scene: world, shared, textures, terrain, colliders, builder,
    rocks: [], people: [], figures: [], stains: [],
    particleMaterial: (o) => particleMaterial(shared, textures[o.map], o),
    shaftMaterial: (o) => shaftMaterial(shared, o),
    ringMaterial: (o) => ringMaterial(shared, { color: o.color, intensity: o.intensity ?? 1, inner: o.radius }),
  };

  const rand = rng(scene.seed ?? 1234);
  for (const phase of [0, 1]) {
    for (const item of scene.objects) {
      const kind = KINDS[item.type];
      if (!kind) throw new Error(`Unknown object type: ${item.type}`);
      if (kind[0] === phase) kind[1](ctx, item, rand);
    }
  }

  const material = (tex, emissive = 0) => {
    const key = `${tex}|${emissive}`;
    if (!matCache.has(key)) matCache.set(key, worldMaterial(shared, textures[tex], { emissive }));
    return matCache.get(key);
  };

  world.add(buildGround(scene.ground, terrain, ctx.stains, material('dirt')));
  for (const m of builder.meshes(material)) world.add(m);
  if (ctx.rocks.length) world.add(buildRocks(ctx.rocks, material));
  if (ctx.people.length) addPeople(world, shared, ctx.people, { emissive: 0 });
  for (const f of ctx.figures) addPeople(world, shared, [f], { emissive: f.emissive, cell: [40, 64], shadow: false });

  const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), skyMaterial(shared, scene.sky));
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  world.add(sky);

  const walker = new Walker(canvas, colliders, scene.player);

  // Low-res target, then a dithered blit to a canvas of the same size that CSS scales up.
  const target = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
  const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial(target.texture, R));
  const postScene = new THREE.Scene();
  postScene.add(post);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const resize = () => {
    const aspect = innerWidth / innerHeight;
    const h = R.height;
    const w = Math.round(h * aspect);
    renderer.setSize(w, h, false);
    target.setSize(w, h);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    shared.uSnapRes.value.set(w * 0.5 * R.snap, h * 0.5 * R.snap);
  };
  addEventListener('resize', resize);
  resize();

  document.getElementById('title').innerHTML = scene.title;
  document.getElementById('hint').textContent = matchMedia('(pointer: coarse)').matches ? scene.hintTouch : scene.hint;

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    shared.uTime.value += dt;
    walker.update(dt, camera);
    shared.uCamPos.value.copy(camera.position);
    sky.position.copy(camera.position);
    renderer.setRenderTarget(target);
    renderer.render(world, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  });
}

function buildGround(ground, terrain, stains, mat) {
  const segs = ground.segments ?? 220;
  const half = ground.size / 2;
  const inner = ground.inner ?? 160;
  const A = inner, B = half - inner;
  const remap = (s) => A * s + B * s ** 5;
  const tint = valueNoise((ground.seed ?? 1) + 5);
  const pos = [], uv = [], col = [], idx = [];
  const tile = ground.tile ?? 5;
  for (let j = 0; j <= segs; j++) {
    for (let i = 0; i <= segs; i++) {
      const x = remap((i / segs) * 2 - 1), z = remap((j / segs) * 2 - 1);
      const y = terrain(x, z);
      pos.push(x, y, z);
      uv.push(x / tile, z / tile);
      const t = tint(x * 0.06, z * 0.06);
      let c = ground.colorA.map((v, k) => v + (ground.colorB[k] - v) * t);
      const high = Math.min(1, Math.max(0, (y - 4) / 60));
      c = c.map((v, k) => v + ((ground.colorHigh ?? c)[k] - v) * high);
      for (const s of stains) {
        const d = Math.hypot(x - s.x, z - s.z) / s.r;
        if (d < 1) c = c.map((v) => v * (0.35 + 0.65 * d * d));
      }
      col.push(...c);
    }
  }
  for (let j = 0; j < segs; j++) {
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i, b = a + 1, c = a + segs + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

function buildRocks(rocks, material) {
  const g = new THREE.IcosahedronGeometry(1, 0);
  g.setAttribute('aColor', new THREE.Float32BufferAttribute(new Array(g.getAttribute('position').count * 3).fill(1), 3));
  const mesh = new THREE.InstancedMesh(g, material('stone'), rocks.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  rocks.forEach((r, i) => {
    q.setFromEuler(e.set(...r.rot));
    m.compose(new THREE.Vector3(...r.pos), q, new THREE.Vector3(...r.scale));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, new THREE.Color(...r.color));
  });
  mesh.frustumCulled = false;
  return mesh;
}

function addPeople(world, shared, people, { emissive, cell = [24, 48], shadow = true }) {
  const types = [...new Set(people.map((p) => p.type))];
  const atlas = buildAtlas(types, cell[0], cell[1]);
  const quad = new THREE.PlaneGeometry(1, 1);
  quad.translate(0, 0.5, 0);
  const g = new THREE.InstancedBufferGeometry();
  g.index = quad.index;
  g.setAttribute('position', quad.getAttribute('position'));
  g.setAttribute('uv', quad.getAttribute('uv'));
  const attr = (name, size, fn) => g.setAttribute(name, new THREE.InstancedBufferAttribute(new Float32Array(people.flatMap(fn)), size));
  attr('aOffset', 3, (p) => p.pos);
  attr('aScale', 2, (p) => [p.height * atlas.aspect, p.height]);
  attr('aFacing', 1, (p) => [p.facing]);
  attr('aRow', 1, (p) => [types.indexOf(p.type)]);
  attr('aRobe', 3, (p) => p.robe);
  attr('aCloak', 3, (p) => p.cloak);
  attr('aSkin', 3, (p) => p.skin);
  attr('aHair', 3, (p) => p.hair);
  g.instanceCount = people.length;
  const mesh = new THREE.Mesh(g, crowdMaterial(shared, atlas, { emissive }));
  mesh.frustumCulled = false;
  world.add(mesh);

  if (shadow) {
    const sg = new THREE.InstancedBufferGeometry();
    const flat = new THREE.PlaneGeometry(1, 1);
    sg.index = flat.index;
    sg.setAttribute('position', flat.getAttribute('position'));
    sg.setAttribute('uv', flat.getAttribute('uv'));
    sg.setAttribute('aOffset', g.getAttribute('aOffset'));
    sg.setAttribute('aScale', g.getAttribute('aScale'));
    sg.instanceCount = people.length;
    const sm = new THREE.Mesh(sg, shadowMaterial(shared));
    sm.frustumCulled = false;
    world.add(sm);
  }
}
