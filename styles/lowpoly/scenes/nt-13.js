// Mark 4:35-41. Evening on the Sea of Galilee: a great storm, Christ rises in the stern and says
// "Peace, be still", and the calm spreads out from the boat. The player stands on the deck, -z is the bow.
import { person, createWater, createRain, createBoat, boatColliders, skyUniforms } from './lib/nt-13-kit.js';

const robes = ['#7b5f45', '#5f6b72', '#8c6f4e', '#6d5a48', '#4f5a62', '#94704e', '#5d4a3a'];
const mantles = ['#4a3a2c', '#3e4a52', '#6a4a34', '#55483a'];
const skins = ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31'];

const disciples = [
  { x: -0.75, z: -2.7, pose: 'kneel', hood: true },
  { x: 0.55, z: -3.0, pose: 'stand', arms: 'out' },
  { x: 0.05, z: -3.7, pose: 'kneel', hood: true },
  { x: -0.85, z: 0.9, pose: 'kneel' },
  { x: 1.0, z: 1.2, pose: 'sit', hood: true },
  { x: 0.95, z: -2.0, pose: 'kneel' },
  { x: -0.95, z: -1.6, pose: 'sit' },
];

const STORM = { top: '#151c26', horizon: '#46535e', fog: '#6b7a84', hemi: 1.5, sun: 1.3 };
const CALM = { top: '#4a6a98', horizon: '#eab98a', fog: '#d2ad92', hemi: 1.4, sun: 2.6 };

