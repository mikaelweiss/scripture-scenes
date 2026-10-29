import * as THREE from 'three';
import { rng, fbm2, hash3 } from './noise.js';

export function createSky(o, sunDir) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      zenith: { value: new THREE.Color(o.zenith) },
      horizon: { value: new THREE.Color(o.horizon) },
      glow: { value: new THREE.Color(o.glow) },
      below: { value: new THREE.Color(o.below ?? o.horizon) },
      sunDir: { value: sunDir.clone().normalize() },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 zenith, horizon, glow, below, sunDir; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = d.y;
        vec3 c = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.55));
        c = mix(c, below, smoothstep(0.0, -0.15, h));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += glow * (pow(s, 6.0) * 0.6 + pow(s, 60.0) * 0.8 + pow(s, 800.0) * 4.0);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

// A layer of blocky storm clouds with an opening where the light comes through.
export function createClouds(o) {
  const rand = rng(o.seed ?? 4);
  const n = Math.round(o.extent / o.cell);
  const solid = new Uint8Array(n * n);
  const at = (i, j) => (i < 0 || j < 0 || i >= n || j >= n ? 0 : solid[j * n + i]);
  const toWorld = (i) => (i - n / 2) * o.cell;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = toWorld(i), z = toWorld(j);
    let v = fbm2(x / o.scale, z / o.scale, 4, o.seed ?? 4);
    for (const hole of o.holes) {
      const d = Math.hypot(x - hole.x, z - hole.z) / hole.r;
      if (d < 1.6) v -= (1.6 - d) * 0.35;
    }
    solid[j * n + i] = v > o.cover ? 1 : 0;
  }
  const pos = [], col = [], idx = [];
  const top = new THREE.Color(o.top), bottom = new THREE.Color(o.bottom), rim = new THREE.Color(o.rim), far = new THREE.Color(o.far);
  const c = new THREE.Color();
  const quad = (pts, color) => {
    const s = pos.length / 3;
    for (const p of pts) { pos.push(...p); col.push(color.r, color.g, color.b); }
    idx.push(s, s + 1, s + 2, s, s + 2, s + 3);
  };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    if (!solid[j * n + i]) continue;
    const x0 = toWorld(i), x1 = x0 + o.cell, z0 = toWorld(j), z1 = z0 + o.cell;
    const y0 = o.height, y1 = y0 + o.thickness * (0.6 + 0.8 * hash3(i, 9, j));
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    let nearHole = 0;
    for (const hole of o.holes) nearHole = Math.max(nearHole, 1 - Math.min(1, (Math.hypot(cx - hole.x, cz - hole.z) - hole.r * 0.6) / (hole.r * 1.4)));
    const fade = Math.min(1, Math.hypot(cx, cz) / (o.extent * 0.5));
    const shade = (base, k = 1) => c.copy(base).multiplyScalar(k).lerp(rim, nearHole * 0.8).lerp(far, fade * fade * 0.85).clone();
    const b = shade(bottom, 0.96 + hash3(i, 1, j) * 0.08);
    quad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], b);
    quad([[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], shade(top));
    const side = shade(bottom, 1.15);
    if (!at(i - 1, j)) quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], side);
    if (!at(i + 1, j)) quad([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], side);
    if (!at(i, j - 1)) quad([[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], side);
    if (!at(i, j + 1)) quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], side);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide }));
  mesh.userData.update = (dt) => { mesh.position.x += dt * (o.drift ?? 0.4); if (mesh.position.x > o.cell) mesh.position.x -= o.cell; };
  return mesh;
}

