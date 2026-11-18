# BaBaKos — Daftar Halaman (untuk Wireframe Figma)

13 halaman, dikelompokkan per alur. Prioritas **P1** = wajib untuk presentasi (mencakup 5 fitur utama), **P2** = pelengkap.

| # | Halaman | File | Prioritas | Fitur utama yang ditunjukkan |
|---|---------|-------|-----------|------------------------------|
| 1 | Beranda (Landing) | `index.html` | P1 | Pengenalan & alasan aman |
| 2 | Daftar | `daftar.html` | P1 | Verifikasi email ac.id |
| 3 | Verifikasi Email (OTP) | `verifikasi.html` | P1 | Verifikasi email ac.id |
| 4 | Masuk | `masuk.html` | P2 | Verifikasi email ac.id |
| 5 | Jelajah Barang | `jelajah.html` | P1 | Search & filter lokasi + harga |
| 6 | Detail Barang | `produk.html?id=p1` | P1 | Pintu masuk ke chat & COD |
| 7 | Chat | `chat.html?thread=c1` | P1 | Chat dengan produk otomatis terlampir |
| 8 | Atur COD (Checkout) | `checkout.html?product=p1` | P1 | Peta mockup titik COD |
| 9 | Lacak Pesanan | `lacak.html?id=BBK-2611-001` | P1 | Order tracking sampai selesai |
| 10 | Pesanan Saya | `pesanan.html` | P2 | Daftar transaksi |
| 11 | Jual Barang | `jual.html` | P2 | Membuat listing |
| 12 | Profil / Profil Penjual | `profil.html`, `profil.html?id=u2` | P2 | Badge terverifikasi, rating |
| 13 | 404 | `404.html` | P2 | — |

## Alur demo (urutan presentasi)

Beranda → Daftar (email `@student.ub.ac.id`) → Verifikasi OTP → Jelajah (filter area Ketawanggede, harga < Rp100.000) → Detail Barang → Chat Penjual (kartu produk terlampir otomatis) → Atur COD (pilih titik di peta) → Lacak Pesanan (Menunggu → Dikonfirmasi → Jadwal COD → Bertemu → Selesai).

## Isi tiap halaman

### 1. Beranda `index.html`
- Navbar: logo, Jelajah, Masuk/Daftar
- Hero: "Jual-beli barang bekas kost, khusus mahasiswa UB" + search bar + CTA
- 3 keunggulan: akun terverifikasi ac.id · COD di titik aman kampus · lacak pesanan
- Cara kerja: Daftar → Chat → COD
- Kategori populer, barang terbaru (4–8 kartu)
- Footer

### 2. Daftar `daftar.html`
- Nama, email kampus, fakultas, area kost
- Validasi: email harus berakhiran `ac.id` (pesan error jika bukan)
- Checkbox syarat & ketentuan, tombol "Kirim Kode Verifikasi"

### 3. Verifikasi Email `verifikasi.html`
- "Kode dikirim ke r***@student.ub.ac.id"
- 6 kotak input OTP, timer kirim ulang
- State sukses: badge **Mahasiswa Terverifikasi**

### 4. Masuk `masuk.html`
- Email kampus → kode OTP (tanpa password, cukup untuk mockup)

### 5. Jelajah Barang `jelajah.html`
- Search bar
- Sidebar filter (di HP: bottom sheet): **area kost**, **rentang harga min–max**, kategori, kondisi
- Urutkan: terbaru / termurah / termahal / terdekat dari kampus
- Grid kartu produk: foto, judul, harga, area, kondisi, badge penjual terverifikasi
- State kosong ("Barang tidak ditemukan")

### 6. Detail Barang `produk.html`
- Galeri foto, judul, harga, kondisi, kategori, area kost + jarak ke UB
- Deskripsi
- Kartu penjual: nama, fakultas, badge terverifikasi, rating, jumlah terjual
- Tombol **Chat Penjual** dan **Beli via COD**
- Barang serupa

### 7. Chat `chat.html`
- Desktop: daftar percakapan kiri + ruang chat kanan. HP: satu kolom.
- **Kartu produk terlampir otomatis** di atas percakapan/pesan pertama (foto, judul, harga, tombol "Ajukan COD")
- Bubble pesan, input teks, quick reply ("Masih ada?", "Bisa nego?")

### 8. Atur COD `checkout.html`
- Ringkasan barang & harga
- **Peta mockup** kampus UB (ilustrasi, bukan Google Maps) dengan pin titik COD:
  Gerbang Utama (Veteran), Gerbang Watugong, Masjid Raden Patah, Perpustakaan Pusat, Matos, MX Mall
- Pilih titik temu, tanggal, jam
- Tips keamanan COD (bertemu di tempat ramai, cek barang dulu, bayar setelah cek)
- Tombol "Buat Pesanan"

### 9. Lacak Pesanan `lacak.html`
- No. pesanan, ringkasan barang
- **Stepper status**: Menunggu Konfirmasi → Dikonfirmasi → Jadwal COD → Bertemu → Selesai
- Peta mini titik COD + jadwal
- Tombol: Chat, Konfirmasi Barang Diterima, Batalkan
- Setelah selesai: beri rating penjual

### 10. Pesanan Saya `pesanan.html`
- Tab Pembelian / Penjualan, filter status, kartu pesanan

### 11. Jual Barang `jual.html`
- Upload foto (preview), judul, deskripsi, kategori, kondisi, harga, area kost, preview sebelum terbit

### 12. Profil `profil.html`
- Avatar, nama, fakultas, badge ac.id, rating, jumlah terjual, daftar barang, tombol keluar (profil sendiri)

### 13. 404 `404.html`
- Pesan + tombol kembali ke Beranda

## Data mock (lihat `js/data.js`)
- Kampus: Universitas Brawijaya, Malang
- Area kost: Ketawanggede, Sumbersari, Jl. Kerto, Watugong, Dinoyo, Jl. Gajayana, Soekarno-Hatta, Kalpataru, Tlogomas
- Email demo: `@student.ub.ac.id`; mockup menerima email apa pun yang berakhiran `ac.id` dan kode OTP 6 digit apa pun
