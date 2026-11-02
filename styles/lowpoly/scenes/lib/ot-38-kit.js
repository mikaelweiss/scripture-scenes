import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';
import { Batch } from '../../engine/world.js';
import { rng } from '../../engine/util.js';

const darken = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export const lambert = () => new THREE.MeshLambertMaterial({ vertexColors: true });

// A separate batch for geometry that moves as one piece, e.g. a ship.
export function movingBatch(rand, build) {
  const batch = new Batch(rand);
  build(batch);
  const mesh = batch.build(lambert());
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

// Solid box with a collider, base at y.
export function block(ctx, { x, z, y = 0, w, h, d, rot = 0, color, collide = true, jitter = 0.04, batch = ctx.solid }) {
  batch.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter, shade: darken });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Hand-placed person. `tilt` leans the whole body (x: forward, z: sideways) for falling or bowing.
export function person(ctx, { x, z, y, face, tilt = [0, 0], parent = ctx.scene, collide = true, ...rest }) {
  const yy = y ?? ctx.heightAt(x, z);
  const fig = createFigure({ x, y: yy, z, face, ...rest });
  if (tilt[0] || tilt[1]) {
    fig.rotation.order = 'YXZ';
    fig.rotation.x = tilt[0];
    fig.rotation.z = tilt[1];
  }
  parent.add(fig);
  if (collide && parent === ctx.scene) ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: yy, top: yy + 1.8 * (rest.scale ?? 1) });
  return fig;
}

// A divine being: white, faceless, softly lit.
export function being(ctx, { x, z, y, face, scale = 1.1, arms = 'out', light = 30, distance = 18, halo = 5, color = '#fff6e4', glow = 0.6 }) {
  const yy = y ?? ctx.heightAt(x, z);
  const fig = createFigure({ x, y: yy, z, face, scale, robe: '#fbf8f0', mantle: '#f4eedf', skin: '#f4ead8', arms, emissive: glow });
  fig.traverse((o) => {
    if (o.material) o.material.emissiveIntensity = glow;
  });
  ctx.scene.add(fig);
  if (light) {
    const l = new THREE.PointLight(color, light, distance, 1.4);
    l.position.set(x, yy + 1.8 * scale, z);
    ctx.scene.add(l);
  }
  if (halo) ctx.effects.halo({ position: [x, yy + 1.2 * scale, z], size: halo, color, opacity: 0.6 });
  return fig;
}

