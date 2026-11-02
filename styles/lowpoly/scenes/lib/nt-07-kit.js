// Shared props for the Galilean ministry scenes (nt-07 to nt-12): houses, water, boats, jars, animals, seated people, birds.
import * as THREE from 'three';
import { Batch } from '../../engine/world.js';
import { createFigure } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

export { Batch };

export const palette = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#9a4a34'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.6,
  hoodChance: 0.35,
};

export const christ = (x, z, face, extra = {}) => ({
  x, z, face, scale: 1.06, robe: '#f8f4ea', mantle: '#efe6d2', skin: '#a8754f', emissive: 0.08,
  light: { color: '#fff0cf', intensity: 6, distance: 12 },
  halo: { size: 3.2, opacity: 0.32, color: '#fff3d6' },
  ...extra,
});

const darkenBottom = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

// Box resting with its base at y, optionally solid to the walker.
export function block(ctx, { x, z, y = 0, w, h, d, rot = 0, tilt = [0, 0], color, jitter = 0.05, collide = true, batch }) {
  (batch ?? ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter, shade: darkenBottom });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

function lowest(ctx, x, z, w, d, rot) {
  const at = frame(x, z, rot);
  return Math.min(...[[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([a, b]) => ctx.heightAt(...at(a, b))));
}

// Flat-roofed village house seen from outside: walls, dark door and windows, roof with parapet, optional outside stair.
export function house(ctx, s) {
  const r = ctx.rand;
  const { x, z, rot = 0, w = r.range(6, 9), d = r.range(5, 8), h = r.range(3, 4.2), color = '#b9a184', roof = '#8d7558', stair = r() < 0.5, door = true } = s;
  const at = frame(x, z, rot);
  const y = (s.y ?? lowest(ctx, x, z, w, d, rot)) - 0.2;
  block(ctx, { x, z, y, w, h, d, rot, color });
  ctx.solid.box(w + 0.3, 0.25, d + 0.3, { position: [x, y + h + 0.1, z], rotation: [0, rot, 0], color: roof, shade: darkenBottom });
  for (const [lx, lz, ww, dd] of [[0, -d / 2, w, 0.25], [0, d / 2, w, 0.25], [-w / 2, 0, 0.25, d], [w / 2, 0, 0.25, d]]) {
    const [px, pz] = at(lx, lz);
    ctx.solid.box(ww + 0.05, 0.45, dd + 0.05, { position: [px, y + h + 0.42, pz], rotation: [0, rot, 0], color, shade: darkenBottom });
  }
  if (door) {
    const [dx, dz] = at(r.range(-w / 4, w / 4), d / 2 + 0.02);
    ctx.solid.box(1.1, 2.0, 0.1, { position: [dx, y + 1.15, dz], rotation: [0, rot, 0], color: '#3a2a1e' });
  }
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1;
    const [wx, wz] = at(side * (w / 2 + 0.02), r.range(-d / 4, d / 4));
    ctx.solid.box(0.1, 0.5, 0.6, { position: [wx, y + h * 0.7, wz], rotation: [0, rot, 0], color: '#2e2219' });
  }
  if (stair) {
    const steps = Math.ceil(h / 0.4);
    for (let i = 0; i < steps; i++) {
      const [sx, sz] = at(w / 2 + 0.55, d / 2 - 0.4 - i * ((d - 0.8) / steps));
      block(ctx, { x: sx, z: sz, y, w: 1, h: (i + 1) * (h / steps), d: (d - 0.8) / steps + 0.02, rot, color, jitter: 0.03 });
    }
  }
  return { top: y + h };
}

// Walled enclosure segment (courtyard wall).
export function wallRun(ctx, { from, to, h = 2.2, thick = 0.5, color = '#b49c7e', y }) {
  const [ax, az] = from, [bx, bz] = to;
  const len = Math.hypot(bx - ax, bz - az);
  const rot = Math.atan2(bx - ax, bz - az);
  const x = (ax + bx) / 2, z = (az + bz) / 2;
  const base = (y ?? Math.min(ctx.heightAt(ax, az), ctx.heightAt(bx, bz), ctx.heightAt(x, z))) - 0.2;
  block(ctx, { x, z, y: base, w: thick, h: h + 0.2, d: len, rot, color });
  ctx.solid.box(thick + 0.15, 0.15, len + 0.1, { position: [x, base + h + 0.27, z], rotation: [0, rot, 0], color: '#9c8566' });
}

