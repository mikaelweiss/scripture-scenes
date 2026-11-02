// Genesis 45: Joseph sends out the Egyptians and makes himself known to his brothers in his hall.
// x is east, z is south. The hall opens to the south, the dais stands against the north wall.
import { Batch, DAY_STYLE, addSun, ball, box, cyl, makeRng, palm, person, xf } from './lib/ot-13-kit.js';

const JOSEPH = [0, -15.5];
const BENJAMIN = [-0.6, -13.2];
const HALL = { x: 17, back: -30, front: 10, height: 9 };

const ROBES = ['#a87b4f', '#8c5a3c', '#7a6a52', '#c8a97a', '#6f8a6a', '#9c6b4e', '#b5916a', '#5e4632', '#bfa27a', '#7d5a3c'];
const MANTLES = ['#5e4632', '#c8912e', '#3e6e66', '#8c5a3c', '#a64b35', '#d9c7a3', '#6b5a4a', '#4f7f80', '#b5523b', '#7a6a52'];

function column(b, ctx, x, z, h) {
  const y = ctx.terrainHeight(x, z) - 0.1;
  b.add('#8c6a4a', box(1.9, 0.4, 1.9, [x, y + 0.2, z]));
  b.add('#efe3c2', cyl(0.62, 0.72, h - 2, [x, y + 0.4 + (h - 2) / 2, z], [0, 0, 0], 12));
  for (const [k, c] of [[0.25, '#2f8f8a'], [0.32, '#b5523b'], [0.39, '#c8912e']]) b.add(c, cyl(0.66, 0.66, 0.25, [x, y + 0.4 + (h - 2) * (k + 0.45), z], [0, 0, 0], 12));
  b.add('#3e8e6e', cyl(1.15, 0.6, 1.3, [x, y + h - 0.95, z], [0, 0, 0], 12));
  b.add('#c8912e', cyl(1.17, 1.17, 0.2, [x, y + h - 0.35, z], [0, 0, 0], 12));
  b.add('#e3cfa6', box(1.8, 0.4, 1.8, [x, y + h - 0.05, z]));
  ctx.addCollider({ x, z, hx: 0.75, hz: 0.75, rot: 0, top: y + h });
  ctx.exclude({ kind: 'circle', x, z, r: 1.3 });
}

function wall(b, ctx, kit, { x, z, w, d, h }) {
  const y = ctx.terrainHeight(x, z) - 0.2;
  b.add('#e3cfa6', box(w, h, d, [x, y + h / 2, z]));
  ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: y + h });
  ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 0.5, hz: d / 2 + 0.5 });
}

