// Shared props for toon scenes bom-43 to bom-49: figures, angels, water, flames, houses, banners, barges, stars.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { between, makeRng, pick } from '../../engine/util.js';

export { between, makeRng, pick };

export function toonStyle({ fog = '#efd8ad', near = 120, far = 1100, ink = '#2b1a12', grain = 0.05 } = {}) {
  return {
    ink,
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain,
    fog: { color: fog, near, far },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  };
}

export const CROWD = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const GROUND = {
  sand: '#d4ac6c', dirt: '#bf8d55', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676',
  scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a',
};

export const CHRIST_COLORS = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#c9905f', hair: '#5a3a22', sash: '#e9dcc0' };
export const ANGEL_COLORS = { robe: '#ffffff', mantle: '#fbf6ea', skin: '#f6ead2', hair: '#fff4dc', sash: '#f3e6c4' };

const m4 = new THREE.Matrix4();
const qt = new THREE.Quaternion();
const eu = new THREE.Euler();
const v3 = new THREE.Vector3();
const s3 = new THREE.Vector3();

export function xf(geo, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = {}) {
  m4.compose(v3.set(...pos), qt.setFromEuler(eu.set(rot[0], rot[1], rot[2], 'YXZ')), s3.set(...scale));
  return geo.applyMatrix4(m4);
}

export const box = (w, h, d, pos, rot) => xf(new THREE.BoxGeometry(w, h, d), { pos, rot });
export const cyl = (rt, rb, h, pos, rot, seg = 8) => xf(new THREE.CylinderGeometry(rt, rb, h, seg), { pos, rot });
export const cone = (r, h, pos, rot, seg = 8) => xf(new THREE.ConeGeometry(r, h, seg), { pos, rot });
export const ball = (r, pos, scale = [1, 1, 1], seg = 10) => xf(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), { pos, scale });

export const frameAt = (x, y, z, rotY = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(1, 1, 1));

// Collects static geometry by color and merges each set into one mesh.
export class Batch {
  constructor(ctx) {
    this.ctx = ctx;
    this.sets = new Map();
  }

  add(color, geo, { glow = false, emissive = null, cast = true, frame = null, stone = false } = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo;
    g.clearGroups();
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (frame) g.applyMatrix4(frame);
    const key = [color, glow, emissive, cast, stone].join('|');
    if (!this.sets.has(key)) this.sets.set(key, { color, glow, emissive, cast, stone, geos: [] });
    this.sets.get(key).geos.push(g);
    return this;
  }

  flush() {
    const { kit, scene } = this.ctx;
    for (const s of this.sets.values()) {
      const mat = s.glow ? kit.basic(s.color) : s.stone ? kit.stoneMat(s.color) : kit.toon(s.color, { emissive: s.emissive ?? 0x000000 });
      const mesh = new THREE.Mesh(mergeGeometries(s.geos), mat);
      mesh.castShadow = s.cast && !s.glow;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
    this.sets.clear();
  }
}

export function lowestGround(ctx, x, z, w, d, rot = 0) {
  let y = Infinity;
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const [lx, lz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, 0]]) {
    y = Math.min(y, ctx.terrainHeight(x + lx * c + lz * s, z - lx * s + lz * c));
  }
  return y;
}

// A single figure. pose: 'stand', 'kneel' (body squashed, head lowered), 'sit'.
export function person(ctx, colors, [x, z], face, { scale = 1, glow = 0, pose = 'stand', y = null, clear = 0.8, lean = 0 } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow });
  if (pose !== 'stand') {
    const k = pose === 'sit' ? 0.5 : 0.62;
    const drop = 1.46 * (1 - k);
    fig.children.forEach((c, i) => {
      if (i < 2) c.scale.set(1.12, k, 1.12);
      else if (i < 4) c.position.y -= drop;
      else if (c.geometry?.type === 'TorusGeometry') c.position.y *= k;
      else c.position.y -= drop;
    });
  }
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.setScalar(scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  fig.rotation.x = lean;
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

// Something held in front of a figure at chest height, in the figure's local frame.
export function hold(ctx, fig, geo, color, { at = [0, 1.05, 0.32], glow = false } = {}) {
  const mesh = new THREE.Mesh(geo, glow ? ctx.kit.basic(color) : ctx.kit.toon(color));
  mesh.position.set(...at);
  mesh.castShadow = true;
  fig.add(mesh);
  return mesh;
}

let glowTex = null;
export function glow(ctx, pos, size, color, { opacity = 0.8, pulse = 0.04 } = {}) {
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(...pos);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) {
    const ph = pos[0] * 0.7 + pos[2];
    ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3 + ph) * pulse)));
  }
  return s;
}

