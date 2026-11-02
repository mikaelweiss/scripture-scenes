// Ezekiel 37: in the valley of dry bones the bones come together, flesh comes upon them, and the breath from the four winds makes them a living army.
// x is east, z is south. Ezekiel prophesies on a rock near the player. Scattered bones lie nearby, the risen army stands to the north.
import * as THREE from 'three';
import { Batch, DAY_STYLE, ball, glow, lying, makeRng, person } from './lib/ot-38-kit.js';
import { FX_LAYER } from '../engine/renderer.js';
import { glowTexture } from '../engine/textures.js';

const EZEKIEL = [-3, 7];
const ARMY = [0, -44];
const BONE = '#f2ead6';
const BONE_GLOW = '#5a5244';

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const v = new THREE.Vector3();
const sc = new THREE.Vector3(1, 1, 1);

function scatteredBones(ctx) {
  const rng = makeRng(44);
  const n = 1400;
  const bones = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.075, 0.42, 3, 6), ctx.kit.toon('#ffffff', { emissive: BONE_GLOW }), n);
  const skulls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 10, 8).scale(1, 0.95, 1.2), ctx.kit.toon('#ffffff', { emissive: BONE_GLOW }), 160);
  const shade = new THREE.Color();
  let k = 0, s = 0;
  for (let i = 0; i < n * 3 && (k < n || s < 160); i++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 70;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 4;
    if (z < -24 || ctx.blocked(x, z, 0.2)) continue;
    const y = ctx.terrainHeight(x, z);
    if (rng() < 0.1 && s < 160) {
      m4.compose(v.set(x, y + 0.1, z), q.setFromEuler(e.set(rng() * 0.6, rng() * 6.28, rng() * 0.6)), sc.set(1, 1, 1));
      skulls.setMatrixAt(s, m4);
      skulls.setColorAt(s++, shade.set(BONE).multiplyScalar(0.85 + rng() * 0.15));
    } else if (k < n) {
      const len = 0.7 + rng() * 0.7;
      m4.compose(v.set(x, y + 0.04, z), q.setFromEuler(e.set(Math.PI / 2, rng() * 6.28, 0, 'YXZ')), sc.set(1, len, 1));
      bones.setMatrixAt(k, m4);
      bones.setColorAt(k++, shade.set(BONE).multiplyScalar(0.8 + rng() * 0.2));
    }
  }
  bones.count = k;
  skulls.count = s;
  for (const m of [bones, skulls]) {
    m.castShadow = true;
    m.receiveShadow = true;
    ctx.scene.add(m);
  }
}

