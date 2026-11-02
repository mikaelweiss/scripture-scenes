// 1 Nephi 16:10: Lehi rises in the morning and finds a round ball of curious workmanship at his tent door.
// x is east, z is south. The sun rises in the east over the dunes; Lehi's tent opens to the south.
import * as THREE from 'three';
import { Batch, DAY_STYLE, addSun, camel, glow, goat, makeRng, person, tent } from './lib/bom-01-kit.js';

const BALL = [0, -3.3];
const TENT = [0, -8.5];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(505);
  addSun(ctx, { dir: [1, 0.12, -0.25], size: 70, color: '#fff0c0', halo: '#ffc070' });

  tent(b, ctx, { pos: TENT, size: [6, 6.5], height: 3, rot: 0, color: '#4a3528', flap: '#6b4a33' });
  tent(b, ctx, { pos: [-11, -6], size: [4.6, 5], height: 2.5, rot: 0.6, color: '#5e4632' });
  tent(b, ctx, { pos: [10, -9], size: [4.6, 5], height: 2.5, rot: -0.5, color: '#6b5240', flap: '#8c6a48' });
  tent(b, ctx, { pos: [-19, 3], size: [4.2, 4.8], height: 2.3, rot: 1.1, color: '#4a3528' });
  tent(b, ctx, { pos: [18, 2], size: [4.2, 4.8], height: 2.3, rot: -1.2, color: '#5e4632' });
  tent(b, ctx, { pos: [-4, -22], size: [4.2, 4.8], height: 2.3, rot: 0.2, color: '#6b5240' });
  camel(b, ctx, { pos: [-14, 10], rot: 2.4, couched: true, color: '#c49a62', load: '#b5523b' });
  camel(b, ctx, { pos: [13, 12], rot: -2.2, couched: true, color: '#b88a58' });
  camel(b, ctx, { pos: [24, -6], rot: -1.4, color: '#cfa46c' });
  for (let i = 0; i < 7; i++) goat(b, ctx, { pos: [-24 + rng() * 8, -10 + rng() * 8], rot: rng() * 6, color: rng() < 0.5 ? '#3a2a20' : '#e6d8b8' });
  for (let i = 0; i < 6; i++) {
    const x = -6 + (i % 3) * 0.7, z = -12 + Math.floor(i / 3) * 0.7;
    b.add(i % 2 ? '#b5674a' : '#c8a07a', new THREE.SphereGeometry(0.3, 8, 6).scale(1, 1.3, 1).translate(x - 2, ctx.terrainHeight(x, z) + 0.35, z + 5));
  }
  b.flush();

  // The Liahona: a brass ball with two spindles, one pointing the way.
  const by = ctx.terrainHeight(...BALL);
  const brass = ctx.kit.toon('#d9a441', { emissive: '#4a2e08' });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), brass);
  ball.position.set(BALL[0], by + 0.34, BALL[1]);
  ball.castShadow = true;
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 6, 24), ctx.kit.toon('#b07a2c'));
  band.rotation.x = Math.PI / 2;
  band.position.copy(ball.position);
  ctx.scene.add(ball, band);
  const spindle = (len) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.04, len, 6).rotateX(Math.PI / 2).translate(0, 0, len / 2), ctx.kit.toon('#f1d27a', { emissive: '#5a3a10' }));
    g.add(m);
    g.position.set(BALL[0], by + 0.72, BALL[1]);
    ctx.scene.add(g);
    return g;
  };
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.08, 6), brass);
  post.position.set(BALL[0], by + 0.7, BALL[1]);
  ctx.scene.add(post);
  const s1 = spindle(0.55), s2 = spindle(0.4);
  s2.position.y += 0.05;
  ctx.onFrame((t) => {
    s1.rotation.y = 2.4 + Math.sin(t * 0.4) * 0.08;
    s2.rotation.y = 2.4 + Math.sin(t * 0.7 + 1) * 0.6;
  });
  glow(ctx, { pos: [BALL[0], by + 0.5, BALL[1]], size: 2.6, color: '#ffd27a', opacity: 0.7, pulse: 0.08 });
  ctx.exclude({ kind: 'circle', x: BALL[0], z: BALL[1], r: 1.2 });
  ctx.addCollider({ x: BALL[0], z: BALL[1], hx: 0.35, hz: 0.35, rot: 0, top: by + 0.7 });

  // Lehi stooping over the ball at his tent door.
  person(ctx, { pos: [-0.2, -4.6], y: ctx.terrainHeight(-0.2, -4.6), face: BALL, scale: 1.06, kneel: true, colors: { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#a8724a', hair: '#d9d2c4', sash: '#c8912e', arms: [0.35, 0.9] } });
}

export default {
  title: '1 Nephi 16:10: The Liahona at the tent door',
  subtitle: 'Morning in the wilderness camp',
  seed: 505,
  style: { ...DAY_STYLE, fog: { color: '#f2c896', near: 120, far: 900 } },
  sky: { zenith: '#4d79a8', mid: '#a8bcc8', horizon: '#f8c88a', ground: '#d9a870', glowColor: '#ffd8a0', glowDir: [1, 0.12, -0.25] },
  sun: { dir: [1, 0.32, -0.25], color: '#ffd9a8', intensity: 2.8, hemi: { sky: '#c8d8e8', ground: '#b9784a', intensity: 1.1 }, shadowSize: 50 },
  ground: {
    size: 1400, segments: 260, flatRadius: 70, hillHeight: 22, undulation: 0.5,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: { sand: '#e0b47a', dirt: '#cf9e66', grass: '#b8a46a', grassDark: '#9a8a52', plaza: '#e0b47a', plazaLine: '#cf9e66', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#d8a86e' },
  },
  mountains: { count: 32, distance: [420, 750], height: [40, 110], widthRatio: [1.6, 2.6], colors: ['#c48a62', '#b07a58', '#d09a6c', '#a87058'] },
  objects: [
    { type: 'stones', count: 260, ring: [3, 90], size: [0.1, 0.45], colors: ['#c49a72', '#a8805e', '#d8b48a'] },
    { type: 'trees', count: 14, ring: [40, 120], height: [3, 5], broken: 0.3, fallen: 0, trunkColor: '#6b5a4a', leafColors: ['#8a9a62', '#9aa46a'] },
  ],
  smolder: [{ pos: [8, -1], radius: 0.8, embers: 10, flames: 1, smoke: 0, logs: 3, scorch: 1.2, smokeScale: 0.35, smokeHeight: 5 }],
  custom,
  clouds: { layers: [{ count: 20, distance: [400, 800], height: [90, 180], size: [40, 80], color: '#fff0dc', shade: '#c88a7a' }] },
  light: { rings: [{ at: BALL, lift: 0, radius: 1.1, width: 0.12, height: 1.2, color: '#ffd98a', intensity: 0.8, wallIntensity: 0.35 }] },
  crowd: {
    seed: 8,
    minSpacing: 0.85,
    facing: BALL,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#6f8a6a', '#4f7f80', '#e6d8b8'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#c08f66'],
      hair: ['#2b1a12', '#3a2418', '#1f140e'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
    },
    groups: [{ center: BALL, radius: [2.2, 4.6], angle: [1.25, 5.03], count: 16, children: 0.25, facingJitter: 0.3 }],
  },
  player: {
    start: [2.6, 2.2],
    lookAt: [-2.6, -7],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
