// Jonah 1: a mighty tempest on the sea. The mariners have cast the cargo out and now cast Jonah
// overboard, and a great fish rises to take him. The player stands on the pitching deck. Bow is -z.
import { person, movingBatch, ocean, rain } from './lib/ot-38-kit.js';

const DECK = 2.3;
const wood = '#6a4a30';
const deckWood = '#9a7a52';

function hullShape(THREE, scale = 1) {
  const s = new THREE.Shape();
  const pts = [[0, -12], [1.8, -8], [2.8, -3], [2.9, 3], [2.5, 7.5], [1.4, 9.6], [-1.4, 9.6], [-2.5, 7.5], [-2.9, 3], [-2.8, -3], [-1.8, -8]];
  pts.forEach(([x, z], i) => (i ? s.lineTo(x * scale, -z * scale) : s.moveTo(x * scale, -z * scale)));
  s.closePath();
  return s;
}

export default {
  title: 'Jonah 1: Jonah and the great fish',
  seed: 41,
  fov: 66,
  exposure: 1.3,

  sun: { direction: [0.5, 0.6, 0.3], color: '#b8c4d4', intensity: 1.6 },
  light: { sky: '#9aaabc', ground: '#3a444c', hemi: 1.5 },
  sky: { top: '#283240', horizon: '#6a7884', ground: '#2a343c', sunColor: '#8090a0', glow: 0.3 },
  fog: { color: '#5a6872', near: 30, far: 260 },
  clouds: { count: 120, shadow: '#1e232a', lit: '#5a6470', rim: '#8a96a2', distance: [120, 700], altitude: [40, 120], hole: 0.02, seed: 9 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.85 },
  grade: { saturation: 0.85, contrast: 1.1, vignette: 0.55, shadowTint: '#1a2438', highlightTint: '#dfe8f0' },
  shadow: { center: [0, 0], radius: 25 },

  player: { start: [0.4, 8.4], yaw: -0.95, pitch: -0.06, eye: 1.65, speed: 3 },

  terrain: {
    size: 600, segments: 30, seed: 41, hills: 0, bumps: 0,
    flats: [{ x: 0, z: 0, r: 1000, falloff: 10, height: -14 }],
    colors: { ground: '#1a2430', groundAlt: '#1a2430', grass: '#1a2430', rock: '#1a2430' },
  },

  custom(ctx) {
    const { THREE, scene, colliders } = ctx;
    const waveAt = ocean(ctx, { size: 700, segments: 170, color: '#2a4250', amp: 0.75 });
    rain(ctx, { count: 3000, box: 50, height: 30, speed: 30, slant: [4, 1.5], opacity: 0.3 });

    const ship = new THREE.Group();
    scene.add(ship);
    const hull = movingBatch(ctx.rand, (b) => {
      b.add(new THREE.ExtrudeGeometry(hullShape(THREE), { depth: DECK + 1.6, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -1.6, 0), { color: wood, jitter: 0.06 });
      b.add(new THREE.ExtrudeGeometry(hullShape(THREE, 0.93), { depth: 0.1, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, DECK - 0.08, 0), { color: deckWood, jitter: 0.05 });
      for (let i = -11; i <= 9; i += 0.9) b.box(5.4, 0.02, 0.05, { position: [0, DECK + 0.03, i], color: '#7a5a3a' });
      // Bulwarks.
      const rail = [[0, -12], [1.8, -8], [2.8, -3], [2.9, 3], [2.5, 7.5], [1.4, 9.6]];
      for (const side of [-1, 1]) {
        for (let i = 0; i < rail.length - 1; i++) {
          const [ax, az] = rail[i], [bx, bz] = rail[i + 1];
          const len = Math.hypot(bx - ax, bz - az);
          b.box(0.2, 0.9, len + 0.1, { position: [side * (ax + bx) / 2, DECK + 0.45, (az + bz) / 2], rotation: [0, Math.atan2(side * (bx - ax), bz - az), 0], color: '#5a3c26' });
        }
      }
      b.box(2.9, 0.9, 0.2, { position: [0, DECK + 0.45, 9.6], color: '#5a3c26' });
      // Raised stern deck with steps, steering oar.
      b.box(4.6, 1.0, 3.2, { position: [0, DECK + 0.5, 8], color: deckWood });
      for (let i = 0; i < 3; i++) b.box(1.4, 0.33 * (i + 1), 0.4, { position: [1.2, DECK + 0.165 * (i + 1), 6.2 - i * 0.4], color: '#8a6a44' });
      b.box(0.18, 0.18, 6, { position: [2.3, DECK + 0.4, 11], rotation: [0.45, 0.3, 0], color: '#4a3020' });
      // Prow post.
      b.box(0.4, 3, 0.4, { position: [0, DECK + 0.8, -12.2], rotation: [-0.35, 0, 0], color: wood });
      // Mast, yard and torn sail.
      b.add(new THREE.CylinderGeometry(0.18, 0.25, 13, 7), { position: [0, DECK + 6.5, -2], color: '#5a3c26' });
      b.add(new THREE.CylinderGeometry(0.1, 0.12, 9, 6), { position: [0, DECK + 11, -2], rotation: [0, 0, Math.PI / 2 - 0.25], color: '#5a3c26' });
      const sail = new THREE.PlaneGeometry(8, 5, 6, 4);
      const sp = sail.attributes.position;
      for (let i = 0; i < sp.count; i++) {
        const x = sp.getX(i), y = sp.getY(i);
        sp.setZ(i, Math.cos((x / 8) * Math.PI) * 1.4 + Math.sin(x * 3.1 + y * 2.3) * 0.2);
        if (y < -1.5 && x > 1) sp.setY(i, y + (x - 1) * 0.6);
      }
      b.add(sail, { position: [0, DECK + 8.3, -1.6], rotation: [0, 0, -0.25], color: '#c8b896', jitter: 0.06 });
      b.add(sail.clone().rotateY(Math.PI), { position: [0, DECK + 8.3, -1.62], rotation: [0, 0, -0.25], color: '#b8a886', jitter: 0.06 });
      for (const [x, z] of [[-2.6, -1], [2.6, -1], [0, -11.5]]) {
        const top = [0, DECK + 12.5, -2];
        const len = Math.hypot(x - top[0], DECK + 0.9 - top[1], z - top[2]);
        const geo = new THREE.CylinderGeometry(0.03, 0.03, len, 4);
        const mid = [(x + top[0]) / 2, (DECK + 0.9 + top[1]) / 2, (z + top[2]) / 2];
        const dir = new THREE.Vector3(x - top[0], DECK + 0.9 - top[1], z - top[2]).normalize();
        geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
        b.add(geo, { position: mid, color: '#3a2a1a' });
      }
      // Remaining cargo: jars and crates, some knocked over.
      for (const [x, z, kind, rot] of [[-1.6, -6, 0, 0], [-1.2, -5.2, 0, 1.4], [1.5, -7, 1, 0.3], [-1.8, 1.5, 1, 0.1], [1.7, 1, 0, 0], [-0.8, -8.5, 1, 0.5]]) {
        if (kind) b.box(0.9, 0.8, 0.9, { position: [x, DECK + 0.4, z], rotation: [0, rot, 0], color: '#7a5a36' });
        else b.add(new THREE.CylinderGeometry(0.22, 0.35, 0.9, 7), { position: [x, DECK + (rot ? 0.3 : 0.45), z], rotation: [0, 0, rot], color: '#a0603a' });
      }
      // Coiled rope.
      b.add(new THREE.TorusGeometry(0.35, 0.08, 4, 9).rotateX(Math.PI / 2), { position: [-1.6, DECK + 0.08, 4], color: '#8a7a5a' });
    });
    ship.add(hull);

    // Sailors: those at the starboard rail have just let Jonah go; others pray to their gods or bail.
    const sailor = (x, z, face, extra = {}) =>
      person(ctx, { x, z, y: DECK, face, parent: ship, robe: ctx.rand.pick(['#6a5a48', '#4a5a6a', '#7a4a34', '#8a7a5a', '#5a4a3a']), mantle: ctx.rand() < 0.5 ? '#3a3028' : null, skin: ctx.rand.pick(['#8a5a3c', '#9b6a46', '#a87652']), hood: ctx.rand() < 0.3, ...extra });
    sailor(2.1, 1.2, [10, 1.2], { arms: 'out', tilt: [0.3, 0] });
    sailor(2.0, 2.4, [10, 3], { arms: 'out', tilt: [0.25, 0] });
    sailor(1.9, 0.0, [10, -1], { arms: 'out', tilt: [0.2, 0] });
    sailor(-1.0, 0.8, [6, 1.5], { arms: 'out' });
    sailor(-2.0, -3.5, [-6, -3], { tilt: [0.5, 0], arms: 'down' });
    sailor(0.6, -9, [0, -20], { arms: 'out', tilt: [-0.15, 0] });
    sailor(-1.8, 8.8, [0, -10], { y: DECK + 1 });
    sailor(-1.5, -1.5, [3, 1], { arms: 'down' });

    // Jonah falling over the side.
    const jonah = person(ctx, { x: 2.7, z: 1.4, y: DECK + 1.25, face: [10, 1.4], parent: ship, robe: '#8a5a8a', mantle: '#d8c8a0', skin: '#9b6a46', arms: 'out' });
    jonah.rotation.order = 'YXZ';
    jonah.rotation.x = 1.45;

    // The great fish surging up beside the ship, mouth open toward Jonah. Built facing -z, then turned toward the ship.
    const fish = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    const plain = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true, side: THREE.DoubleSide });
    const backColor = new THREE.Color('#5a7e94'), bellyColor = new THREE.Color('#dcd8c8');
    const shaded = (geo, split) => {
      const pos = geo.attributes.position;
      const col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i += 3) {
        const c = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3 < split ? bellyColor : backColor;
        for (let k = 0; k < 3; k++) c.toArray(col, (i + k) * 3);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      return geo;
    };
    const part = (mesh, pos, rot = [0, 0, 0], parent = fish) => {
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      parent.add(mesh);
      return mesh;
    };
    part(new THREE.Mesh(shaded(new THREE.IcosahedronGeometry(1, 1).scale(3, 2.5, 8), -0.7), skin), [0, 0, 1]);
    part(new THREE.Mesh(shaded(new THREE.IcosahedronGeometry(1, 1).scale(1.3, 1.2, 4.4), -0.4), skin), [0, 1.6, 10.5], [-0.45, 0, 0]);
    // Jaws hinge open at the back of the head.
    const hinge = part(new THREE.Group(), [0, 0.3, -5.2]);
    part(new THREE.Mesh(shaded(new THREE.IcosahedronGeometry(1, 1).scale(2.8, 1.4, 4), -1), skin), [0, 0.7, -3], [0.62, 0, 0], hinge);
    part(new THREE.Mesh(shaded(new THREE.IcosahedronGeometry(1, 1).scale(2.4, 0.7, 3.8), 0.6), skin), [0, -0.9, -2.8], [-0.5, 0, 0], hinge);
    part(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0).scale(2.2, 2, 2.8), plain('#9a3a40')), [0, 0, -2.6], [0, 0, 0], hinge);
    const tooth = new THREE.ConeGeometry(0.16, 0.5, 4);
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 2.2, x = Math.sin(a) * 1.9, z = -4.4 + (1 - Math.cos(a)) * 2.2;
      part(new THREE.Mesh(tooth, plain('#f0ece0')), [x, -0.05 - (z + 4.4) * 0.3, z + 0.3], [0, 0, 0], hinge);
    }
    for (const s of [-1, 1]) {
      part(new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), plain('#f0ead8')), [s * 2.2, 1.3, -1.4], [0, 0, 0], hinge);
      part(new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), plain('#141414')), [s * 2.42, 1.35, -1.55], [0, 0, 0], hinge);
      // Pectoral fins.
      part(new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.6, 4).scale(1, 1, 0.22), plain('#7aa0b6')), [s * 3.6, -0.6, -1.5], [0.9, 0, s * 1.2]);
    }
    part(new THREE.Mesh(new THREE.ConeGeometry(1.3, 3.2, 4).scale(0.22, 1, 1), plain('#7aa0b6')), [0, 3, 1.5], [0.7, 0, 0]);
    // Forked tail fin, raised clear of the water.
    const lobe = new THREE.ConeGeometry(1.6, 6.5, 4).scale(0.22, 1, 1).translate(0, 3, 0);
    part(new THREE.Mesh(lobe, plain('#7aa0b6')), [0, 4, 13.4], [0.45, 0, 0]);
    part(new THREE.Mesh(lobe, plain('#7aa0b6')), [0, 4, 13.4], [1.75, 0, 0]);
    fish.position.set(15.5, 0.2, -1);
    fish.scale.setScalar(0.9);
    fish.rotation.set(0.3, Math.PI / 2 - 0.25, 0, 'YXZ');
    scene.add(fish);
    const fishLight = new THREE.PointLight('#c8dce8', 40, 30, 1.2);
    fishLight.position.set(4, 10, 4);
    scene.add(fishLight);

    // Foam where the fish breaks the surface.
    const foam = new THREE.Group();
    const foamMat = new THREE.MeshLambertMaterial({ color: '#d8e2e6', emissive: '#556066', flatShading: true });
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2, r = ctx.rand.range(3, 3.8);
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(ctx.rand.range(0.25, 0.5), 0), foamMat);
      puff.position.set(Math.cos(a) * r * 3, ctx.rand.range(-0.1, 0.2), Math.sin(a) * r * 0.9);
      puff.scale.y = 0.4;
      foam.add(puff);
    }
    scene.add(foam);

    // Cargo cast into the sea.
    const flotsam = [];
    for (let i = 0; i < 9; i++) {
      const r = ctx.rand;
      const m = new THREE.Mesh(r() < 0.5 ? new THREE.BoxGeometry(0.9, 0.8, 0.9) : new THREE.CylinderGeometry(0.25, 0.35, 0.9, 7), new THREE.MeshLambertMaterial({ color: r.pick(['#7a5a36', '#a0603a']), flatShading: true }));
      const x = r.range(-25, 25) + (r() < 0.5 ? -8 : 8), z = r.range(-30, 25);
      m.userData = { x, z, spin: r() * 6 };
      flotsam.push(m);
      scene.add(m);
    }

    // Collision: the deck is the floor, bulwarks and mast keep you aboard.
    colliders.add({ x: 0, z: -0.5, w: 5.6, d: 17, bottom: -2, top: DECK });
    colliders.add({ x: 0, z: -9, w: 3.2, d: 5, bottom: -2, top: DECK });
    colliders.add({ x: 0, z: 8, w: 4.6, d: 3.2, bottom: -2, top: DECK + 1 });
    colliders.add({ x: 1.2, z: 6.0, w: 1.4, d: 1.2, bottom: -2, top: DECK + 0.5 });
    for (const side of [-1, 1]) {
      colliders.add({ x: side * 2.75, z: 0, w: 0.4, d: 12, bottom: -2, top: DECK + 4 });
      colliders.add({ x: side * 2.0, z: -8, w: 0.5, d: 9, rot: side * 0.32, bottom: -2, top: DECK + 4 });
      colliders.add({ x: side * 2.4, z: 7.5, w: 0.5, d: 6, rot: side * -0.15, bottom: -2, top: DECK + 4 });
    }
    colliders.add({ x: 0, z: 9.9, w: 5, d: 0.5, bottom: -2, top: DECK + 4 });
    colliders.add({ x: 0, z: -12, w: 2, d: 0.6, bottom: -2, top: DECK + 4 });
    colliders.add({ x: 0, z: -2, w: 0.6, d: 0.6, bottom: -2, top: DECK + 12 });

    // Lightning.
    const flash = new THREE.AmbientLight('#d8e4ff', 0);
    scene.add(flash);
    const boltPts = [];
    let bx = 0, by = 150;
    while (by > 0) {
      const nx = bx + (ctx.rand() - 0.5) * 14, ny = by - ctx.rand.range(8, 18);
      boltPts.push(bx, by, 0, nx, Math.max(0, ny), 0);
      bx = nx;
      by = ny;
    }
    const boltGeo = new THREE.BufferGeometry();
    boltGeo.setAttribute('position', new THREE.Float32BufferAttribute(boltPts, 3));
    const bolt = new THREE.LineSegments(boltGeo, new THREE.LineBasicMaterial({ color: '#f4f8ff', fog: false, toneMapped: false }));
    bolt.visible = false;
    scene.add(bolt);
    let nextFlash = 2.5, flashT = -10;

    const shipQ = new THREE.Quaternion();
    ctx.onFrame((t, dt, camera) => {
      const bob = waveAt(0, 0, t) * 0.55 - 0.2;
      ship.position.y = bob;
      ship.rotation.set(Math.sin(t * 0.7) * 0.05, 0, Math.sin(t * 0.9 + 0.6) * 0.09, 'XYZ');
      ship.updateMatrixWorld();
      camera.position.applyMatrix4(ship.matrixWorld);
      shipQ.setFromRotationMatrix(ship.matrixWorld);
      camera.quaternion.premultiply(shipQ);

      fish.position.y = 0.2 + Math.sin(t * 0.6) * 0.3;
      foam.position.set(15, waveAt(15, 0.5, t), 0.5);
      for (const m of flotsam) {
        const { x, z, spin } = m.userData;
        m.position.set(x, waveAt(x, z, t) + 0.1, z);
        m.rotation.set(Math.sin(t + spin) * 0.4, spin + t * 0.1, Math.cos(t * 1.3 + spin) * 0.4);
      }

      if (t > nextFlash) {
        flashT = t;
        nextFlash = t + 3 + ((t * 7.31) % 1) * 5;
        bolt.position.set(-60 + ((t * 13.7) % 1) * 120, 0, -160);
      }
      const k = t - flashT;
      const on = k < 0.35 ? (k < 0.08 || (k > 0.16 && k < 0.24) ? 1 : 0.3) : 0;
      flash.intensity = on * 2.2;
      bolt.visible = on > 0.5;
    });
  },
};