// Square shafts of light, soft at the edges and faded at both ends.
export function createBeam(o) {
  const group = new THREE.Group();
  const mat = (strength) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { color: { value: new THREE.Color(o.color) }, strength: { value: strength }, time: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying float vDist; void main(){ vUv = uv; vec4 p = modelViewMatrix * vec4(position,1.0); vDist = -p.z; gl_Position = projectionMatrix * p; }`,
    fragmentShader: `uniform vec3 color; uniform float strength, time; varying vec2 vUv; varying float vDist;
      void main(){ float edge = sin(fract(vUv.x * 4.0) * 3.14159);
        float v = smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
        float shimmer = 0.85 + 0.15 * sin(vUv.y * 40.0 - time * 1.5 + vUv.x * 25.0);
        gl_FragColor = vec4(color * edge * edge * v * strength * shimmer * smoothstep(3.0, 18.0, vDist), 1.0); }`,
  });
  for (const layer of o.layers) {
    const geo = new THREE.CylinderGeometry(layer.top, layer.bottom, o.height, 4, 1, true);
    geo.rotateY(Math.PI / 4);
    geo.translate(0, o.height / 2, 0);
    const m = new THREE.Mesh(geo, mat(layer.strength));
    m.userData.spin = layer.spin ?? 0;
    group.add(m);
  }
  group.position.set(o.x, o.y, o.z);
  group.userData.update = (dt, t) => group.children.forEach((m) => {
    m.material.uniforms.time.value = t;
    m.rotation.y += m.userData.spin * dt;
  });
  return group;
}

// Little glowing cubes drifting down the shaft of light.
export function createMotes(o) {
  const rand = rng(o.seed ?? 12);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(o.size, o.size, o.size), new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color).multiplyScalar(o.intensity ?? 3), fog: false }), o.count);
  const motes = Array.from({ length: o.count }, () => ({
    a: rand() * Math.PI * 2, r: Math.sqrt(rand()) * o.radius, y: rand() * o.height, speed: 0.3 + rand() * 0.8, spin: rand() * 3,
  }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  mesh.frustumCulled = false;
  mesh.userData.update = (dt, t) => {
    motes.forEach((p, i) => {
      p.y -= p.speed * dt;
      if (p.y < 0) p.y += o.height;
      const k = Math.min(1, p.y / 2) * Math.min(1, (o.height - p.y) / 6);
      v.set(o.x + Math.cos(p.a + t * 0.1) * p.r, o.y + p.y, o.z + Math.sin(p.a + t * 0.1) * p.r);
      q.setFromEuler(e.set(t * p.spin, t * p.spin * 0.7, 0));
      mesh.setMatrixAt(i, m.compose(v, q, s.setScalar(k)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  return mesh;
}

function radialTexture(stops) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createHalo(o) {
  const mat = new THREE.SpriteMaterial({
    map: radialTexture([[0, 'rgba(255,250,235,1)'], [0.25, 'rgba(255,236,190,0.55)'], [1, 'rgba(255,220,160,0)']]),
    color: new THREE.Color(o.color).multiplyScalar(o.intensity ?? 1),
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(o.size);
  s.position.set(o.x, o.y, o.z);
  const base = mat.color.clone();
  s.userData.update = (dt, t, camera) => {
    s.scale.setScalar(o.size * (1 + 0.04 * Math.sin(t * 1.3)));
    const near = Math.min(1, Math.max(0, (camera.position.distanceTo(s.position) - 4) / 16));
    mat.color.copy(base).multiplyScalar(0.25 + 0.75 * near);
  };
  return s;
}

// A ring of glowing cubes on the ground plus a soft glow disc beneath it.
export function createLightRing(o) {
  const group = new THREE.Group();
  const cube = new THREE.InstancedMesh(new THREE.BoxGeometry(o.cube, o.cube, o.cube),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color).multiplyScalar(o.intensity ?? 3) }), o.count);
  group.add(cube);
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(o.r * 2.8, o.r * 2.8), new THREE.MeshBasicMaterial({
    map: radialTexture([[0, 'rgba(255,240,200,0.0)'], [0.55, 'rgba(255,236,190,0.25)'], [0.72, 'rgba(255,230,170,0.6)'], [0.85, 'rgba(255,220,160,0)']]),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.03;
  group.add(disc);
  group.position.set(o.x, o.y, o.z);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), e = new THREE.Euler();
  group.userData.update = (dt, t) => {
    for (let i = 0; i < o.count; i++) {
      const a = (i / o.count) * Math.PI * 2 + t * 0.15;
      v.set(Math.sin(a) * o.r, o.cube * 0.5 + 0.12 + 0.1 * Math.sin(t * 2 + i), Math.cos(a) * o.r);
      q.setFromEuler(e.set(0, -a, 0));
      cube.setMatrixAt(i, m.compose(v, q, s));
    }
    cube.instanceMatrix.needsUpdate = true;
  };
  return group;
}

// Rising, swelling, fading cubes of smoke above each smoldering spot.
export function createSmoke(emitters, o) {
  const per = o.perEmitter;
  const count = emitters.length * per;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: o.color, transparent: true, opacity: o.opacity, depthWrite: false }), Math.max(1, count));
  const rand = rng(77);
  const parts = [];
  emitters.forEach((em) => {
    for (let i = 0; i < per; i++) parts.push({ em, age: rand() * o.life, life: o.life * (0.7 + rand() * 0.6), dx: 0, dz: 0, rot: rand() * 3 });
  });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  mesh.frustumCulled = false;
  mesh.userData.update = (dt) => {
    parts.forEach((p, i) => {
      p.age += dt * p.em.rate;
      if (p.age > p.life) { p.age = 0; p.dx = (rand() - 0.5) * 0.6; p.dz = (rand() - 0.5) * 0.6; }
      const k = p.age / p.life;
      v.set(p.em.x + p.dx + k * o.wind[0] * p.life, p.em.y + k * o.rise, p.em.z + p.dz + k * o.wind[1] * p.life);
      q.setFromEuler(e.set(p.rot + k, p.rot * 2 + k * 0.5, 0));
      const size = o.size * (0.3 + k * 1.6) * Math.min(1, (1 - k) * 3);
      mesh.setMatrixAt(i, m.compose(v, q, s.setScalar(size)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  return mesh;
}
