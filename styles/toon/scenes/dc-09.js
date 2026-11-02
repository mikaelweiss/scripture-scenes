// D&C 103, 105: Zion's Camp marches west across the prairie toward Missouri, May-June 1834.
// x is east, z is south. The road runs east-west; the column heads west (-x).
import { Batch, MEN, WOMEN, baseStyle, box, cyl, horse, leafTree, makeRng, saint, wagon } from './lib/dc-08-kit.js';

const roadZ = (x) => (Math.abs(x) < 70 ? 0 : Math.sign(x) * 0.004 * (Math.abs(x) - 70) ** 2 * (x < 0 ? -1 : 1));
const WEST = [-3000, 0];

function road(ctx) {
  const { THREE } = ctx;
  const pos = [], idx = [];
  const n = 240;
  for (let i = 0; i <= n; i++) {
    const x = -260 + (i / n) * 520;
    for (const s of [-1, 1]) {
      const z = roadZ(x) + s * 2.6;
      pos.push(x, ctx.terrainHeight(x, z) + 0.05, z);
    }
    if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, ctx.kit.toon('#b8955e'));
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  for (const s of [-1, 1]) {
    const rut = [], ri = [];
    for (let i = 0; i <= n; i++) {
      const x = -260 + (i / n) * 520;
      for (const k of [-0.12, 0.12]) {
        const z = roadZ(x) + s * 0.8 + k;
        rut.push(x, ctx.terrainHeight(x, z) + 0.07, z);
      }
      if (i < n) ri.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rut, 3));
    rg.setIndex(ri);
    rg.computeVertexNormals();
    ctx.scene.add(new THREE.Mesh(rg, ctx.kit.toon('#8f6e44')));
  }
}

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(1834);
  road(ctx);

  // Wagons in two trains along the column.
  const covers = ['#ece4cf', '#e4dac0', '#f0eadc', '#ddd2b8'];
  const teams = [['#6a4a32', '#4a3426'], ['#8a6a4a', '#6a4a32'], ['#3a2a20', '#5a4030'], ['#a07850', '#7a5636']];
  [-24, -14, -4, 6, 38, 48, 58].forEach((x, i) => wagon(b, ctx, { pos: [x, roadZ(x)], rot: -Math.PI / 2, cover: covers[i % 4], teamColors: teams[i % 4] }));

  // Mounted leaders and the camp flag at the head of the column.
  const head = [[-62, -0.9], [-62, 0.9], [-66.5, 0]];
  head.forEach(([x, z], i) => {
    horse(b, ctx, { pos: [x, z], rot: -Math.PI / 2, color: ['#5a3a26', '#2e2420', '#8a6040'][i] });
    saint(ctx, { pos: [x + 0.15, z], y: ctx.terrainHeight(x, z) + 1.55, face: WEST, pose: 'sit', colors: { ...pickMan(rng), tall: i === 2 } });
  });
  const fx = -57.5, fz = 1.4;
  const fy = ctx.terrainHeight(fx, fz);
  b.add('#6a4a32', cyl(0.05, 0.05, 5.2, [fx, fy + 2.6, fz], [0, 0, 0], 6));
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4, 10, 1), ctx.kit.toon('#f4efe2', { side: THREE.DoubleSide }));
  flag.geometry.translate(1.1, 0, 0);
  flag.position.set(fx, fy + 4.4, fz);
  flag.rotation.y = 0;
  ctx.scene.add(flag);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.28, 10, 1), ctx.kit.toon('#b5423b', { side: THREE.DoubleSide }));
  band.geometry.translate(1.1, -0.45, 0.01);
  flag.add(band);
  const base = flag.geometry.attributes.position.array.slice();
  const bandBase = band.geometry.attributes.position.array.slice();
  ctx.onFrame((t) => {
    for (const [g, src] of [[flag.geometry, base], [band.geometry, bandBase]]) {
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = src[i * 3];
        p.setZ(i, src[i * 3 + 2] + Math.sin(x * 2.4 - t * 4) * 0.12 * x);
      }
      p.needsUpdate = true;
    }
  });
  saint(ctx, { pos: [fx + 0.4, fz + 0.4], face: WEST, colors: pickMan(rng) });

  // Men walking alongside with muskets on their shoulders.
  for (let i = 0; i < 26; i++) {
    const x = -50 + i * 5.5 + rng() * 2;
    const z = roadZ(x) + (rng() < 0.5 ? -1 : 1) * (3.2 + rng() * 0.8);
    const fig = saint(ctx, { pos: [x, z], face: [x - 10, z], colors: pickMan(rng), hat: true });
    const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.5, 5), ctx.kit.toon('#3a2a20'));
    gun.position.set(0.22, 1.5, -0.1);
    gun.rotation.x = -0.9;
    fig.add(gun);
  }

  // A few families travel with the camp.
  for (const [x, dz] of [[24, -3.4], [26, 3.3], [70, -3.4]]) {
    const z = roadZ(x) + dz;
    saint(ctx, { pos: [x, z], face: WEST, kind: 'woman', colors: { robe: WOMEN.robes[Math.floor(rng() * 9)], mantle: '#d9cdb0', skin: '#e8c4a0', hair: '#5a3a22' } });
    saint(ctx, { pos: [x + 0.8, z + 0.3], face: WEST, kind: 'woman', scale: 0.62, colors: { robe: '#7a6450', mantle: '#e8e0cc', skin: '#f0d0b0', hair: '#7a5a3a' } });
  }

  // Groves of oak and hickory scattered over the rolling prairie.
  for (let i = 0; i < 140; i++) {
    const a = rng() * Math.PI * 2, r = 25 + Math.sqrt(rng()) * 260;
    const cx = Math.sin(a) * r, cz = Math.cos(a) * r;
    for (let k = 0, n = 2 + Math.floor(rng() * 4); k < n; k++) {
      const x = cx + (rng() - 0.5) * 14, z = cz + (rng() - 0.5) * 14;
      if (Math.abs(z - roadZ(x)) < 10) continue;
      leafTree(b, ctx, { pos: [x, z], height: 6 + rng() * 6, color: ['#5f8a4a', '#6a9450', '#4f7a40'][k % 3], color2: '#4a7038' });
    }
  }
  b.flush();
}

