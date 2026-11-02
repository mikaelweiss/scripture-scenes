// Mount Sinai for ot-20 and ot-21: a terrain mound crowned with jagged granite crags,
// and the storm of the giving of the law (smoke, fire, thick cloud, lightning, quaking).
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from '../../engine/util.js';
import { puffTexture } from './ot-19-camp.js';

export const sinaiFlat = ({ x, z, base = 120, spread = 240 }) => ({ x, z, r: 0, falloff: spread, height: base });

function crag(r, radius, height) {
  const g = mergeVertices(new THREE.ConeGeometry(radius, height, 7, 5).deleteAttribute('normal').deleteAttribute('uv'));
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y + height / 2) / height;
    const k = 1 + r.range(-0.22, 0.22) * (1 - t * 0.5);
    pos.setXYZ(i, pos.getX(i) * k + r.range(-1, 1) * radius * 0.06, y + (t > 0.02 && t < 0.98 ? r.range(-0.05, 0.05) * height : 0), pos.getZ(i) * k);
  }
  return g.translate(0, height / 2, 0);
}

// Granite peaks on top of the mound, plus boulders down its flanks. Returns the summit point.
export function sinaiPeaks(ctx, { x, z, base = 120, seed = 7, colors = ['#7a5848', '#6a4a3e', '#84604c'] }) {
  const r = rng(seed);
  const shade = (c, ny, y) => {
    c.multiplyScalar(0.75 + Math.min(0.35, (y - base) / 300));
    if (ny > 0.75) c.lerp(new THREE.Color('#9a7a5c'), 0.4);
  };
  const peaks = [[0, 0, 80, 150], [-55, 20, 62, 110], [50, 24, 66, 120], [-20, -50, 60, 100], [32, -44, 56, 104], [-95, -10, 56, 80], [92, -12, 54, 86], [0, 60, 56, 70], [-60, 70, 44, 50], [64, 70, 46, 56], [-130, 40, 40, 44], [130, 36, 40, 50]];
  for (const [px, pz, rad, h] of peaks) {
    const wx = x + px, wz = z + pz;
    const y = ctx.heightAt(wx, wz) - 6;
    ctx.solid.add(crag(r, rad, h), { position: [wx, y, wz], rotation: [0, r() * 6, 0], color: r.pick(colors), jitter: 0.07, shade });
  }
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, d = r.range(70, 210);
    const bx = x + Math.cos(a) * d, bz = z + Math.sin(a) * d;
    const s = r.range(3, 10);
    ctx.solid.add(crag(r, s, s * r.range(0.8, 1.8)), { position: [bx, ctx.heightAt(bx, bz) - s * 0.3, bz], rotation: [r.range(-0.2, 0.2), r() * 6, 0], color: r.pick(colors), jitter: 0.08 });
  }
  return [x, ctx.heightAt(x, z) - 6 + 150, z];
}

