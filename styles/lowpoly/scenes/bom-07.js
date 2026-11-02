// 1 Nephi 17-18:4: in the land Bountiful, by the sea, Nephi builds a ship "after the manner which the Lord had shown".
// The sea lies to the north (-z). The half-built ship stands on stocks above the beach.
import { ocean, blockWater, surf } from './lib/bom-07-sea.js';
import { buildShip } from './lib/bom-07-ship.js';
import { frame, tent, fruitTree, palm, skep, forge, campfire, stack, provisions } from './lib/bom-07-camp.js';

const SHIP = [0, -22];
const SHIP_ROT = Math.PI / 2;
const CAMP = [-24, -2];
const SEA = -0.6;

export default {
  title: '1 Nephi 17-18:4: Nephi builds the ship in Bountiful',
  seed: 7,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [-0.55, 0.62, 0.25], color: '#fff0d0', intensity: 2.8 },
  light: { sky: '#a8c8e8', ground: '#6a7a48', hemi: 1.15 },
  sky: { top: '#4f86c6', horizon: '#d6e6ea', ground: '#c8d8d8', sunColor: '#fff4d8', glow: 0.8 },
  fog: { color: '#d2e2e6', near: 90, far: 620 },
  clouds: { count: 30, shadow: '#a8b8c8', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [120, 220], hole: 0.2 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.32, shadowTint: '#2a3a50', highlightTint: '#fff2d8' },
  shadow: { center: [10, -5], radius: 60 },

  player: { start: [4, 10], yaw: 0.22, pitch: 0.02, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 31,
    hills: 46,
    bumps: 0.3,
    flats: [
      { x: 0, z: -340, r: 250, falloff: 70, height: -6 },
      { x: 0, z: 0, r: 45, falloff: 40, height: 0.2 },
    ],
    colors: { ground: '#7a9446', groundAlt: '#5a7c3a', grass: '#567c38', high: '#6c7c4c', rock: '#7c7262' },
    patches: [
      { x: 0, z: -340, r: 362, color: '#dcc896', strength: 1, rough: 0.08 },
      { x: SHIP[0], z: SHIP[1] + 4, r: 26, color: '#bfa878', strength: 0.7, rough: 0.4 },
      { x: CAMP[0], z: CAMP[1], r: 18, color: '#8a7a50', strength: 0.5, rough: 0.5 },
    ],
  },

  objects: [
    { type: 'rock', x: -60, z: -30, size: 3 },
    { type: 'rock', x: -68, z: -24, size: 2 },
    { type: 'rock', x: 70, z: -36, size: 2.6 },
  ],

  scatter: [
    { type: 'tree', count: 90, center: [0, 60], ring: [70, 300], arc: [-0.2, Math.PI + 0.2], spacing: 7, seed: 8, props: { kind: 'broad', leaf: '#4f7a34' } },
    { type: 'tree', count: 40, center: [0, 0], ring: [60, 140], arc: [-0.2, Math.PI + 0.2], spacing: 7, seed: 9, props: { kind: 'palm', leaf: '#5c8a3a' } },
    { type: 'rock', count: 25, center: [0, 80], ring: [80, 300], spacing: 12, seed: 10, props: { color: '#857a6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.5,
      hoodChance: 0.45,
    },
    groups: [
      { count: 16, center: CAMP, ring: [5, 11], arc: [0, Math.PI * 2], spacing: 1.4, face: [CAMP[0], CAMP[1]], children: 0.35, kneel: 0.3, seed: 41, avoid: [{ r: 2, x: CAMP[0], z: CAMP[1] }] },
      { count: 5, points: [[-8, -15.5], [9, -15], [-12.5, -13], [11, -6], [12.6, -7.2]], face: SHIP, children: 0, seed: 42 },
      { count: 6, center: [-36, 8], ring: [1, 5], spacing: 1.2, face: [-30, 2], children: 0.5, seed: 43 },
    ],
  },

  figures: [
    { x: 2.5, z: -15.6, face: [2.5, -20], robe: '#9a6a44', mantle: '#5a3d2b', skin: '#9b6a46', arms: 'out' },
    { x: -9, z: -4, face: [0, -18], robe: '#6e3a2a', mantle: '#3f2a20', skin: '#8a5a3c', arms: 'down', hood: true },
    { x: -10.6, z: -2.8, face: [0, -18], robe: '#4f4a5b', mantle: '#2f2a3a', skin: '#9b6a46', arms: 'out' },
  ],

  effects: [],

  custom(ctx) {
    const { THREE, scene, heightAt, rand } = ctx;
    ocean(ctx, { level: SEA, size: 1600, segments: 180, center: [0, -560], color: '#3a8fa0', deep: '#1f5a78', crest: '#e6f4f2', amp: 0.35, freq: 0.07 });
    blockWater(ctx, { level: SEA, area: [-200, -160, 200, 30] });
    surf(ctx, { level: SEA, area: [-160, -80, 160, 0] });

    const at = frame(SHIP[0], SHIP[1], SHIP_ROT);
    const ground = heightAt(SHIP[0], SHIP[1]);
    const lift = 0.9;
    const L = 30;
    const { mesh, shape } = buildShip({ length: L, beam: 8, depth: 4.6, built: 0.5, rand, hullColor: '#9c6c42', plankAlt: '#b0804e' });
    mesh.position.set(SHIP[0], ground + lift, SHIP[1]);
    mesh.rotation.y = SHIP_ROT;
    scene.add(mesh);
    for (let i = -5; i <= 5; i++) {
      const lz = i * 2.6;
      const ky = shape.keelY((2 * lz) / L) + lift;
      const [x, z] = at(0, lz);
      ctx.solid.box(2.2, ky + 0.2, 0.9, { position: [x, heightAt(x, z) + (ky + 0.2) / 2 - 0.2, z], rotation: [0, SHIP_ROT, 0], color: '#5a4332' });
    }
    ctx.colliders.add({ x: SHIP[0], z: SHIP[1], w: 7.8, d: 29, rot: SHIP_ROT, bottom: ground, top: ground + 7 });
    for (const side of [-1, 1]) {
      for (let i = -4; i <= 4; i++) {
        const lz = i * 3.2;
        const hw = shape.half((2 * lz) / L, 1);
        const [x, z] = at(side * (hw + 1.2), lz);
        const [bx, bz] = at(side * (hw + 2.1), lz);
        const y = heightAt(x, z);
        ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.12, 6.5, 4), { position: [x, y + 3.2, z], color: '#8a6a44' });
        ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 4), { position: [(x + bx) / 2, y + 1.4, (z + bz) / 2], rotation: [side * 0.5, 0, 0], color: '#8a6a44' });
        ctx.colliders.add({ x, z, w: 0.3, d: 0.3, bottom: y, top: y + 6.5 });
      }
      const [px, pz] = at(side * 4.6, 0), [rx, rz] = at(side * 5.3, 0);
      ctx.solid.box(0.8, 0.1, 26, { position: [px, ground + 3.4, pz], rotation: [0, SHIP_ROT, 0], color: '#a07c50' });
      ctx.solid.box(0.15, 0.15, 26, { position: [rx, ground + 5.8, rz], rotation: [0, SHIP_ROT, 0], color: '#8a6a44' });
    }

    stack(ctx, { x: 16, z: -16, rot: 1.4, n: 9, len: 7 });
    stack(ctx, { x: -16, z: -12, rot: 1.2, n: 6, len: 6, color: '#7a5434' });
    for (let i = 0; i < 4; i++) {
      const x = 22 + i * 0.4, z = -24 + i * 2.8, y = heightAt(x, z);
      ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.4, 8, 6), { position: [x, y + 0.35, z], rotation: [Math.PI / 2, Math.PI / 2 + 0.1 * i, 0], color: '#6a4a30' });
    }
    const bench = [11.5, -4.5];
    ctx.solid.box(3, 0.9, 1, { position: [bench[0], heightAt(...bench) + 0.45, bench[1]], rotation: [0, 0.3, 0], color: '#7a5a3a' });
    ctx.colliders.add({ x: bench[0], z: bench[1], w: 3, d: 1, rot: 0.3, bottom: 0, top: heightAt(...bench) + 0.9 });
    forge(ctx, { x: 17, z: -4, rot: -0.8 });
    provisions(ctx, { x: 14, z: 2, count: 6 });

    for (const [x, z, r] of [[-30, -10, 0.9], [-36, 0, 1.4], [-32, 10, 2.2], [-20, 12, 2.9], [-42, 12, 1.8]]) tent(ctx, { x, z, rot: r, color: rand.pick(['#5b4a3c', '#4a3a30', '#6b5a48']) });
    campfire(ctx, { x: CAMP[0], z: CAMP[1] });
    provisions(ctx, { x: -28, z: 6, count: 8, radius: 2 });

    for (const [x, z] of [[-48, 24], [-30, 30], [-14, 34], [24, 18], [34, 30], [44, 10], [-56, 4], [16, 40], [-40, 40], [52, 26]]) fruitTree(ctx, { x, z, fruit: rand.pick(['#e08a2a', '#d84a2a', '#e8c040']) });
    for (const [x, z] of [[-34, -26], [30, -24], [-48, -14], [44, -12], [-22, -32], [58, -20], [36, -2]]) palm(ctx, { x, z });
    for (const [x, z] of [[-12, 18], [-14.5, 20], [-10, 21]]) skep(ctx, { x, z });

    const mount = new THREE.ConeGeometry(130, 120, 10, 5);
    const mp = mount.attributes.position;
    for (let v = 0; v < mp.count; v++) {
      const y = mp.getY(v);
      if (y < 59) mp.setXYZ(v, mp.getX(v) * rand.range(0.85, 1.15), y + rand.range(-6, 6), mp.getZ(v) * rand.range(0.85, 1.15));
    }
    ctx.solid.add(mount, { position: [-230, 45, -170], color: '#5f7a42', jitter: 0.08, shade: (c, ny, y) => {
      if (y > 70) c.lerp(new THREE.Color('#8a8070'), Math.min(1, (y - 70) / 30));
    } });

    const avoid = (x, z) => Math.abs(z - SHIP[1]) < 12 && Math.abs(x) < 26 || Math.hypot(x - CAMP[0], z - CAMP[1]) < 22 || Math.hypot(x - 4, z - 10) < 4;
    for (let i = 0; i < 120; i++) {
      const x = rand.range(-90, 90), z = rand.range(-30, 90);
      if (avoid(x, z) || heightAt(x, z) < SEA + 0.4) continue;
      const s = rand.range(0.3, 0.75);
      ctx.solid.add(new THREE.IcosahedronGeometry(s, 0), { position: [x, heightAt(x, z) + s * 0.3, z], scale: [1.3, 0.7, 1.1], rotation: [0, rand() * 3, 0], color: rand.pick(['#4f7a34', '#5a8a3a', '#466e30']), jitter: 0.1 });
    }
  },
};
