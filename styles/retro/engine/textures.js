import * as THREE from 'three';

export function rng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const smooth = (t) => t * t * (3 - 2 * t);

// Tileable value noise sampled in texel space.
function tileNoise(size, period, rand) {
  const g = Array.from({ length: period * period }, rand);
  const at = (x, y) => g[((y % period + period) % period) * period + ((x % period + period) % period)];
  return (x, y) => {
    const fx = (x / size) * period, fy = (y / size) * period;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = smooth(fx - x0), ty = smooth(fy - y0);
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}

function fbm(size, rand, periods) {
  const layers = periods.map((p) => tileNoise(size, p, rand));
  let total = 0;
  const weights = periods.map((_, i) => (total += 1 / (i + 1), 1 / (i + 1)));
  return (x, y) => layers.reduce((s, n, i) => s + n(x, y) * weights[i], 0) / total;
}

function canvasTexture(size, paint, { repeat = true, mips = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 1] = paint(x, y);
      const i = (y * size + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, r * 255));
      img.data[i + 1] = Math.max(0, Math.min(255, g * 255));
      img.data[i + 2] = Math.max(0, Math.min(255, b * 255));
      img.data[i + 3] = Math.max(0, Math.min(255, a * 255));
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = mips ? THREE.NearestMipmapNearestFilter : THREE.NearestFilter;
  tex.generateMipmaps = mips;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const scale = (c, k) => c.map((v) => v * k);

// Rows of blocks with per-row random joints. Used for cut stone, flagstone, adobe.
function masonry({ size = 64, rowH, minW, maxW, base, alt, mortar, seed, rough = 0.18 }) {
  const rand = rng(seed);
  const noise = fbm(size, rand, [4, 8, 16, 32]);
  const rows = Math.round(size / rowH);
  const joints = [];
  for (let r = 0; r < rows; r++) {
    const cuts = [];
    let x = Math.floor(rand() * maxW);
    const start = x;
    while (x < start + size) { cuts.push(x % size); x += minW + Math.floor(rand() * (maxW - minW + 1)); }
    cuts.sort((a, b) => a - b);
    joints.push({ cuts, tones: cuts.map(() => rand()) });
  }
  return canvasTexture(size, (x, y) => {
    const r = Math.floor(y / rowH);
    const ly = y - r * rowH;
    const { cuts, tones } = joints[r];
    let k = cuts.length - 1;
    for (let i = 0; i < cuts.length; i++) if (x >= cuts[i]) k = i;
    const lx = (x - cuts[k] + size) % size;
    const nextCut = cuts[(k + 1) % cuts.length];
    const w = (nextCut - cuts[k] + size) % size || size;
    if (ly === 0 || lx === 0) return mortar;
    let c = mixc(base, alt, tones[k]);
    const n = noise(x, y);
    c = scale(c, 1 - rough + n * rough * 2);
    if (ly === 1 || lx === 1) c = scale(c, 1.15);
    if (ly === rowH - 1 || lx === w - 1) c = scale(c, 0.78);
    if (rand() < 0.04) c = scale(c, 0.8);
    return c;
  });
}

export function buildTextures() {
  const T = {};

  T.stone = masonry({ rowH: 16, minW: 16, maxW: 32, base: [0.74, 0.68, 0.56], alt: [0.62, 0.58, 0.5], mortar: [0.3, 0.27, 0.22], seed: 11 });
  T.stoneDark = masonry({ rowH: 16, minW: 12, maxW: 28, base: [0.5, 0.46, 0.4], alt: [0.42, 0.39, 0.35], mortar: [0.18, 0.16, 0.14], seed: 12 });
  T.flagstone = masonry({ rowH: 32, minW: 20, maxW: 40, base: [0.66, 0.6, 0.5], alt: [0.56, 0.52, 0.46], mortar: [0.28, 0.25, 0.2], seed: 13, rough: 0.12 });

  {
    const rand = rng(21);
    const n = fbm(64, rand, [4, 8, 16, 32]);
    const crackN = tileNoise(64, 6, rand);
    T.plaster = canvasTexture(64, (x, y) => {
      const v = n(x, y);
      let c = mixc([0.84, 0.76, 0.62], [0.7, 0.62, 0.5], v);
      const cr = Math.abs(crackN(x, y) - 0.5);
      if (cr < 0.012) c = scale(c, 0.55);
      if (rand() < 0.03) c = scale(c, 0.88);
      return c;
    });
  }

  {
    const rand = rng(31);
    const n = fbm(64, rand, [2, 4, 8, 16, 32]);
    const pebbles = tileNoise(64, 32, rand);
    T.dirt = canvasTexture(64, (x, y) => {
      const v = n(x, y);
      let c = mixc([0.62, 0.5, 0.37], [0.46, 0.38, 0.29], v);
      const p = pebbles(x, y);
      if (p > 0.82) c = scale(c, 1.22);
      else if (p < 0.12) c = scale(c, 0.75);
      c = scale(c, 0.92 + rand() * 0.16);
      return c;
    });
  }

  {
    const rand = rng(41);
    const n = fbm(64, rand, [4, 8, 16, 32]);
    T.char = canvasTexture(64, (x, y) => {
      const v = n(x, y);
      let c = mixc([0.2, 0.17, 0.15], [0.42, 0.38, 0.34], v * v);
      if (rand() < 0.05) c = [0.55, 0.52, 0.48];
      return c;
    });
  }

  {
    const rand = rng(51);
    const n = tileNoise(64, 8, rand);
    T.bark = canvasTexture(64, (x, y) => {
      const v = n(x * 6, y * 0.4);
      let c = mixc([0.3, 0.24, 0.19], [0.12, 0.1, 0.09], v);
      if (rand() < 0.06) c = scale(c, 0.7);
      return c;
    });
  }

  T.white = canvasTexture(8, () => [1, 1, 1]);

  // Soft radial glow, stepped for a banded retro falloff.
  T.glow = canvasTexture(32, (x, y) => {
    const d = Math.hypot(x - 15.5, y - 15.5) / 16;
    const v = Math.max(0, 1 - d);
    const s = Math.round(v * v * 6) / 6;
    return [s, s, s, 1];
  }, { repeat: false, mips: false });

  {
    const rand = rng(61);
    const n = tileNoise(32, 4, rand);
    T.puff = canvasTexture(32, (x, y) => {
      const d = Math.hypot(x - 15.5, y - 15.5) / 16;
      const a = Math.max(0, 1 - d * (0.8 + n(x, y) * 0.6));
      return [1, 1, 1, a];
    }, { repeat: false, mips: false });
  }

  return T;
}
