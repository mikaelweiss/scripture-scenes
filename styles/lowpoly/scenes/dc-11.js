// D&C 124: Nauvoo, about 1845. Brick and frame houses on a grid of streets fill the flats inside the
// Mississippi's bend (west, -x). The temple stands on the bluff to the east (+x). The player starts
// near the river landing looking up Parley Street toward the temple.
import { box, gable, people, palettes, wagon, beast, water, frame } from './lib/dc-08-kit.js';

const riverX = (z) => -190 + 0.0016 * z * z;
const river = Array.from({ length: 33 }, (_, i) => {
  const z = -400 + i * 25;
  return { x: riverX(z), z, r: 78, falloff: 18, height: -5 };
});
const TEMPLE = [168, -6];
const limestone = '#e6dfcd';

const streetsX = [-60, -20, 20, 60];
const streetsZ = [-100, -60, -20, 20, 60, 100];

function brickHouse(ctx, { x, z, rot = 0, w = 7, d = 6, h = 5.5, wall = '#9a4a34', roof = '#4e4640', trim = '#efe8da', stories = 2 }) {
  const at = frame(x, z, rot);
  const g = Math.min(ctx.heightAt(...at(-w / 2, -d / 2)), ctx.heightAt(...at(w / 2, d / 2)), ctx.heightAt(...at(-w / 2, d / 2)), ctx.heightAt(...at(w / 2, -d / 2))) - 0.15;
  box(ctx, { x, y: g, z, w, h: h + 0.15, d, rot, color: wall });
  gable(ctx, { x, y: g + h + 0.15, z, w: w + 0.5, h: 2.4, d: d + 0.4, rot, color: roof });
  for (const s of [-1, 1]) {
    const [cx, cz] = at(s * (w / 2 - 0.6), 0);
    ctx.solid.box(0.7, 3.4, 0.9, { position: [cx, g + h + 1.5, cz], rotation: [0, rot, 0], color: wall });
  }
  const rows = stories === 2 ? [1.4, 3.9] : [1.4];
  for (const wy of rows) {
    for (const lx of [-w * 0.3, 0, w * 0.3]) {
      if (wy < 2 && lx === 0) continue;
      const [wx, wz] = at(lx, d / 2 + 0.02);
      ctx.solid.box(0.95, 1.35, 0.08, { position: [wx, g + wy + 0.15, wz], rotation: [0, rot, 0], color: trim });
      ctx.solid.box(0.7, 1.1, 0.1, { position: [wx, g + wy + 0.15, wz], rotation: [0, rot, 0], color: '#3c4654' });
    }
  }
  const [dx, dz] = at(0, d / 2 + 0.03);
  ctx.solid.box(1.1, 2.3, 0.08, { position: [dx, g + 1.3, dz], rotation: [0, rot, 0], color: trim });
  ctx.solid.box(0.85, 2.0, 0.1, { position: [dx, g + 1.15, dz], rotation: [0, rot, 0], color: '#4a3424' });
}

function fence(ctx, x0, z0, x1, z1) {
  const len = Math.hypot(x1 - x0, z1 - z0), rot = Math.atan2(x1 - x0, z1 - z0);
  const n = Math.round(len / 2.2);
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, z = z0 + ((z1 - z0) * i) / n;
    ctx.solid.box(0.1, 1.0, 0.1, { position: [x, ctx.heightAt(x, z) + 0.45, z], color: '#d8d2c4' });
  }
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, my = ctx.heightAt(mx, mz);
  for (const y of [0.45, 0.8]) ctx.solid.box(0.05, 0.08, len, { position: [mx, my + y, mz], rotation: [0, rot, 0], color: '#e4ded0' });
}

