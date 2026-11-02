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
    return this.add(color, new THREE.BoxGeometry(w, h, d), { pos, rot });
  }

  group(kit, { cast = true, receive = true, emissive } = {}) {
    const group = new THREE.Group();
    for (const [color, geos] of this.byColor) {
      const mat = color instanceof THREE.Material ? color : kit.toon(color, emissive ? { emissive: new THREE.Color(color).multiplyScalar(emissive) } : {});
      const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      group.add(mesh);
    }
    return group;
  }
}

export function place(ctx, obj, [x, z], { rot = 0, y, lift = 0 } = {}) {
  obj.position.set(x, (y ?? ctx.groundHeight(x, z)) + lift, z);
  obj.rotation.y = rot;
  ctx.scene.add(obj);
  return obj;
}

export const faceYaw = ([x, z], [tx, tz]) => Math.atan2(tx - x, tz - z);

export function figure(ctx, colors, [x, z], { facing, scale = 1, glow = 0, clear = 1.2, y } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow });
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.setScalar(scale);
  if (facing) fig.rotation.y = faceYaw([x, z], facing);
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

export function kneelFigure(ctx, colors, pos, opts = {}) {
  const fig = figure(ctx, colors, pos, opts);
  fig.scale.y *= 0.62;
  fig.scale.x *= 1.1;
  fig.scale.z *= 1.1;
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

// A disc in the sky that ignores fog and outlines.
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

// Flat water surface with drifting glints. `shape` is a THREE.Shape (xz via x,-y) or omitted for a disc.
export function water(ctx, { shape, radius = 900, y = 0.2, color = '#3f8fa0', glint = '#d8f2ec', glints = 140, seed = 4, glintArea } = {}) {
  let geo;
  if (shape) geo = new THREE.ShapeGeometry(shape, 24);
  else geo = new THREE.CircleGeometry(radius, 64);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, ctx.kit.toon(color, { emissive: new THREE.Color(color).multiplyScalar(0.25) }));
  mesh.position.y = y;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  if (glints) {
    const rng = makeRng(seed);
    const dash = new THREE.PlaneGeometry(1, 0.12);
    dash.rotateX(-Math.PI / 2);
    const inst = new THREE.InstancedMesh(dash, ctx.kit.basic(glint), glints);
    const items = [];
    const area = glintArea ?? ((x, z) => true);
    const R = glintArea ? 400 : radius * 0.5;
    while (items.length < glints) {
      const x = (rng() - 0.5) * 2 * R, z = (rng() - 0.5) * 2 * R;
      if (!area(x, z)) continue;
      items.push({ x, z, len: between(rng, [0.8, 2.4]), ph: rng() * 6.28 });
    }
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    inst.layers.set(FX_LAYER);
    inst.frustumCulled = false;
    ctx.scene.add(inst);
    let last = -1;
    ctx.onFrame((t) => {
      if (t - last < 0.1) return;
      last = t;
      items.forEach((g, i) => {
        const k = Math.max(0, Math.sin(t * 0.8 + g.ph));
        inst.setMatrixAt(i, m.compose(v.set(g.x + Math.sin(t * 0.3 + g.ph) * 0.6, y + 0.03, g.z), q, s.set(g.len * k + 0.001, 1, 1)));
      });
      inst.instanceMatrix.needsUpdate = true;
    });
  }
  return mesh;
}

