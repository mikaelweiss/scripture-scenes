// Ether 2:16-25, 6:2-12: the eight Jaredite barges, tight like a dish and peaked at the ends,
// driven by a furious wind across the deep, often buried under the waves. Each carries shining
// stones for light. The walker stands on the deck of one barge in the storm.
import { water, waveHeight } from './lib/bom-43-kit.js';

const AMP = 1.15;
const SPEED = 1.5;
const DECK = 2.3;

const others = [
  [-11, -26, 1.2], [10, -40, -0.9], [-26, -52, 1.4], [22, -16, -1.3], [2, -70, 0.8], [-34, -20, 1.0], [30, -58, -1.1],
];

function makeBarge(THREE, rand) {
  const g = new THREE.Group();
  const wood = new THREE.MeshLambertMaterial({ color: '#5e4230', flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: '#3e2c20', flatShading: true });
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), wood);
  hull.scale.set(2.6, 2.1, 9.5);
  g.add(hull);
  for (const z of [-1, 1]) {
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 7), dark);
    bow.position.set(0, 1.1, z * 8.6);
    bow.rotation.x = z * -1.0;
    g.add(bow);
  }
  for (const z of [-6, -3, 0, 3, 6]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 4, 18), dark);
    const k = Math.sqrt(1 - (z / 9.5) ** 2);
    band.scale.set(2.62 * k, 2.12 * k, 1);
    band.position.z = z;
    g.add(band);
  }
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.25, 8), dark);
  hatch.position.set(0, 2.1, -2.5);
  g.add(hatch);
  // Light from the shining stones within, seen through a small opening.
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff2c8').multiplyScalar(2.5), fog: false }));
  glow.position.set(0, 2.24, -2.5);
  g.add(glow);
  g.traverse((o) => (o.castShadow = o.receiveShadow = true));
  return g;
}

