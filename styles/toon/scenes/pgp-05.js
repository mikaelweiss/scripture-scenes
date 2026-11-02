// Abraham 3:1-10: by night Abraham sees through the Urim and Thummim the great star Kolob and the stars that govern in their order.
// Coordinates are meters. x is east, z is south. The vision fills the northern sky.
import { BASE_STYLE, FX_LAYER, THREE, Parts, between, figure, flames, flockOfSheep, glow, makeRng, pick, skyDisc, stars, tent, unit } from './lib/pgp-01-kit.js';

const ABRAHAM = [0, -6];
const KOLOB = [0.0, 0.23, -1];
const GOVERNORS = [
  [[0.32, 0.2, -1], 22, '#fff0c0'],
  [[0.56, 0.16, -1], 17, '#ffe6b0'],
  [[0.78, 0.12, -1], 13, '#e8f0ff'],
  [[-0.34, 0.19, -1], 19, '#e8f4ff'],
  [[-0.6, 0.15, -1], 14, '#fff0d0'],
  [[-0.84, 0.1, -1], 10, '#ffe0c0'],
];

// Thin rings of light about Kolob, showing the order of the governing ones.
function orbits(ctx) {
  const dir = new THREE.Vector3(...KOLOB).normalize();
  const mat = new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const group = new THREE.Group();
  for (const r of [70, 140, 220, 310]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.9, 4, 160), mat);
    ring.rotation.x = 1.15;
    group.add(ring);
  }
  group.traverse((o) => o.layers.set(FX_LAYER));
  group.renderOrder = -895;
  ctx.scene.add(group);
  ctx.onFrame((t, dt, camera) => {
    group.position.copy(camera.position).addScaledVector(dir, 1300);
    group.rotation.z = t * 0.02;
  });
}

function hill(ctx) {
  const rng = makeRng(8);
  const p = new Parts();
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2, r = between(rng, [5, 40]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (Math.hypot(x - 3, z - 6) < 4 || Math.hypot(x - ABRAHAM[0], z - ABRAHAM[1]) < 3) continue;
    const s = between(rng, [0.4, 1.8]);
    const y = ctx.terrainHeight(x, z);
    p.add(pick(rng, ['#6a6070', '#5a5262', '#7a6e78']), unit.rock, { pos: [x, y + s * 0.2, z], rot: [rng() * 3, rng() * 3, rng() * 3], scale: [s * 1.4, s, s * 1.2] });
    if (s > 1.2) ctx.addCollider({ x, z, hx: s * 0.5, hz: s * 0.5, rot: 0, top: y + s * 0.6 });
  }
  ctx.scene.add(p.group(ctx.kit));
}

