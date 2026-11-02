// 3 Nephi 19:4-14: Nephi baptizes the Twelve at the water's edge. They are encircled as if by fire and angels minister to them.
// The multitude stands behind in twelve bodies. x is east, z is south, the water lies to the north.
import { Batch, CROWD, GROUND, angel, ball, box, cyl, flames, glow, makeRng, person, toonStyle, water } from './lib/bom-43-kit.js';

const RING = [0, -4];
const RING_R = 4.2;
const SHORE_Z = -11;
const WATER_Y = 0.32;
const NEPHI = [9, -14.5];

const DISCIPLE = (i) => ({
  robe: ['#efe3c2', '#e6d8b8', '#f3ead2'][i % 3],
  mantle: ['#2f8f8a', '#c8912e', '#b5523b', '#4f7f80', '#6f8a6a'][i % 5],
  skin: ['#9c6a45', '#a87650', '#8a5a3b', '#b5825a'][i % 4],
  hair: '#2b1a12',
  sash: '#c8912e',
});

function bodies() {
  const groups = [];
  for (let row = 0; row < 2; row++) {
    const r = row ? 34 : 20;
    for (const a of [-1.35, -0.85, -0.35, 0.35, 0.85, 1.35]) {
      groups.push({ center: [RING[0] + Math.sin(a) * r, RING[1] + Math.cos(a) * r], radius: [0, row ? 6.3 : 4.2], count: row ? 210 : 110, kneel: 0.35, children: 0.15, facing: RING });
    }
  }
  return groups;
}

function custom(ctx) {
  const rng = makeRng(44);
  const b = new Batch(ctx);

  water(ctx, { center: [0, SHORE_Z - 160], size: [800, 320], y: WATER_Y, color: '#4f9fb0', shine: '#e6f6f2', streaks: 90 });
  ctx.exclude({ kind: 'rect', x: 0, z: SHORE_Z - 160, hx: 400, hz: 161 });
  for (let x = -120; x <= 120; x += 4) ctx.addCollider({ x, z: SHORE_Z - 13, hx: 2.2, hz: 0.6, rot: 0, top: 50 });

  for (let i = 0; i < 160; i++) {
    const x = (rng() - 0.5) * 140, z = SHORE_Z + (rng() - 0.6) * 3;
    if (Math.abs(x - NEPHI[0]) < 3) continue;
    b.add(['#cdb48a', '#a58a66', '#d9c39a', '#8a7b6a'][i % 4], ball(0.12 + rng() * 0.25, [x, ctx.terrainHeight(x, z) + 0.05, z], [1.3, 0.6, 1], 6));
  }
  for (let i = 0; i < 70; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (18 + rng() * 50), z = SHORE_Z - 0.5 - rng() * 3;
    for (let k = 0; k < 4; k++) b.add(k % 2 ? '#6c7a42' : '#8e9a58', cyl(0.02, 0.04, 1.2 + rng() * 0.8, [x + (rng() - 0.5) * 0.6, WATER_Y + 0.4, z + (rng() - 0.5) * 0.6], [(rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3], 4));
  }

  // Nephi in the water, with the next disciple to be baptized.
  person(ctx, { ...DISCIPLE(0), mantle: '#efe3c2', arms: [0.35, 0.9] }, NEPHI, [NEPHI[0] - 1, NEPHI[1] + 1], { y: -0.55, scale: 1.05, clear: 0 });
  person(ctx, { ...DISCIPLE(4), arms: [0.1, 0.4] }, [NEPHI[0] - 1, NEPHI[1] + 1], NEPHI, { y: -0.55, clear: 0 });
  b.add('#e6f6f2', cyl(1.4, 1.4, 0.02, [NEPHI[0] - 0.5, WATER_Y + 0.02, NEPHI[1] + 0.5], [0, 0, 0], 24), { glow: true, cast: false });

  // The Twelve that are baptized, standing in the circle of fire.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const p = [RING[0] + Math.sin(a) * 2.4, RING[1] + Math.cos(a) * 2.4];
    person(ctx, { ...DISCIPLE(i + 1), arms: [0.25, 0.25] }, p, RING, { glow: 0.25, clear: 0.6 });
  }
  const fire = [];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2;
    const x = RING[0] + Math.sin(a) * RING_R, z = RING[1] + Math.cos(a) * RING_R;
    fire.push({ pos: [x, ctx.terrainHeight(x, z), z], h: 1.1 + (i % 3) * 0.35, w: 0.9 });
  }
  flames(ctx, fire, { outer: '#ffb347', inner: '#fff1b8', fx: true });
  ctx.exclude({ kind: 'circle', x: RING[0], z: RING[1], r: RING_R + 1.2 });

  // Angels descending to minister.
  const angels = [[-5, 4.6, -3], [5.5, 5.6, -6], [-2, 7.4, -9], [2.2, 4.6, 0.5], [-9.5, 6.6, -8], [6.5, 7.6, -1]];
  for (const [x, y, z] of angels) angel(ctx, [x, y, z], RING, { arms: [0.8, 0.45], halo: 5 });
  glow(ctx, [RING[0], 2, RING[1]], 14, '#ffe6a8', { opacity: 0.45 });

  b.flush();
}

export default {
  title: '3 Nephi 19:4-14: The Twelve encircled by fire',
  subtitle: "At the water's edge, the multitude in twelve bodies",
  seed: 44,
  custom,

  style: toonStyle({ fog: '#e8e2c4', near: 140, far: 1100 }),

  sky: { zenith: '#2c6c8a', mid: '#78b2b8', horizon: '#f6e2b0', ground: '#d9b98a', glowColor: '#fff2c8', glowDir: [0, 0.55, -1] },

  sun: { dir: [0.7, 0.6, 0.25], color: '#fff3dc', intensity: 2.5, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.15 }, shadowSize: 70 },

  ground: {
    size: 1400, segments: 280, flatRadius: 170, hillHeight: 40, undulation: 0.12,
    plaza: { center: [0, 400], size: [1, 1] },
    colors: { ...GROUND, sand: '#dcbb80', grass: '#8ea05a', hill: '#6f9a6a' },
  },

  mountains: { count: 30, distance: [520, 820], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 120, ring: [55, 200], angle: [-1.55, 1.55], height: [5, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 300, ring: [10, 90], angle: [-1.55, 1.55], size: [0.1, 0.35], colors: ['#cdb48a', '#b89a70', '#d9c39a', '#a58a66'] },
  ],

  clouds: {
    layers: [
      { count: 40, gap: [-0.3, 0.3], distance: [380, 800], height: [90, 200], size: [35, 75], color: '#fff6e4', shade: '#5a5a72' },
      { count: 14, center: RING, distance: [40, 90], height: [120, 160], size: [22, 40], color: '#fff6e4', shade: '#7a6a62', drift: 0.004 },
    ],
  },

  light: {
    beams: [{ from: [RING[0], 170, RING[1] - 6], to: { at: RING, lift: 0.5 }, width: [16, 9], color: '#fff2c9', intensity: 0.18, layers: 2, stripes: 30, fadeLow: 0.04 }],
    rings: [{ at: RING, lift: 0, radius: RING_R, width: 0.45, height: 3.4, color: '#ffc870', intensity: 1, wallIntensity: 0.55 }],
    pointLights: [{ at: RING, lift: 2.5, color: '#ffd890', intensity: 16, distance: 22 }],
  },

  crowd: {
    seed: 44,
    minSpacing: 0.66,
    facing: RING,
    colors: CROWD,
    groups: bodies(),
  },

  player: {
    start: [0, 8.5],
    lookAt: RING,
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
