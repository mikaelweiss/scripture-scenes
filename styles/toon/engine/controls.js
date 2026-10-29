import * as THREE from 'three';

const STEP_UP = 0.6;
const RADIUS = 0.35;

export class ThirdPersonControls {
  constructor({ camera, dom, avatar, world, start, lookAt, walkSpeed = 6, runSpeed = 11 }) {
    this.camera = camera;
    this.avatar = avatar;
    this.world = world;
    this.walkSpeed = walkSpeed;
    this.runSpeed = runSpeed;
    this.pos = new THREE.Vector3(start[0], 0, start[1]);
    this.pos.y = world.groundHeight(start[0], start[1]);
    this.vy = 0;
    this.yaw = Math.atan2(-(lookAt[0] - start[0]), -(lookAt[1] - start[1]));
    this.heading = this.yaw + Math.PI;
    this.pitch = 0.12;
    this.distance = 9;
    this.eyeY = this.pos.y;
    this.walkPhase = 0;
    this.keys = new Set();
    this.move = new THREE.Vector2();
    this.bindInput(dom);
  }

  bindInput(dom) {
    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow')) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    const pointers = new Map();
    dom.addEventListener('pointerdown', (e) => {
      dom.setPointerCapture(e.pointerId);
      const joystick = e.pointerType === 'touch' && e.clientX < innerWidth * 0.4;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, joystick });
    });
    dom.addEventListener('pointermove', (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      if (p.joystick) {
        this.move.set((e.clientX - p.sx) / 60, -(e.clientY - p.sy) / 60);
        if (this.move.length() > 1) this.move.normalize();
      } else {
        this.yaw -= (e.clientX - p.x) * 0.006;
        this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - p.y) * 0.004, -0.15, 1.25);
      }
      p.x = e.clientX;
      p.y = e.clientY;
    });
    const end = (e) => {
      const p = pointers.get(e.pointerId);
      if (p?.joystick) this.move.set(0, 0);
      pointers.delete(e.pointerId);
    };
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.distance = THREE.MathUtils.clamp(this.distance * (1 + Math.sign(e.deltaY) * 0.1), 3, 30);
    }, { passive: false });
  }

  input() {
    const k = this.keys;
    const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    const v = new THREE.Vector2(s + this.move.x, f + this.move.y);
    if (v.length() > 1) v.normalize();
    return v;
  }

  update(dt) {
    const inp = this.input();
    const run = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const speed = run ? this.runSpeed : this.walkSpeed;
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    const dx = (fx * inp.y + rx * inp.x) * speed * dt;
    const dz = (fz * inp.y + rz * inp.x) * speed * dt;
    const moving = inp.lengthSq() > 0.001;

    if (moving) {
      this.pos.x += dx;
      this.pos.z += dz;
      this.collide();
      const target = Math.atan2(dx, dz);
      let diff = target - this.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.heading += diff * Math.min(1, dt * 12);
      this.walkPhase += dt * speed * 1.6;
    }

    const ground = this.world.supportHeight(this.pos.x, this.pos.z, this.pos.y + STEP_UP);
    if (ground >= this.pos.y) {
      this.pos.y = ground;
      this.vy = 0;
    } else {
      this.vy -= 22 * dt;
      this.pos.y = Math.max(ground, this.pos.y + this.vy * dt);
    }

    const bob = moving ? Math.abs(Math.sin(this.walkPhase)) * 0.07 : 0;
    this.avatar.position.set(this.pos.x, this.pos.y + bob, this.pos.z);
    this.avatar.rotation.set(0, this.heading, moving ? Math.sin(this.walkPhase) * 0.05 : 0);

    this.eyeY += (this.pos.y - this.eyeY) * Math.min(1, dt * 8);
    const target = new THREE.Vector3(this.pos.x, this.eyeY + 3.2, this.pos.z);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const cam = this.camera.position;
    const dir = new THREE.Vector3(-fx * cp, sp, -fz * cp);
    let reach = this.distance;
    for (let d = 0.5; d <= this.distance; d += 0.5) {
      const x = target.x + dir.x * d, y = target.y + dir.y * d, z = target.z + dir.z * d;
      if (this.world.supportHeight(x, z) > y - 0.3) {
        reach = Math.max(0.5, d - 0.5);
        break;
      }
    }
    this.camReach = Math.min(reach, (this.camReach ?? reach) + dt * 6);
    cam.copy(target).addScaledVector(dir, this.camReach);
    const floor = this.world.terrainHeight(cam.x, cam.z) + 0.4;
    if (cam.y < floor) cam.y = floor;
    this.camera.lookAt(target);
  }

  collide() {
    for (const c of this.world.colliders) {
      if (c.top <= this.pos.y + STEP_UP) continue;
      const dx = this.pos.x - c.x, dz = this.pos.z - c.z;
      const cos = Math.cos(c.rot), sin = Math.sin(c.rot);
      let lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
      const px = c.hx + RADIUS - Math.abs(lx), pz = c.hz + RADIUS - Math.abs(lz);
      if (px <= 0 || pz <= 0) continue;
      if (px < pz) lx = Math.sign(lx || 1) * (c.hx + RADIUS);
      else lz = Math.sign(lz || 1) * (c.hz + RADIUS);
      this.pos.x = c.x + lx * cos + lz * sin;
      this.pos.z = c.z - lx * sin + lz * cos;
    }
  }
}
