// John 6:5-14. A grassy hillside above the Sea of Galilee near evening. The multitude sits in companies by
// hundreds and by fifties; Christ stands above them with the lad's five loaves and two fish, and twelve
// baskets of fragments are gathered at his feet. -z runs downhill toward the lake.
import { person, createWater, createBoat, basket } from './lib/nt-13-kit.js';

const CHRIST = [0, 18];

const companies = [];
{
  let s = 15;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let bz = -2; bz > -80; bz -= 11) {
    for (let bx = -84; bx < 84; bx += 12.5) {
      if (bx > -15 && bx < 6) continue;
      const width = Math.hypot(bx, bz) < 50 ? 10 : 10 - Math.floor(r() * 3);
      const rows = r() < 0.5 ? 5 : 10;
      const depth = rows === 10 ? 8 : 4;
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < rows; j++) {
          if (r() < 0.06) continue;
          companies.push([bx + i * 0.95 + (r() - 0.5) * 0.3, bz - (j * depth) / rows - (r() - 0.5) * 0.3]);
        }
      }
    }
  }
}

export default {
  title: 'John 6:5-14: Feeding the five thousand',
  seed: 15,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [-0.85, 0.28, -0.35], color: '#ffcf8e', intensity: 3.0 },
  light: { sky: '#9fb4d8', ground: '#6a5a3a', hemi: 1.1 },
  sky: { top: '#4a6aa0', horizon: '#f2c894', ground: '#c8a888', sunColor: '#ffdcae', glow: 1.1 },
  fog: { color: '#d8b898', near: 90, far: 700 },
  clouds: { count: 45, shadow: '#8c8496', lit: '#ffd6a6', rim: '#fff0d0', distance: [300, 900], altitude: [110, 240], hole: 0.25 },
  mountains: { count: 50, color: '#5e6470', radius: [600, 800], height: [22, 55], haze: 0.45 },
  bloom: { strength: 0.45, radius: 0.55, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.06, vignette: 0.4, shadowTint: '#2e3060', highlightTint: '#ffe4b8' },
  shadow: { center: [0, -10], radius: 70 },

  player: { start: [3.6, 23.4], yaw: 0.3, pitch: -0.13, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1500,
    segments: 220,
    seed: 15,
    hills: 30,
    bumps: 0.3,
    flats: [
      { x: 0, z: -330, r: 180, falloff: 120, height: -12 },
      { x: 0, z: 60, r: 10, falloff: 150, height: 18 },
      { x: 0, z: -90, r: 0, falloff: 150, height: -3.5 },
      { x: CHRIST[0], z: CHRIST[1], r: 5, falloff: 8, height: 12.2 },
    ],
    colors: { ground: '#7c8a48', groundAlt: '#6c7c3e', grass: '#86964c', high: '#8a8a52', rock: '#7a6e58' },
  },

  scatter: [
    { type: 'tree', count: 40, center: [0, 30], ring: [40, 220], arc: [-0.6, Math.PI + 0.6], spacing: 8, seed: 3, avoid: [{ rect: [0, -40, 170, 90] }], props: { kind: 'broad', leaf: '#5f7a3a' } },
    { type: 'rock', count: 30, center: [0, 30], ring: [30, 200], spacing: 10, seed: 4, avoid: [{ rect: [0, -40, 170, 90] }], props: { size: 1.4, color: '#8d7f6a' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#c4b090', '#5e4b3a', '#94704e', '#a65d3f', '#6b6f4a', '#d8cdb5', '#4f5a6b'],
      mantles: ['#5a3d2b', '#7d5c3e', '#a34f32', '#3f4d5e', '#8a7a5a', '#c9b48e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
      mantleChance: 0.6,
      hoodChance: 0.35,
    },
    groups: [{ count: companies.length, points: companies, face: CHRIST, kneel: 1, children: 0.22, seed: 15 }],
  },

  custom(ctx) {
    const { THREE, scene } = ctx;
    createWater(ctx, { center: [0, -420], radius: 700, level: -6, color: '#4a7c8c', foam: '#e6efe8', amp: 0.18, minAmp: 0.18, speed: 0.6 });
    for (const [x, z, rot] of [[-70, -170, 0.6], [55, -230, -0.3]]) {
      const b = createBoat(ctx, { len: 8, beam: 2.5, seed: Math.abs(x) });
      b.group.position.set(x, -6, z);
      b.group.rotation.y = rot;
      scene.add(b.group);
    }

    const y = ctx.heightAt(CHRIST[0], CHRIST[1]);
    person(ctx, {
      x: CHRIST[0], z: CHRIST[1], face: [0, -40], robe: '#fbf7ee', mantle: '#efe6d2', skin: '#a8754f', arms: 'out', emissive: 0.22, scale: 1.08,
      light: { color: '#fff0cf', intensity: 22, distance: 16 },
      halo: { size: 3.6, opacity: 0.35, color: '#fff3d6' },
    });

    // The lad with five barley loaves and two small fishes on a cloth before Christ.
    person(ctx, { x: CHRIST[0] - 1.3, z: CHRIST[1] - 1.0, face: CHRIST, scale: 0.62, robe: '#b08a58', skin: '#a87652' });
    ctx.solid.box(1.4, 0.04, 1.0, { position: [CHRIST[0] - 0.2, y + 0.04, CHRIST[1] - 1.6], color: '#e8dcc0', jitter: 0.03 });
    for (let i = 0; i < 5; i++) {
      ctx.solid.add(new THREE.SphereGeometry(0.14, 6, 4), { position: [CHRIST[0] - 0.6 + i * 0.2, y + 0.1, CHRIST[1] - 1.45 - (i % 2) * 0.2], scale: [1.2, 0.6, 1], color: '#d2a060', jitter: 0.05 });
    }
    for (let i = 0; i < 2; i++) {
      ctx.solid.add(new THREE.ConeGeometry(0.07, 0.42, 4), { position: [CHRIST[0] + 0.25, y + 0.1, CHRIST[1] - 1.5 - i * 0.2], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 0.5], color: '#9aa0a2', jitter: 0.05 });
    }

    // Twelve baskets of fragments gathered in an arc.
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * (0.2 + (i / 11) * 0.6);
      basket(ctx, { x: CHRIST[0] + Math.cos(a) * 4.2, z: CHRIST[1] - Math.sin(a) * 3.2 - 0.3, size: 0.38 });
    }

    // Disciples standing near Christ and moving among the companies with bread.
    const robes = ['#7b5f45', '#5f6b72', '#8c6f4e', '#6d5a48', '#4f5a62', '#94704e', '#5d4a3a', '#8a5a40'];
    const near = [[-3.5, 20], [-1.6, 21.6], [-5, 17], [5.8, 16.6]];
    near.forEach(([x, z], i) => person(ctx, { x, z, face: [0, -30], robe: robes[i], mantle: '#4a3a2c', skin: '#9b6a46', hood: i % 2 === 0 }));
    const walkers = [[-5.5, -6], [-5.5, -24], [-16.5, -15], [5.5, -42], [27, -8], [-38, -26], [16, -33], [-27, -52]];
    walkers.forEach(([x, z], i) => {
      person(ctx, { x, z, face: [x + 3, z - 2], robe: robes[(i + 3) % robes.length], mantle: '#5a3d2b', skin: '#8a5a3c', arms: 'out' });
      basket(ctx, { x: x + 0.45, z: z + 0.2, y: ctx.heightAt(x, z) + 0.75, size: 0.24 });
    });
  },
};
