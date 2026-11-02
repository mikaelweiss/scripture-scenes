// 3 Nephi 8-10: the great storm at the Savior's death. Zarahemla burns, the city of Moroni sinks
// into the sea, the earth breaks apart, and a thick vapor of darkness settles over the land.
// Coordinates are meters. The player stands among mourners south of the burning city (-z).
import * as THREE from 'three';
import { figure, house, fires, water } from './lib/bom-37-kit.js';

const CITY = [-10, -80];
const SEA_X = 62;

const palette = {
  robes: ['#5e4b3a', '#6e5a44', '#4f3a2c', '#7a4e36', '#3f3a38', '#8b6b4a', '#4a4038', '#6b3a2a'],
  mantles: ['#3a2a20', '#2f3a48', '#4a3a2a', '#5a3d2b'],
  skins: ['#9b6a46', '#8a5a3c', '#a87652'],
  mantleChance: 0.7,
  hoodChance: 0.5,
};

// Lightning: a jagged bolt that strikes every few seconds and lights the whole land for an instant.
function lightning(ctx) {
  const { THREE: T, scene, rand } = ctx;
  const flash = new T.DirectionalLight('#c8d4ff', 0);
  flash.position.set(-40, 200, -120);
  scene.add(flash);
  const sky = new T.HemisphereLight('#9aa8ff', '#201820', 0);
  scene.add(sky);
  const bolts = [];
  for (let b = 0; b < 3; b++) {
    const parts = [];
    let p = new T.Vector3(rand.range(-120, 60), 180, rand.range(-260, -150));
    while (p.y > 0) {
      const next = p.clone().add(new T.Vector3(rand.range(-10, 10), -rand.range(10, 22), rand.range(-6, 6)));
      const len = p.distanceTo(next);
      const seg = new T.BoxGeometry(0.9, 0.9, len).translate(0, 0, len / 2);
      seg.lookAt(next.clone().sub(p));
      seg.translate(p.x, p.y, p.z);
      parts.push(seg.toNonIndexed());
      p = next;
    }
    const geo = new T.BufferGeometry();
    const merged = parts.reduce((acc, g) => acc.concat(Array.from(g.attributes.position.array)), []);
    geo.setAttribute('position', new T.Float32BufferAttribute(merged, 3));
    const mesh = new T.Mesh(geo, new T.MeshBasicMaterial({ color: '#e8eeff', toneMapped: false, fog: false, transparent: true }));
    mesh.visible = false;
    scene.add(mesh);
    bolts.push(mesh);
  }
  const strikes = [0.4, 4.2, 6.1, 10.5, 13.2];
  const cycle = 15;
  ctx.onFrame((t) => {
    const local = t % cycle;
    let k = 0, which = 0;
    strikes.forEach((s, i) => {
      const d = local - s;
      if (d > 0 && d < 0.45) {
        const v = d < 0.08 ? 1 : d < 0.14 ? 0.3 : d < 0.22 ? 0.85 : Math.max(0, 1 - (d - 0.22) / 0.23) * 0.5;
        if (v > k) (k = v), (which = i % bolts.length);
      }
    });
    flash.intensity = k * 2.4;
    sky.intensity = k * 1.2;
    bolts.forEach((b, i) => {
      b.visible = k > 0.25 && i === which;
      b.material.opacity = k;
    });
  });
}

