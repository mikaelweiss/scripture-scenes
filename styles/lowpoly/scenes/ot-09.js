// Genesis 19:15-28: fire and brimstone fall on Sodom in the plain at sunrise. Lot and his daughters
// hurry up the slope toward Zoar while his wife, looking back, has become a pillar of salt.
// -z is north, down toward the burning city.
import * as THREE from 'three';
import { person, house, tufts } from './lib/ot-07-common.js';

const CITY = [0, -112];
const WIFE = [2.4, 7];

const cityWall = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  return { type: 'wall', x: CITY[0] + Math.cos(a) * 58, z: CITY[1] + Math.sin(a) * 44, rot: -a, len: 16, h: 6, thick: 1.4, damage: 0.25, color: '#9a7a5a' };
});

function burningCity(ctx) {
  const r = ctx.rand;
  const roofs = [];
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 50;
    const x = CITY[0] + Math.cos(a) * d * 1.05, z = CITY[1] + Math.sin(a) * d * 0.8;
    if (Math.hypot(x - CITY[0], z - CITY[1] + 4) < 12) continue;
    const w = r.range(6, 11), dd = r.range(5, 9), h = r.range(3.5, 7);
    house(ctx, { x, z, rot: r.range(-0.3, 0.3), w, d: dd, h, color: r.pick(['#b08a62', '#9c7a56', '#c09a6c', '#8a6a4c']) });
    roofs.push([x, ctx.heightAt(x, z) + h, z, w]);
  }
  const ty = ctx.builders.steppedPyramid(ctx, { x: CITY[0], z: CITY[1] - 4, w: 22, d: 22, tiers: 5, tierHeight: 3.2, inset: 2, stairWidth: 4, color: '#a07e5a', trim: '#7a5c42' });
  roofs.push([CITY[0], ty.top, CITY[1] - 4, 10]);

  const flame = (x, y, z, s) => {
    for (let j = 0; j < 3; j++) {
      ctx.glow.add(new THREE.ConeGeometry(s * r.range(0.3, 0.55), s * r.range(1.0, 2.0), 5), {
        position: [x + r.range(-s, s) * 0.5, y + s * 0.6, z + r.range(-s, s) * 0.5],
        rotation: [r.range(-0.15, 0.15), r() * 3, r.range(-0.15, 0.15)],
        color: r.pick(['#ff5a14', '#ff8a28', '#ffb040', '#e8401a']),
        jitter: 0.06,
      });
    }
  };
  roofs.forEach(([x, y, z, w], i) => {
    if (i % 3 !== 2) flame(x, y, z, w * r.range(0.35, 0.6));
    if (i % 7 === 0) ctx.effects.smoke({ position: [x, y, z], count: 10, height: r.range(50, 90), size: 4, color: '#3a2a26', wind: [3, 1], seed: i * 31 + 7 });
  });
  for (const [dx, dz, s] of [[-20, 10, 14], [18, -6, 16], [0, -20, 18], [30, 18, 12], [-34, -14, 12]]) {
    ctx.effects.smoke({ position: [CITY[0] + dx, ctx.heightAt(CITY[0] + dx, CITY[1] + dz) + 4, CITY[1] + dz], count: 14, height: 160, size: s * 0.6, color: '#2e2220', wind: [8, 2], seed: dx * 13 + dz });
  }
  for (const [dx, dz] of [[-25, 8], [20, -10], [0, 18], [5, -28]]) {
    const pl = new THREE.PointLight('#ff6a24', 900, 90, 1.5);
    pl.position.set(CITY[0] + dx, 14, CITY[1] + dz);
    ctx.scene.add(pl);
    ctx.onFrame((t) => (pl.intensity = 900 * (0.8 + 0.2 * Math.sin(t * 5 + dx))));
  }
  const glowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(80, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  );
  glowDisc.position.set(CITY[0], ctx.heightAt(CITY[0], CITY[1]) + 2, CITY[1]);
  ctx.scene.add(glowDisc);
}

