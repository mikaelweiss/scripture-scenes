// Alma 51:33-34: by night Teancum and his servant steal into the Lamanite camp by the seashore
// and come to the tent of Amalickiah. The sea lies east (+x), the moon low over it.
import { army, arm, baseStyle, campfire, figure, glow, groundSpec, hills, LAMANITE, moon, sea, stars, tent } from './lib/bom-31-kit.js';

const TENT = [8, -22];
const TEANCUM = [7.2, -15.2];

export default {
  title: 'Alma 51:33-34: Teancum slays Amalickiah',
  subtitle: 'The Lamanite camp by the seashore, at night',
  seed: 51,

  style: baseStyle({
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [50, 300, 260, 0.5] },
    grain: 0.06,
    fog: { color: '#1e2a48', near: 50, far: 420 },
    smoke: '#3a3a48',
    smokeShade: '#1a1a24',
  }),

  sky: { zenith: '#070d22', mid: '#16244a', horizon: '#33456e', ground: '#151a28', glowColor: '#2a3a66', glowDir: [0.6, 0.2, -0.8] },

  sun: { dir: [0.55, 0.5, -0.65], color: '#b6c6f0', intensity: 1.35, hemi: { sky: '#4a5a8a', ground: '#2a2018', intensity: 0.85 }, shadowSize: 60 },

  ground: groundSpec({
    hillHeight: 0, flatRadius: 600, undulation: 0.2,
    colors: { sand: '#c9b48a', dirt: '#a8906a', grass: '#7a8a5a', grassDark: '#5e6e44', hill: '#5e7a6a' },
  }),

  objects: [
    { type: 'trees', count: 60, ring: [70, 220], angle: [Math.PI * 0.95, Math.PI * 2.05], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#4a3426', leafColors: ['#2f5e52', '#3a6a5a', '#284e48'] },
    { type: 'stones', count: 200, ring: [5, 80], size: [0.12, 0.35], colors: ['#9a8a70', '#8a7a62'] },
  ],

  custom(ctx) {
    stars(ctx);
    moon(ctx, [0.6, 0.17, -0.8], { size: 55 });
    sea(ctx, { edge: 58, side: 1, axis: 'x', level: 0.25, color: '#1d4466', deep: '#8fa8d0', foam: '#c8d4e8', waves: 90 });
    hills(ctx, { angle: [Math.PI * 1.05, Math.PI * 1.95], colors: ['#2e3e5a', '#34465e', '#2a3850'], height: [40, 110] });

    // Amalickiah's great tent with a lamp glowing through the door.
    tent(ctx, TENT[0], TENT[1], { w: 7, d: 9, h: 4.4, rot: 0.15, color: '#8c3a28', open: '#ffb860' });
    glow(ctx, TENT[0] + 0.6, 1.4, TENT[1] + 4.6, 4, '#ffb050', 0.6, 0.1);
    for (const [dx, dz] of [[-4.5, 5.5], [4.6, 4.8]]) {
      const x = TENT[0] + dx, z = TENT[1] + dz;
      campfire(ctx, x, z, { size: 0.5, glowSize: 4 });
    }

    // The rest of the camp, weary and asleep.
    const tents = [
      [-18, -18, 0.4], [-26, -4, 1.2], [-14, 4, -0.3], [24, -34, 0.6], [30, -10, 1.4], [26, 6, -0.2], [-6, -44, 0.1], [14, -50, -0.5],
      [-30, -36, 0.8], [40, -26, 1.5], [-38, 10, 0.3], [36, 22, -0.8], [-20, -58, 0.5], [4, -66, 0.2], [-44, -20, 1.0], [44, 2, 1.1],
    ];
    tents.forEach(([x, z, rot], i) => tent(ctx, x, z, { rot, w: 3 + (i % 2), d: 4, h: 2.2 + (i % 3) * 0.2, color: ['#a87b4f', '#8c5a3c', '#7a6a52', '#9c6b4e'][i % 4] }));
    const fires = [[-8, -6], [18, -14], [-22, -28], [16, -38], [-2, 14], [32, -24], [-34, 0], [28, 14]];
    fires.forEach(([x, z], i) => campfire(ctx, x, z, { size: 0.9, light: i < 4 ? 9 : 0, glowSize: 6 }));
    fires.forEach(([x, z], i) => army(ctx, { center: [x, z], radius: [2.4, 5.5], count: 12, kneel: 1, lean: 0.9, weapons: false, helmets: false, colors: LAMANITE, seed: 20 + i, facing: [x, z], jitterYaw: 0.8 }));

    // Guards by the tent, overcome with sleep.
    army(ctx, { center: [TENT[0] - 5, TENT[1] + 1], radius: [0, 1.5], count: 3, kneel: 1, lean: 1, helmets: false, colors: LAMANITE, seed: 7, jitterYaw: 6 });
    army(ctx, { center: [TENT[0] + 5.5, TENT[1] - 1], radius: [0, 1.5], count: 2, kneel: 1, lean: 1, helmets: false, colors: LAMANITE, seed: 8, jitterYaw: 6 });

    // Teancum at the tent door, javelin in hand.
    const t = figure(ctx, { robe: '#6a7a9a', mantle: '#3e4a6a', skin: '#a8724a', hair: '#1f140e', sash: '#c8912e', arms: [0.3, 1.1] }, TEANCUM[0], TEANCUM[1], { face: [TENT[0] + 0.6, TENT[1] + 3], scale: 1.15 });
    arm(t, ctx, { shield: '#5a6a8a', rim: '#c8912e', spear: '#6b4a33' });
    // His servant keeping watch behind him.
    figure(ctx, { robe: '#5a6680', mantle: '#34405a', skin: '#9c6a45', hair: '#1f140e', sash: '#7a6a52', arms: [0.25, 0.3] }, TEANCUM[0] - 2.2, TEANCUM[1] + 1.6, { face: [0, 0], scale: 1.0 });
  },

  crowd: {
    seed: 32,
    minSpacing: 0.8,
    facing: [0, 0],
    colors: LAMANITE,
    groups: [
      { center: [-8, -6], radius: [1.6, 2.4], count: 4, kneel: 1, facingJitter: 0.4, facing: [-8, -6] },
      { center: [18, -14], radius: [1.6, 2.4], count: 3, kneel: 1, facingJitter: 0.4, facing: [18, -14] },
      { center: [-22, -28], radius: [1.6, 2.4], count: 4, kneel: 1, facingJitter: 0.4, facing: [-22, -28] },
      { center: [16, -38], radius: [1.6, 2.4], count: 4, kneel: 1, facingJitter: 0.4, facing: [16, -38] },
      { center: [32, -24], radius: [1.6, 2.4], count: 3, kneel: 1, facingJitter: 0.4, facing: [32, -24] },
      { center: [-34, 0], radius: [1.6, 2.4], count: 4, kneel: 1, facingJitter: 0.4, facing: [-34, 0] },
      { center: [5, -30], radius: [20, 60], angle: [-3.1, 3.1], count: 40, kneel: 0.7, facingJitter: 6 },
    ],
  },

  player: {
    start: [3, -5],
    lookAt: [TENT[0] + 2, TENT[1]],
    colors: { robe: '#3a4458', mantle: '#2b2a3a', skin: '#a8724a', hair: '#1f140e', sash: '#5e4632' },
  },
};
