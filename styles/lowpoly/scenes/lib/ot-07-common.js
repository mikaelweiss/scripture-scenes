// Shared props for the Genesis patriarch scenes (ot-07 to ot-12): tents, flocks, camels, fire, stars, angels.
import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

// Places local-space parts (facing +z) around an anchor rotated by `rot`, into a batch.
export function kit(ctx, x, z, rot = 0, y = ctx.heightAt(x, z)) {
  const world = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(1, 1, 1));
  const add = (geo, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], color = '#888', jitter = 0.05, batch = ctx.solid } = {}) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    tmpE.set(r[0], r[1], r[2], 'YXZ');
    tmpM.compose(new THREE.Vector3(...p), tmpQ.setFromEuler(tmpE), new THREE.Vector3(...s));
    g.applyMatrix4(tmpM).applyMatrix4(world);
    batch.add(g, { color, jitter, shade: darkenBottom });
  };
  const box = (w, h, d, opts) => add(new THREE.BoxGeometry(w, h, d), opts);
  const at = (lx, lz) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    return [x + lx * c + lz * s, z - lx * s + lz * c];
  };
  return { add, box, at, y };
}

// A rod between two local points.
function rod(k, a, b, thick, color, round = false) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const geo = round ? new THREE.CylinderGeometry(thick / 2, thick / 2, len, 5) : new THREE.BoxGeometry(thick, len, thick);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.acos(Math.max(-1, Math.min(1, dy / len)));
  k.add(geo, { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], r: [pitch, yaw, 0], color });
}

// Black goat-hair tent: low ridged roof on poles, closed back and sides, open front.
export function tent(ctx, { x, z, rot = 0, w = 8, d = 5, h = 2.4, color = '#2e2622', stripe = '#5a4636', open = true, rugs = true }) {
  const k = kit(ctx, x, z, rot, lowest(ctx, x, z, w, d, rot) - 0.05);
  const back = 0.9, front = h * 0.82;
  const slab = (z0, y0, z1, y1) => {
    const len = Math.hypot(z1 - z0, y1 - y0);
    k.box(w + 0.4, 0.08, len + 0.15, { p: [0, (y0 + y1) / 2, (z0 + z1) / 2], r: [-Math.atan2(y1 - y0, z1 - z0), 0, 0], color });
  };
  slab(-d / 2, back, 0, h);
  slab(0, h, d / 2, front);
  for (let i = -2; i <= 2; i++) k.box(0.2, 0.09, d * 0.5, { p: [i * w * 0.22, (back + h) / 2 + 0.07, -d * 0.25], r: [-Math.atan2(h - back, d / 2), 0, 0], color: stripe });
  k.box(w, back, 0.08, { p: [0, back / 2, -d / 2], color });
  for (const sx of [-1, 1]) {
    const prof = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(open ? d * 0.05 : d / 2, 0), new THREE.Vector2(open ? d * 0.05 : d / 2, open ? h * 0.95 : front), new THREE.Vector2(0, h), new THREE.Vector2(-d / 2, back)]);
    const g = new THREE.ExtrudeGeometry(prof, { depth: 0.08, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    k.add(g, { p: [sx * w / 2 + 0.04, 0, 0], color });
  }
  for (const px of [-w / 2 + 0.2, 0, w / 2 - 0.2]) {
    rod(k, [px, 0, 0], [px, h, 0], 0.1, '#5b4430', true);
    rod(k, [px, 0, d / 2], [px, front, d / 2], 0.09, '#5b4430', true);
    rod(k, [px, front, d / 2], [px * 1.05, 0, d / 2 + 1.2], 0.03, '#a89070');
  }
  if (rugs) {
    k.box(w * 0.6, 0.04, d * 0.5, { p: [0, 0.03, -d * 0.1], color: '#8a3a2a' });
    k.box(w * 0.4, 0.05, d * 0.3, { p: [-w * 0.15, 0.05, -d * 0.12], color: '#c08a3a' });
    for (let i = 0; i < 3; i++) k.add(new THREE.CylinderGeometry(0.25, 0.32, 0.6, 7), { p: [w / 2 - 0.6 - i * 0.6, 0.3, -d / 2 + 0.5], color: '#9c6a44' });
  }
  const wc = ctx.colliders;
  const [bx, bz] = k.at(0, -d / 2);
  wc.add({ x: bx, z: bz, w, d: 0.3, rot, bottom: k.y, top: k.y + 2 });
  for (const sx of [-1, 1]) {
    const [cx, cz] = k.at(sx * w / 2, -d / 4);
    wc.add({ x: cx, z: cz, w: 0.3, d: d / 2, rot, bottom: k.y, top: k.y + 2 });
  }
  return k;
}

