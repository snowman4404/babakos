/*
 * Atur COD (checkout.html?product=p1, or ?items=p1,p3,p14 for the buyer's own bundle from
 * one seller). Summary of the item(s), a free-text meeting place (suggestion chips and the
 * illustrated campus map only fill the input), a datetime-local COD time inside
 * BBK.codHours, a note, and the payment summary (cash at the COD). "Buat Pesanan" saves a
 * new order in BBK.store, marks the items as reserved, empties the seller's cart when the
 * order came from ?items, posts a message in the chat and opens lacak.html.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();

  /* ---------- Which items? ---------- */
  const itemsParam = BBK.param('items');
  const fromCart = itemsParam !== null;
  const ids = [...new Set((fromCart ? itemsParam.split(',') : [BBK.param('product')]).map((id) => String(id || '').trim()).filter(Boolean))];
  const found = ids.map(BBK.getProduct);
  const items = found.length && found.every(Boolean) ? found : [];
  const seller = items[0] && BBK.getUser(items[0].sellerId);
  const total = items.reduce((sum, p) => sum + p.price, 0);

  /* ---------- Can this be ordered? ---------- */
  const existing = items.length && BBK.orders.find((o) => o.buyerId === me.id && o.status !== 'dibatalkan' && o.productIds.some((id) => items.some((p) => p.id === id)));
  const problem = !items.length
    ? ['Barang tidak ditemukan', 'Tautannya mungkin salah. Pilih barang dari katalog.']
    : items.some((p) => p.sellerId !== seller.id)
      ? ['Barang dari penjual berbeda', 'Satu pesanan hanya untuk barang dari satu penjual, supaya cukup sekali COD.']
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
  $('.back-btn').href = fromCart ? `profil.html?id=${encodeURIComponent(seller.id)}` : `produk.html?id=${encodeURIComponent(items[0].id)}`;

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
  if (items.length > 1) $('#sum-title').textContent = `Ringkasan Barang (${items.length})`;
  $('#seller').innerHTML = `${BBK.avatar(seller, 'sm')}<div><p><strong>${esc(seller.name)}</strong> (${esc(BBK.cohortLabel(seller))})</p>
    <p class="caption verified">${BBK.icon('verified', 14)}Terverifikasi · Trust Score ${seller.trustScore}</p></div>`;

  /* ---------- Meeting place: a text input; chips and map pins only fill it in ---------- */
  const place = $('#place');
  const when = $('#when');
  $('#place-chips').innerHTML = BBK.meetingPoints.map((m) => `<button type="button" class="chip" data-point="${esc(m.id)}">${esc(m.shortName)}</button>`).join('');
  const renderMap = () => {
    const selected = BBK.meetingPoints.find((m) => m.name === place.value.trim());
    $('#map').innerHTML = BBK.campusMap({ selected: selected ? selected.id : '', interactive: true });
  };
  const fillPlace = (id) => {
    const m = BBK.meetingPoints.find((x) => x.id === id);
    if (!m) return;
    place.value = m.name;
    setError(place, '');
    renderMap();
    updateSummary();
  };
  $('#place-chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-point]');
    if (b) fillPlace(b.dataset.point);
  });
  $('#map').addEventListener('click', (e) => {
    const pin = e.target.closest('[data-point]');
    if (pin) fillPlace(pin.dataset.point);
  });
  renderMap();

  /* ---------- Date + time ---------- */
  when.min = BBK.toLocalInput(new Date());
  $('#when-hint').textContent = `COD bisa pukul ${BBK.codHours.open}–${BBK.codHours.close}. Penjual yang menyetujui jadwalnya.`;

  /* ---------- Validation ---------- */
  function setError(input, text) {
    const box = $(`#${input.id}-error`);
    box.textContent = text;
    box.hidden = !text;
    input.setAttribute('aria-invalid', String(!!text));
    return !text;
  }
  const checkPlace = () => setError(place, BBK.meetingPlaceError(place.value));
  const checkWhen = () => setError(when, BBK.codTimeError(when.value));
  place.addEventListener('blur', checkPlace);
  when.addEventListener('blur', checkWhen);
  place.addEventListener('input', () => {
    if (place.getAttribute('aria-invalid') === 'true') checkPlace();
    renderMap();
    updateSummary();
  });
  when.addEventListener('input', () => {
    if (when.getAttribute('aria-invalid') === 'true') checkWhen();
    updateSummary();
  });

  /* ---------- Payment summary ---------- */
  $('#pay').innerHTML = `
    <div><dt>Harga barang${items.length > 1 ? ` (${items.length})` : ''}</dt><dd>${BBK.formatRupiah(total)}</dd></div>
    <div class="kv-good"><dt>Biaya layanan</dt><dd>Gratis</dd></div>
    <div class="kv-total"><dt>Total biaya</dt><dd>${BBK.formatRupiah(total)}</dd></div>`;
  $('#bar-total').textContent = BBK.formatRupiah(total);
  function updateSummary() {
    const text = place.value.trim();
    const d = when.value && new Date(when.value);
    const valid = d && !Number.isNaN(d.getTime());
    $('#pay-summary').innerHTML =
      text || valid
        ? `${BBK.icon('calendar', 14)} ${valid ? esc(`${BBK.formatDate(d)}, ${BBK.formatTime(d)}`) : 'Jadwal belum dipilih'}${text ? ' · ' + esc(text) : ''}`
        : 'Isi titik temu dan jadwal COD dulu.';
  }
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
    const okPlace = checkPlace();
    const okWhen = checkWhen();
    if (!okPlace || !okWhen) {
      (okPlace ? when : place).focus();
      return;
    }
    const buttons = document.querySelectorAll('[type="submit"]');
    buttons.forEach((b) => {
      b.disabled = true;
      b.textContent = 'Membuat pesanan…';
    });
    const now = new Date().toISOString();
    const note = $('#note').value.trim();
    const order = {
      id: nextOrderId(),
      productIds: items.map((p) => p.id),
      buyerId: me.id,
      sellerId: seller.id,
      price: total,
      meetingPlace: place.value.trim(),
      scheduledAt: new Date(when.value).toISOString(),
      schedule: 'menunggu',
      status: 'menunggu-konfirmasi',
      createdAt: now,
      ...(note ? { note } : {}),
      timeline: [{ status: 'menunggu-konfirmasi', at: now }],
    };
    BBK.orders.unshift(order);
    BBK.save.orders();
    BBK.save.productStatus(order.productIds, 'dipesan');
    if (fromCart) BBK.cart.clear(seller.id);

    // Tell the seller in the chat (the product card is attached automatically).
    let thread = BBK.threadForProduct(items[0].id, me.id);
    if (!thread) {
      thread = { id: BBK.newId('c'), productId: items[0].id, buyerId: me.id, sellerId: seller.id, unread: 0, messages: [] };
      BBK.chatThreads.unshift(thread);
    }
    // Every item is named in the text; chat.js attaches one product card (the first item).
    const what = items.length > 1 ? `${items.length} barang: ${items.map((p) => p.title).join(', ')}` : items[0].title;
    thread.messages.push({
      id: BBK.newId('m'),
      senderId: me.id,
      text: `Halo kak, aku pesan ${what}. COD di ${order.meetingPlace}, ${BBK.formatShortDate(order.scheduledAt)} pukul ${BBK.formatTime(order.scheduledAt)} ya.`,
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
