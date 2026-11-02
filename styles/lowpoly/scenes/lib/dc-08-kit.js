import * as THREE from 'three';
import { placeCrowd, createCrowd, createFigure } from '../../engine/crowd.js';
import { rng } from '../../engine/util.js';

export { createFigure };

export const palettes = {
  men: {
    robes: ['#2a2826', '#3b3631', '#4a3f33', '#2f3440', '#5a4a3a', '#3d3a36', '#6b5843', '#44403a'],
    mantles: ['#1f1d1b', '#3a3028', '#4b4038', '#2b2f38'],
    skins: ['#e0b896', '#d4a684', '#c99a78', '#e8c4a4', '#bf8f6c'],
    mantleChance: 0.35,
    hoodChance: 0,
  },
  women: {
    robes: ['#4e5a6b', '#6b4e5a', '#5a5a4a', '#7a6a55', '#3e4a5a', '#6e3f3a', '#8a7a66', '#4a3b4e', '#5d4a3a'],
    mantles: ['#7a5a48', '#3a3a3a', '#8a6a5a', '#5b4c3d', '#c9bba0', '#6a6a7a'],
    skins: ['#e0b896', '#d4a684', '#e8c4a4', '#cfa07e'],
    mantleChance: 0.65,
    hoodChance: 1,
  },
};

export const frame = (x, z, rot = 0) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
};

export function box(ctx, { x, y = 0, z, w, h, d, rot = 0, tilt = [0, 0], color, collide = true, glow = false, jitter = 0.04 }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Triangular prism with its base on y=0, ridge along z.
export function prism(w, h, d) {
  const a = [-w / 2, 0], b = [w / 2, 0], c = [0, h];
  const z0 = -d / 2, z1 = d / 2;
  const v = (p, z) => [p[0], p[1], z];
  const tris = [
    [v(a, z1), v(b, z1), v(c, z1)],
    [v(b, z0), v(a, z0), v(c, z0)],
    [v(a, z0), v(a, z1), v(c, z1)], [v(a, z0), v(c, z1), v(c, z0)],
    [v(b, z1), v(b, z0), v(c, z0)], [v(b, z1), v(c, z0), v(c, z1)],
    [v(a, z0), v(b, z0), v(b, z1)], [v(a, z0), v(b, z1), v(a, z1)],
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(2), 3));
  return geo;
}

// A gabled roof: slab prism plus eaves, ridge along local z.
export function gable(ctx, { x, y, z, w, h, d, rot = 0, color }) {
  ctx.solid.add(prism(w, h, d), { position: [x, y, z], rotation: [0, rot, 0], color, jitter: 0.03 });
}

// Walls of a rectangular room with window and door openings. Openings: { side: 'n'|'s'|'e'|'w', at, width, bottom, top, glow }.
export function room(ctx, { x = 0, z = 0, y = 0, w, d, h, rot = 0, thick = 0.35, wall, openings = [], collide = true }) {
  const at = frame(x, z, rot);
  const sides = {
    n: { len: w, place: (u) => [u, -d / 2 - thick / 2], along: 0 },
    s: { len: w, place: (u) => [u, d / 2 + thick / 2], along: 0 },
    w: { len: d + thick * 2, place: (u) => [-w / 2 - thick / 2, u], along: Math.PI / 2 },
    e: { len: d + thick * 2, place: (u) => [w / 2 + thick / 2, u], along: Math.PI / 2 },
  };
  for (const [name, side] of Object.entries(sides)) {
    const ops = openings.filter((o) => o.side === name).sort((p, q) => p.at - q.at);
    const piece = (u0, u1, b, t) => {
      if (u1 - u0 < 0.01 || t - b < 0.01) return;
      const [px, pz] = at(...side.place((u0 + u1) / 2));
      box(ctx, { x: px, y: y + b, z: pz, w: u1 - u0, h: t - b, d: thick, rot: rot + side.along, color: wall, collide });
    };
    let u = -side.len / 2;
    for (const o of ops) {
      const u0 = o.at - o.width / 2, u1 = o.at + o.width / 2;
      piece(u, u0, 0, h);
      piece(u0, u1, 0, o.bottom ?? 0);
      piece(u0, u1, o.top, h);
      if (o.glow) {
        const [px, pz] = at(...side.place(o.at));
        box(ctx, { x: px, y: y + (o.bottom ?? 0), z: pz, w: o.width, h: o.top - (o.bottom ?? 0), d: thick * 0.3, rot: rot + side.along, color: o.glow, glow: true, collide: true, jitter: 0.02 });
        if (o.bars) {
          for (let k = 1; k < o.bars + 1; k++) {
            const [bx, bz] = at(...side.place(u0 + (k / (o.bars + 1)) * o.width));
            box(ctx, { x: bx, y: y + (o.bottom ?? 0), z: bz, w: 0.05, h: o.top - (o.bottom ?? 0), d: thick * 0.6, rot: rot + side.along, color: o.barColor ?? '#2a2a2a', collide: false });
          }
        }
      }
      u = u1;
    }
    piece(u, side.len / 2, 0, h);
  }
}