// Flickering low-poly flames over a rectangle.
export function flames(ctx, { x, z, y = 0, w = 4, d = 4, count = 60, height = 3, colors = ['#ff5a14', '#ff8a24', '#ffb84a', '#ffd27a'], seed = 4 }) {
  const rand = rng(seed);
  const geo = new THREE.ConeGeometry(1, 1, 5).translate(0, 0.5, 0);
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const seeds = Array.from({ length: count }, () => ({
    px: x + rand.range(-w / 2, w / 2), pz: z + rand.range(-d / 2, d / 2),
    r: rand.range(0.25, 0.6), h: rand.range(0.5, 1) * height, ph: rand() * 10, sp: rand.range(5, 9), spin: rand() * 6,
  }));
  const c = new THREE.Color();
  seeds.forEach((s, i) => mesh.setColorAt(i, c.set(rand.pick(colors))));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), e = new THREE.Euler();
  ctx.onFrame((t) => {
    seeds.forEach((s, i) => {
      const k = 0.65 + 0.35 * Math.sin(t * s.sp + s.ph) * Math.sin(t * s.sp * 0.63 + s.ph * 2);
      p.set(s.px, y, s.pz);
      sc.set(s.r * (1.1 - k * 0.3), s.h * k, s.r * (1.1 - k * 0.3));
      q.setFromEuler(e.set(Math.sin(t * 3 + s.ph) * 0.12, s.spin + t, Math.cos(t * 2.6 + s.ph) * 0.12));
      mesh.setMatrixAt(i, m.compose(p, q, sc));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  return mesh;
}

// Point light that flickers like fire.
export function fireLight(ctx, { position, color = '#ff9a40', intensity = 40, distance = 20, flicker = 0.25 }) {
  const l = new THREE.PointLight(color, intensity, distance, 1.3);
  l.position.set(...position);
  ctx.scene.add(l);
  const ph = ctx.rand() * 10;
  ctx.onFrame((t) => (l.intensity = intensity * (1 - flicker + flicker * (Math.sin(t * 9 + ph) * 0.5 + Math.sin(t * 13.7 + ph) * 0.5 + 1) / 2)));
  return l;
}

// A room around (x, z): floor, four walls with an optional door in the +z wall, optional ceiling.
export function room(ctx, { x = 0, z = 0, y = 0, w, d, h, thick = 0.8, wall = '#c9b48e', floor = '#8a6e52', ceiling, door = 0, base, baseH = 1.1 }) {
  ctx.solid.box(w, 0.3, d, { position: [x, y - 0.1, z], color: floor, jitter: 0.03 });
  block(ctx, { x, z: z - d / 2, y, w: w + thick, h, d: thick, color: wall });
  block(ctx, { x: x - w / 2, z, y, w: thick, h, d, color: wall });
  block(ctx, { x: x + w / 2, z, y, w: thick, h, d, color: wall });
  if (door) {
    const side = (w - door) / 2;
    block(ctx, { x: x - w / 2 + side / 2, z: z + d / 2, y, w: side + thick, h, d: thick, color: wall });
    block(ctx, { x: x + w / 2 - side / 2, z: z + d / 2, y, w: side + thick, h, d: thick, color: wall });
    block(ctx, { x, z: z + d / 2, y: y + h * 0.7, w: door, h: h * 0.3, d: thick, color: wall, collide: false });
  } else block(ctx, { x, z: z + d / 2, y, w: w + thick, h, d: thick, color: wall });
  if (base) {
    for (const [bx, bz, bw, bd] of [[x, z - d / 2 + thick, w, 0.25], [x - w / 2 + thick, z, 0.25, d], [x + w / 2 - thick, z, 0.25, d]]) {
      ctx.solid.box(bw, baseH, bd, { position: [bx, y + baseH / 2, bz], color: base, jitter: 0.02 });
    }
  }
  if (ceiling) ctx.solid.box(w + thick, 0.5, d + thick, { position: [x, y + h + 0.25, z], color: ceiling, jitter: 0.03, shade: (c, ny) => ny < -0.5 && c.multiplyScalar(0.8) });
}

// Low-poly lion. pose: 'lie' (resting, head up) or 'stand'.
export function lion(ctx, { x, z, y, rot = 0, pose = 'lie', size = 1, body = '#c79a5a', mane = '#7d4f28', batch = ctx.solid }) {
  const yy = y ?? ctx.heightAt(x, z);
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, ly, lz) => [x + (lx * c + lz * s) * size, yy + ly * size, z + (-lx * s + lz * c) * size];
  const part = (geo, lx, ly, lz, color, extra = [0, 0, 0], scale = [1, 1, 1]) =>
    batch.add(geo, { position: at(lx, ly, lz), rotation: [extra[0], rot + extra[1], extra[2]], scale: scale.map((v) => v * size), color, jitter: 0.05, shade: darken });
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const lying = pose === 'lie';
  const by = lying ? 0.38 : 0.85;
  part(box(0.7, 0.55, 1.5), 0, by, 0, body);
  part(box(0.62, 0.5, 0.5), 0, by + 0.02, -0.55, body, [0.15, 0, 0]);
  part(new THREE.DodecahedronGeometry(0.5, 0), 0, by + 0.35, 0.72, mane, [0, 0, 0], [1.05, 1.1, 0.8]);
  part(box(0.42, 0.4, 0.5), 0, by + 0.38, 1.05, body);
  part(box(0.3, 0.2, 0.2), 0, by + 0.28, 1.32, '#a87c48');
  part(box(0.1, 0.1, 0.1), -0.16, by + 0.62, 0.98, mane);
  part(box(0.1, 0.1, 0.1), 0.16, by + 0.62, 0.98, mane);
  if (lying) {
    for (const sx of [-0.25, 0.25]) {
      part(box(0.18, 0.16, 0.7), sx, 0.1, 0.85, body);
      part(box(0.22, 0.2, 0.55), sx * 1.4, 0.15, -0.55, body);
    }
  } else {
    for (const [sx, sz] of [[-0.24, 0.55], [0.24, 0.55], [-0.24, -0.6], [0.24, -0.6]]) part(box(0.18, 0.62, 0.2), sx, 0.31, sz, body);
  }
  part(box(0.07, 0.07, 0.9), 0.15, lying ? 0.12 : 0.6, -1.1, body, [lying ? 0 : 0.6, 0.4, 0]);
  part(box(0.14, 0.14, 0.18), 0.32, lying ? 0.12 : 0.3, -1.5, mane);
  ctx.colliders.add({ x, z, w: 1.1 * size, d: 2.6 * size, rot, bottom: yy, top: yy + (lying ? 1.1 : 1.6) * size });
}

// Glowing text drawn on a canvas, e.g. writing on a wall.
export function writing(ctx, { lines, position, rotationY = 0, width = 6, height = 2, color = '#ffd88a', font = 'bold 84px Georgia, serif', glowColor = '#ffb040' }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round((1024 * height) / width);
  const g = canvas.getContext('2d');
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = font;
  g.shadowColor = glowColor;
  g.shadowBlur = 28;
  g.fillStyle = color;
  lines.forEach((line, i) => g.fillText(line, canvas.width / 2, ((i + 0.5) / lines.length) * canvas.height));
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
  );
  mesh.position.set(...position);
  mesh.rotation.y = rotationY;
  ctx.scene.add(mesh);
  return mesh;
}

// Six flat wings in three pairs: over the face, over the feet, and spread for flight.
export function seraph(ctx, { x, y, z, face = [0, 0], scale = 1, light = 0, seed = 1 }) {
  const group = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: '#fffaf0', emissive: '#fff4dc', emissiveIntensity: 0.45, side: THREE.DoubleSide, flatShading: true });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.6, 7).translate(0, -0.2, 0), white);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0).translate(0, 0.72, 0), white);
  group.add(body, head);
  const wingGeo = (len, wid) => {
    const g = new THREE.BufferGeometry();
    const v = [0, 0, 0, len, wid * 0.4, 0, len * 0.9, -wid * 0.5, 0, 0, 0, 0, len * 0.9, -wid * 0.5, 0, len * 0.35, -wid * 0.7, 0];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  };
  const flyers = [];
  for (const side of [-1, 1]) {
    const top = new THREE.Mesh(wingGeo(0.9, 0.9), white);
    top.position.set(side * 0.12, 0.6, 0.12);
    top.rotation.set(0, side > 0 ? -1.3 : Math.PI + 1.3, side * -0.4);
    const low = new THREE.Mesh(wingGeo(0.9, 0.9), white);
    low.position.set(side * 0.12, -0.5, 0.12);
    low.rotation.set(0, side > 0 ? -1.3 : Math.PI + 1.3, side * 0.6);
    const fly = new THREE.Group();
    fly.position.set(side * 0.15, 0.25, -0.1);
    const wing = new THREE.Mesh(wingGeo(2.2, 1.4), white);
    wing.rotation.y = side > 0 ? 0 : Math.PI;
    fly.add(wing);
    flyers.push([fly, side]);
    group.add(top, low, fly);
  }
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  group.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(group);
  const ph = seed * 1.7;
  ctx.onFrame((t) => {
    for (const [fly, side] of flyers) fly.rotation.z = side * (0.35 + 0.45 * Math.sin(t * 2.4 + ph));
    group.position.y = y + Math.sin(t * 1.2 + ph) * 0.25;
  });
  if (light) {
    const l = new THREE.PointLight('#fff2d0', light, 20, 1.4);
    l.position.set(x, y, z);
    ctx.scene.add(l);
  }
  ctx.effects.halo({ position: [x, y + 0.2 * scale, z], size: 4 * scale, color: '#fff2d0', opacity: 0.45 });
  return group;
}

