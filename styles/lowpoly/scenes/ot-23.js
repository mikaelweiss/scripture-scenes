// Numbers 21:6-9: fiery serpents in the camp. Moses sets a serpent of brass upon a pole,
// and the bitten who look upon it live.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { ISRAEL, desertTerrain, scatterPoints, layoutTents, tentZones, tent, person, lying, dress } from './lib/ot-19-camp.js';

const POLE = [0, -12];
const tents = layoutTents({ center: POLE, ring: [62, 230], count: 200, seed: 23, face: POLE, avoid: [{ rect: [0, 40, 40, 60] }] });
const zones = tentZones(tents);
const fallen = scatterPoints({ center: [0, -4], ring: [3, 20], count: 40, spacing: 2.2, seed: 7, avoid: [{ x: 0, z: 14, r: 6 }, { x: POLE[0], z: POLE[1], r: 4 }] });

function serpentPole(ctx) {
  const [x, z] = POLE;
  const y = ctx.heightAt(x, z);
  const h = 7.5;
  ctx.solid.add(new THREE.CylinderGeometry(0.1, 0.13, h, 6), { position: [x, y + h / 2, z], color: '#6a4a30' });
  for (let i = 0; i < 6; i++) ctx.solid.add(new THREE.DodecahedronGeometry(0.4, 0), { position: [x + Math.cos(i) * 0.45, y + 0.15, z + Math.sin(i) * 0.45], color: '#8a7a68' });
  ctx.colliders.add({ x, z, w: 1.2, d: 1.2, bottom: y, top: y + h });

  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * Math.PI * 2 * 3.2;
    pts.push(new THREE.Vector3(Math.cos(a) * 0.24, 2.2 + t * 4.4, Math.sin(a) * 0.24));
  }
  pts.push(new THREE.Vector3(0.35, h - 0.35, 0.25), new THREE.Vector3(0.75, h - 0.15, 0.3));
  const body = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.1, 5);
  const mat = new THREE.MeshLambertMaterial({ color: '#c8843a', emissive: '#7a4010', emissiveIntensity: 0.5, flatShading: true });
  const serpent = new THREE.Mesh(body, mat);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.5, 5).rotateZ(-Math.PI / 2), mat);
  head.position.set(0.95, h - 0.12, 0.3);
  serpent.add(head);
  serpent.position.set(x, y, z);
  serpent.rotation.y = -Math.PI / 2;
  serpent.castShadow = true;
  ctx.scene.add(serpent);
  ctx.effects.halo({ position: [x, y + h - 0.6, z], size: 3.5, color: '#ffc070', opacity: 0.4 });
}

// The fiery serpents: small red-orange snakes winding over the sand.
function snakes(ctx, count) {
  const r = rng(12);
  for (const [sx, sz] of scatterPoints({ center: [0, -10], ring: [2, 60], count, spacing: 3, seed: 13, avoid: [{ x: 0, z: 12, r: 2 }] })) {
    const a0 = r() * Math.PI * 2;
    let px = sx, pz = sz, a = a0;
    for (let k = 0; k < 9; k++) {
      a += Math.sin(k * 1.3 + a0) * 0.7;
      const nx = px + Math.cos(a) * 0.16, nz = pz + Math.sin(a) * 0.16;
      ctx.solid.add(new THREE.CylinderGeometry(0.035 - k * 0.002, 0.04 - k * 0.002, 0.18, 4), {
        position: [(px + nx) / 2, ctx.heightAt(px, pz) + 0.04, (pz + nz) / 2],
        rotation: [Math.PI / 2, Math.atan2(nx - px, nz - pz), 0],
        color: k % 2 ? '#c8401a' : '#e07a2a',
        jitter: 0.04,
      });
      [px, pz] = [nx, nz];
    }
  }
}

export default {
  title: 'Numbers 21:6-9: The brass serpent',
  seed: 23,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.45, 0.7, 0.35], color: '#fff0d0', intensity: 3.0 },
  light: { sky: '#a8c0e8', ground: '#b08a60', hemi: 1.0 },
  sky: { top: '#4a78c0', horizon: '#e8d8bc', ground: '#d8b88c', sunColor: '#fff4d8', glow: 0.8 },
  fog: { color: '#e4d2b4', near: 90, far: 620 },
  clouds: { count: 16, shadow: '#b0a8a8', lit: '#fff4e4', rim: '#ffffff', distance: [400, 1000], altitude: [200, 320], hole: 0.2 },
  mountains: { count: 40, color: '#a07a5a', radius: [540, 780], height: [40, 110], haze: 0.5 },
  bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
  grade: { saturation: 1.08, contrast: 1.06, vignette: 0.36, shadowTint: '#4a3a5a', highlightTint: '#fff2d8' },
  shadow: { center: [0, -15], radius: 60 },

  player: { start: [0, 14], yaw: 0, pitch: 0, eye: 1.65, speed: 4.5 },

  terrain: desertTerrain({
    seed: 23,
    flats: [{ x: 0, z: -15, r: 90, falloff: 70, height: 0 }, { x: POLE[0], z: POLE[1], r: 3, falloff: 12, height: 1.6 }],
    colors: { ground: '#d0a874', groundAlt: '#c09a68', grass: '#b8a070', high: '#a88460', rock: '#9a7458' },
  }),

  scatter: [
    { type: 'rock', count: 60, center: POLE, ring: [80, 400], spacing: 12, seed: 3, props: { color: '#a48464' } },
    { type: 'tree', count: 10, center: POLE, ring: [90, 300], spacing: 25, seed: 4, props: { kind: 'palm', leaf: '#6a7a3a', h: 6 } },
  ],

  crowd: {
    palette: ISRAEL,
    groups: [
      { count: 900, center: POLE, ring: [7, 64], spacing: 1.15, face: [POLE[0], POLE[1]], children: 0.2, kneel: 0.35, seed: 51, avoid: [...zones, { rect: [0, 8, 5, 16] }, ...fallen.map(([x, z]) => ({ x, z, r: 1.4 }))] },
    ],
  },

  custom(ctx) {
    for (const t of tents) tent(ctx, t);
    serpentPole(ctx);
    snakes(ctx, 40);
    const r = rng(33);
    const [px, pz] = POLE;
    // The bitten: some lie stricken, some raise themselves to look upon the serpent.
    fallen.forEach(([x, z], i) => {
      const toPole = Math.atan2(px - x, pz - z);
      const d = dress(r);
      if (i % 3 === 0) person(ctx, { x, z, yaw: toPole, ...d, kneel: true, arms: [[1.9, 0.3], [0.4, 0.2]] });
      else if (i % 3 === 1) lying(ctx, { x, z, yaw: toPole + Math.PI + r.range(-0.4, 0.4), ...d, prop: r.range(0.55, 0.8), reach: i % 2 === 1 });
      else lying(ctx, { x, z, yaw: r() * Math.PI * 2, ...d, prop: r.range(0, 0.15) });
    });
    // Moses beside the pole, one arm raised toward it.
    person(ctx, { x: px + 1.6, z: pz + 1.2, yaw: 0.4, robe: '#c8b89a', mantle: '#7a3a2a', skin: '#9b6a46', hood: true, scale: 1.05, arms: [[2.6, 0.5], [0.3, 0.15]] });
    ctx.solid.add(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), { position: [px + 2.05, ctx.heightAt(px + 2, pz + 1.3) + 1.05, pz + 1.3], rotation: [0.05, 0, -0.1], color: '#5a4332' });
  },
};
