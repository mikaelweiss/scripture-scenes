// D&C 103, 105: Zion's Camp, 1834. A column of about two hundred men with wagons marches west across
// the prairie toward Missouri. The road runs north (-z); the player walks beside the column.
import { people, palettes, wagon, beast, person } from './lib/dc-08-kit.js';

const roadX = (z) => Math.sin(z * 0.016 + 0.4) * 16 + Math.sin(z * 0.005) * 10;
const road = Array.from({ length: 70 }, (_, i) => {
  const z = 140 - i * 7;
  return [roadX(z), z];
});

const WAGONS = Array.from({ length: 14 }, (_, i) => 20 - i * 15);
const marchers = [];
for (let z = 34; z > -190; z -= 1.25) {
  if (WAGONS.some((w) => Math.abs(z - w) < 3.6)) continue;
  for (const s of [-1, 1]) marchers.push([roadX(z) + s * 0.65 + Math.sin(z * 3.1) * 0.15, z + (s > 0 ? 0.3 : 0)]);
}
const ahead = [roadX(-400), -400];

export default {
  title: "D&C 103, 105: Zion's Camp",
  seed: 1834,
  fov: 62,
  exposure: 1.02,

  sun: { direction: [-0.55, 0.55, -0.45], color: '#ffe2b4', intensity: 2.8 },
  light: { sky: '#a8c4e8', ground: '#6b6a3e', hemi: 1.0 },
  sky: { top: '#4f7fc0', horizon: '#dfe6e0', ground: '#a8a070', sunColor: '#fff0c8', glow: 0.9 },
  fog: { color: '#cdd6d0', near: 90, far: 620 },
  clouds: { count: 60, shadow: '#9aa6b8', lit: '#ffffff', rim: '#fffaf0', distance: [250, 900], altitude: [110, 200], hole: 0.3 },
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.32, shadowTint: '#2a3048', highlightTint: '#fff2d0' },
  shadow: { center: [12, 0], radius: 60 },

  player: { start: [19, -13], yaw: 2.72, pitch: -0.02, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1000, segments: 250, seed: 34, hills: 22, hillScale: 0.0045, bumps: 0.25,
    colors: { ground: '#7f9046', groundAlt: '#94a052', grass: '#6f8a3e', high: '#a0a45a', rock: '#7d7a50' },
    patches: road.map(([x, z]) => ({ x, z, r: 3.0, color: '#9c8460', strength: 0.85, rough: 0.25 })),
  },

  scatter: [
    { type: 'tree', count: 50, center: [-150, -160], ring: [0, 70], spacing: 6, seed: 3, props: { kind: 'broad', leaf: '#4f6e32' } },
    { type: 'tree', count: 40, center: [170, -60], ring: [0, 60], spacing: 6, seed: 4, props: { kind: 'broad', leaf: '#56743a' } },
    { type: 'tree', count: 50, center: [40, -320], ring: [0, 90], spacing: 7, seed: 5, props: { kind: 'broad', leaf: '#4f6e32' } },
    { type: 'tree', count: 18, center: [-90, 90], ring: [0, 40], spacing: 6, seed: 6, props: { kind: 'broad', leaf: '#5b7a3a' } },
    { type: 'rock', count: 14, center: [0, 0], ring: [30, 300], spacing: 20, seed: 7, props: { size: 1.2, color: '#8a8470' } },
  ],

  custom(ctx) {
    const { THREE } = ctx;
    const tuft = new THREE.ConeGeometry(0.07, 0.24, 4);
    const bloom = new THREE.OctahedronGeometry(0.045, 0);
    for (let i = 0; i < 4000; i++) {
      const x = ctx.rand.range(-30, 50), z = ctx.rand.range(-50, 40);
      if (Math.abs(x - roadX(z)) < 3.5) continue;
      const y = ctx.heightAt(x, z);
      const h = ctx.rand.range(0.6, 1.3);
      ctx.solid.add(tuft, { position: [x, y + 0.1 * h - 0.04, z], rotation: [ctx.rand.range(-0.25, 0.25), ctx.rand() * 3, 0], scale: [1, h, 1], color: ctx.rand.pick(['#7f9a42', '#94a64e', '#6d8a3a', '#a7a858']), jitter: 0.08 });
      if (i % 5 === 0) ctx.solid.add(bloom, { position: [x + 0.08, y + 0.2 * h, z], color: ctx.rand.pick(['#e8d24a', '#c86ab0', '#f0f0e0', '#e89a3a']), jitter: 0.05 });
    }

    WAGONS.forEach((z, i) => {
      const x = roadX(z);
      wagon(ctx, { x, z, rot: Math.atan2(x - roadX(z - 2), 2), cover: i % 3 ? '#e8dfc8' : '#d8ccb0' });
      const team = i % 2 ? 'horse' : 'ox';
      for (const [dx, dz] of [[-0.5, -3.6], [0.5, -3.6], [-0.5, -5.6], [0.5, -5.6]].slice(0, team === 'horse' ? 2 : 4)) {
        beast(ctx, { x: roadX(z + dz) + dx, z: z + dz, rot: Math.atan2(roadX(z + dz) - roadX(z + dz - 2), 2), kind: team, color: team === 'horse' ? (i % 4 ? '#5a3a24' : '#2e2420') : (dx < 0 ? '#7a5434' : '#5e4a3a') });
      }
    });

    // Horsemen riding at the head of the column and along its flank.
    const riders = [[roadX(-196) - 0.8, -196], [roadX(-196) + 0.8, -196], [roadX(-60) + 3.2, -60], [roadX(10) - 3.4, 10]];
    for (const [x, z] of riders) {
      beast(ctx, { x, z, kind: 'horse', color: '#4a3020' });
      person(ctx, { x, z: z + 0.1, y: ctx.heightAt(x, z) + 0.95, face: [x, z - 50], robe: '#2e2a26', mantle: '#3a3028', hat: '#1e1b18', sink: 0.55 });
    }

    // The camp's flag carried at the front.
    const fx = roadX(-192), fz = -192, fy = ctx.heightAt(fx, fz);
    ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.05, 5, 5), { position: [fx + 1.4, fy + 2.5, fz], color: '#4a3826' });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1, 6, 2), new THREE.MeshLambertMaterial({ color: '#f2efe6', side: THREE.DoubleSide, flatShading: true }));
    flag.position.set(fx + 2.3, fy + 4.4, fz);
    ctx.scene.add(flag);
    const fp = flag.geometry.attributes.position, base = Float32Array.from(fp.array);
    ctx.onFrame((t) => {
      for (let i = 0; i < fp.count; i++) fp.array[i * 3 + 2] = base[i * 3 + 2] + Math.sin(t * 3 + base[i * 3] * 2.5) * 0.12 * (base[i * 3] + 0.9);
      fp.needsUpdate = true;
      flag.geometry.computeVertexNormals();
    });

    const men = people(ctx, [
      { points: marchers, count: marchers.length, face: ahead, children: 0, palette: { ...palettes.men, mantleChance: 0.5 }, seed: 41 },
    ]);

    // Muskets on the shoulders of about half the men.
    men.forEach((p, i) => {
      if (i % 2) return;
      const c = Math.cos(p.yaw), s = Math.sin(p.yaw);
      const lx = 0.22, lz = -0.05;
      ctx.solid.box(0.04, 0.04, 1.45, {
        position: [p.x + lx * c + lz * s, p.y + 1.45, p.z - lx * s + lz * c],
        rotation: [-0.95, p.yaw, 0],
        color: '#3a2a1c',
        jitter: 0.05,
      });
    });

  },
};
