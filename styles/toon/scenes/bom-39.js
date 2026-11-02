// 3 Nephi 3-4: Lachoneus gathers all the Nephites into one land, with their flocks and provisions, behind strong fortifications.
import * as THREE from 'three';
import { BASE_STYLE, GROUND_COLORS, MOUNTAINS, ROBES, Frame, animals, banners, boxes, cityWall, figure, raiseArm, tents, makeRng, between, pick } from './lib/bom-37-kit.js';

const LINE_Z = -46;
const GIDGIDDONI = [0, -36];
const CAPTAIN = { robe: '#8c2f2f', mantle: '#c8912e', skin: '#9c6a45', hair: '#2b1a12', sash: '#efe3c2' };

// Earthen rampart with a pointed timber palisade on its crest.
function rampart(ctx, from, to, gate) {
  const wall = cityWall(ctx, { from, to, height: 3.2, thickness: 6, color: '#a8865a', cap: '#957448', crenel: false, gate, walkable: false });
  const len = wall.len;
  const posts = [];
  for (let s = -len / 2; s <= len / 2; s += 0.42) {
    if (gate && Math.abs(s - gate[0]) < gate[1] / 2 + 2.4) continue;
    posts.push(s);
  }
  const geo = new THREE.CylinderGeometry(0.2, 0.22, 3.4, 6);
  const tip = new THREE.ConeGeometry(0.2, 0.55, 6);
  tip.translate(0, 1.97, 0);
  const meshes = [new THREE.InstancedMesh(geo, ctx.kit.toon('#7a5634'), posts.length), new THREE.InstancedMesh(tip, ctx.kit.toon('#6b4a2c'), posts.length)];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  const c = Math.cos(wall.rot), sn = Math.sin(wall.rot);
  posts.forEach((s, i) => {
    const x = wall.mid[0] + s * c, z = wall.mid[1] - s * sn;
    m.compose(new THREE.Vector3(x, wall.top + 1.5 + Math.sin(s * 7.1) * 0.12, z), q, new THREE.Vector3(1, 1, 1));
    meshes.forEach((mesh) => mesh.setMatrixAt(i, m));
  });
  meshes.forEach((mesh) => {
    mesh.castShadow = true;
    ctx.scene.add(mesh);
  });
  return wall;
}

function watchtower(ctx, [x, z]) {
  const k = ctx.kit;
  const f = new Frame(ctx, [x, z], 0);
  const wood = k.toon('#7a5634');
  for (const [dx, dz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) f.box(wood, [0.3, 9, 0.3], [dx, 4.5, dz]);
  f.box(k.toon('#8a6440'), [3.8, 0.3, 3.8], [0, 7.5, 0]);
  f.box(k.toon('#6b4a2c'), [3.8, 1.0, 0.15], [0, 8.1, 1.85]);
  f.box(k.toon('#6b4a2c'), [3.8, 1.0, 0.15], [0, 8.1, -1.85]);
  f.box(k.toon('#6b4a2c'), [0.15, 1.0, 3.8], [1.85, 8.1, 0]);
  f.box(k.toon('#6b4a2c'), [0.15, 1.0, 3.8], [-1.85, 8.1, 0]);
  f.geo(k.toon('#b98a5a'), new THREE.ConeGeometry(3.2, 2, 4).rotateY(Math.PI / 4).translate(0, 10.2, 0));
  f.box(wood, [3, 9, 3], [0, 4.5, 0], { collide: true });
  f.parts.get(wood).pop();
  f.build();
  ctx.exclude({ kind: 'rect', x, z, hx: 2.5, hz: 2.5 });
  const guard = figure(ctx, { robe: '#8c5a3c', mantle: '#5e4632', skin: '#9c6a45', hair: '#2b1a12' }, [x, z], { y: f.y + 7.65, facing: [x, z - 50], clear: 0 });
  return guard;
}

function pen(ctx, rng, [cx, cz], [w, d], kind, count) {
  const k = ctx.kit;
  const f = new Frame(ctx, [cx, cz], 0);
  const wood = k.toon('#7a5634');
  for (const side of [-1, 1]) {
    f.box(wood, [w, 0.12, 0.12], [0, 0.9, side * d / 2], { collide: true });
    f.box(wood, [w, 0.12, 0.12], [0, 0.5, side * d / 2]);
    f.box(wood, [0.12, 0.12, d], [side * w / 2, 0.9, 0], { collide: true });
    f.box(wood, [0.12, 0.12, d], [side * w / 2, 0.5, 0]);
  }
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 2.5) for (const side of [-1, 1]) f.box(wood, [0.16, 1.2, 0.16], [x, 0.6, side * d / 2]);
  for (let z = -d / 2; z <= d / 2 + 0.01; z += 2.5) for (const side of [-1, 1]) f.box(wood, [0.16, 1.2, 0.16], [side * w / 2, 0.6, z]);
  f.build();
  ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: w / 2 + 0.6, hz: d / 2 + 0.6 });
  const list = [];
  const colors = kind === 'cattle' ? ['#7a4e33', '#5e3b26', '#c9b28c', '#3a2a22', '#a87650'] : kind === 'goat' ? ['#5e4632', '#efe3c2', '#8c5a3c'] : ['#f1e6cf', '#e6d8b8', '#efe3c2', '#d9c7a3', '#4a3a2a'];
  for (let i = 0; i < count; i++) {
    list.push({ kind, x: cx + (rng() - 0.5) * (w - 1.6), z: cz + (rng() - 0.5) * (d - 1.6), yaw: rng() * 6.28, color: pick(rng, colors), head: kind === 'sheep' ? '#3a2a22' : undefined });
  }
  return list;
}

