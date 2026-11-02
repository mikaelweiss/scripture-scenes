// Mosiah 12-17: Abinadi testifies before King Noah and his priests in the palace. His face shines.
import * as THREE from 'three';
import { BASE_STYLE, GROUND_COLORS, Frame, addMesh, figure, flames, glow, kneeling, raiseArm } from './lib/bom-13-kit.js';

const HALL = { hx: 16, z0: -34, z1: 6 };
const FLOOR = 0.5;
const ABINADI = [0, -15];
const NOAH = [0, -30.6];
const GOLD = '#d9a63a';

const ABINADI_COLORS = { robe: '#a58a66', mantle: '#7a6a52', skin: '#a8724a', hair: '#d9d0c0' };
const NOAH_COLORS = { robe: '#5a2a5e', mantle: GOLD, skin: '#b5825a', hair: '#2b1a12' };
const GUARD_COLORS = { robe: '#7a2f2a', mantle: '#b5823a', skin: '#9c6a45', hair: '#1f140e', sash: '#2b1a12' };
const PRIESTS = {
  robes: ['#5a2a5e', '#7a2f4a', '#efe3c2', '#2f5a6e', '#8a2f3a', '#e6d8b8'],
  mantles: [GOLD, '#c8912e', '#2f8f8a', '#b5523b', '#efe3c2'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e'],
  wraps: [GOLD, '#efe3c2', '#b5523b', '#2f8f8a'],
};

function hall(ctx) {
  const k = ctx.kit;
  const cz = (HALL.z0 + HALL.z1) / 2;
  const depth = HALL.z1 - HALL.z0;
  const f = new Frame(ctx, [0, 0], 0, ctx.terrainHeight(0, 0));
  const wall = k.stoneMat('#e3cfa6');
  const fret = k.fretMat('#8a2f3a', '#efe3c2');
  const band = { uv: { su: 2, sv: 0.7, oy: 0.35, local: true, flatCaps: true } };
  const H = 9;
  f.box(k.stoneMat('#d4bd92'), [HALL.hx * 2 + 2, FLOOR, depth + 2], [0, FLOOR / 2, cz], { walkable: true });
  f.box(k.toon('#8a2f3a'), [3.2, 0.04, 30], [0, FLOOR + 0.02, -12]);
  f.box(k.toon(GOLD), [3.6, 0.03, 30.2], [0, FLOOR + 0.01, -12]);
  f.box(wall, [HALL.hx * 2 + 2, H, 1], [0, H / 2, HALL.z0 - 0.5], { collide: true });
  for (const s of [-1, 1]) {
    f.box(wall, [1, H, depth], [s * (HALL.hx + 0.5), H / 2, cz], { collide: true });
    f.box(fret, [0.12, 0.7, depth], [s * (HALL.hx - 0.06), H - 1.6, cz], band);
    for (let i = 0; i < 4; i++) {
      const z = HALL.z0 + 5 + i * 9;
      f.box(k.toon(['#2f6f8a', '#8a2f3a'][i % 2]), [0.1, 4.2, 2.4], [s * (HALL.hx - 0.06), 4.6, z]);
      f.box(k.toon(GOLD), [0.12, 0.25, 2.6], [s * (HALL.hx - 0.08), 6.75, z]);
    }
  }
  f.box(fret, [HALL.hx * 2, 0.7, 0.12], [0, H - 1.6, HALL.z0 + 0.06], band);
  f.box(k.toon('#8a2f3a'), [8, 6, 0.1], [0, 4.5, HALL.z0 + 0.06]);
  f.box(k.fretMat(GOLD, '#5a2a5e'), [8.4, 0.6, 0.14], [0, 7.6, HALL.z0 + 0.08], band);

  const dais = k.stoneMat('#efe3c2');
  f.box(dais, [13, 0.5, 6], [0, FLOOR + 0.25, -30.5], { walkable: true });
  f.box(dais, [8, 0.5, 4], [0, FLOOR + 0.75, -31.3], { walkable: true });
  f.box(k.fretMat(GOLD, '#8a2f3a'), [13.1, 0.3, 6.1], [0, FLOOR + 0.35, -30.5], band);
  const gold = k.toon(GOLD, { emissive: '#3a2a0a' });
  const seatY = FLOOR + 1;
  f.box(gold, [2.2, 0.7, 1.6], [0, seatY + 0.35, -31.3], { collide: true });
  f.box(gold, [2.6, 4, 0.4], [0, seatY + 2, -32.2]);
  f.box(k.toon('#5a2a5e'), [1.6, 2.6, 0.1], [0, seatY + 2.3, -31.97]);
  for (const s of [-1, 1]) f.box(gold, [0.3, 1.3, 1.6], [s * 1.1, seatY + 0.65, -31.3]);
  f.box(gold, [1.2, 0.8, 0.5], [0, seatY + 4.3, -32.2]);

  const colGeo = (x, z) => {
    const g = new THREE.CylinderGeometry(0.55, 0.62, H - 0.2, 12);
    g.translate(x, H / 2, z);
    return g;
  };
  const cols = k.stoneMat('#efe3c2');
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = HALL.z0 + 4 + i * 7.5;
      f.geo(cols, colGeo(s * 9.5, z));
      f.box(k.toon(GOLD), [1.5, 0.4, 1.5], [s * 9.5, H - 0.2, z]);
      ctx.addCollider({ x: s * 9.5, z, hx: 0.6, hz: 0.6, rot: 0, top: H });
    }
  }
  for (let i = 0; i < 6; i++) {
    const x = -HALL.hx + 1 + i * ((HALL.hx * 2 - 2) / 5);
    if (Math.abs(x) < 4) continue;
    f.geo(cols, colGeo(x, HALL.z1));
    ctx.addCollider({ x, z: HALL.z1, hx: 0.6, hz: 0.6, rot: 0, top: H });
  }
  f.build();

  const roof = new Frame(ctx, [0, 0], 0, f.y);
  roof.box(k.stoneMat('#c9a87a'), [HALL.hx * 2 + 3, 0.8, depth + 3], [0, H + 0.4, cz]);
  roof.box(k.fretMat('#2f6f8a', '#efe3c2'), [HALL.hx * 2 + 3.2, 0.9, depth + 3.2], [0, H + 1.1, cz], band);
  roof.build({ cast: false });

  const steps = new Frame(ctx, [0, 0], 0, f.y);
  steps.box(k.stoneMat('#d4bd92'), [12, 0.25, 1.4], [0, 0.125, HALL.z1 + 1.6], { walkable: true });
  steps.build();

  const braziers = [];
  for (const [x, z] of [[-6, -26], [6, -26], [-6, -8], [6, -8]]) {
    const y = f.y + FLOOR;
    const stand = addMesh(ctx, new THREE.CylinderGeometry(0.12, 0.3, 1.2, 8), k.toon('#6b4a33'));
    stand.position.set(x, y + 0.6, z);
    const bowl = addMesh(ctx, new THREE.CylinderGeometry(0.6, 0.3, 0.4, 10), k.toon(GOLD));
    bowl.position.set(x, y + 1.35, z);
    ctx.addCollider({ x, z, hx: 0.5, hz: 0.5, rot: 0, top: y + 1.5 });
    ctx.exclude({ kind: 'circle', x, z, r: 1 });
    braziers.push({ x, y: y + 1.45, z, size: 1.2 });
    const light = new THREE.PointLight('#ffb060', 10, 14, 1.5);
    light.position.set(x, y + 2.4, z);
    ctx.scene.add(light);
    glow(ctx, [x, y + 1.9, z], 2.6, '#ffc070', 0.5, 0.08);
  }
  flames(ctx, braziers);
  return f.y + FLOOR;
}

