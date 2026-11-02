// Enos 1:1-8: Enos went to hunt beasts in the forest, and kneeling in a small clearing he prayed all day
// and into the night. His bow and quiver lie set aside on a fallen log. The last light fades in the northwest.
import { fire, pine, broadTree, bush, scatterIn, person, nightSky } from './lib/bom-13-kit.js';

const ENOS = [0, -6];
const GEAR = [3.4, -4.2];

export default {
  title: 'Enos 1:1-8: Enos prays in the forest',
  seed: 14,
  fov: 60,
  exposure: 1.25,

  sun: { direction: [-0.62, 0.07, -0.78], color: '#ff9a62', intensity: 1.6 },
  light: { sky: '#9aa6e0', ground: '#4a4030', hemi: 2.2 },
  sky: { top: '#0f1634', horizon: '#d8784e', ground: '#2a2a2a', sunColor: '#ffb070', glow: 1.0 },
  fog: { color: '#4a4660', near: 25, far: 230 },
  clouds: { count: 34, shadow: '#262640', lit: '#d0705a', rim: '#ffb080', distance: [300, 900], altitude: [70, 160], hole: 0.15 },
  mountains: { count: 36, color: '#262a3a', radius: [480, 720], height: [40, 110], haze: 0.35 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.75 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.55, shadowTint: '#1a1e48', highlightTint: '#ffd2a8' },
  shadow: { center: [0, -6], radius: 40 },

  player: { start: [-2.8, -1.6], yaw: -0.85, pitch: 0.0, eye: 1.65, speed: 4 },

  terrain: {
    size: 900,
    segments: 160,
    seed: 41,
    hills: 22,
    bumps: 0.4,
    flats: [{ x: ENOS[0], z: ENOS[1] + 2, r: 9, falloff: 12, height: 0 }],
    colors: { ground: '#4d5a2e', groundAlt: '#3f4a28', grass: '#56662f', high: '#4a5030', rock: '#5a5446' },
    patches: [{ x: ENOS[0], z: ENOS[1] + 2, r: 9, color: '#6a7238', strength: 0.6, rough: 0.5 }],
  },

  figures: [],

  custom(ctx) {
    const { THREE } = ctx;
    nightSky(ctx, { count: 1100, minY: 0.18, size: 2, moon: { direction: [0.5, 0.45, 0.6], size: 18, color: '#fff6e2' } });

    const clearing = (x, z) => Math.hypot(x - ENOS[0], z - ENOS[1] - 2) < 10.5 || (Math.abs(x + 18) < 5 && z < -4 && z > -40);
    const trees = scatterIn(ctx.rand, { center: ENOS, ring: [9, 160], count: 520, spacing: 3.2, avoid: clearing });
    trees.forEach(([x, z], i) => {
      const near = Math.hypot(x, z) < 50;
      if (i % 3 === 0) broadTree(ctx, { x, z, h: ctx.rand.range(6, 10), color: ctx.rand.pick(['#3f5e2c', '#4a6630', '#36522a']), crowns: 4 });
      else pine(ctx, { x, z, h: ctx.rand.range(7, near ? 13 : 16), color: ctx.rand.pick(['#2c4a2e', '#34532f', '#26402a']) });
    });
    for (const [x, z] of scatterIn(ctx.rand, { center: ENOS, ring: [3.5, 60], count: 140, spacing: 1.6, avoid: (x, z) => Math.hypot(x + 2.8, z + 1.6) < 5 || Math.hypot(x - ENOS[0], z - ENOS[1]) < 3 })) {
      bush(ctx, { x, z, size: ctx.rand.range(0.5, 1.1), color: ctx.rand.pick(['#4a6a32', '#3e5a2c', '#58703a']) });
    }

    // Enos kneels with hands lifted, facing the last light.
    person(ctx, { x: ENOS[0], z: ENOS[1], face: [ENOS[0] - 8, ENOS[1] + 7], pose: 'kneel', robe: '#7a5a3a', mantle: '#5a3a28', skin: '#b07a55', arms: 'out' });

    // Fallen log with the hunting gear set aside on it.
    const gy = ctx.heightAt(GEAR[0], GEAR[1]);
    ctx.solid.add(new THREE.CylinderGeometry(0.32, 0.38, 4.2, 7), { position: [GEAR[0] + 0.3, gy + 0.26, GEAR[1] - 0.2], rotation: [Math.PI / 2, 0.9, 0], color: '#5a4434' });
    ctx.colliders.add({ x: GEAR[0] + 0.3, z: GEAR[1] - 0.2, w: 0.7, d: 4.2, rot: 0.9, bottom: gy, top: gy + 0.6 });
    const bow = new THREE.TorusGeometry(0.75, 0.03, 4, 14, Math.PI * 0.8);
    bow.rotateZ(Math.PI * 0.1);
    ctx.solid.add(bow, { position: [GEAR[0] - 0.2, gy + 0.62, GEAR[1] + 0.2], rotation: [Math.PI / 2 - 0.2, 0.9, 0], color: '#8a6034' });
    const bowString = new THREE.CylinderGeometry(0.008, 0.008, 1.42, 3);
    bowString.rotateZ(Math.PI / 2);
    ctx.solid.add(bowString, { position: [GEAR[0] - 0.2, gy + 0.6, GEAR[1] + 0.2], rotation: [0, 0.9 + Math.PI / 2, 0.2], color: '#e8dcc0' });
    const qx = GEAR[0] + 1.3, qz = GEAR[1] + 0.5;
    ctx.solid.add(new THREE.CylinderGeometry(0.13, 0.11, 0.8, 6), { position: [qx, gy + 0.42, qz], rotation: [0.35, 0.9, 0], color: '#6a3a24' });
    for (let i = 0; i < 5; i++) {
      ctx.solid.add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 3), { position: [qx + (i - 2) * 0.03, gy + 0.95, qz - 0.14], rotation: [0.35, 0.9, (i - 2) * 0.05], color: '#d8c8a0' });
      ctx.solid.add(new THREE.ConeGeometry(0.03, 0.08, 3), { position: [qx + (i - 2) * 0.03, gy + 1.2, qz - 0.24], rotation: [0.35, 0.9, 0], color: '#e8e0d0' });
    }
    ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 4), { position: [GEAR[0] - 0.6, gy + 0.18, GEAR[1] + 1.1], rotation: [Math.PI / 2, 0.4, 0], color: '#6a4a2a' });
    ctx.solid.add(new THREE.ConeGeometry(0.06, 0.25, 4), { position: [GEAR[0] - 0.15, gy + 0.18, GEAR[1] + 2.15], rotation: [Math.PI / 2, 0.4, 0], color: '#9a9a9a' });

    fire(ctx, { x: ENOS[0] + 2.4, z: ENOS[1] + 3.2, size: 0.55, light: 22, distance: 16 });
    // A few rocks and the soft light of the answer that came to him in the night.
    for (const [x, z, s] of [[-3, -9, 0.9], [4, -10, 1.3], [-6, -3, 0.7]]) ctx.builders.rock(ctx, { x, z, size: s, color: '#6a665a' });
    ctx.effects.beam({ position: [ENOS[0], ctx.heightAt(...ENOS), ENOS[1]], height: 120, radiusBottom: 1.6, radiusTop: 6, color: '#dfe6ff', opacity: 0.22 });
    ctx.effects.motes({ position: [ENOS[0], ctx.heightAt(...ENOS), ENOS[1]], radius: 3, height: 14, count: 60, color: '#e8eeff' });
    const glow = new THREE.PointLight('#dfe4ff', 30, 14, 1.4);
    glow.position.set(ENOS[0], ctx.heightAt(...ENOS) + 3, ENOS[1]);
    ctx.scene.add(glow);
  },
};
