// Shared helpers for scenes bom-37 to bom-42: people, fire, buildings, animals, lights in the sky.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { placeCrowd, createCrowd, createFigure } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false };

const standAt = (ctx) => (x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });

// Instanced crowd added from custom(), for scenes that need several crowds with their own palettes.
export function addCrowd(ctx, palette, groups) {
  const time = { value: 0 };
  ctx.onFrame((t) => (time.value = t));
  const people = placeCrowd(groups.map((g) => ({ palette, ...g })), ctx.heightAt, standAt(ctx));
  ctx.scene.add(createCrowd(people, time));
  return people;
}

function armsGeometry(spread, forward, lift = 1.32) {
  const arm = (side) => {
    const g = new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0);
    g.rotateX(-forward);
    g.rotateZ(side * spread);
    g.translate(side * 0.2, lift, 0.02);
    return g.toNonIndexed();
  };
  const geo = mergeGeometries([arm(-1), arm(1)]);
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3));
  geo.computeVertexNormals();
  return geo;
}

const POSES = { up: [2.5, 0.5], raise: [1.6, 0.9], forward: [0.25, 1.35], pray: [0.15, 1.0] };

// One hand-placed person. pose: down | out | up | raise | forward | pray. Optional light and halo.
export function figure(ctx, f) {
  const y = f.y ?? standAt(ctx)(f.x, f.z);
  const group = createFigure({ ...f, arms: f.pose === 'out' ? 'out' : 'down', y });
  if (POSES[f.pose]) group.children[1].geometry = armsGeometry(...POSES[f.pose]);
  if (f.kneel) group.position.y -= 0.48 * (f.scale ?? 1);
  if (f.prostrate) {
    group.rotation.x = Math.PI / 2 - 0.1;
    group.position.y += 0.2;
  }
  ctx.scene.add(group);
  if (f.solid !== false && !f.y) ctx.colliders.add({ x: f.x, z: f.z, w: 0.6, d: 0.6, bottom: y, top: y + 1.8 * (f.scale ?? 1) });
  if (f.light) {
    const light = new THREE.PointLight(f.light.color, f.light.intensity, f.light.distance ?? 30, 1.4);
    light.position.set(f.x, y + 2.2, f.z + 0.6);
    ctx.scene.add(light);
  }
  if (f.halo) ctx.effects.halo({ position: [f.x, y + 1.3 * (f.scale ?? 1), f.z], ...f.halo });
  return group;
}

// Heavenly messenger: white, faceless, glowing, slowly drifting down along a column of light.
export function angel(ctx, { x, z, y, face, scale = 1.05, bob = 0.6, phase = 0 }) {
  const group = createFigure({ x, y, z, face, scale, robe: '#fdfbf4', mantle: '#f6f1e2', skin: '#f8f2e4', arms: 'out', emissive: 0.55 });
  ctx.scene.add(group);
  const halo = ctx.effects.halo({ position: [x, y + 1.2 * scale, z], size: 4, opacity: 0.5, color: '#fff4d8' });
  ctx.onFrame((t) => {
    const dy = Math.sin(t * 0.6 + phase) * bob;
    group.position.y = y + dy;
    halo.position.y = y + 1.2 * scale + dy;
  });
  return group;
}

