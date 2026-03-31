/* ============================================================
   InvestX — index.js
   Scripts específicos do Dashboard
   ============================================================ */

requireAuth();
  // Hash navigation
  (function() {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['dashboard','portfolio','mercado','analise','alertas','negociar'];
    if (hash && validPages.includes(hash)) navigate(hash);
  })();