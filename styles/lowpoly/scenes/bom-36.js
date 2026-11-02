// Helaman 7:10-14: Nephi kneels in prayer on the tower in his garden, beside the highway
// that leads to the chief market in Zarahemla. Passersby gather and marvel. -z is north toward the market.
import * as THREE from 'three';
import { rng } from '../engine/util.js';
import { createFigure } from '../engine/crowd.js';
import { strut, makePeople, addCrowd, house } from './lib/bom-31-kit.js';

const GARDEN = [-21, -8];
const GW = 26, GD = 32;
const TOWER = [-12, -8];
const TH = 8.5;
const MARKET = [0, -96];

const folk = {
  robes: ['#c9b48a', '#a0825c', '#d8cdb5', '#8b6b4a', '#b59a72', '#7a4e36', '#6b6f4a', '#e2d6bc', '#9a4a34', '#4f5a6b'],
  mantles: ['#5a3d2b', '#a34f32', '#3f4d5e', '#8a7a5a', '#6d3b2e', '#556246', '#c9b48e'],
  skins: ['#8a5a3c', '#9b6a46', '#a87652', '#7a4c31', '#b5835e'],
  mantleChance: 0.6,
  hoodChance: 0.3,
};

function stall(ctx, x, z, rot, cloth, r) {
  const y = ctx.heightAt(x, z);
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const [lx, lz] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) {
    const [px, pz] = at(lx, lz);
    strut(ctx.solid, [px, y - 0.1, pz], [px, y + (lz < 0 ? 2.6 : 2.2), pz], 0.1, '#5a4330');
  }
  ctx.solid.box(3.4, 0.08, 2.6, { position: [x, y + 2.4, z], rotation: [0.15, rot, 0], color: cloth, jitter: 0.04 });
  const [cx, cz] = at(0, 0.6);
  ctx.solid.box(3, 0.8, 1, { position: [cx, y + 0.4, cz], rotation: [0, rot, 0], color: '#7a5a3a' });
  for (let i = 0; i < 5; i++) {
    const [px, pz] = at(-1.1 + i * 0.55, 0.6);
    ctx.solid.add(new THREE.IcosahedronGeometry(0.18, 0), { position: [px, y + 0.9, pz], color: r.pick(['#c8402a', '#e0a030', '#7a9a3a', '#a0623a', '#d8c8a0']), jitter: 0.1 });
  }
  ctx.colliders.add({ x, z, w: 3.2, d: 2.4, rot, bottom: y, top: y + 2.4 });
}

