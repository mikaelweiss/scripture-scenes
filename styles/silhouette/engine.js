import { TAU, rng, hash, fbm, Pen, person, christ, walker, structures } from './shapes.js';

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const fract = (x) => x - Math.floor(x);

const KEYS_RIGHT = ['ArrowRight', 'KeyD', 'ArrowUp', 'KeyW'];
const KEYS_LEFT = ['ArrowLeft', 'KeyA', 'ArrowDown', 'KeyS'];

function expandCrowd(c, layerIdx, focus, toWorld) {
  const R = rng(c.seed ?? layerIdx * 97 + 13);
  const from = toWorld(c.from), to = toWorld(c.to);
  const peak = c.focus === undefined ? null : toWorld(c.focus);
  const spread = c.spread === undefined ? null : toWorld(c.spread) - toWorld(0);
  const avoid = (c.avoid ?? []).map(([a, b]) => [toWorld(a), toWorld(b)]);
  const mixEntries = Object.entries(c.mix ?? { adult: 5, woman: 4, child: 2, kneel: 1 });
  const total = mixEntries.reduce((s, [, w]) => s + w, 0);
  const base = c.base ?? 0.25;
  const out = [];
  let guard = 0;
  while (out.length < c.count && guard++ < c.count * 80) {
    const x = from + R() * (to - from);
    if (peak !== null) {
      const d = base + Math.exp(-(((x - peak) / spread) ** 2));
      if (R() * (1 + base) > d) continue;
    }
    if (avoid.some(([a, b]) => x > a && x < b)) continue;
    let pick = R() * total, kind = mixEntries[0][0];
    for (const [k, w] of mixEntries) {
      if ((pick -= w) <= 0) { kind = k; break; }
    }
    const raise = R() < (c.raise ?? 0.05);
    out.push({
      x, kind,
      y: R() * (c.depth ?? 0) - (c.sink ?? 0),
      sc: (kind === 'child' ? 0.6 + R() * 0.2 : 0.88 + R() * 0.22) * (c.scale ?? 1),
      w: 0.85 + R() * 0.3,
      hood: R() < 0.4,
      staff: R() < 0.05,
      arms: raise ? 'raise' : R() < 0.05 ? 'reach' : null,
      carry: kind === 'adult' && R() < 0.05,
      babe: R() < 0.3,
      ph: R() * TAU,
      f: x < focus ? 1 : -1,
    });
  }
  return out;
}

function prepLayer(L, idx, focus) {
  const toWorld = (x) => (L.screenUnits ? x / L.p : x);
  const items = (L.items ?? []).map((it, i) => ({ ...it, x: toWorld(it.x), seed: it.seed ?? idx * 1000 + i + 1 }));
  let figs = (L.crowds ?? []).flatMap((c) => expandCrowd(c, idx, focus, toWorld));
  for (const it of items.filter((i) => i.type === 'children')) {
    const R = rng(it.seed);
    for (let j = 0; j < it.count; j++) {
      const a = ((j + 0.5) / it.count) * TAU;
      const cx = Math.cos(a) * it.r;
      figs.push({
        x: it.x + cx, kind: j % 3 === 0 ? 'kneel' : 'child', y: (it.y ?? 0) + (Math.sin(a) + 1) * it.r * 0.06,
        sc: j % 3 === 0 ? 0.55 : 0.85 + R() * 0.25, w: 1, arms: R() < 0.3, ph: R() * TAU, f: cx < 0 ? 1 : -1,
      });
    }
  }
  figs.sort((a, b) => a.x - b.x);
  return { ...L, items, figs, terrain: L.terrain ?? null };
}

