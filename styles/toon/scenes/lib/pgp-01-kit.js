import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { makeRng, between, pick } from '../../engine/util.js';
import { glowTexture } from '../../engine/textures.js';
import { makeFigure } from '../../engine/people.js';

export { THREE, FX_LAYER, makeRng, between, pick };

export const BASE_STYLE = {
  ink: '#2b1a12',
  toonSteps: [0.4, 0.72, 1.0],
  lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
  grain: 0.05,
  fog: { color: '#efd8ad', near: 120, far: 1100 },
  crack: '#3a2418',
  ember: '#c8502c',
  emberHot: '#ffb347',
  flameOuter: '#f08a2c',
  flameInner: '#ffe08a',
  charred: '#3a2a22',
  smoke: '#d8d0c8',
  smokeShade: '#4d4650',
};

export const ROBES = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020', '#6a6a6a'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const DIVINE = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#f6eee0', hair: '#fbf7ee', sash: '#efe0b8' };

export const unit = {
  sphere: new THREE.SphereGeometry(0.5, 12, 9),
  ico: new THREE.IcosahedronGeometry(0.5, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  cone: new THREE.ConeGeometry(0.5, 1, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
  rock: new THREE.DodecahedronGeometry(0.5, 0),
};

function clean(g) {
  const n = g.index ? g.toNonIndexed() : g.clone();
  for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
  if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
  return n;
}

// Collects geometry per color, then merges each color into one mesh.
export class Parts {
  constructor() {
    this.byColor = new Map();
  }

  add(color, geo, { pos = [0, 0, 0], rot = [0, 0, 0], scale } = {}) {
    const g = geo.clone();
    if (scale) g.scale(...(Array.isArray(scale) ? scale : [scale, scale, scale]));
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ')));
    g.translate(...pos);
    if (!this.byColor.has(color)) this.byColor.set(color, []);
    this.byColor.get(color).push(clean(g));
    return this;
  }

  box(color, [w, h, d], pos, rot) {
    return this.add(color, unit.box, { pos, rot, scale: [w, h, d] });
  }

  group(kit, { cast = true, receive = true, emissive } = {}) {
    const group = new THREE.Group();
    for (const [color, geos] of this.byColor) {
      const mat = kit.toon(color, emissive ? { emissive: new THREE.Color(color).multiplyScalar(emissive) } : {});
      const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      group.add(mesh);
    }
    return group;
  }
}

export const faceYaw = ([x, z], [tx, tz]) => Math.atan2(tx - x, tz - z);

export function figure(ctx, colors, [x, z], { facing, scale = 1, glow = 0, clear = 1.2, y, kneel = false } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow });
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.setScalar(scale);
  if (kneel) fig.scale.set(scale * 1.1, scale * 0.62, scale * 1.1);
  if (facing) fig.rotation.y = faceYaw([x, z], facing);
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

export function glow(ctx, [x, y, z], size, color, opacity = 0.7, pulse = 0.04) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3 + x) * pulse)));
  return s;
}

// A disc in the sky that follows the camera, ignoring fog and outlines.
export function skyDisc(ctx, dir, dist, size, color, { halo = 0, haloColor = color } = {}) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(dist);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 40), new THREE.MeshBasicMaterial({ color, fog: false, depthWrite: false }));
  disc.layers.set(FX_LAYER);
  disc.renderOrder = -900;
  ctx.scene.add(disc);
  let haloSprite;
  if (halo) {
    haloSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: haloColor, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8, fog: false }));
    haloSprite.scale.setScalar(size * halo);
    haloSprite.layers.set(FX_LAYER);
    haloSprite.renderOrder = -899;
    ctx.scene.add(haloSprite);
  }
  ctx.onFrame((t, dt, camera) => {
    disc.position.copy(camera.position).add(d);
    disc.lookAt(camera.position);
    if (haloSprite) haloSprite.position.copy(disc.position);
  });
  return disc;
}

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2.2, minY = 0.08, seed = 9, region } = {}) {
  const rng = makeRng(seed);
  const pts = [];
  while (pts.length < count * 3) {
    const v = new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
    if (v.lengthSq() > 1 || v.lengthSq() < 0.01) continue;
    v.normalize();
    if (v.y < minY) continue;
    if (region && !region(v)) continue;
    v.multiplyScalar(1500);
    pts.push(v.x, v.y, v.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, depthWrite: false }));
  p.layers.set(FX_LAYER);
  p.frustumCulled = false;
  ctx.scene.add(p);
  ctx.onFrame((t, dt, camera) => p.position.copy(camera.position));
  return p;
}

