/*
 * Detail Barang (produk.html?id=p1), from the Figma DETAIL PRODUK frame: photo and
 * thumbnails, price, tags, COD location, share + wishlist, description, seller row
 * with Trust Score, Chat + Beli, shop profile, reviews, similar items.
 * Chat and checkout require login, so logged-out visitors go through masuk.html first.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const user = BBK.auth.currentUser();
  const p = BBK.getProduct(BBK.param('id'));

  if (!p) {
    $('#product-view').hidden = true;
    $('#serupa').hidden = true;
    $('#not-found').hidden = false;
    document.title = 'Barang tidak ditemukan — BaBaKos';
    return;
  }

  const seller = BBK.getUser(p.sellerId);
  const first = BBK.firstName(seller.name);
  const area = BBK.getArea(p.areaId);
  const areaShort = BBK.areaShortName(p.areaId);
  const category = BBK.getCategory(p.categoryId);
  const isOwn = !!user && user.id === p.sellerId;
  const myOrder = user && BBK.orders.find((o) => o.buyerId === user.id && o.productIds.includes(p.id) && o.status !== 'dibatalkan');

  document.title = `${p.title} — BaBaKos`;

  /* ---------- Photo + thumbnails ---------- */
  const mainImg = $('#gallery-img');
  const images = p.images && p.images.length ? p.images : [BBK.productImage(p)];
  const showImage = (i) => {
    mainImg.src = images[i];
    mainImg.alt = images.length > 1 ? `${p.title}, foto ${i + 1} dari ${images.length}` : p.title;
  };
  showImage(0);
  const thumbs = $('#gallery-thumbs');
  thumbs.innerHTML = images
    .map(
      (src, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}" aria-label="Foto ${i + 1}">
        <img src="${esc(src)}" alt="" width="80" height="80" loading="lazy"></button>`,
    )
    .join('');
  thumbs.hidden = images.length < 2;
  thumbs.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    thumbs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    showImage(Number(b.dataset.i));
  });

  /* ---------- Title, price, tags, location ---------- */
  const statusTag = { tersedia: ['Dijual', 'tag-cream'], dipesan: ['Dipesan', 'tag-solid'], terjual: ['Terjual', 'tag-solid'] }[p.status];
  if (p.status !== 'tersedia') {
    $('#p-status').textContent = statusTag[0];
    $('#p-status').hidden = false;
    mainImg.classList.add('is-gone');
    $('#p-price').classList.add('is-gone');
  }
  $('#p-title').textContent = p.title;
  $('#p-price').textContent = BBK.formatRupiah(p.price);
  $('#p-tags').innerHTML = `
    <span class="tag tag-mauve">Kondisi: ${esc(BBK.conditionLabels[p.condition])}</span>
    <a class="tag tag-mauve" href="jelajah.html?cat=${encodeURIComponent(category.id)}">Kategori: ${esc(category.short)}</a>
    <span class="tag ${statusTag[1]}">${statusTag[0]}</span>`;

  const buyerAreaId = user && BBK.getArea(user.areaId) && !isOwn ? user.areaId : null;
  const point = BBK.nearestMeetingPoint(p.areaId, buyerAreaId || p.areaId);
  $('#p-loc').innerHTML = `${BBK.icon('pin', 18)}<span>Lokasi COD: ${esc(point.shortName)} · area ${esc(areaShort)}</span>`;
  const km = buyerAreaId ? BBK.areaDistance(buyerAreaId, p.areaId) : area.distanceKm;
  $('#p-near').textContent = buyerAreaId
    ? `${BBK.walkMinutes(km)} menit jalan kaki dari kostmu di ${BBK.areaShortName(buyerAreaId)}.`
    : `${BBK.formatKm(area.distanceKm)} km dari kawasan kampus.`;
  $('#p-desc').textContent = p.description;
  $('#p-posted').textContent = `Diunggah ${BBK.timeAgo(p.postedAt).toLowerCase()} · ${category.label}`;

  /* ---------- Share + wishlist ---------- */
  $('#p-share').addEventListener('click', async () => {
    const data = { title: p.title, text: `${p.title} — ${BBK.formatRupiah(p.price)} di BaBaKos`, url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(location.href);
      BBK.toast('Tautan barang disalin.');
    } catch (err) {
      if (err && err.name !== 'AbortError') BBK.toast('Tautan tidak bisa disalin di browser ini.', 'error');
    }
  });
  const wish = $('#p-wish');
  const paintWish = (on) => {
    wish.setAttribute('aria-pressed', String(on));
    wish.setAttribute('aria-label', on ? 'Hapus dari wishlist' : 'Simpan ke wishlist');
  };
  paintWish(BBK.wishlist.has(p.id));
  wish.addEventListener('click', () => {
    const on = BBK.wishlist.toggle(p.id);
    paintWish(on);
    BBK.toast(on ? 'Disimpan ke wishlist.' : 'Dihapus dari wishlist.');
  });

  /* ---------- Seller row (Figma: avatar, "Nama (FEB '22)", Trust Score, Chat) ---------- */
  const thread = user && BBK.threadForProduct(p.id, user.id);
  const chatHref = thread ? `chat.html?thread=${encodeURIComponent(thread.id)}` : `chat.html?product=${encodeURIComponent(p.id)}`;
  const profileHref = isOwn ? 'profil.html' : `profil.html?id=${encodeURIComponent(seller.id)}`;
  $('#seller-row').innerHTML = `
    <a class="seller-who" href="${profileHref}">
      <span class="avatar avatar-cream" aria-hidden="true">${esc(BBK.initials(seller.name))}</span>
      <span>
        <span class="seller-name">${esc(seller.name)} (${esc(BBK.cohortLabel(seller))})</span>
        <span class="seller-trust">Trust Score: ${seller.trustScore}/100 (${BBK.trustLabel(seller.trustScore)})</span>
      </span>
    </a>
    ${isOwn ? '' : `<a class="btn btn-outline btn-sm" href="${chatHref}">Chat</a>`}`;

  /* ---------- Actions: buy, or why not ---------- */
  const note = $('#p-note');
  const say = (html) => {
    note.innerHTML = html;
    note.hidden = false;
  };
  const chatIcon = `<a class="icon-btn icon-btn-outline" href="${chatHref}" aria-label="Chat ${esc(first)}">${BBK.icon('chat-dots', 24)}</a>`;
  let actions;
  if (isOwn) {
    say(`${BBK.icon('info', 18)}<span>Ini barang yang kamu jual.</span>`);
    actions = `<a class="btn btn-outline" href="profil.html">Lihat di profil</a><a class="btn" href="pesanan.html?tab=penjualan">Kelola pesanan</a>`;
  } else if (myOrder) {
    say(`${BBK.icon('circle-check', 18)}<span>Kamu sudah memesan barang ini (${esc(BBK.statusLabel(myOrder.status))}).</span>`);
    actions = `${chatIcon}<a class="btn" href="lacak.html?id=${encodeURIComponent(myOrder.id)}">Lacak pesanan</a>`;
  } else if (p.status === 'dipesan') {
    say(`${BBK.icon('info', 18)}<span>Sedang dipesan pembeli lain. Tanya ${esc(first)} kalau pesanannya batal.</span>`);
    actions = `${chatIcon}<a class="btn" href="#serupa">Lihat barang serupa</a>`;
  } else if (p.status === 'terjual') {
    say(`${BBK.icon('info', 18)}<span>Barang ini sudah terjual.</span>`);
    actions = `<a class="btn" href="#serupa">Lihat barang serupa</a>`;
  } else {
    actions = `${chatIcon}<a class="btn" href="checkout.html?product=${encodeURIComponent(p.id)}">Beli</a>`;
    if (!user) say(`${BBK.icon('lock', 18)}<span>Chat dan beli perlu masuk dengan email kampus (ac.id).</span>`);
  }
  $('#p-actions').innerHTML = actions;
  document.body.classList.add('has-actionbar'); // on phones the action row sticks to the bottom

  /* ---------- Shop profile ---------- */
  $('#shop-link').href = profileHref;
  $('#shop-avatar').textContent = BBK.initials(seller.name);
  $('#shop-name').textContent = seller.name;
  $('#shop-meta').textContent = `${BBK.cohortLabel(seller)} · ${seller.faculty}${seller.universityShort ? ` · ${seller.universityShort}` : ''}`;
  $('#shop-trust').textContent = seller.trustScore;
  $('#shop-rating').innerHTML = `${BBK.icon('star', 14)}${seller.rating.toLocaleString('id-ID', { minimumFractionDigits: 1 })}`;
  $('#shop-sold').textContent = seller.totalSold;

  /* ---------- Reviews of this seller ---------- */
  const reviews = BBK.reviews.filter((r) => r.sellerId === seller.id);
  $('#reviews-more').href = `${profileHref}${profileHref.includes('?') ? '&' : '?'}tab=ulasan#ulasan`;
  $('#reviews-more').hidden = !reviews.length;
  $('#reviews-list').innerHTML = reviews.length
    ? `<ul class="review-list">${reviews.slice(0, 2).map(reviewHTML).join('')}</ul>`
    : `<div class="empty empty-compact">
        <span class="empty-icon" aria-hidden="true">${BBK.icon('chat', 28)}</span>
        <p class="empty-title">Belum Ada Ulasan</p>
        <p>Penjual ini belum memiliki ulasan. Jadilah yang pertama memberi ulasan setelah COD.</p>
      </div>`;

  function reviewHTML(r) {
    const author = BBK.getUser(r.authorId) || { name: 'Mahasiswa' };
    return `<li class="review">
      <div class="review-head">
        ${BBK.avatar(author, 'sm')}
        <div><p class="review-name">${esc(author.name)}</p><p class="caption">${esc(r.itemTitle)} · ${esc(BBK.formatDayMonth(r.at))}</p></div>
        <span class="stars" aria-label="${r.rating} dari 5">${BBK.icon('star', 14).repeat(r.rating)}</span>
      </div>
      <p>${esc(r.text)}</p>
    </li>`;
  }

  /* ---------- Similar: same category first, then same area, then nearest ---------- */
  const score = (x) => (x.categoryId === p.categoryId ? 2 : 0) + (x.areaId === p.areaId ? 1 : 0);
  const similar = BBK.products
    .filter((x) => x.id !== p.id && x.status === 'tersedia')
    .sort((a, b) => score(b) - score(a) || BBK.areaDistance(p.areaId, a.areaId) - BBK.areaDistance(p.areaId, b.areaId))
    .slice(0, 6);
  $('#similar-grid').innerHTML = similar.map(BBK.productCard).join('');
  $('#similar-more').href = `jelajah.html?cat=${encodeURIComponent(category.id)}`;
})();
