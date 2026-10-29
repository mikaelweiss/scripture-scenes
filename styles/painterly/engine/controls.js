import * as THREE from 'three';

// First-person walking: pointer-lock mouse look (drag-look as fallback), WASD/arrows,
// and touch (left half drags to move, right half drags to look).
export class WalkControls {
  constructor(camera, dom, { heightAt, colliders, spawn, eye = 1.7, speed = 4.5, limit = 280 }) {
    Object.assign(this, { camera, heightAt, colliders, eye, speed, limit });
    this.pos = new THREE.Vector3(spawn.pos[0], 0, spawn.pos[1]);
    this.yaw = spawn.yaw;
    this.pitch = spawn.pitch ?? 0;
    this.y = heightAt(this.pos.x, this.pos.z) + eye;
    this.keys = new Set();
    this.drag = null;
    this.touches = new Map();
    this.bob = 0;
    camera.rotation.order = 'YXZ';

    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    dom.addEventListener('click', () => {
      if (!this.locked && !this.dragged) dom.requestPointerLock?.()?.catch?.(() => {});
    });
    document.addEventListener('pointerlockchange', () => (this.locked = document.pointerLockElement === dom));
    dom.addEventListener('mousedown', (e) => {
      this.drag = { x: e.clientX, y: e.clientY };
      this.dragged = false;
    });
    addEventListener('mouseup', () => (this.drag = null));
    addEventListener('mousemove', (e) => {
      if (this.locked) return this.look(e.movementX, e.movementY, 0.0022);
      if (!this.drag) return;
      this.look(e.clientX - this.drag.x, e.clientY - this.drag.y, 0.004);
      if (Math.abs(e.clientX - this.drag.x) + Math.abs(e.clientY - this.drag.y) > 2) this.dragged = true;
      this.drag = { x: e.clientX, y: e.clientY };
    });
    const touch = (e, phase) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (phase === 'start') {
          this.touches.set(t.identifier, { move: t.clientX < innerWidth / 2, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY });
        } else if (phase === 'move') {
          const s = this.touches.get(t.identifier);
          if (!s) continue;
          if (!s.move) this.look(t.clientX - s.x, t.clientY - s.y, 0.005);
          s.x = t.clientX;
          s.y = t.clientY;
        } else this.touches.delete(t.identifier);
      }
    };
    dom.addEventListener('touchstart', (e) => touch(e, 'start'), { passive: false });
    dom.addEventListener('touchmove', (e) => touch(e, 'move'), { passive: false });
    dom.addEventListener('touchend', (e) => touch(e, 'end'));
    dom.addEventListener('touchcancel', (e) => touch(e, 'end'));
  }

  look(dx, dy, k) {
    this.yaw -= dx * k;
    this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch - dy * k));
  }

  collide(p, r = 0.45) {
    for (const c of this.colliders) {
      const cos = Math.cos(c.yaw), sin = Math.sin(c.yaw);
      const dx = p.x - c.x, dz = p.z - c.z;
      const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
      const px = c.hx + r - Math.abs(lx), pz = c.hz + r - Math.abs(lz);
      if (px <= 0 || pz <= 0) continue;
      let nx = lx, nz = lz;
      if (px < pz) nx = Math.sign(lx) * (c.hx + r);
      else nz = Math.sign(lz) * (c.hz + r);
      p.x = c.x + nx * cos + nz * sin;
      p.z = c.z - nx * sin + nz * cos;
    }
  }

  update(dt) {
    const k = this.keys;
    let fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let side = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0);
    const turn = (k.has('ArrowLeft') ? 1 : 0) - (k.has('ArrowRight') ? 1 : 0);
    this.yaw += turn * 1.7 * dt;
    for (const t of this.touches.values()) {
      if (!t.move) continue;
      fwd += Math.max(-1, Math.min(1, -(t.y - t.y0) / 60));
      side += Math.max(-1, Math.min(1, (t.x - t.x0) / 60));
    }
    const len = Math.hypot(fwd, side);
    if (len > 1) (fwd /= len), (side /= len);
    const speed = this.speed * (k.has('ShiftLeft') || k.has('ShiftRight') ? 2.2 : 1);
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    this.pos.x += (-sin * fwd + cos * side) * speed * dt;
    this.pos.z += (-cos * fwd - sin * side) * speed * dt;
    this.collide(this.pos);
    const d = Math.hypot(this.pos.x, this.pos.z);
    if (d > this.limit) this.pos.multiplyScalar(this.limit / d);

    const moving = len > 0.05;
    if (moving) this.bob += dt * speed * 1.9;
    const target = this.heightAt(this.pos.x, this.pos.z) + this.eye + (moving ? Math.sin(this.bob) * 0.04 : 0);
    this.y += (target - this.y) * Math.min(1, dt * 10);
    this.camera.position.set(this.pos.x, this.y, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }
}
