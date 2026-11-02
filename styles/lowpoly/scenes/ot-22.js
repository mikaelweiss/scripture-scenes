// Exodus 40:33-38: the tabernacle is reared up in the midst of the camp. At dusk the cloud
// that covers the tent of meeting begins to glow as fire, and the tribes watch from their tents.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { ISRAEL, desertTerrain, layoutTents, tentZones, tent, campfire, flock, banner, person } from './lib/ot-19-camp.js';

const COURT = { x: 0, z: -25, w: 22.5, d: 45 };
const TENT = { x: 0, z: -36, w: 4.6, d: 13.5, h: 4.6 };
const ALTAR = [0, -9];
const LAVER = [0, -17];

const tents = layoutTents({ center: [0, -25], ring: [40, 230], count: 240, seed: 22, face: [0, -25], avoid: [{ rect: [0, -25, 70, 90] }, { rect: [0, 30, 26, 70] }] });
const zones = tentZones(tents);

const linen = '#ece6d6';
const bronze = '#a8743c';
const screenStripes = ['#2a3a8a', '#5a2a6a', '#a82a2a', '#ece6d6'];

function court(ctx) {
  const { x, z, w, d } = COURT;
  const step = 2.25, h = 2.3;
  const sides = [
    [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2]],
    [[x - w / 2, z - d / 2], [x - w / 2, z + d / 2]],
    [[x + w / 2, z - d / 2], [x + w / 2, z + d / 2]],
    [[x - w / 2, z + d / 2], [x - 4.5, z + d / 2]],
    [[x + 4.5, z + d / 2], [x + w / 2, z + d / 2]],
  ];
  for (const [[ax, az], [bx, bz]] of sides) {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.round(len / step);
    const rot = Math.atan2(bx - ax, bz - az);
    for (let i = 0; i <= n; i++) {
      const px = ax + ((bx - ax) * i) / n, pz = az + ((bz - az) * i) / n;
      const y = ctx.heightAt(px, pz);
      ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.1, h + 0.2, 6), { position: [px, y + (h + 0.2) / 2, pz], color: '#7a5a3a' });
      ctx.solid.box(0.3, 0.25, 0.3, { position: [px, y + 0.12, pz], color: bronze });
      ctx.solid.box(0.24, 0.12, 0.24, { position: [px, y + h + 0.24, pz], color: '#d8d8d8' });
    }
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, y = ctx.heightAt(mx, mz);
    ctx.solid.box(0.05, h - 0.1, len, { position: [mx, y + h / 2 + 0.05, mz], rotation: [0, rot, 0], color: linen, jitter: 0.03 });
    ctx.colliders.add({ x: mx, z: mz, w: 0.3, d: len, rot, bottom: y, top: y + h });
  }
  // The gate screen of blue, purple and scarlet, drawn back to the sides so the way in stands open.
  const gz = z + d / 2;
  const gy = ctx.heightAt(x, gz);
  for (const side of [-1, 1]) {
    screenStripes.forEach((c, i) => {
      ctx.solid.box(0.75, h - 0.2, 0.08, { position: [x + side * (1.9 + i * 0.75), gy + (h - 0.2) / 2, gz], color: c, jitter: 0.02 });
    });
    ctx.colliders.add({ x: x + side * 3, z: gz, w: 3, d: 0.4, bottom: gy, top: gy + h });
  }
  for (const s of [-1, 1]) ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.1, h + 0.2, 6), { position: [x + s * 1.5, gy + h / 2, gz], color: '#7a5a3a' });
}

