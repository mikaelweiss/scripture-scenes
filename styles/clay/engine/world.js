import * as THREE from 'three';
import { clayMaterial, clayUniforms, roundedBox, capsule, blob, merge, placed, mulberry, glowTexture, pawnParts } from './clay.js';

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const range = (rand, [a, b]) => lerp(a, b, rand());

// Collects every static clay piece into one vertex-colored mesh: one draw call
// for the whole set, which keeps hundreds of ruins and trees cheap.
class Batch {
  constructor() { this.parts = []; }
  add(geom, color) {
    const g = geom.index ? geom.toNonIndexed() : geom;
    const c = new THREE.Color(color);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    this.parts.push(g);
  }
  build(opts = {}) {
    const mesh = new THREE.Mesh(merge(this.parts), clayMaterial('#ffffff', { vertexColors: true, ...opts }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}

export class Colliders {
  constructor() { this.list = []; }
  box(x, z, hx, hz, rot = 0, top = 3) { this.list.push({ kind: 'box', x, z, hx, hz, rot, top }); }
  circle(x, z, r, top = 3) { this.list.push({ kind: 'circle', x, z, r, top }); }
  hits(x, z, margin = 0, y = -Infinity) {
    for (const c of this.list) {
      if (y > c.top) continue;
      if (c.kind === 'circle') {
        if (Math.hypot(x - c.x, z - c.z) < c.r + margin) return true;
      } else {
        const cs = Math.cos(-c.rot), sn = Math.sin(-c.rot);
        const lx = (x - c.x) * cs - (z - c.z) * sn, lz = (x - c.x) * sn + (z - c.z) * cs;
        if (Math.abs(lx) < c.hx + margin && Math.abs(lz) < c.hz + margin) return true;
      }
    }
    return false;
  }
  // Pushes a circle of radius r out of every collider. Returns the corrected point.
  resolve(p, r) {
    for (const c of this.list) {
      if (c.kind === 'circle') {
        const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), min = c.r + r;
        if (d < min && d > 1e-6) { p.x = c.x + (dx / d) * min; p.z = c.z + (dz / d) * min; }
      } else {
        const cs = Math.cos(-c.rot), sn = Math.sin(-c.rot);
        let lx = (p.x - c.x) * cs - (p.z - c.z) * sn, lz = (p.x - c.x) * sn + (p.z - c.z) * cs;
        const qx = Math.max(-c.hx, Math.min(c.hx, lx)), qz = Math.max(-c.hz, Math.min(c.hz, lz));
        const dx = lx - qx, dz = lz - qz, d = Math.hypot(dx, dz);
        if (d < r) {
          if (d > 1e-6) { lx = qx + (dx / d) * r; lz = qz + (dz / d) * r; }
          else if (c.hx - Math.abs(lx) < c.hz - Math.abs(lz)) lx = Math.sign(lx || 1) * (c.hx + r);
          else lz = Math.sign(lz || 1) * (c.hz + r);
          const bc = Math.cos(c.rot), bs = Math.sin(c.rot);
          p.x = c.x + lx * bc - lz * bs;
          p.z = c.z + lx * bs + lz * bc;
        }
      }
    }
    return p;
  }
}

export function makeTerrain(spec) {
  return (x, z) => {
    const r = Math.hypot(x, z);
    const hill = smooth(spec.flatRadius, spec.flatRadius + 70, r);
    const n = Math.sin(x * 0.031 + 1.3) * Math.cos(z * 0.027 + 0.4) + 0.5 * Math.sin(x * 0.071 + z * 0.053 + 2.1);
    const ripple = Math.sin(x * 0.21 + Math.cos(z * 0.17)) * Math.cos(z * 0.19 + 0.7) * 0.12;
    return hill * spec.hills * (n * 0.6 + 0.9) + ripple;
  };
}

export class World {
  constructor(data) {
    this.data = data;
    this.rand = mulberry(data.seed ?? 1);
    this.root = new THREE.Group();
    this.fx = new THREE.Group();
    this.batch = new Batch();
    this.colliders = new Colliders();
    this.height = makeTerrain(data.ground);
    this.updaters = [];
  }

  build() {
    const d = this.data;
    this.buildSky(d.sky);
    this.buildLights(d.sun, d.ambient);
    this.buildGround(d.ground);
    if (d.horizonHills) this.buildHills(d.horizonHills);
    if (d.clouds) this.buildClouds(d.clouds);
    if (d.temple) this.buildTemple(d.temple);
    if (d.dais) this.buildDais(d.dais);
    for (const r of d.ruins ?? []) this[`ruin_${r.type}`](r);
    for (const r of d.rubble ?? []) this.buildRubble(r);
    for (const c of d.cracks ?? []) this.buildCrack(c);
    if (d.fires) this.buildFires(d.fires);
    if (d.trees) this.buildTrees(d.trees);
    if (d.christ) this.buildChrist(d.christ, d.dais);
    for (const s of d.lightShafts ?? []) this.buildShaft(s);
    if (d.childrenRing) this.buildRing(d.childrenRing);
    this.root.add(this.batch.build());
    this.root.add(this.fx);
    return this;
  }

  update(t, dt) { for (const u of this.updaters) u(t, dt); }

  // ---------- environment ----------

  buildSky(s) {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        zenith: { value: new THREE.Color(s.zenith) },
        horizon: { value: new THREE.Color(s.horizon) },
        glow: { value: new THREE.Color(s.glow) },
        glowDir: { value: new THREE.Vector3(...s.glowDir).normalize() },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
      fragmentShader: `uniform vec3 zenith, horizon, glow; uniform vec3 glowDir; varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.3, h));
          float g = max(dot(normalize(vDir), glowDir), 0.0);
          col += glow * (pow(g, 6.0) * 0.6 + pow(g, 40.0) * 0.8);
          col = mix(col, horizon * 0.95, smoothstep(0.02, -0.2, vDir.y));
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), mat);
    sky.frustumCulled = false;
    sky.renderOrder = -1;
    this.fx.add(sky);
    this.fog = new THREE.Fog(s.fog.color, s.fog.near, s.fog.far);
  }

  buildLights(sun, amb) {
    const hemi = new THREE.HemisphereLight(amb.sky, amb.ground, amb.intensity);
    this.root.add(hemi);
    const light = new THREE.DirectionalLight(sun.color, sun.intensity);
    light.position.set(...sun.from);
    light.castShadow = true;
    light.shadow.mapSize.set(4096, 4096);
    const s = sun.shadowSize;
    Object.assign(light.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 10, far: 400 });
    light.shadow.bias = -0.0004;
    light.shadow.normalBias = 0.04;
    this.root.add(light, light.target);
    this.sun = light;
  }

  buildGround(g) {
    const size = 700, seg = 180;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color(g.color);
    const patches = (g.patches ?? []).map((p) => ({ ...p, c: new THREE.Color(p.color) }));
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, this.height(x, z));
      tmp.copy(base);
      const wobble = Math.sin(x * 0.13 + z * 0.07) * 3 + Math.cos(z * 0.11 - x * 0.05) * 3;
      for (const p of patches) {
        const d = Math.hypot(x - p.at[0], z - p.at[1]) + wobble;
        tmp.lerp(p.c, 1 - smooth(p.radius * 0.7, p.radius, d));
      }
      const n = 0.94 + 0.12 * (Math.sin(x * 0.9) * Math.cos(z * 0.8) * 0.5 + 0.5);
      colors[i * 3] = tmp.r * n; colors[i * 3 + 1] = tmp.g * n; colors[i * 3 + 2] = tmp.b * n;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, clayMaterial('#ffffff', { vertexColors: true, bump: 1.6, scale: 0.6, roughness: 0.95 }));
    mesh.receiveShadow = true;
    this.root.add(mesh);
  }

  buildHills(h) {
    const r = this.rand;
    for (let i = 0; i < h.count; i++) {
      const a = (i / h.count) * Math.PI * 2 + r() * 0.2;
      const d = range(r, h.radius), s = range(r, h.size);
      const geo = placed(blob(1, 3), { x: Math.sin(a) * d, y: -s * 0.15, z: Math.cos(a) * d, sx: s * 1.6, sy: s * 0.55, sz: s });
      this.batch.add(geo, pick(r, h.colors));
    }
  }

  buildClouds(c) {
    const r = this.rand;
    const puffs = [];
    const [ox, oz] = c.opening.at;
    while (puffs.length < c.count) {
      const a = r() * Math.PI * 2;
      const d = lerp(c.opening.radius, c.radius[1], Math.pow(r(), 0.8));
      const cx = ox + Math.sin(a) * d, cz = oz + Math.cos(a) * d, cy = range(r, c.height);
      const n = 3 + Math.floor(r() * 5);
      const lit = 1 - smooth(c.opening.radius, c.opening.radius + 45, d);
      for (let k = 0; k < n && puffs.length < c.count; k++) {
        const s = 7 + r() * 12;
        puffs.push({ x: cx + (r() - 0.5) * 22, y: cy + (r() - 0.5) * 5, z: cz + (r() - 0.5) * 22, s, lit: Math.min(1, lit + r() * 0.15) });
      }
    }
    const geo = blob(1, 3);
    const mesh = new THREE.InstancedMesh(geo, this.cloudMaterial(c), puffs.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    const dark = new THREE.Color(c.dark), lit = new THREE.Color(c.lit);
    puffs.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.s * 1.3, p.s * 0.55, p.s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, col.copy(dark).lerp(lit, p.lit));
    });
    this.fx.add(mesh);
  }

  // Clouds are self-lit: scene lights would shade their undersides the color
  // of the ground, while a storm breaking open should glow from the gap.
  cloudMaterial(c) {
    const s = this.data.sky;
    return new THREE.ShaderMaterial({
      fog: false,
      uniforms: {
        opening: { value: new THREE.Vector3(c.opening.at[0], 60, c.opening.at[1]) },
        haze: { value: new THREE.Color(s.horizon) },
        glow: { value: new THREE.Color(s.glow) },
      },
      vertexShader: `varying vec3 vN; varying vec3 vW; varying vec3 vC;
        void main(){
          vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vW = w.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); vC = instanceColor;
          gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec3 opening, haze, glow; varying vec3 vN; varying vec3 vW; varying vec3 vC;
        void main(){
          vec3 n = normalize(vN);
          vec3 toGap = normalize(opening - vW);
          float lightSide = max(dot(n, toGap), 0.0);
          vec3 col = vC * (0.62 + 0.38 * max(n.y, 0.0));
          col += glow * pow(lightSide, 2.0) * 0.45 * smoothstep(260.0, 60.0, length(vW.xz - opening.xz));
          float far = smoothstep(120.0, 300.0, length(vW.xz - cameraPosition.xz));
          col = mix(col, haze, far * 0.55);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    });
  }

  // ---------- architecture ----------

  buildTemple(t) {
    const r = this.rand;
    const [tx, tz] = t.at;
    const stone = new THREE.Color(t.color);
    const tint = (k = 0.06) => stone.clone().offsetHSL(0, 0, (r() - 0.5) * k);
    const fallen = [];
    for (let i = 0; i < t.tiers; i++) {
      const w = t.base[0] - 2 * t.inset * i, dd = t.base[1] - 2 * t.inset * i;
      const y0 = i * t.tierHeight;
      this.batch.add(placed(roundedBox(w - 1.4, t.tierHeight, dd - 1.4, 0.3, 2), { x: tx, y: y0 + t.tierHeight / 2, z: tz }), t.color);
      // perimeter of slightly irregular stone blocks, gaps at damaged corners
      const damaged = (t.damage ?? []).filter((dm) => dm.tier === i);
      const course = (len, along) => {
        const n = Math.max(2, Math.round(len / 3));
        const bl = len / n;
        for (let k = 0; k < n; k++) {
          const off = -len / 2 + bl * (k + 0.5);
          const pos = along(off);
          const near = damaged.find((dm) => Math.sign(pos.x - tx) === dm.corner[0] && Math.sign(pos.z - tz) === dm.corner[1] && Math.abs(pos.x - tx) > w / 2 - 7 && Math.abs(pos.z - tz) > dd / 2 - 7);
          const bh = t.tierHeight - r() * 0.1;
          if (near && r() < 0.8) {
            fallen.push({ w: pos.w, d: pos.d, h: bh });
            continue;
          }
          this.batch.add(placed(roundedBox(pos.w - 0.08, bh, pos.d - 0.08, 0.22, 2), { x: pos.x, y: y0 + bh / 2, z: pos.z }), tint());
        }
      };
      course(w, (o) => ({ x: tx + o, z: tz + dd / 2 - 0.7, w: w / Math.max(2, Math.round(w / 3)), d: 1.4 }));
      course(w, (o) => ({ x: tx + o, z: tz - dd / 2 + 0.7, w: w / Math.max(2, Math.round(w / 3)), d: 1.4 }));
      course(dd - 2.8, (o) => ({ x: tx + w / 2 - 0.7, z: tz + o, w: 1.4, d: (dd - 2.8) / Math.max(2, Math.round((dd - 2.8) / 3)) }));
      course(dd - 2.8, (o) => ({ x: tx - w / 2 + 0.7, z: tz + o, w: 1.4, d: (dd - 2.8) / Math.max(2, Math.round((dd - 2.8) / 3)) }));
      this.batch.add(placed(roundedBox(w + 0.35, 0.4, dd + 0.35, 0.14, 2), { x: tx, y: y0 + t.tierHeight - 0.14, z: tz }), t.trim);
    }
    for (const f of fallen) {
      const a = r() * Math.PI * 2, dist = t.base[0] / 2 + 2 + r() * 8;
      const fx = tx + Math.sin(a) * dist, fz = tz + Math.cos(a) * dist * 0.9;
      this.batch.add(placed(roundedBox(f.w, f.h * 0.7, f.d, 0.22, 2), { x: fx, y: this.height(fx, fz) + f.h * 0.3, z: fz, rx: (r() - 0.5) * 0.8, ry: r() * 3, rz: (r() - 0.5) * 0.8 }), tint(0.1));
    }

    const H = t.tiers * t.tierHeight;
    const front = tz + t.base[1] / 2 + 1;
    const topFront = tz + (t.base[1] - 2 * t.inset * (t.tiers - 1)) / 2;
    const steps = Math.round(H / 0.5), run = (front - topFront) / steps, rise = H / steps;
    const sw = t.stairs.width;
    for (let i = 0; i < steps; i++) {
      const h = rise * (i + 1);
      const z = front - run * i - run / 2;
      this.batch.add(placed(roundedBox(sw, h, run + 1.2, 0.08, 1), { x: tx, y: h / 2, z: z - 0.6 }), i % 2 ? t.stairs.color : stone.clone().lerp(new THREE.Color(t.stairs.color), 0.5));
    }
    const slope = Math.atan2(H, front - topFront), len = Math.hypot(H, front - topFront);
    for (const side of [-1, 1]) {
      this.batch.add(placed(roundedBox(1.1, 0.9, len + 0.6, 0.3, 2), { x: tx + side * (sw / 2 + 0.55), y: H / 2 + 0.2, z: (front + topFront) / 2, rx: slope }), t.trim);
    }
    // shrine
    const [sx, sy, sz] = t.shrine.size;
    const sc = tz - 0.5;
    this.batch.add(placed(roundedBox(sx, sy, sz, 0.35, 3), { x: tx, y: H + sy / 2, z: sc }), t.shrine.color);
    this.batch.add(placed(roundedBox(2.4, 3, 0.4, 0.15, 2), { x: tx, y: H + 1.5, z: sc + sz / 2 + 0.05 }), t.shrine.door);
    for (const side of [-1, 1]) this.batch.add(placed(roundedBox(1.2, 2.2, 0.35, 0.12, 2), { x: tx + side * 3.3, y: H + 2.2, z: sc + sz / 2 + 0.05 }), t.trim);
    this.batch.add(placed(roundedBox(sx + 0.8, 0.6, sz + 0.8, 0.25, 2), { x: tx, y: H + sy + 0.3, z: sc }), t.shrine.roof);
    const crest = [1, 1.6, 2.2, 1.2, 0.5, 1.9, 1.4];
    crest.forEach((h, k) => {
      const x = tx - sx / 2 + 1 + k * ((sx - 2) / (crest.length - 1));
      this.batch.add(placed(roundedBox(1.15, h, 0.9, 0.2, 2), { x, y: H + sy + 0.6 + h / 2, z: sc, rz: (r() - 0.5) * 0.1 }), t.shrine.roof);
    });
    this.colliders.box(tx, tz, t.base[0] / 2, t.base[1] / 2, 0, H + sy + 1);
    this.colliders.box(tx, front - (front - topFront) / 2, sw / 2 + 1.1, (front - topFront) / 2 + 0.5, 0, H);
  }

  buildDais(d) {
    const [x, z] = d.at;
    const y0 = this.height(x, z);
    for (let i = 0; i < d.steps; i++) {
      const rad = d.radius * (1 - i * 0.22), h = d.height / d.steps;
      const geo = new THREE.CylinderGeometry(rad, rad + 0.06, h, 40, 1);
      this.batch.add(placed(geo, { x, y: y0 + h * i + h / 2, z }), new THREE.Color(d.color).offsetHSL(0, 0, -i * 0.03));
      this.batch.add(placed(new THREE.TorusGeometry(rad, h * 0.5, 8, 40), { x, y: y0 + h * i + h / 2, z, rx: Math.PI / 2 }), new THREE.Color(d.color).offsetHSL(0, 0, -i * 0.03));
    }
    this.daisTop = y0 + d.height;
    this.colliders.circle(x, z, d.radius + 0.2, d.height);
  }

  ruin_house(h) {
    const r = this.rand;
    const [x, z] = h.at;
    const y0 = this.height(x, z);
    const [w, d] = h.size, th = 0.7;
    const walls = [
      { cx: 0, cz: d / 2, len: w, rot: 0 }, { cx: 0, cz: -d / 2, len: w, rot: 0 },
      { cx: w / 2, cz: 0, len: d - th, rot: Math.PI / 2 }, { cx: -w / 2, cz: 0, len: d - th, rot: Math.PI / 2 },
    ];
    const cs = Math.cos(h.rot), sn = Math.sin(h.rot);
    const world = (lx, lz) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs];
    walls.forEach((wl, wi) => {
      const n = Math.round(wl.len / 1.2);
      const bl = wl.len / n;
      const breakAt = r() * n;
      for (let k = 0; k < n; k++) {
        const o = -wl.len / 2 + bl * (k + 0.5);
        const lx = wl.cx + (wl.rot ? 0 : o), lz = wl.cz + (wl.rot ? o : 0);
        const [px, pz] = world(lx, lz);
        const ruin = Math.abs(k - breakAt) < n * 0.35 ? 0.15 + r() * 0.4 : 0.75 + r() * 0.25;
        const bh = h.height * ruin;
        const door = wi === 0 && Math.abs(o) < 0.8;
        if (door) continue;
        this.batch.add(placed(roundedBox(wl.rot ? th : bl - 0.04, bh, wl.rot ? bl - 0.04 : th, 0.18, 2), { x: px, y: y0 + bh / 2, z: pz, ry: h.rot }), new THREE.Color(h.color).offsetHSL(0, 0, (r() - 0.5) * 0.06));
      }
      const [cx, cz] = world(wl.cx, wl.cz);
      this.colliders.box(cx, cz, (wl.rot ? th : wl.len) / 2, (wl.rot ? wl.len : th) / 2, -h.rot, h.height);
    });
    if (h.roof === 'collapsed') {
      const [px, pz] = world(r() - 0.5, r() - 0.5);
      this.batch.add(placed(roundedBox(w * 0.8, 0.35, d * 0.75, 0.15, 2), { x: px, y: y0 + h.height * 0.35, z: pz, ry: h.rot + 0.1, rx: 0.32, rz: -0.12 }), '#8d6e4f');
      for (let k = 0; k < 5; k++) {
        const [bx, bz] = world((r() - 0.5) * w * 0.8, (r() - 0.5) * d * 0.8);
        this.batch.add(placed(capsule(0.12, w * 0.7, 2, 6), { x: bx, y: y0 + 0.3 + r() * 1.2, z: bz, rz: Math.PI / 2 + (r() - 0.5) * 0.6, ry: r() * 3 }), '#5e4630');
      }
    }
  }