function custom(ctx) {
  const { THREE, kit } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(45);
  const { x: HX, back, front, height: H } = HALL;
  const len = front - back;
  const mid = (front + back) / 2;

  // Walls on three sides with a painted frieze and murals facing inward.
  wall(b, ctx, kit, { x: 0, z: back, w: HX * 2 + 2, d: 1.2, h: H + 1 });
  for (const s of [-1, 1]) wall(b, ctx, kit, { x: s * HX, z: mid, w: 1.2, d: len, h: H + 1 });
  const frieze = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 - 1, 1.1, 0.1), kit.fretMat('#2f8f8a', '#c8912e'));
  frieze.position.set(0, ctx.terrainHeight(0, back) + H - 1, back + 0.66);
  ctx.scene.add(frieze);
  for (const s of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, len - 1), kit.fretMat('#b5523b', '#efe3c2'));
    f.position.set(s * (HX - 0.66), ctx.terrainHeight(s * HX, mid) + H - 1, mid);
    ctx.scene.add(f);
    for (let i = 0; i < 6; i++) {
      const z = back + 4 + i * 5.6;
      const py = ctx.terrainHeight(s * HX, z);
      b.add(['#c8912e', '#2f8f8a', '#b5523b'][i % 3], box(0.08, 3.4, 3.6, [s * (HX - 0.64), py + 4.4, z]));
      b.add('#efe3c2', box(0.1, 2.6, 2.8, [s * (HX - 0.62), py + 4.4, z]));
      for (let k = 0; k < 3; k++) b.add(['#2b1a12', '#b5523b', '#2f8f8a'][k], box(0.12, 1.4 - k * 0.2, 0.35, [s * (HX - 0.6), py + 4.0 + k * 0.1, z - 0.8 + k * 0.8]));
    }
  }
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const by = ctx.terrainHeight(i * 4.5, back);
    b.add(['#c8912e', '#2f8f8a', '#b5523b'][(i + 3) % 3], box(3, 4.2, 0.08, [i * 4.6, by + 4.4, back + 0.64]));
    b.add('#efe3c2', box(2.4, 3.4, 0.1, [i * 4.6, by + 4.4, back + 0.66]));
    b.add('#2b1a12', box(0.5, 1.6, 0.12, [i * 4.6, by + 3.9, back + 0.68]));
    b.add('#c8912e', ball(0.3, [i * 4.6, by + 5.0, back + 0.7], [1, 1, 0.3], 8));
  }

  // Roofs over the side aisles, the nave open to the sky.
  for (const s of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(HX - 7, 0.8, len), kit.toon('#d8c095'));
    roof.position.set(s * (HX + 7) / 2, ctx.terrainHeight(0, mid) + H + 0.2, mid);
    roof.receiveShadow = true;
    ctx.scene.add(roof);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, len), kit.fretMat('#2f8f8a', '#efe3c2'));
    beam.position.set(s * 7.5, ctx.terrainHeight(0, mid) + H + 0.3, mid);
    ctx.scene.add(beam);
  }

  // Lotus columns in two rows down the hall and along the open front.
  for (let z = front - 2; z > back + 2; z -= 5.4) for (const s of [-1, 1]) column(b, ctx, s * 7.5, z, H);
  for (const x of [-12.5, 12.5]) column(b, ctx, x, front - 2, H);

  // The dais and Joseph's gilded seat, empty now.
  const dy = ctx.terrainHeight(0, -24);
  b.add('#e8d6ae', box(12, 1.2, 7, [0, dy + 0.4, -25.5]));
  for (let k = 0; k < 3; k++) b.add('#d8c095', box(6, 0.4 * (k + 1), 0.6, [0, dy + 0.2 * (k + 1) - 0.2, -21.4 + (2 - k) * 0.6]));
  ctx.addCollider({ x: 0, z: -25.5, hx: 6, hz: 3.5, rot: 0, top: dy + 1, walkable: true });
  for (let k = 0; k < 3; k++) ctx.addCollider({ x: 0, z: -21.4 + (2 - k) * 0.6, hx: 3, hz: 0.3, rot: 0, top: dy + 0.4 * (k + 1) - 0.2, walkable: true });
  const ty = dy + 1;
  b.add('#c8912e', box(2.2, 0.5, 1.8, [0, ty + 0.6, -26]), { emissive: '#3a2a10' });
  b.add('#c8912e', box(2.2, 2.6, 0.3, [0, ty + 1.7, -26.9]), { emissive: '#3a2a10' });
  for (const s of [-1, 1]) b.add('#2f8f8a', box(0.25, 1.1, 1.8, [s * 1.05, ty + 1.1, -26]));
  for (const s of [-1, 1]) {
    b.add('#6b4a33', cyl(0.05, 0.05, 3.2, [s * 3.6, ty + 1.6, -26.5], [0, 0, 0], 5));
    b.add('#efe3c2', xf(new THREE.CircleGeometry(0.8, 10, 0, Math.PI), { pos: [s * 3.6, ty + 3.2, -26.5] }));
  }
  b.add('#b5523b', box(5, 0.04, 12, [0, ctx.terrainHeight(0, -14) + 0.03, -14]), { cast: false });
  b.add('#c8912e', box(4.4, 0.05, 11.4, [0, ctx.terrainHeight(0, -14) + 0.035, -14]), { cast: false });
  b.add('#b5523b', box(3.6, 0.06, 10.6, [0, ctx.terrainHeight(0, -14) + 0.04, -14]), { cast: false });

  // Braziers and tall jars.
  for (const [x, z] of [[-4.5, -20], [4.5, -20], [-4.5, -5], [4.5, -5]]) {
    const y = ctx.terrainHeight(x, z);
    b.add('#8c6a4a', cyl(0.12, 0.2, 1.2, [x, y + 0.6, z], [0, 0, 0], 8));
    b.add('#c8912e', cyl(0.5, 0.25, 0.35, [x, y + 1.3, z], [0, 0, 0], 10), { emissive: '#4a3010' });
    ctx.addCollider({ x, z, hx: 0.4, hz: 0.4, rot: 0, top: y + 1.5 });
    ctx.exclude({ kind: 'circle', x, z, r: 0.8 });
  }
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1;
    const x = s * (HX - 1.6), z = back + 3 + Math.floor(i / 2) * 6.6;
    const y = ctx.terrainHeight(x, z);
    const jar = new THREE.LatheGeometry([[0.01, 0], [0.25, 0.05], [0.42, 0.55], [0.28, 1.0], [0.16, 1.1], [0.2, 1.22]].map(([r, h]) => new THREE.Vector2(r, h)), 10);
    b.add(i % 3 ? '#b5674a' : '#2f8f8a', jar.translate(x, y, z));
  }

  // Joseph in Egyptian linen, arms open to his brothers.
  person(ctx, { pos: JOSEPH, face: BENJAMIN, scale: 1.06, colors: { robe: '#fbf7ee', mantle: '#d9a441', skin: '#b5825a', hair: '#2e4f8a', sash: '#c8912e', arms: [0.7, 0.9] } });
  person(ctx, { pos: BENJAMIN, face: JOSEPH, scale: 0.97, colors: { robe: '#d9c7a3', mantle: '#4f7f80', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e', arms: [0.25, 0.8] } });

  // Ten brothers, stunned and troubled. Some fall back, some bow.
  const spots = [[-2.6, -12.4], [2.4, -12.6], [-4.4, -11.2], [4.4, -11.0], [-2.2, -9.8], [1.8, -10.0], [-5.6, -9.0], [3.8, -8.6], [-3.8, -8.0], [5.8, -12.6]];
  spots.forEach((p, i) => person(ctx, {
    pos: p,
    face: [JOSEPH[0] + (rng() - 0.5) * 2, JOSEPH[1]],
    kneel: i === 0 || i === 3 || i === 9,
    scale: 0.97 + rng() * 0.08,
    colors: { robe: ROBES[i], mantle: MANTLES[i], skin: ['#a87650', '#9c6a45', '#b5825a', '#8a5a3b'][i % 4], hair: '#2b1a12', sash: i % 2 ? '#efe3c2' : null, arms: i === 4 || i === 7 ? [0.15, 1.5] : null },
  }));
  b.add('#c9c9c9', cyl(0.12, 0.08, 0.22, [0.6, ctx.terrainHeight(0.6, -13.8) + 0.11, -13.8], [0, 0, 0], 10), { emissive: '#3a3a3a' });

  // Egyptians sent out, listening beyond the court.
  const eg = [[-9, 18], [-6.5, 19.5], [8, 17.5], [10.5, 19], [6, 21], [-11.5, 21]];
  eg.forEach((p, i) => person(ctx, { pos: p, face: [0, 0], colors: { robe: '#fbf7ee', mantle: i % 2 ? '#2f8f8a' : '#efe3c2', skin: '#9c6a45', hair: i % 3 ? '#2b1a12' : '#2e4f8a', sash: '#b5523b' } }));

  // Palms, pools and pyramids beyond.
  for (let i = 0; i < 30; i++) {
    const a = rng() * Math.PI * 2, r = 36 + rng() * 60;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 8;
    if (ctx.blocked(x, z, 2)) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 4, lean: 0.1 + rng() * 0.2, dir: rng() * 6, seed: i + 1 });
  }
  for (const [x, z, s] of [[-260, -380, 120], [-130, -430, 90], [-360, -300, 70]]) {
    b.add('#e3c48a', xf(new THREE.ConeGeometry(s * 0.75, s * 0.65, 4), { pos: [x, s * 0.32 - 2, z], rot: [0, Math.PI / 4, 0] }));
  }

  addSun(ctx, { dir: [0.4, 0.6, -0.7], size: 46 });
  b.flush();
}

