// Builds the profile README and its animated SVGs (assets/*.svg) from PROFILE below.
// Usage: npm run build   (writes ../../assets/*.svg and ../../README.md)
//
// Each SVG is self-contained: the fonts are embedded (Space Grotesk, JetBrains Mono and
// Instrument Serif, all SIL OFL) and the motion is plain CSS/SMIL, which GitHub keeps
// playing inside <img>.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// ================================================================ content
const PROFILE = {
  name: ['Hazni', 'Güleç'],
  role: 'Senior Mobile Developer',
  labels: ['MOBILE · FLUTTER', 'ISTANBUL · UTC+3'],
  // "<sentence> <word>", the word cycles through the list
  sentence: 'Fintech & enterprise apps that feel',
  words: ['instant.', 'native.', 'secure.', 'effortless.'],
  badge: 'SENIOR MOBILE DEVELOPER • FLUTTER • DART • ',
  stat: { value: '5+', label: 'YEARS IN MOBILE' },
  // shown in capitals, except names that start in lower case (eKYC)
  marquee: ['Flutter', 'Dart', 'BLoC', 'RxDart', 'WebSocket', 'MQTT', 'eKYC', 'Firebase', 'CI/CD'],
  work: {
    label: 'SELECTED WORK',
    tag: 'FINTECH · ENTERPRISE',
    title: ["What I've ", 'built.'],
    items: [
      {
        kicker: '01 · ARCHITECTURE',
        title: 'Real-time market data',
        body: 'One source of truth for live prices: cache, streams, WebSockets.',
        glyph: 'spark',
      },
      {
        kicker: '02 · NATIVE',
        title: 'Identity checks (eKYC)',
        body: 'NFC ID reading, OCR, face liveness, video call via native SDKs.',
        glyph: 'scan',
      },
      {
        kicker: '03 · OWNERSHIP',
        title: 'Buy & sell, rebuilt',
        body: 'Every buy and sell screen on a clean, testable architecture.',
        glyph: 'blocks',
      },
    ],
  },
  stack: {
    label: 'STACK',
    tag: 'TOOLS · LIBRARIES · PLATFORMS',
    title: ['What I build ', 'with.'],
    rows: [
      ['CORE', ['Flutter', 'Dart']],
      ['ARCHITECTURE', ['BLoC', 'RxDart', 'get_it', 'auto_route']],
      ['REAL-TIME', ['WebSocket', 'MQTT', 'SignalR', 'Protocol Buffers']],
      ['CHARTS', ['Syncfusion', 'TradingView']],
      ['NATIVE & SECURITY', ['Kotlin', 'Swift', 'Platform channels', 'Biometric auth', 'Encryption']],
      ['FIREBASE & DATA', ['Crashlytics', 'FCM', 'Remote Config', 'Hive', 'SQLite']],
      ['DELIVERY', ['GitHub Actions', 'Multi-flavor builds', 'TestFlight', 'Play Console']],
    ],
    education: 'B.Sc. Software Engineering, Üsküdar University',
    languages: ['Turkish', 'English'],
  },
  email: 'haznigulec@gmail.com',
  linkedin: 'haznigulec',
  footnote: 'Most of my work lives in private repositories under NDA.',
};

const K = { ink: '#0B0B0D', line: '#26262B', paper: '#F2F1EC', mute: '#8E8E93', faint: '#55555C', accent: '#13B9FD' };

// ================================================================ setup
const HERE = path.dirname(fileURLToPath(import.meta.url));
const NM = path.join(HERE, 'node_modules');
const ROOT = path.resolve(HERE, '../..');
const require = createRequire(import.meta.url);
const opentype = require('opentype.js');

const FONT_FILES = {
  sg500: ['SG', 500, 'normal', '@fontsource/space-grotesk/files/space-grotesk-latin-500-normal'],
  sg700: ['SG', 700, 'normal', '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal'],
  jb700: ['JB', 700, 'normal', '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal'],
  is400i: ['IS', 400, 'italic', '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic'],
};
const FAMILY = {
  SG: "SG, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  JB: 'JB, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  IS: "IS, 'Times New Roman', Georgia, serif",
};

