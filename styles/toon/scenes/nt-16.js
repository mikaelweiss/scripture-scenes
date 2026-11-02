// Matthew 14:22-33: the fourth watch of the night on Galilee, the wind contrary. Christ comes walking on the sea,
// and Peter has stepped down out of the boat toward Him. The boat lies along x, Christ waits on the water to the north (-z).
import * as THREE from 'three';
import { CHRIST, DISCIPLES, boat, figure, flatColors, glow, groundMesh, moon, NO_PLAZA, rockBoat, sea, stars, toonStyle } from './lib/nt-13-kit.js';

const JESUS = [2.2, -10.8];
const PETER = [-4.4, -8.4];

export default {
  title: 'Matthew 14:22-33: Walking on water',
  subtitle: 'Be of good cheer; it is I; be not afraid',
  seed: 1433,

  style: toonStyle({ ink: '#0c1020', fog: '#1c2848', near: 40, far: 420, fade: [50, 260, 240, 0.5], steps: [0.32, 0.66, 1.0], grain: 0.06 }),

  sky: { zenith: '#0a1230', mid: '#1c2c58', horizon: '#3e5486', ground: '#101a34', glowColor: '#a8bce4', glowDir: [-0.5, 0.35, -1] },

  sun: { dir: [-0.45, 0.6, -0.8], color: '#a8bce8', intensity: 1.4, hemi: { sky: '#50649a', ground: '#141c34', intensity: 1.0 }, shadowSize: 40 },

  ground: { size: 800, segments: 100, flatRadius: 2000, hillHeight: 0, undulation: 0, plaza: NO_PLAZA, colors: flatColors('#1f3a5a') },

  mountains: { count: 26, distance: [330, 520], height: [30, 70], widthRatio: [2.2, 3.4], colors: ['#16203a', '#1b2644', '#121a32'] },

  objects: [],

  clouds: {
    layers: [
      { count: 30, distance: [160, 420], height: [50, 110], size: [50, 110], color: '#3c4a72', shade: '#121a32', drift: 0.01 },
      { count: 14, angle: [-0.9, 0.2], distance: [220, 380], height: [90, 150], size: [60, 100], color: '#7a8cb8', shade: '#1c2648', drift: 0.006 },
    ],
  },

  custom(ctx) {
    groundMesh(ctx).visible = false;
    sea(ctx, { size: 520, segs: 96, amp: 1.1, speed: 1.2, color: '#1f3a5a', crest: '#7f9ec0', calm: [{ x: 0, z: -7, r: 11, sx: 1.4 }] });
    stars(ctx, { count: 900, size: 2 });
    moon(ctx, { dir: [-0.45, 0.42, -1], size: 60, color: '#fff6e0', halo: '#8aa0d0' });

    const b = boat(ctx, { pos: [0, 0], y: 0.35, L: 10, B: 3, sail: 'none', oars: 6, walk: true, walls: false, hull: '#5e4232', trim: '#8a4a3a', deck: '#7a5a40', sailColor: '#c8c0b0' });
    rockBoat(ctx, b, { roll: 0.05, pitch: 0.03, heave: 0.12, speed: 1.2 });
    const on = (colors, x, z, opts = {}) => figure(ctx, colors, [x, z], { y: 0, parent: b.inner, ...opts });
    on(DISCIPLES[1], -0.4, -0.85, { face: JESUS, arms: [0.25, 1.4] });
    on(DISCIPLES[2], 0.6, -0.8, { face: JESUS, pose: 'kneel', arms: [0.2, 1.8] });
    on(DISCIPLES[3], -1.6, -0.6, { face: JESUS, arms: [0.4, 2.1] });
    on(DISCIPLES[4], 1.8, -0.5, { face: JESUS, pose: 'kneel' });
    on(DISCIPLES[5], -2.7, 0.2, { face: [-10, 0], arms: [0.15, 0.8] });
    on(DISCIPLES[6], 2.9, 0.3, { face: JESUS, arms: [0.3, 1.2] });
    on(DISCIPLES[7], -0.9, 0.6, { face: JESUS, pose: 'kneel', arms: [0.2, 0.9] });
    on(DISCIPLES[8], 0.9, 0.7, { face: [0.9, 10], pose: 'kneel', arms: [0.2, 0.9] });
    on(DISCIPLES[9], -3.6, -0.1, { face: JESUS, pose: 'kneel' });
    on(DISCIPLES[10], 3.7, -0.2, { face: JESUS, arms: [0.25, 1.6] });

    // Christ on the water, hand stretched out; Peter walking to Him on the waves (14:29).
    figure(ctx, CHRIST, JESUS, { face: PETER, glow: 0.55, scale: 1.15, y: 0.05, arms: [0.25, 1.45], clear: 1.2 });
    glow(ctx, [JESUS[0], 1.5, JESUS[1]], 7, '#e8f0ff', { opacity: 0.7 });
    const pool = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(JESUS[0], 0.12, JESUS[1]);
    pool.layers.set(1);
    ctx.scene.add(pool);
    const peter = figure(ctx, { ...DISCIPLES[0], arms: [0.35, 1.5] }, PETER, { face: JESUS, y: 0.0, clear: 1 });
    ctx.onFrame((t) => {
      peter.position.y = -0.08 + Math.sin(t * 1.4) * 0.06;
      peter.rotation.z = Math.sin(t * 0.9) * 0.05;
    });
  },

  light: {
    pointLights: [
      { at: JESUS, lift: 2.2, color: '#dce6ff', intensity: 16, distance: 18 },
      { at: PETER, lift: 2.0, color: '#c8d8ff', intensity: 6, distance: 6 },
      { at: [-5, -1], lift: 1.6, color: '#ffb060', intensity: 4, distance: 7 },
    ],
    glows: [{ at: [-4.4, -0.2], lift: 1.6, size: 1.6, color: '#ffc070', opacity: 0.8 }],
  },

  player: {
    start: [-1.2, 0.5],
    lookAt: [0.3, -8.6],
    colors: DISCIPLES[11],
  },
};
