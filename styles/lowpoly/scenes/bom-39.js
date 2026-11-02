// 3 Nephi 3-4: the whole Nephite people gather into one land with their flocks, herds and
// seven years of provisions, behind earthworks and timber palisades, to wait for the robbers.
// Coordinates are meters. The camp is a ring of fortification around CAMP; the robbers gather to the north.
import * as THREE from 'three';
import { addCrowd, figure, tent, banner, herd, fires } from './lib/bom-37-kit.js';

const CAMP = [0, -30];
const R = 72;
const GATE = -Math.PI / 2;

const palette = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#d8cdb5', '#4f5a6b', '#9a4a34'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#556246'],
  skins: ['#b07f58', '#a87652', '#c08c63', '#9b6a46'],
  mantleChance: 0.6,
  hoodChance: 0.2,
};

const robbers = {
  robes: ['#6a1f1a', '#7a2a20', '#4a1a16', '#5a2a22', '#2e2420'],
  mantles: ['#8a2a1e', '#3a2a22', '#a8382a'],
  skins: ['#9b6a46', '#8a5a3c'],
  mantleChance: 0.8,
  hoodChance: 0,
};

const onRing = (a, r = R) => [CAMP[0] + Math.cos(a) * r, CAMP[1] + Math.sin(a) * r];
const nearGate = (a) => Math.abs(Math.atan2(Math.sin(a - GATE), Math.cos(a - GATE))) < 0.08;

// Earth bank with a ditch outside and sharpened timber pickets along its crest.
function fortification(ctx) {
  const { solid, colliders, heightAt } = ctx;
  const steps = 160;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    if (nearGate(a)) continue;
    const [x, z] = onRing(a);
    const y = heightAt(x, z);
    const seg = (Math.PI * 2 * R) / steps + 0.3;
    const bank = new THREE.CylinderGeometry(0.6, 3.6, 2.4, 4, 1);
    bank.rotateY(Math.PI / 4);
    solid.add(bank, { position: [x, y + 0.9, z], rotation: [0, -a, 0], scale: [1, 1, seg / 5], color: '#8a7050', jitter: 0.06 });
    colliders.add({ x, z, w: 4, d: seg, rot: -a, bottom: y - 1, top: y + 5.5 });
  }
  const pickets = Math.round((Math.PI * 2 * R) / 0.55);
  for (let i = 0; i < pickets; i++) {
    const a = (i / pickets) * Math.PI * 2;
    if (nearGate(a)) continue;
    const [x, z] = onRing(a);
    const y = heightAt(x, z) + 1.6;
    const h = 3.2 + ctx.rand.range(-0.3, 0.3);
    solid.box(0.42, h, 0.42, { position: [x, y + h / 2, z], rotation: [0, -a, 0], color: '#6a5038', jitter: 0.1 });
    solid.add(new THREE.ConeGeometry(0.3, 0.6, 4), { position: [x, y + h + 0.3, z], rotation: [0, -a + Math.PI / 4, 0], color: '#5a4430', jitter: 0.08 });
  }
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2;
    if (nearGate(a)) continue;
    const [x, z] = onRing(a, R + 4.5);
    solid.box(1.6, 0.3, (Math.PI * 2 * (R + 4.5)) / 70 + 0.2, { position: [x, heightAt(x, z) - 0.05, z], rotation: [0, -a, 0], color: '#4f3e2c', jitter: 0.05 });
  }
  const towers = [GATE - 0.12, GATE + 0.12, GATE + Math.PI / 2, GATE - Math.PI / 2, GATE + 0.8, GATE - 0.8];
  for (const a of towers) {
    const [x, z] = onRing(a, R - 1.5);
    const y = heightAt(x, z);
    const h = 9;
    for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) solid.box(0.3, h, 0.3, { position: [x + dx, y + h / 2, z + dz], color: '#5a4430' });
    solid.box(3.6, 0.3, 3.6, { position: [x, y + h, z], color: '#6a5038' });
    for (const s of [-1, 1]) {
      solid.box(3.6, 1.1, 0.15, { position: [x, y + h + 0.6, z + s * 1.75], color: '#6a5038' });
      solid.box(0.15, 1.1, 3.6, { position: [x + s * 1.75, y + h + 0.6, z], color: '#6a5038' });
    }
    const roof = new THREE.ConeGeometry(2.8, 1.6, 4);
    solid.add(roof, { position: [x, y + h + 2.8, z], rotation: [0, Math.PI / 4, 0], color: '#8a7448' });
    for (const [dx, dz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) solid.box(0.15, 1.6, 0.15, { position: [x + dx, y + h + 1.2, z + dz], color: '#5a4430' });
    colliders.add({ x, z, w: 3, d: 3, bottom: y, top: y + h });
    figure(ctx, { x, z, y: y + h + 0.15, face: onRing(a, R + 50), robe: '#6e5a44', mantle: '#3f4d5e', skin: '#a87652', solid: false });
  }
  const [g1x, g1z] = onRing(GATE - 0.09, R), [g2x, g2z] = onRing(GATE + 0.09, R);
  for (const [x, z] of [[g1x, g1z], [g2x, g2z]]) solid.box(1, 7, 1, { position: [x, heightAt(x, z) + 3.5, z], color: '#5a4430' });
  solid.box(Math.hypot(g2x - g1x, g2z - g1z) + 1, 0.8, 0.8, { position: [(g1x + g2x) / 2, heightAt(g1x, g1z) + 6.6, (g1z + g2z) / 2], color: '#5a4430' });
}