const fontFace = (key) => {
  const [family, weight, style, file] = FONT_FILES[key];
  const data = fs.readFileSync(path.join(NM, `${file}.woff2`)).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${data}) format('woff2')}`;
};

// Text width from the font's glyph advances and pair kerning (opentype.js shaping trips on
// some of these fonts' lookups, so it is skipped).
const metrics = {};
function measure(text, key, size, ls = 0) {
  if (!metrics[key]) {
    const buf = fs.readFileSync(path.join(NM, `${FONT_FILES[key][3]}.woff`));
    metrics[key] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  const font = metrics[key];
  const scale = size / font.unitsPerEm;
  let width = 0;
  let prev = null;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    width += (glyph.advanceWidth ?? 0) * scale;
    if (prev) width += font.getKerningValue(prev, glyph) * scale;
    prev = glyph;
  }
  return width + ls * [...text].length;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = (v) => Math.round(v * 100) / 100;

// <text> in one of FONT_FILES' faces
function T(x, y, s, key, size, o = {}) {
  const [family, weight, style] = FONT_FILES[key];
  const a = [`x="${n(x)}"`, `y="${n(y)}"`, `font-family="${FAMILY[family]}"`, `font-weight="${weight}"`, `font-size="${size}"`];
  if (style === 'italic') a.push('font-style="italic"');
  a.push(`fill="${o.fill ?? 'none'}"`);
  if (o.stroke) a.push(`stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"`);
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.ls != null) a.push(`letter-spacing="${o.ls}"`);
  if (o.cls) a.push(`class="${o.cls}"`);
  if (o.style) a.push(`style="${o.style}"`);
  return `<text ${a.join(' ')}>${esc(s)}</text>`;
}