function lowest(ctx, x, z, w, d, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  let h = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) h = Math.min(h, ctx.heightAt(x + lx * c + lz * s, z - lx * s + lz * c));
  return h;
}

// Sheep or goat. kind: 'sheep' | 'goat' | 'ram'. pose: 'stand' | 'graze' | 'lie'.
export function sheep(ctx, { x, z, rot = 0, kind = 'sheep', pose = 'stand', wool, scale = 1 }) {
  const r = ctx.rand;
  const k = kit(ctx, x, z, rot, ctx.heightAt(x, z) - 0.03);
  const s = scale * (kind === 'goat' ? 0.85 : 1);
  const coat = wool ?? (kind === 'goat' ? r.pick(['#2a2420', '#4a3a2e', '#6b5440', '#1f1b19']) : kind === 'ram' ? '#ddd2bb' : r.pick(['#e9e1cf', '#ddd3bd', '#efe8d8', '#d6c9ae', '#5a4a3c']));
  const face = kind === 'goat' ? coat : r.pick(['#3a302a', '#2a2420', '#c9b89c']);
  const by = pose === 'lie' ? 0.32 : 0.62;
  k.add(new THREE.IcosahedronGeometry(0.5, 0), { p: [0, by * s, 0], s: [0.72 * s, 0.6 * s, (kind === 'goat' ? 0.9 : 1) * s], color: coat, jitter: 0.06 });
  const hy = pose === 'graze' ? 0.3 : pose === 'lie' ? 0.55 : 0.82;
  const hz = pose === 'graze' ? 0.6 : 0.55;
  k.box(0.22 * s, 0.26 * s, 0.34 * s, { p: [0, hy * s, hz * s], r: [pose === 'graze' ? 0.9 : 0.35, 0, 0], color: face });
  for (const sx of [-1, 1]) k.box(0.16 * s, 0.05 * s, 0.08 * s, { p: [sx * 0.15 * s, (hy + 0.08) * s, (hz - 0.08) * s], r: [0, 0, sx * 0.4], color: face });
  if (pose !== 'lie') for (const [lx, lz] of [[-0.17, 0.28], [0.17, 0.28], [-0.17, -0.28], [0.17, -0.28]]) k.box(0.08 * s, 0.42 * s, 0.08 * s, { p: [lx * s, 0.21 * s, lz * s], color: '#2e2620' });
  if (kind === 'goat') for (const sx of [-1, 1]) rod(k, [sx * 0.06 * s, (hy + 0.12) * s, (hz - 0.05) * s], [sx * 0.1 * s, (hy + 0.35) * s, (hz - 0.25) * s], 0.04 * s, '#cfc2a8');
  if (kind === 'ram') {
    for (const sx of [-1, 1]) {
      const horn = new THREE.TorusGeometry(0.12, 0.045, 4, 8, Math.PI * 1.6);
      k.add(horn, { p: [sx * 0.15 * s, (hy + 0.05) * s, (hz - 0.08) * s], r: [0, Math.PI / 2, 0.6], s: [s, s, s], color: '#b8a582' });
    }
  }
}

export function flock(ctx, { x, z, r = 6, count = 20, kind = 'sheep', goats = 0.25, seed }) {
  const rand = ctx.rand;
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
    sheep(ctx, { x: x + Math.cos(a) * d, z: z + Math.sin(a) * d, rot: rand() * Math.PI * 2, kind: rand() < goats ? 'goat' : kind, pose: rand.pick(['stand', 'graze', 'graze', 'lie']) });
  }
}

