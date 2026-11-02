// Jonah 1: in the mighty tempest the mariners take up Jonah and cast him forth into the sea, and the great fish rises.
// x is east, z is south. The ship lies along z with its bow to the north. The player stands on deck at the stern.
import * as THREE from 'three';
import { Batch, DAY_STYLE, attach, ball, box, cyl, glow, lightning, makeRng, person } from './lib/ot-38-kit.js';
import { FX_LAYER } from '../engine/renderer.js';
import { makeFigure } from '../engine/people.js';

const SEA = 1.3;
const HULL = { L: 22, B: 6.4, H: 3.4, bottom: 0.2 };
const DECK = HULL.bottom + HULL.H;
const JONAH = [6.6, -1.5];
const FISH = [11.8, 6.8];

function wave(x, z, t) {
  return 0.75 * Math.sin(x * 0.11 + t * 0.9) + 0.55 * Math.sin(z * 0.16 - t * 1.15 + x * 0.04) + 0.35 * Math.sin((x + z) * 0.23 + t * 1.6) + 0.15 * Math.sin(x * 0.5 - z * 0.37 + t * 2.4);
}

// Hull half-width and deck sheer at a point along the keel, t in [-1, 1].
const taper = (t) => 1 - Math.pow(Math.abs(t), 2.2) * 0.93;
const sheer = (t) => t * t * 1.5 + (t < 0 ? t * t * 0.6 : 0);

function hullGeo(B, H, L) {
  const g = new THREE.BoxGeometry(B, H, L, 6, 4, 28);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getZ(i) / (L / 2);
    const k = THREE.MathUtils.clamp((p.getY(i) + H / 2) / H, 0, 1);
    p.setX(i, p.getX(i) * taper(t) * (0.42 + 0.58 * Math.sqrt(k)));
    p.setY(i, p.getY(i) + sheer(t) * (0.4 + 0.6 * k));
  }
  g.computeVertexNormals();
  return g;
}

function ship(b, ctx) {
  const { L, B, H, bottom } = HULL;
  const hull = hullGeo(B, H, L).translate(0, bottom + H / 2, 0);
  b.add('#5e3e26', hull);
  const deck = hullGeo(B * 0.9, 0.12, L * 0.95).translate(0, DECK + 0.02, 0);
  b.add('#a07a50', deck, { cast: false });
  b.add('#c8912e', hullGeo(B * 1.02, 0.35, L * 1.01).translate(0, DECK - 0.5, 0));

  // Bulwark posts and rail along both sides.
  const pts = [];
  for (let z = -L / 2 + 1.2; z <= L / 2 - 1; z += 1.1) {
    const t = z / (L / 2);
    pts.push([B / 2 * taper(t) * 0.97, DECK + sheer(t), z]);
  }
  for (const s of [-1, 1]) {
    pts.forEach(([x, y, z], i) => {
      b.add('#4a3020', cyl(0.06, 0.06, 1, [s * x, y + 0.5, z], [0, 0, 0], 5));
      if (i) {
        const [px, py, pz] = pts[i - 1];
        const a = new THREE.Vector3(s * px, py + 1, pz), c = new THREE.Vector3(s * x, y + 1, z);
        const len = a.distanceTo(c);
        const g = new THREE.CylinderGeometry(0.08, 0.08, len, 5).rotateX(Math.PI / 2);
        g.lookAt(c.clone().sub(a));
        b.add('#7a5230', g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2));
      }
    });
  }
  // Prow post and stern post.
  b.add('#5e3e26', cyl(0.18, 0.25, 3.2, [0, DECK + sheer(-1) + 0.8, -L / 2 + 0.3], [-0.35, 0, 0], 7));
  b.add('#5e3e26', cyl(0.18, 0.25, 2.6, [0, DECK + sheer(1) + 0.6, L / 2 - 0.3], [0.5, 0, 0], 7));

  // Mast, yard, and a sail straining in the wind.
  b.add('#6b4a30', cyl(0.2, 0.28, 13, [0, DECK + 6.5, -2], [0, 0, 0], 8));
  b.add('#6b4a30', cyl(0.12, 0.12, 10, [0, DECK + 11, -2.2], [0, 0, Math.PI / 2 + 0.12], 6));
  for (const s of [-1, 1]) {
    for (const [z0, z1] of [[-2, -9.5], [-2, 7.5]]) {
      const a = new THREE.Vector3(0, DECK + 12.6, z0), c = new THREE.Vector3(s * 2.6, DECK + 0.9, z1);
      const g = new THREE.CylinderGeometry(0.03, 0.03, a.distanceTo(c), 4).rotateX(Math.PI / 2);
      g.lookAt(c.clone().sub(a));
      b.add('#3a2a1c', g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2), { cast: false });
    }
  }
  // Steering oars at the stern.
  for (const s of [-1, 1]) b.add('#6b4a30', cyl(0.1, 0.1, 6, [s * 2.4, DECK - 0.4, L / 2 - 2.5], [0.9, 0, s * 0.25], 6));

  // Cargo lashed and loose on deck, some already thrown over.
  const rng = makeRng(41);
  for (let i = 0; i < 9; i++) {
    const x = (rng() - 0.5) * 3.6, z = -7 + rng() * 4;
    if (rng() < 0.5) b.add('#8a6a40', box(0.9, 0.8, 0.9, [x, DECK + 0.4, z], [0, rng(), 0]));
    else b.add('#a0623e', cyl(0.4, 0.4, 0.9, [x, DECK + 0.45, z], [0, 0, 0], 9));
  }
  b.add('#3a2a1c', box(4.2, 0.08, 4.2, [0, DECK + 0.02, -5]), { cast: false });


  ctx.addCollider({ x: 0, z: 0, hx: 2.5, hz: 8.2, rot: 0, top: DECK + 0.05, walkable: true });
  for (const s of [-1, 1]) ctx.addCollider({ x: s * 2.9, z: 0, hx: 0.3, hz: 9, rot: 0, top: DECK + 1 });
  ctx.addCollider({ x: 0, z: -8.9, hx: 3, hz: 0.4, rot: 0, top: DECK + 1 });
  ctx.addCollider({ x: 0, z: 9.4, hx: 3, hz: 0.4, rot: 0, top: DECK + 1 });
  ctx.addCollider({ x: 0, z: -2, hx: 0.35, hz: 0.35, rot: 0, top: DECK + 13 });
}

