/*
 * BaBaKos mock data. There is no backend: everything the site shows starts here.
 * Loaded as a classic <script> (not a module) so pages also work when opened
 * straight from disk (file://). Exposes one global: window.BBK.
 * Changes made during a demo (new orders, chats, listings) are kept in BBK.store
 * and merged over this seed by js/utils.js.
 */
window.BBK = window.BBK || {};

BBK.CURRENT_USER_ID = 'u1'; // the mock "logged-in" student

// icon = a key of BBK.icon() in js/layout.js
BBK.categories = [
  { id: 'buku', label: 'Buku & Alat Kuliah', short: 'Buku Kuliah', icon: 'book-open' },
  { id: 'perabot', label: 'Perabot Kost', short: 'Barang Kost', icon: 'bed' },
  { id: 'pakaian', label: 'Pakaian', short: 'Fashion Kampus', icon: 'shirt' },
  { id: 'dapur', label: 'Alat Dapur', short: 'Alat Dapur', icon: 'cooking-pot' },
  { id: 'elektronik', label: 'Elektronik', short: 'Alat Elektronik', icon: 'plug' },
  { id: 'kendaraan', label: 'Sepeda & Aksesoris', short: 'Sepeda', icon: 'bike' },
  { id: 'lainnya', label: 'Lainnya', short: 'Lainnya', icon: 'grid' },
];

BBK.conditionLabels = {
  'seperti-baru': 'Seperti Baru',
  baik: 'Baik',
  'layak-pakai': 'Layak Pakai',
};

// Kost neighbourhoods around the campuses in Malang (mostly near UB Veteran). distanceKm = to UB main gate (mock).
// x/y = mock position in km from the main gate (east/south positive), for area-to-area distances.
BBK.kostAreas = [
  { id: 'ketawanggede', name: 'Ketawanggede', distanceKm: 0.5, x: -0.2, y: -0.45 },
  { id: 'sumbersari', name: 'Sumbersari', distanceKm: 0.8, x: 0.3, y: 0.75 },
  { id: 'kerto', name: 'Jl. Kerto (Kertopamuji, Kertosentono)', distanceKm: 0.7, x: 0.6, y: -0.35 },
  { id: 'watugong', name: 'Watugong', distanceKm: 0.6, x: 0.2, y: -0.57 },
  { id: 'dinoyo', name: 'Dinoyo', distanceKm: 1.5, x: -1.3, y: -0.75 },
  { id: 'gajayana', name: 'Jl. Gajayana', distanceKm: 1.2, x: -1.0, y: -0.65 },
  { id: 'soehat', name: 'Soekarno-Hatta (Soehat)', distanceKm: 1.8, x: 1.2, y: -1.35 },
  { id: 'kalpataru', name: 'Kalpataru', distanceKm: 2.0, x: 0.9, y: -1.8 },
  { id: 'tlogomas', name: 'Tlogomas', distanceKm: 3.0, x: -2.6, y: -1.5 },
];

