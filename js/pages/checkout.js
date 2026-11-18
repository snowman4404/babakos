/*
 * Atur COD (checkout.html?product=p1 or ?bundle=b1). Summary of the item(s), the
 * illustrated campus map with safe meeting points, date + time, a note, and the
 * payment summary (cash at the COD). "Buat Pesanan" saves a new order in BBK.store,
 * marks the items as reserved, posts a message in the chat and opens lacak.html.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();

  const bundle = BBK.getBundle(BBK.param('bundle'));
  const single = BBK.getProduct(BBK.param('product'));
  const items = bundle ? BBK.bundleInfo(bundle).items : single ? [single] : [];
  const seller = items[0] && BBK.getUser(items[0].sellerId);
  const normal = items.reduce((sum, p) => sum + p.price, 0);
  const total = bundle ? bundle.price : normal;

  /* ---------- Can this be ordered? ---------- */
  const existing = items.length && BBK.orders.find((o) => o.buyerId === me.id && o.status !== 'dibatalkan' && o.productIds.some((id) => items.some((p) => p.id === id)));
  const problem = !items.length
    ? ['Barang tidak ditemukan', 'Tautannya mungkin salah. Pilih barang dari katalog.']
    : seller.id === me.id
      ? ['Ini barangmu sendiri', 'Kamu tidak bisa memesan barang yang kamu jual.']
      : existing
        ? ['Sudah kamu pesan', `Pesanan ${existing.id} sedang berjalan.`]
        : items.some((p) => p.status !== 'tersedia')
          ? ['Sudah dipesan orang lain', 'Barang ini baru saja dipesan atau terjual. Coba barang serupa.']
          : null;
  if (problem) {
    $('#checkout-form').hidden = true;
    $('#checkout-bar').hidden = true;
    $('#unavailable').hidden = false;
    $('#unavailable-title').textContent = problem[0];
    $('#unavailable-text').textContent = problem[1];
    if (existing) {
      const a = $('#unavailable .btn');
      a.href = `lacak.html?id=${encodeURIComponent(existing.id)}`;
      a.textContent = 'Lacak pesanan';
    }
    return;
  }
  document.body.classList.add('has-actionbar');
  $('.back-btn').href = bundle ? 'index.html' : `produk.html?id=${encodeURIComponent(single.id)}`;

  /* ---------- Summary ---------- */
  $('#items').innerHTML = items
    .map(
      (p) => `<li class="order-item">
        <img src="${esc(BBK.productImage(p))}" alt="" width="72" height="72">
        <div><p class="order-item-title">${esc(p.title)}</p><p class="caption">${esc(BBK.conditionLabels[p.condition])} · ${esc(BBK.areaShortName(p.areaId))}</p></div>
        <p class="order-item-price">${BBK.formatRupiah(p.price)}</p>
      </li>`,
    )
    .join('');
  if (bundle) $('#sum-title').textContent = `${bundle.title} (${items.length} barang)`;
  $('#seller').innerHTML = `${BBK.avatar(seller, 'sm')}<div><p><strong>${esc(seller.name)}</strong> (${esc(BBK.cohortLabel(seller))})</p>
    <p class="caption verified">${BBK.icon('verified', 14)}Terverifikasi · Trust Score ${seller.trustScore}</p></div>`;

  /* ---------- Meeting point: map + list, kept in sync ---------- */
  const myArea = BBK.getArea(me.areaId) ? me.areaId : items[0].areaId;
  const recommended = BBK.nearestMeetingPoint(items[0].areaId, myArea);
  let point = recommended.id;
  const kmFor = (m) => BBK.areaDistance(myArea, m.areaId);
  // Recommended first (closest for both sides), then by walking distance from the buyer.
  const pointsByDistance = BBK.meetingPoints.slice().sort((a, b) => (b.id === recommended.id) - (a.id === recommended.id) || kmFor(a) - kmFor(b));

  $('#points').insertAdjacentHTML(
    'beforeend',
    pointsByDistance
      .map(
        (m) => `<label class="point">
          <input type="radio" name="point" value="${esc(m.id)}"${m.id === point ? ' checked' : ''}>
          <span class="point-body">
            <span class="point-name">${esc(m.name)}${m.id === recommended.id ? ' <span class="tag tag-green">Rekomendasi untuk kalian berdua</span>' : ''}</span>
            <span class="caption">${esc(m.description)} · ${BBK.walkMinutes(kmFor(m))} menit jalan dari kostmu</span>
          </span>
        </label>`,
      )
      .join(''),
  );
  const renderMap = () => ($('#map').innerHTML = BBK.campusMap({ selected: point, interactive: true, recommended: recommended.id }));
  const choosePoint = (id) => {
    point = id;
    $('#points').querySelector(`input[value="${id}"]`).checked = true;
    renderMap();
    updateSummary();
  };
  $('#map').addEventListener('click', (e) => {
    const pin = e.target.closest('[data-point]');
    if (pin) choosePoint(pin.dataset.point);
  });
  $('#points').addEventListener('change', (e) => choosePoint(e.target.value));

  /* ---------- Date + time ---------- */
  const TIMES = ['08.00', '10.00', '12.30', '15.00', '16.30', '19.00'];
  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
  const dayNum = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  let dayIdx = 0;
  let time = '12.30';
  $('#dates').innerHTML = days
    .map(
      (d, i) => `<button type="button" class="date-chip" data-i="${i}" aria-pressed="${i === dayIdx}">
        <span>${i === 0 ? 'Besok' : esc(dayName.format(d))}</span><strong>${esc(dayNum.format(d))}</strong></button>`,
    )
    .join('');
  $('#times').innerHTML = TIMES.map((t) => `<button type="button" class="chip" data-t="${t}" aria-pressed="${t === time}">${t}</button>`).join('');
  $('#hours-hint').textContent = `COD bisa pukul ${BBK.codHours.open}–${BBK.codHours.close} di semua titik.`;
  $('#dates').addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    dayIdx = Number(b.dataset.i);
    $('#dates').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    updateSummary();
  });
  $('#times').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    time = b.dataset.t;
    $('#times').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    updateSummary();
  });
  const scheduled = () => {
    const d = new Date(days[dayIdx]);
    const [h, m] = time.split('.').map(Number);
    d.setHours(h, m);
    return d;
  };

  /* ---------- Payment summary ---------- */
  $('#pay').innerHTML = `
    <div><dt>Harga barang${items.length > 1 ? ` (${items.length})` : ''}</dt><dd>${BBK.formatRupiah(normal)}</dd></div>
    ${bundle ? `<div class="kv-good"><dt>Hemat paket</dt><dd>– ${BBK.formatRupiah(normal - total)}</dd></div>` : ''}
    <div class="kv-good"><dt>Biaya layanan</dt><dd>Gratis</dd></div>
    <div class="kv-total"><dt>Total biaya</dt><dd>${BBK.formatRupiah(total)}</dd></div>`;
  $('#bar-total').textContent = BBK.formatRupiah(total);
  function updateSummary() {
    const m = BBK.getMeetingPoint(point);
    $('#pay-summary').innerHTML = `${BBK.icon('calendar', 14)} ${esc(BBK.formatDate(scheduled()))}, ${esc(time)} · ${esc(m.shortName)}`;
  }
  renderMap();
  updateSummary();

  /* ---------- Create the order ---------- */
  function nextOrderId() {
    const now = new Date();
    const prefix = `BBK-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-`;
    const max = BBK.orders.reduce((n, o) => Math.max(n, Number(o.id.split('-')[2]) || 0), 0);
    return prefix + String(max + 1).padStart(3, '0');
  }

  $('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const buttons = document.querySelectorAll('[type="submit"]');
    buttons.forEach((b) => {
      b.disabled = true;
      b.textContent = 'Membuat pesanan…';
    });
    const now = new Date().toISOString();
    const m = BBK.getMeetingPoint(point);
    const note = $('#note').value.trim();
    const order = {
      id: nextOrderId(),
      productIds: items.map((p) => p.id),
      ...(bundle ? { bundleId: bundle.id } : {}),
      buyerId: me.id,
      sellerId: seller.id,
      price: total,
      meetingPointId: point,
      scheduledAt: scheduled().toISOString(),
      status: 'menunggu-konfirmasi',
      createdAt: now,
      ...(note ? { note } : {}),
      timeline: [{ status: 'menunggu-konfirmasi', at: now }],
    };
    BBK.orders.unshift(order);
    BBK.save.orders();
    BBK.save.productStatus(order.productIds, 'dipesan');

    // Tell the seller in the chat (the product card is attached automatically).
    let thread = BBK.threadForProduct(items[0].id, me.id);
    if (!thread) {
      thread = { id: BBK.newId('c'), productId: items[0].id, buyerId: me.id, sellerId: seller.id, unread: 0, messages: [] };
      BBK.chatThreads.unshift(thread);
    }
    thread.messages.push({
      id: BBK.newId('m'),
      senderId: me.id,
      text: `Halo kak, saya sudah pesan ${BBK.orderTitle(order)}. COD di ${m.shortName}, ${BBK.formatShortDate(order.scheduledAt)} pukul ${time} ya.`,
      sentAt: now,
      attachedProductId: items[0].id,
    });
    BBK.save.chats();

    setTimeout(() => {
      BBK.flash('Pesanan dibuat. Menunggu konfirmasi penjual.');
      location.href = `lacak.html?id=${encodeURIComponent(order.id)}`;
    }, 500);
  });
})();
