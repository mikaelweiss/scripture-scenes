// Third-person walk: keyboard, mouse drag to look, touch (left half moves, right half looks).
const KEYS = {
  KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', KeyD: 'right', ArrowLeft: 'turnL', ArrowRight: 'turnR',
  ShiftLeft: 'run', ShiftRight: 'run',
};

export class Walker {
  constructor(camera, dom, { start, yaw = 0, world, speed = 4.5 }) {
    this.camera = camera;
    this.world = world;
    this.speed = speed;
    this.x = start[0];
    this.z = start[1];
    this.y = world.heightAt(this.x, this.z);
    this.yaw = yaw;
    this.facing = yaw + Math.PI;
    this.pitch = 0.3;
    this.dist = 7.5;
    this.moving = false;
    this.held = new Set();
    this.stick = null;
    this.pointers = new Map();

    addEventListener('keydown', (e) => { if (KEYS[e.code]) { this.held.add(KEYS[e.code]); e.preventDefault(); } });
    addEventListener('keyup', (e) => this.held.delete(KEYS[e.code]));
    addEventListener('blur', () => this.held.clear());
    dom.addEventListener('wheel', (e) => { this.dist = Math.min(16, Math.max(3, this.dist * (1 + Math.sign(e.deltaY) * 0.1))); e.preventDefault(); }, { passive: false });
    dom.addEventListener('pointerdown', (e) => {
      dom.setPointerCapture(e.pointerId);
      const mode = e.pointerType === 'touch' && e.clientX < innerWidth / 2 ? 'move' : 'look';
      this.pointers.set(e.pointerId, { mode, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY });
      if (mode === 'move') this.stick = { dx: 0, dy: 0 };
    });
    dom.addEventListener('pointermove', (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      if (p.mode === 'look') {
        this.yaw -= (e.clientX - p.x) * 0.006;
        this.pitch = Math.min(1.1, Math.max(-0.15, this.pitch + (e.clientY - p.y) * 0.004));
      } else {
        this.stick = { dx: (e.clientX - p.x0) / 50, dy: (e.clientY - p.y0) / 50 };
      }
      p.x = e.clientX;
      p.y = e.clientY;
    });
    const end = (e) => {
      const p = this.pointers.get(e.pointerId);
      if (p?.mode === 'move') this.stick = null;
      this.pointers.delete(e.pointerId);
    };
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);
  }

  update(dt) {
    const h = this.held;
    if (h.has('turnL')) this.yaw += dt * 1.8;
    if (h.has('turnR')) this.yaw -= dt * 1.8;
    let f = (h.has('fwd') ? 1 : 0) - (h.has('back') ? 1 : 0);
    let s = (h.has('right') ? 1 : 0) - (h.has('left') ? 1 : 0);
    if (this.stick) {
      f -= Math.max(-1, Math.min(1, this.stick.dy));
      s += Math.max(-1, Math.min(1, this.stick.dx));
    }
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let mx = fx * f + Math.cos(this.yaw) * s, mz = fz * f - Math.sin(this.yaw) * s;
    const len = Math.hypot(mx, mz);
    this.moving = len > 0.05;
    if (this.moving) {
      const v = (this.speed * (h.has('run') ? 2.2 : 1) * dt * Math.min(1, len)) / len;
      mx *= v;
      mz *= v;
      this.facing = Math.atan2(mx, mz);
      if (this.world.canStand(this.x + mx, this.z + mz, this.y)) { this.x += mx; this.z += mz; }
      else if (this.world.canStand(this.x + mx, this.z, this.y)) this.x += mx;
      else if (this.world.canStand(this.x, this.z + mz, this.y)) this.z += mz;
    }
    const ground = this.world.heightAt(this.x, this.z);
    this.y += (ground - this.y) * Math.min(1, dt * 12);

    const c = Math.cos(this.pitch), headY = this.y + 1.5;
    this.camera.position.set(this.x - fx * this.dist * c, headY + this.dist * Math.sin(this.pitch) + 0.6, this.z - fz * this.dist * c);
    this.camera.lookAt(this.x + fx * 3, headY + 0.4, this.z + fz * 3);
  }
}
