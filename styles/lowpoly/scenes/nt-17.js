// Matthew 17:1-8. The top of a high mountain above a sea of clouds. Christ is transfigured, his raiment
// white as the light, with Moses and Elias beside him. A bright cloud overshadows them, and Peter, James
// and John have fallen on their faces. -z is north toward Christ.
import { person, prostrate, outcrop, grassTufts } from './lib/nt-13-kit.js';

const TOP = 60;
const CHRIST = [0, -8.3];
const MOSES = [-2.8, -7.2];
const ELIAS = [2.8, -7.2];

export default {
  title: 'Matthew 17:1-8: The Transfiguration',
  seed: 17,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.45, 0.5, 0.75], color: '#fff0d8', intensity: 2.6 },
  light: { sky: '#b4c8ec', ground: '#7a6a58', hemi: 1.2 },
  sky: { top: '#2f5aa6', horizon: '#e4ecf4', ground: '#f0f2f4', sunColor: '#fff6e0', glow: 0.8 },
  fog: { color: '#dfe6ee', near: 120, far: 900 },
  clouds: { count: 170, seed: 17, shadow: '#b8c0d0', lit: '#ffffff', rim: '#ffffff', distance: [110, 800], altitude: [18, 44], hole: 0 },
  mountains: { count: 30, color: '#7a8296', radius: [600, 820], height: [60, 140], haze: 0.32 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.05, contrast: 1.05, vignette: 0.36, shadowTint: '#283a6a', highlightTint: '#fff6e4' },
  shadow: { center: [0, -4], radius: 30 },

  player: { start: [3.6, 3.8], yaw: 0.32, pitch: 0.02, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 1300,
    segments: 200,
    seed: 17,
    hills: 60,
    bumps: 0.5,
    flats: [
      { x: 0, z: -4, r: 16, falloff: 46, height: TOP - 3 },
      { x: 0, z: -4, r: 9, falloff: 9, height: TOP },
    ],
    colors: { ground: '#8a8270', groundAlt: '#7a7462', grass: '#7c8458', high: '#9a9284', rock: '#6e665c' },
    patches: [
      { x: 0, z: -4, r: 14, color: '#8a8a62', strength: 0.55, rough: 0.7 },
      { x: 0, z: -4, r: 6, color: '#a49a86', strength: 0.6, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'rock', count: 26, center: [0, -4], ring: [15, 40], spacing: 5, seed: 7, props: { color: '#8a8070' } },
    { type: 'rock', count: 40, center: [0, -4], ring: [40, 160], spacing: 9, seed: 8, props: { color: '#7e7668', size: 3 } },
    { type: 'rubble', count: 18, center: [0, -4], ring: [4, 22], seed: 9, props: { color: '#9a907e', count: 5, radius: 2, size: [0.15, 0.4] } },
    { type: 'tree', count: 14, center: [0, -4], ring: [50, 140], spacing: 10, seed: 10, props: { kind: 'broad', leaf: '#5a6e40', h: 5 } },
  ],

  custom(ctx) {
    const { THREE, scene } = ctx;
    const ledge = (x, z, w, d, h) => {
      ctx.solid.add(new THREE.CylinderGeometry(w, w * 1.15, h, 7), { position: [x, TOP + h / 2 - 0.1, z], scale: [1, 1, d / w], color: '#a69c88', jitter: 0.06 });
      ctx.colliders.add({ x, z, w: w * 1.6, d: d * 1.6, bottom: TOP - 1, top: TOP + h - 0.1 });
    };
    ledge(0, -8, 4.2, 2.6, 0.6);
    ledge(0, -8.3, 1.3, 1.1, 1.0);

    const r = ctx.rand;
    const lift = TOP + 0.5;
    person(ctx, {
      x: CHRIST[0], z: CHRIST[1], y: TOP + 0.9, face: [0, 10], robe: '#ffffff', mantle: '#fffaf0', skin: '#fff4e0', arms: 'out', emissive: 0.35, scale: 1.1,
      light: { color: '#fff6e4', intensity: 9, distance: 14, lift: 3.2 },
      halo: { size: 4.2, opacity: 0.28, color: '#fffaf0' },
    });
    for (const [x, z] of [MOSES, ELIAS]) {
      person(ctx, {
        x, z, y: lift, face: [x * 0.2, 10], robe: '#f2eee6', mantle: '#e6dfd0', skin: '#e8dccb', arms: 'down', emissive: 0.25, scale: 1.04,
        halo: { size: 3.2, opacity: 0.25, color: '#fff6e8' },
      });
    }

    // Peter, James and John fallen on their faces toward the vision.
    for (const [x, z, robe, mantle] of [[-3.4, -1.2, '#7a5f44', '#4f3c2c'], [0.2, -3.0, '#5e6a74', '#3e4650'], [4.4, -2.4, '#8c6a46', '#5a4430']]) {
      prostrate(ctx, { x, z, face: CHRIST, robe, mantle, skin: '#9b6a46', scale: 1.05 });
    }

    // Weathered rock outcrops, grass and loose stones on the summit, with the land falling away beyond.
    for (const [x, z, size] of [[-7.5, -13, 2.6], [-4.6, -15, 1.6], [7, -13.5, 2.2], [10.5, -8, 1.8], [-11, -6, 2.0], [-10, 3, 1.5], [9.5, 3.5, 1.7], [12.5, -1, 1.2], [-6.5, 9, 1.4], [7, 10, 1.6], [-13, -12, 2.4], [13, -14, 2.8]]) {
      outcrop(ctx, { x, z, size, color: '#8a8272', moss: '#7c8452' });
    }
    grassTufts(ctx, { center: [0, -4], radius: 15, count: 260, avoid: [[0, -8, 5.5], [0, -2, 4]] });
    grassTufts(ctx, { center: [0, -4], inner: 15, radius: 30, count: 160, colors: ['#7c8a4a', '#6b7a3e'] });
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = r.range(5, 16);
      const x = Math.cos(a) * d, z = -4 + Math.sin(a) * d;
      if (Math.hypot(x, z + 8) < 5) continue;
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.08, 0.28), 0), { position: [x, ctx.heightAt(x, z) + 0.03, z], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.6, 1], color: r.pick(['#9a907e', '#8a8070', '#a8a090']), jitter: 0.06 });
    }

    // The bright cloud that overshadows them.
    const cloudMat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#fff6ea', emissiveIntensity: 0.25, flatShading: true, transparent: true, opacity: 0.6, depthWrite: false });
    const cloud = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 9;
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r.range(2.2, 4.2), 1), cloudMat);
      puff.position.set(Math.cos(a) * d, r.range(-1, 1.6), Math.sin(a) * d * 0.7);
      puff.scale.set(1.3, 0.62, 1);
      puff.rotation.set(r() * 3, r() * 3, 0);
      cloud.add(puff);
    }
    cloud.position.set(CHRIST[0], TOP + 12, CHRIST[1] - 1.5);
    scene.add(cloud);
    const glow = new THREE.PointLight('#fff4e0', 12, 30, 1.2);
    glow.position.set(CHRIST[0], TOP + 7, CHRIST[1]);
    scene.add(glow);

    ctx.effects.beam({ position: [CHRIST[0], TOP + 0.4, CHRIST[1]], height: 14, radiusBottom: 2.2, radiusTop: 5, color: '#fff6e0', opacity: 0.3 });
    ctx.effects.ring({ position: [CHRIST[0], TOP + 0.65, CHRIST[1]], radius: 3.2, width: 1.4, color: '#fff2c8', opacity: 0.35 });
    ctx.effects.motes({ position: [CHRIST[0], TOP + 0.5, CHRIST[1]], radius: 6, height: 12, count: 90 });

    ctx.onFrame((t) => {
      cloud.rotation.y = t * 0.03;
      cloud.position.y = TOP + 12 + Math.sin(t * 0.4) * 0.3;
    });
  },
};
