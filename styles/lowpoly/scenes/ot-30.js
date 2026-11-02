// 1 Kings 8 (2 Chronicles 5-7). Solomon dedicates the temple in Jerusalem. He stands on the bronze scaffold
// before the altar with his hands spread toward heaven; the priests in white blow trumpets; the cloud of the
// glory of the Lord fills the house. -z is north, toward the temple.
import * as THREE from 'three';
import { scatter, rows, makePeople, addPeople, handAt, local, instanced, rng } from './lib/ot-25-kit.js';

const HOUSE = { x: 0, z: -48, w: 16, d: 34, h: 16 };
const PORCH_Z = -29;
const ALTAR = [0, -8];
const SEA = [-15, -14];
const SCAFFOLD = [0, 8];
const START = [-5, 14];

const limestone = '#e4d8bc';
const gold = '#e0b850';
const bronze = '#a8763a';

const israel = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#3a4a6a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#5a3a5a'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#2a3a6a', '#556246'],
  skins: ['#a87652', '#9b6a46', '#b5835e', '#8a5a3c'],
  mantleChance: 0.7,
  hoodChance: 0.35,
};
const priests = { robes: ['#f2eee4', '#ece6d8'], mantles: ['#f6f2ea'], skins: ['#a87652', '#9b6a46'], mantleChance: 0.5, hoodChance: 0 };

const RAISED = [-0.55, 2.75];
const TRUMPET = [-0.15, 1.5];

