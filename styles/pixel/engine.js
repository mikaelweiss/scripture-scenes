import { buildObject, paintGround, castShadow, shadowBlob, rng, hash2, fbm, rgb, PixBuf } from './art.js';
import { buildPeople, buildWalker, buildChrist, KINDS } from './sprites.js';

const MOVE = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
const ACT = new Set(['KeyE', 'Space', 'Enter']);
const SPEED = 58;

const facingToward = (dx, dy) => (Math.abs(dx) > Math.abs(dy) * 1.3 ? (dx < 0 ? 2 : 3) : dy < 0 ? 1 : 0);

function makeLooks(pal, n, R) {
  const pick = (a) => a[Math.floor(R() * a.length)];
  return Array.from({ length: n }, () => {
    const covered = R() < (pal.covered ?? 0);
    return { skin: pick(pal.skins), hair: covered ? pick(pal.shawls) : pick(pal.hair), robe: pick(pal.robes), cloak: pick(pal.cloaks), belt: pick(pal.belts) };
  });
}

function poseIndex(kind, weights, r) {
  const poses = KINDS[kind].poses;
  const total = poses.reduce((s, p) => s + (weights[p] ?? 0), 0);
  let acc = 0;
  for (let i = 0; i < poses.length; i++) {
    acc += (weights[poses[i]] ?? 0) / total;
    if (r < acc) return i;
  }
  return 0;
}

function crowdSpots(c, world, solids, seed) {
  const R = rng(seed);
  const [cx, cy] = c.center, [sx, sy] = c.spacing;
  const a0 = (c.angles[0] * Math.PI) / 180, a1 = (c.angles[1] * Math.PI) / 180;
  const reach = c.reach ?? 700, spots = [];
  for (let row = 0, py = cy - reach; py < cy + reach; py += sy, row++)
    for (let px = cx - reach + ((row & 1) * sx) / 2; px < cx + reach; px += sx) {
      const x = px + (R() - 0.5) * 2 * c.jitter, y = py + (R() - 0.5) * 2 * c.jitter;
      if (x < 8 || y < 24 || x > world.w - 8 || y > world.h - 4) continue;
      const dx = x - cx, dy = (y - cy) / c.squash, r = Math.hypot(dx, dy);
      if (r < c.rMin) continue;
      let a = Math.atan2(dy, dx);
      if (a < a0) a += Math.PI * 2;
      if (a > a1) continue;
      if (c.aisle && Math.abs(x - c.aisle.x) < c.aisle.width / 2 && y > c.aisle.fromY) continue;
      if (c.clear?.some(([qx, qy, qr]) => Math.hypot(x - qx, y - qy) < qr)) continue;
      if (solids.some((s) => x > s[0] - 5 && x < s[0] + s[2] + 5 && y > s[1] - 3 && y < s[1] + s[3] + 5)) continue;
      spots.push({ x, y, score: r + (fbm(x * 0.02, y * 0.02, seed) - 0.5) * (c.ragged ?? 0) });
    }
  spots.sort((p, q) => p.score - q.score);
  if (spots.length < c.count) console.warn(`crowd: room for ${spots.length} of ${c.count}`);
  return spots.slice(0, c.count);
}

function createPeople(scene, solids, seed) {
  const R = rng(seed + 5);
  const c = scene.crowd, k = scene.children;
  const looks = { adult: makeLooks(c.palette, c.looks ?? 48, R), child: makeLooks(k?.palette ?? c.palette, k?.looks ?? 12, R) };
  const [fx, fy] = c.faceToward ?? [scene.christ.x, scene.christ.y];
  const list = crowdSpots(c, scene.world, solids, seed + 9).map((s) => ({
    x: s.x, y: s.y, kind: 0, look: Math.floor(R() * looks.adult.length), pose: poseIndex('adult', c.poses, R()), face: facingToward(fx - s.x, fy - s.y),
  }));
  for (let i = 0; i < (k?.count ?? 0); i++) {
    const a = (i / k.count) * Math.PI * 2 + (R() - 0.5) * 0.3, f = 0.75 + R() * 0.3;
    const x = k.center[0] + Math.cos(a) * k.rx * f, y = k.center[1] + Math.sin(a) * k.ry * f;
    list.push({ x, y, kind: 1, look: Math.floor(R() * looks.child.length), pose: poseIndex('child', k.poses, R()), face: facingToward(fx - x, fy - y) });
  }
  const n = list.length;
  const P = {
    n, looks,
    x: new Float32Array(n), y: new Float32Array(n), ox: new Float32Array(n), oy: new Float32Array(n),
    kind: new Uint8Array(n), look: new Uint16Array(n), pose: new Uint8Array(n), face: new Uint8Array(n),
    phase: new Float32Array(n), period: new Float32Array(n), turn: new Float32Array(n), turnFace: new Uint8Array(n),
  };
  list.forEach((p, i) => {
    P.x[i] = p.x; P.y[i] = p.y; P.kind[i] = p.kind; P.look[i] = p.look; P.pose[i] = p.pose; P.face[i] = p.face;
    P.phase[i] = R() * 10; P.period[i] = 1.6 + R() * 2.4;
  });
  return P;
}

