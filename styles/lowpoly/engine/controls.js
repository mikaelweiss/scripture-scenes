// First-person walker: WASD/arrows, pointer-lock or drag mouse look, two-zone touch.
export function createWalker(camera, dom, { start, yaw = 0, pitch = 0, eye = 1.65, speed = 4.5, ground }) {
  const state = { x: start[0], z: start[1], feet: ground(start[0], start[1], 100) ?? 0, yaw, pitch, vy: 0 };
  const keys = new Set();
  const touchMove = { x: 0, y: 0 };
  let dragging = false;

  const look = (dx, dy, k = 0.0022) => {
    state.yaw -= dx * k;
    state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch - dy * k));
  };

  addEventListener('keydown', (e) => keys.add(e.code));
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  dom.addEventListener('mousedown', () => {
    dragging = true;
    if (document.pointerLockElement !== dom && dom.requestPointerLock) {
      try {
        dom.requestPointerLock()?.catch?.(() => {});
      } catch {}
    }
  });
  addEventListener('mouseup', () => (dragging = false));
  addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === dom || dragging) look(e.movementX, e.movementY);
  });

  const touches = new Map();
  dom.addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY, move: t.clientX < innerWidth / 2 });
    e.preventDefault();
  }, { passive: false });
  dom.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      const s = touches.get(t.identifier);
      if (!s) continue;
      if (s.move) {
        touchMove.x = Math.max(-1, Math.min(1, (t.clientX - s.sx) / 60));
        touchMove.y = Math.max(-1, Math.min(1, (t.clientY - s.sy) / 60));
      } else look(t.clientX - s.x, t.clientY - s.y, 0.005);
      s.x = t.clientX;
      s.y = t.clientY;
    }
    e.preventDefault();
  }, { passive: false });
  const endTouch = (e) => {
    for (const t of e.changedTouches) {
      if (touches.get(t.identifier)?.move) touchMove.x = touchMove.y = 0;
      touches.delete(t.identifier);
    }
  };
  dom.addEventListener('touchend', endTouch);
  dom.addEventListener('touchcancel', endTouch);

  const held = (...codes) => codes.some((c) => keys.has(c));

  function update(dt) {
    let f = 0, s = 0;
    if (held('KeyW', 'ArrowUp')) f += 1;
    if (held('KeyS', 'ArrowDown')) f -= 1;
    if (held('KeyD')) s += 1;
    if (held('KeyA')) s -= 1;
    if (held('ArrowLeft')) state.yaw += 1.8 * dt;
    if (held('ArrowRight')) state.yaw -= 1.8 * dt;
    f -= touchMove.y;
    s += touchMove.x;
    const len = Math.hypot(f, s);
    if (len > 1) (f /= len), (s /= len);
    const v = speed * (held('ShiftLeft', 'ShiftRight') ? 2.2 : 1) * dt;
    const sin = Math.sin(state.yaw), cos = Math.cos(state.yaw);
    const dx = (-sin * f + cos * s) * v, dz = (-cos * f - sin * s) * v;
    for (const [mx, mz] of [[dx, dz], [dx, 0], [0, dz]]) {
      if (!mx && !mz) continue;
      const g = ground(state.x + mx, state.z + mz, state.feet);
      if (g === null) continue;
      state.x += mx;
      state.z += mz;
      break;
    }
    const g = ground(state.x, state.z, state.feet) ?? state.feet;
    if (g > state.feet) {
      state.feet += Math.min(g - state.feet, dt * 6 + (g - state.feet) * 0.3);
      state.vy = 0;
    } else {
      state.vy -= 20 * dt;
      state.feet = Math.max(g, state.feet + state.vy * dt);
      if (state.feet === g) state.vy = 0;
    }
    camera.position.set(state.x, state.feet + eye, state.z);
    camera.rotation.set(state.pitch, state.yaw, 0, 'YXZ');
  }
  update(0);
  return { update, state };
}
