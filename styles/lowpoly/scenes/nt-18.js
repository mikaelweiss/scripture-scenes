// John 11:38-44. A limestone hillside outside Bethany. The stone has been rolled from the cave tomb and
// Lazarus comes forth bound in grave clothes. Christ stands before the tomb; Martha and Mary kneel near him
// and the mourners from Jerusalem watch. -z is north toward the tomb.
import { person, house } from './lib/nt-13-kit.js';

const TOMB = [0, -16];
const CHRIST = [1.6, -6.5];
const rockColor = '#c9b48c';

export default {
  title: 'John 11:38-44: The raising of Lazarus',
  seed: 18,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [0.6, 0.55, 0.55], color: '#ffe2b4', intensity: 2.9 },
  light: { sky: '#a4b8dc', ground: '#8a7050', hemi: 1.1 },
  sky: { top: '#4b74b4', horizon: '#ecd8b8', ground: '#c8b090', sunColor: '#fff0d0', glow: 1 },
  fog: { color: '#e0cdb0', near: 70, far: 560 },
  clouds: { count: 40, shadow: '#a8a2a8', lit: '#fff4e4', rim: '#ffffff', distance: [300, 900], altitude: [110, 240], hole: 0.3 },
  mountains: { count: 40, color: '#8c7c68', radius: [540, 760], height: [30, 80], haze: 0.55 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.08, contrast: 1.07, vignette: 0.4, shadowTint: '#3a2e5e', highlightTint: '#ffe6c0' },
  shadow: { center: [0, -8], radius: 40 },

  player: { start: [-1.9, -2.4], yaw: -0.36, pitch: 0.07, eye: 1.65, speed: 4 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 18,
    hills: 36,
    bumps: 0.35,
    flats: [
      { x: 0, z: -48, r: 20, falloff: 40, height: 16 },
      { x: 0, z: 0, r: 16, falloff: 30, height: 0 },
    ],
    colors: { ground: '#b8a074', groundAlt: '#a48e66', grass: '#8a8a58', high: '#b0a07e', rock: '#9a8a6c' },
    patches: [{ x: 0, z: -6, r: 16, color: '#bfa982', strength: 0.6, rough: 0.5 }],
  },

  scatter: [
    { type: 'tree', count: 40, center: [0, 0], ring: [22, 140], spacing: 7, seed: 3, avoid: [{ rect: [0, -20, 30, 18] }], props: { kind: 'broad', leaf: '#7a8a5c', h: 4.5 } },
    { type: 'rock', count: 30, center: [0, 0], ring: [20, 160], spacing: 9, seed: 4, avoid: [{ rect: [0, -20, 30, 18] }], props: { color: '#b4a07c', size: 1.6 } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#6e5a44', '#5e4b3a', '#4a4440', '#7a4e36', '#3e3a38', '#94704e', '#6b6f4a', '#2e2a2a'],
      mantles: ['#2e2a2a', '#4a3a2c', '#3f4d5e', '#5a3d2b', '#3a3430'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.7,
      hoodChance: 0.5,
    },
    groups: [
      { count: 34, center: [1, -9], ring: [5.5, 13], arc: [-0.15, Math.PI * 0.3], spacing: 1.0, face: [0, -15], children: 0.1, kneel: 0.15, seed: 5, avoid: [{ rect: [2, 0, 7, 22] }] },
      { count: 34, center: [1, -9], ring: [5.5, 13], arc: [Math.PI * 0.7, Math.PI + 0.15], spacing: 1.0, face: [0, -15], children: 0.1, kneel: 0.15, seed: 6, avoid: [{ rect: [2, 0, 7, 22] }] },
    ],
  },

  custom(ctx) {
    const { THREE, solid } = ctx;
    const r = ctx.rand;
    const shade = (c, ny) => {
      if (ny < -0.5) c.multiplyScalar(0.55);
    };
    const block = (x, z, w, h, d, y = -0.5, color = rockColor) => {
      solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [r.range(-0.03, 0.03), r.range(-0.08, 0.08), r.range(-0.03, 0.03)], color, jitter: 0.06, shade });
      ctx.colliders.add({ x, z, w, d, bottom: y, top: y + h });
    };

    // Cliff face with the cave mouth.
    const [tx, tz] = TOMB;
    const faceZ = tz + 1.5;
    for (let x = -14; x <= 14; x += 2.2) {
      if (Math.abs(x - tx) < 1.8) continue;
      block(x, faceZ - r.range(0, 1.2) - Math.abs(x) * 0.12, 2.6, r.range(5, 8) - Math.abs(x) * 0.18, 4);
    }
    block(tx, faceZ - 0.3, 3.4, 4.5, 4, 2.3);
    solid.box(2.2, 2.6, 2.2, { position: [tx, 1.0, faceZ + 0.2], color: '#120d0a', jitter: 0 });
    solid.box(2.8, 0.25, 0.6, { position: [tx, 2.4, faceZ + 1.95], color: '#a8946c', shade });
    for (const side of [-1, 1]) solid.box(0.35, 2.6, 0.5, { position: [tx + side * 1.25, 1.05, faceZ + 1.95], color: '#b29e78', shade });
    ctx.colliders.add({ x: tx, z: faceZ + 0.2, w: 2.2, d: 2.2, bottom: -1, top: 3 });
    for (let i = 0; i < 18; i++) {
      const x = r.range(-15, 15), z = faceZ - r.range(1, 7);
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(1.4, 2.8), 0), { position: [x, r.range(5, 8.5) - Math.abs(x) * 0.15, z], scale: [1.4, 0.8, 1], rotation: [r() * 3, r() * 3, 0], color: r.pick([rockColor, '#b8a27a', '#d2c098']), jitter: 0.06 });
    }
    for (let i = 0; i < 9; i++) {
      const x = r.range(-10, 10);
      if (Math.abs(x) < 2.5) continue;
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.4, 0.9), 0), { position: [x, 0.1, faceZ + r.range(2.2, 3.5)], scale: [1.3, 0.7, 1], rotation: [0, r() * 3, 0], color: '#b8a27a', jitter: 0.06 });
    }

    // The stone, rolled aside and leaning by the mouth.
    ctx.solid.add(new THREE.CylinderGeometry(1.35, 1.35, 0.45, 12), { position: [tx - 3.2, 1.3, faceZ + 2.1], rotation: [Math.PI / 2, -0.25, 0], color: '#bca87e', jitter: 0.05 });
    ctx.colliders.add({ x: tx - 3.2, z: faceZ + 2.1, w: 2.6, d: 0.6, bottom: 0, top: 2.7 });

    // Lazarus at the threshold, bound hand and foot with grave clothes and his face bound with a napkin.
    const laz = person(ctx, { x: tx, z: faceZ + 2.5, y: 0, face: CHRIST, robe: '#ece6d6', skin: '#e4dccb', arms: 'down', scale: 1.0 });
    const bands = new THREE.MeshLambertMaterial({ color: '#c8bea6' });
    for (const [h, rad] of [[0.3, 0.29], [0.6, 0.255], [0.9, 0.225], [1.2, 0.2], [1.5, 0.15]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.03, 3, 8), bands);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = h;
      laz.add(ring);
    }
    const lazLight = new THREE.PointLight('#fff2d8', 12, 9, 1.5);
    lazLight.position.set(tx, 2.2, faceZ + 3);
    ctx.scene.add(lazLight);

    person(ctx, {
      x: CHRIST[0], z: CHRIST[1], face: [tx, faceZ + 1.7], robe: '#fbf7ee', mantle: '#efe6d2', skin: '#a8754f', arms: 'out', emissive: 0.28, scale: 1.08,
      light: { color: '#fff0cf', intensity: 16, distance: 14 },
      halo: { size: 3.6, opacity: 0.35, color: '#fff3d6' },
    });
    person(ctx, { x: CHRIST[0] - 2.2, z: CHRIST[1] + 0.8, face: [tx, faceZ + 1.7], pose: 'kneel', robe: '#7a4e5e', mantle: '#4a3a52', skin: '#a87652', hood: true });
    person(ctx, { x: CHRIST[0] + 1.8, z: CHRIST[1] + 1.2, face: [tx, faceZ + 1.7], pose: 'stand', robe: '#5e6a4a', mantle: '#3e4a36', skin: '#a87652', hood: true, arms: 'out' });

    // Bethany down the slope.
    for (let i = 0; i < 22; i++) {
      const a = r.range(0.3, Math.PI - 0.3), d = r.range(45, 110);
      house(ctx, { x: Math.cos(a) * d, z: Math.sin(a) * d + 10, rot: r.range(-0.3, 0.3), w: r.range(5, 9), d: r.range(5, 8), h: r.range(3, 4.5), color: r.pick(['#d4c098', '#c8b28a', '#dccaa6']) });
    }
  },
};
