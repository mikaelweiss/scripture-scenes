// Judges 7: Gideon's three hundred break their pitchers around the camp of Midian at night.
// x is east, z is south. The Midianite camp fills the valley at the origin. Gideon's company stands south.
import * as THREE from 'three';
import { ISRAEL, NO_PLAZA, camels, campfires, figure, flames, longTents, merged, moon, people, pointLight, rods, shards, stars, tents, toonStyle } from './lib/ot-25-kit.js';
import { makeRng } from '../engine/util.js';

const CAMP = [0, 0];
const START = [-6, 47];
const GIDEON = [-2.5, 42.6];

const MIDIAN = {
  robes: ['#5a3a5a', '#3e2e4a', '#6b3a2a', '#2e3a4a', '#7a5a3a', '#4a2a2a', '#8a6a4a'],
  mantles: ['#2a1e2e', '#5a2a2a', '#c8912e', '#3a4a5a', '#6b4a33'],
  skins: ['#8a5a3b', '#9c6a45', '#7a4e33'],
  hair: ['#1f140e', '#2b1a12'],
  wraps: ['#c8912e', '#b5523b', '#e0c070', '#d9c7a3'],
};

const GIDEON_MEN = {
  robes: ['#6b5a4a', '#5e4632', '#7a6a52', '#4a4a3a', '#8c5a3c', '#6f6a52'],
  mantles: ['#3a2a22', '#4a3a30', '#5e4632', '#2f3e3a'],
  skins: ISRAEL.skins,
  hair: ISRAEL.hair,
  wraps: ['#d9c7a3', '#a87b4f', '#c8a97a'],
};

// Three companies on the ring around the camp, two ranks deep.
function companies() {
  const men = [];
  const rng = makeRng(25);
  const centers = [0, 2.15, -2.15];
  for (const c of centers) {
    for (let i = 0; i < 100; i++) {
      const rank = i % 2;
      const a = c + ((Math.floor(i / 2) / 49) - 0.5) * 0.95 + (rng() - 0.5) * 0.012;
      const r = 50 + rank * 1.6 + (rng() - 0.5) * 0.5;
      men.push({ x: Math.sin(a) * r, z: Math.cos(a) * r, a, rank });
    }
  }
  return men;
}

