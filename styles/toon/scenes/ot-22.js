// Exodus 40:33-38: the tabernacle is reared up in the camp and the cloud covers the tent of meeting.
// At dusk the cloud over it begins to glow with fire. x is east, z is south. The court opens east toward the player.
import { Batch, DAY_STYLE, MOSES, PALETTE, PRIEST, TENT_COLORS, camp, campfire, flames, glow, makeRng, person, pillar, stars } from './lib/ot-19-kit.js';

const COURT = { x: 0, z: -20, hx: 23, hz: 11.5 };
const TENT = { x: -9, z: -20, hx: 6.8, hz: 2.3, h: 4.6 };
const GATE = 4.6;

function custom(ctx) {
  const { THREE } = ctx;
  const b = new Batch(ctx);
  const y0 = ctx.terrainHeight(COURT.x, COURT.z);

  // Court of white linen hangings on posts, with an embroidered gate on the east.
  const H = 2.4;
  const sides = [
    [[-COURT.hx, -COURT.hz], [COURT.hx, -COURT.hz]],
    [[-COURT.hx, COURT.hz], [COURT.hx, COURT.hz]],
    [[-COURT.hx, -COURT.hz], [-COURT.hx, COURT.hz]],
    [[COURT.hx, -COURT.hz], [COURT.hx, -GATE]],
    [[COURT.hx, GATE], [COURT.hx, COURT.hz]],
  ];
  for (const [[ax, az], [bx, bz]] of sides) {
    const L = Math.hypot(bx - ax, bz - az);
    const cx = COURT.x + (ax + bx) / 2, cz = COURT.z + (az + bz) / 2;
    const alongX = Math.abs(bx - ax) > Math.abs(bz - az);
    b.add('#f6f1e4', new THREE.BoxGeometry(alongX ? L : 0.08, H - 0.3, alongX ? 0.08 : L).translate(cx, y0 + H / 2 + 0.05, cz));
    const n = Math.round(L / 2.3);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const px = COURT.x + ax + (bx - ax) * t, pz = COURT.z + az + (bz - az) * t;
      b.add('#8a6a3c', new THREE.CylinderGeometry(0.07, 0.08, H + 0.2, 6).translate(px, y0 + (H + 0.2) / 2, pz));
      b.add('#d8d0c0', new THREE.SphereGeometry(0.1, 6, 4).translate(px, y0 + H + 0.25, pz));
    }
    ctx.addCollider({ x: cx, z: cz, hx: alongX ? L / 2 : 0.2, hz: alongX ? 0.2 : L / 2, rot: 0, top: y0 + H });
    ctx.exclude({ kind: 'rect', x: cx, z: cz, hx: alongX ? L / 2 + 0.8 : 0.8, hz: alongX ? 0.8 : L / 2 + 0.8 });
  }
  // Gate screen set forward of the opening so one walks around it.
  const gx = COURT.x + COURT.hx + 3.2;
  const gateColors = ['#3a4f9a', '#6a3a7a', '#b5303b', '#f6f1e4'];
  gateColors.forEach((c, i) => b.add(c, new THREE.BoxGeometry(0.1, H - 0.3, 2.4).translate(gx, y0 + H / 2 + 0.05, COURT.z - 3.6 + i * 2.4)));
  for (let i = 0; i <= 4; i++) b.add('#8a6a3c', new THREE.CylinderGeometry(0.08, 0.09, H + 0.2, 6).translate(gx, y0 + (H + 0.2) / 2, COURT.z - 4.8 + i * 2.4));
  ctx.addCollider({ x: gx, z: COURT.z, hx: 0.2, hz: 4.8, rot: 0, top: y0 + H });

  // The tent of meeting: boards of gold, covered with rams' skins and a dark outer covering.
  const t = TENT;
  b.add('#d9a838', new THREE.BoxGeometry(t.hx * 2, t.h, t.hz * 2).translate(t.x, y0 + t.h / 2, t.z), { emissive: '#3a2404' });
  const roof = new THREE.BoxGeometry(t.hx * 2 + 0.8, 0.5, t.hz * 2 + 1.6).translate(t.x - 0.4, y0 + t.h + 0.25, t.z);
  b.add('#5a4a40', roof);
  for (const s of [-1, 1]) b.add('#5a4a40', new THREE.BoxGeometry(t.hx * 2 + 0.8, t.h * 0.75, 0.12).translate(t.x - 0.4, y0 + t.h * 0.62, t.z + s * (t.hz + 0.75)));
  b.add('#5a4a40', new THREE.BoxGeometry(0.12, t.h * 0.75, t.hz * 2 + 1.6).translate(t.x - t.hx - 0.8, y0 + t.h * 0.62, t.z));
  b.add('#9a3a2a', new THREE.BoxGeometry(t.hx * 2 + 0.6, 0.25, t.hz * 2 + 1.2).translate(t.x - 0.4, y0 + t.h - 0.05, t.z));
  // Door hanging of blue, purple and scarlet between five gilded pillars.
  const fx = t.x + t.hx + 0.05;
  ['#3a4f9a', '#6a3a7a', '#b5303b', '#3a4f9a'].forEach((c, i) => b.add(c, new THREE.BoxGeometry(0.1, t.h - 0.3, 1.15).translate(fx, y0 + (t.h - 0.3) / 2, t.z - 1.725 + i * 1.15)));
  for (let i = 0; i < 5; i++) b.add('#e0b040', new THREE.CylinderGeometry(0.12, 0.13, t.h, 8).translate(fx + 0.2, y0 + t.h / 2, t.z - 2.3 + i * 1.15), { emissive: '#4a3008' });
  ctx.addCollider({ x: t.x - 0.4, z: t.z, hx: t.hx + 0.4, hz: t.hz + 0.8, rot: 0, top: y0 + t.h + 0.5 });

  // Laver of brass and the altar of burnt offering with its smoke.
  const lv = [COURT.x + 4, COURT.z];
  b.add('#b8863c', new THREE.CylinderGeometry(0.25, 0.4, 0.9, 8).translate(lv[0], y0 + 0.45, lv[1]), { emissive: '#2a1a04' });
  b.add('#c8964a', new THREE.CylinderGeometry(0.9, 0.5, 0.5, 12).translate(lv[0], y0 + 1.1, lv[1]), { emissive: '#2a1a04' });
  b.add('#7ab0c0', new THREE.CircleGeometry(0.82, 12).rotateX(-Math.PI / 2).translate(lv[0], y0 + 1.33, lv[1]), { cast: false });
  ctx.addCollider({ x: lv[0], z: lv[1], hx: 0.9, hz: 0.9, rot: 0, top: y0 + 1.3 });
  const al = [COURT.x + 13, COURT.z];
  b.add('#a8743a', new THREE.BoxGeometry(2.6, 1.4, 2.6).translate(al[0], y0 + 0.7, al[1]), { emissive: '#2a1a04' });
  for (const [hx, hz] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) b.add('#c8964a', new THREE.ConeGeometry(0.15, 0.4, 5).translate(al[0] + hx, y0 + 1.6, al[1] + hz));
  b.add('#3a2a22', new THREE.BoxGeometry(2.0, 0.2, 2.0).translate(al[0], y0 + 1.45, al[1]));
  flames(ctx, [{ pos: [al[0], y0 + 1.5, al[1]], h: 1.3, light: true, w: 1.6 }, { pos: [al[0] + 0.5, y0 + 1.5, al[1] - 0.3], h: 0.9, w: 1.2 }, { pos: [al[0] - 0.5, y0 + 1.5, al[1] + 0.4], h: 1.0, w: 1.2 }], { light: { color: '#ffa850', intensity: 18, distance: 22 } });
  glow(ctx, { pos: [al[0], y0 + 2.4, al[1]], size: 5, color: '#ffb35a', opacity: 0.6, pulse: 0.08 });
  ctx.addCollider({ x: al[0], z: al[1], hx: 1.3, hz: 1.3, rot: 0, top: y0 + 1.4 });

  // The camp: Levites close about the court, the tribes beyond, a few fires lit for the night.
  const keep = [{ kind: 'rect', x: 0, z: -20, hx: 34, hz: 22 }, { kind: 'rect', x: 50, z: -16, hx: 26, hz: 12 }];
  camp(b, ctx, { center: [0, -20], ring: [34, 170], count: 340, seed: 221, keepOut: keep, colors: TENT_COLORS });
  const rng = makeRng(22);
  let lit = 0;
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2, r = 32 + rng() * 60;
    const x = Math.sin(a) * r, z = -20 + Math.cos(a) * r;
    if (ctx.blocked(x, z, 1.5) || keep.some((k) => Math.abs(x - k.x) < k.hx && Math.abs(z - k.z) < k.hz)) continue;
    campfire(b, ctx, { pos: [x, z], light: lit++ < 5 ? { color: '#ffa850', intensity: 10, distance: 16 } : null });
  }
  b.flush();

  // The pillar of cloud resting over the tent, lit from within by fire as night comes.
  pillar(ctx, { pos: [t.x, t.z], lift: t.h, height: 90, radius: 7, color: '#ffe8c4', shade: '#5a3020', fire: true });
  stars(ctx, { count: 500, size: 1.6, minY: 0.35 });

  // Moses waits before the gate: he could not enter, for the cloud abode upon the tent.
  person(ctx, { pos: [COURT.x + COURT.hx + 6.5, COURT.z - 1.8], face: [t.x, t.z], scale: 1.25, colors: { ...MOSES, arms: [0.45, 1.2] } });
  person(ctx, { pos: [COURT.x + 9, COURT.z - 3], face: [t.x, t.z], colors: { ...PRIEST, mantle: '#3a4f9a', sash: '#b5303b' } });
  person(ctx, { pos: [COURT.x + 10, COURT.z + 3.5], face: [al[0], al[1]], colors: PRIEST });
  person(ctx, { pos: [COURT.x + 15, COURT.z - 4], face: [al[0], al[1]], colors: PRIEST });
}

