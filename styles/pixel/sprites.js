import { rgb, tone, mix, PixBuf, WHITE } from './art.js';

const ADULT = {
  stand: {
    down: ['..oooo..', '.ohhhho.', '.ohssho.', '.osssso.', '..oSSo..', '.occcco.', 'occrrcco', 'ocrrrrco', 'osrbbrso', '.orrrro.', '.orrrRo.', '.olrrRo.', '.oRRRRo.', '..f..f..'],
    up: ['..oooo..', '.ohhhho.', '.ohhhho.', '.oHhhHo.', '..oHHo..', '.occcco.', 'occcccco', 'occcccCo', 'oscbbcso', '.orrrro.', '.orrrRo.', '.orrrRo.', '.oRRRRo.', '..f..f..'],
    right: ['..oooo..', '.ohhhho.', '.ohhsso.', '.ohsssso', '..oSSo..', '..occo..', '.occcco.', '.occrso.', '.ocbbbo.', '.orrrro.', '.orrrRo.', '.orrrRo.', '.oRRRRo.', '..f..f..'],
  },
  kneel: {
    down: ['........', '........', '........', '..oooo..', '.ohhhho.', '.ohssho.', '.osssso.', '..oSSo..', '.occcco.', 'occrrcco', 'osrbbrso', 'orrrrrRo', 'oRRRRRRo', '.oooooo.'],
    up: ['........', '........', '........', '..oooo..', '.ohhhho.', '.ohhhho.', '.oHhhHo.', '..oHHo..', '.occcco.', 'occcccco', 'oscbbcso', 'orrrrrRo', 'oRRRRRRo', '.oooooo.'],
    right: ['........', '........', '........', '..oooo..', '.ohhhho.', '.ohhsso.', '.ohsssso', '..oSSo..', '.occcco.', '.occrso.', '.ocbbbo.', 'orrrrRo.', 'oRRRRRRo', '.oooooo.'],
  },
  raise: {
    down: ['s.oooo.s', 'sohhhhos', 'cohsshoc', 'cossssoc', 'cooSSooc', '.occcco.', '.ocrrco.', '.orrrro.', '.orbbro.', '.orrrro.', '.orrrRo.', '.olrrRo.', '.oRRRRo.', '..f..f..'],
    up: ['s.oooo.s', 'sohhhhos', 'cohhhhoc', 'coHhhHoc', 'cooHHooc', '.occcco.', '.occcco.', '.occcco.', '.ocbbco.', '.orrrro.', '.orrrRo.', '.orrrRo.', '.oRRRRo.', '..f..f..'],
  },
};
ADULT.raise.right = ADULT.stand.right;

const CHILD = {
  stand: {
    down: ['.oooo.', 'ohhhho', 'ohssho', '.oSSo.', 'orrrro', 'srrrrs', 'orbbro', '.oRRo.', '.f..f.'],
    up: ['.oooo.', 'ohhhho', 'ohhhho', '.oHHo.', 'orrrro', 'srrrrs', 'orbbro', '.oRRo.', '.f..f.'],
    right: ['.oooo.', 'ohhhho', 'ohhsso', '.oSSo.', '.orro.', '.orrs.', '.obbo.', '.oRRo.', '..ff..'],
  },
  sit: {
    down: ['......', '......', '.oooo.', 'ohhhho', 'ohssho', '.oSSo.', 'orrrro', 'sRRRRs', '.oooo.'],
    up: ['......', '......', '.oooo.', 'ohhhho', 'ohhhho', '.oHHo.', 'orrrro', 'sRRRRs', '.oooo.'],
    right: ['......', '......', '.oooo.', 'ohhhho', 'ohhsso', '.oSSo.', '.orrso', 'oRRRRo', '.oooo.'],
  },
};

const CHRIST = [
  '.....oooo.....', '....ohhhho....', '....ohssho....', '....ohssho....', '....ohSSho....', '...owwwwwwo...', '..owwwwwwwwo..',
  '.owwWwwwwWwwo.', 'owwWowwwwoWwwo', 'oWWooWwwWooWWo', 'oss.oWwwWo.sso', '.oo.oWwwWo.oo.', '....oWwwwo....', '....owwwwo....',
  '...owwwwwWo...', '...owwwwwWo...', '...owwwwwWo...', '..owwwwwwwWo..', '..owwwwwwwWo..', '..oWWWWWWWWo..', '...oooooooo...',
];