export function run(canvas, scene, ui) {
  const ctx = canvas.getContext('2d');
  const P = new Pen(ctx);
  const focus = scene.focus;
  const sil = hex(scene.palette.silhouette);
  const hazeDark = hex(scene.palette.haze.dark), hazeClear = hex(scene.palette.haze.clear);
  const cloudDark = hex(scene.palette.cloud);
  const skyDark = scene.sky.dark.map(([o, c]) => [o, hex(c)]);
  const skyClear = scene.sky.clear.map(([o, c]) => [o, hex(c)]);
  const layers = scene.layers.map((L, i) => prepLayer(L, i, focus));
  const world = scene.world;
  const light = scene.light;
  const nFigs = layers.reduce((s, L) => s + L.figs.length, 0);
  if (ui.count) ui.count.textContent = `${nFigs.toLocaleString()} people`;

  let W = 0, H = 0, U = 1, dpr = 1;
  const CLOUD_RES = 3;
  const cloudCv = document.createElement('canvas');
  const cloudCtx = cloudCv.getContext('2d');
  const softCv = document.createElement('canvas');
  const softCtx = softCv.getContext('2d');
  let px = world.start, vx = 0, facing = 1, phase = 0;
  let cam = px + (world.lead ?? 200);
  let haze = hazeDark, sky = skyDark, intensity = 1;
  const keys = new Set();
  let drag = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    U = Math.min(H / 720, W / 600);
    cloudCv.width = Math.ceil(W / CLOUD_RES);
    cloudCv.height = Math.ceil(H / CLOUD_RES);
    softCv.width = cloudCv.width;
    softCv.height = cloudCv.height;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code.startsWith('Arrow')) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x0: e.clientX, x: e.clientX, id: e.pointerId };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag && e.pointerId === drag.id) drag.x = e.clientX;
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function inputDir() {
    let d = 0;
    if (KEYS_RIGHT.some((k) => keys.has(k))) d += 1;
    if (KEYS_LEFT.some((k) => keys.has(k))) d -= 1;
    if (drag) {
      const dx = drag.x - drag.x0;
      if (Math.abs(dx) > 12) d = clamp(dx / 80, -1, 1);
      else if (Math.abs(drag.x0 - W / 2) > W * 0.12) d = Math.sign(drag.x0 - W / 2);
    }
    return d;
  }

  const groundH = (L, x) => (L.terrain ? L.terrain.amp * fbm(x * L.p * L.terrain.freq + 50, L.terrain.seed ?? 3, L.terrain.oct ?? 3, L.terrain.ridge) : 0);
  // Vertical layout: the bottom of the screen holds a 720-unit stage, the sky stretches above it.
  const HORIZON = 0.62;
  const vy = (f) => (f <= HORIZON ? (f / HORIZON) * (H - (1 - HORIZON) * 720 * U) : H - (1 - f) * 720 * U);
  const screenX = (L, x) => W / 2 + (x - cam) * L.p * U;

  // Places local item space: origin on the layer's ground at world x, raised by elev units.
  function place(L, x, elev, sc = 1, flip = 1, rot = 0, skew = 0) {
    const k = L.s * U;
    const sx = screenX(L, x);
    const sy = vy(L.ground) - (groundH(L, x) + elev) * k;
    const kx = k * sc * flip, ky = k * sc;
    const c = Math.cos(rot), s = Math.sin(rot);
    ctx.setTransform(c * kx * dpr, s * kx * dpr, (c * kx * skew - s * ky) * dpr, (s * kx * skew + c * ky) * dpr, sx * dpr, sy * dpr);
    P.f = flip;
    return { sx, sy, k: k * sc };
  }

  function visible(L, x, half) {
    return Math.abs(screenX(L, x) - W / 2) < W / 2 + half * L.s * U;
  }

  function skyColorAt(y) {
    for (let i = 1; i < sky.length; i++) {
      if (y <= sky[i][0]) return mix(sky[i - 1][1], sky[i][1], (y - sky[i - 1][0]) / (sky[i][0] - sky[i - 1][0]));
    }
    return sky.at(-1)[1];
  }

  function lightPos() {
    return { lx: W / 2 + (light.x - cam) * light.p * U, ly: vy(light.y) };
  }

  function drawSky(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (const [o, c] of sky) g.addColorStop(o === 0 ? 0 : clamp(vy(o) / H), css(c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const { lx, ly } = lightPos();
    ctx.globalCompositeOperation = 'lighter';
    const r = 650 * U;
    const sg = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
    sg.addColorStop(0, `rgba(255,246,220,${0.95 * intensity})`);
    sg.addColorStop(0.08, `rgba(255,226,170,${0.6 * intensity})`);
    sg.addColorStop(0.35, `rgba(255,170,110,${0.2 * intensity})`);
    sg.addColorStop(1, 'rgba(255,150,100,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    cloudCtx.setTransform(1, 0, 0, 1, 0, 0);
    cloudCtx.clearRect(0, 0, cloudCv.width, cloudCv.height);
    for (const band of scene.clouds) drawClouds(band, t, lx, ly);
    softCtx.setTransform(1, 0, 0, 1, 0, 0);
    softCtx.clearRect(0, 0, softCv.width, softCv.height);
    softCtx.filter = 'blur(1px)';
    softCtx.drawImage(cloudCv, 0, 0);
    softCtx.filter = 'none';
    ctx.imageSmoothingQuality = 'low';
    ctx.drawImage(softCv, 0, 0, W, H);
  }

  function drawClouds(band, t, lx, ly) {
    const c = cloudCtx, sc = 1 / CLOUD_RES;
    const spacing = band.step * U;
    const offset = cam * band.p * U + t * band.drift * U;
    const path = new Path2D();
    const i0 = Math.floor((offset - band.r * 4 * U) / spacing), i1 = Math.ceil((offset + W + band.r * 4 * U) / spacing);
    for (let i = i0; i <= i1; i++) {
      const cx = i * spacing - offset + hash(i, band.seed) * spacing * 0.8;
      const cy = vy(band.y) + (hash(i, band.seed + 1) - 0.5) * band.h * U;
      let r = band.r * U * (0.5 + hash(i, band.seed + 2) * 1.0);
      const d = Math.abs(cx - lx) / ((band.gap ?? 300) * U);
      const near = Math.exp(-(((cy - ly) / (0.22 * H)) ** 2));
      r *= 1 - near * (1 - smooth(0.25, 1.1, d));
      if (r < 2) continue;
      path.moveTo(cx + r * 2.4, cy);
      path.ellipse(cx, cy, r * 2.4, r * 0.85, 0, 0, TAU);
    }
    const rim = c.createRadialGradient(lx, ly, 0, lx, ly, W * 0.7);
    rim.addColorStop(0, `rgba(255,236,190,${0.95 * intensity})`);
    rim.addColorStop(0.4, `rgba(255,190,130,${0.5 * intensity})`);
    rim.addColorStop(1, 'rgba(220,140,120,0.15)');
    c.setTransform(sc, 0, 0, sc, 0, band.rim * U * sc);
    c.fillStyle = rim;
    c.fill(path);
    c.setTransform(sc, 0, 0, sc, 0, 0);
    c.fillStyle = css(mix(cloudDark, skyColorAt(band.y), band.lit));
    c.fill(path);
  }

  function drawBirds(t) {
    for (const fl of scene.birds ?? []) {
      const span = W + 400 * U;
      const cx = ((((fl.x * U + t * fl.speed * U - cam * fl.p * U) % span) + span) % span) - 200 * U;
      ctx.beginPath();
      for (let i = 0; i < fl.count; i++) {
        const bx = cx + (hash(i, fl.seed) - 0.5) * 160 * U;
        const by = vy(fl.y) + (hash(i, fl.seed + 1) - 0.5) * 60 * U + Math.sin(t * 0.7 + i) * 4 * U;
        const s = fl.size * U * (0.7 + hash(i, fl.seed + 2) * 0.6);
        const w = Math.sin(t * 9 + i * 1.7) * 0.6;
        ctx.setTransform(dpr * s, 0, 0, dpr * s, bx * dpr, by * dpr);
        P.f = 1;
        P.poly([0, 0, -6, -2 - w * 5, -12, w * 4 - 1, -6, -1 - w * 3]);
        P.poly([0, 0, 6, -1 - w * 3, 12, w * 4 - 1, 6, -2 - w * 5]);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = css(mix(sil, haze, 0.55));
      ctx.fill();
    }
  }

  function drawGround(L) {
    const k = L.s * U, gy = vy(L.ground);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.moveTo(-10, H + 10);
    for (let sx = -10; sx <= W + 18; sx += 8) {
      const wx = cam + (sx - W / 2) / (L.p * U);
      ctx.lineTo(sx, gy - groundH(L, wx) * k);
    }
    ctx.lineTo(W + 18, H + 10);
    ctx.closePath();
  }

  const effects = {
    smolder: {
      post(it, L, t) {
        const w = it.w ?? 120, h = it.h ?? 40, plume = it.plume ?? 260;
        const flick = 0.75 + 0.25 * Math.sin(t * 7 + it.seed) * Math.sin(t * 3.1 + it.seed * 2);
        ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createRadialGradient(0, -h * 0.3, 0, 0, -h * 0.3, w * 0.9);
        gr.addColorStop(0, `rgba(255,140,50,${0.5 * flick * (it.glow ?? 1)})`);
        gr.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(0, -h * 0.3, w * 0.9, 0, TAU);
        ctx.fill();
        for (let j = 0; j < (it.embers ?? 10); j++) {
          const ph = fract(t * 0.3 + hash(j, it.seed));
          const x = (hash(j, it.seed + 1) - 0.5) * w * 0.6 + Math.sin(ph * 6 + j) * 12;
          const y = -h * 0.5 - ph * plume * 0.6;
          ctx.fillStyle = `rgba(255,${150 + 60 * (1 - ph)},80,${(1 - ph) * 0.9})`;
          ctx.fillRect(x, y, 2.6, 2.6);
        }
        ctx.globalCompositeOperation = 'source-over';
        const smoke = mix(cloudDark, haze, 0.2 + L.haze * 0.35);
        const n = it.puffs ?? 16;
        for (let j = 0; j < n; j++) {
          const ph = fract(t * 0.05 * (it.speed ?? 1) + j / n);
          const x = Math.sin(ph * 4 + j) * plume * 0.05 + ph * plume * (it.wind ?? 0.35);
          const y = -h * 0.6 - ph * plume;
          const r = w * 0.25 + ph * plume * 0.3;
          const sg = ctx.createRadialGradient(x, y, 0, x, y, r);
          sg.addColorStop(0, css(smoke, Math.sin(ph * Math.PI) * 0.32 * (it.density ?? 1)));
          sg.addColorStop(1, css(smoke, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      },
    },
    fissure: {
      post(it, L, t) {
        const R = rng(it.seed);
        const len = it.len ?? 300, depth = it.depth ?? 30;
        const flick = 0.65 + 0.35 * Math.sin(t * 1.7 + it.seed);
        const path = new Path2D();
        let x = -len / 2, y = depth;
        path.moveTo(x, y);
        const forks = [];
        while (x < len / 2) {
          x += 10 + R() * 18;
          y = clamp(y + (R() - 0.5) * 14, depth - 14, depth + 14);
          path.lineTo(x, y);
          if (R() < 0.18) forks.push([x, y]);
        }
        for (const [fx, fy] of forks) {
          path.moveTo(fx, fy);
          path.lineTo(fx + (R() - 0.5) * 50, fy + 12 + R() * 22);
        }
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineJoin = 'round';
        for (const [lw, c] of [[12, `rgba(255,90,30,${0.1 * flick})`], [5, `rgba(255,120,40,${0.35 * flick})`], [1.6, `rgba(255,200,120,${0.85 * flick})`]]) {
          ctx.lineWidth = lw;
          ctx.strokeStyle = c;
          ctx.stroke(path);
        }
        ctx.globalCompositeOperation = 'source-over';
      },
    },
    christ: {
      pre(it, L, t, at) {
        ctx.globalCompositeOperation = 'lighter';
        const top = -at.sy / at.k - 20;
        const pw = it.pillar ?? 70;
        const pg = ctx.createLinearGradient(-pw, 0, pw, 0);
        const a = 0.11 + 0.03 * Math.sin(t * 0.9);
        pg.addColorStop(0, 'rgba(255,240,210,0)');
        pg.addColorStop(0.5, `rgba(255,246,225,${a})`);
        pg.addColorStop(1, 'rgba(255,240,210,0)');
        ctx.fillStyle = pg;
        ctx.fillRect(-pw, top, pw * 2, -top);
        const gr = ctx.createRadialGradient(0, -90, 0, 0, -90, it.glow ?? 420);
        gr.addColorStop(0, 'rgba(255,248,230,0.42)');
        gr.addColorStop(0.15, 'rgba(255,232,190,0.24)');
        gr.addColorStop(0.5, 'rgba(255,205,150,0.08)');
        gr.addColorStop(1, 'rgba(255,190,140,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(-(it.glow ?? 420), -90 - (it.glow ?? 420), (it.glow ?? 420) * 2, (it.glow ?? 420) * 2);
        ctx.globalCompositeOperation = 'source-over';
      },
      post(it, L, t, at) {
        const fg = ctx.createLinearGradient(0, -175, 0, 0);
        fg.addColorStop(0, '#ffffff');
        fg.addColorStop(1, '#f6ecd8');
        ctx.fillStyle = fg;
        ctx.shadowColor = 'rgba(255,248,225,1)';
        for (const blur of [22, 3]) {
          ctx.shadowBlur = blur * at.k * dpr;
          ctx.beginPath();
          P.f = 1;
          christ(P);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'lighter';
        const hg = ctx.createRadialGradient(0, -160, 0, 0, -160, 60);
        hg.addColorStop(0, 'rgba(255,255,245,0.6)');
        hg.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.fillStyle = hg;
        ctx.fillRect(-60, -220, 120, 120);
        ctx.globalCompositeOperation = 'source-over';
      },
    },
    children: {
      pre(it, L, t) {
        const r = it.r, ry = r * 0.16, cy = -8;
        ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createRadialGradient(0, cy - 30, 0, 0, cy - 30, r * 1.4);
        gr.addColorStop(0, 'rgba(255,230,180,0.35)');
        gr.addColorStop(1, 'rgba(255,200,140,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(-r * 1.4, cy - 30 - r * 1.4, r * 2.8, r * 2.8);
        const pulse = 0.8 + 0.2 * Math.sin(t * 1.3);
        for (const [lw, a] of [[22, 0.1], [8, 0.28], [2.5, 0.8]]) {
          ctx.lineWidth = lw;
          ctx.strokeStyle = `rgba(255,232,180,${a * pulse})`;
          ctx.beginPath();
          ctx.ellipse(0, cy, r, ry, 0, 0, TAU);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      },
      post(it, L, t) {
        const r = it.r, ry = r * 0.16, cy = -8;
        ctx.globalCompositeOperation = 'lighter';
        for (let j = 0; j < 30; j++) {
          const a = t * 0.35 + (j / 30) * TAU;
          const lift = fract(t * 0.12 + hash(j, 5)) * 120;
          const x = Math.cos(a) * r, y = cy + Math.sin(a) * ry - lift;
          const al = Math.sin((lift / 120) * Math.PI) * 0.9;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
          g.addColorStop(0, `rgba(255,245,215,${al})`);
          g.addColorStop(1, 'rgba(255,220,160,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - 7, y - 7, 14, 14);
        }
        ctx.globalCompositeOperation = 'source-over';
      },
    },
  };

  function runEffects(L, stage, t) {
    for (const it of L.items) {
      const fx = effects[it.type]?.[stage];
      if (!fx || !visible(L, it.x, (it.w ?? 300) + (it.glow ?? 0))) continue;
      const at = place(L, it.x, it.y ?? 0);
      fx(it, L, t, at);
    }
  }

  function drawRays(t) {
    const { lx, ly } = lightPos();
    const len = H * 1.6;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    const rays = scene.rays;
    for (let pass = 0; pass < 2; pass++) {
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, len);
      const a = (pass ? 0.07 : 0.12) * intensity;
      g.addColorStop(0, `rgba(255,236,196,${a})`);
      g.addColorStop(0.5, `rgba(255,214,160,${a * 0.45})`);
      g.addColorStop(1, 'rgba(255,200,150,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      for (let i = pass; i < rays.count; i += 2) {
        const u = i / (rays.count - 1) - 0.5;
        const th = Math.PI / 2 + u * rays.spread + Math.sin(t * 0.13 + i * 1.9) * 0.025;
        const d = (0.01 + hash(i, 9) * 0.03) * (0.8 + 0.2 * Math.sin(t * 0.4 + i));
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.cos(th - d) * len, ly + Math.sin(th - d) * len);
        ctx.lineTo(lx + Math.cos(th + d) * len, ly + Math.sin(th + d) * len);
        ctx.closePath();
      }
      ctx.fill();
    }
    const glow = ctx.createRadialGradient(lx, ly + H * 0.35, 0, lx, ly + H * 0.35, H * 0.8);
    glow.addColorStop(0, `rgba(255,220,170,${0.18 * intensity})`);
    glow.addColorStop(1, 'rgba(255,200,150,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  // The walker gets a faint warm halo so it stays readable inside a crowd of the same color.
  function drawWalker(L) {
    ctx.beginPath();
    place(L, px, 0, 1, facing);
    walker(P, phase, clamp(Math.abs(vx) / world.speed));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.shadowColor = 'rgba(255,214,160,0.6)';
    ctx.shadowBlur = 9 * U * dpr;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawLayer(L, t) {
    const k = L.s * U, gy = vy(L.ground);
    runEffects(L, 'pre', t);
    ctx.beginPath();
    drawGround(L);
    for (const it of L.items) {
      const build = structures[it.type];
      if (!build || !visible(L, it.x, (it.w ?? 300) / 2 + (it.ramp ?? 0) + 120)) continue;
      place(L, it.x, it.y ?? 0, it.scale ?? 1, it.flip ?? 1, it.rot ?? 0);
      build(P, it, rng(it.seed));
    }
    const span = (W / 2 + 80 * k) / (L.p * U);
    for (const g of L.figs) {
      if (g.x < cam - span) continue;
      if (g.x > cam + span) break;
      place(L, g.x, g.y, g.sc, g.f, 0, Math.sin(t * 0.8 + g.ph) * 0.03);
      person(P, g);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = css(L.rgb);
    ctx.fill();
    if (L.player) drawWalker(L);
    if (L.mist) {
      const top = gy - (L.mistH ?? 90) * k;
      const mg = ctx.createLinearGradient(0, top, 0, gy + 20 * k);
      const mc = mix(haze, [255, 240, 220], 0.15);
      mg.addColorStop(0, css(mc, 0));
      mg.addColorStop(1, css(mc, L.mist));
      ctx.fillStyle = mg;
      ctx.fillRect(0, top, W, H - top);
    }
    runEffects(L, 'post', t);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const dust = Array.from({ length: scene.dust ?? 120 }, (_, i) => ({
    x: hash(i, 21), y: hash(i, 22), p: 0.25 + hash(i, 23) * 1.3, s: hash(i, 24), v: 3 + hash(i, 25) * 10,
  }));

  function drawDust(t) {
    const { lx } = lightPos();
    const fx = W / 2 + (focus - cam) * 0.9 * U;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    const span = W + 200;
    for (const d of dust) {
      const x = ((((d.x * span - cam * d.p * U + Math.sin(t * 0.2 + d.y * 9) * 30) % span) + span) % span) - 100;
      const y = ((((d.y * H - t * d.v * U) % H) + H) % H);
      const near = Math.exp(-(((x - lx) / (W * 0.35)) ** 2)) + Math.exp(-(((x - fx) / (W * 0.15)) ** 2));
      const r = (0.8 + d.p * 1.8 * d.s + (d.p > 1.3 ? 3 : 0)) * U;
      const a = (0.12 + near * 0.5) * (d.p > 1.3 ? 0.35 : 1) * (0.6 + 0.4 * Math.sin(t * 2 + d.x * 40));
      ctx.fillStyle = `rgba(255,232,190,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawVignette() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(8,4,10,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  let caption = null;
  function updateCaption() {
    const c = (scene.captions ?? []).find((c) => px >= c.from && px <= c.to) ?? null;
    if (c === caption) return;
    caption = c;
    ui.caption.classList.remove('show');
    if (c) {
      setTimeout(() => {
        if (caption !== c) return;
        ui.caption.innerHTML = `${c.text}<cite>${c.ref}</cite>`;
        ui.caption.classList.add('show');
      }, 600);
    }
  }

  function update(dt) {
    const run = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 1.9 : 1;
    const target = inputDir() * world.speed * run;
    vx += (target - vx) * Math.min(1, dt * 6);
    px = clamp(px + vx * dt, world.min, world.max);
    if (Math.abs(vx) > 5) facing = Math.sign(vx);
    phase += Math.abs(vx) * dt * 0.045;
    const camTarget = px + facing * Math.min(world.lead ?? 200, (W * 0.25) / U);
    cam += (camTarget - cam) * (dt === 0 ? 1 : Math.min(1, dt * 2));
    const prog = smooth(world.start, focus - 300, cam);
    sky = skyDark.map(([o, c], i) => [o, mix(c, skyClear[i][1], prog)]);
    haze = mix(hazeDark, hazeClear, prog);
    intensity = 0.75 + 0.25 * prog;
    for (const L of layers) L.rgb = mix(sil, haze, L.haze);
    updateCaption();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    update(dt);
    drawSky(t);
    drawBirds(t);
    for (const L of layers) {
      drawLayer(L, t);
      if (scene.rays.after === L.id) drawRays(t);
    }
    drawDust(t);
    drawVignette();
    requestAnimationFrame(frame);
  }
  update(0);
  requestAnimationFrame(frame);
}
