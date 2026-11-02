// 1 Nephi 3-4: Nephi, in Laban's garments, leaves Laban's house at night with Zoram carrying the brass plates.
// x is east, z is south. Laban's walled house stands at the head of the street to the north.
import { Batch, cityWall, glow, house, makeRng, moon, person, stars, torch, xf } from './lib/bom-01-kit.js';

const GATE = [0, -18];
const NEPHI = [-0.9, -14.2];
const ZORAM = [0.9, -14.6];
const STONES = ['#cdb48a', '#c2a87e', '#d6c09a', '#bfa47a'];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(303);

  stars(ctx, { count: 1100, size: 2 });
  moon(ctx, { dir: [-0.45, 0.42, -0.8], size: 70 });

  // Laban's compound: high wall, gate towers, great house and the treasury.
  const wallColor = '#c9b48c';
  cityWall(b, ctx, { from: [-17, -18], to: [-2.6, -18], height: 5, color: wallColor, thick: 1.2 });
  cityWall(b, ctx, { from: [2.6, -18], to: [17, -18], height: 5, color: wallColor, thick: 1.2 });
  cityWall(b, ctx, { from: [-17, -46], to: [17, -46], height: 5, color: wallColor, thick: 1.2 });
  cityWall(b, ctx, { from: [-17, -18], to: [-17, -46], height: 5, color: wallColor, thick: 1.2 });
  cityWall(b, ctx, { from: [17, -18], to: [17, -46], height: 5, color: wallColor, thick: 1.2 });
  const gy = ctx.terrainHeight(...GATE) - 0.3;
  for (const sx of [-1, 1]) {
    b.add('#d6c09a', xf(new THREE.BoxGeometry(3, 7.5, 3), { pos: [GATE[0] + sx * 3.9, gy + 3.75, GATE[1]] }));
    b.add('#b5a07a', xf(new THREE.BoxGeometry(3.4, 0.4, 3.4), { pos: [GATE[0] + sx * 3.9, gy + 7.6, GATE[1]] }));
    b.add('#5e3f28', xf(new THREE.BoxGeometry(2.4, 4.4, 0.18), { pos: [GATE[0] + sx * 2.3, gy + 2.2, GATE[1] + 1.2], rot: [0, sx * 1.25, 0] }));
    ctx.addCollider({ x: GATE[0] + sx * 3.9, z: GATE[1], hx: 1.5, hz: 1.5, rot: 0, top: gy + 7.5 });
  }
  b.add('#d6c09a', xf(new THREE.BoxGeometry(5, 1.4, 3), { pos: [GATE[0], gy + 6.3, GATE[1]] }));
  b.add('#8c5a3c', xf(new THREE.BoxGeometry(5.2, 0.3, 3.2), { pos: [GATE[0], gy + 5.55, GATE[1]] }));
  house(b, ctx, { pos: [0, -36], size: [20, 12], height: 8, color: '#e3cfa6', trim: '#b5523b', upper: true, lit: true, door: '#2b1a12' });
  house(b, ctx, { pos: [-10, -25], size: [6, 5], height: 3.6, rot: Math.PI / 2, color: '#bfa47a', trim: '#8c5a3c', door: '#ffb85a' });
  for (let i = 0; i < 4; i++) b.add('#8c5a3c', xf(new THREE.BoxGeometry(0.7, 0.7, 0.7), { pos: [-6.4 + (i % 2) * 0.9, ctx.terrainHeight(-6.4, -26) + 0.35 + Math.floor(i / 2) * 0.7, -26.5 + (i % 2) * 0.4] }));

  // The street outside, its houses mostly dark with a few lamps still burning.
  for (let z = -8; z < 70; z += 8.2) {
    for (const side of [-1, 1]) {
      const w = 6 + rng() * 1.6, d = 6.5 + rng() * 1.5;
      house(b, ctx, { pos: [side * 9.8, z], size: [d, w], height: 3.6 + rng() * 3, rot: -side * Math.PI / 2, color: STONES[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.4, lit: rng() < 0.4 });
    }
  }
  for (let i = 0; i < 120; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (19 + rng() * 60);
    const z = 70 - rng() * 140;
    if (ctx.blocked(x, z, 3)) continue;
    house(b, ctx, { pos: [x, z], size: [5.5 + rng() * 3, 5.5 + rng() * 3], height: 3 + rng() * 4, rot: Math.floor(rng() * 4) * Math.PI / 2, color: STONES[Math.floor(rng() * 4)], trim: '#a89070', upper: rng() < 0.3, lit: rng() < 0.25 });
  }

  torch(b, ctx, { pos: [GATE[0] - 2.4, GATE[1] + 2.2] });
  torch(b, ctx, { pos: [GATE[0] + 2.4, GATE[1] + 2.2] });
  torch(b, ctx, { pos: [-6.2, 14], light: { color: '#ffa850', intensity: 7, distance: 13 } });
  torch(b, ctx, { pos: [6.2, 34], light: { color: '#ffa850', intensity: 7, distance: 13 } });
  b.add('#ffb85a', xf(new THREE.BoxGeometry(0.1, 2, 1.2), { pos: [-7, ctx.terrainHeight(-7, -25) + 1.1, -25] }), { glow: true });
  glow(ctx, { pos: [-6.6, ctx.terrainHeight(-7, -25) + 1.2, -25], size: 4, color: '#ffb35a', opacity: 0.45 });
  b.flush();

  // Nephi in Laban's garments and sword; Zoram, with the keys, carries the plates.
  const ny = ctx.groundHeight(...NEPHI);
  person(ctx, { pos: NEPHI, face: [-1, 10], scale: 1.12, colors: { robe: '#6e2f3a', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#e9c46a', arms: [0.25, 0.25] } });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.1, 0.03), ctx.kit.toon('#d8d8e0', { emissive: '#3a3a48' }));
  blade.position.set(NEPHI[0] - 0.33, ny + 0.62, NEPHI[1] + 0.05);
  blade.rotation.z = 0.12;
  const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.08), ctx.kit.toon('#e9c46a'));
  hilt.position.set(NEPHI[0] - 0.36, ny + 1.18, NEPHI[1] + 0.05);
  ctx.scene.add(blade, hilt);

  const zy = ctx.groundHeight(...ZORAM);
  person(ctx, { pos: ZORAM, face: [1.5, 10], scale: 1.02, colors: { robe: '#d9c7a3', mantle: '#3e6e66', skin: '#9c6a45', hair: '#3a2418', sash: '#b5523b', arms: [0.15, 1.05] } });
  const plates = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.2), ctx.kit.toon('#d9a441', { emissive: '#5a3a10' }));
  plates.position.set(ZORAM[0] + 0.03, zy + 1.02, ZORAM[1] + 0.48);
  plates.rotation.y = 0.15;
  ctx.scene.add(plates);
  for (let k = 0; k < 3; k++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 4, 10), ctx.kit.toon('#e9c46a'));
    ring.position.set(ZORAM[0] - 0.2 + k * 0.2, zy + 1.02, ZORAM[1] + 0.59);
    ctx.scene.add(ring);
  }
  glow(ctx, { pos: [ZORAM[0], zy + 1.05, ZORAM[1] + 0.5], size: 1.4, color: '#ffd27a', opacity: 0.6, pulse: 0.06 });
}

