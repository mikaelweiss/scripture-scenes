// Luke 2:1-7: Jesus is born in Bethlehem and laid in a manger, the town full of census travelers.
// x is east, z is south. The stable stands at the head of the street to the north.
import { Batch, PALETTE, animal, ball, box, camel, glow, house, lamp, makeRng, manger, moon, olive, person, room, stars, torch, xf } from './lib/nt-01-kit.js';

const STABLE = [0, -20];
const MANGER = [0.2, -21.2];
const STONES = ['#c9b08a', '#bfa47a', '#d2bc94', '#b89c74'];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(202);

  stars(ctx, { count: 500, size: 1.6, minY: 0.3 });
  moon(ctx, { dir: [-0.6, 0.35, -0.7], size: 50 });

  // The stable: a stone shelter backed into the rocky hill.
  const { y: fy } = room(b, ctx, { pos: STABLE, size: [11, 7], height: 3, color: '#a8906c', floor: '#c9a65a', beam: '#5a3e28', sill: 0.9 });
  for (let i = 0; i < 7; i++) b.add('#c9a65a', xf(new THREE.BoxGeometry(11.6, 0.18, 1.3), { pos: [0, fy + 3.1 + (i % 2) * 0.05, STABLE[1] - 3.2 + i * 1.05], rot: [0.08, 0, 0] }));
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI * 0.95 + rng() * Math.PI * 0.9;
    const r = 8 + rng() * 10;
    const x = STABLE[0] + Math.cos(a) * r * 1.3, z = STABLE[1] - 4 + Math.sin(a) * r * 0.6;
    const s = 2.5 + rng() * 3.5;
    b.add(rng() < 0.5 ? '#8a7a62' : '#9a8668', ball(s, [x, ctx.terrainHeight(x, z) + s * 0.2, z], [1.3, 0.8 + rng() * 0.5, 1], 7));
    ctx.addCollider({ x, z, hx: s, hz: s * 0.8, rot: 0, top: s });
  }
  const mp = manger(b, ctx, { pos: MANGER, y: fy });
  glow(ctx, { pos: [mp[0], mp[1] + 0.2, mp[2]], size: 3.5, color: '#fff0c0', opacity: 0.7, pulse: 0.05 });
  const babyLight = new THREE.PointLight('#ffe6b0', 6, 8, 1.2);
  babyLight.position.set(mp[0], mp[1] + 1.2, mp[2] + 0.6);
  ctx.scene.add(babyLight);
  lamp(b, ctx, { pos: [-4.4, STABLE[1] - 2.6], y: fy + 1.2, light: { color: '#ffb060', intensity: 5, distance: 10 } });
  b.add('#8a7a62', box(0.6, 1.2, 0.6, [-4.4, fy + 0.6, STABLE[1] - 2.6]));
  animal(b, ctx, { kind: 'ox', pos: [3.4, -22.2], rot: -2.2, y: fy, color: '#8c6a4a', lying: true });
  animal(b, ctx, { kind: 'donkey', pos: [-3.3, -21.6], rot: 2.4, y: fy, color: '#7d7468' });
  for (const [x, z] of [[4.3, -18.4], [-4.2, -18.2]]) b.add('#d9b860', ball(0.7, [x, fy + 0.2, z], [1.2, 0.5, 1], 7));

  // The street of Bethlehem: packed houses, the inn and its lit windows.
  house(b, ctx, { pos: [-11, -6], size: [9, 12], height: 6, color: '#d6c09a', trim: '#8c5a3c', upper: true, lit: true, rot: Math.PI / 2 });
  for (let z = 4; z < 70; z += 7.8) {
    for (const side of [-1, 1]) {
      if (side < 0 && z < 4) continue;
      const w = 5.6 + rng() * 1.6, d = 6 + rng() * 1.5;
      house(b, ctx, { pos: [side * 10, z], size: [d, w], height: 3.4 + rng() * 2.6, rot: -side * Math.PI / 2, color: STONES[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.4, lit: rng() < 0.6 });
    }
  }
  house(b, ctx, { pos: [11, -6], size: [8, 8], height: 4, color: '#c9b08a', trim: '#a89070', rot: -Math.PI / 2, lit: true });
  for (let i = 0; i < 80; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (19 + rng() * 55);
    const z = 70 - rng() * 110;
    if (ctx.blocked(x, z, 3)) continue;
    house(b, ctx, { pos: [x, z], size: [5 + rng() * 3, 5 + rng() * 3], height: 3 + rng() * 3, rot: Math.floor(rng() * 4) * Math.PI / 2, color: STONES[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.3, lit: rng() < 0.35 });
  }
  for (let i = 0; i < 30; i++) {
    const x = (rng() - 0.5) * 200, z = -40 - rng() * 80;
    if (!ctx.blocked(x, z, 2)) olive(b, ctx, { pos: [x, z], size: 0.9 + rng() * 0.4, seed: i });
  }
  for (const [x, z] of [[-5.5, -9], [5.5, -9], [-5.5, 12], [5.5, 28]]) torch(b, ctx, { pos: [x, z], light: { color: '#ffa850', intensity: 7, distance: 14 } });

  // Travelers' beasts along the street.
  for (const [x, z, r] of [[-6, 6, 0.3], [6.2, 16, -0.2], [-6.4, 24, 0.1], [6, 34, 3]]) animal(b, ctx, { kind: 'donkey', pos: [x, z], rot: r, color: rng() < 0.5 ? '#7d7468' : '#8a7058' });
  camel(b, ctx, { pos: [6.5, 44], rot: 0.2, couched: true, load: '#b5523b' });
  camel(b, ctx, { pos: [-6.5, 52], rot: -0.3, load: '#4f7f80' });
  for (let i = 0; i < 14; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (5.4 + rng() * 1.2), z = 2 + rng() * 50;
    if (ctx.blocked(x, z, 0.6)) continue;
    b.add(rng() < 0.5 ? '#8c5a3c' : '#a87b4f', box(0.7, 0.5, 0.6, [x, ctx.terrainHeight(x, z) + 0.25, z], [0, rng(), 0]));
  }
  b.flush();

  // Mary kneels by the manger. Joseph stands with his staff.
  person(ctx, { pos: [-1.3, -21.5], face: MANGER, kneel: true, y: fy, colors: { robe: '#4f7f9a', mantle: '#e6d8b8', skin: '#b5825a', hair: '#e6d8b8', sash: '#c8912e', arms: [0.15, 0.9] } });
  person(ctx, { pos: [1.7, -20.2], face: MANGER, y: fy, scale: 1.05, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', sash: '#c8912e', arms: [0.1, 0.4] } });
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 6), ctx.kit.toon('#6b4a33'));
  staff.position.set(2.05, fy + 1.05, -20.0);
  ctx.scene.add(staff);
}

export default {
  title: 'Luke 2:1-7: The birth of Jesus',
  subtitle: 'Bethlehem, crowded for the census',
  seed: 202,
  style: {
    ink: '#160e14',
    toonSteps: [0.34, 0.64, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [50, 320, 260, 0.4] },
    grain: 0.06,
    fog: { color: '#3a3456', near: 50, far: 360 },
    crack: '#1a1420', ember: '#c8502c', emberHot: '#ffb347', flameOuter: '#f08a2c', flameInner: '#ffe08a', charred: '#2a1e1a', smoke: '#555060', smokeShade: '#1a1622',
  },
  sky: { zenith: '#0e1430', mid: '#2a3260', horizon: '#9a6070', ground: '#241c26', glowColor: '#d08a70', glowDir: [0.6, 0.12, 0.8] },
  sun: { dir: [0.5, 0.6, 0.6], color: '#b0b8e8', intensity: 1.2, hemi: { sky: '#6070a8', ground: '#3a2a30', intensity: 0.9 }, shadowSize: 55 },
  ground: {
    size: 1200, segments: 220, flatRadius: 110, hillHeight: 40, undulation: 0.15,
    plaza: { center: [0, 25], size: [11, 70] },
    colors: { sand: '#a89070', dirt: '#957a5a', grass: '#7a7a58', grassDark: '#5c5c44', plaza: '#a8987a', plazaLine: '#7d6c54', scorch: '#2a1e1a', scorchEdge: '#4a3426', hill: '#6e6a58' },
  },
  mountains: { count: 28, distance: [450, 750], height: [40, 90], widthRatio: [1.8, 2.8], colors: ['#3a3858', '#423e60', '#36344e'] },
  objects: [{ type: 'stones', count: 120, ring: [3, 50], size: [0.1, 0.3], colors: ['#a0865e', '#b49a74'] }],
  custom,
  crowd: {
    seed: 12,
    minSpacing: 0.9,
    facing: [0, 60],
    colors: { ...PALETTE, robes: ['#8c5a3c', '#7a6a52', '#a87b4f', '#6f8a6a', '#4f7f80', '#9c6b4e', '#b5523b', '#c8a97a'] },
    aisles: [{ from: [0, 60], to: [0, -12], width: 2.6 }],
    groups: [
      { shape: 'rect', center: [-4, 30], size: [5, 56], count: 55, facingJitter: 3.2, children: 0.15 },
      { shape: 'rect', center: [4, 30], size: [5, 56], count: 55, facingJitter: 3.2, children: 0.15 },
      { shape: 'rect', center: [-5, -6], size: [4, 10], count: 14, facing: [-11, -6], facingJitter: 1.2, children: 0.2 },
      { shape: 'rect', center: [6, -9], size: [5, 7], count: 10, facing: [11, -6], facingJitter: 2.5, kneel: 0.4 },
    ],
  },
  player: {
    start: [0, -9],
    lookAt: [0, -20],
    colors: { robe: '#6b5a4a', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
