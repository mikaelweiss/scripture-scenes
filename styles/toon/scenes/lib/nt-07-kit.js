// Shared builders for the Gospel scenes nt-07 to nt-12: water, boats, houses, animals, trees, figures.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { between, boxGeo, localToWorld, makeRng, pick } from '../../engine/util.js';
import { makeFigure } from '../../engine/people.js';
import { FX_LAYER } from '../../engine/renderer.js';
import { glowTexture } from '../../engine/textures.js';

export { between, boxGeo, localToWorld, makeRng, pick, makeFigure, FX_LAYER };

// mergeGeometries needs one attribute layout, so every part is reduced to position, normal and uv.
function normalize(g) {
  let out = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(out.attributes)) if (!['position', 'normal', 'uv'].includes(name)) out.deleteAttribute(name);
  if (!out.attributes.normal) out.computeVertexNormals();
  if (!out.attributes.uv) out.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(out.attributes.position.count * 2), 2));
  return out;
}

export function addMesh(parent, geos, mat, { cast = true, receive = true } = {}) {
  if (!geos.length) return null;
  const mesh = new THREE.Mesh(mergeGeometries(geos.map(normalize)), mat);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

export function at(g, x, y, z, { rx = 0, ry = 0, rz = 0, s = null } = {}) {
  if (s) g.scale(...(Array.isArray(s) ? s : [s, s, s]));
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export const cyl = (r0, r1, h, x, y, z, opts = {}, seg = 8) => at(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, opts);
export const ball = (r, x, y, z, opts = {}, seg = 10) => at(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), x, y, z, opts);

// A rod between two points.
export function rod(a, b, r, seg = 6) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()),
  ));
  const mid = va.add(vb).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

export function group(ctx, x, z, rot = 0, y = null) {
  const g = new THREE.Group();
  g.position.set(x, y ?? ctx.terrainHeight(x, z), z);
  g.rotation.y = rot;
  ctx.scene.add(g);
  return g;
}

export function collideLocal(ctx, x, z, rot, lx, lz, hx, hz, top, extra = {}) {
  const [wx, wz] = localToWorld(x, z, rot, lx, lz);
  ctx.addCollider({ x: wx, z: wz, hx, hz, rot, top, ...extra });
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// White planks with dark seams, tinted by the material color. One tile is 4m long and 8 planks tall.
let plankTex = null;
export function plankTexture() {
  if (plankTex) return plankTex;
  const rng = makeRng(17);
  plankTex = canvasTexture(256, 256, (g) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) {
      const v = 228 + Math.floor(rng() * 27);
      g.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
      g.fillRect(0, row * 32 + 2, 256, 30);
      g.fillStyle = 'rgba(80,50,30,0.7)';
      g.fillRect(0, row * 32, 256, 2.5);
      const joint = (row * 97) % 256;
      g.fillRect(joint, row * 32, 2, 32);
    }
  });
  return plankTex;
}

let stripeTex = null;
export function stripeTexture() {
  if (stripeTex) return stripeTex;
  stripeTex = canvasTexture(128, 128, (g) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(70,40,25,0.35)';
    for (const [y, h] of [[18, 10], [34, 4], [84, 10], [100, 4]]) g.fillRect(0, y, 128, h);
  });
  return stripeTex;
}

// ---------- ground and water ----------

export function groundMesh(ctx, segments) {
  return ctx.scene.children.find((o) => o.isMesh && o.geometry.attributes.position?.count === (segments + 1) ** 2);
}

// Reshapes only the drawn terrain (walking still follows the original heights), e.g. to cut a seabed.
export function reshapeGround(ctx, segments, fn) {
  const mesh = groundMesh(ctx, segments);
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, fn(pos.getX(i), pos.getZ(i), pos.getY(i)));
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  return mesh;
}

function waveTexture(base, light, dark) {
  const rng = makeRng(5);
  return canvasTexture(256, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = rng() * 256, y = rng() * 256, w = 20 + rng() * 40;
      g.strokeStyle = rng() < 0.6 ? light : dark;
      g.lineWidth = 2 + rng() * 2;
      g.beginPath();
      for (let k = 0; k <= 8; k++) {
        const px = x + (k / 8) * w, py = y + Math.sin(k * 0.9) * 2.5;
        for (const ox of [0, -256]) if (k === 0) g.moveTo(px + ox, py); else g.lineTo(px + ox, py);
      }
      g.stroke();
    }
  });
}

// Calm water: a flat plane with drifting hand-drawn ripple marks.
export function calmWater(ctx, { y = 0, size = 3600, center = [0, 0], color = '#3f8f96', light = '#8fd0c8', dark = '#2f6f78', tile = 18 } = {}) {
  const tex = waveTexture(color, light, dark);
  tex.repeat.set(size / tile, size / tile);
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', map: tex, gradientMap: ctx.kit.gradient });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(center[0], y, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    tex.offset.x = t * 0.004;
    tex.offset.y = Math.sin(t * 0.3) * 0.01;
  });
  return mesh;
}

// White foam band along a shoreline z = shore(x).
export function foamLine(ctx, shore, { from = -300, to = 300, y = 0.04, width = 0.9, color = '#f4fbf6' } = {}) {
  const pos = [];
  const idx = [];
  const n = Math.round((to - from) / 2);
  for (let i = 0; i <= n; i++) {
    const x = from + (i / n) * (to - from);
    const z = shore(x);
    pos.push(x, y, z - width, x, y, z + width * 0.3);
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.layers.set(FX_LAYER);
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    mat.opacity = 0.55 + 0.3 * Math.sin(t * 0.9);
    mesh.position.z = Math.sin(t * 0.9) * 0.5;
  });
  return mesh;
}

