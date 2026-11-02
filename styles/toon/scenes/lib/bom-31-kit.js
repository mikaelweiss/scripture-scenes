import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { personParts, makeFigure } from '../../engine/people.js';
import { glowTexture } from '../../engine/textures.js';
import { between, makeRng, pick } from '../../engine/util.js';

export const INK = '#2b1a12';

export function baseStyle(over = {}) {
  return {
    ink: INK,
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
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
    ...over,
  };
}

export function groundSpec(over = {}) {
  return {
    size: 1600,
    segments: 320,
    flatRadius: 150,
    hillHeight: 30,
    undulation: 0.2,
    plaza: { center: [0, 0], size: [0.001, 0.001] },
    ...over,
    colors: {
      sand: '#d4ac6c',
      dirt: '#bf8d55',
      grass: '#8e9a58',
      grassDark: '#6c7a42',
      plaza: '#e2cfa4',
      plazaLine: '#c3a676',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#7f9a6a',
      ...(over.colors ?? {}),
    },
  };
}

export const NEPHITE = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const LAMANITE = {
  robes: ['#7a3b26', '#8c4a2c', '#5e3020', '#a0522d', '#6b4a33', '#3e2a1e'],
  mantles: ['#c8912e', '#5e3020', '#a64b35', '#3e2a1e', '#8c6a3c'],
  skins: ['#7a4e33', '#6b4228', '#8a5a3b', '#5e3a24'],
  hair: ['#1f140e', '#2b1a12'],
  wraps: ['#b5523b', '#c8912e', '#1f140e'],
};

// Mesh placed on the terrain at (x, z) plus lift. Returns the mesh.
export function put(ctx, geo, color, x, z, { lift = 0, y, rot = 0, cast = true, receive = true, emissive, side, mat } = {}) {
  const material = mat ?? ctx.kit.toon(color, { emissive: emissive ?? 0x000000, side: side ?? THREE.FrontSide });
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y ?? ctx.terrainHeight(x, z) + lift, z);
  m.rotation.y = rot;
  m.castShadow = cast;
  m.receiveShadow = receive;
  ctx.scene.add(m);
  return m;
}

export function box(w, h, d, x = 0, y = 0, z = 0, { rx = 0, ry = 0, rz = 0 } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export function cyl(r0, r1, h, x = 0, y = 0, z = 0, seg = 8, { rx = 0, rz = 0 } = {}) {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg);
  if (rx || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, 0, rz)));
  g.translate(x, y, z);
  return g;
}

export const merge = (geos) => mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));

// Rotated solid footprint the player cannot walk through.
export function solid(ctx, x, z, hx, hz, top, rot = 0, walkable = false) {
  ctx.addCollider({ x, z, hx, hz, rot, top: ctx.terrainHeight(x, z) + top, walkable });
  ctx.exclude({ kind: 'rect', x, z, hx: hx + 0.6, hz: hz + 0.6, rot });
}

// Ground decal that follows the terrain: a band between two radii around a center.
export function drapeRing(ctx, cx, cz, r0, r1, color, { lift = 0.08, seg = 128, arc = [0, Math.PI * 2], rings = 4 } = {}) {
  const pos = [], idx = [];
  const row = rings + 1;
  for (let i = 0; i <= seg; i++) {
    const a = arc[0] + ((arc[1] - arc[0]) * i) / seg;
    for (let j = 0; j <= rings; j++) {
      const r = r0 + ((r1 - r0) * j) / rings;
      const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
      pos.push(x, ctx.terrainHeight(x, z) + lift, z);
    }
    if (i < seg) for (let j = 0; j < rings; j++) {
      const a0 = i * row + j;
      idx.push(a0, a0 + 1, a0 + row, a0 + 1, a0 + row + 1, a0 + row);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, ctx.kit.toon(color, { side: THREE.DoubleSide }));
  m.receiveShadow = true;
  ctx.scene.add(m);
  return m;
}

// Ground decal rectangle (rotated) that follows the terrain.
export function drapeRect(ctx, cx, cz, w, d, color, { rot = 0, lift = 0.04, step = 1 } = {}) {
  const nx = Math.max(1, Math.ceil(w / step)), nz = Math.max(1, Math.ceil(d / step));
  const pos = [], idx = [];
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const lx = -w / 2 + (w * i) / nx, lz = -d / 2 + (d * j) / nz;
    const x = cx + lx * c + lz * s, z = cz - lx * s + lz * c;
    pos.push(x, ctx.terrainHeight(x, z) + lift, z);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, dd = a + nx + 1, cc = dd + 1;
    idx.push(a, dd, b, b, dd, cc);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, ctx.kit.toon(color, { side: THREE.DoubleSide }));
  m.receiveShadow = true;
  ctx.scene.add(m);
  return m;
}

