/**
 * Bulk-download real profile photos into public/photos/ and wire them into
 * builders.json — the automated lever for adding real photos later.
 *
 * Why this exists: real profile photos can't be reliably auto-scraped from
 * LinkedIn (auth wall + ToS + expiring URLs), so the site ships with polished
 * generated avatars. When you DO have a usable public photo URL for someone,
 * add it to scripts/photos.json as { "<slug>": "<image-url>" } and run:
 *
 *   node scripts/fetch-photos.mjs
 *
 * It downloads each into public/photos/<slug>.jpg and sets that profile's
 * "photo" field. BuilderPhoto then shows the real photo and only falls back to
 * the avatar for everyone still without one.
 *
 * (You can also skip this script entirely: drop a file at
 *  public/photos/<slug>.jpg and set "photo": "/photos/<slug>.jpg" by hand.)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const MAP = "scripts/photos.json"; // { "<slug>": "<image-url>" }
const DATA = "src/data/builders.json";
const OUT = "public/photos";

if (!existsSync(MAP)) {
  console.log(`[photos] no ${MAP} found — create it as { "<slug>": "<url>" } to add real photos. Nothing to do.`);
  process.exit(0);
}

const map = JSON.parse(readFileSync(MAP, "utf8"));
const builders = JSON.parse(readFileSync(DATA, "utf8"));
mkdirSync(OUT, { recursive: true });

let ok = 0;
for (const [slug, url] of Object.entries(map)) {
  const b = builders.find((x) => x.slug === slug);
  if (!b) {
    console.warn(`[photos] skip — no builder with slug "${slug}"`);
    continue;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const file = path.join(OUT, `${slug}.jpg`);
    writeFileSync(file, buf);
    b.photo = `/photos/${slug}.jpg`;
    ok++;
    console.log(`[photos] ${slug} ← ${url}`);
  } catch (e) {
    console.warn(`[photos] failed ${slug}: ${e.message}`);
  }
}

writeFileSync(DATA, JSON.stringify(builders, null, 2) + "\n");
console.log(`[photos] downloaded ${ok} photo(s), builders.json updated.`);
