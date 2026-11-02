// Shared props for ot-13 through ot-18: people with poses, animals, water, fire, Egyptian buildings, night sky.
import * as THREE from 'three';
import { parts } from '../../engine/crowd.js';

export function frame(x, z, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

const shadeBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

// Solid box in local coordinates of an anchor, optionally a collider.
export function block(ctx, at, rot, { lx, lz, y, w, h, d, color, collide = true, batch, jitter = 0.05, tilt = [0, 0] }) {
  const [x, z] = at(lx, lz);
  (batch ?? ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: shadeBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function paint(geo, colorAt) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 3) {
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    const c = colorAt(cy, cz);
    for (let k = 0; k < 3; k++) col.set([c.r, c.g, c.b], (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

const ARM_POSES = { down: [0.12, 0.05], out: [0.95, 0.35], up: [2.75, 0.2], forward: [0.18, 1.35], open: [0.7, 0.9], face: [0.5, 2.3] };

// A hand-posed person built from the crowd parts. Faces +z before `face` turns it.
// pose: stand | kneel | bow | sit. arms: a key of ARM_POSES, or [left, right] keys.
export function person(ctx, o) {
  const { x, z, face, yaw, scale = 1, robe = '#8b6b4a', mantle, skin = '#a87652', hood = false, pose = 'stand', arms = 'down', emissive = 0, bands, staff, nemes, collar, belt } = o;
  const group = new THREE.Group();
  const mat = (c, glow = emissive) => new THREE.MeshLambertMaterial({ color: c, vertexColors: true, emissive: new THREE.Color(c), emissiveIntensity: glow });
  if (bands) {
    const geo = paint(new THREE.CylinderGeometry(0.17, 0.3, 1.36, 7, bands.length).translate(0, 0.68, 0), (y) => new THREE.Color(bands[Math.min(bands.length - 1, Math.floor((y / 1.36) * bands.length))]));
    group.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true })));
  } else group.add(new THREE.Mesh(parts.robe(), mat(robe)));
  if (mantle) group.add(new THREE.Mesh(parts.mantle(), mat(mantle)));
  if (hood) group.add(new THREE.Mesh(parts.hood(), mat(mantle ?? robe)));
  group.add(new THREE.Mesh(parts.head(), mat(skin, 0)));
  const [la, ra] = Array.isArray(arms) ? arms : [arms, arms];
  const hands = [];
  for (const [side, key] of [[-1, la], [1, ra]]) {
    const [spread, forward] = ARM_POSES[key];
    const g = new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0);
    g.rotateX(-forward);
    g.rotateZ(side * spread);
    g.translate(side * 0.2, 1.32, 0.02);
    group.add(new THREE.Mesh(paint(g, () => new THREE.Color(1, 1, 1)), mat(mantle ?? (bands ? bands[1] : robe))));
    const hand = new THREE.Vector3(0, -0.62, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), -forward).applyAxisAngle(new THREE.Vector3(0, 0, 1), side * spread).add(new THREE.Vector3(side * 0.2, 1.32, 0.02));
    hands.push(hand);
  }
  if (staff) {
    const hand = hands[1];
    const raised = ra === 'up' || ra === 'forward';
    const len = 1.9;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, len, 5), new THREE.MeshLambertMaterial({ color: typeof staff === 'string' ? staff : '#5a4030' }));
    s.position.set(hand.x, raised ? hand.y + len * 0.35 : hand.y - 0.75 + len / 2 - 0.2, hand.z);
    if (ra === 'forward') s.rotation.x = 0.9;
    group.add(s);
  }
  if (nemes) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.3, 8, 1).translate(0, 1.62, -0.085), mat(nemes));
    group.add(cap);
    for (const side of [-1, 1]) {
      const lap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.06).translate(side * 0.15, 1.38, 0.06), mat(nemes));
      group.add(lap);
    }
  }
  if (collar) group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.07, 10).translate(0, 1.35, 0), mat(collar, 0.25)));
  if (belt) group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.24, 0.08, 7).translate(0, 0.86, 0), mat(belt, 0.1)));

  const ground = o.y ?? ctx.heightAt(x, z);
  group.position.set(x, ground, z);
  group.scale.setScalar(scale);
  group.rotation.order = 'YXZ';
  group.rotation.y = yaw ?? (face ? Math.atan2(face[0] - x, face[1] - z) : 0);
  if (pose === 'kneel') group.position.y -= 0.45 * scale;
  if (pose === 'sit') group.position.y -= 0.6 * scale;
  if (pose === 'bow') {
    group.position.y -= 0.5 * scale;
    group.rotation.x = 0.95;
  }
  group.traverse((m) => (m.castShadow = m.receiveShadow = true));
  ctx.scene.add(group);
  ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: ground, top: ground + 1.7 * scale });
  return group;
}