let glowTex = null;
export function glow(ctx, x, y, z, size, color, opacity = 0.7, pulse = 0.04) {
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) {
    const ph = x * 0.37 + z * 0.21;
    ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.7 + ph) * pulse)));
  }
  return s;
}

// A named single figure. kneel squashes the body like the crowd's kneelers.
export function figure(ctx, colors, x, z, { face, yaw, scale = 1, glow: g = 0, kneel = false, lift = 0, y, clear = 1.2 } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow: g });
  fig.position.set(x, (y ?? ctx.groundHeight(x, z)) + lift, z);
  fig.scale.set(scale, scale * (kneel ? 0.62 : 1), scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  if (yaw !== undefined) fig.rotation.y = yaw;
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

// Spear in the right hand, round shield on the left arm, for a figure group.
export function arm(fig, ctx, { spear = '#6b4a33', tip = '#c9c2b0', shield = '#b5523b', rim = INK, banner } = {}) {
  const k = ctx.kit;
  const s = new THREE.Mesh(cyl(0.028, 0.028, 2.7, 0.3, 1.45, 0.08), k.toon(spear));
  const t = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 6).translate(0.3, 2.94, 0.08), k.toon(tip));
  const sh = new THREE.Mesh(cyl(0.34, 0.34, 0.07, 0, 0, 0, 14, { rx: Math.PI / 2 }), k.toon(shield));
  sh.position.set(-0.24, 1.0, 0.2);
  sh.rotation.y = -0.5;
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 5, 16), k.toon(rim));
  r.position.copy(sh.position);
  r.rotation.y = -0.5;
  r.position.z += 0.04;
  for (const m of [s, t, sh, r]) {
    m.castShadow = true;
    fig.add(m);
  }
  if (banner) {
    const f = new THREE.Mesh(box(0.9, 0.6, 0.03, 0.3 + 0.45, 2.45, 0.08), k.toon(banner, { side: THREE.DoubleSide }));
    fig.add(f);
  }
  return fig;
}

