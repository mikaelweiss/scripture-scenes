import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure, personParts } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';
import { between, makeRng, pick } from '../../engine/util.js';

const HEAD_Y = 1.58;
const BODY_TOP = 1.46;

export const PERIOD = {
  coats: ['#2b2b33', '#3a3530', '#4a3b2e', '#252a35', '#5a4632', '#3d3d3d', '#4b3a2a', '#34302c', '#3f4652'],
  dresses: ['#5a4a6a', '#3e4a5e', '#6b4a3a', '#7a6a52', '#4a5a4a', '#8a6a5a', '#2f3340', '#6a5a7a', '#7b4b45', '#56606e'],
  shawls: ['#8a3a2e', '#c9b48a', '#4a4a5a', '#6b5a3a', '#e8dcc0', '#5d6b52', '#9a7a5a'],
  bonnets: ['#e8e0cc', '#3a3530', '#d9cdb0', '#5a4a3a', '#f1ece0'],
  hats: ['#1f1c1a', '#2e2924', '#3a3128', '#4a4034'],
  skins: ['#e8c3a0', '#dfb48e', '#d4a57e', '#eccbab', '#c9966e'],
  hair: ['#3a2418', '#5a3a22', '#7a5530', '#2b1a12', '#8a6a48', '#b8a890', '#4a3020'],
};

const lathe = (pts, seg = 12) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

function shadeBelow(geo, y0, f) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const v = pos.getY(i) < y0 ? f : 1;
    col.set([v, v, v], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

let partsCache = null;
export function periodParts() {
  if (partsCache) return partsCache;
  const base = personParts();
  const man = shadeBelow(lathe([[0.001, 0], [0.15, 0], [0.15, 0.06], [0.16, 0.5], [0.255, 0.5], [0.235, 0.8], [0.21, 1.0], [0.245, 1.27], [0.14, 1.41], [0.001, BODY_TOP]]), 0.495, 0.62);
  const woman = shadeBelow(lathe([[0.001, 0], [0.34, 0], [0.33, 0.1], [0.26, 0.6], [0.19, 0.98], [0.21, 1.25], [0.13, 1.41], [0.001, BODY_TOP]]), -1, 1);
  const collar = new THREE.TorusGeometry(0.1, 0.035, 6, 14);
  collar.rotateX(Math.PI / 2);
  collar.translate(0, 1.42, 0.01);
  const crown = new THREE.CylinderGeometry(0.112, 0.124, 0.17, 12);
  crown.translate(0, HEAD_Y + 0.16, -0.01);
  const brim = new THREE.CylinderGeometry(0.215, 0.215, 0.022, 16);
  brim.translate(0, HEAD_Y + 0.08, -0.01);
  const hat = mergeGeometries([crown, brim]);
  const bonnet = new THREE.SphereGeometry(0.168, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.62);
  bonnet.rotateX(-0.95);
  bonnet.translate(0, HEAD_Y + 0.02, -0.015);
  partsCache = { man, woman, collar, hat, bonnet, shawl: base.mantle, head: base.head, hair: base.hair, robe: base.robe };
  return partsCache;
}

function vcMaterial(kit) {
  return new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: kit.gradient });
}

const POSE_BODY = { stand: 1, sit: 0.774, kneel: 0.6 };

function poseMatrices(p) {
  const e = new THREE.Euler(p.lean ?? 0, p.yaw, 0, 'YXZ');
  const s = p.scale;
  const base = new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(s, s, s));
  const by = POSE_BODY[p.pose ?? 'stand'];
  const wide = p.pose === 'stand' ? 1 : 1.1;
  const drop = BODY_TOP * (1 - by);
  const hs = p.child ? 1.3 : 1;
  const body = base.clone().multiply(new THREE.Matrix4().makeScale(wide, by, wide));
  const head = base.clone().multiply(new THREE.Matrix4().makeTranslation(0, HEAD_Y - drop, 0))
    .multiply(new THREE.Matrix4().makeScale(hs, hs, hs))
    .multiply(new THREE.Matrix4().makeTranslation(0, -HEAD_Y, 0));
  return { body, head };
}

function faceYaw(p) {
  if (p.yaw != null) return p.yaw;
  return Math.atan2(p.face[0] - p.x, p.face[1] - p.z);
}