function camp(ctx) {
  tent(ctx, [-14, 10], { w: 8, d: 5, h: 3, color: '#4a3428', stripe: '#a8885e', rot: 0.4 });
  tent(ctx, [-22, 0], { w: 6, d: 4, h: 2.6, color: '#5a4232', stripe: '#c8a97a', rot: 1.1 });
  tent(ctx, [12, 16], { w: 6, d: 4, h: 2.6, color: '#4a3428', stripe: '#c8a97a', rot: -0.5 });
  const fire = [-6, 14];
  const y = ctx.terrainHeight(...fire);
  const p = new Parts();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    p.add('#6a6070', unit.rock, { pos: [fire[0] + Math.sin(a) * 0.9, y + 0.1, fire[1] + Math.cos(a) * 0.9], scale: [0.5, 0.35, 0.4] });
  }
  p.add('#3a2418', unit.cyl, { pos: [fire[0], y + 0.15, fire[1]], rot: [0, 0.5, Math.PI / 2], scale: [0.18, 1.4, 0.18] });
  p.add('#3a2418', unit.cyl, { pos: [fire[0], y + 0.15, fire[1]], rot: [0, -0.7, Math.PI / 2], scale: [0.18, 1.4, 0.18] });
  ctx.scene.add(p.group(ctx.kit));
  flames(ctx, [{ x: fire[0], y: y + 0.1, z: fire[1], h: 1.2, r: 1.1 }, { x: fire[0] + 0.3, y: y + 0.1, z: fire[1] - 0.2, h: 0.8, r: 0.7 }]);
  glow(ctx, [fire[0], y + 0.8, fire[1]], 5, '#ff9a40', 0.6);
  const light = new THREE.PointLight('#ff9a50', 10, 16, 1.5);
  light.position.set(fire[0], y + 1.2, fire[1]);
  ctx.scene.add(light);
  ctx.exclude({ kind: 'circle', x: fire[0], z: fire[1], r: 1.4 });
  figure(ctx, { robe: '#8c5a3c', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12' }, [-7.6, 15.4], { facing: fire, kneel: true, clear: 0.6 });
  figure(ctx, { robe: '#c8a97a', mantle: '#b5523b', skin: '#b5825a', hair: '#3a2418' }, [-4.4, 15.8], { facing: fire, kneel: true, clear: 0.6 });
  flockOfSheep(ctx, [18, 4], { count: 14, radius: 5, seed: 7 });
}

export default {
  title: 'Abraham 3:1-10: Abraham sees the stars',
  subtitle: 'Kolob and the governing stars, seen through the Urim and Thummim',
  seed: 105,

  style: { ...BASE_STYLE, ink: '#120e1e', fog: { color: '#1e2440', near: 90, far: 700 }, grain: 0.06 },

  sky: {
    zenith: '#05081a',
    mid: '#121a3e',
    horizon: '#2e3260',
    ground: '#141428',
    glowColor: '#6a78c0',
    glowDir: KOLOB,
  },

  sun: {
    dir: [0.1, 0.6, -0.8],
    color: '#b8c4ff',
    intensity: 1.5,
    hemi: { sky: '#4a5890', ground: '#2a2234', intensity: 0.9 },
    shadowSize: 60,
  },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 40,
    hillHeight: -30,
    undulation: 0.6,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#7a6e70',
      dirt: '#6a5e62',
      grass: '#5a6458',
      grassDark: '#48524a',
      plaza: '#7a6e70',
      plazaLine: '#7a6e70',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#6a6070',
    },
  },

  mountains: { count: 26, distance: [500, 800], height: [20, 60], widthRatio: [2, 3], colors: ['#20223a', '#262840', '#1c1e34'] },

  objects: [],

  custom(ctx) {
    stars(ctx, { count: 2400, size: 2, minY: 0.02, seed: 11 });
    stars(ctx, { count: 260, size: 3.4, minY: 0.05, color: '#fff2c8', seed: 4 });
    skyDisc(ctx, KOLOB, 1400, 46, '#fffbea', { halo: 5, haloColor: '#ffe8a8' });
    for (const [dir, size, color] of GOVERNORS) skyDisc(ctx, dir, 1400, size, color, { halo: 3.2, haloColor: color });
    skyDisc(ctx, [0.95, 0.08, -0.5], 1400, 26, '#e8ecf4', { halo: 2.2, haloColor: '#a8b8e8' });
    orbits(ctx);
    hill(ctx);
    camp(ctx);

    figure(ctx, { robe: '#e6d8b8', mantle: '#6b4a33', skin: '#a8724a', hair: '#d8d0c4', sash: '#8c5a3c', arms: [0.35, 1.25] }, ABRAHAM, { facing: [0, -400], scale: 1.05 });
    const y = ctx.terrainHeight(...ABRAHAM);
    for (const side of [-1, 1]) {
      glow(ctx, [ABRAHAM[0] + side * 0.3, y + 1.8, ABRAHAM[1] - 0.4], 1.4, '#c8f0ff', 0.95, 0.12);
    }
    glow(ctx, [ABRAHAM[0], y + 1.4, ABRAHAM[1]], 5, '#a8c8ff', 0.35);
  },

  light: {
    rayFans: [{ source: [0, 400, -900], sourceJitter: 40, target: ABRAHAM, groundY: 0, spread: [2, 8], count: 4, width: [[20, 30], [2, 4]], color: '#c8d8ff', intensity: 0.08, stripes: 7, fadeLow: 0.4 }],
    pointLights: [{ at: ABRAHAM, lift: 2.4, color: '#c8e8ff', intensity: 6, distance: 10 }],
  },

  player: {
    start: [2, 1.5],
    lookAt: [0, -400],
    colors: { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