// Instanced soldiers: body, mantle, head, helmet, spear, spear tip, shield.
// layout: { center, rows, cols, spacing, yaw } grid, or { center, size, count } scatter.
export function army(ctx, o) {
  const rng = makeRng(o.seed ?? 5);
  const parts = personParts();
  const shaft = new THREE.CylinderGeometry(0.026, 0.026, 2.6, 5).translate(0.3, 1.4, 0.08);
  const tipG = new THREE.ConeGeometry(0.06, 0.26, 5).translate(0.3, 2.83, 0.08);
  const shieldG = new THREE.CylinderGeometry(0.33, 0.33, 0.07, 12).rotateX(Math.PI / 2).rotateY(-0.5).translate(-0.24, 1.0, 0.2);
  const helmG = new THREE.SphereGeometry(0.145, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).translate(0, 1.6, 0);
  const crestG = new THREE.BoxGeometry(0.04, 0.12, 0.3).translate(0, 1.78, 0);
  const pal = o.colors ?? NEPHITE;
  const people = [];
  const yaw0 = o.yaw ?? 0;
  const c0 = Math.cos(yaw0), s0 = Math.sin(yaw0);
  const tryAdd = (x, z) => {
    if (ctx.blocked(x, z, 0.3)) return;
    if (o.avoid?.(x, z)) return;
    const face = o.facing;
    const yaw = (face ? Math.atan2(face[0] - x, face[1] - z) : yaw0) + (rng() - 0.5) * (o.jitterYaw ?? 0.25);
    people.push({ x, z, yaw, kneel: rng() < (o.kneel ?? 0), scale: between(rng, o.scale ?? [0.9, 1.05]), spear: rng() < (o.spears ?? 1) });
  };
  if (o.rows) {
    const sp = o.spacing ?? 1.1;
    for (let r = 0; r < o.rows; r++) for (let c = 0; c < o.cols; c++) {
      const lx = (c - (o.cols - 1) / 2) * sp + (rng() - 0.5) * (o.jitter ?? 0.25);
      const lz = (r - (o.rows - 1) / 2) * sp + (rng() - 0.5) * (o.jitter ?? 0.25);
      tryAdd(o.center[0] + lx * c0 + lz * s0, o.center[1] - lx * s0 + lz * c0);
    }
  } else {
    const grid = new Set();
    const cell = o.minSpacing ?? 0.9;
    for (let tries = 0; people.length < o.count && tries < o.count * 40; tries++) {
      let x, z;
      if (o.radius) {
        const a = between(rng, o.angle ?? [-Math.PI, Math.PI]);
        const r = Math.sqrt(between(rng, [o.radius[0] ** 2, o.radius[1] ** 2]));
        x = o.center[0] + Math.sin(a) * r;
        z = o.center[1] + Math.cos(a) * r;
      } else {
        const lx = (rng() - 0.5) * o.size[0], lz = (rng() - 0.5) * o.size[1];
        x = o.center[0] + lx * c0 + lz * s0;
        z = o.center[1] - lx * s0 + lz * c0;
      }
      const key = `${Math.round(x / cell)},${Math.round(z / cell)}`;
      if (grid.has(key)) continue;
      const before = people.length;
      tryAdd(x, z);
      if (people.length > before) grid.add(key);
    }
  }
  const n = people.length;
  const k = ctx.kit;
  const armed = o.weapons !== false;
  const defs = [
    ['robe', parts.robe, 'body'],
    ['mantle', parts.mantle, 'body'],
    ['head', parts.head, 'head'],
    ['helm', o.helmets === false ? parts.hair : helmG, 'head'],
    ...(o.crest ? [['crest', crestG, 'head']] : []),
    ...(armed ? [['shaft', shaft, 'body'], ['tip', tipG, 'body'], ['shield', shieldG, 'body']] : []),
  ];
  const meshes = {};
  for (const [name, geo] of defs) {
    meshes[name] = new THREE.InstancedMesh(geo, k.toon('#ffffff'), n);
    meshes[name].castShadow = name !== 'tip' && name !== 'crest';
    meshes[name].receiveShadow = true;
  }
  const c = new THREE.Color();
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  people.forEach((p, i) => {
    const y = (o.y ?? ctx.terrainHeight(p.x, p.z)) + (o.lie ? 0.28 * p.scale : 0);
    e.set(o.lie ? -Math.PI / 2 : (o.lean ?? 0.05) * (rng() - 0.3), p.yaw, 0, 'YXZ');
    const base = new THREE.Matrix4().compose(new THREE.Vector3(p.x, y, p.z), q.setFromEuler(e), new THREE.Vector3(p.scale, p.scale, p.scale));
    const bodyY = p.kneel ? 0.6 : 1;
    const body = base.clone().multiply(new THREE.Matrix4().makeScale(1, bodyY, 1));
    const head = base.clone().multiply(new THREE.Matrix4().makeTranslation(0, -1.46 * (1 - bodyY), 0));
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    for (const [name, , frame] of defs) meshes[name].setMatrixAt(i, !p.spear && (name === 'shaft' || name === 'tip') ? hidden : frame === 'body' ? body : head);
    const robe = pick(rng, pal.robes);
    meshes.robe.setColorAt(i, c.set(robe));
    meshes.mantle.setColorAt(i, c.set(rng() < 0.3 ? robe : pick(rng, pal.mantles)));
    meshes.head.setColorAt(i, c.set(pick(rng, pal.skins)));
    meshes.helm.setColorAt(i, c.set(o.helmets === false ? pick(rng, pal.hair) : pick(rng, o.helmColors ?? ['#8a7a5a', '#a08a60', '#6b5a40'])));
    if (meshes.crest) meshes.crest.setColorAt(i, c.set(pick(rng, o.crestColors ?? ['#b5523b'])));
    if (armed) {
      meshes.shaft.setColorAt(i, c.set(o.shaftColor ?? '#6b4a33'));
      meshes.tip.setColorAt(i, c.set('#cfc8b4'));
      meshes.shield.setColorAt(i, c.set(pick(rng, o.shields ?? ['#b5523b', '#c8912e', '#8c5a3c'])));
    }
  });
  for (const m of Object.values(meshes)) {
    m.computeBoundingSphere();
    ctx.scene.add(m);
  }
  return n;
}

export function banner(ctx, x, z, { h = 5, color = '#b5523b', trim = '#efe3c2', w = 1.6, fh = 1.1, wave = true } = {}) {
  const y = ctx.terrainHeight(x, z);
  put(ctx, cyl(0.06, 0.07, h, 0, h / 2, 0, 6), '#5e4632', x, z, { y });
  const geo = new THREE.PlaneGeometry(w, fh, 8, 1);
  geo.translate(w / 2 + 0.05, h - fh / 2 - 0.15, 0);
  const flag = put(ctx, geo, color, x, z, { y, side: THREE.DoubleSide, cast: false, mat: ctx.kit.toon(color, { side: THREE.DoubleSide }) });
  put(ctx, box(w, 0.12, 0.05, w / 2 + 0.05, h - fh - 0.15, 0), trim, x, z, { y, cast: false });
  if (wave) {
    const pos = geo.attributes.position;
    const base = Float32Array.from(pos.array);
    const ph = x * 0.3 + z * 0.17;
    ctx.onFrame((t) => {
      for (let i = 0; i < pos.count; i++) {
        const u = base[i * 3] / w;
        pos.setZ(i, Math.sin(t * 3 + u * 5 + ph) * 0.18 * u);
      }
      pos.needsUpdate = true;
    });
  }
  ctx.addCollider({ x, z, hx: 0.1, hz: 0.1, rot: 0, top: y + h });
  return flag;
}

