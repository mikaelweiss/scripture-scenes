// Matthew 2:1-11: the wise men find the young child with Mary in a house in Bethlehem, under the star.
// x is east, z is south. The house opens south onto the street; the star stands over it.
import { Batch, PALETTE, ball, box, brightStar, camel, glow, house, lamp, makeRng, olive, person, room, stars, torch, xf } from './lib/nt-01-kit.js';

const HOUSE = [0, -15];
const MARY = [0.4, -17];
const STAR = [0, 17, -48];
const STONES = ['#c9b08a', '#bfa47a', '#d2bc94', '#b89c74'];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(404);

  stars(ctx, { count: 1100, size: 1.8, minY: 0.06 });
  brightStar(ctx, { pos: STAR, size: 3.2 });

  // The house: one lit room open to the street, an upper room above the back.
  const { y: fy } = room(b, ctx, { pos: HOUSE, size: [11, 7.5], height: 3.3, color: '#d6c09a', floor: '#b8986c', beam: '#5a3e28', sill: 0.6 });
  b.add('#cdb48a', box(7, 2.6, 3.6, [-1.5, fy + 4.8, HOUSE[1] - 1.9]));
  b.add('#a89070', box(7.3, 0.3, 3.9, [-1.5, fy + 6.2, HOUSE[1] - 1.9]));
  b.add('#ffc15e', box(0.8, 0.9, 0.1, [-1.5, fy + 5, HOUSE[1] - 0.06]), { glow: true });
  b.add('#8c5a3c', box(1.6, 0.4, 1.2, [MARY[0], fy + 0.2, MARY[1] - 0.3]));
  lamp(b, ctx, { pos: [-3.8, HOUSE[1] - 3], y: fy + 1.2, light: { color: '#ffb060', intensity: 6, distance: 11 } });
  b.add('#8a7a62', box(0.6, 1.2, 0.6, [-3.8, fy + 0.6, HOUSE[1] - 3]));
  lamp(b, ctx, { pos: [4, HOUSE[1] - 3], y: fy + 1.2, light: null });
  b.add('#8a7a62', box(0.6, 1.2, 0.6, [4, fy + 0.6, HOUSE[1] - 3]));

  b.add('#8a2a3a', box(6, 0.04, 3.6, [0.4, fy + 0.02, -15.6]), { cast: false });
  b.add('#c8912e', box(5.5, 0.05, 3.1, [0.4, fy + 0.03, -15.6]), { cast: false });
  b.add('#7a2f5a', box(5, 0.06, 2.6, [0.4, fy + 0.04, -15.6]), { cast: false });
  const fill = new THREE.PointLight('#ffc27a', 9, 14, 1.2);
  fill.position.set(0.4, fy + 2.4, HOUSE[1] + 2.4);
  ctx.scene.add(fill);

  // The gifts: gold, frankincense, myrrh.
  b.add('#e0b040', box(0.5, 0.35, 0.35, [-0.9, fy + 0.18, -14.9]), { emissive: '#6a4a10' });
  b.add('#8a5a2c', box(0.56, 0.08, 0.4, [-0.9, fy + 0.4, -14.9]));
  b.add('#d8d0c0', xf(new THREE.CylinderGeometry(0.16, 0.2, 0.45, 10), { pos: [0.5, fy + 0.23, -14.6] }), { emissive: '#3a3a30' });
  b.add('#b5523b', ball(0.2, [0.5, fy + 0.52, -14.6], [1, 0.7, 1], 8));
  b.add('#4f7f80', xf(new THREE.CylinderGeometry(0.12, 0.2, 0.55, 8), { pos: [1.6, fy + 0.28, -14.9] }));
  b.add('#e0b040', ball(0.08, [1.6, fy + 0.6, -14.9], [1, 1, 1], 6), { emissive: '#6a4a10' });
  glow(ctx, { pos: [-0.9, fy + 0.4, -14.9], size: 1.2, color: '#ffd27a', opacity: 0.5 });

  // The street.
  for (let z = -4; z < 60; z += 7.6) {
    for (const side of [-1, 1]) {
      const w = 5.6 + rng() * 1.6, d = 6 + rng() * 1.5;
      house(b, ctx, { pos: [side * 10.5, z], size: [d, w], height: 3.4 + rng() * 2.6, rot: -side * Math.PI / 2, color: STONES[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.4, lit: rng() < 0.5 });
    }
  }
  house(b, ctx, { pos: [-11, -16], size: [8, 9], height: 4.5, color: '#c9b08a', trim: '#a89070', upper: true, lit: true, rot: Math.PI / 2 });
  house(b, ctx, { pos: [11.5, -16], size: [8, 9], height: 3.8, color: '#bfa47a', trim: '#a89070', lit: false, rot: -Math.PI / 2 });
  for (let i = 0; i < 80; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (19 + rng() * 55);
    const z = 60 - rng() * 120;
    if (ctx.blocked(x, z, 3)) continue;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 3, 5 + rng() * 3], height: 3 + rng() * 3, rot: Math.floor(rng() * 4) * Math.PI / 2, color: STONES[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.3, lit: rng() < 0.3 });
  }
  for (let i = 0; i < 24; i++) {
    const x = (rng() - 0.5) * 160, z = -30 - rng() * 60;
    if (!ctx.blocked(x, z, 2)) olive(b, ctx, { pos: [x, z], size: 0.9 + rng() * 0.4, seed: i + 3 });
  }

  // The caravan from the east waits in the street.
  camel(b, ctx, { pos: [-4.6, -3], rot: 0.4, couched: true, load: '#7a2f5a' });
  camel(b, ctx, { pos: [6.6, 2], rot: -0.3, load: '#c8912e' });
  camel(b, ctx, { pos: [5, 8], rot: 3.0, couched: true, load: '#2f5f8a' });
  for (const [x, z] of [[-5.6, -9.5], [5.6, -9.5]]) torch(b, ctx, { pos: [x, z], light: { color: '#ffa850', intensity: 7, distance: 13 } });
  b.flush();

  // Mary with the child, Joseph beside her, and the three wise men bowing before them.
  person(ctx, { pos: MARY, face: [0, 0], kneel: true, y: fy + 0.3, colors: { robe: '#4f7f9a', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', sash: '#c8912e', arms: [0.15, 0.9] } });
  const child = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8).scale(1, 1.4, 1), ctx.kit.toon('#f6f0e2', { emissive: '#4a4436' }));
  child.position.set(MARY[0], fy + 0.3 + 0.82, MARY[1] + 0.32);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), ctx.kit.toon('#c99a70'));
  head.position.set(MARY[0], fy + 0.3 + 1.08, MARY[1] + 0.34);
  ctx.scene.add(child, head);
  glow(ctx, { pos: [MARY[0], fy + 1.2, MARY[1] + 0.3], size: 2.6, color: '#fff0c0', opacity: 0.55 });
  person(ctx, { pos: [2.4, -17.6], face: [0, -13], y: fy, scale: 1.05, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', sash: '#c8912e', arms: [0.1, 0.3] } });
  const magi = [
    { pos: [-1.0, -14.3], colors: { robe: '#5a2a6a', mantle: '#c8912e', skin: '#7a4e33', hair: '#e9c46a', sash: '#e9c46a', arms: [0.2, 1.3] } },
    { pos: [0.5, -13.9], colors: { robe: '#8a2a2a', mantle: '#2f5f8a', skin: '#a87650', hair: '#e6d8b8', sash: '#e9c46a', arms: [0.2, 1.3] } },
    { pos: [1.9, -14.3], colors: { robe: '#2f6a5a', mantle: '#d9b860', skin: '#5a3a22', hair: '#b5523b', sash: '#e9c46a', arms: [0.2, 1.3] } },
  ];
  for (const m of magi) person(ctx, { pos: m.pos, face: MARY, kneel: true, y: fy, colors: m.colors });
  for (const [x, z, c] of [[-5.5, -2.5, '#7a6a52'], [4.4, 4.5, '#5e4632'], [6.2, 6, '#8c5a3c']]) {
    person(ctx, { pos: [x, z], face: HOUSE, colors: { robe: c, mantle: '#d9c7a3', skin: '#8a5a3b', hair: '#d9c7a3', sash: '#b5523b', arms: [0.1, 0.2] } });
  }
}

export default {
  title: 'Matthew 2:1-11: The wise men',
  subtitle: 'A house in Bethlehem, under the star',
  seed: 404,
  style: {
    ink: '#120c16',
    toonSteps: [0.32, 0.62, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [50, 320, 260, 0.4] },
    grain: 0.06,
    fog: { color: '#1c2444', near: 50, far: 360 },
    crack: '#1a1420', ember: '#c8502c', emberHot: '#ffb347', flameOuter: '#f08a2c', flameInner: '#ffe08a', charred: '#2a1e1a', smoke: '#555060', smokeShade: '#1a1622',
  },
  sky: { zenith: '#060a1e', mid: '#121a3e', horizon: '#2c3864', ground: '#141826', glowColor: '#6a74a8', glowDir: [0, 0.4, -1] },
  sun: { dir: [-0.2, 0.8, -0.6], color: '#a8b8e8', intensity: 1.1, hemi: { sky: '#4a5a90', ground: '#2a2232', intensity: 0.8 }, shadowSize: 55 },
  ground: {
    size: 1200, segments: 220, flatRadius: 110, hillHeight: 40, undulation: 0.15,
    plaza: { center: [0, 20], size: [12, 70] },
    colors: { sand: '#a89070', dirt: '#957a5a', grass: '#7a7a58', grassDark: '#5c5c44', plaza: '#a8987a', plazaLine: '#7d6c54', scorch: '#2a1e1a', scorchEdge: '#4a3426', hill: '#6e6a58' },
  },
  mountains: { count: 28, distance: [450, 750], height: [40, 90], widthRatio: [1.8, 2.8], colors: ['#2e3452', '#343a5a', '#2a3048'] },
  objects: [{ type: 'stones', count: 120, ring: [3, 50], size: [0.1, 0.3], colors: ['#a0865e', '#b49a74'] }],
  custom,
  light: {
    beams: [{ from: [STAR[0], STAR[1], STAR[2]], to: [0, 1, -15.5], width: [1.2, 6], color: '#fff2c9', intensity: 0.2, layers: 3, stripes: 18, fadeLow: 0.05 }],
  },
  crowd: {
    seed: 14,
    minSpacing: 1.1,
    facing: [0, -15],
    colors: PALETTE,
    aisles: [{ from: [0, 60], to: [0, -12], width: 2.6 }],
    groups: [{ shape: 'rect', center: [0, 30], size: [9, 40], count: 10, facingJitter: 1.5, children: 0.3 }],
  },
  player: {
    start: [1, -7.6],
    lookAt: [0.2, -16],
    colors: { robe: '#6b5a4a', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
