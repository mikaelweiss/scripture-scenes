// Exodus 16: at dawn the dew lifts and the camp of Israel is covered in small white bread.
// x is east, z is south. The gathering field opens north of the player, ringed by tents.
import { Batch, DAY_STYLE, MOSES, AARON, PALETTE, addSun, camp, makeRng, person, scatter } from './lib/ot-19-kit.js';

const MOSES_AT = [-3, -16];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(19);

  camp(b, ctx, { center: [0, -8], ring: [36, 150], count: 260, seed: 191, face: [0, -8] });
  camp(b, ctx, { center: [0, -8], ring: [26, 38], count: 30, seed: 192, keepOut: [{ kind: 'rect', x: 0, z: 30, hx: 10, hz: 14 }] });

  // Baskets and jars set down while the people gather.
  for (let i = 0; i < 70; i++) {
    const x = (rng() - 0.5) * 56, z = -8 + (rng() - 0.5) * 64;
    if (ctx.blocked(x, z, 0.4) || Math.hypot(x, z - 14) < 4) continue;
    const y = ctx.terrainHeight(x, z);
    if (rng() < 0.6) {
      b.add('#a8844e', new THREE.CylinderGeometry(0.32, 0.24, 0.32, 9).translate(x, y + 0.16, z));
      b.add('#f6f2e4', new THREE.SphereGeometry(0.28, 8, 5).scale(1, 0.35, 1).translate(x, y + 0.32, z), { cast: false });
    } else {
      const jar = new THREE.LatheGeometry([[0.01, 0], [0.18, 0.04], [0.24, 0.3], [0.16, 0.52], [0.1, 0.6], [0.12, 0.66]].map(([r, h]) => new THREE.Vector2(r, h)), 8);
      b.add(rng() < 0.5 ? '#b5674a' : '#c8a07a', jar.translate(x, y, z));
    }
  }

  // Quail resting among the tents from the evening before.
  for (let i = 0; i < 40; i++) {
    const a = rng() * 6.28, r = 20 + rng() * 40;
    const x = Math.sin(a) * r, z = -8 + Math.cos(a) * r;
    if (ctx.blocked(x, z, 0.2)) continue;
    const y = ctx.terrainHeight(x, z);
    b.add('#8a6a48', new THREE.SphereGeometry(0.16, 7, 5).scale(1, 0.8, 1.4).translate(x, y + 0.14, z));
    b.add('#5a4430', new THREE.SphereGeometry(0.08, 6, 4).translate(x, y + 0.28, z + 0.16));
  }
  // Moses speaks from a low outcrop.
  const ry = ctx.terrainHeight(...MOSES_AT);
  b.add('#b89070', new THREE.DodecahedronGeometry(2.4, 0).scale(1.3, 0.45, 1).translate(MOSES_AT[0] - 0.8, ry, MOSES_AT[1] - 0.3));
  ctx.addCollider({ x: MOSES_AT[0] - 0.8, z: MOSES_AT[1] - 0.3, hx: 2.6, hz: 1.9, rot: 0, top: ry + 0.95, walkable: true });
  b.flush();

  // The bread itself: white flakes over the open ground and between the tents.
  scatter(ctx, { count: 9000, center: [0, -8], ring: [0, 44], size: [0.05, 0.11], colors: ['#ffffff', '#f6f1e2', '#fbf6ea'], seed: 3 });
  scatter(ctx, { count: 7000, center: [0, -8], ring: [44, 120], size: [0.06, 0.13], colors: ['#ffffff', '#f6f1e2'], seed: 4 });

  addSun(ctx, { dir: [0.9, 0.12, -0.25], size: 70, color: '#fff0d0', halo: '#ffc890' });

  person(ctx, { pos: MOSES_AT, y: ry + 0.95, face: [0, 14], scale: 1.1, colors: { ...MOSES, arms: [0.5, 1.1] } });
  person(ctx, { pos: [MOSES_AT[0] - 1.8, MOSES_AT[1] - 0.6], y: ry + 0.95, face: [0, 14], scale: 1.05, colors: AARON });
  person(ctx, { pos: [2.2, 4.5], face: [0, 14], scale: 0.62, colors: { robe: '#c98b3c', mantle: '#e6d8b8', skin: '#a87650', hair: '#2b1a12', arms: [0.3, 1.3] } });
}

export default {
  title: 'Exodus 16:13-21: Manna in the wilderness',
  subtitle: 'Wilderness of Sin, at dawn. "It is the bread which the Lord hath given you"',
  seed: 19,
  style: { ...DAY_STYLE, fog: { color: '#f2d8c4', near: 90, far: 900 } },
  sky: { zenith: '#5b7fae', mid: '#d6a8a6', horizon: '#ffd9a8', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [0.9, 0.12, -0.25] },
  sun: { dir: [0.9, 0.32, -0.25], color: '#ffe2bc', intensity: 2.4, hemi: { sky: '#e6d6e4', ground: '#b98a5a', intensity: 1.2 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 170, hillHeight: 40, undulation: 0.25,
    plaza: { center: [0, 5000], size: [1, 1] },
    colors: { sand: '#dcb886', dirt: '#c99c66', grass: '#b4a46e', grassDark: '#9c8c5a', plaza: '#e6d6b0', plazaLine: '#c7ab7c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b48a62' },
  },
  mountains: { count: 32, distance: [460, 780], height: [60, 150], widthRatio: [1.6, 2.6], colors: ['#c08a6a', '#a8785c', '#b89070', '#9c6e58'] },
  objects: [
    { type: 'stones', count: 400, ring: [6, 140], size: [0.12, 0.4], colors: ['#c9a87a', '#b89a70', '#a8805c'] },
    { type: 'trees', count: 18, ring: [140, 220], height: [3, 5], broken: 0, fallen: 0, trunkColor: '#6b5a4a', leafColors: ['#8a8a5a', '#7a7c52'] },
  ],
  custom,
  clouds: { layers: [{ count: 26, distance: [400, 800], height: [80, 160], size: [40, 80], color: '#fff0e4', shade: '#a07c8c' }] },
  crowd: {
    seed: 19,
    minSpacing: 0.9,
    facing: MOSES_AT,
    colors: PALETTE,
    aisles: [{ from: [0, 22], to: [MOSES_AT[0], MOSES_AT[1] + 3], width: 3 }],
    keepClear: [{ kind: 'circle', x: MOSES_AT[0], z: MOSES_AT[1], r: 3 }],
    groups: [
      { shape: 'rect', center: [0, -8], size: [56, 62], count: 170, kneel: 0.6, children: 0.15, facingJitter: 6, lean: 0.4 },
      { center: MOSES_AT, radius: [3.2, 7], angle: [-1.6, 1.6], count: 26, children: 0.1, facingJitter: 0.4 },
      { center: [0, -8], radius: [36, 70], count: 160, kneel: 0.4, children: 0.15, facingJitter: 6, lean: 0.3 },
    ],
  },
  player: {
    start: [0, 16],
    lookAt: [MOSES_AT[0], MOSES_AT[1]],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
