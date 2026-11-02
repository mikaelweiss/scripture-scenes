// John 20:1-18: at dawn Mary Magdalene finds the stone taken away, two angels sitting where the body had lain,
// and turning back sees Jesus standing in the garden. x is east, z is south. The tomb is cut into a rock face to the north.
import { Batch, DAY_STYLE, addSun, ball, box, cyl, cypress, glow, makeRng, olive, person } from './lib/nt-19-kit.js';

const FACE_Z = -10;
const JESUS = [-2.6, -4.4];
const MARY = [1.3, -5.9];
const CHRIST = { robe: '#fbf7ee', mantle: '#f3eddf', skin: '#b5825a', hair: '#4a3020', sash: '#e9dcc0' };
const ANGEL = { robe: '#fbf7ee', mantle: '#ffffff', skin: '#fbf7ee', hair: '#fbf7ee' };

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(24);
  const y = ctx.terrainHeight(0, FACE_Z) - 0.3;
  const rock = '#b8a88a';
  const rockDark = '#a09074';

  // The rock face with a chamber cut into it, its low door facing the garden.
  const block = (x0, x1, z0, z1, y0, y1, color = rock, collide = true) => {
    b.add(color, box(x1 - x0, y1 - y0, z1 - z0, [(x0 + x1) / 2, y + (y0 + y1) / 2, (z0 + z1) / 2]));
    if (collide) ctx.addCollider({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, rot: 0, top: y + y1 });
  };
  block(-26, -2.5, -26, FACE_Z, 0, 6.5);
  block(2.5, 26, -26, FACE_Z, 0, 7);
  block(-2.5, 2.5, -24, -14, 0, 7);
  block(-2.5, 2.5, -14, FACE_Z, 2.6, 7, rock, false);
  block(-2.5, -0.9, -10.8, FACE_Z, 0, 2.6, rockDark);
  block(0.9, 2.5, -10.8, FACE_Z, 0, 2.6, rockDark);
  block(-0.9, 0.9, -10.8, FACE_Z, 2.1, 2.6, rockDark, false);
  b.add('#8a7a60', box(5, 0.1, 3.2, [0, y + 0.35, -12.4]), { cast: false });
  for (let i = 0; i < 70; i++) {
    const x = -26 + rng() * 52, z = -25 + rng() * 15;
    const top = Math.abs(x) < 3 && z > -15 ? 7 : 6.6;
    b.add(rng() < 0.5 ? rock : rockDark, ball(1 + rng() * 1.6, [x, y + top + rng() * 0.6, z], [1.4, 0.7, 1.2], 7));
  }
  for (let i = 0; i < 30; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (3.5 + rng() * 22), z = FACE_Z + 0.2 + rng() * 0.6;
    b.add(rng() < 0.5 ? rock : rockDark, ball(0.6 + rng() * 0.9, [x, y + rng() * 6, z], [1.2, 1, 0.6], 6));
  }
  // Vines trailing down the face.
  for (let i = 0; i < 26; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (3 + rng() * 12);
    b.add(rng() < 0.5 ? '#5f8e4a' : '#4a7a40', ball(0.5 + rng() * 0.6, [x, y + 5.5 + rng() * 1.5, FACE_Z + 0.4], [1, 1.6, 0.5], 6));
  }

  // Inside: the ledge where the body lay, the linen clothes, and the napkin folded by itself.
  b.add(rockDark, box(1.3, 0.6, 2.8, [1.55, y + 0.6, -12.4]));
  b.add('#f6f1e4', box(0.7, 0.12, 1.9, [1.5, y + 0.96, -12.2]), { emissive: '#4a4638' });
  b.add('#f6f1e4', box(0.35, 0.14, 0.35, [1.5, y + 0.98, -13.4], [0, 0.3, 0]), { emissive: '#4a4638' });

  // The great round stone, rolled away from the door.
  const stone = new THREE.CylinderGeometry(1.45, 1.45, 0.55, 18).rotateX(Math.PI / 2);
  b.add('#8a7a62', stone.translate(-3.4, y + 1.45 + 0.3, FACE_Z + 0.75));
  ctx.addCollider({ x: -3.4, z: FACE_Z + 0.75, hx: 1.45, hz: 0.3, rot: 0, top: y + 3.2 });
  b.add('#8a7a60', box(9, 0.12, 0.9, [-1.5, y + 0.32, FACE_Z + 0.75]), { cast: false });

  // The garden: olive and cypress, flower beds, a stone path to the tomb.
  for (let i = 0, n = 0; n < 34 && i < 400; i++) {
    const x = (rng() - 0.5) * 80, z = -8 + rng() * 60;
    if ((Math.abs(x) < 9 && z < 14) || ctx.blocked(x, z, 2)) continue;
    olive(b, ctx, { pos: [x, z], size: 0.9 + rng() * 0.5, seed: i, leaf: '#8aa070', leafDark: '#6f8a5a' });
    n++;
  }
  for (const [x, z] of [[-12, -7], [11, -7.5], [-15, -4], [14, -3], [-20, 6], [-19, 9]]) cypress(b, ctx, { pos: [x, z], height: 7 + rng() * 3 });
  const flowers = ['#f0a0b0', '#fbf7ee', '#f3d36a', '#e07a8a', '#c8a0e0'];
  for (let i = 0; i < 260; i++) {
    const x = (rng() - 0.5) * 34, z = -9 + rng() * 26;
    if (Math.abs(x - (z + 9) * 0.05) < 1.8 || ctx.blocked(x, z, 0.5)) continue;
    const gy = ctx.terrainHeight(x, z);
    b.add('#4a7a40', ball(0.28, [x, gy + 0.12, z], [1.2, 0.6, 1.2], 5), { cast: false });
    b.add(flowers[i % flowers.length], ball(0.09, [x + 0.1, gy + 0.32, z], [1, 1, 1], 5), { cast: false, emissive: '#2a2020' });
  }
  for (let z = FACE_Z + 1.4; z < 16; z += 0.9) {
    const x = (z - FACE_Z) * 0.05 + (rng() - 0.5) * 0.3;
    b.add('#d8c8a8', box(0.9 + rng() * 0.3, 0.08, 0.6, [x, ctx.terrainHeight(x, z) + 0.03, z], [0, rng() * 0.4, 0]), { cast: false });
  }
  b.flush();

  // Light within the empty tomb, and the two angels in white sitting where the body had lain.
  const inner = new THREE.PointLight('#fff1c8', 10, 3.4, 1.2);
  inner.position.set(0, y + 1.6, -12.7);
  ctx.scene.add(inner);
  glow(ctx, { pos: [0, y + 1.2, FACE_Z - 0.6], size: 3.2, color: '#fff0c8', opacity: 0.45 });
  for (const z of [-11.3, -13.5]) {
    person(ctx, { pos: [0.2, z], y: y + 0.35, kneel: true, glow: 0.7, face: [0.2, z + 3], colors: ANGEL });
    glow(ctx, { pos: [0.2, y + 1.3, z], size: 2.6, color: '#fff6dc', opacity: 0.6 });
  }

  // Mary turned back toward the garden, and Jesus standing there.
  const mary = person(ctx, { pos: MARY, face: JESUS, colors: { robe: '#7a3a5a', mantle: '#b5523b', skin: '#b5825a', hair: '#4a3020', arms: [0.35, 0.9] } });
  mary.rotation.x = 0.1;
  person(ctx, { pos: JESUS, face: MARY, scale: 1.08, glow: 0.4, colors: { ...CHRIST, arms: [0.45, 0.35] } });
  glow(ctx, { pos: [JESUS[0], ctx.terrainHeight(...JESUS) + 1.1, JESUS[1] - 0.3], size: 3.4, color: '#fff3d0', opacity: 0.4 });

  addSun(ctx, { dir: [1, 0.12, 0.15], size: 50, color: '#fff2d0', halo: '#ffc890' });
}

