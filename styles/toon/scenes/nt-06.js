// Matthew 3:13-17: John baptizes Jesus in the Jordan; the heavens open and the Spirit descends like a dove.
// x is east, z is south. The river runs east-west in front of the player; the wilderness rises to the north.
import { Batch, DAY_STYLE, PALETTE, bush, dove, glow, makeRng, palm, person, reeds, river, xf } from './lib/nt-01-kit.js';

const JESUS = [-0.6, -6.6];
const JOHN = [0.9, -6.2];
const FORD_X = 16;
const RIVER = [[-260, -2], [-150, -14], [-70, -6], [-20, -11], [20, -9], [70, -14], [150, -4], [260, -12]];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(606);

  const pts = river(ctx, { points: RIVER, width: 15, color: '#4f9aa0', bank: '#b8a070', glint: '#e9f6f0', flow: 1.2, glints: 140 });

  // The water is a surface over dry ground, so the player stays on the banks except at a stone ford.
  pts.forEach(([x, z], i) => {
    if (i === pts.length - 1 || Math.abs(x - FORD_X) < 2.2) return;
    const [nx, nz] = pts[i + 1];
    const half = 15 * (1 + 0.12 * Math.sin(i * 0.7)) * 0.5;
    ctx.addCollider({ x: (x + nx) / 2, z: (z + nz) / 2, hx: Math.hypot(nx - x, nz - z) / 2 + 0.3, hz: half, rot: -Math.atan2(nz - z, nx - x), top: 99 });
  });
  const fz = -10 + (FORD_X + 20) / 40 * 2;
  let fy = -Infinity;
  for (let z = fz - 10; z <= fz + 10; z += 1) fy = Math.max(fy, ctx.terrainHeight(FORD_X, z));
  fy += 0.26;
  ctx.addCollider({ x: FORD_X, z: fz, hx: 1, hz: 9.5, rot: 0, top: fy });
  for (let z = fz - 9.6; z <= fz + 9.6; z += 0.75) {
    for (const s of [-1, 1]) {
      const r = 0.42 + rng() * 0.18;
      b.add(rng() < 0.5 ? '#b8ab98' : '#a89a86', xf(new THREE.CylinderGeometry(r, r * 1.15, 0.5, 7), { pos: [FORD_X + s * 0.5 + (rng() - 0.5) * 0.2, fy - 0.25, z + (rng() - 0.5) * 0.2], rot: [0, rng() * 3, 0] }));
    }
  }
  reeds(ctx, { points: RIVER, offset: 8, spread: 3, count: 900, seed: 6, skip: (x, z) => Math.abs(x) < 30 && z > -10 });
  for (let i = 0; i < RIVER.length - 1; i++) {
    const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1];
    ctx.exclude({ kind: 'rect', x: (ax + bx) / 2, z: (az + bz) / 2, hx: Math.hypot(bx - ax, bz - az) / 2 + 2, hz: 9.5, rot: -Math.atan2(bz - az, bx - ax) });
  }
  for (let i = 0; i < 70; i++) {
    const side = rng() < 0.55 ? 1 : -1;
    const x = (rng() - 0.5) * 240, z = -10 + side * (14 + rng() * 40);
    if (Math.abs(x) < 12 && side > 0) continue;
    if (ctx.blocked(x, z, 2)) continue;
    if (rng() < 0.45) palm(b, ctx, { pos: [x, z], height: 6 + rng() * 4, lean: rng() * 0.3, dir: rng() * 6, seed: i });
    else b.add(rng() < 0.5 ? '#6f8a4a' : '#7d8a4a', new THREE.SphereGeometry(1.4 + rng() * 1.4, 7, 5).scale(1.3, 0.8, 1.2).translate(x, ctx.terrainHeight(x, z) + 1, z));
  }
  for (let i = 0; i < 90; i++) {
    const x = (rng() - 0.5) * 120, z = -10 + (rng() < 0.5 ? -1 : 1) * (10 + rng() * 25);
    if (!ctx.blocked(x, z, 1)) bush(b, ctx, { pos: [x, z], size: 0.4 + rng() * 0.5, color: rng() < 0.5 ? '#8a8a4a' : '#9a8a5a' });
  }
  b.flush();

  // Jesus and John stand waist-deep in the water.
  const wy = ctx.terrainHeight(...JESUS) - 0.6;
  person(ctx, { pos: JESUS, face: [0, 20], y: wy, scale: 1.08, glow: 0.25, colors: { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#5a3a22', sash: '#e9dcc0', arms: [0.12, 0.6] } });
  person(ctx, { pos: JOHN, face: JESUS, y: ctx.terrainHeight(...JOHN) - 0.6, scale: 1.05, colors: { robe: '#8a6a44', mantle: '#6e5234', skin: '#9c6a45', hair: '#2b1a12', sash: '#4a3020', arms: [0.4, 1.9] } });
  for (const [x, z] of [JESUS, JOHN]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.6, 20).rotateX(-Math.PI / 2), ctx.kit.basic('#e9f6f0', { transparent: true, opacity: 0.7 }));
    ring.position.set(x, ctx.terrainHeight(x, z) + 0.19, z);
    ctx.scene.add(ring);
  }
  dove(ctx, { pos: [JESUS[0], wy + 5.2, JESUS[1]], scale: 1.6, face: Math.PI * 0.1 });
  glow(ctx, { pos: [JESUS[0], wy + 5.2, JESUS[1]], size: 3.5, color: '#fff3d0', opacity: 0.6 });
}