// Camel facing local +z, optionally with packs and a rider-free lead rope look.
export function camel(ctx, { x, z, rot = 0, color = '#b98d5a', load = ['#7a4e36', '#c4b090'], sit = false }) {
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z);
  const legH = sit ? 0.35 : 1.25;
  const add = (geo, lx, ly, lz, opts = {}) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(geo, { position: [px, y + ly, pz], rotation: [opts.rx ?? 0, rot + (opts.ry ?? 0), opts.rz ?? 0], scale: opts.scale ?? [1, 1, 1], color: opts.color ?? color, jitter: 0.06, shade: shadeBottom });
  };
  add(new THREE.DodecahedronGeometry(0.6, 0), 0, legH + 0.45, 0, { scale: [0.85, 0.8, 1.6] });
  add(new THREE.ConeGeometry(0.5, 0.75, 6), 0, legH + 1.05, -0.05, { scale: [1, 1, 1.2] });
  add(new THREE.CylinderGeometry(0.13, 0.2, 1.25, 5), 0, legH + 0.75, 1.15, { rx: 0.75 });
  add(new THREE.BoxGeometry(0.24, 0.26, 0.55), 0, legH + 1.25, 1.62, { rx: 0.15 });
  add(new THREE.BoxGeometry(0.06, 0.12, 0.06), -0.08, legH + 1.42, 1.45, {});
  add(new THREE.BoxGeometry(0.06, 0.12, 0.06), 0.08, legH + 1.42, 1.45, {});
  if (!sit) for (const [lx, lz] of [[-0.28, 0.65], [0.28, 0.65], [-0.28, -0.65], [0.28, -0.65]]) add(new THREE.CylinderGeometry(0.07, 0.09, legH + 0.2, 5), lx, (legH + 0.2) / 2, lz, {});
  else for (const [lx, lz] of [[-0.45, 0.4], [0.45, -0.3]]) add(new THREE.BoxGeometry(0.25, 0.25, 1.1), lx, 0.12, lz, {});
  add(new THREE.CylinderGeometry(0.03, 0.05, 0.6, 4), 0, legH + 0.2, -0.95, { rx: -0.4 });
  if (load) {
    add(new THREE.BoxGeometry(1.25, 0.12, 1.1), 0, legH + 0.92, 0, { color: load[0] });
    for (const side of [-1, 1]) add(new THREE.BoxGeometry(0.35, 0.6, 0.75), side * 0.62, legH + 0.55, 0.05, { color: load[1], rz: side * 0.1 });
    add(new THREE.CylinderGeometry(0.18, 0.18, 1.1, 6), 0, legH + 1.2, -0.45, { color: load[1], rz: Math.PI / 2 });
  }
  ctx.colliders.add({ x, z, w: 1.2, d: 3, rot, bottom: y, top: y + legH + 1.6 });
}

export function sheep(ctx, { x, z, rot = 0, wool = '#e6dfcc', face = '#2f2925', y }) {
  const at = frame(x, z, rot);
  const base = y ?? ctx.heightAt(x, z);
  const r = ctx.rand;
  const graze = r() < 0.5;
  const add = (geo, lx, ly, lz, scale, color, rx = 0) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(geo, { position: [px, base + ly, pz], rotation: [rx, rot, 0], scale, color, jitter: 0.06 });
  };
  add(new THREE.DodecahedronGeometry(0.35, 0), 0, 0.55, 0, [0.85, 0.75, 1.25], wool);
  add(new THREE.BoxGeometry(0.17, 0.2, 0.3), 0, graze ? 0.32 : 0.68, 0.42, [1, 1, 1], face, graze ? 0.9 : 0.2);
  for (const [lx, lz] of [[-0.14, 0.22], [0.14, 0.22], [-0.14, -0.22], [0.14, -0.22]]) add(new THREE.BoxGeometry(0.06, 0.4, 0.06), lx, 0.2, lz, [1, 1, 1], face);
}

