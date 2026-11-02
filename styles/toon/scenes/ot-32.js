// 1 Kings 19:9-13: Elijah at the mouth of the cave on Horeb. The wind, the earthquake and the fire have passed.
// x is east, z is south. The cliff and cave stand to the north. Split rock, fallen boulders and dying fires remain.
import * as THREE from 'three';
import { Batch, FX_LAYER, box, figure, glow, makeRng, rock, xf } from './lib/ot-31-kit.js';

const CAVE = [0, -14];
const ELIJAH = [0.2, -11.2];
const GRANITE = ['#a8705a', '#b8806a', '#9a6250', '#c28c72', '#8e5a4a'];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(32);
  const [cx, cz] = CAVE;
  const cy = ctx.terrainHeight(cx, cz);

  // The cliff face: granite masses with a gap for the cave mouth.
  const crag = (x, z, r, sy, color, collide = true) => {
    const y = ctx.terrainHeight(x, z);
    b.add(color, rock(r, [x, y + r * sy * 0.55, z], [1.1, sy, 0.9], [rng() * 0.3, rng() * 3, rng() * 0.3]));
    if (collide) {
      ctx.addCollider({ x, z, hx: r * 0.85, hz: r * 0.75, rot: 0, top: y + r * sy * 1.4 });
      ctx.exclude({ kind: 'circle', x, z, r: r * 1.1 });
    }
  };
  for (let x = -60; x <= 60; x += 4.5 + rng() * 1.5) {
    if (Math.abs(x) < 6) continue;
    const r = 4.5 + rng() * 2.5;
    crag(x, cz - 4 - rng() * 3 - Math.abs(x) * 0.08 + r * 0.2, r, 1.5 + rng() * 1.4, GRANITE[Math.floor(rng() * 5)]);
    crag(x + 2, cz - 13 - rng() * 4, r * 1.3, 2 + rng() * 1.6, GRANITE[Math.floor(rng() * 5)], false);
  }
  crag(cx - 5.2, cz - 2.5, 3.4, 1.7, GRANITE[2]);
  crag(cx + 5.2, cz - 2.8, 3.6, 1.6, GRANITE[4]);
  b.add(GRANITE[1], rock(4.6, [cx, cy + 8.6, cz - 3.6], [1.6, 1.0, 1.0], [0.2, 0.4, 0.1]));
  b.add(GRANITE[0], rock(7, [cx, cy + 15, cz - 9], [1.3, 1.6, 1.0], [0.1, 1.1, 0.1]));
  ctx.addCollider({ x: cx, z: cz - 7, hx: 5, hz: 4, rot: 0, top: cy + 30 });
  // The cave's dark mouth.
  const mouth = xf(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), { pos: [cx, cy - 0.1, cz - 1.8], scale: [2.6, 4.6, 1.6] });
  b.add('#1e1412', mouth, { glow: true });
  ctx.addCollider({ x: cx, z: cz - 2.2, hx: 2.6, hz: 1.4, rot: 0, top: cy + 5 });

  // The earthquake: boulders broken from the mountain and strewn on the slope.
  for (let i = 0; i < 70; i++) {
    const x = (rng() - 0.5) * 70, z = cz + 2 + rng() * 40;
    if (Math.abs(x) < 4 && z < 10) continue;
    const r = 0.4 + rng() * (i < 12 ? 2.2 : 0.9);
    const y = ctx.terrainHeight(x, z);
    b.add(GRANITE[i % GRANITE.length], rock(r, [x, y + r * 0.4, z], [1.2, 0.8, 1], [rng(), rng() * 3, rng()]));
    if (r > 1.1) {
      ctx.addCollider({ x, z, hx: r * 0.8, hz: r * 0.8, rot: 0, top: y + r * 1.1 });
      ctx.exclude({ kind: 'circle', x, z, r: r + 0.3 });
    }
  }
  // A great rock split in two by the wind.
  b.add(GRANITE[0], rock(2.4, [-11, ctx.terrainHeight(-11, 2) + 1.6, 2], [1, 1.2, 1], [0.2, 0.5, 0.35]));
  b.add(GRANITE[2], rock(2.2, [-7.8, ctx.terrainHeight(-7.8, 3) + 1.2, 3], [1, 1.1, 1], [0.4, 1.2, -0.5]));
  ctx.addCollider({ x: -11, z: 2, hx: 2, hz: 2, rot: 0, top: 6 });
  ctx.addCollider({ x: -7.8, z: 3, hx: 1.8, hz: 1.8, rot: 0, top: 5 });
  // Broom bushes, bent by the wind.
  for (let i = 0; i < 40; i++) {
    const x = (rng() - 0.5) * 80, z = cz + 4 + rng() * 50;
    const y = ctx.terrainHeight(x, z);
    b.add(['#7a7a4a', '#8a8a5a', '#6a6a3e'][i % 3], xf(new THREE.IcosahedronGeometry(0.6 + rng() * 0.5, 0), { pos: [x, y + 0.4, z], scale: [1.4, 0.7, 1], rot: [0, rng() * 3, 0.3] }));
  }
  b.flush();

  // The wind: pale streaks still drifting off along the mountain.
  const streakMat = new THREE.MeshBasicMaterial({ color: '#f4e6d8', transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const streaks = [];
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8 + rng() * 10, 0.14), streakMat);
    m.position.set((rng() - 0.5) * 120, 3 + rng() * 22, -30 + rng() * 60);
    m.rotation.set(0, (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.1);
    m.layers.set(FX_LAYER);
    ctx.scene.add(m);
    streaks.push({ m, speed: 8 + rng() * 10 });
  }
  ctx.onFrame((t, dt) => {
    for (const s of streaks) {
      s.m.position.x += s.speed * dt;
      if (s.m.position.x > 70) s.m.position.x = -70;
    }
  });

  // The still small voice: a quiet light over the cave mouth.
  glow(ctx, [ELIJAH[0], cy + 1.3, ELIJAH[1] + 0.4], 4.5, '#fff1d6', 0.4, 0.03);
  const soft = new THREE.PointLight('#ffe6c4', 10, 18, 1.4);
  soft.position.set(ELIJAH[0], cy + 3.4, ELIJAH[1] + 1.5);
  ctx.scene.add(soft);

  // Elijah, his mantle wrapped over his face, standing in the entrance of the cave.
  figure(ctx, { pos: ELIJAH, facing: [0, 20], scale: 1.05, colors: { robe: '#8a6a48', mantle: '#5a4632', skin: '#9c6a45', hair: '#cfc6b8', sash: '#3a2a1c', arms: [0.15, 1.2] }, extras: { veil: '#5a4632' } });
}