function sail(ctx) {
  const g = new THREE.PlaneGeometry(8.6, 7.5, 10, 8);
  const base = g.attributes.position.array.slice();
  const mesh = new THREE.Mesh(g, ctx.kit.toon('#d9c7a3', { side: THREE.DoubleSide }));
  mesh.position.set(0, DECK + 7.2, -2.6);
  mesh.rotation.z = 0.12;
  mesh.castShadow = true;
  ctx.scene.add(mesh);
  const p = g.attributes.position;
  ctx.onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const belly = (1 - (x / 4.3) ** 2) * (1 - ((y + 0.5) / 4.5) ** 2);
      p.setZ(i, belly * (1.6 + 0.35 * Math.sin(t * 3.1 + x * 0.6)) + Math.sin(t * 7 + x * 1.3 + y) * 0.06 * (1 - belly));
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });
}

function sea(ctx) {
  const size = 280, seg = 120;
  const g = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  const colors = new Float32Array(p.count * 3);
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ctx.kit.gradient, flatShading: true });
  const mesh = new THREE.Mesh(g, mat);
  mesh.layers.set(FX_LAYER);
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), ctx.kit.toon('#24474f'));
  far.position.y = SEA - 0.05;
  far.layers.set(FX_LAYER);
  ctx.scene.add(far);
  const deep = new THREE.Color('#24474f'), mid = new THREE.Color('#3a6a70'), foam = new THREE.Color('#e4eee8');
  const c = new THREE.Color();
  const hullMask = (x, z) => Math.max(0, 1 - Math.max(Math.abs(x) / 4.5, Math.abs(z) / 12.5));
  ctx.onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const edge = 1 - THREE.MathUtils.smoothstep(Math.max(Math.abs(x), Math.abs(z)), size * 0.38, size * 0.5);
      const h = wave(x, z, t) * edge;
      p.setY(i, SEA + h * (1 - hullMask(x, z) * 0.8));
      const f = h > 1.05 ? foam : h > 0.3 ? mid : deep;
      c.copy(f);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    p.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  });
  // Spray where the waves break on the hull.
  const sprays = [];
  for (let i = 0; i < 4; i++) sprays.push(glow(ctx, { pos: [0, 0, 0], size: 4, color: '#e4eee8', opacity: 0.3, pulse: 0, additive: false }));
  ctx.onFrame((t) => {
    sprays.forEach((s, i) => {
      const side = i % 2 ? 1 : -1, z = i < 2 ? -9.5 : 9.5;
      const k = Math.max(0, Math.sin(t * 1.4 + i * 1.7));
      s.position.set(side * (3.6 + k), SEA + 0.6 + k * 2, z);
      s.scale.setScalar(2 + k * 3);
      s.material.opacity = 0.3 * k;
    });
  });
}

