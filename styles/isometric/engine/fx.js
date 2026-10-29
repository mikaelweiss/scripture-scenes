import * as THREE from 'three';
import { rng, canvasTexture, glowTexture, Batch, pick, shade, range, composeMatrix } from './util.js';

export function skyTexture(sky) {
  const tex = canvasTexture(1024, 1024, (g, w, h) => {
    const r = rng(sky.seed ?? 5);
    const grad = g.createLinearGradient(0, 0, 0, h);
    for (const [stop, c] of sky.gradient) grad.addColorStop(stop, c);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    const [sx, sy] = sky.sun;
    const sun = g.createRadialGradient(sx * w, sy * h, 0, sx * w, sy * h, w * 0.7);
    sun.addColorStop(0, sky.sunColor);
    sun.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, w, h);

    g.filter = 'blur(18px)';
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = Math.pow(r(), 1.6) * h * 0.55, rx = 80 + r() * 220;
      const lit = Math.hypot(x - sx * w, y - sy * h) < w * 0.35;
      g.fillStyle = lit ? sky.litCloud : sky.darkCloud;
      g.beginPath();
      g.ellipse(x, y, rx, rx * (0.18 + r() * 0.15), 0, 0, Math.PI * 2);
      g.fill();
    }
    g.filter = 'blur(6px)';
    g.fillStyle = sky.rayColor;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.25 + r() * 0.5), spread = 0.02 + r() * 0.05, L = w * 1.4;
      g.beginPath();
      g.moveTo(sx * w, sy * h);
      g.lineTo(sx * w + Math.cos(a - spread) * L, sy * h + Math.sin(a - spread) * L);
      g.lineTo(sx * w + Math.cos(a + spread) * L, sy * h + Math.sin(a + spread) * L);
      g.fill();
    }
  });
  return tex;
}

// Low-poly cloud clusters drifting in a ring around the island.
export function clouds(spec, islandRadius) {
  const r = rng(spec.seed ?? 11);
  const batch = new Batch(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), { shadows: false });
  for (let c = 0; c < spec.count; c++) {
    const a = r() * Math.PI * 2, d = islandRadius + range(r, spec.distance), y = range(r, spec.height);
    const col = pick(r, spec.colors), puffs = 4 + Math.floor(r() * 5), size = range(r, spec.size);
    for (let p = 0; p < puffs; p++) {
      const s = size * (0.5 + r() * 0.6);
      batch.add(Math.cos(a) * d + (r() - 0.5) * size * 3, y + r() * size * 0.4, Math.sin(a) * d + (r() - 0.5) * size * 3, s * 1.4, s * 0.8, s * 1.2, shade(col, r, 0.1), 0, r() * 3, 0);
    }
  }
  const mesh = batch.build();
  return { object: mesh, update: (t) => { mesh.rotation.y = t * (spec.drift ?? 0.004); } };
}

const beamShader = {
  vertexShader: `
    varying vec2 vUv; varying vec3 vN; varying vec3 vView;
    void main() {
      vUv = uv;
      vN = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    uniform vec3 uColor; uniform float uTime; uniform float uStrength;
    varying vec2 vUv; varying vec3 vN; varying vec3 vView;
    void main() {
      float face = pow(abs(dot(normalize(vN), vec3(0.0, 0.0, 1.0))), 1.6);
      float fade = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
      float streak = 0.75 + 0.25 * sin(vUv.x * 40.0 + uTime * 0.6) * sin(vUv.y * 9.0 - uTime * 1.5);
      gl_FragColor = vec4(uColor * face * fade * streak * uStrength, 1.0);
    }`,
};

