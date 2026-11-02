// Exodus 12: the first Passover in Goshen. Blood on every lintel, families eating in haste with staff in hand.
// x is east, z is south. A street runs north; the cutaway house on the west side shows a family at the meal.
import { Batch, DAY_STYLE, ball, box, cyl, frameAt, glow, goat, makeRng, moon, palm, person, stars, xf } from './lib/ot-13-kit.js';

const BLOOD = '#8a1c1c';
const MUD = ['#b08a5e', '#a07a50', '#bf9a6a', '#a8845a'];
const OPEN = { x: -8, z: -4, w: 7, d: 8 };

// Mud-brick house, door on local +z. open removes the local -x wall and roof so the room shows.
function home(b, ctx, { x, z, w, d, h, rot, color, open = false, rng }) {
  const y = Math.min(ctx.terrainHeight(x, z), ctx.terrainHeight(x + 2, z + 2), ctx.terrainHeight(x - 2, z - 2)) - 0.2;
  const f = frameAt(x, y, z, rot);
  const t = 0.4;
  const doorX = open ? w * 0.22 : w * 0.1;
  const walls = [
    { lx: 0, lz: -d / 2 + t / 2, hx: w / 2, hz: t / 2 },
    { lx: w / 2 - t / 2, lz: 0, hx: t / 2, hz: d / 2 },
  ];
  if (!open) walls.push({ lx: -w / 2 + t / 2, lz: 0, hx: t / 2, hz: d / 2 });
  const leftW = doorX - 0.7 + w / 2, rightW = w / 2 - doorX - 0.7;
  walls.push({ lx: -w / 2 + leftW / 2, lz: d / 2 - t / 2, hx: leftW / 2, hz: t / 2 });
  walls.push({ lx: w / 2 - rightW / 2, lz: d / 2 - t / 2, hx: rightW / 2, hz: t / 2 });
  for (const wl of walls) {
    b.add(color, box(wl.hx * 2, h, wl.hz * 2, [wl.lx, h / 2, wl.lz]), { frame: f });
    const c = Math.cos(rot), s = Math.sin(rot);
    ctx.addCollider({ x: x + wl.lx * c + wl.lz * s, z: z - wl.lx * s + wl.lz * c, hx: wl.hx, hz: wl.hz, rot, top: y + h });
  }
  b.add(color, box(1.4, h - 2.3, t, [doorX, h - (h - 2.3) / 2, d / 2 - t / 2]), { frame: f });
  if (!open) {
    b.add('#7a5a3c', box(w + 0.4, 0.3, d + 0.4, [0, h + 0.1, 0]), { frame: f });
    b.add('#3a2418', box(1.3, 2.25, 0.1, [doorX, 1.12, d / 2 - 0.15]), { frame: f });
    const lit = rng() < 0.7;
    for (const wx of [-w * 0.3]) b.add(lit ? '#ffc15e' : '#2b1a12', box(0.6, 0.6, 0.1, [wx, 2.0, d / 2 + 0.01]), { frame: f, glow: lit });
  } else {
    for (let k = 0; k < 4; k++) b.add('#5e4632', box(0.18, 0.18, d, [-w / 2 + 1 + k * 1.6, h - 0.05, 0]), { frame: f });
    b.add('#7a5a3c', box(w * 0.4, 0.3, d + 0.4, [w * 0.3, h + 0.1, 0]), { frame: f });
    b.add('#a8845a', box(w - 0.2, 0.06, d - 0.2, [0, 0.23, 0]), { frame: f, cast: false });
  }
  // The blood of the lamb on the two side posts and the lintel.
  b.add(BLOOD, box(1.6, 0.22, 0.06, [doorX, 2.42, d / 2 + 0.02]), { frame: f });
  for (const s of [-1, 1]) b.add(BLOOD, box(0.14, 1.6 + rng() * 0.5, 0.06, [doorX + s * 0.72, 1.4, d / 2 + 0.02]), { frame: f });
  b.add(BLOOD, box(0.2, 0.3, 0.06, [doorX - 0.3, 2.2, d / 2 + 0.03]), { frame: f });
  return { f, y, doorX };
}

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const rng = makeRng(1712);

  // Houses on both sides of the street.
  for (let z = 30; z > -70; z -= 9.5) {
    for (const side of [-1, 1]) {
      const x = side * (9 + rng() * 1.2);
      if (side === -1 && z > OPEN.z - 5 && z < OPEN.z + 16) continue;
      home(b, ctx, { x, z, w: 6.5 + rng() * 1.5, d: 6.5 + rng() * 1.5, h: 3 + rng() * 0.8, rot: side < 0 ? Math.PI / 2 : -Math.PI / 2, color: MUD[Math.floor(rng() * 4)], rng });
    }
  }
  for (let i = 0; i < 70; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (19 + rng() * 50), z = 40 - rng() * 120;
    if (ctx.blocked(x, z, 4)) continue;
    home(b, ctx, { x, z, w: 6 + rng() * 2, d: 6 + rng() * 2, h: 3 + rng(), rot: Math.floor(rng() * 4) * Math.PI / 2, color: MUD[Math.floor(rng() * 4)], rng });
    ctx.exclude({ kind: 'circle', x, z, r: 6 });
  }

  // The open house: one family at the Passover meal.
  const { f, y } = home(b, ctx, { x: OPEN.x, z: OPEN.z, w: OPEN.w, d: OPEN.d, h: 3.4, rot: Math.PI / 2, color: '#b08a5e', open: true, rng });
  const T = [OPEN.x - 0.6, OPEN.z + 0.3];
  b.add('#6b4a33', box(1.4, 0.5, 2.6, [0, 0.5, 0]), { frame: frameAt(T[0], y + 0.25, T[1]) });
  b.add('#efe3c2', box(1.2, 0.04, 2.4, [0, 0.77, 0]), { frame: frameAt(T[0], y + 0.25, T[1]) });
  b.add('#8a4a28', ball(0.32, [T[0], y + 1.18, T[1]], [1, 0.6, 1.6], 10));
  b.add('#c9b07a', cyl(0.5, 0.5, 0.05, [T[0], y + 1.04, T[1]], [0, 0, 0], 14));
  for (const dz of [-0.95, 0.95]) b.add('#e6d0a0', cyl(0.18, 0.18, 0.04, [T[0], y + 1.05, T[1] + dz], [0, 0, 0], 10));
  b.add('#5f8a3e', ball(0.14, [T[0] + 0.35, y + 1.1, T[1] - 0.5], [1.4, 0.6, 1], 6));
  b.add('#b5674a', cyl(0.07, 0.06, 0.16, [T[0] - 0.4, y + 1.12, T[1] + 0.5], [0, 0, 0], 8));
  const family = [
    { p: [T[0] - 1.3, T[1] - 0.6], c: { robe: '#7a6a52', mantle: '#5e4632', skin: '#9c6a45', hair: '#3a2418', sash: '#c8912e' } },
    { p: [T[0] - 1.3, T[1] + 0.7], c: { robe: '#a64b35', mantle: '#d9c7a3', skin: '#a87650', hair: '#d9c7a3', sash: '#3e6e66' } },
    { p: [T[0] + 1.1, T[1] - 0.8], c: { robe: '#6f8a6a', mantle: '#8c5a3c', skin: '#a87650', hair: '#2b1a12', sash: '#efe3c2' }, s: 0.66 },
    { p: [T[0] + 1.1, T[1] + 0.4], c: { robe: '#c8a97a', mantle: '#4f7f80', skin: '#b5825a', hair: '#2b1a12', sash: '#b5523b' }, s: 0.84 },
    { p: [T[0], T[1] - 1.9], c: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#9c6a45', hair: '#2b1a12', sash: '#efe3c2' }, s: 0.6 },
    { p: [T[0] + 0.2, T[1] + 1.9], c: { robe: '#d9c7a3', mantle: '#5e4632', skin: '#8a5a3b', hair: '#e6d8b8', sash: '#8c5a3c' }, s: 0.96 },
  ];
  for (const m of family) {
    person(ctx, { pos: m.p, y: y + 0.25, face: T, scale: m.s ?? 1, colors: { ...m.c, arms: [0.2, 0.9] } });
    const s = m.s ?? 1;
    const dx = m.p[0] - T[0], dz = m.p[1] - T[1], l = Math.hypot(dx, dz);
    b.add('#6b4a33', cyl(0.035, 0.04, 1.9 * s, [m.p[0] + (dz / l) * 0.32, y + 0.25 + 0.95 * s, m.p[1] - (dx / l) * 0.32], [0, 0, 0], 5));
  }
  for (const [lx, lz] of [[-1.6, -1.2], [1.4, 1.3]]) {
    const wp = new THREE.Vector3(lx, 0, lz).applyMatrix4(f);
    b.add('#b5674a', cyl(0.12, 0.08, 0.1, [wp.x, y + 1.0, wp.z], [0, 0, 0], 8));
    glow(ctx, { pos: [wp.x, y + 1.2, wp.z], size: 1.6, color: '#ffc870', opacity: 0.8, pulse: 0.1 });
  }
  const lamp = new THREE.PointLight('#ffb862', 22, 16, 1.4);
  lamp.position.set(T[0], y + 2.6, T[1]);
  ctx.scene.add(lamp);
  ctx.onFrame((t) => (lamp.intensity = 22 * (0.9 + 0.1 * Math.sin(t * 7) * Math.sin(t * 3.1))));
  for (let i = 0; i < 5; i++) b.add(['#8c5a3c', '#5e4632', '#a87b4f'][i % 3], ball(0.3, [OPEN.x - 3 + i * 0.4, y + 0.55, OPEN.z - 3.2], [1, 0.8, 1.2], 7));

  // The basin and the bunch of hyssop at the door.
  const by = ctx.terrainHeight(-4.2, -2.6);
  b.add('#8a6a4a', cyl(0.38, 0.26, 0.28, [-4.2, by + 0.14, -2.6], [0, 0, 0], 12));
  b.add(BLOOD, cyl(0.33, 0.33, 0.02, [-4.2, by + 0.27, -2.6], [0, 0, 0], 12));
  b.add('#6f8a4a', ball(0.16, [-4.0, by + 0.35, -2.4], [1, 0.6, 2], 6));

  // A pen for the flock behind the houses, a few palms.
  for (const [x, z] of [[24, 12], [27, 9], [22, 7], [-11, 5], [-12.5, 7.5], [-9.5, 9]]) goat(b, ctx, { pos: [x, z], rot: rng() * 6 });
  for (let i = 0; i < 14; i++) b.add('#8a6a4a', box(0.25, 1.1, 1.0, [-15, ctx.terrainHeight(-15, 1 + i) + 0.5, 1 + i]));
  palm(b, ctx, { pos: [-13, 11], height: 7, lean: 0.2, dir: 1, trunk: '#5a4a3c', leaf: '#3e5a4a', leafDark: '#2f4a3e', seed: 77 });
  for (let i = 0; i < 20; i++) {
    const x = (rng() < 0.5 ? -1 : 1) * (20 + rng() * 60), z = 50 - rng() * 140;
    if (ctx.blocked(x, z, 2)) continue;
    palm(b, ctx, { pos: [x, z], height: 7 + rng() * 3, lean: 0.15, dir: rng() * 6, trunk: '#5a4a3c', leaf: '#3e5a4a', leafDark: '#2f4a3e', seed: i + 5 });
  }

  stars(ctx, { count: 1100, color: '#f4f0ff', size: 2 });
  moon(ctx, { dir: [0.2, 0.2, -0.95], size: 60 });
  b.flush();
}

