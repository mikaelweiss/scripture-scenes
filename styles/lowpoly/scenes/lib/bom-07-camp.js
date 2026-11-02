import * as THREE from 'three';

const darken = (c, ny) => {
  if (ny < -0.5) c.multiplyScalar(0.55);
};

export function frame(x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

// Ridge tent of woven goat hair: a triangular prism with a dark doorway facing local +z.
export function tent(ctx, { x, z, rot = 0, w = 4, d = 5, h = 2.6, color = '#5b4a3c', door = '#241a14' }) {
  const y = ctx.heightAt(x, z) - 0.1;
  const L = [-w / 2, 0], R = [w / 2, 0], T = [0, h], f = d / 2, b = -d / 2;
  const v = (p, zz) => [p[0], p[1], zz];
  const prism = new THREE.BufferGeometry();
  prism.setAttribute('position', new THREE.Float32BufferAttribute([
    ...v(L, f), ...v(T, f), ...v(L, b), ...v(L, b), ...v(T, f), ...v(T, b),
    ...v(R, f), ...v(R, b), ...v(T, f), ...v(T, f), ...v(R, b), ...v(T, b),
    ...v(L, f), ...v(R, f), ...v(T, f),
    ...v(L, b), ...v(T, b), ...v(R, b),
  ], 3));
  ctx.solid.add(prism, { position: [x, y, z], rotation: [0, rot, 0], color, jitter: 0.06 });
  const at = frame(x, z, rot);
  const [dx, dz] = at(0, d / 2 + 0.02);
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-w * 0.18, 0, 0, w * 0.18, 0, 0, 0, h * 0.7, 0], 3));
  ctx.solid.add(tri, { position: [dx, y, dz], rotation: [0, rot, 0], color: door, jitter: 0 });
  for (const side of [-1, 1]) {
    const [px, pz] = at(0, side * (d / 2 + 0.3));
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, h + 0.5, 4), { position: [px, y + (h + 0.5) / 2, pz], color: '#4a3424' });
    const [sx, sz] = at(side * (w / 2 + 0.8), 0);
    ctx.solid.box(0.12, 0.25, 0.12, { position: [sx, y + 0.12, sz], color: '#4a3424' });
  }
  ctx.colliders.add({ x, z, w: w * 0.9, d, rot, bottom: y, top: y + h });
}

// Low-poly quadruped. kind: cow, ox, horse, ass, goat, sheep.
const ANIMALS = {
  cow: { body: [0.9, 0.8, 1.7], leg: 0.7, neck: 0.45, head: [0.38, 0.4, 0.55], colors: ['#7a4e30', '#e8e0d0', '#3a2a20', '#a06a40'], horns: 0.25 },
  ox: { body: [1.0, 0.95, 1.9], leg: 0.75, neck: 0.5, head: [0.42, 0.45, 0.6], colors: ['#5a3a26', '#8a6040', '#3a2a20'], horns: 0.4 },
  horse: { body: [0.7, 0.75, 1.75], leg: 0.95, neck: 0.9, head: [0.28, 0.32, 0.65], colors: ['#6e4228', '#3a2a20', '#b08a60', '#d8d0c0'], mane: true },
  ass: { body: [0.55, 0.6, 1.2], leg: 0.65, neck: 0.55, head: [0.24, 0.28, 0.5], colors: ['#8a8078', '#6e655e', '#a0968a'], ears: 0.3 },
  goat: { body: [0.42, 0.45, 0.85], leg: 0.48, neck: 0.35, head: [0.18, 0.22, 0.34], colors: ['#d8d0c0', '#3a3028', '#8a6a4a', '#b8a888'], horns: 0.28 },
  sheep: { body: [0.55, 0.55, 0.85], leg: 0.4, neck: 0.25, head: [0.2, 0.24, 0.3], colors: ['#e6dfd0', '#d8cfbe', '#f0e9dc'] },
};

