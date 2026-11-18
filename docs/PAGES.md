# BaBaKos — Daftar Halaman

13 halaman + 1 status 404. Tampilan mengikuti Figma "IMK" halaman `hifi` (lihat `docs/DESIGN.md`).
**P1** = wajib untuk presentasi (5 fitur utama), **P2** = pelengkap. Semua sudah dibangun ✅.

| # | Halaman | File | Frame Figma | Prioritas | Fitur utama |
|---|---------|------|-------------|-----------|-------------|
| 1 | Beranda | `index.html` | BERANDA | P1 | Banner, kategori, barang dekat kost |
| 2 | Daftar | `daftar.html` | Signup | P1 | Verifikasi email ac.id |
| 3 | Verifikasi Email | `verifikasi.html` | Forgot Password (Verification Email) | P1 | Kode 6 digit, badge terverifikasi |
| 4 | Masuk | `masuk.html` | Login | P2 | Email ac.id + kata sandi, lupa kata sandi |
| 5 | Katalog | `jelajah.html` | KATALOG + Android 89/90/91 | P1 | Search & filter area kost + harga |
| 6 | Detail Barang | `produk.html?id=p1` | DETAIL PRODUK | P1 | Pintu masuk ke chat & COD |
| 7 | Chat | `chat.html?thread=c1` / `?product=p1` | Android 90 (chat widget) | P1 | Kartu barang otomatis terlampir |
| 8 | Atur COD | `checkout.html?product=p1` / `?items=p1,p3,p14` | — | P1 | Titik temu bebas (teks) + jadwal COD |
| 9 | Lacak Pesanan | `lacak.html?id=BBK-2611-001` | Web Landscape - Pesanan Saya | P1 | Status sampai selesai + rating |
| 10 | Pesanan Saya | `pesanan.html` / `?tab=penjualan` | Kelola Pesanan - Penjualan | P2 | Pembelian & penjualan |
| 11 | Jual Barang | `jual.html` | — | P2 | Membuat listing |
| 12 | Profil | `profil.html`, `profil.html?id=u2` | Dashboard profil | P2 | Akun, wishlist, profil toko |
| 13 | 404 | `404.html` | — | P2 | — |

## Alur demo (urutan presentasi)

1. Beranda → **Daftar** (email kampus, mis. `@student.ub.ac.id`; coba dulu `@gmail.com` untuk melihat pesan error) → **Verifikasi** (6 angka apa saja) → badge *Mahasiswa Terverifikasi*.
2. **Katalog**: `jelajah.html?area=ketawanggede&max=100000` (area Ketawanggede, harga ≤ Rp100.000), atau ketik di kotak cari navbar.
3. **Detail Barang** (mis. Kipas Angin p1) → **Chat** → kartu barang terlampir di pesan pertama, penjual membalas otomatis.
4. **Beli** → **Atur COD**: ketik titik temu (atau ketuk saran/pin peta), pilih tanggal (paling lambat 7 hari dari hari ini) + jam (bebas) → *Buat Pesanan*.
5. **Lacak Pesanan**: tombol "Mode demo" memainkan langkah penjual (Dikonfirmasi → Jadwal COD disetujui/ditolak → Bertemu) → *Konfirmasi Barang Diterima* → beri rating. Sebelum disetujui, pembeli bisa mengubah titik temu/jadwal (ikon pensil), penjual menyetujui atau menolak. Setelah Jadwal COD disetujui, jadwal, lokasi, dan pesanan terkunci: tidak bisa diubah, ditolak, atau dibatalkan oleh siapa pun. Pesanan multi-barang: BBK-2611-006 (Jas Lab + Laci Plastik dari Ayu). Setelah penjual menolak jadwal, tampilan penjual menunjukkan satu catatan "Menunggu pembeli mengubah jadwal atau lokasi COD".
6. (Opsional) **Pesanan Saya → Penjualan**: daftar pesanan masuk (semua tindakan penjual ada di halaman Lacak), **Jual Barang** ("Isi contoh untuk demo").
7. Footer → **Reset data demo** untuk mengulang dari awal (akun tetap masuk).

Akun demo di Masuk: tombol "Isi akun demo" (`rizkypratama@student.ub.ac.id`, kata sandi 8+ karakter apa saja).

## Isi tiap halaman

### Navbar dan tab bar (semua halaman, `js/layout.js`)
- Desktop: wordmark "BaBaKos", Beranda, Katalog, kotak cari (fokus saat kosong → pencarian terakhir), lokasi area kost, ikon chat (jumlah belum dibaca), tombol Jual, menu akun (Akun Saya, Pesanan Saya, Wishlist, Keluar; Jual cukup lewat tombol Jual). Pesanan Saya hanya dijangkau dari menu akun ini (dan tab Pesanan di HP), tidak ada di halaman Akun Saya. Belum masuk: Masuk + Daftar.
- HP: wordmark + lokasi, kotak cari penuh, tab bar bawah (Beranda, Katalog, Chat, Pesanan, Akun). Menu akun desktop disembunyikan di bawah 900px, jadi tab Pesanan tetap ada sebagai satu-satunya jalan ke Pesanan Saya di HP.
- Halaman alur (Detail Barang, Atur COD, Lacak, Jual) memakai bar tipis: tombol kembali + judul.

