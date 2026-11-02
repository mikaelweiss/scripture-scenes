// Alma 24:15-19: the Anti-Nephi-Lehies bury their swords deep in the earth as a covenant of peace.
// A long fresh trench runs east to west. The king speaks from a rock to the north.
import * as THREE from 'three';
import { add, baseStyle, block, clothes, groundColors, person } from './lib/bom-25-kit.js';
import { makeRng } from '../engine/util.js';

const KING = [0, -19];
const TRENCH = { x: 0, z: -8, len: 36, w: 3 };

function swordGeometries() {
  const blade = new THREE.BoxGeometry(0.12, 0.85, 0.035).translate(0, 0.62, 0);
  const tip = new THREE.ConeGeometry(0.06, 0.16, 4).translate(0, 1.12, 0);
  const guard = new THREE.BoxGeometry(0.3, 0.06, 0.07).translate(0, 0.19, 0);
  const grip = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6).translate(0, 0.08, 0);
  return { metal: [blade, tip], wood: [guard, grip] };
}

function instanced(ctx, geos, color, mats) {
  const merged = geos.length === 1 ? geos[0] : mergeAll(geos);
  const mesh = new THREE.InstancedMesh(merged, ctx.kit.toon(color), mats.length);
  mats.forEach((m, i) => mesh.setMatrixAt(i, m));
  mesh.castShadow = true;
  ctx.scene.add(mesh);
}

function mergeAll(geos) {
  const g = new THREE.BufferGeometry();
  const pos = [], nor = [], idx = [];
  let off = 0;
  for (const s of geos) {
    const p = s.attributes.position, n = s.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
    const ix = s.index ? s.index.array : [...Array(p.count).keys()];
    for (const i of ix) idx.push(i + off);
    off += p.count;
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

// A long ridge of dug earth whose steep inner face is the dark wall of the trench.
// Local frame: the bank runs along x, its inner edge sits on z = 0, and it rises toward -z.
function bank(ctx, { x, z, y, len, rot, height, rng }) {
  const k = ctx.kit;
  const shape = new THREE.Shape();
  const pts = [[0, -0.4], [0.02, 0], [0.45, height], [0.9, height * 1.08], [1.7, height * 0.95], [2.6, height * 0.45], [3.4, -0.4]];
  shape.moveTo(...pts[0]);
  for (const p of pts.slice(1)) shape.lineTo(...p);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-len / 2, 0, 0);
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rot;
  const earth = new THREE.Mesh(geo, k.toon('#8a5a3b'));
  earth.castShadow = earth.receiveShadow = true;
  const slant = Math.hypot(0.45, height + 0.4);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(len, slant), k.toon('#3b2416'));
  wall.rotation.x = -Math.atan2(0.45, height + 0.4);
  wall.position.set(0, (height - 0.4) / 2, -0.2);
  wall.receiveShadow = true;
  g.add(earth, wall);
  const lump = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < Math.round(len / 3.5); i++) {
    const m = new THREE.Mesh(lump, k.toon(i % 2 ? '#94633f' : '#7a4e33'));
    m.position.set(-len / 2 + 1.5 + (i + rng()) * ((len - 3) / Math.round(len / 3.5)), height * 0.9, -1.3 - rng() * 0.5);
    m.scale.set(1.2 + rng() * 0.8, (0.35 + rng() * 0.3) * Math.min(1, height / 1.2), 0.8 + rng() * 0.3);
    m.castShadow = true;
    g.add(m);
  }
  ctx.scene.add(g);
}

