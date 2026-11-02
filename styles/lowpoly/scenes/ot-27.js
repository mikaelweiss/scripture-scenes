// Ruth 2:2-17. Barley harvest in Boaz's field below Bethlehem. Reapers cut in a line, maidens bind sheaves,
// and Ruth gleans behind them while Boaz speaks with his overseer at the shelter. -z is north toward the town.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scatter, rows, makePeople, addPeople, handAt, local, instanced, createFigure, rng } from './lib/ot-25-kit.js';

const RUTH = [4, 6];
const BOAZ = [-1.5, 4.5];
const SHELTER = [-15, 15];
const TOWN = [55, -150];
const FIELD = { x0: -34, x1: 34, z0: -30, z1: 22 };
const CUT = -1.5;

const workers = {
  robes: ['#c8b48a', '#a88a5a', '#d8c8a0', '#8a6a48', '#b89a6a', '#e0d4b4', '#9a7a52'],
  mantles: ['#7a5a3a', '#a8885a', '#5a4a3a', '#c8b088'],
  skins: ['#a87652', '#9b6a46', '#b5835e', '#8a5a3c'],
  mantleChance: 0.3,
  hoodChance: 0.5,
};
const maidens = { ...workers, robes: ['#b86a4a', '#c8a070', '#8a5a6a', '#d8c8a8', '#a87a4a'], mantles: ['#e8dcc0', '#c89a6a', '#7a4a5a'], mantleChance: 0.8, hoodChance: 0.9 };

const REAP = [0.25, 0.9];

function stalkClump(height, headColor, stemColor, heads = true) {
  const parts = [];
  const r = rng(Math.round(height * 100));
  for (let i = 0; i < 5; i++) {
    const x = r.range(-0.14, 0.14), z = r.range(-0.14, 0.14), h = height * r.range(0.85, 1.1), lean = r.range(-0.15, 0.15);
    const stem = new THREE.ConeGeometry(0.018, h, 3).translate(0, h / 2, 0).rotateZ(lean).translate(x, 0, z).toNonIndexed();
    const head = new THREE.ConeGeometry(0.04, h * 0.18, 4).rotateX(Math.PI).translate(0, h * 0.95, 0).rotateZ(lean).translate(x, 0, z).toNonIndexed();
    const paint = (g, c) => {
      const col = new THREE.Color(c), arr = new Float32Array(g.attributes.position.count * 3);
      for (let k = 0; k < arr.length; k += 3) arr.set([col.r, col.g, col.b], k);
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      g.deleteAttribute('uv');
      return g;
    };
    parts.push(paint(stem, stemColor));
    if (heads) parts.push(paint(head, headColor));
  }
  const g = mergeGeometries(parts);
  g.computeVertexNormals();
  return g;
}

function field(ctx, geometry, pts, color) {
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshLambertMaterial({ vertexColors: true }), pts.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const r = rng(pts.length);
  const c = new THREE.Color(color);
  pts.forEach(([x, z], i) => {
    p.set(x, ctx.heightAt(x, z) - 0.05, z);
    q.setFromEuler(e.set(r.range(-0.08, 0.08), r() * 6.28, r.range(-0.08, 0.08)));
    const k = r.range(0.85, 1.15);
    mesh.setMatrixAt(i, m.compose(p, q, s.set(k, k, k)));
    mesh.setColorAt(i, c.clone().offsetHSL(r.range(-0.015, 0.015), 0, r.range(-0.06, 0.06)));
  });
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  ctx.scene.add(mesh);
  return mesh;
}

