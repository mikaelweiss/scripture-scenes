// 1 Kings 18:30-39: on the summit of Carmel at the evening sacrifice, fire falls on Elijah's soaked altar
// of twelve stones while Baal's altar stands cold. The sea lies far below to the west. -z is north.
import { figure, fire, water, glowMaterial } from './lib/ot-31-kit.js';

const ALTAR = [0, -8];
const BAAL = [-22, -22];
const ELIJAH = [-3.6, -3.4];

const israel = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
  mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246', '#6d3b2e'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
  mantleChance: 0.6,
  hoodChance: 0.35,
};

const baalPriests = {
  robes: ['#7a2a3a', '#8e3b2c', '#5e2a4e', '#9a5a2a', '#6a2030'],
  mantles: ['#3a1a2a', '#b08a3a', '#4a2240', '#2e1e1a'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652'],
  mantleChance: 0.8,
  hoodChance: 0.15,
};

function altarOfTwelve(ctx) {
  const { THREE, solid, rand: r } = ctx;
  const [ax, az] = ALTAR;
  const y0 = ctx.heightAt(ax, az);
  for (let layer = 0; layer < 3; layer++) {
    const n = layer === 2 ? 4 : 4;
    for (let i = 0; i < n; i++) {
      const lx = (i % 2 ? 0.62 : -0.62) + r.range(-0.08, 0.08), lz = (i < 2 ? 0.62 : -0.62) + r.range(-0.08, 0.08);
      solid.add(new THREE.DodecahedronGeometry(0.72, 0), {
        position: [ax + lx, y0 + 0.36 + layer * 0.58, az + lz],
        rotation: [r() * 3, r() * 3, r() * 3],
        scale: [1, 0.62, 1],
        color: '#9c8f7e',
        jitter: 0.1,
      });
    }
  }
  ctx.colliders.add({ x: ax, z: az, w: 2.8, d: 2.8, bottom: y0, top: y0 + 1.9 });
  for (let i = 0; i < 7; i++) {
    solid.box(0.18, 0.18, 2.4, { position: [ax + r.range(-0.6, 0.6), y0 + 1.95 + (i % 2) * 0.16, az + r.range(-0.4, 0.4)], rotation: [0, (i % 2) * Math.PI / 2 + r.range(-0.3, 0.3), 0], color: '#2c2018' });
  }
  const trench = new THREE.RingGeometry(2.3, 3.2, 14, 1).rotateX(-Math.PI / 2);
  solid.add(trench, { position: [ax, y0 + 0.04, az], color: '#2a2420', jitter: 0.1 });
  water(ctx, { x: ax, z: az, y: y0 + 0.08, geometry: new THREE.RingGeometry(2.4, 3.1, 28, 2).rotateX(-Math.PI / 2), color: '#ffcf8a', opacity: 0.75, amp: 0.02 });
  for (let i = 0; i < 4; i++) {
    const a = 2.2 + i * 0.35, d = 4.4;
    const jx = ax + Math.cos(a) * d, jz = az + Math.sin(a) * d;
    const tipped = i === 3;
    solid.add(new THREE.CylinderGeometry(0.22, 0.3, 0.7, 7), {
      position: [jx, ctx.heightAt(jx, jz) + (tipped ? 0.25 : 0.35), jz],
      rotation: tipped ? [Math.PI / 2, a, 0] : [0, 0, 0],
      color: '#a8643a',
    });
  }
}

function baalAltar(ctx) {
  const { THREE, solid } = ctx;
  const [bx, bz] = BAAL;
  const y0 = ctx.heightAt(bx, bz);
  solid.box(4.2, 1.1, 3.2, { position: [bx, y0 + 0.55, bz], color: '#8a7766' });
  solid.box(3.6, 0.5, 2.6, { position: [bx, y0 + 1.35, bz], color: '#9a8674' });
  ctx.colliders.add({ x: bx, z: bz, w: 4.2, d: 3.2, bottom: y0, top: y0 + 1.6 });
  for (let i = 0; i < 6; i++) solid.box(0.2, 0.2, 2.6, { position: [bx - 1.2 + i * 0.48, y0 + 1.7, bz], rotation: [0, 0.1 * (i % 2 ? 1 : -1), 0], color: '#5a4030' });
  solid.box(1.8, 0.7, 0.8, { position: [bx, y0 + 2.15, bz], color: '#6a3a2a' });
  solid.add(new THREE.CylinderGeometry(0.35, 0.5, 6, 6), { position: [bx - 4, y0 + 3, bz - 3], color: '#6a5a48' });
  solid.add(new THREE.ConeGeometry(0.6, 1.2, 6), { position: [bx - 4, y0 + 6.5, bz - 3], color: '#b08a3a' });
  ctx.colliders.add({ x: bx - 4, z: bz - 3, w: 1, d: 1, bottom: y0, top: y0 + 7 });
}

export default {
  title: '1 Kings 18:30-39: Elijah on Mount Carmel',
  seed: 31,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [-0.9, 0.22, 0.25], color: '#ffb070', intensity: 2.2 },
  light: { sky: '#6a78a8', ground: '#4a3428', hemi: 0.75 },
  sky: { top: '#1f2644', horizon: '#c47a52', ground: '#9a6e56', sunColor: '#ffcf90', glow: 1.2 },
  fog: { color: '#8e6656', near: 70, far: 520 },
  clouds: { count: 80, shadow: '#24222e', lit: '#c88060', rim: '#ffe0b0', distance: [200, 900], altitude: [90, 260], hole: 0.25, seed: 31 },
  mountains: { count: 36, color: '#5a5a52', radius: [560, 780], height: [30, 90], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.1, contrast: 1.08, vignette: 0.45, shadowTint: '#2a2450', highlightTint: '#ffd6a0' },
  shadow: { center: [-6, -8], radius: 60 },

  player: { start: [4.8, 0.8], yaw: 0.74, pitch: 0.06, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 31,
    hills: 70,
    bumps: 0.45,
    flats: [
      { x: -420, z: 40, r: 260, falloff: 200, height: -90 },
      { x: -6, z: -10, r: 46, falloff: 60, height: 0 },
    ],
    colors: { ground: '#8d7a5c', groundAlt: '#7d6c50', grass: '#6c7440', high: '#7f7a5a', rock: '#6f665a' },
    patches: [
      { x: ALTAR[0], z: ALTAR[1], r: 6, color: '#3a2e26', strength: 0.6, rough: 0.4 },
      { x: BAAL[0], z: BAAL[1], r: 9, color: '#6e5e4a', strength: 0.6, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'rubble', x: BAAL[0], z: BAAL[1], radius: 7, count: 14, size: [0.2, 0.5], color: '#8a7a68' },
    { type: 'rock', x: 26, z: -30, size: 4 },
    { type: 'rock', x: -40, z: 6, size: 3.2 },
    { type: 'rock', x: 34, z: 8, size: 2.6 },
  ],

  scatter: [
    { type: 'rock', count: 50, center: ALTAR, ring: [48, 260], spacing: 8, seed: 3, props: { color: '#857a6a' } },
    { type: 'tree', count: 90, center: ALTAR, ring: [55, 300], spacing: 7, seed: 4, props: { kind: 'broad', leaf: '#56703a' } },
    { type: 'rubble', count: 30, center: ALTAR, ring: [8, 50], seed: 5, props: { color: '#8f8270', count: 4, radius: 2, size: [0.12, 0.3] } },
  ],

  crowd: {
    palette: israel,
    groups: [
      {
        count: 950, center: ALTAR, ring: [11, 40], arc: [-0.15, Math.PI + 0.25], spacing: 0.85, face: ALTAR, children: 0.15, kneel: 0.45, seed: 31,
        avoid: [{ rect: [1.5, 12, 5, 34] }, { r: 14, x: BAAL[0], z: BAAL[1] }],
      },
      {
        count: 300, center: BAAL, ring: [3.2, 13], arc: [-Math.PI, Math.PI], spacing: 0.9, face: ALTAR, children: 0, kneel: 0.2, seed: 32,
        palette: baalPriests,
        avoid: [{ rect: [BAAL[0], BAAL[1], 5.5, 4.5] }, { rect: [BAAL[0] - 4, BAAL[1] - 3, 2, 2] }],
      },
    ],
  },

  effects: [
    { type: 'beam', at: ALTAR, height: 320, radiusBottom: 1.8, radiusTop: 12, color: '#ff8a2a', opacity: 0.6 },
    { type: 'beam', at: ALTAR, height: 320, radiusBottom: 0.9, radiusTop: 5, color: '#ffd27a', opacity: 0.6 },
    { type: 'motes', at: ALTAR, radius: 4, height: 60, count: 260, color: '#ffb050', size: 0.12 },
    { type: 'ring', at: ALTAR, lift: 0.1, radius: 3.4, width: 1.4, color: '#ff9a40', opacity: 0.7 },
    { type: 'smoke', at: ALTAR, lift: 2, count: 10, height: 40, size: 1.4, color: '#8a7a72', wind: [0.6, 0.2] },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    altarOfTwelve(ctx);
    baalAltar(ctx);
    const top = ctx.heightAt(ALTAR[0], ALTAR[1]) + 2;
    fire(ctx, { x: ALTAR[0], z: ALTAR[1], y: top - 0.2, radius: 1.5, height: 4.2, count: 22, seed: 31, lightIntensity: 140, lightDistance: 50 });
    fire(ctx, { x: ALTAR[0], z: ALTAR[1], y: ctx.heightAt(...ALTAR), radius: 3, height: 1.6, count: 18, seed: 32, light: false });
    figure(ctx, { x: ELIJAH[0], z: ELIJAH[1], face: [ALTAR[0], ALTAR[1] - 30], robe: '#6b4f33', mantle: '#3b2c20', skin: '#9b6a46', arms: 'up', scale: 1.1 });
    figure(ctx, { x: 6, z: 2, face: ALTAR, robe: '#6a2a5a', mantle: '#c9a640', skin: '#a87652', arms: 'face', kneel: true });

    const shard = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.5, 0), glowMaterial('#ffb040', 1.8), 60);
    const seeds = Array.from({ length: 60 }, () => [ctx.rand() * Math.PI * 2, ctx.rand() * 5, ctx.rand(), ctx.rand.range(0.25, 0.5)]);
    const m = new THREE.Matrix4();
    shard.frustumCulled = false;
    ctx.scene.add(shard);
    ctx.onFrame((t) => {
      seeds.forEach(([a, r, off, k], i) => {
        const f = (off + t * k) % 1;
        const rad = r * (1 - f) + 0.6;
        m.makeTranslation(ALTAR[0] + Math.cos(a + t) * rad, top + (1 - f) * 70, ALTAR[1] + Math.sin(a + t) * rad);
        shard.setMatrixAt(i, m);
      });
      shard.instanceMatrix.needsUpdate = true;
    });

    water(ctx, { x: -560, z: 0, y: -84, w: 700, d: 1400, color: '#5b6f88', opacity: 1, amp: 0.4, cell: 20 });
  },
};
