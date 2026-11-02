// Acts 2:1-13. Morning in Jerusalem: cloven tongues of fire rest on the apostles in the open upper room,
// a rushing wind swirls about the house, and Jews from every nation gather below, each hearing his own tongue.
import { house, town, tongues, person, frame } from './lib/nt-25-kit.js';

const HOUSE = [0, -14];
const wall = '#d4c09a';

const apostles = Array.from({ length: 11 }, (_, i) => [HOUSE[0] - 5.6 + i * 1.12, HOUSE[1] + 1.2 + (i % 2) * 0.7]);
const PETER = [HOUSE[0] + 0.5, HOUSE[1] + 6.2];

function upperRoomHouse(ctx) {
  const [x, z] = HOUSE;
  const at = frame(x, z, 0);
  const y0 = ctx.heightAt(x, z) - 0.3;
  const W = 14, D = 8, H1 = 4.6, H2 = 3.4;
  const box = (lx, lz, w, h, d, y, color = wall, collide = true, batch = ctx.solid) => {
    const [px, pz] = at(lx, lz);
    batch.box(w, h, d, { position: [px, y + h / 2, pz], color, jitter: 0.05 });
    if (collide) ctx.colliders.add({ x: px, z: pz, w, d, bottom: y, top: y + h });
  };
  box(0, 0, W, H1, D, y0);
  box(0, D / 2 + 0.02, 1.4, 2.3, 0.1, y0 + 0.3, '#3a2a20', false);
  for (const lx of [-4.5, 4.5]) box(lx, D / 2 + 0.02, 0.8, 0.8, 0.1, y0 + 2.6, '#2e241c', false);
  box(0, 0, W + 0.4, 0.3, D + 0.4, y0 + H1, '#a8946e');
  const fy = y0 + H1 + 0.3;
  box(0, -D / 2 + 0.3, W, H2, 0.6, fy);
  box(-W / 2 + 0.3, 0, 0.6, H2, D, fy);
  box(W / 2 - 0.3, 0, 0.6, H2, D, fy);
  for (let i = 0; i < 6; i++) {
    const lx = -W / 2 + 0.8 + (i * (W - 1.6)) / 5;
    const [px, pz] = at(lx, D / 2 - 0.3);
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.22, 0.25, H2, 7), { position: [px, fy + H2 / 2, pz], color: '#e2d2b0' });
  }
  box(0, D / 2 - 0.3, W + 0.2, 0.5, 0.7, fy + H2 - 0.5, '#bba680', false);
  box(0, 0, W + 0.8, 0.35, D + 0.8, fy + H2, '#a8946e', false);
  box(0, 0, W, 0.4, D, fy + H2 + 0.35, wall, false);
  box(0, D / 2 - 0.05, W - 1, 0.9, 0.15, fy, '#c8b48c', false);
  for (let i = 0; i < 9; i++) box(W / 2 + 1.1, D / 2 + 0.4 - i * 0.62, 1.8, 0.55 * (i + 1), 0.62, y0, '#c2ae88');
  box(W / 2 + 1.1, -D / 2 + 1.2, 1.8, H1 + 0.3, 2.2, y0, '#c2ae88');
  box(0, D / 2 + 1.6, 6, 1.6, 3.2, y0, '#bfa984');
  for (let i = 0; i < 4; i++) box(0, D / 2 + 3.4 + i * 0.4, 3.2, 1.25 - i * 0.32, 0.4, y0, '#c8b48e');
  return fy;
}

// Translucent swirling arcs that suggest the rushing mighty wind.
function wind(ctx, center, y) {
  const { THREE } = ctx;
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: '#fff4dc', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const r = 6 + (i % 3) * 2.5;
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06 + (i % 2) * 0.05, 3, 40, Math.PI * (0.5 + (i % 4) * 0.2)), mat);
    m.rotation.x = Math.PI / 2 + (i % 3 - 1) * 0.18;
    m.rotation.z = i * 1.3;
    m.position.y = (i % 4) * 1.6;
    group.add(m);
  }
  group.position.set(center[0], y, center[1]);
  ctx.scene.add(group);
  ctx.onFrame((t) => {
    group.children.forEach((m, i) => (m.rotation.z = i * 1.3 + t * (0.6 + (i % 3) * 0.25)));
  });
}