// Bone to his bone: skeletons drawing together from the scattered bones, again and again.
function assembling(ctx) {
  const rng = makeRng(37);
  const layout = [
    { p: [0, 0.12, 0], r: [Math.PI / 2, 0, 0], l: 1.4 },
    { p: [0, 0.14, 0.95], r: [0, 0, 0], skull: true },
    { p: [-0.32, 0.08, 0.25], r: [Math.PI / 2, 0, 0.25], l: 1.2 },
    { p: [0.32, 0.08, 0.25], r: [Math.PI / 2, 0, -0.25], l: 1.2 },
    { p: [-0.16, 0.08, -1.05], r: [Math.PI / 2, 0, 0.06], l: 1.8 },
    { p: [0.16, 0.08, -1.05], r: [Math.PI / 2, 0, -0.06], l: 1.8 },
    { p: [0, 0.12, 0.35], r: [0, 0, Math.PI / 2], l: 0.9 },
    { p: [0, 0.12, 0.1], r: [0, 0, Math.PI / 2], l: 0.9 },
    { p: [0, 0.12, -0.35], r: [0, 0, Math.PI / 2], l: 0.8 },
  ];
  const skeletons = [];
  for (let i = 0; i < 18; i++) {
    const x = (rng() - 0.5) * 30, z = 2 - rng() * 14;
    if (ctx.blocked(x, z, 1)) continue;
    skeletons.push({ x, z, y: ctx.terrainHeight(x, z), yaw: rng() * 6.28, delay: rng() * 3 });
  }
  const parts = [];
  for (const sk of skeletons) {
    for (const part of layout) {
      const a = rng() * 6.28, r = 1.5 + rng() * 3.5;
      parts.push({ sk, part, from: [sk.x + Math.sin(a) * r, sk.z + Math.cos(a) * r], spin: rng() * 6.28, lag: rng() * 1.5 });
    }
  }
  const boneParts = parts.filter((p) => !p.part.skull), skullParts = parts.filter((p) => p.part.skull);
  const bones = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.075, 0.42, 3, 6), ctx.kit.toon(BONE, { emissive: BONE_GLOW }), boneParts.length);
  const skulls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 10, 8).scale(1, 0.95, 1.2), ctx.kit.toon(BONE, { emissive: BONE_GLOW }), skullParts.length);
  for (const m of [bones, skulls]) {
    m.castShadow = true;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    ctx.scene.add(m);
  }
  const target = new THREE.Vector3(), start = new THREE.Vector3();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), yawQ = new THREE.Quaternion();
  const place = (mesh, list, t) => {
    list.forEach((pp, i) => {
      const { sk, part } = pp;
      const cycle = (t + 4 - sk.delay - pp.lag + 40) % 40;
      const f = THREE.MathUtils.smootherstep(cycle, 0, 5);
      const c = Math.cos(sk.yaw), s = Math.sin(sk.yaw);
      target.set(sk.x + part.p[0] * c + part.p[2] * s, sk.y + part.p[1], sk.z - part.p[0] * s + part.p[2] * c);
      start.set(pp.from[0], ctx.terrainHeight(pp.from[0], pp.from[1]) + 0.05, pp.from[1]);
      v.lerpVectors(start, target, f);
      v.y += Math.sin(f * Math.PI) * 0.8;
      yawQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), sk.yaw);
      qb.setFromEuler(e.set(...part.r, 'YXZ')).premultiply(yawQ);
      qa.setFromEuler(e.set(Math.PI / 2, pp.spin, 0, 'YXZ'));
      q.slerpQuaternions(qa, qb, f);
      mesh.setMatrixAt(i, m4.compose(v, q, sc.set(1, part.l ?? 1, 1)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  ctx.onFrame((t) => {
    place(bones, boneParts, t);
    place(skulls, skullParts, t);
  });
}

// Bodies with sinews, flesh and skin, but no breath yet.
function bodies(ctx) {
  const rng = makeRng(9);
  const skins = ['#d8c4a8', '#c8b090', '#d0b898', '#bca282'];
  for (let i = 0; i < 40; i++) {
    const x = (rng() - 0.5) * 46, z = -16 - rng() * 12;
    if (ctx.blocked(x, z, 1)) continue;
    const c = skins[i % skins.length];
    lying(ctx, { pos: [x, z], dir: rng() * 6.28, prop: rng() < 0.3 ? 0.5 : 0.05, colors: { robe: c, mantle: c, skin: c, hair: '#8a7a68' } });
  }
}

// The breath coming from the four winds, swirling down into the army.
function winds(ctx) {
  const streams = [0.8, 2.4, 3.9, 5.5];
  const per = 70, trail = 5;
  const n = streams.length * per * trail;
  const pos = new Float32Array(n * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, map: glowTexture(), color: '#fff2cc', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8, fog: false }));
  pts.layers.set(FX_LAYER);
  pts.frustumCulled = false;
  ctx.scene.add(pts);
  const rng = makeRng(4);
  const seeds = Array.from({ length: streams.length * per }, () => ({ off: rng(), jit: (rng() - 0.5) * 10, h: (rng() - 0.5) * 6 }));
  const [cx, cz] = ARMY;
  ctx.onFrame((t) => {
    let k = 0;
    streams.forEach((a0, si) => {
      for (let j = 0; j < per; j++) {
        const sd = seeds[si * per + j];
        for (let tr = 0; tr < trail; tr++) {
          const s = (t * 0.05 + sd.off - tr * 0.006) % 1;
          const r = 140 * (1 - s) + 6;
          const a = a0 + s * 3.2;
          pos[k++] = cx + Math.sin(a) * (r + sd.jit);
          pos[k++] = 4 + 46 * (1 - s) * (1 - s) + sd.h * (1 - s) + 3 * Math.sin(s * 12 + sd.off * 6);
          pos[k++] = cz + Math.cos(a) * (r + sd.jit);
        }
      }
    });
    g.attributes.position.needsUpdate = true;
  });
  glow(ctx, { pos: [cx, 6, cz], size: 36, color: '#fff0c8', opacity: 0.14, pulse: 0.04 });
}

