// Paper diorama engine: turns a scene description (scene.js) into a walkable Three.js world.
import * as THREE from 'three';
import * as P from './paper.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Walker } from './walker.js';

const TILE = 4;
const CARD = '#a88d66';
const LINE = new THREE.LineBasicMaterial({ color: '#5a4330' });

function makeTex(c, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function drawn(w, h, draw, opts) {
  const c = P.canvas(w, h);
  draw(c.getContext('2d'), c.width, c.height, opts);
  return c;
}

// Upright card with its pivot at the bottom edge. Normals lean up so every card catches the sun like a page.
function cardGeometry(w, h, uv, lean = 0) {
  const g = new THREE.PlaneGeometry(w, h);
  g.translate(0, h / 2, 0);
  const n = g.attributes.normal, v = new THREE.Vector3(0, 1, lean).normalize();
  for (let i = 0; i < n.count; i++) n.setXYZ(i, v.x, v.y, v.z);
  if (uv) {
    const a = g.attributes.uv;
    for (let i = 0; i < a.count; i++) a.setXY(i, uv[0] + a.getX(i) * (uv[2] - uv[0]), uv[1] + a.getY(i) * (uv[3] - uv[1]));
  }
  return g;
}

class Atlas {
  constructor(cw, ch, count, cols = Math.min(count, Math.floor(2048 / cw))) {
    Object.assign(this, { cw, ch, cols, rows: Math.ceil(count / cols), n: 0 });
    this.canvas = P.canvas(cw * cols, ch * this.rows);
    this.ctx = this.canvas.getContext('2d');
  }
  add(draw, opts) {
    const i = this.n++;
    this.ctx.drawImage(P.cutout(this.cw, this.ch, draw, opts), (i % this.cols) * this.cw, Math.floor(i / this.cols) * this.ch);
    return i;
  }
  uv(i) {
    const col = i % this.cols, row = Math.floor(i / this.cols), px = 0.5 / this.canvas.width, py = 0.5 / this.canvas.height;
    return [col / this.cols + px, 1 - (row + 1) / this.rows + py, (col + 1) / this.cols - px, 1 - row / this.rows - py];
  }
}

// Camera-facing paper standees, one InstancedMesh per atlas cell. Items with a back cell flip to it when seen from behind.
class Billboards {
  constructor(atlas, { lit = true, shadow = true } = {}) {
    this.atlas = atlas;
    this.items = [];
    this.material = new (lit ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial)({ map: makeTex(atlas.canvas), alphaTest: 0.5, side: THREE.DoubleSide });
    this.shadow = shadow;
  }
  add(item) {
    const t = item.tint ?? 1;
    this.items.push({ ...item, y: item.y ?? 0, r: t, g: t * (item.warm ?? 1), b: t * (item.warm ?? 1) * (item.warm ?? 1) });
  }
  build(scene) {
    const cap = new Map();
    for (const it of this.items) {
      cap.set(it.front, (cap.get(it.front) ?? 0) + 1);
      if (it.back != null && it.back !== it.front) cap.set(it.back, (cap.get(it.back) ?? 0) + 1);
    }
    this.meshes = new Map();
    for (const [cell, n] of cap) {
      const mesh = new THREE.InstancedMesh(cardGeometry(1, 1, this.atlas.uv(cell)), this.material, n);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      mesh.frustumCulled = false;
      mesh.castShadow = this.shadow;
      scene.add(mesh);
      this.meshes.set(cell, { mesh, n: 0 });
    }
  }
  update(cam) {
    for (const e of this.meshes.values()) e.n = 0;
    for (const it of this.items) {
      const dx = cam.x - it.x, dz = cam.z - it.z;
      const yaw = Math.atan2(dx, dz), c = Math.cos(yaw), s = Math.sin(yaw);
      const showBack = it.back != null && Math.sin(it.facing) * dx + Math.cos(it.facing) * dz < 0;
      const e = this.meshes.get(showBack ? it.back : it.front);
      const a = e.mesh.instanceMatrix.array, o = e.n * 16, k = e.n * 3;
      a[o] = c * it.w; a[o + 1] = 0; a[o + 2] = -s * it.w; a[o + 3] = 0;
      a[o + 4] = 0; a[o + 5] = it.h; a[o + 6] = 0; a[o + 7] = 0;
      a[o + 8] = s; a[o + 9] = 0; a[o + 10] = c; a[o + 11] = 0;
      a[o + 12] = it.x; a[o + 13] = it.y; a[o + 14] = it.z; a[o + 15] = 1;
      const col = e.mesh.instanceColor.array;
      col[k] = it.r; col[k + 1] = it.g; col[k + 2] = it.b;
      e.n++;
    }
    for (const e of this.meshes.values()) {
      e.mesh.count = e.n;
      e.mesh.instanceMatrix.needsUpdate = true;
      e.mesh.instanceColor.needsUpdate = true;
    }
  }
}

// Walkable boxes and colliders. Anything more than a step above your feet blocks you.
class Ground {
  constructor() { this.solids = []; }
  add(x, z, hw, hd, top, rot = 0) { this.solids.push({ x, z, hw, hd, top, c: Math.cos(rot), s: Math.sin(rot) }); }
  heightAt(x, z, pad = 0) {
    let h = 0;
    for (const b of this.solids) {
      const dx = x - b.x, dz = z - b.z;
      if (Math.abs(dx * b.c - dz * b.s) <= b.hw + pad && Math.abs(dx * b.s + dz * b.c) <= b.hd + pad) h = Math.max(h, b.top);
    }
    return h;
  }
  canStand(x, z, y) { return this.heightAt(x, z, 0.35) - y < 0.6; }
  blocked(x, z, pad = 0.5) { return this.heightAt(x, z, pad) > 0.15; }
}

export function run(scene) {
  const R = P.rng(scene.seed ?? 1);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.prepend(renderer.domElement);

  const world = new THREE.Scene();
  const sky = scene.sky;
  world.fog = new THREE.Fog(sky.fog, sky.fogNear, sky.fogFar);
  world.background = new THREE.Color(sky.fog);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1400);
  const ground = new Ground();
  const sunDir = new THREE.Vector3(...scene.sun.dir).normalize();
  const animate = [];
  const layers = [];

  // Light
  world.add(new THREE.HemisphereLight(scene.ambient.sky, scene.ambient.ground, scene.ambient.intensity));
  const sun = new THREE.DirectionalLight(scene.sun.color, scene.sun.intensity);
  const focus = new THREE.Vector3(scene.shadowArea.center[0], 0, scene.shadowArea.center[1]);
  sun.position.copy(focus).addScaledVector(sunDir, 160);
  sun.target.position.copy(focus);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sa = scene.shadowArea.size / 2;
  Object.assign(sun.shadow.camera, { left: -sa, right: sa, top: sa, bottom: -sa, near: 10, far: 360 });
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.03;
  world.add(sun, sun.target);

  buildSky(world, scene, sunDir, R);
  buildHills(world, scene.hills);
  buildGround(world, scene, R);
  for (const s of scene.structures) STRUCTURES[s.type](world, s, ground, R);
  flushBoxes(world);
  for (const s of scene.standees) buildStandee(world, s, ground);

  const nature = buildNature(world, scene, ground, R);
  layers.push(...nature);
  const crowd = buildCrowd(scene, ground, R);
  crowd.build(world);
  layers.push(crowd);
  animate.push(buildChrist(world, scene.christ, ground));
  for (const f of scene.fires) animate.push(buildFire(world, f, R));

  const at = new URLSearchParams(location.search).get('at')?.split(',').map(parseFloat);
  const start = at ? [at[0], at[1]] : scene.player.start;
  const walker = new Walker(camera, renderer.domElement, { start, yaw: at?.[2] ?? scene.player.yaw, world: ground });
  const avatar = buildAvatar(world, scene.player);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const stats = new URLSearchParams(location.search).has('stats') && document.getElementById('hint');
  let frames = 0, since = 0;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    walker.update(dt);
    avatar(walker, camera, t);
    for (const l of layers) l.update(camera.position);
    for (const a of animate) a(t, dt, camera);
    renderer.render(world, camera);
    frames++;
    if (stats && t - since > 1) {
      stats.textContent = `${Math.round(frames / (t - since))} fps, ${renderer.info.render.calls} draw calls, ${crowd.items.length} people`;
      frames = 0;
      since = t;
    }
  });
}

