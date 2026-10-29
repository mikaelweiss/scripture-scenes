import * as THREE from 'three';

// Uniform objects shared by every material, so one write per frame updates them all.
export function createShared() {
  return {
    uTime: { value: 0 },
    uCamPos: { value: new THREE.Vector3() },
    uSnapRes: { value: new THREE.Vector2(160, 90) },
    uAffine: { value: 0.65 },
    uFogColor: { value: new THREE.Color() },
    uFogDensity: { value: 0.006 },
    uLightDir: { value: new THREE.Vector3(0, 1, 0) },
    uLightColor: { value: new THREE.Color(1, 1, 1) },
    uSkyAmb: { value: new THREE.Color(0.5, 0.5, 0.5) },
    uGroundAmb: { value: new THREE.Color(0.3, 0.3, 0.3) },
    uGlowPos: { value: new THREE.Vector4(0, -1000, 0, 1) },
    uGlowColor: { value: new THREE.Color(0, 0, 0) },
  };
}

const commonVert = /* glsl */ `
  uniform vec2 uSnapRes;
  uniform vec3 uLightDir, uLightColor, uSkyAmb, uGroundAmb, uGlowColor;
  uniform vec4 uGlowPos;
  vec4 snapVertex(vec4 cp) {
    if (cp.w > 0.05) cp.xy = floor(cp.xy / cp.w * uSnapRes + 0.5) / uSnapRes * cp.w;
    return cp;
  }
  vec3 glowAt(vec3 wp) {
    float d = distance(wp, uGlowPos.xyz) / uGlowPos.w;
    return uGlowColor * clamp(1.0 - d, 0.0, 1.0) * clamp(1.0 - d, 0.0, 1.0);
  }
`;

const fogFrag = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  vec3 applyFog(vec3 c, float depth) {
    float f = 1.0 - exp(-pow(depth * uFogDensity, 2.0));
    return mix(c, uFogColor, f);
  }
`;

const bayer = /* glsl */ `
  float bayer4(vec2 p) {
    ivec2 i = ivec2(mod(p, 4.0));
    int idx = i.x + i.y * 4;
    int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
    return (float(m[idx]) + 0.5) / 16.0;
  }
