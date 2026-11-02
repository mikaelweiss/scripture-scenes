import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';
import { Batch } from '../../engine/world.js';
import { rng } from '../../engine/util.js';

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

// Maps local (lx, lz) around an anchor rotated by `rot` to world (x, z), matching three.js rotation.y.
export function frame(x, z, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

// One hand-placed person. Poses: stand, kneel, sit, prone (face down), supine (face up).
export function person(ctx, { x, z, y, face, yaw, pose = 'stand', parent, light, halo, collide = true, scale = 1, ...look }) {
  const base = y ?? ctx.heightAt(x, z);
  const g = createFigure({ x, y: base, z, face, scale, ...look });
  if (yaw !== undefined) g.rotation.y = yaw;
  g.rotation.order = 'YXZ';
  if (pose === 'prone' || pose === 'supine') {
    g.rotation.x = pose === 'prone' ? Math.PI / 2 : -Math.PI / 2;
    g.position.y += 0.26 * scale;
  }
  if (pose === 'kneel') g.position.y -= 0.48 * scale;
  if (pose === 'bow') {
    g.position.y -= 0.55 * scale;
    g.rotation.x = 0.75;
  }
  if (pose === 'sit') g.position.y -= 0.62 * scale;
  (parent ?? ctx.scene).add(g);
  const standing = pose === 'stand';
  if (collide && !parent) ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: base, top: base + (standing ? 1.8 : 0.9) * scale });
  if (light) {
    const l = new THREE.PointLight(light.color, light.intensity, light.distance ?? 30, 1.4);
    l.position.set(x, base + (light.lift ?? 2.2), z);
    (parent ?? ctx.scene).add(l);
  }
  if (halo) {
    const sprite = ctx.effects.halo({ position: [x, base + 1.3 * scale, z], ...halo });
    if (parent) parent.add(sprite);
  }
  return g;
}

