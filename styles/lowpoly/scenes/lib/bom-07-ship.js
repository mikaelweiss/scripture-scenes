import * as THREE from 'three';
import { Batch } from '../../engine/world.js';

const up = new THREE.Vector3(0, 1, 0);

// A box stretched from point a to point b.
export function beam(batch, a, b, thick, color, jitter = 0.06) {
  const len = a.distanceTo(b);
  const g = new THREE.BoxGeometry(thick, thick, len);
  const m = new THREE.Matrix4().lookAt(a, b, Math.abs(b.y - a.y) > len * 0.99 ? new THREE.Vector3(1, 0, 0) : up);
  m.setPosition(a.clone().add(b).multiplyScalar(0.5));
  g.applyMatrix4(m);
  batch.add(g, { color, jitter });
}

function quad(batch, a, b, c, d, color, jitter = 0.05) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...c, ...b, ...d], 3));
  batch.add(g, { color, jitter });
}

// Hull shape: bow toward local -z, keel at y 0. Returns helpers describing the hull.
export function hullShape({ length = 30, beam: B = 8, depth = 4.4, sheer = 1.6, rocker = 1.2 } = {}) {
  const half = (s, h) => {
    const k = s < 0 ? Math.pow(Math.abs(s), 1.8) : Math.pow(s, 3.2);
    return (B / 2) * Math.pow(Math.max(0, 1 - k), 0.6) * (0.16 + 0.84 * Math.pow(h, 0.55));
  };
  const keelY = (s) => rocker * s * s;
  const topY = (s) => depth + sheer * s * s * (s < 0 ? 1.15 : 1);
  const point = (s, h, side) => new THREE.Vector3(side * half(s, h), keelY(s) + (topY(s) - keelY(s)) * h, (s * length) / 2);
  const deckY = (z) => topY((2 * z) / length) - 0.45;
  return { length, B, depth, half, keelY, topY, point, deckY };
}

