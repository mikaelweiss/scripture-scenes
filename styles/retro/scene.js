// 3 Nephi 11 and 17: the resurrected Christ descends to the Nephites gathered at the temple
// in Bountiful, after the destruction of 3 Nephi 8-10.
// Units are meters. pos is [x, z] on the ground; +z is south, toward the starting viewpoint.

const CHRIST = [0, -14.5];
const DAIS = [0, -14];

const ruin = (pos, size, height, damage, yaw, tex = 'plaster') => ({ type: 'ruin', pos, size, height, damage, yaw, tex, door: 'south' });
const smoke = (pos, radius = 2) => ({ type: 'smolder', pos, radius });
const farSmoke = (pos) => ({ type: 'smolder', pos, radius: 6, logs: 0, embers: 0, smoke: 34, smokeSize: 10, smokeRise: 3, smokeLife: 22, wind: [1.2, 0, -0.4] });
const crack = (from, to, width = 0.9, glow = false) => ({ type: 'crack', from, to, width, glow, branches: 3 });
const tree = (pos, height = 6, extra = {}) => ({ type: 'deadTree', pos, height, ...extra });
const rubble = (pos, radius = 7, count = 40) => ({ type: 'rubble', pos, radius, count, size: [0.2, 0.9] });

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful<small>The land Bountiful, after the great destruction</small>',
  hint: 'WASD / arrows: move · Mouse: look (click to lock, or drag) · Q/E: turn · Shift: run',
  hintTouch: 'Left thumb: move · Right thumb: look',
  seed: 1830,

  render: { height: 220, snap: 0.5, affine: 0.55, levels: 31 },
  camera: { fov: 60 },
  player: { pos: [0, 35], yaw: 0, pitch: -2 },

  sky: {
    zenith: [0.25, 0.27, 0.33],
    horizon: [0.74, 0.62, 0.5],
    cloudDark: [0.22, 0.2, 0.22],
    cloudLit: [0.98, 0.8, 0.55],
    sunColor: [1, 0.84, 0.55],
    sunDir: [0.6, 0.36, -1],
    cover: 0.64,
    breakSize: 0.07,
  },
  fog: { color: [0.66, 0.57, 0.49], density: 0.0058 },
  light: { dir: [-0.45, 0.8, 0.55], color: [0.78, 0.66, 0.48], sky: [0.5, 0.5, 0.56], ground: [0.32, 0.27, 0.22] },
  ground: {
    size: 1200, inner: 160, seed: 3, bumps: 0.35, tile: 5,
    mountains: { start: 170, height: 70 },
    hills: [{ pos: [0, 43], radius: 20, height: 4 }],
    flats: [{ pos: [0, -31], radius: 52 }],
    colorA: [0.8, 0.7, 0.57], colorB: [0.62, 0.56, 0.47], colorHigh: [0.45, 0.47, 0.42],
  },

  objects: [
    // Temple precinct.
    { type: 'platform', pos: [0, -31], size: [72, 56], height: 0.25, tex: 'flagstone', tile: 4 },
    {
      type: 'stepPyramid', pos: [0, -46], base: [36, 30], top: [13, 10], tiers: 5, tierHeight: 3,
      stairs: { side: 'south', width: 7, rise: 0.4 },
      shrine: { size: [9, 7], height: 4.2, tex: 'plaster', color: [1, 0.96, 0.9], door: 'south', comb: 1.8 },
    },
    { type: 'platform', pos: DAIS, size: [7, 7], height: 1.8, stairs: ['south', 'east', 'west'], stairWidth: 3, rise: 0.3, trim: true },
    { type: 'box', pos: [-11, -21], size: [1.2, 3.4, 0.7], tex: 'stoneDark' },
    { type: 'box', pos: [11, -21], size: [1.2, 3.4, 0.7], tex: 'stoneDark' },
    { type: 'box', pos: [24, -36], size: [1.2, 0.7, 3.4], tex: 'stoneDark', yaw: 20, pitch: 6, solid: false },

    // Lesser buildings, damaged.
    { type: 'platform', pos: [46, -50], size: [16, 14], height: 3, stairs: ['west'], stairWidth: 4, rise: 0.35, trim: true },
    { type: 'building', pos: [46, -50], size: [8, 6], height: 3.5, roof: true, comb: 1, tex: 'plaster', door: 'west' },
    { type: 'stepPyramid', pos: [-48, -54], base: [18, 16], top: [8, 7], tiers: 3, tierHeight: 2.5 },
    ruin([-48, -54], [6, 5], 3, 0.7, 0),

    // Ruined houses and walls around the gathering.
    ruin([-50, -6], [10, 7], 4.5, 0.6, 15),
    ruin([52, -18], [12, 8], 5, 0.5, -10, 'stone'),
    ruin([-46, 24], [8, 8], 3.5, 0.7, 30),
    ruin([44, 28], [9, 6], 4, 0.65, -25, 'stone'),
    ruin([-28, -74], [14, 9], 5.5, 0.5, 5, 'stone'),
    ruin([30, -76], [10, 10], 5, 0.55, -8),
    ruin([-72, -38], [12, 9], 6, 0.45, 12, 'stone'),
    ruin([74, -48], [9, 12], 5, 0.6, -18),
    ruin([-26, 58], [7, 6], 3, 0.7, 40),
    ruin([28, 60], [8, 7], 3.5, 0.6, -35, 'stone'),
    ruin([-84, 18], [10, 8], 4, 0.6, 70),
    ruin([86, 10], [8, 10], 4, 0.55, -60, 'stone'),
    ruin([-42, 92], [11, 8], 4.5, 0.6, 20, 'stone'),
    ruin([14, 108], [9, 9], 5, 0.5, -15),
    ruin([58, 86], [12, 7], 4, 0.65, 35, 'stone'),
    ruin([-78, 70], [8, 9], 3.5, 0.7, -40),
    { type: 'fallenWall', from: [-20, 96], to: [-6, 100], height: 3.5 },
    { type: 'fallenWall', from: [32, 92], to: [42, 102], height: 3, side: -1, tex: 'plaster' },
    { type: 'fallenWall', from: [-36, 40], to: [-24, 47], height: 3 },
    { type: 'fallenWall', from: [30, 42], to: [40, 37], height: 3.2, side: -1 },
    { type: 'fallenWall', from: [-62, 0], to: [-62, 14], height: 3.5, side: -1, tex: 'plaster' },
    { type: 'fallenWall', from: [60, 4], to: [64, -8], height: 3 },
    { type: 'fallenWall', from: [-14, -66], to: [2, -70], height: 4 },
    { type: 'fallenWall', from: [56, 16], to: [46, 19], height: 2.6, tex: 'plaster' },

    // Debris and scars in the earth.
    { type: 'rubble', pos: [0, 0], radius: 150, count: 600, size: [0.15, 0.55] },
    rubble([-50, -6]), rubble([52, -18]), rubble([-46, 24]), rubble([44, 28]), rubble([-28, -74], 9),
    rubble([30, -76], 9), rubble([-72, -38], 9), rubble([74, -48]), rubble([-48, -54], 10, 60),
    rubble([-26, 58], 6), rubble([28, 60], 6), rubble([-30, 44], 6, 30), rubble([35, 40], 6, 30),
    crack([-34, 30], [-14, 60], 1.1, true),
    crack([12, 40], [44, 64], 1),
    crack([38, 2], [66, -30], 1.2, true),
    crack([-40, -20], [-74, -8], 1),
    crack([-21, -36], [-31, -56], 0.7),
    crack([16, -60], [40, -63], 0.8),
    crack([-6, 62], [8, 100], 1.3, true),
    crack([62, 42], [86, 74], 1.2),
    crack([-58, 40], [-90, 60], 1, true),
    smoke([-49, -5], 2), smoke([52, -17], 2.5), smoke([44, 29], 1.5), smoke([-28, -73], 2),
    smoke([73, -48], 2), smoke([-46, 25], 1.5), smoke([28, 61], 1.5), smoke([-36, 50], 1.2),
    smoke([-42, 93], 2), smoke([58, 86], 2), rubble([-42, 92], 9), rubble([14, 108], 8), rubble([58, 86], 9),
    tree([-8, 88], 6), tree([34, 78], 5), tree([-58, 96], 7),
    farSmoke([-150, -170]), farSmoke([190, -120]), farSmoke([150, 160]), farSmoke([-180, 80]), farSmoke([40, -220]),
    tree([-38, 8]), tree([34, 10], 7), tree([-30, 38], 5), tree([18, 50], 6), tree([-58, -28], 8),
    tree([62, -30], 7), tree([-14, 72], 6), tree([12, 76], 5), tree([-80, 34], 7), tree([84, -4], 6),
    tree([-20, 30], 4, { fallen: true, lean: 80 }), tree([50, 44], 5, { fallen: true, lean: 75 }),

    // The multitude, gathered round about, facing Christ.
    {
      type: 'crowd', focus: DAIS, count: 2500, rMin: 9, rMax: 39, arcCenter: 0, arcWidth: 270, spacing: 0.55,
      aisles: [{ angle: 0, width: 3 }],
      types: { man: 24, hooded: 12, woman: 22, womanHair: 9, elder: 7, child: 8, childGirl: 6, kneelMan: 6, kneelWoman: 6 },
      palette: {
        robe: [[0.66, 0.5, 0.34], [0.52, 0.38, 0.26], [0.74, 0.68, 0.56], [0.44, 0.34, 0.25], [0.6, 0.46, 0.3],
          [0.5, 0.44, 0.38], [0.66, 0.36, 0.24], [0.42, 0.44, 0.32], [0.34, 0.36, 0.46], [0.72, 0.6, 0.42], [0.56, 0.3, 0.26]],
        cloak: [[0.42, 0.3, 0.2], [0.34, 0.26, 0.2], [0.56, 0.46, 0.32], [0.3, 0.28, 0.3], [0.5, 0.26, 0.18], [0.36, 0.4, 0.28], [0.6, 0.54, 0.42]],
        skin: [[0.62, 0.43, 0.3], [0.54, 0.36, 0.25], [0.7, 0.5, 0.36], [0.47, 0.31, 0.22]],
        hair: [[0.12, 0.09, 0.07], [0.18, 0.12, 0.08], [0.08, 0.07, 0.06], [0.24, 0.16, 0.1]],
        grayHair: [0.6, 0.58, 0.55],
      },
    },
    // The little children, set round about him (3 Nephi 17:12).
    {
      type: 'crowd', focus: DAIS, count: 46, rMin: 5.4, rMax: 7.4, arcWidth: 360, spacing: 0.6, maxStep: 2,
      types: { child: 1, childGirl: 1 },
      palette: {
        robe: [[0.8, 0.74, 0.6], [0.66, 0.52, 0.36], [0.72, 0.42, 0.3], [0.6, 0.6, 0.48]],
        cloak: [[0.5, 0.36, 0.24], [0.6, 0.5, 0.36]],
        skin: [[0.64, 0.45, 0.32], [0.56, 0.38, 0.27]],
        hair: [[0.12, 0.09, 0.07], [0.2, 0.13, 0.09]],
      },
    },

    // Christ, in white, on the raised place, with light descending.
    {
      type: 'figure', figure: 'christ', pos: CHRIST, height: 1.95, facing: 0, emissive: 0.75,
      colors: { robe: [1, 0.98, 0.94], cloak: [0.94, 0.92, 0.86], skin: [0.76, 0.58, 0.44], hair: [0.34, 0.24, 0.15] },
    },
    { type: 'glowLight', pos: CHRIST, y: 3, radius: 17, color: [0.8, 0.72, 0.5] },
    { type: 'lightShaft', pos: CHRIST, height: 180, radiusBottom: 2.4, radiusTop: 9, color: [1, 0.9, 0.66], intensity: 0.2, fadeBottom: 0.01, fadeTop: 0.5 },
    { type: 'lightShaft', pos: CHRIST, height: 120, radiusBottom: 1.1, radiusTop: 3, color: [1, 0.96, 0.82], intensity: 0.2, fadeBottom: 0.015, fadeTop: 0.6, bands: 3 },
    { type: 'halo', pos: CHRIST, y: 1.05, size: 4.2, stretch: 1.3, color: [1, 0.94, 0.78], intensity: 0.6 },
    { type: 'motes', pos: CHRIST, radius: 2.6, height: 34, count: 90, speed: -1.4, size: 0.28, color: [1, 0.95, 0.8], colorEnd: [1, 0.85, 0.55] },
    { type: 'lightRing', pos: DAIS, onGround: true, radius: 6.4, color: [1, 0.88, 0.6], intensity: 0.55 },
    { type: 'lightShaft', pos: DAIS, onGround: true, height: 3.2, radiusBottom: 6.6, radiusTop: 6.3, color: [1, 0.88, 0.62], intensity: 0.3, fadeBottom: 0.02, fadeTop: 0.95, bands: 9 },
  ],
};