// Dromedary camel, standing or kneeling, optionally saddled with a blanket and packs.
export function camel(ctx, { x, z, rot = 0, kneel = false, color = '#c39a6b', blanket = null, packs = false }) {
  const k = kit(ctx, x, z, rot, ctx.heightAt(x, z) - 0.05);
  const dark = new THREE.Color(color).multiplyScalar(0.7).getStyle();
  const by = kneel ? 0.78 : 1.6;
  k.add(new THREE.IcosahedronGeometry(1, 0), { p: [0, by, 0], s: [0.48, 0.45, 0.95], color, jitter: 0.04 });
  k.add(new THREE.IcosahedronGeometry(1, 0), { p: [0, by + 0.42, -0.05], s: [0.36, 0.4, 0.45], color, jitter: 0.04 });
  const neckA = [0, by + 0.05, 0.8], neckB = [0, by + 0.75, 1.3];
  rod(k, neckA, neckB, 0.26, color);
  k.box(0.22, 0.24, 0.55, { p: [0, by + 0.82, 1.5], r: [0.15, 0, 0], color });
  for (const sx of [-1, 1]) k.box(0.05, 0.12, 0.05, { p: [sx * 0.08, by + 0.98, 1.35], color: dark });
  rod(k, [0, by + 0.1, -0.92], [0, by - 0.45, -1.02], 0.06, dark);
  if (kneel) {
    for (const sx of [-1, 1]) {
      k.box(0.18, 0.2, 1.0, { p: [sx * 0.42, 0.12, 0.45], color: dark });
      k.box(0.2, 0.22, 0.9, { p: [sx * 0.4, 0.13, -0.55], color: dark });
    }
    k.box(0.75, 0.3, 1.6, { p: [0, 0.2, 0], color });
  } else {
    for (const [lx, lz] of [[-0.25, 0.6], [0.25, 0.6], [-0.25, -0.6], [0.25, -0.6]]) {
      k.box(0.15, 0.75, 0.15, { p: [lx, by - 0.45 - 0.2, lz], color });
      k.box(0.12, 0.7, 0.12, { p: [lx, 0.35, lz], color: dark });
    }
  }
  if (blanket) {
    k.add(new THREE.IcosahedronGeometry(1, 0), { p: [0, by + 0.28, -0.05], s: [0.52, 0.32, 0.6], color: blanket, jitter: 0.08 });
    k.box(1.05, 0.08, 0.15, { p: [0, by + 0.08, 0.2], color: '#e0b04a' });
  }
  if (packs) for (const sx of [-1, 1]) k.box(0.3, 0.5, 0.7, { p: [sx * 0.6, by + 0.1, -0.1], r: [0, 0, sx * 0.15], color: sx > 0 ? '#7a5a3a' : '#9a7a50' });
  const [cx, cz] = k.at(0, 0.2);
  ctx.colliders.add({ x: cx, z: cz, w: 1.1, d: 2.6, rot, bottom: k.y, top: k.y + (kneel ? 1.2 : 2.2) });
}

export function donkey(ctx, { x, z, rot = 0, color = '#857c72', load = true }) {
  const k = kit(ctx, x, z, rot, ctx.heightAt(x, z) - 0.03);
  k.add(new THREE.IcosahedronGeometry(1, 0), { p: [0, 0.95, 0], s: [0.32, 0.32, 0.65], color });
  rod(k, [0, 1.0, 0.5], [0, 1.35, 0.8], 0.2, color);
  k.box(0.18, 0.2, 0.45, { p: [0, 1.32, 0.95], r: [0.5, 0, 0], color });
  for (const sx of [-1, 1]) k.box(0.05, 0.3, 0.08, { p: [sx * 0.07, 1.6, 0.8], r: [0, 0, sx * 0.2], color: '#4a443e' });
  for (const [lx, lz] of [[-0.14, 0.4], [0.14, 0.4], [-0.14, -0.4], [0.14, -0.4]]) k.box(0.09, 0.75, 0.09, { p: [lx, 0.38, lz], color: '#4a443e' });
  if (load) for (const sx of [-1, 1]) rod(k, [sx * 0.35, 1.0, -0.4], [sx * 0.35, 1.0, 0.4], 0.12, '#6a4a2a', true);
}