export default {
  title: "Judges 7:16-22: Gideon's three hundred",
  subtitle: 'The camp of Midian in the valley, the beginning of the middle watch',
  seed: 25,

  style: toonStyle({ fog: '#141a36', near: 60, far: 380, ink: '#0b0a14' }),

  sky: { zenith: '#05081a', mid: '#121a40', horizon: '#2c3366', ground: '#10142a', glowColor: '#3a4680', glowDir: [0.5, 0.35, -0.8] },

  sun: {
    dir: [0.5, 0.7, -0.6],
    color: '#9eb2ee',
    intensity: 1.3,
    hemi: { sky: '#4c5ea6', ground: '#3a2e3a', intensity: 1.05 },
    shadowSize: 70,
  },

  ground: {
    size: 1200,
    segments: 240,
    flatRadius: 62,
    hillHeight: 34,
    undulation: 0.3,
    plaza: NO_PLAZA,
    colors: {
      sand: '#5a5470', dirt: '#4a4460', grass: '#3a4a58', grassDark: '#2e3c48', plaza: '#5a5470', plazaLine: '#5a5470',
      scorch: '#1a1620', scorchEdge: '#2a2430', hill: '#2c3a4c',
    },
  },

  mountains: { count: 28, distance: [380, 640], height: [50, 130], widthRatio: [1.4, 2.4], colors: ['#1e2850', '#24305a', '#1a2246', '#2a3662'] },

  objects: [
    { type: 'trees', count: 40, ring: [75, 170], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#2a2230', leafColors: ['#1f3442', '#26404a', '#1a2e3a'] },
    { type: 'stones', count: 260, ring: [4, 70], size: [0.12, 0.35], colors: ['#5a566c', '#4a4658', '#625e74'] },
  ],

  custom(ctx) {
    stars(ctx, { count: 1100 });
    moon(ctx, { dir: [0.5, 0.33, -0.8], size: 12 });

    const rng = makeRng(7);
    const tentList = [], longList = [], camelList = [], fires = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, r = 14 + (i % 3) * 7;
      fires.push({ pos: [Math.sin(a) * r, Math.cos(a) * r], size: 1.1, light: 20, lightDistance: 24 });
    }
    for (let i = 0; i < 70; i++) {
      const a = rng() * Math.PI * 2, r = 6 + Math.sqrt(rng()) * 32;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (tentList.concat(longList, fires).some((t) => Math.hypot(t.pos[0] - x, t.pos[1] - z) < 5)) continue;
      if (i % 3 === 0) longList.push({ pos: [x, z], size: [5 + rng() * 3, 3.6], rot: rng() * 3, height: 2.1 });
      else tentList.push({ pos: [x, z], radius: 1.6 + rng() * 0.8, height: 2.4 + rng() * 0.8 });
    }
    tents(ctx, tentList, ['#3a2a22', '#4a3a30', '#5e4632', '#2e2420', '#6b4a33']);
    longTents(ctx, longList);
    campfires(ctx, fires);
    for (let i = 0; i < 46; i++) {
      const a = rng() * Math.PI * 2, r = 8 + Math.sqrt(rng()) * 34;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (ctx.blocked(x, z, 1)) continue;
      camelList.push({ pos: [x, z], couched: rng() < 0.55, rot: rng() < 0.4 ? -Math.PI / 2 + (rng() - 0.5) : rng() * 6.28 });
    }
    camels(ctx, camelList);

    // Midianites who have fallen asleep or fallen in the confusion.
    for (let i = 0; i < 18; i++) {
      const a = rng() * Math.PI * 2, r = 5 + rng() * 30;
      const x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (ctx.blocked(x, z, 0.8)) continue;
      figure(ctx, { pos: [x, z], yaw: rng() * 6.28, pose: rng() < 0.5 ? 'lie' : 'prone', roll: (rng() - 0.5) * 0.6, clear: 1,
        colors: { robe: MIDIAN.robes[i % MIDIAN.robes.length], mantle: MIDIAN.mantles[i % 5], skin: MIDIAN.skins[i % 3], hair: '#1f140e' } });
    }

    // Gideon's three hundred: torch held high in the right hand, trumpet at the lips, pitcher shards at the feet.
    const men = companies();
    const torchFlames = [], poles = [], horns = [], shardSpots = [];
    const list = men.map((m) => {
      const y = ctx.terrainHeight(m.x, m.z);
      const yaw = Math.atan2(-m.x, -m.z);
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      const rx = -fz, rz = fx;
      const hx = m.x + rx * 0.34 + fx * 0.1, hz = m.z + rz * 0.34 + fz * 0.1;
      poles.push({ from: [hx, y + 1.2, hz], to: [hx + rx * 0.06, y + 2.45, hz + rz * 0.06] });
      torchFlames.push({ pos: [hx + rx * 0.06, y + 2.45, hz + rz * 0.06], size: 0.55 });
      horns.push({ x: m.x - rx * 0.05 + fx * 0.14, y: y + 1.55, z: m.z - rz * 0.05 + fz * 0.14, yaw, lx: -rx, lz: -rz });
      if (m.rank === 0) shardSpots.push([m.x + fx * 0.7, m.z + fz * 0.7]);
      ctx.exclude({ kind: 'circle', x: m.x, z: m.z, r: 0.5 });
      return { x: m.x, z: m.z, y, yaw };
    });
    people(ctx, list, GIDEON_MEN, { seed: 30 });
    rods(ctx, poles, '#4a3020', 0.04);
    flames(ctx, torchFlames, { glowSize: 2.6, glowOpacity: 0.7 });
    shards(ctx, shardSpots, '#a85a3a', { per: 3, spread: 0.45 });

    // Ram's horn trumpets: curved cones raised from the mouth toward the sky.
    const hornGeos = [];
    for (const h of horns) {
      const g = new THREE.ConeGeometry(0.075, 0.55, 7, 1, true).rotateX(Math.PI).translate(0, 0.275, 0);
      g.rotateX(Math.PI / 2 - 0.55).rotateY(h.yaw).translate(h.x, h.y, h.z);
      hornGeos.push(g);
    }
    merged(ctx, hornGeos, '#b89a6a').material = ctx.kit.toon('#b89a6a', { side: THREE.DoubleSide });

    for (let i = 0; i < 3; i++) {
      const a = [0, 2.15, -2.15][i];
      for (const d of [-0.32, 0.32]) pointLight(ctx, [Math.sin(a + d) * 52, 4.5, Math.cos(a + d) * 52], { color: '#ffaa55', intensity: 22, distance: 28 });
    }

    // Gideon at the front of his company, crying "The sword of the Lord, and of Gideon."
    figure(ctx, { pos: GIDEON, facing: CAMP, scale: 1.05, pose: 'raise', colors: { robe: '#8c5a3c', mantle: '#5e4632', skin: '#a87650', hair: '#2b1a12', sash: '#c8912e', arms: [0.5, 2.7] } });
    flames(ctx, [{ pos: [GIDEON[0] + 0.55, ctx.terrainHeight(...GIDEON) + 3.1, GIDEON[1] - 0.2], size: 0.7 }], { glowSize: 3.5 });
    pointLight(ctx, [GIDEON[0] + 0.5, 3.6, GIDEON[1] + 0.6], { color: '#ffaa55', intensity: 18, distance: 14 });
  },

  crowd: {
    seed: 25,
    minSpacing: 0.8,
    facing: [40, -10],
    colors: MIDIAN,
    groups: [
      { center: CAMP, radius: [3, 36], count: 260, facingJitter: 4, lean: 0.2 },
      { center: [24, -6], radius: [0, 12], count: 90, facing: [120, -30], facingJitter: 0.8, lean: 0.25 },
      { center: [-10, 14], radius: [0, 10], count: 50, facing: [-10, 40], facingJitter: 1.4, lean: 0.15 },
    ],
  },

  player: {
    start: START,
    lookAt: [4, 0],
    colors: { robe: '#7a6a52', mantle: '#3a2a22', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
