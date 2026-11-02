// Enos 1:1-8: Enos kneels alone in the forest, praying from day into night, his hunting gear set aside.
import * as THREE from 'three';
import { BASE_STYLE, GROUND_COLORS, addMesh, glow, kneeling, stars, makeRng, between } from './lib/bom-13-kit.js';

const ENOS = [0, -5];
const GEAR = [2.4, -3.6];
const ENOS_COLORS = { robe: '#8c5a3c', mantle: '#6f8a6a', skin: '#a8724a', hair: '#3a2418' };

function gear(ctx) {
  const k = ctx.kit;
  const [gx, gz] = GEAR;
  const y = ctx.terrainHeight(gx, gz);
  const wood = k.toon('#6b4a33');
  const log = addMesh(ctx, new THREE.CylinderGeometry(0.28, 0.32, 3.4, 9), k.toon('#5a3e2b'));
  log.rotation.set(0, 0.5, Math.PI / 2);
  log.position.set(gx + 0.6, y + 0.25, gz - 0.4);
  ctx.addCollider({ x: gx + 0.6, z: gz - 0.4, hx: 1.7, hz: 0.3, rot: 0.5, top: y + 0.5 });

  const bow = new THREE.Group();
  const limb = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 6, 24, Math.PI * 0.75), wood);
  limb.rotation.z = -Math.PI * 0.375;
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.38, 4), k.toon('#efe3c2'));
  string.position.x = 0.29;
  bow.add(limb, string);
  bow.rotation.set(0, 0.5, 0.3);
  bow.position.set(gx + 0.1, y + 0.72, gz + 0.1);
  bow.traverse((m) => m.isMesh && (m.castShadow = true));
  ctx.scene.add(bow);

  const quiver = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8), k.toon('#9c6b4e'));
  quiver.add(tube);
  const rng = makeRng(14);
  for (let i = 0; i < 5; i++) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 4), k.toon('#d9c7a3'));
    const fx = (rng() - 0.5) * 0.1, fz = (rng() - 0.5) * 0.1;
    shaft.position.set(fx, 0.25, fz);
    const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.01), k.toon('#b5523b'));
    fletch.position.set(fx, 0.66, fz);
    quiver.add(shaft, fletch);
  }
  quiver.rotation.set(0.1, 0, -0.5);
  quiver.position.set(gx + 1.3, y + 0.55, gz + 0.05);
  quiver.traverse((m) => m.isMesh && (m.castShadow = true));
  ctx.scene.add(quiver);

  const pack = addMesh(ctx, new THREE.SphereGeometry(0.32, 10, 8), k.toon('#a87b4f'));
  pack.scale.set(1.2, 0.8, 1);
  pack.position.set(gx - 0.5, y + 0.22, gz + 0.5);
}

function moon(ctx) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(18, 32), new THREE.MeshBasicMaterial({ color: '#fff6dc', fog: false }));
  m.layers.set(1);
  const dir = new THREE.Vector3(0.55, 0.32, -0.77).normalize().multiplyScalar(1400);
  ctx.scene.add(m);
  const halo = glow(ctx, [0, 0, 0], 130, '#cfd6ff', 0.3, 0);
  ctx.onFrame((t, dt, camera) => {
    m.position.copy(camera.position).add(dir);
    m.lookAt(camera.position);
    halo.position.copy(m.position);
  });
}

