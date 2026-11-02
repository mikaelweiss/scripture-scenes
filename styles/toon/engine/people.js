import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { between, inZone, makeRng, pick } from './util.js';

const HEAD_Y = 1.58;
const BODY_TOP = 1.46;
// Crowd kneelers sit back on their heels: body height ratio, hip pivot and forward bow.
const KNEEL = 0.6;
const HIP = 0.3;
const BOW = 0.16;

const ROBE = [[0.001, 0], [0.31, 0], [0.29, 0.25], [0.23, 0.75], [0.2, 1.02], [0.23, 1.28], [0.17, 1.37], [0.001, 1.4]];
const MANTLE = [[0.31, 0.88], [0.29, 1.05], [0.275, 1.25], [0.25, 1.335], [0.19, 1.385], [0.085, 1.41], [0.001, 1.415]];

function lathe(points, segments = 10) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
}

function headGeometry() {
  const head = new THREE.SphereGeometry(0.125, 12, 9).translate(0, HEAD_Y, 0);
  const neck = new THREE.CylinderGeometry(0.056, 0.066, 0.16, 10, 1, true).translate(0, HEAD_Y - 0.15, 0);
  return mergeGeometries([head, neck]);
}

function hairGeometry() {
  const hair = new THREE.SphereGeometry(0.138, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56);
  hair.rotateX(-0.38);
  return hair.translate(0, HEAD_Y + 0.012, -0.012);
}

// A head cloth: a cap over the crown whose back falls to the shoulders.
function hoodGeometry() {
  const hood = new THREE.SphereGeometry(0.152, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.62);
  hood.rotateX(-0.5);
  const p = hood.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), z = p.getZ(i);
    if (y < 0 && z < 0) p.setY(i, y * (1 + 1.5 * Math.min(1, -z / 0.12)));
  }
  return hood.translate(0, HEAD_Y + 0.012, -0.012);
}

// Torso over folded legs for a body whose shoulders sit at `k` of standing height.
function foldedRobe(k, bow = 0) {
  const d = BODY_TOP * (1 - k);
  const waist = 1.02 - d;
  const hip = Math.min(HIP, waist - 0.08);
  const torso = lathe([[0.001, 0.08], [0.25, 0.08], [0.26, hip], [0.2, waist], [0.23, 1.28 - d], [0.17, 1.37 - d], [0.001, 1.4 - d]]);
  torso.translate(0, -HIP, 0).rotateX(bow).translate(0, HIP, 0);
  const lap = new THREE.CapsuleGeometry(0.14, 0.34, 3, 8).rotateX(Math.PI / 2).scale(1.85, 1, 1).translate(0, 0.14, 0.1);
  return mergeGeometries([torso, lap]);
}

function bodyParts() {
  return { robe: lathe(ROBE), mantle: lathe(MANTLE), head: headGeometry(), hair: hairGeometry() };
}

// One shared set of part geometries. Every person is these four parts, tinted per instance.
// The extra parts serve crowd kneelers (kneelRobe) and head cloths (hood).
export function personParts() {
  return { ...bodyParts(), kneelRobe: foldedRobe(KNEEL, BOW), hood: hoodGeometry() };
}

const matrix = () => new THREE.Matrix4();
const KNEEL_UPPER = matrix().makeTranslation(0, HIP, 0)
  .multiply(matrix().makeRotationX(BOW))
  .multiply(matrix().makeTranslation(0, -HIP - BODY_TOP * (1 - KNEEL), 0));
const CHILD_HEAD = matrix().makeTranslation(0, HEAD_Y, 0)
  .multiply(matrix().makeScale(1.3, 1.3, 1.3))
  .multiply(matrix().makeTranslation(0, -HEAD_Y, 0));

const tmp = { q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3() };

function partMatrices(x, y, z, yaw, scale, kneel, child, lean) {
  const { q, e, p, s } = tmp;
  e.set(lean, yaw, 0, 'YXZ');
  const body = new THREE.Matrix4().compose(p.set(x, y, z), q.setFromEuler(e), s.set(scale, scale, scale));
  const upper = kneel ? body.clone().multiply(KNEEL_UPPER) : body;
  const head = child ? upper.clone().multiply(CHILD_HEAD) : upper;
  return { body, upper, head };
}

const HAIR_LIFT = new THREE.Color('#7a5238');
const CLOTH_LIFT = new THREE.Color('#f1e7d2');