function floating(b, ctx) {
  const rng = makeRng(14);
  const items = [];
  for (let i = 0; i < 9; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (6 + rng() * 12), z = -16 + rng() * 34;
    const g = rng() < 0.5 ? new THREE.BoxGeometry(0.9, 0.8, 0.9) : new THREE.CylinderGeometry(0.4, 0.4, 0.9, 9).rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(g, ctx.kit.toon(rng() < 0.5 ? '#8a6a40' : '#a0623e'));
    m.castShadow = true;
    ctx.scene.add(m);
    items.push({ m, x, z, ph: rng() * 6 });
  }
  ctx.onFrame((t) => {
    for (const it of items) {
      it.m.position.set(it.x, SEA + wave(it.x, it.z, t) + 0.15, it.z);
      it.m.rotation.set(Math.sin(t + it.ph) * 0.3, it.ph, Math.cos(t * 0.8 + it.ph) * 0.3);
    }
  });
}

// The great fish rising with open mouth beside the falling man.
function fish(ctx) {
  const g = new THREE.Group();
  const body = '#3a4a5c', belly = '#9aa8a8';
  attach(ctx, g, new THREE.SphereGeometry(1, 16, 12).scale(3.4, 3, 9).translate(0, 0, 4), body);
  attach(ctx, g, new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5).scale(3.2, 2.2, 6).translate(0, -0.6, 1.8), belly);
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.6, -1.5);
  g.add(jaw);
  attach(ctx, jaw, new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5).scale(2.6, 1.6, 4).translate(0, 0, -2.2), belly);
  attach(ctx, g, new THREE.SphereGeometry(1, 12, 8).scale(2.2, 1.6, 2.6).translate(0, -0.7, -1.4), '#5a1e22');
  for (const s of [-1, 1]) {
    attach(ctx, g, new THREE.SphereGeometry(0.32, 8, 6), '#e8e0d0', { pos: [s * 2.6, 1.2, -1.4] });
    attach(ctx, g, new THREE.SphereGeometry(0.16, 8, 6), '#1a1410', { pos: [s * 2.85, 1.25, -1.55] });
    attach(ctx, g, new THREE.ConeGeometry(1.4, 4, 4).scale(0.25, 1, 1), body, { pos: [s * 3.6, -0.5, 3], rot: [0, 0, s * 1.1] });
  }
  attach(ctx, g, new THREE.ConeGeometry(1.2, 3, 4).scale(0.25, 1, 1), body, { pos: [0, 3, 6], rot: [-0.5, 0, 0] });
  g.position.set(FISH[0], SEA - 0.8, FISH[1]);
  g.rotation.set(0.35, 0.5, 0, 'YXZ');
  ctx.scene.add(g);
  ctx.onFrame((t) => {
    g.position.y = SEA + 0.6 + Math.sin(t * 0.7) * 0.35;
    jaw.rotation.x = 0.7 + Math.sin(t * 0.9) * 0.08;
  });
}

function crew(ctx) {
  const sailors = [
    { robe: '#7a6a52', mantle: '#8c5a3c', skin: '#8a5a3b', hair: '#2b1a12', sash: '#b5523b' },
    { robe: '#4f6a7a', mantle: '#d9c7a3', skin: '#9c6a45', hair: '#1f140e', sash: '#c8912e' },
    { robe: '#8c3a2a', mantle: '#6b5a4a', skin: '#7a4e33', hair: '#e6d8b8', sash: '#d9c7a3' },
    { robe: '#d9c7a3', mantle: '#4f7f80', skin: '#a87650', hair: '#3a2418', sash: '#8c3a3a' },
    { robe: '#5e4632', mantle: '#c8912e', skin: '#8a5a3b', hair: '#2b1a12', sash: '#4f6a7a' },
  ];
  const y = DECK + 0.05;
  // The two who let him go, leaning over the rail.
  const a = person(ctx, { pos: [2.1, -1.8], y, face: [JONAH[0], JONAH[1]], colors: { ...sailors[0], arms: [0.25, 1.5] } });
  a.rotation.x = 0.25;
  const c = person(ctx, { pos: [2.1, 0.2], y, face: [JONAH[0], JONAH[1]], colors: { ...sailors[1], arms: [0.2, 1.6] } });
  c.rotation.x = 0.25;
  person(ctx, { pos: [0.6, -0.6], y, face: [JONAH[0], JONAH[1]], colors: { ...sailors[2], arms: [0.6, 1.0] } });
  // Others pray, each unto his god, or hold the lines.
  person(ctx, { pos: [-1.6, -4], y, face: [-1, -9], kneel: true, colors: { ...sailors[3], arms: [0.3, 1.2] } });
  person(ctx, { pos: [-1.8, 2.6], y, face: [-2, -10], kneel: true, colors: sailors[4] });
  person(ctx, { pos: [-1.9, -0.8], y, face: [0, -2], colors: { ...sailors[0], arms: [0.4, 1.4] } });
  person(ctx, { pos: [1.6, 5.4], y, face: [3, 9], colors: { ...sailors[2], arms: [0.5, 0.8] } });
  person(ctx, { pos: [-1.2, -6.8], y, face: [0, -2], colors: { ...sailors[1], arms: [0.5, 1.1] } });

  const jonah = makeFigure({ robe: '#b5823a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#d9c7a3', arms: [2.4, 0.2] }, ctx.kit);
  jonah.position.set(JONAH[0], DECK, JONAH[1]);
  jonah.rotation.set(0.2, -Math.PI / 2, -2.1, 'YXZ');
  ctx.scene.add(jonah);
  ctx.onFrame((t) => {
    jonah.position.y = DECK + 1.1 + Math.sin(t * 1.2) * 0.12;
  });
}