// Flickering low-poly flames, one instanced mesh for every fire in the scene.
export function fires(ctx, list, { lights = 4, lightColor = '#ff8a3a', lightIntensity = 40, lightDistance = 40, colors = ['#ff5a14', '#ffc04a'], ash = '#231c18' } = {}) {
  const rand = rng(77);
  const tongues = [];
  for (const f of list) {
    const y = f.y ?? ctx.heightAt(f.x, f.z);
    const n = f.tongues ?? Math.max(3, Math.round(f.size * 4));
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * f.size * 0.7;
      tongues.push({ x: f.x + Math.cos(a) * d, y, z: f.z + Math.sin(a) * d, h: f.size * rand.range(0.8, 1.9) * (1 - d / (f.size * 1.4)), w: f.size * rand.range(0.25, 0.45), ph: rand() * 10, hot: rand() < 0.4 });
    }
    if (ash) {
      const scorch = new THREE.CircleGeometry(f.size * 1.1, 8);
      scorch.rotateX(-Math.PI / 2);
      ctx.solid.add(scorch, { position: [f.x, y + 0.04, f.z], color: ash, jitter: 0.1 });
    }
  }
  const geo = new THREE.ConeGeometry(1, 1, 5, 1).translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, fog: false }), tongues.length);
  const outer = new THREE.Color(colors[0]), inner = new THREE.Color(colors[1]);
  tongues.forEach((t, i) => mesh.setColorAt(i, t.hot ? inner : outer));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const update = (time) => {
    tongues.forEach((t, i) => {
      const k = 0.75 + 0.25 * Math.sin(time * 9 + t.ph) + 0.12 * Math.sin(time * 23 + t.ph * 3);
      p.set(t.x, t.y, t.z);
      q.setFromEuler(e.set(Math.sin(time * 3 + t.ph) * 0.12, t.ph, Math.cos(time * 2.6 + t.ph) * 0.12));
      s.set(t.w * (t.hot ? 0.7 : 1), t.h * k * (t.hot ? 0.7 : 1), t.w * (t.hot ? 0.7 : 1));
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  const lit = [...list].sort((a, b) => b.size - a.size).slice(0, lights).map((f, i) => {
    const light = new THREE.PointLight(lightColor, lightIntensity * Math.min(2, f.size / 2), lightDistance, 1.3);
    light.position.set(f.x, (f.y ?? ctx.heightAt(f.x, f.z)) + f.size * 1.5, f.z);
    ctx.scene.add(light);
    return { light, base: light.intensity, ph: i * 2.1 };
  });
  ctx.onFrame((time) => {
    update(time);
    for (const l of lit) l.light.intensity = l.base * (0.85 + 0.15 * Math.sin(time * 11 + l.ph) * Math.sin(time * 7.3 + l.ph));
  });
  return mesh;
}

// Intact flat-roofed house of plastered stone or adobe with a dark doorway facing local +z.
export function house(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3.2, color = '#c9b08a', roof = '#8a7258', door = '#2e241c', y }) {
  const base = y ?? Math.min(ctx.heightAt(x, z), ctx.heightAt(x + w / 2, z + d / 2), ctx.heightAt(x - w / 2, z - d / 2)) - 0.2;
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  ctx.solid.box(w, h, d, { position: [x, base + h / 2, z], rotation: [0, rot, 0], color });
  ctx.solid.box(w + 0.5, 0.35, d + 0.5, { position: [x, base + h + 0.17, z], rotation: [0, rot, 0], color: roof });
  for (const [lx, lz] of [[-w / 2 + 0.6, d / 2 + 0.3], [w / 2 - 0.6, d / 2 + 0.3], [0, d / 2 + 0.3]]) {
    const [bx, bz] = at(lx, lz);
    ctx.solid.box(0.18, 0.18, 0.6, { position: [bx, base + h - 0.15, bz], rotation: [0, rot, 0], color: '#5a4332' });
  }
  const [dx, dz] = at(w * 0.15, d / 2 + 0.02);
  ctx.solid.box(1.1, 2.0, 0.08, { position: [dx, base + 1.0, dz], rotation: [0, rot, 0], color: door, jitter: 0 });
  const [wx, wz] = at(-w * 0.25, d / 2 + 0.02);
  ctx.solid.box(0.7, 0.6, 0.08, { position: [wx, base + h * 0.6, wz], rotation: [0, rot, 0], color: door, jitter: 0 });
  ctx.colliders.add({ x, z, w, d, rot, bottom: base, top: base + h + 0.35 });
}

// Ridge tent: a triangular prism of cloth over two poles.
export function tent(ctx, { x, z, rot = 0, w = 3.4, d = 4.4, h = 2.4, color = '#c8b79a' }) {
  const y = ctx.heightAt(x, z) - 0.05;
  const geo = new THREE.CylinderGeometry(1, 1, 1, 3, 1);
  geo.rotateX(Math.PI / 2);
  geo.rotateZ(Math.PI);
  ctx.solid.add(geo, { position: [x, y + h / 2 - 0.0, z], rotation: [0, rot, 0], scale: [w / 1.73, h / 1.5, d], color, jitter: 0.06 });
  const c = Math.cos(rot), s = Math.sin(rot);
  const fx = x + (d / 2 + 0.01) * s, fz = z + (d / 2 + 0.01) * c;
  const flap = new THREE.CylinderGeometry(0.5, 0.5, 0.02, 3, 1);
  flap.rotateX(Math.PI / 2);
  flap.rotateZ(Math.PI);
  ctx.solid.add(flap, { position: [fx, y + h * 0.28, fz], rotation: [0, rot, 0], scale: [w * 0.35, h * 0.45, 1], color: '#3a2c22', jitter: 0 });
  ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Pole with a cloth banner that sways in the wind.
export function banner(ctx, { x, z, h = 6, color = '#a33a2a', trim = '#e8d6a8', w = 1.4, len = 2.2 }) {
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.08, h, 5), { position: [x, y + h / 2, z], color: '#4a3626' });
  const cloth = new THREE.Group();
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(w, len, 1, 3).translate(w / 2, -len / 2, 0), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide, flatShading: true }));
  const band = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.25).translate(w / 2, -len * 0.75, 0.01), new THREE.MeshLambertMaterial({ color: trim, side: THREE.DoubleSide }));
  cloth.add(flag, band);
  cloth.position.set(x, y + h - 0.1, z);
  ctx.scene.add(cloth);
  const ph = x * 0.3 + z * 0.7;
  ctx.onFrame((t) => (cloth.rotation.y = Math.sin(t * 1.3 + ph) * 0.35 + 0.4));
}

