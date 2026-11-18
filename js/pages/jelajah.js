/*
 * Jelajah Barang (jelajah.html). Search plus filters (area kost, price range,
 * category, condition) over BBK.products. The state is mirrored in the URL,
 * e.g. jelajah.html?area=ketawanggede&max=100000, so a filtered list can be linked.
 * On phones the filter panel becomes a bottom sheet.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;

  const form = $('#filter-form');
  const search = $('#search');
  const sortSelect = $('#sort');
  const minInput = form.elements.min;
  const maxInput = form.elements.max;
  const grid = $('#grid');

  const statusText = { terjual: 'Terjual', dipesan: 'Dipesan' };
  const areasByDistance = BBK.kostAreas.slice().sort((a, b) => a.distanceKm - b.distanceKm);
  const areaIds = areasByDistance.map((a) => a.id);
  const catIds = BBK.categories.map((c) => c.id);
  const condIds = Object.keys(BBK.conditionLabels);

  const SORTS = {
    newest: (a, b) => new Date(b.postedAt) - new Date(a.postedAt),
    cheapest: (a, b) => a.price - b.price,
    priciest: (a, b) => b.price - a.price,
    nearest: (a, b) => BBK.getArea(a.areaId).distanceKm - BBK.getArea(b.areaId).distanceKm || a.price - b.price,
  };
  const DEFAULT_SORT = 'newest';

  /** "Rp85.000" or "85.000" or "" -> 85000; nothing typed -> null. */
  const digits = (text) => {
    const d = String(text || '').replace(/\D/g, '');
    return d ? Number(d) : null;
  };
  /** 100000 -> "Rp100rb", 1000000 -> "Rp1jt" (for the quick price chips). */
  const shortRupiah = (v) => (v >= 1e6 ? 'Rp' + BBK.formatKm(v / 1e6) + 'jt' : 'Rp' + v / 1000 + 'rb');

  // Everything a search word may match: title, description, category, area, condition.
  const haystacks = new Map(
    BBK.products.map((p) => [
      p.id,
      [p.title, p.description, BBK.getCategory(p.categoryId).label, BBK.getArea(p.areaId).name, BBK.conditionLabels[p.condition]]
        .join(' ')
        .toLowerCase(),
    ]),
  );

  /* ---------- Build the filter options from the data ---------- */
  $('#area-options').innerHTML = areasByDistance
    .map(
      (a) => `<label class="check"><input type="checkbox" name="area" value="${esc(a.id)}">
        <span>${esc(BBK.areaShortName(a.id))}</span><span class="check-hint">${BBK.formatKm(a.distanceKm)} km</span></label>`,
    )
    .join('');

  const chipToggle = (name, value, label) =>
    `<label class="chip-toggle"><input class="sr-only" type="checkbox" name="${name}" value="${esc(value)}"><span class="chip">${esc(label)}</span></label>`;
  $('#cat-options').innerHTML = BBK.categories.map((c) => chipToggle('cat', c.id, c.label)).join('');
  $('#cond-options').innerHTML = condIds.map((id) => chipToggle('cond', id, BBK.conditionLabels[id])).join('');
  $('#price-quick').innerHTML = BBK.priceCeilings
    .map((v) => `<button type="button" class="chip" data-max="${v}" aria-pressed="false" aria-label="Maksimal ${BBK.formatRupiah(v)}">${shortRupiah(v)}</button>`)
    .join('');

  // Subtitle: how much is on offer right now.
  const available = BBK.products.filter((p) => p.status === 'tersedia');
  const areaCount = new Set(available.map((p) => p.areaId)).size;
  $('#browse-sub').textContent = `${available.length} barang tersedia dari ${areaCount} area kost di sekitar Universitas Brawijaya. Saring per area dan harga, lalu chat penjualnya.`;

  /* ---------- State: read from / write to the controls and the URL ---------- */
  function readState() {
    const data = new FormData(form);
    return {
      q: search.value.trim(),
      areas: data.getAll('area'),
      cats: data.getAll('cat'),
      conds: data.getAll('cond'),
      min: digits(minInput.value),
      max: digits(maxInput.value),
      all: form.elements.all.checked,
      sort: sortSelect.value,
    };
  }

  function writeState(s) {
    search.value = s.q;
    const check = (name, values) => form.querySelectorAll(`input[name="${name}"]`).forEach((el) => (el.checked = values.includes(el.value)));
    check('area', s.areas);
    check('cat', s.cats);
    check('cond', s.conds);
    minInput.value = s.min === null ? '' : s.min.toLocaleString('id-ID');
    maxInput.value = s.max === null ? '' : s.max.toLocaleString('id-ID');
    form.elements.all.checked = s.all;
    sortSelect.value = s.sort;
  }

  function stateFromURL() {
    const params = new URLSearchParams(location.search);
    const list = (key, valid) => (params.get(key) || '').split(',').filter((v) => valid.includes(v));
    const sort = params.get('sort');
    return {
      q: params.get('q') || '',
      areas: list('area', areaIds),
      cats: list('cat', catIds),
      conds: list('cond', condIds),
      min: digits(params.get('min')),
      max: digits(params.get('max')),
      all: params.get('all') === '1',
      sort: SORTS[sort] ? sort : DEFAULT_SORT,
    };
  }

  function syncURL(s) {
    const params = new URLSearchParams();
    if (s.q) params.set('q', s.q);
    if (s.areas.length) params.set('area', s.areas.join(','));
    if (s.min !== null) params.set('min', s.min);
    if (s.max !== null) params.set('max', s.max);
    if (s.cats.length) params.set('cat', s.cats.join(','));
    if (s.conds.length) params.set('cond', s.conds.join(','));
    if (s.all) params.set('all', '1');
    if (s.sort !== DEFAULT_SORT) params.set('sort', s.sort);
    const qs = params.toString();
    try {
      history.replaceState(null, '', qs ? '?' + qs : location.pathname);
    } catch {
      /* some browsers refuse this on file:// — the page still works */
    }
  }

  const hasPriceError = (s) => s.min !== null && s.max !== null && s.min > s.max;

  function matches(p, s, priceOk) {
    if (!s.all && p.status !== 'tersedia') return false;
    if (s.areas.length && !s.areas.includes(p.areaId)) return false;
    if (s.cats.length && !s.cats.includes(p.categoryId)) return false;
    if (s.conds.length && !s.conds.includes(p.condition)) return false;
    if (priceOk && s.min !== null && p.price < s.min) return false;
    if (priceOk && s.max !== null && p.price > s.max) return false;
    const words = s.q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay = haystacks.get(p.id);
    return words.every((w) => hay.includes(w));
  }

  /* ---------- Rendering ---------- */
  function card(p, i) {
    const seller = BBK.getUser(p.sellerId);
    const first = seller.name.split(' ')[0];
    const gone = statusText[p.status];
    return `<li class="pcard${gone ? ' is-gone' : ''}" style="--i:${Math.min(i, 12)}">
      <a href="produk.html?id=${encodeURIComponent(p.id)}">
        <span class="pcard-photo">
          <img src="${esc(BBK.productImage(p))}" alt="" width="480" height="600" loading="lazy">
          ${gone ? `<span class="pcard-status">${gone}</span>` : ''}
        </span>
        <h3 class="pcard-title">${esc(p.title)}</h3>
        <p class="pcard-price">${BBK.formatRupiah(p.price)}</p>
        <p class="pcard-meta">${esc(BBK.areaShortName(p.areaId))} · ${esc(BBK.conditionLabels[p.condition])}</p>
        ${seller.verified ? `<p class="pcard-meta pcard-seller">${BBK.icon('verified', 15)}<span>${esc(first)}, terverifikasi</span></p>` : ''}
      </a>
    </li>`;
  }

  function priceLabel(s) {
    if (s.min !== null && s.max !== null) return `${BBK.formatRupiah(s.min)}–${BBK.formatRupiah(s.max)}`;
    if (s.max !== null) return `Sampai ${BBK.formatRupiah(s.max)}`;
    return `Mulai ${BBK.formatRupiah(s.min)}`;
  }

  const uncheck = (name, value) => () => {
    const el = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = false;
  };

  /** Removable tokens for every active filter; returns how many there are. */
  let clearers = [];
  function renderActive(s, priceOk) {
    const active = [];
    if (s.q) active.push([`“${s.q}”`, () => (search.value = '')]);
    s.areas.forEach((id) => active.push([BBK.areaShortName(id), uncheck('area', id)]));
    if (priceOk && (s.min !== null || s.max !== null)) {
      active.push([priceLabel(s), () => ((minInput.value = ''), (maxInput.value = ''))]);
    }
    s.cats.forEach((id) => active.push([BBK.getCategory(id).label, uncheck('cat', id)]));
    s.conds.forEach((id) => active.push([BBK.conditionLabels[id], uncheck('cond', id)]));
    if (s.all) active.push(['Termasuk yang sudah laku', () => (form.elements.all.checked = false)]);

    clearers = active.map(([, clear]) => clear);
    $('#active-filters').innerHTML = active
      .map(([label], i) => `<button type="button" class="active-chip" data-i="${i}" aria-label="Hapus filter ${esc(label)}">${esc(label)}${BBK.icon('x', 16)}</button>`)
      .join('');
    // The search lives in the head, so the phone's Filter button counts the rest.
    return active.length - (s.q ? 1 : 0);
  }

  function render() {
    const s = readState();
    const priceError = hasPriceError(s);
    const priceOk = !priceError;
    $('#price-error').hidden = priceOk;
    [minInput, maxInput].forEach((el) => el.setAttribute('aria-invalid', String(priceError)));

    const list = BBK.products.filter((p) => matches(p, s, priceOk)).sort(SORTS[s.sort]);
    grid.innerHTML = list.map(card).join('');
    grid.hidden = !list.length;
    $('#empty').hidden = list.length > 0;

    const filterCount = renderActive(s, priceOk);
    const filtered = filterCount > 0 || s.q;
    $('#result-count').textContent = filtered ? `${list.length} barang ditemukan` : `${list.length} barang ${s.all ? 'dijual' : 'tersedia'}`;
    $('#filters-count').textContent = filterCount ? `(${filterCount})` : '';
    $('#filters-apply').textContent = list.length ? `Tampilkan ${list.length} barang` : 'Belum ada yang cocok';
    $('#search-clear').hidden = !s.q;
    document.querySelectorAll('#price-quick .chip').forEach((b) => b.setAttribute('aria-pressed', String(s.max === Number(b.dataset.max))));

    syncURL(s);
  }

  function resetFilters() {
    form.reset();
    search.value = '';
    render();
  }

  /* ---------- Events ---------- */
  form.addEventListener('input', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  // Price fields: show thousands separators once the user leaves the field.
  form.addEventListener('focusout', (e) => {
    if (e.target !== minInput && e.target !== maxInput) return;
    const v = digits(e.target.value);
    e.target.value = v === null ? '' : v.toLocaleString('id-ID');
  });
  $('#price-quick').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-max]');
    if (!b) return;
    const v = Number(b.dataset.max);
    maxInput.value = digits(maxInput.value) === v ? '' : v.toLocaleString('id-ID');
    render();
  });

  search.addEventListener('input', render);
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (sheetMQ.matches) search.blur(); // closes the phone keyboard so the results show
  });
  $('#search-clear').addEventListener('click', () => {
    search.value = '';
    render();
    search.focus();
  });
  sortSelect.addEventListener('change', render);

  $('#active-filters').addEventListener('click', (e) => {
    const b = e.target.closest('.active-chip');
    if (!b) return;
    clearers[Number(b.dataset.i)]();
    render();
    const next = $('#active-filters .active-chip');
    (next || $('#result-count')).focus();
  });
  $('#filters-reset').addEventListener('click', resetFilters);
  $('#empty-reset').addEventListener('click', () => {
    resetFilters();
    $('#result-count').focus();
  });

  /* ---------- Phone bottom sheet ---------- */
  const sheetMQ = matchMedia('(max-width: 900px)');
  const panel = $('#filters');
  const backdrop = $('#filters-backdrop');
  const toggle = $('#filters-toggle');
  const behindSheet = [$('#site-header'), $('#site-footer'), $('.browse-head'), $('.results')];

  function setSheet(open, returnFocus) {
    panel.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('sheet-locked', open);
    behindSheet.forEach((el) => el && (el.inert = open));
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      $('#filters-close').focus();
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
      if (returnFocus) toggle.focus();
    }
  }
  const isOpen = () => panel.classList.contains('is-open');

  toggle.addEventListener('click', () => setSheet(true));
  $('#filters-close').addEventListener('click', () => setSheet(false, true));
  $('#filters-apply').addEventListener('click', () => setSheet(false, true));
  backdrop.addEventListener('click', () => setSheet(false, true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setSheet(false, true);
  });
  sheetMQ.addEventListener('change', (e) => {
    if (!e.matches && isOpen()) setSheet(false, false);
  });

  writeState(stateFromURL());
  render();
  BBK.initReveal();
})();