// Faceted animated water surface with an optional wading floor so the walker cannot sink.
export function water(ctx, { x = 0, z = 0, size = 900, y = 0, color = '#3d7a88', opacity = 0.88, amp = 0.12, segments = 140, wade = -0.55, floor }) {
  const { THREE: T } = ctx;
  const geo = new T.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const time = { value: 0 };
  const mat = new T.MeshPhongMaterial({ color, flatShading: true, transparent: opacity < 1, opacity, shininess: 60, specular: new T.Color('#ffffff').multiplyScalar(0.35) });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nuniform float uTime;`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float wx = position.x + ${x.toFixed(2)}, wz = position.z + ${z.toFixed(2)};
        transformed.y += (sin(wx * 0.35 + uTime * 1.1) + sin(wz * 0.42 - uTime * 0.9) + 0.6 * sin((wx + wz) * 0.9 + uTime * 1.7)) * ${amp.toFixed(3)};`,
      );
  };
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => (time.value = t));
  if (floor) for (const f of floor) ctx.colliders.add({ ...f, bottom: y - 30, top: y + wade });
  return mesh;
}

// Wooden fishing boat as its own mesh so it can bob. Bow faces local +z.
export function boat(ctx, { x, z, rot = 0, len = 8, beam = 2.4, y = 0, hull = '#6b4a30', deck = '#8a6644', rail = '#4e3522', sail = '#d9ccb0', mast = true, bob = 1, walk = true, sink = 0 }) {
  const b = new Batch(ctx.rand);
  const taper = (lz) => Math.max(0.08, 1 - Math.pow(Math.abs(lz) / (len / 2), 2.2));
  const hullGeo = new THREE.BoxGeometry(beam, 0.9, len, 2, 2, 10);
  const p = hullGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const lz = p.getZ(i), ly = p.getY(i);
    const k = taper(lz) * (ly < 0 ? 0.55 : 1);
    p.setX(i, p.getX(i) * k);
    p.setY(i, ly + Math.pow(Math.abs(lz) / (len / 2), 3) * 0.5 * (ly > 0 ? 1 : 0.4));
  }
  hullGeo.computeVertexNormals();
  b.add(hullGeo, { position: [0, 0.15, 0], color: hull, jitter: 0.06, shade: (c, ny) => (ny > 0.8 ? c.set(deck).multiplyScalar(0.9) : ny < -0.5 ? c.multiplyScalar(0.6) : null) });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const z0 = -len / 2 + (i / 8) * len, z1 = -len / 2 + ((i + 1) / 8) * len;
      const x0 = side * (beam / 2) * taper(z0), x1 = side * (beam / 2) * taper(z1);
      const sl = Math.hypot(x1 - x0, z1 - z0);
      const lift = (zz) => Math.pow(Math.abs(zz) / (len / 2), 3) * 0.5;
      b.box(0.12, 0.32, sl + 0.05, { position: [(x0 + x1) / 2, 0.75 + (lift(z0) + lift(z1)) / 2, (z0 + z1) / 2], rotation: [0, Math.atan2(x1 - x0, z1 - z0), 0], color: rail });
    }
  }
  for (const lz of [-len * 0.22, len * 0.12]) b.box(beam * taper(lz) - 0.15, 0.1, 0.35, { position: [0, 0.78, lz], color: rail });
  if (mast) {
    b.add(new THREE.CylinderGeometry(0.07, 0.1, 6.5, 5), { position: [0, 3.8, len * 0.12], color: '#5a3f2a' });
    b.add(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 5), { position: [0, 6.6, len * 0.12], rotation: [0, 0, Math.PI / 2 - 0.25], color: '#5a3f2a' });
    b.add(new THREE.CylinderGeometry(0.22, 0.22, 4.0, 6), { position: [0, 6.45, len * 0.12 - 0.05], rotation: [0, 0, Math.PI / 2 - 0.25], color: sail });
  }
  for (const side of [-1, 1]) b.add(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 4), { position: [side * beam * 0.55, 0.8, -len * 0.05], rotation: [0.2, 0, side * 1.35], color: '#7a5a3c' });
  const mesh = b.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.castShadow = mesh.receiveShadow = true;
  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(x, y - sink, z);
  group.rotation.y = rot;
  ctx.scene.add(group);
  if (walk) {
    const at = frame(x, z, rot);
    for (const lz of [-len * 0.3, 0, len * 0.3]) {
      const [cx, cz] = at(0, lz);
      ctx.colliders.add({ x: cx, z: cz, w: beam * taper(lz) * 0.85, d: len * 0.3, rot, bottom: y - 3, top: y - sink + 0.62 });
    }
  }
  const phase = ctx.rand() * 6;
  if (bob) ctx.onFrame((t) => {
    group.position.y = y - sink + Math.sin(t * 0.9 + phase) * 0.06 * bob;
    group.rotation.z = Math.sin(t * 0.7 + phase) * 0.025 * bob;
    group.rotation.x = Math.sin(t * 0.55 + phase * 2) * 0.015 * bob;
  });
  return group;
}