// Safe public COD meeting points. x/y = % position on the illustrated mock map (no maps API).
BBK.meetingPoints = [
  { id: 'gerbang-veteran', name: 'Gerbang Utama UB (Jl. Veteran)', shortName: 'Gerbang Utama', description: 'Depan pos satpam gerbang utama, ramai dan terang. Dekat kampus UB.', areaId: 'sumbersari', x: 50, y: 82 },
  { id: 'gerbang-watugong', name: 'Gerbang Watugong UB', shortName: 'Gerbang Watugong', description: 'Dekat pos satpam, cocok untuk penghuni Watugong & Kerto.', areaId: 'watugong', x: 76, y: 30 },
  { id: 'masjid-raden-patah', name: 'Masjid Raden Patah UB', shortName: 'Masjid Raden Patah', description: 'Area parkir depan masjid kampus.', areaId: 'ketawanggede', x: 34, y: 46 },
  { id: 'perpustakaan-ub', name: 'Perpustakaan Pusat UB', shortName: 'Perpustakaan Pusat', description: 'Lobi perpustakaan, buka jam kuliah.', areaId: 'ketawanggede', x: 56, y: 52 },
  { id: 'gerbang-uin', name: 'Gerbang UIN Malang (Jl. Gajayana)', shortName: 'Gerbang UIN', description: 'Depan gerbang kampus UIN, ramai saat jam kuliah.', areaId: 'gajayana', x: 14, y: 40 },
  { id: 'matos', name: 'Malang Town Square (Matos)', shortName: 'Matos', description: 'Lobi utama mal, di seberang kampus.', areaId: 'sumbersari', x: 22, y: 88 },
  { id: 'mx-mall', name: 'MX Mall', shortName: 'MX Mall', description: 'Pintu masuk depan, dekat Jl. Veteran.', areaId: 'sumbersari', x: 78, y: 90 },
  { id: 'gerbang-um', name: 'Gerbang UM (Jl. Semarang)', shortName: 'Gerbang UM', description: 'Depan pos satpam gerbang Universitas Negeri Malang, ramai saat jam kuliah.', areaId: 'sumbersari', x: 36, y: 66 },
  { id: 'gerbang-polinema', name: 'Gerbang Polinema (Jl. Soekarno-Hatta)', shortName: 'Gerbang Polinema', description: 'Dekat pos satpam Politeknik Negeri Malang, cocok untuk penghuni Soehat.', areaId: 'soehat', x: 88, y: 58 },
  { id: 'gerbang-umm', name: 'Gerbang UMM (Jl. Raya Tlogomas)', shortName: 'Gerbang UMM', description: 'Depan gerbang kampus 3 Universitas Muhammadiyah Malang, terang dan ramai.', areaId: 'tlogomas', x: 14, y: 62 },
  { id: 'masjid-umm', name: 'Masjid AR Fachruddin UMM', shortName: 'Masjid AR Fachruddin', description: 'Teras depan masjid kampus UMM, ramai sepanjang hari.', areaId: 'tlogomas', x: 16, y: 20 },
];

// Homepage banner slides (scene photos, credited in BBK.photoCredits).
BBK.banners = [
  { image: 'assets/photos/ub-gerbang.jpg', title: 'Barang kost, pindah tangan', text: 'Jual beli barang bekas antar mahasiswa se-Malang. COD di titik aman kampus.', cta: 'Lihat katalog', href: 'jelajah.html' },
  { image: 'assets/photos/ub-aerial.jpg', title: 'Cari dari kost terdekat', text: 'Saring per area kost dan harga, lalu jalan kaki ke titik COD.', cta: 'Cari di Ketawanggede', href: 'jelajah.html?area=ketawanggede' },
  { image: 'assets/photos/malang-ijen.jpg', title: 'Pindah kost? Jual barangmu', text: 'Foto, beri harga, dan tayang untuk sesama mahasiswa kampus di Malang.', cta: 'Jual barang', href: 'jual.html' },
];

// Campuses in Malang for the signup form: [short, full name].
BBK.universities = [
  ['UB', 'Universitas Brawijaya'], ['UM', 'Universitas Negeri Malang'], ['UIN Malang', 'UIN Maulana Malik Ibrahim Malang'],
  ['UMM', 'Universitas Muhammadiyah Malang'], ['Polinema', 'Politeknik Negeri Malang'], ['ITN', 'Institut Teknologi Nasional Malang'],
  ['Unisma', 'Universitas Islam Malang'], ['Unmer', 'Universitas Merdeka Malang'], ['Lainnya', 'Kampus lain di Malang'],
];

// Faculties (or jurusan) for the signup form: [short, full name]. Generic, shared by all campuses.
BBK.faculties = [
  ['FILKOM', 'Fakultas Ilmu Komputer'], ['FEB', 'Fakultas Ekonomi dan Bisnis'], ['FE', 'Fakultas Ekonomi'],
  ['FT', 'Fakultas Teknik'], ['FMIPA', 'Fakultas MIPA'], ['FST', 'Fakultas Sains dan Teknologi'],
  ['FP', 'Fakultas Pertanian'], ['FH', 'Fakultas Hukum'], ['FISIP', 'Fakultas Ilmu Sosial dan Ilmu Politik'],
  ['FIB', 'Fakultas Ilmu Budaya'], ['FK', 'Fakultas Kedokteran'], ['FAI', 'Fakultas Agama Islam'],
  ['FKIP', 'Fakultas Keguruan dan Ilmu Pendidikan'], ['FIA', 'Fakultas Ilmu Administrasi'], ['FV', 'Fakultas Vokasi'],
  ['JTE', 'Jurusan Teknik Elektro'], ['JTI', 'Jurusan Teknologi Informasi'], ['LAINNYA', 'Fakultas atau jurusan lain'],
];