function people(ctx, floorY) {
  const noah = kneeling(ctx, NOAH_COLORS, NOAH, { facing: [0, 0], scale: 1.5, bow: -0.05 });
  noah.position.y = floorY + 0.5 + 0.7 - 0.3;
  const crown = addMesh(ctx, new THREE.CylinderGeometry(0.21, 0.2, 0.18, 10, 1, true), ctx.kit.toon(GOLD, { side: THREE.DoubleSide }));
  crown.position.set(NOAH[0], noah.position.y + 1.13 * 1.5 + 0.08, NOAH[1]);

  const ab = figure(ctx, ABINADI_COLORS, ABINADI, { facing: NOAH, scale: 1.05, clear: 1.5 });
  ab.children[2].material = ctx.kit.toon('#ffe9c0', { emissive: '#d8b070' });
  raiseArm(ctx, ab, ABINADI_COLORS, 1, 2.4);
  const by = ctx.groundHeight(...ABINADI);
  glow(ctx, [ABINADI[0], by + 1.68, ABINADI[1]], 2.6, '#fff4d0', 0.55, 0.06);
  glow(ctx, [ABINADI[0], by + 1.2, ABINADI[1]], 5, '#ffe6b0', 0.2, 0.04);
  const pl = new THREE.PointLight('#fff0c8', 5, 7, 1.5);
  pl.position.set(ABINADI[0], by + 2.3, ABINADI[1]);
  ctx.scene.add(pl);

  const spearGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5);
  for (const [x, z] of [[-2.6, -13.5], [2.6, -13.5], [-2.2, -17.5], [2.2, -17.5], [-5, -28], [5, -28]]) {
    const g = figure(ctx, GUARD_COLORS, [x, z], { facing: z < -20 ? [0, 0] : ABINADI });
    const spear = new THREE.Mesh(spearGeo, ctx.kit.toon('#6b4a33'));
    spear.position.set(-0.32, 1.25, 0.1);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 6), ctx.kit.toon('#9aa0a6'));
    tip.position.y = 1.4;
    spear.add(tip);
    g.add(spear);
  }
}

