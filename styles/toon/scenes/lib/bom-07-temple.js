// Nephi's temple "after the manner of the temple of Solomon" (2 Nephi 5:16), with its court and city houses.
// Local frame: the entrance faces +z. Rotate by pi/2 to face east.
import * as THREE from 'three';
import { addMesh, ball, boxGeo, collideLocal, cyl, group, localToWorld, makeRng, plankTexture, rod } from './bom-07-kit.js';

const C = { stone: '#e6d6b2', base: '#d8c49a', cedar: '#9a5a36', bronze: '#c08a3a', gold: '#ecc24a', dark: '#2b1a12', court: '#d2bf94', annex: '#dccaa2' };

export function buildTemple(ctx, { pos, rot = Math.PI / 2, building = false, colors = {} }) {
  const c = { ...C, ...colors };
  const [px, pz] = pos;
  const g = group(ctx, px, pz, rot, ctx.terrainHeight(px, pz) - 0.1);
  const y0 = g.position.y;
  const k = ctx.kit;
  const stone = [], base = [], cedar = [], bronze = [], gold = [], dark = [], annex = [], wood = [];
  const solid = (lx, lz, hx, hz, top, extra) => collideLocal(ctx, px, pz, rot, lx, lz, hx, hz, y0 + top, extra);
  const P = 1.6;

  // Podium with a broad stair to the porch.
  base.push(boxGeo(26, P, 50, [0, P / 2, -3]));
  solid(0, -3, 13, 25, P, { walkable: true });
  const steps = 6, rise = P / steps, run = 0.55;
  for (let i = 0; i < steps; i++) {
    const top = (i + 1) * rise, z = 22 + (steps - i - 0.5) * run;
    base.push(boxGeo(14, top, run, [0, top / 2, z]));
    solid(0, z, 7, run / 2, top, { walkable: true });
  }
  const stairFront = 22 + steps * run;

  // Holy place and holy of holies under one roof, side chambers around.
  const H = 13;
  stone.push(boxGeo(1, H, 34, [-6.5, P + H / 2, -5]), boxGeo(1, H, 34, [6.5, P + H / 2, -5]), boxGeo(14, H, 1, [0, P + H / 2, -21.5]));
  stone.push(boxGeo(4.5, H, 1, [-4.25, P + H / 2, 11.5]), boxGeo(4.5, H, 1, [4.25, P + H / 2, 11.5]), boxGeo(4, H - 7, 1, [0, P + 7 + (H - 7) / 2, 11.5]));
  dark.push(boxGeo(4, 7, 0.3, [0, P + 3.5, 11.2]));
  gold.push(boxGeo(1.9, 6.8, 0.15, [-1.05, P + 3.4, 11.15]), boxGeo(1.9, 6.8, 0.15, [1.05, P + 3.4, 11.15]));
  cedar.push(boxGeo(14.4, 0.6, 34.4, [0, P + H - 1.2, -5], { uv: { su: 1 } }));
  solid(0, -5, 7, 17, P + H);
  const roofTo = building ? -4 : -22;
  stone.push(boxGeo(14.6, 0.6, 12 - roofTo, [0, P + H + 0.3, (12 + roofTo) / 2]));
  if (building) for (let z = -21; z < -4; z += 1.6) cedar.push(boxGeo(13.4, 0.35, 0.35, [0, P + H - 0.2, z]));

  const AH = 8.5;
  const annexHeight = (side) => (building && side < 0 ? 4.2 : AH);
  for (const side of [-1, 1]) {
    const h = annexHeight(side);
    annex.push(boxGeo(4, h, 30, [side * 9, P + h / 2, -6]));
    if (h === AH) {
      cedar.push(boxGeo(4.3, 0.4, 30.3, [side * 9, P + AH + 0.2, -6]));
      for (let f = 0; f < 3; f++) for (let w = 0; w < 7; w++) dark.push(boxGeo(0.1, 0.9, 0.6, [side * 11.02, P + 1.6 + f * 2.6, -18 + w * 4]));
    }
    solid(side * 9, -6, 2, 15, P + h);
  }
  annex.push(boxGeo(22, AH, 4, [0, P + AH / 2, -23]));
  solid(0, -23, 11, 2, P + AH);

  // The porch, taller than the house, and the two bronze pillars before it (1 Kings 7:15-22).
  const PH = 18;
  stone.push(boxGeo(1.5, PH, 6, [-6.75, P + PH / 2, 15]), boxGeo(1.5, PH, 6, [6.75, P + PH / 2, 15]), boxGeo(15, PH - 10, 6, [0, P + 10 + (PH - 10) / 2, 15]));
  cedar.push(boxGeo(15.4, 0.7, 6.4, [0, P + PH - 1.5, 15]), boxGeo(12, 0.6, 0.4, [0, P + 10.3, 18.1]));
  solid(-6.75, 15, 0.75, 3, P + PH);
  solid(6.75, 15, 0.75, 3, P + PH);
  for (const side of [-1, 1]) {
    const x = side * 3.6, z = 19.8;
    bronze.push(cyl(0.75, 0.8, 9, x, P + 4.5 + 0.4, z, {}, 16), cyl(1.1, 1.1, 0.4, x, P + 0.2, z, {}, 16));
    const cap = new THREE.LatheGeometry([[0.75, 0], [1.05, 0.5], [1.25, 1.3], [1.1, 2.0], [1.3, 2.4], [0.001, 2.45]].map(([r, h]) => new THREE.Vector2(r, h)), 16);
    cap.translate(x, P + 9.4, z);
    gold.push(cap);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      bronze.push(ball(0.2, x + Math.sin(a) * 1.25, P + 10.6, z + Math.cos(a) * 1.25, {}, 6));
    }
    solid(x, z, 0.85, 0.85, P + 12);
  }

  // Court with a low wall, the bronze altar and the molten sea on twelve oxen.
  const W = 34, front = 52, back = -40;
  const courtWall = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const a = Math.atan2(-(z1 - z0), x1 - x0);
    stone.push(boxGeo(len, 2, 0.8, [(x0 + x1) / 2, 1, (z0 + z1) / 2], { rotY: a }));
    cedar.push(boxGeo(len + 0.2, 0.3, 1.0, [(x0 + x1) / 2, 2.1, (z0 + z1) / 2], { rotY: a }));
    const [wx, wz] = localToWorld(px, pz, rot, (x0 + x1) / 2, (z0 + z1) / 2);
    ctx.addCollider({ x: wx, z: wz, hx: len / 2, hz: 0.5, rot: rot + a, top: y0 + 2.2 });
  };
  courtWall(-W, back, W, back);
  courtWall(-W, back, -W, front);
  courtWall(W, back, W, front);
  courtWall(-W, front, -6, front);
  courtWall(6, front, W, front);
  for (const s of [-1, 1]) {
    stone.push(boxGeo(2, 5, 2, [s * 7, 2.5, front]));
    solid(s * 7, front, 1, 1, 5);
  }
  const altar = [boxGeo(4.4, 2.2, 4.4, [-11, 1.1, 36]), boxGeo(4.8, 0.3, 4.8, [-11, 2.35, 36]), boxGeo(2, 1.1, 3.5, [-11, 0.55, 39.6], { rotX: 0.3 })];
  for (const [x, z] of [[-13.1, 33.9], [-8.9, 33.9], [-13.1, 38.1], [-8.9, 38.1]]) altar.push(new THREE.ConeGeometry(0.3, 0.7, 4).translate(x, 2.85, z));
  addMesh(g, altar, k.toon('#8a5a2a'));
  addMesh(g, [boxGeo(3, 0.2, 3, [-11, 2.55, 36])], k.toon('#3a2418'), { cast: false });
  solid(-11, 36, 2.7, 2.7, 2.6);
  const seaX = 14, seaZ = 30;
  const basin = new THREE.LatheGeometry([[0.001, 0], [1.4, 0.1], [2.1, 0.7], [2.45, 1.5], [2.6, 1.65], [2.35, 1.65], [0.001, 1.5]].map(([r, h]) => new THREE.Vector2(r, h)), 24);
  basin.translate(seaX, 1.1, seaZ);
  bronze.push(basin);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const ox = seaX + Math.sin(a) * 1.6, oz = seaZ + Math.cos(a) * 1.6;
    bronze.push(boxGeo(0.5, 0.6, 1.0, [ox, 0.7, oz], { rotY: a }), boxGeo(0.34, 0.4, 0.4, [ox + Math.sin(a) * 0.65, 0.85, oz + Math.cos(a) * 0.65], { rotY: a }));
    bronze.push(cyl(0.12, 0.12, 0.4, ox, 0.2, oz, {}, 5));
  }
  solid(seaX, seaZ, 2.4, 2.4, 2.8);

  addMesh(g, stone, k.stoneMat(c.stone));
  addMesh(g, base, k.stoneMat(c.base));
  addMesh(g, annex, k.stoneMat(c.annex));
  addMesh(g, cedar, k.toon(c.cedar, { map: plankTexture() }));
  addMesh(g, bronze, k.toon(c.bronze));
  addMesh(g, gold, k.toon(c.gold, { emissive: '#3a2a00' }));
  addMesh(g, dark, k.toon(c.dark), { cast: false });

  if (building) {
    // Scaffold along the unfinished north chambers, a lifting frame and blocks waiting to be set.
    const rng = makeRng(3);
    for (let z = -20; z <= 8; z += 4) {
      for (const x of [-11.6, -13.4]) wood.push(cyl(0.1, 0.1, 12, x, P + 6, z));
      for (const y of [4.4, 8.4]) wood.push(boxGeo(2.2, 0.12, 4, [-12.5, P + y, z + 2]));
      wood.push(rod([-11.6, P, z], [-11.6, P + 12, z + 4], 0.05, 4));
    }
    wood.push(rod([-16, 0, 26], [-12, 14, 28], 0.18, 6), rod([-8, 0, 30], [-12, 14, 28], 0.18, 6), rod([-12, 0, 34], [-12, 14, 28], 0.18, 6));
    addMesh(g, wood, k.toon('#8a6a48'));
    addMesh(g, [rod([-12, 14, 28], [-12, 4, 28], 0.05, 4)], k.toon('#d8c8a0'), { cast: false });
    const blocks = [];
    for (let i = 0; i < 26; i++) {
      const x = -24 + (i % 6) * 1.9 + rng() * 0.3, z = 10 + Math.floor(i / 6) * 1.5;
      blocks.push(boxGeo(1.6, 0.8, 1.1, [x, 0.4 + (i % 3 === 0 ? 0.8 : 0), z], { rotY: (rng() - 0.5) * 0.2 }));
    }
    blocks.push(boxGeo(1.6, 0.8, 1.1, [-12, 4.3, 28]));
    addMesh(g, blocks, k.stoneMat(c.stone));
    solid(-19.5, 12.5, 6, 3.5, 1.7);
    solid(-12, 28, 0.6, 0.6, 14);
    for (const [x, z] of [[-16, 26], [-8, 30], [-12, 34]]) solid(x, z, 0.4, 0.4, 3);
    const timber = [];
    for (let i = 0; i < 8; i++) timber.push(cyl(0.28, 0.28, 8, 22 + (i % 4) * 0.58, 0.3 + Math.floor(i / 4) * 0.52, 14, { rx: Math.PI / 2 }, 7));
    addMesh(g, timber, k.toon('#a87b4f', { map: plankTexture() }));
    solid(23, 14, 1.5, 4, 1.2);
  }

  const toWorld = (lx, lz) => localToWorld(px, pz, rot, lx, lz);
  return { group: g, y0, podium: y0 + P, stairFront, courtFront: front, toWorld, width: W };
}

