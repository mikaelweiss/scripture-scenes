// Genesis 37: Joseph is drawn out of the dry pit at Dothan and sold to an Ishmeelite caravan bound for Egypt.
// x is east, z is south. The pit is at the origin, the caravan road runs from the northeast to the southwest.
import { Batch, DAY_STYLE, addSun, ball, box, camel, cyl, flock, frameAt, makeRng, person, rock, xf } from './lib/ot-13-kit.js';

const PIT = [0, 0];
const JOSEPH = [1.6, -1.4];
const JUDAH = [-1.4, -3.4];
const TRADER = [4.4, -4.2];

const BROTHER_ROBES = ['#a87b4f', '#8c5a3c', '#7a6a52', '#c8a97a', '#6f8a6a', '#9c6b4e', '#b5916a', '#5e4632', '#bfa27a', '#7d5a3c'];
const BROTHER_MANTLES = ['#5e4632', '#c8912e', '#3e6e66', '#8c5a3c', '#a64b35', '#d9c7a3', '#6b5a4a', '#4f7f80', '#b5523b', '#7a6a52'];
const SKINS = ['#a87650', '#9c6a45', '#b5825a', '#8a5a3b'];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(1337);

  // The dry pit: a ring of fieldstone around a dark shaft.
  const py = ctx.terrainHeight(...PIT);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(['#a8957a', '#8f7d66', '#b5a184'][i % 3], xf(new THREE.DodecahedronGeometry(0.42, 0), { pos: [PIT[0] + Math.sin(a) * 1.7, py + 0.25, PIT[1] + Math.cos(a) * 1.7], rot: [rng(), a, rng()], scale: [1.2, 0.8, 1] }));
  }
  b.add('#120b07', cyl(1.45, 1.45, 0.1, [PIT[0], py + 0.06, PIT[1]], [0, 0, 0], 20), { cast: false });
  ctx.addCollider({ x: PIT[0], z: PIT[1], hx: 2, hz: 2, rot: 0, top: py + 0.6 });
  ctx.exclude({ kind: 'circle', x: PIT[0], z: PIT[1], r: 2.4 });

  // A rope drawn up over the rim to Joseph's hands.
  b.add('#c9b07a', cyl(0.03, 0.03, 2.2, [0.8, py + 0.75, -0.7], [0.5, 0.85, 0.9], 4), { cast: false });

  // The coat of many colours, stripped and lying on the ground.
  const cx = -2.6, cz = 1.4, cy = ctx.terrainHeight(cx, cz);
  const stripes = ['#b5523b', '#c8912e', '#2f8f8a', '#efe3c2', '#6b2f4a', '#3e8e6e', '#d9a441'];
  stripes.forEach((c, i) => b.add(c, box(1.6, 0.05, 0.22, [0, 0.04 + i * 0.002, -0.7 + i * 0.22], [0, 0, 0]), { frame: frameAt(cx, cy, cz, 0.5), cast: false }));
  b.add('#b5523b', box(0.5, 0.05, 1.2, [-1.0, 0.05, 0], [0, 0.4, 0]), { frame: frameAt(cx, cy, cz, 0.5), cast: false });
  b.add('#2f8f8a', box(0.5, 0.05, 1.2, [1.0, 0.05, 0], [0, -0.4, 0]), { frame: frameAt(cx, cy, cz, 0.5), cast: false });

  // The twenty pieces of silver.
  const sx = 3.2, sz = -3.1, sy = ctx.terrainHeight(sx, sz);
  b.add('#6b4a33', box(0.5, 0.35, 0.4, [sx, sy + 0.18, sz]));
  for (let i = 0; i < 9; i++) b.add('#e6e2d6', cyl(0.07, 0.07, 0.02, [sx + (rng() - 0.5) * 0.5, sy + 0.38 + i * 0.012, sz + (rng() - 0.5) * 0.3], [0, 0, 0], 8), { emissive: '#3a3a3a' });

  // Joseph, without his coat, drawn up and bound.
  person(ctx, { pos: JOSEPH, face: [TRADER[0], TRADER[1] + 2], colors: { robe: '#efe3c2', mantle: '#e3d6b8', skin: '#b5825a', hair: '#3a2418', sash: '#a87b4f', arms: [0.12, 0.7] } });

  // His brothers. Judah gestures to the traders, Reuben is away.
  person(ctx, { pos: JUDAH, face: TRADER, colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#9c6a45', hair: '#2b1a12', sash: '#efe3c2', arms: [0.35, 1.3] } });
  const brothers = [[-3.8, -1.2], [-4.4, 0.8], [-3.2, 2.9], [-1.4, 3.6], [-5.6, -2.6], [-2.8, -5.0], [-0.2, -5.4], [-5.8, 2.4], [-4.6, 4.6]];
  brothers.forEach((p, i) => person(ctx, { pos: p, face: [JOSEPH[0], JOSEPH[1] - 1], scale: 0.96 + rng() * 0.1, colors: { robe: BROTHER_ROBES[i], mantle: BROTHER_MANTLES[i], skin: SKINS[i % 4], hair: '#2b1a12', sash: i % 2 ? '#efe3c2' : null } }));

  // The Ishmeelite merchants.
  person(ctx, { pos: TRADER, face: JUDAH, scale: 1.04, colors: { robe: '#2e3a5c', mantle: '#efe3c2', skin: '#8a5a3b', hair: '#efe3c2', sash: '#b5523b', arms: [0.3, 1.0] } });
  person(ctx, { pos: [6.2, -2.6], face: JOSEPH, colors: { robe: '#efe3c2', mantle: '#2e3a5c', skin: '#7a4e33', hair: '#e6d8b8', sash: '#c8912e' } });
  person(ctx, { pos: [5.6, -6.4], face: JOSEPH, colors: { robe: '#5a3a5c', mantle: '#d9c7a3', skin: '#8a5a3b', hair: '#d9c7a3', sash: '#2f8f8a' } });

  // The caravan of camels on the road to Egypt, with spicery, balm and myrrh.
  const road = (t) => [26 - t * 3.1, -16 + t * 1.5];
  for (let i = 0; i < 9; i++) {
    const [x, z] = road(i);
    if (Math.hypot(x - TRADER[0], z - TRADER[1]) < 4) continue;
    camel(b, ctx, { pos: [x, z], rot: Math.atan2(-3.1, 1.5), color: ['#c49a62', '#b5895a', '#d1a873'][i % 3], couched: i === 3 || i === 4, load: ['#b5523b', '#2f8f8a', '#c8912e', '#6b2f4a'][i % 4] });
    if (i % 2 === 0) person(ctx, { pos: [x + 1.6, z + 0.6], face: road(i + 3), colors: { robe: ['#efe3c2', '#2e3a5c', '#5a3a5c'][i % 3], mantle: '#d9c7a3', skin: '#8a5a3b', hair: '#efe3c2', sash: '#b5523b' } });
  }
  const rx = 40, rz = -22;
  for (let i = 0; i < 4; i++) camel(b, ctx, { pos: [rx + i * 3.1, rz - i * 1.5], rot: Math.atan2(-3.1, 1.5), color: '#c49a62', load: '#8c5a3c' });

  // The caravan track worn into the ground.
  const tg = new THREE.PlaneGeometry(4, 120).rotateX(-Math.PI / 2);
  const track = new THREE.Mesh(tg, ctx.kit.toon('#d8b884', { side: THREE.DoubleSide }));
  track.rotation.y = Math.atan2(-3.1, 1.5);
  track.position.set(8, ctx.terrainHeight(8, -7) + 0.05, -7);
  track.receiveShadow = true;
  ctx.scene.add(track);

  // Their father's flocks grazing on the slope.
  flock(b, ctx, { center: [-16, 8], radius: 9, count: 38, seed: 13 });
  flock(b, ctx, { center: [-10, 24], radius: 6, count: 18, seed: 14 });
  b.add('#6b4a33', cyl(0.04, 0.05, 1.9, [-3.9, ctx.terrainHeight(-3.9, -0.6) + 0.95, -0.6], [0, 0, 0.15], 5));

  // Boulders and scrub of the hill country.
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2, r = 14 + rng() * 60;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (ctx.blocked(x, z, 2) || Math.abs((x - 8) * 1.5 + (z + 7) * 3.1) / 3.44 < 4) continue;
    rock(b, ctx, { pos: [x, z], size: 0.6 + rng() * 1.6, color: ['#9a8670', '#8a7662', '#a8957a'][i % 3], seed: i + 3 });
  }
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2, r = 8 + rng() * 80;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (ctx.blocked(x, z, 1)) continue;
    b.add(['#7d8a4a', '#6c7a42', '#8e9a58'][i % 3], ball(0.5 + rng() * 0.6, [x, ctx.terrainHeight(x, z) + 0.15, z], [1.3, 0.6, 1.1], 7));
  }

  addSun(ctx, { dir: [0.6, 0.45, -0.7], size: 50 });
  b.flush();
}