function tabernacle(ctx) {
  const { x, z, w, d, h } = TENT;
  const y = ctx.heightAt(x, z) - 0.05;
  ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], color: '#c49a40' });
  ctx.solid.box(w + 0.5, h * 0.92, d + 0.3, { position: [x, y + h * 0.46 + 0.15, z - 0.2], color: '#5a3a2e', jitter: 0.05 });
  for (const s of [-1, 1]) {
    ctx.solid.box(w / 2 + 0.6, 0.12, d + 0.6, { position: [x + s * w * 0.27, y + h + 0.35, z - 0.2], rotation: [0, 0, -s * 0.28], color: '#7a3a2a', jitter: 0.04 });
  }
  ctx.solid.box(0.3, 0.3, d + 0.6, { position: [x, y + h + 0.68, z - 0.2], color: '#6a3222' });
  // Door hanging and pillars on the east end.
  const fz = z + d / 2 + 0.06;
  screenStripes.forEach((c, i) => ctx.solid.box(w / 4, h - 0.3, 0.06, { position: [x - w * 0.375 + i * (w / 4), y + (h - 0.3) / 2, fz], color: c, jitter: 0.02 }));
  for (let i = 0; i < 5; i++) ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.1, h, 6), { position: [x - w / 2 + (i * w) / 4, y + h / 2, fz + 0.12], color: '#d8b048' });
  ctx.colliders.add({ x, z, w: w + 0.6, d: d + 0.6, bottom: y, top: y + h + 0.8 });

  const [ax, az] = ALTAR;
  const ay = ctx.heightAt(ax, az);
  ctx.solid.box(2.4, 1.4, 2.4, { position: [ax, ay + 0.7, az], color: bronze });
  ctx.solid.box(2.6, 0.18, 2.6, { position: [ax, ay + 1.0, az], color: '#8a5a2a' });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.solid.add(new THREE.ConeGeometry(0.12, 0.35, 4), { position: [ax + sx * 1.1, ay + 1.55, az + sz * 1.1], color: bronze });
  ctx.colliders.add({ x: ax, z: az, w: 2.4, d: 2.4, bottom: ay, top: ay + 1.4 });
  ctx.solid.box(1.8, 0.2, 1.4, { position: [ax, ay + 1.38, az], color: '#3a2a1e' });
  for (let i = 0; i < 9; i++) {
    const s = ctx.rand.range(0.6, 1.2);
    ctx.glow.add(new THREE.ConeGeometry(0.22 * s, 1.1 * s, 4), { position: [ax + ctx.rand.range(-0.6, 0.6), ay + 1.5 + 0.5 * s, az + ctx.rand.range(-0.5, 0.5)], rotation: [0, ctx.rand() * 3, 0], color: ctx.rand.pick(['#ff8a2a', '#ffb347', '#ff6a1a']) });
  }
  const fireLight = new THREE.PointLight('#ff9a48', 40, 22, 1.5);
  fireLight.position.set(ax, ay + 3, az);
  ctx.scene.add(fireLight);
  ctx.effects.smoke({ position: [ax, ay + 2, az], count: 12, height: 18, size: 0.6, color: '#a09890', seed: 8 });

  const [lx, lz] = LAVER;
  const ly = ctx.heightAt(lx, lz);
  ctx.solid.add(new THREE.CylinderGeometry(0.25, 0.5, 0.9, 8), { position: [lx, ly + 0.45, lz], color: bronze });
  ctx.solid.add(new THREE.CylinderGeometry(0.8, 0.45, 0.45, 10), { position: [lx, ly + 1.1, lz], color: '#c08848' });
  ctx.colliders.add({ x: lx, z: lz, w: 1.4, d: 1.4, bottom: ly, top: ly + 1.3 });
}

// The cloud over the tent, glowing with fire from within as night falls.
function pillar(ctx) {
  const r = rng(40);
  const { x, z, h } = TENT;
  const base = ctx.heightAt(x, z) + h + 1;
  const mat = (k) => new THREE.MeshLambertMaterial({ color: '#8a7a74', emissive: new THREE.Color('#ff7a2a').lerp(new THREE.Color('#c89070'), k), emissiveIntensity: 0.75 - k * 0.45, flatShading: true });
  const mats = [0, 0.3, 0.6, 1].map(mat);
  const puffs = [];
  for (let i = 0; i < 130; i++) {
    const t = (i / 130) ** 1.3;
    const y = base + t * 150 + r.range(-3, 3);
    const rad = 6 + t * 16 + r.range(-1, 2);
    const a = r() * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mats[Math.min(3, Math.floor(t * 4 + r() * 0.8))]);
    const s = rad * r.range(0.45, 0.8);
    m.scale.set(s, s * 0.8, s);
    m.position.set(x + Math.cos(a) * rad * 0.55, y, z + Math.sin(a) * rad * 0.55);
    m.userData = { a, rad, y, ph: r() * 6 };
    ctx.scene.add(m);
    puffs.push(m);
  }
  ctx.onFrame((t) => {
    for (const m of puffs) {
      const { a, rad, y, ph } = m.userData;
      m.rotation.y = t * 0.05 + ph;
      m.position.y = y + Math.sin(t * 0.3 + ph) * 1.2;
      m.position.x = x + Math.cos(a + t * 0.04) * rad * 0.55;
    }
    for (const [i, mm] of mats.entries()) mm.emissiveIntensity = (0.75 - i * 0.15) * (0.9 + 0.1 * Math.sin(t * 2.3 + i));
  });
  ctx.effects.halo({ position: [x, base + 10, z], size: 34, color: '#ffae60', opacity: 0.3 });
  const light = new THREE.PointLight('#ffb070', 260, 120, 1.3);
  light.position.set(x, base + 12, z + 6);
  ctx.scene.add(light);
  ctx.effects.halo({ position: [x, ctx.heightAt(x, z) + 2.4, z + TENT.d / 2 + 0.4], size: 7, color: '#fff0c8', opacity: 0.5 });
}

