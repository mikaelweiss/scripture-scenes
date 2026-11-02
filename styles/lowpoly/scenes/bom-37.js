// Helaman 13-16: Samuel the Lamanite stands on the wall of Zarahemla and prophesies.
// The people inside the city throw stones and shoot arrows, and none of them can hit him.
// Coordinates are meters. The wall runs east-west at z = WALL_Z, the city lies to the south (+z).
import * as THREE from 'three';
import { figure, house, arrowGeometry, banner } from './lib/bom-37-kit.js';

const WALL_Z = -30;
const WALL_H = 6.5;
const WALL_T = 3.2;
const SAMUEL = [0, WALL_Z];

const plaster = '#d2bd96';
const wallStone = '#a8916f';

const palette = {
  robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#d8cdb5', '#4f5a6b', '#9a4a34', '#e2d6bc'],
  mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#6d3b2e', '#2f4a5a', '#7a2f2a'],
  skins: ['#b07f58', '#a87652', '#c08c63', '#9b6a46'],
  mantleChance: 0.65,
  hoodChance: 0.2,
};

function cityWall(ctx) {
  const { solid, colliders } = ctx;
  const len = 300;
  const seg = 6;
  for (let x = -len / 2; x < len / 2; x += seg) {
    const cx = x + seg / 2;
    solid.box(seg + 0.02, WALL_H, WALL_T, { position: [cx, WALL_H / 2 - 0.3, WALL_Z], color: wallStone, jitter: 0.06 });
    colliders.add({ x: cx, z: WALL_Z, w: seg, d: WALL_T, bottom: -1, top: WALL_H - 0.3 });
    solid.box(seg + 0.1, 0.4, WALL_T + 0.3, { position: [cx, WALL_H * 0.72, WALL_Z], color: '#8c765c', jitter: 0.04 });
  }
  for (let x = -len / 2 + 1; x < len / 2; x += 2.4) {
    if (Math.abs(x) < 3.2) continue;
    for (const side of [-1, 1]) solid.box(1.3, 1.1, 0.6, { position: [x, WALL_H + 0.25, WALL_Z + side * (WALL_T / 2 - 0.3)], color: wallStone, jitter: 0.07 });
  }
  for (const tx of [-46, 46, -120, 120]) {
    const h = WALL_H + 5;
    solid.box(9, h, 9, { position: [tx, h / 2 - 0.3, WALL_Z], color: wallStone });
    colliders.add({ x: tx, z: WALL_Z, w: 9, d: 9, bottom: -1, top: h });
    solid.box(9.8, 0.6, 9.8, { position: [tx, h - 0.1, WALL_Z], color: '#8c765c' });
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
      solid.box(1.4, 1.2, 0.6, { position: [tx - 3.3 + i * 2.2, h + 0.6, WALL_Z + s * 4.5], color: wallStone });
      solid.box(0.6, 1.2, 1.4, { position: [tx + s * 4.5, h + 0.6, WALL_Z - 3.3 + i * 2.2], color: wallStone });
    }
    solid.box(1.6, 2.4, 0.1, { position: [tx, 1.0, WALL_Z + 4.55], color: '#2e241c', jitter: 0 });
  }
  // Courses of stone on the city face so the wall reads as built, not cast.
  for (let i = 0; i < 260; i++) {
    const x = ctx.rand.range(-len / 2, len / 2), row = Math.floor(ctx.rand() * 5);
    solid.box(ctx.rand.range(1.2, 2.6), 1.1, 0.12, { position: [x, row * 1.2 + 0.6, WALL_Z + WALL_T / 2 + 0.03], color: ctx.rand.pick(['#9a8466', '#b49c78', '#8e7a5e', '#a08a6c']), jitter: 0.05 });
  }
  for (let row = 1; row < 5; row++) {
    solid.box(len, 0.06, 0.08, { position: [0, row * 1.2, WALL_Z + WALL_T / 2 + 0.02], color: '#7c6850', jitter: 0 });
  }
}

