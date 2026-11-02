// Alma 63:5-8: Hagoth builds exceedingly large ships on the west sea by the narrow neck.
// Families board with provisions and the ships launch forth northward. -z is north, the sea lies west (-x).
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { strut, formation, makePeople, addCrowd, sea, ship, house } from './lib/bom-31-kit.js';

const PIER_Z = -6;
const people = {
  robes: ['#c9b48a', '#a0825c', '#d8cdb5', '#8b6b4a', '#b59a72', '#7a4e36', '#6b6f4a', '#e2d6bc'],
  mantles: ['#5a3d2b', '#a34f32', '#3f4d5e', '#8a7a5a', '#6d3b2e'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.5,
  hoodChance: 0.35,
};

function crate(ctx, x, z, s, color, y) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.box(s, s * 0.8, s, { position: [x, base + s * 0.4, z], rotation: [0, ctx.rand() * 3, 0], color, jitter: 0.08 });
}
function jar(ctx, x, z, y) {
  const base = y ?? ctx.heightAt(x, z);
  ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.25, 0.75, 7).translate(0, 0.37, 0), { position: [x, base, z], color: '#b0623a', jitter: 0.08 });
  ctx.solid.add(new THREE.SphereGeometry(0.27, 7, 4), { position: [x, base + 0.5, z], scale: [1, 0.8, 1], color: '#b86a40', jitter: 0.08 });
}

