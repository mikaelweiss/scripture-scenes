// Acts 12:5-11: by night an angel wakes Peter between two sleeping soldiers. His chains fall off,
// they pass the first and second ward, and the iron gate to the city opens of its own accord.
// The gate stands north in the prison's outer wall. The cell block is on the west side of the yard.
import * as THREE from 'three';
import { angels, Batch, bars, box, chain, cityWall, cyl, DAY_STYLE, flames, frameAt, glow, house, moon, person, ribbon, sleeper, stars, torch } from './lib/nt-32-kit.js';

const GATE_Z = -14;
const ANGEL = [0.2, -7];
const PETER = [1.3, -5.6];
const CELL = { x0: -22, x1: -7, z0: -4, z1: 2 };
const SOLDIER = { robe: '#a63b2e', mantle: '#7a2a22', skin: '#b5825a', hair: '#8a8a90', sash: '#c8912e' };

export default {
  title: 'Acts 12:5-11: Peter freed from prison',
  subtitle: 'The chains fell from his hands, and the iron gate opened of his own accord',
  seed: 34,

  style: { ...DAY_STYLE, ink: '#10121c', fog: { color: '#1a2036', near: 60, far: 420 }, toonSteps: [0.35, 0.7, 1.0] },

  sky: { zenith: '#070b1c', mid: '#141c3a', horizon: '#2c3558', ground: '#141826', glowColor: '#3c4878', glowDir: [-0.4, 0.4, -1] },

  sun: { dir: [-0.4, 0.8, -0.5], color: '#9fb0e0', intensity: 0.75, hemi: { sky: '#40507e', ground: '#1c1a24', intensity: 1.0 }, shadowSize: 50 },

  ground: {
    size: 1000, segments: 200, flatRadius: 120, hillHeight: 30, undulation: 0.15,
    plaza: { center: [0, 6], size: [60, 40] },
    colors: { sand: '#6a6070', dirt: '#5a5262', grass: '#4a5a52', grassDark: '#3a4a44', plaza: '#7a7484', plazaLine: '#5a5464', scorch: '#2a2228', scorchEdge: '#3a3238', hill: '#3a4256' },
  },

  objects: [],

  custom(ctx) {
    const { scene } = ctx;
    const b = new Batch(ctx);
    stars(ctx, { count: 1100, color: '#e8ecff' });
    moon(ctx, { dir: [-0.45, 0.42, -0.8], size: 70, color: '#f3eedc' });
    const stone = '#8a8294', stoneDark = '#6a6474';

    // Outer wall with the iron gate that leads to the city.
    cityWall(b, ctx, { from: [-32, GATE_Z], to: [-4.2, GATE_Z], height: 8, thick: 1.8, color: stone });
    cityWall(b, ctx, { from: [4.2, GATE_Z], to: [32, GATE_Z], height: 8, thick: 1.8, color: stone });
    for (const sx of [-1, 1]) house(b, ctx, { pos: [sx * 5.2, GATE_Z], size: [2.6, 3.2], height: 10, color: stoneDark, trim: stone, door: null });
    const gy = ctx.terrainHeight(0, GATE_Z);
    b.add(stoneDark, box(8, 2.6, 2.4, [0, gy + 7.6, GATE_Z]));
    for (const [from, to] of [[[-32, GATE_Z], [-32, 30]], [[32, GATE_Z], [32, 30]], [[-32, 30], [32, 30]]]) cityWall(b, ctx, { from, to, height: 6, thick: 1.4, color: stone });

    const gate = [];
    for (const side of [-1, 1]) {
      const leaf = new THREE.Group();
      leaf.position.set(side * 3.85, gy, GATE_Z);
      const lb = [];
      const W = 3.7;
      for (let i = 0; i <= 9; i++) lb.push(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 5).translate(-side * (0.1 + (i / 9) * (W - 0.2)), 3.1, 0));
      for (const hy of [0.4, 2.2, 4.0, 5.9]) lb.push(new THREE.BoxGeometry(W, 0.16, 0.12).translate(-side * W / 2, hy, 0));
      for (const g of lb) {
        const m = new THREE.Mesh(g, ctx.kit.toon('#2e2e36'));
        m.castShadow = true;
        leaf.add(m);
      }
      scene.add(leaf);
      gate.push({ leaf, side });
    }
    ctx.onFrame((t) => {
      const c = t % 18;
      const open = c < 1.5 ? 0 : c < 5.5 ? THREE.MathUtils.smootherstep(c, 1.5, 5.5) : c < 15.5 ? 1 : 1 - THREE.MathUtils.smootherstep(c, 15.5, 18);
      for (const { leaf, side } of gate) leaf.rotation.y = side * open * 1.75;
    });

    // The city beyond the gate, asleep under the moon.
    ribbon(ctx, { points: [[0, GATE_Z], [0, -60], [6, -120]], width: 5, color: '#6e6878' });
    const rng = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let i = 0; i < 46; i++) {
      const side = i % 2 ? 1 : -1;
      const z = -22 - Math.floor(i / 2) * 7 - rng() * 2;
      const x = side * (7 + rng() * 4 + (i > 20 ? rng() * 20 : 0));
      house(b, ctx, { pos: [x, z], size: [5 + rng() * 3, 5 + rng() * 2], height: 3.5 + rng() * 4, rot: (rng() - 0.5) * 0.2 + (side > 0 ? -Math.PI / 2 : Math.PI / 2), color: ['#7c7488', '#8a8294', '#6e687c'][i % 3], trim: '#5a5468', lit: rng() < 0.15, upper: rng() < 0.3 });
    }

    // The cell block: three cells facing the yard behind iron bars. Peter's cell is the east one, its door standing open.
    const { x0, x1, z0, z1 } = CELL;
    const cy = ctx.terrainHeight((x0 + x1) / 2, (z0 + z1) / 2);
    const H = 4;
    b.add('#5c5664', box(x1 - x0, 0.2, z1 - z0, [(x0 + x1) / 2, cy + 0.1, (z0 + z1) / 2]), { cast: false });
    ctx.addCollider({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, rot: 0, top: cy + 0.2, walkable: true });
    const wall = (x, z, w, d, h = H) => {
      b.add(stone, box(w, h, d, [x, cy + h / 2, z]));
      ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: cy + h });
    };
    wall((x0 + x1) / 2, z0 - 0.3, x1 - x0 + 0.6, 0.8, H + 0.6);
    const cellW = (x1 - x0) / 3;
    for (let i = 0; i <= 3; i++) {
      const x = x0 + i * cellW;
      wall(x, (z0 + z1) / 2, 0.5, z1 - z0);
      b.add(stoneDark, box(0.7, H + 0.4, 1, [x, cy + (H + 0.4) / 2, z1]));
    }
    b.add(stoneDark, box(x1 - x0 + 0.7, 0.5, 0.7, [(x0 + x1) / 2, cy + H + 0.2, z1]));
    for (let i = 0; i < 9; i++) b.add('#4a3a2c', cyl(0.1, 0.1, z1 - z0, [x0 + 0.8 + i * 1.66, cy + H + 0.1, (z0 + z1) / 2], [Math.PI / 2, 0, 0], 5));
    for (let i = 0; i < 2; i++) {
      const a = x0 + i * cellW, c = a + cellW;
      bars(b, { from: [a + 0.4, z1], to: [c - 0.4, z1], y0: cy + 0.2, h: H - 0.2 });
      ctx.addCollider({ x: (a + c) / 2, z: z1, hx: cellW / 2, hz: 0.15, rot: 0, top: cy + H });
    }
    const px = x1 - cellW / 2, pz = (z0 + z1) / 2;
    bars(b, { from: [x1 - cellW + 0.4, z1], to: [px - 0.4, z1], y0: cy + 0.2, h: H - 0.2 });
    ctx.addCollider({ x: x1 - cellW + 1.2, z: z1, hx: 0.9, hz: 0.15, rot: 0, top: cy + H });
    bars(b, { from: [x1 - 0.4, z1 + 0.1], to: [x1 - 1.6, z1 + 2.2], y0: cy + 0.2, h: H - 0.4 });

    // Inside: two soldiers asleep, the chains fallen open between them, Peter's empty mat.
    sleeper(ctx, { pos: [px - 1.5, pz + 0.3], yaw: Math.PI, colors: SOLDIER, y: cy + 0.2 });
    sleeper(ctx, { pos: [px + 1.5, pz + 0.3], yaw: Math.PI, colors: { ...SOLDIER, robe: '#94352a' }, y: cy + 0.2, roll: -0.35 });
    b.add('#7a6a52', box(0.9, 0.08, 2.2, [px, cy + 0.24, pz]), { cast: false });
    chain(b, ctx, { points: [[px - 1.3, pz + 0.6], [px - 0.8, pz + 1.0], [px - 0.2, pz + 1.3], [px + 0.1, pz + 1.9]], y: cy + 0.2 });
    chain(b, ctx, { points: [[px + 1.3, pz + 0.6], [px + 0.7, pz + 0.9], [px + 0.3, pz + 1.4], [px + 0.5, pz + 2.0]], y: cy + 0.2 });
    for (const [x, z] of [[px + 0.1, pz + 1.9], [px + 0.5, pz + 2.0]]) b.add('#55555e', new THREE.TorusGeometry(0.12, 0.04, 5, 10).rotateX(Math.PI / 2).translate(x, cy + 0.24, z), { cast: false });
    glow(ctx, { pos: [px, cy + 1.2, pz + 0.5], size: 5, color: '#fff1c8', opacity: 0.3, pulse: 0.06 });
    const lit = new THREE.PointLight('#ffe8b0', 6, 9, 1.3);
    lit.position.set(px, cy + 2.6, pz + 1);
    scene.add(lit);
    for (const [x, yaw] of [[x0 + 2.5, 0.4], [x0 + cellW + 2.5, -2.6]]) sleeper(ctx, { pos: [x, pz], yaw, colors: { robe: '#6b5a4a', mantle: '#4a3a2c', skin: '#9c6a45', hair: '#2b1a12' }, y: cy + 0.2 });

    // The first and second ward: guards asleep at their posts with torches.
    const guard = (pos, face, colors, spear = true) => {
      const g = person(ctx, { pos, face, colors: { ...SOLDIER, ...colors } });
      g.rotation.x = 0.12;
      if (spear) b.add('#5a3e28', cyl(0.035, 0.035, 2.8, [pos[0] + 0.35, ctx.terrainHeight(...pos) + 1.4, pos[1]], [0, 0, 0.12], 5));
    };
    guard([-3.2, 5.6], [0, 9]);
    guard([-4.6, 6.6], [-6, 10], { robe: '#94352a' });
    sleeper(ctx, { pos: [5.5, -2], yaw: 0.6, colors: SOLDIER });
    guard([6.6, -0.4], [2, -4], { robe: '#94352a' });
    guard([-4.6, -10.6], [0, -6]);
    guard([4.6, -10.4], [0, -6], { robe: '#94352a' });
    torch(b, ctx, { pos: [-5.4, 3.4], light: { color: '#ffa850', intensity: 7, distance: 14 } });
    torch(b, ctx, { pos: [8, -1.5], light: { color: '#ffa850', intensity: 7, distance: 14 } });
    torch(b, ctx, { pos: [-6.6, -12], light: { color: '#ffa850', intensity: 8, distance: 16 } });
    torch(b, ctx, { pos: [6.6, -12], light: null });

    // The angel leads Peter, wrapped in his garment, toward the opening gate.
    angels(ctx, [{ pos: [ANGEL[0], ctx.terrainHeight(...ANGEL) + 0.15, ANGEL[1]], face: [0, GATE_Z - 4], scale: 1.12 }], { glowSize: 6, glowOpacity: 0.6, bob: 0.1, light: { color: '#fff1d0', intensity: 16, distance: 24, pos: [ANGEL[0], 3, ANGEL[1]] } });
    ctx.exclude({ kind: 'circle', x: ANGEL[0], z: ANGEL[1], r: 1.2 });
    ctx.addCollider({ x: ANGEL[0], z: ANGEL[1], hx: 0.4, hz: 0.4, rot: 0, top: 2 });
    person(ctx, { pos: PETER, face: [0.6, GATE_Z], colors: { robe: '#e6d8b8', mantle: '#4f6fa0', skin: '#a8724a', hair: '#cfc6b4', sash: '#8c5a3c' } });
    glow(ctx, { pos: [ANGEL[0], 1.4, ANGEL[1]], size: 12, color: '#fff3d0', opacity: 0.35, pulse: 0.05 });
    b.flush();
  },

  light: {
    rings: [{ at: ANGEL, lift: 0, radius: 2.4, width: 0.25, height: 2.2, color: '#fff1c0', intensity: 0.6, wallIntensity: 0.4 }],
  },

  player: {
    start: [3, 13],
    lookAt: [-1.5, -8],
    colors: { robe: '#4f7f80', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