// A standing person built from the engine figure parts.
export function person(ctx, { x, z, y, face, robe = '#8b6b4a', mantle, skin = '#9b6a46', arms = 'down', scale = 1, hood = false, group }) {
  const fig = createFigure({ x, y: y ?? ctx.heightAt(x, z), z, face, robe, mantle, skin, arms, scale, hood });
  (group ?? ctx.scene).add(fig);
  return fig;
}

// A seated person merged into a batch. Sits on a seat of height `seat` above y, facing `face`.
export function seated(ctx, { x, z, y, face = [0, 0], seat = 0.45, robe = '#8b6b4a', mantle, skin = '#9b6a46', scale = 1, batch }) {
  const B = batch ?? ctx.solid;
  const base = y ?? ctx.heightAt(x, z);
  const rot = Math.atan2(face[0] - x, face[1] - z);
  const at = frame(x, z, rot);
  const S = scale;
  const put = (geo, lx, ly, lz, color, rotation = [0, 0, 0]) => {
    const [px, pz] = at(lx * S, lz * S);
    B.add(geo, { position: [px, base + ly * S, pz], rotation: [rotation[0], rot + rotation[1], rotation[2]], scale: [S, S, S], color, jitter: 0.04 });
  };
  const sh = seat;
  put(new THREE.BoxGeometry(0.4, 0.2, 0.5), 0, sh + 0.08, 0.12, robe);
  put(new THREE.BoxGeometry(0.36, sh + 0.05, 0.18), 0, (sh + 0.05) / 2, 0.38, robe);
  put(new THREE.CylinderGeometry(0.16, 0.24, 0.62, 7), 0, sh + 0.45, -0.04, robe);
  if (mantle) put(new THREE.CylinderGeometry(0.19, 0.27, 0.4, 7), 0, sh + 0.58, -0.05, mantle);
  put(new THREE.IcosahedronGeometry(0.13, 0), 0, sh + 0.9, -0.03, skin);
  for (const side of [-1, 1]) put(new THREE.CylinderGeometry(0.05, 0.06, 0.5, 5), side * 0.2, sh + 0.5, 0.06, mantle ?? robe, [0.7, 0, side * 0.15]);
}