// Animated low-poly sea. Returns a function giving the wave height at (x, z, t).
export function ocean(ctx, { size = 900, segments = 160, color = '#2c4a5a', y = 0, amp = 1, center = [0, 0] }) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });
  const time = { value: 0 };
  const wave = `
    float waveAt(vec2 p, float t) {
      return (sin(p.x * 0.11 + t * 1.1) * 0.9 + sin(p.y * 0.13 - t * 0.9 + p.x * 0.05) * 0.8
        + sin((p.x + p.y) * 0.31 + t * 1.9) * 0.35 + sin((p.x - p.y) * 0.47 - t * 2.3) * 0.2) * ${amp.toFixed(3)};
    }`;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nuniform float uTime;\nvarying float vCrest;\n${wave}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvec2 wp = position.xz + vec2(${center[0].toFixed(1)}, ${center[1].toFixed(1)});\nfloat wh = waveAt(wp, uTime);\ntransformed.y += wh;\nvCrest = wh;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vCrest;')
      .replace('#include <color_fragment>', `#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.75, 0.82, 0.85), smoothstep(${(amp * 1.3).toFixed(2)}, ${(amp * 2.1).toFixed(2)}, vCrest));`);
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(center[0], y, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  return (px, pz, t) =>
    y + (Math.sin(px * 0.11 + t * 1.1) * 0.9 + Math.sin(pz * 0.13 - t * 0.9 + px * 0.05) * 0.8 + Math.sin((px + pz) * 0.31 + t * 1.9) * 0.35 + Math.sin((px - pz) * 0.47 - t * 2.3) * 0.2) * amp;
}