export default {
  title: 'Genesis 37:23-28: Joseph sold into Egypt',
  subtitle: 'Dothan, the brothers sell Joseph to the Ishmeelites',
  seed: 37,
  style: { ...DAY_STYLE, fog: { color: '#f0d8a8', near: 120, far: 900 } },
  sky: { zenith: '#3d7aa6', mid: '#86b8c8', horizon: '#f3d8a4', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [0.6, 0.45, -0.7] },
  sun: { dir: [0.6, 0.55, -0.6], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d6e6ee', ground: '#b07a52', intensity: 1.1 }, shadowSize: 60 },
  ground: {
    size: 1200, segments: 240, flatRadius: 60, hillHeight: 34, undulation: 0.6,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#d4ac6c', dirt: '#bf8d55', grass: '#9aa060', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#9a9a62' },
  },
  mountains: { count: 30, distance: [420, 700], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#a89878', '#9a8a6e', '#b5a383', '#8f9a76'] },
  objects: [
    { type: 'trees', count: 50, ring: [30, 200], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#7a8a4a', '#6c7a42', '#8a9a58'] },
    { type: 'stones', count: 300, ring: [3, 60], size: [0.1, 0.35], colors: ['#a8957a', '#8f7d66', '#b5a184'] },
  ],
  custom,
  clouds: { layers: [{ count: 30, distance: [350, 800], height: [90, 180], size: [40, 80], color: '#fff6e4', shade: '#7a7a92' }] },
  player: {
    start: [0.5, 9],
    lookAt: [0, -2],
    colors: { robe: '#a87b4f', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
