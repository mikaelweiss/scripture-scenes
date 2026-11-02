// Alma 22: Aaron teaches the father of Lamoni in the great king's palace in the land of Nephi.
// The throne hall opens to the south through a colonnade so the third-person camera sees inside.
import * as THREE from 'three';
import { add, armor, baseStyle, block, brazier, canvasTexture, clothes, fretBand, groundColors, houses, person, spear, steps } from './lib/bom-25-kit.js';

const KING = [0, -21];
const AARON = [0, -12.5];
const COURT = [0, -15];
const FLOOR = 1.2;

const C = {
  wall: '#e3cfa6',
  floor: '#d8c095',
  stair: '#cdb48a',
  red: '#b5523b',
  jade: '#3e8e6e',
  cream: '#efe3c2',
  gold: '#d9a441',
  ink: '#2b1a12',
};

function palace(ctx) {
  const k = ctx.kit;
  const y0 = ctx.terrainHeight(0, -11) - 0.1;
  const base = y0 + FLOOR;
  block(ctx, [38, FLOOR + 0.1, 32], [0, y0 - 0.1, -11], C.floor, { walkable: true });
  steps(ctx, { x: 0, z: 5, y0, y1: base, width: 14, rise: 0.3, depth: 0.5, dir: [0, 1], color: C.stair });

  const H = 8;
  block(ctx, [38, H + 1.4, 1], [0, base, -26.5], C.wall);
  for (const s of [-1, 1]) {
    block(ctx, [1, H + 1.4, 32], [s * 18.5, base, -11], C.wall);
    fretBand(ctx, [1.3, 0.9, 32.3], [s * 18.5, base + H - 1.4, -11], [C.red, C.cream]);
    fretBand(ctx, [1.2, 0.5, 32.2], [s * 18.5, base + 0.2, -11], [C.jade, C.cream]);
  }
  fretBand(ctx, [38, 0.9, 1.3], [0, base + H - 1.4, -26.5], [C.red, C.cream]);
  fretBand(ctx, [38, 0.5, 1.2], [0, base + 0.2, -26.5], [C.jade, C.cream]);

  for (const x of [-16.5, -11.5, -6.5, 6.5, 11.5, 16.5]) {
    add(ctx, new THREE.CylinderGeometry(0.7, 0.8, H, 12).translate(0, H / 2, 0), k.stoneMat(C.wall), { pos: [x, base, 3.5] });
    block(ctx, [2, 0.5, 2], [x, base + H - 0.5, 3.5], C.stair, { collide: false });
    ctx.addCollider({ x, z: 3.5, hx: 0.75, hz: 0.75, rot: 0, top: base + H });
    for (const zz of [-4, -12, -20]) {
      if (Math.abs(x) > 15) continue;
      add(ctx, new THREE.CylinderGeometry(0.55, 0.62, H, 12).translate(0, H / 2, 0), k.stoneMat(C.wall), { pos: [x, base, zz] });
      ctx.addCollider({ x, z: zz, hx: 0.6, hz: 0.6, rot: 0, top: base + H });
    }
  }
  const lintel = fretBand(ctx, [38.4, 1.4, 1.6], [0, base + H, 3.5], [C.red, C.cream]);
  lintel.castShadow = false;
  const roof = block(ctx, [39.5, 0.7, 33.5], [0, base + H + 1.4, -11.2], C.stair, { collide: false });
  roof.castShadow = false;
  const crest = fretBand(ctx, [30, 1.6, 0.8], [0, base + H + 2.1, 3.4], [C.jade, C.cream]);
  crest.castShadow = false;

  // Dais and throne.
  block(ctx, [14, 0.45, 8], [0, base, -22], C.stair, { walkable: true });
  block(ctx, [9, 0.45, 5.5], [0, base + 0.45, -23.2], C.floor, { walkable: true });
  fretBand(ctx, [14.1, 0.3, 8.1], [0, base + 0.1, -22], [C.jade, C.cream]);
  block(ctx, [2.2, 0.75, 1.4], [0, base + 0.9, -21.6], C.jade, { stone: false });
  block(ctx, [2.6, 3.6, 0.5], [0, base + 0.9, -22.5], C.jade, { stone: false });
  fretBand(ctx, [2.8, 0.7, 0.6], [0, base + 4.2, -22.5], [C.gold, C.red]);
  const disc = add(ctx, new THREE.CircleGeometry(0.85, 24), k.toon(C.gold), { pos: [0, base + 3.7, -22.2] });
  disc.castShadow = false;

  // Hangings behind the throne.
  const hanging = canvasTexture(128, 512, (g, w, h) => {
    g.fillStyle = C.red;
    g.fillRect(0, 0, w, h);
    g.fillStyle = C.gold;
    for (let y = 30; y < h; y += 70) {
      g.beginPath();
      g.moveTo(w / 2, y);
      g.lineTo(w - 25, y + 30);
      g.lineTo(w / 2, y + 60);
      g.lineTo(25, y + 30);
      g.closePath();
      g.fill();
    }
    g.fillStyle = C.jade;
    g.fillRect(0, 0, 14, h);
    g.fillRect(w - 14, 0, 14, h);
  });
  for (const x of [-7, 7]) add(ctx, new THREE.PlaneGeometry(2.4, 6.2), k.toon('#ffffff', { map: hanging, side: THREE.DoubleSide }), { pos: [x, base + 4.2, -25.9], cast: false });

  for (const [x, z] of [[-5, -17], [5, -17], [-5, -7], [5, -7]]) brazier(ctx, [x, z], { y: base, color: '#5e4632' });

  // Aaron's scroll of the scriptures.
  const scroll = new THREE.Group();
  const roll = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8).rotateZ(Math.PI / 2);
  scroll.add(new THREE.Mesh(roll, k.toon('#6b4a33')));
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.36), k.toon(C.cream, { side: THREE.DoubleSide }));
  sheet.rotation.x = -1.1;
  sheet.position.set(0, 0.06, 0.12);
  scroll.add(sheet);
  scroll.position.set(AARON[0], base + 1.1, AARON[1] - 0.4);
  ctx.scene.add(scroll);

  // People of the court.
  const king = person(ctx, { robe: '#c8912e', mantle: C.red, skin: '#9c6a45', hair: C.ink, sash: C.jade }, KING, [0, 0], { y: base + 0.95, sit: true, scale: 1.05 });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.14, 10), k.toon(C.gold));
  crown.position.y = 1.62 - 1.46 * 0.28;
  king.add(crown);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.42, 4), k.toon(i % 2 ? C.jade : '#2f8f8a'));
    f.position.set(Math.sin(a) * 0.12, crown.position.y + 0.25, Math.cos(a) * 0.12 - 0.03);
    f.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35);
    king.add(f);
  }
  person(ctx, { robe: '#e6d8b8', mantle: '#3e6e66', skin: '#a87650', hair: C.ink, sash: C.gold }, [2.6, -21.2], [0, -12], { y: base + 0.9 });
  person(ctx, { robe: '#a87b4f', mantle: '#e6d8b8', skin: '#b5825a', hair: '#3a2418', sash: '#6b4a33', arms: [0.35, 0.95] }, AARON, KING);
  person(ctx, { robe: '#8c5a3c', mantle: '#d9c7a3', skin: '#b5825a', hair: '#4a3020' }, [-2, -10.5], KING);
  for (const [x, z, s] of [[-4.2, -21, 1], [4.6, -21, -1], [-9, 3.2, 1], [9, 3.2, -1], [-4.5, 3.2, 1], [4.5, 3.2, -1]]) {
    const g = person(ctx, { robe: '#7a6a52', mantle: C.red, skin: '#8a5a3b', hair: C.ink }, [x, z], z < 0 ? [x, 0] : [x, 30], { y: z < 0 ? base + 0.45 : base });
    armor(ctx, g);
    spear(ctx, g, { side: s });
  }
}

