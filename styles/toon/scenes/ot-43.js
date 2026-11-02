// Isaiah 6: the Lord upon a throne, high and lifted up, his train filling the temple, seraphim above, and the house filled with smoke.
// x is east, z is south. The throne stands at the north end of the hall. Isaiah stands near the player, a seraph bringing the live coal.
import * as THREE from 'three';
import { Batch, DAY_STYLE, attach, boxGeo, box, cyl, flames, glow, makeRng, person } from './lib/ot-38-kit.js';
import { makeFigure } from '../engine/people.js';

const THRONE = [0, -24];
const STEPS = { n: 12, rise: 0.36, run: 0.95, width: 14 };
const TOP = STEPS.n * STEPS.rise;
const ALTAR = [-8, -5];
const ISAIAH = [-3, -1];
const GOLD = '#e8c060';
const GOLD_EM = '#6a4a10';
const WHITE = '#fbf7ee';

function temple(b, ctx) {
  const [tx, tz] = THRONE;
  const front = tz + 3 + STEPS.n * STEPS.run;
  for (let k = 0; k < STEPS.n; k++) {
    const top = (k + 1) * STEPS.rise;
    const z = front - (k + 0.5) * STEPS.run;
    const w = STEPS.width - k * 0.4;
    b.add('#efe4cc', boxGeo(w, top + 0.4, STEPS.run, [tx, (top - 0.4) / 2, z], { uv: { su: 2 } }), { stone: true });
    ctx.addCollider({ x: tx, z, hx: w / 2, hz: STEPS.run / 2, rot: 0, top, walkable: true });
  }
  b.add('#efe4cc', boxGeo(STEPS.width, TOP + 0.4, 8, [tx, (TOP - 0.4) / 2, tz - 1], { uv: { su: 2 } }), { stone: true });
  ctx.addCollider({ x: tx, z: tz - 1, hx: STEPS.width / 2, hz: 4, rot: 0, top: TOP, walkable: true });

  // The throne itself.
  b.add(GOLD, box(6.2, 1.8, 3.6, [tx, TOP + 0.9, tz - 1.6]), { emissive: GOLD_EM });
  b.add(GOLD, box(6.2, 9.5, 0.7, [tx, TOP + 4.75, tz - 3.3]), { emissive: GOLD_EM });
  for (const s of [-1, 1]) b.add(GOLD, box(0.8, 2.9, 3.6, [tx + s * 3.1, TOP + 1.45, tz - 1.6]), { emissive: GOLD_EM });
  ctx.addCollider({ x: tx, z: tz - 1.8, hx: 3.2, hz: 2, rot: 0, top: TOP + 9 });

  // Great posts of the door and the colonnade of the house.
  const back = tz - 8;
  b.add('#a88a58', boxGeo(46, 36, 2, [0, 17.6, back], { uv: { su: 4 } }), { stone: true });
  b.add('#8c6a2a', boxGeo(46.4, 1.6, 2.4, [0, 30, back], { uv: { su: 6.4, sv: 1.6, oy: 0.8, local: true, flatCaps: true } }), { fret: GOLD });
  ctx.addCollider({ x: 0, z: back, hx: 23, hz: 1, rot: 0, top: 30 });
  for (const s of [-1, 1]) {
    b.add(GOLD, cyl(1.4, 1.6, 22, [s * 12, 11, back + 3], [0, 0, 0], 16), { emissive: GOLD_EM });
    b.add(GOLD, cyl(2.6, 1.4, 2, [s * 12, 22.5, back + 3], [0, 0, 0], 16), { emissive: GOLD_EM });
    ctx.addCollider({ x: s * 12, z: back + 3, hx: 1.6, hz: 1.6, rot: 0, top: 30 });
    for (let z = back + 12; z < 30; z += 9) {
      b.add('#efe4cc', cyl(0.9, 1.05, 18, [s * 15, 9, z], [0, 0, 0], 14), { stone: true });
      b.add(GOLD, cyl(1.6, 0.9, 1.2, [s * 15, 18.4, z], [0, 0, 0], 14), { emissive: GOLD_EM });
      b.add('#dcd0b4', box(2.6, 0.6, 2.6, [s * 15, 0.3, z]));
      ctx.addCollider({ x: s * 15, z, hx: 1.1, hz: 1.1, rot: 0, top: 30 });
    }
    b.add('#e6dac0', box(1.6, 1.6, 64, [s * 15, 19.6, 0]), { cast: false });
  }

  // The altar, with its coals.
  const [ax, az] = ALTAR;
  b.add(GOLD, box(2.4, 1.6, 2.4, [ax, 0.8, az]), { emissive: GOLD_EM });
  b.add(GOLD, box(2.8, 0.25, 2.8, [ax, 1.65, az]), { emissive: GOLD_EM });
  for (const [hx, hz] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) b.add(GOLD, cyl(0.02, 0.18, 0.4, [ax + hx, 1.95, az + hz], [0, 0, 0], 6), { emissive: GOLD_EM });
  const rng = makeRng(43);
  for (let i = 0; i < 14; i++) b.add('#ff7a2a', box(0.3, 0.2, 0.3, [ax + (rng() - 0.5) * 1.8, 1.85, az + (rng() - 0.5) * 1.8], [rng(), rng(), 0]), { glow: true });
  flames(ctx, [{ pos: [ax, 1.8, az], h: 0.9, w: 2 }, { pos: [ax + 0.5, 1.8, az + 0.3], h: 0.6, w: 1.5 }], { outer: '#ff9a3a', inner: '#ffe28a' });
  ctx.addCollider({ x: ax, z: az, hx: 1.4, hz: 1.4, rot: 0, top: 1.8 });
  ctx.exclude({ kind: 'circle', x: ax, z: az, r: 2.5 });
  glow(ctx, { pos: [ax, 2.2, az], size: 5, color: '#ffb060', opacity: 0.6, pulse: 0.08 });
}

