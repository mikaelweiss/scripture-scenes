import * as THREE from 'three';
import { clayMaterial, pawnParts } from './clay.js';

const deg = THREE.MathUtils.degToRad;

// A pawn the viewer walks with, and a third-person orbit camera that trails it.
export class Player {
  constructor(spec, world, camera, dom) {
    this.world = world;
    this.camera = camera;
    this.pos = new THREE.Vector3(spec.start[0], 0, spec.start[1]);
    if (spec.faces) {
      this.heading = Math.atan2(spec.faces[0] - this.pos.x, spec.faces[1] - this.pos.z);
      this.yaw = this.heading + Math.PI + deg(spec.camera.yaw ?? 0);
    } else {
      this.heading = deg(spec.heading ?? 180);
      this.yaw = deg(spec.camera.yaw ?? 0);
    }
    this.pitch = deg(spec.camera.pitch ?? 22);
    this.distance = spec.camera.distance ?? 14;
    this.keys = new Set();
    this.walk = 0;
    this.speed = 0;
    this.joy = null;

    const parts = pawnParts(2);
    this.body = new THREE.Group();
    const colors = { robe: spec.robe, shawl: spec.cloak, head: spec.skin, cap: spec.hair };
    for (const [name, geo] of Object.entries(parts)) {
      const mesh = new THREE.Mesh(geo, clayMaterial(colors[name], { bump: name === 'head' ? 0.3 : 1 }));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.body.add(mesh);
    }
    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.6, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }),
    );
    marker.position.y = 0.05;
    this.marker = marker;
    this.group = new THREE.Group();
    this.group.add(this.body, marker);
    this.bindInput(dom);
    this.camPos = new THREE.Vector3();
    this.update(0);
    this.camPos.copy(this.desiredCamera());
  }

  bindInput(dom) {
    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    let drag = null;
    dom.addEventListener('pointerdown', (e) => {
      dom.setPointerCapture(e.pointerId);
      const left = e.pointerType === 'touch' && e.clientX < innerWidth * 0.4;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, joy: left };
      if (left) this.joy = { x: 0, y: 0 };
    });
    dom.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (drag.joy) {
        const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy, len = Math.hypot(dx, dy), max = 60;
        this.joy = { x: dx / Math.max(max, len), y: dy / Math.max(max, len) };
      } else {
        this.yaw -= (e.clientX - drag.x) * 0.006;
        this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - drag.y) * 0.004, deg(4), deg(70));
      }
      drag.x = e.clientX;
      drag.y = e.clientY;
    });
    const end = (e) => {
      if (drag && drag.id === e.pointerId) {
        if (drag.joy) this.joy = null;
        drag = null;
      }
    };
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);
    dom.addEventListener('wheel', (e) => {
      this.distance = THREE.MathUtils.clamp(this.distance * Math.exp(e.deltaY * 0.001), 4, 60);
      e.preventDefault();
    }, { passive: false });
  }

  input() {
    const k = this.keys;
    let f = 0, s = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) s -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) s += 1;
    if (this.joy) { f -= this.joy.y; s += this.joy.x; }
    if (k.has('KeyQ')) this.yaw += 0.03;
    if (k.has('KeyE')) this.yaw -= 0.03;
    return { f, s, run: k.has('ShiftLeft') || k.has('ShiftRight') };
  }

  desiredCamera() {
    const h = Math.cos(this.pitch) * this.distance;
    return new THREE.Vector3(
      this.pos.x + Math.sin(this.yaw) * h,
      this.pos.y + 1.4 + Math.sin(this.pitch) * this.distance,
      this.pos.z + Math.cos(this.yaw) * h,
    );
  }

  // Slides the camera toward the player until nothing solid sits between them.
  pullIn(want) {
    const from = this.tmp ??= new THREE.Vector3();
    from.set(this.pos.x, this.pos.y + 1.4, this.pos.z);
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + (want.x - from.x) * t, y = from.y + (want.y - from.y) * t, z = from.z + (want.z - from.z) * t;
      if (this.world.colliders.hits(x, z, 0.25, y)) {
        want.lerpVectors(from, want, Math.max(0, (i - 1.5) / steps));
        return true;
      }
    }
    return false;
  }

  update(dt) {
    const { f, s, run } = this.input();
    const len = Math.min(1, Math.hypot(f, s));
    const target = len > 0.05 ? (run ? 9 : 4.5) * len : 0;
    this.speed += (target - this.speed) * (1 - Math.exp(-dt * 10));
    if (len > 0.05) {
      // forward is away from the camera
      const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
      const rx = -fz, rz = fx;
      const dx = fx * f + rx * s, dz = fz * f + rz * s;
      const want = Math.atan2(dx, dz);
      let diff = want - this.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.heading += diff * (1 - Math.exp(-dt * 12));
      const n = Math.hypot(dx, dz);
      this.pos.x += (dx / n) * this.speed * dt;
      this.pos.z += (dz / n) * this.speed * dt;
    }
    this.world.colliders.resolve(this.pos, 0.38);
    const lim = 230;
    this.pos.x = THREE.MathUtils.clamp(this.pos.x, -lim, lim);
    this.pos.z = THREE.MathUtils.clamp(this.pos.z, -lim, lim);
    this.pos.y = this.world.height(this.pos.x, this.pos.z);

    this.walk += this.speed * dt * 2.2;
    const moving = Math.min(1, this.speed / 4);
    this.group.position.copy(this.pos);
    this.body.rotation.set(0, this.heading, Math.sin(this.walk) * 0.12 * moving);
    this.body.position.y = Math.abs(Math.sin(this.walk)) * 0.12 * moving;

    const want = this.desiredCamera();
    const minY = this.world.height(want.x, want.z) + 0.8;
    if (want.y < minY) want.y = minY;
    const blocked = this.pullIn(want);
    this.camPos.lerp(want, dt && !blocked ? 1 - Math.exp(-dt * 8) : 1);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.pos.x, this.pos.y + 1.4 + this.distance * 0.12, this.pos.z);
  }
}
