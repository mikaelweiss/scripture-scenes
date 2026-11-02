// D&C 107:53-57: Adam, bowed with age, blesses his righteous posterity at Adam-ondi-Ahman.
import { glowSprite, heavenly, lightShaft, river } from './lib/dc-01-kit.js';

const ADAM = [0, -22];
const LORD = [0, -31];

const elder = (pos, robe, mantle, hair = '#d9d2c4') => ({
  pos, facing: [pos[0] * 0.3, 20], scale: 1.0, clearRadius: 0.9,
  colors: { robe, mantle, skin: '#c9946a', hair, sash: '#c8912e', arms: [0.2, 0.25] },
});

export default {
  title: 'D&C 107:53-57: Adam blesses his posterity',
  subtitle: 'Adam-ondi-Ahman, three years before his death',
  seed: 107,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.42, 0.74, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#f0d7a8', near: 140, far: 1100 },
  },

  sky: { zenith: '#3f6f8f', mid: '#86aebb', horizon: '#f6d59a', ground: '#a8a070', glowColor: '#fff0c0', glowDir: [0, 0.5, -1] },

  sun: { dir: [-0.6, 0.55, 0.45], color: '#ffe9c4', intensity: 2.5, hemi: { sky: '#d8ead8', ground: '#7a6a3a', intensity: 1.1 }, shadowSize: 75 },

  ground: {
    size: 1600, segments: 300, flatRadius: 75, hillHeight: 34, undulation: 0.5,
    plaza: { center: [0, -22], size: [9, 9] },
    colors: { sand: '#9fae62', dirt: '#8a9a52', grass: '#7f9e4e', grassDark: '#5f7e3a', plaza: '#b9a888', plazaLine: '#9a8a6a', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6f8e52' },
  },

  mountains: { count: 30, distance: [520, 800], height: [50, 120], widthRatio: [2, 3.4], colors: ['#6f9a7a', '#7da08a', '#8aa88f', '#6a8e7a'] },

  objects: [
    {
      type: 'platform', pos: ADAM,
      tiers: [{ size: [14, 9], height: 0.7 }, { size: [7, 4.5], height: 0.6, offset: [0, -1.2] }],
      stairWidth: 4, rise: 0.25, stairDepth: 0.45,
      colors: { stone: '#c9b48a', stair: '#bba57a', fret: ['#8c5a3c', '#e6d8b8'] },
    },
    { type: 'trees', count: 150, ring: [62, 230], height: [6, 12], broken: 0, fallen: 0, trunkColor: '#5e4430', leafColors: ['#4f8a4a', '#5f9a52', '#3e7a46', '#6fa058'] },
    { type: 'stones', count: 300, ring: [10, 70], size: [0.12, 0.4], colors: ['#b8a888', '#a0927a', '#c9bc9a'] },
  ],

  custom(ctx) {
    const { THREE, scene, kit } = ctx;
    // Adam's altar of field stones beside him.
    const y0 = ctx.groundHeight(-5.2, ADAM[1] - 1.6);
    const altar = new THREE.Group();
    const stones = [[0, 0.3, 0, 1.6, 0.6, 1.1], [0.1, 0.8, 0, 1.4, 0.45, 0.95], [-0.05, 1.18, 0, 1.25, 0.32, 0.85]];
    for (const [x, y, z, w, h, d] of stones) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), kit.stoneMat('#9f9078'));
      m.position.set(x, y, z);
      m.rotation.y = (x + y) * 0.6;
      m.castShadow = true;
      altar.add(m);
    }
    altar.position.set(-5.2, y0, ADAM[1] - 1.6);
    scene.add(altar);
    ctx.addCollider({ x: -5.2, z: ADAM[1] - 1.6, hx: 0.8, hz: 0.6, rot: 0, top: y0 + 1.35 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 6).translate(0, 0.45, 0), kit.basic('#f6a640'));
    flame.position.set(-5.2, y0 + 1.34, ADAM[1] - 1.6);
    scene.add(flame);
    ctx.onFrame((t) => (flame.scale.y = 0.8 + 0.2 * Math.sin(t * 8) * Math.sin(t * 3.1)));

    // The Lord appears above the congregation.
    const top = ctx.groundHeight(...LORD);
    heavenly(ctx, { pos: LORD, y: top + 7, face: [0, 30], scale: 1.25, arms: [0.55, 0.45], halo: 11, light: 0 });
    glowSprite(ctx, [LORD[0], top + 8.5, LORD[1]], 14, '#fff0c0', 0.35);
    lightShaft(ctx, { at: [LORD[0], top + 6.5, LORD[1]], top: 120, radius: [2.2, 14], opacity: 0.08 });

    river(ctx, { points: [[-260, 120], [-120, 95], [-40, 110], [40, 92], [130, 118], [260, 100]], width: 18, y: ctx.terrainHeight(0, 100) - 0.1 });
  },

  clouds: {
    layers: [
      { count: 46, distance: [350, 800], height: [60, 170], size: [40, 90], color: '#fff3dc', shade: '#6a6080' },
      { count: 14, center: LORD, distance: [30, 80], height: [80, 110], size: [12, 22], color: '#fff6e4', shade: '#8a7a6a', drift: 0.003 },
    ],
  },

  light: {
    glows: [{ at: ADAM, lift: 3, size: 6, color: '#ffe8b0', opacity: 0.35 }],
  },

  figures: [
    {
      pos: [ADAM[0], ADAM[1] - 1.2], facing: [0, 30], scale: 1.08, glow: 0.12, clearRadius: 1.2,
      colors: { robe: '#efe6d2', mantle: '#b5823e', skin: '#c9946a', hair: '#f4f0e8', sash: '#8c5a3c', arms: [0.7, 1.25] },
    },
    elder([-2.6, -24.6], '#d9c7a3', '#5e4632'),
    elder([2.6, -24.6], '#c8a97a', '#3e6e66'),
    elder([-4.4, -22.8], '#a87b4f', '#d9c7a3', '#b8b0a0'),
    elder([4.4, -22.8], '#e6d8b8', '#8c5a3c', '#8a7a68'),
    elder([-5.8, -20.4], '#8c5a3c', '#c8912e', '#5a4632'),
    elder([5.8, -20.4], '#6f8a6a', '#e6d8b8', '#3a2418'),
    elder([3.6, -19.6], '#bfa27a', '#b5523b', '#2b1a12'),
  ],

  crowd: {
    seed: 7,
    minSpacing: 0.66,
    facing: ADAM,
    colors: {
      robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e'],
      mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a'],
      skins: ['#a87650', '#b5825a', '#c08f66', '#9c6a45', '#c9946a'],
      hair: ['#2b1a12', '#3a2418', '#4a3020', '#7a6a58', '#d9d2c4'],
      wraps: ['#e6d8b8', '#c8912e', '#d9c7a3', '#4f7f80', '#b5523b'],
    },
    aisles: [{ from: [0, 60], to: [0, -14], width: 3.2 }],
    keepClear: [{ kind: 'rect', x: 0, z: -22, hx: 8.5, hz: 6 }],
    groups: [
      { center: ADAM, radius: [9.5, 56], angle: [-1.75, 1.75], count: 2300, kneel: 0.15, children: 0.16 },
    ],
  },

  player: {
    start: [0, -3],
    lookAt: ADAM,
    colors: { robe: '#a87b4f', mantle: '#3e6e66', skin: '#b5825a', hair: '#3a2418', sash: '#c8912e' },
  },
};