export default {
  title: 'Mosiah 12-17: Abinadi before King Noah',
  subtitle: "King Noah's palace in the city of Nephi, his court of priests",
  seed: 17,

  style: { ...BASE_STYLE, fog: { color: '#e8d2aa', near: 120, far: 800 } },

  sky: { zenith: '#3a6f96', mid: '#80aac0', horizon: '#f2dcae', ground: '#c9b07a', glowColor: '#fff0c4', glowDir: [0.3, 0.4, 1] },

  sun: { dir: [0.35, 0.8, 0.5], color: '#fff0d4', intensity: 2.2, hemi: { sky: '#f0e0c8', ground: '#a07a52', intensity: 1.35 }, shadowSize: 60 },

  ground: {
    size: 1000, segments: 200, flatRadius: 160, hillHeight: 34, undulation: 0.05,
    plaza: { center: [0, 20], size: [40, 26] },
    colors: GROUND_COLORS,
  },

  mountains: { count: 30, distance: [460, 700], height: [60, 160], widthRatio: [1.4, 2.4], colors: ['#7aa08a', '#6f9a8a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 90, ring: [45, 220], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
  ],

  custom(ctx) {
    const floorY = hall(ctx);
    people(ctx, floorY);
  },

  crowd: {
    seed: 17,
    minSpacing: 0.85,
    colors: PRIESTS,
    groups: [
      { shape: 'rect', center: [-12.5, -17], size: [3.5, 22], count: 30, kneel: 1, facing: [0, -17], facingJitter: 0.2 },
      { shape: 'rect', center: [12.5, -17], size: [3.5, 22], count: 30, kneel: 1, facing: [0, -17], facingJitter: 0.2 },
      { shape: 'rect', center: [-6.5, -29.5], size: [3, 4], count: 6, facing: ABINADI },
      { shape: 'rect', center: [6.5, -29.5], size: [3, 4], count: 6, facing: ABINADI },
    ],
  },

  player: {
    start: [1.8, -10.5],
    lookAt: [-1.2, -30],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
