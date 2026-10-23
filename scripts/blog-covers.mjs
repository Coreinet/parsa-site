// Cover images for the blog, drawn as diagrams of each article's content.
// Run: node scripts/blog-covers.mjs  → public/images/blog/*.png (1600×900),
// plus Persian and Turkish copies in public/images/blog/fa and /tr (text from cover-text.mjs).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { coverText } from './cover-text.mjs';

const W = 1600, H = 900;
const C = { paper: '#F1F2EE', paper2: '#E7E9E3', surface: '#FAFAF7', line: '#C9CDC5', ink: '#121416', ink2: '#4A4F55', ink3: '#6E747A', signal: '#2A36E8', soft: '#DDE0FF', ok: '#1E7F4F' };
const sans = 'font-family="Helvetica, Arial, Segoe UI, Tahoma, sans-serif"';
const mono = 'font-family="Consolas, Menlo, Segoe UI, Tahoma, monospace"';

const frame = (label, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.ink2}"/></marker></defs>
  <rect width="${W}" height="${H}" fill="${C.paper}"/>
  <text x="80" y="92" ${mono} font-size="26" fill="${C.signal}">${label}</text>
  ${body}
</svg>`;

const box = (x, y, w, h, title, sub = '', accent = false) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${accent ? C.soft : C.surface}" stroke="${accent ? C.signal : C.line}" stroke-width="2.5"/>
  <text x="${x + w / 2}" y="${y + h / 2 + (sub ? -6 : 12)}" text-anchor="middle" ${sans} font-size="34" font-weight="700" fill="${C.ink}">${title}</text>
  ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 34}" text-anchor="middle" ${mono} font-size="22" fill="${C.ink3}">${sub}</text>` : ''}`;

const arrow = (x1, y1, x2, y2, dashed = false) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.ink2}" stroke-width="3" ${dashed ? 'stroke-dasharray="10 8"' : ''} marker-end="url(#a)"/>`;

// 1. Core Web Vitals: the three metrics and their "good" thresholds.
const vitals = frame('/blog · core web vitals', `
  ${[['LCP', 'Largest Contentful Paint', '≤ 2.5 s'], ['INP', 'Interaction to Next Paint', '≤ 200 ms'], ['CLS', 'Cumulative Layout Shift', '≤ 0.1']]
    .map(([k, name, t], i) => {
      const x = 80 + i * 490;
      return `<rect x="${x}" y="200" width="450" height="470" rx="28" fill="${C.surface}" stroke="${C.line}" stroke-width="2.5"/>
      <text x="${x + 40}" y="330" ${sans} font-size="120" font-weight="700" letter-spacing="-4" fill="${C.ink}">${k}</text>
      <text x="${x + 40}" y="390" ${sans} font-size="28" fill="${C.ink2}">${name}</text>
      <rect x="${x + 40}" y="470" width="370" height="16" rx="8" fill="${C.paper2}"/>
      <rect x="${x + 40}" y="470" width="190" height="16" rx="8" fill="${C.ok}"/>
      <text x="${x + 40}" y="570" ${sans} font-size="54" font-weight="700" fill="${C.ok}">${t}</text>
      <text x="${x + 40}" y="620" ${mono} font-size="22" fill="${C.ink3}">good</text>`;
    })
    .join('')}
  <text x="80" y="780" ${sans} font-size="34" fill="${C.ink2}">Assessed on real visits at the 75th percentile, mobile and desktop separately.</text>`);

// 2. Structured data: one Person node referenced by the rest of the graph.
const graph = frame('/blog · structured data', `
  ${box(620, 360, 360, 150, 'Person', '@id #person', true)}
  ${box(120, 170, 330, 120, 'WebSite', 'publisher')}
  ${box(120, 400, 330, 120, 'ProfilePage', 'mainEntity')}
  ${box(120, 630, 330, 120, 'BlogPosting', 'author')}
  ${arrow(450, 230, 616, 400)}${arrow(450, 460, 616, 440)}${arrow(450, 690, 616, 480)}
  ${box(1180, 170, 320, 120, 'GitHub')}
  ${box(1180, 400, 320, 120, 'LinkedIn')}
  ${box(1180, 630, 320, 120, 'Instagram')}
  ${arrow(980, 400, 1176, 232, true)}${arrow(980, 435, 1176, 460, true)}${arrow(980, 480, 1176, 688, true)}
  <text x="1085" y="392" text-anchor="middle" ${mono} font-size="24" fill="${C.signal}">sameAs</text>`);

