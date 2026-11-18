/*
 * Jual Barang (jual.html). Photos are shrunk in the browser (max 640 px JPEG) so a
 * listing fits in localStorage; the preview card updates as the seller types.
 * "Terbitkan" saves the listing with BBK.save.listing and opens its detail page.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();
  const form = $('#sell-form');
  const f = form.elements;
  const MAX_PHOTOS = 3;
  let photos = []; // data URLs or site paths
  let category = '';
  let condition = 'baik';

  /* ---------- Options ---------- */
  $('#cats').innerHTML = BBK.categories
    .map((c) => `<button type="button" class="chip" data-cat="${esc(c.id)}" aria-pressed="false">${BBK.icon(c.icon, 16)}${esc(c.label)}</button>`)
    .join('');
  $('#conds').innerHTML = Object.entries(BBK.conditionLabels)
    .map(([id, label]) => `<button type="button" class="chip" data-cond="${esc(id)}" aria-pressed="${id === condition}">${esc(label)}</button>`)
    .join('');
  // The listing takes its area from the seller's profile (this page requires login).
  const areaId = me.areaId;

  const digits = (t) => Number(String(t).replace(/\D/g, '')) || 0;

  /* ---------- Photos ---------- */
  /** Read an image file and shrink it to at most 640 px on the long side. */
  const shrink = (file) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 640 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('bad image'));
      };
      img.src = url;
    });

  function renderPhotos() {
    $('#photos').querySelectorAll('.photo').forEach((el) => el.remove());
    $('#photo-add').insertAdjacentHTML(
      'beforebegin',
      photos
        .map(
          (src, i) => `<figure class="photo">
            <img src="${esc(src)}" alt="Foto ${i + 1}" width="120" height="120">
            ${i === 0 ? '<figcaption class="photo-cover">Sampul</figcaption>' : ''}
            <button type="button" class="photo-remove" data-i="${i}" aria-label="Hapus foto ${i + 1}">${BBK.icon('x', 14)}</button>
          </figure>`,
        )
        .join(''),
    );
    $('#photo-add').hidden = photos.length >= MAX_PHOTOS;
    update();
  }

  $('#photo-input').addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    for (const file of files) {
      try {
        photos.push(await shrink(file));
      } catch {
        BBK.toast('Foto itu tidak bisa dibuka. Coba JPG atau PNG lain.', 'error');
      }
    }
    showError('photo-error', '');
    renderPhotos();
  });
  $('#photos').addEventListener('click', (e) => {
    const b = e.target.closest('.photo-remove');
    if (!b) return;
    photos.splice(Number(b.dataset.i), 1);
    renderPhotos();
  });

  /* ---------- Choices ---------- */
  $('#cats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    category = b.dataset.cat;
    $('#cats').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    showError('cat-error', '');
    update();
  });
  $('#conds').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cond]');
    if (!b) return;
    condition = b.dataset.cond;
    $('#conds').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    update();
  });

  // Price: thousands separators while typing, and a hint from similar listings.
  f.price.addEventListener('input', () => {
    const v = digits(f.price.value);
    f.price.value = v ? v.toLocaleString('id-ID') : '';
    if (f.price.getAttribute('aria-invalid') === 'true') checks.price();
  });

  /* ---------- Validation ---------- */
  function showError(id, text, input) {
    const el = $('#' + id);
    el.innerHTML = text ? BBK.icon('info', 14) + esc(text) : '';
    el.hidden = !text;
    if (input) input.setAttribute('aria-invalid', String(!!text));
  }
  const checks = {
    photo: () => (photos.length ? (showError('photo-error', ''), true) : (showError('photo-error', 'Tambahkan minimal 1 foto.'), false)),
    title: () => {
      const err = f.title.value.trim().length < 5 ? 'Nama barang minimal 5 huruf.' : '';
      showError('title-error', err, f.title);
      return !err;
    },
    cat: () => (category ? (showError('cat-error', ''), true) : (showError('cat-error', 'Pilih satu kategori.'), false)),
    price: () => {
      const v = digits(f.price.value);
      const err = v < 1000 ? 'Harga minimal Rp1.000.' : v > 20000000 ? 'Harga maksimal Rp20.000.000.' : '';
      showError('price-error', err, f.price);
      return !err;
    },
  };

  /* ---------- Live preview + checklist ---------- */
  function draft() {
    return {
      id: 'preview',
      title: f.title.value.trim() || 'Nama barangmu',
      description: f.desc.value.trim(),
      price: digits(f.price.value),
      categoryId: category || 'lainnya',
      condition,
      areaId,
      sellerId: me.id,
      images: photos.length ? photos.slice() : [],
      postedAt: new Date().toISOString(),
      status: 'tersedia',
    };
  }

  function update() {
    const p = draft();
    $('#preview').innerHTML = BBK.productCard(p).replace(/href="[^"]*"/, 'href="#" tabindex="-1" aria-disabled="true"');
    if (!photos.length) $('#preview img').src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#f5eaeb"/></svg>');
    $('#title-count').textContent = `${f.title.value.length}/60`;
    $('#desc-count').textContent = `${f.desc.value.length}/300`;

    const same = BBK.products.filter((x) => x.categoryId === category && x.id !== 'preview');
    if (category && same.length) {
      const avg = Math.round(same.reduce((s, x) => s + x.price, 0) / same.length / 1000) * 1000;
      $('#price-hint').textContent = `Rata-rata ${BBK.getCategory(category).label.toLowerCase()} di BaBaKos: ${BBK.formatRupiah(avg)}.`;
    }

    const list = [
      [photos.length > 0, 'Minimal 1 foto'],
      [f.title.value.trim().length >= 5, 'Nama barang'],
      [!!category, 'Kategori'],
      [digits(f.price.value) >= 1000, 'Harga'],
    ];
    $('#checklist').innerHTML = list.map(([ok, label]) => `<li class="${ok ? 'is-ok' : ''}">${BBK.icon(ok ? 'circle-check' : 'clock', 16)}${esc(label)}</li>`).join('');
  }
  form.addEventListener('input', update);
  $('#preview').addEventListener('click', (e) => e.preventDefault());

  /* ---------- Publish ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const order = [['photo', $('#photo-input')], ['title', f.title], ['cat', $('#cats button')], ['price', f.price]];
    const results = order.map(([k]) => checks[k]());
    const bad = order[results.indexOf(false)];
    if (bad) {
      bad[1].focus();
      bad[1].closest('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const p = { ...draft(), id: BBK.newId('p') };
    if (!p.description) p.description = 'Tanya detailnya lewat chat ya.';
    if (!BBK.save.listing(p)) {
      BBK.toast('Penyimpanan browser penuh. Coba foto lebih sedikit, atau reset data demo.', 'error');
      return;
    }
    BBK.flash('Barangmu sudah tayang di katalog!');
    location.href = `produk.html?id=${encodeURIComponent(p.id)}`;
  });

  // Demo shortcut: a complete listing in one click (uses a sample photo from the site).
  $('#sample').addEventListener('click', () => {
    photos = ['assets/products/p15-laci.jpg'];
    f.title.value = 'Laci Plastik Mini 5 Susun';
    f.desc.value = 'Masih kokoh, roda lengkap. Dijual karena pindah ke kost yang sudah ada lemari.';
    f.price.value = (55000).toLocaleString('id-ID');
    $('#cats').querySelector('[data-cat="perabot"]').click();
    renderPhotos();
    checks.photo();
    checks.title();
    checks.price();
  });

  update();
})();
