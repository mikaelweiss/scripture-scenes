import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { between, boxGeo, localToWorld, makeRng, pick } from './util.js';

// Each builder takes one entry from scene.objects and adds meshes, colliders and rubble through ctx.

function addMerged(group, geos, material, { cast = true, receive = true } = {}) {
  if (!geos.length) return null;
  const mesh = new THREE.Mesh(mergeGeometries(geos), material);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  group.add(mesh);
  return mesh;
}

function placeGroup(ctx, pos, rot, sink = 0.25) {
  const group = new THREE.Group();
  const y = ctx.terrainHeight(pos[0], pos[1]) - sink;
  group.position.set(pos[0], y, pos[1]);
  group.rotation.y = rot;
  ctx.scene.add(group);
  return { group, y };
}

function localCollider(ctx, pos, rot, baseY, lx, lz, hx, hz, top, extra = {}) {
  const [x, z] = localToWorld(pos[0], pos[1], rot, lx, lz);
  ctx.addCollider({ x, z, hx, hz, rot, top: baseY + top, ...extra });
}

function stairs(geos, ctx, pos, rot, baseY, { x = 0, frontZ, fromY, toY, width, rise, depth }) {
  const n = Math.max(1, Math.round((toY - fromY) / rise));
  const r = (toY - fromY) / n;
  for (let k = 0; k < n; k++) {
    const top = fromY + (k + 1) * r;
    const zc = frontZ - (k + 0.5) * depth;
    geos.push(boxGeo(width, top, depth, [x, top / 2, zc], { uv: { su: 2 } }));
    localCollider(ctx, pos, rot, baseY, x, zc, width / 2, depth / 2, top, { walkable: true });
  }
  return n * depth;
}

function stepPyramid(s, ctx) {
  const rot = s.rot ?? 0;
  const { group, y: baseY } = placeGroup(ctx, s.pos, rot, 0.3);
  const [bw, bd] = s.base;
  const th = s.tierHeight;
  const stone = [], bands = [], stairGeos = [], shrine = [], roof = [], dark = [];
  for (let i = 0; i < s.tiers; i++) {
    const w = bw - 2 * s.inset * i, d = bd - 2 * s.inset * i;
    stone.push(boxGeo(w, th, d, [0, i * th + th / 2, 0]));
    const bandH = 0.75;
    const bandY = (i + 1) * th - bandH / 2 - 0.15;
    bands.push(boxGeo(w + 0.35, bandH, d + 0.35, [0, bandY, 0], { uv: { su: bandH * 4, sv: bandH, oy: bandH / 2, local: true, flatCaps: true } }));
    localCollider(ctx, s.pos, rot, baseY, 0, 0, w / 2 + 0.2, d / 2 + 0.2, (i + 1) * th, { walkable: i === s.tiers - 1 });
  }
  const H = s.tiers * th;
  const topD = bd - 2 * s.inset * (s.tiers - 1);
  const frontZ = bd / 2 + s.stair.extra;
  const run = frontZ - topD / 2;
  const n = Math.round(H / s.stair.rise);
  stairs(stairGeos, ctx, s.pos, rot, baseY, { frontZ, fromY: 0, toY: H, width: s.stair.width, rise: s.stair.rise, depth: run / n });
  const slope = Math.atan2(H, run);
  const len = Math.hypot(H, run);
  for (const side of [-1, 1]) {
    bands.push(boxGeo(1.1, 1.0, len + 0.6, [side * (s.stair.width / 2 + 0.55), H / 2 + 0.25, frontZ - run / 2], { rotX: slope, uv: { su: 4, sv: 1, flatCaps: true } }));
  }

  const [sw, sd, sh] = s.shrine.size;
  const t = 0.9, doorW = 2.4, doorH = 3.2;
  const by = H;
  shrine.push(boxGeo(sw, sh, t, [0, by + sh / 2, -sd / 2 + t / 2]));
  for (const side of [-1, 1]) {
    shrine.push(boxGeo(t, sh, sd, [side * (sw / 2 - t / 2), by + sh / 2, 0]));
    const pw = (sw - doorW) / 2;
    shrine.push(boxGeo(pw, sh, t, [side * (doorW / 2 + pw / 2), by + sh / 2, sd / 2 - t / 2]));
  }
  shrine.push(boxGeo(doorW, sh - doorH, t, [0, by + doorH + (sh - doorH) / 2, sd / 2 - t / 2]));
  dark.push(boxGeo(sw - 2 * t, sh - 0.2, sd - 2 * t, [0, by + sh / 2, 0]));
  const roofH = 0.9;
  roof.push(boxGeo(sw + 1, roofH, sd + 1, [0, by + sh + roofH / 2, 0], { uv: { su: roofH * 4, sv: roofH, oy: roofH / 2, local: true, flatCaps: true } }));
  const combH = s.shrine.comb ?? 3.5;
  roof.push(boxGeo(sw * 0.7, combH, 0.7, [0, by + sh + roofH + combH / 2, -sd * 0.12], { uv: { su: combH, sv: combH / 3, oy: combH / 2, local: true, flatCaps: true } }));
  localCollider(ctx, s.pos, rot, baseY, 0, 0, sw / 2, sd / 2, H + sh + roofH);

  const k = ctx.kit;
  addMerged(group, stone, k.stoneMat(s.colors.stone));
  addMerged(group, stairGeos, k.stoneMat(s.colors.stair));
  addMerged(group, bands, k.fretMat(...s.colors.fret));
  addMerged(group, shrine, k.stoneMat(s.colors.shrine));
  addMerged(group, roof, k.fretMat(...s.colors.roofFret));
  addMerged(group, dark, k.toon(s.colors.interior), { cast: false });

  const rng = makeRng(s.seed ?? 4);
  for (let i = 0; i < (s.rubble ?? 0); i++) {
    const a = rng() * Math.PI * 2;
    const r = between(rng, [bw * 0.5, bw * 0.75]);
    const [x, z] = localToWorld(s.pos[0], s.pos[1], rot, Math.sin(a) * r, Math.cos(a) * r);
    ctx.addBlock(x, z, between(rng, [0.4, 1.1]), rng, s.colors.stone);
  }
}

