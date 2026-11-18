/*
 * Pesanan Saya (pesanan.html?tab=penjualan). Two tabs:
 * - Pembelian: the user's orders as buyer, with status filter and search.
 * - Penjualan: orders on the user's listings, styled after the Figma "Kelola
 *   Pesanan - Penjualan" frame (coloured status band, buyer + trust chip, item row,
 *   payment panel, accept countdown, Tolak / Terima / Konfirmasi Selesai COD).
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
  // Figma band per status (Penjualan)
  const BAND = {
    'menunggu-konfirmasi': ['new', 'Pesanan Baru'],
    dikonfirmasi: ['ready', 'Siap COD'],
    'jadwal-cod': ['ready', 'Siap COD'],
    bertemu: ['ready', 'Bertemu di titik COD'],
    selesai: ['done', 'Selesai'],
    dibatalkan: ['cancelled', 'Dibatalkan'],
  };

  const ordersFor = (t) =>
    BBK.orders
      .filter((o) => (t === 'penjualan' ? o.sellerId === me.id : o.buyerId === me.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ---------- Cards ---------- */
  function buyCard(o) {
    const items = BBK.orderItems(o);
    const seller = BBK.getUser(o.sellerId);
    const p = items[0];
    return `<li><a class="order-card" href="lacak.html?id=${encodeURIComponent(o.id)}">
      <div class="order-card-top"><span class="eyebrow">${esc(o.id)}</span>${BBK.statusPill(o.status)}</div>
      <div class="order-card-body">
        <img src="${esc(BBK.productImage(p))}" alt="" width="80" height="80" loading="lazy">
        <div class="order-card-info">
          <p class="order-card-title">${esc(BBK.orderTitle(o))}</p>
          <p class="caption">Dari ${esc(seller.name)} · dibuat ${esc(BBK.formatDate(o.createdAt))}</p>
          <p class="caption muted">COD ${esc(BBK.getMeetingPoint(o.meetingPointId).shortName)} · ${esc(BBK.formatDateTime(o.scheduledAt))}</p>
        </div>
        <div class="order-card-total">
          <span class="caption">Total biaya</span>
          <strong>${BBK.formatRupiah(o.price)}</strong>
          <span class="text-action">Lihat detail${BBK.icon('arrow-right', 18)}</span>
        </div>
      </div>
    </a></li>`;
  }

  function sellCard(o) {
    const items = BBK.orderItems(o);
    const buyer = BBK.getUser(o.buyerId);
    const point = BBK.getMeetingPoint(o.meetingPointId);
    const [band, bandLabel] = BAND[o.status];
    let actions = '';
    let countdown = '';
    if (o.status === 'menunggu-konfirmasi') {
      countdown = `<p class="countdown" data-deadline="${esc(acceptBy(o))}">${BBK.icon('clock', 16)}<span>Terima sebelum: <span class="countdown-left"></span></span></p>`;
      actions = `<button type="button" class="btn btn-danger-soft" data-act="reject" data-id="${esc(o.id)}">Tolak Pesanan</button>
        <button type="button" class="btn" data-act="accept" data-id="${esc(o.id)}">Terima Pesanan</button>`;
    } else if (o.status === 'dikonfirmasi') {
      actions = `<button type="button" class="btn btn-block" data-act="schedule" data-id="${esc(o.id)}">Setujui Jadwal COD</button>`;
    } else if (o.status === 'jadwal-cod' || o.status === 'bertemu') {
      actions = `<button type="button" class="btn btn-block" data-act="done" data-id="${esc(o.id)}">${BBK.icon('check', 18)}Konfirmasi Selesai COD</button>`;
    }
    return `<li class="sale sale-${band}">
      <p class="sale-band">${esc(bandLabel)}</p>
      <div class="sale-body">
        <div class="sale-top"><span class="sale-id">${esc(o.id)}</span><span class="caption">${esc(BBK.timeAgo(o.createdAt))}</span></div>
        <div class="sale-buyer">
          ${BBK.avatar(buyer)}
          <div><p class="sale-buyer-name">${esc(buyer.name)} <span class="trust-chip">${BBK.icon('shield', 11)}${buyer.trustScore}</span></p>
          <p class="caption">${esc(buyer.faculty)} · Universitas Brawijaya</p></div>
        </div>
        <a class="sale-items" href="lacak.html?id=${encodeURIComponent(o.id)}">
          ${items.map((p) => `<span class="sale-item"><img src="${esc(BBK.productImage(p))}" alt="" width="64" height="64" loading="lazy">
            <span><span class="sale-item-title">${esc(p.title)}</span><span class="caption">Qty: 1 · ${BBK.formatRupiah(p.price)}/pcs</span></span></span>`).join('')}
        </a>
        <div class="sale-pay">
          <div><span class="caption">Total Pembayaran</span><strong>${BBK.formatRupiah(o.price)}</strong></div>
          <div class="sale-pay-status"><span class="caption">Pembayaran</span><span>${o.status === 'selesai' ? 'Lunas tunai' : 'Tunai saat COD'}</span></div>
        </div>
        <p class="sale-where">${BBK.icon('pin', 16)}COD – ${esc(point.name)} · ${esc(BBK.formatDateTime(o.scheduledAt))}</p>
        ${countdown}
        ${actions ? `<div class="sale-actions">${actions}</div>` : ''}
      </div>
    </li>`;
  }

  /** Accept deadline: 24 h after ordering; old seed orders get a fresh one for the demo. */
  function acceptBy(o) {
    let t = o.acceptBy ? new Date(o.acceptBy) : new Date(new Date(o.createdAt).getTime() + 24 * 3600e3);
    if (t < Date.now()) {
      t = new Date(Date.now() + (17 * 3600 + 53 * 60 + 59) * 1000);
      o.acceptBy = t.toISOString();
      BBK.save.orders();
    }
    return t.toISOString();
  }

  /* ---------- Render ---------- */
  function render() {
    const all = ordersFor(tab);
    const q = $('#order-q').value.trim().toLowerCase();
    const list = all.filter((o) => {
      if (filter !== 'semua' && !GROUPS[filter].includes(o.status)) return false;
      if (!q) return true;
      const other = BBK.getUser(tab === 'penjualan' ? o.buyerId : o.sellerId);
      return [o.id, BBK.orderTitle(o), other.name].join(' ').toLowerCase().includes(q);
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

    $('#list').className = tab === 'penjualan' ? 'order-list sale-list' : 'order-list';
    $('#list').innerHTML = list.map(tab === 'penjualan' ? sellCard : buyCard).join('');
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
    tick();
    try {
      history.replaceState(null, '', tab === 'penjualan' ? '?tab=penjualan' : location.pathname);
    } catch {
      /* file:// */
    }
  }

  /* Live countdowns on new orders */
  function tick() {
    document.querySelectorAll('[data-deadline]').forEach((el) => {
      const ms = Math.max(0, new Date(el.dataset.deadline) - Date.now());
      const h = Math.floor(ms / 3600e3);
      const m = Math.floor((ms % 3600e3) / 60e3);
      const s = Math.floor((ms % 60e3) / 1000);
      el.querySelector('.countdown-left').textContent = `${h} Jam ${m} Menit ${String(s).padStart(2, '0')} Det`;
    });
  }
  setInterval(tick, 1000);

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

  $('#list').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const o = BBK.getOrder(b.dataset.id);
    const buyer = BBK.getUser(o.buyerId);
    const act = b.dataset.act;
    if (act === 'reject') {
      const ok = await BBK.confirm({ title: 'Tolak pesanan ini?', text: `${buyer.name} akan diberi tahu, dan barangnya tersedia lagi.`, ok: 'Tolak', cancel: 'Kembali', danger: true });
      if (!ok) return;
      BBK.setOrderStatus(o, 'dibatalkan', 'Ditolak penjual');
      BBK.toast('Pesanan ditolak.');
    } else if (act === 'accept') {
      BBK.setOrderStatus(o, 'dikonfirmasi');
      BBK.toast(`Pesanan ${buyer.name.split(' ')[0]} diterima.`);
    } else if (act === 'schedule') {
      const m = BBK.getMeetingPoint(o.meetingPointId);
      BBK.setOrderStatus(o, 'jadwal-cod', `${m.name}, ${BBK.formatShortDate(o.scheduledAt)} ${BBK.formatTime(o.scheduledAt)}`);
      BBK.toast('Jadwal COD disepakati.');
    } else if (act === 'done') {
      const ok = await BBK.confirm({ title: 'COD sudah selesai?', text: 'Barang sudah diterima pembeli dan dibayar tunai.', ok: 'Ya, selesai' });
      if (!ok) return;
      if (o.status === 'jadwal-cod') BBK.setOrderStatus(o, 'bertemu');
      BBK.setOrderStatus(o, 'selesai', 'Penjual konfirmasi COD selesai');
      BBK.toast('Transaksi selesai.');
    }
    render();
  });

  render();
})();