// People as instanced meshes. Each entry: { x, z, y?, yaw | face, kind: 'man'|'woman', child?, pose?, hat?, colors? }.
export function periodCrowd(ctx, list, { seed = 5, palette = PERIOD, hats = 0, jitter = 0.25 } = {}) {
  const rng = makeRng(seed);
  const parts = periodParts();
  const buckets = { man: [], woman: [], collar: [], shawl: [], head: [], hair: [], hat: [], bonnet: [] };
  const c = new THREE.Color();
  for (const src of list) {
    const p = { ...src };
    p.y = p.y ?? ctx.groundHeight(p.x, p.z);
    p.yaw = faceYaw(p) + (rng() - 0.5) * jitter;
    p.scale = p.scale ?? (p.child ? between(rng, [0.55, 0.68]) : between(rng, [0.93, 1.07]));
    p.lean = p.lean ?? 0.05 * (rng() - 0.3);
    const m = poseMatrices(p);
    const col = p.colors ?? {};
    const woman = p.kind === 'woman';
    buckets[woman ? 'woman' : 'man'].push([m.body, col.body ?? pick(rng, woman ? palette.dresses : palette.coats)]);
    buckets.collar.push([m.body, col.collar ?? '#f4efe2']);
    buckets.head.push([m.head, col.skin ?? pick(rng, palette.skins)]);
    const hair = col.hair ?? pick(rng, palette.hair);
    if (woman) {
      buckets.shawl.push([m.body, col.shawl ?? pick(rng, palette.shawls)]);
      if (p.bonnet ?? rng() < 0.6) buckets.bonnet.push([m.head, col.bonnet ?? pick(rng, palette.bonnets)]);
      else buckets.hair.push([m.head, hair]);
    } else {
      buckets.hair.push([m.head, hair]);
      if (p.hat ?? rng() < hats) buckets.hat.push([m.head, col.hat ?? pick(rng, palette.hats)]);
    }
  }
  const vc = vcMaterial(ctx.kit);
  for (const [name, items] of Object.entries(buckets)) {
    if (!items.length) continue;
    const mat = name === 'man' || name === 'woman' ? vc : ctx.kit.toon('#ffffff');
    const mesh = new THREE.InstancedMesh(parts[name], mat, items.length);
    items.forEach(([mm, cc], i) => {
      mesh.setMatrixAt(i, mm);
      mesh.setColorAt(i, c.set(cc));
    });
    mesh.castShadow = name !== 'collar' && name !== 'hair';
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  return list.length;
}

// One named period figure, optionally with arms. arms: [spread, forward] radians.
export function periodPerson(ctx, { pos, y, face, yaw, kind = 'man', pose = 'stand', scale = 1, hat = false, bonnet = false, arms, colors }) {
  const parts = periodParts();
  const k = ctx.kit;
  const g = new THREE.Group();
  const woman = kind === 'woman';
  const by = POSE_BODY[pose];
  const body = new THREE.Group();
  body.scale.set(pose === 'stand' ? 1 : 1.1, by, pose === 'stand' ? 1 : 1.1);
  const head = new THREE.Group();
  head.position.y = -BODY_TOP * (1 - by);
  const bodyMat = vcMaterial(k);
  bodyMat.color.set(colors.body);
  const add = (parent, geo, mat) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    parent.add(m);
  };
  add(body, woman ? parts.woman : parts.man, bodyMat);
  add(body, parts.collar, k.toon(colors.collar ?? '#f4efe2'));
  if (woman) add(body, parts.shawl, k.toon(colors.shawl ?? '#8a3a2e'));
  add(head, parts.head, k.toon(colors.skin ?? '#e0b48e'));
  if (bonnet) add(head, parts.bonnet, k.toon(colors.bonnet ?? '#e8e0cc'));
  else add(head, parts.hair, k.toon(colors.hair ?? '#4a3020'));
  if (hat) add(head, parts.hat, k.toon(colors.hat ?? '#1f1c1a'));
  g.add(body, head);
  if (arms) {
    for (const side of [-1, 1]) {
      const sh = new THREE.Group();
      sh.position.set(side * 0.21, 1.33 - BODY_TOP * (1 - by), 0);
      const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.42, 4, 8), k.toon(colors.body));
      sleeve.position.y = -0.26;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), k.toon(colors.skin ?? '#e0b48e'));
      hand.position.y = -0.55;
      sh.add(sleeve, hand);
      const [spread, fwd] = Array.isArray(arms[0]) ? arms[side < 0 ? 0 : 1] : arms;
      sh.rotation.set(-fwd, 0, side * spread);
      sleeve.castShadow = true;
      g.add(sh);
    }
  }
  const [x, z] = pos;
  g.position.set(x, y ?? ctx.groundHeight(x, z), z);
  g.scale.setScalar(scale);
  g.rotation.y = yaw ?? (face ? Math.atan2(face[0] - x, face[1] - z) : 0);
  ctx.scene.add(g);
  return g;
}

