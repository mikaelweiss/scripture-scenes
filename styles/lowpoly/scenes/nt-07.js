// John 2:1-11. A wedding feast in a courtyard at Cana in late afternoon. Six stone jars stand by the gate,
// just filled with water that is now wine. -z is north toward the feast canopy.
import * as K from './lib/nt-07-kit.js';

const JARS = Array.from({ length: 6 }, (_, i) => [-5.2 + i * 0.95, 6.2]);
const CHRIST = [1.4, 5.4];
const FEAST = [0, -5];

const plaster = '#c7b294';

export default {
  title: 'John 2:1-11: The wedding at Cana',
  seed: 7,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.75, 0.32, 0.35], color: '#ffc48a', intensity: 2.7 },
  light: { sky: '#9fb1d8', ground: '#6a5040', hemi: 1.05 },
  sky: { top: '#4f6a9a', horizon: '#f2c08a', ground: '#c9a07a', sunColor: '#ffd9a0', glow: 1.1 },
  fog: { color: '#d8b48e', near: 60, far: 420 },
  clouds: { count: 30, shadow: '#8a7a88', lit: '#ffd2a0', rim: '#fff1cc', distance: [300, 900], altitude: [120, 260], hole: 0.3 },
  mountains: { count: 40, color: '#6e6a5a', radius: [420, 650], height: [40, 110], haze: 0.55 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#3a2c5a', highlightTint: '#ffe2b8' },
  shadow: { center: [0, 0], radius: 40 },

  player: { start: [-0.7, 9.0], yaw: 0.1, pitch: -0.16, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 900, segments: 160, seed: 21, hills: 30, bumps: 0.25,
    flats: [{ x: 0, z: 0, r: 40, falloff: 40, height: 0 }],
    colors: { ground: '#a68a64', groundAlt: '#957a56', grass: '#7f8a48', high: '#8a7e5c', rock: '#7d6c58' },
    patches: [{ x: 0, z: 0, r: 22, color: '#b8a07e', strength: 0.6, rough: 0.2 }],
  },

  objects: [
    { type: 'pavement', x: 0, z: -1, w: 26, d: 22, tile: 1.6, color: '#c4ac8a', damage: 0 },
    { type: 'tree', x: -10, z: 6, h: 5, kind: 'broad', leaf: '#7b8a5a' },
    { type: 'tree', x: 10.5, z: 3, h: 5.5, kind: 'broad', leaf: '#7b8a5a' },
    { type: 'tree', x: 9, z: 9, h: 7, kind: 'palm', leaf: '#6a8240' },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, 0], ring: [34, 160], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#7b8a5a', h: 5 } },
    { type: 'tree', count: 12, center: [0, 0], ring: [30, 120], spacing: 10, seed: 9, props: { kind: 'palm', leaf: '#6a8240' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [50, 220], spacing: 10, seed: 10, props: { size: 1.4 } },
  ],

  crowd: {
    palette: { ...K.palette, robes: [...K.palette.robes, '#b84a3a', '#d8c690', '#5a6f8a', '#e0d4b8'] },
    groups: [
      {
        count: 46, center: [0, -2], ring: [2, 10.5], spacing: 0.9, face: FEAST, children: 0.2, seed: 31,
        avoid: [{ rect: [0, -5.5, 15, 6.5] }, { rect: [-2.6, 6.5, 8, 4] }, { rect: [2, 8.5, 8, 6] }, { rect: [0, 10, 26, 2] }],
      },
      { count: 14, center: [0, 13], ring: [0.5, 3], arc: [Math.PI * 0.1, Math.PI * 0.9], spacing: 0.9, face: [0, 0], children: 0.4, seed: 32, avoid: [{ rect: [1.2, 12.5, 3, 3] }] },
    ],
  },

  figures: [
    K.christ(CHRIST[0], CHRIST[1], [-2.5, 6.5]),
    { x: 2.6, z: 4.9, face: [0, 6.5], robe: '#3f5a86', mantle: '#2e3f62', skin: '#a8754f', hood: true },
    { x: -6.3, z: 6.5, face: [-5.2, 6.2], robe: '#a88a64', skin: '#8a5a3c', arms: 'out' },
    { x: -0.1, z: 5.3, face: [3.5, -1.5], robe: '#8a6a4a', mantle: '#6d3b2e', skin: '#9b6a46', arms: 'out' },
    { x: 3.5, z: -1.5, face: [-0.6, 7], robe: '#d8cdb5', mantle: '#7a2e3a', skin: '#a87652', scale: 1.05 },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    for (const [x, z] of JARS) K.jar(ctx, { x, z, h: 1.0, color: '#d6cab2', fill: '#b01e3c' });
    K.jar(ctx, { x: -6.6, z: 7.4, h: 0.5, color: '#9a6a48' });
    ctx.glow.add(new THREE.OctahedronGeometry(0.06, 0), { position: [0.15, 1.25, 5.05], color: '#9a1e3a' });

    for (const [x, z, rot, w, d, h] of [
      [-8, -14, 0, 9, 6, 4], [2, -15, 0, 10, 7, 4.4], [11, -13, 0.05, 7, 6, 3.6],
      [-15, -5, Math.PI / 2, 9, 6, 3.8], [-15.5, 5, Math.PI / 2, 8, 6, 3.4],
      [15, -4, -Math.PI / 2, 8, 6, 4], [15.5, 6, -Math.PI / 2, 7, 6, 3.2],
    ]) K.house(ctx, { x, z, rot, w, d, h, color: plaster, stair: false });
    K.wallRun(ctx, { from: [-12.5, 11], to: [-1.5, 11], color: plaster });
    K.wallRun(ctx, { from: [4.5, 11], to: [12.5, 11], color: plaster });

    const village = ctx.rand;
    for (let i = 0; i < 40; i++) {
      const a = village() * Math.PI * 2, r = village.range(26, 70);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x - 1) < 6 && z > 10) continue;
      K.house(ctx, { x, z, rot: village.range(-0.3, 0.3) + (village() < 0.5 ? 0 : Math.PI / 2), color: village.pick([plaster, '#b9a184', '#a89070']) });
    }

    const stripes = ['#e8dcc0', '#a8473a', '#e8dcc0', '#c99a4a'];
    for (let i = 0; i < 12; i++) {
      const x = -9 + i * 1.5 + 0.75;
      ctx.solid.box(1.52, 0.06, 9, { position: [x, 3.6 + Math.sin((i / 11) * Math.PI) * 0.25, FEAST[1]], rotation: [0, 0, 0], color: stripes[i % 4], jitter: 0.02 });
    }
    for (const x of [-9, -3, 3, 9]) for (const z of [FEAST[1] - 4.4, FEAST[1] + 4.4]) {
      K.block(ctx, { x, z, y: 0, w: 0.16, h: 3.6, d: 0.16, color: '#6a4a30' });
      K.lamp(ctx, { x, y: 3.1, z: z + (z > FEAST[1] ? -0.3 : 0.3), intensity: 3, distance: 8 });
    }
    for (let i = 0; i < 5; i++) K.lamp(ctx, { x: -6 + i * 3, y: 3.0, z: FEAST[1], light: i % 2 === 0, intensity: 3 });

    const rug = (x, z, w, d, c) => ctx.solid.box(w, 0.05, d, { position: [x, 0.08, z], color: c, jitter: 0.02 });
    rug(0, FEAST[1], 16, 7.5, '#8a3a2e');
    rug(0, FEAST[1], 14.5, 6, '#b5803e');

    const guestRobes = ['#8b6b4a', '#a0825c', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#6b6f4a', '#d8cdb5', '#4f5a6b', '#9a4a34', '#b84a3a'];
    const pick = ctx.rand.pick;
    for (const tz of [FEAST[1] + 1.4, FEAST[1] - 1.6]) {
      K.table(ctx, { x: 0, z: tz, w: 12, d: 0.9, h: 0.45, color: '#7a5638' });
      for (let i = 0; i < 12; i++) {
        const x = -5.4 + i * 1.0;
        ctx.solid.box(0.3, 0.12, 0.2, { position: [x + 0.2, 0.55, tz + 0.1], color: '#d0a868' });
        ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 6), { position: [x - 0.2, 0.56, tz - 0.15], color: '#8a5a3a' });
        for (const side of [-1, 1]) {
          if (tz < FEAST[1] && side < 0 && Math.abs(x) < 1.2) continue;
          K.seated(ctx, { x: x + ctx.rand.range(-0.1, 0.1), z: tz + side * 0.85, face: [x, tz], seat: 0.2, robe: pick(guestRobes), mantle: ctx.rand() < 0.5 ? pick(K.palette.mantles) : undefined, skin: pick(K.palette.skins) });
        }
      }
    }
    K.table(ctx, { x: 0, z: FEAST[1] - 3.6, w: 3.2, d: 0.9, h: 0.5, color: '#6a4a30' });
    K.seated(ctx, { x: -0.5, z: FEAST[1] - 4.3, face: [-0.5, 0], seat: 0.35, robe: '#e9e0cc', mantle: '#3c6aa0', skin: '#a87652' });
    K.seated(ctx, { x: 0.5, z: FEAST[1] - 4.3, face: [0.5, 0], seat: 0.35, robe: '#c9a050', mantle: '#8a2e2a', skin: '#9b6a46' });
    ctx.solid.add(new THREE.TorusGeometry(0.15, 0.04, 4, 8), { position: [0.5, 1.37, FEAST[1] - 4.33], rotation: [Math.PI / 2, 0, 0], color: '#6a8a3a' });
    ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.2, 0.18, 7), { position: [-0.5, 1.41, FEAST[1] - 4.33], color: '#f4efe4' });

    K.birds(ctx, { center: [0, -10], height: 22, radius: 30, count: 8, color: '#3a3430', speed: 0.15, size: 0.4 });
  },
};