function glowSprite(rx, ry, color, maxA, levels = 4, ring = 0) {
  const buf = new PixBuf(rx * 2 + 1, ry * 2 + 1), c = rgb(color);
  for (let y = -ry; y <= ry; y++)
    for (let x = -rx; x <= rx; x++) {
      const d = Math.hypot(x / rx, y / ry);
      if (d > 1) continue;
      let v = ring ? 1 - Math.abs(d - ring) / (1 - ring) : 1 - d;
      if (v <= 0) continue;
      v = Math.ceil(v * levels) / levels;
      buf.set(x + rx, y + ry, c, v * maxA);
    }
  return buf.toCanvas();
}

function cloudSprite(seed) {
  const S = 256, buf = new PixBuf(S, S), dark = [18, 20, 40];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const v = fbm(x / 64, y / 64, seed, 3, 4);
      if (v > 0.6) buf.set(x, y, dark, 0.2);
      else if (v > 0.54) buf.set(x, y, dark, 0.1);
    }
  return buf.toCanvas();
}

function bubbleSprite() {
  const rows = ['.ooooooooo.', 'owwwwwwwwwo', 'owwkwkwkwwo', 'owwwwwwwwwo', '.oooowoooo.', '....owo....', '.....o.....'];
  const col = { o: [40, 28, 30], w: [252, 248, 236], k: [40, 28, 30] };
  const buf = new PixBuf(11, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => col[ch] && buf.set(x, y, col[ch])));
  return buf.toCanvas();
}

