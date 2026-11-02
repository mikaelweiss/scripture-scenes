// Acts 12:5-11. Night in Herod's prison. An angel's light fills the cell, Peter's chains lie on the
// floor between the sleeping soldiers, the keepers doze in the ward, and the iron gate to the city
// swings open of its own accord. -z leads out through the ward to the gate and the street.
import { room, torch, figure, divine, nightSky, house, Batch } from './lib/nt-32-kit.js';

const CELL = [0, 0];
const WARD = [0, -9.2];
const GATE_Z = -14.4;
const PETER = [-0.7, -1.2];
const ANGEL = [1.1, -2.2];

const wallStone = '#6e6458';
const moon = [0.35, 0.5, -0.8];

export default {
  title: 'Acts 12:5-11: Peter freed from prison',
  seed: 34,
  fov: 66,
  exposure: 1.15,

  sun: { direction: moon, color: '#9fb4ff', intensity: 1.6 },
  light: { sky: '#3a4a78', ground: '#14121a', hemi: 0.6 },
  sky: { top: '#04060e', horizon: '#1a2240', ground: '#0a0a10', sunColor: '#c8d4ff', glow: 0.25 },
  fog: { color: '#0e1220', near: 30, far: 260 },
  clouds: { count: 16, shadow: '#0e1220', lit: '#3a4670', rim: '#8090c0', distance: [400, 900], altitude: [120, 240], hole: 0.3 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.82 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.5, shadowTint: '#1a1e40', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -14], radius: 40 },

  player: { start: [-0.9, 2.9], yaw: -0.08, pitch: 0.02, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 900,
    segments: 160,
    seed: 34,
    hills: 18,
    bumps: 0.2,
    flats: [{ x: 0, z: -20, r: 60, falloff: 40, height: 0 }],
    colors: { ground: '#5a5048', groundAlt: '#4e463e', grass: '#3e4430', high: '#5a5248', rock: '#4a4440' },
    patches: [{ x: 0, z: -30, r: 10, color: '#6a6054', strength: 0.6, rough: 0.2 }],
  },

  objects: [],
  scatter: [
    { type: 'tree', count: 20, center: [0, -60], ring: [30, 160], spacing: 12, seed: 341, props: { kind: 'broad', leaf: '#2e3a2a' } },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    nightSky(ctx, { moon, moonSize: 30 });

    room(ctx, { x: CELL[0], z: CELL[1], y: 0, w: 7, d: 7, h: 3.4, color: wallStone, floor: '#4e463e', doors: { n: [{ at: 0, width: 1.4, height: 2.2 }] } });
    room(ctx, { x: WARD[0], z: WARD[1], y: 0, w: 8, d: 10.4, h: 3.6, color: wallStone, floor: '#4e463e', doors: { s: [{ at: 0, width: 1.4, height: 2.2 }], n: [{ at: 0, width: 2.4, height: 2.8 }] } });
    // Outer prison wall flanking the gate.
    for (const side of [-1, 1]) {
      const x = side * 14;
      ctx.solid.box(20, 5, 1, { position: [x, 2.5, GATE_Z - 0.6], color: '#5e554a', jitter: 0.06 });
      ctx.colliders.add({ x, z: GATE_Z - 0.6, w: 20, d: 1, bottom: -1, top: 5 });
    }

    // Cell door swung open into the ward.
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.15, 0.1), new THREE.MeshLambertMaterial({ color: '#4a3424', flatShading: true }));
    door.geometry.translate(0.675, 1.08, 0);
    door.position.set(-0.7, 0, -3.8);
    door.rotation.y = 1.9;
    ctx.scene.add(door);

    // Peter rising, chains fallen from his hands, a soldier asleep on each side.
    figure(ctx, { x: PETER[0], z: PETER[1], y: 0, face: ANGEL, robe: '#6a5440', mantle: '#4a5a6a', arms: 'down' });
    for (const [sx, sz, f] of [[-1.6, -1.6, [2, -1.6]], [1.9, -0.6, [-2, -0.6]]]) {
      figure(ctx, { x: sx, z: sz, y: 0, face: f, pose: 'lie', robe: '#7a2a22', mantle: '#5a5650', hood: true });
      ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 4), { position: [sx, 0.05, sz + 0.6], rotation: [Math.PI / 2, 1.4, 0], color: '#5a4332' });
      ctx.solid.box(0.5, 0.7, 0.06, { position: [sx + Math.sign(sx) * 0.8, 0.04, sz - 0.6], rotation: [Math.PI / 2, 0, 0.3], color: '#8a3424' });
    }
    const links = new Batch(ctx.rand);
    for (const [x0, z0, ang] of [[-1.2, -1.0, 0.3], [-0.1, -0.8, -0.4]]) {
      for (let i = 0; i < 9; i++) {
        const x = x0 + Math.cos(ang) * i * 0.11 * Math.sign(x0), z = z0 + Math.sin(ang) * i * 0.11 + Math.sin(i) * 0.04;
        links.add(new THREE.TorusGeometry(0.06, 0.018, 4, 8), { position: [x, 0.03, z], rotation: [Math.PI / 2 + (i % 2) * 1.2, ang + (i % 2) * 1.5, 0], color: '#8a8a90', jitter: 0.04 });
      }
      links.add(new THREE.TorusGeometry(0.09, 0.03, 5, 10), { position: [x0, 0.04, z0], rotation: [Math.PI / 2, 0, 0], color: '#6a6a70' });
    }
    ctx.scene.add(links.build(new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#3a3a40' })));
    ctx.solid.box(0.9, 0.06, 1.8, { position: [-2.8, 0.03, 1.8], color: '#6a5a3a' });
    ctx.solid.add(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 7), { position: [2.8, 0.15, 2.8], color: '#8a5a3a' });

    divine(ctx, { x: ANGEL[0], z: ANGEL[1], y: 0, face: PETER, scale: 1.08, light: 26, range: 14, halo: 4.5, arms: 'out' });
    ctx.effects.ring({ position: [ANGEL[0], 0.03, ANGEL[1]], radius: 1.2, width: 0.6, color: '#ffe3a0', opacity: 0.6 });

    // The first and second ward: keepers asleep at their posts.
    for (const [gx, gz, f] of [[-3.2, -6.5, [0, -6.5]], [3.2, -7.8, [0, -7.8]], [-3.1, -12.2, [0, -12.2]], [3.1, -11.4, [0, -11.4]]]) {
      ctx.solid.box(0.6, 0.45, 1.6, { position: [gx, 0.22, gz], color: '#5a4434' });
      figure(ctx, { x: gx, z: gz, y: 0.45, face: [f[0], f[1] + 3], pose: 'sit', robe: '#7a2a22', mantle: '#5a5650', hood: true });
      ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 4), { position: [gx + Math.sign(-gx) * 0.5, 1.2, gz - 0.4], rotation: [0.12, 0, Math.sign(gx) * 0.18], color: '#5a4332' });
    }
    torch(ctx, { x: -3.7, y: 2.0, z: -9.2, intensity: 14, range: 11 });
    torch(ctx, { x: 3.7, y: 2.0, z: -5.5, intensity: 12, range: 10 });

    // The iron gate that opens of its own accord.
    const bars = new Batch(ctx.rand);
    const gw = 2.3, gh = 2.75;
    for (let i = 0; i <= 8; i++) bars.box(0.06, gh, 0.06, { position: [(i / 8) * gw, gh / 2, 0], color: '#3a3a40', jitter: 0.03 });
    for (const y of [0.15, 1.3, gh - 0.1]) bars.box(gw, 0.1, 0.08, { position: [gw / 2, y, 0], color: '#2e2e34', jitter: 0.03 });
    for (let i = 0; i < 8; i++) bars.add(new THREE.ConeGeometry(0.06, 0.2, 4), { position: [((i + 0.5) / 8) * gw, gh + 0.05, 0], color: '#3a3a40' });
    const gate = bars.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
    gate.position.set(-gw / 2 - 0.05, 0, GATE_Z - 0.1);
    gate.castShadow = true;
    ctx.scene.add(gate);
    ctx.onFrame((t) => {
      const k = Math.min(1, Math.max(0, (t - 1.5) / 5));
      gate.rotation.y = -(1 - Math.cos(k * Math.PI)) * 0.5 * 1.7;
    });

    // The street of the city beyond, under the moon.
    for (let i = 0; i < 7; i++) {
      for (const side of [-1, 1]) {
        house(ctx, { x: side * (7 + (i % 2)), z: -24 - i * 9, rot: side > 0 ? -Math.PI / 2 : Math.PI / 2, w: 7, d: 6, h: 3.5 + (i % 3), color: '#7a7060', windows: true });
      }
    }
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      const wx = side * 3.6, wz = -26 - i * 13;
      ctx.glow.box(0.35, 0.4, 0.05, { position: [wx, 2.0, wz], color: '#ffb060' });
    }
  },
};
