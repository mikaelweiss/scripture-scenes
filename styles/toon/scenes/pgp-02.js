// Moses 5:5-8: Adam offers the firstlings of the flock outside the garden. An angel asks him why.
// Coordinates are meters. x is east, z is south. The garden of Eden lies far to the north.
import { BASE_STYLE, THREE, Parts, altar, angel, between, figure, flames, flockOfSheep, glow, makeRng, pick, sheep, smokeColumn, unit } from './lib/pgp-01-kit.js';

const ALTAR = [0, -8];
const ANGEL = [-4.2, -9.5];
const ADAM = [0.6, -5.2];
const EVE = [2.6, -3.6];
const GATE = [0, -150];

function field(ctx) {
  const p = new Parts();
  const [cx, cz] = [-26, 2];
  for (let r = 0; r < 12; r++) {
    const z = cz - 9 + r * 1.6;
    p.box('#7a5a3c', [22, 0.25, 0.7], [cx, ctx.terrainHeight(cx, z) + 0.05, z]);
    const rng = makeRng(r + 3);
    for (let k = 0; k < 26; k++) {
      const x = cx - 10.5 + k * 0.84 + (rng() - 0.5) * 0.2;
      const h = between(rng, [0.6, 1.0]);
      p.add(pick(rng, ['#c8b04a', '#b8a040', '#d6c060']), unit.cone, { pos: [x, ctx.terrainHeight(x, z) + h / 2 + 0.1, z], scale: [0.28, h, 0.28] });
    }
  }
  ctx.scene.add(p.group(ctx.kit));
}

// Thorns and thistles of the ground outside the garden.
function thistles(ctx) {
  const rng = makeRng(9);
  const p = new Parts();
  for (let i = 0; i < 160; i++) {
    const a = rng() * Math.PI * 2, r = between(rng, [10, 90]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (ctx.blocked(x, z, 1) || (x < -12 && x > -40 && z > -10 && z < 14)) continue;
    const y = ctx.terrainHeight(x, z);
    const s = between(rng, [0.4, 1.1]);
    const col = pick(rng, ['#5e6e3a', '#6f7a44', '#7a6a40']);
    for (let k = 0; k < 4; k++) p.add(col, unit.cone, { pos: [x + (rng() - 0.5) * s, y + s * 0.4, z + (rng() - 0.5) * s], rot: [(rng() - 0.5) * 0.8, 0, (rng() - 0.5) * 0.8], scale: [s * 0.25, s, s * 0.25] });
    if (rng() < 0.4) p.add('#a06ab0', unit.sphere, { pos: [x, y + s * 0.95, z], scale: s * 0.22 });
  }
  ctx.scene.add(p.group(ctx.kit));
}

// The garden behind its hedge, kept by cherubim and a flaming sword turning every way.
function garden(ctx) {
  const p = new Parts();
  const rng = makeRng(31);
  for (let i = 0; i < 70; i++) {
    const x = between(rng, [-140, 140]);
    if (Math.abs(x) < 6) continue;
    const z = GATE[1] - between(rng, [0, 6]);
    p.add(pick(rng, ['#3e7a44', '#4f8a4a', '#2f6a40']), unit.sphere, { pos: [x, ctx.terrainHeight(x, z) + 2.4, z], scale: [between(rng, [6, 10]), between(rng, [5, 7]), 6] });
  }
  for (const side of [-1, 1]) p.box('#b8a88c', [1.6, 7, 1.6], [GATE[0] + side * 5, ctx.terrainHeight(GATE[0], GATE[1]) + 3.5, GATE[1] + 2]);
  ctx.scene.add(p.group(ctx.kit));
  for (const side of [-1, 1]) angel(ctx, [GATE[0] + side * 3, GATE[1] + 3], { facing: [0, 0], scale: 1.6, glowSize: 9 });

  const y = ctx.terrainHeight(GATE[0], GATE[1]) + 4.5;
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, 0.12), ctx.kit.toon('#ffd27a', { emissive: '#f08a2c' }));
  blade.position.y = 1.6;
  const hilt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.3), ctx.kit.toon('#c8912e', { emissive: '#6a4010' }));
  hilt.position.y = -0.9;
  sword.add(blade, hilt);
  sword.position.set(GATE[0], y, GATE[1] + 3);
  ctx.scene.add(sword);
  ctx.onFrame((t) => (sword.rotation.y = t * 1.6));
  glow(ctx, [GATE[0], y + 1.5, GATE[1] + 3], 16, '#ffb050', 0.75);
  flames(ctx, [{ x: GATE[0], y: y + 3.6, z: GATE[1] + 3, h: 2.4, r: 1.2 }]);
}

function family(ctx) {
  const adam = { robe: '#b89a6a', mantle: '#7a5236', skin: '#a8724a', hair: '#4a3020', sash: '#5e4632', arms: [0.25, 0.9] };
  figure(ctx, adam, ADAM, { facing: ANGEL, scale: 1.05, clear: 0.9 });
  figure(ctx, { robe: '#c8a97a', mantle: '#8c5a3c', skin: '#b5825a', hair: '#3a2418', sash: '#b5523b' }, EVE, { facing: ALTAR, clear: 0.9 });
  const kids = [[4.2, -1.8, '#a87b4f'], [5.0, -3.4, '#6f8a6a'], [3.6, -0.4, '#c98b3c']];
  for (const [x, z, robe] of kids) figure(ctx, { robe, mantle: robe, skin: '#a87650', hair: '#2b1a12' }, [x, z], { facing: ALTAR, scale: 0.62, clear: 0.6 });
}

