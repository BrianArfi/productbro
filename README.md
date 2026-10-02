# productbro_

**Find the people building products in Indonesia in one search, and give each of them a public page they can claim.**

For PMs, founders and recruiters in Indonesia who need to find product people, and for developers who want to run or extend the index.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
![React 18 + TypeScript + Vite](https://img.shields.io/badge/React_18-TypeScript_%2B_Vite-0D453E.svg)
![No backend](https://img.shields.io/badge/backend-none-C8F751.svg)

![Illustration. Left: "Who builds products in Indonesia? Search one index." Right: four scattered ways people ask today pop up (a LinkedIn search, a WhatsApp group question "Ada yang kenal PM fintech di Jakarta?", a tweet, a shared spreadsheet), then collapse into one ProductBro index: a search for "fintech", a Jakarta filter, and three sample builder cards, with a "Claimed by Dina" stamp landing on Dina's card](docs/hero.gif)

ProductBro is **Indonesia's Product Builder Index**: a curated, public directory of product managers, engineers, designers, dealmakers, educators and founders. It is a static React site. Every profile gets its own prerendered page that search engines and link previews can read, and every person listed can claim, correct or remove their profile. The idea follows [searchbro.id](https://searchbro.id) (an index of SEO specialists), widened from "PM" to every kind of product builder.

## The problem

Maya is a recruiter. Her client, a fintech in Jakarta, wants a Head of Product by next month. Here is her afternoon:

- She searches LinkedIn for "head of product fintech jakarta" and gets pages of people, with no way to tell who actually builds product.
- She asks in a WhatsApp PM group. One reply says "try the other group", another says "I'll look for you later".
- Someone's tweet asks "who is building product in Indonesia? drop names", and the names are buried in replies.
- A shared sheet, `pm-list-v3.xlsx`, has half names, old companies and "(ask Sam)".
- At the end she has two half names and nothing she can link to when she reports back.

The people exist. The information about them is scattered across LinkedIn, X, WhatsApp groups and private spreadsheets, and none of it is one page you can search, filter and share.

## Who it is for

**Good fit if you...**

- hire or look for product people in Indonesia (PMs, founders, recruiters, community organisers) and want one place to search by discipline, specialty and city;
- build product in Indonesia and want a public profile that you control: claim it, correct it, add your photo, or ask for it to be removed;
- run a community or podcast and want to turn your guest list into a searchable, SEO-friendly directory;
- are a developer who wants a small, readable codebase: React, TypeScript, Vite, one JSON file, no backend.

**Not for you if...**

- you need a job board, applications or messaging. ProductBro lists people and links out to LinkedIn; it does not run hiring.
- you want self-serve accounts. There is no login: claims arrive through a form and the maintainer updates the data by hand.
- you need private or contact data. Only professional facts are listed (name, role, company, city, specialties). No emails or phone numbers.
- you need it live today. The planned domain is `productbro.id`, and the launch checklist below is still open.

## Before and after

| Before | After |
| :--- | :--- |
| Search LinkedIn, X and WhatsApp groups one by one | One search box over every profile: name, role, company, city, discipline, tags |
| "Anyone know a fintech PM?" and wait | Filter by discipline (Product, Engineering, Design, Business & Deals, Education, Founder), specialty tags and city |
| Half names in a private spreadsheet | One public page per person at `/s/<slug>`, with role, company, specialties and bio |
| Nothing to send the hiring manager | A URL per profile that renders without JavaScript, with Open Graph tags for link previews |
| People listed with no say over it | **Claim profile** on every unclaimed page, plus "Request an update or removal" by email |

![Illustration with sample people. Maya, a recruiter, needs a fintech product lead in Jakarta. Before: browser tabs for LinkedIn, X, WhatsApp Web and a spreadsheet, a WhatsApp group with no useful answer, a sheet of half names, and notes saying "No link to send the hiring manager". A lime bar wipes across to After: a ProductBro search for "fintech" with Product and Jakarta filters on, showing 2 builders, Ayu Lestari and Dina Pratama, each with a profile URL](docs/before-after.gif)

## How it works

1. **The data.** Every builder is one entry in [`src/data/builders.json`](src/data/builders.json): slug, name, discipline, role, company, city, tags, experience, LinkedIn, photo, bio, `claimed`, and an optional showcase. Site settings (name, URL, form links, contact email) live in [`src/data/site.json`](src/data/site.json).
2. **The app.** `vite build` turns it into a React app: a searchable, filterable index at `/`, a profile page at `/s/<slug>`, and `/about`. Filter chips and the builder counter follow whatever is in the JSON, so you never edit a component to add people.
3. **Prerender.** [`scripts/prerender.mjs`](scripts/prerender.mjs) runs right after the build. It writes a static HTML file per route (`dist/s/<slug>/index.html`) with the title, meta description, canonical URL, Open Graph tags, JSON-LD (`Person` per profile, `ItemList` on the home page) and a `<noscript>` text version, plus `dist/sitemap.xml`.
4. **Found, then claimed.** Upload `dist/` to any static host. Each profile URL is readable by search engines and link previews. The **Claim profile** button opens your claim form (a Tally link in `site.json`) with `?slug=<slug>` filled in. You verify the person, set `"claimed": true` (and any corrections) in `builders.json`, and rebuild. The profile then shows a **Verified** badge.

![Illustration of the build pipeline. Four cards draw in from left to right: 1 The data, src/data/builders.json; 2 The app, vite build, with routes /, /s/dina-pratama and /about; 3 Prerender, scripts/prerender.mjs, writing dist/s/dina-pratama/ and dist/sitemap.xml; 4 Found, on any static host, with a sample search result. A dot travels along the row. Then a loop draws back from card 4 to card 1: the builder presses Claim profile, the form opens with ?slug=dina-pratama, you set "claimed": true and rebuild. Last line: Next build shows a Verified badge on the card and profile](docs/how-it-works.gif)

## See it run

A real build and a real run of this repo, recorded with Playwright on **sample data** (invented people: Dina, Ayu and friends, from [`docs/src/sample-builders.json`](docs/src/sample-builders.json)), so no real person's profile appears in the recording.

![Real recording of ProductBro served locally by vite preview, with a "Sample profiles below" banner. The cursor types "fintech" in the search box, clicks the Product chip, and the grid narrows to 2 builders, Ayu Lestari and Dina Pratama. It opens Dina's profile: Head of Product at ContohPay, Jakarta, tags FINTECH, PAYMENTS, GROWTH, and an "Is this you?" box. It presses Claim profile, and a caption shows the button opens the claim form with ?slug=dina-pratama prefilled. Then the same profile URL with JavaScript turned off shows the prerendered text. Last, the real npm run build output, ending with "[prerender] 10 profiles + home + about prerendered, sitemap.xml written."](docs/demo.gif)

To record it yourself: `npm ci`, then `python docs/src/record_demo.py` (needs Python with Playwright and ffmpeg). It copies the app to a temp folder, swaps in the sample data, runs `npm run build`, serves `dist/` and records. Your `src/data` is never touched.

## What is in the index today

The data in this repo is a first, unreviewed seed. Counted from `src/data/builders.json`:

- **195 profiles**, seeded from guests of the BroBri podcast (hosted by Brian Arfi) and from Brian's LinkedIn connections.
- By discipline: Product 46, Founder 45, Business & Deals 32, Engineering 28, Education 24, Design 20.
- 124 profiles have a LinkedIn URL. The rest are empty on purpose, and the **Connect on LinkedIn** button hides itself.
- 1 profile is claimed (Brian's). No profile has a photo yet, so every card shows a generated monogram avatar.

**Review before deploying to a public domain.** Roles and companies change, and most bios are short factual lines generated from the source data. See [Curation notes](#curation-notes).

## Run it locally

You need Node 18 or newer.

```bash
git clone https://github.com/BrianArfi/productbro
cd productbro
npm ci
npm run dev        # http://localhost:8080 (port taken? npm run dev -- --port 3001)
npm run build      # vite build + SEO prerender -> dist/
npm run preview    # serve the built site
```

**Stack:** Vite, React 18, TypeScript, Tailwind 3, shadcn/ui, React Router and framer-motion. This is the classic Lovable scaffold, so the repo can be imported into Lovable and edited there.

- **No backend.** Profiles are `src/data/builders.json`, site settings are `src/data/site.json`.
- **SEO:** `scripts/prerender.mjs` runs automatically after `vite build`. It does not touch the React setup.

### Example: add a builder

Add one entry to `src/data/builders.json`:

```jsonc
{
  "slug": "dina-pratama",               // URL: /s/dina-pratama
  "name": "Dina Pratama",
  "discipline": "PRODUCT",              // PRODUCT | ENGINEERING | DESIGN | BUSINESS | EDUCATION | FOUNDER
  "role": "Head of Product",
  "company": "ContohPay",
  "city": "Jakarta",
  "tags": ["FINTECH", "PAYMENTS"],      // uppercase; become filter chips automatically
  "focus": "FINTECH PM",                // one main label
  "experience": "10+ YRS",              // also used for "Sort: Experience"
  "linkedin": "",                       // "" hides the LinkedIn button
  "photo": "",                          // "/photos/<slug>.jpg" or an https URL; "" shows a monogram
  "bio": ["Paragraph 1.", "Paragraph 2."],
  "claimed": false,                     // true shows the Verified badge
  "showcase": [                         // optional: products they shipped
    { "title": "...", "description": "...", "link": "https://..." }
  ]
}
```

Run `npm run build` and `dist/s/dina-pratama/index.html` appears, with its own title, description, `Person` JSON-LD and an entry in `sitemap.xml`. (Dina is a sample person; she is not in the real data.)

`sampleData` in `src/data/site.json` is `false`, so no banner shows. Set it to `true` while you work with dummy data, and the index shows a "Sample profiles below" banner.

### Disciplines

Each builder has one `discipline`, the main filter on the home page. The options and their order are in `DISCIPLINE_ORDER` in [`src/lib/builders.ts`](src/lib/builders.ts). To add or rename one, edit `Discipline`, `DISCIPLINE_ORDER` and `DISCIPLINE_LABEL` there, and update `DISCIPLINE_LABEL` in `scripts/prerender.mjs` to match. The chips and labels follow.

### Data scripts

- `node scripts/enrich-builders.mjs` regenerates bios. Researched bios and verified LinkedIn URLs for notable people are in its `OVERRIDES` map; everyone else gets a short factual bio from their role and company.
- `node scripts/import-linkedin-connections.mjs [limit]` reads a LinkedIn connections export, keeps product builders, and writes a balanced sample to `src/data/builders-import.json`.
- `node scripts/apply-linkedin.mjs` applies a batch of found LinkedIn URLs.
- `node scripts/fetch-photos.mjs` downloads photos (see below).
- `node scripts/generate-og-image.mjs` makes `public/og-default.png`, the 1200x630 social share image.

### Photos

Profile photos **cannot be scraped from LinkedIn automatically** (terms of service, login required, and CDN URLs expire). So by default every profile uses a generated avatar from `BuilderPhoto`: a monogram on a gradient that is the same for the same name every time. To add real photos:

- **One person:** put the file at `public/photos/<slug>.jpg` (4:5, at least 600 px) and set `"photo": "/photos/<slug>.jpg"`.
- **Many URLs:** create `scripts/photos.json` with `{ "<slug>": "<image-url>" }` and run `node scripts/fetch-photos.mjs`. It downloads to `public/photos/` and sets `photo`.
- **Most natural:** the photo comes in when the person claims their profile and uploads it.

### Project structure

```
src/
├── data/builders.json    <- main data source (builder profiles)
├── data/site.json        <- site name, URL, Tally links, contact email, sampleData flag
├── lib/builders.ts       <- types, disciplines, filter and sort helpers
├── pages/                <- Index (hero + grid), Profile (/s/:slug), About, NotFound
├── components/           <- BuilderCard, SearchBar, FilterChips, BuilderPhoto, ...
└── components/ui/        <- shadcn/ui
scripts/prerender.mjs     <- static SEO page per route + sitemap (post-build)
docs/src/                 <- sources for the README GIFs and the demo recording
```

## Deploy on Cloudflare Pages

1. Cloudflare Dashboard, Workers & Pages, Create, Pages, connect this GitHub repo.
2. Build command: `npm run build`. Output directory: `dist`.
3. `public/_redirects` (SPA fallback) and Cloudflare Pages' trailing-slash handling make every route work: profile URLs are served from the prerendered HTML, everything else falls back to the SPA.

## Connect to Lovable

The repo matches the classic Lovable scaffold (one `package.json`, a `dev` script, Tailwind 3, no monorepo, `lovable-tagger` in the Vite config):

1. Lovable, **New Project, Import from GitHub**, and authorize this repo.
2. Edit visuals and features in Lovable. Changes sync both ways through GitHub.
3. `scripts/prerender.mjs` is standalone. Lovable will not touch it, and it still runs on `npm run build`.

## Curation notes

- Profiles come from the BroBri podcast guest list and Brian's LinkedIn connections. **Check every fact** (roles and companies change). Bios for notable people were checked against public sources; the rest come from the source data. Check them by hand anyway.
- **LinkedIn:** only verified URLs are filled in; the rest are `""`. Do not link the wrong person.
- Fill in the remaining LinkedIn URLs and bios over time, or let them come in through claims.

## Launch checklist

- [ ] Verify the profiles (role, company, bio) and fill in LinkedIn and photos. Public professional information only, no emails or phone numbers. The About page promises claim and removal requests are handled within 48 hours.
- [ ] Create two [Tally](https://tally.so) forms: **Claim profile** (slug, name, work email or LinkedIn for verification, corrections, photo upload) and **Get listed / nominate** (name, role, company, city, discipline, LinkedIn, reason). Replace `tallyClaimUrl` and `tallyListUrl` in `src/data/site.json`. They are still placeholders.
- [ ] Replace `contactEmail` in `src/data/site.json`.
- [x] Add `public/og-default.png` (1200x630) for social sharing.
- [ ] Add analytics (Cloudflare Web Analytics: add the snippet to `index.html`).
- [ ] Buy the `productbro.id` domain (a local registrar; `.id` needs an Indonesian ID card). If the domain changes, update `url` in `src/data/site.json`, `index.html` and `public/robots.txt`.

## FAQ

**Is there a live site?**
Not yet. The planned domain is `productbro.id`. Run it locally with `npm run dev`, or deploy `dist/` yourself.

**How does claiming work without a backend?**
The **Claim profile** button opens a form (Tally) with the profile's slug in the URL. The maintainer checks that the person is who they say they are, updates `builders.json` (`"claimed": true`, corrections, photo) and rebuilds. A claimed profile shows a Verified badge on its card and page.

**I am listed and want to be removed. What do I do?**
Every unclaimed profile has a "Request an update or removal" link that opens an email to the contact address in `site.json`. The About page says requests are handled within 48 hours, no questions asked.

**Where does the data come from?**
Hand-curated from public professional information: LinkedIn profiles, talks, podcasts and published writing. The first entries are BroBri podcast guests and Brian's LinkedIn connections. Only professional facts are listed, never private contact details.

**Why prerender instead of server-side rendering?**
The site is plain static files, so it can be hosted for free on Cloudflare Pages with no server. `prerender.mjs` gives every profile URL real HTML, meta tags and JSON-LD for search engines and link previews, while the React app stays a normal Vite SPA you can keep editing in Lovable.

**Can I fork it for another country or community?**
Yes. Replace `src/data/builders.json` and `src/data/site.json`, adjust the disciplines in `src/lib/builders.ts` (and the labels in `scripts/prerender.mjs`), and update the domain in `index.html` and `public/robots.txt`. The code is Apache-2.0.

**Why are there no photos?**
Photos cannot be scraped from LinkedIn automatically, so every profile starts with a generated monogram. Real photos come from `public/photos/`, `scripts/fetch-photos.mjs`, or the person's claim. See [Photos](#photos).

## Changelog

No releases yet (`package.json` version 0.1.0). **Latest:** this README, with the problem, audience, before/after, animated walkthrough and a real recording on sample data. **Before that:** the seed data grew to 195 builders (BroBri podcast guests plus LinkedIn connections), `og-default.png` was added, and the repo was licensed under Apache-2.0.

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