// Quick max-price steps (Rp) for the Katalog filter.
BBK.priceCeilings = [100000, 200000, 500000, 1000000];

// COD is possible between these hours at every meeting point.
BBK.codHours = { open: '07.00', close: '21.00' };

// trustScore (0–100) = verified email + finished deals + ratings + reply speed (mock).
BBK.users = [
  { id: 'u1', name: 'Rizky Pratama', email: 'rizkypratama@student.ub.ac.id', university: 'Universitas Brawijaya', universityShort: 'UB', faculty: 'Fakultas Ilmu Komputer', facultyShort: 'FILKOM', cohort: 2023, areaId: 'ketawanggede', verified: true, rating: 4.8, totalSold: 3, trustScore: 92, joinedAt: '2026-08-20' },
  { id: 'u2', name: 'Nadia Putri', email: 'nadiaputri@students.um.ac.id', university: 'Universitas Negeri Malang', universityShort: 'UM', faculty: 'Fakultas Ekonomi', facultyShort: 'FE', cohort: 2022, areaId: 'kerto', verified: true, rating: 4.9, totalSold: 12, trustScore: 95, joinedAt: '2025-09-01' },
  { id: 'u3', name: 'Bagus Setiawan', email: 'bagussetiawan@student.uin-malang.ac.id', university: 'UIN Maulana Malik Ibrahim Malang', universityShort: 'UIN Malang', faculty: 'Fakultas Sains dan Teknologi', facultyShort: 'FST', cohort: 2021, areaId: 'sumbersari', verified: true, rating: 4.6, totalSold: 7, trustScore: 88, joinedAt: '2025-02-14' },
  { id: 'u4', name: 'Ayu Lestari', email: 'ayulestari@student.ub.ac.id', university: 'Universitas Brawijaya', universityShort: 'UB', faculty: 'Fakultas MIPA', facultyShort: 'FMIPA', cohort: 2023, areaId: 'watugong', verified: true, rating: 5.0, totalSold: 4, trustScore: 97, joinedAt: '2026-01-10' },
  { id: 'u5', name: 'Fajar Nugroho', email: 'fajarnugroho@webmail.umm.ac.id', university: 'Universitas Muhammadiyah Malang', universityShort: 'UMM', faculty: 'Fakultas Pertanian', facultyShort: 'FP', cohort: 2020, areaId: 'dinoyo', verified: true, rating: 4.7, totalSold: 9, trustScore: 90, joinedAt: '2024-10-05' },
];

