// Daniel 5: Belshazzar's feast in the palace hall at night. A thousand lords drink from the temple
// vessels while fingers of a man's hand write on the plaster over against the candlestick. -z is north.
import { block, room, person, flames, fireLight, writing } from './lib/ot-38-kit.js';

const HALL = { x: 0, z: -10, w: 32, d: 42, h: 12 };
const NORTH = HALL.z - HALL.d / 2;
const DAIS = [0, NORTH + 4];
const WRITING = [-9, 5.6];
const plaster = '#8e7e66';
const tableXs = [-10, -4, 4, 10];

const seatsFor = (tx, side) =>
  Array.from({ length: 13 }, (_, i) => [tx + side * 1.15, -24 + i * 2.1 + (side > 0 ? 0.4 : 0)]);

export default {
  title: 'Daniel 5:5-6, 25-28: The writing on the wall',
  seed: 39,
  fov: 64,
  exposure: 1.05,

  sun: { direction: [0.4, 0.8, 0.3], color: '#8090c0', intensity: 0.25 },
  light: { sky: '#6a5a6a', ground: '#3a2418', hemi: 0.55 },
  sky: { top: '#060812', horizon: '#141a30', ground: '#0a0a12', sunColor: '#203050', glow: 0 },
  fog: { color: '#1a120c', near: 45, far: 160 },
  bloom: { strength: 0.5, radius: 0.45, threshold: 0.85 },
  grade: { saturation: 1.12, contrast: 1.08, vignette: 0.5, shadowTint: '#1a1430', highlightTint: '#ffd8a0' },
  shadow: { center: [0, -10], radius: 30 },

  player: { start: [0, -7], yaw: 0.13, pitch: 0.1, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 600, segments: 60, seed: 39, hills: 4, bumps: 0.1,
    flats: [{ x: 0, z: -10, r: 60, falloff: 30, height: 0 }],
    colors: { ground: '#4a3a2c', groundAlt: '#3e3024', grass: '#3a3a24', high: '#4a3a2c', rock: '#3a3028' },
  },

  crowd: {
    palette: {
      robes: ['#6a2a6e', '#8a2a2a', '#2a4a8a', '#b08a3a', '#d8c8a0', '#2e6a5a', '#8a3a6a', '#c05a2a', '#e0d0b0'],
      mantles: ['#d4a83a', '#7a1f2a', '#3a2a6a', '#efe0c0', '#1f3e7a', '#a8402a'],
      skins: ['#9b6a46', '#a87652', '#8a5a3c', '#b5835e', '#c08e64'],
      mantleChance: 0.8,
      hoodChance: 0.15,
    },
    groups: [
      ...tableXs.flatMap((tx, ti) => [-1, 1].map((side, si) => ({
        count: 13, points: seatsFor(tx, side), face: [tx - side * 400, -12], kneel: 1, children: 0, seed: 40 + ti * 2 + si,
      }))),
      {
        count: 50, center: [0, -10], ring: [0, 14], spacing: 1.1, face: WRITING, children: 0, seed: 50,
        avoid: [
          ...tableXs.map((tx) => ({ rect: [tx, -11, 4.2, 30] })),
          { rect: [0, -3, 4, 28] },
          { rect: [DAIS[0], DAIS[1], 14, 8] },
          { rect: [-9, NORTH + 3, 6, 6] },
        ],
      },
      {
        count: 24, center: [0, -10], ring: [12.5, 15], arc: [0, Math.PI * 2], spacing: 1.2, face: WRITING, children: 0, seed: 51,
        avoid: [{ rect: [0, 2, 6, 24] }, { rect: [DAIS[0], DAIS[1], 14, 8] }],
      },
    ],
  },

  custom(ctx) {
    const { THREE } = ctx;
    const { x: hx, z: hz, w, d, h } = HALL;
    room(ctx, { x: hx, z: hz, w, d, h, wall: '#a08868', floor: '#6e5440', ceiling: '#3a2618', door: 4.5, base: '#2a4f8a', baseH: 1.4 });

    // Glazed blue frieze with gold rosettes along the walls.
    for (const [bx, bz, bw, bd] of [[hx, NORTH + 0.5, w, 0.15], [hx - w / 2 + 0.5, hz, 0.15, d], [hx + w / 2 - 0.5, hz, 0.15, d]]) {
      ctx.solid.box(bw, 1.2, bd, { position: [bx, 8.6, bz], color: '#2a5a9a', jitter: 0.03 });
      const n = Math.round(Math.max(bw, bd) / 2.2);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n - 0.5;
        const px = bw > bd ? bx + t * bw : bx + (bx < 0 ? 0.1 : -0.1);
        const pz = bw > bd ? bz + 0.1 : bz + t * bd;
        ctx.solid.add(new THREE.OctahedronGeometry(0.32, 0), { position: [px, 8.6, pz], color: '#e0b84a' });
      }
    }

    // Plaster panel on the north wall, the candlestick before it, and the writing.
    ctx.solid.box(11, 6, 0.2, { position: [WRITING[0], WRITING[1], NORTH + 0.5], color: plaster, jitter: 0.02 });
    const text = writing(ctx, {
      lines: ['MENE  MENE', 'TEKEL  UPHARSIN'],
      position: [WRITING[0], WRITING[1], NORTH + 0.66],
      width: 9.6, height: 4, color: '#fff0c0', glowColor: '#ffb040', font: 'bold 92px Georgia, serif',
    });
    text.material.fog = false;
    text.material.color.setScalar(1.0);
    const hand = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: '#f8ecd8', emissive: '#fff0d0', emissiveIntensity: 0.6, flatShading: true });
    hand.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.14), skin));
    [-0.15, -0.05, 0.05, 0.15].forEach((fx, i) => {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38 - Math.abs(i - 1.5) * 0.05, 0.08), skin);
      finger.position.set(fx, 0.42, 0.04 + i * 0.01);
      finger.rotation.x = -0.25;
      hand.add(finger);
    });
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), skin);
    thumb.position.set(-0.26, 0.05, 0.06);
    thumb.rotation.z = 0.7;
    hand.add(thumb);
    const handBase = new THREE.Vector3(WRITING[0] + 5.1, WRITING[1] - 1.6, NORTH + 0.95);
    hand.position.copy(handBase);
    hand.rotation.set(-0.3, 0, -0.35);
    hand.scale.setScalar(1.6);
    ctx.scene.add(hand);
    ctx.effects.halo({ position: [handBase.x, handBase.y + 0.3, handBase.z + 0.2], size: 2.2, color: '#fff2d0', opacity: 0.45 });
    const handLight = new THREE.PointLight('#fff0d0', 5, 8, 1.5);
    handLight.position.set(handBase.x, handBase.y, handBase.z + 1.5);
    ctx.scene.add(handLight);
    ctx.onFrame((t) => {
      hand.position.set(handBase.x + Math.sin(t * 1.3) * 0.35, handBase.y + Math.sin(t * 2.6) * 0.12, handBase.z);
      text.material.opacity = 0.85 + 0.15 * Math.sin(t * 1.7);
    });

    const lx = WRITING[0] - 5.6, lz = NORTH + 3;
    ctx.solid.add(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 8), { position: [lx, 0.25, lz], color: '#c9a040' });
    ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.16, 3.4, 6), { position: [lx, 2.1, lz], color: '#d8b04a' });
    for (const s of [-1, 0, 1]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.12, 0.3, 8), { position: [lx + s * 0.9, 3.9, lz], color: '#d8b04a' });
      if (s) ctx.solid.box(0.9, 0.1, 0.1, { position: [lx + s * 0.45, 3.6, lz], color: '#d8b04a' });
      flames(ctx, { x: lx + s * 0.9, z: lz, y: 4.05, w: 0.15, d: 0.15, count: 4, height: 0.7, seed: 60 + s });
    }
    block(ctx, { x: lx, z: lz, w: 1.8, h: 0.5, d: 1.8, color: '#c9a040', collide: true });
    fireLight(ctx, { position: [lx, 4.6, lz + 1], intensity: 10, distance: 10, color: '#ffb060' });

    // The dais, throne, and the king whose countenance changed.
    block(ctx, { x: DAIS[0], z: DAIS[1], w: 12, h: 0.5, d: 6, color: '#8a6a4a' });
    block(ctx, { x: DAIS[0], z: DAIS[1] - 0.5, y: 0.5, w: 8, h: 0.5, d: 4, color: '#a07a50' });
    ctx.solid.box(2.4, 3.4, 0.5, { position: [DAIS[0], 1 + 1.7, DAIS[1] - 2.3], color: '#c9a040' });
    ctx.solid.box(2.2, 0.6, 1.4, { position: [DAIS[0], 1.3, DAIS[1] - 1.6], color: '#6a2a6e' });
    person(ctx, { x: DAIS[0] - 0.3, z: DAIS[1] - 0.4, y: 1, face: [WRITING[0] - 2, NORTH], tilt: [-0.12, 0.08], robe: '#5a1f6a', mantle: '#d4a83a', skin: '#b5835e', arms: 'out', scale: 1.1 });
    ctx.solid.add(new THREE.CylinderGeometry(0.17, 0.2, 0.25, 8), { position: [DAIS[0] - 0.3, 1 + 1.99, DAIS[1] - 0.45], rotation: [-0.12, 0, 0.08], color: '#f2c44a' });
    for (const [px, pz] of [[-4, DAIS[1] + 1], [4.5, DAIS[1] + 0.5], [3, DAIS[1] - 1], [-3, DAIS[1] - 1.5]]) {
      person(ctx, { x: px, z: pz, y: 1, face: WRITING, robe: ctx.rand.pick(['#8a2a2a', '#2a4a8a', '#e0d0b0', '#b08a3a']), mantle: '#d4a83a', skin: '#a87652', arms: ctx.rand() < 0.5 ? 'out' : 'down' });
    }

    // Feast tables laden with the gold and silver vessels of the temple.
    for (const tx of tableXs) {
      block(ctx, { x: tx, z: -11.2, w: 1.5, h: 0.55, d: 28, color: '#5a3a24' });
      ctx.solid.box(1.7, 0.06, 28.2, { position: [tx, 0.58, -11.2], color: '#d8c8a0', jitter: 0.02 });
      for (let i = 0; i < 26; i++) {
        const r = ctx.rand;
        const pz = -24.5 + i * 1.05 + r.range(-0.2, 0.2), px = tx + r.range(-0.45, 0.45);
        const kind = r();
        if (kind < 0.4) ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.06, 0.28, 7), { position: [px, 0.75, pz], color: r() < 0.6 ? '#e2b84a' : '#d8d8e0' });
        else if (kind < 0.65) ctx.solid.add(new THREE.CylinderGeometry(0.28, 0.16, 0.14, 8), { position: [px, 0.68, pz], color: '#e2b84a' });
        else if (kind < 0.85) ctx.solid.add(new THREE.DodecahedronGeometry(0.14, 0), { position: [px, 0.72, pz], color: r.pick(['#8a2a4a', '#c0a040', '#6a8a3a']) });
        else ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.18, 0.5, 7), { position: [px, 0.86, pz], color: '#c9a040' });
      }
    }

    // Columns and hanging lamps.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const cx = side * 13.2, cz = -26 + i * 8.5;
        ctx.solid.add(new THREE.CylinderGeometry(0.55, 0.65, h, 8), { position: [cx, h / 2, cz], color: '#c4aa80' });
        ctx.solid.box(1.8, 0.6, 1.8, { position: [cx, h - 0.3, cz], color: '#8a6a44' });
        ctx.solid.box(1.6, 0.5, 1.6, { position: [cx, 0.25, cz], color: '#8a6a44' });
        ctx.colliders.add({ x: cx, z: cz, w: 1.4, d: 1.4, bottom: 0, top: h });
        ctx.solid.add(new THREE.CylinderGeometry(0.35, 0.2, 0.3, 8), { position: [cx - side * 1.0, 3.2, cz], color: '#c9a040' });
        ctx.glow.add(new THREE.ConeGeometry(0.14, 0.45, 5), { position: [cx - side * 1.0, 3.55, cz], color: '#ffb84a' });
        ctx.solid.box(1.1, 0.08, 0.08, { position: [cx - side * 0.5, 3.3, cz], color: '#4a3020' });
      }
    }
    fireLight(ctx, { position: [-8, 5, -18], intensity: 55, distance: 26, color: '#ffa452' });
    fireLight(ctx, { position: [8, 5, -18], intensity: 55, distance: 26, color: '#ffa452' });
    fireLight(ctx, { position: [0, 5, -4], intensity: 50, distance: 24, color: '#ffa452' });
    fireLight(ctx, { position: [0, 6, -26], intensity: 40, distance: 18, color: '#ffb468' });
  },
};
