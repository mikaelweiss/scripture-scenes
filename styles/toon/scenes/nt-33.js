// Acts 10:9-16: at the sixth hour Peter prays on the housetop of Simon the tanner in Joppa,
// and sees a great sheet let down from heaven by four corners, full of beasts, creeping things and fowls.
// The sea lies north. Simon's house stands on the shore with a walkable roof and an outside stair on its east side.
import * as THREE from 'three';
import { Batch, box, cyl, DAY_STYLE, frameAt, glow, house, PALETTE, palm, person, ringPoints } from './lib/nt-32-kit.js';
import { animal as beast, beach, buildShip, calmWater, foamLine, rod } from './lib/nt-32-sea.js';

const shore = (x) => -26 + 3 * Math.sin(x * 0.04) + 2 * Math.sin(x * 0.11 + 1);
const ROOF = 4.6;
const W = 12, D = 10;
const PETER = [0.5, -1.8];
const SHEET = [0, -10.5];

function seaDrawn(x, z, y) {
  const d = shore(x) - z;
  if (d <= -6) return y;
  const k = THREE.MathUtils.smoothstep(d, -6, 4);
  return y * (1 - k) + k * (-0.6 - Math.min(Math.max(d, 0) * 0.25, 4));
}

export default {
  title: "Acts 10:9-16: Peter's vision at Joppa",
  subtitle: 'Upon the housetop at the sixth hour, a sheet let down from heaven',
  seed: 33,

  style: { ...DAY_STYLE, fog: { color: '#e8eedc', near: 160, far: 1200 } },

  sky: { zenith: '#2f78a0', mid: '#79b4c4', horizon: '#eef0d8', ground: '#4f9aa8', glowColor: '#fff4cc', glowDir: [0, 0.75, -1] },

  sun: { dir: [0.2, 1, 0.35], color: '#fff2da', intensity: 2.6, hemi: { sky: '#dcefee', ground: '#b08a5a', intensity: 1.2 }, shadowSize: 60 },

  ground: {
    size: 1600, segments: 300, flatRadius: 90, hillHeight: 40, undulation: 0.25,
    plaza: { center: [9999, 9999], size: [0, 0] },
    colors: { sand: '#e0c38e', dirt: '#cfa874', grass: '#a6aa66', grassDark: '#86904e', plaza: '#e2cfa4', plazaLine: '#c3a676', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#b8a070' },
  },

  objects: [],

  custom(ctx) {
    const { scene, kit } = ctx;
    const b = new Batch(ctx);

    // Sea to the north, behind a shore the player cannot cross.
    const mesh = scene.children.find((o) => o.isMesh && o.geometry.attributes.position?.count > 20000);
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, seaDrawn(pos.getX(i), pos.getZ(i), pos.getY(i)));
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    calmWater(ctx, { y: -0.25, color: '#3f8fa0', light: '#a8dcd8', dark: '#2f7080', tile: 16 });
    beach(ctx, shore, (x, z) => seaDrawn(x, z, ctx.terrainHeight(x, z)), { from: -320, to: 320, sea: 6, land: 9, color: '#ead6a4', wet: '#c9ad78' });
    foamLine(ctx, (x) => shore(x) - 1.5, { from: -320, to: 320, y: -0.18, width: 1 });
    for (let x = -330; x <= 330; x += 8) ctx.addCollider({ x, z: shore(x) - 3, hx: 4.5, hz: 1.5, rot: 0, top: 60 });

    // Simon the tanner's house: flat walkable roof, low parapet, outside stair up the east wall.
    const y0 = ctx.terrainHeight(0, 0) - 0.1;
    const f = frameAt(0, y0, 0);
    b.add('#e3cfa6', box(W, ROOF, D, [0, ROOF / 2, 0]), { frame: f });
    b.add('#c9b07e', box(W + 0.3, 0.2, D + 0.3, [0, ROOF + 0.05, 0]), { frame: f });
    ctx.addCollider({ x: 0, z: 0, hx: W / 2, hz: D / 2, rot: 0, top: y0 + ROOF + 0.15, walkable: true });
    const par = (x, z, w, d) => {
      b.add('#e8d6ae', box(w, 0.7, d, [x, ROOF + 0.45, z]), { frame: f });
      ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: y0 + ROOF + 0.85 });
    };
    par(0, -D / 2 + 0.15, W, 0.3);
    par(0, D / 2 - 0.15, W, 0.3);
    par(-W / 2 + 0.15, 0, 0.3, D);
    par(W / 2 - 0.15, 1.2, 0.3, D - 2.4);
    for (const [x, z] of [[-3, D / 2 + 0.03], [3.2, D / 2 + 0.03]]) b.add('#3a2418', box(0.8, 0.9, 0.1, [x, 2.8, z]), { frame: f });
    b.add('#3a2418', box(1.3, 2.2, 0.1, [0, 1.1, D / 2 + 0.03]), { frame: f });
    const steps = 12, rise = ROOF / steps, run = 0.72;
    for (let k = 0; k < steps; k++) {
      const top = (k + 1) * rise;
      const z = 4.6 - k * run;
      b.add('#d8c095', box(1.6, top, run, [W / 2 + 0.8, top / 2, z]), { frame: f });
      ctx.addCollider({ x: W / 2 + 0.8, z, hx: 0.8, hz: run / 2, rot: 0, top: y0 + top, walkable: true });
    }
    b.add('#d8c095', box(1.6, ROOF, 1.8, [W / 2 + 0.8, ROOF / 2, 4.6 - steps * run - 0.5]), { frame: f });
    ctx.addCollider({ x: W / 2 + 0.8, z: 4.6 - steps * run - 0.5, hx: 0.8, hz: 0.9, rot: 0, top: y0 + ROOF + 0.15, walkable: true });
    // An awning of poles and cloth on the roof, and a mat where Peter kneels.
    for (const [x, z] of [[-5, 1.4], [-5, 4.2], [-1.5, 1.4], [-1.5, 4.2]]) b.add('#6b4a33', cyl(0.07, 0.07, 2.2, [x, ROOF + 1.1, z]), { frame: f });
    b.add('#b5523b', box(3.9, 0.08, 3.2, [-3.25, ROOF + 2.2, 2.8]), { frame: f });
    b.add('#c8912e', box(1.6, 0.04, 2.2, [PETER[0], ROOF + 0.17, PETER[1] + 0.3]), { frame: f, cast: false });
    exclude(ctx, 0, 0, W / 2 + 2.5, D / 2 + 1.5);

    // The tannery yard: vats, hides stretched on frames, a low wall.
    for (const [x, z] of [[-9, 2], [-9, 5], [-11.5, 3.5]]) {
      b.add('#8a6a48', cyl(0.9, 1, 0.9, [x, ctx.terrainHeight(x, z) + 0.4, z], [0, 0, 0], 12));
      b.add('#5a4030', cyl(0.82, 0.82, 0.05, [x, ctx.terrainHeight(x, z) + 0.86, z], [0, 0, 0], 12), { cast: false });
      ctx.addCollider({ x, z, hx: 0.95, hz: 0.95, rot: 0, top: ctx.terrainHeight(x, z) + 0.9 });
    }
    for (const [x, z, r] of [[-9, 10, 0.1], [-5, 11, -0.1], [9.5, 10, 0.2]]) {
      const g = ctx.terrainHeight(x, z);
      const ff = frameAt(x, g, z, r);
      for (const sx of [-1, 1]) b.add('#6b4a33', cyl(0.06, 0.06, 2, [sx * 1.1, 1, 0]), { frame: ff });
      b.add('#6b4a33', cyl(0.05, 0.05, 2.4, [0, 1.95, 0], [0, 0, Math.PI / 2]), { frame: ff });
      b.add('#b88a5a', box(1.8, 1.4, 0.06, [0, 1.15, 0]), { frame: ff });
      ctx.addCollider({ x, z, hx: 1.2, hz: 0.2, rot: r, top: g + 2 });
    }

    // Joppa: houses climbing the slope to the south, east and west.
    const colors = ['#e3cfa6', '#d8c095', '#e8d6ae', '#cdb48a', '#efe3c2'];
    const spots = ringPoints(ctx, { center: [0, 10], ring: [22, 120], count: 70, seed: 6, margin: 4, reject: (x, z) => z < shore(x) + 6 || (Math.abs(x) < 16 && z < 22) });
    spots.forEach(([x, z, r], i) => house(b, ctx, { pos: [x, z], size: [6 + r * 4, 5 + ((i * 7) % 5)], height: 3.5 + r * 3, rot: (r - 0.5) * 0.3, color: colors[i % colors.length], trim: '#c2a27a', upper: r > 0.7 }));
    for (const [x, z, s] of [[-14, -14, 1], [15, -15, 2], [-22, -10, 3], [24, -8, 4], [-30, -14, 5], [12, 14, 6]]) palm(b, ctx, { pos: [x, z], height: 7 + (s % 3), lean: 0.15 + (s % 2) * 0.12, dir: s * 1.3, seed: s });

    // Fishing boats and the rocks off the harbour.
    buildShip(ctx, { pos: [-60, -90], rot: 0.4, y: -1.2, L: 12, B: 3.6, D: 2, sail: 'set', collide: false });
    buildShip(ctx, { pos: [70, -140], rot: -0.3, y: -1.2, L: 10, B: 3.2, D: 1.8, sail: 'set', collide: false });
    buildShip(ctx, { pos: [48, -75], rot: 1.4, y: -1.0, L: 8, B: 2.8, D: 1.6, sail: 'furled', collide: false });
    for (const [x, z, s] of [[-20, -60, 3], [-14, -64, 2], [-26, -58, 1.6], [40, -70, 2.4]]) b.add('#8a8070', new THREE.DodecahedronGeometry(s, 0).scale(1.4, 1, 1).translate(x, -0.6 + s * 0.4, z));

    // Peter kneeling in prayer, looking up at the vision.
    const peter = person(ctx, { pos: PETER, scale: 1.3, y: y0 + ROOF + 0.15, face: [SHEET[0], SHEET[1]], colors: { robe: '#e6d8b8', mantle: '#4f6fa0', skin: '#a8724a', hair: '#cfc6b4', sash: '#8c5a3c', arms: [0.6, 1.9] }, kneel: true });
    peter.rotation.x = -0.15;

    // Cornelius's messengers arrive at the gate below.
    person(ctx, { pos: [1.5, 14], face: [0, 6], colors: { robe: '#8c5a3c', mantle: '#d9c7a3', skin: '#c08f66', hair: '#3a2418', sash: '#5e4632' } });
    person(ctx, { pos: [-0.5, 14.8], face: [0, 6], colors: { robe: '#7a6a52', mantle: '#5e4632', skin: '#b5825a', hair: '#2b1a12', sash: '#c8912e' } });
    person(ctx, { pos: [3.2, 15.4], face: [0, 6], colors: { robe: '#a64b35', mantle: '#c8912e', skin: '#c08f66', hair: '#2b1a12', sash: '#d9c7a3' } });
    b.flush();

    // The great sheet, knit at the four corners, let down from heaven and drawn up again.
    const sheet = new THREE.Group();
    const S = 8.5;
    const cloth = new THREE.PlaneGeometry(S, S, 16, 16);
    cloth.rotateX(-Math.PI / 2);
    const cp = cloth.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const u = cp.getX(i) / (S / 2), v = cp.getZ(i) / (S / 2);
      cp.setY(i, -0.9 * (1 - u * u) * (1 - v * v) + 0.15 * Math.sin(u * 5) * (1 - v * v));
    }
    cloth.computeVertexNormals();
    const clothMesh = new THREE.Mesh(cloth, kit.toon('#fbf7ee', { emissive: '#a8a290', side: THREE.DoubleSide }));
    clothMesh.castShadow = true;
    sheet.add(clothMesh);
    const cords = [];
    for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cords.push(rod([cx * S / 2, 0.05, cz * S / 2], [cx * 0.3, 26, cz * 0.3], 0.05, 4));
    for (const g of cords) {
      const m = new THREE.Mesh(g, kit.basic('#fff6d8'));
      sheet.add(m);
    }
    const creatures = [
      ['sheep', [-1.5, -0.6], 0.5, 0.75], ['goat', [1.2, 0.8], -2.4, 0.85], ['wildGoat', [0.3, -1.5], 1.2, 0.75], ['ox', [-0.3, 1.0], 2.8, 0.55], ['camel', [1.6, -1.1], -0.8, 0.42], ['ass', [-1.8, 1.4], 1.9, 0.6],
    ];
    for (const [kind, [x, z], rot, s] of creatures) {
      const a = beast(ctx, kind, {});
      a.scale.setScalar(s);
      a.rotation.y = rot;
      const u = x / (S / 2), v = z / (S / 2);
      a.position.set(x, -0.9 * (1 - u * u) * (1 - v * v) + 0.05, z);
      sheet.add(a);
    }
    const birdMat = kit.toon('#f4efe4');
    for (const [x, y, z, r] of [[-0.6, 0.9, 0.2, 0], [0.9, 1.3, -0.4, 2], [0.2, 2.2, 0.9, 4], [-1.4, 1.8, -1, 1]]) {
      const bird = new THREE.Group();
      bird.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6).scale(0.8, 0.7, 1.6), birdMat));
      for (const sx of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.22), birdMat);
        w.position.x = sx * 0.3;
        w.rotation.z = sx * 0.4;
        bird.add(w);
      }
      bird.position.set(x, y, z);
      bird.rotation.y = r;
      sheet.add(bird);
    }
    const snake = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.6, 0, 0.2], [-0.2, 0, 0.5], [0.2, 0, 0.1], [0.6, 0, 0.4], [0.9, 0, 0]].map((p) => new THREE.Vector3(...p))), 20, 0.05, 5), kit.toon('#6f7f40'));
    snake.position.set(0.4, -0.8, 0.3);
    sheet.add(snake);
    const lizard = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5).scale(1, 0.5, 3), kit.toon('#8a7a4a'));
    lizard.position.set(-0.8, -0.7, -0.9);
    sheet.add(lizard);
    sheet.traverse((o) => o.isMesh && (o.castShadow = true));
    const baseY = y0 + ROOF + 3.6;
    sheet.position.set(SHEET[0], baseY, SHEET[1]);
    scene.add(sheet);
    const shine = glow(ctx, { pos: [SHEET[0], baseY + 1, SHEET[1]], size: 14, color: '#fff3c8', opacity: 0.45, pulse: 0.05 });
    ctx.onFrame((t) => {
      const y = baseY + Math.sin(t * 0.35) * 0.7;
      sheet.position.y = y;
      sheet.rotation.y = Math.sin(t * 0.2) * 0.12;
      shine.position.y = y + 0.5;
    });
    glow(ctx, { pos: [SHEET[0], baseY + 26, SHEET[1]], size: 26, color: '#fffbe8', opacity: 0.95, pulse: 0.03 });
    glow(ctx, { pos: [SHEET[0], baseY + 26, SHEET[1]], size: 9, color: '#ffffff', opacity: 1, pulse: 0.05 });
  },

  clouds: {
    layers: [
      { count: 30, distance: [380, 800], height: [80, 160], size: [40, 80], color: '#fffaf0', shade: '#7f8fa4' },
      { count: 16, center: SHEET, distance: [16, 40], height: [58, 70], size: [14, 26], color: '#fffdf4', shade: '#c8c0a8', drift: 0.01 },
    ],
  },

  light: {
    beams: [{ from: [0, 120, -12], to: { pos: [0, ROOF + 4, -12] }, width: [16, 9], color: '#fff6d8', intensity: 0.16, layers: 2, stripes: 22, fadeLow: 0.1 }],
    pointLights: [{ pos: [0, ROOF + 9, -10], color: '#fff2c8', intensity: 10, distance: 22 }],
  },

  player: {
    start: [3.8, 1.8],
    y: ROOF,
    lookAt: [-1.6, -9],
    colors: { robe: '#4f7f80', mantle: '#d9c7a3', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};

function exclude(ctx, x, z, hx, hz) {
  ctx.exclude({ kind: 'rect', x, z, hx, hz, rot: 0 });
}