// Animated drifting puffs (dust, smoke, darkness). Each source: { pos, radius, count, size, rise, color, shade }.
export function puffs(ctx, list, { seed = 9 } = {}) {
  const rng = makeRng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  for (const s of list) {
    const items = Array.from({ length: s.count }, (_, i) => ({
      x: s.pos[0] + (rng() - 0.5) * s.radius * 2,
      z: s.pos[1] + (rng() - 0.5) * s.radius * 2,
      phase: i / s.count + rng() * 0.1,
      size: between(rng, s.size),
    }));
    const mat = ctx.kit.toon(s.color, { emissive: s.shade ?? 0x000000, unique: !!s.opacity });
    if (s.opacity) {
      mat.transparent = true;
      mat.opacity = s.opacity;
      mat.depthWrite = false;
    }
    const mesh = new THREE.InstancedMesh(geo, mat, items.length);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (s.fx) mesh.layers.set(FX_LAYER);
    ctx.scene.add(mesh);
    const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
    const base = s.y ?? ctx.terrainHeight(s.pos[0], s.pos[1]);
    const speed = s.speed ?? 0.04;
    const [wx, wz] = s.wind ?? [3, 1];
    const update = (t) => {
      items.forEach((p, i) => {
        const life = (t * speed + p.phase) % 1;
        const k = p.size * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, life * 1.1))) * Math.min(1, life * 6 + 0.15);
        m.compose(v.set(p.x + life * wx, base + 0.3 + life * (s.rise ?? 4) + k * 0.3, p.z + life * wz), q.identity(), sc.set(k, k * 0.75, k));
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    update(0);
    ctx.onFrame(update);
  }
}

// Ring of animated flame cones (basic material, unlit).
export function flames(ctx, list) {
  const geo = new THREE.ConeGeometry(0.3, 1, 6).translate(0, 0.5, 0);
  const all = [];
  for (const f of list) all.push({ ...f, y: f.y ?? ctx.terrainHeight(f.x, f.z) });
  const outer = new THREE.InstancedMesh(geo, ctx.kit.basic(ctx.style.flameOuter), all.length);
  const inner = new THREE.InstancedMesh(geo, ctx.kit.basic(ctx.style.flameInner), all.length);
  for (const mesh of [outer, inner]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  const update = (t) => {
    all.forEach((f, i) => {
      const flick = 0.75 + 0.25 * Math.sin(t * 9 + f.phase) * Math.sin(t * 5.3 + f.phase * 2);
      const w = f.w ?? 1;
      outer.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(w, f.h * flick, w)));
      inner.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(w * 0.5, f.h * flick * 0.6, w * 0.5)));
    });
    outer.instanceMatrix.needsUpdate = inner.instanceMatrix.needsUpdate = true;
  };
  update(0);
  ctx.onFrame(update);
}

// Campfire: stone ring, logs, flames, warm glow, optional light.
export function campfire(ctx, x, z, { size = 1, light = 0, lightColor = '#ffb060', glowSize = 5 } = {}) {
  const y = ctx.terrainHeight(x, z);
  const stones = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const g = new THREE.IcosahedronGeometry(0.2 * size, 0);
    g.scale(1.2, 0.7, 1);
    g.translate(Math.sin(a) * 0.75 * size, 0.08, Math.cos(a) * 0.75 * size);
    stones.push(g);
  }
  put(ctx, merge(stones), '#8a8070', x, z, { y });
  const logs = [];
  for (let i = 0; i < 4; i++) logs.push(cyl(0.08 * size, 0.1 * size, 1.1 * size, 0, 0.15, 0, 6, { rz: Math.PI / 2 }).rotateY((i / 4) * Math.PI));
  put(ctx, merge(logs), '#3a2a22', x, z, { y });
  const fl = [];
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7;
    fl.push({ x: x + Math.sin(a) * 0.22 * size, z: z + Math.cos(a) * 0.22 * size, y: y + 0.1, h: (0.7 + (i % 2) * 0.4) * size, phase: i * 2.1 + x, w: size });
  }
  flames(ctx, fl);
  glow(ctx, x, y + 0.7 * size, z, glowSize * size, '#ffb050', 0.55, 0.08);
  if (light) {
    const l = new THREE.PointLight(lightColor, light, 14 * size, 1.5);
    l.position.set(x, y + 1.4, z);
    ctx.scene.add(l);
    ctx.onFrame((t) => (l.intensity = light * (0.85 + 0.15 * Math.sin(t * 11 + x) * Math.sin(t * 7.3))));
  }
  ctx.addCollider({ x, z, hx: 0.8 * size, hz: 0.8 * size, rot: 0, top: y + 0.8 });
}