// A water ribbon following a polyline across the terrain.
export function river(ctx, points, { width = 3, color = '#4f9fb0', lift = 0.08, bank = '#7a6a48', bankWidth = 0.8 } = {}) {
  const build = (w, col, dy) => {
    const pos = [], idx = [];
    const pts = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, az] = points[i], [bx, bz] = points[i + 1];
      const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 1.5));
      for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
    }
    pts.push(points[points.length - 1]);
    pts.forEach(([x, z], i) => {
      const [px, pz] = pts[Math.max(0, i - 1)], [nx, nz] = pts[Math.min(pts.length - 1, i + 1)];
      let dx = nx - px, dz = nz - pz;
      const l = Math.hypot(dx, dz) || 1;
      dx /= l; dz /= l;
      for (const side of [-1, 1]) {
        const sx = x - dz * side * w / 2, sz = z + dx * side * w / 2;
        pos.push(sx, ctx.terrainHeight(sx, sz) + dy, sz);
      }
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mat = ctx.kit.toon(col, { side: THREE.DoubleSide, emissive: new THREE.Color(col).multiplyScalar(0.2) });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  };
  if (bank) build(width + bankWidth * 2, bank, lift * 0.5);
  build(width, color, lift);
}

// Low-poly quadrupeds and birds. Every animal is a merged group of primitives facing +z.
const SPECIES = {
  sheep: { body: [0.9, 0.55, 0.6], legH: 0.45, leg: 0.07, neck: 0.15, head: 0.2, color: '#f2ece0', dark: '#3a2e28', fluffy: true },
  cow: { body: [1.7, 0.85, 0.75], legH: 0.75, leg: 0.11, neck: 0.25, head: 0.3, color: '#8a5a3c', dark: '#2b1a12', horns: true },
  horse: { body: [1.6, 0.7, 0.55], legH: 1.0, leg: 0.09, neck: 0.75, neckTilt: 0.7, head: 0.3, headLong: 1.8, color: '#7a4a2a', dark: '#2b1a12', mane: true },
  camel: { body: [1.6, 0.75, 0.6], legH: 1.25, leg: 0.09, neck: 0.95, neckTilt: 0.5, head: 0.28, headLong: 1.6, color: '#c8a06a', dark: '#6b4a33', hump: true },
  lion: { body: [1.4, 0.6, 0.55], legH: 0.6, leg: 0.11, neck: 0.15, head: 0.3, color: '#d0a050', dark: '#7a4a1e', maneBall: '#8a5226', tail: true },
  elephant: { body: [2.6, 1.9, 1.7], legH: 1.3, leg: 0.32, neck: 0.1, head: 0.75, color: '#8f8a88', dark: '#5f5a58', trunk: true, ears: true },
  giraffe: { body: [1.5, 0.8, 0.6], legH: 1.8, leg: 0.08, neck: 2.0, neckTilt: 0.35, head: 0.24, headLong: 1.7, color: '#e0b060', dark: '#7a4a1e', spots: '#9a5a26' },
  deer: { body: [1.1, 0.55, 0.45], legH: 0.85, leg: 0.06, neck: 0.5, neckTilt: 0.5, head: 0.2, headLong: 1.5, color: '#b07a4a', dark: '#4a3020', antlers: true },
  goat: { body: [0.9, 0.5, 0.45], legH: 0.5, leg: 0.06, neck: 0.3, neckTilt: 0.6, head: 0.18, headLong: 1.4, color: '#e8e0d0', dark: '#3a2e28', horns: true },
  bear: { body: [1.5, 0.95, 0.85], legH: 0.55, leg: 0.17, neck: 0.15, head: 0.35, color: '#5a3a24', dark: '#2b1a12' },
  zebra: { body: [1.4, 0.65, 0.5], legH: 0.9, leg: 0.08, neck: 0.65, neckTilt: 0.7, head: 0.26, headLong: 1.8, color: '#f2f0ea', dark: '#1f1a18', mane: true, stripes: true },
  rabbit: { body: [0.35, 0.28, 0.25], legH: 0.06, leg: 0.05, neck: 0.05, head: 0.13, color: '#c8b8a0', dark: '#6b5a4a', ears2: true },
};

