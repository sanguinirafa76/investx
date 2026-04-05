requireAuth();
  // Hash navigation
  (function() {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['dashboard','portfolio','mercado','analise','alertas','negociar'];
    if (hash && validPages.includes(hash)) navigate(hash);
  })();


  /* ── Extend navigate() to support perfil & config views ── */
(function(){
  const _orig = window.navigate;
  window.navigate = function(page) {
    const extraViews = ['perfil', 'config'];
    if (extraViews.includes(page)) {
      // Hide all page-views
      document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
      // Deactivate all nav items
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      // Show target view
      const target = document.getElementById('view-' + page);
      if (target) target.classList.add('active');
      // Mark active nav button
      document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + page + "'")) {
          btn.classList.add('active');
        }
      });
    } else {
      if (typeof _orig === 'function') _orig(page);
    }
  };
})();


/* ── Profile helpers ── */
function saveProfile() {
  const name = document.getElementById('p-name').value.trim();
  const email = document.getElementById('p-email').value.trim();
  const perfil = document.getElementById('p-perfil').value;
  if (name) {
    const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    const avatarEl = document.getElementById('profileAvatarLarge');
    if (avatarEl && !avatarEl.querySelector('img')) avatarEl.childNodes[0].textContent = initials;
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.innerHTML = '<em>' + name.toUpperCase() + '</em>';
    const topAvatar = document.querySelector('.user-avatar');
    if (topAvatar) topAvatar.textContent = initials;
  }
  if (email) {
    const emailLine = document.getElementById('profileEmailLine');
    if (emailLine) emailLine.textContent = email + ' · Membro';
  }
  const badge = document.getElementById('badgeRisco');
  if (badge) badge.textContent = 'Perfil ' + perfil;
  const msg = document.getElementById('saveMsg');
  if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display='none', 3000); }
}

function previewAvatar(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const el = document.getElementById('profileAvatarLarge');
      if (el) {
        el.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span class="avatar-overlay">📷</span>';
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}


/* ── Config helpers ── */
function saveAllConfig() {
  const msg = document.getElementById('cfgSavedMsg');
  if (msg) { msg.style.display='block'; setTimeout(()=>msg.style.display='none',3000); }
}

function exportData() {
  const data = { usuario: 'InvestX User', exportado: new Date().toISOString(), patrimonio: 'R$48.320', posicoes: 12 };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='investx-dados.json'; a.click();
}

function deleteAccount() {
  if (confirm('Tem certeza? Esta ação é irreversível e apagará todos os seus dados.')) {
    alert('Conta excluída. Você será desconectado.');
  }
}

