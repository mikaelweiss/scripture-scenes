// Helaman 5:20-52: Nephi and Lehi in a Lamanite prison, encircled about as if by fire that does not burn them.
// A cloud of darkness overshadows the three hundred Lamanites, who cry to the Lord.
// x is east, z is south. The south wall is broken low so the player can see in.
import { baseStyle, box, flames, glow, groundSpec, house, LAMANITE, merge, put, puffs, figure, cyl } from './lib/bom-31-kit.js';

const BROTHERS = [0, -12];
const FIRE_R = 3.6;

export default {
  title: 'Helaman 5:20-52: Nephi and Lehi encircled by fire',
  subtitle: 'In the prison of the Lamanites, under a cloud of darkness',
  seed: 5,

  style: baseStyle({
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [40, 200, 160, 0.5] },
    grain: 0.07,
    fog: { color: '#1a1420', near: 25, far: 160 },
    flameOuter: '#ff9a3c',
    flameInner: '#fff0b0',
  }),

  sky: { zenith: '#07050c', mid: '#120c1a', horizon: '#1e1626', ground: '#0e0a12', glowColor: '#120c1a', glowDir: [0, -1, 0] },

  sun: { dir: [0.3, 0.9, 0.2], color: '#6a5a7a', intensity: 0.7, hemi: { sky: '#3a2e4a', ground: '#1a1210', intensity: 0.7 }, shadowSize: 50 },

  ground: groundSpec({
    hillHeight: 10, flatRadius: 140, undulation: 0.12,
    plaza: { center: [0, -10], size: [40, 32] },
    colors: { sand: '#8a7a64', dirt: '#7a6a54', grass: '#6a6a4a', grassDark: '#5a5a3e', plaza: '#9a8a74', plazaLine: '#6e604e', hill: '#4a4a40' },
  }),

  objects: [
    { type: 'wall', from: [-21, -27], to: [21, -27], height: 6.5, damage: 0.05, color: '#a8957a', thickness: 1.2, rubble: 0 },
    { type: 'wall', from: [-21, -27], to: [-21, 7], height: 6.5, damage: 0.05, color: '#a8957a', thickness: 1.2, rubble: 0, seed: 3 },
    { type: 'wall', from: [21, -27], to: [21, 7], height: 6.5, damage: 0.05, color: '#a8957a', thickness: 1.2, rubble: 0, seed: 4 },
    { type: 'wall', from: [-21, 7], to: [-4, 7], height: 1.6, damage: 0.3, color: '#a8957a', thickness: 1.2, rubble: 0.6, seed: 5, fallSide: 1 },
    { type: 'wall', from: [4, 7], to: [21, 7], height: 1.6, damage: 0.3, color: '#a8957a', thickness: 1.2, rubble: 0.6, seed: 6, fallSide: 1 },
    { type: 'stones', count: 120, center: [0, -10], ring: [4, 18], size: [0.1, 0.3], colors: ['#8a7a64', '#6e604e'] },
  ],

  custom(ctx) {
    // Cells along the north wall: dark openings barred with timber.
    const dark = [], bars = [];
    for (let i = -3; i <= 3; i++) {
      const x = i * 5.4;
      dark.push(box(2.6, 3, 0.2, x, 1.5, -26.3));
      for (let b = 0; b < 5; b++) bars.push(cyl(0.07, 0.07, 3, x - 1.0 + b * 0.5, 1.5, -26.1, 5));
      bars.push(box(2.8, 0.18, 0.18, x, 3.0, -26.1));
    }
    put(ctx, merge(dark), '#0e0a12', 0, 0, { y: ctx.terrainHeight(0, -26), cast: false });
    put(ctx, merge(bars), '#4a3426', 0, 0, { y: ctx.terrainHeight(0, -26) });

    // The brothers, faces shining, in the midst of the fire.
    figure(ctx, { robe: '#efe3c2', mantle: '#c8912e', skin: '#c9905f', hair: '#3a2418', sash: '#b5523b', arms: [0.5, 1.2] }, -0.8, BROTHERS[1], { yaw: 0.3, glow: 0.6, clear: 0, scale: 1.35 });
    figure(ctx, { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#c9905f', hair: '#2b1a12', sash: '#c8912e', arms: [0.5, 1.2] }, 0.8, BROTHERS[1] - 0.2, { yaw: -0.3, glow: 0.6, clear: 0, scale: 1.35 });
    ctx.exclude({ kind: 'circle', x: BROTHERS[0], z: BROTHERS[1], r: FIRE_R + 1.6 });
    ctx.addCollider({ x: BROTHERS[0], z: BROTHERS[1], hx: FIRE_R, hz: FIRE_R, rot: 0, top: ctx.terrainHeight(...BROTHERS) + 3 });

    const ring = [];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      ring.push({ x: BROTHERS[0] + Math.sin(a) * FIRE_R, z: BROTHERS[1] + Math.cos(a) * FIRE_R, h: 0.7 + (i % 3) * 0.3, phase: i * 1.7, w: 0.9 });
    }
    flames(ctx, ring);
    glow(ctx, BROTHERS[0], 1.6, BROTHERS[1], 11, '#ffc070', 0.55, 0.06);

    // The cloud of darkness hanging over the prisoners.
    const cloud = { radius: 18, count: 26, size: [3, 6], rise: 2, color: '#120c18', shade: '#0a0610', speed: 0.012, wind: [2, 0.5], fx: true, opacity: 0.55 };
    puffs(ctx, [
      { ...cloud, pos: [-8, -16], y: 4 }, { ...cloud, pos: [10, -6], y: 4.5 }, { ...cloud, pos: [-10, 0], y: 5 }, { ...cloud, pos: [8, -20], y: 5 },
    ]);

    // Dark city houses beyond the walls.
    const homes = [[-36, -10, 0.2], [-34, 18, -0.3], [34, 16, 0.4], [38, -14, -0.2], [-12, -44, 0.1], [16, -46, -0.3], [0, 30, 0]];
    homes.forEach(([x, z, rot], i) => house(ctx, x, z, { rot, w: 7, d: 6, h: 3.5, color: '#8a7a64', roof: '#5e4632' }));
  },

  light: {
    beams: [{ from: [0, 60, -12], to: { pos: [BROTHERS[0], 0.5, BROTHERS[1]] }, width: [4.6, 4], color: '#ffd890', intensity: 0.32, layers: 2, stripes: 22, fadeLow: 0.05 }],
    rings: [{ pos: [BROTHERS[0], 0.02, BROTHERS[1]], radius: FIRE_R, width: 0.45, height: 2.6, color: '#ffb050', intensity: 0.9, wallIntensity: 0.4 }],
    pointLights: [
      { pos: [BROTHERS[0], 2.2, BROTHERS[1]], color: '#ffb868', intensity: 16, distance: 30, decay: 1.3 },
      { at: [0, 0], lift: 5, color: '#c8a0ff', intensity: 3, distance: 30, decay: 1.2 },
    ],
  },

  crowd: {
    seed: 35,
    minSpacing: 0.7,
    facing: BROTHERS,
    colors: LAMANITE,
    aisles: [{ from: [0, 8], to: [0, -6], width: 3.6 }],
    keepClear: [{ kind: 'circle', x: BROTHERS[0], z: BROTHERS[1], r: FIRE_R + 1.6 }],
    groups: [{ center: BROTHERS, radius: [FIRE_R + 1.8, 17], count: 300, kneel: 0.6, facingJitter: 0.4, lean: 0.25 }],
  },

  player: {
    start: [0, -3],
    lookAt: BROTHERS,
    colors: { robe: '#5e3020', mantle: '#8c6a3c', skin: '#8a5a3b', hair: '#1f140e', sash: '#c8912e' },
  },
};
