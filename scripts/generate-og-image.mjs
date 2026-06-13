/**
 * Generate og-default.png (1200x630) for social sharing.
 * Uses sharp + SVG rendering.
 * Run: node scripts/generate-og-image.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const WIDTH = 1200;
const HEIGHT = 630;

// SVG template: dark navy + amber, ProductBro branding
const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark navy background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0b0d14"/>

  <!-- Amber accent bar (top) -->
  <rect width="${WIDTH}" height="8" fill="#f59e0b"/>

  <!-- ProductBro text -->
  <text x="60" y="280" font-family="Geist, -apple-system, sans-serif" font-size="96" font-weight="700" fill="white" letter-spacing="-2">
    ProductBro
  </text>

  <!-- Tagline -->
  <text x="60" y="370" font-family="Geist, -apple-system, sans-serif" font-size="48" font-weight="400" fill="#e5e7eb" letter-spacing="0.5">
    Indonesia's Product Builder Index
  </text>

  <!-- Accent underline -->
  <line x1="60" y1="390" x2="400" y2="390" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
</svg>
`;

const out = "public/og-default.png";
try {
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log(`[og] generated ${out} (${WIDTH}x${HEIGHT})`);
} catch (e) {
  console.error(`[og] failed:`, e.message);
  process.exit(1);
}
