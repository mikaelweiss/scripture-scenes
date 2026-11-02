// Revelation 1:9-18: on the isle of Patmos John hears a great voice, turns, and sees seven golden candlesticks,
// and in their midst one like unto the Son of man, seven stars in his right hand. John falls at his feet as dead.
// A rocky island hilltop with the sea all around. The vision stands north of the player.
import * as THREE from 'three';
import { Batch, boulders, box, cyl, DAY_STYLE, fallen, flames, glow, ringPoints } from './lib/nt-32-kit.js';
import { makeFigure } from '../engine/people.js';
import { calmWater, foamLine } from './lib/nt-32-sea.js';

const LORD = [0, -6];
const JOHN = [0.2, -3.6];
const coast = (a) => 62 + 10 * Math.sin(a * 3 + 1) + 6 * Math.sin(a * 7);

function islandDrawn(x, z, y) {
  const a = Math.atan2(x, z);
  const d = Math.hypot(x, z) - coast(a);
  if (d < -8) return y;
  const k = THREE.MathUtils.smoothstep(d, -8, 4);
  return y * (1 - k) + k * (-0.8 - Math.min(Math.max(d, 0) * 0.2, 5));
}

export default {
  title: 'Revelation 1:9-18: John on Patmos',
  subtitle: 'In the midst of the seven golden candlesticks one like unto the Son of man',
  seed: 38,

  style: { ...DAY_STYLE, fog: { color: '#f2e8d2', near: 200, far: 1300 } },

  sky: { zenith: '#3a6e9c', mid: '#8ab4c8', horizon: '#f6ead0', ground: '#3f8ea0', glowColor: '#fff2c4', glowDir: [0, 0.55, -1] },

  sun: { dir: [-0.3, 0.85, 0.45], color: '#fff2da', intensity: 2.4, hemi: { sky: '#e2eef0', ground: '#a88a62', intensity: 1.25 }, shadowSize: 50 },

  ground: {
    size: 1200, segments: 260, flatRadius: 2000, hillHeight: 0, undulation: 0.9,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#c9b48c', dirt: '#b39a74', grass: '#9a9a62', grassDark: '#7a8050', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a89a7a' },
  },

  mountains: { count: 14, distance: [260, 620], height: [18, 60], widthRatio: [2.4, 4], colors: ['#9aa48a', '#8a9a84', '#a8ac90'] },

  objects: [
    { type: 'stones', count: 600, ring: [4, 60], size: [0.15, 0.5], colors: ['#a8957c', '#9a8670', '#b8a88c', '#8a7a66'] },
  ],

  custom(ctx) {
    const { scene, kit } = ctx;
    const b = new Batch(ctx);

    // The sea all around the island, and a coast the walker cannot cross.
    const mesh = scene.children.find((o) => o.isMesh && o.geometry.attributes.position?.count > 20000);
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, islandDrawn(pos.getX(i), pos.getZ(i), pos.getY(i)));
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    calmWater(ctx, { y: -0.3, color: '#3f8fa8', light: '#b8e2e4', dark: '#2f7088', tile: 18 });
    const ring = [];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const r = coast(a) - 4;
      ctx.addCollider({ x: Math.sin(a) * r, z: Math.cos(a) * r, hx: 3, hz: 3, rot: -a, top: 60 });
      const rr = coast(a) - 6 + (i % 3);
      ring.push([Math.sin(a) * rr, Math.cos(a) * rr, 1.6 + (i % 4) * 0.7]);
    }
    boulders(ctx, ring, { colors: ['#8a7a66', '#9a8670', '#7a6c5a'], collide: false, seed: 21 });
    const surf = new THREE.BufferGeometry();
    const sp = [], si = [];
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2, r = coast(a) + 2.5;
      for (const w of [-1.2, 1.2]) sp.push(Math.sin(a) * (r + w), -0.22, Math.cos(a) * (r + w));
      if (i < 180) si.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    surf.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    surf.setIndex(si);
    const foam = new THREE.Mesh(surf, new THREE.MeshBasicMaterial({ color: '#f4fbf6', transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
    scene.add(foam);
    ctx.onFrame((t) => (foam.material.opacity = 0.45 + 0.3 * Math.sin(t * 0.9)));

    // Rough outcrops and scrub across the rocky hilltop.
    boulders(ctx, [[-20, -12, 3], [-24, -4, 2], [22, -16, 3.5], [26, -8, 2], [-10, -24, 4], [12, -28, 5], [-26, 10, 3], [24, 12, 2.6], [-6, 26, 1.6], [30, -20, 4], [-32, -18, 5], [8, 30, 2.2]], { colors: ['#9a8670', '#8a7662', '#a8957c'], seed: 5 });
    for (const [x, z, r] of ringPoints(ctx, { ring: [10, 50], count: 70, seed: 9, margin: 1.5 })) b.add(r < 0.5 ? '#7a8050' : '#8a8a58', new THREE.SphereGeometry(0.5 + r * 0.6, 7, 5).scale(1.3, 0.6, 1.1).translate(x, ctx.terrainHeight(x, z) + 0.1, z));

    // Seven golden candlesticks around the Son of man, open toward John and the viewer.
    const gold = kit.toon('#e8b840', { emissive: '#5a3a08' });
    const fl = [];
    for (let i = 0; i < 7; i++) {
      const a = 0.75 + (i / 6) * (Math.PI * 2 - 1.5);
      const x = LORD[0] + Math.sin(a) * 5.2, z = LORD[1] + Math.cos(a) * 5.2;
      const y = ctx.terrainHeight(x, z);
      const parts = [
        new THREE.CylinderGeometry(0.35, 0.5, 0.2, 12).translate(0, 0.1, 0),
        new THREE.CylinderGeometry(0.11, 0.15, 2.2, 10).translate(0, 1.3, 0),
        new THREE.SphereGeometry(0.2, 10, 8).translate(0, 0.9, 0),
        new THREE.SphereGeometry(0.2, 10, 8).translate(0, 1.7, 0),
        new THREE.CylinderGeometry(0.38, 0.14, 0.26, 12).translate(0, 2.5, 0),
      ];
      for (const g of parts) {
        const m = new THREE.Mesh(g, gold);
        m.position.set(x, y, z);
        m.castShadow = true;
        scene.add(m);
      }
      ctx.addCollider({ x, z, hx: 0.4, hz: 0.4, rot: 0, top: y + 2.6 });
      ctx.exclude({ kind: 'circle', x, z, r: 0.8 });
      fl.push({ pos: [x, y + 2.6, z], h: 0.55, w: 0.9 });
      glow(ctx, { pos: [x, y + 2.95, z], size: 2.2, color: '#ffd88a', opacity: 0.7, pulse: 0.08 });
    }
    flames(ctx, fl);

    // One like unto the Son of man: white robe to the foot, golden girdle, a face of light.
    const ly = ctx.terrainHeight(...LORD);
    const lord = makeFigure({ robe: '#fbf7ee', mantle: '#f6f0e2', skin: '#fff6dc', hair: '#ffffff', sash: '#e8b840', arms: [0.5, 0.5] }, kit, { glow: 0.55 });
    lord.position.set(LORD[0], ly, LORD[1]);
    lord.scale.setScalar(1.45);
    lord.rotation.y = Math.atan2(JOHN[0] - LORD[0], JOHN[1] - LORD[1] + 6);
    scene.add(lord);
    ctx.addCollider({ x: LORD[0], z: LORD[1], hx: 0.5, hz: 0.5, rot: 0, top: ly + 2 });
    ctx.exclude({ kind: 'circle', x: LORD[0], z: LORD[1], r: 1.4 });
    glow(ctx, { pos: [LORD[0], ly + 2.35, LORD[1]], size: 2.6, color: '#ffffff', opacity: 0.95, pulse: 0.05 });
    glow(ctx, { pos: [LORD[0], ly + 1.6, LORD[1]], size: 8, color: '#fff2c8', opacity: 0.4, pulse: 0.04 });
    const light = new THREE.PointLight('#fff0c8', 9, 18, 1.3);
    light.position.set(LORD[0], ly + 3, LORD[1] + 1);
    scene.add(light);

    // Seven stars in his right hand.
    const starGroup = new THREE.Group();
    starGroup.position.set(LORD[0] - 0.95, ly + 1.35, LORD[1] + 0.7);
    scene.add(starGroup);
    const starSprites = Array.from({ length: 7 }, () => glow(ctx, { pos: [0, 0, 0], size: 0.45, color: '#fffbe8', opacity: 1, pulse: 0 }));
    for (const s of starSprites) {
      scene.remove(s);
      starGroup.add(s);
    }
    ctx.onFrame((t) => {
      starSprites.forEach((s, i) => {
        const a = t * 0.6 + (i / 7) * Math.PI * 2;
        s.position.set(Math.cos(a) * 0.38, Math.sin(a * 2 + i) * 0.08, Math.sin(a) * 0.38);
        s.scale.setScalar(0.4 + 0.12 * Math.sin(t * 3 + i));
      });
    });

    // John, an old man in exile, fallen at his feet as dead.
    fallen(ctx, { pos: JOHN, toward: LORD, colors: { robe: '#a87b4f', mantle: '#5e4632', skin: '#a8724a', hair: '#e8e2d4', sash: '#3e6e66' } });
    b.add('#d9c7a3', box(0.5, 0.06, 0.35, [JOHN[0] + 1.2, ctx.terrainHeight(...JOHN) + 0.03, JOHN[1] + 1.4]));
    b.add('#c8a97a', cyl(0.06, 0.06, 0.5, [JOHN[0] + 1.2, ctx.terrainHeight(...JOHN) + 0.1, JOHN[1] + 1.15], [0, 0, Math.PI / 2], 8));
    b.flush();
  },

  clouds: {
    layers: [
      { count: 30, distance: [360, 800], height: [70, 150], size: [40, 90], color: '#fffaf0', shade: '#8a96aa' },
      { count: 18, center: LORD, distance: [30, 80], height: [120, 150], size: [24, 44], color: '#fff6e0', shade: '#c8b890', drift: 0.006 },
    ],
  },

  light: {
    beams: [{ from: [0, 170, -8], to: { at: LORD, lift: 0.2 }, width: [16, 7], color: '#fff4d0', intensity: 0.22, layers: 3, stripes: 24, fadeLow: 0.05 }],
    rings: [{ at: LORD, lift: 0, radius: 6.2, width: 0.3, height: 1.4, color: '#ffe6a0', intensity: 0.6, wallIntensity: 0.3 }],
  },

  player: {
    start: [1.2, 6.5],
    lookAt: [0, -6],
    colors: { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