// Four-legged animals merged into the static batch. kind: sheep | goat | cow.
export function animal(ctx, { x, z, yaw = 0, kind = 'sheep', color }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  const size = { sheep: [0.55, 0.45, 0.95, 0.4], goat: [0.4, 0.4, 0.85, 0.45], cow: [0.85, 0.75, 1.7, 0.7] }[kind];
  const [bw, bh, bl, leg] = size;
  const body = color ?? { sheep: r.pick(['#e8e0cc', '#ddd3bc', '#f0e9da', '#5a4a3e']), goat: r.pick(['#6a5240', '#3e322a', '#b9a58a']), cow: r.pick(['#7a4a2e', '#5a3a28', '#b49a78', '#3a2e26']) }[kind];
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const place = (lx, ly, lz) => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
  ctx.solid.box(bw, bh, bl, { position: place(0, leg + bh / 2, 0), rotation: [0, yaw, 0], color: body, jitter: 0.06 });
  ctx.solid.box(bw * 0.55, bh * 0.6, bl * 0.35, { position: place(0, leg + bh * 0.95, bl * 0.6), rotation: [0.35, yaw, 0], color: kind === 'sheep' ? '#3a302a' : body, jitter: 0.06 });
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.solid.box(0.1 + bw * 0.08, leg, 0.1 + bw * 0.08, { position: place(lx * bw * 0.3, leg / 2, lz * bl * 0.35), rotation: [0, yaw, 0], color: '#2e2620', jitter: 0.04 });
  }
  if (kind === 'cow') {
    for (const side of [-1, 1]) ctx.solid.box(0.06, 0.06, 0.3, { position: place(side * 0.22, leg + bh * 1.25, bl * 0.62), rotation: [-0.6, yaw, side * 0.5], color: '#e0d6c0' });
  }
}

// Herd scattered in a loose ellipse, avoiding a list of [x, z, r] circles.
export function herd(ctx, { center, radius = [10, 6], count = 30, kind = 'sheep', avoid = [], seed = 5, color }) {
  const r = rng(seed);
  const placed = [];
  for (let tries = 0; placed.length < count && tries < count * 40; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = center[0] + Math.cos(a) * radius[0] * d, z = center[1] + Math.sin(a) * radius[1] * d;
    if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < (kind === 'cow' ? 2.2 : 1.2))) continue;
    placed.push([x, z]);
    animal(ctx, { x, z, yaw: r() * Math.PI * 2, kind, color });
  }
  return placed;
}

// Bright star with a soft glow and four-point glint. Lives in the sky, beyond the fog.
export function star(ctx, { position, size = 60, color = '#fff6e0', glint = true }) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const g = canvas.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.08, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  if (glint) {
    for (const [w, h] of [[256, 6], [6, 256]]) {
      const lg = w > h ? g.createLinearGradient(0, 0, 256, 0) : g.createLinearGradient(0, 0, 0, 256);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,255,255,0.95)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg;
      g.fillRect(128 - w / 2, 128 - h / 2, w, h);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, ...additive, toneMapped: false }));
  sprite.position.set(...position);
  sprite.scale.set(size, size, 1);
  sprite.renderOrder = -3;
  ctx.scene.add(sprite);
  ctx.onFrame((t) => sprite.material.rotation = Math.sin(t * 0.4) * 0.05);
  return sprite;
}

// Faceted water surface with slow waves.
export function water(ctx, { x, z, w, d, y = 0, color = '#2f5566', segments = 40, wave = 0.25, opacity = 1 }) {
  const geo = new THREE.PlaneGeometry(w, d, segments, Math.round((segments * d) / w)).rotateX(-Math.PI / 2).toNonIndexed();
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true, transparent: opacity < 1, opacity });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  let frame = 0;
  ctx.onFrame((t) => {
    if (frame++ % 2) return;
    for (let i = 0; i < pos.count; i++) {
      const px = base[i * 3], pz = base[i * 3 + 2];
      pos.array[i * 3 + 1] = (Math.sin(px * 0.35 + t * 1.1) + Math.sin(pz * 0.5 - t * 0.8 + px * 0.2)) * wave;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return mesh;
}

// Arrow geometry pointing along +z, origin at the nock.
export function arrowGeometry(len = 0.85) {
  const shaft = new THREE.CylinderGeometry(0.012, 0.012, len, 4).rotateX(Math.PI / 2).translate(0, 0, len / 2);
  const tip = new THREE.ConeGeometry(0.03, 0.1, 4).rotateX(Math.PI / 2).translate(0, 0, len + 0.05);
  const fl = new THREE.BoxGeometry(0.004, 0.06, 0.14).translate(0, 0, 0.1);
  return mergeGeometries([shaft.toNonIndexed(), tip.toNonIndexed(), fl.toNonIndexed()]);
}