// A sand ribbon laid over the drawn ground along the shore. heightAt must match the drawn terrain.
export function beach(ctx, shore, heightAt, { from = -300, to = 300, sea = 8, land = 14, color = '#e8cf98', wet = '#c9ad78' } = {}) {
  const rows = 10, step = 1.5;
  const n = Math.round((to - from) / step);
  const pos = [], col = [], idx = [];
  const cs = new THREE.Color(color), cw = new THREE.Color(wet), c = new THREE.Color();
  for (let i = 0; i <= n; i++) {
    const x = from + i * step;
    const s = shore(x);
    const edge = land * (0.7 + 0.3 * Math.sin(x * 0.13) * Math.sin(x * 0.051));
    for (let j = 0; j <= rows; j++) {
      const z = s - sea + (j / rows) * (sea + edge);
      pos.push(x, heightAt(x, z) + 0.12, z);
      c.copy(cw).lerp(cs, THREE.MathUtils.smoothstep(z - s, -1, 3));
      col.push(c.r, c.g, c.b);
      if (i < n && j < rows) {
        const a = i * (rows + 1) + j, b = a + rows + 1;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: ctx.kit.gradient, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}

// Rough sea: a CPU-animated mesh, flattened under the ship and toward its rim.
export function stormSea(ctx, { size = 420, segs = 84, center = [0, 0], calm = { x: 0, z: 0, r: 12 }, amp = 2.2, color = '#2e4f5c', crest = '#9fb9b8' } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  const n = pos.count;
  const damp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = base[i * 3] + center[0], z = base[i * 3 + 2] + center[1];
    const r = Math.hypot(x - center[0], z - center[1]);
    const rim = 1 - THREE.MathUtils.smoothstep(r, size * 0.32, size * 0.5);
    const lee = THREE.MathUtils.smoothstep(Math.hypot((x - calm.x) / 2.2, z - calm.z), calm.r * 0.5, calm.r * 1.6);
    damp[i] = rim * (0.15 + 0.85 * lee);
  }
  const colors = new Float32Array(n * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: ctx.kit.gradient, flatShading: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(center[0], 0, center[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  const cBase = new THREE.Color(color), cCrest = new THREE.Color(crest), c = new THREE.Color();
  const height = (x, z, t) =>
    Math.sin(x * 0.07 + z * 0.03 + t * 1.3) * 1.0 +
    Math.sin(x * -0.04 + z * 0.09 + t * 1.0) * 0.8 +
    Math.sin(x * 0.17 - z * 0.11 + t * 2.1) * 0.35 +
    Math.sin(x * 0.02 + t * 0.5) * 0.6;
  let acc = 1;
  ctx.onFrame((t, dt) => {
    acc += dt;
    if (acc < 1 / 30) return;
    acc = 0;
    for (let i = 0; i < n; i++) {
      const x = base[i * 3], z = base[i * 3 + 2];
      const h = height(x + center[0], z + center[1], t) * amp * damp[i];
      pos.array[i * 3 + 1] = h;
      const k = THREE.MathUtils.clamp((h / amp - 1.1) * 1.4, 0, 1);
      c.copy(cBase).lerp(cCrest, k);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.computeVertexNormals();
  });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), ctx.kit.toon(color));
  far.rotation.x = -Math.PI / 2;
  far.position.y = -0.6;
  ctx.scene.add(far);
  return { mesh, heightAt: (x, z, t) => height(x, z, t) * amp };
}

// Falling rain streaks that follow the camera. Two stacked copies make the loop seamless.
export function rain(ctx, { count = 1600, box = 70, height = 40, color = '#c9d6dc', wind = [0.35, 0.1], speed = 26, opacity = 0.45 } = {}) {
  const rng = makeRng(99);
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = (rng() - 0.5) * box, z = (rng() - 0.5) * box, y = rng() * height;
    for (const off of [0, height]) pts.push(x, y + off, z, x + wind[0] * 1.6, y + off + 1.6, z + wind[1] * 1.6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, fog: false, depthWrite: false }));
  lines.layers.set(FX_LAYER);
  lines.frustumCulled = false;
  ctx.scene.add(lines);
  ctx.onFrame((t, dt, camera) => {
    const fall = (t * speed) % height;
    lines.position.set(camera.position.x + fall * wind[0], camera.position.y - height * 0.9 - fall, camera.position.z + fall * wind[1]);
  });
}

// ---------- ships ----------

export function hullShape({ L = 28, B = 7.5, D = 4.2, sheer = 1.2 } = {}) {
  const halfW = (u) => (B / 2) * Math.max(0.03, Math.pow(Math.sin(Math.PI * u), 0.55));
  const keel = (u) => D * 0.55 * Math.pow(Math.abs(2 * u - 1), 3);
  const top = (u) => D + sheer * Math.pow(2 * u - 1, 2) + 0.9 * Math.pow(Math.max(0, Math.abs(2 * u - 1) - 0.75) / 0.25, 2);
  const lateral = (u, v) => halfW(u) * (1 - Math.pow(1 - v, 2.2));
  const point = (u, v, side = 1) => {
    const k = keel(u), t = top(u);
    return [(u - 0.5) * L, k + (t - k) * v, side * lateral(u, v)];
  };
  // Half-width of the hull at height y, found by searching v.
  const widthAt = (u, y) => {
    const k = keel(u), t = top(u);
    if (y <= k) return 0;
    const v = Math.min(1, (y - k) / (t - k));
    return lateral(u, v);
  };
  return { L, B, D, halfW, keel, top, point, widthAt };
}

function hullSkin(shape, vMax = 1, NU = 32, NV = 10) {
  const pos = [], uv = [], idx = [];
  const row = NU + 1;
  let base = 0;
  for (const side of [1, -1]) {
    for (let j = 0; j <= NV; j++) {
      for (let i = 0; i <= NU; i++) {
        const p = shape.point(i / NU, (j / NV) * vMax, side);
        pos.push(...p);
        uv.push(p[0] / 4, p[1] / 2.4);
      }
    }
    for (let j = 0; j < NV; j++) {
      for (let i = 0; i < NU; i++) {
        const a = base + j * row + i, b = a + 1, c = a + row, d = c + 1;
        if (side > 0) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
    }
    base += row * (NV + 1);
  }
  const outer = new THREE.BufferGeometry();
  outer.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  outer.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  outer.setIndex(idx);
  outer.computeVertexNormals();
  const inner = outer.clone();
  const ii = inner.index.array;
  for (let k = 0; k < ii.length; k += 3) [ii[k + 1], ii[k + 2]] = [ii[k + 2], ii[k + 1]];
  const nn = inner.attributes.normal.array;
  for (let k = 0; k < nn.length; k++) nn[k] = -nn[k];
  return [outer, inner];
}

function deckGeo(shape, deckY, NU = 32) {
  const pos = [], uv = [], idx = [];
  let n = 0;
  for (let i = 0; i <= NU; i++) {
    const u = i / NU;
    const w = Math.max(0.02, shape.widthAt(u, deckY) - 0.05);
    const x = (u - 0.5) * shape.L;
    pos.push(x, deckY, -w, x, deckY, w);
    uv.push(x / 4, -w / 2.4, x / 4, w / 2.4);
    if (i < NU) idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    n += 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function curveTube(points, r, seg = 24, radial = 6) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), seg, r, radial);
}

// A wooden ship. Hull length runs along local x with the bow at +x.
// stage: 'done' (planked, decked, rigged) or 'frame' (keel, ribs and lower planks on building stocks).
export function buildShip(ctx, spec) {
  const {
    pos: [x, z], rot = 0, y = 0, stage = 'done', planked = 0.45, sail = 'set', heel = 0,
    colors = {}, collide = true,
  } = spec;
  const shape = hullShape(spec);
  const { L, D } = shape;
  const C = { hull: '#9a6a43', rib: '#b07e50', deck: '#c79a64', rail: '#5e3c26', sail: '#efe4c8', sailStripe: '#b5523b', mast: '#6b4a33', rope: '#d8c8a0', ...colors };
  const g = group(ctx, x, z, rot, y);
  const inner = new THREE.Group();
  inner.rotation.x = heel;
  g.add(inner);
  const plank = (c) => ctx.kit.toon(c, { map: plankTexture() });
  const deckY = D * 0.74;
  const out = { group: g, inner, shape, deckY: y + deckY, worldDeckY: y + deckY };
  const toWorld = (lx, lz) => localToWorld(x, z, rot, lx, lz);
  out.toWorld = toWorld;

  if (stage === 'frame') {
    addMesh(inner, hullSkin(shape, planked), plank(C.hull));
    const ribs = [];
    for (let i = 2; i <= 22; i++) {
      const u = i / 24;
      const pts = [];
      for (let k = 10; k >= 0; k--) pts.push(shape.point(u, k / 10, -1));
      for (let k = 1; k <= 10; k++) pts.push(shape.point(u, k / 10, 1));
      ribs.push(curveTube(pts, 0.11, 30, 5));
    }
    const keelPts = [];
    for (let k = 0; k <= 20; k++) keelPts.push(shape.point(k / 20, 0));
    keelPts.unshift([-L / 2 - 0.3, shape.top(0) + 0.6, 0]);
    keelPts.push([L / 2 + 0.6, shape.top(1) + 1.2, 0]);
    ribs.push(curveTube(keelPts, 0.22, 60, 6));
    for (const side of [-1, 1]) {
      const rail = [];
      for (let k = 1; k <= 23; k++) rail.push(shape.point(k / 24, 1, side));
      ribs.push(curveTube(rail, 0.09, 40, 5));
    }
    addMesh(inner, ribs, ctx.kit.toon(C.rib));
    const blocks = [];
    for (let i = -3; i <= 3; i++) blocks.push(boxGeo(0.9, 1.4, 2.2, [i * L * 0.12, -0.7, 0]));
    addMesh(g, blocks, ctx.kit.toon('#7a5638'));
    if (collide) {
      collideLocal(ctx, x, z, rot, 0, 0, L * 0.42, shape.B * 0.42, y + D * 0.6);
    }
    return out;
  }

  addMesh(inner, hullSkin(shape, 1), plank(C.hull), { receive: true });
  addMesh(inner, [deckGeo(shape, deckY)], plank(C.deck));
  const trim = [];
  for (const side of [-1, 1]) {
    const rail = [];
    for (let k = 0; k <= 24; k++) rail.push(shape.point(k / 24, 1, side));
    trim.push(curveTube(rail, 0.13, 48, 5));
    const wale = [];
    for (let k = 1; k <= 23; k++) wale.push(shape.point(k / 24, 0.62, side));
    trim.push(curveTube(wale, 0.12, 48, 5));
  }
  trim.push(curveTube([[L / 2 - 0.4, shape.top(1) - 0.2, 0], [L / 2 + 0.6, shape.top(1) + 1.0, 0], [L / 2 + 0.4, shape.top(1) + 1.8, 0]], 0.2, 12, 6));
  trim.push(curveTube([[-L / 2 + 0.4, shape.top(0) - 0.2, 0], [-L / 2 - 0.4, shape.top(0) + 1.0, 0], [-L / 2 - 0.1, shape.top(0) + 1.6, 0]], 0.2, 12, 6));
  // Stern deckhouse and steering oar.
  const house = [boxGeo(4.2, 2.0, shape.widthAt(0.18, deckY) * 1.5, [-L * 0.3, deckY + 1.0, 0])];
  trim.push(boxGeo(4.6, 0.25, shape.widthAt(0.18, deckY) * 1.7, [-L * 0.3, deckY + 2.1, 0]));
  trim.push(rod([-L / 2 + 1.5, deckY + 1.6, shape.halfW(0.06) + 0.3], [-L / 2 - 1.2, -0.5, shape.halfW(0.06) + 0.9], 0.12));
  trim.push(boxGeo(0.25, 1.8, 0.7, [-L / 2 - 1.1, -0.2, shape.halfW(0.06) + 0.9]));
  addMesh(inner, trim, ctx.kit.toon(C.rail));
  addMesh(inner, house, plank(C.deck));

  const mastX = L * 0.08, mastH = 15;
  const rig = [cyl(0.22, 0.3, mastH, mastX, deckY + mastH / 2, 0), rod([mastX - 0.2, deckY + mastH - 2.2, -6.2], [mastX - 0.2, deckY + mastH - 2.2, 6.2], 0.14)];
  addMesh(inner, rig, ctx.kit.toon(C.mast));
  const ropes = [];
  for (const side of [-1, 1]) {
    ropes.push(rod([mastX, deckY + mastH - 0.4, 0], [mastX - 3.5, deckY + 0.6, side * (shape.widthAt(0.5 + (mastX - 3.5) / L, deckY) - 0.1)], 0.035, 4));
    ropes.push(rod([mastX, deckY + mastH - 0.4, 0], [mastX + 2.5, deckY + 0.6, side * (shape.widthAt(0.5 + (mastX + 2.5) / L, deckY) - 0.1)], 0.035, 4));
  }
  ropes.push(rod([mastX, deckY + mastH - 0.3, 0], [L / 2 + 0.4, shape.top(1) + 1.6, 0], 0.035, 4));
  ropes.push(rod([mastX, deckY + mastH - 0.3, 0], [-L / 2 + 0.5, shape.top(0) + 1.4, 0], 0.035, 4));
  addMesh(inner, ropes, ctx.kit.toon(C.rope), { cast: false });

  if (sail === 'set' || sail === 'torn') {
    const sg = new THREE.PlaneGeometry(11.5, 9.5, 12, 10);
    const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const sx = p.getX(i) / 5.75, sy = p.getY(i) / 4.75;
      p.setZ(i, (1 - sx * sx) * (1 - sy * sy * 0.6) * 1.6);
      if (sail === 'torn' && sy < -0.3 && sx > 0.2) p.setY(i, p.getY(i) + (sy + 0.3) * 3 * (sx - 0.2));
    }
    sg.computeVertexNormals();
    sg.rotateY(Math.PI / 2);
    sg.translate(mastX + 0.25, deckY + mastH - 7.2, 0);
    const sailMat = ctx.kit.toon(C.sail, { map: stripeTexture(), side: THREE.DoubleSide });
    const s = new THREE.Mesh(sg, sailMat);
    s.castShadow = true;
    inner.add(s);
  } else if (sail === 'furled') {
    addMesh(inner, [rod([mastX + 0.1, deckY + mastH - 2.6, -5.8], [mastX + 0.1, deckY + mastH - 2.6, 5.8], 0.38, 8)], ctx.kit.toon(C.sail));
  }

  if (collide) {
    const N = 16;
    const deckTop = y + deckY;
    for (let i = 0; i < N; i++) {
      const u0 = 0.04 + (i / N) * 0.92, u1 = 0.04 + ((i + 1) / N) * 0.92;
      const w0 = shape.widthAt(u0, deckY), w1 = shape.widthAt(u1, deckY);
      const x0 = (u0 - 0.5) * L, x1 = (u1 - 0.5) * L;
      collideLocal(ctx, x, z, rot, (x0 + x1) / 2, 0, (x1 - x0) / 2 + 0.05, Math.max(0.2, Math.min(w0, w1) - 0.15), deckTop, { walkable: true });
      for (const side of [-1, 1]) {
        const dx = x1 - x0, dz = side * (w1 - w0);
        const a = Math.atan2(-dz, dx);
        const len = Math.hypot(dx, dz);
        const [cx, cz] = localToWorld(x, z, rot, (x0 + x1) / 2, side * (w0 + w1) / 2);
        ctx.addCollider({ x: cx, z: cz, hx: len / 2 + 0.15, hz: 0.18, rot: rot + a, top: deckTop + 1.4 });
      }
    }
    for (const end of [-1, 1]) collideLocal(ctx, x, z, rot, end * L * 0.48, 0, 0.3, 0.8, deckTop + 1.4);
    const [hx, hz] = toWorld(-L * 0.3, 0);
    ctx.addCollider({ x: hx, z: hz, hx: 2.1, hz: shape.widthAt(0.18, deckY) * 0.75, rot, top: deckTop + 2.2 });
    const [mx, mz] = toWorld(mastX, 0);
    ctx.addCollider({ x: mx, z: mz, hx: 0.35, hz: 0.35, rot, top: deckTop + mastH });
  }
  out.mastWorld = toWorld(mastX, 0);
  return out;
}

// ---------- tents ----------

// Ridge tent: a long low prism of woven cloth on poles, door dark on the front (+z) face.
export function tent(ctx, { pos: [x, z], rot = 0, size: [w, d, h] = [5, 4, 2.6], color = '#5a4636', trim = '#b5523b', open = true }) {
  const g = group(ctx, x, z, rot, ctx.terrainHeight(x, z) - 0.05);
  const hw = w / 2, hd = d / 2, eave = h * 0.32;
  const p = [
    // roof slopes
    -hw, h, 0, -hw, eave, hd, hw, eave, hd, -hw, h, 0, hw, eave, hd, hw, h, 0,
    -hw, h, 0, hw, h, 0, hw, eave, -hd, -hw, h, 0, hw, eave, -hd, -hw, eave, -hd,
    // gables
    -hw, eave, -hd, -hw, eave, hd, -hw, h, 0, hw, eave, hd, hw, eave, -hd, hw, h, 0,
    // walls
    -hw, 0, hd, hw, 0, hd, hw, eave, hd, -hw, 0, hd, hw, eave, hd, -hw, eave, hd,
    hw, 0, -hd, -hw, 0, -hd, -hw, eave, -hd, hw, 0, -hd, -hw, eave, -hd, hw, eave, -hd,
    -hw, 0, -hd, -hw, 0, hd, -hw, eave, hd, -hw, 0, -hd, -hw, eave, hd, -hw, eave, -hd,
    hw, 0, hd, hw, 0, -hd, hw, eave, -hd, hw, 0, hd, hw, eave, -hd, hw, eave, hd,
  ];
  const cloth = new THREE.BufferGeometry();
  cloth.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const uv = [];
  for (let i = 0; i < p.length; i += 3) uv.push((p[i] + p[i + 2]) / 3, p[i + 1] / 2.4);
  cloth.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  cloth.computeVertexNormals();
  addMesh(g, [cloth], ctx.kit.toon(color, { map: stripeTexture(), side: THREE.DoubleSide }));
  const dark = [];
  if (open) {
    const dw = Math.min(1.4, w * 0.3);
    dark.push(boxGeo(dw, eave + (h - eave) * 0.55, 0.05, [0, (eave + (h - eave) * 0.55) / 2, hd + 0.03]));
  }
  addMesh(g, dark, ctx.kit.toon('#2b1a12'), { cast: false });
  const poles = [cyl(0.06, 0.06, h + 0.5, -hw, (h + 0.5) / 2, 0), cyl(0.06, 0.06, h + 0.5, hw, (h + 0.5) / 2, 0)];
  for (const s of [-1, 1]) poles.push(rod([s * (hw + 0.1), h - 0.1, 0], [s * (hw + 1.4), 0, s * 0.3], 0.025, 4));
  poles.push(boxGeo(w + 0.1, 0.18, 0.06, [0, eave - 0.1, hd + 0.02]));
  addMesh(g, poles, ctx.kit.toon(trim));
  ctx.addCollider({ x, z, hx: hw + 0.1, hz: hd + 0.1, rot, top: g.position.y + h });
  return g;
}

// ---------- animals ----------

const ANIMALS = {
  ox: { body: [2.2, 1.0, 0.95], leg: 0.75, neck: 0.5, head: [0.55, 0.45, 0.4], horns: 0.45, color: '#7a5034', tail: 0.8 },
  cow: { body: [2.0, 0.9, 0.85], leg: 0.7, neck: 0.45, head: [0.5, 0.42, 0.36], horns: 0.25, color: '#c9b49a', spots: '#4a3424', tail: 0.75 },
  horse: { body: [2.0, 0.75, 0.6], leg: 1.0, neck: 0.95, neckTilt: 0.7, head: [0.65, 0.3, 0.28], ears: 0.18, color: '#8a5a36', mane: '#2b1a12', tail: 0.9 },
  ass: { body: [1.5, 0.65, 0.5], leg: 0.75, neck: 0.6, neckTilt: 0.6, head: [0.55, 0.28, 0.26], ears: 0.35, color: '#8e8478', tail: 0.6 },
  goat: { body: [1.0, 0.5, 0.4], leg: 0.5, neck: 0.35, neckTilt: 0.5, head: [0.32, 0.22, 0.2], horns: 0.3, back: true, color: '#e8e0d0', tail: 0.2, beard: true },
  wildGoat: { body: [1.1, 0.55, 0.42], leg: 0.6, neck: 0.4, neckTilt: 0.6, head: [0.34, 0.24, 0.2], horns: 0.7, back: true, color: '#9a7a52', tail: 0.2 },
  sheep: { body: [1.1, 0.75, 0.65], leg: 0.45, neck: 0.25, neckTilt: 0.3, head: [0.32, 0.25, 0.22], ears: 0.12, color: '#efe8d8', face: '#3a2a20', wool: true, tail: 0.2 },
  camel: { body: [2.0, 0.9, 0.75], leg: 1.4, neck: 1.2, neckTilt: 0.35, head: [0.6, 0.3, 0.28], hump: true, color: '#c39a62', tail: 0.5 },
};

// Animal facing +z. Returns a group whose origin sits on the ground.
export function animal(ctx, kind, { color, pos, rot = 0, scale = 1, grazing = false } = {}) {
  const a = ANIMALS[kind];
  const [bl, bh, bw] = a.body;
  const legH = a.leg;
  const bodyY = legH + bh / 2;
  const coat = [], dark = [], face = [];
  if (a.wool) coat.push(ball(1, 0, bodyY, 0, { s: [bw / 1.6, bh / 1.6, bl / 1.7] }, 12));
  else coat.push(at(new THREE.CapsuleGeometry(Math.min(bh, bw) / 2, bl - Math.min(bh, bw), 4, 10), 0, bodyY, 0, { rx: Math.PI / 2, s: [bw / Math.min(bh, bw), 1, bh / Math.min(bh, bw)] }));
  if (a.hump) coat.push(ball(0.55, 0, bodyY + bh * 0.45, -0.1, { s: [1, 0.9, 1.3] }));
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const lx = sx * bw * 0.3, lz = sz * bl * 0.36;
    coat.push(cyl(0.07 * (bw + 0.3), 0.05 * (bw + 0.3), legH, lx, legH / 2, lz, {}, 6));
    dark.push(cyl(0.06 * (bw + 0.3), 0.07 * (bw + 0.3), 0.1, lx, 0.05, lz, {}, 6));
  }
  const tilt = grazing ? -0.5 : a.neckTilt ?? 0.25;
  const neckBase = [0, bodyY + bh * 0.15, bl / 2 - 0.1];
  const neckTop = [0, neckBase[1] + Math.sin(tilt) * a.neck + (grazing ? -0.2 : 0), neckBase[2] + Math.cos(tilt) * a.neck];
  if (grazing) neckTop[1] = Math.max(0.35, neckTop[1] - legH * 0.6);
  coat.push(rod(neckBase, neckTop, Math.min(bh, bw) * 0.32, 8));
  const [hl, hh, hw] = a.head;
  const headAngle = grazing ? 1.1 : 0.35;
  const head = at(new THREE.CapsuleGeometry(hh / 2, hl - hh, 3, 8), 0, 0, 0, { rx: Math.PI / 2 + headAngle, s: [hw / hh, 1, 1] });
  head.translate(neckTop[0], neckTop[1], neckTop[2] + hl * 0.3);
  (a.face ? face : coat).push(head);
  if (a.horns) {
    for (const s of [-1, 1]) {
      dark.push(rod([s * hw * 0.3, neckTop[1] + hh * 0.4, neckTop[2] - 0.05],
        a.back ? [s * hw * 0.6, neckTop[1] + hh * 0.4 + a.horns * 0.7, neckTop[2] - a.horns * 0.7] : [s * (hw * 0.5 + a.horns), neckTop[1] + hh * 0.6 + a.horns * 0.4, neckTop[2]], 0.04 + a.horns * 0.04, 5));
    }
  }
  if (a.ears) for (const s of [-1, 1]) coat.push(at(new THREE.ConeGeometry(0.06, a.ears, 5), s * hw * 0.4, neckTop[1] + hh * 0.5 + a.ears * 0.4, neckTop[2] - 0.05, { rz: -s * 0.3 }));
  if (a.mane) dark.push(rod([0, neckBase[1] + bh * 0.3, neckBase[2] - 0.1], [0, neckTop[1] + 0.15, neckTop[2] - 0.12], 0.08, 5));
  if (a.beard) dark.push(at(new THREE.ConeGeometry(0.05, 0.18, 5), 0, neckTop[1] - hh * 0.6, neckTop[2] + hl * 0.4, { rx: Math.PI }));
  if (a.tail) dark.push(rod([0, bodyY + bh * 0.25, -bl / 2 + 0.05], [0, bodyY - a.tail * 0.7, -bl / 2 - 0.15], 0.05, 5));
  if (a.spots) for (let k = 0; k < 3; k++) dark.push(ball(0.22, (k % 2 ? 1 : -1) * bw * 0.36, bodyY + 0.1, (k - 1) * 0.55, { s: [0.35, 0.9, 1.2] }, 8));
  const g = new THREE.Group();
  const coatColor = color ?? a.color;
  addMesh(g, coat, ctx.kit.toon(coatColor));
  addMesh(g, dark, ctx.kit.toon(a.mane ?? '#3a2a20'));
  addMesh(g, face, ctx.kit.toon(a.face ?? coatColor));
  if (pos) {
    g.position.set(pos[0], ctx.groundHeight(pos[0], pos[1]), pos[1]);
    g.rotation.y = rot;
    g.scale.setScalar(scale);
    ctx.scene.add(g);
    ctx.addCollider({ x: pos[0], z: pos[1], hx: bw * 0.5 * scale, hz: bl * 0.55 * scale, rot, top: g.position.y + bodyY * scale });
  }
  return g;
}