// ---------- Sky ----------

function buildSky(world, scene, sunDir, R) {
  const s = scene.sky;
  const stops = s.stops.map((c) => new THREE.Color(c));
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(700, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uSun: { value: sunDir }, uBands: { value: s.bands }, c0: { value: stops[0] }, c1: { value: stops[1] }, c2: { value: stops[2] }, c3: { value: stops[3] }, c4: { value: stops[4] } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `
        uniform vec3 uSun, c0, c1, c2, c3, c4; uniform float uBands; varying vec3 vDir;
        vec3 ramp(float t){ t = clamp(t,0.,1.)*4.;
          if(t<1.) return mix(c0,c1,t); if(t<2.) return mix(c1,c2,t-1.); if(t<3.) return mix(c2,c3,t-2.); return mix(c3,c4,t-3.); }
        void main(){
          vec3 d = normalize(vDir);
          float h = max(d.y, 0.);
          float s = max(dot(d, uSun), 0.);
          float az = atan(d.z, d.x);
          float t = pow(h, 0.6) * 1.15 + 0.1 - pow(s, 4.) * 0.85 + sin(az*5. + h*9.)*0.025 + sin(az*13. - h*6.)*0.012;
          t = floor(clamp(t, 0., 1.) * uBands + 0.5) / uBands;
          gl_FragColor = vec4(ramp(t), 1.);
          #include <colorspace_fragment>
        }`,
    }),
  );
  dome.renderOrder = -2;
  world.add(dome);

  const sunPos = sunDir.clone().multiplyScalar(560);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeTex(drawn(256, 256, P.drawGlow, { color: '255,236,190' })), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
  glow.position.copy(sunPos);
  glow.scale.setScalar(380);
  world.add(glow);
  const disk = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeTex(P.cutout(256, 256, (c, w, h) => { c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(w / 2, h / 2, w * 0.4, 0, 7); c.fill(); }, { edge: '#ffe7a6', border: 10 })), fog: false, alphaTest: 0.5 }));
  disk.position.copy(sunPos);
  disk.scale.setScalar(46);
  world.add(disk);

  const rays = new THREE.Group();
  rays.position.copy(sunPos);
  rays.lookAt(0, 0, 0);
  const rayMat = new THREE.MeshBasicMaterial({ map: makeTex(drawn(64, 256, P.drawRay)), color: scene.rays.color, transparent: true, opacity: scene.rays.opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  for (let i = 0; i < scene.rays.count; i++) {
    const g = new THREE.PlaneGeometry(40 + R() * 50, 700);
    g.translate(0, -350, 0);
    const m = new THREE.Mesh(g, rayMat);
    m.rotation.z = (i / (scene.rays.count - 1) - 0.5) * 1.3 + (R() - 0.5) * 0.12;
    rays.add(m);
  }
  world.add(rays);

  const c = scene.clouds, tones = c.tones;
  const texes = tones.map((tone, ti) => [0, 1, 2].map((k) => makeTex(P.cutout(512, 256, (ctx, w, h) => P.drawCloud(ctx, w, h, { ...tone, seed: ti * 10 + k + 1 }), { border: 6, edge: tone.edge }))));
  const sunFlat = new THREE.Vector2(sunDir.x, sunDir.z).normalize();
  let placed = 0;
  for (let tries = 0; placed < c.count && tries < c.count * 20; tries++) {
    const az = R() * Math.PI * 2, y = c.minY + R() * (c.maxY - c.minY);
    const dir = new THREE.Vector3(Math.cos(az) * c.radius, y, Math.sin(az) * c.radius).normalize();
    const toward = dir.dot(sunDir);
    if (toward > c.clearing) continue;
    const warmth = Math.max(0, (Math.cos(az) * sunFlat.x + Math.sin(az) * sunFlat.y + 1) / 2) ** 2 * (1 - (y - c.minY) / (c.maxY - c.minY) * 0.6);
    const tone = Math.min(tones.length - 1, Math.floor(warmth * tones.length * 1.15));
    const w = c.size[0] + R() * (c.size[1] - c.size[0]);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({ map: texes[tone][Math.floor(R() * 3)], alphaTest: 0.5, fog: false, side: THREE.DoubleSide }));
    m.position.set(Math.cos(az) * c.radius * (0.9 + R() * 0.2), y, Math.sin(az) * c.radius * (0.9 + R() * 0.2));
    m.lookAt(0, y * 0.4, 0);
    m.renderOrder = -1;
    world.add(m);
    placed++;
  }
}

