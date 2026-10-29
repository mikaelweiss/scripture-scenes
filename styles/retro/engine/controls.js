// First-person walker: WASD / arrows, pointer-lock or drag look, two-thumb touch.
export class Walker {
  constructor(canvas, colliders, { pos, yaw = 0, pitch = 0, eye = 1.6, speed = 4.2, bounds = 220 }) {
    this.colliders = colliders;
    this.x = pos[0];
    this.z = pos[1];
    this.yaw = (yaw * Math.PI) / 180;
    this.pitch = (pitch * Math.PI) / 180;
    this.eye = eye;
    this.speed = speed;
    this.bounds = bounds;
    this.feet = colliders.heightAt(this.x, this.z);
    this.eyeY = this.feet + eye;
    this.vy = 0;
    this.bob = 0;
    this.keys = new Set();
    this.stick = { x: 0, y: 0 };
    this.locked = false;

    addEventListener('keydown', (e) => { this.keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('click', () => {
      if (this.locked || matchMedia('(pointer: coarse)').matches) return;
      try {
        const p = canvas.requestPointerLock?.();
        p?.catch?.(() => {});
      } catch { /* pointer lock unavailable: drag-look still works */ }
    });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; });

    let dragging = false;
    canvas.addEventListener('mousedown', () => { dragging = true; });
    addEventListener('mouseup', () => { dragging = false; });
    addEventListener('mousemove', (e) => {
      if (this.locked) this.look(e.movementX * 0.0022, e.movementY * 0.0022);
      else if (dragging) this.look(e.movementX * 0.005, e.movementY * 0.005);
    });

    const touches = new Map();
    canvas.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) {
        touches.set(t.identifier, { move: t.clientX < innerWidth / 2, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY });
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (!s) continue;
        if (s.move) {
          this.stick.x = Math.max(-1, Math.min(1, (t.clientX - s.x0) / 60));
          this.stick.y = Math.max(-1, Math.min(1, (t.clientY - s.y0) / 60));
        } else {
          this.look((t.clientX - s.x) * 0.006, (t.clientY - s.y) * 0.006);
        }
        s.x = t.clientX;
        s.y = t.clientY;
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (touches.get(t.identifier)?.move) this.stick.x = this.stick.y = 0;
        touches.delete(t.identifier);
      }
    };
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('touchcancel', end);
  }

  look(dx, dy) {
    this.yaw -= dx;
    this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch - dy));
  }

  update(dt, camera) {
    const k = this.keys;
    const has = (...codes) => codes.some((c) => k.has(c));
    let fwd = (has('KeyW', 'ArrowUp') ? 1 : 0) - (has('KeyS', 'ArrowDown') ? 1 : 0) - this.stick.y;
    let strafe = (has('KeyD') ? 1 : 0) - (has('KeyA') ? 1 : 0) + this.stick.x;
    const turn = (has('ArrowLeft', 'KeyQ') ? 1 : 0) - (has('ArrowRight', 'KeyE') ? 1 : 0);
    this.yaw += turn * 1.9 * dt;

    const len = Math.hypot(fwd, strafe);
    if (len > 1) { fwd /= len; strafe /= len; }
    const speed = this.speed * (has('ShiftLeft', 'ShiftRight') ? 2 : 1);
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const dx = (-sin * fwd + cos * strafe) * speed * dt;
    const dz = (-cos * fwd - sin * strafe) * speed * dt;

    const c = this.colliders;
    const step = 0.55, pad = 0.3, height = 1.7;
    const free = (x, z) => !c.blocked(x, z, this.feet, step, height, pad);
    const nx = Math.max(-this.bounds, Math.min(this.bounds, this.x + dx));
    const nz = Math.max(-this.bounds, Math.min(this.bounds, this.z + dz));
    if (free(nx, nz)) { this.x = nx; this.z = nz; }
    else if (free(nx, this.z)) this.x = nx;
    else if (free(this.x, nz)) this.z = nz;

    const ground = c.heightAt(this.x, this.z, this.feet + step);
    if (ground >= this.feet) { this.feet = ground; this.vy = 0; }
    else {
      this.vy -= 22 * dt;
      this.feet = Math.max(ground, this.feet + this.vy * dt);
      if (this.feet === ground) this.vy = 0;
    }

    const moving = Math.min(1, Math.hypot(dx, dz) / (dt * this.speed + 1e-6));
    this.bob += dt * speed * 2.2 * moving;
    const target = this.feet + this.eye + Math.sin(this.bob) * 0.05 * moving;
    this.eyeY += (target - this.eyeY) * Math.min(1, dt * 14);

    camera.position.set(this.x, this.eyeY, this.z);
    camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
