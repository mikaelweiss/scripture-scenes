// Alma 46:12-21: Captain Moroni raises the title of liberty, his rent coat on a pole.
// The people run together from the city to covenant, casting their rent garments at his feet.
import * as THREE from 'three';
import { add, armor, baseStyle, canvasTexture, clothes, groundColors, houses, person, spear } from './lib/bom-25-kit.js';
import { makeRng } from '../engine/util.js';

const MORONI = [0, -6];
const TOP = 1.2;
const POLE = 8.5;

function banner(ctx, base) {
  const tex = canvasTexture(512, 340, (g, w, h) => {
    g.fillStyle = '#e9dcc0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d6c4a0';
    for (let y = 0; y < h; y += 18) g.fillRect(0, y, w, 3);
    g.fillStyle = '#b5523b';
    g.fillRect(0, 0, w, 16);
    g.fillRect(0, h - 16, w, 16);
    g.fillStyle = '#2b1a12';
    g.textAlign = 'center';
    g.font = 'bold 38px Georgia, serif';
    const lines = ['In memory of our God,', 'our religion, and freedom,', 'and our peace, our wives,', 'and our children'];
    lines.forEach((l, i) => g.fillText(l, w / 2, 78 + i * 70));
  });
  const W = 3.8, Hh = 2.5;
  const geo = new THREE.PlaneGeometry(W, Hh, 20, 10).translate(W / 2, -Hh / 2, 0);
  const rest = geo.attributes.position.array.slice();
  const mat = new THREE.MeshToonMaterial({ map: tex, gradientMap: ctx.kit.gradient, side: THREE.DoubleSide });
  const cloth = new THREE.Mesh(geo, mat);
  cloth.castShadow = true;
  cloth.position.set(MORONI[0] + 0.45, base + POLE - 0.15, MORONI[1] + 0.1);
  cloth.rotation.y = -0.35;
  ctx.scene.add(cloth);
  const pos = geo.attributes.position;
  ctx.onFrame((t) => {
    for (let i = 0; i < pos.count; i++) {
      const x = rest[i * 3], y = rest[i * 3 + 1];
      const amp = x / W;
      pos.setZ(i, amp * 0.45 * Math.sin(x * 2.2 - t * 5.5) + amp * 0.12 * Math.sin(y * 3 + t * 3));
      pos.setY(i, y - amp * amp * 0.25 + amp * 0.05 * Math.sin(x * 3 - t * 6));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
}

function rally(ctx) {
  const k = ctx.kit;
  const rng = makeRng(30);
  const ground = ctx.terrainHeight(...MORONI) - 0.1;
  const base = ground + TOP;
  add(ctx, new THREE.CylinderGeometry(4.6, 5.0, TOP, 10).translate(0, TOP / 2, 0), k.stoneMat('#d8c095'), { pos: [MORONI[0], ground, MORONI[1]] });
  ctx.addCollider({ x: MORONI[0], z: MORONI[1], hx: 4.4, hz: 4.4, rot: 0, top: base, walkable: true });
  for (const rot of [0]) {
    for (let s = 0; s < 3; s++) {
      const h = (s + 1) * 0.4;
      const d = 4.95 + (2 - s) * 0.45 + 0.2;
      const sx = MORONI[0] + Math.sin(rot) * d, sz = MORONI[1] + Math.cos(rot) * d;
      add(ctx, new THREE.BoxGeometry(3.4, h, 0.5).translate(0, h / 2, 0), k.stoneMat('#cdb48a'), { pos: [sx, ground, sz], rotY: rot });
      ctx.addCollider({ x: sx, z: sz, hx: 1.7, hz: 0.25, rot, top: ground + h, walkable: true });
    }
  }

  const moroni = person(ctx, { robe: '#b5523b', mantle: '#7a3a2a', skin: '#b5825a', hair: '#3a2418', sash: '#d9a441', arms: [2.65, 0.15] }, MORONI, [0, 30], { y: base, scale: 1.12, clear: 4.8 });
  armor(ctx, moroni, { metal: '#c9b48a', crest: '#efe3c2' });
  add(ctx, new THREE.CylinderGeometry(0.06, 0.07, POLE + 0.5, 6).translate(0, (POLE + 0.5) / 2, 0), k.toon('#6b4a33'), { pos: [MORONI[0] + 0.42, base - 0.2, MORONI[1] + 0.1] });
  add(ctx, new THREE.SphereGeometry(0.12, 8, 6), k.toon('#d9a441'), { pos: [MORONI[0] + 0.42, base + POLE + 0.35, MORONI[1] + 0.1] });
  banner(ctx, base);

  // Rent garments cast at Moroni's feet.
  const cloth = new THREE.BoxGeometry(1, 0.06, 1);
  const cols = ['#d9c7a3', '#b5523b', '#8c5a3c', '#4f7f80', '#c8912e', '#e6d8b8', '#6f8a6a', '#a87b4f'];
  for (let i = 0; i < 70; i++) {
    const a = (rng() - 0.5) * 2.2, r = 5.3 + rng() * 2.2;
    const x = MORONI[0] + Math.sin(a) * r, z = MORONI[1] + Math.cos(a) * r;
    const m = add(ctx, cloth, k.toon(cols[i % cols.length]), { pos: [x, ctx.terrainHeight(x, z) + 0.04 + rng() * 0.12, z], rotY: rng() * 3, cast: false });
    m.scale.set(0.6 + rng() * 0.6, 1, 0.4 + rng() * 0.5);
    m.rotation.x = (rng() - 0.5) * 0.3;
  }

  // Soldiers standing with Moroni.
  for (const [x, z] of [[-2.6, -8.2], [2.6, -8.4], [-3.4, -5.8], [3.4, -6.2], [-1.2, -9.4], [1.4, -9.6]]) {
    const g = person(ctx, { robe: '#7a6a52', mantle: '#b5523b', skin: '#9c6a45', hair: '#2b1a12' }, [x, z], [x * 2, 20], { y: base, clear: 0.6 });
    armor(ctx, g);
    spear(ctx, g, { side: x < 0 ? -1 : 1 });
  }

  // People running in from the city, some with garments held up.
  const runners = [];
  const pick = (l) => l[Math.floor(rng() * l.length)];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 + rng() * 0.15;
    const arms = rng() < 0.4 ? [2.3, 0.4] : [0.35, -0.5];
    const fig = person(ctx, { robe: pick(clothes.robes), mantle: pick(clothes.mantles), skin: pick(clothes.skins), hair: pick(clothes.hair), arms }, [0, 0], null, { clear: 0, y: 0 });
    fig.scale.setScalar(0.95 + rng() * 0.1);
    runners.push({ fig, a, phase: rng(), speed: 0.045 + rng() * 0.02 });
  }
  ctx.onFrame((t) => {
    for (const r of runners) {
      const life = (t * r.speed + r.phase) % 1;
      const d = 70 - life * 39;
      const x = MORONI[0] + Math.sin(r.a) * d, z = MORONI[1] + Math.cos(r.a) * d;
      const bob = Math.abs(Math.sin(t * 11 + r.phase * 20)) * 0.12;
      r.fig.position.set(x, ctx.terrainHeight(x, z) + bob, z);
      r.fig.rotation.set(0.18, r.a + Math.PI, Math.sin(t * 11 + r.phase * 20) * 0.06, 'YXZ');
      r.fig.visible = life < 0.97;
    }
  });
}

export default {
  title: 'Alma 46:12-21: The Title of Liberty',
  subtitle: 'Captain Moroni raises his rent coat, and the people run to covenant',
  seed: 46,

  style: { ...baseStyle, fog: { color: '#ecd8b0', near: 140, far: 1100 } },

  sky: { zenith: '#27628a', mid: '#6fa4b8', horizon: '#f4d8a0', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [0.5, 0.45, -0.6] },

  sun: { dir: [0.55, 0.7, 0.45], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d6e8ee', ground: '#b07a52', intensity: 1.15 }, shadowSize: 70 },

  ground: { size: 1600, segments: 300, flatRadius: 150, hillHeight: 40, undulation: 0.3, plaza: { center: [0, -6], size: [70, 60] }, colors: groundColors },

  mountains: { count: 32, distance: [520, 800], height: [80, 180], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid',
      pos: [-70, -95],
      rot: 0.35,
      base: [44, 44],
      tiers: 5,
      tierHeight: 3.8,
      inset: 3,
      stair: { width: 9, extra: 3, rise: 0.42 },
      shrine: { size: [12, 9, 6], comb: 3.5 },
      colors: { stone: '#e3cfa6', stair: '#d8c095', shrine: '#b5523b', interior: '#2b1a12', fret: ['#b5523b', '#efe3c2'], roofFret: ['#2f8f8a', '#efe3c2'] },
    },
    { type: 'trees', count: 100, ring: [80, 240], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  custom(ctx) {
    rally(ctx);
    houses(ctx, { center: MORONI, ring: [52, 125], count: 50, colors: ['#e3cfa6', '#d6bf95', '#cdb48a', '#e8d6ae'], roof: '#8c5a3c', seed: 46, avoid: (x, z) => Math.hypot(x + 70, z + 95) < 42 });
  },

  clouds: {
    layers: [
      { count: 46, distance: [350, 800], height: [80, 190], size: [40, 95], color: '#fff6e4', shade: '#5a6a82', drift: 0.004 },
    ],
  },

  light: {
    glows: [{ at: MORONI, lift: TOP + POLE - 0.8, size: 6, color: '#fff3d0', opacity: 0.22 }],
  },

  crowd: {
    seed: 30,
    minSpacing: 0.62,
    facing: MORONI,
    colors: clothes,
    aisles: [{ from: [0, 40], to: [0, -1], width: 4 }],
    keepClear: [{ kind: 'circle', x: MORONI[0], z: MORONI[1], r: 7.6 }],
    groups: [
      { center: MORONI, radius: [7.6, 30], angle: [-2.3, 2.3], count: 1100, kneel: 0.18, children: 0.1, lean: 0.1 },
      { center: MORONI, radius: [7.6, 22], angle: [2.3, 3.98], count: 200, kneel: 0.1 },
    ],
  },

  player: {
    start: [0, 7],
    lookAt: [0, -6],
    colors: { robe: '#4f7f80', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
