// John 4:5-30. Jacob's well outside Sychar in Samaria at noon. Jesus, weary, sits on the well; a Samaritan woman
// has come to draw water. Mount Gerizim rises behind, the fields are white to harvest, the disciples return from town.
import * as K from './lib/nt-07-kit.js';

const WELL = [0, 0];
const TOWN = [30, -110];

export default {
  title: "John 4:5-30: The woman at the well",
  seed: 9,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.15, 0.95, 0.25], color: '#fff2d8', intensity: 3.0 },
  light: { sky: '#a9c4e8', ground: '#a08060', hemi: 1.0 },
  sky: { top: '#3a6bb0', horizon: '#dfe6e6', ground: '#c9b089', sunColor: '#fff6e0', glow: 0.6 },
  fog: { color: '#d9dcd2', near: 120, far: 700 },
  clouds: { count: 18, shadow: '#b8c0cc', lit: '#ffffff', rim: '#ffffff', distance: [350, 950], altitude: [160, 300], hole: 0.1 },
  mountains: { count: 44, color: '#8a7a62', radius: [520, 780], height: [40, 120], haze: 0.6 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.36, shadowTint: '#2c3050', highlightTint: '#fff2d6' },
  shadow: { center: [0, 0], radius: 30 },

  player: { start: [-1.2, 6.6], yaw: -0.05, pitch: -0.03, eye: 1.65, speed: 4 },

  terrain: {
    size: 1200, segments: 200, seed: 44, hills: 26, bumps: 0.3,
    flats: [
      { x: -140, z: -230, r: 40, falloff: 170, height: 75 },
      { x: 210, z: -250, r: 30, falloff: 150, height: 60 },
      { x: 0, z: 0, r: 18, falloff: 30, height: 0 },
    ],
    colors: { ground: '#b09468', groundAlt: '#a08458', grass: '#9a9050', high: '#8f8058', rock: '#86745c' },
    patches: [
      { x: 0, z: 0, r: 7, color: '#a89272', strength: 0.8, rough: 0.3 },
      { x: -40, z: -30, r: 30, color: '#d6be78', strength: 0.85, rough: 0.4 },
      { x: 45, z: -20, r: 26, color: '#d6be78', strength: 0.85, rough: 0.4 },
      { x: -35, z: 30, r: 24, color: '#d2b872', strength: 0.8, rough: 0.4 },
      ...Array.from({ length: 12 }, (_, i) => ({ x: 2 + (i / 11) * 28 + Math.sin(i) * 1.5, z: -4 - (i / 11) * 100, r: 3.2, color: '#c8b08a', strength: 0.7, rough: 0.2 })),
    ],
  },

  objects: [
    { type: 'tree', x: -5.5, z: -3, h: 6, kind: 'broad', leaf: '#6f7d4e' },
    { type: 'tree', x: 7, z: -6, h: 5, kind: 'broad', leaf: '#7b8a5a' },
  ],

  scatter: [
    { type: 'tree', count: 60, center: [0, 0], ring: [20, 220], spacing: 9, seed: 8, avoid: [{ r: 32, x: -40, z: -30 }, { r: 28, x: 45, z: -20 }, { r: 26, x: -35, z: 30 }, { rect: [15, -55, 10, 110] }], props: { kind: 'broad', leaf: '#7b8a5a', h: 5 } },
    { type: 'rock', count: 50, center: [0, 0], ring: [15, 260], spacing: 10, seed: 10, avoid: [{ rect: [15, -55, 10, 110] }], props: { size: 1.2, color: '#9a8a74' } },
  ],

  crowd: {
    palette: K.palette,
    groups: [
      { count: 11, center: [17, -40], ring: [0, 3.5], spacing: 1.2, face: WELL, children: 0, seed: 51 },
      { count: 30, center: TOWN, ring: [6, 24], spacing: 2, face: WELL, children: 0.2, seed: 52 },
    ],
  },

  figures: [
    { x: 1.5, z: 3.6, face: [-1.05, 1.0], robe: '#2f5a7a', mantle: '#8a3a2e', skin: '#a87652', hood: true },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;
    const y = ctx.heightAt(...WELL);

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const x = WELL[0] + Math.cos(a) * 1.15, z = WELL[1] + Math.sin(a) * 1.15;
      K.block(ctx, { x, z, y: y - 0.1, w: 0.5, h: 0.85, d: 0.62, rot: -a + Math.PI / 2, color: '#a8957a', jitter: 0.1 });
    }
    const water = new THREE.CircleGeometry(0.9, 10);
    water.rotateX(-Math.PI / 2);
    ctx.solid.add(water, { position: [WELL[0], y + 0.3, WELL[1]], color: '#1c2a30', jitter: 0 });
    for (const sx of [-1, 1]) ctx.solid.add(new THREE.CylinderGeometry(0.07, 0.09, 2.1, 5), { position: [WELL[0] + sx * 1.25, y + 1.05, WELL[1] + 0.3], color: '#5a4030' });
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.06, 2.7, 5), { position: [WELL[0], y + 2.05, WELL[1] + 0.3], rotation: [0, 0, Math.PI / 2], color: '#5a4030' });
    ctx.solid.add(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 3), { position: [WELL[0] + 0.3, y + 1.35, WELL[1] + 0.3], color: '#c8b080' });
    ctx.solid.add(new THREE.CylinderGeometry(0.13, 0.1, 0.22, 6), { position: [WELL[0] + 0.3, y + 0.6, WELL[1] + 0.3], color: '#6a4a30' });
    K.block(ctx, { x: -1.9, z: 1.3, y: y - 0.1, w: 0.6, h: 0.45, d: 1.6, rot: 0.4, color: '#9a8a70' });

    K.seated(ctx, { x: -1.05, z: 1.0, y, face: [1.4, 3.6], seat: 0.75, robe: '#f6f1e6', mantle: '#ece3cf', skin: '#a8754f', scale: 1.05 });
    ctx.effects.halo({ position: [-1.05, y + 1.7, 1.0], size: 2.4, opacity: 0.22, color: '#fff3d6' });
    const pl = new THREE.PointLight('#fff0cf', 1.2, 5, 1.6);
    pl.position.set(-0.6, y + 2.0, 1.8);
    ctx.scene.add(pl);

    K.jar(ctx, { x: 1.2, z: 0.9, y: y + 0.75, h: 0.6, color: '#b07a50' });
    ctx.solid.add(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 3), { position: [1.5, y + 1.1, 0.75], rotation: [0, 0, 0.5], color: '#c8b080' });

    for (let i = 0; i < 28; i++) {
      const a = r() * Math.PI * 2, d = r.range(4, 22);
      K.house(ctx, { x: TOWN[0] + Math.cos(a) * d, z: TOWN[1] + Math.sin(a) * d * 0.7, rot: r.range(-0.2, 0.2), color: r.pick(['#c7b294', '#b9a184', '#d0bea0']) });
    }
    ctx.solid.box(60, 3.2, 1.2, { position: [TOWN[0], ctx.heightAt(...TOWN) + 1.2, TOWN[1] + 24], color: '#b5a080' });

    for (const [cx, cz, rad, n] of [[-40, -30, 28, 1600], [45, -20, 24, 1300], [-35, 30, 22, 1100]]) {
      K.grass(ctx, { center: [cx, cz], radius: rad, count: n, color: '#e2c878', seed: Math.floor(cx * 7 + cz) });
    }
    K.grass(ctx, { center: [0, 0], radius: 18, count: 0, color: '#9a9a52', avoid: (x, z) => Math.hypot(x, z) < 3.2 || (x > 0 && x < 6 && z < 2 && z > -16) });
    K.birds(ctx, { center: [-20, -40], height: 30, radius: 25, count: 4, color: '#2a2420', speed: 0.12, size: 0.6 });
  },
};
