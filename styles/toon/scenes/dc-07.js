// D&C 109: The Kirtland Temple is dedicated, March 27, 1836. The lower court is packed with Saints in box pews;
// Joseph Smith offers the dedicatory prayer from the Melchizedek pulpits at the north end.
import { glowSprite, periodCrowd, periodPerson, room, trackAvatar } from './lib/dc-01-kit.js';
import { makeRng } from '../engine/util.js';

const W = 17, D = 22, H = 7.2;
const NORTH = -D / 2, SOUTH = D / 2;

export default {
  title: 'D&C 109: The Kirtland Temple dedication',
  subtitle: 'The lower court of the new temple, Kirtland, Ohio, March 27, 1836',
  seed: 109,

  style: {
    ink: '#2a2020',
    toonSteps: [0.45, 0.76, 1.0],
    lines: { width: 1.4, depth: 0.08, normal: 0.35, fade: [60, 400, 300, 0.5] },
    grain: 0.04,
    fog: { color: '#e8e2d4', near: 90, far: 600 },
  },

  sky: { zenith: '#5a86b0', mid: '#a6c0d0', horizon: '#eee8d8', ground: '#9a9070', glowColor: '#fff6e0', glowDir: [0.6, 0.6, 0.3] },

  sun: { dir: [0.55, 0.85, 0.35], color: '#fff6e6', intensity: 2.1, hemi: { sky: '#e6ecf2', ground: '#9a8a70', intensity: 1.35 }, shadowSize: 40 },

  ground: {
    size: 1200, segments: 240, flatRadius: 90, hillHeight: 26, undulation: 0,
    plaza: { center: [0, 0], size: [W + 6, D + 6] },
    colors: { sand: '#b8b49a', dirt: '#a89a7a', grass: '#9aa070', grassDark: '#7a8a5a', plaza: '#c8c0b0', plazaLine: '#aaa290', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a9a6a' },
  },

  mountains: { count: 22, distance: [480, 760], height: [30, 70], widthRatio: [2.6, 3.6], colors: ['#8a9ab0', '#94a4b8', '#7e8ea6'] },

  objects: [],

  custom(ctx) {
    const { THREE, scene, kit } = ctx;
    const avatar = trackAvatar(ctx, {});
    const win = (at) => ({ at, width: 1.5, bottom: 1.4, top: 5.4, kind: 'window' });
    const r = room(ctx, {
      x: 0, z: 0, w: W, d: D, h: H, kind: 'plain', color: '#f4f0e6', trim: '#ffffff', glass: '#bcd4e2', colliderTop: 2.9, avatar,
      openings: {
        e: [win(4), win(8.5), win(13), win(17.5)],
        w: [win(4), win(8.5), win(13), win(17.5)],
        s: [{ at: 4.4, width: 1.6, top: 3, kind: 'door' }, { at: W - 4.4 + 0.3, width: 1.6, top: 3, kind: 'door' }],
      },
    });
    // Round window heads.
    const arch = new THREE.CircleGeometry(0.75, 16, 0, Math.PI);
    for (const side of [-1, 1]) for (const at of [4, 8.5, 13, 17.5]) {
      const m = new THREE.Mesh(arch, kit.toon('#bcd4e2', { emissive: '#3a4a52', side: THREE.DoubleSide }));
      m.position.set(side * (W / 2), 5.4, NORTH + at);
      m.rotation.y = Math.PI / 2;
      const wall = r.walls.find((wl) => wl.n[0] === side);
      wall?.grp.attach(m);
    }

    // Floor, ceiling and the central vault (shown only from inside).
    const fl = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, D), kit.toon('#c49a6a'));
    fl.position.y = 0.05;
    fl.receiveShadow = true;
    scene.add(fl);
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(W, 0.2, D), kit.toon('#f6f2ea', { side: THREE.DoubleSide }));
    ceil.position.y = H + 0.1;
    const vault = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, D, 24, 1, true, Math.PI / 2, Math.PI), kit.toon('#fbf8f0', { side: THREE.DoubleSide }));
    vault.rotation.x = Math.PI / 2;
    vault.position.y = H;
    for (const m of [ceil, vault]) m.castShadow = false;
    r.inside.add(ceil, vault);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W + 1, 0.4, D + 1), kit.toon('#5a5a62'));
    roof.position.y = H + 0.2;
    roof.castShadow = false;
    r.outside.add(roof);

    // Columns flanking the aisles.
    const colGeo = new THREE.CylinderGeometry(0.22, 0.26, H, 12).translate(0, H / 2, 0);
    for (const x of [-3.6, 3.6]) for (let i = 0; i < 4; i++) {
      const z = NORTH + 5 + i * 4.2;
      const c = new THREE.Mesh(colGeo, kit.toon('#ffffff'));
      c.position.set(x, 0, z);
      c.castShadow = true;
      scene.add(c);
      ctx.addCollider({ x, z, hx: 0.26, hz: 0.26, rot: 0, top: 2.9 });
    }

    // Tiered pulpits: four stepped rows at each end, three boxes per row.
    const white = kit.toon('#ffffff');
    const velvet = kit.toon('#8a2a2a');
    const pulpits = (endZ, dir, prefix) => {
      const g = new THREE.Group();
      for (let tier = 0; tier < 4; tier++) {
        const back = endZ - dir * 0.2;
        const depth = 3.6 - tier * 0.85;
        const zc = back + dir * depth / 2;
        const top = 0.45 * (tier + 1);
        const plat = new THREE.Mesh(new THREE.BoxGeometry(6.4 - tier * 0.4, top, depth), white);
        plat.position.set(0, top / 2, zc);
        plat.castShadow = plat.receiveShadow = true;
        g.add(plat);
        ctx.addCollider({ x: 0, z: zc, hx: 3.2 - tier * 0.2, hz: depth / 2, rot: 0, top, walkable: true });
        const frontZ = back + dir * depth;
        for (let k = -1; k <= 1; k++) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.35), white);
          box.position.set(k * 1.95, top + 0.52, frontZ - dir * 0.2);
          const cap = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), velvet);
          cap.position.set(k * 1.95, top + 1.08, frontZ - dir * 0.2);
          g.add(box, cap);
        }
        const label = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.04), kit.toon('#c8a24a'));
        label.position.set(0, top + 0.75, frontZ - dir * 0.02);
        g.add(label);
      }
      g.traverse((m) => (m.castShadow = true));
      scene.add(g);
      const seated = [];
      for (let tier = 0; tier < 4; tier++) {
        const depth = 3.6 - tier * 0.85;
        const z = endZ - dir * 0.2 + dir * (depth - 0.75);
        for (let k = -1; k <= 1; k++) {
          if (prefix === 'm' && tier === 1 && k === 0) continue;
          seated.push({ x: k * 1.95, z, y: 0.45 * (tier + 1), yaw: dir > 0 ? 0 : Math.PI, kind: 'man', pose: 'sit' });
        }
      }
      return seated;
    };
    const people = [...pulpits(NORTH, 1, 'm'), ...pulpits(SOUTH, -1, 'a')];
    // Joseph stands at the second tier and offers the prayer, hands raised.
    periodPerson(ctx, { pos: [0, NORTH - 0.2 + (3.6 - 0.85) - 0.75], y: 0.9, yaw: 0, arms: [[0.45, 2.3], [0.45, 2.3]], colors: { body: '#2e3440', skin: '#e8c3a0', hair: '#7a5530' } });

    // Box pews in four blocks with two aisles.
    const pewMat = kit.toon('#fbf8f0');
    const capMat = kit.toon('#7a4a2e');
    const blocks = [[-5.95, 3.3], [-2.05, 2.3], [2.05, 2.3], [5.95, 3.3]];
    const rng = makeRng(36);
    const rows = 11;
    for (const [bx, bw] of blocks) {
      for (let i = 0; i < rows; i++) {
        const z = NORTH + 4.6 + i * 1.12;
        if (Math.abs(bx) < 3 && i < 1) continue;
        const back = new THREE.Mesh(new THREE.BoxGeometry(bw, 1.0, 0.07), pewMat);
        back.position.set(bx, 0.5, z + 0.45);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.05, 0.12), capMat);
        cap.position.set(bx, 1.02, z + 0.45);
        const seat = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.06, 0.4), pewMat);
        seat.position.set(bx, 0.45, z + 0.2);
        for (const m of [back, seat]) m.castShadow = m.receiveShadow = true;
        scene.add(back, cap, seat);
        for (const sx of [-1, 1]) {
          const end = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 1.05), pewMat);
          end.position.set(bx + sx * bw / 2, 0.5, z);
          scene.add(end);
        }
        ctx.addCollider({ x: bx, z: z + 0.45, hx: bw / 2, hz: 0.05, rot: 0, top: 1.0 });
        const n = Math.floor(bw / 0.55);
        for (let k = 0; k < n; k++) {
          if (rng() < 0.05) continue;
          people.push({ x: bx - bw / 2 + 0.3 + k * ((bw - 0.6) / (n - 1)), z: z + 0.15, yaw: Math.PI, kind: rng() < 0.55 ? 'woman' : 'man', pose: 'sit', child: rng() < 0.06 });
        }
      }
    }
    // Saints standing along the side walls and at the back.
    for (const sx of [-1, 1]) for (let i = 0; i < 26; i++) {
      people.push({ x: sx * (W / 2 - 0.42), z: NORTH + 4.2 + i * 0.5, face: [0, NORTH], kind: rng() < 0.5 ? 'woman' : 'man' });
    }
    for (let i = 0; i < 18; i++) if (Math.abs(-7.6 + i * 0.9) > 1.2) people.push({ x: -7.6 + i * 0.9, z: SOUTH - 4.2 - (i % 2) * 0.5, face: [0, NORTH], kind: rng() < 0.5 ? 'woman' : 'man' });
    periodCrowd(ctx, people, { seed: 18, jitter: 0.1 });

    glowSprite(ctx, [0, 5.5, NORTH + 3], 16, '#fff2d0', 0.3);
    const l = new THREE.PointLight('#fff2d8', 6, 16, 1.4);
    l.position.set(0, 5, NORTH + 4);
    scene.add(l);

    // Kirtland around the temple.
    ctx.exclude({ kind: 'rect', x: 0, z: 0, hx: W / 2 + 6, hz: D / 2 + 6 });
    ctx.builders.trees({ count: 110, ring: [30, 220], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#5a4a3a', leafColors: ['#9aa86a', '#a8b478', '#8a9a5e'] }, ctx);
  },

  clouds: {
    layers: [{ count: 30, distance: [320, 700], height: [90, 170], size: [25, 55], color: '#ffffff', shade: '#8a9ab0' }],
  },

  player: {
    start: [0, -1.5],
    lookAt: [0, NORTH],
    colors: { robe: '#3a3530', mantle: '#3a3530', skin: '#e0b48e', hair: '#5a3a22' },
  },
};