export function buildCrowd(spec, ctx) {
  const rng = makeRng(spec.seed ?? 3);
  const dress = makeRng((spec.seed ?? 3) + 101);
  const parts = personParts();
  const people = [];
  const cell = spec.minSpacing;
  const grid = new Map();
  const key = (x, z) => `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
  const tooClose = (x, z) => {
    const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      for (const p of grid.get(`${cx + i},${cz + j}`) ?? []) if (Math.hypot(p.x - x, p.z - z) < cell) return true;
    }
    return false;
  };
  const insert = (p) => {
    const k = key(p.x, p.z);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(p);
  };

  for (const g of spec.groups) {
    let placed = 0;
    const [cx, cz] = g.center;
    const area = g.shape === 'rect' ? null : g;
    for (let tries = 0; placed < g.count && tries < g.count * 60; tries++) {
      let x, z;
      if (area) {
        const a = between(rng, g.angle ?? [-Math.PI, Math.PI]);
        const r = Math.sqrt(between(rng, [g.radius[0] ** 2, g.radius[1] ** 2]));
        x = cx + Math.sin(a) * r;
        z = cz + Math.cos(a) * r;
      } else {
        x = cx + (rng() - 0.5) * g.size[0];
        z = cz + (rng() - 0.5) * g.size[1];
      }
      if (tooClose(x, z)) continue;
      if (ctx.blocked(x, z, 0.35)) continue;
      if (!g.insideClear && spec.keepClear?.some((zone) => inZone(zone, x, z))) continue;
      if (ctx.inAisle(x, z, 0.3)) continue;
      const face = g.facing ?? spec.facing;
      const yaw = Math.atan2(face[0] - x, face[1] - z) + (rng() - 0.5) * (g.facingJitter ?? 0.5);
      const child = rng() < (g.children ?? 0);
      const p = {
        x, z, yaw,
        y: ctx.groundHeight(x, z),
        child,
        kneel: rng() < (g.kneel ?? 0),
        scale: child ? between(rng, [0.55, 0.68]) : between(rng, [0.92, 1.08]),
        lean: (g.lean ?? 0.06) * (rng() - 0.3),
        colors: g.colors ?? spec.colors,
      };
      insert(p);
      people.push(p);
      placed++;
    }
  }

  const buckets = { robe: [], kneelRobe: [], mantle: [], head: [], hair: [], hood: [] };
  for (const p of people) {
    const m = partMatrices(p.x, p.y, p.z, p.yaw, p.scale, p.kneel, p.child, p.lean);
    const pal = p.colors;
    const robe = pick(rng, pal.robes);
    buckets[p.kneel ? 'kneelRobe' : 'robe'].push([m.body, new THREE.Color(robe)]);
    buckets.mantle.push([m.upper, new THREE.Color(rng() < 0.3 ? robe : pick(rng, pal.mantles)).multiplyScalar(rng() < 0.3 ? 0.92 : 1)]);
    buckets.head.push([m.head, new THREE.Color(pick(rng, pal.skins))]);
    const wrapped = rng() < 0.4;
    const top = new THREE.Color(wrapped ? pick(rng, pal.wraps) : pick(rng, pal.hair));
    if (dress() < (wrapped ? 0.55 : 0.18)) {
      const cloth = wrapped ? top : new THREE.Color(pick(dress, pal.wraps));
      buckets.hood.push([m.head, cloth.lerp(CLOTH_LIFT, 0.12)]);
    } else {
      buckets.hair.push([m.head, wrapped ? top : top.lerp(HAIR_LIFT, 0.22)]);
    }
  }

  const kit = ctx.kit;
  for (const [name, items] of Object.entries(buckets)) {
    if (!items.length) continue;
    const mesh = new THREE.InstancedMesh(parts[name], kit.toon('#ffffff'), items.length);
    items.forEach(([matrix, color], i) => {
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color);
    });
    mesh.castShadow = name !== 'hair';
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  return people.length;
}

function addArms(parent, [spread, lift], sleeveMat, handMat) {
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.2, 1.32, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), sleeveMat);
    sleeve.position.y = -0.26;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), handMat);
    hand.position.y = -0.55;
    shoulder.add(sleeve, hand);
    shoulder.rotation.set(-lift, 0, side * spread);
    sleeve.castShadow = true;
    parent.add(shoulder);
  }
}

// Geometry for parts of a figure squashed to `k` of its height: the kit squash stays, the shape inside it
// becomes a person folded onto their knees with an unsquashed torso and round head.
const foldCache = new Map();
function foldedParts(k) {
  const key = k.toFixed(2);
  if (!foldCache.has(key)) {
    const unsquash = new THREE.Matrix4().makeScale(1, 1 / k, 1);
    const lower = unsquash.clone().multiply(new THREE.Matrix4().makeTranslation(0, -BODY_TOP * (1 - k), 0));
    foldCache.set(key, {
      robe: foldedRobe(k).applyMatrix4(unsquash),
      mantle: lathe(MANTLE).applyMatrix4(lower),
      head: headGeometry().applyMatrix4(lower),
      hair: hairGeometry().applyMatrix4(lower),
    });
  }
  return foldCache.get(key);
}

let lyingParts = null;
function flatParts() {
  lyingParts ??= {
    robe: lathe(ROBE).scale(1.12, 1, 0.62),
    mantle: lathe(MANTLE).scale(1.1, 1, 0.66),
    pool: new THREE.CylinderGeometry(1, 1, 0.03, 18).rotateX(Math.PI / 2).scale(0.5, 0.62, 1).translate(0, 0.42, 0),
  };
  return lyingParts;
}

const basis = { x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3() };
const ratio = (mesh) => {
  mesh.matrixWorld.extractBasis(basis.x, basis.y, basis.z);
  const sx = basis.x.length(), sy = basis.y.length();
  return sx > 1e-6 && sy > 1e-6 ? sy / sx : 1;
};

// Kits pose figures by transform: a vertical squash means kneeling or sitting, a body tipped flat means lying.
// Each frame the figure reads its own world transform and swaps in matching part shapes.
function adaptPose(group, parts, sash, colors, mat) {
  const standard = Object.fromEntries(Object.entries(parts).map(([k, m]) => [k, m.geometry]));
  let state = 'stand';
  let extras = null;
  const apply = (next, k, kh) => {
    state = next;
    const lying = next === 'lie' || next === 'prone';
    const fold = next.startsWith('fold') ? foldedParts(k) : null;
    const flat = lying ? flatParts() : null;
    const headFold = fold && kh < 0.9 ? foldedParts(kh) : null;
    parts.robe.geometry = fold?.robe ?? flat?.robe ?? standard.robe;
    parts.mantle.geometry = fold?.mantle ?? flat?.mantle ?? standard.mantle;
    parts.head.geometry = headFold?.head ?? standard.head;
    parts.hair.geometry = headFold?.hair ?? standard.hair;
    sash?.scale.set(lying ? 1.12 : 1, lying ? 0.62 : 1, 1);
    if (lying && !extras) {
      extras = new THREE.Group();
      if (!colors.arms) addArms(extras, [0.55, 0], mat(colors.mantle), mat(colors.skin));
      const pool = new THREE.Mesh(flat.pool, mat(colors.robe));
      pool.name = 'pool';
      extras.add(pool);
      extras.traverse((o) => o.isMesh && (o.castShadow = true));
      group.add(extras);
    }
    if (extras) {
      extras.visible = lying;
      const down = next === 'prone' ? 1 : -1;
      extras.position.z = -down * 0.08;
      extras.getObjectByName('pool').position.z = down * 0.25;
      extras.updateMatrixWorld(true);
    }
  };
  group.updateMatrixWorld = function (force) {
    THREE.Group.prototype.updateMatrixWorld.call(this, force);
    parts.robe.matrixWorld.extractBasis(basis.x, basis.y, basis.z);
    const sy = basis.y.length();
    if (sy < 1e-6) return;
    const up = basis.y.y / sy;
    const k = ratio(parts.robe);
    let next = 'stand', kq = 1, khq = 1;
    if (Math.abs(up) < 0.52) next = basis.z.y >= 0 ? 'lie' : 'prone';
    else if (k < 0.86 && up > 0.9) {
      kq = Math.round(k * 50) / 50;
      khq = Math.round(ratio(parts.head) * 50) / 50;
      next = `fold:${kq}:${khq}`;
    }
    if (next !== state) apply(next, kq, khq);
  };
}

// A single animated or special figure built from the same parts.
export function makeFigure(colors, kit, { glow = 0 } = {}) {
  const parts = bodyParts();
  const group = new THREE.Group();
  const emissive = (hex) => new THREE.Color(hex).multiplyScalar(glow);
  const mat = (hex) => kit.toon(hex, { emissive: emissive(hex) });
  const robe = new THREE.Mesh(parts.robe, mat(colors.robe));
  const mantle = new THREE.Mesh(parts.mantle, mat(colors.mantle));
  const head = new THREE.Mesh(parts.head, mat(colors.skin));
  const hair = new THREE.Mesh(parts.hair, mat(colors.hair));
  for (const m of [robe, mantle, head, hair]) {
    m.castShadow = true;
    group.add(m);
  }
  let sash = null;
  if (colors.sash) {
    sash = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.035, 6, 16), mat(colors.sash));
    sash.rotation.x = Math.PI / 2;
    sash.position.y = 0.98;
    group.add(sash);
  }
  if (colors.arms) addArms(group, colors.arms, mat(colors.mantle), mat(colors.skin));
  adaptPose(group, { robe, mantle, head, hair }, sash, colors, mat);
  return group;
}

export function buildFigures(list, ctx) {
  for (const f of list) {
    const fig = makeFigure(f.colors, ctx.kit, { glow: f.glow ?? 0 });
    const [x, z] = f.pos;
    fig.position.set(x, ctx.groundHeight(x, z), z);
    fig.scale.setScalar(f.scale ?? 1);
    if (f.facing) fig.rotation.y = Math.atan2(f.facing[0] - x, f.facing[1] - z);
    ctx.scene.add(fig);
    ctx.exclude({ kind: 'circle', x, z, r: f.clearRadius ?? 1.2 });
  }
}
