// Acts 16:23-34. Midnight in the inner prison at Philippi. Paul and Silas sit with their feet in the
// stocks, singing; the prisoners listen. The earthquake has split the walls and thrown every door open,
// and the keeper rushes in with a torch and a drawn sword. -z is the stair door where the keeper enters.
import { room, torch, figure, lamp, Batch } from './lib/nt-32-kit.js';

const PAUL = [-0.65, -2.2];
const SILAS = [0.65, -2.2];
const KEEPER = [2.8, -3.3];

const wallStone = '#6a6054';

export default {
  title: 'Acts 16:23-34: The Philippian jail',
  seed: 35,
  fov: 68,
  exposure: 1.2,

  sun: { direction: [0.2, 0.9, -0.3], color: '#9fb4ff', intensity: 0.8 },
  light: { sky: '#3a4a78', ground: '#1a1612', hemi: 0.9 },
  sky: { top: '#04060e', horizon: '#141a30', ground: '#0a0a10', sunColor: '#c8d4ff', glow: 0.2 },
  fog: { color: '#0c0e16', near: 30, far: 200 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 1.05, contrast: 1.1, vignette: 0.55, shadowTint: '#1a1e40', highlightTint: '#ffe0b0' },
  shadow: { center: [0, 0], radius: 20 },

  player: { start: [-0.4, 2.7], yaw: 0.08, pitch: -0.04, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 600,
    segments: 100,
    seed: 35,
    hills: 10,
    bumps: 0.2,
    flats: [{ x: 0, z: 0, r: 40, falloff: 30, height: 0 }],
    colors: { ground: '#4a443c', groundAlt: '#403a34', grass: '#3a3e2e', high: '#4a443c', rock: '#3e3a36' },
  },

  objects: [],

  custom(ctx) {
    const { THREE } = ctx;
    room(ctx, { x: 0, z: 0, y: 0, w: 10, d: 8, h: 3.2, color: wallStone, floor: '#4a4238', doors: { n: [{ at: 2.8, width: 1.3, height: 2.2 }], w: [{ at: -2, width: 1.1, height: 2.0 }, { at: 1.8, width: 1.1, height: 2.0 }], e: [{ at: 0, width: 1.1, height: 2.0 }] } });
    room(ctx, { x: -6.75, z: -2, y: 0, w: 3, d: 3.2, h: 3.0, color: wallStone, floor: '#40382f', doors: {} });
    room(ctx, { x: -6.75, z: 1.8, y: 0, w: 3, d: 3.2, h: 3.0, color: wallStone, floor: '#40382f', doors: {} });
    room(ctx, { x: 6.75, z: 0, y: 0, w: 3, d: 3.6, h: 3.0, color: wallStone, floor: '#40382f', doors: {} });
    room(ctx, { x: 2.8, z: -7.2, y: 0, w: 2.4, d: 6, h: 3.6, color: wallStone, floor: '#40382f', doors: {} });

    // Iron doors thrown open by the earthquake.
    const ironDoor = (x, z, rotY) => {
      const b = new Batch(ctx.rand);
      for (let i = 0; i <= 5; i++) b.box(0.05, 1.95, 0.05, { position: [(i / 5) * 1.05, 0.98, 0], color: '#3a3a40', jitter: 0.03 });
      for (const y of [0.15, 1.0, 1.85]) b.box(1.05, 0.08, 0.07, { position: [0.52, y, 0], color: '#2e2e34', jitter: 0.03 });
      const m = b.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
      m.position.set(x, 0, z);
      m.rotation.y = rotY;
      ctx.scene.add(m);
    };
    ironDoor(-4.75, -2.55, -1.9);
    ironDoor(-4.75, 1.25, -1.2);
    ironDoor(4.75, 0.55, 2.2 + Math.PI);
    ironDoor(2.15, -3.75, 2.1);

    // Cracks splitting the walls, fallen stones and dust.
    const crack = (pts, onWall) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay, az] = pts[i], [bx, by, bz] = pts[i + 1];
        const len = Math.hypot(bx - ax, by - ay, bz - az);
        const ang = Math.atan2(by - ay, onWall === 'x' ? bz - az : bx - ax);
        ctx.solid.box(onWall === 'x' ? 0.06 : len + 0.05, 0.09, onWall === 'x' ? len + 0.05 : 0.06, {
          position: [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2],
          rotation: onWall === 'x' ? [-ang, 0, 0] : [0, 0, ang],
          color: '#120e0c',
          jitter: 0,
        });
      }
    };
    crack([[-1.8, 3.2, -3.74], [-1.5, 2.5, -3.74], [-2.0, 1.8, -3.74], [-1.6, 1.0, -3.74], [-1.9, 0.2, -3.74]], 'z');
    crack([[0.6, 3.2, -3.74], [0.9, 2.6, -3.74], [0.7, 2.1, -3.74]], 'z');
    crack([[4.74, 3.2, -2.6], [4.74, 2.4, -2.2], [4.74, 1.7, -2.8], [4.74, 0.8, -2.4], [4.74, 0, -2.9]], 'x');
    crack([[-4.74, 3.2, 3.2], [-4.74, 2.2, 2.8], [-4.74, 1.4, 3.3]], 'x');
    for (let i = 0; i < 26; i++) {
      const x = ctx.rand.range(-4.4, 4.4), z = ctx.rand.range(-3.4, 3.4);
      if (Math.hypot(x, z - 2.7) < 1.2) continue;
      ctx.solid.add(new THREE.DodecahedronGeometry(ctx.rand.range(0.06, 0.22), 0), { position: [x, 0.05, z], rotation: [ctx.rand(), ctx.rand(), 0], scale: [1.2, 0.7, 1], color: '#7a6e60', jitter: 0.08 });
    }
    ctx.solid.box(1.1, 0.4, 0.5, { position: [-3.6, 0.2, -2.9], rotation: [0.1, 0.4, 0.15], color: wallStone });
    ctx.solid.box(0.7, 0.35, 0.45, { position: [3.9, 0.17, 2.2], rotation: [0, -0.5, 0.1], color: wallStone });
    ctx.effects.motes({ position: [0, 0, -1.8], radius: 2.5, height: 3.1, count: 50, color: '#5a5044', size: 0.02, seed: 35 });
    const grate = new THREE.SpotLight('#b8c8ff', 30, 9, 0.55, 0.5, 1.2);
    grate.position.set(0, 3.15, -0.6);
    grate.target.position.set(0, 0, -2.0);
    ctx.scene.add(grate, grate.target);
    for (let i = 0; i < 5; i++) ctx.solid.box(0.05, 0.06, 1.0, { position: [-0.4 + i * 0.2, 3.18, -0.9], color: '#1a1a1e' });
    ctx.glow.box(1.0, 0.02, 1.0, { position: [0, 3.46, -0.9], color: '#3a4a7a' });

    // Paul and Silas in the stocks, the upper beam sprung loose.
    for (const [x, z] of [PAUL, SILAS]) figure(ctx, { x, z, y: 0, face: [x, 3], pose: 'sit', robe: x < 0 ? '#5a4a3a' : '#4a4a52', mantle: x < 0 ? '#7a5a3a' : '#6a3a2e', arms: 'out' });
    ctx.solid.box(3.0, 0.32, 0.26, { position: [0, 0.16, -1.25], color: '#7a5a40' });
    ctx.solid.box(2.6, 0.26, 0.24, { position: [0.3, 0.13, -0.55], rotation: [0.05, 0.22, 0.04], color: '#7a5a40' });
    for (const x of [-1.4, 1.4]) ctx.solid.box(0.18, 0.7, 0.3, { position: [x, 0.35, -1.25], color: '#4a3426' });
    ctx.colliders.add({ x: 0, z: -1.2, w: 3.0, d: 0.5, bottom: 0, top: 0.6 });
    const chains = new Batch(ctx.rand);
    for (const [x0, z0] of [[-1.1, -1.9], [1.2, -1.8], [-4.2, 3.0]]) {
      for (let i = 0; i < 8; i++) chains.add(new THREE.TorusGeometry(0.05, 0.015, 4, 7), { position: [x0 + i * 0.09, 0.03, z0 + Math.sin(i * 1.3) * 0.08], rotation: [Math.PI / 2 + (i % 2) * 1.3, i % 2 ? 1.5 : 0, 0], color: '#7a7a80', jitter: 0.03 });
    }
    ctx.scene.add(chains.build(new THREE.MeshLambertMaterial({ vertexColors: true })));
    lamp(ctx, { x: -2.2, y: 0.02, z: -2.4, intensity: 5, range: 7 });
    lamp(ctx, { x: -4.2, y: 0.02, z: 0.2, intensity: 5, range: 7 });

    // Prisoners listening in the cells and along the walls.
    const rags = ['#5a4e40', '#6a5a46', '#4a4038', '#7a6a52', '#585048'];
    const prisoners = [
      [-6.6, -2.4, [-4.5, -2]], [-7.2, -1.3, [-4.5, -2]], [-6.4, 1.6, [-4.5, 1.8]], [-7.3, 2.6, [-4.5, 1.8]],
      [6.5, -0.6, [4.5, 0]], [7.2, 0.8, [4.5, 0]], [-4.1, -0.4, [0, -2]], [4.1, 1.8, [0, -2]], [-3.9, 2.8, [0, -2]],
    ];
    prisoners.forEach(([x, z, f], i) => figure(ctx, { x, z, y: 0, face: f, pose: i % 3 === 1 ? 'stand' : 'sit', robe: rags[i % rags.length], mantle: i % 2 ? null : '#3e362e', hood: i % 4 === 0 }));
    const cellWindow = (x, z) => {
      for (let i = 0; i < 4; i++) ctx.solid.box(0.04, 0.5, 0.04, { position: [x, 2.5, z + (i - 1.5) * 0.14], color: '#2a2a2e' });
    };
    cellWindow(-8.25, -2);
    cellWindow(8.25, 0);
    for (const [x, z] of [[-8.15, -2], [8.15, 0]]) {
      const pl = new THREE.SpotLight('#8aa0e0', 16, 9, 0.6, 0.6, 1.2);
      pl.position.set(x, 2.6, z);
      pl.target.position.set(x + Math.sign(-x) * 2, 0, z);
      ctx.scene.add(pl, pl.target);
    }

    // The keeper bursting in with a torch, sword lowered.
    figure(ctx, { x: KEEPER[0], z: KEEPER[1], y: 0, face: [0.5, -1.5], robe: '#7a3a2a', mantle: '#4a4038', arms: 'out' });
    torch(ctx, { x: KEEPER[0] - 0.7, y: 1.05, z: KEEPER[1] + 0.35, intensity: 16, range: 12 });
    ctx.solid.box(0.05, 0.85, 0.02, { position: [KEEPER[0] + 0.72, 0.62, KEEPER[1] + 0.32], rotation: [0.2, 0, -0.2], color: '#b8bcc4' });
    ctx.solid.box(0.18, 0.04, 0.05, { position: [KEEPER[0] + 0.66, 1.02, KEEPER[1] + 0.28], color: '#6a5030' });
    torch(ctx, { x: 4.6, y: 2.0, z: -2.6, intensity: 6, range: 7 });

    // The ground still trembles now and then.
    ctx.onFrame((t, dt, cam) => {
      const phase = t % 9;
      if (phase < 1.4) {
        const k = Math.sin((phase / 1.4) * Math.PI) * 0.025;
        cam.position.x += Math.sin(t * 47) * k;
        cam.position.y += Math.sin(t * 61) * k;
      }
    });
  },
};
