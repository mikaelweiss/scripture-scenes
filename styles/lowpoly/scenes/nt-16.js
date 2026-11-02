// Matthew 14:22-33. The fourth watch of the night on Galilee, wind contrary. Christ comes walking on the sea;
// Peter has stepped out of the boat, begins to sink, and Christ stretches forth his hand. The player stands
// in the stern; a gap in the starboard rail lets you step out onto the water too. -z is the bow.
import { person, createWater, createBoat, boatColliders } from './lib/nt-13-kit.js';

const CHRIST = [4.2, -8.4];
const PETER = [3.0, -6.0];

const disciples = [
  { x: -0.6, z: -3.3, pose: 'stand', arms: 'out' },
  { x: 0.45, z: -3.0, pose: 'kneel', hood: true },
  { x: -0.85, z: -1.0, pose: 'stand' },
  { x: -0.55, z: -0.2, pose: 'kneel' },
  { x: -0.7, z: 0.9, pose: 'sit', hood: true },
  { x: -0.95, z: 1.9, pose: 'stand', hood: true },
  { x: 1.0, z: -2.2, pose: 'kneel' },
];
const robes = ['#6b5a48', '#4f5a62', '#7b5f45', '#5d4a3a', '#62584a', '#4a5560', '#6d5a48'];

export default {
  title: 'Matthew 14:22-33: Walking on water',
  seed: 16,
  fov: 64,
  exposure: 1.1,

  sun: { direction: [-0.35, 0.3, -0.88], color: '#a9c0ea', intensity: 1.3 },
  light: { sky: '#4e6290', ground: '#141c28', hemi: 1.2 },
  sky: { top: '#03060d', horizon: '#1d2c46', ground: '#0c121c', sunColor: '#dfe8ff', glow: 0.55 },
  fog: { color: '#34465f', near: 30, far: 380 },
  clouds: { count: 70, seed: 16, shadow: '#0c111c', lit: '#2c3a54', rim: '#b8c8e8', distance: [180, 800], altitude: [60, 180], hole: 0.12 },
  mountains: { count: 40, color: '#141a24', radius: [520, 740], height: [40, 100], haze: 0.35 },
  bloom: { strength: 0.8, radius: 0.6, threshold: 0.7 },
  grade: { saturation: 0.9, contrast: 1.08, vignette: 0.5, shadowTint: '#101a38', highlightTint: '#e8f0ff' },
  shadow: { center: [2, -6], radius: 22 },

  player: { start: [0.5, 0.9], yaw: -0.5, pitch: 0.0, eye: 1.65, speed: 3 },

  terrain: {
    size: 1400,
    segments: 150,
    seed: 16,
    hills: 70,
    bumps: 0.3,
    flats: [{ x: 0, z: 0, r: 280, falloff: 140, height: -14 }],
    colors: { ground: '#2c3428', groundAlt: '#323628', grass: '#2e3a2a', high: '#3a3a36', rock: '#34302c' },
  },

  custom(ctx) {
    const { THREE, scene } = ctx;
    const water = createWater(ctx, { radius: 900, color: '#2c4a66', foam: '#9fb6d0', emissive: '#08121e', amp: 0.75, minAmp: 0.75 });
    ctx.colliders.add({ x: 0, z: 0, w: 260, d: 260, bottom: -20, top: 0 });

    const boat = createBoat(ctx, { len: 9, beam: 2.8, seed: 16, sail: '#a89c84' });
    scene.add(boat.group);
    boatColliders(ctx, { x: 0, z: 0, boat, railTop: 1.4, gapSide: 1, gap: [-3.6, -1.6] });
    const deck = boat.deckY;
    disciples.forEach((d, i) => {
      person(ctx, { ...d, y: deck, parent: boat.group, face: PETER, robe: robes[i], mantle: i % 2 ? '#3a3026' : undefined, skin: '#8a5a3c' });
      ctx.colliders.add({ x: d.x, z: d.z, w: 0.6, d: 0.6, bottom: deck, top: deck + 1.8 });
    });
    const lantern = new THREE.PointLight('#ffb060', 6, 9, 1.6);
    lantern.position.set(0.12, deck + 2.3, -1.5);
    boat.group.add(lantern);
    const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: '#ffc070', toneMapped: false }));
    lamp.position.copy(lantern.position);
    boat.group.add(lamp);

    const christ = person(ctx, {
      x: CHRIST[0], z: CHRIST[1], y: 0, face: PETER, robe: '#fbf7ee', mantle: '#ece4d2', skin: '#a8754f', arms: 'out', emissive: 0.38, scale: 1.1,
      light: { color: '#f2f0ff', intensity: 40, distance: 26 },
      halo: { size: 4.2, opacity: 0.38, color: '#f4f2ff' },
    });
    ctx.effects.ring({ position: [CHRIST[0], 0.15, CHRIST[1]], radius: 1.4, width: 0.8, color: '#dfe6ff', opacity: 0.35 });
    const peter = person(ctx, { x: PETER[0], z: PETER[1], y: -0.75, face: CHRIST, robe: '#6e5a44', mantle: '#4a3a2c', skin: '#9b6a46', arms: 'out', collide: false });

    const stars = new THREE.BufferGeometry();
    const sp = [];
    for (let i = 0; i < 1400; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2;
      const y = Math.abs(u) * 0.9 + 0.08;
      const rr = Math.sqrt(1 - y * y);
      sp.push(Math.cos(a) * rr * 1300, y * 1300, Math.sin(a) * rr * 1300);
    }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const starPoints = new THREE.Points(stars, new THREE.PointsMaterial({ color: '#dfe6ff', size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
    starPoints.renderOrder = -9;
    scene.add(starPoints);

    ctx.onFrame((t, dt, camera) => {
      starPoints.position.copy(camera.position);
      christ.position.y = water.waveAt(CHRIST[0], CHRIST[1], t) * 0.5 + 0.05;
      peter.position.y = water.waveAt(PETER[0], PETER[1], t) - 0.75 + Math.sin(t * 0.8) * 0.06;
      const swell = water.waveAt(0, 0, t);
      const roll = Math.sin(t * 1.1) * 0.035 + (water.waveAt(1.4, 0, t) - water.waveAt(-1.4, 0, t)) * 0.03;
      const pitch = (water.waveAt(0, -4, t) - water.waveAt(0, 4, t)) * 0.04;
      boat.group.position.y = swell * 0.5;
      boat.group.rotation.z = roll;
      boat.group.rotation.x = pitch;
      const p = camera.position;
      if (Math.abs(p.x) < 1.6 && Math.abs(p.z) < 4.6) {
        p.y += swell * 0.5;
        camera.rotation.z += roll * 0.7;
      } else p.y += water.waveAt(p.x, p.z, t) * 0.4;
    });
  },
};
