// Luke 22:39-46: Jesus prays alone in the olive garden at night, an angel strengthening him, while Peter, James and John sleep.
// x is east, z is south. Jerusalem lies north across the Kidron, the garden on the slope of the Mount of Olives.
import { Batch, DAY_STYLE, angels, ball, city, flames, glow, makeRng, moon, olive, person, sleeper, stars, temple } from './lib/nt-19-kit.js';

const JESUS = [0, -12];
const ROCK = [0, -13.6];
const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#4a3020', sash: '#e9dcc0' };
const SLEEPERS = [
  { pos: [-3.0, -4.6], yaw: 1.2, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#d9d0c0', sash: '#c8912e' } },
  { pos: [0.9, -3.0], yaw: -0.4, colors: { robe: '#6f8a6a', mantle: '#d9c7a3', skin: '#a87650', hair: '#3a2418' } },
  { pos: [3.4, -5.6], yaw: -1.9, colors: { robe: '#e6d8b8', mantle: '#b5523b', skin: '#b5825a', hair: '#4a3020' } },
];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(22);
  const gy = ctx.terrainHeight(...JESUS);

  // The rock where he kneels to pray.
  b.add('#8a8070', ball(1.1, [ROCK[0], ctx.terrainHeight(...ROCK) + 0.25, ROCK[1]], [1.6, 0.7, 1.1], 8));
  b.add('#7a7062', ball(0.7, [ROCK[0] + 1.4, ctx.terrainHeight(...ROCK) + 0.15, ROCK[1] - 0.4], [1.3, 0.8, 1], 7));
  ctx.addCollider({ x: ROCK[0], z: ROCK[1], hx: 1.7, hz: 0.9, rot: 0, top: gy + 0.9 });

  // The grove: old olive trees with a clear walk from the sleeping disciples up to the rock.
  const clear = (x, z) => Math.abs(x) < 6 && z > -18 && z < 14;
  for (let i = 0, n = 0; n < 110 && i < 900; i++) {
    const x = (rng() - 0.5) * 140, z = -50 + rng() * 110;
    if (clear(x, z) || ctx.blocked(x, z, 1.5)) continue;
    olive(b, ctx, { pos: [x, z], size: 1 + rng() * 0.6, seed: i, leaf: '#5e6e58', leafDark: '#4a5a4a', trunk: '#4a4038' });
    n++;
  }
  for (let i = 0; i < 200; i++) {
    const x = (rng() - 0.5) * 100, z = -40 + rng() * 80;
    b.add('#6a6458', ball(0.15 + rng() * 0.25, [x, ctx.terrainHeight(x, z) + 0.05, z], [1.3, 0.6, 1], 6), { cast: false });
  }
  // Low garden wall across the slope behind the player.
  for (let x = -40; x < 40; x += 1.2) {
    if (Math.abs(x + 2) < 2.4) continue;
    const z = 22 + Math.sin(x * 0.1) * 2;
    b.add('#7a7062', ball(0.6, [x, ctx.terrainHeight(x, z) + 0.3, z], [1.1, 0.75, 0.8], 6));
  }

  // Jerusalem across the valley, a few windows still lit, and the temple above its wall.
  city(b, ctx, { wall: [[160, -150], [-160, -150]], depth: 70, count: 70, height: 10, seed: 23, towers: 8, wallColor: '#9a9080', colors: ['#8a8070', '#9a9080', '#a09684'], lit: 30, skip: (x, z) => Math.abs(x + 20) < 50 && z < -190 });
  temple(b, ctx, { pos: [-20, -230], scale: 0.9 });

  // Torches of the band coming out of the city across the Kidron.
  const torches = [];
  for (let i = 0; i < 9; i++) {
    const x = 34 + i * 2.2 + rng() * 1.5, z = -95 + i * 3 + rng() * 2;
    const y = ctx.terrainHeight(x, z);
    torches.push({ pos: [x, y + 2.1, z], h: 0.6 + rng() * 0.3 });
    glow(ctx, { pos: [x, y + 2.4, z], size: 4, color: '#ffb35a', opacity: 0.7, pulse: 0.1 });
  }
  flames(ctx, torches);
  b.flush();

  stars(ctx, { count: 900, size: 1.8, minY: 0.1 });
  moon(ctx, { dir: [0.5, 0.45, -0.75], size: 36 });

  // Jesus kneeling, the angel above him, the three asleep.
  person(ctx, { pos: JESUS, kneel: true, scale: 1.1, glow: 0.35, face: [ROCK[0], ROCK[1] - 5], colors: { ...CHRIST, arms: [0.25, 1.6] } }).rotation.x = 0.18;
  glow(ctx, { pos: [JESUS[0], gy + 1.1, JESUS[1]], size: 4.5, color: '#fff0c8', opacity: 0.55 });
  angels(ctx, [{ pos: [1.5, gy + 0.9, JESUS[1] - 0.9], face: JESUS, scale: 1.05 }], { glowSize: 6, glowOpacity: 0.6, light: { color: "#fff1c8", intensity: 14, distance: 14, pos: [0.8, gy + 3, JESUS[1] + 0.5] } });
  for (const s of SLEEPERS) sleeper(ctx, s);
  // The other eight, farther back by the gate.
  const rest = [[-8, 18], [-6, 19.5], [-4.2, 18.4], [5, 18.8], [7, 19.6], [8.6, 17.8], [-10, 16.6], [10.4, 16.4]];
  rest.forEach((p, i) => sleeper(ctx, { pos: p, yaw: rng() * 6.28, colors: { robe: ['#8c5a3c', '#c8a97a', '#4f7f80', '#9c6b4e'][i % 4], mantle: ['#5e4632', '#b5523b', '#3e6e66', '#c8912e'][i % 4], skin: '#9c6a45', hair: '#2b1a12' } }));
}

export default {
  title: 'Luke 22:39-46: Gethsemane',
  subtitle: 'Not my will, but thine, be done',
  seed: 22,
  style: { ...DAY_STYLE, fog: { color: '#182038', near: 60, far: 420 } },
  sky: { zenith: '#060a1c', mid: '#121a38', horizon: '#26305a', ground: '#141826', glowColor: '#1e2848', glowDir: [0.5, 0.45, -0.75] },
  sun: { dir: [0.5, 0.6, -0.6], color: '#9ab0e0', intensity: 0.7, hemi: { sky: '#4a5a8a', ground: '#2a2a2e', intensity: 0.9 }, shadowSize: 60 },
  ground: {
    size: 900, segments: 200, flatRadius: 120, hillHeight: 30, undulation: 0.35,
    plaza: { center: [0, 900], size: [1, 1] },
    colors: { sand: '#5e5c4c', dirt: '#4e4a3e', grass: '#4a5640', grassDark: '#3a4636', plaza: '#4a4a3e', plazaLine: '#3e3a32', scorch: '#2a2020', scorchEdge: '#3a2a20', hill: '#2e3438' },
  },
  mountains: { count: 24, distance: [400, 700], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#161a30', '#1c2036', '#12162a'] },
  objects: [],
  custom,
  clouds: { layers: [{ count: 14, distance: [350, 700], height: [100, 200], size: [40, 80], color: '#4a5272', shade: '#1a1e30' }] },
  player: {
    start: [-1.2, 0.5],
    lookAt: [0, -12],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