function svgDoc({ w, h, title, fonts, defs = '', css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>${defs}</defs>
<style>${fonts.map(fontFace).join('')}
${css}</style>
${body}
</svg>
`;
}

const grainFilter = (id) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;

const simpleIconPath = (slug) =>
  fs.readFileSync(path.join(NM, 'simple-icons', 'icons', `${slug}.svg`), 'utf8').match(/ d="([^"]+)"/)[1];

// Six-point asterisk centred on cx, cy.
const asterisk = (cx, cy, r, fill) =>
  [0, 60, 120]
    .map((a) => `<rect x="${n(cx - r)}" y="${n(cy - r * 0.16)}" width="${n(2 * r)}" height="${n(r * 0.32)}" rx="${n(r * 0.16)}" fill="${fill}" transform="rotate(${a} ${n(cx)} ${n(cy)})"/>`)
    .join('');
const spin = (cx, cy, dur, dir = 1) =>
  `<animateTransform attributeName="transform" type="rotate" from="0 ${n(cx)} ${n(cy)}" to="${360 * dir} ${n(cx)} ${n(cy)}" dur="${dur}s" repeatCount="indefinite"/>`;

// A rising, noisy series of `count` points in the unit square (seeded, so builds repeat).
function series(seed, count) {
  let s = seed >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const raw = [];
  let v = 0;
  for (let i = 0; i < count; i++) {
    v += 1 / count + (r() - 0.45) * 0.5;
    raw.push(v);
  }
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  return raw.map((val, i) => [i / (count - 1), (val - min) / (max - min || 1)]);
}

// "a, b, c and d"
const listing = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

// Section header shared by the work and stack panels: labels, a title with an italic accent
// word that underlines itself, and the rule under it.
function sectionHeader(label, tag, [title, accent]) {
  const titleW = measure(title, 'sg700', 58, -1);
  const accentW = measure(accent, 'is400i', 70);
  return {
    accentW,
    svg: `
  ${T(52, 76, label, 'jb700', 16, { fill: K.mute, ls: 3 })}
  ${T(948, 76, tag, 'jb700', 16, { fill: K.mute, ls: 3, anchor: 'end' })}
  ${T(50, 156, title, 'sg700', 58, { fill: K.paper, ls: -1 })}
  ${T(50 + titleW, 158, accent, 'is400i', 70, { fill: K.accent })}
  <path d="M${n(52 + titleW)} 174 H${n(50 + titleW + accentW)}" stroke="${K.accent}" stroke-width="2.5" stroke-linecap="round" class="u"/>`,
  };
}
const underlineCss = (w) => `
.u{stroke-dasharray:${n(w)};animation:u 6s cubic-bezier(.6,0,.2,1) infinite}
@keyframes u{0%{stroke-dashoffset:${n(w)}}30%,70%{stroke-dashoffset:0}100%{stroke-dashoffset:${n(-w)}}}`;
// Dark panel with a soft spotlight and film grain.
const panelDefs = (id, W, H, spot) => `${grainFilter(`${id}grain`)}
  <radialGradient id="${id}spot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="${spot}">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".06"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="${id}panel"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28"/></clipPath>`;
const panelBody = (id, W, H) => `
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="${K.ink}" stroke="${K.line}" stroke-width="2"/>
  <g clip-path="url(#${id}panel)">
    <rect width="${W}" height="${H}" fill="url(#${id}spot)"/>
    <rect width="${W}" height="${H}" filter="url(#${id}grain)" opacity=".06"/>
  </g>`;

// ================================================================ hero
const HERO_ALT = `${PROFILE.name.join(' ')}, ${PROFILE.role}. ${PROFILE.sentence.replace('&', 'and')} ${listing(
  PROFILE.words.map((w) => w.replace(/\.$/, '')),
)}.`;

function hero() {
  const W = 1000;
  const H = 600;
  const nameSize = 172;
  const { sentence, words } = PROFILE;
  const sentenceX = 52;
  const wordX = sentenceX + measure(`${sentence} `, 'sg500', 30);
  const slot = 100 / words.length;
  const wordCss = words
    .map((_, i) => {
      const o = i * slot;
      const k = (p) => n(Math.min(100, o + p));
      return `.w${i}{animation:w${i} 10s cubic-bezier(.6,0,.2,1) infinite}
@keyframes w${i}{0%,${k(0)}%{transform:translateY(34px);opacity:0}${k(3)}%,${k(22)}%{transform:translateY(0);opacity:1}${k(25)}%{transform:translateY(-34px);opacity:0}${k(25.01)}%,100%{transform:translateY(34px);opacity:0}}`;
    })
    .join('\n');
  const badge = { cx: 842, cy: 262, r: 86 };
  const circ = 2 * Math.PI * badge.r;
  const ringLs = n((circ - measure(PROFILE.badge, 'jb700', 15)) / PROFILE.badge.length);
  const flutter = simpleIconPath('flutter');
  const [left, right] = PROFILE.labels;
  const defs = `
  ${grainFilter('grain')}
  <radialGradient id="spot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 60) scale(620 420)">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".07"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sweepFill" x1="52" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${K.paper}"/><stop offset="1" stop-color="#9FE3FF"/>
  </linearGradient>
  <clipPath id="panel"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28"/></clipPath>
  <clipPath id="sweep"><rect x="-620" y="250" width="620" height="200">
    <animate attributeName="x" values="-620;0;0;620;620" keyTimes="0;.3;.62;.92;1" dur="9s" calcMode="spline" keySplines=".6 0 .2 1;0 0 1 1;.6 0 .2 1;0 0 1 1" repeatCount="indefinite"/>
  </rect></clipPath>
  <clipPath id="wordWin"><rect x="${n(wordX - 4)}" y="522" width="320" height="56"/></clipPath>
  <path id="ring" d="M${badge.cx - badge.r} ${badge.cy} a${badge.r} ${badge.r} 0 1 1 ${2 * badge.r} 0 a${badge.r} ${badge.r} 0 1 1 ${-2 * badge.r} 0"/>`;
  const css = `
.rise{animation:rise 1s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.rule{stroke-dasharray:896;animation:rule 1.6s cubic-bezier(.6,0,.2,1) .3s both}
@keyframes rule{from{stroke-dashoffset:896}to{stroke-dashoffset:0}}
.blink{animation:blink 2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
${wordCss}`;
  const body = `
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="${K.ink}" stroke="${K.line}" stroke-width="2"/>
  <g clip-path="url(#panel)">
    <rect width="${W}" height="${H}" fill="url(#spot)"/>
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".06"/>
  </g>
  ${T(52, 76, left, 'jb700', 16, { fill: K.mute, ls: 3 })}
  <circle cx="${n(948 - measure(right, 'jb700', 16, 3) - 16)}" cy="70" r="4.5" fill="${K.accent}" class="blink"/>
  ${T(948, 76, right, 'jb700', 16, { fill: K.mute, ls: 3, anchor: 'end' })}

  <g class="rise">${T(46, 240, PROFILE.name[0], 'sg700', nameSize, { fill: K.paper, ls: -7 })}</g>
  <g class="rise" style="animation-delay:.12s">
    ${T(46, 404, PROFILE.name[1], 'sg700', nameSize, { stroke: K.paper, sw: 2.2, ls: -7 })}
    <g clip-path="url(#sweep)">${T(46, 404, PROFILE.name[1], 'sg700', nameSize, { fill: 'url(#sweepFill)', ls: -7 })}</g>
  </g>

  <g>
    <circle cx="${badge.cx}" cy="${badge.cy}" r="${badge.r + 26}" stroke="${K.line}" stroke-width="1.5"/>
    <g>${spin(badge.cx, badge.cy, 26)}
      <text font-family="${FAMILY.JB}" font-weight="700" font-size="15" fill="${K.paper}" letter-spacing="${ringLs}"><textPath href="#ring" xlink:href="#ring">${esc(PROFILE.badge)}</textPath></text>
    </g>
    <circle cx="${badge.cx}" cy="${badge.cy}" r="44" fill="#131318" stroke="${K.line}" stroke-width="1.5"/>
    <g transform="translate(${badge.cx - 18} ${badge.cy - 18}) scale(1.5)"><path d="${flutter}" fill="${K.accent}"/></g>
  </g>

  <path d="M52 452 H948" stroke="${K.line}" stroke-width="1.5" class="rule"/>
  ${T(52, 510, PROFILE.role, 'sg700', 38, { fill: K.paper })}
  ${T(sentenceX, 560, sentence, 'sg500', 30, { fill: K.mute })}
  <g clip-path="url(#wordWin)">
    ${words.map((w, i) => T(wordX, 562, w, 'is400i', 40, { fill: K.accent, cls: `w${i}` })).join('')}
  </g>
  ${T(948, 492, PROFILE.stat.label, 'jb700', 13, { fill: K.mute, ls: 2.5, anchor: 'end' })}
  ${T(948, 556, PROFILE.stat.value, 'sg700', 64, { fill: K.paper, anchor: 'end' })}`;
  return svgDoc({ w: W, h: H, title: HERO_ALT, fonts: ['sg500', 'sg700', 'jb700', 'is400i'], defs, css, body });
}

// ================================================================ marquee
const MARQUEE_ALT = PROFILE.marquee.join(', ');

function marquee() {
  const W = 1000;
  const H = 140;
  const size = 72;
  let x = 0;
  const seq = PROFILE.marquee
    .map((name, i) => {
      const it = /^[a-z]/.test(name) ? name : name.toUpperCase();
      const w = measure(it, 'sg700', size, -1.5);
      const t = T(x, 96, it, 'sg700', size, i % 2 ? { stroke: K.paper, sw: 1.8, ls: -1.5 } : { fill: K.paper, ls: -1.5 });
      const sx = x + w + 46;
      x += w + 92;
      return `${t}<g>${spin(sx, 71, 9 + (i % 3) * 3, i % 2 ? -1 : 1)}${asterisk(sx, 71, 15, K.accent)}</g>`;
    })
    .join('');
  const seqW = n(x);
  return svgDoc({
    w: W,
    h: H,
    title: MARQUEE_ALT,
    fonts: ['sg700'],
    defs: `${grainFilter('mgrain')}
  <clipPath id="mpanel"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28"/></clipPath>
  <linearGradient id="mfadeL" x1="0" x2="1"><stop offset="0" stop-color="${K.ink}"/><stop offset="1" stop-color="${K.ink}" stop-opacity="0"/></linearGradient>
  <linearGradient id="mfadeR" x1="1" x2="0"><stop offset="0" stop-color="${K.ink}"/><stop offset="1" stop-color="${K.ink}" stop-opacity="0"/></linearGradient>`,
    css: `.track{animation:track 48s linear infinite}
@keyframes track{from{transform:translateX(0)}to{transform:translateX(-${seqW}px)}}`,
    body: `
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="${K.ink}" stroke="${K.line}" stroke-width="2"/>
  <g clip-path="url(#mpanel)">
    <rect width="${W}" height="${H}" filter="url(#mgrain)" opacity=".06"/>
    <g class="track"><g transform="translate(40 0)">${seq}</g><g transform="translate(${n(40 + seqW)} 0)">${seq}</g></g>
    <rect x="0" y="0" width="110" height="${H}" fill="url(#mfadeL)"/>
    <rect x="${W - 110}" y="0" width="110" height="${H}" fill="url(#mfadeR)"/>
  </g>`,
  });
}

// ================================================================ selected work
const WORK_ALT = `Selected work. ${PROFILE.work.items.map((w) => `${w.title}: ${w.body}`).join(' ')}`;

function work() {
  const { label, tag, title, items } = PROFILE.work;
  const W = 1000;
  const top = 206;
  const rowH = 152;
  const H = top + items.length * rowH + 22;
  const textX = 184;
  // shrink the descriptions together if one would run past the right edge
  const bodySize = Math.min(23, ...items.map((w) => (23 * (948 - textX)) / measure(w.body, 'sg500', 23)));
  const header = sectionHeader(label, tag, title);
  const spark = series(7, 18);
  // real length (not pathLength="1"), so the drawing works in every engine
  const sparkLen = Math.ceil(
    spark.reduce((sum, [px, py], i) => (i ? sum + Math.hypot((px - spark[i - 1][0]) * 68, (py - spark[i - 1][1]) * 48) : 0), 0),
  ) + 2;
  const glyphs = {
    spark: (x, y) => {
      const pts = spark.map(([px, py]) => [x + 16 + px * 68, y + 74 - py * 48]);
      const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${n(px)} ${n(py)}`).join(' ');
      const last = pts[pts.length - 1];
      return `<path d="${d}" stroke="${K.accent}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="spark"/>
      <circle cx="${n(last[0])}" cy="${n(last[1])}" r="3.5" fill="${K.paper}" class="sparkdot"/>`;
    },
    scan: (x, y) => `
      <rect x="${x + 22}" y="${y + 31}" width="56" height="38" rx="6" stroke="${K.mute}" stroke-width="2"/>
      <circle cx="${x + 38}" cy="${y + 47}" r="6" stroke="${K.mute}" stroke-width="1.8"/>
      <path d="M${x + 30} ${y + 61} q8 -7 16 0 M${x + 52} ${y + 43} h18 M${x + 52} ${y + 51} h18 M${x + 52} ${y + 59} h12" stroke="${K.mute}" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="${x + 16}" y="${y + 28}" width="68" height="2.5" rx="1.25" fill="${K.accent}" class="scan"/>`,
    blocks: (x, y) =>
      [0, 1, 2, 3]
        .map((i) => `<rect x="${x + 25 + (i % 2) * 27}" y="${y + 25 + Math.floor(i / 2) * 27}" width="23" height="23" rx="6" fill="${i === 3 ? K.accent : K.paper}" class="blk b${i}"/>`)
        .join(''),
  };
  const rows = items
    .map((w, i) => {
      const y = top + i * rowH;
      return `
  <rect x="52" y="${y + 26}" width="100" height="100" rx="24" fill="#131318" stroke="${K.line}" stroke-width="1.5"/>
  ${glyphs[w.glyph](52, y + 26)}
  ${T(textX, y + 50, w.kicker, 'jb700', 15, { fill: K.accent, ls: 2.5 })}
  ${T(textX, y + 92, w.title, 'sg700', 34, { fill: K.paper })}
  ${T(textX, y + 126, w.body, 'sg500', n(bodySize), { fill: K.mute })}
  <path d="M52 ${y + rowH} H948" stroke="${K.line}" stroke-width="1.2"/>`;
    })
    .join('');
  const css = `${underlineCss(header.accentW)}
.spark{stroke-dasharray:${sparkLen};animation:spark 6s ease-in-out infinite}
@keyframes spark{0%{stroke-dashoffset:${sparkLen};opacity:1}40%,88%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
.sparkdot{animation:sparkdot 6s ease-in-out infinite}
@keyframes sparkdot{0%,38%{opacity:0}44%,88%{opacity:1}100%{opacity:0}}
.scan{animation:scan 2.8s ease-in-out infinite}
@keyframes scan{0%,100%{transform:translateY(0)}50%{transform:translateY(44px)}}
.blk{opacity:0;animation:6s ease-in-out infinite}
.b0{animation-name:b0}.b1{animation-name:b1}.b2{animation-name:b2}.b3{animation-name:b3}
@keyframes b0{0%,3%{opacity:0}9%,88%{opacity:1}96%,100%{opacity:0}}
@keyframes b1{0%,12%{opacity:0}18%,88%{opacity:1}96%,100%{opacity:0}}
@keyframes b2{0%,21%{opacity:0}27%,88%{opacity:1}96%,100%{opacity:0}}
@keyframes b3{0%,30%{opacity:0}36%,88%{opacity:1}96%,100%{opacity:0}}`;
  const body = `${panelBody('w', W, H)}${header.svg}
  <path d="M52 ${top} H948" stroke="${K.line}" stroke-width="1.2"/>
  ${rows}`;
  return svgDoc({
    w: W,
    h: H,
    title: WORK_ALT,
    fonts: ['sg500', 'sg700', 'jb700', 'is400i'],
    defs: panelDefs('w', W, H, 'translate(180 40) scale(620 480)'),
    css,
    body,
  });
}