export default {
  title: 'Exodus 12:21-32: The first Passover',
  subtitle: 'Goshen at midnight, blood on the doorposts',
  seed: 12,
  style: { ...DAY_STYLE, fog: { color: '#1e2640', near: 60, far: 520 }, grain: 0.06 },
  sky: { zenith: '#070b1e', mid: '#141c3a', horizon: '#2e3658', ground: '#181c2a', glowColor: '#28325c', glowDir: [0.2, 0.2, -0.95] },
  sun: { dir: [0.3, 0.8, -0.5], color: '#a8b8e0', intensity: 1.0, hemi: { sky: '#4a5a8a', ground: '#2a2230', intensity: 0.8 }, shadowSize: 50 },
  ground: {
    size: 1000, segments: 200, flatRadius: 140, hillHeight: 12, undulation: 0.15,
    plaza: { center: [0, -20], size: [10, 110] },
    colors: { sand: '#9a7a58', dirt: '#8a6a4a', grass: '#6a7048', grassDark: '#4a5236', plaza: '#a88a64', plazaLine: '#8a6e50', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#7a6a58' },
  },
  mountains: { count: 18, distance: [600, 850], height: [30, 70], widthRatio: [2.5, 4], colors: ['#2a2e48', '#30344e', '#262a42'] },
  objects: [],
  custom,
  player: {
    start: [-2.2, 5.5],
    lookAt: [-7.5, -4],
    colors: { robe: '#7a6a52', mantle: '#3e6e66', skin: '#a8724a', hair: '#2b1a12', sash: '#c8912e' },
  },
};