// ---------- trees ----------

// Date palms and fruit trees merged into a few meshes. spots: [[x, z], ...]
export function palms(ctx, spots, { seed = 4, height = [7, 11], trunk = '#8a6a48', frond = ['#4f8a4a', '#5f9a52', '#3f7a46'], dates = '#c8742e' } = {}) {
  const rng = makeRng(seed);
  const trunks = [], fronds = frond.map(() => []), fruit = [];
  for (const [x, z] of spots) {
    const y = ctx.terrainHeight(x, z) - 0.2;
    const h = between(rng, height);
    const lean = rng() * Math.PI * 2, bend = 0.6 + rng() * 1.6;
    const pts = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      pts.push([x + Math.sin(lean) * bend * t * t, y + h * t, z + Math.cos(lean) * bend * t * t]);
    }
    trunks.push(curveTube(pts, 0.24, 10, 6));
    const top = pts[5];
    const n = 9 + Math.floor(rng() * 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rng() * 0.4;
      const len = 3 + rng() * 1.2;
      const leaf = new THREE.ConeGeometry(0.9, len, 4, 1);
      leaf.scale(1, 1, 0.22);
      leaf.translate(0, len / 2, 0);
      leaf.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(1.35 + rng() * 0.5, a, 0, 'YXZ')));
      leaf.translate(top[0], top[1], top[2]);
      fronds[Math.floor(rng() * frond.length)].push(leaf);
    }
    for (let k = 0; k < 4; k++) fruit.push(ball(0.28, top[0] + Math.sin(k * 1.6) * 0.45, top[1] - 0.5, top[2] + Math.cos(k * 1.6) * 0.45, {}, 7));
    ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: y + h });
  }
  addMesh(ctx.scene, trunks, ctx.kit.toon(trunk, { map: plankTexture() }));
  fronds.forEach((list, i) => addMesh(ctx.scene, list, ctx.kit.toon(frond[i], { side: THREE.DoubleSide })));
  addMesh(ctx.scene, fruit, ctx.kit.toon(dates));
}

