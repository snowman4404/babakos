/*
 * Shared layout: injects the navbar into <header id="site-header"> and the footer
 * into <footer id="site-footer"> on every page, and guards pages marked
 * <body data-auth="required"> (redirects to masuk.html when not logged in).
 * Also provides BBK.initReveal() for the scroll-in motion.
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
    const current = currentFile === href ? ' aria-current="page"' : '';
    return `<a class="nav-link" href="${href}"${current}>${BBK.icon(icon, 20)}<span class="nav-label">${label}</span></a>`;
  };

  // Three parts like a menu card: links left, wordmark centre, links right.
  // Logged in there are five links, so on phones they shrink to icons (class nav-compact).
  const header = document.getElementById('site-header');
  if (header) {
    header.classList.add('site-header');
    const start = user
      ? navLink('jelajah.html', 'search', 'Jelajah') + navLink('jual.html', 'plus', 'Jual')
      : navLink('jelajah.html', 'search', 'Jelajah');
    const end = user
      ? navLink('chat.html', 'chat', 'Chat') + navLink('pesanan.html', 'package', 'Pesanan') + navLink('profil.html', 'user', 'Profil')
      : navLink('masuk.html', 'user', 'Masuk');
    header.innerHTML = `
      <nav class="nav${user ? ' nav-compact' : ''}" aria-label="Utama">
        <div class="nav-side">${start}</div>
        <a class="wordmark" href="index.html">BaBaKos</a>
        <div class="nav-side nav-end">${end}</div>
      </nav>`;
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.classList.add('site-footer');
    const credits = BBK.photoCredits
      .map(([what, by, url]) => `<a href="${BBK.escape(url)}">${BBK.escape(what)}</a> oleh ${BBK.escape(by)}`)
      .join('; ');
    footer.innerHTML = `
      <div class="container">
        <p class="credits">Foto contoh dari Wikimedia Commons: ${credits}.</p>
        <div class="foot-line">
          <p>BaBaKos, barang bekas kost</p>
          <nav aria-label="Footer">
            <a href="jelajah.html">Barang</a>
            <a href="index.html#perjalanan">Cara COD</a>
            ${user ? '<a href="jual.html">Jual</a>' : '<a href="daftar.html">Daftar</a>'}
          </nav>
          <p>2026 · Mockup tugas kuliah</p>
        </div>
      </div>`;
  }

  // Fill placeholder badges (used until each page is implemented).
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.insertAdjacentHTML('afterbegin', BBK.icon(el.dataset.icon));
  });

  /*
   * Entrance motion: elements with [data-reveal] rise in once when they enter the screen.
   * Children of one [data-reveal-group] are staggered 70ms apart. Content stays visible
   * without JS or with reduced motion (the hidden state is only applied here).
   * Call it after the page has rendered its dynamic content.
   */
  BBK.initReveal = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-ready');
    document.querySelectorAll('[data-reveal-group]').forEach((g) => {
      g.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--delay', i * 70 + 'ms'));
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    // Safety net for fast jumps (anchor links, flicked scrolling): anything already above
    // the bottom of the screen is shown, so no section is ever left blank.
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
