// Shared helpers for ot-01..ot-06: water, sky bodies, rainbow, fire, birds, angels.
import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

let glowTex;
function glowTexture() {
  if (glowTex) return glowTex;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.2, 'rgba(255,255,255,0.6)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  glowTex = new THREE.CanvasTexture(canvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

export function glowSprite(ctx, { position, size = 6, color = '#fff6dc', opacity = 0.8, fog = false }) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, opacity, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog }));
  sprite.position.set(...position);
  sprite.scale.set(size, size, 1);
  ctx.scene.add(sprite);
  return sprite;
}

// Faceted water sheet whose waves come from a vertex shader; flat shading turns them into facets.
export function water(ctx, { level = 0, size = 1200, segments = 160, center = [0, 0], color = '#3d7c95', amp = 0.18, freq = 1, shininess = 70, specular = '#cfe6f0', opacity = 1 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const step = size / segments;
  const r = rng(77);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    if (Math.abs(x) < size / 2 - 1 && Math.abs(z) < size / 2 - 1) pos.setXYZ(i, x + (r() - 0.5) * step * 0.5, 0, z + (r() - 0.5) * step * 0.5);
  }
  const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess, specular, transparent: opacity < 1, opacity });
  const uTime = { value: 0 };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 wp = modelMatrix * vec4(position, 1.0);
        float f = ${freq.toFixed(3)};
        transformed.y += (sin(wp.x * 0.21 * f + uTime * 1.1) + sin(wp.z * 0.17 * f - uTime * 0.9) + 0.6 * sin((wp.x + wp.z) * 0.37 * f + uTime * 1.7)) * ${amp.toFixed(3)};`,
      );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(center[0], level, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (uTime.value = t));
  return mesh;
}

// Walls the walker off from water deeper than `depth`.
export function blockWater(ctx, { level, center = [0, 0], radius = 150, cell = 2, depth = 0.45 }) {
  for (let x = center[0] - radius; x <= center[0] + radius; x += cell) {
    for (let z = center[1] - radius; z <= center[1] + radius; z += cell) {
      if (ctx.heightAt(x, z) < level - depth) ctx.colliders.add({ x, z, w: cell, d: cell, bottom: -100, top: 100 });
    }
  }
}

export function stars(ctx, { count = 900, minY = 0.08, size = 2, color = '#ffffff', seed = 4, opacity = 1 } = {}) {
  const r = rng(seed);
  const pts = [];
  while (pts.length < count * 3) {
    const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (v.lengthSq() > 1 || v.lengthSq() < 0.01) continue;
    v.normalize();
    if (v.y < minY) continue;
    pts.push(v.x * 1300, v.y * 1300, v.z * 1300);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, depthWrite: false, transparent: true, opacity, toneMapped: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = -6;
  ctx.scene.add(points);
  ctx.onFrame((t, dt, camera) => points.position.copy(camera.position));
  return points;
}

// A disc in the sky (sun, moon) that keeps its direction as the walker moves.
export function skyDisc(ctx, { dir, distance = 1200, radius = 40, color = '#fff6d8', glow = 4, glowColor, crescent = false }) {
  const d = new THREE.Vector3(...dir).normalize();
  const group = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 28), new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false, depthWrite: false }));
  group.add(disc);
  if (crescent) {
    const shade = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.92, 28), new THREE.MeshBasicMaterial({ color: crescent, fog: false, depthWrite: false }));
    shade.position.set(radius * 0.42, radius * 0.18, 0.5);
    group.add(shade);
  }
  if (glow) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: glowColor ?? color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    sprite.scale.set(radius * glow * 2, radius * glow * 2, 1);
    sprite.position.z = -1;
    group.add(sprite);
  }
  group.renderOrder = -4;
  group.traverse((o) => (o.renderOrder = -4));
  ctx.scene.add(group);
  ctx.onFrame((t, dt, camera) => {
    group.position.copy(camera.position).addScaledVector(d, distance);
    group.lookAt(camera.position);
  });
  return group;
}

export function rainbow(ctx, { center, y = -30, radius = 300, width = 34, yaw = 0, opacity = 0.5, double = true }) {
  const make = (rad, wid, op, flip) => {
    const geo = new THREE.RingGeometry(rad - wid / 2, rad + wid / 2, 128, 1, 0, Math.PI);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
      uniforms: { uIn: { value: rad - wid / 2 }, uW: { value: wid }, uOp: { value: op }, uFlip: { value: flip ? 1 : 0 } },
      vertexShader: `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uIn, uW, uOp, uFlip; varying vec3 vP;
        vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
        void main() {
          float t = (length(vP.xy) - uIn) / uW;
          if (uFlip > 0.5) t = 1.0 - t;
          vec3 c = hue(mix(0.78, 0.0, t));
          float a = smoothstep(0.0, 0.18, t) * smoothstep(1.0, 0.82, t) * smoothstep(${(-y).toFixed(1)}, ${(-y + 90).toFixed(1)}, vP.y);
          gl_FragColor = vec4(c, a * uOp);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(center[0], y, center[1]);
    mesh.rotation.y = yaw;
    mesh.renderOrder = -3;
    ctx.scene.add(mesh);
  };
  make(radius, width, opacity, false);
  if (double) make(radius * 1.32, width * 1.1, opacity * 0.35, true);
}

