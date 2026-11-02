// D&C 20-21: The Church is organized in Peter Whitmer Sr.'s log home, Fayette, New York, April 6, 1830.
// The room is a roofless cutaway; walls between the camera and the player hide themselves.
import { bench, book, fireplace, floor, gableRoof, periodCrowd, periodPerson, railFence, room, table, trackAvatar } from './lib/dc-01-kit.js';
import { makeRng } from '../engine/util.js';

const W = 13, D = 9;
const FRONT = [0, -3.2];

export default {
  title: 'D&C 20-21: The Church is organized',
  subtitle: "Peter Whitmer Sr.'s log home, Fayette, New York, April 6, 1830",
  seed: 20,

  style: {
    ink: '#24180f',
    toonSteps: [0.42, 0.74, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [60, 400, 300, 0.5] },
    grain: 0.05,
    fog: { color: '#dfe2cf', near: 90, far: 700 },
  },

  sky: { zenith: '#4a7aa0', mid: '#94b4c4', horizon: '#eaead8', ground: '#7a7a58', glowColor: '#fff6e0', glowDir: [0.3, 0.6, 1] },

  sun: { dir: [0.35, 0.9, 0.45], color: '#fff2da', intensity: 2.3, hemi: { sky: '#dde8ee', ground: '#7a6a4a', intensity: 1.25 }, shadowSize: 40 },

  ground: {
    size: 1200, segments: 240, flatRadius: 80, hillHeight: 24, undulation: 0,
    plaza: { center: [0, 6], size: [6, 4] },
    colors: { sand: '#8a8a5a', dirt: '#7a6a48', grass: '#7f9a52', grassDark: '#647e40', plaza: '#8a7456', plazaLine: '#7a6448', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#6a8a52' },
  },

  mountains: { count: 22, distance: [480, 760], height: [40, 90], widthRatio: [2.6, 3.6], colors: ['#7a96a0', '#86a2a8', '#6e8c96'] },

  objects: [],

  custom(ctx) {
    const { THREE, scene, kit } = ctx;
    const avatar = trackAvatar(ctx, {});
    const r = room(ctx, {
      x: 0, z: 0, w: W, d: D, h: 2.7, kind: 'log', color: '#8a6644', chink: '#d2c4a4', avatar,
      openings: {
        s: [{ at: 6.65, width: 1.5, top: 2.1, kind: 'door' }, { at: 2.6, width: 1, bottom: 0.95, top: 1.9, kind: 'window' }, { at: 10.4, width: 1, bottom: 0.95, top: 1.9, kind: 'window' }],
        e: [{ at: 2.5, width: 1, bottom: 0.95, top: 1.9, kind: 'window' }, { at: 6.5, width: 1, bottom: 0.95, top: 1.9, kind: 'window' }],
        n: [{ at: 3.5, width: 1, bottom: 0.95, top: 1.9, kind: 'window' }, { at: 9.5, width: 1, bottom: 0.95, top: 1.9, kind: 'window' }],
      },
    });
    gableRoof(ctx, r.outside, { x: 0, z: 0, w: W, d: D, y: 2.7, rise: 2.4, color: '#5a4636', gable: '#8a6644' });
    floor(ctx, { x: 0, z: 0, w: W, d: D, color: '#b08a5e', lines: '#8a6a44' });
    fireplace(ctx, { pos: [-W / 2 + 0.45, 0.5], rotY: Math.PI / 2, color: '#8a7a6a' });
    const chim = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.5, 1.6), kit.stoneMat('#8a7a6a'));
    chim.position.set(-W / 2 - 0.5, 3.25, 0.5);
    chim.castShadow = true;
    r.outside.add(chim);

    // The front: Joseph and Oliver at a table with the Book of Mormon and the sacrament.
    table(ctx, { pos: [0, FRONT[1]], size: [1.8, 0.8], color: '#6b4a30' });
    book(ctx, [-0.4, 0.8, FRONT[1]], { open: true });
    book(ctx, [0.35, 0.8, FRONT[1] - 0.1], { color: '#3a2418' });
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.01, 0.4), kit.toon('#f4efe2'));
    cloth.position.set(0.5, 0.8, FRONT[1] + 0.15);
    const bread = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6).scale(1.4, 0.6, 1), kit.toon('#c8925a'));
    bread.position.set(0.45, 0.84, FRONT[1] + 0.15);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.14, 8).translate(0, 0.07, 0), kit.toon('#b8b8c0'));
    cup.position.set(0.72, 0.81, FRONT[1] + 0.15);
    scene.add(cloth, bread, cup);
    periodPerson(ctx, { pos: [-0.6, FRONT[1] - 0.8], face: [0, 4], arms: [[0.15, 0.1], [0.3, 1.2]], colors: { body: '#2e3440', skin: '#e8c3a0', hair: '#7a5530' } });
    periodPerson(ctx, { pos: [0.8, FRONT[1] - 0.8], face: [0, 4], arms: [0.12, 0.2], colors: { body: '#4a3b2e', skin: '#e3b894', hair: '#3a2418' } });

    // Congregation on benches, more standing along the walls and in the doorway.
    const people = [];
    const rng = makeRng(4);
    for (let row = 0; row < 5; row++) {
      const z = FRONT[1] + 1.4 + row * 1.12;
      for (const side of [-1, 1]) {
        const bx = side * 2.6;
        bench(ctx, { pos: [bx, z + 0.05], len: 3.6, color: '#7a5a3c' });
        for (let k = 0; k < 4; k++) {
          if (rng() < 0.12) continue;
          people.push({ x: bx - 1.3 + k * 0.85 + (rng() - 0.5) * 0.1, z: z + 0.05, face: [0, -20], pose: 'sit', kind: rng() < 0.5 ? 'woman' : 'man', child: rng() < 0.1 });
        }
      }
    }
    for (let i = 0; i < 9; i++) people.push({ x: W / 2 - 0.55, z: -3.4 + i * 0.85, face: [0, -3], kind: rng() < 0.4 ? 'woman' : 'man' });
    for (let i = 0; i < 6; i++) people.push({ x: -W / 2 + 0.55, z: 1.8 + i * 0.75, face: [0, -3], kind: rng() < 0.4 ? 'woman' : 'man' });
    for (let i = 0; i < 6; i++) people.push({ x: -2.6 + i * 1.0, z: D / 2 - 0.55, face: [0, -3], kind: rng() < 0.4 ? 'woman' : 'man' });
    for (let i = 0; i < 4; i++) people.push({ x: -1.2 + i * 0.8 + 0.4, z: D / 2 + 1.0 + (i % 2) * 0.6, face: [0, -3], kind: rng() < 0.4 ? 'woman' : 'man', hat: true });
    periodCrowd(ctx, people, { seed: 9 });

    // Farmyard.
    railFence(ctx, [[-30, 18], [30, 18], [30, -26], [-30, -26], [-30, 10]], { color: '#7a6450' });
    ctx.exclude({ kind: 'rect', x: 0, z: -4, hx: 34, hz: 26 });
    ctx.builders.trees({ count: 120, ring: [40, 200], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#5a4430', leafColors: ['#8aa65a', '#9ab468', '#7a9a4e', '#b8c27a', '#a8b46a'] }, ctx);
    const wagon = new THREE.Group();
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 1.4), kit.toon('#7a5a3c'));
    bed.position.y = 1.0;
    wagon.add(bed);
    for (const sx of [-1.1, 1.1]) for (const sz of [-0.8, 0.8]) {
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 6, 14), kit.toon('#3a2a1c'));
      wh.position.set(sx, 0.48, sz);
      wagon.add(wh);
    }
    wagon.position.set(12, 0, 9);
    wagon.rotation.y = 0.4;
    wagon.traverse((m) => (m.castShadow = true));
    scene.add(wagon);
    ctx.addCollider({ x: 12, z: 9, hx: 1.7, hz: 0.8, rot: -0.4, top: 1.3 });
  },

  clouds: {
    layers: [{ count: 34, distance: [320, 700], height: [90, 170], size: [25, 55], color: '#ffffff', shade: '#8a9ab0' }],
  },

  player: {
    start: [0, 0.2],
    lookAt: [0, -6],
    colors: { robe: '#3d3d3d', mantle: '#3d3d3d', skin: '#e0b48e', hair: '#5a3a22' },
  },
};