function temple(ctx) {
  const [tx, tz] = TEMPLE;
  const L = 39, Wd = 27, Hm = 19;
  const g = ctx.heightAt(tx, tz) - 0.5;
  box(ctx, { x: tx, y: g - 1, z: tz, w: L + 4, h: 1.6, d: Wd + 4, color: '#cfc6b2' });
  box(ctx, { x: tx, y: g + 0.6, z: tz, w: L, h: Hm, d: Wd, color: limestone });
  ctx.solid.box(L + 1, 1.0, Wd + 1, { position: [tx, g + Hm + 0.6, tz], color: '#f0ebde' });
  gable(ctx, { x: tx, y: g + Hm + 1.1, z: tz, w: Wd + 1, h: 4.5, d: L + 1, rot: Math.PI / 2, color: '#d9d2c2' });
  const glass = '#3d4a5e';
  for (const side of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const lx = -L / 2 + 1.9 + i * ((L - 3.8) / 9);
      ctx.solid.box(1.3, Hm, 0.8, { position: [tx + lx, g + 0.6 + Hm / 2, tz + side * (Wd / 2 + 0.3)], color: '#efe9da' });
      ctx.glow.box(1.0, 0.9, 0.06, { position: [tx + lx, g + 0.6 + Hm - 1.4, tz + side * (Wd / 2 + 0.72)], color: '#f6e6b0' });
      if (i < 9) {
        const wx = tx + lx + (L - 3.8) / 18;
        for (const [wy, wh] of [[3.2, 4.2], [10.4, 4.2], [16.0, 1.4]]) {
          ctx.solid.box(1.5, wh, 0.1, { position: [wx, g + 0.6 + wy, tz + side * (Wd / 2 + 0.02)], color: glass });
        }
      }
    }
  }
  for (const side of [-1, 1]) {
    for (let k = -2; k <= 2; k++) {
      ctx.solid.box(0.1, 4.2, 1.5, { position: [tx + side * (L / 2 + 0.02), g + 0.6 + (k % 2 ? 3.2 : 10.4) + 0, tz + k * 4.6], color: glass });
    }
  }
  // West front tower: base, belfry, clock stage, dome, and the angel vane.
  const fx = tx - L / 2 + 5;
  let y = g + Hm + 1.1;
  ctx.solid.box(10, 6, 10, { position: [fx, y + 3, tz], color: limestone });
  y += 6;
  ctx.solid.add(new ctx.THREE.CylinderGeometry(4.2, 4.6, 6, 8), { position: [fx, y + 3, tz], rotation: [0, Math.PI / 8, 0], color: '#f2ede2' });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.solid.add(new ctx.THREE.CircleGeometry(1.4, 12), { position: [fx + Math.cos(a) * 4.45, y + 3.4, tz + Math.sin(a) * 4.45], rotation: [0, Math.PI / 2 - a, 0], color: '#1e2a3a' });
  }
  y += 6;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.solid.box(0.5, 5, 0.5, { position: [fx + Math.cos(a) * 3.2, y + 2.5, tz + Math.sin(a) * 3.2], color: '#f6f2e8' });
  }
  ctx.solid.add(new ctx.THREE.CylinderGeometry(2.4, 2.4, 5, 8), { position: [fx, y + 2.5, tz], color: '#d8d0c0' });
  ctx.solid.add(new ctx.THREE.CylinderGeometry(3.7, 3.7, 0.6, 8), { position: [fx, y + 5.2, tz], color: '#f0ebde' });
  y += 5.5;
  ctx.solid.add(new ctx.THREE.SphereGeometry(3.3, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), { position: [fx, y, tz], color: '#d8b860' });
  ctx.solid.add(new ctx.THREE.CylinderGeometry(0.1, 0.25, 4, 6), { position: [fx, y + 5, tz], color: '#d8b860' });
  ctx.glow.add(new ctx.THREE.ConeGeometry(0.5, 1.6, 5), { position: [fx, y + 7.6, tz], rotation: [0, 0, Math.PI / 2], color: '#ffd870' });
  ctx.glow.box(1.6, 0.1, 0.6, { position: [fx - 0.4, y + 7.9, tz], color: '#ffd870' });
  // Steps up the west front.
  for (let i = 0; i < 4; i++) box(ctx, { x: tx - L / 2 - 2.2 - i * 0.6, y: g - 1 + 1.6 - (i + 1) * 0.4, z: tz, w: 0.6, h: 0.4, d: 12, color: '#cfc6b2' });
  for (const k of [-1, 0, 1]) ctx.solid.box(0.1, 4, 2.2, { position: [tx - L / 2 - 0.02, g + 0.6 + 2.2, tz + k * 4], color: '#4a3a2a' });
}

