// Joshua 6:12-20: on the seventh day the priests blow the trumpets, the people shout, and the wall falls down flat.
// x is east, z is south. Jericho stands north of the player; the procession circles it.
import { Batch, DAY_STYLE, PALETTE, PRIEST, arkGroup, house, makeRng, palm, shofar } from './lib/ot-19-kit.js';
import { makeFigure } from '../engine/people.js';

const CITY = [0, -42];
const R = 30;
const WALL_H = 9;
const THICK = 2.2;
const SIDES = 22;
const RAHAB = 3;
const MARCH_R = 45;
const FALL_AT = 1.6;

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(24);
  const brick = '#c9a170';
  const brickDark = '#b48c5c';

  // Wall segments, each hinged at its outer foot so it can fall outward.
  const segs = [];
  const baseY = ctx.terrainHeight(...CITY) - 0.3;
  for (let i = 0; i < SIDES; i++) {
    const a0 = (i / SIDES) * Math.PI * 2, a1 = ((i + 1) / SIDES) * Math.PI * 2;
    const ax = CITY[0] + Math.sin(a0) * R, az = CITY[1] + Math.cos(a0) * R;
    const bx = CITY[0] + Math.sin(a1) * R, bz = CITY[1] + Math.cos(a1) * R;
    let tx = bx - ax, tz = bz - az;
    const L = Math.hypot(tx, tz) + 0.4;
    tx /= L; tz /= L;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    let nx = -tz, nz = tx;
    if (nx * (mx - CITY[0]) + nz * (mz - CITY[1]) < 0) { tx = -tx; tz = -tz; nx = -nx; nz = -nz; }
    const yaw = -Math.atan2(tz, tx);
    const hinge = new THREE.Group();
    hinge.position.set(mx + nx * THICK / 2, baseY, mz + nz * THICK / 2);
    hinge.rotation.y = yaw;
    const leaf = new THREE.Group();
    hinge.add(leaf);
    const geos = [new THREE.BoxGeometry(L, WALL_H, THICK).translate(0, WALL_H / 2, -THICK / 2)];
    const n = Math.floor(L / 1.7);
    for (let k = 0; k < n; k++) geos.push(new THREE.BoxGeometry(0.85, 0.9, THICK).translate(-L / 2 + (k + 0.5) * (L / n), WALL_H + 0.45, -THICK / 2));
    const band = new THREE.BoxGeometry(L + 0.05, 0.5, THICK + 0.1).translate(0, WALL_H - 1.2, -THICK / 2);
    for (const g of geos) {
      const mesh = new THREE.Mesh(g, ctx.kit.toon(i % 2 ? brick : '#c49a68'));
      mesh.castShadow = mesh.receiveShadow = true;
      leaf.add(mesh);
    }
    const bm = new THREE.Mesh(band, ctx.kit.toon(brickDark));
    leaf.add(bm);
    ctx.scene.add(hinge);
    const collider = { x: mx, z: mz, hx: L / 2, hz: THICK / 2, rot: yaw, top: baseY + WALL_H + 1 };
    ctx.addCollider(collider);
    ctx.exclude({ kind: 'rect', x: mx, z: mz, hx: L / 2 + 0.5, hz: THICK / 2 + 1, rot: yaw });
    segs.push({ i, hinge, leaf, collider, nx, nz, mx, mz, L, yaw, delay: rng() * 0.9, fallen: false });
  }

  // Rahab's house on the wall, a scarlet cord hanging from its window.
  const rs = segs[RAHAB];
  const rh = new THREE.Group();
  rh.position.set(0, WALL_H, -THICK / 2 - 0.4);
  rs.leaf.add(rh);
  const rmesh = (geo, color) => {
    const m = new THREE.Mesh(geo, ctx.kit.toon(color));
    m.castShadow = true;
    rh.add(m);
    return m;
  };
  rmesh(new THREE.BoxGeometry(4.5, 3.2, 3.6).translate(0, 1.6, 0), '#d8b888');
  rmesh(new THREE.BoxGeometry(4.8, 0.3, 3.9).translate(0, 3.3, 0), '#b48c5c');
  rmesh(new THREE.BoxGeometry(0.8, 0.9, 0.1).translate(0.6, 1.9, 1.81), '#2b1a12');
  rmesh(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 5).translate(0.6, 1.6 - 3.0, 2.05), '#d0202a');
  rmesh(new THREE.BoxGeometry(0.2, 0.2, 0.5).translate(0.6, 1.55, 1.95), '#d0202a');

  // Houses packed inside the walls.
  const taken = [];
  for (let k = 0; k < 140; k++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * (R - 6);
    const x = CITY[0] + Math.sin(a) * r, z = CITY[1] + Math.cos(a) * r;
    const w = 4 + rng() * 3, d = 4 + rng() * 3;
    if (taken.some(([tx, tz, tr]) => Math.hypot(tx - x, tz - z) < tr + Math.max(w, d) * 0.55)) continue;
    taken.push([x, z, Math.max(w, d) * 0.55]);
    house(b, ctx, { pos: [x, z], size: [w, d], height: 3 + rng() * 4 + (r < 8 ? 3 : 0), rot: Math.floor(rng() * 4) * Math.PI / 2 + (rng() - 0.5) * 0.2, color: ['#d8b888', '#cfa878', '#e0c49a', '#c49a68'][k % 4], trim: brickDark, upper: rng() < 0.3 });
  }
  // Palms of the city of palm trees, outside the walls.
  for (let k = 0; k < 40; k++) {
    const a = rng() * Math.PI * 2, r = 70 + rng() * 80;
    const x = CITY[0] + Math.sin(a) * r, z = CITY[1] + Math.cos(a) * r;
    if (z > 0 && Math.abs(x) < 40) continue;
    if (ctx.blocked(x, z, 2)) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 4, lean: 0.1 + rng() * 0.2, dir: rng() * 6, seed: k + 3 });
  }
  b.flush();

  // Dust thrown up as the wall falls.
  const dustN = SIDES * 5;
  const dust = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), ctx.kit.toon('#e2c89c', { emissive: '#5a4630' }), dustN);
  dust.frustumCulled = false;
  dust.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ctx.scene.add(dust);
  const puffs = [];
  for (const s of segs) {
    if (s.i === RAHAB) continue;
    for (let k = 0; k < 5; k++) {
      const along = (rng() - 0.5) * s.L, out = 2 + rng() * 9;
      const tx = Math.cos(s.yaw), tz = -Math.sin(s.yaw);
      puffs.push({ seg: s, x: s.mx + tx * along + s.nx * out, z: s.mz + tz * along + s.nz * out, size: 0.9 + rng() * 1.3, ph: rng() * 0.6 });
    }
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let k = 0; k < dustN; k++) dust.setMatrixAt(k, hidden);

  ctx.onFrame((t) => {
    for (const s of segs) {
      if (s.i === RAHAB) continue;
      const k = THREE.MathUtils.clamp((t - FALL_AT - s.delay) / 1.4, 0, 1);
      s.leaf.rotation.x = (Math.PI / 2 - 0.04) * k * k;
      s.leaf.position.y = -k * k * 0.3;
      s.leaf.scale.z = 1 - 0.6 * k * k;
      if (k >= 1 && !s.fallen) {
        s.fallen = true;
        Object.assign(s.collider, { x: s.mx + s.nx * WALL_H / 2, z: s.mz + s.nz * WALL_H / 2, hz: WALL_H / 2 + 0.5, top: baseY + 0.7, walkable: true });
      }
    }
    puffs.forEach((p, k) => {
      const life = (t - FALL_AT - p.seg.delay - 0.9 - p.ph) / 4.5;
      if (life <= 0 || life >= 1) return dust.setMatrixAt(k, hidden);
      const s = p.size * Math.sin(Math.PI * life) * (0.6 + life);
      dust.setMatrixAt(k, m4.compose(v.set(p.x + p.seg.nx * life * 6, baseY + 0.6 + life * 3.5, p.z + p.seg.nz * life * 6), q.identity(), sc.set(s, s * 0.75, s)));
    });
    dust.instanceMatrix.needsUpdate = true;
  });

  // Seven priests with rams' horns going before the ark, which four priests bear, all moving round the city.
  const marchers = [];
  const addMarcher = (obj, offset, side = 0) => {
    ctx.scene.add(obj);
    marchers.push({ obj, offset, side });
  };
  for (let k = 0; k < 7; k++) {
    const fig = makeFigure({ ...PRIEST, arms: [0.25, 1.35] }, ctx.kit);
    shofar(ctx, fig);
    addMarcher(fig, 2.2 + k * 1.3);
  }
  const ark = new THREE.Group();
  const box = arkGroup(ctx);
  box.position.y = 1.05;
  box.rotation.y = Math.PI / 2;
  ark.add(box);
  for (const [lx, lz] of [[-0.42, -1.4], [0.42, -1.4], [-0.42, 1.4], [0.42, 1.4]]) {
    const f = makeFigure({ ...PRIEST, arms: [0.15, 0.35] }, ctx.kit);
    f.position.set(lx * 1.6, 0, lz);
    ark.add(f);
  }
  addMarcher(ark, 0);
  const ARC0 = 0.25;
  ctx.onFrame((t) => {
    const walking = t < FALL_AT;
    const base = ARC0 + Math.min(t, FALL_AT) * 0.02;
    for (const mk of marchers) {
      const a = base + mk.offset / MARCH_R;
      const x = CITY[0] + Math.sin(a) * MARCH_R, z = CITY[1] + Math.cos(a) * MARCH_R;
      mk.obj.position.set(x, ctx.terrainHeight(x, z) + (walking ? Math.abs(Math.sin(t * 6 + mk.offset)) * 0.06 : 0), z);
      mk.obj.rotation.y = a + Math.PI / 2;
    }
  });
  ctx.exclude({ kind: 'circle', x: CITY[0] + Math.sin(ARC0 + 0.2) * MARCH_R, z: CITY[1] + Math.cos(ARC0 + 0.2) * MARCH_R, r: 7 });
}

