// Genesis 15:5: the Lord brings Abram outside his tent at night and bids him count the stars.
import * as THREE from 'three';
import { Batch, DESERT_GROUND, NIGHT_STYLE, PALETTE, camel, campfire, figure, flock, glow, makeRng, rocks, stars, tent } from './lib/ot-07-kit.js';
import { FX_LAYER } from '../engine/renderer.js';

const ABRAHAM = [0, 2];
const FIRE = [-7, -3];

const ABRAHAM_COLORS = { robe: '#d9c7a3', mantle: '#6b4a7a', skin: '#a8724a', hair: '#d8d2c4', sash: '#c8912e', arms: [0.35, 2.35] };

// A dense band of faint stars across the sky.
function milkyWay(ctx) {
  const rng = makeRng(31);
  const pos = [];
  const axis = new THREE.Vector3(0.85, 0.3, 0.45).normalize();
  const u = new THREE.Vector3(1, 0, 0).cross(axis).normalize();
  const w = axis.clone().cross(u);
  const p = new THREE.Vector3();
  while (pos.length < 7000 * 3) {
    const a = rng() * Math.PI * 2;
    const spread = (rng() - 0.5) * (rng() < 0.6 ? 0.18 : 0.42);
    p.copy(u).multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a)).addScaledVector(axis, spread).normalize();
    if (p.y < 0.02) continue;
    pos.push(p.x * 1500, p.y * 1500, p.z * 1500);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfd6f2', size: 1.6, sizeAttenuation: false, fog: false, depthWrite: false, transparent: true, opacity: 0.85 }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  ctx.onFrame((t, dt, cam) => pts.position.copy(cam.position));
}

export default {
  title: 'Genesis 15:5: Abraham counts the stars',
  subtitle: "Night in Abram's camp. So shall thy seed be.",
  seed: 7,

  style: NIGHT_STYLE,

  sky: { zenith: '#070b24', mid: '#121a44', horizon: '#2a3466', ground: '#141826', glowColor: '#1c2550', glowDir: [0, 0.35, -1] },

  sun: {
    dir: [-0.35, 0.75, -0.5],
    color: '#9fb2ec',
    intensity: 1.0,
    hemi: { sky: '#4a5a9a', ground: '#3a2c30', intensity: 0.85 },
    shadowSize: 60,
  },

  ground: {
    size: 1400, segments: 260, flatRadius: 110, hillHeight: 26, undulation: 0.35,
    plaza: { center: [0, -6], size: [0.1, 0.1] },
    colors: { ...DESERT_GROUND, sand: '#9a8466', dirt: '#86704e', grass: '#7f8656', grassDark: '#646a44', hill: '#7a6a58' },
  },

  mountains: { count: 30, distance: [480, 760], height: [40, 110], widthRatio: [1.8, 2.8], colors: ['#232846', '#1e2240', '#2a2e4e'] },

  objects: [],

  custom(ctx) {
    stars(ctx, { count: 4200, size: 1.6, seed: 4, minY: 0.02, color: '#e8ecff' });
    stars(ctx, { count: 260, size: 3.2, seed: 9, minY: 0.03, color: '#fff6dc' });
    stars(ctx, { count: 40, size: 4.6, seed: 13, minY: 0.06, color: '#ffffff' });
    milkyWay(ctx);

    const b = new Batch(ctx);
    const tents = [
      { pos: [-4, -10], size: [6, 7], height: 3.2, rot: 0.15, color: '#4a3628', flap: '#7a5a3c' },
      { pos: [7, -12], size: [5, 6], height: 2.8, rot: -0.3, color: '#5e4632' },
      { pos: [-15, -6], size: [4.5, 5], height: 2.6, rot: 0.9, color: '#3e2e22' },
      { pos: [16, -3], size: [4.5, 5], height: 2.6, rot: -1.1, color: '#54402e' },
      { pos: [-12, -20], size: [5, 5], height: 2.7, rot: 0.3, color: '#5a4434' },
      { pos: [3, -24], size: [5, 6], height: 2.8, rot: -0.1, color: '#4a3628' },
      { pos: [18, -18], size: [4, 5], height: 2.5, rot: -0.6, color: '#3e2e22' },
      { pos: [-22, 6], size: [4, 4.5], height: 2.4, rot: 1.3, color: '#54402e' },
    ];
    for (const t of tents) tent(b, ctx, t);
    campfire(b, ctx, { pos: FIRE, light: { color: '#ffa850', intensity: 26, distance: 22 } });
    campfire(b, ctx, { pos: [12, -9], light: { color: '#ffa850', intensity: 16, distance: 16 } });

    camel(b, ctx, { pos: [-18, -12], rot: 0.6, couched: true, color: '#a88458' });
    camel(b, ctx, { pos: [-20, -16], rot: 0.9, couched: true, color: '#b4905e', load: '#7a3a2c' });
    camel(b, ctx, { pos: [22, -9], rot: -1.2, couched: true, color: '#a07c50' });
    camel(b, ctx, { pos: [24, -13], rot: -0.8, couched: true, color: '#b89262' });
    flock(b, ctx, { center: [26, 10], radius: 9, count: 46, seed: 5 });
    flock(b, ctx, { center: [-26, 18], radius: 7, count: 30, seed: 8 });
    rocks(b, ctx, { ring: [8, 110], count: 140, size: [0.2, 1.1], colors: ['#7a6e5e', '#6a5e50', '#857866'], avoid: (x, z) => Math.hypot(x, z - 10) < 9 });
    b.flush();

    figure(ctx, { pos: ABRAHAM, face: [0, -30], colors: ABRAHAM_COLORS, scale: 1.08, lean: -0.12 });
  },

  crowd: {
    seed: 7,
    minSpacing: 0.7,
    facing: FIRE,
    colors: PALETTE,
    groups: [
      { center: FIRE, radius: [1.9, 2.8], count: 9, kneel: 0.85, children: 0.2 },
      { center: [12, -9], radius: [1.8, 2.6], count: 6, kneel: 0.9, facing: [12, -9] },
    ],
  },

  player: {
    start: [1.2, 6.8],
    lookAt: [0, -8],
    colors: { robe: '#8c5a3c', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
