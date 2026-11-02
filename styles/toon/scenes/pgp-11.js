// Joseph Smith-History 1:68-73. The bank of the Susquehanna River near Harmony, Pennsylvania, May 15, 1829.
// x is east, z is south. The river flows east along the north edge of the clearing.
import * as THREE from 'three';
import { FX_LAYER } from '../engine/renderer.js';
import { glowTexture } from '../engine/textures.js';
import { arms, ball, baseStyle, box, glow, groundSpec, heavenly, lightCone, makeRng, mesh, scatter, scatterBits, setArm, settler, trees } from './lib/pgp-07-kit.js';

const WATER_Y = 0.45;
const JOHN = [-2.4, -3.9];
const JOSEPH = [-0.5, -6.5];
const OLIVER = [0.65, -6.8];
const START = [2.5, -3.5];

const bankZ = (x) => -5 + 1.6 * Math.sin(x * 0.045) + 0.7 * Math.sin(x * 0.13 + 1);
const farZ = (x) => -150 + 6 * Math.sin(x * 0.02) + 3 * Math.sin(x * 0.07);

function river(ctx) {
  const pos = [], idx = [];
  const xs = [];
  for (let x = -600; x <= 600; x += 4) xs.push(x);
  xs.forEach((x, i) => {
    pos.push(x, WATER_Y, bankZ(x), x, WATER_Y, farZ(x));
    if (i < xs.length - 1) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, ctx.kit.toon('#4f8fa6', { side: THREE.DoubleSide }));
  m.receiveShadow = true;
  ctx.scene.add(m);

  // Drifting glints carried downstream.
  const rng = makeRng(17);
  const n = 220;
  const glints = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 10).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#d8f0f0', transparent: true, opacity: 0.75, depthWrite: false }), n);
  glints.layers.set(FX_LAYER);
  const items = Array.from({ length: n }, () => {
    const x = -160 + rng() * 320;
    const t = rng() ** 1.6;
    return { x, t, len: 0.6 + rng() * 2.2, speed: 0.6 + rng() * 0.8 };
  });
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const place = () => {
    items.forEach((it, i) => {
      const z = bankZ(it.x) + (farZ(it.x) - bankZ(it.x)) * it.t - 0.8;
      p.set(it.x, WATER_Y + 0.03, z);
      s.set(it.len, 1, 0.07 + it.len * 0.02);
      glints.setMatrixAt(i, mtx.compose(p, q, s));
    });
    glints.instanceMatrix.needsUpdate = true;
  };
  place();
  glints.frustumCulled = false;
  ctx.scene.add(glints);
  ctx.onFrame((t, dt) => {
    for (const it of items) {
      it.x += it.speed * dt;
      if (it.x > 160) it.x -= 320;
    }
    place();
  });

  // Mud and stones along the near bank, reeds at the water's edge.
  const mud = [], mudIdx = [];
  xs.filter((x) => Math.abs(x) < 200).forEach((x, i, arr) => {
    const z = bankZ(x);
    mud.push(x, ctx.terrainHeight(x, z + 0.3) + 0.05, z - 0.2, x, ctx.terrainHeight(x, z + 2.2) + 0.04, z + 2.2);
    if (i < arr.length - 1) mudIdx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  });
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.Float32BufferAttribute(mud, 3));
  mg.setIndex(mudIdx);
  mg.computeVertexNormals();
  const mm = new THREE.Mesh(mg, ctx.kit.toon('#a89470', { side: THREE.DoubleSide }));
  mm.receiveShadow = true;
  ctx.scene.add(mm);

  const reeds = [];
  for (let i = 0; i < 260; i++) {
    const x = -120 + rng() * 240;
    if (x > JOHN[0] - 5 && x < OLIVER[0] + 5) continue;
    const z = bankZ(x) + (rng() - 0.6) * 1.2;
    const h = 0.6 + rng() * 0.8;
    reeds.push(new THREE.ConeGeometry(0.09, h, 5).translate(x, WATER_Y * 0.5 + h / 2, z));
  }
  mesh(ctx, reeds, '#9cbc5a', { cast: false });
  for (let x = -100; x < 100; x += 8) ctx.addCollider({ x: x + 4, z: bankZ(x + 4) - 7, hx: 4.2, hz: 0.4, rot: 0, top: 50 });
}

