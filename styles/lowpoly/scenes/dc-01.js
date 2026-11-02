// D&C 107:53-57: Three years before his death Adam gathers his righteous posterity in the valley of Adam-ondi-Ahman,
// blesses them, and the Lord appears. Adam stands on a knoll north of the player (-z), the people fill the slope below him.
import * as THREE from 'three';
import { forest, leafy, bush } from './lib/dc-01-kit.js';

const ADAM = [0, -24];
const LORD = [0, -27.5];
const RIVER = [[-60, -260], [-72, -140], [-58, -60], [-76, 20], [-64, 110], [-82, 260]];

const robes = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#c4b090', '#d8cdb5', '#94704e', '#7a6a4e', '#a65d3f', '#6b6f4a', '#e2d7bf'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246', '#e8dfca'],
  skins: ['#9b6a46', '#a87652', '#b5835e', '#c08f68', '#8a5a3c'],
  mantleChance: 0.7,
  hoodChance: 0.35,
};

function river(ctx) {
  const pts = RIVER.map(([x, z]) => new THREE.Vector2(x, z));
  const curve = new THREE.SplineCurve(pts);
  const samples = curve.getSpacedPoints(80);
  const pos = [];
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i], b = samples[i + 1];
    const dir = b.clone().sub(a).normalize();
    const n = new THREE.Vector2(-dir.y, dir.x).multiplyScalar(13);
    const a0 = a.clone().add(n), a1 = a.clone().sub(n), b0 = b.clone().add(n), b1 = b.clone().sub(n);
    pos.push(a0.x, 0, a0.y, b0.x, 0, b0.y, a1.x, 0, a1.y, a1.x, 0, a1.y, b0.x, 0, b0.y, b1.x, 0, b1.y);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const water = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: '#5f86a0', emissive: '#2c4a66', emissiveIntensity: 0.4, side: THREE.DoubleSide }));
  water.position.y = -1.3;
  water.receiveShadow = true;
  ctx.scene.add(water);
}

function altar(ctx) {
  const y = ctx.heightAt(ADAM[0], ADAM[1] - 3);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ctx.solid.add(new THREE.DodecahedronGeometry(0.35, 0), { position: [ADAM[0] + Math.cos(a) * 0.9, y + 0.2, ADAM[1] - 3.2 + Math.sin(a) * 0.6], rotation: [a, a * 2, 0], color: '#8f8576' });
  }
  ctx.solid.box(1.8, 0.9, 1.2, { position: [ADAM[0], y + 0.45, ADAM[1] - 3.2], color: '#9a8f7e', jitter: 0.1 });
  ctx.solid.box(2.0, 0.18, 1.4, { position: [ADAM[0], y + 0.95, ADAM[1] - 3.2], color: '#7e7466', jitter: 0.08 });
  ctx.colliders.add({ x: ADAM[0], z: ADAM[1] - 3.2, w: 2, d: 1.4, bottom: y, top: y + 1.05 });
}

