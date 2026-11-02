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

  player: { start: [0.7, 6.6], yaw: 0.04, pitch: -0.08, eye: 1.65, speed: 4 },

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
    { type: 'tree', x: -9, z: -12, h: 4.5, kind: 'broad', leaf: '#6f7d4e' },
    { type: 'tree', x: 12, z: 4, h: 4, kind: 'broad', leaf: '#7b8a5a' },
    { type: 'tree', x: -12, z: 9, h: 7, kind: 'palm', leaf: '#6f8448' },
    { type: 'rock', x: 4.5, z: 6.5, size: 0.7, color: '#9a8a74' },
    { type: 'rock', x: -6, z: 3.5, size: 0.9, color: '#9a8a74' },
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
    { x: -1.5, z: 3.1, face: [0.95, 0.85], robe: '#2f5a7a', mantle: '#8a3a2e', skin: '#a87652', hood: true },
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

    K.seated(ctx, { x: 0.95, z: 0.85, y, face: [-1.6, 3.4], seat: 0.75, robe: '#f6f1e6', mantle: '#ece3cf', skin: '#a8754f', scale: 1.05 });
    ctx.effects.halo({ position: [0.95, y + 1.7, 0.85], size: 2.4, opacity: 0.22, color: '#fff3d6' });
    const pl = new THREE.PointLight('#fff0cf', 1.2, 5, 1.6);
    pl.position.set(0.6, y + 2.0, 1.8);
    ctx.scene.add(pl);

    K.jar(ctx, { x: -0.8, z: 0.8, y: y + 0.75, h: 0.55, color: '#b07a50' });
    ctx.solid.add(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 3), { position: [-1.05, y + 1.1, 0.65], rotation: [0, 0, -0.5], color: '#c8b080' });

    for (let i = 0; i < 28; i++) {
      const a = r() * Math.PI * 2, d = r.range(4, 22);
      K.house(ctx, { x: TOWN[0] + Math.cos(a) * d, z: TOWN[1] + Math.sin(a) * d * 0.7, rot: r.range(-0.2, 0.2), color: r.pick(['#c7b294', '#b9a184', '#d0bea0']) });
    }
    ctx.solid.box(60, 3.2, 1.2, { position: [TOWN[0], ctx.heightAt(...TOWN) + 1.2, TOWN[1] + 24], color: '#b5a080' });

    for (const [cx, cz, rad, n] of [[-40, -30, 28, 1600], [45, -20, 24, 1300], [-35, 30, 22, 1100]]) {
      K.grass(ctx, { center: [cx, cz], radius: rad, count: n, color: '#e2c878', seed: Math.floor(cx * 7 + cz) });
    }
    // Worn flagstones around the well mouth.
    for (let i = 0; i < 44; i++) {
      const a = (i / 22) * Math.PI * 2 + r.range(-0.08, 0.08), d = i < 22 ? r.range(1.7, 2.1) : r.range(2.4, 2.9);
      const fx = WELL[0] + Math.cos(a) * d, fz = WELL[1] + Math.sin(a) * d;
      ctx.solid.box(r.range(0.55, 0.75), 0.08, r.range(0.42, 0.55), { position: [fx, ctx.heightAt(fx, fz) + 0.01, fz], rotation: [0, -a + r.range(-0.3, 0.3), 0], color: r.pick(['#b8a88c', '#a89878', '#c2b294']), jitter: 0.06 });
    }
    // Stone watering trough for flocks.
    K.block(ctx, { x: 3.2, z: -1.6, y: y - 0.1, w: 2.4, h: 0.55, d: 0.7, rot: -0.5, color: '#a08c70' });
    const trough = new THREE.BoxGeometry(2.1, 0.05, 0.45);
    ctx.solid.add(trough, { position: [3.2, y + 0.43, -1.6], rotation: [0, -0.5, 0], color: '#3e5a60', jitter: 0 });
    // Her own water jar, set down beside her.
    K.jar(ctx, { x: -2.1, z: 3.6, y, h: 0.62, color: '#b8784a' });
    // A flock drinking and grazing with its shepherd.
    for (const [ax, az, rot] of [[2.6, -2.4, 2.6], [3.9, -2.2, 3.2], [4.6, -0.9, 2.1], [6.5, -3.5, 0.6], [7.4, -2.2, 1.6], [5.6, -4.6, 2.9], [8.2, -4.1, 0.2], [6.8, -5.8, 1.2]]) {
      K.animal(ctx, { x: ax, z: az, rot, kind: 'sheep' });
    }
    K.animal(ctx, { x: 9.4, z: -2.6, rot: 1.9, kind: 'goat' });
    K.person(ctx, { x: 9.2, z: -5.6, face: [4, -2], robe: '#7a5a3c', mantle: '#c9b48e', skin: '#8a5a3c', hood: true });
    ctx.solid.add(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 4), { position: [9.55, ctx.heightAt(9.5, -5.6) + 0.95, -5.4], rotation: [0.1, 0, -0.1], color: '#6a4a30' });
    // Dry-stone walls bounding the white fields.
    for (const [cx, cz, rad] of [[-40, -30, 29], [45, -20, 25], [-35, 30, 23]]) {
      for (let i = 0; i < 70; i++) {
        const a = (i / 70) * Math.PI * 2, wx = cx + Math.cos(a) * rad, wz = cz + Math.sin(a) * rad;
        if (Math.hypot(wx - WELL[0], wz - WELL[1]) < 8) continue;
        ctx.solid.add(new THREE.DodecahedronGeometry(0.45, 0), { position: [wx, ctx.heightAt(wx, wz) + 0.2, wz], rotation: [r(), r() * 3, r()], scale: [1.3, 0.8, 1], color: r.pick(['#a8987c', '#988a70', '#b4a486']), jitter: 0.08 });
      }
    }
    // Shrubs and tufts in the dry ground near the well.
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2, d = r.range(5, 20);
      const bx = Math.cos(a) * d, bz = Math.sin(a) * d;
      if ((bx > 0 && bx < 6 && bz < 2 && bz > -16) || Math.hypot(bx - 0.7, bz - 7) < 7) continue;
      const bs = r.range(0.35, 0.8);
      ctx.solid.add(new THREE.IcosahedronGeometry(bs, 0), { position: [bx, ctx.heightAt(bx, bz) + bs * 0.4, bz], scale: [1, 0.7, 1], color: r.pick(['#7a8048', '#6a7440', '#8a8a50']), jitter: 0.1 });
    }
    K.grass(ctx, { center: [0, 0], radius: 18, count: 500, color: '#9a9a52', avoid: (x, z) => Math.hypot(x, z) < 3.2 || (x > 0 && x < 6 && z < 2 && z > -16) });
    K.birds(ctx, { center: [-20, -40], height: 30, radius: 25, count: 4, color: '#2a2420', speed: 0.12, size: 0.6 });
  },
};
