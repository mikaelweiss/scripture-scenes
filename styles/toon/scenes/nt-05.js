// Luke 2:41-50: Mary and Joseph find the twelve-year-old Jesus in the temple, among the teachers.
// x is east, z is south. The sanctuary rises to the north beyond the inner court's terrace.
import { Batch, DAY_STYLE, PALETTE, ball, box, cyl, glow, makeRng, person, portico, xf } from './lib/nt-01-kit.js';

const BOY = [0, -12];
const WHITE = '#f1e9d6';
const GOLD = '#e0b040';

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(505);

  // The sanctuary on the inner terrace: a tall porch with its great doorway and gold trim.
  const ty = ctx.terrainHeight(0, -60) + 3.2;
  b.add(WHITE, box(26, 24, 26, [0, ty + 12, -96]));
  b.add(WHITE, box(42, 32, 7, [0, ty + 16, -80]));
  b.add('#2b1a12', box(8, 17, 0.3, [0, ty + 8.5, -76.4]), { cast: false });
  b.add('#2f4f8a', box(7, 15.5, 0.2, [0, ty + 7.75, -76.2]));
  b.add('#8a2a3a', box(2.2, 15.5, 0.22, [-2.2, ty + 7.75, -76.15]));
  b.add('#c8912e', box(1.1, 15.5, 0.22, [1.6, ty + 7.75, -76.15]));
  b.add(GOLD, box(10, 1, 0.6, [0, ty + 17.6, -76.4]), { emissive: '#4a3010' });
  for (const sx of [-1, 1]) b.add(GOLD, box(1, 18, 0.6, [sx * 4.5, ty + 9, -76.4]), { emissive: '#4a3010' });
  b.add(GOLD, box(43, 1.2, 7.6, [0, ty + 31.4, -80]), { emissive: '#4a3010' });
  b.add(GOLD, box(27, 1.2, 26.6, [0, ty + 24.2, -96]), { emissive: '#4a3010' });
  for (let i = 0; i < 20; i++) b.add(GOLD, xf(new THREE.ConeGeometry(0.25, 1.6, 6), { pos: [-20 + i * 2.1, ty + 32.8, -77] }), { emissive: '#4a3010' });
  for (const h of [20.5, 26]) b.add(GOLD, box(42.6, 0.7, 7.6, [0, ty + h, -80]), { emissive: '#4a3010' });
  for (let i = 0; i < 10; i++) b.add('#5a4a3a', box(1.4, 3, 0.3, [-15.75 + i * 3.5, ty + 23.3, -76.4]), { cast: false });
  for (let i = 0; i < 6; i++) b.add('#5a4a3a', box(1.6, 3.6, 0.3, [(i < 3 ? -18.5 : 9.5) + (i % 3) * 4.5, ty + 28.6, -76.4]), { cast: false });

  // Porch columns with gold capitals, an entablature and the golden vine over the doorway.
  for (const x of [-19.5, -15.5, -11.5, -7, 7, 11.5, 15.5, 19.5]) {
    b.add('#f6efe0', cyl(0.85, 0.95, 16.5, [x, ty + 3 + 8.25, -75.4], [0, 0, 0], 14));
    b.add(GOLD, box(2.4, 1, 2.4, [x, ty + 19.9, -75.4]), { emissive: '#4a3010' });
    b.add('#e3d4b4', box(2.4, 0.6, 2.4, [x, ty + 3.3, -75.4]));
  }
  b.add('#f6efe0', box(42.6, 1.4, 2.6, [0, ty + 21.1, -75.6]));
  b.add(GOLD, box(42.8, 0.4, 2.8, [0, ty + 21.9, -75.6]), { emissive: '#4a3010' });
  for (let i = 0; i < 26; i++) {
    const x = -4.6 + i * 0.37;
    b.add(GOLD, ball(0.32 + (i % 3) * 0.06, [x, ty + 18.5 - Math.abs(Math.sin(i * 0.9)) * 0.7, -76.0], [1, 1.2, 0.7], 8), { emissive: '#5a3a10' });
  }
  ctx.addCollider({ x: 0, z: -88, hx: 21, hz: 12, rot: 0, top: ty + 32 });

  // Twelve steps up to the porch.
  for (let i = 0; i < 12; i++) {
    const h = 3 - i * 0.25, d = 2 + (i + 1) * 0.5;
    b.add(i % 2 ? '#efe3c2' : '#e3d4b4', box(30 - i * 0.4, h, d, [0, ty + h / 2, -76.5 + d / 2]));
    ctx.addCollider({ x: 0, z: -76.5 + d - 0.25, hx: 15 - i * 0.2, hz: 0.25, rot: 0, top: ty + h });
  }
  ctx.addCollider({ x: 0, z: -75.5, hx: 15, hz: 1, rot: 0, top: ty + 3 });

  // A colonnade lines the inner court wall facing the outer court.
  const cy = ctx.terrainHeight(0, -34);
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const x = sx * (9.5 + i * 4.2);
      b.add(WHITE, cyl(0.42, 0.5, 8.2, [x, cy + 4.1, -33.6], [0, 0, 0], 10));
      b.add(GOLD, box(1.2, 0.45, 1.2, [x, cy + 8.3, -33.6]), { emissive: '#4a3010' });
      ctx.addCollider({ x, z: -33.6, hx: 0.5, hz: 0.5, rot: 0, top: cy + 8.2 });
    }
    b.add('#c8a878', box(36, 0.9, 4.2, [sx * 26.3, cy + 8.9, -35.2]));
    b.add(WHITE, box(36, 0.5, 4.4, [sx * 26.3, cy + 9.5, -35.2]));
  }
  // Altar of sacrifice with its ramp, smoke rising.
  b.add('#e3d8c2', box(9, 4, 9, [-16, ty + 2, -58]));
  b.add('#d8ccb4', box(3, 4, 8, [-16, ty + 2, -50.5]));
  ctx.addCollider({ x: -16, z: -55, hx: 4.5, hz: 8, rot: 0, top: ty + 4 });
  for (let i = 0; i < 6; i++) b.add('#d9d4d0', xf(new THREE.SphereGeometry(1 + i * 0.25, 7, 5), { pos: [-16 + i * 0.5, ty + 5 + i * 1.6, -58 - i * 0.3] }), { cast: false });

  // Inner court wall with the Nicanor gate, and the porticoes around the outer court.
  for (const sx of [-1, 1]) {
    b.add('#e8dcc2', box(36, 5, 1.6, [sx * 25, ty + 2.5, -36]));
    ctx.addCollider({ x: sx * 25, z: -36, hx: 18, hz: 0.8, rot: 0, top: ty + 5 });
  }
  for (const sx of [-1, 1]) {
    b.add('#e8dcc2', box(2.4, 6, 2.4, [sx * 5, ty + 3, -36]));
    b.add(GOLD, box(2.7, 0.5, 2.7, [sx * 5, ty + 5.7, -36]), { emissive: '#4a3010' });
    ctx.addCollider({ x: sx * 5, z: -36, hx: 1.2, hz: 1.2, rot: 0, top: ty + 6 });
  }
  b.add('#e8dcc2', box(12.4, 1, 2.6, [0, ty + 6.5, -36]));
  b.add('#b07a3a', box(7.6, 0.5, 2.8, [0, ty + 5.8, -36]), { emissive: '#3a2008' });

  const gy = ctx.terrainHeight(0, 0);
  portico(b, ctx, { from: [-46, -30], to: [-46, 40], depth: 7, height: 8, count: 12, color: WHITE, roof: '#c8a878', y: gy });
  portico(b, ctx, { from: [46, 40], to: [46, -30], depth: 7, height: 8, count: 12, color: WHITE, roof: '#c8a878', y: gy });
  portico(b, ctx, { from: [46, 46], to: [-46, 46], depth: 8, height: 9, count: 16, color: WHITE, roof: '#c8a878', y: gy });
  for (const [x, z, hx, hz] of [[-55, 5, 1, 50], [55, 5, 1, 50], [0, 56, 56, 1]]) {
    b.add('#e3d4b4', box(hx * 2, 12, hz * 2, [x, gy + 6, z]));
    ctx.addCollider({ x, z, hx, hz, rot: 0, top: gy + 12 });
  }

  // The teachers' circle: rugs, a low reading desk and scrolls.
  const ry = ctx.terrainHeight(...BOY);
  b.add('#8a2a3a', box(9, 0.05, 6.5, [BOY[0], ry + 0.03, BOY[1] - 0.8]), { cast: false });
  b.add('#c8912e', box(8.4, 0.06, 5.9, [BOY[0], ry + 0.04, BOY[1] - 0.8]), { cast: false });
  b.add('#8a2a3a', box(7.6, 0.07, 5.1, [BOY[0], ry + 0.05, BOY[1] - 0.8]), { cast: false });
  b.add('#7a5636', box(1.2, 0.5, 0.6, [BOY[0], ry + 0.25, BOY[1] - 1.1]));
  b.add('#efe3c2', xf(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), { pos: [BOY[0], ry + 0.55, BOY[1] - 1.1], rot: [0, 0, Math.PI / 2] }));
  for (let i = 0; i < 4; i++) b.add('#efe3c2', cyl(0.06, 0.06, 0.6, [BOY[0] - 3 + i * 2, ry + 0.12, BOY[1] - 3.2 + (i % 2) * 0.3], [0, i, Math.PI / 2], 8));
  b.flush();

  b.add('#e3d4b4', box(1.6, 0.4, 1.6, [BOY[0], ry + 0.2, BOY[1]]));
  ctx.addCollider({ x: BOY[0], z: BOY[1], hx: 0.8, hz: 0.8, rot: 0, top: ry + 0.4 });
  b.flush();
  person(ctx, { pos: BOY, y: ry + 0.4, face: [0, -4], scale: 0.74, colors: { robe: '#fbf7ee', mantle: '#b5523b', skin: '#b5825a', hair: '#3a2418', sash: '#b5523b', arms: [0.45, 0.9] } });
  glow(ctx, { pos: [BOY[0], ry + 1, BOY[1]], size: 2.5, color: '#fff0c0', opacity: 0.3 });
  const elders = [];
  for (let i = 0; i < 12; i++) {
    const t = Math.PI * (0.32 + (i / 11) * 1.36);
    elders.push([BOY[0] + Math.sin(t) * 3.3, BOY[1] - 0.6 + Math.cos(t) * 2.7]);
  }
  const shawls = ['#d9d4c8', '#c8bca4', '#a8a090'];
  elders.forEach((p, i) => person(ctx, {
    pos: p, face: BOY, kneel: true,
    colors: { robe: shawls[i % 3], mantle: i % 2 ? '#3a5a8a' : '#5a6a7a', skin: ['#9c6a45', '#a87650', '#8a5a3b'][i % 3], hair: ['#d9d4c8', '#efe8d8', '#8a8478'][i % 3], sash: '#3a5a8a', arms: [0.2, 0.5 + (i % 3) * 0.3] },
  }));
  for (const [x, z, face] of [[-5, -15.5], [5.2, -15], [-5.6, -10], [6, -9.5]]) {
    person(ctx, { pos: [x, z], face: BOY, colors: { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#9c6a45', hair: '#8a8478', sash: '#3a5a8a', arms: [0.15, 0.3] } });
  }

  // Mary and Joseph hurry in from the outer court, sorrowing.
  person(ctx, { pos: [-3.2, -4.6], face: BOY, colors: { robe: '#4f7f9a', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', sash: '#c8912e', arms: [0.35, 1.0] } });
  person(ctx, { pos: [-1.8, -4.0], face: BOY, scale: 1.05, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', sash: '#c8912e', arms: [0.15, 0.4] } });
}

export default {
  title: "Luke 2:41-50: The boy Jesus at the temple",
  subtitle: "Herod's temple, among the teachers in the courts",
  seed: 505,
  style: DAY_STYLE,
  sky: { zenith: '#2f6f9a', mid: '#78aac0', horizon: '#f2dcae', ground: '#d9c08a', glowColor: '#fff2c8', glowDir: [0.4, 0.7, 0.6] },
  sun: { dir: [0.45, 0.85, 0.45], color: '#fff2da', intensity: 2.5, hemi: { sky: '#d6e4ec', ground: '#b09070', intensity: 1.2 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 240, flatRadius: 120, hillHeight: 40, undulation: 0.05,
    plaza: { center: [0, 8], size: [108, 104] },
    colors: { sand: '#d6c49c', dirt: '#c4a878', grass: '#a8a070', grassDark: '#8a8458', plaza: '#e8dcc0', plazaLine: '#c8b48c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#9a9a70' },
  },
  mountains: { count: 30, distance: [480, 760], height: [50, 110], widthRatio: [1.8, 2.8], colors: ['#a89a80', '#b4a688', '#9c9078'] },
  objects: [
    { type: 'platform', pos: [0, -60], tiers: [{ size: [90, 46], height: 3.2 }], stairWidth: 14, rise: 0.27, stairDepth: 0.45, colors: { stone: '#efe3c2', stair: '#e3d4b4', fret: ['#c8912e', '#efe3c2'] } },
  ],
  custom,
  crowd: {
    seed: 21,
    minSpacing: 0.9,
    facing: [0, -60],
    colors: { ...PALETTE, robes: ['#e6d8b8', '#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#4f7f80', '#efe3c2', '#b5523b', '#6f8a6a'] },
    keepClear: [{ kind: 'rect', x: 0, z: -9, hx: 8, hz: 8 }, { kind: 'rect', x: 0, z: 6, hx: 2.5, hz: 6 }],
    groups: [
      { shape: 'rect', center: [-26, 10], size: [24, 50], count: 70, facingJitter: 3 },
      { shape: 'rect', center: [26, 10], size: [24, 50], count: 70, facingJitter: 3 },
      { shape: 'rect', center: [0, -31], size: [60, 5], count: 30, facing: [0, -40], facingJitter: 1, children: 0.1 },
      { shape: 'rect', center: [0, 30], size: [30, 20], count: 30, facingJitter: 3, children: 0.15 },
    ],
  },
  player: {
    start: [1.4, -3.6],
    lookAt: BOY,
    colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
