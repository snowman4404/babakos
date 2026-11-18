/*
 * BaBaKos mock data. There is no backend: everything the site shows starts here.
 * Loaded as a classic <script> (not a module) so pages also work when opened
 * straight from disk (file://). Exposes one global: window.BBK.
 */
window.BBK = window.BBK || {};

BBK.CURRENT_USER_ID = 'u1'; // the mock "logged-in" student

BBK.categories = [
  { id: 'elektronik', label: 'Elektronik' },
  { id: 'perabot', label: 'Perabot Kost' },
  { id: 'dapur', label: 'Alat Dapur' },
  { id: 'buku', label: 'Buku & Alat Kuliah' },
  { id: 'pakaian', label: 'Pakaian' },
  { id: 'kendaraan', label: 'Sepeda & Aksesoris' },
  { id: 'lainnya', label: 'Lainnya' },
];

BBK.conditionLabels = {
  'seperti-baru': 'Seperti Baru',
  baik: 'Baik',
  'layak-pakai': 'Layak Pakai',
};

// Kost neighbourhoods around Universitas Brawijaya, Malang. distanceKm = to UB main gate (mock).
BBK.kostAreas = [
  { id: 'ketawanggede', name: 'Ketawanggede', distanceKm: 0.5 },
  { id: 'sumbersari', name: 'Sumbersari', distanceKm: 0.8 },
  { id: 'kerto', name: 'Jl. Kerto (Kertopamuji, Kertosentono)', distanceKm: 0.7 },
  { id: 'watugong', name: 'Watugong', distanceKm: 0.6 },
  { id: 'dinoyo', name: 'Dinoyo', distanceKm: 1.5 },
  { id: 'gajayana', name: 'Jl. Gajayana', distanceKm: 1.2 },
  { id: 'soehat', name: 'Soekarno-Hatta (Soehat)', distanceKm: 1.8 },
  { id: 'kalpataru', name: 'Kalpataru', distanceKm: 2.0 },
  { id: 'tlogomas', name: 'Tlogomas', distanceKm: 3.0 },
];

// Safe public COD meeting points. x/y = % position on the illustrated mock map (no maps API).
BBK.meetingPoints = [
  { id: 'gerbang-veteran', name: 'Gerbang Utama UB (Jl. Veteran)', description: 'Depan pos satpam gerbang utama, ramai dan terang.', areaId: 'sumbersari', x: 48, y: 70 },
  { id: 'gerbang-watugong', name: 'Gerbang Watugong UB', description: 'Dekat pos satpam, cocok untuk penghuni Watugong & Kerto.', areaId: 'watugong', x: 70, y: 35 },
  { id: 'masjid-raden-patah', name: 'Masjid Raden Patah UB', description: 'Area parkir depan masjid kampus.', areaId: 'ketawanggede', x: 40, y: 45 },
  { id: 'perpustakaan-ub', name: 'Perpustakaan Pusat UB', description: 'Lobi perpustakaan, buka jam kuliah.', areaId: 'ketawanggede', x: 55, y: 50 },
  { id: 'matos', name: 'Malang Town Square (Matos)', description: 'Lobi utama mal, di seberang kampus.', areaId: 'sumbersari', x: 30, y: 80 },
  { id: 'mx-mall', name: 'MX Mall', description: 'Pintu masuk depan, dekat Jl. Veteran.', areaId: 'sumbersari', x: 62, y: 85 },
];

BBK.users = [
  { id: 'u1', name: 'Rizky Pratama', email: 'rizkypratama@student.ub.ac.id', faculty: 'Fakultas Ilmu Komputer', areaId: 'ketawanggede', verified: true, rating: 4.8, totalSold: 3, joinedAt: '2026-08-20' },
  { id: 'u2', name: 'Nadia Putri', email: 'nadiaputri@student.ub.ac.id', faculty: 'Fakultas Ekonomi dan Bisnis', areaId: 'kerto', verified: true, rating: 4.9, totalSold: 12, joinedAt: '2025-09-01' },
  { id: 'u3', name: 'Bagus Setiawan', email: 'bagussetiawan@student.ub.ac.id', faculty: 'Fakultas Teknik', areaId: 'sumbersari', verified: true, rating: 4.6, totalSold: 7, joinedAt: '2025-02-14' },
  { id: 'u4', name: 'Ayu Lestari', email: 'ayulestari@student.ub.ac.id', faculty: 'Fakultas MIPA', areaId: 'watugong', verified: true, rating: 5.0, totalSold: 4, joinedAt: '2026-01-10' },
  { id: 'u5', name: 'Fajar Nugroho', email: 'fajarnugroho@student.ub.ac.id', faculty: 'Fakultas Pertanian', areaId: 'dinoyo', verified: true, rating: 4.7, totalSold: 9, joinedAt: '2024-10-05' },
];

