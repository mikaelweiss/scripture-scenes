// Genesis 1: new land rising from the waters. West holds bare rock and night, east holds plants, animals and the sun.
// Coordinates are meters. x is east, z is south. The player looks north across the island.
import { BASE_STYLE, THREE, animal, between, boxes, flock, makeRng, pick, river, skyDisc, stars, water } from './lib/ot-01-kit.js';

const ISLAND = [0, -20];
const islandRadius = (a) => 74 + 14 * Math.sin(3 * a + 1) + 7 * Math.sin(5 * a + 2);
const islandPoint = (a, k = 1) => [ISLAND[0] + Math.sin(a) * islandRadius(a) * k, ISLAND[1] + Math.cos(a) * islandRadius(a) * k];
const onIsland = (x, z, k = 1) => {
  const a = Math.atan2(x - ISLAND[0], z - ISLAND[1]);
  return Math.hypot(x - ISLAND[0], z - ISLAND[1]) < islandRadius(a) * k;
};

function sea(ctx) {
  const outer = new THREE.Shape();
  outer.moveTo(-1200, -1200);
  outer.lineTo(1200, -1200);
  outer.lineTo(1200, 1200);
  outer.lineTo(-1200, 1200);
  const hole = new THREE.Path();
  for (let i = 0; i <= 120; i++) {
    const [x, z] = islandPoint((i / 120) * Math.PI * 2);
    i ? hole.lineTo(x, -z) : hole.moveTo(x, -z);
  }
  outer.holes.push(hole);
  water(ctx, { shape: outer, y: 0.12, color: '#2f7f94', glint: '#e8f6f0', glints: 260, glintArea: (x, z) => !onIsland(x, z, 1.05) });
  const shore = [];
  for (let i = 0; i <= 160; i++) shore.push(islandPoint((i / 160) * Math.PI * 2, 0.985));
  river(ctx, shore, { width: 3.2, color: '#e6cf98', bank: null, lift: 0.1 });
}

// Day two and three: bare dark rock heaving up on the western side.
function rocks(ctx) {
  const rng = makeRng(31);
  const items = [];
  for (let i = 0; i < 46; i++) {
    const a = between(rng, [-2.6, -0.9]);
    const [x, z] = islandPoint(a, between(rng, [0.45, 0.9]));
    const s = between(rng, [1.2, 4.2]);
    items.push({ pos: [x, z], size: [s * between(rng, [1, 1.8]), s * between(rng, [0.8, 2.2]), s], rot: rng() * 6, tiltX: (rng() - 0.5) * 0.4, tiltZ: (rng() - 0.5) * 0.4, color: pick(rng, ['#5a4a48', '#6b5a52', '#4a3e40', '#7a6658']), collide: s > 2 });
  }
  boxes(ctx, items);
  const crag = new THREE.ConeGeometry(1, 1, 6, 1);
  crag.translate(0, 0.5, 0);
  const mat = ctx.kit.toon('#5e4e4a');
  for (const [a, k, h, w] of [[-1.75, 0.7, 22, 12], [-2.15, 0.62, 15, 9], [-1.35, 0.78, 12, 8], [-2.45, 0.8, 9, 7]]) {
    const [x, z] = islandPoint(a, k);
    const m = new THREE.Mesh(crag, mat);
    m.scale.set(w, h, w * 0.9);
    m.position.set(x, -0.5, z);
    m.rotation.y = a;
    m.castShadow = m.receiveShadow = true;
    ctx.scene.add(m);
    ctx.addCollider({ x, z, hx: w * 0.6, hz: w * 0.6, rot: 0, top: h });
  }
}

// Day three: grass, flowers and fruit trees springing up in the middle and east.
function flowers(ctx) {
  const rng = makeRng(77);
  const geo = new THREE.IcosahedronGeometry(0.22, 0);
  const n = 300;
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), n);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  let k = 0;
  while (k < n) {
    const x = ISLAND[0] + between(rng, [-15, 60]), z = ISLAND[1] + between(rng, [15, 62]);
    if (!onIsland(x, z, 0.92)) continue;
    const s = between(rng, [0.6, 1.4]);
    m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z) + 0.15, z), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.7, s));
    mesh.setMatrixAt(k, m);
    mesh.setColorAt(k, c.set(pick(rng, ['#f2d04a', '#e86a5a', '#f6f0e0', '#d070b0', '#f09a3a'])));
    k++;
  }
  ctx.scene.add(mesh);
}

