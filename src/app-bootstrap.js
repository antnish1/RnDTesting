(function(){
  if(!Object.getOwnPropertyDescriptor(window, 'activeTab')){
    Object.defineProperty(window, 'activeTab', {
      get(){ return window.AppState.get('activeTab'); },
      set(value){ return window.AppState.set('activeTab', value); },
      configurable: true,
    });
  }

  function bootstrapApp(){
    window.UIFeedback.ensureOverlays();
    if(typeof window.initApp === 'function') window.initApp();
  }
  window.bootstrapApp = bootstrapApp;
  window.addEventListener('load', bootstrapApp);
})();