// Dense bramble the ram is caught in.
export function thicket(ctx, { x, z, r = 1.6, color = '#4b5a2e' }) {
  const rand = ctx.rand;
  const k = kit(ctx, x, z, 0, ctx.heightAt(x, z) - 0.1);
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2, d = rand() * r;
    k.add(new THREE.IcosahedronGeometry(rand.range(0.45, 0.8), 0), { p: [Math.cos(a) * d, rand.range(0.4, 1.1), Math.sin(a) * d], s: [1, rand.range(0.6, 0.9), 1], r: [rand() * 3, rand() * 3, 0], color, jitter: 0.12 });
  }
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    rod(k, [Math.cos(a) * 0.3, 0.1, Math.sin(a) * 0.3], [Math.cos(a) * r * 1.2, rand.range(0.8, 1.8), Math.sin(a) * r * 1.2], 0.05, '#4a3626');
  }
  ctx.colliders.add({ x, z, w: r * 1.6, d: r * 1.6, bottom: k.y, top: k.y + 1.2 });
}

// Campfire with flickering flames, embers, and a warm point light.
export function campfire(ctx, { x, z, size = 1, light = 40, distance = 22, stones = true, smoke = false }) {
  const { THREE: T, scene, rand } = ctx;
  const y = ctx.heightAt(x, z);
  const k = kit(ctx, x, z, 0, y);
  if (stones) for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    k.add(new T.DodecahedronGeometry(0.2 * size, 0), { p: [Math.cos(a) * 0.65 * size, 0.08, Math.sin(a) * 0.65 * size], s: [1, 0.7, 1], color: '#6a625a' });
  }
  for (let i = 0; i < 4; i++) rod(k, [Math.cos(i * 1.6) * 0.5 * size, 0.05, Math.sin(i * 1.6) * 0.5 * size], [0, 0.35 * size, 0], 0.12 * size, '#3a2a1e', true);
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2, d = rand() * 0.35 * size;
    k.add(new T.OctahedronGeometry(0.1 * size, 0), { p: [Math.cos(a) * d, 0.06, Math.sin(a) * d], color: rand.pick(['#ff6a1a', '#ffa040']), batch: ctx.glow });
  }
  const flames = [];
  const mats = ['#ff5a14', '#ff9a2a', '#ffd870'].map((c) => new T.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: 0.92 }));
  for (let i = 0; i < 5; i++) {
    const layer = i % 3;
    const g = new T.ConeGeometry((0.32 - layer * 0.08) * size, (1.0 - layer * 0.2) * size, 5);
    g.translate(0, (0.5 - layer * 0.1) * size, 0);
    const m = new T.Mesh(g, mats[layer]);
    const a = i * 2.1;
    m.position.set(x + Math.cos(a) * 0.12 * size * (i > 2 ? 1 : 0.3), y + 0.12, z + Math.sin(a) * 0.12 * size * (i > 2 ? 1 : 0.3));
    m.userData.ph = rand() * 10;
    scene.add(m);
    flames.push(m);
  }
  const pl = new T.PointLight('#ff9a4a', light, distance, 1.6);
  pl.position.set(x, y + 1.2 * size, z);
  scene.add(pl);
  ctx.onFrame((t) => {
    for (const f of flames) {
      const p = f.userData.ph;
      f.scale.set(1 + 0.15 * Math.sin(t * 9 + p), 0.8 + 0.35 * Math.abs(Math.sin(t * 6.3 + p * 2)), 1 + 0.15 * Math.cos(t * 8 + p));
      f.rotation.y = t * 0.8 + p;
    }
    pl.intensity = light * (0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 7.3));
  });
  if (smoke) ctx.effects.smoke({ position: [x, y + 1.2 * size, z], count: 6, height: 9 * size, size: 0.35 * size, color: '#4a4440', wind: [0.3, 0.1], seed: Math.floor(rand() * 1e5) });
  ctx.colliders.add({ x, z, w: 1.4 * size, d: 1.4 * size, bottom: y, top: y + 0.3 });
}

