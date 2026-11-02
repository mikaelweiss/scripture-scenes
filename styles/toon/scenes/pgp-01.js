// Moses 1: Moses on an exceedingly high mountain beholds the earth and every particle of it.
// Coordinates are meters. x is east, z is south. The summit sits at y = 0 and the world falls away below.
import { BASE_STYLE, DIVINE, THREE, Parts, between, figure, glow, makeRng, motes, pick, unit } from './lib/pgp-01-kit.js';

const MOSES = [0, -9];
const EARTH = [0, 30, -460];
const EARTH_R = 78;

function earthTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#3f86a8';
  g.fillRect(0, 0, 512, 256);
  const rng = makeRng(8);
  const land = ['#7fa45a', '#a89058', '#6f9a50', '#c2a46a'];
  for (let k = 0; k < 9; k++) {
    const cx = rng() * 512, cy = 50 + rng() * 156, s = 30 + rng() * 50;
    g.fillStyle = pick(rng, land);
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      g.ellipse(cx + (rng() - 0.5) * s * 1.6, cy + (rng() - 0.5) * s, s * (0.2 + rng() * 0.4), s * (0.15 + rng() * 0.3), rng() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = '#f4f0e6';
  g.fillRect(0, 0, 512, 14);
  g.fillRect(0, 242, 512, 14);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath();
    g.ellipse(rng() * 512, 20 + rng() * 216, 18 + rng() * 30, 4 + rng() * 5, 0, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// The earth as Moses saw it in vision: a great globe in the heavens, every particle glittering.
function visionEarth(ctx) {
  const mat = ctx.kit.toon('#ffffff', { map: earthTexture(), emissive: new THREE.Color('#203040'), fog: false });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R, 48, 32), mat);
  earth.position.set(...EARTH);
  earth.rotation.z = 0.35;
  ctx.scene.add(earth);
  ctx.onFrame((t) => (earth.rotation.y = t * 0.03));
  glow(ctx, EARTH, EARTH_R * 2.5, "#bfe4ff", 0.22, 0.02);

  const rng = makeRng(5);
  const pts = [];
  for (let i = 0; i < 900; i++) {
    const v = new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize().multiplyScalar(EARTH_R * between(rng, [1.02, 1.5]));
    pts.push(EARTH[0] + v.x, EARTH[1] + v.y, EARTH[2] + v.z);
  }
  motes(ctx, pts, { color: '#fff4c8', size: 2.5 });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(EARTH_R * 1.35, 0.9, 6, 120), ctx.kit.toon('#fff1c0', { emissive: '#c8a050', fog: false }));
  ring.position.set(...EARTH);
  ring.rotation.set(1.25, 0.3, 0);
  ctx.scene.add(ring);
}

// Rocky crown of the summit: crags around the rim and boulders to walk among.
function summit(ctx) {
  const rng = makeRng(14);
  const p = new Parts();
  const rocks = ['#8a7a6c', '#7a6a60', '#9a8a78', '#6c5e56'];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + rng() * 0.15;
    if (Math.abs(Math.atan2(Math.sin(a + Math.PI), Math.cos(a + Math.PI))) < 0.7) continue;
    const r = between(rng, [15, 19]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const h = between(rng, [2, 7]);
    const w = between(rng, [2, 4.5]);
    const y = ctx.terrainHeight(x, z);
    p.add(pick(rng, rocks), unit.cone, { pos: [x, y + h / 2 - 0.5, z], rot: [(rng() - 0.5) * 0.3, rng() * 6, (rng() - 0.5) * 0.3], scale: [w, h, w * 0.8] });
    ctx.addCollider({ x, z, hx: w * 0.35, hz: w * 0.35, rot: 0, top: y + h });
  }
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2, r = between(rng, [4, 14]);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (Math.hypot(x - MOSES[0], z - MOSES[1]) < 4 || Math.hypot(x - 2, z - 5) < 4) continue;
    const s = between(rng, [0.4, 1.6]);
    p.add(pick(rng, rocks), unit.rock, { pos: [x, ctx.terrainHeight(x, z) + s * 0.2, z], rot: [rng() * 3, rng() * 3, rng() * 3], scale: [s * 1.4, s, s * 1.2] });
    if (s > 1.1) ctx.addCollider({ x, z, hx: s * 0.5, hz: s * 0.5, rot: 0, top: ctx.terrainHeight(x, z) + s * 0.6 });
  }
  ctx.scene.add(p.group(ctx.kit));
}

