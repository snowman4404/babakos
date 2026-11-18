/*
 * Beranda (index.html). Pick an item in the hero and the five-chapter journey
 * re-tells itself from the mock data; below it, the listing grouped by kost area.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const user = BBK.auth.currentUser();
  // "Kamu" is the logged-in student, or the demo student in Ketawanggede.
  const buyerAreaId = (user && BBK.getArea(user.areaId) && user.areaId) || BBK.getUser(BBK.CURRENT_USER_ID).areaId;
  const journey = BBK.homeJourney;

  /** Fill the {cod} and {price} placeholders of a slip line. */
  const fillSlip = (text, story) => text.replace('{cod}', story.codShort).replace('{price}', story.price);

  /** The order slip (head, days, rows, total) built from BBK.homeJourney. */
  function slipHTML(story) {
    const days = journey.slip
      .map(
        (day) => `<p class="slip-day">${BBK.escape(day.day)}</p>
          <dl>${day.rows
            .map(([label, value]) => `<div><dt>${BBK.escape(fillSlip(label, story))}</dt><dd>${BBK.escape(fillSlip(value, story))}</dd></div>`)
            .join('')}</dl>`,
      )
      .join('');
    return `<p class="slip-head">Pesanan ${BBK.escape(story.orderId)}</p>${days}
      <p class="slip-total"><span>${BBK.escape(journey.doneLabel)}</span><span>${BBK.escape(journey.doneAt)}</span></p>`;
  }

  /** Everything the journey needs to say about one product. */
  function storyFor(p) {
    const seller = BBK.getUser(p.sellerId);
    const first = seller.name.split(' ')[0];
    const order = BBK.orders.find((o) => o.productId === p.id);
    // Use the real order's meeting point, else the point that is closest for both sides.
    const point = order ? BBK.getMeetingPoint(order.meetingPointId) : BBK.nearestMeetingPoint(p.areaId, buyerAreaId);
    const minutes = BBK.walkMinutes(BBK.areaDistance(buyerAreaId, p.areaId));
    const ceiling = BBK.priceCeilings.find((c) => c >= p.price) || p.price;
    const price = BBK.formatRupiah(p.price);
    const buyerArea = BBK.areaShortName(buyerAreaId);
    const story = {
      title: p.title,
      shortTitle: journey.nicknames[p.id] || 'barangnya',
      price,
      condition: BBK.conditionLabels[p.condition],
      seller: `${first}, terverifikasi`,
      sellerArea: BBK.areaShortName(p.areaId),
      buyerArea,
      soldText: `${first} dari ${seller.faculty} sedang beres-beres kamar. ${p.title} difoto, diberi harga ${price}, dan tayang hanya untuk akun @student.ub.ac.id.`,
      foundText: `Kamu di ${buyerArea} menyaring barang di bawah ${BBK.formatRupiah(ceiling)} dalam 30 menit jalan kaki. ${p.title} muncul, ${minutes} menit dari kamarmu.`,
      minutes: String(minutes),
      codName: point.name,
      codShort: point.shortName,
      codDay: journey.codDay,
      codTime: journey.codTime,
      codText: `Titik temu dipilih dari peta kampus: ${point.name}. ${point.description} Dua pihak sepakat ${journey.codDay} pukul ${journey.codTime}.`,
      orderId: journey.orderIds[p.id] || '',
      thumb: BBK.productImage(p),
    };
    story.slip = slipHTML(story);
    return story;
  }

  /* ---------- Show one item through the whole journey ---------- */
  const itemPhoto = $('.ph[data-key="item"]');
  let currentKey = 'item';

  function showItem(id, animate) {
    const p = BBK.getProduct(id);
    const story = storyFor(p);
    const fields = document.querySelectorAll('[data-f]');
    const apply = () => {
      fields.forEach((el) => {
        const value = story[el.dataset.f];
        if (value === undefined) return;
        if (el.tagName === 'IMG') el.src = value;
        else if (el.dataset.f === 'slip') el.innerHTML = value; // built from escaped data in slipHTML()
        else el.textContent = value;
        el.classList.remove('is-swapping');
      });
      itemPhoto.src = story.thumb;
      itemPhoto.alt = `${p.title} yang dijual`;
    };
    if (animate && !reduce) {
      fields.forEach((el) => el.classList.add('is-swapping'));
      itemPhoto.classList.remove('is-on');
      setTimeout(() => {
        apply();
        if (currentKey === 'item') itemPhoto.classList.add('is-on');
      }, 260);
    } else {
      apply();
    }
  }

  const tabs = $('#follow-tabs');
  const tabButtons = [...tabs.querySelectorAll('button')];
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.getAttribute('aria-selected') === 'true') return;
    tabButtons.forEach((x) => {
      x.setAttribute('aria-selected', String(x === b));
      x.tabIndex = x === b ? 0 : -1;
    });
    showItem(b.dataset.id, true);
  });
  tabs.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabButtons.findIndex((x) => x.getAttribute('aria-selected') === 'true');
    const step = e.key === 'ArrowRight' ? 1 : tabButtons.length - 1;
    const next = tabButtons[(i + step) % tabButtons.length];
    next.click();
    next.focus();
  });

  /* ---------- The fixed photograph changes as its chapter arrives ---------- */
  const photos = document.querySelectorAll('.ph');
  function showPhoto(key) {
    if (key === currentKey) return;
    currentKey = key;
    photos.forEach((ph) => ph.classList.toggle('is-on', ph.dataset.key === key));
  }
  const chapterIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && showPhoto(e.target.dataset.photo)),
    { rootMargin: '-45% 0px -45% 0px' },
  );
  document.querySelectorAll('.chapter').forEach((c) => chapterIO.observe(c));
  // Back at the top: the item again.
  const sheetIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && showPhoto('item')),
    { threshold: 0.4 },
  );
  sheetIO.observe($('.sheet'));

  /* ---------- Listing: grouped by area, nearest the gate first, cheapest first ---------- */
  const statusText = { terjual: 'Terjual', dipesan: 'Dipesan' };
  $('#list').innerHTML = BBK.kostAreas
    .slice()
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map((area) => {
      const items = BBK.products.filter((p) => p.areaId === area.id).sort((x, y) => x.price - y.price);
      if (!items.length) return '';
      const rows = items
        .map(
          (p) => `<a class="lrow" href="produk.html?id=${encodeURIComponent(p.id)}">
            <span class="ldot"><img src="${BBK.escape(BBK.productImage(p))}" alt="" width="16" height="16" loading="lazy"></span>
            <span class="lname">${BBK.escape(p.title)}</span>
            <span class="lval">${statusText[p.status] || BBK.formatRupiah(p.price)}</span>
          </a>`,
        )
        .join('');
      return `<div class="lblock" data-reveal>
          <p class="lgroup">${BBK.escape(BBK.areaShortName(area.id))}, ${BBK.formatKm(area.distanceKm)} km dari gerbang</p>${rows}
        </div>`;
    })
    .join('');

  // COD hours in the FAQ facts.
  $('#cod-hours').textContent = `${BBK.codHours.open} sampai ${BBK.codHours.close}`;

  // Already logged in: no need to ask them to register.
  if (user) {
    $('#faq-actions').innerHTML = '<a class="btn" href="jelajah.html">Cari barang dengan filter</a><a href="jual.html">Jual barangmu</a>';
  }

  showItem('p1', false);
  BBK.initReveal();
})();
