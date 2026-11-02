// Acts 3:1-10. The ninth hour at the Beautiful gate of the temple: Peter has taken the lame man by the
// right hand, and he stands, leaping and praising God, while the people run together in wonder.
import { temple, person } from './lib/nt-25-kit.js';

const GATE_Z = -20;
const PETER = [-0.85, -6.3];
const JOHN = [-2.4, -7.3];
const HEALED = [0.3, -6.4];

const stoneC = '#dccaa4';
const trim = '#b8a27a';
const bronze = '#c8923a';

function gateAndWall(ctx) {
  const y0 = ctx.heightAt(0, GATE_Z) - 0.3;
  const box = (x, z, w, h, d, y, color = stoneC, collide = true, rot = 0) => {
    ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color, jitter: 0.04 });
    if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
  };
  const floor = y0 + 2.4;
  for (let i = 0; i < 7; i++) box(0, -11 - i * 0.6, 22 - i * 0.6, 0.3 * (i + 1) + 0.3, 0.62, y0, i % 2 ? '#d2c09a' : '#cbb892');
  box(0, -22, 22, 2.4, 14.5, y0, '#cbb892');
  for (const side of [-1, 1]) {
    box(side * 6, GATE_Z, 7, 18, 9, floor - 0.3);
    box(side * 6, GATE_Z + 4.55, 7.4, 0.8, 0.3, floor + 15, trim, false);
    box(side * 6, GATE_Z, 7.6, 1.2, 9.6, floor + 17.7, trim, false);
    for (let k = 0; k < 4; k++) box(side * (3 + k * 2), GATE_Z, 0.9, 1.2, 9.2, floor + 18.9, stoneC, false);
    box(side * 6, GATE_Z + 4.56, 3.4, 5, 0.12, floor + 6, '#9e8a66', false);
    box(side * 30, GATE_Z, 41, 14, 3.2, ctx.heightAt(side * 30, GATE_Z) - 0.5);
    box(side * 30, GATE_Z, 41.4, 0.7, 3.6, ctx.heightAt(side * 30, GATE_Z) + 13.5, trim, false);
    for (let k = 0; k < 14; k++) box(side * (11 + k * 2.9), GATE_Z, 1.1, 1, 3.2, ctx.heightAt(side * 30, GATE_Z) + 14.2, stoneC, false);
  }
  box(0, GATE_Z, 5, 7.8, 9, floor + 10.2);
  box(0, GATE_Z + 4.56, 5.4, 0.5, 0.2, floor + 9.8, bronze, false, 0);
  ctx.glow.box(5.2, 0.18, 0.1, { position: [0, floor + 10.5, GATE_Z + 4.68], color: '#ffd27a', jitter: 0.02 });

  for (const side of [-1, 1]) {
    const hx = side * 2.5;
    const ang = side * 1.4;
    const cx = hx, cz = GATE_Z + 4.3;
    const door = (offset, color, w, h, d, y) => {
      const lx = -side * (1.25 + offset[0]);
      const px = hx + lx * Math.cos(ang), pz = cz - lx * Math.sin(ang);
      ctx.solid.box(w, h, d, { position: [px, y + h / 2, pz], rotation: [0, ang, 0], color, jitter: 0.06 });
    };
    door([0, 0], bronze, 2.5, 10, 0.25, floor);
    for (let r = 0; r < 4; r++) door([0, 0], '#e0b050', 2.2, 0.12, 0.32, floor + 1.4 + r * 2.4);
    ctx.colliders.add({ x: cx, z: cz, w: 0.4, d: 0.4, bottom: floor, top: floor + 10 });
  }
  return floor;
}

