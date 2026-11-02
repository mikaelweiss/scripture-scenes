// 1 Samuel 17:40-51. The valley of Elah. Israel on the south hill, the Philistines on the north hill,
// the brook between. David runs toward Goliath with his sling whirling; the shield bearer goes before the giant.
import * as THREE from 'three';
import { scatter, makePeople, addPeople, handAt, local, instanced, createFigure, stream, tent, banner, rng } from './lib/ot-25-kit.js';

const DAVID = [-1, 5];
const GOLIATH = [1.5, -11];
const BEARER = [1.0, -7.8];
const ISRAEL = [0, 58];
const PHILISTIA = [0, -56];
const BROOK = [[-200, 16], [-120, 10], [-60, 14], [-20, 9], [10, 11], [50, 6], [110, 12], [200, 8]];

const israel = {
  robes: ['#7a6248', '#6b5a44', '#8a7052', '#5a4a3a', '#9a8060', '#6e5e48'],
  mantles: ['#4a3a2c', '#5e4a34', '#7a3a2a', '#3a4a5a'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
  mantleChance: 0.6,
  hoodChance: 0.3,
};
const philistines = {
  robes: ['#8a3a2a', '#a84a2a', '#6a2a2a', '#c8a070', '#7a5a3a', '#9a3020'],
  mantles: ['#b08a40', '#a07a38', '#8a6a30', '#c09850'],
  skins: ['#b07a55', '#a06a48', '#94603e'],
  mantleChance: 0.85,
  hoodChance: 0.7,
};

const ARMED = { left: [0.25, 0.6], right: [0.15, 0.35] };
const SLING = [0.35, 2.9];

export default {
  title: '1 Samuel 17:40-51: David and Goliath',
  seed: 29,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.6, 0.5, 0.45], color: '#ffe0b0', intensity: 3.0 },
  light: { sky: '#a8c0e8', ground: '#7a6a48', hemi: 1.0 },
  sky: { top: '#3f6eb0', horizon: '#e4dcc4', ground: '#c8b890', sunColor: '#fff2d0', glow: 0.8 },
  fog: { color: '#d8d0b8', near: 90, far: 560 },
  clouds: { count: 30, shadow: '#b0b4c4', lit: '#ffffff', rim: '#ffffff', distance: [400, 950], altitude: [160, 280], hole: 0.3 },
  mountains: { count: 36, color: '#8a8470', radius: [520, 760], height: [40, 100], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#2e3050', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -5], radius: 60 },

  player: { start: [-4.5, 17], yaw: -0.1, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 29,
    hills: 30,
    bumps: 0.35,
    flats: [
      { x: 0, z: 2, r: 18, falloff: 26, height: 0 },
      { x: ISRAEL[0], z: ISRAEL[1] + 10, r: 30, falloff: 30, height: 10 },
      { x: PHILISTIA[0], z: PHILISTIA[1] - 10, r: 30, falloff: 30, height: 12 },
    ],
    colors: { ground: '#a89a6a', groundAlt: '#9a8c5e', grass: '#7a8448', high: '#8a8a58', rock: '#8a7a62' },
    patches: [{ x: 0, z: 8, r: 20, color: '#b0a478', strength: 0.5, rough: 0.5 }],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 70, center: [0, 0], ring: [30, 260], spacing: 10, seed: 8, avoid: [{ x: ISRAEL[0], z: ISRAEL[1], r: 50 }, { x: PHILISTIA[0], z: PHILISTIA[1], r: 50 }, { rect: [0, 0, 60, 50] }], props: { kind: 'broad', leaf: '#6a7a42' } },
    { type: 'rock', count: 60, center: [0, 0], ring: [16, 240], spacing: 8, seed: 10, avoid: [{ rect: [0, 0, 20, 50] }], props: { color: '#a09478' } },
  ],

  custom(ctx) {
    const r = rng(29);

    // The brook with its smooth stones.
    const pts = stream(ctx, BROOK, { width: 3, color: '#6a98a8', lift: 0.22, emissive: 0.2 });
    for (let i = 0; i < pts.length; i += 2) {
      const [x, z] = pts[i];
      if (Math.abs(x) > 80) continue;
      for (let k = 0; k < 3; k++) {
        const sx = x + r.range(-2.5, 2.5), sz = z + r.range(-2.4, 2.4);
        ctx.solid.add(new THREE.SphereGeometry(r.range(0.1, 0.3), 6, 4), { position: [sx, ctx.heightAt(sx, sz) + 0.05, sz], scale: [1.3, 0.6, 1], color: r.pick(['#d8d4c8', '#c8c4b4', '#b8b0a0']) });
      }
    }

    // Two armies in array on their hills, spears up, shields on arm, banners and tents behind.
    const army = (center, count, palette, seed, shieldColor) => {
      const toward = Math.sign(-center[1]);
      const pts2 = scatter({ count, center: [center[0], center[1] - toward * 6], ring: [2, 38], arc: toward > 0 ? [Math.PI * 0.08, Math.PI * 0.92] : [Math.PI * 1.08, Math.PI * 1.92], spacing: 1.05, seed });
      const men = addPeople(ctx, makePeople(pts2, { palette, face: [center[0], 0], yawJitter: 0.2, seed: seed + 1 }), { arms: ARMED });
      instanced(ctx, new THREE.CylinderGeometry(0.025, 0.03, 2.8, 4), men.map((p) => ({ position: local(p, [0.33, 1.2, 0.12]), scale: p.scale, color: '#6a5038' })));
      instanced(ctx, new THREE.ConeGeometry(0.05, 0.25, 4), men.map((p) => ({ position: local(p, [0.33, 2.7, 0.12]), scale: p.scale, color: '#c8c0b0' })));
      instanced(ctx, new THREE.CylinderGeometry(0.32, 0.32, 0.06, 8).rotateX(Math.PI / 2), men.map((p) => ({ position: local(p, [-0.34, 0.95, 0.22]), rotation: [0, p.yaw + 0.3, 0], scale: p.scale, color: r.pick(shieldColor) })));
      for (let i = 0; i < 9; i++) {
        const [bx, bz] = pts2[Math.floor(r() * pts2.length)];
        banner(ctx, { x: bx + 0.5, z: bz, h: 5, color: r.pick(shieldColor), size: [1.2, 0.9] });
      }
      for (const [tx, tz] of scatter({ count: 22, center: [center[0], center[1] + toward * -40], ring: [0, 40], spacing: 9, seed: seed + 2 })) {
        tent(ctx, { x: tx, z: tz, rot: r.range(-0.4, 0.4), w: r.range(4, 6), d: r.range(3, 4), h: 2.2, color: r.pick(['#d8ccb0', '#c8b898', '#8a6a4a']) });
      }
      return men;
    };
    army(ISRAEL, 520, israel, 81, ['#7a5a3a', '#5a4a3a', '#3a4a6a']);
    army(PHILISTIA, 620, philistines, 91, ['#b08a40', '#8a2a20', '#c8a050']);

    // Goliath of Gath: six cubits and a span, helmet and coat of bronze, spear like a weaver's beam.
    const gy = ctx.heightAt(...GOLIATH);
    const gs = 2.6;
    ctx.scene.add(createFigure({ x: GOLIATH[0], y: gy, z: GOLIATH[1], face: DAVID, scale: gs, robe: '#7a4a2a', mantle: '#b08a40', skin: '#a8754f', hood: true, arms: 'down' }));
    ctx.colliders.add({ x: GOLIATH[0], z: GOLIATH[1], w: 1.6, d: 1.6, bottom: gy, top: gy + 4.6 });
    const gp = { x: GOLIATH[0], y: gy, z: GOLIATH[1], scale: gs, yaw: Math.atan2(DAVID[0] - GOLIATH[0], DAVID[1] - GOLIATH[1]) };
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.08, 7.5, 6), { position: local(gp, [0.42, 1.1, 0.15]), rotation: [0.12, gp.yaw, 0], color: '#5a4030' });
    ctx.solid.add(new THREE.ConeGeometry(0.16, 0.9, 5), { position: local(gp, [0.42, 2.55, 0.32]), rotation: [0.12, gp.yaw, 0], color: '#a8a8b0' });
    ctx.solid.add(new THREE.ConeGeometry(0.2, 0.35, 6), { position: local(gp, [0, 1.86, 0]), rotation: [0, gp.yaw, 0], color: '#c09850' });
    ctx.solid.add(new THREE.BoxGeometry(0.1, 0.5, 0.04), { position: local(gp, [-0.32, 0.75, 0.05]), rotation: [0, gp.yaw, 0.15], color: '#b8bcc4' });
    for (const s of [-1, 1]) ctx.solid.box(0.14, 0.4, 0.16, { position: local(gp, [s * 0.12, 0.2, 0.1]), rotation: [0, gp.yaw, 0], color: '#b08a40' });

    // The shield bearer going before him.
    const by = ctx.heightAt(...BEARER);
    const bp = { x: BEARER[0], y: by, z: BEARER[1], scale: 1, yaw: gp.yaw };
    ctx.scene.add(createFigure({ x: BEARER[0], y: by, z: BEARER[1], face: DAVID, robe: '#8a3a2a', mantle: '#b08a40', skin: '#a06a48', hood: true }));
    ctx.solid.box(1.0, 1.5, 0.08, { position: local(bp, [-0.1, 0.95, 0.38]), rotation: [0, gp.yaw, 0], color: '#a07a38' });
    ctx.colliders.add({ x: BEARER[0], z: BEARER[1], w: 1, d: 1, bottom: by, top: by + 1.8 });

    // David: a youth with no armour, staff left behind, sling whirling over his head.
    const dy = ctx.heightAt(...DAVID);
    const dp = { x: DAVID[0], y: dy, z: DAVID[1], scale: 0.95, yaw: Math.atan2(GOLIATH[0] - DAVID[0], GOLIATH[1] - DAVID[1]) };
    const david = createFigure({ x: DAVID[0], y: dy, z: DAVID[1], face: GOLIATH, scale: 0.95, robe: '#c8b48a', mantle: '#8a5a3a', skin: '#b5835e', arms: 'down' });
    david.rotation.order = 'YXZ';
    david.rotation.x = 0.15;
    ctx.scene.add(david);
    instanced(ctx, new THREE.CylinderGeometry(0.05, 0.065, 0.62, 5).translate(0, -0.31, 0).rotateX(-SLING[1]).rotateZ(SLING[0]).translate(0.2, 1.32, 0.02), [{ position: [dp.x, dp.y, dp.z], rotation: [0.15, dp.yaw, 0], scale: 0.95, color: '#8a5a3a' }]);
    ctx.solid.box(0.25, 0.2, 0.12, { position: local(dp, [-0.22, 0.85, -0.05]), rotation: [0, dp.yaw, 0], color: '#6a4a2a' });
    ctx.colliders.add({ x: DAVID[0], z: DAVID[1], w: 0.6, d: 0.6, bottom: dy, top: dy + 1.7 });
    const hand = local(dp, handAt(1, ...SLING));
    const sling = new THREE.Group();
    sling.position.set(...hand);
    const cord = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.75).translate(0, 0, 0.37), new THREE.MeshLambertMaterial({ color: '#4a3424' }));
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), new THREE.MeshLambertMaterial({ color: '#e0dcd0' }));
    stone.position.z = 0.78;
    sling.add(cord, stone);
    sling.rotation.order = 'YXZ';
    ctx.scene.add(sling);
    ctx.onFrame((t) => sling.rotation.set(0.25, t * 9, 0));
  },
};
