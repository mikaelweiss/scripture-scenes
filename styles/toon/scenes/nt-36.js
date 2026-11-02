// Acts 17:22-31: Paul stands in the midst of Mars' hill and declares to the men of Athens the God they ignorantly worship.
// The Areopagus is a rocky hilltop; the city falls away below it and the Acropolis rises to the east-north-east.
import * as THREE from 'three';
import { Batch, boulders, box, cyl, DAY_STYLE, frameAt, house, olive, PALETTE, person, ringPoints, textTexture } from './lib/nt-32-kit.js';
import { makeFigure } from '../engine/people.js';

const PAUL = [0, -6];
const ALTAR = [6.5, 9.5];
const TOP = 36;
const ACRO = [70, -150];

function drop(x, z) {
  const d = Math.hypot(x, z);
  return THREE.MathUtils.smoothstep(d, TOP - 2, TOP + 16) * 9 - THREE.MathUtils.smoothstep(d, 90, 230) * 5;
}
function acro(x, z) {
  const d = Math.hypot(x - ACRO[0], (z - ACRO[1]) * 1.8);
  return (1 - THREE.MathUtils.smoothstep(d, 62, 80)) * 28;
}

export default {
  title: 'Acts 17:22-31: Paul on Mars Hill',
  subtitle: 'Ye men of Athens, whom ye ignorantly worship, him declare I unto you',
  seed: 36,

  style: { ...DAY_STYLE, fog: { color: '#e6ecea', near: 180, far: 1300 } },

  sky: { zenith: '#2a6ea8', mid: '#7ab0d0', horizon: '#eef0e2', ground: '#c8b89a', glowColor: '#fff4d8', glowDir: [0.5, 0.6, 0.6] },

  sun: { dir: [0.5, 0.8, 0.45], color: '#fff2dc', intensity: 2.6, hemi: { sky: '#dceaf2', ground: '#b09878', intensity: 1.2 }, shadowSize: 60 },

  ground: {
    size: 1400, segments: 280, flatRadius: 170, hillHeight: 70, undulation: 0.35,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#d4c6a8', dirt: '#c2b08e', grass: '#a4a470', grassDark: '#848a58', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#9a9a78' },
  },

  mountains: { count: 26, distance: [560, 820], height: [90, 200], widthRatio: [1.8, 2.8], colors: ['#8a9a90', '#7c8c88', '#96a49a'] },

  objects: [],

  custom(ctx) {
    const { scene, kit } = ctx;
    const b = new Batch(ctx);

    // The hill drops away to the city; the Acropolis rock rises beyond it.
    const shaped = (x, z, y) => y - drop(x, z) + acro(x, z);
    const mesh = scene.children.find((o) => o.isMesh && o.geometry.attributes.position?.count > 20000);
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, shaped(pos.getX(i), pos.getZ(i), pos.getY(i)));
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    const low = { ...ctx, terrainHeight: (x, z) => shaped(x, z, ctx.terrainHeight(x, z)) };

    // A rim of rock keeps the walker on the hilltop.
    const rim = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const r = TOP - 1 + Math.sin(i * 1.7) * 1.5;
      rim.push([Math.sin(a) * r, Math.cos(a) * r, 0.45 + ((i * 7) % 5) * 0.1]);
      ctx.addCollider({ x: Math.sin(a) * (TOP + 1), z: Math.cos(a) * (TOP + 1), hx: 2.6, hz: 2.6, rot: -a, top: 40 });
    }
    boulders(ctx, rim, { colors: ['#bfb39a', '#ada088', '#c9bea6'], collide: false, seed: 11 });
    boulders(ctx, [[-9, -9, 1.6], [-12, -4, 1.1], [10, -12, 2], [14, 6, 1.4], [-16, 10, 1.2], [-5, -14, 1.6], [4, -15, 1.2], [18, -8, 1]], { colors: ['#c9bea6', '#bfb39a'], seed: 4 });

    // Rock-cut steps where Paul stands.
    const py = ctx.terrainHeight(...PAUL);
    for (const [w, d, h, z] of [[6.4, 4, 0.5, 0], [4.6, 3, 1.0, -0.4], [2.6, 2, 1.5, -0.6]]) {
      b.add('#cdbfa4', box(w, h, d, [PAUL[0], py + h / 2 - 0.05, PAUL[1] + z]));
      ctx.addCollider({ x: PAUL[0], z: PAUL[1] + z, hx: w / 2, hz: d / 2, rot: 0, top: py + h - 0.05, walkable: true });
    }
    const paul = person(ctx, { pos: PAUL, y: py + 1.45, face: [0, 6], scale: 1.3, colors: { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#a8724a', hair: '#3a2418', sash: '#5e4632', arms: [0.4, 0.3] } });
    const arm = new THREE.Group();
    arm.position.set(-0.2, 1.32, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), kit.toon('#8c5a3c'));
    sleeve.position.y = -0.26;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), kit.toon('#a8724a'));
    hand.position.y = -0.55;
    arm.add(sleeve, hand);
    arm.rotation.set(-1.2, 0, 2.3);
    paul.add(arm);
    ctx.onFrame((t) => (arm.rotation.z = 2.3 + Math.sin(t * 0.9) * 0.15));

    // The altar TO THE UNKNOWN GOD.
    const ay = ctx.terrainHeight(...ALTAR);
    const af = frameAt(ALTAR[0], ay, ALTAR[1], -0.3);
    b.add('#e8e0cc', box(1.8, 0.25, 1.4, [0, 0.12, 0]), { frame: af });
    b.add('#efe8d6', box(1.4, 1.1, 1.0, [0, 0.8, 0]), { frame: af });
    b.add('#e8e0cc', box(1.7, 0.2, 1.3, [0, 1.45, 0]), { frame: af });
    for (const sx of [-1, 1]) b.add('#e8e0cc', cyl(0.16, 0.16, 1.2, [sx * 0.62, 1.66, 0], [Math.PI / 2, 0, 0], 10), { frame: af });
    ctx.addCollider({ x: ALTAR[0], z: ALTAR[1], hx: 0.9, hz: 0.7, rot: -0.3, top: ay + 1.6 });
    ctx.exclude({ kind: 'circle', x: ALTAR[0], z: ALTAR[1], r: 1.6 });
    const tex = textTexture(['ΑΓΝΩΣΤΩ ΘΕΩ', 'TO THE UNKNOWN GOD'], { w: 512, h: 256, bg: '#efe8d6', fg: '#4a3420', font: 'bold 40px serif' });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), kit.toon('#ffffff', { map: tex }));
    plate.position.set(0, 0.82, 0.51);
    const altarGroup = new THREE.Group();
    altarGroup.position.set(ALTAR[0], ay, ALTAR[1]);
    altarGroup.rotation.y = -0.3;
    altarGroup.add(plate);
    scene.add(altarGroup);

    // Idols on pedestals: the city wholly given to idolatry.
    const marble = { robe: '#ece6d6', mantle: '#ddd6c4', skin: '#e6dfcc', hair: '#d6cfbc', sash: '#d6cfbc' };
    for (const [x, z, s] of [[-14, -16, 1.3], [16, -18, 1.2], [-24, 4, 1.1]]) {
      const gy = ctx.terrainHeight(x, z);
      b.add('#d6ccb4', box(1.4, 1.8, 1.4, [x, gy + 0.9, z]));
      ctx.addCollider({ x, z, hx: 0.7, hz: 0.7, rot: 0, top: gy + 1.8 });
      const fig = makeFigure({ ...marble, arms: [0.3, s > 1.2 ? 1.6 : 0.2] }, kit);
      fig.position.set(x, gy + 1.8, z);
      fig.scale.setScalar(s);
      fig.rotation.y = Math.atan2(-x, -z);
      fig.traverse((o) => o.isMesh && (o.castShadow = true));
      scene.add(fig);
    }

    for (const [x, z, s] of [[-26, -14, 1.2], [24, 14, 1], [-20, 22, 1.1], [27, -6, 0.9]]) olive(b, ctx, { pos: [x, z], size: s, seed: x * 3 + z });

    // Athens below: houses spread over the low ground and the slopes.
    const colors = ['#efe3c2', '#e3d3b0', '#e8dcc4', '#d8c8a4', '#f2ead6'];
    const roofs = ['#b5623b', '#a8573a', '#c06a40'];
    const rng = (() => { let s = 13; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let i = 0; i < 220; i++) {
      const a = rng() * Math.PI * 2, r = 60 + Math.sqrt(rng()) * 200;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (Math.hypot(x - ACRO[0], (z - ACRO[1]) * 1.8) < 84) continue;
      const w = 6 + rng() * 6, d = 5 + rng() * 5;
      house(b, low, { pos: [x, z], size: [w, d], height: 4 + rng() * 4, rot: rng() * 0.6, color: colors[i % 5], trim: roofs[i % 3], upper: rng() < 0.3 });
    }

    // The Acropolis: walls along the rim of its rock and the Parthenon on top.
    const ay2 = low.terrainHeight(ACRO[0], ACRO[1]);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const x = ACRO[0] + Math.sin(a) * 60, z = ACRO[1] + (Math.cos(a) * 60) / 1.8;
      b.add('#d8c8a4', box(9.6, 6, 2.4, [x, ay2 + 1, z], [0, a + Math.PI / 2, 0]));
    }
    const P = frameAt(ACRO[0] + 6, ay2 - 0.5, ACRO[1] + 2, 0.25);
    const marbleC = '#f2ecdc';
    b.add('#e2d8c0', box(36, 1.6, 16, [0, 0.8, 0]), { frame: P });
    for (let i = 0; i < 12; i++) for (const zz of [-6.6, 6.6]) b.add(marbleC, cyl(0.85, 0.95, 11, [-16 + i * (32 / 11), 7.1, zz], [0, 0, 0], 12), { frame: P });
    for (let i = 1; i < 5; i++) for (const xx of [-16, 16]) b.add(marbleC, cyl(0.85, 0.95, 11, [xx, 7.1, -6.6 + i * 2.64], [0, 0, 0], 12), { frame: P });
    b.add('#e8e0cc', box(30, 10, 10, [0, 6.6, 0]), { frame: P });
    b.add(marbleC, box(35, 2.4, 15.4, [0, 13.8, 0]), { frame: P });
    const ped = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-7.9, 0), new THREE.Vector2(7.9, 0), new THREE.Vector2(0, 3.6)]), { depth: 35, bevelEnabled: false });
    ped.translate(0, 0, -17.5);
    ped.rotateY(Math.PI / 2);
    ped.translate(0, 15, 0);
    b.add('#e8dcc4', ped, { frame: P });

    // Paul's hearers: philosophers and townsfolk on the rock, a few drawn close.
    for (const [x, z, c] of [[-2.6, -1.5, 0], [2.8, -1.2, 1], [-1, 0.5, 2]]) {
      const fig = person(ctx, { pos: [x, z], face: PAUL, colors: { robe: ['#f2ecdc', '#e6d8b8', '#d9e2e8'][c], mantle: ['#4f6fa0', '#b5523b', '#e8e0cc'][c], skin: PALETTE.skins[c + 1], hair: ['#e8e2d4', '#3a2418', '#8a8070'][c], sash: '#c8912e', arms: c === 1 ? [0.4, 1.1] : undefined } });
      if (c === 1) fig.rotation.x = 0.05;
    }
    b.flush();
  },

  crowd: {
    seed: 36,
    minSpacing: 0.8,
    aisles: [{ from: [3.5, 22], to: [0, -3], width: 4.5 }],
    keepClear: [{ kind: 'circle', x: ALTAR[0], z: ALTAR[1], r: 2.5 }],
    facing: PAUL,
    colors: {
      robes: ['#f2ecdc', '#e6d8b8', '#d9e2e8', '#efe3c2', '#c8a97a', '#b5523b', '#4f6fa0', '#e8e0cc', '#a8b8c0', '#d9c7a3'],
      mantles: ['#4f6fa0', '#b5523b', '#e8e0cc', '#3e6e66', '#8c5a3c', '#c8912e', '#f2ecdc', '#6b5a7a'],
      skins: PALETTE.skins,
      hair: ['#2b1a12', '#3a2418', '#8a8070', '#e8e2d4', '#4a3020'],
      wraps: ['#e8e2d4', '#c8912e', '#4f6fa0', '#f2ecdc'],
    },
    groups: [
      { center: PAUL, radius: [6.5, 17], angle: [-1.3, 1.3], count: 80, kneel: 0.35, children: 0.02 },
      { center: PAUL, radius: [5, 9], angle: [1.4, 2.3], count: 12, kneel: 0.5 },
      { center: PAUL, radius: [5, 9], angle: [-2.3, -1.4], count: 12, kneel: 0.5 },
    ],
  },

  player: {
    start: [3, 12.5],
    lookAt: [1.5, -6],
    colors: { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
