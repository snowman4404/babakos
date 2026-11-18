/*
 * Verifikasi Email (verifikasi.html?next=…&mode=reset). Six code boxes with paste
 * support and a resend timer. Any 6-digit code is accepted (mock); the success
 * state shows the "Mahasiswa Terverifikasi" badge.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const pending = BBK.auth.pending();
  const isReset = BBK.param('mode') === 'reset';
  const rawNext = BBK.param('next') || '';
  const next = /^[a-z0-9-]+\.html/i.test(rawNext) ? rawNext : 'index.html';

  if (!pending) {
    $('#otp-form').hidden = true;
    $('#otp-none').hidden = false;
    return;
  }

  $('#otp-sub').innerHTML = `Masukkan kode yang kami kirim ke <strong>${esc(BBK.maskEmail(pending.email))}</strong>`;
  if (isReset) {
    $('#otp-title').textContent = 'Lupa Kata Sandi';
    $('#otp-steps').hidden = true;
    $('#change-email').href = 'masuk.html';
    $('#change-email').textContent = 'Kembali ke Masuk';
  }

  /* ---------- Six boxes ---------- */
  const box = $('#otp');
  box.innerHTML = Array.from(
    { length: 6 },
    (_, i) => `<input class="otp-digit" inputmode="numeric" maxlength="1" autocomplete="${i ? 'off' : 'one-time-code'}" aria-label="Digit ${i + 1}">`,
  ).join('');
  const digits = [...box.querySelectorAll('input')];
  const code = () => digits.map((d) => d.value).join('');
  const setError = (text) => {
    $('#otp-error').innerHTML = text ? BBK.icon('info', 14) + esc(text) : '';
    $('#otp-error').hidden = !text;
    digits.forEach((d) => d.setAttribute('aria-invalid', String(!!text)));
  };

  const fillFrom = (start, text) => {
    const chars = text.replace(/\D/g, '').split('');
    chars.forEach((c, k) => digits[start + k] && (digits[start + k].value = c));
    const after = Math.min(start + chars.length, 5);
    digits[after].focus();
    if (code().length === 6) submit();
  };

  digits.forEach((d, i) => {
    d.addEventListener('input', () => {
      setError('');
      const v = d.value.replace(/\D/g, '');
      d.value = '';
      if (v) fillFrom(i, v); // also handles autofill of all six digits
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !d.value && i > 0) {
        digits[i - 1].value = '';
        digits[i - 1].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && i > 0) digits[i - 1].focus();
      else if (e.key === 'ArrowRight' && i < 5) digits[i + 1].focus();
    });
    d.addEventListener('paste', (e) => {
      e.preventDefault();
      fillFrom(i, (e.clipboardData || window.clipboardData).getData('text'));
    });
    d.addEventListener('focus', () => d.select());
  });
  digits[0].focus();

  /* ---------- Resend timer ---------- */
  let left = 0;
  let timer;
  const startTimer = () => {
    left = 60;
    $('#resend').disabled = true;
    clearInterval(timer);
    const tick = () => {
      $('#resend-timer').textContent = left > 0 ? `(${left} dtk)` : '';
      if (left-- <= 0) {
        clearInterval(timer);
        $('#resend').disabled = false;
      }
    };
    tick();
    timer = setInterval(tick, 1000);
  };
  startTimer();
  $('#resend').addEventListener('click', () => {
    startTimer();
    BBK.toast(`Kode baru dikirim ke ${BBK.maskEmail(pending.email)}.`);
    digits.forEach((d) => (d.value = ''));
    digits[0].focus();
  });

  /* ---------- Submit ---------- */
  function submit() {
    if (code().length < 6) {
      setError('Lengkapi 6 digit kodenya.');
      digits[code().length].focus();
      return;
    }
    const btn = $('#otp-submit');
    btn.disabled = true;
    btn.textContent = 'Memeriksa…';
    setTimeout(() => {
      if (!BBK.auth.verifyOtp(code())) {
        btn.disabled = false;
        btn.textContent = 'Verifikasi';
        setError('Kode tidak valid. Coba lagi.');
        return;
      }
      clearInterval(timer);
      const user = BBK.auth.currentUser();
      $('#otp-form').hidden = true;
      $('#otp-done').hidden = false;
      $('#done-text').textContent = isReset
        ? 'Kode benar, kamu sudah masuk. Ganti kata sandi kapan saja di Profil → Keamanan Akun.'
        : `Halo ${BBK.firstName(user.name)}, akunmu aktif. Sekarang kamu bisa chat penjual, COD, dan jual barang.`;
      $('#done-email').innerHTML = `${BBK.icon('verified', 14)}${esc(user.email)}`;
      $('#done-next').href = next;
      $('#done-next').textContent = next === 'index.html' ? 'Mulai jelajah barang' : 'Lanjutkan';
      $('#done-title').focus();
    }, 500);
  }
  $('#otp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submit();
  });
})();