`;

// Gouraud-lit, vertex-snapped, affine-textured surface. Works for meshes and InstancedMesh.
export function worldMaterial(shared, map, { emissive = 0, side = THREE.FrontSide } = {}) {
  return new THREE.ShaderMaterial({
    side,
    uniforms: { ...shared, map: { value: map }, uEmissive: { value: emissive } },
    vertexShader: /* glsl */ `
      ${commonVert}
      attribute vec3 aColor;
      varying vec3 vLight, vColor, vAff;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vec4 wp = vec4(position, 1.0);
        vec3 n = normal;
        vColor = aColor;
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          n = mat3(instanceMatrix) * n;
        #endif
        #ifdef USE_INSTANCING_COLOR
          vColor *= instanceColor;
        #endif
        wp = modelMatrix * wp;
        n = normalize(mat3(modelMatrix) * n);
        float sun = max(dot(n, normalize(uLightDir)), 0.0);
        vLight = mix(uGroundAmb, uSkyAmb, n.y * 0.5 + 0.5) + uLightColor * sun + glowAt(wp.xyz);
        vec4 vp = viewMatrix * wp;
        vDepth = length(vp.xyz);
        vec4 cp = snapVertex(projectionMatrix * vp);
        gl_Position = cp;
        vUv = uv;
        vAff = vec3(uv * cp.w, cp.w);
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogFrag}
      uniform sampler2D map;
      uniform float uAffine, uEmissive;
      varying vec3 vLight, vColor, vAff;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vec2 uv = mix(vUv, vAff.xy / vAff.z, uAffine);
        vec3 tex = texture2D(map, uv).rgb;
        vec3 c = tex * vColor * (vLight * (1.0 - uEmissive) + uEmissive * 1.4);
        gl_FragColor = vec4(applyFog(c, vDepth), 1.0);
      }
    `,
  });
}

// Doom-style billboard people. Each instance picks a front / side / back frame from its
// facing and the camera position, then colors the atlas slots with its own palette.
export function crowdMaterial(shared, atlas, { emissive = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uAtlas: { value: atlas.texture },
      uRows: { value: atlas.rows },
      uEmissive: { value: emissive },
    },
    vertexShader: /* glsl */ `
      ${commonVert}
      uniform vec3 uCamPos;
      uniform float uRows, uTime;
      attribute vec3 aOffset, aRobe, aCloak, aSkin, aHair;
      attribute vec2 aScale;
      attribute float aFacing, aRow;
      varying vec2 vAtlasUv;
      varying vec3 vRobe, vCloak, vSkin, vHair, vLight;
      varying float vDepth;
      void main() {
        vec2 toCam = uCamPos.xz - aOffset.xz;
        vec2 tc = normalize(toCam + vec2(1e-4));
        vec3 right = vec3(tc.y, 0.0, -tc.x);
        vec2 face = vec2(sin(aFacing), cos(aFacing));
        float fd = dot(face, tc);
        float col = fd > 0.42 ? 0.0 : (fd < -0.42 ? 2.0 : 1.0);
        float mirror = (col == 1.0 && dot(face, right.xz) < 0.0) ? 1.0 : 0.0;
        float u = mirror > 0.5 ? 1.0 - uv.x : uv.x;
        vAtlasUv = vec2((col + u) / 3.0, 1.0 - (aRow + 1.0 - uv.y) / uRows);

        vec2 sc = aScale * step(0.9, length(toCam));
        vec3 wp = aOffset + right * position.x * sc.x + vec3(0.0, position.y * sc.y, 0.0);
        vec3 lit = mix(uGroundAmb, uSkyAmb, 0.7) + uLightColor * 0.55 + glowAt(wp);
        vLight = lit;
        vRobe = aRobe; vCloak = aCloak; vSkin = aSkin; vHair = aHair;
        vec4 vp = viewMatrix * vec4(wp, 1.0);
        vDepth = length(vp.xyz);
        gl_Position = snapVertex(projectionMatrix * vp);
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogFrag}
      uniform sampler2D uAtlas;
      uniform float uEmissive;
      varying vec2 vAtlasUv;
      varying vec3 vRobe, vCloak, vSkin, vHair, vLight;
      varying float vDepth;
      void main() {
        vec4 t = texture2D(uAtlas, vAtlasUv);
        if (t.a < 0.5) discard;
        float slot = floor(t.g * 3.0 + 0.5);
        vec3 base = slot < 0.5 ? vRobe : slot < 1.5 ? vCloak : slot < 2.5 ? vSkin : vHair;
        vec3 c = base * (t.r * 1.25) * mix(vLight, vec3(1.35), uEmissive);
        gl_FragColor = vec4(applyFog(c, vDepth), 1.0);
      }
    `,
  });
}

// Screen-door transparent blob under each person.
export function shadowMaterial(shared, { opacity = 0.5, color = [0.1, 0.08, 0.06] } = {}) {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: { ...shared, uOpacity: { value: opacity }, uColor: { value: new THREE.Color(...color) } },
    vertexShader: /* glsl */ `
      ${commonVert}
      attribute vec3 aOffset;
      attribute vec2 aScale;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vec3 wp = aOffset + vec3(position.x * aScale.x * 1.4, 0.03, position.y * aScale.x * 1.0);
        vUv = uv;
        vec4 vp = viewMatrix * vec4(wp, 1.0);
        vDepth = length(vp.xyz);
        gl_Position = snapVertex(projectionMatrix * vp);
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogFrag}
      ${bayer}
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = (1.0 - d) * uOpacity * 1.6;
        if (a < bayer4(gl_FragCoord.xy)) discard;
        gl_FragColor = vec4(applyFog(uColor, vDepth), 1.0);
      }
    `,
  });
}

// Looping particles: smoke (dithered alpha) or glow (additive).
export function particleMaterial(shared, map, opts) {
  const { additive = false, colorA, colorB, rise, drift, grow, wind = [0, 0, 0] } = opts;
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      ...shared,
      map: { value: map },
      uColorA: { value: new THREE.Color(...colorA) },
      uColorB: { value: new THREE.Color(...colorB) },
      uRise: { value: rise },
      uDrift: { value: drift },
      uGrow: { value: new THREE.Vector2(...grow) },
      uWind: { value: new THREE.Vector3(...wind) },
      uAdditive: { value: additive ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      ${commonVert}
      uniform float uTime, uRise, uDrift;
      uniform vec2 uGrow;
      uniform vec3 uWind;
      attribute vec3 aOrigin;
      attribute vec3 aParams;
      varying vec2 vUv;
      varying float vLife, vDepth;
      void main() {
        float life = aParams.x, seed = aParams.y, size = aParams.z;
        float t = fract(uTime / life + seed);
        float age = t * life;
        vec3 p = aOrigin + vec3(sin(seed * 41.0 + uTime * 0.7) * uDrift * t, uRise * age, cos(seed * 23.0 + uTime * 0.5) * uDrift * t) + uWind * age;
        float s = size * mix(uGrow.x, uGrow.y, t);
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        p += (right * position.x + up * position.y) * s;
        vUv = uv;
        vLife = t;
        vec4 vp = viewMatrix * vec4(p, 1.0);
        vDepth = length(vp.xyz);
        gl_Position = snapVertex(projectionMatrix * vp);
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogFrag}
      ${bayer}
      uniform sampler2D map;
      uniform vec3 uColorA, uColorB;
      uniform float uAdditive;
      varying vec2 vUv;
      varying float vLife, vDepth;
      void main() {
        float m = texture2D(map, vUv).a * texture2D(map, vUv).r;
        float fade = smoothstep(0.0, 0.12, vLife) * (1.0 - vLife);
        float a = m * fade;
        vec3 c = mix(uColorA, uColorB, vLife);
        if (uAdditive > 0.5) {
          float f = 1.0 - exp(-pow(vDepth * uFogDensity, 2.0));
          gl_FragColor = vec4(c * a * (1.0 - f), 1.0);
          return;
        }
        gl_FragColor = vec4(applyFog(c, vDepth), clamp(a * 0.9, 0.0, 1.0));
      }
    `,
  });
}

