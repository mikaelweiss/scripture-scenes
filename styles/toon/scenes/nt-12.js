// Mark 2:1-12. A packed house in Capernaum: four friends open the roof and lower a palsied man before Jesus.
// x is east, z is south. The house stands north of the street, its street wall cut away to show the room.
import * as THREE from 'three';
import { JESUS, JUDEANS, FX_LAYER, addMesh, boxGeo, cyl, figure, glow, house, makeFigure, plankTexture, rod } from './lib/nt-07-kit.js';

const BASALT = '#7d766c';
const ROOM = { x0: -6, x1: 6, z0: -10.5, z1: -1.5, h: 4.2, t: 0.5 };
const HOLE = { x0: -0.9, x1: 0.9, z0: -7.2, z1: -5.2 };
const MAT_Y = 1.7;
const JESUS_AT = [-2.3, -8.3];

function room(ctx) {
  const { x0, x1, z0, z1, h, t } = ROOM;
  const y = ctx.terrainHeight(0, -6) - 0.05;
  const walls = [], wood = [], roof = [];
  const wall = (cx, cz, w, d, hh) => {
    walls.push(boxGeo(w, hh, d, [cx, y + hh / 2, cz], { uv: { su: 2.5 } }));
    ctx.addCollider({ x: cx, z: cz, hx: w / 2, hz: d / 2, rot: 0, top: y + hh });
  };
  wall(0, z0 - t / 2, x1 - x0 + 2 * t, t, h);
  wall(x0 - t / 2, (z0 + z1) / 2, t, z1 - z0, h);
  wall(x1 + t / 2, (z0 + z1) / 2, t, z1 - z0, h);
  wall((x0 - t + -1.2) / 2, z1 + t / 2, -1.2 - (x0 - t), t, 0.9);
  wall((1.2 + x1 + t) / 2, z1 + t / 2, x1 + t - 1.2, t, 0.9);
  for (const s of [-1, 1]) walls.push(boxGeo(t, h, t, [s * (x1 + t / 2), y + h / 2, z1 + t / 2]));

  const ry = y + h;
  const rx0 = x0 - t, rx1 = x1 + t, rz0 = z0 - t, rz1 = z1 - 1.5;
  roof.push(boxGeo(rx1 - rx0, 0.35, HOLE.z0 - rz0, [0, ry + 0.175, (rz0 + HOLE.z0) / 2]));
  roof.push(boxGeo(rx1 - rx0, 0.35, rz1 - HOLE.z1, [0, ry + 0.175, (HOLE.z1 + rz1) / 2]));
  roof.push(boxGeo(HOLE.x0 - rx0, 0.35, HOLE.z1 - HOLE.z0, [(rx0 + HOLE.x0) / 2, ry + 0.175, (HOLE.z0 + HOLE.z1) / 2]));
  roof.push(boxGeo(rx1 - HOLE.x1, 0.35, HOLE.z1 - HOLE.z0, [(HOLE.x1 + rx1) / 2, ry + 0.175, (HOLE.z0 + HOLE.z1) / 2]));
  for (let x = x0 + 0.6; x < x1; x += 1.4) if (x < HOLE.x0 - 0.1 || x > HOLE.x1 + 0.1) wood.push(boxGeo(0.22, 0.25, rz1 - z0, [x, ry - 0.12, (z0 + rz1) / 2]));
  wood.push(boxGeo(x1 - x0, 0.3, 0.3, [0, ry - 0.15, rz1]));
  const chunks = [];
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    chunks.push(new THREE.IcosahedronGeometry(0.16 + (k % 3) * 0.06, 0).translate(Math.cos(a) * 1.4, ry + 0.4, -6.2 + Math.sin(a) * 1.5));
  }
  for (let k = 0; k < 10; k++) chunks.push(new THREE.IcosahedronGeometry(0.1 + (k % 3) * 0.04, 0).translate(1.2 - k * 0.27, y + 0.08, -6.2 + Math.sin(k * 2.1) * 1.1));
  addMesh(ctx.scene, walls, ctx.kit.stoneMat(BASALT));
  addMesh(ctx.scene, wood, ctx.kit.toon('#5e4632', { map: plankTexture() }));
  addMesh(ctx.scene, roof, ctx.kit.toon('#a88a62'));
  addMesh(ctx.scene, chunks, ctx.kit.toon('#8c7458'));

  const stairs = [];
  for (let k = 0; k < 10; k++) {
    const top = ((k + 1) / 10) * h;
    stairs.push(boxGeo(1.1, top, 0.55, [x1 + t + 0.55, y + top / 2, z1 - 0.6 - k * 0.55]));
  }
  addMesh(ctx.scene, stairs, ctx.kit.stoneMat(BASALT));
  ctx.addCollider({ x: x1 + t + 0.55, z: z1 - 0.6 - 4.5 * 0.55, hx: 0.55, hz: 2.75, rot: 0, top: y + h });
  return { floor: y, roofTop: ry + 0.35 };
}

function shaft(ctx, floor, roofTop) {
  const h = roofTop - floor;
  const g = new THREE.BoxGeometry(HOLE.x1 - HOLE.x0, h, HOLE.z1 - HOLE.z0);
  g.translate(0, floor + h / 2, (HOLE.z0 + HOLE.z1) / 2);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#fff0c4', transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  m.layers.set(FX_LAYER);
  ctx.scene.add(m);
  const light = new THREE.PointLight('#ffe6b0', 10, 9);
  light.position.set(0, floor + 2.6, -7);
  ctx.scene.add(light);
}

