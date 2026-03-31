/* ============================================================
   InvestX — config.js
   Scripts específicos da página de Configurações
   ============================================================ */

requireAuth();

  function goTo(section) {
    window.location.href = '/HTML/index.html#' + section;
  }

  function closeSidebarOverlay() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('show');
  }

  function toggleSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('overlay');
    s?.classList.toggle('open');
    o?.classList.toggle('show', s?.classList.contains('open'));
  }

  function saveAllConfig() {
    const msg = document.getElementById('cfgSavedMsg');
    if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3000); }
  }

  function exportData() {
    const user = getUser();
    if (!user) return;
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'investx_dados.json';
    a.click();
  }

  function deleteAccount() {
    if (confirm('Tem certeza? Esta ação é irreversível e todos os seus dados serão apagados.')) {
      localStorage.removeItem('investx_user');
      window.location.href = '/HTML/Home.html';
    }
  }

  // Populate topbar avatar
  document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user) return;
    const av = document.getElementById('topbarAvatar');
    if (!av) return;
    if (user.avatar) {
      av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      av.textContent = (user.initials || user.name?.slice(0,2) || 'VF').toUpperCase();
    }
  });

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
  document.addEventListener('DOMContentLoaded', cfgUpdateStatus);