function platform(s, ctx) {
  const rot = s.rot ?? 0;
  const { group, y: baseY } = placeGroup(ctx, s.pos, rot, 0.1);
  const stone = [], trim = [], steps = [];
  let y = 0;
  for (const tier of s.tiers) {
    const [w, d] = tier.size;
    const [ox, oz] = tier.offset ?? [0, 0];
    stone.push(boxGeo(w, tier.height, d, [ox, y + tier.height / 2, oz]));
    const tH = Math.min(0.4, tier.height * 0.45);
    const tY = y + tier.height - tH / 2 - 0.06;
    trim.push(boxGeo(w + 0.2, tH, d + 0.2, [ox, tY, oz], { uv: { su: tH * 4, sv: tH, oy: tH / 2, local: true, flatCaps: true } }));
    localCollider(ctx, s.pos, rot, baseY, ox, oz, w / 2, d / 2, y + tier.height, { walkable: true });
    stairs(steps, ctx, s.pos, rot, baseY, {
      x: ox, frontZ: oz + d / 2 + s.stairDepth * Math.round(tier.height / s.rise), fromY: y, toY: y + tier.height, width: s.stairWidth, rise: s.rise, depth: s.stairDepth,
    });
    y += tier.height;
  }
  addMerged(group, stone, ctx.kit.stoneMat(s.colors.stone));
  addMerged(group, steps, ctx.kit.stoneMat(s.colors.stair));
  addMerged(group, trim, ctx.kit.fretMat(...s.colors.fret));
}

function raggedWall(geos, ctx, rng, frame, w) {
  const { pos, rot, baseY } = frame;
  const L = Math.hypot(w.x1 - w.x0, w.z1 - w.z0);
  const ang = Math.atan2(w.z1 - w.z0, w.x1 - w.x0);
  const n = Math.max(1, Math.round(L / (w.block ?? 1)));
  const bw = L / n;
  const course = 0.5;
  let walk = rng();
  let total = 0;
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    walk = THREE.MathUtils.clamp(walk + (rng() - 0.5) * 0.6, 0, 1);
    let h = w.height * (1 - w.damage * (0.25 + 0.75 * walk));
    if (rng() < w.damage * 0.3) h *= 0.3;
    if (w.gaps?.some(([a, b]) => t > a && t < b)) h = 0;
    h = Math.round(h / course) * course;
    total += h;
    const cx = w.x0 + (w.x1 - w.x0) * t, cz = w.z0 + (w.z1 - w.z0) * t;
    if (h > 0) geos.push(boxGeo(bw + 0.03, h, w.thickness, [cx, h / 2, cz], { rotY: -ang, uv: { ox: k * bw, oy: h / 2 } }));
    const missing = (w.height - h) / course;
    for (let b = 0; b < missing * (w.rubble ?? 0.5); b++) {
      const side = w.fallSide ?? (rng() < 0.5 ? -1 : 1);
      const off = side * (w.thickness / 2 + 0.4 + rng() * rng() * w.height * 1.2);
      const along = (rng() - 0.5) * bw * 1.5;
      const lx = cx + Math.cos(ang) * along - Math.sin(ang) * off;
      const lz = cz + Math.sin(ang) * along + Math.cos(ang) * off;
      const [x, z] = localToWorld(pos[0], pos[1], rot, lx, lz);
      ctx.addBlock(x, z, between(rng, [0.35, 0.7]), rng, w.color);
    }
  }
  const avg = total / n;
  const [mx, mz] = [(w.x0 + w.x1) / 2, (w.z0 + w.z1) / 2];
  if (avg > 0.3) {
    const [x, z] = localToWorld(pos[0], pos[1], rot, mx, mz);
    ctx.addCollider({ x, z, hx: L / 2, hz: w.thickness / 2 + 0.1, rot: rot - ang, top: baseY + w.height * 0.8 });
  }
}

