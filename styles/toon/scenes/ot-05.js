// Genesis 8:18-9:17: the ark at rest in the mountains of Ararat. Noah's family at the altar under the bow in the cloud.
// Coordinates are meters. x is east, z is south. The ark and the rainbow lie north of the player.
import { BASE_STYLE, FX_LAYER, THREE, animal, between, boxes, figure, flames, flock, glow, kneelFigure, makeRng, pick, smokeColumn, water } from './lib/ot-01-kit.js';
import { buildArk } from './lib/ot-01-ark.js';

const ALTAR = [4, -6];
const ARK = [-22, -46];

function rainbow(ctx) {
  const inner = 92, outer = 108;
  const geo = new THREE.RingGeometry(inner, outer, 160, 1, 0, Math.PI);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
    uniforms: { uInner: { value: inner }, uOuter: { value: outer }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uInner, uOuter, uTime;
      varying vec2 vP;
      void main() {
        float r = (length(vP) - uInner) / (uOuter - uInner);
        float band = floor(r * 6.0);
        vec3 c = band < 1.0 ? vec3(0.55, 0.35, 0.85) : band < 2.0 ? vec3(0.3, 0.5, 0.95) : band < 3.0 ? vec3(0.35, 0.8, 0.5) : band < 4.0 ? vec3(1.0, 0.92, 0.35) : band < 5.0 ? vec3(1.0, 0.6, 0.25) : vec3(0.95, 0.3, 0.3);
        float edge = smoothstep(0.0, 0.06, r) * smoothstep(1.0, 0.94, r);
        float lift = smoothstep(0.0, 0.35, vP.y / uOuter);
        gl_FragColor = vec4(c, 0.62 * edge * lift);
      }`,
  });
  const bow = new THREE.Mesh(geo, mat);
  bow.position.set(-14, -40, -230);
  bow.layers.set(FX_LAYER);
  bow.renderOrder = -500;
  ctx.scene.add(bow);
}

function altar(ctx) {
  const [x, z] = ALTAR;
  const rng = makeRng(5);
  const items = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + row * 0.5;
      const r = 1.3 - row * 0.2;
      items.push({ pos: [x + Math.sin(a) * r, z + Math.cos(a) * r], size: [1.1, 0.5, 0.8], rot: a, color: pick(rng, ['#a89a88', '#8a7e70', '#b8aa96']), y: ctx.terrainHeight(x, z) + row * 0.48 });
    }
  }
  items.push({ pos: [x, z], size: [2.2, 1.4, 2.2], color: '#8a7e70' });
  boxes(ctx, items);
  ctx.addCollider({ x, z, hx: 1.6, hz: 1.6, rot: 0, top: ctx.terrainHeight(x, z) + 1.5 });
  const y = ctx.terrainHeight(x, z) + 1.45;
  flames(ctx, [{ x, y, z, h: 1.6, r: 1.6 }, { x: x + 0.4, y, z: z + 0.2, h: 1.1, r: 1.1 }, { x: x - 0.4, y, z: z - 0.3, h: 1.2, r: 1.1 }]);
  glow(ctx, [x, y + 0.8, z], 6, '#ffb050', 0.7, 0.08);
  smokeColumn(ctx, [x, y + 1.2, z], { count: 22, rise: 22, size: 1.1, drift: [10, -5], color: '#d8d4d0', shade: '#5a5660' });
  const light = new THREE.PointLight('#ffa040', 18, 16, 1.4);
  light.position.set(x, y + 1, z);
  ctx.scene.add(light);
}

function family(ctx) {
  const at = (a, r) => [ALTAR[0] + Math.sin(a) * r, ALTAR[1] + Math.cos(a) * r];
  const noah = { robe: '#efe3c2', mantle: '#8c5a3c', skin: '#a87650', hair: '#ece8e0', sash: '#c8912e', arms: [0.5, 2.2] };
  figure(ctx, noah, at(0.15, 3.2), { facing: ALTAR, scale: 1.04 });
  const kin = [
    [{ robe: '#c8a97a', mantle: '#6b5a4a', skin: '#b5825a', hair: '#d8d4cc', sash: '#5e4632' }, -0.5],
    [{ robe: '#8c5a3c', mantle: '#c8912e', skin: '#9c6a45', hair: '#2b1a12', sash: '#efe3c2' }, 0.85],
    [{ robe: '#4f7f80', mantle: '#d9c7a3', skin: '#a87650', hair: '#3a2418', sash: '#c8912e' }, -1.1],
    [{ robe: '#b5523b', mantle: '#e6d8b8', skin: '#8a5a3b', hair: '#1f140e', sash: '#5e4632' }, 1.45],
    [{ robe: '#d9c7a3', mantle: '#7a6a52', skin: '#c08f66', hair: '#4a3020', sash: '#b5523b' }, -1.7],
    [{ robe: '#6f8a6a', mantle: '#c8a97a', skin: '#a87650', hair: '#2b1a12', sash: '#efe3c2' }, 2.0],
    [{ robe: '#9c6b4e', mantle: '#e6d8b8', skin: '#b5825a', hair: '#3a2418', sash: '#4f7f80' }, -2.25],
  ];
  for (const [c, a] of kin) kneelFigure(ctx, c, at(a, 3.6), { facing: ALTAR });
}

function creatures(ctx) {
  const rng = makeRng(15);
  const list = ['elephant', 'giraffe', 'camel', 'horse', 'lion', 'zebra', 'cow', 'deer', 'bear', 'sheep', 'goat', 'rabbit', 'horse', 'sheep', 'deer', 'cow'];
  list.forEach((type, i) => {
    for (const side of [0, 1]) {
      const a = between(rng, [-0.9, 2.4]);
      const r = between(rng, [14, 55]);
      const x = ARK[0] + 10 + Math.sin(a) * r + side * 2.2, z = ARK[1] + 12 + Math.cos(a) * r * 0.7 + side * 1.2;
      if (Math.hypot(x - ALTAR[0], z - ALTAR[1]) < 7 || ctx.blocked(x, z, 1.5)) continue;
      const g = animal(ctx.kit, type);
      g.position.set(x, ctx.groundHeight(x, z), z);
      g.rotation.y = Math.atan2(x - ARK[0], z - ARK[1]) + (rng() - 0.5);
      ctx.scene.add(g);
      ctx.addCollider({ x, z, hx: 0.6, hz: 0.6, rot: 0, top: ctx.groundHeight(x, z) + 1.5 });
    }
  });
  flock(ctx, { center: [-10, -30], y: 20, radius: 16, count: 7, colors: ['#fbf7ee'], speed: 0.3, size: 2.6 });
}

function landing(ctx) {
  const rng = makeRng(8);
  const items = [];
  for (let i = 0; i < 40; i++) {
    const a = rng() * 6.28, r = between(rng, [6, 20]);
    const x = ARK[0] + Math.sin(a) * r * 0.6, z = ARK[1] + Math.cos(a) * r * 1.4;
    const s = between(rng, [1, 3.5]);
    items.push({ pos: [x, z], size: [s * 1.4, s, s * 1.2], rot: rng() * 6, tiltX: (rng() - 0.5) * 0.5, tiltZ: (rng() - 0.5) * 0.5, color: pick(rng, ['#8a7e70', '#7a6e62', '#9a8e80']), lift: -s * 0.3 });
  }
  boxes(ctx, items);
  for (const [x, z, r] of [[12, 4, 2.4], [-6, 8, 3], [18, -14, 2], [-12, -10, 1.8], [24, 10, 2.6]]) {
    const s = new THREE.Shape();
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const k = r * (1 + 0.25 * Math.sin(a * 3 + x));
      i ? s.lineTo(x + Math.cos(a) * k, -(z + Math.sin(a) * k * 0.7)) : s.moveTo(x + Math.cos(a) * k, -(z + Math.sin(a) * k * 0.7));
    }
    water(ctx, { shape: s, y: ctx.terrainHeight(x, z) + 0.06, color: '#7ab0c0', glints: 0 });
  }
}

export default {
  title: 'Genesis 8:18-9:17: The rainbow',
  subtitle: 'The ark at rest upon the mountains of Ararat, and the bow in the cloud',
  seed: 5,

  style: { ...BASE_STYLE, fog: { color: '#cfd4d0', near: 120, far: 800 } },

  sky: { zenith: '#4a6a8a', mid: '#9ab4c0', horizon: '#f2e4c0', ground: '#a8a090', glowColor: '#fff4d8', glowDir: [0.5, 0.45, 0.6] },

  sun: { dir: [0.45, 0.7, 0.55], color: '#fff2da', intensity: 2.6, hemi: { sky: '#d0dce4', ground: '#8a8070', intensity: 1.1 }, shadowSize: 90 },

  ground: {
    size: 1400, segments: 280, flatRadius: 85, hillHeight: 46, undulation: 0.5,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: { sand: '#a8a088', dirt: '#8a8470', grass: '#7a9a5a', grassDark: '#5a7a42', plaza: '#a8a088', plazaLine: '#a8a088', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a8a7a' },
  },

  mountains: { count: 30, distance: [420, 720], height: [110, 220], widthRatio: [1.2, 2.0], colors: ['#8a8a9a', '#7a7a8c', '#9a98a8', '#b8bccc'] },

  objects: [
    { type: 'stones', count: 500, ring: [4, 80], size: [0.15, 0.6], colors: ['#9a9080', '#8a7e70', '#b0a898'] },
    { type: 'trees', count: 40, ring: [60, 160], height: [3, 6], broken: 0, fallen: 0, trunkColor: '#6b4a33', leafColors: ['#5a8a4a', '#6a9a50'] },
  ],

  custom(ctx) {
    buildArk(ctx, { pos: ARK, rot: 4.39, length: 80, stage: 'done', tilt: 0.04, y: ctx.terrainHeight(ARK[0], ARK[1]) - 0.8 });
    landing(ctx);
    altar(ctx);
    family(ctx);
    creatures(ctx);
    rainbow(ctx);
  },

  clouds: {
    layers: [
      { count: 14, angle: [-1.8, 1.4], distance: [380, 700], height: [70, 150], size: [40, 80], color: '#eef0f2', shade: '#4a4a62' },
      { count: 12, angle: [1.8, 4.4], distance: [300, 650], height: [90, 180], size: [50, 90], color: '#fff6e4', shade: '#6a6a80' },
    ],
  },

  player: {
    start: [10, 14],
    lookAt: [-4, -30],
    colors: { robe: '#b5523b', mantle: '#2f8f8a', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
