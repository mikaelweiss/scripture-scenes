// Mormon 6: the Nephites gather around the hill Cumorah and the Lamanite armies march against them at dusk.
// x is east, z is south. The hill rises to the north, the Nephite ranks before it, the Lamanite host to the south.
import * as THREE from 'three';
import { Batch, GROUND, banner, between, dust, makeNoiseHill, makeRng, person, pick, toonStyle } from './lib/bom-43-kit.js';

const HILL = [-10, -150];
const KNOLL = [-26, 4];
const MORMON = [-16.5, 4];
const EAST = [120, -10];
const WEST = [-80, -30];

const NEPHITES = {
  robes: ['#8c5a3c', '#a87b4f', '#7a6a52', '#c8a97a', '#6b5a4a', '#9c6b4e', '#4f7f80', '#bfa27a'],
  mantles: ['#5e4632', '#8c5a3c', '#3e6e66', '#6b5a4a', '#a64b35', '#c8912e'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#c8a97a', '#8c5a3c', '#5e4632', '#b5523b'],
};
const LAMANITES = {
  robes: ['#b5523b', '#c8703a', '#9a5030', '#d08a50', '#a8402e', '#c89060', '#8c4a2e'],
  mantles: ['#e6d8b8', '#c8912e', '#7a2e24', '#d9b070', '#5a2a22'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#1f140e', '#2b1a12'],
  wraps: ['#c8912e', '#b5523b', '#e6d8b8', '#2b1a12'],
};

const NEPHITE_RANKS = [];
for (let row = 0; row < 3; row++) {
  for (let k = 0; k < 5; k++) {
    NEPHITE_RANKS.push({ center: [-42 + k * 17 - row * 5, -32 - row * 12], size: [13, 8] });
  }
}
const LAMANITE_HOST = [];
for (let row = 0; row < 4; row++) {
  for (let k = 0; k < 5; k++) {
    LAMANITE_HOST.push({ center: [42 + row * 12, -70 + k * 19 + row * 5], size: [8, 15] });
  }
}

function spears(ctx, rng, ranks, count, color, lean) {
  const geo = new THREE.CylinderGeometry(0.03, 0.03, 3, 4);
  geo.translate(0, 1.5, 0);
  const tip = new THREE.ConeGeometry(0.07, 0.3, 4);
  tip.translate(0, 3.1, 0);
  const n = ranks.length * count;
  const shafts = new THREE.InstancedMesh(geo, ctx.kit.toon(color), n);
  const tips = new THREE.InstancedMesh(tip, ctx.kit.toon('#c9c2b0'), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let i = 0;
  for (const r of ranks) {
    for (let k = 0; k < count; k++) {
      const x = r.center[0] + (rng() - 0.5) * r.size[0], z = r.center[1] + (rng() - 0.5) * r.size[1];
      m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z) + 0.3, z), q.setFromEuler(e.set(lean + (rng() - 0.5) * 0.12, 0, (rng() - 0.5) * 0.12)), new THREE.Vector3(1, between(rng, [0.85, 1.1]), 1));
      shafts.setMatrixAt(i, m);
      tips.setMatrixAt(i, m);
      i++;
    }
  }
  for (const mesh of [shafts, tips]) {
    mesh.castShadow = true;
    ctx.scene.add(mesh);
  }
}

