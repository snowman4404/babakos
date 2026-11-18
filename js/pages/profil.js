/*
 * Profil (profil.html, profil.html#wishlist, profil.html?id=u2).
 * - Own account: the Figma "Dashboard profil" — sidebar menu and panels for
 *   Profil Saya, Barang Saya, Wishlist, Keamanan Akun, Pusat Bantuan.
 * - Someone else (?id=): public seller profile with listings and reviews.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const root = $('#profile');
  const me = BBK.auth.currentUser();
  const id = BBK.param('id');

  if (id && (!me || id !== me.id)) return renderPublic(BBK.getUser(id));
  if (!me) {
    BBK.flash('Masuk dulu untuk melihat profilmu.');
    location.replace('masuk.html?next=' + encodeURIComponent('profil.html' + location.hash));
    return;
  }
  renderOwn();

  /* ======================= Own dashboard ======================= */
  function renderOwn() {
    const username = me.email.split('@')[0];
    const PANELS = [
      ['profil', 'user', 'Profil Saya'],
      ['pesanan', 'package', 'Pesanan Saya', 'pesanan.html'],
      ['barang', 'tag', 'Barang Saya'],
      ['wishlist', 'heart', 'Wishlist'],
      ['keamanan', 'lock', 'Keamanan Akun'],
    ];
    const SUPPORT = [['bantuan', 'help', 'Pusat Bantuan']];
    const item = ([key, icon, label, href]) =>
      `<a class="side-item" href="${href || '#' + key}" data-panel="${href ? '' : key}">${BBK.icon(icon, 20)}<span>${label}</span><span class="side-dot" aria-hidden="true"></span></a>`;

    document.title = 'Akun Saya — BaBaKos';
    $('#chat-launcher').hidden = false;
    root.innerHTML = `<div class="dash">
      <aside class="dash-side" aria-label="Akun saya">
        <div class="dash-side-head"><p class="h2">Akun Saya</p><p class="caption muted">Semua kebutuhan akunmu</p></div>
        <nav class="side-nav">${PANELS.map(item).join('')}</nav>
        <hr class="divider dash-side-rule">
        <nav class="side-nav">${SUPPORT.map(item).join('')}
          <button type="button" class="side-item" data-logout>${BBK.icon('logout', 20)}<span>Keluar</span></button></nav>
        <div class="campus-note">${BBK.icon('cap', 26)}<p class="h3">Dari kampus, untuk kamu.</p><p class="caption">Temukan kebutuhan kuliah dan berbagi barang dengan sesama mahasiswa.</p></div>
      </aside>
      <div class="dash-main" id="panel" tabindex="-1"></div>
    </div>`;

    const panels = {
      profil: profilPanel,
      barang: barangPanel,
      wishlist: wishlistPanel,
      keamanan: keamananPanel,
      bantuan: bantuanPanel,
    };
    const crumbs = (label) =>
      `<nav class="crumbs" aria-label="Remah roti"><a href="index.html">Beranda</a><span aria-hidden="true">/</span><a href="#profil">Akun Saya</a><span aria-hidden="true">/</span><span>${label}</span></nav>`;

    function show(key, focus) {
      if (!panels[key]) key = 'profil';
      root.querySelectorAll('.side-item[data-panel]').forEach((a) => {
        if (a.dataset.panel === key) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      const label = [...PANELS, ...SUPPORT].find((p) => p[0] === key)[2];
      $('#panel').innerHTML = crumbs(label) + panels[key]();
      wire(key);
      if (focus) $('#panel').focus({ preventScroll: true });
    }
    addEventListener('hashchange', () => show(location.hash.slice(1), true));
    show(location.hash.slice(1));

    /* --- Profil Saya --- */
    function profilPanel() {
      const area = BBK.getArea(me.areaId);
      const myOrders = BBK.orders.filter((o) => o.buyerId === me.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const latest = myOrders[0];
      const p = latest && BBK.orderItems(latest)[0];
      const sales = BBK.orders.filter((o) => o.sellerId === me.id && o.status === 'menunggu-konfirmasi').length;
      return `<div class="dash-hello">
          <h1 class="h1">Halo, ${esc(username)}!</h1>
          <p class="lead">Kelola profil dan kebutuhan belanja kampusmu di satu tempat.</p>
        </div>

        <section class="card profile-card" aria-label="Profil">
          <div class="profile-id">
            ${BBK.avatar(me, 'lg')}
            <div class="profile-id-text">
              <p class="profile-name">${esc(username)}</p>
              <p class="lead">${esc(me.email)}</p>
              <p class="verified caption">${BBK.icon('verified', 14)}Mahasiswa terverifikasi</p>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="edit-profile">${BBK.icon('pencil', 16)}Edit Profil</button>
          </div>
          <hr class="divider">
          <dl class="profile-details">
            <div><dt class="caption">Nama lengkap</dt><dd>${BBK.icon('user', 18)}${esc(me.name)}</dd></div>
            <div><dt class="caption">Email kampus</dt><dd>${BBK.icon('mail', 18)}${esc(me.email)}</dd></div>
            <div><dt class="caption">Fakultas</dt><dd>${BBK.icon('cap', 18)}${esc(me.faculty || '-')}</dd></div>
            <div><dt class="caption">Area kost</dt><dd>${BBK.icon('pin', 18)}${esc(area ? BBK.areaShortName(area.id) : '-')}</dd></div>
          </dl>
          <dl class="profile-stats">
            <div><dt>Trust Score</dt><dd>${me.trustScore}</dd></div>
            <div><dt>Rating</dt><dd>${BBK.icon('star', 16)}${me.rating.toLocaleString('id-ID', { minimumFractionDigits: 1 })}</dd></div>
            <div><dt>Terjual</dt><dd>${me.totalSold}</dd></div>
          </dl>
        </section>

        <section class="card-soft orders-block" aria-labelledby="ob-title">
          <div class="orders-block-head">
            <span class="icon-tile icon-tile-white">${BBK.icon('package', 26)}</span>
            <div><h2 class="h2" id="ob-title">Pesanan Saya</h2><p class="lead">Cek status dan lihat kembali detail pesananmu.</p></div>
            <a class="btn" href="pesanan.html">Lihat Pesanan Saya</a>
          </div>
          ${
            latest
              ? `<a class="order-preview" href="lacak.html?id=${encodeURIComponent(latest.id)}">
                  <div class="order-preview-top"><span class="eyebrow">Dari riwayat pesananmu</span>${BBK.statusPill(latest.status)}</div>
                  <div class="order-preview-body">
                    <img src="${esc(BBK.productImage(p))}" alt="" width="80" height="80">
                    <div><p class="h3">${esc(BBK.orderTitle(latest))} - ${esc(BBK.getUser(latest.sellerId).name)}</p>
                      <p class="caption">Dibuat pada ${esc(BBK.formatDate(latest.createdAt))}</p>
                      <p class="caption muted">COD ${esc(BBK.getMeetingPoint(latest.meetingPointId).shortName)} · ${latest.productIds.length} barang</p></div>
                    <div class="order-preview-total"><span class="caption">Total biaya</span><strong>${BBK.formatRupiah(latest.price)}</strong><span class="text-action">Lihat detail${BBK.icon('arrow-right', 18)}</span></div>
                  </div>
                </a>`
              : `<p class="order-preview empty-line">Belum ada pesanan. <a class="link-btn" href="jelajah.html">Cari barang</a></p>`
          }
          ${sales ? `<a class="sales-alert" href="pesanan.html?tab=penjualan">${BBK.icon('bag', 18)}<span><strong>${sales} pesanan baru</strong> untuk barangmu menunggu konfirmasi.</span>${BBK.icon('chevron-right', 18)}</a>` : ''}
        </section>

        <div class="utility-grid">
          <section class="card utility">
            <div class="utility-title"><span class="icon-tile">${BBK.icon('lock', 20)}</span><h2 class="h3">Keamanan Akun</h2></div>
            <p class="lead">Jaga akun tetap aman. Kelola kata sandi untuk melindungi aktivitas belanjamu.</p>
            <a class="text-action" href="#keamanan">Kelola keamanan${BBK.icon('arrow-right', 18)}</a>
          </section>
          <section class="card utility">
            <div class="utility-title"><span class="icon-tile">${BBK.icon('help', 20)}</span><h2 class="h3">Butuh bantuan?</h2></div>
            <p class="lead">Temukan panduan COD, cara jual barang, dan jawaban untuk pertanyaanmu.</p>
            <a class="text-action" href="#bantuan">Kunjungi Pusat Bantuan${BBK.icon('arrow-right', 18)}</a>
          </section>
        </div>
        <p class="caption muted">Ruang akunmu, untuk transaksi kampus yang lebih nyaman.</p>`;
    }

    /* --- Barang Saya --- */
    function barangPanel() {
      const mine = BBK.products.filter((p) => p.sellerId === me.id);
      return `<div class="dash-hello panel-head"><h1 class="h1">Barang Saya</h1><a class="btn btn-sm" href="jual.html">${BBK.icon('plus', 16)}Jual barang</a></div>
        <p class="lead">${mine.filter((p) => p.status === 'tersedia').length} tayang · ${mine.filter((p) => p.status === 'dipesan').length} dipesan · ${mine.filter((p) => p.status === 'terjual').length} terjual</p>
        ${mine.length ? `<ul class="pgrid">${mine.map(BBK.productCard).join('')}</ul>` : emptyHTML('tag', 'Belum ada barang', 'Pindah kost atau ada barang nganggur? Jual ke sesama mahasiswa.', 'jual.html', 'Jual barang')}`;
    }

    /* --- Wishlist --- */
    function wishlistPanel() {
      const items = BBK.wishlist.ids().map(BBK.getProduct).filter(Boolean);
      return `<div class="dash-hello"><h1 class="h1">Wishlist</h1><p class="lead">Barang yang kamu simpan. Disimpan di perangkat ini.</p></div>
        ${items.length ? `<ul class="pgrid">${items.map(BBK.productCard).join('')}</ul>` : emptyHTML('heart', 'Wishlist masih kosong', 'Tekan ikon hati di halaman barang untuk menyimpannya di sini.', 'jelajah.html', 'Buka katalog')}`;
    }

    /* --- Keamanan Akun --- */
    function keamananPanel() {
      return `<div class="dash-hello"><h1 class="h1">Keamanan Akun</h1><p class="lead">Akunmu terikat ke email kampus, jadi hanya mahasiswa yang bisa bertransaksi.</p></div>
        <section class="card security-row">
          <span class="icon-tile">${BBK.icon('verified', 20)}</span>
          <div><p class="h3">Email kampus terverifikasi</p><p class="caption">${esc(me.email)}</p></div>
          <span class="tag tag-green">Aktif</span>
        </section>
        <form class="card password-form" id="password-form" novalidate>
          <h2 class="h3 card-head">Ganti kata sandi</h2>
          <div class="field"><label class="field-label" for="pw-old">Kata sandi lama</label>
            <div class="input-group"><input class="input" id="pw-old" type="password" autocomplete="current-password">
            <button type="button" class="icon-btn input-suffix-btn" data-toggle-password aria-controls="pw-old" aria-pressed="false" aria-label="Tampilkan kata sandi">${BBK.icon('eye', 20)}</button></div></div>
          <div class="field"><label class="field-label" for="pw-new">Kata sandi baru</label>
            <div class="input-group"><input class="input" id="pw-new" type="password" autocomplete="new-password" aria-describedby="pw-error">
            <button type="button" class="icon-btn input-suffix-btn" data-toggle-password aria-controls="pw-new" aria-pressed="false" aria-label="Tampilkan kata sandi">${BBK.icon('eye', 20)}</button></div>
            <p class="field-error" id="pw-error" hidden></p></div>
          <button class="btn" type="submit">Simpan kata sandi</button>
        </form>
        <section class="card security-row">
          <span class="icon-tile">${BBK.icon('logout', 20)}</span>
          <div><p class="h3">Keluar dari perangkat ini</p><p class="caption">Data demo tetap tersimpan di browser ini.</p></div>
          <button type="button" class="btn btn-ghost btn-sm" data-logout>Keluar</button>
        </section>`;
    }

    /* --- Pusat Bantuan --- */
    function bantuanPanel() {
      return `<div class="dash-hello"><h1 class="h1">Pusat Bantuan</h1><p class="lead">Jawaban singkat untuk pertanyaan yang paling sering.</p></div>
        <div class="faq">${BBK.faq.map(([q, a], i) => `<details class="faq-item"${i === 0 ? ' open' : ''}><summary>${esc(q)}${BBK.icon('chevron-down', 18)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
    }

    function wire(key) {
      if (key === 'profil') $('#edit-profile').addEventListener('click', editProfile);
      if (key === 'keamanan') {
        $('#password-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = $('#pw-new').value;
          const err = v.length < 8 ? 'Kata sandi baru minimal 8 karakter.' : '';
          $('#pw-error').innerHTML = err ? BBK.icon('info', 14) + err : '';
          $('#pw-error').hidden = !err;
          if (err) return $('#pw-new').focus();
          e.target.reset();
          BBK.toast('Kata sandi diperbarui.');
        });
      }
    }

    /* Edit Profil dialog: name, faculty, kost area (saved in the session) */
    function editProfile() {
      const dlg = document.createElement('dialog');
      dlg.className = 'dialog';
      dlg.innerHTML = `<form method="dialog" class="edit-form">
        <h2 class="dialog-title">Edit Profil</h2>
        <div class="field"><label class="field-label" for="ep-name">Nama lengkap</label><input class="input" id="ep-name" value="${esc(me.name)}" required></div>
        <div class="field"><label class="field-label" for="ep-fac">Fakultas</label><span class="select"><select id="ep-fac">
          ${BBK.faculties.map(([s, n]) => `<option value="${esc(s)}"${n === me.faculty ? ' selected' : ''}>${esc(s)} · ${esc(n)}</option>`).join('')}</select></span></div>
        <div class="field"><label class="field-label" for="ep-area">Area kost</label><span class="select"><select id="ep-area">
          ${BBK.kostAreas.map((a) => `<option value="${esc(a.id)}"${a.id === me.areaId ? ' selected' : ''}>${esc(BBK.areaShortName(a.id))}</option>`).join('')}</select></span></div>
        <div class="dialog-actions"><button class="btn btn-ghost" value="cancel">Batal</button><button class="btn btn-primary" value="ok">Simpan</button></div>
      </form>`;
      document.body.append(dlg);
      dlg.showModal();
      dlg.addEventListener('close', () => {
        if (dlg.returnValue === 'ok') {
          const name = dlg.querySelector('#ep-name').value.trim();
          const fac = BBK.faculties.find(([s]) => s === dlg.querySelector('#ep-fac').value);
          BBK.auth.update({ ...(name ? { name } : {}), faculty: fac[1], facultyShort: fac[0], areaId: dlg.querySelector('#ep-area').value });
          BBK.flash('Profil diperbarui.');
          location.reload();
        }
        dlg.remove();
      });
    }
  }

  /* ======================= Public seller profile ======================= */
  function renderPublic(u) {
    if (!u) {
      root.innerHTML = emptyHTML('user', 'Profil tidak ditemukan', 'Tautan profilnya mungkin salah.', 'jelajah.html', 'Buka katalog');
      return;
    }
    document.title = `${u.name} — BaBaKos`;
    const items = BBK.products.filter((p) => p.sellerId === u.id).sort((a, b) => (a.status === 'tersedia' ? -1 : 1) - (b.status === 'tersedia' ? -1 : 1));
    const reviews = BBK.reviews.filter((r) => r.sellerId === u.id);
    const joined = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(u.joinedAt));
    let tab = BBK.param('tab') === 'ulasan' || location.hash === '#ulasan' ? 'ulasan' : 'barang';

    root.innerHTML = `<nav class="crumbs" aria-label="Remah roti"><a href="index.html">Beranda</a><span aria-hidden="true">/</span><a href="jelajah.html">Katalog</a><span aria-hidden="true">/</span><span>Profil Toko</span></nav>
      <section class="card seller-hero">
        <div class="profile-id">
          <span class="avatar avatar-lg avatar-cream" aria-hidden="true">${esc(BBK.initials(u.name))}</span>
          <div class="profile-id-text">
            <h1 class="profile-name">${esc(u.name)} <span class="muted">(${esc(BBK.cohortLabel(u))})</span></h1>
            <p class="lead">${esc(u.faculty)} · kost di ${esc(BBK.areaShortName(u.areaId))}</p>
            <p class="verified caption">${BBK.icon('verified', 14)}Terverifikasi @${esc(u.email.split('@')[1])} · bergabung ${esc(joined)}</p>
          </div>
        </div>
        <dl class="profile-stats">
          <div><dt>Trust Score</dt><dd>${u.trustScore}</dd></div>
          <div><dt>Rating</dt><dd>${BBK.icon('star', 16)}${u.rating.toLocaleString('id-ID', { minimumFractionDigits: 1 })}</dd></div>
          <div><dt>Terjual</dt><dd>${u.totalSold}</dd></div>
        </dl>
        <p class="caption trust-note">Trust Score ${u.trustScore}/100 (${BBK.trustLabel(u.trustScore)}): dari email terverifikasi, transaksi selesai, rating, dan kecepatan membalas.</p>
      </section>
      <div class="segmented seller-tabs" role="tablist" aria-label="Isi profil">
        <button type="button" role="tab" data-tab="barang" aria-selected="false">Barang (${items.length})</button>
        <button type="button" role="tab" data-tab="ulasan" aria-selected="false" id="ulasan">Ulasan (${reviews.length})</button>
      </div>
      <div id="seller-panel"></div>`;

    const reviewHTML = (r) => {
      const a = BBK.getUser(r.authorId) || { name: 'Mahasiswa' };
      return `<li class="card review"><div class="review-head">${BBK.avatar(a, 'sm')}<div><p class="review-name">${esc(a.name)}</p>
        <p class="caption">${esc(r.itemTitle)} · ${esc(BBK.formatDayMonth(r.at))}</p></div>
        <span class="stars" aria-label="${r.rating} dari 5">${BBK.icon('star', 14).repeat(r.rating)}</span></div><p>${esc(r.text)}</p></li>`;
    };
    const paint = () => {
      root.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
      $('#seller-panel').innerHTML =
        tab === 'barang'
          ? items.length ? `<ul class="pgrid">${items.map(BBK.productCard).join('')}</ul>` : emptyHTML('tag', 'Belum ada barang', `${BBK.firstName(u.name)} belum menjual barang.`)
          : reviews.length ? `<ul class="review-cards">${reviews.map(reviewHTML).join('')}</ul>` : emptyHTML('chat', 'Belum Ada Ulasan', 'Ulasan muncul setelah pembeli menyelesaikan COD.');
    };
    root.querySelector('.seller-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      tab = b.dataset.tab;
      paint();
    });
    paint();
  }

  function emptyHTML(icon, title, text, href, cta) {
    return `<div class="empty"><span class="empty-icon">${BBK.icon(icon, 32)}</span><p class="empty-title">${esc(title)}</p><p>${esc(text)}</p>
      ${href ? `<a class="btn btn-sm btn-outline" href="${href}">${esc(cta)}</a>` : ''}</div>`;
  }
})();
