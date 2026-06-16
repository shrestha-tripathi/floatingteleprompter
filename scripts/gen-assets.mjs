// One-shot asset generator: rasterizes favicon.svg into the PNG/ICO sizes the
// Layout references, plus a simple branded og-image. Run with `node scripts/gen-assets.mjs`.
// Uses sharp (already a devDependency). These are placeholder-grade assets —
// good enough to ship (no 404s, on-brand amber) but not hand-tuned art.
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, "..", "public");

// Solid-square icon source (rounded amber tile + script lines + play triangle).
// We draw on an opaque amber-tinted dark tile so the maskable/standalone icon
// has a real background (transparent favicons look broken on some launchers).
const iconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0a0a0a"/>
  <rect x="40" y="40" width="432" height="432" rx="96" fill="none" stroke="#ea580c" stroke-width="26"/>
  <g stroke="#ea580c" stroke-width="30" stroke-linecap="round">
    <path d="M128 168 H384"/>
    <path d="M128 240 H320"/>
    <path d="M128 312 H256"/>
  </g>
  <path d="M300 300 L392 348 L300 396 Z" fill="#ea580c"/>
</svg>`;

async function png(size, out) {
  const buf = await sharp(Buffer.from(iconSvg(size)))
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(join(pub, out), buf);
  console.log("wrote", out, `(${size}x${size})`);
}

// ICO: a 32x32 PNG wrapped in a minimal ICO container.
function pngToIco(pngBuf) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(pngBuf.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)
  return Buffer.concat([header, entry, pngBuf]);
}

// OG image — 1200x630 branded card.
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <defs>
    <radialGradient id="g" cx="78%" cy="28%" r="70%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- glyph tile -->
  <g transform="translate(96, 150) scale(0.62)">
    <rect x="40" y="40" width="432" height="432" rx="96" fill="none" stroke="#fb923c" stroke-width="26"/>
    <g stroke="#fb923c" stroke-width="30" stroke-linecap="round">
      <path d="M128 168 H384"/>
      <path d="M128 240 H320"/>
      <path d="M128 312 H256"/>
    </g>
    <path d="M300 300 L392 348 L300 396 Z" fill="#fb923c"/>
  </g>
  <text x="460" y="262" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="74" font-weight="700" fill="#fafafa">Floating</text>
  <text x="460" y="350" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="74" font-weight="700" fill="#fafafa">Teleprompter</text>
  <text x="462" y="430" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="34" font-weight="500" fill="#fb923c">A teleprompter that floats over any app</text>
  <text x="462" y="486" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="26" font-weight="400" fill="#a1a7b3">Record over OBS, Zoom &amp; Loom · No install · Free · Private</text>
</svg>`;

async function main() {
  await png(32, "favicon-32.png");
  await png(180, "apple-touch-icon.png");
  await png(192, "icon-192.png");
  await png(512, "icon-512.png");

  const ico32 = await sharp(Buffer.from(iconSvg(32))).resize(32, 32).png().toBuffer();
  writeFileSync(join(pub, "favicon.ico"), pngToIco(ico32));
  console.log("wrote favicon.ico (32x32)");

  const og = await sharp(Buffer.from(ogSvg)).png().toBuffer();
  writeFileSync(join(pub, "og-image.png"), og);
  console.log("wrote og-image.png (1200x630)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