export function animal(ctx, { x, z, rot = 0, kind = 'cow', scale = 1, color, grazing = ctx.rand() < 0.4 }) {
  const a = ANIMALS[kind];
  const r = ctx.rand;
  const col = color ?? r.pick(a.colors);
  const at = frame(x, z, rot);
  const y = ctx.heightAt(x, z) - 0.05;
  const [bw, bh, bl] = a.body.map((v) => v * scale);
  const leg = a.leg * scale;
  const put = (geo, lx, ly, lz, opts = {}) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(geo, { position: [px, y + ly, pz], rotation: [opts.tilt ?? 0, rot, 0], color: opts.color ?? col, jitter: 0.06, shade: darken });
  };
  put(new THREE.BoxGeometry(bw, bh, bl), 0, leg + bh / 2, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(new THREE.BoxGeometry(bw * 0.22, leg, bw * 0.22), sx * bw * 0.32, leg / 2, sz * bl * 0.38);
  const headDrop = grazing ? -leg * 0.7 : a.neck * scale * 0.8;
  const nz = bl / 2 + a.neck * scale * 0.3;
  put(new THREE.BoxGeometry(bw * 0.45, a.neck * scale, bw * 0.4), 0, leg + bh * 0.7 + headDrop * 0.45, nz, { tilt: grazing ? 1.1 : -0.5 });
  const [hw, hh, hl] = a.head.map((v) => v * scale);
  const hz = nz + hl * 0.55 + (grazing ? 0.1 : 0.15) * scale;
  put(new THREE.BoxGeometry(hw, hh, hl), 0, leg + bh * 0.75 + headDrop, hz, { tilt: grazing ? 0.9 : 0.25 });
  if (a.horns) for (const s of [-1, 1]) put(new THREE.ConeGeometry(0.05 * scale, a.horns * scale, 4), s * hw * 0.5, leg + bh * 0.75 + headDrop + hh * 0.7, hz - hl * 0.25, { color: '#d8cbb0', tilt: -0.6 });
  if (a.ears) for (const s of [-1, 1]) put(new THREE.BoxGeometry(0.06, a.ears * scale, 0.1), s * hw * 0.4, leg + bh * 0.75 + headDrop + hh * 0.75, hz - hl * 0.3, { tilt: -0.3 });
  if (a.mane) put(new THREE.BoxGeometry(0.08, a.neck * scale * 0.9, 0.3), 0, leg + bh + headDrop * 0.45, nz - 0.1, { color: '#2a1e16', tilt: -0.5 });
  put(new THREE.BoxGeometry(0.08, bh * 0.7, 0.08), 0, leg + bh * 0.55, -bl / 2 - 0.05, { tilt: 0.3 });
  ctx.colliders.add({ x, z, w: bw + 0.2, d: bl + 0.6, rot, bottom: y, top: y + leg + bh });
}

export function herd(ctx, { center, radius = 8, count = 6, kind = 'goat', kinds, scale = 1 }) {
  for (let i = 0; i < count; i++) {
    const a = ctx.rand() * Math.PI * 2, d = Math.sqrt(ctx.rand()) * radius;
    animal(ctx, { x: center[0] + Math.cos(a) * d, z: center[1] + Math.sin(a) * d, rot: ctx.rand() * Math.PI * 2, kind: kinds ? ctx.rand.pick(kinds) : kind, scale: scale * ctx.rand.range(0.9, 1.1) });
  }
}

// Broad fruit tree with colored fruit dotting the canopy.
export function fruitTree(ctx, { x, z, h = ctx.rand.range(4, 6.5), leaf = '#4f7a34', fruit = '#e08a2a' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.2;
  ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.3, h, 5), { position: [x, y + h / 2, z], color: '#5a4332' });
  ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: y, top: y + h });
  for (let i = 0; i < 3; i++) {
    const rad = h * r.range(0.28, 0.38);
    const cx = x + r.range(-1, 1) * rad * 0.6, cy = y + h + r.range(-0.2, 0.4) * rad, cz = z + r.range(-1, 1) * rad * 0.6;
    ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), { position: [cx, cy, cz], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.8, 1], color: leaf, jitter: 0.1 });
    for (let k = 0; k < 6; k++) {
      const v = new THREE.Vector3(r.range(-1, 1), r.range(-0.6, 0.8), r.range(-1, 1)).normalize().multiplyScalar(rad * 0.92);
      ctx.solid.add(new THREE.IcosahedronGeometry(0.16, 0), { position: [cx + v.x, cy + v.y * 0.8, cz + v.z], color: fruit, jitter: 0.08 });
    }
  }
}