function ruinHouse(s, ctx) {
  const rot = s.rot ?? 0;
  const { group, y: baseY } = placeGroup(ctx, s.pos, rot, 0.15);
  const rng = makeRng(s.seed ?? Math.floor(s.pos[0] * 13 + s.pos[1] * 7));
  const [w, d] = s.size;
  const frame = { pos: s.pos, rot, baseY };
  const geos = [];
  const base = { height: s.height, thickness: s.thickness ?? 0.7, damage: s.damage, color: s.color, rubble: s.rubble };
  raggedWall(geos, ctx, rng, frame, { ...base, x0: -w / 2, z0: d / 2, x1: w / 2, z1: d / 2, gaps: [[0.4, 0.6]] });
  raggedWall(geos, ctx, rng, frame, { ...base, x0: w / 2, z0: -d / 2, x1: -w / 2, z1: -d / 2 });
  raggedWall(geos, ctx, rng, frame, { ...base, x0: -w / 2, z0: -d / 2, x1: -w / 2, z1: d / 2 });
  raggedWall(geos, ctx, rng, frame, { ...base, x0: w / 2, z0: d / 2, x1: w / 2, z1: -d / 2 });
  const slabs = [];
  if (s.fallenRoof) slabs.push(boxGeo(w * 0.7, 0.35, d * 0.55, [w * 0.1, s.height * 0.3, 0], { rotZ: 0.38, rotX: 0.1 }));
  addMerged(group, geos, ctx.kit.stoneMat(s.color));
  addMerged(group, slabs, ctx.kit.stoneMat(s.trim ?? s.color));
  if (s.trimBand) {
    const bandH = 0.5;
    const band = [];
    const y = s.height - 0.6;
    if (s.damage < 0.5) {
      band.push(boxGeo(w * 0.45, bandH, 0.2, [-w * 0.27, y, d / 2 + 0.4], { uv: { su: bandH * 4, sv: bandH, oy: bandH / 2, local: true, flatCaps: true } }));
      addMerged(group, band, ctx.kit.fretMat(...s.trimBand));
    }
  }
  ctx.exclude({ kind: 'rect', x: s.pos[0], z: s.pos[1], hx: w / 2 + 1.2, hz: d / 2 + 1.2, rot });
}

function wall(s, ctx) {
  const rot = 0;
  const pos = s.from;
  const { group, y: baseY } = placeGroup(ctx, pos, rot, 0.15);
  const rng = makeRng(s.seed ?? 9);
  const geos = [];
  const lx = s.to[0] - s.from[0], lz = s.to[1] - s.from[1];
  raggedWall(geos, ctx, rng, { pos, rot, baseY }, {
    x0: 0, z0: 0, x1: lx, z1: lz, height: s.height, thickness: s.thickness ?? 0.8, damage: s.damage, color: s.color, rubble: s.rubble ?? 0.9, fallSide: s.fallSide,
  });
  addMerged(group, geos, ctx.kit.stoneMat(s.color));
  const mid = [(s.from[0] + s.to[0]) / 2, (s.from[1] + s.to[1]) / 2];
  ctx.exclude({ kind: 'rect', x: mid[0], z: mid[1], hx: Math.hypot(lx, lz) / 2 + 1, hz: 2.5, rot: -Math.atan2(lz, lx) });
}

