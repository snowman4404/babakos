/*
 * Chat (chat.html?thread=c1 or chat.html?product=p1). Thread list + room.
 * Opening from a product starts (or reopens) the thread with that product card
 * attached automatically to the first message. The other side "types" and answers
 * with a canned reply so the demo feels alive. Everything is saved in BBK.store.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const me = BBK.auth.currentUser();
  const mine = () => BBK.chatThreads.filter((t) => t.buyerId === me.id || t.sellerId === me.id);
  const other = (t) => BBK.getUser(t.buyerId === me.id ? t.sellerId : t.buyerId);
  const lastMsg = (t) => t.messages[t.messages.length - 1];
  const phone = matchMedia('(max-width: 899px)');
  let current = null;

  /* ---------- Start from a product: reuse the thread or make a draft one ---------- */
  const fromProduct = BBK.getProduct(BBK.param('product'));
  if (fromProduct && fromProduct.sellerId !== me.id) {
    const existing = BBK.threadForProduct(fromProduct.id, me.id);
    if (existing) {
      current = existing;
    } else {
      current = { id: BBK.newId('c'), productId: fromProduct.id, buyerId: me.id, sellerId: fromProduct.sellerId, unread: 0, messages: [], draft: true };
    }
  } else {
    current = BBK.getThread(BBK.param('thread')) || null;
  }

  /* ---------- Thread list ---------- */
  function renderList() {
    const threads = mine().sort((a, b) => new Date((lastMsg(b) || {}).sentAt || 0) - new Date((lastMsg(a) || {}).sentAt || 0));
    if (current && current.draft) threads.unshift(current);
    const unread = threads.filter((t) => t.unread > 0).length;
    $('#list-sub').textContent = threads.length ? `${threads.length} percakapan${unread ? ` · ${unread} belum dibaca` : ''}` : 'Belum ada percakapan';
    $('#threads').innerHTML = threads
      .map((t) => {
        const u = other(t);
        const p = BBK.getProduct(t.productId);
        const m = lastMsg(t);
        const role = t.sellerId === me.id ? 'Pembeli' : 'Penjual';
        return `<li><a class="thread${current && current.id === t.id ? ' is-active' : ''}" href="chat.html?thread=${encodeURIComponent(t.id)}" data-id="${esc(t.id)}">
          ${BBK.avatar(u)}
          <span class="thread-text">
            <span class="thread-top"><span class="thread-name">${esc(u.name)}</span><span class="thread-time">${m ? esc(BBK.timeAgo(m.sentAt)) : 'Baru'}</span></span>
            <span class="thread-product">${role} · ${esc(p ? p.title : '')}</span>
            <span class="thread-last">${m ? (m.senderId === me.id ? 'Kamu: ' : '') + esc(m.text) : 'Kartu barang siap terlampir'}</span>
          </span>
          ${t.unread ? `<span class="thread-unread" aria-label="${t.unread} belum dibaca">${t.unread}</span>` : ''}
          ${p ? `<img class="thread-thumb" src="${esc(BBK.productImage(p))}" alt="" width="44" height="44" loading="lazy">` : ''}
        </a></li>`;
      })
      .join('');
  }

  $('#threads').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-id]');
    if (!a) return;
    e.preventDefault();
    if (current && current.draft && current.id !== a.dataset.id) current = null;
    open(BBK.getThread(a.dataset.id) || current);
  });

  /* ---------- Room ---------- */
  function productCardHTML(p, small) {
    return `<a class="msg-product${small ? ' is-small' : ''}" href="produk.html?id=${encodeURIComponent(p.id)}">
      <img src="${esc(BBK.productImage(p))}" alt="" width="64" height="64" loading="lazy">
      <span><span class="msg-product-title">${esc(p.title)}</span><span class="msg-product-price">${BBK.formatRupiah(p.price)}</span></span>
    </a>`;
  }

  function contextHTML(t) {
    const p = BBK.getProduct(t.productId);
    if (!p) return '';
    const iAmBuyer = t.buyerId === me.id;
    const order = BBK.orders.find((o) => o.productIds.includes(p.id) && (o.buyerId === me.id || o.sellerId === me.id) && o.status !== 'dibatalkan');
    let action = '';
    if (order) action = `<a class="btn btn-sm" href="lacak.html?id=${encodeURIComponent(order.id)}">${iAmBuyer ? 'Lacak pesanan' : 'Lihat pesanan'}</a>`;
    else if (iAmBuyer && p.status === 'tersedia') action = `<a class="btn btn-sm" href="checkout.html?product=${encodeURIComponent(p.id)}">Ajukan COD</a>`;
    else if (p.status !== 'tersedia') action = `<span class="tag">${p.status === 'terjual' ? 'Terjual' : 'Dipesan'}</span>`;
    return `<p class="room-context-label">${iAmBuyer ? 'Kamu bertanya mengenai produk ini' : 'Pembeli bertanya mengenai produkmu'}</p>
      <div class="room-context-card">${productCardHTML(p)}${action}</div>`;
  }

  const check = BBK.icon('check', 14);
  function messageHTML(m) {
    const own = m.senderId === me.id;
    const p = m.attachedProductId && BBK.getProduct(m.attachedProductId);
    return `<li class="msg${own ? ' is-own' : ''}">
      <div class="bubble">
        ${p ? productCardHTML(p, true) : ''}
        <p>${esc(m.text)}</p>
        <span class="msg-meta">${esc(BBK.formatTime(m.sentAt))}${own ? `<span class="ticks" aria-label="Terkirim">${check}${check}</span>` : ''}</span>
      </div>
    </li>`;
  }

  function renderMessages(t) {
    let lastDay = '';
    $('#messages').innerHTML = t.messages
      .map((m) => {
        const day = BBK.formatShortDate(m.sentAt);
        const sep = day !== lastDay ? `<li class="msg-day"><span>${esc(day)}</span></li>` : '';
        lastDay = day;
        return sep + messageHTML(m);
      })
      .join('');
    if (t.draft) {
      $('#messages').innerHTML = `<li class="msg-hint">${BBK.icon('info', 16)}<span>Kartu barang di atas akan otomatis terlampir di pesan pertamamu.</span></li>`;
    }
    scrollDown();
  }

  const scrollDown = () => {
    const box = $('#messages');
    box.scrollTop = box.scrollHeight;
  };

  const QUICK_BUYER = ['Masih ada, kak?', 'Bisa nego?', 'COD di mana enaknya?', 'Kapan bisa ketemu?'];
  const QUICK_SELLER = ['Masih ada, kak', 'Bisa COD besok siang', 'Harga sudah pas ya', 'Barang sudah saya cek, aman'];

  function open(t) {
    current = t;
    if (!t) {
      $('#room').hidden = true;
      $('#room-empty').hidden = false;
      document.body.classList.remove('room-open');
      renderList();
      return;
    }
    if (t.unread) {
      t.unread = 0;
      BBK.save.chats();
    }
    const u = other(t);
    const p = BBK.getProduct(t.productId);
    $('#room').hidden = false;
    $('#room-empty').hidden = true;
    document.body.classList.add('room-open');
    $('#room-avatar').textContent = BBK.initials(u.name);
    $('#room-name').textContent = u.name;
    $('#room-who').href = `profil.html?id=${encodeURIComponent(u.id)}`;
    $('#room-status').textContent = 'Online';
    $('#room-product-link').href = p ? `produk.html?id=${encodeURIComponent(p.id)}` : 'jelajah.html';
    $('#room-context').innerHTML = contextHTML(t);
    $('#quick').innerHTML = (t.buyerId === me.id ? QUICK_BUYER : QUICK_SELLER)
      .map((q) => `<button type="button" class="chip">${esc(q)}</button>`)
      .join('');
    renderMessages(t);
    renderList();
    try {
      history.replaceState(null, '', `chat.html?thread=${encodeURIComponent(t.id)}`);
    } catch {
      /* file:// */
    }
    if (!phone.matches) $('#msg').focus();
  }

  /* ---------- Sending + a canned reply from the other side ---------- */
  function replyFor(text, t) {
    const s = text.toLowerCase();
    const sellerSide = t.buyerId === me.id; // the other person is the seller
    const p = BBK.getProduct(t.productId);
    const point = BBK.nearestMeetingPoint(p.areaId, me.areaId || p.areaId);
    if (!sellerSide) return 'Oke kak, makasih. Nanti saya kabari lagi ya.';
    if (/nego|kurang|murah/.test(s)) return `Bisa kurang dikit kak, ${BBK.formatRupiah(Math.round((p.price * 0.92) / 1000) * 1000)} ya. Pesan lewat tombol Ajukan COD aja.`;
    if (/cod|mana|ketemu|lokasi|tempat/.test(s)) return `Enaknya di ${point.name}, kak. ${point.description}`;
    if (/kapan|jam|besok|hari/.test(s)) return 'Besok jam 12.30 bisa kak, habis kuliah.';
    if (/masih|ada|ready/.test(s)) return 'Masih ada kak! Mau COD kapan?';
    return 'Siap kak 👍';
  }

  function send(text) {
    const t = current;
    const clean = text.trim();
    if (!t || !clean) return;
    const firstMessage = t.messages.length === 0;
    const m = { id: BBK.newId('m'), senderId: me.id, text: clean, sentAt: new Date().toISOString() };
    if (firstMessage && t.buyerId === me.id) m.attachedProductId = t.productId; // auto-attach
    t.messages.push(m);
    if (t.draft) {
      delete t.draft;
      BBK.chatThreads.unshift(t);
    }
    BBK.save.chats();
    renderMessages(t);
    renderList();

    // The other side types for a moment, then answers.
    const typing = document.createElement('li');
    typing.className = 'msg typing';
    typing.innerHTML = `<div class="bubble"><span class="dots" aria-label="${esc(other(t).name)} sedang mengetik"><span></span><span></span><span></span></span></div>`;
    setTimeout(() => {
      if (current !== t) return;
      $('#room-status').textContent = 'mengetik…';
      $('#messages').append(typing);
      scrollDown();
    }, 700);
    setTimeout(() => {
      typing.remove();
      t.messages.push({ id: BBK.newId('m'), senderId: other(t).id, text: replyFor(clean, t), sentAt: new Date().toISOString() });
      BBK.save.chats();
      if (current === t) {
        $('#room-status').textContent = 'Online';
        renderMessages(t);
      }
      renderList();
    }, 2200);
  }

  $('#composer').addEventListener('submit', (e) => {
    e.preventDefault();
    send($('#msg').value);
    $('#msg').value = '';
    $('#msg').focus();
  });
  $('#quick').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) send(b.textContent);
  });
  $('#room-back').addEventListener('click', () => {
    if (current && current.draft) current = null;
    open(null);
    try {
      history.replaceState(null, '', 'chat.html');
    } catch {
      /* file:// */
    }
  });

  renderList();
  if (current) open(current);
  else if (!phone.matches) {
    const first = mine()[0];
    if (first) open(first);
  }
})();
