// Nehemiah 4:16-18: the walls of Jerusalem going up. Every builder has his sword girded by his side,
// half the servants hold spears, shields and bows, and the trumpeter stands by Nehemiah.
// x is east, z is south. The new wall runs east to west in front of the start; the city lies south, the Kidron valley north.
import * as THREE from 'three';
import { Batch, PEOPLE, box, cyl, figure, house, makeRng, rock, stoneWall, tree, xf } from './lib/ot-31-kit.js';

const NEHEMIAH = [-2, -1];
const WALL_Z = -14;
const STONE = ['#e3cfa6', '#d8c095', '#cdb48a', '#e8d9b5'];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(36);

  // The wall in sections at different heights, with a rebuilt gate and a burnt one.
  const builders = [];
  const segs = [[-80, -52, 6.5], [-52, -30, 4.2], [-30, -14, 2.6], [-6, 6, 3.4], [6, 22, 1.6], [22, 40, 4.8], [40, 62, 3.0], [62, 90, 6.0]];
  for (const [x0, x1, h] of segs) {
    const r = stoneWall(b, ctx, [x0, WALL_Z + x0 * 0.02], [x1, WALL_Z + x1 * 0.02], { height: h, thick: 2.6, color: STONE[Math.floor(rng() * 4)], cap: '#c3a676', crenels: h > 5.5 });
    // Rough upper courses still being laid.
    if (h < 5.5) {
      for (let x = x0 + 1; x < x1 - 1; x += 1.3) {
        if (rng() < 0.45) continue;
        const z = WALL_Z + x * 0.02;
        b.add(STONE[Math.floor(rng() * 4)], box(1.2, 0.6, 1.0 + rng() * 1.2, [x, r.y + 0.3, z + (rng() - 0.5) * 0.6], [0, (rng() - 0.5) * 0.15, 0]));
      }
      for (let i = 0; i < (x1 - x0) / 6; i++) builders.push([x0 + 2 + rng() * (x1 - x0 - 4), r.y]);
    }
  }
  // Gate towers at the opening between the third and fourth sections.
  for (const x of [-12.2, -7.8]) {
    const z = WALL_Z + x * 0.02, y = ctx.terrainHeight(x, z) - 0.5;
    b.add('#d6c09a', box(3.2, 8, 3.6, [x, y + 4, z]));
    for (const [dx, dz] of [[-1.2, -1.4], [1.2, -1.4], [-1.2, 1.4], [1.2, 1.4]]) b.add('#d6c09a', box(0.8, 0.8, 0.8, [x + dx, y + 8.4, z + dz]));
    ctx.addCollider({ x, z, hx: 1.6, hz: 1.8, rot: 0, top: y + 8 });
  }
  b.add('#3a2a22', box(1.6, 2.8, 0.25, [-10, ctx.terrainHeight(-10, WALL_Z) + 1.2, WALL_Z - 1.6], [0.2, 0.3, 0.1]));
  b.add('#2e2420', box(1.4, 2.4, 0.25, [-9.3, ctx.terrainHeight(-9, WALL_Z) + 0.3, WALL_Z - 3], [1.4, -0.2, 0]));

  // Scaffolds of poles and planks against the low sections.
  for (const [x, h] of [[-46, 4.2], [-24, 2.6], [12, 1.6], [30, 4.8], [50, 3.0]]) {
    const z = WALL_Z + x * 0.02 + 2.4;
    const y = ctx.terrainHeight(x, z);
    for (const dx of [-2, 2]) for (const dz of [-0.6, 0.6]) b.add('#6b4a33', cyl(0.07, 0.07, h + 2, [x + dx, y + (h + 2) / 2, z + dz], [0, 0, 0], 5));
    b.add('#8a6a48', box(4.6, 0.12, 1.5, [x, y + h * 0.55, z]));
    b.add('#6b4a33', box(0.12, h * 0.6, 0.12, [x + 2.6, y + h * 0.3, z + 1.4], [0.6, 0, 0]));
  }

  // Heaps of rubbish and cut stone; mortar troughs and baskets.
  for (let i = 0; i < 26; i++) {
    const x = -70 + rng() * 140, z = WALL_Z + 4 + rng() * 10;
    if (Math.abs(x - NEHEMIAH[0]) < 5 && Math.abs(z - NEHEMIAH[1]) < 5) continue;
    const y = ctx.terrainHeight(x, z);
    if (i % 3 === 0) {
      for (let k = 0; k < 5; k++) b.add(STONE[k % 4], box(1, 0.55, 0.7, [x + (k % 3) * 1.05, y + 0.28 + Math.floor(k / 3) * 0.56, z], [0, (rng() - 0.5) * 0.1, 0]));
      ctx.exclude({ kind: 'circle', x: x + 1, z, r: 2 });
    } else if (i % 3 === 1) {
      for (let k = 0; k < 7; k++) b.add(['#b8a07a', '#a89070', '#c8b08a'][k % 3], rock(0.3 + rng() * 0.5, [x + (rng() - 0.5) * 2, y + 0.2, z + (rng() - 0.5) * 2], [1.2, 0.7, 1], [rng(), rng() * 3, rng()]));
      ctx.exclude({ kind: 'circle', x, z, r: 1.8 });
    } else {
      b.add('#8a6a48', box(1.8, 0.4, 0.8, [x, y + 0.2, z]));
      b.add('#d8d0c0', box(1.6, 0.05, 0.6, [x, y + 0.41, z]));
      b.add('#a08050', cyl(0.3, 0.22, 0.4, [x + 1.5, y + 0.2, z + 0.5], [0, 0, 0], 8));
      ctx.exclude({ kind: 'circle', x, z, r: 1.5 });
    }
  }

  // The city behind: houses on the slope, with a lane up from the wall.
  for (let i = 0; i < 46; i++) {
    const x = -80 + rng() * 160, z = 14 + rng() * 60;
    if (Math.abs(x - 2) < 6) continue;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 3, 5 + rng() * 3], height: 3.5 + rng() * 3, rot: (rng() - 0.5) * 0.3, color: STONE[i % 4], door: rng() < 0.6 ? '#3a2418' : null });
  }
  for (let i = 0; i < 14; i++) tree(b, ctx, -70 + rng() * 140, 8 + rng() * 6, rng, { h: 3.5 + rng() * 2 });
  // Olive groves on the Mount of Olives across the valley.
  for (let i = 0; i < 60; i++) tree(b, ctx, -120 + rng() * 240, -50 - rng() * 70, rng, { h: 4 + rng() * 3 });
  b.flush();

  // Builders on the wall, each with a sword at his side, some carrying stones.
  const builderColors = [
    { robe: '#8b6b4a', mantle: '#5a3d2b', skin: '#9c6a45', hair: '#2b1a12', sash: '#5a3a26', arms: [0.4, 0.9] },
    { robe: '#a0825c', mantle: '#7d5c3e', skin: '#a87650', hair: '#3a2418', sash: '#3a2a1c', arms: [0.3, 1.4] },
    { robe: '#6e5a44', mantle: '#3f4d5e', skin: '#b5825a', hair: '#1f140e', sash: '#8a6a48', arms: [0.5, 0.5] },
  ];
  builders.forEach(([x, y], i) => {
    const z = WALL_Z + x * 0.02 + (rng() - 0.5) * 0.6;
    figure(ctx, { pos: [x, z], y, rotY: rng() * Math.PI * 2, colors: builderColors[i % 3], clear: 0, extras: { sword: '#9aa0a8', load: i % 3 === 1 ? STONE[i % 4] : undefined } });
  });
  // Carriers bringing stone up from below, and the armed half with spears and shields.
  for (let i = 0; i < 12; i++) {
    const x = -40 + rng() * 80, z = WALL_Z + 3 + rng() * 6;
    figure(ctx, { pos: [x, z], facing: [x + (rng() - 0.5) * 4, WALL_Z], colors: builderColors[i % 3], extras: { sword: '#9aa0a8', load: STONE[i % 4] } });
  }
  for (let i = 0; i < 16; i++) {
    const x = -36 + i * 4.6 + rng(), z = WALL_Z + 2.6 + rng();
    figure(ctx, { pos: [x, z], facing: [x, WALL_Z - 30], colors: { robe: '#5e4b3a', mantle: '#7a2a2a', skin: PEOPLE.skins[i % 6], hair: '#2b1a12', sash: '#c8912e', arms: [0.2, 0.3] }, extras: { spear: '#5a4030', shield: '#8a5a3c', helmet: '#8a8a7a' } });
  }

  // Nehemiah directing the work from a block of cut stone, and the trumpeter beside him.
  const ny = ctx.terrainHeight(...NEHEMIAH);
  const step = new THREE.Mesh(box(2.4, 0.9, 1.8, [NEHEMIAH[0], ny + 0.25, NEHEMIAH[1]]), ctx.kit.stoneMat('#d8c095'));
  step.castShadow = step.receiveShadow = true;
  ctx.scene.add(step);
  ctx.addCollider({ x: NEHEMIAH[0], z: NEHEMIAH[1], hx: 1.2, hz: 0.9, rot: 0, top: ny + 0.7, walkable: true });
  figure(ctx, { pos: NEHEMIAH, y: ny + 0.7, clear: 2.5, facing: [12, -6], scale: 1.12, colors: { robe: '#2f5a6a', mantle: '#c8912e', skin: '#a87650', hair: '#2b1a12', sash: '#e6d8b8', arms: [0.5, 1.5] }, extras: { tallHat: '#e6d8b8' } });
  figure(ctx, { pos: [NEHEMIAH[0] - 1.9, NEHEMIAH[1] - 0.6], facing: [-6, WALL_Z], colors: { robe: '#d9c7a3', mantle: '#8a5a3c', skin: '#9c6a45', hair: '#3a2418', sash: '#5a3a26', arms: [0.2, 1.4] }, extras: { trumpet: '#d8a840', sword: '#9aa0a8' } });
}