// A large lake surface with flat-shaded rolling waves. Waves die down inside a calm circle.
export function createWater(ctx, { center = [0, 0], radius = 700, level = 0, color = '#2f5560', foam = '#c9d6d8', amp = 0.6, minAmp = 0.05, calmR = -100, calmFade = 30, emissive = '#000000', segments = 220, speed = 1, size = null }) {
  const N = segments;
  const geo = size ? new THREE.PlaneGeometry(size[0], size[1], Math.round(size[0] / 1.2), Math.round(size[1] / 1.2)) : new THREE.PlaneGeometry(2, 2, N, N);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const warp = (u) => radius * (0.12 * u + 0.88 * u * u * u);
  if (!size) for (let i = 0; i < pos.count; i++) pos.setXYZ(i, warp(pos.getX(i)), 0, warp(pos.getZ(i)));
  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: amp },
    uMinAmp: { value: minAmp },
    uCalmR: { value: calmR },
    uCalmFade: { value: calmFade },
    uCalm: { value: new THREE.Vector2(center[0], center[1]) },
    uFoam: { value: new THREE.Color(foam) },
    uSpeed: { value: speed },
  };
  const material = new THREE.MeshLambertMaterial({ color, flatShading: true, emissive });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime, uAmp, uMinAmp, uCalmR, uCalmFade, uSpeed; uniform vec2 uCalm; varying float vWave;
        float waveAt(vec2 p) {
          float a = uMinAmp + (uAmp - uMinAmp) * smoothstep(uCalmR, uCalmR + uCalmFade, length(p - uCalm));
          float t = uTime * uSpeed;
          float h = sin(p.x * 0.13 + t * 1.1) * 0.55 + sin(p.y * 0.17 - t * 0.9 + p.x * 0.06) * 0.45
                  + sin((p.x * 0.7 + p.y) * 0.35 + t * 1.9) * 0.22 + sin((p.y * 0.8 - p.x) * 0.5 - t * 2.3) * 0.12;
          return a * h;
        }`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 wpw = modelMatrix * vec4(transformed, 1.0);
        float wv = waveAt(wpw.xz);
        transformed.y += wv;
        vWave = wv / max(uAmp, 0.05);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uFoam; varying float vWave;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uFoam, smoothstep(0.6, 1.05, vWave) * 0.85);');
  };
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(center[0], level, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (uniforms.uTime.value = t));
  const waveAt = (x, z, t) => {
    const a = uniforms.uMinAmp.value + (uniforms.uAmp.value - uniforms.uMinAmp.value) * THREE.MathUtils.smoothstep(Math.hypot(x - center[0], z - center[1]), uniforms.uCalmR.value, uniforms.uCalmR.value + uniforms.uCalmFade.value);
    const s = t * uniforms.uSpeed.value;
    return a * (Math.sin(x * 0.13 + s * 1.1) * 0.55 + Math.sin(z * 0.17 - s * 0.9 + x * 0.06) * 0.45 + Math.sin((x * 0.7 + z) * 0.35 + s * 1.9) * 0.22 + Math.sin((z * 0.8 - x) * 0.5 - s * 2.3) * 0.12);
  };
  return { mesh, uniforms, waveAt, level };
}

// Falling rain streaks in a box that follows the camera.
export function createRain(ctx, { count = 2600, area = 44, height = 26, speed = 24, color = '#b8c4cc', opacity = 0.45, wind = [5, 1.5] }) {
  const r = rng(77);
  const pos = new Float32Array(count * 6);
  const end = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = r.range(-area / 2, area / 2), y = r() * height, z = r.range(-area / 2, area / 2);
    pos.set([x, y, z, x, y, z], i * 6);
    end[i * 2 + 1] = 1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  const uniforms = { uTime: { value: 0 }, uSpeed: { value: speed }, uH: { value: height }, uWind: { value: new THREE.Vector2(...wind) }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float aEnd; uniform float uTime, uSpeed, uH; uniform vec2 uWind;
      void main() {
        float sp = uSpeed * (0.8 + 0.4 * fract(position.x * 7.31 + position.z * 3.7));
        float y = mod(position.y - uTime * sp, uH) - uH * 0.35;
        float k = y / sp;
        vec3 p = vec3(position.x + uWind.x * k, y, position.z + uWind.y * k);
        p += aEnd * vec3(uWind.x, sp, uWind.y) * 0.03;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; void main() { gl_FragColor = vec4(uColor, uOpacity); }`,
  });
  const mesh = new THREE.LineSegments(geo, mat);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  ctx.onFrame((t, dt, camera) => {
    uniforms.uTime.value = t;
    mesh.position.copy(camera.position);
    mesh.visible = uniforms.uOpacity.value > 0.01;
  });
  return { mesh, uniforms };
}