export default {
  title: "Alma 63:5-8: Hagoth's ships",
  seed: 34,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [-0.55, 0.5, 0.55], color: '#ffe0b0', intensity: 2.8 },
  light: { sky: '#a8c4e8', ground: '#7a6448', hemi: 1.1 },
  sky: { top: '#3f78c0', horizon: '#dbe8ee', ground: '#c8c0a8', sunColor: '#fff0d0', glow: 0.9 },
  fog: { color: '#cfdde4', near: 120, far: 720 },
  clouds: { count: 45, shadow: '#9aa8c0', lit: '#ffffff', rim: '#fff8e8', distance: [300, 950], altitude: [110, 230], hole: 0.1 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.3, shadowTint: '#2a3a5e', highlightTint: '#fff2d8' },
  shadow: { center: [-6, -20], radius: 70 },

  player: { start: [4, 30], yaw: 0.38, pitch: 0.02, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 34,
    hills: 14,
    bumps: 0.2,
    flats: [
      { x: 30, z: -10, r: 70, falloff: 40, height: 0.4 },
      { x: -500, z: 0, r: 450, falloff: 60, height: -4 },
    ],
    colors: { ground: '#d6c294', groundAlt: '#cbb486', grass: '#6a8a3a', high: '#5e7a36', rock: '#8a7a62' },
    patches: [
      { x: 70, z: -20, r: 60, color: '#7a9442', strength: 0.7, rough: 0.6 },
      { x: 60, z: 60, r: 50, color: '#6e8a3c', strength: 0.6, rough: 0.6 },
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: [130, -20], ring: [0, 160], spacing: 6, seed: 3, props: { kind: 'broad', leaf: '#4e7a30' } },
    { type: 'tree', count: 30, center: [40, -10], ring: [26, 110], spacing: 7, seed: 4, avoid: [{ rect: [10, 0, 60, 120] }, { rect: [-60, 0, 90, 400] }], props: { kind: 'palm', leaf: '#5a8a36' } },
    { type: 'rock', count: 10, center: [-10, 60], ring: [10, 80], spacing: 10, seed: 5, props: { color: '#8a8070', size: 1.6 } },
  ],

  custom(ctx) {
    const r = rng(340);
    sea(ctx, { x: -820, z: 0, w: 1600, d: 2400, y: -0.5, color: '#3a7f98', seg: 150, amp: 0.28 });

    // Two hulls on the slipways: one framed in ribs, one planked and ready.
    const slipY = 0.4 + 0.5;
    for (const [z, ribs] of [[-38, true], [-52, false]]) {
      for (let x = -14; x < 18; x += 2.2) {
        ctx.solid.box(0.4, 0.4, 3.4, { position: [x, ctx.heightAt(x, z) + 0.05, z], color: '#6a4a30' });
      }
      for (const dz of [-1.2, 1.2]) strut(ctx.solid, [-16, 0, z + dz], [18, 0.6, z + dz], 0.3, '#5a3e28');
      ship(ctx, { x: 4, z, y: slipY, rot: -Math.PI / 2, len: 22, beam: 6, depth: 2.8, ribsOnly: ribs, mast: false, hull: ribs ? '#9a7048' : '#6a4a30' });
      ctx.colliders.add({ x: 4, z, w: 23, d: 6.2, bottom: 0, top: slipY + 3.4 });
      for (const side of [-1, 1]) {
        for (let x = -6; x <= 14; x += 4) {
          const zz = z + side * 4;
          strut(ctx.solid, [x, ctx.heightAt(x, zz) - 0.2, zz], [x, slipY + 3.6, zz], 0.18, '#7a5a38');
          strut(ctx.solid, [x, slipY + 3.6, zz], [x, slipY + 3.6, z + side * 2.6], 0.12, '#7a5a38');
        }
        strut(ctx.solid, [-6, slipY + 2, z + side * 4], [14, slipY + 2, z + side * 4], 0.12, '#7a5a38');
        ctx.colliders.add({ x: 4, z: z + side * 4, w: 21, d: 0.4, bottom: 0, top: slipY + 3.6 });
      }
    }

    // Pier with a loaded ship moored alongside, and one already standing out to sea northward.
    for (let x = 4; x > -34; x -= 0.8) {
      ctx.solid.box(0.75, 0.18, 3.2, { position: [x, 0.62, PIER_Z], rotation: [0, 0, r.range(-0.03, 0.03)], color: '#8a6a44', jitter: 0.08 });
      ctx.colliders.add({ x, z: PIER_Z, w: 0.8, d: 3.2, bottom: -4, top: 0.71 });
    }
    for (let x = 2; x > -34; x -= 3.5) for (const dz of [-1.5, 1.5]) strut(ctx.solid, [x, -3, PIER_Z + dz], [x, 1.1, PIER_Z + dz], 0.22, '#5a3e28');
    const moored = ship(ctx, { x: -24, z: PIER_Z - 6.5, y: -1.7, rot: Math.PI, len: 24, beam: 6.4, depth: 3, sail: '#efe6d0', oars: 5 });
    ctx.colliders.add({ x: -24, z: PIER_Z - 6.5, w: 6.4, d: 24, bottom: -4, top: 1.5 });
    strut(ctx.solid, [-21, 0.7, PIER_Z - 1.4], [-21.4, 1.3, PIER_Z - 3.6], 0.5, '#9a7a52');
    const away = ship(ctx, { x: -72, z: -40, y: -1.7, rot: Math.PI + 0.1, len: 24, beam: 6.4, depth: 3, sail: '#e8dcc0', oars: 5 });
    const far = ship(ctx, { x: -115, z: -190, y: -1.7, rot: Math.PI + 0.05, len: 24, beam: 6.4, depth: 3, sail: '#e8dcc0' });
    ctx.onFrame((t, dt) => {
      moored.position.y = -1.7 + Math.sin(t * 0.8) * 0.12;
      moored.rotation.z = Math.sin(t * 0.6) * 0.02;
      for (const [s, ph] of [[away, 1], [far, 2]]) {
        s.position.y = -1.7 + Math.sin(t * 0.7 + ph) * 0.2;
        s.rotation.z = Math.sin(t * 0.5 + ph) * 0.04;
        s.position.z -= dt * 0.6;
      }
    });
    const crew = makePeople(formation({ center: [-24, PIER_Z - 6.5], rows: 6, cols: 2, spacing: 2.2, rowSpacing: 3, jitter: 0.4, seed: 2 }), { palette: people, heightAt: () => 0, seed: 3, yaw: Math.PI, yawJitter: 1.2, children: 0.25 });
    const onAway = makePeople(formation({ center: [-72, -40], rows: 5, cols: 2, spacing: 2, rowSpacing: 3.4, seed: 4 }), { palette: people, heightAt: () => 0, seed: 5, yaw: Math.PI, yawJitter: 1 });
    for (const p of crew) p.y = moored.position.y + 2.65;
    for (const p of onAway) p.y = -1.7 + 2.65;
    addCrowd(ctx, crew);

    // Provisions on the beach and pier: crates, jars, sacks, timber.
    for (let i = 0; i < 18; i++) crate(ctx, r.range(-12, 2), PIER_Z + r.range(-1.2, 1.2), r.range(0.6, 0.9), r.pick(['#8a6a44', '#9a7a52', '#7a5a38']), 0.7);
    for (let i = 0; i < 26; i++) jar(ctx, r.range(4, 14), PIER_Z + r.range(-6, 4));
    for (let i = 0; i < 20; i++) crate(ctx, r.range(8, 20), PIER_Z + r.range(-4, 6), r.range(0.6, 1), r.pick(['#8a6a44', '#9a7a52', '#d8c8a0']));
    for (let k = 0; k < 3; k++) {
      const cx = 22 + k * 7, cz = 14 + k * 3;
      for (let i = 0; i < 12; i++) {
        const y = ctx.heightAt(cx, cz) + 0.25 + Math.floor(i / 4) * 0.45;
        ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.22, 7, 6).rotateZ(Math.PI / 2), { position: [cx, y, cz - 1 + (i % 4) * 0.48], rotation: [0, 0.2, 0], color: r.pick(['#8a6440', '#7a5a38', '#9a7048']), jitter: 0.06 });
      }
      ctx.colliders.add({ x: cx, z: cz, w: 7, d: 2.2, rot: 0.2, bottom: 0, top: 1.5 });
    }

    // Families gathering with their goods, workers about the hulls.
    const families = makePeople(
      Array.from({ length: 150 }, () => [r.range(-2, 18), PIER_Z + r.range(-7, 7)]).filter(([x, z]) => Math.abs(z - PIER_Z) > 1.8 || x > 4),
      { palette: people, heightAt: ctx.heightAt, seed: 6, face: [-24, PIER_Z - 4], yawJitter: 0.6, children: 0.3 },
    );
    const line = makePeople(Array.from({ length: 22 }, (_, i) => [3 - i * 1.15, PIER_Z + r.range(-0.6, 0.6)]), { palette: people, heightAt: () => 0.71, seed: 7, yaw: -Math.PI / 2, yawJitter: 0.2, children: 0.25 });
    const workers = makePeople(Array.from({ length: 40 }, () => [r.range(-12, 20), r.pick([-57, -47, -33, -43]) + r.range(-1, 1)]), { palette: people, heightAt: ctx.heightAt, seed: 8, yawJitter: 3 });
    addCrowd(ctx, [...families, ...line, ...workers]);
    const awayCrew = addCrowd(ctx, onAway);
    ctx.onFrame(() => {
      awayCrew.position.z = away.position.z + 40;
      awayCrew.position.y = away.position.y + 1.7;
    });

    // The shipbuilders' village inland.
    for (let i = 0; i < 16; i++) {
      const x = r.range(34, 90), z = r.range(-60, 40);
      house(ctx, { x, z, rot: r.range(-0.5, 0.5) + Math.PI / 2, w: r.range(5, 7), d: r.range(4, 5.5), color: r.pick(['#d8c7a4', '#cdb894']), roof: r.pick(['#9a7a44', '#8a6a3a']) });
    }
  },
};
