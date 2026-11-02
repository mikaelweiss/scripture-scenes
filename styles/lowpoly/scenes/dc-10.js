// D&C 121-123: the lower dungeon of Liberty Jail, winter 1838-39. Joseph Smith writes by candlelight
// while his companions huddle on the straw. The cramped room is built around the origin.
import { box, room, person, pointLight } from './lib/dc-08-kit.js';

const W = 4.6, D = 4.8, H = 2.15;
const stone = '#6f6a62';

export default {
  title: 'D&C 121-123: Liberty Jail',
  seed: 121,
  fov: 70,
  exposure: 1.0,

  sun: { direction: [0.9, 0.32, 0.25], color: '#cfe0ff', intensity: 2.4 },
  light: { sky: '#8a96b2', ground: '#5a4c40', hemi: 0.85 },
  sky: { top: '#7f8ea8', horizon: '#c9d2dc', ground: '#e8ecf0', sunColor: '#e8f0ff', glow: 0.4 },
  fog: { color: '#2a2a30', near: 30, far: 200 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 0.92, contrast: 1.1, vignette: 0.6, shadowTint: '#1c2238', highlightTint: '#ffe0b0' },
  shadow: { center: [0, 0], radius: 8 },

  player: { start: [-1.45, 0.45], yaw: -1.08, pitch: -0.2, eye: 1.55, speed: 1.6 },

  terrain: {
    size: 300, segments: 40, seed: 3, hills: 4, bumps: 0.1,
    flats: [{ x: 0, z: 0, r: 20, falloff: 10, height: 0 }],
    colors: { ground: '#e8ecf0', groundAlt: '#dfe4ea', grass: '#e8ecf0', rock: '#c8ccd2' },
  },

  custom(ctx) {
    const { THREE, rand } = ctx;
    box(ctx, { x: 0, y: 0, z: 0, w: W + 1.4, h: 0.1, d: D + 1.4, color: '#4f4a44', jitter: 0.06 });
    for (let x = -W / 2 + 0.3; x < W / 2; x += 0.6) {
      for (let z = -D / 2 + 0.3; z < D / 2; z += 0.6) {
        ctx.solid.box(0.56, 0.03, 0.56, { position: [x + rand.range(-0.03, 0.03), 0.11, z], rotation: [0, rand.range(-0.05, 0.05), 0], color: '#5a554e', jitter: 0.08 });
      }
    }

    room(ctx, {
      w: W, d: D, h: H + 0.4, thick: 0.7, wall: stone, y: 0.1,
      openings: [-1.3, 1.3].map((at) => ({ side: 'e', at, width: 0.5, bottom: 1.45, top: 1.85, glow: '#dbe8f6', bars: 2, barColor: '#1a1a1c' })),
    });

    // Rough-laid stones on the inner faces.
    const faces = [
      { n: [0, 1], len: W, at: (u) => [u, -D / 2] },
      { n: [0, -1], len: W, at: (u) => [u, D / 2] },
      { n: [1, 0], len: D, at: (u) => [-W / 2, u] },
      { n: [-1, 0], len: D, at: (u) => [W / 2, u] },
    ];
    for (const f of faces) {
      for (let y = 0.2; y < H + 0.1; y += 0.32) {
        for (let u = -f.len / 2 + rand.range(0, 0.3); u < f.len / 2 - 0.15; u += rand.range(0.35, 0.6)) {
          const [x, z] = f.at(u);
          if (f.n[0] === -1 && y > 1.3 && y < 2.0 && (Math.abs(u + 1.3) < 0.4 || Math.abs(u - 1.3) < 0.4)) continue;
          const along = f.n[0] === 0;
          ctx.solid.box(along ? rand.range(0.3, 0.5) : 0.1, rand.range(0.24, 0.3), along ? 0.1 : rand.range(0.3, 0.5), {
            position: [x + f.n[0] * 0.03, 0.1 + y, z + f.n[1] * 0.03],
            rotation: [rand.range(-0.04, 0.04), rand.range(-0.05, 0.05), rand.range(-0.04, 0.04)],
            color: rand.pick(['#77716a', '#6a655e', '#827b70', '#5f5a54']),
            jitter: 0.06,
          });
        }
      }
    }

    // Low timbered ceiling with the trapdoor to the upper room.
    box(ctx, { x: 0, y: H + 0.1, z: 0, w: W + 1.4, h: 0.3, d: D + 1.4, color: '#3a3028', collide: false });
    for (let x = -W / 2 + 0.4; x < W / 2; x += 0.75) ctx.solid.box(0.24, 0.2, D, { position: [x, H, 0], color: '#4a3b2c', jitter: 0.05 });
    ctx.solid.box(0.8, 0.04, 0.8, { position: [-0.7, H + 0.08, 0.6], color: '#2a221a' });
    ctx.glow.box(0.82, 0.01, 0.03, { position: [-0.7, H + 0.08, 1.0], color: '#6a7080' });

    // Straw strewn along the walls.
    for (let i = 0; i < 700; i++) {
      const edge = rand();
      let x = rand.range(-W / 2 + 0.1, W / 2 - 0.1), z = rand.range(-D / 2 + 0.1, D / 2 - 0.1);
      if (edge < 0.4) x = -W / 2 + rand.range(0.1, 1.0);
      else if (edge < 0.6) z = -D / 2 + rand.range(0.1, 0.9);
      else if (edge < 0.75) z = D / 2 - rand.range(0.1, 0.8);
      ctx.solid.box(0.02, 0.015, rand.range(0.2, 0.45), { position: [x, 0.14 + rand() * 0.06, z], rotation: [0, rand() * Math.PI, rand.range(-0.2, 0.2)], color: rand.pick(['#b49a5a', '#a08848', '#c4ac6a', '#8a7444']), jitter: 0.06 });
    }

    // Joseph writing at a rough table by candlelight.
    box(ctx, { x: 0.65, y: 0.1, z: -1.0, w: 0.9, h: 0.65, d: 0.6, color: '#5a4430' });
    ctx.solid.box(0.32, 0.01, 0.24, { position: [0.62, 0.76, -1.0], rotation: [0, 0.2, 0], color: '#ece4d0', jitter: 0.02 });
    ctx.solid.box(0.24, 0.01, 0.2, { position: [0.62, 0.76, -0.8], rotation: [0, -0.3, 0], color: '#e0d6bc', jitter: 0.02 });
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), { position: [0.32, 0.82, -1.22], color: '#efe6cc' });
    ctx.glow.add(new THREE.OctahedronGeometry(0.03, 0), { position: [0.32, 0.92, -1.22], scale: [1, 1.8, 1], color: '#ffc060' });
    ctx.effects.halo({ position: [0.32, 0.93, -1.22], size: 0.6, opacity: 0.6, color: '#ffbe6a' });
    const candle = pointLight(ctx, [0.32, 1.05, -1.22], '#ffb060', 4.5, 7, 1.6);
    ctx.onFrame((t) => (candle.intensity = 4.2 + Math.sin(t * 9) * 0.3 + Math.sin(t * 23) * 0.2));
    box(ctx, { x: 1.4, y: 0.1, z: -1.0, w: 0.4, h: 0.4, d: 0.4, color: '#4a3826' });
    person(ctx, { x: 1.4, z: -1.0, y: 0.5, face: [-3, -1], robe: '#3a3632', mantle: '#2a2724', skin: '#e2b896', hat: null, sink: 0.62, arms: 'down' });

    // Companions huddled on the straw: Hyrum, Sidney, Lyman, Caleb, Alexander.
    const sitters = [
      { x: -0.8, z: -1.95, face: [0.6, -1], robe: '#2e2a28', mantle: '#4a3f36' },
      { x: 1.6, z: 1.7, face: [0.8, -1], robe: '#4a3e34', mantle: '#2c2622' },
      { x: 0.6, z: 1.95, face: [0.8, -1], robe: '#33302e', mantle: '#5a4a3a' },
      { x: -1.75, z: -1.6, face: [0.8, -1], robe: '#3f3833', mantle: '#262321' },
    ];
    for (const s of sitters) person(ctx, { ...s, y: 0.12, skin: '#d9ad8a', hat: null, sink: 0.72 });

    // Sidney Rigdon, ill, lying under a blanket along the west wall.
    ctx.solid.box(0.6, 0.28, 1.7, { position: [-1.85, 0.28, 0.4], color: '#5a4a44', jitter: 0.08 });
    ctx.solid.box(0.62, 0.06, 0.4, { position: [-1.85, 0.44, 0.0], color: '#6e5a50', jitter: 0.08 });
    ctx.solid.add(new THREE.IcosahedronGeometry(0.13, 0), { position: [-1.85, 0.33, -0.55], color: '#d4a684' });
    for (const [x, z, r] of [[1.9, 0.6, 0.3], [-0.2, 2.05, 1.4]]) {
      ctx.solid.box(0.9, 0.12, 0.6, { position: [x, 0.17, z], rotation: [0, r, 0], color: '#4a4040', jitter: 0.08 });
    }
    ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 7), { position: [-1.9, 0.27, 2.0], color: '#5a4a3a' });

    pointLight(ctx, [1.6, 1.7, 0], '#9ab0d8', 3, 8, 1.2);
  },
};
