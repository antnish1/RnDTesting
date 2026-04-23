(function(){
  const { createClient } = supabase;
  const db = createClient(
    "https://ubkwtjyvbdvepzbxoikq.supabase.co",
    "sb_publishable_L-SrVLzVHoSt9OKGAu1eTQ_UslGY7m3"
  );

  window.Services = window.Services || {};
  window.Services.supabase = { db };
})();
