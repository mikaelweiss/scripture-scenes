// Acts 17:22-31. Afternoon on the Areopagus, the bare rock below the Acropolis. Paul stands among the
// philosophers of Athens beside an altar inscribed TO THE UNKNOWN GOD. -z is north toward the Parthenon.
import { figure, town } from './lib/nt-32-kit.js';

const PAUL = [0.5, -5];
const ALTAR = [-1.2, -1.6];
const ACROPOLIS = [36, -105];
const marble = '#e8dfcc';

// Doric temple on a stepped base, long axis along local z.
function temple(ctx, { x, z, y, rot = 0, w = 30, d = 70, colH = 10.5, cols = [8, 17] }) {
  const { THREE } = ctx;
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (let i = 0; i < 3; i++) {
    ctx.solid.box(w + 3 - i * 1.2, 0.55, d + 3 - i * 1.2, { position: [x, y + 0.27 + i * 0.55, z], rotation: [0, rot, 0], color: marble, jitter: 0.03 });
  }
  const base = y + 1.65;
  ctx.colliders.add({ x, z, w: w + 3, d: d + 3, rot, bottom: y - 2, top: base });
  const [nx, nz] = cols;
  const r = Math.min(w / nx, d / nz) * 0.3;
  const place = (lx, lz) => {
    const [px, pz] = at(lx, lz);
    ctx.solid.add(new THREE.CylinderGeometry(r * 0.85, r, colH, 10), { position: [px, base + colH / 2, pz], color: marble, jitter: 0.03 });
    ctx.solid.box(r * 2.4, 0.4, r * 2.4, { position: [px, base + colH + 0.2, pz], rotation: [0, rot, 0], color: '#ddd2bc' });
  };
  for (let i = 0; i < nx; i++) for (const lz of [-d / 2 + r * 2, d / 2 - r * 2]) place(-w / 2 + r * 2 + (i * (w - r * 4)) / (nx - 1), lz);
  for (let j = 1; j < nz - 1; j++) for (const lx of [-w / 2 + r * 2, w / 2 - r * 2]) place(lx, -d / 2 + r * 2 + (j * (d - r * 4)) / (nz - 1));
  ctx.solid.box(w * 0.62, colH, d * 0.7, { position: [x, base + colH / 2, z], rotation: [0, rot, 0], color: '#d6cbb2' });
  const top = base + colH + 0.4;
  ctx.solid.box(w, 1.3, d, { position: [x, top + 0.65, z], rotation: [0, rot, 0], color: '#e2d8c2' });
  ctx.solid.box(w + 0.2, 0.9, d + 0.2, { position: [x, top + 1.75, z], rotation: [0, rot, 0], color: '#c8a46a' });
  ctx.solid.box(w + 0.6, 0.35, d + 0.6, { position: [x, top + 2.35, z], rotation: [0, rot, 0], color: marble });
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.3, 0), new THREE.Vector2(w / 2 + 0.3, 0), new THREE.Vector2(0, w * 0.14)]);
  const roof = new THREE.ExtrudeGeometry(shape, { depth: d + 0.6, bevelEnabled: false }).translate(0, 0, -(d + 0.6) / 2);
  ctx.solid.add(roof, { position: [x, top + 2.5, z], rotation: [0, rot, 0], color: '#b0644a', jitter: 0.04 });
  for (const end of [-1, 1]) {
    const tri = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
    const [px, pz] = at(0, end * (d / 2 + 0.31));
    ctx.solid.add(tri, { position: [px, top + 2.5, pz], rotation: [0, rot, 0], color: marble, jitter: 0.02 });
  }
}

function inscription(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#cfc4ac';
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#4a3e30';
  g.font = 'bold 64px Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, 68);
  return c;
}

