// Alma 51:33-34: by night Teancum steals into the Lamanite camp on the east seashore,
// past the sleeping army, and enters the tent of Amalickiah. -z is north, the sea lies east (+x).
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { createFigure } from '../engine/crowd.js';
import { frame, strut, makePeople, addCrowd, sleepers, tent, pavilion, fire, stars, sea, banner } from './lib/bom-31-kit.js';

const KING = [0, -30];
const TEANCUM = [0, -25.2];

const soldiers = {
  robes: ['#6a3a2a', '#4a3428', '#5a2a22', '#3a3028', '#7a4a32'],
  mantles: ['#2a1e18', '#4a2a1e'],
  skins: ['#7a4c31', '#8a5a3c', '#6e4530'],
  mantleChance: 0.4,
  hoodChance: 0,
};

export default {
  title: 'Alma 51:33-34: Teancum slays Amalickiah',
  seed: 32,
  fov: 60,
  exposure: 1.3,

  sun: { direction: [0.88, 0.3, -0.2], color: '#a8bcec', intensity: 1.2 },
  light: { sky: '#4a5c96', ground: '#2a2420', hemi: 1.0 },
  sky: { top: '#050918', horizon: '#1d2c52', ground: '#0a0e1a', sunColor: '#cfdcff', glow: 0.45 },
  fog: { color: '#121a32', near: 40, far: 420 },
  clouds: { count: 22, shadow: '#141a2c', lit: '#4a5a80', rim: '#9fb0d8', distance: [300, 900], altitude: [120, 240], hole: 0.3 },
  bloom: { strength: 0.8, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.0, contrast: 1.08, vignette: 0.5, shadowTint: '#1a2040', highlightTint: '#e4ecff' },
  shadow: { center: [0, -20], radius: 60 },

  player: { start: [-3, -8], yaw: -0.3, pitch: 0.02, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 32,
    hills: 10,
    bumps: 0.2,
    flats: [
      { x: 480, z: 0, r: 420, falloff: 70, height: -4 },
      { x: KING[0], z: KING[1], r: 30, falloff: 20, height: 0.2 },
    ],
    colors: { ground: '#b8a888', groundAlt: '#a89878', grass: '#5a6a3a', high: '#6a6a4a', rock: '#7a6a58' },
    patches: [{ x: KING[0], z: KING[1], r: 36, color: '#8a7a60', strength: 0.5, rough: 0.5 }],
  },

  scatter: [
    { type: 'tree', count: 50, center: [-120, -40], ring: [30, 220], spacing: 7, seed: 3, props: { kind: 'palm', leaf: '#3e5a2e' } },
    { type: 'tree', count: 40, center: [-160, -40], ring: [40, 260], spacing: 8, seed: 4, props: { kind: 'broad', leaf: '#3a5230' } },
    { type: 'rock', count: 18, center: [30, -40], ring: [20, 160], spacing: 12, seed: 5, props: { color: '#6a6458', size: 1.2 } },
  ],

  custom(ctx) {
    const r = rng(320);
    stars(ctx, { count: 1100 });
    sea(ctx, { x: 820, z: 0, w: 1560, d: 2400, y: -0.9, color: '#1e3a5a', seg: 140, amp: 0.22 });
    ctx.effects.halo({ position: [0.88 * 1150, 0.3 * 1150, -0.2 * 1150], size: 110, color: '#c8d6ff', opacity: 0.22 });

    const door = pavilion(ctx, { x: KING[0], z: KING[1], r: 4.6, h: 2.8, roof: 3.2, color: '#b89a6a', roofColor: '#8a2a22', door: 1.8 });
    const inside = new THREE.PointLight('#ffa050', 18, 14, 1.6);
    inside.position.set(KING[0], 1.6, KING[1] + 0.5);
    ctx.scene.add(inside);
    ctx.onFrame((t) => (inside.intensity = 18 * (0.88 + 0.1 * Math.sin(t * 7) + 0.05 * Math.sin(t * 19))));
    ctx.solid.box(2.2, 0.5, 1.6, { position: [KING[0] - 1.6, 0.45, KING[1] - 1.8], color: '#6a3a2a' });
    fire(ctx, { x: KING[0] + 1.6, z: KING[1] - 1.8, size: 0.35 });
    banner(ctx, { x: KING[0] - 3.4, z: KING[1] + 5, h: 6.5, w: 1.4, len: 2.2, color: '#7a1e18' });
    banner(ctx, { x: KING[0] + 3.4, z: KING[1] + 5, h: 6.5, w: 1.4, len: 2.2, color: '#7a1e18', rot: Math.PI });

    // Teancum at the doorway, javelin ready, his servant waiting in the shadows.
    const tz = door[1] + 0.25;
    ctx.scene.add(createFigure({ x: TEANCUM[0], y: ctx.heightAt(0, tz), z: tz, face: [KING[0], KING[1]], robe: '#2c2c34', mantle: '#3a3640', skin: '#8a5a3c' }));
    strut(ctx.solid, [0.38, 1.45, tz + 1.1], [0.32, 1.7, tz - 1.0], 0.04, '#4a3424');
    ctx.solid.add(new THREE.ConeGeometry(0.05, 0.3, 4).rotateX(-Math.PI / 2 - 0.12), { position: [0.32, 1.71, tz - 1.1], color: '#8a8a90' });
    ctx.scene.add(createFigure({ x: -3.6, y: ctx.heightAt(-3.6, -19), z: -19, face: [0, -24], robe: '#2a2a2e', mantle: '#34323a', skin: '#8a5a3c', scale: 0.96 }));

    // Tents of the sleeping army spread along the shore.
    const tents = [];
    for (let tries = 0; tents.length < 70 && tries < 2000; tries++) {
      const x = r.range(-80, 30), z = r.range(-110, 30);
      if (Math.hypot(x - KING[0], z - KING[1]) < 13) continue;
      if (Math.abs(x) < 4 && z > -26) continue;
      if (x > -12 && x < 10 && z > -22 && z < 0) continue;
      if (tents.some(([tx, tz2]) => Math.hypot(tx - x, tz2 - z) < 7)) continue;
      tents.push([x, z]);
      tent(ctx, { x, z, rot: r.range(-0.4, 0.4) + (r() < 0.5 ? 0 : Math.PI), w: r.range(2.6, 3.4), d: r.range(3.2, 4.4), h: r.range(1.9, 2.4), color: r.pick(['#9a8a6a', '#8a7a5a', '#a8946e', '#7a6a50']) });
    }

    // Dying campfires, soldiers asleep around them, a few with a faint glow.
    const sleeping = [];
    const camps = [[-10, -4], [9, -12], [-16, -24], [14, -34], [-8, -50], [20, -60], [-34, -14], [-30, -44], [6, 14], [-20, 10], [28, -18], [-44, -70]];
    camps.forEach(([x, z], i) => {
      fire(ctx, { x, z, size: 0.55, light: i < 4 ? 5 : 0, distance: 12 });
      const n = 8 + Math.floor(r() * 6);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r.range(-0.2, 0.2), d = r.range(1.8, 3.6);
        const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
        if (Math.abs(px) < 1.6 && pz > -26) continue;
        sleeping.push([px, pz, ctx.heightAt(px, pz)]);
      }
      for (let k = 0; k < 3; k++) {
        const a = r() * Math.PI * 2;
        const bx = x + Math.cos(a) * 4.5, bz = z + Math.sin(a) * 4.5;
        const by = ctx.heightAt(bx, bz);
        for (let s = 0; s < 4; s++) strut(ctx.solid, [bx, by, bz], [bx + Math.cos(s * 1.6) * 0.5, by + 2.4, bz + Math.sin(s * 1.6) * 0.5], 0.04, '#4a3424');
      }
    });
    for (let i = 0; i < 160; i++) {
      const x = r.range(-80, 30), z = r.range(-110, 30);
      if (Math.abs(x) < 2.5 && z > -27) continue;
      if (Math.hypot(x - KING[0], z - KING[1]) < 6) continue;
      sleeping.push([x, z, ctx.heightAt(x, z)]);
    }
    sleepers(ctx, sleeping, { palette: soldiers });

    // Two sentries slumped asleep on their feet by the king's tent.
    const sentries = makePeople([[-2.6, -23.8], [2.6, -23.8]], { palette: soldiers, heightAt: ctx.heightAt, seed: 5, yaw: Math.PI, kneel: 1 });
    addCrowd(ctx, sentries);

    // Faint fires of the Nephite camp far up the coast.
    for (let i = 0; i < 14; i++) {
      const x = r.range(-60, 30), z = r.range(-330, -280);
      ctx.glow.add(new THREE.OctahedronGeometry(0.5, 0), { position: [x, ctx.heightAt(x, z) + 0.4, z], color: '#ff9040', jitter: 0.1 });
    }
  },
};
