# BaBaKos design reference (Figma "IMK", page `hifi`)

Source of truth for how every page looks:
https://www.figma.com/design/CKoPI6Q0usn16lgIjk6rMw/IMK (page `hifi`, node `36:217`).
The `Wireframe` page (`0:1`) is the older low-fi pass; ignore it.

This file plus the PNGs in `docs/figma/` are the local copy of that design, so day-to-day
work does not need Figma calls (the connected account is on a low monthly MCP limit).
Only go back to Figma when the design changes or a frame needs exact values not written here.
`docs/figma/hifi-metadata.xml` has the full layer tree (node ids, names, sizes) for targeted lookups.

## Frames → pages

| Figma frame | Node | Screenshot | Our page |
|---|---|---|---|
| BERANDA | `36:562` | `figma/beranda.png` | `index.html` |
| KATALOG | `36:865` | `figma/katalog.png` | `jelajah.html` |
| DETAIL PRODUK | `36:1264` | `figma/detail-produk.png` | `produk.html` |
| Android Compact - 89 (search history + side nav) | `36:1364` | `figma/android-89.png` | search state in `jelajah.html`, mobile nav |
| Android Compact - 90 (searching + chat widget) | `36:1390` | `figma/android-90.png` | loading state, floating chat (`chat.html`) |
| Android Compact - 91 (no results) | `36:1414` | `figma/android-91.png` | empty state in `jelajah.html` |
| Dashboard profil | `74:1250` | `figma/profil.png` | `profil.html` |
| Web Landscape - Pesanan Saya | `36:2130` | `figma/pesanan-saya.png` | `pesanan.html` / `lacak.html` |
| Kelola Pesanan - Penjualan (Desktop) | `36:2561` | `figma/kelola-pesanan-penjualan.png` | seller order management (new) |
| Login | `69:3380` | `figma/login.png` | `masuk.html` |
| Signup | `69:3368` | `figma/signup.png` | `daftar.html` |
| Forgot Password | `69:3392` | `figma/forgot-password.png` | (not built yet) |
| Marketplace navigation | `86:680` | — | shared navbar (`js/layout.js`) |

No frames exist yet for `checkout.html`, `jual.html`, `verifikasi.html`, `404.html`:
build those from the same tokens and components.

## Look in one line
Warm white background, maroon accent, Plus Jakarta Sans, rounded corners (12–20px),
thin pinkish borders, soft shadow only on floating elements. Desktop frames are 1440px wide;
we still build mobile-first (360px) and scale up to that layout.

## Color tokens (Figma names → value)

| Figma variable | Value | Use |
|---|---|---|
| Maroon/Normal | `#9F283A` | primary buttons, links, prices, active nav, icons |
| Maroon/Light | `#F5EAEB` | active menu item, avatar, icon tiles |
| Base/Background | `#FEFBFC` | navbar, page tint, soft cards |
| Base/White | `#FFFFFF` | cards |
| Gray/Light :active | `#FAF4F4` | grouped section background |
| Border (unnamed) | `#EDE3E5` | card borders, dividers, nav bottom border |
| Text/Primary | `#1B1313` (code uses `#160F0F`) | headings, body |
| Text/Secondary | `#544D4D` | secondary text, nav links |
| Gray/Dark :hover | `#908384` | captions, muted text |
| Semantic/Green/Normal | `#53B34D` | "Selesai" status, trust score |
| Semantic/Green/Light | `#EEF7ED` | green badge text / tinted panels |

Not named as variables in Figma; sampled from the frame screenshots (pixel reads, no MCP calls)
and now tokens in `css/style.css`:

| Token | Value | Where |
|---|---|---|
| `--maroon-soft` | `#ECD6D8` | selected filter chip ("Semua") |
| `--maroon-line` | `#E1BCC2` | photo frames, schedule dividers |
| `--mauve` | `#B4A4A5` | "Kondisi" / "Kategori" tags |
| `--cream` | `#FBF1E2` | seller avatar, "Dijual" tag |
| `--peach` | `#F7E2C3` | "Pesanan Baru" band, own chat bubble |
| `--blue-bg` | `#EEF2FF` | "Siap COD" band, payment panel |
| `--red-bg` | `#FEE2E2` | "Tolak Pesanan" button |
| `--amber-bg` / `--amber-line` | `#FFFBEB` / `#CDAB74` | countdown box |
| `--amber` | `#E6A23C` | "Diambil dari" dot, stars |
| `--green-chip` | `#C4ECD6` | trust-score chip |
| `--field` | `#F3F4F6` | chat input |
| `--row` | `#F8F9FB` | item row in seller order cards |
| auth page | `#F2F4F8` bg, `#DDE1E6` card border, `#C1C7CD` field rule | Login / Signup / Verification |

