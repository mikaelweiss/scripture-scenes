// D&C 17: An angel shows the plates to Oliver Cowdery, David Whitmer, and Joseph Smith in the woods near the
// Whitmer farm, while Martin Harris prays alone nearby. x is east, z is south; the farm lies to the south-east.
import { gableRoof, glowSprite, heavenly, periodPerson, pines, railFence, room, table, trackAvatar } from './lib/dc-01-kit.js';

const ANGEL = [0, -12];
const MARTIN = [-24, -2];
const HOUSE = [60, 55];

export default {
  title: 'D&C 17: The Three Witnesses',
  subtitle: 'Woods near the Whitmer farm, Fayette, New York, June 1829',
  seed: 17,

  style: {
    ink: '#24180f',
    toonSteps: [0.4, 0.72, 1.0],
    lines: { width: 1.5, depth: 0.08, normal: 0.35, fade: [70, 500, 400, 0.5] },
    grain: 0.05,
    fog: { color: '#d9e6c8', near: 80, far: 700 },
  },

  sky: { zenith: '#3f78a8', mid: '#86b6cc', horizon: '#e8efd6', ground: '#6a7a48', glowColor: '#fff6d8', glowDir: [0, 0.7, -1] },

  sun: { dir: [0.4, 0.85, 0.3], color: '#fff4dc', intensity: 2.4, hemi: { sky: '#d6e8f0', ground: '#5a6a3a', intensity: 1.1 }, shadowSize: 60 },

  ground: {
    size: 1400, segments: 280, flatRadius: 70, hillHeight: 28, undulation: 0.5,
    plaza: { center: [999, 999], size: [1, 1] },
    colors: { sand: '#6f9044', dirt: '#7a8a46', grass: '#5f8a3e', grassDark: '#4a7034', plaza: '#6f9044', plazaLine: '#6f9044', scorch: '#3a2a22', scorchEdge: '#6e4630', hill: '#5a7e44' },
  },

  mountains: { count: 22, distance: [480, 760], height: [40, 90], widthRatio: [2.6, 3.6], colors: ['#7a96a0', '#86a2a8', '#6e8c96'] },

  objects: [
    { type: 'stones', count: 120, ring: [4, 40], size: [0.15, 0.45], colors: ['#8a8070', '#9a907a'] },
  ],

  custom(ctx) {
    const { THREE, scene, kit } = ctx;
    const gy = ctx.groundHeight(...ANGEL);

    // The angel, the plates in his hands, and the sacred objects of D&C 17:1 on a table before him.
    heavenly(ctx, { pos: ANGEL, y: gy + 0.5, face: [0, 10], scale: 1.3, arms: [0.22, 1.05], halo: 5, haloOpacity: 0.5, light: 6 });
    const gold = kit.toon('#e8b84a', { emissive: '#6a4a10' });
    const plates = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.32), gold);
      p.position.y = i * 0.03;
      plates.add(p);
    }
    const rings = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.34), kit.toon('#b8862a'));
    rings.position.set(-0.21, 0.08, 0);
    plates.add(rings);
    plates.position.set(ANGEL[0], gy + 0.5 + 1.2 * 1.3, ANGEL[1] + 0.7);
    plates.rotation.x = -0.5;
    scene.add(plates);

    const T = [ANGEL[0], ANGEL[1] + 2.0];
    table(ctx, { pos: T, size: [1.6, 0.8], color: '#6b4a30' });
    const ty = ctx.terrainHeight(...T) + 0.8;
    const sword = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.07), kit.toon('#d8dde2', { emissive: '#30343a' }));
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.05), gold);
    hilt.position.x = -0.55;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.22), gold);
    guard.position.x = -0.45;
    sword.add(blade, hilt, guard);
    sword.position.set(T[0] + 0.1, ty + 0.02, T[1] + 0.2);
    sword.rotation.y = 0.15;
    const breast = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.35), gold);
    breast.scale.set(1, 0.6, 1.2);
    breast.position.set(T[0] - 0.45, ty - 0.02, T[1] - 0.12);
    const liahona = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), gold);
    liahona.position.set(T[0] + 0.5, ty + 0.12, T[1] - 0.15);
    const stones = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), kit.toon('#cfe8f0', { emissive: '#406070' }));
    stones.position.set(T[0] + 0.15, ty + 0.05, T[1] - 0.2);
    const stones2 = stones.clone();
    stones2.position.x += 0.14;
    scene.add(sword, breast, liahona, stones, stones2);
    glowSprite(ctx, [ANGEL[0], gy + 2.2, ANGEL[1]], 7, '#fff3d0', 0.3);
    glowSprite(ctx, [T[0], ty + 0.2, T[1]], 3, '#ffe0a0', 0.5);

    const kneel = (pos, colors, arms) => periodPerson(ctx, { pos, face: ANGEL, pose: 'kneel', colors, arms });
    kneel([-1.4, ANGEL[1] + 4.0], { body: '#2e3440', skin: '#e3b894', hair: '#7a5530' });
    kneel([0.1, ANGEL[1] + 4.4], { body: '#4a3b2e', skin: '#e8c3a0', hair: '#3a2418' }, [0.15, 1.3]);
    kneel([1.6, ANGEL[1] + 4.0], { body: '#3a4652', skin: '#e0b48e', hair: '#5a3a22' });
    periodPerson(ctx, { pos: MARTIN, face: [MARTIN[0] - 4, MARTIN[1] - 6], pose: 'kneel', colors: { body: '#5a4632', skin: '#e3b894', hair: '#8a6a48' }, arms: [0.1, 0.9] });

    // Whitmer farm: log house, field fence.
    const r = room(ctx, {
      x: HOUSE[0], z: HOUSE[1], w: 10, d: 7, h: 2.8, kind: 'log', color: '#7a5a3e', chink: '#c8b89a',
      openings: { n: [{ at: 5, width: 1.1, top: 2.1, kind: 'door' }, { at: 2, width: 1, bottom: 1, top: 1.9, kind: 'window' }, { at: 8, width: 1, bottom: 1, top: 1.9, kind: 'window' }] },
    });
    gableRoof(ctx, r.outside, { x: HOUSE[0], z: HOUSE[1], w: 10, d: 7, y: ctx.terrainHeight(...HOUSE) + 2.8, rise: 2.2, color: '#5a4636', gable: '#7a5a3e' });
    const chim = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 1), kit.stoneMat('#8a7a6a'));
    chim.position.set(HOUSE[0] + 5.3, ctx.terrainHeight(...HOUSE) + 3, HOUSE[1]);
    chim.castShadow = true;
    scene.add(chim);
    ctx.exclude({ kind: 'rect', x: HOUSE[0], z: HOUSE[1], hx: 9, hz: 7 });
    railFence(ctx, [[30, 32], [95, 32], [95, 110]], { color: '#7a6450' });
    ctx.exclude({ kind: 'rect', x: 75, z: 70, hx: 40, hz: 45 });

    ctx.exclude({ kind: 'circle', x: ANGEL[0], z: ANGEL[1] + 3, r: 7.5 });
    ctx.exclude({ kind: 'circle', x: MARTIN[0], z: MARTIN[1], r: 3.5 });
    ctx.exclude({ kind: 'circle', x: 3, z: 1, r: 6 });
    ctx.builders.trees({ count: 230, ring: [9, 170], center: [0, -8], height: [8, 14], broken: 0, fallen: 0.04, trunkColor: '#4e3a28', leafColors: ['#4f8a3e', '#5f9a46', '#3e7a3a', '#6fa24a', '#7a9a3a'] }, ctx);
    pines(ctx, { count: 60, ring: [16, 150], center: [0, -8], height: [11, 18], seed: 5, colors: ['#2f5a3e', '#35603f'] });

    trackAvatar(ctx, { hat: true });
  },

  clouds: {
    layers: [{ count: 34, distance: [320, 700], height: [90, 170], size: [25, 55], color: '#ffffff', shade: '#8a9ab0' }],
  },

  player: {
    start: [-1, -5],
    lookAt: [0, -11.5],
    colors: { robe: '#34302c', mantle: '#34302c', skin: '#e0b48e', hair: '#4a3020' },
  },
};
