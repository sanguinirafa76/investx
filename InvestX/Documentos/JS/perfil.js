/* ============================================================
   InvestX — perfil.js
   Scripts específicos da página de Perfil
   ============================================================ */

requireAuth();

  // Navigation helpers for cross-page linking
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

  // Load user data into form and profile hero
  document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user) return;

    // Topbar avatar
    const av = document.getElementById('topbarAvatar');
    if (av) {
      if (user.avatar) {
        av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        av.textContent = (user.initials || user.name?.slice(0,2) || 'VF').toUpperCase();
      }
    }

    // Profile hero avatar
    const heroAv = document.getElementById('profileAvatarLarge');
    if (heroAv) {
      if (user.avatar) {
        heroAv.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        heroAv.style.padding = '0';
        heroAv.style.background = 'none';
      } else {
        heroAv.textContent = (user.initials || user.name?.slice(0,2) || 'VF').toUpperCase();
      }
    }

    // Profile info
    const firstName = (user.name || 'Usuário').split(' ')[0].toUpperCase();
    const lastName  = (user.name || '').split(' ').slice(1).join(' ').toUpperCase();
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.innerHTML = `<em>${firstName}</em>${lastName ? ' ' + lastName : ''}`;

    const emailLine = document.getElementById('profileEmailLine');
    if (emailLine) {
      const since = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', {month:'short', year:'numeric'}) : 'Recentemente';
      emailLine.textContent = `${user.email || ''} · Membro desde ${since}`;
    }

    // Fill form fields
    document.getElementById('p-name').value  = user.name  || '';
    document.getElementById('p-email').value = user.email || '';

    // Months on platform
    if (user.createdAt) {
      const ms = Date.now() - new Date(user.createdAt).getTime();
      const months = Math.max(0, Math.floor(ms / (1000*60*60*24*30)));
      const statEl = document.getElementById('statMonths');
      if (statEl) statEl.textContent = months + ' mo';
    }
  });

  let pendingAvatar = null;

  function previewAvatar(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
      pendingAvatar = e.target.result;
      const heroAv = document.getElementById('profileAvatarLarge');
      if (heroAv) {
        heroAv.innerHTML = `<img src="${pendingAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        heroAv.style.padding = '0';
        heroAv.style.background = 'none';
      }
    };
    reader.readAsDataURL(input.files[0]);
  }

  function saveProfile() {
    const user = getUser() || {};
    user.name  = document.getElementById('p-name').value.trim() || user.name;
    user.email = document.getElementById('p-email').value.trim() || user.email;
    user.risco = document.getElementById('p-perfil').value;
    if (pendingAvatar) user.avatar = pendingAvatar;
    // Recalculate initials
    user.initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    localStorage.setItem('investx_user', JSON.stringify(user));

    const msg = document.getElementById('saveMsg');
    if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3000); }

    // Refresh avatar in topbar
    const av = document.getElementById('topbarAvatar');
    if (av) {
      if (user.avatar) {
        av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        av.textContent = user.initials;
      }
    }
    // Refresh hero name
    const firstName = user.name.split(' ')[0].toUpperCase();
    const lastName  = user.name.split(' ').slice(1).join(' ').toUpperCase();
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.innerHTML = `<em>${firstName}</em>${lastName ? ' ' + lastName : ''}`;
  }
