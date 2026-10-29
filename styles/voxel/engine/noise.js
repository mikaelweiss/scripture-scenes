export function rng(seed = 1) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function hash3(x, y, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function noise2(x, z, seed = 0) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash3(xi, seed, zi), b = hash3(xi + 1, seed, zi);
  const c = hash3(xi, seed, zi + 1), d = hash3(xi + 1, seed, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm2(x, z, octaves = 4, seed = 0) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, z * freq, seed + i * 31);
    norm += amp; amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

export const pick = (list, rand) => list[Math.floor(rand() * list.length)];

// A [min, max] pair of numbers resolves to a value between them, any other list to one of its entries.
export const range = (v, rand) => {
  if (!Array.isArray(v)) return v;
  return v.length === 2 && typeof v[0] === 'number' ? v[0] + rand() * (v[1] - v[0]) : pick(v, rand);
};