// A Galilee fishing boat, bow toward local -z, origin at the waterline. Returns a group plus its deck height.
export function createBoat(ctx, { len = 8.5, beam = 2.6, depth = 1.2, freeboard = 0.55, hull = '#5b4130', deck = '#94704c', trim = '#3b2a1e', mast = true, sail = '#d8ccb0', seed = 4 } = {}) {
  const batch = new Batch(rng(seed));
  const halfWidth = (lz) => {
    const t = lz / (len / 2);
    const k = t < 0 ? Math.pow(Math.abs(t), 1.8) : Math.pow(t, 3);
    return (beam / 2) * Math.max(0.06, Math.sqrt(Math.max(0, 1 - k)));
  };
  const geo = new THREE.BoxGeometry(beam, depth, len, 1, 2, 12).toNonIndexed();
  geo.translate(0, freeboard - depth / 2, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = z / (len / 2);
    const bottom = y < freeboard - 0.01;
    const w = halfWidth(z) * Math.sign(x) * (bottom ? (y < freeboard - depth + 0.01 ? 0.35 : 0.85) : 1);
    const ny = y + (bottom ? t * t * depth * 0.55 : 0);
    p.setXYZ(i, w, ny, z);
  }
  batch.add(geo, { color: hull, jitter: 0.04, shade: (c, ny) => (ny > 0.8 ? c.set(deck) : darkenBottom(c, ny)) });
  const segs = 10;
  for (const side of [-1, 1]) {
    for (let i = 0; i < segs; i++) {
      const z0 = -len / 2 + (i / segs) * len, z1 = -len / 2 + ((i + 1) / segs) * len;
      const x0 = halfWidth(z0) * side, x1 = halfWidth(z1) * side;
      const seg = Math.hypot(x1 - x0, z1 - z0);
      const t = (z0 + z1) / len;
      const rise = 0.42 + t * t * 0.5;
      batch.box(0.12, rise, seg + 0.06, {
        position: [(x0 + x1) / 2 - side * 0.04, freeboard + rise / 2, (z0 + z1) / 2],
        rotation: [0, Math.atan2(x1 - x0, z1 - z0), 0],
        color: trim,
        jitter: 0.03,
      });
    }
  }
  batch.box(0.22, 0.9, 0.5, { position: [0, freeboard + 0.6, -len / 2 + 0.15], rotation: [-0.5, 0, 0], color: trim });
  batch.box(beam * 0.55, 0.5, 0.18, { position: [0, freeboard + 0.25, len / 2 - 0.35], color: trim });
  for (const tz of [-len * 0.18, len * 0.12]) batch.box(halfWidth(tz) * 2 - 0.15, 0.1, 0.32, { position: [0, freeboard + 0.42, tz], color: deck });
  for (const side of [-1, 1]) {
    batch.box(0.07, 0.07, 3.6, { position: [side * (halfWidth(0) + 0.5), freeboard + 0.3, 0.3], rotation: [0, side * 0.35, side * 0.25], color: '#6b5038' });
  }
  if (mast) {
    batch.add(new THREE.CylinderGeometry(0.07, 0.1, 6.2, 6), { position: [0, freeboard + 3.1, -len * 0.18], color: '#6b4f36' });
    batch.add(new THREE.CylinderGeometry(0.05, 0.05, 5.2, 5), { position: [0, freeboard + 5.6, -len * 0.18], rotation: [0, 0, 1.2], color: '#6b4f36' });
    batch.add(new THREE.CylinderGeometry(0.16, 0.16, 4.4, 6), { position: [0, freeboard + 5.42, -len * 0.18], rotation: [0, 0, 1.2], color: sail, jitter: 0.06 });
    for (const lz of [-len / 2 + 0.2, len / 2 - 0.2]) {
      const a = new THREE.Vector3(0, freeboard + 6.1, -len * 0.18), b = new THREE.Vector3(0, freeboard + 0.5, lz);
      const l = a.distanceTo(b);
      const rope = new THREE.CylinderGeometry(0.015, 0.015, l, 3);
      rope.rotateX(Math.atan2(b.z - a.z, a.y - b.y));
      batch.add(rope, { position: [0, (a.y + b.y) / 2, (a.z + b.z) / 2], color: '#4a3b2c' });
    }
  }
  const mesh = batch.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.castShadow = mesh.receiveShadow = true;
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';
  group.add(mesh);
  return { group, deckY: freeboard, halfWidth, len, beam };
}