// 3. Reduced motion: the same element with motion, and still.
const dots = Array.from({ length: 6 }, (_, i) => `<circle cx="${220 + i * 70}" cy="470" r="${46}" fill="${C.ink}" fill-opacity="${(0.08 + i * 0.16).toFixed(2)}"/>`).join('');
const motion = frame('/blog · accessibility', `
  <rect x="80" y="200" width="680" height="540" rx="28" fill="${C.surface}" stroke="${C.line}" stroke-width="2.5"/>
  ${dots}
  <text x="120" y="690" ${mono} font-size="26" fill="${C.ink3}">no-preference</text>
  <rect x="840" y="200" width="680" height="540" rx="28" fill="${C.soft}" stroke="${C.signal}" stroke-width="2.5"/>
  <circle cx="1180" cy="470" r="46" fill="${C.ink}"/>
  <text x="880" y="690" ${mono} font-size="26" fill="${C.signal}">reduce</text>
  <text x="80" y="830" ${mono} font-size="34" fill="${C.ink}">@media (prefers-reduced-motion: reduce) { … }</text>`);

// 4. RAG pipeline.
const rag = frame('/blog · ai', `
  ${box(80, 330, 260, 130, 'Question')}
  ${box(430, 330, 280, 130, 'Retriever', 'embed + search')}
  ${box(430, 620, 280, 130, 'Index', 'chunk vectors')}
  ${box(800, 330, 300, 130, 'Top passages', 'k most similar')}
  ${box(1190, 330, 330, 130, 'Language model', 'question + passages', true)}
  ${box(1190, 620, 330, 130, 'Answer', 'with sources')}
  ${arrow(340, 395, 426, 395)}${arrow(570, 460, 570, 616)}${arrow(610, 616, 610, 464, true)}
  ${arrow(710, 395, 796, 395)}${arrow(1100, 395, 1186, 395)}${arrow(1355, 460, 1355, 616)}
  <text x="80" y="200" ${sans} font-size="40" font-weight="700" fill="${C.ink}">Retrieval-augmented generation</text>`);

// 5. GEO: reported position-adjusted word count results (Aggarwal et al., KDD 2024).
const geoBars = [['Quotation Addition', 27.8, true], ['Statistics Addition', 25.9, true], ['Cite Sources', 24.9, true], ['Keyword Stuffing', 17.8, false]];
const geo = frame('/blog · geo research', `
  <text x="80" y="190" ${sans} font-size="40" font-weight="700" fill="${C.ink}">Generative Engine Optimization: reported results</text>
  ${geoBars
    .map(([name, v, good], i) => {
      const y = 280 + i * 130, w = (v / 30) * 900;
      return `<text x="80" y="${y + 52}" ${sans} font-size="32" fill="${C.ink}">${name}</text>
      <rect x="480" y="${y + 10}" width="${w}" height="64" rx="12" fill="${good ? C.signal : C.line}"/>
      <text x="${480 + w + 20}" y="${y + 55}" ${mono} font-size="30" fill="${good ? C.signal : C.ink3}">${v}</text>`;
    })
    .join('')}
  <text x="80" y="840" ${mono} font-size="24" fill="${C.ink3}">position-adjusted word count · Aggarwal et al., KDD 2024</text>`);

// 6. Transformer: scaled dot-product attention.
const attention = frame('/blog · transformer', `
  <text x="80" y="190" ${sans} font-size="40" font-weight="700" fill="${C.ink}">Scaled dot-product attention</text>
  ${box(80, 300, 150, 110, 'Q')}${box(80, 450, 150, 110, 'K')}${box(80, 650, 150, 110, 'V')}
  ${box(330, 370, 240, 120, 'MatMul', 'Q · Kᵀ')}
  ${box(660, 370, 240, 120, 'Scale', '÷ √d_k')}
  ${box(990, 370, 240, 120, 'Softmax', 'weights', true)}
  ${box(1290, 520, 230, 120, 'MatMul', '· V')}
  ${arrow(230, 355, 326, 410)}${arrow(230, 505, 326, 455)}${arrow(570, 430, 656, 430)}${arrow(900, 430, 986, 430)}
  ${arrow(1110, 490, 1320, 516)}${arrow(230, 705, 1286, 600)}
  <text x="80" y="850" ${mono} font-size="30" fill="${C.ink}">softmax( Q·Kᵀ / √d_k ) · V</text>`);