// Round-crowned trees, optionally hung with fruit.
export function leafyTrees(ctx, spots, { seed = 8, height = [5, 9], trunk = '#6b4a33', leaves = ['#3e8e6e', '#4f9a5a', '#5f9e4a'], fruit = null, fruitCount = 10 } = {}) {
  const rng = makeRng(seed);
  const trunks = [], crowns = leaves.map(() => []), fruits = [];
  for (const [x, z] of spots) {
    const y = ctx.terrainHeight(x, z) - 0.2;
    const h = between(rng, height);
    const r = h * 0.38;
    trunks.push(cyl(0.18 * h / 6, 0.32 * h / 6, h * 0.75, x, y + h * 0.375, z, {}, 7));
    const puffs = 3 + Math.floor(rng() * 3);
    for (let k = 0; k < puffs; k++) {
      const a = (k / puffs) * Math.PI * 2 + rng();
      const d = k === 0 ? 0 : r * 0.6;
      const cs = r * (k === 0 ? 1 : 0.75);
      crowns[Math.floor(rng() * leaves.length)].push(ball(cs, x + Math.sin(a) * d, y + h * 0.8 + (k === 0 ? r * 0.3 : 0), z + Math.cos(a) * d, { s: [1, 0.8, 1] }, 10));
    }
    if (fruit) {
      for (let k = 0; k < fruitCount; k++) {
        const a = rng() * Math.PI * 2, e = (rng() - 0.3) * 1.2;
        fruits.push(ball(0.16 + rng() * 0.06, x + Math.sin(a) * Math.cos(e) * r * 1.02, y + h * 0.8 + Math.sin(e) * r * 0.8, z + Math.cos(a) * Math.cos(e) * r * 1.02, {}, 6));
      }
    }
    ctx.addCollider({ x, z, hx: 0.4, hz: 0.4, rot: 0, top: y + h });
  }
  addMesh(ctx.scene, trunks, ctx.kit.toon(trunk));
  crowns.forEach((list, i) => addMesh(ctx.scene, list, ctx.kit.toon(leaves[i])));
  if (fruit) addMesh(ctx.scene, fruits, ctx.kit.toon(fruit), { cast: false });
}

