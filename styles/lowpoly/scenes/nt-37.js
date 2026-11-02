// Acts 27:39-28:6. A cold, rainy morning on Malta. The ship has run aground where two seas meet and
// the waves break up its stern. On the beach the islanders have kindled a fire for the 276 survivors,
// and a viper fastens on Paul's hand as he lays sticks on it. -z is the sea.
import { water, fire, figure, rain, serpent, Batch } from './lib/nt-32-kit.js';

const FIRE = [0, 6];
const PAUL = [1.3, 3.7];
const SEA = -0.5;

function hull(len, beam, depth, z0, z1, rand) {
  const THREE_ = hull.THREE;
  const geo = new THREE_.BoxGeometry(beam, depth, z1 - z0, 2, 2, 8).translate(0, 0, (z0 + z1) / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
    const t = Math.abs(pz) / (len / 2);
    px *= Math.max(0.04, 1 - Math.pow(t, 2.2)) * (py < 0 ? 0.55 : 1);
    py += t * t * depth * (py > 0 ? 0.55 : 0.3);
    if (Math.abs(pz - z0) < 0.01 && z0 > -len / 2 + 0.1) pz += rand.range(-0.8, 0.8);
    if (Math.abs(pz - z1) < 0.01 && z1 < len / 2 - 0.1) pz += rand.range(-0.8, 0.8);
    p.setXYZ(i, px, py, pz);
  }
  return geo;
}

function wreckPiece(ctx, { half, x, y, z, rot, tilt, color = '#5a4232' }) {
  const { THREE } = ctx;
  hull.THREE = THREE;
  const L = 30, B = 7.5, D = 4.2;
  const b = new Batch(ctx.rand);
  const [z0, z1] = half === 'bow' ? [-1, L / 2] : [-L / 2, -2];
  b.add(hull(L, B, D, z0, z1, ctx.rand), { color, jitter: 0.06 });
  b.box(B * 0.8, 0.12, (z1 - z0) * 0.8, { position: [0, D / 2 + 0.05, (z0 + z1) / 2 - (half === 'bow' ? 1 : -1)], color: '#7a5a40', jitter: 0.06 });
  for (let k = 0; k < 6; k++) {
    const zz = half === 'bow' ? z0 + 0.2 : z1 - 0.2;
    b.box(0.22, D * ctx.rand.range(0.6, 1.3), 0.22, { position: [ctx.rand.range(-B / 2.4, B / 2.4), ctx.rand.range(0, D * 0.4), zz + ctx.rand.range(-0.5, 0.5)], rotation: [ctx.rand.range(-0.5, 0.5), 0, ctx.rand.range(-0.4, 0.4)], color: '#4a3424' });
  }
  if (half === 'bow') {
    b.add(new THREE.CylinderGeometry(0.22, 0.3, 12, 6), { position: [0, D / 2 + 6, 3], rotation: [0.25, 0, 0.15], color: '#4a3828' });
    b.add(new THREE.CylinderGeometry(0.14, 0.14, 10, 5), { position: [1.5, D / 2 + 10, 4], rotation: [0.2, 0, 1.2], color: '#4a3828' });
    const sail = new THREE.BoxGeometry(8, 4.5, 0.1, 4, 3, 1);
    const sp = sail.attributes.position;
    for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.sin(sp.getX(i) * 0.6) * 0.6 + ctx.rand.range(-0.3, 0.3));
    b.add(sail, { position: [1.2, D / 2 + 7.5, 4.3], rotation: [0.25, 0.3, 1.1], color: '#c8b896', jitter: 0.06 });
    b.add(new THREE.CylinderGeometry(0.16, 0.16, 6, 5), { position: [0, D / 2 + 1.4, L / 2 + 1.8], rotation: [1.0, 0, 0], color: '#4a3828' });
  } else {
    b.box(5, 2.4, 4, { position: [0, D / 2 + 1.2, z0 + 3.5], rotation: [0, 0, 0.05], color: '#6a4a34' });
    b.add(new THREE.CylinderGeometry(0.18, 0.24, 5, 6), { position: [0, D / 2 + 2, z1 - 4], rotation: [0.1, 0, 1.3], color: '#4a3828' });
  }
  const mesh = b.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.position.set(x, y, z);
  mesh.rotation.set(tilt[0], rot, tilt[1], 'YXZ');
  mesh.castShadow = mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}