export default {
  title: 'Mark 4:35-41: Calming the storm',
  seed: 13,
  fov: 66,
  exposure: 1.0,

  sun: { direction: [0.25, 0.22, -0.95], color: '#ffd2a0', intensity: STORM.sun },
  light: { sky: '#6d7c8a', ground: '#1e2a30', hemi: STORM.hemi },
  sky: { top: STORM.top, horizon: STORM.horizon, ground: '#22292e', sunColor: '#ffd8a8', glow: 0.7 },
  fog: { color: STORM.fog, near: 25, far: 420 },
  clouds: { count: 150, seed: 13, shadow: '#1b2028', lit: '#55606a', rim: '#e8d0b0', distance: [90, 800], altitude: [45, 150], hole: 0.05 },
  mountains: { count: 40, color: '#2f3434', radius: [560, 760], height: [50, 120], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 0.95, contrast: 1.1, vignette: 0.5, shadowTint: '#1a2433', highlightTint: '#ffe6c8' },
  shadow: { center: [0, 0], radius: 20 },

  player: { start: [0.0, 3.0], yaw: 0.04, pitch: -0.02, eye: 1.65, speed: 2.5 },

  terrain: {
    size: 1500,
    segments: 160,
    seed: 41,
    hills: 80,
    bumps: 0.4,
    flats: [{ x: 0, z: 0, r: 300, falloff: 140, height: -14 }],
    colors: { ground: '#4d5a3a', groundAlt: '#5a5a40', grass: '#55663e', high: '#6a6650', rock: '#5a5248' },
  },

  custom(ctx) {
    const { THREE, scene } = ctx;
    const water = createWater(ctx, { radius: 900, color: '#47717a', foam: '#d4e0e2', emissive: '#0d2026', amp: 2.4, minAmp: 0.04, calmR: -60, calmFade: 34 });
    const rain = createRain(ctx, { opacity: 0.42, wind: [7, 2] });

    const boat = createBoat(ctx, { len: 9, beam: 2.8, seed: 13 });
    scene.add(boat.group);
    boatColliders(ctx, { x: 0, z: 0, boat, railTop: 1.4 });
    const deck = boat.deckY;
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.4), new THREE.MeshLambertMaterial({ color: '#b89a6e' }));
    pillow.position.set(0.45, deck + 0.09, 3.6);
    boat.group.add(pillow);

    disciples.forEach((d, i) => {
      person(ctx, {
        ...d, y: deck, parent: boat.group, face: [0.25, -0.4],
        robe: robes[i % robes.length], mantle: mantles[i % mantles.length], skin: skins[i % skins.length],
      });
      ctx.colliders.add({ x: d.x, z: d.z, w: 0.6, d: 0.6, bottom: deck, top: deck + 1.8 });
    });
    person(ctx, {
      x: 0.25, z: -0.4, y: deck, parent: boat.group, face: [8, 3.5], robe: '#f6f1e6', mantle: '#ece3d0', skin: '#a8754f', arms: 'out', emissive: 0.35, scale: 1.05,
      light: { color: '#fff0d0', intensity: 14, distance: 14 },
      halo: { size: 3.2, opacity: 0.45, color: '#fff3d6' },
    });
    ctx.colliders.add({ x: 0.25, z: -0.4, w: 0.6, d: 0.6, bottom: deck, top: deck + 1.9 });

    const others = [[-34, -52, 0.6], [46, -88, -0.4], [-70, 30, 1.2]].map(([x, z, rot], i) => {
      const b = createBoat(ctx, { len: 7.5, beam: 2.4, seed: 30 + i, sail: '#c9b896' });
      b.group.position.set(x, 0, z);
      b.group.rotation.y = rot;
      scene.add(b.group);
      for (const lz of [-1.5, 0.8]) person(ctx, { x: 0, z: lz, y: b.deckY, parent: b.group, pose: 'kneel', yaw: 0.4, robe: robes[i + 2], hood: true, skin: skins[i] });
      return { b, x, z };
    });

    const flash = new THREE.DirectionalLight('#cfe0ff', 0);
    flash.position.set(-40, 120, -80);
    scene.add(flash);

    const sky = skyUniforms(scene);
    let hemi, sun, clouds;
    scene.traverse((o) => {
      if (o.isHemisphereLight) hemi = o;
      if (o.isDirectionalLight && o.castShadow) sun = o;
      if (o.renderOrder === -5 && o.isMesh) clouds = o;
    });
    const col = { top: [new THREE.Color(STORM.top), new THREE.Color(CALM.top)], horizon: [new THREE.Color(STORM.horizon), new THREE.Color(CALM.horizon)], fog: [new THREE.Color(STORM.fog), new THREE.Color(CALM.fog)] };
    const cloudBright = new THREE.Color('#ffffff'), cloudCalm = new THREE.Color(2.1, 1.6, 1.4);
    let nextFlash = 2.2, flashT = -1;

    ctx.onFrame((t, dt, camera) => {
      const calmR = t < 3 ? -60 : Math.pow(t - 3, 1.5) * 2.6;
      water.uniforms.uCalmR.value = calmR;
      const calm = THREE.MathUtils.smoothstep(t, 7, 32);
      rain.uniforms.uOpacity.value = 0.42 * (1 - THREE.MathUtils.smoothstep(t, 4, 14));
      if (sky) {
        sky.uTop.value.lerpColors(col.top[0], col.top[1], calm);
        sky.uHorizon.value.lerpColors(col.horizon[0], col.horizon[1], calm);
      }
      scene.fog.color.lerpColors(col.fog[0], col.fog[1], calm);
      scene.fog.far = 420 + calm * 400;
      if (hemi) hemi.intensity = STORM.hemi + (CALM.hemi - STORM.hemi) * calm;
      if (sun) sun.intensity = STORM.sun + (CALM.sun - STORM.sun) * calm;
      if (clouds) clouds.material.color.lerpColors(cloudBright, cloudCalm, calm);

      if (t > nextFlash && calm < 0.2) {
        flashT = t;
        nextFlash = t + 3 + Math.random() * 4;
      }
      const f = t - flashT;
      flash.intensity = f >= 0 && f < 0.35 ? (f < 0.08 || (f > 0.16 && f < 0.24) ? 5 : 1) : 0;

      const swell = water.waveAt(0, 0, t);
      const roll = (Math.sin(t * 1.3) * 0.06 + Math.sin(t * 0.7) * 0.03) * (1 - calm * 0.9) + water.waveAt(1.4, 0, t) * 0.02 - water.waveAt(-1.4, 0, t) * 0.02;
      const pitch = (water.waveAt(0, -4, t) - water.waveAt(0, 4, t)) * 0.06;
      boat.group.position.y = swell * 0.6;
      boat.group.rotation.z = roll;
      boat.group.rotation.x = pitch;
      camera.position.y += swell * 0.6;
      camera.rotation.z += roll * 0.7;
      for (const o of others) {
        o.b.group.position.y = water.waveAt(o.x, o.z, t) * 0.7;
        o.b.group.rotation.z = Math.sin(t * 1.1 + o.x) * 0.1 * (1 - calm * 0.9);
      }
    });
  },
};