// 7. HNSW: layered graphs, search descends from the sparse top layer.
const layer = (y, pts, label) => `
  <rect x="140" y="${y - 60}" width="1320" height="120" rx="20" fill="${C.surface}" stroke="${C.line}" stroke-width="2"/>
  <text x="170" y="${y + 8}" ${mono} font-size="22" fill="${C.ink3}">${label}</text>
  ${pts.map((x, i) => (i ? `<line x1="${pts[i - 1]}" y1="${y}" x2="${x}" y2="${y}" stroke="${C.line}" stroke-width="3"/>` : '')).join('')}
  ${pts.map(x => `<circle cx="${x}" cy="${y}" r="14" fill="${C.ink2}"/>`).join('')}`;
const hnsw = frame('/blog · vector search', `
  <text x="80" y="190" ${sans} font-size="40" font-weight="700" fill="${C.ink}">HNSW: search from the sparse top layer down</text>
  ${layer(320, [420, 1180], 'layer 2')}
  ${layer(520, [420, 700, 980, 1180, 1320], 'layer 1')}
  ${layer(720, [340, 420, 520, 620, 700, 800, 900, 980, 1080, 1180, 1250, 1320, 1400], 'layer 0')}
  <circle cx="1080" cy="720" r="20" fill="${C.signal}"/>
  <path d="M420 320 L1180 320 L1180 520 L980 520 L980 720 L1080 720" fill="none" stroke="${C.signal}" stroke-width="6" stroke-linejoin="round" marker-end="url(#a)"/>
  <text x="1110" y="800" ${mono} font-size="24" fill="${C.signal}">nearest neighbour</text>`);

// 8. React Native: bridge vs JSI.
const rn = frame('/blog · react native', `
  <text x="80" y="200" ${mono} font-size="28" fill="${C.ink3}">old architecture</text>
  ${box(80, 250, 300, 130, 'JavaScript')}${box(610, 250, 380, 130, 'Bridge', 'asynchronous')}${box(1220, 250, 300, 130, 'Native')}
  ${arrow(380, 300, 606, 300, true)}${arrow(606, 335, 380, 335, true)}${arrow(990, 300, 1216, 300, true)}${arrow(1216, 335, 990, 335, true)}
  <text x="80" y="540" ${mono} font-size="28" fill="${C.signal}">new architecture · default since 0.76</text>
  ${box(80, 590, 300, 130, 'JavaScript')}${box(610, 590, 380, 130, 'JSI', 'direct C++ references', true)}${box(1220, 590, 300, 130, 'Native')}
  ${arrow(380, 640, 606, 640)}${arrow(606, 675, 380, 675)}${arrow(990, 640, 1216, 640)}${arrow(1216, 675, 990, 675)}
  <text x="80" y="820" ${sans} font-size="30" fill="${C.ink2}">Turbo Modules · Fabric renderer · Codegen · event loop</text>`);

// 9. Pillar: every page points to one person.
const identity = frame('/blog · discoverability', `
  ${box(620, 380, 360, 150, 'Parsa Alizadeh', 'Person · one @id', true)}
  ${box(80, 170, 330, 110, 'Home', 'WebSite')}
  ${box(80, 330, 330, 110, 'About', 'ProfilePage')}
  ${box(80, 490, 330, 110, 'Articles', 'BlogPosting')}
  ${box(80, 650, 330, 110, 'Projects', 'SoftwareSourceCode')}
  ${arrow(410, 225, 616, 410)}${arrow(410, 385, 616, 440)}${arrow(410, 545, 616, 480)}${arrow(410, 705, 616, 510)}
  ${box(1190, 230, 310, 110, 'GitHub')}
  ${box(1190, 400, 310, 110, 'LinkedIn')}
  ${box(1190, 570, 310, 110, 'Instagram')}
  ${arrow(980, 420, 1186, 290, true)}${arrow(980, 455, 1186, 455, true)}${arrow(980, 495, 1186, 620, true)}
  <text x="1085" y="378" text-anchor="middle" ${mono} font-size="24" fill="${C.signal}">sameAs</text>
  <text x="80" y="850" ${sans} font-size="32" fill="${C.ink2}">One name, one identity, claims that link to evidence.</text>`);

// 10. RAG evaluation: one test set, two separate checks.
const ragEval = frame('/blog · rag evaluation', `
  <text x="80" y="190" ${sans} font-size="40" font-weight="700" fill="${C.ink}">Evaluate retrieval and generation separately</text>
  ${box(80, 420, 300, 150, 'Test set', 'questions + answers')}
  ${box(520, 270, 440, 150, 'Retrieval', 'did the right chunks arrive?')}
  ${box(520, 570, 440, 150, 'Generation', 'does the answer use them?', true)}
  ${arrow(380, 470, 516, 350)}${arrow(380, 520, 516, 640)}${arrow(740, 420, 740, 566)}
  ${box(1100, 270, 420, 150, 'recall@k · MRR', 'nDCG@k')}
  ${box(1100, 570, 420, 150, 'faithfulness', 'answer relevance')}
  ${arrow(960, 345, 1096, 345)}${arrow(960, 645, 1096, 645)}
  <text x="80" y="830" ${sans} font-size="32" fill="${C.ink2}">Fix retrieval first: it sets the ceiling for every answer.</text>`);

