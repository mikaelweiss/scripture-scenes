const house = (x, y, w, d, ruin = 0.55) => ({ kind: 'house', x, y, w, d, ruin });
const wall = (x0, y0, x1, y1, broken = 0.5, t = 5) => ({ kind: 'wall', x0, y0, x1, y1, broken, t });
const at = (kind, x, y, extra = {}) => ({ kind, x, y, ...extra });

export default {
  title: '3 Nephi 11: Christ at the Temple in Bountiful',
  seed: 11,
  world: { w: 1280, h: 880 },
  camera: { focus: [640, 205], hold: 150, release: 420, min: 0.2 },
  light: { intro: 2, warm: '#fff2da', cool: '#b4a6c2', vignette: 0.42, rays: [140, 360, 600, 830, 1060] },

  ground: {
    base: 'grass',
    areas: [
      { type: 'dirt', ellipse: [640, 600, 420, 160], edge: 20 },
      { type: 'pavement', rect: [300, 180, 680, 330], edge: 12 },
      { type: 'pavement', rect: [480, 66, 320, 130], edge: 6 },
      { type: 'pavement', rect: [618, 500, 44, 380], edge: 3 },
      { type: 'dirt', ellipse: [76, 275, 64, 44] },
      { type: 'dirt', ellipse: [180, 412, 50, 36] },
      { type: 'dirt', ellipse: [70, 548, 64, 44] },
      { type: 'dirt', ellipse: [1147, 256, 64, 44] },
      { type: 'dirt', ellipse: [1182, 424, 52, 38] },
      { type: 'dirt', ellipse: [1100, 588, 64, 44] },
      { type: 'dirt', ellipse: [395, 625, 56, 40] },
      { type: 'dirt', ellipse: [838, 626, 56, 40] },
      { type: 'ash', circle: [150, 470, 40], edge: 10 },
      { type: 'ash', circle: [1120, 640, 50], edge: 10 },
      { type: 'ash', circle: [700, 640, 46], edge: 10 },
      { type: 'ash', circle: [430, 80, 34], edge: 10 },
    ],
    fissures: [
      { points: [[40, 720], [160, 690], [260, 700], [350, 640], [430, 600], [470, 560]], width: 7, glow: true },
      { points: [[1260, 300], [1150, 330], [1040, 320], [960, 360], [900, 345]], width: 6 },
      { points: [[600, 880], [700, 820], [780, 800], [860, 820], [960, 780], [1080, 800], [1200, 770]], width: 8, glow: true },
      { points: [[40, 120], [140, 150], [230, 140], [300, 190], [360, 220]], width: 5 },
      { points: [[790, 150], [830, 175], [880, 160], [930, 190]], width: 4 },
      { points: [[330, 300], [420, 330], [520, 320], [580, 370]], width: 5 },
    ],
    stones: [
      { x: 512, y: 186, r: 22, count: 30 },
      { x: 772, y: 180, r: 26, count: 34 },
      { x: 640, y: 74, r: 60, count: 30 },
      { x: 118, y: 306, r: 34, count: 34, mat: 'adobe', shards: true },
      { x: 1150, y: 296, r: 34, count: 34, mat: 'adobe', shards: true },
      { x: 400, y: 664, r: 32, count: 30, mat: 'adobe', shards: true },
      { x: 840, y: 666, r: 32, count: 30, mat: 'adobe', shards: true },
      { x: 300, y: 536, r: 22, count: 22 },
      { x: 990, y: 520, r: 22, count: 22 },
      { x: 640, y: 540, r: 50, count: 26 },
      { x: 240, y: 600, r: 40, count: 24, mat: 'basalt' },
      { x: 1040, y: 420, r: 40, count: 24, mat: 'basalt' },
    ],
  },

  objects: [
    {
      kind: 'pyramid', x: 528, y: 116, w: 224, d: 64, tiers: 4, tierH: 18, inset: 11, insetD: 7,
      stairW: 30, stairProj: 22, damage: 0.3, shrine: { w: 56, d: 16, h: 20, comb: 6 },
    },
    { kind: 'dais', x: 610, y: 218, w: 60, d: 26, h: 8, steps: 6, stepW: 22 },
    at('stela', 500, 206),
    at('boulder', 512, 172, { rx: 8, ry: 5, h: 8, mat: 'limestone' }), at('boulder', 774, 188, { rx: 6, ry: 4, h: 6, mat: 'limestone' }),
    at('boulder', 792, 150, { rx: 7, ry: 5, h: 7, mat: 'limestone' }), at('smolder', 466, 132),
    at('column', 752, 196, { len: 34, r: 4 }),

    house(40, 250, 72, 50), house(150, 390, 60, 44, 0.7), house(30, 520, 80, 56),
    wall(20, 180, 220, 168),
    at('burntTree', 235, 300), at('burntTree', 95, 470, { h: 32 }), at('burntTree', 200, 520),
    at('palm', 175, 250), at('palm', 40, 650),
    at('smolder', 130, 340), at('smolder', 215, 610),
    at('boulder', 260, 420, { rx: 7, ry: 5, h: 7 }), at('boulder', 120, 600),

    house(1110, 230, 74, 52), house(1150, 400, 64, 48, 0.7), house(1060, 560, 80, 56), house(1180, 700, 60, 50),
    wall(1060, 170, 1250, 190),
    at('burntTree', 1045, 300), at('burntTree', 1220, 520, { h: 30 }),
    at('palm', 1250, 330), at('tree', 1020, 650),
    at('smolder', 1090, 470), at('smolder', 1120, 340),
    at('boulder', 1230, 620, { rx: 8, ry: 5, h: 8 }),

    wall(320, 70, 470, 58, 0.6), wall(810, 60, 960, 75, 0.6),
    at('burntTree', 400, 44), at('burntTree', 880, 48, { h: 30 }),
    at('palm', 300, 110), at('palm', 985, 100), at('tree', 455, 118, { r: 10 }),
    at('smolder', 850, 112),

    wall(292, 200, 288, 500, 0.75, 8), wall(990, 200, 994, 500, 0.75, 8),
    wall(300, 530, 600, 536, 0.6), wall(680, 536, 980, 528, 0.6),

    house(360, 600, 70, 50), house(800, 600, 76, 52, 0.7), house(200, 760, 64, 46), house(1000, 740, 70, 50), house(470, 760, 60, 44, 0.75),
    at('column', 520, 690, { len: 44 }), at('column', 720, 720, { len: 36 }),
    at('smolder', 545, 652), at('smolder', 905, 700),
    at('burntTree', 300, 640), at('burntTree', 960, 620, { h: 26 }), at('palm', 745, 820), at('tree', 560, 840),
    at('boulder', 690, 600, { rx: 6, ry: 4, h: 6, mat: 'limestone' }), at('boulder', 430, 720), at('boulder', 880, 860, { rx: 9, ry: 5, h: 8 }),
  ],

  christ: { x: 640, y: 230, look: { skin: '#c49a74', hair: '#6b4a2e', robe: '#fbf8ef' } },

  children: {
    center: [640, 276], rx: 40, ry: 15, count: 16, looks: 12,
    poses: { stand: 0.4, sit: 0.6 },
    palette: {
      skins: ['#8a5a3c', '#9c6644', '#a8714a', '#b57d55'],
      hair: ['#1c1714', '#2a201a', '#3a2a1e'],
      shawls: ['#e0d4b8'],
      robes: ['#e3d6b6', '#cdb88e', '#b88a5e', '#a86a4a', '#c9a878'],
      cloaks: ['#e3d6b6', '#cdb88e'],
      belts: ['#7a2e22', '#5a3a24'],
    },
  },

  crowd: {
    count: 2500, center: [640, 238], rMin: 64, squash: 0.8, angles: [-32, 212],
    spacing: [8, 6], jitter: 1.5, ragged: 80,
    aisle: { x: 640, width: 18, fromY: 285 },
    clear: [[640, 272, 58]],
    looks: 56,
    poses: { stand: 0.7, kneel: 0.2, raise: 0.1 },
    palette: {
      covered: 0.5,
      skins: ['#8a5a3c', '#9c6644', '#a8714a', '#7a4e33', '#b57d55', '#6e4430'],
      hair: ['#1c1714', '#2a201a', '#3a2a1e', '#4a3526', '#76706a'],
      shawls: ['#e6dcc4', '#d8cdb4', '#a8946e', '#b0604a', '#6e7f96', '#c9b48a', '#7f8f5e', '#d9b070', '#8e5a7a'],
      robes: ['#c9b892', '#a8916a', '#8a6a48', '#6e5238', '#9a5a3c', '#7a6a4a', '#b39c78', '#5e4a3a', '#d6c9a8', '#86704f', '#6b5f55', '#9b7b52'],
      cloaks: ['#7a4a32', '#8c7650', '#4e5a46', '#a0503a', '#a08058', '#c4b08a', '#d8c9a4', '#6f7f6a', '#5a6a86', '#b89a62'],
      belts: ['#5a3a24', '#7a2e22', '#3a3a50', '#8a6a2a'],
    },
  },

  player: { x: 640, y: 342, look: { skin: '#a8714a', hair: '#2a201a', robe: '#e2d4b0', cloak: '#2f6f86', belt: '#b0402c' } },

  talk: {
    christ: {
      name: 'Jesus Christ',
      lines: [
        { text: 'Behold, I am Jesus Christ, whom the prophets testified shall come into the world.', ref: '3 Nephi 11:10' },
        { text: 'And behold, I am the light and the life of the world; and I have drunk out of that bitter cup which the Father hath given me, and have glorified the Father in taking upon me the sins of the world.', ref: '3 Nephi 11:11' },
        { text: 'Arise and come forth unto me, that ye may thrust your hands into my side, and also that ye may feel the prints of the nails in my hands and in my feet, that ye may know that I am the God of Israel, and the God of the whole earth, and have been slain for the sins of the world.', ref: '3 Nephi 11:14' },
        { text: 'And again I say unto you, ye must repent, and be baptized in my name, and become as a little child, or ye can in nowise inherit the kingdom of God.', ref: '3 Nephi 11:38' },
        { text: 'Behold your little ones.', ref: '3 Nephi 17:23' },
      ],
    },
    crowd: {
      name: 'A Nephite',
      lines: [
        { text: 'Behold my Beloved Son, in whom I am well pleased, in whom I have glorified my name: hear ye him.', ref: 'The voice from heaven, 3 Nephi 11:7' },
        { text: 'They saw a Man descending out of heaven; and he was clothed in a white robe; and he came down and stood in the midst of them.', ref: '3 Nephi 11:8' },
        { text: 'It did pierce them to the very soul, and did cause their hearts to burn.', ref: '3 Nephi 11:3' },
        { text: 'Hosanna! Blessed be the name of the Most High God!', ref: '3 Nephi 11:17' },
        { text: 'They were marveling and wondering one with another, and were showing one to another the great and marvelous change which had taken place.', ref: '3 Nephi 11:1' },
        { text: 'And did see with their eyes and did feel with their hands, and did know of a surety and did bear record, that it was he, of whom it was written by the prophets, that should come.', ref: '3 Nephi 11:15' },
      ],
    },
    children: {
      name: 'A little one',
      lines: [
        { text: 'He took their little children, one by one, and blessed them, and prayed unto the Father for them.', ref: '3 Nephi 17:21' },
        { text: 'They saw angels descending out of heaven as it were in the midst of fire; and they came down and encircled those little ones about.', ref: '3 Nephi 17:24' },
      ],
    },
  },
};
