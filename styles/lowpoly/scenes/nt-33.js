// Acts 10:9-16. Noon on the flat roof of Simon the tanner's house in Joppa. Peter kneels to pray
// and sees heaven open: a great sheet, knit at the four corners, let down over the sea. -z is the sea.
import { water, house, town, boat, figure, brightCloud, beast, bird, serpent, Batch } from './lib/nt-32-kit.js';

const HOUSE = [0, 4];
const PETER = [-1.4, 1.2];
const SHEET = [-1.0, 7.4, -11];

export default {
  title: "Acts 10:9-16: Peter's vision at Joppa",
  seed: 33,
  fov: 62,
  exposure: 1.0,

  sun: { direction: [0.3, 0.9, 0.35], color: '#fff0d6', intensity: 2.7 },
  light: { sky: '#bcd4ff', ground: '#8a7458', hemi: 1.05 },
  sky: { top: '#4f7fc4', horizon: '#dfe8ec', ground: '#c8b89a', sunColor: '#fff4dc', glow: 1.2 },
  fog: { color: '#d6dde0', near: 120, far: 800 },
  clouds: { count: 30, shadow: '#a8b0bc', lit: '#ffffff', rim: '#ffffff', distance: [380, 900], altitude: [110, 240], hole: 0.1 },
  mountains: { count: 30, color: '#8a8270', radius: [520, 740], height: [30, 90], haze: 0.6 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 0.85 },
  grade: { saturation: 1.1, contrast: 1.05, vignette: 0.3, shadowTint: '#2e3a5e', highlightTint: '#fff0d8' },
  shadow: { center: [0, 6], radius: 40 },

  player: { start: [1.4, 3.6], yaw: 0.5, pitch: 0.14, eye: 1.65, speed: 4 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 33,
    hills: 22,
    bumps: 0.3,
    flats: [
      { x: 0, z: -400, r: 372, falloff: 26, height: -4 },
      { x: 0, z: 30, r: 24, falloff: 30, height: 0.4 },
    ],
    colors: { ground: '#c4ad86', groundAlt: '#b39a72', grass: '#8a9050', high: '#a49070', rock: '#8a7c68' },
    patches: [{ x: 0, z: -20, r: 300, color: '#d8c49c', strength: 0.4, rough: 0.1 }],
  },

  objects: [],

  scatter: [
    { type: 'tree', count: 30, center: [0, 60], ring: [40, 220], arc: [0, Math.PI], spacing: 10, seed: 331, props: { kind: 'palm', leaf: '#5f7a3a' } },
    { type: 'tree', count: 30, center: [0, 80], ring: [60, 260], arc: [0, Math.PI], spacing: 12, seed: 332, props: { kind: 'broad', leaf: '#6a7a42' } },
    { type: 'rock', count: 20, center: [0, -18], ring: [10, 120], arc: [Math.PI, Math.PI * 2], spacing: 8, seed: 333, props: { size: 1.4, color: '#8a7c68' } },
  ],

  crowd: {
    palette: {
      robes: ['#8b6b4a', '#a0825c', '#6e5a44', '#b59a72', '#7a4e36', '#5e4b3a'],
      mantles: ['#5a3d2b', '#7d5c3e', '#3f4d5e', '#556246'],
      skins: ['#8a5a3c', '#9b6a46', '#a87652'],
      mantleChance: 0.5,
      hoodChance: 0.3,
    },
    groups: [
      { count: 14, center: [0, 22], ring: [8, 30], arc: [0, Math.PI], spacing: 3, seed: 334, avoid: [{ rect: [HOUSE[0], HOUSE[1], 14, 14] }], children: 0.2 },
    ],
  },

  figures: [],

  custom(ctx) {
    const { THREE } = ctx;
    water(ctx, { x: 0, z: -420, y: -0.5, w: 1200, d: 800, color: '#3f7f96', amp: 0.09, specular: '#fff2d8' });

    const top = house(ctx, { x: HOUSE[0], z: HOUSE[1], w: 10, d: 9, h: 4.2, color: '#d6c4a0', door: true }).top;
    const stepH = 0.3, steps = Math.ceil((top - ctx.heightAt(6, 10)) / stepH);
    for (let i = 0; i < steps; i++) {
      const sx = 5.8, sz = 9 - i * 0.42;
      const by = ctx.heightAt(sx, sz) - 0.4;
      const h = Math.min(top, ctx.heightAt(sx, 10) + (i + 1) * stepH) - by;
      ctx.solid.box(1.3, h, 0.44, { position: [sx, by + h / 2, sz], color: '#c8b48e', jitter: 0.05 });
      ctx.colliders.add({ x: sx, z: sz, w: 1.3, d: 0.42, bottom: by, top: by + h });
    }
    // Roof awning and drying hides from the tannery.
    for (const [px, pz] of [[-4.4, 8.2], [-4.4, 5.8], [-1.8, 8.2], [-1.8, 5.8]]) ctx.solid.add(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), { position: [px, top + 1.1, pz], color: '#5a4332' });
    ctx.solid.box(3.0, 0.06, 2.8, { position: [-3.1, top + 2.2, 7], rotation: [0.06, 0, 0], color: '#b0563a' });
    ctx.solid.box(0.9, 0.08, 1.4, { position: [-3.2, top + 0.05, 4.2], color: '#6a5a44' });
    for (let i = 0; i < 4; i++) ctx.solid.box(1.4, 1.1, 0.04, { position: [-9 - i * 1.8, ctx.heightAt(-9, 8) + 1.2, 9], rotation: [0, 0.1, 0.05], color: i % 2 ? '#8a5a3a' : '#a07048' });

    figure(ctx, { x: PETER[0], z: PETER[1], y: top, face: [SHEET[0], SHEET[2]], pose: 'kneel', robe: '#6a5a8a', mantle: '#8a6a3a', arms: 'out' });

    town(ctx, { center: [0, 60], radius: 55, count: 55, seed: 335, avoid: [{ x: HOUSE[0], z: HOUSE[1], r: 13 }, { x: 0, z: 18, r: 9 }], colors: ['#d8c8a6', '#cbb68e', '#e0d2b2', '#c4ae86'], height: [3, 7] });
    town(ctx, { center: [-60, 4], radius: 30, count: 14, seed: 336, colors: ['#d8c8a6', '#cbb68e'], height: [3, 5] });
    town(ctx, { center: [60, 6], radius: 30, count: 14, seed: 337, colors: ['#d8c8a6', '#cbb68e'], height: [3, 5] });
    boat(ctx, { x: -14, z: -14, y: -0.95, rot: 1.3, len: 7, color: '#6b4a32' });
    boat(ctx, { x: 18, z: -26, y: -0.95, rot: 0.4, len: 8, color: '#5e4230', collide: false });
    boat(ctx, { x: -40, z: -60, y: -0.95, rot: 2.0, len: 10, color: '#5e4230', collide: false });

    // The sheet: knit at the four corners, sagging with beasts, creeping things and birds.
    const group = new THREE.Group();
    const S = 4.2;
    const cloth = new THREE.PlaneGeometry(S * 2, S * 2, 8, 8).rotateX(-Math.PI / 2);
    const p = cloth.attributes.position;
    const sag = (x, z) => -(1 - (x / S) ** 2) * (1 - (z / S) ** 2) * 2.4;
    for (let i = 0; i < p.count; i++) p.setY(i, sag(p.getX(i), p.getZ(i)));
    cloth.computeVertexNormals();
    group.add(new THREE.Mesh(cloth, new THREE.MeshLambertMaterial({ color: '#d8cfbc', emissive: '#fff4dc', emissiveIntensity: 0.05, side: THREE.DoubleSide, flatShading: true })));
    const b = new Batch(ctx.rand);
    const kinds = [
      { color: '#8a6a4a', horns: true }, { color: '#e8e0d0', horns: false, long: 0.8 }, { color: '#5a4434', horns: true },
      { color: '#3a3430', horns: false, long: 0.9 }, { color: '#b08a5a', horns: false, long: 1.2 }, { color: '#d8c8a8', horns: true, long: 0.8 },
    ];
    kinds.forEach((k, i) => {
      const a = (i / kinds.length) * Math.PI * 2, r = 1.9;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      beast(b, { x, y: sag(x, z) + 0.12, z, rot: a + 1.6, s: 0.75, ...k });
    });
    beast(b, { x: 0, y: sag(0, 0) + 0.1, z: 0, rot: 0.4, s: 0.9, color: '#6a4a3a', horns: true });
    for (let i = 0; i < 3; i++) {
      const path = [];
      for (let k = 0; k < 12; k++) {
        const x = -2.6 + i * 2.2 + Math.sin(k * 0.8 + i) * 0.3, z = -2.4 + k * 0.16 + (i === 1 ? 2.6 : 0);
        path.push([x, sag(x, z) + 0.05, z]);
      }
      serpent(b, { path, color: ['#4e5a32', '#6a4a2a', '#3a3a34'][i] });
    }
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7, r = 1 + (i % 3) * 1.1;
      bird(b, { x: Math.cos(a) * r, y: 0.9 + (i % 4) * 0.5, z: Math.sin(a) * r, rot: a * 2, s: 0.8, color: ['#e8e4dc', '#7a6a5a', '#3a3a3a', '#c8a070'][i % 4] });
    }
    group.add(b.build(new THREE.MeshLambertMaterial({ vertexColors: true })));
    for (const [cx, cz] of [[-S, -S], [S, -S], [-S, S], [S, S]]) {
      const ropeLen = 34;
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, ropeLen, 4).translate(0, ropeLen / 2, 0), new THREE.MeshBasicMaterial({ color: '#fff6e0', toneMapped: false }));
      rope.position.set(cx, 0, cz);
      rope.lookAt(0, ropeLen, 0);
      rope.rotateX(Math.PI / 2);
      group.add(rope);
    }
    group.position.set(...SHEET);
    group.rotation.set(0.38, 0.2, 0, 'YXZ');
    ctx.scene.add(group);
    ctx.onFrame((t) => {
      group.position.y = SHEET[1] + Math.sin(t * 0.6) * 0.3;
      group.rotation.y = 0.2 + Math.sin(t * 0.25) * 0.06;
    });

    brightCloud(ctx, { x: SHEET[0], y: SHEET[1] + 36, z: SHEET[2] - 8, size: 12, count: 12, seed: 5, glow: 0.7 });
    ctx.effects.beam({ position: [SHEET[0], SHEET[1] + 9, SHEET[2] - 6], height: 50, radiusBottom: 3, radiusTop: 10, color: '#fff2d6', opacity: 0.3 });
    ctx.effects.halo({ position: [SHEET[0], SHEET[1] + 30, SHEET[2]], size: 60, opacity: 0.6, color: '#fff6e0' });
    ctx.effects.motes({ position: [SHEET[0], SHEET[1] + 2, SHEET[2] - 4], radius: 7, height: 40, count: 160 });
    const pl = new THREE.PointLight('#fff4dc', 14, 20, 1.3);
    pl.position.set(SHEET[0], SHEET[1] + 4, SHEET[2] + 3);
    ctx.scene.add(pl);
  },
};
