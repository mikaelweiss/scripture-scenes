import * as THREE from 'three';
import { pick, range } from './noise.js';

const v2 = (r, y) => new THREE.Vector2(r, y);
const ROBE = [v2(0, 0), v2(0.3, 0), v2(0.29, 0.12), v2(0.23, 0.8), v2(0.2, 1.25), v2(0.17, 1.42), v2(0.07, 1.5), v2(0, 1.5)];
const MANTLE = [v2(0, 1.52), v2(0.15, 1.5), v2(0.24, 1.38), v2(0.28, 1.1), v2(0.3, 0.7), v2(0.001, 0.7)];
const HEAD_Y = 1.62;

const robeGeo = new THREE.LatheGeometry(ROBE, 8);
const mantleGeo = new THREE.LatheGeometry(MANTLE, 8);
const headGeo = new THREE.SphereGeometry(0.12, 8, 6);

function arcSpots(g, rand) {
  const spots = [];
  const [fx, fz] = g.focus;
  const span = ((g.arc[1] - g.arc[0]) * Math.PI) / 180;
  for (let r = g.radius[0]; spots.length < g.count; r += g.spacing * 0.92) {
    const n = Math.floor((r * span) / g.spacing);
    for (let i = 0; i < n && spots.length < g.count; i++) {
      const a = (g.arc[0] * Math.PI) / 180 + ((i + 0.5 + (rand() - 0.5) * 0.5) / n) * span;
      const rr = r + (rand() - 0.5) * g.spacing * 0.5;
      const x = fx + Math.sin(a) * rr, z = fz + Math.cos(a) * rr;
      if (g.aisle && Math.abs(x - fx) < g.aisle / 2) continue;
      spots.push([x, z]);
    }
  }
  return spots;
}

function ringSpots(g, rand) {
  const spots = [];
  for (let i = 0; i < g.count; i++) {
    const a = (g.arc[0] + (g.arc[1] - g.arc[0]) * ((i + rand() * 0.6) / g.count)) * (Math.PI / 180);
    const r = range(rand, g.radius);
    spots.push([g.center[0] + Math.sin(a) * r, g.center[1] + Math.cos(a) * r]);
  }
  return spots;
}

const layouts = { arc: arcSpots, ring: ringSpots };

// Every person in every group shares three instanced meshes: robe, mantle, head.
export function buildCrowd(ctx, crowd) {
  const { rand } = ctx;
  const groups = crowd.groups.map((g) => ({ g, spots: layouts[g.layout](g, rand) }));
  const total = groups.reduce((n, x) => n + x.spots.length, 0);
  const mat = new THREE.MeshLambertMaterial();
  const robes = new THREE.InstancedMesh(robeGeo, mat, total);
  const mantles = new THREE.InstancedMesh(mantleGeo, mat, total);
  const heads = new THREE.InstancedMesh(headGeo, mat, total);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  const p = crowd.palette;
  let i = 0;
  for (const { g, spots } of groups) {
    const facing = g.facing ?? g.focus ?? g.center;
    for (const [x, z] of spots) {
      const child = rand() < (g.childRatio ?? 0);
      const kneel = rand() < (g.kneelRatio ?? 0);
      const s = (child ? range(rand, [0.5, 0.68]) : range(rand, [0.9, 1.08])) * (g.scale ?? 1);
      const sy = kneel ? 0.6 : 1;
      const y = ctx.heightAt(x, z) - 0.05;
      const yaw = Math.atan2(facing[0] - x, facing[1] - z) + (rand() - 0.5) * 0.6;
      q.setFromEuler(e.set((kneel ? 0.25 : (rand() - 0.5) * 0.08), yaw, (rand() - 0.5) * 0.08, 'YXZ'));
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s * (kneel ? 1.15 : 1), s * sy, s * (kneel ? 1.15 : 1)));
      robes.setMatrixAt(i, m);
      robes.setColorAt(i, c.set(pick(rand, p.robes)).multiplyScalar(range(rand, [0.85, 1.1])));
      if (rand() < 0.3) m.makeScale(0, 0, 0);
      mantles.setMatrixAt(i, m);
      mantles.setColorAt(i, c.set(pick(rand, p.mantles)).multiplyScalar(range(rand, [0.85, 1.1])));
      const lean = kneel ? 0.12 : 0;
      m.compose(new THREE.Vector3(x + Math.sin(yaw) * lean, y + HEAD_Y * s * sy + (kneel ? 0.05 : 0), z + Math.cos(yaw) * lean), q, new THREE.Vector3(s, s, s));
      heads.setMatrixAt(i, m);
      heads.setColorAt(i, c.set(pick(rand, p.heads)));
      i++;
    }
  }
  const group = new THREE.Group();
  for (const mesh of [robes, mantles, heads]) {
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }
  return { group, count: total };
}

// A luminous figure kept deliberately simple: robe, mantle, faceless head, open arms.
export function radiantFigure(ctx, f) {
  const at = f.on ? ctx.anchors[f.on].clone() : new THREE.Vector3(f.pos[0], ctx.heightAt(f.pos[0], f.pos[1]), f.pos[1]);
  if (f.offset) at.add(new THREE.Vector3(...f.offset));
  const group = new THREE.Group();
  group.position.copy(at);
  group.rotation.y = f.facingYaw ?? 0;
  const lum = (color, k) => new THREE.MeshLambertMaterial({ color, emissive: f.glow.color, emissiveIntensity: k });
  const robe = new THREE.Mesh(new THREE.LatheGeometry(ROBE.map((p) => v2(p.x * 1.05, p.y * 1.2)), 16), lum(f.robe, f.glow.emissive));
  const mantle = new THREE.Mesh(new THREE.LatheGeometry(MANTLE.map((p) => v2(p.x * 1.12, p.y * 1.2)), 16), lum(f.mantle, f.glow.emissive * 0.8));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), lum(f.head, f.glow.emissive * 0.6));
  head.position.y = HEAD_Y * 1.2 + 0.02;
  group.add(robe, mantle, head);
  const armGeo = new THREE.CapsuleGeometry(0.075, 0.62, 4, 8);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(armGeo, lum(f.robe, f.glow.emissive));
    arm.position.set(side * 0.42, 1.48, 0.06);
    arm.rotation.z = side * 0.95;
    arm.rotation.x = -0.35;
    group.add(arm);
  }
  group.traverse((o) => (o.castShadow = true));

  const glowTex = radialTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: f.glow.color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: f.glow.opacity }));
  glow.scale.setScalar(f.glow.size);
  glow.position.y = 1.2;
  group.add(glow);
  const light = new THREE.PointLight(f.glow.color, f.glow.light, f.glow.reach, 1.4);
  light.position.y = 2;
  group.add(light);
  ctx.updaters.push((t) => {
    const pulse = 1 + Math.sin(t * 1.3) * 0.05;
    glow.scale.setScalar(f.glow.size * pulse);
  });
  return group;
}

let cachedRadial;
export function radialTexture() {
  if (cachedRadial) return cachedRadial;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  cachedRadial = new THREE.CanvasTexture(cv);
  return cachedRadial;
}
