// Abraham 3:22-28: before the world was, the intelligences are organized, and among them many noble and
// great ones. God stands in their midst, and one like unto God says, "We will go down... and we will make
// an earth," and the Lord asks whom he shall send. Symbolic premortal setting: a floor of cloud among the
// stars, the spirits assembled before a raised place of light (north, -z), and the unformed earth beyond.
import * as THREE from 'three';
import { stars, cloudLayer } from './lib/pgp-01-kit.js';

const DAIS = [0, -30];
const FATHER = [-1.6, -31.6];
const SON = [1.4, -28.2];

const noble = Array.from({ length: 22 }, (_, i) => {
  const a = Math.PI * (0.2 + (i / 21) * 0.6);
  return [DAIS[0] + Math.cos(a) * 14.5, DAIS[1] + Math.sin(a) * 14.5];
});

export default {
  title: 'Abraham 3:22-28: The Council in Heaven',
  seed: 606,
  fov: 64,
  exposure: 0.92,

  sun: { direction: [0.3, 0.7, 0.65], color: '#fff4e4', intensity: 1.8 },
  light: { sky: '#b8b8f0', ground: '#7a70a0', hemi: 1.3 },
  sky: { top: '#0a0c2a', horizon: '#6a5a9a', ground: '#c8c0e0', sunColor: '#fff2dc', glow: 0.5 },
  fog: { color: '#8a80b8', near: 60, far: 420 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 0.82 },
  grade: { saturation: 1.05, contrast: 1.05, vignette: 0.45, shadowTint: '#2a2a6a', highlightTint: '#fff2dc' },
  shadow: { center: [0, -10], radius: 70 },

  player: { start: [0.6, 1], yaw: 0, pitch: 0.16, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 900,
    segments: 160,
    seed: 66,
    hills: 10,
    bumps: 0.4,
    flats: [{ x: 0, z: 0, r: 110, falloff: 80, height: 0 }],
    colors: { ground: '#e4e0f2', groundAlt: '#d8d2ec', grass: '#ccc6e6', high: '#e8e4f6', rock: '#c0b8de' },
    patches: [{ x: DAIS[0], z: DAIS[1], r: 24, color: '#fff8ec', strength: 0.6, rough: 0.3 }],
  },

  objects: [
    { type: 'steppedPyramid', x: DAIS[0], z: DAIS[1], w: 20, d: 20, tiers: 5, tierHeight: 1.1, inset: 1.4, stairWidth: 5, color: '#9a90c8', trim: '#7a70a8', stairColor: '#aaa2d4' },
  ],

  crowd: {
    palette: {
      robes: ['#f4f0e8', '#ece6da', '#e2dcd0', '#f8f6f0', '#dcd6e8', '#e8e2f0'],
      mantles: ['#d8d0e8', '#f0e8d8', '#ccc4dc', '#e4dcc8'],
      skins: ['#a87652', '#b5835e', '#8a5a3c', '#c08e68', '#9b6a46'],
      mantleChance: 0.4,
      hoodChance: 0.1,
    },
    groups: [
      { count: noble.length, points: noble, face: DAIS, children: 0, seed: 21 },
      {
        count: 2400, center: DAIS, ring: [17, 78], arc: [0.12, Math.PI - 0.12], spacing: 0.95, face: DAIS, children: 0, seed: 22,
        avoid: [{ rect: [0, 30, 4.5, 90] }],
      },
      {
        count: 500, center: DAIS, ring: [22, 60], arc: [Math.PI + 0.5, Math.PI * 2 - 0.5], spacing: 1.1, face: DAIS, children: 0, seed: 23,
      },
    ],
  },

  figures: [
    {
      x: FATHER[0], z: FATHER[1], face: [0, 60], scale: 1.35, robe: '#ffffff', mantle: '#fbf6ea', skin: '#fff6e6', arms: 'down', emissive: 0.6,
      light: { color: '#fff4dc', intensity: 60, distance: 36 },
      halo: { size: 4.5, opacity: 0.3, color: '#fff3d6' },
    },
    {
      x: SON[0], z: SON[1], face: [0, 60], scale: 1.2, robe: '#fbf8f0', mantle: '#f2ecde', skin: '#f4ead8', arms: 'out', emissive: 0.55,
      light: { color: '#fff0cf', intensity: 40, distance: 24 },
      halo: { size: 3.5, opacity: 0.3, color: '#fff3d6' },
    },
  ],

  effects: [
    { type: 'beam', at: FATHER, height: 400, radiusBottom: 5, radiusTop: 26, color: '#fff3dc', opacity: 0.3 },
    { type: 'ring', at: DAIS, lift: 0.05, radius: 8.5, width: 1.2, color: '#ffe8b8', opacity: 0.6 },
    { type: 'motes', at: DAIS, radius: 14, height: 40, count: 300 },
  ],

  custom(ctx) {
    const r = ctx.rand;
    stars(ctx, { count: 3000, seed: 61, size: 1.7, tints: ['#ffffff', '#e8e0ff', '#fff0d8'] });

    // Banks of cloud forming the edges of the floor.
    cloudLayer(ctx, { radius: 220, inner: 95, y: 2, count: 140, size: [8, 20], color: '#c4bce6', emissive: 0.3, opacity: 0.92, seed: 3 });
    cloudLayer(ctx, { radius: 380, inner: 200, y: 20, count: 70, size: [20, 44], color: '#9a90c8', emissive: 0.3, opacity: 0.8, seed: 4 });

    // The unformed earth hanging beyond the council, with its materials gathering in orbit.
    const planetPos = new THREE.Vector3(-70, 95, -260);
    const geo = new THREE.IcosahedronGeometry(52, 2).toNonIndexed();
    const col = new Float32Array(geo.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < col.length; i += 9) {
      c.set(r() < 0.55 ? '#3a5a8a' : r() < 0.6 ? '#6a6a4a' : '#4a4060').multiplyScalar(0.8 + r() * 0.4);
      for (let k = 0; k < 9; k += 3) col.set([c.r, c.g, c.b], i + k);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const planet = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#2a2a50', emissiveIntensity: 0.6, fog: false }));
    planet.position.copy(planetPos);
    ctx.scene.add(planet);
    const atmo = ctx.effects.halo({ position: planetPos.toArray(), size: 150, color: '#9ab0ff', opacity: 0.35 });
    atmo.renderOrder = -1;
    const n = 260;
    const bits = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1.6, 0), new THREE.MeshBasicMaterial({ color: '#d8d0ff', fog: false, toneMapped: false }), n);
    const seeds = Array.from({ length: n }, () => [r() * Math.PI * 2, r.range(66, 100), r.range(-0.25, 0.25), r.range(0.05, 0.15), r.range(0.4, 1.2)]);
    const m = new THREE.Matrix4();
    ctx.onFrame((t) => {
      planet.rotation.y = t * 0.03;
      seeds.forEach(([a, rad, tilt, speed, s], i) => {
        const ang = a + t * speed;
        m.makeScale(s, s, s).setPosition(planetPos.x + Math.cos(ang) * rad, planetPos.y + Math.sin(ang) * rad * tilt + Math.sin(ang * 3) * 3, planetPos.z + Math.sin(ang) * rad);
        bits.setMatrixAt(i, m);
      });
      bits.instanceMatrix.needsUpdate = true;
    });
    bits.frustumCulled = false;
    ctx.scene.add(bits);

    // Soft pillars of light ringing the assembly.
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (1.0 + (i / 5) * 1.0);
      ctx.effects.beam({ position: [DAIS[0] + Math.cos(a) * 48, 0, DAIS[1] + Math.sin(a) * 48], height: 200, radiusBottom: 1.4, radiusTop: 4, color: '#e8e0ff', opacity: 0.35 });
    }
  },
};
