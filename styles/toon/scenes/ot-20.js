// Exodus 19-20: the Lord descends on Sinai in fire. The mount smokes and quakes; Israel stands afar off.
// x is east, z is south. The mountain fills the north; the camp spreads south of the bounds.
import { AARON, Batch, MOSES, PALETTE, DAY_STYLE, camp, glow, lightning, makeRng, person, smoke } from './lib/ot-19-kit.js';

const PEAK = [0, -470];
const BOUNDS_Z = -46;

function mountain(ctx) {
  const { THREE } = ctx;
  const rng = makeRng(20);
  const geo = new THREE.ConeGeometry(180, 140, 28, 10);
  geo.translate(0, 70, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (y > 137) continue;
    const a = Math.atan2(z, x);
    const k = 1 + 0.16 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 7 + y * 0.03) + (rng() - 0.5) * 0.12;
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
    if (y > 0.5) pos.setY(i, y + (rng() - 0.5) * 10);
  }
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  const mesh = new THREE.Mesh(flat, ctx.kit.toon('#7d5e4c'));
  mesh.position.set(PEAK[0], ctx.terrainHeight(...PEAK) - 6, PEAK[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI / 2 * (i % 2 ? 1 : -1) + (rng() - 0.5) * 0.9;
    const r = 170 + rng() * 60;
    const s = 35 + rng() * 35;
    const g = new THREE.ConeGeometry(s, s * 1.3, 9, 2).translate(0, s * 0.65, 0).toNonIndexed();
    g.computeVertexNormals();
    const foot = new THREE.Mesh(g, ctx.kit.toon(i % 2 ? '#8a6a52' : '#73574a'));
    const x = PEAK[0] + Math.sin(a) * r, z = PEAK[1] + Math.cos(a) * r;
    foot.position.set(x, ctx.terrainHeight(x, z) - 4, z);
    foot.receiveShadow = true;
    ctx.scene.add(foot);
  }
  ctx.addCollider({ x: PEAK[0], z: PEAK[1], hx: 170, hz: 170, rot: 0, top: 400 });
  // The mountain trembles.
  ctx.onFrame((t) => {
    const q = Math.max(0, Math.sin(t * 0.7)) ** 6;
    mesh.position.x = PEAK[0] + Math.sin(t * 37) * 0.6 * q;
    mesh.rotation.z = Math.sin(t * 29) * 0.002 * q;
  });
  return mesh.position.y + 140;
}

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(21);
  const top = mountain(ctx);

  // Fire on the summit and the thick cloud and smoke of a furnace.
  glow(ctx, { pos: [PEAK[0], top - 5, PEAK[1] + 110], size: 170, color: '#ff8a3a', opacity: 0.7, pulse: 0.08 });
  glow(ctx, { pos: [PEAK[0], top - 15, PEAK[1] + 120], size: 80, color: '#ffd080', opacity: 0.75, pulse: 0.12 });
  smoke(ctx, { pos: [PEAK[0], top + 12, PEAK[1] - 20], count: 46, size: [26, 50], rise: 170, spread: 50, drift: [60, 20], speed: 0.025, color: '#6a6270', shade: '#4a2418', seed: 2 });
  smoke(ctx, { pos: [PEAK[0], top - 60, PEAK[1] - 60], count: 26, size: [22, 40], rise: 90, spread: 120, drift: [30, 10], speed: 0.03, color: '#8a7e86', shade: '#3a3038', seed: 3 });
  const fireLight = new THREE.PointLight('#ff9a4a', 120, 900, 1);
  fireLight.position.set(PEAK[0], top + 10, PEAK[1] + 40);
  ctx.scene.add(fireLight);
  lightning(ctx, { top: [PEAK[0], top + 120, PEAK[1] + 20], bottom: [PEAK[0], top - 20, PEAK[1] + 30], count: 4, light: { color: '#e8f0ff', intensity: 260, distance: 1200 } });
  const flameGeo = new THREE.ConeGeometry(12, 55, 7).translate(0, 27, 0);
  const flamesOuter = new THREE.InstancedMesh(flameGeo, ctx.kit.basic('#f08a2c'), 7);
  const flamesInner = new THREE.InstancedMesh(flameGeo, ctx.kit.basic('#ffe08a'), 7);
  ctx.scene.add(flamesOuter, flamesInner);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const tongues = Array.from({ length: 7 }, (_, i) => ({ x: PEAK[0] + (i - 3) * 9, z: PEAK[1] + 34 + rng() * 6, y: top - 30 - Math.abs(i - 3) * 7, ph: rng() * 6 }));
  ctx.onFrame((t) => {
    tongues.forEach((f, i) => {
      const k = 0.7 + 0.3 * Math.sin(t * 6 + f.ph) * Math.sin(t * 3.7 + f.ph);
      flamesOuter.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z), q.identity(), s.set(1, k, 1)));
      flamesInner.setMatrixAt(i, m.compose(v.set(f.x, f.y, f.z + 2), q.identity(), s.set(0.5, k * 0.65, 0.5)));
    });
    flamesOuter.instanceMatrix.needsUpdate = flamesInner.instanceMatrix.needsUpdate = true;
  });

  // Bounds set round about the mount: a line of stones and stakes.
  for (let x = -110; x <= 110; x += 2.5) {
    const z = BOUNDS_Z + Math.abs(x) * 0.08;
    const y = ctx.terrainHeight(x, z);
    b.add('#a89880', new THREE.DodecahedronGeometry(0.45, 0).translate(x, y + 0.2, z));
    if (Math.round(x / 2.5) % 3 === 0) b.add('#6b4a33', new THREE.CylinderGeometry(0.07, 0.09, 1.6, 5).translate(x, y + 0.8, z));
  }
  ctx.exclude({ kind: 'rect', x: 0, z: BOUNDS_Z, hx: 120, hz: 2 });
  ctx.addCollider({ x: 0, z: BOUNDS_Z - 1, hx: 120, hz: 0.5, rot: 0, top: ctx.terrainHeight(0, BOUNDS_Z) + 1.2 });

  // The camp behind the people.
  camp(b, ctx, { center: [0, 30], ring: [30, 170], count: 300, seed: 201, face: PEAK, keepOut: [{ kind: 'rect', x: 0, z: 0, hx: 70, hz: 40 }, { kind: 'rect', x: 0, z: -200, hx: 400, hz: 160 }] });
  b.flush();

  // Moses and Aaron at the bounds, nearest the mount.
  person(ctx, { pos: [-1, BOUNDS_Z + 4], face: PEAK, scale: 1.1, colors: { ...MOSES, arms: [0.6, 1.4] } });
  person(ctx, { pos: [-3, BOUNDS_Z + 5], face: PEAK, scale: 1.05, colors: AARON });
}

