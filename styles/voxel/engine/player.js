import * as THREE from 'three';

const STEP_UP = 0.55;
const HEAD = 1.8;
const RADIUS = 0.3;

// First-person walker: pointer-lock or drag to look, WASD/arrows to walk, touch halves for move and look.
export class Player {
  constructor(camera, dom, world, o) {
    this.camera = camera;
    this.world = world;
    this.eye = o.eye ?? 1.62;
    this.speed = o.speed ?? 4.5;
    this.limit = o.limit ?? world.half - 4;
    this.pos = new THREE.Vector3(o.x, 0, o.z);
    this.pos.y = this.groundUnder(o.x, o.z, 50);
    this.camY = this.pos.y + this.eye;
    this.vy = 0;
    this.yaw = o.yaw ?? 0;
    this.pitch = o.pitch ?? 0;
    this.keys = new Set();
    this.touchMove = null;
    this.touchLook = null;
    this.bindInput(dom);
  }

  bindInput(dom) {
    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    const look = (dx, dy, k) => {
      this.yaw -= dx * k;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy * k));
    };
    let dragging = false;
    dom.addEventListener('mousedown', () => {
      dragging = true;
      if (!document.pointerLockElement) dom.requestPointerLock?.()?.catch?.(() => {});
    });
    addEventListener('mouseup', () => { dragging = false; });
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === dom) look(e.movementX, e.movementY, 0.0022);
      else if (dragging) look(e.movementX, e.movementY, 0.004);
    });
    dom.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const slot = t.clientX < innerWidth / 2 ? 'touchMove' : 'touchLook';
        if (!this[slot]) this[slot] = { id: t.identifier, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY };
      }
    }, { passive: false });
    dom.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        for (const slot of ['touchMove', 'touchLook']) {
          const s = this[slot];
          if (!s || s.id !== t.identifier) continue;
          if (slot === 'touchLook') look(t.clientX - s.x, t.clientY - s.y, 0.005);
          s.x = t.clientX; s.y = t.clientY;
        }
      }
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches)
        for (const slot of ['touchMove', 'touchLook']) if (this[slot]?.id === t.identifier) this[slot] = null;
    };
    dom.addEventListener('touchend', end);
    dom.addEventListener('touchcancel', end);
  }

  // Highest walkable surface under (x, z) that is no more than a step above `feet`.
  groundUnder(x, z, feet) {
    const w = this.world;
    return w.surface(w.ix(x), w.iz(z), w.iy(feet + STEP_UP)) * w.vs;
  }

  // Round obstacles such as people: list of { x, z, r }.
  setObstacles(list) {
    this.obstacles = new Map();
    for (const o of list) {
      const key = `${Math.floor(o.x)},${Math.floor(o.z)}`;
      if (!this.obstacles.has(key)) this.obstacles.set(key, []);
      this.obstacles.get(key).push(o);
    }
  }

  hitsObstacle(x, z) {
    if (!this.obstacles) return false;
    for (let gz = Math.floor(z) - 1; gz <= Math.floor(z) + 1; gz++)
      for (let gx = Math.floor(x) - 1; gx <= Math.floor(x) + 1; gx++)
        for (const o of this.obstacles.get(`${gx},${gz}`) ?? [])
          if (Math.hypot(o.x - x, o.z - z) < o.r + RADIUS && Math.abs(o.y - this.pos.y) < 1.5) return true;
    return false;
  }

  blocked(x, z) {
    const w = this.world;
    if (Math.abs(x) > this.limit || Math.abs(z) > this.limit) return true;
    if (this.hitsObstacle(x, z) && !this.hitsObstacle(this.pos.x, this.pos.z)) return true;
    for (const [ox, oz] of [[0, 0], [RADIUS, 0], [-RADIUS, 0], [0, RADIUS], [0, -RADIUS]]) {
      const g = this.groundUnder(x + ox, z + oz, this.pos.y);
      const ix = w.ix(x + ox), iz = w.iz(z + oz);
      for (let y = w.iy(Math.max(g, this.pos.y) + 0.01); y <= w.iy(Math.max(g, this.pos.y) + HEAD); y++) if (w.get(ix, y, iz)) return true;
    }
    return false;
  }

  update(dt) {
    let f = 0, s = 0;
    const k = this.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
    if (k.has('KeyD')) s += 1;
    if (k.has('KeyA')) s -= 1;
    if (k.has('ArrowLeft')) this.yaw += dt * 1.8;
    if (k.has('ArrowRight')) this.yaw -= dt * 1.8;
    if (this.touchMove) {
      f -= THREE.MathUtils.clamp((this.touchMove.y - this.touchMove.y0) / 60, -1, 1);
      s += THREE.MathUtils.clamp((this.touchMove.x - this.touchMove.x0) / 60, -1, 1);
    }
    const len = Math.hypot(f, s);
    if (len > 1) { f /= len; s /= len; }
    const speed = this.speed * (k.has('ShiftLeft') || k.has('ShiftRight') ? 2.2 : 1);
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const dx = (-sin * f + cos * s) * speed * dt;
    const dz = (-cos * f - sin * s) * speed * dt;
    if (dx && !this.blocked(this.pos.x + dx, this.pos.z)) this.pos.x += dx;
    if (dz && !this.blocked(this.pos.x, this.pos.z + dz)) this.pos.z += dz;

    const g = this.groundUnder(this.pos.x, this.pos.z, this.pos.y);
    if (g >= this.pos.y) { this.pos.y = g; this.vy = 0; }
    else { this.vy -= 22 * dt; this.pos.y = Math.max(g, this.pos.y + this.vy * dt); }
    this.camY += (this.pos.y + this.eye - this.camY) * Math.min(1, dt * 12);
    this.camera.position.set(this.pos.x, this.camY, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
