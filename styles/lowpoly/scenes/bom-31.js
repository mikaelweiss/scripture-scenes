// Alma 48-50: Moroni rings a Nephite city with a ditch, an earthen ridge, timber pickets and towers.
// A Lamanite army arrives and halts, astonished at the defenses. -z is north.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { frame, strut, formation, makePeople, addCrowd, arm, house, banner } from './lib/bom-31-kit.js';

const C = [0, -40];
const R = 51;
const BASE = 0.3;
const RIDGE_H = 3.5;
const TOP = BASE + RIDGE_H;
const GAP = 0.075;
const DITCH = -4.2;
const earth = '#7a6a46';
const timber = '#6b4a2c';

const nephites = {
  robes: ['#d6c7a6', '#b9a37c', '#8f7a58', '#c9b48a', '#a68a5e', '#e2d6bc'],
  mantles: ['#6a4a30', '#3f5a6b', '#7a5a3a', '#a0522d', '#556246'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.7,
  hoodChance: 0,
};
const lamanites = {
  robes: ['#7a2e22', '#5a2a1e', '#3a2a22', '#8a4a2a', '#4a3a2a'],
  mantles: ['#2a1e18', '#6a2a1a', '#3a3028'],
  skins: ['#7a4c31', '#8a5a3c', '#9b6a46', '#6e4530'],
  mantleChance: 0.6,
  hoodChance: 0,
};
const townsfolk = {
  robes: ['#c9b48a', '#a0825c', '#d8cdb5', '#8b6b4a', '#b59a72', '#7a4e36', '#6b6f4a'],
  mantles: ['#5a3d2b', '#a34f32', '#3f4d5e', '#8a7a5a'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.5,
  hoodChance: 0.3,
};

const polar = (a, r) => [C[0] + Math.sin(a) * r, C[1] + Math.cos(a) * r];

function ridge(ctx) {
  const N = 120;
  const a0 = GAP, a1 = Math.PI * 2 - GAP;
  const prof = [[R - 5, BASE - 0.4], [R - 1.3, TOP], [R + 1.3, TOP], [R + 7, DITCH + 0.3]];
  const pos = [];
  const p3 = (a, [r, y]) => [C[0] + Math.sin(a) * r, y, C[1] + Math.cos(a) * r];
  for (let i = 0; i < N; i++) {
    const A = a0 + ((a1 - a0) * i) / N, B = a0 + ((a1 - a0) * (i + 1)) / N;
    for (let k = 0; k < prof.length - 1; k++) {
      const pa = p3(A, prof[k]), pb = p3(B, prof[k]), qa = p3(A, prof[k + 1]), qb = p3(B, prof[k + 1]);
      pos.push(...pa, ...qa, ...pb, ...pb, ...qa, ...qb);
    }
    const mid = (A + B) / 2;
    const [cx, cz] = polar(mid, R);
    ctx.colliders.add({ x: cx, z: cz, w: (R * (B - A)) + 0.3, d: 8, rot: mid, bottom: BASE - 1, top: TOP });
  }
  for (const [a, dir] of [[a0, 1], [a1, -1]]) {
    const ps = prof.map((pr) => p3(a, pr));
    pos.push(...ps[0], ...(dir > 0 ? ps[1] : ps[2]), ...(dir > 0 ? ps[2] : ps[1]), ...ps[0], ...(dir > 0 ? ps[2] : ps[3]), ...(dir > 0 ? ps[3] : ps[2]));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  ctx.solid.add(geo, { color: earth, jitter: 0.09 });
  const geo2 = geo.clone();
  ctx.solid.add(flipWinding(geo2), { color: '#6e5436', jitter: 0.05 });

  const step = 0.42 / (R + 1);
  for (let a = a0 + 0.004; a < a1; a += step) {
    const [x, z] = polar(a, R + 1);
    const h = 2.5 + ctx.rand.range(-0.2, 0.25);
    ctx.solid.add(new THREE.CylinderGeometry(0.02, 0.15, h, 5), { position: [x, TOP + h / 2 - 0.2, z], rotation: [0, ctx.rand() * 3, 0], color: timber, jitter: 0.1 });
  }
  const rails = 60;
  for (let i = 0; i < rails; i++) {
    const A = a0 + ((a1 - a0) * i) / rails, B = a0 + ((a1 - a0) * (i + 1)) / rails;
    for (const y of [TOP + 0.6, TOP + 1.6]) {
      const [ax, az] = polar(A, R + 0.8), [bx, bz] = polar(B, R + 0.8);
      strut(ctx.solid, [ax, y, az], [bx, y, bz], 0.1, '#5a3e24');
    }
  }
}

function flipWinding(g) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 3) {
    const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1);
    p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2));
    p.setXYZ(i + 2, x, y, z);
  }
  return g;
}