// Floor and rail colliders for a boat at world (x, z) rotated by rot. Leave `gap` [lzFrom, lzTo] on one side open.
export function boatColliders(ctx, { x, z, rot = 0, level = 0, boat, railTop = 1.6, gapSide = 0, gap = null }) {
  const at = frame(x, z, rot);
  const { len, halfWidth, deckY } = boat;
  const n = 8;
  for (let i = 0; i < n; i++) {
    const lz = -len / 2 + ((i + 0.5) / n) * len;
    const w = halfWidth(lz) * 2;
    const [cx, cz] = at(0, lz);
    ctx.colliders.add({ x: cx, z: cz, w: Math.max(0.2, w - 0.1), d: len / n + 0.02, rot, bottom: level - 2, top: level + deckY });
    for (const side of [-1, 1]) {
      if (gap && side === gapSide && lz > gap[0] && lz < gap[1]) continue;
      const [rx, rz] = at(side * (halfWidth(lz) + 0.05), lz);
      ctx.colliders.add({ x: rx, z: rz, w: 0.35, d: len / n + 0.3, rot, bottom: level - 2, top: level + deckY + railTop });
    }
  }
  for (const lz of [-len / 2 - 0.1, len / 2 + 0.1]) {
    const [rx, rz] = at(0, lz);
    ctx.colliders.add({ x: rx, z: rz, w: 1.6, d: 0.4, rot, bottom: level - 2, top: level + deckY + railTop });
  }
}

// Plain flat-roofed stone house with a parapet and a dark doorway on local +z.
export function house(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3.6, color = '#cdb994', door = '#3a2c22', parapet = true, collide = true }) {
  const r = ctx.rand;
  const at = frame(x, z, rot);
  let y = Infinity;
  for (const [lx, lz] of [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) y = Math.min(y, ctx.heightAt(...at(lx, lz)));
  y -= 0.2;
  ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter: 0.04, shade: darkenBottom });
  ctx.solid.box(w + 0.3, 0.25, d + 0.3, { position: [x, y + h + 0.12, z], rotation: [0, rot, 0], color: '#a8946e', shade: darkenBottom });
  if (parapet) {
    for (const [lx, lz, ww, dd] of [[0, -d / 2, w, 0.25], [0, d / 2, w, 0.25], [-w / 2, 0, 0.25, d], [w / 2, 0, 0.25, d]]) {
      const [px, pz] = at(lx, lz);
      ctx.solid.box(ww, 0.5, dd, { position: [px, y + h + 0.45, pz], rotation: [0, rot, 0], color, jitter: 0.03 });
    }
  }
  const [dx, dz] = at(r.range(-w / 4, w / 4), d / 2 + 0.02);
  ctx.solid.box(1.0, 1.9, 0.1, { position: [dx, y + 0.2 + 0.95, dz], rotation: [0, rot, 0], color: door, jitter: 0.02 });
  for (const lx of [-w / 3, w / 3]) {
    const [wx, wz] = at(lx, d / 2 + 0.02);
    if (r() < 0.6) ctx.solid.box(0.5, 0.45, 0.1, { position: [wx, y + h * 0.72, wz], rotation: [0, rot, 0], color: door, jitter: 0.02 });
  }
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h + 0.7 });
}

// Woven basket, optionally heaped with broken bread.
export function basket(ctx, { x, z, y, size = 0.45, bread = true, color = '#9a7444' }) {
  const r = ctx.rand;
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(size, size * 0.72, size * 1.1, 8, 2), { position: [x, base + size * 0.55, z], rotation: [0, r() * 3, 0], color, jitter: 0.1 });
  ctx.solid.add(new THREE.TorusGeometry(size, 0.05, 3, 8), { position: [x, base + size * 1.1, z], rotation: [Math.PI / 2, 0, 0], color: '#7a5a34' });
  if (bread) {
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2, d = r() * size * 0.55;
      ctx.solid.add(new THREE.DodecahedronGeometry(size * r.range(0.2, 0.32), 0), {
        position: [x + Math.cos(a) * d, base + size * 1.1 + r.range(0, 0.1), z + Math.sin(a) * d],
        scale: [1.3, 0.7, 1],
        rotation: [0, r() * 3, 0],
        color: r.pick(['#d7a865', '#c99550', '#e0b878']),
        jitter: 0.06,
      });
    }
  }
}

// Finds the sky dome and lets a scene recolor it over time.
export function skyUniforms(scene) {
  let found = null;
  scene.traverse((o) => {
    if (!found && o.material?.uniforms?.uTop) found = o.material.uniforms;
  });
  return found;
}

