// Luke 19:1-10. Jesus passes through a crowded street in Jericho and calls Zacchaeus down
// from a sycamore. The street runs north (-z); the tree stands at a small widening on the east side.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { palette, house, palm, person, christ, box } from './lib/nt-19-kit.js';

const JESUS = [0.6, -7];
const TREE = [8.5, -13];
const ZACC = [4.6, -12.2];
const START = [-1.6, 2.6];

function streetCrowd() {
  const r = rng(41);
  const pts = [];
  for (let tries = 0; tries < 9000 && pts.length < 260; tries++) {
    const x = r.range(-3.9, 3.9), z = r.range(-46, 3);
    if (Math.hypot(x - JESUS[0], z - JESUS[1]) < 2.6) continue;
    if (Math.abs(x - 0.2) < 1.3 && z > JESUS[1]) continue;
    if (Math.hypot(x - 6, z - TREE[1]) < 3.5) continue;
    if (pts.some(([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 < 0.72 ** 2)) continue;
    pts.push([x, z]);
  }
  for (let tries = 0; tries < 2000 && pts.length < 300; tries++) {
    const x = r.range(4.5, 11), z = r.range(-20, -5);
    if (Math.hypot(x - TREE[0], z - TREE[1]) < 2.2 || Math.hypot(x - ZACC[0], z - ZACC[1]) < 1.8) continue;
    if (pts.some(([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 < 0.8 ** 2)) continue;
    pts.push([x, z]);
  }
  return pts;
}

const crowdPts = streetCrowd();
const roofPts = [[-7, -22], [-8.5, -21], [-7.5, -32], [7, -30], [8.2, -31], [-7, 2], [7.5, -40]];

export default {
  title: 'Luke 19:1-10: Zacchaeus in the sycamore',
  seed: 19,
  fov: 58,
  exposure: 1.0,

  sun: { direction: [-0.55, 0.62, 0.4], color: '#ffe2b0', intensity: 2.8 },
  light: { sky: '#a9c3e8', ground: '#8a6f50', hemi: 1.05 },
  sky: { top: '#4f86c6', horizon: '#e8d9b8', ground: '#c9b08a', sunColor: '#fff0c8', glow: 0.8 },
  fog: { color: '#e2d2b0', near: 80, far: 520 },
  clouds: { count: 22, shadow: '#b8b8c4', lit: '#fff6e6', rim: '#ffffff', distance: [300, 900], altitude: [120, 220], hole: 0.2 },
  mountains: { count: 40, color: '#a08262', radius: [420, 700], height: [40, 110], haze: 0.45 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.35, shadowTint: '#3a3050', highlightTint: '#fff0d0' },
  shadow: { center: [0, -10], radius: 45 },

  player: { start: START, yaw: -0.3, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 160,
    seed: 19,
    hills: 30,
    bumps: 0.2,
    flats: [{ x: 0, z: -15, r: 70, falloff: 40, height: 0 }],
    colors: { ground: '#c4a77c', groundAlt: '#b39469', grass: '#9a8f58', high: '#b49674', rock: '#9a7d5e' },
    patches: [{ x: 0, z: -15, r: 60, color: '#bfa27a', strength: 0.6, rough: 0.3 }],
  },

  scatter: [
    { type: 'tree', count: 60, center: [0, -15], ring: [70, 220], spacing: 8, seed: 3, props: { kind: 'palm' } },
    { type: 'tree', count: 25, center: [0, -15], ring: [80, 250], spacing: 10, seed: 4, props: { kind: 'broad', leaf: '#6e7d40' } },
    { type: 'rock', count: 30, center: [0, -15], ring: [120, 350], spacing: 12, seed: 5, props: { color: '#a3876a' } },
  ],

  crowd: {
    palette,
    groups: [
      { count: crowdPts.length, points: crowdPts, face: JESUS, children: 0.15, seed: 31 },
      { count: roofPts.length, points: roofPts, face: JESUS, children: 0.2, onStructures: true, seed: 32 },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    const colors = ['#d8c6a0', '#cdb68e', '#c9ad84', '#e2d6bd', '#bfa67e'];
    const awnings = ['#a34f32', '#3f5d7a', '#c9a24a', '#7d5c3e', '#e0d6c0'];

    for (let i = 0; i < 2 * 16; i++) {
      const side = i % 2 ? 1 : -1;
      const z = 34 - Math.floor(i / 2) * 7.6 + r.range(-0.4, 0.4);
      if (side > 0 && z < -2 && z > -24) continue;
      const w = r.range(6.2, 7.2), d = r.range(5.5, 8);
      house(ctx, {
        x: side * (4.4 + d / 2), z, rot: side > 0 ? -Math.PI / 2 : Math.PI / 2, w, d,
        h: r.range(3, 5.2), color: r.pick(colors), stair: r() < 0.3, awning: r() < 0.45 ? r.pick(awnings) : null,
      });
    }
    for (const [x, z, rot, w, d] of [[14, -4, -Math.PI / 2, 8, 7], [15, -14, -Math.PI / 2, 9, 7], [13, -23, -Math.PI / 2, 7, 6], [9, -27, 0, 7, 5.5], [9, 1, Math.PI, 7, 5]]) {
      house(ctx, { x, z, rot, w, d, h: r.range(3.4, 4.6), color: r.pick(colors) });
    }

    const pave = '#b7a07a';
    for (let z = 38; z > -60; z -= 1.6) {
      for (let x = -4; x <= 4; x += 1.6) {
        ctx.solid.box(1.5, 0.12, 1.5, { position: [x + r.range(-0.1, 0.1), ctx.heightAt(x, z) + 0.02, z], rotation: [0, r.range(-0.08, 0.08), 0], color: pave, jitter: 0.07 });
      }
    }

    // Sycamore-fig: short thick trunk, wide low limbs, broad flat crown.
    const [tx, tz] = TREE;
    const ty = ctx.heightAt(tx, tz) - 0.2;
    const bark = '#6e604c';
    ctx.solid.add(new THREE.CylinderGeometry(0.6, 0.95, 3.4, 7), { position: [tx, ty + 1.7, tz], color: bark, jitter: 0.06 });
    ctx.colliders.add({ x: tx, z: tz, w: 1.8, d: 1.8, bottom: ty, top: ty + 3.4 });
    const limb = (ax, ay, az, bx, by, bz, rad) => {
      const a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz);
      const len = a.distanceTo(b);
      const geo = new THREE.CylinderGeometry(rad * 0.65, rad, len, 6);
      geo.translate(0, len / 2, 0);
      geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
      ctx.solid.add(geo, { position: [ax, ay, az], color: bark, jitter: 0.06 });
    };
    const branchY = ty + 3.5;
    limb(tx, ty + 2.6, tz, ZACC[0] - 0.4, branchY, ZACC[1], 0.32);
    limb(tx, ty + 3, tz, tx + 3.5, ty + 5.2, tz - 2.5, 0.35);
    limb(tx, ty + 3, tz, tx + 1, ty + 5.8, tz + 3.5, 0.33);
    limb(tx, ty + 3.2, tz, tx - 1.5, ty + 6, tz - 3.5, 0.3);
    limb(tx, ty + 3.2, tz, tx + 0.4, ty + 6.5, tz, 0.4);
    const crown = [[0, 6.6, 0, 3.6], [3, 6, -2.4, 2.8], [1, 6.3, 3.2, 3], [-2, 6.6, -3, 2.8], [-2.6, 6.4, 1.6, 2.6], [3.4, 6.8, 1.5, 2.4], [0, 7.6, 0, 2.6]];
    for (const [lx, ly, lz, rad] of crown) {
      ctx.solid.add(new THREE.IcosahedronGeometry(rad, 0), {
        position: [tx + lx, ty + ly, tz + lz], rotation: [r() * 3, r() * 3, 0], scale: [1.15, 0.55, 1.15], color: r.pick(['#5d7a36', '#678540', '#55702f']), jitter: 0.1,
      });
    }
    for (const [lx, ly, lz] of [[-4.2, 6.1, -1.8], [-3.6, 6.2, 1.6], [-5.4, 5.9, 0.4]]) {
      ctx.solid.add(new THREE.IcosahedronGeometry(1.1, 0), { position: [tx + lx, ty + ly, tz + lz], rotation: [r() * 3, r() * 3, 0], scale: [1.2, 0.6, 1.2], color: '#678540', jitter: 0.1 });
    }

    person(ctx, { x: ZACC[0], z: ZACC[1], y: branchY + 0.38, pose: 'sit', face: JESUS, scale: 1.0, robe: '#8e2f22', mantle: '#e8b83c', hood: false, skin: '#9b6a46' });

    christ(ctx, { x: JESUS[0], z: JESUS[1], face: ZACC, arms: 'out', light: 14, halo: 3.2, glow: 0.25 });
    for (const [dx, dz] of [[-1.4, -1.6], [1.6, -1.8], [-0.4, -2.6], [-2.2, -0.4]]) {
      person(ctx, { x: JESUS[0] + dx, z: JESUS[1] + dz, face: ZACC, mantle: r.pick(['#5a3d2b', '#3f4d5e', '#556246']) });
    }

    for (let i = 0; i < 28; i++) {
      const side = r.sign();
      const x = side * r.range(4, 4.4), z = r.range(-55, 34);
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.24, 0.6, 7), { position: [x, y + 0.3, z], color: r.pick(['#a8643c', '#b87a4a', '#8a5a3a']) });
      ctx.solid.add(new THREE.SphereGeometry(0.22, 7, 3), { position: [x, y + 0.58, z], scale: [1, 0.5, 1], color: '#a8643c' });
    }
    for (let i = 0; i < 10; i++) {
      const side = r.sign();
      const x = side * r.range(3.6, 4.2), z = r.range(-55, 34);
      box(ctx, { x, z, y: ctx.heightAt(x, z), w: 0.7, h: 0.45, d: 0.7, rot: r() * 3, color: '#8f6a3e', collide: false });
      ctx.solid.add(new THREE.SphereGeometry(0.3, 6, 3), { position: [x, ctx.heightAt(x, z) + 0.45, z], scale: [1, 0.4, 1], color: r.pick(['#c9a24a', '#a34f32', '#6b8340']) });
    }
    for (const [x, z] of [[-11, 12], [11, 18], [-12, -40], [12, -46], [19, -8], [18, -20], [-12, -8], [5, 24]]) palm(ctx, { x, z, h: r.range(8, 11) });
    box(ctx, { x: START[0], z: START[1] + 0.2, y: ctx.heightAt(...START), w: 2.6, h: 0.9, d: 2.2, color: '#b8a07e' });
  },
};