export default {
  title: 'Matthew 3:13-17: The baptism of Jesus',
  subtitle: 'The river Jordan, at Bethabara',
  seed: 606,
  style: DAY_STYLE,
  sky: { zenith: '#2f6f9a', mid: '#80b2c4', horizon: '#f3dcae', ground: '#c9b07a', glowColor: '#fff4d0', glowDir: [0, 0.8, -0.4] },
  sun: { dir: [0.4, 0.85, 0.45], color: '#fff2da', intensity: 2.5, hemi: { sky: '#d6ece2', ground: '#b08a5a', intensity: 1.15 }, shadowSize: 60 },
  ground: {
    size: 1400, segments: 260, flatRadius: 90, hillHeight: 55, undulation: 0.3,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#d4b47c', dirt: '#bf9a62', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#d4b47c', plazaLine: '#bf9a62', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c8a878' },
  },
  mountains: { count: 32, distance: [480, 760], height: [60, 130], widthRatio: [1.8, 2.8], colors: ['#c4a27a', '#b8946c', '#cdb088', '#a88a68'] },
  objects: [{ type: 'stones', count: 300, ring: [12, 80], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70'] }],
  custom,
  clouds: {
    layers: [
      { count: 30, distance: [350, 800], height: [80, 170], size: [40, 90], color: '#fff6e8', shade: '#8a8aa0' },
      { count: 16, center: JESUS, distance: [30, 80], height: [70, 95], size: [22, 40], color: '#fff6e4', shade: '#7a6a82', drift: 0.004 },
    ],
  },
  light: {
    beams: [{ from: [JESUS[0], 160, JESUS[1] - 6], to: { at: JESUS, lift: 1.2 }, width: [12, 3.5], color: '#fff2c9', intensity: 0.38, layers: 3, stripes: 22, fadeLow: 0.04 }],
    rayFans: [{ source: [0, 110, -20], sourceJitter: 30, target: JESUS, groundY: 0.5, spread: [10, 40], count: 8, width: [[3, 5], [5, 9]], color: '#fff0c4', intensity: 0.22, stripes: 9, fadeLow: 0.3 }],
    glows: [{ at: JESUS, lift: 1.1, size: 5, color: '#fff3d0', opacity: 0.6 }],
  },
  crowd: {
    seed: 6,
    minSpacing: 0.75,
    facing: JESUS,
    colors: { ...PALETTE, robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e'] },
    aisles: [{ from: [0, 26], to: [0, -2], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: 0, z: -10, r: 9 }],
    groups: [
      { center: [0, -10], radius: [9.5, 22], angle: [-1.25, 1.25], count: 170, kneel: 0.15, children: 0.12 },
      { center: [0, -10], radius: [12, 20], angle: [2.1, 4.2], count: 60, kneel: 0.1, children: 0.1 },
    ],
  },
  player: {
    start: [2.4, -0.6],
    lookAt: [2.6, -7],
    colors: { robe: '#a87b4f', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