function columns(s, ctx) {
  const rng = makeRng(s.seed ?? 12);
  const group = new THREE.Group();
  ctx.scene.add(group);
  const shafts = [], caps = [];
  for (let i = 0; i < s.count; i++) {
    const t = s.count === 1 ? 0.5 : i / (s.count - 1);
    const x = s.from[0] + (s.to[0] - s.from[0]) * t;
    const z = s.from[1] + (s.to[1] - s.from[1]) * t;
    const y = ctx.terrainHeight(x, z) - 0.1;
    const broken = rng() < s.broken;
    const h = broken ? s.height * between(rng, [0.2, 0.6]) : s.height;
    const g = new THREE.CylinderGeometry(s.radius, s.radius * 1.08, h, 10);
    g.translate(x, y + h / 2, z);
    shafts.push(g);
    ctx.addCollider({ x, z, hx: s.radius, hz: s.radius, rot: 0, top: y + h });
    if (!broken) caps.push(boxGeo(s.radius * 2.8, 0.45, s.radius * 2.8, [x, y + h + 0.22, z]));
    else {
      const drums = 1 + Math.floor(rng() * 3);
      const a = rng() * Math.PI * 2;
      for (let k = 0; k < drums; k++) {
        const len = between(rng, [0.8, 1.6]);
        const dg = new THREE.CylinderGeometry(s.radius, s.radius, len, 10);
        dg.rotateZ(Math.PI / 2);
        dg.rotateY(a + (rng() - 0.5) * 0.5);
        const dist = 1.2 + k * 1.5 + rng();
        const dx = x + Math.cos(a) * dist, dz = z - Math.sin(a) * dist;
        dg.translate(dx, ctx.terrainHeight(dx, dz) + s.radius * 0.85, dz);
        shafts.push(dg);
      }
    }
  }
  addMerged(group, shafts, ctx.kit.stoneMat(s.color));
  addMerged(group, caps, ctx.kit.stoneMat(s.capColor ?? s.color));
}

function ringPoint(rng, s, reject = () => false) {
  const [cx, cz] = s.center ?? [0, 0];
  for (let tries = 0; tries < 50; tries++) {
    const a = between(rng, s.angle ?? [0, Math.PI * 2]);
    const r = Math.sqrt(between(rng, [s.ring[0] ** 2, s.ring[1] ** 2]));
    const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
    if (!reject(x, z)) return [x, z];
  }
  return null;
}

function trees(s, ctx) {
  const rng = makeRng(s.seed ?? 31);
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 1, 7);
  trunkGeo.translate(0, 0.5, 0);
  const canopyGeo = new THREE.SphereGeometry(1, 12, 9);
  const trunks = [], canopies = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < s.count; i++) {
    const p = ringPoint(rng, s, (x, z) => ctx.blocked(x, z, 2));
    if (!p) continue;
    const [x, z] = p;
    const y = ctx.terrainHeight(x, z) - 0.2;
    const kind = rng();
    const h = between(rng, s.height);
    if (kind < s.fallen) {
      const len = h * 0.9;
      e.set(0, rng() * 6.28, Math.PI / 2 - 0.05);
      m.compose(new THREE.Vector3(x, y + 0.45, z), q.setFromEuler(e), new THREE.Vector3(1.3, len, 1.3));
      trunks.push(m.clone());
      m.compose(new THREE.Vector3(x, y, z), q.identity(), new THREE.Vector3(1.4, 0.8, 1.4));
      trunks.push(m.clone());
    } else if (kind < s.fallen + s.broken) {
      e.set((rng() - 0.5) * 0.2, 0, (rng() - 0.5) * 0.2);
      m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e), new THREE.Vector3(1.2, h * between(rng, [0.25, 0.5]), 1.2));
      trunks.push(m.clone());
    } else {
      e.set((rng() - 0.5) * 0.12, 0, (rng() - 0.5) * 0.12);
      m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e), new THREE.Vector3(1, h, 1));
      trunks.push(m.clone());
      const puffs = 3 + Math.floor(rng() * 3);
      const spread = h * 0.32;
      for (let k = 0; k < puffs; k++) {
        const a = (k / puffs) * Math.PI * 2 + rng();
        const r = k === 0 ? 0 : spread * between(rng, [0.5, 0.9]);
        const cs = spread * between(rng, [0.6, 0.85]) * (k === 0 ? 1.2 : 1);
        m.compose(
          new THREE.Vector3(x + Math.sin(a) * r, y + h + (k === 0 ? spread * 0.35 : -spread * 0.05), z + Math.cos(a) * r),
          q.identity(),
          new THREE.Vector3(cs, cs * 0.7, cs),
        );
        canopies.push({ m: m.clone(), c: pick(rng, s.leafColors) });
      }
    }
    ctx.addCollider({ x, z, hx: 0.4, hz: 0.4, rot: 0, top: y + h });
  }
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, ctx.kit.toon(s.trunkColor), trunks.length);
  trunks.forEach((mm, i) => trunkMesh.setMatrixAt(i, mm));
  const canopyMesh = new THREE.InstancedMesh(canopyGeo, ctx.kit.toon('#ffffff'), canopies.length);
  const c = new THREE.Color();
  canopies.forEach(({ m: mm, c: cc }, i) => {
    canopyMesh.setMatrixAt(i, mm);
    canopyMesh.setColorAt(i, c.set(cc));
  });
  for (const mesh of [trunkMesh, canopyMesh]) {
    mesh.castShadow = mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }
}

