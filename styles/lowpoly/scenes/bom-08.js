// 1 Nephi 18:8-23: four days of tempest. Laman and Lemuel have bound Nephi to the mast, the compass has ceased
// to work, and Lehi and Sariah lie sick upon their beds. The player stands on the stern deck of the rolling ship.
import { ocean, rain, lightning } from './lib/bom-07-sea.js';
import { buildShip, placeColliders } from './lib/bom-07-ship.js';
import { placeCrowd, createCrowd, createFigure } from '../engine/crowd.js';

const RIDE = -1.4;
const L = 30;
const MAST_Z = -L * 0.08;

export default {
  title: '1 Nephi 18:8-23: The storm at sea',
  seed: 8,
  fov: 64,
  exposure: 1.0,

  sun: { direction: [0.3, 0.8, -0.4], color: '#a8b8d0', intensity: 1.8 },
  light: { sky: '#8a9ab6', ground: '#3a4450', hemi: 2.0 },
  sky: { top: '#141a24', horizon: '#3e4a5a', ground: '#232c38', sunColor: '#4a5668', glow: 0.2 },
  fog: { color: '#3a4656', near: 25, far: 260 },
  clouds: { count: 160, shadow: '#1c2028', lit: '#4e5868', rim: '#6a7484', distance: [180, 620], altitude: [80, 150], hole: 0 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.8 },
  grade: { saturation: 0.8, contrast: 1.1, vignette: 0.55, shadowTint: '#1a2440', highlightTint: '#d8e4ff' },
  shadow: { center: [0, 0], radius: 25 },

  player: { start: [0.9, 12.5], yaw: 0.03, pitch: -0.02, eye: 1.65, speed: 3.2 },

  terrain: {
    size: 1100,
    segments: 40,
    seed: 2,
    hills: 0,
    bumps: 0,
    flats: [{ x: 0, z: 0, r: 2000, falloff: 10, height: -40 }],
    colors: { ground: '#1a2a34', groundAlt: '#1a2a34', grass: '#1a2a34', rock: '#1a2a34' },
  },

  custom(ctx) {
    const { THREE, scene, rand } = ctx;
    ocean(ctx, { level: 0, size: 900, segments: 220, color: '#2c4a5a', deep: '#0f2230', crest: '#c8d4dc', amp: 1.3, freq: 0.055, chop: 1.2, speed: 1.3 });
    rain(ctx, { count: 6000, box: 70, height: 34, speed: 30, slant: [9, 4], color: '#c0ccd8', opacity: 0.4 });
    lightning(ctx, { every: [2.5, 6], distance: [140, 280], fogFlash: '#8c96b0' });

    const ship = new THREE.Group();
    ship.position.y = RIDE;
    scene.add(ship);
    const { mesh, colliders, shape } = buildShip({ length: L, beam: 8, depth: 4.6, built: 1, sail: 'furled', rand, hullColor: '#6a4a30', plankAlt: '#7a5636', deckColor: '#8a6a48' });
    ship.add(mesh);
    placeColliders(ctx, colliders, { y: RIDE });
    const deck = (z) => shape.deckY(z);

    const lit = (c) => new THREE.MeshLambertMaterial({ color: c });
    const bed = (x, z) => {
      const y = deck(z);
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 2.2), lit('#8a7458'));
      b.position.set(x, y + 0.15, z);
      ship.add(b);
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 1.5), lit('#6e5a7a'));
      blanket.position.set(x, y + 0.42, z + 0.3);
      ship.add(blanket);
      ctx.colliders.add({ x, z, w: 1.1, d: 2.2, bottom: y + RIDE, top: y + RIDE + 0.6 });
    };
    const lying = (x, z, robe) => {
      const f = createFigure({ x: 0, y: 0, z: 0, robe, mantle: '#c8c0b0', skin: '#a07050', hood: true });
      f.rotation.set(-Math.PI / 2, 0, 0);
      f.position.set(x, deck(z) + 0.42, z + 0.9);
      ship.add(f);
    };
    bed(-2.1, 4.5);
    bed(2.1, 4.5);
    lying(-2.1, 4.5, '#d8d0c0');
    lying(2.1, 4.5, '#8a6a7a');
    const my = deck(MAST_Z);
    const nephi = createFigure({ x: 0, y: my, z: MAST_Z + 0.42, face: [0, 20], robe: '#9a6a44', mantle: '#6a4a30', skin: '#9b6a46', arms: 'down' });
    ship.add(nephi);
    const rope = lit('#b8a070');
    for (const h of [0.45, 0.85, 1.25]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 4, 10), rope);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, my + h, MAST_Z + 0.2);
      ship.add(ring);
    }
    ctx.colliders.add({ x: 0, z: MAST_Z + 0.4, w: 1, d: 1, bottom: my + RIDE, top: my + RIDE + 2 });

    const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: '#ffc070', toneMapped: false }));
    lamp.position.set(0, my + 2.6, MAST_Z + 0.45);
    ship.add(lamp);
    const lampLight = new THREE.PointLight('#ffb060', 14, 16, 1.4);
    lampLight.position.set(0, my + 2.5, MAST_Z + 0.9);
    ship.add(lampLight);
    ctx.onFrame((t) => (lampLight.intensity = 14 * (0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3))));
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.6), lit('#5a3b26'));
    stand.position.set(1.4, my + 0.35, MAST_Z + 2.2);
    ship.add(stand);
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), new THREE.MeshLambertMaterial({ color: '#a8823a', flatShading: true }));
    ball.position.set(1.4, my + 0.92, MAST_Z + 2.2);
    ship.add(ball);
    for (const s of [-1, 1]) {
      const spindle = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.22, 4), lit('#6a5a40'));
      spindle.position.set(1.4 + s * 0.08, my + 1.18, MAST_Z + 2.2);
      spindle.rotation.z = s * 0.4;
      ship.add(spindle);
    }

    const palette = {
      robes: ['#6b5a48', '#7a5a42', '#5a4a3c', '#8a7058', '#4f4a5b', '#6e3a2a', '#6b6f4a', '#9a8a72'],
      mantles: ['#3f2a20', '#4a3a2c', '#2f2a3a', '#5a4632', '#3a4048'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#b5835e'],
      mantleChance: 0.7,
      hoodChance: 0.7,
    };
    const toLocal = (x, z) => deck(z);
    const people = placeCrowd([
      { palette, count: 5, points: [[-1.1, MAST_Z + 1.6], [-1.6, MAST_Z + 2.3], [-0.6, MAST_Z + 2.5], [0.5, MAST_Z + 2.9], [-2.2, MAST_Z + 1.2]], face: [0, MAST_Z], children: 0.6, kneel: 0.8, seed: 81 },
      { palette, count: 3, points: [[2.3, MAST_Z - 1.6], [2.9, MAST_Z - 0.4], [-2.6, MAST_Z - 2.2]], face: [0, MAST_Z], children: 0, seed: 82 },
      { palette, count: 8, points: [[-3, 2.6], [-1.0, 2.9], [2.9, 2.4], [1.0, 3.0], [-0.9, 6.6], [2.8, 6.8], [-1, -9], [1.2, -10.5]], face: [0, 4.5], children: 0.3, kneel: 0.5, seed: 83 },
      { palette, count: 4, points: [[-2.4, -6], [2.2, -5.5], [-1.5, -12], [2.5, -13]], face: [0, -20], children: 0.2, seed: 84 },
    ], toLocal, toLocal);
    const time = { value: 0 };
    ship.add(createCrowd(people, time));
    for (const p of people) ctx.colliders.add({ x: p.x, z: p.z, w: 0.5, d: 0.5, bottom: p.y + RIDE, top: p.y + RIDE + 1.6 });
    for (const [x, z] of [[-2.8, -3], [2.9, -2], [-2.6, 2], [2.4, 1]]) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.8, 7), lit('#9a5a36'));
      jar.position.set(x, deck(z) + 0.4, z);
      ship.add(jar);
      ctx.colliders.add({ x, z, w: 0.6, d: 0.6, bottom: deck(z) + RIDE, top: deck(z) + RIDE + 0.8 });
    }

    const rest = new THREE.Matrix4().makeTranslation(0, RIDE, 0);
    const restInv = rest.clone().invert();
    const motion = new THREE.Matrix4();
    const shipQ = new THREE.Quaternion();
    ctx.onFrame((t, dt, camera) => {
      time.value = t;
      ship.rotation.set(0.05 * Math.sin(t * 0.55) + 0.02 * Math.sin(t * 1.3), 0, 0.1 * Math.sin(t * 0.7 + 1) + 0.03 * Math.sin(t * 1.7));
      ship.position.y = RIDE + 0.45 * Math.sin(t * 0.8) + 0.15 * Math.sin(t * 1.9);
      ship.updateMatrix();
      motion.multiplyMatrices(ship.matrix, restInv);
      camera.position.applyMatrix4(motion);
      shipQ.setFromEuler(ship.rotation);
      camera.quaternion.premultiply(shipQ);
    });
  },
};
