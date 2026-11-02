// 3 Nephi 8-10: the great storm and earthquake. Cities burn, sink, and fall, then a vapor of darkness covers the land.
import * as THREE from 'three';
import { BASE_STYLE, ROBES, flames, glow, house, makeRng, between, pick, FX_LAYER } from './lib/bom-37-kit.js';

const MOURNER_ROBES = { ...ROBES, robes: ['#5e4632', '#4a3a2a', '#6b5a4a', '#3a2f2a', '#7a6a52', '#5a4a40'], mantles: ['#3a2f2a', '#2b211c', '#4a3a2a', '#5e4632'] };
const FIRE_HOUSES = [[-22, -44], [-6, -52], [12, -46], [28, -56], [-34, -62], [4, -70], [40, -40], [-14, -78], [22, -80]];
const LAKE = { x: -78, z: -30, r: 34 };

function lightning(ctx, rng) {
  const bolts = [];
  const mat = new THREE.MeshBasicMaterial({ color: '#f4ecff', fog: false, transparent: true, depthWrite: false });
  for (let b = 0; b < 4; b++) {
    const path = new THREE.CurvePath();
    let p = new THREE.Vector3((b - 1.5) * 55 + between(rng, [-15, 15]), 150, between(rng, [-200, -130]));
    const base = p.clone();
    while (p.y > 0) {
      const next = p.clone().add(new THREE.Vector3(between(rng, [-9, 9]), -between(rng, [10, 20]), between(rng, [-4, 4])));
      next.y = Math.max(0, next.y);
      path.add(new THREE.LineCurve3(p, next));
      p = next;
    }
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, path.curves.length * 2, 0.7, 4, false), mat);
    mesh.layers.set(FX_LAYER);
    mesh.frustumCulled = false;
    mesh.visible = false;
    ctx.scene.add(mesh);
    const halo = glow(ctx, [base.x, base.y - 20, base.z], 120, '#b9a8ff', 0, 0);
    bolts.push({ mesh, halo, phase: b * 1.1 + rng() * 0.6 });
  }
  const flash = new THREE.DirectionalLight('#c9c0ff', 0);
  flash.position.set(0, 200, -150);
  ctx.scene.add(flash);
  ctx.onFrame((t) => {
    let lit = 0;
    for (const b of bolts) {
      const u = (t + b.phase) % 4.4;
      const on = u < 0.12 || (u > 0.22 && u < 0.3);
      b.mesh.visible = on;
      b.halo.material.opacity = on ? 0.55 : Math.max(0, 0.3 - u) * 0.8;
      if (on) lit = 1;
    }
    flash.intensity = lit * 1.6;
  });
}

function sunkenCity(ctx, rng) {
  const y = ctx.terrainHeight(LAKE.x, LAKE.z) + 0.35;
  const shape = new THREE.Shape();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const r = LAKE.r * (0.85 + 0.15 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 7));
    const px = LAKE.x + Math.cos(a) * r, pz = LAKE.z + Math.sin(a) * r;
    if (i === 0) shape.moveTo(px, -pz);
    else shape.lineTo(px, -pz);
  }
  const geo = new THREE.ShapeGeometry(shape, 8);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  const water = new THREE.Mesh(geo, ctx.kit.toon('#2a3a4a', { emissive: '#0c141c' }));
  water.receiveShadow = true;
  ctx.scene.add(water);
  const tops = [];
  for (let i = 0; i < 9; i++) {
    const a = rng() * 6.28, r = Math.sqrt(rng()) * LAKE.r * 0.7;
    const x = LAKE.x + Math.cos(a) * r, z = LAKE.z + Math.sin(a) * r;
    const g = new THREE.BoxGeometry(between(rng, [3, 7]), between(rng, [0.6, 2.2]), between(rng, [3, 6]));
    g.rotateZ((rng() - 0.5) * 0.4);
    g.rotateY(rng() * 3);
    g.translate(x, y, z);
    tops.push(g);
  }
  const ruin = new THREE.Mesh(mergeBoxes(tops), ctx.kit.stoneMat('#6e5e50'));
  ruin.castShadow = true;
  ctx.scene.add(ruin);
  ctx.exclude({ kind: 'circle', x: LAKE.x, z: LAKE.z, r: LAKE.r + 2 });
  ctx.addCollider({ x: LAKE.x, z: LAKE.z, hx: LAKE.r * 0.7, hz: LAKE.r * 0.7, rot: 0, top: y + 50 });
}

