import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure, personParts } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { between, makeRng, pick } from '../../engine/util.js';

export const NO_PLAZA = { center: [9999, 9999], size: [0, 0] };

export function toonStyle({ fog = '#efd8ad', near = 120, far = 1100, ink = '#2b1a12' } = {}) {
  return {
    ink,
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
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

export const NEPHITES = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const LAMANITES = {
  robes: ['#8c3b2a', '#a8552f', '#6b3a24', '#b5733b', '#5a4030', '#9a4a2e'],
  mantles: ['#3a2418', '#c8912e', '#6b3a24', '#2f6f6a', '#8c3b2a'],
  skins: ['#6e4228', '#7a4e33', '#8a5a3b', '#9c6a45'],
  hair: ['#1f140e', '#2b1a12'],
  wraps: ['#b5523b', '#c8912e', '#2f8f8a', '#e0c070'],
};

const add = (ctx, geos, color, { cast = true, emissive } = {}) => {
  if (!geos.length) return null;
  const mesh = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color, emissive ? { emissive } : {}));
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
};

const yawTo = (x, z, [tx, tz]) => Math.atan2(tx - x, tz - z);

// pose: stand, kneel, lie (face up), prone (face down), raise (arms up).
export function figure(ctx, { pos, facing, yaw, colors, scale = 1, glow = 0, pose = 'stand', lift = 0, clear = 0.9, roll = 0, arms }) {
  const [x, z] = pos;
  const c = { ...colors };
  if (pose === 'raise') c.arms = c.arms ?? [0.35, 2.6];
  if (pose === 'lie' || pose === 'prone') return fallen(ctx, { pos, yaw: (yaw ?? (facing ? yawTo(x, z, facing) : 0)) + (pose === 'lie' ? Math.PI : 0), colors, scale, lift, clear, roll, arms, faceUp: pose === 'lie' });
  const fig = makeFigure(c, ctx.kit, { glow });
  const outer = new THREE.Group();
  outer.add(fig);
  outer.position.set(x, ctx.groundHeight(x, z) + lift, z);
  outer.rotation.y = yaw ?? (facing ? yawTo(x, z, facing) : 0);
  if (pose === 'kneel') {
    fig.scale.set(1.12, 0.6, 1.12);
  }
  outer.scale.setScalar(scale);
  ctx.scene.add(outer);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return outer;
}

// A person lying on the ground: flattened robe over a cloth pool, head, splayed arms and feet.
// The head points along local +z. arms: 'reach' (flung past the head), 'out' (spread wide) or 'side'.
export function fallen(ctx, { pos, yaw = 0, colors, scale = 1, lift = 0, clear = 1.1, roll = 0, faceUp = true, arms }) {
  const [x, z] = pos;
  const parts = personParts();
  const lay = (g) => g.rotateX(Math.PI / 2).translate(0, 0, -0.85).scale(1, 0.52, 1).rotateZ(roll * 0.4).translate(0, 0.16, 0);
  const robe = [lay(parts.robe), new THREE.CylinderGeometry(1, 1, 0.05, 18).scale(0.48, 1, 0.62).translate(0, 0.025, -0.4)];
  const mantle = [lay(parts.mantle)];
  const headZ = 0.76;
  const skin = [new THREE.SphereGeometry(0.14, 12, 9).translate(0, 0.15, headZ)];
  const hair = [new THREE.SphereGeometry(0.143, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55).rotateX(faceUp ? 1.9 : 0.75).translate(0, 0.155, headZ + 0.01)];
  for (const s of [-1, 1]) skin.push(new THREE.SphereGeometry(0.065, 8, 6).scale(1, faceUp ? 1.7 : 0.8, faceUp ? 1 : 1.6).translate(s * 0.1, faceUp ? 0.11 : 0.06, -0.9));
  const kind = arms ?? (roll > 0.1 ? 'reach' : roll < -0.1 ? 'out' : 'side');
  const dirs = {
    reach: [[-0.35, 0, 1], [0.45, 0, 0.9]],
    out: [[-1, 0, 0.35], [1, 0, -0.1]],
    side: [[-0.3, 0, -1], [0.75, 0, 0.55]],
  }[kind];
  const sleeves = [];
  const up = new THREE.Vector3(0, 1, 0);
  dirs.forEach(([dx, , dz], i) => {
    const d = new THREE.Vector3(dx, 0, dz).normalize();
    const sh = new THREE.Vector3(i ? 0.21 : -0.21, 0.13, 0.5);
    const mid = sh.clone().addScaledVector(d, 0.3);
    sleeves.push(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d)).translate(mid.x, 0.09, mid.z));
    const hand = sh.clone().addScaledVector(d, 0.6);
    skin.push(new THREE.SphereGeometry(0.06, 8, 6).translate(hand.x, 0.06, hand.z));
  });
  const group = new THREE.Group();
  const glow = colors.glow ?? 0;
  for (const [geos, color] of [[robe, colors.robe], [[...mantle, ...sleeves], colors.mantle], [skin, colors.skin], [hair, colors.hair]]) {
    const mesh = new THREE.Mesh(mergeGeometries(geos.map((g) => g.toNonIndexed())), ctx.kit.toon(color, glow ? { emissive: new THREE.Color(color).multiplyScalar(glow) } : {}));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  if (colors.sash) {
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 16), ctx.kit.toon(colors.sash));
    sash.scale.set(1, 0.52, 1);
    sash.position.set(0, 0.16, 0.13);
    group.add(sash);
  }
  group.position.set(x, ctx.groundHeight(x, z) + lift, z);
  group.rotation.y = yaw;
  group.scale.setScalar(scale);
  ctx.scene.add(group);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return group;
}

