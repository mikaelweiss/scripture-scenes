// 2 Kings 2:9-13: on the east bank of the Jordan a chariot of fire and horses of fire part Elijah and
// Elisha, and Elijah goes up by a whirlwind. His mantle has fallen at Elisha's feet. Fifty sons of the
// prophets watch from across the river. The Jordan runs north-south to the west. -z is north.
import { figure, water, glowMaterial, channelFlats, riverGeometry, reeds, teamGeometry, whirlwind } from './lib/ot-31-kit.js';

const RIVER = [[-34, 320], [-30, 160], [-36, 60], [-28, 0], [-34, -70], [-28, -160], [-34, -340]];
const ELIJAH = [3, -14];
const ELISHA = [1.2, 1.5];

function fieryTeam(ctx, { x, y, z, yaw, pitch, scale = 1 }) {
  const { THREE } = ctx;
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';
  group.position.set(x, y, z);
  group.rotation.set(pitch, yaw, 0);
  group.scale.setScalar(scale);
  const geo = teamGeometry({ horses: 4, gallop: 0.7 });
  group.add(new THREE.Mesh(geo, glowMaterial('#ff7a22', 1.4)));
  const shell = new THREE.Mesh(geo, glowMaterial('#ffd060', 1.3, { transparent: true, opacity: 0.35, depthWrite: false }));
  shell.scale.setScalar(1.08);
  group.add(shell);
  const cone = new THREE.ConeGeometry(0.22, 1, 4).translate(0, 0.5, 0);
  const flames = [];
  const r = ctx.rand;
  const mats = ['#ff5a14', '#ff9a2a', '#ffd060'].map((c) => glowMaterial(c, 1.7));
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(cone, mats[i % 3]);
    const row = r();
    m.position.set(r.range(-0.9, 0.9), r.range(0.6, 2.2), row < 0.3 ? r.range(-0.4, 0.8) : r.range(2.6, 8));
    m.rotation.set(r.range(-0.6, -1.3), 0, r.range(-0.3, 0.3));
    m.scale.setScalar(r.range(0.6, 1.6));
    group.add(m);
    flames.push({ m, s: m.scale.x, ph: r() * 9 });
  }
  const light = new THREE.PointLight('#ff8a30', 160, 60, 1.2);
  light.position.set(0, 2, 3);
  group.add(light);
  ctx.scene.add(group);
  ctx.onFrame((t) => {
    group.position.y = y + Math.sin(t * 0.8) * 0.5;
    for (const f of flames) f.m.scale.set(f.s, f.s * (0.7 + 0.4 * Math.abs(Math.sin(t * 7 + f.ph))), f.s);
    light.intensity = 160 * (0.85 + 0.15 * Math.sin(t * 13));
  });
}