export default {
  title: '3 Nephi 3-4: The Nephites gather against the robbers',
  subtitle: 'One land, one people, their flocks and seven years of provisions',
  seed: 39,

  style: { ...BASE_STYLE, fog: { color: '#ecdcb8', near: 130, far: 950 } },

  sky: { zenith: '#3a74a0', mid: '#80b2c6', horizon: '#f0dcb0', ground: '#d9b98a', glowColor: '#fff2c8', glowDir: [0.5, 0.5, -1] },

  sun: { dir: [0.5, 0.8, 0.45], color: '#fff2da', intensity: 2.6, hemi: { sky: '#d6e6ee', ground: '#a87a52', intensity: 1.1 }, shadowSize: 80 },

  ground: {
    size: 1400, segments: 260, flatRadius: 150, hillHeight: 34, undulation: 0.3,
    plaza: { center: [0, -30], size: [22, 14] },
    colors: { ...GROUND_COLORS, sand: '#c9a468', grass: '#8a9c56' },
  },

  mountains: MOUNTAINS,

  objects: [
    { type: 'trees', count: 120, center: [0, -40], ring: [30, 240], angle: [2.0, 4.3], height: [5, 9], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a'] },
    { type: 'trees', count: 30, ring: [70, 160], angle: [-1.2, 1.2], height: [5, 8], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#4f9a74', '#5f9e6a'], seed: 12 },
  ],

  custom(ctx) {
    const rng = makeRng(39);
    rampart(ctx, [-130, LINE_Z], [130, LINE_Z], [0, 8]);
    rampart(ctx, [-130, LINE_Z], [-130, 120]);
    rampart(ctx, [130, LINE_Z], [130, 120]);
    for (const x of [-60, -18, 18, 60]) watchtower(ctx, [x, LINE_Z + 6]);
    banners(ctx, [-50, -36, -8, 8, 36, 50].map((x, i) => ({ x, z: LINE_Z + 4, height: 7, color: ['#b5523b', '#2f6f8a', '#c8912e'][i % 3] })));

    const gateY = ctx.terrainHeight(0, LINE_Z);
    boxes(ctx, [-3, -1, 1, 3].map((x) => ({ pos: [x, gateY + 2.6, LINE_Z + 2.4], size: [1.9, 5.2, 0.35], color: '#5a3a22' })));
    ctx.addCollider({ x: 0, z: LINE_Z + 2.4, hx: 4, hz: 0.3, rot: 0, top: gateY + 5.2 });
    const standY = ctx.terrainHeight(...GIDGIDDONI) + 2.0;
    boxes(ctx, [{ pos: [GIDGIDDONI[0], standY - 1.0, GIDGIDDONI[1]], size: [4, 2.0, 3], color: '#957448' }]);
    ctx.addCollider({ x: GIDGIDDONI[0], z: GIDGIDDONI[1], hx: 2, hz: 1.5, rot: 0, top: standY });
    const gid = figure(ctx, CAPTAIN, GIDGIDDONI, { y: standY, facing: [0, 0], scale: 1.5, clear: 2.5 });
    raiseArm(ctx, gid, CAPTAIN, 1, 2.5);

    const herd = [
      ...pen(ctx, rng, [-17, 4], [18, 10], 'sheep', 70),
      ...pen(ctx, rng, [-34, 30], [22, 14], 'cattle', 22),
      ...pen(ctx, rng, [-62, 6], [16, 22], 'goat', 40),
      ...pen(ctx, rng, [-70, 40], [24, 16], 'sheep', 80),
    ];
    for (let i = 0; i < 26; i++) {
      const x = between(rng, [-9, -3]), z = between(rng, [10, 18]);
      herd.push({ kind: 'sheep', x, z, yaw: -0.6 + rng() * 0.8 + Math.PI, color: pick(rng, ['#f1e6cf', '#e6d8b8', '#efe3c2', '#4a3a2a']), head: '#3a2a22' });
    }
    for (let i = 0; i < 40; i++) {
      const x = between(rng, [-100, -52]), z = between(rng, [60, 100]);
      if (!ctx.blocked(x, z, 0.5)) herd.push({ kind: rng() < 0.7 ? 'sheep' : 'cattle', x, z, yaw: rng() * 6.28, color: pick(rng, ['#f1e6cf', '#e6d8b8', '#7a4e33']), head: '#3a2a22' });
    }
    animals(ctx, herd);

    const tentList = [];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 9; col++) {
        const x = 12 + col * 9 + (row % 2) * 3 + between(rng, [-0.8, 0.8]);
        const z = 4 + row * 11 + between(rng, [-1, 1]);
        if (x > 120) continue;
        tentList.push({ x, z, yaw: Math.PI / 2 * (rng() < 0.5 ? 1 : -1), size: [between(rng, [3, 4]), between(rng, [2, 2.6]), between(rng, [4, 5.5])], color: pick(rng, ['#e6d8b8', '#d9c7a3', '#c8a97a', '#bfa27a', '#b5523b', '#4f7f80']) });
      }
    }
    tents(ctx, tentList);

    const stores = [];
    for (let i = 0; i < 70; i++) {
      const x = between(rng, [-14, 14]), z = between(rng, [52, 80]);
      const h = between(rng, [0.6, 1.0]);
      stores.push({ pos: [x, ctx.terrainHeight(x, z) + h / 2, z], size: [between(rng, [0.8, 1.4]), h, between(rng, [0.8, 1.2])], rot: rng() * 3, color: pick(rng, ['#c8a97a', '#bfa27a', '#a87b4f', '#d9c7a3']) });
    }
    boxes(ctx, stores);
    ctx.exclude({ kind: 'rect', x: 0, z: 66, hx: 16, hz: 16 });
  },

  clouds: {
    layers: [{ count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a5a78' }],
  },

  crowd: {
    seed: 39,
    minSpacing: 0.7,
    facing: GIDGIDDONI,
    colors: ROBES,
    aisles: [{ from: [0, 40], to: [0, -28], width: 3.6 }],
    keepClear: [{ kind: 'circle', x: GIDGIDDONI[0], z: GIDGIDDONI[1], r: 5 }],
    groups: [
      { center: GIDGIDDONI, radius: [5, 40], angle: [-1.0, 1.0], count: 1100, kneel: 0.05, children: 0.12 },
      { shape: 'rect', center: [-34, 46], size: [30, 10], count: 60, facing: [-34, 20], children: 0.2 },
      { shape: 'rect', center: [60, 30], size: [60, 70], count: 260, facing: GIDGIDDONI, children: 0.18, facingJitter: 2 },
      { shape: 'rect', center: [-90, 0], size: [40, 70], count: 150, facing: [-60, 0], children: 0.15, facingJitter: 2 },
    ],
  },

  player: {
    start: [0, -12],
    lookAt: [0, LINE_Z],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
