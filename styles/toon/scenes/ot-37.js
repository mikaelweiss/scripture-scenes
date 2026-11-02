// Esther 5:1-2: Esther stands in the inner court of the king's house, and the king holds out the golden sceptre.
// x is east, z is south. A columned Persian hall; the throne on its dais at the north end, the player in the hall's south half.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Batch, PEOPLE, box, cyl, figure, fireSpots, flames, glow, makeRng, xf } from './lib/ot-31-kit.js';

const HALL = { x0: -19, x1: 19, z0: -26, z1: 24, h: 15 };
const KING = [0, -20.4];
const ESTHER = [0.15, -16.4];
const DAIS = { top: 1.35, front: -17.4 };

function custom(ctx) {
  const b = new Batch(ctx);
  const rng = makeRng(37);
  const kit = ctx.kit;
  const fret = new Batch(ctx);
  const { x0, x1, z0, z1, h } = HALL;

  // Walls of glazed brick with friezes; a doorway in the south wall.
  const wall = (cx, cz, w, d) => {
    b.add('#d8c8a8', box(w, h, d, [cx, h / 2 - 0.2, cz]));
    ctx.addCollider({ x: cx, z: cz, hx: w / 2, hz: d / 2, rot: 0, top: h });
    ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: w / 2 + 0.5, hz: d / 2 + 0.5 });
  };
  wall(x0 - 0.6, (z0 + z1) / 2, 1.2, z1 - z0 + 2.4);
  wall(x1 + 0.6, (z0 + z1) / 2, 1.2, z1 - z0 + 2.4);
  wall(0, z0 - 0.6, x1 - x0 + 2.4, 1.2);
  wall(-11.5, z1 + 0.6, 15, 1.2);
  wall(11.5, z1 + 0.6, 15, 1.2);
  b.add('#d8c8a8', box(8, h - 6, 1.2, [0, 6 + (h - 6) / 2, z1 + 0.6]));
  const band = (y, hh) => {
    const geos = [
      box(x1 - x0, hh, 0.1, [0, y, z0 + 0.06]),
      box(0.1, hh, z1 - z0, [x0 + 0.06, y, (z0 + z1) / 2]),
      box(0.1, hh, z1 - z0, [x1 - 0.06, y, (z0 + z1) / 2]),
    ];
    for (const g of geos) fret.add('fret', g, { cast: false });
  };
  band(2.2, 0.9);
  band(10.5, 1.2);
  // Glazed brick panel of lions behind the throne: blue field, gold figures.
  b.add('#2f5a8a', box(14, 7, 0.12, [0, 6, z0 + 0.1]), { cast: false });
  for (let i = 0; i < 4; i++) {
    const x = -5.1 + i * 3.4;
    b.add('#e0b040', box(2.2, 0.9, 0.08, [x, 5.6, z0 + 0.2]), { cast: false });
    b.add('#e0b040', box(0.6, 0.7, 0.08, [x + 1.1, 6.2, z0 + 0.2]), { cast: false });
    for (const lx of [-0.8, -0.3, 0.4, 0.9]) b.add('#e0b040', box(0.16, 0.8, 0.08, [x + lx, 4.8, z0 + 0.2]), { cast: false });
  }
  b.add('#e0b040', cyl(1.1, 1.1, 0.1, [0, 11.8, z0 + 0.2], [Math.PI / 2, 0, 0], 20), { cast: false });
  b.add('#e0b040', box(5, 0.5, 0.1, [0, 11.8, z0 + 0.22]), { cast: false });

  // A coffered ceiling of cedar that lets the sun's shadows through.
  const ceil = new THREE.Mesh(box(x1 - x0 + 2, 0.6, z1 - z0 + 2, [0, h + 0.1, (z0 + z1) / 2]), kit.toon('#6a4a30'));
  ctx.scene.add(ceil);
  for (let z = z0 + 3; z < z1; z += 6) b.add('#4a3020', box(x1 - x0, 0.8, 0.6, [0, h - 0.5, z]), { cast: false });

  // Columns with fluted shafts and double bull capitals.
  for (const cx of [-13, -7.5, 7.5, 13]) {
    for (let cz = z0 + 6; cz < z1 - 2; cz += 7) {
      b.add('#c8b08a', box(1.6, 0.5, 1.6, [cx, 0.25, cz]));
      b.add('#e6dcc4', cyl(0.42, 0.48, h - 2.6, [cx, (h - 2.6) / 2 + 0.4, cz], [0, 0, 0], 12));
      b.add('#c8b08a', cyl(0.7, 0.5, 0.6, [cx, h - 2.0, cz], [0, 0, 0], 12));
      for (const s of [-1, 1]) {
        b.add('#b8a07a', box(1.1, 1.2, 1.0, [cx + s * 0.7, h - 1.1, cz]));
        b.add('#b8a07a', box(0.5, 0.6, 0.9, [cx + s * 1.4, h - 0.9, cz]));
      }
      ctx.addCollider({ x: cx, z: cz, hx: 0.6, hz: 0.6, rot: 0, top: h });
      ctx.exclude({ kind: 'circle', x: cx, z: cz, r: 1.1 });
    }
  }

  // The dais and its steps.
  const dDepth = DAIS.front - z0;
  b.add('#e8dcc4', box(14, DAIS.top, dDepth, [0, DAIS.top / 2, z0 + dDepth / 2]));
  fret.add('fret', box(14.02, 0.35, dDepth + 0.02, [0, DAIS.top - 0.3, z0 + dDepth / 2]), { cast: false });
  ctx.addCollider({ x: 0, z: z0 + dDepth / 2, hx: 7, hz: dDepth / 2, rot: 0, top: DAIS.top, walkable: true });
  for (let i = 0; i < 3; i++) {
    const top = DAIS.top - (i + 1) * (DAIS.top / 4) + 0.02;
    const z = DAIS.front + 0.3 + i * 0.6;
    b.add('#ddd0b4', box(8 - i * 0.2, top, 0.6, [0, top / 2, z]));
    ctx.addCollider({ x: 0, z, hx: 4, hz: 0.3, rot: 0, top, walkable: true });
  }
  ctx.exclude({ kind: 'rect', x: 0, z: z0 + 5, hx: 7.5, hz: 6 });

  // The throne, its canopy, and the king seated with the sceptre held out.
  const [kx, kz] = KING;
  const ty = DAIS.top;
  b.add('#c8912e', box(1.6, 0.85, 1.2, [kx, ty + 0.42, kz]));
  b.add('#c8912e', box(1.6, 2.3, 0.2, [kx, ty + 1.6, kz - 0.6]));
  b.add('#e0b040', box(1.8, 0.2, 0.3, [kx, ty + 2.8, kz - 0.6]));
  for (const s of [-1, 1]) b.add('#e0b040', box(0.15, 0.5, 1.1, [kx + s * 0.78, ty + 1.05, kz]));
  b.add('#e0b040', box(1.0, 0.25, 0.7, [kx, ty + 0.12, kz + 1.0]));
  for (const [px, pz] of [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.6], [1.5, 1.6]]) b.add('#e0b040', cyl(0.07, 0.07, 4.2, [kx + px, ty + 2.1, kz + pz], [0, 0, 0], 6));
  b.add('#5a2a6a', box(3.4, 0.4, 3.2, [kx, ty + 4.3, kz + 0.2]));
  b.add('#e0b040', box(3.5, 0.15, 3.3, [kx, ty + 4.05, kz + 0.2]));
  const robe = '#4a2a6a';
  const king = figure(ctx, { pos: KING, y: ty + 0.85 - 0.62, facing: [kx, 0], scale: 1.1, clear: 0, colors: { robe, mantle: '#e8dcc4', skin: '#b5825a', hair: '#1f140e', sash: '#e0b040', arms: [0.25, 0.9] }, extras: { crown: '#e0b040' } });
  king.renderOrder = 1;
  b.add(robe, box(0.62, 0.3, 0.7, [kx, ty + 0.98, kz + 0.45]));
  b.add(robe, box(0.6, 0.85, 0.3, [kx, ty + 0.5, kz + 0.75]));
  const rod = new THREE.Mesh(cyl(0.055, 0.065, 2.3, [0, 1.15, 0], [0, 0, 0], 8), kit.toon('#f0c040', { emissive: '#6a4a10' }));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), kit.toon('#f0c040', { emissive: '#8a6a10' }));
  knob.position.y = 2.3;
  const sceptre = new THREE.Group();
  sceptre.add(rod, knob);
  sceptre.position.set(kx + 0.3, ty + 1.6, kz + 0.7);
  sceptre.rotation.x = 1.72;
  ctx.scene.add(sceptre);
  glow(ctx, [kx + 0.3, ty + 1.25, kz + 3.0], 1.8, '#ffe08a', 0.7, 0.12);
  glow(ctx, [kx, ty + 2, kz], 7, '#ffe6b0', 0.25, 0.04);

  // Esther in royal apparel, drawing near.
  figure(ctx, { pos: ESTHER, facing: KING, scale: 0.98, clear: 2, colors: { robe: '#e8e0f0', mantle: '#7a3a8a', skin: '#c08f66', hair: '#2b1a12', sash: '#e0b040', arms: [0.3, 1.0] }, extras: { crown: '#e0b040', veil: '#f4eedc' } });

  // Guards with spears beside the throne and along the aisle.
  const guard = { robe: '#2f5a8a', mantle: '#e0b040', skin: '#a87650', hair: '#1f140e', sash: '#7a3a2a', arms: [0.15, 0.3] };
  for (const s of [-1, 1]) {
    figure(ctx, { pos: [s * 4.2, -22.5], y: ty, facing: [s * 4.2, 0], colors: guard, extras: { spear: '#6a4a30', tallHat: '#e8dcc4', shield: '#c8912e' } });
    for (let i = 0; i < 4; i++) figure(ctx, { pos: [s * 4.6, -12 + i * 7], facing: [0, -12 + i * 7], colors: { ...guard, robe: i % 2 ? '#7a3a2a' : '#2f5a8a' }, extras: { spear: '#6a4a30', tallHat: '#e8dcc4' } });
  }

  // Bronze braziers burning incense.
  for (const [x, z] of [[-5, -15], [5, -15], [-5, 6], [5, 6]]) {
    b.add('#8a5a2a', cyl(0.12, 0.25, 1.1, [x, 0.55, z], [0, 0, 0], 8));
    b.add('#a86a2a', cyl(0.55, 0.3, 0.35, [x, 1.25, z], [0, 0, 0], 10));
    flames(ctx, fireSpots(rng, x, 1.35, z, 0.25, 4, [0.4, 0.8], 0.8));
    glow(ctx, [x, 1.9, z], 3, '#ffb860', 0.6, 0.1);
    const l = new THREE.PointLight('#ffb070', 8, 14, 1.5);
    l.position.set(x, 2.4, z);
    ctx.scene.add(l);
    ctx.addCollider({ x, z, hx: 0.5, hz: 0.5, rot: 0, top: 1.5 });
    ctx.exclude({ kind: 'circle', x, z, r: 1 });
  }

  // A long runner carpet down the aisle.
  b.add('#8a2a2a', box(3.2, 0.03, 30, [0, 0.02, 1]), { cast: false });
  b.add('#e0b040', box(3.6, 0.025, 30.2, [0, 0.015, 1]), { cast: false });

  b.flush();
  for (const s of fret.sets.values()) {
    const mesh = new THREE.Mesh(mergeGeometries(s.geos), kit.fretMat('#2f5a8a', '#e0b040'));
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }

  const fill = new THREE.PointLight('#fff0d0', 30, 60, 1.2);
  fill.position.set(0, 10, -6);
  ctx.scene.add(fill);
}