function custom(ctx) {
  const b = new Batch(ctx);
  const [ex, ez] = EZEKIEL;
  const ey = ctx.terrainHeight(ex, ez);
  b.add('#a89070', ball(1.8, [ex, ey - 0.2, ez], [1.4, 0.55, 1.1], 7), { stone: true });
  ctx.addCollider({ x: ex, z: ez, hx: 1.9, hz: 1.4, rot: 0, top: ey + 0.75, walkable: true });
  const rng = makeRng(12);
  for (let i = 0; i < 40; i++) {
    const a = rng() * 6.28, r = 20 + rng() * 80;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 10;
    if (Math.abs(x) < 14 && z > -80 && z < 20) continue;
    const s = 1 + rng() * 2.5;
    b.add(rng() < 0.5 ? '#a89070' : '#988060', ball(s, [x, ctx.terrainHeight(x, z) - s * 0.3, z], [1.3, 0.7, 1], 6), { stone: true });
  }
  b.flush();
  ctx.exclude({ kind: 'circle', x: ex, z: ez, r: 2.4 });
  person(ctx, { pos: EZEKIEL, y: ey + 0.75, face: [0, -40], scale: 1.08, colors: { robe: '#d9c7a3', mantle: '#4f6fa0', skin: '#a8724a', hair: '#cfc6b4', sash: '#8c3a3a', arms: [1.1, 0.6] } });
  scatteredBones(ctx);
  assembling(ctx);
  bodies(ctx);
  winds(ctx);
}

export default {
  title: 'Ezekiel 37:1-10: The valley of dry bones',
  subtitle: 'The valley full of bones. "Come from the four winds, O breath, and breathe upon these slain"',
  seed: 44,
  style: { ...DAY_STYLE, fog: { color: '#d8cdb8', near: 90, far: 650 } },
  sky: { zenith: '#56708c', mid: '#a8a8a0', horizon: '#ecdcbc', ground: '#c4ac84', glowColor: '#fff0cc', glowDir: [0, 0.25, -1] },
  sun: { dir: [-0.3, 0.6, -0.7], color: '#fff0d8', intensity: 2.1, hemi: { sky: '#d0d4d8', ground: '#a88a62', intensity: 1.2 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 280, flatRadius: 75, hillHeight: 46, undulation: 0.35,
    plaza: { center: [0, 5000], size: [1, 1] },
    colors: { sand: '#cdb48a', dirt: '#b89a70', grass: '#a49c6a', grassDark: '#8c845a', plaza: '#d2c0a0', plazaLine: '#ac9878', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a88a68' },
  },
  mountains: { count: 30, distance: [420, 760], height: [60, 140], widthRatio: [1.6, 2.6], colors: ['#a8907a', '#988270', '#b49a80'] },
  objects: [
    { type: 'stones', count: 500, ring: [6, 120], size: [0.12, 0.45], colors: ['#b89a70', '#a8805c', '#c9a87a'] },
  ],
  custom,
  clouds: { layers: [{ count: 30, distance: [350, 800], height: [90, 170], size: [40, 90], color: '#f4ecdc', shade: '#8a8a94' }] },
  crowd: {
    seed: 44,
    minSpacing: 0.85,
    facing: EZEKIEL,
    colors: {
      robes: ['#b5523b', '#8c5a3c', '#c8a97a', '#7a6a52', '#6f8a6a', '#4f7f80', '#a87b4f', '#d9c7a3', '#5e4632'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#6b5a4a'],
      skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33'],
      hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
      wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3'],
    },
    groups: [
      { shape: 'rect', center: ARMY, size: [84, 26], count: 1700, kneel: 0.08, facingJitter: 0.15, lean: 0.02 },
      { shape: 'rect', center: [0, -29], size: [60, 5], count: 110, kneel: 0.5, facingJitter: 0.6, lean: 0.3 },
    ],
  },
  player: {
    start: [2, 6],
    lookAt: [0, -50],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