function city(ctx) {
  const r = ctx.rand;
  const flames = [];
  for (let i = 0; i < 46; i++) {
    const x = CITY[0] + r.range(-70, 70), z = CITY[1] + r.range(-45, 35);
    if (x > SEA_X - 25) continue;
    if (r() < 0.45) {
      const w = r.range(6, 9), d = r.range(5, 7), h = r.range(3, 4.5);
      house(ctx, { x, z, rot: r.range(-0.3, 0.3), w, d, h, color: r.pick(['#6a5a48', '#5a4c3e', '#7a6650']), roof: '#2a221c', door: '#ff8a3a' });
      flames.push({ x, z, y: ctx.heightAt(x, z) + h, size: r.range(1.6, 2.8) });
    } else {
      ctx.builders.ruinedHouse(ctx, { x, z, color: r.pick(['#5a4c3e', '#6a5a48']), damage: r.range(0.5, 0.95) });
      if (r() < 0.7) flames.push({ x: x + r.range(-2, 2), z: z + r.range(-2, 2), size: r.range(1.2, 2.4) });
    }
  }
  // The temple of the city, cracked and burning at the top.
  const top = ctx.builders.steppedPyramid(ctx, { x: CITY[0] - 6, z: CITY[1] - 40, w: 34, d: 30, tiers: 5, tierHeight: 3.2, inset: 2.4, stairWidth: 7, color: '#5e5040', trim: '#3e342a', stairColor: '#6a5a48' }).top;
  flames.push({ x: CITY[0] - 6, z: CITY[1] - 40, y: top, size: 4 });
  return flames;
}

// The city of Moroni sinking: rooftops, a tilted tower and a temple top breaking the black water.
function sinkingCity(ctx) {
  const { solid, rand: r } = ctx;
  water(ctx, { x: SEA_X + 160, z: -60, w: 320, d: 420, y: -1.2, color: '#4a6070', segments: 60, wave: 0.45 });
  for (let i = 0; i < 16; i++) {
    const x = SEA_X + r.range(22, 90), z = r.range(-120, -10);
    const h = r.range(1, 3.5);
    solid.box(r.range(5, 9), h * 2, r.range(5, 7), { position: [x, -1.2 + h - h * 0.6, z], rotation: [r.range(-0.2, 0.2), r() * 3, r.range(-0.25, 0.25)], color: '#4a4038' });
  }
  solid.box(5, 18, 5, { position: [SEA_X + 40, 4, -62], rotation: [0.32, 0.5, 0.18], color: '#5a4c3e' });
  solid.add(new THREE.ConeGeometry(10, 7, 4), { position: [SEA_X + 55, 0.5, -28], rotation: [0.1, 0.78, -0.15], color: '#4e4236' });
  for (let i = 0; i < 40; i++) {
    const x = SEA_X + r.range(20, 120), z = r.range(-140, 20);
    solid.add(new THREE.OctahedronGeometry(r.range(0.4, 1.2), 0), { position: [x, -1.0, z], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.25, 1], color: '#6a6a70' });
  }
}