function tower(ctx, x, z, y, { h = 6.5, w = 3, roof = '#8a6a3a' } = {}) {
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) strut(ctx.solid, [x + sx * w / 2, y - 0.5, z + sz * w / 2], [x + sx * w * 0.42, y + h + 1.4, z + sz * w * 0.42], 0.22, timber);
  for (const hh of [h * 0.35, h * 0.7]) {
    strut(ctx.solid, [x - w / 2, y + hh, z - w / 2], [x + w / 2, y + hh, z + w / 2], 0.1, '#5a3e24');
    strut(ctx.solid, [x + w / 2, y + hh, z - w / 2], [x - w / 2, y + hh, z + w / 2], 0.1, '#5a3e24');
  }
  ctx.solid.box(w + 0.6, 0.25, w + 0.6, { position: [x, y + h, z], color: '#7a5a38' });
  for (const [sx, sz, rw, rd] of [[0, -1, w + 0.6, 0.12], [0, 1, w + 0.6, 0.12], [-1, 0, 0.12, w + 0.6], [1, 0, 0.12, w + 0.6]]) {
    ctx.solid.box(rw, 0.9, rd, { position: [x + sx * (w + 0.5) / 2, y + h + 0.55, z + sz * (w + 0.5) / 2], color: '#6b4a2c' });
  }
  ctx.solid.add(new THREE.ConeGeometry(w * 0.95, 1.8, 4).rotateY(Math.PI / 4), { position: [x, y + h + 2.3, z], color: roof, jitter: 0.07 });
  ctx.colliders.add({ x, z, w: w, d: w, bottom: y - 1, top: y + h + 0.15 });
  return y + h + 0.13;
}

