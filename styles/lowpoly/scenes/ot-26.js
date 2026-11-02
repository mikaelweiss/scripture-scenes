// Judges 16:25-30. The house of Dagon in Gaza, full of the lords of the Philistines, about three thousand
// on the roof. Blind Samson stands between the two middle pillars and bows himself with all his might.
// -z is north, toward the back of the house. The two pillars stand at the front of the roofed hall.
import * as THREE from 'three';
import { scatter, makePeople, addPeople, instanced, createFigure, rng } from './lib/ot-25-kit.js';

const SAMSON = [0, -4];
const PILLARS = [[-1.25, -4], [1.25, -4]];
const ROOF = { x: 0, z: -12, w: 38, d: 20, y: 7.2, t: 1.1 };
const START = [0, 8];

const stone = '#cbb898';
const darkStone = '#9c8668';

const philistines = {
  robes: ['#a83a2a', '#6a3a7a', '#d8a040', '#e8dcc0', '#3a5a8a', '#8a2a3a', '#c86a30', '#5a6a3a', '#d8c8a0', '#7a4a8a'],
  mantles: ['#5a2a4a', '#c8a050', '#2a3a6a', '#e8d8b0', '#8a3020', '#3a6a5a'],
  skins: ['#b07a55', '#a06a48', '#c08a62', '#94603e'],
  mantleChance: 0.7,
  hoodChance: 0.15,
};

const frontColumns = [-17, -12.5, -8, -4.5, 4.5, 8, 12.5, 17].map((x) => ({ type: 'column', x, z: -2.6, h: ROOF.y, radius: 0.5, color: stone, broken: false }));

