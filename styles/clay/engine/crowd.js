import * as THREE from 'three';
import { clayMaterial, pawnParts, mulberry, merge } from './clay.js';

const CELL = 2;

// Thousands of peg-doll people as four instanced meshes (robe, shawl, head,
// hair or hood) sharing one matrix per person. People near the player shuffle
// aside so the crowd can be walked through.
export class Crowd {
  constructor(spec, world, seed = 7, clearings = []) {
    const rand = mulberry(seed);
    this.people = [];
    this.grid = new Map();
    const pick = (list) => list[Math.floor(rand() * list.length)];

    for (const g of spec.groups) {
      let made = 0, tries = 0;
      const [cx, cz] = g.center;
      while (made < g.count && tries++ < g.count * 40) {
        const r0 = g.radius[0], r1 = g.radius[1];
        const d = Math.sqrt(r0 * r0 + rand() * (r1 * r1 - r0 * r0));
        const a = THREE.MathUtils.degToRad(g.angle[0] + rand() * (g.angle[1] - g.angle[0]));
        const x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
        const scale = g.scale[0] + rand() * (g.scale[1] - g.scale[0]);
        const spacing = g.kind === 'child' ? 0.55 : 0.82;
        if (world.colliders.hits(x, z, 0.45)) continue;
        if (this.near(x, z, spacing)) continue;
        if (clearings.some(([qx, qz, qr]) => Math.hypot(x - qx, z - qz) < qr)) continue;
        const yaw = Math.atan2(g.facing[0] - x, g.facing[1] - z) + (rand() - 0.5) * 0.6;
        const p = {
          x, z, yaw, scale,
          y: world.height(x, z),
          ox: 0, oz: 0,
          robe: pick(spec.robes), cloak: pick(spec.cloaks), skin: pick(spec.skins),
          cap: rand() < spec.hoodChance ? null : pick(spec.hair),
        };
        if (!p.cap) p.cap = p.cloak;
        this.insert(p);
        made++;
      }
    }

    const n = this.people.length;
    const parts = pawnParts(1);
    const phase = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
    this.people.forEach((p, i) => { phase.array[i] = rand() * 100; });
    this.meshes = {};
    for (const [name, geo] of Object.entries(parts)) {
      geo.setAttribute('aPhase', phase);
      const mesh = new THREE.InstancedMesh(geo, clayMaterial('#ffffff', { sway: true, bump: name === 'head' ? 0.3 : 1 }), n);
      mesh.receiveShadow = true;
      this.meshes[name] = mesh;
    }
    this.meshes.shadow = this.shadowProxy(n);
    const col = new THREE.Color();
    this.people.forEach((p, i) => {
      this.meshes.robe.setColorAt(i, col.set(p.robe));
      this.meshes.shawl.setColorAt(i, col.set(p.cloak));
      this.meshes.head.setColorAt(i, col.set(p.skin));
      this.meshes.cap.setColorAt(i, col.set(p.cap));
      this.writeMatrix(i);
    });
    this.group = new THREE.Group();
    for (const m of Object.values(this.meshes)) {
      m.computeBoundingSphere();
      this.group.add(m);
    }
    this.active = new Set();
  }

  // A low-poly stand-in that only casts shadows: the full pawns would cost
  // the shadow pass several times more triangles for the same soft blob.
  shadowProxy(n) {
    const body = new THREE.LatheGeometry([[0, 0], [0.32, 0], [0.3, 0.5], [0.22, 1.2], [0, 1.3]].map(([r, y]) => new THREE.Vector2(r, y)), 6);
    const head = new THREE.SphereGeometry(0.21, 6, 4).translate(0, 1.48, 0);
    const mesh = new THREE.InstancedMesh(merge([body, head]), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), n);
    mesh.castShadow = true;
    this.shadowCaster = mesh;
    return mesh;
  }

  key(x, z) { return `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`; }

  insert(p) {
    const k = this.key(p.x, p.z);
    if (!this.grid.has(k)) this.grid.set(k, []);
    this.grid.get(k).push(this.people.length);
    this.people.push(p);
  }

  forNear(x, z, fn) {
    const gx = Math.floor(x / CELL), gz = Math.floor(z / CELL);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const cell = this.grid.get(`${gx + i},${gz + j}`);
      if (cell) for (const idx of cell) fn(idx, this.people[idx]);
    }
  }

  near(x, z, min) {
    let hit = false;
    this.forNear(x, z, (_, p) => { if (!hit && Math.hypot(p.x - x, p.z - z) < min) hit = true; });
    return hit;
  }

  writeMatrix(i) {
    const p = this.people[i];
    const m = this.m ??= new THREE.Matrix4();
    const q = this.q ??= new THREE.Quaternion();
    const v = this.v ??= new THREE.Vector3();
    const s = this.s ??= new THREE.Vector3();
    const lean = Math.min(0.25, Math.hypot(p.ox, p.oz) * 0.35);
    q.setFromEuler(new THREE.Euler(p.oz * lean, p.yaw, -p.ox * lean, 'YXZ'));
    m.compose(v.set(p.x + p.ox, p.y, p.z + p.oz), q, s.setScalar(p.scale));
    for (const mesh of Object.values(this.meshes ?? {})) mesh.setMatrixAt(i, m);
  }

  update(player, dt) {
    const R = 1.25;
    const k = 1 - Math.exp(-dt * 8);
    this.forNear(player.x, player.z, (i, p) => {
      if (Math.hypot(p.x - player.x, p.z - player.z) < R + 0.6) this.active.add(i);
    });
    if (!this.active.size) return;
    for (const i of this.active) {
      const p = this.people[i];
      const dx = p.x - player.x, dz = p.z - player.z, d = Math.hypot(dx, dz) || 1e-3;
      const push = Math.max(0, R - d);
      p.ox += ((dx / d) * push - p.ox) * k;
      p.oz += ((dz / d) * push - p.oz) * k;
      this.writeMatrix(i);
      if (push === 0 && Math.abs(p.ox) + Math.abs(p.oz) < 0.003) {
        p.ox = p.oz = 0;
        this.writeMatrix(i);
        this.active.delete(i);
      }
    }
    for (const mesh of Object.values(this.meshes)) mesh.instanceMatrix.needsUpdate = true;
  }
}