## Typography
Font: **Plus Jakarta Sans** (Google Fonts, weights 400/500/600/700).
The Login/Signup frames use Roboto; treat that as a leftover and use Plus Jakarta Sans everywhere.

| Style | Size / line height | Weight |
|---|---|---|
| Page title (e.g. "Halo, …!") | 30 / 40 | 700 |
| Heading/S | 24 / 32 | 700 |
| Body/L | 20 / 28 | 700 |
| Body/M | 16 / 24 | 600, 700 |
| Body/S | 14 / 20 | 400, 500, 600, 700 |
| Caption/S | 12 / 16 | 400, 600 |

Price on product detail is large maroon bold (~32px). Card prices are 16px, dark.

## Shape, spacing, effects
- Radius: 12px buttons, inputs, menu items, small tiles; 14px inner cards; 20px main cards/sections; 999px pills and avatars; status tag 16px.
- Borders: 1px `#EDE3E5`.
- Shadow: only on floating things. Chat launcher: `0 6px 20px rgba(159, 40, 58, 0.19)`. Product cards have a faint bottom shadow.
- Layout: navbar 80px tall, 40px side padding; content padding 32–40px; card padding 20–28px; gaps 8/16/24/32px.

## Components (from the frames)
- **Navbar**: text wordmark "BaBaKos" in maroon bold (replaces the Figma otter logo mark, see "No mascot" below) + "Beranda", "Katalog" links (14/500, secondary text); right side: location ("Lowokwaru", maroon, pin icon) or "Jelajahi barang" link, 1px divider, avatar circle (initials, maroon on Maroon/Light) + username + chevron. Search pill in the middle on Beranda/Katalog.
- **Primary button**: maroon fill, white 16/700, 48px tall, 12px radius. **Outline button**: 1px border, maroon text ("Edit Profil", "Chat").
- **Text action**: maroon 14/600 + arrow-right icon ("Lihat detail →").
- **Status tag**: green pill, white 14/700 text ("Selesai").
- **Product card**: white, photo on top, thin divider, name (12–13px), price 16px, pickup point with pin icon. 6 per row on desktop.
- **Category icons** (Beranda): 50px maroon-outlined circles with a maroon icon, maroon label below.
- ~~Bundle cards ("Paket Bundling Hemat")~~: removed. Buying several items from one seller is now the buyer's own bundle (per-seller cart on `profil.html?id=…` → `checkout.html?items=…`).
- **Sidebar menu** (profile): 52px rows, 12px radius, icon + label; active row on Maroon/Light with a small maroon dot.
- **Floating chat**: white rounded panel, seller header with online dot, product context card, bubbles, rounded input with send icon. "Buka Chat" maroon launcher bottom right.
- **Empty state**: centered gray message ("Yah, barangnya belum ada nih, Yuk cari yang lain!") with a maroon Lucide icon in a Maroon/Light circle above it, in place of the mascot.
- Icons are Lucide (user-round, package, heart, lock-keyhole, circle-help, log-out, graduation-cap, pencil, mail, arrow-right, messages-square, shopping-bag, chevron-down): keep using `BBK.icon()`.

## No mascot
The Figma file uses a maroon otter mascot as the navbar logo mark and as the empty-state
illustration. We do not use it anywhere: the navbar shows the "BaBaKos" text wordmark and
empty states use an icon. Ignore the otter when reading the screenshots.

## Content differences to resolve
The design shows things the current mockup doesn't do: rentals ("Harga sewa", "Durasi sewa"),
password login with Google/Apple/Twitter buttons, a seller "Kelola Pesanan" dashboard with
escrow status. Our mockup uses email OTP and sales only. Follow the design's look; decide
feature by feature whether to adopt its content.
