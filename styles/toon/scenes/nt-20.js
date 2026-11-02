// Matthew 21:1-11: Jesus rides into Jerusalem on a colt while the multitude spreads garments and palm branches in the way.
// x is east, z is south. The road runs north from the Mount of Olives to the city gate at z = -78.
import { Batch, DAY_STYLE, PALETTE, animal, box, city, glow, makeRng, olive, palm, palmWaver, person, temple, xf } from './lib/nt-19-kit.js';

const JESUS = [0, -20];
const GATE_Z = -78;
const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#4a3020', sash: '#e9dcc0' };

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(20);

  city(b, ctx, { wall: [[150, GATE_Z], [-150, GATE_Z]], gate: 150, depth: 70, count: 70, height: 9, seed: 21, towers: 7, skip: (x, z) => Math.abs(x - 26) < 50 && z < -150 });
  temple(b, ctx, { pos: [26, -195], scale: 0.9 });

  // Garments and cut branches strewn on the road ahead of and behind the colt.
  const cloth = ['#b5523b', '#c8912e', '#4f7f80', '#6f8a6a', '#e6d8b8', '#8c5a3c', '#3e6e66', '#a64b35', '#d9c7a3', '#7a3a5a'];
  for (let z = 14; z > -70; z -= 0.9 + rng() * 0.7) {
    const x = (rng() - 0.5) * 4.2;
    const y = ctx.terrainHeight(x, z);
    const g = box(1.2 + rng() * 0.6, 0.06, 0.8 + rng() * 0.5, [x, y + 0.04 + rng() * 0.03, z], [0, rng() * 3, 0]);
    b.add(cloth[Math.floor(rng() * cloth.length)], g, { cast: false });
    if (rng() < 0.8) {
      const fx = (rng() - 0.5) * 5, fz = z + (rng() - 0.5);
      const f = xf(new THREE.ConeGeometry(0.22, 1.6, 4), { pos: [fx, ctx.terrainHeight(fx, fz) + 0.06, fz], rot: [Math.PI / 2, rng() * 6.28, 0], scale: [1, 1, 0.15] });
      b.add(rng() < 0.5 ? '#5f9e5a' : '#4a8a4e', f, { cast: false, emissive: '#1f3a1c' });
    }
  }

  for (let z = 30; z > -66; z -= 9 + rng() * 6) {
    for (const s of [-1, 1]) palm(b, ctx, { pos: [s * (11 + rng() * 4), z], height: 8 + rng() * 3, lean: 0.1 + rng() * 0.2, dir: rng() * 6.28, seed: Math.floor(rng() * 999) });
  }
  for (let i = 0, n = 0; n < 90 && i < 600; i++) {
    const x = (rng() - 0.5) * 220, z = -70 + rng() * 210;
    if (Math.abs(x) < 18 || ctx.blocked(x, z, 1)) continue;
    olive(b, ctx, { pos: [x, z], size: 0.9 + rng() * 0.5, seed: i });
    n++;
  }

  // The colt with its rider, and the disciples who brought it.
  animal(b, ctx, { kind: 'donkey', pos: JESUS, rot: Math.PI, color: '#7a6a5a' });
  const back = ctx.terrainHeight(...JESUS) + 1.25;
  b.add('#b5523b', box(0.9, 0.08, 1.0, [JESUS[0], back, JESUS[1] + 0.05]));
  for (const sx of [-1, 1]) b.add('#b5523b', box(0.06, 0.5, 0.9, [JESUS[0] + sx * 0.45, back - 0.24, JESUS[1] + 0.05], [0, 0, sx * 0.12]));
  b.add('#e0b040', box(0.92, 0.05, 0.12, [JESUS[0], back + 0.05, JESUS[1] - 0.4]));
  b.flush();
  const rider = person(ctx, { pos: [JESUS[0], JESUS[1] + 0.1], y: ctx.terrainHeight(...JESUS) + 1.1, kneel: true, face: [JESUS[0], JESUS[1] - 10], scale: 1.1, glow: 0.35, colors: { ...CHRIST, arms: [0.35, 0.7] } });
  rider.scale.y = 0.78;
  glow(ctx, { pos: [JESUS[0], ctx.terrainHeight(...JESUS) + 2.2, JESUS[1]], size: 5, color: '#fff3d0', opacity: 0.45 });
  const disc = [
    { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' },
    { robe: '#6f8a6a', mantle: '#d9c7a3', skin: '#a87650', hair: '#3a2418' },
    { robe: '#c8a97a', mantle: '#8c5a3c', skin: '#8a5a3b', hair: '#1f140e' },
    { robe: '#4f7f80', mantle: '#c8a97a', skin: '#b5825a', hair: '#4a3020' },
  ];
  [[-1.3, -21.6], [1.3, -21.2], [-1.5, -17.8], [1.5, -18]].forEach((p, i) => person(ctx, { pos: p, face: [p[0], -60], colors: disc[i] }));

  // Palm-waving children and adults along both edges.
  const palette = PALETTE;
  for (let i = 0; i < 46; i++) {
    const s = i % 2 ? 1 : -1;
    const z = 6 - rng() * 56;
    const x = s * (3.3 + rng() * 0.8);
    if (ctx.blocked(x, z, 0.3)) continue;
    const child = rng() < 0.35;
    palmWaver(ctx, {
      pos: [x, z],
      face: JESUS,
      scale: child ? 0.65 : 0.95 + rng() * 0.1,
      colors: { robe: palette.robes[Math.floor(rng() * 12)], mantle: palette.mantles[Math.floor(rng() * 8)], skin: palette.skins[Math.floor(rng() * 6)], hair: palette.hair[Math.floor(rng() * 4)] },
    });
  }
}

