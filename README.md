# productbro_

**Indonesia's Product Management Index** — direktori publik PM Indonesia yang dikurasi dan bisa di-claim. Terinspirasi model [searchbro.id](https://searchbro.id) (index SEO specialist), diadaptasi untuk talent Product Management.

> ⚠️ **Data saat ini masih 12 profil SAMPLE (fiksi)** — nama, perusahaan, dan foto placeholder. Ganti dengan hasil kurasi sebelum launch (lihat [Ganti data](#ganti-data-profil)).

## Stack

Vite + React 18 + TypeScript + Tailwind 3 + shadcn/ui + React Router + framer-motion — persis scaffold klasik Lovable, jadi repo ini bisa di-import ke Lovable dan di-edit dari sana.

- **Tanpa backend.** Data profil = `src/data/pms.json`, config situs = `src/data/site.json`.
- **SEO:** `scripts/prerender.mjs` jalan otomatis setelah `vite build` — generate HTML statis per profil (`dist/s/<slug>/index.html`) berisi meta tags, Open Graph, JSON-LD (`Person`, `ItemList`), noscript fallback, plus `sitemap.xml`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # vite build + prerender SEO → dist/
npm run preview    # serve hasil build
```

## Ganti data profil

1. Edit `src/data/pms.json`. Schema per orang:

```jsonc
{
  "slug": "nama-orang",            // URL: /s/nama-orang
  "name": "Nama Orang",
  "role": "Senior Product Manager",
  "company": "NamaPerusahaan",
  "city": "Jakarta",
  "tags": ["FINTECH", "GROWTH"],   // uppercase, jadi filter chips otomatis
  "focus": "GROWTH PM",            // satu label utama
  "experience": "8+ YRS",
  "linkedin": "https://linkedin.com/in/...",
  "photo": "/photos/nama-orang.jpg", // atau URL https; kosongkan → monogram
  "bio": ["Paragraf 1.", "Paragraf 2."],
  "claimed": false,                // true = badge ✓ Verified
  "showcase": [                    // opsional: produk yang pernah di-ship
    { "title": "...", "description": "...", "link": "https://..." }
  ]
}
```

2. Foto: taruh di `public/photos/<slug>.jpg` (disarankan rasio 4:5, ≥600px).
3. Setelah data asli masuk: set `"sampleData": false` di `src/data/site.json` (banner peringatan hilang otomatis).

Filter chips (tags & kota) dan counter di hero **otomatis mengikuti isi JSON** — gak perlu edit komponen.

## Checklist sebelum launch

- [ ] Kurasi ±60 profil asli ke `pms.json` (hanya info profesional publik; tanpa email/no. HP — lihat halaman About untuk kebijakan claim/hapus ≤48 jam)
- [ ] Bikin 2 form di [Tally](https://tally.so): **Claim profile** (field: slug, nama, email kerja/LinkedIn buat verifikasi, koreksi data, upload foto) dan **Get listed / nominate** (nama, role, company, city, LinkedIn, alasan). Ganti `tallyClaimUrl` & `tallyListUrl` di `src/data/site.json`
- [ ] Ganti `contactEmail` di `src/data/site.json` + set `sampleData: false`
- [ ] Tambah `public/og-default.png` (1200×630) buat social share image
- [ ] Pasang analytics (Cloudflare Web Analytics: tinggal tambah snippet di `index.html`)
- [ ] Beli domain `productbro.id` (registrar lokal, butuh KTP untuk `.id`) — kalau nama domain ganti, update `url` di `src/data/site.json`

## Deploy — Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → connect repo GitHub ini
2. Build command: `npm run build` · Output directory: `dist`
3. `public/_redirects` (SPA fallback) dan trailing-slash resolution CF Pages bikin semua route jalan: URL profil dilayani dari HTML statis hasil prerender, sisanya fallback ke SPA

## Connect ke Lovable

Repo ini sengaja match scaffold klasik Lovable (single `package.json`, `dev` script, Tailwind 3, tanpa monorepo, plus `lovable-tagger` di vite config):

1. Lovable → **New Project → Import from GitHub** → authorize repo ini
2. Edit visual/fitur dari Lovable; perubahan sync dua arah via GitHub
3. `scripts/prerender.mjs` standalone — Lovable gak akan ganggu, dan tetap jalan di `npm run build`

## Struktur

```
src/
├── data/pms.json        ← SUMBER DATA UTAMA (profil)
├── data/site.json       ← config: nama situs, URL, Tally links, sampleData flag
├── lib/pm.ts            ← types + filter/sort helpers
├── pages/               ← Index (hero+grid), Profile (/s/:slug), About, NotFound
├── components/          ← PMCard, SearchBar, FilterChips, PMPhoto, dst.
└── components/ui/       ← shadcn/ui
scripts/prerender.mjs    ← SEO statis per route + sitemap (post-build)
```
