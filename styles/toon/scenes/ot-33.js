// 2 Kings 2:9-13: beyond the Jordan, a chariot and horses of fire part Elijah from Elisha and he goes up by a whirlwind.
// x is east, z is south. The Jordan runs north to south just west of the pair. Fifty sons of the prophets watch from afar.
import * as THREE from 'three';
import { Batch, PEOPLE, chariot, figure, fireSpots, flames, frameAt, glow, horse, makeRng, river, rock, tree, whirlwind, xf } from './lib/ot-31-kit.js';

const CHARIOT = [3, -11];
const LIFT = 4.2;
const ELISHA = [0.5, 0];
const RIVER_X = -16;

function custom(ctx) {
  const b = new Batch(ctx);
  const fire = new Batch(ctx);
  const rng = makeRng(33);
  const [cx, cz] = CHARIOT;
  const gy = ctx.terrainHeight(cx, cz);
  const cy = gy + LIFT;

  river(ctx, { from: [RIVER_X, 260], to: [RIVER_X - 6, -260], width: 13, y: 0.25, color: '#5b8f8a', line: '#d6ebe0' });

  // The chariot of fire and its two horses, rising, facing up and away to the north east.
  const rotY = 1.75;
  const f = frameAt(cx, cy, cz, rotY).multiply(new THREE.Matrix4().makeRotationX(-0.25)).multiply(new THREE.Matrix4().makeScale(1.6, 1.6, 1.6));
  chariot(fire, f, { body: '#ff9a3c', trim: '#fff0a0', wheel: '#ffcf5a', glow: true });
  for (const s of [-0.75, 0.75]) {
    const hf = f.clone().multiply(new THREE.Matrix4().makeTranslation(s, -0.2, 3.4));
    horse(fire, hf, { color: '#ffb347', mane: '#fff0a0', glow: true, rear: 0.6, scale: 1.1 });
  }
  fire.flush();
  const dir = [Math.sin(rotY), Math.cos(rotY)];
  const spots = [];
  for (let i = 0; i < 26; i++) {
    const along = -1.5 + rng() * 9, side = (rng() - 0.5) * 3.6;
    const x = cx + dir[0] * along + dir[1] * side, z = cz + dir[1] * along - dir[0] * side;
    spots.push([x, cy + 0.6 + along * 0.4 + rng() * 1.5, z, 1.2 + rng() * 2, 1 + rng() * 0.9]);
  }
  flames(ctx, spots, { outer: '#ff8a2c', inner: '#fff0a0' });
  glow(ctx, [cx, cy + 2, cz], 14, '#ffc870', 0.55, 0.08);
  glow(ctx, [cx, cy + 14, cz - 6], 26, '#ffe0a0', 0.3, 0.05);
  const pl = new THREE.PointLight('#ffb060', 50, 50, 1.3);
  pl.position.set(cx, cy + 2, cz);
  ctx.scene.add(pl);
  ctx.onFrame((t) => (pl.intensity = 46 + Math.sin(t * 10) * 5));
  whirlwind(ctx, { at: [cx, gy, cz], height: 70, r0: 2.5, r1: 16, count: 46, color: '#fff1d0', opacity: 0.45 });

  // Elijah in the chariot, borne upward.
  figure(ctx, { pos: [cx + dir[0] * -0.3, cz + dir[1] * -0.3], y: cy + 0.9, rotY, scale: 1.5, glow: 0.35, clear: 0, colors: { robe: '#d8b890', mantle: '#c8a070', skin: '#c08f66', hair: '#f4ecdc', sash: '#e8c070', arms: [0.5, 2.2] } });

  // His mantle, falling toward Elisha.
  const mantle = new THREE.Mesh(xf(new THREE.PlaneGeometry(1.6, 1.1, 4, 3), { rot: [-1.0, 0.4, 0.3] }), ctx.kit.toon('#6a4a30', { side: THREE.DoubleSide }));
  mantle.position.set(1.8, ctx.terrainHeight(1.8, -5) + 2.6, -5);
  mantle.castShadow = true;
  ctx.scene.add(mantle);
  ctx.onFrame((t) => {
    mantle.position.y = ctx.terrainHeight(1.8, -5) + 2.6 + Math.sin(t * 0.8) * 0.25;
    mantle.rotation.z = Math.sin(t * 1.1) * 0.25;
  });

  // Elisha, crying out, arms raised.
  figure(ctx, { pos: ELISHA, facing: CHARIOT, scale: 1.0, colors: { robe: '#a08060', mantle: '#7a6a52', skin: '#a87650', hair: '#2b1a12', sash: '#5a3a26', arms: [0.6, 2.6] } });

  // Tamarisks, palms and reeds along the Jordan; rocks on the plain.
  for (let i = 0; i < 70; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const z = -150 + rng() * 300;
    const rx = RIVER_X - 6 * (0.5 - z / 520) + side * (9 + rng() * 22);
    if (Math.hypot(rx - cx, z - cz) < 22 || Math.hypot(rx - ELISHA[0], z - ELISHA[1]) < 12) continue;
    tree(b, ctx, rx, z, rng, { kind: rng() < 0.35 ? 'palm' : 'olive', h: 4 + rng() * 4, leaves: ['#6f8a52', '#7e9a5a', '#5a7a46'] });
  }
  for (let i = 0; i < 60; i++) {
    const x = 6 + rng() * 80, z = -60 + rng() * 120;
    const y = ctx.terrainHeight(x, z);
    b.add(['#c8a87a', '#b89a70', '#d6bf95'][i % 3], rock(0.3 + rng() * 0.8, [x, y + 0.1, z], [1.3, 0.6, 1], [rng(), rng() * 3, rng()]));
  }
  b.flush();
}