// Ridge tent along local x. Open front optional.
export function tent(ctx, x, z, { w = 3, d = 4, h = 2.2, rot = 0, color = '#c8a97a', pole = '#5e4632', open = false } = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(0, h);
  shape.lineTo(w / 2, 0);
  shape.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  const t = put(ctx, geo, color, x, z, { rot, lift: -0.05 });
  if (open) {
    const dark = new THREE.Shape();
    dark.moveTo(-w * 0.25, 0);
    dark.lineTo(0, h * 0.6);
    dark.lineTo(w * 0.25, 0);
    const dg = new THREE.ShapeGeometry(dark);
    dg.translate(0, 0, d / 2 + 0.02);
    put(ctx, dg, typeof open === 'string' ? open : '#2b1a12', x, z, { rot, lift: -0.04, cast: false });
  }
  put(ctx, cyl(0.04, 0.04, h + 0.4, 0, (h + 0.4) / 2, d / 2 + 0.05), pole, x, z, { rot, lift: -0.05 });
  solid(ctx, x, z, w / 2, d / 2, h, rot);
  return t;
}

// Flat-roofed adobe house with a dark doorway on local +z.
export function house(ctx, x, z, { w = 6, d = 5, h = 3, rot = 0, color = '#d6bf95', roof = '#a87b4f', door = INK, trim } = {}) {
  const y = ctx.terrainHeight(x, z) - 0.2;
  put(ctx, box(w, h + 0.2, d, 0, (h + 0.2) / 2, 0), color, x, z, { y, rot, mat: ctx.kit.stoneMat(color) });
  put(ctx, box(w + 0.5, 0.35, d + 0.5, 0, h + 0.35, 0), roof, x, z, { y, rot });
  put(ctx, box(1.1, 1.9, 0.1, 0, 1.15, d / 2 + 0.02), door, x, z, { y, rot, cast: false });
  if (trim) put(ctx, box(w + 0.08, 0.4, d + 0.08, 0, h - 0.3, 0), '#ffffff', x, z, { y, rot, mat: ctx.kit.fretMat(...trim), cast: false });
  solid(ctx, x, z, w / 2, d / 2, h + 0.5, rot);
}

// Timber watch tower: four posts, braces, platform, railing, ladder on local +z.
export function tower(ctx, x, z, { h = 7, s = 3.2, rot = 0, wood = '#7a5a3a', deck = '#9a7048', roof = '#c8a97a' } = {}) {
  const y = ctx.terrainHeight(x, z) - 0.1;
  const posts = [], deckG = [], rails = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    posts.push(cyl(0.14, 0.18, h + 1.3, (sx * s) / 2, (h + 1.3) / 2, (sz * s) / 2, 6));
    posts.push(cyl(0.06, 0.06, 1.6, (sx * s) / 2, h + 2.2, (sz * s) / 2, 5));
  }
  for (const yy of [h * 0.35, h * 0.7]) {
    for (const sz of [-1, 1]) posts.push(box(s, 0.12, 0.12, 0, yy, (sz * s) / 2));
    for (const sx of [-1, 1]) posts.push(box(0.12, 0.12, s, (sx * s) / 2, yy, 0));
  }
  for (const sz of [-1, 1]) posts.push(box(0.1, Math.hypot(s, h * 0.35) * 0.98, 0.1, 0, h * 0.52, (sz * s) / 2, { rz: Math.atan2(s, h * 0.35) }));
  deckG.push(box(s + 0.8, 0.22, s + 0.8, 0, h, 0));
  for (const sz of [-1, 1]) rails.push(box(s + 0.8, 0.9, 0.1, 0, h + 0.55, (sz * (s + 0.8)) / 2));
  for (const sx of [-1, 1]) rails.push(box(0.1, 0.9, s + 0.8, (sx * (s + 0.8)) / 2, h + 0.55, 0));
  const ladder = [];
  for (const sx of [-0.3, 0.3]) ladder.push(box(0.08, h + 0.2, 0.08, sx, h / 2, s / 2 + 0.7, { rx: -0.12 }));
  for (let i = 1; i < h / 0.5; i++) ladder.push(box(0.6, 0.06, 0.06, 0, i * 0.5, s / 2 + 0.7 + (h / 2 - i * 0.5) * 0.12));
  put(ctx, merge(posts), wood, x, z, { y, rot });
  put(ctx, merge(deckG), deck, x, z, { y, rot });
  put(ctx, merge(rails), wood, x, z, { y, rot });
  put(ctx, merge(ladder), wood, x, z, { y, rot });
  const rg = new THREE.ConeGeometry((s + 1.4) * 0.72, 1.4, 4).rotateY(Math.PI / 4).translate(0, h + 3.6, 0);
  put(ctx, rg, roof, x, z, { y, rot });
  solid(ctx, x, z, s / 2 + 0.3, s / 2 + 0.3, h, rot);
  return y + h + 0.11;
}

