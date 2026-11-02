// Luke 1:26-38: the angel Gabriel comes to Mary in her home in Nazareth.
// x is east, z is south. Mary's house opens south toward the player.
import { Batch, DAY_STYLE, PALETTE, ball, box, cypress, glow, house, lamp, makeRng, olive, person, room, xf } from './lib/nt-01-kit.js';

const MARY = [-1.7, -7.4];
const GABRIEL = [1.9, -7.6];
const WALLS = ['#d9c49a', '#cdb48a', '#e0cfa8', '#c9ad80'];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(101);

  const { y: fy } = room(b, ctx, { pos: [0, -7], size: [11, 8], height: 3.6, color: '#d9c49a', floor: '#b8986c', windows: [[1.6, 2.3, 'back']], door: '#5e3f28' });

  // Mary's things: sleeping mat, water jar, spindle basket, low table with a scroll and lamp.
  b.add('#b5523b', box(2.2, 0.08, 1.1, [-3.8, fy + 0.04, -9.3]), { cast: false });
  b.add('#e6d8b8', xf(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 10), { pos: [-3.8, fy + 0.35, -9.9], rot: [0, 0, Math.PI / 2] }));
  b.add('#b5623b', ball(0.38, [-4.6, fy + 0.45, -6.2], [1, 1.25, 1], 10));
  b.add('#b5623b', xf(new THREE.CylinderGeometry(0.14, 0.2, 0.3, 10), { pos: [-4.6, fy + 1.0, -6.2] }));
  b.add('#a87b4f', xf(new THREE.CylinderGeometry(0.4, 0.3, 0.35, 10), { pos: [-2.9, fy + 0.18, -6.1] }));
  b.add('#efe3c2', ball(0.22, [-2.9, fy + 0.38, -6.1], [1.3, 0.6, 1.3], 8));
  b.add('#7a5636', box(1.4, 0.45, 0.7, [-0.1, fy + 0.22, -9.4]));
  b.add('#efe3c2', xf(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8), { pos: [-0.3, fy + 0.5, -9.4], rot: [0, 0, Math.PI / 2] }));
  lamp(b, ctx, { pos: [0.35, -9.4], y: fy + 0.45, light: { color: '#ffc070', intensity: 3, distance: 6 } });
  for (let i = 0; i < 3; i++) b.add('#8c5a3c', xf(new THREE.CylinderGeometry(0.25, 0.3, 0.55, 8), { pos: [4.2, fy + 0.28, -9.6 + i * 0.7] }));
  b.add('#6b4a33', box(0.12, 1.8, 0.12, [-4.9, fy + 0.9, -8.2]));
  b.add('#6b4a33', box(0.12, 1.8, 0.12, [-4.9, fy + 0.9, -7.0]));
  b.add('#d9c7a3', box(0.06, 1.3, 1.1, [-4.85, fy + 1.0, -7.6]));
  b.add('#6b4a33', box(0.14, 0.12, 1.4, [-4.9, fy + 1.8, -7.6]));

  // Courtyard: low wall, oven, olive trees.
  for (const [ax, az, bx, bz] of [[-9, -1, -1.6, -1], [1.6, -1, 9, -1], [-9, -1, -9, 6], [9, -1, 9, 6]]) {
    const L = Math.hypot(bx - ax, bz - az);
    const x = (ax + bx) / 2, z = (az + bz) / 2, r = -Math.atan2(bz - az, bx - ax);
    b.add('#c9ad80', xf(new THREE.BoxGeometry(L, 1, 0.5), { pos: [x, ctx.terrainHeight(x, z) + 0.4, z], rot: [0, r, 0] }));
    ctx.addCollider({ x, z, hx: L / 2, hz: 0.25, rot: r, top: ctx.terrainHeight(x, z) + 0.9 });
  }
  b.add('#a87b4f', ball(0.8, [6.5, ctx.terrainHeight(6.5, -3) + 0.3, -3], [1, 1, 1], 10));
  ctx.addCollider({ x: 6.5, z: -3, hx: 0.8, hz: 0.8, rot: 0, top: 1 });
  olive(b, ctx, { pos: [-7, 2.5], size: 1.1, seed: 3 });
  olive(b, ctx, { pos: [7.5, 3.5], size: 0.9, seed: 4 });
  olive(b, ctx, { pos: [-13, -10], size: 1.2, seed: 5 });

  // The village of Nazareth spread on the slopes around.
  const spots = [];
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2;
    const r = 18 + rng() * 70;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 10;
    if (z > 5 && Math.abs(x) < 14) continue;
    if (ctx.blocked(x, z, 3)) continue;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 3, 5 + rng() * 3], height: 2.8 + rng() * 1.8, rot: Math.floor(rng() * 4) * Math.PI / 2 + (rng() - 0.5) * 0.3, color: WALLS[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.2 });
    spots.push([x, z]);
  }
  for (let i = 0; i < 60; i++) {
    const x = (rng() - 0.5) * 220, z = (rng() - 0.5) * 220 - 10;
    if (Math.hypot(x, z + 4) < 14 || ctx.blocked(x, z, 2)) continue;
    if (rng() < 0.6) olive(b, ctx, { pos: [x, z], size: 0.8 + rng() * 0.5, seed: i + 10 });
    else cypress(b, ctx, { pos: [x, z], height: 5 + rng() * 4 });
  }
  b.flush();

  // Mary kneels at prayer, Gabriel stands before her.
  person(ctx, { pos: MARY, face: GABRIEL, kneel: true, y: fy, colors: { robe: '#4f7f9a', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', sash: '#c8912e', arms: [0.15, 1.1] } });
  person(ctx, { pos: GABRIEL, face: MARY, scale: 1.15, glow: 0.6, y: fy + 0.1, colors: { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#fbf7ee', hair: '#fbf7ee', sash: '#efe6d0', arms: [0.35, 1.2] } });
  const gl = new THREE.PointLight('#fff0c8', 12, 14, 1.2);
  gl.position.set(GABRIEL[0] - 0.6, fy + 2, GABRIEL[1] + 0.8);
  ctx.scene.add(gl);
  glow(ctx, { pos: [GABRIEL[0], fy + 1.6, GABRIEL[1]], size: 9, color: '#fff3d0', opacity: 0.35, pulse: 0.03 });
  ctx.exclude({ kind: 'circle', x: GABRIEL[0], z: GABRIEL[1], r: 1 });
  ctx.addCollider({ x: GABRIEL[0], z: GABRIEL[1], hx: 0.4, hz: 0.4, rot: 0, top: fy + 2 });
}

export default {
  title: 'Luke 1:26-38: The Annunciation',
  subtitle: "Mary's home in Nazareth of Galilee",
  seed: 101,
  style: DAY_STYLE,
  sky: { zenith: '#3f78a0', mid: '#86b4c4', horizon: '#f2dcae', ground: '#c9b07a', glowColor: '#ffeec0', glowDir: [0.45, 0.8, 0.4] },
  sun: { dir: [0.45, 0.8, 0.4], color: '#fff0d6', intensity: 2.4, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.2 }, shadowSize: 60 },
  ground: {
    size: 1200, segments: 240, flatRadius: 70, hillHeight: 45, undulation: 0.25,
    plaza: { center: [0, 3], size: [3, 8] },
    colors: { sand: '#cbb07a', dirt: '#b08a5a', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#c8b088', plazaLine: '#b09a72', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a6a' },
  },
  mountains: { count: 30, distance: [480, 760], height: [60, 140], widthRatio: [1.8, 2.8], colors: ['#7f9a8a', '#8aa290', '#93a796'] },
  objects: [{ type: 'stones', count: 200, ring: [6, 60], size: [0.1, 0.35], colors: ['#cdb48a', '#b89a70'] }],
  custom,
  light: {
    beams: [{ from: [1.4, 9, -14], to: [1.9, 0.3, -7.6], width: [1.6, 3], color: '#fff2c9', intensity: 0.35, layers: 3, stripes: 10, fadeLow: 0.1 }],
  },
  crowd: {
    seed: 7,
    minSpacing: 1.5,
    facing: [0, 0],
    colors: PALETTE,
    groups: [{ shape: 'rect', center: [0, 40], size: [90, 30], count: 10, facingJitter: 3 }],
  },
  player: {
    start: [0, 1],
    lookAt: [0, -7.5],
    colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
