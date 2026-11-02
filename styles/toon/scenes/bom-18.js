// Mosiah 18:4-17: Alma baptizes Helam in the fountain of pure water, in a thicket of small trees near the Waters of Mormon.
import * as THREE from 'three';
import { BASE_STYLE, GROUND_COLORS, ROBES, boxes, figure, glow, raiseArm, water, makeRng, between, FX_LAYER } from './lib/bom-13-kit.js';

const POOL = [0, -10];
const POOL_R = 9;
const WATER_Y = 0.24;
const ALMA = [-2.4, -4.4];
const HELAM = [-1.2, -4.7];
const ALMA_COLORS = { robe: '#e6d8b8', mantle: '#c8b48a', skin: '#a8724a', hair: '#8a7a6a' };
const HELAM_COLORS = { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#9c6a45', hair: '#2b1a12' };

const radiusAt = (a) => POOL_R + Math.sin(a * 3 + 0.7) * 0.9 + Math.sin(a * 5 + 2) * 0.5;

function pool(ctx) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r = radiusAt(a);
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ShapeGeometry(shape, 8);
  const mesh = water(ctx, geo, WATER_Y, {
    color: '#3f9aa8',
    shine: '#e4fbf4',
    sparkles: 50,
    area: (rng) => {
      const a = rng() * 6.28, r = Math.sqrt(rng()) * (POOL_R - 1.5);
      return [POOL[0] + Math.cos(a) * r, POOL[1] - Math.sin(a) * r];
    },
  });
  mesh.position.x = POOL[0];
  mesh.position.z = POOL[1];

  const rng = makeRng(18);
  const rim = [];
  for (let i = 0; i < 110; i++) {
    const a = rng() * Math.PI * 2;
    const r = radiusAt(a) + between(rng, [-0.3, 0.6]);
    const x = POOL[0] + Math.cos(a) * r, z = POOL[1] - Math.sin(a) * r;
    if (Math.hypot(x - ALMA[0], z - ALMA[1]) < 3 || (z > POOL[1] && Math.abs(x) < 2.2)) continue;
    const s = between(rng, [0.25, 0.7]);
    rim.push({ pos: [x, ctx.terrainHeight(x, z) + s * 0.2, z], size: [s * 1.3, s * 0.6, s], rot: rng() * 3, rotX: (rng() - 0.5) * 0.4, color: ['#a59a86', '#8f8676', '#b8ad96'][i % 3] });
  }
  const sx = POOL[0] + 0.5, sz = POOL[1] - radiusAt(Math.PI / 2) - 0.6;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI - Math.PI;
    const s = between(rng, [0.8, 1.6]);
    rim.push({ pos: [sx + Math.cos(a) * 2.2, s * 0.35 + (i % 3) * 0.3, sz + Math.sin(a) * 1.3], size: [s * 1.4, s, s * 1.1], rot: rng() * 3, color: '#8f8676' });
  }
  boxes(ctx, rim, { stone: true });
  ctx.addCollider({ x: sx, z: sz - 0.6, hx: 2.6, hz: 1.4, rot: 0, top: 1.4 });

  const spring = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshBasicMaterial({ color: '#e4fbf4', transparent: true, opacity: 0.75, depthWrite: false }));
  spring.position.set(sx, 0.85, sz + 0.75);
  spring.rotation.x = -0.4;
  spring.layers.set(FX_LAYER);
  ctx.scene.add(spring);

  const ringGeo = new THREE.RingGeometry(0.9, 1.0, 40);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#e4fbf4', transparent: true, opacity: 0.6, depthWrite: false }));
    m.position.set((ALMA[0] + HELAM[0]) / 2, WATER_Y + 0.02, (ALMA[1] + HELAM[1]) / 2);
    m.layers.set(FX_LAYER);
    ctx.scene.add(m);
    return m;
  });
  ctx.onFrame((t) => {
    rings.forEach((m, i) => {
      const k = (t * 0.25 + i / 3) % 1;
      m.scale.setScalar(0.8 + k * 3.2);
      m.material.opacity = 0.6 * (1 - k);
    });
  });
}

export default {
  title: 'Mosiah 18:4-17: Baptisms at the Waters of Mormon',
  subtitle: 'A fountain of pure water in a thicket of small trees',
  seed: 18,

  style: { ...BASE_STYLE, fog: { color: '#e6e2c0', near: 60, far: 600 } },

  sky: { zenith: '#3a7aa0', mid: '#8abccb', horizon: '#f2e6c0', ground: '#a8a070', glowColor: '#fff6d0', glowDir: [0.7, 0.35, -0.6] },

  sun: { dir: [0.6, 0.65, -0.3], color: '#fff4dc', intensity: 2.5, hemi: { sky: '#dcecdf', ground: '#7a7a4a', intensity: 1.15 }, shadowSize: 60 },

  ground: {
    size: 1000, segments: 240, flatRadius: 90, hillHeight: 30, undulation: 0.12,
    plaza: { center: [0, 2000], size: [0, 0] },
    colors: { ...GROUND_COLORS, sand: '#a8b46a', dirt: '#9a8a5a', grass: '#7f9a4f', grassDark: '#5f7a3c', hill: '#6a8a5a' },
  },

  mountains: { count: 30, distance: [420, 700], height: [60, 150], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#7aa08a', '#5d8c84'] },

  objects: [
    { type: 'trees', count: 50, center: POOL, ring: [24, 34], height: [3, 5.5], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#4f9a5a', '#5fa864', '#3e8e5e', '#6aaa5a'], seed: 4 },
    { type: 'trees', count: 360, center: POOL, ring: [34, 140], height: [3.5, 7], broken: 0, fallen: 0.02, trunkColor: '#6b4a33', leafColors: ['#4f9a5a', '#3e8e5e', '#5f9e6a', '#2f7f5a'], seed: 6 },
    { type: 'stones', count: 60, center: POOL, ring: [11, 24], size: [0.1, 0.3], colors: ['#a59a86', '#8f8676'] },
  ],

  custom(ctx) {
    pool(ctx);
    const sink = WATER_Y - 0.75;
    const alma = figure(ctx, ALMA_COLORS, ALMA, { facing: [HELAM[0], HELAM[1] + 3], y: sink, clear: 0, scale: 1.1 });
    raiseArm(ctx, alma, ALMA_COLORS, 1, 2.6);
    figure(ctx, HELAM_COLORS, HELAM, { facing: [ALMA[0], ALMA[1] + 2], y: sink, clear: 0, scale: 1.1 });
    glow(ctx, [(ALMA[0] + HELAM[0]) / 2, 1.6, ALMA[1]], 4, '#fff6d8', 0.3);
    ctx.exclude({ kind: 'circle', x: POOL[0], z: POOL[1], r: POOL_R + 1.4 });
  },

  clouds: {
    layers: [{ count: 34, distance: [380, 800], height: [80, 180], size: [40, 90], color: '#fff8ea', shade: '#5a6a78' }],
  },

  crowd: {
    seed: 18,
    minSpacing: 0.66,
    facing: ALMA,
    colors: ROBES,
    aisles: [{ from: [0.8, 30], to: [0.4, 0], width: 4.4 }],
    groups: [
      { center: POOL, radius: [POOL_R + 1.4, 20], angle: [-2.4, 2.4], count: 190, kneel: 0.12, children: 0.12 },
      { center: [4.6, 1.2], radius: [0, 1.6], count: 6, insideClear: true, facing: ALMA },
    ],
  },

  player: {
    start: [0.6, -0.4],
    lookAt: [-1.2, -8],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
