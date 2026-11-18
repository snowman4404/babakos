# BaBaKos (Barang Bekas Kost)

Frontend-only **mockup** of a used kost-item marketplace for students of universities in Malang (UB, UM, UIN Malang, UMM, and others). There is no backend and never will be: no API calls, no real auth, no maps API.

## Hard constraint: HTML, CSS, JS only
This is a course requirement. No frameworks (React, Vue, etc.), no CSS frameworks (Tailwind, Bootstrap), no npm, no build step, no TypeScript. Write plain HTML files, one stylesheet in `css/`, and vanilla JS. The only external resource is the Google Fonts stylesheet (Plus Jakarta Sans). Icons are inline SVG (`BBK.icon(name)` in `js/layout.js`; add new Lucide paths there).

## Structure
- One HTML file per page at the repo root (`index.html`, `jelajah.html`, `produk.html?id=p1`, …). The page spec is `docs/PAGES.md`; keep it in sync.
- `css/style.css`: design tokens (`:root` custom properties) plus shared components. Use the tokens, not raw colors, so the Figma palette can be swapped in one place. Page-specific CSS goes at the bottom under a `/* ---------- <page> ---------- */` heading.
- Look: **the Figma file "IMK" (page `hifi`) is the source of truth for every page.** Read `docs/DESIGN.md` first: it maps Figma frames to our pages and lists the tokens (maroon `#9F283A`, Plus Jakarta Sans, 12–20px radii, `#EDE3E5` borders) and components. Screenshots of each frame are in `docs/figma/`. Pages with no frame (checkout, jual, verifikasi, 404) are built from the same tokens and components. Figma MCP calls are rate-limited on this account: work from `docs/DESIGN.md` and the screenshots, and call Figma only for exact values or assets not captured there (record what you learn back into `docs/DESIGN.md`). **No mascot anywhere**: the Figma otter (logo mark and empty-state illustration) is dropped; use the text wordmark "BaBaKos" and plain icon empty states instead. The old mockup D look (blue, Literata, square corners) and `mockups/d-pindah-tangan/` are superseded.
- `assets/products/` holds product photos (referenced from `images` in `js/data.js`), `assets/photos/` scene photos. They are Wikimedia Commons samples: every one must be listed in `assets/credits.json` and `BBK.photoCredits` (shown in the footer).
- `js/data.js`: all mock data on the global `window.BBK`.
- `js/utils.js`: formatting (`BBK.formatRupiah` → `Rp85.000`, `BBK.formatDate`, `BBK.timeAgo`, `BBK.formatKm`), lookups (`BBK.getProduct`, `BBK.getOrder`, `BBK.orderItems`, `BBK.orderTitle`, `BBK.areaShortName` …), distances (`BBK.areaDistance`, `BBK.walkMinutes`, `BBK.nearestMeetingPoint`), `BBK.param()`, `BBK.escape()` for any user text put in innerHTML, `BBK.store` (localStorage wrapper that fails soft), demo persistence (`BBK.save.*`, `BBK.setOrderStatus`, `BBK.resetDemo`), `BBK.wishlist`, `BBK.recentSearches`, `BBK.flash` (toast on the next page), and `BBK.auth` (mock: signup → 6-digit code on `verifikasi.html`; login = any `…ac.id` email + 8-char password).
- `js/layout.js`: injects the header into `<header id="site-header">` — the full navbar (wordmark, Beranda/Katalog, search with recent searches, location, chat, Jual, account menu) or, with `data-bar="Title" data-back="page.html"`, a slim back-button bar like the Figma Detail Barang frame. Adds the phone tab bar on full-navbar pages, the footer into `<footer id="site-footer">` (credits + "Reset data demo"), and redirects `<body data-auth="required">` pages to `masuk.html?next=…`. Shared components: `BBK.icon`, `BBK.avatar`, `BBK.productCard(p, i)` for `<ul class="pgrid">`, `BBK.statusPill`, `BBK.campusMap` (illustrated map, pins from `BBK.meetingPoints`), `BBK.toast`, `BBK.confirm` (returns a Promise), `BBK.initReveal()`.
- Page logic goes in `js/pages/<file>.js` (named after the HTML file, e.g. `js/pages/index.js`), loaded after the three shared scripts.
- Scripts are classic `<script>` tags, not ES modules, so pages also work opened via `file://`.
- Data that must survive navigation between pages (session, chats, orders, new listings, item status, reviews, wishlist) goes in `BBK.store`; `js/utils.js` merges it over the seed in `js/data.js` on every load. Change it through `BBK.save.*` / `BBK.setOrderStatus`, never by writing localStorage directly.

## Conventions
- UI text is in **Bahasa Indonesia**; identifiers and comments are in English.
- Prices are integers in Rupiah.
- Mobile-first: works at 360px width with a 16px side gutter and no horizontal scroll.

## Running and deploying
- Locally: open `index.html` in a browser (or use VS Code Live Server).
- GitHub Pages: Settings → Pages → Deploy from a branch → `master` / root. `.nojekyll` disables Jekyll. Live URL: https://snowman4404.github.io/babakos/

## Working rules
- Do not commit or push. The user commits manually; remind them at the end of each change.
- No attribution lines in suggested commit messages or PRs.
