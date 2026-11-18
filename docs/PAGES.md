# BaBaKos — Daftar Halaman

13 halaman + 1 status 404. Tampilan mengikuti Figma "IMK" halaman `hifi` (lihat `docs/DESIGN.md`).
**P1** = wajib untuk presentasi (5 fitur utama), **P2** = pelengkap. Semua sudah dibangun ✅.

| # | Halaman | File | Frame Figma | Prioritas | Fitur utama |
|---|---------|------|-------------|-----------|-------------|
| 1 | Beranda | `index.html` | BERANDA | P1 | Banner, kategori, paket hemat, barang dekat kost |
| 2 | Daftar | `daftar.html` | Signup | P1 | Verifikasi email ac.id |
| 3 | Verifikasi Email | `verifikasi.html` | Forgot Password (Verification Email) | P1 | Kode 6 digit, badge terverifikasi |
| 4 | Masuk | `masuk.html` | Login | P2 | Email ac.id + kata sandi, lupa kata sandi |
| 5 | Katalog | `jelajah.html` | KATALOG + Android 89/90/91 | P1 | Search & filter area kost + harga |
| 6 | Detail Barang | `produk.html?id=p1` | DETAIL PRODUK | P1 | Pintu masuk ke chat & COD |
| 7 | Chat | `chat.html?thread=c1` / `?product=p1` | Android 90 (chat widget) | P1 | Kartu barang otomatis terlampir |
| 8 | Atur COD | `checkout.html?product=p1` / `?bundle=b1` | — | P1 | Peta mockup titik COD |
| 9 | Lacak Pesanan | `lacak.html?id=BBK-2611-001` | Web Landscape - Pesanan Saya | P1 | Status sampai selesai + rating |
| 10 | Pesanan Saya | `pesanan.html` / `?tab=penjualan` | Kelola Pesanan - Penjualan | P2 | Pembelian & penjualan |
| 11 | Jual Barang | `jual.html` | — | P2 | Membuat listing |
| 12 | Profil | `profil.html`, `profil.html?id=u2` | Dashboard profil | P2 | Akun, wishlist, profil toko |
| 13 | 404 | `404.html` | — | P2 | — |

## Alur demo (urutan presentasi)

1. Beranda → **Daftar** (email `@student.ub.ac.id`; coba dulu `@gmail.com` untuk melihat pesan error) → **Verifikasi** (6 angka apa saja) → badge *Mahasiswa Terverifikasi*.
2. **Katalog**: `jelajah.html?area=ketawanggede&max=100000` (area Ketawanggede, harga ≤ Rp100.000), atau ketik di kotak cari navbar.
3. **Detail Barang** (mis. Kipas Angin p1) → **Chat** → kartu barang terlampir di pesan pertama, penjual membalas otomatis.
4. **Beli** → **Atur COD**: pilih pin di peta, tanggal, jam → *Buat Pesanan*.
5. **Lacak Pesanan**: tombol "Mode demo" memainkan langkah penjual (Dikonfirmasi → Jadwal COD → Bertemu) → *Konfirmasi Barang Diterima* → beri rating.
6. (Opsional) **Pesanan Saya → Penjualan**: terima pesanan baru (hitung mundur), **Jual Barang** ("Isi contoh untuk demo").
7. Footer → **Reset data demo** untuk mengulang dari awal (akun tetap masuk).

Akun demo di Masuk: tombol "Isi akun demo" (`rizkypratama@student.ub.ac.id`, kata sandi 8+ karakter apa saja).

## Isi tiap halaman

### Navbar dan tab bar (semua halaman, `js/layout.js`)
- Desktop: wordmark "BaBaKos", Beranda, Katalog, kotak cari (fokus saat kosong → pencarian terakhir), lokasi area kost, ikon chat (jumlah belum dibaca), tombol Jual, menu akun (Profil, Pesanan, Wishlist, Jual, Keluar). Belum masuk: Masuk + Daftar.
- HP: wordmark + lokasi, kotak cari penuh, tab bar bawah (Beranda, Katalog, Chat, Pesanan, Profil).
- Halaman alur (Detail Barang, Atur COD, Lacak, Jual) memakai bar tipis: tombol kembali + judul.

### 1. Beranda `index.html`
- Banner geser 3 slide (otomatis 6 detik, berhenti saat disentuh/hover)
- Ikon kategori (lingkaran maroon) → `jelajah.html?cat=…`
- "Paket Bundling Hemat Mahasiswa Kos": beberapa barang dari satu penjual, harga paket + harga normal dicoret → `checkout.html?bundle=…`
- "Dekat kostmu di …" (sudah masuk), "Baru diunggah", 4 langkah aman

### 2. Daftar `daftar.html`
- Nama depan/belakang, email kampus (harus `ac.id`), kata sandi (meter kekuatan), fakultas, area kost, persetujuan
- Validasi saat keluar dari kolom; tombol "Kirim Kode Verifikasi"