export default {
  title: 'Mark 2:1-12: Lowered through the roof',
  subtitle: 'A house in Capernaum, so full there was no room about the door',
  seed: 212,

  style: {
    ink: '#2b1a12',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#e9dcc0', near: 90, far: 700 },
  },

  sky: { zenith: '#3a78a8', mid: '#8fbfd0', horizon: '#f2e2bc', ground: '#c9b898', glowColor: '#fff2cc', glowDir: [0.3, 0.8, -0.4] },

  sun: { dir: [0.35, 0.9, -0.3], color: '#fff2da', intensity: 2.5, hemi: { sky: '#dce8ec', ground: '#a08a6a', intensity: 1.25 }, shadowSize: 45 },

  ground: {
    size: 900,
    segments: 180,
    flatRadius: 60,
    hillHeight: 30,
    undulation: 0.05,
    plaza: { center: [0, 5], size: [44, 16] },
    colors: { sand: '#cdb58a', dirt: '#b89a70', grass: '#94a05e', grassDark: '#74843f', plaza: '#cbb894', plazaLine: '#9a8466', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8fa060' },
  },

  mountains: { count: 24, distance: [380, 560], height: [40, 90], widthRatio: [1.6, 2.6], colors: ['#8aa07a', '#7d9a7a', '#9aaa82'] },

  objects: [],

  custom(ctx) {
    const { floor, roofTop } = room(ctx);
    shaft(ctx, floor, roofTop);

    for (const [x, z, w, d, h, rot] of [[-14, -7, 8, 9, 3.6, 0], [15.5, -7, 7, 9, 3.8, 0], [-26, -6, 9, 8, 3.4, 0], [27, -6, 8, 8, 3.2, 0], [-12, 18, 9, 7, 3.6, Math.PI], [3, 19, 10, 7, 3.4, Math.PI], [17, 18, 8, 7, 3.8, Math.PI], [-26, 18, 8, 7, 3.2, Math.PI]]) {
      house(ctx, { pos: [x, z], size: [w, d], h, rot, color: BASALT, roof: '#a88a62', seed: Math.round(x) });
    }

    const mat = [boxGeo(0.95, 0.08, 2.1, [0, MAT_Y, -6.2])];
    for (const s of [-1, 1]) mat.push(cyl(0.04, 0.04, 2.2, s * 0.5, MAT_Y + 0.02, -6.2, { rx: Math.PI / 2 }, 5));
    addMesh(ctx.scene, mat, ctx.kit.toon('#c8a97a'));
    const man = makeFigure({ robe: '#e6d8b8', mantle: '#c8a97a', skin: '#a87650', hair: '#3a2418' }, ctx.kit);
    man.rotation.x = -Math.PI / 2;
    man.position.set(0, MAT_Y + 0.2, -5.4);
    man.scale.set(0.95, 0.95, 0.7);
    ctx.scene.add(man);

    const corners = [[-0.47, -7.2], [0.47, -7.2], [-0.47, -5.2], [0.47, -5.2]];
    const friends = [[-1.5, -7.9], [1.5, -7.9], [-1.5, -4.5], [1.5, -4.5]];
    const ropes = [];
    const friendColors = ['#8c5a3c', '#3e6e66', '#b5523b', '#c8912e'];
    friends.forEach(([x, z], i) => {
      figure(ctx, { robe: '#c8a97a', mantle: friendColors[i], skin: '#9c6a45', hair: '#2b1a12', sash: '#5e4632', arms: [0.2, 1.3] }, { pos: [x, z], y: roofTop, face: [0, -6.2], seated: true, clear: 0 });
      const [cx, cz] = corners[i];
      ropes.push(rod([x + (0 - x) * 0.35, roofTop + 0.7, z + (-6.2 - z) * 0.35], [cx, MAT_Y + 0.05, cz], 0.025, 4));
    });
    addMesh(ctx.scene, ropes, ctx.kit.toon('#d9c7a3'), { cast: false });

    figure(ctx, { ...JESUS, arms: [0.35, 0.9] }, { pos: JESUS_AT, y: floor, face: [0, -5.8], scale: 1.1, glow: 0.3, clear: 1.2 });
    glow(ctx, [JESUS_AT[0], floor + 1.4, JESUS_AT[1]], 4, '#fff0c8', 0.42);
    glow(ctx, [0, MAT_Y + 0.4, -6.2], 3, '#fff2cc', 0.25);
    const scribe = { robe: '#3a3a4a', mantle: '#5a4a6a', skin: '#a87650', hair: '#efe3c2', sash: '#c8912e' };
    for (const [x, z] of [[4.6, -9.4], [5.2, -8.2], [4.4, -7.0], [5.3, -5.8]]) figure(ctx, scribe, { pos: [x, z], y: floor, face: [0, -7.5], seated: true, clear: 0.6 });
  },

  crowd: {
    seed: 12,
    minSpacing: 0.6,
    facing: [0, -6.5],
    colors: JUDEANS,
    aisles: [{ from: [0, 9], to: [0, -1], width: 3.2 }],
    keepClear: [
      { kind: 'rect', x: -0.9, z: -7, hx: 2.6, hz: 3.0 },
      { kind: 'rect', x: 4.9, z: -7.6, hx: 1.1, hz: 2.6 },
      { kind: 'rect', x: -0.6, z: -2.6, hx: 1.6, hz: 1.4 },
    ],
    groups: [
      { shape: 'rect', center: [0, -6], size: [11.4, 8.4], count: 120, children: 0.1, facingJitter: 0.4 },
      { shape: 'rect', center: [0, 1.6], size: [16, 4.2], count: 50, children: 0.12, facing: [0, -5], facingJitter: 0.5 },
      { shape: 'rect', center: [0, 6], size: [24, 4], count: 30, children: 0.15, facing: [0, -5], facingJitter: 0.9 },
    ],
  },

  player: {
    start: [0.4, -1.6],
    lookAt: [-0.4, -8],
    fov: 42,
    colors: { robe: '#b5523b', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