// Scatter points in a ring or rect, skipping blocked places.
export function scatter(ctx, rng, n, { center = [0, 0], ring = null, rect = null, reject = () => false, margin = 2 }) {
  const out = [];
  for (let tries = 0; out.length < n && tries < n * 40; tries++) {
    let x, z;
    if (ring) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(between(rng, [ring[0] ** 2, ring[1] ** 2]));
      x = center[0] + Math.sin(a) * r;
      z = center[1] + Math.cos(a) * r;
    } else {
      x = center[0] + (rng() - 0.5) * rect[0];
      z = center[1] + (rng() - 0.5) * rect[1];
    }
    if (reject(x, z) || ctx.blocked(x, z, margin)) continue;
    if (out.some(([px, pz]) => Math.hypot(px - x, pz - z) < margin * 1.5)) continue;
    out.push([x, z]);
  }
  return out;
}

// A figure placed by hand: adds arms, optional rope bindings, beard or tool.
export function person(ctx, colors, { pos: [x, z], face, scale = 1, glow = 0, y = null, kneel = false }) {
  const fig = makeFigure(colors, ctx.kit, { glow });
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  fig.scale.set(scale, scale * (kneel ? 0.62 : 1), scale);
  ctx.scene.add(fig);
  ctx.exclude({ kind: 'circle', x, z, r: 0.8 });
  return fig;
}

