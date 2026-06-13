/**
 * Post-build SEO prerender.
 *
 * Vite builds a SPA; this script stamps route-specific <head> tags, JSON-LD and
 * a <noscript> fallback into a static HTML file per route so every profile is
 * indexable without JavaScript:
 *
 *   dist/index.html            (overwritten with ItemList JSON-LD + full list)
 *   dist/about/index.html
 *   dist/s/<slug>/index.html   (one per profile, Person JSON-LD)
 *   dist/sitemap.xml
 *
 * Runs automatically via `npm run build`. Standalone on purpose — it does not
 * touch the Vite/React setup, so Lovable can keep editing the app freely.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const site = JSON.parse(readFileSync("src/data/site.json", "utf8"));
const builders = JSON.parse(readFileSync("src/data/builders.json", "utf8"));

const DISCIPLINE_LABEL = {
  PRODUCT: "Product",
  ENGINEERING: "Engineering",
  DESIGN: "Design",
  BUSINESS: "Business & Deals",
  EDUCATION: "Education",
  FOUNDER: "Founder",
};

if (!existsSync(path.join(DIST, "index.html"))) {
  console.error("[prerender] dist/index.html not found — run `vite build` first.");
  process.exit(1);
}
const template = readFileSync(path.join(DIST, "index.html"), "utf8");

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// guard against </script> breaking out of the JSON-LD block
const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

const absUrl = (p) => (p && p.startsWith("http") ? p : site.url + p);

const truncate = (s, max = 155) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
};

function replaceBetween(html, startMarker, endMarker, inner) {
  const i = html.indexOf(startMarker);
  const j = html.indexOf(endMarker);
  if (i === -1 || j === -1) {
    throw new Error(`[prerender] marker ${startMarker} missing from dist/index.html`);
  }
  return html.slice(0, i + startMarker.length) + "\n" + inner + "\n    " + html.slice(j);
}

function renderPage({ title, description, url, image, ogType = "website", jsonLdBlocks = [], noscript }) {
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...jsonLdBlocks.map(jsonLd),
  ].join("\n    ");

  let html = replaceBetween(template, "<!-- SEO_HEAD_START -->", "<!-- SEO_HEAD_END -->", "    " + head);
  html = replaceBetween(html, "<!-- SEO_CONTENT_START -->", "<!-- SEO_CONTENT_END -->", noscript);
  return html;
}

function writeRoute(route, html) {
  const dir = path.join(DIST, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), html);
}

const defaultImage = absUrl("/og-default.png");

/* ---------------------------------------------------------------- home */
const listItems = builders
  .map(
    (b) =>
      `        <li><a href="/s/${b.slug}">${esc(b.name)}</a> — ${esc(b.role)} at ${esc(b.company)}, ${esc(b.city)}</li>`
  )
  .join("\n");

const homeHtml = renderPage({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  url: site.url + "/",
  image: defaultImage,
  jsonLdBlocks: [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: site.url + "/",
      description: site.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": site.url + "/#org",
      name: site.name,
      url: site.url + "/",
      description: site.description,
      areaServed: { "@type": "Country", name: "Indonesia" },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${site.name} — ${site.tagline}`,
      numberOfItems: builders.length,
      itemListElement: builders.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        url: `${site.url}/s/${b.slug}`,
      })),
    },
  ],
  noscript: `    <noscript>
      <main>
        <h1>${esc(site.name)} — ${esc(site.tagline)}</h1>
        <p>${esc(site.description)}</p>
        <h2>The Index</h2>
        <ul>
${listItems}
        </ul>
        <p><a href="/about">About this index</a></p>
      </main>
    </noscript>`,
});
writeFileSync(path.join(DIST, "index.html"), homeHtml);

/* --------------------------------------------------------------- about */
writeRoute("about", renderPage({
  title: `About | ${site.name}`,
  description: `How ${site.name} curates the people building Indonesia's products, how to claim your profile, and how to request updates or removal.`,
  url: site.url + "/about",
  image: defaultImage,
  noscript: `    <noscript>
      <main>
        <h1>About ${esc(site.name)}</h1>
        <p>${esc(site.description)}</p>
        <p>Profiles are curated by hand from publicly available professional information. Email ${esc(site.contactEmail)} to claim, update, or remove your profile — handled within 48 hours.</p>
        <p><a href="/">Browse the index</a></p>
      </main>
    </noscript>`,
}));

/* ------------------------------------------------------------ profiles */
for (const b of builders) {
  const url = `${site.url}/s/${b.slug}`;
  const description = truncate(b.bio?.[0] ?? `${b.name} is ${b.role} at ${b.company}, based in ${b.city}, Indonesia.`);
  const image = b.photo ? absUrl(b.photo) : defaultImage;
  const disciplineLabel = DISCIPLINE_LABEL[b.discipline] ?? b.discipline;

  const showcaseHtml = b.showcase?.length
    ? `        <h2>Showcase</h2>
        <ul>
${b.showcase.map((s) => `          <li><strong>${esc(s.title)}</strong> — ${esc(s.description)}</li>`).join("\n")}
        </ul>`
    : "";

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: b.name,
    jobTitle: b.role,
    worksFor: { "@type": "Organization", name: b.company },
    address: { "@type": "PostalAddress", addressLocality: b.city, addressCountry: "ID" },
    url,
    image,
    description,
    knowsAbout: [disciplineLabel, ...b.tags],
  };
  if (b.linkedin) person.sameAs = [b.linkedin];

  writeRoute(`s/${b.slug}`, renderPage({
    title: `${b.name} — ${b.role} at ${b.company} | ${site.name}`,
    description,
    url,
    image,
    ogType: "profile",
    jsonLdBlocks: [person],
    noscript: `    <noscript>
      <main>
        <article>
          <h1>${esc(b.name)}${b.claimed ? " ✓" : ""}</h1>
          ${b.claimed ? "<p><strong>✓ Verified profile</strong> — claimed and maintained by the builder.</p>" : ""}
          <p><strong>${esc(disciplineLabel)}</strong> · ${esc(b.role)} at ${esc(b.company)} — ${esc(b.city)}, Indonesia</p>
${b.bio.map((line) => `          <p>${esc(line)}</p>`).join("\n")}
          <p>Specialties: ${b.tags.map(esc).join(", ")}. Experience: ${esc(b.experience)}.</p>
${showcaseHtml}
          ${b.linkedin ? `<p><a href="${esc(b.linkedin)}" rel="noopener">View ${esc(b.name)} on LinkedIn</a></p>` : ""}
          <p><a href="/">&larr; Browse the full ${esc(site.name)} index</a></p>
        </article>
      </main>
    </noscript>`,
  }));
}

/* ------------------------------------------------------------- sitemap */
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: site.url + "/", priority: "1.0" },
  { loc: site.url + "/about", priority: "0.5" },
  ...builders.map((b) => ({ loc: `${site.url}/s/${b.slug}`, priority: "0.8" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

console.log(`[prerender] ${builders.length} profiles + home + about prerendered, sitemap.xml written.`);