// A sick person lying on a mat under a blanket, head on a rolled cloth at local -z.
export function sickBed(ctx, { x, z, y, yaw = 0, robe = '#8b6b4a', blanket = '#b59a72', skin = '#9b6a46', mat = '#9c7c52', hair = '#3a2a20' }) {
  const base = y ?? ctx.heightAt(x, z);
  const at = frame(x, z, yaw);
  const put = (geo, lx, ly, lz, color, jitter = 0.05, rot = [0, 0, 0]) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(geo, { position: [px, base + ly, pz], rotation: [rot[0], yaw + rot[1], rot[2]], color, jitter });
  };
  put(new THREE.BoxGeometry(1.0, 0.06, 2.15), 0, 0.04, 0.05, mat, 0.07);
  put(new THREE.CylinderGeometry(0.12, 0.12, 0.62, 6).rotateZ(Math.PI / 2), 0, 0.17, -0.86, '#d8ccb0');
  put(new THREE.IcosahedronGeometry(0.15, 0).scale(1, 0.95, 1.1), 0, 0.3, -0.74, skin, 0.03);
  put(new THREE.IcosahedronGeometry(0.15, 0).scale(1.05, 0.7, 0.85), 0, 0.24, -0.84, hair, 0.04);
  put(new THREE.BoxGeometry(0.56, 0.24, 0.3), 0, 0.17, -0.48, robe);
  put(new THREE.BoxGeometry(0.66, 0.16, 1.25), 0, 0.13, 0.18, blanket, 0.06);
  put(new THREE.BoxGeometry(0.48, 0.08, 1.1), 0, 0.24, 0.12, blanket, 0.06);
  put(new THREE.BoxGeometry(0.66, 0.07, 0.14), 0, 0.28, -0.38, '#e2d6bc', 0.03);
  put(new THREE.BoxGeometry(0.34, 0.16, 0.18), 0, 0.27, 0.74, blanket, 0.06);
  for (const lz of [0.42, 0.56]) put(new THREE.BoxGeometry(0.68, 0.17, 0.06), 0, 0.135, lz, '#e6dcc4', 0.02);
  for (const side of [-1, 1]) {
    const spread = 0.32;
    put(new THREE.CylinderGeometry(0.06, 0.065, 0.44, 5).rotateX(Math.PI / 2), side * 0.22, 0.31, -0.2, robe, 0.04, [0, -side * spread, 0]);
    put(new THREE.BoxGeometry(0.11, 0.08, 0.14), side * (0.22 - 0.26 * Math.sin(spread)), 0.32, -0.2 + 0.26 * Math.cos(spread), skin, 0.03);
  }
}

const UP = new THREE.Vector3(0, 1, 0);

// A cylinder between two local points around an anchor, batched into ctx.solid.
function limb(ctx, at, base, yaw, a, b, r0, r1, color, sides = 6) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const geo = new THREE.CylinderGeometry(r1, r0, dir.length(), sides);
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()));
  const m = va.add(vb).multiplyScalar(0.5);
  const [px, pz] = at(m.x, m.z);
  ctx.solid.add(geo, { position: [px, base + m.y, pz], rotation: [0, yaw, 0], color, jitter: 0.05 });
}