// Builds a ship into its own mesh. `built` < 1 leaves an open frame of ribs with partial planking.
export function buildShip({ mast = true, length = 30, beam: B = 8, depth = 4.4, built = 1, sail = 'full', hullColor = '#7a5234', plankAlt = '#8a6040', deckColor = '#a57d52', sailColor = '#e9dcc0', rand }) {
  const shape = hullShape({ length, beam: B, depth });
  const { point, half, topY, deckY } = shape;
  const batch = new Batch(rand);
  const N = 18, M = 6;
  const S = (i) => -1 + (2 * i) / N;
  const colliders = [];
  const planked = (i, j) => built >= 1 || j < 2 || (j < 4 && i > N * 0.25 && i < N * 0.8) || (i > N * 0.55 && i < N * 0.75);

  for (const side of [-1, 1]) {
    for (let j = 0; j < M; j++) {
      for (let i = 0; i < N; i++) {
        if (!planked(i, j)) continue;
        const a = point(S(i), j / M, side), b = point(S(i + 1), j / M, side);
        const c = point(S(i), (j + 1) / M, side), d = point(S(i + 1), (j + 1) / M, side);
        quad(batch, a.toArray(), b.toArray(), c.toArray(), d.toArray(), j % 2 ? plankAlt : hullColor);
      }
    }
  }
  for (let i = 0; i < N; i++) {
    const a = point(S(i), 0, -1), b = point(S(i + 1), 0, -1), c = point(S(i), 0, 1), d = point(S(i + 1), 0, 1);
    quad(batch, a.toArray(), b.toArray(), c.toArray(), d.toArray(), '#5a3b26');
  }
  beam(batch, point(-1.02, 0, 0).setY(-0.3), point(1.02, 0, 0).setY(-0.3), 0.5, '#4f3322');
  beam(batch, point(-1, 0, 0), point(-1.04, 1, 0).setY(topY(-1) + 1.6), 0.45, '#5a3b26');
  beam(batch, point(1, 0, 0), point(1.03, 1, 0).setY(topY(1) + 1.2), 0.45, '#5a3b26');

  const ribColor = '#6b4a30';
  for (let i = 1; i < N; i++) {
    if (built >= 1 && i % 2) continue;
    for (const side of [-1, 1]) {
      for (let j = 0; j < M; j++) {
        const a = point(S(i), j / M, side), b = point(S(i), (j + 1) / M, side);
        a.x *= 0.97, b.x *= 0.97;
        beam(batch, a, b, 0.22, ribColor);
      }
    }
    if (built < 1) beam(batch, point(S(i), 1, -1), point(S(i), 1, 1), 0.2, ribColor);
  }

  if (built >= 1) {
    for (let i = 0; i < N; i++) {
      const s0 = S(i), s1 = S(i + 1);
      const z0 = (s0 * length) / 2, z1 = (s1 * length) / 2;
      const y0 = deckY(z0), y1 = deckY(z1);
      const w0 = half(s0, 1) * 0.98, w1 = half(s1, 1) * 0.98;
      quad(batch, [-w0, y0, z0], [-w1, y1, z1], [w0, y0, z0], [w1, y1, z1], i % 2 ? deckColor : '#9a7249', 0.04);
      colliders.push({ x: 0, z: (z0 + z1) / 2, w: Math.min(w0, w1) * 2, d: z1 - z0 + 0.05, bottom: Math.min(y0, y1) - 2, top: (y0 + y1) / 2 });
      for (const side of [-1, 1]) {
        const a = point(s0, 1, side), b = point(s1, 1, side);
        const ra = a.clone().setY(a.y + 0.9), rb = b.clone().setY(b.y + 0.9);
        beam(batch, ra, rb, 0.22, '#5a3b26');
        quad(batch, a.toArray(), b.toArray(), ra.toArray(), rb.toArray(), plankAlt);
        if (i % 2 === 0) beam(batch, a, ra, 0.18, '#5a3b26');
        const mid = a.clone().add(b).multiplyScalar(0.5);
        colliders.push({ x: mid.x - side * 0.25, z: mid.z, w: 0.5, d: a.distanceTo(b) + 0.3, rot: Math.atan2(b.x - a.x, b.z - a.z), bottom: mid.y - 1, top: mid.y + 4 });
      }
    }
    if (mast) {
    const mastZ = -length * 0.08, mastH = 17;
    const my = deckY(mastZ);
    batch.add(new THREE.CylinderGeometry(0.22, 0.32, mastH, 7), { position: [0, my + mastH / 2 - 1, mastZ], color: '#6b4a30' });
    colliders.push({ x: 0, z: mastZ, w: 0.7, d: 0.7, bottom: my - 1, top: my + mastH });
    const yardY = my + mastH * 0.82;
    beam(batch, new THREE.Vector3(-6, yardY, mastZ + 0.3), new THREE.Vector3(6, yardY, mastZ + 0.3), 0.22, '#5a3b26');
    if (sail === 'full') {
      const g = new THREE.BoxGeometry(11, 9, 0.12, 4, 4, 1);
      const p = g.attributes.position;
      for (let v = 0; v < p.count; v++) p.setZ(v, p.getZ(v) - (1 - (p.getX(v) / 5.5) ** 2) * (1 - ((p.getY(v) + 4.5) / 9 - 0.6) ** 2) * 1.2);
      batch.add(g, { position: [0, yardY - 4.7, mastZ + 0.4], color: sailColor, jitter: 0.03 });
    } else if (sail === 'furled') {
      beam(batch, new THREE.Vector3(-5.5, yardY - 0.35, mastZ + 0.45), new THREE.Vector3(5.5, yardY - 0.35, mastZ + 0.45), 0.6, sailColor, 0.04);
    }
    const stay = (a, b) => beam(batch, a, b, 0.05, '#3d2c20', 0.02);
    const top = new THREE.Vector3(0, my + mastH - 1.2, mastZ);
    stay(top, point(-1, 1, 0).setY(topY(-1) + 1.4));
    for (const side of [-1, 1]) stay(top, point(0.7, 1, side));
    for (const side of [-1, 1]) for (const k of [-0.25, -0.05]) stay(top, point(k, 1, side));
    for (const side of [-1, 1]) stay(new THREE.Vector3(side * 6, yardY, mastZ + 0.3), point(0.45, 1, side));

    const helmZ = length * 0.42;
    beam(batch, new THREE.Vector3(1.2, deckY(helmZ) + 1.6, helmZ), new THREE.Vector3(1.7, -0.8, length * 0.53), 0.25, '#5a3b26');
    batch.box(0.15, 1.8, 0.9, { position: [1.75, -0.6, length * 0.535], rotation: [0.5, 0, 0], color: '#5a3b26' });
    }
  }

  const mesh = batch.build(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  mesh.castShadow = mesh.receiveShadow = true;
  return { mesh, colliders, shape };
}

// Moves ship-local collider boxes into the world at (x, z, y) rotated by rot.
export function placeColliders(ctx, list, { x = 0, z = 0, y = 0, rot = 0 }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const b of list) {
    ctx.colliders.add({ ...b, x: x + b.x * c + b.z * s, z: z - b.x * s + b.z * c, rot: (b.rot ?? 0) + rot, bottom: b.bottom + y, top: b.top + y });
  }
}