// Twinkling motes in world space; `points` is a flat [x,y,z,...] list.
export function motes(ctx, points, { color = '#fff3c8', size = 3, rise = 0, span = 20, twinkle = true } = {}) {
  const geo = new THREE.BufferGeometry();
  const base = new Float32Array(points);
  const pos = new Float32Array(points);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(geo, mat);
  p.layers.set(FX_LAYER);
  p.frustumCulled = false;
  ctx.scene.add(p);
  let last = -1;
  ctx.onFrame((t) => {
    if (twinkle) mat.opacity = 0.75 + 0.25 * Math.sin(t * 2.1);
    if (!rise || t - last < 0.05) return;
    last = t;
    for (let i = 0; i < pos.length; i += 3) pos[i + 1] = base[i + 1] + ((t * rise + i * 0.37) % span);
    geo.attributes.position.needsUpdate = true;
  });
  return p;
}

// A faceless white angel with soft wings.
export function angel(ctx, pos, { facing, scale = 1.2, wings = true, glowSize = 5, lift = 0, arms } = {}) {
  const fig = figure(ctx, { ...DIVINE, arms }, pos, { facing, scale, glow: 0.45 });
  fig.position.y += lift;
  if (wings) {
    const p = new Parts();
    for (const side of [-1, 1]) {
      p.add('#fff8e8', unit.sphere, { pos: [side * 0.45, 1.35, -0.22], rot: [0.2, side * 0.35, side * -0.5], scale: [0.7, 1.5, 0.12] });
      p.add('#fff8e8', unit.sphere, { pos: [side * 0.7, 1.75, -0.3], rot: [0.2, side * 0.35, side * -0.9], scale: [0.45, 1.0, 0.1] });
    }
    fig.add(p.group(ctx.kit, { emissive: 0.4 }));
  }
  glow(ctx, [pos[0], fig.position.y + 1.3 * scale, pos[1]], glowSize, '#fff3d0', 0.6);
  return fig;
}

// Additive flame tongues that flicker; `list` holds {x, y, z, h, r}.
export function flames(ctx, list, { outer = '#f08a2c', inner = '#ffe08a' } = {}) {
  const geo = new THREE.ConeGeometry(0.3, 1, 7);
  geo.translate(0, 0.5, 0);
  const mk = (col) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const out = new THREE.InstancedMesh(geo, mk(outer), list.length);
  const inn = new THREE.InstancedMesh(geo, mk(inner), list.length);
  for (const m of [out, inn]) {
    m.layers.set(FX_LAYER);
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(m);
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    list.forEach((f, i) => {
      const k = 0.75 + 0.25 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 5.3 + i);
      const r = f.r ?? 1;
      out.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q, s.set(r, f.h * k, r)));
      inn.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q, s.set(r * 0.5, f.h * k * 0.6, r * 0.5)));
    });
    out.instanceMatrix.needsUpdate = inn.instanceMatrix.needsUpdate = true;
  });
}

