// Abraham 3:1-10: at night, through the Urim and Thummim, Abraham sees the stars, one above another,
// until he comes near Kolob, the great one nearest the throne of God, which governs all those of the
// same order. Abraham stands on a hill above his camp; the governing stars climb the northern sky (-z).
import * as THREE from 'three';
import { person, urimAndThummim, stars, skyOrb, fire, stone, box } from './lib/pgp-01-kit.js';

const ABRAHAM = [0, -4];
const CAMP = [-26, 30];

const sky = (az, el) => [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
const deg = Math.PI / 180;

// The order of stars, from small and low to Kolob, great and high.
const ORDER = [
  { az: 40, el: 4, size: 10, color: '#c8d8ff' },
  { az: 33, el: 9, size: 13, color: '#d8e0ff' },
  { az: 25, el: 14, size: 17, color: '#e0e6ff' },
  { az: 17, el: 19, size: 22, color: '#f0eaff' },
  { az: 9, el: 25, size: 30, color: '#fff0e0' },
  { az: 2, el: 31, size: 42, color: '#fff4dc' },
];
const KOLOB = { az: -6, el: 38 };

export default {
  title: 'Abraham 3:1-10: Abraham sees the stars',
  seed: 505,
  fov: 66,
  exposure: 1.1,

  sun: { direction: [0.9, 0.3, 0.25], color: '#a8b8ff', intensity: 1.2 },
  light: { sky: '#4a5a9a', ground: '#2a2632', hemi: 1.4 },
  sky: { top: '#050816', horizon: '#1e2650', ground: '#121420', sunColor: '#b8c4ff', glow: 0.0 },
  fog: { color: '#141a34', near: 60, far: 520 },
  mountains: { count: 40, color: '#141828', radius: [480, 700], height: [30, 90], haze: 0.35 },
  bloom: { strength: 0.9, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 1.1, contrast: 1.08, vignette: 0.5, shadowTint: '#141a50', highlightTint: '#fff2d8' },
  shadow: { center: [0, 0], radius: 40 },

  player: { start: [1.6, 4.2], yaw: 0.02, pitch: 0.25, eye: 1.65, speed: 4 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 55,
    hills: 18,
    bumps: 0.3,
    flats: [{ x: 0, z: 0, r: 10, falloff: 50, height: 9 }, { x: CAMP[0], z: CAMP[1], r: 20, falloff: 20, height: 0 }],
    colors: { ground: '#4a4038', groundAlt: '#3e3630', grass: '#3a3c2c', high: '#4a4238', rock: '#3a322c' },
    patches: [{ x: 0, z: 0, r: 12, color: '#5a5048', strength: 0.6, rough: 0.5 }],
  },

  scatter: [
    { type: 'rock', count: 18, center: [0, 0], ring: [8, 40], spacing: 5, seed: 7, avoid: [{ rect: [0, 2, 10, 14] }], props: { color: '#4e4640', size: 1.4 } },
    { type: 'rock', count: 40, center: [0, 0], ring: [40, 260], spacing: 12, seed: 8, props: { color: '#3e3832' } },
    { type: 'tree', count: 20, center: CAMP, ring: [22, 120], spacing: 10, seed: 9, avoid: [{ rect: [0, 0, 60, 60] }], props: { kind: 'palm', leaf: '#2e3a26' } },
  ],

  custom(ctx) {
    const r = ctx.rand;

    stars(ctx, { count: 3200, seed: 11, size: 1.7, tints: ['#e8eeff', '#fff4e0', '#d0dcff', '#ffe0c8'] });
    stars(ctx, { count: 400, seed: 12, size: 2.6, tints: ['#ffffff', '#e0e8ff'] });

    // A band of the heavens: a faint milky river of light across the north.
    const band = [];
    for (let i = 0; i < 900; i++) {
      const t = r() * 2 - 1;
      const az = t * 1.6, el = (20 + t * 30 + (r() - 0.5) * 12) * deg;
      const v = sky(az, el);
      band.push(v[0] * 1250, v[1] * 1250, v[2] * 1250);
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(band, 3));
    const bandPts = new THREE.Points(bg, new THREE.PointsMaterial({ color: '#9aa8e0', size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.6, depthWrite: false }));
    bandPts.frustumCulled = false;
    ctx.scene.add(bandPts);
    ctx.onFrame((t, dt, cam) => bandPts.position.copy(cam.position));

    // The governing stars, one above another, up to Kolob.
    for (const s of ORDER) skyOrb(ctx, { dir: sky(s.az * deg, s.el * deg), size: s.size, color: s.color, halo: 3.2 });
    const kolob = skyOrb(ctx, { dir: sky(KOLOB.az * deg, KOLOB.el * deg), size: 70, color: '#ffe8b8', core: '#fffaf0', halo: 4.5, spin: 0.08 });
    ctx.onFrame((t) => kolob.sprites[0].scale.setScalar(70 * 4.5 * (1 + 0.04 * Math.sin(t * 0.9))));

    // Faint orbit rings around Kolob: the order and reckoning of the stars.
    const kdir = new THREE.Vector3(...sky(KOLOB.az * deg, KOLOB.el * deg)).normalize();
    const rings = new THREE.Group();
    for (const [rad, op] of [[90, 0.35], [150, 0.25], [220, 0.18]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.8, 4, 96), new THREE.MeshBasicMaterial({ color: '#ffe8c0', transparent: true, opacity: op, fog: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      ring.rotation.x = 1.1;
      rings.add(ring);
    }
    rings.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), kdir.clone().negate());
    ctx.scene.add(rings);
    ctx.onFrame((t, dt, cam) => {
      rings.position.copy(cam.position).addScaledVector(kdir, 1100);
      rings.children.forEach((ring, i) => (ring.rotation.z = t * (0.03 - i * 0.008)));
    });

    // The moon, low in the east.
    skyOrb(ctx, { dir: [0.9, 0.3, 0.25], size: 40, color: '#dfe6ff', core: '#eef2ff', halo: 2.2, spin: 0 });

    // Abraham on the hilltop, looking up, the Urim and Thummim on his breast.
    const ay = ctx.heightAt(...ABRAHAM);
    const yaw = Math.atan2(Math.sin(KOLOB.az * deg), -Math.cos(KOLOB.az * deg));
    const g = person(ctx, { x: ABRAHAM[0], z: ABRAHAM[1], y: ay, robe: '#d8cdb5', mantle: '#4a5a7a', skin: '#a8754f', arms: 'out', hood: true, emissive: 0.08 });
    g.rotation.y = yaw;
    urimAndThummim(ctx, { x: ABRAHAM[0], y: ay, z: ABRAHAM[1], yaw });
    const pl = new THREE.PointLight('#d8e4ff', 14, 12, 1.4);
    pl.position.set(ABRAHAM[0], ay + 3, ABRAHAM[1] - 1.5);
    ctx.scene.add(pl);
    const rim = new THREE.PointLight('#9ab0ff', 8, 10, 1.4);
    rim.position.set(ABRAHAM[0] + 1.5, ay + 2.5, ABRAHAM[1] + 3);
    ctx.scene.add(rim);
    for (let i = 0; i < 8; i++) stone(ctx, { x: ABRAHAM[0] + r.range(-3, 3), z: ABRAHAM[1] - r.range(2, 5), size: r.range(0.3, 0.7), color: '#5a5048' });

    // Abraham's camp below: tents around a fire, Sarai at the door, flocks resting.
    fire(ctx, { x: CAMP[0], z: CAMP[1], scale: 1, light: 30, distance: 30, smoke: 6 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      const x = CAMP[0] + Math.cos(a) * 10, z = CAMP[1] + Math.sin(a) * 10;
      const ty = ctx.heightAt(x, z) - 0.1;
      ctx.solid.add(new THREE.CylinderGeometry(0.01, 3.2, 2.8, 4, 1).scale(1.4, 1, 1), { position: [x, ty + 1.4, z], rotation: [0, -a + Math.PI / 4, 0], color: r.pick(['#3a2e28', '#4a3a30', '#5a4636']), jitter: 0.05 });
      ctx.colliders.add({ x, z, w: 4, d: 4, bottom: ty, top: ty + 2.6 });
    }
    person(ctx, { x: CAMP[0] + 3, z: CAMP[1] - 2, face: CAMP, robe: '#6a4a5a', mantle: '#c9b48e', skin: '#b5835e', hood: true });
    person(ctx, { x: CAMP[0] - 2.4, z: CAMP[1] + 2.2, face: CAMP, robe: '#7a5a3e', mantle: '#3f4d5e', skin: '#9b6a46', kneel: true });
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = r.range(14, 22);
      const x = CAMP[0] + Math.cos(a) * d, z = CAMP[1] + Math.sin(a) * d;
      ctx.solid.add(new THREE.IcosahedronGeometry(0.4, 0), { position: [x, ctx.heightAt(x, z) + 0.25, z], scale: [0.85, 0.65, 1.25], rotation: [0, r() * 6, 0], color: '#bab4a8' });
    }
    box(ctx, { x: CAMP[0] + 14, z: CAMP[1] - 8, y: ctx.heightAt(CAMP[0] + 14, CAMP[1] - 8) - 0.1, w: 0.6, h: 0.9, d: 6, rot: 0.6, color: '#4a4038' });
  },
};