// ================================================================ stack index
const STACK_ALT = `Stack. ${PROFILE.stack.rows.map(([label, items]) => `${label}: ${items.join(', ')}`).join('. ')}. Education: ${
  PROFILE.stack.education
}. Languages: ${PROFILE.stack.languages.join(', ')}.`;

function stack() {
  const { label, tag, title, rows: stackRows, education, languages } = PROFILE.stack;
  const W = 1000;
  const itemsX = 316;
  const maxW = 948 - itemsX;
  const size = 26;
  const lineH = 38;
  const sep = '  ·  '; // no-break spaces survive SVG whitespace collapsing
  const wrap = (items) => {
    const lines = [];
    let cur = [];
    for (const it of items) {
      const cand = [...cur, it];
      if (cur.length && measure(cand.join(sep), 'sg500', size) > maxW) {
        lines.push(cur);
        cur = [it];
      } else {
        cur = cand;
      }
    }
    lines.push(cur);
    if (lines.length !== 2) return lines;
    // two lines: split where the longer line is shortest, so no tool sits alone below
    let best = null;
    for (let k = 1; k < items.length; k++) {
      const a = items.slice(0, k);
      const b = items.slice(k);
      const worst = Math.max(measure(a.join(sep), 'sg500', size), measure(b.join(sep), 'sg500', size));
      if (worst <= maxW && (!best || worst < best.worst)) best = { worst, lines: [a, b] };
    }
    return best ? best.lines : lines;
  };
  const toolLine = (x, y, items) =>
    `<text x="${x}" y="${y}" font-family="${FAMILY.SG}" font-weight="500" font-size="${size}" fill="${K.paper}">${items
      .map((it, i) => (i ? `<tspan fill="${K.faint}">${sep}</tspan>` : '') + esc(it))
      .join('')}</text>`;

  const header = sectionHeader(label, tag, title);
  const top = 206;
  let y = top;
  const rows = stackRows
    .map(([area, items], i) => {
      const lines = wrap(items);
      const base = y + 50;
      const out = `
  ${T(52, base, String(i + 1).padStart(2, '0'), 'jb700', 17, { fill: K.accent, cls: 'ix', style: `animation-delay:${n(i * 0.28)}s` })}
  ${T(94, base, area, 'jb700', 17, { fill: K.mute, ls: 2 })}
  ${lines.map((l, k) => toolLine(itemsX, base + k * lineH, l)).join('')}`;
      y = base + (lines.length - 1) * lineH + 30;
      return `${out}
  <path d="M52 ${y} H948" stroke="${K.line}" stroke-width="1.2"/>`;
    })
    .join('');
  const fy = y + 58;
  const H = fy + 36 + 46;
  const css = `
.ix{animation:ix 5.6s ease-in-out infinite}
@keyframes ix{0%,32%,100%{opacity:.5}12%{opacity:1}}${underlineCss(header.accentW)}`;
  const body = `${panelBody('s', W, H)}${header.svg}
  <path d="M52 ${top} H948" stroke="${K.line}" stroke-width="1.2"/>
  ${rows}
  ${T(52, fy, 'EDUCATION', 'jb700', 13, { fill: K.mute, ls: 2.5 })}
  ${T(52, fy + 36, education, 'sg500', 22, { fill: K.paper })}
  ${T(640, fy, 'LANGUAGES', 'jb700', 13, { fill: K.mute, ls: 2.5 })}
  ${T(640, fy + 36, languages.join(' · '), 'sg500', 22, { fill: K.paper })}`;
  return svgDoc({
    w: W,
    h: H,
    title: STACK_ALT,
    fonts: ['sg500', 'sg700', 'jb700', 'is400i'],
    defs: panelDefs('s', W, H, 'translate(820 40) scale(620 520)'),
    css,
    body,
  });
}

