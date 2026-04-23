(function(){
  function renderDocketScannerView(){
    return `<div class="w-full max-w-5xl mx-auto space-y-4"><section class="pc-section p-3 md:p-5 rounded-2xl"><h3 class="text-base md:text-xl font-semibold">Mobile Scan Console</h3><input id="docketScanInput" type="text" inputmode="text" autocomplete="off" placeholder="Enter / scan docket no." class="pc-field w-full text-base md:text-lg px-4 py-3 rounded-xl" /><div class="grid grid-cols-1 sm:grid-cols-3 gap-2"><button class="top-btn w-full justify-center" onclick="lookupDocketRows()">Search Docket</button><button class="top-btn w-full justify-center" onclick="startDocketCameraScanner()">Start Camera</button><button class="top-btn w-full justify-center" onclick="stopDocketCameraScanner()">Stop Camera</button></div></section><section class="pc-section p-3 md:p-5 rounded-2xl"><div id="docketScanResults">Scan a docket number to load row details.</div></section></div>`;
  }
  window.AppRenderers = window.AppRenderers || {};
  window.AppRenderers.renderDocketScannerView = renderDocketScannerView;
})();
