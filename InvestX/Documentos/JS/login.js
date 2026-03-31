/* ============================================================
   InvestX — login.js
   Scripts específicos da página de Login
   ============================================================ */

// Mostra hint visual quando conta não encontrada
  const origHandleLogin = handleLogin;
  document.getElementById('loginForm')?.addEventListener('submit', () => {
    const hint = document.getElementById('noAccountHint');
    if (hint) hint.classList.remove('show');
  });

  // Observa erro de "conta não encontrada" para exibir hint
  const errEmailEl = document.getElementById('err-email');
  if (errEmailEl) {
    const observer = new MutationObserver(() => {
      const hint = document.getElementById('noAccountHint');
      if (!hint) return;
      if (errEmailEl.textContent.includes('não encontrada')) {
        hint.classList.add('show');
      } else {
        hint.classList.remove('show');
      }
    });
    observer.observe(errEmailEl, { childList: true, characterData: true, subtree: true });
  }