function buildHills(world, hills) {
  for (const h of hills) {
    const c = drawn(2048, 256, P.drawHillBand, h);
    const t = makeTex(c);
    t.wrapS = THREE.RepeatWrapping;
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(h.radius, h.radius, h.height, 160, 1, true),
      new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.BackSide }),
    );
    m.position.y = h.height / 2 - 0.5;
    m.rotation.y = h.seed;
    world.add(m);
  }
}

// ---------- Ground and decals ----------

function decalMaterial(map, layer) {
  return new THREE.MeshLambertMaterial({ map, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -1 - layer, polygonOffsetUnits: -4 - layer * 4 });
}

function decal(world, canvasOrTex, w, d, x, z, rot, layer) {
  const map = canvasOrTex.isTexture ? canvasOrTex : makeTex(canvasOrTex);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), decalMaterial(map, layer));
  m.position.set(x, 0.015 + layer * 0.006, z);
  m.rotation.y = rot;
  m.receiveShadow = true;
  world.add(m);
  return m;
}

// Many copies of one decal texture: [w, d, x, z, rot] each.
function decalSet(world, map, layer, list) {
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), decalMaterial(map, layer), list.length);
  const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  list.forEach(([w, d, x, z, rot], i) => m.setMatrixAt(i, mat.compose(new THREE.Vector3(x, 0.015 + layer * 0.006, z), q.setFromAxisAngle(up, rot), new THREE.Vector3(w, 1, d))));
  m.receiveShadow = true;
  world.add(m);
}