// A divine messenger: faceless white figure with a soft halo of light.
export function heavenly(ctx, { pos, y, face, scale = 1.1, arms = [0.35, 0.3], glow = 0.55, halo = 6, haloOpacity = 0.8, light = 10, color = '#fbf7ee' }) {
  const fig = makeFigure({ robe: color, mantle: '#f4efe2', skin: '#fff6e6', hair: '#fff6e6', sash: '#efe6d0', arms }, ctx.kit, { glow });
  const [x, z] = pos;
  const baseY = y ?? ctx.groundHeight(x, z);
  fig.position.set(x, baseY, z);
  fig.scale.setScalar(scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(fig);
  glowSprite(ctx, [x, baseY + 1.2 * scale, z], halo, '#fff3d0', haloOpacity);
  if (light) {
    const l = new THREE.PointLight('#ffe8b8', light, 9, 1.5);
    l.position.set(x, baseY + 2.4, z);
    ctx.scene.add(l);
  }
  return fig;
}

export function glowSprite(ctx, [x, y, z], size, color = '#fff3d0', opacity = 0.7) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  return s;
}

// Light shaft from the sky down to a point, drawn as soft additive cones.
export function lightShaft(ctx, { at, top = 60, radius = [1.5, 6], color = '#fff2c9', opacity = 0.16, layers = 3 }) {
  const [x, y, z] = at;
  for (let i = 0; i < layers; i++) {
    const f = 1 - i * 0.25;
    const geo = new THREE.CylinderGeometry(radius[1] * f, radius[0] * f, top, 24, 1, true);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y + top / 2, z);
    m.layers.set(FX_LAYER);
    ctx.scene.add(m);
  }
}

// The player avatar is created after custom(); this finds it on the first frame and dresses it.
export function trackAvatar(ctx, { kind = 'man', hat = false, colors } = {}) {
  const state = { pos: new THREE.Vector3(), ready: false };
  ctx.onFrame(() => {
    const scene = ctx.scene;
    if (!state.ready) {
      state.avatar = scene.children[scene.children.length - 1];
      state.ready = true;
      const parts = periodParts();
      const [robe, mantle] = state.avatar.children;
      if (robe?.isMesh) {
        robe.geometry = kind === 'woman' ? parts.woman : parts.man;
        if (kind !== 'woman') mantle.visible = false;
        const collar = new THREE.Mesh(parts.collar, ctx.kit.toon('#f4efe2'));
        state.avatar.add(collar);
        if (hat) {
          const h = new THREE.Mesh(parts.hat, ctx.kit.toon(colors?.hat ?? '#1f1c1a'));
          h.castShadow = true;
          state.avatar.add(h);
        }
      }
    }
    state.pos.copy(state.avatar.position);
  });
  return state;
}

function wallPieces(L, h, openings) {
  const pieces = [];
  const sorted = [...openings].sort((a, b) => a.at - b.at);
  let u = 0;
  for (const o of sorted) {
    const a = o.at - o.width / 2, b = o.at + o.width / 2;
    if (a > u) pieces.push({ u0: u, u1: a, y0: 0, y1: h, solid: true });
    if (o.bottom > 0) pieces.push({ u0: a, u1: b, y0: 0, y1: o.bottom, solid: true });
    if (o.top < h) pieces.push({ u0: a, u1: b, y0: o.top, y1: h, solid: false });
    u = b;
  }
  if (u < L) pieces.push({ u0: u, u1: L, y0: 0, y1: h, solid: true });
  return pieces;
}

