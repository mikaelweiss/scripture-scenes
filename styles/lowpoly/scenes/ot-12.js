// Genesis 28:10-22: Jacob sleeps at Bethel with a stone for a pillow and dreams of a ladder set on the earth
// reaching to heaven, angels ascending and descending, and the Lord above it. -z is north, up the ladder.
import * as THREE from 'three';
import { person, angel, stars, rodBetween, tufts, kit } from './lib/ot-07-common.js';

const JACOB = [0, -3];
const BASE = [0, 0.2, -9];
const TOP = [0, 150, -120];
const along = (f) => BASE.map((b, i) => b + (TOP[i] - b) * f);

function ladder(ctx) {
  const half = 1.6;
  const gold = '#d8b070';
  for (const sx of [-1, 1]) rodBetween(ctx, [BASE[0] + sx * half, BASE[1], BASE[2]], [TOP[0] + sx * half * 3, TOP[1], TOP[2]], 0.22, gold, ctx.glow);
  const len = Math.hypot(TOP[1] - BASE[1], TOP[2] - BASE[2]);
  const rungs = Math.floor(len / 2.4);
  for (let i = 1; i < rungs; i++) {
    const f = i / rungs;
    const [x, y, z] = along(f);
    const w = half * (1 + 2 * f);
    rodBetween(ctx, [x - w, y, z], [x + w, y, z], 0.16, '#e8c890', ctx.glow);
  }
  const glowSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uTime; varying vec2 vUv;
        void main() { float across = pow(sin(vUv.x * 3.14159), 2.0); float fade = smoothstep(0.0, 0.05, vUv.y) * (1.0 - smoothstep(0.85, 1.0, vUv.y));
          float shimmer = 0.8 + 0.2 * sin(vUv.y * 60.0 - uTime * 2.0);
          gl_FragColor = vec4(vec3(1.0, 0.92, 0.72) * across * fade * shimmer * 0.07, 1.0); }`,
    }),
  );
  const mid = along(0.5);
  glowSheet.position.set(...mid);
  glowSheet.scale.set(half * 2 * 2.2 + 3, len, 1);
  glowSheet.rotation.x = -(Math.PI / 2 - Math.atan2(TOP[1] - BASE[1], BASE[2] - TOP[2]));
  ctx.scene.add(glowSheet);
  ctx.onFrame((t) => (glowSheet.material.uniforms.uTime.value = t));

  const steps = [0.03, 0.09, 0.16, 0.24, 0.33, 0.43, 0.54, 0.66, 0.78];
  steps.forEach((f, i) => {
    const [x, y, z] = along(f);
    const w = half * (1 + 2 * f) * 0.5;
    const up = i % 2 === 0;
    const sx = up ? -w : w;
    angel(ctx, { x: x + sx, z: z + 0.6, y: y + 0.1, face: up ? [x + sx, z - 20] : [x + sx, z + 20], arms: i % 3 === 0 ? 'out' : 'down', glow: 0.32, halo: 1.6 + f * 4, float: 0.12, scale: 1.4 });
  });

  ctx.effects.halo({ position: [TOP[0], TOP[1] + 4, TOP[2]], size: 90, opacity: 0.7, color: '#fff2d0' });
  ctx.effects.halo({ position: [TOP[0], TOP[1] + 4, TOP[2]], size: 40, opacity: 1.0, color: '#ffffff' });
  const pl = new THREE.PointLight('#ffe8c0', 60, 40, 1.4);
  pl.position.set(BASE[0], 6, BASE[2] + 1);
  ctx.scene.add(pl);
}

export default {
  title: "Genesis 28:10-22: Jacob's ladder",
  seed: 28,
  fov: 62,
  exposure: 1.1,

  sun: { direction: [-0.5, 0.45, 0.6], color: '#8fa2d8', intensity: 0.7 },
  light: { sky: '#46588e', ground: '#22201e', hemi: 0.8 },
  sky: { top: '#03050f', horizon: '#18244a', ground: '#0a0c14', sunColor: '#6f80b0', glow: 0.2 },
  fog: { color: '#0e1630', near: 50, far: 460 },
  mountains: { count: 44, color: '#0a0c16', radius: [460, 680], height: [30, 90], haze: 0.25 },
  bloom: { strength: 0.7, radius: 0.5, threshold: 0.7 },
  grade: { saturation: 1.05, contrast: 1.06, vignette: 0.5, shadowTint: '#0c1640', highlightTint: '#ffe0b0' },
  shadow: { center: [0, -4], radius: 30 },

  player: { start: [4.4, -2.2], yaw: 0.78, pitch: 0.02, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 28,
    hills: 26,
    bumps: 0.5,
    flats: [{ x: 0, z: -4, r: 18, falloff: 40, height: 0 }],
    colors: { ground: '#6a6052', groundAlt: '#5c5448', grass: '#4e5436', high: '#6a6050', rock: '#56504a' },
  },

  scatter: [
    { type: 'rock', count: 40, center: [0, -4], ring: [4, 30], spacing: 3, seed: 4, avoid: [{ rect: [0, -6, 5, 10] }], props: { size: 0.6, color: '#7a7064' } },
    { type: 'rock', count: 60, center: [0, 0], ring: [30, 260], spacing: 8, seed: 5, props: { color: '#6e665a' } },
    { type: 'tree', count: 24, center: [0, 0], ring: [30, 220], spacing: 14, seed: 6, props: { kind: 'broad', leaf: '#34402a', h: 5 } },
  ],

  custom(ctx) {
    stars(ctx, { count: 3200, band: 3200, tilt: -0.6, brightness: 1.0 });
    ladder(ctx);

    person(ctx, { x: JACOB[0], z: JACOB[1], face: [JACOB[0] - 0.3, JACOB[1] + 10], pose: 'lie', robe: '#b09070', mantle: '#6a5a8a', skin: '#a87652', hood: true });
    const k = kit(ctx, JACOB[0], JACOB[1] - 1.75, 0.2);
    k.add(new THREE.DodecahedronGeometry(0.3, 0), { p: [0, 0.14, 0], s: [1.2, 0.6, 0.9], color: '#8a8070' });
    k.add(new THREE.CylinderGeometry(0.035, 0.04, 1.8, 5), { p: [-0.75, 0.05, 1.3], r: [Math.PI / 2, 0.1, 0], color: '#5a4430' });
    k.box(0.5, 0.3, 0.4, { p: [-0.8, 0.15, 0.4], color: '#6a5a44' });
    const bed = kit(ctx, JACOB[0], JACOB[1] - 0.85, 0);
    bed.box(0.95, 0.06, 2.0, { p: [0, 0.03, 0], color: '#7a3a2e', jitter: 0.06 });
    bed.box(0.9, 0.05, 0.25, { p: [0, 0.07, 0.8], color: '#c8a868' });
    const pl = new THREE.PointLight('#ffe2b0', 9, 9, 1.6);
    pl.position.set(JACOB[0] + 0.8, 2.2, JACOB[1] - 1.5);
    ctx.scene.add(pl);
    tufts(ctx, { center: [0, -4], ring: [3, 30], count: 100, colors: ['#4e5436', '#5a5a3a'] });
  },

  effects: [
    { type: 'motes', position: [0, 0, -9], radius: 3, height: 26, count: 120, color: '#fff2cc', size: 0.05 },
  ],
};