export default {
  title: "Ruth 2:2-17: Ruth gleans in Boaz's field",
  seed: 27,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.7, 0.45, 0.35], color: '#ffd9a0', intensity: 3.0 },
  light: { sky: '#a8c0e8', ground: '#8a7048', hemi: 1.0 },
  sky: { top: '#4a78b8', horizon: '#f0dcb0', ground: '#d8c090', sunColor: '#fff0c8', glow: 0.9 },
  fog: { color: '#e4d4b0', near: 90, far: 620 },
  clouds: { count: 26, shadow: '#b8b8c8', lit: '#fff8ea', rim: '#ffffff', distance: [400, 950], altitude: [160, 280], hole: 0.3 },
  mountains: { count: 36, color: '#9a8a72', radius: [520, 760], height: [30, 80], haze: 0.6 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.38, shadowTint: '#3a3050', highlightTint: '#ffe6b8' },
  shadow: { center: [0, 5], radius: 45 },

  player: { start: [0.2, 11.5], yaw: -0.14, pitch: -0.05, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 170,
    seed: 27,
    hills: 34,
    bumps: 0.3,
    flats: [
      { x: 0, z: -4, r: 46, falloff: 40, height: 0 },
      { x: TOWN[0], z: TOWN[1], r: 32, falloff: 50, height: 22 },
    ],
    colors: { ground: '#b89a68', groundAlt: '#a88a5a', grass: '#8a8a4a', high: '#a89070', rock: '#9a8466' },
    patches: [
      { x: 0, z: -15, r: 42, color: '#c8a85a', strength: 0.7, rough: 0.2 },
      { x: 0, z: 14, r: 30, color: '#c8b07a', strength: 0.6, rough: 0.3 },
    ],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 60, center: [0, 0], ring: [48, 200], spacing: 9, seed: 8, avoid: [{ x: TOWN[0], z: TOWN[1], r: 45 }], props: { kind: 'broad', leaf: '#7a8a52', h: 4.5 } },
    { type: 'rock', count: 40, center: [0, 0], ring: [45, 260], spacing: 10, seed: 10, avoid: [{ x: TOWN[0], z: TOWN[1], r: 45 }], props: { color: '#b0a080' } },
  ],

  custom(ctx) {
    const r = rng(27);

    // Standing barley ahead of the reapers, stubble behind them.
    const standing = [], stubble = [];
    for (let x = FIELD.x0; x < FIELD.x1; x += 0.42) {
      for (let z = FIELD.z0; z < FIELD.z1; z += 0.42) {
        const px = x + r.range(-0.15, 0.15), pz = z + r.range(-0.15, 0.15);
        const edge = CUT + Math.sin(px * 0.2) * 0.6;
        if (pz < edge) standing.push([px, pz]);
        else if (r() < 0.22 && Math.hypot(px - SHELTER[0], pz - SHELTER[1]) > 3.5) stubble.push([px, pz]);
      }
    }
    field(ctx, stalkClump(1.0, '#e8c870', '#c8a858'), standing, '#ffffff');
    field(ctx, stalkClump(0.16, '#e8d098', '#e0c890', false), stubble, '#ffffff');

    // Field boundary stones and a path along the south edge.
    for (let x = FIELD.x0; x <= FIELD.x1; x += 2.4) {
      for (const z of [FIELD.z0 - 1, FIELD.z1 + 1]) ctx.solid.add(new THREE.DodecahedronGeometry(0.2, 0), { position: [x + r.range(-0.3, 0.3), ctx.heightAt(x, z) + 0.05, z], rotation: [r(), r(), r()], scale: [1.2, 0.6, 1], color: '#b0a088' });
    }

    // Sheaves stood up in shocks across the reaped ground.
    const sheafGeo = new THREE.CylinderGeometry(0.16, 0.24, 0.9, 6).translate(0, 0.45, 0);
    const sheaves = [];
    for (const [x, z] of scatter({ count: 34, center: [0, 11], ring: [3, 24], spacing: 3.5, seed: 71, avoid: [{ x: SHELTER[0], z: SHELTER[1], r: 4 }, { x: RUTH[0], z: RUTH[1], r: 2 }, { x: BOAZ[0], z: BOAZ[1], r: 3 }, { x: -3, z: 15, r: 5 }, { rect: [0, 30, 80, 12] }] })) {
      const y = ctx.heightAt(x, z);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + r.range(-0.2, 0.2);
        sheaves.push({ position: [x + Math.cos(a) * 0.22, y, z + Math.sin(a) * 0.22], rotation: [-Math.sin(a) * 0.22, 0, Math.cos(a) * 0.22], color: r.pick(['#e0c070', '#d8b460', '#e8cc80']) });
      }
      ctx.colliders.add({ x, z, w: 0.9, d: 0.9, bottom: y, top: y + 0.9 });
    }
    instanced(ctx, sheafGeo, sheaves);
    instanced(ctx, new THREE.CylinderGeometry(0.2, 0.2, 0.08, 6), sheaves.filter((_, i) => i % 4 === 0).map((sh) => ({ position: [sh.position[0], sh.position[1] + 0.5, sh.position[2]], color: '#8a6a3a' })));

    // Reapers in a line at the edge of the standing grain, sickles in hand.
    const reapPts = rows({ from: [-26, CUT + 1.0], to: [26, CUT + 1.0], rows: 1, spacing: 3.6, jitter: 0.5, seed: 72 });
    const reapers = addPeople(ctx, makePeople(reapPts, { palette: workers, yaw: Math.PI, yawJitter: 0.25, seed: 73 }), { arms: { left: [0.15, 0.9], right: REAP } });
    const sickleGeo = new THREE.TorusGeometry(0.18, 0.02, 3, 8, Math.PI * 1.2);
    instanced(ctx, sickleGeo, reapers.map((p) => ({ position: local(p, handAt(1, ...REAP)), rotation: [0.4, p.yaw, 0.5], scale: p.scale, color: '#9aa0a8' })));

    // Maidens binding sheaves just behind the reapers.
    const bindPts = scatter({ count: 10, center: [0, 3.5], ring: [0, 22], arc: [-0.6, 0.6], spacing: 4, seed: 74, avoid: [{ x: RUTH[0], z: RUTH[1], r: 3 }] }).concat(
      scatter({ count: 6, center: [0, 3.5], ring: [4, 20], arc: [Math.PI - 0.6, Math.PI + 0.6], spacing: 4, seed: 75 }),
    );
    const binders = addPeople(ctx, makePeople(bindPts, { palette: maidens, yaw: Math.PI, yawJitter: 0.6, seed: 76 }), { arms: { left: [0.1, 0.7], right: [0.1, 0.7] } });
    instanced(ctx, new THREE.CylinderGeometry(0.12, 0.16, 0.7, 5).rotateX(Math.PI / 2 - 0.3), binders.map((p) => ({ position: local(p, [0, 0.95, 0.42]), rotation: [0, p.yaw, 0], scale: p.scale, color: '#e0c070' })));

    // Ruth, stooping to glean, a handful of ears in her arm.
    const ry = ctx.heightAt(...RUTH);
    const ruth = createFigure({ x: RUTH[0], y: ry, z: RUTH[1], scale: 0.98, robe: '#3e5a8a', mantle: '#e8dcc4', skin: '#a8754f', hood: true, arms: 'down' });
    ruth.rotation.order = 'YXZ';
    ruth.rotation.set(0.3, Math.atan2(-1.5 - RUTH[0], 11 - RUTH[1]), 0);
    ruth.position.y -= 0.42;
    ctx.scene.add(ruth);
    ctx.colliders.add({ x: RUTH[0], z: RUTH[1], w: 0.6, d: 0.6, bottom: ry, top: ry + 1.6 });
    const bundle = new THREE.Mesh(stalkClump(0.6, '#f0d080', '#d8b868'), new THREE.MeshLambertMaterial({ vertexColors: true }));
    bundle.position.set(RUTH[0] + 0.35, ry + 0.55, RUTH[1] + 0.05);
    bundle.rotation.set(0.9, 0.6, 0.3);
    ctx.scene.add(bundle);
    ctx.scene.add(new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.25, 6), new THREE.MeshLambertMaterial({ color: '#8a6a40' })).translateX(RUTH[0] - 0.5).translateY(ry + 0.12).translateZ(RUTH[1] + 0.4));

    // Boaz at the shelter, speaking with the servant set over the reapers.
    const by = ctx.heightAt(...BOAZ);
    ctx.scene.add(createFigure({ x: BOAZ[0], y: by, z: BOAZ[1], face: RUTH, scale: 1.08, robe: '#e8dcc0', mantle: '#8a2e2a', skin: '#a8754f', arms: 'down' }));
    ctx.scene.add(createFigure({ x: BOAZ[0] + 1.3, y: ctx.heightAt(BOAZ[0] + 1.3, BOAZ[1] - 0.6), z: BOAZ[1] - 0.6, face: BOAZ, robe: '#a88a5a', mantle: '#5a4a3a', skin: '#9b6a46', hood: true }));
    for (const [x, z] of [BOAZ, [BOAZ[0] + 1.3, BOAZ[1] - 0.6]]) ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: by, top: by + 1.9 });

    // Shelter of poles and branches with water jars and bread for the reapers.
    const sy = ctx.heightAt(...SHELTER);
    for (const [dx, dz] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) {
      ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.09, 2.5, 5), { position: [SHELTER[0] + dx, sy + 1.25, SHELTER[1] + dz], color: '#6a4a30' });
      ctx.colliders.add({ x: SHELTER[0] + dx, z: SHELTER[1] + dz, w: 0.2, d: 0.2, bottom: sy, top: sy + 2.5 });
    }
    for (let i = 0; i < 14; i++) {
      ctx.solid.box(r.range(1.2, 2), 0.12, 0.6, { position: [SHELTER[0] + r.range(-1.6, 1.6), sy + 2.55 + r.range(0, 0.15), SHELTER[1] + r.range(-1.5, 1.5)], rotation: [0, r() * 3, r.range(-0.1, 0.1)], color: r.pick(['#6a7a3a', '#7a8a48', '#8a7a4a']) });
    }
    for (let i = 0; i < 5; i++) {
      const x = SHELTER[0] + r.range(-1.5, 1.5), z = SHELTER[1] + r.range(-1.2, 1.2);
      ctx.solid.add(new THREE.SphereGeometry(0.25, 6, 4), { position: [x, sy + 0.3, z], scale: [1, 1.3, 1], color: '#b8704a' });
      ctx.solid.add(new THREE.CylinderGeometry(0.08, 0.12, 0.18, 6), { position: [x, sy + 0.68, z], color: '#a8603a' });
    }
    ctx.solid.box(1.2, 0.05, 0.8, { position: [SHELTER[0] + 0.5, sy + 0.03, SHELTER[1] + 0.8], color: '#d8c8a0' });
    for (let i = 0; i < 4; i++) ctx.solid.add(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 7), { position: [SHELTER[0] + 0.2 + i * 0.22, sy + 0.08, SHELTER[1] + 0.8], color: '#c89a5a' });

    // Bethlehem on its hill: flat-roofed limestone houses inside a wall.
    const houses = scatter({ count: 46, center: TOWN, ring: [0, 28], spacing: 5.5, seed: 77 });
    for (const [x, z] of houses) {
      const w = r.range(3.5, 6), d = r.range(3.5, 6), h = r.range(2.6, 4.6), rot = r.range(-0.15, 0.15);
      const y = Math.min(ctx.heightAt(x - w / 2, z), ctx.heightAt(x + w / 2, z), ctx.heightAt(x, z - d / 2), ctx.heightAt(x, z + d / 2)) - 0.3;
      ctx.solid.box(w, h, d, { position: [x, y + h / 2, z], rotation: [0, rot, 0], color: r.pick(['#e0d0b0', '#d4c4a0', '#e8dcc0', '#c8b894']), jitter: 0.04 });
      ctx.solid.box(w + 0.2, 0.2, d + 0.2, { position: [x, y + h + 0.1, z], rotation: [0, rot, 0], color: '#b8a888' });
      ctx.solid.box(0.9, 1.6, 0.1, { position: [x + Math.sin(rot) * 0, y + 0.8, z + d / 2 + 0.01], rotation: [0, rot, 0], color: '#5a4430' });
    }
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2, x = TOWN[0] + Math.cos(a) * 33, z = TOWN[1] + Math.sin(a) * 33;
      const y = ctx.heightAt(x, z) - 0.4;
      ctx.solid.box(0.9, 3.6, 5.4, { position: [x, y + 1.8, z], rotation: [0, -a, 0], color: '#cbb894' });
      if (i % 5 === 0) ctx.solid.box(2, 5, 2, { position: [x, y + 2.5, z], rotation: [0, -a, 0], color: '#c0ac88' });
    }

    // A few olive trees at the field edge.
    for (const [x, z] of [[-38, 8], [-40, -12], [38, 14], [40, -6], [-22, 28], [24, 30]]) ctx.builders.tree(ctx, { x, z, kind: 'broad', leaf: '#7a8a5a', h: 4 });
  },
};
