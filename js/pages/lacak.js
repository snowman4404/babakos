/*
 * Lacak Pesanan (lacak.html?id=BBK-2611-001), from the Figma "Pesanan Saya" frame.
 * Status stepper Menunggu → Dikonfirmasi → Jadwal COD → Bertemu → Selesai, schedule,
 * meeting place, payment summary. Actions depend on the role:
 * - buyer: cancel, confirm receipt (then rate the seller), and change the COD place/time
 *   with the pencil buttons (the seller must approve the new schedule again);
 * - seller: accept/reject the order, approve or reject the schedule (rejecting a schedule
 *   never cancels the order), mark the meeting.
 * Once the seller approves the schedule (jadwal-cod onward) it is final: nobody can cancel
 * the order, the buyer cannot edit the place/time, and the seller cannot reject the schedule.
 * The COD date the buyer picks must be within 7 days of the order date (BBK.codWhenProblem); the
 * time is free but cannot be past on today. When that window has already passed the pencil
 * buttons are hidden (BBK.canEditSchedule). Every action first re-reads the order from storage,
 * so a stale tab cannot cancel or edit an order the seller agreed to in another tab.
 * A demo button plays the other side so the whole flow can be shown alone.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();
  let o = BBK.getOrder(BBK.param('id')); // replaced by a fresh copy from storage before every action (see syncOrder)

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
  const SHOWS_SCHEDULE_STATE = ['menunggu-konfirmasi', 'dikonfirmasi', 'jadwal-cod']; // statuses that show the schedule approval state
  const SCHEDULE_LABEL = { menunggu: 'Menunggu persetujuan penjual', disetujui: 'Disetujui penjual', ditolak: 'Ditolak penjual' };
  let editing = null; // 'when' | 'place' | null (buyer's inline form)
  let rejecting = false; // seller's inline "reason" form for Tolak Jadwal COD
  let shownStatus = o.status; // status the page was last rendered with, to spot changes made in another tab

  function render() {
    const idx = BBK.stepIndex(o.status);
    const progress = BBK.stepProgress(o);
    const done = o.status === 'selesai';
    const cancelled = o.status === 'dibatalkan';

    /* Head */
    $('#t-name').textContent = `Pesanan ${BBK.orderTitle(o)}`;
    $('#t-created').textContent = `${o.id} · Dibuat pada ${BBK.formatDate(o.createdAt)}`;
    $('#t-pill').innerHTML = BBK.statusPill(o.status);

    /* Items: every item of the order */
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
    renderScheduleNote();
    $('#t-steps').innerHTML = BBK.orderSteps
      .map((s, i) => {
        // stepEntry is empty for steps the order has not reached, so they show no time or note.
        const at = BBK.stepEntry(o, s.status);
        const state = cancelled ? (i <= progress ? 'done' : 'off') : i < idx || done ? 'done' : i === idx ? 'now' : 'off';
        const shown = state !== 'off' && at;
        return `<li class="step is-${state}"${state === 'now' ? ' aria-current="step"' : ''}>
          <span class="step-dot">${BBK.icon(state === 'done' ? 'check' : STEP_ICONS[i], 16)}</span>
          <span class="step-text"><span class="step-label">${esc(s.label)}</span>
          <span class="caption">${shown ? esc(BBK.formatDateTime(at.at)) + (at.note ? ' · ' + esc(at.note) : '') : '&nbsp;'}</span></span>
        </li>`;
      })
      .join('');
    const cancelEntry = BBK.stepEntry(o, 'dibatalkan');
    const live = SHOWS_SCHEDULE_STATE.includes(o.status);
    $('#t-status-kv').innerHTML = `
      <div><dt>Status pesanan</dt><dd class="status-text is-${BBK.statusTone(o.status)}">${esc(BBK.statusLabel(o.status))}</dd></div>
      ${live ? `<div><dt>Jadwal dan lokasi COD</dt><dd>${esc(SCHEDULE_LABEL[o.schedule] || SCHEDULE_LABEL.menunggu)}</dd></div>` : ''}
      ${live && o.schedule === 'ditolak' && o.scheduleReason ? `<div><dt>Alasan penjual</dt><dd>${esc(o.scheduleReason)}</dd></div>` : ''}
      <div><dt>Metode pembayaran</dt><dd>Tunai saat COD</dd></div>
      <div><dt>Total biaya</dt><dd>${BBK.formatRupiah(o.price)}</dd></div>
      ${o.note ? `<div><dt>Catatan pembeli</dt><dd>${esc(o.note)}</dd></div>` : ''}
      ${cancelEntry && cancelEntry.note ? `<div><dt>Alasan batal</dt><dd>${esc(cancelEntry.note)}</dd></div>` : ''}`;

    renderActions(idx);
    renderReview();

    /* Schedule + place (the buyer can edit both while the order is still open) */
    const confirmed = BBK.stepEntry(o, 'dikonfirmasi');
    const finished = BBK.stepEntry(o, 'selesai');
    const canEdit = isBuyer && BBK.canEditSchedule(o);
    const pencil = (field, label) =>
      canEdit && editing !== field
        ? `<button type="button" class="icon-btn icon-btn-soft edit-btn" data-act="edit" data-field="${field}" aria-label="${label}" title="${label}">${BBK.icon('pencil', 16)}</button>`
        : '';
    const dateLimit = BBK.codDateWindow(o.createdAt);
    const whenValue = editing === 'when'
      ? editForm('when', `<div class="when-pair">
            <input class="input" id="e-when-date" name="date" type="date" required aria-label="Tanggal COD" min="${esc(dateLimit.min)}" max="${esc(dateLimit.max)}" value="${esc(BBK.toDateInput(o.scheduledAt))}" aria-describedby="e-hint e-error">
            <input class="input" id="e-when-time" name="time" type="time" required aria-label="Jam COD" value="${esc(BBK.toTimeInput(o.scheduledAt))}" aria-describedby="e-hint e-error"></div>`,
          BBK.codDateHint(o.createdAt))
      : `<span>${esc(BBK.formatDate(o.scheduledAt))}, ${esc(BBK.formatTime(o.scheduledAt))}</span>`;
    $('#t-when').innerHTML = `
      <li><span class="caption">Tanggal pemesanan</span><span>${esc(BBK.formatDate(o.createdAt))}</span></li>
      <li><span class="when-head"><span class="caption">Jadwal COD</span>${pencil('when', 'Ubah jadwal COD')}</span>${whenValue}</li>
      <li><span class="caption">${finished ? 'Selesai' : 'Dikonfirmasi penjual'}</span><span>${finished ? esc(BBK.formatDateTime(finished.at)) : confirmed ? esc(BBK.formatDateTime(confirmed.at)) : 'Belum'}</span></li>`;
    const buyer = BBK.getUser(o.buyerId);
    const placeValue = editing === 'place'
      ? editForm('place', `<input class="input" id="e-place" type="text" aria-label="Titik temu baru" required maxlength="100" autocomplete="off" placeholder="Contoh: Lobi perpustakaan kampus, depan masjid kampus" value="${esc(o.meetingPlace)}" aria-describedby="e-error">`)
      : `<p>${esc(o.meetingPlace)}</p>`;
    $('#t-where').innerHTML = `
      <li><span class="where-dot is-to"></span><div><p class="where-label">Bertemu di ${pencil('place', 'Ubah lokasi COD')}</p>
        ${placeValue}<p class="caption">${esc(buyer.name)} — ${esc(buyer.email)}</p></div></li>`;
    const field = editing && $(editing === 'when' ? '#e-when-date' : '#e-place');
    if (field) field.focus();
    shownStatus = o.status;

    /* Payment: every item, then the total */
    $('#t-pay').innerHTML = `
      ${items.length > 1
        ? items.map((p) => `<div><dt>${esc(p.title)}</dt><dd>${BBK.formatRupiah(p.price)}</dd></div>`).join('')
        : `<div><dt>Biaya produk</dt><dd>${BBK.formatRupiah(o.price)}</dd></div>`}
      <div class="kv-good"><dt>Biaya layanan</dt><dd>Gratis</dd></div>
      <div class="kv-total"><dt>Total biaya${items.length > 1 ? ` (${items.length} barang)` : ''}</dt><dd>${BBK.formatRupiah(o.price)}</dd></div>
      <div><dt>Metode pembayaran</dt><dd>Tunai saat COD</dd></div>`;
  }

  /** Inline mini form used by the buyer's pencil buttons (date + time inputs, or a text input, + Simpan/Batal). */
  function editForm(field, inputHtml, hint = '') {
    return `<form class="mini-form" data-form="${field}" novalidate>
      ${inputHtml}
      ${hint ? `<p class="field-hint" id="e-hint">${esc(hint)}</p>` : ''}
      <p class="field-error" id="e-error" hidden></p>
      <div class="mini-form-actions"><button type="submit" class="btn btn-sm">Simpan</button><button type="button" class="btn btn-sm btn-outline" data-act="edit-cancel">Batal</button></div>
    </form>`;
  }

  /* ---------- Notice about the schedule approval (both roles) ---------- */
  function renderScheduleNote() {
    const box = $('#t-schedule-note');
    const s = o.status;
    const changed = o.timeline.some((t) => t.event);
    let tone = '';
    let text = '';
    if (isBuyer && !BBK.isScheduleLocked(o) && !BBK.canEditSchedule(o)) {
      tone = 'is-pending';
      text = 'Batas ubah jadwal 7 hari sudah lewat. Hubungi penjual lewat chat atau batalkan pesanan.';
    } else if (s === 'jadwal-cod' || s === 'bertemu') {
      tone = 'is-agreed';
      text = 'Jadwal dan lokasi COD sudah disepakati dan tidak bisa diubah. Pesanan tidak bisa dibatalkan.';
    } else if (s === 'dikonfirmasi' || (s === 'menunggu-konfirmasi' && changed)) {
      if (o.schedule === 'ditolak') {
        tone = 'is-rejected';
        text = isBuyer
          ? `Penjual menolak jadwal COD${o.scheduleReason ? ` ("${o.scheduleReason}")` : ''}. Ubah jadwal atau lokasi dengan ikon pensil di bawah.`
          : `Kamu menolak jadwal COD${o.scheduleReason ? ` ("${o.scheduleReason}")` : ''}. Menunggu pembeli mengubah jadwal atau lokasi COD. Pesanan tidak dibatalkan.`;
      } else if (o.schedule === 'menunggu') {
        tone = 'is-pending';
        text = isBuyer
          ? 'Menunggu persetujuan penjual atas jadwal dan lokasi COD.'
          : `${BBK.firstName(otherUser.name)} mengajukan jadwal dan lokasi COD. Setujui atau tolak jadwalnya.`;
      }
    }
    box.hidden = !text;
    box.className = `schedule-note ${tone}`;
    box.innerHTML = text ? `${BBK.icon('info', 18)}<p>${esc(text)}</p>` : '';
  }

  /* ---------- Actions per role and status ---------- */
  function renderActions(idx) {
    const s = o.status;
    const chat = `<a class="btn btn-outline" href="${chatHref}">${BBK.icon('chat-dots', 20)}Chat ${isBuyer ? 'penjual' : 'pembeli'}</a>`;
    const rejectSchedule = `<button type="button" class="btn btn-danger-soft" data-act="schedule-reject">Tolak Jadwal COD</button>`;
    let html = '';
    if (s === 'dibatalkan') html = `<a class="btn" href="jelajah.html">Cari barang lain</a>`;
    else if (isBuyer) {
      if (s === 'jadwal-cod' || s === 'bertemu') html = `${chat}<button type="button" class="btn" data-act="received">Konfirmasi Barang Diterima</button>`;
      else if (s === 'selesai') html = `${chat}<a class="btn" href="jelajah.html">Belanja lagi</a>`;
      else html = chat;
      if (BBK.OPEN_STATUSES.includes(s)) html += `<button type="button" class="btn btn-danger-soft" data-act="cancel">Batalkan pesanan</button>`;
    } else {
      if (s === 'menunggu-konfirmasi') html = `<button type="button" class="btn btn-danger-soft" data-act="reject">Tolak Pesanan</button><button type="button" class="btn" data-act="accept">Terima Pesanan</button>`;
      else if (s === 'dikonfirmasi') {
        // After a rejection the note above already says the seller is waiting for the buyer.
        html = o.schedule === 'ditolak'
          ? chat
          : `${chat}${rejectSchedule}<button type="button" class="btn" data-act="schedule">Setujui Jadwal COD</button>`;
      }
      else if (s === 'jadwal-cod') html = `${chat}<button type="button" class="btn" data-act="met">Tandai Sudah Bertemu</button>`;
      else if (s === 'bertemu') html = `${chat}<button type="button" class="btn" data-act="received">${BBK.icon('check', 18)}Konfirmasi Selesai COD</button>`;
      else html = chat;
    }
    // Seller is rejecting the schedule: ask for an optional reason first.
    if (rejecting && !isBuyer && s === 'dikonfirmasi') {
      html = `<form class="mini-form reject-form" id="reject-form">
        <label class="field-label" for="reject-reason">Alasan menolak jadwal <span class="muted">(opsional)</span></label>
        <textarea class="textarea" id="reject-reason" maxlength="160" placeholder="Mis. aku ada kuliah jam segitu, bisa besok sore?"></textarea>
        <p class="field-hint">Pesanan tidak dibatalkan. Pembeli diminta mengubah jadwal atau lokasi.</p>
        <div class="mini-form-actions"><button type="submit" class="btn btn-danger-soft">Tolak Jadwal COD</button><button type="button" class="btn btn-outline" data-act="reject-cancel">Batal</button></div>
      </form>`;
    }
    $('#t-actions').innerHTML = html;

    // Demo: play the other side's next step(s).
    const demo = $('#t-demo');
    const steps = [];
    if (isBuyer) {
      if (s === 'menunggu-konfirmasi') steps.push(['dikonfirmasi', 'Penjual menerima pesanan']);
      else if (s === 'dikonfirmasi' && o.schedule !== 'ditolak') steps.push(['jadwal-cod', 'Penjual menyetujui jadwal'], ['schedule-reject', 'Penjual menolak jadwal']);
      else if (s === 'jadwal-cod') steps.push(['bertemu', 'Kalian bertemu di titik COD']);
    } else if (s === 'dikonfirmasi' && o.schedule === 'ditolak' && BBK.canEditSchedule(o)) steps.push(['schedule-change', 'Pembeli mengubah jadwal']);
    else if (s === 'jadwal-cod') steps.push(['bertemu', 'Pembeli datang ke titik COD']);
    else if (s === 'bertemu') steps.push(['selesai', 'Pembeli konfirmasi barang diterima']);
    demo.hidden = !steps.length;
    if (steps.length) {
      demo.innerHTML = `${BBK.icon('info', 18)}<p>Mode demo: mainkan langkah ${isBuyer ? 'penjual' : 'pembeli'} berikutnya.</p>
        ${steps.map(([to, label]) => `<button type="button" class="link-btn" data-act="demo" data-to="${to}">${esc(label)} →</button>`).join('')}`;
    }
  }

  const scheduleNote = () => `${o.meetingPlace}, ${BBK.formatShortDate(o.scheduledAt)} ${BBK.formatTime(o.scheduledAt)}`;

  /**
   * Re-read the order from storage before acting on it: another tab may have changed it since this
   * page was drawn. Returns true when it is safe to go on. Otherwise the page is redrawn with a
   * toast (agreedText when the seller has agreed in the meantime, a general note for any other
   * change) and false is returned, so the stale action is never applied.
   */
  function syncOrder(agreedText = '') {
    o = BBK.reloadOrder(o.id) || o;
    const agreed = !!agreedText && BBK.AGREED_STATUSES.includes(o.status);
    if (!agreed && o.status === shownStatus) return true;
    rejecting = false;
    editing = null;
    BBK.toast(agreed ? agreedText : 'Pesanan sudah berubah di tab lain. Tampilan diperbarui.');
    render();
    return false;
  }

  const CONFIRMS = {
    cancel: { title: 'Batalkan pesanan ini?', text: 'Barang akan tersedia lagi untuk pembeli lain.', ok: 'Ya, batalkan', cancel: 'Kembali', danger: true },
    reject: { title: 'Tolak pesanan ini?', text: `${otherUser.name} akan diberi tahu lewat chat.`, ok: 'Tolak', cancel: 'Kembali', danger: true },
    received: { title: 'Barang sudah diterima dan dicek?', text: 'Pastikan barang sesuai dan sudah dibayar tunai. Setelah ini transaksi selesai.', ok: 'Ya, selesai' },
  };
  const AGREED_TEXT = { cancel: 'Pesanan sudah disepakati, tidak bisa dibatalkan.', edit: 'Pesanan sudah disepakati, tidak bisa diubah.' };
  const ACTIONS = ['cancel', 'reject', 'accept', 'schedule', 'schedule-reject', 'edit', 'met', 'received', 'demo'];

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'reject-cancel') {
      rejecting = false;
      render();
      return;
    }
    if (act === 'edit-cancel') {
      editing = null;
      render();
      return;
    }
    if (!ACTIONS.includes(act)) return;
    if (CONFIRMS[act] && !(await BBK.confirm(CONFIRMS[act]))) return;
    if (!syncOrder(AGREED_TEXT[act])) return;

    if (act === 'cancel' || act === 'reject') {
      BBK.setOrderStatus(o, 'dibatalkan', act === 'cancel' ? 'Dibatalkan pembeli' : 'Ditolak penjual');
      BBK.toast(act === 'cancel' ? 'Pesanan dibatalkan.' : 'Pesanan ditolak.');
    } else if (act === 'accept') {
      BBK.setOrderStatus(o, 'dikonfirmasi');
      BBK.toast('Pesanan diterima. Setujui jadwal COD-nya.');
    } else if (act === 'schedule') {
      BBK.setOrderStatus(o, 'jadwal-cod', scheduleNote());
      BBK.toast('Jadwal COD disetujui.');
    } else if (act === 'schedule-reject') {
      rejecting = true; // opens the reason form
      render();
      const field = $('#reject-reason');
      if (field) field.focus();
      return;
    } else if (act === 'edit') {
      editing = b.dataset.field;
      render();
      return;
    } else if (act === 'met') {
      BBK.setOrderStatus(o, 'bertemu');
      BBK.toast('Ditandai sudah bertemu.');
    } else if (act === 'received') {
      if (o.status === 'jadwal-cod') BBK.setOrderStatus(o, 'bertemu');
      BBK.setOrderStatus(o, 'selesai', isBuyer ? 'Pembeli konfirmasi barang diterima' : 'Penjual konfirmasi COD selesai');
      BBK.toast('Transaksi selesai. Terima kasih!');
    } else if (act === 'demo') {
      const to = b.dataset.to;
      if (to === 'schedule-reject') {
        if (BBK.rejectSchedule(o, 'Jadwal bentrok dengan kuliah')) BBK.toast('Penjual menolak jadwal COD.');
      } else if (to === 'schedule-change') {
        // Next day at the same time of day, kept inside the allowed date window; approval starts over.
        const { min, max } = BBK.codDateWindow(o.createdAt);
        let day = BBK.toDateInput(new Date(o.scheduledAt).getTime() + 24 * 3600e3);
        if (day > max) day = max;
        if (day < min) day = min;
        BBK.changeSchedule(o, { scheduledAt: BBK.codWhenISO(day, BBK.toTimeInput(o.scheduledAt)) });
        BBK.toast('Pembeli mengubah jadwal COD.');
      } else {
        BBK.setOrderStatus(o, to, to === 'jadwal-cod' ? scheduleNote() : to === 'selesai' ? 'Pembeli konfirmasi barang diterima' : undefined);
        BBK.toast(BBK.orderSteps.find((s) => s.status === to).long + '.');
      }
    }
    rejecting = false;
    editing = null;
    render();
    $('#t-banner').animate([{ transform: 'scale(0.98)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
  });

  /* ---------- Inline forms: buyer edit (place/time) and seller rejection reason ---------- */
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.id === 'reject-form') {
      e.preventDefault();
      if (!syncOrder('Jadwal COD sudah disepakati dan tidak bisa ditolak.')) return;
      BBK.rejectSchedule(o, $('#reject-reason').value.trim());
      BBK.toast('Jadwal COD ditolak. Pembeli diminta mengubahnya.');
      rejecting = false;
      render();
      return;
    }
    if (!form.dataset.form) return;
    e.preventDefault();
    const field = form.dataset.form;
    const [input, timeInput] = form.querySelectorAll('input');
    // The date must be inside the window (today .. 7 days after the order was made); the time is free but not past on today.
    let fieldError = null; // { input, message } of the first problem
    if (field === 'when') {
      const problem = BBK.codWhenProblem(input.value, timeInput.value, o.createdAt);
      if (problem) fieldError = { input: problem.field === 'time' ? timeInput : input, message: problem.message };
    } else {
      const message = BBK.meetingPlaceError(input.value);
      if (message) fieldError = { input, message };
    }
    if (fieldError) {
      const error = form.querySelector('.field-error');
      error.textContent = fieldError.message;
      error.hidden = false;
      form.querySelectorAll('input').forEach((el) => el.setAttribute('aria-invalid', String(el === fieldError.input)));
      fieldError.input.focus();
      return;
    }
    if (!syncOrder(AGREED_TEXT.edit)) return;
    BBK.changeSchedule(o, field === 'when' ? { scheduledAt: BBK.codWhenISO(input.value, timeInput.value) } : { meetingPlace: input.value.trim() });
    BBK.toast('Diubah. Menunggu persetujuan penjual.');
    editing = null;
    render();
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
