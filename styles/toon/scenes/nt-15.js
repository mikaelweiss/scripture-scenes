// John 6:5-14: a grassy hillside above the Sea of Galilee. The multitude sits in companies on the grass.
// Christ blesses the five loaves and two fishes; the twelve baskets of fragments stand at His side. The lake lies north (-z).
import * as THREE from 'three';
import { CHRIST, CROWD_COLORS, DISCIPLES, addMesh, basket, boat, calmWater, figure, fish, glow, groundColors, groundMesh, loaf, makeRng, NO_PLAZA, toonStyle } from './lib/nt-13-kit.js';

const JESUS = [0, -16];
const SHORE = -62;

const groups = [];
for (let row = 0; row < 4; row++) {
  for (let col = -3; col <= 3; col++) {
    if (col === 0 && row === 0) continue;
    const x = col * 13 + (col > 0 ? 2 : col < 0 ? -2 : 0);
    groups.push({ shape: 'rect', center: [x, -1 + row * 11], size: [11, 8.5], count: 105, kneel: 0.92, children: 0.18, lean: 0.03 });
  }
}
groups.push({ center: JESUS, radius: [7, 30], angle: [-2.3, 2.3], count: 420, kneel: 0.9, children: 0.15 });

export default {
  title: 'John 6:5-14: Feeding the five thousand',
  subtitle: 'Five barley loaves and two small fishes, and twelve baskets left over',
  seed: 65,

  style: toonStyle({ fog: '#f2d6a8', near: 140, far: 1100 }),

  sky: { zenith: '#3f78a0', mid: '#8fb4bc', horizon: '#f7cf98', ground: '#c9b07a', glowColor: '#ffe2a8', glowDir: [-0.8, 0.25, 0.3] },

  sun: { dir: [-0.7, 0.55, 0.35], color: '#ffe6c0', intensity: 2.6, hemi: { sky: '#d6ece2', ground: '#8a7a4a', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1200, segments: 260, flatRadius: 110, hillHeight: 34, undulation: 0.5, plaza: NO_PLAZA,
    colors: groundColors({ sand: '#9aaa5c', dirt: '#8a9a50', grass: '#a8b468', grassDark: '#6f8244', hill: '#86a064' }),
  },

  mountains: { count: 34, distance: [520, 820], height: [60, 140], widthRatio: [1.8, 2.8], colors: ['#7f9a8a', '#8aa294', '#a0a88a', '#94a090'] },

  objects: [
    { type: 'trees', count: 60, ring: [60, 200], angle: [-1.9, 1.9], height: [5, 8], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#4f8a5a', '#5f9a5a', '#6f9e5a'] },
    { type: 'stones', count: 220, ring: [8, 110], angle: [-2.1, 2.1], size: [0.15, 0.5], colors: ['#b8a888', '#a89a7a', '#c8b898'] },
  ],

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(15);

    // Cut the lake into the drawn terrain and stop walkers at the shore.
    const g = groundMesh(ctx);
    const p = g.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      const k = 1 - THREE.MathUtils.smoothstep(z, SHORE - 10, SHORE + 4);
      if (k > 0) p.setY(i, THREE.MathUtils.lerp(p.getY(i), -4, k));
    }
    p.needsUpdate = true;
    g.geometry.computeVertexNormals();
    calmWater(ctx, { y: -0.6, area: [2400, 700], center: [0, SHORE - 350], color: '#4f93a8', light: '#a8dcd8', dark: '#3a7a90', tile: 22 });
    ctx.addCollider({ x: 0, z: SHORE - 1, hx: 600, hz: 0.5, rot: 0, top: 4 });
    const shoreBoat = boat(ctx, { pos: [-26, SHORE - 3], rot: 1.3, y: -0.25, L: 8, B: 2.6, sail: 'furled' });
    shoreBoat.inner.rotation.z = 0.06;
    boat(ctx, { pos: [40, SHORE - 60], rot: -0.4, y: -0.3, L: 8, B: 2.6, sail: 'set' });
    boat(ctx, { pos: [-90, SHORE - 120], rot: 0.3, y: -0.3, L: 8, B: 2.6, sail: 'set' });

    // Christ blessing the food, looking up to heaven (6:11). The lad and Andrew beside Him (6:8-9).
    figure(ctx, CHRIST, JESUS, { face: [0, 30], glow: 0.35, scale: 1.1, arms: [0.3, 2.3], clear: 1.4 });
    glow(ctx, [JESUS[0], 1.5, JESUS[1]], 6, '#fff1c8', { opacity: 0.55 });
    figure(ctx, { robe: '#c98b3c', mantle: '#e6d8b8', skin: '#a87650', hair: '#2b1a12', arms: [0.15, 1.3] }, [1.3, -14.7], { face: JESUS, scale: 0.62, clear: 0.7 });
    figure(ctx, { ...DISCIPLES[3], arms: [0.2, 0.6] }, [2.6, -15.6], { face: [1.3, -14.7], clear: 0.8 });
    figure(ctx, DISCIPLES[0], [-2.4, -15.2], { face: [0, 0], clear: 0.8 });
    figure(ctx, DISCIPLES[4], [-1.6, -17.6], { face: JESUS, clear: 0.8 });
    figure(ctx, DISCIPLES[5], [3.4, -18.1], { face: JESUS, clear: 0.8 });

    // The loaves and fishes on a cloth before Him, and the twelve baskets of fragments (6:13).
    const bread = [], fishes = [], baskets = [], cloth = [];
    cloth.push(new THREE.BoxGeometry(1.6, 0.04, 1.1).translate(0.4, ctx.groundHeight(0.4, -14.4) + 0.02, -14.4));
    const gy = ctx.groundHeight(0.4, -14.4) + 0.04;
    for (let i = 0; i < 5; i++) loaf(bread, -0.1 + (i % 3) * 0.36, gy, -14.6 + Math.floor(i / 3) * 0.36, 1.2);
    fish(fishes, 0.9, gy, -14.25, 0.3, 1.2);
    fish(fishes, 0.85, gy, -14.55, -0.2, 1.2);
    for (let i = 0; i < 12; i++) {
      const side = i < 6 ? -1 : 1, k = i % 6;
      const x = JESUS[0] + side * (3.8 + (k % 3) * 0.95), z = JESUS[1] - 0.6 + Math.floor(k / 3) * 0.95 + side * 0.3;
      const by = ctx.groundHeight(x, z);
      basket(baskets, x, by, z, 1.25);
      for (let k = 0; k < 3; k++) loaf(bread, x + (rng() - 0.5) * 0.4, by + 0.48, z + (rng() - 0.5) * 0.4, 0.8);
      ctx.exclude({ kind: 'circle', x, z, r: 0.6 });
    }

    // Disciples moving among the companies with baskets of bread (6:11).
    const carriers = [[-6.5, 4], [6.5, 9], [-19.5, 15], [19.5, 4], [-6.5, 26], [6.5, 31], [32.5, 20]];
    carriers.forEach(([x, z], i) => {
      figure(ctx, { ...DISCIPLES[(i + 6) % 12], arms: [0.15, 1.1] }, [x, z], { yaw: rng() * 6.28, clear: 0.9 });
      const yaw = scene.children.at(-1).rotation.y;
      const bx = x + Math.sin(yaw) * 0.45, bz = z + Math.cos(yaw) * 0.45;
      basket(baskets, bx, ctx.groundHeight(x, z) + 0.82, bz, 0.9);
      loaf(bread, bx, ctx.groundHeight(x, z) + 1.2, bz, 0.8);
    });

    addMesh(scene, cloth, kit.toon('#e6d8b8'), { cast: false });
    addMesh(scene, bread, kit.toon('#d9a35a'));
    addMesh(scene, fishes, kit.toon('#8a9aa0'));
    addMesh(scene, baskets, kit.toon('#b88a4e'));
  },

  crowd: {
    seed: 6,
    minSpacing: 0.72,
    facing: JESUS,
    colors: CROWD_COLORS,
    aisles: [{ from: [0, 60], to: [0, -6], width: 3.4 }],
    keepClear: [{ kind: 'circle', x: JESUS[0], z: JESUS[1], r: 7 }],
    groups,
  },

  player: {
    start: [0, 3],
    lookAt: JESUS,
    colors: { robe: '#a87b4f', mantle: '#4f7f80', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
