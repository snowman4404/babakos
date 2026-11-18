/*
 * Shared layout and components.
 * - Header: <header id="site-header"> gets the full marketplace navbar, or with
 *   data-bar="Title" (and data-back="fallback.html") a slim bar with a back button,
 *   as on the Figma Detail Barang / Pesanan Saya frames.
 * - Phones: a bottom tab bar on full-navbar pages.
 * - Footer: <footer id="site-footer">.
 * - Guards <body data-auth="required"> pages (redirect to masuk.html when logged out).
 * - Components: BBK.icon, BBK.avatar, BBK.productCard, BBK.statusPill, BBK.toast,
 *   BBK.confirm, BBK.initReveal.
 * Requires js/data.js and js/utils.js.
 */
(function () {
  // Inline SVG icons (Lucide, ISC license) so no icon library is needed.
  const ICON_PATHS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'chat-dots': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>',
    messages: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    verified: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
    lock: '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    image: '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    'cooking-pot': '<path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>',
    plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
    bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  };

  BBK.icon = (name, size = 18) =>
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;

  const esc = BBK.escape;

  /** Initials circle. size: '' (40px) | 'sm' (36px) | 'lg' (76px). */
  BBK.avatar = (user, size = '') =>
    `<span class="avatar${size ? ' avatar-' + size : ''}" aria-hidden="true">${esc(BBK.initials(user.name))}</span>`;

  /** Rounded status pill for orders. */
  BBK.statusPill = (status) => `<span class="pill pill-${BBK.statusTone(status)}">${esc(BBK.statusLabel(status))}</span>`;

  /*
   * Product card for <ul class="pgrid">: photo, name, price, kost area (Figma KATALOG card).
   * Reserved or sold items are dimmed and labelled. i staggers the entrance animation.
   */
  const goneText = { terjual: 'Terjual', dipesan: 'Dipesan' };
  BBK.productCard = (p, i = 0) => {
    const gone = goneText[p.status];
    return `<li class="pcard${gone ? ' is-gone' : ''}" style="--i:${Math.min(i, 12)}">
      <a href="produk.html?id=${encodeURIComponent(p.id)}">
        <span class="pcard-photo">
          <img src="${esc(BBK.productImage(p))}" alt="" width="320" height="320" loading="lazy">
          ${gone ? `<span class="pcard-status">${gone}</span>` : ''}
        </span>
        <span class="pcard-body">
          <span class="pcard-title">${esc(p.title)}</span>
          <span class="pcard-price">${BBK.formatRupiah(p.price)}</span>
          <span class="pcard-loc">${BBK.icon('pin', 14)}${esc(BBK.areaShortName(p.areaId))}</span>
        </span>
      </a>
    </li>`;
  };

  /*
   * Illustrated campus-area map (not a real map, no maps API). Pins come from
   * BBK.meetingPoints x/y (% of the box). The box is always 16:10, matching the
   * SVG viewBox, so pins and drawing line up. interactive: pins are buttons.
   */
  BBK.campusMap = ({ selected = '', interactive = false, recommended = '' } = {}) => {
    const pin = (m) => {
      const on = m.id === selected;
      const attrs = interactive
        ? `type="button" aria-pressed="${on}" aria-label="Pilih ${esc(m.name)}"`
        : `aria-hidden="${on ? 'false' : 'true'}"`;
      const tag = interactive ? 'button' : 'span';
      return `<${tag} class="map-pin${on ? ' is-selected' : ''}${m.id === recommended ? ' is-recommended' : ''}" style="left:${m.x}%;top:${m.y}%" data-point="${esc(m.id)}" ${attrs}>
        ${BBK.icon('pin', 26)}<span class="map-pin-label">${esc(m.shortName)}</span></${tag}>`;
    };
    return `<div class="map">
      <svg class="map-art" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
        <rect width="160" height="100" fill="#eef4ea"/>
        <rect x="14" y="16" width="120" height="64" rx="6" fill="#e2eed9" stroke="#cfe0c4"/>
        <path d="M0 85 H160" stroke="#fff" stroke-width="5"/>
        <path d="M0 85 H160" stroke="#e6dfd6" stroke-width="0.6" stroke-dasharray="3 3"/>
        <path d="M140 0 V100" stroke="#fff" stroke-width="4"/>
        <path d="M14 30 H134 M60 16 V80 M100 16 V80 M14 62 H134" stroke="#fff" stroke-width="1.6"/>
        <g fill="#fff" stroke="#d9d2c9" stroke-width="0.4">
          <rect x="22" y="20" width="14" height="8" rx="1"/><rect x="40" y="20" width="14" height="8" rx="1"/>
          <rect x="66" y="20" width="12" height="8" rx="1"/><rect x="82" y="20" width="12" height="8" rx="1"/>
          <rect x="106" y="20" width="22" height="8" rx="1"/><rect x="22" y="34" width="10" height="10" rx="1"/>
          <rect x="66" y="36" width="28" height="14" rx="1"/><rect x="106" y="36" width="10" height="20" rx="1"/>
          <rect x="120" y="36" width="10" height="20" rx="1"/><rect x="22" y="66" width="30" height="10" rx="1"/>
          <rect x="66" y="66" width="28" height="10" rx="1"/><rect x="106" y="66" width="22" height="10" rx="1"/>
          <rect x="24" y="89" width="22" height="9" rx="1"/><rect x="112" y="89" width="26" height="9" rx="1"/>
        </g>
        <circle cx="38" cy="47" r="5" fill="#d6e7cb"/>
        <text x="74" y="58" font-size="4" fill="#7a8f6d" font-family="sans-serif" font-weight="700">AREA KAMPUS</text>
        <text x="62" y="92.5" font-size="3" fill="#8a8077" font-family="sans-serif">Jl. Veteran</text>
        <text transform="translate(142.2 22) rotate(90)" font-size="3" fill="#8a8077" font-family="sans-serif">Jl. MT Haryono</text>
      </svg>
      ${BBK.meetingPoints.map(pin).join('')}
      <span class="map-note">Peta ilustrasi</span>
    </div>`;
  };

  /* ---------- Toasts ---------- */
  let toastBox;
  BBK.toast = (text, tone = '') => {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toasts';
      toastBox.setAttribute('role', 'status');
      toastBox.setAttribute('aria-live', 'polite');
      document.body.append(toastBox);
    }
    const t = document.createElement('div');
    t.className = `toast${tone ? ' toast-' + tone : ''}`;
    t.innerHTML = `${BBK.icon(tone === 'error' ? 'info' : 'circle-check', 18)}<span>${esc(text)}</span>`;
    toastBox.append(t);
    setTimeout(() => t.classList.add('is-leaving'), 3200);
    setTimeout(() => t.remove(), 3600);
  };

  /* ---------- Confirm dialog (returns a Promise<boolean>) ---------- */
  BBK.confirm = ({ title, text = '', ok = 'Ya, lanjutkan', cancel = 'Batal', danger = false }) => {
    const dlg = document.createElement('dialog');
    if (typeof dlg.showModal !== 'function') return Promise.resolve(window.confirm(title));
    dlg.className = 'dialog';
    dlg.innerHTML = `<form method="dialog">
      <h2 class="dialog-title">${esc(title)}</h2>
      ${text ? `<p class="dialog-text">${esc(text)}</p>` : ''}
      <div class="dialog-actions">
        <button class="btn btn-ghost" value="cancel">${esc(cancel)}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" value="ok">${esc(ok)}</button>
      </div></form>`;
    document.body.append(dlg);
    dlg.showModal();
    return new Promise((resolve) => {
      dlg.addEventListener('close', () => {
        resolve(dlg.returnValue === 'ok');
        dlg.remove();
      });
    });
  };

  const currentFile = location.pathname.split('/').pop() || 'index.html';

  // Auth guard runs before render so protected pages never flash.
  if (document.body.dataset.auth === 'required' && !BBK.auth.currentUser()) {
    BBK.flash('Masuk dulu dengan email kampus untuk lanjut.');
    location.replace('masuk.html?next=' + encodeURIComponent(currentFile + location.search + location.hash));
    return;
  }

  const user = BBK.auth.currentUser();
  const username = user ? user.email.split('@')[0] : '';
  const unread = user ? BBK.unreadChats(user.id) : 0;
  const here = (href) => (currentFile === href ? ' aria-current="page"' : '');

  /* ---------- Header ---------- */
  const header = document.getElementById('site-header');
  const barTitle = header && header.dataset.bar;
  if (header && barTitle) {
    // Slim bar: back button + title (Figma "Detail Barang", "Pesanan Saya").
    header.className = 'site-header site-header-bar';
    header.innerHTML = `<div class="bar container">
        <a class="icon-btn icon-btn-soft back-btn" href="${esc(header.dataset.back || 'index.html')}" aria-label="Kembali">${BBK.icon('chevron-left', 22)}</a>
        <h1 class="bar-title" id="bar-title">${esc(barTitle)}</h1>
        <div class="bar-end" id="bar-end"></div>
      </div>`;
    header.querySelector('.back-btn').addEventListener('click', (e) => {
      // Go back when we came from this site, so filters and scroll position survive.
      let sameSite = false;
      try {
        sameSite = document.referrer && new URL(document.referrer).origin === location.origin;
      } catch {
        /* file:// — keep the link */
      }
      if (sameSite && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  } else if (header) {
    header.className = 'site-header';
    const area = user && BBK.getArea(user.areaId);
    const end = user
      ? `${area ? `<a class="nav-loc" href="jelajah.html?area=${encodeURIComponent(area.id)}" title="Barang di area kostmu">${BBK.icon('pin', 16)}<span>${esc(BBK.areaShortName(area.id))}</span></a>` : ''}
        <a class="icon-btn nav-chat" href="chat.html" aria-label="Chat${unread ? `, ${unread} belum dibaca` : ''}"${here('chat.html')}>${BBK.icon('chat-dots', 22)}${unread ? `<span class="badge-dot">${unread}</span>` : ''}</a>
        <a class="btn btn-primary btn-sm nav-sell" href="jual.html">${BBK.icon('plus', 16)}Jual</a>
        <span class="nav-divider" aria-hidden="true"></span>
        <div class="account">
          <button type="button" class="account-btn" id="account-btn" aria-expanded="false" aria-controls="account-menu">
            ${BBK.avatar(user, 'sm')}<span class="account-name">${esc(username)}</span>${BBK.icon('chevron-down', 16)}
          </button>
          <div class="account-menu" id="account-menu" hidden>
            <a href="profil.html">${BBK.icon('user', 18)}Akun Saya</a>
            <a href="pesanan.html">${BBK.icon('package', 18)}Pesanan Saya</a>
            <a href="profil.html#wishlist">${BBK.icon('heart', 18)}Wishlist</a>
            <button type="button" data-logout>${BBK.icon('logout', 18)}Keluar</button>
          </div>
        </div>`
      : `<a class="btn btn-ghost btn-sm" href="masuk.html?next=${encodeURIComponent(currentFile + location.search)}">Masuk</a>
         <a class="btn btn-primary btn-sm" href="daftar.html">Daftar</a>`;
    header.innerHTML = `<div class="nav container">
        <a class="wordmark" href="index.html">BaBaKos</a>
        <nav class="nav-links" aria-label="Utama">
          <a href="index.html"${here('index.html')}>Beranda</a>
          <a href="jelajah.html"${here('jelajah.html')}>Katalog</a>
        </nav>
        <form class="nav-search" id="nav-search" action="jelajah.html" role="search">
          <label class="sr-only" for="nav-q">Cari barang</label>
          ${BBK.icon('search', 20)}
          <input type="search" id="nav-q" name="q" placeholder="Cari kipas, rice cooker, buku…" autocomplete="off" enterkeyhint="search" aria-controls="search-pop">
          <button type="button" class="nav-search-clear" id="nav-q-clear" aria-label="Hapus pencarian" hidden>${BBK.icon('x', 16)}</button>
          <div class="search-pop" id="search-pop" hidden></div>
        </form>
        <div class="nav-end">${end}</div>
      </div>`;

    // Account menu
    const btn = document.getElementById('account-btn');
    const menu = document.getElementById('account-menu');
    if (btn) {
      const setMenu = (open) => {
        menu.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
      };
      btn.addEventListener('click', () => setMenu(menu.hidden));
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.account')) setMenu(false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) {
          setMenu(false);
          btn.focus();
        }
      });
    }

    // Search box: recent searches pop up while it is empty (Figma search frames).
    const q = document.getElementById('nav-q');
    const pop = document.getElementById('search-pop');
    const clear = document.getElementById('nav-q-clear');
    const fillPop = () => {
      const recent = BBK.recentSearches.list();
      if (q.value.trim() || !recent.length) {
        pop.hidden = true;
        return;
      }
      pop.innerHTML = `<div class="search-pop-head"><span>Pencarian terakhir</span><button type="button" data-clear-recent>Hapus</button></div>
        ${recent.map((r) => `<a href="jelajah.html?q=${encodeURIComponent(r)}">${BBK.icon('history', 20)}<span>${esc(r)}</span></a>`).join('')}`;
      pop.hidden = false;
    };
    q.value = currentFile === 'jelajah.html' ? BBK.param('q') || '' : '';
    clear.hidden = !q.value;
    q.addEventListener('focus', fillPop);
    q.addEventListener('input', () => {
      clear.hidden = !q.value;
      fillPop();
    });
    clear.addEventListener('click', () => {
      q.value = '';
      q.dispatchEvent(new Event('input', { bubbles: true }));
      q.focus();
    });
    pop.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus while clicking
    pop.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-recent]')) {
        BBK.recentSearches.clear();
        pop.hidden = true;
      }
    });
    q.addEventListener('blur', () => (pop.hidden = true));
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') pop.hidden = true;
    });
    document.getElementById('nav-search').addEventListener('submit', (e) => {
      BBK.recentSearches.add(q.value);
      if (currentFile === 'jelajah.html') {
        e.preventDefault(); // jelajah filters live
        pop.hidden = true;
        q.blur();
      }
    });

    // Phone tab bar (Figma "Menu List": Home, Chat, Orders, Profile).
    const tab = (href, icon, label, extra = '') =>
      `<a href="${href}"${here(href)}>${BBK.icon(icon, 22)}<span>${label}</span>${extra}</a>`;
    const tabs = document.createElement('nav');
    tabs.className = 'tabbar';
    tabs.setAttribute('aria-label', 'Menu');
    tabs.innerHTML = user
      ? tab('index.html', 'house', 'Beranda') +
        tab('jelajah.html', 'grid', 'Katalog') +
        tab('chat.html', 'chat-dots', 'Chat', unread ? `<span class="badge-dot">${unread}</span>` : '') +
        tab('pesanan.html', 'package', 'Pesanan') +
        tab('profil.html', 'user', 'Profil')
      : tab('index.html', 'house', 'Beranda') + tab('jelajah.html', 'grid', 'Katalog') + tab('masuk.html', 'user', 'Masuk');
    document.body.append(tabs);
    document.body.classList.add('has-tabbar');
  }

  // Logout from any page
  document.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-logout]')) return;
    const ok = await BBK.confirm({ title: 'Keluar dari BaBaKos?', text: 'Kamu bisa masuk lagi kapan saja dengan email kampus.', ok: 'Keluar' });
    if (!ok) return;
    BBK.auth.logout();
    BBK.flash('Kamu sudah keluar.');
    location.href = 'index.html';
  });

  /* ---------- Footer ---------- */
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    const credits = BBK.photoCredits
      .map(([what, by, url]) => `<a href="${esc(url)}">${esc(what)}</a> oleh ${esc(by)}`)
      .join('; ');
    footer.innerHTML = `<div class="container foot">
        <div class="foot-brand">
          <a class="wordmark" href="index.html">BaBaKos</a>
          <p>Barang bekas kost, pindah tangan antar mahasiswa kampus se-Malang.</p>
        </div>
        <nav class="foot-links" aria-label="Footer">
          <a href="jelajah.html">Katalog</a>
          <a href="${user ? 'jual.html' : 'daftar.html'}">${user ? 'Jual barang' : 'Daftar'}</a>
          <a href="profil.html#bantuan">Pusat bantuan</a>
          <button type="button" class="link-btn" id="reset-demo">${BBK.icon('reset', 16)}Reset data demo</button>
        </nav>
        <details class="credits">
          <summary>Kredit foto</summary>
          <p>Foto contoh dari Wikimedia Commons: ${credits}.</p>
        </details>
        <p class="foot-note">2026 · Mockup tugas kuliah, tanpa backend.</p>
      </div>`;
    document.getElementById('reset-demo').addEventListener('click', async () => {
      const ok = await BBK.confirm({
        title: 'Reset data demo?',
        text: 'Pesanan, chat, barang baru, dan wishlist kembali ke contoh awal. Akunmu tetap masuk.',
        ok: 'Reset',
        danger: true,
      });
      if (!ok) return;
      BBK.resetDemo();
      BBK.flash('Data demo sudah dikembalikan.');
      location.reload();
    });
  }

  // Show/hide password: <button data-toggle-password aria-controls="password-input-id">
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-toggle-password]');
    if (!b) return;
    const input = document.getElementById(b.getAttribute('aria-controls'));
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(show));
    b.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    b.innerHTML = BBK.icon(show ? 'eye-off' : 'eye', 20);
  });

  // Icon placeholders in static markup: <span data-icon="search"></span>
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.insertAdjacentHTML('afterbegin', BBK.icon(el.dataset.icon, Number(el.dataset.iconSize) || 18));
  });

  // Toast queued by the previous page
  const flash = BBK.store.get('flash', null);
  if (flash) {
    BBK.store.remove('flash');
    setTimeout(() => BBK.toast(flash.text, flash.tone), 150);
  }

  /*
   * Entrance motion: elements with [data-reveal] rise in once when they enter the screen.
   * Children of one [data-reveal-group] are staggered 60ms apart. Content stays visible
   * without JS or with reduced motion (the hidden state is only applied here).
   * Call it after the page has rendered its dynamic content.
   */
  let io = null;
  BBK.initReveal = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-ready');
    document.querySelectorAll('[data-reveal-group]').forEach((g) => {
      g.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--delay', Math.min(i, 8) * 60 + 'ms'));
    });
    if (io) {
      // Called again after a re-render: watch the new elements only.
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
      return;
    }
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    // Safety net for fast jumps: anything already above the bottom of the screen is shown.
    let queued = false;
    const sweep = () => {
      queued = false;
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight) {
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    };
    addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(sweep);
      }
    }, { passive: true });
  };
})();
