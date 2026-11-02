// Moses 1: Moses is caught up to an exceedingly high mountain and, in the glory of God, beholds the
// world and every particle of it. The summit is at the origin, about 150 m above a sea of cloud.
// The player stands behind Moses looking north (-z) over the earth.
import * as THREE from 'three';
import { person, stone, cloudLayer, box } from './lib/pgp-01-kit.js';

const PEAK = 150;
const MOSES = [0, -8];
const LAKES = [[-240, -420, 90], [280, -340, 60], [60, -640, 140]];

export default {
  title: 'Moses 1: Moses sees the world',
  seed: 101,
  fov: 64,
  exposure: 0.92,

  sun: { direction: [0.55, 0.5, 0.45], color: '#fff0d4', intensity: 3.0 },
  light: { sky: '#9ab4e8', ground: '#7a6a5e', hemi: 1.0 },
  sky: { top: '#24386e', horizon: '#d8e2ec', ground: '#b8c4cc', sunColor: '#fff2d8', glow: 1.6 },
  fog: { color: '#b8c8da', near: 300, far: 2300 },
  clouds: { count: 34, shadow: '#a8a8b8', lit: '#fff0dc', rim: '#ffffff', distance: [500, 1100], altitude: [230, 340], hole: 0.05, seed: 11 },
  mountains: { count: 54, color: '#6a6a78', radius: [620, 820], height: [40, 110], haze: 0.4 },
  bloom: { strength: 0.65, radius: 0.6, threshold: 0.8 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.4, shadowTint: '#2a3060', highlightTint: '#fff0d0' },
  shadow: { center: [0, -4], radius: 60 },

  player: { start: [1.0, -4.0], yaw: 0.05, pitch: -0.3, eye: 1.65, speed: 3.5 },

  terrain: {
    size: 1600,
    segments: 240,
    seed: 77,
    hills: 30,
    hillScale: 0.004,
    bumps: 0.5,
    flats: [{ x: 0, z: 0, r: 0, falloff: 450, height: 70 }, { x: 0, z: 0, r: 6, falloff: 60, height: PEAK }, ...LAKES.map(([x, z, rad]) => ({ x, z, r: rad, falloff: 50, height: -3 }))],
    colors: { ground: '#7d8a5a', groundAlt: '#6a7a4c', grass: '#5e7a44', high: '#8a8078', rock: '#6e6660' },
    patches: [{ x: 0, z: 0, r: 22, color: '#958a7c', strength: 0.8, rough: 0.5 }],
  },

  scatter: [
    { type: 'rock', count: 26, center: [0, 0], ring: [16, 60], spacing: 6, seed: 7, avoid: [{ rect: [0, -20, 8, 30] }], props: { color: '#7a726a' } },
    { type: 'rock', count: 60, center: [0, 0], ring: [60, 260], spacing: 14, seed: 8, props: { color: '#7a726a', size: 5 } },
    { type: 'tree', count: 260, center: [0, 0], ring: [150, 600], spacing: 10, seed: 9, props: { kind: 'broad', leaf: '#4e6e38', h: 10 } },
  ],

  figures: [
    {
      x: MOSES[0], z: MOSES[1], face: [0, -200], scale: 1.0, robe: '#d8cdb5', mantle: '#7a5a3e', skin: '#a8754f', arms: 'out', emissive: 0.15,
      light: { color: '#fff4dc', intensity: 10, distance: 10 },
      halo: { size: 2.6, opacity: 0.3, color: '#fff6e0' },
    },
  ],

  effects: [
    { type: 'beam', at: MOSES, height: 400, radiusBottom: 2.2, radiusTop: 22, color: '#fff3d8', opacity: 0.18 },
    { type: 'sunShafts', center: [0, -300], count: 9, spread: 260, length: 600, width: [16, 40], opacity: 0.06 },
  ],

  custom(ctx) {
    const r = ctx.rand;
    const top = ctx.heightAt(0, 0);

    // Broken summit stones framing the view, a cairn where Moses stands.
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + r.range(-0.1, 0.1);
      if (Math.sin(a) < -0.55) continue;
      const d = r.range(7.5, 11);
      stone(ctx, { x: Math.cos(a) * d, z: Math.sin(a) * d, size: r.range(1.2, 2.8), color: '#7e766c', collide: true });
    }
    for (let i = 0; i < 6; i++) stone(ctx, { x: MOSES[0] + r.range(-2.5, 2.5), z: MOSES[1] - r.range(1.5, 4), size: r.range(0.4, 0.8), color: '#8a8278' });
    box(ctx, { x: MOSES[0], y: ctx.heightAt(...MOSES) - 0.4, z: MOSES[1], w: 2.4, h: 0.55, d: 1.8, rot: 0.2, color: '#8e867a' });

    // A sea of cloud below the summit with the earth showing through.
    cloudLayer(ctx, { radius: 900, inner: 260, y: 62, count: 45, size: [26, 60], color: '#f6efe6', emissive: 0.3, opacity: 0.8, seed: 3 });
    cloudLayer(ctx, { radius: 700, inner: 160, y: 104, count: 14, size: [14, 30], color: '#fff6ec', emissive: 0.3, opacity: 0.6, seed: 4 });

    // Every particle of the earth: countless points of light hanging over the land below.
    const n = 2400;
    const geo = new THREE.OctahedronGeometry(0.9, 0);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: '#fff3c8', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), n);
    const m = new THREE.Matrix4();
    const seeds = [];
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 650 + 60;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      seeds.push([x, ctx.heightAt(x, z) + r.range(4, 110), z, r() * 6, r.range(0.4, 1.3)]);
    }
    const place = (t) => {
      seeds.forEach(([x, y, z, ph, s], i) => {
        const k = s * (0.75 + 0.35 * Math.sin(t * 1.4 + ph));
        m.makeScale(k, k, k).setPosition(x + Math.sin(t * 0.2 + ph) * 2, y + Math.sin(t * 0.3 + ph * 2) * 1.5, z);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    place(0);
    mesh.frustumCulled = false;
    ctx.scene.add(mesh);
    let acc = 0;
    ctx.onFrame((t, dt) => {
      acc += dt;
      if (acc > 0.08) {
        acc = 0;
        place(t);
      }
    });

    // Seas glinting far below.
    for (const [x, z, rad] of LAKES) {
      const sea = new THREE.Mesh(new THREE.CircleGeometry(rad + 30, 14).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#7aa6c8', emissive: '#4a7aa0', emissiveIntensity: 0.5, flatShading: true }));
      sea.position.set(x, -0.8, z);
      ctx.scene.add(sea);
    }

    ctx.effects.motes({ position: [MOSES[0], top, MOSES[1]], radius: 4, height: 30, count: 60 });
  },
};
