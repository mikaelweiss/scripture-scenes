import * as THREE from 'three';
import { createFigure } from '../../engine/crowd.js';

export function block(ctx, { x, z, y = 0, w, h, d, rot = 0, color, collide = true, jitter = 0.04, glow = false, tilt = [0, 0] }) {
  (glow ? ctx.glow : ctx.solid).box(w, h, d, { position: [x, y + h / 2, z], rotation: [tilt[0], rot, tilt[1]], color, jitter });
  if (collide) ctx.colliders.add({ x, z, w, d, rot, bottom: y, top: y + h });
}

// Axis-aligned room walls with doors and windows. openings: { side: 'n'|'s'|'e'|'w', at, w, h, sill }.
// band paints a stripe { y, h, color } around the walls, inside and out.
export function room(ctx, { x, z, y = 0, w, d, h, t = 0.6, color, openings = [], bands = [], roof, roofColor = '#5e4632', beams }) {
  const sides = {
    n: { len: w, place: (c, len, th) => [x + c, z - d / 2, len, th] },
    s: { len: w, place: (c, len, th) => [x + c, z + d / 2, len, th] },
    w: { len: d, place: (c, len, th) => [x - w / 2, z + c, th, len] },
    e: { len: d, place: (c, len, th) => [x + w / 2, z + c, th, len] },
  };
  for (const [name, side] of Object.entries(sides)) {
    const L = side.len + t;
    const piece = (a, b, y0, y1) => {
      if (b - a < 0.01 || y1 - y0 < 0.01) return;
      const [px, pz, pw, pd] = side.place((a + b) / 2, b - a, t);
      block(ctx, { x: px, z: pz, y: y + y0, w: pw, h: y1 - y0, d: pd, color });
      for (const band of bands) {
        const lo = Math.max(y0, band.y), hi = Math.min(y1, band.y + band.h);
        if (hi - lo < 0.01) continue;
        const [bx, bz, bw, bd] = side.place((a + b) / 2, b - a, t + 0.06);
        ctx.solid.box(bw, hi - lo, bd, { position: [bx, y + (lo + hi) / 2, bz], color: band.color, jitter: 0.03 });
      }
    };
    let cur = -L / 2;
    for (const g of openings.filter((o) => o.side === name).sort((a, b) => a.at - b.at)) {
      piece(cur, g.at - g.w / 2, 0, h);
      if (g.sill) piece(g.at - g.w / 2, g.at + g.w / 2, 0, g.sill);
      piece(g.at - g.w / 2, g.at + g.w / 2, g.h, h);
      cur = g.at + g.w / 2;
    }
    piece(cur, L / 2, 0, h);
  }
  if (roof) {
    ctx.solid.box(w + t + 1, 0.5, d + t + 1, { position: [x, y + h + 0.25, z], color: roofColor, jitter: 0.03 });
    for (let bz = -d / 2 + 2; beams && bz < d / 2; bz += beams) {
      ctx.solid.box(w, 0.4, 0.35, { position: [x, y + h - 0.2, z + bz], color: '#4a3424', jitter: 0.05 });
    }
  }
}

// Checker floor of flat tiles, lifted a hair above the ground.
export function floor(ctx, { x, z, y = 0, w, d, tile = 1.5, colors }) {
  const nx = Math.round(w / tile), nz = Math.round(d / tile);
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++)
      ctx.solid.box(tile - 0.04, 0.08, tile - 0.04, {
        position: [x - w / 2 + (i + 0.5) * tile, y + 0.03, z - d / 2 + (j + 0.5) * tile],
        color: colors[(i + j) % colors.length],
        jitter: 0.04,
      });
}

const flameColors = ['#ff5a14', '#ff9a2a', '#ffe08a'];

// Flickering low-poly flame with an optional warm point light.
export function fire(ctx, { x, y, z, size = 1, light = true, color = '#ff9a40', intensity = 10, distance = 16 }) {
  const group = new THREE.Group();
  const flames = flameColors.map((c, i) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.28 * size * (1 - i * 0.25), size * (1 - i * 0.22), 5), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    m.position.y = 0.5 * size * (1 - i * 0.22);
    group.add(m);
    return m;
  });
  group.position.set(x, y, z);
  ctx.scene.add(group);
  let pl;
  if (light) {
    pl = new THREE.PointLight(color, intensity, distance, 1.5);
    pl.position.set(x, y + size * 1.2, z);
    ctx.scene.add(pl);
  }
  const ph = x * 1.3 + z * 0.7;
  ctx.onFrame((t) => {
    const f = 0.88 + 0.12 * Math.sin(t * 13 + ph) * Math.sin(t * 7.3 + ph * 2);
    flames.forEach((m, i) => {
      m.scale.set(1, f * (1 + 0.12 * Math.sin(t * 9 + i * 2)), 1);
      m.rotation.y = t * (1 + i);
    });
    if (pl) pl.intensity = intensity * f;
  });
}