// images: paths relative to the site root; images[0] is the cover. Sample photos are credited in BBK.photoCredits.
// status: tersedia | dipesan | terjual
BBK.products = [
  { id: 'p11', title: 'Teko Listrik 1.7L', description: 'Mendidih cepat, mati otomatis. Bagian dalam sudah dibersihkan dari kerak.', price: 55000, categoryId: 'dapur', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: ['assets/products/p11-teko.jpg'], postedAt: '2026-11-17T20:10:00+07:00', status: 'dipesan' },
  { id: 'p12', title: 'Tas Carrier 50L', description: 'Dipakai 2x naik Panderman. Resleting dan rain cover lengkap.', price: 180000, categoryId: 'lainnya', condition: 'seperti-baru', areaId: 'dinoyo', sellerId: 'u5', images: ['assets/products/p12-tas.jpg'], postedAt: '2026-11-17T16:00:00+07:00', status: 'tersedia' },
  { id: 'p13', title: 'Gitar Akustik Walden', description: 'Senar baru, ada softcase. Suara masih nyaring.', price: 400000, categoryId: 'lainnya', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: ['assets/products/p13-gitar.jpg'], postedAt: '2026-11-17T09:30:00+07:00', status: 'tersedia' },
  { id: 'p14', title: 'Setrika Uap Russell Hobbs', description: 'Uap masih keluar normal, alas tidak lengket.', price: 50000, categoryId: 'elektronik', condition: 'layak-pakai', areaId: 'kerto', sellerId: 'u2', images: ['assets/products/p14-setrika.jpg'], postedAt: '2026-11-16T21:00:00+07:00', status: 'tersedia' },
  { id: 'p15', title: 'Laci Plastik 3 Susun', description: 'Ukuran meja, 35x27x36 cm. Pas untuk alat tulis dan skincare.', price: 65000, categoryId: 'perabot', condition: 'seperti-baru', areaId: 'gajayana', sellerId: 'u4', images: ['assets/products/p15-laci.jpg'], postedAt: '2026-11-16T14:20:00+07:00', status: 'dipesan' },
  { id: 'p16', title: 'Wajan Teflon 24 cm', description: 'Lapisan masih rata, gagang kokoh. Cocok untuk masak di kost.', price: 40000, categoryId: 'dapur', condition: 'baik', areaId: 'sumbersari', sellerId: 'u3', images: ['assets/products/p16-wajan.jpg'], postedAt: '2026-11-15T18:40:00+07:00', status: 'tersedia' },
  { id: 'p1', title: 'Kipas Angin Miyako 16 inch', description: 'Masih kencang, 3 kecepatan. Dijual karena pindah kost ber-AC.', price: 85000, categoryId: 'elektronik', condition: 'baik', areaId: 'ketawanggede', sellerId: 'u2', images: ['assets/products/p1-kipas.jpg'], postedAt: '2026-11-15T09:00:00+07:00', status: 'tersedia' },
  { id: 'p2', title: 'Rice Cooker Cosmos 1.8L', description: 'Lapisan anti lengket masih bagus, lengkap dengan centong.', price: 120000, categoryId: 'dapur', condition: 'baik', areaId: 'sumbersari', sellerId: 'u3', images: ['assets/products/p2-ricecooker.jpg'], postedAt: '2026-11-14T13:30:00+07:00', status: 'tersedia' },
  { id: 'p3', title: 'Meja Lipat Belajar Lesehan', description: 'Kayu, ada sedikit goresan di pinggir. Muat laptop + buku.', price: 45000, categoryId: 'perabot', condition: 'layak-pakai', areaId: 'kerto', sellerId: 'u2', images: ['assets/products/p3-meja.jpg'], postedAt: '2026-11-13T19:00:00+07:00', status: 'tersedia' },
  { id: 'p4', title: 'Kalkulus Purcell Jilid 1 & 2', description: 'Buku wajib Matematika Dasar. Ada stabilo di beberapa halaman.', price: 60000, categoryId: 'buku', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: ['assets/products/p4-buku.jpg'], postedAt: '2026-11-12T08:15:00+07:00', status: 'tersedia' },
  { id: 'p5', title: 'Kasur Busa Inoac 90x200', description: 'Tebal 15 cm, sudah dicuci sarungnya. Harus diambil sendiri.', price: 250000, categoryId: 'perabot', condition: 'baik', areaId: 'ketawanggede', sellerId: 'u1', images: ['assets/products/p5-kasur.png'], postedAt: '2026-11-11T16:45:00+07:00', status: 'dipesan' },
  { id: 'p6', title: 'Dispenser Galon Sanken', description: 'Hanya air normal & panas. Berfungsi normal.', price: 90000, categoryId: 'elektronik', condition: 'layak-pakai', areaId: 'ketawanggede', sellerId: 'u1', images: ['assets/products/p6-dispenser.jpg'], postedAt: '2026-11-10T10:20:00+07:00', status: 'dipesan' },
  { id: 'p7', title: 'Sepeda Lipat United 20"', description: 'Rem dan gigi aman, ban baru diganti bulan lalu.', price: 850000, categoryId: 'kendaraan', condition: 'seperti-baru', areaId: 'gajayana', sellerId: 'u5', images: ['assets/products/p7-sepeda.jpg'], postedAt: '2026-11-09T07:00:00+07:00', status: 'tersedia' },
  { id: 'p8', title: 'Jas Lab Putih Ukuran L', description: 'Dipakai 1 semester praktikum, sudah dilaundry.', price: 35000, categoryId: 'pakaian', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: ['assets/products/p8-jaslab.jpg'], postedAt: '2026-11-08T12:00:00+07:00', status: 'dipesan' },
  { id: 'p9', title: 'Rak Sepatu Susun 4', description: 'Besi + kain, mudah dibongkar pasang.', price: 30000, categoryId: 'perabot', condition: 'layak-pakai', areaId: 'ketawanggede', sellerId: 'u1', images: ['assets/products/p9-rak.jpg'], postedAt: '2026-11-07T15:00:00+07:00', status: 'terjual' },
  { id: 'p10', title: 'Monitor LG 22" Full HD', description: 'Tidak ada dead pixel, termasuk kabel HDMI.', price: 750000, categoryId: 'elektronik', condition: 'seperti-baru', areaId: 'tlogomas', sellerId: 'u3', images: ['assets/products/p10-monitor.png'], postedAt: '2026-11-06T20:30:00+07:00', status: 'terjual' },
];