function custom(ctx) {
  const rng = makeRng(46);
  const b = new Batch(ctx);

  makeNoiseHill(ctx, { center: HILL, radius: 92, height: 48, color: '#8a9058', seed: 46 });
  ctx.exclude({ kind: 'circle', x: HILL[0], z: HILL[1], r: 70 });
  ctx.addCollider({ x: HILL[0], z: HILL[1], hx: 52, hz: 52, rot: 0, top: 60 });

  NEPHITE_RANKS.forEach((r, i) => {
    banner(b, ctx, [r.center[0] - r.size[0] / 2 + 1, r.center[1] + r.size[1] / 2 + 0.8], { height: 5.5, color: pick(rng, ['#2f8f8a', '#c8912e', '#efe3c2', '#3e6e8e']), trim: '#b5523b', rot: 0 });
    if (i % 2 === 0) banner(b, ctx, [r.center[0] + r.size[0] / 2 - 1, r.center[1] + r.size[1] / 2 + 0.8], { height: 5, color: '#efe3c2', trim: '#2f8f8a' });
  });
  LAMANITE_HOST.forEach((r, i) => {
    banner(b, ctx, [r.center[0] - r.size[0] / 2 - 0.8, r.center[1]], { height: 6, color: pick(rng, ['#7a2e24', '#2b1a12', '#c8912e']), trim: '#e6d8b8' });
    if (i % 3 === 0) banner(b, ctx, [r.center[0] - r.size[0] / 2 - 0.5, r.center[1] - 5], { height: 5.4, color: '#5a2a22', trim: '#c8912e' });
  });
  spears(ctx, rng, NEPHITE_RANKS, 7, '#5a3a22', 0.12);
  spears(ctx, rng, LAMANITE_HOST, 6, '#3a2418', 0);

  const knoll = makeNoiseHill(ctx, { center: KNOLL, radius: 22, height: 8, color: '#8a8050', seed: 7, flatTop: 0.25, walk: true });
  const rise = knoll.heightAt(...MORMON) - 0.85;
  person(ctx, { robe: '#5e4632', mantle: '#b5523b', skin: '#a87650', hair: '#b9aea8', sash: '#c8912e', arms: [0.15, 0.2] }, [MORMON[0] - 0.5, MORMON[1]], EAST, { scale: 1.08, y: rise + 0.85, clear: 3.2 });
  person(ctx, { robe: '#7a6a52', mantle: '#2f8f8a', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' }, [MORMON[0] + 1, MORMON[1] - 0.6], EAST, { y: rise + 0.85, clear: 0 });
  banner(b, ctx, [MORMON[0] - 1.6, MORMON[1] - 0.6], { height: 6.5, color: '#efe3c2', trim: '#b5523b', y: rise + 0.85 });

  const puffs = [];
  for (let i = 0; i < 40; i++) puffs.push([between(rng, [50, 120]), between(rng, [-90, 40]), between(rng, [3, 7])]);
  for (let i = 0; i < 14; i++) puffs.push([between(rng, [30, 36]), between(rng, [-75, 20]), between(rng, [2, 3.5])]);
  dust(ctx, puffs, { color: '#d9a070', shade: '#7a4a3a' });

  b.flush();
}

const rank = (r, colors, facing) => ({ shape: 'rect', center: r.center, size: r.size, count: Math.round(r.size[0] * r.size[1] * 0.75), colors, facing, facingJitter: 0.15, lean: 0.02 });

export default {
  title: 'Mormon 6: The last battle at Cumorah',
  subtitle: 'The last Nephite armies gathered around the hill',
  seed: 46,
  custom,

  style: toonStyle({ fog: '#d99a72', near: 90, far: 700 }),

  sky: { zenith: '#3a2c52', mid: '#a0546a', horizon: '#f2a060', ground: '#8a5a3c', glowColor: '#ffc078', glowDir: [-0.6, 0.12, 0.7] },

  sun: { dir: [-0.6, 0.4, 0.7], color: '#ffbc88', intensity: 2.6, hemi: { sky: '#c890a8', ground: '#7a5040', intensity: 1.3 }, shadowSize: 90 },

  ground: {
    size: 1400, segments: 280, flatRadius: 170, hillHeight: 36, undulation: 0.35,
    plaza: { center: [0, 500], size: [1, 1] },
    colors: { ...GROUND, sand: '#a88a5a', dirt: '#8a6a44', grass: '#6f7a48', grassDark: '#555f38', hill: '#5f6a42' },
  },

  mountains: { count: 30, distance: [520, 820], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#6a4a5a', '#5a3e52', '#7a5262'] },

  objects: [
    { type: 'trees', count: 80, ring: [120, 260], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#3a2418', leafColors: ['#3e5a42', '#4a6a48', '#2f4a3a'] },
    { type: 'stones', count: 300, ring: [5, 110], size: [0.12, 0.4], colors: ['#8a7b6a', '#7a6c5c', '#9a8a76'] },
  ],

  clouds: {
    layers: [
      { count: 46, distance: [350, 800], height: [60, 170], size: [40, 90], color: '#f2a070', shade: '#3a2440' },
      { count: 14, angle: [2.2, 4.0], distance: [250, 600], height: [80, 160], size: [50, 100], color: '#6a4a5a', shade: '#2a1a2a' },
    ],
  },

  crowd: {
    seed: 46,
    minSpacing: 0.9,
    facing: [0, 60],
    colors: NEPHITES,
    groups: [
      ...NEPHITE_RANKS.map((r) => rank(r, NEPHITES, EAST)),
      ...LAMANITE_HOST.map((r) => rank(r, LAMANITES, WEST)),
    ],
  },

  player: {
    start: [-19.5, 0.5],
    lookAt: [22, -40],
    colors: { robe: '#7a6a52', mantle: '#8c5a3c', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
