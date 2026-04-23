(function(){
  function ensureOverlays(){
    if(document.getElementById('loader')) return;
    const root = document.getElementById('overlay-root') || document.body;
    root.insertAdjacentHTML('beforeend', `
<div id="loader" class="hidden fixed inset-0 flex items-center justify-center z-50" style="background: rgba(15,23,32,0.72);">
  <div class="px-6 py-5 rounded-xl flex flex-col items-center gap-4" style="background: var(--pc-surface); border: 1px solid var(--pc-border);">
    <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style="border-color: var(--pc-primary); border-top-color: transparent;"></div>
    <p class="font-semibold" style="color: var(--pc-primary);">Processing...</p>
  </div>
</div>
<div id="popup" class="hidden fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-live="polite" style="background: rgba(15,23,32,0.65); backdrop-filter: blur(6px);">
  <div id="popupCard" class="w-[min(92vw,420px)] p-5 rounded-2xl shadow-2xl text-center space-y-3" style="background: linear-gradient(165deg, rgba(17,24,39,0.98), rgba(15,23,42,0.98)); border: 1px solid rgba(250,204,21,0.25); box-shadow: 0 26px 56px rgba(0,0,0,0.5);">
    <div id="popupIcon" class="mx-auto w-12 h-12 flex items-center justify-center rounded-full text-xl" style="background: rgba(250,204,21,0.18); color: #facc15;">✔️</div>
    <p id="popupTitle" class="text-sm font-extrabold tracking-wide uppercase" style="color:#fcd34d;">Notice</p>
    <p id="popupMsg" class="text-sm font-medium leading-relaxed" style="color: #e2e8f0;"></p>
    <div id="popupActions" class="mt-3 flex justify-center gap-3 flex-wrap"></div>
  </div>
</div>
<div id="uploadProgress" class="hidden fixed bottom-6 right-6 z-50 w-[320px]"><div class="p-4 rounded-xl shadow-2xl" style="background: var(--pc-surface); border:1px solid var(--pc-border);"><div class="flex justify-between text-xs mb-2"><span id="progressText">Uploading...</span><button onclick="cancelUpload()" class="text-red-500 font-bold">✕</button></div><div class="w-full h-2 rounded bg-gray-200 overflow-hidden"><div id="progressBar" class="h-full" style="width:0%; background: linear-gradient(90deg, var(--pc-secondary), var(--pc-primary));"></div></div><div class="text-xs mt-2 space-y-1" style="color: var(--pc-text-muted);"><div>Total: <span id="pTotal">0</span></div><div>Uploaded: <span id="pSuccess">0</span></div><div>Invalid: <span id="pFailed">0</span></div><div>Remaining: <span id="pRemaining">0</span></div></div></div></div>`);
  }

  function showLoader(){ ensureOverlays(); document.getElementById('loader').classList.remove('hidden'); }
  function hideLoader(){ ensureOverlays(); document.getElementById('loader').classList.add('hidden'); }
  function closePopup(){ ensureOverlays(); document.getElementById('popup').classList.add('hidden'); }
  function setUploadProgressVisible(visible){ ensureOverlays(); document.getElementById('uploadProgress').classList.toggle('hidden', !visible); }
  function updateUploadProgress({processed=0,total=0,success=0,failed=0,text='Uploading...'}={}){
    ensureOverlays();
    const percent = total ? Math.floor((processed/total)*100) : 0;
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('pTotal').innerText = total;
    document.getElementById('pSuccess').innerText = success;
    document.getElementById('pFailed').innerText = failed;
    document.getElementById('pRemaining').innerText = Math.max(total-processed,0);
    document.getElementById('progressText').innerText = text;
  }

  function showPopup(msg, type='info', actionsHTML=null){
    ensureOverlays();
    const iconEl = document.getElementById('popupIcon');
    const titleEl = document.getElementById('popupTitle');
    const popupEl = document.getElementById('popup');
    const map = {
      success: ['✓','rgba(16,185,129,0.18)','#34d399','Success'],
      error: ['✕','rgba(239,68,68,0.18)','#fca5a5','Error'],
      warning: ['!','rgba(245,158,11,0.22)','#fcd34d','Warning'],
      info: ['i','rgba(250,204,21,0.2)','#facc15','Info'],
    };
    const [icon,bg,color,title] = map[type] || map.info;
    iconEl.innerHTML = icon; iconEl.style.background = bg; iconEl.style.color = color; titleEl.innerText = title;
    document.getElementById('popupMsg').innerText = msg;
    document.getElementById('popupActions').innerHTML = actionsHTML || `<button onclick="closePopup()" class="popup-btn popup-btn-primary">OK</button>`;
    popupEl.classList.remove('hidden');
  }

  document.addEventListener('keydown', (e)=>{
    const popup = document.getElementById('popup');
    if(e.key === 'Escape' && popup && !popup.classList.contains('hidden')) closePopup();
  });

  window.UIFeedback = { ensureOverlays, showLoader, hideLoader, showPopup, closePopup, setUploadProgressVisible, updateUploadProgress };
})();