// Rectangular room with optional openings, cutaway walls and a roof shown only while the player is outside.
// openings: { n|s|e|w: [{ at (m from west or north end), width, bottom, top, kind: 'window'|'door' }] }
export function room(ctx, spec) {
  const { x = 0, z = 0, w, d, h, y = 0, t = 0.3, kind = 'plain', color = '#efe9dc', chink = '#c8b89a', trim = '#f7f3ea', glass = '#a9cbd6', colliderTop = 2.9, openings = {}, avatar } = spec;
  const k = ctx.kit;
  const walls = [];
  const sides = {
    n: { p0: [x - w / 2 - t / 2, z - d / 2], p1: [x + w / 2 + t / 2, z - d / 2], n: [0, -1] },
    s: { p0: [x - w / 2 - t / 2, z + d / 2], p1: [x + w / 2 + t / 2, z + d / 2], n: [0, 1] },
    w: { p0: [x - w / 2, z - d / 2], p1: [x - w / 2, z + d / 2], n: [-1, 0] },
    e: { p0: [x + w / 2, z - d / 2], p1: [x + w / 2, z + d / 2], n: [1, 0] },
  };
  for (const [key, sd] of Object.entries(sides)) {
    if (spec.skip?.includes(key)) continue;
    const [x0, z0] = sd.p0, [x1, z1] = sd.p1;
    const L = Math.hypot(x1 - x0, z1 - z0);
    const ang = Math.atan2(z1 - z0, x1 - x0);
    const grp = new THREE.Group();
    grp.position.set(x0, y, z0);
    grp.rotation.y = -ang;
    const ops = (openings[key] ?? []).map((o) => ({ bottom: 0, top: 2.1, ...o, at: o.at + (key === 'n' || key === 's' ? t / 2 : 0) }));
    const solid = [], logs = [], frames = [], panes = [];
    for (const pc of wallPieces(L, h, ops)) {
      const pw = pc.u1 - pc.u0, ph = pc.y1 - pc.y0;
      if (pw < 0.01 || ph < 0.01) continue;
      const cu = (pc.u0 + pc.u1) / 2;
      if (kind === 'log') {
        solid.push(new THREE.BoxGeometry(pw, ph, t * 0.55).translate(cu, pc.y0 + ph / 2, 0));
        const course = 0.3;
        for (let yy = pc.y0 + course / 2; yy < pc.y1 - 0.05; yy += course) {
          const lg = new THREE.CylinderGeometry(course * 0.52, course * 0.52, pw + (pc.u0 === 0 || pc.u1 === L ? 0.35 : 0), 7);
          lg.rotateZ(Math.PI / 2);
          lg.translate(cu, yy, 0);
          logs.push(lg);
        }
      } else {
        solid.push(new THREE.BoxGeometry(pw, ph, t).translate(cu, pc.y0 + ph / 2, 0));
      }
      if (pc.solid) {
        const mx = x0 + Math.cos(ang) * cu, mz = z0 + Math.sin(ang) * cu;
        ctx.addCollider({ x: mx, z: mz, hx: pw / 2, hz: t / 2 + 0.05, rot: -ang, top: y + Math.min(pc.y1, colliderTop) });
      }
    }
    for (const o of ops) {
      if (o.kind !== 'window') continue;
      const ow = o.width, oh = o.top - o.bottom, cy = (o.top + o.bottom) / 2;
      panes.push(new THREE.BoxGeometry(ow, oh, 0.04).translate(o.at, cy, 0));
      frames.push(new THREE.BoxGeometry(ow + 0.16, 0.1, t + 0.12).translate(o.at, o.bottom, 0));
      frames.push(new THREE.BoxGeometry(ow + 0.16, 0.1, t + 0.06).translate(o.at, o.top, 0));
      for (const s of [-1, 1]) frames.push(new THREE.BoxGeometry(0.08, oh, t + 0.06).translate(o.at + s * ow / 2, cy, 0));
      frames.push(new THREE.BoxGeometry(0.05, oh, 0.08).translate(o.at, cy, 0));
      for (let r = 1; r < 3; r++) frames.push(new THREE.BoxGeometry(ow, 0.05, 0.08).translate(o.at, o.bottom + (oh * r) / 3, 0));
    }
    const addM = (geos, mat) => {
      if (!geos.length) return;
      const m = new THREE.Mesh(mergeGeometries(geos), mat);
      m.castShadow = m.receiveShadow = true;
      grp.add(m);
    };
    addM(solid, k.toon(kind === 'log' ? chink : color));
    addM(logs, k.toon(color));
    addM(frames, k.toon(trim));
    addM(panes, k.toon(glass, { emissive: new THREE.Color(glass).multiplyScalar(0.25) }));
    ctx.scene.add(grp);
    walls.push({ grp, n: sd.n, mid: [(x0 + x1) / 2, (z0 + z1) / 2] });
  }
  const inside = new THREE.Group();
  const outside = new THREE.Group();
  ctx.scene.add(inside, outside);
  const contains = (p, m = 0) => Math.abs(p.x - x) < w / 2 + m && Math.abs(p.z - z) < d / 2 + m;
  ctx.onFrame((tt, dt, camera) => {
    const cam = camera.position;
    const pin = avatar?.ready ? contains(avatar.pos, 0.2) : contains(cam);
    for (const wl of walls) {
      const out = (cam.x - wl.mid[0]) * wl.n[0] + (cam.z - wl.mid[1]) * wl.n[1];
      wl.grp.visible = !(out > -0.2 && (pin || out < 14));
    }
    inside.visible = pin;
    outside.visible = !pin;
  });
  return { inside, outside, walls };
}

