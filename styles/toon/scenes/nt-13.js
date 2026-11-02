// Mark 4:35-41: Christ rises in the stern of the boat and rebukes the wind. After a while the storm gives way to a great calm.
// The boat lies along x with its bow east. Christ stands in the stern (west), the player at the bow.
import * as THREE from 'three';
import { CHRIST, DISCIPLES, boat, figure, flatColors, glow, groundMesh, NO_PLAZA, rain, rockBoat, sea, skyUniforms, stars, toonStyle } from './lib/nt-13-kit.js';

const BOAT_Y = 0.35;
const STORM_END = 14;
const CALM_TIME = 8;

const STORM = {
  sky: ['#141b24', '#2a3842', '#4c5b62', '#283a42', '#6f7f86'],
  fog: '#3a4850',
  hemi: 1.15,
  sun: 1.1,
  sea: ['#2c4f5a', '#b9d0d0'],
};
const CALM = {
  sky: ['#25335a', '#6a6f9a', '#f2b98a', '#4c6070', '#ffd9a0'],
  fog: '#9a8a9c',
  hemi: 1.35,
  sun: 1.9,
  sea: ['#466f88', '#9fc7cf'],
};

export default {
  title: 'Mark 4:35-41: Calming the storm',
  subtitle: 'Peace, be still. And there was a great calm',
  seed: 41,

  style: toonStyle({ ink: '#141a20', fog: STORM.fog, near: 30, far: 340, fade: [60, 300, 260, 0.5], steps: [0.35, 0.68, 1.0], grain: 0.07 }),

  sky: { zenith: STORM.sky[0], mid: STORM.sky[1], horizon: STORM.sky[2], ground: STORM.sky[3], glowColor: STORM.sky[4], glowDir: [-0.6, 0.15, -1] },

  sun: { dir: [-0.5, 0.8, -0.4], color: '#c8d4dc', intensity: STORM.sun, hemi: { sky: '#8aa0aa', ground: '#2a3a40', intensity: STORM.hemi }, shadowSize: 40 },

  ground: { size: 800, segments: 100, flatRadius: 2000, hillHeight: 0, undulation: 0, plaza: NO_PLAZA, colors: flatColors('#2c4f5a') },

  mountains: { count: 26, distance: [330, 520], height: [30, 70], widthRatio: [2.2, 3.4], colors: ['#3d4c50', '#45555a', '#38474c'] },

  objects: [],

  clouds: {
    layers: [
      { count: 44, distance: [120, 420], height: [38, 85], size: [50, 110], color: '#55606a', shade: '#1a2028', drift: 0.012 },
      { count: 28, distance: [90, 300], height: [65, 115], size: [60, 120], color: '#3d4852', shade: '#151a20', drift: -0.009 },
    ],
  },

  custom(ctx) {
    const { scene } = ctx;
    groundMesh(ctx).visible = false;
    const water = sea(ctx, { size: 520, segs: 96, calm: [{ x: 0, z: 0, r: 9, sx: 2.2 }], amp: 2.3, color: STORM.sea[0], crest: STORM.sea[1] });

    const b = boat(ctx, { pos: [0, 0], y: BOAT_Y, L: 10, B: 3, sail: 'furled', walk: true, mastAt: 0.28 });
    const rock = rockBoat(ctx, b, { roll: 0.07, pitch: 0.04, heave: 0.18 });
    const on = (colors, x, z, opts = {}) => figure(ctx, colors, [x, z], { y: 0, parent: b.inner, ...opts });

    // Christ in the stern, arms raised against the wind (Mark 4:39). A cushion lies where He slept (4:38).
    on(CHRIST, -3.55, 0, { face: [10, 0], glow: 0.35, scale: 1.08, arms: [0.35, 2.55] });
    glow(ctx, [-3.55, 1.5, 0], 4.5, '#fff1cc', { opacity: 0.55, parent: b.inner });
    const pillow = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 4, 8), ctx.kit.toon('#b5523b'));
    pillow.rotation.x = Math.PI / 2;
    pillow.position.set(-4.2, 0.95, 0);
    b.inner.add(pillow);

    // The disciples: some cling to the mast and rails, some bail, some cry out to Him (4:38).
    const D = DISCIPLES;
    on(D[0], -2.2, 0.55, { face: [-3.55, 0], pose: 'kneel', arms: [0.3, 1.6] });
    on(D[1], -2.1, -0.6, { face: [-3.55, 0], arms: [0.4, 1.9] });
    on(D[2], -1.2, 0.1, { face: [-3.55, 0], pose: 'kneel', arms: [0.25, 1.2] });
    on(D[3], 0.5, 0.8, { face: [-3.55, 0], arms: [0.3, 2.1] });
    on(D[4], 2.2, -0.55, { face: [2.8, 0], arms: [0.15, 1.4] });
    on(D[5], 0.2, -0.7, { face: [0, -5], pose: 'kneel', arms: [0.2, 0.9] });
    on(D[6], -0.6, 0.85, { face: [-0.6, 5], pose: 'kneel', arms: [0.2, 0.9] });
    on(D[7], 3.3, 0.45, { face: [-3.55, 0], pose: 'kneel', arms: [0.3, 2.0] });
    on(D[8], -1.0, -0.45, { face: [-3.55, 0], arms: [0.5, 2.2] });
    on(D[9], 2.4, -0.65, { face: [-3.55, 0], pose: 'kneel' });
    on(D[10], 3.7, -0.3, { face: [10, 3], arms: [0.25, 1.0] });

    // Other little boats out on the water (4:36).
    const others = [
      boat(ctx, { pos: [-46, -38], rot: 0.9, y: BOAT_Y, L: 8, B: 2.6, sail: 'furled' }),
      boat(ctx, { pos: [58, -64], rot: -0.5, y: BOAT_Y, L: 8, B: 2.6, sail: 'none', mast: false }),
      boat(ctx, { pos: [-72, 40], rot: 2.4, y: BOAT_Y, L: 8, B: 2.6, sail: 'furled' }),
    ];
    const otherRock = others.map((o, i) => rockBoat(ctx, o, { roll: 0.12, pitch: 0.07, heave: 0.5, phase: i * 2.1, speed: 1.2 }));

    const starMat = stars(ctx, { count: 500, size: 1.8 }).material;
    starMat.opacity = 0;
    const rainMat = rain(ctx, { count: 1500, wind: [0.6, 0.15], speed: 30, opacity: 0.42 });

    // Lightning: a jagged bolt and a flash every few seconds while the storm lasts.
    const hemi = scene.children.find((o) => o.isHemisphereLight);
    const sun = scene.children.find((o) => o.isDirectionalLight);
    const boltMat = new THREE.MeshBasicMaterial({ color: '#f4f8ff', transparent: true, opacity: 0, fog: false, depthWrite: false, side: THREE.DoubleSide });
    const bolt = new THREE.Group();
    let bx = 0, by = 140, k = 0;
    while (by > 0) {
      const nx = bx + Math.sin(k * 2.7) * 11, ny = by - 12 - (k % 3) * 4;
      const a = new THREE.Vector3(bx, by, 0), c = new THREE.Vector3(nx, Math.max(0, ny), 0);
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, a.distanceTo(c) + 0.6), boltMat);
      seg.position.copy(a).add(c).multiplyScalar(0.5);
      seg.rotation.z = Math.atan2(-(c.x - a.x), c.y - a.y) + Math.PI;
      seg.layers.set(1);
      bolt.add(seg);
      bx = nx; by = ny; k++;
    }
    scene.add(bolt);

    const sky = skyUniforms(ctx);
    const keys = ['zenith', 'mid', 'horizon', 'ground', 'glowColor'];
    const from = keys.map((_, i) => new THREE.Color(STORM.sky[i])), to = keys.map((_, i) => new THREE.Color(CALM.sky[i]));
    const fogA = new THREE.Color(STORM.fog), fogB = new THREE.Color(CALM.fog);
    const seaA = STORM.sea.map((c) => new THREE.Color(c)), seaB = CALM.sea.map((c) => new THREE.Color(c));
    const cloudA = [new THREE.Color('#55606a'), new THREE.Color('#3d4852')], cloudB = [new THREE.Color('#e9b49a'), new THREE.Color('#9a8aa8')];
    let clouds = null;
    const flashAt = [1.0, 4.6, 8.2, 11.5];
    ctx.onFrame((t, dt, camera) => {
      clouds ??= scene.children.filter((o) => o.isGroup && o.children[0]?.isInstancedMesh && o.children[0].material.fog === false);
      const calm = THREE.MathUtils.smoothstep(t, STORM_END, STORM_END + CALM_TIME);
      const storm = 1 - calm;
      keys.forEach((key, i) => sky[key].value.copy(from[i]).lerp(to[i], calm));
      scene.fog.color.copy(fogA).lerp(fogB, calm);
      scene.fog.far = 340 + calm * 500;
      water.amp = 0.06 + 2.24 * storm;
      water.base.copy(seaA[0]).lerp(seaB[0], calm);
      water.crest.copy(seaA[1]).lerp(seaB[1], calm);
      water.far.material.color.copy(water.base);
      rock.roll = 0.07 * storm + 0.005;
      rock.pitch = 0.04 * storm + 0.004;
      rock.heave = 0.18 * storm + 0.02;
      for (const r of otherRock) {
        r.roll = 0.12 * storm + 0.005;
        r.heave = 0.5 * storm + 0.02;
      }
      rainMat.opacity = 0.42 * storm;
      starMat.opacity = calm;
      clouds.forEach((g, i) => {
        g.children.forEach((m) => m.material.color.copy(cloudA[i] ?? cloudA[0]).lerp(cloudB[i] ?? cloudB[0], calm));
        g.position.y = calm * 40;
      });

      let f = 0, n = -1;
      if (t < STORM_END) {
        const cycle = t % 14.5;
        flashAt.forEach((s, i) => {
          const d = cycle - s;
          if (d > 0 && d < 0.5) { f = Math.max(f, d < 0.08 ? 1 : d < 0.16 ? 0.3 : d < 0.24 ? 0.8 : (0.5 - d) * 1.5); n = i; }
        });
      }
      hemi.intensity = THREE.MathUtils.lerp(STORM.hemi, CALM.hemi, calm) + f * 2.2;
      sun.intensity = THREE.MathUtils.lerp(STORM.sun, CALM.sun, calm);
      sun.color.set(calm > 0.5 ? '#ffd8a8' : '#c8d4dc');
      boltMat.opacity = f;
      if (n >= 0) {
        const a = n * 2.1 + 0.6;
        bolt.position.set(Math.sin(a) * 180, 0, -Math.cos(a) * 180);
        bolt.lookAt(camera.position.x, 0, camera.position.z);
      }
    });
  },

  light: {
    pointLights: [{ at: [-3.5, 0], lift: 3, color: '#fff0c8', intensity: 6, distance: 9 }],
  },

  player: {
    start: [1.9, 0.75],
    lookAt: [-3.55, -0.7],
    colors: DISCIPLES[11],
  },
};
