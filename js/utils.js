/*
 * Shared helpers: formatting, lookups, demo persistence, mock auth.
 * Requires js/data.js to be loaded first.
 */
(function () {
  /* ---------- Formatting ---------- */
  const fmt = (opts) => new Intl.DateTimeFormat('id-ID', opts);
  const longDate = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const shortDate = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
  const dayMonth = fmt({ day: 'numeric', month: 'long' });
  const clock = fmt({ hour: '2-digit', minute: '2-digit' });

  /** 85000 -> "Rp85.000" (built by hand: Intl's currency style inserts a non-breaking space some fonts render oddly). */
  BBK.formatRupiah = (value) => 'Rp' + Number(value).toLocaleString('id-ID');
  /** "Rabu, 23 September 2026" */
  BBK.formatDate = (iso) => longDate.format(new Date(iso));
  /** "Rab, 23 Sep" */
  BBK.formatShortDate = (iso) => shortDate.format(new Date(iso));
  /** "23 September" */
  BBK.formatDayMonth = (iso) => dayMonth.format(new Date(iso));
  /** "12.30" */
  BBK.formatTime = (iso) => clock.format(new Date(iso)).replace(':', '.');
  /** "Rab, 23 Sep · 12.30" */
  BBK.formatDateTime = (iso) => `${BBK.formatShortDate(iso)} · ${BBK.formatTime(iso)}`;
  /** 0.5 -> "0,5" */
  BBK.formatKm = (km) => String(Math.round(km * 10) / 10).replace('.', ',');
  /** "5 menit yang lalu", "2 jam yang lalu", "3 hari yang lalu", else the date. */
  BBK.timeAgo = (iso) => {
    const min = Math.round((Date.now() - new Date(iso)) / 60000);
    if (min < 1) return 'Baru saja';
    if (min < 60) return `${min} menit yang lalu`;
    if (min < 60 * 24) return `${Math.round(min / 60)} jam yang lalu`;
    if (min < 60 * 24 * 7) return `${Math.round(min / 1440)} hari yang lalu`;
    return BBK.formatDayMonth(iso);
  };

  /** "Rizky Pratama" -> "RP" */
  BBK.initials = (name) =>
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  BBK.firstName = (name) => String(name).split(' ')[0];
  /** "FEB '22" */
  BBK.cohortLabel = (u) => `${u.facultyShort || ''} '${String(u.cohort || '').slice(-2)}`.trim();
  BBK.trustLabel = (score) => (score >= 90 ? 'Sangat baik' : score >= 75 ? 'Baik' : 'Cukup');
  /** "rizky@student.ub.ac.id" -> "r****@student.ub.ac.id" */
  BBK.maskEmail = (email) => String(email).replace(/^(.)[^@]*/, (m, first) => first + '*'.repeat(Math.max(3, m.length - 1)));

  /** Mock campus-email check: any Indonesian academic domain (…ac.id). */
  BBK.isCampusEmail = (email) => /^[^\s@]+@([a-z0-9-]+\.)*ac\.id$/i.test(String(email).trim());

  /** Read a URL query parameter, e.g. produk.html?id=p1 -> BBK.param('id') === 'p1' */
  BBK.param = (name) => new URLSearchParams(location.search).get(name);

  /** Escape user-provided text before putting it into innerHTML. */
  BBK.escape = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /* ---------- Storage (fails soft: private mode etc. still renders from seed data) ---------- */
  const PREFIX = 'babakos:';
  BBK.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch {
        return false; // storage full or unavailable
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(PREFIX + key);
      } catch {
        /* ignore */
      }
    },
  };

  /*
   * Demo state. Pages are separate HTML files, so whatever changes during a demo
   * (orders, chats, new listings, item status, reviews) is saved here and merged over
   * the seed in data.js on every page load. BBK.resetDemo() goes back to the seed.
   */
  BBK.products = [...BBK.store.get('listings', []), ...BBK.products];
  const statusOverrides = BBK.store.get('productStatus', {});
  BBK.products.forEach((p) => {
    if (statusOverrides[p.id]) p.status = statusOverrides[p.id];
  });
  BBK.orders = BBK.store.get('orders', BBK.orders);
  BBK.chatThreads = BBK.store.get('chats', BBK.chatThreads);
  BBK.reviews = [...BBK.store.get('reviews', []), ...BBK.reviews];

  BBK.save = {
    orders: () => BBK.store.set('orders', BBK.orders),
    chats: () => BBK.store.set('chats', BBK.chatThreads),
    /** New listing from jual.html; returns false when storage is full (big photo). */
    listing(p) {
      const listings = BBK.store.get('listings', []);
      listings.unshift(p);
      if (!BBK.store.set('listings', listings)) return false;
      BBK.products.unshift(p);
      return true;
    },
    productStatus(ids, status) {
      const map = BBK.store.get('productStatus', {});
      [].concat(ids).forEach((id) => {
        map[id] = status;
        const p = BBK.getProduct(id);
        if (p) p.status = status;
      });
      BBK.store.set('productStatus', map);
    },
    review(r) {
      BBK.store.set('reviews', [r, ...BBK.store.get('reviews', [])]);
      BBK.reviews.unshift(r);
    },
    /** Per-seller cart, { sellerId: [productId, …] } (see BBK.cart). */
    cart: (map) => BBK.store.set('cart', map),
  };

  /** Statuses at or after "Jadwal COD": the seller has agreed to the COD place and time. */
  BBK.AGREED_STATUSES = ['jadwal-cod', 'bertemu', 'selesai'];
  /** Statuses before the seller approves the schedule (the rest of BBK.orderSteps): place/time can still change, the order can still be cancelled. */
  BBK.OPEN_STATUSES = BBK.orderSteps.map((s) => s.status).filter((status) => !BBK.AGREED_STATUSES.includes(status));
  /** True once the order is agreed or cancelled: the buyer cannot edit place/time and the seller cannot reject the schedule. */
  BBK.isScheduleLocked = (o) => !BBK.OPEN_STATUSES.includes(o.status);

  // Orders saved by an older version used meetingPointId and had no schedule approval state.
  // Migrate them once and save, so they are not migrated again on every load.
  let migrated = false;
  BBK.orders.forEach((o) => {
    if (!o.meetingPlace) {
      const m = BBK.meetingPoints.find((x) => x.id === o.meetingPointId);
      o.meetingPlace = m ? m.name : 'Titik temu belum diisi';
      migrated = true;
    }
    if (!o.schedule) {
      o.schedule = BBK.AGREED_STATUSES.includes(o.status) ? 'disetujui' : 'menunggu';
      migrated = true;
    }
  });
  if (migrated) BBK.save.orders();

  BBK.resetDemo = () => {
    ['listings', 'productStatus', 'orders', 'chats', 'reviews', 'wishlist', 'recentSearches', 'cart'].forEach(BBK.store.remove);
  };

  /** Short unique id with a prefix, e.g. "m-lx3k9a". */
  BBK.newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  /* ---------- Lookups ---------- */
  const byId = (list) => (id) => BBK[list].find((item) => item.id === id);
  BBK.getProduct = byId('products');
  BBK.getUser = byId('users');
  BBK.getArea = byId('kostAreas');
  BBK.getCategory = byId('categories');
  BBK.getOrder = byId('orders');
  BBK.getThread = byId('chatThreads');

  /** Short area name for tight spots: "Jl. Kerto (Kertopamuji, …)" -> "Jl. Kerto". */
  BBK.areaShortName = (id) => (BBK.getArea(id) ? BBK.getArea(id).name.split(' (')[0] : '');

  /** Cover photo of a product (path relative to the site root, or a data URL for new listings). */
  BBK.productImage = (p) => (p && p.images && p.images[0]) || 'assets/photos/ub-aerial.jpg';

  /* ---------- Orders ---------- */
  BBK.orderItems = (o) => o.productIds.map(BBK.getProduct).filter(Boolean);
  /** One item: its title. Several: "Kipas Angin Miyako + 2 barang lainnya". */
  BBK.orderTitle = (o) => {
    const items = BBK.orderItems(o);
    if (!items.length) return 'Barang';
    return items.length === 1 ? items[0].title : `${items[0].title} + ${items.length - 1} barang lainnya`;
  };
  BBK.stepIndex = (status) => BBK.orderSteps.findIndex((s) => s.status === status);
  BBK.statusLabel = (status) =>
    status === 'dibatalkan' ? 'Dibatalkan' : (BBK.orderSteps.find((s) => s.status === status) || {}).label || status;
  /** Tone of a status pill: done / active / waiting / cancelled. */
  BBK.statusTone = (status) =>
    ({ selesai: 'done', dibatalkan: 'cancelled', 'menunggu-konfirmasi': 'waiting' })[status] || 'active';

  /**
   * Re-read the orders from storage (another tab may have changed them since this page loaded)
   * and return the fresh order, or undefined when it no longer exists.
   */
  BBK.reloadOrder = (id) => {
    BBK.orders = BBK.store.get('orders', BBK.orders);
    return BBK.getOrder(id);
  };

  /**
   * Move an order to a status, stamp the timeline, update the items, save.
   * Returns false (no change) when asked to cancel an order the seller has already agreed to.
   */
  BBK.setOrderStatus = (o, status, note) => {
    if (status === 'dibatalkan' && BBK.AGREED_STATUSES.includes(o.status)) return false;
    o.status = status;
    if (status === 'jadwal-cod') {
      o.schedule = 'disetujui';
      delete o.scheduleReason;
    }
    o.timeline.push({ status, at: new Date().toISOString(), ...(note ? { note } : {}) });
    if (status === 'selesai') BBK.save.productStatus(o.productIds, 'terjual');
    if (status === 'dibatalkan') BBK.save.productStatus(o.productIds, 'tersedia');
    BBK.save.orders();
    return true;
  };

  /**
   * Index in BBK.orderSteps of the furthest step the order is at. A cancelled order reports the
   * step it was cancelled at. Schedule events carry the status of that moment (an agreed
   * schedule is final now, but orders saved by an older version may have gone back a step).
   */
  BBK.stepProgress = (o) => {
    if (o.status !== 'dibatalkan') return BBK.stepIndex(o.status);
    const last = [...o.timeline].reverse().find((t) => t.status !== 'dibatalkan');
    return last ? BBK.stepIndex(last.status) : -1;
  };
  /**
   * Latest timeline entry of a step, or undefined when the order has not reached that step.
   * Schedule events (event: 'jadwal') are not steps and are skipped.
   */
  BBK.stepEntry = (o, status) => {
    const entry = [...o.timeline].reverse().find((t) => t.status === status && !t.event);
    return entry && BBK.stepIndex(status) <= BBK.stepProgress(o) ? entry : undefined;
  };

  /*
   * COD date rule: only the DATE is limited. It must be from today up to COD_MAX_DAYS after
   * the day the order was made. The time of day is free. Dates are "YYYY-MM-DD" strings in
   * local time (what <input type="date"> gives), so comparing them as text is safe.
   */
  BBK.COD_MAX_DAYS = 7;
  const pad2 = (n) => String(n).padStart(2, '0');
  /** Date or ISO string -> value for <input type="date"> (local time). */
  BBK.toDateInput = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
  };
  /** Date or ISO string -> value for <input type="time"> (local time). */
  BBK.toTimeInput = (d) => {
    const x = new Date(d);
    return `${pad2(x.getHours())}:${pad2(x.getMinutes())}`;
  };
  /** Allowed COD date window { min, max } as "YYYY-MM-DD": today .. COD_MAX_DAYS after the order date. */
  BBK.codDateWindow = (createdAt) => {
    const c = new Date(createdAt || Date.now());
    return { min: BBK.toDateInput(new Date()), max: BBK.toDateInput(new Date(c.getFullYear(), c.getMonth(), c.getDate() + BBK.COD_MAX_DAYS)) };
  };
  /** False when today is already past the window of an order (it can never get a valid COD date again). */
  BBK.canEditSchedule = (o) => {
    const { min, max } = BBK.codDateWindow(o.createdAt);
    return !BBK.isScheduleLocked(o) && min <= max;
  };
  /** Hint under the COD date input, e.g. "… (sampai Jumat, 27 November 2026). Jamnya bebas." */
  BBK.codDateHint = (createdAt) => {
    const { max } = BBK.codDateWindow(createdAt);
    return `Pilih tanggal paling lambat ${BBK.COD_MAX_DAYS} hari setelah pesanan dibuat (sampai ${BBK.formatDate(max + 'T12:00')}). Jamnya bebas.`;
  };
  /** Error message for a COD date ("YYYY-MM-DD") made on `createdAt`, or '' when it is inside the window. */
  BBK.codDateError = (value, createdAt) => {
    if (!value) return 'Pilih tanggal COD.';
    if (Number.isNaN(new Date(value + 'T12:00').getTime())) return 'Tanggal tidak valid.';
    const { min, max } = BBK.codDateWindow(createdAt);
    if (max < min) return `Batas ${BBK.COD_MAX_DAYS} hari setelah pesanan dibuat sudah lewat.`;
    if (value < min) return 'Tanggal COD tidak boleh sebelum hari ini.';
    if (value > max) return `Tanggal COD paling lambat ${BBK.COD_MAX_DAYS} hari setelah pesanan dibuat (${BBK.formatDate(max + 'T12:00')}).`;
    return '';
  };
  /**
   * Date + time input values -> null when fine, else { field: 'date' | 'time', message }.
   * The date must be inside the window; the time of day is free, but when the date is today it
   * cannot already be past (compared by the minute).
   */
  BBK.codWhenProblem = (date, time, createdAt) => {
    const dateError = BBK.codDateError(date, createdAt);
    if (dateError) return { field: 'date', message: dateError };
    if (!time) return { field: 'time', message: 'Pilih jam COD.' };
    if (date === BBK.toDateInput(new Date()) && time < BBK.toTimeInput(new Date())) {
      return { field: 'time', message: 'Jam ini sudah lewat. Pilih jam lain atau tanggal berikutnya.' };
    }
    return null;
  };
  /** Date + time input values (local time) -> ISO string. */
  BBK.codWhenISO = (date, time) => new Date(`${date}T${time}`).toISOString();

  /** Error message for a free-text COD meeting place, or '' when it is fine. */
  BBK.meetingPlaceError = (value) =>
    String(value || '').trim().length >= 3 ? '' : 'Tulis titik temu COD, mis. Depan masjid kampus.';

  /* Schedule approval: the buyer changes place/time, the seller approves or rejects (never cancels). Once approved the schedule is final. */
  const recordScheduleEvent = (o, state, reason, note) => {
    o.schedule = state;
    if (reason) o.scheduleReason = reason;
    else delete o.scheduleReason;
    o.timeline.push({ status: o.status, at: new Date().toISOString(), event: 'jadwal', note });
    BBK.save.orders();
  };
  /** Buyer edits place and/or time; the seller must approve again. Returns false (no change) once the order is agreed or cancelled. */
  BBK.changeSchedule = (o, { meetingPlace, scheduledAt }) => {
    if (BBK.isScheduleLocked(o)) return false;
    if (meetingPlace) o.meetingPlace = meetingPlace;
    if (scheduledAt) o.scheduledAt = scheduledAt;
    recordScheduleEvent(o, 'menunggu', '', `Jadwal diubah pembeli: ${o.meetingPlace}, ${BBK.formatShortDate(o.scheduledAt)} ${BBK.formatTime(o.scheduledAt)}`);
    return true;
  };
  /** Seller rejects the schedule; the order stays alive. Returns false (no change) once the order is agreed or cancelled. */
  BBK.rejectSchedule = (o, reason) => {
    if (BBK.isScheduleLocked(o)) return false;
    recordScheduleEvent(o, 'ditolak', reason, reason ? `Jadwal ditolak penjual: ${reason}` : 'Jadwal ditolak penjual');
    return true;
  };

  /* ---------- Chats ---------- */
  BBK.unreadChats = (userId) =>
    BBK.chatThreads.filter((t) => (t.buyerId === userId || t.sellerId === userId) && t.unread > 0).length;
  /** The thread between the current user and the seller of a product, if any. */
  BBK.threadForProduct = (productId, userId) =>
    BBK.chatThreads.find((t) => t.productId === productId && (t.buyerId === userId || t.sellerId === userId));

  /* ---------- Wishlist and recent searches (per device) ---------- */
  BBK.wishlist = {
    ids: () => BBK.store.get('wishlist', []),
    has: (id) => BBK.wishlist.ids().includes(id),
    /** Toggle; returns the new state. */
    toggle(id) {
      const ids = BBK.wishlist.ids();
      const on = !ids.includes(id);
      BBK.store.set('wishlist', on ? [id, ...ids] : ids.filter((x) => x !== id));
      return on;
    },
  };
  /*
   * Per-seller cart ("keranjang"): every item is handed over at one COD meeting, so a
   * buyer only bundles items from the same seller. Stored as { sellerId: [productId, …] };
   * items that are no longer available drop out when read.
   */
  BBK.cart = {
    all: () => BBK.store.get('cart', {}),
    ids(sellerId) {
      return (BBK.cart.all()[sellerId] || []).filter((id) => {
        const p = BBK.getProduct(id);
        return p && p.sellerId === sellerId && p.status === 'tersedia';
      });
    },
    has: (sellerId, id) => BBK.cart.ids(sellerId).includes(id),
    write(sellerId, ids) {
      const map = BBK.cart.all();
      if (ids.length) map[sellerId] = ids;
      else delete map[sellerId];
      BBK.save.cart(map);
    },
    add(sellerId, id) {
      if (!BBK.cart.has(sellerId, id)) BBK.cart.write(sellerId, [...BBK.cart.ids(sellerId), id]);
    },
    remove: (sellerId, id) => BBK.cart.write(sellerId, BBK.cart.ids(sellerId).filter((x) => x !== id)),
    clear: (sellerId) => BBK.cart.write(sellerId, []),
  };
  BBK.recentSearches = {
    list: () => BBK.store.get('recentSearches', ['Kipas angin', 'Rice cooker', 'Jas lab', 'Kasur']),
    add(q) {
      const text = String(q).trim();
      if (text.length < 2) return;
      const rest = BBK.recentSearches.list().filter((x) => x.toLowerCase() !== text.toLowerCase());
      BBK.store.set('recentSearches', [text, ...rest].slice(0, 6));
    },
    clear: () => BBK.store.set('recentSearches', []),
  };

  /* ---------- Distances ---------- */
  /** Straight-line distance in km between two kost areas (mock x/y in data.js). */
  BBK.areaDistance = (a, b) => {
    const A = BBK.getArea(a);
    const B = BBK.getArea(b);
    return A && B ? Math.hypot(A.x - B.x, A.y - B.y) : 0;
  };
  /** The meeting point with the smallest combined distance from two kost areas. */
  BBK.nearestMeetingPoint = (areaIdA, areaIdB) =>
    BBK.meetingPoints
      .map((m) => ({ m, d: BBK.areaDistance(areaIdA, m.areaId) + BBK.areaDistance(areaIdB, m.areaId) }))
      .sort((x, y) => x.d - y.d)[0].m;
  /** Walking minutes at ~5 km/h, at least 2. */
  BBK.walkMinutes = (km) => Math.max(2, Math.round((km / 5) * 60));

  /* ---------- Mock auth (no backend) ---------- */
  BBK.auth = {
    /** The logged-in user (the demo student u1 with what they typed at signup), or null. */
    currentUser() {
      const session = BBK.store.get('session', null);
      if (!session) return null;
      return { ...BBK.getUser(BBK.CURRENT_USER_ID), ...session };
    },
    /** Signup step 1 (or "lupa kata sandi"): remember the email waiting for its code. */
    requestOtp(email, profile) {
      BBK.store.set('pending', { email: String(email).trim().toLowerCase(), ...(profile || {}) });
    },
    pending: () => BBK.store.get('pending', null),
    /** Step 2: any 6-digit code is accepted. Returns false if malformed or nothing pending. */
    verifyOtp(code) {
      const pending = BBK.auth.pending();
      if (!pending || !/^\d{6}$/.test(String(code))) return false;
      const { reset, ...profile } = pending;
      BBK.store.set('session', { ...profile, verified: true });
      BBK.store.remove('pending');
      return true;
    },
    /** Email + password login: any ac.id email with a password of 8+ characters. */
    login(email) {
      BBK.store.set('session', { email: String(email).trim().toLowerCase(), verified: true });
    },
    /** Change profile fields of the logged-in user (Edit Profil). */
    update(patch) {
      const session = BBK.store.get('session', null);
      if (session) BBK.store.set('session', { ...session, ...patch });
    },
    logout() {
      BBK.store.remove('session');
    },
  };

  /** A message shown as a toast on the next page (e.g. after a redirect). */
  BBK.flash = (text, tone) => BBK.store.set('flash', { text, tone });
})();
