// Numbers 21:6-9: Moses sets a serpent of brass upon a pole; the bitten who look upon it live.
// x is east, z is south. The pole stands on a low rise north of the player, the camp all around.
import { Batch, DAY_STYLE, MOSES, PALETTE, camp, glow, lying, makeRng, person } from './lib/ot-19-kit.js';

const POLE = [0, -10];

function serpentGeo(THREE, { turns = 3.2, radius = 0.32, height = 2.6, base = 0, thick = 0.09 }) {
  const pts = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, base + t * height, Math.sin(a) * radius));
  }
  const last = pts[n];
  pts.push(new THREE.Vector3(last.x * 1.6, last.y + 0.35, last.z * 1.6 + 0.2));
  pts.push(new THREE.Vector3(last.x * 1.4, last.y + 0.55, last.z * 1.4 + 0.55));
  const body = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, thick, 6, false);
  const head = new THREE.SphereGeometry(0.24, 8, 6).scale(1, 0.7, 1.5).translate(last.x * 1.4, last.y + 0.58, last.z * 1.4 + 0.68);
  return [body, head];
}

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(23);

  // The rise, the pole and its crosspiece, and the serpent of brass.
  const py = ctx.terrainHeight(...POLE);
  b.add('#c8a478', new THREE.CylinderGeometry(3.5, 5.5, 1.0, 14).translate(POLE[0], py + 0.2, POLE[1]));
  ctx.addCollider({ x: POLE[0], z: POLE[1], hx: 3.8, hz: 3.8, rot: 0, top: py + 0.7, walkable: true });
  const top = py + 0.7;
  b.add('#6b4a33', new THREE.CylinderGeometry(0.11, 0.14, 6.4, 7).translate(POLE[0], top + 3.2, POLE[1]));
  for (const g of serpentGeo(THREE, { base: top + 2.6, height: 3.6, radius: 0.36, thick: 0.15, turns: 3.5 })) b.add('#e8a23c', g.translate(POLE[0], 0, POLE[1]), { emissive: '#7a4208' });
  ctx.addCollider({ x: POLE[0], z: POLE[1], hx: 0.3, hz: 0.3, rot: 0, top: top + 7 });
  ctx.exclude({ kind: 'circle', x: POLE[0], z: POLE[1], r: 4.4 });

  // Fiery serpents among the stones.
  const snake = (x, z, a, len, color) => {
    const y = ctx.terrainHeight(x, z) + 0.06;
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push(new THREE.Vector3(x + Math.sin(a) * t * len + Math.cos(a) * Math.sin(t * 9) * 0.18, y, z + Math.cos(a) * t * len - Math.sin(a) * Math.sin(t * 9) * 0.18));
    }
    b.add(color, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.05, 5, false), { cast: false });
    b.add(color, new THREE.SphereGeometry(0.075, 6, 4).scale(1, 0.6, 1.4).rotateY(a).translate(pts[8].x, y + 0.02, pts[8].z));
  };
  for (let i = 0; i < 55; i++) {
    const a = rng() * 6.28, r = 6 + rng() * 40;
    const x = POLE[0] + Math.sin(a) * r, z = POLE[1] + Math.cos(a) * r;
    if (ctx.blocked(x, z, 0.5)) continue;
    snake(x, z, rng() * 6.28, 0.9 + rng() * 0.6, rng() < 0.5 ? '#b5482c' : '#8a5a2c');
  }

  camp(b, ctx, { center: POLE, ring: [30, 160], count: 280, seed: 231, keepOut: [{ kind: 'rect', x: 0, z: 30, hx: 8, hz: 16 }] });
  b.flush();

  glow(ctx, { pos: [POLE[0], top + 5.4, POLE[1]], size: 5, color: '#ffd080', opacity: 0.5, pulse: 0.06 });

  person(ctx, { pos: [POLE[0] - 1.6, POLE[1] + 0.8], y: top, face: [0, 14], scale: 1.12, colors: { ...MOSES, arms: [0.35, 2.3] } });

  // The bitten, lying about the rise and lifting their heads to look upon the serpent.
  const pal = PALETTE;
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + rng() * 0.2;
    const r = 5.5 + rng() * 8;
    const x = POLE[0] + Math.sin(a) * r, z = POLE[1] + Math.cos(a) * r;
    if (ctx.blocked(x, z, 0.4) || (Math.abs(x) < 2.4 && z > 0)) continue;
    const colors = { robe: pal.robes[i % pal.robes.length], mantle: pal.mantles[(i * 5) % pal.mantles.length], skin: pal.skins[i % pal.skins.length], hair: pal.hair[i % 4], arms: [0.5, 0.2] };
    lying(ctx, { pos: [x, z], dir: Math.atan2(x - POLE[0], z - POLE[1]), colors, prop: 0.18 + rng() * 0.12 });
  }
}

export default {
  title: 'Numbers 21:6-9: The brass serpent',
  subtitle: 'Wilderness by the way of the Red Sea. Everyone that is bitten, when he looketh upon it, shall live',
  seed: 23,
  style: { ...DAY_STYLE, fog: { color: '#f0dcb4', near: 120, far: 1000 } },
  sky: { zenith: '#2f74a8', mid: '#7fb2cc', horizon: '#f6e2b4', ground: '#d9b98a', glowColor: '#fff6d8', glowDir: [0.3, 0.9, -0.3] },
  sun: { dir: [0.35, 0.9, 0.25], color: '#fff6e0', intensity: 2.9, hemi: { sky: '#dcecf0', ground: '#c09060', intensity: 1.05 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 180, hillHeight: 45, undulation: 0.35,
    plaza: { center: [0, 5000], size: [1, 1] },
    colors: { sand: '#e0b880', dirt: '#cc9a62', grass: '#b8a26a', grassDark: '#9c8858', plaza: '#e6d6b0', plazaLine: '#c7ab7c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c08a5a' },
  },
  mountains: { count: 30, distance: [480, 780], height: [50, 120], widthRatio: [1.8, 2.8], colors: ['#c48a5a', '#b07a52', '#a86c4c', '#c89a6a'] },
  objects: [
    { type: 'stones', count: 700, ring: [5, 160], size: [0.12, 0.5], colors: ['#c9a87a', '#b08a62', '#a8805c'] },
  ],
  custom,
  clouds: { layers: [{ count: 14, distance: [450, 800], height: [100, 180], size: [40, 70], color: '#fff8ea', shade: '#8a9ab0' }] },
  crowd: {
    seed: 23,
    minSpacing: 0.75,
    facing: [POLE[0], POLE[1]],
    colors: PALETTE,
    aisles: [{ from: [0, 30], to: [0, -4], width: 4.4 }],
    groups: [
      { center: POLE, radius: [15, 28], count: 320, children: 0.12, kneel: 0.35, facingJitter: 0.25 },
      { center: POLE, radius: [26, 36], count: 200, children: 0.12, kneel: 0.1, facingJitter: 0.4 },
    ],
  },
  player: {
    start: [0, 9],
    lookAt: POLE,
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