// Palm with a crown of fronds and a cluster of dates.
export function palm(ctx, { x, z, h = ctx.rand.range(6, 10), leaf = '#5c8a3a' }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z) - 0.2;
  const lean = [r.range(-0.12, 0.12), 0, r.range(-0.12, 0.12)];
  ctx.solid.add(new THREE.CylinderGeometry(0.18, 0.3, h, 6, 4), { position: [x, y + h / 2, z], rotation: lean, color: '#7a6248' });
  const tx = x - lean[2] * h * 0.5, tz = z + lean[0] * h * 0.5;
  ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: y, top: y + h });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + r.range(-0.2, 0.2);
    const geo = new THREE.ConeGeometry(0.7, 4.5, 3).translate(0, 2.25, 0);
    ctx.solid.add(geo, { position: [tx, y + h, tz], rotation: [Math.PI / 2 + r.range(0.4, 0.9), a, 0], scale: [1, 1, 0.2], color: leaf, jitter: 0.1 });
  }
  ctx.solid.add(new THREE.IcosahedronGeometry(0.45, 0), { position: [tx, y + h - 0.5, tz], color: '#a8642a' });
}

// Straw beehive skep on a stand, with a few glowing bees around it.
export function skep(ctx, { x, z }) {
  const y = ctx.heightAt(x, z);
  ctx.solid.box(1.1, 0.5, 1.1, { position: [x, y + 0.25, z], color: '#6b4a30' });
  ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.5, 0.9, 7, 3), { position: [x, y + 0.95, z], color: '#c49a4a', jitter: 0.08 });
  ctx.solid.add(new THREE.SphereGeometry(0.5, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), { position: [x, y + 0.75, z], scale: [1, 1.3, 1], color: '#b88c40', jitter: 0.08 });
  ctx.colliders.add({ x, z, w: 1.1, d: 1.1, bottom: y, top: y + 1.5 });
}

// Stone forge with a glowing fire pit, smoke and a pair of leather bellows.
export function forge(ctx, { x, z, rot = 0, smoke = true }) {
  const y = ctx.heightAt(x, z);
  const r = ctx.rand;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.35, 0), { position: [x + Math.cos(a) * 1.1, y + 0.4, z + Math.sin(a) * 1.1], rotation: [r() * 3, r() * 3, 0], scale: [1, 1.4, 1], color: '#6e655e', jitter: 0.1 });
  }
  ctx.solid.add(new THREE.CylinderGeometry(1.0, 1.1, 0.5, 9), { position: [x, y + 0.25, z], color: '#3a302a' });
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, d = r() * 0.7;
    ctx.glow.add(new THREE.OctahedronGeometry(r.range(0.15, 0.3), 0), { position: [x + Math.cos(a) * d, y + 0.55, z + Math.sin(a) * d], color: r.pick(['#ff6a1a', '#ffa040', '#ff8a2a']), jitter: 0.05 });
  }
  const at = frame(x, z, rot);
  const [bx, bz] = at(0, 2.0);
  ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.6, 1.4, 4), { position: [bx, y + 0.3, bz], rotation: [Math.PI / 2, rot, 0], scale: [1, 1, 0.4], color: '#6a4a32' });
  ctx.colliders.add({ x, z, w: 2.6, d: 2.6, bottom: y, top: y + 0.8 });
  const light = new THREE.PointLight('#ff9a4a', 12, 12, 1.6);
  light.position.set(x, y + 1.2, z);
  ctx.scene.add(light);
  ctx.onFrame((t) => (light.intensity = 12 * (0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3))));
  if (smoke) ctx.effects.smoke({ position: [x, y + 0.8, z], count: 8, height: 12, size: 0.5, color: '#8a8580', seed: Math.floor(r() * 1e6) });
}

// Campfire with logs and flickering light.
export function campfire(ctx, { x, z, light = 10 }) {
  const y = ctx.heightAt(x, z);
  const r = ctx.rand;
  for (let i = 0; i < 4; i++) ctx.solid.box(0.18, 0.18, 1.2, { position: [x, y + 0.12, z], rotation: [0.2, (i / 4) * Math.PI, 0], color: '#3a2a1e' });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.2, 0), { position: [x + Math.cos(a) * 0.75, y + 0.1, z + Math.sin(a) * 0.75], color: '#6e655e' });
  }
  const flames = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.28 - i * 0.05, 0.9 - i * 0.15, 5), new THREE.MeshBasicMaterial({ color: ['#ff7a1a', '#ffa040', '#ffd27a'][i], toneMapped: false }));
    m.position.set(x + r.range(-0.1, 0.1), y + 0.5, z + r.range(-0.1, 0.1));
    ctx.scene.add(m);
    flames.push(m);
  }
  const pl = new THREE.PointLight('#ff9a4a', light, 14, 1.5);
  pl.position.set(x, y + 1.2, z);
  ctx.scene.add(pl);
  ctx.onFrame((t) => {
    flames.forEach((m, i) => (m.scale.y = 0.8 + 0.3 * Math.sin(t * (9 + i * 3) + i)));
    pl.intensity = light * (0.85 + 0.15 * Math.sin(t * 11));
  });
  ctx.colliders.add({ x, z, w: 1.6, d: 1.6, bottom: y, top: y + 0.5 });
}

