(function(){
  function renderLoginView(){
    return `
<div class="login-shell">
  <main class="login-grid" aria-label="Parts Connect Portal Login">
    <section class="login-aside">
      <div class="login-logo-wrap mb-5"><img src="HDU4w-removebg-preview.png" alt="Parts Connect Portal" class="login-logo" /></div>
      <h1 class="login-title">Parts Connect Portal</h1>
      <p class="login-subtitle">Reliable, secure and role-based branch access for order operations.</p>
    </section>
    <section class="login-card">
      <h2 class="login-title">Secure Login</h2>
      <p class="login-subtitle">Use your branch and password to continue.</p>
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