export const KINDS = { adult: { templates: ADULT, poses: Object.keys(ADULT), head: 5 }, child: { templates: CHILD, poses: Object.keys(CHILD), head: 3 } };
export const FACINGS = ['down', 'up', 'left', 'right'];

export function slots(look) {
  const s = rgb(look.skin), h = rgb(look.hair), r = rgb(look.robe), c = rgb(look.cloak ?? look.robe);
  return {
    o: rgb(look.outline ?? '#2a1c18'),
    h, H: tone(h, 0.75), s, S: tone(s, 0.8),
    r, R: tone(r, 0.78), l: mix(r, WHITE, 0.2),
    c, C: tone(c, 0.78),
    b: rgb(look.belt ?? '#5a3a24'),
    f: rgb('#3a2618'),
    w: rgb('#fbf8ef'), W: rgb('#d6dae6'),
  };
}

function paint(buf, ox, oy, rows, colors, mirror) {
  const w = rows[0].length;
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const c = colors[row[x]];
      if (c) buf.set(ox + (mirror ? w - 1 - x : x), oy + y, c);
    }
  });
}

function nod(rows, head) {
  const k = rows.findIndex((r) => r.trim().replace(/\./g, '') !== '');
  const blank = '.'.repeat(rows[0].length);
  return [...rows.slice(0, k), blank, ...rows.slice(k, k + head), ...rows.slice(k + head + 1)];
}

function withFeet(rows, feet) {
  return [...rows.slice(0, -1), feet];
}

function pack(list) {
  const W = 256, rects = new Int16Array(list.length * 4);
  let x = 0, y = 0, rowH = 0;
  list.forEach((s, i) => {
    const w = s.rows[0].length, h = s.rows.length;
    if (x + w > W) { x = 0; y += rowH + 1; rowH = 0; }
    rects.set([x, y, w, h], i * 4);
    x += w + 1;
    rowH = Math.max(rowH, h);
  });
  const buf = new PixBuf(W, y + rowH + 1);
  list.forEach((s, i) => paint(buf, rects[i * 4], rects[i * 4 + 1], s.rows, s.colors, s.mirror));
  return { canvas: buf.toCanvas(), rects };
}

// Sprite id = base[kind] + ((look * poses + pose) * 4 + facing) * 2 + frame
export function buildPeople(looks) {
  const list = [], base = {};
  for (const [kind, def] of Object.entries(KINDS)) {
    base[kind] = list.length;
    for (const look of looks[kind]) {
      const colors = slots(look);
      for (const pose of def.poses)
        for (const facing of FACINGS) {
          const rows = def.templates[pose][facing === 'left' ? 'right' : facing];
          for (const frame of [rows, nod(rows, def.head)]) list.push({ rows: frame, colors, mirror: facing === 'left' });
        }
    }
  }
  const { canvas, rects } = pack(list);
  const id = (kind, look, pose, facing, frame) => base[kind] + ((look * KINDS[kind].poses.length + pose) * 4 + facing) * 2 + frame;
  return { canvas, rects, id };
}

const STEPS = { down: ['..f..f..', '..f.....', '.....f..'], up: ['..f..f..', '.....f..', '..f.....'], right: ['..f..f..', '.f....f.', '...ff...'] };

// Walker id = facing * 3 + frame (0 stand, 1 and 2 step)
export function buildWalker(look) {
  const colors = slots(look), list = [];
  for (const facing of FACINGS) {
    const key = facing === 'left' ? 'right' : facing;
    for (const feet of STEPS[key]) list.push({ rows: withFeet(ADULT.stand[key], feet), colors, mirror: facing === 'left' });
  }
  return pack(list);
}

export function buildChrist(look) {
  const colors = { ...slots(look), o: rgb(look.outline ?? '#8a8478') };
  return pack([{ rows: CHRIST, colors }]);
}