export default {
  title: 'Helaman 7:10-14: Nephi prays on his garden tower',
  seed: 36,
  fov: 60,
  exposure: 1.05,

  sun: { direction: [0.5, 0.55, 0.5], color: '#ffe2b8', intensity: 2.8 },
  light: { sky: '#a8c4e8', ground: '#6a5038', hemi: 1.05 },
  sky: { top: '#4a7ac0', horizon: '#e4e0d0', ground: '#c8b89a', sunColor: '#fff0d0', glow: 0.9 },
  fog: { color: '#d8dcd4', near: 90, far: 560 },
  clouds: { count: 40, shadow: '#a0a8bc', lit: '#ffffff', rim: '#fff6e0', distance: [300, 900], altitude: [120, 220], hole: 0.1 },
  mountains: { count: 40, color: '#5a6a68', radius: [520, 760], height: [50, 140], haze: 0.55 },
  bloom: { strength: 0.25, radius: 0.5, threshold: 0.9 },
  grade: { saturation: 1.12, contrast: 1.05, vignette: 0.32, shadowTint: '#2a3050', highlightTint: '#fff0d0' },
  shadow: { center: [-6, -14], radius: 70 },

  player: { start: [3, 10], yaw: 0.6, pitch: 0.16, eye: 1.65, speed: 4.5 },

  terrain: {
    size: 1100,
    segments: 200,
    seed: 36,
    hills: 18,
    bumps: 0.15,
    flats: [{ x: 0, z: -30, r: 110, falloff: 50, height: 0 }],
    colors: { ground: '#a89470', groundAlt: '#9a8a66', grass: '#6e8a3c', high: '#7a7a50', rock: '#7a6a52' },
    patches: [{ x: GARDEN[0], z: GARDEN[1], r: 17, color: '#5e8236', strength: 0.85, rough: 0.2 }],
  },

  objects: [
    { type: 'pavement', x: 0, z: -40, w: 8, d: 170, tile: 2, color: '#c8b896', damage: 0.05 },
    { type: 'pavement', x: MARKET[0], z: MARKET[1], w: 36, d: 26, tile: 2.2, color: '#c4b08c', damage: 0.05 },
    { type: 'steppedPyramid', x: MARKET[0], z: MARKET[1] - 40, w: 34, d: 30, tiers: 5, tierHeight: 3.2, inset: 2.4, stairWidth: 7, color: '#d0bc96', trim: '#a08a66', shrine: { w: 9, d: 7, h: 4, door: 2, roof: '#8a6a3a' } },
  ],

  scatter: [
    { type: 'tree', count: 50, center: [0, -30], ring: [70, 300], spacing: 8, seed: 3, props: { kind: 'broad', leaf: '#557a34' } },
    { type: 'tree', count: 20, center: [0, -30], ring: [60, 200], spacing: 8, seed: 4, props: { kind: 'palm', leaf: '#5e8238' } },
  ],

  custom(ctx) {
    const r = rng(360);

    // Garden wall with an opening onto the highway.
    const wall = (x, z, w, d) => {
      ctx.solid.box(w, 1.3, d, { position: [x, 0.5, z], color: '#d8c8a4', jitter: 0.05 });
      ctx.colliders.add({ x, z, w, d, bottom: -1, top: 1.15 });
    };
    const [gx, gz] = GARDEN;
    wall(gx, gz - GD / 2, GW, 0.6);
    wall(gx, gz + GD / 2, GW, 0.6);
    wall(gx - GW / 2, gz, 0.6, GD);
    wall(gx + GW / 2, gz - GD / 4 - 2, 0.6, GD / 2 - 4);
    wall(gx + GW / 2, gz + GD / 4 + 2, 0.6, GD / 2 - 4);

    // Fruit trees, beds of flowers and a path to the tower.
    for (let i = 0; i < 14; i++) {
      const x = gx + r.range(-GW / 2 + 2, GW / 2 - 2), z = gz + r.range(-GD / 2 + 2, GD / 2 - 2);
      if (Math.hypot(x - TOWER[0], z - TOWER[1]) < 5 || Math.abs(z - gz) < 2) continue;
      ctx.builders.tree(ctx, { x, z, h: r.range(4, 6), kind: 'broad', leaf: r.pick(['#4e7a2e', '#5a8a36', '#6a8a3a']) });
      for (let k = 0; k < 5; k++) ctx.solid.add(new THREE.IcosahedronGeometry(0.15, 0), { position: [x + r.range(-1.6, 1.6), 5 + r.range(-0.5, 0.8), z + r.range(-1.6, 1.6)], color: r.pick(['#d8502a', '#e8a030']), jitter: 0.1 });
    }
    for (let i = 0; i < 220; i++) {
      const x = gx + r.range(-GW / 2 + 1, GW / 2 - 1), z = gz + r.range(-GD / 2 + 1, GD / 2 - 1);
      if (Math.abs(z - gz) < 1.4 || Math.hypot(x - TOWER[0], z - TOWER[1]) < 3.5) continue;
      ctx.solid.add(new THREE.IcosahedronGeometry(r.range(0.15, 0.3), 0), { position: [x, ctx.heightAt(x, z) + 0.15, z], color: r.pick(['#e05a6a', '#f0c040', '#f4f0e0', '#c04a8a', '#5a8a36', '#4e7a2e']), jitter: 0.1 });
    }
    for (let x = gx + GW / 2; x > TOWER[0] - 2; x -= 1.1) ctx.solid.box(1, 0.1, 2, { position: [x, ctx.heightAt(x, gz) + 0.02, gz], color: '#d8c8a0', jitter: 0.08 });

    // The tower: stone shaft, a platform with a parapet, a ladder of steps on its side.
    const ty = ctx.heightAt(...TOWER) - 0.2;
    ctx.solid.box(4, TH, 4, { position: [TOWER[0], ty + TH / 2, TOWER[1]], color: '#cbb894', jitter: 0.05 });
    ctx.colliders.add({ x: TOWER[0], z: TOWER[1], w: 4, d: 4, bottom: ty, top: ty + TH });
    ctx.solid.box(5.4, 0.4, 5.4, { position: [TOWER[0], ty + TH + 0.2, TOWER[1]], color: '#a08a66' });
    for (const [sx, sz, w, d] of [[0, -1, 5.4, 0.35], [0, 1, 5.4, 0.35], [-1, 0, 0.35, 5.4]]) {
      ctx.solid.box(w, 0.4, d, { position: [TOWER[0] + sx * 2.55, ty + TH + 0.6, TOWER[1] + sz * 2.55], color: '#cbb894' });
    }
    for (let i = 0; i < 4; i++) ctx.solid.box(0.6, 0.5, 0.6, { position: [TOWER[0] + (i % 2 ? 2.3 : -2.3), ty + TH + 1.05, TOWER[1] + (i < 2 ? 2.3 : -2.3)], color: '#a08a66' });
    for (let k = 0; k < 16; k++) {
      const h = (k + 1) * (TH / 16);
      ctx.solid.box(1.1, 0.25, 0.6, { position: [TOWER[0] - 2.55, ty + h - 0.12, TOWER[1] + 1.8 - k * 0.24], color: '#a08a66' });
    }
    for (let i = 0; i < 6; i++) ctx.solid.box(0.12, 0.6, 0.5, { position: [TOWER[0] + 2.02, ty + 1.5 + i * 1.2, TOWER[1] + r.range(-1, 1)], color: '#b8a480' });

    // Nephi on his knees, looking up in prayer.
    const top = ty + TH + 0.4;
    const nephi = createFigure({ x: TOWER[0] + 1.9, y: top - 0.55, z: TOWER[1] + 0.3, scale: 1.35, face: [40, TOWER[1] - 6], robe: '#e2d6bc', mantle: '#3f5a8a', skin: '#9b6a46', arms: 'out' });
    nephi.rotation.x = -0.12;
    ctx.scene.add(nephi);

    // Multitudes gathered on the highway, looking up at the tower.
    const pts = [];
    for (let tries = 0; pts.length < 260 && tries < 9000; tries++) {
      const x = r.range(-6.8, 16), z = r.range(-34, 18);
      if (x < -7) continue;
      if (Math.hypot(x - 3, z - 10) < 3.5 || (z > 10 && Math.abs(x - 3) < 3)) continue;
      if (x > 8 && Math.abs(z - TOWER[1]) > 22) continue;
      if (pts.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.8)) continue;
      pts.push([x, z]);
    }
    const gathered = makePeople(pts, { palette: folk, heightAt: ctx.heightAt, seed: 5, face: TOWER, yawJitter: 0.25, children: 0.2 });
    const walkers = makePeople(Array.from({ length: 70 }, () => [r.range(-3.5, 3.5), r.range(-80, -40)]), { palette: folk, heightAt: ctx.heightAt, seed: 6, yawJitter: 3.1 });
    const shoppers = makePeople(Array.from({ length: 90 }, () => [MARKET[0] + r.range(-16, 16), MARKET[1] + r.range(-11, 11)]), { palette: folk, heightAt: ctx.heightAt, seed: 7, yawJitter: 3.1, children: 0.15 });
    addCrowd(ctx, [...gathered, ...walkers, ...shoppers]);

    // Houses along the highway and the chief market at its end.
    for (let z = 30; z > -74; z -= r.range(9, 12)) {
      house(ctx, { x: r.range(20, 24), z, rot: -Math.PI / 2, w: r.range(6, 8), d: r.range(5, 6.5), h: r.range(2.6, 3.4), flat: r() < 0.5, color: r.pick(['#e0d2b2', '#d8c7a4', '#cdb894']), roof: r.pick(['#9a7a44', '#b8a07a']) });
      if (z < gz - GD / 2 - 6 || z > gz + GD / 2 + 6) house(ctx, { x: r.range(-14, -10), z, rot: Math.PI / 2, w: r.range(6, 8), d: r.range(5, 6.5), h: r.range(2.6, 3.4), flat: r() < 0.5, color: r.pick(['#e0d2b2', '#d8c7a4']), roof: r.pick(['#9a7a44', '#b8a07a']) });
    }
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1;
      stall(ctx, MARKET[0] + side * 15, MARKET[1] - 10 + Math.floor(i / 2) * 4, side * Math.PI / 2 + Math.PI, r.pick(['#c8402a', '#e8d8b0', '#3f5a8a', '#d8a030', '#6a8a3a']), r);
    }
  },
};