function rain(ctx) {
  const n = 1400, span = 70;
  const rng = makeRng(77);
  const pos = new Float32Array(n * 6);
  const drops = Array.from({ length: n }, () => ({ x: (rng() - 0.5) * span, y: rng() * 40, z: (rng() - 0.5) * span, v: 30 + rng() * 12 }));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#c8d4dc', transparent: true, opacity: 0.55, fog: false }));
  lines.layers.set(FX_LAYER);
  lines.frustumCulled = false;
  ctx.scene.add(lines);
  ctx.onFrame((t, dt, cam) => {
    drops.forEach((d, i) => {
      d.y -= d.v * dt;
      if (d.y < 0) d.y += 40;
      const x = cam.position.x + d.x, z = cam.position.z + d.z;
      pos.set([x, d.y, z, x + 0.5, d.y + 1.4, z - 0.2], i * 6);
    });
    g.attributes.position.needsUpdate = true;
  });
}

function custom(ctx) {
  const b = new Batch(ctx);
  ship(b, ctx);
  b.flush();
  sail(ctx);
  sea(ctx);
  floating(b, ctx);
  fish(ctx);
  crew(ctx);
  rain(ctx);
  lightning(ctx, { top: [-60, 140, -160], bottom: [-40, 2, -120], count: 3, light: { color: '#e8ecff', intensity: 3, distance: 600 }, seed: 41 });
  lightning(ctx, { top: [90, 140, -120], bottom: [70, 2, -90], count: 2, seed: 42 });
}

export default {
  title: 'Jonah 1: Jonah and the great fish',
  subtitle: 'A mighty tempest on the sea. "Take me up, and cast me forth into the sea"',
  seed: 41,
  style: { ...DAY_STYLE, ink: '#14181c', fog: { color: '#4a5a62', near: 40, far: 320 }, lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [60, 300, 300, 0.5] } },
  sky: { zenith: '#1c2428', mid: '#3a464c', horizon: '#5a6a6a', ground: '#24474f', glowColor: '#6a7a78', glowDir: [0.3, 0.2, -1] },
  sun: { dir: [0.4, 0.9, 0.3], color: '#c8d4dc', intensity: 1.3, hemi: { sky: '#8a9aa4', ground: '#2a3a40', intensity: 1.3 }, shadowSize: 40 },
  ground: {
    size: 800, segments: 80, flatRadius: 2000, hillHeight: 0, undulation: 0,
    plaza: { center: [0, 5000], size: [1, 1] },
    colors: { sand: '#24474f', dirt: '#24474f', grass: '#24474f', grassDark: '#24474f', plaza: '#24474f', plazaLine: '#24474f', scorch: '#24474f', scorchEdge: '#24474f', hill: '#24474f' },
  },
  objects: [],
  custom,
  clouds: {
    layers: [
      { count: 40, distance: [120, 600], height: [50, 110], size: [50, 110], color: '#4a545c', shade: '#1a1e24', drift: 0.01 },
      { count: 24, distance: [200, 700], height: [110, 180], size: [70, 130], color: '#5a646a', shade: '#22282e' },
    ],
  },
  player: {
    start: [-1.4, 2.5],
    lookAt: [9, -3],
    colors: { robe: '#6b5a4a', mantle: '#8c5a3c', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
