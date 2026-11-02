// Exodus 16: the first morning of manna in the wilderness of Sin. The dew lifts and leaves
// small white flakes over the ground, and Israel goes out among the tents to gather it.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { ISRAEL, desertTerrain, scatterPoints, layoutTents, tentZones, tent, campfire, flock, basket, jar, haze } from './lib/ot-19-camp.js';

const CAMP = [0, -70];
const FIELD = [0, -8];

const tents = [
  ...layoutTents({ center: CAMP, ring: [20, 190], count: 190, seed: 4, face: FIELD, avoid: [{ rect: [0, 8, 34, 44] }] }),
  ...layoutTents({ center: [0, 70], ring: [30, 110], arc: [0.2, Math.PI - 0.2], count: 30, seed: 8, face: FIELD }),
];
const zones = tentZones(tents);

const gatherers = scatterPoints({ center: FIELD, ring: [3, 60], count: 460, spacing: 2.2, seed: 9, avoid: [{ x: 0, z: 26, r: 6 }, ...zones] });
const faces = [[-40, -20], [40, -10], [0, -60], [0, 60], [-60, 30], [60, 40]];
const groups = faces.map((face, k) => ({
  count: 999,
  points: gatherers.filter((_, i) => i % faces.length === k),
  face,
  children: 0.2,
  kneel: 0.55,
  seed: 40 + k,
}));
groups.forEach((g) => (g.count = g.points.length));

export default {
  title: 'Exodus 16:13-21: Manna in the wilderness',
  seed: 19,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.78, 0.17, -0.42], color: '#ffd2a0', intensity: 2.6 },
  light: { sky: '#b4c4e4', ground: '#a07c5c', hemi: 1.15 },
  sky: { top: '#6f8fc4', horizon: '#f6d2b0', ground: '#e0c2a0', sunColor: '#fff0d0', glow: 1.1 },
  fog: { color: '#ead4c0', near: 50, far: 520 },
  clouds: { count: 34, shadow: '#a596a8', lit: '#ffe0c0', rim: '#fff6e4', distance: [260, 900], altitude: [110, 240], hole: 0.3 },
  mountains: { count: 40, color: '#8a6a5a', radius: [560, 800], height: [50, 130], haze: 0.5 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.05, contrast: 1.04, vignette: 0.32, shadowTint: '#4a4a78', highlightTint: '#fff0dc' },
  shadow: { center: [0, -10], radius: 80 },

  player: { start: [0, 28], yaw: 0.08, pitch: -0.03, eye: 1.65, speed: 4.5 },

  terrain: desertTerrain({
    seed: 19,
    flats: [{ x: 0, z: -30, r: 150, falloff: 90, height: 0 }],
    patches: [
      { x: FIELD[0], z: FIELD[1], r: 110, color: '#e8dcc4', strength: 0.3, rough: 0.5 },
      { x: 0, z: -90, r: 200, color: '#ddd0b6', strength: 0.18, rough: 0.6 },
    ],
  }),

  scatter: [
    { type: 'rock', count: 50, center: CAMP, ring: [200, 420], spacing: 12, seed: 3, props: { color: '#9a7a62' } },
    { type: 'tree', count: 12, center: CAMP, ring: [190, 320], spacing: 20, seed: 4, props: { kind: 'broad', leaf: '#7a7a44', h: 4 } },
  ],

  crowd: { palette: ISRAEL, groups },

  custom(ctx) {
    const r = rng(77);
    for (const t of tents) tent(ctx, t);

    gatherers.forEach(([x, z], i) => {
      if (i % 3 === 0) basket(ctx, x + r.range(-0.7, 0.7), z + r.range(0.4, 0.8), { fill: '#f2eee2' });
      else if (i % 7 === 1) jar(ctx, x + 0.5, z + 0.4, { s: 0.8 });
    });

    for (const [x, z] of [[-30, -50], [26, -64], [-62, -96], [48, -110], [6, -130], [-90, -40], [80, -40]]) campfire(ctx, x, z, { smoke: 10 });
    flock(ctx, [-110, -20], 26, 12, 5);
    flock(ctx, [100, -120], 30, 14, 6, ['goat', 'sheep']);
    flock(ctx, [130, 20], 14, 9, 7, ['ox', 'ox', 'goat']);

    // The manna: small white flakes left on the ground when the dew lifted.
    const count = 40000;
    const flakes = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.035, 0),
      new THREE.MeshLambertMaterial({ color: '#fbf8ee', emissive: '#fff8ea', emissiveIntensity: 0.35 }),
      count,
    );
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (i < count * 0.7 ? 55 : 120);
      const x = FIELD[0] + Math.cos(a) * d, z = FIELD[1] + 10 + Math.sin(a) * d;
      const k = r.range(0.6, 1.4);
      p.set(x, ctx.heightAt(x, z) + 0.02, z);
      q.setFromEuler(e.set(r() * 3, r() * 3, r() * 3));
      s.set(k, k * 0.45, k);
      flakes.setMatrixAt(i, m.compose(p, q, s));
    }
    flakes.receiveShadow = true;
    ctx.scene.add(flakes);

    haze(ctx, { center: [0, -40], radius: 160, count: 60, size: [18, 40], lift: [0.4, 2.5], color: '#fff4ea', opacity: 0.16, seed: 4 });
  },
};
