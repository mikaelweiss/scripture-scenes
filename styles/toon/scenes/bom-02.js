// 1 Nephi 2:4-10: Lehi pitches his tent in the valley of Lemuel and builds an altar of stones.
// x is east, z is south. The river Laman runs south toward the Red Sea along the east of the camp.
import { Batch, DAY_STYLE, PALETTE, addSun, bush, camel, flames, glow, goat, makeRng, palm, person, river, tent, xf } from './lib/bom-01-kit.js';

const LEHI = [5, -5];
const ALTAR = [-5, -13];
const RIVER = [[40, -260], [26, -120], [15, -40], [12, 0], [17, 40], [30, 120], [44, 260]];

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(202);

  river(ctx, { points: RIVER, width: 9, color: '#3f8fa0', bank: '#b9a06a', flow: 2.2, glints: 90 });
  ctx.exclude({ kind: 'rect', x: 15, z: 0, hx: 9, hz: 200 });

  tent(b, ctx, { pos: [-12, -2], size: [5, 6], height: 2.8, rot: 0.5, color: '#4a3528', flap: '#6b4a33' });
  tent(b, ctx, { pos: [-20, 6], size: [4.2, 5], height: 2.4, rot: 0.9, color: '#5e4632' });
  tent(b, ctx, { pos: [-18, -14], size: [4.2, 5], height: 2.4, rot: 0.1, color: '#6b5240', flap: '#8c6a48' });
  tent(b, ctx, { pos: [-27, -4], size: [4, 4.6], height: 2.3, rot: 1.2, color: '#4a3528' });

  // Altar of stones with the offering burning on it.
  const ay = ctx.terrainHeight(...ALTAR);
  for (let layer = 0; layer < 4; layer++) {
    const n = 9 - layer * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + layer;
      const r = 1.1 - layer * 0.22;
      b.add(['#a89a86', '#8f8272', '#b8aa94'][(i + layer) % 3], xf(new THREE.IcosahedronGeometry(0.42, 0), { pos: [ALTAR[0] + Math.sin(a) * r, ay + 0.25 + layer * 0.38, ALTAR[1] + Math.cos(a) * r], rot: [rng(), rng() * 3, rng()], scale: [1.2, 0.8, 1] }));
    }
  }
  b.add('#4a3020', xf(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 5), { pos: [ALTAR[0], ay + 1.55, ALTAR[1]], rot: [0, 0.4, Math.PI / 2] }));
  b.add('#4a3020', xf(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 5), { pos: [ALTAR[0], ay + 1.6, ALTAR[1]], rot: [0, -0.9, Math.PI / 2] }));
  flames(ctx, [{ pos: [ALTAR[0], ay + 1.55, ALTAR[1]], h: 1.4, w: 1.4 }, { pos: [ALTAR[0] + 0.25, ay + 1.5, ALTAR[1] + 0.1], h: 0.9 }, { pos: [ALTAR[0] - 0.2, ay + 1.5, ALTAR[1] - 0.15], h: 1 }]);
  glow(ctx, { pos: [ALTAR[0], ay + 2.3, ALTAR[1]], size: 4, color: '#ffc070', opacity: 0.55, pulse: 0.08 });
  ctx.addCollider({ x: ALTAR[0], z: ALTAR[1], hx: 1.2, hz: 1.2, rot: 0, top: ay + 1.6 });
  ctx.exclude({ kind: 'circle', x: ALTAR[0], z: ALTAR[1], r: 2 });

  // Rising smoke from the offering.
  const smoke = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), ctx.kit.toon('#cfc6bc', { emissive: '#3d3640' }), 16);
  smoke.frustumCulled = false;
  ctx.scene.add(smoke);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    for (let i = 0; i < 16; i++) {
      const life = (t * 0.05 + i / 16) % 1;
      const r = (0.5 + life * 2.2) * Math.min(1, life * 6) * (1 - life * 0.5);
      smoke.setMatrixAt(i, m.compose(v.set(ALTAR[0] + life * life * 5 + Math.sin(i * 2.3 + t) * 0.4, ay + 2.4 + life * 14, ALTAR[1] - life * 2 + Math.cos(i * 1.7) * 0.4), q, s.set(r, r * 0.85, r)));
    }
    smoke.instanceMatrix.needsUpdate = true;
  });

  camel(b, ctx, { pos: [-24, 14], rot: 2.2, couched: true, color: '#c49a62', load: '#b5523b' });
  camel(b, ctx, { pos: [-30, 9], rot: 1.4, color: '#b88a58' });
  camel(b, ctx, { pos: [-17, 20], rot: -2.6, couched: true, color: '#cfa46c' });
  for (let i = 0; i < 9; i++) goat(b, ctx, { pos: [-30 + rng() * 10, -18 + rng() * 8], rot: rng() * 6, color: rng() < 0.5 ? '#3a2a20' : '#e6d8b8' });

  // Palms and brush along both banks.
  for (let i = 0; i < 46; i++) {
    const t = rng();
    const z = -150 + t * 300;
    const cx = 14 + Math.sin(z * 0.012) * 6 + (z < 0 ? -z * 0.08 : z * 0.1);
    const side = rng() < 0.5 ? -1 : 1;
    const x = cx + side * (8 + rng() * 10);
    if (Math.hypot(x - LEHI[0], z - LEHI[1]) < 9 || ctx.blocked(x, z, 1)) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 5, lean: 0.1 + rng() * 0.25, dir: rng() * 6, seed: i + 3 });
  }
  for (let i = 0; i < 70; i++) {
    const z = -120 + rng() * 240;
    const x = 14 + (rng() < 0.5 ? -1 : 1) * (6 + rng() * 6) + (z < 0 ? -z * 0.08 : z * 0.1);
    if (ctx.blocked(x, z, 0.5) || Math.hypot(x - LEHI[0], z - LEHI[1]) < 5) continue;
    bush(b, ctx, { pos: [x, z], size: 0.5 + rng() * 0.7, color: ['#7d8a4a', '#6c7a42', '#8e9a58'][i % 3] });
  }
  b.flush();

  // Lehi stretches his hand toward the river and speaks to Laman.
  person(ctx, { pos: LEHI, face: [14, -2], scale: 1.08, colors: { robe: '#e6d8b8', mantle: '#4f7f80', skin: '#a8724a', hair: '#d9d2c4', sash: '#c8912e', arms: [0.55, 1.35] } });
}