// Animated water sheet with flat-shaded facets.
export function water(ctx, { x = 0, z = 0, y = 0, w = 100, d = 100, seg = 40, color = '#3d6f78', opacity = 0.88, amp = 0.12, freq = 0.35, speed = 1, shininess = 60, emissive = '#0a1a20', vertical = false, rot = 0 }) {
  const geo = new THREE.PlaneGeometry(w, d, seg, Math.max(2, Math.round(seg * (d / w)))).toNonIndexed();
  const mat = new THREE.MeshPhongMaterial({ color, emissive, transparent: opacity < 1, opacity, flatShading: true, shininess, specular: '#cfe6ee', side: THREE.DoubleSide, depthWrite: opacity >= 1 });
  const mesh = new THREE.Mesh(geo, mat);
  if (!vertical) mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.y = rot;
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  ctx.onFrame((t) => {
    for (let i = 0; i < pos.count; i++) {
      const px = base[i * 3], py = base[i * 3 + 1];
      const h = Math.sin(px * freq + t * 1.1 * speed) * 0.6 + Math.sin(py * freq * 1.3 - t * 0.8 * speed + px * 0.2) * 0.4;
      pos.array[i * 3 + 2] = base[i * 3 + 2] + h * amp;
    }
    pos.needsUpdate = true;
  });
  return mesh;
}

export function reeds(ctx, { x, z, r = 4, count = 40, color = '#6f8a3e', height = [1.6, 2.8], papyrus = 0.4, y, minY = -Infinity }) {
  const rand = ctx.rand;
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
    const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    const h = rand.range(height[0], height[1]);
    const base = y ?? Math.max(minY, ctx.heightAt(px, pz));
    const tilt = [rand.range(-0.15, 0.15), 0, rand.range(-0.15, 0.15)];
    ctx.solid.add(new THREE.ConeGeometry(0.05, h, 3).translate(0, h / 2, 0), { position: [px, base - 0.2, pz], rotation: tilt, color, jitter: 0.1 });
    if (rand() < papyrus) {
      ctx.solid.add(new THREE.ConeGeometry(0.28, 0.4, 5).translate(0, h - 0.05, 0).rotateX(Math.PI).translate(0, 2 * h - 0.1, 0), { position: [px, base - 0.2, pz], rotation: tilt, color: '#7d9a45', jitter: 0.1 });
    }
  }
}

// Flickering flames from glowing cones, with a warm point light.
export function fire(ctx, { x, z, y, size = 1, count = 7, light = 30, distance = 25, colors = ['#ff5a14', '#ff8a1e', '#ffc44a', '#fff0a0'], lightColor = '#ff9a40' }) {
  const base = y ?? ctx.heightAt(x, z);
  const rand = ctx.rand;
  const group = new THREE.Group();
  group.position.set(x, base, z);
  const flames = [];
  for (let i = 0; i < count; i++) {
    const inner = i >= count - 2;
    const h = size * (inner ? rand.range(0.7, 1.0) : rand.range(0.9, 1.6));
    const geo = new THREE.ConeGeometry(size * (inner ? 0.18 : 0.3), h, 5).translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: inner ? colors[3] : colors[i % 3], toneMapped: false, transparent: true, opacity: 0.92 }));
    const a = rand() * Math.PI * 2, d = inner ? 0 : rand.range(0.05, 0.3) * size;
    m.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    m.rotation.set(rand.range(-0.2, 0.2), rand() * 3, rand.range(-0.2, 0.2));
    flames.push([m, rand() * 10, rand.range(5, 9)]);
    group.add(m);
  }
  ctx.scene.add(group);
  const pl = light ? new THREE.PointLight(lightColor, light, distance, 1.4) : null;
  if (pl) {
    pl.position.set(x, base + size * 1.2, z);
    ctx.scene.add(pl);
  }
  ctx.onFrame((t) => {
    for (const [m, ph, sp] of flames) {
      m.scale.set(1 + Math.sin(t * sp * 0.7 + ph) * 0.12, 0.8 + Math.sin(t * sp + ph) * 0.25 + Math.sin(t * sp * 2.3 + ph) * 0.1, 1);
      m.rotation.y += 0.01;
    }
    if (pl) pl.intensity = light * (0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.07);
  });
  return group;
}