// Outcrop of rock with veins of gold, silver and copper ore.
export function oreOutcrop(ctx, { x, z, size = 2.5 }) {
  const r = ctx.rand;
  const y = ctx.heightAt(x, z);
  for (let i = 0; i < 4; i++) {
    const s = size * r.range(0.4, 0.8);
    const px = x + r.range(-1, 1) * size * 0.6, pz = z + r.range(-1, 1) * size * 0.6;
    ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [px, y + s * 0.3, pz], rotation: [r() * 3, r() * 3, r() * 3], scale: [s, s * 0.7, s], color: '#7a6e64', jitter: 0.08 });
  }
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = r.range(1.0, 1.35) * size;
    ctx.glow.add(new THREE.OctahedronGeometry(r.range(0.14, 0.3), 0), {
      position: [x + Math.cos(a) * d, y + r.range(0.1, size * 0.45), z + Math.sin(a) * d],
      rotation: [r() * 3, r() * 3, 0],
      color: r.pick(['#e6b43a', '#f0c850', '#c8ccd0', '#d07a42']),
      jitter: 0.05,
    });
  }
  ctx.colliders.add({ x, z, w: size * 1.6, d: size * 1.6, bottom: y, top: y + size * 0.7 });
}

// Tilled furrows of a planted field.
export function field(ctx, { x, z, w = 16, d = 12, rot = 0, soil = '#6a4a32', sprout = '#7fa04a', rows = 8 }) {
  const at = frame(x, z, rot);
  for (let i = 0; i < rows; i++) {
    const lx = -w / 2 + ((i + 0.5) * w) / rows;
    for (let k = 0; k < Math.round(d / 2); k++) {
      const lz = -d / 2 + k * 2 + 1;
      const [px, pz] = at(lx, lz);
      ctx.solid.box(w / rows - 0.5, 0.25, 2.05, { position: [px, ctx.heightAt(px, pz) + 0.02, pz], rotation: [0, rot, 0], color: soil, jitter: 0.05 });
      if (sprout && ctx.rand() < 0.8) ctx.solid.add(new THREE.ConeGeometry(0.12, 0.35, 4), { position: [px, ctx.heightAt(px, pz) + 0.3, pz], color: sprout });
    }
  }
}

// Crates, jars and bundles of provisions.
export function provisions(ctx, { x, z, count = 6, radius = 1.6 }) {
  const r = ctx.rand;
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, y = ctx.heightAt(px, pz);
    const kind = r();
    if (kind < 0.4) ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.3, 0.8, 7), { position: [px, y + 0.4, pz], scale: [1, 1, 1], color: r.pick(['#b0683e', '#a8603a', '#c08050']) });
    else if (kind < 0.75) ctx.solid.box(0.8, 0.6, 0.6, { position: [px, y + 0.3, pz], rotation: [0, r() * 3, 0], color: '#7a5a3a' });
    else ctx.solid.add(new THREE.DodecahedronGeometry(0.4, 0), { position: [px, y + 0.3, pz], scale: [1.3, 0.8, 1], color: '#c8b48a' });
  }
}

export function stack(ctx, { x, z, rot = 0, n = 6, len = 5, color = '#8a6040' }) {
  const y = ctx.heightAt(x, z);
  const at = frame(x, z, rot);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 3), col = i % 3;
    const [px, pz] = at((col - 1) * 0.45 + row * 0.22, 0);
    ctx.solid.box(0.4, 0.3, len, { position: [px, y + 0.15 + row * 0.3, pz], rotation: [0, rot + ctx.rand.range(-0.05, 0.05), 0], color });
  }
  ctx.colliders.add({ x, z, w: 1.6, d: len, rot, bottom: y, top: y + 0.9 });
}