export default {
  title: 'Alma 22: Aaron teaches Lamoni\'s father',
  subtitle: 'The great king\'s palace in the land of Nephi',
  seed: 22,

  style: { ...baseStyle, fog: { color: '#efd8ad', near: 140, far: 1100 } },

  sky: { zenith: '#2f6f8c', mid: '#79acb4', horizon: '#f3dcaa', ground: '#d9b98a', glowColor: '#fff0c4', glowDir: [0.4, 0.5, 0.7] },

  sun: { dir: [0.35, 0.8, 0.75], color: '#fff0d6', intensity: 2.4, hemi: { sky: '#e2efe6', ground: '#b07a52', intensity: 1.35 }, shadowSize: 60 },

  ground: { size: 1600, segments: 300, flatRadius: 140, hillHeight: 40, undulation: 0.3, plaza: { center: [0, 14], size: [56, 26] }, colors: groundColors },

  mountains: { count: 34, distance: [520, 800], height: [80, 190], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    { type: 'trees', count: 120, ring: [55, 230], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 300, ring: [30, 120], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#a58a66'] },
  ],

  custom(ctx) {
    palace(ctx);
    houses(ctx, { ring: [42, 110], count: 34, colors: ['#e3cfa6', '#d6bf95', '#cdb48a'], roof: '#8c5a3c', avoid: (x, z) => Math.abs(x) < 24 && z > -30 && z < 40 });
  },

  clouds: {
    layers: [{ count: 40, distance: [350, 800], height: [80, 180], size: [40, 90], color: '#fff6e4', shade: '#5a6a82' }],
  },

  light: {
    glows: [{ at: AARON, lift: FLOOR + 1.2, size: 3, color: '#fff3d0', opacity: 0.25 }],
    pointLights: [{ at: COURT, lift: FLOOR + 6, color: '#ffe6b0', intensity: 10, distance: 26 }],
  },

  crowd: {
    seed: 25,
    minSpacing: 0.7,
    facing: COURT,
    colors: clothes,
    groups: [
      { shape: 'rect', center: [-11, -12], size: [7, 18], count: 45, facing: [0, -16] },
      { shape: 'rect', center: [11, -12], size: [7, 18], count: 45, facing: [0, -16] },
      { shape: 'rect', center: [-6.5, -2], size: [4, 4], count: 8, facing: KING, kneel: 0.3 },
      { shape: 'rect', center: [6.5, -2], size: [4, 4], count: 8, facing: KING, kneel: 0.3 },
      { shape: 'rect', center: [0, 18], size: [40, 14], count: 50, facing: [0, 0], children: 0.15 },
    ],
    aisles: [{ from: [0, 30], to: [0, 4], width: 4 }],
  },

  player: {
    start: [0, 9],
    lookAt: KING,
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
