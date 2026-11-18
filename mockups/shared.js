/*
 * Shared helpers for the homepage mockup (mockups/d-pindah-tangan).
 * Loaded after ../../js/data.js and ../../js/utils.js.
 * Product photos are sample pictures from Wikimedia Commons (see mockups/assets/credits.json);
 * real listings would carry the seller's own photos.
 */
(function () {
  const IMG = '../assets/';
  BBK.mockImages = {
    p1: 'p1-kipas.jpg', p2: 'p2-ricecooker.jpg', p3: 'p3-meja.jpg', p4: 'p4-buku.jpg',
    p5: 'p5-kasur.png', p6: 'p6-dispenser.jpg', p7: 'p7-sepeda.jpg', p8: 'p8-jaslab.jpg',
    p9: 'p9-rak.jpg', p10: 'p10-monitor.png', p11: 'p11-teko.jpg', p12: 'p12-tas.jpg',
    p13: 'p13-gitar.jpg', p14: 'p14-setrika.jpg', p15: 'p15-laci.jpg', p16: 'p16-wajan.jpg',
  };
  BBK.productImage = (p) => IMG + (BBK.mockImages[p.id] || 'ub-aerial.jpg');
  // Natural pixel sizes of the files above (all 960px wide), for layouts that keep natural ratios.
  const H = { p1: 720, p2: 991, p3: 841, p4: 1440, p5: 960, p6: 640, p7: 960, p8: 720, p9: 1280, p10: 675, p11: 1113, p12: 624, p13: 1280, p14: 637, p15: 1280, p16: 720 };
  BBK.imageSize = (p) => ({ w: 960, h: H[p.id] || 960 });

  /** Available listings, newest first. */
  BBK.latestProducts = () =>
    BBK.products.filter((p) => p.status === 'tersedia').sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  /** Straight-line distance in km between two kost areas (mock coordinates in data.js). */
  BBK.areaDistance = (a, b) => {
    const A = BBK.getArea(a), B = BBK.getArea(b);
    return Math.hypot(A.x - B.x, A.y - B.y);
  };
  /** Walking minutes at ~5 km/h, at least 2. */
  BBK.walkMinutes = (km) => Math.max(2, Math.round((km / 5) * 60));

  /** "Rp 85.000" without the non-breaking-space quirks some fonts render oddly. */
  BBK.rp = (n) => 'Rp' + n.toLocaleString('id-ID');

  /** Footer credit line for every found picture used by the mockups. */
  BBK.creditsHTML = () =>
    'Foto contoh dari Wikimedia Commons: ' +
    CREDITS.map((c) => `<a href="${c[2]}">${c[0]}</a> oleh ${c[1]}`).join('; ') + '.';
  const CREDITS = [
    ['Universitas Brawijaya tampak dari atas', 'Seru.co.id (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Universitas-Brawijaya-tampak-dari-atas.jpg'],
    ['Gerbang Universitas Brawijaya', 'Lorrainevyu (CC BY 4.0)', 'https://commons.wikimedia.org/wiki/File:04_270925_universitas_brawijaya_gerbang.jpg'],
    ['Idjen Street, Malang', 'Mr. Francozzz (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Idjen_Street,_Malang,_2019.jpg'],
    ['Kipas angin', 'Curpharar (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Mounted_electric_fan_in_a_classroom.jpg'],
    ['Rice cooker', 'Dinkun Chen (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Panasonic_RICE_COOKER_SR-L15H8.jpg'],
    ['Meja lipat', 'Pachinco71 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:EEZTOP_folding_table_at_Dana_Point_fishing.jpg'],
    ['Tumpukan buku', 'Alexander Grey (CC0)', 'https://commons.wikimedia.org/wiki/File:Stack_of_multicolored_books_on_a_table.jpg'],
    ['Kasur', 'Betterbed1 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Noa_Mattress_Review.png'],
    ['Dispenser', '些細な日常 (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Water-dispenser-aqua-clara-1.jpg'],
    ['Sepeda lipat', 'Glurois (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:Lulu_Bike_Sport_folding_bicycle_bikepacking.jpg'],
    ['Jas lab', 'Pi. from Leiden (CC BY 2.0)', 'https://commons.wikimedia.org/wiki/File:Lab_coats.jpg'],
    ['Rak sepatu', 'Sarang (public domain)', 'https://commons.wikimedia.org/wiki/File:Tobang_with_shoe_rack.jpg'],
    ['Monitor', 'Lucasbosch (CC BY-SA 4.0)', 'https://commons.wikimedia.org/wiki/File:EIZO_Foris_FG2421_VGA_computer_monitor_displaying_test_pattern.png'],
  ];

  /*
   * Entrance motion: elements with [data-reveal] rise in once when their section enters.
   * Children of one [data-reveal-group] are staggered 70ms apart. Content is visible
   * without JS (the hidden state is only applied once this script runs).
   */
  BBK.initReveal = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-ready');
    document.querySelectorAll('[data-reveal-group]').forEach((g) => {
      g.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--delay', i * 70 + 'ms'));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    // Safety net for fast jumps (anchor links, flicked scrolling): anything already above the
    // bottom of the screen is shown, so no section is ever left blank.
    let queued = false;
    const sweep = () => {
      queued = false;
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('is-in'); io.unobserve(el); }
      });
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } }, { passive: true });
  };
})();