function mergeBoxes(list) {
  const pos = [], nor = [], uv = [];
  for (const g of list) {
    const n = g.index ? g.toNonIndexed() : g;
    pos.push(...n.attributes.position.array);
    nor.push(...n.attributes.normal.array);
    uv.push(...n.attributes.uv.array);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}

export default {
  title: '3 Nephi 8-10: The destruction and three days of darkness',
  subtitle: 'Fire, earthquake, and a vapor of darkness no light can pierce',
  seed: 40,

  style: {
    ...BASE_STYLE,
    ink: '#0a0605',
    toonSteps: [0.45, 0.75, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [40, 260, 200, 0.4] },
    fog: { color: '#221a1e', near: 45, far: 280 },
    crack: '#120c0a',
    flameOuter: '#ff7a1c',
    flameInner: '#ffd36a',
    smoke: '#3a3236',
    smokeShade: '#0c080c',
  },

  sky: { zenith: '#0c0a10', mid: '#1c171e', horizon: '#3a2228', ground: '#140f12', glowColor: '#7a3420', glowDir: [0, 0.08, -1] },

  sun: { dir: [0.2, 0.7, -0.7], color: '#b08070', intensity: 1.1, hemi: { sky: '#7a6070', ground: '#5a3424', intensity: 1.45 }, shadowSize: 70 },

  ground: {
    size: 1200, segments: 240, flatRadius: 130, hillHeight: 40, undulation: 0.45,
    plaza: { center: [0, -55], size: [60, 50] },
    colors: { sand: '#6a5646', dirt: '#5a4636', grass: '#4a4a36', grassDark: '#36382a', plaza: '#7a6a58', plazaLine: '#5a4a3a', scorch: '#1a120e', scorchEdge: '#3a2418', hill: '#3a3a30' },
  },

  mountains: { count: 30, distance: [480, 760], height: [60, 150], widthRatio: [1.4, 2.4], colors: ['#241e24', '#2a2228', '#1e1a20'] },

  objects: [
    { type: 'ruinHouse', pos: [-16, 4], size: [9, 7], height: 4, damage: 0.75, rot: 0.2, color: '#8a7460', fallenRoof: true },
    { type: 'ruinHouse', pos: [20, 0], size: [10, 8], height: 4, damage: 0.7, rot: -0.3, color: '#7e6a58' },
    { type: 'ruinHouse', pos: [-30, -20], size: [8, 8], height: 3.5, damage: 0.8, rot: 0.5, color: '#8a7460' },
    { type: 'ruinHouse', pos: [34, -22], size: [12, 8], height: 4.5, damage: 0.6, rot: 0.1, color: '#7e6a58', fallenRoof: true },
    { type: 'ruinHouse', pos: [-44, 22], size: [10, 8], height: 4, damage: 0.85, rot: -0.2, color: '#8a7460' },
    { type: 'ruinHouse', pos: [48, 18], size: [9, 9], height: 4, damage: 0.8, rot: 0.4, color: '#7e6a58' },
    { type: 'stepPyramid', pos: [62, -78], base: [30, 30], tiers: 4, tierHeight: 3.2, inset: 2.6, rot: -0.35, stair: { width: 7, extra: 3, rise: 0.42 }, shrine: { size: [10, 8, 5.5], comb: 3 }, rubble: 70, colors: { stone: '#8a7a66', stair: '#7e6e5a', shrine: '#6e3a2e', interior: '#120c0a', fret: ['#6e3a2e', '#8a7a66'], roofFret: ['#2a4a48', '#8a7a66'] } },
    { type: 'wall', from: [-10, -28], to: [16, -32], height: 3, damage: 0.8, color: '#7e6a58', fallSide: 1 },
    { type: 'columns', from: [-12, -10], to: [12, -10], count: 5, radius: 0.55, height: 5, broken: 0.8, color: '#8a7a66' },
    { type: 'trees', count: 70, ring: [60, 220], height: [5, 9], broken: 0.5, fallen: 0.4, trunkColor: '#2a1e18', leafColors: ['#2a3a2e', '#24342a'] },
    { type: 'stones', count: 700, ring: [3, 110], size: [0.15, 0.6], colors: ['#6e5e50', '#5a4a3e', '#7e6a58'] },
  ],

  cracks: [
    { from: [2, 14], angle: 2.9, length: 60, width: 0.7 },
    { from: [-6, 26], angle: -2.6, length: 50, width: 0.55 },
    { from: [10, -6], angle: 0.8, length: 60, width: 0.6 },
    { from: [-20, -6], angle: -1.0, length: 70, width: 0.6 },
    { from: [26, 30], angle: 2.2, length: 50, width: 0.5 },
    { from: [-34, 40], angle: -2.0, length: 40, width: 0.5 },
  ],

  smolder: FIRE_HOUSES.map(([x, z], i) => ({ pos: [x, z + 6], radius: 2.5, embers: 26, flames: 5, smoke: 12, logs: 3, smokeScale: 2.2, smokeHeight: 26, scorch: 4 + (i % 3) })),

  custom(ctx) {
    const rng = makeRng(40);
    const fire = [];
    for (const [n, [x, z]] of FIRE_HOUSES.entries()) {
      const w = between(rng, [6, 9]), d = between(rng, [5, 7]), h = between(rng, [3.4, 4.4]);
      const stories = rng() < 0.4 ? 2 : 1;
      house(ctx, { pos: [x, z], size: [w, d], height: h, stories, color: pick(rng, ['#7e6a58', '#8a7460', '#6e5e50']), roof: '#3a2a22', door: '#120c0a' });
      const top = ctx.terrainHeight(x, z) - 0.2 + h * stories + 0.35;
      for (let i = 0; i < 9; i++) fire.push({ x: x + between(rng, [-w / 2.4, w / 2.4]), y: top, z: z + between(rng, [-d / 2.4, d / 2.4]), size: between(rng, [2.2, 4.2]) });
      glow(ctx, [x, top + 2.5, z], 26, '#ff7a2c', 0.55, 0.08);
      if (n % 2) continue;
      const light = new THREE.PointLight('#ff8a3c', 30, 40, 1.4);
      light.position.set(x, top + 3, z);
      ctx.scene.add(light);
      ctx.onFrame((t) => (light.intensity = 26 + Math.sin(t * 11 + x) * 5 + Math.sin(t * 7 + z) * 4));
    }
    flames(ctx, fire, { outer: '#ff7a1c', inner: '#ffd36a' });
    sunkenCity(ctx, rng);
    lightning(ctx, rng);
  },

  clouds: {
    layers: [
      { count: 60, distance: [250, 700], height: [60, 150], size: [50, 100], color: '#2e2630', shade: '#0c080c', drift: 0.006 },
      { count: 30, distance: [150, 400], height: [50, 90], size: [40, 80], color: '#3a2a2a', shade: '#140c0c', drift: 0.01 },
    ],
  },

  crowd: {
    seed: 40,
    minSpacing: 0.62,
    facing: [0, -55],
    colors: MOURNER_ROBES,
    aisles: [{ from: [0, 40], to: [0, 10], width: 3 }],
    groups: [
      { center: [-5, -3], radius: [0, 4], count: 30, kneel: 0.7, children: 0.15, facing: [0, -60], facingJitter: 0.8, lean: 0.4 },
      { center: [7, -5], radius: [0, 3.5], count: 22, kneel: 0.6, children: 0.1, facing: [10, -60], facingJitter: 0.8, lean: 0.4 },
      { center: [-8, 22], radius: [0, 5], count: 24, kneel: 0.7, children: 0.15, facing: [0, -60], facingJitter: 1.2, lean: 0.4 },
      { center: [-26, 8], radius: [0, 6], count: 34, kneel: 0.6, children: 0.15, facing: [-20, -60], facingJitter: 1.5, lean: 0.4 },
      { center: [30, 12], radius: [0, 5], count: 30, kneel: 0.6, children: 0.15, facing: [30, -60], facingJitter: 1.5, lean: 0.4 },
    ],
  },

  player: {
    start: [0, 6],
    lookAt: [0, -55],
    colors: { robe: '#5e4632', mantle: '#3a2f2a', skin: '#a8724a', hair: '#2b1a12', sash: '#7a6a52' },
  },
};