// Crates, jars and bundles for camps and decks.
export function cargo(ctx, spots, { seed = 12, colors = ['#a87b4f', '#8c5a3c', '#c8a97a'], jar = '#b5683b', y = null } = {}) {
  const rng = makeRng(seed);
  const boxes = [], jars = [];
  for (const [x, z] of spots) {
    const gy = y ?? ctx.groundHeight(x, z);
    if (rng() < 0.5) {
      const s = 0.5 + rng() * 0.4;
      boxes.push(boxGeo(s * 1.3, s, s, [x, gy + s / 2, z], { rotY: rng() * 3 }));
    } else {
      const g = new THREE.LatheGeometry([[0.001, 0], [0.22, 0.05], [0.3, 0.35], [0.22, 0.7], [0.1, 0.78], [0.13, 0.86], [0.001, 0.86]].map(([r, h]) => new THREE.Vector2(r, h)), 9);
      g.translate(x, gy, z);
      jars.push(g);
    }
  }
  addMesh(ctx.scene, boxes, ctx.kit.toon(pick(rng, colors), { map: plankTexture() }));
  addMesh(ctx.scene, jars, ctx.kit.toon(jar));
}

// ---------- Gospel scene helpers ----------

export const JUDEANS = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#e6d8b8', '#9c6b4e', '#bfa27a', '#7a6a52', '#b8a58a', '#6f7f6a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#4f6a80', '#7a4a5a'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#d9c7a3', '#b5523b', '#c8a97a', '#4f6a80', '#efe3c2'],
};

export const JESUS = { robe: '#f6f1e4', mantle: '#b5523b', skin: '#b07a50', hair: '#4a2e1c', sash: '#e9dcc0' };

let glowTex = null;
export function glow(ctx, [x, y, z], size, color, opacity = 0.7, pulse = 0.04) {
  glowTex ??= glowTexture();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.layers.set(FX_LAYER);
  ctx.scene.add(s);
  if (pulse) ctx.onFrame((t) => s.scale.setScalar(size * (1 + Math.sin(t * 1.3 + x) * pulse)));
  return s;
}