function stones(s, ctx) {
  const rng = makeRng(s.seed ?? 41);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), s.count);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  let n = 0;
  for (let i = 0; i < s.count; i++) {
    const p = ringPoint(rng, s);
    if (!p) continue;
    const [x, z] = p;
    if (s.avoidAisles && ctx.inAisle(x, z, 0.5)) continue;
    const r = between(rng, s.size);
    m.compose(
      new THREE.Vector3(x, ctx.terrainHeight(x, z) + r * 0.2, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rng() * 3, rng() * 3, rng() * 3)),
      new THREE.Vector3(r * between(rng, [0.8, 1.4]), r * between(rng, [0.5, 0.9]), r),
    );
    mesh.setMatrixAt(n, m);
    mesh.setColorAt(n, c.set(pick(rng, s.colors)));
    n++;
  }
  mesh.count = n;
  mesh.castShadow = mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}

export const builders = { stepPyramid, platform, ruinHouse, wall, columns, trees, stones };

// Rubble blocks from every builder share one instanced mesh.
export function buildBlocks(blocks, ctx) {
  if (!blocks.length) return;
  const geo = boxGeo(1, 1, 1, [0, 0, 0], { uv: { su: 2 } });
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.stoneMat('#ffffff'), blocks.length);
  const c = new THREE.Color();
  blocks.forEach((b, i) => {
    mesh.setMatrixAt(i, b.matrix);
    mesh.setColorAt(i, c.set(b.color).multiplyScalar(b.shade));
  });
  mesh.castShadow = mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}

export function buildCracks(list, ctx) {
  const rng = makeRng(77);
  const positions = [], indices = [];
  const crack = (x, z, angle, length, width, depth) => {
    const step = 0.7;
    const n = Math.max(2, Math.round(length / step));
    let a = angle;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      pts.push([x, z]);
      a = angle + (rng() - 0.5) * 1.6 + Math.sin(i * 0.4) * 0.3;
      x += Math.sin(a) * step;
      z += Math.cos(a) * step;
      if (depth < 2 && i > 1 && i < n - 1 && rng() < 0.07) crack(x, z, a + (rng() < 0.5 ? -1 : 1) * between(rng, [0.5, 1.1]), length * 0.35, width * 0.55, depth + 1);
    }
    const base = positions.length / 3;
    for (let i = 0; i <= n; i++) {
      const [px, pz] = pts[i];
      const [nx, nz] = pts[Math.min(i + 1, n)];
      const [ox, oz] = pts[Math.max(i - 1, 0)];
      let dx = nx - ox, dz = nz - oz;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      const w = width * (1 - i / n) * (0.6 + rng() * 0.8) * 0.5 + 0.03;
      for (const side of [-1, 1]) {
        const vx = px - dz * w * side, vz = pz + dx * w * side;
        positions.push(vx, ctx.terrainHeight(vx, vz) + 0.05, vz);
      }
      if (i < n) {
        const v = base + i * 2;
        indices.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
      }
    }
  };
  for (const c of list) crack(c.from[0], c.from[1], c.angle, c.length, c.width, 0);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ color: ctx.style.crack, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  ctx.scene.add(mesh);
}