// 11. Quantization: weight memory of a 7B model by precision.
const quantBars = [['16-bit', 14, false], ['8-bit', 7, false], ['4-bit', 3.5, true]];
const quant = frame('/blog · quantization', `
  <text x="80" y="190" ${sans} font-size="40" font-weight="700" fill="${C.ink}">Weight memory of a 7B-parameter model</text>
  ${quantBars
    .map(([name, v, accent], i) => {
      const y = 290 + i * 160, w = (v / 14) * 1000;
      return `<text x="80" y="${y + 60}" ${mono} font-size="36" fill="${C.ink}">${name}</text>
      <rect x="300" y="${y + 10}" width="${w}" height="80" rx="14" fill="${accent ? C.signal : C.line}"/>
      <text x="${300 + w + 24}" y="${y + 64}" ${sans} font-size="40" font-weight="700" fill="${accent ? C.signal : C.ink2}">${v} GB</text>`;
    })
    .join('')}
  <text x="80" y="830" ${mono} font-size="26" fill="${C.ink3}">parameters × bytes per parameter · weights only</text>`);

// 12. Name disambiguation: one name, three candidates, the linked one wins.
const disamb = frame('/blog · entities', `
  ${box(80, 390, 380, 140, '“Parsa Alizadeh”', 'a name is a string')}
  ${box(700, 170, 420, 130, 'Person A', 'famous namesake')}
  ${box(700, 395, 420, 130, 'Person B', 'thin context')}
  ${box(700, 620, 420, 130, 'Person C', 'linked profiles', true)}
  ${arrow(460, 430, 696, 240, true)}${arrow(460, 460, 696, 460, true)}${arrow(460, 490, 696, 680)}
  ${['same name', 'same photo', 'links both ways', 'sameAs']
    .map((t, i) => `<rect x="1210" y="${560 + i * 62}" width="300" height="48" rx="10" fill="${C.surface}" stroke="${C.signal}" stroke-width="2"/>
      <text x="1236" y="${592 + i * 62}" ${mono} font-size="22" fill="${C.signal}">✓ ${t}</text>`)
    .join('')}
  <text x="80" y="850" ${sans} font-size="32" fill="${C.ink2}">Popularity decides when context is thin; consistent signals add context.</text>`);

/**
 * The same diagram in another language: each text node found in `text` is swapped for its
 * translation. Persian text runs right to left with its block kept where the English one was:
 * with direction="rtl", "end" puts the left edge at x and "start" the right edge.
 */
const localize = (svg, text, rtl) =>
  svg.replace(/<text([^>]*)>([^<]+)<\/text>/g, (whole, attrs, content) => {
    const translated = text[content.trim()];
    if (!translated) return whole;
    if (!rtl) return `<text${attrs}>${translated}</text>`;
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start';
    const flipped = { start: 'end', middle: 'middle', end: 'start' }[anchor];
    const rest = attrs.replace(/\s*text-anchor="\w+"/, '');
    return `<text${rest} text-anchor="${flipped}" direction="rtl">${translated}</text>`;
  });

const covers = {
  'evaluating-rag-systems': ragEval,
  'llm-quantization': quant,
  'name-disambiguation-search-ai': disamb,
  'core-web-vitals-lcp': vitals,
  'structured-data-personal-website': graph,
  'reduced-motion-accessibility': motion,
  'retrieval-augmented-generation': rag,
  'generative-engine-optimization-research': geo,
  'transformer-attention-explained': attention,
  'vector-search-hnsw': hnsw,
  'react-native-new-architecture': rn,
  'building-a-site-search-engines-understand': identity
};

for (const [dir, text, rtl] of [['public/images/blog', null, false], ['public/images/blog/fa', coverText.fa, true], ['public/images/blog/tr', coverText.tr, false]]) {
  await mkdir(dir, { recursive: true });
  for (const [name, svg] of Object.entries(covers)) {
    await sharp(Buffer.from(text ? localize(svg, text, rtl) : svg)).png({ compressionLevel: 9 }).toFile(`${dir}/${name}.png`);
  }
  console.log('wrote', Object.keys(covers).length, 'covers to', dir);
}
