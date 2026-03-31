/* ============================================================
   InvestX — auth.js
   Sessão, autenticação, registro, API key
   ============================================================ */

// ============================================================
// SESSION / AUTH
// ============================================================

function getUser() {
  try { return JSON.parse(localStorage.getItem('investx_user')); } catch { return null; }
}

function saveUser(u) {
  localStorage.setItem('investx_user', JSON.stringify(u));
}

function requireAuth() {
  if (!getUser()) { window.location.href = 'login.html'; }
}

function logout() {
  localStorage.removeItem('investx_user');
  window.location.href = 'login.html';
}

// ============================================================
// MULTIPLE ACCOUNTS STORAGE
// ============================================================

function getAllAccounts() {
  try { return JSON.parse(localStorage.getItem('investx_accounts')) || []; } catch { return []; }
}

function saveAccount(user) {
  const accounts = getAllAccounts();
  const idx = accounts.findIndex(u => u.email === user.email);
  if (idx >= 0) accounts[idx] = user;
  else accounts.push(user);
  localStorage.setItem('investx_accounts', JSON.stringify(accounts));
}

// ============================================================
// AUTH — REGISTER
// ============================================================

function initAvatarPicker(previewId, inputId) {
  const preview = document.getElementById(previewId);
  const input   = document.getElementById(inputId);
  if (!preview || !input) return;
  preview.addEventListener('click', () => input.click());
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span class="avatar-overlay">📷</span>`;
      preview.dataset.avatarData = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function handleRegister(e) {
  e.preventDefault();
  let ok = true;
  const name  = document.getElementById('reg-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const pass  = document.getElementById('reg-pass')?.value;
  const pass2 = document.getElementById('reg-pass2')?.value;
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('error'));
  if (!name) { showFieldError('err-name', 'reg-name', 'Digite seu nome'); ok = false; }
  if (!email || !email.includes('@')) { showFieldError('err-email', 'reg-email', 'E-mail inválido'); ok = false; }
  if (!pass || pass.length < 6) { showFieldError('err-pass', 'reg-pass', 'Mínimo 6 caracteres'); ok = false; }
  if (pass !== pass2) { showFieldError('err-pass2', 'reg-pass2', 'Senhas não coincidem'); ok = false; }
  if (!ok) return;

  const existing = getAllAccounts();
  if (existing.find(u => u.email === email)) {
    showFieldError('err-email', 'reg-email', 'Este e-mail já está cadastrado');
    return;
  }

  const avatarData = document.getElementById('avatarPreview')?.dataset.avatarData || null;
  const initials   = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const user = { name, email, pass, initials, avatar: avatarData, createdAt: new Date().toISOString() };

  saveAccount(user);
  localStorage.setItem('investx_user', JSON.stringify(user));
  window.location.href = 'index.html';
}

// ============================================================
// AUTH — LOGIN
// ============================================================

function handleLogin(e) {
  e.preventDefault();
  let ok = true;
  const email = document.getElementById('login-email')?.value.trim();
  const pass  = document.getElementById('login-pass')?.value;
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('error'));
  if (!email) { showFieldError('err-email', 'login-email', 'Digite seu e-mail'); ok = false; }
  if (!pass)  { showFieldError('err-pass',  'login-pass',  'Digite sua senha');  ok = false; }
  if (!ok) return;

  if (email === 'demo@investx.com' && pass === 'demo123') {
    const demoUser = {
      name: 'Victor Ferreira', email, pass: 'demo123',
      initials: 'VF', avatar: null, createdAt: '2023-01-15T00:00:00Z'
    };
    localStorage.setItem('investx_user', JSON.stringify(demoUser));
    window.location.href = 'index.html';
    return;
  }

  const accounts = getAllAccounts();
  const found = accounts.find(u => u.email === email);

  if (!found) {
    showFieldError('err-email', 'login-email', 'Conta não encontrada. Cadastre-se primeiro.');
    return;
  }

  if (found.pass !== pass) {
    showFieldError('err-pass', 'login-pass', 'Senha incorreta');
    return;
  }

  localStorage.setItem('investx_user', JSON.stringify(found));
  window.location.href = 'index.html';
}

function showFieldError(errId, inputId, msg) {
  const err = document.getElementById(errId);
  const inp = document.getElementById(inputId);
  if (err) { err.textContent = msg; err.classList.add('show'); }
  if (inp) inp.classList.add('error');
}

function togglePassVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

// ============================================================
// API KEY MANAGEMENT
// ============================================================

function saveApiKey() {
  const input = document.getElementById('apiKeyInput');
  if (!input || !input.value.trim()) return;
  const key = input.value.trim();
  localStorage.setItem('investx_api_key', key);
  input.value = '';
  document.getElementById('apiKeyBanner').style.display = 'none';
  const statusEl = document.querySelector('.chat-ai-status');
  if (statusEl) statusEl.textContent = 'online · pronta para responder';
  appendMessage('✅ Chave de API salva! Agora posso responder **qualquer pergunta** — finanças, tecnologia, ciência, curiosidades e muito mais. Como posso ajudar?', false);
}

function checkApiKeyStatus() {
  const key = localStorage.getItem('investx_api_key');
  const banner = document.getElementById('apiKeyBanner');
  const statusEl = document.querySelector('.chat-ai-status');
  if (!key) {
    if (banner) banner.style.display = 'block';
    if (statusEl) statusEl.textContent = '⚠ chave de API necessária';
  } else {
    if (banner) banner.style.display = 'none';
    if (statusEl) statusEl.textContent = 'online · IA ativa';
  }
}

// ============================================================
// CONFIG PAGE — API KEY
// ============================================================

function cfgSaveApiKey() {
  const key = document.getElementById('cfg-api-key')?.value.trim();
  if (!key || !key.startsWith('sk-')) {
    alert('Chave inválida. Deve começar com sk-ant-...');
    return;
  }
  localStorage.setItem('investx_api_key', key);
  document.getElementById('cfg-api-key').value = '';
  cfgUpdateStatus();
  alert('✅ Chave salva com sucesso! O chat da OMEGA IA está ativo.');
}

function cfgClearApiKey() {
  if (confirm('Remover a chave de API? O chat da OMEGA IA deixará de funcionar.')) {
    localStorage.removeItem('investx_api_key');
    cfgUpdateStatus();
  }
}

function cfgUpdateStatus() {
  const key = localStorage.getItem('investx_api_key');
  const el = document.getElementById('cfg-key-status');
  if (!el) return;
  if (key) {
    el.style.background = 'rgba(34,197,94,.1)';
    el.style.color = '#4ade80';
    el.textContent = '✅ Chave configurada — OMEGA IA ativa (sk-ant-...***' + key.slice(-4) + ')';
  } else {
    el.style.background = 'rgba(220,38,38,.1)';
    el.style.color = 'var(--red-glow)';
    el.textContent = '⚠ Nenhuma chave configurada — chat inativo';
  }
}

// ============================================================
// PROFILE
// ============================================================

function formatDate(iso) {
  if (!iso) return 'Jan 2023';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function populateProfile() {
  const user = getUser();
  if (!user) return;
  const av = document.querySelector('.avatar-large');
  if (av) {
    if (user.avatar) {
      av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span class="avatar-overlay">📷</span>`;
    } else {
      av.innerHTML = `<span>${user.initials || 'U'}</span><span class="avatar-overlay">📷</span>`;
    }
    av.addEventListener('click', () => document.getElementById('profileAvatarInput')?.click());
  }
  const heroH2 = document.querySelector('.profile-info h2');
  if (heroH2 && user.name) {
    const parts = user.name.split(' ');
    heroH2.innerHTML = `<em>${parts[0].toUpperCase()}</em> ${parts.slice(1).join(' ').toUpperCase()}`;
  }
  const heroP = document.querySelector('.profile-info > p');
  if (heroP && user.email) heroP.textContent = user.email + ' · Membro desde ' + formatDate(user.createdAt);
  const nameInput = document.getElementById('p-name');
  if (nameInput) nameInput.value = user.name || '';
  const emailInput = document.getElementById('p-email');
  if (emailInput) emailInput.value = user.email || '';
  populateTopbar();
}

function saveProfile() {
  const user  = getUser() || {};
  const name  = document.getElementById('p-name')?.value.trim();
  const email = document.getElementById('p-email')?.value.trim();
  const perfil = document.getElementById('p-perfil')?.value;
  if (name)  { user.name = name; user.initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
  if (email) user.email = email;
  if (perfil) user.perfil = perfil;
  saveUser(user);
  saveAccount(user);
  populateProfile();
  const btn = document.querySelector('.btn-save');
  if (btn) { btn.textContent = 'SALVO ✓'; setTimeout(() => { btn.textContent = 'SALVAR ALTERAÇÕES'; }, 2000); }
}

function initAvatarUpload() {
  const input = document.getElementById('profileAvatarInput');
  if (!input) return;
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const user = getUser() || {};
      user.avatar = ev.target.result;
      saveUser(user);
      saveAccount(user);
      populateProfile();
    };
    reader.readAsDataURL(file);
  });
}
