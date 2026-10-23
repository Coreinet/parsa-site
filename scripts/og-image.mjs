// Builds the social preview images (1200×630) from the portrait, one per language.
// Run: node scripts/og-image.mjs  → public/images/og/parsa-alizadeh{,-fa,-tr}.png
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1200, H = 630;
const photoW = 420;
const sans = 'font-family="Helvetica, Arial, Segoe UI, sans-serif"';
const mono = 'font-family="Consolas, Menlo, Segoe UI, monospace"';

await mkdir('public/images/og', { recursive: true });

const photo = await sharp('public/images/parsa-alizadeh.jpg')
  .resize(photoW, H, { fit: 'cover', position: 'attention' })
  .grayscale()
  .toBuffer();

const email = 'parsa.alizadeh.inet@gmail.com';

// Latin cards: text on the left, photo on the right.
const latin = (path, line) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#F1F2EE"/>
  <text x="72" y="118" ${mono} font-size="24" fill="#2A36E8">${path}</text>
  <text x="68" y="270" ${sans} font-size="112" font-weight="700" letter-spacing="-5" fill="#121416">Parsa</text>
  <text x="68" y="382" ${sans} font-size="112" font-weight="700" letter-spacing="-5" fill="none" stroke="#121416" stroke-width="2.5">Alizadeh</text>
  <text x="72" y="470" ${sans} font-size="34" fill="#4A4F55">${line}</text>
  <rect x="72" y="530" width="10" height="10" fill="#2A36E8"/>
  <text x="96" y="541" ${mono} font-size="22" fill="#6E747A">${email}</text>
</svg>`;

// Persian card: mirrored, photo on the left and right-to-left text on the right; the Latin name stays below.
const right = W - 72;
const persian = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#F1F2EE"/>
  <text x="${right}" y="118" text-anchor="end" ${mono} font-size="24" fill="#2A36E8">/fa/about</text>
  <text x="${right}" y="262" text-anchor="start" direction="rtl" ${sans} font-size="104" font-weight="700" fill="#121416">پارسا</text>
  <text x="${right}" y="384" text-anchor="start" direction="rtl" ${sans} font-size="104" font-weight="700" fill="#6E747A">علیزاده</text>
  <text x="${right}" y="440" text-anchor="end" ${mono} font-size="28" fill="#4A4F55">Parsa Alizadeh</text>
  <text x="${right}" y="500" text-anchor="start" direction="rtl" ${sans} font-size="32" fill="#4A4F55">توسعه‌دهنده‌ی نرم‌افزار · وب، موبایل و هوش مصنوعی</text>
  <rect x="${right - 10}" y="550" width="10" height="10" fill="#2A36E8"/>
  <text x="${right - 24}" y="561" text-anchor="end" ${mono} font-size="22" fill="#6E747A">${email}</text>
</svg>`;

const cards = [
  { file: 'parsa-alizadeh.png', svg: latin('/about', 'Software developer · Web, Mobile &amp; AI'), photoLeft: W - photoW },
  { file: 'parsa-alizadeh-tr.png', svg: latin('/tr/about', 'Yazılım geliştirici · Web, Mobil ve Yapay Zekâ'), photoLeft: W - photoW },
  { file: 'parsa-alizadeh-fa.png', svg: persian, photoLeft: 0 }
];

for (const { file, svg, photoLeft } of cards) {
  await sharp(Buffer.from(svg))
    .composite([{ input: photo, left: photoLeft, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(`public/images/og/${file}`);
  console.log('wrote', file);
}
