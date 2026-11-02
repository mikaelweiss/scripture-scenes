// Luke 2:8-20: the angel of the Lord and a multitude of the heavenly host appear to shepherds by night.
// x is east, z is south. The host fills the northern sky; Bethlehem glimmers on the ridge to the northeast.
import { Batch, angels, campfire, flock, glow, house, makeRng, olive, person, stars, xf } from './lib/nt-01-kit.js';

const FIRE = [0, -2];
const ANGEL = [0, 7.5, -20];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(303);

  stars(ctx, { count: 1300, size: 2, minY: 0.05 });

  // Sheepfold of piled stone and the shepherds' fire.
  const fold = [10, -6];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    if (a > 4.4 && a < 5.0) continue;
    const x = fold[0] + Math.cos(a) * 6, z = fold[1] + Math.sin(a) * 5;
    b.add(rng() < 0.5 ? '#8a8070' : '#9a8e7a', xf(new THREE.BoxGeometry(1.6, 1, 0.8), { pos: [x, ctx.terrainHeight(x, z) + 0.45, z], rot: [0, -a + Math.PI / 2, 0] }));
    ctx.addCollider({ x, z, hx: 0.7, hz: 0.7, rot: 0, top: 1 });
  }
  campfire(b, ctx, { pos: FIRE, light: { color: '#ffa850', intensity: 12, distance: 18 } });
  for (const [x, z] of [[-6, 3], [-14, -4], [16, 6], [-22, 10]]) olive(b, ctx, { pos: [x, z], size: 1, seed: x + z });
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2, r = 35 + rng() * 120;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (!ctx.blocked(x, z, 2)) olive(b, ctx, { pos: [x, z], size: 0.8 + rng() * 0.5, seed: i + 50 });
  }
  b.add('#6b4a33', xf(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 5), { pos: [-2.5, ctx.terrainHeight(-2.5, -0.8) + 0.9, -0.8], rot: [0, 0, 0.6] }));

  // Bethlehem on its ridge.
  const town = [70, -150];
  for (let i = 0; i < 40; i++) {
    const x = town[0] + (rng() - 0.5) * 60, z = town[1] + (rng() - 0.5) * 30;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 3, 5 + rng() * 3], height: 3 + rng() * 3, rot: rng() * 3, color: '#8a7a68', trim: '#6e604e', lit: rng() < 0.5 });
  }
  b.flush();

  flock(ctx, { center: [10, -6], radius: 4.6, count: 28, seed: 4 });
  flock(ctx, { center: [-10, 4], radius: 9, count: 40, seed: 5 });
  flock(ctx, { center: [14, 14], radius: 7, count: 26, seed: 6 });

  // Shepherds startled from the fire: some fall to their knees, some shield their eyes.
  const up = { robe: '#8c6a4a', mantle: '#5e4632', skin: '#9c6a45', hair: '#e6d8b8', sash: '#c8912e', arms: [0.4, 2.4] };
  const shepherds = [
    { pos: [-1.8, -0.6], kneel: true, colors: { robe: '#7a6a52', mantle: '#d9c7a3', skin: '#8a5a3b', hair: '#2b1a12', sash: '#b5523b', arms: [0.2, 1.4] } },
    { pos: [1.9, -0.2], colors: up },
    { pos: [-2.2, -3.4], colors: { robe: '#a87b4f', mantle: '#6b5a4a', skin: '#a87650', hair: '#e6d8b8', arms: [0.3, 2.2] } },
    { pos: [2.4, -3.6], kneel: true, colors: { robe: '#6f8a6a', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', arms: [0.1, 1.2] } },
    { pos: [0.4, 1.3], scale: 0.65, colors: { robe: '#c8a97a', mantle: '#8c5a3c', skin: '#b5825a', hair: '#2b1a12', arms: [0.5, 1.8] } },
    { pos: [4.5, -1.5], colors: { robe: '#5e4632', mantle: '#c8a97a', skin: '#8a5a3b', hair: '#4a3020', sash: '#e6d8b8', arms: [0.6, 1.0] } },
  ];
  for (const s of shepherds) person(ctx, { pos: s.pos, face: [ANGEL[0], ANGEL[2]], kneel: s.kneel, scale: s.scale ?? 1, colors: s.colors });

  // The angel of the Lord, then the multitude of the heavenly host.
  angels(ctx, [{ pos: ANGEL, face: FIRE, scale: 2.3 }], { glowSize: 6, glowOpacity: 0.8, bob: 0.2, light: { pos: [0, 9, -12], color: '#fff0c8', intensity: 40, distance: 45 } });
  glow(ctx, { pos: [ANGEL[0], ANGEL[1] + 1.4, ANGEL[2]], size: 26, color: '#fff0c0', opacity: 0.45, pulse: 0.03 });
  const host = [];
  for (let i = 0; i < 110; i++) {
    const a = -1.25 + rng() * 2.5;
    const r = 30 + rng() * 60;
    const x = Math.sin(a) * r, z = -6 - Math.cos(a) * r;
    host.push({ pos: [x, 9 + rng() * 26 + r * 0.12, z], face: FIRE, scale: 1.1 + rng() * 0.5 });
  }
  angels(ctx, host, { glowSize: 5, glowOpacity: 0.45, bob: 0.4 });
}

export default {
  title: 'Luke 2:8-20: Shepherds and angels',
  subtitle: 'Night fields outside Bethlehem',
  seed: 303,
  style: {
    ink: '#0f0c18',
    toonSteps: [0.32, 0.62, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [50, 320, 260, 0.4] },
    grain: 0.06,
    fog: { color: '#1c2444', near: 60, far: 420 },
    crack: '#1a1420', ember: '#c8502c', emberHot: '#ffb347', flameOuter: '#f08a2c', flameInner: '#ffe08a', charred: '#2a1e1a', smoke: '#555060', smokeShade: '#1a1622',
  },
  sky: { zenith: '#070b20', mid: '#141e44', horizon: '#3a4470', ground: '#141826', glowColor: '#8a8aa8', glowDir: [0, 0.35, -1] },
  sun: { dir: [-0.3, 0.8, 0.5], color: '#a8b8e8', intensity: 1.0, hemi: { sky: '#5868a8', ground: '#3a2e34', intensity: 1.05 }, shadowSize: 55 },
  ground: {
    size: 1400, segments: 240, flatRadius: 75, hillHeight: 36, undulation: 0.5,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#7a7458', dirt: '#6e624a', grass: '#5a6a48', grassDark: '#46563a', plaza: '#7a7458', plazaLine: '#5a5240', scorch: '#2a1e1a', scorchEdge: '#4a3426', hill: '#4e5a44' },
  },
  mountains: { count: 30, distance: [480, 760], height: [40, 100], widthRatio: [1.8, 2.8], colors: ['#262c4a', '#2e3452', '#22283e'] },
  objects: [{ type: 'stones', count: 260, ring: [3, 70], size: [0.12, 0.4], colors: ['#7d7462', '#8a806c'] }],
  custom,
  light: {
    rayFans: [{ source: [0, 60, -20], sourceJitter: 20, target: FIRE, groundY: 1, spread: [8, 30], count: 8, width: [[2, 4], [5, 9]], color: '#fff0c4', intensity: 0.22, stripes: 9, fadeLow: 0.3 }],
    glows: [{ at: FIRE, lift: 1.5, size: 16, color: '#ffe8b0', opacity: 0.2 }],
  },
  player: {
    start: [1.2, 5.6],
    lookAt: [-0.4, -20],
    colors: { robe: '#7a6a52', mantle: '#c8a97a', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