export default {
  title: 'Exodus 19-20: The Law at Sinai',
  subtitle: 'Mount Sinai on a smoke, the whole mount quaking greatly',
  seed: 20,
  style: { ...DAY_STYLE, fog: { color: '#8a7470', near: 150, far: 1100 } },
  sky: { zenith: '#2a2834', mid: '#4f4652', horizon: '#c08060', ground: '#6a5444', glowColor: '#ffb070', glowDir: [0, 0.35, -1] },
  sun: { dir: [0.2, 0.7, -0.8], color: '#ffd2a8', intensity: 1.8, hemi: { sky: '#9a8e9e', ground: '#7a5a44', intensity: 1.0 }, shadowSize: 80 },
  ground: {
    size: 1600, segments: 280, flatRadius: 420, hillHeight: 30, undulation: 0.3,
    plaza: { center: [0, 5000], size: [1, 1] },
    colors: { sand: '#c4a07a', dirt: '#b08a66', grass: '#9c8c64', grassDark: '#86785a', plaza: '#e6d6b0', plazaLine: '#c7ab7c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a6a56' },
  },
  mountains: { count: 30, distance: [520, 800], height: [80, 170], widthRatio: [1.4, 2.2], colors: ['#7a5e52', '#6a5048', '#84685a'] },
  objects: [
    { type: 'stones', count: 600, ring: [6, 200], size: [0.15, 0.6], colors: ['#a88a70', '#8c7460', '#b49a80'] },
  ],
  custom,
  clouds: {
    layers: [
      { count: 40, distance: [350, 800], height: [140, 260], size: [60, 110], color: '#5a5260', shade: '#1e1a26' },
      { count: 18, center: PEAK, distance: [20, 140], height: [190, 260], size: [50, 90], color: '#4a4250', shade: '#1a1620', drift: 0.01 },
    ],
  },
  crowd: {
    seed: 20,
    minSpacing: 0.75,
    facing: PEAK,
    colors: PALETTE,
    aisles: [{ from: [0, 30], to: [0, BOUNDS_Z + 8], width: 3.4 }],
    groups: [
      { shape: 'rect', center: [0, -14], size: [120, 52], count: 1600, children: 0.12, kneel: 0.15, facingJitter: 0.3 },
      { shape: 'rect', center: [0, 22], size: [90, 22], count: 300, children: 0.15, kneel: 0.1, facingJitter: 0.5 },
    ],
  },
  player: {
    start: [0, 26],
    lookAt: PEAK,
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
