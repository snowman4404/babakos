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
  };

  BBK.resetDemo = () => {
    ['listings', 'productStatus', 'orders', 'chats', 'reviews', 'wishlist', 'recentSearches'].forEach(BBK.store.remove);
  };

  /** Short unique id with a prefix, e.g. "m-lx3k9a". */
  BBK.newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  /* ---------- Lookups ---------- */
  const byId = (list) => (id) => BBK[list].find((item) => item.id === id);
  BBK.getProduct = byId('products');
  BBK.getUser = byId('users');
  BBK.getArea = byId('kostAreas');
  BBK.getMeetingPoint = byId('meetingPoints');
  BBK.getCategory = byId('categories');
  BBK.getOrder = byId('orders');
  BBK.getThread = byId('chatThreads');
  BBK.getBundle = byId('bundles');

  /** Short area name for tight spots: "Jl. Kerto (Kertopamuji, …)" -> "Jl. Kerto". */
  BBK.areaShortName = (id) => (BBK.getArea(id) ? BBK.getArea(id).name.split(' (')[0] : '');

  /** Cover photo of a product (path relative to the site root, or a data URL for new listings). */
  BBK.productImage = (p) => (p && p.images && p.images[0]) || 'assets/photos/ub-aerial.jpg';

  /** Products of a bundle, its normal total and whether every item is still available. */
  BBK.bundleInfo = (b) => {
    const items = b.productIds.map(BBK.getProduct).filter(Boolean);
    return {
      items,
      seller: BBK.getUser(items[0].sellerId),
      normal: items.reduce((sum, p) => sum + p.price, 0),
      available: items.every((p) => p.status === 'tersedia'),
    };
  };

  /* ---------- Orders ---------- */
  BBK.orderItems = (o) => o.productIds.map(BBK.getProduct).filter(Boolean);
  /** "Kipas Angin Miyako" or the bundle name with its item count. */
  BBK.orderTitle = (o) => {
    const b = o.bundleId && BBK.getBundle(o.bundleId);
    return b ? `${b.title} (${o.productIds.length} barang)` : (BBK.orderItems(o)[0] || {}).title || 'Barang';
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
    o.timeline.push({ status, at: new Date().toISOString(), ...(note ? { note } : {}) });
    if (status === 'selesai') BBK.save.productStatus(o.productIds, 'terjual');
    if (status === 'dibatalkan') BBK.save.productStatus(o.productIds, 'tersedia');
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