// Large stone water jar. `fill` colors a liquid surface at the mouth.
export function jar(ctx, { x, z, y, h = 1.1, color = '#c9bba2', fill, batch }) {
  const B = batch ?? ctx.solid;
  const base = y ?? ctx.heightAt(x, z);
  const prof = [[0.01, 0], [0.26, 0.02], [0.36, 0.25], [0.4, 0.55], [0.36, 0.82], [0.27, 0.95], [0.29, 1.0], [0.25, 1.0]].map(([r, yy]) => new THREE.Vector2(r * h, yy * h));
  B.add(new THREE.LatheGeometry(prof, 8), { position: [x, base, z], rotation: [0, ctx.rand() * 3, 0], color, jitter: 0.05, shade: darkenBottom });
  if (fill) {
    const disc = new THREE.CircleGeometry(0.25 * h, 8);
    disc.rotateX(-Math.PI / 2);
    ctx.glow.add(disc, { position: [x, base + h * 0.96, z], color: fill, jitter: 0.03 });
  }
  ctx.colliders.add({ x, z, w: 0.7 * h, d: 0.7 * h, bottom: base, top: base + h });
}

// Simple four-legged animal facing local +z. kind: sheep, ox, donkey, goat.
export function animal(ctx, { x, z, rot = 0, kind = 'sheep', y, color, batch, lift = 0, run = 0 }) {
  const B = batch ?? ctx.solid;
  const spec = {
    sheep: { body: [0.55, 0.45, 0.85], leg: 0.3, head: 0.2, color: '#e6dcc6', face: '#4a3e36', neck: 0.08 },
    goat: { body: [0.4, 0.38, 0.75], leg: 0.42, head: 0.2, color: '#4a3b30', face: '#3a2e26', neck: 0.18 },
    ox: { body: [0.95, 0.85, 1.8], leg: 0.6, head: 0.36, color: '#8a6440', face: '#5a3e28', neck: 0.15 },
    donkey: { body: [0.55, 0.55, 1.15], leg: 0.6, head: 0.28, color: '#8c8278', face: '#6a6058', neck: 0.35 },
  }[kind];
  const col = color ?? spec.color;
  const base = (y ?? ctx.heightAt(x, z)) + lift;
  const at = frame(x, z, rot);
  const [bw, bh, bd] = spec.body;
  const put = (geo, lx, ly, lz, c, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    const [px, pz] = at(lx, lz);
    B.add(geo, { position: [px, base + ly, pz], rotation: [rotation[0], rot + rotation[1], rotation[2]], scale, color: c, jitter: 0.06, shade: darkenBottom });
  };
  const bodyGeo = kind === 'sheep' ? new THREE.IcosahedronGeometry(0.5, 0) : new THREE.BoxGeometry(1, 1, 1);
  put(bodyGeo, 0, spec.leg + bh / 2, 0, col, [run * 0.15, 0, 0], kind === 'sheep' ? [bw * 1.1, bh * 1.1, bd * 1.05] : [bw, bh, bd]);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const swing = run * (sx * sz > 0 ? 0.5 : -0.5);
    put(new THREE.BoxGeometry(0.11, spec.leg, 0.11), sx * bw * 0.32, spec.leg / 2, sz * bd * 0.36, spec.face, [swing, 0, 0]);
  }
  put(new THREE.BoxGeometry(spec.head * 0.9, spec.head, spec.head * 1.5), 0, spec.leg + bh * 0.6 + spec.neck, bd / 2 + spec.head * 0.45, kind === 'sheep' ? spec.face : col, [0.35, 0, 0]);
  if (kind === 'ox' || kind === 'goat') for (const sx of [-1, 1]) put(new THREE.ConeGeometry(0.05, 0.3, 4), sx * spec.head * 0.45, spec.leg + bh + spec.neck + 0.1, bd / 2 + spec.head * 0.4, '#e8dcc0', [0, 0, sx * -0.8]);
  if (kind === 'donkey') for (const sx of [-1, 1]) put(new THREE.ConeGeometry(0.05, 0.3, 4), sx * 0.08, spec.leg + bh + spec.neck + 0.2, bd / 2 + 0.1, spec.face);
}