function buildGround(world, scene, R) {
  const g = scene.ground;
  const map = makeTex(drawn(512, 512, P.drawGroundTile, { color: g.color, seed: 3 }), true);
  map.repeat.set((g.radius * 2) / g.tile, (g.radius * 2) / g.tile);
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(g.radius, 96).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map }));
  mesh.receiveShadow = true;
  world.add(mesh);

  const pt = scene.patches;
  const patchTex = pt.colors.map((color, i) => makeTex(P.cutout(256, 256, (c, w, h) => P.drawPatch(c, w, h, { color, seed: i + 1, tufts: i % 2 === 0 }), { border: 4, edge: P.shade(color, 1.25), lift: true })));
  const lists = patchTex.map(() => []);
  for (let i = 0; i < pt.count; i++) {
    const a = R() * Math.PI * 2, r = Math.sqrt(R()) * pt.radius, s = pt.size[0] + R() * (pt.size[1] - pt.size[0]);
    lists[i % lists.length].push([s, s * (0.6 + R() * 0.4), Math.cos(a) * r, Math.sin(a) * r, R() * 6]);
  }
  lists.forEach((list, i) => decalSet(world, patchTex[i], i % 2, list));
  const crackTex = [1, 2, 3, 4].map((seed) => makeTex(P.cutout(1024, 128, (c, w, h) => P.drawCrack(c, w, h, { color: scene.cracks.color, seed }), { border: 4, edge: scene.cracks.edge })));
  scene.cracks.list.forEach(([x0, z0, x1, z1, wd = 3], i) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    decal(world, crackTex[i % 4], len, wd, (x0 + x1) / 2, (z0 + z1) / 2, -Math.atan2(z1 - z0, x1 - x0), 3);
  });
}

// ---------- Paper boxes (temple, platforms) ----------

const stoneCache = new Map();
function stoneMaterial(color, seed = 1, glyphs = false) {
  const key = color + seed + glyphs;
  if (!stoneCache.has(key)) {
    const map = makeTex(drawn(512, 512, P.drawStoneTile, { color, seed, glyphs }), true);
    stoneCache.set(key, new THREE.MeshLambertMaterial({ map }));
  }
  return stoneCache.get(key);
}

// Boxes are queued and merged per material so a whole temple costs a few draw calls.
const boxQueue = { byMat: new Map(), edges: [] };
function paperBox(world, w, h, d, mat, x, y, z, rot = 0, tip = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i;
    uv.setXY(k, (uv.getX(k) * dims[f][0]) / TILE, (uv.getY(k) * dims[f][1]) / TILE);
  }
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y + h / 2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, tip, 'YXZ')), new THREE.Vector3(1, 1, 1));
  const edges = new THREE.EdgesGeometry(g).applyMatrix4(m);
  g.applyMatrix4(m);
  if (!boxQueue.byMat.has(mat)) boxQueue.byMat.set(mat, []);
  boxQueue.byMat.get(mat).push(g);
  boxQueue.edges.push(edges);
}

function flushBoxes(world) {
  for (const [mat, geos] of boxQueue.byMat) {
    const m = new THREE.Mesh(mergeGeometries(geos), mat);
    m.castShadow = m.receiveShadow = true;
    world.add(m);
  }
  if (boxQueue.edges.length) world.add(new THREE.LineSegments(mergeGeometries(boxQueue.edges), LINE));
  boxQueue.byMat.clear();
  boxQueue.edges = [];
}

function stairs(world, ground, { x, z, width, height, rise, run, mat, rail }) {
  const n = Math.max(1, Math.round(height / rise));
  for (let k = 0; k < n; k++) {
    const top = ((k + 1) * height) / n, cz = z - (k + 0.5) * run;
    paperBox(world, width, top, run, mat, x, 0, cz);
    ground.add(x, cz, width / 2, run / 2, top);
    if (rail) for (const side of [-1, 1]) {
      const rx = x + side * (width / 2 + rail / 2);
      paperBox(world, rail, top + 0.4, run, mat, rx, 0, cz);
      ground.add(rx, cz, rail / 2, run / 2, top + 0.4);
    }
  }
}