// Instanced period people. Groups take the engine's crowd options plus: palette, sink, hats.
export function people(ctx, groups) {
  const standAt = (x, z) => ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });
  const all = [];
  const hatted = [];
  for (const g of groups) {
    const placed = placeCrowd([{ ...g, palette: g.palette ?? palettes.men }], ctx.heightAt, standAt);
    for (const p of placed) {
      if (!g.points && all.some((q) => (q.x - p.x) ** 2 + (q.z - p.z) ** 2 < 0.36)) continue;
      p.y -= g.sink ?? 0;
      all.push(p);
      if ((g.hats ?? true) && !p.hood) hatted.push(p);
    }
  }
  if (!all.length) return all;
  ctx.scene.add(createCrowd(all, { value: 0 }));
  if (hatted.length) {
    const brim = new THREE.CylinderGeometry(0.2, 0.21, 0.025, 8).translate(0, 1.645, 0);
    const crown = new THREE.CylinderGeometry(0.11, 0.125, 0.15, 7).translate(0, 1.73, 0);
    const geo = mergeTwo(brim, crown);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ flatShading: true }), hatted.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const r = rng(77);
    const hatColors = ['#1c1a18', '#26221e', '#3a3026', '#4a3c2c', '#8a7550', '#1c1a18'].map((c) => new THREE.Color(c));
    hatted.forEach((p, i) => {
      m.compose(v.set(p.x, p.y, p.z), q.setFromAxisAngle(up, p.yaw), s.setScalar(p.scale));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, r.pick(hatColors));
    });
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  return all;
}

function mergeTwo(a, b) {
  const pa = a.toNonIndexed().attributes.position.array, pb = b.toNonIndexed().attributes.position.array;
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(pa.length + pb.length);
  arr.set(pa);
  arr.set(pb, pa.length);
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  geo.computeVertexNormals();
  return geo;
}

// A single person with hat, for hand-placed figures.
export function person(ctx, { x, z, y, face, robe = '#2f2b27', mantle, skin = '#d9ad8a', hat = '#1f1c19', bonnet = false, arms = 'down', scale = 1, sink = 0 }) {
  const base = (y ?? ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 })) - sink;
  const fig = createFigure({ x, y: base, z, face, robe, mantle, skin, arms, scale, hood: bonnet });
  if (hat && !bonnet) {
    const mat = new THREE.MeshLambertMaterial({ color: hat, flatShading: true });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.025, 8).translate(0, 1.645, 0), mat);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.125, 0.15, 7).translate(0, 1.73, 0), mat);
    fig.add(brim, crown);
  }
  fig.traverse((o) => (o.castShadow = true));
  ctx.scene.add(fig);
  return fig;
}

export function glowFigure(ctx, { x, z, y, face, scale = 1.1, robe = '#fbf7ee', skin = '#e8d2b0', arms = 'down', emissive = 0.45, light, halo }) {
  const base = y ?? ctx.colliders.ground(x, z, 1000, ctx.heightAt(x, z), { radius: 0 });
  const fig = createFigure({ x, y: base, z, face, robe, mantle: robe, skin, arms, scale, emissive });
  ctx.scene.add(fig);
  if (light) {
    const l = new THREE.PointLight(light.color ?? '#fff0cf', light.intensity ?? 30, light.distance ?? 20, 1.4);
    l.position.set(x, base + 2, z + (light.dz ?? 0.6));
    ctx.scene.add(l);
  }
  if (halo) ctx.effects.halo({ position: [x, base + 1.3 * scale, z], ...halo });
  return fig;
}

export function wheel(ctx, x, y, z, rot, r = 0.55, color = '#4a3624') {
  const geo = new THREE.CylinderGeometry(r, r, 0.08, 10);
  geo.rotateZ(Math.PI / 2);
  ctx.solid.add(geo, { position: [x, y, z], rotation: [0, rot, 0], color, jitter: 0.04 });
  const hub = new THREE.CylinderGeometry(0.1, 0.1, 0.16, 6).rotateZ(Math.PI / 2);
  ctx.solid.add(hub, { position: [x, y, z], rotation: [0, rot, 0], color: '#2a2018' });
}