// Flat-roofed mud-brick house with a doorway facing local +z. Optional blood on the door frame and a lit interior.
export function mudHouse(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3, door = 1.2, doorH = 2.1, color = '#b89a72', trim = '#8f7656', blood = false, lit = false, roof = true, y }) {
  const at = frame(x, z, rot);
  const y0 = y ?? Math.min(...[[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([lx, lz]) => ctx.heightAt(...at(lx, lz)))) - 0.15;
  const t = 0.45;
  block(ctx, at, rot, { lx: 0, lz: -d / 2 + t / 2, y: y0, w, h, d: t, color });
  block(ctx, at, rot, { lx: -w / 2 + t / 2, lz: 0, y: y0, w: t, h, d, color });
  block(ctx, at, rot, { lx: w / 2 - t / 2, lz: 0, y: y0, w: t, h, d, color });
  const side = (w - door) / 2;
  block(ctx, at, rot, { lx: -w / 2 + side / 2, lz: d / 2 - t / 2, y: y0, w: side, h, d: t, color });
  block(ctx, at, rot, { lx: w / 2 - side / 2, lz: d / 2 - t / 2, y: y0, w: side, h, d: t, color });
  block(ctx, at, rot, { lx: 0, lz: d / 2 - t / 2, y: y0 + doorH, w: door + 0.1, h: h - doorH, d: t, color, collide: false });
  block(ctx, at, rot, { lx: 0, lz: d / 2 - t / 2 + 0.05, y: y0 + doorH, w: door + 0.6, h: 0.18, d: t + 0.12, color: '#6b5038', collide: false });
  if (roof) {
    block(ctx, at, rot, { lx: 0, lz: 0, y: y0 + h, w: w + 0.3, h: 0.25, d: d + 0.3, color: trim, collide: false });
    for (const lx of [-w / 2 + 0.6, -w / 4, 0, w / 4, w / 2 - 0.6]) block(ctx, at, rot, { lx, lz: d / 2 + 0.2, y: y0 + h - 0.15, w: 0.14, h: 0.14, d: 0.4, color: '#5a4330', collide: false });
  }
  if (blood) {
    const red = '#7d0f12';
    for (const s of [-1, 1]) block(ctx, at, rot, { lx: s * (door / 2 + 0.07), lz: d / 2 + 0.01, y: y0 + 0.9, w: 0.16, h: doorH - 0.95, d: 0.04, color: red, collide: false, jitter: 0.12 });
    block(ctx, at, rot, { lx: 0, lz: d / 2 + 0.13, y: y0 + doorH + 0.02, w: door + 0.3, h: 0.14, d: 0.04, color: red, collide: false, jitter: 0.12 });
    for (let i = 0; i < 4; i++) {
      const s = i < 2 ? -1 : 1;
      block(ctx, at, rot, { lx: s * (door / 2 + 0.07) + ctx.rand.range(-0.05, 0.05), lz: d / 2 + 0.02, y: y0 + 0.5 + ctx.rand() * 0.4, w: 0.04, h: 0.3, d: 0.03, color: red, collide: false });
    }
  }
  if (lit) {
    const [bx, bz] = at(0, -d / 2 + t + 0.02);
    ctx.glow.add(new THREE.PlaneGeometry(w - 2 * t, h * 0.8), { position: [bx, y0 + h * 0.4, bz], rotation: [0, rot, 0], color: lit === true ? '#d98a3c' : lit, jitter: 0.02 });
  }
  return { y: y0, at };
}

export function palm(ctx, { x, z, h = 7, leaf = '#5d7a34', trunk = '#6b543c', y }) {
  const r = ctx.rand;
  const base = (y ?? ctx.heightAt(x, z)) - 0.2;
  const lean = [r.range(-0.12, 0.12), 0, r.range(-0.12, 0.12)];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const seg = h / n;
    const k = i / n;
    ctx.solid.add(new THREE.CylinderGeometry(0.2 - k * 0.06, 0.24 - k * 0.06, seg * 1.02, 6), { position: [x - lean[2] * h * k, base + seg * (i + 0.5), z + lean[0] * h * k], rotation: lean, color: trunk, jitter: 0.08 });
  }
  const tx = x - lean[2] * h, tz = z + lean[0] * h, ty = base + h;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + r.range(-0.2, 0.2);
    const g = new THREE.ConeGeometry(0.55, 3.6, 3).translate(0, 1.8, 0);
    ctx.solid.add(g, { position: [tx, ty, tz], rotation: [Math.PI / 2 + r.range(0.25, 0.7), a, 0], scale: [1, 1, 0.22], color: leaf, jitter: 0.1 });
  }
  ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: base, top: base + h });
}

