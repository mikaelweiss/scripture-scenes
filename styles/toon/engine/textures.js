import * as THREE from 'three';
import { makeRng } from './util.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function finish(c, { repeat = true, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Light block pattern meant to be tinted by the material color. One tile spans 2m x 2m.
export function stoneTexture(seed = 3) {
  const rng = makeRng(seed);
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const v = 225 + Math.floor(rng() * 30);
    g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
    g.fillRect(rng() * 256, rng() * 256, 2 + rng() * 5, 2 + rng() * 3);
  }
  g.strokeStyle = 'rgba(95,70,50,0.55)';
  g.lineWidth = 2.5;
  g.lineCap = 'round';
  const course = 64;
  for (let row = 0; row < 4; row++) {
    const y = row * course;
    g.beginPath();
    g.moveTo(0, y + 1);
    for (let x = 0; x <= 256; x += 32) g.lineTo(x, y + 1 + (rng() - 0.5) * 2.5);
    g.stroke();
    const shift = row % 2 ? 64 : 0;
    for (let x = shift; x < 256 + 64; x += 128) {
      const xx = (x % 256) + (rng() - 0.5) * 6;
      g.beginPath();
      g.moveTo(xx, y + 2);
      g.lineTo(xx + (rng() - 0.5) * 4, y + course - 1);
      g.stroke();
    }
  }
  g.strokeStyle = 'rgba(95,70,50,0.3)';
  g.lineWidth = 1.5;
  for (let i = 0; i < 18; i++) {
    let x = rng() * 256, y = rng() * 256;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 3; k++) {
      x += (rng() - 0.5) * 18;
      y += rng() * 10;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return finish(c);
}

// Step-fret frieze (xicalcoliuhqui). One tile is 4 cells wide; v spans the band height.
export function fretTexture(bg, fg, ink) {
  const [c, g] = canvas(512, 128);
  const s = 128;
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 128);
  for (let cell = 0; cell < 4; cell++) {
    const ox = cell * s;
    const flip = cell % 2 === 1;
    g.save();
    g.translate(ox + (flip ? s : 0), 0);
    g.scale(flip ? -1 : 1, 1);
    const pad = 14;
    const inner = s - pad * 2;
    const step = inner / 4;
    const shape = new Path2D();
    shape.moveTo(pad, s - pad);
    for (let k = 0; k < 4; k++) {
      shape.lineTo(pad + k * step, s - pad - (k + 1) * step);
      shape.lineTo(pad + (k + 1) * step, s - pad - (k + 1) * step);
    }
    shape.lineTo(pad + inner, s - pad);
    shape.closePath();
    g.fillStyle = fg;
    g.fill(shape);
    const hook = new Path2D();
    const t = step * 0.7;
    hook.rect(pad, pad, inner * 0.55, t);
    hook.rect(pad, pad, t, inner * 0.5);
    hook.rect(pad, pad + inner * 0.5 - t, inner * 0.3, t);
    g.fill(hook);
    g.strokeStyle = ink;
    g.lineWidth = 4;
    g.lineJoin = 'round';
    g.stroke(shape);
    g.restore();
  }
  g.fillStyle = ink;
  g.fillRect(0, 0, 512, 6);
  g.fillRect(0, 122, 512, 6);
  return finish(c);
}

export function glowTexture() {
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.75)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.22)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return finish(c, { repeat: false });
}

export function gradientMap(levels) {
  const data = new Uint8Array(levels.map((v) => Math.round(v * 255)));
  const t = new THREE.DataTexture(data, levels.length, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}