// ================================================================ contact buttons
function button(label, value, target) {
  const W = 480;
  const H = 150;
  const valueW = measure(value, 'sg700', 30);
  const css = `
.under{stroke-dasharray:${n(valueW)};animation:under 6s cubic-bezier(.6,0,.2,1) infinite}
@keyframes under{0%{stroke-dashoffset:${n(valueW)}}30%,70%{stroke-dashoffset:0}100%{stroke-dashoffset:${n(-valueW)}}}
.nudge{animation:nudge 2s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,-4px)}}`;
  const body = `
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="${K.ink}" stroke="${K.line}" stroke-width="2"/>
  ${T(36, 58, label, 'jb700', 15, { fill: K.mute, ls: 3 })}
  ${T(36, 106, value, 'sg700', 30, { fill: K.paper })}
  <path d="M36 122 H${n(36 + valueW)}" stroke="${K.accent}" stroke-width="2.5" stroke-linecap="round" class="under"/>
  <g class="nudge"><path d="M${W - 64} 66 L${W - 40} 42 M${W - 58} 42 H${W - 40} V60" stroke="${K.accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return svgDoc({ w: W, h: H, title: `${label}: ${target}`, fonts: ['sg700', 'jb700'], css, body });
}

// ================================================================ README
const readme = () => `<!-- Generated by tools/readme-svg/generate.mjs: edit PROFILE there, then run "npm run build". -->
<p align="center">
  <img src="assets/hero.svg" width="100%" alt="${esc(HERO_ALT)}" />
</p>

<p align="center">
  <img src="assets/marquee.svg" width="100%" alt="${esc(MARQUEE_ALT)}" />
</p>

<p align="center">
  <img src="assets/work.svg" width="100%" alt="${esc(WORK_ALT)}" />
</p>

<p align="center">
  <img src="assets/stack.svg" width="100%" alt="${esc(STACK_ALT)}" />
</p>

<p align="center">
  <a href="mailto:${PROFILE.email}"><img src="assets/email.svg" width="49%" alt="Email: ${PROFILE.email}" /></a>
  <a href="https://linkedin.com/in/${PROFILE.linkedin}"><img src="assets/linkedin.svg" width="49%" alt="LinkedIn: in/${PROFILE.linkedin}" /></a>
</p>

<p align="center"><sub>${esc(PROFILE.footnote)}</sub></p>
`;

const files = {
  'assets/hero.svg': hero(),
  'assets/marquee.svg': marquee(),
  'assets/work.svg': work(),
  'assets/stack.svg': stack(),
  'assets/email.svg': button('EMAIL', PROFILE.email, PROFILE.email),
  'assets/linkedin.svg': button('LINKEDIN', `in/${PROFILE.linkedin}`, `linkedin.com/in/${PROFILE.linkedin}`),
  'README.md': readme(),
};
for (const [rel, content] of Object.entries(files)) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`  ${rel.padEnd(20)} ${(content.length / 1024).toFixed(1)} KB`);
}
