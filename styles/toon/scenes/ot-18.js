// Exodus 14: Israel goes through the midst of the sea on dry ground, the waters a wall on either hand,
// the pillar of fire standing behind them between the camp of Israel and the Egyptians.
// x is east, z is south. Israel walks north toward the far shore; the pillar stands at the south end.
import { Batch, DAY_STYLE, PALETTE, ball, box, cyl, flames, flock, glow, makeRng, person, stars, xf } from './lib/ot-13-kit.js';

const HALF = 16;
const WALL_H = 20;
const PILLAR = [0, 62];
const MOSES = [-3.2, -43.2];

function waterTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 256, 0, 0);
  grad.addColorStop(0, '#0e2f4a');
  grad.addColorStop(0.6, '#1f5f7e');
  grad.addColorStop(1, '#4fa0b8');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 256);
  g.strokeStyle = 'rgba(200,240,240,0.55)';
  g.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    const x = (i * 37) % 128, y = (i * 71) % 256;
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(x + 10, y - 20, x - 10, y - 40, x + 4, y - 60);
    g.stroke();
  }
  g.fillStyle = 'rgba(10,30,50,0.35)';
  for (let i = 0; i < 6; i++) g.fillRect((i * 23) % 128, 0, 6, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function custom(ctx) {
  const { THREE, kit } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(1418);

  // The walls of water on the right hand and on the left.
  const tex = waterTexture(THREE);
  tex.repeat.set(14, 1);
  const wallMat = kit.toon('#ffffff', { map: tex, emissive: '#0c2a3e', unique: true });
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(60, WALL_H + 4, 320), wallMat);
    w.position.set(s * (HALF + 30), WALL_H / 2 - 2, -40);
    w.receiveShadow = true;
    ctx.scene.add(w);
    ctx.addCollider({ x: s * (HALF + 30), z: -40, hx: 30, hz: 160, rot: 0, top: WALL_H });
    ctx.exclude({ kind: 'rect', x: s * (HALF + 29), z: -40, hx: 31, hz: 160 });
  }
  ctx.onFrame((t, dt) => (tex.offset.y -= dt * 0.04));

  // Foam churning along the crests, and spray at the foot of each wall.
  const foamGeo = new THREE.SphereGeometry(1, 8, 6);
  const foamN = 260;
  const foam = new THREE.InstancedMesh(foamGeo, kit.toon('#e8f6f6', { emissive: '#3a5a6a' }), foamN);
  const fd = Array.from({ length: foamN }, (_, i) => ({
    x: (i % 2 ? 1 : -1) * (HALF + 0.6 + rng() * 1.5),
    y: i % 4 < 2 ? WALL_H + rng() * 0.6 : 0.3 + rng() * 1.2,
    z: -200 + rng() * 320,
    s: i % 4 < 2 ? 1.2 + rng() * 1.4 : 0.6 + rng() * 0.8,
    ph: rng() * 6,
  }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  foam.castShadow = false;
  ctx.scene.add(foam);
  ctx.onFrame((t) => {
    fd.forEach((f, i) => {
      const k = 1 + 0.18 * Math.sin(t * 2 + f.ph);
      foam.setMatrixAt(i, m4.compose(v.set(f.x, f.y + 0.3 * Math.sin(t * 1.5 + f.ph), f.z), q, sc.set(f.s * k, f.s * 0.6 * k, f.s * 1.4)));
    });
    foam.instanceMatrix.needsUpdate = true;
  });

  // Open sea beyond the walls at the height of the heaped waters.
  for (const s of [-1, 1]) {
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), kit.toon('#1f5f7e', { emissive: '#0c2a3e' }));
    sea.position.set(s * (HALF + 60 + 300), WALL_H - 1, -40);
    ctx.scene.add(sea);
  }

  // The wet sea floor: puddles, weed and shells.
  for (let i = 0; i < 70; i++) {
    const x = (rng() - 0.5) * HALF * 1.8, z = -170 + rng() * 260;
    b.add(rng() < 0.6 ? '#2e5a6e' : '#3a6a7a', cyl(0.6 + rng() * 1.6, 0.6, 0.03, [x, ctx.terrainHeight(x, z) + 0.03, z], [0, 0, 0], 10), { cast: false });
  }
  for (let i = 0; i < 160; i++) {
    const x = (rng() - 0.5) * HALF * 1.9, z = -170 + rng() * 260;
    b.add(rng() < 0.5 ? '#4a6a3e' : '#5a5a3a', xf(new THREE.ConeGeometry(0.08, 0.5 + rng() * 0.6, 4), { pos: [x, ctx.terrainHeight(x, z) + 0.25, z], rot: [(rng() - 0.5) * 0.8, 0, (rng() - 0.5) * 0.8] }), { cast: false });
  }

  // The pillar of fire standing behind Israel.
  const py = ctx.terrainHeight(...PILLAR);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 4.2, 70, 14, 1, true), kit.basic('#ffb347', { transparent: true, opacity: 0.85, depthWrite: false }));
  core.position.set(PILLAR[0], py + 35, PILLAR[1]);
  ctx.scene.add(core);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.4, 72, 12, 1, true), kit.basic('#fff0b0'));
  inner.position.copy(core.position);
  ctx.scene.add(inner);
  const fl = [];
  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2, r = 3 + rng() * 2.5;
    fl.push({ pos: [PILLAR[0] + Math.sin(a) * r, py, PILLAR[1] + Math.cos(a) * r], h: 4 + rng() * 6, w: 5 + rng() * 4 });
  }
  flames(ctx, fl, { outer: '#ff8a2c', inner: '#ffe08a' });
  ctx.onFrame((t) => {
    core.rotation.y = t * 0.4;
    core.scale.x = core.scale.z = 1 + 0.06 * Math.sin(t * 3.3);
  });
  for (let k = 0; k < 6; k++) glow(ctx, { pos: [PILLAR[0], py + 6 + k * 11, PILLAR[1]], size: 30, color: '#ffb35a', opacity: 0.45, pulse: 0.06 });
  glow(ctx, { pos: [PILLAR[0], py + 4, PILLAR[1]], size: 60, color: '#ff9a40', opacity: 0.35, pulse: 0.04 });
  const fire = new THREE.PointLight('#ffb060', 900, 160, 1.3);
  fire.position.set(PILLAR[0], py + 14, PILLAR[1]);
  ctx.scene.add(fire);
  ctx.addCollider({ x: PILLAR[0], z: PILLAR[1], hx: 4, hz: 4, rot: 0, top: py + 70 });
  ctx.exclude({ kind: 'circle', x: PILLAR[0], z: PILLAR[1], r: 10 });

  // Egyptian chariots halted in the darkness behind the pillar.
  for (let i = 0; i < 6; i++) {
    const x = -12 + i * 5, z = 100 + (i % 2) * 4, y = ctx.terrainHeight(x, z);
    b.add('#3a2a22', box(1.6, 1, 1.2, [x, y + 1.0, z]));
    for (const s of [-1, 1]) b.add('#2b1a12', cyl(0.6, 0.6, 0.12, [x + s * 0.9, y + 0.6, z], [0, 0, Math.PI / 2], 10));
    b.add('#2b1a12', ball(0.5, [x, y + 1.3, z - 2.2], [0.6, 1, 1.6], 8));
  }

  // Moses at the head of the people, rod lifted over the sea.
  person(ctx, { pos: MOSES, face: [MOSES[0] + 1.5, MOSES[1] - 20], scale: 1.1, colors: { robe: '#8c5a3c', mantle: '#e3d6b8', skin: '#a8724a', hair: '#e6d8b8', sash: '#c8912e', arms: [0.4, 2.3] } });
  const my = ctx.terrainHeight(...MOSES);
  b.add('#6b4a33', cyl(0.045, 0.05, 2.4, [MOSES[0] + 0.15, my + 2.7, MOSES[1] - 0.25], [0.1, 0, -0.2], 6));
  ctx.exclude({ kind: 'circle', x: MOSES[0], z: MOSES[1], r: 3 });

  // Flocks driven through with the people.
  for (const [x, z, n] of [[8, -20, 16], [-9, 4, 14], [6, 26, 14]]) {
    flock(b, ctx, { center: [x, z], radius: 3.2, count: n, seed: x + z });
    ctx.exclude({ kind: 'circle', x, z, r: 3.8 });
  }
  // Bundles and kneading troughs carried on shoulders.
  for (let i = 0; i < 30; i++) {
    const x = (rng() - 0.5) * 26, z = -36 + rng() * 80;
    const y = ctx.terrainHeight(x, z);
    b.add(['#8c5a3c', '#c8a97a', '#5e4632'][i % 3], ball(0.32, [x, y + 0.25, z], [1.3, 0.8, 1], 7));
  }

  stars(ctx, { count: 700, color: '#f4f0ff', size: 2, minY: 0.3 });
  b.flush();
}