// images: [] means the UI shows a category placeholder. Put real photos in assets/products/.
BBK.products = [
  { id: 'p1', title: 'Kipas Angin Miyako 16 inch', description: 'Masih kencang, 3 kecepatan. Dijual karena pindah kost ber-AC.', price: 85000, categoryId: 'elektronik', condition: 'baik', areaId: 'ketawanggede', sellerId: 'u2', images: [], postedAt: '2026-11-15T09:00:00+07:00', status: 'tersedia' },
  { id: 'p2', title: 'Rice Cooker Cosmos 1.8L', description: 'Lapisan anti lengket masih bagus, lengkap dengan centong.', price: 120000, categoryId: 'dapur', condition: 'baik', areaId: 'sumbersari', sellerId: 'u3', images: [], postedAt: '2026-11-14T13:30:00+07:00', status: 'tersedia' },
  { id: 'p3', title: 'Meja Lipat Belajar Lesehan', description: 'Kayu, ada sedikit goresan di pinggir. Muat laptop + buku.', price: 45000, categoryId: 'perabot', condition: 'layak-pakai', areaId: 'kerto', sellerId: 'u2', images: [], postedAt: '2026-11-13T19:00:00+07:00', status: 'tersedia' },
  { id: 'p4', title: 'Kalkulus Purcell Jilid 1 & 2', description: 'Buku wajib Matematika Dasar. Ada stabilo di beberapa halaman.', price: 60000, categoryId: 'buku', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: [], postedAt: '2026-11-12T08:15:00+07:00', status: 'tersedia' },
  { id: 'p5', title: 'Kasur Busa Inoac 90x200', description: 'Tebal 15 cm, sudah dicuci sarungnya. Harus diambil sendiri.', price: 250000, categoryId: 'perabot', condition: 'baik', areaId: 'dinoyo', sellerId: 'u5', images: [], postedAt: '2026-11-11T16:45:00+07:00', status: 'tersedia' },
  { id: 'p6', title: 'Dispenser Galon Sanken', description: 'Hanya air normal & panas. Berfungsi normal.', price: 90000, categoryId: 'elektronik', condition: 'layak-pakai', areaId: 'soehat', sellerId: 'u3', images: [], postedAt: '2026-11-10T10:20:00+07:00', status: 'tersedia' },
  { id: 'p7', title: 'Sepeda Lipat United 20"', description: 'Rem dan gigi aman, ban baru diganti bulan lalu.', price: 850000, categoryId: 'kendaraan', condition: 'seperti-baru', areaId: 'gajayana', sellerId: 'u5', images: [], postedAt: '2026-11-09T07:00:00+07:00', status: 'tersedia' },
  { id: 'p8', title: 'Jas Lab Putih Ukuran L', description: 'Dipakai 1 semester praktikum, sudah dilaundry.', price: 35000, categoryId: 'pakaian', condition: 'baik', areaId: 'ketawanggede', sellerId: 'u4', images: [], postedAt: '2026-11-08T12:00:00+07:00', status: 'tersedia' },
  { id: 'p9', title: 'Rak Sepatu Susun 4', description: 'Besi + kain, mudah dibongkar pasang.', price: 30000, categoryId: 'perabot', condition: 'layak-pakai', areaId: 'kalpataru', sellerId: 'u2', images: [], postedAt: '2026-11-07T15:00:00+07:00', status: 'terjual' },
  { id: 'p10', title: 'Monitor LG 22" Full HD', description: 'Tidak ada dead pixel, termasuk kabel HDMI.', price: 750000, categoryId: 'elektronik', condition: 'seperti-baru', areaId: 'tlogomas', sellerId: 'u3', images: [], postedAt: '2026-11-06T20:30:00+07:00', status: 'dipesan' },
];

// Seed chats for u1. attachedProductId on the first message = product card attached automatically.
BBK.chatThreads = [
  {
    id: 'c1', productId: 'p1', buyerId: 'u1', sellerId: 'u2',
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Halo kak, kipasnya masih ada?', sentAt: '2026-11-16T10:00:00+07:00', attachedProductId: 'p1' },
      { id: 'm2', senderId: 'u2', text: 'Masih ada kak! Bisa COD di Masjid Raden Patah besok siang?', sentAt: '2026-11-16T10:05:00+07:00' },
    ],
  },
  {
    id: 'c2', productId: 'p4', buyerId: 'u1', sellerId: 'u4',
    messages: [
      { id: 'm3', senderId: 'u1', text: 'Kak, bukunya bisa kurang dikit?', sentAt: '2026-11-15T19:30:00+07:00', attachedProductId: 'p4' },
    ],
  },
];

// Order status flow: menunggu-konfirmasi → dikonfirmasi → jadwal-cod → bertemu → selesai (or dibatalkan)
BBK.orderSteps = [
  { status: 'menunggu-konfirmasi', label: 'Menunggu Konfirmasi Penjual' },
  { status: 'dikonfirmasi', label: 'Dikonfirmasi Penjual' },
  { status: 'jadwal-cod', label: 'Jadwal COD Disepakati' },
  { status: 'bertemu', label: 'Bertemu di Lokasi COD' },
  { status: 'selesai', label: 'Transaksi Selesai' },
];

BBK.orders = [
  {
    id: 'BBK-2611-001', productId: 'p1', buyerId: 'u1', sellerId: 'u2', price: 85000,
    meetingPointId: 'masjid-raden-patah', scheduledAt: '2026-11-19T12:30:00+07:00', status: 'jadwal-cod',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-16T10:10:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-16T10:20:00+07:00' },
      { status: 'jadwal-cod', at: '2026-11-16T10:25:00+07:00', note: 'Masjid Raden Patah UB, Rabu 12.30' },
    ],
  },
  {
    id: 'BBK-2611-002', productId: 'p10', buyerId: 'u1', sellerId: 'u3', price: 750000,
    meetingPointId: 'matos', scheduledAt: '2026-11-12T16:00:00+07:00', status: 'selesai',
    timeline: [
      { status: 'menunggu-konfirmasi', at: '2026-11-10T09:00:00+07:00' },
      { status: 'dikonfirmasi', at: '2026-11-10T09:30:00+07:00' },
      { status: 'jadwal-cod', at: '2026-11-10T09:45:00+07:00' },
      { status: 'bertemu', at: '2026-11-12T16:05:00+07:00' },
      { status: 'selesai', at: '2026-11-12T16:20:00+07:00', note: 'Pembeli konfirmasi barang diterima' },
    ],
  },
];
