// Genesis 28:10-22: Jacob sleeps at Bethel with a stone for his pillow and dreams of a ladder set up to heaven, with angels ascending and descending.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeFigure } from '../engine/people.js';
import { FX_LAYER } from '../engine/renderer.js';
import { ANGEL, Batch, NIGHT_STYLE, ball, box, cyl, glow, makeRng, rocks, sleeper, stars } from './lib/ot-07-kit.js';

const FOOT = new THREE.Vector3(0, 0, -7);
const TOP = new THREE.Vector3(0, 92, -200);
const JACOB = [1.6, 1.4];

const JACOB_COLORS = { robe: '#8c5a3c', mantle: '#4f7f80', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' };

// Drawn as light on the effects layer so it glows without ink outlines.
function ladder(ctx) {
  const geos = [];
  const dir = TOP.clone().sub(FOOT);
  const len = dir.length();
  const tilt = Math.atan2(-dir.z, dir.y);
  const along = (t) => FOOT.clone().addScaledVector(dir, t);
  for (const side of [-1.3, 1.3]) {
    const mid = along(0.5);
    geos.push(cyl(0.12, 0.12, len, [mid.x + side, mid.y, mid.z], [-tilt, 0, 0], 6).toNonIndexed());
  }
  const rungs = Math.floor(len / 1.1);
  for (let i = 1; i < rungs; i++) {
    const p = along(i / rungs);
    geos.push(box(2.6, 0.14, 0.18, [p.x, p.y, p.z]).toNonIndexed());
  }
  for (const g of geos) for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  const mesh = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshBasicMaterial({ color: '#ffe9b0', fog: false, depthWrite: false }));
  mesh.layers.set(FX_LAYER);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  for (let i = 0; i < 14; i++) {
    const p = along(i / 14 + 0.02);
    glow(ctx, { pos: [p.x, p.y, p.z], size: 6 + i * 2.2, color: '#ffe6b0', opacity: 0.32, pulse: 0.05 });
  }
  return { dir, along };
}

function angels(ctx, { along }) {
  const rng = makeRng(28);
  // Fog would darken the far angels against the bright cloud.
  const clearMats = new Map();
  const list = Array.from({ length: 16 }, (_, i) => {
    const fig = makeFigure(ANGEL, ctx.kit, { glow: 0.65 });
    fig.scale.setScalar(1.1);
    fig.traverse((o) => {
      if (!o.material) return;
      if (!clearMats.has(o.material)) {
        const m = o.material.clone();
        m.fog = false;
        clearMats.set(o.material, m);
      }
      o.material = clearMats.get(o.material);
    });
    const climbing = i % 2 === 0;
    fig.rotation.y = climbing ? Math.PI : 0;
    ctx.scene.add(fig);
    const halo = glow(ctx, { pos: [0, 0, 0], size: 3.2, color: '#fff3d0', opacity: 0.6, pulse: 0 });
    return { fig, halo, climbing, t: i / 16 + rng() * 0.04, side: climbing ? -0.55 : 0.55 };
  });
  const p = new THREE.Vector3();
  const speed = 0.004;
  ctx.onFrame((t, dt) => {
    for (const a of list) {
      a.t = (a.t + (a.climbing ? speed : -speed) * dt + 1) % 1;
      p.copy(along(0.015 + a.t * 0.9));
      p.x += a.side;
      p.y += 0.1;
      const k = 1.1 + a.t * 5;
      a.fig.scale.setScalar(k);
      a.fig.position.copy(p);
      a.halo.position.set(p.x, p.y + k, p.z);
      a.halo.scale.setScalar(3.2 * k);
    }
  });
}

export default {
  title: "Genesis 28:10-22: Jacob's ladder",
  subtitle: 'Bethel, a stone for his pillow. Surely the Lord is in this place.',
  seed: 28,

  style: { ...NIGHT_STYLE, fog: { color: '#1e2648', near: 80, far: 650 } },

  sky: { zenith: '#060a22', mid: '#121a44', horizon: '#2a3466', ground: '#141826', glowColor: '#4a4a7a', glowDir: [0, 0.83, -0.55] },

  sun: {
    dir: [0.2, 0.7, -0.7],
    color: '#c8cff0',
    intensity: 1.0,
    hemi: { sky: '#4a5a9a', ground: '#3a2c30', intensity: 0.8 },
    shadowSize: 50,
  },

  ground: {
    size: 1400, segments: 260, flatRadius: 130, hillHeight: 30, undulation: 0.5,
    plaza: { center: [0, 0], size: [0.1, 0.1] },
    colors: { sand: '#8a7a62', dirt: '#76664e', grass: '#6a7050', grassDark: '#565c40', plaza: '#8a7a62', plazaLine: '#76664e', scorch: '#2a1a16', scorchEdge: '#4a3424', hill: '#5e5a50' },
  },

  mountains: { count: 30, distance: [440, 720], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#232846', '#1e2240', '#2a2e4e'] },

  objects: [],

  custom(ctx) {
    stars(ctx, { count: 3000, size: 1.6, seed: 4, minY: 0.02, color: '#e8ecff' });
    stars(ctx, { count: 200, size: 3, seed: 9, minY: 0.03, color: '#fff6dc' });
    const rig = ladder(ctx);
    angels(ctx, rig);
    glow(ctx, { pos: [TOP.x, TOP.y, TOP.z], size: 160, color: '#fff0c0', opacity: 0.85, pulse: 0.03 });

    const head = sleeper(ctx, { pos: JACOB, headDir: Math.PI / 2 + 0.2, colors: JACOB_COLORS });
    const b = new Batch(ctx);
    const hy = ctx.terrainHeight(...head);
    b.add('#8a8070', ball(0.42, [head[0] - 0.12, hy + 0.12, head[1]], [1.3, 0.6, 1]));
    b.add('#6b4a33', cyl(0.04, 0.04, 1.9, [JACOB[0] + 0.2, ctx.terrainHeight(...JACOB) + 0.05, JACOB[1] + 0.8], [0, 0.3, Math.PI / 2], 5));
    rocks(b, ctx, { ring: [4, 90], count: 220, size: [0.25, 1.6], colors: ['#6e665a', '#7e7464', '#5e584e'], avoid: (x, z) => Math.hypot(x - JACOB[0], z - JACOB[1]) < 3.5 || Math.abs(x) < 3 && z < -2 && z > -14 || Math.hypot(x - 3, z - 9) < 4 });
    b.flush();
    const lamp = new THREE.PointLight('#ffe6b0', 18, 30, 1.2);
    lamp.position.set(0, 5, -6);
    ctx.scene.add(lamp);
  },

  clouds: {
    layers: [
      { count: 22, center: [TOP.x, TOP.z], distance: [40, 140], height: [85, 110], size: [30, 60], color: '#fff2d0', shade: '#6a5a7a', drift: 0.003 },
      { count: 30, distance: [350, 700], height: [60, 160], size: [40, 90], color: '#3a4070', shade: '#14162a' },
    ],
  },

  light: {
    beams: [{ from: [TOP.x, TOP.y, TOP.z], to: { pos: [FOOT.x, 0.5, FOOT.z] }, width: [36, 7], color: '#fff2c9', intensity: 0.16, layers: 3, stripes: 18, fadeLow: 0.05 }],
    glows: [{ at: [FOOT.x, FOOT.z], lift: 0.6, size: 8, color: '#ffe0a0', opacity: 0.4 }],
  },

  player: {
    start: [4.4, 6.6],
    lookAt: [-0.6, -12],
    colors: { robe: '#7a6a52', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
