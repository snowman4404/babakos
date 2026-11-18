/*
 * Masuk (masuk.html?next=…). Email kampus + kata sandi, as on the Figma Login
 * frame. Any ac.id email with an 8+ character password logs in (mock).
 * "Lupa kata sandi?" sends a code to the email and continues on verifikasi.html.
 */
(function () {
  const $ = (selector) => document.querySelector(selector); // tiny querySelector alias
  const form = $('#login-form');
  const email = form.elements.email;
  const password = form.elements.password;
  // Only same-site relative paths are followed after login.
  const rawNext = BBK.param('next') || '';
  const next = /^[a-z0-9-]+\.html/i.test(rawNext) ? rawNext : 'index.html';

  if (BBK.auth.currentUser()) location.replace(next);
  $('#to-signup').href = `daftar.html${rawNext ? '?next=' + encodeURIComponent(next) : ''}`;

  const showError = (input, errorEl, text) => {
    errorEl.innerHTML = text ? BBK.icon('info', 14) + BBK.escape(text) : '';
    errorEl.hidden = !text;
    input.setAttribute('aria-invalid', String(!!text));
  };

  const checkEmail = () => {
    const v = email.value.trim();
    const err = !v ? 'Isi email kampusmu.' : !BBK.isCampusEmail(v) ? 'Gunakan email kampus yang berakhiran ac.id.' : '';
    showError(email, $('#email-error'), err);
    return !err;
  };
  const checkPassword = () => {
    const err = password.value.length < 8 ? 'Kata sandi minimal 8 karakter.' : '';
    showError(password, $('#password-error'), err);
    return !err;
  };

  // Validate on leaving a field, then live once it has been wrong.
  email.addEventListener('blur', () => email.value && checkEmail());
  password.addEventListener('blur', () => password.value && checkPassword());
  email.addEventListener('input', () => email.getAttribute('aria-invalid') === 'true' && checkEmail());
  password.addEventListener('input', () => password.getAttribute('aria-invalid') === 'true' && checkPassword());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const okEmail = checkEmail();
    const okPassword = checkPassword();
    if (!okEmail) return email.focus();
    if (!okPassword) return password.focus();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Memeriksa…';
    setTimeout(() => {
      BBK.auth.login(email.value);
      BBK.flash(`Selamat datang, ${BBK.firstName(BBK.auth.currentUser().name)}!`);
      location.href = next;
    }, 450);
  });

  $('#forgot').addEventListener('click', () => {
    if (!checkEmail()) {
      email.focus();
      return;
    }
    BBK.auth.requestOtp(email.value, { reset: true });
    location.href = `verifikasi.html?mode=reset&next=${encodeURIComponent(next)}`;
  });

  $('#fill-demo').addEventListener('click', () => {
    email.value = BBK.getUser(BBK.CURRENT_USER_ID).email;
    password.value = 'babakos123';
    checkEmail();
    checkPassword();
    form.querySelector('[type="submit"]').focus();
  });
})();