export default {
  title: 'Acts 27:39-28:6: Shipwreck on Malta',
  seed: 37,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.4, 0.5, -0.6], color: '#c8ccd4', intensity: 1.3 },
  light: { sky: '#9aa4b4', ground: '#4a443e', hemi: 1.1 },
  sky: { top: '#5a6474', horizon: '#a8b0b4', ground: '#6a6a66', sunColor: '#d8dce0', glow: 0.3 },
  fog: { color: '#8e989c', near: 40, far: 420 },
  clouds: { count: 120, shadow: '#4a5058', lit: '#9aa2aa', rim: '#c8ccd0', distance: [160, 800], altitude: [60, 160], hole: 0 },
  mountains: { count: 20, color: '#5a6064', radius: [520, 720], height: [20, 60], haze: 0.7 },
  bloom: { strength: 0.55, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 0.92, contrast: 1.06, vignette: 0.45, shadowTint: '#2a3448', highlightTint: '#ffe2b8' },
  shadow: { center: [0, 4], radius: 30 },

  player: { start: [3.6, 12.2], yaw: 0.12, pitch: -0.02, eye: 1.65, speed: 4.2 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 37,
    hills: 40,
    bumps: 0.35,
    flats: [
      { x: 0, z: -400, r: 382, falloff: 30, height: -3.2 },
      { x: 0, z: 8, r: 16, falloff: 22, height: 0.6 },
    ],
    colors: { ground: '#a89a80', groundAlt: '#968a72', grass: '#6a7448', high: '#8a826e', rock: '#6e6860' },
    patches: [
      { x: 0, z: -6, r: 200, color: '#b4a888', strength: 0.5, rough: 0.1 },
      { x: 0, z: 6, r: 6, color: '#5a5048', strength: 0.4, rough: 0.5 },
    ],
  },

  objects: [],

  scatter: [
    { type: 'rock', count: 40, center: [0, 0], ring: [16, 120], arc: [0.1, Math.PI - 0.1], spacing: 6, seed: 371, props: { color: '#7a746a' } },
    { type: 'rock', count: 16, center: [0, -14], ring: [20, 90], arc: [Math.PI + 0.3, Math.PI * 2 - 0.3], spacing: 8, seed: 372, props: { size: 2, color: '#6a645c' } },
    { type: 'tree', count: 24, center: [0, 40], ring: [30, 200], arc: [0.2, Math.PI - 0.2], spacing: 12, seed: 373, props: { kind: 'broad', h: 5, leaf: '#56603e' } },
  ],

  crowd: {
    palette: {
      robes: ['#6a5a48', '#5a4e42', '#7a6a56', '#4a4440', '#8a7a64', '#5a5650', '#7a3a2e', '#8a2e26'],
      mantles: ['#3e362e', '#4a4a4a', '#5a4a3a', '#6a2e26'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b08060'],
      mantleChance: 0.6,
      hoodChance: 0.45,
    },
    groups: [
      { count: 120, center: FIRE, ring: [2.4, 15], spacing: 0.95, face: FIRE, children: 0.03, seed: 374, avoid: [{ rect: [2.4, 8.4, 4.6, 10.5] }, { rect: [PAUL[0], PAUL[1], 1.4, 1.4] }] },
      { count: 70, center: [-4, -2], ring: [6, 26], arc: [Math.PI * 0.6, Math.PI * 1.9], spacing: 1.3, face: FIRE, children: 0.02, kneel: 0.3, seed: 375, avoid: [{ rect: [2.4, 8.4, 4.6, 10.5] }] },
      { count: 40, center: [10, 2], ring: [4, 16], spacing: 1.3, face: FIRE, children: 0.02, kneel: 0.3, seed: 376, avoid: [{ rect: [2.4, 8.4, 4.6, 10.5] }, { rect: [6, 12, 6, 6] }] },
    ],
  },

  figures: [],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { x: 0, z: -420, y: SEA, w: 1200, d: 820, seg: 160, color: '#4e6e72', amp: 0.28, opacity: 0.96, shininess: 30, specular: '#c8d4d8' });
    rain(ctx, { count: 2600, radius: 40, height: 26, speed: 20, wind: [4, 2], opacity: 0.3 });

    fire(ctx, { x: FIRE[0], z: FIRE[1], size: 1.3, flames: 8, light: 30, lightRange: 18, smoke: 0 });
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8, d = 1.7 + (i % 3) * 0.3;
      ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 5), { position: [FIRE[0] + Math.cos(a) * d + 2, ctx.heightAt(FIRE[0], FIRE[1]) + 0.06, FIRE[1] + Math.sin(a) * 0.4 + 1.4], rotation: [Math.PI / 2, a, 0], color: '#5a4434' });
    }

    // Paul, the bundle of sticks dropped at his feet, the viper hanging from his hand.
    const py = ctx.heightAt(...PAUL);
    const g = figure(ctx, { x: PAUL[0], z: PAUL[1], face: FIRE, robe: '#9a7a56', mantle: '#2e4a6e', arms: 'out' });
    const yaw = g.rotation.y;
    const hx = PAUL[0] - Math.cos(yaw) * 0.67 + Math.sin(yaw) * 0.23, hz = PAUL[1] + Math.sin(yaw) * 0.67 + Math.cos(yaw) * 0.23;
    const vb = new Batch(ctx.rand);
    const path = [];
    for (let k = 0; k < 16; k++) {
      const f = k / 15;
      path.push([hx + Math.sin(f * 7) * 0.06 + (FIRE[0] - hx) * f * 0.25, py + 0.98 - f * 0.55 + Math.sin(f * 9) * 0.04, hz + Math.cos(f * 7) * 0.06 + (FIRE[1] - hz) * f * 0.25]);
    }
    serpent(vb, { path, color: '#3e3424', belly: '#8a7a4a', thick: 0.055 });
    ctx.scene.add(vb.build(new THREE.MeshLambertMaterial({ vertexColors: true })));
    for (let i = 0; i < 5; i++) ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 4), { position: [PAUL[0] - 0.5 + i * 0.08, py + 0.05, PAUL[1] + 0.5], rotation: [Math.PI / 2, 0.4 + i * 0.2, 0], color: '#6a5038' });

    // The ship aground on the bar, bow stuck fast and stern broken by the waves.
    wreckPiece(ctx, { half: 'bow', x: 10, y: SEA + 0.3, z: -42, rot: 0.6, tilt: [-0.12, 0.18] });
    wreckPiece(ctx, { half: 'stern', x: -6, y: SEA - 2.0, z: -52, rot: 0.9, tilt: [0.2, -0.35] });
    ctx.effects.smoke({ position: [6, SEA, -44], count: 10, height: 5, size: 2.5, color: '#e0e6e8', wind: [0.4, 0.3], seed: 4 });
    ctx.effects.smoke({ position: [-8, SEA, -52], count: 10, height: 4, size: 2.2, color: '#e0e6e8', wind: [0.4, 0.3], seed: 5 });
    for (let i = 0; i < 22; i++) {
      const x = ctx.rand.range(-30, 30), z = ctx.rand.range(-38, -12);
      ctx.solid.box(ctx.rand.range(1.5, 3.5), 0.18, ctx.rand.range(0.3, 0.5), { position: [x, SEA + 0.1, z], rotation: [0, ctx.rand() * 3, 0], color: '#6a5038' });
    }
    for (let i = 0; i < 12; i++) {
      const x = ctx.rand.range(-16, 22), z = ctx.rand.range(-14, -4);
      ctx.solid.box(ctx.rand.range(1.2, 3), 0.15, ctx.rand.range(0.3, 0.5), { position: [x, Math.max(SEA, ctx.heightAt(x, z)) + 0.08, z], rotation: [0, ctx.rand() * 3, 0.05], color: '#6a5038' });
    }
    for (const [x, z] of [[-8, -20], [6, -26], [-2, -34]]) {
      ctx.solid.box(2.6, 0.18, 0.45, { position: [x, SEA + 0.12, z], rotation: [0, 0.5, 0], color: '#6a5038' });
      figure(ctx, { x, z, y: SEA - 0.9, face: [0, 6], robe: '#5a4e42', arms: 'out', collide: false });
    }
  },
};