function additive(map, opacity = 1, c = '#ffffff') {
  return new THREE.MeshBasicMaterial({ map, color: c, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

// Light descending on a figure: a column from the sky, a halo, a pool of light, and a warm point light.
export function holyLight(spec, x, y, z, uniforms) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const b = spec.beam;
  const beamGeo = new THREE.CylinderGeometry(b.topRadius, b.radius, b.height, 40, 1, true).translate(0, b.height / 2, 0);
  const beam = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
    ...beamShader,
    uniforms: { uColor: { value: new THREE.Color(b.color) }, uTime: uniforms.uTime, uStrength: { value: b.strength ?? 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
  group.add(beam);

  const glow = glowTexture('rgba(255,248,225,1)');
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: spec.haloColor, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(spec.haloSize);
  halo.position.y = spec.haloHeight;
  group.add(halo);

  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), additive(glow, spec.poolOpacity ?? 0.6, spec.haloColor));
  pool.scale.setScalar(spec.poolSize);
  pool.position.y = 0.03;
  group.add(pool);

  const light = new THREE.PointLight(spec.lightColor, spec.lightIntensity, spec.lightDistance, 1.6);
  light.position.y = 1.6;
  group.add(light);

  return { object: group, update: (t) => { halo.material.opacity = 0.85 + 0.15 * Math.sin(t * 1.7); } };
}

// A soft ring of light on the ground with motes of light rising from it.
export function lightRing(spec, x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y + 0.04, z);
  const ringTex = canvasTexture(256, 256, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    const inner = spec.radius / (spec.radius + spec.width);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(Math.max(0, inner - 0.25), 'rgba(255,255,255,0.05)');
    grad.addColorStop(inner, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, w);
  });
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), additive(ringTex, spec.opacity ?? 0.9, spec.color));
  ring.scale.setScalar((spec.radius + spec.width) * 2);
  group.add(ring);

  const r = rng(3), n = spec.motes ?? 40;
  const motes = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.06, 0), new THREE.MeshBasicMaterial({ color: spec.moteColor ?? '#fff6d8' }), n);
  motes.frustumCulled = false;
  const seeds = Array.from({ length: n }, () => ({ a: r() * Math.PI * 2, o: r(), d: spec.radius + (r() - 0.5) * spec.width * 1.4 }));
  group.add(motes);
  const m = new THREE.Matrix4();
  return {
    object: group,
    update: (t) => {
      seeds.forEach((s, i) => {
        const life = (t * 0.18 + s.o) % 1, a = s.a + t * 0.12;
        const sc = Math.sin(life * Math.PI);
        motes.setMatrixAt(i, composeMatrix(m, Math.sin(a) * s.d, life * 3.2, Math.cos(a) * s.d, sc, sc * 1.6, sc, 0, t + i, 0));
      });
      motes.instanceMatrix.needsUpdate = true;
    },
  };
}

// Rising low-poly smoke puffs above smoldering spots.
export function smoke(fires, spec) {
  const per = spec.puffs ?? 7, r = rng(9);
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true, transparent: true, opacity: spec.opacity ?? 0.75 }), Math.max(1, fires.length * per));
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  const puffs = [];
  fires.forEach((f) => {
    for (let i = 0; i < per; i++) {
      puffs.push({ f, o: i / per + r() * 0.1, spin: r() * 3 });
      mesh.setColorAt(puffs.length - 1, shade(pick(r, spec.colors), r, 0.15));
    }
  });
  const m = new THREE.Matrix4(), [wx, wz] = spec.wind ?? [0.6, 0.3];
  return {
    object: mesh,
    update: (t) => {
      puffs.forEach((p, i) => {
        const life = (t * (spec.speed ?? 0.12) + p.o) % 1, f = p.f;
        const s = (spec.size ?? 1) * (0.18 + life * 0.55) * Math.sin(Math.min(1, life * 1.4) * Math.PI * 0.5 + 0.2) * (1 - life * 0.6) * f.size;
        const h = life * (spec.height ?? 4) * f.size;
        mesh.setMatrixAt(i, composeMatrix(m, f.x + wx * h * 0.5, f.y + 0.4 + h, f.z + wz * h * 0.5, s, s * 0.85, s, p.spin + t * 0.3, p.spin, 0));
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
