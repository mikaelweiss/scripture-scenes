// Acts 27:39-28:6: the ship runs aground and breaks apart in the surf; all 276 come safe to land on Malta.
// In the cold rain the islanders kindle a fire, and a viper fastens on Paul's hand; he shakes it off into the fire.
// The sea lies north. The wreck is stuck offshore to the north-east, the fire burns on the beach.
import * as THREE from 'three';
import { Batch, boulders, campfire, DAY_STYLE, flames, glow, PALETTE, person } from './lib/nt-32-kit.js';
import { beach, buildShip, calmWater, foamLine, rain } from './lib/nt-32-sea.js';

const shore = (x) => -12 + 2.5 * Math.sin(x * 0.05) + 1.5 * Math.sin(x * 0.13 + 2);
const FIRE = [0, 4];
const PAUL = [1.5, 3.1];
const WRECK = [16, -58];

function seaDrawn(x, z, y) {
  const d = shore(x) - z;
  if (d <= -6) return y;
  const k = THREE.MathUtils.smoothstep(d, -6, 4);
  return y * (1 - k) + k * (-0.6 - Math.min(Math.max(d, 0) * 0.2, 4));
}

export default {
  title: 'Acts 27:39-28:6: Shipwreck on Malta',
  subtitle: 'The ship broken by the waves, a fire kindled, and a viper shaken off into the fire',
  seed: 37,

  style: { ...DAY_STYLE, ink: '#1a1c20', fog: { color: '#8a949a', near: 60, far: 520 }, grain: 0.07 },

  sky: { zenith: '#4a5864', mid: '#76848c', horizon: '#a8b0b0', ground: '#4a6470', glowColor: '#c8ccc4', glowDir: [0.4, 0.4, -1] },

  sun: { dir: [0.3, 0.9, -0.4], color: '#d8dcd8', intensity: 1.4, hemi: { sky: '#aab8c0', ground: '#5a5048', intensity: 1.3 }, shadowSize: 50 },

  ground: {
    size: 1200, segments: 240, flatRadius: 70, hillHeight: 30, undulation: 0.3,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#cdb68a', dirt: '#b89f74', grass: '#8a9466', grassDark: '#6e7a50', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a8a6a' },
  },

  objects: [],

  smolder: [],

  custom(ctx) {
    const { scene, kit } = ctx;
    const b = new Batch(ctx);

    const mesh = scene.children.find((o) => o.isMesh && o.geometry.attributes.position?.count > 20000);
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, seaDrawn(pos.getX(i), pos.getZ(i), pos.getY(i)));
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    calmWater(ctx, { y: -0.25, color: '#3e6a74', light: '#c8dcd8', dark: '#2a4c56', tile: 12 });
    beach(ctx, shore, (x, z) => seaDrawn(x, z, ctx.terrainHeight(x, z)), { from: -260, to: 260, sea: 6, land: 12, color: '#d8c49a', wet: '#a89470' });
    for (const [off, w] of [[-1.5, 1.2], [-7, 0.8], [-14, 0.7]]) foamLine(ctx, (x) => shore(x) + off, { from: -260, to: 260, y: -0.18, width: w });
    for (let x = -270; x <= 270; x += 8) ctx.addCollider({ x, z: shore(x) - 3, hx: 4.5, hz: 1.5, rot: 0, top: 60 });

    // Rocky headlands at either end of the bay.
    boulders(ctx, [[-40, -10, 4], [-46, -4, 5], [-52, -14, 6], [-38, -2, 2.4], [44, -12, 4.5], [50, -6, 5], [56, -16, 6], [40, -4, 2.2], [-30, 14, 2], [30, 18, 2.6], [-22, -6, 1.2], [24, -8, 1.4]], { colors: ['#9a8e78', '#8a7e6a', '#a89a82'], seed: 7 });

    // The ship, its forepart stuck fast, the hinder part broken by the violence of the waves.
    const ship = buildShip(ctx, { pos: WRECK, rot: 0.55, y: -1.6, L: 30, B: 8, D: 5, sail: 'torn', heel: 0.36, collide: false });
    ship.inner.rotation.z = 0.16;
    const stern = buildShip(ctx, { pos: [WRECK[0] - 22, WRECK[1] - 6], rot: 0.9, y: -3.2, L: 12, B: 6, D: 4, sail: 'none', heel: -0.5, collide: false });
    stern.inner.rotation.z = -0.3;
    const debris = [];
    const rng = (() => { let s = 5; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let i = 0; i < 26; i++) {
      const x = WRECK[0] - 30 + rng() * 50, z = WRECK[1] + 8 + rng() * 34;
      const m = new THREE.Mesh(new THREE.BoxGeometry(2 + rng() * 2.5, 0.2, 0.5), kit.toon(rng() < 0.5 ? '#8a6a48' : '#6b4a33'));
      m.position.set(x, -0.2, z);
      m.rotation.y = rng() * 6;
      m.castShadow = true;
      scene.add(m);
      debris.push({ m, ph: rng() * 6, x, z });
    }
    // Some swim, some come on boards and broken pieces.
    const swimmers = [];
    for (let i = 0; i < 14; i++) {
      const d = debris[i];
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), kit.toon(PALETTE.skins[i % 6]));
      const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6).scale(1, 0.4, 0.7), kit.toon(['#7a6a52', '#a63b2e', '#5e4632', '#6f8a6a'][i % 4]));
      shoulders.position.y = -0.18;
      const g = new THREE.Group();
      g.add(head, shoulders);
      g.position.set(d.x + 0.6, 0, d.z + 0.4);
      scene.add(g);
      swimmers.push({ g, d });
    }
    ctx.onFrame((t) => {
      for (const d of debris) {
        d.m.position.y = -0.18 + Math.sin(t * 1.3 + d.ph) * 0.12;
        d.m.rotation.z = Math.sin(t * 0.9 + d.ph) * 0.08;
        d.m.position.z = d.z + ((t * 0.4 + d.ph * 3) % 6);
      }
      for (const s of swimmers) s.g.position.set(s.d.x + 0.6, -0.1 + Math.sin(t * 1.3 + s.d.ph) * 0.12, s.d.m.position.z + 0.4);
      ship.inner.rotation.x = 0.36 + Math.sin(t * 0.8) * 0.02;
      stern.inner.rotation.x = -0.5 + Math.sin(t * 1.1) * 0.05;
    });
    // Survivors wading out of the surf.
    for (const [x, z, c] of [[-8, -10, 0], [-5, -12.5, 1], [6, -11, 2], [10, -13, 3], [-14, -12, 1]]) {
      const fig = person(ctx, { pos: [x, z], face: [x * 0.5, 10], colors: { robe: ['#7a6a52', '#a63b2e', '#5e4632', '#6f8a6a'][c], mantle: '#4a3a2c', skin: PALETTE.skins[c], hair: '#2b1a12' } });
      fig.position.y = ctx.terrainHeight(x, z) - 0.3;
      fig.rotation.x = 0.15;
    }

    // The fire kindled by the islanders, with sticks heaped beside it.
    campfire(b, ctx, { pos: FIRE, light: { color: '#ffa850', intensity: 16, distance: 22 } });
    const fy = ctx.terrainHeight(...FIRE);
    flames(ctx, [{ pos: [FIRE[0] - 0.3, fy + 0.1, FIRE[1] + 0.2], h: 1.6 }, { pos: [FIRE[0] + 0.3, fy + 0.1, FIRE[1] - 0.2], h: 1.3 }]);
    glow(ctx, { pos: [FIRE[0], fy + 1.2, FIRE[1]], size: 7, color: '#ffb35a', opacity: 0.5, pulse: 0.08 });
    for (let i = 0; i < 9; i++) {
      const a = 2.2 + i * 0.12;
      b.add('#6b4a33', new THREE.CylinderGeometry(0.06, 0.07, 1.6, 5).rotateZ(Math.PI / 2).rotateY(a + (i % 3) * 0.4).translate(FIRE[0] - 2.4 + (i % 3) * 0.15, fy + 0.1 + Math.floor(i / 3) * 0.12, FIRE[1] + 1.4));
    }
    // Paul, who gathered a bundle of sticks, shakes the viper off his hand into the fire.
    const paul = person(ctx, { pos: PAUL, face: FIRE, scale: 1.04, colors: { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#a8724a', hair: '#3a2418', sash: '#5e4632', arms: [0.35, 0.2] } });
    const arm = new THREE.Group();
    arm.position.set(-0.2, 1.32, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), kit.toon('#8c5a3c'));
    sleeve.position.y = -0.26;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), kit.toon('#a8724a'));
    hand.position.y = -0.55;
    const viper = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0, 0], [0.08, -0.15, 0.05], [-0.05, -0.32, 0], [0.06, -0.48, -0.04], [0, -0.62, 0]].map((p) => new THREE.Vector3(...p))), 20, 0.035, 5), kit.toon('#4a3a20'));
    viper.position.y = -0.58;
    arm.add(sleeve, hand, viper);
    arm.rotation.set(-1.25, 0, 0.4);
    paul.add(arm);
    ctx.onFrame((t) => {
      arm.rotation.x = -1.25 + Math.sin(t * 9) * 0.12 * (Math.sin(t * 0.8) > 0 ? 1 : 0.2);
      viper.rotation.z = Math.sin(t * 7) * 0.5;
    });
    const sticks = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 5).rotateZ(1.2), kit.toon('#6b4a33'));
    sticks.position.set(-0.22, 0.95, 0.15);
    paul.add(sticks);

    // The barbarous people of the island watch, and a centurion and soldiers stand by.
    const islanders = [
      { pos: [-2.2, 2.4], robe: '#c8a97a', mantle: '#8c5a3c', arms: [0.4, 1.2] },
      { pos: [-2.6, 5.6], robe: '#e6d8b8', mantle: '#b5523b' },
      { pos: [2.6, 6.4], robe: '#9c6b4e', mantle: '#d9c7a3', arms: [0.6, 1.4] },
      { pos: [-0.6, 7.2], robe: '#bfa27a', mantle: '#4f7f80' },
      { pos: [3.2, 1.6], robe: '#a63b2e', mantle: '#7a2a22', soldier: true },
    ];
    islanders.forEach((p, i) => person(ctx, { pos: p.pos, face: PAUL, colors: { robe: p.robe, mantle: p.mantle, skin: PALETTE.skins[(i + 2) % 6], hair: p.soldier ? '#8a8a90' : PALETTE.hair[i % 4], sash: '#c8912e', arms: p.arms } }));
    b.flush();

    rain(ctx, { count: 1300, wind: [0.3, 0.2], speed: 22, opacity: 0.35 });
  },

  clouds: {
    layers: [
      { count: 40, distance: [180, 520], height: [50, 110], size: [50, 110], color: '#8a949a', shade: '#3a4048', drift: 0.006 },
      { count: 24, distance: [120, 360], height: [80, 140], size: [60, 120], color: '#6e787e', shade: '#2a3036', drift: -0.004 },
    ],
  },

  crowd: {
    seed: 37,
    minSpacing: 0.7,
    facing: FIRE,
    colors: {
      robes: ['#7a6a52', '#6b5a4a', '#5e4632', '#8c7458', '#a63b2e', '#94352a', '#6f8a6a', '#4f7f80', '#bfa27a', '#9c6b4e'],
      mantles: ['#4a3a2c', '#5e4632', '#7a2a22', '#3e6e66', '#6b5a4a', '#8c5a3c'],
      skins: PALETTE.skins,
      hair: PALETTE.hair,
      wraps: ['#8a8a90', '#6b5a4a', '#d9c7a3'],
    },
    keepClear: [{ kind: 'circle', x: FIRE[0], z: FIRE[1], r: 9 }],
    aisles: [{ from: [-3, 22], to: [0, 5], width: 4 }],
    groups: [
      { center: FIRE, radius: [9, 22], angle: [-2.1, 2.1], count: 200, kneel: 0.35, lean: 0.12 },
      { shape: 'rect', center: [-22, -4], size: [16, 8], count: 40, kneel: 0.5, facing: [0, -40] },
      { shape: 'rect', center: [22, -4], size: [16, 8], count: 30, kneel: 0.4, facing: [0, -40] },
    ],
  },

  player: {
    start: [-2.2, 13],
    lookAt: [3, -4],
    colors: { robe: '#4f7f80', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
