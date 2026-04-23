(function(){
  function renderLoginView(){
    return `
<div class="login-shell">
  <main class="login-grid" aria-label="Parts Connect Portal Login">
    <section class="login-aside">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mb-4"
            style="background:rgba(124,155,255,0.2); color:#dbe7ff; border:1px solid rgba(124,155,255,0.45);">
        REDESIGN 2026
      </span>
      <div class="login-logo-wrap mb-5"><img src="HDU4w-removebg-preview.png" alt="Parts Connect Portal" class="login-logo" /></div>
      <h1 class="login-title">Parts Connect Portal</h1>
      <p class="login-subtitle">Modern, compact workspace for branch ordering, tracking and approvals.</p>
    </section>
    <section class="login-card">
      <h2 class="login-title">Welcome Back</h2>
      <p class="login-subtitle">Use your branch account credentials to continue.</p>
      <label class="login-label" for="branch">Branch</label>
      <select id="branch" class="login-input"></select>
      <label class="login-label" for="password">Password</label>
      <input id="password" type="password" class="login-input" placeholder="Enter your password" />
      <button onclick="login()" class="login-cta">Access Portal</button>
    </section>
  </main>
</div>`;
  }
  window.AppRenderers = window.AppRenderers || {};
  window.AppRenderers.renderLoginView = renderLoginView;
})();
