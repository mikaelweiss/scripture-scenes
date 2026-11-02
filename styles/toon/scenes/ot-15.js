// Exodus 2: Pharaoh's daughter comes down to wash at the river and finds the ark of bulrushes among the flags.
// x is east, z is south. The Nile fills the north, the near bank and the princess's landing are south of it.
import { Batch, DAY_STYLE, addSun, ball, box, cyl, makeRng, palm, person, reeds, waterPlane, xf } from './lib/ot-13-kit.js';

const SHORE = -8;
const WATER_Y = 0.22;
const BASKET = [7.2, -11.4];
const PRINCESS = [3.6, -7.0];
const MAID = [5.6, -9.9];
const MIRIAM = [-4.5, -7.6];

function custom(ctx) {
  const { THREE, kit } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(215);

  waterPlane(ctx, { center: [0, -60], size: [700, 104], y: WATER_Y, color: '#3f8f98', glints: 160, drift: [0.5, 0] });
  ctx.addCollider({ x: 0, z: SHORE - 1.4, hx: 350, hz: 1, rot: 0, top: 1.6 });

  // Mud bank sloping into the water.
  const bank = new THREE.Mesh(new THREE.BoxGeometry(700, 0.6, 3).translate(0, 0, 0), kit.toon('#8f7a52'));
  bank.position.set(0, -0.12, SHORE - 0.6);
  bank.rotation.x = 0.12;
  bank.receiveShadow = true;
  ctx.scene.add(bank);

  // The princess's stone landing with steps down into the river.
  const ly = ctx.terrainHeight(0.5, -6);
  b.add('#e3cfa6', box(9, 0.5, 5, [0.5, ly + 0.05, -5.5]));
  ctx.addCollider({ x: 0.5, z: -5.5, hx: 4.5, hz: 2.5, rot: 0, top: ly + 0.3, walkable: true });
  for (let k = 0; k < 3; k++) b.add('#d8c095', box(5, 0.3, 0.7, [0.5, ly - 0.1 - k * 0.2, -8.35 - k * 0.7]));
  for (const s of [-1, 1]) {
    b.add('#d8c095', box(0.8, 1.2, 0.8, [0.5 + s * 4.2, ly + 0.6, -7.6]));
    b.add('#2f8f8a', cyl(0.45, 0.3, 0.4, [0.5 + s * 4.2, ly + 1.4, -7.6], [0, 0, 0], 10));
    ctx.addCollider({ x: 0.5 + s * 4.2, z: -7.6, hx: 0.4, hz: 0.4, rot: 0, top: ly + 1.6 });
  }
  // A shade canopy on the landing.
  for (const [px, pz] of [[-2.6, -3.6], [3.6, -3.6], [-2.6, -7.0], [3.6, -7.0]]) b.add('#c8912e', cyl(0.07, 0.08, 3.2, [px, ly + 1.8, pz], [0, 0, 0], 6));
  b.add('#efe3c2', box(6.8, 0.08, 4, [0.5, ly + 3.4, -5.3]));
  b.add('#2f8f8a', box(6.9, 0.25, 0.1, [0.5, ly + 3.3, -7.3]));
  b.add('#b5523b', box(6.9, 0.25, 0.1, [0.5, ly + 3.3, -3.3]));

  // The ark of bulrushes, daubed with slime and pitch, with the child inside.
  const basket = new THREE.Group();
  const weave = new THREE.Mesh(new THREE.LatheGeometry([[0.01, -0.1], [0.42, -0.08], [0.5, 0.1], [0.52, 0.28]].map(([r, h]) => new THREE.Vector2(r, h)), 12).scale(1, 1, 1.5), kit.toon('#b8955a'));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.06, 6, 16).rotateX(Math.PI / 2).scale(1, 1, 1.5), kit.toon('#8c6a3c'));
  rim.position.y = 0.28;
  const pitch = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 12).scale(1, 1, 1.5), kit.toon('#3a2a1a'));
  pitch.position.y = 0.0;
  const cloth = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 7).scale(1, 0.6, 1.6), kit.toon('#f3eddf'));
  cloth.position.set(0, 0.2, 0.05);
  const babyHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), kit.toon('#c08f66'));
  babyHead.position.set(0, 0.24, -0.35);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 0.7), kit.toon('#a8854a'));
  lid.position.set(0, 0.28, 0.4);
  lid.rotation.x = -0.5;
  for (const m of [weave, rim, pitch, cloth, babyHead, lid]) {
    m.castShadow = true;
    basket.add(m);
  }
  basket.position.set(BASKET[0], WATER_Y - 0.08, BASKET[1]);
  basket.rotation.y = 0.6;
  basket.scale.setScalar(1.35);
  ctx.scene.add(basket);
  ctx.onFrame((t) => {
    basket.position.y = WATER_Y - 0.08 + Math.sin(t * 1.6) * 0.03;
    basket.rotation.z = Math.sin(t * 1.2) * 0.05;
  });

  // Flags and papyrus along the edge, thick around the ark.
  const clumps = [];
  for (let i = 0; i < 110; i++) {
    const x = -60 + rng() * 120;
    const z = SHORE - 0.5 - rng() * 6;
    if (Math.abs(x - 0.5) < 5.5 && z > -9.5) continue;
    if (Math.hypot(x - BASKET[0], z - BASKET[1]) < 3.2 && z > BASKET[1] - 1) continue;
    if (Math.hypot(x - MAID[0], z - MAID[1]) < 1.5) continue;
    if (x > 2 && x < 16 && z > -11) continue;
    clumps.push([x, z]);
  }
  for (let i = 0; i < 10; i++) clumps.push([BASKET[0] - 2.5 + i * 0.6 + rng() * 0.3, BASKET[1] - 1.2 - rng() * 1.2]);
  reeds(b, ctx, { points: clumps, height: [1.2, 2.6], papyrus: 0.35, y: 0.05, seed: 7, color: '#7a9a4a', dark: '#5f8a3e', head: '#a8b85a' });
  const bankClumps = [];
  for (let i = 0; i < 40; i++) {
    const x = -60 + rng() * 120, z = SHORE + 0.5 + rng() * 3;
    if (x > -6 && x < 18) continue;
    bankClumps.push([x, z]);
  }
  reeds(b, ctx, { points: bankClumps, height: [0.8, 1.6], papyrus: 0.15, seed: 8, color: '#8aa04e', dark: '#6f8a44', head: '#a8b85a' });

  // Lotus pads and blossoms.
  for (let i = 0; i < 60; i++) {
    const x = -30 + rng() * 60, z = SHORE - 3 - rng() * 14;
    b.add(rng() < 0.5 ? '#4f8a4a' : '#3e7442', cyl(0.4 + rng() * 0.3, 0.4, 0.03, [x, WATER_Y + 0.02, z], [0, 0, 0], 9), { cast: false });
    if (rng() < 0.3) b.add(rng() < 0.5 ? '#f3eddf' : '#7a9ad0', xf(new THREE.ConeGeometry(0.16, 0.25, 6).rotateX(Math.PI), { pos: [x, WATER_Y + 0.2, z] }), { cast: false });
  }

  // Pharaoh's daughter and her maidens walking by the river's side.
  person(ctx, { pos: PRINCESS, y: ly + 0.3, face: BASKET, scale: 1.04, colors: { robe: '#fbf7ee', mantle: '#d9a441', skin: '#b5825a', hair: '#1f140e', sash: '#2f8f8a', arms: [0.35, 1.2] } });
  person(ctx, { pos: MAID, y: WATER_Y - 0.6, face: BASKET, colors: { robe: '#efe3c2', mantle: '#efe3c2', skin: '#9c6a45', hair: '#1f140e', sash: '#b5523b', arms: [0.2, 1.4] } });
  const maids = [[1.4, -5.6], [4.6, -4.6], [-1.5, -4.0], [12.5, -1.0], [-3.6, -2.0]];
  maids.forEach((p, i) => person(ctx, { pos: p, face: i < 2 ? BASKET : PRINCESS, colors: { robe: '#efe3c2', mantle: ['#efe3c2', '#2f8f8a', '#b5523b', '#c8912e', '#efe3c2'][i], skin: ['#9c6a45', '#a87650', '#8a5a3b'][i % 3], hair: '#1f140e', sash: '#c8912e' } }));
  for (const [x, z] of [[1.4, -5.6], [4.6, -4.6]]) {
    b.add('#c8912e', cyl(0.03, 0.03, 2.2, [x + 0.35, ly + 1.4, z], [0, 0, 0], 5));
    b.add('#2f8f8a', xf(new THREE.CircleGeometry(0.6, 10, 0, Math.PI), { pos: [x + 0.35, ly + 2.5, z] }));
  }

  // Miriam, his sister, watching from among the reeds.
  person(ctx, { pos: MIRIAM, face: BASKET, kneel: true, scale: 0.72, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e' } });
  reeds(b, ctx, { points: [[-3.6, -8.4], [-5.6, -8.2], [-4.6, -9.0]], height: [1.0, 1.6], seed: 9, color: '#7a9a4a', dark: '#5f8a3e', head: '#a8b85a' });

  // Palms and a palace on the near shore, palms on the far bank.
  for (let i = 0; i < 26; i++) {
    const x = -70 + rng() * 140, z = 8 + rng() * 40;
    if (Math.abs(x) < 10 && z < 18) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 4, lean: 0.1 + rng() * 0.25, dir: rng() * 6, seed: i + 30 });
  }
  for (const s of [-1, 1]) palm(b, ctx, { pos: [s * 10 + 4, 0.5], height: 8.5, lean: 0.25, dir: s > 0 ? 2.5 : 0.6, seed: s + 60 });
  const px = 0, pz = 40, py = ctx.terrainHeight(px, pz) - 0.2;
  for (const s of [-1, 1]) {
    b.add('#e3cfa6', xf(new THREE.CylinderGeometry(4.2, 5.5, 14, 4), { pos: [px + s * 9, py + 7, pz], rot: [0, Math.PI / 4, 0], scale: [1.4, 1, 0.6] }));
    b.add('#b5523b', box(8, 0.8, 4, [px + s * 9, py + 12, pz + 0.4]));
  }
  b.add('#2b1a12', box(4.5, 7, 0.4, [px, py + 3.5, pz + 1.7]));
  b.add('#d8c095', box(8, 2.4, 3, [px, py + 8.2, pz]));
  b.add('#e3cfa6', box(46, 6, 16, [px, py + 3, pz + 12]));
  ctx.addCollider({ x: px, z: pz + 6, hx: 23, hz: 10, rot: 0, top: py + 14 });
  for (let i = 0; i < 24; i++) {
    const x = -80 + rng() * 160, z = -114 - rng() * 20;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 3, lean: 0.15, dir: rng() * 6, seed: i + 90 });
  }
  for (const [x, z, s] of [[-180, -420, 110], [-60, -470, 80]]) b.add('#e3c48a', xf(new THREE.ConeGeometry(s * 0.75, s * 0.65, 4), { pos: [x, s * 0.32 - 2, z], rot: [0, Math.PI / 4, 0] }));
  for (let i = 0; i < 40; i++) {
    const x = -60 + rng() * 120, z = rng() * 30;
    if (ctx.blocked(x, z, 1) || (Math.abs(x) < 9 && z < 8)) continue;
    b.add(['#7d8a4a', '#6c7a42'][i % 2], ball(0.4 + rng() * 0.5, [x, ctx.terrainHeight(x, z) + 0.1, z], [1.3, 0.6, 1.1], 7));
  }

  addSun(ctx, { dir: [0.7, 0.35, -0.6], size: 50 });
  b.flush();
}