export default {
  title: 'John 20:1-18: The empty tomb',
  subtitle: 'Woman, why weepest thou? whom seekest thou?',
  seed: 24,
  style: { ...DAY_STYLE, fog: { color: '#e8c8b4', near: 90, far: 700 } },
  sky: { zenith: '#3a5a8a', mid: '#b896a8', horizon: '#ffcf9a', ground: '#c8a88a', glowColor: '#ffd8a0', glowDir: [1, 0.12, 0.15] },
  sun: { dir: [0.75, 0.4, 0.55], color: '#ffd8b0', intensity: 2.2, hemi: { sky: '#c8c8e0', ground: '#8a6a5a', intensity: 1.0 }, shadowSize: 60 },
  ground: {
    size: 1000, segments: 220, flatRadius: 120, hillHeight: 35, undulation: 0.2,
    plaza: { center: [0, 900], size: [1, 1] },
    colors: { sand: '#a8a070', dirt: '#9a8a62', grass: '#7a9a5a', grassDark: '#6a8a4e', plaza: '#a8a070', plazaLine: '#9a8a62', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a9a6a' },
  },
  mountains: { count: 26, distance: [420, 720], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#8a7a98', '#9a88a0', '#7a6e8e'] },
  objects: [
    { type: 'stones', count: 200, ring: [10, 100], size: [0.12, 0.35], colors: ['#b8a88a', '#a09074'] },
  ],
  custom,
  clouds: { layers: [{ count: 22, distance: [350, 750], height: [80, 180], size: [40, 80], color: '#ffd8c0', shade: '#8a6a8a' }] },
  player: {
    start: [1.0, 0.2],
    lookAt: [-0.6, -9],
    fov: 44,
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