// A slinger: one arm aims at the target, the other whirls a sling overhead.
export function slinger(ctx, { pos, facing, colors, scale = 1, speed = 9 }) {
  const fig = figure(ctx, { pos, facing, scale, colors: { ...colors, arms: undefined } });
  const mat = (c) => ctx.kit.toon(c);
  const arm = (side, rx, rz) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.2, 1.32, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), mat(colors.mantle));
    sleeve.position.y = -0.26;
    sleeve.castShadow = true;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat(colors.skin));
    hand.position.y = -0.55;
    shoulder.add(sleeve, hand);
    shoulder.rotation.set(rx, 0, rz);
    fig.children[0].add(shoulder);
    return shoulder;
  };
  arm(1, -1.45, 0.15);
  const raised = arm(-1, -2.75, -0.35);
  const spin = new THREE.Group();
  spin.position.set(0, -0.6, 0);
  raised.add(spin);
  const whirl = new THREE.Group();
  whirl.rotation.x = Math.PI - 2.75;
  spin.add(whirl);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.85, 4).rotateZ(Math.PI / 2).translate(0.42, 0, 0), mat('#5a3a22'));
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6).scale(1.3, 0.7, 1), mat('#6b4a33'));
  pouch.position.x = 0.86;
  const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), mat('#8a7a64'));
  stone.position.set(0.86, 0.06, 0);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.98, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#fff6dc', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
  ring.layers.set(FX_LAYER);
  const rotor = new THREE.Group();
  rotor.add(cord, pouch, stone);
  whirl.add(rotor, ring);
  ctx.onFrame((t) => { rotor.rotation.y = -t * speed; });
  return fig;
}

// Low pitched-roof adobe houses, merged into three meshes.
export function huts(ctx, list, { wall = '#c9a777', roof = '#8a6a3a', door = '#2b1a12' } = {}) {
  const walls = [], roofs = [], doors = [];
  const m = new THREE.Matrix4();
  for (const h of list) {
    const [x, z] = h.pos;
    const [w, d] = h.size ?? [5, 4];
    const ht = h.height ?? 2.6;
    const rot = h.rot ?? 0;
    const y = ctx.terrainHeight(x, z) - 0.15;
    m.makeRotationY(rot).setPosition(x, y, z);
    const body = new THREE.BoxGeometry(w, ht, d).translate(0, ht / 2, 0);
    walls.push(body.applyMatrix4(m));
    const r = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4);
    r.scale(w * 1.25, h.roofHeight ?? 1.8, d * 1.3).translate(0, ht + (h.roofHeight ?? 1.8) / 2, 0);
    roofs.push(r.applyMatrix4(m));
    doors.push(new THREE.BoxGeometry(1.0, 1.8, 0.12).translate(0, 0.9, d / 2 + 0.02).applyMatrix4(m));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: -rot, top: y + ht + 1.5 });
    ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 1, hz: d / 2 + 1, rot: -rot });
  }
  add(ctx, walls, wall);
  add(ctx, roofs, roof);
  add(ctx, doors, door, { cast: false });
}