// Seed chats. attachedProductId on a message = product card attached automatically.
// unread = messages the current user has not opened yet.
BBK.chatThreads = [
  {
    id: 'c1', productId: 'p1', buyerId: 'u1', sellerId: 'u2', unread: 1,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Halo kak, kipasnya masih ada?', sentAt: '2026-11-16T10:00:00+07:00', attachedProductId: 'p1' },
      { id: 'm2', senderId: 'u2', text: 'Masih ada kak! Bisa COD di Masjid Raden Patah besok siang?', sentAt: '2026-11-16T10:05:00+07:00' },
    ],
  },
  {
    id: 'c3', productId: 'p11', buyerId: 'u1', sellerId: 'u4', unread: 0,
    messages: [
      { id: 'm4', senderId: 'u1', text: 'Kak, tekonya saya pesan ya. COD di Gerbang Watugong bisa?', sentAt: '2026-11-17T20:30:00+07:00', attachedProductId: 'p11' },
      { id: 'm5', senderId: 'u4', text: 'Bisa, Kamis 12.30 ya. Nanti aku pakai jaket kuning.', sentAt: '2026-11-17T20:41:00+07:00' },
      { id: 'm6', senderId: 'u1', text: 'Siap kak, sampai ketemu.', sentAt: '2026-11-17T20:42:00+07:00' },
    ],
  },
  {
    id: 'c4', productId: 'p6', buyerId: 'u5', sellerId: 'u1', unread: 1,
    messages: [
      { id: 'm7', senderId: 'u5', text: 'Mas, dispensernya sudah saya pesan. Bisa COD di Masjid Raden Patah?', sentAt: '2026-11-18T08:12:00+07:00', attachedProductId: 'p6' },
    ],
  },
  {
    id: 'c2', productId: 'p4', buyerId: 'u1', sellerId: 'u4', unread: 0,
    messages: [
      { id: 'm3', senderId: 'u1', text: 'Kak, bukunya bisa kurang dikit?', sentAt: '2026-11-15T19:30:00+07:00', attachedProductId: 'p4' },
    ],
  },
];

// Order status flow: menunggu-konfirmasi → dikonfirmasi → jadwal-cod → bertemu → selesai (or dibatalkan)
BBK.orderSteps = [
  { status: 'menunggu-konfirmasi', label: 'Menunggu Konfirmasi', long: 'Menunggu konfirmasi penjual' },
  { status: 'dikonfirmasi', label: 'Dikonfirmasi', long: 'Dikonfirmasi penjual' },
  { status: 'jadwal-cod', label: 'Jadwal COD', long: 'Jadwal COD disepakati' },
  { status: 'bertemu', label: 'Bertemu', long: 'Bertemu di titik COD' },
  { status: 'selesai', label: 'Selesai', long: 'Transaksi selesai' },
];

