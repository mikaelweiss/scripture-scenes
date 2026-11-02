// 2 Kings 5:9-14: Naaman, captain of the host of Syria, dips himself seven times in Jordan.
// x is east, z is south. The river runs east to west in front of the start; his chariot and servants wait on the south bank.
import * as THREE from 'three';
import { Batch, PEOPLE, box, chariot, cyl, figure, frameAt, horse, makeRng, river, rock, tree, xf } from './lib/ot-31-kit.js';

const NAAMAN = [0.5, -5];
const WATER_Y = 0.3;

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(34);

  river(ctx, { from: [-300, -6], to: [300, -12], width: 16, y: WATER_Y, color: '#4f8f92', line: '#d6ebe0', flow: 0.04 });

  // Naaman, bowing beneath the water and rising again.
  const naaman = figure(ctx, { pos: NAAMAN, y: -0.6, facing: [0, 10], clear: 0, colors: { robe: '#e8dcc4', mantle: '#e8dcc4', skin: '#b5825a', hair: '#2b1a12', arms: [0.35, 0.5] } });
  const ripples = [0, 1, 2].map((i) => {
    const r = new THREE.Mesh(xf(new THREE.TorusGeometry(1, 0.05, 4, 32), { rot: [Math.PI / 2, 0, 0] }), ctx.kit.basic('#e8f4f0'));
    r.position.set(NAAMAN[0], WATER_Y + 0.02, NAAMAN[1]);
    ctx.scene.add(r);
    return { r, phase: i / 3 };
  });
  ctx.onFrame((t) => {
    const cyc = (t % 9) / 9;
    const dip = cyc > 0.8 ? Math.sin(((cyc - 0.8) / 0.2) * Math.PI) : 0;
    naaman.position.y = -0.6 - dip * 1.15;
    naaman.rotation.x = dip * 0.35;
    for (const { r, phase } of ripples) {
      const life = (t * 0.4 + phase) % 1;
      r.scale.setScalar(0.5 + life * 3);
      r.visible = life < 0.95;
    }
  });

  // His chariot and horses on the south bank.
  const cf = frameAt(12, ctx.terrainHeight(12, 3), 3, -Math.PI / 2 - 0.3);
  chariot(b, cf, { body: '#7a3a2a', trim: '#c8912e', wheel: '#3a2418' });
  for (const s of [-0.75, 0.75]) horse(b, cf.clone().multiply(new THREE.Matrix4().makeTranslation(s, 0, 3.4)), { color: s < 0 ? '#e8e0d0' : '#7a5a3c', mane: '#3a2418' });
  ctx.addCollider({ x: 9.5, z: 2, hx: 3.4, hz: 1.2, rot: -0.3, top: ctx.terrainHeight(12, 3) + 2.2 });
  ctx.exclude({ kind: 'rect', x: 9.5, z: 2, hx: 4.2, hz: 1.8, rot: -0.3 });

  // Two more chariots and a baggage mule with the gifts of silver, gold and raiment.
  for (const [x, z, r] of [[22, 9, -1.6], [26, 2, -1.4]]) {
    const f = frameAt(x, ctx.terrainHeight(x, z), z, r);
    chariot(b, f, { body: '#6a3a2a', trim: '#b08a3a', wheel: '#3a2418' });
    horse(b, f.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 3.4)), { color: '#5e4632', mane: '#2b1a12' });
  }
  for (let i = 0; i < 5; i++) {
    const x = 16 + i * 0.9, z = 8 + (i % 2) * 0.8;
    const y = ctx.terrainHeight(x, z);
    b.add(['#c8912e', '#d9c7a3', '#8c5a3c'][i % 3], box(0.8, 0.5, 0.6, [x, y + 0.25, z], [0, i * 0.4, 0]));
  }

  // Naaman's armour and robe laid on a rock at the water's edge.
  const ry = ctx.terrainHeight(-2.5, 1);
  b.add('#a89a86', rock(0.9, [-2.5, ry + 0.3, 1], [1.4, 0.6, 1.1], [0.1, 0.4, 0]));
  b.add('#7a2a3a', box(1.3, 0.12, 0.9, [-2.5, ry + 0.85, 1], [0.1, 0.3, 0.05]));
  b.add('#c8b070', xf(new THREE.ConeGeometry(0.2, 0.36, 8), { pos: [-2.1, ry + 1.05, 1.2] }));
  b.add('#b8a888', cyl(0.4, 0.4, 0.06, [-3.2, ry + 0.75, 0.6], [1.2, 0, 0.3], 12));

  // Trees and reeds lining both banks.
  for (let i = 0; i < 90; i++) {
    const x = -140 + rng() * 280;
    const north = rng() < 0.55;
    const z = north ? -20 - rng() * 30 - x * 0.01 : 4 + rng() * 40;
    if (!north && Math.abs(x) < 30 && z < 24) continue;
    tree(b, ctx, x, z, rng, { kind: rng() < 0.3 ? 'palm' : 'olive', h: 4 + rng() * 4, leaves: ['#6f8a52', '#7e9a5a', '#5a7a46'] });
  }
  b.flush();
}

const syrian = {
  robes: ['#7a2a3a', '#8e3b2c', '#c8912e', '#d9c7a3', '#6a2030', '#4f5a6b'],
  mantles: ['#3a1a2a', '#b08a3a', '#c8912e', '#5e2a4e'],
  skins: PEOPLE.skins,
  hair: PEOPLE.hair,
  wraps: ['#e6d8b8', '#c8912e', '#7a2a3a', '#d9c7a3'],
};

export default {
  title: '2 Kings 5:9-14: Naaman in the Jordan',
  subtitle: 'He dipped himself seven times, and his flesh came again',
  seed: 34,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e6dcc0', near: 120, far: 1100 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#2f6a9a', mid: '#7fb0c8', horizon: '#f0e2c0', ground: '#c8b08a', glowColor: '#fff4d8', glowDir: [0.4, 0.8, -0.4] },

  sun: { dir: [0.4, 0.85, 0.35], color: '#fff6e0', intensity: 2.6, hemi: { sky: '#d6ecf2', ground: '#a8865a', intensity: 1.1 }, shadowSize: 60 },

  ground: {
    size: 1600,
    segments: 300,
    flatRadius: 120,
    hillHeight: 50,
    undulation: 0.2,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#d2b07a', dirt: '#bf9560', grass: '#8e9a58', grassDark: '#6c7a42', plaza: '#d2b07a', plazaLine: '#d2b07a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b89a6a',
    },
  },

  mountains: { count: 30, distance: [480, 800], height: [60, 130], widthRatio: [1.6, 2.6], colors: ['#b89a7a', '#a88a72', '#c8a888', '#9a8a7a'] },

  objects: [{ type: 'stones', count: 400, ring: [4, 80], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#d9c39a'] }],
  custom,

  clouds: { layers: [{ count: 46, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#ffffff', shade: '#6a7a92' }] },

  crowd: {
    seed: 34,
    minSpacing: 0.8,
    facing: NAAMAN,
    colors: syrian,
    groups: [
      { shape: 'rect', center: [-7, 2], size: [7, 4], count: 9, kneel: 0.1 },
      { shape: 'rect', center: [20, 6], size: [10, 6], count: 14 },
    ],
  },

  player: { start: [2.5, 6], lookAt: [0, -6], colors: { robe: '#a0825c', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