export function tents(ctx, list, colors = ['#d9c7a3', '#b5916a', '#a87b4f', '#e6d8b8']) {
  const rng = makeRng(91);
  const byColor = new Map();
  for (const t of list) {
    const [x, z] = t.pos;
    const r = t.radius ?? 1.8, h = t.height ?? 2.6;
    const g = new THREE.ConeGeometry(r, h, 7, 1).translate(x, ctx.terrainHeight(x, z) + h / 2 - 0.05, z);
    const c = t.color ?? pick(rng, colors);
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push(g);
    ctx.addCollider({ x, z, hx: r * 0.7, hz: r * 0.7, rot: 0, top: ctx.terrainHeight(x, z) + h });
    ctx.exclude({ kind: 'circle', x, z, r: r + 0.6 });
  }
  for (const [c, geos] of byColor) add(ctx, geos, c);
}

// Sheep or cattle: one instanced body mesh and one instanced dark mesh for head and legs.
export function flock(ctx, { center, radius = [0, 8], count = 40, seed = 5, facing, jitter = 1.2, kind = 'sheep', colors, rect, avoidBlocked = true, graze = 0.3 }) {
  const rng = makeRng(seed);
  const cattle = kind === 'cattle';
  const body = new THREE.SphereGeometry(1, 10, 8).scale(0.32, 0.27, 0.48).translate(0, 0.6, 0);
  const dark = mergeGeometries([
    new THREE.SphereGeometry(0.14, 8, 6).scale(1, 1, 1.4).translate(0, 0.72, 0.52),
    ...[[-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]].map(([lx, lz]) => new THREE.CylinderGeometry(0.045, 0.04, 0.45, 5).translate(lx, 0.22, lz)),
    ...(cattle ? [-1, 1].map((s) => new THREE.ConeGeometry(0.03, 0.2, 4).rotateZ(-s * 1.1).translate(s * 0.12, 0.86, 0.48)) : []),
  ]);
  const wool = colors ?? (cattle ? ['#8a5a3c', '#6b4a33', '#a87b4f', '#c8a97a'] : ['#f1ead8', '#e6dcc4', '#d8cdb4', '#efe6d0', '#5a4636']);
  const bodies = new THREE.InstancedMesh(body, ctx.kit.toon('#ffffff'), count);
  const heads = new THREE.InstancedMesh(dark, ctx.kit.toon(cattle ? '#3a2418' : '#3a2a22'), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  const s = cattle ? 1.7 : 1;
  let n = 0;
  for (let tries = 0; n < count && tries < count * 30; tries++) {
    let x, z;
    if (rect) {
      x = center[0] + (rng() - 0.5) * rect[0];
      z = center[1] + (rng() - 0.5) * rect[1];
    } else {
      const a = rng() * Math.PI * 2, r = Math.sqrt(between(rng, [radius[0] ** 2, radius[1] ** 2]));
      x = center[0] + Math.sin(a) * r;
      z = center[1] + Math.cos(a) * r;
    }
    if (avoidBlocked && ctx.blocked(x, z, 0.4)) continue;
    const yaw = (facing ? yawTo(x, z, facing) : rng() * 6.28) + (rng() - 0.5) * jitter;
    const grazing = rng() < graze;
    e.set(grazing ? 0.25 : 0, yaw, 0);
    const k = s * between(rng, [0.85, 1.12]);
    m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z) - 0.03, z), q.setFromEuler(e), new THREE.Vector3(k, k, k));
    bodies.setMatrixAt(n, m);
    heads.setMatrixAt(n, m);
    bodies.setColorAt(n, c.set(pick(rng, wool)));
    n++;
  }
  bodies.count = heads.count = n;
  for (const mesh of [bodies, heads]) {
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  return n;
}