// Flock of birds circling or flying past, flapping. One instanced mesh.
export function birds(ctx, { center = [0, 0], height = 18, radius = 20, count = 12, color = '#f2efe6', speed = 0.35, size = 0.35, spread = 4, seed = 3, flee }) {
  const rand = rng(seed);
  const wing = new THREE.BufferGeometry();
  wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.25, -1, 0, -0.1, 0, 0, -0.25, 0, 0, 0.25, 0, 0, -0.25, 1, 0, -0.1], 3));
  wing.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(wing, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.25 }), count);
  const seeds = Array.from({ length: count }, () => [rand() * Math.PI * 2, radius * rand.range(0.6, 1.2), rand.range(-spread, spread), rand.range(0.7, 1.3), rand() * 6]);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    seeds.forEach(([a0, r, dy, k, ph], i) => {
      const a = a0 + t * speed * k;
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(t * 9 * k + ph));
      if (flee) {
        const f = ((t * 0.08 * k + ph / 6) % 1);
        p.set(center[0] + Math.cos(a0) * (2 + f * radius * 2), flee + Math.abs(dy) * 0.3 + f * height, center[1] + Math.sin(a0) * (2 + f * radius * 2));
        e.set(0, -a0 + Math.PI / 2, 0);
      } else {
        p.set(center[0] + Math.cos(a) * r, height + dy + Math.sin(t * 0.5 + ph) * 0.8, center[1] + Math.sin(a) * r);
        e.set(0, -a, 0);
      }
      q.setFromEuler(e);
      s.set(size * flap * 1.4, size, size);
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  return mesh;
}

// Warm hanging lamp: a glowing bead, a halo and a weak point light.
export function lamp(ctx, { x, y, z, light = true, color = '#ffb24a', intensity = 4, distance = 9 }) {
  ctx.glow.add(new THREE.OctahedronGeometry(0.1, 0), { position: [x, y, z], color, jitter: 0.02 });
  ctx.effects.halo({ position: [x, y, z], size: 1.1, color: '#ffcf80', opacity: 0.6 });
  if (light) {
    const pl = new THREE.PointLight(color, intensity, distance, 1.6);
    pl.position.set(x, y, z);
    ctx.scene.add(pl);
  }
}

// Low wooden table on a trestle.
export function table(ctx, { x, z, rot = 0, w = 2.4, d = 0.9, h = 0.75, color = '#7a5638', y, tilt }) {
  const base = y ?? ctx.heightAt(x, z);
  if (tilt) {
    ctx.solid.box(w, 0.08, d, { position: [x, base + 0.4, z], rotation: [tilt, rot, 0.2], color });
    return;
  }
  const at = frame(x, z, rot);
  ctx.solid.box(w, 0.08, d, { position: [x, base + h, z], rotation: [0, rot, 0], color, shade: darkenBottom });
  for (const sx of [-1, 1]) {
    const [px, pz] = at(sx * (w / 2 - 0.2), 0);
    ctx.solid.box(0.1, h, d * 0.8, { position: [px, base + h / 2, pz], rotation: [0, rot, 0], color: '#5a3e28' });
  }
  ctx.colliders.add({ x, z, w, d, rot, bottom: base, top: base + h + 0.04 });
}

// Wildflowers scattered in a disc: tiny colored blossoms merged into the solid batch.
export function flowers(ctx, { center = [0, 0], radius = 30, count = 300, colors = ['#e8e2d0', '#d84a6a', '#f2c94c', '#b07ad8'], seed = 4, avoid = () => false }) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid(x, z)) continue;
    const y = ctx.heightAt(x, z);
    ctx.solid.add(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 3), { position: [x, y + 0.15, z], color: '#4f6b30' });
    ctx.solid.add(new THREE.OctahedronGeometry(0.07, 0), { position: [x, y + 0.32, z], color: r.pick(colors), jitter: 0.06 });
  }
}

// Clumps of tall grass blades for meadows.
export function grass(ctx, { center = [0, 0], radius = 40, count = 400, color = '#6f8a3e', seed = 6, avoid = () => false }) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid(x, z)) continue;
    const h = r.range(0.14, 0.32);
    ctx.solid.add(new THREE.ConeGeometry(0.09, h, 3), { position: [x, ctx.heightAt(x, z) + h / 2 - 0.03, z], rotation: [r.range(-0.2, 0.2), r() * 3, r.range(-0.2, 0.2)], color, jitter: 0.1 });
  }
}