export function brazier(ctx, { x, z, y = 0, size = 1, stone = '#8a7660', light = true, intensity = 10, distance = 16 }) {
  block(ctx, { x, z, y, w: 0.5 * size, h: 0.9 * size, d: 0.5 * size, color: stone });
  ctx.solid.add(new THREE.CylinderGeometry(0.55 * size, 0.3 * size, 0.35 * size, 7), { position: [x, y + 1.05 * size, z], color: '#5b4a3a' });
  fire(ctx, { x, z, y: y + 1.15 * size, size: 0.8 * size, light, intensity, distance });
}

// A single hand-placed person. kneel lowers them so the robe reads as kneeling.
export function figure(ctx, { x, z, y, kneel = false, collide = true, ...rest }) {
  const base = (y ?? ctx.heightAt(x, z)) - (kneel ? 0.48 * (rest.scale ?? 1) : 0);
  const g = createFigure({ x, z, y: base, ...rest });
  ctx.scene.add(g);
  if (collide) ctx.colliders.add({ x, z, w: 0.7, d: 0.7, bottom: base, top: base + 1.8 });
  return { group: g, y: base };
}

export function pole(ctx, { x, z, y = 0, h, r = 0.05, color = '#5a4332', tilt = [0, 0] }) {
  ctx.solid.add(new THREE.CylinderGeometry(r, r * 1.2, h, 5), { position: [x, y + h / 2, z], rotation: [tilt[0], 0, tilt[1]], color, jitter: 0.03 });
}

