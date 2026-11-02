// D&C 138: the vision of the redemption of the dead. The Savior appears among the righteous spirits
// and organizes messengers, who carry the gospel across the gulf to the spirits in darkness.
// Symbolic setting: a luminous floor under a starry sky. x is east, z is south. The gulf lies to the east.
import { Batch, baseStyle, box, cyl, glow, heavenly, makeRng, stars } from './lib/dc-08-kit.js';

const LORD = [0, -30];
const GULF_X = 42;

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(138);
  stars(ctx, { count: 1400, size: 1.8, minY: 0.12 });

  // A low round dais where the Savior stands.
  const [lx, lz] = LORD;
  b.add('#f4ecd8', cyl(6, 6.3, 0.6, [lx, 0.3, lz], [0, 0, 0], 40));
  b.add('#fbf6ea', cyl(3.6, 3.8, 0.8, [lx, 1.0, lz], [0, 0, 0], 40));
  ctx.addCollider({ x: lx, z: lz, hx: 4.6, hz: 4.6, rot: 0, top: 0.6, walkable: true });
  ctx.addCollider({ x: lx, z: lz, hx: 2.7, hz: 2.7, rot: 0, top: 1.4, walkable: true });

  // The gulf: a dark rift running north and south, and a bridge of light across it.
  b.add('#0c0c16', box(20, 0.06, 700, [GULF_X, 0.05, 0]), { glow: true });
  for (const sx of [-1, 1]) b.add('#2a2a3a', box(0.6, 0.12, 700, [GULF_X + sx * 10, 0.07, 0]), { cast: false });
  ctx.addCollider({ x: GULF_X, z: (lz - 1.6 - 350) / 2, hx: 10, hz: (lz - 1.6 + 350) / 2, rot: 0, top: 0.8 });
  ctx.addCollider({ x: GULF_X, z: (lz + 1.6 + 350) / 2, hx: 10, hz: (350 - lz - 1.6) / 2, rot: 0, top: 0.8 });
  b.add('#ffe8b0', box(GULF_X - 6, 0.08, 2.8, [(GULF_X + 18) / 2 + 3, 0.09, lz]), { glow: true });
  b.add('#fff4d8', box(26, 0.1, 1.2, [GULF_X + 13, 0.1, lz]), { glow: true });
  for (let i = 0; i < 40; i++) {
    const z = -160 + rng() * 260;
    glow(ctx, { pos: [GULF_X + (rng() - 0.5) * 8, 2 + rng() * 5, z], size: 12 + rng() * 10, color: '#141420', opacity: 0.7, pulse: 0.03, additive: false });
  }
  const arch = new THREE.QuadraticBezierCurve3(new THREE.Vector3(GULF_X - 13, 0, lz), new THREE.Vector3(GULF_X, 11, lz), new THREE.Vector3(GULF_X + 13, 0, lz));
  b.add('#fff2c8', new THREE.TubeGeometry(arch, 32, 0.45, 8), { glow: true, cast: false });
  for (let i = 0; i <= 8; i++) {
    const p = arch.getPoint(i / 8);
    glow(ctx, { pos: [p.x, p.y, p.z], size: 5, color: '#ffe6a8', opacity: 0.5, pulse: 0.06 });
  }
  for (let i = 0; i < 12; i++) glow(ctx, { pos: [GULF_X - 6 + i * 2.6, 0.4, lz], size: 2.6, color: '#ffe6a8', opacity: 0.45, pulse: 0.08 });
  b.flush();

  // The Savior in white, with light about him.
  heavenly(ctx, { pos: LORD, y: 1.4, face: [-30, -12], scale: 1.7, glowAmt: 0.75, halo: 10, light: { color: '#fff0c8', intensity: 30, distance: 30 }, arms: [0.6, 0.35] });

  // Drifting motes of light over the gathering.
  const n = 260;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2, r = rng() * 50;
    pos[i * 3] = lx + Math.sin(a) * r;
    pos[i * 3 + 1] = 2 + rng() * 18;
    pos[i * 3 + 2] = lz + Math.cos(a) * r;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(g, new THREE.PointsMaterial({ color: '#fff0c0', size: 3, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  motes.layers.set(1);
  ctx.scene.add(motes);
  ctx.onFrame((t) => {
    motes.position.y = Math.sin(t * 0.3) * 0.8;
    motes.rotation.y = t * 0.01;
  });
}

const RIGHTEOUS = {
  robes: ['#f4efe2', '#ece4d0', '#e6dcc4', '#f8f4ea', '#dcd2bc', '#efe6d0'],
  mantles: ['#f8f4ea', '#e6dcc4', '#efe6d0', '#fbf8ef'],
  skins: ['#8a5a3b', '#c08f66', '#e8c4a0', '#a87650', '#f0d0b0', '#7a4e33', '#d2a882'],
  hair: ['#2b1a12', '#5a3a22', '#8a8a88', '#d8d4cc', '#3a2418', '#7a5a3a'],
  wraps: ['#f8f4ea', '#ece4d0', '#fbf8ef'],
};
const PRISON = {
  robes: ['#5e5e6c', '#4e4e5c', '#6a6672', '#44444e', '#585868'],
  mantles: ['#4a4a56', '#3e3e4a', '#5a5662'],
  skins: ['#6a5a50', '#7a6658', '#5a4a40', '#8a7464'],
  hair: ['#1e1a1a', '#2a2626', '#3a3434'],
  wraps: ['#4a4a56', '#3e3e4a'],
};

export default {
  title: 'D&C 138: The redemption of the dead',
  subtitle: 'The spirit world. The Savior organizes the righteous and sends messengers',
  seed: 138,

  style: baseStyle({ color: '#3a4268', near: 90, far: 520 }, { ink: '#1e1a2a' }),

  sky: { zenith: '#0c1230', mid: '#28335e', horizon: '#a89c8c', ground: '#3a4268', glowColor: '#8a84a0', glowDir: [0, 0.12, -1] },

  sun: {
    dir: [0.2, 0.9, 0.4],
    color: '#fff4dc',
    intensity: 1.6,
    hemi: { sky: '#c8d0f0', ground: '#d8c8a0', intensity: 1.2 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 200,
    flatRadius: 600,
    hillHeight: 0,
    undulation: 0.12,
    plaza: { center: [GULF_X + 130, 0], size: [252, 900] },
    colors: {
      sand: '#c4c0d0', dirt: '#bcb8ca', grass: '#c8c4d4', grassDark: '#b0acc0', plaza: '#3a3a4c',
      plazaLine: '#343446', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c4c0d0',
    },
  },

  objects: [],
  custom,

  light: {
    beams: [{ from: [0, 190, -30], to: { at: LORD, lift: 1.5 }, width: [12, 5], color: '#fff2c9', intensity: 0.22, layers: 3, stripes: 26, fadeLow: 0.04 }],
    rings: [{ at: LORD, lift: 1.0, radius: 3.3, width: 0.3, height: 2.4, color: '#ffd98a', intensity: 0.8, wallIntensity: 0.4 }],
    glows: [{ at: LORD, lift: 2, size: 20, color: '#fff3d0', opacity: 0.4 }],
    pointLights: [{ at: [GULF_X + 30, lz(0)], lift: 3, color: '#ffe0a0', intensity: 12, distance: 30 }],
  },

  crowd: {
    seed: 21,
    minSpacing: 0.7,
    facing: LORD,
    colors: RIGHTEOUS,
    aisles: [{ from: [0, 40], to: [0, -24], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: LORD[0], z: LORD[1], r: 6.6 }],
    groups: [
      { center: LORD, radius: [7, 32], angle: [-Math.PI, 1.38], count: 850, kneel: 0.25, children: 0.1 },
      { center: LORD, radius: [7, 32], angle: [1.76, Math.PI], count: 330, kneel: 0.25, children: 0.1 },
      { shape: 'rect', center: [(8 + GULF_X + 14) / 2, LORD[1]], size: [GULF_X + 6, 2.2], count: 50, insideClear: true, facing: [2000, LORD[1]], facingJitter: 0.1, lean: 0.12 },
      { shape: 'rect', center: [GULF_X + 42, LORD[1] - 20], size: [60, 170], count: 900, kneel: 0.15, colors: PRISON, facing: [GULF_X, LORD[1]], facingJitter: 0.8 },
    ],
  },

  player: {
    start: [9, -12],
    lookAt: [30, -80],
    colors: { robe: '#efe6d0', mantle: '#f8f4ea', skin: '#c08f66', hair: '#3a2418', sash: '#e6dcc4' },
  },
};

function lz(v) {
  return LORD[1] + v;
}