// A rising column of smoke puffs.
export function smokeColumn(ctx, [x, y, z], { count = 14, rise = 16, size = 1.4, drift = [4, 1], color = '#e8e2da', shade = '#5a5260', seed = 6 } = {}) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon(color, { emissive: shade }), count);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ctx.scene.add(mesh);
  const rng = makeRng(seed);
  const puffs = Array.from({ length: count }, (_, i) => ({ ph: i / count + rng() * 0.03, jx: (rng() - 0.5) * 2, jz: (rng() - 0.5) * 2, g: between(rng, [0.7, 1.3]) }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    puffs.forEach((p, i) => {
      const life = (t * 0.05 + p.ph) % 1;
      const k = size * p.g * (0.3 + life * 2.2) * Math.min(1, life * 10) * (1 - Math.max(0, life - 0.8) * 5);
      const spread = 0.6 + life * 3;
      mesh.setMatrixAt(i, m.compose(v.set(x + life * life * drift[0] + p.jx * spread, y + life * rise, z + life * life * drift[1] + p.jz * spread), q, s.set(k, k * 0.8, k)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

// Boxes in world space; each item {pos:[x,z], size:[w,h,d], rot, color, y, collide, walkable}.
export function boxes(ctx, items) {
  const p = new Parts();
  for (const b of items) {
    const [x, z] = b.pos;
    const base = b.y ?? ctx.terrainHeight(x, z);
    const [w, h, d] = b.size;
    p.box(b.color, [w, h, d], [x, base + h / 2, z], [b.tiltX ?? 0, b.rot ?? 0, b.tiltZ ?? 0]);
    if (b.collide || b.walkable) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: b.rot ?? 0, top: base + h, walkable: !!b.walkable });
  }
  const g = p.group(ctx.kit);
  ctx.scene.add(g);
  return g;
}

// A rough stone altar of stacked rocks with a flat top slab.
export function altar(ctx, [x, z], { w = 2.2, d = 1.4, h = 1.0, colors = ['#9a8a74', '#857660', '#a89880'], top = '#b8a88c', rot = 0, seed = 3 } = {}) {
  const rng = makeRng(seed);
  const p = new Parts();
  const y0 = ctx.terrainHeight(x, z);
  const rows = Math.max(2, Math.round(h / 0.35));
  for (let r = 0; r < rows; r++) {
    const ry = y0 + (r + 0.5) * (h / rows);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const lx = (i / 3 - 0.5) * w * 0.9, lz = (j / 2 - 0.5) * d * 0.85;
        const s = h / rows * between(rng, [1.2, 1.6]);
        p.add(pick(rng, colors), unit.rock, { pos: [lx, ry - y0, lz], rot: [rng() * 3, rng() * 3, rng() * 3], scale: [s * 1.4, s, s * 1.2] });
      }
    }
  }
  p.box(top, [w * 1.05, 0.18, d * 1.05], [0, h + 0.05, 0]);
  const g = p.group(ctx.kit);
  g.position.set(x, y0, z);
  g.rotation.y = rot;
  ctx.scene.add(g);
  ctx.addCollider({ x, z, hx: w / 2 + 0.1, hz: d / 2 + 0.1, rot, top: y0 + h + 0.15 });
  ctx.exclude({ kind: 'circle', x, z, r: Math.max(w, d) });
  return { group: g, top: y0 + h + 0.14 };
}

// Woolly sheep or lamb.
export function sheep(kit, { scale = 1, wool = '#f1ebdc', face = '#3a2a22', lying = false } = {}) {
  const p = new Parts();
  const legH = lying ? 0.05 : 0.2;
  p.add(wool, unit.ico, { pos: [0, legH + 0.36, 0], scale: [0.72, 0.64, 1.05] });
  p.add(face, unit.sphere, { pos: [0, legH + 0.5, 0.52], rot: [0.4, 0, 0], scale: [0.24, 0.26, 0.36] });
  p.add(face, unit.sphere, { pos: [0.14, legH + 0.6, 0.45], scale: [0.16, 0.06, 0.08] });
  p.add(face, unit.sphere, { pos: [-0.14, legH + 0.6, 0.45], scale: [0.16, 0.06, 0.08] });
  if (!lying) for (const [lx, lz] of [[-0.16, 0.25], [0.16, 0.25], [-0.16, -0.25], [0.16, -0.25]]) p.add(face, unit.cyl, { pos: [lx, legH / 2 + 0.05, lz], scale: [0.08, legH + 0.1, 0.08] });
  const g = p.group(kit);
  g.scale.setScalar(scale);
  return g;
}

export function flockOfSheep(ctx, center, { count = 12, radius = 6, seed = 4, facing } = {}) {
  const rng = makeRng(seed);
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * radius;
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (ctx.blocked(x, z, 0.4)) continue;
    const s = sheep(ctx.kit, { scale: between(rng, [0.85, 1.1]), wool: pick(rng, ['#f1ebdc', '#e8dfcc', '#f6f2e6', '#d9cdb4']) });
    s.position.set(x, ctx.groundHeight(x, z), z);
    s.rotation.y = facing ? faceYaw([x, z], facing) + (rng() - 0.5) * 1.2 : rng() * 6.28;
    ctx.scene.add(s);
    ctx.exclude({ kind: 'circle', x, z, r: 0.7 });
  }
}

// A peaked tent of stretched cloth.
export function tent(ctx, [x, z], { w = 6, d = 4, h = 2.6, color = '#5a4232', stripe = '#c8a97a', rot = 0 } = {}) {
  const p = new Parts();
  const roof = new THREE.CylinderGeometry(1, 1, 1, 3, 1);
  roof.rotateZ(Math.PI / 2);
  p.add(color, roof, { pos: [0, h / 2, 0], rot: [0, 0, 0], scale: [w, h, d * 0.62] });
  p.add(stripe, roof, { pos: [w * 0.25, h / 2 + 0.02, 0], scale: [w * 0.12, h * 1.02, d * 0.63] });
  p.add(stripe, roof, { pos: [-w * 0.25, h / 2 + 0.02, 0], scale: [w * 0.12, h * 1.02, d * 0.63] });
  p.add('#6b4a33', unit.cyl, { pos: [w / 2 + 0.1, h * 0.55, 0], scale: [0.12, h * 1.1, 0.12] });
  p.add('#6b4a33', unit.cyl, { pos: [-w / 2 - 0.1, h * 0.55, 0], scale: [0.12, h * 1.1, 0.12] });
  const g = p.group(ctx.kit);
  const y = ctx.terrainHeight(x, z);
  g.position.set(x, y, z);
  g.rotation.y = rot;
  ctx.scene.add(g);
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2.2, rot, top: y + h });
  return g;
}