export function buildSmolder(list, ctx) {
  const rng = makeRng(55);
  const emberGeo = new THREE.BoxGeometry(1, 1, 1);
  const embers = [];
  const flames = [];
  const puffs = [];
  const logs = [];
  const m = new THREE.Matrix4();
  for (const s of list) {
    const [x, z] = s.pos;
    const y = ctx.terrainHeight(x, z);
    for (let i = 0; i < s.embers; i++) {
      const a = rng() * 6.28, r = Math.sqrt(rng()) * s.radius;
      const ex = x + Math.sin(a) * r, ez = z + Math.cos(a) * r;
      const sz = between(rng, [0.12, 0.3]);
      m.compose(new THREE.Vector3(ex, ctx.terrainHeight(ex, ez) + sz * 0.3, ez), new THREE.Quaternion().setFromEuler(new THREE.Euler(rng(), rng() * 3, rng())), new THREE.Vector3(sz, sz * 0.6, sz));
      embers.push({ m: m.clone(), hot: rng() < 0.5 });
    }
    for (let i = 0; i < s.logs; i++) {
      const a = rng() * 6.28;
      m.compose(new THREE.Vector3(x + (rng() - 0.5) * s.radius, y + 0.2, z + (rng() - 0.5) * s.radius), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, Math.PI / 2 + (rng() - 0.5) * 0.3)), new THREE.Vector3(0.9, between(rng, [1.2, 2.4]), 0.9));
      logs.push(m.clone());
    }
    for (let i = 0; i < s.flames; i++) {
      const a = rng() * 6.28, r = Math.sqrt(rng()) * s.radius * 0.6;
      flames.push({ x: x + Math.sin(a) * r, y, z: z + Math.cos(a) * r, h: between(rng, [0.5, 1.1]), phase: rng() * 10 });
    }
    for (let i = 0; i < s.smoke; i++) puffs.push({ x: x + (rng() - 0.5) * s.radius * 0.5, y, z: z + (rng() - 0.5) * s.radius * 0.5, phase: i / s.smoke + rng() * 0.05, size: between(rng, [1.3, 2.0]) * (s.smokeScale ?? 1), rise: s.smokeHeight ?? 10 });
  }
  const kit = ctx.kit;
  const emberMesh = new THREE.InstancedMesh(emberGeo, kit.basic('#ffffff'), embers.length);
  const c = new THREE.Color();
  embers.forEach((e, i) => {
    emberMesh.setMatrixAt(i, e.m);
    emberMesh.setColorAt(i, c.set(e.hot ? ctx.style.emberHot : ctx.style.ember));
  });
  ctx.scene.add(emberMesh);
  const logGeo = new THREE.CylinderGeometry(0.15, 0.18, 1, 6);
  const logMesh = new THREE.InstancedMesh(logGeo, kit.toon(ctx.style.charred), logs.length);
  logs.forEach((mm, i) => logMesh.setMatrixAt(i, mm));
  logMesh.castShadow = true;
  ctx.scene.add(logMesh);

  const flameGeo = new THREE.ConeGeometry(0.28, 1, 6);
  flameGeo.translate(0, 0.5, 0);
  const outer = new THREE.InstancedMesh(flameGeo, kit.basic(ctx.style.flameOuter), flames.length);
  const inner = new THREE.InstancedMesh(flameGeo, kit.basic(ctx.style.flameInner), flames.length);
  const smokeGeo = new THREE.SphereGeometry(1, 12, 9);
  const smoke = new THREE.InstancedMesh(smokeGeo, kit.toon(ctx.style.smoke, { emissive: ctx.style.smokeShade }), puffs.length);
  smoke.castShadow = false;
  for (const mesh of [outer, inner, smoke]) {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ctx.scene.add(mesh);
  }
  const v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  ctx.onFrame((t) => {
    flames.forEach((f, i) => {
      const flick = 0.75 + 0.25 * Math.sin(t * 9 + f.phase) * Math.sin(t * 5.3 + f.phase * 2);
      outer.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(1, f.h * flick, 1)));
      inner.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), sc.set(0.5, f.h * flick * 0.6, 0.5)));
    });
    puffs.forEach((p, i) => {
      const life = (t * 0.05 + p.phase) % 1;
      const s = p.size * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, life * 1.15))) * Math.min(1, life * 8) * (0.6 + life * 0.6);
      smoke.setMatrixAt(i, m.compose(v.set(p.x + life * life * 6, p.y + 0.5 + life * p.rise, p.z + life * life * 2), q.identity(), sc.set(s, s * 0.85, s)));
    });
    outer.instanceMatrix.needsUpdate = inner.instanceMatrix.needsUpdate = smoke.instanceMatrix.needsUpdate = true;
  });
}