// Covered wagon, tongue toward local -z.
export function wagon(ctx, { x, z, rot = 0, cover = '#e6dcc4', bed = '#6a4a30', y, covered = true }) {
  const at = frame(x, z, rot);
  const g = y ?? ctx.heightAt(x, z);
  const bedY = g + 0.75;
  box(ctx, { x, y: bedY, z, w: 1.25, h: 0.5, d: 3.2, rot, color: bed });
  for (const [lx, lz, r] of [[-0.7, -1.1, 0.5], [0.7, -1.1, 0.5], [-0.7, 1.1, 0.68], [0.7, 1.1, 0.68]]) {
    const [wx, wz] = at(lx, lz);
    wheel(ctx, wx, g + r, wz, rot, r);
  }
  const [tx, tz] = at(0, -2.4);
  ctx.solid.box(0.1, 0.1, 1.8, { position: [tx, g + 0.6, tz], rotation: [-0.25, rot, 0], color: '#5a4028' });
  if (covered) {
    const geo = new THREE.CylinderGeometry(0.78, 0.78, 3.0, 8, 1, true, -Math.PI / 2, Math.PI);
    geo.rotateX(-Math.PI / 2);
    ctx.solid.add(geo, { position: [x, bedY + 0.5, z], rotation: [0, rot, 0], scale: [0.85, 1.25, 1], color: cover, jitter: 0.03 });
    const cap = new THREE.CircleGeometry(0.78, 8, 0, Math.PI);
    for (const s of [-1, 1]) {
      const [cx, cz] = at(0, s * 1.5);
      ctx.solid.add(cap, { position: [cx, bedY + 0.5, cz], rotation: [0, rot + (s > 0 ? 0 : Math.PI), 0], scale: [0.85, 1.25, 1], color: '#c9bea6', jitter: 0.02 });
    }
  }
}

// Ox or horse, facing local -z.
export function beast(ctx, { x, z, rot = 0, color = '#6b4a32', kind = 'ox', y }) {
  const at = frame(x, z, rot);
  const g = y ?? ctx.heightAt(x, z);
  const horse = kind === 'horse';
  const bh = horse ? 0.75 : 0.7, len = horse ? 1.5 : 1.7, legH = horse ? 0.85 : 0.65;
  ctx.solid.box(horse ? 0.5 : 0.7, bh, len, { position: [x, g + legH + bh / 2, z], rotation: [0, rot, 0], color, jitter: 0.06 });
  const [hx, hz] = at(0, -len / 2 - (horse ? 0.25 : 0.2));
  if (horse) {
    ctx.solid.box(0.25, 0.75, 0.3, { position: [hx, g + legH + bh + 0.15, hz], rotation: [0.5, rot, 0], color, jitter: 0.06 });
    const [h2x, h2z] = at(0, -len / 2 - 0.55);
    ctx.solid.box(0.22, 0.25, 0.55, { position: [h2x, g + legH + bh + 0.45, h2z], rotation: [0.3, rot, 0], color, jitter: 0.06 });
  } else {
    ctx.solid.box(0.42, 0.42, 0.5, { position: [hx, g + legH + bh * 0.65, hz], rotation: [0.3, rot, 0], color, jitter: 0.06 });
    ctx.solid.box(0.8, 0.07, 0.07, { position: [hx, g + legH + bh * 0.95, hz], rotation: [0, rot, 0], color: '#d8ccb0' });
  }
  for (const [lx, lz] of [[-0.2, -len / 2 + 0.2], [0.2, -len / 2 + 0.2], [-0.2, len / 2 - 0.2], [0.2, len / 2 - 0.2]]) {
    const [lxw, lzw] = at(lx, lz);
    ctx.solid.box(0.14, legH, 0.14, { position: [lxw, g + legH / 2, lzw], rotation: [0, rot, 0], color, jitter: 0.06 });
  }
  ctx.colliders.add({ x, z, w: 0.8, d: len + 0.6, rot, bottom: g, top: g + legH + bh });
}