// Palm tree with drooping fronds.
export function palms(ctx, list, { trunk = '#7a5a3a', leaves = ['#4f8a4a', '#3e7a44', '#5f9a52'] } = {}) {
  const p = new Parts();
  const rng = makeRng(17);
  for (const [x, z, h = 8] of list) {
    const y = ctx.terrainHeight(x, z);
    const lean = (rng() - 0.5) * 0.25;
    for (let k = 0; k < 6; k++) p.add(trunk, unit.cyl, { pos: [x + lean * k * h / 6, y + (k + 0.5) * h / 6, z], scale: [0.42 - k * 0.03, h / 6 + 0.05, 0.42 - k * 0.03] });
    const tx = x + lean * h, ty = y + h;
    for (let f = 0; f < 8; f++) {
      const a = (f / 8) * Math.PI * 2 + rng();
      p.add(pick(rng, leaves), unit.sphere, { pos: [tx + Math.sin(a) * 1.4, ty - 0.3, z + Math.cos(a) * 1.4], rot: [0.35, a, 0], scale: [1.1, 0.14, 3.4] });
    }
    ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + h });
  }
  const g = p.group(ctx.kit);
  ctx.scene.add(g);
  return g;
}

// Instanced spirits or people standing on a level surface; list of {x, y, z, yaw, scale, color}.
export function figures(ctx, list, { glow = 0, parent = ctx.scene } = {}) {
  const parts = makeFigure({ robe: '#fff', mantle: '#fff', skin: '#fff', hair: '#fff' }, ctx.kit).children.map((m) => m.geometry);
  const meshes = parts.map((g) => new THREE.InstancedMesh(g, ctx.kit.toon('#ffffff', glow ? { emissive: new THREE.Color('#ffffff').multiplyScalar(glow) } : {}), list.length));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  list.forEach((f, i) => {
    m.compose(new THREE.Vector3(f.x, f.y, f.z), q.setFromEuler(e.set(0, f.yaw, 0)), new THREE.Vector3(f.scale, f.scale, f.scale));
    meshes.forEach((mesh, k) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(f.colors[k]));
    });
  });
  for (const mesh of meshes) {
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    parent.add(mesh);
  }
}
