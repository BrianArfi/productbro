# productbro_

**Indonesia's Product Builder Index** — direktori publik orang-orang yang membangun produk di Indonesia (PM, engineer, designer, dealmaker, educator, founder) yang dikurasi dan bisa di-claim. Terinspirasi model [searchbro.id](https://searchbro.id) (index SEO specialist), diperluas dari "PM" jadi semua **product builder**.

> ℹ️ **Data saat ini = Brian + 98 tamu podcast BroBri** (`src/data/builders.json`). Tiap profil punya nama, role, company, discipline, tags, dan **bio** (18 figur notable digrounding dari sumber publik; sisanya bio faktual ringkas dari data sheet + fakta "tamu BroBri"). **16 punya LinkedIn terverifikasi**; sisanya kosong (tombol Connect otomatis disembunyikan). **Foto = avatar generated** — foto asli LinkedIn tidak bisa di-scrape otomatis (ToS + login + URL expire), jadi lihat [Foto](#foto) untuk cara nambah foto asli. **Review sebelum deploy ke domain publik.**

## Stack

Vite + React 18 + TypeScript + Tailwind 3 + shadcn/ui + React Router + framer-motion — persis scaffold klasik Lovable, jadi repo ini bisa di-import ke Lovable dan di-edit dari sana.

- **Tanpa backend.** Data profil = `src/data/builders.json`, config situs = `src/data/site.json`.
- **SEO:** `scripts/prerender.mjs` jalan otomatis setelah `vite build` — generate HTML statis per profil (`dist/s/<slug>/index.html`) berisi meta tags, Open Graph, JSON-LD (`Person`, `ItemList`), noscript fallback, plus `sitemap.xml`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:8080 (port 8080 kepakai? pakai: npm run dev -- --port 3001)
npm run build      # vite build + prerender SEO → dist/
npm run preview    # serve hasil build
```

## Disiplin (discipline)

Tiap builder punya satu `discipline` — jadi filter utama di homepage. Pilihannya (lihat `DISCIPLINE_ORDER` di `src/lib/builders.ts`):

`PRODUCT` · `ENGINEERING` · `DESIGN` · `BUSINESS` · `EDUCATION` · `FOUNDER`

Mau nambah/ganti disiplin? Edit `Discipline`, `DISCIPLINE_ORDER`, dan `DISCIPLINE_LABEL` di `src/lib/builders.ts` — chip filter & label otomatis ngikut.

## Ganti / tambah data profil

1. Edit `src/data/builders.json`. Schema per orang:

```jsonc
{
  "slug": "nama-orang",                 // URL: /s/nama-orang
  "name": "Nama Orang",
  "discipline": "PRODUCT",              // PRODUCT|ENGINEERING|DESIGN|BUSINESS|EDUCATION|FOUNDER
  "role": "Senior Product Manager",
  "company": "NamaPerusahaan",
  "city": "Jakarta",
  "tags": ["FINTECH", "GROWTH"],        // uppercase, jadi filter chips otomatis
  "focus": "GROWTH PM",                 // satu label utama
  "experience": "8+ YRS",
  "linkedin": "https://linkedin.com/in/...", // boleh "" → tombol LinkedIn disembunyikan
  "photo": "/photos/nama-orang.jpg",    // atau URL https; kosong → monogram inisial
  "bio": ["Paragraf 1.", "Paragraf 2."],
  "claimed": false,                     // true = badge ✓ Verified
  "showcase": [                         // opsional: produk yang pernah di-ship
    { "title": "...", "description": "...", "link": "https://..." }
  ]
}
```

2. Foto: lihat [Foto](#foto) di bawah.
3. `sampleData` di `src/data/site.json` = `false` (gak ada banner). Set `true` kalau lagi balik pakai data dummy.

Filter chips (discipline, tags, kota) dan counter di hero **otomatis mengikuti isi JSON** — gak perlu edit komponen.

Enrichment bio di-generate ulang via `node scripts/enrich-builders.mjs` (override bio/LinkedIn untuk figur yang sudah diriset ada di map `OVERRIDES` dalam script; sisanya bio faktual otomatis).

## Foto

Foto profil **tidak bisa di-scrape otomatis dari LinkedIn** (ToS + butuh login + URL CDN gampang expire), jadi default semua pakai **avatar generated** dari `BuilderPhoto` (monogram gradien deterministik per nama — konsisten & rapi). Cara nambah foto asli:

- **Manual (1 orang):** taruh file di `public/photos/<slug>.jpg` (rasio 4:5, ≥600px) lalu set `"photo": "/photos/<slug>.jpg"` di `builders.json`.
- **Bulk (banyak URL):** isi `scripts/photos.json` `{ "<slug>": "<image-url>" }` lalu `node scripts/fetch-photos.mjs` — auto-download ke `public/photos/` + set field `photo`.
- **Paling natural:** foto masuk sendiri pas orangnya **claim** profil (upload foto mereka).

### Catatan kurasi (penting sebelum deploy)

- Profil = Brian + tamu podcast BroBri. **Verifikasi tiap fakta** (role/company bisa berubah) — bio figur notable digrounding dari web, sisanya dari data sheet; tetap cek manual.
- **LinkedIn**: cuma yang terverifikasi yang diisi; sisanya `""` (jangan nge-link orang yang salah).
- Lengkapi LinkedIn + bio sisanya bertahap (atau biarkan masuk lewat claim).

## Checklist sebelum launch

- [ ] Verifikasi profil tamu BroBri (role/company/bio) + lengkapi LinkedIn/foto sisanya (hanya info profesional publik; tanpa email/no. HP — lihat halaman About untuk kebijakan claim/hapus ≤48 jam)
- [ ] Bikin 2 form di [Tally](https://tally.so): **Claim profile** (field: slug, nama, email kerja/LinkedIn buat verifikasi, koreksi data, upload foto) dan **Get listed / nominate** (nama, role, company, city, discipline, LinkedIn, alasan). Ganti `tallyClaimUrl` & `tallyListUrl` di `src/data/site.json`
- [ ] Ganti `contactEmail` di `src/data/site.json`
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
├── data/builders.json    ← SUMBER DATA UTAMA (profil builder)
├── data/site.json        ← config: nama situs, URL, Tally links, sampleData flag
├── lib/builders.ts       ← types + discipline + filter/sort helpers
├── pages/                ← Index (hero+grid), Profile (/s/:slug), About, NotFound
├── components/           ← BuilderCard, SearchBar, FilterChips, BuilderPhoto, dst.
└── components/ui/         ← shadcn/ui
scripts/prerender.mjs     ← SEO statis per route + sitemap (post-build)
```
