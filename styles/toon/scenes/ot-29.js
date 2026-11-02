// 1 Samuel 17: David runs toward Goliath in the valley of Elah, his sling whirling.
// x is east, z is south. The Philistines hold the northern hill, Israel the southern. The brook runs east to west.
import * as THREE from 'three';
import { ISRAEL, NO_PLAZA, PHILISTINES, along, armor, figure, merged, people, ribbon, rocks, rods, scatter, shield, spear, toonStyle } from './lib/ot-25-kit.js';
import { makeRng } from '../engine/util.js';

const GOLIATH = [0, -13];
const DAVID = [1.2, -2];
const BROOK = [[-200, 12], [-120, 9], [-60, 11], [-20, 8], [20, 10], [60, 7], [120, 10], [200, 8]];

const ISRAEL_ARMY = {
  ...ISRAEL,
  wraps: ['#8a7a5a', '#6b5a4a', '#b5523b', '#d9c7a3'],
};
const PHILISTINE_ARMY = {
  ...PHILISTINES,
  wraps: ['#b8904a', '#c8a050', '#a87a3a', '#7a2e3a'],
};

export default {
  title: '1 Samuel 17:40-51: David and Goliath',
  subtitle: 'The valley of Elah, Israel and the Philistines on the hills either side',
  seed: 29,

  style: toonStyle({ fog: '#ecd8b0', near: 140, far: 900 }),

  sky: { zenith: '#3a7cb0', mid: '#80b4d0', horizon: '#f2dcae', ground: '#d4b888', glowColor: '#fff2d0', glowDir: [0.6, 0.5, 0.5] },

  sun: {
    dir: [0.55, 0.8, 0.45],
    color: '#fff0d6',
    intensity: 2.6,
    hemi: { sky: '#d6e6ec', ground: '#a88a5a', intensity: 1.1 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 300,
    flatRadius: 18,
    hillHeight: 30,
    undulation: 0.3,
    plaza: NO_PLAZA,
    colors: {
      sand: '#c9b07a', dirt: '#b8955e', grass: '#9aa060', grassDark: '#7e8a4a', plaza: '#c9b07a', plazaLine: '#c9b07a',
      scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a8a068',
    },
  },

  mountains: { count: 26, distance: [500, 780], height: [50, 120], widthRatio: [1.6, 2.6], colors: ['#a8a07a', '#9a9a78', '#b0a884', '#8e9474'] },

  objects: [
    { type: 'trees', count: 70, ring: [90, 260], height: [4, 7], broken: 0, fallen: 0, trunkColor: '#6b5a4a', leafColors: ['#7d8f5a', '#6e8250', '#8a9a64'] },
    { type: 'stones', count: 160, ring: [3, 60], size: [0.15, 0.4], colors: ['#c9b08a', '#b89a70', '#d9c39a', '#a58a66'] },
  ],

  custom(ctx) {
    const rng = makeRng(29);

    // The brook, its bed of smooth stones.
    ribbon(ctx, along(BROOK, 2), { width: 6, color: '#b8a888', lift: 0.08 });
    ribbon(ctx, along(BROOK, 2), { width: 3, color: '#4f9ab0', lift: 0.16 });
    const pebbles = along(BROOK, 1.3).flatMap(([x, z]) => [[x + (rng() - 0.5) * 2, z + (rng() > 0.5 ? 2.1 : -2.1)]]);
    const pg = pebbles.map(([x, z]) => new THREE.IcosahedronGeometry(0.16 + rng() * 0.12, 1).scale(1.3, 0.7, 1).translate(x, ctx.terrainHeight(x, z) + 0.06, z));
    merged(ctx, pg, '#d8d0c0', { cast: false });
    rocks(ctx, [
      { pos: [-30, 30], size: [3, 2, 2.5] }, { pos: [34, -36], size: [3.5, 2.2, 3] }, { pos: [-44, -30], size: [4, 2.6, 3.2] },
      { pos: [46, 26], size: [3, 1.8, 2.6] }, { pos: [-14, -44], size: [2.4, 1.6, 2] },
    ], ['#b8a888', '#a8987a', '#c4b494']);

    // The Philistine host on the northern hill.
    const north = scatter(ctx, { center: [0, -60], rect: [170, 26], count: 1000, spacing: 0.85, seed: 3 });
    people(ctx, north.map((p) => ({ x: p.x, z: p.z, yaw: Math.atan2(-p.x * 0.2, 40) + (p.r - 0.5) * 0.4 })), PHILISTINE_ARMY, { seed: 4 });
    // Israel on the southern hill, behind the player.
    const south = scatter(ctx, { center: [0, 60], rect: [170, 26], count: 1000, spacing: 0.85, seed: 5 });
    people(ctx, south.map((p) => ({ x: p.x, z: p.z, yaw: Math.atan2(-p.x * 0.2, -40) + (p.r - 0.5) * 0.4 })), ISRAEL_ARMY, { seed: 6 });

    const spearList = [];
    for (const [list, sign] of [[north, 1], [south, -1]]) {
      list.forEach((p, i) => {
        if (i % 2) return;
        const y = ctx.terrainHeight(p.x, p.z);
        spearList.push({ from: [p.x + 0.3, y + 0.1, p.z], to: [p.x + 0.3 + (p.r - 0.5) * 0.3, y + 3.0, p.z + sign * 0.15] });
      });
    }
    rods(ctx, spearList, '#5a4030', 0.03);

    const banners = [];
    const poles = [];
    for (let i = 0; i < 9; i++) {
      for (const [z, c] of [[-50, '#7a2e3a'], [50, '#2f4f6e']]) {
        const x = -80 + i * 20;
        const y = ctx.terrainHeight(x, z);
        poles.push({ from: [x, y, z], to: [x, y + 6.5, z] });
        banners.push({ g: new THREE.BoxGeometry(1.8, 1.2, 0.05).translate(x + 0.95, y + 5.8, z), c });
      }
    }
    rods(ctx, poles, '#4a3020', 0.06);
    merged(ctx, banners.filter((b) => b.c === '#7a2e3a').map((b) => b.g), '#7a2e3a');
    merged(ctx, banners.filter((b) => b.c === '#2f4f6e').map((b) => b.g), '#2f4f6e');

    // Goliath of Gath: helmet and coat of mail of brass, a spear like a weaver's beam.
    const g = figure(ctx, { pos: GOLIATH, facing: DAVID, scale: 2.0, colors: { robe: '#6b4a33', mantle: '#8a6a3a', skin: '#b5825a', hair: '#2b1a12', sash: '#c8a050' }, clear: 2.5 });
    armor(ctx, g, { metal: '#c8a050', crest: '#7a2e3a' });
    spear(ctx, g, { side: 1, length: 3.3, color: '#5a3a22', radius: 0.05, tip: '#8a8a90' });
    const greaves = [-1, 1].map((s) => new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.45, 8), ctx.kit.toon('#c8a050')));
    greaves.forEach((m, i) => {
      m.position.set(i ? 0.12 : -0.12, 0.28, 0.2);
      g.children[0].add(m);
    });
    rods(ctx, [{ from: [GOLIATH[0] - 0.5, 1.6, GOLIATH[1]], to: [GOLIATH[0] - 0.9, 3.1, GOLIATH[1] + 0.4], ground: true, radius: 0.08 }], '#9a9a9a');
    ctx.addCollider({ x: GOLIATH[0], z: GOLIATH[1], hx: 0.7, hz: 0.7, rot: 0, top: ctx.terrainHeight(...GOLIATH) + 3.6 });

    // His shield bearer going before him.
    const sb = figure(ctx, { pos: [-1.7, -10], facing: DAVID, colors: { robe: '#7a2e3a', mantle: '#c8a050', skin: '#b5825a', hair: '#2b1a12' } });
    shield(ctx, sb, { color: '#a87a3a', boss: '#c8a050', round: false, side: 0, size: 0.55 });
    armor(ctx, sb, { metal: '#a8884a' });

    // David, a youth with his staff left behind, running with his sling.
    const d = figure(ctx, { pos: DAVID, facing: GOLIATH, scale: 0.9, lean: 0.12, colors: { robe: '#d9c7a3', mantle: '#b5523b', skin: '#c08f66', hair: '#5a3a22', sash: '#8c5a3c', arms: [0.4, 0.3] } });
    const pouch = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 5, 10), ctx.kit.toon('#5a3a22'));
    const sling = new THREE.Group();
    sling.position.set(0.25, 2.05, 0);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4).rotateZ(Math.PI / 2).translate(0.35, 0, 0), ctx.kit.toon('#5a3a22'));
    pouch.position.set(0.7, 0, 0);
    const stone = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), ctx.kit.toon('#d8d0c0'));
    stone.position.set(0.7, 0, 0);
    sling.add(cord, pouch, stone);
    d.children[0].add(sling);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), ctx.kit.toon('#c08f66'));
    arm.position.set(0.24, 1.78, 0);
    arm.rotation.z = -0.25;
    d.children[0].add(arm);
    ctx.onFrame((t) => (sling.rotation.y = t * 9));
    // Shepherd's bag with the other stones.
    const bag = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6).scale(1, 1.2, 0.7), ctx.kit.toon('#8c6a46'));
    bag.position.set(-0.25, 0.95, 0.1);
    d.children[0].add(bag);

    // Saul's armour, put off and left on the ground behind him.
    merged(ctx, [
      new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55).translate(3.4, ctx.terrainHeight(3.4, 6) + 0.05, 6),
      new THREE.CylinderGeometry(0.24, 0.22, 0.42, 10).rotateZ(Math.PI / 2).translate(4.1, ctx.terrainHeight(4.1, 6.4) + 0.2, 6.4),
    ], '#8a8a90');
    rods(ctx, [{ from: [2.4, 0.05, 6.6], to: [4.8, 0.05, 5.6], ground: true, radius: 0.03 }], '#4a3020');
  },

  player: {
    start: [4.5, -1.5],
    lookAt: [-1, -12],
    colors: { robe: '#7a6a52', mantle: '#2f4f6e', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