export default {
  title: 'Acts 2:1-13: The day of Pentecost',
  seed: 28,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.75, 0.5, 0.45], color: '#ffe6c0', intensity: 2.8 },
  light: { sky: '#a4b8e0', ground: '#7a6450', hemi: 1.15 },
  sky: { top: '#4a74b8', horizon: '#f2dcc0', ground: '#c4ae90', sunColor: '#fff0d0', glow: 0.9 },
  fog: { color: '#e0cdb4', near: 80, far: 520 },
  clouds: { count: 40, shadow: '#a69aa8', lit: '#fff4e0', rim: '#ffffff', distance: [260, 900], altitude: [100, 240], hole: 0.2 },
  mountains: { count: 40, color: '#8a7e70', radius: [480, 720], height: [40, 100], haze: 0.6 },
  bloom: { strength: 0.65, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.38, shadowTint: '#30305e', highlightTint: '#ffe8c8' },
  shadow: { center: [0, -6], radius: 40 },

  player: { start: [2, 11], yaw: 0.0, pitch: 0.16, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 28,
    hills: 24,
    bumps: 0.15,
    flats: [{ x: 0, z: 0, r: 70, falloff: 50, height: 0 }],
    colors: { ground: '#c2ad88', groundAlt: '#b39e7a', grass: '#8a8a58', high: '#a0927a', rock: '#8a7c68' },
    patches: [{ x: 0, z: 4, r: 26, color: '#d0bc98', strength: 0.7, rough: 0.2 }],
  },

  objects: [
    { type: 'pavement', x: 0, z: 6, w: 40, d: 30, tile: 2.2, color: '#d8c6a2', damage: 0 },
  ],

  scatter: [
    { type: 'tree', count: 8, center: [0, 4], ring: [21, 30], spacing: 8, seed: 51, props: { kind: 'broad', leaf: '#728050', h: 5 } },
    { type: 'tree', count: 6, center: [0, 4], ring: [20, 32], spacing: 9, seed: 52, props: { kind: 'palm', leaf: '#6a7c40' } },
  ],

  crowd: {
    palette: {
      robes: ['#b8442e', '#3f6a9a', '#d8b04a', '#6a8a4a', '#8a4a8a', '#e8dcc0', '#2e6a6a', '#c27a3a', '#7a4e36', '#a0825c', '#4a4a7a', '#c25a6a', '#f0e8d4'],
      mantles: ['#2e3e6a', '#8a2e2e', '#d8c070', '#4a6a3a', '#6a3a6a', '#f0ead8', '#1e4a4a', '#c08a3a'],
      skins: ['#5a3a26', '#7a4c31', '#8a5a3c', '#a87652', '#c49a78', '#d8b08e', '#3e281c', '#b5835e'],
      mantleChance: 0.75,
      hoodChance: 0.35,
    },
    groups: [
      { count: 230, center: [0, -6], ring: [9.5, 30], arc: [0.15, Math.PI - 0.15], spacing: 0.95, face: [0, -12], children: 0.12, seed: 61, avoid: [{ rect: [2, 13, 5, 8] }, { rect: [0, -6, 8, 8] }, { rect: [8.1, -12, 3, 12] }] },
      { count: 24, center: [-16, -6], ring: [1, 8], spacing: 1.1, face: [0, -12], children: 0.1, seed: 62 },
    ],
  },

  figures: [
    { x: PETER[0], z: PETER[1], face: [0, 30], scale: 1.0, robe: '#6e5a44', mantle: '#3f4d5e', skin: '#8a5a3c', arms: 'out' },
  ],

  effects: [
    { type: 'beam', at: [HOUSE[0], HOUSE[1] + 1], height: 260, radiusBottom: 7, radiusTop: 22, color: '#fff3d6', opacity: 0.35 },
  ],

  custom(ctx) {
    const fy = upperRoomHouse(ctx);
    const pts = [];
    apostles.forEach(([x, z], i) => {
      person(ctx, { x, z, y: fy, face: [x * 0.6, 30], robe: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#94704e'][i % 6], mantle: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#a34f32'][i % 4], skin: ['#8a5a3c', '#9b6a46', '#a87652'][i % 3], arms: i % 3 === 0 ? 'out' : 'down' });
      pts.push([x, fy + 1.78, z]);
    });
    pts.push([PETER[0], ctx.heightAt(...HOUSE) + 1.3 + 1.8, PETER[1]]);
    tongues(ctx, pts);
    const pl = new ctx.THREE.PointLight('#ffb060', 18, 14, 1.4);
    pl.position.set(HOUSE[0], fy + 2.6, HOUSE[1] + 3);
    ctx.scene.add(pl);
    wind(ctx, [HOUSE[0], HOUSE[1] + 1], fy + 2);

    town(ctx, { center: [0, -6], radius: 75, count: 46, seed: 28, spacing: 9, size: [6, 10], height: [4, 7.5], avoid: [{ x: 0, z: 4, r: 32 }, { x: 0, z: -14, r: 14 }], face: [0, 0] });
    house(ctx, { x: -16, z: -16, rot: 0.3, w: 8, d: 7, h: 6 });
    house(ctx, { x: 18, z: -18, rot: -0.3, w: 8, d: 8, h: 5.5 });
  },
};