### 1. Beranda `index.html`
- Banner geser 3 slide (otomatis 6 detik, berhenti saat disentuh/hover)
- Ikon kategori (lingkaran maroon) → `jelajah.html?cat=…`
- "Dekat kostmu di …" (sudah masuk), "Baru diunggah"

### 2. Daftar `daftar.html`
- Nama depan/belakang, email kampus (harus `ac.id`), kata sandi (meter kekuatan), kampus (pilihan kampus se-Malang), fakultas/jurusan, area kost, persetujuan
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
- Filter: area kost (urut jarak dari kawasan kampus), harga min–maks + tombol cepat, kondisi, tampilkan yang sudah laku. Desktop: sidebar; HP: bottom sheet "Tampilkan N barang"
- Token filter aktif bisa dihapus satu per satu; urutkan terbaru/termurah/termahal/terdekat
- Saat mengetik: "Sedang mencari…"; kosong: "Yah, barangnya belum ada nih" (ikon, tanpa maskot)
- Semua filter di URL: `q`, `area`, `min`, `max`, `cat`, `cond`, `all=1`, `sort`

### 6. Detail Barang `produk.html`
- Foto + thumbnail, judul, harga maroon, tag Kondisi/Kategori/Dijual, lokasi COD + menit jalan kaki, bagikan, wishlist
- Deskripsi
- Baris penjual: nama (fakultas angkatan), Trust Score, Chat; tombol ikon chat + **Beli**. HP: tombol menempel di bawah
- Status: barang sendiri, sudah kamu pesan (→ Lacak), dipesan orang lain, terjual
- Profil Toko (Trust Score, rating, terjual), Ulasan Penjual, Barang serupa

### 7. Chat `chat.html`
- Desktop: daftar percakapan + ruang chat. HP: daftar, ruang chat menutupi layar
- Kartu "Kamu bertanya mengenai produk ini" + Ajukan COD / Lacak pesanan
- Pesan pertama otomatis membawa kartu barang; balasan cepat; penjual "mengetik…" lalu membalas

### 8. Atur COD `checkout.html`
- `?product=p1` (satu barang) atau `?items=p1,p3,p14` (beberapa barang dari SATU penjual, bukan milik sendiri, semua tersedia; selain itu tampil status "tidak bisa dipesan"). Dari `?items`, keranjang penjual dikosongkan setelah pesanan dibuat; tombol kembali ke `profil.html?id=<penjual>`
- Ringkasan: setiap barang (foto, judul, harga) + penjual satu kali
- **Titik Temu COD**: kolom teks wajib (contoh "Lobi perpustakaan kampus, depan masjid kampus"; divalidasi `BBK.meetingPlaceError`, dipakai juga di Lacak). Chip saran dan peta ilustrasi (opsional, dalam "Lihat di peta ilustrasi"; titik di UB, UM, UIN, UMM, Polinema, Matos, MX Mall) hanya mengisi kolom; kolom adalah sumber kebenaran. Pesanan menyimpan `meetingPlace` (teks)
- **Jadwal COD**: input tanggal (`type="date"`, min hari ini, max 7 hari dari hari pesanan dibuat) + input jam (`type="time"`, tanpa batas), keduanya wajib; hanya tanggal yang dibatasi (`BBK.codDateError`, `BBK.codDateWindow`, `BBK.codDateHint`); catatan opsional; tips aman COD (tidak sesuai saat COD: jangan bayar, hubungi penjual lewat chat)
- Rincian Pembayaran: harga (jumlah harga barang), biaya layanan gratis, total, tunai saat COD → "Buat Pesanan" (pesan otomatis ke chat penjual yang menyebut semua barang, mis. "aku pesan 2 barang: Jas Lab Putih, Laci Plastik 3 Susun"; kartu barang pertama terlampir)

