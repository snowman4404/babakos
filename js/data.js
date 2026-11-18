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
  { id: 'gerbang-veteran', name: 'Gerbang Utama UB (Jl. Veteran)', shortName: 'Gerbang Utama', description: 'Depan pos satpam gerbang utama, ramai dan terang.', areaId: 'sumbersari', x: 48, y: 70 },
  { id: 'gerbang-watugong', name: 'Gerbang Watugong UB', shortName: 'Gerbang Watugong', description: 'Dekat pos satpam, cocok untuk penghuni Watugong & Kerto.', areaId: 'watugong', x: 70, y: 35 },
  { id: 'masjid-raden-patah', name: 'Masjid Raden Patah UB', shortName: 'Masjid Raden Patah', description: 'Area parkir depan masjid kampus.', areaId: 'ketawanggede', x: 40, y: 45 },
  { id: 'perpustakaan-ub', name: 'Perpustakaan Pusat UB', shortName: 'Perpustakaan Pusat', description: 'Lobi perpustakaan, buka jam kuliah.', areaId: 'ketawanggede', x: 55, y: 50 },
  { id: 'matos', name: 'Malang Town Square (Matos)', shortName: 'Matos', description: 'Lobi utama mal, di seberang kampus.', areaId: 'sumbersari', x: 30, y: 80 },
  { id: 'mx-mall', name: 'MX Mall', shortName: 'MX Mall', description: 'Pintu masuk depan, dekat Jl. Veteran.', areaId: 'sumbersari', x: 62, y: 85 },
];

// Sample data for the homepage story (js/pages/index.js). The order ids are deliberately NOT
// the real seed orders: the slip shows a finished sample order, while BBK-2611-001 is still 'jadwal-cod'.
BBK.homeJourney = {
  nicknames: { p1: 'kipasnya', p2: 'rice cookernya', p7: 'sepedanya', p4: 'bukunya' },
  orderIds: { p1: 'BBK-2611-101', p2: 'BBK-2611-102', p7: 'BBK-2611-107', p4: 'BBK-2611-104' },
  codDay: 'Kamis',
  codTime: '12.30',
  // Slip timeline. {cod} is replaced by the item's meeting point (short name), {price} by its price.
  slip: [
    { day: 'Senin', rows: [['Dipesan', '10.10'], ['Dikonfirmasi penjual', '10.20'], ['Jadwal COD disepakati', '10.25']] },
    { day: 'Kamis', rows: [['Bertemu di {cod}', '12.34'], ['Barang dicek dan dibayar', '{price}']] },
  ],
  doneLabel: 'Selesai, barang di kamarmu',
  doneAt: '12.41',
};

// Quick max-price steps (Rp); also usable by the Jelajah filter.
BBK.priceCeilings = [100000, 200000, 500000, 1000000];

// COD is possible between these hours at every meeting point.
BBK.codHours = { open: '07.00', close: '21.00' };

BBK.users = [
  { id: 'u1', name: 'Rizky Pratama', email: 'rizkypratama@student.ub.ac.id', faculty: 'Fakultas Ilmu Komputer', areaId: 'ketawanggede', verified: true, rating: 4.8, totalSold: 3, joinedAt: '2026-08-20' },
  { id: 'u2', name: 'Nadia Putri', email: 'nadiaputri@student.ub.ac.id', faculty: 'Fakultas Ekonomi dan Bisnis', areaId: 'kerto', verified: true, rating: 4.9, totalSold: 12, joinedAt: '2025-09-01' },
  { id: 'u3', name: 'Bagus Setiawan', email: 'bagussetiawan@student.ub.ac.id', faculty: 'Fakultas Teknik', areaId: 'sumbersari', verified: true, rating: 4.6, totalSold: 7, joinedAt: '2025-02-14' },
  { id: 'u4', name: 'Ayu Lestari', email: 'ayulestari@student.ub.ac.id', faculty: 'Fakultas MIPA', areaId: 'watugong', verified: true, rating: 5.0, totalSold: 4, joinedAt: '2026-01-10' },
  { id: 'u5', name: 'Fajar Nugroho', email: 'fajarnugroho@student.ub.ac.id', faculty: 'Fakultas Pertanian', areaId: 'dinoyo', verified: true, rating: 4.7, totalSold: 9, joinedAt: '2024-10-05' },
];