export default {
  title: 'Exodus 14:21-31: Crossing the Red Sea',
  subtitle: 'The midst of the sea, Israel on dry ground',
  seed: 14,
  style: { ...DAY_STYLE, fog: { color: '#1c2a40', near: 80, far: 600 }, grain: 0.06 },
  sky: { zenith: '#070b1e', mid: '#16223e', horizon: '#3a3a5a', ground: '#141a28', glowColor: '#5a3a3a', glowDir: [0, 0.2, 1] },
  sun: { dir: [-0.3, 0.8, -0.4], color: '#a8b8e0', intensity: 1.1, hemi: { sky: '#4a5a8a', ground: '#4a3a30', intensity: 0.85 }, shadowSize: 60 },
  ground: {
    size: 1000, segments: 200, flatRadius: 200, hillHeight: 8, undulation: 0.25,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#8a7a62', dirt: '#74684f', grass: '#7a7258', grassDark: '#5a5444', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6a6050' },
  },
  objects: [
    { type: 'stones', count: 500, ring: [0, 120], size: [0.1, 0.35], colors: ['#c9b8a0', '#e6d8c8', '#8a7a62', '#a89a80'] },
  ],
  custom,
  crowd: {
    seed: 14,
    minSpacing: 0.66,
    facing: [0, -400],
    colors: PALETTE,
    keepClear: [{ kind: 'circle', x: 2, z: -40, r: 6 }],
    groups: [
      { shape: 'rect', center: [0, 0], size: [HALF * 2 - 3, 80], count: 1500, children: 0.18, facingJitter: 0.35, lean: 0.12 },
      { shape: 'rect', center: [0, 48], size: [HALF * 2 - 3, 16], count: 220, children: 0.12, facingJitter: 0.35, lean: 0.12 },
    ],
  },
  player: {
    start: [1.6, -47.5],
    lookAt: [-1.2, 40],
    fov: 48,
    colors: { robe: '#a87b4f', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
