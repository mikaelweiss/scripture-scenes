import * as THREE from 'three';
import { fretTexture, gradientMap, stoneTexture } from './textures.js';

export class MaterialKit {
  constructor(style) {
    this.gradient = gradientMap(style.toonSteps);
    this.ink = style.ink;
    this.cache = new Map();
    this.stone = stoneTexture();
    this.frets = new Map();
  }

  toon(color, { emissive = 0x000000, map = null, fog = true, side = THREE.FrontSide, unique = false } = {}) {
    const key = [color, new THREE.Color(emissive).getHex(), map?.uuid, fog, side].join('|');
    if (!unique && this.cache.has(key)) return this.cache.get(key);
    const m = new THREE.MeshToonMaterial({ color, emissive, map, fog, side, gradientMap: this.gradient });
    if (!unique) this.cache.set(key, m);
    return m;
  }

  basic(color, opts = {}) {
    const key = ['basic', color, opts.polygonOffset].join('|');
    if (this.cache.has(key)) return this.cache.get(key);
    const m = new THREE.MeshBasicMaterial({ color, ...opts });
    this.cache.set(key, m);
    return m;
  }

  fret(bg, fg) {
    const key = bg + fg;
    if (!this.frets.has(key)) this.frets.set(key, fretTexture(bg, fg, this.ink));
    return this.frets.get(key);
  }

  stoneMat(color) {
    return this.toon(color, { map: this.stone });
  }

  fretMat(bg, fg) {
    return this.toon('#ffffff', { map: this.fret(bg, fg) });
  }
}