function pickMan(rng) {
  const p = (l) => l[Math.floor(rng() * l.length)];
  return { robe: p(MEN.robes), mantle: p(MEN.mantles), skin: p(MEN.skins), hair: p(MEN.hair), hat: p(['#1e1a18', '#3a3328', '#5a4a38', '#2b2420']) };
}

const column = (x0, x1, count) => ({ shape: 'rect', center: [(x0 + x1) / 2, 0], size: [x1 - x0, 2.8], count, kneel: 0, children: 0, facing: WEST, facingJitter: 0.12, lean: 0.03 });

export default {
  title: "D&C 103, 105: Zion's Camp",
  subtitle: 'Marching west across the prairie to Missouri, 1834',
  seed: 34,

  style: baseStyle({ color: '#dfe8e4', near: 120, far: 900 }),

  sky: { zenith: '#3f7fb8', mid: '#7fb2d6', horizon: '#e4eee6', ground: '#a8b878', glowColor: '#fff6d8', glowDir: [0.4, 0.4, 1] },

  sun: {
    dir: [-0.4, 0.85, 0.5],
    color: '#fff6e0',
    intensity: 2.4,
    hemi: { sky: '#d6e8f0', ground: '#8a9a5a', intensity: 1.1 },
    shadowSize: 70,
  },

  ground: {
    size: 1400,
    segments: 280,
    flatRadius: 90,
    hillHeight: 22,
    undulation: 0.5,
    plaza: { center: [0, 0], size: [0, 0] },
    colors: {
      sand: '#9fb064', dirt: '#8fa458', grass: '#7f9a4e', grassDark: '#647e3c', plaza: '#b8955e',
      plazaLine: '#a0804e', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7f9a5a',
    },
  },

  mountains: { count: 30, distance: [620, 780], height: [18, 40], widthRatio: [3, 5], colors: ['#7f9a8a', '#8aa496', '#94ac9a'] },

  objects: [],
  custom,

  crowd: {
    seed: 9,
    minSpacing: 0.75,
    facing: WEST,
    colors: MEN,
    groups: [
      column(-55, -30, 70),
      column(8, 30, 70),
      column(64, 95, 80),
    ],
  },

  player: {
    start: [-46, 10],
    lookAt: [-34, -12],
    colors: { robe: '#3a3328', mantle: '#4a3b2e', skin: '#e8c4a0', hair: '#5a3a22', sash: '#2b2420' },
  },
};
