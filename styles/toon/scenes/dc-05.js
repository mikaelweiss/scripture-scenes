// D&C 76: Joseph Smith and Sidney Rigdon see the vision of the glories in the John Johnson home, Hiram, Ohio,
// February 16, 1832. The roofless room opens onto the vision: the Son at the right hand of God above,
// and the celestial sun, terrestrial moon, and telestial stars below Him.
import { candle, chair, fireplace, floor, gableRoof, glowSprite, heavenly, periodCrowd, periodPerson, room, table, book, trackAvatar } from './lib/dc-01-kit.js';
import { FX_LAYER } from '../engine/renderer.js';
import { makeRng } from '../engine/util.js';

const W = 11, D = 8;
const SEER = [0, -2.2];
const VISION = [0, -70];

export default {
  title: 'D&C 76: The Vision',
  subtitle: 'The John Johnson home, Hiram, Ohio, February 1832',
  seed: 76,

  style: {
    ink: '#1c1428',
    toonSteps: [0.42, 0.74, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [60, 400, 300, 0.5] },
    grain: 0.05,
    fog: { color: '#2a2a50', near: 80, far: 600 },
  },

  sky: { zenith: '#0e1030', mid: '#24285a', horizon: '#5a5488', ground: '#1e1e30', glowColor: '#fff2c8', glowDir: [0, 0.45, -1] },

  sun: { dir: [0.1, 0.8, -0.6], color: '#fff0d0', intensity: 1.6, hemi: { sky: '#8a90c8', ground: '#4a3a3a', intensity: 1.0 }, shadowSize: 30 },

  ground: {
    size: 1200, segments: 240, flatRadius: 80, hillHeight: 24, undulation: 0,
    plaza: { center: [999, 999], size: [1, 1] },
    colors: { sand: '#d8dce8', dirt: '#c8ccd8', grass: '#b8bcc8', grassDark: '#a8acc0', plaza: '#d8dce8', plazaLine: '#d8dce8', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#a0a4b8' },
  },

  mountains: { count: 22, distance: [480, 760], height: [30, 70], widthRatio: [2.6, 3.6], colors: ['#2e3260', '#363a6a', '#2a2e58'] },

  objects: [],

  custom(ctx) {
    const { THREE, scene, kit } = ctx;
    const avatar = trackAvatar(ctx, {});
    const r = room(ctx, {
      x: 0, z: 0, w: W, d: D, h: 2.7, kind: 'plain', color: '#efe8d8', trim: '#f7f3ea', glass: '#3a4a7a', avatar,
      openings: {
        s: [{ at: 7.5, width: 1.4, top: 2.1, kind: 'door' }, { at: 3, width: 1, bottom: 0.9, top: 2, kind: 'window' }],
        e: [{ at: 2.5, width: 1, bottom: 0.9, top: 2, kind: 'window' }, { at: 5.5, width: 1, bottom: 0.9, top: 2, kind: 'window' }],
        w: [{ at: 4, width: 1, bottom: 0.9, top: 2, kind: 'window' }],
      },
    });
    gableRoof(ctx, r.outside, { x: 0, z: 0, w: W, d: D, y: 2.7, rise: 2.2, color: '#4a4448', gable: '#efe8d8' });
    floor(ctx, { x: 0, z: 0, w: W, d: D, color: '#a8805a', lines: '#86603e' });
    fireplace(ctx, { pos: [W / 2 - 0.45, -1], rotY: -Math.PI / 2, color: '#9a7a6a' });
    const rug = new THREE.Mesh(new THREE.BoxGeometry(4, 0.02, 2.6), kit.toon('#8a3a2e'));
    rug.position.set(0, 0.1, -1.6);
    scene.add(rug);

    // Joseph and Sidney seated side by side, gazing up into the vision.
    table(ctx, { pos: [0, -3.2], size: [1.8, 0.7], color: '#6b4a30' });
    book(ctx, [-0.3, 0.8, -3.2], { open: true });
    candle(ctx, [0.6, 0.8, -3.2], 2.5);
    chair(ctx, { pos: [-0.65, SEER[1]], rotY: Math.PI });
    chair(ctx, { pos: [0.65, SEER[1]], rotY: Math.PI });
    periodPerson(ctx, { pos: [-0.65, SEER[1] - 0.05], yaw: Math.PI, pose: 'sit', arms: [0.15, 0.6], colors: { body: '#2e3440', skin: '#e8c3a0', hair: '#7a5530' } });
    periodPerson(ctx, { pos: [0.65, SEER[1] - 0.05], yaw: Math.PI, pose: 'sit', arms: [0.15, 0.6], colors: { body: '#3a3530', skin: '#e3b894', hair: '#b8a890' } });
    glowSprite(ctx, [0, 1.3, SEER[1] - 0.2], 5, '#fff0c0', 0.45);
    const lamp = new THREE.PointLight('#fff0c8', 8, 9, 1.4);
    lamp.position.set(0, 2.4, -1);
    scene.add(lamp);

    // About twelve men present in the room, watching.
    const men = [
      [-4.6, -2.6], [-4.6, -1.6], [-4.4, -0.4], [-4.3, 1.2], [-3.3, 2.9], [-2.0, 3.2], [2.0, 3.0], [3.2, 2.6], [4.2, 1.6], [4.4, 0.4], [-2.6, -3.3], [2.6, -3.4],
    ];
    periodCrowd(ctx, men.map(([x, z], i) => ({ x, z, face: [0, -1.5], kind: 'man', pose: i % 4 === 1 ? 'sit' : 'stand' })), { seed: 6 });
    for (const [x, z] of [[-4.6, -1.6], [-2.0, 3.2], [4.4, 0.4]]) chair(ctx, { pos: [x, z + 0.05], rotY: Math.atan2(-x, -1.5 - z) });

    // The vision above: the Son on the right hand of God, then the three glories.
    const vy = 21;
    const puffMat = kit.toon('#fff6e0', { emissive: '#b8a070' });
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      const s = 2.6 + (i % 3) * 0.9;
      const puff = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 10).scale(1.3, 0.7, 1), puffMat);
      puff.position.set(VISION[0] + Math.cos(a) * 9.5, vy - 3 + (i % 2) * 0.6, VISION[1] + Math.sin(a) * 4);
      scene.add(puff);
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10).scale(10, 1.6, 4.5), puffMat);
    core.position.set(VISION[0], vy - 2.6, VISION[1]);
    scene.add(core);
    heavenly(ctx, { pos: [VISION[0] - 3, VISION[1]], y: vy - 1.5, face: [0, 0], scale: 4, arms: [0.35, 0.25], halo: 26, light: 0, glow: 0.8 });
    heavenly(ctx, { pos: [VISION[0] + 3.6, VISION[1] + 0.5], y: vy - 1.5, face: [0, 0], scale: 3.8, arms: [0.55, 0.35], halo: 24, light: 0, glow: 0.8 });
    glowSprite(ctx, [VISION[0], vy + 4, VISION[1] - 2], 70, '#fff0c0', 0.55);

    const disc = (pos, radius, color, emissive, halo, haloColor) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), kit.basic(color));
      m.position.set(...pos);
      m.layers.set(FX_LAYER);
      scene.add(m);
      glowSprite(ctx, pos, halo, haloColor, 0.7);
      return m;
    };
    disc([-30, 15, -80], 7, '#ffd25a', null, 44, '#ffc040');
    const moon = disc([0, 9, -88], 5, '#e8ecf4', null, 26, '#c8d4ff');
    const shade = new THREE.Mesh(new THREE.SphereGeometry(5.05, 24, 16, 0, Math.PI), kit.basic('#9aa6c8'));
    shade.position.copy(moon.position);
    shade.rotation.y = -Math.PI / 2 + 0.9;
    shade.layers.set(FX_LAYER);
    scene.add(shade);
    const rng = makeRng(3);
    const starPos = [];
    for (let i = 0; i < 70; i++) starPos.push(30 + (rng() - 0.5) * 22, 13 + (rng() - 0.5) * 12, -80 + (rng() - 0.5) * 8);
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#fff4d8', size: 1.1, fog: false, transparent: true, depthWrite: false }));
    stars.layers.set(FX_LAYER);
    scene.add(stars);
    glowSprite(ctx, [30, 13, -80], 34, '#d8d0ff', 0.35);
    const field = [];
    for (let i = 0; i < 900; i++) {
      const a = rng() * Math.PI * 2, e = 0.12 + rng() * 1.3;
      field.push(Math.cos(a) * Math.cos(e) * 900, Math.sin(e) * 900, Math.sin(a) * Math.cos(e) * 900);
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(field, 3));
    const sky = new THREE.Points(fg, new THREE.PointsMaterial({ color: '#e8e8ff', size: 2.2, sizeAttenuation: false, fog: false }));
    sky.layers.set(FX_LAYER);
    scene.add(sky);
    ctx.onFrame((t, dt, camera) => sky.position.copy(camera.position));

    // A winter farmyard around the house.
    ctx.exclude({ kind: 'rect', x: 0, z: 0, hx: 20, hz: 16 });
    ctx.builders.trees({ count: 90, ring: [30, 200], height: [6, 11], broken: 0, fallen: 0, trunkColor: '#3a3040', leafColors: ['#4a4a6a', '#525276', '#3e4062'] }, ctx);
  },

  clouds: {
    layers: [
      { count: 16, center: VISION, distance: [30, 70], height: [30, 60], size: [14, 26], color: '#fff2d8', shade: '#6a5a7a', drift: 0.002 },
      { count: 20, distance: [350, 700], height: [80, 160], size: [40, 80], color: '#3a3a6a', shade: '#14142c' },
    ],
  },

  player: {
    start: [0, 2.4],
    lookAt: [0, -6],
    colors: { robe: '#2c3a5a', mantle: '#2c3a5a', skin: '#e0b48e', hair: '#5a3a22' },
  },
};