export default {
  title: 'Genesis 45:1-15: Joseph reveals himself',
  subtitle: "Joseph's hall in Egypt, his brothers stunned before him",
  seed: 45,
  style: { ...DAY_STYLE, fog: { color: '#f2dcb0', near: 140, far: 900 } },
  sky: { zenith: '#2f6fa0', mid: '#7fb4cc', horizon: '#f5dca8', ground: '#d9b98a', glowColor: '#fff2c8', glowDir: [0.4, 0.6, -0.7] },
  sun: { dir: [0.35, 0.85, 0.3], color: '#fff2da', intensity: 2.6, hemi: { sky: '#e6eef0', ground: '#c09060', intensity: 1.25 }, shadowSize: 50 },
  ground: {
    size: 1000, segments: 200, flatRadius: 120, hillHeight: 10, undulation: 0.1,
    plaza: { center: [0, -10], size: [34, 40] },
    colors: { sand: '#dcbc80', dirt: '#d2b07a', grass: '#9aa060', grassDark: '#6c7a42', plaza: '#ece0c4', plazaLine: '#c9b48c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#d6b680' },
  },
  mountains: { count: 18, distance: [600, 850], height: [30, 70], widthRatio: [2.5, 4], colors: ['#d8bf90', '#cdb383', '#e0c89c'] },
  objects: [],
  custom,
  clouds: { layers: [{ count: 18, distance: [400, 800], height: [120, 200], size: [40, 80], color: '#fff6e4', shade: '#8a8aa0' }] },
  light: {
    glows: [{ at: JOSEPH, lift: 1.4, size: 4, color: '#fff3d0', opacity: 0.25 }],
  },
  player: {
    start: [0.5, -5],
    lookAt: JOSEPH,
    colors: { robe: '#a87b4f', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
