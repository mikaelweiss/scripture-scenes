// Revelation 1:9-18. On the rocky heights of Patmos, John turns to see the voice that spoke with him:
// seven golden candlesticks, and in their midst one like the Son of man in a white garment with a golden
// girdle, his face shining as the sun, seven stars in his right hand. John lies at his feet. -z is north.
import { divine, figure, lampstand, water } from './lib/nt-32-kit.js';

const CHRIST = [0, -6];
const JOHN = [0.2, -3.4];
const SCALE = 1.15;

const candlesticks = Array.from({ length: 7 }, (_, i) => {
  const a = Math.PI * (0.32 + (i / 6) * 1.36);
  return [CHRIST[0] + Math.sin(a) * 3.6, CHRIST[1] + Math.cos(a) * 3.6];
});

export default {
  title: 'Revelation 1:9-18: John on Patmos',
  seed: 38,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.5, 0.45, -0.7], color: '#ffd8a0', intensity: 2.4 },
  light: { sky: '#a8b8e8', ground: '#6a5848', hemi: 1.05 },
  sky: { top: '#3e5a96', horizon: '#f4cfa0', ground: '#b89a80', sunColor: '#ffe2b0', glow: 1.2 },
  fog: { color: '#d8bfa4', near: 120, far: 820 },
  clouds: { count: 40, shadow: '#7a7088', lit: '#ffd8a8', rim: '#fff4dc', distance: [300, 900], altitude: [100, 240], hole: 0.3 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.88 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#2e2a5e', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -4], radius: 30 },

  player: { start: [1.7, 2.6], yaw: 0.14, pitch: 0.1, eye: 1.65, speed: 4 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 38,
    hills: 34,
    bumps: 0.6,
    hillScale: 0.012,
    flats: [
      { x: 0, z: -2, r: 16, falloff: 70, height: 14 },
    ],
    colors: { ground: '#9a8a74', groundAlt: '#8a7a66', grass: '#7a7c4a', high: '#a49480', rock: '#7a6e62' },
    patches: [{ x: 0, z: -5, r: 9, color: '#b4a68e', strength: 0.5, rough: 0.4 }],
  },

  objects: [],

  scatter: [
    { type: 'rock', count: 40, center: [0, -2], ring: [9, 40], spacing: 4, seed: 381, props: { color: '#8a7e70' } },
    { type: 'rock', count: 40, center: [0, 0], ring: [40, 200], spacing: 10, seed: 382, props: { size: 3, color: '#7e7264' } },
    { type: 'rubble', count: 20, center: [0, -2], ring: [3, 14], seed: 383, avoid: [{ rect: [0, -6, 10, 8] }], props: { radius: 1.4, count: 4, size: [0.08, 0.25], color: '#8a7e70' } },
    { type: 'tree', count: 18, center: [0, 0], ring: [18, 90], spacing: 10, seed: 384, props: { kind: 'broad', h: 3.5, leaf: '#5e6a3e' } },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { x: 0, z: 0, y: 1, w: 1600, d: 1600, seg: 160, color: '#3a6f8a', amp: 0.12, specular: '#ffd8a8' });

    const cy = ctx.heightAt(...CHRIST);
    divine(ctx, { x: CHRIST[0], z: CHRIST[1], y: cy, face: [CHRIST[0], 10], scale: SCALE, light: 22, range: 16, halo: 5, haloOpacity: 0.45, arms: 'out', emissive: 0.4 });
    ctx.glow.add(new THREE.TorusGeometry(0.27, 0.045, 4, 14), { position: [CHRIST[0], cy + 1.18 * SCALE, CHRIST[1]], rotation: [Math.PI / 2, 0, 0], color: '#ffc850' });
    ctx.effects.beam({ position: [CHRIST[0], cy, CHRIST[1]], height: 260, radiusBottom: 2.5, radiusTop: 14, color: '#fff1cf', opacity: 0.35 });
    ctx.effects.ring({ position: [CHRIST[0], cy + 0.04, CHRIST[1]], radius: 3.6, width: 0.8, color: '#ffe3a0', opacity: 0.35 });
    ctx.effects.motes({ position: [CHRIST[0], cy, CHRIST[1]], radius: 4, height: 30, count: 70 });

    // Seven stars circling in his right hand.
    const hand = [CHRIST[0] - 0.67 * SCALE, cy + 0.98 * SCALE + 0.12, CHRIST[1] + 0.23 * SCALE];
    const stars = new THREE.Group();
    const starMat = new THREE.MeshBasicMaterial({ color: '#fff6d8', toneMapped: false });
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), starMat);
      const a = (i / 7) * Math.PI * 2;
      m.position.set(Math.cos(a) * 0.22, Math.sin(a * 2) * 0.04, Math.sin(a) * 0.22);
      stars.add(m);
    }
    stars.position.set(...hand);
    ctx.scene.add(stars);
    ctx.effects.halo({ position: hand, size: 1.2, opacity: 0.8, color: '#fff3d0' });
    ctx.onFrame((t) => (stars.rotation.y = t * 0.6));

    for (const [x, z] of candlesticks) lampstand(ctx, { x, z, h: 1.8, light: 4, range: 6 });

    const jy = ctx.heightAt(...JOHN);
    figure(ctx, { x: JOHN[0], z: JOHN[1], y: jy, face: [-2.2, -5.4], pose: 'prostrate', robe: '#a08c70', mantle: '#5a4a3a', arms: 'out' });
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), { position: [1.4, jy + 0.04, -1.6], rotation: [Math.PI / 2, 0.8, 0], color: '#5a4332' });
    ctx.solid.box(0.35, 0.05, 0.25, { position: [-1.2, jy + 0.03, -1.4], rotation: [0, 0.3, 0], color: '#c8b48a' });
  },
};