export default {
  title: 'Ether 2:16-25, 6:2-12: The Jaredite barges',
  seed: 49,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [-0.35, 0.5, 0.8], color: '#a8b8cc', intensity: 2.4 },
  light: { sky: '#8a9ab0', ground: '#2e3a40', hemi: 2.0 },
  sky: { top: '#1e2632', horizon: '#56646e', ground: '#1a2228', sunColor: '#5a6a7a', glow: 0.3 },
  fog: { color: '#46545e', near: 30, far: 260 },
  clouds: { count: 140, shadow: '#20262e', lit: '#4a5662', rim: '#6a7a88', distance: [120, 700], altitude: [50, 140], hole: 0, seed: 3 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 0.85, contrast: 1.12, vignette: 0.6, shadowTint: '#102030', highlightTint: '#d0e0f0' },
  shadow: { center: [0, -10], radius: 50 },

  player: { start: [0.3, 5], yaw: 0.12, pitch: -0.02, eye: 1.65, speed: 3 },

  terrain: {
    size: 900, segments: 60, seed: 49, hills: 0, bumps: 0,
    flats: [{ x: 0, z: 0, r: 2000, falloff: 10, height: -9 }],
    colors: { ground: '#1a2a30', groundAlt: '#1a2a30', grass: '#1a2a30', rock: '#1a2a30' },
  },

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;
    water(ctx, { y: 0, size: 520, segments: 230, color: '#3a6874', opacity: 1, amp: AMP, speed: SPEED });

    // The walker's barge holds still; the deck and its edges are colliders.
    const mine = makeBarge(THREE, r);
    mine.position.set(0, DECK - 2.12, 0);
    ctx.scene.add(mine);
    ctx.colliders.add({ x: 0, z: 0, w: 2.6, d: 13, bottom: -20, top: DECK });
    for (const side of [-1, 1]) ctx.colliders.add({ x: side * 1.7, z: 0, w: 0.5, d: 15, bottom: DECK - 1, top: DECK + 4 });
    for (const end of [-1, 1]) ctx.colliders.add({ x: 0, z: end * 6.9, w: 3.6, d: 0.6, bottom: DECK - 1, top: DECK + 4 });
    const lamp = new THREE.PointLight('#ffe6b0', 6, 6, 1.5);
    lamp.position.set(0, DECK + 0.6, -2.5);
    ctx.scene.add(lamp);

    // The other seven barges, pitching and often driven under the waves.
    const fleet = others.map(([x, z, rot], i) => {
      const b = makeBarge(THREE, r);
      b.rotation.order = 'YXZ';
      ctx.scene.add(b);
      return { b, x, z, rot, ph: i * 1.7, dive: 0.6 + (i % 3) * 0.5 };
    });
    ctx.onFrame((t) => {
      for (const f of fleet) {
        const h = waveHeight(f.x, f.z, t, AMP, SPEED);
        const ahead = waveHeight(f.x, f.z - 6, t, AMP, SPEED), behind = waveHeight(f.x, f.z + 6, t, AMP, SPEED);
        const side = waveHeight(f.x + 2, f.z, t, AMP, SPEED) - waveHeight(f.x - 2, f.z, t, AMP, SPEED);
        const under = Math.max(0, Math.sin(t * 0.35 + f.ph)) ** 3 * 3.2 * f.dive;
        f.b.position.set(f.x, h - 0.6 - under, f.z);
        f.b.rotation.set(Math.atan2(ahead - behind, 12) * 1.4, f.rot, Math.atan2(side, 4) * 1.2);
      }
    });

    // Driving rain around the walker.
    const drops = 900;
    const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.015, 0.9, 0.015), new THREE.MeshBasicMaterial({ color: '#9ab0c0', transparent: true, opacity: 0.35, depthWrite: false }), drops);
    rain.frustumCulled = false;
    const seeds = Array.from({ length: drops }, () => [r.range(-30, 30), r.range(-30, 30), r() * 30, r.range(0.8, 1.2)]);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0, -0.2));
    const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
    ctx.scene.add(rain);
    ctx.onFrame((t, dt, camera) => {
      for (let i = 0; i < drops; i++) {
        const [ox, oz, oy, k] = seeds[i];
        const y = 22 - ((oy + t * 22 * k) % 30);
        p.set(camera.position.x + ox + (22 - y) * 0.2, camera.position.y - 6 + y, camera.position.z + oz - (22 - y) * 0.25);
        rain.setMatrixAt(i, m.compose(p, q, s));
      }
      rain.instanceMatrix.needsUpdate = true;
    });

    // Lightning: rare flashes that light the whole sea.
    const flash = new THREE.DirectionalLight('#cfe0ff', 0);
    flash.position.set(-40, 100, -80);
    ctx.scene.add(flash);
    const bolt = new THREE.Group();
    let px = 0, py = 0;
    for (let i = 0; i < 9; i++) {
      const nx = px + r.range(-6, 6), ny = py - r.range(8, 12);
      const len = Math.hypot(nx - px, ny - py);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.6, len, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8f0ff').multiplyScalar(3), fog: false }));
      seg.position.set((px + nx) / 2, (py + ny) / 2, 0);
      seg.rotation.z = Math.atan2(-(nx - px), ny - py) + Math.PI;
      bolt.add(seg);
      px = nx;
      py = ny;
    }
    bolt.position.set(-60, 110, -200);
    bolt.visible = false;
    ctx.scene.add(bolt);
    ctx.onFrame((t) => {
      const c = t % 7.3;
      const on = (c > 4 && c < 4.12) || (c > 4.22 && c < 4.3);
      flash.intensity = on ? 4 : 0;
      bolt.visible = on;
    });

    // Foam flecks riding the swell.
    const foamN = 260;
    const foam = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 5).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#c8d4d8', transparent: true, opacity: 0.6, depthWrite: false }), foamN);
    foam.frustumCulled = false;
    const fseeds = Array.from({ length: foamN }, () => [r.range(-90, 90), r.range(-140, 40), r.range(0.25, 0.8), r() * 6]);
    ctx.scene.add(foam);
    const flat = new THREE.Quaternion();
    ctx.onFrame((t) => {
      for (let i = 0; i < foamN; i++) {
        const [fx, fz, size, ph] = fseeds[i];
        const x = fx + ((t * 1.5 + ph * 10) % 20) - 10;
        const y = waveHeight(x, fz, t, AMP, SPEED) + 0.08;
        const k = Math.max(0.05, Math.sin(t * 0.6 + ph)) * size;
        p.set(x, y, fz);
        foam.setMatrixAt(i, m.compose(p, flat, s.set(k, 1, k)));
      }
      s.set(1, 1, 1);
      foam.instanceMatrix.needsUpdate = true;
    });
  },
};
