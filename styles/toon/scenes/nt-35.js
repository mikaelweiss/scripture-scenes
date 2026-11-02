// Acts 16:23-34: at midnight Paul and Silas, their feet fast in the stocks, sing praises to God.
// A great earthquake shakes the prison; every door opens and every prisoner's bands are loosed.
// The inner prison runs north from its entrance. Paul and Silas sit at the far end. The south wall is cut low so the camera can see in.
import * as THREE from 'three';
import { Batch, box, chain, cyl, DAY_STYLE, FX_LAYER, glow, lamp, makeRng, person, stars, torch } from './lib/nt-32-kit.js';

const PAUL = [-1.1, -13.7];
const SILAS = [1.1, -13.7];
const ROOM = { x0: -9, x1: 9, z0: -17, z1: 8 };
const H = 5.2;
const PRISONER = { robes: ['#6b5a4a', '#7a6a52', '#5e4632', '#8c7458', '#4a3a2c'], skin: ['#9c6a45', '#a87650', '#8a5a3b', '#b5825a'] };

export default {
  title: 'Acts 16:23-34: The Philippian jail',
  subtitle: 'At midnight Paul and Silas prayed and sang praises, and the doors were opened',
  seed: 35,

  style: { ...DAY_STYLE, ink: '#120e10', fog: { color: '#1c1820', near: 40, far: 260 }, toonSteps: [0.3, 0.66, 1.0], crack: '#1a1412' },

  sky: { zenith: '#06081a', mid: '#10142c', horizon: '#20223c', ground: '#141218', glowColor: '#2c3050', glowDir: [0.3, 0.5, -1] },

  sun: { dir: [0.3, 0.9, -0.3], color: '#8090c0', intensity: 0.35, hemi: { sky: '#4a4c6a', ground: '#3a2c28', intensity: 1.15 }, shadowSize: 40 },

  ground: {
    size: 800, segments: 160, flatRadius: 100, hillHeight: 24, undulation: 0.02,
    plaza: { center: [0, -4.5], size: [18, 25] },
    colors: { sand: '#4a4440', dirt: '#3e3834', grass: '#3a3e34', grassDark: '#2e3228', plaza: '#7e7266', plazaLine: '#5a5048', scorch: '#2a2228', scorchEdge: '#3a3238', hill: '#2e3040' },
  },

  objects: [],

  cracks: [
    { from: [0, 4], angle: Math.PI - 0.1, length: 14, width: 0.3 },
    { from: [-3, -6], angle: -2.4, length: 9, width: 0.25 },
    { from: [4, -2], angle: 2.6, length: 10, width: 0.25 },
  ],

  custom(ctx) {
    const { scene } = ctx;
    const b = new Batch(ctx);
    stars(ctx, { count: 700, color: '#d8dcf0' });
    const stone = '#6e6458', stoneDark = '#574e46', wood = '#5a3e28';
    const { x0, x1, z0, z1 } = ROOM;
    const wall = (x, z, w, d, h, color = stone) => {
      b.add(color, box(w, h, d, [x, h / 2 - 0.1, z]));
      ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: h });
    };

    // Walls: tall on three sides, a low cut-away wall with the entrance on the south.
    wall(0, z0 - 0.4, x1 - x0 + 1.6, 0.8, H);
    wall(x0 - 0.4, (z0 + z1) / 2, 0.8, z1 - z0, H);
    wall(x1 + 0.4, (z0 + z1) / 2, 0.8, z1 - z0, H);
    wall(-5.75, z1 + 0.4, 7.7, 0.8, 1.1, stoneDark);
    wall(5.75, z1 + 0.4, 7.7, 0.8, 1.1, stoneDark);
    for (const sx of [-1, 1]) b.add(stoneDark, box(0.9, H, 1, [sx * 2.2, H / 2 - 0.1, z1 + 0.4]));
    for (let i = 0; i < 12; i++) b.add('#3e2c1e', cyl(0.13, 0.13, x1 - x0 + 1.6, [0, H + 0.1, z0 + 0.8 + i * 2.1], [0, 0, Math.PI / 2], 6));
    for (let i = 0; i < 3; i++) b.add('#3e2c1e', box(x1 - x0 + 1.6, 0.12, 1.4, [0, H + 0.3, z0 + 2 + i * 0.8]));

    // Cells down both sides, every door thrown open by the earthquake.
    const doors = [];
    const rng = makeRng(35);
    for (const side of [-1, 1]) {
      const inner = side * 5.4;
      for (let k = 0; k <= 4; k++) {
        const z = -12 + k * 4;
        wall((inner + side * 9) / 2, z, 3.6, 0.5, 3.6);
        if (k < 4) {
          b.add(stoneDark, box(0.6, 3.6, 0.6, [inner, 1.7, z]));
          b.add(stoneDark, box(0.6, 0.6, 4, [inner, 3.3, z + 2]));
          const hinge = new THREE.Group();
          hinge.position.set(inner, 0, z + 0.35);
          const leaf = new THREE.Group();
          const planks = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 2.6).translate(0, 1.35, 1.3), ctx.kit.toon(wood));
          const bands = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 2.62).translate(0, 0.6, 1.3), ctx.kit.toon('#2e2e36'));
          const band2 = bands.clone();
          band2.position.y = 1.4;
          planks.castShadow = true;
          leaf.add(planks, bands, band2);
          hinge.add(leaf);
          scene.add(hinge);
          const open = side * (1.1 + rng() * 0.6);
          doors.push({ hinge, open, ph: rng() * 6 });
          const cz = z + 2, cx = (inner + side * 9) / 2;
          if (rng() < 0.8) {
            const fig = person(ctx, { pos: [cx + side * 0.6, cz + (rng() - 0.5)], face: [0, cz + 1], colors: { robe: PRISONER.robes[k % 5], mantle: PRISONER.robes[(k + 2) % 5], skin: PRISONER.skin[k % 4], hair: '#2b1a12', arms: rng() < 0.5 ? [0.4, 0.6] : undefined }, kneel: rng() < 0.6 });
            fig.rotation.x = -0.05;
            chain(b, ctx, { points: [[side * 8.9, cz - 0.3], [cx + side * 1.0, cz - 0.6], [cx + side * 0.3, cz - 1.1]], y: 0 });
          }
        }
      }
    }

    // The inner prison: Paul and Silas in the stocks, singing, the stocks split open.
    b.add(wood, box(5.4, 0.28, 0.32, [0, 0.14, -12.9]));
    b.add(wood, box(5.4, 0.08, 0.32, [0.2, 0.08, -12.35], [0, 0.08, 0]));
    for (const sx of [-1, 1]) b.add('#4a3020', box(0.24, 0.5, 0.4, [sx * 2.8, 0.25, -12.9]));
    ctx.addCollider({ x: 0, z: -12.9, hx: 2.9, hz: 0.3, rot: 0, top: 0.5 });
    const paul = person(ctx, { pos: PAUL, scale: 1.15, face: [-0.6, 0], colors: { robe: '#d9c7a3', mantle: '#8c5a3c', skin: '#a8724a', hair: '#3a2418', sash: '#5e4632', arms: [0.35, 2.3] }, kneel: true });
    const silas = person(ctx, { pos: SILAS, scale: 1.15, face: [0.6, 0], colors: { robe: '#c8a97a', mantle: '#3e6e66', skin: '#9c6a45', hair: '#2b1a12', sash: '#c8912e', arms: [0.5, 1.9] }, kneel: true });
    paul.rotation.x = silas.rotation.x = -0.18;
    lamp(b, ctx, { pos: [-3.4, -15.6], y: 1.6, light: { color: '#ffb060', intensity: 9, distance: 14 } });
    b.add(stoneDark, box(0.6, 0.12, 0.5, [-3.4, 1.55, -16.2]));
    glow(ctx, { pos: [0, 1.6, -14.2], size: 8, color: '#ffe2a0', opacity: 0.4, pulse: 0.05 });
    const song = new THREE.PointLight('#ffe0a0', 10, 12, 1.2);
    song.position.set(0, 3, -12.5);
    scene.add(song);

    // The keeper of the prison springs in with a torch.
    const jailer = person(ctx, { pos: [2.4, -8.6], face: [0, -12], colors: { robe: '#7a2a22', mantle: '#4a3020', skin: '#b5825a', hair: '#2b1a12', sash: '#c8912e', arms: [0.4, 1.3] } });
    jailer.rotation.x = 0.1;
    torch(b, ctx, { pos: [3.0, -8.2], height: 1.6, light: { color: '#ffa850', intensity: 9, distance: 16 } });
    torch(b, ctx, { pos: [-8.3, -4], light: { color: '#ffa850', intensity: 6, distance: 12 } });
    torch(b, ctx, { pos: [8.3, -8], light: null });
    b.flush();

    // Song rising from Paul and Silas: small notes of light drifting up.
    const noteRng = makeRng(8);
    const notes = Array.from({ length: 14 }, () => glow(ctx, { pos: [0, 0, 0], size: 0.35, color: '#fff0c0', opacity: 0.7, pulse: 0 }));
    const noteData = notes.map(() => ({ ph: noteRng(), x: (noteRng() - 0.5) * 2.4 }));

    // Earthquake: repeating tremors shake the camera, the doors and the dust.
    const dustGeo = new THREE.BufferGeometry();
    const dp = [];
    for (let i = 0; i < 500; i++) dp.push(x0 + rng() * (x1 - x0), rng() * H, z0 + rng() * (z1 - z0));
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    const dustMat = new THREE.PointsMaterial({ color: '#b8a890', size: 0.08, transparent: true, opacity: 0, depthWrite: false });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.layers.set(FX_LAYER);
    scene.add(dust);
    ctx.onFrame((t, dt, camera) => {
      const c = t % 9;
      const quake = c < 3 ? Math.sin((c / 3) * Math.PI) : 0;
      if (quake > 0) {
        camera.position.x += Math.sin(t * 53) * 0.09 * quake;
        camera.position.y += Math.sin(t * 61 + 1) * 0.07 * quake;
        camera.position.z += Math.sin(t * 47 + 2) * 0.05 * quake;
      }
      for (const d of doors) d.hinge.rotation.y = d.open + Math.sin(t * 19 + d.ph) * 0.08 * quake + Math.sin(t * 0.7 + d.ph) * 0.03;
      dust.position.y = -((t * 1.2) % H);
      dustMat.opacity = 0.15 + 0.55 * quake;
      notes.forEach((n, i) => {
        const d = noteData[i];
        const life = (t * 0.18 + d.ph) % 1;
        n.position.set(d.x + Math.sin(t + i) * 0.3, 1.4 + life * 4, -14.2);
        n.material.opacity = 0.8 * Math.sin(life * Math.PI);
      });
    });
  },

  player: {
    start: [-1, -6.5],
    lookAt: [0.8, -14],
    colors: { robe: '#4f7f80', mantle: '#5e4632', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