export default {
  title: 'Joseph Smith-History 1:68-73: John the Baptist restores the priesthood',
  subtitle: 'The bank of the Susquehanna River, May 15, 1829',
  seed: 1529,

  style: baseStyle({ fog: { color: '#dde8dc', near: 90, far: 900 } }),

  sky: {
    zenith: '#4a8ac2',
    mid: '#96c4de',
    horizon: '#f0f2e0',
    ground: '#9aa86a',
    glowColor: '#fff6da',
    glowDir: [0.2, 0.6, -1],
  },

  sun: {
    dir: [0.5, 0.8, 0.3],
    color: '#fff2da',
    intensity: 2.4,
    hemi: { sky: '#dfeee8', ground: '#7f8a50', intensity: 1.2 },
    shadowSize: 60,
  },

  ground: groundSpec({
    sand: '#93ad5c',
    dirt: '#9a9a58',
    grass: '#8fb05a',
    grassDark: '#6f9046',
    hill: '#6f9056',
  }, { flatRadius: 200, hillHeight: 70, undulation: 0.22 }),

  mountains: { count: 30, distance: [520, 820], height: [70, 140], widthRatio: [2.2, 3.4], colors: ['#6f9a86', '#7fa492', '#8aa89a'] },

  objects: [],

  clouds: {
    layers: [
      { count: 26, distance: [350, 800], height: [120, 220], size: [40, 80], color: '#fffaf0', shade: '#8a9ab8' },
      { count: 10, center: JOHN, distance: [20, 60], height: [70, 100], size: [20, 34], color: '#fff8e8', shade: '#c8b890', drift: 0.003 },
    ],
  },

  custom(ctx) {
    river(ctx);
    const rng = makeRng(29);
    const clear = (x, z) => Math.hypot(x - 0.5, (z - 2.5) * 0.8) < 14;
    const nearWoods = scatter(rng, 220, {
      center: [0, 30],
      ring: [8, 110],
      height: [10, 17],
      spacing: 3.6,
      reject: (x, z) => z < bankZ(x) + 2.5 || clear(x, z),
    });
    nearWoods.push([-9, -1.5, 13, 0.4], [-13, 6, 15, 0.45]);
    trees(ctx, nearWoods, { seed: 3, leaves: ['#7fb560', '#6faa5a', '#8fbf68', '#5f9e5a', '#9cc46e'] });
    const far = [];
    for (let x = -360; x < 360; x += 6 + rng() * 6) for (let k = 0; k < 3; k++) far.push([x + rng() * 5, farZ(x) - 3 - k * 7 - rng() * 4, 11 + rng() * 6, 0.4]);
    trees(ctx, far, { seed: 5, collide: false, leaves: ['#6faa5a', '#5f9e5a', '#7fb560', '#4f8f4e'] });

    scatterBits(ctx, { geo: new THREE.IcosahedronGeometry(1, 0), count: 60, ring: [3, 30], center: [0, -3], size: [0.2, 0.6], colors: ['#8a8574', '#9a9482', '#76705f'], seed: 4, flat: 0.55, reject: (x, z) => z < bankZ(x) - 0.4 || Math.hypot(x, z) < 3 });
    scatterBits(ctx, { geo: new THREE.ConeGeometry(0.5, 0.45, 6), count: 300, ring: [6, 60], center: [0, 6], size: [0.6, 1.1], colors: ['#5f8f3e', '#6f9f48', '#4f7f38'], seed: 6, reject: (x, z) => z < bankZ(x) + 1.5 || Math.hypot(x - START[0], z - START[1]) < 3 || Math.hypot(x, z) < 4 });

    // Joseph baptizes Oliver, both waist-deep in the river, shirtsleeves wet in the light.
    const wade = WATER_Y - 0.85;
    const joseph = settler(ctx, ...JOSEPH, { coat: '#dcc79a', trousers: '#4a3a2a', hair: '#8a5a32', shirt: '#dcc79a', y: wade, face: OLIVER, arms: [0.2, 0.5], clear: 0, scale: 1.1 });
    setArm(arms(joseph)[0], { out: 2.7, fwd: 0.2 }, -1);
    settler(ctx, ...OLIVER, { coat: '#a9c0d4', trousers: '#3b3226', hair: '#2b1a12', shirt: '#a9c0d4', y: wade, face: JOSEPH, arms: [0.25, 0.9], clear: 0, scale: 1.1 });
    const ripple = new THREE.MeshBasicMaterial({ color: '#e8f6f6', transparent: true, opacity: 0.7, depthWrite: false });
    for (const [x, z] of [JOSEPH, OLIVER]) {
      for (const [r0, r1] of [[0.34, 0.42], [0.62, 0.68]]) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 28).rotateX(-Math.PI / 2), ripple);
        ring.position.set(x, WATER_Y + 0.02, z);
        ring.layers.set(FX_LAYER);
        ctx.scene.add(ring);
      }
    }
    mesh(ctx, [box(0.55, 0.06, 0.45, 0, 0, 0, { ry: 0.3 })], '#2b2a30', { at: [3.2, ctx.terrainHeight(3.2, 0.4) + 0.32, 0.4, 0] });
    mesh(ctx, [ball(0.6, 0, 0, 0, { sx: 1.4, sy: 0.5, seg: 8 })], '#9a9482', { at: [3.2, ctx.terrainHeight(3.2, 0.4), 0.4, 0] });

    // John the Baptist stands on the bank in a cloud of light, watching over the ordinance.
    const jy = ctx.terrainHeight(...JOHN) + 0.25;
    heavenly(ctx, JOHN[0], jy, JOHN[1], { face: [JOSEPH[0], JOSEPH[1]], arms: [0.35, 0.7], halo: 3, light: 6, lightDistance: 10, scale: 1.1 });
    glow(ctx, JOHN[0], jy + 0.1, JOHN[1], 4, '#fffaf0', 0.6, 0.05);
    const puffs = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      puffs.push(ball(0.22 + rng() * 0.12, Math.sin(a) * 0.6, 0, Math.cos(a) * 0.45, { sy: 0.5, seg: 10 }));
    }
    mesh(ctx, puffs, '#fffaf0', { at: [JOHN[0], jy - 0.05, JOHN[1], 0], emissive: '#d8ccb0', cast: false });
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glowTexture(), color: '#ffe6a0', transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    pool.position.set(JOHN[0], ctx.terrainHeight(...JOHN) + 0.08, JOHN[1]);
    pool.layers.set(FX_LAYER);
    ctx.scene.add(pool);
    ctx.addCollider({ x: JOHN[0], z: JOHN[1], hx: 0.9, hz: 0.6, rot: 0, top: jy + 2 });
    lightCone(ctx, JOHN[0], 40, JOHN[1] - 0.2, { top: 1.0, bottom: 1.6, height: 40 - ctx.terrainHeight(...JOHN), color: '#fff2c4', opacity: 0.08 });
  },

  light: {
    beams: [{ from: [JOHN[0], 150, JOHN[1] - 1], to: { at: [JOHN[0], JOHN[1] - 0.6], lift: 0 }, width: [5, 2.4], color: '#fff2c9', intensity: 0.12, layers: 3, stripes: 18, fadeLow: 0.03 }],
  },

  player: {
    fov: 44,
    start: START,
    lookAt: [1.9, -8.8],
    colors: { robe: '#3b3226', mantle: '#5a4a3a', skin: '#d9a77c', hair: '#4a3020', sash: '#2b1a12' },
  },
};
