// ================= Avvio =================
function boot(){
  applyPrefs();applyStatic();pgsInit();initBack();paintSound();buildBoard();render();showMenu();
  const hm=/^#([A-Za-z]{5})$/.exec(location.hash);if(hm)showOnline(hm[1].toUpperCase());
}
boot();
// Funzionamento offline: solo nella versione pubblicata come app (con manifest), non nell'anteprima.
if('serviceWorker' in navigator&&document.querySelector('link[rel=manifest]')){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}