const STRUCTURES = {
  stepPyramid(world, s, ground, R) {
    const [cx, cz] = s.at, mat = stoneMaterial(s.stone, 1, true), lightMat = stoneMaterial(P.shade(s.stone, 1.12), 2);
    let y = 0;
    for (let i = 0; i < s.tiers; i++) {
      const w = s.base[0] - i * 2 * s.inset, d = s.base[1] - i * 2 * s.inset;
      paperBox(world, w, s.tierHeight, d, mat, cx, y, cz);
      paperBox(world, w + 0.3, 0.35, d + 0.3, lightMat, cx, y + s.tierHeight - 0.35, cz);
      ground.add(cx, cz, w / 2, d / 2, y + s.tierHeight);
      y += s.tierHeight;
    }
    const topD = s.base[1] - (s.tiers - 1) * 2 * s.inset;
    const front = cz + s.base[1] / 2 + s.stairs.out, back = cz + topD / 2;
    const n = Math.round(y / s.stairs.rise);
    stairs(world, ground, { x: cx, z: front, width: s.stairs.width, height: y, rise: s.stairs.rise, run: (front - back) / n, mat: lightMat, rail: 0.9 });
    const sh = s.shrine;
    paperBox(world, sh.size[0], sh.size[2], sh.size[1], stoneMaterial(sh.stone, 3, true), cx, y, cz - 1);
    paperBox(world, sh.size[0] + 1, 0.5, sh.size[1] + 1, lightMat, cx, y + sh.size[2], cz - 1);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.6), new THREE.MeshBasicMaterial({ color: '#2a1d14' }));
    door.position.set(cx, y + 1.3, cz - 1 + sh.size[1] / 2 + 0.02);
    world.add(door);
    const comb = P.cutout(512, 256, (c, w, h) => P.drawRoofComb(c, w, h, { color: sh.stone }), { border: 5 });
    standeeMesh(world, comb, sh.size[0] * 0.8, sh.size[0] * 0.4, cx, y + sh.size[2] + 0.5, cz - 1, 0, { brace: false });
    for (let i = 0; i < s.rubble; i++) {
      const a = R() * Math.PI * 2, r = s.base[0] * 0.55 + R() * 6, sz = 0.5 + R() * 1.1;
      const bx = cx + Math.cos(a) * r, bz = cz + Math.sin(a) * r * 0.9;
      if (bz > front - 1 && Math.abs(bx - cx) < s.stairs.width) continue;
      paperBox(world, sz * 1.4, sz, sz, mat, bx, -0.1, bz, R() * 3, (R() - 0.5) * 0.4);
    }
  },
  platform(world, s, ground) {
    const [cx, cz] = s.at, mat = stoneMaterial(s.stone, 4);
    paperBox(world, s.size[0], s.height, s.size[1], mat, cx, 0, cz);
    ground.add(cx, cz, s.size[0] / 2, s.size[1] / 2, s.height);
    const n = Math.round(s.height / s.stairs.rise);
    stairs(world, ground, { x: cx, z: cz + s.size[1] / 2 + n * 0.45, width: s.stairs.width, height: s.height, rise: s.stairs.rise, run: 0.45, mat });
  },
};

// ---------- Fixed standees ----------

function standeeMesh(world, c, w, h, x, y, z, rot, { tilt = 0, brace = true, collide, ground } = {}) {
  const group = new THREE.Group();
  const front = new THREE.Mesh(cardGeometry(w, h, null, 0.6), new THREE.MeshLambertMaterial({ map: makeTex(c), alphaTest: 0.5 }));
  front.castShadow = true;
  const back = new THREE.Mesh(cardGeometry(w, h, null, 0.6), new THREE.MeshLambertMaterial({ color: CARD, alphaMap: makeTex(P.silhouette(c)), alphaTest: 0.5 }));
  back.rotation.y = Math.PI;
  back.position.z = -0.04;
  back.scale.x = -1;
  back.castShadow = true;
  group.add(front, back);
  if (brace && !tilt) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.05, 0, h * 0.45, -0.05, 0, 0, -0.05 - h * 0.28], 3));
    g.computeVertexNormals();
    const b = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: CARD, side: THREE.DoubleSide }));
    b.castShadow = true;
    group.add(b);
  }
  group.position.set(x, y, z);
  group.rotation.set(tilt, rot, 0, 'YXZ');
  world.add(group);
  if (collide && !tilt) ground.add(x, z, w / 2, 0.3, 99, rot);
  return group;
}

const STANDEE_DRAW = { wall: P.drawWall, house: P.drawHouse, stela: P.drawStela };

function buildStandee(world, s, ground) {
  const [x, z] = s.at, rot = s.rot ?? 0;
  if (s.kind === 'fallenTree') {
    const c = P.cutout(256, 384, (ctx, w, h) => P.drawTree(ctx, w, h, { type: s.type ?? 'dead', trunk: s.trunk ?? '#4a3428', leaf: s.leaf ?? '#6d7a3c', seed: s.seed ?? 1 }));
    standeeMesh(world, c, s.size * 0.66, s.size, x, 0.25, z, rot, { tilt: -Math.PI / 2 + 0.1, brace: false });
    return;
  }
  const ppm = Math.min(48, 1000 / Math.max(s.w, s.h));
  const c = P.cutout(s.w * ppm + 16, s.h * ppm + 16, (ctx, w, h) => STANDEE_DRAW[s.kind](ctx, w, h, { ...s, ppm }), { border: 4 });
  standeeMesh(world, c, s.w + 16 / ppm, s.h + 16 / ppm, x, 0, z, rot, { tilt: s.tilt ?? 0, collide: true, ground });
}

