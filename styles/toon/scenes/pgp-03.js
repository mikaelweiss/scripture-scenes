// Moses 7:21, 69: the city of Enoch, Zion, taken up into heaven, while the people of the plain look on.
// Coordinates are meters. x is east, z is south. The city floats to the north above the scar it left.
import { BASE_STYLE, ROBES, THREE, Parts, between, figures, glow, makeRng, motes, pick, unit } from './lib/pgp-01-kit.js';

const CITY = [0, -46];
const LIFT = 26;
const R = 30;

function island(ctx) {
  const rng = makeRng(70);
  const group = new THREE.Group();
  const base = ctx.terrainHeight(...CITY);
  group.position.set(CITY[0], base + LIFT, CITY[1]);
  group.rotation.x = 0.2;
  ctx.scene.add(group);

  const p = new Parts();
  const under = new THREE.ConeGeometry(R, 22, 14, 3);
  under.rotateX(Math.PI);
  const pos = under.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > -10.9 && y < 10.9) {
      pos.setX(i, pos.getX(i) * (0.85 + rng() * 0.3));
      pos.setZ(i, pos.getZ(i) * (0.85 + rng() * 0.3));
    }
  }
  under.computeVertexNormals();
  const rock = new Parts();
  rock.add('#b08c64', under, { pos: [0, -12, 0] });
  p.add('#7a9a5a', new THREE.CylinderGeometry(R, R * 0.98, 1.4, 40), { pos: [0, -0.7, 0] });
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2, r = between(rng, [4, R * 0.8]);
    const s = between(rng, [1, 3]);
    rock.add(pick(rng, ['#9a7a58', '#b08c64', '#8a6a4a']), unit.rock, { pos: [Math.sin(a) * r, -between(rng, [3, 18]) * (1 - r / R), Math.cos(a) * r], rot: [rng() * 3, rng() * 3, 0], scale: [s, s * 1.4, s] });
  }

  const walls = '#e9dfc6';
  const segs = 40;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const len = (2 * Math.PI * (R - 1)) / segs + 0.2;
    p.box(walls, [len, 2.2, 0.8], [Math.sin(a) * (R - 1), 1.1, Math.cos(a) * (R - 1)], [0, a + Math.PI / 2, 0]);
    if (i % 5 === 0) p.box('#f4ecd8', [2.2, 4.2, 2.2], [Math.sin(a) * (R - 1), 2.1, Math.cos(a) * (R - 1)], [0, a, 0]);
  }

  const houseColors = ['#f4ecd8', '#ece0c4', '#e6d4b0', '#f8f2e4', '#e0cfa8'];
  const roofColors = ['#c8912e', '#b5523b', '#d8c095', '#8c5a3c'];
  for (let gx = -26; gx <= 26; gx += 6) {
    for (let gz = -26; gz <= 26; gz += 6) {
      const r = Math.hypot(gx, gz);
      if (r > R - 5 || r < 9 || Math.abs(gx) < 2 || Math.abs(gz) < 2) continue;
      const w = between(rng, [3.4, 4.6]), d = between(rng, [3.4, 4.6]), h = between(rng, [2.6, 5.5]) + (r < 16 ? 1.5 : 0);
      const x = gx + (rng() - 0.5), z = gz + (rng() - 0.5);
      p.box(pick(rng, houseColors), [w, h, d], [x, h / 2, z]);
      p.box(pick(rng, roofColors), [w + 0.3, 0.3, d + 0.3], [x, h + 0.15, z]);
      if (rng() < 0.25) p.add('#f8f2e4', new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), { pos: [x, h + 0.3, z], scale: Math.min(w, d) * 0.42 });
    }
  }

  // Temple at the heart of Zion.
  p.box('#f8f2e4', [14, 2, 14], [0, 1, 0]);
  p.box('#f4ecd8', [10, 5, 10], [0, 4.5, 0]);
  p.box('#c8912e', [10.4, 0.5, 10.4], [0, 7.2, 0]);
  p.box('#f8f2e4', [6, 5, 6], [0, 9.9, 0]);
  p.add('#ffe8a8', unit.cone, { pos: [0, 15.5, 0], scale: [4.4, 6.5, 4.4], rot: [0, Math.PI / 4, 0] });
  group.add(p.group(ctx.kit));
  group.add(rock.group(ctx.kit, { emissive: 0.3 }));

  const people = [];
  for (let i = 0; i < 520; i++) {
    const a = rng() * Math.PI * 2;
    const r = between(rng, [8, R - 2.2]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const onStreet = Math.abs(x) < 2 || Math.abs(z) < 2 || r > R - 5 || r < 9.5;
    if (!onStreet) continue;
    const robe = pick(rng, ['#fbf7ee', '#f3eddf', '#e9dcc0', '#d9c7a3', '#efe3c2']);
    people.push({ x, y: 0, z, yaw: Math.atan2(-x, -z) + Math.PI, scale: between(rng, [0.9, 1.05]), colors: [robe, pick(rng, ['#e9dcc0', '#c8a97a', robe]), pick(rng, ROBES.skins), pick(rng, ROBES.hair)] });
  }
  figures(ctx, people, { parent: group, glow: 0.15 });

  const hover = group.position.y;
  ctx.onFrame((t) => {
    group.position.y = hover + Math.sin(t * 0.4) * 0.6;
  });
}

