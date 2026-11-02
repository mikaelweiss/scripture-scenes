// Matthew 17:1-8: on a high mountain apart, Christ is transfigured before Peter, James and John.
// Moses and Elias stand with Him, and a bright cloud overshadows them. The summit is a rocky plateau above a sea of cloud.
import * as THREE from 'three';
import { CHRIST, DISCIPLES, addMesh, boulder, figure, glow, groundColors, groundMesh, makeRng, NO_PLAZA, toonStyle } from './lib/nt-13-kit.js';

const R = 24;
const JESUS = [0, -8];
const MOSES = [-3.4, -7.2];
const ELIAS = [3.4, -7.2];
const SHINE = { robe: '#ffffff', mantle: '#fffdf6', skin: '#e8c8a0', hair: '#c8b090', sash: '#fff4d8' };

export default {
  title: 'Matthew 17:1-8: The Transfiguration',
  subtitle: 'His face did shine as the sun, and his raiment was white as the light',
  seed: 172,

  style: toonStyle({ fog: '#f4ead4', near: 160, far: 1300 }),

  sky: { zenith: '#4a86b8', mid: '#9cc4d8', horizon: '#fbefd4', ground: '#efe4cc', glowColor: '#fff8e0', glowDir: [0, 0.75, -0.6] },

  sun: { dir: [0.3, 0.9, 0.4], color: '#fff6e4', intensity: 2.5, hemi: { sky: '#e6f0f4', ground: '#a89070', intensity: 1.2 }, shadowSize: 50 },

  ground: {
    size: 900, segments: 200, flatRadius: 2000, hillHeight: 0, undulation: 0.6, plaza: NO_PLAZA,
    colors: groundColors({ sand: '#b8a888', dirt: '#a8967c', grass: '#8f9a64', grassDark: '#6f7a4c', hill: '#8a7c6a' }),
  },

  mountains: { count: 30, distance: [380, 720], height: [70, 120], widthRatio: [1.6, 2.4], colors: ['#8a9cb0', '#9aaabc', '#7f92a8', '#a4b2c0'] },

  objects: [
    { type: 'stones', count: 110, ring: [3, R - 2], size: [0.15, 0.55], colors: ['#a89a88', '#968a78', '#b8ab98'] },
  ],

  custom(ctx) {
    const { scene, kit } = ctx;
    const rng = makeRng(17);

    // Drop the drawn land away beyond the summit and sink the distant ranges below it.
    const g = groundMesh(ctx);
    const p = g.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      if (r > R) p.setY(i, p.getY(i) - Math.min(110, (r - R) ** 1.25 * 1.6) * (0.85 + 0.3 * Math.sin(x * 0.05) * Math.cos(z * 0.04)));
    }
    p.needsUpdate = true;
    g.geometry.computeVertexNormals();
    const ranges = scene.children.find((o) => o.isInstancedMesh && o.geometry.type === 'ConeGeometry');
    if (ranges) ranges.position.y = -95;

    // A ring of crags around the summit edge holds walkers on the plateau.
    const rocks = [];
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = R - 0.5 + rng() * 1.5;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      const s = 1.6 + rng() * 1.6;
      rocks.push(boulder(rng, s, x, ctx.terrainHeight(x, z) + s * 0.25, z, { squash: 0.8 }));
      ctx.addCollider({ x, z, hx: (Math.PI * R) / n + 0.6, hz: 0.8, rot: a, top: 4 });
    }
    for (let i = 0; i < 20; i++) {
      const a = rng() * Math.PI * 2, r = 6 + rng() * (R - 9);
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (Math.hypot(x - JESUS[0], z - JESUS[1]) < 7 || Math.abs(x) < 2.5) continue;
      const s = 0.5 + rng() * 0.9;
      rocks.push(boulder(rng, s, x, ctx.terrainHeight(x, z) + s * 0.2, z));
      ctx.exclude({ kind: 'circle', x, z, r: s + 0.3 });
    }
    // Cliffs falling away under the rim.
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + rng() * 0.1;
      const r = R + 5 + rng() * 8;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      const s = 4 + rng() * 4;
      rocks.push(boulder(rng, s, x, -6 - rng() * 10, z, { squash: 1.6 }));
    }
    addMesh(scene, rocks, kit.toon('#9a8c7a'));

    // A low flat rock where Christ stands.
    const dais = boulder(rng, 1.8, JESUS[0], -0.55, JESUS[1], { squash: 0.35, detail: 2 });
    addMesh(scene, [dais], kit.toon('#c8bca8'));
    ctx.addCollider({ x: JESUS[0], z: JESUS[1], hx: 1.3, hz: 1.3, rot: 0, top: 0.15, walkable: true });

    figure(ctx, SHINE, JESUS, { face: [0, 10], glow: 0.85, scale: 1.12, y: 0.12, arms: [0.3, 0.25], clear: 1.6 });
    figure(ctx, { robe: '#f3eee2', mantle: '#e8dcc4', skin: '#d8b48c', hair: '#e8e4dc', sash: '#d8c8a8', arms: [0.15, 0.5] }, MOSES, { face: JESUS, glow: 0.45, scale: 1.05, clear: 1.2 });
    figure(ctx, { robe: '#f1ecdd', mantle: '#ddd0b4', skin: '#d0a882', hair: '#c8c0b0', sash: '#c8b48a', arms: [0.15, 0.5] }, ELIAS, { face: JESUS, glow: 0.45, scale: 1.05, clear: 1.2 });
    glow(ctx, [JESUS[0], 1.7, JESUS[1]], 10, '#fffbe8', { opacity: 0.9 });
    glow(ctx, [MOSES[0], 1.3, MOSES[1]], 4, '#fff4d8', { opacity: 0.45 });
    glow(ctx, [ELIAS[0], 1.3, ELIAS[1]], 4, '#fff4d8', { opacity: 0.45 });

    // Peter, James and John fallen on their faces, sore afraid (17:6).
    figure(ctx, DISCIPLES[0], [-1.9, -1.8], { face: JESUS, pose: 'bow', clear: 1 });
    figure(ctx, DISCIPLES[1], [0.1, -1.2], { face: JESUS, pose: 'bow', clear: 1 });
    figure(ctx, DISCIPLES[2], [2.0, -1.9], { face: JESUS, pose: 'bow', clear: 1 });
  },

  clouds: {
    layers: [
      { count: 90, distance: [90, 460], height: [-72, -56], size: [22, 40], color: '#ffffff', shade: '#9aa4b8', drift: 0.003 },
      { count: 30, distance: [300, 800], height: [20, 80], size: [50, 100], color: '#fff6e4', shade: '#8a90a8', drift: 0.002 },
      { count: 12, center: JESUS, distance: [2, 10], height: [11, 15], size: [2.6, 4.2], color: '#fffdf4', shade: '#f0e2c0', drift: 0.02 },
    ],
  },

  light: {
    rayFans: [{ source: [0, 90, -8], sourceJitter: 20, target: JESUS, groundY: 0, spread: [3, 14], count: 9, width: [[2, 4], [4, 8]], color: '#fff4c8', intensity: 0.32, stripes: 9, fadeLow: 0.3 }],
    beams: [{ from: [0, 60, -8], to: { at: JESUS, lift: 1.2 }, width: [8, 4], color: '#fffae0', intensity: 0.28, layers: 3, stripes: 22, fadeLow: 0.05 }],
    rings: [{ at: JESUS, lift: 0.1, radius: 5.2, width: 0.3, height: 2.4, color: '#ffe8a8', intensity: 0.9, wallIntensity: 0.4 }],
    pointLights: [{ at: JESUS, lift: 2.5, color: '#fff2c8', intensity: 18, distance: 22 }],
  },

  player: {
    start: [0.8, 4],
    lookAt: JESUS,
    colors: DISCIPLES[11],
  },
};