export function floor(ctx, { x, z, w, d, y = 0, color = '#a87a50', lines = '#8a6040', boards = 0.25, along = 'x' }) {
  const geos = [new THREE.BoxGeometry(w, 0.08, d).translate(x, y + 0.04, z)];
  const g = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color));
  g.receiveShadow = true;
  ctx.scene.add(g);
  const seams = [];
  const n = Math.floor((along === 'x' ? d : w) / boards);
  for (let i = 1; i < n; i++) {
    const o = -((along === 'x' ? d : w) / 2) + i * boards;
    seams.push(along === 'x' ? new THREE.PlaneGeometry(w, 0.025).rotateX(-Math.PI / 2).translate(x, y + 0.085, z + o) : new THREE.PlaneGeometry(0.025, d).rotateX(-Math.PI / 2).translate(x + o, y + 0.085, z));
  }
  if (seams.length) ctx.scene.add(new THREE.Mesh(mergeGeometries(seams), ctx.kit.basic(lines)));
}

// Gable roof over a w (x) by d (z) footprint, ridge along x.
export function gableRoof(ctx, parent, { x, z, w, d, y, rise, over = 0.4, color = '#5a4a3e', gable = '#7a5a3e' }) {
  const half = d / 2 + over;
  const slope = Math.atan2(rise, d / 2);
  const len = Math.hypot(half, rise * (half / (d / 2)));
  const geos = [];
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(w + over * 2, 0.16, len);
    g.rotateX(s * slope);
    g.translate(x, y + rise / 2 - 0.05, z + s * len / 2 * Math.cos(slope));
    geos.push(g);
  }
  const m = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color));
  m.castShadow = true;
  parent.add(m);
  const shape = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, rise)]);
  for (const s of [-1, 1]) {
    const tri = new THREE.Mesh(new THREE.ShapeGeometry(shape), ctx.kit.toon(gable, { side: THREE.DoubleSide }));
    tri.rotation.y = Math.PI / 2;
    tri.position.set(x + s * (w / 2), y, z);
    parent.add(tri);
  }
}

export function box(ctx, { pos: [x, z], y = 0, size: [w, h, d], color, rotY = 0, collide = false, parent, emissive }) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ctx.kit.toon(color, emissive ? { emissive } : {}));
  m.position.set(x, y + h / 2, z);
  m.rotation.y = rotY;
  m.castShadow = m.receiveShadow = true;
  (parent ?? ctx.scene).add(m);
  if (collide) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: -rotY, top: y + h });
  return m;
}

export function bench(ctx, { pos: [x, z], y = 0, len = 2.4, rotY = 0, color = '#7a5a3c', back = false }) {
  const g = new THREE.Group();
  const geos = [new THREE.BoxGeometry(len, 0.07, 0.38).translate(0, 0.45, 0)];
  for (const s of [-1, 1]) geos.push(new THREE.BoxGeometry(0.07, 0.45, 0.32).translate(s * (len / 2 - 0.15), 0.22, 0));
  if (back) geos.push(new THREE.BoxGeometry(len, 0.5, 0.05).translate(0, 0.72, -0.2));
  const m = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color));
  m.castShadow = m.receiveShadow = true;
  g.add(m);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  ctx.scene.add(g);
  return g;
}

export function table(ctx, { pos: [x, z], y = 0, size: [w, d] = [1.6, 0.9], color = '#6b4a30', rotY = 0, collide = true }) {
  const geos = [new THREE.BoxGeometry(w, 0.06, d).translate(0, 0.76, 0)];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) geos.push(new THREE.BoxGeometry(0.07, 0.74, 0.07).translate(sx * (w / 2 - 0.08), 0.37, sz * (d / 2 - 0.08)));
  const m = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color));
  m.castShadow = m.receiveShadow = true;
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  ctx.scene.add(m);
  if (collide) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: -rotY, top: y + 0.8 });
  return m;
}