### 9. Lacak Pesanan `lacak.html`
- Ringkasan Produk (semua barang pesanan), banner status, pemberitahuan persetujuan jadwal, stepper 5 langkah dengan waktu, kartu **Jadwal Pesanan**, kartu **Lokasi Pesanan** (hanya "Bertemu di" + pembeli), Rincian Pembayaran (tiap barang + total). Tanpa peta.
- Pembeli: Chat, Batalkan (hanya menunggu-konfirmasi / dikonfirmasi), Konfirmasi Barang Diterima, rating setelah selesai; ikon pensil di samping "Jadwal COD" dan "Bertemu di" (hanya menunggu-konfirmasi / dikonfirmasi) membuka form mini (tanggal + jam, atau teks; Simpan/Batal). Tanggal harus dari hari ini sampai 7 hari setelah tanggal pesanan (`createdAt`), jam bebas. Menyimpan perubahan mengatur `schedule: 'menunggu'`. `BBK.changeSchedule` menolak (return false) bila status sudah jadwal-cod/bertemu/selesai (`BBK.AGREED_STATUSES`)
- Stepper memakai entri terbaru tiap langkah (`BBK.stepEntry`) dan langkah setelah status sekarang tidak menampilkan waktu/catatan lama (`BBK.stepProgress`)
- Penjual: Terima/Tolak Pesanan, Setujui Jadwal COD, Tolak Jadwal COD (hanya saat dikonfirmasi sebelum disetujui; alasan opsional; pesanan tidak dibatalkan; `BBK.rejectSchedule` menolak bila sudah disetujui), Tandai Bertemu, Konfirmasi Selesai COD. Hanya penjual yang menyetujui jadwal, hanya pembeli yang mengubah titik/jam
- Persetujuan jadwal di pesanan: `schedule` = `menunggu` | `disetujui` | `ditolak`; banner untuk kedua pihak saat ditolak / menunggu; saat jadwal-cod dan bertemu catatan hijau "Jadwal dan lokasi COD sudah disepakati dan tidak bisa diubah. Pesanan tidak bisa dibatalkan."
- Kotak mode demo memainkan langkah pihak lain (penjual menyetujui/menolak jadwal hanya sebelum disetujui, pembeli mengubah jadwal setelah ditolak; setelah disetujui hanya langkah maju)

### 10. Pesanan Saya `pesanan.html`
- Tab Pembelian / Penjualan, cari, filter status
- Kartu pesanan yang sama untuk Pembelian dan Penjualan (id + status, foto, judul, "Dari/Untuk <nama>", titik + waktu COD, total, "Lihat detail →"; "+N" bila multi-barang) → `lacak.html?id=…`. Penjualan tanpa tombol aksi: penjual mengonfirmasi semuanya di halaman Lacak

### 11. Jual Barang `jual.html`
- Foto (maks 3, diperkecil di browser), nama, deskripsi, kategori, kondisi, harga (saran dari rata-rata kategori). Area barang otomatis diambil dari area kost di profil (tanpa input)
- Pratinjau kartu langsung + daftar periksa; "Isi contoh untuk demo"; terbit → halaman barangnya

### 12. Profil `profil.html`
- Akun sendiri (Dashboard profil): menu Akun Saya, Barang Saya, Wishlist, Keamanan Akun, Pusat Bantuan (FAQ), Keluar; Edit Profil (nama, kampus, fakultas, area kost); kampus tampil di samping fakultas (akun sendiri dan profil toko); tombol "Buka Chat"
- `?id=u2`: profil toko publik — Trust Score, rating, terjual, tab Barang / Ulasan
- Keranjang per penjual (hanya di profil toko orang lain, tidak ada di akun sendiri): semua barang diserahkan dalam satu kali COD, jadi pembeli hanya bisa menggabungkan barang dari satu penjual. Tombol "+" bulat di pojok kanan atas foto kartu barang yang tersedia (berubah jadi centang, tekan lagi untuk menghapus; belum masuk → diarahkan ke `masuk.html?next=…`). Tombol keranjang melayang di kanan bawah (di atas tab bar ponsel) selalu tampil di profil toko orang lain (kosong: tanpa lencana, panel menampilkan keadaan kosong; belum masuk: diarahkan ke `masuk.html?next=…`), lencana jumlah muncul setelah ada barang. Panel "Keranjang dari <nama depan>": bottom sheet di ponsel, panel samping di desktop; baris foto, nama, harga, tombol hapus; total dan "Checkout (N barang)" → `checkout.html?items=p1,p3`. Esc / tombol tutup / klik latar menutup; kosong → keadaan kosong ikon polos. Data di `BBK.cart` (localStorage), dikosongkan checkout setelah pesanan dibuat

### 13. 404 `404.html`
- Pesan + tombol ke Beranda dan Katalog (aset memakai base `/babakos/` agar jalan di GitHub Pages)

## Data mock (lihat `js/data.js`)
- Kampus: beberapa kampus di Malang (UB, UM, UIN Malang, UMM, Polinema, ITN, Unisma, Unmer), dengan `BBK.universities` untuk pilihan di Daftar
- Titik temu (`BBK.meetingPoints`): Gerbang Utama, Gerbang Watugong, Masjid Raden Patah, Perpustakaan Pusat (UB), Gerbang UIN, Gerbang UM, Gerbang Polinema, Gerbang UMM, Masjid AR Fachruddin (UMM), Matos, MX Mall
- Setiap penjual u2–u5 punya minimal dua barang tersedia, supaya keranjang bisa dicoba di profil mereka
- Area kost: Ketawanggede, Sumbersari, Jl. Kerto, Watugong, Dinoyo, Jl. Gajayana, Soekarno-Hatta, Kalpataru, Tlogomas
- Pengguna demo `u1` Rizky Pratama (UB, FILKOM, Ketawanggede) punya pembelian (BBK-2611-001, -002, dan -006 multi-barang dari Ayu: p8 + p15, status dikonfirmasi, jadwal menunggu persetujuan) dan penjualan (BBK-2611-003 baru, -004 siap COD, -005 selesai)
- Email: mockup menerima email apa pun yang berakhiran `ac.id`, kode 6 digit apa pun, kata sandi 8+ karakter