export function lamp(ctx, pos, color, intensity, distance, decay = 1.5) {
  const l = new THREE.PointLight(color, intensity, distance, decay);
  l.position.set(...pos);
  ctx.scene.add(l);
  return l;
}

// A faceless glowing figure hovering in the air, bobbing gently.
export function angel(ctx, [x, y, z], face, { scale = 1.05, arms = [0.7, 0.5], halo = 4.5, bob = 0.25, light = 0 } = {}) {
  const fig = makeFigure({ ...ANGEL_COLORS, arms }, ctx.kit, { glow: 0.75 });
  fig.position.set(x, y, z);
  fig.scale.setScalar(scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(fig);
  const g = glow(ctx, [x, y + 1.1, z], halo, '#fff3d0', { opacity: 0.7 });
  if (light) lamp(ctx, [x, y + 1.5, z], '#fff0c8', light, 14);
  const ph = x * 0.37 + z * 0.21;
  ctx.onFrame((t) => {
    const dy = Math.sin(t * 0.9 + ph) * bob;
    fig.position.y = y + dy;
    g.position.y = y + 1.1 + dy;
  });
  return fig;
}

export function stars(ctx, { count = 900, color = '#fff6dc', size = 2.2, minY = 0.08, seed = 9 } = {}) {
  const rng = makeRng(seed);
  const pos = [];
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const y = minY + (1 - minY) * Math.pow(rng(), 0.7);
    const r = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * r * 1500, y * 1500, Math.sin(a) * r * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, cam) => pts.position.copy(cam.position));
}

export function disc(ctx, dir, size, color, { halo = null, haloSize = 3 } = {}) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(size, 40), new THREE.MeshBasicMaterial({ color, fog: false }));
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
  let h = null;
  if (halo) {
    glowTex ??= glowTexture();
    h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: halo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6, fog: false }));
    h.scale.setScalar(size * haloSize * 2);
    h.layers.set(FX_LAYER);
    ctx.scene.add(h);
  }
  ctx.onFrame((t, dt, cam) => {
    mesh.position.copy(cam.position).add(d);
    mesh.lookAt(cam.position);
    if (h) h.position.copy(mesh.position);
  });
}

