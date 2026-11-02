// Exodus 3: Moses keeps Jethro's flock at Horeb and turns aside to see the bush that burns and is not consumed.
// x is east, z is south. The bush stands on a ledge below the mountain of God to the north.
import { Batch, DAY_STYLE, ball, box, cyl, flames, flock, glow, makeRng, person, rock, xf } from './lib/ot-13-kit.js';

const BUSH = [0, -9];
const MOSES = [-2.6, -5.6];
const PEAK = [10, -300];

function custom(ctx) {
  const { THREE, kit } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(33);

  // The mountain of God rising behind, built of stacked rock masses.
  const masses = [[PEAK[0], PEAK[1], 110, 210], [-90, -270, 80, 130], [110, -280, 90, 140], [-40, -200, 50, 70], [60, -210, 50, 60], [-150, -200, 60, 80], [170, -190, 60, 85]];
  masses.forEach(([x, z, r, h], i) => {
    const g = new THREE.ConeGeometry(r, h, 7, 3);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k);
      if (y < h / 2 - 0.1) {
        const a = Math.atan2(p.getZ(k), p.getX(k));
        const j = 0.85 + 0.25 * Math.sin(a * 3 + i + y * 0.1);
        p.setX(k, p.getX(k) * j);
        p.setZ(k, p.getZ(k) * j);
      }
    }
    g.computeVertexNormals();
    b.add(['#9a7a5e', '#8a6a52', '#a8846a', '#8f735a'][i % 4], xf(g, { pos: [x, ctx.terrainHeight(x, z) + h / 2 - 6, z], rot: [0, rng() * 6, 0] }));
  });

  // The ledge where the bush grows.
  const by = ctx.terrainHeight(...BUSH);
  rock(b, ctx, { pos: [BUSH[0] - 3.5, BUSH[1] - 2.5], size: 2.6, color: '#9a7a5e', seed: 4 });
  rock(b, ctx, { pos: [BUSH[0] + 0.5, BUSH[1] - 4.5], size: 3.2, color: '#a8846a', seed: 6 });

  // The bush: green and whole inside the flame.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, r = i ? 0.55 : 0;
    b.add(i % 2 ? '#4f7a3a' : '#3e6a32', ball(0.55 + rng() * 0.2, [BUSH[0] + Math.sin(a) * r, by + 0.7 + rng() * 0.5, BUSH[1] + Math.cos(a) * r], [1, 0.9, 1], 8));
  }
  for (let i = 0; i < 6; i++) b.add('#5a3a22', cyl(0.04, 0.06, 1.1, [BUSH[0] + (rng() - 0.5) * 0.6, by + 0.5, BUSH[1] + (rng() - 0.5) * 0.6], [(rng() - 0.5) * 0.8, 0, (rng() - 0.5) * 0.8], 5));
  ctx.addCollider({ x: BUSH[0], z: BUSH[1], hx: 1.1, hz: 1.1, rot: 0, top: by + 1.6 });
  ctx.exclude({ kind: 'circle', x: BUSH[0], z: BUSH[1], r: 2 });
  const fl = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 * 3, r = 0.2 + rng() * 0.8;
    fl.push({ pos: [BUSH[0] + Math.sin(a) * r, by + 0.6 + rng() * 0.9, BUSH[1] + Math.cos(a) * r], h: 0.6 + rng() * 1.3, w: 0.7 + rng() * 0.6, light: i === 0 });
  }
  fl.push({ pos: [BUSH[0], by + 1.1, BUSH[1]], h: 2.2, w: 1.6 });
  flames(ctx, fl, { outer: '#ff8a2c', inner: '#ffe08a', light: { color: '#ffc870', intensity: 22, distance: 24 } });
  glow(ctx, { pos: [BUSH[0], by + 1.6, BUSH[1]], size: 6.5, color: '#ffd890', opacity: 0.55, pulse: 0.06 });
  glow(ctx, { pos: [BUSH[0], by + 1.8, BUSH[1]], size: 15, color: '#ffb35a', opacity: 0.18, pulse: 0.04 });

  // Moses, his shoes put off, kneeling on holy ground with his staff laid down.
  person(ctx, { pos: MOSES, face: BUSH, kneel: true, scale: 1.3, colors: { robe: '#8c5a3c', mantle: '#e3d6b8', skin: '#a8724a', hair: '#3a2418', sash: '#c8912e', arms: [0.25, 1.1] } });
  const my = ctx.terrainHeight(...MOSES);
  b.add('#6b4a33', cyl(0.045, 0.05, 2.3, [MOSES[0] + 1.1, my + 0.06, MOSES[1] + 0.5], [Math.PI / 2, 0.5, 0], 6));
  for (const s of [-1, 1]) {
    b.add('#8c5a3c', box(0.14, 0.04, 0.3, [MOSES[0] - 0.9 + s * 0.12, my + 0.03, MOSES[1] + 1.4], [0, 0.3, 0]));
    b.add('#5e4632', box(0.16, 0.02, 0.06, [MOSES[0] - 0.9 + s * 0.12, my + 0.07, MOSES[1] + 1.38], [0, 0.3, 0]));
  }


  // Boulders and scrub across the slope.
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2, r = 8 + rng() * 80;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 10;
    if (ctx.blocked(x, z, 2) || Math.hypot(x - 1, z - 8) < 7 || Math.hypot(x - BUSH[0], z - BUSH[1]) < 9) continue;
    rock(b, ctx, { pos: [x, z], size: 0.6 + rng() * (r < 30 ? 0.9 : 2.4), color: ['#9a7a5e', '#8a6a52', '#a8846a', '#7a5e4a'][i % 4], seed: i + 40 });
  }
  for (let i = 0; i < 60; i++) {
    const a = rng() * Math.PI * 2, r = 5 + rng() * 70;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (ctx.blocked(x, z, 1)) continue;
    b.add(['#6c7a42', '#7d8a4a', '#5f6a3a'][i % 3], ball(0.4 + rng() * 0.5, [x, ctx.terrainHeight(x, z) + 0.1, z], [1.3, 0.6, 1.1], 7));
  }

  // Jethro's flock at the back side of the desert.
  flock(b, ctx, { center: [12, 8], radius: 10, count: 44, seed: 21 });
  flock(b, ctx, { center: [-14, 14], radius: 6, count: 16, seed: 22 });

  b.flush();
}