export default {
  title: "Alma 48-50: Moroni's fortifications",
  seed: 31,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [-0.7, 0.55, 0.45], color: '#ffe2b8', intensity: 2.8 },
  light: { sky: '#a8c4e8', ground: '#6a5038', hemi: 1.1 },
  sky: { top: '#4f7cc0', horizon: '#d8e2e8', ground: '#c8b89a', sunColor: '#fff0d0', glow: 0.8 },
  fog: { color: '#c9d4d8', near: 90, far: 620 },
  clouds: { count: 40, shadow: '#9aa6bc', lit: '#ffffff', rim: '#fff6e0', distance: [300, 900], altitude: [120, 220], hole: 0.1 },
  mountains: { count: 40, color: '#5a6a72', radius: [520, 760], height: [60, 170], haze: 0.55 },
  bloom: { strength: 0.25, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.32, shadowTint: '#2a3050', highlightTint: '#fff0d0' },
  shadow: { center: [0, -10], radius: 95 },

  player: { start: [-16, 60], yaw: -0.4, pitch: 0.0, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 31,
    hills: 22,
    bumps: 0.25,
    flats: [
      { x: C[0], z: C[1], r: 66, falloff: 5, height: DITCH },
      { x: C[0], z: C[1], r: 53, falloff: 3, height: BASE },
      { x: -16, z: 63, r: 6, falloff: 12, height: 4.5 },
    ],
    colors: { ground: '#8a8048', groundAlt: '#7a7a42', grass: '#6a7e3a', high: '#7a7a50', rock: '#6e5a42' },
    patches: [
      { x: C[0], z: C[1], r: 50, color: '#a89470', strength: 0.8, rough: 0.2 },
      { x: C[0], z: C[1] + 60, r: 12, color: '#5e4a34', strength: 0.4, rough: 0.5 },
      { x: 0, z: 40, r: 22, color: '#9a8460', strength: 0.5, rough: 0.6 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: C[0], z: C[1] - 6, w: 22, d: 20, tiers: 4, tierHeight: 2.6, inset: 2, stairWidth: 5, color: '#c8b48e', trim: '#9a8462', shrine: { w: 7, d: 5.5, h: 3.2, door: 1.6, roof: '#8a6a3a' } },
  ],

  scatter: [
    { type: 'tree', count: 60, center: C, ring: [95, 320], spacing: 8, seed: 3, props: { kind: 'broad', leaf: '#557a34' } },
    { type: 'tree', count: 20, center: C, ring: [80, 200], spacing: 8, seed: 4, avoid: [{ rect: [24, 40, 50, 40] }, { rect: [0, 60, 30, 60] }], props: { kind: 'palm', leaf: '#5e8238' } },
    { type: 'rock', count: 30, center: C, ring: [110, 340], spacing: 12, seed: 5, props: { color: '#7d7466' } },
  ],

  crowd: {
    palette: { ...townsfolk },
    groups: [
      { count: 90, center: C, ring: [16, 40], spacing: 1.4, seed: 7, children: 0.25, avoid: [{ rect: [C[0], C[1] - 6, 24, 22] }] },
    ],
  },

  custom(ctx) {
    ridge(ctx);
    const r = rng(310);

    // Grass tufts and shrubs on the plain.
    for (let i = 0; i < 700; i++) {
      const a = r() * Math.PI * 2, d = r.range(66, 160);
      const [x, z] = polar(a, d);
      const y = ctx.heightAt(x, z);
      if (r() < 0.8) ctx.solid.add(new THREE.ConeGeometry(0.25, 0.7, 4), { position: [x, y + 0.25, z], rotation: [r.range(-0.2, 0.2), r() * 3, 0], scale: [1, r.range(0.6, 1.4), 1], color: r.pick(['#6a7a34', '#7a8a3c', '#5e6a2e', '#8a8440']), jitter: 0.1 });
      else ctx.solid.add(new THREE.IcosahedronGeometry(0.7, 0), { position: [x, y + 0.3, z], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.7, 1], color: r.pick(['#4e6a2e', '#5a7434']), jitter: 0.1 });
    }

    // Dark mud along the ditch floor.
    ctx.solid.add(new THREE.RingGeometry(R + 5, R + 17, 160, 1).rotateX(-Math.PI / 2), { position: [C[0], DITCH + 0.75, C[1]], color: '#3a2e1e', jitter: 0.06 });

    // Causeway over the ditch at the south gate.
    for (let z = C[1] + 53; z < C[1] + 71; z += 0.7) {
      const y = BASE + 0.05;
      ctx.solid.box(4.6, 0.22, 0.62, { position: [C[0], y, z + 0.35], rotation: [0, 0, r.range(-0.02, 0.02)], color: '#8a6440', jitter: 0.08 });
      ctx.colliders.add({ x: C[0], z: z + 0.35, w: 4.6, d: 0.7, bottom: y - 3, top: y + 0.11 });
    }
    for (const sx of [-1, 1]) for (let z = C[1] + 54; z < C[1] + 71; z += 3) strut(ctx.solid, [C[0] + sx * 2.3, DITCH, z], [C[0] + sx * 2.3, BASE + 1.1, z], 0.18, timber);
    for (const sx of [-1, 1]) strut(ctx.solid, [C[0] + sx * 2.3, BASE + 1, C[1] + 53], [C[0] + sx * 2.3, BASE + 1, C[1] + 71], 0.1, '#5a3e24');

    // Gate towers and the title of liberty.
    const gateTops = [-1, 1].map((sx) => {
      const [x, z] = polar(sx * (GAP + 0.03), R + 2);
      return [x, z, tower(ctx, x, z, BASE, { h: 9, w: 3.4 })];
    });
    banner(ctx, { x: gateTops[0][0] + 1.2, z: gateTops[0][1], y: gateTops[0][2], h: 5, w: 2.2, len: 2.6, color: '#efe6d0', rot: 0 });
    banner(ctx, { x: gateTops[1][0] - 1.2, z: gateTops[1][1], y: gateTops[1][2], h: 4, w: 1.6, len: 2, color: '#3f5a8a', rot: 0 });

    // Towers along the ridge.
    const towerTops = [];
    for (let i = 1; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const [x, z] = polar(a, R - 0.2);
      towerTops.push([x, z, tower(ctx, x, z, TOP - 0.2)]);
    }

    // Houses inside the walls, leaving a street from the gate to the temple.
    for (let tries = 0, n = 0; n < 42 && tries < 900; tries++) {
      const a = r() * Math.PI * 2, d = r.range(16, 43);
      const [x, z] = polar(a, d);
      if (Math.abs(x - C[0]) < 6 && z > C[1]) continue;
      if (Math.abs(x - C[0]) < 15 && Math.abs(z - (C[1] - 6)) < 14) continue;
      if (ctx.colliders.ground(x, z, 0, 0, { radius: 4 }) === null) continue;
      house(ctx, { x, z, rot: a + Math.PI, w: r.range(5, 7.5), d: r.range(4.5, 6), h: r.range(2.4, 3.2), color: r.pick(['#d8c7a4', '#cdb894', '#e0d2b2']), roof: r.pick(['#9a7a44', '#8a6a3a', '#a68a50']) });
      n++;
    }

    // Defenders along the ridge top and in the towers.
    const ridgePts = [];
    for (let a = GAP + 0.05; a < Math.PI * 2 - GAP - 0.05; a += r.range(0.035, 0.09)) ridgePts.push(polar(a, R - 0.5 + r.range(-0.3, 0.3)));
    const defenders = makePeople(ridgePts.filter(([x, z]) => ctx.colliders.ground(x, z, TOP, TOP, { radius: 0.4, stepUp: 0.3 }) !== null), { palette: nephites, heightAt: () => TOP, seed: 11, yawJitter: 0.4 });
    for (const p of defenders) p.yaw = Math.atan2(p.x - C[0], p.z - C[1]);
    const towerMen = makePeople([...towerTops, ...gateTops].flatMap(([x, z]) => [[x - 0.6, z + 0.4], [x + 0.6, z - 0.3]]), { palette: nephites, heightAt: () => 0, seed: 12 });
    [...towerTops, ...gateTops].forEach(([x, z, y], i) => {
      for (const p of towerMen.slice(i * 2, i * 2 + 2)) {
        p.y = y;
        p.yaw = Math.atan2(p.x - C[0], p.z - C[1]);
      }
    });
    const gateGuards = makePeople(formation({ center: [C[0], C[1] + 49], rows: 3, cols: 4, spacing: 1.1, seed: 5 }), { palette: nephites, heightAt: ctx.heightAt, seed: 13, yaw: 0 });
    const allNephites = [...defenders, ...towerMen, ...gateGuards];
    addCrowd(ctx, allNephites);
    arm(ctx, allNephites, { spear: 0.75, shield: 0.85, helmet: 0.8, bow: 0.6, shields: ['#8a5a32', '#a07040', '#6e4a2c', '#b08850'], helmetColor: '#a89a80', seed: 14 });

    // The Lamanite host halts on the plain, astonished at the walls.
    const host = formation({ center: [16, 42], rows: 10, cols: 26, spacing: 1.25, rowSpacing: 1.4, rot: Math.atan2(16 - C[0], 42 - C[1]), jitter: 0.3, seed: 8, skip: 0.06 });
    const lam = makePeople(host, { palette: lamanites, heightAt: ctx.heightAt, seed: 15, face: C, yawJitter: 0.2 });
    addCrowd(ctx, lam);
    arm(ctx, lam, { spear: 0.5, shield: 0.7, helmet: 0.2, bow: 0.5, shields: ['#5a2a1e', '#3a2a22', '#7a3a22'], helmetColor: '#6a3a2a', seed: 16 });
    banner(ctx, { x: 8, z: 50, h: 5.5, w: 1.3, len: 1.8, color: '#8a2a1a' });
    banner(ctx, { x: 25, z: 44, h: 5.5, w: 1.3, len: 1.8, color: '#2a1e18' });
  },
};