// Flat sea covering one side of a line, with a foam band and a walk-blocking collider.
export function sea(ctx, { level = 0.3, color = '#2f8f8a', deep = '#1f6f78', foam = '#f3ecd8', edge, side = -1, axis = 'x', size = 3000, waves = 60, seed = 4, wall = 2 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, 1, 1).rotateX(-Math.PI / 2);
  const half = size / 2;
  const cx = axis === 'x' ? edge + side * half : 0, cz = axis === 'z' ? edge + side * half : 0;
  geo.translate(cx, level, cz);
  const water = new THREE.Mesh(geo, ctx.kit.toon(color));
  water.receiveShadow = true;
  ctx.scene.add(water);
  const fg = axis === 'x' ? new THREE.PlaneGeometry(1.4, size, 1, 1) : new THREE.PlaneGeometry(size, 1.4, 1, 1);
  fg.rotateX(-Math.PI / 2);
  const foamM = new THREE.Mesh(fg, ctx.kit.toon(foam));
  foamM.position.set(axis === 'x' ? edge + side * 0.9 : 0, level + 0.03, axis === 'z' ? edge + side * 0.9 : 0);
  ctx.scene.add(foamM);
  ctx.onFrame((t) => {
    const o = Math.sin(t * 0.8) * 0.5;
    if (axis === 'x') foamM.position.x = edge + side * (0.9 + o); else foamM.position.z = edge + side * (0.9 + o);
  });
  // Drawn wave crests: short pale dashes floating on the surface.
  const rng = makeRng(seed);
  const crest = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 0.12), ctx.kit.toon(deep), waves);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  const items = [];
  for (let i = 0; i < waves; i++) {
    const across = side * (6 + rng() * rng() * 260);
    const along = (rng() - 0.5) * 500;
    const x = axis === 'x' ? edge + across : along, z = axis === 'x' ? along : edge + across;
    items.push({ x, z, len: 2 + rng() * 5, ph: rng() * 6 });
  }
  crest.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  crest.frustumCulled = false;
  ctx.scene.add(crest);
  const yaw = axis === 'x' ? Math.PI / 2 : 0;
  const upd = (t) => {
    items.forEach((w, i) => {
      const s = 0.6 + 0.4 * Math.sin(t * 0.9 + w.ph);
      m.compose(new THREE.Vector3(w.x, level + 0.04, w.z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(w.len * s, 1, 1));
      crest.setMatrixAt(i, m);
    });
    crest.instanceMatrix.needsUpdate = true;
  };
  upd(0);
  ctx.onFrame(upd);
  const hx = axis === 'x' ? half : half, hz = half;
  ctx.addCollider({ x: axis === 'x' ? edge + side * (half + 0.6) : 0, z: axis === 'z' ? edge + side * (half + 0.6) : 0, hx, hz, rot: 0, top: level + wall });
  return water;
}

// Distant hills within an angle range (angle 0 is north, -z; pi/2 is east).
export function hills(ctx, { count = 20, angle = [0, Math.PI * 2], distance = [450, 750], height = [50, 140], widthRatio = [1.4, 2.4], colors = ['#6f9a8a', '#5d8c84', '#7da08a'], seed = 21, y = -2 } = {}) {
  const rng = makeRng(seed);
  const geo = new THREE.ConeGeometry(1, 1, 9, 3).translate(0, 0.5, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const yy = pos.getY(i);
    if (yy > 0.01 && yy < 0.99) {
      pos.setX(i, pos.getX(i) * (0.85 + rng() * 0.3));
      pos.setZ(i, pos.getZ(i) * (0.85 + rng() * 0.3));
    }
  }
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), count);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = between(rng, angle);
    const d = between(rng, distance);
    const h = between(rng, height);
    const w = h * between(rng, widthRatio);
    m.compose(new THREE.Vector3(Math.sin(a) * d, y, -Math.cos(a) * d), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 6, 0)), new THREE.Vector3(w, h, w * between(rng, [0.7, 1.1])));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.set(pick(rng, colors)));
  }
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
}

