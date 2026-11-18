/*
 * Shared layout: injects the navbar into <header id="site-header"> and the footer
 * into <footer id="site-footer"> on every page, and guards pages marked
 * <body data-auth="required"> (redirects to masuk.html when not logged in).
 * Requires js/data.js and js/utils.js.
 */
(function () {
  // Inline SVG icons (Lucide, ISC license) so no icon library is needed.
  const ICON_PATHS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    construction: '<rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/>',
  };

  BBK.icon = (name, size = 18) =>
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;

  const currentFile = location.pathname.split('/').pop() || 'index.html';

  // Auth guard runs before render so protected pages never flash.
  if (document.body.dataset.auth === 'required' && !BBK.auth.currentUser()) {
    location.replace('masuk.html?next=' + encodeURIComponent(currentFile + location.search));
    return;
  }

  const user = BBK.auth.currentUser();

  const navLink = (href, icon, label) => {
    const active = currentFile === href ? ' is-active' : '';
    return `<a class="nav-link${active}" href="${href}" aria-label="${label}">${BBK.icon(icon)}<span class="nav-label">${label}</span></a>`;
  };

  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <nav class="container nav">
        <a class="brand" href="index.html">
          <img src="assets/icon.svg" alt="" width="32" height="32"> BaBaKos
        </a>
        ${navLink('jelajah.html', 'search', 'Jelajah')}
        ${
          user
            ? navLink('jual.html', 'plus', 'Jual') +
              navLink('chat.html', 'chat', 'Chat') +
              navLink('pesanan.html', 'package', 'Pesanan') +
              navLink('profil.html', 'user', 'Profil')
            : '<a class="btn btn-primary" href="masuk.html">Masuk</a>'
        }
      </nav>`;
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="container">BaBaKos — Barang Bekas Kost · Khusus mahasiswa Universitas Brawijaya · Mockup tanpa backend</div>';
  }

  // Fill placeholder badges (used until each page is implemented).
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.insertAdjacentHTML('afterbegin', BBK.icon(el.dataset.icon));
  });
})();