// ---------- Billboard layers ----------

function buildNature(world, scene, ground, R) {
  const t = scene.trees;
  const kinds = t.kinds;
  const treeAtlas = new Atlas(256, 384, kinds.length);
  const cells = kinds.map((k, i) => treeAtlas.add((c, w, h) => P.drawTree(c, w, h, { ...k, seed: i + 5 }), { border: 6 }));
  const trees = new Billboards(treeAtlas);
  const place = (x, z, i) => {
    const k = kinds[i % kinds.length], h = t.height[0] + R() * (t.height[1] - t.height[0]);
    trees.add({ front: cells[i % kinds.length], x, z, w: h * 0.667 * (k.wide ?? 1), h: h * (k.tall ?? 1), facing: 0, tint: 0.85 + R() * 0.2, warm: 0.97 });
  };
  for (let i = 0, n = 0; n < t.count && i < t.count * 30; i++) {
    const a = R() * Math.PI * 2, r = t.radius[0] + Math.sqrt(R()) * (t.radius[1] - t.radius[0]);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (ground.blocked(x, z, 3)) continue;
    place(x, z, Math.floor(R() * 1000));
    n++;
  }
  trees.build(world);

  const rk = scene.rocks;
  const rockAtlas = new Atlas(128, 128, rk.colors.length * 2);
  const rockCells = [];
  rk.colors.forEach((color, i) => { for (let s = 0; s < 2; s++) rockCells.push(rockAtlas.add((c, w, h) => P.drawRock(c, w, h, { color, seed: i * 3 + s + 1 }), { border: 4 })); });
  const rocks = new Billboards(rockAtlas, { shadow: true });
  const addRock = (x, z, size) => {
    if (ground.blocked(x, z, 0.2)) return;
    rocks.add({ front: rockCells[Math.floor(R() * rockCells.length)], x, y: -0.05, z, w: size, h: size, facing: 0, tint: 0.85 + R() * 0.25 });
  };
  for (let i = 0; i < rk.count; i++) {
    const a = R() * Math.PI * 2, r = rk.radius[0] + R() * (rk.radius[1] - rk.radius[0]);
    addRock(Math.cos(a) * r, Math.sin(a) * r, rk.size[0] + R() ** 2 * (rk.size[1] - rk.size[0]));
  }
  for (const s of scene.standees) for (let i = 0; i < (s.rubble ?? 0); i++) {
    const rot = s.rot ?? 0, along = (R() - 0.5) * (s.w ?? 4) * 1.2, out = (R() < 0.5 ? -1 : 1) * (0.6 + R() * 2.5);
    addRock(s.at[0] + Math.cos(rot) * along + Math.sin(rot) * out, s.at[1] - Math.sin(rot) * along + Math.cos(rot) * out, 0.3 + R() * 0.8);
  }
  rocks.build(world);
  return [trees, rocks];
}

function personVariants(cfg, R) {
  const pal = cfg.palette, pick = (a) => a[Math.floor(R() * a.length)];
  const out = [];
  for (const t of cfg.types) for (let i = 0; i < t.variants; i++) {
    const kid = t.kind === 'child', elder = t.kind === 'elder';
    const p = { kind: elder ? 'man' : t.kind, pose: t.pose, robe: pick(kid ? pal.childRobes : pal.robes), sash: pick(pal.sashes), skin: pick(pal.skins), hair: elder ? pick(pal.greyHair) : pick(pal.hair) };
    if (t.kind === 'woman' || (kid && R() < 0.35)) { p.head = R() < 0.75 ? 'shawl' : 'hair'; p.shawl = pick(pal.shawls); }
    if ((t.kind === 'man' || elder) && R() < 0.6) p.beard = p.hair;
    if (!kid && !p.head && R() < 0.4) p.band = pick(pal.sashes);
    if (!kid && R() < 0.7) { p.cloak = pick(pal.cloaks); p.cloakStyle = R() < 0.5 ? 'cape' : 'drape'; }
    const kneel = t.pose === 'kneel';
    const h = kid ? (kneel ? 0.8 : 1.2) : kneel ? 1.15 : t.kind === 'woman' ? 1.64 : 1.74;
    out.push({ p, h, kid, kneel, weight: t.weight / t.variants });
  }
  return out;
}

