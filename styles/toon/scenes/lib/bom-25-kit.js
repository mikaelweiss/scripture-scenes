import * as THREE from 'three';
import { makeFigure } from '../../engine/people.js';
import { boxGeo, makeRng } from '../../engine/util.js';

export function add(ctx, geo, material, { pos = [0, 0, 0], rotY = 0, cast = true, receive = true } = {}) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos);
  mesh.rotation.y = rotY;
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  ctx.scene.add(mesh);
  return mesh;
}

// Box standing on y (its bottom), with a matching collider unless collide is false.
export function block(ctx, [w, h, d], [x, y, z], color, { rotY = 0, collide = true, walkable = false, stone = true, cast = true, top } = {}) {
  const geo = boxGeo(w, h, d, [0, h / 2, 0], { uv: { su: 2 } });
  const mat = stone ? ctx.kit.stoneMat(color) : ctx.kit.toon(color);
  const mesh = add(ctx, geo, mat, { pos: [x, y, z], rotY, cast });
  if (collide) ctx.addCollider({ x, z, hx: w / 2, hz: d / 2, rot: rotY, top: top ?? y + h, walkable });
  return mesh;
}

export function fretBand(ctx, [w, h, d], [x, y, z], [bg, fg], { rotY = 0 } = {}) {
  const geo = boxGeo(w, h, d, [0, h / 2, 0], { uv: { su: h * 4, sv: h, oy: h / 2, local: true, flatCaps: true } });
  return add(ctx, geo, ctx.kit.fretMat(bg, fg), { pos: [x, y, z], rotY });
}

// Straight flight of walkable steps climbing from y0 to y1, rising toward -dir.
export function steps(ctx, { x, z, y0 = 0, y1, width, depth = 0.45, rise = 0.3, dir = [0, 1], color }) {
  const n = Math.max(1, Math.round((y1 - y0) / rise));
  const r = (y1 - y0) / n;
  const along = dir[0] !== 0;
  for (let k = 0; k < n; k++) {
    const top = y0 + (k + 1) * r;
    const off = (n - k - 0.5) * depth;
    const cx = x + dir[0] * off, cz = z + dir[1] * off;
    const size = along ? [depth, top - y0 + 0.2, width] : [width, top - y0 + 0.2, depth];
    block(ctx, size, [cx, y0 - 0.2, cz], color, { walkable: true });
  }
  return n * depth;
}

export function person(ctx, colors, [x, z], face, { scale = 1, glow = 0, kneel = false, sit = false, y, clear = 0.9 } = {}) {
  const fig = makeFigure(colors, ctx.kit, { glow });
  if (kneel || sit) {
    const squash = kneel ? 0.6 : 0.72;
    const drop = 1.46 * (1 - squash);
    fig.children.forEach((c, i) => {
      if (i < 2) c.scale.y = squash;
      else c.position.y -= drop;
    });
  }
  fig.position.set(x, y ?? ctx.groundHeight(x, z), z);
  fig.scale.setScalar(scale);
  if (face) fig.rotation.y = Math.atan2(face[0] - x, face[1] - z);
  ctx.scene.add(fig);
  if (clear) ctx.exclude({ kind: 'circle', x, z, r: clear });
  return fig;
}

// A soldier's helmet and breastplate added to a figure.
export function armor(ctx, fig, { metal = '#b9a27a', crest = '#b5523b' } = {}) {
  const mat = ctx.kit.toon(metal);
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat);
  helm.position.y = 1.6;
  const plume = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.3), ctx.kit.toon(crest));
  plume.position.y = 1.78;
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.215, 0.42, 12), mat);
  plate.position.y = 1.16;
  for (const m of [helm, plume, plate]) {
    m.castShadow = true;
    fig.add(m);
  }
}

export function spear(ctx, fig, { side = 1, length = 2.6, color = '#6b4a33' } = {}) {
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, length, 5), ctx.kit.toon(color));
  shaft.position.set(side * 0.32, length / 2 - 0.1, 0.12);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 5), ctx.kit.toon('#4a4038'));
  tip.position.set(side * 0.32, length, 0.12);
  fig.add(shaft, tip);
}

export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Flickering cone flames with a warm point light.
export function fire(ctx, [x, y, z], { size = 1, light = 6, distance = 14 } = {}) {
  const outer = add(ctx, new THREE.ConeGeometry(0.3 * size, 1, 7).translate(0, 0.5, 0), ctx.kit.basic(ctx.style.flameOuter ?? '#f08a2c'), { pos: [x, y, z], cast: false });
  const inner = add(ctx, new THREE.ConeGeometry(0.16 * size, 1, 7).translate(0, 0.5, 0), ctx.kit.basic(ctx.style.flameInner ?? '#ffe08a'), { pos: [x, y, z], cast: false });
  const h = 0.9 * size;
  const phase = x * 3.1 + z * 1.7;
  ctx.onFrame((t) => {
    const f = 0.8 + 0.2 * Math.sin(t * 9 + phase) * Math.sin(t * 5.3 + phase * 2);
    outer.scale.y = h * f;
    inner.scale.y = h * f * 0.6;
  });
  if (light) {
    const l = new THREE.PointLight('#ffb35c', light, distance, 1.5);
    l.position.set(x, y + 0.8 * size, z);
    ctx.scene.add(l);
  }
}