// productIds: one item, or several items of ONE seller that the buyer bundled into a single COD.
// price = sum of the item prices. Payment is always cash at the COD.
// meetingPlace: free text typed by the buyer. schedule: the seller's approval of the COD time + place
// ('menunggu' | 'disetujui' | 'ditolak'); only the buyer changes place/time, only the seller approves.
BBK.orders = [
  {
    id: 'BBK-2611-001', productIds: ['p11'], buyerId: 'u1', sellerId: 'u4', price: 55000,
    meetingPlace: 'Gerbang Watugong UB', schedule: 'disetujui', scheduledAt: '2026-11-19T12:30:00+07:00', status: 'jadwal-cod', createdAt: '2026-11-17T20:25:00+07:00',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-17T20:25:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-17T20:40:00+07:00' },
      { status: 'jadwal-cod', at: '2026-11-17T20:41:00+07:00', note: 'Gerbang Watugong UB, Kamis 12.30' },
    ],
  },
  {
    id: 'BBK-2611-002', productIds: ['p10'], buyerId: 'u1', sellerId: 'u3', price: 750000,
    meetingPlace: 'Malang Town Square (Matos)', schedule: 'disetujui', scheduledAt: '2026-11-12T16:00:00+07:00', status: 'selesai', createdAt: '2026-11-10T09:00:00+07:00',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-10T09:00:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-10T09:30:00+07:00' },
      { status: 'jadwal-cod', at: '2026-11-10T09:45:00+07:00' },
      { status: 'bertemu', at: '2026-11-12T16:05:00+07:00' },
      { status: 'selesai', at: '2026-11-12T16:20:00+07:00', note: 'Pembeli konfirmasi barang diterima' },
    ],
  },
  {
    id: 'BBK-2611-003', productIds: ['p6'], buyerId: 'u5', sellerId: 'u1', price: 90000,
    meetingPlace: 'Masjid Raden Patah UB', schedule: 'menunggu', scheduledAt: '2026-11-20T10:00:00+07:00', status: 'menunggu-konfirmasi', createdAt: '2026-11-18T08:10:00+07:00',
    timeline: [{ status: 'menunggu-konfirmasi', at: '2026-11-18T08:10:00+07:00' }],
  },
  {
    id: 'BBK-2611-004', productIds: ['p5'], buyerId: 'u3', sellerId: 'u1', price: 250000,
    meetingPlace: 'Gerbang UIN Malang (Jl. Gajayana)', schedule: 'disetujui', scheduledAt: '2026-11-20T16:00:00+07:00', status: 'jadwal-cod', createdAt: '2026-11-16T13:00:00+07:00',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-16T13:00:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-16T13:20:00+07:00' },
      { status: 'jadwal-cod', at: '2026-11-16T13:22:00+07:00', note: 'Gerbang UIN Malang (Jl. Gajayana), Jumat 16.00' },
    ],
  },
  {
    id: 'BBK-2611-005', productIds: ['p9'], buyerId: 'u4', sellerId: 'u1', price: 30000,
    meetingPlace: 'Perpustakaan Pusat UB', schedule: 'disetujui', scheduledAt: '2026-11-08T13:00:00+07:00', status: 'selesai', createdAt: '2026-11-07T18:00:00+07:00', reviewId: 'r5',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-07T18:00:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-07T18:10:00+07:00' },
      { status: 'jadwal-cod', at: '2026-11-07T18:12:00+07:00' },
      { status: 'bertemu', at: '2026-11-08T13:02:00+07:00' },
      { status: 'selesai', at: '2026-11-08T13:10:00+07:00', note: 'Pembeli konfirmasi barang diterima' },
    ],
  },
  {
    id: 'BBK-2611-006', productIds: ['p8', 'p15'], buyerId: 'u1', sellerId: 'u4', price: 100000,
    meetingPlace: 'Lobi MX Mall, pintu masuk depan', schedule: 'menunggu', scheduledAt: '2026-11-21T14:00:00+07:00', status: 'dikonfirmasi', createdAt: '2026-11-18T07:30:00+07:00',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-18T07:30:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-18T07:50:00+07:00' },
    ],
  },
];

// Reviews of sellers, written by buyers after a finished COD.
BBK.reviews = [
  { id: 'r1', sellerId: 'u2', authorId: 'u3', itemTitle: 'Rak Buku Mini', rating: 5, text: 'Barang sesuai foto, kakaknya datang tepat waktu di gerbang.', at: '2026-10-21T15:00:00+07:00' },
  { id: 'r2', sellerId: 'u2', authorId: 'u5', itemTitle: 'Lampu Belajar', rating: 5, text: 'Ramah, barang dicek bareng dulu sebelum bayar.', at: '2026-09-30T19:00:00+07:00' },
  { id: 'r3', sellerId: 'u4', authorId: 'u1', itemTitle: 'Buku Fisika Dasar', rating: 5, text: 'Bukunya masih rapi, COD di perpus lancar.', at: '2026-10-12T11:00:00+07:00' },
  { id: 'r4', sellerId: 'u3', authorId: 'u2', itemTitle: 'Kipas Meja', rating: 4, text: 'Oke, cuma telat 10 menit.', at: '2026-08-15T16:30:00+07:00' },
  { id: 'r5', sellerId: 'u1', authorId: 'u4', itemTitle: 'Rak Sepatu Susun 4', rating: 5, text: 'Raknya kokoh, Rizky bantu angkat sampai parkiran.', at: '2026-11-08T13:30:00+07:00' },
];