export default {
  title: 'Esther 5:1-2: Esther before the king',
  subtitle: 'Shushan the palace. The king held out to Esther the golden sceptre',
  seed: 37,

  style: {
    ink: '#24161a',
    toonSteps: [0.45, 0.75, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e8d8b8', near: 200, far: 1200 },
    crack: '#3a2418',
    ember: '#c8502c',
    emberHot: '#ffb347',
    flameOuter: '#f08a2c',
    flameInner: '#ffe08a',
    charred: '#3a2a22',
    smoke: '#b9aea8',
    smokeShade: '#3d3640',
  },

  sky: { zenith: '#2f6a9a', mid: '#7fb0c8', horizon: '#f3e0b8', ground: '#c8b08a', glowColor: '#fff4d8', glowDir: [0.5, 0.8, 0.3] },

  sun: { dir: [0.3, 0.9, 0.35], color: '#fff3dc', intensity: 1.6, hemi: { sky: '#f0e6d6', ground: '#b08a5a', intensity: 1.5 }, shadowSize: 50 },

  ground: {
    size: 1600,
    segments: 200,
    flatRadius: 300,
    hillHeight: 20,
    undulation: 0.0,
    plaza: { center: [0, -1], size: [38, 50] },
    colors: {
      sand: '#d8c8a8', dirt: '#e2d6bc', grass: '#d8c8a8', grassDark: '#c8b898', plaza: '#e0d0ae', plazaLine: '#a88e66',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#c8b898',
    },
  },

  objects: [],
  custom,

  crowd: {
    seed: 37,
    minSpacing: 0.75,
    facing: KING,
    colors: {
      robes: ['#2f5a8a', '#7a3a2a', '#c8912e', '#e8dcc4', '#5a2a6a', '#3e6e66', '#a8643a'],
      mantles: ['#e0b040', '#e8dcc4', '#2f5a8a', '#7a3a2a', '#3e6e66'],
      skins: PEOPLE.skins,
      hair: PEOPLE.hair,
      wraps: ['#e8dcc4', '#e0b040', '#2f5a8a', '#7a3a2a'],
    },
    groups: [
      { shape: 'rect', center: [-12, -4], size: [9, 22], count: 45, facingJitter: 0.4 },
      { shape: 'rect', center: [12, -4], size: [9, 22], count: 45, facingJitter: 0.4 },
    ],
  },

  player: { start: [2.4, -11.6], lookAt: [-1, -19.5], colors: { robe: '#a0825c', mantle: '#4f5a6b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' } },
};