// Flat water with drifting light streaks. Pass `waves` to get a rolling surface near the center.
export function water(ctx, { center = [0, 0], size = [400, 400], y = 0, color = '#3f8fa0', shine = '#cfeef0', streaks = 60, seed = 4, waves = null }) {
  const rng = makeRng(seed);
  const [cx, cz] = center;
  let mesh;
  if (waves) {
    const seg = waves.segments ?? 90;
    const geo = new THREE.PlaneGeometry(size[0], size[1], seg, seg);
    geo.rotateX(-Math.PI / 2);
    mesh = new THREE.Mesh(geo, ctx.kit.toon(color, { unique: true }));
    const pos = geo.attributes.position;
    const base = Float32Array.from(pos.array);
    const fade = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const e = Math.max(Math.abs(base[i * 3]) / (size[0] / 2), Math.abs(base[i * 3 + 2]) / (size[1] / 2));
      fade[i] = 1 - THREE.MathUtils.smoothstep(e, 0.6, 1);
    }
    const { amp = 1.5, length = 22, speed = 1, dir = [1, 0.3] } = waves;
    const dl = Math.hypot(...dir);
    const [dx, dz] = [dir[0] / dl, dir[1] / dl];
    mesh.userData.heightAt = (x, z, t) => {
      const u = (x * dx + z * dz) / length;
      const v = (x * -dz + z * dx) / (length * 1.7);
      return amp * (Math.sin(u * 6.28 - t * speed) * 0.7 + Math.sin(u * 3.1 + v * 4.0 - t * speed * 0.7) * 0.45 + Math.sin(v * 5.3 + t * speed * 0.5) * 0.25);
    };
    mesh.userData.surface = (x, z, t) => {
      const e = Math.max(Math.abs(x - cx) / (size[0] / 2), Math.abs(z - cz) / (size[1] / 2));
      return mesh.userData.heightAt(x, z, t) * (1 - THREE.MathUtils.smoothstep(e, 0.6, 1));
    };
    let frame = 0;
    ctx.onFrame((t) => {
      if (frame++ % 2) return;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3], bz = base[i * 3 + 2];
        pos.array[i * 3 + 1] = mesh.userData.heightAt(bx + cx, bz + cz, t) * fade[i];
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    });
  } else {
    const geo = new THREE.PlaneGeometry(size[0], size[1], 1, 1);
    geo.rotateX(-Math.PI / 2);
    mesh = new THREE.Mesh(geo, ctx.kit.toon(color));
  }
  mesh.position.set(cx, y, cz);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);

  if (streaks) {
    const sg = new THREE.PlaneGeometry(1, 0.12);
    sg.rotateX(-Math.PI / 2);
    const inst = new THREE.InstancedMesh(sg, new THREE.MeshBasicMaterial({ color: shine, transparent: true, opacity: 0.75, fog: true }), streaks);
    inst.layers.set(FX_LAYER);
    const items = Array.from({ length: streaks }, () => ({
      x: cx + (rng() - 0.5) * size[0] * 0.9, z: cz + (rng() - 0.5) * size[1] * 0.9, len: between(rng, [1.5, 5]), ph: rng() * 6.28,
    }));
    inst.frustumCulled = false;
    ctx.scene.add(inst);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
    ctx.onFrame((t) => {
      items.forEach((it, i) => {
        const k = 0.5 + 0.5 * Math.sin(t * 0.8 + it.ph);
        const hy = mesh.userData.surface ? mesh.userData.surface(it.x, it.z, t) : 0;
        m.compose(p.set(it.x + Math.sin(t * 0.3 + it.ph) * 1.5, y + hy + 0.06, it.z), q, s.set(it.len * k + 0.01, 1, 1));
        inst.setMatrixAt(i, m);
      });
      inst.instanceMatrix.needsUpdate = true;
    });
  }
  return mesh;
}

// Flickering flame cones. Each entry: { pos: [x, y, z], h }.
export function flames(ctx, list, { outer = '#f08a2c', inner = '#ffe08a', fx = false } = {}) {
  const geo = new THREE.ConeGeometry(0.22, 1, 6);
  geo.translate(0, 0.5, 0);
  const o = new THREE.InstancedMesh(geo, ctx.kit.basic(outer), list.length);
  const i2 = new THREE.InstancedMesh(geo, ctx.kit.basic(inner), list.length);
  for (const mesh of [o, i2]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (fx) mesh.layers.set(FX_LAYER);
    ctx.scene.add(mesh);
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    list.forEach((f, i) => {
      const k = 1 + Math.sin(t * 9 + i * 1.7) * 0.15 + Math.sin(t * 15 + i) * 0.08;
      const w = f.w ?? 1;
      m.compose(p.set(...f.pos), q, s.set(w * 1.8, f.h * k, w * 1.8));
      o.setMatrixAt(i, m);
      m.compose(p.set(f.pos[0], f.pos[1], f.pos[2]), q, s.set(w, f.h * k * 0.6, w));
      i2.setMatrixAt(i, m);
    });
    o.instanceMatrix.needsUpdate = true;
    i2.instanceMatrix.needsUpdate = true;
  });
}

export function campfire(b, ctx, [x, z], { light = 9, distance = 14, size = 1 } = {}) {
  const y = ctx.groundHeight(x, z);
  for (let i = 0; i < 4; i++) b.add('#4a3020', cyl(0.09 * size, 0.09 * size, 1.1 * size, [x, y + 0.12, z], [0, i * 0.8, Math.PI / 2]));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.add('#6e6258', ball(0.18 * size, [x + Math.cos(a) * 0.7 * size, y + 0.08, z + Math.sin(a) * 0.7 * size], [1.2, 0.7, 1], 6));
  }
  flames(ctx, [
    { pos: [x, y + 0.1, z], h: 1.2 * size, w: size },
    { pos: [x + 0.25 * size, y + 0.1, z + 0.1], h: 0.8 * size, w: 0.8 * size },
    { pos: [x - 0.2 * size, y + 0.1, z - 0.15], h: 0.9 * size, w: 0.8 * size },
  ]);
  if (light) lamp(ctx, [x, y + 1.4, z], '#ffa850', light, distance);
  glow(ctx, [x, y + 0.8, z], 4 * size, '#ffb060', { opacity: 0.5, pulse: 0.08 });
  ctx.addCollider({ x, z, hx: 0.6 * size, hz: 0.6 * size, rot: 0, top: y + 1 });
}