// A hand-placed figure. arms: [spread, forward] in radians. seated squashes the body like the crowd's kneel.
export function figure(ctx, colors, { pos: [x, z], face, yaw, y = null, scale = 1, glow: g = 0, seated = false, arms, clear = 0.9 }) {
  const fig = makeFigure(arms ? { ...colors, arms } : colors, ctx.kit, { glow: g });
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.rotation.y = yaw ?? (face ? Math.atan2(face[0] - x, face[1] - z) : 0);
  fig.scale.set(scale, scale * (seated ? 0.62 : 1), scale);
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

// Flat-roofed stone or mud-brick house with a door on its local +z side.
export function house(ctx, { pos: [x, z], size: [w, d], h = 3.2, rot = 0, color = '#d9c49a', roof = '#9a7a52', door = '#2b1a12', stairs = false, seed = 1 }) {
  const g = group(ctx, x, z, rot, ctx.terrainHeight(x, z) - 0.3);
  const walls = [boxGeo(w, h + 0.3, d, [0, (h + 0.3) / 2, 0], { uv: { su: 3 } })];
  const top = [boxGeo(w + 0.3, 0.25, d + 0.3, [0, h + 0.42, 0]), boxGeo(w + 0.3, 0.35, 0.18, [0, h + 0.7, d / 2 + 0.06]), boxGeo(w + 0.3, 0.35, 0.18, [0, h + 0.7, -d / 2 - 0.06])];
  const dark = [boxGeo(1.1, 2.0, 0.06, [(seed % 3 - 1) * w * 0.2, 1.3, d / 2 + 0.02]), boxGeo(0.5, 0.45, 0.06, [w * 0.3, h * 0.72, d / 2 + 0.02])];
  if (stairs) for (let k = 0; k < 8; k++) walls.push(boxGeo(0.9, (k + 1) * (h / 8), 0.5, [w / 2 + 0.45, ((k + 1) * (h / 8)) / 2 + 0.3, d / 2 - 0.4 - k * 0.5]));
  addMesh(g, walls, ctx.kit.stoneMat(color));
  addMesh(g, top, ctx.kit.toon(roof));
  addMesh(g, dark, ctx.kit.toon(door), { cast: false });
  ctx.addCollider({ x, z, hx: w / 2 + (stairs ? 0.9 : 0), hz: d / 2, rot, top: g.position.y + h + 0.5 });
  return g;
}

const JAR_PROFILE = [[0.001, 0], [0.3, 0.02], [0.4, 0.3], [0.42, 0.7], [0.36, 1.0], [0.3, 1.08], [0.34, 1.14], [0.3, 1.16], [0.24, 1.0], [0.001, 0.98]];
export function jarGeo(scale = 1, x = 0, y = 0, z = 0) {
  const g = new THREE.LatheGeometry(JAR_PROFILE.map(([r, h]) => new THREE.Vector2(r * scale, h * scale)), 12);
  g.translate(x, y, z);
  return g;
}

// Large stone water jars with a dark water disc inside each mouth.
export function stoneJars(ctx, spots, { color = '#d8ccb4', water = '#3f8ea0', scale = 1, y = null, collide = true } = {}) {
  const jars = [], wet = [];
  for (const [x, z] of spots) {
    const gy = y ?? ctx.groundHeight(x, z);
    jars.push(jarGeo(scale, x, gy, z));
    wet.push(cyl(0.26 * scale, 0.26 * scale, 0.02, x, gy + 1.04 * scale, z, {}, 12));
    if (collide) ctx.addCollider({ x, z, hx: 0.4 * scale, hz: 0.4 * scale, rot: 0, top: gy + 1.16 * scale });
    ctx.exclude({ kind: 'circle', x, z, r: 0.6 * scale });
  }
  addMesh(ctx.scene, jars, ctx.kit.stoneMat(color));
  return addMesh(ctx.scene, wet, ctx.kit.toon(water), { cast: false });
}

// Low table with cloth, bread and cups. size: [w, d].
export function table(ctx, { pos: [x, z], size: [w, d] = [4, 1.2], rot = 0, wood = '#7a5636', cloth = '#efe3c2', food = '#c8912e', cup = '#b5683b', h = 0.75, seed = 3 }) {
  const rng = makeRng(seed);
  const g = group(ctx, x, z, rot, ctx.groundHeight(x, z));
  const legs = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) legs.push(boxGeo(0.12, h, 0.12, [sx * (w / 2 - 0.15), h / 2, sz * (d / 2 - 0.12)]));
  legs.push(boxGeo(w, 0.08, d, [0, h, 0]));
  addMesh(g, legs, ctx.kit.toon(wood, { map: plankTexture() }));
  addMesh(g, [boxGeo(w + 0.1, 0.03, d + 0.1, [0, h + 0.055, 0]), boxGeo(w + 0.1, 0.35, 0.02, [0, h - 0.1, d / 2 + 0.06]), boxGeo(w + 0.1, 0.35, 0.02, [0, h - 0.1, -d / 2 - 0.06])], ctx.kit.toon(cloth));
  const bread = [], cups = [];
  const n = Math.round(w * 2);
  for (let i = 0; i < n; i++) {
    const lx = -w / 2 + 0.3 + (i / Math.max(1, n - 1)) * (w - 0.6), lz = (rng() - 0.5) * d * 0.6;
    if (rng() < 0.5) bread.push(ball(0.13, lx, h + 0.12, lz, { s: [1.3, 0.6, 1] }, 8));
    else cups.push(cyl(0.06, 0.045, 0.14, lx, h + 0.14, lz, {}, 8));
  }
  addMesh(g, bread, ctx.kit.toon(food));
  addMesh(g, cups, ctx.kit.toon(cup));
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: g.position.y + h + 0.1 });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.2, hz: d / 2 + 0.2, rot });
  return g;
}

// Small open fishing boat along local z, bow at +z. Returns the group; its origin is the waterline.
export function boat(ctx, { pos: [x, z], y = 0, rot = 0, length = 8, beam = 2.4, depth = 1.1, hull = '#7a5032', trim = '#c8912e', inside = '#4a3020', mast = false, sail = '#efe3c2', collide = true }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rot;
  ctx.scene.add(g);
  const shell = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  shell.scale(beam / 2, depth, length / 2);
  const pos = shell.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const zz = pos.getZ(i) / (length / 2);
    pos.setY(i, pos.getY(i) + Math.pow(Math.abs(zz), 3) * 0.45);
  }
  shell.computeVertexNormals();
  shell.translate(0, depth * 0.6, 0);
  addMesh(g, [shell], ctx.kit.toon(hull, { map: plankTexture(), side: THREE.DoubleSide }));
  const rim = new THREE.TorusGeometry(1, 0.08, 6, 32);
  rim.rotateX(Math.PI / 2);
  rim.scale(beam / 2, 1, length / 2);
  const rp = rim.attributes.position;
  for (let i = 0; i < rp.count; i++) {
    const zz = rp.getZ(i) / (length / 2);
    rp.setY(i, rp.getY(i) + Math.pow(Math.abs(zz), 3) * 0.45);
  }
  rim.computeVertexNormals();
  rim.translate(0, depth * 0.6, 0);
  const trims = [rim];
  for (const bz of [-length * 0.22, length * 0.15]) trims.push(boxGeo(beam * 0.92, 0.08, 0.35, [0, depth * 0.45, bz]));
  addMesh(g, trims, ctx.kit.toon(trim));
  const floor = new THREE.CircleGeometry(1, 20);
  floor.rotateX(-Math.PI / 2);
  floor.scale(beam / 2 * 0.8, 1, length / 2 * 0.78);
  floor.translate(0, depth * 0.05, 0);
  addMesh(g, [floor], ctx.kit.toon(inside), { cast: false });
  if (mast) {
    addMesh(g, [cyl(0.07, 0.09, 6, 0, depth * 0.6 + 3, length * 0.12, {}, 6), cyl(0.05, 0.05, 4.2, 0, depth * 0.6 + 5.4, length * 0.12, { rz: Math.PI / 2 - 0.25 }, 5)], ctx.kit.toon('#5a3a22'));
    const furl = cyl(0.16, 0.16, 3.8, 0, depth * 0.6 + 5.3, length * 0.12, { rz: Math.PI / 2 - 0.25 }, 7);
    addMesh(g, [furl], ctx.kit.toon(sail));
  }
  if (collide) ctx.addCollider({ x, z, hx: beam / 2, hz: length / 2, rot, top: y + depth * 0.6 + 0.2 });
  return g;
}