// Campfire: logs, a stone ring, flickering flame cones and a glow sprite.
export function fires(ctx, list, { light = true } = {}) {
  const logs = [], ring = [], flames = [];
  const rng = makeRng(13);
  for (const f of list) {
    const [x, z] = f.pos;
    const y = ctx.terrainHeight(x, z);
    const s = f.size ?? 1;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI + rng() * 0.3;
      logs.push(new THREE.CylinderGeometry(0.08 * s, 0.1 * s, 1.1 * s, 6).rotateZ(Math.PI / 2 - 0.25).rotateY(a).translate(x, y + 0.18 * s, z));
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ring.push(new THREE.IcosahedronGeometry(0.16 * s, 0).translate(x + Math.sin(a) * 0.7 * s, y + 0.06, z + Math.cos(a) * 0.7 * s));
    }
    if (!f.out) for (let i = 0; i < 3; i++) flames.push({ x: x + (rng() - 0.5) * 0.35 * s, y: y + 0.1, z: z + (rng() - 0.5) * 0.35 * s, h: s * between(rng, [0.7, 1.2]) * (f.low ? 0.45 : 1), r: s, phase: rng() * 9 });
    ctx.exclude({ kind: 'circle', x, z, r: 1.1 * s });
    ctx.addCollider({ x, z, hx: 0.5 * s, hz: 0.5 * s, rot: 0, top: y + 0.7 });
  }
  add(ctx, logs, '#3a2418');
  add(ctx, ring, '#7a6a5a');
  if (!flames.length) return;
  const geo = new THREE.ConeGeometry(0.28, 1, 6).translate(0, 0.5, 0);
  const outer = new THREE.InstancedMesh(geo, ctx.kit.basic(ctx.style.flameOuter), flames.length);
  const inner = new THREE.InstancedMesh(geo, ctx.kit.basic(ctx.style.flameInner), flames.length);
  for (const mesh of [outer, inner]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const tex = glowTexture();
  list.filter((f) => !f.out).forEach((f) => {
    const [x, z] = f.pos;
    const s = f.size ?? 1;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: f.glow ?? '#ffb060', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: f.low ? 0.45 : 0.75, fog: false }));
    sprite.position.set(x, ctx.terrainHeight(x, z) + 0.8 * s, z);
    sprite.scale.setScalar(4 * s);
    sprite.layers.set(FX_LAYER);
    ctx.scene.add(sprite);
    if (light && f.light) {
      const p = new THREE.PointLight(f.lightColor ?? '#ff9a4a', f.light, f.lightDistance ?? 14, 1.5);
      p.position.set(x, ctx.terrainHeight(x, z) + 1.4, z);
      ctx.scene.add(p);
    }
  });
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  ctx.onFrame((t) => {
    flames.forEach((f, i) => {
      const flick = 0.75 + 0.25 * Math.sin(t * 9 + f.phase) * Math.sin(t * 5.3 + f.phase * 2);
      outer.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(f.r, f.h * flick, f.r)));
      inner.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(f.r * 0.5, f.h * flick * 0.6, f.r * 0.5)));
    });
    outer.instanceMatrix.needsUpdate = inner.instanceMatrix.needsUpdate = true;
  });
}

const jarGeo = () => new THREE.LatheGeometry(
  [[0.001, 0], [0.14, 0.02], [0.24, 0.18], [0.26, 0.34], [0.2, 0.5], [0.09, 0.6], [0.08, 0.7], [0.12, 0.74]].map(([r, y]) => new THREE.Vector2(r, y)),
  10,
);

export function jars(ctx, list, color = '#b5623b') {
  const geos = [];
  for (const j of list) {
    const [x, z] = j.pos;
    const s = j.scale ?? 1;
    const g = jarGeo().scale(s, s, s);
    if (j.tipped) g.rotateZ(Math.PI / 2).translate(0, 0.24 * s, 0).rotateY(j.rot ?? 0);
    geos.push(g.translate(x, ctx.terrainHeight(x, z), z));
  }
  add(ctx, geos, color);
}

