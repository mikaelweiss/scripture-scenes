// Genesis 11:1-9: the people build a tower of brick and slime on the plain of Shinar.
// Coordinates are meters. x is east, z is south. The tower stands north of the player.
import { BASE_STYLE, ROBES, THREE, Parts, between, figure, glow, makeRng, pick, smokeColumn, stair } from './lib/ot-01-kit.js';
import { boxGeo } from '../engine/util.js';

const TOWER = [0, -70];
const TIERS = [[56, 8], [48, 7], [40, 7], [32, 6], [25, 6], [19, 6]];
const BRICK = '#c8905a';
const BAND = '#8a5a36';

function tower(ctx) {
  const [tx, tz] = TOWER;
  const base = ctx.terrainHeight(tx, tz) - 0.2;
  const brick = ctx.kit.stoneMat(BRICK);
  const brickDark = ctx.kit.stoneMat('#b07a4a');
  const p = new Parts();
  const rng = makeRng(6);
  let y = base;
  const terraces = [];
  TIERS.forEach(([w, h], i) => {
    p.add(i % 2 ? brickDark : brick, boxGeo(w, h, w, [tx, y + h / 2, tz], { uv: { su: 2 } }));
    p.box(BAND, [w + 0.3, 0.5, w + 0.3], [tx, y + h - 0.25, tz]);
    const n = Math.floor(w / 5);
    for (let k = 0; k <= n; k++) {
      const o = -w / 2 + (k / n) * w;
      for (const [dx, dz, sx, sz] of [[o, w / 2, 1.1, 0.5], [o, -w / 2, 1.1, 0.5], [w / 2, o, 0.5, 1.1], [-w / 2, o, 0.5, 1.1]]) p.box('#b8804e', [sx, h - 0.6, sz], [tx + dx, y + (h - 0.6) / 2, tz + dz]);
    }
    ctx.addCollider({ x: tx, z: tz, hx: w / 2, hz: w / 2, rot: 0, top: y + h, walkable: i === 0 });
    y += h;
    terraces.push({ y, half: w / 2 });
    const next = TIERS[i + 1];
    if (next) {
      const run = (w - next[0]) / 2, rise = next[1];
      const steps = 14;
      for (let k = 0; k < steps; k++) p.box('#d8a870', [6, (rise / steps) * (k + 1), run / steps], [tx, y + ((rise / steps) * (k + 1)) / 2, tz + w / 2 - (k + 0.5) * (run / steps)]);
    }
  });

  // Unfinished top: ragged walls, scaffolding and a hoist.
  const top = terraces[terraces.length - 1];
  const tw = 14;
  for (const [dx, dz, w, d] of [[0, -tw / 2, tw, 1.2], [0, tw / 2, tw * 0.5, 1.2], [-tw / 2, 0, 1.2, tw], [tw / 2, -tw / 4, 1.2, tw / 2]]) {
    const h = between(rng, [2.5, 5]);
    p.add(brick, boxGeo(w, h, d, [tx + dx, top.y + h / 2, tz + dz], { uv: { su: 2 } }));
  }
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const r = 9.5;
    p.box('#8a6440', [0.3, 9, 0.3], [tx + Math.sin(a) * r, top.y + 4.5, tz + Math.cos(a) * r]);
  }
  for (const h of [3, 6, 8.8]) {
    for (const [dx, dz, w, d] of [[0, -9.5, 19, 0.25], [0, 9.5, 19, 0.25], [-9.5, 0, 0.25, 19], [9.5, 0, 0.25, 19]]) p.box('#a8865a', [w, 0.2, d], [tx + dx, top.y + h, tz + dz]);
  }
  p.box('#6b4a33', [0.5, 14, 0.5], [tx + 4, top.y + 7, tz + 2]);
  p.box('#6b4a33', [0.35, 0.35, 12], [tx + 4, top.y + 13.5, tz + 6], [-0.1, 0, 0]);
  p.box('#2b1a12', [0.06, 10, 0.06], [tx + 4, top.y + 8.5, tz + 11.6]);
  p.box(brick, [1.2, 0.8, 1.2], [tx + 4, top.y + 3.2, tz + 11.6]);

  // Grand stair from the plain up to the first terrace.
  const run = stair(ctx, p, { origin: [tx, tz, base], frontZ: TIERS[0][0] / 2 + 13.6, fromY: 0, toY: TIERS[0][1], width: 8, rise: 0.3, depth: 0.5, color: '#d8a870' });
  for (const side of [-1, 1]) p.add(brickDark, boxGeo(1.2, TIERS[0][1] * 0.6, run, [tx + side * 4.6, base + TIERS[0][1] * 0.3, tz + TIERS[0][0] / 2 + 13.6 - run / 2], { uv: { su: 2 } }));
  ctx.scene.add(p.group(ctx.kit));
  return terraces;
}