export default {
  title: "2 Kings 2:9-13: Elijah's chariot of fire",
  subtitle: 'Beside the Jordan. Elijah went up by a whirlwind into heaven',
  seed: 33,

  style: {
    ink: '#2b1a14',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e8c9a0', near: 120, far: 1100 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#3a5a86', mid: '#8aa0b8', horizon: '#f6cf9a', ground: '#c8a07a', glowColor: '#ffe0a8', glowDir: [0.3, 0.5, -1] },

  sun: { dir: [-0.6, 0.6, 0.5], color: '#fff0d6', intensity: 2.4, hemi: { sky: '#d6e2ec', ground: '#a07a52', intensity: 1.05 }, shadowSize: 60 },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 110,
    hillHeight: 55,
    undulation: 0.25,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#d2b07a', dirt: '#bf9560', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#d2b07a', plazaLine: '#d2b07a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b89a6a',
    },
  },

  mountains: { count: 30, distance: [480, 800], height: [60, 140], widthRatio: [1.6, 2.6], colors: ['#b89a7a', '#a88a72', '#c8a888', '#9a8a7a'] },

  objects: [{ type: 'stones', count: 500, ring: [4, 90], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#d9c39a'] }],
  custom,

  clouds: {
    layers: [
      { count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff1d8', shade: '#5a4a62' },
      { count: 16, center: CHARIOT, distance: [20, 70], height: [70, 110], size: [25, 45], color: '#ffe6b8', shade: '#8a5a4a', drift: 0.006 },
    ],
  },

  light: {
    beams: [{ from: [3, 160, -40], to: { at: CHARIOT, lift: LIFT }, width: [26, 6], color: '#fff0c4', intensity: 0.12, layers: 3, stripes: 22, fadeLow: 0.1 }],
  },

  crowd: {
    seed: 33,
    minSpacing: 0.7,
    facing: CHARIOT,
    colors: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#c9b48e'],
      skins: PEOPLE.skins,
      hair: PEOPLE.hair,
      wraps: ['#d8cdb5', '#8a7a5a', '#c9b48e'],
    },
    groups: [{ shape: 'rect', center: [-40, -6], size: [8, 14], count: 50, kneel: 0.3 }],
  },

  player: { start: [3, 8], lookAt: [3, -10], colors: { robe: '#7a6a52', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
