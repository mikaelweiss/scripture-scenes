// Isaiah 6: Isaiah sees the Lord on a throne, high and lifted up, his train filling the temple.
// Seraphim cry "Holy, holy, holy"; the house fills with smoke; one flies to Isaiah with a live coal. -z is north.
import { block, room, person, being, seraph, fireLight } from './lib/ot-38-kit.js';

const HALL = { x: 0, z: -14, w: 26, d: 46, h: 20 };
const NORTH = HALL.z - HALL.d / 2;
const THRONE = [0, NORTH + 5];
const TOP = 6.4;
const ALTAR = [2.2, -4];

export default {
  title: "Isaiah 6:1-8: Isaiah's vision in the temple",
  seed: 43,
  fov: 64,
  exposure: 1.1,

  sun: { direction: [0.2, 0.9, 0.3], color: '#fff2d8', intensity: 0.3 },
  light: { sky: '#e8dcc8', ground: '#7a6448', hemi: 0.8 },
  sky: { top: '#d8ccb8', horizon: '#e8dcc8', ground: '#c8b8a0', sunColor: '#ffffff', glow: 0 },
  fog: { color: '#d8cab0', near: 14, far: 110 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.85 },
  grade: { saturation: 0.95, contrast: 1.04, vignette: 0.5, shadowTint: '#4a3a50', highlightTint: '#fff4dc' },
  shadow: { center: [0, -14], radius: 30 },

  player: { start: [-1.6, 8], yaw: 0, pitch: 0.16, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 400, segments: 40, seed: 43, hills: 0, bumps: 0,
    flats: [{ x: 0, z: 0, r: 500, falloff: 10, height: 0 }],
    colors: { ground: '#8a7458', groundAlt: '#8a7458', grass: '#8a7458', rock: '#8a7458' },
  },

  custom(ctx) {
    const { THREE } = ctx;
    const { x: hx, z: hz, w, d, h } = HALL;
    room(ctx, { x: hx, z: hz, w, d, h, wall: '#b88a4a', floor: '#c8a868', ceiling: '#8a6234', base: '#d8b050', baseH: 2.2 });

    // Cedar panels with gold palm and cherub carvings.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 8; i++) {
        const z = NORTH + 4 + i * 5.4;
        ctx.solid.box(0.2, 7, 3.6, { position: [side * (w / 2 - 0.5), 6.5, z], color: '#8a5a2e' });
        ctx.solid.add(new THREE.ConeGeometry(0.9, 3.4, 5), { position: [side * (w / 2 - 0.65), 6.8, z], color: '#e0b850' });
        ctx.solid.add(new THREE.CylinderGeometry(0.5, 0.6, h, 8), { position: [side * (w / 2 - 2.2), h / 2, z + 2.7], color: '#c89a4a' });
        ctx.colliders.add({ x: side * (w / 2 - 2.2), z: z + 2.7, w: 1.2, d: 1.2, bottom: 0, top: h });
      }
    }

    // The throne, high and lifted up, on a great stair.
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const sz = THRONE[1] + 9 - i * 0.6;
      block(ctx, { x: 0, z: (sz + NORTH) / 2, w: 14 - i * 0.3, h: ((i + 1) * TOP) / steps, d: sz - NORTH, color: i % 2 ? '#e8dcc0' : '#ded0b0', jitter: 0.02 });
    }
    block(ctx, { x: THRONE[0], z: THRONE[1] - 1.6, y: TOP, w: 4.4, h: 7, d: 1, color: '#f0d070' });
    block(ctx, { x: THRONE[0], z: THRONE[1] - 0.6, y: TOP, w: 3.6, h: 1.4, d: 2, color: '#e8c860' });
    for (const s of [-1, 1]) block(ctx, { x: THRONE[0] + s * 2.1, z: THRONE[1] - 0.4, y: TOP, w: 0.6, h: 2.2, d: 2.4, color: '#e0b850' });
    being(ctx, { x: THRONE[0], z: THRONE[1] - 0.2, y: TOP + 0.3, face: [0, 20], scale: 2.1, arms: 'out', light: 40, distance: 30, halo: 7, glow: 0.7 });
    ctx.effects.halo({ position: [THRONE[0], TOP + 6, THRONE[1] - 1], size: 18, color: '#fff4dc', opacity: 0.25 });

    // His train filling the temple: white cloth pouring down the stair and across the floor.
    const train = new THREE.PlaneGeometry(1, 1, 10, 24);
    const tp = train.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const u = tp.getX(i) + 0.5, v = 0.5 - tp.getY(i);
      const z = THRONE[1] + 0.6 + v * 26;
      const stairEnd = THRONE[1] + 9.6;
      const y = z < stairEnd ? TOP * (1 - (z - THRONE[1]) / 9.6) + 0.06 : 0.07;
      const width = 2.2 + v * v * 18;
      tp.setXYZ(i, (u - 0.5) * width, Math.max(0.07, y + 0.1) + Math.sin(u * 30) * 0.06 * v, z);
    }
    train.computeVertexNormals();
    ctx.glow.add(train, { color: '#e8e2d6', jitter: 0.03 });

    // Seraphim above the throne.
    const seraphs = [[-4.2, TOP + 4.2, THRONE[1] + 4], [4.2, TOP + 4.2, THRONE[1] + 4], [-8, TOP + 2.2, THRONE[1] + 7], [8, TOP + 2.2, THRONE[1] + 7]];
    seraphs.forEach(([x, y, z], i) => seraph(ctx, { x, y, z, face: [0, 20], scale: 1.7, seed: i + 1 }));

    // The altar of incense with live coals, and the seraph bringing one to Isaiah.
    block(ctx, { x: ALTAR[0], z: ALTAR[1], w: 1.8, h: 1.1, d: 1.8, color: '#d8b050' });
    for (const [cx, cz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) ctx.solid.box(0.25, 0.3, 0.25, { position: [ALTAR[0] + cx, 1.25, ALTAR[1] + cz], color: '#e8c060' });
    for (let i = 0; i < 12; i++) {
      ctx.glow.add(new THREE.OctahedronGeometry(ctx.rand.range(0.1, 0.2), 0), { position: [ALTAR[0] + ctx.rand.range(-0.6, 0.6), 1.15, ALTAR[1] + ctx.rand.range(-0.6, 0.6)], color: ctx.rand.pick(['#ff6a1a', '#ffa040']) });
    }
    fireLight(ctx, { position: [ALTAR[0], 2, ALTAR[1]], intensity: 8, distance: 8 });
    ctx.effects.smoke({ position: [ALTAR[0], 1.2, ALTAR[1]], count: 10, height: 16, size: 0.5, color: '#e8e0d0', wind: [0.6, -1.2] });
    const flier = seraph(ctx, { x: 2.6, y: 2.6, z: -2.2, face: [-1.6, 1.2], scale: 1.0, seed: 9 });
    const coal = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: '#ff8a2a', toneMapped: false }));
    coal.position.set(0, 0.1, 0.6);
    flier.add(coal);
    const tongs = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.7), new THREE.MeshLambertMaterial({ color: '#c8a040' }));
    tongs.position.set(0, 0.1, 0.3);
    flier.add(tongs);

    // Isaiah, fallen to his knees: "Woe is me! for I am undone."
    person(ctx, { x: -1.6, z: 1.2, y: -0.5, face: THRONE, tilt: [0.35, 0], robe: '#6a5a44', mantle: '#8a7454', skin: '#9b6a46', hood: true, arms: 'out' });

    // Smoke filling the house.
    for (const [x, z, hgt] of [[-10, -30, 18], [10, -31, 18]]) {
      ctx.effects.smoke({ position: [x, 1, z], count: 8, height: hgt, size: 1.3, color: '#efe6d6', wind: [0, -0.3] });
    }
    fireLight(ctx, { position: [0, 8, -8], intensity: 30, distance: 40, color: '#fff0d0', flicker: 0.02 });
  },
};