// Flat-roofed houses of stone and timber, as Nephi taught his people to build (2 Nephi 5:15).
export function houses(ctx, spots, { seed = 5, walls = ['#d8c49a', '#cdb48a', '#e0cfa8', '#c2a27a'], roof = '#8a6a48' } = {}) {
  const rng = makeRng(seed);
  const body = walls.map(() => []), tops = [], dark = [];
  for (const [x, z, r = rng() * Math.PI] of spots) {
    const w = 5 + rng() * 3, d = 4 + rng() * 2.5, h = 2.8 + rng() * 1.2;
    const y = ctx.terrainHeight(x, z) - 0.1;
    const m = new THREE.Matrix4().makeRotationY(r).setPosition(x, y, z);
    const add = (list, geo) => list.push(geo.applyMatrix4(m));
    add(body[Math.floor(rng() * walls.length)], boxGeo(w, h, d, [0, h / 2, 0]));
    add(tops, boxGeo(w + 0.5, 0.3, d + 0.5, [0, h + 0.15, 0]));
    for (let i = -1; i <= 1; i++) add(tops, cyl(0.12, 0.12, 0.6, i * w * 0.3, h - 0.1, d / 2 + 0.35, { rx: Math.PI / 2 }, 5));
    add(dark, boxGeo(1.1, 2, 0.1, [rng() * 1.5 - 0.75, 1, d / 2 + 0.03]));
    add(dark, boxGeo(0.7, 0.6, 0.1, [w * 0.3, h * 0.65, d / 2 + 0.03]));
    ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: r, top: y + h });
  }
  body.forEach((list, i) => addMesh(ctx.scene, list, ctx.kit.stoneMat(walls[i])));
  addMesh(ctx.scene, tops, ctx.kit.toon(roof, { map: plankTexture() }));
  addMesh(ctx.scene, dark, ctx.kit.toon('#2b1a12'), { cast: false });
}
