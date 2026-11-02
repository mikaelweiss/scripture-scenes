// Alma 48-50: Moroni rings the Nephite cities with ridges of earth, timber pickets and towers.
// x is east, z is south. The city lies north of the start, its gate facing the player.
import * as THREE from 'three';
import { army, banner, baseStyle, cyl, drapeRect, drapeRing, figure, groundSpec, house, arm, merge, NEPHITE, put, tower, trees } from './lib/bom-31-kit.js';

const CITY = [0, -62];
const R = 44;

// Earth ridge ring with pickets on its crest; a gap at angle `gate` (0 is south).
function fortify(ctx, [cx, cz], r, { gate = 0, gap = 0.1, towers = 8, collide = true, ridgeH = 3.2, base = 7 } = {}) {
  const k = ctx.kit;
  const n = Math.round((Math.PI * 2 * r) / 3);
  const shape = new THREE.Shape();
  shape.moveTo(-base / 2, 0);
  shape.lineTo(-1.2, ridgeH);
  shape.lineTo(1.2, ridgeH);
  shape.lineTo(base / 2, 0);
  shape.lineTo(-base / 2, 0);
  const ridges = [], pickets = [], tips = [], rails = [];
  const inGap = (a) => Math.abs(Math.atan2(Math.sin(a - gate), Math.cos(a - gate))) < gap;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (inGap(a)) continue;
    const chord = ((Math.PI * 2 * r) / n) * 1.04;
    const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
    const y = ctx.terrainHeight(x, z) - 0.3;
    const g = new THREE.ExtrudeGeometry(shape, { depth: chord, bevelEnabled: false });
    g.translate(0, 0, -chord / 2);
    g.rotateY(Math.PI / 2);
    g.rotateY(a);
    g.translate(x, y, z);
    ridges.push(g);
    const per = 6;
    for (let p = 0; p < per; p++) {
      const t = (p + 0.5) / per - 0.5;
      const px = x + Math.cos(a) * chord * t, pz = z - Math.sin(a) * chord * t;
      const h = 2.6 + ((i * 7 + p * 3) % 5) * 0.1;
      pickets.push(cyl(0.2, 0.22, h, px, y + ridgeH + h / 2 - 0.2, pz, 5));
      const tip = new THREE.ConeGeometry(0.2, 0.5, 5);
      tip.translate(px, y + ridgeH + h - 0.2 + 0.25, pz);
      tips.push(tip);
    }
    for (const ry of [1.0, 2.0]) {
      const rail = new THREE.BoxGeometry(chord, 0.14, 0.14);
      rail.rotateY(a);
      rail.translate(x + Math.sin(a) * 0.25, y + ridgeH + ry, z + Math.cos(a) * 0.25);
      rails.push(rail);
    }
    if (collide) {
      ctx.addCollider({ x, z, hx: chord / 2, hz: base / 2, rot: a, top: y + ridgeH + 3 });
      ctx.exclude({ kind: 'rect', x, z, hx: chord / 2, hz: base / 2 + 1, rot: a });
    }
  }
  put(ctx, merge(ridges), '#a8784a', 0, 0, { y: 0 });
  put(ctx, merge(pickets), '#7a5a3a', 0, 0, { y: 0 });
  put(ctx, merge(tips), '#9a7048', 0, 0, { y: 0, cast: false });
  put(ctx, merge(rails), '#5e4632', 0, 0, { y: 0, cast: false });
  // The ditch dug outside the ridge, the earth thrown up to make it.
  const ditchArcs = [[gate + gap, gate + Math.PI * 2 - gap]];
  for (const arc of ditchArcs) {
    drapeRing(ctx, cx, cz, r + base / 2 + 0.5, r + base / 2 + 5, '#6e4a30', { arc, seg: 160 });
    drapeRing(ctx, cx, cz, r + base / 2 + 1.5, r + base / 2 + 4, '#4f3424', { arc, seg: 160, lift: 0.06 });
  }
  const tops = [];
  for (let t = 0; t < towers; t++) {
    const a = gate + ((t + 0.5) / towers) * Math.PI * 2;
    const tx = cx + Math.sin(a) * (r - 6), tz = cz + Math.cos(a) * (r - 6);
    tops.push({ top: tower(ctx, tx, tz, { h: 7.5, rot: a + Math.PI }), x: tx, z: tz, a });
  }
  for (const s of [-1, 1]) {
    const a = gate + s * (gap + 0.06);
    const tx = cx + Math.sin(a) * (r - 1), tz = cz + Math.cos(a) * (r - 1);
    tops.push({ top: tower(ctx, tx, tz, { h: 8.5, rot: a + Math.PI, roof: '#b5523b' }), x: tx, z: tz, a });
  }
  return tops;
}

