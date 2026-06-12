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
const pms = JSON.parse(readFileSync("src/data/pms.json", "utf8"));

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
const listItems = pms
  .map(
    (p, i) =>
      `        <li><a href="/s/${p.slug}">${esc(p.name)}</a> — ${esc(p.role)} at ${esc(p.company)}, ${esc(p.city)}</li>`
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
      numberOfItems: pms.length,
      itemListElement: pms.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${site.url}/s/${p.slug}`,
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
  description: `How ${site.name} curates Indonesia's product management talent, how to claim your profile, and how to request updates or removal.`,
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
for (const p of pms) {
  const url = `${site.url}/s/${p.slug}`;
  const description = truncate(p.bio?.[0] ?? `${p.name} is ${p.role} at ${p.company}, based in ${p.city}, Indonesia.`);
  const image = p.photo ? absUrl(p.photo) : defaultImage;

  const showcaseHtml = p.showcase?.length
    ? `        <h2>Showcase</h2>
        <ul>
${p.showcase.map((s) => `          <li><strong>${esc(s.title)}</strong> — ${esc(s.description)}</li>`).join("\n")}
        </ul>`
    : "";

  writeRoute(`s/${p.slug}`, renderPage({
    title: `${p.name} — ${p.role} at ${p.company} | ${site.name}`,
    description,
    url,
    image,
    ogType: "profile",
    jsonLdBlocks: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: p.name,
        jobTitle: p.role,
        worksFor: { "@type": "Organization", name: p.company },
        address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "ID" },
        url,
        image,
        sameAs: [p.linkedin],
        description,
        knowsAbout: p.tags,
      },
    ],
    noscript: `    <noscript>
      <main>
        <article>
          <h1>${esc(p.name)}${p.claimed ? " ✓" : ""}</h1>
          ${p.claimed ? "<p><strong>✓ Verified profile</strong> — claimed and maintained by the PM.</p>" : ""}
          <p><strong>${esc(p.role)}</strong> at ${esc(p.company)} — ${esc(p.city)}, Indonesia</p>
${p.bio.map((b) => `          <p>${esc(b)}</p>`).join("\n")}
          <p>Specialties: ${p.tags.map(esc).join(", ")}. Experience: ${esc(p.experience)}.</p>
${showcaseHtml}
          <p><a href="${esc(p.linkedin)}" rel="noopener">View ${esc(p.name)} on LinkedIn</a></p>
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
  ...pms.map((p) => ({ loc: `${site.url}/s/${p.slug}`, priority: "0.8" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

console.log(`[prerender] ${pms.length} profiles + home + about prerendered, sitemap.xml written.`);