// Days five and six: creatures appearing on the eastern meadow.
function creatures(ctx) {
  const rng = makeRng(12);
  const herd = [
    ['elephant', [34, -14]], ['elephant', [39, -17]],
    ['giraffe', [24, -20]], ['giraffe', [27, -23]],
    ['lion', [8, 8]], ['lion', [10, 6]],
    ['sheep', [-4, 14]], ['sheep', [-2, 16]], ['sheep', [-6, 17]],
    ['horse', [18, 2]], ['horse', [21, 4]],
    ['deer', [28, 12]], ['deer', [31, 14]],
    ['zebra', [14, -10]], ['zebra', [11, -12]],
    ['rabbit', [3, 22]], ['rabbit', [4, 23]],
    ['bear', [44, 2]],
    ['camel', [6, -6]], ['camel', [3, -8]],
    ['cow', [-10, 2]], ['cow', [-13, 0]],
  ];
  for (const [type, [x, z]] of herd) {
    const a = animal(ctx.kit, type);
    a.position.set(x, ctx.groundHeight(x, z), z);
    a.rotation.y = rng() * 6.28;
    ctx.scene.add(a);
    ctx.addCollider({ x, z, hx: 0.6, hz: 0.6, rot: 0, top: ctx.groundHeight(x, z) + 1.5 });
  }
  flock(ctx, { center: [20, -30], y: 18, radius: 22, count: 12, colors: ['#fbf7ee', '#f2d04a', '#4f9fd0', '#e86a5a'], speed: 0.22, size: 3 });
  flock(ctx, { center: [-10, -80], y: 24, radius: 30, count: 8, colors: ['#fbf7ee'], speed: -0.18, seed: 9, size: 3.2 });
}

// Whales and fish breaking the surface of the sea.
function seaLife(ctx) {
  const body = new THREE.SphereGeometry(1, 14, 10);
  const mat = ctx.kit.toon('#3a5a72');
  const belly = ctx.kit.toon('#d8e4e4');
  const list = [];
  for (const [x, z, s, ph] of [[60, -110, 5, 0], [-40, -130, 4, 2.4], [110, -60, 3.5, 4.1]]) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(body, mat);
    b.scale.set(s * 0.7, s * 0.55, s * 2);
    const u = new THREE.Mesh(body, belly);
    u.scale.set(s * 0.6, s * 0.3, s * 1.7);
    u.position.y = -s * 0.25;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(s * 1.6, s * 0.1, s * 0.6), mat);
    tail.position.z = -s * 2;
    g.add(b, u, tail);
    g.position.set(x, 0, z);
    g.rotation.y = ph;
    ctx.scene.add(g);
    list.push({ g, s, ph });
  }
  ctx.onFrame((t) => {
    for (const w of list) {
      const k = Math.sin(t * 0.5 + w.ph);
      w.g.position.y = -w.s * 0.7 + Math.max(0, k) * w.s * 0.6;
      w.g.rotation.x = -k * 0.2;
    }
  });
}

export default {
  title: 'Genesis 1: The Creation',
  subtitle: 'Light divided from darkness, land from the waters, and life upon the earth',
  seed: 1,

  style: { ...BASE_STYLE, fog: { color: '#e8cfa0', near: 160, far: 1300 } },

  sky: {
    zenith: '#141a44',
    mid: '#3c4e86',
    horizon: '#f2cf94',
    ground: '#2f7f94',
    glowColor: '#fff0c0',
    glowDir: [0.42, 0.16, -0.89],
  },

  sun: {
    dir: [0.5, 0.75, 0.45],
    color: '#fff2d6',
    intensity: 2.6,
    hemi: { sky: '#c8d6f0', ground: '#6a8a5a', intensity: 1.1 },
    shadowSize: 80,
  },

  ground: {
    size: 1600,
    segments: 260,
    flatRadius: 2000,
    hillHeight: 0,
    undulation: 0.1,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#8fb060',
      dirt: '#7aa050',
      grass: '#6a9a48',
      grassDark: '#4f7f3a',
      plaza: '#8fb060',
      plazaLine: '#8fb060',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#6a9a48',
    },
  },

  objects: [
    { type: 'trees', count: 34, center: [52, -30], ring: [0, 20], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e4e', '#5fa04a', '#2f7f4a', '#7fb050', '#d07a3a'] },
    { type: 'trees', count: 9, center: [30, 20], ring: [0, 14], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#5fa04a', '#7fb050', '#9fc060'], seed: 7 },
  ],

  custom(ctx) {
    sea(ctx);
    rocks(ctx);
    flowers(ctx);
    creatures(ctx);
    seaLife(ctx);
    stars(ctx, { count: 1100, minY: 0.04, region: (v) => v.x < 0.15 - v.z * 0.1 });
    skyDisc(ctx, [0.42, 0.16, -0.89], 1400, 60, '#fff6d8', { halo: 3.2, haloColor: '#ffd890' });
    skyDisc(ctx, [-0.55, 0.2, -0.81], 1400, 30, '#e8ecf4', { halo: 2.5, haloColor: '#a8b8e8' });
  },

  light: {
    beams: [
      { from: [0, 300, -140], to: [0, 0, -120], width: [70, 30], color: '#fff2c9', intensity: 0.22, layers: 3, stripes: 18, fadeLow: 0.05 },
    ],
    rayFans: [
      { source: [0, 260, -140], sourceJitter: 60, target: [0, -60], groundY: 0, spread: [20, 70], count: 7, width: [[6, 10], [10, 18]], color: '#fff0c4', intensity: 0.18, stripes: 9, fadeLow: 0.3 },
    ],
  },

  clouds: {
    layers: [
      { count: 16, angle: [0.2, 2.4], distance: [600, 1000], height: [40, 120], size: [50, 100], color: '#fff1d8', shade: '#6a5a72' },
      { count: 10, angle: [-2.6, -1.3], distance: [600, 1000], height: [50, 140], size: [60, 110], color: '#4a5080', shade: '#141a38' },
    ],
  },

  player: {
    start: [0, 32],
    lookAt: [6, -40],
    colors: { robe: '#efe3c2', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
