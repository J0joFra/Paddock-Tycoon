// ================= Menu principale e pausa =================
function showMenu(){
  const sv=loadSaved(),can=sv&&sv.players&&!sv.over;
  const ids=SQ.map((q,i)=>i).filter(i=>SQ[i].t==='c'),band=ids.map(i=>`<span>${trackSVG(i,'mini')}<small>${SQ[i].code}</small></span>`).join('');
  const who=can?sv.players.filter(p=>!p.out).map(p=>`<span class="tk" style="--pc:${p.color}"></span>`).join(''):'';
  $('#menu').innerHTML=`<button class="btn sm mmusic" id="musicbtn" data-act="music" aria-pressed="true">🎵 Musica</button><div class="mcard">
    <div class="mhero2">${logoSVG('menu')}<p class="mtag">${T('Compra circuiti, tratta sotto banco, vinci il campionato.','Buy circuits, deal under the table, win the championship.')}</p></div>
    <div class="mbtns">
      ${can?`<button class="btn primary mbig" data-act="resume">▶ ${T('Continua','Continue')} <small>${sv.champ?esc(sv.champ.names[sv.champ.idx])+' · ':''}${T('giro','lap')} ${sv.round} ${who}</small></button>`:''}
      <button class="btn ${can?'dark':'primary mbig'}" data-act="newsingle">🏁 ${T('Partita veloce','Quick game')}</button>
      <button class="btn dark" data-act="newchamp">🏆 ${T('Campionato','Championship')}</button>
      <button class="btn dark" data-act="daily">📅 ${T('Sfida del giorno','Daily challenge')} <small>${(()=>{const r=dailyRec()[todayStr()];return r?T('record ','best ')+fmt(r.best):T('nuova!','new!');})()}</small></button>
      ${lsGet(KEY_ON)?`<button class="btn dark" data-act="resumeon">↩︎ ${T('Riprendi partita online','Resume online game')}</button>`:''}
      <button class="btn dark" data-act="online">🌐 ${T('Online','Online')} <small>${T('amici o casuale','friends or random')}</small></button>
      <div class="mmini">
      <button class="btn" data-act="learn">🎓 ${T('Impara a giocare','How to play')}</button>
      <button class="btn" data-act="rules">📖 ${T('Regolamento','Rules')}</button>
      ${PGS.ready?`<button class="btn" data-act="pgsach">🎖️ ${T('Obiettivi','Achievements')}</button><button class="btn" data-act="pgslb">📊 ${T('Classifiche','Leaderboards')}</button>`:''}
      <button class="btn" data-act="profile">👤 ${T('Profilo','Profile')}</button>
      <button class="btn" data-act="settings">⚙️ ${T('Impostazioni','Settings')}</button>
      </div>
    </div></div>
    <div class="marq" aria-hidden="true"><div class="mrow">${band}${band}</div></div>`;
  $('#menu').hidden=false;
  paintMusic();musicStart();
}
function hideMenu(){$('#menu').hidden=true;}
function showSettings(){
  const tg=(k,on,off)=>`<div class="seg">${[[true,on],[false,off]].map(([v,l])=>`<button class="${!!PREFS[k]===v?'on':''}" data-act="pref" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  openSheet(`<h2>⚙️ ${T('Impostazioni','Settings')}</h2>
    <div class="sets">
      <label class="setrow" for="pmusic"><span>🎵 ${T('Musica','Music')}</span><input type="range" id="pmusic" min="0" max="100" step="5" value="${PREFS.music}"><b id="pmusicv">${PREFS.music}%</b></label>
      <label class="setrow" for="psfx"><span>🔊 ${T('Effetti','Effects')}</span><input type="range" id="psfx" min="0" max="100" step="5" value="${PREFS.sfx}"><b id="psfxv">${PREFS.sfx}%</b></label>
      <div class="setrow"><span>🎶 ${T('Musica in partita','In-game music')}</span>${tg('gameMusic',T('Sì','On'),T('No','Off'))}</div>
      <div class="setrow"><span>🌓 ${T('Tema','Theme')}</span>${tg('night','🌙 '+T('Notte','Night'),'☀️ '+T('Giorno','Day'))}</div>
      <div class="setrow"><span>🔠 ${T('Testo','Text')}</span>${tg('big',T('Grande','Large'),T('Normale','Normal'))}</div>
      <div class="setrow"><span>▦ ${T('Motivi sui gruppi','Group patterns')}</span>${tg('pat',T('Sì','On'),T('No','Off'))}</div>
      <div class="setrow"><span>📳 ${T('Vibrazione','Vibration')}</span>${tg('vib',T('Sì','On'),T('No','Off'))}</div>
      <div class="setrow"><span>🌐 ${T('Lingua','Language')}</span><button class="btn sm" data-act="lang">${T('🇬🇧 English','🇮🇹 Italiano')}</button></div>
    </div>
    <div class="row"><button class="btn dark" data-act="close">${T('Fatto','Done')}</button></div>`);
}
document.addEventListener('input',e=>{
  const id=e.target&&e.target.id;if(id!=='pmusic'&&id!=='psfx')return;
  const v=+e.target.value;if(id==='pmusic')PREFS.music=v;else PREFS.sfx=v;
  const lab=$('#'+id+'v');if(lab)lab.textContent=v+'%';applyPrefs();savePrefs();
});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='psfx')sfx('coin');});
function showPause(){
  if(!S){showMenu();return;}
  if(NET.on){openSheet(`<h2>⏸️ Online · ${esc(NET.code)}</h2><div class="plist">
      <button class="btn primary" data-act="close">▶ ${T('Riprendi','Resume')}</button>
      <button class="btn" data-act="rules">📖 ${T('Regolamento','Rules')}</button>
      <button class="btn out" data-act="oleave">🏳️ ${NET.host?T('Chiudi la partita per tutti','End the game for everyone'):T('Esci dalla partita','Leave the game')}</button></div>`);return;}
  openSheet(`<h2>⏸️ ${T('Pausa','Paused')}</h2>
    <div class="plist">
      <button class="btn primary" data-act="close">▶ ${T('Riprendi','Resume')}</button>
      <button class="btn" data-act="rules">📖 ${T('Regolamento','Rules')}</button>
      <button class="btn" data-act="tutorial">🎓 Tutorial</button>
      <button class="btn" data-act="settings">⚙️ ${T('Impostazioni','Settings')}</button>
      <button class="btn dark" data-act="tomenu">🏠 ${T('Menu principale','Main menu')} <small>${T('la partita resta salvata','your game stays saved')}</small></button>
      <button class="btn out" data-act="abandon">🏳️ ${T('Abbandona partita','Abandon game')}</button>
    </div>`);
}
function confirmAbandon(){
  openSheet(`<h2>🏳️ ${T('Abbandonare la partita?','Abandon the game?')}</h2><p>${S&&S.champ?T('Anche il campionato in corso verrà cancellato.','The current championship will be deleted too.'):T('La partita verrà cancellata.','The game will be deleted.')} ${T('Non potrai riprenderla.',"You won't be able to resume it.")}</p>
    <div class="row"><button class="btn primary" data-act="doabandon">${T('Sì, abbandona','Yes, abandon')}</button><button class="btn out" data-act="pause">${T('Annulla','Cancel')}</button></div>`);
}
function quitToMenu(discard){
  GEN++;busy=false;cpuActive=false;choice=null;trResolve=null;TR=null;
  if(discard){try{localStorage.removeItem(KEY);}catch(e){}}
  else if(S&&!S.over){if(S.phase==='auction'||S.phase==='order')S.phase=S.phase==='order'?'order':'buy';save();}
  else if(S&&S.over){try{localStorage.removeItem(KEY);}catch(e){}}
  if(NET.on)netLeave(discard||!S||S.over);
  S=null;closeSheet();const co=document.querySelector('.coach');if(co)co.remove();
  $('#cars').innerHTML='';for(const k in carRot)delete carRot[k];for(const k in prevCash)delete prevCash[k];
  render();showMenu();
}
function resumeSaved(){
  const saved=loadSaved();if(!saved||!saved.players||saved.over){showMenu();return;}
  hideMenu();musicStop();GEN++;
  S=saved;busy=false;cpuActive=false;setRng(S.daily?S.daily.seed:null,S.rngN||0);S.roys=S.roys||[];S.pacts=S.pacts||[];S.pot=S.pot||0;S.stats=S.stats||{};S.first=S.first||0;S.hist=S.hist||[];
  if(S.champ){setup.mode=S.champ.n===5?'c5':'c3';setup.climit=S.champ.limit;}else setup.mode='single';
  setup.fast=!!S.fast;setup.diff=S.diff||'normal';setup.limit=S.limit||0;setup.autoEnd=S.autoEnd!==false;setup.rules=Object.assign({cash:START_CASH,auction:true,under:true,pot:true},S.rules||{});
  setup.players=S.players.map(p=>({name:p.name,cpu:p.cpu,color:p.color,helmet:p.helmet||0}));
  if(S.phase==='auction') S.phase='buy';
  if(S.phase==='buy'&&S.pending==null) S.phase='end';
  if(S.phase==='order'){S.phase='roll';}
  render();
  setTimeout(musicStart,800);
  if(S.phase==='stopgo'){cur().stopgo=true;startTurn();}
  else if(cur().cpu) cpuTurn();
}