export default {
  title: 'Matthew 21:1-11: The triumphal entry',
  subtitle: 'Hosanna to the Son of David: blessed is he that cometh in the name of the Lord',
  seed: 20,
  style: { ...DAY_STYLE, fog: { color: '#efdcb4', near: 140, far: 1000 } },
  sky: { zenith: '#2a6a8c', mid: '#79acc0', horizon: '#f3dcaa', ground: '#d9b98a', glowColor: '#fff0c0', glowDir: [0.3, 0.6, -1] },
  sun: { dir: [-0.5, 0.85, 0.4], color: '#fff2da', intensity: 2.6, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 }, shadowSize: 80 },
  ground: {
    size: 1400, segments: 260, flatRadius: 170, hillHeight: 40, undulation: 0.25,
    plaza: { center: [0, -46], size: [6, 130] },
    colors: { sand: '#d4b07a', dirt: '#c49a62', grass: '#9aa060', grassDark: '#7d8a4a', plaza: '#dcc49a', plazaLine: '#d0b88e', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#9a9a68' },
  },
  mountains: { count: 30, distance: [450, 780], height: [60, 140], widthRatio: [1.6, 2.6], colors: ['#9a9a78', '#8a8a6a', '#a8a080', '#b0a080'] },
  objects: [
    { type: 'stones', count: 400, ring: [8, 140], size: [0.12, 0.35], colors: ['#cdb48a', '#b89a70', '#a89070'] },
  ],
  custom,
  clouds: { layers: [{ count: 22, distance: [400, 800], height: [100, 200], size: [40, 80], color: '#fff6e4', shade: '#8a7a8a' }] },
  crowd: {
    seed: 20,
    minSpacing: 0.66,
    facing: JESUS,
    colors: PALETTE,
    aisles: [{ from: [0, 40], to: [0, -1], width: 2 }, { from: [0, -36], to: [0, -74], width: 6 }],
    keepClear: [{ kind: 'circle', x: JESUS[0], z: JESUS[1], r: 2.4 }],
    groups: [
      { shape: 'rect', center: [-6.5, -26], size: [5, 84], count: 330, children: 0.2, facingJitter: 0.7 },
      { shape: 'rect', center: [6.5, -26], size: [5, 84], count: 330, children: 0.2, facingJitter: 0.7 },
      { shape: 'rect', center: [0, -5], size: [5, 8], count: 30, children: 0.1, facing: [0, -120], facingJitter: 0.3 },
      { shape: 'rect', center: [0, 24], size: [6, 30], count: 60, children: 0.1, facing: [0, -120], facingJitter: 0.3 },
    ],
  },
  player: {
    start: [1.7, -17.0],
    lookAt: [-1.6, -70],
    fov: 42,
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