export function pyramid(ctx, { x, z, size = 120, h, color = '#d9c49a' }) {
  const y = ctx.heightAt(x, z) - 2;
  const hh = h ?? size * 0.64;
  ctx.solid.add(new THREE.ConeGeometry(size * 0.707, hh, 4, 1), { position: [x, y + hh / 2, z], rotation: [0, Math.PI / 4, 0], color, jitter: 0.03 });
}

// Egyptian column with a papyrus-bud capital and painted bands.
export function column(ctx, { x, z, y, h = 7, r = 0.6, color = '#d8c7a2', band = '#3f6b8c', band2 = '#b0503a', cap = '#c9b48a' }) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(r * 1.4, r * 1.5, 0.35, 10), { position: [x, base + 0.17, z], color: cap });
  ctx.solid.add(new THREE.CylinderGeometry(r * 0.92, r, h - 1.6, 10), { position: [x, base + 0.35 + (h - 1.6) / 2, z], color });
  for (const [k, c] of [[0.15, band], [0.2, band2], [0.72, band], [0.77, band2]]) ctx.solid.add(new THREE.CylinderGeometry(r * 0.97, r * 0.97, 0.18, 10), { position: [x, base + 0.35 + (h - 1.6) * k, z], color: c });
  ctx.solid.add(new THREE.CylinderGeometry(r * 1.5, r * 0.9, 1.0, 10), { position: [x, base + h - 0.75, z], color: cap });
  ctx.solid.add(new THREE.BoxGeometry(r * 2.6, 0.3, r * 2.6), { position: [x, base + h - 0.1, z], color: cap });
  ctx.colliders.add({ x, z, w: r * 2.4, d: r * 2.4, bottom: base, top: base + h });
}

// Stars and a moon that stay centered on the camera.
export function nightSky(ctx, { count = 900, moon = [0.4, 0.5, -0.7], moonColor = '#f4ecd6', moonSize = 40, seed = 3 } = {}) {
  const r = ctx.rand;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = r(), v = r() * 0.95 + 0.05;
    const th = u * Math.PI * 2, y = v;
    const k = Math.sqrt(1 - y * y);
    pts.push(Math.cos(th) * k * 1200, y * 1200, Math.sin(th) * k * 1200);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e8eeff', size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
  stars.renderOrder = -9;
  stars.frustumCulled = false;
  const group = new THREE.Group();
  group.add(stars);
  if (moon) {
    const dir = new THREE.Vector3(...moon).normalize();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(moonSize, 16), new THREE.MeshBasicMaterial({ color: moonColor, fog: false, toneMapped: false }));
    disc.position.copy(dir.multiplyScalar(1150));
    disc.lookAt(0, 0, 0);
    disc.renderOrder = -8;
    group.add(disc);
  }
  ctx.scene.add(group);
  ctx.onFrame((t, dt, camera) => group.position.copy(camera.position));
  return group;
}

// Soft additive glow sprite.
export function glowSprite(ctx, { position, size = 6, color = '#ffd9a0', opacity = 0.7 }) {
  return ctx.effects.halo({ position, size, color, opacity });
}