// One fish facing local +x.
function fishGeo() {
  const body = new THREE.SphereGeometry(0.5, 8, 6);
  body.scale(1, 0.38, 0.16);
  const tail = new THREE.ConeGeometry(0.2, 0.28, 4);
  tail.rotateZ(Math.PI / 2);
  tail.scale(1, 1, 0.3);
  tail.translate(-0.58, 0, 0);
  return mergeGeometries([body.toNonIndexed(), tail.toNonIndexed()].map((gg) => { gg.deleteAttribute('uv'); return gg; }));
}

// Instanced silver fish. spots: [[x, y, z, size], ...]. flop makes a few twitch each frame.
export function fishes(ctx, spots, { colors = ['#c9d6d8', '#a9bcc0', '#dfe8e4', '#8fa3a8'], seed = 5, flop = 0.2 } = {}) {
  const rng = makeRng(seed);
  const mesh = new THREE.InstancedMesh(fishGeo(), ctx.kit.toon('#ffffff'), spots.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  const base = spots.map(([x, y, z, s = 0.5]) => ({ x, y, z, s, ry: rng() * 6.28, rx: (rng() - 0.5) * 1.2, rz: (rng() - 0.5) * 0.8, ph: rng() * 6.28, live: rng() < flop }));
  const set = (i, t) => {
    const b = base[i];
    const w = b.live ? Math.sin(t * 9 + b.ph) * 0.5 : 0;
    m.compose(new THREE.Vector3(b.x, b.y + (b.live ? Math.max(0, Math.sin(t * 4 + b.ph)) * 0.12 : 0), b.z), q.setFromEuler(e.set(b.rx, b.ry + w, b.rz + w * 0.5)), new THREE.Vector3(b.s, b.s, b.s));
    mesh.setMatrixAt(i, m);
  };
  base.forEach((b, i) => {
    set(i, 0);
    mesh.setColorAt(i, c.set(pick(rng, colors)));
  });
  mesh.castShadow = true;
  ctx.scene.add(mesh);
  const live = base.map((b, i) => (b.live ? i : -1)).filter((i) => i >= 0);
  if (live.length) ctx.onFrame((t) => {
    for (const i of live) set(i, t);
    mesh.instanceMatrix.needsUpdate = true;
  });
  return mesh;
}

let netTex = null;
export function netTexture() {
  if (netTex) return netTex;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(255,255,255,1)';
  g.lineWidth = 3;
  for (let i = 0; i <= 128; i += 16) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke();
  }
  netTex = new THREE.CanvasTexture(cv);
  netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  netTex.colorSpace = THREE.SRGBColorSpace;
  return netTex;
}

export function netMaterial(ctx, color = '#d9c7a3', repeat = [8, 4]) {
  const tex = netTexture().clone();
  tex.needsUpdate = true;
  tex.repeat.set(...repeat);
  return new THREE.MeshToonMaterial({ color, map: tex, alphaTest: 0.4, transparent: false, side: THREE.DoubleSide, gradientMap: ctx.kit.gradient });
}

// Flying doves circling a point.
export function doves(ctx, { center: [cx, cy, cz], count = 8, radius = 4, color = '#fbf7ee', speed = 0.6, size = 1 }) {
  const wing = new THREE.BufferGeometry();
  wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.12, 0.34, 0, -0.04, 0, 0, -0.12], 3));
  wing.computeVertexNormals();
  const body = new THREE.SphereGeometry(0.09, 8, 6);
  body.scale(0.8, 0.8, 1.7);
  const mat = ctx.kit.toon(color, { side: THREE.DoubleSide, emissive: '#8a8478' });
  const birds = [];
  for (let i = 0; i < count; i++) {
    const b = new THREE.Group();
    const r = new THREE.Mesh(wing, mat), l = new THREE.Mesh(wing, mat);
    l.scale.x = -1;
    b.add(new THREE.Mesh(body, mat), r, l);
    b.scale.setScalar(size);
    ctx.scene.add(b);
    birds.push({ b, r, l, ph: (i / count) * Math.PI * 2, rad: radius * (0.6 + (i % 3) * 0.25), h: cy + (i % 4) * 0.6 });
  }
  ctx.onFrame((t) => {
    for (const d of birds) {
      const a = t * speed + d.ph;
      d.b.position.set(cx + Math.cos(a) * d.rad, d.h + Math.sin(t * 1.7 + d.ph) * 0.4, cz + Math.sin(a) * d.rad);
      d.b.rotation.y = -a;
      const f = Math.sin(t * 14 + d.ph) * 0.6;
      d.r.rotation.z = f;
      d.l.rotation.z = -f;
    }
  });
}

// Grass and flower tufts as instanced cones.
export function tufts(ctx, spots, { colors = ['#6c7a42', '#7f9a4a', '#8ea85a'], seed = 3, size = [0.2, 0.45], flowers = 0, flowerColors = ['#f0d36a', '#e8e0f0', '#d06a6a'] } = {}) {
  const rng = makeRng(seed);
  const geo = new THREE.ConeGeometry(0.5, 1, 5);
  geo.translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), spots.length);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  spots.forEach(([x, z], i) => {
    const s = between(rng, size);
    const fl = rng() < flowers;
    m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z) - 0.05, z), new THREE.Quaternion(), new THREE.Vector3(s * (fl ? 0.5 : 0.8), s * (fl ? 0.6 : 1.3), s * (fl ? 0.5 : 0.8)));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.set(pick(rng, fl ? flowerColors : colors)));
  });
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}