function burial(ctx) {
  const rng = makeRng(26);
  const k = ctx.kit;
  const { x: tx, z: tz, len, w } = TRENCH;
  let y = -Infinity;
  for (let i = 0; i <= 12; i++) for (const dz of [-w / 2, 0, w / 2]) y = Math.max(y, ctx.terrainHeight(tx - len / 2 + (i / 12) * len, tz + dz));
  const H = 1.15;
  const bankTop = (side) => y + (side < 0 ? H * 1.15 : H * 0.3);

  add(ctx, new THREE.BoxGeometry(len + 0.4, 0.6, w + 0.4), k.toon('#1e120a'), { pos: [tx, y - 0.25, tz], cast: false });
  bank(ctx, { x: tx, z: tz - w / 2, y, len: len + 1, rot: 0, height: H * 1.15, rng });
  bank(ctx, { x: tx, z: tz + w / 2, y, len: len + 1, rot: Math.PI, height: H * 0.3, rng });
  bank(ctx, { x: tx - len / 2, z: tz, y, len: w + 1.5, rot: Math.PI / 2, height: H, rng });
  bank(ctx, { x: tx + len / 2, z: tz, y, len: w + 1.5, rot: -Math.PI / 2, height: H, rng });
  ctx.exclude({ kind: 'rect', x: tx, z: tz, hx: len / 2 + 3.6, hz: w / 2 + 3.6 });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      ctx.addCollider({ x: tx - len / 2 + (i + 0.5) * (len / 6), z: tz + side * (w / 2 + 1.3), hx: len / 12, hz: 1.1, rot: 0, top: bankTop(side), walkable: true });
    }
  }

  const sword = swordGeometries();
  const lying = [], q = new THREE.Quaternion(), e = new THREE.Euler(), m = new THREE.Matrix4();
  for (let i = 0; i < 220; i++) {
    const x = tx + (rng() - 0.5) * (len - 1.5), z = tz + (rng() - 0.5) * (w - 0.8);
    e.set(Math.PI / 2 + (rng() - 0.5) * 0.3, rng() * 6.28, 0, 'YXZ');
    m.compose(new THREE.Vector3(x, y + 0.08 + rng() * 0.12, z), q.setFromEuler(e), new THREE.Vector3(1.4, 1.4, 1.4));
    lying.push(m.clone());
  }
  // Swords waiting in heaps by the king to be carried down.
  const pile = [[-6, -16.5], [6, -16.5]];
  for (const [px, pz] of pile) {
    for (let i = 0; i < 40; i++) {
      const a = rng() * 6.28, r = Math.sqrt(rng()) * 1.2;
      const x = px + Math.sin(a) * r, z = pz + Math.cos(a) * r;
      e.set(Math.PI / 2 - 0.2 - rng() * 0.4, rng() * 6.28, (rng() - 0.5) * 0.3, 'YXZ');
      m.compose(new THREE.Vector3(x, ctx.terrainHeight(x, z) + 0.05 + (1.2 - r) * 0.35, z), q.setFromEuler(e), new THREE.Vector3(1, 1, 1));
      lying.push(m.clone());
    }
    ctx.exclude({ kind: 'circle', x: px, z: pz, r: 1.6 });
    ctx.addCollider({ x: px, z: pz, hx: 1, hz: 1, rot: 0, top: ctx.terrainHeight(px, pz) + 0.5 });
  }
  instanced(ctx, sword.metal, '#c4ccd0', lying);
  instanced(ctx, sword.wood, '#5e4632', lying);

  // Digging sticks left standing in the spoil.
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    const x = tx - len / 2 + 3 + i * 4.2, z = tz + side * (w / 2 + 2.2);
    const top = bankTop(side) - 0.05;
    const stick = add(ctx, new THREE.CylinderGeometry(0.04, 0.05, 1.7, 5), k.toon('#6b4a33'), { pos: [x, top + 0.7, z] });
    stick.rotation.z = (rng() - 0.5) * 0.6;
  }

  // The king on a rock, Ammon and his brethren beside him.
  const ry = ctx.terrainHeight(...KING);
  const rock = add(ctx, new THREE.DodecahedronGeometry(2.2, 0), k.stoneMat('#a58a66'), { pos: [KING[0], ry - 0.6, KING[1] - 0.3] });
  rock.scale.set(1.3, 0.95, 1);
  ctx.addCollider({ x: KING[0], z: KING[1] - 0.3, hx: 2.2, hz: 1.6, rot: 0, top: ry + 1.3, walkable: true });
  const crown = (fig) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.12, 10), k.toon('#d9a441'));
    c.position.y = 1.64;
    fig.add(c);
  };
  crown(person(ctx, { robe: '#e6d8b8', mantle: '#b5523b', skin: '#9c6a45', hair: '#2b1a12', sash: '#d9a441', arms: [2.5, 0.2] }, KING, [0, 10], { y: ry + 1.3, scale: 1.05, clear: 2.4 }));
  person(ctx, { robe: '#a87b4f', mantle: '#e6d8b8', skin: '#b5825a', hair: '#3a2418', sash: '#6b4a33' }, [-3.6, -17.5], [0, -8]);
  person(ctx, { robe: '#8c5a3c', mantle: '#d9c7a3', skin: '#b5825a', hair: '#4a3020' }, [3.6, -17.5], [0, -8]);
  person(ctx, { robe: '#7a6a52', mantle: '#e6d8b8', skin: '#c08f66', hair: '#3a2418' }, [-4.8, -18.6], [0, -8]);

  // Men kneeling at the trench edge, casting in their swords.
  const swordFig = (fig) => {
    const s = new THREE.Group();
    s.add(new THREE.Mesh(mergeAll(sword.metal), k.toon('#a8b0b4')), new THREE.Mesh(mergeAll(sword.wood), k.toon('#5e4632')));
    s.rotation.x = 2.2;
    s.position.set(0, 0.95, 0.35);
    fig.add(s);
  };
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1;
    const x = tx - len / 2 + 2 + (i / 17) * (len - 4) + (rng() - 0.5);
    const z = tz + side * (w / 2 + 0.75);
    const pal = clothes;
    const pick = (l) => l[Math.floor(rng() * l.length)];
    const f = person(ctx, { robe: pick(pal.robes), mantle: pick(pal.mantles), skin: pick(pal.skins), hair: pick(pal.hair), arms: [0.15, 1.0] }, [x, z], [x, tz], { kneel: true, clear: 0.6, y: bankTop(side) - 0.05 });
    swordFig(f);
  }
  for (const [x, z] of [[-3, 6], [2.5, 7.5], [8, 5], [-9, 5.5], [-1, 10]]) {
    const pick = (l) => l[Math.floor(rng() * l.length)];
    const f = person(ctx, { robe: pick(clothes.robes), mantle: pick(clothes.mantles), skin: pick(clothes.skins), hair: pick(clothes.hair), arms: [0.1, 0.7] }, [x, z], [x * 0.5, tz], { clear: 0.7 });
    swordFig(f);
  }
}

