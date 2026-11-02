// Daniel 3: the plain of Dura. Nebuchadnezzar's court watches the furnace where Shadrach, Meshach
// and Abed-nego walk unharmed in the fire with a fourth like the Son of God. -z is north.
import { block, person, being, flames, fireLight } from './lib/ot-38-kit.js';

const FURNACE = [0, -22];
const W = 16, D = 13, H = 8, MOUTH = 8, MOUTH_H = 5;
const brick = '#9a6440';
const soot = '#3a2a22';
const gold = '#d9a93a';

export default {
  title: 'Daniel 3:19-27: The fiery furnace',
  seed: 38,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.75, 0.42, 0.35], color: '#ffc988', intensity: 2.6 },
  light: { sky: '#a8a2c4', ground: '#6a4a32', hemi: 0.9 },
  sky: { top: '#5b6f99', horizon: '#f0c48a', ground: '#d6ac7c', sunColor: '#ffe0a8', glow: 1.0 },
  fog: { color: '#d9b08a', near: 80, far: 520 },
  clouds: { count: 30, shadow: '#8a6e6a', lit: '#ffd6a0', rim: '#fff1cc', distance: [300, 900], altitude: [120, 260], hole: 0.3 },
  mountains: { count: 30, color: '#9c8064', radius: [560, 780], height: [20, 60], haze: 0.65 },
  bloom: { strength: 0.42, radius: 0.45, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#3a2650', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -10], radius: 60 },

  player: { start: [1.2, 0.5], yaw: 0.04, pitch: 0.05, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100, segments: 160, seed: 38, hills: 10, bumps: 0.25,
    flats: [{ x: 0, z: -15, r: 70, falloff: 40, height: 0 }],
    colors: { ground: '#b8946a', groundAlt: '#a88358', grass: '#8f8a52', high: '#a08664', rock: '#8a7258' },
    patches: [
      { x: FURNACE[0], z: FURNACE[1] + 9, r: 9, color: '#4a3326', strength: 0.75, rough: 0.5 },
      { x: 0, z: -2, r: 38, color: '#c4a47a', strength: 0.6, rough: 0.3 },
    ],
  },

  objects: [
    { type: 'steppedPyramid', x: 70, z: -230, w: 70, d: 70, tiers: 7, tierHeight: 7, inset: 4, stairWidth: 10, color: '#b5895a', trim: '#8f6a44', shrine: { w: 12, d: 10, h: 7, roof: '#3a5a8a' } },
    { type: 'pavement', x: 15.5, z: 0, w: 8, d: 8, tile: 2, color: '#c9ad80', damage: 0 },
    { type: 'rubble', x: -6, z: -10, radius: 3, count: 8, size: [0.15, 0.35], color: soot },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -20], ring: [80, 260], spacing: 8, seed: 3, props: { kind: 'palm', leaf: '#6a7a3a' } },
    { type: 'rock', count: 20, center: [0, -20], ring: [90, 300], spacing: 12, seed: 4, props: { color: '#9a8064', size: 1.5 } },
  ],

  crowd: {
    palette: {
      robes: ['#5a2f6e', '#8a2a2a', '#2f4a7a', '#b08a3a', '#6e4a2a', '#d8c8a0', '#3e5a4a', '#7a3a5a', '#a0522d'],
      mantles: ['#c9a040', '#7a1f2a', '#3a2a5a', '#d8c8a0', '#2a3e6a', '#8a6a2a'],
      skins: ['#9b6a46', '#a87652', '#8a5a3c', '#b5835e'],
      mantleChance: 0.85,
      hoodChance: 0.35,
    },
    groups: [
      {
        count: 420, center: FURNACE, ring: [17, 46], arc: [0.15, Math.PI - 0.15], spacing: 1.0, face: FURNACE, children: 0, seed: 7,
        avoid: [{ rect: [2, 10, 8, 30] }, { rect: [15.5, 0, 10, 10] }],
      },
      { count: 6, points: [[12, -1.5], [12.5, 2.5], [18.5, 2.5], [19, -1], [13, -4], [18, -4]], face: FURNACE, children: 0, seed: 8 },
    ],
  },

  figures: [
    { x: 15.5, z: 0, face: FURNACE, scale: 1.08, robe: '#5a1f6a', mantle: '#c9a040', skin: '#a87652', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const [fx, fz] = FURNACE;
    const back = fz - D / 2, front = fz + D / 2;

    // Furnace walls: brick kiln with a wide open mouth on the south face.
    block(ctx, { x: fx, z: back, w: W, h: H, d: 1.2, color: brick });
    block(ctx, { x: fx - W / 2, z: fz, w: 1.2, h: H, d: D, color: brick });
    block(ctx, { x: fx + W / 2, z: fz, w: 1.2, h: H, d: D, color: brick });
    const side = (W - MOUTH) / 2;
    block(ctx, { x: fx - W / 2 + side / 2, z: front, w: side, h: H, d: 1.2, color: brick });
    block(ctx, { x: fx + W / 2 - side / 2, z: front, w: side, h: H, d: 1.2, color: brick });
    block(ctx, { x: fx, z: front, y: MOUTH_H, w: MOUTH + 0.2, h: H - MOUTH_H, d: 1.2, color: brick });
    // Soot-blackened lintel and jambs around the mouth.
    ctx.solid.box(MOUTH + 1.6, 1.1, 1.5, { position: [fx, MOUTH_H + 0.55, front], color: soot });
    for (const s of [-1, 1]) ctx.solid.box(0.8, MOUTH_H, 1.4, { position: [fx + s * (MOUTH / 2 + 0.4), MOUTH_H / 2, front], color: '#5a3a2a' });
    // Brick courses as darker bands.
    for (let i = 1; i < 6; i++) {
      const y = i * 1.5;
      ctx.solid.box(W + 1.3, 0.12, 0.2, { position: [fx, y, back - 0.6], color: '#7a4a30', jitter: 0.02 });
      for (const sx of [-1, 1]) {
        ctx.solid.box(0.2, 0.12, D + 1.3, { position: [fx + sx * (W / 2 + 0.6), y, fz], color: '#7a4a30', jitter: 0.02 });
        if (y < MOUTH_H) ctx.solid.box(side, 0.12, 0.2, { position: [fx + sx * (W / 2 - side / 2), y, front + 0.6], color: '#7a4a30', jitter: 0.02 });
      }
      if (y > MOUTH_H) ctx.solid.box(W + 1.3, 0.12, 0.2, { position: [fx, y, front + 0.6], color: '#7a4a30', jitter: 0.02 });
    }
    // Upper kiln narrowing to a chimney.
    const dome = new THREE.CylinderGeometry(4.2, Math.hypot(W, D) / 2 * 0.98, 6, 4, 1, true);
    ctx.solid.add(dome, { position: [fx, H + 3, fz], rotation: [0, Math.PI / 4, 0], scale: [1, 1, D / W], color: brick });
    ctx.solid.add(new THREE.CylinderGeometry(2.6, 3.2, 3, 8), { position: [fx, H + 7.5, fz], color: soot });
    // Glowing coal bed.
    for (let i = 0; i < 70; i++) {
      const r = ctx.rand;
      ctx.glow.add(new THREE.OctahedronGeometry(r.range(0.2, 0.5), 0), {
        position: [fx + r.range(-W / 2 + 1, W / 2 - 1), 0.15, fz + r.range(-D / 2 + 1, D / 2 - 0.5)],
        rotation: [r() * 3, r() * 3, 0], scale: [1, 0.4, 1],
        color: r.pick(['#ff5a14', '#ff8a2a', '#ffb040', '#e8401a']),
      });
    }
    ctx.glow.box(W - 1.4, 0.1, D - 1.4, { position: [fx, 0.05, fz], color: '#6a2410', jitter: 0.1 });

    // Fire: tall at the walls, lower in the middle where the men walk.
    flames(ctx, { x: fx, z: back + 1.6, w: W - 2, d: 2, count: 50, height: 4.5, seed: 1 });
    flames(ctx, { x: fx - W / 2 + 1.8, z: fz, w: 2.2, d: D - 2, count: 40, height: 5.5, seed: 2 });
    flames(ctx, { x: fx + W / 2 - 1.8, z: fz, w: 2.2, d: D - 2, count: 40, height: 5.5, seed: 3 });
    flames(ctx, { x: fx, z: fz, y: H + 8.6, w: 3.2, d: 3.2, count: 22, height: 5, seed: 6 });
    ctx.effects.smoke({ position: [fx, H + 12, fz], count: 18, height: 60, size: 2.4, color: '#4a3c36', wind: [1.2, 0.4] });
    fireLight(ctx, { position: [fx, 4, fz], intensity: 70, distance: 30, color: '#ff8a3a' });
    fireLight(ctx, { position: [fx, 3, front + 4], intensity: 50, distance: 30, color: '#ff9a48' });

    // The three faithful men and the fourth, walking free in the fire.
    const men = [
      { x: fx - 2.8, z: fz + 3.8, robe: '#2f4a7a', mantle: '#c9b48e', face: [fx - 1, fz + 10] },
      { x: fx - 0.9, z: fz + 2.6, robe: '#7a2a2a', mantle: '#d8c8a0', face: [fx, fz + 10] },
      { x: fx + 3.1, z: fz + 3.4, robe: '#3e5a4a', mantle: '#b08a3a', face: [fx + 1, fz + 10] },
    ];
    for (const m of men) person(ctx, { ...m, y: 0.1, skin: '#9b6a46', hood: true, arms: 'out', scale: 1.25 });
    being(ctx, { x: fx + 1.1, z: fz + 1.4, y: 0.1, face: [fx, fz + 12], scale: 1.35, arms: 'out', light: 22, distance: 9, halo: 3.2, glow: 0.5 });
    ctx.effects.motes({ position: [fx + 1.1, 0.1, fz + 1.4], radius: 2.2, height: 6, count: 60, color: '#fff6e0' });

    // The golden image on the plain, sixty cubits high.
    const ix = -48, iz = -80;
    block(ctx, { x: ix, z: iz, w: 10, h: 3, d: 10, color: '#c9ad80' });
    block(ctx, { x: ix, z: iz, y: 3, w: 7, h: 4, d: 7, color: '#b89a6c' });
    ctx.solid.add(new THREE.CylinderGeometry(1.6, 2.8, 16, 8), { position: [ix, 15, iz], color: gold, jitter: 0.06 });
    ctx.solid.add(new THREE.CylinderGeometry(2.3, 1.7, 5, 8), { position: [ix, 24, iz], color: gold, jitter: 0.06 });
    ctx.solid.add(new THREE.IcosahedronGeometry(1.4, 0), { position: [ix, 27.8, iz], scale: [1, 1.15, 1], color: gold });
    ctx.solid.add(new THREE.CylinderGeometry(1.3, 1.2, 1.3, 8), { position: [ix, 29.5, iz], color: '#e8bd4a' });
    for (const s of [-1, 1]) ctx.solid.add(new THREE.CylinderGeometry(0.45, 0.55, 9, 6), { position: [ix + s * 2.6, 21, iz], rotation: [0, 0, s * 0.12], color: gold });

    // Babylon's wall across the far plain.
    for (let i = -14; i <= 14; i++) {
      const x = i * 14, z = -190 + Math.abs(i) * 2;
      block(ctx, { x, z, w: 14.2, h: 14, d: 6, color: '#b58f62', collide: false });
      if (i % 3 === 0) block(ctx, { x, z, w: 9, h: 20, d: 9, color: '#a8825a', collide: false });
      for (let k = -3; k <= 3; k += 2) ctx.solid.box(1.4, 1.4, 6, { position: [x + k * 1.8, 14.7, z], color: '#a8825a' });
    }
    ctx.solid.box(12, 16, 7, { position: [-30, 8, -186], color: '#2f5a9a' });
    ctx.solid.box(7, 10, 7.4, { position: [-30, 5, -186], color: '#1c2a3a' });

    // King's dais awning.
    for (const [px, pz] of [[11.5, -3.5], [19.5, -3.5], [11.5, 3.5], [19.5, 3.5]]) ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.12, 4, 6), { position: [px, 2.2, pz], color: '#5a3a22' });
    ctx.solid.box(9, 0.15, 8, { position: [15.5, 4.2, 0], rotation: [0.05, 0, 0], color: '#8a2a3a' });
    ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.2, 0.22, 8), { position: [15.5, ctx.heightAt(15.5, 0) + 2.03, 0], color: '#f2c44a' });
  },
};
