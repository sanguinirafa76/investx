/* ============================================================
   InvestX — ui.js
   Topbar, sidebar, navegação, alertas, inicialização
   ============================================================ */

// ============================================================
// TOPBAR
// ============================================================

function populateTopbar() {
  const user = getUser();
  if (!user) return;
  const av = document.querySelector('.user-avatar');
  if (!av) return;
  if (user.avatar) {
    av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    av.textContent = initials;
  }
  av.title = user.name || 'Perfil';
}

// ============================================================
// SIDEBAR / OVERLAY
// ============================================================

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('overlay');
  const c = document.getElementById('chatPanel');
  if (s) s.classList.toggle('open');
  if (c) c.classList.remove('open');
  if (o) o.classList.toggle('show', s && s.classList.contains('open'));
}

function toggleChat() {
  const c = document.getElementById('chatPanel');
  const o = document.getElementById('overlay');
  const s = document.getElementById('sidebar');
  if (c) c.classList.toggle('open');
  if (s) s.classList.remove('open');
  if (o) o.classList.toggle('show', c && c.classList.contains('open'));
}

function closeAll() {
  const s = document.getElementById('sidebar');
  const c = document.getElementById('chatPanel');
  const o = document.getElementById('overlay');
  if (s) s.classList.remove('open');
  if (c) c.classList.remove('open');
  if (o) o.classList.remove('show');
}

// ============================================================
// NAVEGAÇÃO
// ============================================================

const navLabels = {
  dashboard:'dashboard', portfolio:'portfólio',
  mercado:'mercado', analise:'análise', alertas:'alertas', negociar:'negociar'
};

function navigate(page) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const view = document.getElementById('view-' + page);
  if (view) view.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => {
    const t = b.textContent.trim().toLowerCase();
    if (t.includes(navLabels[page] || page)) b.classList.add('active');
  });
  if (window.innerWidth <= 900) closeAll();
  if (page === 'mercado') renderMarketTable('acoes');
  if (page === 'negociar') { runSimulation(); updateTradePrice('buy'); }
}

// ============================================================
// ALERTAS
// ============================================================

function dismissAlert(btn) {
  const art = btn.closest('article');
  art.style.opacity = '0.35';
  btn.disabled = true;
  btn.textContent = 'Dispensado';
}

function createAlert() {
  const asset = document.getElementById('alert-asset')?.value.trim();
  const type  = document.getElementById('alert-type')?.value;
  const value = document.getElementById('alert-value')?.value.trim();
  if (!asset || !value) { alert('Preencha o ativo e o valor.'); return; }
  document.getElementById('alert-asset').value = '';
  document.getElementById('alert-value').value = '';
  const c = document.getElementById('alertsContainer');
  if (!c) return;
  const el = document.createElement('article');
  el.className = 'alert-item';
  el.innerHTML = `
    <span class="alert-icon-wrap gray">🔔</span>
    <span class="alert-body">
      <p class="alert-title">${asset.toUpperCase()} — ${type} ${value}</p>
      <p class="alert-desc">Alerta configurado. OMEGA IA vai notificar quando a condição for atingida.</p>
      <span class="alert-meta">
        <span class="alert-asset">${asset.toUpperCase()}</span>
        <time class="alert-time-tag">agora mesmo</time>
      </span>
    </span>
    <span class="alert-action">
      <button class="btn-dismiss" onclick="this.closest('article').remove()">Remover</button>
    </span>`;
  c.prepend(el);
}

// ============================================================
// INICIALIZAÇÃO — DOMContentLoaded
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Init trading tab
  setTimeout(() => { updateTradePrice('buy'); runSimulation(); }, 500);
});

document.addEventListener('DOMContentLoaded', async () => {
  populateTopbar();

  // Auth forms
  initAvatarPicker('avatarPreview', 'avatarInput');
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

  // Profile
  if (document.querySelector('.avatar-large')) {
    populateProfile();
    initAvatarUpload();
    document.querySelector('.btn-save')?.addEventListener('click', saveProfile);
  }

  // Dashboard chart + ticker
  if (document.getElementById('chartLine')) {
    const data = await fetchChartData('PETR4', '1D');
    drawChart(data || CHART_FALLBACK['1D']);
    initChartTooltip();
    startLivePriceTicker();
  }

  // Barra de preços da landing page
  if (document.getElementById('tickerTrack')) {
    initLandingTicker();
    refreshRealPrices().then(() => {
      updateLandingTicker();
    });
    setInterval(async () => {
      await refreshRealPrices();
      updateLandingTicker();
    }, 60000);
  }

  // Tabela de mercado
  if (document.getElementById('marketBody')) {
    renderMarketTable('acoes');
    refreshRealPrices().then(() => renderMarketTable(currentMarketKey));
    setInterval(() => {
      refreshRealPrices().then(() => renderMarketTable(currentMarketKey));
    }, 30000);
  }

  // Boas-vindas no chat
  const user = getUser();
  if (user) {
    const firstMsg = document.querySelector('#chatMessages .msg-bubble');
    if (firstMsg && user.name) {
      const firstName = user.name.split(' ')[0];
      firstMsg.innerHTML = `Olá, <strong>${firstName}</strong>! 👋 Estou monitorando seu portfólio com dados em tempo real. <strong>PETR4</strong> subiu +2,3% — pode ser bom momento para revisar sua posição.`;
    }
  }

  // Navegação por hash
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard','portfolio','mercado','analise','alertas'];
  if (hash && validPages.includes(hash)) navigate(hash);
});
