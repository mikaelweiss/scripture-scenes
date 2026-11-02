// Genesis 3:23-24: Adam and Eve, in coats of skins, walk out east of the garden at evening.
// Cherubim stand in the gate with a flaming sword turning every way. -z is west, into the garden.
import { angel, glowSprite } from './lib/ot-01-kit.js';

const GATE = [0, -32];
const EDGE = -32;

export default {
  title: 'Genesis 3:23-24: Leaving the garden',
  seed: 303,
  fov: 60,
  exposure: 1.2,

  sun: { direction: [-0.85, 0.3, -0.3], color: '#ffb57a', intensity: 3.4 },
  light: { sky: '#7a7fc0', ground: '#7a5a44', hemi: 1.6 },
  sky: { top: '#262c62', horizon: '#ff9c5c', ground: '#7a5a48', sunColor: '#ffd08a', glow: 1.3 },
  fog: { color: '#b98476', near: 70, far: 520 },
  clouds: { count: 60, seed: 8, shadow: '#3e3458', lit: '#ff9e6a', rim: '#ffe0b0', distance: [260, 900], altitude: [80, 220], hole: 0.15 },
  mountains: { count: 40, seed: 12, color: '#4e4450', radius: [480, 720], height: [50, 150], haze: 0.45 },
  bloom: { strength: 0.75, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.1, contrast: 1.07, vignette: 0.45, shadowTint: '#2a2258', highlightTint: '#ffd8a8' },
  shadow: { center: [0, -20], radius: 70 },

  player: { start: [-3, 10], yaw: -0.06, pitch: 0.07, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 900,
    segments: 200,
    seed: 23,
    hills: 18,
    bumps: 0.5,
    flats: [{ x: 0, z: -20, r: 60, falloff: 40, height: 0 }],
    colors: { ground: '#8a6a4a', groundAlt: '#7a5c40', grass: '#8a7a48', high: '#7a6650', rock: '#6a5646' },
    patches: [
      { x: 0, z: -220, r: 192, color: '#4f8a3a', strength: 1, rough: 0.05 },
      { x: 0, z: -38, r: 9, color: '#6f9a48', strength: 0.8, rough: 0.3 },
      { x: 0, z: -12, r: 26, color: '#93724e', strength: 0.5, rough: 0.6 },
    ],
  },

  scatter: [
    { type: 'tree', count: 120, center: [0, -220], ring: [16, 175], spacing: 7, seed: 3, props: { kind: 'broad', leaf: '#3d7a30' } },
    { type: 'rock', count: 30, center: [0, 40], ring: [25, 160], spacing: 9, seed: 4, props: { color: '#76604c' }, avoid: [{ rect: [0, -60, 300, 60] }, { r: 30, x: 0, z: -20 }] },
    { type: 'tree', count: 18, center: [0, 60], ring: [30, 180], spacing: 14, seed: 5, props: { kind: 'burnt' }, avoid: [{ rect: [0, -60, 300, 60] }, { r: 30, x: 0, z: -20 }] },
  ],

  figures: [
    { x: 2.6, z: -1, face: [6, 30], robe: '#8a6440', mantle: '#6a4a2e', skin: '#a8744e', arms: 'down' },
    { x: 4.2, z: -0.3, face: [12, 30], robe: '#9a7450', mantle: '#7a5636', skin: '#b58258', hood: true, scale: 0.95, arms: 'down' },
  ],

  effects: [
    { type: 'motes', at: [0, -50], radius: 12, height: 14, count: 120, color: '#fff2c8', size: 0.06 },
  ],

  custom(ctx) {
    const { THREE, solid, glow } = ctx;
    const r = ctx.rand;

    // The garden edge: a dense wall of trees and hedge, broken only at the east gate.
    for (let x = -170; x <= 170; x += r.range(3.5, 5.5)) {
      if (Math.abs(x) < 10) continue;
      const z = EDGE - r.range(1, 4) - Math.abs(x) * 0.08;
      const y = ctx.heightAt(x, z);
      ctx.builders.tree(ctx, { x, z, h: r.range(7, 11), kind: r() < 0.2 ? 'palm' : 'broad', leaf: r.pick(['#3f7e32', '#4a8a36', '#367030']) });
      solid.add(new THREE.IcosahedronGeometry(1, 0), { position: [x + r.range(-1, 1), y + 1, z + 2], rotation: [r() * 3, r() * 3, 0], scale: [3.2, 2.2, 2.4], color: r.pick(['#3f7a30', '#477f34']) });
      ctx.colliders.add({ x, z: z + 1.5, w: 6, d: 4, bottom: y - 1, top: y + 30 });
    }
    // Gateposts of rough stone.
    for (const side of [-1, 1]) {
      const gx = GATE[0] + side * 9.5, gz = GATE[1];
      const y = ctx.heightAt(gx, gz);
      solid.box(2.4, 9, 2.4, { position: [gx, y + 4.5, gz], color: '#a08a70' });
      solid.box(3, 0.7, 3, { position: [gx, y + 9.3, gz], color: '#8a755e' });
      ctx.colliders.add({ x: gx, z: gz, w: 2.4, d: 2.4, bottom: y, top: y + 9.5 });
    }
    // Light from the garden within.
    glowSprite(ctx, { position: [0, 4, -100], size: 40, color: '#fff0c0', opacity: 0.18 });
    const inner = new THREE.PointLight('#fff2c8', 40, 40, 1.4);
    inner.position.set(0, 5, -45);
    ctx.scene.add(inner);
    for (let i = 0; i < 300; i++) {
      const x = r.range(-40, 40), z = r.range(-120, EDGE - 4);
      const y = ctx.heightAt(x, z);
      solid.add(new THREE.OctahedronGeometry(0.12, 0), { position: [x, y + 0.2, z], color: r.pick(['#f6e45a', '#ffffff', '#f07a8a', '#c58af0']) });
    }

    // Cherubim keeping the way of the tree of life, and the flaming sword between them.
    for (const side of [-1, 1]) angel(ctx, { x: GATE[0] + side * 5.2, z: GATE[1] + 1, face: [GATE[0] + side * 3, 40], scale: 2.3, arms: 'down', glow: 0.22, halo: 0, light: 6 });
    const sy = ctx.heightAt(...GATE) + 4.2;
    const sword = new THREE.Group();
    const bladeMat = new THREE.MeshBasicMaterial({ color: '#fff0c0', toneMapped: false });
    sword.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 0.05), bladeMat).translateY(0.9));
    sword.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.14), new THREE.MeshBasicMaterial({ color: '#ffc060', toneMapped: false })).translateY(-0.8));
    sword.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), new THREE.MeshBasicMaterial({ color: '#d08a40', toneMapped: false })).translateY(-1.15));
    const flames = [];
    const cols = ['#ff7a1c', '#ffb43a', '#ffe08a', '#ff5a14'];
    for (let i = 0; i < 18; i++) {
      const geo = new THREE.ConeGeometry(0.12, 0.7, 4);
      geo.translate(0, 0.35, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: cols[i % 4], toneMapped: false }));
      m.position.set(r.sign() * 0.12, -0.5 + (i / 18) * 3.2, r.range(-0.06, 0.06));
      m.rotation.z = m.position.x > 0 ? -0.6 : 0.6;
      flames.push([m, r() * 10, r.range(8, 14)]);
      sword.add(m);
    }
    sword.position.set(GATE[0], sy, GATE[1] + 1);
    sword.scale.setScalar(1.7);
    ctx.scene.add(sword);
    const swordLight = new THREE.PointLight('#ff9a40', 40, 22, 1.4);
    swordLight.position.set(GATE[0], sy + 1, GATE[1] + 2);
    ctx.scene.add(swordLight);
    glowSprite(ctx, { position: [GATE[0], sy + 0.8, GATE[1] + 1], size: 7, color: '#ffb060', opacity: 0.4 });
    ctx.onFrame((t) => {
      sword.rotation.set(Math.sin(t * 0.5) * 0.5, t * 1.1, Math.sin(t * 0.8) * 0.6);
      for (const [m, ph, sp] of flames) m.scale.set(1, 0.6 + 0.4 * Math.abs(Math.sin(t * sp + ph)), 1);
      swordLight.intensity = 34 + 8 * Math.sin(t * 11);
    });
    ctx.colliders.add({ x: GATE[0], z: GATE[1] + 1, w: 3, d: 3, bottom: -10, top: 50 });
    ctx.colliders.add({ x: GATE[0], z: GATE[1] - 1, w: 18, d: 2, bottom: -10, top: 50 });

    // Thorns and thistles in the ground outside.
    for (let i = 0; i < 220; i++) {
      const x = r.range(-80, 80), z = r.range(EDGE + 4, 90);
      if (Math.abs(x - 1) < 5 && z < 16) continue;
      const y = ctx.heightAt(x, z);
      const s = r.range(0.5, 1.2);
      for (let k = 0; k < 5; k++) solid.add(new THREE.ConeGeometry(0.06 * s, 1.1 * s, 3), { position: [x, y + 0.45 * s, z], rotation: [r.range(-0.9, 0.9), r() * 3, r.range(-0.9, 0.9)], color: r.pick(['#4a3a28', '#5a4630', '#3c3020']) });
      if (r() < 0.4) glow.add(new THREE.OctahedronGeometry(0.1 * s, 0), { position: [x + r.range(-0.3, 0.3), y + 0.9 * s, z], color: '#9a5ab0' });
    }
  },
};