export default {
  title: 'Judges 16:25-30: Samson pulls down the temple',
  seed: 26,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.55, 0.62, 0.45], color: '#ffd8a0', intensity: 2.8 },
  light: { sky: '#9ab4e0', ground: '#7a6040', hemi: 1.1 },
  sky: { top: '#3d6aa8', horizon: '#e8d2a8', ground: '#c8a878', sunColor: '#fff0c8', glow: 0.8 },
  fog: { color: '#dcc8a4', near: 80, far: 520 },
  clouds: { count: 24, shadow: '#b8c0d0', lit: '#ffffff', rim: '#ffffff', distance: [450, 950], altitude: [180, 300], hole: 0.2 },
  mountains: { count: 30, color: '#8a8070', radius: [520, 760], height: [20, 60], haze: 0.6 },
  bloom: { strength: 0.4, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#3a2a4a', highlightTint: '#ffe8c0' },
  shadow: { center: [0, 0], radius: 50 },

  player: { start: START, yaw: 0, pitch: 0.2, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 900,
    segments: 150,
    seed: 26,
    hills: 14,
    bumps: 0.25,
    flats: [{ x: 0, z: 0, r: 60, falloff: 40, height: 0 }],
    colors: { ground: '#c8b088', groundAlt: '#b89e78', grass: '#8a8a50', high: '#b8a07a', rock: '#9a8466' },
    patches: [],
  },

  objects: [
    { type: 'pavement', x: 0, z: 10, w: 44, d: 36, tile: 2.2, color: '#d6c4a0', damage: 0.05 },
    { type: 'pavement', x: 0, z: -12, w: 38, d: 20, tile: 1.6, color: '#bfa882', damage: 0.02 },
    ...frontColumns,
    { type: 'wall', x: -22, z: 10, len: 36, h: 3.2, thick: 0.9, damage: 0, color: stone },
    { type: 'wall', x: 22, z: 10, len: 36, h: 3.2, thick: 0.9, damage: 0, color: stone },
    { type: 'wall', x: -13, z: 28, rot: Math.PI / 2, len: 18, h: 3.2, thick: 0.9, damage: 0, color: stone },
    { type: 'wall', x: 13, z: 28, rot: Math.PI / 2, len: 18, h: 3.2, thick: 0.9, damage: 0, color: stone },
  ],

  scatter: [
    { type: 'tree', count: 40, center: [0, 0], ring: [50, 220], spacing: 10, seed: 8, props: { kind: 'palm', leaf: '#6a8a3a' } },
    { type: 'rock', count: 20, center: [0, 0], ring: [70, 260], spacing: 12, seed: 10, props: { color: '#a89070' } },
  ],

  custom(ctx) {
    const r = rng(26);
    const y0 = ctx.heightAt(0, -12) - 0.1;
    const box = (w, h, d, x, y, z, color = stone, rot = [0, 0, 0], collide = true) => {
      ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: rot, color, jitter: 0.04 });
      if (collide) ctx.colliders.add({ x, z, w, d, bottom: y, top: y + h });
    };

    // The house: back and side walls, a roof that two middle pillars and a front colonnade carry.
    box(ROOF.w, ROOF.y, 1, 0, y0, ROOF.z - ROOF.d / 2 + 0.5);
    box(1, ROOF.y, ROOF.d, -ROOF.w / 2 + 0.5, y0, ROOF.z);
    box(1, ROOF.y, ROOF.d, ROOF.w / 2 - 0.5, y0, ROOF.z);
    const top = y0 + ROOF.y;
    // The roof sags and cracks over the middle where the pillars are giving way.
    box(ROOF.w / 2 - 0.3, ROOF.t, ROOF.d, -ROOF.w / 4 - 0.15, top, ROOF.z, darkStone, [0, 0, 0.025]);
    box(ROOF.w / 2 - 0.3, ROOF.t, ROOF.d, ROOF.w / 4 + 0.15, top, ROOF.z, darkStone, [0, 0, -0.025]);
    ctx.solid.box(ROOF.w + 0.6, 0.35, 0.8, { position: [0, top - 0.1, -2.4], color: '#a8906a' });
    for (const side of [-1, 1]) {
      box(0.4, 1, ROOF.d, side * (ROOF.w / 2 - 0.2), top + ROOF.t, ROOF.z, stone);
    }
    box(ROOF.w, 1, 0.4, 0, top + ROOF.t, ROOF.z - ROOF.d / 2 + 0.2, stone);
    for (let i = 0; i < 9; i++) {
      const x = -ROOF.w / 2 + 2 + i * ((ROOF.w - 4) / 8);
      ctx.solid.box(1.2, 0.6, 0.5, { position: [x, top + ROOF.t + 0.3, -2.3], color: stone });
    }

    // The two middle pillars, leaning apart and cracking.
    PILLARS.forEach(([x, z], i) => {
      const lean = (i ? 1 : -1) * -0.07;
      const h = ROOF.y + 0.1;
      ctx.solid.add(new THREE.CylinderGeometry(0.45, 0.52, h, 8), { position: [x + Math.sin(-lean) * h * 0.5, y0 + h / 2, z], rotation: [0, 0, lean], color: '#d4c09c', jitter: 0.06 });
      ctx.solid.box(1.4, 0.5, 1.4, { position: [x, y0 + 0.25, z], color: darkStone });
      ctx.solid.box(1.3, 0.45, 1.3, { position: [x + Math.sin(-lean) * h, y0 + h - 0.2, z], rotation: [0, 0, lean], color: darkStone });
      ctx.colliders.add({ x, z, w: 1.2, d: 1.2, bottom: y0, top: top });
      for (let k = 0; k < 5; k++) {
        ctx.solid.box(0.06, r.range(0.6, 1.4), 0.08, {
          position: [x + Math.sin(-lean) * (1.5 + k * 1.1) + (i ? -0.45 : 0.45) * 0.98, y0 + 1.5 + k * 1.1, z + r.range(-0.3, 0.3)],
          rotation: [0, 0, r.range(-0.6, 0.6)],
          color: '#3a2e24',
          jitter: 0,
        });
      }
    });

    // Fallen blocks and chips already at the pillar feet.
    for (let i = 0; i < 18; i++) {
      const x = r.range(-4, 4), z = SAMSON[1] + r.range(-2, 2.5);
      ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.1, 0.3), 0), { position: [x, y0 + 0.15, z], rotation: [r(), r(), r()], color: stone });
    }

    // Dagon: a gilded fish-tailed idol on a high pedestal at the back of the house.
    box(5, 3.6, 3, 0, y0, ROOF.z - ROOF.d / 2 + 2.6, darkStone);
    const dagon = createFigure({ x: 0, y: y0 + 3.6, z: ROOF.z - ROOF.d / 2 + 2.4, face: [0, 20], scale: 1.9, robe: '#9a7434', mantle: '#6a4a20', skin: '#a8803a', arms: 'out' });
    ctx.scene.add(dagon);
    for (const side of [-1, 1]) {
      ctx.solid.add(new THREE.ConeGeometry(0.9, 1.6, 4), { position: [side * 0.9, y0 + 4.2, ROOF.z - ROOF.d / 2 + 2.0], rotation: [0.3, 0, side * 2.2], color: '#a8843a' });
    }
    for (const side of [-1, 1]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.25, 0.3, 1.4, 6), { position: [side * 3.2, y0 + 0.7, ROOF.z - 2], color: '#5a4a3a' });
      ctx.glow.add(new THREE.ConeGeometry(0.3, 0.8, 5), { position: [side * 3.2, y0 + 1.8, ROOF.z - 2], color: '#ffa040' });
      const l = new THREE.PointLight('#ffa050', 20, 16, 1.5);
      l.position.set(side * 3.2, y0 + 2.6, ROOF.z - 2);
      ctx.scene.add(l);
    }

    // Samson, long-haired, arms spread to the two pillars.
    const sy = y0 + 0.02;
    addPeople(ctx, [{ x: SAMSON[0], y: sy, z: SAMSON[1], yaw: 0, scale: 1.18, robe: new THREE.Color('#9a6a42'), mantle: new THREE.Color('#6a3a26'), hood: false, skin: new THREE.Color('#a8754f') }], { arms: { left: [1.25, 0.2], right: [1.25, 0.2] } });
    ctx.colliders.add({ x: SAMSON[0], z: SAMSON[1], w: 0.8, d: 0.8, bottom: sy, top: sy + 2 });
    const fill = new THREE.PointLight('#ffe0b0', 12, 14, 1.4);
    fill.position.set(SAMSON[0], sy + 3, SAMSON[1] + 4);
    ctx.scene.add(fill);
    const hall = new THREE.PointLight('#ffc890', 35, 30, 1.2);
    hall.position.set(0, y0 + 5, ROOF.z);
    ctx.scene.add(hall);
    for (let k = 0; k < 7; k++) {
      const a = (k / 6 - 0.5) * 2.2;
      ctx.solid.box(0.07, r.range(0.55, 0.8), 0.05, {
        position: [SAMSON[0] + Math.sin(a) * 0.15, sy + 1.3 * 1.18, SAMSON[1] - Math.cos(a) * 0.15 + 0.02],
        rotation: [-0.15, a, 0],
        color: '#2a1e16',
      });
    }
    ctx.solid.add(new THREE.IcosahedronGeometry(0.17, 0), { position: [SAMSON[0], sy + 1.86, SAMSON[1] - 0.03], scale: [1, 0.7, 1.05], color: '#2a1e16' });

    // Philistines: the courtyard throng, the lords inside, and the crowd on the roof.
    addPeople(ctx, makePeople(scatter({ count: 520, center: SAMSON, ring: [7, 32], arc: [0.15, Math.PI - 0.15], spacing: 0.95, seed: 61, avoid: [{ rect: [0, 13, 6, 32] }, { rect: [0, 30, 10, 6] }, { rect: [-40, 10, 37, 80] }, { rect: [40, 10, 37, 80] }, { rect: [0, 38, 80, 18] }] }), { palette: philistines, face: SAMSON, children: 0.1, seed: 62 }));
    addPeople(ctx, makePeople(scatter({ count: 46, center: [0, -12], ring: [5, 16], spacing: 1.3, seed: 63, avoid: [{ rect: [0, -7.5, 7, 17] }, { rect: [0, -20, 8, 6] }, { rect: [-19, -12, 2.5, 22] }, { rect: [19, -12, 2.5, 22] }] }), { palette: philistines, face: SAMSON, seed: 64, scale: [1.0, 1.12] }));
    const roofPts = [];
    for (let i = 0; i < 400 && roofPts.length < 330; i++) {
      const x = r.range(-ROOF.w / 2 + 1.2, ROOF.w / 2 - 1.2), z = r.range(ROOF.z - ROOF.d / 2 + 1, -3.3);
      if (Math.abs(x) < 1.0 || roofPts.some(([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 < 0.9)) continue;
      roofPts.push([x, z]);
    }
    addPeople(ctx, makePeople(roofPts, { palette: philistines, face: (x, z) => Math.atan2(-x * 0.3, 20 - z), seed: 65 }), { onStructures: true, arms: { left: [-0.4, 2.6], right: [-0.4, 2.8] } });

    // Dust and stones begin to fall from the cracking roof over the pillars.
        ctx.effects.motes({ position: [-1.3, y0, -4], radius: 1.2, height: 7, count: 90, color: '#5a4a38', size: 0.08, seed: 4 });
    ctx.effects.motes({ position: [1.3, y0, -4], radius: 1.2, height: 7, count: 90, color: '#5a4a38', size: 0.08, seed: 5 });
    const falling = Array.from({ length: 9 }, (_, i) => ({ x: r.range(-3.5, 3.5), z: r.range(-6, -2.8), off: r(), size: r.range(0.1, 0.24), spin: r.range(1, 4) }));
    const rocks = instanced(ctx, new THREE.DodecahedronGeometry(1, 0), falling.map((f) => ({ position: [f.x, top, f.z], scale: f.size, color: stone })));
    rocks.frustumCulled = false;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
    ctx.onFrame((t) => {
      falling.forEach((f, i) => {
        const k = (t * 0.45 + f.off) % 1;
        p.set(f.x, top - 0.3 - k * k * (ROOF.y - 0.2), f.z);
        q.setFromEuler(e.set(t * f.spin, t * f.spin * 0.7, 0));
        rocks.setMatrixAt(i, m.compose(p, q, s.setScalar(f.size)));
      });
      rocks.instanceMatrix.needsUpdate = true;
    });
  },
};