function terraceWorkers(ctx, terraces) {
  const rng = makeRng(33);
  terraces.slice(1).forEach((t, i) => {
    const n = 7 - i;
    for (let k = 0; k < n; k++) {
      const side = Math.floor(rng() * 4);
      const along = between(rng, [-t.half + 2, t.half - 2]);
      const off = t.half - 1.6 - 0 * i;
      const [dx, dz] = [[along, off], [off, along], [along, -off], [-off, along]][side];
      const x = TOWER[0] + dx, z = TOWER[1] + dz;
      if (Math.abs(dx) < 4 && dz > 0) continue;
      figure(ctx, { robe: pick(rng, ROBES.robes), mantle: pick(rng, ROBES.mantles), skin: pick(rng, ROBES.skins), hair: pick(rng, ROBES.wraps), sash: '#5e4632' }, [x, z], { y: t.y, facing: [TOWER[0], TOWER[1]], clear: 0 });
    }
  });
}

function brickyard(ctx) {
  const rng = makeRng(12);
  const p = new Parts();
  const brick = ctx.kit.stoneMat('#c08a58');
  for (let i = 0; i < 70; i++) {
    const x = between(rng, [-60, 60]), z = between(rng, [-30, 12]);
    if (Math.abs(x) < 7) continue;
    const y = ctx.terrainHeight(x, z);
    const h = between(rng, [0.6, 1.6]);
    const r = rng() * 0.3;
    const g = boxGeo(1.6, h, 1.2, [0, h / 2, 0], { uv: { su: 0.6 } });
    g.rotateY(r);
    g.translate(x, y, z);
    p.add(brick, g);
    ctx.addCollider({ x, z, hx: 0.8, hz: 0.6, rot: r, top: y + h });
  }
  for (let i = 0; i < 160; i++) {
    const x = between(rng, [-70, 70]), z = between(rng, [14, 40]);
    if (Math.abs(x) < 6) continue;
    p.box('#b88a60', [0.5, 0.12, 0.28], [x, ctx.terrainHeight(x, z) + 0.06, z], [0, rng() * 0.3, 0]);
  }
  ctx.scene.add(p.group(ctx.kit));
}

function kilns(ctx) {
  const dome = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = new Parts();
  for (const [x, z] of [[-34, 22], [38, 26], [-52, -6], [56, -4]]) {
    const y = ctx.terrainHeight(x, z);
    p.add('#a87a50', dome, { pos: [x, y - 0.2, z], scale: [3, 3.6, 3] });
    p.box('#2b1a12', [1.4, 1.4, 0.4], [x, y + 0.7, z + 2.8]);
    glow(ctx, [x, y + 0.8, z + 3.1], 3, '#ff9a40', 0.8, 0.1);
    smokeColumn(ctx, [x, y + 3.4, z], { count: 12, rise: 18, size: 0.9, drift: [8, 2], color: '#cfc8c0', shade: '#5a5260', seed: Math.abs(x) });
    ctx.addCollider({ x, z, hx: 3, hz: 3, rot: 0, top: y + 3.4 });
  }
  ctx.scene.add(p.group(ctx.kit));
}