// Star field with a Milky Way band, kept centered on the camera like the sky dome.
export function stars(ctx, { count = 3200, band = 3800, radius = 1300, tilt = 0.5, seed = 7, brightness = 1 }) {
  const { THREE: T } = ctx;
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pos = [], size = [], col = [];
  const tints = [[1, 1, 1], [0.8, 0.88, 1], [1, 0.92, 0.8], [1, 0.85, 0.7]];
  const push = (v, sz) => {
    pos.push(v.x * radius, v.y * radius, v.z * radius);
    size.push(sz);
    const c = tints[Math.floor(rand() * tints.length)];
    const b = brightness * (0.5 + rand() * 0.5);
    col.push(c[0] * b, c[1] * b, c[2] * b);
  };
  const v = new T.Vector3();
  for (let i = 0; i < count; i++) {
    v.set(rand() * 2 - 1, rand() * 1.05 - 0.05, rand() * 2 - 1).normalize();
    const big = rand();
    push(v, big > 0.985 ? 5.5 : big > 0.92 ? 3.6 : 2.0 + rand());
  }
  const axis = new T.Vector3(Math.sin(tilt), Math.cos(tilt), 0.25).normalize();
  const u = new T.Vector3(0, 0, 1).cross(axis).normalize(), w = axis.clone().cross(u);
  for (let i = 0; i < band; i++) {
    const a = rand() * Math.PI * 2;
    const off = (rand() + rand() + rand() - 1.5) * 0.16;
    v.copy(u).multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a)).addScaledVector(axis, off).normalize();
    if (v.y < -0.05) continue;
    push(v, 1.4 + rand() * 1.4);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute('size', new T.Float32BufferAttribute(size, 1));
  geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
  const mat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, toneMapped: false,
    uniforms: { uTime: { value: 0 }, uScale: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; uniform float uTime, uScale;
      void main() { vC = color * (0.8 + 0.2 * sin(uTime * 2.0 + position.x * 0.13 + position.z * 0.07));
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; gl_PointSize = size * uScale; }`,
    fragmentShader: `varying vec3 vC; void main() { float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2); gl_FragColor = vec4(vC * a * 1.6, 1.0); }`,
  });
  const pts = new T.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = -8;
  ctx.scene.add(pts);
  const bandGlow = new T.Mesh(
    new T.SphereGeometry(radius * 1.02, 48, 24),
    new T.ShaderMaterial({
      side: T.BackSide, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, toneMapped: false,
      uniforms: { uAxis: { value: axis }, uColor: { value: new T.Color('#3a4a88') }, uK: { value: 0.32 * brightness } },
      vertexShader: `varying vec3 vD; void main() { vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
      fragmentShader: `uniform vec3 uAxis, uColor; uniform float uK; varying vec3 vD;
        void main() { float d = dot(normalize(vD), uAxis); float a = exp(-d * d / 0.012) * smoothstep(-0.05, 0.25, vD.y);
          float clump = 0.75 + 0.25 * sin(vD.x * 23.0) * sin(vD.z * 17.0 + vD.y * 11.0);
          gl_FragColor = vec4(uColor * a * clump * uK, 1.0); }`,
    }),
  );
  bandGlow.renderOrder = -9;
  bandGlow.frustumCulled = false;
  ctx.scene.add(bandGlow);
  ctx.onFrame((t, dt, camera) => {
    mat.uniforms.uTime.value = t;
    pts.position.copy(camera.position);
    bandGlow.position.copy(camera.position);
  });
}

// A person built from the crowd parts. pose: 'stand' | 'kneel' | 'lie' | 'run' | 'bow'.
export function person(ctx, { x, z, y, face, pose = 'stand', scale = 1, collide = true, ...look }) {
  const ground = y ?? ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });
  const g = createFigure({ x, y: ground, z, face, scale, ...look });
  g.rotation.order = 'YXZ';
  if (pose === 'kneel') g.position.y -= 0.48 * scale;
  if (pose === 'run') {
    g.rotation.x = 0.26;
    g.position.y -= 0.06;
  }
  if (pose === 'bow') {
    g.rotation.x = 0.4;
    g.position.y -= 0.12 * scale;
  }
  if (pose === 'lie') {
    g.rotation.x = -Math.PI / 2;
    g.position.y += 0.26 * scale;
  }
  ctx.scene.add(g);
  if (collide && pose !== 'lie') ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: ground, top: ground + 1.8 * scale });
  return g;
}