export default {
  title: 'Exodus 40:33-38: The tabernacle',
  seed: 22,
  fov: 62,
  exposure: 1.1,

  sun: { direction: [-0.95, 0.05, -0.25], color: '#ff9a60', intensity: 1.1 },
  light: { sky: '#8a7aa8', ground: '#5a4038', hemi: 1.3 },
  sky: { top: '#141a38', horizon: '#d0784a', ground: '#5a3a30', sunColor: '#ffb070', glow: 0.8 },
  fog: { color: '#5e4448', near: 80, far: 620 },
  clouds: { count: 40, shadow: '#2a2034', lit: '#e08050', rim: '#ffc890', distance: [400, 1000], altitude: [160, 300], hole: 0.3 },
  mountains: { count: 40, color: '#3a2a30', radius: [520, 760], height: [50, 140], haze: 0.4 },
  bloom: { strength: 0.5, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.1, contrast: 1.08, vignette: 0.48, shadowTint: '#201a48', highlightTint: '#ffd8a8' },
  shadow: { center: [0, -25], radius: 60 },

  player: { start: [0, 26], yaw: 0, pitch: 0.2, eye: 1.65, speed: 4.5 },

  terrain: desertTerrain({
    seed: 22,
    flats: [{ x: 0, z: -25, r: 120, falloff: 80, height: 0 }],
    colors: { ground: '#a07a5a', groundAlt: '#8e6c50', grass: '#8a7656', high: '#7a5a48', rock: '#6a4c40' },
    patches: [{ x: 0, z: -25, r: 30, color: '#b89a78', strength: 0.5, rough: 0.2 }],
  }),

  scatter: [{ type: 'rock', count: 50, center: [0, -25], ring: [200, 420], spacing: 12, seed: 3, props: { color: '#7a5a4a' } }],

  crowd: {
    palette: ISRAEL,
    groups: [
      { count: 1300, center: [0, -25], ring: [36, 150], spacing: 1.4, face: [0, -36], children: 0.22, kneel: 0.3, seed: 41, avoid: [...zones, { rect: [0, 26, 8, 30] }] },
      { count: 520, center: [0, -25], ring: [30, 70], arc: [0.5, Math.PI - 0.5], spacing: 1.1, face: [0, -36], children: 0.25, kneel: 0.35, seed: 42, avoid: [...zones, { rect: [0, 26, 10, 40] }] },
    ],
  },

  custom(ctx) {
    for (const t of tents) tent(ctx, t);
    court(ctx);
    tabernacle(ctx);
    pillar(ctx);
    const fill = new THREE.DirectionalLight('#ffb48a', 0.9);
    fill.position.set(20, 30, 120);
    ctx.scene.add(fill);
    // Aaron in blue, and his sons in white linen, at the altar.
    person(ctx, { x: 1.8, z: -6.5, yaw: Math.PI + 0.4, robe: '#2a3a8a', mantle: '#c9a24a', skin: '#9b6a46', arms: [[1.3, 0.2], [1.3, 0.2]] });
    person(ctx, { x: -2, z: -7, yaw: Math.PI - 0.5, robe: '#ece6d6', skin: '#8a5a3c', arms: [[0.9, 0.15], [0.3, 0.12]] });
    person(ctx, { x: -1.4, z: -15.5, yaw: Math.PI / 2, robe: '#ece6d6', skin: '#a87652', arms: [[1.2, 0.1], [1.2, 0.1]] });
    const colors = ['#2a7a3a', '#9a2a24', '#c9a24a', '#2a4a7a'];
    [[0, -110], [-80, -25], [0, 60], [80, -25]].forEach(([x, z], i) => banner(ctx, x, z, colors[i], { h: 7, w: 2.2 }));
    for (const [x, z] of [[-50, 0], [50, -10], [-40, -70], [46, -80], [-24, 40], [26, 46]]) campfire(ctx, x, z, { light: true, smoke: 6 });
    flock(ctx, [-150, 40], 30, 14, 5);
    flock(ctx, [150, -90], 24, 12, 6, ['goat', 'sheep', 'ox']);
  },
};