// Distant peaks and a sea of cloud far below the summit.
function lowlands(ctx) {
  const rng = makeRng(22);
  const geo = new THREE.ConeGeometry(1, 1, 8, 2);
  geo.translate(0, 0.5, 0);
  const n = 46;
  const mesh = new THREE.InstancedMesh(geo, ctx.kit.toon('#ffffff'), n);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.1;
    const d = between(rng, [380, 900]);
    const h = between(rng, [140, 260]);
    m.compose(new THREE.Vector3(Math.sin(a) * d, -330, Math.cos(a) * d), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 6, 0)), new THREE.Vector3(h * 1.6, h, h * 1.4));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.set(pick(rng, ['#8a8aa8', '#9a98b0', '#7e86a0', '#a8a4b8'])));
  }
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
}

export default {
  title: 'Moses 1: Moses sees the world',
  subtitle: 'Caught up into an exceedingly high mountain, he beheld the earth and every particle of it',
  seed: 101,

  style: { ...BASE_STYLE, fog: { color: '#e9d6b6', near: 160, far: 1000 } },

  sky: {
    zenith: '#2a3a78',
    mid: '#6f7fb8',
    horizon: '#f6dcae',
    ground: '#c8b8a8',
    glowColor: '#fff4d0',
    glowDir: [0, 0.12, -1],
  },

  sun: {
    dir: [0.3, 0.8, -0.5],
    color: '#fff2da',
    intensity: 2.5,
    hemi: { sky: '#d8dcf0', ground: '#8a7060', intensity: 1.1 },
    shadowSize: 60,
  },

  ground: {
    size: 1800,
    segments: 300,
    flatRadius: 16,
    hillHeight: -300,
    undulation: 1.4,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#a39280',
      dirt: '#8f7e6e',
      grass: '#8a9466',
      grassDark: '#6c7650',
      plaza: '#a39280',
      plazaLine: '#a39280',
      scorch: '#3a2a22',
      scorchEdge: '#6e4630',
      hill: '#a39280',
    },
  },

  objects: [],

  custom(ctx) {
    summit(ctx);
    lowlands(ctx);
    visionEarth(ctx);
    figure(ctx, { robe: '#b8a07a', mantle: '#6b4a33', skin: '#a8724a', hair: '#e8e2d6', sash: '#8c5a3c', arms: [0.9, 0.9] }, MOSES, { facing: [EARTH[0], EARTH[2]], scale: 1.2 });
    glow(ctx, [MOSES[0], 1.6, MOSES[1]], 4, '#fff0c0', 0.45);
    const rng = makeRng(3);
    const pts = [];
    for (let i = 0; i < 260; i++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 6;
      pts.push(MOSES[0] + Math.sin(a) * r, rng() * 2, MOSES[1] + Math.cos(a) * r);
    }
    motes(ctx, pts, { color: '#fff3c0', size: 2.4, rise: 0.8, span: 18 });
  },

  clouds: {
    layers: [
      { count: 70, distance: [90, 700], height: [-170, -110], size: [40, 90], color: '#fff6e6', shade: '#7a7090', drift: 0.003 },
      { count: 26, distance: [500, 900], height: [-60, 40], size: [50, 110], color: '#f6e4c8', shade: '#6a6080' },
      { count: 12, center: MOSES, distance: [50, 120], height: [130, 190], size: [30, 55], color: '#fffaf0', shade: '#8a80a0', drift: 0.004 },
    ],
  },

  light: {
    beams: [{ from: [0, 220, -12], to: { at: MOSES, lift: 1.4 }, width: [16, 5], color: '#fff2c9', intensity: 0.16, layers: 3, stripes: 24, fadeLow: 0.05 }],
    rayFans: [
      { source: [0, 260, -40], sourceJitter: 50, target: MOSES, groundY: 0, spread: [10, 30], count: 6, width: [[3, 6], [6, 10]], color: '#fff0c4', intensity: 0.18, stripes: 9, fadeLow: 0.3 },
    ],
    pointLights: [{ at: MOSES, lift: 2.5, color: '#ffe6b0', intensity: 10, distance: 18 }],
  },

  player: {
    start: [1.6, 1.6],
    lookAt: [0, -330],
    colors: { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#b5523b' },
  },
};
