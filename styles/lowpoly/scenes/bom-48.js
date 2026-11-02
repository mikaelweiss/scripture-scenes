// Ether 3:1-6: on the summit of mount Shelem, above the clouds, the brother of Jared kneels before
// sixteen small stones, white and clear as glass. The Lord touches them one by one with his finger
// and they shine. The Lord stays hidden in a bright cloud, and only a white arm and finger reach out.
import { person } from './lib/bom-43-kit.js';

const PEAK = 140;
const ALTAR = [0, -3];
const CLOUD_Y = 104;

export default {
  title: 'Ether 3:1-6: The brother of Jared sees the finger of the Lord',
  seed: 48,
  fov: 58,
  exposure: 0.92,

  sun: { direction: [0.7, 0.42, -0.3], color: '#ffe4bc', intensity: 2.8 },
  light: { sky: '#9ab8e8', ground: '#c8c0b8', hemi: 1.15 },
  sky: { top: '#2a4c94', horizon: '#e4dcd2', ground: '#f0ece6', sunColor: '#fff0d0', glow: 1.0 },
  fog: { color: '#dcdad8', near: 200, far: 1000 },
  mountains: { count: 34, color: '#6a6a74', radius: [520, 760], height: [90, 200], haze: 0.45 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.05, contrast: 1.06, vignette: 0.4, shadowTint: '#28305e', highlightTint: '#fff4e0' },
  shadow: { center: [0, -2], radius: 30 },

  player: { start: [2.6, 2.4], yaw: 0.45, pitch: 0.14, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 1100, segments: 260, seed: 48, hills: 60, bumps: 0.3,
    flats: [
      { x: 0, z: 0, r: 20, falloff: 170, height: PEAK - 10 },
      { x: 0, z: 0, r: 7, falloff: 16, height: PEAK },
    ],
    colors: { ground: '#7a746a', groundAlt: '#6e685e', grass: '#7a746a', high: '#8a847a', rock: '#6a645c' },
    patches: [{ x: 0, z: -1, r: 6, color: '#8e887c', strength: 0.6, rough: 0.5 }],
  },

  objects: [
    { type: 'rock', x: -5.5, z: -6, size: 2.2, color: '#7e786e' },
    { type: 'rock', x: 6, z: -7, size: 2.8, color: '#7e786e' },
    { type: 'rock', x: -7, z: 3, size: 1.6, color: '#7e786e' },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const r = ctx.rand;
    // A ring of rocks around the summit stands in for the cliff edge and keeps the walker on top.
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const d = r.range(11, 13);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const s = r.range(1.4, 2.6);
      const y = ctx.heightAt(x, z);
      ctx.solid.add(new THREE.DodecahedronGeometry(s, 0), { position: [x, y + s * 0.3, z], rotation: [r() * 3, r() * 3, 0], scale: [1, 0.8, 1], color: '#7a746a', jitter: 0.08 });
      ctx.colliders.add({ x, z, w: s * 1.6, d: s * 1.6, bottom: y - 2, top: y + 6 });
    }

    // The flat stone where the sixteen stones lie in two rows.
    const ay = ctx.heightAt(ALTAR[0], ALTAR[1]) - 0.1;
    ctx.solid.box(2.6, 0.75, 1.3, { position: [ALTAR[0], ay + 0.37, ALTAR[1]], color: '#8a8478', jitter: 0.05 });
    ctx.solid.box(2.8, 0.12, 1.45, { position: [ALTAR[0], ay + 0.8, ALTAR[1]], color: '#9a948a' });
    ctx.colliders.add({ x: ALTAR[0], z: ALTAR[1], w: 2.8, d: 1.45, bottom: ay, top: ay + 0.86 });
    const top = ay + 0.9;
    const stoneGeo = new THREE.OctahedronGeometry(0.11, 0).scale(1, 0.7, 1);
    const stones = Array.from({ length: 16 }, (_, i) => {
      const mat = new THREE.MeshLambertMaterial({ color: '#e8eef2', emissive: '#ffffff', emissiveIntensity: 0, flatShading: true });
      const m = new THREE.Mesh(stoneGeo, mat);
      m.position.set(ALTAR[0] - 1.05 + (i % 8) * 0.3, top, ALTAR[1] - 0.22 + Math.floor(i / 8) * 0.44);
      m.rotation.y = i * 0.7;
      ctx.scene.add(m);
      const halo = ctx.effects.halo({ position: [m.position.x, top + 0.05, m.position.z], size: 0.6, opacity: 0, color: '#fff8e8' });
      return { m, mat, halo };
    });

    // The bright cloud the Lord speaks from: a dense glowing core wrapped in thinner, wider veils.
    const cloud = new THREE.Group();
    const CLOUD = [ALTAR[0] + 2.4, top + 3.3, ALTAR[1] - 1.6];
    const layers = [
      { n: 9, spread: [1.3, 0.25, 0.9], size: [0.6, 1.0], opacity: 0.85, color: '#fffaf0', emissive: '#d8ccb6' },
      { n: 14, spread: [2.2, 0.4, 1.5], size: [0.6, 1.1], opacity: 0.4, color: '#fbf6ec', emissive: '#c8c0b2' },
      { n: 18, spread: [3.2, 0.6, 2.2], size: [0.8, 1.4], opacity: 0.16, color: '#f6f2ea', emissive: '#bab4aa' },
    ];
    const puffGeo1 = new THREE.IcosahedronGeometry(1, 1);
    for (const L of layers) {
      const mat = new THREE.MeshLambertMaterial({ color: L.color, emissive: L.emissive, transparent: true, opacity: L.opacity, depthWrite: false, flatShading: true });
      for (let i = 0; i < L.n; i++) {
        const puff = new THREE.Mesh(puffGeo1, mat);
        const a = r() * Math.PI * 2, d = Math.sqrt(r());
        puff.position.set(Math.cos(a) * d * L.spread[0], r.range(-1, 1) * L.spread[1], Math.sin(a) * d * L.spread[2]);
        const k = r.range(L.size[0], L.size[1]);
        puff.scale.set(k * 1.3, k * 0.55, k);
        puff.rotation.y = r() * 3;
        cloud.add(puff);
      }
    }
    cloud.position.set(...CLOUD);
    ctx.scene.add(cloud);
    ctx.effects.halo({ position: [CLOUD[0], CLOUD[1] - 0.2, CLOUD[2]], size: 5, opacity: 0.16, color: '#fff4dc' });
    const veilLight = new THREE.PointLight('#fff4dc', 10, 10, 1.4);
    veilLight.position.set(ALTAR[0], top + 1.4, ALTAR[1] + 1.4);
    ctx.scene.add(veilLight);
    ctx.onFrame((t) => (cloud.rotation.y = t * 0.03));

    // The finger of the Lord: a white, softly glowing arm reaching from the cloud to one stone at a time.
    const white = new THREE.MeshLambertMaterial({ color: '#e8e2d8', emissive: '#f4ead8', emissiveIntensity: 0.3, flatShading: true });
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 1, 7).rotateX(Math.PI / 2).translate(0, 0, 0.5), white);
    const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 1, 10, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5), new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide }));
    const sleeveArm = new THREE.Group();
    sleeveArm.add(sleeve, sheath);
    const hand = new THREE.Group();
    hand.add(
      new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.16).translate(0, 0, -0.1), white),
      new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.06).translate(0, -0.04, -0.03), white),
      new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.16, 5).rotateX(Math.PI / 2).translate(0, 0, 0.0), white),
    );
    ctx.scene.add(sleeveArm, hand);
    const shoulder = new THREE.Vector3(CLOUD[0] - 0.4, CLOUD[1] - 0.2, CLOUD[2] + 0.4);
    const touch = ctx.effects.halo({ position: [0, top, 0], size: 1.2, opacity: 0.9, color: '#ffffff' });
    const aim = new THREE.Vector3(), tip = new THREE.Vector3(), dir = new THREE.Vector3();
    const HAND = 0.26;

    const STEP = 1.6, HOLD = 4;
    ctx.onFrame((t) => {
      const cycle = 16 * STEP + HOLD;
      const k = (t + 2 * STEP) % cycle;
      const current = Math.min(15, Math.floor(k / STEP));
      const done = k >= 16 * STEP;
      const local = (k % STEP) / STEP;
      stones.forEach((s, i) => {
        const lit = i < current || (i === current && (done || local > 0.35));
        const target = lit ? 1.2 : 0;
        s.mat.emissiveIntensity += (target - s.mat.emissiveIntensity) * 0.08;
        s.halo.material.opacity = s.mat.emissiveIntensity * 0.22;
        s.halo.scale.setScalar(0.9 + 0.1 * Math.sin(t * 2 + i));
      });
      const next = stones[Math.min(15, current + 1)].m.position;
      const glide = current < 15 ? Math.max(0, (local - 0.8) / 0.2) : 0;
      const p = aim.copy(stones[current].m.position).lerp(next, glide * glide * (3 - 2 * glide));
      p.y += 0.07;
      const lift = Math.sin(Math.min(1, glide * 1.2) * Math.PI) * 0.12;
      const reach = done ? 0 : current === 0 ? Math.min(1, local / 0.2) : current === 15 ? Math.min(1, (1 - local) / 0.2) : 1;
      p.y += lift;
      const shown = reach > 0.02;
      sleeveArm.visible = hand.visible = shown;
      dir.subVectors(p, shoulder);
      const full = dir.length();
      dir.divideScalar(full);
      tip.copy(shoulder).addScaledVector(dir, full * reach);
      sleeveArm.position.copy(shoulder);
      sleeveArm.lookAt(p);
      sleeveArm.scale.set(1, 1, Math.max(0.01, full * reach - HAND));
      hand.position.copy(tip).addScaledVector(dir, -0.08);
      hand.lookAt(p);
      touch.position.set(p.x, p.y - 0.02, p.z);
      touch.material.opacity = reach > 0.95 && glide === 0 ? 0.9 : 0;
    });

    // The brother of Jared, kneeling before the stone with his hands raised.
    person(ctx, { x: ALTAR[0] - 1.5, z: ALTAR[1] + 1.4, face: [ALTAR[0] - 0.6, ALTAR[1]], robe: '#8a6a4a', mantle: '#5a4a6a', skin: '#a87652', arms: 'out', kneel: true });

    // A sea of cloud far below the summit.
    const puffGeo = new THREE.IcosahedronGeometry(1, 0);
    const n = 700;
    const sea = new THREE.InstancedMesh(puffGeo, new THREE.MeshLambertMaterial({ color: '#f4f0ea', emissive: '#8a8a94', flatShading: true }), n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r.range(30 * 30, 520 * 520));
      const s = r.range(14, 34) * (0.6 + d / 600);
      q.setFromEuler(e.set(0, r() * 3, 0));
      m.compose(new THREE.Vector3(Math.cos(a) * d, CLOUD_Y + r.range(-4, 6), Math.sin(a) * d), q, new THREE.Vector3(s * 1.4, s * 0.35, s));
      sea.setMatrixAt(i, m);
    }
    sea.computeBoundingSphere();
    ctx.scene.add(sea);
  },
};
