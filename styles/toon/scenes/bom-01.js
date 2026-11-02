// 1 Nephi 1: Lehi prophesies in the streets of Jerusalem and the people mock him.
// x is east, z is south. The street runs north to the temple; Lehi stands on a step in the market square.
import { Batch, DAY_STYLE, PALETTE, addSun, cityWall, frameAt, house, makeRng, person, xf } from './lib/bom-01-kit.js';

const LEHI = [0, -14];
const STONES = ['#e3cfa6', '#d8c095', '#cdb48a', '#e8d9b5', '#d6c09a'];
const AWNINGS = ['#b5523b', '#4f7f80', '#c8912e', '#e6d8b8', '#6f8a6a'];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(101);

  // Lehi's speaking step.
  const ly = ctx.terrainHeight(...LEHI);
  b.add('#d8c095', xf(new THREE.BoxGeometry(5, 1.1, 4), { pos: [LEHI[0], ly + 0.3, LEHI[1]] }));
  b.add('#cdb48a', xf(new THREE.BoxGeometry(3, 0.55, 0.9), { pos: [LEHI[0], ly + 0.02, LEHI[1] + 2.4] }));
  ctx.addCollider({ x: LEHI[0], z: LEHI[1], hx: 2.5, hz: 2, rot: 0, top: ly + 0.85, walkable: true });
  ctx.addCollider({ x: LEHI[0], z: LEHI[1] + 2.4, hx: 1.5, hz: 0.45, rot: 0, top: ly + 0.3, walkable: true });

  // Houses lining the street and filling the city behind.
  const taken = [];
  const free = (x, z, r) => taken.every(([tx, tz, tr]) => Math.hypot(tx - x, tz - z) > r + tr);
  const addHouse = (x, z, w, d, h, rot, front = true) => {
    taken.push([x, z, Math.max(w, d) * 0.55]);
    house(b, ctx, { pos: [x, z], size: [w, d], height: h, rot, color: STONES[Math.floor(rng() * STONES.length)], trim: '#c3a676', upper: rng() < 0.35, door: front ? '#3a2418' : null });
  };
  for (let z = 44; z > -66; z -= 8.5) {
    for (const side of [-1, 1]) {
      const square = z < 6 && z > -32;
      const x = side * (square ? 19 : 10.5) + side * rng() * 0.6;
      const w = 6 + rng() * 1.5, d = 6.5 + rng() * 1.5, h = 3.6 + rng() * 2.6;
      addHouse(x, z, d, w, h, -side * Math.PI / 2);
    }
  }
  for (const z of [-30, 4]) for (const side of [-1, 1]) addHouse(side * 11, z + (z < 0 ? -1 : 1) * 0, 6, 5.5, 3.4 + rng(), z < 0 ? 0 : Math.PI);
  for (let i = 0; i < 160; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (18 + rng() * 70);
    const z = 60 - rng() * 150;
    if (Math.abs(x) < 26 && z < 8 && z > -34) continue;
    if (Math.abs(x) < 42 && z < -76) continue;
    if (!free(x, z, 4)) continue;
    addHouse(x, z, 5.5 + rng() * 3, 5.5 + rng() * 3, 3.2 + rng() * 4, Math.floor(rng() * 4) * Math.PI / 2 + (rng() - 0.5) * 0.1, true);
  }

  // Market awnings around the square.
  const stall = (x, z, rot, color) => {
    const y = ctx.terrainHeight(x, z);
    const f = frameAt(x, y, z, rot);
    for (const [px, pz] of [[-1.3, -0.9], [1.3, -0.9], [-1.3, 0.9], [1.3, 0.9]]) b.add('#6b4a33', new THREE.CylinderGeometry(0.06, 0.07, 2.4, 5).translate(px, 1.2 + (pz > 0 ? -0.2 : 0), pz), { frame: f });
    b.add(color, xf(new THREE.BoxGeometry(3, 0.08, 2.2), { pos: [0, 2.3, 0], rot: [0.18, 0, 0] }), { frame: f });
    b.add('#8c5a3c', xf(new THREE.BoxGeometry(2.4, 0.8, 0.9), { pos: [0, 0.4, 0.2] }), { frame: f });
    for (let k = 0; k < 4; k++) b.add(['#c8912e', '#b5523b', '#6f8a6a'][k % 3], new THREE.SphereGeometry(0.2, 8, 6).translate(-0.9 + k * 0.6, 0.95, 0.25), { frame: f });
    ctx.addCollider({ x, z, hx: 1.5, hz: 1.1, rot, top: y + 2.3 });
    ctx.exclude({ kind: 'rect', x, z, hx: 1.9, hz: 1.5, rot });
  };
  stall(-13.5, -4, Math.PI / 2, AWNINGS[0]);
  stall(-13.5, -22, Math.PI / 2, AWNINGS[1]);
  stall(13.5, -6, -Math.PI / 2, AWNINGS[2]);
  stall(13.5, -24, -Math.PI / 2, AWNINGS[4]);

  // Water jars and baskets.
  for (let i = 0; i < 40; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const z = 40 - rng() * 100;
    const x = side * (Math.abs(z + 13) < 18 ? 15.5 : 6.6) + (rng() - 0.5) * 0.6;
    if (ctx.blocked(x, z, 0.3)) continue;
    const y = ctx.terrainHeight(x, z);
    const jar = new THREE.LatheGeometry([[0.01, 0], [0.22, 0.05], [0.3, 0.35], [0.2, 0.62], [0.12, 0.7], [0.14, 0.78]].map(([r, h]) => new THREE.Vector2(r, h)), 8);
    b.add(rng() < 0.6 ? '#b5674a' : '#c8a07a', jar.translate(x, y, z));
  }

  // Temple of Solomon to the north on its raised court.
  const T = [0, -112];
  const ty = ctx.terrainHeight(...T) - 0.3;
  b.add('#e8d9b5', xf(new THREE.BoxGeometry(70, 5, 46), { pos: [T[0], ty + 2.5, T[1]] }));
  for (let k = 0; k < 9; k++) b.add('#d8c095', xf(new THREE.BoxGeometry(18, 0.55, 0.9), { pos: [T[0], ty + 0.27 + k * 0.55, T[1] + 23 + 0.45 + (8 - k) * 0.9] }));
  b.add('#f1e6c8', xf(new THREE.BoxGeometry(14, 16, 30), { pos: [T[0], ty + 5 + 8, T[1] - 4] }));
  b.add('#f1e6c8', xf(new THREE.BoxGeometry(20, 20, 6), { pos: [T[0], ty + 5 + 10, T[1] + 13] }));
  b.add('#c8912e', xf(new THREE.BoxGeometry(20.6, 1, 6.6), { pos: [T[0], ty + 5 + 20.3, T[1] + 13] }));
  b.add('#c8912e', xf(new THREE.BoxGeometry(14.6, 0.8, 30.6), { pos: [T[0], ty + 5 + 16.2, T[1] - 4] }));
  b.add('#3a2418', xf(new THREE.BoxGeometry(5, 9, 0.2), { pos: [T[0], ty + 5 + 4.5, T[1] + 16.05] }));
  for (const sx of [-5, 5]) {
    b.add('#b07a3c', new THREE.CylinderGeometry(0.75, 0.8, 11, 12).translate(T[0] + sx, ty + 5 + 5.5, T[1] + 18));
    b.add('#c8912e', new THREE.SphereGeometry(1.1, 12, 8).translate(T[0] + sx, ty + 5 + 11.6, T[1] + 18));
  }
  for (const [cx, cz, w, d] of [[-34, -112, 2, 46], [34, -112, 2, 46], [0, -134, 70, 2]]) {
    b.add('#d8c095', xf(new THREE.BoxGeometry(w, 4, d), { pos: [cx, ty + 7, cz] }));
  }
  ctx.addCollider({ x: T[0], z: T[1], hx: 35, hz: 23, rot: 0, top: ty + 5, walkable: true });
  ctx.addCollider({ x: T[0], z: T[1] - 4, hx: 7, hz: 15, rot: 0, top: ty + 21 });
  ctx.addCollider({ x: T[0], z: T[1] + 13, hx: 10, hz: 3, rot: 0, top: ty + 25 });
  ctx.exclude({ kind: 'rect', x: T[0], z: T[1] + 4, hx: 36, hz: 30 });
  for (let k = 0; k < 9; k++) ctx.addCollider({ x: T[0], z: T[1] + 23 + 0.45 + (8 - k) * 0.9, hx: 9, hz: 0.45, rot: 0, top: ty + 0.55 * (k + 1), walkable: true });

  // City walls on the edge of the hill.
  cityWall(b, ctx, { from: [-95, 70], to: [95, 70], height: 8, color: '#cdb48a' });
  cityWall(b, ctx, { from: [-95, -145], to: [95, -145], height: 8, color: '#cdb48a' });
  cityWall(b, ctx, { from: [-95, 70], to: [-95, -145], height: 8, color: '#cdb48a' });
  cityWall(b, ctx, { from: [95, 70], to: [95, -145], height: 8, color: '#cdb48a' });

  b.flush();

  // Lehi, arms raised, crying repentance. A few mockers point and jeer from the front.
  person(ctx, { pos: LEHI, y: ly + 0.85, face: [0, 20], scale: 1.25, colors: { robe: '#f1e8d2', mantle: '#4f7f80', skin: '#a8724a', hair: '#d9d2c4', sash: '#c8912e', arms: [2.35, 0.35] } });
  const mockers = [[-3.2, -8.5], [2.8, -8], [-1.4, -6.8], [4.6, -10.5], [-4.8, -11]];
  mockers.forEach(([x, z], i) => person(ctx, { pos: [x, z], face: LEHI, colors: { robe: ['#b5523b', '#c98b3c', '#7a6a52', '#9c6b4e', '#4f7f80'][i], mantle: ['#5e4632', '#8c5a3c', '#c8912e', '#3e6e66', '#a64b35'][i], skin: '#9c6a45', hair: '#2b1a12', arms: i % 2 ? [0.25, 1.45] : [0.9, 1.1] } }));
}

