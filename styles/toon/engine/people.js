import * as THREE from 'three';
import { between, inZone, makeRng, pick } from './util.js';

const HEAD_Y = 1.58;
const BODY_TOP = 1.46;

function lathe(points, segments = 10) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
}

// One shared set of part geometries. Every person is these four parts, tinted per instance.
export function personParts() {
  const robe = lathe([[0.001, 0], [0.31, 0], [0.29, 0.25], [0.23, 0.75], [0.2, 1.02], [0.23, 1.28], [0.13, 1.42], [0.001, BODY_TOP]]);
  const mantle = lathe([[0.31, 0.88], [0.29, 1.05], [0.27, 1.24], [0.2, 1.38], [0.1, 1.45], [0.001, 1.47]]);
  const head = new THREE.SphereGeometry(0.125, 12, 9);
  head.translate(0, HEAD_Y, 0);
  const hair = new THREE.SphereGeometry(0.138, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58);
  hair.rotateX(-0.45);
  hair.translate(0, HEAD_Y + 0.01, -0.012);
  return { robe, mantle, head, hair };
}

const tmp = {
  base: new THREE.Matrix4(),
  part: new THREE.Matrix4(),
  out: new THREE.Matrix4(),
  q: new THREE.Quaternion(),
  e: new THREE.Euler(),
};

function partMatrices(x, y, z, yaw, scale, kneel, child, lean) {
  const { base, q, e } = tmp;
  e.set(lean, yaw, 0, 'YXZ');
  base.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e), new THREE.Vector3(scale, scale, scale));
  const bodyY = kneel ? 0.6 : 1;
  const drop = BODY_TOP * (1 - bodyY);
  const body = new THREE.Matrix4().makeScale(kneel ? 1.12 : 1, bodyY, kneel ? 1.12 : 1);
  const hs = child ? 1.3 : 1;
  const head = new THREE.Matrix4()
    .makeTranslation(0, HEAD_Y - drop, 0)
    .multiply(new THREE.Matrix4().makeScale(hs, hs, hs))
    .multiply(new THREE.Matrix4().makeTranslation(0, -HEAD_Y, 0));
  return { body: base.clone().multiply(body), head: base.clone().multiply(head) };
}

export function buildCrowd(spec, ctx) {
  const rng = makeRng(spec.seed ?? 3);
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

  const n = people.length;
  const kit = ctx.kit;
  const meshes = {
    robe: new THREE.InstancedMesh(parts.robe, kit.toon('#ffffff'), n),
    mantle: new THREE.InstancedMesh(parts.mantle, kit.toon('#ffffff'), n),
    head: new THREE.InstancedMesh(parts.head, kit.toon('#ffffff'), n),
    hair: new THREE.InstancedMesh(parts.hair, kit.toon('#ffffff'), n),
  };
  const c = new THREE.Color();
  people.forEach((p, i) => {
    const m = partMatrices(p.x, p.y, p.z, p.yaw, p.scale, p.kneel, p.child, p.lean);
    meshes.robe.setMatrixAt(i, m.body);
    meshes.mantle.setMatrixAt(i, m.body);
    meshes.head.setMatrixAt(i, m.head);
    meshes.hair.setMatrixAt(i, m.head);
    const pal = p.colors;
    const robe = pick(rng, pal.robes);
    meshes.robe.setColorAt(i, c.set(robe));
    meshes.mantle.setColorAt(i, c.set(rng() < 0.3 ? robe : pick(rng, pal.mantles)).multiplyScalar(rng() < 0.3 ? 0.92 : 1));
    meshes.head.setColorAt(i, c.set(pick(rng, pal.skins)));
    meshes.hair.setColorAt(i, c.set(rng() < 0.4 ? pick(rng, pal.wraps) : pick(rng, pal.hair)));
  });
  for (const mesh of Object.values(meshes)) {
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    ctx.scene.add(mesh);
  }
  meshes.hair.castShadow = false;
  return people.length;
}

// A single animated or special figure built from the same parts.
export function makeFigure(colors, kit, { glow = 0 } = {}) {
  const parts = personParts();
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
  if (colors.sash) {
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.035, 6, 16), mat(colors.sash));
    sash.rotation.x = Math.PI / 2;
    sash.position.y = 0.98;
    group.add(sash);
  }
  if (colors.arms) {
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.2, 1.32, 0);
      const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), mat(colors.mantle));
      sleeve.position.y = -0.26;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mat(colors.skin));
      hand.position.y = -0.55;
      shoulder.add(sleeve, hand);
      shoulder.rotation.set(-colors.arms[1], 0, side * colors.arms[0]);
      sleeve.castShadow = true;
      group.add(shoulder);
    }
  }
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
