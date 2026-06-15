/**
 * Parse LinkedIn Connections export, filter for product builders,
 * and generate ProductBro builder profiles.
 *
 * Usage: node scripts/import-linkedin-connections.mjs [limit]
 * Example: node scripts/import-linkedin-connections.mjs 50 (first 50 builders)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Priority roles (high engagement indicators)
const FOUNDER_ROLES = /founder|ceo|cto|cpo|cfo|president|managing director/i;
const PRODUCT_ROLES = /product.*manager|product.*lead|pm[^a-z]|head of product|vp product|chief product/i;
const ENGINEERING_ROLES = /engineer|architect|tech lead|lead developer|head of engineering|cto|vp engineer/i;
const DESIGN_ROLES = /designer|design lead|head of design|product designer|ux[/\s]|ui[/\s]/i;
const BUSINESS_ROLES = /business.*lead|head of business|vp business|growth.*lead|go.*to.*market|head of sales/i;
const EDUCATOR_ROLES = /coach|mentor|teacher|instructor|lecturer|professor/i;

// Exclude: recruiters, pure marketing, non-tech
const EXCLUDE_KEYWORDS = /recruiter|recruiting|headhunt|sales executive|sales manager|account manager|pure.*marketing|marketing manager|hr[^a-z]|human resource|government|ministry|ngo|non.*profit|events?|community|consultant[^a-z]|training provider/i;

function classify(role) {
  if (FOUNDER_ROLES.test(role)) return "FOUNDER";
  if (PRODUCT_ROLES.test(role)) return "PRODUCT";
  if (ENGINEERING_ROLES.test(role)) return "ENGINEERING";
  if (DESIGN_ROLES.test(role)) return "DESIGN";
  if (BUSINESS_ROLES.test(role)) return "BUSINESS";
  if (EDUCATOR_ROLES.test(role)) return "EDUCATION";
  return null;
}

function toSlug(firstName, lastName) {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractTags(role, company) {
  const tags = [];
  if (/fintech|payment|banking|crypto|blockchain/i.test(role + company)) tags.push("FINTECH");
  if (/ai|ml|machine learning|neural|llm/i.test(role + company)) tags.push("AI");
  if (/web3|crypto|blockchain|nft|defi/i.test(role + company)) tags.push("WEB3");
  if (/saas|b2b|enterprise/i.test(role + company)) tags.push("B2B");
  if (/e-commerce|marketplace|retail/i.test(role + company)) tags.push("E-COMMERCE");
  if (/growth|acquisition|retention|arn/i.test(role + company)) tags.push("GROWTH");
  if (/platform|infra|backend|api/i.test(role + company)) tags.push("PLATFORM");
  if (/mobile|app|ios|android/i.test(role + company)) tags.push("MOBILE");
  return tags.length > 0 ? tags : ["TECH"];
}

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.split("\n").slice(3); // skip notes + header
  const builders = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Simple CSV parsing: split by comma, handle quoted fields
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    if (fields.length < 7) continue;

    const [firstName, lastName, url, email, company, role, connectedOn] = fields;

    if (!firstName || !role || !company) continue;

    // Filter: exclude recruiters, pure HR, non-tech
    if (EXCLUDE_KEYWORDS.test(role)) continue;

    // Filter: only product builders
    const discipline = classify(role);
    if (!discipline) continue;

    // Filter: connected recently (last 6 months) or high-signal role
    const connDate = new Date(connectedOn);
    const now = new Date();
    const monthsAgo = (now - connDate) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo > 180 && !FOUNDER_ROLES.test(role)) continue; // old connections unless founder

    builders.push({
      slug: toSlug(firstName, lastName),
      name: `${firstName} ${lastName}`.trim(),
      discipline,
      role,
      company,
      city: "", // not in export; can fill later
      tags: extractTags(role, company),
      focus: discipline.toLowerCase(),
      experience: "", // infer from role later
      linkedin: url || "",
      photo: "",
      bio: [],
      claimed: false,
      connectedOn,
    });
  }

  return builders;
}

// Main
const csvPath = "/mnt/c/Users/Brian/Downloads/linkedin-export/Connections.csv";
const limit = parseInt(process.argv[2], 10) || 100;

console.log(`[import-linkedin] parsing ${csvPath}...`);
const builders = parseCSV(csvPath);
console.log(
  `[import-linkedin] found ${builders.length} product builders (filtered from 5460)`
);
console.log(`[import-linkedin] limiting to ${limit} by discipline priority...`);

// Sort by discipline priority + role seniority
const disciplineOrder = ["FOUNDER", "PRODUCT", "ENGINEERING", "DESIGN", "BUSINESS", "EDUCATION"];
builders.sort((a, b) => {
  const aIdx = disciplineOrder.indexOf(a.discipline);
  const bIdx = disciplineOrder.indexOf(b.discipline);
  if (aIdx !== bIdx) return aIdx - bIdx;
  // Within discipline, sort by seniority (head/lead/vp/cto > senior > mid-level)
  const seniority = (role) => {
    if (/head|ceo|cto|cpo|founder/i.test(role)) return 3;
    if (/vp|lead|senior/i.test(role)) return 2;
    return 1;
  };
  return seniority(b.role) - seniority(a.role);
});

// Curate: pick a balanced mix across disciplines
const byDiscipline = {};
disciplineOrder.forEach((d) => {
  byDiscipline[d] = builders.filter((b) => b.discipline === d);
});

// Interleave to get a balanced sample
const curated = [];
let idx = [0, 0, 0, 0, 0, 0]; // per discipline
while (curated.length < limit) {
  for (let i = 0; i < disciplineOrder.length && curated.length < limit; i++) {
    if (idx[i] < byDiscipline[disciplineOrder[i]].length) {
      curated.push(byDiscipline[disciplineOrder[i]][idx[i]]);
      idx[i]++;
    }
  }
}

// Log sample
console.log("\n[import-linkedin] sample (first 5):");
curated.slice(0, 5).forEach((b) => {
  console.log(`  ${b.name} (${b.discipline}) @ ${b.company}`);
});

console.log(`\n[import-linkedin] curated ${curated.length} builders (balanced disciplines)`);
console.log(
  `   Discipline split: ${disciplineOrder.map((d) => `${d}=${curated.filter((b) => b.discipline === d).length}`).join(", ")}`
);

// Save to a temp file for next enrichment step
const outPath = path.join(__dirname, "../src/data/builders-import.json");
fs.writeFileSync(outPath, JSON.stringify(curated, null, 2) + "\n");
console.log(`\n[import-linkedin] saved ${outPath}`);
console.log(`[import-linkedin] next: run node scripts/enrich-builders.mjs to fill bios`);