// Flat-roofed house with a door, small windows and a parapet. Front faces local +z.
export function house(b, ctx, { pos, size, height, rot = 0, color, trim, roof = null, door = '#3a2418', upper = false, windowColor = '#2b1a12', collide = true }) {
  const [x, z] = pos;
  const [w, d] = size;
  const y = lowestGround(ctx, x, z, w, d, rot) - 0.3;
  const f = frameAt(x, y, z, rot);
  const h = height + 0.3;
  b.add(color, box(w, h, d, [0, h / 2, 0]), { frame: f, stone: true });
  b.add(trim ?? color, box(w + 0.3, 0.35, d + 0.3, [0, h + 0.1, 0]), { frame: f });
  if (roof) b.add(roof, box(w - 0.4, 0.2, d - 0.4, [0, h + 0.2, 0]), { frame: f });
  if (upper) {
    b.add(color, box(w * 0.45, 2.4, d * 0.5, [-w * 0.2, h + 1.2, -d * 0.18]), { frame: f, stone: true });
    b.add(trim ?? color, box(w * 0.45 + 0.25, 0.3, d * 0.5 + 0.25, [-w * 0.2, h + 2.45, -d * 0.18]), { frame: f });
  }
  b.add(door, box(1.1, 2.0, 0.12, [0, 1.3, d / 2 + 0.02]), { frame: f, cast: false });
  for (const sx of [-1, 1]) if (w > 4.5) b.add(windowColor, box(0.6, 0.6, 0.12, [sx * w * 0.3, h * 0.62, d / 2 + 0.02]), { frame: f, cast: false });
  if (collide) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + h + (upper ? 2.4 : 0) });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.8, hz: d / 2 + 0.8, rot });
}

// Two-pole banner on a staff.
export function banner(b, ctx, [x, z], { height = 4.5, color = '#b5523b', trim = '#efe3c2', pole = '#5a3a22', rot = 0, y = null }) {
  const gy = y ?? ctx.terrainHeight(x, z);
  const f = frameAt(x, gy, z, rot);
  b.add(pole, cyl(0.05, 0.06, height, [0, height / 2, 0], [0, 0, 0], 6), { frame: f });
  b.add(pole, cyl(0.035, 0.035, 1.3, [0, height - 0.2, 0], [0, 0, Math.PI / 2], 5), { frame: f });
  b.add(color, box(1.1, 1.5, 0.05, [0, height - 1.0, 0]), { frame: f });
  b.add(trim, box(1.1, 0.16, 0.06, [0, height - 1.7, 0]), { frame: f });
  b.add(trim, ball(0.1, [0, height + 0.08, 0], [1, 1, 1], 6), { frame: f });
}

// A closed Jaredite barge: a long tight dish with a peaked top and small hatches. Long axis is local x.
export function bargeGeometry({ length = 14, width = 5, height = 3.2 } = {}) {
  const hull = new THREE.SphereGeometry(1, 20, 12);
  const pos = hull.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const taper = 1 - Math.pow(Math.abs(x), 3) * 0.35;
    const lift = Math.pow(Math.abs(x), 3) * 0.18;
    pos.setXYZ(i, x * length / 2, (y * (y > 0 ? 0.72 : 0.4) + lift) * height, z * width / 2 * taper);
  }
  hull.computeVertexNormals();
  const ridge = new THREE.BoxGeometry(length * 0.36, 0.18, 0.25);
  ridge.translate(0, height * 0.72 + 0.02, 0);
  const hatchTop = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 8);
  hatchTop.translate(length * 0.18, height * 0.68, 0);
  const plank = [];
  for (const k of [-0.25, 0.05, 0.3]) {
    const band = new THREE.TorusGeometry(1, 0.035, 4, 24);
    band.rotateX(Math.PI / 2);
    band.scale(length * 0.5 * 1.005, 1, width * 0.5 * 1.01);
    band.translate(0, k * height, 0);
    plank.push(band);
  }
  return { hull, trim: mergeGeometries([ridge, hatchTop, ...plank].map((g) => (g.index ? g.toNonIndexed() : g))) };
}