// images: paths relative to the site root; images[0] is the cover. Sample photos are credited in BBK.photoCredits.
BBK.products = [
  { id: 'p11', title: 'Teko Listrik 1.7L', description: 'Mendidih cepat, mati otomatis. Bagian dalam sudah dibersihkan dari kerak.', price: 55000, categoryId: 'dapur', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: ['assets/products/p11-teko.jpg'], postedAt: '2026-11-17T20:10:00+07:00', status: 'tersedia' },
  { id: 'p12', title: 'Tas Carrier 50L', description: 'Dipakai 2x naik Panderman. Resleting dan rain cover lengkap.', price: 180000, categoryId: 'lainnya', condition: 'seperti-baru', areaId: 'sumbersari', sellerId: 'u5', images: ['assets/products/p12-tas.jpg'], postedAt: '2026-11-17T16:00:00+07:00', status: 'tersedia' },
  { id: 'p13', title: 'Gitar Akustik Walden', description: 'Senar baru, ada softcase. Suara masih nyaring.', price: 400000, categoryId: 'lainnya', condition: 'baik', areaId: 'kerto', sellerId: 'u3', images: ['assets/products/p13-gitar.jpg'], postedAt: '2026-11-17T09:30:00+07:00', status: 'tersedia' },
  { id: 'p14', title: 'Setrika Uap Russell Hobbs', description: 'Uap masih keluar normal, alas tidak lengket.', price: 50000, categoryId: 'elektronik', condition: 'layak-pakai', areaId: 'ketawanggede', sellerId: 'u2', images: ['assets/products/p14-setrika.jpg'], postedAt: '2026-11-16T21:00:00+07:00', status: 'tersedia' },
  { id: 'p15', title: 'Laci Plastik 3 Susun', description: 'Ukuran meja, 35x27x36 cm. Pas untuk alat tulis dan skincare.', price: 65000, categoryId: 'perabot', condition: 'seperti-baru', areaId: 'gajayana', sellerId: 'u4', images: ['assets/products/p15-laci.jpg'], postedAt: '2026-11-16T14:20:00+07:00', status: 'tersedia' },
  { id: 'p16', title: 'Wajan Teflon 24 cm', description: 'Lapisan masih rata, gagang kokoh. Cocok untuk masak di kost.', price: 40000, categoryId: 'dapur', condition: 'baik', areaId: 'dinoyo', sellerId: 'u5', images: ['assets/products/p16-wajan.jpg'], postedAt: '2026-11-15T18:40:00+07:00', status: 'tersedia' },
  { id: 'p1', title: 'Kipas Angin Miyako 16 inch', description: 'Masih kencang, 3 kecepatan. Dijual karena pindah kost ber-AC.', price: 85000, categoryId: 'elektronik', condition: 'baik', areaId: 'ketawanggede', sellerId: 'u2', images: ['assets/products/p1-kipas.jpg'], postedAt: '2026-11-15T09:00:00+07:00', status: 'tersedia' },
  { id: 'p2', title: 'Rice Cooker Cosmos 1.8L', description: 'Lapisan anti lengket masih bagus, lengkap dengan centong.', price: 120000, categoryId: 'dapur', condition: 'baik', areaId: 'sumbersari', sellerId: 'u3', images: ['assets/products/p2-ricecooker.jpg'], postedAt: '2026-11-14T13:30:00+07:00', status: 'tersedia' },
  { id: 'p3', title: 'Meja Lipat Belajar Lesehan', description: 'Kayu, ada sedikit goresan di pinggir. Muat laptop + buku.', price: 45000, categoryId: 'perabot', condition: 'layak-pakai', areaId: 'kerto', sellerId: 'u2', images: ['assets/products/p3-meja.jpg'], postedAt: '2026-11-13T19:00:00+07:00', status: 'tersedia' },
  { id: 'p4', title: 'Kalkulus Purcell Jilid 1 & 2', description: 'Buku wajib Matematika Dasar. Ada stabilo di beberapa halaman.', price: 60000, categoryId: 'buku', condition: 'baik', areaId: 'watugong', sellerId: 'u4', images: ['assets/products/p4-buku.jpg'], postedAt: '2026-11-12T08:15:00+07:00', status: 'tersedia' },
  { id: 'p5', title: 'Kasur Busa Inoac 90x200', description: 'Tebal 15 cm, sudah dicuci sarungnya. Harus diambil sendiri.', price: 250000, categoryId: 'perabot', condition: 'baik', areaId: 'dinoyo', sellerId: 'u5', images: ['assets/products/p5-kasur.png'], postedAt: '2026-11-11T16:45:00+07:00', status: 'tersedia' },
  { id: 'p6', title: 'Dispenser Galon Sanken', description: 'Hanya air normal & panas. Berfungsi normal.', price: 90000, categoryId: 'elektronik', condition: 'layak-pakai', areaId: 'soehat', sellerId: 'u3', images: ['assets/products/p6-dispenser.jpg'], postedAt: '2026-11-10T10:20:00+07:00', status: 'tersedia' },
  { id: 'p7', title: 'Sepeda Lipat United 20"', description: 'Rem dan gigi aman, ban baru diganti bulan lalu.', price: 850000, categoryId: 'kendaraan', condition: 'seperti-baru', areaId: 'gajayana', sellerId: 'u5', images: ['assets/products/p7-sepeda.jpg'], postedAt: '2026-11-09T07:00:00+07:00', status: 'tersedia' },
  { id: 'p8', title: 'Jas Lab Putih Ukuran L', description: 'Dipakai 1 semester praktikum, sudah dilaundry.', price: 35000, categoryId: 'pakaian', condition: 'baik', areaId: 'ketawanggede', sellerId: 'u4', images: ['assets/products/p8-jaslab.jpg'], postedAt: '2026-11-08T12:00:00+07:00', status: 'tersedia' },
  { id: 'p9', title: 'Rak Sepatu Susun 4', description: 'Besi + kain, mudah dibongkar pasang.', price: 30000, categoryId: 'perabot', condition: 'layak-pakai', areaId: 'kalpataru', sellerId: 'u2', images: ['assets/products/p9-rak.jpg'], postedAt: '2026-11-07T15:00:00+07:00', status: 'terjual' },
  { id: 'p10', title: 'Monitor LG 22" Full HD', description: 'Tidak ada dead pixel, termasuk kabel HDMI.', price: 750000, categoryId: 'elektronik', condition: 'seperti-baru', areaId: 'tlogomas', sellerId: 'u3', images: ['assets/products/p10-monitor.png'], postedAt: '2026-11-06T20:30:00+07:00', status: 'dipesan' },
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
      { status: 'jadwal-cod', at: '2026-11-16T10:25:00+07:00', note: 'Masjid Raden Patah UB, Kamis 12.30' },
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