  ruin_wall(wl) {
    const r = this.rand;
    const [x1, z1] = wl.from, [x2, z2] = wl.to;
    const len = Math.hypot(x2 - x1, z2 - z1), rot = Math.atan2(-(z2 - z1), x2 - x1);
    const n = Math.round(len / 1.6), bl = len / n;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const px = lerp(x1, x2, t), pz = lerp(z1, z2, t);
      const gone = Math.sin(k * 0.7 + x1) * 0.5 + 0.5 < wl.broken * 0.55 && r() < 0.8;
      const bh = gone ? 0.4 + r() * 0.5 : wl.height * (0.8 + r() * 0.2);
      this.batch.add(placed(roundedBox(bl - 0.05, bh, 0.8, 0.2, 2), { x: px, y: this.height(px, pz) + bh / 2, z: pz, ry: rot }), new THREE.Color(wl.color).offsetHSL(0, 0, (r() - 0.5) * 0.07));
      if (gone && r() < 0.6) {
        const off = (r() < 0.5 ? -1 : 1) * (1 + r() * 1.5);
        const fx = px + Math.sin(rot) * off, fz = pz + Math.cos(rot) * off;
        this.batch.add(placed(roundedBox(bl * 0.8, 0.7, 0.8, 0.2, 2), { x: fx, y: this.height(fx, fz) + 0.3, z: fz, ry: rot + (r() - 0.5), rz: (r() - 0.5) * 0.5 }), wl.color);
      }
      this.colliders.box(px, pz, bl / 2, 0.45, -rot, wl.height);
    }
  }

  ruin_toppledWall(wl) {
    const r = this.rand;
    const [x1, z1] = wl.from, [x2, z2] = wl.to;
    const n = 6;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const px = lerp(x1, x2, t) + (r() - 0.5), pz = lerp(z1, z2, t) + (r() - 0.5);
      this.batch.add(placed(roundedBox(1.5, 0.75, 0.9, 0.2, 2), { x: px, y: this.height(px, pz) + 0.35, z: pz, ry: Math.atan2(-(z2 - z1), x2 - x1) + (r() - 0.5) * 0.6, rx: (r() - 0.5) * 0.4 }), wl.color);
    }
  }

  ruin_column(c) {
    const r = this.rand;
    const [x, z] = c.at;
    const y0 = this.height(x, z);
    this.batch.add(placed(roundedBox(1.7, 0.5, 1.7, 0.15, 2), { x, y: y0 + 0.25, z }), c.color);
    const drums = Math.max(1, Math.round(c.height / 1));
    for (let k = 0; k < drums; k++) {
      const h = c.height / drums;
      this.batch.add(placed(capsule(0.55, h - 0.5, 3, 14), { x: x + (r() - 0.5) * 0.06, y: y0 + 0.5 + h * k + h / 2, z, ry: r() }), new THREE.Color(c.color).offsetHSL(0, 0, (r() - 0.5) * 0.05));
    }
    if (!c.broken) this.batch.add(placed(roundedBox(1.6, 0.45, 1.6, 0.15, 2), { x, y: y0 + 0.5 + c.height + 0.2, z }), c.color);
    this.colliders.circle(x, z, 0.9, c.height + 1);
  }

  ruin_fallenColumn(c) {
    const r = this.rand;
    const [x, z] = c.at;
    const drums = Math.round(c.length / 1.1);
    for (let k = 0; k < drums; k++) {
      const o = (k - drums / 2) * 1.15 + (r() - 0.5) * 0.3;
      const px = x + Math.cos(c.rot) * o + (r() - 0.5) * 0.4, pz = z + Math.sin(c.rot) * o + (r() - 0.5) * 0.4;
      this.batch.add(placed(capsule(0.52, 0.5, 3, 14), { x: px, y: this.height(px, pz) + 0.45, z: pz, rz: Math.PI / 2, ry: -c.rot + (r() - 0.5) * 0.3 }), c.color);
      this.colliders.circle(px, pz, 0.6, 1);
    }
  }

  ruin_slab(s) {
    const [x, z] = s.at;
    this.batch.add(placed(roundedBox(s.size[0], 0.6, s.size[1], 0.25, 2), { x, y: this.height(x, z) + 0.4 + Math.abs(s.tilt) * s.size[0] * 0.3, z, ry: s.rot, rz: s.tilt }), s.color);
    this.colliders.box(x, z, s.size[0] / 2, s.size[1] / 2, -s.rot, 1.5);
  }

  buildRubble(rb) {
    const r = this.rand;
    const [cx, cz] = rb.at;
    let placedCount = 0, tries = 0;
    while (placedCount < rb.count && tries++ < rb.count * 10) {
      const a = r() * Math.PI * 2, d = range(r, rb.radius);
      const x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
      if (this.colliders.hits(x, z, 0.2)) continue;
      const s = range(r, rb.size);
      const geo = r() < 0.7 ? roundedBox(s * (0.8 + r() * 0.8), s * (0.5 + r() * 0.5), s * (0.7 + r() * 0.6), s * 0.2, 1) : placed(blob(s * 0.55, 1), { sy: 0.6 });
      this.batch.add(placed(geo, { x, y: this.height(x, z) + s * 0.18, z, rx: (r() - 0.5) * 0.6, ry: r() * 6, rz: (r() - 0.5) * 0.6 }), pick(r, rb.colors));
      placedCount++;
    }
  }

  buildCrack(c) {
    const r = this.rand;
    for (let i = 0; i < c.points.length - 1; i++) {
      const [x1, z1] = c.points[i], [x2, z2] = c.points[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1), n = Math.ceil(len / 1.4);
      const rot = Math.atan2(-(z2 - z1), x2 - x1);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const px = lerp(x1, x2, t) + (r() - 0.5) * 0.3, pz = lerp(z1, z2, t) + (r() - 0.5) * 0.3;
        const w = c.width * (0.6 + r() * 0.7);
        const y = this.height(px, pz);
        this.batch.add(placed(roundedBox(len / n + 0.5, 0.1, w, 0.04, 1), { x: px, y: y + 0.03, z: pz, ry: rot + (r() - 0.5) * 0.35 }), '#241a13');
        this.batch.add(placed(roundedBox(len / n + 0.9, 0.06, w + 0.5, 0.03, 1), { x: px, y: y + 0.01, z: pz, ry: rot + (r() - 0.5) * 0.35 }), '#6e5c40');
        if (r() < 0.12) {
          const side = r() < 0.5 ? -1 : 1;
          const ox = Math.sin(rot) * side * (w + 1), oz = Math.cos(rot) * side * (w + 1);
          this.batch.add(placed(roundedBox(1.6 + r(), 0.35, 1.2 + r(), 0.12, 1), { x: px + ox, y: y + 0.25, z: pz + oz, ry: r() * 3, rx: side * 0.35 }), '#8c7754');
        }
      }
    }
  }

  // ---------- life ----------

  buildFires(fires) {
    const r = this.rand;
    const puffsPer = 18, embersPer = 9;
    const smoke = new THREE.InstancedMesh(blob(1, 2), clayMaterial('#ffffff', { bump: 0.6 }), fires.length * puffsPer);
    const embers = new THREE.InstancedMesh(blob(1, 1), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), fires.length * embersPer);
    smoke.castShadow = true;
    const puffs = [], sparks = [];
    const col = new THREE.Color();
    fires.forEach((f, fi) => {
      const [x, z] = f.at;
      const y = this.height(x, z);
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        this.batch.add(placed(capsule(0.14 * f.size, 1.6 * f.size, 2, 6), { x: x + Math.sin(a) * 0.4, y: y + 0.25, z: z + Math.cos(a) * 0.4, rz: Math.PI / 2 - 0.3, ry: a }), k % 2 ? '#2a211b' : '#3a2c22');
      }
      this.batch.add(placed(blob(1.3 * f.size, 2), { x, y: y - 0.2, z, sy: 0.25 }), '#1d1712');
      for (let k = 0; k < puffsPer; k++) {
        puffs.push({ x, y, z, size: f.size, phase: k / puffsPer + r() * 0.05, drift: r() * 2 - 1 });
        smoke.setColorAt(fi * puffsPer + k, col.set('#a9a49c').offsetHSL(0, 0, (r() - 0.5) * 0.12));
      }
      for (let k = 0; k < embersPer; k++) {
        const a = r() * Math.PI * 2, d = r() * 0.9 * f.size;
        sparks.push({ x: x + Math.sin(a) * d, y: y + 0.15 + r() * 0.3, z: z + Math.cos(a) * d, s: (0.12 + r() * 0.16) * f.size, phase: r() * 10 });
        embers.setColorAt(fi * embersPer + k, col.set(r() < 0.5 ? '#ff7a2a' : '#ffb347').multiplyScalar(1.6));
      }
      this.colliders.circle(x, z, 1.2 * f.size, 0.5);
    });
    this.fx.add(smoke, embers);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    this.updaters.push((t) => {
      puffs.forEach((p, i) => {
        const k = (t * 0.09 + p.phase) % 1;
        const sc = Math.sin(Math.PI * Math.min(1, k * 1.4)) * (0.5 + k * 1.2) * p.size;
        v.set(p.x + k * k * 5 * p.drift + k * 3, p.y + 0.6 + k * 11 * p.size, p.z + Math.sin(k * 6 + p.phase * 20) * 0.6);
        m.compose(v, q, s.set(sc, sc * 0.9, sc));
        smoke.setMatrixAt(i, m);
      });
      smoke.instanceMatrix.needsUpdate = true;
      sparks.forEach((p, i) => {
        const f = 0.7 + 0.3 * Math.sin(t * 7 + p.phase) * Math.sin(t * 3.1 + p.phase * 2);
        m.compose(v.set(p.x, p.y, p.z), q, s.setScalar(p.s * f));
        embers.setMatrixAt(i, m);
      });
      embers.instanceMatrix.needsUpdate = true;
    });
  }

  buildTrees(spec) {
    const r = this.rand;
    const kinds = Object.entries(spec.scatter.kinds);
    let made = 0, tries = 0;
    while (made < spec.scatter.count && tries++ < spec.scatter.count * 20) {
      const a = r() * Math.PI * 2, d = range(r, spec.scatter.radius);
      const x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (this.colliders.hits(x, z, 2)) continue;
      if ((spec.keepClear ?? []).some((k) => Math.hypot(x - k.at[0], z - k.at[1]) < k.radius)) continue;
      let roll = r(), kind = kinds[0][0];
      for (const [k, w] of kinds) { if ((roll -= w) <= 0) { kind = k; break; } }
      this[`tree_${kind}`](x, this.height(x, z), z, spec);
      this.colliders.circle(x, z, 0.6, 0);
      made++;
    }
  }

  tree_palm(x, y, z, spec) {
    const r = this.rand;
    const h = 6 + r() * 4, lean = (r() - 0.5) * 0.5, dir = r() * Math.PI * 2;
    const segs = 6;
    let px = x, pz = z, py = y;
    for (let k = 0; k < segs; k++) {
      const sh = h / segs, bend = lean * (k / segs);
      const nx = px + Math.cos(dir) * Math.sin(bend) * sh, nz = pz + Math.sin(dir) * Math.sin(bend) * sh;
      this.batch.add(placed(capsule(0.24 - k * 0.015, sh * 0.6, 2, 8), { x: (px + nx) / 2, y: py + sh / 2, z: (pz + nz) / 2, rx: Math.sin(dir) * bend, rz: -Math.cos(dir) * bend }), new THREE.Color(spec.palm.trunk).offsetHSL(0, 0, k % 2 ? 0.04 : -0.02));
      px = nx; pz = nz; py += sh;
    }
    const fronds = 7 + Math.floor(r() * 3);
    for (let k = 0; k < fronds; k++) {
      const a = (k / fronds) * Math.PI * 2 + r() * 0.3;
      const droop = 0.35 + r() * 0.4, L = 2.4 + r() * 0.8;
      const geo = placed(blob(1, 1), { sx: 0.45, sy: 0.1, sz: L });
      geo.translate(0, 0, L * 0.9);
      geo.rotateX(droop);
      geo.rotateY(a);
      this.batch.add(placed(geo, { x: px, y: py, z: pz }), pick(r, spec.palm.leaves));
    }
    for (let k = 0; k < 3; k++) this.batch.add(placed(blob(0.18, 1), { x: px + (r() - 0.5) * 0.5, y: py - 0.25, z: pz + (r() - 0.5) * 0.5 }), '#6b4d2e');
  }

  tree_round(x, y, z, spec) {
    const r = this.rand;
    const h = 2.5 + r() * 1.5;
    this.batch.add(placed(capsule(0.3, h, 2, 8), { x, y: y + h / 2, z }), spec.round.trunk);
    const leaf = pick(r, spec.round.leaves);
    for (let k = 0; k < 4; k++) {
      const s = 1.5 + r() * 1.2;
      this.batch.add(placed(blob(s, 2), { x: x + (r() - 0.5) * 2, y: y + h + 0.6 + r() * 1.4, z: z + (r() - 0.5) * 2, sy: 0.85 }), new THREE.Color(leaf).offsetHSL(0, 0, (r() - 0.5) * 0.08));
    }
  }

  tree_broken(x, y, z, spec) {
    const r = this.rand;
    this.batch.add(placed(capsule(0.3, 1.1 + r(), 2, 8), { x, y: y + 0.6, z, rz: (r() - 0.5) * 0.2 }), spec.palm.trunk);
    const a = r() * Math.PI * 2, L = 5 + r() * 3;
    this.batch.add(placed(capsule(0.24, L, 2, 8), { x: x + Math.cos(a) * (L / 2 + 0.6), y: y + 0.3, z: z + Math.sin(a) * (L / 2 + 0.6), rz: Math.PI / 2, ry: -a }), new THREE.Color(spec.palm.trunk).offsetHSL(0, 0, -0.06));
    for (let k = 0; k < 4; k++) {
      const geo = placed(blob(1, 1), { sx: 0.4, sy: 0.1, sz: 2.2 });
      geo.rotateY(r() * 6);
      this.batch.add(placed(geo, { x: x + Math.cos(a) * (L + 1), y: y + 0.25, z: z + Math.sin(a) * (L + 1) }), '#8a8a4a');
    }
  }

  // ---------- sacred elements ----------

  buildChrist(c, dais) {
    const [x, z] = c.at;
    const y = this.daisTop ?? this.height(x, z);
    const parts = pawnParts(2);
    const g = new THREE.Group();
    const add = (geo, color, opts) => {
      const mesh = new THREE.Mesh(geo, clayMaterial(color, opts));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
    };
    const robe = { emissive: c.glow, emissiveIntensity: 0.35, bump: 0.6 };
    add(parts.robe, c.robe, robe);
    add(parts.shawl, c.sash, robe);
    add(parts.head, '#c99a6c', {});
    add(parts.cap, '#5a3d28', {});
    for (const side of [-1, 1]) {
      const arm = capsule(0.085, 0.55, 3, 10);
      arm.translate(0, -0.33, 0);
      arm.rotateZ(side * 0.95);
      arm.rotateX(-0.35);
      arm.translate(side * 0.22, 1.13, 0.05);
      add(arm, c.robe, robe);
      const hand = new THREE.SphereGeometry(0.075, 10, 8);
      hand.translate(side * (0.22 + Math.sin(0.95) * 0.68), 1.13 - Math.cos(0.95) * 0.68 * 0.94, 0.05 + 0.24);
      add(hand, '#d9a878', {});
    }
    g.scale.setScalar(c.scale);
    g.position.set(x, y, z);
    this.root.add(g);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: c.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
    glow.scale.set(6, 6, 1);
    glow.position.set(x, y + 1.1, z);
    this.fx.add(glow);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: c.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.25 }));
    halo.scale.set(14, 14, 1);
    halo.position.copy(glow.position);
    this.fx.add(halo);

    const light = new THREE.PointLight(c.glow, 60, 18, 1.6);
    light.position.set(x, y + 2.5, z + 1);
    this.root.add(light);
    this.updaters.push((t) => {
      const p = 1 + Math.sin(t * 1.4) * 0.05;
      glow.scale.set(6 * p, 6 * p, 1);
    });
    this.christ = { x, y, z, height: 1.7 * c.scale };
  }

  buildShaft(s) {
    const [x, z] = s.at;
    const y0 = this.height(x, z);
    const H = s.top - y0;
    const geo = new THREE.CylinderGeometry(s.radius[1], s.radius[0], H, 48, 1, true);
    geo.translate(0, H / 2, 0);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
      uniforms: { color: { value: new THREE.Color(s.color) }, opacity: { value: s.opacity }, H: { value: H }, uTime: clayUniforms.uTime },
      vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV; varying float vA;
        uniform float H;
        void main(){ vY = position.y / H; vA = atan(position.x, position.z);
          vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 color; uniform float opacity; uniform float uTime; varying float vY; varying vec3 vN; varying vec3 vV; varying float vA;
        void main(){
          float edge = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 2.0);
          float fade = smoothstep(0.0, 0.08, vY) * (1.0 - smoothstep(0.55, 1.0, vY));
          float streak = 0.75 + 0.25 * sin(vA * 7.0 + uTime * 0.4) * sin(vA * 13.0 - uTime * 0.3);
          gl_FragColor = vec4(color * edge * fade * streak * opacity, 1.0);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y0, z);
    this.fx.add(mesh);
  }

  buildRing(rg) {
    const [x, z] = rg.at;
    const inner = rg.radius - rg.width * 2, outer = rg.radius + rg.width * 2;
    const geo = new THREE.RingGeometry(inner, outer, 96, 1);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      uniforms: { color: { value: new THREE.Color(rg.color) }, R: { value: rg.radius }, W: { value: rg.width }, uTime: clayUniforms.uTime },
      vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 color; uniform float R, W, uTime; varying vec2 vP;
        void main(){ float d = (length(vP) - R) / W; float a = exp(-d*d*1.5) * (0.85 + 0.15 * sin(uTime * 1.5 + atan(vP.x, vP.y) * 5.0));
          gl_FragColor = vec4(color * a * 1.5, 1.0); }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, this.height(x, z) + 0.08, z);
    this.fx.add(mesh);

    // a low glowing wall of light rising from the ring
    const wall = new THREE.CylinderGeometry(rg.radius, rg.radius, 2.2, 96, 1, true);
    wall.translate(0, 1.1, 0);
    const wmat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: { color: { value: new THREE.Color(rg.color) }, uTime: clayUniforms.uTime },
      vertexShader: `varying float vY; varying float vA; void main(){ vY = position.y / 2.2; vA = atan(position.x, position.z); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 color; uniform float uTime; varying float vY; varying float vA;
        void main(){ float a = pow(clamp(1.0 - vY, 0.0, 1.0), 2.5) * (0.6 + 0.4 * sin(vA * 9.0 + uTime)); gl_FragColor = vec4(color * a * 0.6, 1.0); }`,
    });
    const wm = new THREE.Mesh(wall, wmat);
    wm.position.copy(mesh.position);
    this.fx.add(wm);
  }
}