const unit = {
  sphere: new THREE.SphereGeometry(0.5, 12, 9),
  ico: new THREE.IcosahedronGeometry(0.5, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  cone: new THREE.ConeGeometry(0.5, 1, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
};

export function animal(kit, type, { scale = 1, color } = {}) {
  const s = SPECIES[type];
  const p = new Parts();
  const c = color ?? s.color;
  const [L, H, W] = s.body;
  const bodyY = s.legH + H / 2;
  p.add(c, s.fluffy ? unit.ico : unit.sphere, { pos: [0, bodyY, 0], scale: [W, H, L] });
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    p.add(s.dark && !s.fluffy && type !== 'elephant' && type !== 'giraffe' ? c : s.dark, unit.cyl, { pos: [lx * W * 0.3, s.legH / 2 + H * 0.1, lz * L * 0.32], scale: [s.leg * 2, s.legH + H * 0.2, s.leg * 2] });
  }
  const neckLen = s.neck;
  const tilt = s.neckTilt ?? 1.2;
  const nx = Math.sin(tilt) * neckLen, ny = Math.cos(tilt) * neckLen;
  const neckBase = [0, bodyY + H * 0.2, L * 0.4];
  if (neckLen > 0.2) p.add(c, unit.cyl, { pos: [0, neckBase[1] + ny / 2, neckBase[2] + nx / 2], rot: [tilt, 0, 0], scale: [s.head * 0.9, neckLen + 0.2, s.head * 0.9] });
  const head = [0, neckBase[1] + ny + s.head * 0.2, neckBase[2] + nx + s.head * 0.5];
  const hl = s.headLong ?? 1.2;
  p.add(s.fluffy ? s.dark : c, unit.sphere, { pos: head, rot: [0.3, 0, 0], scale: [s.head * 1.6, s.head * 1.6, s.head * 1.6 * hl] });
  p.add(s.dark, unit.sphere, { pos: [0, head[1] - s.head * 0.15, head[2] + s.head * hl * 0.7], scale: [s.head * 0.9, s.head * 0.8, s.head * 0.7] });
  if (s.maneBall) p.add(s.maneBall, unit.ico, { pos: [0, head[1] - 0.02, head[2] - 0.12], scale: [s.head * 3.2, s.head * 3.2, s.head * 2.4] });
  if (s.mane) p.add(s.dark, unit.box, { pos: [0, neckBase[1] + ny / 2 + 0.12, neckBase[2] + nx / 2 - 0.1], rot: [tilt, 0, 0], scale: [0.06, neckLen + 0.2, 0.2] });
  if (s.hump) p.add(c, unit.sphere, { pos: [0, bodyY + H * 0.5, -0.05], scale: [W * 0.7, H * 0.9, L * 0.4] });
  if (s.horns) for (const side of [-1, 1]) p.add('#e8dcc0', unit.cone, { pos: [side * s.head * 0.6, head[1] + s.head * 0.8, head[2] - 0.05], rot: [-0.3, 0, side * -0.5], scale: [0.06, s.head * 1.2, 0.06] });
  if (s.antlers) for (const side of [-1, 1]) {
    p.add('#6b4a33', unit.cyl, { pos: [side * 0.15, head[1] + 0.35, head[2] - 0.05], rot: [-0.2, 0, side * -0.6], scale: [0.04, 0.6, 0.04] });
    p.add('#6b4a33', unit.cyl, { pos: [side * 0.3, head[1] + 0.5, head[2] + 0.05], rot: [0.5, 0, side * 0.2], scale: [0.03, 0.35, 0.03] });
  }
  if (s.trunk) {
    p.add(c, unit.cone, { pos: [0, head[1] - 0.75, head[2] + 0.45], rot: [Math.PI - 0.25, 0, 0], scale: [0.35, 1.5, 0.35] });
    p.add('#f2ece0', unit.cone, { pos: [0.35, head[1] - 0.45, head[2] + 0.45], rot: [-2.2, 0, 0], scale: [0.12, 0.7, 0.12] });
    p.add('#f2ece0', unit.cone, { pos: [-0.35, head[1] - 0.45, head[2] + 0.45], rot: [-2.2, 0, 0], scale: [0.12, 0.7, 0.12] });
  }
  if (s.ears) for (const side of [-1, 1]) p.add(s.dark, unit.sphere, { pos: [side * 0.75, head[1] + 0.05, head[2] - 0.2], rot: [0, side * 0.5, 0], scale: [0.15, 1.1, 0.9] });
  if (s.ears2) for (const side of [-1, 1]) p.add(c, unit.sphere, { pos: [side * 0.05, head[1] + 0.2, head[2] - 0.05], scale: [0.06, 0.3, 0.08] });
  if (s.tail || type === 'cow' || type === 'horse' || type === 'zebra') p.add(s.dark, unit.cyl, { pos: [0, bodyY - H * 0.1, -L * 0.55], rot: [-0.4, 0, 0], scale: [0.06, H * 1.1, 0.06] });
  if (s.spots) {
    const rng = makeRng(type.length * 7);
    for (let i = 0; i < 10; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      p.add(s.spots, unit.sphere, { pos: [side * W * 0.47, bodyY + (rng() - 0.5) * H * 0.6, (rng() - 0.5) * L * 0.7], scale: [0.04, 0.18, 0.2] });
    }
  }
  if (s.stripes) for (let i = 0; i < 6; i++) p.add(s.dark, unit.box, { pos: [0, bodyY, -L * 0.35 + i * L * 0.13], scale: [W * 1.02, H * 0.95, 0.07] });
  const g = p.group(kit);
  g.scale.setScalar(scale);
  return g;
}

export function bird(kit, { color = '#fbf7ee', wing = '#e6e0d4', size = 1 } = {}) {
  const p = new Parts();
  p.add(color, unit.sphere, { pos: [0, 0, 0], scale: [0.22, 0.2, 0.5] });
  p.add(color, unit.sphere, { pos: [0, 0.08, 0.26], scale: [0.16, 0.16, 0.18] });
  p.add('#e0a040', unit.cone, { pos: [0, 0.07, 0.38], rot: [Math.PI / 2, 0, 0], scale: [0.05, 0.1, 0.05] });
  const body = p.group(kit, { cast: false, emissive: 0.45 });
  const wings = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.26), kit.toon(wing, { emissive: new THREE.Color(wing).multiplyScalar(0.45) }));
    w.position.x = side * 0.3;
    pivot.add(w);
    body.add(pivot);
    wings.push({ pivot, side });
  }
  body.scale.setScalar(size);
  body.userData.flap = (t) => wings.forEach(({ pivot, side }) => (pivot.rotation.z = side * Math.sin(t * 9) * 0.6));
  return body;
}

