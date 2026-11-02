import * as THREE from 'three';

// Faceted ocean whose waves are displaced on the GPU. Flat shading derives normals from the displaced surface.
export function ocean(ctx, { level = 0, size = 1400, segments = 200, center = [0, 0], color = '#2f7d8f', deep = '#1b4b62', crest = '#d8eef0', amp = 0.3, freq = 0.06, speed = 0.8, chop = 0.5, opacity = 1 } = {}) {
  const { THREE: T, scene } = ctx;
  const geo = new T.PlaneGeometry(size, size, segments, segments).rotateX(-Math.PI / 2);
  const mat = new T.MeshLambertMaterial({ color: '#ffffff', flatShading: true, transparent: opacity < 1, opacity });
  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: amp },
    uFreq: { value: freq },
    uChop: { value: chop },
    uShallow: { value: new T.Color(color) },
    uDeep: { value: new T.Color(deep) },
    uCrest: { value: new T.Color(crest) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime, uAmp, uFreq, uChop;\nvarying float vWave;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
        float t = uTime;
        float h = sin(wp.x * uFreq + t * 1.1) * 0.5
          + sin(wp.z * uFreq * 1.3 - t * 0.9 + wp.x * uFreq * 0.4) * 0.35
          + sin((wp.x + wp.z) * uFreq * 2.7 + t * 1.7) * 0.18 * uChop
          + sin((wp.x - wp.z) * uFreq * 4.1 - t * 2.3) * 0.1 * uChop;
        transformed.y += h * uAmp;
        vWave = h;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uShallow, uDeep, uCrest;\nvarying float vWave;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec3 sea = mix(uDeep, uShallow, smoothstep(-0.8, 0.6, vWave));
        sea = mix(sea, uCrest, smoothstep(0.62, 0.95, vWave) * 0.75);
        diffuseColor.rgb = sea;`,
      );
  };
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(center[0], level, center[1]);
  mesh.receiveShadow = true;
  scene.add(mesh);
  ctx.onFrame((t) => (uniforms.uTime.value = t * speed));
  return { mesh, uniforms, heightAt: (x, z, t) => level + waveHeight(x, z, t * speed, freq, chop) * amp };
}

export function waveHeight(x, z, t, f, chop) {
  return Math.sin(x * f + t * 1.1) * 0.5
    + Math.sin(z * f * 1.3 - t * 0.9 + x * f * 0.4) * 0.35
    + Math.sin((x + z) * f * 2.7 + t * 1.7) * 0.18 * chop
    + Math.sin((x - z) * f * 4.1 - t * 2.3) * 0.1 * chop;
}

// Invisible walls over every patch of ground lower than `level`, so the walker stays on land.
export function blockWater(ctx, { level = 0, area, step = 3, margin = 0.2 }) {
  const [x0, z0, x1, z1] = area;
  for (let x = x0; x <= x1; x += step) {
    for (let z = z0; z <= z1; z += step) {
      if (ctx.heightAt(x, z) < level - margin) ctx.colliders.add({ x, z, w: step, d: step, bottom: -50, top: 60 });
    }
  }
}

// White foam line where the waves meet the beach.
export function surf(ctx, { level = 0, area, step = 2, color = '#eef6f2' }) {
  const [x0, z0, x1, z1] = area;
  const { THREE: T } = ctx;
  for (let x = x0; x <= x1; x += step) {
    for (let z = z0; z <= z1; z += step) {
      const h = ctx.heightAt(x, z);
      if (h > level - 0.25 && h < level + 0.12 && ctx.rand() < 0.7) {
        const g = new T.CircleGeometry(ctx.rand.range(0.6, 1.4), 5).rotateX(-Math.PI / 2);
        ctx.solid.add(g, { position: [x + ctx.rand.range(-1, 1), level + 0.12, z + ctx.rand.range(-1, 1)], scale: [1.6, 1, 0.6], rotation: [0, ctx.rand() * 3, 0], color, jitter: 0.03 });
      }
    }
  }
}

// Rain streaks that follow the camera. Positions wrap in a box, moved entirely in the vertex shader.
export function rain(ctx, { count = 5000, box = 60, height = 30, speed = 26, slant = [6, 2], color = '#b8c4d0', opacity = 0.55 } = {}) {
  const { THREE: T, scene } = ctx;
  const pos = new Float32Array(count * 6);
  const seed = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = (ctx.rand() - 0.5) * box, y = ctx.rand() * height, z = (ctx.rand() - 0.5) * box;
    pos.set([x, y, z, x, y, z], i * 6);
    seed.set([0, 1], i * 2);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  geo.setAttribute('tail', new T.BufferAttribute(seed, 1));
  const uniforms = { uTime: { value: 0 }, uCam: { value: new T.Vector3() }, uColor: { value: new T.Color(color) }, uOpacity: { value: opacity } };
  const mat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms,
    vertexShader: `
      uniform float uTime; uniform vec3 uCam; attribute float tail; varying float vA;
      void main() {
        float H = ${height.toFixed(1)}, B = ${box.toFixed(1)};
        float y = mod(position.y - uTime * ${speed.toFixed(1)}, H);
        vec3 p = vec3(position.x + ${slant[0].toFixed(2)} * y / H, y, position.z + ${slant[1].toFixed(2)} * y / H);
        p.xz = uCam.xz + mod(p.xz - uCam.xz + B * 0.5, B) - B * 0.5;
        p.y += uCam.y - H * 0.5;
        p += tail * vec3(${(slant[0] * 0.03).toFixed(3)}, 0.9, ${(slant[1] * 0.03).toFixed(3)});
        vA = 1.0 - smoothstep(B * 0.25, B * 0.5, distance(p.xz, uCam.xz));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vA; void main() { gl_FragColor = vec4(uColor, uOpacity * vA); }`,
  });
  const lines = new T.LineSegments(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 20;
  scene.add(lines);
  ctx.onFrame((t, dt, camera) => {
    uniforms.uTime.value = t;
    uniforms.uCam.value.copy(camera.position);
  });
  return lines;
}

// Random lightning: a jagged bolt far off, a flash of the sky lights and fog.
export function lightning(ctx, { every = [3, 8], distance = [160, 320], color = '#dfe8ff', fogFlash = '#7d86a0' } = {}) {
  const { THREE: T, scene, rand } = ctx;
  const hemi = scene.children.find((o) => o.isHemisphereLight);
  const sun = scene.children.find((o) => o.isDirectionalLight);
  const baseHemi = hemi?.intensity ?? 1, baseSun = sun?.intensity ?? 1;
  const baseFog = scene.fog.color.clone(), flashFog = new T.Color(fogFlash);
  const mat = new T.MeshBasicMaterial({ color, toneMapped: false, fog: false, transparent: true, opacity: 0 });
  const bolt = new T.Group();
  scene.add(bolt);
  let next = rand.range(1, 3), flashStart = -10;
  const makeBolt = (x, z) => {
    bolt.clear();
    let p = new T.Vector3(x, 160, z);
    const parts = [];
    while (p.y > 0) {
      const q = p.clone().add(new T.Vector3(rand.range(-9, 9), -rand.range(10, 22), rand.range(-9, 9)));
      parts.push([p, q]);
      if (rand() < 0.25) parts.push([q, q.clone().add(new T.Vector3(rand.range(-14, 14), -rand.range(8, 16), rand.range(-14, 14)))]);
      p = q;
    }
    for (const [a, b] of parts) {
      const len = a.distanceTo(b);
      const m = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, len, 4), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      bolt.add(m);
    }
  };
  ctx.onFrame((t, dt, camera) => {
    if (t > next) {
      const a = rand() * Math.PI * 2, d = rand.range(distance[0], distance[1]);
      makeBolt(camera.position.x + Math.cos(a) * d, camera.position.z + Math.sin(a) * d);
      flashStart = t;
      next = t + rand.range(every[0], every[1]);
    }
    const k = t - flashStart;
    const f = k < 0.5 ? Math.max(0, 1 - k / 0.5) * (0.6 + 0.4 * Math.sin(k * 60)) : 0;
    mat.opacity = f > 0.05 ? Math.min(1, f * 1.5) : 0;
    bolt.visible = f > 0.05;
    if (hemi) hemi.intensity = baseHemi * (1 + f * 3);
    if (sun) sun.intensity = baseSun * (1 + f * 2);
    scene.fog.color.copy(baseFog).lerp(flashFog, f * 0.8);
  });
}