export default {
  title: "2 Kings 2:9-13: Elijah's chariot of fire",
  seed: 33,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.6, 0.45, 0.4], color: '#ffd8a8', intensity: 2.2 },
  light: { sky: '#7a8ab8', ground: '#4e4a32', hemi: 0.95 },
  sky: { top: '#2a3352', horizon: '#c89a78', ground: '#8a7a5a', sunColor: '#ffe0b0', glow: 1 },
  fog: { color: '#9a8a7a', near: 80, far: 560 },
  clouds: { count: 110, shadow: '#2a2a38', lit: '#d08a5a', rim: '#ffd8a0', distance: [150, 800], altitude: [70, 200], hole: 0.15, seed: 33 },
  mountains: { count: 40, color: '#6a5e50', radius: [500, 720], height: [60, 140], haze: 0.5 },
  bloom: { strength: 0.8, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.12, contrast: 1.08, vignette: 0.45, shadowTint: '#2a2850', highlightTint: '#ffd8a8' },
  shadow: { center: [-6, -6], radius: 60 },

  player: { start: [7, 11], yaw: 0.12, pitch: 0.26, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 33,
    hills: 50,
    bumps: 0.3,
    flats: [{ x: -10, z: 0, r: 110, falloff: 120, height: 0 }, ...channelFlats(RIVER, { r: 9, falloff: 7, height: -1.8 })],
    colors: { ground: '#9a8460', groundAlt: '#867050', grass: '#6e7c3e', high: '#9a8466', rock: '#7a6a58' },
    patches: [
      { x: -31, z: 0, r: 30, color: '#6a7a3a', strength: 0.5, rough: 0.6 },
      { x: ELISHA[0], z: ELISHA[1] - 6, r: 14, color: '#a89470', strength: 0.5, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'rock', x: 18, z: -6, size: 2 },
    { type: 'rock', x: -10, z: 22, size: 1.6 },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [-31, 0], ring: [16, 70], spacing: 6, seed: 4, props: { kind: 'broad', leaf: '#5a7038', h: 5 }, avoid: [{ rect: [32, 0, 88, 400] }] },
    { type: 'tree', count: 24, center: [-31, 0], ring: [12, 60], spacing: 6, seed: 5, props: { kind: 'palm', leaf: '#6a7a3a' }, avoid: [{ r: 10, x: -58, z: -8 }, { rect: [32, 0, 88, 400] }] },
    { type: 'tree', count: 60, center: [0, 0], ring: [80, 300], spacing: 8, seed: 6, props: {} },
    { type: 'rock', count: 40, center: [0, 0], ring: [30, 260], spacing: 10, seed: 7, props: { color: '#8a7a64' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#5e4b3a', '#94704e', '#d8cdb5'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.7,
      hoodChance: 0.4,
    },
    groups: [{ count: 50, center: [-60, -8], ring: [0, 7], spacing: 1, face: ELIJAH, children: 0, seed: 33 }],
  },

  effects: [
    { type: 'beam', at: ELIJAH, height: 300, radiusBottom: 2, radiusTop: 18, color: '#ffb060', opacity: 0.14 },
    { type: 'sunShafts', center: [10, -40], count: 6, spread: 60, length: 400, width: [8, 20], opacity: 0.06 },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { y: -0.75, geometry: riverGeometry(RIVER, 22, 8), color: '#5a7a74', opacity: 0.9, amp: 0.06 });
    reeds(ctx, RIVER, { offset: 9.5, spread: 2.5, every: 4 });
    whirlwind(ctx, { x: ELIJAH[0], z: ELIJAH[1], y: ctx.heightAt(...ELIJAH), height: 44, radius: 3.2, color: '#f0d8b0', opacity: 0.13, motes: 400 });
    const lift = figure(ctx, { x: ELIJAH[0], z: ELIJAH[1], y: 19, face: ELISHA, robe: '#5e4a36', skin: '#9b6a46', arms: 'out', emissive: 0.15, scale: 1.3, collide: false, halo: { size: 5, opacity: 0.4, color: '#ffe0b0' } });
    lift.traverse((m) => {
      if (!m.material) return;
      m.material.transparent = true;
      m.renderOrder = 20;
    });
    ctx.onFrame((t) => (lift.position.y = 19 + Math.sin(t * 0.6) * 0.4));
    fieryTeam(ctx, { x: -5, y: 6, z: -4, scale: 1.5, yaw: Math.PI / 2 + 0.25, pitch: -0.28 });
    figure(ctx, { x: ELISHA[0], z: ELISHA[1], face: ELIJAH, robe: '#7a5c40', mantle: '#4f5a6b', skin: '#a87652', arms: 'reach', scale: 1.02 });
    const y = ctx.heightAt(2.8, -0.6);
    ctx.solid.add(new THREE.BoxGeometry(1.3, 0.06, 0.9), { position: [2.8, y + 0.04, -0.6], rotation: [0.03, 0.6, -0.02], color: '#3b2c20' });
    ctx.solid.add(new THREE.BoxGeometry(0.5, 0.14, 0.7), { position: [3.2, y + 0.08, -0.4], rotation: [0, 0.4, 0.1], color: '#3b2c20' });
  },
};