// Flickering low-poly flames with a warm point light and optional smoke.
export function fire(ctx, { position, size = 1, light = 18, smoke = true, smokeHeight = 14, seed = 1 }) {
  const [x, y, z] = position;
  const r = rng(seed);
  const group = new THREE.Group();
  const cols = ['#ff7a1c', '#ffb43a', '#ffe08a', '#ff5a14'];
  const flames = [];
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.ConeGeometry(0.28 * size, 1, 5);
    geo.translate(0, 0.5, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], toneMapped: false }));
    const a = r() * Math.PI * 2, d = r() * 0.3 * size;
    m.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    m.rotation.set(r.range(-0.2, 0.2), r() * 3, r.range(-0.2, 0.2));
    flames.push([m, r.range(0.7, 1.4) * size, r() * 10, r.range(6, 11)]);
    group.add(m);
  }
  group.position.set(x, y, z);
  ctx.scene.add(group);
  let pl;
  if (light) {
    pl = new THREE.PointLight('#ff9a48', light * size, 14 * size, 1.5);
    pl.position.set(x, y + 1.2 * size, z);
    ctx.scene.add(pl);
  }
  ctx.onFrame((t) => {
    for (const [m, h, ph, sp] of flames) {
      const k = 0.75 + 0.25 * Math.sin(t * sp + ph) + 0.1 * Math.sin(t * sp * 2.3 + ph);
      m.scale.set(1 - k * 0.2, h * k, 1 - k * 0.2);
    }
    if (pl) pl.intensity = light * size * (0.85 + 0.15 * Math.sin(t * 13 + seed));
  });
  if (smoke) ctx.effects.smoke({ position: [x, y + 1.2 * size, z], count: 10, height: smokeHeight, size: 0.5 * size, color: '#a49c96', seed });
  return group;
}

// A flock of low-poly birds circling with flapping wings.
export function birds(ctx, { center, radius = 40, height = 25, count = 20, color = '#2e2a28', size = 1, speed = 6, seed = 3, spread = 10 }) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0.35, -1, 0.5, -0.1, 0, 0, -0.25,
    0, 0, 0.35, 0, 0, -0.25, 1, 0.5, -0.1,
  ], 3));
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }), count);
  const r = rng(seed);
  const seeds = Array.from({ length: count }, () => [r() * Math.PI * 2, radius + r.range(-spread, spread), height + r.range(-spread, spread) * 0.5, r.range(0.8, 1.2), r() * 10, r.sign()]);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    seeds.forEach(([a0, rad, h, k, ph, dir], i) => {
      const a = a0 + dir * (t * speed * k) / rad;
      p.set(center[0] + Math.cos(a) * rad, h + Math.sin(t * 0.5 + ph) * 2, center[1] + Math.sin(a) * rad);
      q.setFromEuler(e.set(0, -a + (dir > 0 ? Math.PI : 0), dir * 0.3));
      s.set(size, size * Math.sin(t * 9 * k + ph), size);
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return mesh;
}

// Faceless being in white with soft light, optional wings.
export function angel(ctx, { x, z, y = ctx.heightAt(x, z), face, scale = 1.25, wings = true, arms = 'down', glow = 0.55, halo = 5, light = 18, robe = '#fbfaf4' }) {
  const group = createFigure({ x, y, z, face, scale, robe, mantle: '#f2efe4', skin: '#f3ece0', arms, emissive: glow });
  if (wings) {
    const shape = new THREE.Shape();
    const pts = [[0, 0], [0.5, 0.45], [1.05, 0.62], [1.35, 0.48], [1.2, 0.18], [1.05, -0.2], [0.85, -0.6], [0.55, -0.95], [0.25, -0.8], [0.05, -0.35]];
    shape.moveTo(...pts[0]);
    for (const p of pts.slice(1)) shape.lineTo(...p);
    const mat = new THREE.MeshLambertMaterial({ color: '#fbf8ee', emissive: '#fff4dc', emissiveIntensity: glow * 0.9, side: THREE.DoubleSide });
    for (const side of [-1, 1]) {
      const geo = new THREE.ShapeGeometry(shape);
      geo.scale(side, 1, 1);
      geo.rotateY(side * 0.55);
      geo.translate(side * 0.1, 1.28, -0.14);
      group.add(new THREE.Mesh(geo, mat));
    }
  }
  ctx.scene.add(group);
  ctx.colliders.add({ x, z, w: 0.8, d: 0.8, bottom: y, top: y + 2 * scale });
  if (halo) glowSprite(ctx, { position: [x, y + 1.25 * scale, z], size: halo, color: '#fff3d6', opacity: 0.55 });
  if (light) {
    const pl = new THREE.PointLight('#fff1d2', light, 16, 1.5);
    pl.position.set(x, y + 2, z + 0.5);
    ctx.scene.add(pl);
  }
  return group;
}
