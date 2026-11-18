# BaBaKos (Barang Bekas Kost)

Frontend-only **mockup** of a used kost-item marketplace for Universitas Brawijaya students. There is no backend and never will be: no API calls, no real auth, no maps API.

## Hard constraint: HTML, CSS, JS only
This is a course requirement. No frameworks (React, Vue, etc.), no CSS frameworks (Tailwind, Bootstrap), no npm, no build step, no TypeScript. Write plain HTML files, one stylesheet in `css/`, and vanilla JS. The only external resource is the Google Fonts stylesheet. Icons are inline SVG (`BBK.icon(name)` in `js/layout.js`; add new Lucide paths there).

## Structure
- One HTML file per page at the repo root (`index.html`, `jelajah.html`, `produk.html?id=p1`, …). The page spec is `docs/PAGES.md`; keep it in sync.
- `css/style.css`: design tokens (`:root` custom properties) plus shared components. Use the tokens, not raw colors, so the Figma palette can be swapped in one place. Page-specific CSS goes at the bottom under a `/* ---------- <page> ---------- */` heading.
- `js/data.js`: all mock data on the global `window.BBK`.
- `js/utils.js`: formatting (`BBK.formatRupiah`), lookups (`BBK.getProduct` …), `BBK.param()` for query strings, `BBK.escape()` for any user text put in innerHTML, `BBK.store` (localStorage wrapper that fails soft), and `BBK.auth` (mock OTP login: any `…ac.id` email, any 6-digit code).
- `js/layout.js`: injects the navbar and footer, and redirects `<body data-auth="required">` pages to `masuk.html` when logged out.
- Page logic goes in `js/pages/<page>.js`, loaded after the three shared scripts.
- Scripts are classic `<script>` tags, not ES modules, so pages also work opened via `file://`.
- Data that must survive navigation between pages (session, new chats, new orders, new listings) goes in `BBK.store`, seeded from `js/data.js`.

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
