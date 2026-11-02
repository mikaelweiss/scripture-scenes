// Alma 17:26-39: at the waters of Sebus raiders scatter King Lamoni's flocks. Ammon gathers the frightened
// servants, sends them round the flocks, and stands alone with his sling against the band. -z is north.
import { flock, water, tufts, rng, yawTo } from './lib/bom-19-kit.js';

const POOL = [0, -24];
const AMMON = [4, -6];
const BAND = [6, -45];

const raiderPoints = (() => {
  const r = rng(233);
  const pts = [];
  while (pts.length < 34) {
    const x = BAND[0] + r.range(-16, 16), z = BAND[1] + r.range(-6, 6);
    if (pts.some(([px, pz]) => Math.hypot(px - x, pz - z) < 1.4)) continue;
    pts.push([x, z]);
  }
  return pts;
})();

const servantPoints = [[-14, -2], [-18, -6], [-20, -12], [-11, -1], [-24, -18], [-26, -8]];

export default {
  title: "Alma 17:26-39: Ammon defends the king's flocks",
  seed: 23,
  fov: 60,
  exposure: 1.0,

  sun: { direction: [0.45, 0.75, 0.4], color: '#fff0d0', intensity: 3.0 },
  light: { sky: '#9ec0e8', ground: '#6a7040', hemi: 1.1 },
  sky: { top: '#3f78c0', horizon: '#c8e0f0', ground: '#a8b890', sunColor: '#fff4dc', glow: 0.8 },
  fog: { color: '#bcd4e0', near: 80, far: 600 },
  clouds: { count: 40, shadow: '#9aa8c0', lit: '#ffffff', rim: '#ffffff', distance: [300, 900], altitude: [110, 220], hole: 0.3 },
  mountains: { count: 40, color: '#5a7060', radius: [480, 720], height: [50, 140], haze: 0.55 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.12, contrast: 1.06, vignette: 0.35, shadowTint: '#2a3a5a', highlightTint: '#fff4e0' },
  shadow: { center: [2, -24], radius: 60 },

  player: { start: [7.5, 1], yaw: 0.1, pitch: 0.03, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000,
    segments: 220,
    seed: 23,
    hills: 34,
    bumps: 0.3,
    flats: [
      { x: 0, z: -24, r: 55, falloff: 50, height: 0 },
      { x: BAND[0], z: BAND[1], r: 22, falloff: 14, height: 1.8 },
      { x: POOL[0], z: POOL[1], r: 11, falloff: 6, height: -1.6 },
      { x: 18, z: -20, r: 4, falloff: 4, height: -1.2 },
      { x: 28, z: -16, r: 3.5, falloff: 4, height: -1.1 },
      { x: 38, z: -11, r: 3, falloff: 4, height: -1 },
    ],
    colors: { ground: '#8a8a52', groundAlt: '#7a8448', grass: '#6a8a40', high: '#7a7a58', rock: '#7a6e5a' },
    patches: [
      { x: POOL[0], z: POOL[1], r: 17, color: '#8a7a58', strength: 0.7, rough: 0.4 },
      { x: BAND[0], z: BAND[1], r: 22, color: '#a08a62', strength: 0.5, rough: 0.5 },
    ],
  },

  scatter: [
    { type: 'tree', count: 60, center: POOL, ring: [45, 260], spacing: 8, seed: 8, props: { kind: 'broad', leaf: '#4e7a34' } },
    { type: 'tree', count: 14, center: POOL, ring: [16, 40], spacing: 7, seed: 18, avoid: [{ rect: [2, 0, 16, 30] }, { rect: BAND.concat([40, 18]) }, { rect: [-16, -6, 18, 18] }], props: { kind: 'palm', leaf: '#4e7a34' } },
    { type: 'rock', count: 14, center: POOL, ring: [14, 20], spacing: 4, seed: 10, avoid: [{ rect: [2, -6, 10, 14] }], props: { size: 1.2, color: '#8a8070' } },
  ],

  crowd: {
    palette: {
      robes: ['#c8b890', '#a0825c', '#b59a72', '#d8cdb5', '#94704e'],
      mantles: ['#7d5c3e', '#a34f32', '#8a7a5a', '#c9b48e'],
      skins: ['#7a4c31', '#8a5a3c', '#6a4228'],
      mantleChance: 0.4,
      hoodChance: 0.1,
    },
    groups: [
      { count: servantPoints.length, points: servantPoints, face: [-22, -16], seed: 23 },
      {
        count: raiderPoints.length, points: raiderPoints, face: AMMON, seed: 24, children: 0,
        palette: { robes: ['#5a2a1e', '#7a3a24', '#3a2a22', '#8a4a2a', '#4a3a2a'], mantles: ['#a8322a', '#2a2420', '#c8902a', '#6a2a1a'], skins: ['#5e3a24', '#6a4228', '#55331f'], mantleChance: 0.8, hoodChance: 0 },
      },
    ],
  },

  figures: [
    { x: AMMON[0], z: AMMON[1], face: BAND, scale: 1.06, robe: '#e0d4b8', mantle: '#3e5a7a', skin: '#a87652', arms: 'out' },
  ],

  custom(ctx) {
    const r = rng(2323);
    water(ctx, { x: 10, z: -20, w: 70, d: 34, y: -0.55, color: '#3f8a9a', amp: 0.05 });
    for (let z = -37; z <= -3; z++) {
      let run = null;
      for (let x = -25; x <= 46; x++) {
        const wet = ctx.heightAt(x, z) < -0.3;
        if (wet && run === null) run = x;
        if ((!wet || x === 46) && run !== null) {
          ctx.colliders.add({ x: (run + x - 1) / 2, z, w: x - run + 1, d: 1.2, top: 4 });
          run = null;
        }
      }
    }

    for (const [x, z] of raiderPoints) {
      const y = ctx.heightAt(x, z), side = r() < 0.5 ? -1 : 1;
      const rot = yawTo([x, z], AMMON);
      const c = Math.cos(rot), s = Math.sin(rot);
      const hx = x + side * 0.32 * c, hz = z - side * 0.32 * s;
      ctx.solid.add(new ctx.THREE.CylinderGeometry(0.05, 0.11, 0.95, 5), { position: [hx, y + 1.85, hz], rotation: [r.range(-0.4, 0.1), rot, side * r.range(0.1, 0.4)], color: '#4a3020' });
      if (r() < 0.5) ctx.solid.add(new ctx.THREE.ConeGeometry(0.06, 0.5, 3), { position: [x, y + 1.85, z], rotation: [r.range(-0.3, 0.3), rot, r.range(-0.3, 0.3)], color: r.pick(['#c8302a', '#2a8a7a', '#e0b030']) });
    }

    const handY = ctx.heightAt(...AMMON) + 1.05;
    const rot = yawTo(AMMON, BAND);
    const [hx, hz] = [AMMON[0] + Math.cos(rot) * 0.75, AMMON[1] - Math.sin(rot) * 0.75];
    ctx.solid.add(new ctx.THREE.CylinderGeometry(0.012, 0.012, 0.7, 3), { position: [hx, handY - 0.35, hz], color: '#3a2a1a', jitter: 0 });
    ctx.solid.add(new ctx.THREE.DodecahedronGeometry(0.07, 0), { position: [hx, handY - 0.7, hz], color: '#6a6058' });

    flock(ctx, { x: -18, z: -12, radius: 6, count: 26, heading: 3.6, spread: 0.6, seed: 91, grazing: 0.1 });
    flock(ctx, { x: -6, z: -14, radius: 4, count: 10, heading: 4.4, spread: 1.2, seed: 92, grazing: 0.5, avoid: (x, z) => Math.hypot(x - POOL[0], z - POOL[1]) < 15.5 });
    flock(ctx, { x: 22, z: -4, radius: 7, count: 14, heading: 1.5, spread: 1.4, seed: 93, grazing: 0.2 });
    flock(ctx, { x: 30, z: -34, radius: 8, count: 12, heading: 0.8, spread: 1.6, seed: 94, grazing: 0.2 });
    flock(ctx, { x: -28, z: -38, radius: 8, count: 10, heading: 2.2, spread: 1.6, seed: 95, grazing: 0.3 });
    flock(ctx, { x: 12, z: 6, radius: 5, count: 7, heading: 2.6, spread: 1.6, seed: 96, grazing: 0.4 });

    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, d = r.range(10.5, 13);
      const x = POOL[0] + Math.cos(a) * d, z = POOL[1] + Math.sin(a) * d;
      for (let k = 0; k < 3; k++) {
        const h = r.range(0.8, 1.6);
        ctx.solid.add(new ctx.THREE.ConeGeometry(0.05, h, 3), { position: [x + r.range(-0.3, 0.3), ctx.heightAt(x, z) + h / 2 - 0.1, z + r.range(-0.3, 0.3)], rotation: [r.range(-0.2, 0.2), 0, r.range(-0.2, 0.2)], color: r.pick(['#5a7a34', '#7a8a3a', '#4a6a2e']) });
      }
    }
    tufts(ctx, { x0: -40, x1: 45, z0: -60, z1: 20, count: 900, colors: ['#5a7a34', '#6a8a3a', '#7a8a44'], avoid: (x, z) => Math.hypot(x - POOL[0], z - POOL[1]) < 16.5 || (x > 14 && Math.abs(z + 16) < 6) });
  },
};
