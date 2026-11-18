/*
 * Daftar (daftar.html?next=…), from the Figma Signup frame. Validates the campus
 * email (…ac.id), stores the profile as "pending" and continues on verifikasi.html,
 * where any 6-digit code finishes the signup.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const esc = BBK.escape;
  const form = $('#signup-form');
  const f = form.elements;
  const rawNext = BBK.param('next') || '';
  const next = /^[a-z0-9-]+\.html/i.test(rawNext) ? rawNext : 'index.html';

  if (BBK.auth.currentUser()) location.replace(next);
  $('#to-login').href = `masuk.html${rawNext ? '?next=' + encodeURIComponent(next) : ''}`;

  f.campus.innerHTML = `<option value="">Pilih kampus</option>` + BBK.universities.map(([s, name]) => `<option value="${esc(s)}">${esc(s)} · ${esc(name)}</option>`).join('');
  f.faculty.innerHTML = `<option value="">Pilih fakultas atau jurusan</option>` + BBK.faculties.map(([s, name]) => `<option value="${esc(s)}">${esc(s)} · ${esc(name)}</option>`).join('');
  f.area.innerHTML =
    `<option value="">Pilih area</option>` +
    BBK.kostAreas
      .slice()
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((a) => `<option value="${esc(a.id)}">${esc(BBK.areaShortName(a.id))} (${BBK.formatKm(a.distanceKm)} km)</option>`)
      .join('');

  const showError = (id, text, input) => {
    const el = $('#' + id);
    el.innerHTML = text ? BBK.icon('info', 14) + esc(text) : '';
    el.hidden = !text;
    if (input) input.setAttribute('aria-invalid', String(!!text));
  };

  /* Password strength meter: length, digit, symbol/case mix. */
  const strength = (v) => (v.length >= 8) + /\d/.test(v) + (/[^a-z0-9]/i.test(v) || (/[a-z]/.test(v) && /[A-Z]/.test(v)));
  const LEVELS = [
    ['', 'Kombinasi minimal 8 huruf, angka, dan simbol.'],
    ['weak', 'Lemah: tambah panjang, angka, atau simbol.'],
    ['ok', 'Cukup: tambah simbol agar lebih kuat.'],
    ['strong', 'Kuat.'],
  ];
  f.password.addEventListener('input', () => {
    const level = f.password.value ? Math.max(1, strength(f.password.value)) : 0;
    $('#password-meter').dataset.level = LEVELS[level][0];
    $('#meter-text').textContent = LEVELS[level][1];
    if (f.password.getAttribute('aria-invalid') === 'true') checks.password();
  });

  const checks = {
    name() {
      const err = f.first.value.trim().length < 2 ? 'Isi nama depanmu.' : '';
      showError('name-error', err, f.first);
      return !err;
    },
    email() {
      const v = f.email.value.trim();
      const err = !v ? 'Isi email kampusmu.' : !BBK.isCampusEmail(v) ? 'Harus email kampus yang berakhiran ac.id, mis. nama@student.ub.ac.id atau nama@students.um.ac.id.' : '';
      showError('email-error', err, f.email);
      return !err;
    },
    password() {
      const err = f.password.value.length < 8 ? 'Kata sandi minimal 8 karakter.' : '';
      showError('password-error', err, f.password);
      return !err;
    },
    terms() {
      const err = f.terms.checked ? '' : 'Centang persetujuan dulu untuk lanjut.';
      showError('terms-error', err);
      return !err;
    },
  };

  f.email.addEventListener('blur', () => f.email.value && checks.email());
  f.email.addEventListener('input', () => f.email.getAttribute('aria-invalid') === 'true' && checks.email());
  f.first.addEventListener('input', () => f.first.getAttribute('aria-invalid') === 'true' && checks.name());
  f.terms.addEventListener('change', checks.terms);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const order = [['name', f.first], ['email', f.email], ['password', f.password], ['terms', f.terms]];
    const results = order.map(([k]) => checks[k]());
    const firstBad = order[results.indexOf(false)];
    if (firstBad) {
      firstBad[1].focus();
      return;
    }
    const campus = BBK.universities.find(([s]) => s === f.campus.value);
    const faculty = BBK.faculties.find(([s]) => s === f.faculty.value);
    const profile = {
      name: `${f.first.value.trim()} ${f.last.value.trim()}`.trim(),
      ...(campus ? { university: campus[1], universityShort: campus[0] } : {}),
      ...(faculty ? { faculty: faculty[1], facultyShort: faculty[0] } : {}),
      ...(f.area.value ? { areaId: f.area.value } : {}),
      cohort: new Date().getFullYear(),
    };
    BBK.auth.requestOtp(f.email.value, profile);
    location.href = `verifikasi.html?next=${encodeURIComponent(next)}`;
  });
})();