// The train of his robe flows down the steps and spreads across the floor.
function train(ctx) {
  const [tx, tz] = THRONE;
  const z0 = tz + 0.2, z1 = 2;
  const segX = 24, segZ = 90;
  const g = new THREE.PlaneGeometry(1, 1, segX, segZ).rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i), v = p.getZ(i) + 0.5;
    const z = z0 + v * (z1 - z0);
    const w = 3.2 + Math.pow(v, 1.4) * 15;
    const x = tx + u * w;
    const ripple = 0.05 * Math.sin(u * 14 + v * 9) + (Math.abs(u) > 0.47 ? 0.06 : 0);
    p.setXYZ(i, x, ctx.groundHeight(x, z) + 0.05 + ripple, z);
  }
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, ctx.kit.toon(WHITE, { emissive: '#4a4438', side: THREE.DoubleSide }));
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}

function lord(ctx) {
  const [tx, tz] = THRONE;
  const fig = makeFigure({ robe: WHITE, mantle: '#f6f0e2', skin: WHITE, hair: WHITE, sash: '#f3e6c4', arms: [0.35, 0.7] }, ctx.kit, { glow: 0.85 });
  fig.scale.set(3.3, 3.1, 3.3);
  fig.position.set(tx, TOP + 0.4, tz - 1.2);
  ctx.scene.add(fig);
  glow(ctx, { pos: [tx, TOP + 4.2, tz - 0.5], size: 11, color: '#fff6dc', opacity: 0.5, pulse: 0.03 });
  glow(ctx, { pos: [tx, TOP + 5, tz - 1], size: 28, color: '#ffe8b0', opacity: 0.2, pulse: 0.02 });
  const l = new THREE.PointLight('#fff4dc', 25, 40, 1.2);
  l.position.set(tx, TOP + 5, tz + 4);
  ctx.scene.add(l);
}

let wingGeo = null;
function wing() {
  if (wingGeo) return wingGeo;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.5, 0.35, 1.6, 0.55, 2.4, 0.4);
  s.bezierCurveTo(2.2, 0.15, 2.3, -0.05, 2.0, -0.2);
  s.bezierCurveTo(1.6, -0.25, 1.7, -0.45, 1.3, -0.5);
  s.bezierCurveTo(0.9, -0.5, 0.9, -0.62, 0.5, -0.55);
  s.lineTo(0, 0);
  wingGeo = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false, curveSegments: 6 });
  return wingGeo;
}

// A seraph: a figure of light with six wings. Two cover the face, two the feet, and with two it flies.
function seraph(ctx, { pos, face, scale = 1.3, coal = false }) {
  const g = new THREE.Group();
  const body = makeFigure({ robe: '#ffe8b8', mantle: '#ffd890', skin: '#ffeccc', hair: '#ffe8b8', arms: coal ? [0.3, 1.3] : [0.2, 0.3] }, ctx.kit, { glow: 0.45 });
  g.add(body);
  const mat = ctx.kit.toon('#ffe6b0', { emissive: '#6a5a3a', side: THREE.DoubleSide });
  const pairs = [];
  const add = (y, base, spread) => {
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.15, y, -0.12);
      const m = new THREE.Mesh(wing(), mat);
      m.scale.set(s, 1, 1);
      m.castShadow = true;
      pivot.add(m);
      g.add(pivot);
      pairs.push({ pivot, s, base, spread });
    }
  };
  add(1.55, [0.2, -0.9, 0.5], 0);
  add(1.25, [0, -0.15, 0.25], 0.5);
  add(0.55, [-0.25, -0.9, -0.9], 0);
  if (coal) {
    const c = attach(ctx, body, new THREE.SphereGeometry(0.12, 8, 6), '#ff8a2a', { pos: [0, 1.2, 0.62], emissive: '#ff5a10' });
    attach(ctx, body, new THREE.CylinderGeometry(0.015, 0.015, 0.7, 4), '#c8a040', { pos: [0, 1.15, 0.4], rot: [Math.PI / 2 - 0.2, 0, 0] });
    c.castShadow = false;
    glow(ctx, { pos: [pos[0], pos[1] + 1.2 * scale, pos[2] + 0.6], size: 1.6, color: '#ff9a40', opacity: 0.9, pulse: 0.12 });
  }
  g.scale.setScalar(scale);
  g.position.set(...pos);
  g.rotation.y = Math.atan2(face[0] - pos[0], face[1] - pos[2]);
  ctx.scene.add(g);
  glow(ctx, { pos: [pos[0], pos[1] + 1.2 * scale, pos[2]], size: 4 * scale, color: '#fff2d0', opacity: 0.35, pulse: 0.05 });
  const ph = pos[0] * 0.7;
  ctx.onFrame((t) => {
    g.position.y = pos[1] + Math.sin(t * 1.3 + ph) * 0.25;
    for (const w of pairs) {
      const flap = w.spread ? Math.sin(t * 3 + ph) * w.spread : 0;
      w.pivot.rotation.set(w.base[0] + flap * 0.4, w.s * (w.base[1] + flap), w.s * w.base[2] + w.s * flap * 0.6, 'YXZ');
    }
  });
}