// Birds circling a point, wings flapping.
export function flock(ctx, { center, y = 14, radius = 12, count = 8, colors = ['#fbf7ee'], seed = 3, speed = 0.25, size = 1 }) {
  const rng = makeRng(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    const b = bird(ctx.kit, { color: pick(rng, colors), wing: pick(rng, colors), size });
    ctx.scene.add(b);
    list.push({ b, a: rng() * 6.28, r: radius * between(rng, [0.6, 1.2]), h: y + between(rng, [-3, 3]), sp: speed * between(rng, [0.7, 1.3]), ph: rng() * 6 });
  }
  ctx.onFrame((t) => {
    for (const o of list) {
      const a = o.a + t * o.sp;
      o.b.position.set(center[0] + Math.sin(a) * o.r, o.h + Math.sin(t + o.ph) * 0.8, center[1] + Math.cos(a) * o.r);
      o.b.rotation.y = a + Math.PI / 2;
      o.b.userData.flap(t + o.ph);
    }
  });
}

// A faceless white angel with soft wings.
export function angel(ctx, pos, { facing, scale = 1.2, wings = true, glowSize = 5, color = '#fbf7ee', wingColor = '#fff8e8', lift = 0 } = {}) {
  const colors = { robe: color, mantle: '#f3eddf', skin: '#f6eee0', hair: '#fbf7ee', sash: '#efe0b8' };
  const fig = figure(ctx, colors, pos, { facing, scale, glow: 0.45 });
  fig.position.y += lift;
  if (wings) {
    const p = new Parts();
    for (const side of [-1, 1]) {
      p.add(wingColor, unit.sphere, { pos: [side * 0.45, 1.35, -0.22], rot: [0.2, side * 0.35, side * -0.5], scale: [0.7, 1.5, 0.12] });
      p.add(wingColor, unit.sphere, { pos: [side * 0.7, 1.75, -0.3], rot: [0.2, side * 0.35, side * -0.9], scale: [0.45, 1.0, 0.1] });
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

// Boxes in world space; each item {pos:[x,z], size:[w,h,d], rot, color, y, collide, walkable}.
export function boxes(ctx, items) {
  const p = new Parts();
  for (const b of items) {
    const [x, z] = b.pos;
    const base = b.y ?? ctx.terrainHeight(x, z);
    const [w, h, d] = b.size;
    p.box(b.color, [w, h, d], [x, base + h / 2 + (b.lift ?? 0), z], [b.tiltX ?? 0, b.rot ?? 0, b.tiltZ ?? 0]);
    if (b.collide || b.walkable) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: b.rot ?? 0, top: base + h + (b.lift ?? 0), walkable: !!b.walkable });
  }
  const g = p.group(ctx.kit);
  ctx.scene.add(g);
  return g;
}

// A rising column of smoke puffs.
export function smokeColumn(ctx, [x, y, z], { count = 14, rise = 16, size = 1.4, drift = [4, 1], color = '#e8e2da', shade = '#5a5260', seed = 6 } = {}) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon(color, { emissive: shade }), count);
  mesh.frustumCulled = false;
  mesh.castShadow = false;
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