export default {
  title: '1 Nephi 3-4: Nephi obtains the brass plates',
  subtitle: "Jerusalem by night, at the gate of Laban's house",
  seed: 303,
  style: {
    ink: '#120c14',
    toonSteps: [0.32, 0.62, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [50, 300, 260, 0.4] },
    grain: 0.06,
    fog: { color: '#1c2440', near: 40, far: 320 },
    crack: '#1a1420',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#2a1e1a',
    smoke: '#555060',
    smokeShade: '#1a1622',
  },
  sky: { zenith: '#070b1e', mid: '#121c3c', horizon: '#2c3860', ground: '#141826', glowColor: '#3c4c80', glowDir: [-0.45, 0.42, -0.8] },
  sun: { dir: [-0.45, 0.75, -0.6], color: '#9fb4e8', intensity: 1.1, hemi: { sky: '#4a5a90', ground: '#2a2232', intensity: 0.75 }, shadowSize: 55 },
  ground: {
    size: 1200, segments: 220, flatRadius: 150, hillHeight: 40, undulation: 0.15,
    plaza: { center: [0, 20], size: [12, 90] },
    colors: { sand: '#b49a74', dirt: '#a0865e', grass: '#8a8a62', grassDark: '#6c6c4a', plaza: '#a8987a', plazaLine: '#7d6c54', scorch: '#2a1e1a', scorchEdge: '#4a3426', hill: '#8a7a62' },
  },
  mountains: { count: 28, distance: [450, 750], height: [50, 110], widthRatio: [1.8, 2.8], colors: ['#2e3452', '#343a5a', '#2a3048'] },
  objects: [{ type: 'stones', count: 120, ring: [3, 50], size: [0.1, 0.3], colors: ['#a0865e', '#b49a74'] }],
  custom,
  crowd: {
    seed: 5,
    minSpacing: 1.2,
    facing: GATE,
    colors: { robes: ['#6b5a4a', '#5e4632', '#7a6a52'], mantles: ['#3e3a4a', '#4a3528'], skins: ['#8a5a3b', '#9c6a45'], hair: ['#2b1a12'], wraps: ['#6b5a4a'] },
    groups: [{ shape: 'rect', center: [0, 46], size: [5, 6], count: 2, facingJitter: 2 }],
  },
  player: {
    start: [0, -6],
    lookAt: [0, -18],
    colors: { robe: '#6b5a4a', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
