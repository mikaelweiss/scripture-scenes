// Joseph Smith-History 1:14-20. The Sacred Grove near Palmyra, spring 1820.
// x is east, z is south. The clearing is north of the start, the pillar of light falls on Joseph.
import { arms, baseStyle, cyl, glow, groundSpec, heavenly, lightCone, makeRng, mesh, scatter, scatterBits, setArm, settler, trees, box } from './lib/pgp-07-kit.js';
import * as THREE from 'three';
import { FX_LAYER } from '../engine/renderer.js';
import { glowTexture } from '../engine/textures.js';

const JOSEPH = [0, -8];
const CLEARING = [0, -9];
const FATHER = [-1.0, -11.2];
const SON = [1.0, -11.2];
const LIFT = 2.8;
const START = [3.1, -8.6];

const inClearing = (x, z) => Math.hypot(x - CLEARING[0], (z - CLEARING[1]) * 0.9) < 8.5;
const VIEW = [5.6, -0.5];
const behindVision = (x, z) => {
  const ax = x - VIEW[0], az = z - VIEW[1], bx = -VIEW[0], bz = FATHER[1] - VIEW[1];
  const cos = (ax * bx + az * bz) / Math.hypot(ax, az) / Math.hypot(bx, bz);
  return cos > 0.975 && Math.hypot(ax, az) > 6;
};
const onPath = (x, z) => z > -2 && Math.abs(x - START[0] * 0.6 - Math.sin(z * 0.08) * 2) < 2.2;

