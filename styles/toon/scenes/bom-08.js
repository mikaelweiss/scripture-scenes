// 1 Nephi 18:8-23: the ship driven back four days by the tempest while Nephi lies bound on deck.
// The ship lies along x with its bow east. Nephi is tied at the foot of the mast.
import * as THREE from 'three';
import { addMesh, buildShip, cargo, FX_LAYER, groundMesh, makeRng, person, rain, stormSea } from './lib/bom-07-kit.js';

const SEG = 120;
const MAST = [2.4, 0];
const NEPHI = [3.05, 0];

export default {
  title: '1 Nephi 18:8-23: The storm at sea',
  subtitle: 'Driven back upon the waters four days, Nephi bound with cords',
  seed: 18,

  style: {
    ink: '#141a20',
    toonSteps: [0.35, 0.68, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [60, 300, 260, 0.5] },
    grain: 0.07,
    fog: { color: '#3c4a52', near: 30, far: 330 },
  },

  sky: { zenith: '#151c24', mid: '#2c3a44', horizon: '#4f5f66', ground: '#2a3c44', glowColor: '#6f7f86', glowDir: [-0.4, 0.3, -1] },

  sun: { dir: [-0.3, 0.9, 0.4], color: '#b8c8d0', intensity: 1.3, hemi: { sky: '#8aa0aa', ground: '#2a3a40', intensity: 1.2 }, shadowSize: 40 },

  ground: {
    size: 800, segments: SEG, flatRadius: 2000, hillHeight: 0, undulation: 0,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: { sand: '#2a3c44', dirt: '#2a3c44', grass: '#2a3c44', grassDark: '#2a3c44', plaza: '#2a3c44', plazaLine: '#2a3c44', scorch: '#000', scorchEdge: '#000', hill: '#2a3c44' },
  },

  objects: [],

  clouds: {
    layers: [
      { count: 40, distance: [140, 420], height: [40, 90], size: [50, 110], color: '#55606a', shade: '#1a2028', drift: 0.01 },
      { count: 26, distance: [100, 300], height: [70, 120], size: [60, 120], color: '#3d4852', shade: '#151a20', drift: -0.008 },
    ],
  },

  custom(ctx) {
    const { scene, kit } = ctx;
    groundMesh(ctx, SEG).visible = false;
    stormSea(ctx, { size: 520, segs: 96, calm: { x: 0, z: 0, r: 13 }, amp: 2.4, color: '#2f5560', crest: '#c9dcdc' });

    const D = 5;
    const ship = buildShip(ctx, { pos: [0, 0], rot: 0, y: -D * 0.42, L: 30, B: 8, D, sail: 'furled' });
    const deckY = ship.worldDeckY;
    ctx.onFrame((t) => {
      ship.inner.rotation.x = Math.sin(t * 0.8) * 0.03;
      ship.inner.rotation.z = Math.sin(t * 0.55 + 1) * 0.02;
    });

    // Cords around Nephi and the mast (1 Nephi 18:11-15).
    const cords = [];
    for (const h of [0.5, 0.8, 1.1, 1.38]) {
      const ring = new THREE.TorusGeometry(0.5, 0.05, 5, 20);
      ring.rotateX(Math.PI / 2);
      ring.scale(1.3, 1, 0.62);
      ring.translate((MAST[0] + NEPHI[0]) / 2 + 0.06, deckY + h, 0);
      cords.push(ring);
    }
    addMesh(scene, cords, kit.toon('#f0e2b8', { emissive: '#3a3020' }), { cast: false });
    cargo(ctx, [[-4, 2.3], [-4.6, 2.0], [-3.8, -2.4], [8, 2.2], [8.6, -2.1], [7.6, 1.9]], { y: deckY });

    const fam = { robe: '#7a6a52', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12', sash: '#3e6e66' };
    person(ctx, { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#a87650', hair: '#3a2418', sash: '#c8912e', arms: [0.06, 0] }, { pos: NEPHI, face: [12, -2], y: deckY, scale: 1.1 });
    person(ctx, { ...fam, robe: '#8c5a3c', mantle: '#3a2418', arms: [0.25, 0.9] }, { pos: [-0.5, 1.4], face: NEPHI, y: deckY });
    person(ctx, { ...fam, robe: '#6b5a4a', mantle: '#8c5a3c', arms: [0.6, 0.4] }, { pos: [0.2, -1.8], face: NEPHI, y: deckY });
    person(ctx, { robe: '#e6d8b8', mantle: '#d9c7a3', skin: '#c08f66', hair: '#e8e4dc' }, { pos: [-6.2, 2.3], face: [-6.2, 0], y: deckY, kneel: true });
    person(ctx, { robe: '#b5523b', mantle: '#d9c7a3', skin: '#c08f66', hair: '#d8d2c8' }, { pos: [-6.2, -2.3], face: [-6.2, 0], y: deckY, kneel: true });
    person(ctx, { robe: '#4f7f80', mantle: '#c8912e', skin: '#b5825a', hair: '#2b1a12' }, { pos: [4.3, 1.9], face: NEPHI, y: deckY, kneel: true });
    person(ctx, { robe: '#c98b3c', mantle: '#4f7f80', skin: '#b5825a', hair: '#3a2418' }, { pos: [3.7, 2.6], face: NEPHI, y: deckY, scale: 0.6 });
    person(ctx, { robe: '#d9c7a3', mantle: '#b5523b', skin: '#b5825a', hair: '#3a2418' }, { pos: [5.0, 2.5], face: NEPHI, y: deckY, scale: 0.65 });

    rain(ctx, { count: 1500, wind: [0.5, 0.15], speed: 30, opacity: 0.4 });

    // Lightning: a jagged bolt and a flash of the whole scene every few seconds.
    const hemi = scene.children.find((o) => o.isHemisphereLight);
    const hemiBase = hemi.intensity;
    const rng = makeRng(4);
    const boltMat = new THREE.MeshBasicMaterial({ color: '#f4f8ff', transparent: true, opacity: 0, fog: false, depthWrite: false, side: THREE.DoubleSide });
    const pts = [];
    let bx = 0, by = 140;
    while (by > 0) {
      const nx = bx + (rng() - 0.5) * 22, ny = by - 10 - rng() * 12;
      pts.push(new THREE.Vector3(bx, by, 0), new THREE.Vector3(nx, Math.max(0, ny), 0));
      bx = nx;
      by = ny;
    }
    const bolt = new THREE.Group();
    for (let i = 0; i < pts.length; i += 2) {
      const a = pts[i], b = pts[i + 1];
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, a.distanceTo(b) + 0.6), boltMat);
      seg.position.copy(a).add(b).multiplyScalar(0.5);
      seg.rotation.z = Math.atan2(-(b.x - a.x), b.y - a.y) + Math.PI;
      bolt.add(seg);
    }
    bolt.layers.enable(FX_LAYER);
    bolt.traverse((o) => o.layers.set(FX_LAYER));
    scene.add(bolt);
    const flashAt = [1.2, 5.5, 9.8, 13.1, 17.4];
    ctx.onFrame((t, dt, camera) => {
      const cycle = t % 19;
      let f = 0, k = -1;
      flashAt.forEach((s, i) => {
        const d = cycle - s;
        if (d > 0 && d < 0.5) { f = Math.max(f, d < 0.08 ? 1 : d < 0.16 ? 0.3 : d < 0.24 ? 0.8 : (0.5 - d) * 1.5); k = i; }
      });
      hemi.intensity = hemiBase + f * 2.2;
      boltMat.opacity = f;
      if (k >= 0) {
        const a = k * 2.1 + 0.6;
        bolt.position.set(Math.sin(a) * 180, 0, -Math.cos(a) * 180);
        bolt.lookAt(camera.position.x, 0, camera.position.z);
      }
    });
  },

  light: {
    glows: [{ at: [-6.75, 0], lift: 1.8, size: 2.2, color: '#ffc870', opacity: 0.7 }],
    pointLights: [{ at: [-6.5, 0], lift: 3.4, color: '#ffc070', intensity: 5, distance: 10 }, { at: [4.6, -0.6], lift: 2.6, color: '#ffd8a0', intensity: 3, distance: 6 }],
  },

  crowd: {
    seed: 5,
    minSpacing: 0.75,
    facing: NEPHI,
    colors: {
      robes: ['#7a6a52', '#8c5a3c', '#6b5a4a', '#a87b4f', '#4f7f80', '#9c6b4e'],
      mantles: ['#5e4632', '#3a2418', '#6b5a4a', '#3e6e66'],
      skins: ['#9c6a45', '#a87650', '#b5825a'],
      hair: ['#2b1a12', '#3a2418'],
      wraps: ['#d9c7a3', '#b5523b', '#4f7f80'],
    },
    groups: [
      { shape: 'rect', center: [-4.4, 0], size: [2.4, 4.6], count: 7, kneel: 0.6, children: 0.3 },
      { shape: 'rect', center: [10.5, 0], size: [2.4, 3.2], count: 4, kneel: 0.5 },
    ],
  },

  player: {
    fov: 48,
    start: [7.4, -2.3],
    lookAt: [2.2, -0.9],
    colors: { robe: '#4f7f80', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
