// ================= Tasto indietro (app Android) =================
let exitAsk=0;
function handleBack(App){
  const co=document.querySelector('.coach');if(co){const sk=co.querySelector('[data-tut=skip]');if(sk)sk.click();return;}
  if(!$('#backdrop').hidden){
    if(sheetDismiss){closeSheet();return;}
    const cancel=$('#sheet [data-act=tr-cancel]');if(cancel&&!isGuest()){cancel.click();return;}
    return;
  }
  if($('#menu').hidden){if(S)showPause();else showMenu();return;}
  if(Date.now()-exitAsk<2500){App.exitApp();return;}
  exitAsk=Date.now();toast(T('Premi di nuovo indietro per uscire','Press back again to exit'));
}
function initBack(){
  const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform()||!C.registerPlugin)return;
  try{
    const App=C.registerPlugin('App');
    App.addListener('backButton',()=>handleBack(App));
    App.addListener('pause',()=>{if(S&&!S.over&&!isGuest())save();});
  }catch(e){console.warn('[back]',e);}
}