// Soft additive column of light. uv.y runs bottom to top.
export function shaftMaterial(shared, { color, intensity, fadeBottom = 0.06, fadeTop = 0.45, bands = 5 }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      ...shared,
      uColor: { value: new THREE.Color(...color) },
      uIntensity: { value: intensity },
      uFade: { value: new THREE.Vector2(fadeBottom, fadeTop) },
      uBands: { value: bands },
    },
    vertexShader: /* glsl */ `
      ${commonVert}
      varying vec2 vUv;
      varying vec3 vN, vView;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - wp.xyz);
        vUv = uv;
        gl_Position = snapVertex(projectionMatrix * viewMatrix * wp);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity, uTime, uBands;
      uniform vec2 uFade;
      varying vec2 vUv;
      varying vec3 vN, vView;
      void main() {
        float edge = pow(abs(dot(normalize(vN), normalize(vView))), 1.6);
        float band = 0.7 + 0.3 * sin(vUv.x * 6.2832 * uBands + uTime * 0.4 + vUv.y * 4.0);
        float a = smoothstep(0.0, uFade.x, vUv.y) * (1.0 - smoothstep(1.0 - uFade.y, 1.0, vUv.y)) * edge * band * uIntensity;
        gl_FragColor = vec4(uColor * a, 1.0);
      }
    `,
  });
}