export default {
  title: "1 Nephi 2:4-10: Lehi's family leaves for the wilderness",
  subtitle: 'The valley of Lemuel, by the river Laman',
  seed: 202,
  style: { ...DAY_STYLE, fog: { color: '#f0cfa0', near: 140, far: 900 } },
  sky: { zenith: '#3d6e9c', mid: '#8fb2c4', horizon: '#f6cf98', ground: '#d9b07a', glowColor: '#ffe1a0', glowDir: [-0.8, 0.35, 0.3] },
  sun: { dir: [-0.75, 0.55, 0.3], color: '#ffe6c0', intensity: 2.6, hemi: { sky: '#d6e4ee', ground: '#b9784a', intensity: 1.05 }, shadowSize: 60 },
  ground: {
    size: 1400, segments: 260, flatRadius: 110, hillHeight: 70, undulation: 0.3,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: { sand: '#d9b27a', dirt: '#c49462', grass: '#9aa060', grassDark: '#7a8a4a', plaza: '#d9b27a', plazaLine: '#c49462', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c48a5a' },
  },
  mountains: { count: 44, distance: [240, 460], height: [45, 95], widthRatio: [1.2, 2.0], colors: ['#c47a52', '#b06a48', '#d08f62', '#a8603e'] },
  objects: [
    { type: 'stones', count: 400, ring: [6, 120], size: [0.12, 0.5], colors: ['#c49a72', '#a8805e', '#d8b48a'] },
  ],
  custom,
  clouds: { layers: [{ count: 22, distance: [400, 800], height: [100, 200], size: [40, 80], color: '#fff2dc', shade: '#9a7a8a' }] },
  crowd: {
    seed: 12,
    minSpacing: 0.9,
    facing: LEHI,
    colors: PALETTE,
    groups: [
      { center: [2.6, -1.4], radius: [0, 0.3], count: 1 },
      { center: [1.2, -4.8], radius: [0, 0.3], count: 1 },
      { center: [-3.5, -9.5], radius: [0.5, 1.3], count: 2, facing: ALTAR, kneel: 0.5 },
      { center: [-9, 1.6], radius: [0.5, 1.3], count: 2, facing: [-12, -2] },
    ],
  },
  player: {
    start: [-5, 7],
    lookAt: [8, -7],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