// Help centre questions (Profil → Pusat Bantuan).
BBK.faq = [
  ['Siapa yang bisa memakai BaBaKos?', 'Hanya mahasiswa dengan email kampus berakhiran ac.id. Setiap akun diverifikasi dengan kode yang dikirim ke email itu.'],
  ['Bagaimana cara membayar?', 'Tunai saat COD. Cek barangnya dulu di titik temu, baru bayar. Tidak ada transfer di muka.'],
  ['Di mana titik COD yang aman?', 'Pilih tempat ramai dan terang, misalnya gerbang kampus, masjid atau perpustakaan kampus, Matos, atau MX Mall. Peta di halaman Atur COD memberi saran titik aman di sekitar kampus-kampus Malang.'],
  ['Barang tidak sesuai, bagaimana?', 'Jangan bayar. Batalkan pesanan dari halaman Lacak Pesanan dan ceritakan alasannya.'],
  ['Apa itu Trust Score?', 'Nilai 0–100 dari email terverifikasi, transaksi selesai, rating pembeli, dan kecepatan membalas chat.'],
];

// Sample photos from Wikimedia Commons (full records in assets/credits.json). Shown in the footer.
// [what it shows, creator (licence), source page]
BBK.photoCredits = [
  ['Universitas Brawijaya tampak dari atas', 'Seru.co.id (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Universitas-Brawijaya-tampak-dari-atas.jpg'],
  ['Gerbang Universitas Brawijaya', 'Lorrainevyu (CC BY 4.0)', 'https://commons.wikimedia.org/wiki/File:04_270925_universitas_brawijaya_gerbang.jpg'],
  ['Jalan Ijen, Malang', 'Mr. Francozzz (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Idjen_Street,_Malang,_2019.jpg'],
  ['Kipas angin', 'Curpharar (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Mounted_electric_fan_in_a_classroom.jpg'],
  ['Rice cooker', 'Dinkun Chen (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Panasonic_RICE_COOKER_SR-L15H8.jpg'],
  ['Meja lipat', 'Pachinco71 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:EEZTOP_folding_table_at_Dana_Point_fishing.jpg'],
  ['Tumpukan buku', 'Alexander Grey (CC0)', 'https://commons.wikimedia.org/wiki/File:Stack_of_multicolored_books_on_a_table.jpg'],
  ['Kasur', 'Betterbed1 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Noa_Mattress_Review.png'],
  ['Dispenser', '些細な日常 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Water-dispenser-aqua-clara-1.jpg'],
  ['Sepeda lipat', 'Glurois (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Lulu_Bike_Sport_folding_bicycle_bikepacking.jpg'],
  ['Jas lab', 'Pi. from Leiden (CC BY 2.0)', 'https://commons.wikimedia.org/wiki/File:Lab_coats.jpg'],
  ['Rak sepatu', 'Sarang (domain publik)', 'https://commons.wikimedia.org/wiki/File:Tobang_with_shoe_rack.jpg'],
  ['Monitor', 'Lucasbosch (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:EIZO_Foris_FG2421_VGA_computer_monitor_displaying_test_pattern.png'],
  ['Teko listrik', 'Jacek Halicki (CC BY-SA 4.0)', "https://commons.wikimedia.org/wiki/File:2023_Czajnik_elektryczny_N%27OVEEN.jpg"],
  ['Tas carrier', 'WrS.tm.pl (CC0)', 'https://commons.wikimedia.org/wiki/File:Plecak_Hiker_50_L_HiMountain.jpg'],
  ['Gitar akustik', 'Elmschrat (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:00_Walden_Acoustic_Guitar_D310e_01.jpg'],
  ['Setrika uap', 'Colin (CC BY-SA 3.0)', 'https://commons.wikimedia.org/wiki/File:Electric_steam_iron.jpg'],
  ['Laci plastik', 'Fructibus (CC0)', 'https://commons.wikimedia.org/wiki/File:Blue_plastic_chest_of_drawers_for_desktop.jpg'],
  ['Wajan', 'Superspidey33 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Frying_pan_pan.jpg'],
];
