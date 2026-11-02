// 1 Nephi 18:23-25: the ship arrives at the promised land. The family pitches tents, tills the earth and plants seed,
// and finds forests with beasts of every kind and ore of gold, silver and copper. The sea lies north (-z).
import { ocean, blockWater, surf } from './lib/bom-07-sea.js';
import { buildShip } from './lib/bom-07-ship.js';
import { tent, herd, animal, oreOutcrop, field, provisions, campfire } from './lib/bom-07-camp.js';

const SEA = -0.6;
const SHIP = [14, -125];
const BOAT = [-4, -37];

export default {
  title: '1 Nephi 18:23-25: Arrival in the promised land',
  seed: 9,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.55, 0.5, 0.55], color: '#ffe2b0', intensity: 2.9 },
  light: { sky: '#a8c4e0', ground: '#5a6a40', hemi: 1.1 },
  sky: { top: '#5a8cc8', horizon: '#f2dcc0', ground: '#c8d0c8', sunColor: '#fff0c8', glow: 1.0 },
  fog: { color: '#dcdccc', near: 80, far: 560 },
  clouds: { count: 40, shadow: '#a0a8b8', lit: '#fff4e0', rim: '#ffffff', distance: [300, 900], altitude: [110, 220], hole: 0.3 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.15, contrast: 1.05, vignette: 0.32, shadowTint: '#283a50', highlightTint: '#fff0d0' },
  shadow: { center: [0, -5], radius: 60 },

  player: { start: [2, 22], yaw: 0.05, pitch: 0.0, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 44,
    hills: 50,
    bumps: 0.35,
    flats: [
      { x: 0, z: -340, r: 250, falloff: 70, height: -6 },
      { x: 0, z: 0, r: 40, falloff: 40, height: 0.2 },
    ],
    colors: { ground: '#6a8c42', groundAlt: '#557a36', grass: '#4f7432', high: '#5e7444', rock: '#766c5e' },
    patches: [
      { x: 0, z: -340, r: 358, color: '#d8c8a0', strength: 1, rough: 0.08 },
      { x: -18, z: -12, r: 14, color: '#8a7a50', strength: 0.5, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'tree', count: 300, center: [0, 10], ring: [32, 150], spacing: 4.5, seed: 8, avoid: [{ rect: [0, -260, 900, 440] }, { rect: [0, -20, 30, 50] }], props: { kind: 'broad', leaf: '#3f6a2c' } },
    { type: 'tree', count: 140, center: [0, 10], ring: [40, 300], spacing: 6, seed: 18, avoid: [{ rect: [0, -260, 900, 440] }, { rect: [0, -20, 30, 50] }], props: { kind: 'broad', leaf: '#557a30', h: 11 } },
    { type: 'tree', count: 30, center: [0, -30], ring: [20, 120], arc: [Math.PI, Math.PI * 2], spacing: 8, seed: 28, avoid: [{ rect: [0, -260, 900, 420] }, { rect: [0, -20, 50, 40] }], props: { kind: 'palm', leaf: '#5c8a3a' } },
    { type: 'rock', count: 30, center: [0, 30], ring: [40, 260], spacing: 12, seed: 10, avoid: [{ rect: [0, -260, 900, 440] }], props: { color: '#857a6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.5,
      hoodChance: 0.4,
    },
    groups: [
      { count: 10, center: BOAT, ring: [2.5, 9], arc: [0, Math.PI], spacing: 1.3, face: BOAT, children: 0.25, seed: 91 },
      { count: 9, center: [-18, -10], ring: [3, 8], spacing: 1.4, face: [-18, -10], children: 0.4, kneel: 0.2, seed: 92 },
      { count: 7, points: [[13, -15], [16, -12], [19, -16], [22, -11], [12, -9], [24, -14], [17, -7]], face: [18, -30], children: 0.1, kneel: 0.6, seed: 93 },
      { count: 4, points: [[-6, -24], [-5, -16], [-8, -6], [-3, -28]], face: [-20, 10], children: 0.2, seed: 94 },
    ],
  },

  figures: [
    { x: 8, z: 4, face: [12, 2], robe: '#9a6a44', mantle: '#5a3d2b', skin: '#9b6a46', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE, scene, rand, heightAt } = ctx;
    ocean(ctx, { level: SEA, size: 1600, segments: 180, center: [0, -560], color: '#3a90a2', deep: '#1f5a78', crest: '#eef8f4', amp: 0.3, freq: 0.07 });
    blockWater(ctx, { level: SEA, area: [-200, -160, 200, 30] });
    surf(ctx, { level: SEA, area: [-160, -80, 160, 0] });

    const { mesh } = buildShip({ length: 30, beam: 8, depth: 4.6, built: 1, sail: 'furled', rand, hullColor: '#8a5e3a', plankAlt: '#9a6c44' });
    mesh.position.set(SHIP[0], SEA - 1.8, SHIP[1]);
    mesh.rotation.y = 0.5;
    scene.add(mesh);
    const anchor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 30, 3), new THREE.MeshLambertMaterial({ color: '#4a3424' }));
    anchor.position.set(SHIP[0] - 4, -6, SHIP[1] - 18);
    anchor.rotation.x = 0.9;
    scene.add(anchor);
    ctx.onFrame((t) => {
      mesh.position.y = SEA - 1.8 + Math.sin(t * 0.6) * 0.18;
      mesh.rotation.z = Math.sin(t * 0.5) * 0.025;
      mesh.rotation.x = Math.sin(t * 0.4 + 1) * 0.015;
    });

    const { mesh: boat } = buildShip({ mast: false, length: 6, beam: 2, depth: 0.9, built: 1, rand, hullColor: '#8a5e3a', plankAlt: '#9a6c44' });
    boat.position.set(BOAT[0], heightAt(...BOAT) + 0.15, BOAT[1]);
    boat.rotation.set(0.04, 0.3, 0.12);
    scene.add(boat);
    ctx.colliders.add({ x: BOAT[0], z: BOAT[1], w: 2, d: 6, rot: 0.3, bottom: heightAt(...BOAT), top: heightAt(...BOAT) + 1.2 });
    for (const s of [-1, 1]) ctx.solid.box(0.1, 0.1, 3.4, { position: [BOAT[0] + s * 1.6, heightAt(...BOAT) + 0.2, BOAT[1] + 1], rotation: [0, 0.3 + s * 0.4, 0], color: '#6a4a30' });

    provisions(ctx, { x: -6, z: -28, count: 10, radius: 3 });
    provisions(ctx, { x: -14, z: -18, count: 6, radius: 2 });
    for (const [x, z, r] of [[-24, -14, 1.2], [-22, -2, 2.6], [-12, -4, -2.6]]) tent(ctx, { x, z, rot: r, color: rand.pick(['#5b4a3c', '#6b5a48']) });
    campfire(ctx, { x: -18, z: -10, light: 6 });
    field(ctx, { x: 18, z: -12, w: 18, d: 10, rot: 0.1, rows: 9 });

    herd(ctx, { center: [-20, 16], radius: 7, count: 5, kinds: ['cow', 'ox'] });
    herd(ctx, { center: [24, 14], radius: 6, count: 6, kinds: ['goat', 'goat', 'sheep'] });
    animal(ctx, { x: -6, z: 8, rot: 2.2, kind: 'horse', grazing: true });
    animal(ctx, { x: -9, z: 10, rot: 1.6, kind: 'horse', grazing: false, color: '#3a2a20' });
    animal(ctx, { x: 30, z: -2, rot: -0.6, kind: 'ass' });
    animal(ctx, { x: 32, z: 0.5, rot: -1.2, kind: 'ass', grazing: true });
    herd(ctx, { center: [-36, 34], radius: 6, count: 4, kind: 'goat', scale: 1.15 });
    herd(ctx, { center: [40, 30], radius: 8, count: 4, kinds: ['cow', 'horse'] });

    oreOutcrop(ctx, { x: 12, z: 6, size: 2.6 });
    oreOutcrop(ctx, { x: 36, z: 20, size: 3.2 });
    oreOutcrop(ctx, { x: -30, z: 4, size: 2.2 });
    for (let i = 0; i < 80; i++) {
      const x = rand.range(-60, 60), z = rand.range(-30, 60);
      if (Math.abs(x) < 26 && z < 30 && z > -32 || heightAt(x, z) < SEA + 0.4) continue;
      const s = rand.range(0.3, 0.7);
      ctx.solid.add(new THREE.IcosahedronGeometry(s, 0), { position: [x, heightAt(x, z) + s * 0.3, z], scale: [1.3, 0.7, 1.1], rotation: [0, rand() * 3, 0], color: rand.pick(['#3f6a2c', '#4f7a34', '#5a8a3a']), jitter: 0.1 });
    }
    for (let i = 0; i < 60; i++) {
      const x = rand.range(-28, 30), z = rand.range(-28, 24);
      const col = rand.pick(['#e8d24a', '#d86a8a', '#f0f0e0', '#c08ad0']);
      ctx.solid.add(new THREE.IcosahedronGeometry(0.06, 0), { position: [x, heightAt(x, z) + 0.1, z], color: col });
    }
  },
};
