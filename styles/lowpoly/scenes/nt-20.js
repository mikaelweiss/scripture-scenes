// Matthew 21:1-11. Jesus rides a donkey down the road into Jerusalem. The road runs west (-x)
// to the city gate; crowds line both sides waving palm branches and spread garments on the way.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { palette, house, palm, oliveTree, person, christ, cityWall, box } from './lib/nt-19-kit.js';

const JESUS = [0, 0];
const GATE = [-92, 0];
const TEMPLE = [-170, -34];
const START = [3.6, 5.2];

function roadCrowd() {
  const r = rng(52);
  const pts = [];
  const free = (x, z, gap) => !pts.some(([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 < gap * gap);
  for (let tries = 0; tries < 20000 && pts.length < 520; tries++) {
    const x = r.range(-84, 30), side = r.sign();
    const z = side * r.range(2.6, 2.6 + (x < -60 ? 12 : 7));
    if (Math.hypot(x - START[0], z - START[1]) < 3.4) continue;
    if (free(x, z, 0.8)) pts.push([x, z]);
  }
  const followers = [];
  for (let tries = 0; tries < 3000 && followers.length < 60; tries++) {
    const x = r.range(2.5, 26), z = r.range(-2.2, 2.2);
    if (x < 4 && Math.abs(z) < 1.2) continue;
    if (free(x, z, 0.85) && !followers.some(([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 < 0.85 ** 2)) followers.push([x, z]);
  }
  return { pts, followers };
}

const { pts: lining, followers } = roadCrowd();

export default {
  title: 'Matthew 21:1-11: The triumphal entry',
  seed: 20,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.45, 0.62, 0.5], color: '#ffe6bc', intensity: 2.9 },
  light: { sky: '#a9c3e8', ground: '#8a6f50', hemi: 1.0 },
  sky: { top: '#4a82c4', horizon: '#e6dcc4', ground: '#c9b08a', sunColor: '#fff2d0', glow: 0.8 },
  fog: { color: '#e0d6bf', near: 90, far: 600 },
  clouds: { count: 26, shadow: '#b4b6c4', lit: '#fff6e6', rim: '#ffffff', distance: [320, 900], altitude: [120, 240], hole: 0.2 },
  mountains: { count: 38, color: '#9a8466', radius: [460, 720], height: [40, 120], haze: 0.5 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.35, shadowTint: '#3a3050', highlightTint: '#fff0d0' },
  shadow: { center: [-14, 0], radius: 50 },

  player: { start: START, yaw: 1.02, pitch: -0.07, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 20,
    hills: 36,
    bumps: 0.25,
    flats: [
      { x: -30, z: 0, r: 70, falloff: 50, height: 0 },
      { x: -170, z: -10, r: 80, falloff: 40, height: 0 },
    ],
    colors: { ground: '#b79c74', groundAlt: '#a88d64', grass: '#8a8a4e', high: '#a8906e', rock: '#8e7a62' },
    patches: [],
  },

  scatter: [
    { type: 'tree', count: 50, center: [40, 0], ring: [30, 200], arc: [-1.4, 1.4], spacing: 9, seed: 6, props: { kind: 'palm' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [60, 300], spacing: 14, seed: 7, props: { color: '#a3876a' } },
  ],

  crowd: {
    palette,
    groups: [
      { count: lining.length, points: lining, face: JESUS, children: 0.2, seed: 61 },
      { count: followers.length, points: followers, face: [-60, 0], children: 0.1, seed: 62 },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    const { THREE: T } = ctx;

    // Road: packed earth with stones at the edges.
    for (let x = -92; x < 60; x += 2) {
      ctx.solid.box(2.1, 0.08, 4.6, { position: [x, ctx.heightAt(x, 0) + 0.02, r.range(-0.15, 0.15)], rotation: [0, r.range(-0.03, 0.03), 0], color: '#c7ae86', jitter: 0.05 });
    }

    // Garments and cut branches spread on the road ahead of Jesus.
    const cloth = ['#a34f32', '#3f5d7a', '#c9a24a', '#7d5c3e', '#e0d6c0', '#6d3b2e', '#556246', '#8a3a5a', '#2f4a5c', '#b59a72'];
    for (let i = 0; i < 90; i++) {
      const x = r.range(-88, -1.5), z = r.range(-2, 2);
      ctx.solid.box(r.range(1, 1.6), 0.05, r.range(1.3, 2), { position: [x, ctx.heightAt(x, z) + 0.08 + r() * 0.03, z], rotation: [r.range(-0.03, 0.03), r() * 3, 0], color: r.pick(cloth), jitter: 0.06 });
    }
    const frondGeo = (() => {
      const v = [];
      const L = 1.6, n = 9;
      v.push(-0.02, 0, 0, 0.02, 0, 0, 0, L, 0.02);
      for (let k = 1; k < n; k++) {
        const y = (k / n) * L, w = 0.42 * Math.sin((k / n) * Math.PI) + 0.05;
        for (const side of [-1, 1]) v.push(0, y, 0, 0, y + 0.12, 0, side * w, y + 0.32, side * 0.06);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
      g.computeVertexNormals();
      return g;
    })();
    for (let i = 0; i < 70; i++) {
      const x = r.range(-88, -1), z = r.range(-2.2, 2.2);
      ctx.solid.add(frondGeo, { position: [x, ctx.heightAt(x, z) + 0.12, z], rotation: [Math.PI / 2, r() * 6, 0], color: r.pick(['#5f7a3a', '#6b8340', '#7a8f45']) });
    }

    // Palm branches held high, swaying.
    const holders = [...lining.filter((_, i) => i % 2 === 0), ...followers.filter((_, i) => i % 2 === 0)];
    const waving = new T.InstancedMesh(frondGeo, new T.MeshLambertMaterial({ color: '#6b8a3c', flatShading: true, side: T.DoubleSide }), holders.length);
    waving.castShadow = true;
    const seeds = holders.map(([x, z]) => {
      const toward = Math.atan2(-x, -z);
      return { x: x + Math.sin(toward) * 0.25, y: ctx.heightAt(x, z) + 1.25, z: z + Math.cos(toward) * 0.25, yaw: toward + r.range(-0.6, 0.6), ph: r() * 6, sp: r.range(2.2, 3.4) };
    });
    const m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), p = new T.Vector3(), s = new T.Vector3(1, 1, 1);
    const pose = (t) => {
      seeds.forEach((f, i) => {
        q.setFromEuler(e.set(0.45 + Math.sin(t * f.sp + f.ph) * 0.3, f.yaw, 0, 'YXZ'));
        waving.setMatrixAt(i, m.compose(p.set(f.x, f.y, f.z), q, s));
      });
      waving.instanceMatrix.needsUpdate = true;
    };
    pose(0);
    ctx.scene.add(waving);
    ctx.onFrame((t) => pose(t));

    // The donkey, walking west.
    const dy = ctx.heightAt(...JESUS);
    const donkey = new T.Group();
    const hide = new T.MeshLambertMaterial({ color: '#7d7166', flatShading: true });
    const dark = new T.MeshLambertMaterial({ color: '#4e463f', flatShading: true });
    const part = (geo, mat, x, y, z, rx = 0, rz = 0) => {
      const mesh = new T.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, 0, rz);
      mesh.castShadow = true;
      donkey.add(mesh);
    };
    part(new T.BoxGeometry(0.5, 0.5, 1.25), hide, 0, 0.95, 0);
    for (const [lx, lz] of [[-0.16, 0.45], [0.16, 0.45], [-0.16, -0.45], [0.16, -0.45]]) part(new T.BoxGeometry(0.12, 0.75, 0.12), hide, lx, 0.38, lz);
    part(new T.BoxGeometry(0.26, 0.6, 0.3), hide, 0, 1.3, 0.72, 0.6);
    part(new T.BoxGeometry(0.24, 0.26, 0.55), hide, 0, 1.55, 0.98, 0.35);
    part(new T.BoxGeometry(0.06, 0.3, 0.08), dark, -0.08, 1.8, 0.82, -0.2, 0.2);
    part(new T.BoxGeometry(0.06, 0.3, 0.08), dark, 0.08, 1.8, 0.82, -0.2, -0.2);
    part(new T.BoxGeometry(0.06, 0.45, 0.06), dark, 0, 0.85, -0.66, 0.3);
    part(new T.BoxGeometry(0.66, 0.06, 0.7), new T.MeshLambertMaterial({ color: '#a34f32', flatShading: true }), 0, 1.22, -0.05);
    donkey.position.set(JESUS[0], dy, JESUS[1]);
    donkey.rotation.y = -Math.PI / 2;
    ctx.scene.add(donkey);
    ctx.colliders.add({ x: JESUS[0], z: JESUS[1], w: 1.4, d: 0.7, bottom: dy, top: dy + 2.2 });
    christ(ctx, { x: JESUS[0] - 0.05, z: JESUS[1], y: dy + 1.2, pose: 'sit', face: [-60, 0], light: 10, halo: 3, glow: 0.25 });
    person(ctx, { x: -1.4, z: 0.7, face: [-60, 0], robe: '#6e5a44', mantle: '#3f4d5e', hood: true });

    // Jerusalem: walls with a gate, houses rising behind, the temple on its platform.
    cityWall(ctx, { from: [-92, -140], to: [-92, 140], h: 10, thick: 3.2, gate: GATE, towerEvery: 35 });
    const colors = ['#d8c6a0', '#cdb68e', '#c9ad84', '#e2d6bd', '#bfa67e'];
    const rr = rng(71);
    for (let i = 0; i < 90; i++) {
      const x = rr.range(-102, -250), z = rr.range(-140, 140);
      if (Math.abs(x - TEMPLE[0]) < 50 && Math.abs(z - TEMPLE[1]) < 42) continue;
      house(ctx, { x, z, rot: Math.floor(rr() * 4) * (Math.PI / 2), w: rr.range(6, 10), d: rr.range(5, 9), h: rr.range(4, 8), color: rr.pick(colors), door: false });
    }
    const ty = ctx.heightAt(...TEMPLE) - 0.5;
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1], y: ty, w: 90, h: 14, d: 76, color: '#cdb68e' });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1], y: ty + 14, w: 92, h: 1, d: 78, color: '#a8916c', collide: false });
    for (let i = 0; i < 18; i++) {
      for (const side of [-1, 1]) box(ctx, { x: TEMPLE[0] - 44 + i * 5.2, z: TEMPLE[1] + side * 36, y: ty + 15, w: 4, h: 4, d: 1, color: '#e6dcc4', collide: false });
    }
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1], y: ty + 15, w: 30, h: 16, d: 14, color: '#f2ead8' });
    box(ctx, { x: TEMPLE[0] + 9, z: TEMPLE[1], y: ty + 15, w: 4, h: 24, d: 26, color: '#f4eee0' });
    box(ctx, { x: TEMPLE[0] + 11.2, z: TEMPLE[1], y: ty + 15, w: 0.3, h: 12, d: 6, color: '#c9a24a', collide: false });
    box(ctx, { x: TEMPLE[0], z: TEMPLE[1], y: ty + 31, w: 31, h: 0.8, d: 15, color: '#d4b35a', collide: false });
    box(ctx, { x: TEMPLE[0] + 9, z: TEMPLE[1], y: ty + 39, w: 4.4, h: 0.8, d: 26.4, color: '#d4b35a', collide: false });

    ctx.builders.rock(ctx, { x: START[0], z: START[1], size: 1.6, color: '#a3876a' });
    box(ctx, { x: START[0], z: START[1], y: ctx.heightAt(...START), w: 1.8, h: 1.0, d: 1.8, color: '#a3876a' });
    for (let i = 0; i < 26; i++) {
      const x = r.range(10, 70), z = r.sign() * r.range(14, 50);
      oliveTree(ctx, { x, z, s: r.range(0.9, 1.3) });
    }
    for (const [x, z] of [[-30, 14], [-44, -15], [-62, 18], [-16, -13], [-76, -20], [6, 12], [-6, -16]]) palm(ctx, { x, z, h: r.range(8, 11) });
  },
};