// Log cabin with gabled roof and stone chimney. Door faces local +z.
export function cabin(ctx, { x, z, rot = 0, w = 5, d = 4, h = 2.4, log = '#6a5038', roof = '#5a4a3c', snow = false, smoke = true }) {
  const at = frame(x, z, rot);
  const g = Math.min(ctx.heightAt(...at(-w / 2, -d / 2)), ctx.heightAt(...at(w / 2, d / 2)), ctx.heightAt(x, z)) - 0.1;
  const rows = 8;
  for (let i = 0; i < rows; i++) {
    const c = new THREE.Color(log).multiplyScalar(i % 2 ? 0.88 : 1.04);
    ctx.solid.box(w, h / rows, d, { position: [x, g + (i + 0.5) * (h / rows), z], rotation: [0, rot, 0], color: c, jitter: 0.04 });
  }
  ctx.colliders.add({ x, z, w, d, rot, bottom: g, top: g + h });
  const [fx, fz] = at(0, d / 2 + 0.02);
  ctx.solid.box(0.9, 1.8, 0.06, { position: [fx, g + 0.9, fz], rotation: [0, rot, 0], color: '#3a2a1c' });
  const [wx, wz] = at(w * 0.3, d / 2 + 0.02);
  ctx.glow.box(0.6, 0.5, 0.05, { position: [wx, g + 1.3, wz], rotation: [0, rot, 0], color: '#ffc070' });
  const ridge = h * 0.55;
  gable(ctx, { x, y: g + h, z, w: d + 0.6, h: ridge, d: w + 0.5, rot: rot + Math.PI / 2, color: roof });
  if (snow) {
    for (const s of [-1, 1]) {
      const [sx, sz] = at(0, s * (d + 0.6) / 4);
      ctx.solid.box(w + 0.5, 0.08, Math.hypot((d + 0.6) / 2, ridge) * 0.95, {
        position: [sx, g + h + ridge / 2 + 0.06, sz],
        rotation: [s * Math.atan2(ridge, (d + 0.6) / 2), rot, 0],
        color: '#eef2f6',
        jitter: 0.02,
      });
    }
  }
  const [cx, cz] = at(w / 2 + 0.25, 0);
  box(ctx, { x: cx, y: g, z: cz, w: 0.7, h: h + ridge + 0.6, d: 0.9, rot, color: '#7d7468' });
  if (smoke) ctx.effects.smoke({ position: [cx, g + h + ridge + 0.8, cz], count: 5, height: 9, size: 0.28, color: '#a8a8ae', wind: [1.2, 0.4], seed: Math.floor(ctx.rand() * 1e6) });
}

// Faceted animated water surface.
export function water(ctx, { x = 0, z = 0, w, d, y = 0, color = '#3f6a80', seg = 60, amp = 0.12, opacity = 0.92 }) {
  const geo = new THREE.PlaneGeometry(w, d, seg, seg).rotateX(-Math.PI / 2).toNonIndexed();
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color(color);
  const r = rng(5);
  for (let i = 0; i < pos.count; i += 3) {
    const k = 0.92 + r() * 0.16;
    for (let j = 0; j < 3; j++) col.set([c.r * k, c.g * k, c.b * k], (i + j) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, transparent: opacity < 1, opacity }));
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  let acc = 0;
  ctx.onFrame((t, dt) => {
    acc += dt;
    if (acc < 1 / 20) return;
    acc = 0;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3], bz = base[i * 3 + 2];
      pos.array[i * 3 + 1] = Math.sin(bx * 0.35 + t * 0.8) * amp + Math.cos(bz * 0.42 - t * 0.6) * amp;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return mesh;
}

// Snowflakes falling around the camera.
export function snowfall(ctx, { count = 1200, radius = 40, height = 25, color = '#ffffff', size = 0.12 }) {
  const r = rng(9);
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(count * 3);
  const seeds = Array.from({ length: count }, () => [r() * 2 - 1, r() * 2 - 1, r(), r.range(0.6, 1.4)]);
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.85, depthWrite: false }));
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, camera) => {
    const cx = camera.position.x, cz = camera.position.z, cy = camera.position.y;
    seeds.forEach(([sx, sz, off, sp], i) => {
      const f = (off - t * 0.06 * sp + 100) % 1;
      arr[i * 3] = cx + sx * radius + Math.sin(t * 0.5 + i) * 0.4;
      arr[i * 3 + 1] = cy - 5 + f * height;
      arr[i * 3 + 2] = cz + sz * radius;
    });
    geo.attributes.position.needsUpdate = true;
  });
}

export function pointLight(ctx, [x, y, z], color, intensity, distance = 20, decay = 1.5) {
  const l = new THREE.PointLight(color, intensity, distance, decay);
  l.position.set(x, y, z);
  ctx.scene.add(l);
  return l;
}