function haze(ctx) {
  const rng = makeRng(61);
  for (let i = 0; i < 22; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const x = side * (11 + rng() * 10), z = -36 + rng() * 50, y = 2 + rng() * 26;
    const s = glow(ctx, { pos: [x, y, z], size: 8 + rng() * 10, color: rng() < 0.5 ? '#f4ecda' : '#e6dcc8', opacity: 0.1 + rng() * 0.08, pulse: 0.05, additive: false });
    const vx = (rng() - 0.5) * 0.4;
    ctx.onFrame((t) => (s.position.x = x + Math.sin(t * 0.1 + i) * 2 + vx * Math.sin(t * 0.05)));
  }
}

function custom(ctx) {
  const b = new Batch(ctx);
  temple(b, ctx);
  b.flush();
  train(ctx);
  lord(ctx);
  const [tx, tz] = THRONE;
  seraph(ctx, { pos: [tx - 8.5, TOP + 3.6, tz + 1], face: [tx + 2, tz + 6], scale: 1.6 });
  seraph(ctx, { pos: [tx + 8.5, TOP + 4, tz + 1.5], face: [tx - 2, tz + 6], scale: 1.6 });
  seraph(ctx, { pos: [tx - 6, TOP + 7.6, tz - 1], face: [tx + 1, tz + 8], scale: 1.4 });
  seraph(ctx, { pos: [tx + 6, TOP + 8, tz - 0.5], face: [tx - 1, tz + 8], scale: 1.4 });
  seraph(ctx, { pos: [ISAIAH[0] + 0.3, 0.9, ISAIAH[1] - 1.6], face: [ISAIAH[0], ISAIAH[1]], scale: 1.05, coal: true });
  person(ctx, { pos: ISAIAH, face: [ISAIAH[0] + 0.3, ISAIAH[1] - 2], colors: { robe: '#c8a97a', mantle: '#5e4632', skin: '#a8724a', hair: '#3a2418', sash: '#8c3a3a', arms: [0.55, 1.1] } });
  haze(ctx);
}

export default {
  title: "Isaiah 6:1-8: Isaiah's vision in the temple",
  subtitle: 'The house filled with smoke. "Holy, holy, holy, is the Lord of hosts"',
  seed: 43,
  style: { ...DAY_STYLE, ink: '#4a3a28', fog: { color: '#efe2c4', near: 70, far: 320 }, lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [40, 200, 200, 0.4] } },
  sky: { zenith: '#a8854a', mid: '#d4b886', horizon: '#f0e2c0', ground: '#efe4cc', glowColor: '#fffaf0', glowDir: [0, 0.4, -1] },
  sun: { dir: [0.2, 1, 0.6], color: '#fff6e4', intensity: 1.3, hemi: { sky: '#fff2d8', ground: '#a8905e', intensity: 1.3 }, shadowSize: 60 },
  ground: {
    size: 600, segments: 120, flatRadius: 300, hillHeight: 0, undulation: 0,
    plaza: { center: [0, -6], size: [34, 70] },
    colors: { sand: '#efe4cc', dirt: '#e6dac0', grass: '#efe4cc', grassDark: '#e6dac0', plaza: '#e0cc9e', plazaLine: '#b89c6a', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#efe4cc' },
  },
  objects: [],
  custom,
  clouds: { layers: [{ count: 40, distance: [260, 600], height: [30, 140], size: [40, 80], color: '#fbf6ea', shade: '#c8b89a', drift: 0.003 }] },
  player: {
    start: [1.5, 6],
    lookAt: [0, -24],
    fov: 46,
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
