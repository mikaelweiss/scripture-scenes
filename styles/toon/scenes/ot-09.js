// Genesis 19:15-28: fire falls on Sodom at sunrise. Lot and his daughters flee toward Zoar while his wife looks back.
import * as THREE from 'three';
import { Batch, DAY_STYLE, cityWall, fireRain, figure, flames, glow, house, makeRng, rocks } from './lib/ot-07-kit.js';

const CITY = [0, -95];
const WIFE = [-0.6, -2];

const LOT = { robe: '#8c5a3c', mantle: '#5e4632', skin: '#a8724a', hair: '#cfc6b4', sash: '#c8912e', arms: [0.25, 0.5] };
const DAUGHTERS = [
  { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#b5825a', hair: '#d9c7a3', sash: '#b5523b', arms: [0.2, 0.4] },
  { robe: '#a64b35', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', sash: '#c8912e', arms: [0.2, 0.4] },
];
const SALT = { robe: '#e9e6de', mantle: '#dcd8cc', skin: '#e2ded2', hair: '#d6d2c6', sash: '#cfcabc' };

function burningCity(ctx, b) {
  const rng = makeRng(19);
  const fires = [];
  for (let i = 0; i < 46; i++) {
    const x = CITY[0] + (rng() - 0.5) * 80;
    const z = CITY[1] + (rng() - 0.5) * 40;
    if (Math.abs(x) < 4 && z > CITY[1]) continue;
    const w = 5 + rng() * 5, d = 4 + rng() * 4, h = 3 + rng() * 4;
    house(b, ctx, { pos: [x, z], size: [w, d], height: h, rot: (rng() - 0.5) * 0.3, color: rng() < 0.5 ? '#8a6e52' : '#7a604a', trim: '#4a3628', door: '#1a0e08', lit: rng() < 0.5 });
    if (rng() < 0.75) {
      const y = ctx.terrainHeight(x, z) + h;
      fires.push({ pos: [x + (rng() - 0.5) * w * 0.5, y, z], h: 4 + rng() * 6, w: 4 + rng() * 4, light: fires.length % 6 === 0 });
    }
  }
  cityWall(b, ctx, { from: [-46, -72], to: [-6, -72], height: 6, color: '#6e5440' });
  cityWall(b, ctx, { from: [6, -72], to: [46, -72], height: 6, color: '#6e5440' });
  flames(ctx, fires, { outer: '#f06a24', inner: '#ffd27a', light: { color: '#ff8a3c', intensity: 60, distance: 60 } });
  for (const f of fires) if (rng() < 0.5) glow(ctx, { pos: [f.pos[0], f.pos[1] + f.h * 0.4, f.pos[2]], size: f.h * 2.4, color: '#ff8a3c', opacity: 0.5, pulse: 0.08 });
}

function smokeColumns(ctx) {
  const rng = makeRng(23);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = ctx.kit.toon('#3e3440', { emissive: '#2a1a1e' });
  const puffs = Array.from({ length: 70 }, () => ({
    x: CITY[0] + (rng() - 0.5) * 70, z: CITY[1] + (rng() - 0.5) * 30,
    phase: rng(), size: 8 + rng() * 10,
  }));
  const mesh = new THREE.InstancedMesh(geo, mat, puffs.length);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ctx.scene.add(mesh);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    puffs.forEach((p, i) => {
      const life = (t * 0.03 + p.phase) % 1;
      const k = p.size * (0.5 + life * 1.4) * Math.min(1, life * 6);
      mesh.setMatrixAt(i, m.compose(v.set(p.x + life * 30, 6 + life * 110, p.z - life * 10), q, s.set(k, k * 0.8, k)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

export default {
  title: 'Genesis 19:15-28: Sodom destroyed',
  subtitle: 'Fire from heaven at sunrise. Escape for thy life, look not behind thee.',
  seed: 19,

  style: {
    ...DAY_STYLE,
    ink: '#24120e',
    fog: { color: '#a85a3c', near: 60, far: 650 },
    smoke: '#4a3a3e',
    smokeShade: '#1e1216',
  },

  sky: { zenith: '#3a1e2a', mid: '#8a3a2c', horizon: '#f08a3c', ground: '#5a3a2a', glowColor: '#ffb060', glowDir: [0, 0.15, -1] },

  sun: {
    dir: [0.85, 0.3, -0.25],
    color: '#ffb888',
    intensity: 1.8,
    hemi: { sky: '#d88a6a', ground: '#4a2a22', intensity: 0.9 },
    shadowSize: 60,
  },

  ground: {
    size: 1400, segments: 260, flatRadius: 140, hillHeight: 40, undulation: 0.3,
    plaza: { center: [0, -30], size: [4.5, 90] },
    colors: { sand: '#b08a62', dirt: '#9a7450', grass: '#8a7e52', grassDark: '#6a6040', plaza: '#c8a87a', plazaLine: '#b0906a', scorch: '#2a1a16', scorchEdge: '#5a3424', hill: '#8a6a52' },
  },

  mountains: { count: 30, distance: [440, 720], height: [60, 150], widthRatio: [1.6, 2.6], colors: ['#6a3e3a', '#5a3434', '#7a4a40'] },

  objects: [],

  smolder: [
    { pos: [-30, -88], radius: 8, embers: 40, flames: 0, smoke: 0, logs: 0 },
    { pos: [-10, -100], radius: 9, embers: 40, flames: 0, smoke: 0, logs: 0 },
    { pos: [14, -90], radius: 8, embers: 40, flames: 0, smoke: 0, logs: 0 },
    { pos: [32, -102], radius: 9, embers: 40, flames: 0, smoke: 0, logs: 0 },
    { pos: [0, -80], radius: 6, embers: 30, flames: 0, smoke: 0, logs: 0 },
    { pos: [-22, -60], radius: 3, embers: 20, flames: 3, smoke: 6, logs: 2, smokeScale: 2, smokeHeight: 20 },
    { pos: [24, -50], radius: 3, embers: 20, flames: 3, smoke: 6, logs: 2, smokeScale: 2, smokeHeight: 20 },
  ],

  custom(ctx) {
    const b = new Batch(ctx);
    burningCity(ctx, b);
    rocks(b, ctx, { ring: [6, 140], count: 160, size: [0.2, 1.1], colors: ['#8a6e56', '#7a604a', '#9a7e62'], avoid: (x, z) => Math.abs(x) < 4 });
    b.flush();
    smokeColumns(ctx);
    fireRain(ctx, { center: [CITY[0] - 8, CITY[1] - 18], radius: 50, count: 110, top: 160, speed: 55 });
    fireRain(ctx, { center: [-60, -40], radius: 30, count: 25, top: 160, speed: 50, seed: 9 });
    fireRain(ctx, { center: [60, -50], radius: 30, count: 25, top: 160, speed: 50, seed: 11 });
    glow(ctx, { pos: [CITY[0], 30, CITY[1]], size: 160, color: '#ff7a30', opacity: 0.35, pulse: 0.03 });

    figure(ctx, { pos: [0.4, 7.6], face: [0.4, 40], colors: LOT, scale: 1.1, lean: 0.18 });
    figure(ctx, { pos: [-0.9, 6.2], face: [-0.9, 40], colors: DAUGHTERS[0], scale: 0.98, lean: 0.16 });
    figure(ctx, { pos: [1.6, 5.8], face: [1.6, 40], colors: DAUGHTERS[1], scale: 0.95, lean: 0.16 });
    figure(ctx, { pos: WIFE, face: CITY, colors: SALT, scale: 0.98 });
    glow(ctx, { pos: [WIFE[0], ctx.groundHeight(...WIFE) + 1, WIFE[1]], size: 2.6, color: '#ffffff', opacity: 0.25, pulse: 0 });
  },

  player: {
    start: [2.8, 12.6],
    lookAt: [-1, -60],
    colors: { robe: '#7a6a52', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
