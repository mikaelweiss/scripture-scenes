// Shared props for scenes bom-13 to bom-18: water, tents, houses, forest, fire, night sky, figures.
import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

const shadeBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

export const faceYaw = (x, z, target) => Math.atan2(target[0] - x, target[1] - z);

export function box(ctx, { x, z, y, w, h, d, rot = 0, color, jitter = 0.05, collide = true, batch = ctx.solid }) {
  batch.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter, shade: shadeBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Animated faceted water surface. Shiny Phong so the sun glints on the facets.
export function water(ctx, { x = 0, z = 0, w, d, y = 0, rot = 0, color = '#3f8fa0', opacity = 0.88, wave = 0.1, cell = 2.5, speed = 1, shininess = 70 }) {
  const { THREE: T } = ctx;
  const geo = new T.PlaneGeometry(w, d, Math.max(2, Math.round(w / cell)), Math.max(2, Math.round(d / cell))).toNonIndexed();
  geo.rotateX(-Math.PI / 2);
  const time = { value: 0 };
  const mat = new T.MeshPhongMaterial({ color, flatShading: true, transparent: opacity < 1, opacity, shininess, specular: '#cfe8ff' });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vec4 wp = modelMatrix * vec4(position, 1.0);
      transformed.y += (sin(wp.x * 0.45 + uTime * ${(1.3 * speed).toFixed(3)}) + cos(wp.z * 0.55 + uTime * ${(0.9 * speed).toFixed(3)}) + sin((wp.x + wp.z) * 0.9 + uTime * 1.7)) * ${wave.toFixed(3)};`,
    );
  };
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return mesh;
}

// Blocks walking into an area, e.g. deep water.
export function barrier(ctx, { x, z, w, d, rot = 0 }) {
  ctx.colliders.add({ x, z, w, d, rot, bottom: -50, top: 50 });
}

// Ridge tent with its open door facing local +z.
export function tent(ctx, { x, z, rot = 0, w = 3, d = 4, h = 2.4, color = '#d8c8a4', door = '#3a2a1e', stripe }) {
  const y = ctx.heightAt(x, z) - 0.05;
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  ctx.solid.add(geo, { position: [x, y, z], rotation: [0, rot, 0], color, jitter: 0.06 });
  if (stripe) {
    const band = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-w * 0.315, h * 0.4), new THREE.Vector2(w * 0.315, h * 0.4), new THREE.Vector2(w * 0.255, h * 0.52), new THREE.Vector2(-w * 0.255, h * 0.52)]), { depth: d + 0.04, bevelEnabled: false });
    band.translate(0, 0, -d / 2 - 0.02);
    ctx.solid.add(band, { position: [x, y, z], rotation: [0, rot, 0], color: stripe, jitter: 0.03 });
  }
  const at = frame(x, z, rot);
  const [dx, dz] = at(0, d / 2 + 0.02);
  const opening = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-w * 0.28, 0), new THREE.Vector2(w * 0.28, 0), new THREE.Vector2(0, h * 0.62)]));
  ctx.solid.add(opening, { position: [dx, y + 0.02, dz], rotation: [0, rot, 0], color: door, jitter: 0.02 });
  for (const s of [-1, 1]) {
    const [px, pz] = at(0, s * (d / 2 + 0.35));
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.05, h + 0.4, 4), { position: [px, y + (h + 0.4) / 2, pz], color: '#5a4030' });
  }
  ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Adobe or stone house with a doorway on local +z and a flat or thatched roof.
export function house(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3, color = '#c9b08a', trim = '#8f765a', roof = 'flat', roofColor = '#7d6248', door = 1.3 }) {
  const at = frame(x, z, rot);
  let y0 = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) y0 = Math.min(y0, ctx.heightAt(...at(lx, lz)));
  y0 -= 0.2;
  const t = 0.45;
  const wall = (lx, lz, ww, dd, hh = h, yy = y0) => {
    const [px, pz] = at(lx, lz);
    box(ctx, { x: px, z: pz, y: yy, w: ww, h: hh, d: dd, rot, color });
  };
  wall(0, -d / 2 + t / 2, w, t);
  wall(-w / 2 + t / 2, 0, t, d);
  wall(w / 2 - t / 2, 0, t, d);
  const side = (w - door) / 2;
  wall(-w / 2 + side / 2, d / 2 - t / 2, side, t);
  wall(w / 2 - side / 2, d / 2 - t / 2, side, t);
  const [lx, lz] = at(0, d / 2 - t / 2);
  box(ctx, { x: lx, z: lz, y: y0 + 2.1, w: door + 0.2, h: h - 2.1, d: t, rot, color, collide: false });
  const [ix, iz] = at(0, d / 2 - t - 0.01);
  ctx.solid.box(door, 2.1, 0.05, { position: [ix, y0 + 1.05, iz], rotation: [0, rot, 0], color: '#2a1f18', jitter: 0 });
  if (roof === 'flat') {
    ctx.solid.box(w + 0.4, 0.35, d + 0.4, { position: [x, y0 + h + 0.17, z], rotation: [0, rot, 0], color: trim, shade: shadeBottom });
    for (let i = -2; i <= 2; i++) {
      const [bx, bz] = at(i * (w / 5), d / 2 + 0.25);
      ctx.solid.box(0.18, 0.18, 0.5, { position: [bx, y0 + h - 0.15, bz], rotation: [0, rot, 0], color: '#5a4332' });
    }
  } else {
    const cone = new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, h * 0.75, 4);
    ctx.solid.add(cone, { position: [x, y0 + h + h * 0.37, z], rotation: [0, rot + Math.PI / 4, 0], scale: [w / Math.hypot(w, d) * 1.41, 1, d / Math.hypot(w, d) * 1.41], color: roofColor, jitter: 0.08, shade: shadeBottom });
  }
  return y0;
}

export function pine(ctx, { x, z, h = 8, color = '#3f5e34', trunk = '#4a3628' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.2;
  ctx.solid.add(new THREE.CylinderGeometry(0.14, 0.28, h * 0.4, 5), { position: [x, y + h * 0.2, z], color: trunk });
  for (let i = 0; i < 3; i++) {
    const rad = h * (0.28 - i * 0.06), ch = h * (0.45 - i * 0.08);
    ctx.solid.add(new THREE.ConeGeometry(rad, ch, 6), {
      position: [x, y + h * (0.3 + i * 0.22) + ch / 2, z],
      rotation: [r.range(-0.05, 0.05), r() * 3, 0],
      color,
      jitter: 0.1,
    });
  }
  ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: y, top: y + h });
}

export function broadTree(ctx, { x, z, h = 7, color = '#4f7a35', trunk = '#5a4332', crowns = 3, spread = 1 }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.2;
  const lean = [r.range(-0.08, 0.08), 0, r.range(-0.08, 0.08)];
  ctx.solid.add(new THREE.CylinderGeometry(0.12 * h / 6, 0.3 * h / 6, h, 5), { position: [x, y + h / 2, z], rotation: lean, color: trunk });
  for (let i = 0; i < crowns; i++) {
    const rad = h * r.range(0.22, 0.34) * spread;
    ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
      position: [x + r.range(-1, 1) * rad * 0.7, y + h * r.range(0.85, 1.05), z + r.range(-1, 1) * rad * 0.7],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, r.range(0.65, 0.9), 1],
      color,
      jitter: 0.12,
    });
  }
  ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: y, top: y + h });
}

export function bush(ctx, { x, z, size = 1, color = '#557a38' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  for (let i = 0; i < 2; i++) {
    ctx.solid.add(new THREE.IcosahedronGeometry(size * r.range(0.5, 0.8), 0), {
      position: [x + r.range(-0.4, 0.4) * size, y + size * 0.35, z + r.range(-0.4, 0.4) * size],
      rotation: [r() * 3, r() * 3, 0],
      scale: [1, 0.7, 1],
      color,
      jitter: 0.12,
    });
  }
}

export function scatterIn(rand, { center = [0, 0], ring = [0, 10], arc = [0, Math.PI * 2], count, spacing = 0, avoid = () => false }) {
  const out = [];
  for (let tries = 0; out.length < count && tries < count * 40; tries++) {
    const a = rand.range(arc[0], arc[1]);
    const r = Math.sqrt(rand.range(ring[0] ** 2, ring[1] ** 2));
    const x = center[0] + Math.cos(a) * r, z = center[1] + Math.sin(a) * r;
    if (avoid(x, z) || out.some((p) => (p[0] - x) ** 2 + (p[1] - z) ** 2 < spacing * spacing)) continue;
    out.push([x, z]);
  }
  return out;
}

// Campfire or brazier fire: logs, flickering glow cones, and a warm point light.
export function fire(ctx, { x, z, y, size = 1, light = 18, distance = 14, logs = true, color = '#ffb050' }) {
  const base = y ?? ctx.heightAt(x, z);
  const r = ctx.rand;
  if (logs) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + r.range(-0.2, 0.2);
      ctx.solid.add(new THREE.CylinderGeometry(0.08 * size, 0.1 * size, 0.9 * size, 5), {
        position: [x + Math.cos(a) * 0.25 * size, base + 0.12 * size, z + Math.sin(a) * 0.25 * size],
        rotation: [Math.PI / 2 - 0.35, -a + Math.PI / 2, 0],
        color: '#3a2a1e',
      });
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.16 * size, 0), { position: [x + Math.cos(a) * 0.6 * size, base + 0.05, z + Math.sin(a) * 0.6 * size], color: '#6d655c' });
    }
  }
  const group = new THREE.Group();
  const flames = [];
  for (const [col, rad, hh, ox] of [['#ff6a1a', 0.32, 0.9, 0], ['#ffa83a', 0.22, 0.7, 0.08], ['#ffe08a', 0.12, 0.45, -0.05]]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad * size, hh * size, 5).translate(0, (hh * size) / 2, 0), new THREE.MeshBasicMaterial({ color: col, toneMapped: false, transparent: true, opacity: 0.92 }));
    m.position.set(ox * size, 0.1 * size, 0);
    group.add(m);
    flames.push(m);
  }
  group.position.set(x, base, z);
  ctx.scene.add(group);
  const pl = light ? new THREE.PointLight(color, light, distance, 1.6) : null;
  if (pl) {
    pl.position.set(x, base + 1.0 * size, z);
    ctx.scene.add(pl);
  }
  const seed = r() * 10;
  ctx.onFrame((t) => {
    flames.forEach((m, i) => {
      const k = 1 + 0.18 * Math.sin(t * (9 + i * 3) + seed + i) + 0.08 * Math.sin(t * 23 + i);
      m.scale.set(1, k, 1);
      m.rotation.y = t * (0.6 + i * 0.4);
    });
    if (pl) pl.intensity = light * (0.85 + 0.15 * Math.sin(t * 11 + seed) * Math.sin(t * 7.3));
  });
  return group;
}

// Star field and optional moon on a dome that follows the camera.
export function nightSky(ctx, { count = 900, moon, minY = 0.05, size = 2.2, seed = 1 } = {}) {
  const r = ctx.rand;
  const pos = [];
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const y = minY + (1 - minY) * Math.pow(r(), 0.7);
    const rr = Math.sqrt(1 - y * y);
    pos.push(Math.cos(a) * rr * 1200, y * 1200, Math.sin(a) * rr * 1200);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const group = new THREE.Group();
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#fff6e0', size, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
  stars.renderOrder = -8;
  group.add(stars);
  if (moon) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(moon.size ?? 22, 16), new THREE.MeshBasicMaterial({ color: moon.color ?? '#fff3d6', fog: false, toneMapped: false }));
    const dir = new THREE.Vector3(...moon.direction).normalize().multiplyScalar(1150);
    m.position.copy(dir);
    m.lookAt(0, 0, 0);
    m.renderOrder = -7;
    group.add(m);
  }
  ctx.scene.add(group);
  ctx.onFrame((t, dt, camera) => group.position.copy(camera.position));
  return group;
}

// A single robed person. pose: 'stand', 'kneel', 'lying', 'sit'.
export function person(ctx, { x, z, y, face, yaw, pose = 'stand', scale = 1, robe = '#8b6b4a', mantle, skin = '#9b6a46', arms = 'down', emissive = 0, hood = false, collide = true }) {
  const ground = y ?? ctx.heightAt(x, z);
  const fig = createFigure({ x, y: ground, z, face, scale, robe, mantle, skin, arms, emissive, hood });
  if (yaw !== undefined) fig.rotation.y = yaw;
  if (pose === 'kneel') fig.position.y -= 0.48 * scale;
  if (pose === 'sit') fig.position.y -= 0.62 * scale;
  if (pose === 'lying') {
    fig.rotation.order = 'YXZ';
    fig.rotation.x = -Math.PI / 2;
    fig.position.y += 0.22 * scale;
  }
  fig.traverse((o) => (o.receiveShadow = true));
  ctx.scene.add(fig);
  if (collide && pose !== 'lying') ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: ground, top: ground + 1.8 * scale });
  return fig;
}

export function banner(ctx, { x, z, h = 5, color = '#a8342a', pole = '#5a4030', w = 1.4, len = 2.2 }) {
  const y = ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.08, h, 5), { position: [x, y + h / 2, z], color: pole });
  ctx.solid.box(0.05, len, w, { position: [x, y + h - len / 2 - 0.2, z + w / 2], color });
}
