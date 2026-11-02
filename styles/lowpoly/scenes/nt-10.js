// Luke 5:1-11. Early morning on the Sea of Galilee. Jesus is in Simon's boat; the net is so full of fish it
// breaks, and James and John bring the second boat alongside until both begin to sink. Simon falls at his knees.
// The walker starts on a jetty below the crowd that heard him teach. -z is out over the lake.
import * as K from './lib/nt-07-kit.js';

const BOAT_A = [-4.0, -7.6];
const BOAT_B = [4.6, -8.4];
const NET = [0.3, -7.0];
const ROT_A = 0.12, ROT_B = -0.1;

export default {
  title: 'Luke 5:1-11: The miraculous catch of fish',
  seed: 10,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.75, 0.3, 0.55], color: '#ffcf96', intensity: 2.6 },
  light: { sky: '#a8bce0', ground: '#6a5a48', hemi: 1.1 },
  sky: { top: '#5a7fb5', horizon: '#f6d2a8', ground: '#b8a68e', sunColor: '#ffe2b0', glow: 1.2 },
  fog: { color: '#d8c8b4', near: 70, far: 520 },
  clouds: { count: 30, shadow: '#9a98a8', lit: '#ffdcb0', rim: '#fff4dc', distance: [300, 900], altitude: [130, 260], hole: 0.3 },
  mountains: { count: 48, color: '#7a6e64', radius: [480, 720], height: [50, 120], haze: 0.62 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#2e3458', highlightTint: '#ffe6c0' },
  shadow: { center: [1, -6], radius: 40 },

  player: { start: [0.2, 3.2], yaw: 0.02, pitch: -0.03, eye: 1.65, speed: 4 },

  terrain: {
    size: 1200, segments: 200, seed: 61, hills: 34, bumps: 0.25,
    flats: [
      { x: 0, z: 62, r: 62, falloff: 60, height: 1.4 },
      { x: 0, z: -230, r: 228, falloff: 12, height: -6 },
    ],
    colors: { ground: '#9a8668', groundAlt: '#8a7a5c', grass: '#6f8240', high: '#7a7a4c', rock: '#6e6252' },
    patches: [{ x: 0, z: 14, r: 60, color: '#b8a888', strength: 0.5, rough: 0.6 }],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 40, center: [0, 60], ring: [30, 160], arc: [0, Math.PI], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#6f8448', h: 5 } },
    { type: 'tree', count: 10, center: [0, 30], ring: [14, 60], arc: [0.2, Math.PI - 0.2], spacing: 10, seed: 9, props: { kind: 'palm', leaf: '#6a8240' } },
    { type: 'rock', count: 26, center: [0, 18], ring: [6, 60], arc: [0, Math.PI], spacing: 6, seed: 11, avoid: [{ rect: [0, 14, 6, 30] }], props: { size: 1, color: '#4a4440' } },
  ],

  crowd: {
    palette: K.palette,
    groups: [
      { count: 140, center: [0, 22], ring: [5, 20], arc: [0.15, Math.PI - 0.15], spacing: 1.0, face: NET, children: 0.2, seed: 71, avoid: [{ rect: [0, 18, 4.5, 20] }] },
    ],
  },

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;

    K.water(ctx, { y: 0, size: 1100, z: -300, color: '#3f7f92', opacity: 0.9, amp: 0.08, floor: [{ x: 0, z: -260, w: 1100, d: 540 }] });

    const jy = 0.55;
    for (let i = 0; i < 16; i++) {
      const z = 15 - i * 1.0;
      ctx.solid.box(2.4, 0.1, 0.92, { position: [0, jy - 0.05, z], rotation: [0, r.range(-0.02, 0.02), 0], color: '#8a6a48', jitter: 0.08 });
    }
    ctx.colliders.add({ x: 0, z: 7.5, w: 2.4, d: 16, bottom: -6, top: jy });
    for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) {
      const z = 15 - i * 3.6;
      ctx.solid.add(new THREE.CylinderGeometry(0.12, 0.14, 5, 5), { position: [sx * 1.25, jy - 2, z], color: '#5a4030' });
    }

    const boatA = K.boat(ctx, { x: BOAT_A[0], z: BOAT_A[1], rot: ROT_A, y: 0, sink: 0.3, bob: 0.4, mast: true });
    const boatB = K.boat(ctx, { x: BOAT_B[0], z: BOAT_B[1], rot: ROT_B, y: 0, sink: 0.35, bob: 0.4, hull: '#5a4028', deck: '#7a5a3a' });

    const fishGeo = new THREE.OctahedronGeometry(1, 0).scale(0.07, 0.11, 0.28);
    const fishMat = new THREE.MeshPhongMaterial({ color: '#c8d0d4', specular: '#ffffff', shininess: 80, flatShading: true, emissive: '#3a4448' });
    const COUNT = 320;
    const fish = new THREE.InstancedMesh(fishGeo, fishMat, COUNT);
    const fs = Array.from({ length: COUNT }, (_, i) => {
      const jumper = i < 30;
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      return { jumper, x: NET[0] + Math.cos(a) * d * 2.7, z: NET[1] + Math.sin(a) * d * 2.2, y: -0.05 - r() * 0.4 * (1 - d), yaw: r() * 6, ph: r() * 6, k: r.range(0.6, 1.4) };
    });
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    ctx.onFrame((t) => {
      for (let i = 0; i < COUNT; i++) {
        const f = fs[i];
        if (f.jumper) {
          const c = ((t * 0.5 * f.k + f.ph) % 1.6);
          const h = c < 1 ? Math.sin(c * Math.PI) * 0.7 : -0.5;
          p.set(f.x + Math.cos(f.yaw) * c * 0.8, h, f.z + Math.sin(f.yaw) * c * 0.8);
          e.set(Math.cos(c * Math.PI) * 0.9, -f.yaw + Math.PI / 2, Math.sin(t * 20 + f.ph) * 0.4);
        } else {
          p.set(f.x + Math.sin(t * 3 * f.k + f.ph) * 0.06, f.y + Math.sin(t * 5 * f.k + f.ph) * 0.05, f.z);
          e.set(0.3 * Math.sin(t * 4 + f.ph), f.yaw + Math.sin(t * 6 * f.k + f.ph) * 0.5, 1.2 + Math.sin(t * 9 + f.ph) * 0.6);
        }
        q.setFromEuler(e);
        fish.setMatrixAt(i, m.compose(p, q, one));
      }
      fish.instanceMatrix.needsUpdate = true;
    });
    fish.frustumCulled = false;
    ctx.scene.add(fish);

    const netGeo = new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(2.9, 1.2, 2.4);
    const net = new THREE.Mesh(netGeo, new THREE.MeshBasicMaterial({ color: '#2e2a22', wireframe: true, transparent: true, opacity: 0.8 }));
    net.position.set(NET[0], 0.12, NET[1]);
    ctx.scene.add(net);
    const floatRing = 22;
    for (let i = 0; i < floatRing; i++) {
      const a = (i / floatRing) * Math.PI * 2;
      if (a > 4.4 && a < 5.0) continue;
      ctx.solid.add(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 6), { position: [NET[0] + Math.cos(a) * 2.9, 0.06, NET[1] + Math.sin(a) * 2.4], color: '#b89a6a' });
    }
    for (let i = 0; i < 12; i++) {
      const a = 4.7 + r.range(-0.3, 0.3);
      const d = 1 + r() * 0.5;
      ctx.solid.add(new THREE.OctahedronGeometry(1, 0), { position: [NET[0] + Math.cos(a) * 2.9 * d, -0.1, NET[1] + Math.sin(a) * 2.4 * d], rotation: [0, r() * 6, 1.4], scale: [0.07, 0.11, 0.28], color: '#b8c4c8' });
    }
    const rope = (a, b) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const g = new THREE.CylinderGeometry(0.025, 0.025, len, 4);
      const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: '#8a7050' }));
      mesh.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize());
      ctx.scene.add(mesh);
    };
    const A = K.frame(BOAT_A[0], BOAT_A[1], ROT_A), B = K.frame(BOAT_B[0], BOAT_B[1], ROT_B);
    const ring = (a) => [NET[0] + Math.cos(a) * 2.9, 0.08, NET[1] + Math.sin(a) * 2.4];
    rope([A(1.1, -0.4)[0], 0.9, A(1.1, -0.4)[1]], ring(Math.PI + 0.4));
    rope([A(1.0, -1.9)[0], 0.9, A(1.0, -1.9)[1]], ring(Math.PI + 0.9));
    rope([B(-1.1, -1.4)[0], 0.9, B(-1.1, -1.4)[1]], ring(-0.4));
    rope([B(-1.1, 0.6)[0], 0.9, B(-1.1, 0.6)[1]], ring(0.3));

    for (const [bx, bz, rot] of [[...BOAT_A, ROT_A], [...BOAT_B, ROT_B]]) {
      const F = K.frame(bx, bz, rot);
      for (let i = 0; i < 40; i++) {
        const [fx, fz] = F(r.range(-0.6, 0.6), r.range(-2.4, 0.4));
        ctx.solid.add(new THREE.OctahedronGeometry(1, 0), { position: [fx, 0.42, fz], rotation: [r.range(-0.3, 0.3), r() * 6, 1.5], scale: [0.07, 0.11, 0.28], color: '#b8c4c8', jitter: 0.08 });
      }
    }

    const deck = (b) => b.position.y + 0.62;
    
    const crew = [
      { at: A(0, 2.3), face: A(2, -2), christ: true },
      { at: A(0.15, 1.2), face: A(0, 4), robe: '#6e5a44', mantle: '#8a3a2e', kneel: true },
      { at: A(0.45, -0.4), face: NET, robe: '#a0825c', arms: 'out' },
      { at: A(0.4, -1.9), face: NET, robe: '#5e4b3a', mantle: '#3f4d5e', arms: 'out' },
      { at: B(-0.4, -1.4), face: NET, robe: '#94704e', arms: 'out', boat: boatB },
      { at: B(-0.4, 0.6), face: NET, robe: '#7a4e36', mantle: '#556246', arms: 'out', boat: boatB },
      { at: B(0.1, 2.4), face: NET, robe: '#c4b090', boat: boatB },
    ];
    for (const c of crew) {
      const y = deck(c.boat ?? boatA) - (c.kneel ? 0.5 : 0);
      if (c.christ) {
        const spec = K.christ(c.at[0], c.at[1], c.face);
        K.person(ctx, { x: c.at[0], z: c.at[1], y, face: c.face, robe: spec.robe, mantle: spec.mantle, skin: spec.skin, scale: spec.scale });
        ctx.effects.halo({ position: [c.at[0], y + 1.4, c.at[1]], size: 3, opacity: 0.3, color: '#fff3d6' });
        const pl = new THREE.PointLight('#fff0cf', 4, 10, 1.5);
        pl.position.set(c.at[0], y + 2.2, c.at[1] + 0.8);
        ctx.scene.add(pl);
      } else {
        K.person(ctx, { x: c.at[0], z: c.at[1], y, face: c.face, robe: c.robe, mantle: c.mantle, skin: r.pick(K.palette.skins), arms: c.arms });
      }
    }

    K.boat(ctx, { x: -6, z: 6, rot: 0.2, y: -0.6, sink: 0, bob: 0, mast: false, walk: false });
    for (let i = 0; i < 10; i++) K.house(ctx, { x: -60 + r.range(-25, 25), z: 30 + r.range(-10, 20), rot: r.range(-0.3, 0.3), color: '#7a6e64', roof: '#5a5048' });
    K.birds(ctx, { center: NET, height: 9, radius: 7, count: 9, color: '#f2efe6', speed: 0.5, size: 0.4 });
  },
};
