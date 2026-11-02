// Acts 7:54-60. Outside the wall of Jerusalem, Stephen kneels and looks up into the opened heavens,
// where light breaks through the clouds. The council presses around him; young Saul stands by with their coats.
import { cityWall, town, person, brightCloud } from './lib/nt-25-kit.js';

const STEPHEN = [0, -8];
const SAUL = [6.5, -2.5];
const VISION = [-8, 58, -110];

const wallLine = [[-160, -50], [-70, -46], [-20, -48], [30, -46], [90, -52], [170, -60]];

export default {
  title: "Acts 7:54-60: Stephen's vision",
  seed: 30,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.55, 0.5, 0.45], color: '#ffe2b0', intensity: 2.4 },
  light: { sky: '#8a96b8', ground: '#5e4a3c', hemi: 1.3 },
  sky: { top: '#3a4466', horizon: '#c8a888', ground: '#9a8270', sunColor: '#fff0c8', glow: 1.4 },
  fog: { color: '#b49c8a', near: 70, far: 520 },
  clouds: { count: 110, shadow: '#4a4656', lit: '#e8d0b0', rim: '#fff4d8', distance: [160, 800], altitude: [70, 200], hole: 0.22 },
  mountains: { count: 40, color: '#5e5a5a', radius: [480, 720], height: [40, 110], haze: 0.55 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.78 },
  grade: { saturation: 1.0, contrast: 1.08, vignette: 0.45, shadowTint: '#2a2850', highlightTint: '#ffe8c0' },
  shadow: { center: [0, -6], radius: 40 },

  player: { start: [6, 5], yaw: 0.36, pitch: 0.14, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 180,
    seed: 30,
    hills: 26,
    bumps: 0.5,
    flats: [{ x: 0, z: -10, r: 40, falloff: 50, height: 0 }],
    colors: { ground: '#a48c6a', groundAlt: '#8e7a5c', grass: '#7a7a4a', high: '#8a7c64', rock: '#76685a' },
    patches: [{ x: 0, z: -8, r: 12, color: '#988060', strength: 0.5, rough: 0.5 }],
  },

  objects: [
    { type: 'rubble', x: 0, z: -8, radius: 6, count: 26, size: [0.12, 0.3], color: '#8a7c6a' },
  ],

  scatter: [
    { type: 'rock', count: 50, center: [0, -10], ring: [18, 140], spacing: 7, seed: 41, avoid: [{ rect: [10, 15, 20, 30] }], props: { size: 1.4 } },
    { type: 'tree', count: 30, center: [0, 20], ring: [30, 200], arc: [0, Math.PI], spacing: 10, seed: 42, props: { kind: 'broad', leaf: '#6f7a4c', h: 4.5 } },
  ],

  crowd: {
    palette: {
      robes: ['#6e5a44', '#5e4b3a', '#4f4a44', '#7a6a58', '#3e3a40', '#8a7258', '#5a4a3a', '#d8cdb5'],
      mantles: ['#3a2e28', '#4a3e30', '#2e3440', '#5a4a3a', '#6d3b2e', '#e6dcc4'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.85,
      hoodChance: 0.5,
    },
    groups: [
      { count: 60, center: STEPHEN, ring: [6.5, 14], arc: [-Math.PI * 0.95, Math.PI * 0.15], spacing: 1.0, face: STEPHEN, children: 0, seed: 51 },
      { count: 16, center: STEPHEN, ring: [7, 11], arc: [Math.PI * 0.75, Math.PI * 1.05], spacing: 1.1, face: STEPHEN, children: 0, seed: 52 },
    ],
  },

  figures: [
    { x: SAUL[0], z: SAUL[1], face: STEPHEN, robe: '#7a2e2a', mantle: '#4a2420', skin: '#a87652' },
  ],

  effects: [
    { type: 'beam', at: STEPHEN, height: 320, radiusBottom: 1.8, radiusTop: 22, color: '#fff2d0', opacity: 0.55 },
    { type: 'halo', position: [STEPHEN[0], 1.2, STEPHEN[1]], size: 3.4, opacity: 0.45, color: '#fff2d0' },
    { type: 'motes', at: STEPHEN, radius: 3, height: 30, count: 120 },
    { type: 'halo', position: VISION, size: 90, opacity: 0.85, color: '#fff2d6' },
    { type: 'halo', position: VISION, size: 30, opacity: 0.45, color: '#ffffff' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const sy = ctx.heightAt(...STEPHEN);
    person(ctx, { x: STEPHEN[0], z: STEPHEN[1], y: sy - 0.5, face: [VISION[0], VISION[2]], robe: '#d8ccb0', mantle: '#8a7454', skin: '#a87652', arms: 'out', emissive: 0.15 });
    ctx.colliders.add({ x: STEPHEN[0], z: STEPHEN[1], w: 0.8, d: 0.8, bottom: sy - 1, top: sy + 1.5 });

    const vg = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: '#fffaf0', toneMapped: false, fog: false });
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 4.4, 7), mat);
    robe.position.y = 2.2;
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), mat);
    head.position.y = 4.9;
    vg.add(robe, head);
    vg.position.set(VISION[0] + 7, VISION[1] - 7, VISION[2] + 2);
    vg.scale.setScalar(1.6);
    ctx.scene.add(vg);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 60).translate(0, 30, 0), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      r.position.set(...VISION);
      r.rotation.z = a;
      ctx.scene.add(r);
    }
    brightCloud(ctx, { x: VISION[0] - 22, y: VISION[1] - 12, z: VISION[2] + 10, size: 18, count: 8, seed: 3, glow: 0.35, color: '#f2e2c8' });
    brightCloud(ctx, { x: VISION[0] + 30, y: VISION[1] - 10, z: VISION[2] + 6, size: 16, count: 8, seed: 4, glow: 0.35, color: '#f2e2c8' });

    const coatColors = ['#5a4a3a', '#3e3a40', '#6d3b2e', '#7a6a58', '#4a3e30', '#d8cdb5'];
    const cy = ctx.heightAt(SAUL[0] + 1, SAUL[1] + 0.8);
    for (let i = 0; i < 7; i++) {
      ctx.solid.box(1.1, 0.12, 0.7, { position: [SAUL[0] + 1 + (i % 2) * 0.1, cy + 0.06 + i * 0.1, SAUL[1] + 0.8 - (i % 3) * 0.08], rotation: [0.05 * (i % 2), i * 0.6, 0.04], color: coatColors[i % 6], jitter: 0.06 });
    }

    cityWall(ctx, { points: wallLine, h: 12, thick: 3, color: '#c8b28a', gaps: [{ x: -45, z: -47, r: 4 }] });
    ctx.solid.box(10, 16, 6, { position: [-45, ctx.heightAt(-45, -47) + 7, -47], color: '#bea880', jitter: 0.04 });
    ctx.solid.box(3.6, 6, 6.4, { position: [-45, ctx.heightAt(-45, -47) + 2, -47], color: '#2e241c' });
    town(ctx, { center: [0, -110], radius: 70, count: 50, seed: 30, spacing: 9, size: [6, 10], height: [5, 9] });
  },
};