export default {
  title: 'Joshua 6:12-20: The walls of Jericho',
  subtitle: 'The seventh day. The people shout with a great shout, and the wall falls down flat',
  seed: 24,
  style: DAY_STYLE,
  sky: { zenith: '#3a7fa8', mid: '#86b8c8', horizon: '#f2dcae', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [0.5, 0.5, -0.7] },
  sun: { dir: [0.55, 0.75, 0.35], color: '#fff2d8', intensity: 2.7, hemi: { sky: '#dcecf0', ground: '#b98a5a', intensity: 1.1 }, shadowSize: 80 },
  ground: {
    size: 1600, segments: 280, flatRadius: 190, hillHeight: 50, undulation: 0.2,
    plaza: { center: CITY, size: [52, 52] },
    colors: { sand: '#d8b47a', dirt: '#c49a62', grass: '#9aa466', grassDark: '#7a8a52', plaza: '#d4b688', plazaLine: '#c4a070', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a89a6a' },
  },
  mountains: { count: 30, distance: [480, 780], height: [60, 140], widthRatio: [1.8, 2.8], colors: ['#b8957a', '#a88570', '#9c8a74', '#b4a684'] },
  objects: [
    { type: 'stones', count: 300, ring: [36, 160], size: [0.12, 0.4], colors: ['#c9a87a', '#b89a70'] },
  ],
  custom,
  clouds: { layers: [{ count: 26, distance: [400, 800], height: [90, 180], size: [40, 80], color: '#fff6e6', shade: '#7f8aa8' }] },
  crowd: {
    seed: 24,
    minSpacing: 0.72,
    facing: CITY,
    colors: { ...PALETTE, robes: [...PALETTE.robes, '#8a7a62', '#6a5a48'], wraps: ['#8a8a8a', '#a8a8a0', '#c8912e', '#b5523b'] },
    aisles: [{ from: [8, 30], to: [7, -4], width: 5 }],
    keepClear: [{ kind: 'circle', x: CITY[0], z: CITY[1], r: MARCH_R + 3 }],
    groups: [
      { center: CITY, radius: [MARCH_R + 4, MARCH_R + 20], angle: [0.62, Math.PI * 2 - 0.08], count: 2200, children: 0, lean: 0.12, facingJitter: 0.2 },
    ],
  },
  player: {
    start: [6, 16],
    lookAt: CITY,
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
