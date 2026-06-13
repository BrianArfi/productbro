/**
 * One-off apply batch-discovered LinkedIn URLs.
 * Run: node scripts/apply-linkedin.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const DATA = "src/data/builders.json";
const builders = JSON.parse(readFileSync(DATA, "utf8"));

const LINKEDIN_MAP = {
  "catur-pw": "https://www.linkedin.com/in/caturpw/",
  "maulana-sh": "https://www.linkedin.com/in/maulana-sh-77522bb1/",
  "chandra-marsono": "https://www.linkedin.com/in/chandramarsono/",
  "achmad-nafila-rozie": "https://www.linkedin.com/in/achmadrozie/",
  "yahya-ekananta": "https://www.linkedin.com/in/yahyaapristianto/",
  "bayu-yanuargi": "https://www.linkedin.com/in/bayu-yanuargi-35aab831/",
  "lhuqita-fazri": "https://www.linkedin.com/in/lhuqita-fazry/",
  "gunawan-wibisono": "https://www.linkedin.com/in/wibisonogunawan/",
  "wisnu-manupraba": "https://www.linkedin.com/in/wisnu-manupraba-a61199b/",
  "bagus-dewantara": "https://www.linkedin.com/in/bagus-dewantara-042875193/",
  "ruby-thalib": "https://www.linkedin.com/in/ruby-abdullah-2134a4176/",
  "muhammad-ismail": "https://www.linkedin.com/in/muhis/",
};

let updated = 0;
for (const [slug, url] of Object.entries(LINKEDIN_MAP)) {
  const b = builders.find((x) => x.slug === slug);
  if (b && (!b.linkedin || b.linkedin === "")) {
    b.linkedin = url;
    updated++;
  }
}

writeFileSync(DATA, JSON.stringify(builders, null, 2) + "\n");
console.log(`[linkedin] applied ${updated} URLs, builders.json updated.`);