export default {
  title: '1 Kings 19:9-13: The still small voice',
  subtitle: 'Horeb, the mount of God. After the fire, a still small voice',
  seed: 32,

  style: {
    ink: '#24161a',
    toonSteps: [0.38, 0.7, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#c9a9a6', near: 120, far: 1100 },
    crack: '#2a1a16',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#a8a0a8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#3e4a78', mid: '#8a86a6', horizon: '#f0c8a8', ground: '#a07a70', glowColor: '#ffe2c0', glowDir: [0.6, 0.15, 0.6] },

  sun: { dir: [0.6, 0.5, 0.65], color: '#ffe0c8', intensity: 2.2, hemi: { sky: '#c8c8e0', ground: '#8a5a4a', intensity: 1.05 }, shadowSize: 60 },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 60,
    hillHeight: 70,
    undulation: 0.6,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#c09276', dirt: '#a8765e', grass: '#8a8458', grassDark: '#6a6a42', plaza: '#c09276', plazaLine: '#c09276',
      scorch: '#2e2220', scorchEdge: '#5a3a2e', hill: '#a87262',
    },
  },

  mountains: { count: 30, distance: [380, 700], height: [110, 240], widthRatio: [1.0, 1.7], colors: ['#a8705a', '#9a6250', '#8a6a6e', '#b8806a'] },

  objects: [{ type: 'stones', count: 900, ring: [3, 80], size: [0.12, 0.5], colors: GRANITE }],
  custom,

  cracks: [
    { from: [2, 4], angle: 0.4, length: 40, width: 0.5 },
    { from: [-4, 8], angle: -2.4, length: 35, width: 0.45 },
    { from: [8, -2], angle: 1.4, length: 30, width: 0.4 },
    { from: [-14, 14], angle: -1.1, length: 30, width: 0.35 },
    { from: [12, 18], angle: 0.9, length: 28, width: 0.35 },
  ],

  smolder: [
    { pos: [18, 16], radius: 2.2, embers: 22, flames: 3, smoke: 12, logs: 2, smokeHeight: 14 },
    { pos: [-22, 22], radius: 2.6, embers: 26, flames: 3, smoke: 13, logs: 3, smokeHeight: 16 },
    { pos: [30, 34], radius: 2, embers: 18, flames: 2, smoke: 10, logs: 2 },
    { pos: [-6, 40], radius: 2.4, embers: 22, flames: 2, smoke: 12, logs: 3 },
  ],

  clouds: {
    layers: [{ count: 40, distance: [300, 800], height: [80, 200], size: [40, 90], color: '#f2d8c8', shade: '#4a3a5a' }],
  },

  figures: [],

  player: { start: [3, 9], lookAt: [0, -12], colors: { robe: '#7a6a52', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