export function brazier(ctx, [x, z], { y, color = '#5e4632', size = 1 } = {}) {
  const base = y ?? ctx.groundHeight(x, z);
  const bowl = new THREE.CylinderGeometry(0.45 * size, 0.2 * size, 0.35 * size, 10);
  const stand = new THREE.CylinderGeometry(0.1 * size, 0.18 * size, 0.9 * size, 8);
  add(ctx, stand, ctx.kit.toon(color), { pos: [x, base + 0.45 * size, z] });
  add(ctx, bowl, ctx.kit.toon(color), { pos: [x, base + 1.05 * size, z] });
  fire(ctx, [x, base + 1.15 * size, z], { size: size * 0.9 });
  ctx.addCollider({ x, z, hx: 0.35, hz: 0.35, rot: 0, top: base + 1.2 * size });
}

// Smooth grassy mound with a grid of walkable colliders so people and the player stand on it.
export function mound(ctx, { x, z, radius, height, color, cell = 2 }) {
  const shape = (d) => (d >= 1 ? 0 : height * (0.5 + 0.5 * Math.cos(Math.PI * d)));
  const seg = new THREE.PlaneGeometry(radius * 2, radius * 2, 40, 40);
  seg.rotateX(-Math.PI / 2);
  const pos = seg.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), pz = pos.getZ(i);
    const d = Math.hypot(px, pz) / radius;
    pos.setY(i, shape(d) - (d >= 1 ? 0.6 : 0) + ctx.terrainHeight(x + px, z + pz) - 0.15);
  }
  seg.computeVertexNormals();
  const base = new THREE.Color(color), c = new THREE.Color();
  const rng = makeRng(7);
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), pz = pos.getZ(i);
    const patch = Math.sin(px * 0.21 + Math.sin(pz * 0.17) * 2) * Math.cos(pz * 0.19 - px * 0.05);
    c.copy(base).multiplyScalar(patch > 0.35 ? 0.86 : patch < -0.45 ? 1.1 : 1);
    if (rng() < 0.06) c.multiplyScalar(0.9);
    c.toArray(colors, i * 3);
  }
  seg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: ctx.kit.gradient });
  add(ctx, seg, mat, { pos: [x, 0, z] });
  for (let gx = -radius; gx < radius; gx += cell) {
    for (let gz = -radius; gz < radius; gz += cell) {
      const cx = gx + cell / 2, cz = gz + cell / 2;
      const d = Math.hypot(cx, cz) / radius;
      if (d >= 0.97) continue;
      const top = shape(d) + ctx.terrainHeight(x + cx, z + cz) - 0.15;
      ctx.addCollider({ x: x + cx, z: z + cz, hx: cell / 2, hz: cell / 2, rot: 0, top, walkable: true });
    }
  }
  return (px, pz) => shape(Math.hypot(px - x, pz - z) / radius);
}

// Simple flat-roofed adobe houses scattered in a ring for a city backdrop.
export function houses(ctx, { center = [0, 0], ring, count, colors, roof = '#8c5a3c', seed = 5, avoid = () => false, size = [5, 9] }) {
  const rng = makeRng(seed);
  for (let i = 0, placed = 0; i < count * 8 && placed < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = ring[0] + rng() * (ring[1] - ring[0]);
    const x = center[0] + Math.sin(a) * r, z = center[1] + Math.cos(a) * r;
    if (avoid(x, z) || ctx.blocked(x, z, 4)) continue;
    const w = size[0] + rng() * (size[1] - size[0]), d = size[0] + rng() * (size[1] - size[0]);
    const h = 3 + rng() * 2;
    const rot = rng() * Math.PI;
    const y = ctx.terrainHeight(x, z) - 0.2;
    block(ctx, [w, h, d], [x, y, z], colors[Math.floor(rng() * colors.length)], { rotY: rot });
    block(ctx, [w + 0.6, 0.35, d + 0.6], [x, y + h, z], roof, { rotY: rot, collide: false, stone: false });
    add(ctx, new THREE.BoxGeometry(1.1, 2, 0.1), ctx.kit.toon('#2b1a12'), { pos: [x + Math.sin(rot) * (d / 2 + 0.02), y + 1, z + Math.cos(rot) * (d / 2 + 0.02)], rotY: rot, cast: false });
    ctx.exclude({ kind: 'rect', x, z, hx: w / 2 + 1, hz: d / 2 + 1, rot });
    placed++;
  }
}

export const clothes = {
  robes: ['#d9c7a3', '#c8a97a', '#a87b4f', '#8c5a3c', '#b5523b', '#c98b3c', '#7a6a52', '#6f8a6a', '#4f7f80', '#e6d8b8', '#9c6b4e', '#bfa27a'],
  mantles: ['#8c5a3c', '#5e4632', '#b5523b', '#c8912e', '#3e6e66', '#d9c7a3', '#6b5a4a', '#a64b35'],
  skins: ['#8a5a3b', '#9c6a45', '#a87650', '#b5825a', '#7a4e33', '#c08f66'],
  hair: ['#2b1a12', '#3a2418', '#1f140e', '#4a3020'],
  wraps: ['#e6d8b8', '#c8912e', '#b5523b', '#d9c7a3', '#4f7f80'],
};

export const baseStyle = {
  ink: '#2b1a12',
  toonSteps: [0.4, 0.72, 1.0],
  lines: { width: 1.6, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
  grain: 0.05,
  crack: '#3a2418',
  ember: '#c8502c',
  emberHot: '#ffb347',
  flameOuter: '#f08a2c',
  flameInner: '#ffe08a',
  charred: '#3a2a22',
  smoke: '#b9aea8',
  smokeShade: '#3d3640',
};

export const groundColors = {
  sand: '#d4ac6c',
  dirt: '#bf8d55',
  grass: '#8e9a58',
  grassDark: '#6c7a42',
  plaza: '#e2cfa4',
  plazaLine: '#c3a676',
  scorch: '#3a2a22',
  scorchEdge: '#6e4630',
  hill: '#7f9a6a',
};