export default {
  title: '3 Nephi 8-10: The destruction and three days of darkness',
  seed: 40,
  fov: 60,
  exposure: 1.45,

  sun: { direction: [0.35, 0.3, -0.9], color: '#ff8a4a', intensity: 1.1 },
  light: { sky: '#6a5a80', ground: '#5a3020', hemi: 1.1 },
  sky: { top: '#0a080c', horizon: '#4a2016', ground: '#0e0a0a', sunColor: '#401a10', glow: 0.3 },
  fog: { color: '#24160f', near: 40, far: 330 },
  clouds: { count: 120, shadow: '#120e12', lit: '#4a2416', rim: '#7a3418', distance: [160, 700], altitude: [50, 140], hole: 0 },
  mountains: { count: 40, color: '#141012', radius: [420, 650], height: [60, 160], haze: 0.4 },
  bloom: { strength: 1.0, radius: 0.6, threshold: 0.55 },
  grade: { saturation: 1.05, contrast: 1.12, vignette: 0.45, shadowTint: '#100a18', highlightTint: '#ffb070' },
  shadow: { center: [0, -20], radius: 80 },

  player: { start: [0, 22], yaw: -0.18, pitch: 0.05, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 40,
    hills: 36,
    bumps: 0.5,
    flats: [
      { x: CITY[0], z: CITY[1] + 30, r: 110, falloff: 40, height: 0 },
      { x: SEA_X + 170, z: -60, r: 140, falloff: 45, height: -9 },
    ],
    colors: { ground: '#5a4636', groundAlt: '#4c3c2e', grass: '#3e3c28', high: '#4a4236', rock: '#3a302a' },
    patches: [{ x: 0, z: 20, r: 40, color: '#4a3a2e', strength: 0.5, rough: 0.5 }],
  },

  objects: [
    { type: 'crack', path: [[-60, 30], [-30, 12], [-8, 4], [10, -6], [30, -2], [55, -16], [80, -10]], width: 1.6, glow: true, branches: 6 },
    { type: 'crack', path: [[-20, 60], [-14, 40], [-22, 22], [-40, 0]], width: 0.9, glow: true, branches: 3 },
    { type: 'crack', path: [[16, 50], [24, 34], [18, 16]], width: 0.7, glow: true, branches: 2 },
    { type: 'toppledWall', x: 14, z: 12, rot: 0.4, len: 10, color: '#5a4c3e' },
    { type: 'toppledWall', x: -16, z: 8, rot: 2.1, len: 8, color: '#5a4c3e' },
    { type: 'column', x: -8, z: -14, h: 5, color: '#5e5040', broken: true },
    { type: 'column', x: 8, z: -18, h: 5, color: '#5e5040', broken: true },
    { type: 'column', x: -20, z: -22, h: 5, color: '#5e5040', broken: true },
    { type: 'rubble', x: 4, z: 6, radius: 6, count: 30, color: '#4e4236' },
    { type: 'smolder', x: -26, z: 14, radius: 2.5, smoke: 12, height: 26 },
    { type: 'smolder', x: 30, z: 6, radius: 3, smoke: 12, height: 30 },
  ],

  scatter: [
    { type: 'tree', count: 70, center: [0, 0], ring: [90, 300], spacing: 7, seed: 8, avoid: [{ rect: [SEA_X + 160, -60, 330, 440] }], props: { kind: 'burnt' } },
    { type: 'rubble', count: 40, center: [0, 0], ring: [20, 150], seed: 7, avoid: [{ rect: [SEA_X + 160, -60, 330, 440] }], props: { color: '#4e4236', count: 8, radius: 3 } },
    { type: 'smolder', count: 14, center: CITY, ring: [60, 220], spacing: 30, seed: 12, props: { radius: 4, smoke: 14, height: 50 }, avoid: [{ rect: [SEA_X + 160, -60, 330, 440] }, { rect: [0, 20, 70, 60] }] },
  ],

  crowd: {
    palette,
    groups: [
      { count: 46, center: [-4, 10], ring: [0.8, 6], spacing: 0.9, face: CITY, children: 0.25, kneel: 0.6, seed: 21 },
      { count: 30, center: [12, 18], ring: [0.8, 4.5], spacing: 0.9, face: [12, 18], children: 0.3, kneel: 0.5, seed: 22 },
      { count: 40, center: [-18, 30], ring: [0.8, 5], spacing: 0.9, face: CITY, children: 0.2, kneel: 0.5, seed: 23 },
      { count: 60, center: [0, 0], ring: [24, 50], arc: [0, Math.PI], spacing: 3, face: CITY, children: 0.2, kneel: 0.4, seed: 24, avoid: [{ rect: [0, 24, 4, 14] }] },
    ],
  },

  custom(ctx) {
    const flames = city(ctx);
    sinkingCity(ctx);
    lightning(ctx);
    fires(ctx, flames, { lights: 4, lightIntensity: 140, lightDistance: 80 });
    fires(ctx, [{ x: -26, z: 14, size: 1.3 }, { x: 30, z: 6, size: 1.5 }, { x: 6, z: -4, size: 1.0 }, { x: 4, z: 31, size: 1.1 }], { lights: 4, lightIntensity: 50, lightDistance: 30 });

    // Mourners crying out in the dark, some with hands raised.
    const r = ctx.rand;
    for (const [x, z, pose] of [[3, 14, 'up'], [-7, 15, 'raise'], [6, 9, 'pray'], [-10, 6, 'up'], [10, 22, 'pray']]) {
      figure(ctx, { x, z, face: CITY, pose, kneel: pose === 'pray', robe: r.pick(palette.robes), mantle: r.pick(palette.mantles), skin: r.pick(palette.skins), hood: true });
    }
  },
};