// The bare scar where the city stood, with light streaming upward from it.
function scar(ctx) {
  const rng = makeRng(4);
  const geo = new THREE.CircleGeometry(R * 1.05, 48);
  const pos = geo.attributes.position;
  for (let i = 1; i < pos.count; i++) {
    const k = 0.88 + rng() * 0.2;
    pos.setX(i, pos.getX(i) * k);
    pos.setY(i, pos.getY(i) * k);
  }
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, ctx.kit.toon('#6a4a32', { emissive: '#000000' }));
  mesh.position.set(CITY[0], ctx.terrainHeight(...CITY) + 0.25, CITY[1]);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  const p = new Parts();
  for (let i = 0; i < 60; i++) {
    const a = rng() * Math.PI * 2, r = between(rng, [R * 0.95, R * 1.25]);
    const x = CITY[0] + Math.sin(a) * r, z = CITY[1] + Math.cos(a) * r;
    const s = between(rng, [0.6, 2.2]);
    p.add(pick(rng, ['#8a6a4a', '#6c5440', '#a08060']), unit.rock, { pos: [x, ctx.terrainHeight(x, z), z], rot: [rng() * 3, rng() * 3, rng() * 3], scale: [s * 1.4, s, s * 1.2] });
  }
  ctx.scene.add(p.group(ctx.kit));
  ctx.exclude({ kind: 'circle', x: CITY[0], z: CITY[1], r: R * 1.3 });

  const pts = [];
  for (let i = 0; i < 700; i++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * R;
    pts.push(CITY[0] + Math.sin(a) * r, rng() * 6, CITY[1] + Math.cos(a) * r);
  }
  motes(ctx, pts, { color: '#fff1c0', size: 2.6, rise: 2.5, span: 28 });
}

// Ordinary mud-brick houses of the plain, left behind.
function village(ctx) {
  const rng = makeRng(12);
  const p = new Parts();
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * between(rng, [42, 110]), z = between(rng, [-90, 60]);
    const w = between(rng, [4, 7]), d = between(rng, [4, 6]), h = between(rng, [2.6, 3.6]);
    const y = ctx.terrainHeight(x, z);
    const rot = rng() * 0.6;
    p.box(pick(rng, ['#b8946a', '#a8845a', '#c4a078']), [w, h, d], [x, y + h / 2 - 0.2, z], [0, rot, 0]);
    p.box('#7a5a3c', [w + 0.4, 0.35, d + 0.4], [x, y + h, z], [0, rot, 0]);
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot, top: y + h });
  }
  ctx.scene.add(p.group(ctx.kit));
}