export function chair(ctx, { pos: [x, z], y = 0, rotY = 0, color = '#6b4a30' }) {
  const geos = [new THREE.BoxGeometry(0.45, 0.05, 0.45).translate(0, 0.45, 0), new THREE.BoxGeometry(0.45, 0.55, 0.05).translate(0, 0.72, -0.2)];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) geos.push(new THREE.BoxGeometry(0.05, 0.45, 0.05).translate(sx * 0.19, 0.22, sz * 0.19));
  const m = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color));
  m.castShadow = true;
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  ctx.scene.add(m);
}

export function fireplace(ctx, { pos: [x, z], y = 0, rotY = 0, color = '#8a6a58', height = 2.6, fire = true }) {
  const g = new THREE.Group();
  const stone = [new THREE.BoxGeometry(1.8, height, 0.6).translate(0, height / 2, 0)];
  stone.push(new THREE.BoxGeometry(2.0, 0.15, 0.8).translate(0, 1.3, 0.1));
  const sm = new THREE.Mesh(mergeGeometries(stone), ctx.kit.stoneMat(color));
  sm.castShadow = true;
  g.add(sm);
  const hole = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.1), ctx.kit.toon('#1c120c'));
  hole.position.set(0, 0.5, 0.27);
  g.add(hole);
  if (fire) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 6).translate(0, 0.3, 0), ctx.kit.basic('#f08a2c'));
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 6).translate(0, 0.19, 0), ctx.kit.basic('#ffe08a'));
    flame.position.set(0, 0.08, 0.32);
    core.position.set(0, 0.08, 0.36);
    g.add(flame, core);
    const light = new THREE.PointLight('#ffb060', 5, 9, 1.6);
    light.position.set(0, 0.8, 1.0);
    g.add(light);
    ctx.onFrame((t) => {
      const f = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
      flame.scale.y = f;
      core.scale.y = 1.6 - f;
      light.intensity = 4 + f * 1.5;
    });
  }
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  ctx.scene.add(g);
  ctx.addCollider({ x, z, hx: rotY ? 0.4 : 1, hz: rotY ? 1 : 0.4, rot: 0, top: y + height });
}

export function candle(ctx, [x, y, z], light = 0) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6).translate(0, 0.09, 0), ctx.kit.toon('#f3ead2'));
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 5).translate(0, 0.21, 0), ctx.kit.basic('#ffd27a'));
  c.position.set(x, y, z);
  f.position.set(x, y, z);
  ctx.scene.add(c, f);
  if (light) {
    const l = new THREE.PointLight('#ffcf80', light, 6, 1.6);
    l.position.set(x, y + 0.4, z);
    ctx.scene.add(l);
  }
}

export function book(ctx, [x, y, z], { color = '#4a2a1c', rotY = 0, open = false } = {}) {
  const geos = open
    ? [new THREE.BoxGeometry(0.2, 0.025, 0.28).translate(-0.1, 0.012, 0).rotateZ(0.06), new THREE.BoxGeometry(0.2, 0.025, 0.28).translate(0.1, 0.012, 0).rotateZ(-0.06)]
    : [new THREE.BoxGeometry(0.18, 0.05, 0.25).translate(0, 0.025, 0)];
  const m = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(open ? '#efe6cf' : color));
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  ctx.scene.add(m);
}

// Conifers as instanced cones.
export function pines(ctx, { count, ring, center = [0, 0], height = [8, 16], colors = ['#2f5a3e', '#35603f', '#294f38'], trunk = '#5a3e2a', seed = 7, avoid = () => false }) {
  const rng = makeRng(seed);
  const cone = new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0);
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 1, 6).translate(0, 0.5, 0);
  const tiers = [], trunks = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(between(rng, [ring[0] ** 2, ring[1] ** 2]));
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (avoid(x, z) || ctx.blocked(x, z, 1.5)) continue;
    const y = ctx.terrainHeight(x, z) - 0.1;
    const h = between(rng, height);
    const col = pick(rng, colors);
    trunks.push(m.compose(new THREE.Vector3(x, y, z), q.identity(), new THREE.Vector3(1, h * 0.3, 1)).clone());
    for (let k = 0; k < 3; k++) {
      const s = h * (0.24 - k * 0.055);
      tiers.push({ m: m.compose(new THREE.Vector3(x, y + h * (0.2 + k * 0.24), z), q.identity(), new THREE.Vector3(s, h * 0.42, s)).clone(), c: col });
    }
    ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + h });
  }
  const tm = new THREE.InstancedMesh(trunkGeo, ctx.kit.toon(trunk), trunks.length);
  trunks.forEach((mm, i) => tm.setMatrixAt(i, mm));
  const cm = new THREE.InstancedMesh(cone, ctx.kit.toon('#ffffff'), tiers.length);
  const c = new THREE.Color();
  tiers.forEach((o, i) => {
    cm.setMatrixAt(i, o.m);
    cm.setColorAt(i, c.set(o.c));
  });
  for (const mesh of [tm, cm]) {
    mesh.castShadow = mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }
}

