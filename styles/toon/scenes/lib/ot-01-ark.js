import * as THREE from 'three';
import { Parts, makeRng, between } from './ot-01-kit.js';

const HALF_W = 7;

function plankTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(40,24,14,0.55)';
  g.fillRect(0, 0, 3, 64);
  g.fillRect(0, 30, 32, 2);
  g.fillStyle = 'rgba(40,24,14,0.12)';
  g.fillRect(20, 0, 10, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 0.7, 1 / 5);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const section = (top) => {
  const s = new THREE.Shape();
  const pts = [[-HALF_W, top], [-6.7, 3], [-5.2, 0.9], [-2.2, 0], [2.2, 0], [5.2, 0.9], [6.7, 3], [HALF_W, top]];
  s.moveTo(...pts[0]);
  for (const p of pts.slice(1)) s.lineTo(...p);
  s.lineTo(HALF_W - 0.5, top);
  s.lineTo(-HALF_W + 0.5, top);
  return s;
};

// Narrows the ends of the hull and lifts their keel so bow and stern sweep up.
const taper = (z, L) => {
  const t = Math.abs(z) / (L / 2);
  return t > 0.62 ? 1 - Math.pow((t - 0.62) / 0.38, 1.5) * 0.92 : 1;
};

function hullGeometry(L, top) {
  const geo = new THREE.ExtrudeGeometry(section(top), { depth: L, steps: 40, bevelEnabled: false });
  geo.translate(0, 0, -L / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const k = taper(z, L);
    pos.setX(i, pos.getX(i) * k);
    const y = pos.getY(i);
    pos.setY(i, y + (1 - k) * 5.5 * (1 - y / (top + 3)));
  }
  geo.computeVertexNormals();
  return geo;
}

// The ark's hull along local z. `stage` 'frame' shows planking up to a few meters with bare ribs above, 'done' is finished with a cabin.
export function buildArk(ctx, { pos, rot = 0, length: L = 80, height: H = 9, stage = 'done', y, wood = '#8a5a36', dark = '#5e3a22', roof = '#6b4a33', tilt = 0 }) {
  const [x, z] = pos;
  const base = y ?? ctx.terrainHeight(x, z);
  const group = new THREE.Group();
  group.position.set(x, base, z);
  group.rotation.set(tilt, rot, 0, 'YXZ');
  const planks = plankTexture();
  const hullMat = ctx.kit.toon(wood, { map: planks });
  const planked = stage === 'frame' ? 5.4 : H;
  const hull = new THREE.Mesh(hullGeometry(L, planked), hullMat);
  hull.castShadow = hull.receiveShadow = true;
  group.add(hull);

  const p = new Parts();
  const rng = makeRng(17);
  if (stage === 'frame') {
    for (let k = -L / 2 + 4; k <= L / 2 - 4; k += 3.2) {
      const w = HALF_W * taper(k, L);
      const lift = (1 - taper(k, L)) * 5.5;
      const top = H + lift * 0.3 - (rng() < 0.25 ? between(rng, [1, 3]) : 0);
      for (const side of [-1, 1]) p.box(dark, [0.35, top - planked - lift * 0.6 + 0.2, 0.35], [side * w * 0.99, (top + planked + lift * 0.6) / 2, k]);
      if (rng() < 0.6) p.box(dark, [w * 2, 0.3, 0.3], [0, top - 0.2, k]);
    }
    for (const side of [-1, 1]) {
      p.box(dark, [0.3, 0.3, L * 0.72], [side * HALF_W * 0.99, H - 0.2, 0]);
      for (let k = -L / 2 + 6; k <= L / 2 - 6; k += 6) {
        p.box('#a8865a', [0.25, H + 2, 0.25], [side * (HALF_W + 2.2), (H + 2) / 2, k]);
        if (k < L / 2 - 6) {
          p.box('#c8a878', [1.8, 0.15, 6.2], [side * (HALF_W + 1.4), 4.4, k + 3]);
          p.box('#c8a878', [1.8, 0.15, 6.2], [side * (HALF_W + 1.4), 8, k + 3]);
        }
        p.box('#a8865a', [2.4, 0.18, 0.18], [side * (HALF_W + 1.2), 4.1, k]);
        p.box('#a8865a', [2.4, 0.18, 0.18], [side * (HALF_W + 1.2), 7.9, k]);
      }
    }
    p.box(dark, [0.6, 3, 0.6], [0, H * 0.75, L / 2 - 1.5]);
  } else {
    const cabinL = L * 0.62;
    p.box(wood, [HALF_W * 1.5, 3, cabinL], [0, H + 1.5, 0]);
    for (const side of [-1, 1]) p.box(roof, [HALF_W * 0.95, 0.35, cabinL + 1.2], [side * HALF_W * 0.42, H + 3.75, 0], [0, 0, side * -0.36]);
    for (const side of [-1, 1]) for (let k = -cabinL / 2 + 3; k < cabinL / 2 - 2; k += 4) p.box('#2b1a12', [0.1, 0.9, 1.4], [side * HALF_W * 0.76, H + 2, k]);
    p.box('#3a2418', [0.3, 3.6, 4.4], [HALF_W + 0.05, H - 2.6, 4]);
  }
  const extra = p.group(ctx.kit);
  group.add(extra);
  ctx.scene.add(group);

  for (let k = -L / 2 + 3; k <= L / 2 - 3; k += 6) {
    const w = HALF_W * taper(k, L);
    const c = Math.cos(rot), s = Math.sin(rot);
    ctx.addCollider({ x: x + k * s, z: z + k * c, hx: w + (stage === 'frame' ? 2.6 : 0.2), hz: 3.2, rot, top: base + H + 4 });
  }
  return { group, base };
}