export default {
  title: 'Alma 24:15-19: The Anti-Nephi-Lehies bury their weapons',
  subtitle: 'A field in the land of Nephi, a covenant of peace',
  seed: 26,

  style: { ...baseStyle, fog: { color: '#e9dcc0', near: 140, far: 1100 } },

  sky: { zenith: '#3a77a0', mid: '#86b8c4', horizon: '#f6e2b8', ground: '#c9b07a', glowColor: '#fff3cf', glowDir: [-0.6, 0.35, -0.7] },

  sun: { dir: [-0.5, 0.65, 0.55], color: '#fff2da', intensity: 2.5, hemi: { sky: '#dcefe6', ground: '#9a7a52', intensity: 1.15 }, shadowSize: 60 },

  ground: {
    size: 1600, segments: 300, flatRadius: 120, hillHeight: 45, undulation: 0.35,
    plaza: { center: [0, 2000], size: [1, 1] },
    colors: { ...groundColors, sand: '#b9a466', dirt: '#a8834f', grass: '#7f9a52', grassDark: '#5f7a3e', hill: '#6f9a5e' },
  },

  mountains: { count: 34, distance: [500, 800], height: [80, 200], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 160, ring: [45, 240], height: [5, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 400, ring: [4, 90], size: [0.1, 0.35], colors: ['#a58a66', '#8a6e50', '#b89a70'] },
  ],

  custom: burial,

  clouds: {
    layers: [{ count: 44, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff8ea', shade: '#6a7a92' }],
  },

  light: {
    glows: [{ at: KING, lift: 2.6, size: 4, color: '#fff3d0', opacity: 0.35 }],
  },

  crowd: {
    seed: 26,
    minSpacing: 0.62,
    facing: [0, -8],
    colors: clothes,
    aisles: [{ from: [0, 30], to: [0, -5], width: 5 }],
    keepClear: [{ kind: 'circle', x: 0, z: -19, r: 6 }],
    groups: [
      { center: [0, -8], radius: [5, 30], angle: [-2.6, -0.4], count: 380, kneel: 0.25, children: 0.15 },
      { center: [0, -8], radius: [5, 30], angle: [0.4, 2.6], count: 380, kneel: 0.25, children: 0.15 },
      { center: [0, -8], radius: [17, 34], angle: [-0.5, 0.5], count: 160, kneel: 0.2, children: 0.15 },
      { center: [0, -8], radius: [11, 30], angle: [2.75, 3.53], count: 220, kneel: 0.15, children: 0.12, facing: KING },
    ],
  },

  player: {
    start: [0, -1.5],
    lookAt: KING,
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
