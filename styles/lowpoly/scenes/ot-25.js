// Judges 7:16-22. Night. Gideon's three hundred stand round the Midianite camp in the valley,
// break their pitchers, raise torches, and blow trumpets. The camp wakes in panic. -z is north.
import * as THREE from 'three';
import { scatter, makePeople, addPeople, handAt, local, instanced, flames, fireLight, stars, tent, camel, rng } from './lib/ot-25-kit.js';

const CAMP = [0, -10];
const START = [3, 64];

const israel = {
  robes: ['#6b5a44', '#7a6248', '#5a4a3a', '#8a7052', '#4e4438', '#6e5e48'],
  mantles: ['#4a3a2c', '#5e4a34', '#3e3a30', '#6a5238'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
  mantleChance: 0.7,
  hoodChance: 0.2,
};
const midian = {
  robes: ['#3a2e3c', '#4a3a30', '#2e2a34', '#5a3a2e', '#6a4a2a', '#3c3428', '#56303a'],
  mantles: ['#2a2226', '#4a2a2e', '#5a4a2a', '#2e3040'],
  skins: ['#7a4c31', '#8a5a3c', '#6e4430'],
  mantleChance: 0.5,
  hoodChance: 0.6,
};

// Three companies on the hills around the camp, the nearest on the south rim around the player.
const companies = [
  { arc: [Math.PI * 0.28, Math.PI * 0.72], seed: 31 },
  { arc: [Math.PI * 0.95, Math.PI * 1.38], seed: 32 },
  { arc: [Math.PI * 1.62, Math.PI * 2.05], seed: 33 },
];
const gideonPts = companies.flatMap((c) =>
  scatter({ count: 100, center: CAMP, ring: [55, 66], arc: c.arc, spacing: 1.5, seed: c.seed, avoid: [{ x: START[0], z: START[1], r: 3 }] }),
);

const LEFT = [-0.35, 2.55];
const RIGHT = [-0.25, 1.45];

export default {
  title: "Judges 7:16-22: Gideon's three hundred",
  seed: 25,
  fov: 62,
  exposure: 1.2,

  sun: { direction: [0.45, 0.42, -0.75], color: '#a8bcf0', intensity: 2.4 },
  light: { sky: '#4a5f9a', ground: '#2a2018', hemi: 1.5 },
  sky: { top: '#060a1a', horizon: '#1d2a4a', ground: '#0e1220', sunColor: '#dfe8ff', glow: 0.55 },
  fog: { color: '#141c30', near: 40, far: 330 },
  clouds: { count: 22, shadow: '#0e1222', lit: '#3a4a72', rim: '#9fb0e0', distance: [300, 900], altitude: [110, 220], hole: 0.3, seed: 7 },
  mountains: { count: 40, color: '#141826', radius: [420, 640], height: [40, 110], haze: 0.35 },
  bloom: { strength: 0.9, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.05, contrast: 1.1, vignette: 0.5, shadowTint: '#141a3a', highlightTint: '#ffd8a0' },
  shadow: { center: [0, 10], radius: 90 },

  player: { start: START, yaw: 0.05, pitch: -0.13, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 25,
    hills: 30,
    bumps: 0.4,
    flats: [
      { x: CAMP[0], z: CAMP[1], r: 42, falloff: 26, height: -9 },
      { x: 3, z: 74, r: 9, falloff: 14, height: 7 },
      { x: -62, z: -38, r: 16, falloff: 26, height: 4.5 },
      { x: 60, z: -42, r: 16, falloff: 26, height: 4 },
    ],
    colors: { ground: '#5a5440', groundAlt: '#4c4a3a', grass: '#3e4a32', high: '#504c3e', rock: '#3c3a34' },
    patches: [{ x: CAMP[0], z: CAMP[1], r: 50, color: '#6a5e46', strength: 0.6, rough: 0.4 }, { x: START[0], z: START[1], r: 30, color: '#706a54', strength: 0.6, rough: 0.5 }],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 50, center: CAMP, ring: [85, 260], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#28361e' } },
    { type: 'rock', count: 50, center: CAMP, ring: [50, 220], spacing: 6, seed: 10, avoid: [{ x: START[0], z: START[1], r: 8 }], props: { color: '#4a4640' } },
  ],

  custom(ctx) {
    stars(ctx, { count: 1800 });

    const r = rng(77);

    // Gideon's men: torch high in the left hand, trumpet at the lips, pitcher broken at their feet.
    const men = addPeople(ctx, makePeople(gideonPts, { palette: israel, face: CAMP, yawJitter: 0.15, seed: 34 }), { arms: { left: LEFT, right: RIGHT } });
    const torchHand = handAt(-1, ...LEFT);
    const sticks = [], horns = [], shards = [], fire = [];
    for (const p of men) {
      const hand = local(p, torchHand);
      sticks.push({ position: [hand[0], hand[1] + 0.18 * p.scale, hand[2]], scale: p.scale, color: '#4a3424' });
      fire.push({ position: [hand[0], hand[1] + 0.5 * p.scale, hand[2]], size: 0.19 * p.scale });
      horns.push({ position: local(p, [0.05, 1.52, 0.36]), rotation: [Math.PI / 2 - 0.25, p.yaw, 0], scale: p.scale, color: '#d6c9a8' });
      for (let k = 0; k < 3; k++) {
        const a = r() * Math.PI * 2, d = r.range(0.35, 0.8);
        const sx = p.x + Math.cos(a) * d, sz = p.z + Math.sin(a) * d;
        shards.push({ position: [sx, ctx.heightAt(sx, sz) + 0.05, sz], rotation: [r.range(-1, 1), r() * 6, r.range(-1, 1)], scale: r.range(0.6, 1.2), color: r.pick(['#a8603a', '#b8704a', '#8e4e30']) });
      }
    }
    instanced(ctx, new THREE.CylinderGeometry(0.03, 0.04, 0.75, 5), sticks);
    instanced(ctx, new THREE.ConeGeometry(0.07, 0.5, 6, 1, true).translate(0, 0, 0).rotateX(Math.PI), horns);
    instanced(ctx, new THREE.CylinderGeometry(0.16, 0.12, 0.05, 5, 1, false, 0, 2.2), shards);
    flames(ctx, fire);
    for (const f of fire) ctx.effects.halo({ position: [f.position[0], f.position[1] + 0.3, f.position[2]], size: 1.6, opacity: 0.4, color: '#ffb060' });

    // Lights only near the player's company, so the torches light faces and ground where it is seen.
    for (const p of men.filter((m) => Math.hypot(m.x - START[0], m.z - START[1]) < 26).filter((_, i) => i % 6 === 0).slice(0, 4)) {
      fireLight(ctx, local(p, [0, 2.4, 0]), { intensity: 26, distance: 22 });
    }

    // The Midianite camp: tents, couched camels, dying campfires.
    const tentPts = scatter({ count: 70, center: CAMP, ring: [6, 44], spacing: 8, seed: 41 });
    for (const [x, z] of tentPts) tent(ctx, { x, z, rot: r() * Math.PI, w: r.range(4.5, 7), d: r.range(3.5, 4.5), h: r.range(1.8, 2.4), color: r.pick(['#4a3a2e', '#54402e', '#5e4a36', '#463c34']) });
    const camelPts = scatter({ count: 34, center: CAMP, ring: [4, 52], spacing: 5, seed: 42, avoid: tentPts.map(([x, z]) => ({ x, z, r: 5 })) });
    camelPts.forEach(([x, z], i) => camel(ctx, { x, z, rot: r() * Math.PI * 2, lying: i % 3 !== 0, color: r.pick(['#8e6e48', '#7a5e40', '#9a7a52']) }));

    const firePts = scatter({ count: 14, center: CAMP, ring: [5, 38], spacing: 11, seed: 43, avoid: tentPts.map(([x, z]) => ({ x, z, r: 4.5 })) });
    const campFlames = [];
    for (const [x, z] of firePts) {
      const y = ctx.heightAt(x, z);
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        ctx.solid.add(new THREE.DodecahedronGeometry(0.22, 0), { position: [x + Math.cos(a) * 0.75, y + 0.08, z + Math.sin(a) * 0.75], color: '#3a3632' });
      }
      ctx.glow.add(new THREE.CircleGeometry(0.55, 7).rotateX(-Math.PI / 2), { position: [x, y + 0.07, z], color: '#c8401a', jitter: 0.1 });
      campFlames.push({ position: [x, y + 0.05, z], size: 0.9 });
    }
    flames(ctx, campFlames, { color: '#e86a24', core: '#ffc070' });
    for (const [x, z] of firePts.slice(0, 8)) fireLight(ctx, [x, ctx.heightAt(x, z) + 2.2, z], { intensity: 90, distance: 40, color: '#ff7a30' });

    // The host wakes, cries, and turns on itself: men running every way, swords raised.
    const fleePts = scatter({ count: 220, center: CAMP, ring: [3, 50], spacing: 1.2, seed: 44, avoid: [...tentPts.map(([x, z]) => ({ x, z, r: 2.6 })), ...camelPts.map(([x, z]) => ({ x, z, r: 1.6 }))] });
    const armed = fleePts.filter((_, i) => i % 2 === 0), fleeing = fleePts.filter((_, i) => i % 2 === 1);
    const swordsmen = addPeople(ctx, makePeople(armed, { palette: midian, face: (x, z, rr) => rr() * Math.PI * 2, yawJitter: 0, seed: 45 }), { arms: { left: [0.4, 0.4], right: [-0.3, 2.7] } });
    addPeople(ctx, makePeople(fleeing, { palette: midian, face: (x, z) => Math.atan2(x - CAMP[0], z - CAMP[1]) + Math.PI * 0.5, yawJitter: 1.2, seed: 46 }), { arms: { left: [0.5, 1.1], right: [0.5, -0.8] } });
    const swordHand = handAt(1, -0.3, 2.7);
    instanced(
      ctx,
      new THREE.BoxGeometry(0.07, 0.8, 0.02).translate(0, 0.4, 0),
      swordsmen.map((p) => ({ position: local(p, swordHand), rotation: [0.25, p.yaw, 0.3], scale: p.scale, color: '#e0e4ec' })),
    );
  },
};