export default {
  title: '1 Kings 8: Solomon dedicates the temple',
  seed: 30,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.5, 0.6, 0.55], color: '#ffe2b0', intensity: 2.8 },
  light: { sky: '#b0c4e8', ground: '#8a7458', hemi: 1.05 },
  sky: { top: '#4a78b8', horizon: '#f0e2c4', ground: '#d8c8a0', sunColor: '#fff2d0', glow: 0.8 },
  fog: { color: '#e6dcc4', near: 90, far: 600 },
  clouds: { count: 22, shadow: '#b8bcc8', lit: '#ffffff', rim: '#ffffff', distance: [450, 950], altitude: [180, 300], hole: 0.3 },
  mountains: { count: 34, color: '#9a8c74', radius: [520, 760], height: [30, 80], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.05, vignette: 0.38, shadowTint: '#3a3050', highlightTint: '#fff0d0' },
  shadow: { center: [0, -15], radius: 60 },

  player: { start: START, yaw: -0.4, pitch: 0.14, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 160,
    seed: 30,
    hills: 30,
    bumps: 0.2,
    flats: [{ x: 0, z: -10, r: 75, falloff: 40, height: 0 }],
    colors: { ground: '#b8a27a', groundAlt: '#a8946e', grass: '#8a8a52', high: '#a89070', rock: '#9a8466' },
    patches: [],
  },

  objects: [
    { type: 'pavement', x: 0, z: -2, w: 80, d: 84, tile: 2.6, color: '#d8cbb0', damage: 0.02 },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -10], ring: [95, 260], spacing: 10, seed: 8, props: { kind: 'broad', leaf: '#6a7a48' } },
  ],

  custom(ctx) {
    const r = rng(30);
    const y0 = ctx.heightAt(0, -10) - 0.1;
    const box = (w, h, d, x, y, z, color, collide = true, rot = 0) => {
      ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter: 0.03 });
      if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
    };

    // The house on its raised platform, the tall porch, side chambers and the open doors.
    const { x: hx, z: hz, w, d, h } = HOUSE;
    box(w + 10, 1.6, d + 14, hx, y0, hz - 2, '#cfc2a4');
    for (let i = 0; i < 6; i++) box(10, (i + 1) * 0.27, 0.62, 0, y0, -26 + (6 - i) * 0.6 - 0.3, '#d8ccb0');
    const fy = y0 + 1.6;
    box(w, h, d, hx, fy, hz, limestone);
    box(w + 0.8, 0.8, d + 0.8, hx, fy + h, hz, '#c8b890', false);
    for (const side of [-1, 1]) box(4, h * 0.55, d - 2, hx + side * (w / 2 + 2), fy, hz, '#d8ccb0');
    const porchH = h + 8;
    const pz = PORCH_Z - 1;
    for (const side of [-1, 1]) box(5.2, porchH, 4, side * (w / 2 - 2.6), fy, pz, limestone);
    box(w, porchH - 10, 4, 0, fy + 10, pz, limestone);
    box(w + 1, 0.9, 4.8, 0, fy + porchH, pz, '#c8b890', false);
    for (let i = 0; i < 7; i++) ctx.solid.box(1.4, 1.1, 0.6, { position: [-w / 2 + 1.6 + i * ((w - 3.2) / 6), fy + porchH + 1.4, pz + 2], color: limestone });
    for (const side of [-1, 1]) ctx.solid.box(0.4, 9.6, 0.5, { position: [side * 3.2, fy + 4.8, pz + 2.1], color: gold });
    ctx.solid.box(6.8, 0.5, 0.5, { position: [0, fy + 9.8, pz + 2.1], color: gold });
    for (const side of [-1, 1]) ctx.solid.box(2.4, 9, 0.3, { position: [side * 3.4, fy + 4.5, pz + 2.6], rotation: [0, side * -1.2, 0], color: '#d0a040' });

    // Jachin and Boaz, the two bronze pillars before the porch, with lily capitals and pomegranate chains.
    for (const side of [-1, 1]) {
      const x = side * 6, z = pz + 3.3;
      ctx.solid.add(new THREE.CylinderGeometry(0.85, 0.9, 11, 10), { position: [x, fy + 5.5, z], color: bronze });
      ctx.solid.add(new THREE.CylinderGeometry(1.3, 0.85, 2.4, 10), { position: [x, fy + 12.2, z], color: '#c08a40' });
      ctx.solid.add(new THREE.SphereGeometry(1.0, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), { position: [x, fy + 13.4, z], color: '#d09a48' });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        ctx.solid.add(new THREE.IcosahedronGeometry(0.16, 0), { position: [x + Math.cos(a) * 1.12, fy + 11.6, z + Math.sin(a) * 1.12], color: '#8a3a2a' });
      }
      ctx.colliders.add({ x, z, w: 1.8, d: 1.8, bottom: fy, top: fy + 14 });
    }

    // The cloud of glory fills the house and spills out of the doors and over the roof.
    const cloud = (x, y, z, s) => ctx.glow.add(new THREE.IcosahedronGeometry(1, 1), { position: [x, y, z], rotation: [r(), r(), r()], scale: [s * r.range(1, 1.5), s * r.range(0.6, 0.9), s], color: r.pick(['#fffaf0', '#fff4e0', '#f4f2ff']), jitter: 0.02 });
    for (let i = 0; i < 14; i++) cloud(r.range(-2.4, 2.4), fy + r.range(1, 8.5), pz + r.range(1.2, 3.5), r.range(1.0, 1.9));
    for (let i = 0; i < 20; i++) cloud(r.range(-w / 2, w / 2), fy + h + r.range(0.5, 3), hz + r.range(-d / 2, d / 2), r.range(2, 3.6));
    for (let i = 0; i < 8; i++) cloud(r.range(-w / 2 - 1, w / 2 + 1), fy + porchH + r.range(0.5, 2.5), pz + r.range(-2, 2), r.range(1.6, 2.6));
    ctx.effects.beam({ position: [hx, fy, hz + 4], height: 260, radiusBottom: 9, radiusTop: 22, color: '#fff6e0', opacity: 0.28 });
    ctx.effects.halo({ position: [0, fy + 5, pz + 3.2], size: 10, opacity: 0.4, color: '#fff6e4' });
    ctx.effects.halo({ position: [0, fy + h + 4, hz], size: 26, opacity: 0.22, color: '#fff6e4' });
    const glory = new THREE.PointLight('#fff2dc', 50, 40, 1.2);
    glory.position.set(0, fy + 6, pz + 6);
    ctx.scene.add(glory);

    // The great bronze altar with sacrifice burning, and the molten sea on twelve oxen.
    const [ax, az] = ALTAR;
    box(9, 4, 9, ax, y0, az, bronze);
    box(9.6, 0.5, 9.6, ax, y0 + 4, az, '#8a5a2a', false);
    for (let i = 0; i < 12; i++) box(1.6, (i + 1) * 0.34, 0.52, ax, y0, az + 4.5 + 6 - i * 0.5, '#c8b898');
    ctx.glow.add(new THREE.BoxGeometry(6, 0.3, 6), { position: [ax, y0 + 4.5, az], color: '#e85a1a' });
    const fire = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(r.range(0.6, 1.0), r.range(1.8, 3.2), 5), new THREE.MeshBasicMaterial({ color: r.pick(['#ffa040', '#ff8030', '#ffd070']), toneMapped: false }));
      f.position.set(ax + r.range(-2.2, 2.2), y0 + 5.6, az + r.range(-2.2, 2.2));
      fire.add(f);
    }
    ctx.scene.add(fire);
    ctx.onFrame((t) => fire.children.forEach((f, i) => (f.scale.y = 1 + 0.25 * Math.sin(t * 9 + i * 1.7))));
    ctx.effects.smoke({ position: [ax, y0 + 6, az], count: 12, height: 34, size: 1.1, color: '#c8c0b8', wind: [1.2, -0.6], seed: 7 });
    const [sx, sz] = SEA;
    ctx.solid.add(new THREE.CylinderGeometry(4.2, 3.6, 2.4, 14), { position: [sx, y0 + 3.4, sz], color: bronze });
    ctx.solid.add(new THREE.CylinderGeometry(3.9, 3.9, 0.1, 14), { position: [sx, y0 + 4.6, sz], color: '#7aa8b8' });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ox = sx + Math.cos(a) * 2.6, oz = sz + Math.sin(a) * 2.6;
      ctx.solid.box(0.9, 1.0, 1.8, { position: [ox, y0 + 1.6, oz], rotation: [0, Math.PI / 2 - a, 0], color: '#b0803e' });
      ctx.solid.box(0.6, 0.6, 0.6, { position: [ox + Math.cos(a) * 1.1, y0 + 1.9, oz + Math.sin(a) * 1.1], rotation: [0, -a, 0], color: '#b0803e' });
      for (const [lx, lz] of [[-0.3, -0.6], [0.3, -0.6], [-0.3, 0.6], [0.3, 0.6]]) {
        const c = Math.cos(Math.PI / 2 - a), s = Math.sin(Math.PI / 2 - a);
        ctx.solid.box(0.18, 1.1, 0.18, { position: [ox + lx * c + lz * s, y0 + 0.55, oz - lx * s + lz * c], color: '#9a6a32' });
      }
    }
    ctx.colliders.add({ x: sx, z: sz, w: 8, d: 8, bottom: y0, top: y0 + 4.6 });

    // Solomon on the bronze scaffold, hands spread toward heaven.
    const [kx, kz] = SCAFFOLD;
    box(3.2, 1.6, 3.2, kx, y0, kz, bronze);
    for (let i = 0; i < 5; i++) box(1.2, 0.32 * (i + 1), 0.5, kx, y0, kz + 1.6 + 2.25 - i * 0.5, '#9a6a32');
    const solomon = addPeople(ctx, [{ x: kx, z: kz, y: y0 + 1.6, yaw: Math.PI, scale: 1.15, robe: new THREE.Color('#5a2a7a'), mantle: new THREE.Color('#c8a040'), hood: false, skin: new THREE.Color('#a8754f') }], { arms: { left: RAISED, right: RAISED } });
    ctx.solid.add(new THREE.CylinderGeometry(0.15, 0.13, 0.12, 8, 1, true), { position: [kx, y0 + 1.6 + 1.72 * 1.15, kz], color: gold });

    // Priests in white linen with trumpets east of the altar, singers with cymbals beside them.
    const priestPts = rows({ from: [9, -14], to: [9, 2], rows: 4, depth: 5, spacing: 1.1, jitter: 0.1, seed: 31 }).map(([x, z]) => [x + 2.5, z]);
    const trumpeters = addPeople(ctx, makePeople(priestPts, { palette: priests, face: [0, -30], yawJitter: 0.1, seed: 32 }), { arms: { left: TRUMPET, right: [0.15, 1.4] } });
    instanced(ctx, new THREE.ConeGeometry(0.09, 1.0, 7, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 0.5), trumpeters.map((p) => ({ position: local(p, [0, 1.48, 0.12]), rotation: [-0.5, p.yaw, 0], scale: p.scale, color: '#e8d8a8' })));
    const singerPts = rows({ from: [17.5, -14], to: [17.5, 2], rows: 3, depth: 3, spacing: 1.1, jitter: 0.1, seed: 33 });
    addPeople(ctx, makePeople(singerPts, { palette: priests, face: [0, -30], yawJitter: 0.15, seed: 34 }), { arms: { left: [-0.45, 2.5], right: [-0.45, 2.5] } });

    // All Israel assembled in the court, facing the house.
    addPeople(ctx, makePeople(scatter({ count: 1400, center: [0, 30], ring: [0, 34], arc: [-Math.PI, Math.PI], spacing: 0.95, seed: 35, avoid: [{ rect: [0, 10, 7, 9] }, { rect: [START[0] + 2, START[1] - 3, 7, 9] }, { rect: [-1.5, 18, 3.4, 20] }] }), { palette: israel, face: [0, -40], children: 0.15, kneel: 0.25, seed: 36 }));
    addPeople(ctx, makePeople(scatter({ count: 260, center: [-28, -6], ring: [0, 11], spacing: 1, seed: 37, avoid: [{ x: SEA[0], z: SEA[1], r: 6 }] }), { palette: israel, face: ALTAR, seed: 38, kneel: 0.2 }));

    // The court wall of hewn stone and cedar beams.
    const wallRun = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), rot = Math.atan2(x1 - x0, z1 - z0);
      box(0.9, 3.2, len, (x0 + x1) / 2, y0, (z0 + z1) / 2, '#d4c6a6', true, rot);
      ctx.solid.box(1.0, 0.4, len, { position: [(x0 + x1) / 2, y0 + 3.4, (z0 + z1) / 2], rotation: [0, rot, 0], color: '#7a5232' });
    };
    wallRun(-40, -75, -40, 50);
    wallRun(40, -75, 40, 50);
    wallRun(-40, -75, 40, -75);
    wallRun(-40, 50, -6, 50);
    wallRun(6, 50, 40, 50);
  },
};
