// Builds the default social preview image (1200×630) from the portrait.
// Run: node scripts/og-image.mjs  → public/images/og/parsa-alizadeh.png
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1200, H = 630;
const photoW = 420;

await mkdir('public/images/og', { recursive: true });

const photo = await sharp('public/images/parsa-alizadeh.jpg')
  .resize(photoW, H, { fit: 'cover', position: 'attention' })
  .grayscale()
  .toBuffer();

const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#F1F2EE"/>
  <text x="72" y="118" font-family="Consolas, Menlo, monospace" font-size="24" fill="#2A36E8">/about</text>
  <text x="68" y="270" font-family="Helvetica, Arial, sans-serif" font-size="112" font-weight="700" letter-spacing="-5" fill="#121416">Parsa</text>
  <text x="68" y="382" font-family="Helvetica, Arial, sans-serif" font-size="112" font-weight="700" letter-spacing="-5" fill="none" stroke="#121416" stroke-width="2.5">Alizadeh</text>
  <text x="72" y="470" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#4A4F55">Software developer · Web, Mobile &amp; AI</text>
  <rect x="72" y="530" width="10" height="10" fill="#2A36E8"/>
  <text x="96" y="541" font-family="Consolas, Menlo, monospace" font-size="22" fill="#6E747A">parsa.alizadeh.inet@gmail.com</text>
</svg>`;

await sharp(Buffer.from(text))
  .composite([{ input: photo, left: W - photoW, top: 0 }])
  .png({ compressionLevel: 9 })
  .toFile('public/images/og/parsa-alizadeh.png');

console.log('og image written');