// Faceless being of light in white, with halo and soft light.
export function angel(ctx, { x, z, y, face, scale = 1.05, arms = 'down', glow = 0.6, light = 0, halo = 4, float = 0, collide = false }) {
  const g = person(ctx, { x, z, y, face, scale, arms, collide, robe: '#fdfaf2', mantle: '#f6f0e2', skin: '#f2e6d0', emissive: glow });
  const base = g.position.y;
  if (halo) ctx.effects.halo({ position: [x, base + 1.3 * scale, z], size: halo, opacity: 0.55, color: '#fff3d6' });
  if (light) {
    const pl = new THREE.PointLight('#fff0cf', light, 20, 1.4);
    pl.position.set(x, base + 2, z);
    ctx.scene.add(pl);
  }
  if (float) ctx.onFrame((t) => (g.position.y = base + Math.sin(t * 0.8 + x) * float));
  return g;
}

// Low rough-stone altar with split wood laid on top.
export function altar(ctx, { x, z, rot = 0, w = 2.0, d = 1.2, h = 0.95, color = '#9a8e7e', wood = true }) {
  const rand = ctx.rand;
  const k = kit(ctx, x, z, rot, lowest(ctx, x, z, w, d, rot) - 0.05);
  const rows = 3;
  for (let row = 0; row < rows; row++) {
    const yy = (row + 0.5) * (h / rows);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      k.add(new THREE.DodecahedronGeometry(1, 0), { p: [-w / 2 + (i + 0.5) * (w / 4) + rand.range(-0.05, 0.05), yy, -d / 2 + (j + 0.5) * (d / 2)], s: [w / 7, h / rows / 1.7, d / 3.4], r: [rand.range(-0.2, 0.2), rand() * 3, 0], color, jitter: 0.1 });
    }
  }
  k.box(w * 0.98, 0.12, d * 0.95, { p: [0, h, 0], color: new THREE.Color(color).multiplyScalar(0.9).getStyle() });
  if (wood) for (let i = 0; i < 7; i++) rod(k, [-w * 0.42, h + 0.12 + (i % 2) * 0.1, -d * 0.4 + i * d * 0.13], [w * 0.42, h + 0.12 + (i % 2) * 0.1, -d * 0.38 + i * d * 0.13 + rand.range(-0.05, 0.05)], 0.11, i % 2 ? '#6e5236' : '#5a4230', true);
  const [cx, cz] = k.at(0, 0);
  ctx.colliders.add({ x: cx, z: cz, w, d, rot, bottom: k.y, top: k.y + h + 0.2 });
  return k.y + h + 0.2;
}

// Flat-roofed mudbrick house with a dark doorway and parapet.
export function house(ctx, { x, z, rot = 0, w = 6, d = 5, h = 3, color = '#c4a47a', door = true }) {
  const k = kit(ctx, x, z, rot, lowest(ctx, x, z, w, d, rot) - 0.2);
  k.box(w, h, d, { p: [0, h / 2, 0], color, jitter: 0.04 });
  k.box(w + 0.2, 0.25, d + 0.2, { p: [0, h + 0.05, 0], color: new THREE.Color(color).multiplyScalar(0.85).getStyle() });
  for (const [px, pz, pw, pd] of [[0, d / 2, w, 0.2], [0, -d / 2, w, 0.2], [w / 2, 0, 0.2, d], [-w / 2, 0, 0.2, d]]) k.box(pw, 0.45, pd, { p: [px, h + 0.4, pz], color });
  if (door) k.box(1.1, 1.9, 0.1, { p: [w * 0.15, 0.95, d / 2 + 0.01], color: '#2a1e16', jitter: 0 });
  k.box(0.6, 0.5, 0.1, { p: [-w * 0.25, h * 0.7, d / 2 + 0.01], color: '#2a1e16', jitter: 0 });
  const [cx, cz] = k.at(0, 0);
  ctx.colliders.add({ x: cx, z: cz, w, d, rot, bottom: k.y, top: k.y + h + 0.6 });
  return k;
}