// Streaks of fire falling out of heaven onto the plain, recycled as they land.
function fireRain(ctx, { count = 110, radius = 80, top = 170 }) {
  const r = ctx.rand;
  const mesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: '#ffc060', toneMapped: false }), count);
  const drops = Array.from({ length: count }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    return { x: CITY[0] + Math.cos(a) * d * 1.1, z: CITY[1] + Math.sin(a) * d * 0.8, ph: r(), speed: r.range(60, 95), size: r.range(0.35, 0.9) };
  });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0, -0.25)), p = new THREE.Vector3(), s = new THREE.Vector3();
  ctx.onFrame((t) => {
    drops.forEach((dp, i) => {
      const f = (dp.ph + (t * dp.speed) / top) % 1;
      const y = top * (1 - f);
      p.set(dp.x - 0.25 * y, y + ctx.heightAt(dp.x, dp.z), dp.z - 0.35 * y);
      s.set(dp.size, dp.size * 12, dp.size);
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
}

export default {
  title: 'Genesis 19:15-28: Sodom destroyed',
  seed: 19,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.9, 0.2, 0.25], color: '#ffa060', intensity: 2.8 },
  light: { sky: '#d07050', ground: '#5a3020', hemi: 1.35 },
  sky: { top: '#1e0a0c', horizon: '#c44a24', ground: '#4a2216', sunColor: '#ffb070', glow: 1.0 },
  fog: { color: '#6e2a1a', near: 70, far: 470 },
  clouds: { count: 120, shadow: '#241012', lit: '#e8602a', rim: '#ffb070', distance: [200, 800], altitude: [70, 200], hole: 0.15, seed: 9 },
  mountains: { count: 44, color: '#3a2420', radius: [470, 700], height: [50, 150], haze: 0.45 },
  bloom: { strength: 0.9, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.15, contrast: 1.1, vignette: 0.5, shadowTint: '#2a0e1e', highlightTint: '#ffcf98' },
  shadow: { center: [0, 12], radius: 40 },

  player: { start: [-2, 23], yaw: -0.05, pitch: -0.12, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 19,
    hills: 10,
    bumps: 0.35,
    flats: [
      { x: CITY[0], z: CITY[1], r: 64, falloff: 14, height: -8 },
      { x: 0, z: 24, r: 8, falloff: 50, height: 10 },
    ],
    colors: { ground: '#8a6a4e', groundAlt: '#7a5c44', grass: '#6a6438', high: '#8a7058', rock: '#6a5040' },
    patches: [
      { x: 0, z: 14, r: 4.5, color: '#a8885e', strength: 0.5, rough: 0.5 },
      { x: 0, z: 2, r: 5, color: '#a8885e', strength: 0.5, rough: 0.5 },
      { x: CITY[0], z: CITY[1], r: 70, color: '#3a2620', strength: 0.6, rough: 0.4 },
    ],
  },

  objects: cityWall,

  scatter: [
    { type: 'rock', count: 50, center: [0, 0], ring: [8, 160], spacing: 8, seed: 4, avoid: [{ r: 80, x: CITY[0], z: CITY[1] }], props: { color: '#7a604a' } },
    { type: 'tree', count: 30, center: CITY, ring: [70, 200], spacing: 10, seed: 5, avoid: [{ r: 40, x: 0, z: 20 }], props: { kind: 'burnt' } },
    { type: 'smolder', count: 12, center: CITY, ring: [60, 140], spacing: 20, seed: 6, avoid: [{ r: 60, x: 0, z: 0 }], props: { radius: 4, smoke: 10, height: 40 } },
    { type: 'tree', count: 14, center: [0, 20], ring: [14, 80], arc: [0, Math.PI], spacing: 10, seed: 7, props: { kind: 'broad', leaf: '#4e5a2c', h: 5 } },
  ],

  custom(ctx) {
    burningCity(ctx);
    fireRain(ctx, {});
    tufts(ctx, { center: [0, 16], ring: [3, 40], count: 160, colors: ['#6a6a38', '#5e5a32', '#7a6e3e'] });

    const salt = '#ece9e2';
    person(ctx, { x: WIFE[0], z: WIFE[1], face: CITY, robe: salt, mantle: salt, skin: salt, hood: true, emissive: 0.12 });
    const y = ctx.heightAt(WIFE[0], WIFE[1]);
    ctx.solid.add(new THREE.CylinderGeometry(0.55, 0.75, 0.35, 7), { position: [WIFE[0], y + 0.05, WIFE[1]], color: '#dcd8cc', jitter: 0.04 });

    person(ctx, { x: -4.8, z: 15.5, face: [-6, 40], pose: 'run', robe: '#6a4a36', mantle: '#3a2a20', skin: '#9b6a46', hood: true });
    person(ctx, { x: -3.0, z: 16.8, face: [0, 40], pose: 'run', robe: '#8a3a2a', mantle: '#c8b48e', skin: '#a87652', hood: true, scale: 0.92 });
    person(ctx, { x: -6.4, z: 17.4, face: [-4, 40], pose: 'run', robe: '#4a5a6a', mantle: '#8a7a5a', skin: '#a87652', hood: true, scale: 0.9 });
  },
};