// Thin rods from point to point: spears, staffs, poles, scrolls.
export function rods(ctx, list, color = '#5a3a22', radius = 0.035) {
  const geos = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (const r of list) {
    const a = new THREE.Vector3(...r.from), b = new THREE.Vector3(...r.to);
    if (r.ground) {
      a.y += ctx.terrainHeight(a.x, a.z);
      b.y += ctx.terrainHeight(b.x, b.z);
    }
    const len = a.distanceTo(b);
    const g = new THREE.CylinderGeometry(r.radius ?? radius, r.radius ?? radius, len, 6);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, b.clone().sub(a).normalize()));
    g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    geos.push(g);
  }
  add(ctx, geos, color);
}

// Rounded rock masses for ridges, passes and boulders.
export function rocks(ctx, list, colors = ['#7d6a58', '#8a7662', '#6e5d4e']) {
  const rng = makeRng(23);
  const byColor = new Map();
  for (const r of list) {
    const [x, z] = r.pos;
    const [sx, sy, sz] = r.size;
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position;
    const sd = rng() * 10;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
      const k = 0.9 + 0.12 * Math.sin(vx * 3.1 + sd) * Math.cos(vz * 2.7 - sd) + 0.08 * Math.sin(vy * 4.3 + vx * 2 + sd * 2);
      p.setXYZ(i, p.getX(i) * k, Math.max(p.getY(i) * k, -0.3), p.getZ(i) * k);
    }
    g.computeVertexNormals();
    g.scale(sx, sy, sz).rotateY(r.rot ?? 0).translate(x, ctx.terrainHeight(x, z) - sy * 0.12, z);
    const c = r.color ?? pick(rng, colors);
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c).push(g);
    if (r.collide !== false) ctx.addCollider({ x, z, hx: sx * 0.8, hz: sz * 0.8, rot: -(r.rot ?? 0), top: ctx.terrainHeight(x, z) + sy });
    ctx.exclude({ kind: 'rect', x, z, hx: sx, hz: sz, rot: -(r.rot ?? 0) });
  }
  for (const [c, geos] of byColor) add(ctx, geos, c);
}

// Flat water with drifting light streaks. Blocks walking just above step height.
export function water(ctx, { center, size, rot = 0, color = '#3f8ea0', streak = '#cfeef0', flow = [1, 0], level }) {
  const [cx, cz] = center;
  const [w, d] = size;
  let y = level ?? -Infinity;
  if (level === undefined) {
    for (let i = -1; i <= 1; i += 0.25) for (let j = -1; j <= 1; j += 0.25) {
      const lx = (i * w) / 2, lz = (j * d) / 2;
      const x = cx + lx * Math.cos(rot) + lz * Math.sin(rot), z = cz - lx * Math.sin(rot) + lz * Math.cos(rot);
      y = Math.max(y, ctx.terrainHeight(x, z));
    }
    y += 0.06;
  }
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), ctx.kit.toon(color));
  plane.position.set(cx, y, cz);
  plane.rotation.y = rot;
  plane.receiveShadow = true;
  ctx.scene.add(plane);
  const rng = makeRng(31);
  const n = Math.round((w * d) / 30);
  const geo = new THREE.PlaneGeometry(1, 0.12).rotateX(-Math.PI / 2);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.basic(streak), n);
  const items = Array.from({ length: n }, () => ({ u: rng() - 0.5, v: rng() - 0.5, len: between(rng, [1, 3.5]), phase: rng() }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot + Math.atan2(-flow[1], flow[0]), 0)), v = new THREE.Vector3(), s = new THREE.Vector3();
  const fl = Math.hypot(flow[0], flow[1]) || 1;
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    items.forEach((it, i) => {
      const u = ((it.u + 0.5 + t * 0.03 * (flow[0] / fl) + it.phase) % 1) - 0.5;
      const vv = ((it.v + 0.5 + t * 0.03 * (flow[1] / fl)) % 1 + 1) % 1 - 0.5;
      const lx = u * (w - 3), lz = vv * (d - 1);
      const fade = Math.sin(Math.PI * (u + 0.5));
      m.compose(v.set(cx + lx * Math.cos(rot) + lz * Math.sin(rot), y + 0.02, cz - lx * Math.sin(rot) + lz * Math.cos(rot)), q, s.set(it.len * fade + 0.01, 1, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  ctx.addCollider({ x: cx, z: cz, hx: w / 2, hz: d / 2, rot: -rot, top: y + 0.7 });
  ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: w / 2 + 0.5, hz: d / 2 + 0.5, rot: -rot });
  return y;
}

// Rows of grain as low ridged boxes.
export function field(ctx, { center, size, rot = 0, color = '#d8b85a', soil = '#9a7048', rows = 7 }) {
  const [cx, cz] = center;
  const [w, d] = size;
  const crop = [], dirt = [];
  const m = new THREE.Matrix4().makeRotationY(rot).setPosition(cx, ctx.terrainHeight(cx, cz), cz);
  dirt.push(new THREE.BoxGeometry(w, 0.1, d).applyMatrix4(m));
  for (let i = 0; i < rows; i++) {
    const lz = -d / 2 + ((i + 0.5) / rows) * d;
    const r = (d / rows) * 0.42;
    crop.push(new THREE.CylinderGeometry(r, r, w * 0.96, 3).rotateZ(Math.PI / 2).rotateX(Math.PI / 6).scale(1, 0.9 / r / 2, 1).translate(0, 0.4, lz).applyMatrix4(m));
  }
  add(ctx, dirt, soil, { cast: false });
  add(ctx, crop, color);
  ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: w / 2, hz: d / 2, rot: -rot });
}