export default {
  title: 'D&C 107:53-57: Adam blesses his posterity',
  seed: 107,
  fov: 60,
  exposure: 1.02,

  sun: { direction: [0.8, 0.3, -0.35], color: '#ffd29a', intensity: 2.8 },
  light: { sky: '#a8c0e8', ground: '#5b5a38', hemi: 1.0 },
  sky: { top: "#2f4f8a", horizon: "#e8b880", ground: '#c9b07c', sunColor: '#ffe2b0', glow: 1.0 },
  fog: { color: '#d8c8a4', near: 80, far: 620 },
  clouds: { count: 40, shadow: '#8f8aa0', lit: '#ffe2b8', rim: '#fff6dc', distance: [260, 900], altitude: [110, 220], hole: 0.2 },
  mountains: { count: 40, color: '#6f7c5e', radius: [480, 720], height: [26, 70], haze: 0.55 },
  bloom: { strength: 0.6, radius: 0.55, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#2e3050', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -6], radius: 60 },

  player: { start: [2, -8], yaw: 0.04, pitch: 0.12, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 190,
    seed: 23,
    hills: 30,
    hillScale: 0.007,
    bumps: 0.3,
    flats: [
      { x: ADAM[0], z: ADAM[1] - 2, r: 7, falloff: 13, height: 3.2 },
      ...RIVER.map(([x, z]) => ({ x, z, r: 14, falloff: 22, height: -2.4 })),
    ],
    colors: { ground: '#7e8c48', groundAlt: '#6f8240', grass: '#86964c', high: '#7a8a4e', rock: '#7d7058' },
    patches: [
      { x: ADAM[0], z: ADAM[1] - 2, r: 9, color: '#9a9060', strength: 0.5, rough: 0.4 },
      ...RIVER.map(([x, z]) => ({ x, z, r: 20, color: '#8a7a56', strength: 0.6, rough: 0.5 })),
    ],
  },

  objects: [],
  scatter: [
    { type: 'rock', count: 30, center: [0, 0], ring: [90, 300], spacing: 12, seed: 10, props: { color: '#8a8070' } },
  ],

  crowd: {
    palette: robes,
    groups: [
      { count: 760, center: ADAM, ring: [9, 46], arc: [0.15, Math.PI - 0.15], spacing: 0.95, face: ADAM, children: 0.2, kneel: 0.08, seed: 31, avoid: [{ rect: [2, 15, 6, 74] }] },
      { count: 70, center: ADAM, ring: [5.5, 9], arc: [-0.6, Math.PI + 0.6], spacing: 0.9, face: ADAM, children: 0.1, kneel: 0.5, seed: 32, avoid: [{ rect: [2, -10, 4, 20] }] },
    ],
  },

  figures: [
    { x: ADAM[0], z: ADAM[1], face: [0, 40], scale: 1.08, robe: '#e8ddc6', mantle: '#8a6748', skin: '#c49a76', arms: 'out', hood: true },
    { x: -1.6, z: ADAM[1] + 2.4, y: 2.7, face: ADAM, scale: 1.0, robe: '#cbb48e', mantle: '#6a5038', skin: '#b5835e', arms: 'down' },
    { x: 1.7, z: ADAM[1] + 2.2, y: 2.7, face: ADAM, scale: 1.0, robe: '#b89a72', mantle: '#4a5a6a', skin: '#a87652', arms: 'down' },
    {
      x: LORD[0], z: LORD[1], y: 4.4, face: [0, 40], scale: 1.3, robe: '#fffcf3', mantle: '#f6f0e2', skin: '#fbefd8', arms: 'out', emissive: 0.28, hood: true,
      light: { color: '#fff0cf', intensity: 12, distance: 20 },
      halo: { size: 3.6, opacity: 0.3, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'beam', position: [LORD[0], 3.2, LORD[1]], height: 300, radiusBottom: 3.5, radiusTop: 18, color: "#fff1cf", opacity: 0.35 },
    { type: 'motes', position: [LORD[0], 3.2, LORD[1]], radius: 6, height: 30, count: 180 },
    { type: 'sunShafts', center: [60, -120], count: 6, spread: 90, length: 500, width: [10, 24], opacity: 0.06 },
  ],

  custom(ctx) {
    river(ctx);
    altar(ctx);
    forest(ctx, { center: [0, -10], ring: [62, 260], count: 260, seed: 7, kinds: ['leafy', 'leafy', 'leafy', 'pine'], spacing: 6, avoid: [{ rect: [-68, 0, 46, 600] }, { rect: [0, -90, 40, 70] }] });
    for (const [x, z] of [[-26, -40], [24, -46], [-38, 6], [40, 0], [30, 50], [-30, 58]]) leafy(ctx, x, z, 9 + ctx.rand() * 3, '#5a7a36');
    for (let i = 0; i < 40; i++) {
      const a = ctx.rand() * Math.PI * 2, d = 50 + ctx.rand() * 60;
      bush(ctx, Math.cos(a) * d, Math.sin(a) * d - 10, 0.7 + ctx.rand() * 0.8);
    }
  },
};
