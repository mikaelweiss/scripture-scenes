// Ezekiel 37: the valley full of very dry bones. Near Ezekiel they lie scattered; farther on they have come
// together bone to his bone; beyond, breath has entered them and they stand, an exceeding great army. -z is north.
import { rng } from '../engine/util.js';

const EZEKIEL = [4.5, 5];
const bone = '#e2d8c0';

export default {
  title: 'Ezekiel 37:1-10: The valley of dry bones',
  seed: 44,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.25, 0.4, -0.85], color: '#ffe2b8', intensity: 2.4 },
  light: { sky: '#a8b0c8', ground: '#6a5a48', hemi: 1.0 },
  sky: { top: '#4a5878', horizon: '#e8c8a0', ground: '#c0a888', sunColor: '#fff0c8', glow: 1.3 },
  fog: { color: '#d4bc9c', near: 60, far: 420 },
  clouds: { count: 70, shadow: '#5a5868', lit: '#f0d0a8', rim: '#fff4dc', distance: [220, 900], altitude: [90, 240], hole: 0.25 },
  mountains: { count: 40, color: '#8a7a6c', radius: [480, 720], height: [60, 150], haze: 0.55 },
  bloom: { strength: 0.55, radius: 0.55, threshold: 0.84 },
  grade: { saturation: 1.0, contrast: 1.06, vignette: 0.45, shadowTint: '#2e2a48', highlightTint: '#ffe8c8' },
  shadow: { center: [0, -20], radius: 70 },

  player: { start: [0, 14], yaw: 0.02, pitch: -0.03, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000, segments: 180, seed: 44, hills: 70, hillScale: 0.008, bumps: 0.4,
    flats: [{ x: 0, z: -30, r: 70, falloff: 90, height: 0 }],
    colors: { ground: '#b8a282', groundAlt: '#a89070', grass: '#8a845a', high: '#9a8668', rock: '#7e6c58' },
    patches: [{ x: 0, z: 0, r: 40, color: '#c8b494', strength: 0.5, rough: 0.5 }],
  },

  objects: [
  ],

  scatter: [
    { type: 'rock', count: 50, center: [0, -30], ring: [60, 220], spacing: 10, seed: 3, props: { color: '#8a7a66' } },
    { type: 'tree', count: 12, center: [0, -30], ring: [90, 200], spacing: 12, seed: 4, props: { kind: 'burnt' } },
  ],

  crowd: {
    palette: {
      robes: ['#6a5a44', '#7a4a34', '#5a5a48', '#8a7454', '#4a4a52', '#7a6a50', '#6a3a2a'],
      mantles: ['#4a3a2a', '#8a6a3a', '#3a3e48', '#a08a62'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'],
      mantleChance: 0.7,
      hoodChance: 0.2,
    },
    groups: [
      { count: 1700, center: [0, -82], ring: [0, 44], arc: [Math.PI * 0.05, Math.PI * 1.95], spacing: 1.05, face: EZEKIEL, children: 0, seed: 9 },
    ],
  },

  figures: [
    { x: EZEKIEL[0], z: EZEKIEL[1], face: [0, -80], scale: 1.05, robe: '#6a5a7a', mantle: '#c8b48e', skin: '#9b6a46', arms: 'out' },
  ],

  custom(ctx) {
    const { THREE, scene, heightAt } = ctx;
    const rand = rng(44);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
    const mat = new THREE.MeshLambertMaterial({ color: bone, emissive: '#6a5e4a', flatShading: true });

    // Scattered bones across the near valley floor.
    const loose = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 1, 5), mat, 3200);
    for (let i = 0; i < loose.count; i++) {
      const x = rand.range(-45, 45), z = rand.range(-30, 10);
      p.set(x, heightAt(x, z) + 0.05, z);
      q.setFromEuler(e.set(Math.PI / 2 + rand.range(-0.1, 0.1), rand() * Math.PI * 2, 0, 'YXZ'));
      s.set(1, rand.range(0.3, 0.8), 1);
      loose.setMatrixAt(i, m.compose(p, q, s));
    }
    const skulls = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.14, 0).scale(1, 0.9, 1.2), mat, 420);
    for (let i = 0; i < skulls.count; i++) {
      const x = rand.range(-45, 45), z = rand.range(-50, 10);
      p.set(x, heightAt(x, z) + 0.1, z);
      q.setFromEuler(e.set(rand.range(-0.5, 0.5), rand() * 6, rand.range(-0.5, 0.5)));
      skulls.setMatrixAt(i, m.compose(p, q, s.set(1, 1, 1)));
    }

    // Skeletons assembled bone to his bone, rising from the ground toward the army.
    const parts = [];
    const add = (g) => parts.push(g.toNonIndexed());
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 4).translate(0, 1.12, 0));
    add(new THREE.IcosahedronGeometry(0.12, 0).translate(0, 1.56, 0));
    for (let r = 0; r < 4; r++) add(new THREE.TorusGeometry(0.14 - r * 0.012, 0.018, 3, 8, Math.PI * 1.6).rotateX(Math.PI / 2).rotateY(Math.PI * 1.3).translate(0, 1.36 - r * 0.08, 0.02));
    add(new THREE.BoxGeometry(0.3, 0.08, 0.12).translate(0, 0.86, 0));
    for (const sx of [-1, 1]) {
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.82, 4).translate(sx * 0.1, 0.42, 0));
      add(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 4).rotateZ(sx * 0.12).translate(sx * 0.2, 1.12, 0));
    }
    const skelGeo = mergeParts(THREE, parts);
    const skeletons = new THREE.InstancedMesh(skelGeo, mat, 420);
    for (let i = 0; i < skeletons.count; i++) {
      const x = rand.range(-40, 40), z = rand.range(-40, -12);
      const rise = Math.min(1, Math.max(0, (-z - 14) / 24));
      const lie = (1 - rise) * (Math.PI / 2) * rand.range(0.7, 1.05);
      p.set(x, heightAt(x, z) + (lie > 1 ? 0.12 : 0), z);
      q.setFromEuler(e.set(-lie, Math.atan2(EZEKIEL[0] - x, EZEKIEL[1] - z) + rand.range(-0.4, 0.4), 0, 'YXZ'));
      skeletons.setMatrixAt(i, m.compose(p, q, s.set(1, 1, 1)));
    }
    // Sinew and flesh coming upon those nearest the living.
    const sinew = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.24, 1.3, 6).translate(0, 0.65, 0), new THREE.MeshLambertMaterial({ color: '#a8705a', flatShading: true }), 160);
    for (let i = 0; i < sinew.count; i++) {
      const x = rand.range(-36, 36), z = rand.range(-44, -36);
      p.set(x, heightAt(x, z), z);
      q.setFromEuler(e.set(0, rand() * 6, 0));
      sinew.setMatrixAt(i, m.compose(p, q, s.set(1, rand.range(0.9, 1.1), 1)));
    }
    for (const mesh of [loose, skulls, skeletons, sinew]) {
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      scene.add(mesh);
    }

    // Spears raised among the standing army.
    const spears = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.025, 2.8, 4).translate(0, 1.4, 0), new THREE.MeshLambertMaterial({ color: '#5a4430' }), 500);
    for (let i = 0; i < spears.count; i++) {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 42;
      const x = Math.cos(a) * d, z = -82 + Math.sin(a) * d;
      p.set(x + 0.3, heightAt(x, z), z);
      q.setFromEuler(e.set(rand.range(-0.08, 0.08), 0, rand.range(-0.08, 0.08)));
      spears.setMatrixAt(i, m.compose(p, q, s.set(1, 1, 1)));
    }
    scene.add(spears);

    // The breath from the four winds sweeping over the valley.
    ctx.effects.sunShafts({ center: [0, -90], sunDir: [0.25, 0.4, -0.85], count: 8, spread: 70, length: 420, width: [12, 28], opacity: 0.09 });
    const wind = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: '#fff6e0', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }), 600);
    const seeds = Array.from({ length: wind.count }, () => [rand() * Math.PI * 2, rand.range(4, 70), rand.range(0.5, 8), rand.range(0.05, 0.2)]);
    wind.frustumCulled = false;
    scene.add(wind);
    ctx.onFrame((t) => {
      seeds.forEach(([a, r, y, sp], i) => {
        const ang = a + t * sp;
        p.set(Math.cos(ang) * r, y + Math.sin(t * 0.7 + a * 3) * 0.6, -45 + Math.sin(ang) * r * 0.8);
        wind.setMatrixAt(i, m.compose(p, q.identity(), s.set(1, 1, 1)));
      });
      wind.instanceMatrix.needsUpdate = true;
    });

  },
};

function mergeParts(THREE, parts) {
  let count = 0;
  for (const g of parts) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o);
    o += g.attributes.position.array.length;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