### 3. Verifikasi `verifikasi.html`
- "Masukkan kode yang kami kirim ke r***@student.ub.ac.id", 6 kotak (bisa tempel), kirim ulang 60 detik
- Sukses: badge **Mahasiswa Terverifikasi** + lanjut ke halaman tujuan (`next`)
- `?mode=reset`: alur lupa kata sandi dari Masuk

### 4. Masuk `masuk.html`
- Email kampus + kata sandi (tampil/sembunyi), ingat saya, lupa kata sandi, kotak mode demo
- Tanpa tombol Google/Apple/Twitter (akun luar kampus bertentangan dengan aturan khusus ac.id)

### 5. Katalog `jelajah.html`
- Bar maroon "Katalog / <judul>", chip kategori, grid kartu (foto, nama, harga, area)
- Filter: area kost (urut jarak ke gerbang), harga min–maks + tombol cepat, kondisi, tampilkan yang sudah laku. Desktop: sidebar; HP: bottom sheet "Tampilkan N barang"
- Token filter aktif bisa dihapus satu per satu; urutkan terbaru/termurah/termahal/terdekat
- Saat mengetik: "Sedang mencari…"; kosong: "Yah, barangnya belum ada nih" (ikon, tanpa maskot)
- Semua filter di URL: `q`, `area`, `min`, `max`, `cat`, `cond`, `all=1`, `sort`

### 6. Detail Barang `produk.html`
- Foto + thumbnail, judul, harga maroon, tag Kondisi/Kategori/Dijual, lokasi COD + menit jalan kaki, bagikan, wishlist
- Deskripsi, info paket hemat bila barang ada di paket
- Baris penjual: nama (fakultas angkatan), Trust Score, Chat; tombol ikon chat + **Beli**. HP: tombol menempel di bawah
- Status: barang sendiri, sudah kamu pesan (→ Lacak), dipesan orang lain, terjual
- Profil Toko (Trust Score, rating, terjual), Ulasan Penjual, Barang serupa

### 7. Chat `chat.html`
- Desktop: daftar percakapan + ruang chat. HP: daftar, ruang chat menutupi layar
- Kartu "Kamu bertanya mengenai produk ini" + Ajukan COD / Lacak pesanan
- Pesan pertama otomatis membawa kartu barang; balasan cepat; penjual "mengetik…" lalu membalas

### 8. Atur COD `checkout.html`
- Ringkasan barang/paket + penjual terverifikasi
- **Peta ilustrasi** kampus UB (bukan Google Maps) dengan pin: Gerbang Utama, Gerbang Watugong, Masjid Raden Patah, Perpustakaan Pusat, Matos, MX Mall; rekomendasi titik untuk kedua pihak
- Tanggal (6 hari ke depan), jam, catatan; tips aman COD
- Rincian Pembayaran: harga, hemat paket, biaya layanan gratis, total, tunai saat COD → "Buat Pesanan" (pesan otomatis ke chat penjual)

### 9. Lacak Pesanan `lacak.html`
- Ringkasan Produk, banner status, stepper 5 langkah dengan waktu, Jadwal Pesanan, Barang dari / Bertemu di, peta mini, Rincian Pembayaran
- Pembeli: Chat, Batalkan, Konfirmasi Barang Diterima, rating setelah selesai. Penjual: Terima/Tolak, Setujui Jadwal, Tandai Bertemu, Konfirmasi Selesai COD
- Kotak mode demo memainkan langkah pihak lain

### 10. Pesanan Saya `pesanan.html`
- Tab Pembelian / Penjualan, cari, filter status
- Penjualan (Kelola Pesanan): pita warna per status, pembeli + Trust Score, baris barang, panel pembayaran, hitung mundur "Terima sebelum", Tolak / Terima / Konfirmasi Selesai COD

### 11. Jual Barang `jual.html`
- Foto (maks 3, diperkecil di browser), nama, deskripsi, kategori, kondisi, harga (saran dari rata-rata kategori), area kost
- Pratinjau kartu langsung + daftar periksa; "Isi contoh untuk demo"; terbit → halaman barangnya

### 12. Profil `profil.html`
- Akun sendiri (Dashboard profil): menu Profil Saya, Pesanan Saya, Barang Saya, Wishlist, Keamanan Akun, Pusat Bantuan (FAQ), Keluar; Edit Profil (nama, fakultas, area kost); tombol "Buka Chat"
- `?id=u2`: profil toko publik — Trust Score, rating, terjual, tab Barang / Ulasan

### 13. 404 `404.html`
- Pesan + tombol ke Beranda dan Katalog (aset memakai base `/babakos/` agar jalan di GitHub Pages)

## Data mock (lihat `js/data.js`)
- Kampus: Universitas Brawijaya, Malang
- Area kost: Ketawanggede, Sumbersari, Jl. Kerto, Watugong, Dinoyo, Jl. Gajayana, Soekarno-Hatta, Kalpataru, Tlogomas
- Pengguna demo `u1` Rizky Pratama (FILKOM, Ketawanggede) punya pembelian (BBK-2611-001, -002) dan penjualan (BBK-2611-003 baru, -004 siap COD, -005 selesai)
- Email: mockup menerima email apa pun yang berakhiran `ac.id`, kode 6 digit apa pun, kata sandi 8+ karakter