// Arrows and stones fly from the crowd and pass Samuel on every side.
function missiles(ctx, samuelTop) {
  const { THREE: T, scene, rand } = ctx;
  const arrows = 40;
  const arrowMesh = new T.InstancedMesh(arrowGeometry(0.9), new T.MeshLambertMaterial({ color: '#4a3a2a' }), arrows);
  const flights = Array.from({ length: arrows }, () => {
    const start = new T.Vector3(rand.range(-14, 14), 1.6, rand.range(-14, 4));
    const side = rand.sign();
    const miss = new T.Vector3(SAMUEL[0] + side * rand.range(0.6, 2.0), samuelTop + rand.range(-0.8, 2.0), SAMUEL[1]);
    const end = miss.clone().add(miss.clone().sub(start).setY(0).normalize().multiplyScalar(rand.range(10, 25))).setY(miss.y + rand.range(-2, 3));
    return { start, end, arc: rand.range(1.5, 4), phase: rand(), dur: rand.range(1.3, 2.0) };
  });
  const stones = 10;
  const stoneMesh = new T.InstancedMesh(new T.DodecahedronGeometry(0.16, 0), new T.MeshLambertMaterial({ color: '#8a7a68', flatShading: true }), stones);
  const throws = Array.from({ length: stones }, () => {
    const start = new T.Vector3(rand.range(-10, 10), 1.8, rand.range(-22, -10));
    const hit = new T.Vector3(SAMUEL[0] + rand.range(-3, 3), rand.range(WALL_H - 3, WALL_H - 0.6), WALL_Z + WALL_T / 2 + 0.2);
    return { start, hit, arc: rand.range(2, 4), phase: rand(), dur: rand.range(1.6, 2.4) };
  });
  const m = new T.Matrix4(), p = new T.Vector3(), ahead = new T.Vector3(), q = new T.Quaternion(), one = new T.Vector3(1, 1, 1), zero = new T.Vector3(0, 0, 0);
  const look = new T.Matrix4(), up = new T.Vector3(0, 1, 0);
  const arcPoint = (out, a, b, h, f) => out.lerpVectors(a, b, f).setY(a.y + (b.y - a.y) * f + Math.sin(Math.PI * f) * h);
  const update = (t) => {
    flights.forEach((fl, i) => {
      const cycle = fl.dur * 2.2;
      const f = ((t + fl.phase * cycle) % cycle) / fl.dur;
      if (f > 1) return arrowMesh.setMatrixAt(i, m.makeScale(0, 0, 0));
      arcPoint(p, fl.start, fl.end, fl.arc, f);
      arcPoint(ahead, fl.start, fl.end, fl.arc, Math.min(1.01, f + 0.01));
      look.lookAt(ahead, p, up);
      q.setFromRotationMatrix(look);
      arrowMesh.setMatrixAt(i, m.compose(p, q, one));
    });
    throws.forEach((th, i) => {
      const cycle = th.dur * 2.5;
      const f = ((t + th.phase * cycle) % cycle) / th.dur;
      if (f > 1.35) return stoneMesh.setMatrixAt(i, m.compose(p.set(0, -50, 0), q.identity(), zero));
      if (f <= 1) arcPoint(p, th.start, th.hit, th.arc, f);
      else p.copy(th.hit).setY(Math.max(0.15, th.hit.y - ((f - 1) * th.dur * 6) ** 2 * 0.5)).setZ(th.hit.z + (f - 1) * 1.5);
      stoneMesh.setMatrixAt(i, m.compose(p, q.identity(), one));
    });
    arrowMesh.instanceMatrix.needsUpdate = true;
    stoneMesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  arrowMesh.frustumCulled = stoneMesh.frustumCulled = false;
  arrowMesh.castShadow = true;
  scene.add(arrowMesh, stoneMesh);
  ctx.onFrame(update);

  // Spent arrows stuck in the wall face and lying in the dust, stones heaped at its foot.
  const geo = arrowGeometry(0.9);
  for (let i = 0; i < 34; i++) {
    const x = SAMUEL[0] + rand.range(-6, 6), y = rand.range(2.2, WALL_H - 0.8);
    ctx.solid.add(geo, { position: [x, y, WALL_Z + WALL_T / 2 + 0.75], rotation: [rand.range(-0.5, -0.1), Math.PI + rand.range(-0.3, 0.3), 0], color: '#4a3a2a', jitter: 0.1 });
  }
  for (let i = 0; i < 40; i++) {
    const x = SAMUEL[0] + rand.range(-9, 9), z = WALL_Z + WALL_T / 2 + rand.range(0.3, 5);
    ctx.solid.add(geo, { position: [x, 0.05, z], rotation: [rand.range(-0.1, 0.1), rand() * Math.PI * 2, Math.PI / 2], color: '#4a3a2a', jitter: 0.1 });
  }
  ctx.builders.rubble(ctx, { x: SAMUEL[0], z: WALL_Z + WALL_T / 2 + 1.6, radius: 4, count: 60, size: [0.1, 0.28], color: '#8a7a68' });
  ctx.builders.rubble(ctx, { x: SAMUEL[0] - 5, z: WALL_Z + WALL_T / 2 + 1.2, radius: 2.5, count: 25, size: [0.1, 0.24], color: '#9a8a74' });
  ctx.builders.rubble(ctx, { x: SAMUEL[0] + 5, z: WALL_Z + WALL_T / 2 + 1.2, radius: 2.5, count: 25, size: [0.1, 0.24], color: '#9a8a74' });
}

function city(ctx) {
  const r = ctx.rand;
  const lots = [];
  for (let z = 30; z < 150; z += 13) {
    for (let x = -110; x <= 110; x += 12) {
      if (Math.abs(x) < 9) continue;
      if (z < 50 && Math.abs(x) < 34) continue;
      lots.push([x + r.range(-2, 2), z + r.range(-2, 2)]);
    }
  }
  for (let z = -18; z < 30; z += 12) for (const x of [-48, -60, -74, -88, 48, 60, 74, 88]) lots.push([x + r.range(-2, 2), z + r.range(-1.5, 1.5)]);
  for (const [x, z] of lots) {
    const facing = Math.abs(x) > 40 && z < 30 ? (x > 0 ? -Math.PI / 2 : Math.PI / 2) : Math.PI;
    house(ctx, { x, z, rot: facing + r.range(-0.08, 0.08), w: r.range(6, 9), d: r.range(5, 7), h: r.range(3, 4.4), color: r.pick([plaster, '#c7ad84', '#dccaa6', '#bfa47c']) });
  }
  for (let i = 0; i < 14; i++) {
    const x = r.pick([-1, 1]) * r.range(30, 42), z = r.range(-20, 26);
    ctx.builders.tree(ctx, { x, z, kind: 'palm', h: r.range(6, 9) });
  }
}

export default {
  title: 'Helaman 13-16: Samuel the Lamanite on the wall',
  seed: 37,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.45, 0.62, 0.65], color: '#fff0d6', intensity: 2.8 },
  light: { sky: '#a8c4e8', ground: '#7a6448', hemi: 1.05 },
  sky: { top: '#4f7fb8', horizon: '#d8e2e6', ground: '#c9b294', sunColor: '#fff2d0', glow: 0.8 },
  fog: { color: '#cfd6d4', near: 90, far: 620 },
  clouds: { count: 40, shadow: '#9aa6b8', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [110, 220], hole: 0.2 },
  mountains: { count: 40, color: '#6a7266', radius: [520, 760], height: [50, 140], haze: 0.5 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.35, shadowTint: '#2a3050', highlightTint: '#fff2d8' },
  shadow: { center: [0, -12], radius: 70 },

  player: { start: [6, -13], yaw: 0.3, pitch: 0.33, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 180,
    seed: 37,
    hills: 30,
    bumps: 0.25,
    flats: [{ x: 0, z: 40, r: 170, falloff: 60, height: 0 }],
    colors: { ground: '#b39a74', groundAlt: '#a58b66', grass: '#7f8a46', high: '#8f8a5c', rock: '#7a6a58' },
    patches: [
      { x: 0, z: -12, r: 34, color: '#c2aa82', strength: 0.7, rough: 0.3 },
      { x: 0, z: -170, r: 135, color: '#6f8a40', strength: 0.6, rough: 0.4 },
      { x: 0, z: 60, r: 140, color: '#b8a07a', strength: 0.85, rough: 0.2 },
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: [0, -30], ring: [20, 300], arc: [Math.PI + 0.05, Math.PI * 2 - 0.05], spacing: 7, seed: 8, avoid: [{ rect: [0, WALL_Z - 10, 320, 22] }], props: { leaf: '#5a7a36' } },
    { type: 'rock', count: 30, center: [0, -30], ring: [60, 320], arc: [Math.PI, Math.PI * 2], spacing: 12, seed: 10, props: {} },
  ],

  crowd: {
    palette,
    groups: [
      {
        count: 720, center: SAMUEL, ring: [7, 44], arc: [0.05, Math.PI - 0.05], spacing: 0.85, face: SAMUEL, children: 0.12, seed: 21,
        avoid: [{ rect: [3, -10, 6, 24, -0.3] }, { rect: [0, WALL_Z + 6, 10, 4] }],
      },
      {
        count: 140, center: SAMUEL, ring: [44, 58], arc: [0.3, Math.PI - 0.3], spacing: 1.5, face: SAMUEL, children: 0.15, seed: 22,
        avoid: [{ rect: [0, 6, 4, 40] }],
      },
    ],
  },

  custom(ctx) {
    cityWall(ctx);
    city(ctx);
    for (const x of [-46, 46]) banner(ctx, { x: x, z: WALL_Z + 6, h: 7, color: '#2f5a7a' });

    const top = WALL_H + 0.2;
    figure(ctx, {
      x: SAMUEL[0], z: SAMUEL[1] + 0.3, y: top, face: [6, -12], scale: 1.95, pose: 'up',
      robe: '#a8442a', mantle: '#5a2e1e', skin: '#6a4028', emissive: 0.2,
    });
    // Archers and throwers in front, a few listeners who believe kneeling near the wall.
    const r = ctx.rand;
    for (let i = 0; i < 9; i++) {
      const x = r.pick([-1, 1]) * r.range(3, 13), z = r.range(-21, -8);
      figure(ctx, { x, z, face: [SAMUEL[0], SAMUEL[1]], pose: i % 3 ? 'raise' : 'forward', robe: r.pick(palette.robes), mantle: r.pick(palette.mantles), skin: r.pick(palette.skins) });
    }
    for (let i = 0; i < 5; i++) {
      figure(ctx, { x: -8 + i * 1.3, z: WALL_Z + 5.5 + (i % 2) * 0.8, face: [SAMUEL[0], SAMUEL[1]], kneel: true, pose: 'pray', robe: r.pick(palette.robes), mantle: '#e2d6bc', skin: r.pick(palette.skins) });
    }
    missiles(ctx, top + 1.8);
  },
};