// Granaries and heaped provisions: round storehouses with thatch, jars and grain sacks.
function provisions(ctx, spots) {
  const { solid, rand, heightAt, colliders } = ctx;
  for (const [x, z] of spots) {
    const y = heightAt(x, z) - 0.1;
    solid.add(new THREE.CylinderGeometry(2.2, 2.4, 2.8, 8), { position: [x, y + 1.4, z], color: '#b89a6a' });
    solid.add(new THREE.ConeGeometry(3.0, 2.4, 8), { position: [x, y + 4.0, z], color: '#a88c4c', jitter: 0.08 });
    solid.box(0.9, 1.6, 0.1, { position: [x, y + 0.8, z + 2.32], color: '#2e241c', jitter: 0 });
    colliders.add({ x, z, w: 4.4, d: 4.4, bottom: y, top: y + 5 });
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2, d = rand.range(3, 4.5);
      const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
      if (rand() < 0.5) solid.add(new THREE.CylinderGeometry(0.22, 0.32, 0.7, 6), { position: [px, heightAt(px, pz) + 0.35, pz], color: rand.pick(['#a4583a', '#b86a44', '#8a4a30']) });
      else solid.add(new THREE.DodecahedronGeometry(0.4, 0), { position: [px, heightAt(px, pz) + 0.25, pz], scale: [1, 0.6, 0.8], rotation: [0, rand() * 3, 0], color: rand.pick(['#d8c49a', '#c9b080', '#e0d0a8']) });
    }
  }
}

// Post and rail pen.
function pen(ctx, { x, z, w, d }) {
  const { solid, heightAt } = ctx;
  const post = (px, pz) => solid.box(0.18, 1.3, 0.18, { position: [px, heightAt(px, pz) + 0.55, pz], color: '#5a4430' });
  for (const [ax, az, bx, bz] of [[-w / 2, -d / 2, w / 2, -d / 2], [-w / 2, d / 2, w / 2, d / 2], [-w / 2, -d / 2, -w / 2, d / 2], [w / 2, -d / 2, w / 2, d / 2]]) {
    const len = Math.hypot(bx - ax, bz - az), n = Math.ceil(len / 2.5);
    for (let i = 0; i <= n; i++) post(x + ax + ((bx - ax) * i) / n, z + az + ((bz - az) * i) / n);
    const mx = x + (ax + bx) / 2, mz = z + (az + bz) / 2;
    for (const h of [0.5, 0.95]) solid.box(ax === bx ? 0.1 : len, 0.1, ax === bx ? len : 0.1, { position: [mx, heightAt(mx, mz) + h, mz], color: '#6a5038' });
  }
}

