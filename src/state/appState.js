(function(){
  const state = {
    activeTab: null,
    pendingCountIntervalId: null,
    loginKeyAttached: false,
  };

  window.AppState = {
    get: (key) => state[key],
    set: (key, value) => {
      state[key] = value;
      return value;
    },
    snapshot: () => ({ ...state }),
  };
})();
