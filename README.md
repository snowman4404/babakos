<img src="assets/icon.svg" width="64" height="64" alt="">

# BaBaKos — Barang Bekas Kost

Marketplace barang bekas kost **khusus mahasiswa Universitas Brawijaya**. Proyek ini adalah **mockup frontend** (tanpa backend) yang dibuat hanya dengan **HTML, CSS, dan JavaScript**.

**Demo:** https://snowman4404.github.io/babakos/

## Masalah yang diselesaikan
1. **Keamanan:** hanya mahasiswa dengan email kampus `ac.id` yang bisa bertransaksi.
2. **Pencarian:** cari dan filter barang berdasarkan **lokasi kost** dan **harga**.
3. **COD:** chat dengan produk terlampir otomatis, peta titik temu COD, dan lacak pesanan sampai transaksi selesai.

## Fitur
- Verifikasi email `ac.id` (mock OTP: kode 6 digit apa pun)
- Search dan filter berdasarkan area kost, rentang harga, kategori, dan kondisi
- Chat dengan kartu produk otomatis terlampir
- Peta mockup titik COD di sekitar kampus UB
- Lacak pesanan: Menunggu → Dikonfirmasi → Jadwal COD → Bertemu → Selesai

Daftar halaman lengkap ada di [docs/PAGES.md](docs/PAGES.md).

## Struktur folder
```
index.html, jelajah.html, ...   satu file HTML per halaman
css/style.css                   gaya global + design token
js/data.js                      data mock (produk, pengguna, area kost, titik COD)
js/utils.js                     helper: format Rupiah, auth mock, localStorage
js/layout.js                    navbar & footer bersama
js/pages/                       logika per halaman
assets/                         logo, foto barang (products/) & foto suasana (photos/)
mockups/                        eksplorasi desain beranda (referensi)
```

## Menjalankan secara lokal
Cukup buka `index.html` di browser, tanpa instalasi apa pun.