function city(ctx) {
  const rng = makeRng(44);
  const p = new Parts();
  const walls = ['#d8b888', '#cfa878', '#e0c498'];
  for (let i = 0; i < 46; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * between(rng, [72, 150]), z = between(rng, [-110, 70]);
    const w = between(rng, [5, 9]), d = between(rng, [5, 8]), h = between(rng, [3, 5]);
    const r = (rng() - 0.5) * 0.3;
    const y = ctx.terrainHeight(x, z);
    p.box(pick(rng, walls), [w, h, d], [x, y + h / 2, z], [0, r, 0]);
    p.box('#a88458', [w + 0.4, 0.35, d + 0.4], [x, y + h + 0.1, z], [0, r, 0]);
    p.box('#2b1a12', [1, 1.9, 0.1], [x - Math.sin(r) * 0, y + 0.95, z + d / 2 + 0.03], [0, r, 0]);
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: r, top: y + h });
  }
  ctx.scene.add(p.group(ctx.kit));
}

export default {
  title: 'Genesis 11:1-9: The Tower of Babel',
  subtitle: 'Go to, let us build us a city and a tower, whose top may reach unto heaven',
  seed: 6,

  style: { ...BASE_STYLE, fog: { color: '#ecd4a8', near: 140, far: 1000 } },

  sky: { zenith: '#3f6e9a', mid: '#8ab0c0', horizon: '#f4dca8', ground: '#d8c08a', glowColor: '#fff0c8', glowDir: [0.6, 0.45, 0.4] },

  sun: { dir: [0.55, 0.7, 0.5], color: '#fff0d6', intensity: 2.6, hemi: { sky: '#d6e2e6', ground: '#b08a5a', intensity: 1.1 }, shadowSize: 100 },

  ground: {
    size: 1600, segments: 300, flatRadius: 260, hillHeight: 20, undulation: 0.25,
    plaza: { center: [0, -40], size: [44, 70] },
    colors: { sand: '#dcc390', dirt: '#c8a870', grass: '#b0a868', grassDark: '#8a8a52', plaza: '#d8b88a', plazaLine: '#b89868', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c0a878' },
  },

  mountains: { count: 22, distance: [700, 900], height: [40, 90], widthRatio: [2.4, 3.6], colors: ['#b8a890', '#a8a090', '#c0b098'] },

  objects: [
    { type: 'trees', count: 40, ring: [160, 320], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#6a8a4a', '#7a9a50', '#5a7a42'] },
    { type: 'stones', count: 200, ring: [10, 120], size: [0.12, 0.35], colors: ['#c8a878', '#b89868'] },
  ],

  custom(ctx) {
    const terraces = tower(ctx);
    terraceWorkers(ctx, terraces);
    brickyard(ctx);
    kilns(ctx);
    city(ctx);
    ctx.exclude({ kind: 'rect', x: 0, z: 0, hx: 4.5, hz: 60 });
  },

  clouds: {
    layers: [
      { count: 30, distance: [400, 900], height: [80, 200], size: [40, 90], color: '#fff6e4', shade: '#6a6a80' },
      { count: 8, center: TOWER, distance: [60, 140], height: [110, 140], size: [30, 50], color: '#fff8ec', shade: '#7a7a90', drift: 0.003 },
    ],
  },

  crowd: {
    seed: 6,
    minSpacing: 0.9,
    facing: TOWER,
    colors: ROBES,
    groups: [
      { shape: 'rect', center: [0, -14], size: [120, 40], count: 220, children: 0.06, facingJitter: 2.5 },
      { shape: 'rect', center: [0, 34], size: [140, 44], count: 170, children: 0.15, facingJitter: 3 },
      { center: TOWER, radius: [28.6, 31.5], count: 70, facingJitter: 3 },
      { center: TOWER, radius: [24.5, 27.5], count: 60, facingJitter: 3, insideClear: true },
    ],
  },

  player: {
    start: [6, 68],
    lookAt: [0, -40],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