export default {
  title: '1 Nephi 1: Lehi prophesies in Jerusalem',
  subtitle: 'Jerusalem, 600 BC. The people mock him',
  seed: 101,
  style: DAY_STYLE,
  sky: { zenith: '#3a7fa8', mid: '#86b8c8', horizon: '#f2dcae', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [0.6, 0.55, -0.6] },
  sun: { dir: [0.55, 0.8, -0.35], color: '#fff2d8', intensity: 2.7, hemi: { sky: '#dcecf0', ground: '#b98a5a', intensity: 1.1 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 160, hillHeight: 45, undulation: 0.18,
    plaza: { center: [0, -14], size: [16, 120] },
    colors: { sand: '#d8b47a', dirt: '#c49a62', grass: '#a8a466', grassDark: '#8a8a52', plaza: '#e6d6b0', plazaLine: '#c7ab7c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a89a6a' },
  },
  mountains: { count: 30, distance: [480, 780], height: [50, 120], widthRatio: [1.8, 2.8], colors: ['#b8a07a', '#a89070', '#9c9a74', '#b4a684'] },
  objects: [
    { type: 'trees', count: 50, ring: [105, 200], height: [4, 6], broken: 0, fallen: 0, trunkColor: '#6b5a4a', leafColors: ['#8a9a6a', '#7a8c62', '#9aa478'] },
    { type: 'stones', count: 200, ring: [4, 60], size: [0.1, 0.3], colors: ['#cdb48a', '#b89a70', '#d9c39a'] },
  ],
  custom,
  clouds: { layers: [{ count: 30, distance: [400, 800], height: [90, 180], size: [40, 80], color: '#fff6e6', shade: '#7f8aa8' }] },
  crowd: {
    seed: 7,
    minSpacing: 0.66,
    facing: LEHI,
    colors: PALETTE,
    aisles: [{ from: [0, 16], to: [0, -10.5], width: 3.2 }],
    keepClear: [{ kind: 'rect', x: 0, z: -14, hx: 3.4, hz: 3.6 }],
    groups: [
      { center: LEHI, radius: [4.5, 13], angle: [-1.9, 1.9], count: 190, children: 0.1, lean: 0.12, facingJitter: 0.9 },
      { shape: 'rect', center: [0, 24], size: [9, 26], count: 40, children: 0.1, facingJitter: 1.6 },
      { shape: 'rect', center: [0, -45], size: [8, 30], count: 30, children: 0.1, facingJitter: 2.5 },
    ],
  },
  player: {
    start: [0, -2.5],
    lookAt: [-2.2, -14],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
