// Exodus 32:15-20: Moses comes down from Sinai with the tablets and sees the calf and the dancing.
// x is east, z is south. The calf stands in the middle of the camp; Sinai rises to the northwest.
import { Batch, DAY_STYLE, MOSES, PALETTE, attach, calf, camp, campfire, makeRng, peak, person, smoke, tablets } from './lib/ot-19-kit.js';
import { makeFigure } from '../engine/people.js';

const CALF = [0, -8];
const MOSES_AT = [-8, 9];
const DANCE_R = 7;

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(32);

  const top = peak(ctx, { pos: [-260, -420], radius: 160, height: 150 });
  smoke(ctx, { pos: [-260, top + 5, -420], count: 24, size: [24, 40], rise: 90, spread: 40, drift: [30, 10], speed: 0.02, color: '#d8d0d4', shade: '#5a5060', seed: 9 });

  // The calf on a stone plinth, and the altar built before it.
  const cy = ctx.terrainHeight(...CALF);
  b.add('#cdb48a', new THREE.BoxGeometry(2.8, 2.4, 3.8).translate(CALF[0], cy + 1.0, CALF[1]));
  b.add('#b89a70', new THREE.BoxGeometry(3.2, 0.4, 4.2).translate(CALF[0], cy + 0.1, CALF[1]));
  calf(b, ctx, { pos: CALF, y: cy + 2.2, rot: -0.1, scale: 2 });
  ctx.addCollider({ x: CALF[0], z: CALF[1], hx: 1.6, hz: 2.1, rot: 0, top: cy + 4 });
  ctx.exclude({ kind: 'circle', x: CALF[0], z: CALF[1], r: 3.2 });
  const altar = [CALF[0] + 2.2, CALF[1] + 4.2];
  const ay = ctx.terrainHeight(...altar);
  b.add('#a8906c', new THREE.BoxGeometry(1.8, 0.9, 1.8).translate(altar[0], ay + 0.45, altar[1]));
  campfire(b, ctx, { pos: [altar[0], altar[1] + 2.6], light: { color: '#ffa850', intensity: 8, distance: 14 } });
  ctx.addCollider({ x: altar[0], z: altar[1], hx: 0.9, hz: 0.9, rot: 0, top: ay + 0.9 });

  // Feast rugs with bowls and bread around the dancing ground.
  const rugColors = ['#b5523b', '#c8912e', '#4f7f80', '#8c5a3c', '#6f8a6a'];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rng() * 0.3;
    const r = 13 + rng() * 4;
    const x = CALF[0] + Math.sin(a) * r, z = CALF[1] + Math.cos(a) * r;
    if (Math.hypot(x - 4, z - 18) < 6 || Math.hypot(x - MOSES_AT[0], z - MOSES_AT[1]) < 5) continue;
    const y = ctx.terrainHeight(x, z);
    b.add(rugColors[i % rugColors.length], new THREE.BoxGeometry(2.6, 0.05, 1.6).rotateY(a).translate(x, y + 0.03, z), { cast: false });
    for (let k = 0; k < 4; k++) {
      const bx = x + (rng() - 0.5) * 1.8, bz = z + (rng() - 0.5) * 1;
      b.add(k % 2 ? '#e8d4a8' : '#9c5a3c', new THREE.SphereGeometry(0.16, 8, 5).scale(1, 0.5, 1).translate(bx, y + 0.1, bz));
    }
    ctx.exclude({ kind: 'circle', x, z, r: 1.4 });
  }

  // Moses on a rock at the edge of the camp, the tablets lifted to cast them down. Joshua beside him.
  const my = ctx.terrainHeight(...MOSES_AT);
  b.add('#a89070', new THREE.DodecahedronGeometry(2.6, 0).scale(1.2, 0.75, 1.1).translate(MOSES_AT[0], my, MOSES_AT[1]));
  ctx.addCollider({ x: MOSES_AT[0], z: MOSES_AT[1], hx: 2.6, hz: 2.2, rot: 0, top: my + 1.85, walkable: true });
  ctx.exclude({ kind: 'circle', x: MOSES_AT[0], z: MOSES_AT[1], r: 4 });

  camp(b, ctx, { center: CALF, ring: [24, 150], count: 300, seed: 211, keepOut: [{ kind: 'rect', x: 4, z: 30, hx: 9, hz: 18 }, { kind: 'circle', x: -40, z: -30, r: 20 }] });
  b.flush();

  const moses = person(ctx, { pos: MOSES_AT, y: my + 1.85, face: CALF, scale: 1.12, colors: { ...MOSES, arms: [0.25, 2.75] } });
  const t = tablets();
  attach(ctx, moses, t.geo.scale(1.4, 1.4, 1.4), t.color, { pos: [0, 1.7, 0.12], rot: [-0.2, 0, 0] });
  person(ctx, { pos: [MOSES_AT[0] - 1.5, MOSES_AT[1] - 1.2], y: my + 1.75, face: CALF, scale: 1.05, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e' } });

  // The ring of dancers circling the calf.
  const dancers = [];
  const robes = PALETTE.robes, mantles = PALETTE.mantles;
  const n = 26;
  for (let i = 0; i < n; i++) {
    const colors = {
      robe: robes[i % robes.length],
      mantle: mantles[(i * 3) % mantles.length],
      skin: PALETTE.skins[i % PALETTE.skins.length],
      hair: i % 3 ? PALETTE.hair[i % 4] : PALETTE.wraps[i % 5],
      arms: i % 2 ? [2.5, 0.4] : [1.2, 0.3],
    };
    const fig = makeFigure(colors, ctx.kit);
    ctx.scene.add(fig);
    dancers.push({ fig, a0: (i / n) * Math.PI * 2, r: DANCE_R + (i % 2) * 1.6, ph: rng() * 6 });
  }
  ctx.exclude({ kind: 'circle', x: CALF[0], z: CALF[1], r: DANCE_R + 2.6 });
  ctx.onFrame((time) => {
    for (const d of dancers) {
      const a = d.a0 + time * 0.35 * (d.r > DANCE_R ? -1 : 1);
      const x = CALF[0] + Math.sin(a) * d.r, z = CALF[1] + Math.cos(a) * d.r;
      d.fig.position.set(x, ctx.terrainHeight(x, z) + Math.abs(Math.sin(time * 5 + d.ph)) * 0.25, z);
      d.fig.rotation.y = a + (d.r > DANCE_R ? -Math.PI / 2 : Math.PI / 2) + Math.sin(time * 3 + d.ph) * 0.4;
    }
  });
}

export default {
  title: 'Exodus 32:15-20: The golden calf',
  subtitle: 'Moses comes down from the mount and sees the calf, and the dancing',
  seed: 21,
  style: DAY_STYLE,
  sky: { zenith: '#3a7fa8', mid: '#86b8c8', horizon: '#f2dcae', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [-0.4, 0.5, -0.7] },
  sun: { dir: [-0.5, 0.75, 0.4], color: '#fff2d8', intensity: 2.6, hemi: { sky: '#dcecf0', ground: '#b98a5a', intensity: 1.1 }, shadowSize: 70 },
  ground: {
    size: 1600, segments: 280, flatRadius: 200, hillHeight: 40, undulation: 0.25,
    plaza: { center: [0, -8], size: [22, 22] },
    colors: { sand: '#d8b47a', dirt: '#c49a62', grass: '#a8a466', grassDark: '#8a8a52', plaza: '#cfae7c', plazaLine: '#c4a070', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a8886a' },
  },
  mountains: { count: 30, distance: [520, 800], height: [60, 130], widthRatio: [1.6, 2.6], colors: ['#b8957a', '#a88570', '#9c8a74'] },
  objects: [
    { type: 'stones', count: 400, ring: [6, 160], size: [0.12, 0.45], colors: ['#c9a87a', '#b89a70', '#a8805c'] },
  ],
  custom,
  clouds: { layers: [{ count: 28, distance: [400, 800], height: [90, 180], size: [40, 80], color: '#fff6e6', shade: '#7f8aa8' }] },
  crowd: {
    seed: 21,
    minSpacing: 0.7,
    facing: CALF,
    colors: PALETTE,
    aisles: [{ from: [4, 34], to: [3, 6], width: 4 }],
    keepClear: [{ kind: 'circle', x: MOSES_AT[0], z: MOSES_AT[1], r: 6 }],
    groups: [
      { center: CALF, radius: [DANCE_R + 3.5, 22], angle: [0.7, Math.PI * 2 - 0.5], count: 240, children: 0.15, kneel: 0.15, lean: 0.12, facingJitter: 0.8 },
      { center: CALF, radius: [22, 40], count: 200, children: 0.15, facingJitter: 2 },
    ],
  },
  player: {
    start: [4, 17],
    lookAt: [-2, -8],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
