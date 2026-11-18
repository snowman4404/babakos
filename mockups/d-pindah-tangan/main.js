/* Mockup D — Pindah tangan. Pick an item in the hero and the whole journey re-tells itself from the data. */
(function () {
  const $ = (s) => document.querySelector(s);
  const short = (id) => BBK.getArea(id).name.split(' (')[0];
  const BUYER_AREA = 'ketawanggede'; // "kamu", the logged-in demo student
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nick = { p1: 'kipasnya', p2: 'rice cookernya', p7: 'sepedanya', p4: 'bukunya' };

  /** Everything the journey needs to say about one product. */
  function storyFor(p) {
    const seller = BBK.getUser(p.sellerId);
    const order = BBK.orders.find((o) => o.productId === p.id);
    const point = order
      ? BBK.getMeetingPoint(order.meetingPointId)
      : BBK.meetingPoints
          .map((m) => ({ m, d: BBK.areaDistance(p.areaId, m.areaId) + BBK.areaDistance(BUYER_AREA, m.areaId) }))
          .sort((a, b) => a.d - b.d)[0].m;
    const min = BBK.walkMinutes(BBK.areaDistance(BUYER_AREA, p.areaId));
    const ceiling = [100000, 200000, 500000, 1000000].find((c) => c >= p.price) || p.price;
    const first = seller.name.split(' ')[0];
    return {
      title: p.title,
      shortTitle: nick[p.id] || 'barangnya',
      price: BBK.formatRupiah(p.price),
      condition: BBK.conditionLabels[p.condition],
      seller: `${first}, terverifikasi`,
      sellerArea: short(p.areaId),
      soldText: `${first} dari ${seller.faculty} sedang beres-beres kamar. ${p.title} difoto, diberi harga ${BBK.formatRupiah(p.price)}, dan tayang hanya untuk akun @student.ub.ac.id.`,
      foundText: `Kamu di Ketawanggede menyaring barang di bawah ${BBK.formatRupiah(ceiling)} dalam 30 menit jalan kaki. ${p.title} muncul, ${min} menit dari kamarmu.`,
      minutes: String(min),
      codName: point.name,
      codShort: point.name.replace(' UB', '').replace(' (Jl. Veteran)', '').replace('Malang Town Square (Matos)', 'Matos'),
      codText: `Titik temu dipilih dari peta kampus: ${point.name}. ${point.description} Dua pihak sepakat Rabu pukul 12.30.`,
      orderId: order ? order.id : 'BBK-2611-' + (100 + Number(p.id.slice(1))),
      thumb: BBK.productImage(p),
    };
  }

  /* ---------- The live thing: follow one item ---------- */
  const itemPhoto = document.querySelector('.ph[data-key="item"]');
  function follow(id, animate) {
    const p = BBK.getProduct(id);
    const s = storyFor(p);
    const fields = document.querySelectorAll('[data-f]');
    const apply = () => {
      fields.forEach((el) => {
        const v = s[el.dataset.f];
        if (v === undefined) return;
        if (el.tagName === 'IMG') { el.src = v; el.alt = ''; } else el.textContent = v;
        el.classList.remove('is-swapping');
      });
      itemPhoto.src = s.thumb;
      itemPhoto.alt = `${p.title} yang dijual`;
    };
    if (animate && !reduce) {
      fields.forEach((el) => el.classList.add('is-swapping'));
      itemPhoto.classList.remove('is-on');
      setTimeout(() => { apply(); if (currentKey === 'item') itemPhoto.classList.add('is-on'); }, 260);
    } else apply();
  }
  const tabs = $('#follow-tabs');
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    tabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    follow(b.dataset.id, true);
  });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const all = [...tabs.querySelectorAll('button')];
    const i = all.findIndex((x) => x.getAttribute('aria-selected') === 'true');
    const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    next.click(); next.focus();
  });

  /* ---------- The fixed photograph changes as its chapter arrives (slow crossfade) ---------- */
  let currentKey = 'item';
  const photos = document.querySelectorAll('.ph');
  function showPhoto(key) {
    if (key === currentKey) return;
    currentKey = key;
    photos.forEach((ph) => ph.classList.toggle('is-on', ph.dataset.key === key));
  }
  const chapterIO = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && showPhoto(e.target.dataset.photo)),
    { rootMargin: '-45% 0px -45% 0px' },
  );
  document.querySelectorAll('.chapter').forEach((c) => chapterIO.observe(c));
  // back at the top: the item again
  const sheetIO = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && showPhoto('item')), { threshold: 0.4 });
  sheetIO.observe($('.sheet'));

  /* ---------- Listing: two-ended rows, grouped by area, nearest the gate first ---------- */
  const areas = BBK.kostAreas.slice().sort((a, b) => a.distanceKm - b.distanceKm);
  $('#list').innerHTML = areas
    .map((a) => {
      const items = BBK.products.filter((p) => p.areaId === a.id).sort((x, y) => x.price - y.price);
      if (!items.length) return '';
      return `<div class="lblock" data-reveal><p class="lgroup">${short(a.id)}, ${a.distanceKm.toString().replace('.', ',')} km dari gerbang</p>` +
        items.map((p) => `<a class="lrow" href="#">
          <span class="ldot"><img src="${BBK.productImage(p)}" alt="" width="16" height="16" loading="lazy"></span>
          <span class="lname">${BBK.escape(p.title)}</span>
          <span class="lval">${p.status === 'tersedia' ? BBK.formatRupiah(p.price) : p.status === 'terjual' ? 'Terjual' : 'Dipesan'}</span>
        </a>`).join('') + '</div>';
    })
    .join('');

  follow('p1', false);
  $('#credits').innerHTML = BBK.creditsHTML();
  BBK.initReveal();
})();
