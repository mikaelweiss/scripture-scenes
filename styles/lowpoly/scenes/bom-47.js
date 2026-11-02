// Mormon 8:1-5, Moroni 10: years after Cumorah, Moroni wanders alone. At dusk on a wooded hillside
// he kneels at a stone box set into the slope and lays the gold plates inside. -z runs up the hill.
import { fire, person } from './lib/bom-43-kit.js';

const BOX = [0, -6];
const MORONI = [0, -3.9];
const CAMP = [4.2, -2.6];

export default {
  title: 'Mormon 8:1-5, Moroni 10: Moroni alone',
  seed: 47,
  fov: 58,
  exposure: 1.35,

  sun: { direction: [-0.9, 0.2, 0.35], color: '#ff9468', intensity: 2.2 },
  light: { sky: '#8a9ad0', ground: '#5a4a40', hemi: 2.0 },
  sky: { top: '#141c3a', horizon: '#c87a62', ground: '#4a3a3a', sunColor: '#ffae80', glow: 1.0 },
  fog: { color: '#6a6482', near: 40, far: 280 },
  clouds: { count: 40, shadow: '#262840', lit: '#b8706a', rim: '#f0a080', distance: [260, 900], altitude: [90, 220], hole: 0.4 },
  mountains: { count: 40, color: '#2a2e40', radius: [480, 720], height: [30, 90], haze: 0.45 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.78 },
  grade: { saturation: 0.95, contrast: 1.08, vignette: 0.6, shadowTint: '#1a1a40', highlightTint: '#ffd0a0' },
  shadow: { center: [0, -4], radius: 40 },

  player: { start: [-2.5, -8.8], yaw: -2.6, pitch: -0.27, eye: 1.65, speed: 4 },

  terrain: {
    size: 560, segments: 280, seed: 47, hills: 18, bumps: 0.3,
    flats: [
      { x: 2, z: 0, r: 9, falloff: 14, height: 0.4 },
      { x: 0, z: -80, r: 12, falloff: 62, height: 26 },
    ],
    colors: { ground: '#76704e', groundAlt: '#6a6a46', grass: '#5e6e40', high: '#6a7050', rock: '#6e6458' },
    patches: [{ x: 2, z: -2, r: 7, color: '#6a5a44', strength: 0.6, rough: 0.5 }],
  },

  objects: [
    { type: 'rock', x: -4.5, z: -9, size: 1.6, color: '#6a6458' },
    { type: 'rock', x: 4.2, z: -10, size: 1.2, color: '#6a6458' },
    { type: 'rock', x: -10, z: 3, size: 2.2, color: '#6a6458' },
  ],

  scatter: [
    { type: 'tree', count: 110, center: [0, -10], ring: [14, 140], spacing: 4.5, seed: 8, props: { kind: 'broad', leaf: '#34482a' } },
    { type: 'tree', count: 40, center: [0, -10], ring: [12, 60], arc: [Math.PI * 1.1, Math.PI * 1.9], spacing: 4, seed: 18, props: { kind: 'broad', leaf: '#3a4e2c' } },
    { type: 'rock', count: 40, center: [0, -10], ring: [10, 120], spacing: 6, seed: 10, props: { size: 1, color: '#5e584e' } },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;
    const stone = '#8a8478';

    // The stone box: a floor slab, four sides and the lid leaning against the hill.
    const by = ctx.heightAt(BOX[0], BOX[1]) - 0.15;
    const [bx, bz] = BOX;
    ctx.solid.box(1.5, 0.15, 1.1, { position: [bx, by + 0.07, bz], color: stone });
    ctx.solid.box(1.5, 0.6, 0.14, { position: [bx, by + 0.45, bz - 0.5], color: stone });
    ctx.solid.box(1.5, 0.45, 0.14, { position: [bx, by + 0.37, bz + 0.5], color: stone });
    ctx.solid.box(0.14, 0.55, 1.1, { position: [bx - 0.7, by + 0.42, bz], color: stone });
    ctx.solid.box(0.14, 0.55, 1.1, { position: [bx + 0.7, by + 0.42, bz], color: stone });
    ctx.solid.box(1.7, 0.16, 1.2, { position: [bx + 0.1, by + 0.6, bz - 0.95], rotation: [1.15, 0.05, 0], color: '#7e786c' });
    ctx.colliders.add({ x: bx, z: bz, w: 1.6, d: 1.2, bottom: by, top: by + 0.8 });
    // Small stones that propped it, and earth dug from the slope.
    for (let i = 0; i < 10; i++) ctx.solid.add(new THREE.DodecahedronGeometry(r.range(0.1, 0.22), 0), { position: [bx + r.range(-1.2, 1.2), by + 0.1, bz + r.range(-1, 1)], color: '#6e685c' });
    ctx.solid.add(new THREE.DodecahedronGeometry(0.9, 0), { position: [bx - 1.6, by - 0.2, bz - 0.6], scale: [1.2, 0.45, 1], color: '#5a4a38' });

    // The gold plates, bound by three rings, glinting in the box.
    const gold = new THREE.MeshLambertMaterial({ color: '#d8a83a', emissive: '#8a5a14', flatShading: true });
    const plates = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.25), gold);
    plates.position.set(bx - 0.2, by + 0.5, bz);
    ctx.scene.add(plates);
    for (const dz of [-0.08, 0, 0.08]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 4, 8), gold);
      ring.position.set(bx - 0.31, by + 0.5, bz + dz);
      ring.rotation.y = Math.PI / 2;
      ctx.scene.add(ring);
    }
    // The breastplate and the interpreters beside them.
    const bp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.06, 7), new THREE.MeshLambertMaterial({ color: '#a89070', emissive: '#2a2010', flatShading: true }));
    bp.position.set(bx + 0.4, by + 0.2, bz + 0.1);
    ctx.scene.add(bp);
    for (const dx of [-0.07, 0.07]) {
      const lens = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#cfe8ff', toneMapped: false }));
      lens.position.set(bx + 0.3 + dx, by + 0.26, bz - 0.2);
      ctx.scene.add(lens);
    }
    for (const dx of [-0.42, 0.02]) ctx.solid.box(0.12, 0.3, 0.7, { position: [bx + dx, by + 0.28, bz], color: '#7a7468' });
    const glint = new THREE.PointLight('#ffcf80', 5, 4, 1.5);
    glint.position.set(bx - 0.2, by + 0.9, bz + 0.4);
    ctx.scene.add(glint);

    // Moroni, kneeling and hooded, laying the record in.
    person(ctx, { x: MORONI[0], z: MORONI[1], face: BOX, robe: '#6a5a48', mantle: '#3e342a', skin: '#a87652', hood: true, arms: 'out', kneel: true });
    const sy = ctx.heightAt(MORONI[0] + 0.9, MORONI[1] + 0.4);
    ctx.solid.add(new THREE.CylinderGeometry(0.035, 0.04, 1.9, 5), { position: [MORONI[0] + 1.2, sy + 0.9, MORONI[1] + 0.6], rotation: [0.12, 0, -0.14], color: '#5a4430' });

    // His small camp: a fire, a bedroll, a pack.
    fire(ctx, { x: CAMP[0], z: CAMP[1], radius: 0.35, count: 9, height: 0.9, seed: 7 });
    const cy = ctx.heightAt(CAMP[0], CAMP[1]);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ctx.solid.add(new THREE.DodecahedronGeometry(0.16, 0), { position: [CAMP[0] + Math.cos(a) * 0.6, cy + 0.05, CAMP[1] + Math.sin(a) * 0.6], color: '#4a4440' });
    }
    for (let i = 0; i < 3; i++) ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 5), { position: [CAMP[0], cy + 0.08, CAMP[1]], rotation: [Math.PI / 2, i * 1.05, 0], color: '#2a1e16' });
    ctx.glow.add(new THREE.OctahedronGeometry(0.22, 0), { position: [CAMP[0], cy + 0.08, CAMP[1]], scale: [1.4, 0.4, 1.4], color: '#ff6a1a' });
    const fireLight = new THREE.PointLight('#ff9a4a', 14, 16, 1.6);
    fireLight.position.set(CAMP[0], cy + 0.9, CAMP[1]);
    ctx.scene.add(fireLight);
    ctx.onFrame((t) => (fireLight.intensity = 12 + Math.sin(t * 11) * 1.5 + Math.sin(t * 7.3) * 1.5));
    ctx.effects.smoke({ position: [CAMP[0], cy + 1, CAMP[1]], count: 6, height: 8, size: 0.25, color: '#6a6470', wind: [0.4, -0.2], seed: 4 });
    const ry = ctx.heightAt(CAMP[0] + 1.6, CAMP[1] - 1.1);
    ctx.solid.add(new THREE.CylinderGeometry(0.22, 0.22, 1.8, 7), { position: [CAMP[0] + 1.6, ry + 0.2, CAMP[1] - 1.1], rotation: [0, 0.4, Math.PI / 2], color: '#6a3a2a' });
    ctx.solid.add(new THREE.DodecahedronGeometry(0.32, 0), { position: [CAMP[0] - 1.1, cy + 0.25, CAMP[1] - 1], scale: [1, 0.8, 0.8], color: '#5a4430' });

    // First stars.
    const starGeo = new THREE.OctahedronGeometry(1.6, 0);
    const stars = new THREE.InstancedMesh(starGeo, new THREE.MeshBasicMaterial({ color: '#fff8e8', fog: false, toneMapped: false }), 260);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 260; i++) {
      const a = r() * Math.PI * 2, el = r.range(0.25, 1.4);
      const d = 1300;
      m.makeTranslation(Math.cos(a) * Math.cos(el) * d, Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d);
      m.scale(new THREE.Vector3().setScalar(r.range(0.4, 1.2)));
      stars.setMatrixAt(i, m);
    }
    stars.frustumCulled = false;
    ctx.scene.add(stars);
  },
};
