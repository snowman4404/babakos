/*
 * Lacak Pesanan (lacak.html?id=BBK-2611-001), from the Figma "Pesanan Saya" frame.
 * Status stepper Menunggu → Dikonfirmasi → Jadwal COD → Bertemu → Selesai, schedule,
 * meeting point on the campus map, payment summary. Actions depend on the role:
 * the buyer can cancel or confirm receipt (then rate the seller); the seller can
 * accept, reject, set the schedule and mark the meeting. A demo button plays the
 * other side so the whole flow can be shown alone.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();
  const o = BBK.getOrder(BBK.param('id'));

  if (!o || (o.buyerId !== me.id && o.sellerId !== me.id)) {
    $('#missing').hidden = false;
    return;
  }
  $('#track').hidden = false;
  const isBuyer = o.buyerId === me.id;
  const otherUser = BBK.getUser(isBuyer ? o.sellerId : o.buyerId);
  const items = BBK.orderItems(o);
  const thread = BBK.threadForProduct(o.productIds[0], me.id);
  const chatHref = thread ? `chat.html?thread=${encodeURIComponent(thread.id)}` : `chat.html?product=${encodeURIComponent(o.productIds[0])}`;
  if (!isBuyer) $('.back-btn').href = 'pesanan.html?tab=penjualan';
  document.title = `Pesanan ${o.id} — BaBaKos`;

  const STEP_ICONS = ['clock', 'circle-check', 'calendar', 'users', 'package'];

  function render() {
    const point = BBK.getMeetingPoint(o.meetingPointId);
    const idx = BBK.stepIndex(o.status);
    const done = o.status === 'selesai';
    const cancelled = o.status === 'dibatalkan';

    /* Head */
    $('#t-name').textContent = `Pesanan ${BBK.orderTitle(o)}`;
    $('#t-created').textContent = `${o.id} · Dibuat pada ${BBK.formatDate(o.createdAt)}`;
    $('#t-pill').innerHTML = BBK.statusPill(o.status);

    /* Items */
    $('#t-items').innerHTML = items
      .map(
        (p) => `<a class="track-item" href="produk.html?id=${encodeURIComponent(p.id)}">
          <img src="${esc(BBK.productImage(p))}" alt="" width="120" height="120">
          <div class="track-item-body">
            <p class="track-item-title">${esc(p.title)}</p>
            <dl class="kv">
              <div><dt>Harga</dt><dd class="track-item-price">${BBK.formatRupiah(p.price)}</dd></div>
              <div><dt>Kuantitas</dt><dd>x1</dd></div>
              <div><dt>Kondisi</dt><dd>${esc(BBK.conditionLabels[p.condition])}</dd></div>
              <div><dt>${isBuyer ? 'Penjual' : 'Pembeli'}</dt><dd>${esc(otherUser.name)}</dd></div>
            </dl>
          </div>
        </a>`,
      )
      .join('');

    /* Status banner + stepper */
    const banner = $('#t-banner');
    banner.className = `status-banner is-${BBK.statusTone(o.status)}`;
    banner.innerHTML = `<span>${esc(cancelled ? 'Dibatalkan' : BBK.orderSteps[idx].long)}</span>${BBK.icon(cancelled ? 'x' : done ? 'circle-check' : STEP_ICONS[idx], 36)}`;
    $('#t-steps').innerHTML = BBK.orderSteps
      .map((s, i) => {
        const at = o.timeline.find((t) => t.status === s.status);
        const state = cancelled ? (at ? 'done' : 'off') : i < idx || done ? 'done' : i === idx ? 'now' : 'off';
        return `<li class="step is-${state}"${state === 'now' ? ' aria-current="step"' : ''}>
          <span class="step-dot">${BBK.icon(state === 'done' ? 'check' : STEP_ICONS[i], 16)}</span>
          <span class="step-text"><span class="step-label">${esc(s.label)}</span>
          <span class="caption">${at ? esc(BBK.formatDateTime(at.at)) + (at.note ? ' · ' + esc(at.note) : '') : '&nbsp;'}</span></span>
        </li>`;
      })
      .join('');
    const cancelEntry = o.timeline.find((t) => t.status === 'dibatalkan');
    $('#t-status-kv').innerHTML = `
      <div><dt>Status pesanan</dt><dd class="status-text is-${BBK.statusTone(o.status)}">${esc(BBK.statusLabel(o.status))}</dd></div>
      <div><dt>Metode pembayaran</dt><dd>Tunai saat COD</dd></div>
      <div><dt>Total biaya</dt><dd>${BBK.formatRupiah(o.price)}</dd></div>
      ${o.note ? `<div><dt>Catatan pembeli</dt><dd>${esc(o.note)}</dd></div>` : ''}
      ${cancelEntry && cancelEntry.note ? `<div><dt>Alasan batal</dt><dd>${esc(cancelEntry.note)}</dd></div>` : ''}`;

    renderActions(idx);
    renderReview();

    /* Schedule + places */
    const confirmed = o.timeline.find((t) => t.status === 'dikonfirmasi');
    const finished = o.timeline.find((t) => t.status === 'selesai');
    $('#t-when').innerHTML = `
      <li><span class="caption">Tanggal pemesanan</span><span>${esc(BBK.formatDate(o.createdAt))}</span></li>
      <li><span class="caption">Jadwal COD</span><span>${esc(BBK.formatDate(o.scheduledAt))}, ${esc(BBK.formatTime(o.scheduledAt))}</span></li>
      <li><span class="caption">${finished ? 'Selesai' : 'Dikonfirmasi penjual'}</span><span>${finished ? esc(BBK.formatDateTime(finished.at)) : confirmed ? esc(BBK.formatDateTime(confirmed.at)) : 'Belum'}</span></li>`;
    const seller = BBK.getUser(o.sellerId);
    const buyer = BBK.getUser(o.buyerId);
    $('#t-where').innerHTML = `
      <li><span class="where-dot is-from"></span><div><p class="where-label">Barang dari</p>
        <p>Kost ${esc(seller.name)} di ${esc(BBK.areaShortName(items[0].areaId))}</p></div></li>
      <li><span class="where-dot is-to"></span><div><p class="where-label">Bertemu di</p>
        <p>${esc(point.name)}</p><p class="caption">${esc(buyer.name)} — ${esc(buyer.email)}</p></div></li>`;
    $('#t-map').innerHTML = BBK.campusMap({ selected: point.id });
    $('#t-map-note').textContent = `${point.description} COD pukul ${BBK.codHours.open}–${BBK.codHours.close}.`;

    /* Payment */
    const normal = items.reduce((s, p) => s + p.price, 0);
    $('#t-pay').innerHTML = `
      <div><dt>Biaya produk</dt><dd>${BBK.formatRupiah(normal)}</dd></div>
      ${normal > o.price ? `<div class="kv-good"><dt>Hemat paket</dt><dd>– ${BBK.formatRupiah(normal - o.price)}</dd></div>` : ''}
      <div class="kv-good"><dt>Biaya layanan</dt><dd>Gratis</dd></div>
      <div class="kv-total"><dt>Total biaya</dt><dd>${BBK.formatRupiah(o.price)}</dd></div>
      <div><dt>Metode pembayaran</dt><dd>Tunai saat COD</dd></div>`;
  }

  /* ---------- Actions per role and status ---------- */
  function renderActions(idx) {
    const s = o.status;
    const chat = `<a class="btn btn-outline" href="${chatHref}">${BBK.icon('chat-dots', 20)}Chat ${isBuyer ? 'penjual' : 'pembeli'}</a>`;
    let html = '';
    if (s === 'dibatalkan') html = `<a class="btn" href="jelajah.html">Cari barang lain</a>`;
    else if (isBuyer) {
      if (s === 'jadwal-cod' || s === 'bertemu') html = `${chat}<button type="button" class="btn" data-act="received">Konfirmasi Barang Diterima</button>`;
      else if (s === 'selesai') html = `${chat}<a class="btn" href="jelajah.html">Belanja lagi</a>`;
      else html = chat;
      if (idx < 3 && s !== 'selesai') html += `<button type="button" class="btn btn-danger-soft" data-act="cancel">Batalkan pesanan</button>`;
    } else {
      if (s === 'menunggu-konfirmasi') html = `<button type="button" class="btn btn-danger-soft" data-act="reject">Tolak Pesanan</button><button type="button" class="btn" data-act="accept">Terima Pesanan</button>`;
      else if (s === 'dikonfirmasi') html = `${chat}<button type="button" class="btn" data-act="schedule">Setujui Jadwal COD</button>`;
      else if (s === 'jadwal-cod') html = `${chat}<button type="button" class="btn" data-act="met">Tandai Sudah Bertemu</button>`;
      else if (s === 'bertemu') html = `${chat}<button type="button" class="btn" data-act="received">${BBK.icon('check', 18)}Konfirmasi Selesai COD</button>`;
      else html = chat;
    }
    $('#t-actions').innerHTML = html;

    // Demo: play the other side's next step.
    const demo = $('#t-demo');
    const other = isBuyer
      ? { 'menunggu-konfirmasi': ['dikonfirmasi', 'Penjual menerima pesanan'], dikonfirmasi: ['jadwal-cod', 'Penjual menyetujui jadwal'], 'jadwal-cod': ['bertemu', 'Kalian bertemu di titik COD'] }[s]
      : { 'jadwal-cod': ['bertemu', 'Pembeli datang ke titik COD'], bertemu: ['selesai', 'Pembeli konfirmasi barang diterima'] }[s];
    demo.hidden = !other;
    if (other) {
      demo.innerHTML = `${BBK.icon('info', 18)}<p>Mode demo: mainkan langkah ${isBuyer ? 'penjual' : 'pembeli'} berikutnya.</p>
        <button type="button" class="link-btn" data-act="demo" data-to="${other[0]}">${esc(other[1])} →</button>`;
    }
  }

  const point = () => BBK.getMeetingPoint(o.meetingPointId);
  const scheduleNote = () => `${point().name}, ${BBK.formatShortDate(o.scheduledAt)} ${BBK.formatTime(o.scheduledAt)}`;

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'cancel' || act === 'reject') {
      const ok = await BBK.confirm({
        title: act === 'cancel' ? 'Batalkan pesanan ini?' : 'Tolak pesanan ini?',
        text: act === 'cancel' ? 'Barang akan tersedia lagi untuk pembeli lain.' : `${otherUser.name} akan diberi tahu lewat chat.`,
        ok: act === 'cancel' ? 'Ya, batalkan' : 'Tolak',
        cancel: 'Kembali',
        danger: true,
      });
      if (!ok) return;
      BBK.setOrderStatus(o, 'dibatalkan', act === 'cancel' ? 'Dibatalkan pembeli' : 'Ditolak penjual');
      BBK.toast(act === 'cancel' ? 'Pesanan dibatalkan.' : 'Pesanan ditolak.');
    } else if (act === 'accept') {
      BBK.setOrderStatus(o, 'dikonfirmasi');
      BBK.toast('Pesanan diterima. Setujui jadwal COD-nya.');
    } else if (act === 'schedule') {
      BBK.setOrderStatus(o, 'jadwal-cod', scheduleNote());
      BBK.toast('Jadwal COD disepakati.');
    } else if (act === 'met') {
      BBK.setOrderStatus(o, 'bertemu');
      BBK.toast('Ditandai sudah bertemu.');
    } else if (act === 'received') {
      const ok = await BBK.confirm({
        title: 'Barang sudah diterima dan dicek?',
        text: 'Pastikan barang sesuai dan sudah dibayar tunai. Setelah ini transaksi selesai.',
        ok: 'Ya, selesai',
      });
      if (!ok) return;
      if (o.status === 'jadwal-cod') BBK.setOrderStatus(o, 'bertemu');
      BBK.setOrderStatus(o, 'selesai', isBuyer ? 'Pembeli konfirmasi barang diterima' : 'Penjual konfirmasi COD selesai');
      BBK.toast('Transaksi selesai. Terima kasih!');
    } else if (act === 'demo') {
      const to = b.dataset.to;
      BBK.setOrderStatus(o, to, to === 'jadwal-cod' ? scheduleNote() : to === 'selesai' ? 'Pembeli konfirmasi barang diterima' : undefined);
      BBK.toast(BBK.orderSteps.find((s) => s.status === to).long + '.');
    } else return;
    render();
    $('#t-banner').animate([{ transform: 'scale(0.98)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
  });

  /* ---------- Rating after a finished order (buyer) ---------- */
  function renderReview() {
    const box = $('#t-review');
    if (!isBuyer || o.status !== 'selesai') {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const r = o.reviewId && BBK.reviews.find((x) => x.id === o.reviewId);
    if (r) {
      box.innerHTML = `<h2 class="h2 track-card-title" id="review-title">Ulasanmu</h2>
        <p class="stars" aria-label="${r.rating} dari 5">${BBK.icon('star', 18).repeat(r.rating)}</p>
        <p class="review-text">${esc(r.text)}</p>`;
      return;
    }
    box.innerHTML = `<h2 class="h2 track-card-title" id="review-title">Beri rating ${esc(BBK.firstName(otherUser.name))}</h2>
      <form class="rate" id="rate-form">
        <fieldset><legend class="sr-only">Rating</legend><div class="rate-stars" id="rate-stars">
          ${[1, 2, 3, 4, 5].map((n) => `<label><input class="sr-only" type="radio" name="rating" value="${n}"${n === 5 ? ' checked' : ''}><span aria-hidden="true">${BBK.icon('star', 30)}</span><span class="sr-only">${n} bintang</span></label>`).join('')}
        </div></fieldset>
        <label class="sr-only" for="rate-text">Ulasan</label>
        <textarea class="textarea" id="rate-text" maxlength="240" placeholder="Barang sesuai? Penjualnya tepat waktu?"></textarea>
        <button class="btn" type="submit">Kirim ulasan</button>
      </form>`;
    const paint = () => {
      const v = Number(box.querySelector('input[name="rating"]:checked').value);
      box.querySelectorAll('.rate-stars label').forEach((l, i) => l.classList.toggle('is-on', i < v));
    };
    paint();
    box.querySelector('#rate-stars').addEventListener('change', paint);
    box.querySelector('#rate-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const review = {
        id: BBK.newId('r'),
        sellerId: o.sellerId,
        authorId: me.id,
        itemTitle: BBK.orderTitle(o),
        rating: Number(box.querySelector('input[name="rating"]:checked').value),
        text: box.querySelector('#rate-text').value.trim() || 'Transaksi lancar.',
        at: new Date().toISOString(),
      };
      BBK.save.review(review);
      o.reviewId = review.id;
      BBK.save.orders();
      BBK.toast('Terima kasih atas ulasanmu!');
      renderReview();
    });
  }

  render();
})();