export default {
  title: 'Exodus 40:33-38: The tabernacle',
  subtitle: 'The cloud covers the tent of the congregation, and fire is on it by night',
  seed: 22,
  style: { ...DAY_STYLE, fog: { color: '#4a4058', near: 120, far: 900 } },
  sky: { zenith: '#141a3a', mid: '#3a3a64', horizon: '#d8885a', ground: '#4a3a34', glowColor: '#ffb070', glowDir: [-0.9, 0.08, 0.2] },
  sun: { dir: [-0.8, 0.35, 0.3], color: '#ffb888', intensity: 1.0, hemi: { sky: '#6a6a9a', ground: '#5a3a2a', intensity: 0.9 }, shadowSize: 70 },
  ground: {
    size: 1400, segments: 260, flatRadius: 200, hillHeight: 40, undulation: 0.2,
    plaza: { center: [COURT.x, COURT.z], size: [COURT.hx * 2, COURT.hz * 2] },
    colors: { sand: '#c8a478', dirt: '#b48e64', grass: '#a09466', grassDark: '#8a8058', plaza: '#d4bc94', plazaLine: '#d0b68c', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#8a7060' },
  },
  mountains: { count: 30, distance: [500, 800], height: [60, 140], widthRatio: [1.6, 2.6], colors: ['#5a4a58', '#4a3e50', '#62505a'] },
  objects: [
    { type: 'stones', count: 300, ring: [30, 160], size: [0.12, 0.4], colors: ['#a8906c', '#9c8064'] },
  ],
  custom,
  clouds: { layers: [{ count: 22, distance: [400, 800], height: [90, 180], size: [40, 80], color: '#e0a080', shade: '#3a2a48' }] },
  crowd: {
    seed: 22,
    minSpacing: 0.75,
    facing: [TENT.x, TENT.z],
    colors: PALETTE,
    aisles: [{ from: [60, -14], to: [COURT.x + COURT.hx + 4, COURT.z], width: 4 }],
    groups: [
      { shape: 'rect', center: [COURT.x + COURT.hx + 18, COURT.z - 4], size: [28, 40], count: 320, children: 0.15, kneel: 0.3, facingJitter: 0.3 },
      { shape: 'rect', center: [0, COURT.z + COURT.hz + 6], size: [50, 8], count: 120, children: 0.15, kneel: 0.3 },
      { shape: 'rect', center: [0, COURT.z - COURT.hz - 6], size: [50, 8], count: 120, children: 0.15, kneel: 0.3 },
    ],
  },
  player: {
    start: [39, -17.2],
    lookAt: [TENT.x, TENT.z + 4],
    colors: { robe: '#8c5a3c', mantle: '#c8912e', skin: '#a8724a', hair: '#2b1a12', sash: '#4f7f80' },
  },
};