// Pairs of animals walking along a path toward a goal, looping.
export function procession(ctx, kit, { from, to, pairs, spacing = 4, gap = 1.6, speed = 0.8, seed = 5 }) {
  const dx = to[0] - from[0], dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const ux = dx / len, uz = dz / len;
  const yaw = Math.atan2(ux, uz);
  const items = [];
  pairs.forEach((type, i) => {
    for (const side of [-1, 1]) {
      const a = animal(kit, type);
      ctx.scene.add(a);
      items.push({ a, d: i * spacing, side, ph: i * 0.7 + side });
    }
  });
  const total = pairs.length * spacing + 6;
  const place1 = (o, t) => {
    const d = (o.d + t * speed) % total;
    const x = from[0] + ux * d - uz * o.side * gap / 2;
    const z = from[1] + uz * d + ux * o.side * gap / 2;
    o.a.position.set(x, ctx.groundHeight(x, z) + Math.abs(Math.sin(t * 5 + o.ph)) * 0.04, z);
    o.a.rotation.y = yaw;
    o.a.visible = d < len;
  };
  items.forEach((o) => place1(o, 0));
  ctx.onFrame((t) => items.forEach((o) => place1(o, t)));
}

// Walkable stair of boxes in a local frame: rising along -z from frontZ.
export function stair(ctx, p, { origin, rot = 0, x = 0, frontZ, fromY, toY, width, rise = 0.3, depth = 0.45, color }) {
  const n = Math.max(1, Math.round((toY - fromY) / rise));
  const r = (toY - fromY) / n;
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let k = 0; k < n; k++) {
    const top = fromY + (k + 1) * r;
    const lz = frontZ - (k + 0.5) * depth;
    const wx = origin[0] + x * c + lz * s, wz = origin[1] - x * s + lz * c;
    const h = top - fromY + 0.4;
    p.box(color, [width, h, depth], [wx, origin[2] + top - h / 2, wz], [0, rot, 0]);
    ctx.addCollider({ x: wx, z: wz, hx: width / 2, hz: depth / 2, rot, top: origin[2] + top, walkable: true });
  }
  return n * depth;
}
