import * as THREE from 'three';
import { rng } from './util.js';

let haloTexture;
function getHaloTexture() {
  if (haloTexture) return haloTexture;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  haloTexture = new THREE.CanvasTexture(canvas);
  haloTexture.colorSpace = THREE.SRGBColorSpace;
  return haloTexture;
}

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false };

export function createEffects(scene) {
  const updaters = [];
  const time = { value: 0 };

  const api = {
    update(t, dt) {
      time.value = t;
      for (const fn of updaters) fn(t, dt);
    },

    halo({ position, size = 6, color = '#fff6dc', opacity = 0.8 }) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: getHaloTexture(), color, opacity, ...additive }));
      sprite.position.set(...position);
      sprite.scale.set(size, size, 1);
      scene.add(sprite);
      updaters.push((t) => sprite.material.opacity = opacity * (0.9 + 0.1 * Math.sin(t * 1.3)));
      return sprite;
    },

    // Soft column of light descending from the sky.
    beam({ position, height = 140, radiusBottom = 3, radiusTop = 9, color = '#fff2cf', opacity = 0.5 }) {
      const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32, 1, true);
      geo.translate(0, height / 2, 0);
      const mat = new THREE.ShaderMaterial({
        ...additive,
        side: THREE.DoubleSide,
        uniforms: { uTime: time, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
        vertexShader: `
          varying vec2 vUv; varying vec3 vN; varying vec3 vView; varying float vDist;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            vDist = length(mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float uTime; uniform vec3 uColor; uniform float uOpacity;
          varying vec2 vUv; varying vec3 vN; varying vec3 vView; varying float vDist;
          void main() {
            float near = smoothstep(3.0, 30.0, vDist);
            float edge = pow(abs(dot(normalize(vN), normalize(vView))), 2.0);
            float vertical = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y));
            float streaks = 0.7 + 0.3 * sin(vUv.x * 50.0 + uTime * 0.6) * sin(vUv.x * 23.0 - uTime * 0.4);
            gl_FragColor = vec4(uColor * edge * vertical * streaks * near * uOpacity, 1.0);
          }`,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...position);
      mesh.renderOrder = 10;
      scene.add(mesh);
      return mesh;
    },

    // Flat glowing ring on the ground, e.g. light encircling the children.
    ring({ position, radius = 3, width = 1.2, color = '#ffe3a0', opacity = 0.8 }) {
      const geo = new THREE.RingGeometry(Math.max(0.01, radius - width), radius + width, 64, 1);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.ShaderMaterial({
        ...additive,
        side: THREE.DoubleSide,
        uniforms: { uTime: time, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uR: { value: radius }, uW: { value: width } },
        vertexShader: `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform float uTime; uniform vec3 uColor; uniform float uOpacity; uniform float uR; uniform float uW;
          varying vec3 vP;
          void main() {
            float d = abs(length(vP.xz) - uR) / uW;
            float a = pow(max(0.0, 1.0 - d), 2.0) * (0.8 + 0.2 * sin(uTime * 1.5));
            gl_FragColor = vec4(uColor * a * uOpacity, 1.0);
          }`,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...position);
      scene.add(mesh);
      return mesh;
    },

    // Motes of light drifting down inside a cylinder.
    motes({ position, radius = 4, height = 30, count = 200, color = '#fff4d6', size = 0.06, seed = 5 }) {
      const rand = rng(seed);
      const mesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(size, 0), new THREE.MeshBasicMaterial({ color, ...additive }), count);
      const seeds = Array.from({ length: count }, () => [rand() * Math.PI * 2, Math.sqrt(rand()) * radius, rand(), rand.range(0.02, 0.06)]);
      const m = new THREE.Matrix4();
      updaters.push((t) => {
        seeds.forEach(([a, r, off, speed], i) => {
          const f = (off - t * speed + 10) % 1;
          m.makeTranslation(position[0] + Math.cos(a + t * 0.1) * r, position[1] + f * height, position[2] + Math.sin(a + t * 0.1) * r);
          mesh.setMatrixAt(i, m);
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
      mesh.frustumCulled = false;
      scene.add(mesh);
      return mesh;
    },

    // Rising low-poly smoke puffs from a smoldering spot.
    smoke({ position, count = 14, height = 14, size = 1.2, color = '#8f8580', wind = [0.5, 0.15], seed = 3 }) {
      const rand = rng(seed);
      const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.35, transparent: true, opacity: 0.32, depthWrite: false, flatShading: true });
      const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat, count * 2);
      const seeds = Array.from({ length: count * 2 }, (_, i) => [i / (count * 2), rand.range(0.7, 1.1), rand() * 6, rand.range(-1, 1) * size]);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
      updaters.push((t) => {
        seeds.forEach(([off, k, spin, jx], i) => {
          const f = (off + t * 0.045 * k) % 1;
          p.set(position[0] + jx * (1 + f * 2) + wind[0] * f * f * height, position[1] + f * height, position[2] + jx * f + wind[1] * f * f * height);
          const sc = size * (0.6 + f * 4) * Math.sin(Math.min(1, f * 1.05) * Math.PI) ** 0.4;
          s.set(sc, sc * 0.8, sc);
          q.setFromEuler(e.set(spin + t * 0.1, spin, 0));
          mesh.setMatrixAt(i, m.compose(p, q, s));
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
      mesh.frustumCulled = false;
      scene.add(mesh);
      return mesh;
    },

    // Long faint shafts of sunlight slanting through gaps in the clouds.
    sunShafts({ center = [0, 0], sunDir, count = 6, spread = 120, length = 400, width = [8, 22], color = '#ffd9a0', opacity = 0.08, seed = 9 }) {
      const rand = rng(seed);
      const dir = new THREE.Vector3(...sunDir).normalize();
      const mat = new THREE.ShaderMaterial({
        ...additive,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: time },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uOpacity; uniform float uTime; varying vec2 vUv;
          void main() {
            float across = sin(vUv.x * 3.14159);
            float along = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
            gl_FragColor = vec4(uColor * across * across * along * uOpacity * (0.85 + 0.15 * sin(uTime * 0.3 + vUv.y * 4.0)), 1.0);
          }`,
      });
      for (let i = 0; i < count; i++) {
        const geo = new THREE.PlaneGeometry(rand.range(width[0], width[1]), length);
        geo.translate(0, length / 2, 0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(center[0] + rand.range(-spread, spread), -5, center[1] + rand.range(-spread, spread));
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        mesh.rotateY(rand() * Math.PI);
        mesh.renderOrder = 9;
        scene.add(mesh);
      }
    },
  };
  return api;
}