export default {
  title: 'Acts 17:22-31: Paul on Mars Hill',
  seed: 36,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [-0.6, 0.55, 0.45], color: '#ffe2b0', intensity: 2.8 },
  light: { sky: '#a8c0f0', ground: '#7a6a58', hemi: 1.1 },
  sky: { top: '#4a74b8', horizon: '#ecdcc0', ground: '#c8b89a', sunColor: '#ffe8c0', glow: 1.0 },
  fog: { color: '#dcd2c0', near: 140, far: 800 },
  clouds: { count: 30, shadow: '#a8a8b8', lit: '#fff4e0', rim: '#ffffff', distance: [380, 900], altitude: [120, 240], hole: 0.2 },
  mountains: { count: 40, color: '#7a7466', radius: [480, 720], height: [60, 160], haze: 0.55 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.32, shadowTint: '#2e3a5e', highlightTint: '#fff0d0' },
  shadow: { center: [0, -2], radius: 32 },

  player: { start: [2.3, 2.6], yaw: 0.22, pitch: 0.08, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 220,
    seed: 36,
    hills: 26,
    bumps: 0.5,
    flats: [
      { x: 0, z: 0, r: 20, falloff: 26, height: 5 },
      { x: ACROPOLIS[0], z: ACROPOLIS[1], r: 52, falloff: 26, height: 30 },
      { x: -120, z: 160, r: 60, falloff: 40, height: -4 },
    ],
    colors: { ground: '#a8987c', groundAlt: '#958670', grass: '#8a8a52', high: '#b0a58e', rock: '#8e8676' },
    patches: [
      { x: 0, z: 0, r: 22, color: '#b4ab98', strength: 0.7, rough: 0.5 },
      { x: ACROPOLIS[0], z: ACROPOLIS[1], r: 55, color: '#bcb29c', strength: 0.6, rough: 0.3 },
    ],
  },

  objects: [],

  scatter: [
    { type: 'rock', count: 26, center: [0, 0], ring: [14, 34], spacing: 4, seed: 361, props: { size: 1.6, color: '#9a917e' } },
    { type: 'rubble', count: 20, center: [0, 0], ring: [3, 18], seed: 362, avoid: [{ rect: [PAUL[0], PAUL[1], 3, 3] }], props: { radius: 1.5, count: 4, size: [0.1, 0.3], color: '#9a917e' } },
    { type: 'tree', count: 40, center: [0, 0], ring: [40, 260], spacing: 12, seed: 363, avoid: [{ r: 70, x: ACROPOLIS[0], z: ACROPOLIS[1] }], props: { kind: 'broad', h: 6, leaf: '#6a7848' } },
  ],

  crowd: {
    palette: {
      robes: ['#e6dcc8', '#d8ccb0', '#c8b48e', '#efe8d8', '#a0825c', '#7a8aa0', '#b8a07a', '#8a5a44'],
      mantles: ['#f0e8d8', '#b04a36', '#4a5a7a', '#c8a46a', '#6a6a5a', '#8a3a2e'],
      skins: ['#b07a55', '#a87652', '#c08a62', '#9b6a46'],
      mantleChance: 0.8,
      hoodChance: 0.05,
    },
    groups: [
      { count: 64, center: PAUL, ring: [4, 13], arc: [0.2, Math.PI - 0.2], spacing: 1.0, face: PAUL, children: 0.03, seed: 364, avoid: [{ rect: [ALTAR[0], ALTAR[1], 2.4, 2.4] }, { rect: [1.8, 5, 3.2, 18] }] },
      { count: 12, center: PAUL, ring: [3.5, 7], arc: [-0.6, 0.1], spacing: 1.2, face: PAUL, children: 0, seed: 365 },
    ],
  },

  figures: [],

  custom(ctx) {
    const { THREE } = ctx;
    const py = ctx.heightAt(...PAUL);
    ctx.solid.add(new THREE.DodecahedronGeometry(1.4, 0), { position: [PAUL[0], py - 0.2, PAUL[1]], scale: [1.3, 0.55, 1.1], color: '#a29a88', jitter: 0.06 });
    ctx.colliders.add({ x: PAUL[0], z: PAUL[1], w: 2.6, d: 2.2, bottom: py - 1, top: py + 0.5 });
    figure(ctx, { x: PAUL[0], z: PAUL[1], y: py + 0.5, face: [PAUL[0] + 1, 14], scale: 1.08, robe: '#8a5a3a', mantle: '#4a6a9a', arms: 'out' });

    const ay = ctx.heightAt(...ALTAR);
    const rot = 0.15;
    ctx.solid.box(1.5, 0.25, 1.1, { position: [ALTAR[0], ay + 0.1, ALTAR[1]], rotation: [0, rot, 0], color: '#cfc4ac' });
    ctx.solid.box(1.2, 1.0, 0.85, { position: [ALTAR[0], ay + 0.7, ALTAR[1]], rotation: [0, rot, 0], color: '#d8ceb8' });
    ctx.solid.box(1.45, 0.2, 1.05, { position: [ALTAR[0], ay + 1.3, ALTAR[1]], rotation: [0, rot, 0], color: '#cfc4ac' });
    ctx.glow.add(new THREE.ConeGeometry(0.16, 0.4, 5), { position: [ALTAR[0], ay + 1.6, ALTAR[1]], color: '#ffb050' });
    ctx.colliders.add({ x: ALTAR[0], z: ALTAR[1], w: 1.5, d: 1.1, rot, bottom: ay, top: ay + 1.4 });
    const tex = new THREE.CanvasTexture(inscription('ΑΓΝΩΣΤΩ ΘΕΩ'));
    tex.colorSpace = THREE.SRGBColorSpace;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.28), new THREE.MeshLambertMaterial({ map: tex }));
    plate.position.set(ALTAR[0] + Math.sin(rot) * 0.43, ay + 0.95, ALTAR[1] + Math.cos(rot) * 0.43);
    plate.rotation.y = rot;
    ctx.scene.add(plate);

    const top = ctx.heightAt(...ACROPOLIS);
    temple(ctx, { x: ACROPOLIS[0] + 4, z: ACROPOLIS[1] - 4, y: top - 0.3, rot: 0.15 + Math.PI / 2 });
    temple(ctx, { x: ACROPOLIS[0] - 26, z: ACROPOLIS[1] + 22, y: top - 0.3, rot: 0.15, w: 14, d: 24, colH: 7, cols: [6, 8] });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const wx = ACROPOLIS[0] + Math.cos(a) * 50, wz = ACROPOLIS[1] + Math.sin(a) * 42;
      ctx.solid.box(20, 6, 2.5, { position: [wx, ctx.heightAt(wx, wz) + 2, wz], rotation: [0, -a + Math.PI / 2, 0], color: '#b8ae96' });
    }
    temple(ctx, { x: -80, z: -10, y: ctx.heightAt(-80, -10) - 0.3, rot: 1.6, w: 14, d: 30, colH: 6.5, cols: [6, 13] });
    town(ctx, { center: [-40, 90], radius: 80, count: 70, seed: 366, avoid: [{ x: 0, z: 0, r: 40 }], colors: ['#e0d4bc', '#d6c8aa', '#c8b898', '#e8dcc4'], size: [5, 9], height: [3, 6] });
    town(ctx, { center: [90, 30], radius: 60, count: 40, seed: 367, avoid: [{ x: 0, z: 0, r: 40 }], colors: ['#e0d4bc', '#d6c8aa', '#c8b898'], size: [5, 9], height: [3, 6] });
  },
};