// Waving cloth anchored along its top edge ('top') or its left edge ('left').
// tear trims the free edge into ragged strips. map draws onto it.
export function cloth(ctx, { x, y, z, w, h, rot = 0, color = '#c9b48e', anchor = 'top', amp = 0.25, speed = 2.2, tear = 0, seed = 1, map, segX = 12, segY = 8 }) {
  const geo = new THREE.PlaneGeometry(w, h, segX, segY);
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const free = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const u = (base[i * 3] + w / 2) / w, v = (h / 2 - base[i * 3 + 1]) / h;
    free[i] = anchor === 'left' ? u : v;
  }
  if (tear) {
    const cut = Array.from({ length: (anchor === 'left' ? segY : segX) + 1 }, () => 1 - rnd() * tear);
    for (let i = 0; i < pos.count; i++) {
      const col = anchor === 'left' ? Math.round(((h / 2 - base[i * 3 + 1]) / h) * segY) : Math.round(((base[i * 3] + w / 2) / w) * segX);
      if (free[i] > cut[col]) {
        if (anchor === 'left') base[i * 3] = -w / 2 + cut[col] * w;
        else base[i * 3 + 1] = h / 2 - cut[col] * h;
        free[i] = cut[col];
      }
    }
  }
  const mat = new THREE.MeshLambertMaterial({ color: map ? '#ffffff' : color, map, side: THREE.DoubleSide, flatShading: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.castShadow = true;
  ctx.scene.add(mesh);
  ctx.onFrame((t) => {
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1], f = free[i];
      const wave = Math.sin(t * speed - f * 5 + by * 0.6) * amp * f + Math.sin(t * speed * 1.7 - f * 9) * amp * 0.3 * f;
      if (anchor === 'left') pos.setXYZ(i, bx - Math.abs(wave) * 0.3, by - f * f * h * 0.08, wave);
      else pos.setXYZ(i, bx, by, wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return mesh;
}

// Soft slanted light coming through a window or doorway.
export function shaft(ctx, { from, to, w = 1.5, color = '#ffe6b0', opacity = 0.25 }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const geo = new THREE.BoxGeometry(w, len, w * 0.6);
  geo.translate(0, len / 2, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
    vertexShader: 'varying float vY; void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying float vY; void main() { gl_FragColor = vec4(uColor * uOpacity * smoothstep(0.0, 0.3, vY) * (1.0 - smoothstep(0.75, 1.0, vY)), 1.0); }',
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mesh.renderOrder = 8;
  ctx.scene.add(mesh);
  return mesh;
}

// Canvas texture with lines of hand-lettered text, for banners and scrolls.
export function textTexture(lines, { width = 512, height = 512, bg = '#e9dcc0', ink = '#5a2a1a', font = 'italic 44px Georgia, serif', lineHeight = 58 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, width, height);
  g.fillStyle = ink;
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const top = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => g.fillText(line, width / 2, top + i * lineHeight));
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Ring of points around a center, for placing people by hand.
export function arcPoints(center, radius, count, a0, a1) {
  return Array.from({ length: count }, (_, i) => {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / count;
    return [center[0] + Math.cos(a) * radius, center[1] + Math.sin(a) * radius];
  });
}

export function linePoints(from, to, count) {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  });
}

// Feather crown sitting on a figure's head.
export function crown(ctx, { x, y, z, scale = 1, gold = '#d9a93a', plumes = ['#2f8f7a', '#3fae8c', '#c8452c'] }) {
  const top = y + 1.62 * scale;
  ctx.solid.add(new THREE.CylinderGeometry(0.15 * scale, 0.14 * scale, 0.1 * scale, 8), { position: [x, top, z], color: gold, jitter: 0.02 });
  for (let i = 0; i < 7; i++) {
    const a = -1.0 + (i / 6) * 2.0;
    ctx.solid.add(new THREE.ConeGeometry(0.05 * scale, 0.45 * scale, 3), {
      position: [x + Math.sin(a) * 0.12 * scale, top + 0.22 * scale, z - Math.cos(a) * 0.08 * scale],
      rotation: [-0.35, 0, -a * 0.5],
      color: plumes[i % plumes.length],
      jitter: 0.04,
    });
  }
}

// Straight sword lying or standing: blade along local +z from the hilt at (x, y, z).
export function sword(ctx, { x, y, z, yaw = 0, pitch = 0, roll = 0, len = 0.9, blade = '#c4c9d0', hilt = '#5a3a24' }) {
  const dir = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  const at = (d) => [x + dir.x * d, y + dir.y * d, z + dir.z * d];
  ctx.solid.box(0.07, 0.015, len, { position: at(len / 2 + 0.1), rotation: [pitch, yaw, roll], color: blade, jitter: 0.03 });
  ctx.solid.box(0.24, 0.04, 0.04, { position: at(0.08), rotation: [pitch, yaw, roll], color: '#8a7040', jitter: 0.03 });
  ctx.solid.box(0.04, 0.04, 0.2, { position: at(-0.04), rotation: [pitch, yaw, roll], color: hilt, jitter: 0.03 });
}

export function spear(ctx, { x, y, z, yaw = 0, pitch = 0, len = 2.4 }) {
  const dir = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  const at = (d) => [x + dir.x * d, y + dir.y * d, z + dir.z * d];
  ctx.solid.box(0.04, 0.04, len, { position: at(len / 2), rotation: [pitch, yaw, 0], color: '#6a4a30', jitter: 0.04 });
  ctx.solid.add(new THREE.ConeGeometry(0.06, 0.3, 4).rotateX(Math.PI / 2), { position: at(len + 0.12), rotation: [pitch, yaw, 0], color: '#3a3836', jitter: 0.02 });
}

// Mound of loose dug earth.
export function mound(ctx, { x, z, w = 2, h = 0.6, d = 1.2, rot = 0, color = '#5a4030' }) {
  ctx.solid.add(new THREE.DodecahedronGeometry(1, 0), { position: [x, ctx.heightAt(x, z) - h * 0.15, z], rotation: [0, rot, 0], scale: [w / 2, h, d / 2], color, jitter: 0.07 });
}

// Intact flat-roofed plaster house with a dark doorway facing local +z.
export function house(ctx, { x, z, rot = 0, w = 7, d = 6, h = 3.4, color = '#d8c7a4', trim = '#9a6a48', roof = '#8a7356' }) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const y = Math.min(...[[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([lx, lz]) => ctx.heightAt(...at(lx, lz)))) - 0.2;
  block(ctx, { x, z, y, w, h, d, rot, color, jitter: 0.03 });
  ctx.solid.box(w + 0.3, 0.35, d + 0.3, { position: [x, y + h + 0.1, z], rotation: [0, rot, 0], color: trim, jitter: 0.03 });
  ctx.solid.box(w - 0.6, 0.2, d - 0.6, { position: [x, y + h + 0.3, z], rotation: [0, rot, 0], color: roof, jitter: 0.03 });
  const [dx, dz] = at(0, d / 2 + 0.01);
  ctx.solid.box(1.1, 2.0, 0.08, { position: [dx, y + 1.2, dz], rotation: [0, rot, 0], color: '#2a1d14', jitter: 0 });
  const [bx, bz] = at(0, d / 2 + 0.02);
  ctx.solid.box(w + 0.02, 0.3, 0.06, { position: [bx, y + h * 0.75, bz], rotation: [0, rot, 0], color: trim, jitter: 0.03 });
}
