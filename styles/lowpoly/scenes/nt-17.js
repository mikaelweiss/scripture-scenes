// Matthew 17:1-8. The top of a high mountain above a sea of clouds. Christ is transfigured, his raiment
// white as the light, with Moses and Elias beside him. A bright cloud overshadows them, and Peter, James
// and John have fallen on their faces. -z is north toward Christ.
import { person } from './lib/nt-13-kit.js';

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
  mountains: { count: 30, color: '#7a8296', radius: [600, 820], height: [60, 140], haze: 0.55 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.05, contrast: 1.05, vignette: 0.36, shadowTint: '#283a6a', highlightTint: '#fff6e4' },
  shadow: { center: [0, -4], radius: 30 },

  player: { start: [1.0, 5.5], yaw: 0.05, pitch: 0.1, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 1300,
    segments: 200,
    seed: 17,
    hills: 60,
    bumps: 0.5,
    flats: [
      { x: 0, z: -4, r: 14, falloff: 150, height: TOP },
      { x: 0, z: -4, r: 12, falloff: 10, height: TOP },
    ],
    colors: { ground: '#8a8270', groundAlt: '#7a7462', grass: '#7c8458', high: '#9a9284', rock: '#6e665c' },
    patches: [{ x: 0, z: -4, r: 18, color: '#a49a86', strength: 0.6, rough: 0.5 }],
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
    for (const [x, z, robe, mantle] of [[-2.6, 0.2, '#7a5f44', '#4f3c2c'], [0.2, 1.4, '#5e6a74', '#3e4650'], [2.8, 0.4, '#8c6a46', '#5a4430']]) {
      person(ctx, { x, z, y: TOP, face: CHRIST, pose: 'bow', robe, mantle, skin: '#9b6a46', collide: false });
    }

    // The bright cloud that overshadows them.
    const cloudMat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#fff6ea', emissiveIntensity: 0.25, flatShading: true, transparent: true, opacity: 0.72, depthWrite: false });
    const cloud = new THREE.Group();
    const r = ctx.rand;
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 9;
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r.range(2.2, 4.2), 1), cloudMat);
      puff.position.set(Math.cos(a) * d, r.range(-1, 1.6), Math.sin(a) * d * 0.7);
      puff.scale.set(1.3, 0.62, 1);
      puff.rotation.set(r() * 3, r() * 3, 0);
      cloud.add(puff);
    }
    cloud.position.set(CHRIST[0], TOP + 10.5, CHRIST[1] - 1.5);
    scene.add(cloud);
    const glow = new THREE.PointLight('#fff4e0', 12, 30, 1.2);
    glow.position.set(CHRIST[0], TOP + 7, CHRIST[1]);
    scene.add(glow);

    ctx.effects.beam({ position: [CHRIST[0], TOP + 0.4, CHRIST[1]], height: 14, radiusBottom: 2.2, radiusTop: 5, color: '#fff6e0', opacity: 0.3 });
    ctx.effects.ring({ position: [CHRIST[0], TOP + 0.65, CHRIST[1]], radius: 3.2, width: 1.4, color: '#fff2c8', opacity: 0.35 });
    ctx.effects.motes({ position: [CHRIST[0], TOP + 0.5, CHRIST[1]], radius: 6, height: 12, count: 90 });

    ctx.onFrame((t) => {
      cloud.rotation.y = t * 0.03;
      cloud.position.y = TOP + 10.5 + Math.sin(t * 0.4) * 0.3;
    });
  },
};