export default {
  title: "Moses 7:13-21, 69: Enoch's Zion taken up",
  subtitle: 'The Lord came and dwelt with his people, and Zion was taken up into heaven',
  seed: 103,

  style: { ...BASE_STYLE, fog: { color: '#f0dcb4', near: 160, far: 1100 } },

  sky: {
    zenith: '#2e5a86',
    mid: '#7ea4c0',
    horizon: '#f8dca8',
    ground: '#c8a878',
    glowColor: '#fff2c8',
    glowDir: [0, 0.8, -0.6],
  },

  sun: {
    dir: [0.4, 0.8, 0.45],
    color: '#fff0d6',
    intensity: 2.6,
    hemi: { sky: '#dce8ee', ground: '#a07a52', intensity: 1.15 },
    shadowSize: 80,
  },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 160,
    hillHeight: 40,
    undulation: 0.3,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#c8aa72',
      dirt: '#b08a58',
      grass: '#8e9a58',
      grassDark: '#6c7a42',
      plaza: '#c8aa72',
      plazaLine: '#c8aa72',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#7f9a6a',
    },
  },

  mountains: { count: 32, distance: [520, 800], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#7f98a0', '#8aa0a4', '#9aa8a8', '#7a8e94'] },

  objects: [
    {
      type: 'platform',
      pos: [0, 52],
      rot: Math.PI,
      tiers: [
        { size: [30, 22], height: 4 },
        { size: [22, 16], height: 4 },
        { size: [14, 10], height: 4 },
      ],
      stairWidth: 6,
      rise: 0.4,
      stairDepth: 0.6,
      colors: { stone: '#b89a72', stair: '#a8885e', fret: ['#8a6a4a', '#c8aa72'] },
    },
    { type: 'trees', count: 60, ring: [60, 220], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#5f9e6a', '#7fa050'] },
    { type: 'stones', count: 300, ring: [5, 100], size: [0.12, 0.4], colors: ['#a89880', '#8a7a66', '#b8a88c'] },
  ],

  custom(ctx) {
    scar(ctx);
    island(ctx);
    village(ctx);
  },

  clouds: {
    layers: [
      { count: 22, center: CITY, distance: [60, 150], height: [120, 160], size: [30, 55], color: '#fffaf0', shade: '#8a80a0', drift: 0.006 },
      { count: 34, distance: [450, 900], height: [70, 170], size: [40, 90], color: '#fff1d8', shade: '#6a6080' },
    ],
  },

  light: {
    beams: [{ from: [CITY[0], 260, CITY[1]], to: [CITY[0], 0, CITY[1]], width: [70, 48], color: '#fff2c9', intensity: 0.17, layers: 3, stripes: 30, fadeLow: 0.02 }],
    rayFans: [{ source: [0, 260, -46], sourceJitter: 40, target: CITY, groundY: 30, spread: [30, 70], count: 8, width: [[5, 9], [9, 14]], color: '#fff0c4', intensity: 0.15, stripes: 9, fadeLow: 0.3 }],
    glows: [{ pos: [CITY[0], 40, CITY[1]], size: 120, color: '#fff3d0', opacity: 0.35 }],
  },

  crowd: {
    seed: 7,
    minSpacing: 0.7,
    facing: [CITY[0], CITY[1]],
    colors: ROBES,
    groups: [
      { center: CITY, radius: [44, 72], angle: [-1.3, 1.3], count: 520, kneel: 0.15, children: 0.12 },
      { center: CITY, radius: [44, 64], angle: [1.6, 2.6], count: 90, kneel: 0.1, children: 0.1 },
      { center: CITY, radius: [44, 64], angle: [-2.6, -1.6], count: 90, kneel: 0.1, children: 0.1 },
    ],
    aisles: [{ from: [0, 40], to: [0, -10], width: 4 }],
  },

  player: {
    start: [0, 54],
    lookAt: [0, -46],
    colors: { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