export default {
  title: 'Acts 3:1-10: Peter heals the lame man',
  seed: 29,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.6, 0.42, 0.62], color: '#ffd8a8', intensity: 3.0 },
  light: { sky: '#a8bce0', ground: '#7a6450', hemi: 1.1 },
  sky: { top: '#4a70b0', horizon: '#f0d2b0', ground: '#c4ae90', sunColor: '#ffe6c0', glow: 1.0 },
  fog: { color: '#e2cdb0', near: 90, far: 560 },
  clouds: { count: 36, shadow: '#a69aa8', lit: '#ffeed8', rim: '#ffffff', distance: [260, 900], altitude: [100, 240], hole: 0.2 },
  mountains: { count: 40, color: '#8a7e70', radius: [480, 720], height: [40, 100], haze: 0.6 },
  bloom: { strength: 0.55, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.38, shadowTint: '#30305e', highlightTint: '#ffe6c0' },
  shadow: { center: [0, -12], radius: 40 },

  player: { start: [3, 2.2], yaw: 0.34, pitch: 0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 29,
    hills: 22,
    bumps: 0.1,
    flats: [{ x: 0, z: -20, r: 90, falloff: 50, height: 0 }],
    colors: { ground: '#c2ad88', groundAlt: '#b39e7a', grass: '#8a8a58', high: '#a0927a', rock: '#8a7c68' },
    patches: [],
  },

  objects: [
    { type: 'pavement', x: 0, z: 0, w: 70, d: 40, tile: 2.4, color: '#e0d0ae', damage: 0 },
    ...[-1, 1].flatMap((side) => Array.from({ length: 6 }, (_, i) => ({ type: 'column', x: side * (16 + i * 5), z: -13, h: 9, radius: 0.6, color: '#e6d8b8', broken: false }))),
  ],

  scatter: [],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#e2d6bc', '#4f5a6b', '#9a4a34'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#e6dcc4', '#6d3b2e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.7,
      hoodChance: 0.4,
    },
    groups: [
      { count: 190, center: HEALED, ring: [4.5, 24], arc: [-0.25, Math.PI + 0.25], spacing: 1.1, face: HEALED, children: 0.12, seed: 31, avoid: [{ rect: [2.2, 2, 5, 14, -0.25] }, { rect: [1, -4.6, 3, 2] }, { rect: [-2.8, -7, 3, 3] }, { rect: [-14, -13, 50, 3] }, { rect: [14, -13, 50, 3] }] },
      { count: 30, center: [0, -14], ring: [3, 10], arc: [Math.PI + 0.2, Math.PI * 2 - 0.2], spacing: 1.2, avoid: [{ rect: [0, -16, 5, 4] }], face: HEALED, children: 0.1, onStructures: true, seed: 32 },
    ],
  },

  figures: [
    { x: PETER[0], z: PETER[1], face: HEALED, robe: '#6e5a44', mantle: '#3f4d5e', skin: '#8a5a3c', arms: 'out' },
    { x: JOHN[0], z: JOHN[1], face: HEALED, robe: '#b59a72', mantle: '#a34f32', skin: '#a87652' },
    { x: HEALED[0], z: HEALED[1], face: [HEALED[0] - 1, HEALED[1] + 6], robe: '#e4d8bc', mantle: '#b89a6a', skin: '#9b6a46', arms: 'out', emissive: 0.08 },
  ],

  effects: [
    { type: 'halo', position: [HEALED[0], 1.4, HEALED[1]], size: 3.2, opacity: 0.3, color: '#fff2d0' },
  ],

  custom(ctx) {
    gateAndWall(ctx);
    temple(ctx, { x: 0, z: -78, s: 1.2, platform: false });
    const { THREE } = ctx;
    const y = ctx.heightAt(1.6, -5);
    ctx.solid.box(1.9, 0.08, 0.8, { position: [1.6, y + 0.08, -5], rotation: [0, 0.3, 0], color: '#9a7a52', jitter: 0.08 });
    ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 7), { position: [2.5, y + 0.16, -4.7], rotation: [Math.PI / 2, 0.3, 0], color: '#8a6a44' });
    ctx.solid.add(new THREE.CylinderGeometry(0.14, 0.1, 0.12, 7), { position: [1.1, y + 0.1, -4.6], color: '#a0603a' });
    const pl = new THREE.PointLight('#fff0d0', 6, 8, 1.4);
    pl.position.set(HEALED[0], 3, HEALED[1] + 1);
    ctx.scene.add(pl);
  },
};
