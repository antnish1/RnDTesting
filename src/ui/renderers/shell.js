(function(){
  function renderBranchShell({ branch }){
    return `<div class="w-full px-4 md:px-6 lg:px-10 py-5 space-y-5"><div class="w-full rounded-2xl px-6 py-3" style="background: rgba(15,23,42,0.88); border: 1px solid var(--pc-border);"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-4"><div class="header-logo-shell"><img src="HDU4w-removebg-preview.png" class="header-logo" /></div><span class="text-sm font-semibold tracking-widest uppercase" style="color: var(--pc-text);">${branch}</span></div><button onclick="logout()" class="top-btn logout-btn">Logout</button></div></div><div id="main" class="w-full"></div></div>`;
  }
  window.AppRenderers = window.AppRenderers || {};
  window.AppRenderers.renderBranchShell = renderBranchShell;
})();
