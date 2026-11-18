/*
 * Beranda (index.html), from the Figma BERANDA frame: banner carousel, category
 * icons, "Paket Bundling Hemat", items near the user's kost, newest items.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const user = BBK.auth.currentUser();
  const available = BBK.products.filter((p) => p.status === 'tersedia');

  /* ---------- Banner: scroll-snap track, dots, gentle auto-advance ---------- */
  const track = $('#banner-track');
  const dots = $('#banner-dots');
  track.innerHTML = BBK.banners
    .map(
      (b, i) => `<article class="banner-slide" aria-roledescription="slide" aria-label="${i + 1} dari ${BBK.banners.length}">
        <img src="${esc(b.image)}" alt="" width="1200" height="480" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
        <div class="banner-copy">
          <h${i ? 2 : 1} class="banner-title">${esc(b.title)}</h${i ? 2 : 1}>
          <p>${esc(b.text)}</p>
          <a class="btn btn-sm banner-cta" href="${esc(b.href)}">${esc(b.cta)}</a>
        </div>
      </article>`,
    )
    .join('');
  dots.innerHTML = BBK.banners.map((b, i) => `<button type="button" aria-label="Sorotan ${i + 1}" aria-pressed="${i === 0}"></button>`).join('');

  const slides = [...track.children];
  let current = 0;
  const goTo = (i) => track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  track.addEventListener(
    'scroll',
    () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i === current) return;
      current = i;
      [...dots.children].forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
    },
    { passive: true },
  );
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) goTo([...dots.children].indexOf(b));
  });
  // Auto-advance every 6 s; pauses while the pointer or focus is inside, or motion is reduced.
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const banner = $('#banner');
  ['mouseenter', 'focusin', 'touchstart'].forEach((ev) => banner.addEventListener(ev, () => (paused = true), { passive: true }));
  ['mouseleave', 'focusout'].forEach((ev) => banner.addEventListener(ev, () => (paused = false)));
  setInterval(() => {
    if (!paused && !document.hidden) goTo((current + 1) % slides.length);
  }, 6000);

  /* ---------- Categories ---------- */
  $('#cats').innerHTML = BBK.categories
    .map((c) => {
      const n = available.filter((p) => p.categoryId === c.id).length;
      return `<li data-reveal><a class="cat" href="jelajah.html?cat=${encodeURIComponent(c.id)}">
        <span class="cat-icon">${BBK.icon(c.icon, 24)}</span>
        <span class="cat-label">${esc(c.short)}</span>
        <span class="sr-only">, ${n} barang</span>
      </a></li>`;
    })
    .join('');

  /* ---------- Bundles ---------- */
  $('#bundles').innerHTML = BBK.bundles
    .map((b) => {
      const info = BBK.bundleInfo(b);
      const names = info.items.map((p) => p.title.split(' ').slice(0, 2).join(' ')).join(' + ');
      const href = info.available ? `checkout.html?bundle=${encodeURIComponent(b.id)}` : '#';
      return `<li data-reveal><a class="bundle${info.available ? '' : ' is-gone'}" href="${href}"${info.available ? '' : ' aria-disabled="true"'}>
        <span class="tag tag-solid bundle-tag">${info.available ? 'Lebih Hemat' : 'Sudah laku'}</span>
        <span class="bundle-thumbs">${info.items.map((p) => `<img src="${esc(BBK.productImage(p))}" alt="" width="56" height="56" loading="lazy">`).join('')}</span>
        <span class="bundle-title">${esc(b.title)}</span>
        <span class="bundle-items">${esc(names)}</span>
        <span class="bundle-price"><strong>${BBK.formatRupiah(b.price)}</strong><s>${BBK.formatRupiah(info.normal)}</s></span>
        <span class="bundle-seller">${BBK.icon('verified', 14)}${esc(BBK.firstName(info.seller.name))} · ${esc(BBK.areaShortName(info.items[0].areaId))}</span>
      </a></li>`;
    })
    .join('');
  $('#bundles').addEventListener('click', (e) => {
    if (e.target.closest('[aria-disabled="true"]')) {
      e.preventDefault();
      BBK.toast('Salah satu barang di paket ini sudah dipesan.', 'error');
    }
  });

  /* ---------- Near your kost (logged in), then newest ---------- */
  const area = user && BBK.getArea(user.areaId);
  if (area) {
    const near = available
      .filter((p) => p.sellerId !== user.id)
      .map((p) => ({ p, km: BBK.areaDistance(area.id, p.areaId) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 6)
      .map((x) => x.p);
    $('#near-section').hidden = false;
    $('#near-title').textContent = `Dekat kostmu di ${BBK.areaShortName(area.id)}`;
    $('#near-sub').textContent = 'Diurutkan dari yang paling dekat jalan kaki.';
    $('#near-more').href = `jelajah.html?sort=nearest`;
    $('#near-grid').innerHTML = near.map(BBK.productCard).join('');
  }

  const newest = available.slice().sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 12);
  $('#new-grid').innerHTML = newest.map(BBK.productCard).join('');
  const areaCount = new Set(available.map((p) => p.areaId)).size;
  $('#new-sub').textContent = `${available.length} barang tersedia dari ${areaCount} area kost di sekitar UB.`;

  if (user) {
    $('#safe-cta').textContent = 'Jual barangmu';
    $('#safe-cta').href = 'jual.html';
  }

  BBK.initReveal();
})();
