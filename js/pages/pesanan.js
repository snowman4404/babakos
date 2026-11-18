/*
 * Pesanan Saya (pesanan.html?tab=penjualan). Two tabs with the same order cards:
 * - Pembelian: the user's orders as buyer, with status filter and search.
 * - Penjualan: orders on the user's listings. Overview only: the seller confirms,
 *   approves the COD schedule and finishes the order on the detail page (lacak.html).
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();
  let tab = BBK.param('tab') === 'penjualan' ? 'penjualan' : 'pembelian';
  let filter = 'semua';

  const GROUPS = {
    baru: ['menunggu-konfirmasi'],
    berjalan: ['menunggu-konfirmasi', 'dikonfirmasi', 'jadwal-cod', 'bertemu'],
    siap: ['dikonfirmasi', 'jadwal-cod', 'bertemu'],
    selesai: ['selesai'],
    batal: ['dibatalkan'],
  };
  const FILTERS = {
    pembelian: [['semua', 'Semua'], ['berjalan', 'Berjalan'], ['selesai', 'Selesai'], ['batal', 'Dibatalkan']],
    penjualan: [['semua', 'Semua'], ['baru', 'Baru'], ['siap', 'Siap COD'], ['selesai', 'Selesai'], ['batal', 'Batal']],
  };
  const ordersFor = (t) =>
    BBK.orders
      .filter((o) => (t === 'penjualan' ? o.sellerId === me.id : o.buyerId === me.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ---------- Cards (same markup for both tabs; the whole card opens lacak.html) ---------- */
  function orderCard(o, role) {
    const items = BBK.orderItems(o);
    const other = BBK.getUser(role === 'penjualan' ? o.buyerId : o.sellerId);
    const p = items[0];
    return `<li><a class="order-card" href="lacak.html?id=${encodeURIComponent(o.id)}">
      <div class="order-card-top"><span class="eyebrow">${esc(o.id)}</span>${BBK.statusPill(o.status)}</div>
      <div class="order-card-body">
        <span class="order-card-thumb">
          <img src="${esc(BBK.productImage(p))}" alt="" width="80" height="80" loading="lazy">
          ${items.length > 1 ? `<span class="order-card-more" aria-hidden="true">+${items.length - 1}</span>` : ''}
        </span>
        <div class="order-card-info">
          <p class="order-card-title">${esc(BBK.orderTitle(o))}</p>
          <p class="caption">${role === 'penjualan' ? 'Untuk' : 'Dari'} ${esc(other.name)} · dibuat ${esc(BBK.formatDate(o.createdAt))}${items.length > 1 ? ` · ${items.length} barang` : ''}</p>
          <p class="caption muted">COD ${esc(o.meetingPlace)} · ${esc(BBK.formatDateTime(o.scheduledAt))}</p>
        </div>
        <div class="order-card-total">
          <span class="caption">Total biaya</span>
          <strong>${BBK.formatRupiah(o.price)}</strong>
          <span class="text-action">Lihat detail${BBK.icon('arrow-right', 18)}</span>
        </div>
      </div>
    </a></li>`;
  }

  /* ---------- Render ---------- */
  function render() {
    const all = ordersFor(tab);
    const q = $('#order-q').value.trim().toLowerCase();
    const list = all.filter((o) => {
      if (filter !== 'semua' && !GROUPS[filter].includes(o.status)) return false;
      if (!q) return true;
      const other = BBK.getUser(tab === 'penjualan' ? o.buyerId : o.sellerId);
      return [o.id, other.name, ...BBK.orderItems(o).map((p) => p.title)].join(' ').toLowerCase().includes(q);
    });

    document.querySelectorAll('[role="tab"]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === tab)));
    $('#panel').setAttribute('aria-labelledby', `tab-${tab}`);
    $('#orders-title').textContent = tab === 'penjualan' ? 'Kelola Pesanan' : 'Pesanan Saya';

    const count = (key) => (key === 'semua' ? all.length : all.filter((o) => GROUPS[key].includes(o.status)).length);
    $('#filters').innerHTML = FILTERS[tab]
      .map(([key, label]) => {
        const n = count(key);
        const badge = key === 'baru' && n ? `<span class="count">${n}</span>` : '';
        return `<button type="button" class="chip" data-f="${key}" aria-pressed="${filter === key}">${label}${badge}</button>`;
      })
      .join('');

    $('#list').innerHTML = list.map((o) => orderCard(o, tab)).join('');
    $('#empty').hidden = list.length > 0;
    if (!list.length) {
      const none = !all.length;
      $('#empty-title').textContent = none ? (tab === 'penjualan' ? 'Belum ada yang memesan barangmu' : 'Belum ada pesanan') : 'Tidak ada yang cocok';
      $('#empty-text').textContent = none
        ? tab === 'penjualan'
          ? 'Pesanan dari pembeli muncul di sini. Unggah barang supaya lebih banyak yang lihat.'
          : 'Temukan barang kost di katalog, lalu atur COD di titik aman.'
        : 'Coba status lain atau hapus kata pencariannya.';
      $('#empty-cta').href = tab === 'penjualan' ? 'jual.html' : 'jelajah.html';
      $('#empty-cta').textContent = tab === 'penjualan' ? 'Jual barang' : 'Buka katalog';
    }
    try {
      history.replaceState(null, '', tab === 'penjualan' ? '?tab=penjualan' : location.pathname);
    } catch {
      /* file:// */
    }
  }

  /* ---------- Events ---------- */
  document.querySelector('.segmented').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b || b.dataset.tab === tab) return;
    tab = b.dataset.tab;
    filter = 'semua';
    render();
  });
  // Arrow keys move between the two tabs.
  document.querySelector('.segmented').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    tab = tab === 'pembelian' ? 'penjualan' : 'pembelian';
    filter = 'semua';
    render();
    document.getElementById(`tab-${tab}`).focus();
  });
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    filter = b.dataset.f;
    render();
  });
  $('#order-q').addEventListener('input', render);

  render();
})();
