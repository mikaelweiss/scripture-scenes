// Moses 7:13-21, 69: Enoch's city of Zion, one heart and one mind, is taken up into heaven.
// The whole city rises on its island of earth above the valley it stood in, light pouring down on it.
// The player watches from the valley floor south (+z) of the empty crater it left.
import * as THREE from 'three';
import { Batch } from '../engine/world.js';
import { placeCrowd, createCrowd, createFigure } from '../engine/crowd.js';
import { stone, cloudLayer } from './lib/pgp-01-kit.js';

const CITY = [0, -12];
const R = 30;

const houses = [];
for (let ring = 0; ring < 3; ring++) {
  const rad = 11 + ring * 7;
  const n = 10 + ring * 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + ring * 0.3;
    if (Math.abs(Math.sin(a * 2)) < 0.12) continue;
    houses.push({ x: Math.cos(a) * rad, z: Math.sin(a) * rad, rot: -a, w: 3.6 + (i % 3) * 0.6, d: 3 + (i % 2) * 0.8, h: 2.6 + ((i + ring) % 3) * 1.1 });
  }
}

export default {
  title: "Moses 7:13-21, 69: Enoch's Zion taken up",
  seed: 303,
  fov: 64,
  exposure: 1.05,

  sun: { direction: [0.45, 0.55, 0.6], color: '#fff0d8', intensity: 2.6 },
  light: { sky: '#a8bce8', ground: '#5a5040', hemi: 1.05 },
  sky: { top: '#3a5aa0', horizon: '#f6e0b8', ground: '#c8b090', sunColor: '#fff4dc', glow: 1.4 },
  fog: { color: '#e0cdb0', near: 120, far: 760 },
  clouds: { count: 70, shadow: '#8a8098', lit: '#fff2dc', rim: '#ffffff', distance: [260, 900], altitude: [120, 260], hole: 0.25, seed: 7 },
  mountains: { count: 44, color: '#6a6458', radius: [520, 760], height: [60, 150], haze: 0.5 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.4, shadowTint: '#2a2c5e', highlightTint: '#fff0d0' },
  shadow: { center: [0, 0], radius: 60 },

  player: { start: [5, 44], yaw: -0.1, pitch: 0.0, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 31,
    hills: 30,
    bumps: 0.35,
    flats: [{ x: 0, z: 10, r: 80, falloff: 60, height: 0 }, { x: 5, z: 46, r: 6, falloff: 22, height: 11 }, { x: CITY[0], z: CITY[1], r: R - 4, falloff: 8, height: -3.5 }],
    colors: { ground: '#8a7c56', groundAlt: '#7a6e4c', grass: '#6a8040', high: '#7a7458', rock: '#6a5e50' },
    patches: [
      { x: CITY[0], z: CITY[1], r: R + 4, color: '#4a3a2c', strength: 0.95, rough: 0.35 },
      { x: 0, z: 40, r: 40, color: '#7a8a46', strength: 0.5, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'tree', count: 80, center: [0, 0], ring: [55, 280], spacing: 9, seed: 8, props: { kind: 'broad', leaf: '#5e8038' } },
    { type: 'rock', count: 30, center: [0, 0], ring: [60, 260], spacing: 12, seed: 9, props: {} },
    { type: 'rubble', count: 18, center: CITY, ring: [R - 2, R + 8], seed: 10, props: { color: '#7a6a56', count: 6, radius: 2.5, size: [0.3, 0.9] } },
  ],

  effects: [
    { type: 'sunShafts', center: [0, -40], count: 8, spread: 60, length: 500, width: [10, 24], opacity: 0.07 },
  ],

  custom(ctx) {
    const r = ctx.rand;
    const city = new THREE.Group();
    const b = new Batch(r);
    const shade = (c, ny) => ny < -0.5 && c.multiplyScalar(0.6);

    // The island of earth: a grassy top over a jagged rocky underside torn from the valley.
    b.add(new THREE.CylinderGeometry(R, R - 2, 2.4, 16), { position: [0, -1.2, 0], color: '#6e8a44', jitter: 0.06 });
    b.add(new THREE.ConeGeometry(R - 1.5, 26, 14, 3).rotateX(Math.PI), { position: [0, -15.4, 0], color: '#8a7058', jitter: 0.1, shade });
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = r.range(4, R - 6);
      b.add(new THREE.ConeGeometry(r.range(2, 5), r.range(6, 16), 5).rotateX(Math.PI), { position: [Math.cos(a) * d, -r.range(6, 12), Math.sin(a) * d], color: r.pick(['#5e4a3c', '#7a6250', '#4e4034']), jitter: 0.08, shade });
    }
    // Streets of pale stone in a ring and a cross.
    b.add(new THREE.RingGeometry(14.5, 16.5, 24).rotateX(-Math.PI / 2), { position: [0, 0.03, 0], color: '#d8cdb4', jitter: 0.04 });
    b.box(R * 2 - 4, 0.06, 2.2, { position: [0, 0.02, 0], color: '#d8cdb4', jitter: 0.04 });
    b.box(2.2, 0.06, R * 2 - 4, { position: [0, 0.02, 0], color: '#d8cdb4', jitter: 0.04 });

    // Houses of white stone, alike and plain: a people of one heart with no poor among them.
    for (const h of houses) {
      b.box(h.w, h.h, h.d, { position: [h.x, h.h / 2, h.z], rotation: [0, h.rot, 0], color: '#ece4d2', jitter: 0.04, shade });
      b.box(h.w + 0.4, 0.3, h.d + 0.4, { position: [h.x, h.h + 0.15, h.z], rotation: [0, h.rot, 0], color: '#c8b48a', jitter: 0.04, shade });
      b.box(0.9, 1.6, 0.1, { position: [h.x + Math.sin(h.rot) * (h.d / 2 + 0.05), 0.8, h.z + Math.cos(h.rot) * (h.d / 2 + 0.05)], rotation: [0, h.rot, 0], color: '#6a5038', jitter: 0 });
    }

    // The temple at the center on a stepped platform.
    for (let i = 0; i < 3; i++) b.box(12 - i * 3, 1.2, 12 - i * 3, { position: [0, 0.6 + i * 1.2, 0], color: i % 2 ? '#d8cdb4' : '#f2ecde', jitter: 0.03, shade });
    b.box(4.4, 4.2, 4.4, { position: [0, 3.6 + 2.1, 0], color: '#f8f4ea', jitter: 0.02, shade });
    b.add(new THREE.ConeGeometry(3.2, 3.4, 4), { position: [0, 3.6 + 4.2 + 1.7, 0], rotation: [0, Math.PI / 4, 0], color: '#e8d8a8', jitter: 0.03 });
    const cityMesh = b.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
    cityMesh.castShadow = cityMesh.receiveShadow = true;
    city.add(cityMesh);

    const glowB = new Batch(r);
    for (const h of houses) {
      if (r() < 0.5) continue;
      glowB.box(0.7, 0.7, 0.08, { position: [h.x + Math.sin(h.rot) * (h.d / 2 + 0.06) + Math.cos(h.rot) * 1.1, h.h * 0.6, h.z + Math.cos(h.rot) * (h.d / 2 + 0.06) - Math.sin(h.rot) * 1.1], rotation: [0, h.rot, 0], color: '#ffe6a8', jitter: 0.04 });
    }
    city.add(glowB.build(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })));

    // The people of Zion, gathered in the streets and looking up.
    const avoid = [{ rect: [0, 0, 13, 13] }, ...houses.map((h) => ({ rect: [h.x, h.z, h.w + 1.2, h.d + 1.2, h.rot] }))];
    const palette = {
      robes: ['#e8e0cc', '#d8cdb5', '#c4b090', '#b59a72', '#a0825c', '#8b6b4a', '#f0ead8', '#9a8a6a'],
      mantles: ['#7d5c3e', '#c9b48e', '#5a6a8a', '#8a7a5a', '#e0d4bc', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.2,
    };
    const people = placeCrowd(
      [
        { palette, count: 420, center: [0, 0], ring: [7, R - 2.5], spacing: 1.0, face: [0, 0], children: 0.25, seed: 41, avoid },
        { palette, count: 60, center: [0, 0], ring: [R - 2.5, R - 1], spacing: 1.1, face: [0, 200], children: 0.2, seed: 42 },
      ],
      () => 0,
      () => 0,
    );
    const crowdTime = { value: 0 };
    city.add(createCrowd(people, crowdTime));

    // Enoch on the temple platform, arms raised.
    city.add(createFigure({ x: 0, y: 3.6, z: 3.4, face: [0, 100], scale: 1.1, robe: '#f4efe2', mantle: '#c9b48e', skin: '#a8754f', arms: 'out', emissive: 0.35 }));

    // Cloud wreathing the underside of the city.
    const ring = cloudLayer(ctx, { radius: R + 5, inner: R - 3, y: -3.5, count: 40, size: [1.8, 3.6], color: '#f4eee4', emissive: 0.05, opacity: 0.85, seed: 9 });
    ctx.scene.remove(ring);
    city.add(ring);
    const under = cloudLayer(ctx, { radius: R - 10, y: -20, count: 8, size: [3, 6], color: '#f4ece0', emissive: 0.1, opacity: 0.45, seed: 10 });
    ctx.scene.remove(under);
    city.add(under);

    const glow = new THREE.PointLight('#fff2d0', 70, 60, 1.2);
    glow.position.set(0, 16, 16);
    city.add(glow);

    city.position.set(CITY[0], 0, CITY[1]);
    ctx.scene.add(city);

    // Light descending on the rising city.
    const beam = ctx.effects.beam({ position: [CITY[0], 0, CITY[1]], height: 600, radiusBottom: R + 2, radiusTop: R + 30, color: '#fff3d8', opacity: 0.2 });
    const halo = ctx.effects.halo({ position: [CITY[0], 0, CITY[1]], size: 90, color: '#fff2d6', opacity: 0.22 });
    ctx.effects.motes({ position: [CITY[0], 0, CITY[1]], radius: R, height: 120, count: 360, size: 0.12 });

    ctx.onFrame((t) => {
      crowdTime.value = t;
      const y = 9 + 30 * (1 - Math.exp(-t / 150)) + Math.sin(t * 0.4) * 0.3;
      city.position.y = y;
      city.rotation.y = t * 0.004;
      beam.position.y = y - 2;
      halo.position.y = y + 30;
    });

    // Stones and broken roots left in the empty hollow.
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (R - 4);
      stone(ctx, { x: CITY[0] + Math.cos(a) * d, z: CITY[1] + Math.sin(a) * d, size: r.range(0.3, 1.1), color: '#5e4e40' });
    }
  },
};
