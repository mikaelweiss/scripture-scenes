// Mosiah 18:4-17: At the place called Mormon, a fountain of pure water in a thicket of small trees, Alma stands
// in the water with Helam and baptizes him. The believers gather on the shore, hidden from the king.
import { water, broadTree, bush, scatterIn, person, pine } from './lib/bom-13-kit.js';

const POOL = [0, -10];
const ALMA = [-1.4, -9.4];
const HELAM = [-0.3, -8.6];
const WATER_Y = -0.35;

export default {
  title: 'Mosiah 18:4-17: Baptisms at the Waters of Mormon',
  seed: 18,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.75, 0.42, -0.35], color: '#ffe6b8', intensity: 2.7 },
  light: { sky: '#b4cce8', ground: '#5a5a3a', hemi: 1.1 },
  sky: { top: '#5a8ac8', horizon: '#f0e2c8', ground: '#a8a080', sunColor: '#fff2d0', glow: 1.0 },
  fog: { color: '#d8dccc', near: 50, far: 420 },
  clouds: { count: 40, shadow: '#a4acb8', lit: '#fff6e6', rim: '#ffffff', distance: [300, 900], altitude: [120, 240], hole: 0.25 },
  mountains: { count: 40, color: '#5a6a5a', radius: [460, 700], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.45, radius: 0.55, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.4, shadowTint: '#283a48', highlightTint: '#fff0d0' },
  shadow: { center: [0, -6], radius: 45 },

  player: { start: [4, 2.5], yaw: 0.43, pitch: -0.1, eye: 1.65, speed: 4 },

  terrain: {
    size: 900,
    segments: 200,
    seed: 18,
    hills: 22,
    bumps: 0.18,
    flats: [
      { x: 0, z: -4, r: 30, falloff: 30, height: 0.3 },
      { x: POOL[0], z: POOL[1], r: 6.5, falloff: 4.5, height: -1.4 },
      { x: POOL[0] - 5, z: POOL[1] - 4, r: 4, falloff: 3, height: -1.2 },
    ],
    colors: { ground: '#6a7a3a', groundAlt: '#5a6e34', grass: '#5e7a36', high: '#6a6a48', rock: '#6a6252' },
    patches: [
      { x: POOL[0], z: POOL[1], r: 12, color: '#8a8460', strength: 0.7, rough: 0.4 },
      { x: POOL[0], z: POOL[1], r: 8, color: '#6a6a50', strength: 0.9, rough: 0.2 },
    ],
  },

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#c4b090', '#94704e', '#6b6f4a', '#7a4e36', '#d8cdb5', '#e4dccb'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#556246'],
      skins: ['#c08a62', '#b07a55', '#c9976e', '#a8724c'],
      mantleChance: 0.6,
      hoodChance: 0.3,
    },
    groups: [
      {
        count: 200, center: POOL, ring: [10, 19], arc: [-0.5, Math.PI + 0.4], spacing: 0.85, face: ALMA, children: 0.2, kneel: 0.15, seed: 81,
        avoid: [{ rect: [4.5, 4, 8, 10] }],
      },
      { count: 6, points: [[6.4, -4.6], [7.2, -5.8], [-6.6, -4.4], [-7.4, -5.8], [7.6, -7.4], [-5.6, -3.4]], face: ALMA, children: 0, seed: 82 },
    ],
  },

  figures: [],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { x: POOL[0] - 2, z: POOL[1] - 2, w: 34, d: 30, y: WATER_Y, color: '#4aa8b0', opacity: 0.78, wave: 0.03, cell: 1.6, speed: 0.6, shininess: 90 });

    // Alma, waist deep, raises his hand. Helam stands before him.
    person(ctx, { x: ALMA[0], z: ALMA[1], y: WATER_Y - 0.85, face: HELAM, scale: 1.05, robe: '#efe8d8', mantle: '#d8ccb0', skin: '#c08a62', arms: 'out', collide: true });
    person(ctx, { x: HELAM[0], z: HELAM[1], y: WATER_Y - 0.85, face: ALMA, robe: '#e8e0cc', skin: '#b07a55' });
    const ripples = [];
    for (const [x, z] of [ALMA, HELAM]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.6, 16), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.6, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, WATER_Y + 0.08, z);
      ctx.scene.add(ring);
      ripples.push(ring);
    }
    ctx.onFrame((t) => ripples.forEach((r, i) => {
      const k = 1 + ((t * 0.4 + i * 0.5) % 1) * 1.6;
      r.scale.set(k, k, 1);
      r.material.opacity = 0.6 * (1 - ((t * 0.4 + i * 0.5) % 1));
    }));

    // The fountain: a spring spilling from mossy rocks at the north end of the pool.
    const sx = POOL[0] - 5, sz = POOL[1] - 9.5;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI - Math.PI;
      ctx.builders.rock(ctx, { x: sx + Math.cos(a) * 2.6, z: sz + Math.sin(a) * 1.6, size: ctx.rand.range(1.2, 2.2), color: i % 2 ? '#6a6a58' : '#5a6a4a' });
    }
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.6, 1, 6), new THREE.MeshBasicMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    fall.position.set(sx, WATER_Y + 1.1, sz + 1.6);
    fall.rotation.x = -0.4;
    ctx.scene.add(fall);
    ctx.onFrame((t) => (fall.material.opacity = 0.65 + 0.12 * Math.sin(t * 6)));
    for (let i = 0; i < 5; i++) {
      const foam = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), new THREE.MeshBasicMaterial({ color: '#f4fcff', transparent: true, opacity: 0.7 }));
      foam.position.set(sx + (i - 2) * 0.35, WATER_Y + 0.05, sz + 2.4 + (i % 2) * 0.3);
      foam.scale.set(1, 0.35, 1);
      ctx.scene.add(foam);
      ctx.onFrame((t) => foam.scale.set(1 + 0.15 * Math.sin(t * 5 + i), 0.35, 1 + 0.15 * Math.cos(t * 4 + i)));
    }

    // Thicket of small trees around the waters.
    const open = (x, z) => Math.hypot(x - POOL[0], z - POOL[1]) < 20 && z > POOL[1] - 6;
    for (const [x, z] of scatterIn(ctx.rand, { center: POOL, ring: [9, 90], count: 420, spacing: 2.4, avoid: (x, z) => open(x, z) || Math.hypot(x - POOL[0], z - POOL[1]) < 9 })) {
      const d = Math.hypot(x - POOL[0], z - POOL[1]);
      if (d > 50 && ctx.rand() < 0.35) pine(ctx, { x, z, h: ctx.rand.range(7, 11), color: '#3a5a34' });
      else broadTree(ctx, { x, z, h: ctx.rand.range(3, d < 25 ? 4.8 : 6.5), color: ctx.rand.pick(['#5a8a3a', '#4a7a34', '#6a9440', '#557f38']), crowns: 3, spread: 1.2 });
    }
    for (const [x, z] of scatterIn(ctx.rand, { center: POOL, ring: [8, 40], count: 120, spacing: 1.6, avoid: (x, z) => Math.hypot(x - 5.5, z - 6) < 4 || (Math.hypot(x - POOL[0], z - POOL[1]) < 19 && z > POOL[1] - 3) })) {
      bush(ctx, { x, z, size: ctx.rand.range(0.6, 1.2), color: ctx.rand.pick(['#4f7a36', '#5a8a3e', '#46703a']) });
    }
    // Reeds at the water's edge.
    for (let i = 0; i < 60; i++) {
      const a = ctx.rand() * Math.PI * 2, r = ctx.rand.range(6.6, 8.2);
      const x = POOL[0] + Math.cos(a) * r, z = POOL[1] + Math.sin(a) * r;
      if (z > POOL[1] + 3 && Math.abs(x - POOL[0]) < 5) continue;
      ctx.solid.add(new THREE.ConeGeometry(0.06, ctx.rand.range(0.8, 1.5), 3), { position: [x, ctx.heightAt(x, z) + 0.5, z], rotation: [ctx.rand.range(-0.2, 0.2), 0, ctx.rand.range(-0.2, 0.2)], color: '#7a9440' });
    }
    ctx.effects.sunShafts({ center: POOL, sunDir: [0.75, 0.42, -0.35], count: 5, spread: 14, length: 120, width: [2, 5], color: '#fff2c8', opacity: 0.08 });
  },
};
