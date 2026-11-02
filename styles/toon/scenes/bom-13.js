// Jacob 7: Sherem demands a sign and is struck down before the people in the city square.
import { BASE_STYLE, GROUND_COLORS, ROBES, figure, glow, house, makeRng, between, raiseArm } from './lib/bom-13-kit.js';

const SHEREM = [0.6, -3];
const JACOB = [0, -8.5];

const JACOB_COLORS = { robe: '#efe3c2', mantle: '#3e6e8e', skin: '#a8724a', hair: '#4a3020', sash: '#c8912e' };
const SHEREM_COLORS = { robe: '#6b2f4a', mantle: '#c8912e', skin: '#b5825a', hair: '#2b1a12', sash: '#efe3c2' };

function houses(ctx) {
  const rng = makeRng(13);
  const ring = [];
  for (let side = 0; side < 4; side++) {
    for (let i = -2; i <= 2; i++) {
      if (side === 2 && Math.abs(i) < 1) continue;
      if (side === 0 && Math.abs(i) < 1) continue;
      const t = i * 9 + between(rng, [-1, 1]);
      const off = 27 + between(rng, [0, 3]);
      const [x, z] = [[t, -off], [off, t], [t, off], [-off, t]][side];
      const rot = [0, -Math.PI / 2, Math.PI, Math.PI / 2][side];
      ring.push({ pos: [x, z], rot, size: [between(rng, [6, 8.5]), between(rng, [5, 7])] });
    }
  }
  const walls = ['#e3cfa6', '#d9c49a', '#cdb48a', '#e8d6ae'];
  const roofs = ['#b98a5a', '#a87b4f', '#c49a68'];
  const trims = [['#b5523b', '#efe3c2'], ['#2f8f8a', '#efe3c2'], ['#c8912e', '#efe3c2']];
  for (const h of ring) {
    house(ctx, {
      ...h,
      height: between(rng, [3.4, 4.2]),
      stories: rng() < 0.3 ? 2 : 1,
      color: walls[Math.floor(rng() * walls.length)],
      roof: roofs[Math.floor(rng() * roofs.length)],
      trim: rng() < 0.6 ? trims[Math.floor(rng() * trims.length)] : null,
    });
  }
}

export default {
  title: 'Jacob 7: Sherem confronts Jacob',
  subtitle: 'The city square of the Nephites, Sherem struck down',
  seed: 13,

  style: { ...BASE_STYLE, fog: { color: '#f0dcb4', near: 120, far: 900 } },

  sky: { zenith: '#3f78a0', mid: '#7fb0c4', horizon: '#f3dcae', ground: '#d9b98a', glowColor: '#fff2c8', glowDir: [0.4, 0.5, -1] },

  sun: { dir: [0.45, 0.8, 0.4], color: '#fff2da', intensity: 2.6, hemi: { sky: '#d6e6ee', ground: '#b07a52', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1200, segments: 240, flatRadius: 120, hillHeight: 30, undulation: 0.2,
    plaza: { center: [0, 0], size: [50, 50] },
    colors: GROUND_COLORS,
  },

  mountains: { count: 30, distance: [480, 760], height: [60, 150], widthRatio: [1.4, 2.4], colors: ['#7aa08a', '#6f9a8a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid', pos: [0, -62], base: [30, 30], tiers: 4, tierHeight: 3.2, inset: 2.6,
      stair: { width: 7, extra: 3, rise: 0.42 }, shrine: { size: [10, 8, 5.5], comb: 3 }, rubble: 0,
      colors: { stone: '#e3cfa6', stair: '#d8c095', shrine: '#b5523b', interior: '#2b1a12', fret: ['#b5523b', '#efe3c2'], roofFret: ['#2f8f8a', '#efe3c2'] },
    },
    { type: 'platform', pos: [0, -9.5], tiers: [{ size: [5, 3.2], height: 0.7 }], stairWidth: 2.4, rise: 0.25, stairDepth: 0.4, colors: { stone: '#e8d6ae', stair: '#dcc69a', fret: ['#2f8f8a', '#efe3c2'] } },
    { type: 'trees', count: 120, ring: [55, 220], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 120, ring: [26, 60], size: [0.12, 0.35], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],

  custom(ctx) {
    houses(ctx);
    const jacob = figure(ctx, JACOB_COLORS, JACOB, { facing: [0, 20], scale: 1.04 });
    raiseArm(ctx, jacob, JACOB_COLORS, 1, 2.5);
    figure(ctx, SHEREM_COLORS, SHEREM, { facing: [8, -3], pose: 'lying', clear: 1.8 });
    const y = ctx.groundHeight(SHEREM[0], SHEREM[1]);
    glow(ctx, [SHEREM[0], y + 0.4, SHEREM[1]], 4, '#fff0c4', 0.35);
  },

  clouds: {
    layers: [
      { count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a5a78' },
    ],
  },

  crowd: {
    seed: 7,
    minSpacing: 0.62,
    facing: SHEREM,
    colors: ROBES,
    aisles: [{ from: [0, 30], to: [0, 2], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: 0.3, z: -4.5, r: 4.6 }, { kind: 'rect', x: 0, z: -9.5, hx: 3.4, hz: 2.6 }],
    groups: [
      { center: [0.3, -4.5], radius: [5, 20], angle: [-2.35, 2.35], count: 480, kneel: 0.08, children: 0.12 },
    ],
  },

  player: {
    start: [0, 3.5],
    lookAt: [0, -5],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
