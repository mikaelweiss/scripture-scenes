// 1 Kings 18:30-39: fire falls on Elijah's soaked altar of twelve stones while Baal's altar stands cold.
// The summit of Carmel at the evening sacrifice. x is east, z is south. The sea lies far below to the west.
import * as THREE from 'three';
import { Batch, PEOPLE, box, cyl, fireSpots, figure, flames, glow, lightColumn, makeRng, rock, xf } from './lib/ot-31-kit.js';

const ALTAR = [0, -8];
const BAAL = [-17, -15];
const ELIJAH = [-2.8, -3.2];

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(31);
  const [ax, az] = ALTAR;
  const ay = ctx.terrainHeight(ax, az);

  // Altar of twelve rough stones, wood, and the bullock.
  for (let i = 0; i < 12; i++) {
    const layer = Math.floor(i / 4), k = i % 4;
    const lx = (k % 2 ? 0.6 : -0.6), lz = (k < 2 ? 0.6 : -0.6);
    b.add(['#9c8f7e', '#a89a86', '#8d806f'][i % 3], rock(0.68, [ax + lx, ay + 0.35 + layer * 0.55, az + lz], [1, 0.6, 1], [rng(), rng() * 3, rng()]));
  }
  for (let i = 0; i < 8; i++) b.add('#5a3a26', cyl(0.1, 0.1, 2.3, [ax + (rng() - 0.5) * 1.2, ay + 1.9 + (i % 2) * 0.15, az + (rng() - 0.5) * 0.8], [Math.PI / 2, (i % 2) * 1.5 + rng() * 0.4, 0], 6));
  b.add('#7a3e26', xf(new THREE.CapsuleGeometry(0.35, 1.0, 4, 8), { pos: [ax, ay + 2.35, az], rot: [0, 0, Math.PI / 2] }), { emissive: '#4a1a08' });
  ctx.addCollider({ x: ax, z: az, hx: 1.5, hz: 1.5, rot: 0, top: ay + 2.8 });
  ctx.exclude({ kind: 'circle', x: ax, z: az, r: 4.2 });

  // The trench, full of water, licked by the fire.
  const trench = new THREE.Mesh(xf(new THREE.RingGeometry(2.2, 3.1, 32, 1), { rot: [-Math.PI / 2, 0, 0] }), ctx.kit.toon('#5aa0b0', { emissive: '#3a2008' }));
  trench.position.set(ax, ay + 0.06, az);
  ctx.scene.add(trench);
  b.add('#6e5a44', xf(new THREE.TorusGeometry(3.15, 0.14, 4, 32), { pos: [ax, ay + 0.04, az], rot: [Math.PI / 2, 0, 0] }), { cast: false });

  // Twelve water jars poured over the sacrifice.
  for (let i = 0; i < 6; i++) {
    const a = 2.3 + i * 0.32, d = 4.6;
    const jx = ax + Math.sin(a) * d, jz = az + Math.cos(a) * d;
    const jy = ctx.terrainHeight(jx, jz);
    b.add('#a8643a', i === 5 ? cyl(0.2, 0.28, 0.7, [jx, jy + 0.25, jz], [Math.PI / 2, a, 0]) : cyl(0.2, 0.28, 0.7, [jx, jy + 0.35, jz]));
  }

  // The fire of the Lord: a column out of heaven and flames over the altar.
  lightColumn(ctx, { at: [ax, ay + 1.8, az], height: 120, r0: 1.6, r1: 9, color: '#ffb347', opacity: 0.22 });
  flames(ctx, fireSpots(rng, ax, ay + 1.8, az, 1.3, 14, [1.8, 3.6], 1.5), { outer: '#f08a2c', inner: '#ffe08a' });
  flames(ctx, fireSpots(rng, ax, ay + 0.1, az, 2.9, 12, [0.4, 0.9], 0.8));
  glow(ctx, [ax, ay + 3, az], 16, '#ffcf7a', 0.9, 0.08);
  glow(ctx, [ax, ay + 12, az], 22, '#ffb347', 0.45, 0.06);
  const fireLight = new THREE.PointLight('#ffb060', 40, 40, 1.4);
  fireLight.position.set(ax, ay + 4, az);
  ctx.scene.add(fireLight);
  ctx.onFrame((t) => (fireLight.intensity = 36 + Math.sin(t * 11) * 5 + Math.sin(t * 7.3) * 4));

  // Baal's altar: cut stone, cold wood, a pole with a gilded top.
  const [bx, bz] = BAAL;
  const by = ctx.terrainHeight(bx, bz);
  b.add('#8a7766', box(4.2, 1.1, 3.2, [bx, by + 0.45, bz]));
  b.add('#9a8674', box(3.6, 0.5, 2.6, [bx, by + 1.2, bz]));
  for (let i = 0; i < 6; i++) b.add('#5a4030', box(0.2, 0.2, 2.5, [bx - 1.2 + i * 0.48, by + 1.55, bz], [0, (i % 2 ? 0.1 : -0.1), 0]));
  b.add('#6a3a2a', box(1.7, 0.6, 0.8, [bx, by + 1.9, bz]));
  b.add('#6a5a48', cyl(0.3, 0.45, 7, [bx - 4, by + 3.5, bz - 3], [0, 0, 0], 7));
  b.add('#c8912e', xf(new THREE.ConeGeometry(0.6, 1.3, 6), { pos: [bx - 4, by + 7.6, bz - 3] }));
  ctx.addCollider({ x: bx, z: bz, hx: 2.1, hz: 1.6, rot: 0, top: by + 2.2 });
  ctx.addCollider({ x: bx - 4, z: bz - 3, hx: 0.45, hz: 0.45, rot: 0, top: by + 8 });
  ctx.exclude({ kind: 'rect', x: bx, z: bz, hx: 3, hz: 2.4 });
  ctx.exclude({ kind: 'circle', x: bx - 4, z: bz - 3, r: 1 });

  // Rocks, scrub and oaks across the summit.
  for (let i = 0; i < 140; i++) {
    const a = rng() * Math.PI * 2, r = 30 + rng() * 60;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const y = ctx.terrainHeight(x, z);
    if (rng() < 0.65) b.add(['#9c8f7e', '#8a7d6c', '#b0a28c'][i % 3], rock(0.4 + rng() * 1.2, [x, y + 0.2, z], [1.3, 0.7, 1], [rng(), rng() * 3, rng()]));
    else {
      const h = 2.5 + rng() * 3;
      b.add('#5e4632', cyl(0.15, 0.25, h * 0.5, [x, y + h * 0.25, z], [0, 0, 0], 6));
      b.add(['#5f7a45', '#4f6a3e', '#6f8a52'][i % 3], xf(new THREE.IcosahedronGeometry(h * 0.4, 0), { pos: [x, y + h * 0.7, z], scale: [1.2, 0.8, 1.2] }));
    }
  }
  b.flush();

  // The Great Sea far below to the west, and the summit falling away.
  const sea = new THREE.Mesh(xf(new THREE.PlaneGeometry(6000, 6000), { rot: [-Math.PI / 2, 0, 0] }), ctx.kit.toon('#4b6f86', { emissive: '#1a1830' }));
  sea.position.y = -48;
  ctx.scene.add(sea);

  // Elijah, arms lifted in prayer beside the altar.
  figure(ctx, { pos: ELIJAH, facing: ALTAR, scale: 1.15, colors: { robe: '#d8c4a0', mantle: '#7a5232', skin: '#9c6a45', hair: '#e8e0d0', sash: '#3a2a1c', arms: [0.4, 2.4] } });
  // Ahab under a canopy of state, watching.
  figure(ctx, { pos: [10, -1], facing: ALTAR, colors: { robe: '#6a2a4a', mantle: '#c8912e', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e', arms: [0.2, 0.2] }, extras: { crown: '#e0b040' } });
  const priest = { robe: '#7a2a3a', mantle: '#3a1a2a', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e', arms: [0.5, 0.6] };
  figure(ctx, { pos: [bx + 2.5, bz + 3], facing: ALTAR, colors: priest });
  figure(ctx, { pos: [bx - 1, bz + 3.3], facing: ALTAR, colors: { ...priest, robe: '#8e3b2c' } });
}

export default {
  title: '1 Kings 18:30-39: Elijah on Mount Carmel',
  subtitle: 'The fire of the Lord fell, and consumed the burnt sacrifice',
  seed: 31,

  style: {
    ink: '#2a1a16',
    toonSteps: [0.38, 0.7, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#d99a7a', near: 140, far: 1500 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#3a3a6e', mid: '#b0687a', horizon: '#f6b77a', ground: '#7a6a7a', glowColor: '#ffd08a', glowDir: [-1, 0.1, 0.1] },

  sun: { dir: [-0.9, 0.35, 0.2], color: '#ffc896', intensity: 2.2, hemi: { sky: '#c8b8d8', ground: '#7a5a48', intensity: 1.0 }, shadowSize: 60 },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 70,
    hillHeight: -80,
    undulation: 0.4,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#b89a72', dirt: '#a07a52', grass: '#7e8a52', grassDark: '#5e6a3e', plaza: '#b89a72', plazaLine: '#b89a72',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f8a5a',
    },
  },

  mountains: { count: 14, distance: [700, 950], height: [40, 90], widthRatio: [1.8, 2.8], colors: ['#7a6a8a', '#8a7a96', '#6e6480'] },

  objects: [{ type: 'stones', count: 500, ring: [5, 70], size: [0.12, 0.4], colors: ['#9c8f7e', '#b0a28c', '#8a7d6c'] }],
  custom,

  clouds: {
    layers: [
      { count: 30, distance: [400, 900], height: [40, 140], size: [40, 90], color: '#f6c8a0', shade: '#5a3a5a' },
      { count: 10, center: ALTAR, distance: [30, 80], height: [120, 160], size: [30, 50], color: '#ffe0b0', shade: '#7a4a4a', drift: 0.003 },
    ],
  },

  light: {
    rayFans: [{ source: [0, 140, -8], sourceJitter: 30, target: ALTAR, groundY: 2, spread: [3, 18], count: 7, width: [[3, 6], [4, 8]], color: '#ffb35a', intensity: 0.25, stripes: 9, fadeLow: 0.3 }],
  },

  crowd: {
    seed: 31,
    minSpacing: 0.62,
    facing: ALTAR,
    colors: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246', '#6d3b2e'],
      skins: PEOPLE.skins,
      hair: PEOPLE.hair,
      wraps: ['#d8cdb5', '#8a7a5a', '#c9b48e', '#6e5a44'],
    },
    aisles: [{ from: [1, 30], to: [0, -2], width: 5 }],
    groups: [
      { center: ALTAR, radius: [8, 28], angle: [-2.3, 2.3], count: 620, kneel: 0.45, lean: 0.5 },
      { center: BAAL, radius: [3.5, 8], angle: [-1.2, 2.6], count: 70, kneel: 0.3, colors: { robes: ['#7a2a3a', '#8e3b2c', '#5e2a4e', '#9a5a2a', '#6a2030'], mantles: ['#3a1a2a', '#b08a3a', '#4a2240'], skins: PEOPLE.skins, hair: PEOPLE.hair, wraps: ['#b08a3a', '#3a1a2a'] } },
    ],
  },

  player: { start: [1.6, 3], lookAt: [-1.2, -8], colors: { robe: '#a0825c', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