function hut(ctx) {
  const p = new Parts();
  const [x, z] = [16, -18];
  const y = ctx.terrainHeight(x, z);
  for (const [lx, lz] of [[-2.5, -2], [2.5, -2], [-2.5, 2], [2.5, 2]]) p.add('#6b4a33', unit.cyl, { pos: [x + lx, y + 1.3, z + lz], scale: [0.2, 2.6, 0.2] });
  p.add('#b89a5a', unit.cone, { pos: [x, y + 3.4, z], rot: [0, Math.PI / 4, 0], scale: [8.4, 2.2, 6.4] });
  p.box('#8a6a48', [5.4, 1.2, 0.2], [x, y + 0.6, z - 2]);
  ctx.scene.add(p.group(ctx.kit));
  ctx.addCollider({ x, z, hx: 2.8, hz: 2.2, rot: 0, top: y + 4 });
}

export default {
  title: 'Moses 5:5-8: Adam offers sacrifice',
  subtitle: 'Why dost thou offer sacrifices unto the Lord?',
  seed: 102,

  style: { ...BASE_STYLE, fog: { color: '#efd8ad', near: 140, far: 1000 } },

  sky: {
    zenith: '#3a6e8c',
    mid: '#7fb0b8',
    horizon: '#f6d8a0',
    ground: '#c8a878',
    glowColor: '#ffe8b0',
    glowDir: [-0.6, 0.3, -0.7],
  },

  sun: {
    dir: [-0.55, 0.65, 0.4],
    color: '#fff0d6',
    intensity: 2.6,
    hemi: { sky: '#d6e8e2', ground: '#a07a52', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 170,
    hillHeight: 36,
    undulation: 0.5,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#c8a870',
      dirt: '#b08a58',
      grass: '#8e9a58',
      grassDark: '#6c7a42',
      plaza: '#c8a870',
      plazaLine: '#c8a870',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#7f9a6a',
    },
  },

  mountains: { count: 30, distance: [520, 800], height: [60, 150], widthRatio: [1.4, 2.4], colors: ['#8a9aa0', '#7d8f98', '#9aa4a6', '#86948f'] },

  objects: [
    { type: 'trees', count: 40, center: GATE, ring: [10, 70], angle: [1.75, 4.55], height: [8, 13], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e4e', '#5fa04a', '#2f7f4a', '#7fb050', '#e07a5a'] },
    { type: 'trees', count: 14, ring: [40, 120], angle: [1.2, 3.6], height: [4, 7], broken: 0.1, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#6f8a4a', '#7a9050', '#8a9a58'], seed: 5 },
    { type: 'stones', count: 220, ring: [3, 70], size: [0.12, 0.4], colors: ['#a89880', '#8a7a66', '#b8a88c'] },
  ],

  custom(ctx) {
    const { top } = altar(ctx, ALTAR, { w: 2.4, d: 1.5, h: 1.05 });
    const lamb = sheep(ctx.kit, { scale: 0.8, lying: true });
    lamb.position.set(ALTAR[0], top - 0.02, ALTAR[1]);
    lamb.rotation.y = 1.4;
    ctx.scene.add(lamb);
    const fire = [];
    for (let i = 0; i < 6; i++) fire.push({ x: ALTAR[0] + (i / 5 - 0.5) * 2, y: top, z: ALTAR[1] + (i % 2 ? 0.45 : -0.45), h: 0.9, r: 0.8 });
    flames(ctx, fire);
    smokeColumn(ctx, [ALTAR[0], top + 1, ALTAR[1]], { count: 34, rise: 14, size: 0.85, drift: [5, -2] });
    glow(ctx, [ALTAR[0], top + 0.4, ALTAR[1]], 5, '#ffb050', 0.5);

    angel(ctx, ANGEL, { facing: ADAM, scale: 1.35, glowSize: 6, arms: [0.3, 0.6] });
    family(ctx);
    hut(ctx);
    field(ctx);
    garden(ctx);
    flockOfSheep(ctx, [12, 4], { count: 16, radius: 6 });
    thistles(ctx);
  },

  clouds: {
    layers: [
      { count: 30, distance: [400, 900], height: [70, 170], size: [40, 90], color: '#fff1d8', shade: '#6a6080' },
    ],
  },

  light: {
    beams: [{ from: [-4.2, 120, -9.5], to: { at: ANGEL, lift: 0 }, width: [9, 3], color: '#fff2c9', intensity: 0.16, layers: 2, stripes: 22, fadeLow: 0.05 }],
    pointLights: [{ at: ALTAR, lift: 2, color: '#ffc070', intensity: 8, distance: 14 }],
  },


  player: {
    start: [2.2, 1.4],
    lookAt: [-2.5, -9],
    colors: { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