export default {
  title: 'Exodus 3:1-6: The burning bush',
  subtitle: 'Mount Horeb, the bush burns and is not consumed',
  seed: 3,
  style: { ...DAY_STYLE, fog: { color: '#d8a888', near: 100, far: 800 } },
  sky: { zenith: '#3a3f6e', mid: '#9a6f8a', horizon: '#f0b07a', ground: '#a87a5a', glowColor: '#ffc890', glowDir: [-0.8, 0.12, 0.3] },
  sun: { dir: [-0.8, 0.35, 0.4], color: '#ffd2a0', intensity: 1.7, hemi: { sky: '#a8a0c0', ground: '#7a5040', intensity: 0.9 }, shadowSize: 60 },
  ground: {
    size: 1000, segments: 220, flatRadius: 40, hillHeight: 30, undulation: 0.9,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#c8a074', dirt: '#a8805a', grass: '#8a8a58', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#9a7a5e' },
  },
  mountains: { count: 30, distance: [420, 700], height: [80, 180], widthRatio: [1.2, 2], colors: ['#7a5e5a', '#8a6a62', '#6e5458', '#94706a'] },
  objects: [
    { type: 'trees', count: 18, ring: [25, 120], height: [3, 5], broken: 0, fallen: 0, trunkColor: '#5a3a22', leafColors: ['#6c7a42', '#7d8a4a'] },
    { type: 'stones', count: 400, ring: [2, 60], size: [0.1, 0.4], colors: ['#9a7a5e', '#8a6a52', '#a8846a'] },
  ],
  custom,
  clouds: { layers: [{ count: 30, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#f6c8a0', shade: '#5a4a6a' }] },
  player: {
    start: [1.8, -1.4],
    lookAt: [-1.6, -8.6],
    fov: 42,
    colors: { robe: '#8c5a3c', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