export default {
  title: '3 Nephi 3-4: The Nephites gather against the robbers',
  seed: 39,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.55, 0.55, 0.4], color: '#fff0d8', intensity: 2.7 },
  light: { sky: '#a8c4e8', ground: '#6a5a40', hemi: 1.0 },
  sky: { top: '#4f7cb2', horizon: '#d6dee0', ground: '#b9a888', sunColor: '#fff2d0', glow: 0.8 },
  fog: { color: '#c9d0cc', near: 100, far: 650 },
  clouds: { count: 45, shadow: '#8c96a6', lit: '#fbf6ec', rim: '#ffffff', distance: [300, 900], altitude: [110, 230], hole: 0.2 },
  mountains: { count: 40, color: '#5c665a', radius: [520, 760], height: [60, 160], haze: 0.5 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.35, shadowTint: '#2a3050', highlightTint: '#fff2d8' },
  shadow: { center: [0, -10], radius: 70 },

  player: { start: [4, 30], yaw: 0.05, pitch: -0.05, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 39,
    hills: 40,
    bumps: 0.3,
    flats: [
      { x: CAMP[0], z: CAMP[1], r: R + 8, falloff: 40, height: 0 },
      { x: 4, z: 33, r: 5, falloff: 12, height: 3.2 },
    ],
    colors: { ground: '#8f8a58', groundAlt: '#7f7c4c', grass: '#6f8a40', high: '#7c7c54', rock: '#7a6a58' },
    patches: [
      { x: CAMP[0], z: CAMP[1], r: R - 4, color: '#a8926a', strength: 0.7, rough: 0.5 },
      { x: 0, z: -200, r: 60, color: '#5a4a3a', strength: 0.5, rough: 0.6 },
    ],
  },

  scatter: [
    { type: 'tree', count: 110, center: CAMP, ring: [R + 25, 330], spacing: 7, seed: 8, avoid: [{ rect: [0, -170, 80, 120] }], props: { leaf: '#56763a' } },
    { type: 'rock', count: 25, center: CAMP, ring: [R + 20, 320], spacing: 12, seed: 10, props: {} },
  ],

  crowd: {
    palette,
    groups: [
      { count: 520, center: [0, -38], ring: [4, 30], spacing: 0.95, face: [0, -110], children: 0.2, seed: 21, avoid: [{ r: 3.2, x: 0, z: -38 }] },
      { count: 260, center: CAMP, ring: [36, 62], arc: [0.2, Math.PI - 0.2], spacing: 1.2, face: [0, -38], children: 0.25, seed: 22, avoid: [{ rect: [4, 30, 8, 30] }, { x: -9, z: 10, r: 9 }, { x: 17, z: 8, r: 8 }] },
      { count: 160, center: CAMP, ring: [36, 62], arc: [Math.PI + 0.3, Math.PI * 2 - 0.3], spacing: 1.2, face: [0, -38], children: 0.15, seed: 23 },
      { count: 50, center: [0, -103], ring: [0, 6], arc: [0, Math.PI], spacing: 1, face: [0, -200], children: 0, seed: 24 },
    ],
  },

  custom(ctx) {
    const r = ctx.rand;
    fortification(ctx);

    for (let ring = 0; ring < 2; ring++) {
      const rad = 46 + ring * 11;
      const n = 30 + ring * 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.07;
        const [x, z] = onRing(a, rad + r.range(-1.5, 1.5));
        if (Math.hypot(x - 4, z - 30) < 9 || Math.abs(a - (Math.PI * 1.5)) < 0.14) continue;
        tent(ctx, { x, z, rot: -a + Math.PI / 2, color: r.pick(['#d6c6a4', '#c8b28a', '#b89a74', '#e0d4b8', '#a8805a']) });
      }
    }
    provisions(ctx, [[-30, -8], [-36, -20], [30, -8], [36, -20], [-26, 6], [26, 6]]);
    pen(ctx, { x: -48, z: -48, w: 18, d: 14 });
    pen(ctx, { x: 48, z: -48, w: 18, d: 14 });
    herd(ctx, { center: [-48, -48], radius: [8, 6], count: 45, kind: 'sheep', seed: 3 });
    herd(ctx, { center: [48, -48], radius: [8, 6], count: 14, kind: 'cow', seed: 4 });
    herd(ctx, { center: [-9, 10], radius: [7, 5], count: 34, kind: 'sheep', seed: 5 });
    herd(ctx, { center: [17, 8], radius: [6, 4], count: 9, kind: 'cow', seed: 6 });
    herd(ctx, { center: [-10, -78], radius: [14, 6], count: 18, kind: 'goat', seed: 7 });

    // Captain Gidgiddoni's banner at the gathering place, standards along the works.
    banner(ctx, { x: 0, z: -38, h: 8, color: '#2f5a7a', w: 1.8, len: 2.8 });
    for (const a of [GATE - 0.3, GATE + 0.3, GATE + 1.2, GATE - 1.2, 0.4, Math.PI - 0.4]) {
      const [x, z] = onRing(a, R - 4);
      banner(ctx, { x, z, h: 6, color: r.pick(['#2f5a7a', '#8a2a1e', '#e8dcc0']) });
    }
    // Gidgiddoni on a rough platform of stacked timber, raised above the host so he can be seen.
    const deck = ctx.heightAt(0, -35.5);
    ctx.solid.box(3, 1.1, 2.4, { position: [0, deck + 0.5, -35.5], color: '#7a5e40' });
    ctx.colliders.add({ x: 0, z: -35.5, w: 3, d: 2.4, bottom: deck - 0.1, top: deck + 1.05 });
    figure(ctx, { x: 0, z: -35.5, y: deck + 1.05, face: [4, 30], pose: 'raise', robe: '#e8dcc0', mantle: '#2f5a7a', skin: '#b07f58', scale: 1.25 });

    const camps = [[-30, 30], [32, 34], [-50, -2], [50, -4], [-20, -62], [22, -60]];
    fires(ctx, camps.map(([x, z]) => ({ x, z, size: 0.5 })), { lights: 0 });
    for (const [x, z] of camps) ctx.effects.smoke({ position: [x, ctx.heightAt(x, z) + 0.5, z], count: 8, height: 14, size: 0.5 });

    // The robbers' host gathering on the hills beyond the works, with their smoke.
    addCrowd(ctx, robbers, [{ count: 420, center: [0, -205], ring: [0, 40], arc: [Math.PI * 0.95, Math.PI * 2.05], spacing: 1.4, face: CAMP, children: 0, seed: 31 }]);
    for (let i = 0; i < 18; i++) {
      const x = r.range(-70, 70), z = r.range(-260, -235);
      tent(ctx, { x, z, rot: r() * 3, color: r.pick(['#4a3a30', '#5a3a2a', '#3a2e26']) });
    }
    for (const [x, z] of [[-40, -250], [20, -255], [55, -240]]) ctx.builders.smolder(ctx, { x, z, radius: 3, smoke: 14, height: 40 });
  },
};