export default {
  title: "Alma 48-50: Moroni's fortifications",
  subtitle: 'Ridges of earth, pickets and towers around the cities of the Nephites',
  seed: 48,

  style: baseStyle({ fog: { color: '#e9d6ae', near: 140, far: 1000 } }),

  sky: { zenith: '#2f6f8c', mid: '#79acc0', horizon: '#f0dcae', ground: '#d9b98a', glowColor: '#fff0c8', glowDir: [0.6, 0.5, -0.6] },

  sun: { dir: [0.6, 0.8, 0.35], color: '#fff2d8', intensity: 2.5, hemi: { sky: '#d6ece2', ground: '#b07a52', intensity: 1.1 }, shadowSize: 80 },

  ground: groundSpec({ hillHeight: 34, flatRadius: 170, undulation: 0.25, plaza: { center: [0, -78], size: [26, 20] } }),

  mountains: { count: 30, distance: [520, 820], height: [70, 170], widthRatio: [1.4, 2.4], colors: ['#6f9a8a', '#5d8c84', '#7da08a', '#86a38f'] },

  objects: [
    {
      type: 'stepPyramid', pos: [0, -86], base: [20, 18], tiers: 3, tierHeight: 2.6, inset: 2.2,
      stair: { width: 5, extra: 2, rise: 0.42 }, shrine: { size: [8, 6, 4], comb: 2.2 }, rubble: 0,
      colors: { stone: '#e3cfa6', stair: '#d8c095', shrine: '#b5523b', interior: '#2b1a12', fret: ['#3e8e6e', '#efe3c2'], roofFret: ['#b5523b', '#efe3c2'] },
    },
    { type: 'trees', count: 70, ring: [120, 260], height: [6, 10], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#3e8e6e', '#4f9a74', '#2f7f6a', '#5f9e6a'] },
    { type: 'stones', count: 300, ring: [8, 110], size: [0.12, 0.4], colors: ['#cdb48a', '#b89a70', '#a58a66'] },
  ],

  custom(ctx) {
    const tops = fortify(ctx, CITY, R);
    // A sister city on the far plain, fortified the same way.
    fortify(ctx, [210, -330], 34, { gate: 2.6, towers: 6, collide: false });

    // Timber bridge over the ditch at the gate, and the road in.
    drapeRect(ctx, 0, -12, 5, 9, '#9a7048', { lift: 0.12 });
    drapeRect(ctx, 0, 6, 4.5, 30, '#c9a46e', { lift: 0.05 });

    // Houses inside the walls.
    const homes = [
      [-20, -40, 0.2], [-30, -55, 0.5], [-28, -74, 1.2], [-16, -92, 0.1], [18, -42, -0.3], [29, -58, -0.6],
      [27, -78, -1.1], [16, -95, 0.3], [-10, -58, 0.0], [12, -60, 0.1], [-6, -104, 0.2], [34, -66, -1.5],
    ];
    homes.forEach(([x, z, rot], i) => house(ctx, x, z, { rot, w: 6 + (i % 3), d: 5, h: 3 + (i % 2) * 0.6, color: ['#d6bf95', '#e3cfa6', '#cdb48a'][i % 3], roof: ['#a87b4f', '#8c5a3c'][i % 2] }));
    trees(ctx, [[-36, -64, 6], [36, -48, 6], [-4, -44, 5], [8, -76, 5], [-38, -80, 6]]);

    // Moroni at the gate with the title of liberty on its pole.
    const moroni = figure(ctx, { robe: '#8c2f22', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#efe3c2', arms: [0.4, 0.5] }, 4.5, -8, { face: [0, 40], scale: 1.1 });
    arm(moroni, ctx, { shield: '#c8912e', rim: '#8c2f22' });
    banner(ctx, 6.2, -8.5, { h: 6, color: '#efe3c2', trim: '#8c2f22', w: 1.4, fh: 1.8 });

    // Watchmen on every tower.
    for (const t of tops) {
      const w = figure(ctx, { robe: '#7a6a52', mantle: '#8c5a3c', skin: '#9c6a45', hair: '#2b1a12' }, t.x + Math.sin(t.a) * 0.6, t.z + Math.cos(t.a) * 0.6, { y: t.top, yaw: t.a, clear: 0 });
      arm(w, ctx, { shield: '#b5523b' });
    }

    // Soldiers drawn up inside the gate.
    army(ctx, { center: [0, -24], rows: 6, cols: 9, spacing: 1.2, yaw: 0, seed: 3, crest: true, shields: ['#b5523b', '#c8912e'] });
    army(ctx, { center: [-11, -30], rows: 4, cols: 6, spacing: 1.2, yaw: 0.3, seed: 4, crest: true });
    army(ctx, { center: [11, -30], rows: 4, cols: 6, spacing: 1.2, yaw: -0.3, seed: 6, crest: true });
  },

  crowd: {
    seed: 31,
    minSpacing: 0.9,
    facing: CITY,
    colors: NEPHITE,
    aisles: [{ from: [0, 30], to: [0, -14], width: 5 }],
    groups: [
      { center: CITY, radius: [R + 7, R + 14], angle: [0.25, 1.6], count: 70, kneel: 0.45, facingJitter: 1.2 },
      { center: CITY, radius: [R + 7, R + 14], angle: [-1.6, -0.25], count: 70, kneel: 0.45, facingJitter: 1.2 },
      { shape: 'rect', center: [-14, 14], size: [12, 10], count: 25, kneel: 0.2, facingJitter: 1.5 },
      { shape: 'rect', center: [16, 18], size: [10, 10], count: 20, kneel: 0.3, facingJitter: 1.5 },
      { center: CITY, radius: [4, 30], count: 90, children: 0.2, facingJitter: 3 },
    ],
  },

  player: {
    start: [-5, 22],
    lookAt: [0, -40],
    colors: { robe: '#7a6a52', mantle: '#b5523b', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