export default {
  title: 'Joseph Smith-History 1:14-20: The First Vision',
  subtitle: 'The Sacred Grove, spring 1820',
  seed: 1820,

  style: baseStyle({ fog: { color: '#d8e6cf', near: 30, far: 260 } }),

  sky: {
    zenith: '#4f8fb8',
    mid: '#9cc7d8',
    horizon: '#eaf1d8',
    ground: '#9aa86a',
    glowColor: '#fff6d8',
    glowDir: [0.3, 0.5, -1],
  },

  sun: {
    dir: [0.45, 0.8, -0.35],
    color: '#fff3dc',
    intensity: 1.7,
    hemi: { sky: '#e6f2e2', ground: '#8f9a5a', intensity: 1.2 },
    shadowSize: 60,
  },

  ground: groundSpec({
    sand: '#9fb060',
    dirt: '#8c8a52',
    grass: '#8fbc5c',
    grassDark: '#6f9a48',
    hill: '#6f8a54',
  }, { flatRadius: 200, undulation: 0.45 }),

  objects: [
    { type: 'trees', count: 420, ring: [70, 260], height: [14, 20], broken: 0.02, fallen: 0.04, trunkColor: '#6b5a48', leafColors: ['#6faa5a', '#5f9e5a', '#7fb560', '#4f8f4e'] },
  ],

  custom(ctx) {
    const rng = makeRng(7);
    const near = scatter(rng, 230, {
      center: CLEARING,
      ring: [8, 72],
      height: [15, 23],
      radius: [0.28, 0.5],
      spacing: 3.2,
      reject: (x, z) => inClearing(x, z) || onPath(x, z) || behindVision(x, z),
    });
    near.push([-6.5, 6, 18, 0.45], [-9.5, -2, 17, 0.42], [8.5, -17, 20, 0.5]);
    trees(ctx, near, { trunk: '#76644f', leaves: ['#7fb560', '#6faa5a', '#8fbf68', '#5f9e5a'], canopy: 0.26, seed: 4 });

    // Undergrowth and spring flowers on the grove floor.
    const fern = new THREE.ConeGeometry(0.6, 0.5, 6);
    scatterBits(ctx, { geo: fern, count: 500, ring: [6, 70], center: CLEARING, size: [0.5, 1.1], colors: ['#5f8f3e', '#6f9f48', '#4f7f38'], reject: (x, z) => Math.hypot(x - JOSEPH[0], z - JOSEPH[1]) < 3.5 || onPath(x, z), seed: 3, sink: 0.25 });
    scatterBits(ctx, { geo: new THREE.IcosahedronGeometry(1, 0), count: 120, ring: [5, 60], center: CLEARING, size: [0.15, 0.5], colors: ['#8a8574', '#9a9482', '#76705f'], seed: 11, flat: 0.6 });

    // Fallen log and the stump where Joseph left his axe.
    const gy = (x, z) => ctx.terrainHeight(x, z);
    mesh(ctx, [cyl(0.42, 0.5, 9, 0, 0.4, 0, { rz: Math.PI / 2 })], '#6b5a48', { at: [-9, gy(-9, -3), -3, 0.5] });
    ctx.addCollider({ x: -9, z: -3, hx: 4.5, hz: 0.5, rot: 0.5, top: gy(-9, -3) + 0.85 });
    const stump = [6.2, -4.5];
    mesh(ctx, [cyl(0.5, 0.65, 0.8, 0, 0.4, 0, { seg: 10 })], '#76644f', { at: [stump[0], gy(...stump), stump[1], 0] });
    mesh(ctx, [cyl(0.47, 0.47, 0.02, 0, 0.81, 0, { seg: 10 })], '#d9b98a', { at: [stump[0], gy(...stump), stump[1], 0] });
    mesh(ctx, [box(0.06, 0.95, 0.06, 0, 0.5, 0, { rz: 0.5 })], '#a07a4a', { at: [stump[0] + 0.1, gy(...stump) + 0.65, stump[1], 0.3] });
    mesh(ctx, [box(0.08, 0.22, 0.3, 0.02, 0, 0)], '#4a4a52', { at: [stump[0] - 0.12, gy(...stump) + 0.85, stump[1] - 0.07, 0.3] });
    ctx.addCollider({ x: stump[0], z: stump[1], hx: 0.6, hz: 0.6, rot: 0, top: gy(...stump) + 0.82 });

    // Joseph kneels in prayer, looking up into the light.
    settler(ctx, JOSEPH[0], JOSEPH[1], { coat: '#2a4566', trousers: '#3a2c20', hair: '#8a5a2e', shirt: '#f4ecd8', scale: 1.15, kneel: true, face: [0, -14], arms: [0.3, 0.6] });

    // The Father and the Son stand above him in the air.
    const fy = gy(...FATHER) + LIFT;
    const father = heavenly(ctx, FATHER[0], fy, FATHER[1], { face: [JOSEPH[0], JOSEPH[1] + 2], arms: [0.35, 0.25], halo: 5, scale: 1.3 });
    const son = heavenly(ctx, SON[0], fy, SON[1], { face: [JOSEPH[0], JOSEPH[1] + 2], arms: [0.55, 0.45], halo: 5, scale: 1.3 });
    setArm(arms(father)[1], { out: 1.25, fwd: 0.35 }, 1);
    glow(ctx, 0, fy + 1.5, -11.2, 16, '#fff3cf', 0.35, 0.03);

    glow(ctx, 0, fy + 0.1, -11.2, 7, '#fff8e0', 0.7, 0.05);

    // The pillar of light, brighter than the sun, resting on Joseph.
    lightCone(ctx, 0, 60, -9.6, { top: 1.6, bottom: 3, height: 60 - gy(...JOSEPH), color: '#fff6d8', opacity: 0.07 });
    // Warm pool of light on the ground around Joseph, drawn under him so it never veils his figure.
    const pool = new THREE.Mesh(new THREE.CircleGeometry(3.6, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glowTexture(), color: '#ffe6a0', transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    pool.position.set(JOSEPH[0], gy(...JOSEPH) + 0.06, JOSEPH[1] - 0.6);
    pool.layers.set(FX_LAYER);
    ctx.scene.add(pool);
    const p = new THREE.PointLight('#fff2d0', 3, 22, 1.3);
    p.position.set(0, fy + 1.2, -10);
    ctx.scene.add(p);
  },

  light: {
    rayFans: [
      { source: [40, 90, 30], sourceJitter: 30, target: [0, -10], groundY: 0, spread: [8, 40], count: 7, width: [[1.5, 3], [2.5, 5]], color: '#fff6d8', intensity: 0.16, stripes: 7, fadeLow: 0.3 },
    ],
    beams: [{ from: [0, 160, -11.6], to: { at: [0, -11.4], lift: 0 }, width: [10, 3.4], color: '#fff2c9', intensity: 0.13, layers: 3, stripes: 22, fadeLow: 0.03 }],
    rings: [{ at: [0, -11.6], lift: 0, radius: 2.4, width: 0.3, height: 2.2, color: '#ffe9a8', intensity: 0.8, wallIntensity: 0.3 }],
    glows: [{ at: JOSEPH, lift: 0.2, size: 4, color: '#fff0c0', opacity: 0.2 }],
  },

  player: {
    start: START,
    lookAt: [1.5, -13.6],
    colors: { robe: '#3b3226', mantle: '#4a5a6a', skin: '#d9a77c', hair: '#4a3020', sash: '#2b1a12' },
  },
};
