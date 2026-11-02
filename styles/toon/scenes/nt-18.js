// John 11:38-44: the cave tomb of Lazarus at Bethany, the stone taken away. Christ cries "Lazarus, come forth,"
// and he that was dead comes out bound in grave clothes. The tomb is cut in a rock face to the north (-z).
import * as THREE from 'three';
import { CHRIST, CROWD_COLORS, DISCIPLES, addMesh, box, boulder, cyl, figure, glow, groundColors, houses, makeRng, NO_PLAZA, toonStyle } from './lib/nt-13-kit.js';

const TOMB = [0, -14];
const JESUS = [0.4, -4.5];
const LAZARUS = [0, -12.9];
const rock = '#c9b08a';

export default {
  title: 'John 11:38-44: The raising of Lazarus',
  subtitle: 'Lazarus, come forth',
  seed: 1144,

  style: toonStyle({ fog: '#f0d8ae', near: 120, far: 1000 }),

  sky: { zenith: '#3a7aa4', mid: '#8ab6c2', horizon: '#f6d8a4', ground: '#d4b88a', glowColor: '#ffe8b8', glowDir: [0.6, 0.45, 0.3] },

  sun: { dir: [0.6, 0.7, 0.45], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d6e8e8', ground: '#a8865a', intensity: 1.1 }, shadowSize: 60 },

  ground: {
    size: 1000, segments: 220, flatRadius: 90, hillHeight: 36, undulation: 0.35, plaza: NO_PLAZA,
    colors: groundColors({ sand: '#d6bc8c', dirt: '#c49c68', grass: '#9aa060', grassDark: '#76804a', hill: '#a0a070' }),
  },

  mountains: { count: 30, distance: [480, 760], height: [50, 110], widthRatio: [1.8, 2.8], colors: ['#b4a488', '#a69a80', '#c0b094'] },

  objects: [
    { type: 'trees', count: 70, ring: [26, 160], angle: [-2.2, 2.2], height: [4, 6.5], broken: 0, fallen: 0, trunkColor: '#6b5a44', leafColors: ['#7d8a5a', '#8a9a6a', '#6f7e52', '#93a070'] },
    { type: 'stones', count: 260, ring: [5, 80], size: [0.12, 0.4], colors: ['#d4bc94', '#c0a47c', '#e0caa4'] },
  ],

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(18);

    // The rock face and the hill behind it.
    const face = [], dark = [], hill = [], cut = [];
    face.push(box(14, 7, 4, TOMB[0], 3.2, TOMB[1] - 1.5));
    ctx.addCollider({ x: TOMB[0], z: TOMB[1] - 1.5, hx: 7, hz: 2, rot: 0, top: 6.7 });
    dark.push(box(2.0, 2.6, 0.6, TOMB[0], 1.3, TOMB[1] + 0.25));
    cut.push(box(2.9, 0.4, 0.5, TOMB[0], 2.8, TOMB[1] + 0.35), box(0.45, 2.7, 0.5, TOMB[0] - 1.22, 1.35, TOMB[1] + 0.35), box(0.45, 2.7, 0.5, TOMB[0] + 1.22, 1.35, TOMB[1] + 0.35));
    cut.push(box(3.2, 0.3, 1.6, TOMB[0], 0.1, TOMB[1] + 1.1));
    for (let i = 0; i < 22; i++) {
      const x = -34 + (i / 21) * 68 + (rng() - 0.5) * 3;
      const r = 4 + rng() * 4;
      const z = TOMB[1] - 1.5 - r * 1.05 + Math.max(0, Math.abs(x) - 9) * 0.15;
      hill.push(boulder(rng, r, x, -r * 0.1, z, { squash: 0.75, detail: 2 }));
      ctx.addCollider({ x, z, hx: r * 0.8, hz: r * 0.8, rot: 0, top: r * 0.6 });
    }
    for (let i = 0; i < 16; i++) {
      const x = -44 + (i / 15) * 88 + (rng() - 0.5) * 4;
      const r = 8 + rng() * 5;
      const z = TOMB[1] - 12 - r * 0.8;
      hill.push(boulder(rng, r, x, r * 0.1, z, { squash: 0.8, detail: 2 }));
    }
    for (let i = 0; i < 6; i++) hill.push(boulder(rng, 2 + rng() * 1.5, TOMB[0] - 6 + i * 2.4, 6.6, TOMB[1] - 2, { squash: 0.6 }));
    for (const s of [-1, 1]) {
      hill.push(boulder(rng, 3.4, TOMB[0] + s * 8, 1.2, TOMB[1] - 1.2, { squash: 1.0, detail: 2 }));
      ctx.addCollider({ x: TOMB[0] + s * 8, z: TOMB[1] - 1.2, hx: 2.6, hz: 2.6, rot: 0, top: 4 });
    }
    addMesh(scene, face, kit.toon(rock));
    addMesh(scene, hill, kit.toon('#b89c74'));
    addMesh(scene, cut, kit.stoneMat('#d8c49c'));
    // Unlit so the open tomb reads as black depth behind Lazarus.
    addMesh(scene, dark, kit.basic('#0b0705'), { cast: false });

    // The rolling stone, taken away and leaning against the rock beside the door (11:41).
    const wheel = cyl(1.45, 1.45, 0.5, 0, 0, 0, { rx: Math.PI / 2 }, 20);
    const stone = addMesh(scene, [wheel], kit.toon('#9c8460'));
    stone.position.set(TOMB[0] + 2.9, 1.45, TOMB[1] + 0.9);
    stone.rotation.y = -0.7;
    ctx.addCollider({ x: TOMB[0] + 2.9, z: TOMB[1] + 0.9, hx: 1.45, hz: 0.35, rot: -0.7, top: 2.9 });

    // Lazarus at the door, bound hand and foot with graveclothes, his face bound with a napkin (11:44).
    const wrap = { robe: '#f2ede0', mantle: '#e9e2d0', skin: '#efe8d8', hair: '#e6dfcc' };
    const laz = figure(ctx, wrap, LAZARUS, { face: JESUS, clear: 1.2, y: 0.1, scale: 1.12 });
    const bands = [];
    for (const h of [0.25, 0.55, 0.85, 1.12, 1.36]) {
      const r = h < 1 ? 0.27 - h * 0.05 : 0.23;
      const t = new THREE.TorusGeometry(r, 0.025, 5, 16);
      t.rotateX(Math.PI / 2 + (rng() - 0.5) * 0.2);
      t.translate(0, h, 0);
      bands.push(t);
    }
    addMesh(laz, bands, kit.toon('#cfc4aa'), { cast: false });

    // Christ calls him forth; Martha and Mary beside Him (11:39-43).
    figure(ctx, CHRIST, JESUS, { face: LAZARUS, glow: 0.35, scale: 1.1, arms: [0.25, 2.3], clear: 1.4 });
    glow(ctx, [JESUS[0], 1.3, JESUS[1] + 0.2], 2.6, '#fff3d0', { opacity: 0.4 });
    figure(ctx, { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#b5825a', hair: '#d9c7a3', arms: [0.2, 1.4] }, [-1.9, -4.2], { face: LAZARUS, clear: 0.9 });
    figure(ctx, { robe: '#b5523b', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', arms: [0.25, 2.0] }, [2.3, -4.9], { face: LAZARUS, pose: 'kneel', clear: 0.9 });
    figure(ctx, DISCIPLES[0], [-3.4, -2.4], { face: LAZARUS, clear: 0.9 });
    figure(ctx, DISCIPLES[2], [3.6, -2.6], { face: LAZARUS, arms: [0.3, 1.8], clear: 0.9 });
    figure(ctx, { ...DISCIPLES[5], arms: [0.2, 1.1] }, [2.9, -10.4], { face: [2.8, -13.3], clear: 0.9 });
    figure(ctx, { ...DISCIPLES[7], arms: [0.2, 1.1] }, [4.6, -10.0], { face: [2.8, -13.3], clear: 0.9 });

    // Bethany on the slope to the south-east.
    const list = [];
    for (let i = 0; i < 26; i++) {
      const a = 0.4 + rng() * 2.0, r = 40 + rng() * 40;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (list.some((h) => Math.hypot(h[0] - x, h[1] - z) < 9)) continue;
      list.push([x, z, 5 + rng() * 3, 4.5 + rng() * 3, 3.2 + rng() * 2, rng() * 0.4 - 0.2]);
    }
    houses(ctx, list, { wall: '#dcc6a0', roof: '#b8966a' });
  },

  light: {
    pointLights: [{ at: JESUS, lift: 2.4, color: '#ffe6b0', intensity: 8, distance: 12 }],
  },

  crowd: {
    seed: 11,
    minSpacing: 0.7,
    facing: TOMB,
    colors: { ...CROWD_COLORS, robes: ['#2b2420', '#3a2e28', '#5e4632', '#7a6a52', '#4a3a30', '#8c5a3c', '#d9c7a3', '#6b5a4a'] },
    aisles: [{ from: [0, 24], to: [0, -4], width: 3.2 }],
    keepClear: [{ kind: 'circle', x: 0, z: -8, r: 5.5 }],
    groups: [
      { center: [0, -6], radius: [6, 17], angle: [-2.0, 2.0], count: 170, kneel: 0.15, children: 0.08, facingJitter: 0.4 },
    ],
  },

  player: {
    start: [-0.9, 0.6],
    lookAt: TOMB,
    colors: DISCIPLES[11],
  },
};