// A ground-hugging line of stones and dirt along a path, drawn as a flat ribbon.
export function road(ctx, points, { width = 4, color = '#c9a06a' } = {}) {
  const pos = [], idx = [];
  points.forEach(([x, z], i) => {
    const [px, pz] = points[Math.max(0, i - 1)], [nx, nz] = points[Math.min(points.length - 1, i + 1)];
    let dx = nx - px, dz = nz - pz;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l;
    dz /= l;
    for (const s of [-1, 1]) {
      const vx = x - dz * (width / 2) * s, vz = z + dx * (width / 2) * s;
      pos.push(vx, ctx.terrainHeight(vx, vz) + 0.04, vz);
    }
    if (i < points.length - 1) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mat = new THREE.MeshToonMaterial({ color, gradientMap: ctx.kit.gradient, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}

// Points spread along a polyline, for columns of walking people.
export function alongPath(points, n, spread, seed = 7) {
  const rng = makeRng(seed);
  const segs = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const l = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    segs.push(l);
    total += l;
  }
  return Array.from({ length: n }, () => {
    let d = rng() * total, i = 0;
    while (d > segs[i] && i < segs.length - 1) d -= segs[i++];
    const t = d / segs[i];
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = (bx - ax) / segs[i], dz = (bz - az) / segs[i];
    const off = (rng() - 0.5) * 2 * spread;
    return { x: ax + (bx - ax) * t - dz * off, z: az + (bz - az) * t + dx * off, dir: [dx, dz] };
  });
}

export function stars(ctx, { count = 900, color = '#f4f0ff', minY = 0.08, seed = 4 } = {}) {
  const rng = makeRng(seed);
  const pos = [];
  while (pos.length < count * 3) {
    const v = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5);
    if (v.lengthSq() > 0.25 || v.lengthSq() < 0.01) continue;
    v.normalize();
    if (v.y < minY) continue;
    pos.push(v.x * 1500, v.y * 1500, v.z * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size: 2.2, sizeAttenuation: false, fog: false, depthWrite: false }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  pts.renderOrder = -900;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => pts.position.copy(camera.position));
}

export function glowSprite(ctx, { pos, size, color, opacity = 0.8 }) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(...pos);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  return s;
}

export function moon(ctx, { dir = [-0.4, 0.45, -0.8], size = 16, color = '#f3eedc' } = {}) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  disc.frustumCulled = false;
  ctx.scene.add(disc);
  const halo = glowSprite(ctx, { pos: [0, 0, 0], size: size * 5, color: '#9fb0e0', opacity: 0.45 });
  halo.frustumCulled = false;
  ctx.onFrame((t, dt, camera) => {
    disc.position.copy(camera.position).add(d);
    disc.lookAt(camera.position);
    halo.position.copy(disc.position);
  });
}