// Falling streaks around the camera.
export function rain(ctx, { count = 2500, box = 60, height = 30, speed = 26, color = '#aab8c8', opacity = 0.35, slant = [3, 1] }) {
  const rand = rng(77);
  const pos = new Float32Array(count * 6);
  const tip = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = rand.range(-box, box), y = rand() * height, z = rand.range(-box, box);
    pos.set([x, y, z, x, y, z], i * 6);
    tip[i * 2 + 1] = 1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aTip', new THREE.BufferAttribute(tip, 1));
  const uniforms = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform float uTime; uniform vec3 uCam; attribute float aTip;
      void main() {
        vec3 p = position;
        float fall = uTime * ${speed.toFixed(1)};
        p.y = mod(p.y - fall, ${height.toFixed(1)}) + uCam.y - ${(height / 2).toFixed(1)};
        p.x = uCam.x + mod(p.x - uCam.x + ${box.toFixed(1)}, ${(box * 2).toFixed(1)}) - ${box.toFixed(1)};
        p.z = uCam.z + mod(p.z - uCam.z + ${box.toFixed(1)}, ${(box * 2).toFixed(1)}) - ${box.toFixed(1)};
        p += aTip * vec3(${(slant[0] * 0.08).toFixed(3)}, 1.1, ${(slant[1] * 0.08).toFixed(3)});
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; void main() { gl_FragColor = vec4(uColor, uOpacity); }`,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  ctx.scene.add(lines);
  ctx.onFrame((t, dt, camera) => {
    uniforms.uTime.value = t;
    uniforms.uCam.value.copy(camera.position);
  });
}

// Flat ground ring beyond a small high-resolution terrain, so the horizon reads as open land.
export function skirt(ctx, { inner = 115, outer = 1200, color = '#9a8064', y = -0.05, center = [0, 0] }) {
  const geo = new THREE.RingGeometry(inner, outer, 48, 2).rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(center[0], y, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}