function buildCrowd(scene, ground, R) {
  const cfg = scene.crowd;
  const variants = personVariants(cfg, R);
  const atlas = new Atlas(128, 256, variants.length * 2 + 2);
  for (const v of variants) {
    v.front = atlas.add((c, w, h) => P.drawPerson(c, w, h, v.p, false), { border: 5 });
    v.back = atlas.add((c, w, h) => P.drawPerson(c, w, h, v.p, true), { border: 5 });
  }
  const layer = new Billboards(atlas);
  const choose = (filter) => {
    const pool = variants.filter(filter), sum = pool.reduce((s, v) => s + v.weight, 0);
    let x = R() * sum;
    for (const v of pool) if ((x -= v.weight) <= 0) return v;
    return pool[0];
  };
  const add = (v, x, z, fx, fz, y = 0) => {
    const k = 0.94 + R() * 0.12;
    layer.add({ front: v.front, back: v.back, x, y: y - 0.02, z, w: v.h * 0.5 * k, h: v.h * k, facing: Math.atan2(fx - x, fz - z) + (R() - 0.5) * 0.4, tint: 0.86 + R() * 0.16, warm: 0.98 + R() * 0.04 });
  };

  const [fx, fz] = cfg.focus, [a0, a1] = cfg.arc;
  let placed = 0;
  for (let r = cfg.minRadius; placed < cfg.count && r < 300; r += cfg.spacing) {
    const n = Math.floor(((a1 - a0) * r) / (cfg.spacing * 0.9));
    for (let i = 0; i < n && placed < cfg.count; i++) {
      const a = a0 + ((i + 0.5 + (R() - 0.5) * 0.6) / n) * (a1 - a0), rr = r + (R() - 0.5) * cfg.spacing * 0.7;
      const x = fx + Math.sin(a) * rr, z = fz + Math.cos(a) * rr;
      if (Math.abs(x - fx) < cfg.aisle / 2 && z > fz) continue;
      if (ground.blocked(x, z, 0.4) || cfg.avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
      const nearFront = rr < cfg.minRadius + 5;
      const v = choose((v) => (R() < cfg.kneel * (nearFront ? 2.5 : 1) ? v.kneel : !v.kneel));
      add(v, x, z, fx, fz);
      placed++;
    }
  }
  const ch = scene.christ;
  const [cx, cz] = ch.at, cy = ground.heightAt(cx, cz);
  for (let i = 0; i < ch.children.count; i++) {
    const a = (i / ch.children.count) * Math.PI * 2 + 0.2, r = ch.children.radius + (i % 2) * 0.8;
    const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r * 0.85;
    add(choose((v) => v.kid && (i % 4 === 0) === v.kneel), x, z, cx, cz, ground.heightAt(x, z));
  }
  return layer;
}

// ---------- Christ, light, children ----------

function buildChrist(world, ch, ground) {
  const [x, z] = ch.at, y = ground.heightAt(x, z);
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const fig = new THREE.Mesh(cardGeometry(ch.height / 2, ch.height), new THREE.MeshBasicMaterial({ map: makeTex(P.cutout(256, 512, P.drawChrist, { border: 8, edge: '#fff3c9' })), alphaTest: 0.5 }));
  fig.castShadow = true;
  const burst = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: makeTex(P.cutout(512, 512, (c, w, h) => P.drawSunburst(c, w, h, ch.sunburst), { border: 8, edge: ch.sunburst.edge })), alphaTest: 0.5, transparent: true, opacity: 0.92 }));
  burst.scale.setScalar(ch.burst);
  burst.position.set(0, ch.height * 0.62, -0.3);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeTex(drawn(256, 256, P.drawGlow, { color: '255,240,200' })), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
  glow.scale.setScalar(ch.burst * 1.8);
  glow.position.y = ch.height * 0.6;
  group.add(burst, fig, glow);
  world.add(group);

  const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: makeTex(drawn(256, 256, P.drawGlow, { inner: 0.82, color: '255,236,180' })), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  ring.scale.set((ch.children.radius + 1.6) * 2, 1, (ch.children.radius + 1.6) * 1.75);
  ring.position.set(x, y + 0.03, z);
  world.add(ring);

  const H = ch.beam.height;
  const beamGeo = new THREE.CylinderGeometry(ch.beam.top, ch.beam.bottom, H, 48, 1, true).translate(0, H / 2, 0);
  const beam = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(ch.beam.color) }, uH: { value: H }, uT: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY; uniform float uH;
      void main(){ vY = position.y / uH; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; varying float vY; uniform vec3 uColor; uniform float uT;
      void main(){ float edge = pow(abs(dot(vN, vV)), 2.5);
        float a = edge * smoothstep(0., 0.04, vY) * (0.045 + 0.07 * vY) * (0.9 + 0.1 * sin(uT * 1.5 + vY * 10.));
        gl_FragColor = vec4(uColor * a, 1.);
        #include <colorspace_fragment>
      }`,
  }));
  beam.position.set(x, y, z);
  world.add(beam);

  const N = 160, pos = new Float32Array(N * 3), speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * ch.beam.bottom;
    pos.set([x + Math.cos(a) * r, y + Math.random() * 22, z + Math.sin(a) * r], i * 3);
    speed[i] = 0.4 + Math.random() * 0.8;
  }
  const motesGeo = new THREE.BufferGeometry();
  motesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(motesGeo, new THREE.PointsMaterial({ size: 0.16, map: makeTex(drawn(64, 64, P.drawGlow, { color: '255,246,214' })), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  world.add(motes);

  return (t, dt, camera) => {
    group.rotation.y = Math.atan2(camera.position.x - x, camera.position.z - z);
    burst.rotation.z = t * 0.05;
    glow.material.opacity = 0.32 + Math.sin(t * 1.3) * 0.08;
    beam.material.uniforms.uT.value = t;
    for (let i = 0; i < N; i++) {
      pos[i * 3 + 1] -= speed[i] * dt;
      if (pos[i * 3 + 1] < y) pos[i * 3 + 1] = y + 22;
    }
    motesGeo.attributes.position.needsUpdate = true;
  };
}

// ---------- Smoldering fires ----------

let fireTex;
function buildFire(world, f, R) {
  fireTex ??= {
    flames: [1, 2].map((seed) => makeTex(P.cutout(128, 256, (c, w, h) => P.drawFlame(c, w, h, { seed }), { border: 4, edge: '#ffe9a8', lift: false }))),
    puffs: [1, 2, 3].map((seed) => makeTex(P.cutout(128, 128, (c, w, h) => P.drawPuff(c, w, h, { color: '#6f6762', seed }), { border: 4, edge: '#b5aca2' }))),
    scorch: makeTex(P.cutout(256, 256, (c, w, h) => P.drawScorch(c, w, h, { seed: 9 }), { border: 3, edge: '#6b5a48' })),
  };
  const [x, z] = f.at, s = f.size;
  decal(world, fireTex.scorch, s * 3, s * 3, x, z, R() * 6, 4);
  const flames = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(cardGeometry(s * 0.7, s * 1.4), new THREE.MeshBasicMaterial({ map: fireTex.flames[i % 2], alphaTest: 0.5 }));
    m.position.set(x + (R() - 0.5) * s * 0.8, 0, z + (R() - 0.5) * s * 0.8);
    m.userData.k = 0.6 + R() * 0.5;
    world.add(m);
    flames.push(m);
  }
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex.puffs[i % 3], transparent: true, depthWrite: false }));
    sp.userData = { phase: i / 9, drift: (R() - 0.5) * 2 };
    world.add(sp);
    puffs.push(sp);
  }
  return (t, dt, camera) => {
    for (const m of flames) {
      m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z);
      m.scale.set(1, m.userData.k * (0.8 + 0.25 * Math.sin(t * 9 + m.userData.k * 20) + 0.1 * Math.sin(t * 23)), 1);
    }
    for (const p of puffs) {
      const u = (t * 0.08 * f.smoke + p.userData.phase) % 1;
      p.position.set(x + p.userData.drift * u * 4 + u * 3, s * 0.8 + u * 14, z + u * 2);
      p.scale.setScalar(s * (1 + u * 3.5));
      p.material.opacity = Math.min(1, u * 8) * Math.min(1, (1 - u) * 2.5) * 0.95;
    }
  };
}

// ---------- Player ----------

function buildAvatar(world, cfg) {
  const front = makeTex(P.cutout(128, 256, (c, w, h) => P.drawPerson(c, w, h, cfg.look, false), { border: 5 }));
  const back = makeTex(P.cutout(128, 256, (c, w, h) => P.drawPerson(c, w, h, cfg.look, true), { border: 5 }));
  const mat = new THREE.MeshLambertMaterial({ map: back, alphaTest: 0.5, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(cardGeometry(0.87, 1.74), mat);
  mesh.castShadow = true;
  world.add(mesh);
  let step = 0;
  return (w, camera, t) => {
    if (w.moving) step += 0.16;
    const dx = camera.position.x - w.x, dz = camera.position.z - w.z;
    mesh.position.set(w.x, w.y + (w.moving ? Math.abs(Math.sin(step)) * 0.08 : 0), w.z);
    mesh.rotation.set(0, Math.atan2(dx, dz), w.moving ? Math.sin(step) * 0.07 : 0, 'YXZ');
    mat.map = Math.sin(w.facing) * dx + Math.cos(w.facing) * dz < 0 ? back : front;
  };
}