// Round stone well with water, a lip, and a trough beside it.
export function well(ctx, { x, z, r = 1.3, h = 0.85, color = '#a8977c', trough = true, rot = 0 }) {
  const rand = ctx.rand;
  const k = kit(ctx, x, z, rot, ctx.heightAt(x, z) - 0.1);
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    for (let row = 0; row < 3; row++) {
      const aa = a + (row % 2) * (Math.PI / n);
      k.box(0.55, h / 3, 0.45, { p: [Math.cos(aa) * r, (row + 0.5) * (h / 3), Math.sin(aa) * r], r: [0, -aa + Math.PI / 2, 0], color, jitter: 0.1 });
    }
  }
  const water = new THREE.CircleGeometry(r - 0.2, 12).rotateX(-Math.PI / 2);
  k.add(water, { p: [0, h - 0.35, 0], color: '#2c4a5a', jitter: 0.02 });
  k.add(new THREE.CylinderGeometry(r + 0.32, r + 0.32, 0.12, 14, 1, true), { p: [0, h + 0.02, 0], color: '#8a7a62' });
  if (trough) {
    k.box(0.4, 0.55, 2.6, { p: [r + 1.4, 0.27, 0], color, jitter: 0.08 });
    k.box(0.9, 0.55, 0.3, { p: [r + 1.65, 0.27, 1.15], color });
    k.box(0.9, 0.55, 0.3, { p: [r + 1.65, 0.27, -1.15], color });
    k.box(0.4, 0.55, 2.6, { p: [r + 1.9, 0.27, 0], color, jitter: 0.08 });
    k.box(0.55, 0.05, 2.0, { p: [r + 1.65, 0.42, 0], color: '#3a5a66', jitter: 0.02 });
    const [tx, tz] = k.at(r + 1.65, 0);
    ctx.colliders.add({ x: tx, z: tz, w: 1.0, d: 2.6, rot, bottom: k.y, top: k.y + 0.6 });
  }
  ctx.colliders.add({ x, z, w: r * 2 + 0.6, d: r * 2 + 0.6, bottom: k.y, top: k.y + h + 0.1 });
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    k.add(new THREE.DodecahedronGeometry(0.18, 0), { p: [Math.cos(a) * (r + 0.6 + rand()), 0.05, Math.sin(a) * (r + 0.6 + rand())], color });
  }
}

// Clay water jar, carried or set down.
export function jar(ctx, { x, z, y, color = '#b0603a', scale = 1, tilt = 0 }) {
  const k = kit(ctx, x, z, 0, y ?? ctx.heightAt(x, z));
  k.add(new THREE.IcosahedronGeometry(0.22 * scale, 0), { p: [0, 0.22 * scale, 0], s: [1, 1.15, 1], r: [tilt, 0, 0], color });
  k.add(new THREE.CylinderGeometry(0.08 * scale, 0.11 * scale, 0.16 * scale, 6), { p: [0, 0.5 * scale, 0], r: [tilt, 0, 0], color });
}

export function rodBetween(ctx, a, b, thick, color, batch = ctx.solid) {
  const k = kit(ctx, 0, 0, 0, 0);
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  k.add(new THREE.BoxGeometry(thick, len, thick), { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], r: [Math.acos(dy / len), Math.atan2(dx, dz), 0], color, batch });
}

// Scattered low grass and scrub tufts to break up open ground.
export function tufts(ctx, { center = [0, 0], ring = [2, 40], count = 200, colors = ['#7d8440', '#6e7638', '#8f8a4a'], avoid = [] }) {
  const rand = ctx.rand;
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand.range(ring[0] ** 2, ring[1] ** 2));
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid.some((c) => Math.hypot(x - c[0], z - c[1]) < c[2])) continue;
    const k = kit(ctx, x, z, rand() * 6, ctx.heightAt(x, z) - 0.05);
    const color = rand.pick(colors);
    for (let j = 0; j < 4; j++) k.add(new THREE.ConeGeometry(0.06, rand.range(0.3, 0.6), 3), { p: [rand.range(-0.2, 0.2), 0.2, rand.range(-0.2, 0.2)], r: [rand.range(-0.4, 0.4), 0, rand.range(-0.4, 0.4)], color });
  }
}