// Ancient ship hull along local x: tapered U-section with raised ends, deck, optional mast and sail.
export function ship(ctx, { x, z, y, rot = 0, len = 22, beam = 6, depth = 2.6, hull = '#7a5232', deckColor = '#a87b4f', sail = '#efe3c2', stripe = '#b5523b', mast = true, ribsOnly = false, collide = true }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rot;
  ctx.scene.add(group);
  const k = ctx.kit;
  const N = 24, M = 10;
  const hw = (s) => (beam / 2) * Math.pow(Math.max(0.0001, Math.sin(Math.PI * s)), 0.55);
  const sheer = (s) => 1.4 * Math.pow(2 * s - 1, 2);
  if (!ribsOnly) {
    const pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const w = Math.max(0.05, hw(s));
      const dd = depth * (0.35 + 0.65 * Math.pow(Math.sin(Math.PI * s), 0.4));
      for (let j = 0; j <= M; j++) {
        const th = (j / M) * Math.PI;
        pos.push((s - 0.5) * len, depth + sheer(s) - dd * Math.sin(th) - (depth - dd), w * Math.cos(th));
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j, b = a + 1, cc = a + M + 1, d = cc + 1;
      idx.push(a, cc, b, b, cc, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const h = new THREE.Mesh(g, k.toon(hull, { side: THREE.DoubleSide }));
    h.castShadow = h.receiveShadow = true;
    group.add(h);
    const deck = new THREE.Mesh(box(len * 0.82, 0.12, beam * 0.86, 0, depth - 0.15, 0), k.toon(deckColor));
    deck.receiveShadow = true;
    group.add(deck);
    const band = new THREE.Mesh(box(len * 0.7, 0.3, beam * 1.0, 0, depth - 0.25, 0), k.toon(stripe));
    group.add(band);
    for (const e of [-1, 1]) {
      const post = new THREE.Mesh(cyl(0.16, 0.22, 2.2, e * len * 0.5, depth + 1.6, 0, 6, { rz: e * 0.35 }), k.toon(hull));
      group.add(post);
    }
  } else {
    const ribs = [];
    for (let i = 1; i < N; i += 2) {
      const s = i / N;
      const w = hw(s);
      const dd = depth * (0.35 + 0.65 * Math.pow(Math.sin(Math.PI * s), 0.4));
      const curve = new THREE.EllipseCurve(0, 0, w, dd, 0, Math.PI, true);
      const pts = curve.getPoints(10).map((p) => new THREE.Vector3((s - 0.5) * len, depth + sheer(s) - (depth - dd) + p.y, p.x));
      ribs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.09, 4));
    }
    ribs.push(box(len, 0.3, 0.35, 0, 0.15, 0));
    for (const e of [-1, 1]) ribs.push(cyl(0.16, 0.22, 3, e * len * 0.5, depth + 0.5, 0, 6, { rz: e * 0.35 }));
    const r = new THREE.Mesh(merge(ribs), k.toon(hull));
    r.castShadow = true;
    group.add(r);
  }
  let sailMesh = null;
  if (mast && !ribsOnly) {
    const mh = len * 0.65;
    group.add(new THREE.Mesh(cyl(0.16, 0.2, mh, 0, depth + mh / 2, 0, 7), k.toon('#5e4632')));
    group.add(new THREE.Mesh(cyl(0.09, 0.09, beam * 1.4, 0, depth + mh - 0.6, 0, 6, { rx: Math.PI / 2 }), k.toon('#5e4632')));
    const sg = new THREE.PlaneGeometry(beam * 1.35, mh * 0.55, 6, 6);
    const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (beam * 0.675), v = p.getY(i) / (mh * 0.275);
      p.setZ(i, 0.9 * (1 - u * u) * (1 - 0.3 * v * v));
    }
    sg.computeVertexNormals();
    sg.rotateY(Math.PI / 2);
    sg.translate(0.3, depth + mh - 0.6 - mh * 0.275, 0);
    sailMesh = new THREE.Mesh(sg, k.toon(sail, { side: THREE.DoubleSide }));
    sailMesh.castShadow = true;
    group.add(sailMesh);
    const st = new THREE.Mesh(box(0.05, mh * 0.08, beam * 1.1, 0.75, depth + mh * 0.62, 0), k.toon(stripe));
    group.add(st);
  }
  for (const c of group.children) c.castShadow = true;
  if (collide) {
    const top = y + depth + 1;
    ctx.addCollider({ x, z, hx: len / 2, hz: beam / 2, rot, top });
    ctx.exclude({ kind: 'rect', x, z, hx: len / 2 + 1, hz: beam / 2 + 1, rot });
  }
  return group;
}