// Flat water surface following a polyline, with drawn ripple dashes.
export function river(ctx, { points, width, y = -0.15, color = '#5b8fa8', light = '#a9d0dc', bank = '#7a6a4a' }) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const n = 120;
  const pos = [], idx = [], bpos = [];
  for (let i = 0; i <= n; i++) {
    const p = curve.getPoint(i / n), tg = curve.getTangent(i / n);
    const nx = -tg.z, nz = tg.x;
    for (const s of [-1, 1]) pos.push(p.x + nx * s * width / 2, y, p.z + nz * s * width / 2);
    for (const s of [-1, 1]) bpos.push(p.x + nx * s * (width / 2 + 2.5), y - 0.05, p.z + nz * s * (width / 2 + 2.5));
    if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const mk = (arr, mat) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    ctx.scene.add(m);
    return m;
  };
  mk(bpos, ctx.kit.toon(bank, { side: THREE.DoubleSide }));
  const water = mk(pos, ctx.kit.toon(color, { side: THREE.DoubleSide, emissive: new THREE.Color(color).multiplyScalar(0.25) }));
  water.position.y = 0.04;
  const rng = makeRng(9);
  const dash = new THREE.PlaneGeometry(1, 0.12).rotateX(-Math.PI / 2);
  const count = Math.round(curve.getLength() * width / 18);
  const dm = new THREE.InstancedMesh(dash, ctx.kit.basic(light), count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  const items = [];
  for (let i = 0; i < count; i++) {
    const tt = rng(), off = (rng() - 0.5) * width * 0.85;
    const p = curve.getPoint(tt), tg = curve.getTangent(tt);
    items.push({ x: p.x - tg.z * off, z: p.z + tg.x * off, a: Math.atan2(-tg.z, tg.x), len: between(rng, [1, 3]), ph: rng() * 6 });
  }
  ctx.onFrame((t) => {
    items.forEach((it, i) => {
      const s = it.len * (0.6 + 0.4 * Math.sin(t * 1.2 + it.ph));
      dm.setMatrixAt(i, m4.compose(new THREE.Vector3(it.x, y + 0.08, it.z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.a), new THREE.Vector3(s, 1, 1)));
    });
    dm.instanceMatrix.needsUpdate = true;
  });
  dm.frustumCulled = false;
  ctx.scene.add(dm);
  return curve;
}

export function railFence(ctx, pts, { color = '#7a6450', h = 1.1 } = {}) {
  const geos = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0);
    const n = Math.max(1, Math.round(L / 3));
    for (let k = 0; k < n; k++) {
      const a = k / n, b = (k + 1) / n;
      const ax = x0 + (x1 - x0) * a, az = z0 + (z1 - z0) * a;
      const bx = x0 + (x1 - x0) * b, bz = z0 + (z1 - z0) * b;
      const ya = ctx.terrainHeight(ax, az);
      geos.push(new THREE.CylinderGeometry(0.07, 0.08, h + 0.2, 5).translate(ax, ya + (h + 0.2) / 2 - 0.1, az));
      for (const r of [0.45, 0.95]) {
        const rail = new THREE.CylinderGeometry(0.05, 0.05, L / n, 5);
        rail.rotateZ(Math.PI / 2);
        rail.rotateY(-ang);
        rail.translate((ax + bx) / 2, ya + r * h, (az + bz) / 2);
        geos.push(rail);
      }
    }
  }
  const m = new THREE.Mesh(mergeGeometries(geos), ctx.kit.toon(color));
  m.castShadow = true;
  ctx.scene.add(m);
}
