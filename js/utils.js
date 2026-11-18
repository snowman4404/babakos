/*
 * Shared helpers: formatting, lookups, mock storage and mock auth.
 * Requires js/data.js to be loaded first.
 */
(function () {
  const dateTime = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  /** 85000 -> "Rp85.000" (built by hand: Intl's currency style inserts a non-breaking space some fonts render oddly). */
  BBK.formatRupiah = (value) => 'Rp' + Number(value).toLocaleString('id-ID');
  BBK.formatDateTime = (iso) => dateTime.format(new Date(iso));
  /** 0.5 -> "0,5" */
  BBK.formatKm = (km) => String(Math.round(km * 10) / 10).replace('.', ',');

  /** Mock campus-email check: any Indonesian academic domain (…ac.id). */
  BBK.isCampusEmail = (email) => /^[^\s@]+@([a-z0-9-]+\.)*ac\.id$/i.test(String(email).trim());

  /** Read a URL query parameter, e.g. produk.html?id=p1 -> BBK.param('id') === 'p1' */
  BBK.param = (name) => new URLSearchParams(location.search).get(name);

  /** Escape user-provided text before putting it into innerHTML. */
  BBK.escape = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const byId = (list) => (id) => list.find((item) => item.id === id);
  BBK.getProduct = byId(BBK.products);
  BBK.getUser = byId(BBK.users);
  BBK.getArea = byId(BBK.kostAreas);
  BBK.getMeetingPoint = byId(BBK.meetingPoints);
  BBK.getCategory = byId(BBK.categories);

  /** Short area name for tight spots: "Jl. Kerto (Kertopamuji, …)" -> "Jl. Kerto". */
  BBK.areaShortName = (id) => BBK.getArea(id).name.split(' (')[0];

  /** Cover photo of a product (path relative to the site root). */
  BBK.productImage = (p) => (p.images && p.images[0]) || 'assets/photos/ub-aerial.jpg';

  /** Straight-line distance in km between two kost areas (mock x/y in data.js). */
  BBK.areaDistance = (a, b) => {
    const A = BBK.getArea(a);
    const B = BBK.getArea(b);
    return Math.hypot(A.x - B.x, A.y - B.y);
  };

  /** The meeting point with the smallest combined distance from two kost areas. */
  BBK.nearestMeetingPoint = (areaIdA, areaIdB) =>
    BBK.meetingPoints
      .map((m) => ({ m, d: BBK.areaDistance(areaIdA, m.areaId) + BBK.areaDistance(areaIdB, m.areaId) }))
      .sort((x, y) => x.d - y.d)[0].m;

  /** Walking minutes at ~5 km/h, at least 2. */
  BBK.walkMinutes = (km) => Math.max(2, Math.round((km / 5) * 60));

  /*
   * Tiny localStorage wrapper. Pages are separate HTML files, so anything that must
   * survive navigation in the demo (login, new chats, new orders) is stored here.
   * Always fails soft: in private mode etc. the site still renders from seed data.
   */
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
      } catch {
        /* storage unavailable — ignore */
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

  /* ---------- Mock auth (no backend) ---------- */
  BBK.auth = {
    /** The logged-in user, or null. */
    currentUser() {
      const session = BBK.store.get('session', null);
      if (!session) return null;
      const base = BBK.getUser(BBK.CURRENT_USER_ID);
      return { ...base, ...session };
    },
    /** Step 1 of register/login: remember the email waiting for OTP. */
    requestOtp(email, profile) {
      BBK.store.set('pending', { email: String(email).trim().toLowerCase(), ...(profile || {}) });
    },
    pending() {
      return BBK.store.get('pending', null);
    },
    /** Step 2: any 6-digit code is accepted. Returns false if malformed or nothing pending. */
    verifyOtp(code) {
      const pending = BBK.auth.pending();
      if (!pending || !/^\d{6}$/.test(String(code))) return false;
      BBK.store.set('session', { ...pending, verified: true });
      BBK.store.remove('pending');
      return true;
    },
    logout() {
      BBK.store.remove('session');
    },
  };
})();
