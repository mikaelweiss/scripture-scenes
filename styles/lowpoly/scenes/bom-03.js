// 1 Nephi 3-4: Nephi, in Laban's garments, has Zoram open the treasury and takes the brass plates.
// Jerusalem at night. A lane runs north (-z) to the gate of Laban's walled house and courtyard.
import * as THREE from 'three';
import { house, cityWall, box, person, torch, jar, stars, moon, frame } from './lib/bom-01-kit.js';

const GATE = [0, -14];
const TREASURY = [9, -30];
const NEPHI = [3.2, -24.5];
const ZORAM = [5.2, -26.2];
const WALL = '#b8a888';

export default {
  title: '1 Nephi 3-4: Nephi obtains the brass plates',
  seed: 303,
  fov: 62,
  exposure: 1.25,

  sun: { direction: [0.45, 0.6, 0.4], color: '#8fa8ff', intensity: 0.75 },
  light: { sky: '#34487a', ground: '#1c1612', hemi: 1.0 },
  sky: { top: '#040818', horizon: '#1a2848', ground: '#0e121c', sunColor: '#3a4a7a', glow: 0.25 },
  fog: { color: '#121a2e', near: 30, far: 240 },
  mountains: { count: 40, color: '#141a2a', radius: [420, 650], height: [30, 80], haze: 0.3 },
  bloom: { strength: 0.75, radius: 0.55, threshold: 0.55 },
  grade: { saturation: 1.05, contrast: 1.08, vignette: 0.5, shadowTint: '#141a40', highlightTint: '#ffd8a0' },
  shadow: { center: [0, -12], radius: 50 },

  player: { start: [1.4, -20.2], yaw: -0.4, pitch: -0.04, eye: 1.65, speed: 4 },

  terrain: {
    size: 900,
    segments: 140,
    seed: 41,
    hills: 30,
    bumps: 0.1,
    flats: [{ x: 0, z: -10, r: 90, falloff: 40, height: 0 }],
    colors: { ground: '#7a6a54', groundAlt: '#6a5c48', grass: '#4a4a32', high: '#6a5a46', rock: '#5a4c3c' },
  },

  objects: [
    { type: 'pavement', x: 0, z: 10, w: 7, d: 40, tile: 1.6, color: '#9a8a70', damage: 0.1 },
    { type: 'pavement', x: 0, z: -28, w: 30, d: 26, tile: 2, color: '#a89878', damage: 0.03 },
  ],

  custom(ctx) {
    const r = ctx.rand;
    stars(ctx, { count: 1600, seed: 31 });
    moon(ctx, { dir: [0.45, 0.6, 0.4], size: 70 });

    // Houses along the lane, a few windows still lamplit.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const z = 28 - i * 9.5;
        house(ctx, { x: side * 8.5, z, rot: side > 0 ? -Math.PI / 2 : Math.PI / 2, w: 8.6, d: 9, h: r.range(4.2, 6.5), color: r.pick(['#c8b896', '#bcac8a', '#d0c09c']), trim: '#a8987a', lit: true, upper: r() < 0.5 });
      }
    }
    for (let gx = -6; gx <= 6; gx++) {
      for (let gz = -9; gz <= 6; gz++) {
        const x = gx * 11 + r.range(-1, 1), z = gz * 11 + r.range(-1, 1);
        if (Math.abs(x) < 20 && z > -52 && z < 40) continue;
        if (Math.hypot(x, z) > 85) continue;
        house(ctx, { x, z, rot: r.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]), w: r.range(7.5, 9.5), d: r.range(7, 9), h: r.range(4, 7), color: '#bcac8a', trim: '#a8987a', lit: r() < 0.5, upper: r() < 0.4 });
      }
    }
    cityWall(ctx, { path: [[-95, -110], [90, -110], [100, 70], [-100, 70], [-95, -110]], h: 10, color: '#a89878' });

    // Laban's walled compound: front wall with the gate, side walls, and the great house at the back.
    const wallH = 4.2;
    for (const [x, z, w, d] of [[-11.5, -14, 19, 1], [11.5, -14, 19, 1], [-20.5, -30, 1, 32], [20.5, -30, 1, 32], [0, -46, 42, 1]]) {
      box(ctx, { x, z, y: -0.2, w, h: wallH, d, color: WALL });
      box(ctx, { x, z, y: wallH - 0.2, w: w + 0.3, h: 0.35, d: d + 0.3, color: '#9a8a6c', collide: false });
    }
    for (const s of [-1, 1]) box(ctx, { x: s * 2.6, z: -14, y: -0.2, w: 1.4, h: 5.6, d: 1.6, color: '#c4b492' });
    box(ctx, { x: 0, z: -14, y: 5.4, w: 6.8, h: 0.8, d: 1.8, color: '#9a8a6c', collide: false });
    for (const s of [-1, 1]) box(ctx, { x: s * 3.6, z: -15.2, y: -0.2, w: 2.4, h: 4.2, d: 0.18, rot: s * 0.9, color: '#5a3a24' });
    torch(ctx, { x: -3.6, z: -12.6, h: 2.6, light: 9, distance: 14 });
    torch(ctx, { x: 3.6, z: -12.6, h: 2.6, light: 9, distance: 14 });

    const big = house(ctx, { x: -4, z: -40, rot: 0, w: 22, d: 9, h: 7, color: '#d2c4a2', trim: '#b4a482', lit: true, upper: false });
    box(ctx, { x: -4, z: -41, y: big.top, w: 12, h: 4, d: 6, color: '#d2c4a2' });
    for (let i = 0; i < 4; i++) box(ctx, { x: -9 + i * 3.4, z: -37.9, y: big.top + 1.6, w: 0.6, h: 1.0, d: 0.12, color: '#ffb456', collide: false, glow: true });
    for (const cx of [-12, -7, -1, 4]) ctx.builders.column(ctx, { x: cx, z: -34.6, h: 4.6, radius: 0.3, color: '#ddd0b0', broken: false });
    box(ctx, { x: -4, z: -34.6, y: 4.4, w: 19, h: 0.5, d: 1.6, color: '#b4a482', collide: false });
    torch(ctx, { x: -10, z: -26, h: 2.2, light: 7, distance: 12 });

    // The treasury: a squat strong-room with a heavy bronze-banded door, its lamp lit.
    const ty = -0.2;
    box(ctx, { x: TREASURY[0], z: TREASURY[1], y: ty, w: 7, h: 4.6, d: 6, color: '#a89a80' });
    box(ctx, { x: TREASURY[0], z: TREASURY[1], y: ty + 4.6, w: 7.6, h: 0.5, d: 6.6, color: '#8a7c64', collide: false });
    const at = frame(TREASURY[0], TREASURY[1], -Math.PI / 2);
    const [dx, dz] = at(0, 3.05);
    box(ctx, { x: dx, z: dz, y: ty + 0.2, w: 1.6, h: 2.5, d: 0.15, rot: -Math.PI / 2, color: '#120c08', collide: false });
    const [ox, oz] = at(-1.1, 3.4);
    box(ctx, { x: ox, z: oz, y: ty + 0.2, w: 0.12, h: 2.5, d: 1.5, rot: -Math.PI / 2 + 0.2, color: '#6a4426', collide: false });
    for (const h of [0.7, 1.6, 2.4]) box(ctx, { x: ox - 0.08, z: oz, y: ty + h, w: 0.14, h: 0.12, d: 1.52, rot: -Math.PI / 2 + 0.2, color: '#a8843a', collide: false });
    ctx.glow.box(1.3, 2.2, 0.05, { position: [dx - 0.1, ty + 1.4, dz], rotation: [0, -Math.PI / 2, 0], color: '#6a3a14' });
    torch(ctx, { x: 6.8, z: -21.5, h: 2.2, light: 10, distance: 13 });
    torch(ctx, { x: TREASURY[0] - 3.8, z: TREASURY[1] - 2.6, h: 2.2, light: 6, distance: 9 });

    // Nephi in Laban's garments and armor, the brass plates in his arms; Zoram with the keys and a lamp.
    const nephi = person(ctx, { x: NEPHI[0], z: NEPHI[1], face: [GATE[0], GATE[1] + 10], scale: 1.04, robe: '#6a2430', mantle: '#a8843a', skin: '#a8754f' });
    const plates = new THREE.Group();
    const brass = new THREE.MeshLambertMaterial({ color: '#e0b048', emissive: '#a06810', emissiveIntensity: 0.9, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.42), brass);
      p.position.y = i * 0.035;
      plates.add(p);
    }
    for (const s of [-1, 1]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 4, 8), brass);
      ring.position.set(s * 0.17, 0.08, 0);
      ring.rotation.y = Math.PI / 2;
      plates.add(ring);
    }
    plates.position.set(0, 0.98, 0.34);
    plates.scale.setScalar(0.95);
    plates.rotation.x = -0.5;
    nephi.add(plates);
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.02), new THREE.MeshStandardMaterial({ color: '#c8ccd4', metalness: 0.9, roughness: 0.25, flatShading: true }));
    sword.position.set(0.3, 0.55, 0.05);
    sword.rotation.z = 0.25;
    nephi.add(sword);
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: '#d4a830', metalness: 0.9, roughness: 0.3 }));
    hilt.position.set(0.19, 1.0, 0.05);
    hilt.rotation.z = 0.25;
    nephi.add(hilt);

    const zoram = person(ctx, { x: ZORAM[0], z: ZORAM[1], face: [NEPHI[0], NEPHI[1]], robe: '#7a6a52', mantle: '#4a4034', skin: '#9b6a46', hood: true });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffd080', toneMapped: false }));
    lamp.position.set(0.28, 0.95, 0.3);
    zoram.add(lamp);
    const keys = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 4, 8), new THREE.MeshStandardMaterial({ color: '#c8a040', metalness: 0.8, roughness: 0.3 }));
    keys.position.set(-0.26, 0.8, 0.1);
    zoram.add(keys);
    const lampLight = new THREE.PointLight('#ffb460', 8, 8, 1.6);
    lampLight.position.set(ZORAM[0] + 0.2, ctx.heightAt(...ZORAM) + 1.3, ZORAM[1] + 0.4);
    ctx.scene.add(lampLight);
    const fill = new THREE.PointLight('#ffc888', 5, 7, 1.6);
    fill.position.set(NEPHI[0] - 1.2, ctx.heightAt(...NEPHI) + 1.8, NEPHI[1] + 2.4);
    ctx.scene.add(fill);
    ctx.onFrame((t) => (lampLight.intensity = 8 * (0.9 + Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.04)));

    for (const [x, z] of [[12.5, -25], [13.2, -26], [-16, -20], [-17, -21], [15, -40]]) jar(ctx, { x, z, size: 0.7, color: '#7a4a2e' });
    for (let i = 0; i < 3; i++) ctx.builders.tree(ctx, { x: -16 + i * 3, z: -31 + (i % 2) * 2, kind: 'broad', h: 4, leaf: '#2e3a22' });
  },
};