function steamboat(ctx, x, z) {
  const y = -1.6;
  ctx.solid.box(7, 1.4, 34, { position: [x, y + 0.4, z], color: '#f2efe6' });
  ctx.solid.add(new ctx.THREE.ConeGeometry(3.5, 6, 4, 1).rotateX(-Math.PI / 2).rotateZ(Math.PI / 4), { position: [x, y + 0.4, z - 19.5], scale: [1, 0.28, 1], color: '#f2efe6' });
  ctx.solid.box(6.2, 2.2, 22, { position: [x, y + 2.2, z + 1], color: '#ffffff' });
  ctx.solid.box(4.5, 1.8, 10, { position: [x, y + 4.2, z + 2], color: '#f6f2ea' });
  ctx.solid.box(2.6, 1.6, 3, { position: [x, y + 5.9, z - 2], color: '#ece4d4' });
  for (const s of [-1, 1]) {
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.45, 0.5, 11, 8), { position: [x + s * 1.4, y + 8, z - 6], color: '#1e1c1c' });
    ctx.solid.add(new ctx.THREE.CylinderGeometry(2.6, 2.6, 1.2, 12).rotateZ(Math.PI / 2), { position: [x + s * 4.1, y + 1.6, z + 4], color: '#a63a2a' });
  }
  ctx.effects.smoke({ position: [x, y + 13.5, z - 6], count: 10, height: 30, size: 1.2, color: '#5a5654', wind: [1.5, 1.2], seed: 61 });
}