export default {
  title: 'Nehemiah 4:16-18: Nehemiah rebuilds the walls',
  subtitle: 'Every one had his sword girded by his side, and so builded',
  seed: 36,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#ecdcbc', near: 120, far: 1000 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#2f6a9a', mid: '#7fb0c8', horizon: '#f3e0b8', ground: '#c8b08a', glowColor: '#fff4d8', glowDir: [0.5, 0.8, 0.3] },

  sun: { dir: [0.5, 0.8, 0.4], color: '#fff3dc', intensity: 2.6, hemi: { sky: '#d6e6ee', ground: '#b08a5a', intensity: 1.1 }, shadowSize: 70 },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 100,
    hillHeight: 45,
    undulation: 0.3,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#d4b884', dirt: '#bf9a66', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#d4b884', plazaLine: '#d4b884',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#9a9a62',
    },
  },

  mountains: { count: 26, distance: [500, 800], height: [50, 110], widthRatio: [1.8, 2.8], colors: ['#a89a7a', '#9a8a72', '#b8a888'] },

  objects: [{ type: 'stones', count: 700, ring: [3, 70], size: [0.12, 0.45], colors: STONE }],
  custom,

  clouds: { layers: [{ count: 40, distance: [350, 800], height: [90, 180], size: [40, 90], color: '#ffffff', shade: '#6a7a92' }] },

  crowd: {
    seed: 36,
    minSpacing: 0.8,
    facing: [0, WALL_Z],
    colors: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#d8cdb5'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#c9b48e'],
      skins: PEOPLE.skins,
      hair: PEOPLE.hair,
      wraps: ['#d8cdb5', '#8a7a5a', '#c9b48e'],
    },
    keepClear: [{ kind: 'circle', x: NEHEMIAH[0], z: NEHEMIAH[1], r: 4 }],
    groups: [{ shape: 'rect', center: [0, -4], size: [120, 10], count: 70, facingJitter: 2.5 }],
  },

  player: { start: [2.2, 4.5], lookAt: [-4.5, WALL_Z], colors: { robe: '#a0825c', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
