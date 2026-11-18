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
  // Orders saved by an older version used meetingPointId and had no schedule approval state.
  BBK.orders.forEach((o) => {
    if (!o.meetingPlace) {
      const m = BBK.meetingPoints.find((x) => x.id === o.meetingPointId);
      o.meetingPlace = m ? m.name : 'Titik temu belum diisi';
    }
    if (!o.schedule) o.schedule = ['jadwal-cod', 'bertemu', 'selesai'].includes(o.status) ? 'disetujui' : 'menunggu';
  });
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
  };

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

  /** Move an order to a status, stamp the timeline, update the items, save. */
  BBK.setOrderStatus = (o, status, note) => {
    o.status = status;
    if (status === 'jadwal-cod') {
      o.schedule = 'disetujui';
      delete o.scheduleReason;
    }
    o.timeline.push({ status, at: new Date().toISOString(), ...(note ? { note } : {}) });
    if (status === 'selesai') BBK.save.productStatus(o.productIds, 'terjual');
    if (status === 'dibatalkan') BBK.save.productStatus(o.productIds, 'tersedia');
    BBK.save.orders();
  };

  /**
   * Latest timeline entry of a step. Schedule events (event: 'jadwal') are not steps, so the
   * stepper stays correct when an order goes back from jadwal-cod to dikonfirmasi.
   */
  BBK.stepEntry = (o, status) => [...o.timeline].reverse().find((t) => t.status === status && !t.event);

  /* COD time rules: a datetime-local value ("2026-11-20T10:00", local time) inside BBK.codHours. */
  const hoursToMin = (text) => {
    const [h, m] = String(text).split('.').map(Number);
    return h * 60 + (m || 0);
  };
  const pad2 = (n) => String(n).padStart(2, '0');
  /** Date or ISO string -> value for <input type="datetime-local">. */
  BBK.toLocalInput = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}T${pad2(x.getHours())}:${pad2(x.getMinutes())}`;
  };
  /** Error message for a COD time typed in a datetime-local input, or '' when it is fine. */
  BBK.codTimeError = (value) => {
    if (!value) return 'Pilih tanggal dan jam COD.';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Tanggal dan jam tidak valid.';
    if (d.getTime() < Date.now()) return 'Jadwal COD tidak boleh di masa lalu.';
    const min = d.getHours() * 60 + d.getMinutes();
    if (min < hoursToMin(BBK.codHours.open) || min > hoursToMin(BBK.codHours.close)) {
      return `COD hanya bisa pukul ${BBK.codHours.open}–${BBK.codHours.close}.`;
    }
    return '';
  };

  /* Schedule approval: the buyer changes place/time, the seller approves or rejects (never cancels). */
  const pushScheduleEvent = (o, note) => o.timeline.push({ status: o.status, at: new Date().toISOString(), event: 'jadwal', note });
  /** Buyer edits place and/or time. The seller must approve again; an agreed schedule goes back to dikonfirmasi. */
  BBK.changeSchedule = (o, { meetingPlace, scheduledAt }) => {
    if (meetingPlace) o.meetingPlace = meetingPlace;
    if (scheduledAt) o.scheduledAt = scheduledAt;
    o.schedule = 'menunggu';
    delete o.scheduleReason;
    if (o.status === 'jadwal-cod') o.status = 'dikonfirmasi';
    pushScheduleEvent(o, `Jadwal diubah pembeli: ${o.meetingPlace}, ${BBK.formatShortDate(o.scheduledAt)} ${BBK.formatTime(o.scheduledAt)}`);
    BBK.save.orders();
  };
  /** Seller rejects the schedule. The order stays alive (back at dikonfirmasi if it was agreed). */
  BBK.rejectSchedule = (o, reason) => {
    o.schedule = 'ditolak';
    if (reason) o.scheduleReason = reason;
    else delete o.scheduleReason;
    if (o.status === 'jadwal-cod') o.status = 'dikonfirmasi';
    pushScheduleEvent(o, reason ? `Jadwal ditolak penjual: ${reason}` : 'Jadwal ditolak penjual');
    BBK.save.orders();
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
      BBK.store.set('cart', map);
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