export function start(scene) {
  const view = document.getElementById('view');
  const ctx = view.getContext('2d');
  const seed = scene.seed ?? 7;
  const WW = scene.world.w, WH = scene.world.h;

  const objects = scene.objects.map((o, i) => buildObject(o, seed * 131 + i * 17));
  const solids = objects.flatMap((o) => o.solids ?? []);
  const emitters = objects.flatMap((o) => o.emitters ?? []);

  const christ = { ...scene.christ, elev: 0, sortY: scene.christ.y };
  const stand = objects.find((o) => o.platform && christ.x >= o.platform.x && christ.x < o.platform.x + o.platform.w && christ.y >= o.platform.y && christ.y < o.platform.y + o.platform.d);
  if (stand) Object.assign(christ, { elev: stand.platform.h, sortY: stand.sortY + 0.5 });

  const P = createPeople(scene, solids, seed);
  const groundSpec = { ...scene.ground, areas: [...(scene.ground.areas ?? []), ...objects.flatMap((o) => o.groundAreas ?? [])] };
  const { buf: groundBuf, glows } = paintGround(scene.world, groundSpec, seed);
  for (const o of objects) {
    if (o.hm) castShadow(groundBuf, o.hm);
    if (o.blob) shadowBlob(groundBuf, ...o.blob, 0.35);
  }
  for (let i = 0; i < P.n; i++) shadowBlob(groundBuf, Math.round(P.x[i]), Math.round(P.y[i]), P.kind[i] ? 2 : 3, 1, 0.3);
  const ground = groundBuf.toCanvas();

  const atlas = buildPeople(P.looks);
  const walker = buildWalker(scene.player.look);
  const christSprite = buildChrist(scene.christ.look);
  const halo = glowSprite(30, 26, '#fff1c8', 0.34, 5);
  const pool = glowSprite(56, 26, '#ffe7b0', 0.22, 5);
  const kids = scene.children;
  const ring = kids ? glowSprite(Math.round(kids.rx * 1.3), Math.round(kids.ry * 1.45), '#ffe3a0', 0.4, 4, 0.82) : null;
  const ember = glowSprite(5, 3, '#ff8a3a', 0.6, 3);
  const clouds = ctx.createPattern(cloudSprite(seed + 3), 'repeat');
  const bubble = bubbleSprite();

  const player = { x: scene.player.x, y: scene.player.y, face: 1, step: 0, moving: false, idle: 0 };
  const cam = { x: player.x, y: player.y };
  const held = new Set();
  let pointer = null, target = null, near = null, t = 0;
  const smoke = [];
  const dialog = { open: false, text: '', shown: 0, el: document.getElementById('dialog') };
  let christLine = 0;
  let vw = 0, vh = 0, scale = 2;

  function resize() {
    const w = innerWidth, h = innerHeight;
    scale = Math.max(2, Math.round(Math.sqrt((w * h) / (640 * 360))));
    vw = Math.ceil(w / scale);
    vh = Math.ceil(h / scale);
    view.width = vw;
    view.height = vh;
    view.style.width = `${vw * scale}px`;
    view.style.height = `${vh * scale}px`;
    ctx.imageSmoothingEnabled = false;
  }
  addEventListener('resize', resize);
  resize();

  const touch = matchMedia('(pointer: coarse)').matches;
  document.getElementById('hint').textContent = touch
    ? 'Drag or tap to walk. Tap a person beside you to hear them.'
    : 'WASD / arrows to walk. Hold the mouse to walk toward it. E or Space to talk.';
  const talkBtn = document.getElementById('talk');
  talkBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); act(); });

  function camTarget() {
    const [fx, fy] = scene.camera.focus;
    const d = Math.hypot(fx - player.x, fy - player.y);
    const { hold = 150, release = 420, min = 0.2 } = scene.camera;
    const k = d < hold ? 1 : Math.max(min, 1 - ((d - hold) / (release - hold)) * (1 - min));
    return [player.x + (fx - player.x) * k, player.y + (fy - player.y) * k];
  }
  [cam.x, cam.y] = camTarget();

  const camOrigin = () => [
    vw >= WW ? Math.round((vw - WW) / -2) : Math.round(Math.min(Math.max(cam.x - vw / 2, 0), WW - vw)),
    vh >= WH ? Math.round((vh - WH) / -2) : Math.round(Math.min(Math.max(cam.y - vh / 2, 0), WH - vh)),
  ];

  function toWorld(e) {
    const r = view.getBoundingClientRect();
    const [cx, cy] = camOrigin();
    return [cx + ((e.clientX - r.left) / r.width) * vw, cy + ((e.clientY - r.top) / r.height) * vh];
  }

  function blocked(x, y) {
    if (x < 4 || x > WW - 4 || y < 14 || y > WH - 2) return true;
    for (const s of solids) if (x + 3 > s[0] && x - 3 < s[0] + s[2] && y + 1 > s[1] && y - 2 < s[1] + s[3]) return true;
    return false;
  }

  function nearest() {
    const cd = Math.hypot(christ.x - player.x, (christ.y - player.y) * 1.2);
    if (cd < 44) return { kind: 'christ', x: christ.x, y: christ.y - christ.elev, h: christSprite.rects[3] };
    let best = -1, bd = 14 * 14;
    for (let i = 0; i < P.n; i++) {
      const dx = P.x[i] - player.x, dy = P.y[i] - player.y;
      if (dx * dx > bd || dy * dy > bd) continue;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    if (best < 0) return null;
    return { kind: P.kind[best] ? 'child' : 'crowd', i: best, x: P.x[best] + P.ox[best], y: P.y[best] + P.oy[best], h: P.kind[best] ? 9 : 14 };
  }

  function openDialog(who, line) {
    dialog.open = true;
    dialog.text = line.text;
    dialog.shown = 0;
    dialog.el.querySelector('.who').textContent = who;
    dialog.el.querySelector('.ref').textContent = line.ref ?? '';
    dialog.el.querySelector('.text').textContent = '';
    dialog.el.style.display = 'block';
  }

  function act() {
    if (dialog.open) {
      if (dialog.shown < dialog.text.length) dialog.shown = dialog.text.length;
      else { dialog.open = false; dialog.el.style.display = 'none'; }
      return;
    }
    if (!near) return;
    const talk = scene.talk;
    if (near.kind === 'christ') {
      openDialog(talk.christ.name, talk.christ.lines[christLine++ % talk.christ.lines.length]);
      return;
    }
    const i = near.i, group = near.kind === 'child' ? talk.children : talk.crowd;
    P.turn[i] = 6;
    P.turnFace[i] = facingToward(player.x - P.x[i], player.y - P.y[i]);
    openDialog(group.name, group.lines[Math.floor(hash2(i, Math.floor(t / 8), seed) * group.lines.length)]);
  }

  addEventListener('keydown', (e) => {
    if (MOVE[e.code]) { held.add(e.code); target = null; e.preventDefault(); }
    else if (ACT.has(e.code)) { if (!e.repeat) act(); e.preventDefault(); }
    else if (e.code === 'Escape' && dialog.open) { dialog.shown = dialog.text.length; act(); }
  });
  addEventListener('keyup', (e) => held.delete(e.code));
  addEventListener('blur', () => held.clear());

  view.addEventListener('pointerdown', (e) => {
    if (dialog.open) { act(); return; }
    const [wx, wy] = toWorld(e);
    if (near && Math.hypot(wx - near.x, wy - (near.y - near.h / 2)) < 14) { act(); return; }
    view.setPointerCapture(e.pointerId);
    pointer = { id: e.pointerId, type: e.pointerType, cx: e.clientX, cy: e.clientY, x0: e.clientX, y0: e.clientY, moved: false };
    target = null;
  });
  view.addEventListener('pointermove', (e) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    pointer.cx = e.clientX;
    pointer.cy = e.clientY;
    if (Math.hypot(e.clientX - pointer.x0, e.clientY - pointer.y0) > 10) pointer.moved = true;
  });
  const release = (e) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    if (pointer.type !== 'mouse' && !pointer.moved) target = toWorld(e);
    pointer = null;
  };
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', release);

  function update(dt) {
    t += dt;
    if (dialog.open) {
      dialog.shown = Math.min(dialog.text.length, dialog.shown + dt * 55);
      dialog.el.querySelector('.text').textContent = dialog.text.slice(0, Math.floor(dialog.shown));
    }
    let mx = 0, my = 0;
    if (!dialog.open) {
      for (const k of held) { mx += MOVE[k][0]; my += MOVE[k][1]; }
      let goal = null;
      if (pointer) goal = toWorld({ clientX: pointer.cx, clientY: pointer.cy });
      else if (target) goal = target;
      if (!mx && !my && goal) {
        const dx = goal[0] - player.x, dy = goal[1] - player.y;
        if (Math.hypot(dx, dy) > 3) { mx = dx; my = dy; } else target = null;
      }
    }
    const len = Math.hypot(mx, my);
    player.moving = len > 0;
    if (player.moving) {
      const vx = (mx / len) * SPEED * dt, vy = (my / len) * SPEED * dt;
      const sx = player.x, sy = player.y;
      if (!blocked(player.x + vx, player.y)) player.x += vx;
      if (!blocked(player.x, player.y + vy)) player.y += vy;
      if (target && player.x === sx && player.y === sy) target = null;
      player.face = facingToward(mx, my);
      player.step += dt * 7;
      player.idle = 0;
    } else {
      player.step = 0;
      player.idle += dt;
    }
    const [tx, ty] = camTarget();
    const k = 1 - Math.exp(-dt * 5);
    cam.x += (tx - cam.x) * k;
    cam.y += (ty - cam.y) * k;

    for (const em of emitters) {
      em.acc = (em.acc ?? 0) + dt;
      while (em.acc > em.rate) {
        em.acc -= em.rate;
        smoke.push({ x: em.x + (Math.random() - 0.5) * 6, y: em.y, vx: 3 + Math.random() * 3, vy: -9 - Math.random() * 5, life: 0, max: 3 + Math.random() * 2 });
      }
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.life > s.max) smoke.splice(i, 1);
    }
    for (let i = 0; i < P.n; i++) if (P.turn[i] > 0) P.turn[i] -= dt;
    near = dialog.open ? near : nearest();
    talkBtn.style.display = touch && near && !dialog.open ? 'block' : 'none';
  }

  const keys = new Float64Array(P.n + objects.length + 4);
  const PLAYER = P.n + objects.length, CHRIST = PLAYER + 1;

  function render(dt) {
    const [cx, cy] = camOrigin();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#120d10';
    ctx.fillRect(0, 0, vw, vh);
    ctx.drawImage(ground, -cx, -cy);

    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < glows.length; i++) {
      const [gx, gy] = glows[i];
      if (gx < cx - 8 || gx > cx + vw + 8 || gy < cy - 8 || gy > cy + vh + 8) continue;
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.1 + i * 1.7) * Math.sin(t * 0.7 + i));
      ctx.drawImage(ember, gx - 5 - cx, gy - 3 - cy);
    }
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 1.3);
    ctx.drawImage(pool, christ.x - 56 - cx, christ.y + 6 - cy);
    if (ring) {
      ctx.globalAlpha = 0.8 + 0.2 * Math.sin(t * 2);
      ctx.drawImage(ring, kids.center[0] - ring.width / 2 - cx, kids.center[1] - ring.height / 2 - cy);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    let n = 0;
    const push = (sortY, id) => { keys[n++] = Math.floor(sortY * 4) * 16384 + id; };
    const near2 = 15 * 15;
    for (let i = 0; i < P.n; i++) {
      const x = P.x[i], y = P.y[i];
      if (x < cx - 10 || x > cx + vw + 10 || y < cy - 2 || y > cy + vh + 16) continue;
      const dx = x - player.x, dy = y - player.y, d2 = dx * dx + dy * dy;
      let tx = 0, ty = 0;
      if (d2 < near2 && d2 > 0.01) {
        const d = Math.sqrt(d2), f = (15 - d) * 0.75;
        tx = (dx / d) * f;
        ty = (dy / d) * f * 0.6;
      }
      const k = 1 - Math.exp(-dt * 8);
      P.ox[i] += (tx - P.ox[i]) * k;
      P.oy[i] += (ty - P.oy[i]) * k;
      push(y + P.oy[i], i);
    }
    objects.forEach((o, j) => {
      const c = o.canvas;
      if (o.dx > cx + vw || o.dy > cy + vh || o.dx + c.width < cx || o.dy + c.height < cy) return;
      push(o.sortY, P.n + j);
    });
    push(player.y, PLAYER);
    push(christ.sortY, CHRIST);
    const list = keys.subarray(0, n).sort();

    const R = atlas.rects;
    for (let q = 0; q < n; q++) {
      const id = list[q] % 16384;
      if (id < P.n) {
        const kind = P.kind[id];
        const tt = (t + P.phase[id]) % P.period[id];
        let face = P.face[id];
        if (P.turn[id] > 0) face = P.turnFace[id];
        else if (hash2(id, Math.floor((t + P.phase[id] * 3) / 5), seed) < 0.07) face = 2 + (id & 1);
        const s = atlas.id(kind ? 'child' : 'adult', P.look[id], P.pose[id], face, tt < 0.35 ? 1 : 0) * 4;
        const w = R[s + 2], h = R[s + 3];
        ctx.drawImage(atlas.canvas, R[s], R[s + 1], w, h, Math.round(P.x[id] + P.ox[id] - w / 2) - cx, Math.round(P.y[id] + P.oy[id]) - h + 1 - cy, w, h);
      } else if (id === PLAYER) {
        const px = Math.round(player.x) - cx, py = Math.round(player.y) - cy;
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#181222';
        ctx.fillRect(px - 3, py, 7, 1);
        ctx.fillRect(px - 2, py + 1, 5, 1);
        ctx.globalAlpha = 1;
        const frame = player.moving ? [1, 0, 2, 0][Math.floor(player.step) % 4] : 0;
        const s = (player.face * 3 + frame) * 4, wr = walker.rects;
        ctx.drawImage(walker.canvas, wr[s], wr[s + 1], wr[s + 2], wr[s + 3], px - 4, py - wr[s + 3] + 1 - (frame ? 1 : 0), wr[s + 2], wr[s + 3]);
      } else if (id === CHRIST) {
        const c = christSprite.canvas, r = christSprite.rects;
        ctx.drawImage(c, r[0], r[1], r[2], r[3], Math.round(christ.x - r[2] / 2) - cx, Math.round(christ.y - christ.elev) - r[3] + 1 - cy, r[2], r[3]);
      } else {
        const o = objects[id - P.n];
        ctx.drawImage(o.canvas, o.dx - cx, o.dy - cy);
      }
    }

    for (const s of smoke) {
      const f = s.life / s.max;
      ctx.globalAlpha = (1 - f) * 0.5;
      ctx.fillStyle = f < 0.15 ? '#8a7a6a' : '#6d6863';
      const sz = f < 0.3 ? 2 : 3;
      ctx.fillRect(Math.round(s.x) - cx, Math.round(s.y) - cy, sz, sz);
    }
    ctx.globalAlpha = 1;

    lighting(cx, cy);

    const show = t < 6 || player.idle > 2;
    if (show && !dialog.open) {
      const bob = Math.round(Math.sin(t * 5)) - 1;
      const mxp = Math.round(player.x) - cx, myp = Math.round(player.y) - cy - 20 + bob;
      ctx.fillStyle = '#ffd86b';
      ctx.fillRect(mxp - 2, myp, 5, 1);
      ctx.fillRect(mxp - 1, myp + 1, 3, 1);
      ctx.fillRect(mxp, myp + 2, 1, 1);
    }
    if (near && !dialog.open) {
      const bob = Math.round(Math.sin(t * 4));
      ctx.drawImage(bubble, Math.round(near.x) - 5 - cx, Math.round(near.y) - near.h - 9 + bob - cy);
    }
  }

  function lighting(cx, cy) {
    const L = scene.light ?? {};
    ctx.save();
    ctx.translate(-cx, -cy);
    ctx.fillStyle = clouds;
    const drift = t * 6;
    ctx.translate(drift, drift * 0.4);
    ctx.fillRect(cx - drift, cy - drift * 0.4, vw, vh);
    ctx.restore();

    ctx.save();
    ctx.translate(-cx, -cy);
    ctx.globalCompositeOperation = 'lighter';
    for (const [i, rx] of (L.rays ?? []).entries()) {
      const slope = 0.45, w = 26 + (i % 3) * 12;
      const a = 0.05 + 0.025 * Math.sin(t * 0.35 + i * 2.1);
      for (const [inset, alpha] of [[0, a], [w * 0.25, a]]) {
        ctx.fillStyle = `rgba(255,226,170,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(rx + inset, 0);
        ctx.lineTo(rx + w - inset, 0);
        ctx.lineTo(rx + w - inset + slope * WH, WH);
        ctx.lineTo(rx + inset + slope * WH, WH);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createLinearGradient(0, 0, vw, vh);
    g.addColorStop(0, L.warm ?? '#fff0d8');
    g.addColorStop(1, L.cool ?? '#b8a8c0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.35, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    v.addColorStop(0, 'rgba(14,8,24,0)');
    v.addColorStop(1, `rgba(14,8,24,${L.vignette ?? 0.45})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, vw, vh);

    const intro = L.intro ?? 2;
    if (t < intro) {
      const k = t / intro;
      ctx.fillStyle = `rgba(6,4,10,${1 - k * k * (3 - 2 * k)})`;
      ctx.fillRect(0, 0, vw, vh);
    }

    ctx.globalCompositeOperation = 'lighter';
    const bx = Math.round(christ.x) - cx, head = Math.round(christ.y - christ.elev) - christSprite.rects[3] - cy;
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.3);
    for (const [w, a] of [[52, 0.05], [36, 0.06], [22, 0.07], [12, 0.08], [6, 0.1]]) {
      ctx.fillStyle = `rgba(255,240,205,${a * pulse})`;
      ctx.fillRect(bx - (w >> 1), 0, w, head + 6);
    }
    ctx.fillStyle = 'rgba(255,248,225,0.9)';
    for (let i = 0; i < 36; i++) {
      const span = head + 6;
      const y = ((t * (14 + (i % 5) * 4) + i * 37.3) % span + span) % span;
      const x = bx + Math.round(Math.sin(i * 12.9898) * 20 * (0.3 + 0.7 * ((i * 7) % 10) / 10));
      ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 3 + i));
      ctx.fillRect(x, Math.round(y), 1, 1);
    }
    ctx.globalAlpha = pulse;
    ctx.drawImage(halo, bx - 30, head - 14);
    if (kids) {
      ctx.fillStyle = 'rgba(255,236,180,1)';
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2 + t * 0.35;
        const x = kids.center[0] + Math.cos(a) * kids.rx * 1.2 - cx;
        const y = kids.center[1] + Math.sin(a) * kids.ry * 1.3 - cy - 4 - ((t * 9 + i * 5) % 14);
        ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(t * 2.4 + i * 1.3));
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