// Smoke, fire, a thick cloud lit from within, lightning and quaking on the summit.
export function sinaiStorm(ctx, summit, { fire = true, quake = true, lightning = true, cloudColor = '#3c3638' } = {}) {
  const { THREE: T, scene, effects } = ctx;
  const [sx, sy, sz] = summit;
  const r = rng(91);

  const cloudGeo = [];
  const cloud = new T.Group();
  const cloudMat = new T.MeshLambertMaterial({ color: cloudColor, emissive: '#ff6a2a', emissiveIntensity: 0, flatShading: true });
  const underMat = new T.MeshLambertMaterial({ color: '#4a3a36', emissive: '#ff7a30', emissiveIntensity: fire ? 0.35 : 0, flatShading: true });
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, d = r.range(20, 150);
    const s = r.range(26, 52);
    const low = i % 3 === 0;
    const m = new T.Mesh(new T.IcosahedronGeometry(1, 1), low ? underMat : cloudMat);
    m.scale.set(s * 1.3, s * 0.55, s);
    m.position.set(sx + Math.cos(a) * d, sy + r.range(60, 95) + (low ? -6 : 12), sz - 50 + Math.sin(a) * d * 0.5);
    m.rotation.y = r() * 6;
    cloud.add(m);
    cloudGeo.push(m);
  }
  scene.add(cloud);
  ctx.onFrame((t) => (cloud.rotation.y = Math.sin(t * 0.03) * 0.05));
  cloud.position.set(0, 0, 0);

  effects.smoke({ position: [sx - 10, sy + 10, sz - 20], count: 26, height: 150, size: 6, color: '#8a7e78', wind: [0.4, -0.2], seed: 3 });
  effects.smoke({ position: [sx - 50, sy - 40, sz - 10], count: 16, height: 110, size: 5, color: '#7a706a', wind: [0.5, 0.2], seed: 4 });
  effects.smoke({ position: [sx + 50, sy - 36, sz - 6], count: 16, height: 110, size: 5, color: '#7a706a', wind: [0.3, 0.1], seed: 5 });

  if (fire) {
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = r.range(0, 40);
      const h = r.range(6, 24);
      ctx.glow.add(new T.ConeGeometry(h * 0.28, h, 5), {
        position: [sx + Math.cos(a) * d, sy - 24 + h / 2 + r.range(-4, 10), sz + 12 + Math.sin(a) * d * 0.6],
        rotation: [r.range(-0.15, 0.15), r() * 3, r.range(-0.15, 0.15)],
        color: r.pick(['#ff7a1a', '#ffa030', '#ff5a10', '#ffc860']),
        jitter: 0.05,
      });
    }
    const blaze = new T.SpriteMaterial({ map: puffTexture(), color: '#ff8a38', opacity: 0.32, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false });
    const flames = [];
    for (let i = 0; i < 36; i++) {
      const a = r() * Math.PI * 2, d = r.range(8, 48);
      const s = new T.Sprite(blaze);
      const size = r.range(18, 34);
      s.scale.set(size, size * 1.4, 1);
      s.position.set(sx + Math.cos(a) * d, sy - 18 + r.range(0, 30), sz + 14 + Math.sin(a) * d * 0.6);
      s.userData = { y: s.position.y, ph: r() * 6 };
      scene.add(s);
      flames.push(s);
    }
    ctx.onFrame((t) => {
      for (const s of flames) s.position.y = s.userData.y + Math.sin(t * 1.6 + s.userData.ph) * 2.5;
    });
    effects.halo({ position: [sx, sy, sz], size: 160, color: '#ff8a3a', opacity: 0.55 });
    const glow = new T.PointLight('#ff7a30', 1500, 420, 1.2);
    glow.position.set(sx, sy + 10, sz + 30);
    scene.add(glow);
    ctx.onFrame((t) => {
      glow.intensity = 1500 * (0.8 + 0.2 * Math.sin(t * 5.3) * Math.sin(t * 3.1));
      underMat.emissiveIntensity = 0.3 + 0.1 * Math.sin(t * 4.1);
    });
  }

  if (lightning) {
    const flash = new T.HemisphereLight('#dfe6ff', '#6a5a70', 0);
    scene.add(flash);
    const boltMat = new T.MeshBasicMaterial({ color: '#f4f6ff', toneMapped: false, transparent: true, opacity: 0 });
    const bolts = [];
    for (let b = 0; b < 4; b++) {
      const pts = [];
      let px = sx + r.range(-80, 80), py = sy + 50, pz = sz + r.range(-20, 50);
      const parts = [];
      for (let k = 0; k < 9; k++) {
        const nx = px + r.range(-12, 12), ny = py - r.range(8, 16), nz = pz + r.range(-6, 6);
        const len = Math.hypot(nx - px, ny - py, nz - pz);
        const seg = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, len, 4), boltMat);
        seg.position.set((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2);
        seg.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(nx - px, ny - py, nz - pz).normalize());
        parts.push(seg);
        [px, py, pz] = [nx, ny, nz];
      }
      const g = new T.Group();
      g.add(...parts);
      g.visible = false;
      scene.add(g);
      bolts.push(g);
    }
    let next = 1.5, until = 0, active = null;
    ctx.onFrame((t, dt, camera) => {
      if (t > next) {
        active = bolts[Math.floor(r() * bolts.length)];
        active.visible = true;
        until = t + 0.22;
        next = t + r.range(2.5, 6);
      }
      const on = t < until;
      const k = on ? (Math.sin((until - t) * 60) > -0.3 ? 1 : 0.3) : 0;
      flash.intensity = k * 1.6;
      boltMat.opacity = k;
      cloudMat.emissiveIntensity = k * 0.15;
      if (!on && active) active.visible = false;
      if (quake) {
        const q = (on ? 0.05 : 0) + 0.012 * Math.max(0, Math.sin(t * 0.7)) ** 8;
        camera.position.x += Math.sin(t * 47) * q;
        camera.position.y += Math.sin(t * 61) * q;
      }
    });
  }
}

// Stakes and a rope marking the bounds set about the mount (Exodus 19:12).
export function bounds(ctx, points, { color = '#6a4a32' } = {}) {
  for (let i = 0; i < points.length; i++) {
    const [x, z] = points[i];
    const y = ctx.heightAt(x, z);
    ctx.solid.add(new THREE.CylinderGeometry(0.06, 0.08, 1.3, 5), { position: [x, y + 0.6, z], color });
    ctx.colliders.add({ x, z, w: 0.3, d: 0.3, bottom: y, top: y + 1.3 });
    if (i === 0) continue;
    const [ax, az] = points[i - 1];
    const ay = ctx.heightAt(ax, az);
    const len = Math.hypot(x - ax, z - az);
    ctx.solid.add(new THREE.CylinderGeometry(0.025, 0.025, len, 3), {
      position: [(x + ax) / 2, (y + ay) / 2 + 1.05, (z + az) / 2],
      rotation: [Math.PI / 2, Math.atan2(x - ax, z - az), 0],
      color: '#c9b48a',
      jitter: 0,
    });
  }
}