// A person fallen on their face: kneeling, back bent, forehead and hands to the ground toward `face`.
export function prostrate(ctx, { x, z, y, face, robe = '#7a5f44', mantle, skin = '#9b6a46', hair = '#3a2a20', scale = 1 }) {
  const base = y ?? ctx.heightAt(x, z);
  const yaw = Math.atan2(face[0] - x, face[1] - z);
  const at = frame(x, z, yaw);
  const s = scale;
  const L = (p) => p.map((v) => v * s);
  const put = (geo, p, color, rot = [0, 0, 0]) => {
    const [px, pz] = at(p[0] * s, p[2] * s);
    ctx.solid.add(geo, { position: [px, base + p[1] * s, pz], rotation: [rot[0], yaw + rot[1], rot[2]], scale: [s, s, s], color, jitter: 0.05 });
  };
  put(new THREE.BoxGeometry(0.42, 0.16, 0.62), [0, 0.08, -0.28], robe);
  limb(ctx, at, base, yaw, L([0, 0.1, 0.02]), L([0, 0.62, -0.28]), 0.25 * s, 0.27 * s, robe, 7);
  limb(ctx, at, base, yaw, L([0, 0.64, -0.24]), L([0, 0.42, 0.42]), 0.27 * s, 0.2 * s, robe, 7);
  if (mantle) limb(ctx, at, base, yaw, L([0, 0.72, -0.18]), L([0, 0.52, 0.4]), 0.26 * s, 0.22 * s, mantle, 7);
  put(new THREE.IcosahedronGeometry(0.14, 0).scale(1, 1.1, 1), [0, 0.17, 0.66], skin);
  put(new THREE.IcosahedronGeometry(0.15, 0).scale(1.05, 1, 0.9), [0, 0.25, 0.6], mantle ?? hair);
  for (const side of [-1, 1]) {
    limb(ctx, at, base, yaw, L([side * 0.22, 0.44, 0.38]), L([side * 0.24, 0.07, 0.86]), 0.065 * s, 0.055 * s, mantle ?? robe, 5);
    put(new THREE.BoxGeometry(0.11, 0.06, 0.17), [side * 0.24, 0.04, 0.96], skin);
  }
}

// A jagged cluster of rock: one tall shard leaning out of a heap of smaller blocks.
export function outcrop(ctx, { x, z, size = 2, color = '#8a8070', moss = null, collide = true }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = i === 0 ? 0 : r.range(0.3, 0.9) * size;
    const s = size * (i === 0 ? 1 : r.range(0.35, 0.6));
    const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    ctx.solid.add(new THREE.DodecahedronGeometry(s * 0.6, 0), {
      position: [px, ctx.heightAt(px, pz) + s * (i === 0 ? 0.45 : 0.15), pz],
      rotation: [r.range(-0.25, 0.25), r() * 3, r.range(-0.25, 0.25)],
      scale: [r.range(0.8, 1.1), i === 0 ? r.range(1.2, 1.7) : r.range(0.6, 0.9), r.range(0.7, 1)],
      color: jitterRock(color, r),
      jitter: 0.07,
      shade: (c, ny) => (moss && ny > 0.75 ? c.set(moss) : darkenBottom(c, ny)),
    });
  }
  if (collide) ctx.colliders.add({ x, z, w: size * 1.3, d: size * 1.3, bottom: y - 1, top: y + size * 1.2 });
}

function jitterRock(color, r) {
  return new THREE.Color(color).offsetHSL(0, 0, r.range(-0.05, 0.05));
}

// Mountain grass: small clumps of blades, batched, with a few flowers.
export function grassTufts(ctx, { center = [0, 0], radius = 12, inner = 0, count = 120, colors = ['#7c8a4a', '#6b7a3e', '#8e9656'], flowers = 0.1, avoid = [] }) {
  const r = ctx.rand;
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = inner + Math.sqrt(r()) * (radius - inner);
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    const y = ctx.heightAt(x, z);
    const h = r.range(0.25, 0.55);
    const color = r.pick(colors);
    for (let k = 0; k < 4; k++) {
      ctx.solid.add(new THREE.ConeGeometry(0.06, h, 3), {
        position: [x + r.range(-0.15, 0.15), y + h / 2 - 0.03, z + r.range(-0.15, 0.15)],
        rotation: [r.range(-0.35, 0.35), r() * 3, r.range(-0.35, 0.35)],
        color,
        jitter: 0.08,
      });
    }
    if (r() < flowers) ctx.solid.add(new THREE.OctahedronGeometry(0.06, 0), { position: [x, y + h + 0.02, z], color: r.pick(['#e8e0f0', '#f0d860', '#c890d0']), jitter: 0.05 });
  }
}