// Ring of colliders that keeps the player on a walkable disc.
export function fence(ctx, [cx, cz], radius, { count = 48, top = 50 } = {}) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = cx + Math.sin(a) * radius, z = cz + Math.cos(a) * radius;
    ctx.addCollider({ x, z, hx: (Math.PI * radius) / count + 0.4, hz: 0.6, rot: -a, top });
  }
}

// Instanced boulders sitting on the terrain.
export function rocks(ctx, list, colors = ['#8a7b6a', '#7a6c5c', '#9a8a76'], { collide = true, seed = 3 } = {}) {
  const rng = makeRng(seed);
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), list.length);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  list.forEach(([x, z, r, yOff = 0], i) => {
    const y = ctx.terrainHeight(x, z) + r * 0.25 + yOff;
    m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rng() * 3, rng() * 3, rng() * 3)), new THREE.Vector3(r * between(rng, [1, 1.4]), r * between(rng, [0.6, 0.9]), r));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.set(pick(rng, colors)));
    if (collide) ctx.addCollider({ x, z, hx: r * 0.8, hz: r * 0.8, rot: 0, top: y + r * 0.7 });
  });
  mesh.castShadow = mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}

// Instanced dust puffs drifting low over the ground, for armies on the move.
export function dust(ctx, list, { color = '#c9a87a', shade = '#6b5240', seed = 6 } = {}) {
  const rng = makeRng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshToonMaterial({ color, emissive: shade, emissiveIntensity: 0.35, transparent: true, opacity: 0.55, depthWrite: false });
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  mesh.layers.set(FX_LAYER);
  mesh.frustumCulled = false;
  const items = list.map(([x, z, r]) => ({ x, z, r, y: ctx.terrainHeight(x, z) + r * 0.45, ph: rng() * 6.28 }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    items.forEach((it, i) => {
      const k = 1 + Math.sin(t * 0.6 + it.ph) * 0.08;
      m.compose(p.set(it.x + Math.sin(t * 0.2 + it.ph) * 1.2, it.y, it.z), q, s.set(it.r * k * 1.4, it.r * k * 0.7, it.r * k));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

// A rounded hill mesh standing on the terrain. Decorative: callers add colliders for its walkable or blocked parts.
export function makeNoiseHill(ctx, { center, radius, height, color, seed = 1, segments = 48, rings = 16, flatTop = 0, walk = false }) {
  const rng = makeRng(seed);
  const bumps = Array.from({ length: 6 }, () => [rng() * 6.28, between(rng, [1, 4]), between(rng, [0.04, 0.12])]);
  const pos = [];
  const idx = [];
  const [cx, cz] = center;
  const profile = (t) => (t < flatTop ? 1 : Math.pow(Math.cos(((t - flatTop) / (1 - flatTop)) * Math.PI / 2), 1.6));
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    for (let s = 0; s < segments; s++) {
      const a = (s / segments) * Math.PI * 2;
      let wob = 1;
      for (const [ph, f, amp] of bumps) wob += Math.sin(a * f + ph) * amp;
      const rr = t * radius * wob;
      const x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
      const y = ctx.terrainHeight(x, z) - 0.6 + height * profile(t) * (1 + (rng() - 0.5) * 0.06 * t);
      pos.push(x, y, z);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * segments + s, b2 = r * segments + ((s + 1) % segments);
      const c = a + segments, d = b2 + segments;
      idx.push(a, b2, c, b2, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, ctx.kit.toon(color));
  mesh.castShadow = mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  const heightAt = (x, z) => {
    const t = Math.hypot(x - cx, z - cz) / radius;
    return t >= 1 ? -Infinity : ctx.terrainHeight(x, z) - 0.6 + height * profile(t);
  };
  if (walk) {
    const steps = Math.ceil(height / 0.35);
    for (let k = 1; k <= steps; k++) {
      const top = (k / steps) * height;
      const t = profileInverse(profile, top / height);
      const half = t * radius * 0.82;
      if (half < 0.3) continue;
      ctx.addCollider({ x: cx, z: cz, hx: half, hz: half, rot: Math.PI / 4 * (k % 2), top: ctx.terrainHeight(cx, cz) - 0.6 + top, walkable: true });
    }
  }
  return { mesh, heightAt };
}

function profileInverse(profile, v) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (profile(mid) > v) lo = mid;
    else hi = mid;
  }
  return lo;
}
