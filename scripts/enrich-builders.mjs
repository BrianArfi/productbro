/**
 * One-off enrichment pass for builders.json.
 *
 * - Applies researched overrides (real bio + verified LinkedIn + field fixes) for
 *   the notable subset that was checked against public sources.
 * - For everyone else with an empty bio, generates a short, factual bio from the
 *   sheet data (role + company) plus the true fact that they were a BroBri guest.
 *   No invented achievements/metrics.
 *
 * Run once:  node scripts/enrich-builders.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/data/builders.json";
const builders = JSON.parse(readFileSync(FILE, "utf8"));

const li = (slug) => `https://www.linkedin.com/in/${slug}`;

/** Researched (verified against public sources). bio is final, factual. */
const OVERRIDES = {
  "sofian-hadiwijaya": {
    linkedin: li("sofianhw"),
    bio: [
      "Sofian is Group Head of Product at Superbank, a digital bank in Indonesia, and a Forbes 30 Under 30 Asia honoree who previously co-founded Warung Pintar.",
      "He works across product, AI, data and Web3, and was a guest on the BroBri podcast.",
    ],
  },
  "fitoy-wicaksana": {
    linkedin: li("fitoy"),
    city: "Dubai",
    bio: [
      "Fitoy is Director of Product at Astra Tech in Dubai, leading product across lifestyle super-apps, fintech and digital banking, with earlier roles at Fasset and Hijra.",
      "An Imperial College London alum, he was a guest on the BroBri podcast.",
    ],
  },
  "smiley-kuntjoro": {
    linkedin: li("smileyk"),
    role: "Chief Product Officer",
    company: "Shipper",
    bio: [
      "Smiley is Chief Product Officer at logistics platform Shipper, with 20+ years across product and engineering — including AVP Product at Tokopedia and VP Product at Gojek.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "natali-ardianto": {
    linkedin: li("nataliardianto"),
    role: "Co-founder & CEO, Lifepack.id",
    company: "Lifepack.id (ex-Tiket.com)",
    bio: [
      "Natali is a technical co-founder best known for building Tiket.com as its CTO — a journey to unicorn scale and a public listing — and now co-founds and leads the healthtech startup Lifepack.id.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "dima-djani": {
    linkedin: li("dimadjani"),
    bio: [
      "Dima is the founder and Group CEO of Hijra (formerly ALAMI), Indonesia's sharia-based fintech and digital bank, which he started in 2018 after a finance career at Citi and Société Générale.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "ryan-gondokusumo": {
    linkedin: li("ryangondokusumo"),
    bio: [
      "Ryan founded Sribu and Sribulancer in 2011, building one of Indonesia's largest freelancing and creative-services marketplaces.",
      "A Purdue engineering graduate, he was a guest on the BroBri podcast.",
    ],
  },
  "aditya-chintawar": {
    linkedin: li("adityachintawar"),
    bio: [
      "Aditya is Chief Product & Technology Officer at KoinWorks, an Indonesian fintech serving SMEs, with prior experience at Deloitte and Zoomcar.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "rangga-wiseno": {
    bio: [
      "Rangga has served as Chief of Product at DANA, one of Indonesia's largest digital wallets, leading a large product team, and more recently as Chief Business Officer at ALTO Network.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "jeremy-limman": {
    linkedin: li("jeremylimman"),
    bio: [
      "Jeremy co-founded Paper.id in 2016 and serves as its CPO, building B2B invoicing and payments used by hundreds of thousands of Indonesian SMEs.",
      "A USC graduate, he was a guest on the BroBri podcast.",
    ],
  },
  "krisna-parahita": {
    linkedin: li("krisna-parahita"),
    bio: [
      "Krisna is VP of Product & Analytics at LinkAja, Indonesia's state-backed e-wallet, with earlier roles spanning the World Bank, TaniFund and idEA.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "arnold-egg": {
    bio: [
      "Arnold founded Tokobagus in 2005 — later rebranded to OLX Indonesia — pioneering online classifieds in the country, and has since started new ventures including Toco.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "richard-dharmadi": {
    linkedin: li("richard-dharmadi"),
    bio: [
      "Richard leads product at proptech Pinhome and teaches product management at RevoU, with an ITB and University of Edinburgh background.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "winahyu-anggoro": {
    linkedin: li("winahyuanggoro"),
    bio: [
      "Winahyu is an Associate VP of Product at Tokopedia, part of the team behind Indonesia's largest marketplace.",
      "A University of Indonesia computer-science graduate, he was a guest on the BroBri podcast.",
    ],
  },
  "aldy-pranata": {
    linkedin: li("aldy-pranata-69367798"),
    bio: [
      "Aldy is a product lead in the crypto space — including VP-level product at NOBI — and an ADPList mentor with around a decade in tech startups across product, GTM and UX.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "iman-cinderamata": {
    linkedin: li("imancinderamata"),
    bio: [
      "Iman is a product leader who served as Head of Product at INDICO by Telkomsel and earlier as Head of Product at Tokopedia.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "borrys-hasian": {
    linkedin: li("borryshasian"),
    discipline: "DESIGN",
    role: "Product Designer & Founder, ois.design",
    company: "ois.design",
    city: "Abu Dhabi",
    tags: ["PRODUCT DESIGN", "UX", "DESIGN SPRINT"],
    focus: "PRODUCT DESIGN",
    bio: [
      "Borrys is a product designer and former engineer — the first Indonesian named a Google Expert in Product Design — who founded the design studios ois.design and Circle UX.",
      "He was a guest on the BroBri podcast.",
    ],
  },
  "big-zaman": {
    linkedin: li("bigzaman"),
    bio: [
      "Big co-founded Badr Interactive in 2012 and leads it as CEO, building custom software for organisations and winning Tech in Asia's Startup Arena in 2014.",
      "He also co-founded the Founderplus accelerator and was a guest on the BroBri podcast.",
    ],
  },
  "gerald-halasan": { city: "Singapore" },
};

const vowel = (s) => /^[aeiou]/i.test(s);
const FOUNDER_ROLE = /founder|owner|^ceo|^cto|^cpo|^cpto|chief/i;

function genBio(b) {
  const first = b.name.split(/\s+/)[0];
  const indep = /^independent/i.test(b.company);
  let s1;
  if (indep) {
    s1 = `${first} works independently as ${vowel(b.role) ? "an" : "a"} ${b.role}.`;
  } else if (FOUNDER_ROLE.test(b.role)) {
    s1 = `${first} is ${b.role} of ${b.company}.`;
  } else {
    s1 = `${first} is ${vowel(b.role) ? "an" : "a"} ${b.role} at ${b.company}.`;
  }
  const s2 = `${first} was a guest on the BroBri podcast, where Brian Arfi interviews the people building Indonesia's products.`;
  return [`${s1} ${s2}`];
}

let enriched = 0;
let generated = 0;
for (const b of builders) {
  const o = OVERRIDES[b.slug];
  if (o) {
    Object.assign(b, o);
    enriched++;
  } else if (!b.bio || b.bio.length === 0) {
    b.bio = genBio(b);
    generated++;
  }
}

// Safety net: any entry still without a bio (e.g. an override that only fixed a
// field) gets a generated factual bio.
for (const b of builders) {
  if (!b.bio || b.bio.length === 0) {
    b.bio = genBio(b);
    generated++;
  }
}

writeFileSync(FILE, JSON.stringify(builders, null, 2) + "\n");
console.log(
  `[enrich] ${builders.length} builders · ${enriched} researched overrides · ${generated} generated bios · ${builders.filter((b) => b.linkedin).length} have LinkedIn`
);
