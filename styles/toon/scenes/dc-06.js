// D&C 88:127-141: The School of the Prophets meets in the upper room of Newel K. Whitney's store, Kirtland,
// winter 1833. The store's ground floor is solid; the upper room is a roofless cutaway reached by outside stairs.
import { bench, book, candle, fireplace, floor, gableRoof, periodCrowd, periodPerson, room, table, trackAvatar } from './lib/dc-01-kit.js';

const W = 10, D = 8, H1 = 3.2;

export default {
  title: 'D&C 88:127-141: The School of the Prophets',
  subtitle: "The upper room of the Whitney store, Kirtland, Ohio, winter 1833",
  seed: 88,

  style: {
    ink: '#1f1820',
    toonSteps: [0.42, 0.74, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [60, 400, 300, 0.5] },
    grain: 0.05,
    fog: { color: '#d8d4dc', near: 70, far: 600 },
  },

  sky: { zenith: '#4a5a86', mid: '#9aa0bc', horizon: '#f2d0b0', ground: '#c8c4cc', glowColor: '#ffd8a8', glowDir: [-1, 0.15, 0.3] },

  sun: { dir: [-0.8, 0.45, 0.4], color: '#ffd8b0', intensity: 2.0, hemi: { sky: '#c8d0e8', ground: '#8a8090', intensity: 1.15 }, shadowSize: 45 },

  ground: {
    size: 1200, segments: 240, flatRadius: 90, hillHeight: 26, undulation: 0,
    plaza: { center: [0, 14], size: [80, 7] },
    colors: { sand: '#eceaf0', dirt: '#dcd8e4', grass: '#e4e2ec', grassDark: '#cfcadc', plaza: '#9a8a7a', plazaLine: '#8a7a6a', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#d8d6e2' },
  },

  mountains: { count: 22, distance: [480, 760], height: [30, 70], widthRatio: [2.6, 3.6], colors: ['#9aa0b8', '#a4aac0', '#8e94ac'] },

  objects: [],

  custom(ctx) {
    const { THREE, scene, kit } = ctx;
    const avatar = trackAvatar(ctx, {});

    // Ground-floor store: solid white clapboard block with shop windows, walkable roof deck under the upper room.
    const store = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, H1, D + 0.3), kit.toon('#f1ede4'));
    store.position.set(0, H1 / 2, 0);
    store.castShadow = store.receiveShadow = true;
    scene.add(store);
    ctx.addCollider({ x: 0, z: 0, hx: W / 2 + 0.15, hz: D / 2 + 0.15, rot: 0, top: H1, walkable: true });
    const dark = kit.toon('#3a4258', { emissive: '#1a1e2a' });
    const trimMat = kit.toon('#5a6a5a');
    for (const x of [-3.2, 3.2]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2, 1.7, 0.1), dark);
      win.position.set(x, 1.6, D / 2 + 0.17);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.9, 0.06), trimMat);
      frame.position.set(x, 1.6, D / 2 + 0.15);
      scene.add(frame, win);
    }
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.1), kit.toon('#4a5a48'));
    door.position.set(0, 1.15, D / 2 + 0.17);
    const band = new THREE.Mesh(new THREE.BoxGeometry(W + 0.5, 0.25, D + 0.5), kit.toon('#e2dccc'));
    band.position.set(0, H1 - 0.05, 0);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(4, 0.45, 0.08), kit.toon('#2e3a2e'));
    sign.position.set(0, 2.75, D / 2 + 0.3);
    scene.add(door, band, sign);

    // Outside stair up the east side to the upper-room door.
    const steps = 12, rise = H1 / steps, run = 0.4, sx = W / 2 + 0.85;
    const stairGeo = [];
    for (let i = 0; i < steps; i++) {
      const top = (i + 1) * rise, z = D / 2 + 0.6 - i * run;
      const g = new THREE.BoxGeometry(1.3, top, run);
      g.translate(sx, top / 2, z);
      stairGeo.push(g);
      ctx.addCollider({ x: sx, z, hx: 0.65, hz: run / 2, rot: 0, top, walkable: true });
    }
    const landingZ = D / 2 + 0.6 - steps * run - 0.6;
    const landing = new THREE.BoxGeometry(1.3, 0.2, 1.4).translate(sx, H1 - 0.1, landingZ);
    stairGeo.push(landing);
    ctx.addCollider({ x: sx, z: landingZ, hx: 0.65, hz: 0.7, rot: 0, top: H1, walkable: true });
    for (const s of stairGeo) {
      const m = new THREE.Mesh(s, kit.toon('#8a7a68'));
      m.castShadow = m.receiveShadow = true;
      scene.add(m);
    }

    // Upper room.
    const doorAt = D / 2 + landingZ;
    const r = room(ctx, {
      x: 0, z: 0, y: H1, w: W, d: D, h: 2.6, kind: 'plain', color: '#efe9da', trim: '#f7f3ea', glass: '#c8d8e8', colliderTop: 2.6, avatar,
      openings: {
        e: [{ at: doorAt, width: 1.1, top: 2.0, kind: 'door' }, { at: 6, width: 0.9, bottom: 0.9, top: 1.9, kind: 'window' }],
        w: [{ at: 2.5, width: 0.9, bottom: 0.9, top: 1.9, kind: 'window' }, { at: 5.5, width: 0.9, bottom: 0.9, top: 1.9, kind: 'window' }],
        s: [{ at: 2.6, width: 0.9, bottom: 0.9, top: 1.9, kind: 'window' }, { at: 7.6, width: 0.9, bottom: 0.9, top: 1.9, kind: 'window' }],
        n: [{ at: 2.6, width: 0.9, bottom: 0.9, top: 1.9, kind: 'window' }],
      },
    });
    gableRoof(ctx, r.outside, { x: 0, z: 0, w: W, d: D, y: H1 + 2.6, rise: 2.3, color: '#4a4448', gable: '#efe9da' });
    floor(ctx, { x: 0, z: 0, y: H1, w: W, d: D, color: '#b08a5e', lines: '#8a6a44' });
    fireplace(ctx, { pos: [W / 2 - 3.2, -D / 2 + 0.45], y: H1, color: '#8a6a58', height: 2.5 });
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), kit.stoneMat('#8a6a58'));
    chim.position.set(W / 2 - 3.2, H1 + 2.6 + 2.0, -D / 2 + 0.45);
    r.outside.add(chim);

    // Joseph teaches from the front; elders on benches around the room.
    table(ctx, { pos: [-1.2, -2.6], y: H1, size: [1.6, 0.8] });
    book(ctx, [-1.5, H1 + 0.8, -2.6], { open: true });
    book(ctx, [-0.8, H1 + 0.8, -2.5], { color: '#3a2418' });
    candle(ctx, [-0.6, H1 + 0.8, -2.8], 2.5);
    candle(ctx, [-1.9, H1 + 0.8, -2.8], 0);
    periodPerson(ctx, { pos: [-1.2, -3.3], y: H1, face: [0, 2], arms: [[0.15, 0.1], [0.35, 1.0]], colors: { body: '#2e3440', skin: '#e8c3a0', hair: '#7a5530' } });

    const people = [];
    const face = [-0.6, -1.2];
    const row = (x0, z0, x1, z1, n, rotY) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      bench(ctx, { pos: [(x0 + x1) / 2, (z0 + z1) / 2], y: H1, len, rotY, color: '#7a5a3c' });
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        people.push({ x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, y: H1, face, kind: 'man', pose: 'sit' });
      }
    };
    row(-W / 2 + 0.6, -1.8, -W / 2 + 0.6, 2.4, 5, Math.PI / 2);
    row(W / 2 - 0.6, -2.2, W / 2 - 0.6, 0.5, 3, Math.PI / 2);
    row(-3.4, 0.2, -0.6, 0.2, 4, 0);
    row(0.8, 0.2, 3.6, 0.2, 3, 0);
    row(-3.4, 1.6, -0.6, 1.6, 4, 0);
    row(0.8, 1.6, 3.6, 1.6, 3, 0);
    people.push({ x: -3.4, z: -3.3, y: H1, face, kind: 'man' }, { x: -4.2, z: 3.3, y: H1, face, kind: 'man' }, { x: 3.4, z: 3.2, y: H1, face, kind: 'man' });
    periodCrowd(ctx, people, { seed: 12, jitter: 0.15 });

    // Kirtland street: neighboring frame houses and bare winter trees.
    const house = (x, z, w, d, h, color) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), kit.toon(color));
      m.position.set(x, h / 2, z);
      m.castShadow = m.receiveShadow = true;
      scene.add(m);
      const g = new THREE.Group();
      scene.add(g);
      gableRoof(ctx, g, { x, z, w, d, y: h, rise: 2, color: '#4a4448', gable: color });
      for (const wx of [-w / 4, w / 4]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.08), dark);
        win.position.set(x + wx, h * 0.55, z + d / 2 + 0.04);
        scene.add(win);
      }
      ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: 0, top: h + 2 });
      ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 2, hz: d / 2 + 2 });
    };
    house(-18, 1, 9, 7, 5.5, '#f1ede4');
    house(19, 2, 8, 7, 5, '#e8dcc8');
    house(-34, -1, 8, 6, 4.5, '#c8a888');
    house(34, 0, 10, 7, 5.5, '#f1ede4');
    house(-10, 30, 9, 7, 5, '#f1ede4');
    house(14, 32, 8, 6, 4.5, '#d8c8b0');
    ctx.exclude({ kind: 'rect', x: 0, z: 14, hx: 60, hz: 5 });
    ctx.exclude({ kind: 'rect', x: 0, z: 0, hx: 9, hz: 8 });
    ctx.builders.trees({ count: 90, ring: [12, 200], height: [7, 12], broken: 0, fallen: 0, trunkColor: '#4a3a34', leafColors: ['#8a7a78', '#9a8a86', '#7a6c70'] }, ctx);
  },

  clouds: {
    layers: [{ count: 30, distance: [320, 700], height: [80, 170], size: [30, 70], color: '#f4e0d0', shade: '#6a6a8a' }],
  },

  player: {
    start: [1.6, 2.8],
    lookAt: [-1.2, -4],
    colors: { robe: '#3a3530', mantle: '#3a3530', skin: '#e0b48e', hair: '#5a3a22' },
  },
};