export default {
  title: 'Exodus 2:1-10: Moses in the bulrushes',
  subtitle: "The bank of the Nile, Pharaoh's daughter finds the ark",
  seed: 2,
  style: { ...DAY_STYLE, fog: { color: '#f2dcb0', near: 140, far: 900 } },
  sky: { zenith: '#3a7fae', mid: '#86bcd0', horizon: '#f5dca8', ground: '#d9b98a', glowColor: '#fff2c8', glowDir: [0.7, 0.35, -0.6] },
  sun: { dir: [0.6, 0.6, -0.4], color: '#fff2da', intensity: 2.5, hemi: { sky: '#dfeef2', ground: '#b88a5a', intensity: 1.2 }, shadowSize: 50 },
  ground: {
    size: 1000, segments: 200, flatRadius: 160, hillHeight: 12, undulation: 0.08,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#d6b47a', dirt: '#a88a5a', grass: '#8ea05a', grassDark: '#6c7a42', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c8a874' },
  },
  mountains: { count: 18, distance: [600, 850], height: [30, 70], widthRatio: [2.5, 4], colors: ['#d8bf90', '#cdb383', '#e0c89c'] },
  objects: [],
  custom,
  clouds: { layers: [{ count: 24, distance: [400, 800], height: [110, 200], size: [40, 80], color: '#fff6e4', shade: '#8a8aa0' }] },
  light: { glows: [{ at: BASKET, lift: 0.6, size: 2.6, color: '#fff3d0', opacity: 0.35 }] },
  player: {
    start: [7.6, -4.6],
    lookAt: [4.6, -11],
    fov: 42,
    colors: { robe: '#a87b4f', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