export function trees(ctx, list, { trunk = '#6b4a33', leaves = ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'], seed = 13 } = {}) {
  const rng = makeRng(seed);
  const trunks = [], tops = [];
  for (const [x, z, h = 6] of list) {
    if (ctx.blocked(x, z, 0.8)) continue;
    const y = ctx.terrainHeight(x, z) - 0.1;
    trunks.push(cyl(0.18, 0.3, h, x, y + h / 2, z, 6));
    const n = 3 + Math.floor(rng() * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + rng();
      const r = i === 0 ? 0 : h * 0.22;
      const s = h * (0.24 + rng() * 0.08);
      const g = new THREE.SphereGeometry(1, 10, 7);
      g.scale(s, s * 0.75, s);
      g.translate(x + Math.sin(a) * r, y + h + (i === 0 ? s * 0.3 : -s * 0.1), z + Math.cos(a) * r);
      const col = new THREE.Color(pick(rng, leaves));
      const cols = new Float32Array(g.attributes.position.count * 3);
      for (let v = 0; v < cols.length; v += 3) cols.set([col.r, col.g, col.b], v);
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      tops.push(g);
    }
    ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + h });
  }
  if (trunks.length) put(ctx, merge(trunks), trunk, 0, 0, { y: 0 });
  if (tops.length) {
    const mat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: ctx.kit.gradient });
    put(ctx, merge(tops), '#ffffff', 0, 0, { y: 0, mat });
  }
}

export function jars(ctx, x, z, n = 6, { seed = 3, colors = ['#b86a40', '#c8912e', '#a0522d', '#d9c7a3'] } = {}) {
  const rng = makeRng(seed);
  for (let i = 0; i < n; i++) {
    const px = x + (rng() - 0.5) * 2.2, pz = z + (rng() - 0.5) * 2.2;
    const r = 0.22 + rng() * 0.12;
    const g = rng() < 0.6
      ? new THREE.LatheGeometry([[0.001, 0], [r, 0.08], [r * 1.15, r * 1.6], [r * 0.5, r * 2.6], [r * 0.6, r * 2.9]].map(([a, b]) => new THREE.Vector2(a, b)), 9)
      : box(r * 3, r * 2, r * 2.4, 0, r, 0);
    put(ctx, g, pick(rng, colors), px, pz, { rot: rng() * 6 });
  }
}

export function stars(ctx, { count = 900, seed = 2, color = '#f3eedc', minY = 0.08, size = 2 } = {}) {
  const rng = makeRng(seed);
  const pos = [];
  while (pos.length < count * 3) {
    const v = new THREE.Vector3(rng() * 2 - 1, rng(), rng() * 2 - 1);
    if (v.lengthSq() > 1 || v.lengthSq() < 0.01) continue;
    v.normalize();
    if (v.y < minY) continue;
    pos.push(v.x * 1500, v.y * 1500, v.z * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }));
  p.layers.set(FX_LAYER);
  p.frustumCulled = false;
  ctx.scene.add(p);
  ctx.onFrame((t, dt, camera) => p.position.copy(camera.position));
}

// Moon disc with halo, in direction dir from the viewer.
export function moon(ctx, dir, { size = 60, color = '#f6f0dc', halo = '#c8d4f0' } = {}) {
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(1400);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 32), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.layers.set(FX_LAYER);
  ctx.scene.add(disc);
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: halo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6, fog: false }));
  s.scale.setScalar(size * 5);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  ctx.onFrame((t, dt, camera) => {
    disc.position.copy(camera.position).add(d);
    disc.lookAt(camera.position);
    s.position.copy(disc.position);
  });
}

// Low round hill the player can climb: a truncated cone with stepped walkable colliders.
export function knoll(ctx, x, z, { r = 11, top = 4.5, h = 3, color = '#9aa064', steps = 6 } = {}) {
  const y = ctx.terrainHeight(x, z);
  put(ctx, new THREE.CylinderGeometry(top, r, h + 0.4, 14, 1).translate(0, (h + 0.4) / 2 - 0.4, 0), color, x, z, { y });
  for (let k = 0; k < steps; k++) {
    const f = (k + 1) / steps;
    const half = (r - (r - top) * f) * 0.72;
    ctx.addCollider({ x, z, hx: half, hz: half, rot: 0, top: y + h * f, walkable: true });
  }
  return y + h;
}

// The HUD counts only the engine crowd; show the full number of people in the scene.
export function peopleCount(ctx, subtitle, n) {
  let done = false;
  ctx.onFrame(() => {
    if (done) return;
    const p = document.querySelector('.hud-title p');
    if (p) {
      p.textContent = `${subtitle} · ${n.toLocaleString()} people`;
      done = true;
    }
  });
}
