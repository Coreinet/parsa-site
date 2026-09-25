// Generates placeholder images in the site palette. Run: node scripts/placeholders.mjs
// Replace the outputs in /public/images with real screenshots and a real portrait.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const P = { paper: '#F1F2EE', paper2: '#E7E9E3', surface: '#FAFAF7', line: '#D5D8D1', ink: '#121416', ink2: '#4A4F55', ink3: '#7C8288', signal: '#2A36E8', soft: '#DDE0FF' };
const font = `font-family="Helvetica, Arial, sans-serif"`;

async function png(path, svg, width) {
  await sharp(Buffer.from(svg)).resize({ width }).png({ compressionLevel: 9 }).toFile(path);
}

// Seeded random so images are stable between runs.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function uiFrame({ w, h, title, seed, accentBlocks = 3 }) {
  const r = rng(seed);
  const pad = w * 0.06;
  const bars = Array.from({ length: 6 }, (_, i) => {
    const y = h * 0.34 + i * h * 0.07;
    const bw = w * (0.3 + r() * 0.35);
    return `<rect x="${pad * 2}" y="${y}" width="${bw}" height="${h * 0.022}" rx="3" fill="${i === 0 ? P.ink2 : P.line}"/>`;
  }).join('');
  const cards = Array.from({ length: accentBlocks }, (_, i) => {
    const cw = (w - pad * 4 - 32) / accentBlocks;
    const x = pad * 2 + i * (cw + 16);
    return `<rect x="${x}" y="${h * 0.8}" width="${cw}" height="${h * 0.12}" rx="8" fill="${i === 0 ? P.soft : P.paper2}" stroke="${P.line}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${P.paper2}"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad}" rx="14" fill="${P.surface}" stroke="${P.line}" stroke-width="2"/>
  <circle cx="${pad * 1.6}" cy="${pad * 1.55}" r="5" fill="${P.line}"/><circle cx="${pad * 1.6 + 16}" cy="${pad * 1.55}" r="5" fill="${P.line}"/><circle cx="${pad * 1.6 + 32}" cy="${pad * 1.55}" r="5" fill="${P.line}"/>
  <text x="${pad * 2}" y="${h * 0.25}" ${font} font-size="${h * 0.08}" font-weight="700" fill="${P.ink}" letter-spacing="-2">${title}</text>
  <rect x="${w - pad * 2 - w * 0.12}" y="${h * 0.17}" width="${w * 0.12}" height="${h * 0.06}" rx="6" fill="${P.signal}"/>
  ${bars}${cards}
</svg>`;
}

function cover({ w, h, label, seed }) {
  const r = rng(seed);
  const lines = Array.from({ length: 28 }, (_, i) => {
    const y = (i / 28) * h;
    const amp = 20 + r() * 40;
    const d = `M0 ${y} C ${w * 0.3} ${y - amp}, ${w * 0.6} ${y + amp}, ${w} ${y}`;
    return `<path d="${d}" fill="none" stroke="${i % 9 === 0 ? P.signal : P.ink3}" stroke-opacity="${i % 9 === 0 ? 0.9 : 0.35}" stroke-width="${i % 9 === 0 ? 2 : 1}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${P.paper}"/>${lines}
  <rect x="32" y="${h - 76}" width="${label.length * 11 + 32}" height="40" rx="2" fill="${P.surface}" stroke="${P.line}"/>
  <text x="48" y="${h - 50}" font-family="Courier New, monospace" font-size="18" fill="${P.ink2}">${label}</text>
</svg>`;
}

function portrait() {
  const w = 1200, h = 1600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DADDD6"/><stop offset="1" stop-color="#B9BDB5"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="600" cy="620" r="230" fill="#9DA29A"/>
  <path d="M170 1600 C 190 1140, 400 980, 600 980 C 800 980, 1010 1140, 1030 1600 Z" fill="#9DA29A"/>
  <text x="600" y="1500" text-anchor="middle" font-family="Courier New, monospace" font-size="40" fill="#4A4F55">replace with your photo · 3:4</text>
</svg>`;
}

// Lattice poster: the same point lattice the WebGL hero draws, projected to 2D.
function lattice(theme) {
  const ink = theme === 'dark' ? '#E9EBE6' : '#121416';
  const signal = theme === 'dark' ? '#8391FF' : '#2A36E8';
  const w = 1200, h = 1200, cx = 600, cy = 600;
  const r = rng(7);
  const pts = [];
  const n = 1400;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    const k = 1 + 0.18 * Math.sin(3 * th) * Math.cos(4 * y);
    let x = Math.cos(th) * rad * k, z = Math.sin(th) * rad * k, yy = y * k;
    const a = 0.5, b = -0.35;
    [x, z] = [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)];
    [yy, z] = [yy * Math.cos(b) - z * Math.sin(b), yy * Math.sin(b) + z * Math.cos(b)];
    const s = 420 / (2.6 - z);
    pts.push({ x: cx + x * s * 1.1, y: cy + yy * s * 1.1, z, accent: r() < 0.06 });
  }
  const dots = pts
    .map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(1.2 + (p.z + 1) * 0.9).toFixed(2)}" fill="${p.accent ? signal : ink}" fill-opacity="${p.accent ? 0.95 : (0.25 + (p.z + 1) * 0.2).toFixed(2)}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${dots}</svg>`;
}

await mkdir('public/images/work', { recursive: true });
await mkdir('public/images/log', { recursive: true });

const projects = [
  ['fieldbook', 'Fieldbook', 3],
  ['querylens', 'Querylens', 2],
  ['tidepool', 'Tidepool', 2]
];
let seed = 1;
for (const [slug, title, shots] of projects) {
  await png(`public/images/work/${slug}-cover.png`, uiFrame({ w: 1600, h: 1000, title, seed: seed++ }), 1600);
  for (let i = 1; i <= shots; i++) {
    await png(`public/images/work/${slug}-${i}.png`, uiFrame({ w: 1200, h: 800, title: `${title} · ${i}`, seed: seed++, accentBlocks: 2 + (i % 3) }), 1200);
  }
}

for (const [slug, label] of [['offline-sync', 'mobile'], ['streaming-llm', 'ai'], ['design-tokens', 'web']]) {
  await png(`public/images/log/${slug}.png`, cover({ w: 1600, h: 900, label: `/log · ${label}`, seed: seed++ }), 1600);
}

await png('public/images/portrait.png', portrait(), 1200);
await writeFile('public/images/lattice-light.svg', lattice('light'));
await writeFile('public/images/lattice-dark.svg', lattice('dark'));
console.log('placeholders written');
