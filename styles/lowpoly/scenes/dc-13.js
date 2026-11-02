// D&C 136: Winter Quarters, January 1847. Rows of log cabins and parked wagons on the west bank of the
// Missouri (to the east, +x) under light snow, smoke rising from every chimney.
import { cabin, people, palettes, wagon, beast, water, snowfall } from './lib/dc-08-kit.js';

// Center line of the Missouri channel.
const riverX = (z) => 118 + Math.sin(z * 0.006) * 12;
const river = Array.from({ length: 60 }, (_, i) => {
  const z = -440 + i * 15;
  return { x: riverX(z), z, r: 24, falloff: 9, height: -4 };
});
const WATER_Y = -1.7;
const STREETS = [-36, 0, 36];
const ROWS = Array.from({ length: 12 }, (_, i) => 40 - i * 12);

export default {
  title: 'D&C 136: Winter Quarters',
  seed: 136,
  fov: 62,
  exposure: 1.05,

  sun: { direction: [0.35, 0.55, 0.55], color: '#e8eef8', intensity: 1.3 },
  light: { sky: '#d0d8e6', ground: '#9a9aa2', hemi: 1.35 },
  sky: { top: '#8a98ae', horizon: '#d6dce4', ground: '#e6eaee', sunColor: '#f0f4ff', glow: 0.3 },
  fog: { color: '#c8d0da', near: 50, far: 420 },
  clouds: { count: 70, shadow: '#9aa2b0', lit: '#e6eaf0', rim: '#f4f6fa', distance: [200, 800], altitude: [70, 150], hole: 0.02 },
  bloom: { strength: 0.25, radius: 0.5, threshold: 0.92 },
  grade: { saturation: 0.85, contrast: 1.05, vignette: 0.4, shadowTint: '#28304a', highlightTint: '#f0f4ff' },
  shadow: { center: [0, 0], radius: 80 },

  player: { start: [68, 50], yaw: -0.3, pitch: -0.1, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1200, segments: 220, seed: 47, hills: 26, hillScale: 0.006, bumps: 0.3,
    flats: [{ x: 0, z: -30, r: 120, falloff: 50, height: 2 }, { x: 68, z: 50, r: 5, falloff: 24, height: 7 }, ...river],
    colors: { ground: '#e8ecf0', groundAlt: '#dde3ea', grass: '#e2e6ec', high: '#eef2f6', rock: '#9a958e' },
    patches: [
      ...river.flatMap((f) => [-1, 1].map((s) => ({ x: f.x + s * 29, z: f.z, r: 7, color: '#6e6258', strength: 0.75, rough: 0.5 }))),
      ...STREETS.flatMap((x) => Array.from({ length: 18 }, (_, i) => ({ x, z: 60 - i * 10, r: 5, color: '#b0a89e', strength: 0.7, rough: 0.5 }))),
    ],
  },

  scatter: [
    { type: 'tree', count: 90, center: [riverX(0) + 70, -40], ring: [0, 70], spacing: 6, seed: 3, avoid: [{ rect: [riverX(0), 0, 75, 900] }], props: { kind: 'burnt', h: 14 } },
    { type: 'tree', count: 30, center: [riverX(0) - 42, -120], ring: [0, 60], spacing: 6, seed: 7, avoid: [{ rect: [riverX(0), 0, 75, 900] }, { rect: [0, -40, 140, 230] }], props: { kind: 'burnt', h: 12 } },
    { type: 'tree', count: 80, center: [-200, -40], ring: [40, 220], spacing: 9, seed: 4, avoid: [{ rect: [0, -40, 140, 230] }], props: { kind: 'burnt', h: 12 } },
    { type: 'tree', count: 50, center: [-160, -150], ring: [0, 120], spacing: 8, seed: 5, avoid: [{ rect: [0, -40, 140, 230] }], props: { kind: 'broad', leaf: '#3e5040', h: 9 } },
  ],

  custom(ctx) {
    const { rand } = ctx;
    water(ctx, { x: riverX(0), z: 0, w: 90, d: 900, y: WATER_Y, color: '#40596a', seg: 60, amp: 0.04, opacity: 1 });
    // Shelf ice along both banks and floes drifting in the open channel.
    for (let z = -440; z < 440; z += 3) {
      for (const s of [-1, 1]) {
        const w = rand.range(4, 8);
        ctx.solid.box(w, 0.25, rand.range(3, 5), { position: [riverX(z) + s * (24 - w / 2 + rand.range(0, 2)), WATER_Y + 0.08, z], rotation: [0, rand.range(-0.2, 0.2), 0], color: rand.pick(['#e8eef3', '#dbe5ec', '#f2f6f8']), jitter: 0.05 });
      }
    }
    for (let i = 0; i < 260; i++) {
      const z = rand.range(-440, 440), x = riverX(z) + rand.range(-15, 15);
      ctx.solid.box(rand.range(1.5, 5), 0.22, rand.range(1.2, 4), { position: [x, WATER_Y + 0.06, z], rotation: [0, rand() * 3, 0], color: rand.pick(['#e6edf2', '#d4e0e8', '#f0f4f6']), jitter: 0.06 });
    }

    // Trampled muddy lanes between the rows.

    ROWS.forEach((z, r) => {
      for (const sx of STREETS) {
        for (const side of [-1, 1]) {
          if (rand() < 0.12) continue;
          const x = sx + side * 10;
          if (rand() < 0.25) {
            wagon(ctx, { x, z: z + rand.range(-2, 2), rot: rand.range(-0.4, 0.4) + (side > 0 ? 0.3 : -0.3), cover: rand.pick(['#e8e4da', '#dcd6c8']) });
            continue;
          }
          cabin(ctx, { x, z, rot: side > 0 ? Math.PI / 2 : -Math.PI / 2, w: rand.range(4.5, 6), d: rand.range(4, 4.6), h: rand.range(2.2, 2.6), snow: true, log: rand.pick(['#6a5038', '#5e4632', '#735a40']), roof: '#6a5a4a', smoke: (r + Math.round(x)) % 3 === 0 });
        }
      }
    });

    // Oxen and wagons gathered at the north end for the spring march.
    for (let i = 0; i < 8; i++) {
      const x = -60 + i * 14, z = -128 + rand.range(-3, 3);
      wagon(ctx, { x, z, rot: rand.range(-0.2, 0.2) + Math.PI / 2, cover: '#e8e4da' });
    }
    for (let i = 0; i < 18; i++) {
      const x = rand.range(-70, -40), z = rand.range(-110, -70);
      beast(ctx, { x, z, rot: rand() * 6, kind: 'ox', color: rand.pick(['#6a4a32', '#4e3e32', '#7a5a3c', '#3a302a']) });
    }
    for (let x = -76; x <= -34; x += 2.4) for (const z of [-114, -66]) ctx.solid.box(0.12, 1.2, 0.12, { position: [x, ctx.heightAt(x, z) + 0.5, z], color: '#5a4a3a' });
    for (let z = -114; z <= -66; z += 2.4) for (const x of [-76, -34]) ctx.solid.box(0.12, 1.2, 0.12, { position: [x, ctx.heightAt(x, z) + 0.5, z], color: '#5a4a3a' });

    // Woodpiles and a fire where men are cutting wood.
    for (let i = 0; i < 10; i++) {
      const x = STREETS[i % 3] + rand.range(-3, 3), z = rand.range(-100, 30);
      for (let k = 0; k < 6; k++) ctx.solid.add(new ctx.THREE.CylinderGeometry(0.12, 0.12, 1.4, 6).rotateZ(Math.PI / 2), { position: [x + 4.5, ctx.heightAt(x, z) + 0.12 + (k % 3) * 0.22, z + Math.floor(k / 3) * 0.26], rotation: [0, rand.range(-0.1, 0.1), 0], color: '#7a6048', jitter: 0.08 });
    }
    const fx = 0, fz = 16, fy = ctx.heightAt(fx, fz);
    for (let k = 0; k < 5; k++) ctx.glow.add(new ctx.THREE.ConeGeometry(0.22, 0.9, 4), { position: [fx + rand.range(-0.3, 0.3), fy + 0.4, fz + rand.range(-0.3, 0.3)], rotation: [rand.range(-0.2, 0.2), rand() * 3, 0], color: rand.pick(['#ff8a2a', '#ffb040', '#ff6a1a']) });
    ctx.effects.smoke({ position: [fx, fy + 1, fz], count: 8, height: 8, size: 0.32, color: '#9a9aa0', wind: [1, 0.4], seed: 3 });
    const fire = new ctx.THREE.PointLight('#ffa050', 12, 14, 1.5);
    fire.position.set(fx, fy + 1.2, fz);
    ctx.scene.add(fire);
    ctx.onFrame((t) => (fire.intensity = 11 + Math.sin(t * 7) * 1.5));
    const ring = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + 0.3;
      return [fx + Math.cos(a) * 2.2, fz + Math.sin(a) * 2.2];
    });

    people(ctx, [
      { points: ring, count: ring.length, face: [fx, fz], children: 0.2, palette: palettes.men, seed: 61 },
      { center: [0, 25], ring: [3, 26], count: 34, face: [0, -200], spacing: 2.2, children: 0.3, palette: palettes.women, seed: 64, avoid: [{ r: 4, x: fx, z: fz }, { r: 8, x: 2, z: 52 }, ...STREETS.flatMap((x) => [{ rect: [x - 10, -30, 7, 170] }, { rect: [x + 10, -30, 7, 170] }])] },
      { center: [0, 25], ring: [3, 26], count: 30, face: [0, 200], spacing: 2.2, children: 0.2, palette: palettes.men, seed: 65, avoid: [{ r: 4, x: fx, z: fz }, { r: 8, x: 2, z: 52 }, ...STREETS.flatMap((x) => [{ rect: [x - 10, -30, 7, 170] }, { rect: [x + 10, -30, 7, 170] }])] },
      { center: [0, -30], ring: [0, 80], count: 60, face: [0, 200], spacing: 2.5, children: 0.25, palette: palettes.men, seed: 62, avoid: [{ r: 4, x: fx, z: fz }, { r: 8, x: 2, z: 52 }, ...STREETS.flatMap((x) => [{ rect: [x - 10, -30, 7, 170] }, { rect: [x + 10, -30, 7, 170] }])] },
      { center: [0, -30], ring: [0, 80], count: 50, face: [0, -200], spacing: 2.5, children: 0.3, palette: palettes.women, seed: 63, avoid: [{ r: 4, x: fx, z: fz }, { r: 8, x: 2, z: 52 }, ...STREETS.flatMap((x) => [{ rect: [x - 10, -30, 7, 170] }, { rect: [x + 10, -30, 7, 170] }])] },
    ]);

    // A cabin and a few Saints on the bluff above the river.
    cabin(ctx, { x: 57.5, z: 29.5, rot: Math.PI / 2, w: 5.2, d: 4.4, h: 2.4, snow: true, log: '#6a5038', roof: '#6a5a4a' });
    wagon(ctx, { x: 59, z: 19.5, rot: 0.3, cover: '#e8e4da' });
    beast(ctx, { x: 60.2, z: 15.3, rot: 0.3, kind: 'ox', color: '#6a4a32' });
    people(ctx, [
      { points: [[64.5, 38], [65.6, 37.2], [67.5, 31], [63.2, 29.5], [66.8, 30.2]], count: 5, face: [riverX(30), 30], children: 0.2, palette: palettes.women, seed: 66 },
      { points: [[62.5, 40.5], [69.5, 35], [64, 26.5]], count: 3, face: [riverX(10), 10], children: 0, palette: palettes.men, seed: 67 },
    ]);

    cabin(ctx, { x: 0, z: -142, w: 14, d: 8, h: 3.4, snow: true, log: '#6a5038', roof: '#6a5a4a' });
    snowfall(ctx, { count: 1800, radius: 35, height: 22, size: 0.07 });
  },
};