export default {
  title: 'Enos 1:1-8: Enos prays in the forest',
  subtitle: 'Alone among the trees, from day into night',
  seed: 14,

  style: { ...BASE_STYLE, toonSteps: [0.35, 0.65, 1.0], lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [40, 260, 220, 0.4] }, fog: { color: '#5d557e', near: 30, far: 320 } },

  sky: { zenith: '#151c44', mid: '#4a4a7c', horizon: '#e8986a', ground: '#2e2a40', glowColor: '#ffc27a', glowDir: [-0.9, 0.08, 0.2] },

  sun: { dir: [-0.85, 0.32, 0.25], color: '#ffb27a', intensity: 1.5, hemi: { sky: '#7b7cb8', ground: '#3b2e3a', intensity: 1.4 }, shadowSize: 45 },

  ground: {
    size: 900, segments: 220, flatRadius: 60, hillHeight: 26, undulation: 0.35,
    plaza: { center: [0, 2000], size: [0, 0] },
    colors: { ...GROUND_COLORS, sand: '#6f7a4a', dirt: '#5e5638', grass: '#55703f', grassDark: '#3f5532', hill: '#3e5640' },
  },

  mountains: { count: 26, distance: [380, 640], height: [60, 140], widthRatio: [1.4, 2.4], colors: ['#3a3a5e', '#454670', '#33355a'] },

  objects: [
    { type: 'trees', count: 70, center: [0, 0], ring: [17, 30], height: [6, 11], broken: 0, fallen: 0.06, trunkColor: '#4a3426', leafColors: ['#2f5a48', '#3a6650', '#2a4f44', '#46704f'], seed: 3 },
    { type: 'trees', count: 520, center: [0, 0], ring: [30, 160], height: [7, 13], broken: 0.03, fallen: 0.04, trunkColor: '#4a3426', leafColors: ['#2f5a48', '#3a6650', '#2a4f44', '#46704f', '#24453e'], seed: 5 },
    { type: 'stones', count: 70, center: ENOS, ring: [3, 16], size: [0.08, 0.28], colors: ['#7d7a6e', '#6a665c', '#8a8576'] },
  ],

  custom(ctx) {
    kneeling(ctx, ENOS_COLORS, ENOS, { facing: [-20, -9], bow: 0.18 });
    gear(ctx);
    stars(ctx, { count: 700, minY: 0.3 });
    moon(ctx);
    let named = false;
    ctx.onFrame(() => {
      if (named) return;
      const p = document.querySelector('.hud-title p');
      if (p) p.textContent = 'Alone among the trees, from day into night';
      named = !!p;
    });
    const rng = makeRng(41);
    const ferns = [];
    for (let i = 0; i < 90; i++) {
      const a = rng() * 6.28, r = between(rng, [9, 18]);
      ferns.push([Math.sin(a) * r, Math.cos(a) * r]);
    }
    const geo = new THREE.SphereGeometry(0.6, 9, 6);
    geo.scale(1, 0.55, 1);
    const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), ferns.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const cols = ['#4f7a44', '#3f6a3e', '#5d8a4c'];
    ferns.forEach(([x, z], i) => {
      const s = between(rng, [0.6, 1.4]);
      m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z), z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(cols[i % 3]));
    });
    mesh.castShadow = true;
    ctx.scene.add(mesh);
  },

  light: {
    beams: [{ from: [ENOS[0] - 4, 60, ENOS[1] - 6], to: { at: ENOS, lift: 0.5 }, width: [7, 2.6], color: '#fff2c9', intensity: 0.14, layers: 2, stripes: 18, fadeLow: 0.08 }],
    glows: [{ at: ENOS, lift: 0.9, size: 5, color: '#ffe9b8', opacity: 0.4 }],
    pointLights: [{ at: ENOS, lift: 3, color: '#ffe6b0', intensity: 6, distance: 14 }],
  },

  clouds: {
    layers: [
      { count: 22, angle: [3.6, 5.6], distance: [380, 760], height: [60, 140], size: [40, 80], color: '#f2a27a', shade: '#40305a' },
      { count: 16, angle: [0.3, 3], distance: [380, 760], height: [100, 200], size: [50, 90], color: '#5c5a8a', shade: '#1c1e3c' },
    ],
  },

  player: {
    start: [2.2, 0.5],
    lookAt: [5, -9],
    colors: { robe: '#7a6a52', mantle: '#4f7f80', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