// Flat additive disc or ring on the ground.
export function ringMaterial(shared, { color, intensity, inner }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    uniforms: { ...shared, uColor: { value: new THREE.Color(...color) }, uIntensity: { value: intensity }, uInner: { value: inner } },
    vertexShader: /* glsl */ `
      ${commonVert}
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = snapVertex(projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity, uInner, uTime;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float ring = exp(-pow((r - uInner) * 2.2, 2.0)) + 0.35 * (1.0 - smoothstep(0.0, 1.0, r / (uInner + 1.5)));
        float pulse = 0.85 + 0.15 * sin(uTime * 1.3);
        gl_FragColor = vec4(uColor * ring * uIntensity * pulse, 1.0);
      }
    `,
  });
}

export function skyMaterial(shared, sky) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTime: shared.uTime,
      uZenith: { value: new THREE.Color(...sky.zenith) },
      uHorizon: { value: new THREE.Color(...sky.horizon) },
      uCloudDark: { value: new THREE.Color(...sky.cloudDark) },
      uCloudLit: { value: new THREE.Color(...sky.cloudLit) },
      uSunColor: { value: new THREE.Color(...sky.sunColor) },
      uSunDir: { value: new THREE.Vector3(...sky.sunDir).normalize() },
      uCover: { value: sky.cover },
      uBreak: { value: sky.breakSize },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith, uHorizon, uCloudDark, uCloudLit, uSunColor, uSunDir;
      uniform float uTime, uCover, uBreak;
      varying vec3 vDir;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; }
        return v;
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        float sun = max(dot(d, uSunDir), 0.0);
        vec3 col = mix(uHorizon, uZenith, smoothstep(0.0, 0.55, h));
        col += uSunColor * (pow(sun, 12.0) * 0.32 + pow(sun, 400.0) * 0.9);

        vec2 p = d.xz / (h + 0.12) * 1.4 + vec2(uTime * 0.006, uTime * 0.002);
        float n = fbm(p);
        float hole = smoothstep(1.0 - uBreak * 1.8, 1.0, sun);
        float cover = smoothstep(0.38, 0.62, n + uCover - 0.5 - hole * 0.55);
        float lit = pow(sun, 7.0);
        vec3 cloud = mix(uCloudDark, uCloudLit, clamp(lit * 1.2 + (n - 0.4) * 0.8, 0.0, 1.0));
        float rim = cover * (1.0 - cover) * 4.0 * pow(sun, 2.0);
        cloud += uSunColor * rim * 0.55;

        vec3 axis = normalize(cross(uSunDir, vec3(0.0, 1.0, 0.0)));
        vec3 up2 = cross(axis, uSunDir);
        float ang = atan(dot(d, up2), dot(d, axis));
        float rays = smoothstep(0.55, 1.0, noise(vec2(ang * 9.0, 0.0) + uTime * 0.02)) * pow(sun, 3.0) * (1.0 - cover);
        col += uSunColor * rays * 0.18;

        col = mix(col, cloud, cover * smoothstep(-0.02, 0.12, h));
        col = mix(col, uHorizon, 1.0 - smoothstep(-0.05, 0.06, h));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

// Upscale pass: 15-bit color with ordered dithering, like PS1 framebuffers.
export function postMaterial(texture, { levels, contrast, saturation }) {
  return new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: { tScene: { value: texture }, uLevels: { value: levels }, uContrast: { value: contrast }, uSat: { value: saturation } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      ${bayer}
      uniform sampler2D tScene;
      uniform float uLevels, uContrast, uSat;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tScene, vUv).rgb;
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        c = mix(vec3(l), c, uSat);
        c = (c - 0.5) * uContrast + 0.5;
        c += (bayer4(gl_FragCoord.xy) - 0.5) / uLevels;
        c = floor(c * uLevels + 0.5) / uLevels;
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }
    `,
  });
}
