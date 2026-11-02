// D&C 135: the upstairs bedroom of Carthage Jail, late afternoon, June 27, 1844. Joseph and Hyrum Smith,
// John Taylor, and Willard Richards sit together in quiet; John Taylor sings "A Poor Wayfaring Man of Grief."
// Shown restrained and reverent: the hour before, nothing of the violence that followed.
import { box, room, person, pointLight } from './lib/dc-08-kit.js';

const W = 5.2, D = 4.6, H = 2.75;

function chair(ctx, x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  box(ctx, { x, y: 0.1, z, w: 0.45, h: 0.45, d: 0.45, rot, color: '#6a4a30' });
  ctx.solid.box(0.45, 0.55, 0.05, { position: [x - s * 0.2, 0.82, z - c * 0.2], rotation: [0, rot, 0], color: '#5a3e28' });
}

export default {
  title: 'D&C 135: Carthage Jail',
  seed: 135,
  fov: 70,
  exposure: 1.0,

  sun: { direction: [-0.78, 0.42, 0.18], color: '#ffc98a', intensity: 3.0 },
  light: { sky: '#d8ccb8', ground: '#6a5646', hemi: 1.0 },
  sky: { top: '#7f9ccc', horizon: '#f4cf9a', ground: '#b49a70', sunColor: '#ffdcaa', glow: 0.8 },
  fog: { color: '#d8c4a4', near: 40, far: 200 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.86 },
  grade: { saturation: 1.0, contrast: 1.06, vignette: 0.5, shadowTint: '#2e2838', highlightTint: '#ffe2b8' },
  shadow: { center: [0, 0], radius: 7 },

  player: { start: [1.05, 1.9], yaw: 0.6, pitch: -0.12, eye: 1.62, speed: 1.6 },

  terrain: {
    size: 300, segments: 40, seed: 5, hills: 4, bumps: 0.1,
    flats: [{ x: 0, z: 0, r: 20, falloff: 10, height: 0 }],
    colors: { ground: '#7a8a4a', groundAlt: '#6e7e42', grass: '#7a8a4a', rock: '#7a6a58' },
  },

  custom(ctx) {
    const { THREE, rand } = ctx;
    box(ctx, { x: 0, y: 0, z: 0, w: W + 0.8, h: 0.1, d: D + 0.8, color: '#7a5a3c' });
    for (let x = -W / 2 + 0.11; x < W / 2; x += 0.22) ctx.solid.box(0.21, 0.01, D, { position: [x, 0.105, 0], color: rand.pick(['#8a6a48', '#80603f', '#93724e']), jitter: 0.03 });

    room(ctx, {
      w: W, d: D, h: H + 0.3, thick: 0.4, wall: '#e6dcc6', y: 0.1,
      openings: [
        { side: 'w', at: -1.0, width: 0.9, bottom: 0.85, top: 2.3, glow: '#ffe6bc', bars: 1, barColor: '#e8e0d0' },
        { side: 'w', at: 1.1, width: 0.9, bottom: 0.85, top: 2.3, glow: '#ffe6bc', bars: 1, barColor: '#e8e0d0' },
        { side: 's', at: -1.3, width: 0.95, bottom: 0, top: 2.1 },
      ],
    });
    for (const [x, z, w, d] of [[0, -D / 2 + 0.03, W, 0.06], [0, D / 2 - 0.03, W, 0.06], [-W / 2 + 0.03, 0, 0.06, D], [W / 2 - 0.03, 0, 0.06, D]]) {
      ctx.solid.box(w, 0.18, d, { position: [x, 0.19, z], color: '#5a4030' });
      ctx.solid.box(w, 0.06, d, { position: [x, 0.95, z], color: '#8a6a4c' });
    }
    // The door stands open to the stair hall.
    ctx.solid.box(0.06, 2.0, 0.9, { position: [-1.3 + 0.45, 1.1, D / 2 + 0.6], rotation: [0, 0.9, 0], color: '#5a3e28' });
    box(ctx, { x: -1.3, y: 0.1, z: D / 2 + 1.2, w: 2.2, h: H, d: 0.2, color: '#b8ac94' });
    for (const s of [-1, 1]) box(ctx, { x: -1.3 + s * 1.1, y: 0.1, z: D / 2 + 0.7, w: 0.1, h: H, d: 1.0, color: '#b8ac94' });
    box(ctx, { x: -1.3, y: 0, z: D / 2 + 0.7, w: 2.3, h: 0.1, d: 1.1, color: '#6a4c34' });
    ctx.colliders.add({ x: -1.3, z: D / 2 + 0.35, w: 1, d: 0.1, bottom: 0, top: 3 });
    box(ctx, { x: 0, y: H + 0.1, z: 0, w: W + 0.8, h: 0.2, d: D + 0.8, color: '#efe8d8', collide: false });

    // Fireplace on the north wall.
    box(ctx, { x: 0.9, y: 0.1, z: -D / 2 + 0.25, w: 1.5, h: 1.25, d: 0.5, color: '#9a4e38' });
    ctx.solid.box(0.8, 0.7, 0.05, { position: [0.9, 0.5, -D / 2 + 0.51], color: '#1e1814' });
    ctx.solid.box(1.75, 0.08, 0.6, { position: [0.9, 1.38, -D / 2 + 0.28], color: '#5a3e28' });
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 6), { position: [0.5, 1.53, -D / 2 + 0.25], color: '#c8b070' });

    // Rope bed with a quilt in the northeast corner.
    box(ctx, { x: 1.85, y: 0.1, z: -0.2, w: 1.3, h: 0.55, d: 2.0, color: '#6a4a30' });
    ctx.solid.box(1.32, 0.1, 1.7, { position: [1.85, 0.7, -0.05], color: '#8a3a32', jitter: 0.08 });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) ctx.solid.box(0.3, 0.012, 0.3, { position: [1.4 + i * 0.3, 0.756, -0.65 + j * 0.3], color: rand.pick(['#c8a050', '#e8dcc0', '#4a5a7a', '#8a3a32']), jitter: 0.05 });
    ctx.solid.box(1.1, 0.15, 0.35, { position: [1.85, 0.72, -1.05], color: '#f0ead8' });
    for (const [x, z] of [[1.25, -1.2], [2.45, -1.2]]) ctx.solid.box(0.08, 1.1, 0.08, { position: [x, 0.65, z], color: '#5a3e28' });

    // Table with papers and a book.
    box(ctx, { x: -0.5, y: 0.1, z: -0.9, w: 1.2, h: 0.72, d: 0.8, color: '#6e4e32' });
    ctx.solid.box(0.3, 0.04, 0.22, { position: [-0.7, 0.84, -0.8], rotation: [0, 0.2, 0], color: '#3a2a22' });
    ctx.solid.box(0.25, 0.01, 0.32, { position: [-0.25, 0.83, -1.0], rotation: [0, -0.3, 0], color: '#ece4d0' });
    ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 7), { position: [-0.95, 0.88, -1.15], color: '#d8d0bc' });

    chair(ctx, -0.5, -1.65, 0);
    chair(ctx, 0.5, -1.2, -0.6);
    chair(ctx, -1.45, -0.2, Math.PI / 2);

    person(ctx, { x: -0.5, z: -1.6, y: 0.55, face: [0.6, 2], robe: '#46506a', mantle: '#353d52', skin: '#e2b896', hair: '#9a7448', hat: null, sink: 0.62 });
    person(ctx, { x: 0.5, z: -1.2, y: 0.55, face: [-0.6, 0.4], robe: '#5e5040', mantle: '#4a3e32', skin: '#e0b896', hair: '#8a7a68', hat: null, sink: 0.62 });
    person(ctx, { x: -1.4, z: -0.2, y: 0.55, face: [3, 0.6], robe: '#5a4c3e', mantle: '#4a3e32', skin: '#dcae8c', hair: '#7a5a3a', hat: null, sink: 0.62 });
    person(ctx, { x: -2.05, z: 1.0, face: [1, 1.6], robe: '#5e544a', mantle: '#4a423a', skin: '#d4a684', hair: '#a88a60', hat: null, scale: 1.12 });

    ctx.effects.motes({ position: [-1.2, 0.2, 0], radius: 1.4, height: 2.2, count: 40, color: '#ffe2b0', size: 0.012 });
    pointLight(ctx, [-1.8, 2.0, 0], '#ffcf96', 2.5, 6, 1.4);
    pointLight(ctx, [1.0, 2.2, 1.4], '#ffe0b8', 4, 7, 1.3);
  },
};