export default {
  title: 'D&C 124: Nauvoo the Beautiful',
  seed: 124,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [-0.45, 0.62, 0.55], color: '#ffe6bc', intensity: 2.9 },
  light: { sky: '#a8c4ea', ground: '#5e6a3a', hemi: 1.0 },
  sky: { top: '#4a7cc4', horizon: '#dde6e8', ground: '#a0a678', sunColor: '#fff2cc', glow: 0.9 },
  fog: { color: '#cfdbe0', near: 140, far: 900 },
  clouds: { count: 50, shadow: '#9eaabc', lit: '#ffffff', rim: '#fffaf0', distance: [300, 900], altitude: [120, 220], hole: 0.35 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.3, shadowTint: '#2a3048', highlightTint: '#fff2d0' },
  shadow: { center: [40, 10], radius: 130 },

  player: { start: [-14, 22.5], yaw: -1.43, pitch: 0.1, eye: 1.65, speed: 5 },

  terrain: {
    size: 1500, segments: 240, seed: 18, hills: 7, bumps: 0.12,
    flats: [
      { x: -650, z: 0, r: 330, falloff: 60, height: 4 },
      { x: -10, z: 0, r: 120, falloff: 40, height: 1 },
      ...river,
      { x: 360, z: 0, r: 225, falloff: 40, height: 16 },
    ],
    colors: { ground: '#7d8c48', groundAlt: '#8e9a50', grass: '#6c8a3c', high: '#7f9448', rock: '#8a8060' },
    patches: [
      ...river.map((f) => ({ x: f.x + 70, z: f.z, r: 30, color: '#b8aa80', strength: 0.6, rough: 0.4 })),
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: [20, 0], ring: [10, 140], spacing: 9, seed: 3, avoid: [...streetsX.map((x) => ({ rect: [x, 0, 12, 260] })), ...streetsZ.map((z) => ({ rect: [10, z, 200, 12] })), { rect: [-14, 22, 20, 12] }], props: { kind: 'broad', leaf: '#4f7034', h: 7 } },
    { type: 'tree', count: 120, center: [300, 0], ring: [190, 380], spacing: 9, seed: 4, avoid: [{ rect: [TEMPLE[0], TEMPLE[1], 70, 50] }], props: { kind: 'broad', leaf: '#56743a' } },
    { type: 'tree', count: 140, center: [-560, 0], ring: [0, 300], spacing: 10, seed: 5, props: { kind: 'broad', leaf: '#4c6a34' } },
  ],

  custom(ctx) {
    const { rand } = ctx;
    water(ctx, { x: -150, z: 0, w: 1500, d: 1500, y: -1.6, color: '#4a7088', seg: 70, amp: 0.1, opacity: 1 });

    for (const x of streetsX) for (let z = -130; z <= 130; z += 10) ctx.solid.box(7, 0.3, 10.4, { position: [x, ctx.heightAt(x, z) - 0.05, z], color: '#a08c68', jitter: 0.04 });
    for (const z of streetsZ) for (let x = -95; x <= 100; x += 10) ctx.solid.box(10.4, 0.3, 7, { position: [x, ctx.heightAt(x, z) - 0.04, z], color: '#a39070', jitter: 0.04 });

    // Houses facing the streets, with a few lots left as gardens.
    const lots = [];
    for (const x of streetsX) for (let z = -122; z <= 122; z += 16) if (!streetsZ.some((sz) => Math.abs(sz - z) < 9)) for (const s of [-1, 1]) lots.push({ x: x + s * 10, z, rot: s > 0 ? -Math.PI / 2 : Math.PI / 2 });
    for (const z of streetsZ) for (let x = -86; x <= 90; x += 15) if (!streetsX.some((sx) => Math.abs(sx - x) < 10)) for (const s of [-1, 1]) lots.push({ x, z: z + s * 10, rot: s > 0 ? Math.PI : 0 });
    for (const lot of lots) {
      if (rand() < 0.22) continue;
      
      const kind = rand();
      if (kind < 0.55) brickHouse(ctx, { ...lot, w: rand.range(6.5, 9), d: rand.range(5.5, 7), h: rand.range(5, 6), wall: rand.pick(['#9a4a34', '#a85a3e', '#8e4430', '#b0603f']) });
      else if (kind < 0.85) brickHouse(ctx, { ...lot, w: rand.range(6, 8), d: rand.range(5, 6), h: 3.2, stories: 1, wall: rand.pick(['#ece6d8', '#e2dccc', '#d8d0bc']), roof: '#5a4c40' });
      else {
        const [fx, fz] = frame(lot.x, lot.z, lot.rot)(0, 5);
        fence(ctx, fx - 5, fz, fx + 5, fz);
      }
    }

    temple(ctx);

    wagon(ctx, { x: -60, z: 40, rot: Math.PI, cover: '#e6dcc4' });
    beast(ctx, { x: -60, z: 44.5, rot: Math.PI, kind: 'horse', color: '#5a3a24' });
    wagon(ctx, { x: 24, z: 18.5, rot: -Math.PI / 2, covered: false });
    beast(ctx, { x: 28, z: 18, rot: -Math.PI / 2, kind: 'ox', color: '#7a5434' });
    beast(ctx, { x: 28, z: 19, rot: -Math.PI / 2, kind: 'ox', color: '#5e4a3a' });
    steamboat(ctx, -140, -10);

    // Landing dock below the start.
    for (let i = 0; i < 6; i++) ctx.solid.box(3, 0.25, 14, { position: [-103 - i * 3, 0.0, 22], color: '#7a6248', jitter: 0.06 });
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) ctx.solid.box(0.3, 3, 0.3, { position: [-101.5 - i * 3, -1.5, 22 + s * 6.8], color: '#4a3a2a' });

    const street = (x, z, w, d) => ({ rect: [x, z, w, d] });
    people(ctx, [
      { center: [-40, 20], ring: [0, 40], count: 38, face: TEMPLE, spacing: 2.2, children: 0.25, palette: palettes.men, seed: 51, avoid: [] },
      { center: [-40, 20], ring: [0, 40], count: 34, face: [-120, 20], spacing: 2.2, children: 0.25, palette: palettes.women, seed: 52 },
      { center: [20, 20], ring: [0, 50], count: 40, face: [20, -200], spacing: 2.5, children: 0.2, palette: palettes.men, seed: 53 },
      { center: [20, -20], ring: [0, 50], count: 30, face: [20, 200], spacing: 2.5, children: 0.2, palette: palettes.women, seed: 54 },
      { center: [130, -6], ring: [10, 40], count: 50, face: TEMPLE, spacing: 1.6, children: 0.1, palette: palettes.men, seed: 55, avoid: [street(TEMPLE[0], TEMPLE[1], 46, 34)] },
    ].map((g) => ({ ...g, avoid: [...(g.avoid ?? []), { r: 9, x: -8, z: 22 }, ...lots.map((l) => ({ r: 6, x: l.x, z: l.z }))] })));

    // Stonecutters' blocks beside the temple.
    for (let i = 0; i < 24; i++) {
      const x = TEMPLE[0] + rand.range(-28, 28), z = TEMPLE[1] + rand.pick([-1, 1]) * rand.range(19, 28);
      box(ctx, { x, y: ctx.heightAt(x, z) - 0.1, z, w: rand.range(1, 2), h: rand.range(0.6, 1), d: rand.range(0.8, 1.4), rot: rand() * 3, color: '#ddd6c4' });
    }
  },
};
